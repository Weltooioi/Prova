// Episódio 6, tentativas 9 a 14 e final: rodas, comandos, alumínio, cabine, trem recolhível, jato, pressurização e interior.
function I01(t, g) {
  chipSet('TENTATIVA 9', 'o trem de pouso'); const r = RW(t, 9.8, 10.1, 10.9, 6.4), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const tc = 9.42, uu = Math.min(u, tc), x = uu < 1.8 ? -20 : uu < 5.9 ? -20 + 1.6 * (uu - 1.8) * (uu - 1.8) : 6.9 + 13.1 * (uu - 5.9), tau = Math.max(0, uu - 5.9), dy = 3.4 * (1 - Math.exp(-tau * .7)), stuck = u >= tc;
  const fr = flyerShot(tw, x, { wheels: 1, dy, pitch: stuck ? -.45 : .09 * E.sseg(u, 5.6, 6.3) * (1 - E.sseg(u, 6.8, 7.6)), roll: stuck ? .3 : 0 }); drawTree(57.5, 14, 2.2, 7);
  drawFlyer(fr, { power: 'gas', run: 1, t: u, prop: 2, propA: u * 31, wheels: E.sseg(u, .4, 1.4), roll: (x + 20) / .29 });
  const pn = E.sseg(u, 7.3, 7.8), sw = .4 * Math.sin(u * 7) * pn;
  drawJack(Object.assign({ root: C_(flyerSeat(fr), Rz_(sw)) }, SEAT, { shL: 1.0, shR: 1.0, elL: .55, elR: .55, smile: 1 - 1.5 * pn, mouth: .35 + .4 * pn, brow: .7 + .3 * pn, headYaw: -.3 * pn, blink: blinkF(u) }));
  if (stuck) { const d = u - tc, rr = rng(6); for (let i = 0; i < 18; i++) { const a = rr() * 6.283, sp = 1 + rr() * 2.5; draw(SPH, i % 2 ? AM.crown : AM.crownD, C_(T_(x + 2 + Math.cos(a) * sp * d, 4.6 + (1.5 + rr() * 2) * d - 4.9 * d * d, 14 + Math.sin(a) * sp * d), S_(.16 * Math.max(0, 1 - d)))); } }
  if (r.v === undefined) { leader('TREM DE POUSO', Mx.pt(fr, [.7, -.5, .62]), 360, 250, lk(u, .7, 2.9)); recap('RODAS', 'dão velocidade para decolar', Mx.pt(fr, [.7, -.5, .62]), lk(u, 3.3, 5.6)); if (u > 5.8 && u < 7.1) ovChip('DECOLOU!', 360, 250, lk(u, 5.85, 7.1), 'rgba(28,130,70,.92)'); }
}
function J01(t, g) {
  chipSet('TENTATIVA 10', 'os comandos de voo'); const r = RW(t, 14.0, 14.25, 15.0, 11.4), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const x = 13 * u, dive = E.inq(E.seg(u, 13.2, 14.1)), y = 6 - 3.2 * dive, z = 14;
  const a1 = Math.sin((u - .8) * 3.2) * (u > .8 && u < 3.0 ? 1 : 0), a2 = Math.sin((u - 3.1) * 3.0) * (u > 3.1 && u < 5.6 ? 1 : 0), a3 = Math.sin((u - 5.7) * 3.0) * (u > 5.7 && u < 8.4 ? 1 : 0);
  const ctrl = { rud: .5 * a1, elev: .45 * a2, ail: .45 * a3, hl: { rud: u > .8 && u < 3.0, elev: u > 3.1 && u < 5.6, ail: u > 5.7 && u < 8.4 } };
  const fr = C_(T_(x, y, z), Ry_(.1 * a1), Rz_(.09 * a2 - .8 * dive), Rx_(.24 * a3)); const tear = E.sseg(u, 11.7, 13.2);
  if (u < 8.6) camera([x - 9.0, y + 3.4, z + 7.0], [x - 1.3, y + .3, z], .95); else if (u < 11.2) camera([x + 4.4, y + .9, z + 1.6], [x + .2, y + .42, z], .8); else camera([x + 6.6, y + 1.6 + 1.5 * dive, z + 8.6], [x + .3, y + .3, z], .92);
  R.shC = [x, 0, z]; R.shR = 12; drawField(tw, { noTree: 1 });
  const pn = E.sseg(u, 12.6, 13.2);
  const jj = drawJack(Object.assign({ root: flyerSeat(fr) }, SEAT, { shL: 1.0, shR: .8 + .07 * Math.sin(u * 3), elL: .55, elR: .8, abR: -.28 + .08 * Math.cos(u * 2.2), smile: 1 - 1.6 * pn, mouth: .3 + .5 * pn, brow: .7 + .3 * pn, blink: blinkF(u) }));
  drawFlyer(fr, { power: 'gas', run: 1, t: u, prop: (u >= 8.6 && u < 11.2) ? 0 : 2, propA: u * 31, wheels: 1, roll: u * 3, ctrl, tear, stick: [0, 0], stickTo: Mx.pt(jj.hands.R, [0, 0, 0]), ped: Math.sin(u * 2.5) });
  if (u >= 8.6 && u < 11.2) { draw(SPH, AM.woodD, C_(fr, T_(1.78, .1, 0), S_(.1, .09, .09))); draw(CYL, M('#d9b27a', { a: .2, nosh: 1 }), C_(fr, T_(1.78, .1, 0), Rz_(PI / 2), S_(.8, .012, .8))); }
  if (u > 11.3) { drawWind(tw, [x, y - 1.5, z], [-1, 0], 12, 8, 3); const rr = rng(9); for (let i = 0; i < 10; i++) { const te = 11.8 + i * .16, d = u - te; if (d > 0 && d < 1.1) draw(BOX, AM.cloth, C_(T_(...Mx.pt(fr, [.2 - 9 * d, 1.1 + (rr() - .3) * 2 * d - 2 * d * d, (rr() - .5) * 6])), Rx_(d * 9 + i), Rz_(d * 7), S_(.35, .012, .25))); } }
  if (r.v === undefined) { leader('LEME: vira para os lados', Mx.pt(fr, [-3.7, .55, 0]), 360, 250, lk(u, .9, 3.0)); leader('PROFUNDOR: sobe e desce', Mx.pt(fr, [-3.85, .02, .7]), 360, 250, lk(u, 3.2, 5.6)); leader('AILERONS: inclinam o avião', Mx.pt(fr, [-.6, 1.27, -2.75]), 360, 250, lk(u, 5.8, 8.4));
    leader('MANCHE', Mx.pt(jj.hands.R, [0, 0, 0]), 570, 300, lk(u, 8.8, 11.1)); leader('PEDAIS', Mx.pt(fr, [.62, -.1, .16]), 570, 400, lk(u, 9.6, 11.1));
    if (u > 11.6 && u < 13.9) ovChip('O TECIDO RASGA!', 360, 250, lk(u, 11.7, 13.9), 'rgba(170,35,30,.92)'); }
}
function K01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 11', t < 8.2 ? 'a estrutura de alumínio' : 'a cabine fechada');
  if (t < 5.4) { camera([9.3, 3.4, 23.9], [1.9, 1.25, 14], 1.02); R.shC = [0, 0, 14]; R.shR = 11; drawField(tw); const fr = C_(T_(0, 1.38, 14));
    drawMetal(fr, { frame: 1, panels: E.sseg(t, .8, 3.0), wings: E.sseg(t, 2.9, 3.9), cowl: t > 3.9 ? 1 : 0, prop: 3, propA: 0 });
    const work = 1 - E.sseg(t, 4.1, 4.4), a = chopSwing(t, 1.0, .4) * work, ch = 1 - work;
    const j = drawJack({ pos: [4.35, 0, 15.3], yaw: -PI / 2 - .35, shR: (1.35 + .45 * a) * work + 2.7 * ch, elR: (.35 + .6 * a) * work + .3 * ch, abR: .1 + .3 * ch, shL: 2.7 * ch, elL: .3, abL: .1 + .3 * ch, smile: ch, mouth: .4 * ch, brow: ch, blink: blinkF(t) }); if (work > .5) drawHammer(j.hands.R, .25);
    recap('ALUMÍNIO', 'metal leve e resistente', Mx.pt(fr, [.8, .3, .5]), lk(t, 2.7, 5.2));
  } else { const u = t - 5.4, x = 20 * u, y = 30, fr = C_(T_(x, y, 14), Rz_(.02 * Math.sin(u * 2))), cn = E.sseg(t, 8.4, 9.2), cold = 1 - E.sseg(t, 9.0, 9.5);
    setSky(.35); camera([x + 3.5, y + 1.15, 17.7], [x + .35, y + .55, 14], .72); R.shC = [x, 0, 14]; R.shR = 12; drawField(tw, { noTree: 1 });
    drawMetal(fr, { canopy: cn, propA: u * 31, gear: 1 }); const sh = Math.sin(u * 43) * .03 * cold;
    drawJack(Object.assign({ root: metalSeat(fr) }, SEAT, { mats: cold > .5 ? FROZEN : null, shL: 1.0, shR: 1.0, elL: .6, elR: .6, lean: sh, headYaw: sh * 4, mouth: cold > .5 ? .15 + .15 * Math.sin(u * 40) : .3, brow: cold > .5 ? -.2 : .7, smile: cold > .5 ? -.6 : 1, blink: blinkF(u) }));
    if (cn < .95) drawWind(tw, [x + 1, y - .6, 14], [-1, 0], 14, 5, 6);
    if (t < 8.3) ovChip('−30 °C', 360, 250, lk(t, 5.6, 8.3), 'rgba(40,110,190,.92)'); recap('CABINE FECHADA', 'protege do vento e do frio', Mx.pt(fr, [.78, .7, .1]), lk(t, 8.8, 10.15)); }
}
function gauge(c, cx, cy, r, k, label, k2) { c.save(); c.globalAlpha = E.c01(k2); c.fillStyle = 'rgba(10,20,36,.9)'; c.beginPath(); c.arc(cx, cy, r + 12, 0, 7); c.fill(); c.lineWidth = 10; c.strokeStyle = '#3d4b5f'; c.beginPath(); c.arc(cx, cy, r - 8, Math.PI * .8, Math.PI * 2.2); c.stroke(); c.strokeStyle = '#e0443a'; c.beginPath(); c.arc(cx, cy, r - 8, Math.PI * 1.95, Math.PI * 2.2); c.stroke();
  const a = Math.PI * (.8 + 1.4 * E.c01(k)); c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18)); c.stroke(); c.fillStyle = '#fff'; c.font = '700 20px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.fillText(label, cx, cy + r * .62); c.restore(); }
