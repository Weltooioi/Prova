// prova-intro — 12 s, 1080x1920, 120 BPM. Every frame is paint(t); nothing is remembered.
import { defineFilm } from '../../lib/runtime.js';
import { clamp, lerp, prog, ease, tween, beatPulse } from '../../lib/time.js';
import { noise2, hash } from '../../lib/rng.js';

const PAPER = '#ECE8DF', INK = '#141414', ACCENT = '#FF4A1C';
const DISPLAY = '"Inter Display", "Inter", sans-serif';
const UI = '"JetBrains Mono", monospace';
const W = 1080, H = 1920;

defineFilm({
  fonts: [`900 100px ${DISPLAY}`, `800 100px ${DISPLAY}`, `500 60px ${UI}`, `700 60px ${UI}`],
  frame(t, film) {
    const { ctx } = film;
    const b = (i) => film.beats[i] ?? i * 0.5;   // measured beat i
    const S = [0, 4, 8, 12, 16, 20].map(b);       // section starts (every bar)

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    if (t < S[2] + 0.35) intro(ctx, t, b, S);
    if (t >= S[1] - 0.01 && t < S[2] + 0.35) lines(ctx, t, b, S);
    if (t >= S[2]) graph(ctx, t, b, S);
    if (t >= S[3]) field(ctx, t, b, S);
    if (t >= S[4]) grid(ctx, t, b, S, film.beats);
    if (t >= S[5] - 0.0001) outro(ctx, t, b, S);
  },
});

