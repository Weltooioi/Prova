// Episódio 6 — A evolução do avião. Utilidades, cenário (campo, morro, pista) e modelos das aeronaves.
const PI = Math.PI;
const blinkF = t => { const p = ((t % 2.9) + 2.9) % 2.9; return p < .06 ? p / .06 : p < .15 ? 1 - (p - .06) / .09 : 0; };
function RW(t, a, b, c, r0) { if (t < a) return { t, tw: t, fx: 0 }; if (t < b) return { t: a - .001, tw: a, fx: E.seg(t, a, b) * .6 }; if (t < c) { const s = E.ss(E.seg(t, b, c)), x = a + (r0 - a) * s; return { t: x, tw: x, fx: 1 }; } return { t: r0, tw: r0 + (t - c), fx: 1 - E.seg(t - c, 0, .3), v: t - c }; }
function chipSet(a, b) { R.chip = [a, b]; }
const CHOP = { lean: .4, sh: 1.05, el: .2, q: 1.45 }, HAM = { q: .56 };
function chopSwing(u, t0, per) { const p = (((u - t0) / per) % 1 + 1) % 1; return u < t0 - per * .9 ? 0 : p < .12 ? 0 : p < .75 ? E.ss((p - .12) / .63) : 1 - E.inq((p - .75) / .25); }
function hamPose(a) { return { lean: .35 - .2 * a, shR: .95 + 1.3 * a, elR: .3 + .5 * a, abR: .12, shL: .35, elL: .8, abL: .1 }; }
function remap(t, pts) { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, ua] = pts[i - 1], [b, ub] = pts[i]; return ua + (ub - ua) * (t - a) / Math.max(1e-6, b - a); } return pts[pts.length - 1][1]; }
function leader(txt, p, x, y, k, col) { R.leaders.push({ txt, p, x, y, k: E.c01(k), col }); }
const lk = (u, a, b) => Math.min((u - a) * 4, (b - u) * 4);
function lineCyl(a, b, r, mat) { const d = V.sub(b, a), len = Math.hypot(d[0], d[1], d[2]), y = V.mul(d, 1 / len); let x = V.norm(V.cross(y, Math.abs(y[2]) > .9 ? [1, 0, 0] : [0, 0, 1])); const z = V.cross(x, y), m = V.mix(a, b, .5); draw(CYL, mat, Mx.mul([x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, m[0], m[1], m[2], 1], S_(r, len, r))); }
const SEAT = { hipL: 1.9, hipR: 1.9, kneeL: 1.6, kneeR: 1.6 };
const PAS1 = { jacket: M('#b03a48'), jacketD: M('#8d2c38'), pants: M('#3b3b40'), hair: M('#2b2118') }, PAS2 = { jacket: M('#2f6fb0'), jacketD: M('#255a90'), hair: M('#d9b36a'), skin: M('#c98f62', { rim: .35 }), skinD: M('#b07a50'), pants: M('#5a4632') }, PAS3 = { jacket: M('#d9a23a'), jacketD: M('#b3832c'), hair: M('#7a3b1e'), pants: M('#2d3a5a') };
const FROZEN = { skin: M('#bcd9ee', { rim: .4 }), skinD: M('#9cc3df') }, DIZZY = { skin: M('#c9d6c2', { rim: .35 }), skinD: M('#aebfa8') };

// ---------- campo ----------
const AM = { grass: M('#77b84c', { pat: [6, 1.3, 0, 0], rim: 0 }), hill: M('#69aa45', { pat: [6, 1.6, 0, 0], rim: 0 }), run: M('#cdb98f', { rim: 0 }), runL: M('#f4efe2', { rim: 0 }), trunk: M('#7a5232'), crown: M('#3f8f3a', { rim: .15 }), crownD: M('#327a34', { rim: .15 }), mount: M('#8aa3bd', { nosh: 1 }), cloud: M('#ffffff', { rim: 0, nosh: 1, norecv: 1, e: [.25, .27, .3] }),
  wood: M('#a8743f', { rim: .1 }), woodD: M('#7a5230', { rim: .1 }), cloth: M('#f1e6c8', { rim: .15 }), clothD: M('#d9cba6', { rim: .15 }), iron: M('#4a4f58', { spec: .6, gloss: 40 }), ironD: M('#2f3238', { spec: .5, gloss: 40 }), alu: M('#cfd6dc', { spec: .9, gloss: 70 }), aluD: M('#aab3bb', { spec: .9, gloss: 70 }),
  white: M('#f4f5f3', { spec: .3, gloss: 40 }), blue: M('#2f6fb0', { spec: .3 }), glass: M('#9ad4f5', { a: .34, spec: 1, gloss: 90, nosh: 1 }), dark: M('#1b2530', { spec: .8, gloss: 70 }), tire: M('#1f1f22'), red: M('#b8352b'), seat: M('#3b6fb5'), seatL: M('#6f9bd6'), beige: M('#e6dcc6'), green: M('#2fbf6b', { unlit: 1, nosh: 1, e: [.1, .6, .25] }) };
