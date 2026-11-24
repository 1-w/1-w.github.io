/**
 * Page entry: checks WebGL2, loads the brain and flies the camera along the path.
 * `html[data-state]` is 'loading', then 'ready' after the first rendered frame,
 * or 'fallback' (the name on a gradient) after any error.
 * Motion runs unless the pause button is pressed or the user prefers reduced motion;
 * without motion the render loop stops and the last frame stays.
 */

import {
  Box3,
  type BufferGeometry,
  type CatmullRomCurve3,
  PerspectiveCamera,
  Points,
  Scene,
  type ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { INTRO_HOLD_SECONDS, createBrainMaterial, introProgress, loadBrain } from './brain-cloud.ts';
import { cameraPose, createCameraPath, type Parallax, pathTime, pointAhead, smoothParallax } from './camera-path.ts';
import { type ClockState, setPaused, startClock, tick } from './clock.ts';

export type SiteState = 'loading' | 'ready' | 'fallback';

interface Site {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly points: Points<BufferGeometry, ShaderMaterial>;
  readonly path: CatmullRomCurve3;
  readonly listeners: AbortController;
  readonly pauseButton: HTMLButtonElement;
  readonly reducedMotion: MediaQueryList;
  /** True if the page started under reduced motion: motion that starts later has no intro. */
  readonly skipIntro: boolean;
  clock: ClockState;
  userPaused: boolean;
  /** Parallax in use; it follows `pointerParallax` with the clock, so a pause freezes it. */
  parallax: Parallax;
  /** Parallax the pointer position asks for. */
  pointerParallax: Parallax;
}

const BACKGROUND = '#05070D';
const MAX_PIXEL_RATIO = 2;
const FOV = 70;
const NEAR = 1;
const FAR = 600;
const NO_PARALLAX: Parallax = { x: 0, y: 0 };
/** Distance of the intro ball ahead of the first camera pose, so it sits behind the name. */
const BALL_DISTANCE = 80;

function setState(state: SiteState): void {
  document.documentElement.dataset.state = state;
}

function hasWebGL2(): boolean {
  const gl = document.createElement('canvas').getContext('webgl2');
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  return gl !== null;
}

async function start(): Promise<Site> {
  const canvas = document.querySelector<HTMLCanvasElement>('#brain');
  const pauseButton = document.querySelector<HTMLButtonElement>('#pause');
  if (pauseButton === null) {
    throw new Error('#pause is missing');
  }
  if (canvas === null || !hasWebGL2()) {
    throw new Error('WebGL2 is not available');
  }
  const { meta, geometry } = await loadBrain(import.meta.env.BASE_URL);
  const renderer = new WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setClearColor(BACKGROUND);
  const path = createCameraPath(new Box3(new Vector3(...meta.bboxMin), new Vector3(...meta.bboxMax)));
  const ballCentre = pointAhead(cameraPose(path, 0, NO_PARALLAX), BALL_DISTANCE);
  const points = new Points(geometry, createBrainMaterial(meta, renderer.getPixelRatio(), ballCentre));
  points.frustumCulled = false;
  const scene = new Scene();
  scene.add(points);
  const camera = new PerspectiveCamera(FOV, 1, NEAR, FAR);
  camera.up.set(0, 0, 1);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  return {
    renderer,
    scene,
    camera,
    points,
    path,
    listeners: new AbortController(),
    pauseButton,
    reducedMotion,
    skipIntro: reducedMotion.matches,
    clock: startClock(),
    userPaused: false,
    parallax: NO_PARALLAX,
    pointerParallax: NO_PARALLAX,
  };
}

/** Intro and ripples follow the clock, so a pause freezes them; reduced motion shows the end state without ripples. */
function updateUniforms(site: Site): void {
  const { uniforms } = site.points.material;
  const reduced = site.reducedMotion.matches;
  uniforms.uIntro.value = reduced || site.skipIntro ? 1 : introProgress(site.clock.elapsed);
  uniforms.uTime.value = site.clock.elapsed;
  uniforms.uRipples.value = reduced ? 0 : 1;
}

function render(site: Site): void {
  const parallax = site.reducedMotion.matches ? NO_PARALLAX : site.parallax;
  const pose = cameraPose(site.path, pathTime(site.clock.elapsed, INTRO_HOLD_SECONDS), parallax);
  site.camera.position.copy(pose.position);
  site.camera.lookAt(pose.target);
  updateUniforms(site);
  site.renderer.render(site.scene, site.camera);
}

function frame(site: Site, nowMs: number): void {
  const before = site.clock.elapsed;
  site.clock = tick(site.clock, nowMs);
  site.parallax = smoothParallax(site.parallax, site.pointerParallax, site.clock.elapsed - before);
  render(site);
}

/** Maps the pointer position to a parallax in [-1, 1] per axis (y up). */
function aimParallax(site: Site, event: PointerEvent): void {
  site.pointerParallax = {
    x: (event.clientX / window.innerWidth) * 2 - 1,
    y: 1 - (event.clientY / window.innerHeight) * 2,
  };
}

function resize(site: Site): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  site.renderer.setSize(width, height, false);
  site.camera.aspect = width / height;
  site.camera.updateProjectionMatrix();
  render(site);
}

function fail(error: unknown, site?: Site): void {
  console.error(error);
  if (site !== undefined) {
    site.listeners.abort();
    site.renderer.setAnimationLoop(null);
    site.points.geometry.dispose();
    site.points.material.dispose();
    site.renderer.dispose();
  }
  setState('fallback');
}

/** Runs `action`; on an error, stops the site and shows the fallback. */
function guarded(site: Site, action: (site: Site) => void): void {
  try {
    action(site);
  } catch (error) {
    fail(error, site);
  }
}

function isMoving(site: Site): boolean {
  return !site.userPaused && !site.reducedMotion.matches;
}

/** Applies the motion state to the clock, the pause button and the render loop. */
function applyMotion(site: Site): void {
  const moving = isMoving(site);
  site.clock = setPaused(site.clock, !moving);
  site.pauseButton.hidden = site.reducedMotion.matches;
  site.pauseButton.setAttribute('aria-pressed', String(site.userPaused));
  site.renderer.setAnimationLoop(moving ? (nowMs) => guarded(site, (s) => frame(s, nowMs)) : null);
  if (!moving) {
    render(site);
  }
}

function togglePause(site: Site): void {
  site.userPaused = !site.userPaused;
  applyMotion(site);
}

function run(site: Site): void {
  const { signal } = site.listeners;
  resize(site);
  setState('ready');
  window.addEventListener('resize', () => guarded(site, resize), { signal });
  site.pauseButton.addEventListener('click', () => guarded(site, togglePause), { signal });
  site.reducedMotion.addEventListener('change', () => guarded(site, applyMotion), { signal });
  window.addEventListener('pointermove', (event) => guarded(site, (s) => aimParallax(s, event)), { signal });
  applyMotion(site);
}

start().then(
  (site) => guarded(site, run),
  (error: unknown) => fail(error),
);
