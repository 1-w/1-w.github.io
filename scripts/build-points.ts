/**
 * Builds the brain point file from the two Draco meshes in `data/`.
 * Model: surface distance of every mesh vertex (`tissueSurfaceDistances`) -> seeded
 * sample of `count` points, split by tissue share -> uniform jitter -> quantization in
 * the bbox of the jittered union, surface distance in lane 4 -> Morton order per tissue
 * -> one meshopt vertex buffer (gm, then wm). Format: `src/brain-cloud.ts`.
 * Run: `npm run points -- [--count N] [--jitter J] [--seed S]`.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { gzipSync } from 'node:zlib';
import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { MeshoptEncoder } from 'meshoptimizer';
import type { BrainMeta, Tissue } from '../src/brain-cloud.ts';
import {
  GRAPH_RADIUS,
  MAX_GAP,
  RIPPLE_SEEDS,
  type Vec3,
  extendSurfaceDistance,
  surfaceDistances,
} from './surface-distance.ts';

export interface BuildOptions {
  count: number;
  jitter: number;
  seed: number;
  bits: number;
  surfaceDistanceBits: number;
}

export const DEFAULT_OPTIONS: Readonly<BuildOptions> = {
  count: 400_000,
  jitter: 0.3,
  seed: 1,
  bits: 11,
  surfaceDistanceBits: 8,
};

const STRIDE = 8;

/** POSITION of the first primitive of the first mesh, as stored (the node transform is not applied). */
export async function readPositions(file: string): Promise<Float32Array> {
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const document = await io.read(file);
  const primitive = document.getRoot().listMeshes()[0]?.listPrimitives()[0];
  const positions = primitive?.getAttribute('POSITION')?.getArray();
  if (!(positions instanceof Float32Array)) {
    throw new Error(`${file}: the first primitive has no float32 POSITION`);
  }
  return positions;
}

interface RandomState {
  value: number;
}

/** Seeded mulberry32 generator. Each call returns the next value in [0, 1). */
export function createRandom(seed: number): () => number {
  const state: RandomState = { value: seed >>> 0 };
  return () => nextRandom(state);
}

function nextRandom(state: RandomState): number {
  state.value = (state.value + 0x6d2b79f5) >>> 0;
  let t = Math.imul(state.value ^ (state.value >>> 15), state.value | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** `count` distinct indices in [0, available) by partial Fisher-Yates. If `count` >= `available`, all indices in order. */
export function sampleIndices(available: number, count: number, random: () => number): Uint32Array {
  const order = Uint32Array.from({ length: available }, (_, i) => i);
  if (count >= available) {
    return order;
  }
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (available - i));
    const pick = order[j];
    order[j] = order[i];
    order[i] = pick;
  }
  return order.slice(0, count);
}

/** The `size`-wide items of `values` at `indices`, in that order. */
export function gather(values: Float32Array, indices: Uint32Array, size: number): Float32Array {
  const out = new Float32Array(indices.length * size);
  for (let i = 0; i < indices.length; i++) {
    out.set(values.subarray(indices[i] * size, indices[i] * size + size), i * size);
  }
  return out;
}

/** Adds a uniform offset in [-amount, amount] to each coordinate. */
export function jitterPoints(points: Float32Array, amount: number, random: () => number): Float32Array {
  return points.map((value) => value + (random() * 2 - 1) * amount);
}

/** Stride-4 lanes (x, y, z, 0), each rounded to [0, 2^bits - 1] across the bbox. */
export function quantize(points: Float32Array, bboxMin: Vec3, bboxMax: Vec3, bits: number): Uint16Array {
  const levels = 2 ** bits - 1;
  const count = points.length / 3;
  const out = new Uint16Array(count * 4);
  for (let i = 0; i < count; i++) {
    for (let axis = 0; axis < 3; axis++) {
      const fraction = (points[i * 3 + axis] - bboxMin[axis]) / (bboxMax[axis] - bboxMin[axis]);
      out[i * 4 + axis] = Math.min(Math.max(Math.round(fraction * levels), 0), levels);
    }
  }
  return out;
}

/**
 * A copy of `q` with lane 4 = surface distance: round(d / max * (2^bits - 2)), Infinity -> 2^bits - 1
 * (no ripple). With max 0, every finite distance gives 0.
 */
