// Cenário da praia e objetos. Mar em +z, areia sobe para -z.
const SLOPE = .12; const sandY = z => -SLOPE * z;
const WC = {
  sand: M('#f2d48a', { pat: [2, 0, 0, 0], rim: 0 }), water: M('#2a8fb0', { water: 1 }), waterFar: M('#2a8fb0', { water: 2 }),
  bark: M('#7a5232', { pat: [1, 1, .9, 0], rim: .1 }), barkD: M('#5d3d24', { pat: [1, 1, .9, 0], rim: .1 }), cut: M('#d9b27a', { pat: [3, 38, 0, 0], rim: 0 }),
  leaf: M('#3f9a3c', { rim: .2 }), leafD: M('#2f7d33', { rim: .2 }), coco: M('#5a3a1e'), rock: M('#8d8a84', { rim: .1 }), rockD: M('#6f6c68', { rim: .1 }),
  cloud: M('#ffffff', { rim: 0, nosh: 1, norecv: 1, e: [.25, .27, .3] }), hill: M('#4c9a4a', { nosh: 1 }), foam: M('#ffffff', { unlit: 1, nosh: 1 }),
};
function setDay() { R.sun = V.norm([.38, .8, .46]); R.sunC = [1.55, 1.36, 1.08]; R.sky = [.36, .48, .72]; R.gnd = [.36, .3, .2]; R.zen = [.1, .34, .85]; R.hor = [.56, .78, .99]; R.fog = [.66, .83, .98]; R.fogD = .0026; }
function drawPalm(x, z, h, bend, seed, fr) {
  const C = Mx.chain, r = rng(seed); let f = C(fr || Mx.T(x, sandY(z) - .1, z), Mx.Ry(r() * 6.28)); const n = 7, sl = h / n;
  for (let i = 0; i < n; i++) { f = C(f, Mx.Rz(bend / n)); const rad = .16 - .012 * i; draw(CYL, i % 2 ? WC.bark : WC.barkD, C(f, Mx.T(0, sl / 2, 0), Mx.S(rad, sl * 1.04, rad))); f = C(f, Mx.T(0, sl, 0)); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + r() * .3, d = 1.15 + r() * .35; const lf = C(f, Mx.Ry(a), Mx.Rx(d)); draw(CONE, i % 2 ? WC.leaf : WC.leafD, C(lf, Mx.S(.34, 1.25, .05))); draw(CONE, i % 2 ? WC.leaf : WC.leafD, C(lf, Mx.T(0, 1.05, 0), Mx.Rx(.55), Mx.S(.24, 1.1, .045))); }
  for (let i = 0; i < 3; i++) draw(SPH, WC.coco, C(f, Mx.Ry(i * 2.1), Mx.T(.14, -.1, 0), Mx.S(.1)));
}
function drawBeach(t, o = {}) {
  const C = Mx.chain; R.t = t;
  draw(PL1, WC.sand, C(Mx.Rx(Math.atan(SLOPE)), Mx.S(500, 1, 500)));
  draw(PL1, WC.waterFar, C(Mx.T(0, -.06, 230), Mx.S(900, 1, 600)));
  draw(PLW, WC.water, C(Mx.T(0, 0, 44), Mx.S(120, 1, 100)));
  // ilha distante
  const iz = o.island ? 9000 : 170;
  if (o.island) for (const [hx, hz, hs] of [[-30, -60, 30], [18, -75, 38], [60, -55, 26]]) draw(SPH, WC.hill, C(Mx.T(hx, 4, hz), Mx.S(hs, hs * .55, hs * .7)));
  draw(SPH, M('#e6d39c', { nosh: 1 }), C(Mx.T(0, -.5, iz), Mx.S(34, 2.6, 16)));
  draw(SPH, WC.hill, C(Mx.T(-6, 2, iz + 2), Mx.S(16, 9, 9))); draw(SPH, M('#3f8a44', { nosh: 1 }), C(Mx.T(9, 1.5, iz + 3), Mx.S(13, 6.5, 8)));
  const r = rng(11); for (let i = 0; i < 7; i++) { const px = -22 + i * 7 + r() * 3; draw(CYL, M('#6b4a2c', { nosh: 1 }), C(Mx.T(px, 4, iz - 8), Mx.S(.35, 6, .35))); for (let j = 0; j < 6; j++) draw(CONE, WC.hill, C(Mx.T(px, 7, iz - 8), Mx.Ry(j * 1.05), Mx.Rx(1.25), Mx.S(1.1, 3.6, .2))); }
  // nuvens
  const rc = rng(5); for (let i = 0; i < 9; i++) { const cx = -160 + i * 42 + rc() * 20 + t * .6, cy = 38 + rc() * 26, cz = 260 + rc() * 80; for (let j = 0; j < 4; j++) draw(SPH, WC.cloud, C(Mx.T(cx + j * 9 - 14, cy + (j % 2) * 3, cz), Mx.S(11 + rc() * 5, 5 + rc() * 2, 7))); }
  // palmeiras, pedras e mata ao fundo
  if (o.island) { drawPalm(5.5, -5, 5.6, -.45, 3); drawPalm(8.5, -9, 6.4, .3, 8); drawPalm(-9, -8, 6.5, .35, 13); drawPalm(-12.5, -12, 7, -.3, 21); drawPalm(2, -13, 6.4, .2, 34); }
  else if (!o.noPalms) { drawPalm(-9, -3.4, 6, .4, 144); drawPalm(-16, -2.6, 6.6, -.3, 233); drawPalm(-3.4, -4.2, 5.2, .55, 3); drawPalm(3.9, -6.5, 6, -.45, 8); drawPalm(-6.5, -9, 6.5, .3, 13); drawPalm(7.5, -11, 7, -.3, 21); drawPalm(1.2, -14, 6.4, .2, 34); drawPalm(-11, -15, 7.5, .35, 55); drawPalm(12, -17, 7, -.4, 89); }
  const rk = rng(4); for (let i = 0; i < 6; i++) { const x = (i % 2 ? 1 : -1) * (4.5 + rk() * 5), z = -1.5 + rk() * 5; draw(SPH, i % 2 ? WC.rock : WC.rockD, C(Mx.T(x, sandY(z) + .05, z), Mx.Ry(rk() * 6), Mx.S(.5 + rk() * .5, .3 + rk() * .25, .45 + rk() * .4))); }
  for (let i = 0; i < 14; i++) { const x = -40 + i * 6 + rk() * 3, z = -24 - rk() * 8; draw(SPH, i % 2 ? WC.leaf : WC.leafD, C(Mx.T(x, sandY(z) + 2, z), Mx.S(4 + rk() * 2, 3 + rk() * 2, 3.5))); }
}
// tronco: o eixo é o x local do frame
function drawLog(frame, len, r, o = {}) {
  const C = Mx.chain;
  draw(CYL, WC.bark, C(frame, Mx.Rz(Math.PI / 2), Mx.S(r, len, r)));
  draw(DISC, WC.cut, C(frame, Mx.T(len / 2 + .003, 0, 0), Mx.Rz(-Math.PI / 2), Mx.S(r * .93))); draw(DISC, WC.cut, C(frame, Mx.T(-len / 2 - .003, 0, 0), Mx.Rz(Math.PI / 2), Mx.S(r * .93)));
  if (!o.clean) { draw(CYL, WC.barkD, C(frame, Mx.T(len * .22, r + .05, 0), Mx.S(.045, .16, .045))); draw(CYL, WC.barkD, C(frame, Mx.T(-len * .3, -r * .7, r * .7), Mx.Rx(-.8), Mx.S(.04, .14, .04))); }
}
// respingo: partículas balísticas a partir do instante te
function drawSplash(t, te, p, power, seed, n = 80) {
  const tau = t - te; if (tau < 0 || tau > 1.6) return; const r = rng(seed);
  for (let i = 0; i < n; i++) { const a = r() * 6.283, sp = (.5 + r() * 1.6) * power, vy = (2.2 + r() * 3.2) * power, sz = .022 + r() * .04; const x = p[0] + Math.cos(a) * sp * tau, z = p[2] + Math.sin(a) * sp * tau, y = p[1] + vy * tau - 4.9 * tau * tau; if (y < p[1] - .05) continue; draw(SPH, WC.foam, Mx.chain(Mx.T(x, y, z), Mx.S(sz * (1 - tau * .35)))); }
  for (let i = 0; i < 3; i++) { const tt = tau - i * .18; if (tt < 0) continue; const rad = .3 + 1.5 * tt * power, al = Math.max(0, .75 - tt * .65); if (al > 0) draw(TORUS(.05), M('#ffffff', { unlit: 1, a: al, nosh: 1 }), Mx.chain(Mx.T(p[0], .03 + waveH(p[0], p[2], t), p[2]), Mx.S(rad, .5, rad))); }
}
// ---------- sobreposições 2D ----------
function chip(c, txt, sub) {
  c.save(); c.textAlign = 'center'; c.font = '800 34px "DejaVu Sans", Arial, sans-serif'; const w = c.measureText(txt).width + 56;
  c.fillStyle = 'rgba(12,22,38,.72)'; c.beginPath(); c.roundRect(360 - w / 2, 70, w, 62, 31); c.fill(); c.fillStyle = '#fff'; c.fillText(txt, 360, 113);
  if (sub) { c.font = '600 24px "DejaVu Sans", Arial, sans-serif'; c.fillStyle = 'rgba(255,255,255,.92)'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6; c.fillText(sub, 360, 166); } c.restore();
}
function rewindFX(c, k, frame) { // k: intensidade 0..1
  if (k <= 0) return; const r = rng(frame * 7919 + 13); const img = c.getImageData(0, 0, 720, 1280); const tmp = document.createElement('canvas'); tmp.width = 720; tmp.height = 1280; tmp.getContext('2d').putImageData(img, 0, 0);
  for (let i = 0; i < 14; i++) { const y = Math.floor(r() * 1280), h = 8 + Math.floor(r() * 70), dx = (r() - .5) * 90 * k; c.drawImage(tmp, 0, y, 720, h, dx, y, 720, h); }
  c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = `hsla(0,0%,50%,${.55 * k})`; c.fillRect(0, 0, 720, 1280); c.restore();
  c.save(); c.fillStyle = `rgba(120,170,255,${.14 * k})`; c.fillRect(0, 0, 720, 1280);
  for (let i = 0; i < 5; i++) { const y = r() * 1280; c.fillStyle = `rgba(255,255,255,${(.25 + r() * .4) * k})`; c.fillRect(0, y, 720, 1 + r() * 3); }
  c.fillStyle = `rgba(0,0,0,${.12 * k})`; for (let y = 0; y < 1280; y += 4) c.fillRect(0, y, 720, 1);
  c.globalAlpha = k; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 8; c.font = '800 40px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center';
  if (frame % 8 < 6) { c.beginPath(); for (const x of [250, 292]) { c.moveTo(x + 34, 96); c.lineTo(x, 118); c.lineTo(x + 34, 140); } c.fill(); c.textAlign = 'left'; c.fillText('VOLTANDO', 344, 133); }
  c.restore();
}
