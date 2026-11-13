// Episódio 7 — cenas 4 a 7 e o final: tatuzão, dreno, iluminação, exaustores.
function lined(z1) { drawRings(z1); draw(BOX, TM.concF, C_(T_(0, -.6, z1 / 2), S_(5.2, 1.2, -z1 + 1))); }
function scrapeSparks(u, p, seed) { for (let i = 0; i < 6; i++) { const te = Math.floor(u * 20) / 20 - i * .06; drawSparks(u, te, p, seed + Math.floor(te * 20), 6, .5); } }

// ---------- tentativa 4: tatuzão ----------
function E01(t, g) {
  chipSet('TENTATIVA 4', 'o tatuzão'); const r = RW(t, 25.7, 25.95, 27.1, 14.4), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const spin = Math.max(0, u - 2.2) * 1.5;
  if (u < 9.0) {
    const zf = u < 2 ? 7.5 + 8 * (1 - E.ss(E.seg(u, 0, 1.9))) : 7.5 - 9 * E.ss(E.seg(u, 7.0, 9.0));
    drawValley(tw, { portal: zf < .3 ? 'round' : 'none' });
    if (u < 2.2) camera([15, 5.5, 25], [0, 2.4, 6], .9); else if (u < 7.0) camera([2.2, 2.3, 1.2], [0, 1.6, 7.5], .95); else camera([8.6, 3.0, 10], [0, 1.8, 3], .9);
    R.shC = [0, 0, 4]; R.shR = 12;
    const F = C_(T_(0, TUN.cy, zf)); drawTBM(F, spin);
    for (let i = 0; i < 14; i++) { const te = 7.35 + i * .12, a = i * 2.2; drawDust(u, te, [Math.cos(a) * 2.6, TUN.cy + Math.sin(a) * 2.4, .3], 4, '#c2b6a2'); }
    const pt = E.sseg(u, .4, .8) * (1 - E.sseg(u, 2.0, 2.4));
    drawJack({ pos: [4.8, 0, 10.5], yaw: -2.0, shR: 1.45 * pt, elR: .1, pointR: pt, smile: 1, brow: .7, mouth: .3 * pt, blink: blinkF(u) });
    if (r.v === undefined && u > 2.2 && u < 7.0) { leader('RODA DE CORTE', [1.0, TUN.cy + .8, zf - .4], 360, 260, lk(u, 2.5, 4.9)); leader('DISCOS DE AÇO', Mx.pt(C_(F, Rz_(spin + PI / 3)), [0, 1.9, -.3]), 360, 260, lk(u, 5.0, 6.9)); }
  } else if (u < 13.95) {
    const v = u - 9.0; setInside(.55); lined(-37.5); drawTBM(C_(T_(0, TUN.cy, -44.2)), spin);
    const cz = -1.5 - .7 * v; camera([.9, 1.8, cz], [-.2, 1.6, cz - 12], .95); R.shC = [0, 0, cz - 5]; R.shR = 8;
    const wk = walker(v, 0, 4.9, [-.5, 0, -7.5], [-.8, 0, -11.5], PI);
    drawJack(Object.assign({ pos: wk.pos, yaw: wk.yaw }, wk.w, { headYaw: .4 * Math.sin(v * 1.3), smile: 1, brow: .6, blink: blinkF(v) }));
    if (r.v === undefined) recap('TATUZÃO', 'o buraco sai redondo e liso', [2.3, 3.3, cz - 9], lk(u, 11.4, 13.95));
  } else if (u < 19.95) {
    const v = u - 13.95, ring = -15.75, nd = Math.min(6, Math.max(0, Math.floor((v - .2) / .9))), pr = E.c01(((v - .2) / .9) % 1);
    setInside(.55); lined(-15.0); drawRing(ring, nd); drawErector(ring, nd >= 6 ? 1 : pr, nd); drawTBM(C_(T_(0, TUN.cy, -24.2)), spin);
    camera([.3, 1.4, -5.5], [0, 2.0, -16], .95); R.shC = [0, 0, -12]; R.shR = 8;
    drawJack({ pos: [-.75, 0, -11.6], yaw: PI - .35, headPitch: -.25, smile: 1, brow: .6, mouth: .2, blink: blinkF(v) });
    if (r.v === undefined) { leader('BRAÇO MECÂNICO', [0, TUN.cy + 1.1, ring], 360, 260, lk(v, .3, 2.5)); leader('ANÉIS DE CONCRETO', [-2.4, 2.9, -12.75], 360, 260, lk(v, 2.7, 5.9)); }
  } else {
    const v = u - 19.95, pk = E.sseg(v, 1.9, 4.6); setInside(.55); lined(-36); drawTBM(C_(T_(0, TUN.cy, -44.2)), spin);
    camera([1.6, 1.45, -5.3], [-.4, 1.35, -10.5], .9); R.shC = [0, 0, -9]; R.shR = 7;
    drawDrops(tw, [-6.75, -8.25, -9.75, -11.25, -12.75, -14.25], 1, 4); drawPuddles(pk, 5);
    const look = E.sseg(v, .2, .7) * (1 - E.sseg(v, 1.8, 2.2)), step = E.sseg(v, 3.2, 3.5), sh = v > 3.6 && v < 4.8 ? Math.sin((v - 3.6) * 22) : 0;
    drawJack({ pos: [-.5, 0, -9.6], yaw: PI - .6, headPitch: -.55 * look + .3 * step, hipL: .25 * step + .15 * sh * step, kneeL: .7 * step, abL: .25, abR: .25, smile: -.7, brow: -.6, mouth: .25, blink: blinkF(v + .4) });
    if (v > 3.4 && v < 5) drawSplash(v, 3.45, [-.4, .02, -9.4], .35, 91, 30);
    if (r.v === undefined) { leader('ÁGUA PINGANDO', [-.6, 4.4, -9.75], 360, 260, lk(v, .2, 1.9)); leader('POÇAS NA PISTA', [.8, .02, -12.4], 360, 260, lk(v, 2.5, 5.4)); }
  }
}

