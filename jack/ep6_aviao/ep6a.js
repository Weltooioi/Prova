// Episódio 6, tentativas 1 a 8: asas de pano, asa fixa, cauda, peso do corpo, pedais, vapor, gasolina e hélice.
const SITG = { hipY: .17, hipL: 1.45, hipR: 1.45, kneeL: .25, kneeR: .25 };
function stars(headM, k, t) { const hp = Mx.pt(headM, [0, .42, 0]); R.ov2 = c => { const p = proj(hp); c.save(); c.globalAlpha = E.c01(k); c.fillStyle = '#ffd23f'; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57, x = p[0] + Math.cos(a) * 46, y = p[1] + Math.sin(a) * 14; c.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 6 : 14, b = q * .628 - 1.57; c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); } c.closePath(); c.stroke(); c.fill(); } c.restore(); }; }
function ovText(p3, txt, k, col = '#ffd23f', size = 70, dy = 0) { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); const p = proj(p3); c.save(); c.globalAlpha = E.c01(k); c.font = `800 ${size}px "DejaVu Sans", Arial, sans-serif`; c.textAlign = 'center'; c.lineWidth = Math.max(5, size / 8); c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(txt, p[0], p[1] + dy); c.fillStyle = col; c.fillText(txt, p[0], p[1] + dy); c.restore(); }; }
function ovArrow(p3a, p3b, k, col, txt) { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); const a = proj(p3a), b = proj(p3b), d = Math.atan2(b[1] - a[1], b[0] - a[0]); c.save(); c.globalAlpha = E.c01(k); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.beginPath(); c.moveTo(b[0] + Math.cos(d) * 16, b[1] + Math.sin(d) * 16); c.lineTo(b[0] + Math.cos(d + 2.5) * 24, b[1] + Math.sin(d + 2.5) * 24); c.lineTo(b[0] + Math.cos(d - 2.5) * 24, b[1] + Math.sin(d - 2.5) * 24); c.closePath(); c.fill();
    if (txt) { c.font = '800 26px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.8)'; const tx = (a[0] + b[0]) / 2, ty = Math.min(a[1], b[1]) - 16; c.strokeText(txt, tx, ty); c.fillStyle = '#fff'; c.fillText(txt, tx, ty); } c.restore(); }; }
function ovChip(txt, x, y, k, col = 'rgba(12,22,38,.88)') { const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); c.save(); c.globalAlpha = E.c01(k); c.font = '800 26px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; const w = c.measureText(txt).width + 40; c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - 26, w, 52, 26); c.fill(); c.fillStyle = '#fff'; c.fillText(txt, x, y + 9); c.restore(); }; }
function sweat(p, t, k) { if (k > .3) for (let i = 0; i < 4; i++) { const a = ((t * 1.3 + i * .25) % 1); draw(SPH, BM.sweat, C_(T_(p[0] + .1 * i - .15, p[1] - .45 * a * a, p[2] + (i % 2 ? .22 : -.22) + (i % 2 ? .1 : -.1) * a), S_(.022, .03, .022))); } }

