// Etapas 6 a 9 e final: navio de madeira, ferro, aço, navio moderno e chegada à ilha.
const topY = (f, x) => (f.o.rise || 0) * Math.pow(Math.abs(x / (f.o.L / 2)), 3);
const HAM = { q: .56 };
function hamPose(a) { return { lean: .35 - .2 * a, shR: .95 + 1.3 * a, elR: .3 + .5 * a, abR: .12, shL: .35, elL: .8, abL: .1 }; }
function leader(txt, p, x, y, k, col) { R.leaders.push({ txt, p, x, y, k: E.c01(k), col }); }
const PAS1 = { jacket: M('#b03a48'), jacketD: M('#8d2c38'), pants: M('#3b3b40'), hair: M('#2b2118') }, PAS2 = { jacket: M('#2f6fb0'), jacketD: M('#255a90'), hair: M('#d9b36a'), skin: M('#c98f62', { rim: .35 }), skinD: M('#b07a50'), pants: M('#5a4632') };

// ---------- etapa 6: navio de madeira ----------
function shipyard(u, tw) {
  camera([8.2, 3.5, 1.7], [.2, 2.1, -5.5], 1.0); R.shC = [0, 1, -4.5]; R.shR = 12; drawBeach(tw);
  const zs = -5.5, fy = sandY(zs) + 2.25, fr = C_(T_(0, fy, zs)); const st = { keel: E.sseg(u, .5, 2.6), posts: E.sseg(u, 2.8, 4.4), ribs: E.seg(u, 5.6, 7.4), planks: E.seg(u, 7.5, 10.1), deck: E.sseg(u, 10.1, 10.6), masts: E.sseg(u, 10.5, 11.1), sails: E.sseg(u, 11.0, 11.5), billow: .25 };
  for (const x of [-2.6, 0, 2.6]) draw(BOX, BM.woodDD, C_(T_(x, sandY(zs) + .16, zs), S_(.5, .34, 1.5)));
  for (const x of [-1.7, 1.7]) for (const s of [1, -1]) draw(BOX, BM.woodD, C_(T_(x, sandY(zs) + .95, zs + s * 1.55), Rx_(s * .5), S_(.1, 2.1, .1)));
  drawWoodShip(fr, st);
  drawCanoe(C_(T_(-5.2, sandY(-1.6) + .36, -1.6), Ry_(.4)), { mast: 1, sail: 1, billow: .15 });
  for (let i = 0; i < 4; i++) draw(BOX, i % 2 ? BM.plank1 : BM.plank2, C_(T_(5.2, sandY(-4) + .05 + i * .07, -4 + i * .05), Ry_(.2 + i * .05), S_(2.6, .06, .28)));
  if (u > 4.7 && u < 6.0) leader('QUILHA', [1.5, fy - 1.85, zs + .1], 360, 250, Math.min((u - 4.7) * 4, (6.0 - u) * 4));
  if (u > 6.0 && u < 7.5) leader('CAVERNAS', [1.5, fy - .9, zs + 1.0], 360, 250, Math.min((u - 6.0) * 4, (7.5 - u) * 4));
  if (u > 7.6 && u < 10.3) leader('CASCO DE TÁBUAS', [2.0, fy - 1.0, zs + 1.05], 360, 250, Math.min((u - 7.6) * 4, (10.3 - u) * 4));
  const work = E.sseg(u, 5.6, 6.0) * (1 - E.sseg(u, 10.3, 10.7)), a = chopSwing(u, 6.0, .5) * work, P = hamPose(a), ch = E.sseg(u, 10.8, 11.2), gd = E.sseg(u, .2, .6) * (1 - E.sseg(u, 5.2, 5.6));
  const j = drawJack(Object.assign(P, { pos: [2.5, sandY(-3.9), -3.9], yaw: PI + .1, lean: P.lean * work, shR: P.shR * work + 2.0 * gd * (.7 + .3 * Math.sin(u * 6)) + 2.7 * ch, elR: P.elR * work + .4 * (gd + ch), shL: P.shL * work + 2.7 * ch, elL: P.elL * work + .3, abR: .12 + .35 * (gd + ch), abL: .1 + .35 * ch, headPitch: -.25, smile: ch, mouth: .45 * ch, brow: ch, blink: blinkF(u + .3) }));
  drawHammer(j.hands.R, HAM.q);
}
function woodSea(u, tw, storm = 0) {
  const z = 30 + 2.2 * u, sink = storm * E.sseg(u, 1.3, 3.4), y = waveH(0, z, tw) + .8 - .75 * sink, f = WS.f;
  const pit = (.03 + .07 * storm) * Math.sin(tw * 1.7), rol = .04 * Math.sin(tw * 1.3) + (.1 * Math.sin(tw * 2.6) + .2 * sink) * storm, fr = C_(T_(0, y, z), Ry_(-PI / 2), Rz_(pit), Rx_(rol));
  if (storm) { camera([6.2, 2.0, z + 5.5], [0, 1.0, z + .6], .95); R.sunC = [.8, .78, .8]; R.sky = [.32, .36, .44]; R.zen = [.2, .25, .33]; R.hor = [.5, .55, .62]; R.fog = [.5, .55, .62]; R.fogD = .01; }
  else if (u < 2.4) camera([5.6, 4.6, z + 7.2], [0, 1.3, z + .2], .95); else camera([3.4, 5.0, z - 8.4], [.5, 1.4, z + .3], .95);
  R.shC = [0, 0, z]; R.shR = 9; drawBeach(tw);
  const crack = storm * E.sseg(u, 1.2, 1.6) * .5; drawWoodShip(fr, { cargo: storm ? 0 : 1, wheel: 1, billow: .8 + .1 * Math.sin(tw * 3), crack, wheelA: Math.sin(tw * 2) * .6 });
  drawWake(fr, 4.5, 1.6, 4.0, -.75);
  const dk = (x, zz) => Mx.pt(fr, [x, topY(f, x) - .14, zz]);
  if (!storm) {
    const p1 = dk(2.6, .42), p2 = dk(2.65, -.42), wv = Math.sin(u * 7);
    drawJack({ pos: p1, yaw: .5, plain: 2, mats: PAS1, abR: 2.2 + .3 * wv, elR: .3, smile: 1, mouth: .3, brow: .5, blink: blinkF(u + 1) });
    drawJack({ pos: p2, yaw: -.4, plain: 1, mats: PAS2, abL: 2.0 - .3 * wv, elL: .3, shR: .3, smile: 1, brow: .5, blink: blinkF(u + 2) });
    drawJack({ pos: dk(-2.98, 0), yaw: 0, shL: 1.0, shR: 1.0, elL: .55 + .15 * Math.sin(tw * 2), elR: .55 - .15 * Math.sin(tw * 2), abL: .05, abR: .05, smile: 1, brow: .5, blink: blinkF(u) });
  } else {
    const pn = E.sseg(u, 1.1, 1.5); drawJack({ pos: dk(.45, 0), yaw: PI / 2 + .5, abL: .3 + 1.9 * pn + .25 * Math.sin(u * 13) * pn, abR: .3 + 1.9 * pn - .25 * Math.sin(u * 13) * pn, elL: .4, elR: .4, mouth: .7 * pn, brow: 1, headYaw: .5 * Math.sin(u * 5) * pn, kneeL: .2, kneeR: .2, hipL: .1, hipR: .1, blink: blinkF(u) });
    const lp = Mx.pt(fr, [1.6, -.75, 1.2]); for (let n = 0; n < 5; n++) drawSplash(u, 1.25 + n * .42, [lp[0] + .5, y - .55 + .75 * sink, lp[2]], .75, 60 + n, 30);
    for (let n = 0; n < 2; n++) { const tau = u - 1.2; if (tau > 0 && tau < 1.2) draw(BOX, BM.plank1, C_(T_(lp[0] + (1.5 + n) * tau, lp[1] + 2.2 * tau - 4.9 * tau * tau, lp[2] + (n ? .6 : -.3) * tau), Rz_(tau * 5 + n), Rx_(tau * 3), S_(1.1, .06, .25))); }
    drawWind(tw, [0, 0, z], [.6, -.8], 14, 9, 7);
  }
}
function S6(t, g) { if (t < 11.6) shipyard(t, g + t); else { woodSea(t - 11.6, g + t); const z = 30 + 2.2 * (t - 11.6); recap('NAVIO DE MADEIRA', 'quilha, cavernas e casco de tábuas', [.6, .3, z + 1.5], recapK(t, 11.9, 14.0)); } chipSet('TENTATIVA 6', 'o navio de madeira'); }

