// Versão 2 do episódio, alinhada ao texto novo da narração ("você..."). Um trecho por frase ou par de frases.
function remap(t, pts) { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, ua] = pts[i - 1], [b, ub] = pts[i]; return ua + (ub - ua) * (t - a) / Math.max(1e-6, b - a); } return pts[pts.length - 1][1]; }
function lineCyl(a, b, r, mat) { const d = V.sub(b, a), len = Math.hypot(d[0], d[1], d[2]), y = V.mul(d, 1 / len); let x = V.cross(y, Math.abs(y[2]) > .9 ? [1, 0, 0] : [0, 0, 1]); x = V.norm(x); const z = V.cross(x, y), m = V.mix(a, b, .5);
  draw(CYL, mat, Mx.mul([x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, m[0], m[1], m[2], 1], S_(r, len, r))); }
const KNEEL = { hipY: .39, hipL: 0, hipR: 0, kneeL: 1.57, kneeR: 1.57 }, SEAT = { hipY: .27, hipL: 1.9, hipR: 1.9, kneeL: 1.6, kneeR: 1.6 };
function raftY2(x, z, tw) { let m = -9; for (const dx of [-.9, 0, .9]) for (const dz of [-1.2, 0, 1.2]) m = Math.max(m, waveH(x + dx, z + dz, tw)); return m + .13; }

function N01(t, g) {
  if (t < 3.0) { shotA(t * 1.15, g + t); return; } chipSet('TENTATIVA 1', 'o tronco flutuante');
  if (t < 6.6) treeChop(t - 3.0, g + t, 1); else shotC(1.0 + (t - 6.6) * 2.4 / 2.2, g + t);
}
function N02(t, g) {
  chipSet('TENTATIVA 1', 'o tronco flutuante'); const U = x => x < 2.2 ? x / 2.2 * 2.6 : 2.6 + (x - 2.2) * 1.6 / 1.4; let tv = t, tw = t;
  if (t >= 3.6 && t < 3.85) { tv = 3.599; tw = 3.6; R.fx = E.seg(t, 3.6, 3.85) * .6; }
  else if (t >= 3.85 && t < 4.75) { const s = E.ss(E.seg(t, 3.85, 4.75)); tv = 3.6 + (.45 - 3.6) * s; tw = tv; R.fx = 1; }
  else if (t >= 4.75) { tv = .45; tw = .45 + (t - 4.75); R.fx = 1 - E.seg(t - 4.75, 0, .3); recap('TRONCO FLUTUANTE', 'flutua, mas é instável', [0, .12, 6], recapK(t, 4.95, 7.85)); }
  shotD(U(tv), g + tw);
}
function N03(t, g) { chipSet('TENTATIVA 2', 'a jangada'); if (t < 3.6) treeChop(t, g + t, 5); else raftBuild((t - 3.6) * 4.7 / 3.6, g + t); }

