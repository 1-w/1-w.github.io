import { describe, expect, test } from 'vitest';
import { MAX_FRAME_GAP, setPaused, startClock, tick } from '../src/clock.ts';

describe('clock', () => {
  test('first tick does not advance', () => {
    expect(tick(startClock(), 1000).elapsed).toBe(0);
  });

  test('advances by frame time', () => {
    const state = tick(tick(startClock(), 1000), 1016);
    expect(state.elapsed).toBeCloseTo(0.016, 9);
  });

  test('paused does not advance', () => {
    const running = tick(startClock(), 1000);
    const paused = tick(setPaused(running, true), 11000);
    expect(paused.elapsed).toBe(running.elapsed);
  });

  test('resume does not jump', () => {
    const paused = tick(setPaused(tick(startClock(), 1000), true), 11000);
    const resumed = tick(setPaused(paused, false), 11016);
    expect(resumed.elapsed).toBe(paused.elapsed);
    expect(tick(resumed, 11032).elapsed).toBeCloseTo(paused.elapsed + 0.016, 9);
  });

  test('long gap', () => {
    expect(tick(tick(startClock(), 0), 30000).elapsed).toBe(MAX_FRAME_GAP);
  });

  test('backwards clock', () => {
    const elapsed = tick(tick(startClock(), 1000), 900).elapsed;
    expect(elapsed).toBe(0);
    expect(Number.isNaN(elapsed)).toBe(false);
  });

  test('does not mutate', () => {
    const input = Object.freeze(tick(startClock(), 1000));
    const output = tick(input, 1016);
    expect(output).not.toBe(input);
    expect(input.elapsed).toBe(0);
  });
});