// ---------- 1. asas de pano nos braços ----------
const J1 = { x0: -9.6, t0: 6.6 };          // salto: x = x0 + 3.2 tau, y = 4.5 + 3 tau - 1.9 tau^2
function jumpPos(tau) { const x = J1.x0 + 3.2 * tau; return [x, Math.max(groundY(x), 4.5 + 3.0 * tau - 1.9 * tau * tau)]; }
function A01(t, g) {
  const tw = g + t, run = E.seg(t, 5.2, 6.6), tau = Math.max(0, t - 6.6); let x = -12.5 + 2.9 * E.inq(run) * (run < 1 ? 1 : 1), y = groundY(x);
  if (tau > 0) { const p = jumpPos(tau); x = p[0]; y = p[1]; }
  if (t < 5.0) camera(V.mix([-7.6, 6.6, 7.2], [-7.9, 6.4, 6.6], E.sseg(t, 0, 5)), [-12, 5.75, 0], .85); else { const k = E.sseg(t, 5.0, 5.8); camera(V.mix([-7.9, 6.4, 6.6], [x + 5.2, y + 1.9, 7.6], k), V.mix([-12, 5.75, 0], [x + .3, y + 1.0, 0], k), .85); }
  R.shC = [x, y, 0]; R.shR = 9; drawField(tw); drawBirds(tw, [-10.5, 8.7, -2.5]);
  const wk = E.sseg(t, 3.4, 4.6), imi = E.sseg(t, 1.1, 1.6) * (1 - E.sseg(t, 2.7, 3.2)), spread = E.sseg(t, 4.6, 5.1), fl = Math.sin(t * (tau > 0 ? 19 : 8));
  const w = run > 0 && tau === 0 ? walkPose(run * 3.2, 1) : { hipL: 0, hipR: 0, kneeL: 0, kneeR: 0 };
  const ab = 1.4 * imi + .55 * wk * (1 - spread) + 1.45 * spread + (imi * .25 + spread * (tau > 0 ? .6 : .2)) * fl;
  if (t > 3.1) chipSet('TENTATIVA 1', 'asas de pano');
  const j = drawJack({ pos: [x, y, 0], yaw: PI / 2, abL: .12 + ab, abR: .12 + ab, elL: .12, elR: .12, shL: .5 * wk * (1 - spread), shR: .5 * wk * (1 - spread), hipL: w.hipL + .3 * (tau > 0 ? 1 : 0), hipR: w.hipR - .2 * (tau > 0 ? 1 : 0), kneeL: w.kneeL + .5 * (tau > 0 ? 1 : 0), kneeR: w.kneeR + .3 * (tau > 0 ? 1 : 0),
    headPitch: -.4 * (1 - E.sseg(t, 2.8, 3.3)) + .25 * wk * (1 - spread), smile: 1, mouth: .3 * imi + .5 * (tau > 0 ? 1 : 0), brow: .7, lean: .25 * run, blink: blinkF(t) });
  if (wk > 0) drawArmWings(j.hands, wk);
}
function A02(t, g) {
  chipSet('TENTATIVA 1', 'asas de pano'); const r = RW(t, 5.3, 5.6, 6.7, .05), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const ti = 1.12, tau = 1.4 + Math.min(u, ti), p = jumpPos(tau), air = u < ti, x = p[0], y = air ? p[1] : 0;
  camera([x + 5.2, y * .55 + 2.1, 7.6], [x + .3, y * .7 + .9, 0], .85); R.shC = [x, y, 0]; R.shR = 9; drawField(tw);
  if (air) { const fl = Math.sin(u * 22), pn = E.sseg(u, .2, .7); const j = drawJack({ pos: [x, y, 0], yaw: PI / 2, tip: .9 * pn, abL: 1.5 + .6 * fl, abR: 1.5 + .6 * fl, elL: .12, elR: .12, hipL: .5 + .4 * Math.sin(u * 14), hipR: -.2 - .4 * Math.sin(u * 14), kneeL: .8, kneeR: .6, mouth: .8, brow: 1, headPitch: -.3 }); drawArmWings(j.hands, 1); }
  else { const d = u - ti, bn = .12 * Math.abs(Math.sin(d * 9)) * Math.exp(-d * 3); drawDust(u, ti, [x, 0, 0], 9);
    const j = drawJack(Object.assign({}, SITG, { pos: [x, bn, 0], yaw: PI / 2 + .9, abL: .35, abR: .35, elL: .3, elR: .3, lean: .1, headYaw: .35 * Math.sin(d * 3), headPitch: .1, mouth: .3, brow: -.6, smile: -.6, blink: blinkF(d * 2 + 1) }));
    for (const s of [1, -1]) { draw(BOX, AM.cloth, C_(T_(x + .5 + s * .2, .03, s * 1.05), Ry_(s * .5), Rz_(.08 * s), S_(.56, .02, .95))); draw(CYL, AM.woodD, C_(T_(x + .55 + s * .3, .05, s * 1.0), Ry_(s * .5), Rx_(PI / 2), S_(.016, .95, .016))); }
    stars(j.head, d * 3, u); }
}