// ---------- jangada na água: flutuando, remando e lotada ----------
function raftScene(u, tw, mode) {
  const z = mode === 'float' ? 7 : mode === 'row' ? 7 + 1.25 * u : 13.2 + 1.0 * u - .085 * u * u, y = raftY2(0, z, tw), rock = mode === 'crowd' ? .05 * Math.sin(tw * 2.3) : .015 * Math.sin(tw * 1.4);
  if (mode === 'float') camera(V.mix([.9, 2.6, 1.7], [1.3, 2.8, 1.5], E.sseg(u, 0, 6.8)), [.3, .9, 7.3], .8); else camera([3.1, 2.35, z + 3.9], [0, .65, z - .15], .82);
  R.shC = [0, 0, z]; R.shR = 8; drawBeach(tw);
  const fr = C_(T_(0, y, z), Ry_(PI / 2), Rx_(rock)); drawRaft(fr, {}); const top = y + RAFT.r;
  if (mode === 'float') {
    const hop = u < 1.5 ? .2 * Math.abs(Math.sin(PI * u / .75)) : 0, hp = E.sseg(u, 0, .2) * (1 - E.sseg(u, 1.4, 1.7)), sh = E.sseg(u, 4.9, 5.3);
    drawJack({ pos: [0, top + hop, z], abL: .25 + 1.95 * hp + .5 * sh, abR: .25 + 1.95 * hp + .5 * sh, elL: .25 + 1.3 * sh, elR: .25 + 1.3 * sh, twL: -.9 * sh, twR: -.9 * sh, kneeL: .2 * hop / .2 + .1, kneeR: .2 * hop / .2 + .1, hipL: .08 * hop / .2, hipR: .08 * hop / .2,
      headYaw: .6 * sh * Math.sin(u * 3.5), smile: hp - .5 * sh, mouth: .45 * hp + .3 * sh, brow: hp + sh, blink: blinkF(u + 1.9) });
    recap('JANGADA', 'troncos amarrados lado a lado', [.75, top, z - .36], recapK(u, 1.7, 4.5));
  } else {
    const tired = mode === 'crowd' ? E.sseg(u, .5, 4.5) : 0, w = 5 - 2.4 * tired, st = Math.sin(u * w);
    drawWake(fr, 2.2, 1.3, 1.5, -.2);
    const j = drawJack(Object.assign({}, KNEEL, { pos: [0, top, z + .15], lean: .22 + .12 * st + .35 * tired, abL: .85, abR: .85, shL: .35 + .45 * st * (1 - .6 * tired), shR: .35 + .45 * st * (1 - .6 * tired), elL: .35, elR: .35,
      headPitch: -.15 + .45 * tired, smile: mode === 'row' ? 1 : -tired, mouth: mode === 'row' ? .3 : .25 + .2 * tired * (1 + Math.sin(u * 7)), brow: mode === 'row' ? .6 : .5 - 1.3 * tired, blink: blinkF(u + .7) }));
    drawPaddle(j.hands.L, 1.75, 1.2); drawPaddle(j.hands.R, 1.75, 1.2);
    if (mode === 'row') recap('REMOS', 'empurram a água para trás', [1.35, y - .05, z + .3], recapK(u, 2.2, 5.0));
    else { const wb = Math.sin(u * 5.2);
      drawJack({ pos: [.42, top, z - .78], yaw: .15, plain: 2, mats: PAS1, abL: 1.0 + .35 * wb, abR: .15, elL: .3, elR: .3, kneeL: .35, kneeR: .35, hipL: .2, hipR: .2, roll: .07 * wb, mouth: .5, brow: 1, blink: blinkF(u + 1.3) });
      drawJack({ pos: [-.42, top, z - .78], yaw: -.15, plain: 1, mats: PAS2, abL: .15, abR: 1.0 + .3 * wb, elL: .3, elR: .3, kneeL: .35, kneeR: .35, hipL: .2, hipR: .2, roll: -.07 * wb, mouth: .4, brow: 1, blink: blinkF(u + 2.1) });
      for (let n = 0; n < 6; n++) drawSplash(u, .6 + n * .8, [(n % 2 ? .95 : -.95), y - .1, z - .7], .45, 200 + n, 16);
      for (let i = 0; i < 4; i++) { const a = ((u * 1.3 + i * .25) % 1); if (tired > .3) draw(SPH, BM.sweat, C_(T_((i % 2 ? 1 : -1) * (.24 + .1 * a), top + 1.05 - .5 * a * a - .2 * tired, z + .45), S_(.022, .03, .022))); } }
  }
}
function N04(t, g) { chipSet('TENTATIVA 2', 'a jangada'); raftScene(t, g + t, 'float'); }
function oarsMake(u, tw) {
  camera([2.5, 1.9, .9], [-.1, 1.15, -1.9], .8); R.shC = [0, 0, -1.6]; R.shR = 7; drawBeach(tw);
  const zs = -1.7, ys = sandY(zs) + .5; draw(CYL, BM.woodD, C_(T_(0, ys - .25, zs), S_(.3, .5, .3))); draw(DISC, WC.cut, C_(T_(0, ys + .002, zs), S_(.28)));
  const hits = [.4, .85], sp = E.back(E.seg(u, .85, 1.1)) * .14;
  for (const s of [1, -1]) { draw(BOX, BM.woodL, C_(T_(-.25, ys + .02, zs + s * (.05 + sp)), Ry_(s * sp * .6), S_(1.0, .03, .09))); draw(SPH, BM.woodL, C_(T_(.33, ys + .02, zs + s * (.05 + sp * 1.4)), S_(.2, .016, .085))); }
  hits.forEach((h, n) => drawChips(u, h, [-.25, ys + .05, zs + .04], 50 + n, 6));
  const act = 1 - E.sseg(u, 1.0, 1.3), a = (u < .1 ? 0 : chopSwing(u, .4, .45)) * act, P = chopPose(a), ch = 1 - act;
  const j = drawJack(Object.assign(P, { pos: [-.3, sandY(-2.4), -2.4], lean: P.lean * act, shR: P.shR * act + 2.7 * ch, elR: P.elR * act + .3 * ch, abR: .15 + .3 * ch, shL: P.shL * act + 2.7 * ch, elL: P.elL * act + .3 * ch, abL: .1 + .3 * ch, headPitch: .25 * act, smile: ch, mouth: .5 * ch, brow: ch, blink: blinkF(u + 2) }));
  drawAxe(j.hands.R, CHOP.q);
}
function N05(t, g) { chipSet('TENTATIVA 2', 'a jangada'); if (t < 2.2) oarsMake(t, g + t); else raftScene(t - 2.2, g + t, 'row'); }
function N06(t, g) { const r = RW(t, 5.6, 5.9, 7.0, .2); R.fx = r.fx; raftScene(r.t, g + r.tw, 'crowd'); if (r.v === undefined) chipSet('TENTATIVA 2', 'a jangada'); }