function L01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 12', 'o trem de pouso recolhível'); const x = t < 3 ? -20 + 2.2 * t * t : -.2 + 13.2 * (t - 3) + 2.5 * Math.max(0, t - 4.3) * Math.max(0, t - 4.3) * .5, tau = Math.max(0, t - 2.2), y = 1.38 + 4.6 * (1 - Math.exp(-tau * .6)), rt = E.sseg(t, 2.9, 4.3), lim = E.sseg(t, 7.2, 7.6);
  const jit = lim * .03 * Math.sin(t * 53), fr = C_(T_(x, y + jit, 14), Rz_(.1 * E.sseg(t, 2.0, 2.8) * (1 - E.sseg(t, 4.5, 5.5)) + jit));
  camera([x + 7.2, y + 1.7, 22.6], [x + .3, y + .15, 14], .94); R.shC = [x, 0, 14]; R.shR = 12; drawField(tw, { noTree: 1 });
  drawMetal(fr, { canopy: 1, propA: t * 33, gear: rt }); drawJack(Object.assign({ root: metalSeat(fr) }, SEAT, { shL: 1.0, shR: 1.0, elL: .6, elR: .6, smile: 1 - lim, brow: .7 - lim, blink: blinkF(t) }));
  if (t > 4.3) drawWind(tw, [x, y - 1, 14], [-1, 0], 10, 8, 5);
  const sp = t < 3 ? .32 * t / 3 : t < 4.3 ? .32 + .1 * (t - 3) / 1.3 : Math.min(.93, .42 + .2 * (t - 4.3)) + lim * .02 * Math.sin(t * 40);
  R.ov2 = c => gauge(c, 590, 330, 74, sp, 'km/h', lk(t, .4, 9.5));
  recap('TREM RECOLHÍVEL', 'menos resistência do ar', Mx.pt(fr, [.55, -.4, 1.3]), lk(t, 3.9, 6.8)); leader('LIMITE DA HÉLICE', Mx.pt(fr, [3.12, 0, 0]), 300, 250, lk(t, 7.4, 9.5), 'rgba(170,35,30,.92)');
}
function blue() { R.zen = [.015, .04, .1]; R.hor = [.03, .09, .19]; R.fog = [.03, .09, .19]; R.fogD = 0; R.sun = V.norm([.2, .6, .75]); R.sky = [.45, .55, .75]; R.gnd = [.25, .3, .4]; }
function cabinPeople(fr, u, dz, hi) { const mats = dz > .5 ? DIZZY : null, lol = dz * .5 * Math.sin(u * 1.7), sm = 1 - 2 * dz;
  drawJack(Object.assign({ root: cabinSeat(fr, 2, .26) }, SEAT, { mats, shL: .5, shR: hi ? 1.9 + .3 * Math.sin(u * 7) : .5, elL: .9, elR: hi ? .5 : .9, abR: hi ? .5 : .12, headYaw: lol + (hi ? .0 : 0), headPitch: .3 * dz, smile: sm, mouth: .3 + .3 * dz, brow: .7 - 1.3 * dz, blink: dz > .5 ? .6 : blinkF(u) }));
  drawJack(Object.assign({ root: cabinSeat(fr, 3, -.26) }, SEAT, { plain: 2, mats: dz > .5 ? Object.assign({}, PAS1, DIZZY) : PAS1, shL: .5, shR: .5, elL: .9, elR: .9, headYaw: -lol, headPitch: .35 * dz, smile: sm, mouth: .3, brow: .6 - 1.2 * dz, blink: dz > .5 ? .6 : blinkF(u + 1) }));
  drawJack(Object.assign({ root: cabinSeat(fr, 1, .72) }, SEAT, { plain: 1, mats: dz > .5 ? Object.assign({}, PAS3, DIZZY) : PAS3, shL: .5, shR: .5, elL: .9, elR: .9, headYaw: lol * .8, headPitch: .3 * dz, smile: sm, brow: .6 - 1.2 * dz, blink: dz > .5 ? .6 : blinkF(u + 2) })); }
