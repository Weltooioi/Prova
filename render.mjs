// node render.mjs [film] [--contact] [--still t] [--no-sound]
//
//   default     lint -> sound -> beats -> every frame -> H.264 yuv420p CRF 16 -> score at -14 LUFS -> out/<film>.mp4
//   --contact   lint -> sound -> beats -> one frame per beat -> out/contact.png   (do this first, and look at it)
//   --still t   a single full-size frame at time t -> out/still-<t>.png
import fs from 'node:fs';
import path from 'node:path';
import { filmDir, args, openFilm, frameAt, run, spawn } from './tools/common.mjs';
import { lint } from './tools/lint.mjs';
import { buildSound } from './tools/sound.mjs';
import { buildBeats } from './tools/beats.mjs';
import { contactSheet } from './tools/contact.mjs';

const LUFS = -14, TP = -1, LRA = 11, CRF = 16;
const a = args();
const dir = filmDir(a._[0]);
const name = path.basename(dir);
const outDir = path.join(dir, 'out');
fs.mkdirSync(outDir, { recursive: true });

if (!lint(dir)) process.exit(1);

let audio = null;
if (!a['no-sound']) {
  audio = await buildSound(dir);
  buildBeats(dir);
}

if (a.contact) {
  await contactSheet(dir, { cols: +(a.cols || 8), tile: +(a.tile || 270) });
  process.exit(0);
}

if (a.still !== undefined) {
  const t = Number(a.still);
  const { page, close } = await openFilm(dir);
  const out = path.join(outDir, `still-${t.toFixed(2)}.png`);
  fs.writeFileSync(out, await frameAt(page, t));
  await close();
  console.log(`still: ${path.relative(process.cwd(), out)}`);
  process.exit(0);
}

// ---- full render ----
const { page, meta, close } = await openFilm(dir);
const frames = Math.round(meta.duration * meta.fps);
const silent = path.join(outDir, `${name}.video.mp4`);
const ff = spawn('ffmpeg', ['-y', '-v', 'error',
  '-f', 'image2pipe', '-framerate', String(meta.fps), '-c:v', 'png', '-i', '-',
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-pix_fmt', 'yuv420p',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  const png = await frameAt(page, f / meta.fps);
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % meta.fps === 0 || f === frames - 1) process.stdout.write(`\rframes: ${f + 1}/${frames}`);
}
ff.stdin.end();
await done;
await close();
console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);

const final = path.join(outDir, `${name}.mp4`);
if (!audio) {
  fs.renameSync(silent, final);
} else {
  // Two-pass loudnorm to the target integrated loudness.
  const af0 = `atrim=0:${meta.duration},afade=t=out:st=${Math.max(0, meta.duration - 0.05)}:d=0.05`;
  const p1 = run('ffmpeg', ['-hide_banner', '-i', audio, '-af', `${af0},loudnorm=I=${LUFS}:TP=${TP}:LRA=${LRA}:print_format=json`, '-f', 'null', '-']);
  const m = JSON.parse(p1.stderr.slice(p1.stderr.lastIndexOf('{')));
  const ln = `loudnorm=I=${LUFS}:TP=${TP}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', audio, '-map', '0:v', '-map', '1:a',
    '-af', `${af0},${ln},aresample=48000`, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-t', String(meta.duration),
    '-movflags', '+faststart', final]);
  fs.rmSync(silent);
  const chk = run('ffmpeg', ['-hide_banner', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr;
  const I = chk.match(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/)?.[1];
  console.log(`audio: ${I} LUFS integrated (target ${LUFS})`);
}
console.log(`render: ${path.relative(process.cwd(), final)}`);