// ---------- canoa ----------
function N07(t, g) { chipSet('TENTATIVA 3', 'a canoa escavada'); canoeCarve((t - 2.6) * 5.2 / 5.4, g + t); }
function canoeSea2(u, tw) {
  const z = 6 + 1.8 * u, y = waveH(0, z, tw) + .2, st = Math.sin(u * 4.2); camera([3.0, 1.7, z + 3.9], [0, .55, z + .3], .85); R.shC = [0, 0, z]; R.shR = 7; drawBeach(tw);
  const fr = C_(T_(0, y, z), Ry_(-PI / 2)); drawCanoe(fr, { afloat: 1 }); drawWake(fr, 1.9, .42);
  const j = drawJack(Object.assign({}, SEAT, { pos: [0, y - .3, z - .65], lean: .2 + .12 * st, abR: .7, shR: .35 + .5 * st, elR: .4, shL: .5, elL: .9, abL: .1, smile: 1, mouth: .3, brow: .6, blink: blinkF(u) })); drawPaddle(j.hands.R, 1.75, 1.2);
  drawJack(Object.assign({}, SEAT, { pos: [0, y - .3, z + .75], plain: 2, mats: PAS1, shL: .55, shR: .55, elL: .85, elR: .85, abL: .12, abR: .12, headYaw: .5 * Math.sin(u * 1.3), smile: 1, mouth: .3, brow: .6, blink: blinkF(u + 1.4) }));
  recap('CANOA ESCAVADA', 'formato estreito: desliza fácil', [0, y - .05, z + 1.45], recapK(u, 1.9, 6.0));
}
function N08(t, g) { chipSet('TENTATIVA 3', 'a canoa escavada'); canoeSea2(t, g + t); }
function canoeLoad(u, tw, v) {
  camera([2.9, 1.8, 5.4], [0, .75, .5], .86); R.shC = [0, 0, 0]; R.shR = 8; drawBeach(tw);
  const cz = 1.6, roll = 1.25 * E.inq(E.seg(u, 1.5, 2.2)), cy = waveH(0, cz, tw) + .2, fr = C_(T_(0, cy, cz), Rx_(roll)); drawCanoe(fr, { afloat: roll < .2 ? 1 : 0 });
  const low = E.sseg(u, .6, 1.3), pan = E.sseg(u, 1.5, 1.9), idea = v === undefined ? 0 : E.sseg(v, .25, .6);
  const j = drawJack({ pos: [0, sandY(.85), .85], shL: (.95 - .2 * low) * (1 - pan) + 2.6 * pan * (1 - idea), shR: (.95 - .2 * low) * (1 - pan) + 2.6 * pan * (1 - idea) + .5 * idea, elL: .35, elR: .35 + 1.9 * idea, abL: .34, abR: .34, pointR: idea,
    mouth: .6 * pan * (1 - idea) + .4 * idea, brow: 1, smile: idea, headPitch: .15 * (1 - pan), blink: blinkF(u + .9) });
  const hl = Mx.pt(j.hands.L, [0, 0, 0]), hr = Mx.pt(j.hands.R, [0, 0, 0]); let cp = [0, (hl[1] + hr[1]) / 2 - .05, (hl[2] + hr[2]) / 2 + .3], rot = 0;
  if (u >= 1.3) { const on = Mx.pt(fr, [0, .3, 0]); if (u < 1.75) cp = on; else { const tau = u - 1.75, o2 = Mx.pt(C_(T_(0, cy, cz), Rx_(1.25 * E.inq(E.seg(1.75, 1.5, 2.2)))), [0, .3, 0]); cp = [0, Math.max(-.5, o2[1] - 4.9 * tau * tau), o2[2] + 1.3 * tau]; rot = 2.5 * tau; } }
  draw(BOX, M('#b5863f', { pat: [4, 6, .8, 0] }), C_(T_(cp[0], cp[1], cp[2]), Rx_(u >= 1.3 ? roll * (u < 1.75 ? 1 : 0) + rot : 0), S_(.56, .56, .56)));
  drawSplash(u, 2.12, [0, 0, 2.55], .9, 31, 50);
  for (const [x, z, c] of [[1.3, -1.3, '#9c6f33'], [1.95, -1.9, '#b5863f']]) draw(BOX, M(c, { pat: [4, 6, .8, 0] }), C_(T_(x, sandY(z) + .28, z), S_(.56, .56, .56)));
  drawJack({ pos: [-1.5, sandY(-1.4), -1.4], yaw: .3, plain: 2, mats: PAS1, abL: .5, elL: 1.4, twL: -.6, abR: .5, elR: 1.4, twR: -.6, brow: -.4 + pan, mouth: .4 * pan, blink: blinkF(u + 1.7) });
  drawJack({ pos: [-.75, sandY(-2.0), -2.0], yaw: .1, plain: 1, mats: PAS2, abR: .2 + 1.6 * pan, elR: .3, brow: pan, mouth: .5 * pan, blink: blinkF(u + 2.4) });
}
function N09(t, g) { const r = RW(t, 3.2, 3.45, 4.4, .3); R.fx = r.fx; canoeLoad(r.t, g + r.tw, r.v); if (r.v === undefined) chipSet('TENTATIVA 3', 'a canoa escavada'); }