function M01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 13', 'o motor a jato');
  if (t < 2.6) { const x = -25 + 30 * t, fr = C_(T_(x, 40, 14), Rz_(.05)); setSky(.3); camera([x + 22, 45, 54], [x + 1, 39.6, 14], .9); R.shC = [x, 0, 14]; R.shR = 30; drawField(tw, { noTree: 1 }); drawAirliner(fr, { t }); recap('MOTOR A JATO', 'empurra o avião sem hélice', Mx.pt(fr, [.9, -1.2, 3.4]), lk(t, .5, 2.55)); }
  else if (t < 8.3) { const u = t - 2.6; blue(); R.t = tw; camera([.2, 1.2, 10.4], [0, -.75, 0], .86); R.shC = [0, 0, 0]; R.shR = 7; drawJetCut(Mx.I(), u);
    draw(BOX, AM.aluD, C_(T_(1.5, -2.84, 1.6), S_(1.3, .08, 1.0))); drawJack({ pos: [1.5, -2.8, 1.6], yaw: -.6, shR: 1.5, elR: .2, abR: .3, pointR: 1, abL: .5, elL: 1.4, twL: -.6, smile: 1, brow: .6, mouth: .3, blink: blinkF(u) });
    leader('1  SUGA O AR', [2.2, .55, .6], 540, 250, (u - .2) * 4); leader('2  COMPRIME', [.65, .62, .55], 420, 320, (u - 1.1) * 4); leader('3  QUEIMA', [-.75, .5, .5], 280, 390, (u - 1.8) * 4); leader('4  EXPULSA OS GASES', [-2.4, .3, .4], 200, 460, (u - 3.1) * 4); }
  else if (t < 10.6) { const u = t - 8.3, k = E.sseg(u, 0, 2.3), x = 30 * u, y = 60 + 25 * u, fr = C_(T_(x, y, 14), Rz_(.22)); setSky(.25 + .7 * k); camera([x + 20, y - 5, 50], [x + .5, y + .5, 14], .9); R.shC = [x, 0, 14]; R.shR = 30; drawField(tw, { noTree: 1 }); drawAirliner(fr, { t });
    for (let i = 0; i < 6; i++) draw(SPH, AM.cloud, C_(T_(x - 30 + i * 22, y - 14 - (i % 2) * 5, -20 - i * 9), S_(16, 5, 9))); ovChip('ALTITUDE: ' + (Math.round((2 + 9 * k) * 10) / 10).toFixed(1).replace('.', ',') + ' km', 360, 250, lk(u, .2, 2.3)); }
  else { const u = t - 10.6; blue(); R.zen = [.01, .03, .16]; R.hor = [.08, .16, .4]; R.fog = R.hor; R.t = tw; camera([4.2, .9, 6.6], [3.75, -.02, 0], .7); R.shC = [3, 0, 0]; R.shR = 9; drawAirliner(Mx.I(), { t, cut: 1 }); cabinPeople(Mx.I(), u, E.sseg(u, 0, .6), 0); ovChip('FALTA OXIGÊNIO', 360, 250, lk(u, .2, 2.0), 'rgba(170,35,30,.92)'); }
}
function N01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 14', t < 4.6 ? 'a cabine pressurizada' : 'o interior'); blue(); R.zen = [.01, .03, .16]; R.hor = [.08, .16, .4]; R.fog = R.hor; R.t = tw;
  const cx = t < 4.8 ? 3.75 : remap(t, [[4.8, 3.75], [6.6, 4.5], [9.3, 4.3], [9.9, 1.6], [10.4, 1.2], [10.85, -5.2], [11.5, -5.4], [12.0, 6.8], [13.6, 7.9], [14.2, 2.6], [15.4, 2.3], [15.9, .5], [17.4, .6]]), cy = t > 13.7 && t < 15.6 ? -.15 * Math.min(E.sseg(t, 13.7, 14.2), 1 - E.sseg(t, 15.2, 15.6)) : 0, dd = t < 4.8 ? 6.6 : 6.6 - 1.2 * E.sseg(t, 4.8, 6.4);
  camera([cx + .45, .9 + cy, dd], [cx, -.02 + cy, 0], .7); R.shC = [cx, 0, 0]; R.shR = 9; const dz = 1 - E.sseg(t, 1.2, 1.9); drawAirliner(Mx.I(), { t, cut: 1 }); cabinPeople(Mx.I(), t, dz, t > 5 && t < 9);
  if (t < 4.6) { const k = lk(t, .3, 4.5); R.ov2 = c => { c.save(); c.globalAlpha = E.c01(k); c.strokeStyle = '#7fd4ff'; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const ph = ((t * .6 + i / 6) % 1), x = 60 + ph * 600, y = 565 + 22 * Math.sin(ph * 9); c.globalAlpha = E.c01(k) * Math.sin(ph * Math.PI); c.beginPath(); c.moveTo(x - 16, y - 16); c.lineTo(x, y); c.lineTo(x - 16, y + 16); c.stroke(); } c.restore(); };
    ovChip(t < 2.0 ? 'PRESSURIZANDO...' : 'AR RESPIRÁVEL', 360, 250, lk(t, .3, 4.5), t < 2.0 ? 'rgba(40,110,190,.92)' : 'rgba(28,130,70,.92)'); recap('CABINE PRESSURIZADA', 'mantém o ar respirável lá dentro', [2.75, .5, -1.1], lk(t, 2.0, 4.5)); }
  for (const [a, b, txt, p, lx, ly] of [[6.8, 9.3, 'POLTRONAS COM CINTO', [5.1, -.08, .72]], [9.4, 9.95, 'JANELAS', [3.66, .32, -1.1]], [10.0, 10.75, 'BAGAGEIROS', [cx + .2, .84, -.78]], [10.8, 11.5, 'BANHEIRO', [-5.7, .4, .12]], [11.9, 13.6, 'COZINHA', [8.3, .3, .2]], [13.8, 15.4, 'PORÃO DE CARGAS', [2.7, -.74, 0], 200, 930], [15.6, 17.3, 'SAÍDA DE EMERGÊNCIA', [.5, .3, -1.1]]]) leader(txt, p, lx || 360, ly || 250, lk(t, a, b));
}
function fleetAir(tw) {
  for (const s of [1, -1]) { draw(BOX, AM.cloth, C_(T_(-9, .95, 20 + s * .55), Rx_(s * .25), S_(.56, .02, .95))); } draw(BOX, AM.woodD, C_(T_(-9, .45, 20), S_(.08, .9, .08))); draw(BOX, AM.woodD, C_(T_(-9, .9, 20), S_(.1, .06, 1.2)));
  const G = C_(T_(-5.2, 1.5, 20)); drawGlider(G, { boom: 1, hs: 1, vf: 1 }); for (const z of [18.6, 21.4]) draw(CYL, AM.woodD, C_(T_(-5.2, 1.02, z), S_(.05, 2.05, .05)));
  drawFlyer(C_(T_(1.2, .8, 20.5)), { power: 'gas', prop: 2, propA: .6, wheels: 1 }); drawMetal(C_(T_(10, 1.38, 21.5)), { canopy: 1, propA: .9 }); drawAirliner(C_(T_(6, 3.25, 9)), { t: tw, gear: 0 }); }