// ---------- 2. asa fixa ----------
function B01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 2', 'a asa fixa');
  if (t < 6.4) { camera([2.9, 2.8, 12.6], [-1.75, 1.1, 5], .9); R.shC = [-2, 0, 5]; R.shR = 9; drawField(tw); const by = drawBench(-2, 5, 5.6);
    const fk = E.seg(t, .5, 3.0), cv = E.sseg(t, 3.3, 5.3); drawWing(C_(T_(-2, by + .07, 5), Ry_(PI / 2)), { span: 5, chord: 1.4, frame: fk, cover: cv });
    draw(CYL, AM.cloth, C_(T_(-4.75 + 5.0 * cv, by + .16, 5), Rx_(PI / 2), S_(.12 * (1 - cv * .6), 1.45, .12 * (1 - cv * .6))));
    const work = 1 - E.sseg(t, 3.0, 3.3), a = chopSwing(t, .8, .5) * work, P = hamPose(a), pull = E.sseg(t, 3.3, 3.6) * (1 - E.sseg(t, 5.3, 5.6)), ch = E.sseg(t, 5.5, 5.9), jx = -3.8 + 3.4 * (work > 0 ? E.seg(t, .5, 3.0) : 1) - 3.6 * pull * (1 - cv) + 0;
    const j = drawJack(Object.assign(P, { pos: [pull > 0 ? -4.4 + 4.6 * cv : jx, groundY(-2, 4.05), 4.05], lean: P.lean * work + .3 * pull, shR: P.shR * work + 1.0 * pull + 2.7 * ch, elR: P.elR * work + .3 * pull + .3 * ch, shL: P.shL * work + 1.0 * pull + 2.7 * ch, elL: P.elL * work + .3 * pull + .3 * ch, abL: .1 + .3 * ch, abR: .12 + .3 * ch, headPitch: .25 * (1 - ch), smile: ch, mouth: .4 * ch, brow: ch, blink: blinkF(t + .5) }));
    if (work > .5) drawHammer(j.hands.R, HAM.q);
    for (let n = 0; n < 5; n++) if (t > .8 + n * .5 && t < 3.0) drawSparks(t, .8 + n * .5, Mx.pt(j.hands.R, [0, -.1, .3]), 300 + n, 4, .4);
  } else { const u = t - 6.4; camera([-2.15, 1.7, 13.4], [-2.15, 1.62, 7.4], .78); R.shC = [-2, 0, 7]; R.shR = 6; drawField(tw);
    draw(CYL, AM.cloth, C_(T_(-2, 1.6, 7.4), Rz_(.12), Rx_(PI / 2), S_(.62, 1.0, .055))); draw(CYL, AM.woodD, C_(T_(-1.78, 1.63, 7.4), Rx_(PI / 2), S_(.025, 1.04, .025))); for (const z of [7.0, 7.8]) draw(CYL, AM.woodD, C_(T_(-2, .78, z), S_(.04, 1.56, .04)));
    const r = rng(3); for (let ln = 0; ln < 6; ln++) { const y0 = 1.6 + [-.55, -.28, -.1, .16, .34, .62][ln], up = ln > 2; for (let k = 0; k < 7; k++) { const ph = ((u * .45 + k / 7 + r() * .05) % 1), xr = 2.4 - ph * 5.2, bump = Math.exp(-xr * xr / .35), y = y0 + (up ? .2 : -.1) * bump - (.5 + .1 * ln * 0) * E.sseg(-xr, -.3, 2.0);
        draw(SPH, M('#bfe6ff', { unlit: 1, nosh: 1, a: .95 }), C_(T_(-2 + xr * .62, 1.6 + (y - 1.6) * .75, 8.0), S_(.06, .02, .02))); } }
    const k1 = E.sseg(u, .6, 1.1), k2 = E.sseg(u, 2.3, 2.8); ovArrow([-2.5, 1.5, 8.0], [-2.9, 1.18, 8.0], k1, '#7fd4ff', 'ar desviado para baixo'); ovArrow([-2, 1.72, 8.0], [-2, 2.2, 8.0], k2, '#5ee08a', 'o ar empurra a asa');
    drawJack({ pos: [-.95, 0, 6.2], yaw: -PI / 2 + .6, shR: 1.35, elR: .15, pointR: 1, abL: .5, elL: 1.4, twL: -.6, smile: 1, brow: .6, mouth: .3, blink: blinkF(u) }); }
}
function glideScene(tw, x, by, z, roll, pitch, o = {}) {
  const yj = by - 1.67; camera([x + 5.6 + (o.cx || 0), by + .9 + (o.cy || 0), z + 8.2], [x + .2, by - .35, z], .88); R.shC = [x, Math.max(0, by - 3), z]; R.shR = 10; drawField(tw);
  const G = C_(T_(x, by, z), Rx_(roll), Rz_(pitch)); drawGlider(G, { boom: o.tail ? 1 : 0, hs: o.tail ? 1 : 0, vf: o.tail ? 1 : 0 });
  const kick = o.kick || 0, s = Math.sin(tw * 11);
  drawJack(Object.assign({ root: hangRoot(G, o.swing || 0, -.12) }, HANG, { hipL: .25 + .5 * kick * s, hipR: -.05 - .5 * kick * s, kneeL: .45, kneeR: .35, smile: o.smile === undefined ? 1 : o.smile, mouth: o.mouth === undefined ? .3 : o.mouth, brow: o.brow === undefined ? .6 : o.brow, headYaw: o.headYaw || 0, blink: blinkF(tw) }));
  return G;
}
function crashGround(tw, u, tc, x, o = {}) { camera([x + 5.6, 2.6, 8.2], [x + .2, .9, 0], .88); R.shC = [x, 0, 0]; R.shR = 10; drawField(tw); drawDust(u, tc, [x, 0, 0], 10);
  const G = C_(T_(x - .9, .75, -.4), Rx_(1.15), Rz_(.25)); drawGlider(G, { boom: o.tail ? 1 : 0, hs: o.tail ? 1 : 0, vf: o.tail ? 1 : 0 });
  const d = u - tc; const j = drawJack(Object.assign({}, SITG, { pos: [x + .9, .1 * Math.abs(Math.sin(d * 9)) * Math.exp(-d * 3), 1.0], yaw: PI / 2 + .8, abL: .35, abR: .35, elL: .3, elR: .3, headYaw: .35 * Math.sin(d * 3), mouth: .3, brow: -.6, smile: -.6, blink: blinkF(d * 2 + 1) })); stars(j.head, d * 3, u); }
