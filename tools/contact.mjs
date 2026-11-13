// node tools/contact.mjs <film> [--cols 8] [--tile 270] [--offset 0.05]
// One frame per beat, tiled into films/<film>/out/contact.png. Tile width defaults to phone-ish size
// so the sheet doubles as a readability check. LOOK at it before rendering.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { filmDir, args, openFilm, frameAt } from './common.mjs';

export async function contactSheet(dir, { cols = 8, tile = 270, offset = 0.05, times } = {}) {
  const { page, meta, close } = await openFilm(dir);
  let beats = [];
  try { beats = JSON.parse(fs.readFileSync(path.join(dir, 'beats.json'), 'utf8')).beats; } catch {}
  if (!beats.length) beats = Array.from({ length: Math.ceil(meta.duration * meta.bpm / 60) }, (_, i) => (i * 60) / meta.bpm);
  // A few frames after each beat, so the hit has landed. Snap to the frame grid.
  const ts = (times || beats.map((b) => b + offset))
    .filter((t) => t < meta.duration)
    .map((t) => Math.round(t * meta.fps) / meta.fps);
  const shots = [];
  for (const t of ts) shots.push({ t, src: 'data:image/png;base64,' + (await frameAt(page, t)).toString('base64') });

  const h = Math.round((tile * meta.height) / meta.width);
  await page.setViewportSize({ width: cols * (tile + 8) + 8, height: 200 });
  await page.setContent(`<style>
    body{margin:0;background:#1a1a1a;padding:8px;display:grid;grid-template-columns:repeat(${cols},${tile}px);gap:8px;font:13px "JetBrains Mono",monospace;color:#bbb}
    figure{margin:0} img{width:${tile}px;height:${h}px;display:block} figcaption{padding:3px 0}</style>
    ${shots.map((s, i) => `<figure><img src="${s.src}"><figcaption>b${i}  ${s.t.toFixed(2)}s</figcaption></figure>`).join('')}`);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  const outDir = path.join(dir, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'contact.png');
  await page.screenshot({ path: out, fullPage: true });
  await close();
  console.log(`contact: ${shots.length} frames -> ${path.relative(process.cwd(), out)}`);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = args();
  const times = a.times ? String(a.times).split(',').map(Number) : undefined;
  await contactSheet(filmDir(a._[0]), { cols: +(a.cols || 8), tile: +(a.tile || 270), offset: +(a.offset ?? 0.05), times });
}
