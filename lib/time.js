// Pure helpers for building a film as a function of time.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
/** Normalised progress of t through [t0, t1], clamped to 0..1. */
export const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));

export const ease = {
  linear: (x) => x,
  inQuad: (x) => x * x,
  outQuad: (x) => 1 - (1 - x) * (1 - x),
  inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  outCubic: (x) => 1 - (1 - x) ** 3,
  inCubic: (x) => x ** 3,
  inOutCubic: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  outQuart: (x) => 1 - (1 - x) ** 4,
  inExpo: (x) => (x === 0 ? 0 : 2 ** (10 * x - 10)),
  outExpo: (x) => (x === 1 ? 1 : 1 - 2 ** (-10 * x)),
  inOutExpo: (x) =>
    x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
  /** Damped spring settle, 0 -> 1 with overshoot. */
  spring: (x, k = 7, d = 5) => (x <= 0 ? 0 : 1 - Math.exp(-d * x) * Math.cos(k * x)),
};

/** Tween: value of an eased move from a to b over [t0, t1]. */
export const tween = (t, t0, t1, a, b, fn = ease.outCubic) => lerp(a, b, fn(prog(t, t0, t1)));

/** Seconds since the most recent beat <= t, and its index. Beats is a sorted array of seconds. */
export function lastBeat(t, beats) {
  let lo = 0, hi = beats.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid] <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return { index: idx, since: idx < 0 ? Infinity : t - beats[idx] };
}

/** Exponential decay pulse that fires on every beat: 1 on the beat, falls to ~0 after `len` seconds. */
export function beatPulse(t, beats, len = 0.25) {
  const { since } = lastBeat(t, beats);
  return since === Infinity ? 0 : Math.exp((-since / len) * 4);
}
