// Cascos, embarcações, ferramentas e objetos de cena.
const C_ = Mx.chain, T_ = Mx.T, S_ = Mx.S, Rx_ = Mx.Rx, Ry_ = Mx.Ry, Rz_ = Mx.Rz;
function HULL(o) { const f = (s, ph, side) => { const as = Math.abs(s), p = s > 0 ? o.pb : o.ps; const b = o.W / 2 * Math.pow(Math.max(0, 1 - Math.pow(as, p)), o.q); const top = (o.rise || 0) * as * as * as; const D = o.D * (1 - (o.kr || 0) * as * as * as);
  return [s * o.L / 2, top - D * Math.pow(Math.max(0, Math.cos(ph)), o.e), side * b * Math.pow(Math.max(0, Math.sin(ph)), o.e)]; }; f.o = o; return f; }
function hullPatch(f, s0, s1, p0, p1, ns, np, sides = [1, -1]) {
  const P = [], N = [], I = []; let base = 0;
  for (const side of sides) {
    for (let i = 0; i <= ns; i++) for (let j = 0; j <= np; j++) { const s = s0 + (s1 - s0) * i / ns, ph = p0 + (p1 - p0) * j / np; const p = f(s, ph, side); P.push(...p);
      const a = V.sub(f(Math.min(.999, s + .004), ph, side), f(Math.max(-.999, s - .004), ph, side)), b = V.sub(f(s, Math.min(1.5707, ph + .01), side), f(s, Math.max(0, ph - .01), side)); let n = V.norm(V.cross(a, b)); if (n[1] * -.35 + n[2] * side < 0) n = V.mul(n, -1); N.push(...n); }
    for (let i = 0; i < ns; i++) for (let j = 0; j < np; j++) { const a = base + i * (np + 1) + j, b = a + np + 1; I.push(a, b, a + 1, a + 1, b, b + 1); }
    base += (ns + 1) * (np + 1);
  }
  return mkGeo(P, N, I);
}
function deckGeo(f, yoff, inset, s0 = -1, s1 = 1) { const P = [], N = [], I = [], n = 30; for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n, p = f(s, 1.5707, 1); P.push(p[0], p[1] + yoff, p[2] * inset, p[0], p[1] + yoff, -p[2] * inset); N.push(0, 1, 0, 0, 1, 0); } for (let i = 0; i < n; i++) { const a = i * 2; I.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } return mkGeo(P, N, I); }
const SAIL = (() => { const P = [], N = [], I = [], n = 12; const f = (u, v) => [(1 - 4 * u * u) * Math.sin(Math.PI * (v * .85 + .1)), -v, u]; for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const u = i / n - .5, v = j / n; P.push(...f(u, v)); const a = V.sub(f(u + .01, v), f(u - .01, v)), b = V.sub(f(u, v + .01), f(u, v - .01)); let nn = V.norm(V.cross(a, b)); if (nn[0] < 0) nn = V.mul(nn, -1); N.push(...nn); } for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const a = i * (n + 1) + j, b = a + n + 1; I.push(a, b, a + 1, a + 1, b, b + 1); } return mkGeo(P, N, I); })();
const BM = {
  wood: M('#a8743f', { pat: [5, 9, .86, 0], rim: .1 }), woodL: M('#c79a5e', { rim: .1 }), woodD: M('#7a5230', { rim: .1 }), woodDD: M('#5b3a22', { rim: .05 }), plank1: M('#b07a44', { rim: .1 }), plank2: M('#9a6836', { rim: .1 }),
  rope: M('#3d2a18'), cloth: M('#f3ead2', { rim: .1 }), clothS: M('#e2d5b3', { rim: .1 }), iron: M('#4a4f58', { spec: .6, gloss: 40 }), ironD: M('#33363d', { spec: .5, gloss: 40 }), steel: M('#5b6470', { spec: .5, gloss: 50 }), steel2: M('#515a66', { spec: .5, gloss: 50 }),
  red: M('#9d2f26', { spec: .2 }), rivet: M('#c9cdd2', { spec: .9, gloss: 60 }), white: M('#f2f2ee', { rim: .1 }), navy: M('#1d3557', { spec: .2 }), glassW: M('#12202e', { spec: 1, gloss: 80 }), black: M('#1d1d1f', { spec: .2 }), stone: M('#7f7b76'), stoneD: M('#5c5955'),
  smoke: [.85, .7, .55, .4].map(a => M('#c9c9c9', { a: a * .55, nosh: 1, norecv: 1 })), foamA: M('#ffffff', { unlit: 1, a: .55, nosh: 1 }), windA: M('#ffffff', { unlit: 1, a: .45, nosh: 1 }), sweat: M('#8fd3ff', { unlit: 1, nosh: 1 }), spark: M('#ffb347', { unlit: 1, nosh: 1, e: [1.5, .7, .1] }),
};
// ---------- ferramentas (presas à mão; o cabo segue o z local) ----------
function toolFrame(hand, q) { return C_(hand, T_(0, -.02, .02), Rx_(q)); }
function drawAxe(hand, q = 1.7) { const f = toolFrame(hand, q); draw(CYL, BM.woodD, C_(f, T_(0, 0, .2), Rx_(Math.PI / 2), S_(.016, .5, .016))); draw(BOX, BM.iron, C_(f, T_(0, -.05, .42), S_(.025, .15, .1))); draw(BOX, BM.rivet, C_(f, T_(0, -.125, .42), S_(.012, .02, .11))); }
function drawHammer(hand, q = 1.5) { const f = toolFrame(hand, q); draw(CYL, BM.woodD, C_(f, T_(0, 0, .14), Rx_(Math.PI / 2), S_(.014, .36, .014))); draw(BOX, BM.iron, C_(f, T_(0, 0, .31), S_(.05, .13, .06))); return C_(f, T_(0, -.07, .31)); }
function drawPaddle(hand, q = 2.6, len = 1.25) { const f = toolFrame(hand, q); draw(CYL, BM.woodL, C_(f, T_(0, 0, len / 2 - .2), Rx_(Math.PI / 2), S_(.018, len, .018))); draw(SPH, BM.woodL, C_(f, T_(0, 0, len - .08), S_(.085, .016, .2))); }
function drawTorch(hand, t) { const f = toolFrame(hand, 1.4); draw(CYL, BM.black, C_(f, T_(0, 0, .12), Rx_(Math.PI / 2), S_(.016, .3, .016))); const k = .7 + .3 * Math.sin(t * 61) * Math.sin(t * 37); draw(SPH, M('#bfe6ff', { unlit: 1, nosh: 1, e: [2 * k, 2.4 * k, 3 * k] }), C_(f, T_(0, 0, .3), S_(.035 + .02 * k))); return Mx.pt(C_(f, T_(0, 0, .3)), [0, 0, 0]); }
// ---------- partículas ----------
function drawSparks(t, te, p, seed, n = 16, pw = 1) { const tau = t - te; if (tau < 0 || tau > .55) return; const r = rng(seed); for (let i = 0; i < n; i++) { const a = r() * 6.283, sp = (.6 + r() * 1.8) * pw, vy = (.8 + r() * 2.4) * pw; draw(SPH, BM.spark, C_(T_(p[0] + Math.cos(a) * sp * tau, p[1] + vy * tau - 4.9 * tau * tau, p[2] + Math.sin(a) * sp * tau), S_(.02 * (1 - tau / .55) + .006))); } }
function drawChips(t, te, p, seed, n = 7) { const tau = t - te; if (tau < 0 || tau > .7) return; const r = rng(seed); for (let i = 0; i < n; i++) { const a = r() * 6.283, sp = .5 + r() * 1.3, vy = 1.5 + r() * 1.8; const y = p[1] + vy * tau - 4.9 * tau * tau; draw(BOX, BM.woodL, C_(T_(p[0] + Math.cos(a) * sp * tau, y, p[2] + Math.sin(a) * sp * tau), Rx_(tau * 9 + i), Ry_(i), S_(.07, .015, .04))); } }
function drawSmoke(t, p, rate = 2.2, rise = 1.6, drift = [-.6, 0]) { for (let i = 0; i < 9; i++) { const age = ((t * rate + i) % 9) / rate; const k = age / (9 / rate); draw(SPH, BM.smoke[Math.min(3, Math.floor(k * 4))], C_(T_(p[0] + drift[0] * age + .15 * Math.sin(i * 2.1 + age), p[1] + rise * age, p[2] + drift[1] * age + .15 * Math.cos(i * 1.7)), S_(.28 + .5 * k))); } }
function drawWind(t, c, dir, n = 10, area = 7, seed = 2) { const r = rng(seed), ya = Math.atan2(dir[0], dir[1]); for (let i = 0; i < n; i++) { const ox = (r() - .5) * area, oy = .5 + r() * 2.6, ph = r(), sp = 5 + r() * 3, len = 1 + r() * 1.2; const d = ((t * sp / area + ph) % 1 - .5) * area * 1.6; draw(BOX, BM.windA, C_(T_(c[0] + dir[0] * d + dir[1] * ox, c[1] + oy, c[2] + dir[1] * d - dir[0] * ox), Ry_(ya), S_(.012, .012, len))); } }
function drawWake(frame, len, w, x0 = 1.8, y0 = -.19, n = 7) { for (let i = 0; i < n; i++) { const k = i / n; draw(SPH, M('#ffffff', { unlit: 1, a: .5 * (1 - k), nosh: 1 }), C_(frame, T_(-x0 - len * (.1 + k), y0, 0), S_(len * .16, .012, w * (.5 + k * .9)))); } }
// ---------- jangada ----------
const RAFT = { n: 5, r: .17, len: 2.4, gap: .36 };
function drawRaft(frame, o = {}) { const k = o.logs === undefined ? RAFT.n : o.logs, rope = o.rope === undefined ? 1 : o.rope;
  for (let i = 0; i < Math.min(RAFT.n, Math.ceil(k)); i++) drawLog(C_(frame, T_(0, 0, (i - 2) * RAFT.gap), Rx_(i * 1.3)), RAFT.len, RAFT.r, { clean: 1 });
  for (const x of [-.75, .75]) for (let i = 0; i < RAFT.n; i++) if (rope * 10 > (x > 0 ? 5 : 0) + i + .5) draw(TORUS(.12), BM.rope, C_(frame, T_(x, 0, (i - 2) * RAFT.gap), Rz_(Math.PI / 2), S_(RAFT.r * 1.06, .22, RAFT.r * 1.06))); }
