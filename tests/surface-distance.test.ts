import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { createRandom, readPositions, tissueSurfaceDistances } from '../scripts/build-points.ts';
import { type Vec3, extendSurfaceDistance, surfaceDistances } from '../scripts/surface-distance.ts';

const RADIUS = 1.5;

function cloud(points: readonly Vec3[]): Float32Array {
  return Float32Array.from(points.flat());
}

/** Points at x = from..to (step 1), y = z = 0. */
function line(from: number, to: number): Vec3[] {
  return Array.from({ length: to - from + 1 }, (_, i): Vec3 => [from + i, 0, 0]);
}

function point(points: Float32Array, i: number): Vec3 {
  return [points[i * 3], points[i * 3 + 1], points[i * 3 + 2]];
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Index of the point nearest to `target` (brute force). */
function nearest(points: Float32Array, target: Vec3): number {
  let best = 0;
  for (let i = 1; i < points.length / 3; i++) {
    if (distance(point(points, i), target) < distance(point(points, best), target)) {
      best = i;
    }
  }
  return best;
}

describe('surface-distance', () => {
  test('distance runs along a line', () => {
    const d = surfaceDistances(cloud(line(0, 9)), [[0, 0, 0]], RADIUS);
    expect(Array.from(d)).toEqual(line(0, 9).map(([x]) => x));
  });

  test('seed moves to the nearest point', () => {
    const d = surfaceDistances(cloud(line(0, 9)), [[3.2, 0.4, 0]], RADIUS);
    expect(d[3]).toBe(0);
    expect(d[0]).toBe(3);
  });

  test('a gap wider than the radius stops the distance', () => {
    const d = surfaceDistances(cloud([...line(0, 4), ...line(10, 14)]), [[0, 0, 0]], RADIUS);
    expect(Array.from(d.subarray(0, 5))).toEqual([0, 1, 2, 3, 4]);
    expect(Array.from(d.subarray(5))).toEqual([Infinity, Infinity, Infinity, Infinity, Infinity]);
  });

  test('each point takes the nearest seed', () => {
    const d = surfaceDistances(cloud(line(0, 9)), [[0, 0, 0], [9, 0, 0]], RADIUS);
    expect(Array.from(d)).toEqual(line(0, 9).map(([x]) => Math.min(x, 9 - x)));
  });

  test('distance follows the fold', () => {
    const top = line(0, 10).map(([x]): Vec3 => [x, 3, 0]);
    const points = cloud([...line(0, 10), [10, 1, 0], [10, 2, 0], ...top]);
    const d = surfaceDistances(points, [[0, 0, 0]], RADIUS);
    // Around the fold, not across it (3); diagonal edges (sqrt 2 < RADIUS) cut the two corners.
    expect(d[nearest(points, [0, 3, 0])]).toBeCloseTo(19 + 2 * Math.SQRT2, 9);
  });

  test('neighbours differ by at most their spacing', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const random = createRandom(seed);
      const points = Float32Array.from({ length: 500 * 3 }, () => random() * 10);
      const seeds: Vec3[] = [
        [2, 2, 2],
        [8, 8, 8],
      ];
      const d = surfaceDistances(points, seeds, RADIUS);
      const moved = seeds.map((s) => point(points, nearest(points, s)));
      for (let i = 0; i < 500; i++) {
        if (!Number.isFinite(d[i])) {
          continue;
        }
        const straight = Math.min(...moved.map((s) => distance(point(points, i), s)));
        expect(d[i]).toBeGreaterThanOrEqual(straight - 1e-9);
        for (let j = 0; j < 500; j++) {
          const gap = distance(point(points, i), point(points, j));
          if (gap < RADIUS && Number.isFinite(d[j])) {
            expect(Math.abs(d[i] - d[j])).toBeLessThanOrEqual(gap + 1e-9);
          }
        }
      }
    }
  });

  test('extension adds the gap', () => {
    const graph = cloud([
      [0, 0, 0],
      [10, 0, 0],
    ]);
    const points = cloud([
      [1, 0, 0],
      [9, 0, 0],
      [20, 0, 0],
    ]);
    const d = extendSurfaceDistance(points, graph, Float64Array.from([5, Infinity]), 10);
    expect(Array.from(d)).toEqual([6, 14, Infinity]);
  });

  test('real meshes: most points get a surface distance', { timeout: 120_000 }, async () => {
    const root = path.join(import.meta.dirname, '..', 'data');
    const [gm, wm] = await Promise.all([
      readPositions(path.join(root, 'gm.gltf')),
      readPositions(path.join(root, 'wm.gltf')),
    ]);
    const d = tissueSurfaceDistances({ gm, wm });
    const share = (values: Float32Array): number => values.filter(Number.isFinite).length / values.length;
    console.log(`surface distance share: gm ${share(d.gm).toFixed(4)}, wm ${share(d.wm).toFixed(4)}`);
    expect(d.gm.length).toBe(gm.length / 3);
    expect(d.wm.length).toBe(wm.length / 3);
    // Measured 2026-11-23: gm 0.938, wm 0.957.
    expect(share(d.gm)).toBeGreaterThan(0.9);
    expect(share(d.wm)).toBeGreaterThan(0.9);
  });
});