function B02(t, g) {
  chipSet('TENTATIVA 2', 'a asa fixa'); const r = RW(t, 5.0, 5.3, 6.3, .3), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const tc = 4.25, x = -9.5 + 4.2 * Math.min(u, tc), wob = .09 * Math.sin(u * 6) * (1 + 1.3 * u), over = E.inq(E.seg(u, 3.2, 4.1)), roll = wob * (1 - over) + 2.0 * over, by = 6.0 - .22 * u - 4.2 * E.inq(E.seg(u, 3.3, tc));
  if (u < tc) { const G = glideScene(tw, x, by, 0, roll, -.06 - .5 * over, { kick: E.sseg(u, 2.2, 3.0), mouth: .3 + .5 * E.sseg(u, 2.2, 3.0), brow: 1, smile: 1 - E.sseg(u, 2.0, 2.6) });
    if (r.v === undefined) { const wp = Mx.pt(G, [0, .65, 0]); ovArrow(wp, [wp[0], wp[1] + .9, wp[2]], lk(u, .2, 2.2), '#5ee08a', 'SUSTENTAÇÃO'); recap('ASA FIXA', 'o ar empurra a asa para cima', wp, lk(u, .5, 2.3)); } }
  else crashGround(tw, u, tc, x);
}

// ---------- 3. cauda ----------
function C01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 3', 'a cauda'); camera([2.6, 3.1, 14.8], [-3.3, 1.9, 5], .98); R.shC = [-3, 0, 5]; R.shR = 9; drawField(tw);
  const G = C_(T_(-2, 2.0, 5)); const w = drawGlider(G, { boom: E.sseg(t, .6, 2.0), hs: E.back(E.seg(t, 2.3, 3.0)), vf: E.back(E.seg(t, 3.7, 4.4)) }); for (const z of [3.3, 6.7]) draw(CYL, AM.woodD, C_(T_(-2, 1.27, z), S_(.05, 2.55, .05)));
  leader('PARTE HORIZONTAL', Mx.pt(w, [-2.85, 0, .5]), 300, 250, lk(t, 2.6, 4.0)); leader('PARTE VERTICAL', Mx.pt(w, [-2.9, .5, 0]), 300, 250, lk(t, 4.0, 5.4));
  if (t > 5.3 && t < 6.9) { const n = Mx.pt(w, [.7, 0, 0]); ovArrow([n[0] - .9, n[1] + .5, n[2]], [n[0] + .3, n[1] + .5, n[2]], lk(t, 5.4, 6.9), '#ffd23f', 'nariz para a frente'); }
  const a = chopSwing(t, 2.1, .7) * (1 - E.sseg(t, 4.6, 4.9)), ch = E.sseg(t, 6.9, 7.3);
  const j = drawJack({ pos: [-4.9, 0, 6.25], yaw: PI, shR: (2.0 + .6 * a) * (1 - ch) + .55 * ch, elR: (.5 + .5 * a) * (1 - ch) + 2.2 * ch, abR: .12 + .25 * ch, pointR: ch, shL: .3, elL: .5, headPitch: -.35 * (1 - ch), headYaw: -1.2 * ch, twist: -.5 * ch, smile: ch, mouth: .35 * ch, brow: ch, blink: blinkF(t + 1) });
  if (ch < .5) drawHammer(j.hands.R, .3);
  recap('PLANADOR', 'asa fixa com cauda', Mx.pt(w, [-1.4, 0, 0]), lk(t, 7.0, 8.55));
}
function C02(t, g) {
  chipSet('TENTATIVA 3', 'a cauda'); const r = RW(t, 4.7, 5.0, 6.0, .3), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const tc = 4.15, uu = Math.min(u, tc), x = -9.5 + 4.6 * uu, by = 6.0 - .32 * uu, pn = E.sseg(u, 2.3, 2.9), stuck = u >= tc;
  const G = glideScene(tw, x, by, 0, stuck ? .25 : .02 * Math.sin(u * 3), stuck ? -.5 : -.05, { tail: 1, kick: pn, mouth: .3 + .5 * pn, brow: 1, smile: 1 - pn, cx: -1.2 * pn });
  if (stuck) { const d = u - tc, rr = rng(6); for (let i = 0; i < 16; i++) { const a = rr() * 6.283, sp = 1 + rr() * 2.2; draw(SPH, i % 2 ? AM.crown : AM.crownD, C_(T_(x + 1.2 + Math.cos(a) * sp * d, by + .6 + (1.5 + rr() * 2) * d - 4.9 * d * d, Math.sin(a) * sp * d), S_(.12 * Math.max(0, 1 - d)))); } }
  if (r.v === undefined && u < 2.3) recap('CAUDA', 'mantém o voo reto e estável', Mx.pt(G, [-2.85, .55, 0]), lk(u, .2, 2.2));
}