// ---------- etapa 7: ferro e flutuação ----------
function forge(u, tw, morph) {
  camera([2.5, 1.8, -.2], [.75, 1.2, -2.75], .8); R.shC = [1, 0, -2.8]; R.shR = 6; drawBeach(tw);
  const ay = drawAnvil(.9, -2.6); drawForge(2.5, -4.1);
  const hits = morph ? [.35, .85] : [.5, 1.1, 1.7, 2.3, 2.9], per = morph ? .5 : .6, act = morph ? 1 - E.sseg(u, 1.05, 1.3) : 1;
  if (!morph) { const heat = 1 - .85 * E.sseg(u, .4, 3.2); draw(BOX, M('#55555c', { e: [1.6 * heat, .55 * heat, .08 * heat], spec: .4 }), C_(T_(.9, ay + .015, -2.6), S_(.42, .03, .2))); }
  else { const k1 = u >= .35 ? 1 : 0, k2 = u >= .85 ? E.back(E.seg(u, .85, 1.05)) : 0; if (k2 === 0) draw(BOX, BM.iron, C_(T_(.9, ay + (k1 ? .012 : .045), -2.6), S_(k1 ? .3 : .09, k1 ? .024 : .09, k1 ? .18 : .09))); else draw(MINI.g, BM.iron, C_(T_(.9, ay + .13, -2.6), S_(1, k2, 1))); }
  hits.forEach((h, n) => drawSparks(u, h, [.9, ay + .04, -2.58], 80 + n, morph ? 10 : 18));
  const a = chopSwing(u, hits[0], per) * act, P = hamPose(a), ch = 1 - act;
  const j = drawJack(Object.assign(P, { pos: [.9, sandY(-3.3), -3.3], lean: P.lean * act, shR: P.shR * act + .3 * ch, elR: P.elR * act + .5 * ch, headPitch: .3 * act, smile: ch, brow: ch - .3 * act, blink: blinkF(u + 1.3) })); drawHammer(j.hands.R, HAM.q);
}
function tankShot(w, tw, mode, rc = [1.9, 3.7]) { // mode 0: bloco de ferro afunda; mode 1: casco de ferro flutua
  camera([2.1, 1.75, .35], [-.15, 1.12, -2.0], .75); R.shC = [0, 0, -2]; R.shR = 6; drawBeach(tw);
  const ty = drawTable(-.2, -2.0, 1.5, .7, .45), base = .34, floorY = ty + .024, rel = mode ? 1.0 : .7;
  const fall = E.c01((w - rel) / .25), surf = floorY + base; let level = base, obj;
  const hold = { shR: 1.35 - (mode ? .12 * E.sseg(w, .5, 1.0) : 0), elR: .2, abR: .05 };
  const j = drawJack({ pos: [0, sandY(-2.55), -2.55], shR: hold.shR, elR: .2, abR: .05, headPitch: .3, shL: 0, elL: .15, abL: .12 + (mode ? .9 * E.sseg(w, 1.9, 2.3) : 0),
    brow: mode ? E.sseg(w, 1.6, 2.0) : -1 * E.sseg(w, 1.5, 1.9), mouth: mode ? .45 * E.sseg(w, 1.6, 2.0) : .25 * E.sseg(w, 1.5, 1.9), smile: mode ? E.sseg(w, 1.6, 2.0) : -.6 * E.sseg(w, 1.5, 1.9), blink: blinkF(w + .5) });
  const hp = Mx.pt(j.hands.R, [0, 0, 0]);
  if (!mode) { const y0 = hp[1] - .115; let y = y0; if (w >= rel) { const tf = w - rel, yfree = y0 - 4.9 * tf * tf; y = yfree > surf ? yfree : Math.max(floorY + .046, surf - (w - rel - Math.sqrt((y0 - surf) / 4.9)) * .42); }
    obj = [w < rel ? hp[0] : -.2 - (-.2 - hp[0]) * (1 - fall), y, w < rel ? hp[2] + .02 : -2.03]; draw(BOX, BM.iron, C_(T_(obj[0], obj[1], obj[2]), S_(.09)));
    const sunk = E.c01((surf - y) / .09); level = base + .012 * sunk;
    if (y < surf && y > floorY + .05) for (let i = 0; i < 5; i++) { const a = ((w * 2.3 + i * .2) % 1); draw(SPH, WC.foam, C_(T_(obj[0] + .03 * Math.sin(i * 2.4), y + .05 + a * (surf - y - .05), obj[2] + .03 * Math.cos(i * 1.9)), S_(.01))); }
    if (w > rel) drawSplash(w, rel + Math.sqrt(Math.max(0, y0 - surf) / 4.9), [obj[0], surf, obj[2]], .22, 5, 14);
    leader('FERRO MACIÇO: AFUNDA', obj, 235, 240, (w - 1.6) * 4, 'rgba(170,35,30,.92)');
  } else { const y0 = hp[1] - .1, fl = surf + .012 + .045, tf = Math.max(0, w - rel), yfree = y0 - 4.9 * tf * tf, tl = Math.sqrt(Math.max(0, y0 - fl) / 4.9), bob = tf > tl ? .03 * Math.exp(-(tf - tl) * 3) * Math.cos((tf - tl) * 14) : 0;
    const y = w < rel ? y0 : (tf < tl ? yfree : fl - bob), set = tf > tl ? 1 : 0; level = base + .045 * set * (1 - .3 * Math.exp(-(tf - tl) * 4));
    obj = [w < rel ? hp[0] : hp[0] + (-.2 - hp[0]) * E.c01(tf / Math.max(.01, tl)), y + .045 * set * (1 - .3 * Math.exp(-(tf - tl) * 4)) * set, w < rel ? hp[2] + .02 : -2.03]; draw(MINI.g, BM.iron, C_(T_(obj[0], obj[1] + .08, obj[2]), Ry_(.3)));
    if (set) drawSplash(w, rel + tl, [obj[0], surf, obj[2]], .18, 7, 12);
    draw(BOX, M('#c0392b', { unlit: 1, nosh: 1 }), C_(T_(-.2, floorY + base, -2.0 + .262), S_(1.0, .008, .006)));
    recap('CASCO DE FERRO', 'o formato desloca água e flutua', [obj[0], obj[1] + .06, obj[2]], recapK(w, rc[0], rc[1]));
    const sp = proj([-.72, floorY + base + .025, -1.74]), k = E.c01((w - 2.1) * 3); if (k > 0) R.ov2 = c => { c.save(); c.globalAlpha = k; const o = proj([obj[0], obj[1] + .06, obj[2]]); c.lineWidth = 6; c.lineCap = 'round'; c.font = '800 24px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center';
      const arrow = (x, y0a, y1a, col, txt, ty2) => { c.strokeStyle = col; c.fillStyle = col; c.beginPath(); c.moveTo(x, y0a); c.lineTo(x, y1a); c.stroke(); const d = y1a > y0a ? -1 : 1; c.beginPath(); c.moveTo(x - 13, y1a + d * 16); c.lineTo(x, y1a); c.lineTo(x + 13, y1a + d * 16); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.65)'; c.lineWidth = 5; c.strokeText(txt, x, ty2); c.fillStyle = '#fff'; c.fillText(txt, x, ty2); c.lineWidth = 6; };
      arrow(o[0] - 80, o[1] - 150, o[1] - 62, '#ff6b5e', 'PESO', o[1] - 164); arrow(o[0] + 90, o[1] + 30, o[1] - 58, '#5ee08a', 'EMPUXO', o[1] + 62);
      c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.65)'; c.lineWidth = 5; c.textAlign = 'left'; c.strokeText('o nível da água subiu', sp[0] - 20, sp[1] - 150); c.fillText('o nível da água subiu', sp[0] - 20, sp[1] - 150); c.restore(); }; }
  drawTank(-.2, ty, -2.0, level);
}
function S7(t, g) {
  const r = RW(t, 3.4, 3.7, 4.8, .2);
  if (r.v === undefined) { R.fx = r.fx; woodSea(r.t, g + r.tw, 1); chipSet('TENTATIVA 6', 'o navio de madeira'); return; }
  R.fx = r.fx; chipSet('TENTATIVA 7', 'o ferro');
  if (t < 8.2) forge(t - 4.8, g + t); else if (t < 11.3) { const q = RW(t - 8.2, 2.3, 2.45, 3.0, .2); R.fx = Math.max(R.fx, q.fx); tankShot(q.t, g + 8.2 + q.tw, 0); }
  else if (t < 12.7) forge(t - 11.3, g + t, 1); else tankShot(t - 12.7 + .4, g + t, 1);
}

// ---------- etapa 8: aço, rebites, solda e motor ----------
function steelYard(u, tw) {
  camera([6.4, 3.3, .8], [1.45, 2.7, -6], .95); R.shC = [0, 1, -5]; R.shR = 12; drawBeach(tw);
  const zs = -6, fy = sandY(zs) + 2.95, fr = C_(T_(0, fy, zs)); for (const x of [-3.5, 0, 3.5]) draw(BOX, BM.woodDD, C_(T_(x, sandY(zs) + .2, zs), S_(.6, .42, 1.8)));
  drawSteelShip(fr, { plates: E.seg(u, .4, 4.6), rivets: E.seg(u, 4.7, 6.4), deck: 0 });
  const py = 2.0, pz = -3.8; draw(BOX, BM.woodL, C_(T_(1.3, py - .04, pz), S_(2.8, .08, 1.0))); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) draw(BOX, BM.woodD, C_(T_(1.3 + a * 1.3, py / 2 + .2, pz + b * .42), S_(.09, py - .2, .09)));
  draw(BOX, BM.woodD, C_(T_(1.3, py + .9, pz + .47), S_(2.8, .06, .06)));
  const ph = u < 4.6 ? 0 : u < 6.5 ? 1 : 2, xj = ph === 2 ? .9 + .8 * E.seg(u, 6.6, 8.5) : 1.2, wv = Math.sin(u * 5);
  const a = ph === 1 ? chopSwing(u, 4.75, .28) : 0;
  const j = drawJack({ pos: [xj, py, -3.98], yaw: PI, mask: ph === 2 ? 1 : 0, shR: ph === 0 ? 2.3 + .25 * wv : ph === 1 ? 1.3 + .45 * a : 1.4, elR: ph === 0 ? .4 : ph === 1 ? .35 + .6 * a : .3, abR: ph === 0 ? .4 : .08, shL: ph === 2 ? .9 : .2, elL: ph === 2 ? .8 : .2, headPitch: ph === 0 ? -.2 : .05, smile: ph === 0 ? 1 : 0, brow: ph === 0 ? .6 : -.2, blink: blinkF(u + .2) });
  if (ph === 1) { const hm = drawHammer(j.hands.R, .25); for (let n = 0; n < 6; n++) drawSparks(u, 4.75 + n * .28, Mx.pt(hm, [0, 0, 0]), 120 + n, 6, .6); }
  if (ph === 2) { const tip = drawTorch(j.hands.R, u); for (let n = 0; n < 14; n++) drawSparks(u, 6.55 + n * .15, tip, 140 + n, 9, .8); const k = .6 + .4 * Math.sin(u * 61) * Math.sin(u * 37);
    R.ov2 = c => { const p = proj(tip); c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], 150); gr.addColorStop(0, `rgba(190,225,255,${.75 * k})`); gr.addColorStop(1, 'rgba(120,180,255,0)'); c.fillStyle = gr; c.fillRect(p[0] - 150, p[1] - 150, 300, 300); c.restore(); };
    leader('SOLDAGEM', tip, 360, 250, Math.min((u - 6.7) * 4, (8.5 - u) * 4)); }
  if (u > .9 && u < 4.5) leader('CHAPAS DE AÇO', Mx.pt(fr, SS.f(.47, .9, 1)), 400, 250, Math.min((u - .9) * 4, (4.5 - u) * 4));
  if (u > 4.8 && u < 6.4) leader('REBITES', Mx.pt(fr, SS.riv[40]), 400, 250, Math.min((u - 4.8) * 4, (6.4 - u) * 4));
}
function engineIn(u, tw) {
  camera([9.2, 6.4, 2.6], [-.2, 2.9, -6], 1.05); R.shC = [0, 1, -5]; R.shR = 13; drawBeach(tw);
  const zs = -6, fy = sandY(zs) + 2.95, fr = C_(T_(0, fy, zs)); for (const x of [-3.5, 0, 3.5]) draw(BOX, BM.woodDD, C_(T_(x, sandY(zs) + .2, zs), S_(.6, .42, 1.8)));
  const ey = 5.2 - 6.8 * E.sseg(u, .3, 2.2), fn = E.sseg(u, 2.6, 3.3); drawSteelShip(fr, { deck: u > 2.3 ? 1 : 0, engine: ey, funnel: fn, t: u });
  for (const s of [1, -1]) draw(BOX, M('#c9a227'), C_(T_(-1.6, 5.5, zs + s * 2.9), S_(.3, 11, .3))); draw(BOX, M('#c9a227'), C_(T_(-1.6, 10.9, zs), S_(.4, .4, 6.2)));
  if (u < 2.4) draw(CYL, BM.black, C_(T_(-1.6, (10.7 + fy + ey + .4) / 2, zs), S_(.03, 10.7 - fy - ey - .4, .03)));
  const gd = 1 - E.sseg(u, 2.2, 2.6), ch = E.sseg(u, 3.3, 3.6);
  drawJack({ pos: [3.0, sandY(-3.2), -3.2], yaw: PI + .5, shR: 2.4 * gd + 2.7 * ch - .5 * gd * Math.sin(u * 4), elR: .4, abR: .3, shL: 2.7 * ch, elL: .3, abL: .1 + .3 * ch, headPitch: -.35 * gd, smile: ch, mouth: .4 * ch, brow: .5 + .5 * ch, blink: blinkF(u + .6) });
}
function steelSea(u, tw) {
  const z = 30 + 3 * u, y = waveH(0, z, tw) + 1.0, f = SS.f, fr = C_(T_(0, y, z), Ry_(-PI / 2), Rz_(.02 * Math.sin(tw * 1.5)));
  camera([9.5, 4.8, z + 10.5], [-.6, 1.6, z - 1.2], 1.0); R.shC = [0, 0, z]; R.shR = 12; drawBeach(tw);
  drawSteelShip(fr, { funnel: 1, ribs: 0 }); drawSmoke(tw, Mx.pt(fr, [-1.6, 3.3, 0]), 2.2, 1.5, [0, -2.2]); drawWake(fr, 6, 1.9, 5.6, -.95);
  drawJack({ pos: Mx.pt(fr, [3.9, topY(f, 3.9) - .1, 0]), yaw: .35, abR: 2.2 + .3 * Math.sin(u * 7), elR: .3, smile: 1, mouth: .35, brow: .6, blink: blinkF(u + 1) });
}
function S8(t, g) { if (t < 8.6) steelYard(t, g + t); else if (t < 12.0) engineIn(t - 8.6, g + t); else { steelSea(t - 12.0, g + t); const z = 30 + 3 * (t - 12); recap('NAVIO DE AÇO', 'chapas, rebites, solda e motor', [1.2, 1.2, z - 1], recapK(t, 12.2, 13.9)); } chipSet('TENTATIVA 8', 'o aço e os motores'); }

