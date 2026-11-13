// Minimal offline synth. Everything is rendered into stereo Float32 buffers.
// All voices are deterministic; noise uses mulberry32.
import { mulberry32 } from './rng.js';

export const SR = 48000;

export function createMix(duration, sr = SR) {
  const n = Math.ceil(duration * sr);
  return { sr, n, L: new Float32Array(n), R: new Float32Array(n) };
}

/** Add a mono voice (fn of local time in seconds -> sample) at time t0 for len seconds. */
export function place(mix, t0, len, fn, { gain = 1, pan = 0 } = {}) {
  const { sr, L, R, n } = mix;
  const s0 = Math.round(t0 * sr), s1 = Math.min(n, s0 + Math.ceil(len * sr));
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let s = Math.max(0, s0); s < s1; s++) {
    const v = fn((s - s0) / sr);
    L[s] += v * gl;
    R[s] += v * gr;
  }
}

export const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const TAU = Math.PI * 2;

/** Envelope: attack a, exponential decay d (time constant), total len. */
export const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

export const voices = {
  kick: ({ f0 = 150, f1 = 42, drop = 0.045, decay = 0.28 } = {}) => {
    let ph = 0, last = 0;
    return (t) => {
      const f = f1 + (f0 - f1) * Math.exp(-t / drop);
      ph += TAU * f * (t - last); last = t;
      const click = t < 0.004 ? (1 - t / 0.004) * 0.6 : 0;
      return Math.tanh(1.6 * Math.sin(ph) * env(t, 0.002, decay)) + click;
    };
  },
  hat: ({ seed = 1, decay = 0.035, tone = 0.85 } = {}) => {
    const r = mulberry32(seed); let prev = 0;
    return (t) => {
      const w = r() * 2 - 1; const hp = w - prev * tone; prev = w;
      return hp * env(t, 0.001, decay) * 0.5;
    };
  },
  snap: ({ seed = 2, decay = 0.09 } = {}) => {
    const r = mulberry32(seed); let lp = 0;
    return (t) => {
      const w = r() * 2 - 1; lp += 0.35 * (w - lp);
      const body = Math.sin(TAU * 190 * t) * env(t, 0.001, 0.04);
      return ((w - lp) * 0.8 + body * 0.5) * env(t, 0.001, decay);
    };
  },
  /** Plucked/stamped tone, used for type hits. */
  blip: ({ note = 81, decay = 0.08, shape = 0.3 } = {}) => {
    const f = midi(note);
    return (t) => {
      const s = Math.sin(TAU * f * t + shape * Math.sin(TAU * f * 2 * t));
      return s * env(t, 0.001, decay) * 0.5;
    };
  },
  /** Detuned saw bass through a one-pole low-pass. */
  bass: ({ note = 33, len = 1, cutoff = 420 } = {}) => {
    const f = midi(note); let lp = 0, lp2 = 0;
    const k = 1 - Math.exp((-TAU * cutoff) / SR);
    return (t) => {
      const saw = ((t * f) % 1) * 2 - 1 + (((t * f * 1.006) % 1) * 2 - 1);
      const sub = Math.sin(TAU * f * 0.5 * t) * 0.8;
      lp += k * (saw * 0.5 - lp); lp2 += k * (lp - lp2);
      const g = Math.min(1, t / 0.01) * Math.min(1, Math.max(0, (len - t) / 0.06));
      return (lp2 + sub) * g * 0.55;
    };
  },
  /** Soft chord pad: sum of detuned sines with slow swell. */
  pad: ({ notes = [57, 60, 64], len = 2 } = {}) => {
    const fs = notes.flatMap((n) => [midi(n) * 0.997, midi(n) * 1.003]);
    return (t) => {
      let s = 0;
      for (let i = 0; i < fs.length; i++) s += Math.sin(TAU * fs[i] * t + i);
      const g = Math.min(1, t / 0.25) * Math.min(1, Math.max(0, (len - t) / 0.4));
      return (s / fs.length) * g * 0.5;
    };
  },
  /** Noise riser: band-limited noise swelling into a hit at `len`. */
  riser: ({ seed = 3, len = 1 } = {}) => {
    const r = mulberry32(seed); let lp = 0;
    return (t) => {
      const x = t / len, k = 0.02 + 0.5 * x * x;
      lp += k * (r() * 2 - 1 - lp);
      return lp * x ** 2.2 * 0.9;
    };
  },
  /** Low impact: sine thump + noise tail. */
  impact: ({ seed = 4, decay = 0.7 } = {}) => {
    const r = mulberry32(seed); let lp = 0, ph = 0, last = 0;
    return (t) => {
      const f = 38 + 90 * Math.exp(-t / 0.06);
      ph += TAU * f * (t - last); last = t;
      lp += 0.08 * (r() * 2 - 1 - lp);
      return (Math.sin(ph) * 1.1 + lp * 1.4) * env(t, 0.002, decay) * 0.8;
    };
  },
};

/** Gentle bus processing: DC block + soft clip. Loudness is set later with two-pass loudnorm. */
export function master(mix, drive = 1.2) {
  for (const ch of [mix.L, mix.R]) {
    let x1 = 0, y1 = 0;
    for (let i = 0; i < ch.length; i++) {
      const x = ch[i];
      const y = x - x1 + 0.995 * y1; x1 = x; y1 = y;
      ch[i] = Math.tanh(y * drive) / Math.tanh(drive);
    }
  }
  return mix;
}
