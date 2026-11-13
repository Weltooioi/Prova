// Episódio 7 — A evolução do túnel de rodovia. Cenário e objetos.
// Mundo: a estrada vem de +z e para no paredão da montanha, que fica em z = 0 virado para +z.
// O túnel entra na montanha no sentido -z; o eixo dele fica em x = 0, altura TUN.cy, e a pista em y = 0.
const TUN = { cy: 1.5, R: 3.0, L: 80 };
const TM = {
  rock: M('#8d877f', { pat: [6, 1.1, 0, 0], rim: .08 }), rockD: M('#6d6862', { rim: .08 }), rockL: M('#a7a097', { rim: .08 }),
  wallR: M('#97836b', { rim: .05, nosh: 1 }), floorR: M('#857462', { pat: [6, 1.8, 0, 0], rim: 0 }), wallO: M('#5d5349', { rim: 0, nosh: 1 }),
  dirt: M('#bca27a', { pat: [6, 1.3, 0, 0], rim: 0 }), asphalt: M('#3d3f44', { pat: [6, 2.2, 0, 0], rim: 0 }), line: M('#f1eee2', { rim: 0 }), lineY: M('#f2c230', { rim: 0 }),
  conc: M('#bdb9b0', { rim: 0, nosh: 1 }), concF: M('#b3afa6', { rim: .05 }), seam: M('#77736c', { nosh: 1 }), gutter: M('#2d2f33', { nosh: 1 }), curb: M('#cfcbc2', { rim: .05 }),
  cave: M('#151311', { unlit: 1, nosh: 1, norecv: 1 }), soot: M('#2a2521', { a: .7, nosh: 1, norecv: 1 }), wet: M('#3f5f78', { a: .55, nosh: 1, norecv: 1, spec: 1, gloss: 80 }),
  water: M('#58b4e8', { spec: 1, gloss: 90, a: .8, nosh: 1, norecv: 1 }), drop: M('#9fdcff', { unlit: 1, nosh: 1, norecv: 1 }),
  tbm: M('#e2a92a', { spec: .35, gloss: 40 }), tbmD: M('#b9861c', { spec: .3, gloss: 40 }), steel: M('#6b7480', { spec: .7, gloss: 60 }), steelD: M('#454b54', { spec: .6, gloss: 50 }),
  lampOn: M('#fff2c2', { unlit: 1, nosh: 1, norecv: 1, e: [2.4, 2.1, 1.3] }), lampOff: M('#7d838c', { spec: .4 }), fan: M('#9aa3ad', { spec: .7, gloss: 60 }), fanD: M('#3a3f46', { spec: .4 }),
  fogG: M('#9a9893', { a: .5, nosh: 1, norecv: 1 }), steam: M('#f4f6f8', { a: .6, nosh: 1, norecv: 1 }), powder: M('#232222'), fuse: M('#3a2a1c'),
  flame1: M('#ffb02e', { unlit: 1, nosh: 1, norecv: 1, e: [1.8, .9, .1] }), flame2: M('#ff6a1a', { unlit: 1, nosh: 1, norecv: 1, e: [1.5, .4, .05] }), flameC: M('#fff0a0', { unlit: 1, nosh: 1, norecv: 1, e: [2, 1.8, .8] }),
  glow: M('#ff5a1a', { a: .55, nosh: 1, norecv: 1, e: [1.2, .3, .05] }), bucket: M('#8c949c', { spec: .6, gloss: 50 }), wood: M('#9a6a3a', { rim: .1 }), woodD: M('#6e4a28', { rim: .1 }),
};
// ---------- ruído suave determinístico (o mesmo para a malha e para pôr os pés no chão) ----------
function hh(i, j, s) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vn(x, y, s = 0) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return (hh(i, j, s) * (1 - u) + hh(i + 1, j, s) * u) * (1 - v) + (hh(i, j + 1, s) * (1 - u) + hh(i + 1, j + 1, s) * u) * v; }
// chão irregular do túnel aberto a pólvora (altura da pista em x, z)
function floorR(x, z) { const k = E.ss(E.c01(-z / 1.5)); return k * (.26 * (vn(x * 1.1 + 3, z * .7, 3) - .5) * 2 + .1 * (vn(x * 3, z * 2.2, 4) - .5) * 2); }
// ---------- malhas: túnel (normais para dentro), chão irregular ----------
const _tg = {};
function tubeGeo(key, radf, o = {}) {
  if (_tg[key]) return _tg[key];
  const L = o.L || TUN.L, nA = o.nA || 64, nZ = o.nZ || 160, a0 = o.a0 === undefined ? -.62 : o.a0, a1 = o.a1 === undefined ? Math.PI + .62 : o.a1, cy = TUN.cy;
  const pos = (ia, iz) => { const a = a0 + (a1 - a0) * ia / nA, z = -L * iz / nZ, r = radf(a, z); return [r * Math.cos(a), cy + r * Math.sin(a), z]; };
  const P = [], N = [], I = [];
  for (let iz = 0; iz <= nZ; iz++) for (let ia = 0; ia <= nA; ia++) {
    const p = pos(ia, iz), pa = pos(Math.min(nA, ia + 1), iz), pb = pos(Math.max(0, ia - 1), iz), pz1 = pos(ia, Math.min(nZ, iz + 1)), pz0 = pos(ia, Math.max(0, iz - 1));
    let n = V.norm(V.cross(V.sub(pa, pb), V.sub(pz1, pz0))); const toAxis = V.sub([0, cy, p[2]], p); if (V.dot(n, toAxis) < 0) n = V.mul(n, -1);
    P.push(...p); N.push(...n);
  }
  for (let iz = 0; iz < nZ; iz++) for (let ia = 0; ia < nA; ia++) { const a = iz * (nA + 1) + ia, b = a + nA + 1; I.push(a, b, a + 1, a + 1, b, b + 1); }
  return _tg[key] = mkGeo(P, N, I);
}
const roughR = (a, z) => { const k = E.ss(E.c01(-z / 1.2)); return TUN.R - .45 + k * (.42 * (vn(a * 2.6 + 9, z * .55, 1) - .5) * 2 + .18 * (vn(a * 8, z * 2.1, 2) - .5) * 2 + .12 * Math.max(0, vn(a * 14, z * 3.3, 5) - .55) * 6); };
function floorGeo() {
  if (_tg.floor) return _tg.floor; const P = [], N = [], I = [], nx = 28, nz = 260, L = TUN.L, w = 2.9;
  const y = (x, z) => floorR(x, z);
  for (let iz = 0; iz <= nz; iz++) for (let ix = 0; ix <= nx; ix++) { const x = -w + 2 * w * ix / nx, z = -L * iz / nz, e = .05; P.push(x, y(x, z), z); const n = V.norm([-(y(x + e, z) - y(x - e, z)) / (2 * e), 1, -(y(x, z + e) - y(x, z - e)) / (2 * e)]); N.push(...n); }
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) { const a = iz * (nx + 1) + ix, b = a + nx + 1; I.push(a, b, a + 1, a + 1, b, b + 1); }
  return _tg.floor = mkGeo(P, N, I);
}
// segmento de anel de concreto: casca entre os ângulos a0 e a1, com 1,5 m de largura (eixo = z)
const _sg = {};
function ringSegGeo(a0, a1) { const k = a0.toFixed(3) + a1.toFixed(3); if (_sg[k]) return _sg[k]; return _sg[k] = lathe([[TUN.R + .32, -.74], [TUN.R + .01, -.74], [TUN.R + .01, .74], [TUN.R + .32, .74]], 10, false, a0, a1); }
// a malha de ringSegGeo(0, A) depois de Rx(PI/2) cobre os ângulos [-A, 0] no plano xy; segAt põe ela em [s, s + A]
const segAt = (z, s, A) => C_(T_(0, TUN.cy, z), Rz_(s + A), Rx_(PI / 2));