// ---------- etapa 9: navio moderno ----------
function xray(u, tw) {
  R.zen = [.015, .04, .1]; R.hor = [.03, .09, .19]; R.fog = [.03, .09, .19]; R.fogD = 0; R.sun = V.norm([.2, .6, .75]); R.sky = [.45, .55, .75]; R.gnd = [.25, .3, .4]; R.t = tw;
  const k = E.sseg(u, 0, 4.6); camera([-21 + 7 * k, 2.5, 27], [-16 + 9 * k, -1.8, 0], .92); R.shC = [-10, 0, 0]; R.shR = 30;
  drawCargo(Mx.I(), { t: u, cut: 1, cutSide: 1 });
  draw(BOX, BM.steel, C_(T_(-14.2, -4.75, 0), S_(4.8, .5, 3.4))); draw(BOX, BM.steel2, C_(T_(-6, -5.02, 0), S_(30, .06, 6)));
  drawJack({ pos: [-11.2, -4.99, 1.2], yaw: .2, abR: 2.2 + .3 * Math.sin(u * 6), elR: .3, smile: 1, mouth: .35, brow: .6, blink: blinkF(u + .4) });
  leader('MOTOR', [-14.2, -2.6, 1.5], 230, 250, (u - .3) * 4); leader('HÉLICE', [-22.3, -3.3, 0], 170, 330, (u - 1.5) * 4); leader('COMPARTIMENTOS ESTANQUES', [-3.4 + 0, -1.5, 3.1], 430, 410, (u - 2.7) * 4);
}
function bridge(u, tw) {
  const z = 60 + 3.5 * u, fr = C_(T_(0, 2.2 + .15 * Math.sin(tw * .8), z), Ry_(-PI / 2)), sx = -15.5;
  camera(Mx.pt(fr, [sx + 7.6, 9.4, 5.6]), Mx.pt(fr, [sx + 1.3, 8.45, 1.5]), .8); R.shC = [0, 0, z]; R.shR = 30; drawBeach(tw);
  drawCargo(fr, { t: u + 3 }); drawWake(fr, 20, 5, 22, -2.1);
  drawJack({ pos: Mx.pt(fr, [sx + 1.5, 7.8, 2.2]), yaw: 0, shR: 1.45 * E.sseg(u, .5, 1.1), elR: .12, pointR: E.sseg(u, .5, 1.1), abL: .5, elL: 1.4, twL: -.6, smile: 1, brow: .6, mouth: .3 * E.sseg(u, 1.2, 1.6), blink: blinkF(u + 2.2) });
  leader('NAVEGAÇÃO: RADAR E GPS', Mx.pt(fr, [sx + .6, 9.4, 0]), 400, 250, Math.min((u - .2) * 4, (.9 - u) * 4));
  recap('NAVIO MODERNO', 'hélice, compartimentos e radar', Mx.pt(fr, [sx + .6, 9.4, 0]), recapK(u, .9, 2.8));
  const a = u * 3.2; R.ov2 = c => { c.save(); const cx = 585, cy = 560, r = 84; c.globalAlpha = E.c01((u - .4) * 3); c.fillStyle = 'rgba(6,26,18,.88)'; c.beginPath(); c.arc(cx, cy, r + 10, 0, 7); c.fill(); c.strokeStyle = '#43e08a'; c.lineWidth = 2; for (const q of [r, r * .66, r * .33]) { c.beginPath(); c.arc(cx, cy, q, 0, 7); c.stroke(); }
    c.beginPath(); c.moveTo(cx - r, cy); c.lineTo(cx + r, cy); c.moveTo(cx, cy - r); c.lineTo(cx, cy + r); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.stroke();
    c.fillStyle = '#9dffc6'; for (const [bx, by] of [[30, -45], [-50, 20], [15, 60]]) { c.beginPath(); c.arc(cx + bx, cy + by, 5, 0, 7); c.fill(); } c.restore(); };
}
function S9(t, g) { if (t < 4.6) xray(t, g + t); else bridge(t - 4.6, g + t); chipSet('TENTATIVA 9', 'o navio moderno'); }