// ---------- canoa ----------
const CAN = { f: HULL({ L: 3.4, W: .62, D: .34, pb: 2.2, ps: 2.2, q: .6, e: .8, rise: .08, kr: .25 }) }; CAN.g = hullPatch(CAN.f, -1, 1, 0, 1.5707, 28, 9); CAN.gi = hullPatch(HULL(Object.assign({}, CAN.f.o, { W: .55, D: .3, L: 3.3 })), -1, 1, 0, 1.5707, 28, 9); CAN.lid = deckGeo(CAN.f, -.004, .985); const MASK = { c: [0, 0, 0], mask: 1 };
function drawCanoe(frame, o = {}) { draw(CAN.g, BM.wood, frame); draw(CAN.gi, BM.woodDD, C_(frame, T_(0, .004, 0))); if (o.afloat) draw(CAN.lid, MASK, frame);
  if (o.fill > 0) { const h = 1.5 * o.fill; draw(SPH, BM.woodL, C_(frame, T_(-1.5 + h, -.015, 0), S_(h, .035, .25))); }
  if (o.mast !== undefined) { const m = C_(frame, T_(.35, -.3, 0), Rz_(-(1 - o.mast) * 1.45)); draw(CYL, BM.woodD, C_(m, T_(0, 1.2, 0), S_(.032, 2.4, .032)));
    if (o.mast > .98) { draw(CYL, BM.woodD, C_(m, T_(0, 2.25, 0), Rx_(Math.PI / 2), S_(.024, 1.5, .024))); const u = o.sail || 0; if (u > 0) draw(SAIL, BM.cloth, C_(m, T_(.03, 2.22, 0), S_(.32 * (o.billow || 0) + .02, 1.55 * u, 1.4))); } } }
