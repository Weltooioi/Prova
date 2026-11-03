// node tools/beats.mjs <film>  ->  films/<film>/beats.json
// Measures the beat grid from the actual audio (supplied track or synthesized score.wav):
// onset envelope -> tempo by autocorrelation -> phase by comb alignment -> snap to onsets.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { filmDir, readMeta, args, run } from './common.mjs';

const SR = 22050, HOP = 256, WIN = 1024;

function decode(file) {
  const r = run('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { encoding: 'buffer' });
  const b = r.stdout;
  // Pad WIN samples of silence in front so an onset at t=0 is still a rise in energy,
  // and frame f's window ends exactly at f*HOP in the original timeline.
  const x = new Float32Array(WIN + b.length / 4);
  x.set(new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)), WIN);
  return x;
}

/** Onset strength: positive log-energy flux in a low band and a full band. */
function onsetEnvelope(x) {
  const frames = Math.floor((x.length - WIN) / HOP);
  const low = new Float32Array(frames), full = new Float32Array(frames);
  let lp = 0; const k = 1 - Math.exp((-2 * Math.PI * 160) / SR);
  const lowSig = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) { lp += k * (x[i] - lp); lowSig[i] = lp; }
  for (let f = 0; f < frames; f++) {
    let el = 0, ef = 0;
    for (let i = f * HOP, e = i + WIN; i < e; i++) { el += lowSig[i] ** 2; ef += x[i] ** 2; }
    low[f] = Math.log1p(1000 * el); full[f] = Math.log1p(1000 * ef);
  }
  const env = new Float32Array(frames), lowOn = new Float32Array(frames);
  for (let f = 1; f < frames; f++) {
    lowOn[f] = Math.max(0, low[f] - low[f - 1]);
    env[f] = lowOn[f] + 0.5 * Math.max(0, full[f] - full[f - 1]);
  }
  return { env, lowOn, fps: SR / HOP };
}

/** Sample-accurate onset: biggest rise in 64-sample energy within the hop before frame end s. */
function refine(x, s) {
  const M = 64; let best = s, bv = -Infinity;
  const e = (i) => { let v = 0; for (let j = i; j < i + M; j++) v += (x[j] || 0) ** 2; return v; };
  for (let i = s - HOP - M; i <= s; i += 8) {
    const d = Math.log1p(1e4 * e(i)) - Math.log1p(1e4 * e(i - M));
    if (d > bv) { bv = d; best = i; }
  }
  return best;
}

function tempo(env, fps, lo = 70, hi = 180) {
  let best = { score: -1 };
  for (let bpm = lo; bpm <= hi; bpm += 0.05) {
    const lag = (60 / bpm) * fps;
    let s = 0;
    for (let f = 0; f + lag * 2 < env.length; f++) {
      const a = env[Math.round(f + lag)], b = env[Math.round(f + lag * 2)];
      s += env[f] * (a + 0.5 * b);
    }
    s /= env.length;
    const prior = Math.exp(-0.5 * (Math.log2(bpm / 120) / 0.9) ** 2);
    if (s * prior > best.score) best = { score: s * prior, bpm };
  }
  return best.bpm;
}

export function measure(file, { duration } = {}) {
  const x = decode(file);
  const { env, lowOn, fps } = onsetEnvelope(x);
  const bpm = tempo(env, fps);
  const period = (60 / bpm) * fps;
  let phase = 0, bestS = -1;
  for (let p = 0; p < period; p += 0.25) {
    let s = 0;
    for (let f = p; f < env.length; f += period) s += env[Math.round(f)] || 0;
    if (s > bestS) { bestS = s; phase = p; }
  }
  const end = duration ?? (x.length - WIN) / SR;
  const beats = [];
  for (let f = phase; f / fps <= end + 1e-6; f += period) {
    let bf = Math.round(f), bv = env[bf] || 0;
    for (let d = -2; d <= 2; d++) if ((env[Math.round(f) + d] || 0) > bv) { bv = env[Math.round(f) + d]; bf = Math.round(f) + d; }
        beats.push(Math.max(0, refine(x, bf * HOP + WIN) - WIN) / SR);
  }
  // Downbeats (4/4): the beat phase with the most low-band energy.
  const acc = [0, 0, 0, 0];
  beats.forEach((b, i) => { acc[i % 4] += lowOn[Math.round((b * SR) / HOP)] || 0; });
  const db = acc.indexOf(Math.max(...acc));
  const round = (v) => Math.round(v * 1000) / 1000;
  return {
    bpm: Math.round(bpm * 100) / 100,
    beats: beats.map(round),
    downbeats: beats.filter((_, i) => i % 4 === db).map(round),
  };
}

export function buildBeats(dir) {
  const meta = readMeta(dir);
  const file = path.join(dir, meta.track || 'score.wav');
  const grid = measure(file, { duration: meta.duration });
  grid.source = path.basename(file);
  fs.writeFileSync(path.join(dir, 'beats.json'), JSON.stringify(grid, null, 1) + '\n');
  const drift = meta.bpm ? ` (declared ${meta.bpm})` : '';
  console.log(`beats: measured ${grid.bpm} BPM${drift}, ${grid.beats.length} beats, first at ${grid.beats[0]}s`);
  return grid;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) buildBeats(filmDir(args()._[0]));