// ---------- barco de madeira ----------
function shipyard2(u, tw) {
  camera([8.2, 3.5, 1.7], [.2, 2.1, -5.5], 1.0); R.shC = [0, 1, -4.5]; R.shR = 12; drawBeach(tw);
  const zs = -5.5, fy = sandY(zs) + 2.25, fr = C_(T_(0, fy, zs)); const st = { keel: E.sseg(u, 1.0, 3.4), posts: E.sseg(u, 6.0, 8.5), ribs: E.seg(u, 11.2, 14.2), planks: E.seg(u, 14.6, 18.0), deck: E.sseg(u, 18.6, 19.2), masts: E.sseg(u, 19.2, 20.4), sails: E.sseg(u, 20.6, 21.8), billow: .25 };
  for (const x of [-2.6, 0, 2.6]) draw(BOX, BM.woodDD, C_(T_(x, sandY(zs) + .16, zs), S_(.5, .34, 1.5)));
  for (const x of [-1.7, 1.7]) for (const s of [1, -1]) draw(BOX, BM.woodD, C_(T_(x, sandY(zs) + .95, zs + s * 1.55), Rx_(s * .5), S_(.1, 2.1, .1)));
  drawWoodShip(fr, st); drawCanoe(C_(T_(-5.2, sandY(-1.6) + .36, -1.6), Ry_(.4)), {});
  for (let i = 0; i < 4; i++) draw(BOX, i % 2 ? BM.plank1 : BM.plank2, C_(T_(5.2, sandY(-4) + .05 + i * .07, -4 + i * .05), Ry_(.2 + i * .05), S_(2.6, .06, .28)));
  for (let i = 0; i < 3; i++) drawLog(C_(T_(-4.6, sandY(-3.6 - i * .4) + .17, -3.6 - i * .4), Ry_(.15)), 2.4, .17, { clean: 1 });
  const lk = (a, b) => Math.min((u - a) * 4, (b - u) * 4);
  if (u > 3.9 && u < 10.4) leader('QUILHA', [1.5, fy - 1.85, zs + .1], 360, 250, lk(3.9, 10.4));
  if (u > 11.4 && u < 14.4) leader('CAVERNAS', [1.5, fy - .9, zs + 1.0], 360, 250, lk(11.4, 14.4));
  if (u > 14.8 && u < 18.2) leader('TÁBUAS DO CASCO', [2.0, fy - 1.0, zs + 1.05], 360, 250, lk(14.8, 18.2));
  if (u > 19.6 && u < 22.6) leader('MASTRO E VELA', [1.25, fy + 2.6, zs], 250, 250, lk(19.6, 22.6));
  const work = E.sseg(u, 11.0, 11.4) * (1 - E.sseg(u, 18.2, 18.6)), a = chopSwing(u, 11.4, .5) * work, P = hamPose(a), ch = E.sseg(u, 21.6, 22.0), gd = E.sseg(u, .5, .9) * (1 - E.sseg(u, 9.6, 10.2));
  const j = drawJack(Object.assign(P, { pos: [2.5, sandY(-3.9), -3.9], yaw: PI + .1, lean: P.lean * work, shR: P.shR * work + 2.0 * gd * (.7 + .3 * Math.sin(u * 6)) + 2.7 * ch, elR: P.elR * work + .4 * (gd + ch), shL: P.shL * work + 2.7 * ch, elL: P.elL * work + .3, abR: .12 + .35 * (gd + ch), abL: .1 + .35 * ch, headPitch: -.25, smile: ch, mouth: .45 * ch, brow: ch, blink: blinkF(u + .3) }));
  drawHammer(j.hands.R, HAM.q);
}
function N10(t, g) { chipSet('TENTATIVA 4', 'o barco de madeira'); shipyard2(t, g + t); }
function N11(t, g) { chipSet('TENTATIVA 4', 'o barco de madeira'); shipyard2(t + 10.8, g + t); }
function N12(t, g) { chipSet('TENTATIVA 4', 'o barco de madeira'); shipyard2(t + 18.4, g + t); }
function N13(t, g) { chipSet('TENTATIVA 4', 'o barco de madeira'); const u = t * 4.9 / 5.4; woodSea(u, g + t); recap('BARCO DE MADEIRA', 'leva mais pessoas e mercadorias', [.6, .3, 30 + 2.2 * u + (u < 2.4 ? 1.5 : -1)], recapK(t, .9, 4.9)); }
function woodFail(u, tw) {
  const z = 30 + 1.2 * u, sink = E.sseg(u, 3.3, 4.6), y = waveH(0, z, tw) + .8 - .5 * sink, f = WS.f;
  const fr = C_(T_(0, y, z), Ry_(-PI / 2), Rz_(.04 * Math.sin(tw * 1.7)), Rx_(.05 * Math.sin(tw * 1.3) - .14 * sink));
  camera([6.4, 2.6, z + 5.6], [0, 1.2, z + .5], .95); R.sunC = [1.15, 1.05, .95]; R.sky = [.36, .42, .56]; R.zen = [.16, .3, .6]; R.hor = [.55, .68, .82]; R.fog = [.6, .72, .85]; R.shC = [0, 0, z]; R.shR = 9; drawBeach(tw);
  drawWoodShip(fr, { cargo: 0, wheel: 1, billow: .7 }); drawWake(fr, 4.5, 1.6, 4.0, -.75);
  const rot = E.sseg(u, .3, 2.0), rm = M('#35402a', { rim: 0 }); for (const [s, ph, k] of [[.35, 1.0, 1], [.1, .75, .8], [-.2, 1.1, .9], [.55, .7, .7], [-.45, .85, .8]]) draw(SPH, rm, C_(fr, T_(...f(s, ph, -1)), S_(.34 * k * rot, .24 * k * rot, .07)));
  const fp = Mx.pt(fr, [.3, topY(f, .3) - .14, 0]), fk = E.sseg(u, 1.7, 2.3);
  if (fk > 0) { for (let i = 0; i < 6; i++) { const fl = .7 + .3 * Math.sin(tw * 13 + i * 2.1); draw(CONE, M(i % 2 ? '#ffb347' : '#ff7a1a', { unlit: 1, nosh: 1, e: [1.3, .5, .05] }), C_(T_(fp[0] + .22 * Math.cos(i * 1.05), fp[1], fp[2] + .22 * Math.sin(i * 1.05)), S_(.13 * fk, (.45 + .2 * (i % 3)) * fl * fk, .13 * fk))); } drawSmoke(tw, [fp[0], fp[1] + .5, fp[2]], 2.4, 1.3, [.9, .7]); }
  const lp = Mx.pt(fr, [1.6, -.75, -1.12]); for (let n = 0; n < 4; n++) drawSplash(u, 3.3 + n * .4, [lp[0] + .25, y - .6 + .5 * sink, lp[2]], .7, 60 + n, 30);
  const pn = E.sseg(u, 1.6, 2.0); drawJack({ pos: Mx.pt(fr, [-.75, topY(f, .75) - .14, 0]), yaw: .2, abL: .3 + 1.9 * pn + .25 * Math.sin(u * 13) * pn, abR: .3 + 1.9 * pn - .25 * Math.sin(u * 13) * pn, elL: .4, elR: .4, mouth: .7 * pn, brow: 1, headYaw: .5 * Math.sin(u * 5) * pn, kneeL: .2, kneeR: .2, hipL: .1, hipR: .1, blink: blinkF(u) });
  const lk = (a, b) => Math.min((u - a) * 4, (b - u) * 4); const rp = Mx.pt(fr, f(.35, 1.0, -1));
  if (u > .6 && u < 2.0) leader('APODRECE', rp, 250, 250, lk(.6, 2.0), 'rgba(170,35,30,.92)'); if (u > 2.0 && u < 3.4) leader('PEGA FOGO', [fp[0], fp[1] + .4, fp[2]], 250, 250, lk(2.0, 3.4), 'rgba(170,35,30,.92)'); if (u > 3.4 && u < 4.6) leader('MUITA MANUTENÇÃO', lp, 280, 250, lk(3.4, 4.6), 'rgba(170,35,30,.92)');
}
function N14(t, g) { const r = RW(t, 4.6, 4.9, 6.0, .2); R.fx = r.fx; woodFail(r.t, g + r.tw); if (r.v === undefined) chipSet('TENTATIVA 4', 'o barco de madeira'); }