// ---------- navio de madeira ----------
const WS = { f: HULL({ L: 7.6, W: 2.5, D: 1.8, pb: 2.4, ps: 3.5, q: .55, e: .75, rise: .55, kr: .15 }), ribs: [], strk: [] };
WS.fi = HULL(Object.assign({}, WS.f.o, { W: 2.38, D: 1.74 })); for (let i = 0; i < 9; i++) { const s = -.8 + i * .2; WS.ribs.push(hullPatch(WS.fi, s - .012, s + .012, 0, 1.5707, 1, 12)); }
for (let j = 0; j < 6; j++) WS.strk.push(hullPatch(WS.f, -1, 1, j * 1.5707 / 6, (j + 1) * 1.5707 / 6, 26, 3)); WS.deck = deckGeo(WS.f, -.14, .96);
function drawWoodShip(frame, st = {}) { const g = (k, d = 1) => st[k] === undefined ? d : st[k]; const L = WS.f.o.L, D = WS.f.o.D;
  const kk = g('keel'); if (kk > 0) { draw(BOX, BM.woodDD, C_(frame, T_(-(1 - kk) * 9, -D - .03, 0), S_(L * .93, .18, .16))); const pp = g('posts'); if (pp > 0) { draw(BOX, BM.woodDD, C_(frame, T_(L / 2 - .3, -D + 1.25 * pp, 0), Rz_(-.42), S_(.16, 2.6 * pp, .15))); draw(BOX, BM.woodDD, C_(frame, T_(-L / 2 + .22, -D + 1.1 * pp, 0), Rz_(.2), S_(.16, 2.2 * pp, .15))); } }
  const rb = g('ribs') * 9; for (let i = 0; i < 9; i++) if (rb > i) { const k = E.back(E.c01(rb - i)); draw(WS.ribs[i], BM.woodD, C_(frame, T_(0, (1 - k) * 2.2, 0))); }
  const pl = g('planks') * 6; for (let j = 0; j < 6; j++) if (pl > j) { const k = E.ss(E.c01(pl - j)); const off = st.crack && j === 3 ? st.crack : 0; draw(WS.strk[j], j % 2 ? BM.plank1 : BM.plank2, C_(frame, T_(-(1 - k) * 8, 0, 0), T_(0, -off * .5, 0))); }
  const dk = g('deck'); if (dk > 0) draw(WS.deck, BM.woodL, C_(frame, S_(dk, 1, 1)));
  const ms = g('masts'); if (ms > 0) for (const x of [1.25, -1.45]) { const m = C_(frame, T_(x, -.14, 0)); const h = (x > 0 ? 4.4 : 3.8) * ms; draw(CYL, BM.woodD, C_(m, T_(0, h / 2, 0), S_(.075, h, .075)));
    if (ms > .98) { draw(CYL, BM.woodD, C_(m, T_(0, h - .5, 0), Rx_(Math.PI / 2), S_(.045, 2.7, .045))); const u = g('sails'); if (u > 0) draw(SAIL, x > 0 ? BM.cloth : BM.clothS, C_(m, T_(.05, h - .55, 0), S_(.5 * g('billow', .8) + .03, (h - 1.5) * u, 2.5))); } }
  if (g('cargo', 0) > 0) { for (const [x, z, c] of [[.25, .45, '#b5863f'], [.25, -.4, '#9c6f33'], [-.45, .1, '#b5863f']]) draw(BOX, M(c, { pat: [4, 6, .8, 0] }), C_(frame, T_(x, .12, z), S_(.5, .5, .5))); for (const [x, z] of [[-.45, -.6], [2.1, 0], [-.3, .75]]) { draw(CYL, BM.woodD, C_(frame, T_(x, .1, z), S_(.2, .46, .2))); draw(TORUS(.08), BM.ironD, C_(frame, T_(x, .2, z), S_(.2))); } }
  if (g('wheel', 0) > 0) { draw(BOX, BM.woodDD, C_(frame, T_(-2.55, .2, 0), S_(.12, .7, .12))); draw(TORUS(.1), BM.woodD, C_(frame, T_(-2.45, .55, 0), Rz_(Math.PI / 2), Ry_(st.wheelA || 0), S_(.26))); } }
