// Etapas 1 a 5: praia, tronco, jangada, canoa, remos e vela.
// Tempo reverso: congela em a, volta de b até c para o instante r0, e depois segue com v = tempo após a volta.
function RW(t, a, b, c, r0) {
  if (t < a) return { t, tw: t, fx: 0 };
  if (t < b) return { t: a - .001, tw: a, fx: E.seg(t, a, b) * .6 };
  if (t < c) { const s = E.ss(E.seg(t, b, c)), x = a + (r0 - a) * s; return { t: x, tw: x, fx: 1 }; }
  return { t: r0, tw: r0 + (t - c), fx: 1 - E.seg(t - c, 0, .3), v: t - c };
}
function chipSet(a, b) { R.chip = [a, b]; }
const CHOP = { lean: .4, sh: 1.05, el: .2, q: 1.45 };
function chopSwing(u, t0, per) { const p = (((u - t0) / per) % 1 + 1) % 1; return u < t0 - per * .9 ? 0 : p < .12 ? 0 : p < .75 ? E.ss((p - .12) / .63) : 1 - E.inq((p - .75) / .25); }
function chopPose(a) { return { lean: CHOP.lean - .25 * a, shR: CHOP.sh + 1.45 * a, elR: CHOP.el + .5 * a, abR: .15, shL: .7 + .5 * a, elL: .7, abL: .1 }; }

function S1(t, g) { if (t < 4.6) shotA(t * 3.5 / 4.6, g + t); else shotB((t - 4.6) * 2.5 / 3.9, g + t); }

function S2(t, g) {
  chipSet('TENTATIVA 1', 'o tronco'); if (t < 3.6) { treeChop(t, g + t, 1); return; } t -= 3.6; g += 3.6; R.chip = null;
  const r = RW(t, 9.0, 9.3, 10.4, .94), x = r.t; R.fx = r.fx;
  if (r.v === undefined && x >= 3.6 && x < 5.6) recap('TRONCO', 'a madeira flutua na água', [0, .1, 6], recapK(x, 3.6, 5.6));
  if (x < 3.2) shotC(x * 3.4 / 3.2, g + r.tw, r.v); else shotD(x < 7.4 ? (x - 3.2) / 4.2 * 2.6 : 2.6 + (x - 7.4), g + r.tw);
  if (r.v === undefined) chipSet('TENTATIVA 1', 'o tronco');
}