const HILL = { x: -14, rx: 10, h: 5, rz: 12 };
function groundY(x, z = 0) { const q = 1 - Math.pow((x - HILL.x) / HILL.rx, 2) - Math.pow(z / HILL.rz, 2); return q > 0 ? HILL.h * Math.sqrt(q) : 0; }
function drawTree(x, z, s = 1, seed = 1) { const y = groundY(x, z), r = rng(seed); draw(CYL, AM.trunk, C_(T_(x, y + 1.1 * s, z), S_(.22 * s, 2.2 * s, .22 * s))); for (let i = 0; i < 3; i++) draw(SPH, i % 2 ? AM.crown : AM.crownD, C_(T_(x + (r() - .5) * .9 * s, y + (2.6 + i * .7) * s, z + (r() - .5) * .9 * s), S_((1.5 - i * .25) * s, (1.25 - i * .15) * s, (1.5 - i * .25) * s))); }
function drawField(t, o = {}) {
  R.t = t; draw(PL1, AM.grass, S_(900, 1, 900)); draw(SPH, AM.hill, C_(T_(HILL.x, 0, 0), S_(HILL.rx, HILL.h, HILL.rz)));
  draw(BOX, AM.run, C_(T_(40, .012, 14), S_(190, .02, 6))); for (let i = 0; i < 30; i++) draw(BOX, AM.runL, C_(T_(-50 + i * 6.3, .026, 14), S_(2.6, .01, .18)));
  const r = rng(9); for (let i = 0; i < 26; i++) { const x = -60 + i * 9 + r() * 5, z = -16 - r() * 30; drawTree(x, z, .9 + r() * .7, 20 + i); }
  for (let i = 0; i < 8; i++) { const tx = -34 + i * 17 + r() * 4, tz = 26 + r() * 10, ts = 1 + r() * .5; if (!o.noNear) drawTree(tx, tz, ts, 60 + i); }
  if (!o.noTree) drawTree(13, 0, 1.5, 5);
  for (let i = 0; i < 7; i++) draw(SPH, AM.mount, C_(T_(-200 + i * 70 + r() * 20, -5, -230 - r() * 60), S_(60 + r() * 30, 34 + r() * 26, 40)));
  const rc = rng(5); for (let i = 0; i < 11; i++) { const cx = -220 + i * 46 + rc() * 20 + t * .7, cy = 36 + rc() * 30, cz = -140 - rc() * 90; for (let j = 0; j < 4; j++) draw(SPH, AM.cloud, C_(T_(cx + j * 9 - 14, cy + (j % 2) * 3, cz), S_(11 + rc() * 5, 5 + rc() * 2, 7))); }
}
function setSky(k) { // 0 = dia normal, 1 = muito alto (céu escuro)
  R.sun = V.norm([.38, .8, .46]); R.sunC = [1.55, 1.36, 1.08]; R.sky = [.36, .48, .72]; R.gnd = [.3, .36, .2]; R.zen = V.mix([.1, .34, .85], [.01, .04, .22], k); R.hor = V.mix([.56, .78, .99], [.25, .45, .85], k); R.fog = V.mix([.66, .83, .98], [.3, .5, .85], k); R.fogD = .0022; }