// ---------- navio de aço ----------
const SS = { f: HULL({ L: 11, W: 2.9, D: 2.5, pb: 2.6, ps: 4, q: .5, e: .55, rise: .35, kr: .05 }), ribs: [], pl: [] };
SS.fi = HULL(Object.assign({}, SS.f.o, { W: 2.78, D: 2.44 })); for (let i = 0; i < 11; i++) { const s = -.85 + i * .17; SS.ribs.push(hullPatch(SS.fi, s - .01, s + .01, 0, 1.5707, 1, 12)); }
const SSN = { st: 4, sg: 6 }; for (let j = 0; j < SSN.st; j++) for (let i = 0; i < SSN.sg; i++) SS.pl.push(hullPatch(SS.f, -1 + i * 2 / SSN.sg, -1 + (i + 1) * 2 / SSN.sg, j * 1.5707 / SSN.st, (j + 1) * 1.5707 / SSN.st, 6, 4)); SS.deck = deckGeo(SS.f, -.1, .97);
SS.riv = []; for (let i = 1; i < SSN.sg; i++) for (let k = 0; k < 9; k++) SS.riv.push(SS.f(-1 + i * 2 / SSN.sg, .2 + k * .16, 1)); for (let k = 0; k < 22; k++) SS.riv.push(SS.f(-.9 + k * .085, 1.5707 / 2, 1));
function drawSteelShip(frame, st = {}) { const g = (k, d = 1) => st[k] === undefined ? d : st[k]; const L = SS.f.o.L, D = SS.f.o.D;
  if (g('ribs') > 0) { draw(BOX, BM.ironD, C_(frame, T_(0, -D - .02, 0), S_(L * .95, .14, .14))); for (let i = 0; i < 11; i++) draw(SS.ribs[i], BM.ironD, frame); }
  const n = SSN.st * SSN.sg, pl = g('plates') * n; for (let q = 0; q < n; q++) if (pl > q) { const j = Math.floor(q / SSN.sg), i = q % SSN.sg, k = E.ss(E.c01(pl - q)); draw(SS.pl[j * SSN.sg + i], j === 0 ? BM.red : (i + j) % 2 ? BM.steel : BM.steel2, C_(frame, T_(0, (1 - k) * 1.2, 0), S_(1, 1, 1 + (1 - k) * .9))); }
  const rv = g('rivets') * SS.riv.length; for (let q = 0; q < SS.riv.length; q++) if (rv > q) { const p = SS.riv[q]; draw(SPH, BM.rivet, C_(frame, T_(p[0], p[1], p[2] + .012), S_(.032))); }
  if (g('deck') > 0) draw(SS.deck, BM.steel, frame);
  const ey = g('engine', -99); if (ey > -90) { const e = C_(frame, T_(-1.6, ey, 0)); draw(BOX, M('#3f6b4e', { spec: .3 }), C_(e, S_(1.7, .8, 1.1))); for (let i = 0; i < 3; i++) { const h = .25 + .14 * Math.sin((st.t || 0) * 9 + i * 2.1); draw(CYL, BM.rivet, C_(e, T_(-.5 + i * .5, .4 + h / 2 + .15, 0), S_(.16, h + .3, .16))); } draw(TORUS(.12), BM.ironD, C_(e, T_(.95, 0, 0), Rz_(Math.PI / 2), Ry_((st.t || 0) * 7), S_(.42))); draw(BOX, BM.ironD, C_(e, T_(.95, 0, 0), Rx_((st.t || 0) * 7), S_(.06, .8, .08))); }
  const fn = g('funnel', 0); if (fn > 0) { draw(BOX, BM.white, C_(frame, T_(-1.2, .55 + (1 - fn) * 4, 0), S_(2.6, 1.3, 1.9))); draw(BOX, BM.glassW, C_(frame, T_(.12, .8 + (1 - fn) * 4, 0), S_(.03, .35, 1.5))); draw(CYL, BM.black, C_(frame, T_(-1.6, 2.2 + (1 - fn) * 4, 0), S_(.38, 2, .38))); draw(CYL, BM.red, C_(frame, T_(-1.6, 2.7 + (1 - fn) * 4, 0), S_(.39, .4, .39)));
    for (const x of [3.2, -4.2]) draw(CYL, BM.ironD, C_(frame, T_(x, 1.6, 0), S_(.05, 3.4, .05))); } }
