import { InterleavedBufferAttribute, Vector3 } from 'three';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  type BrainMeta,
  INTRO_HOLD_SECONDS,
  INTRO_SECONDS,
  createBrainGeometry,
  createBrainMaterial,
  introProgress,
  loadBrain,
} from '../src/brain-cloud.ts';

const META: BrainMeta = {
  bits: 11,
  stride: 8,
  counts: { gm: 2, wm: 3 },
  bboxMin: [0, 0, 0],
  bboxMax: [1, 1, 1],
  surfaceDistanceMax: 254,
  surfaceDistanceBits: 8,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('brain-cloud', () => {
  test('geometry uses the decoded buffer', () => {
    const decoded = new Uint16Array(5 * 4);
    const position = createBrainGeometry(META, decoded).getAttribute('position');
    expect(position).toBeInstanceOf(InterleavedBufferAttribute);
    expect(position.count).toBe(5);
    expect(position.itemSize).toBe(3);
    expect((position as InterleavedBufferAttribute).data.array).toBe(decoded);
  });

  test('geometry exposes the surface distance', () => {
    const decoded = new Uint16Array(5 * 4);
    const attribute = createBrainGeometry(META, decoded).getAttribute('surfaceDistance') as InterleavedBufferAttribute;
    expect(attribute).toBeInstanceOf(InterleavedBufferAttribute);
    expect(attribute.itemSize).toBe(1);
    expect(attribute.offset).toBe(3);
    expect(attribute.normalized).toBe(false);
    expect(attribute.data.array).toBe(decoded);
  });

  test('geometry rejects a buffer of the wrong length', () => {
    expect(() => createBrainGeometry(META, new Uint16Array(4 * 4))).toThrow('length');
  });

  test('loadBrain rejects on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 })),
    );
    await expect(loadBrain('/')).rejects.toThrow('404');
  });

  test('loadBrain rejects meta without surfaceDistanceMax', async () => {
    const old = Object.fromEntries(Object.entries(META).filter(([key]) => key !== 'surfaceDistanceMax'));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => old, arrayBuffer: async () => new ArrayBuffer(0) })),
    );
    await expect(loadBrain('/')).rejects.toThrow('surfaceDistanceMax');
  });

  test('loadBrain rejects meta without surfaceDistanceBits', async () => {
    const old = Object.fromEntries(Object.entries(META).filter(([key]) => key !== 'surfaceDistanceBits'));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => old, arrayBuffer: async () => new ArrayBuffer(0) })),
    );
    await expect(loadBrain('/')).rejects.toThrow('surfaceDistanceBits');
  });

  test('intro progress runs from 0 to 1', () => {
    expect(introProgress(0)).toBe(0);
    expect(introProgress(INTRO_SECONDS)).toBe(1);
    expect(introProgress(-1)).toBe(0);
    expect(introProgress(99)).toBe(1);
  });

  test('intro progress is linear', () => {
    expect(introProgress(INTRO_SECONDS / 2)).toBeCloseTo(0.5, 12);
    expect(introProgress(INTRO_SECONDS / 4)).toBeCloseTo(0.25, 12);
  });

  test('material gets the intro ball and the hold share', () => {
    const ballCentre = new Vector3(1, 2, 3);
    const { uniforms } = createBrainMaterial(META, 2, ballCentre);
    expect(uniforms.uBallCentre.value).toEqual(ballCentre);
    expect(uniforms.uIntroHold.value).toBeCloseTo(INTRO_HOLD_SECONDS / INTRO_SECONDS, 12);
    // points.vert needs 0 < share and share + INTRO_MAX_DELAY (0.1) < 1.
    const share = INTRO_HOLD_SECONDS / INTRO_SECONDS;
    expect(share).toBeGreaterThan(0);
    expect(share + 0.1).toBeLessThan(1);
  });

  test('material gets the surface distance scale', () => {
    const { uniforms } = createBrainMaterial(META, 2, new Vector3());
    expect(uniforms.uSurfaceStep.value).toBe(1);
    expect(uniforms.uSurfaceNone.value).toBe(255);
    expect(uniforms.uRipples.value).toBe(0);
    expect(uniforms.uWaves).toBeUndefined();
  });

  test('intro progress is monotone', () => {
    const samples = Array.from({ length: 50 }, (_, i) => introProgress((i / 49) * INTRO_SECONDS * 1.2));
    samples.slice(1).forEach((value, i) => expect(value).toBeGreaterThanOrEqual(samples[i]));
    expect(samples[24]).toBeGreaterThan(0);
    expect(samples[24]).toBeLessThan(1);
  });
});