function drawBirds(t, c) { for (let i = 0; i < 3; i++) { const x = c[0] - 6 + ((t * 1.6 + i * 2.3) % 9), y = c[1] + .5 * Math.sin(t * 1.3 + i) + i * .35, z = c[2] - 1.5 * i, f = .6 * Math.sin(t * 9 + i * 2); for (const s of [1, -1]) draw(BOX, M('#2b2f3a', { nosh: 1 }), C_(T_(x, y, z), Rx_(s * (.25 + f)), T_(0, 0, s * .16), S_(.09, .015, .32))); draw(SPH, M('#2b2f3a', { nosh: 1 }), C_(T_(x, y, z), S_(.1, .04, .04))); } }
function drawDust(t, te, p, n = 7, col = '#d8cfa8') { const d = t - te; if (d < 0 || d > .9) return; for (let i = 0; i < n; i++) { const a = i * 2.4; draw(SPH, M(col, { a: Math.max(0, .5 - d * .6), nosh: 1, norecv: 1 }), C_(T_(p[0] + Math.cos(a) * (.3 + d * 1.3), p[1] + .12 + d * .5, p[2] + Math.sin(a) * (.3 + d * 1.3)), S_(.22 + d * .7))); } }
function drawBench(x, z, w = 2.6) { const y = groundY(x, z); draw(BOX, AM.wood, C_(T_(x, y + .78, z), S_(w, .08, .9))); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) draw(BOX, AM.woodD, C_(T_(x + a * (w / 2 - .1), y + .38, z + b * .35), S_(.09, .76, .09))); return y + .82; }

// ---------- asas de pano nos braços ----------
function drawArmWings(hands, k = 1) { for (const s of ['L', 'R']) { const h = hands[s]; draw(BOX, AM.cloth, C_(h, T_(0, .42, -.26 * k), S_(.018, .92, .56 * k))); draw(CYL, AM.woodD, C_(h, T_(0, .42, 0), S_(.016, .95, .016))); for (const y of [.1, .42, .74]) draw(CYL, AM.woodD, C_(h, T_(0, y, -.27 * k), Rx_(PI / 2), S_(.01, .54 * k, .01))); } }
// ---------- asa (armação de madeira coberta de tecido). Frame: x para a frente, z ao longo da asa ----------
function drawWing(fr, o = {}) { const span = o.span || 5, ch = o.chord || 1.4, fk = o.frame === undefined ? 1 : o.frame, cv = o.cover === undefined ? 1 : o.cover;
  if (fk > 0) { const n = Math.round(span / .6); for (const x of [ch * .32, -ch * .28]) draw(CYL, AM.woodD, C_(fr, T_(x, 0, 0), Rx_(PI / 2), S_(.028, span * .96 * Math.min(1, fk * 2), .028)));
    for (let i = 0; i <= n; i++) { const z = (i / n - .5) * span * .94, kk = E.c01(fk * 2 * (n + 1) - (n + 1) - i * .999 + 1); if (fk > .5 && kk > 0) draw(BOX, AM.wood, C_(fr, T_(0, .01 + (1 - kk) * .8, z), S_(ch * .9 * Math.sqrt(Math.max(.05, 1 - Math.pow(2 * z / span, 2))), .035, .035))); } }
  if (cv > 0) { draw(SPH, AM.cloth, C_(fr, T_(0, .035, 0), S_(ch * .5, .065, span * .5 * cv))); if (o.tear > 0) { const r = rng(4); for (let i = 0; i < 7; i++) { const z = (r() - .5) * span * .8, x = (r() - .5) * ch * .5; draw(SPH, M('#3a3026', { rim: 0 }), C_(fr, T_(x, .075, z), S_(.2 * o.tear * (.6 + r()), .012, .3 * o.tear * (.6 + r())))); } } } }
// ---------- planador: frame na barra onde o Jack segura ----------
function drawGlider(fr, o = {}) { const w = C_(fr, T_(0, .55, 0)); drawWing(w, { span: 5, chord: 1.4, frame: o.frame, cover: o.cover });
  draw(CYL, AM.woodD, C_(fr, Rx_(PI / 2), S_(.022, .8, .022))); for (const s of [1, -1]) lineCyl(Mx.pt(fr, [0, 0, s * .36]), Mx.pt(fr, [.25, .55, s * .7]), .018, AM.woodD), lineCyl(Mx.pt(fr, [0, 0, s * .36]), Mx.pt(fr, [-.3, .55, s * .7]), .018, AM.woodD);
  const bm = o.boom === undefined ? 0 : o.boom; if (bm > 0) draw(CYL, AM.woodD, C_(w, T_(-.3 - 1.3 * bm, -.02, 0), Rz_(PI / 2), S_(.03, 2.6 * bm, .03)));
  if (o.hs > 0) draw(SPH, AM.cloth, C_(w, T_(-2.85, .0, 0), S_(.45 * o.hs, .03, .95 * o.hs))); if (o.vf > 0) { draw(BOX, AM.clothD, C_(w, T_(-2.9, .3 * o.vf, 0), Rz_(.22), S_(.5 * o.vf, .6 * o.vf, .03))); } return w; }