// ---------- helpers ----------
function text(ctx, str, x, y, { size, weight = 900, face = DISPLAY, color = INK, align = 'left', track = 0, base = 'alphabetic' }) {
  ctx.font = `${weight} ${size}px ${face}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.letterSpacing = `${track}px`;
  ctx.fillText(str, x, y);
  ctx.letterSpacing = '0px';
}
function clipRect(ctx, x, y, w, h, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); }

// ---------- S1: PROVA stamps in on the 8ths ----------
const LETTERS = 'PROVA';
function word(ctx, t, t0, { y, size, color = INK, stagger = 0.25, drop = 520, squash = 0 }) {
  ctx.font = `900 ${size}px ${DISPLAY}`;
  const raw = [...LETTERS].reduce((a, ch) => a + ctx.measureText(ch).width - size * 0.04, 0);
  size *= Math.min(1, (W - 120) / raw);           // always fits with a 60px margin
  ctx.font = `900 ${size}px ${DISPLAY}`;
  const total = [...LETTERS].reduce((a, ch) => a + ctx.measureText(ch).width - size * 0.04, 0);
  let x = (W - total) / 2;
  for (let i = 0; i < 5; i++) {
    ctx.font = `900 ${size}px ${DISPLAY}`;
    const w = ctx.measureText(LETTERS[i]).width - size * 0.04;
    const k = clamp((t - (t0 + i * stagger)) / 0.32);
    if (k > 0) {
      const s = ease.spring(k * 2.4, 9, 4.2);
      ctx.save();
      ctx.translate(x + w / 2, y - (1 - s) * drop);
      ctx.scale(1 + squash * 0.25, 1 - squash);
      text(ctx, LETTERS[i], 0, 0, { size, color, align: 'center' });
      ctx.restore();
    }
    x += w;
  }
}

function intro(ctx, t, b, S) {
  const out = ease.inExpo(prog(t, S[1] - 0.12, S[1] + 0.16));   // pushed up and away at S2
  ctx.save();
  ctx.translate(0, -out * 1500);
  if (out >= 1) { ctx.restore(); return; }
  // Letters start mid-drop at t=0 so frame 0 is already moving.
  const sq = Math.exp(-Math.max(0, t - b(3)) * 10) * (t >= b(3) ? 0.18 : 0);
  word(ctx, t, -0.1, { y: 1040, size: 330, squash: sq });
  // Accent bar slams in from the left on beat 3.
  const bar = ease.outExpo(prog(t, b(3), b(3) + 0.25));
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 1120, W * bar, 120);
  // Mono count under it, ticking with the beats.
  const n = Math.min(4, Math.floor(t / 0.5) + 1);
  text(ctx, '1 2 3 4'.slice(0, n * 2 - 1), 70, 1340, { size: 64, weight: 700, face: UI, track: 18 });
  text(ctx, 'studio', W - 70, 1340, { size: 64, weight: 500, face: UI, align: 'right' });
  ctx.restore();
}

// ---------- S2: three lines, one per beat, masked wipe-up ----------
function lines(ctx, t, b, S) {
  const out = ease.inExpo(prog(t, S[2] - 0.1, S[2] + 0.3));
  const L = [['every frame', INK], ['is a function', INK], ['of time.', ACCENT]];
  const top = 820, lh = 190;
  L.forEach(([s, c], i) => {
    const k = ease.outQuart(prog(t, b(4 + i) + (i ? -0.04 : 0.13), b(4 + i) + 0.34));
    const y = top + i * lh;
    clipRect(ctx, 0, y - 170, W, 210, () => {
      text(ctx, s, 64, y + (1 - k) * 190 - out * 210, { size: 156, track: -5, color: c });
    });
  });
  // Code line types in on beat 7.
  const code = 'window.seek(t) → frame';
  const n = Math.floor(clamp((t - b(7)) / 0.42) * code.length);
  if (n > 0) {
    const y = top + 3 * lh + 30;
    clipRect(ctx, 0, y - 80, W * (1 - out), 120, () => {
      ctx.fillStyle = INK;
      ctx.fillRect(64, y - 62, 952, 92);
      text(ctx, code.slice(0, n), 92, y, { size: 52, weight: 500, face: UI, color: PAPER });
      if (n < code.length || Math.floor(t * 4) % 2 === 0) {
        ctx.font = `500 52px ${UI}`;
        ctx.fillStyle = ACCENT;
        ctx.fillRect(92 + ctx.measureText(code.slice(0, n)).width + 6, y - 44, 26, 56);
      }
    });
  }
}

// ---------- S3: f(t) — an easing curve drawn live, on ink ----------
const CURVES = [['outBack', (x) => ease.outBack(x, 2.2)], ['spring', (x) => ease.spring(x * 2.2, 8, 5)], ['inOutExpo', ease.inOutExpo]];
function graph(ctx, t, b, S) {
  const cover = ease.inOutExpo(prog(t, S[2], S[2] + 0.3));
  ctx.fillStyle = INK;
  ctx.fillRect(0, H * (1 - cover), W, H * cover);
  if (t < S[2] + 0.12) return;
  const ci = t < b(10) ? 0 : t < b(11) ? 1 : 2;
  const [name, f] = CURVES[ci];
  const seg0 = [S[2], b(10), b(11)][ci];
  const x0 = 110, y0 = 1320, gw = 600, gh = 620;
  // axes
  ctx.strokeStyle = PAPER; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x0, y0 - gh - 80); ctx.lineTo(x0, y0); ctx.lineTo(x0 + gw + 40, y0); ctx.stroke();
  ctx.globalAlpha = 0.35; ctx.lineWidth = 2; ctx.setLineDash([10, 14]);
  ctx.beginPath(); ctx.moveTo(x0, y0 - gh); ctx.lineTo(x0 + gw + 40, y0 - gh); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  // curve, drawn up to the playhead
  const k = ease.outQuad(clamp((t - seg0 + 0.03) / 0.4));
  if (ci > 0) {
    const g = CURVES[ci - 1][1];
    ctx.strokeStyle = PAPER; ctx.globalAlpha = 0.18; ctx.lineWidth = 6;
    ctx.beginPath();
    for (let s = 0; s <= 80; s++) { const x = s / 80; s ? ctx.lineTo(x0 + x * gw, y0 - g(x) * gh) : ctx.moveTo(x0, y0 - g(0) * gh); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = ACCENT; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  const steps = Math.max(1, Math.ceil(80 * k));
  for (let s = 0; s <= steps; s++) {
    const x = Math.min(k, s / 80);
    const px = x0 + x * gw, py = y0 - f(x) * gh;
    s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  const v = f(k);
  const dx = x0 + k * gw, dy = y0 - v * gh;
  ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(dx, dy, 22, 0, Math.PI * 2); ctx.fill();
  // the block the curve drives
  ctx.fillStyle = ACCENT;
  ctx.fillRect(820, y0 - v * gh - 90, 160, 160);
  ctx.strokeStyle = PAPER; ctx.globalAlpha = 0.4; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(820, dy); ctx.stroke(); ctx.globalAlpha = 1;
  // headline + readout
  clipRect(ctx, 0, 220, W, 220, () => {
    const up = ease.outQuart(prog(t, S[2] + 0.1, S[2] + 0.4));
    text(ctx, 'f(t)', 90, 400 + (1 - up) * 220, { size: 200, color: PAPER, track: -6 });
  });
  text(ctx, name, 90, 520, { size: 64, weight: 700, face: UI, color: ACCENT });
  text(ctx, `t ${t.toFixed(3)}`, 90, 1560, { size: 72, weight: 500, face: UI, color: PAPER });
  text(ctx, `f ${v.toFixed(3)}`, 90, 1660, { size: 72, weight: 500, face: UI, color: PAPER });
}

// ---------- S4: a seeded flow field of ticks, revealed row-band per beat ----------
const SEED = 0x5eed;
function field(ctx, t, b, S) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  const cols = 14, rows = 22, cw = W / cols, top = 130, rh = 66;
  for (let r = 0; r < rows; r++) {
    const band = Math.floor((r / rows) * 4);
    const k = ease.outCubic(prog(t, b(12 + band) + (r % 6) * 0.03, b(12 + band) + (r % 6) * 0.03 + 0.25));
    if (k <= 0) continue;
    for (let c = 0; c < cols; c++) {
      const n = noise2(c * 0.22, r * 0.18 + t * 0.55, SEED);
      const a = n * Math.PI * 2.4;
      const len = 40 * k;
      const cx = cw * (c + 0.5), cy = top + r * rh;
      const hot = hash(SEED, c, r) > 0.93;
      ctx.strokeStyle = hot ? ACCENT : PAPER;
      ctx.lineWidth = hot ? 10 : 6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2);
      ctx.lineTo(cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2);
      ctx.stroke();
    }
  }
  ctx.fillStyle = INK; ctx.fillRect(0, 1560, W, 360);
  const hex = '0x5EED';
  const shown = Math.floor(clamp((t - b(13)) / 0.3) * hex.length);
  text(ctx, 'seed', 70, 1700, { size: 72, weight: 500, face: UI, color: PAPER });
  text(ctx, hex.slice(0, shown), 70, 1840, { size: 150, weight: 700, face: UI, color: ACCENT, track: -4 });
  text(ctx, 'mulberry32', W - 70, 1700, { size: 60, weight: 500, face: UI, color: PAPER, align: 'right' });
}

// ---------- S5: the beat grid, an accent slam then paper ----------
function grid(ctx, t, b, S, beats) {
  // Accent block slams up, then lifts away revealing paper.
  const inK = ease.outExpo(prog(t, S[4], S[4] + 0.18));
  const outK = ease.inOutExpo(prog(t, S[4] + 0.2, S[4] + 0.5));
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, H * (1 - outK), W, H * outK);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, H * (1 - inK), W, H * (inK - outK));
  if (outK <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, H * (1 - outK), W, H * outK); ctx.clip();
  text(ctx, 'on the', 64, 470, { size: 180, track: -6 });
  text(ctx, 'grid.', 64, 650, { size: 180, track: -6, color: ACCENT });
  // 16 beat bars; each spikes when its beat passes.
  const n = 16, gx = 64, gw = W - 128, bw = gw / n, base = 1420;
  for (let i = 0; i < n; i++) {
    const bt = (beats[8 + i] ?? (8 + i) * 0.5);
    const since = t - bt;
    const down = i % 4 === 0;
    const spike = since >= 0 ? Math.exp(-since * 5) : 0;
    const passed = since >= 0 ? 1 : 0;
    const h = 40 + passed * 80 + spike * (down ? 520 : 340);
    ctx.fillStyle = down ? ACCENT : INK;
    ctx.globalAlpha = passed ? 1 : 0.25;
    ctx.fillRect(gx + i * bw + 6, base - h, bw - 12, h);
  }
  ctx.globalAlpha = 1;
  // playhead
  const ph = clamp((t - (beats[8] ?? 4)) / ((beats[24] ?? 12) - (beats[8] ?? 4)));
  ctx.fillStyle = INK; ctx.fillRect(gx + ph * gw - 3, base - 720, 6, 760);
  text(ctx, `beat ${String(Math.max(0, film_beatIndex(t, beats))).padStart(2, '0')}`, 64, 1600, { size: 72, weight: 700, face: UI });
  text(ctx, '120 bpm', W - 64, 1600, { size: 72, weight: 500, face: UI, align: 'right' });
  ctx.restore();
}
function film_beatIndex(t, beats) { let i = 0; while (i + 1 < beats.length && beats[i + 1] <= t) i++; return i; }

// ---------- S6: resolve ----------
function outro(ctx, t, b, S) {
  const k = ease.outExpo(prog(t, S[5], S[5] + 0.2));
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H * k);
  if (k < 0.6) return;
  const sq = t >= b(23) ? Math.exp(-(t - b(23)) * 9) * 0.14 : 0;
  word(ctx, t, S[5] + 0.02, { y: 1000, size: 330, color: PAPER, stagger: 0.04, drop: -300, squash: sq });
  const bar = ease.outExpo(prog(t, b(21), b(21) + 0.3));
  ctx.fillStyle = ACCENT; ctx.fillRect(W * (1 - bar), 1060, W * bar, 120);
  const s1 = 'motion studio';
  const n1 = Math.floor(clamp((t - b(21) - 0.05) / 0.35) * s1.length);
  text(ctx, s1.slice(0, n1), 70, 1290, { size: 72, weight: 700, face: UI, color: PAPER });
  const s2 = 'every frame, f(t)';
  const n2 = Math.floor(clamp((t - b(22)) / 0.45) * s2.length);
  text(ctx, s2.slice(0, n2), 70, 1390, { size: 52, weight: 500, face: UI, color: PAPER });
}
