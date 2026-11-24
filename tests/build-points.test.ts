import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { beforeAll, describe, expect, test } from 'vitest';
import {
  DEFAULT_OPTIONS,
  buildBrain,
  createRandom,
  encodePoints,
  gather,
  jitterPoints,
  mortonOrder,
  quantize,
  readPositions,
  sampleIndices,
  withSurfaceDistance,
} from '../scripts/build-points.ts';

const BITS = 11;
const BBOX_MIN = [-10, -10, -10] as const;
const BBOX_MAX = [10, 10, 10] as const;

/** `n` random points in [-10, 10) per axis. */
function randomCloud(n: number, seed: number): Float32Array {
  const random = createRandom(seed);
  return Float32Array.from({ length: n * 3 }, () => random() * 20 - 10);
}

/** `n` points whose x coordinate is the point index, so x identifies a point. */
function indexedCloud(n: number): Float32Array {
  return Float32Array.from({ length: n * 3 }, (_, i) => (i % 3 === 0 ? i / 3 : 0));
}

function xValues(points: Float32Array): number[] {
  return Array.from({ length: points.length / 3 }, (_, i) => points[i * 3]);
}

function maxAbsDiff(a: Float32Array, b: Float32Array): number {
  return a.reduce((max, value, i) => Math.max(max, Math.abs(value - b[i])), 0);
}

/** Morton code by string interleaving, independent of the bit arithmetic under test. */
function referenceMorton(x: number, y: number, z: number, bits: number): number {
  const [bx, by, bz] = [x, y, z].map((v) => v.toString(2).padStart(bits, '0'));
  const digits = Array.from({ length: bits }, (_, i) => bz[i] + by[i] + bx[i]);
  return parseInt(digits.join(''), 2);
}

function quads(q: Uint16Array): number[][] {
  return Array.from({ length: q.length / 4 }, (_, i) => Array.from(q.subarray(i * 4, i * 4 + 4)));
}

/** Surface distances: Infinity (no ripple) for every point. */
function noDistances(input: Record<'gm' | 'wm', Float32Array>): Record<'gm' | 'wm', Float32Array> {
  return {
    gm: new Float32Array(input.gm.length / 3).fill(Infinity),
    wm: new Float32Array(input.wm.length / 3).fill(Infinity),
  };
}

/** The stride-4 lanes of a brain.bin with `count` points. */
function decodeBin(bin: Uint8Array, count: number): Uint16Array {
  const q = new Uint16Array(count * 4);
  MeshoptDecoder.decodeVertexBuffer(new Uint8Array(q.buffer), count, 8, bin);
  return q;
}

beforeAll(async () => {
  await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
});