const HANG = { shL: 3.0, shR: 3.0, elL: .12, elR: .12, abL: -.28, abR: -.28 };
function hangRoot(fr, swing = 0, sway = 0) { return C_(fr, Rx_(swing), Rz_(sway), T_(0, -1.0, 0), Ry_(PI / 2)); }
// ---------- avião de madeira e tecido ("Flyer"). Frame: origem no assento, x para a frente ----------
function drawProp(fr, kind, a, n = 2, len = .78) { if (!kind) return; draw(SPH, AM.woodD, C_(fr, S_(.1, .09, .09)));
  if (kind === 1) draw(BOX, AM.wood, C_(fr, Rx_(a), S_(.035, len * 2, .15)));
  else for (let i = 0; i < n; i++) draw(SPH, kind === 3 ? AM.ironD : AM.wood, C_(fr, Rx_(a + i * 2 * PI / n), T_(0, len * .55, 0), Ry_(.5), S_(.035, len * .5, .12))); }
function drawFlyer(fr, st = {}) {
  for (const s of [1, -1]) { draw(CYL, AM.woodD, C_(fr, T_(-.85, -.15, s * .28), Rz_(PI / 2), S_(.03, 5.1, .03))); for (const x of [1.0, -.6]) lineCyl(Mx.pt(fr, [x, -.15, s * .28]), Mx.pt(fr, [x * .6 + .2, 1.2, s * .9]), .022, AM.woodD); }
  for (const x of [1.6, .5, -1.2, -3.3]) draw(CYL, AM.woodD, C_(fr, T_(x, -.15, 0), Rx_(PI / 2), S_(.025, .56, .025)));
  draw(BOX, AM.wood, C_(fr, T_(-.12, -.11, 0), S_(.42, .05, .42))); draw(BOX, AM.wood, C_(fr, T_(-.36, .14, 0), Rz_(-.15), S_(.05, .5, .4)));
  drawWing(C_(fr, T_(.2, 1.25, 0)), { span: 7.2, chord: 1.4, tear: st.tear });
  const c = st.ctrl || {}, col = c.hl || {};
  draw(SPH, AM.cloth, C_(fr, T_(-3.25, .02, 0), S_(.42, .03, 1.1))); draw(BOX, col.elev ? M('#ffd23f') : AM.clothD, C_(fr, T_(-3.62, .02, 0), Rz_(c.elev || 0), T_(-.2, 0, 0), S_(.4, .03, 2.0)));
  draw(BOX, AM.cloth, C_(fr, T_(-3.2, .5, 0), S_(.5, .8, .03))); draw(BOX, col.rud ? M('#ffd23f') : AM.clothD, C_(fr, T_(-3.46, .5, 0), Ry_(c.rud || 0), T_(-.22, 0, 0), S_(.44, .76, .03)));
  for (const s of [1, -1]) draw(BOX, col.ail ? M('#ffd23f') : AM.clothD, C_(fr, T_(-.4, 1.27, s * 2.75), Rz_(s * (c.ail || 0)), T_(-.16, 0, 0), S_(.34, .03, 1.3)));
  const wh = st.wheels || 0; if (wh < 1) for (const s of [1, -1]) { draw(BOX, AM.wood, C_(fr, T_(.3, -.78, s * .5), S_(2.6, .05, .08))); for (const x of [1.1, -.5]) lineCyl(Mx.pt(fr, [x, -.15, s * .28]), Mx.pt(fr, [x, -.76, s * .5]), .022, AM.woodD); }
  if (wh > 0) { for (const s of [1, -1]) { const wz = s * (.62 + (1 - wh) * 2.2); lineCyl(Mx.pt(fr, [.7, -.15, s * .28]), Mx.pt(fr, [.7, -.5, wz]), .028, AM.ironD); draw(TORUS(.3), AM.tire, C_(fr, T_(.7, -.5, wz), Rx_(PI / 2), Ry_(st.roll || 0), S_(.22))); draw(CYL, AM.wood, C_(fr, T_(.7, -.5, wz), Rx_(PI / 2), Ry_(st.roll || 0), S_(.2, .04, .2))); draw(BOX, AM.woodD, C_(fr, T_(.7, -.5, wz), Rz_(st.roll || 0), S_(.36, .03, .05))); }
    lineCyl(Mx.pt(fr, [-3.2, -.15, 0]), Mx.pt(fr, [-3.45, -.72, 0]), .025, AM.woodD); }
  const pw = st.power, sy = .1; let nose = 1.78;
  if (pw === 'pedal') { const cr = C_(fr, T_(.5, -.05, 0)); draw(TORUS(.15), AM.iron, C_(cr, Rx_(PI / 2), S_(.14))); for (const s of [1, -1]) { const a = (st.crank || 0) + (s > 0 ? 0 : PI); draw(BOX, AM.woodD, C_(cr, T_(Math.cos(a) * .15, Math.sin(a) * .15, s * .14), S_(.12, .03, .1))); lineCyl(Mx.pt(cr, [0, 0, s * .06]), Mx.pt(cr, [Math.cos(a) * .15, Math.sin(a) * .15, s * .1]), .014, AM.iron); }
    lineCyl(Mx.pt(fr, [.5, -.05, 0]), Mx.pt(fr, [1.7, sy, 0]), .012, AM.ironD); }
  if (pw === 'steam') { const dy = st.drop || 0; draw(CYL, AM.ironD, C_(fr, T_(.75, .32 + dy, 0), Rz_(PI / 2), S_(.42, 1.3, .42))); for (const x of [.25, 1.25]) draw(TORUS(.07), AM.iron, C_(fr, T_(x, .32 + dy, 0), Rz_(PI / 2), S_(.43))); draw(CYL, AM.ironD, C_(fr, T_(1.15, .95 + dy, 0), S_(.11, .7, .11)));
    draw(BOX, M('#ff8a2a', { unlit: 1, nosh: 1, e: [1.2, .45, .05] }), C_(fr, T_(.75, -.12 + dy, 0), S_(.6, .1, .5))); draw(BOX, AM.iron, C_(fr, T_(1.5, .1 + dy, 0), S_(.2, .25, .3))); }
  if (pw === 'gas') { const dy = st.drop || 0, e = C_(fr, T_(1.1, .08 + dy, 0)); draw(BOX, AM.iron, C_(e, S_(.55, .3, .36))); for (let i = 0; i < 4; i++) draw(CYL, AM.ironD, C_(e, T_(-.2 + i * .135, .24 + .025 * Math.sin((st.t || 0) * 40 + i * 1.6) * (st.run ? 1 : 0), 0), S_(.055, .2, .055))); lineCyl(Mx.pt(e, [-.3, .05, .2]), Mx.pt(e, [-.75, -.1, .32]), .03, AM.ironD); }
  if (pw) draw(CYL, AM.iron, C_(fr, T_(1.55, sy, 0), Rz_(PI / 2), S_(.022, .5, .022)));
  drawProp(C_(fr, T_(nose, sy, 0)), st.prop || 0, st.propA || 0);
  if (st.stick !== undefined) { lineCyl(Mx.pt(fr, [.34, -.12, 0]), st.stickTo || Mx.pt(fr, [.32 + .12 * (st.stick[1] || 0), .3, .12 * (st.stick[0] || 0)]), .02, AM.ironD); for (const s of [1, -1]) draw(BOX, AM.iron, C_(fr, T_(.62 + s * .06 * (st.ped || 0), -.1, s * .16), S_(.05, .14, .1))); } }