// ---------- ferro, aço, motor ----------
function N15(t, g) { chipSet('TENTATIVA 5', 'o casco de ferro'); forge(t, g + t); }
function N16(t, g) { chipSet('TENTATIVA 5', 'o casco de ferro');
  if (t < 3.0) { const q = RW(t, 2.3, 2.45, 3.0, .2); R.fx = q.fx; tankShot(q.t, g + q.tw, 0); } else if (t < 4.4) forge(t - 3.0, g + t, 1); else tankShot(t - 4.4 + .4, g + t, 1, [3.4, 7.3]); }
function N17(t, g) { chipSet('TENTATIVA 6', 'o navio de aço'); steelYard(remap(t, [[0, 0], [4.8, 4.6], [5.6, 4.7], [7.4, 6.45], [7.5, 6.5], [10, 8.6]]), g + t); if (t > 8.0) recap('NAVIO DE AÇO', 'chapas unidas por rebites e solda', [3.2, 2.6, -4.75], recapK(t, 8.0, 9.85)); }
function pullHull(u, tw) {
  camera([13.2, 5.0, 3.0], [4.2, 2.1, -6], 1.05); R.shC = [3, 1, -5]; R.shR = 14; drawBeach(tw);
  const zs = -6, fy = sandY(zs) + 2.95, fr = C_(T_(0, fy, zs)); for (const x of [-3.5, 0, 3.5]) draw(BOX, BM.woodDD, C_(T_(x, sandY(zs) + .2, zs), S_(.6, .42, 1.8)));
  drawSteelShip(fr, { deck: 1 });
  const pl = 1 - E.sseg(u, 2.5, 2.9), s = Math.sin(u * 7) * pl, sh = 1 - pl;
  const j = drawJack({ pos: [8.1, sandY(-5.9), -5.9], yaw: -PI / 2, lean: -.38 * pl, shL: 1.25 * pl, shR: 1.25 * pl, elL: .5 * pl + 1.3 * sh, elR: .5 * pl + 1.3 * sh, abL: .12 + .6 * sh, abR: .12 + .6 * sh, twL: -.9 * sh, twR: -.9 * sh, hipL: (.5 + .25 * s) * pl, hipR: (.5 - .25 * s) * pl, kneeL: (.7 + .3 * s) * pl, kneeR: (.7 - .3 * s) * pl,
    mouth: .35 * pl + .3 * sh, brow: -.6 * pl + sh, headYaw: -.9 * sh, blink: blinkF(u + .5) });
  const hl = Mx.pt(j.hands.L, [0, -.03, 0]), hr = Mx.pt(j.hands.R, [0, -.03, 0]), hm = V.mix(hl, hr, .5), bow = Mx.pt(fr, [5.35, .25, 0]);
  if (pl > .05) lineCyl(hm, bow, .018, BM.rope); else lineCyl([7.4, sandY(-5.9) + .02, -5.9], bow, .018, BM.rope);
  if (sh > .5) { const hp = Mx.pt(j.head, [0, .55, 0]); R.ov2 = c => { const p = proj(hp); c.save(); c.globalAlpha = E.c01((sh - .5) * 4); c.font = '800 70px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.lineWidth = 9; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText('?', p[0], p[1]); c.fillStyle = '#ffd23f'; c.fillText('?', p[0], p[1]); c.restore(); }; }
}
function N18(t, g) { chipSet('TENTATIVA 6', 'o navio de aço'); pullHull(t, g + t); }
function xray2(k, tu, tw, labs) {
  R.zen = [.015, .04, .1]; R.hor = [.03, .09, .19]; R.fog = [.03, .09, .19]; R.fogD = 0; R.sun = V.norm([.2, .6, .75]); R.sky = [.45, .55, .75]; R.gnd = [.25, .3, .4]; R.t = tw;
  camera([-21 + 7 * k, 2.5, 27], [-16 + 9 * k, -1.8, 0], .92); R.shC = [-10, 0, 0]; R.shR = 30; drawCargo(Mx.I(), { t: tu, cut: 1, cutSide: 1 });
  draw(BOX, BM.steel, C_(T_(-14.2, -4.75, 0), S_(4.8, .5, 3.4))); draw(BOX, BM.steel2, C_(T_(-6, -5.02, 0), S_(30, .06, 6)));
  drawJack({ pos: [-11.2, -4.99, 1.2], yaw: .2, abR: 2.2 + .3 * Math.sin(tu * 6), elR: .3, smile: 1, mouth: .35, brow: .6, blink: blinkF(tu + .4) });
  for (const L of labs) leader(L[0], L[1], L[2], L[3], L[4]);
}
function N19(t, g) { chipSet('TENTATIVA 7', 'o motor e a hélice');
  if (t < 3.0) engineIn(t * 3.45 / 3.0, g + t);
  else if (t < 6.6) { const u = t - 3.0; xray2(.28 * E.sseg(u, 0, 3.6), u, g + t, [['MOTOR', [-14.2, -2.6, 1.5], 300, 250, (u - .3) * 4], ['EIXO', [-19.2, -4.1, 0], 190, 330, (u - 1.3) * 4], ['HÉLICE', [-22.3, -3.3, 0], 120, 410, (u - 2.3) * 4]]);
    const pp = [-23.4, -4.1, 0]; R.ov2 = c => { const p = proj(pp), a = E.c01((u - 2.5) * 3); if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = '#7fd4ff'; c.lineWidth = 6; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const o = ((u * 1.4 + i / 3) % 1) * 70; c.globalAlpha = a * (1 - o / 70); c.beginPath(); c.moveTo(p[0] - 14 - o, p[1] - 16); c.lineTo(p[0] - 30 - o, p[1]); c.lineTo(p[0] - 14 - o, p[1] + 16); c.stroke(); } c.restore(); }; }
  else { const u = t - 6.6; steelSea(u + .4, g + t); recap('MOTOR E HÉLICE', 'empurram a água e o navio avança', [-.8, .9, 30 + 3 * (u + .4) - 4.6], recapK(u, .3, 2.3)); }
}
function N20(t, g) { chipSet('TENTATIVA 8', 'o navio moderno');
  if (t < 2.3) xray2(.5 + .5 * E.sseg(t, 0, 2.3), t + 4, g + t, [['COMPARTIMENTOS ESTANQUES', [-3.4, -1.5, 3.1], 400, 250, (t - .3) * 4]]);
  else { const u = t - 2.3; bridge(u + .3, g + t); R.leaders = []; leader('NAVEGAÇÃO: RADAR E GPS', Mx.pt(C_(T_(0, 2.2, 60 + 3.5 * (u + .3)), Ry_(-PI / 2)), [-14.9, 9.4, 0]), 400, 250, (u - .1) * 4); }
}
function N21(t, g) { chipSet('TENTATIVA 8', 'o navio moderno');
  if (t < 2.0) arrive(2.5 + t, g + t); else if (t < 4.6) { R.chip = null; closing(t - 2.0 + .1, g + t); } else { R.chip = null; lineup(Math.min(t - 4.6, 4.7), g + t); }
  R.fade = E.seg(t, 9.2, 10.0) * .9; R.title = E.seg(t, 9.8, 10.5) * (1 - E.seg(t, 11.8, 12.2));
}