// ---------- 4. peso do corpo ----------
function D01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 4', 'o peso do corpo'); const tl = 6.2, uu = Math.min(t, tl), x = -9.5 + 4.6 * uu + .9 * E.sseg(t, tl, 7.0), z = 5.2 * E.sseg(t, 1.2, 3.6), bk = E.sseg(t, 1.1, 1.6) * (1 - E.sseg(t, 3.0, 3.6));
  const land = E.sseg(t, tl - .5, tl), by = t < tl ? 6.0 - .7 * uu + .04 * land : 1.67 + .0, run = t >= tl ? E.seg(t, tl, 7.0) : 0;
  if (t < tl) { const G = glideScene(tw, x, Math.max(1.72, by), z, .32 * bk, -.05 + .12 * land, { tail: 1, swing: -.45 * bk, smile: 1, mouth: .3, brow: .7 }); recap('PESO DO CORPO', 'inclina o planador e faz a curva', Mx.pt(G, [0, -.9, 0]), lk(t, 1.2, 3.3)); }
  else { camera([x + 5.6, 2.57, z + 8.2], [x + .2, 1.32, z], .88); R.shC = [x, 0, z]; R.shR = 10; drawField(tw); const w = walkPose(run * 2.2, run < 1 ? 1 : 0), look = E.sseg(t, 7.6, 8.1);
    const j = drawJack(Object.assign({}, HANG, { pos: [x, 0, z], yaw: PI / 2, hipL: w.hipL, hipR: w.hipR, kneeL: w.kneeL, kneeR: w.kneeR, headYaw: 1.2 * look * (1 - E.sseg(t, 9.2, 9.6)), twist: .3 * look, smile: 1 - look, brow: .6 - .9 * look, mouth: .25, blink: blinkF(t) }));
    const hl = Mx.pt(j.hands.L, [0, 0, 0]), hr = Mx.pt(j.hands.R, [0, 0, 0]), G = C_(T_((hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2, (hl[2] + hr[2]) / 2), Rz_(-.04)); drawGlider(G, { boom: 1, hs: 1, vf: 1 }); if (t > 6.2 && t < 6.9) drawDust(t, 6.25, [x - .4, 0, z], 5);
    if (t > 7.5) { const a = Mx.pt(G, [-1.0, 1.25, 0]); ovArrow(a, [a[0] + 1.6, a[1], a[2]], lk(t, 7.6, 10.4), '#ffd23f', 'falta um empurrão'); } }
  if (t > 4.6 && t < 7.6) ovChip('TEMPO DE VOO: ' + Math.min(6, Math.floor(t)) + ' s', 360, 250, lk(t, 4.6, 7.6));
}