function flyerSeat(fr) { return C_(fr, T_(-.12, .0, 0), Ry_(PI / 2)); }
// ---------- avião de alumínio. Frame: origem no centro da fuselagem ----------
const MF = { body: lathe([[0, 3.05], [.2, 3.0], [.42, 2.6], [.55, 1.6], [.56, .4], [.5, -.8], [.34, -2.1], [.13, -3.15], [0, -3.2]], 26, true), rings: [2.3, 1.4, .5, -.4, -1.3, -2.2] };
function drawMetal(fr, st = {}) { const g = (k, d = 1) => st[k] === undefined ? d : st[k], ax = C_(fr, Rz_(-PI / 2)), pn = g('panels');
  if (g('frame', 0) > 0) { for (const x of MF.rings) { const r = x > 2 ? .4 : x < -1.8 ? .32 : .52; draw(TORUS(.06), AM.ironD, C_(fr, T_(x, 0, 0), Rz_(PI / 2), S_(r))); } for (const a of [0, 1.57, 3.14, 4.71]) draw(CYL, AM.ironD, C_(fr, T_(0, Math.cos(a) * .47, Math.sin(a) * .47), Rz_(PI / 2), S_(.02, 5.2, .02))); }
  if (pn > 0) draw(MF.body, AM.alu, C_(ax, S_(1, pn > .999 ? 1 : .001 + pn, 1), T_(0, (1 - pn) * 0, 0)));
  const wg = g('wings'); if (wg > 0) { draw(SPH, AM.alu, C_(fr, T_(.35, -.32 + (1 - wg) * 2.5, 0), S_(.85, .07, 4.3 * wg))); draw(SPH, AM.alu, C_(fr, T_(-2.85, .12, 0), S_(.38, .04, 1.4 * wg))); draw(SPH, AM.alu, C_(fr, T_(-2.9, .58, 0), Rz_(.25), S_(.46, .55 * wg, .04))); }
  if (g('cowl') > 0) { draw(CYL, AM.ironD, C_(fr, T_(2.75, 0, 0), Rz_(PI / 2), S_(.5, .45, .5))); drawProp(C_(fr, T_(3.12, 0, 0)), g('prop', 3), st.propA || 0, 3, .95); }
  draw(SPH, AM.dark, C_(fr, T_(.25, .5, 0), S_(.5, .06, .3)));
  const cn = g('canopy', 0); if (cn > 0) draw(SPH, AM.glass, C_(fr, T_(.22 - (1 - cn) * 1.7, .5, 0), S_(.92, .98, .46)));
  const rt = g('gear', 0); if (rt < 1) for (const s of [1, -1]) { const h = C_(fr, T_(.55, -.36, s * 1.3), Rx_(s * 1.5 * rt)); draw(CYL, AM.ironD, C_(h, T_(0, -.33, 0), S_(.045, .66, .045))); draw(TORUS(.32), AM.tire, C_(h, T_(0, -.66, 0), Rx_(PI / 2), S_(.2))); }
  if (rt < 1) draw(TORUS(.3), AM.tire, C_(fr, T_(-2.9, -.34 + .1 * rt, 0), Rx_(PI / 2), S_(.09))); }