// ---------- jangada ----------
function raftY(x, z, tw) { let m = -9; for (const dx of [-1.2, 0, 1.2]) for (const dz of [-.8, 0, .8]) m = Math.max(m, waveH(x + dx, z + dz, tw)); return m + .13; }
function raftBuild(u, tw, v) {
  camera([3.9, 2.45, 3.1], [-.1, .5, -1.7], .8); R.shC = [0, 0, -2]; R.shR = 7; drawBeach(tw);
  const z0 = -1.6, fr = C_(T_(0, sandY(z0) + RAFT.r, z0), Rx_(Math.atan(SLOPE)));
  for (let i = 0; i < 5; i++) { const q = 4 - i, k = E.sseg(u, .5 + q * .55, 1.0 + q * .55); const pz = -3.7 - i * .37, a = [0, sandY(pz) + RAFT.r, pz], b = Mx.pt(fr, [0, 0, (i - 2) * RAFT.gap]); const p = V.mix(a, b, k);
    drawLog(C_(T_(p[0], p[1] + Math.sin(Math.PI * k) * .75, p[2]), Rx_(i * 1.3 + k * 6.283)), RAFT.len, RAFT.r, { clean: 1 }); }
  drawRaft(fr, { logs: 0, rope: E.seg(u, 3.3, 4.5) });
  const cr = v === undefined ? E.sseg(u, 0, .45) : 1 - E.sseg(v, 0, .4), idea = v === undefined ? 1 - E.sseg(u, 0, .3) : E.sseg(v, .5, .85), wk = Math.sin(u * 7) * .22 * cr * (v === undefined ? 1 : 0);
  drawJack({ pos: [-2.05, sandY(z0), z0], yaw: PI / 2, lean: .65 * cr, hipL: 1.2 * cr, hipR: 1.2 * cr, kneeL: 1.9 * cr, kneeR: 1.9 * cr, shL: 1.0 * cr + wk, shR: 1.0 * cr - wk + .5 * idea * (1 - cr), elL: .1 + .15, elR: .25 + 2.0 * idea * (1 - cr), abR: .12 + .2 * idea,
    pointR: idea * (1 - cr), headPitch: -.25 * cr, headYaw: -.5 * (1 - cr), brow: idea, smile: idea, mouth: .4 * idea * (1 - cr), blink: blinkF(u + .4) });
}
function raftSea(u, tw) {
  const x = 1.9 * E.sseg(u, 1.6, 3.6), z = 7, y = raftY(x, z, tw), yaw = .95 * E.sseg(u, 1.5, 3.6) + .1 * Math.sin(u * 2.1);
  camera(V.mix([.9, 2.6, 1.7], [1.5, 2.9, 1.3], E.sseg(u, 1.2, 3.6)), [.5 + x * .55, .9, 7.3], .8); R.shC = [0, 0, 6]; R.shR = 8; drawBeach(tw);
  drawRaft(C_(T_(x, y, z), Ry_(yaw)), {});
  if (u > 1.4) drawWind(tw, [x, 0, z], [1, 0], 9, 7, 4);
  const hop = u < 1.5 ? .2 * Math.abs(Math.sin(PI * u / .75)) : 0, hp = E.sseg(u, 0, .2) * (1 - E.sseg(u, 1.4, 1.7)), cf = E.sseg(u, 1.7, 2.1);
  drawJack({ pos: [x, y + RAFT.r + hop, z], yaw, abL: .25 + 1.95 * hp + .8 * cf + .2 * cf * Math.sin(u * 8), abR: .25 + 1.95 * hp + .8 * cf * (1 - E.sseg(u, 2.4, 2.7)) - .2 * cf * Math.sin(u * 8) * (1 - E.sseg(u, 2.4, 2.7)), elL: .25, elR: .25, shR: 1.45 * E.sseg(u, 2.4, 2.8),
    pointR: E.sseg(u, 2.4, 2.8), kneeL: .5 * hop / .2 * .4 + .1, kneeR: .5 * hop / .2 * .4 + .1, hipL: .2 * hop / .2 * .4, hipR: .2 * hop / .2 * .4, headYaw: .75 * cf * Math.sin(u * 3.2), smile: hp, mouth: .45 * hp + .5 * cf, brow: hp + cf, blink: blinkF(u + 1.9) });
}
function S3(t, g) {
  if (t < 1.3) { shotC(1.0, g + t, .6 + t); return; } if (t < 4.9) { treeChop(t - 1.3, g + t, 5); chipSet('TENTATIVA 2', 'a jangada'); return; } t -= 3.6; g += 3.6;
  const r = RW(t, 9.6, 9.9, 11.0, 5.9), x = r.t; R.fx = r.fx;
  if (x < 6.0) raftBuild(x - 1.3, g + r.tw, r.v); else raftSea(x - 6.0, g + r.tw);
  if (r.v === undefined && x >= 6.2 && x < 8.0) recap('JANGADA', 'troncos amarrados: mais estável', [0, .2, 7], recapK(x, 6.2, 8.0));
  if (r.v === undefined) chipSet('TENTATIVA 2', 'a jangada');
}