// ---------- tentativa 5: dreno ----------
function F01(t, g) {
  chipSet('TENTATIVA 5', 'o dreno'); const r = RW(t, 15.6, 15.85, 16.9, 10.8), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  if (u < 10.6) {
    const tilt = E.sseg(u, .6, 2.0), gut = E.sseg(u, 2.4, 3.4), pk = 1 - E.sseg(u, 5.0, 8.4), fl = E.sseg(u, 4.6, 5.4);
    setInside(.55); drawTunnel(tw, { kind: 'smooth', tilt, gutter: gut }); drawPuddles(pk, 5); drawFlow(tw, fl);
    camera([-.2, 1.8, -1.6], [.4, .5, -11], .92); R.shC = [0, 0, -7]; R.shR = 8;
    const pt = E.sseg(u, 2.6, 3.0) * (1 - E.sseg(u, 4.4, 4.8)), joy = E.sseg(u, 9.2, 9.5);
    drawJack({ pos: [-.9, 0, -7.2], yaw: .65, shL: 1.3 * pt, abL: .25 + .5 * joy, abR: .25 + .5 * joy, elL: .12 + .3 * joy, elR: .12 + .3 * joy, smile: u > 8.5 ? 1 : .4, brow: .5, mouth: .35 * joy, blink: blinkF(u) });
    if (r.v === undefined) {
      ovArrow([-.6, .05, -10], [1.8, -.03, -10], lk(u, .8, 2.6), '#7fd4ff', 'PISTA INCLINADA'); leader('CANALETA', [-2.62, .0, -13], 360, 260, lk(u, 2.9, 4.6));
      recap('DRENO', 'a água escorre e sai do túnel', [-2.62, 0, -12], lk(u, 6.6, 9.0)); if (u > 9.2) ovChip('TUDO SECO', 360, 260, lk(u, 9.25, 10.5), 'rgba(28,130,70,.92)');
    }
  } else {
    const v = u - 10.6, zc = 8 - 9.5 * v, dark = E.sseg(v, 1.6, 2.4), lv = .5 - .43 * dark;
    const drift = E.sseg(v, 2.4, 2.9), scrape = v > 2.9 && v < 4.7, cx = .9 + 1.05 * drift + (scrape ? .03 * Math.sin(v * 40) : 0);
    setInside(lv); drawTunnel(tw, { kind: 'smooth', tilt: 1, gutter: 1 });
    if (v < 1.5) { camera([-1.2, 1.5, -12], [.8, 1.2, 4], .92); R.shC = [cx, 0, Math.min(zc, 0)]; } else { camera([cx - 1.5, 1.75, zc - 4.6], [cx + .3, 1.0, zc], .92); R.shC = [cx, 0, zc]; } R.shR = 8;
    const F = carFrame(cx, zc, PI); drawCar(F, { open: 1, col: CAR.red });
    const gr = scrape ? 1 : 0; driveJack(F, { smile: -.8 * gr + .5 * (1 - gr) * (1 - dark), brow: -1 * gr, mouth: .6 * gr, blink: .4 * gr + blinkF(v) * (1 - gr), headYaw: .3 * gr });
    if (scrape) scrapeSparks(u, Mx.pt(F, [-.9, .55, 0]), 900);
    ovDark(.6 * dark);
  }
}