function metalSeat(fr) { return C_(fr, T_(.2, .12, 0), Ry_(PI / 2)); }
// ---------- avião a jato. Frame: origem no centro; cutaway mostra o interior pelo lado +z ----------
const LP = [[0, 11], [.5, 10.75], [.95, 10.0], [1.15, 8.7], [1.15, -5.5], [.8, -8.8], [.34, -10.9], [0, -11.05]];
const LN = { far: lathe(LP, 20, true, PI, 2 * PI), near: lathe(LP, 20, true, 0, PI) };
function drawJetEngine(fr, t, s = 1) { draw(CYL, AM.white, C_(fr, Rz_(PI / 2), S_(.56 * s, 1.9 * s, .56 * s))); draw(DISC, AM.dark, C_(fr, T_(.96 * s, 0, 0), Rz_(-PI / 2), S_(.47 * s))); for (let i = 0; i < 8; i++) draw(BOX, AM.aluD, C_(fr, T_(.97 * s, 0, 0), Rx_(t * 14 + i * PI / 4), T_(0, .24 * s, 0), S_(.02, .42 * s, .09 * s))); draw(CONE, AM.aluD, C_(fr, T_(-.95 * s, 0, 0), Rz_(PI / 2), S_(.3 * s, .5 * s, .3 * s))); }
function drawAirliner(fr, st = {}) { const ax = C_(fr, Rz_(-PI / 2)), cut = st.cut;
  draw(LN.far, AM.white, ax); draw(LN.near, cut ? M('#f4f5f3', { a: .16, nosh: 1 }) : AM.white, ax);
  for (const s of cut ? [-1] : [1, -1]) { for (let i = 0; i < 22; i++) draw(BOX, AM.dark, C_(fr, T_(8 - i * .62, .32, s * 1.13), S_(.26, .34, .05))); draw(BOX, AM.blue, C_(fr, T_(1.5, -.25, s * 1.14), S_(15.5, .12, .04))); }
  for (const s of [1, -1]) draw(BOX, AM.dark, C_(fr, T_(9.9, .5, s * .62), Ry_(-s * .6), S_(.7, .32, .05)));
  for (const s of [1, -1]) { if (cut && s > 0) continue; draw(SPH, AM.white, C_(fr, T_(-.4, -.55, s * 4.6), Ry_(s * .42), S_(1.5, .1, 4.2))); const e = C_(fr, T_(.9, -1.2, s * 3.4)); drawJetEngine(e, st.t || 0); draw(BOX, AM.white, C_(fr, T_(.6, -.8, s * 3.4), S_(1.1, .5, .12))); draw(SPH, AM.white, C_(fr, T_(-9.9, .45, s * 1.5), Ry_(s * .4), S_(.8, .06, 1.6))); }
  draw(SPH, AM.blue, C_(fr, T_(-9.5, 1.9, 0), Rz_(.5), S_(1.25, 1.5, .08)));
  const gr = st.gear === undefined ? 1 : st.gear; if (gr < 1) { for (const [x, z] of [[7.6, 0], [-.6, 1.5], [-.6, -1.5]]) { if (cut && z > 0) continue; draw(CYL, AM.ironD, C_(fr, T_(x, -1.6 + .5 * gr, z), S_(.08, 1.0 * (1 - gr) + .05, .08))); draw(TORUS(.35), AM.tire, C_(fr, T_(x, -2.1 + 1.0 * gr, z), Rx_(PI / 2), S_(.3 * (1 - gr * .6)))); } }
  if (cut) drawCabin(fr, st); }