export function withSurfaceDistance(q: Uint16Array, distances: Float32Array, max: number, bits: number): Uint16Array {
  const none = 2 ** bits - 1;
  const out = q.slice();
  for (let i = 0; i < distances.length; i++) {
    const d = distances[i];
    if (!Number.isFinite(d)) {
      out[i * 4 + 3] = none;
    } else {
      out[i * 4 + 3] = max > 0 ? Math.round((d / max) * (none - 1)) : 0;
    }
  }
  return out;
}

/** The largest finite value in `arrays`; 0 if there is none. */
function maxFinite(arrays: readonly Float32Array[]): number {
  let max = 0;
  for (const values of arrays) {
    for (const value of values) {
      max = Number.isFinite(value) ? Math.max(max, value) : max;
    }
  }
  return max;
}

/** Interleaves the bits of x, y and z (x lowest). Number arithmetic: 3 * bits can exceed 32. */
function mortonCode(x: number, y: number, z: number, bits: number): number {
  let code = 0;
  for (let bit = bits - 1; bit >= 0; bit--) {
    code = code * 8 + ((z >> bit) & 1) * 4 + ((y >> bit) & 1) * 2 + ((x >> bit) & 1);
  }
  return code;
}

/** A copy of the stride-4 points, sorted by Morton code. */
export function mortonOrder(q: Uint16Array, bits: number): Uint16Array {
  const count = q.length / 4;
  const codes = Float64Array.from({ length: count }, (_, i) => mortonCode(q[i * 4], q[i * 4 + 1], q[i * 4 + 2], bits));
  const order = Uint32Array.from({ length: count }, (_, i) => i).sort((a, b) => codes[a] - codes[b]);
  const out = new Uint16Array(q.length);
  order.forEach((index, i) => out.set(q.subarray(index * 4, index * 4 + 4), i * 4));
  return out;
}

/** One meshopt vertex buffer with 8-byte vertices. Requires `MeshoptEncoder.ready` to have resolved. */
export function encodePoints(q: Uint16Array): Uint8Array {
  const bytes = new Uint8Array(q.buffer, q.byteOffset, q.byteLength);
  return MeshoptEncoder.encodeVertexBuffer(bytes, q.length / 4, STRIDE);
}

/** Splits `count` by each tissue's share of the input points. */
function splitCount(input: Record<Tissue, Float32Array>, count: number): Record<Tissue, number> {
  const gm = input.gm.length / 3;
  const gmCount = Math.round((count * gm) / (gm + input.wm.length / 3));
  return { gm: gmCount, wm: count - gmCount };
}

function boundingBox(clouds: readonly Float32Array[]): [Vec3, Vec3] {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const cloud of clouds) {
    for (let i = 0; i < cloud.length; i++) {
      min[i % 3] = Math.min(min[i % 3], cloud[i]);
      max[i % 3] = Math.max(max[i % 3], cloud[i]);
    }
  }
  return [min, max];
}

/**
 * Surface distance of every input point: graph over the wm points from the ripple seeds
 * (RIPPLE_SEEDS in the wm bbox), then extended to all gm and wm points (see surface-distance.ts).
 */
export function tissueSurfaceDistances(input: Record<Tissue, Float32Array>): Record<Tissue, Float32Array> {
  const [min, max] = boundingBox([input.wm]);
  const seeds = RIPPLE_SEEDS.map(([x, y, z]): Vec3 => [
    min[0] + x * (max[0] - min[0]),
    min[1] + y * (max[1] - min[1]),
    min[2] + z * (max[2] - min[2]),
  ]);
  const wmGraph = surfaceDistances(input.wm, seeds, GRAPH_RADIUS);
  return {
    gm: new Float32Array(extendSurfaceDistance(input.gm, input.wm, wmGraph, MAX_GAP)),
    wm: new Float32Array(extendSurfaceDistance(input.wm, input.wm, wmGraph, MAX_GAP)),
  };
}