// ---------- canoa ----------
function canoeCarve(u, tw) {
  camera([4.7, 2.15, 2.9], [.55, .85, -1.95], .8); R.shC = [0, 0, -2]; R.shR = 7; drawBeach(tw);
  const z0 = -1.9, y0 = sandY(z0) + .68; for (const x of [-.9, .9]) drawLog(C_(T_(x, sandY(z0) + .16, z0), Ry_(PI / 2)), .9, .16, { clean: 1 });
  const fill = 1 - E.sseg(u, .6, 5.0); drawCanoe(C_(T_(0, y0, z0)), { fill });
  const xf = Math.max(-1.15, Math.min(1.15, -1.5 + 3 * fill - .2)), act = 1 - E.sseg(u, 5.0, 5.3), a = chopSwing(u, .6, .7) * act, P = chopPose(a);
  for (let n = 0; n < 7; n++) drawChips(u, .6 + n * .7, [xf, y0 + .06, z0 + .1], 30 + n);
  const pre = u < 0 ? 1 - E.sseg(u, -.5, 0) : 0, done = Math.max(1 - act, pre), up = pre * E.sseg(u, -1.9, -1.4); if (pre > 0) { P.lean = P.lean * (1 - pre); P.shR = P.shR * (1 - pre) + 2.6 * up; P.elR = P.elR * (1 - pre) + .3; P.shL *= (1 - pre); }
  const j = drawJack(Object.assign(P, { pos: [xf, sandY(-2.6), -2.6], lean: P.lean * act, shR: P.shR * act + .3 * done, elR: P.elR * act + .4 * done, shL: P.shL * act, elL: P.elL * act + .2, headPitch: .25 * act, smile: done, brow: done * .8 - .3 * act, blink: blinkF(u + 1.1) }));
  drawAxe(j.hands.R, CHOP.q);
}
function canoeZ(u) { return u < 6.4 ? 5 + 1.6 * u : 15.24 + 1.6 * (1 - Math.exp(-(u - 6.4) * 1.4)) / 1.4; }
function canoeSea(u, tw) {
  const z = canoeZ(u), y = waveH(0, z, tw) + .2, tired = E.sseg(u, 6.6, 8.6), w = 5.2 - 2.2 * tired, amp = 1 - .85 * tired;
  camera([3.0, 1.7, z + 3.9], [0, .55, z + .5], .85); R.shC = [0, 0, z]; R.shR = 7; drawBeach(tw);
  const fr = C_(T_(0, y, z), Ry_(-PI / 2)); drawCanoe(fr, { afloat: 1 }); if (tired < .6) drawWake(fr, 1.9, .42);
  drawJack({ pos: [0, y - .3, z - .35], hipY: .15, hipL: 1.5, hipR: 1.5, kneeL: .2, kneeR: .2, lean: .35 + .4 * tired, abL: 1.05 - .5 * tired, abR: 1.05 - .5 * tired, shL: .5 * Math.sin(u * w) * amp + .2 * tired, shR: -.5 * Math.sin(u * w) * amp + .2 * tired, elL: .15, elR: .15,
    headPitch: -.2 + .5 * tired, smile: 1 - tired * 1.5, mouth: .25 * (1 - tired) + tired * (.35 + .25 * Math.sin(u * 7)), brow: .5 - 1.2 * tired, blink: blinkF(u) });
  if (tired > .3) for (let i = 0; i < 4; i++) { const a = ((u * 1.3 + i * .25) % 1); draw(SPH, BM.sweat, C_(T_((i % 2 ? 1 : -1) * (.24 + .1 * a), y + .52 - .5 * a * a - .25 * tired, z - .2 + .1 * i), S_(.022, .03, .022))); }
}
function S4(t, g) { if (t < 5.6) canoeCarve(t, g + t); else { canoeSea(t - 5.6, g + t); const z = canoeZ(t - 5.6); if (t >= 6.2 && t < 8.3) recap('CANOA', 'tronco escavado: leve e com espaço', [0, .25, z + .9], recapK(t, 6.2, 8.3)); } chipSet('TENTATIVA 3', 'a canoa'); }