function drawCabin(fr, st) { const t = st.t || 0;
  draw(BOX, M('#8d99a8'), C_(fr, T_(.6, -.38, 0), S_(18.2, .06, 2.1))); draw(BOX, M('#59626f'), C_(fr, T_(.6, -.98, 0), S_(15.5, .05, 1.5)));
  for (let i = 0; i < 9; i++) { const x = 6.4 - i * 1.3; for (const z of [-.72, -.26, .26, .72]) { draw(BOX, AM.seat, C_(fr, T_(x, -.17, z), S_(.48, .13, .4))); draw(BOX, AM.seat, C_(fr, T_(x - .22, .16, z), Rz_(-.1), S_(.1, .62, .4))); draw(BOX, AM.seatL, C_(fr, T_(x - .25, .5, z), S_(.1, .16, .3))); draw(BOX, M('#c9cdd2', { spec: .8 }), C_(fr, T_(x + .02, -.09, z), S_(.3, .02, .42))); } }
  for (const z of [-.78]) draw(BOX, AM.white, C_(fr, T_(1.2, .84, z), S_(12, .2, .34)));
  draw(BOX, AM.beige, C_(fr, T_(-5.7, .28, -.45), S_(1.1, 1.3, 1.1))); draw(BOX, M('#c8b99a'), C_(fr, T_(-5.7, .2, .11), S_(.6, 1.1, .03))); draw(BOX, AM.blue, C_(fr, T_(-5.7, .86, .13), S_(.26, .16, .02)));
  draw(BOX, AM.aluD, C_(fr, T_(8.3, .22, -.5), S_(1.0, 1.2, 1.0))); draw(BOX, AM.alu, C_(fr, T_(8.3, -.02, .25), S_(.5, .7, .4))); draw(CYL, AM.red, C_(fr, T_(8.3, .42, .25), S_(.08, .16, .08))); for (const y of [.5, .1]) draw(BOX, AM.dark, C_(fr, T_(8.3, y, .01), S_(.8, .3, .02)));
  const r = rng(12), cols = ['#c0392b', '#2e86c1', '#27ae60', '#e67e22', '#8e44ad', '#f1c40f']; for (let i = 0; i < 9; i++) draw(BOX, M(cols[i % 6]), C_(fr, T_(5 - i * 1.15, -.74, (r() - .5) * .6), Ry_((r() - .5) * .5), S_(.7, .4 + r() * .12, .3)));
  draw(BOX, AM.white, C_(fr, T_(.5, .1, -1.12), S_(.7, 1.3, .04))); draw(BOX, AM.green, C_(fr, T_(.5, .86, -1.08), S_(.5, .14, .03)));
  draw(BOX, M('#4a5563'), C_(fr, T_(9.2, .1, 0), S_(.06, 1.2, 2.0))); }