// ---------- cargueiro moderno ----------
const CG = { f: HULL({ L: 44, W: 7, D: 5.5, pb: 3, ps: 6, q: .4, e: .4, rise: .6, kr: 0 }) };
CG.lo = [1, -1].map(sd => hullPatch(CG.f, -1, 1, 0, .95, 40, 8, [sd])); CG.hi = [1, -1].map(sd => hullPatch(CG.f, -1, 1, .95, 1.5707, 40, 5, [sd])); CG.deck = deckGeo(CG.f, -.05, .98);
const CCOL = ['#c0392b', '#2e86c1', '#27ae60', '#e67e22', '#8e44ad', '#f1c40f', '#16a085', '#d35400'];
function drawCargo(frame, o = {}) { const t = o.t || 0, D = 5.5; const side = o.cutSide || 0;
  for (const i of [0, 1]) { const cut = o.cut && (i === 0 ? 1 : -1) === side; draw(CG.lo[i], cut ? M('#9d2f26', { a: .22, nosh: 1 }) : BM.red, frame); draw(CG.hi[i], cut ? M('#1d3557', { a: .22, nosh: 1 }) : BM.navy, frame); }
  draw(CG.deck, M('#6b3a34'), frame);
  const sx = -15.5; draw(BOX, BM.white, C_(frame, T_(sx, 2, 0), S_(7, 4, 6.2))); draw(BOX, BM.white, C_(frame, T_(sx, 5, 0), S_(5.5, 2, 5.4))); draw(BOX, BM.white, C_(frame, T_(sx + .4, 6.9, 0), S_(3.6, 1.8, 6.6)));
  draw(BOX, BM.glassW, C_(frame, T_(sx + 2.22, 7.1, 0), S_(.05, .8, 6.2))); for (const z of [3.31, -3.31]) draw(BOX, BM.glassW, C_(frame, T_(sx + .6, 7.1, z), S_(2.6, .8, .04)));
  for (const y of [1.6, 3.2, 5.1]) draw(BOX, BM.glassW, C_(frame, T_(sx + 3.51 - (y > 4 ? .75 : 0), y, 0), S_(.04, .45, 5)));
  draw(CYL, M('#e67e22'), C_(frame, T_(sx - 2.2, 6.2, 0), S_(.9, 4.4, 1.2))); draw(CYL, BM.black, C_(frame, T_(sx - 2.2, 8.5, 0), S_(.92, .6, 1.22)));
  draw(CYL, BM.white, C_(frame, T_(sx + .6, 8.6, 0), S_(.09, 1.7, .09))); draw(BOX, BM.white, C_(frame, T_(sx + .6, 9.4, 0), Ry_(t * 3.2), S_(1.9, .16, .22))); draw(SPH, BM.white, C_(frame, T_(sx - .6, 8.15, 1.6), S_(.5)));
  const r = rng(77); for (let ix = 0; ix < 5; ix++) for (let iz = 0; iz < 3; iz++) { const h = 1 + Math.floor(r() * 2.99); for (let iy = 0; iy < h; iy++) draw(BOX, M(CCOL[Math.floor(r() * 8)], { pat: [5, 2.2, .86, 0] }), C_(frame, T_(-8.5 + ix * 5.9, 1.05 + iy * 2.25, (iz - 1) * 2.12), S_(5.6, 2.2, 2.05))); }
  if (o.cut) { for (let i = 0; i < 6; i++) draw(BOX, M('#dfe6ee', { e: [.1, .14, .2] }), C_(frame, T_(-9 + i * 5.6, -2.6, 0), S_(.14, 5.2, 6.3)));
    const e = C_(frame, T_(-14.2, -3.2, 0)); draw(BOX, M('#e67e22', { spec: .3 }), C_(e, S_(4.4, 2.6, 3))); for (let i = 0; i < 4; i++) { const h = .5 + .28 * Math.sin(t * 9 + i * 1.6); draw(CYL, BM.rivet, C_(e, T_(-1.5 + i, 1.3 + h / 2, 0), S_(.34, h + .5, .34))); }
    draw(CYL, BM.rivet, C_(frame, T_(-19, -4.1, 0), Rz_(Math.PI / 2), S_(.16, 6, .16))); }
  const p = C_(frame, T_(-22.3, -4.1, 0), Rx_(t * 8)); draw(SPH, M('#d8a03a', { spec: .9, gloss: 50 }), C_(p, S_(.45, .4, .4))); for (let i = 0; i < 4; i++) draw(SPH, M('#d8a03a', { spec: .9, gloss: 50 }), C_(p, Rx_(i * Math.PI / 2), T_(0, 1.05, 0), Ry_(.5), S_(.1, .95, .55))); }
