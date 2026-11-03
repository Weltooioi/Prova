// node tools/sound.mjs <film>  ->  films/<film>/score.wav
// Synthesizes the score from films/<film>/score.mjs unless film.json names a supplied "track".
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { filmDir, readMeta, args } from './common.mjs';
import { createMix, master, SR } from '../lib/synth.mjs';
import { writeWav } from '../lib/wav.mjs';

export async function buildSound(dir) {
  const meta = readMeta(dir);
  if (meta.track) { console.log(`sound: using supplied track ${meta.track}`); return path.join(dir, meta.track); }
  const { default: score } = await import(pathToFileURL(path.join(dir, 'score.mjs')).href);
  const spb = 60 / meta.bpm;
  const grid = Array.from({ length: Math.floor(meta.duration / spb) + 1 }, (_, i) => (meta.offset || 0) + i * spb);
  const mix = createMix(meta.duration + (meta.tail ?? 0), SR);
  score({ mix, meta, grid, spb });
  master(mix);
  const out = path.join(dir, 'score.wav');
  writeWav(out, mix);
  console.log(`sound: wrote ${path.relative(process.cwd(), out)} (${meta.duration}s @ ${meta.bpm} BPM, ${SR} Hz)`);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = args();
  await buildSound(filmDir(a._[0]));
}