function cabinSeat(fr, row, z) { return C_(fr, T_(6.4 - row * 1.3 - .05, -.02, z), Ry_(PI / 2)); }
// ---------- motor a jato em corte (diagrama) ----------
function drawJetCut(fr, t) { const far = lathe; draw(JC2.shell, AM.white, C_(fr, Rz_(-PI / 2)));
  for (let i = 0; i < 10; i++) draw(BOX, AM.aluD, C_(fr, T_(1.75, 0, 0), Rx_(t * 9 + i * PI / 5), T_(0, .5, 0), Ry_(.5), S_(.03, .9, .2))); draw(SPH, AM.alu, C_(fr, T_(1.95, 0, 0), S_(.35, .22, .22)));
  for (let i = 0; i < 4; i++) { const r = .78 - i * .11; draw(CYL, i % 2 ? AM.alu : AM.aluD, C_(fr, T_(1.1 - i * .34, 0, 0), Rz_(PI / 2), S_(r, .12, r))); for (let k = 0; k < 10; k++) draw(BOX, AM.iron, C_(fr, T_(1.1 - i * .34, 0, 0), Rx_(t * 9 + k * PI / 5 + i), T_(0, r, 0), S_(.1, .08, .05))); }
  draw(CYL, AM.iron, C_(fr, T_(.1, 0, 0), Rz_(PI / 2), S_(.07, 3.6, .07)));
  const f = .75 + .25 * Math.sin(t * 31) * Math.sin(t * 17); draw(SPH, M('#e8501a', { unlit: 1, nosh: 1 }), C_(fr, T_(-.75, 0, -.12), S_(.5, .42 + .04 * f, .3))); draw(SPH, M('#ff9a2a', { unlit: 1, nosh: 1 }), C_(fr, T_(-.8, 0, 0), S_(.38 + .04 * f, .3, .3))); draw(SPH, M('#ffe27a', { unlit: 1, nosh: 1 }), C_(fr, T_(-.85, 0, .12), S_(.22 + .05 * f, .17, .22)));
  draw(CYL, AM.aluD, C_(fr, T_(-1.4, 0, 0), Rz_(PI / 2), S_(.6, .1, .6))); for (let k = 0; k < 10; k++) draw(BOX, AM.iron, C_(fr, T_(-1.4, 0, 0), Rx_(t * 9 + k * PI / 5), T_(0, .6, 0), S_(.08, .1, .05)));
  draw(CONE, AM.alu, C_(fr, T_(-1.6, 0, 0), Rz_(PI / 2), S_(.42, .9, .42)));
  const r = rng(8); for (let i = 0; i < 26; i++) { const ph = (t * .55 + r()) % 1, ang = r() * 6.283, x = 3.6 - ph * 8.4, hot = x < -.7, rad = (x > 1.9 ? .75 : x > -.3 ? .75 - (1.9 - x) * .2 : .45) * (.35 + .6 * r()); draw(SPH, M(hot ? '#ffb347' : '#9fdcff', { unlit: 1, nosh: 1, a: .9 }), C_(fr, T_(hot ? x * 1.5 + .35 : x, Math.cos(ang) * rad, Math.abs(Math.sin(ang)) * rad * .5), S_(hot ? .07 : .055))); } }
const JC2 = { shell: lathe([[.98, 2.3], [1.02, 2.0], [1.0, .6], [.8, -.9], [.66, -2.0], [.6, -2.1], [.56, -2.0], [.7, -.9], [.9, .6], [.92, 2.0], [.9, 2.3]], 22, false, PI, 2 * PI) };
