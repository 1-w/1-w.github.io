import { Box3, Vector3 } from 'three';
import { describe, expect, test } from 'vitest';
import {
  LOOK_AHEAD,
  LOOP_SECONDS,
  PARALLAX_UNITS,
  cameraPose,
  createCameraPath,
  pathTime,
  pointAhead,
  smoothParallax,
} from '../src/camera-path.ts';

// About the bbox of public/brain.json.
const BOX = new Box3(new Vector3(18.7, 34.8, 20.1), new Vector3(184.3, 266.2, 196.2));
const ZERO = { x: 0, y: 0 };
const SAMPLE_TIMES = [0, 17, 41, 66];

describe('camera-path', () => {
  test('loop is closed', () => {
    const path = createCameraPath(BOX);
    const start = cameraPose(path, 0, ZERO).position;
    expect(cameraPose(path, LOOP_SECONDS, ZERO).position.distanceTo(start)).toBeLessThanOrEqual(1e-6);
    expect(cameraPose(path, LOOP_SECONDS - 1e-6, ZERO).position.distanceTo(start)).toBeLessThanOrEqual(1e-3);
  });

  test('target is ahead', () => {
    const path = createCameraPath(BOX);
    const pose = cameraPose(path, 0.3 * LOOP_SECONDS, ZERO);
    expect(pose.position.distanceTo(path.getPointAt(0.3))).toBeLessThan(1e-9);
    expect(pose.target.distanceTo(path.getPointAt(0.3 + LOOK_AHEAD))).toBeLessThan(1e-9);
  });

  test('path stays inside the box', () => {
    const path = createCameraPath(BOX);
    for (let i = 0; i < 200; i++) {
      expect(BOX.containsPoint(path.getPointAt(i / 200))).toBe(true);
    }
  });

  test('parallax offset is bounded', () => {
    const path = createCameraPath(BOX);
    for (const elapsed of SAMPLE_TIMES) {
      const base = cameraPose(path, elapsed, ZERO);
      const shifted = cameraPose(path, elapsed, { x: 1, y: 1 });
      const offset = shifted.position.clone().sub(base.position);
      expect(offset.length()).toBeLessThanOrEqual(PARALLAX_UNITS * Math.SQRT2 + 1e-6);
      expect(offset.length()).toBeGreaterThan(PARALLAX_UNITS);
      expect(shifted.target.clone().sub(base.target).distanceTo(offset)).toBeLessThan(1e-9);
    }
  });

  test('world up is z', () => {
    const path = createCameraPath(BOX);
    for (const elapsed of SAMPLE_TIMES) {
      const base = cameraPose(path, elapsed, ZERO).position;
      const sideways = cameraPose(path, elapsed, { x: 1, y: 0 }).position.sub(base);
      const upward = cameraPose(path, elapsed, { x: 0, y: 1 }).position.sub(base);
      expect(Math.abs(sideways.z)).toBeLessThan(1e-9);
      expect(upward.z).toBeGreaterThan(0);
    }
  });

  test('path time stays 0 during the hold', () => {
    expect(pathTime(-1, 2)).toBe(0);
    expect(pathTime(0, 2)).toBe(0);
    expect(pathTime(2, 2)).toBe(0);
  });

  test('path time starts smoothly and reaches clock speed', () => {
    const speed = (elapsed: number): number => (pathTime(elapsed + 1e-3, 2) - pathTime(elapsed, 2)) / 1e-3;
    expect(speed(2)).toBeLessThan(0.01);
    expect(Math.abs(speed(100) - 1)).toBeLessThan(1e-3);
    const samples = Array.from({ length: 50 }, (_, i) => pathTime(i * 0.5, 2));
    samples.slice(1).forEach((value, i) => {
      expect(value).toBeGreaterThanOrEqual(samples[i]);
      expect(value - samples[i]).toBeLessThanOrEqual(0.5);
    });
  });

  test('point ahead lies on the view direction', () => {
    const pose = cameraPose(createCameraPath(BOX), 0, ZERO);
    const before = { position: pose.position.clone(), target: pose.target.clone() };
    const ahead = pointAhead(pose, 80);
    expect(ahead.distanceTo(pose.position)).toBeCloseTo(80, 9);
    const forward = pose.target.clone().sub(pose.position).normalize();
    expect(ahead.clone().sub(pose.position).normalize().dot(forward)).toBeCloseTo(1, 9);
    expect(pose.position.equals(before.position) && pose.target.equals(before.target)).toBe(true);
  });

  test('smoothParallax', () => {
    const current = { x: 0.2, y: -0.4 };
    const target = { x: -0.5, y: 0.9 };
    expect(smoothParallax(current, target, 0)).toEqual(current);
    const settled = smoothParallax(current, target, 10);
    expect(Math.abs(settled.x - target.x)).toBeLessThan(1e-3);
    expect(Math.abs(settled.y - target.y)).toBeLessThan(1e-3);
    expect(smoothParallax(ZERO, { x: 2, y: -2 }, 10)).toEqual({ x: 1, y: -1 });
  });
});