// ---------- final ----------
function fleet(tw, cz) {
  drawLog(C_(T_(-2.2, waveH(-2.2, 2.4, tw) + .05, 2.4), Ry_(.5)), LOGL, LOGR);
  drawRaft(C_(T_(-.5, raftY(-.5, 4.6, tw) + .04, 4.6), Ry_(.3)), {});
  drawCanoe(C_(T_(1.8, waveH(1.8, 8, tw) + .2, 8), Ry_(1.2)), { afloat: 1 });
  drawWoodShip(C_(T_(6.2, .8, 17), Ry_(1.25), Rx_(.03 * Math.sin(tw))), { billow: .5, wheel: 1 });
  const sf = C_(T_(11.5, 1.0, 28), Ry_(1.25)); drawSteelShip(sf, { funnel: 1, ribs: 0 }); drawSmoke(tw, Mx.pt(sf, [-1.6, 3.3, 0]), 2, 1.4, [.5, .3]);
  drawCargo(C_(T_(26, 2.2, cz), Ry_(1.3)), { t: tw });
}
function arrive(u, tw) {
  const cz = 110 - 52 * E.outq(E.seg(u, 0, 4.5)); camera(V.mix([-1.5, 1.7, -4.2], [-2.2, 2.1, -5.4], E.sseg(u, 0, 4.5)), [8, 3.2, 30], .95); R.shC = [0, 0, 5]; R.shR = 16;
  drawBeach(tw, { island: 1 }); const fr = C_(T_(26, 2.2, cz), Ry_(1.3)); drawCargo(fr, { t: tw }); drawWake(fr, 18, 5, 22, -2.1);
  drawJack({ pos: Mx.pt(fr, [20.6, topY(CG.f, 20.6) - .05, 0]), yaw: PI + .3, abR: 2.2 + .35 * Math.sin(u * 7), elR: .3, smile: 1 });
}
function lineup(u, tw) {
  const k = E.sseg(u, 0, 4.6); camera(V.mix([-3.0, 1.1, -.4], [-5.6, 3.4, -7.4], k), V.mix([-1.9, .3, 3], [4.5, 1.0, 15], k), .92); R.shC = [0, 0, 5]; R.shR = 20;
  drawBeach(tw, { island: 1 }); fleet(tw, 58);
  const op = E.sseg(u, 3.6, 4.4); drawJack({ pos: [-2.4, sandY(-1.6), -1.6], yaw: .45, abL: .15 + 1.1 * op, abR: .15 + 1.1 * op, elL: .3, elR: .3, headPitch: -.1, smile: 1, blink: blinkF(u) });
}
function closing(u, tw) {
  camera(V.mix([-1.95, 1.75, -3.9], [-2.0, 1.72, -3.6], E.sseg(u, 0, 3.5)), [-2.4, 1.42, -1.6], .68); R.shC = [0, 0, 2]; R.shR = 20;
  drawBeach(tw, { island: 1 }); fleet(tw, 58);
  const tu = E.sseg(u, 0, .7), th = E.sseg(u, .8, 1.2), bob = .03 * Math.abs(Math.sin(u * 5)) * E.sseg(u, 1.2, 1.5);
  drawJack({ pos: [-2.4, sandY(-1.6) + bob, -1.6], yaw: .45 + (2.94 - .45) * tu, shR: .55 * th, elR: 2.2 * th, abR: .12 + .25 * th, pointR: th, abL: .12 + .5 * th, elL: .15 + 1.3 * th, twL: -.6 * th, smile: 1, mouth: .35 + .25 * Math.sin(u * 6) * E.sseg(u, 1.0, 1.3) * (1 - E.sseg(u, 3.0, 3.3)), brow: .8, blink: u > 2.5 && u < 2.68 ? 1 : 0 });
}
function S10(t, g) {
  if (t < 4.5) arrive(t, g + t); else if (t < 10) lineup(t - 4.5, g + t); else closing(Math.min(t - 10, 4.3), g + t);
  R.fade = E.seg(t, 13.4, 14.2) * .9; R.title = E.seg(t, 14.0, 14.7) * (1 - E.seg(t, 16.1, 16.5));
}