function O01(t, g) {
  const tw = g + t; chipSet('TENTATIVA 14', 'o avião moderno');
  if (t < 1.4) { const k = E.outq(E.seg(t, 0, 1.4)), x = -55 + 45 * k, y = 3.25 + 9 * (1 - k), fr = C_(T_(x, y, 14), Rz_(.06 * (1 - k))); camera([x + 20, 5.5, 44], [x + 2, y - .3, 14], .9); R.shC = [x, 0, 14]; R.shR = 30; drawField(tw, { noTree: 1, noNear: 1 }); drawAirliner(fr, { t, gear: 0 }); }
  else if (t < 4.4) { const u = t - 1.4; R.chip = null; camera(V.mix([7.6, 1.7, 25.3], [7.5, 1.66, 25.0], E.sseg(u, 0, 3)), [6, 1.3, 22], .7); R.shC = [4, 0, 18]; R.shR = 22; drawField(tw, { noTree: 1 }); drawAirliner(C_(T_(-4, 3.25, 9)), { t, gear: 0 });
    const th = E.sseg(u, .5, .9), bob = .03 * Math.abs(Math.sin(u * 5)) * E.sseg(u, .9, 1.2); drawJack({ pos: [6, bob, 22], yaw: .5, shR: .55 * th, elR: 2.2 * th, abR: .12 + .25 * th, pointR: th, abL: .12 + .5 * th, elL: .15 + 1.3 * th, twL: -.6 * th, smile: 1, mouth: .35 + .25 * Math.sin(u * 6) * (1 - E.sseg(u, 2.4, 2.7)), brow: .8, blink: u > 2.1 && u < 2.28 ? 1 : 0 }); }
  else { const u = Math.min(t - 4.4, 3.9), k = E.sseg(u, 0, 3.8); R.chip = null; const k1 = E.sseg(u, 0, 2.5), k2 = E.sseg(u, 2.3, 3.8); camera(V.mix(V.mix([-9, 1.7, 28.5], [2.2, 1.9, 29], k1), [5, 5.5, 45], k2), V.mix(V.mix([-9, 1.1, 20], [2.2, 1.3, 20], k1), [5, 2.2, 14], k2), 1.0); R.shC = [2, 0, 18]; R.shR = 30; drawField(tw, { noTree: 1, noNear: 1 }); fleetAir(tw);
    const op = E.sseg(u, 2.8, 3.6); drawJack({ pos: [5, 0, 26.5], yaw: 0, abL: .15 + 1.1 * op, abR: .15 + 1.1 * op, elL: .3, elR: .3, smile: 1, blink: blinkF(u) }); }
  R.fade = E.seg(t, 8.1, 8.9) * .9; R.title = E.seg(t, 8.7, 9.4) * (1 - E.seg(t, 10.6, 11.0));
}