/** The whole pipeline (see the module docstring). Requires `MeshoptEncoder.ready` to have resolved. */
export function buildBrain(
  input: Record<Tissue, Float32Array>,
  distances: Record<Tissue, Float32Array>,
  options: BuildOptions,
): { meta: BrainMeta; bin: Uint8Array } {
  const random = createRandom(options.seed);
  const counts = splitCount(input, options.count);
  const gmPicks = sampleIndices(input.gm.length / 3, counts.gm, random);
  const gm = jitterPoints(gather(input.gm, gmPicks, 3), options.jitter, random);
  const wmPicks = sampleIndices(input.wm.length / 3, counts.wm, random);
  const wm = jitterPoints(gather(input.wm, wmPicks, 3), options.jitter, random);
  const gmDistances = gather(distances.gm, gmPicks, 1);
  const wmDistances = gather(distances.wm, wmPicks, 1);
  const surfaceDistanceMax = maxFinite([gmDistances, wmDistances]);
  const [bboxMin, bboxMax] = boundingBox([gm, wm]);
  const { bits, surfaceDistanceBits } = options;
  const gmQ = quantize(gm, bboxMin, bboxMax, bits);
  const wmQ = quantize(wm, bboxMin, bboxMax, bits);
  const gmLanes = withSurfaceDistance(gmQ, gmDistances, surfaceDistanceMax, surfaceDistanceBits);
  const wmLanes = withSurfaceDistance(wmQ, wmDistances, surfaceDistanceMax, surfaceDistanceBits);
  const gmOrdered = mortonOrder(gmLanes, bits);
  const wmOrdered = mortonOrder(wmLanes, bits);
  const q = new Uint16Array(gmOrdered.length + wmOrdered.length);
  q.set(gmOrdered);
  q.set(wmOrdered, gmOrdered.length);
  const meta: BrainMeta = {
    bits: options.bits,
    stride: STRIDE,
    counts: { gm: gm.length / 3, wm: wm.length / 3 },
    bboxMin,
    bboxMax,
    surfaceDistanceMax,
    surfaceDistanceBits,
  };
  return { meta, bin: encodePoints(q) };
}

function parseOption(value: string | undefined, fallback: number, isValid: (n: number) => boolean, name: string): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!isValid(parsed)) {
    throw new Error(`--${name}: invalid value "${value}"`);
  }
  return parsed;
}

function parseOptions(args: string[]): BuildOptions {
  const { values } = parseArgs({
    args,
    options: { count: { type: 'string' }, jitter: { type: 'string' }, seed: { type: 'string' } },
  });
  return {
    count: parseOption(values.count, DEFAULT_OPTIONS.count, (n) => Number.isInteger(n) && n > 0, 'count'),
    jitter: parseOption(values.jitter, DEFAULT_OPTIONS.jitter, (n) => Number.isFinite(n) && n >= 0, 'jitter'),
    seed: parseOption(values.seed, DEFAULT_OPTIONS.seed, Number.isInteger, 'seed'),
    bits: DEFAULT_OPTIONS.bits,
    surfaceDistanceBits: DEFAULT_OPTIONS.surfaceDistanceBits,
  };
}

/** Share of the points without a surface distance, in percent. */
function noRipple(distances: Float32Array): string {
  let none = 0;
  for (const d of distances) {
    none += Number.isFinite(d) ? 0 : 1;
  }
  return `${((100 * none) / distances.length).toFixed(1)} %`;
}

function kB(bytes: number): string {
  return `${Math.round(bytes / 1000)} kB`;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const root = path.join(import.meta.dirname, '..');
  const [gm, wm] = await Promise.all([
    readPositions(path.join(root, 'data', 'gm.gltf')),
    readPositions(path.join(root, 'data', 'wm.gltf')),
  ]);
  const distances = tissueSurfaceDistances({ gm, wm });
  await MeshoptEncoder.ready;
  const { meta, bin } = buildBrain({ gm, wm }, distances, options);
  await mkdir(path.join(root, 'public'), { recursive: true });
  await writeFile(path.join(root, 'public', 'brain.bin'), bin);
  await writeFile(path.join(root, 'public', 'brain.json'), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`gm ${meta.counts.gm}, wm ${meta.counts.wm}`);
  console.log(`surface distance: max ${meta.surfaceDistanceMax.toFixed(1)} mm`);
  console.log(`no ripple: gm ${noRipple(distances.gm)}, wm ${noRipple(distances.wm)} of the vertices`);
  console.log(`brain.bin: ${kB(bin.byteLength)} raw, ${kB(gzipSync(bin).byteLength)} gzip`);
}

if (import.meta.main) {
  await main();
}
