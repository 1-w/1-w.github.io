/**
 * Closed camera flight through the brain bbox, and the camera pose at a given time.
 * Axes follow the brain data: x = left-right, y = front-back, z = up-down.
 * Parallax shifts the camera sideways and up, without turning it.
 */

import { Box3, CatmullRomCurve3, MathUtils, Vector3 } from 'three';

export interface CameraPose {
  readonly position: Vector3;
  readonly target: Vector3;
}

/** Pointer offset, each axis in [-1, 1]. */
export interface Parallax {
  readonly x: number;
  readonly y: number;
}

export const LOOP_SECONDS = 162;
/** Distance from position to target, as a fraction of the loop. */
export const LOOK_AHEAD = 0.015;
export const PARALLAX_UNITS = 2;

const PARALLAX_RATE = 3;
/** Time constant (s) with which the camera speeds up after the intro hold. */
const RAMP_SECONDS = 4;
const WORLD_UP: Readonly<Vector3> = new Vector3(0, 0, 1);

/** Control points as fractions of the bbox: an oval through the white matter of both hemispheres. */
const PATH_FRACTIONS: readonly (readonly [number, number, number])[] = [
  [0.3, 0.3, 0.62],
  [0.3, 0.55, 0.66],
  [0.31, 0.78, 0.62],
  [0.5, 0.86, 0.6],
  [0.69, 0.78, 0.6],
  [0.7, 0.55, 0.64],
  [0.69, 0.32, 0.6],
  [0.5, 0.22, 0.6],
];

export function createCameraPath(box: Box3): CatmullRomCurve3 {
  const size = box.getSize(new Vector3());
  const points = PATH_FRACTIONS.map(([x, y, z]) => new Vector3(x, y, z).multiply(size).add(box.min));
  return new CatmullRomCurve3(points, true, 'centripetal');
}

function fract(value: number): number {
  return value - Math.floor(value);
}

/** Position at u = elapsed / LOOP_SECONDS (mod 1), target LOOK_AHEAD further, both shifted by the parallax. */
export function cameraPose(path: CatmullRomCurve3, elapsed: number, parallax: Parallax): CameraPose {
  const u = fract(elapsed / LOOP_SECONDS);
  const position = path.getPointAt(u);
  const target = path.getPointAt(fract(u + LOOK_AHEAD));
  const forward = new Vector3().subVectors(target, position).normalize();
  const right = new Vector3().crossVectors(forward, WORLD_UP).normalize();
  const up = new Vector3().crossVectors(right, forward);
  const offset = right.multiplyScalar(PARALLAX_UNITS * parallax.x).addScaledVector(up, PARALLAX_UNITS * parallax.y);
  return { position: position.add(offset), target: target.add(offset) };
}

/**
 * Time along the path at `elapsed` clock seconds: 0 until `hold`, then the speed rises
 * as 1 - exp(-t / RAMP_SECONDS) with t = elapsed - hold, toward clock speed.
 */
export function pathTime(elapsed: number, hold: number): number {
  const t = Math.max(0, elapsed - hold);
  return t - RAMP_SECONDS * (1 - Math.exp(-t / RAMP_SECONDS));
}

/** The point `distance` units ahead of `pose`, along its view direction. */
export function pointAhead(pose: CameraPose, distance: number): Vector3 {
  const forward = new Vector3().subVectors(pose.target, pose.position).normalize();
  return pose.position.clone().addScaledVector(forward, distance);
}

/** Moves `current` toward `target` by exponential approach over `dt` seconds; result clamped to [-1, 1]. */
export function smoothParallax(current: Parallax, target: Parallax, dt: number): Parallax {
  const blend = 1 - Math.exp(-PARALLAX_RATE * dt);
  return {
    x: MathUtils.clamp(current.x + (target.x - current.x) * blend, -1, 1),
    y: MathUtils.clamp(current.y + (target.y - current.y) * blend, -1, 1),
  };
}
