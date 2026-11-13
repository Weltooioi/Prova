import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

/** Resolve a film directory from argv (name or path). Defaults to the only film if there is one. */
export function filmDir(arg) {
  if (arg) {
    const p = fs.existsSync(arg) ? path.resolve(arg) : path.join(ROOT, 'films', arg);
    if (!fs.existsSync(path.join(p, 'film.json'))) throw new Error(`No film.json in ${p}`);
    return p;
  }
  const films = fs.readdirSync(path.join(ROOT, 'films')).filter((f) => fs.existsSync(path.join(ROOT, 'films', f, 'film.json')));
  if (films.length !== 1) throw new Error(`Pass a film name. Found: ${films.join(', ')}`);
  return path.join(ROOT, 'films', films[0]);
}

export const readMeta = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));

export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out[k] = v ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
    } else out._.push(a);
  }
  return out;
}

/** Playwright, from the project install or the global one. */
export function playwright() {
  const req = createRequire(path.join(ROOT, 'package.json'));
  try { return req('playwright'); } catch { return createRequire(import.meta.url)('playwright'); }
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.wav': 'audio/wav', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf' };

/** Static server rooted at the repo, so films can import ../../lib/*.js as ES modules. */
export function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); } // full Chromium asks for it
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/** Init script injected in render mode: enforce the render contract at runtime. */
export const RENDER_GUARD = `
(() => {
  const ban = (name) => () => { throw new Error('render contract: ' + name + ' is banned in render mode'); };
  Math.random = ban('Math.random');
  window.setTimeout = ban('setTimeout');
  window.setInterval = ban('setInterval');
  window.requestAnimationFrame = ban('requestAnimationFrame');
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style');
    s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
    document.head.appendChild(s);
  });
})();`;

/** Open a film page in render mode and return { browser, page, meta }. */
export async function openFilm(dir, { scale = 1 } = {}) {
  const meta = readMeta(dir);
  const { chromium } = playwright();
  const { srv, url } = await serve();
  // Prefer a pre-installed Chromium (cloud sessions) so a newer playwright version still finds a browser.
  const exe = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: meta.width, height: meta.height }, deviceScaleFactor: scale });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(RENDER_GUARD);
  const rel = path.relative(ROOT, dir).split(path.sep).join('/');
  await page.goto(`${url}/${rel}/index.html?render`);
  await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 }).catch(() => {});
  if (errors.length || !(await page.evaluate(() => window.__ready))) {
    await browser.close(); srv.close();
    throw new Error('Film failed to load:\n' + errors.join('\n'));
  }
  await page.addStyleTag({ content: 'html,body{margin:0;padding:0;overflow:hidden;background:#000}#film{display:block}' });
  const close = async () => { await browser.close(); srv.close(); };
  return { browser, page, meta, errors, close };
}

/** Capture frame t as a PNG buffer (canvas pixels, exact size). */
export async function frameAt(page, t) {
  await page.evaluate((t) => window.seek(t), t);
  return page.locator('#film').screenshot({ type: 'png', animations: 'disabled' });
}

export function run(cmd, argv, opts = {}) {
  const r = spawnSync(cmd, argv, { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
  if (r.status !== 0) throw new Error(`${cmd} failed:\n${r.stderr}`);
  return r;
}
export { spawn };