// ---------- luz: dia lá fora, e dentro do túnel conforme a iluminação (0 = breu, 1 = lâmpadas acesas) ----------
function setInside(lv, smoke = 0) {
  setSky(0); const d = .1 + .9 * lv; R.sun = V.norm([.25, .85, .45]); R.sunC = [1.1 * d, 1.0 * d, .85 * d]; R.sky = [.32 * d + .02, .34 * d + .02, .38 * d + .03]; R.gnd = [.2 * d, .18 * d, .15 * d];
  R.fog = V.mix([.03 + .22 * lv, .028 + .2 * lv, .025 + .17 * lv], [.55, .54, .5], smoke); R.fogD = .012 + .02 * (1 - lv) + .22 * smoke;
}
// ---------- vale, estrada e montanha (vista de fora) ----------
function drawValley(t, o = {}) {
  setSky(0); R.t = t; const grass = AM.grass; draw(PL1, grass, S_(900, 1, 900));
  const road = o.asphalt ? TM.asphalt : TM.dirt; draw(BOX, road, C_(T_(0, .012, 40), S_(5.6, .02, 80)));
  if (o.asphalt) for (let i = 0; i < 14; i++) draw(BOX, TM.line, C_(T_(0, .026, 3 + i * 5.5), S_(.14, .01, 2.6)));
  const r = rng(17); for (let i = 0; i < 18; i++) { const s = i % 2 ? 1 : -1, x = s * (10 + r() * 14), z = 6 + i * 4.2 + r() * 3; drawTreeV(x, z, .9 + r() * .6, 40 + i); }
  for (let i = 0; i < 7; i++) draw(SPH, AM.mount, C_(T_(-200 + i * 70 + r() * 20, -5, -230 - r() * 60), S_(60 + r() * 30, 34 + r() * 26, 40)));
  const rc = rng(5); for (let i = 0; i < 11; i++) { const cx = -220 + i * 46 + rc() * 20 + t * .7, cy = 40 + rc() * 30, cz = -150 - rc() * 90; for (let j = 0; j < 4; j++) draw(SPH, AM.cloud, C_(T_(cx + j * 9 - 14, cy + (j % 2) * 3, cz), S_(11 + rc() * 5, 5 + rc() * 2, 7))); }
  drawMountain(o);
}
function drawTreeV(x, z, s, seed) { const r = rng(seed); draw(CYL, AM.trunk, C_(T_(x, 1.1 * s, z), S_(.22 * s, 2.2 * s, .22 * s))); for (let i = 0; i < 3; i++) draw(SPH, i % 2 ? AM.crown : AM.crownD, C_(T_(x + (r() - .5) * .9 * s, (2.6 + i * .7) * s, z + (r() - .5) * .9 * s), S_((1.5 - i * .25) * s, (1.25 - i * .15) * s, (1.5 - i * .25) * s))); }
// o: portal = 'none' | 'cave' | 'rough' | 'round' | 'modern'; cave/hole: 0..1 (tamanho da abertura)
function drawMountain(o = {}) {
  // paredão de pedra (frente em z = 0) e o corpo da montanha
  const pt = o.portal || 'none', open = pt === 'modern';
  if (!open) draw(BOX, TM.rock, C_(T_(0, 7, -7), S_(70, 14, 14)));
  else { draw(BOX, TM.rock, C_(T_(-21.6, 7, -7), S_(36.8, 14, 14))); draw(BOX, TM.rock, C_(T_(21.6, 7, -7), S_(36.8, 14, 14))); draw(BOX, TM.rock, C_(T_(0, 9.6, -7), S_(6.4, 8.8, 14))); }
  const r = rng(23);
  for (let i = 0; i < 16; i++) { const x = -32 + i * 4.1 + r() * 1.5, y = 1 + r() * 11; if (Math.abs(x) < 5.5 && y < 7) continue; draw(SPH, TM.rockD, C_(T_(x, y, 0), Ry_(r() * 6), S_(1.2 + r() * 1.4, .8 + r(), .22))); }
  draw(SPH, TM.rock, C_(T_(0, 14, -28), S_(46, 20, 26))); draw(SPH, TM.rockD, C_(T_(-30, 10, -20), S_(24, 13, 16))); draw(SPH, TM.rockD, C_(T_(30, 11, -22), S_(26, 14, 18)));
  for (const [x, z, w, h] of [[-6, -46, 30, 40], [20, -58, 26, 32], [-30, -52, 24, 30], [6, -70, 30, 46]]) draw(CONE, TM.rock, C_(T_(x, 4, z), Ry_(x), S_(w, h, w * .8)));
  for (const [x, z, w, h] of [[-6, -46, 30, 40], [20, -58, 26, 32], [-30, -52, 24, 30], [6, -70, 30, 46]]) draw(CONE, M('#f4f6f8'), C_(T_(x, 4 + h * .78, z), Ry_(x), S_(w * .22, h * .22, w * .8 * .22)));
  draw(SPH, AM.hill, C_(T_(0, 19, -30), S_(40, 16, 23))); draw(SPH, AM.hill, C_(T_(-28, 14, -24), S_(20, 9, 13))); draw(SPH, AM.hill, C_(T_(30, 15, -25), S_(22, 9, 14)));
  for (let i = 0; i < 12; i++) { const x = -26 + i * 4.7 + r() * 2, z = -14 - r() * 8; drawTreeV(x, z + 0, .8 + r() * .4, 90 + i); }   // mata no alto do paredão
  // aberturas desenhadas sobre o paredão
  if (pt === 'cave') { const k = o.cave === undefined ? 1 : o.cave; draw(CYL, TM.cave, C_(T_(0, .05, .02), Rx_(PI / 2), S_(1.5 * k, .02, 1.25 * k))); draw(BOX, TM.cave, C_(T_(0, -.6, .02), S_(3.2 * k, 1.3, .02))); }
  if (pt === 'rough') { const k = o.hole === undefined ? 1 : o.hole, rr = rng(31); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; draw(SPH, TM.cave, C_(T_(Math.cos(a) * 1.6 * k, 1.6 + Math.sin(a) * 1.3 * k, .03), S_((1.3 + rr() * .6) * k, (1.1 + rr() * .5) * k, .02))); } draw(BOX, TM.cave, C_(T_(0, .9, .03), S_(5.4 * k, 1.8 * k, .02)));
    for (let i = 0; i < 9; i++) { const a = PI * (i / 8); draw(SPH, i % 2 ? TM.rockD : TM.rockL, C_(T_(Math.cos(a) * 3.1 * k, 1.5 + Math.sin(a) * 2.7 * k, .2), Ry_(i), S_(.6, .45, .35))); } }
  if (pt === 'round') { const k = o.hole === undefined ? 1 : o.hole; draw(CYL, TM.cave, C_(T_(0, TUN.cy, .03), Rx_(PI / 2), S_(TUN.R * k, .02, TUN.R * k))); if (k >= 1) draw(TORUS(.08), TM.concF, C_(T_(0, TUN.cy, .06), Rx_(PI / 2), S_(TUN.R + .1))); }
  if (pt === 'modern') { // fachada de concreto em volta da boca
    draw(BOX, TM.concF, C_(T_(-4.3, 2.6, .25), S_(2.2, 5.2, .5))); draw(BOX, TM.concF, C_(T_(4.3, 2.6, .25), S_(2.2, 5.2, .5))); draw(BOX, TM.concF, C_(T_(0, 5.6, .25), S_(10.8, 1.2, .5)));
    draw(BOX, M('#2f7d4a'), C_(T_(0, 5.6, .52), S_(3.4, .7, .04)));
    draw(BOX, TM.lampOn, C_(T_(0, 5.6, .55), S_(3.0, .06, .02)));
  }
}
// ---------- interior do túnel ----------
// o: kind 'rough' | 'smooth'; end = profundidade da frente de escavação (rocha que fecha o túnel); lit: lâmpadas (0..1, acendem do começo ao fim)
function drawTunnel(t, o = {}) {
  R.t = t; const end = o.end || TUN.L;
  if (o.kind === 'rough') { draw(tubeGeo('rough', roughR), TM.wallR, Mx.I()); draw(floorGeo(), TM.floorR, Mx.I()); }
  else {
    draw(tubeGeo('smooth', () => TUN.R), TM.conc, Mx.I());
    for (let z = -.75; z > -Math.min(end, TUN.L); z -= 1.5) draw(TORUS(.012), TM.seam, C_(T_(0, TUN.cy, z), Rx_(PI / 2), S_(TUN.R - .005, 1, TUN.R - .005)));
    for (const a of [PI * .25, PI * .5, PI * .75]) draw(BOX, TM.seam, C_(T_(Math.cos(a) * (TUN.R - .01), TUN.cy + Math.sin(a) * (TUN.R - .01), -TUN.L / 2), Rz_(a), S_(.01, .025, TUN.L)));
    // pista (inclinação lateral do dreno: o lado +x fica mais baixo)
    const tilt = (o.tilt || 0) * .035; draw(BOX, o.asphalt ? TM.asphalt : TM.concF, C_(T_(0, -.6, -TUN.L / 2), Rz_(-tilt), S_(5.2, 1.2, TUN.L)));
    if (o.asphalt) { for (let z = -2; z > -TUN.L; z -= 5) draw(BOX, TM.line, C_(T_(0, .006, z), S_(.12, .01, 2.4))); for (const s of [1, -1]) draw(BOX, TM.lineY, C_(T_(s * 2.15, .006, -TUN.L / 2), S_(.1, .01, TUN.L))); }
    if (o.gutter) { const g = o.gutter; for (const s of [1, -1]) { draw(BOX, TM.gutter, C_(T_(s * 2.62, -.02, -TUN.L / 2), S_(.36 * g, .05, TUN.L))); draw(BOX, TM.curb, C_(T_(s * 2.84, .12, -TUN.L / 2), S_(.12, .28, TUN.L))); } }
  }
  if (end < TUN.L) { // frente de escavação
    if (o.kind === 'rough') { draw(BOX, TM.rock, C_(T_(0, 1.5, -end - 1), S_(8, 7, 2))); const r = rng(55); for (let i = 0; i < 10; i++) draw(SPH, i % 2 ? TM.rockD : TM.rockL, C_(T_(-2.4 + r() * 4.8, .3 + r() * 3.6, -end + .05), S_(.5 + r() * .5, .4 + r() * .4, .25))); }
    else draw(CYL, TM.rock, C_(T_(0, TUN.cy, -end - .5), Rx_(PI / 2), S_(TUN.R + .05, 1, TUN.R + .05)));
  }
  if (o.lamps !== undefined) drawLamps(o.lamps);
  if (o.fans !== undefined) drawFans(t, o.fans, o.fanSpin || 0);
}
function drawLamps(lit) { // lit 0..1: a onda de luz corre do começo ao fim
  for (let i = 0; i < 26; i++) { const z = -2 - i * 3, on = lit * 30 > i; for (const s of [1, -1]) draw(BOX, on ? TM.lampOn : TM.lampOff, C_(T_(s * 1.45, TUN.cy + Math.sqrt(TUN.R * TUN.R - 1.45 * 1.45) - .07, z), Rz_(-s * .5), S_(.16, .07, 1.0))); }
}
function jetFan(f, spin, show = 1) {
  draw(CYL, TM.fan, C_(f, Rx_(PI / 2), S_(.36 * show, 1.7, .36 * show))); for (const e of [.86, -.86]) draw(TORUS(.12), TM.fanD, C_(f, T_(0, 0, e), Rx_(PI / 2), S_(.36 * show)));
  for (const e of [.8, -.8]) for (let b = 0; b < 4; b++) draw(BOX, TM.fanD, C_(f, T_(0, 0, e), Rz_(spin + b * PI / 2), T_(0, .15, 0), S_(.06, .3, .02)));
  for (const x of [-.25, .25]) draw(CYL, TM.steelD, C_(f, T_(x, .5, 0), S_(.02, .3, .02)));
}
function drawFans(t, k, spin) { for (let i = 0; i < 4; i++) for (const s of [1, -1]) { const z = -10 - i * 16, drop = (1 - E.ss(E.c01(k * 4 - i * .6))) * 1.2; jetFan(C_(T_(s * .9, TUN.cy + 2.35 + drop, z)), spin * (s > 0 ? 1 : -1), 1); } }
// ---------- ferramentas e efeitos ----------
function drawPick(hand, q, o = {}) {
  const f = toolFrame(hand, q); const L = o.broken ? .3 : .62; draw(CYL, BM.woodD, C_(f, T_(0, 0, L / 2 - .05), Rx_(PI / 2), S_(.02, L, .02)));
  if (o.broken) { draw(CONE, BM.woodL, C_(f, T_(0, 0, L - .05), Rx_(PI / 2), S_(.022, .06, .022))); return; }
  pickHead(C_(f, T_(0, 0, .56)));
}
function pickHead(f) { draw(BOX, BM.iron, C_(f, S_(.05, .1, .07))); for (const s of [1, -1]) draw(CONE, BM.iron, C_(f, Rx_(s > 0 ? 0 : PI), T_(0, .03, 0), Rz_(0), S_(.035, .3, .045))); }
function drawSledge(hand, q) { const f = toolFrame(hand, q); draw(CYL, BM.woodD, C_(f, T_(0, 0, .2), Rx_(PI / 2), S_(.018, .5, .018))); draw(BOX, BM.ironD, C_(f, T_(0, 0, .44), S_(.08, .2, .09))); return C_(f, T_(0, -.1, .44)); }
function drawChisel(hand, q) { const f = toolFrame(hand, q); draw(CYL, TM.steel, C_(f, T_(0, 0, .14), Rx_(PI / 2), S_(.014, .3, .014))); return Mx.pt(f, [0, 0, .3]); }
function drawFire(t, p, k) { if (k <= 0) return; const r = rng(77);
  for (let i = 0; i < 4; i++) draw(CYL, TM.woodD, C_(T_(p[0], p[1] + .08, p[2]), Ry_(i * .8), Rz_(PI / 2), S_(.07, .9 * Math.min(1, k * 2), .07)));
  for (let i = 0; i < 9; i++) { const ph = t * 7 + i * 1.7, h = (.45 + .35 * Math.sin(ph) * Math.sin(ph * .7 + i)) * k, a = i * 2.4; draw(CONE, i % 3 === 0 ? TM.flameC : i % 2 ? TM.flame1 : TM.flame2, C_(T_(p[0] + Math.cos(a) * .18 * k, p[1] + .1, p[2] + Math.sin(a) * .14 * k), Rz_(.15 * Math.sin(ph * 1.3)), S_(.16 * k, h + .2 * k, .16 * k))); }
}
function drawSteam(t, te, p, k = 1) { const d = t - te; if (d < 0 || d > 2.4) return; for (let i = 0; i < 14; i++) { const a = i * 2.4, age = d - i * .04; if (age < 0) continue; draw(SPH, M('#f4f6f8', { a: Math.max(0, .7 - age * .3) * k, nosh: 1, norecv: 1 }), C_(T_(p[0] + Math.cos(a) * (.3 + age * .9), p[1] + .2 + age * 1.4, p[2] + .3 + Math.sin(a) * .3 + age * .6), S_(.3 + age * .55))); } }
function drawChunks(t, te, p, seed, n = 10, pw = 1, mat) { const tau = t - te; if (tau < 0) return; const r = rng(seed); for (let i = 0; i < n; i++) { const vx = (r() - .5) * 3 * pw, vz = (.6 + r() * 2.2) * pw, vy = (r() * 3.2) * pw, s = .1 + r() * .22; const tt = Math.min(tau, 2.5); let y = p[1] + vy * tt - 4.9 * tt * tt; const g = y < s * .5; y = Math.max(s * .5, y); const k = g ? Math.min(1, 1.2 / (1 + tau)) : 1; draw(SPH, mat || (i % 2 ? TM.rockD : TM.rockL), C_(T_(p[0] + vx * Math.min(tt, 1.1) * k, y, p[2] + vz * Math.min(tt, 1.1) * k), Ry_(i + tau * (g ? 0 : 6)), S_(s, s * .75, s * .9))); } }
function drawBlast(t, te, p, pw = 1) {
  const d = t - te; if (d < 0) return;
  if (d < .5) draw(SPH, M('#ffd27a', { unlit: 1, nosh: 1, norecv: 1, a: Math.max(0, .9 - d * 1.8), e: [2, 1.4, .4] }), C_(T_(p[0], p[1], p[2] + .4), S_((.6 + d * 7) * pw)));
  if (d < 1.6) for (let i = 0; i < 18; i++) { const a = i * 2.4, rr = (.6 + d * 1.6) * (1 + (i % 3) * .2); draw(SPH, M(i % 2 ? '#a69c8c' : '#c7bca8', { a: Math.max(0, .7 - d * .45), nosh: 1, norecv: 1 }), C_(T_(p[0] + Math.cos(a) * rr * .9, p[1] + Math.abs(Math.sin(a)) * rr * .6 + d * .4, p[2] + .3 + d * .5), S_((.45 + d * .5) * pw))); }
  drawChunks(t, te, [p[0], p[1], p[2] + .3], 400, 16, 1.4);
}
function drawHoles(n, k = 1, cx = 0, cy = 1.6) { const pts = holePts(cx, cy); for (let i = 0; i < Math.min(n, pts.length); i++) draw(CYL, TM.cave, C_(T_(pts[i][0], pts[i][1], .03), Rx_(PI / 2), S_(.06 * k, .02, .06 * k))); }
function holePts(cx = 0, cy = 1.6) { return [[-.9, .45], [0, .5], [.9, .45], [-.9, -.3], [0, -.25], [.9, -.3]].map(([x, y]) => [cx + x, cy + y]); }
// pavio: cada furo liga num ponto do chão; f = 0..1 (fogo correndo do chão até os furos)
function drawFuses(burn, base, t) { const pts = holePts(); for (let i = 0; i < pts.length; i++) { const a = [pts[i][0], pts[i][1], .06], b = [base[0] + (i - 2.5) * .12, base[1], base[2]]; const w = [a[0], .05, .1]; if (burn < .5) lineCyl(V.mix(b, w, Math.max(0, burn * 2)), w, .012, TM.fuse); if (burn < 1) lineCyl(burn > .5 ? V.mix(w, a, (burn - .5) * 2) : w, a, .012, TM.fuse); if (burn > 0 && burn < 1) { const p = burn < .5 ? V.mix(b, w, burn * 2) : V.mix(w, a, (burn - .5) * 2), f = .05 + .02 * Math.sin(t * 60 + i); draw(SPH, BM.spark, C_(T_(...p), S_(f))); draw(SPH, TM.flameC, C_(T_(p[0], p[1] + .05, p[2]), S_(f * .6))); } } }
function drawDrops(t, zs, k, seed = 1) { // gotas pingando das emendas do teto e poças
  const r = rng(seed); for (let i = 0; i < zs.length; i++) { const z = zs[i], x = (r() - .5) * 2.4, y0 = TUN.cy + Math.sqrt(TUN.R * TUN.R - x * x) - .05, per = .55 + r() * .4, ph = ((t / per + r()) % 1); if (k <= 0) continue;
    const y = y0 - 4.6 * ph * ph * (y0 / 3.4); if (y > .05) draw(SPH, TM.drop, C_(T_(x, y, z), S_(.035, .05, .035))); draw(SPH, TM.drop, C_(T_(x, y0 - .02, z), S_(.04 * (1 - ph), .03, .04 * (1 - ph)))); }
}
function drawPuddles(k, seed = 3) { if (k <= 0) return; const r = rng(seed); for (let i = 0; i < 9; i++) { const x = (r() - .5) * 3.6, z = -2 - i * 2.6 - r() * 1.5, s = (.5 + r() * .7) * k; draw(CYL, TM.water, C_(T_(x, .012, z), S_(s, .004, s * (.6 + r() * .5)))); } }
function drawFlow(t, k) { if (k <= 0) return; for (const s of [1, -1]) for (let i = 0; i < 40; i++) { const z = -((i * 1.9 - t * 2.6) % 76 + 76) % 76 - .5; draw(SPH, TM.water, C_(T_(s * 2.62, .0, z), S_(.13 * k, .02, .5))); } }
// carro fictício: o = { col, open (conversível com o Jack), lights, smoke }
function carFrame(x, z, yaw = 0, y = 0) { return C_(T_(x, y, z), Ry_(yaw)); }
function drawCar(F, o = {}) {
  const col = o.col || M('#c8442f', { spec: .5, gloss: 60 }), dark = M('#1c2633', { spec: .9, gloss: 80 });
  draw(BOX, col, C_(F, T_(0, .55, 0), S_(1.7, .5, 3.8))); draw(BOX, col, C_(F, T_(0, .62, 1.45), S_(1.66, .4, .9)));
  if (!o.open) { draw(BOX, col, C_(F, T_(0, 1.05, -.25), S_(1.5, .42, 1.9))); draw(BOX, dark, C_(F, T_(0, 1.06, -.25), S_(1.52, .34, 1.7))); draw(BOX, dark, C_(F, T_(0, 1.06, -.25), S_(1.4, .34, 1.92))); }
  else { draw(BOX, dark, C_(F, T_(0, .98, .55), Rx_(-.35), S_(1.5, .42, .03))); draw(BOX, M('#4a3426'), C_(F, T_(0, .78, -.55), S_(1.3, .1, .9))); draw(BOX, M('#4a3426'), C_(F, T_(0, 1.0, -1.0), S_(1.3, .5, .12))); draw(TORUS(.18), BM.black, C_(F, T_(.35, 1.0, .25), Rx_(1.1), S_(.17))); }
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { draw(CYL, AM.tire, C_(F, T_(a * .82, .34, b * 1.25), Rz_(PI / 2), S_(.34, .24, .34))); draw(CYL, BM.rivet, C_(F, T_(a * .95, .34, b * 1.25), Rz_(PI / 2), S_(.16, .02, .16))); }
  const hl = o.lights ? TM.lampOn : M('#e8e4d2'); for (const s of [1, -1]) { draw(SPH, hl, C_(F, T_(s * .6, .62, 1.9), S_(.12, .1, .04))); draw(BOX, M('#d6332a', { unlit: 1, e: [.8, .1, .1] }), C_(F, T_(s * .6, .62, -1.9), S_(.24, .1, .03))); }
  return { seat: C_(F, T_(.35, .84, -.45)), pipe: Mx.pt(F, [-.5, .3, -2.0]) };
}
// fumaça de escapamento que fica no ar (idade cresce com o tempo de cena)
function drawExhaust(t, p, k, seed) { if (k <= 0) return; const r = rng(seed); for (let i = 0; i < 6; i++) { const age = ((t * 1.6 + i / 6) % 1); draw(SPH, M('#8f8d88', { a: .45 * (1 - age) * k, nosh: 1, norecv: 1 }), C_(T_(p[0] + (r() - .5) * .3, p[1] + age * .8, p[2] - age * 1.4), S_(.15 + age * .5))); } }
// ---------- tatuzão (tuneladora). F: quadro na frente da máquina (a roda de corte fica em z local = 0 e o corpo vai para -z... ou +z conforme o uso) ----------
function drawTBM(F, spin, o = {}) {
  const R0 = TUN.R - .05, back = o.back === undefined ? 1 : -1; // back = +1: corpo atrás da roda no sentido +z local
  // roda de corte
  const W = C_(F, Rz_(spin)); draw(CYL, TM.tbm, C_(W, Rx_(PI / 2), S_(R0, .35, R0)));
  for (let s = 0; s < 6; s++) { const sp = C_(W, Rz_(s * PI / 3)); draw(BOX, TM.tbmD, C_(sp, T_(0, R0 / 2, -.2), S_(.32, R0, .1))); for (let k = 1; k <= 4; k++) { const rr = k * R0 / 4.6; draw(CYL, TM.steel, C_(sp, T_(.0, rr, -.27), Rz_(PI / 2), S_(.16, .07, .16))); } }
  draw(CYL, TM.steel, C_(W, T_(0, 0, -.25), Rx_(PI / 2), S_(.35, .15, .35)));
  // escudo e corpo
  draw(CYL, TM.tbmD, C_(F, T_(0, 0, back * 3.4), Rx_(PI / 2), S_(R0 - .02, 6.4, R0 - .02)));
  for (let i = 0; i < 3; i++) draw(TORUS(.04), TM.steelD, C_(F, T_(0, 0, back * (1.2 + i * 2.2)), Rx_(PI / 2), S_(R0)));
  return C_(F, T_(0, 0, back * 6.6));
}
// braço montador: coloca o segmento i de 6 no anel que fica na posição z (quadro do túnel)
function drawErector(z, prog, nDone) {
  const segA = PI / 3, a0 = -PI / 2 + nDone * segA; // segmentos dão a volta a partir de baixo
  draw(CYL, TM.steelD, C_(T_(0, TUN.cy, z - .4), Rx_(PI / 2), S_(.45, .5, .45)));
  if (nDone >= 6) return;
  const lift = 1 - E.ss(prog), a = a0 + segA / 2, rr = (TUN.R - .2) - 1.6 * lift;
  const arm = C_(T_(0, TUN.cy, z), Rz_(a - PI / 2)); draw(BOX, TM.tbm, C_(arm, T_(0, rr / 2, 0), S_(.22, rr, .22)));
  draw(ringSegGeo(0, segA - .02), TM.concF, C_(segAt(z, a0, segA), S_(1 - 1.6 * lift / TUN.R, 1, 1 - 1.6 * lift / TUN.R)));
}
// trecho revestido por anéis (do começo até z1); atrás deles, a rocha
function drawRings(z1) { draw(tubeGeo('outer', () => TUN.R + .3, { a0: -.7, a1: PI + .7 }), TM.wallO, Mx.I()); for (let z = -.75; z >= z1 - 1e-6; z -= 1.5) drawRing(z, 6); }
function drawRing(z, n) { for (let i = 0; i < n; i++) draw(ringSegGeo(0, PI / 3 - .02), TM.concF, segAt(z, -PI / 2 + i * PI / 3, PI / 3)); }
// ---------- sobreposições 2D (as mesmas do Ep. 6) ----------
function stars(headM, k, t) { const hp = Mx.pt(headM, [0, .42, 0]); const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); const p = proj(hp); c.save(); c.globalAlpha = E.c01(k); c.fillStyle = '#ffd23f'; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57, x = p[0] + Math.cos(a) * 46, y = p[1] + Math.sin(a) * 14; c.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 6 : 14, b = q * .628 - 1.57; c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); } c.closePath(); c.stroke(); c.fill(); } c.restore(); }; }
function ovText(p3, txt, k, col = '#ffd23f', size = 70, dy = 0) { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); const p = proj(p3); c.save(); c.globalAlpha = E.c01(k); c.font = `800 ${size}px "DejaVu Sans", Arial, sans-serif`; c.textAlign = 'center'; c.lineWidth = Math.max(5, size / 8); c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(txt, p[0], p[1] + dy); c.fillStyle = col; c.fillText(txt, p[0], p[1] + dy); c.restore(); }; }
function ovArrow(p3a, p3b, k, col, txt) { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); const a = proj(p3a), b = proj(p3b), d = Math.atan2(b[1] - a[1], b[0] - a[0]); c.save(); c.globalAlpha = E.c01(k); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.beginPath(); c.moveTo(b[0] + Math.cos(d) * 16, b[1] + Math.sin(d) * 16); c.lineTo(b[0] + Math.cos(d + 2.5) * 24, b[1] + Math.sin(d + 2.5) * 24); c.lineTo(b[0] + Math.cos(d - 2.5) * 24, b[1] + Math.sin(d - 2.5) * 24); c.closePath(); c.fill();
    if (txt) { c.font = '800 26px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.8)'; const tx = (a[0] + b[0]) / 2, ty = Math.min(a[1], b[1]) - 16; c.strokeText(txt, tx, ty); c.fillStyle = '#fff'; c.fillText(txt, tx, ty); } c.restore(); }; }