// ---------- tentativa 6: iluminação ----------
function G01(t, g) {
  chipSet('TENTATIVA 6', 'a iluminação'); const r = RW(t, 14.0, 14.25, 15.3, 4.9), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const lamps = E.seg(u, 1.0, 4.0), lv = .07 + .88 * E.sseg(u, 1.0, 4.2), sm = .6 * E.sseg(u, 7.0, 12.0);
  setInside(lv, .5 * sm); drawTunnel(tw, { kind: 'smooth', asphalt: true, gutter: 1, tilt: 1, lamps });
  draw(BOX, TM.steelD, C_(T_(-2.62, 1.55, -2.2), S_(.08, .35, .25))); draw(BOX, lamps > 0 ? M('#3fd16b', { unlit: 1 }) : M('#a33'), C_(T_(-2.57, 1.62, -2.2), S_(.02, .06, .06)));
  if (u < 4.6) {
    camera([-.9, 1.7, 2.8], [-1.6, 1.9, -12], .95); R.shC = [0, 0, -4]; R.shR = 7;
    const sw = E.sseg(u, .5, .85) * (1 - E.sseg(u, 1.3, 1.6)), turn = E.sseg(u, 1.6, 2.1);
    drawJack({ pos: [-1.95, 0, -2.2], yaw: -PI / 2 - 1.2 * turn, shR: 1.5 * sw, elR: .15, smile: .3 + .7 * turn, brow: .7 * turn, mouth: .3 * turn, blink: blinkF(u) });
    ovDark(.7 * (1 - E.sseg(u, 1.0, 3.6)));
  } else {
    // Jack dirigindo; depois o trânsito para e a fumaça acumula
    const v = u - 4.6, zc = -4 - 10 * E.seg(v, 0, 2.4) - 2 * E.seg(v, 2.4, 6), F = carFrame(.9, zc, PI), cJ = drawCar(F, { open: 1, col: CAR.red, lights: 1 });
    const others = [[.9, -22 + 1.2 * v * 0, PI, CAR.blue], [.9, -28, PI, CAR.yel], [-1.0, -40 + ((v * 7) % 30), 0, CAR.grn], [-1.0, -10 - ((v * 6 + 12) % 30), 0, CAR.wht], [.9, -34, PI, CAR.grn]];
    for (const [x, z, y, col] of others) { const Fo = carFrame(x, z, y); const c = drawCar(Fo, { col, lights: 1 }); drawExhaust(tw + x, c.pipe, E.sseg(v, 1.5, 3), Math.floor(z)); }
    drawExhaust(tw, cJ.pipe, E.sseg(v, 2, 3), 3);
    for (let i = 0; i < 16; i++) { const rr = rng(i + 70); draw(SPH, M('#8f8d88', { a: .3 * sm, nosh: 1, norecv: 1 }), C_(T_(-2 + rr() * 4, .8 + rr() * 2.6, -4 - rr() * 30), S_(1.2 + rr() * 1.5))); }
    const cg = cough(tw, E.sseg(v, 6.4, 6.9));
    if (v < 1.8) { camera([.3, 1.75, zc - 5.2], [.9, 1.25, zc], .9); }
    else if (v < 6.2) { camera([-1.7, 2.6, -6], [.5, 1.1, -24], .95); }
    else { camera([.1, 1.7, zc - 2.7], [.9, 1.45, zc], .88); }
    R.shC = [.9, 0, zc - 3]; R.shR = 9;
    driveJack(F, Object.assign({ smile: 1, brow: .6, mouth: .3 * E.sseg(v, .2, .5) * (1 - E.sseg(v, 1.4, 1.8)), blink: blinkF(v) }, v > 6.3 ? cg : {}));
    ovHaze(.45 * sm);
    if (r.v === undefined) recap('ILUMINAÇÃO', 'lâmpadas do começo ao fim', [1.45, 4.15, zc - 7], lk(u, 4.8, 6.6));
  }
}