// ---------- 5 a 8. pedais, vapor, gasolina e hélice ----------
function flyerShot(tw, x, o = {}) { // avião de madeira na pista; devolve frame
  const y = (o.wheels ? .8 : .83) + (o.dy || 0), z = 14; camera([x + 6.6 + (o.cx || 0), 2.7 + (o.cy || 0) + (o.dy || 0) * .5, z + 8.6 + (o.cz || 0)], [x + .3 + (o.tx || 0), 1.3 + (o.dy || 0) * .8, z], o.fov || .95); R.shC = [x, 0, z]; R.shR = 11; drawField(tw);
  return C_(T_(x, y, z), Rz_(o.pitch || 0), Rx_(o.roll || 0)); }
function E01(t, g) {
  chipSet('TENTATIVA 5', 'pedais e hélice'); const r = RW(t, 6.0, 6.3, 7.2, .2), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const tired = E.sseg(u, 2.6, 4.6), sp = 1 - tired, ph = 5.2 * u - 2.1 * Math.max(0, u - 2.6) * tired - (u > 4.6 ? (u - 4.6) * 5.2 * 0 + 0 : 0), crank = Math.min(ph, 5.2 * 2.6 + 3.3) * 1.9, x = -4 + 1.5 * (u < 2.6 ? u : 2.6 + (1 - Math.exp(-(u - 2.6) * 1.2)) / 1.2), hop = .22 * Math.sin(PI * E.seg(u, 1.9, 2.6));
  const fr = flyerShot(tw, x, { dy: hop, pitch: .05 * Math.sin(PI * E.seg(u, 1.9, 2.6)) }); drawFlyer(fr, { power: 'pedal', prop: 1, propA: crank * 2.2, crank });
  const s = Math.sin(crank); const j = drawJack(Object.assign({ root: flyerSeat(fr) }, { hipL: 1.75 + .28 * s, hipR: 1.75 - .28 * s, kneeL: 1.45 + .35 * s, kneeR: 1.45 - .35 * s, shL: 1.0, shR: 1.0, elL: .55, elR: .55, lean: .2 + .35 * tired, headPitch: .4 * tired, smile: 1 - 1.6 * tired, mouth: .3 + .25 * tired * (1 + Math.sin(u * 8)), brow: .6 - 1.4 * tired, blink: blinkF(u) }));
  sweat(Mx.pt(j.head, [0, .1, 0]), u, tired); if (u > 2.55 && u < 3.2) drawDust(u, 2.6, [x + .6, 0, 14], 6);
  if (r.v === undefined) recap('PEDAIS E HÉLICE', 'a força das pernas gira a hélice', Mx.pt(fr, [1.78, .1, 0]), lk(u, .3, 2.4));
}
function F01(t, g) {
  chipSet('TENTATIVA 6', 'o motor a vapor'); const r = RW(t, 7.0, 7.3, 8.1, .9), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const drop = 3.2 * (1 - E.outq(E.seg(u, .2, .9))), sink = E.sseg(u, 2.6, 4.2), run = E.sseg(u, 1.1, 1.6), sh = E.sseg(u, 5.0, 5.4);
  const fr = flyerShot(tw, -1.5, { dy: -.13 * sink + (u > .9 && u < 1.2 ? -.04 * Math.sin((u - .9) * 21) : 0) + .012 * Math.sin(u * 30) * run, pitch: -.035 * sink }); drawFlyer(fr, { power: 'steam', drop, prop: 1, propA: u * 16 * run });
  if (run > 0) drawSmoke(tw, Mx.pt(fr, [1.15, 1.38, 0]), 3, 1.6, [-.9, 0]); if (u > .85 && u < 1.6) drawDust(u, .9, [-1.2, 0, 14], 8); if (sink > 0 && sink < 1) drawDust(u, 2.7, [-1.2, 0, 14.6], 7);
  const j = drawJack(Object.assign({ root: flyerSeat(fr) }, SEAT, { shL: 1.0 * (1 - sh), shR: 1.0 * (1 - sh), elL: .55 + .9 * sh, elR: .55 + .9 * sh, abL: .12 + .6 * sh, abR: .12 + .6 * sh, twL: -.9 * sh, twR: -.9 * sh, lean: .08 * Math.sin(u * 9) * run * (1 - sh), smile: 1 - 1.5 * sink, mouth: .3, brow: .6 - 1.2 * sink + sh, headYaw: .5 * sh, blink: blinkF(u + .4) }));
  if (r.v === undefined) { const b = Mx.pt(fr, [.75, .8, 0]); if (u > 2.6 && u < 6.9) ovArrow([b[0], b[1] + 1.5, b[2]], [b[0], b[1] + .15, b[2]], lk(u, 2.7, 6.9), '#ff6b5e', 'PESO'); recap('MOTOR A VAPOR', 'forte, mas pesado demais', Mx.pt(fr, [.75, .32, .4]), lk(u, 3.2, 6.6)); }
}
function pistonInset(c, t, k) { const x0 = 418, y0 = 205, w = 282, h = 290; c.save(); c.globalAlpha = E.c01(k); c.fillStyle = 'rgba(10,20,36,.9)'; c.beginPath(); c.roundRect(x0, y0, w, h, 18); c.fill(); c.strokeStyle = '#c9d0d6'; c.lineWidth = 6; const cx = x0 + w / 2, top = y0 + 48, bot = y0 + h - 58; c.strokeRect(cx - 46, top, 92, bot - top);
  const ph = (t * 1.6) % 1, py = top + 26 + (bot - top - 90) * (.5 - .5 * Math.cos(ph * 2 * Math.PI)); const fire = ph < .22 ? 1 - ph / .22 : 0; if (fire > 0) { c.fillStyle = `rgba(255,${150 + 80 * fire | 0},40,${.9 * fire})`; c.fillRect(cx - 43, top + 3, 86, py - top - 3); }
  c.fillStyle = '#9aa4ae'; c.fillRect(cx - 43, py, 86, 34); c.strokeStyle = '#9aa4ae'; c.lineWidth = 10; c.beginPath(); c.moveTo(cx, py + 34); c.lineTo(cx + 22 * Math.sin(ph * 2 * Math.PI), bot + 22); c.stroke(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(cx, top - 4, 7 + 6 * fire, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.font = '700 19px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.fillText('por dentro do cilindro', cx, y0 + 30); c.fillText('o combustível queima', cx, y0 + h - 30); c.fillText('e empurra o pistão', cx, y0 + h - 8); c.restore(); }
function G01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 7', 'o motor a gasolina'); const drop = 3.0 * (1 - E.outq(E.seg(t, .3, 1.0))), run = E.sseg(t, 1.5, 1.9), q = E.sseg(t, 6.2, 6.6);
  const fr = flyerShot(tw, -1.5, { dy: (t > 1.0 && t < 1.3 ? -.03 * Math.sin((t - 1.0) * 21) : 0) + .008 * Math.sin(t * 47) * run }); drawFlyer(fr, { power: 'gas', drop, run: run > .5, t });
  draw(TORUS(.25), AM.iron, C_(fr, T_(1.78, .1, 0), Rz_(PI / 2), Ry_(t * 20 * run), S_(.14))); draw(BOX, AM.red, C_(fr, T_(1.78, .1, 0), Rx_(t * 20 * run), S_(.03, .3, .04)));
  if (t > 1.4 && t < 2.2) drawSmoke((t - 1.4) * 2, Mx.pt(fr, [.35, -.05, .34]), 6, .7, [-.8, .3]); if (run > .5) for (let i = 0; i < 3; i++) { const a = ((t * 3 + i / 3) % 1); draw(SPH, BM.smoke[2], C_(T_(...Mx.pt(fr, [.3 - a * .9, -.05 + a * .25, .36])), S_(.06 + .1 * a))); }
  const j = drawJack(Object.assign({ root: flyerSeat(fr) }, SEAT, { shL: 1.0, shR: 1.0 - .5 * q, elL: .55, elR: .55 + 1.5 * q, lean: .25 * q, headPitch: .15 * q, smile: 1 - 1.4 * q, mouth: .3, brow: .7 - 1.2 * q, blink: blinkF(t + .9) }));
  if (t > 2.0 && t < 5.9) R.ov2 = c => pistonInset(c, t, lk(t, 2.0, 5.9));
  recap('MOTOR A GASOLINA', 'pequeno, leve e forte', Mx.pt(fr, [1.1, .2, .2]), lk(t, 2.8, 5.6));
  if (q > 0) ovText(Mx.pt(fr, [1.9, .75, 0]), '?', q, '#ffd23f', 80);
}
function H01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 8', 'a hélice');
  if (t < 2.9) { camera([1.6, 2.2, 10.2], [-2, 1.1, 5], .8); R.shC = [-2, 0, 5]; R.shR = 8; drawField(tw); const by = drawBench(-2, 5, 2.6);
    const hits = [.5, 1.0, 1.5], k = hits.filter(h => t >= h).length / 3, pf = C_(T_(-2, by + .1, 5), Rz_(PI / 2), Ry_(PI / 2));
    if (k < 1) draw(BOX, AM.wood, C_(T_(-2, by + .04, 5), S_(1.7, .07, .2 - .05 * k))); else drawProp(C_(T_(-2, by + .08 + .5 * E.sseg(t, 2.2, 2.6), 5), Ry_(PI / 2), Rz_(PI / 2), Rx_(1.2 * E.sseg(t, 2.2, 2.8))), 2, 0);
    hits.forEach((h, n) => drawChips(t, h, [-2 + (n - 1) * .5, by + .1, 5], 70 + n, 6));
    const act = 1 - E.sseg(t, 1.6, 1.9), a = chopSwing(t, .5, .5) * act, P = hamPose(a), ch = 1 - act;
    const j = drawJack(Object.assign(P, { pos: [-2, 0, 4.1], lean: P.lean * act, shR: P.shR * act + 1.2 * ch, elR: P.elR * act + .5 * ch, shL: P.shL * act + 1.2 * ch, elL: P.elL * act + .5 * ch, headPitch: .25, smile: ch, brow: ch, mouth: .3 * ch, blink: blinkF(t) })); if (act > .5) drawAxe(j.hands.R, .9);
  } else if (t < 8.9) { const u = t - 2.9, x = -1.5, fr0 = C_(T_(x, .83, 14)); camera([x + 4.6, 1.9, 17.6], [x + 1.6, 1.0, 14], .62); R.shC = [x, 0, 14]; R.shR = 9; drawField(tw);
    drawFlyer(fr0, { power: 'gas', run: 1, t, prop: 2, propA: u * 2.6 }); drawJack(Object.assign({ root: flyerSeat(fr0) }, SEAT, { shL: 1.0, shR: 1.0, elL: .55, elR: .55, smile: 1, brow: .6 }));
    const n = Mx.pt(fr0, [1.78, .1, 0]), rr = rng(5); for (let i = 0; i < 22; i++) { const ph = ((u * .5 + rr()) % 1), a = rr() * 6.283, rad = .25 + rr() * .6, xr = 1.6 - ph * 4.0, sq = xr < 0 ? .75 : 1; draw(SPH, M('#bfe6ff', { unlit: 1, nosh: 1, a: .9 }), C_(T_(n[0] + xr * (xr < 0 ? 1.5 : 1), n[1] + Math.cos(a) * rad * sq, n[2] + Math.sin(a) * rad * sq), S_(xr < 0 ? .1 : .06, .025, .025))); }
    ovArrow([n[0] - .15, n[1] + .78, n[2]], [n[0] - 1.0, n[1] + .78, n[2]], lk(u, 2.0, 5.9), '#7fd4ff', 'ar para trás'); ovArrow([n[0] - .5, n[1] + .42, n[2] + .5], [n[0] + .25, n[1] + .42, n[2] + .5], lk(u, 3.4, 5.9), '#5ee08a', 'avião para a frente');
    recap('HÉLICE', 'cada pá é uma pequena asa girando', [n[0], n[1], n[2]], lk(u, 3.6, 5.95));
  } else { const u = t - 8.9, x = -3 + .45 * u, jit = .02 * Math.sin(u * 37), fr = flyerShot(tw, x, { dy: jit, pitch: -.02 }); drawFlyer(fr, { power: 'gas', run: 1, t, prop: 2, propA: t * 30 });
    for (let n = 0; n < 5; n++) drawDust(u, .2 + n * .7, [x + 1.2, 0, 14 + (n % 2 ? .5 : -.5)], 5);
    const fz = E.sseg(u, 1.4, 2.0); drawJack(Object.assign({ root: flyerSeat(fr) }, SEAT, { shL: 1.0, shR: 1.0, elL: .55, elR: .55, lean: .15 + .1 * Math.sin(u * 6), smile: 1 - 1.5 * fz, brow: .6 - 1.4 * fz, mouth: .3, blink: blinkF(u) }));
    ovChip('VELOCIDADE: 2 km/h', 360, 250, lk(u, .5, 3.6), 'rgba(170,35,30,.92)'); }
}