// ---------- forja, bigorna, mesa e tanque ----------
function drawForge(x, z) { const y = sandY(z); draw(BOX, BM.stone, C_(T_(x, y + .6, z), S_(1.3, 1.3, 1.1))); draw(BOX, BM.stoneD, C_(T_(x, y + 1.6, z), S_(.6, 1, .6))); draw(BOX, M('#ff8a2a', { unlit: 1, nosh: 1, e: [1.2, .45, .05] }), C_(T_(x, y + .55, z + .56), S_(.7, .45, .02))); }
function drawAnvil(x, z) { const y = sandY(z); draw(CYL, BM.woodD, C_(T_(x, y + .28, z), S_(.3, .56, .3))); draw(BOX, BM.ironD, C_(T_(x, y + .64, z), S_(.3, .16, .2))); draw(BOX, BM.ironD, C_(T_(x, y + .78, z), S_(.62, .13, .24))); return y + .845; }
function drawTable(x, z, w = 1.5, d = .8, h = .82) { const y = sandY(z); draw(BOX, BM.woodL, C_(T_(x, y + h, z), S_(w, .07, d))); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) draw(BOX, BM.woodD, C_(T_(x + a * (w / 2 - .08), y + h / 2, z + b * (d / 2 - .08)), S_(.08, h, .08))); return y + h + .035; }
function drawTank(x, y, z, level) { const w = 1.0, h = .62, d = .5, g = M('#d9f1ff', { a: .16, nosh: 1, spec: .6 }); draw(BOX, BM.ironD, C_(T_(x, y + .012, z), S_(w + .04, .024, d + .04)));
  draw(BOX, M('#2f8fd0', { a: .5, nosh: 1 }), C_(T_(x, y + .024 + level / 2, z), S_(w - .02, level, d - .02)));
  for (const [dx, dz, sx, sz] of [[0, d / 2, w, .012], [0, -d / 2, w, .012], [w / 2, 0, .012, d], [-w / 2, 0, .012, d]]) draw(BOX, g, C_(T_(x + dx, y + .024 + h / 2, z + dz), S_(sx, h, sz)));
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) draw(BOX, BM.ironD, C_(T_(x + dx * w / 2, y + .024 + h / 2, z + dz * d / 2), S_(.018, h, .018))); return { top: y + .024 + level }; }
const MINI = { f: HULL({ L: .5, W: .26, D: .13, pb: 2.4, ps: 3, q: .55, e: .7, rise: .02, kr: .1 }) }; MINI.g = hullPatch(MINI.f, -1, 1, 0, 1.5707, 14, 6);