// ---------- tentativa 7: exaustores ----------
function H01(t, g) {
  chipSet('TENTATIVA 7', 'os exaustores'); const u = t, tw = g + t;
  const sm = .6 * (1 - E.sseg(u, 4.0, 8.0)), fans = E.seg(u, .4, 2.6), spin = Math.max(0, u - 3.0) * 20;
  setInside(.95, .5 * sm); drawTunnel(tw, { kind: 'smooth', asphalt: true, gutter: 1, tilt: 1, lamps: 1, fans, fanSpin: spin });
  for (let i = 0; i < 16; i++) { const rr = rng(i + 70); draw(SPH, M('#8f8d88', { a: .3 * sm, nosh: 1, norecv: 1 }), C_(T_(-2 + rr() * 4, .8 + rr() * 2.6, -4 - rr() * 30), S_(1.2 + rr() * 1.5))); }
  const move = E.sseg(u, 8.0, 9.0), zc = -8 - 14 * Math.max(0, u - 8.2) * .5 * move;
  const F = carFrame(.9, zc, PI); drawCar(F, { open: 1, col: CAR.red, lights: 1 });
  const flow = u > 7.5 ? (u - 7.5) : 0;
  for (const [x, z0, y, col, sp] of [[.9, -16, PI, CAR.blue, 6], [.9, -23, PI, CAR.yel, 6], [-1.0, -50, 0, CAR.grn, 9], [-1.0, -30, 0, CAR.wht, 9]]) { const z = z0 + (y === 0 ? 1 : -1) * sp * flow; drawCar(carFrame(x, z, y), { col, lights: 1 }); }
  const cg = cough(tw, E.sseg(u, 0, .3) * (1 - E.sseg(u, 4.5, 5.5)));
  if (u < 8.5) { camera([-1.4, 1.5, -2.2], [.5, 3.3, -16], .95); R.shC = [0, 0, -8]; }
  else { camera([-.5, 1.9, zc - 4.6], [.9, 1.3, zc], .9); R.shC = [.9, 0, zc]; } R.shR = 9;
  const wave = u > 9.2 ? E.sseg(u, 9.2, 9.6) : 0;
  driveJack(F, Object.assign({ smile: u > 5.5 ? 1 : .2, brow: .7, mouth: .3 * E.sseg(u, 8.8, 9.2), blink: blinkF(u) }, u < 5.2 ? cg : {}, wave > 0 ? { shL: .3, abL: .3 + 2.2 * wave + .25 * Math.sin(u * 9) * wave, elL: .3 } : {}));
  ovHaze(.45 * sm);
  ovArrow([-.6, 3.0, -16], [-.6, 3.0, -7], lk(u, 3.4, 5.8), '#e8e8e8', 'AR SUJO PRA FORA'); ovArrow([-.3, 1.7, -6], [-.3, 1.7, -16], lk(u, 5.4, 8.0), '#7fd4ff', 'AR LIMPO PRA DENTRO');
  recap('EXAUSTORES', 'trocam o ar do túnel', [.9, 3.85, -10], lk(u, 6.2, 8.4));
}

// ---------- final ----------
function I01(t, g) {
  const tw = g + t; drawValley(tw, { portal: 'modern', asphalt: true }); drawTunnel(tw, { kind: 'smooth', asphalt: true, gutter: 1, tilt: 1, lamps: 1, fans: 1, fanSpin: tw * 20 });
  if (t < 1.2) camera([6.2, 2.2, 15.5], [1, 2.2, 2], .9); else { const k = E.sseg(t, 1.2, 5.0); camera(V.mix([6.2, 2.2, 15.5], [11, 9.5, 36], k), V.mix([1, 2.2, 2], [0, 4.5, 0], k), .9); }
  R.shC = [2, 0, 7]; R.shR = 16;
  for (const [x, z0, y, col] of [[.9, 22, PI, CAR.blue], [.9, 34, PI, CAR.yel], [-1.0, -6, 0, CAR.grn], [-1.0, -22, 0, CAR.wht]]) drawCar(carFrame(x, z0 + (y === 0 ? 1 : -1) * 6 * t, y), { col, lights: 1 });
  const up = E.sseg(t, .2, .5) * (1 - E.sseg(t, 1.1, 1.4)), wv = E.sseg(t, 1.4, 1.8);
  drawJack({ pos: [4.4, 0, 7.4], yaw: .35, abL: .12 + 2.5 * up, abR: .12 + 2.5 * up + 2.4 * wv + .3 * Math.sin(t * 9) * wv, elR: .3 * wv, smile: 1, brow: .8, mouth: .45 * up + .2, blink: blinkF(t) });
  R.fade = .85 * E.sseg(t, 4.8, 5.8); R.title = E.sseg(t, 5.6, 6.6);
}
