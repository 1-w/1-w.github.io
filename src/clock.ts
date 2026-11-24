/**
 * Pausable animation time in seconds, driven by frame timestamps.
 * Every function returns a new state; inputs stay unchanged.
 */

export interface ClockState {
  readonly elapsed: number;
  readonly lastNow: number | null;
  readonly paused: boolean;
}

/** The largest step one frame can add, so a hidden tab or a stall gives no jump. */
export const MAX_FRAME_GAP = 0.1;

export function startClock(): ClockState {
  return { elapsed: 0, lastNow: null, paused: false };
}

/** Advances by the time since the last tick, clamped to [0, MAX_FRAME_GAP]. */
export function tick(state: ClockState, nowMs: number): ClockState {
  if (state.paused) {
    return state;
  }
  const delta = state.lastNow === null ? 0 : (nowMs - state.lastNow) / 1000;
  const step = Math.min(Math.max(delta, 0), MAX_FRAME_GAP);
  return { elapsed: state.elapsed + step, lastNow: nowMs, paused: false };
}

/** Clears the last timestamp, so the first tick after a change adds nothing. */
export function setPaused(state: ClockState, paused: boolean): ClockState {
  return { elapsed: state.elapsed, lastNow: null, paused };
}