// seta curva tracejada em 2D por uma lista de pontos 3D (para "dar a volta")
function ovPath(pts3, k, col, txt, tx, ty) { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); if (k <= 0) return; const P = pts3.map(proj), n = Math.max(2, Math.floor(P.length * E.c01(k * 1.4))); c.save(); c.globalAlpha = E.c01(k * 3); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 8; c.lineCap = 'round'; c.setLineDash([18, 14]); c.beginPath(); P.slice(0, n).forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.setLineDash([]);
    const a = P[n - 2], b = P[n - 1], d = Math.atan2(b[1] - a[1], b[0] - a[0]); c.beginPath(); c.moveTo(b[0] + Math.cos(d) * 16, b[1] + Math.sin(d) * 16); c.lineTo(b[0] + Math.cos(d + 2.5) * 24, b[1] + Math.sin(d + 2.5) * 24); c.lineTo(b[0] + Math.cos(d - 2.5) * 24, b[1] + Math.sin(d - 2.5) * 24); c.closePath(); c.fill();
    if (txt) { c.font = '800 30px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(txt, tx, ty); c.fillStyle = '#fff'; c.fillText(txt, tx, ty); } c.restore(); }; }
function ovChip(txt, x, y, k, col = 'rgba(12,22,38,.88)') { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); c.save(); c.globalAlpha = E.c01(k); c.font = '800 26px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; const w = c.measureText(txt).width + 40; c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - 26, w, 52, 26); c.fill(); c.fillStyle = '#fff'; c.fillText(txt, x, y + 9); c.restore(); }; }
function ovHaze(k, col = '150,148,142') { if (k <= 0) return; const prev = R.ov2; R.ov2 = c => { c.save(); c.fillStyle = `rgba(${col},${.6 * k})`; c.fillRect(0, 0, 720, 1280); c.restore(); if (prev) prev(c); }; }
function ovDark(k) { if (k <= 0) return; const prev = R.ov2; R.ov2 = c => { c.save(); const g = c.createRadialGradient(360, 640, 120, 360, 640, 760); g.addColorStop(0, `rgba(0,0,0,${.35 * k})`); g.addColorStop(1, `rgba(0,0,0,${.9 * k})`); c.fillStyle = g; c.fillRect(0, 0, 720, 1280); c.restore(); if (prev) prev(c); }; }
function chopPose(a) { return { lean: CHOP.lean - .25 * a, shR: CHOP.sh + 1.45 * a, elR: CHOP.el + .5 * a, abR: .15, shL: .7 + .5 * a, elL: .7, abL: .1 }; }
// tosse: inclina, fecha os olhos e abre a boca em trancos
function smallDust(t, te, p, n = 5) { const d = t - te; if (d < 0 || d > .7) return; for (let i = 0; i < n; i++) { const a = i * 2.4; draw(SPH, M('#cfc6b6', { a: Math.max(0, .6 - d * .85), nosh: 1, norecv: 1 }), C_(T_(p[0] + Math.cos(a) * (.05 + d * .3), p[1] + d * .2, p[2] + .05 + Math.abs(Math.sin(a)) * d * .3), S_(.05 + d * .18))); } }
function cough(t, k) { const c = Math.max(0, Math.sin(t * 13)) * k; return { lean: .25 * c, headPitch: .25 * c, blink: .75 * k, mouth: .55 * c + .15 * k, brow: -.6 * k, smile: -.4 * k }; }