// ---------- remos e vela ----------
function paddleMake(u, tw) {
  camera([2.5, 1.9, .9], [-.1, 1.15, -1.9], .8); R.shC = [0, 0, -1.6]; R.shR = 7; drawBeach(tw);
  drawCanoe(C_(T_(-2.2, sandY(-.5) + .36, -.5), Ry_(.25)), {});
  const zs = -1.7, ys = sandY(zs) + .5; draw(CYL, BM.woodD, C_(T_(0, ys - .25, zs), S_(.3, .5, .3))); draw(DISC, WC.cut, C_(T_(0, ys + .002, zs), S_(.28)));
  const hits = [.4, .85, 1.3], k = hits.filter(h => u >= h).length / 3, hw = .2 - .16 * k;
  draw(BOX, BM.woodL, C_(T_(-.3, ys + .02, zs), S_(.75, .03, hw))); draw(SPH, BM.woodL, C_(T_(.28, ys + .02, zs), S_(.24, .016, .1)));
  hits.forEach((h, n) => drawChips(u, h, [-.3, ys + .05, zs + .06], 50 + n, 6));
  const act = 1 - E.sseg(u, 1.45, 1.75), a = (u < .1 ? 0 : chopSwing(u, .4, .45)) * act, P = chopPose(a), ch = 1 - act;
  const j = drawJack(Object.assign(P, { pos: [-.3, sandY(-2.4), -2.4], lean: P.lean * act, shR: P.shR * act + 2.7 * ch, elR: P.elR * act + .3 * ch, abR: .15 + .3 * ch, shL: P.shL * act + 2.7 * ch, elL: P.elL * act + .3 * ch, abL: .1 + .3 * ch, headPitch: .25 * act, smile: ch, mouth: .5 * ch, brow: ch, blink: blinkF(u + 2) }));
  drawAxe(j.hands.R, CHOP.q);
}
function mastUp(u, tw) {
  camera([4.0, 2.1, 3.0], [.75, 1.3, -1.0], .92); R.shC = [0, 0, -1]; R.shR = 7; drawBeach(tw);
  const m = E.sseg(u, .2, 1.2), sail = E.sseg(u, 1.3, 2.1), z0 = -.9; drawCanoe(C_(T_(0, sandY(z0) + .36, z0)), { mast: m, sail, billow: .12 + .1 * Math.sin(u * 3) * sail });
  const ch = E.sseg(u, 2.1, 2.3); drawJack({ pos: [.95, sandY(-1.38), -1.38], yaw: -.9, shL: .9 + 1.5 * m, shR: .9 + 1.5 * m, elL: .35, elR: .35, abL: .2 + .3 * ch, abR: .2 + .3 * ch, headPitch: -.1 - .3 * m, smile: sail, mouth: .4 * ch, brow: sail, blink: blinkF(u + .8) });
}
function sailing(u, tw) {
  const z = 6 + 4.2 * u, y = waveH(0, z, tw) + .2; camera([2.6, 1.8, z - 4.6], [-.05, 1.0, z - .5], .86); R.shC = [0, 0, z]; R.shR = 7; drawBeach(tw);
  const fr = C_(T_(0, y, z), Ry_(-PI / 2)); drawCanoe(fr, { afloat: 1, mast: 1, sail: 1, billow: .85 + .15 * Math.sin(u * 4) }); drawWake(fr, 3.2, .5); drawWind(tw, [0, 0, z], [0, 1], 12, 6, 9);
  const lk = E.sseg(u, 2.6, 3.1); const j = drawJack({ pos: [0, y - .3, z - 1.0], hipY: .15, hipL: 1.5, hipR: 1.5, kneeL: .2, kneeR: .2, lean: .1, abR: .75, shR: -.35, elR: .2, shL: 1.1, elL: .9, abL: .2, headYaw: 1.25 * lk, twist: .45 * lk, smile: 1, mouth: .45 * lk, brow: .8, blink: blinkF(u + 1.5) });
  drawPaddle(j.hands.R, 2.25, 1.15);
}
function S5(t, g) {
  const r = RW(t, 2.6, 2.9, 3.9, 0);
  if (r.v === undefined) { R.fx = r.fx; canoeSea(6.4 + r.t, g + r.tw); chipSet('TENTATIVA 3', 'a canoa'); return; }
  R.fx = r.fx; const y = r.v;
  if (y < 2.3) { paddleMake(y, g + t); chipSet('TENTATIVA 4', 'os remos'); recap('REMO', 'dá força e controla a direção', [.1, sandY(-1.7) + .55, -1.7], recapK(y, 1.5, 2.3)); } else if (y < 4.7) { mastUp(y - 2.3, g + t); chipSet('TENTATIVA 5', 'o mastro e a vela'); } else { sailing(y - 4.7, g + t); chipSet('TENTATIVA 5', 'o mastro e a vela'); const z = 6 + 4.2 * (y - 4.7); recap('VELA', 'o vento empurra o barco', [0, 1.7, z + .4], recapK(y, 5.2, 7.4)); }
}