describe('build-points', () => {
  test('same seed gives same bytes', () => {
    const input = { gm: randomCloud(100, 11), wm: randomCloud(300, 12) };
    const options = { ...DEFAULT_OPTIONS, count: 200 };
    const first = buildBrain(input, noDistances(input), options);
    const second = buildBrain(input, noDistances(input), options);
    expect(second.bin).toEqual(first.bin);
    expect(second.meta).toEqual(first.meta);
    expect(buildBrain(input, noDistances(input), { ...options, seed: 2 }).bin).not.toEqual(first.bin);
  });

  test('counts follow input share', () => {
    const input = { gm: randomCloud(100, 21), wm: randomCloud(300, 22) };
    const { meta } = buildBrain(input, noDistances(input), { ...DEFAULT_OPTIONS, count: 200 });
    expect(meta.counts.gm + meta.counts.wm).toBe(200);
    expect(Math.abs(meta.counts.gm - 50)).toBeLessThanOrEqual(1);
  });

  test('sample has no duplicate points', () => {
    const sample = sampleIndices(400, 150, createRandom(1));
    expect(sample.length).toBe(150);
    expect(new Set(sample).size).toBe(150);
    expect(Math.max(...sample)).toBeLessThan(400);
  });

  test('gather takes the items at the indices', () => {
    expect(xValues(gather(indexedCloud(5), Uint32Array.from([3, 0]), 3))).toEqual([3, 0]);
  });

  test('count above input keeps all points once', () => {
    const sample = sampleIndices(400, 10_000, createRandom(1));
    expect(sample.length).toBe(400);
    expect(new Set(sample).size).toBe(400);
    const input = { gm: randomCloud(100, 31), wm: randomCloud(300, 32) };
    const { meta } = buildBrain(input, noDistances(input), { ...DEFAULT_OPTIONS, count: 10_000 });
    expect(meta.counts).toEqual({ gm: 100, wm: 300 });
  });

  test('jitter stays within amount', () => {
    const points = randomCloud(400, 4);
    const before = points.slice();
    const out = jitterPoints(points, 0.3, createRandom(1));
    expect(out.length).toBe(points.length);
    // Slack: the output is stored as float32 (half an ulp at |x| <= 10 is below 1e-6).
    expect(maxAbsDiff(out, points)).toBeLessThanOrEqual(0.3 + 1e-6);
    expect(maxAbsDiff(out, points)).toBeGreaterThan(0.2);
    expect(points).toEqual(before);
  });

  test('quantization error <= step / 2', () => {
    const points = randomCloud(500, 5);
    const q = quantize(points, BBOX_MIN, BBOX_MAX, BITS);
    const levels = 2 ** BITS - 1;
    expect(q.length).toBe(500 * 4);
    for (let i = 0; i < 500; i++) {
      for (let axis = 0; axis < 3; axis++) {
        const extent = BBOX_MAX[axis] - BBOX_MIN[axis];
        const restored = BBOX_MIN[axis] + (q[i * 4 + axis] * extent) / levels;
        expect(Math.abs(restored - points[i * 3 + axis])).toBeLessThanOrEqual(extent / levels / 2 + 1e-9);
      }
      expect(q[i * 4 + 3]).toBe(0);
    }
  });

  test('morton order is non-decreasing', () => {
    const q = quantize(randomCloud(500, 6), BBOX_MIN, BBOX_MAX, BITS);
    const ordered = mortonOrder(q, BITS);
    const codes = quads(ordered).map(([x, y, z]) => referenceMorton(x, y, z, BITS));
    codes.slice(1).forEach((code, i) => expect(code).toBeGreaterThanOrEqual(codes[i]));
    const sortedKeys = (v: Uint16Array) => quads(v).map(String).sort();
    expect(sortedKeys(ordered)).toEqual(sortedKeys(q));
  });

  test('encode round trip', () => {
    const q = quantize(randomCloud(500, 7), BBOX_MIN, BBOX_MAX, BITS);
    const decoded = new Uint8Array(q.byteLength);
    MeshoptDecoder.decodeVertexBuffer(decoded, q.length / 4, 8, encodePoints(q));
    expect(decoded).toEqual(new Uint8Array(q.buffer, q.byteOffset, q.byteLength));
  });

  test('surface distance lane', () => {
    const q = new Uint16Array(4 * 4);
    const out = withSurfaceDistance(q, Float32Array.from([0, 50, 100, Infinity]), 100, BITS);
    expect(quads(out).map((lanes) => lanes[3])).toEqual([0, 1023, 2046, 2047]);
    expect(q.every((value) => value === 0)).toBe(true);
  });

  test('max 0 maps finite distances to 0', () => {
    const out = withSurfaceDistance(new Uint16Array(2 * 4), Float32Array.from([0, Infinity]), 0, BITS);
    expect(quads(out).map((lanes) => lanes[3])).toEqual([0, 2047]);
  });

  test('distance stays with its point', () => {
    const input = { gm: indexedCloud(100), wm: indexedCloud(300) };
    const half = (n: number): Float32Array => Float32Array.from({ length: n }, (_, i) => i * 0.5);
    const { meta, bin } = buildBrain(input, { gm: half(100), wm: half(300) }, { ...DEFAULT_OPTIONS, count: 200, jitter: 0 });
    const step = (meta.bboxMax[0] - meta.bboxMin[0]) / (2 ** meta.bits - 1);
    const distanceLevels = 2 ** meta.surfaceDistanceBits - 2;
    for (const [x, , , d] of quads(decodeBin(bin, 200))) {
      const restored = meta.bboxMin[0] + x * step;
      expect(Math.abs((d * meta.surfaceDistanceMax) / distanceLevels - 0.5 * restored)).toBeLessThanOrEqual(
        0.25 * step + meta.surfaceDistanceMax / (2 * distanceLevels) + 1e-9,
      );
    }
  });

  test('positions do not depend on the distances', () => {
    const input = { gm: randomCloud(100, 41), wm: randomCloud(300, 42) };
    const random = createRandom(43);
    const some = (n: number): Float32Array => Float32Array.from({ length: n }, () => random() * 100);
    const options = { ...DEFAULT_OPTIONS, count: 200 };
    const positions = (distances: Record<'gm' | 'wm', Float32Array>): number[][] =>
      quads(decodeBin(buildBrain(input, distances, options).bin, 200)).map((lanes) => lanes.slice(0, 3));
    expect(positions({ gm: some(100), wm: some(300) })).toEqual(positions(noDistances(input)));
  });

  test('meta has surfaceDistanceMax', () => {
    const input = { gm: randomCloud(2, 51), wm: randomCloud(1, 52) };
    const distances = { gm: Float32Array.from([7, Infinity]), wm: Float32Array.from([3]) };
    expect(buildBrain(input, distances, { ...DEFAULT_OPTIONS, count: 10 }).meta.surfaceDistanceMax).toBe(7);
    expect(buildBrain(input, noDistances(input), { ...DEFAULT_OPTIONS, count: 10 }).meta.surfaceDistanceMax).toBe(0);
  });

  test('lane 4 has surfaceDistanceBits bits, positions keep bits', () => {
    const input = { gm: randomCloud(100, 61), wm: randomCloud(300, 62) };
    const distances = { gm: Float32Array.from({ length: 100 }, (_, i) => (i % 2 === 0 ? i : Infinity)), wm: noDistances(input).wm };
    const options = { ...DEFAULT_OPTIONS, count: 200, bits: 11, surfaceDistanceBits: 8 };
    const { meta, bin } = buildBrain(input, distances, options);
    expect(meta.bits).toBe(11);
    expect(meta.surfaceDistanceBits).toBe(8);
    const lanes = quads(decodeBin(bin, 200));
    expect(Math.max(...lanes.map(([x, y, z]) => Math.max(x, y, z)))).toBeGreaterThan(255);
    expect(lanes.every(([, , , d]) => d <= 255)).toBe(true);
    expect(lanes.some(([, , , d]) => d === 255)).toBe(true);
    expect(lanes.some(([, , , d]) => d === 254)).toBe(true);
  });

  test('reads the real meshes', async () => {
    expect((await readPositions('data/gm.gltf')).length / 3).toBe(165328);
    expect((await readPositions('data/wm.gltf')).length / 3).toBe(469950);
  }, 30_000);
});
