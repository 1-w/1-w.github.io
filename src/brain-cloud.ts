/**
 * Format of the brain point file (`public/brain.bin` + `public/brain.json`), and its
 * load into a three geometry and point material.
 * The bin is one meshopt vertex buffer: all gm points, then all wm points.
 * Each point is four u16 lanes (x, y, z, d). x, y, z are quantized to `bits` bits in the
 * bbox; the vertex shader dequantizes: world = bboxMin + position * step. d is the surface
 * distance (mm), quantized to `surfaceDistanceBits` bits over [0, surfaceDistanceMax];
 * 2^surfaceDistanceBits - 1 means no ripple. The geometry exposes d as the attribute
 * `surfaceDistance`.
 */

import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  GLSL3,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  MathUtils,
  ShaderMaterial,
  Vector3,
} from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import fragmentShader from './shaders/points.frag?raw';
import vertexShader from './shaders/points.vert?raw';

export type Tissue = 'gm' | 'wm';

export interface BrainMeta {
  readonly bits: number;
  readonly stride: 8;
  readonly counts: Readonly<Record<Tissue, number>>;
  readonly bboxMin: readonly [number, number, number];
  readonly bboxMax: readonly [number, number, number];
  readonly surfaceDistanceMax: number;
  readonly surfaceDistanceBits: number;
}

const LANES = 4;
const COLOR_GM = '#43DFE0';
const COLOR_WM = '#397BFF';
const COLOR_RIPPLE = '#FFBA6C';
const POINT_SIZE = 1.0;

/** Duration of the intro: the points spin in the intro ball, then each moves to its place. */
export const INTRO_SECONDS = 12;
/** Intro hold: the start of the intro, in which the intro ball spins and the camera stands still. */
export const INTRO_HOLD_SECONDS = 0.5;

/** Intro progress at `elapsed` seconds: linear from 0 (at 0 and before) to 1 (at INTRO_SECONDS and after). */
export function introProgress(elapsed: number): number {
  return MathUtils.clamp(elapsed / INTRO_SECONDS, 0, 1);
}

/** A geometry on `decoded` without a copy. Throws if the length does not match the counts. */
export function createBrainGeometry(meta: BrainMeta, decoded: Uint16Array): BufferGeometry {
  const count = meta.counts.gm + meta.counts.wm;
  if (decoded.length !== count * LANES) {
    throw new Error(`brain buffer length ${decoded.length}, expected ${count * LANES}`);
  }
  const buffer = new InterleavedBuffer(decoded, LANES);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new InterleavedBufferAttribute(buffer, 3, 0, false));
  geometry.setAttribute('surfaceDistance', new InterleavedBufferAttribute(buffer, 1, 3, false));
  return geometry;
}

async function fetchChecked(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`);
  }
  return response;
}

/** Fetches and decodes `brain.json` + `brain.bin` under `baseUrl` (ends with `/`). */
export async function loadBrain(baseUrl: string): Promise<{ meta: BrainMeta; geometry: BufferGeometry }> {
  const [metaResponse, binResponse] = await Promise.all([
    fetchChecked(`${baseUrl}brain.json`),
    fetchChecked(`${baseUrl}brain.bin`),
  ]);
  const meta = (await metaResponse.json()) as BrainMeta;
  if (!Number.isFinite(meta.surfaceDistanceMax)) {
    throw new Error('brain.json: surfaceDistanceMax is missing');
  }
  if (!Number.isInteger(meta.surfaceDistanceBits)) {
    throw new Error('brain.json: surfaceDistanceBits is missing');
  }
  const bin = new Uint8Array(await binResponse.arrayBuffer());
  await MeshoptDecoder.ready;
  const count = meta.counts.gm + meta.counts.wm;
  const decoded = new Uint16Array(count * LANES);
  MeshoptDecoder.decodeVertexBuffer(new Uint8Array(decoded.buffer), count, meta.stride, bin);
  return { meta, geometry: createBrainGeometry(meta, decoded) };
}

/** Point material; the intro ball spins around `ballCentre`. */
export function createBrainMaterial(meta: BrainMeta, pixelRatio: number, ballCentre: Vector3): ShaderMaterial {
  const bboxMin = new Vector3(...meta.bboxMin);
  const levels = 2 ** meta.bits - 1;
  const step = new Vector3(...meta.bboxMax).sub(bboxMin).divideScalar(levels);
  const surfaceNone = 2 ** meta.surfaceDistanceBits - 1;
  return new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader,
    fragmentShader,
    uniforms: {
      uBboxMin: { value: bboxMin },
      uStep: { value: step },
      uGmCount: { value: meta.counts.gm },
      uColorGm: { value: new Color(COLOR_GM) },
      uColorWm: { value: new Color(COLOR_WM) },
      uColorRipple: { value: new Color(COLOR_RIPPLE) },
      uPointSize: { value: POINT_SIZE },
      uPixelRatio: { value: pixelRatio },
      uIntro: { value: 1 },
      uIntroHold: { value: INTRO_HOLD_SECONDS / INTRO_SECONDS },
      uBallCentre: { value: ballCentre.clone() },
      uTime: { value: 0 },
      uRipples: { value: 0 },
      uSurfaceStep: { value: meta.surfaceDistanceMax / (surfaceNone - 1) },
      uSurfaceNone: { value: surfaceNone },
    },
    blending: AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
}
