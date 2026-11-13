// Ep. 6: cenas de reação do Jack entre as tentativas (ele para, pensa e tem a ideia seguinte, junto com a narração).
function thinkCam(x, z, d, h = 1.2) { camera([x + .5, h + .35, z + d], [x, h, z], .75); R.shC = [x, 0, z]; R.shR = 7; }
// "Beleza, bater asa não rola.": olha para as asas de pano, balança a cabeça e abaixa os braços
function A03(t, g) {
  const tw = g + t; chipSet('TENTATIVA 1', 'asas de pano'); const x = -3, z = 6, k = E.sseg(t, .5, 1.7), sh = E.sseg(t, .9, 1.2) * (1 - E.sseg(t, 2.0, 2.4)), up = E.sseg(t, 2.2, 2.7);
  thinkCam(x, z, 6.6 - 1.0 * k); drawField(tw, { noTree: 1 });
  const lookW = E.sseg(t, .05, .3) * (1 - E.sseg(t, .75, 1.0));
  const j = drawJack({ pos: [x, 0, z], abL: 1.0 - .28 * k, abR: 1.0 - .28 * k, elL: .1, elR: .1, twL: 1.57, twR: 1.57, headYaw: .75 * lookW + .38 * Math.sin((t - .9) * 10) * sh, headPitch: .18 * lookW + .12 * sh - .2 * up, lean: .06 * sh, brow: -.7 + 1.3 * up, smile: -.7 + .5 * up, mouth: .15 * sh, gazeY: .7 * up, blink: blinkF(t + 2) });
  drawArmWings(j.hands, 1);
}
// "Faltou o quê? Fazer curva.": dá de ombros pensando, tem a ideia e imita a curva com os braços
function C03(t, g) {
  const tw = g + t; chipSet('TENTATIVA 3', 'a cauda'); const x = -3, z = 6, q = E.sseg(t, .2, .6) * (1 - E.sseg(t, 1.45, 1.7)), id = E.sseg(t, 1.6, 1.85) * (1 - E.sseg(t, 2.45, 2.7)), cv = E.sseg(t, 2.6, 2.95), bank = cv * Math.sin((t - 2.6) * 4.2);
  thinkCam(x, z, 4.9); drawField(tw, { noTree: 1 });
  drawJack({ pos: [x, 0, z], roll: .16 * bank, abL: .12 + .5 * q + 1.25 * cv, abR: .12 + .5 * q + 2.35 * id + 1.25 * cv, shL: .35 * q, shR: .35 * q, elL: .15 + 1.3 * q, elR: .15 + 1.3 * q * (1 - id), pointR: id, headYaw: .3 * q, headPitch: -.12 * q - .15 * id, gazeY: .6 * q, brow: -.6 * q + 1.0 * Math.max(id, cv), smile: -.3 * q + Math.max(id, cv), mouth: .5 * id, blink: blinkF(t + 1) });
  if (t > .25 && t < 1.6) ovText([x + .55, 2.05, z], '?', lk(t, .25, 1.6), '#ffd23f', 72);
  if (t > 1.65 && t < 2.7) ovText([x + .55, 2.1, z], '!', lk(t, 1.65, 2.7), '#7be08a', 72);
}
// Foto de perfil: Jack sentado numa cadeira gamer, com fone de ouvido e as mãos baixas (nos apoios de braço)
function PROFILE(v) {
  setSky(0); R.sun = V.norm([.35, .7, .62]); const x = 0, z = 0, mm = (c, o) => M(c, o || {});
  const blk = mm('#16171c', { spec: .25, gloss: 30 }), red = mm('#d6263a', { spec: .2, gloss: 24 }), dk = mm('#0e0f13'), wall = mm('#231d3f'), wall2 = mm('#2c2552');
  camera([x + .3, 1.14, z + 3.6], [x, 1.04, z], .58); R.shC = [x, 1, z]; R.shR = 4;
  // quarto: parede, painéis, fitas de LED, prateleira, monitor
  draw(BOX, wall, C_(T_(x, 1.5, z - 1.9), S_(9, 6, .1)));
  for (let i = 0; i < 6; i++) draw(BOX, wall2, C_(T_(x - 1.75 + i * .7, 1.5, z - 1.84), S_(.62, 6, .03)));
  draw(BOX, mm('#ff3fb4', { unlit: 1, nosh: 1 }), C_(T_(x, 1.93, z - 1.8), S_(9, .035, .03)));
  draw(BOX, mm('#35d6ff', { unlit: 1, nosh: 1 }), C_(T_(x - .98, 1.6, z - 1.8), S_(.035, 3, .03)));
  draw(BOX, mm('#35d6ff', { unlit: 1, nosh: 1 }), C_(T_(x + 1.05, 1.6, z - 1.8), S_(.035, 3, .03)));
  draw(BOX, mm('#3a3160'), C_(T_(x + .66, 1.5, z - 1.72), S_(.62, .04, .2)));
  draw(BOX, mm('#ffb02e'), C_(T_(x + .5, 1.59, z - 1.72), S_(.1, .14, .1))); draw(SPH, mm('#35d6ff'), C_(T_(x + .74, 1.59, z - 1.72), S_(.07)));
  draw(BOX, dk, C_(T_(x - .7, 1.2, z - 1.6), S_(.62, .38, .04))); draw(BOX, mm('#6c4dff', { unlit: 1, nosh: 1 }), C_(T_(x - .7, 1.2, z - 1.575), S_(.57, .33, .01)));
  draw(BOX, mm('#b9f3ff', { unlit: 1, nosh: 1 }), C_(T_(x - .78, 1.24, z - 1.565), S_(.26, .05, .01))); draw(BOX, mm('#ff8ad8', { unlit: 1, nosh: 1 }), C_(T_(x - .7, 1.14, z - 1.565), S_(.4, .04, .01)));
  // cadeira gamer: encosto alto preto com laterais vermelhas, apoio de cabeça, assento e apoios de braço
  const bz = z - .2;
  draw(BOX, blk, C_(T_(x, .82, bz), S_(.5, .74, .1))); draw(BOX, blk, C_(T_(x, 1.36, bz), S_(.44, .46, .1))); draw(SPH, blk, C_(T_(x, 1.59, bz), S_(.22, .09, .05)));
  for (const s of [1, -1]) {
    draw(BOX, red, C_(T_(x + s * .29, .82, bz + .045), Ry_(-s * .45), S_(.14, .68, .08)));
    draw(BOX, red, C_(T_(x + s * .255, 1.38, bz + .04), Ry_(-s * .4), S_(.12, .42, .08)));
    draw(BOX, dk, C_(T_(x + s * .11, 1.5, bz + .052), S_(.09, .04, .01)));
    draw(BOX, dk, C_(T_(x + s * .3, .6, z + .12), S_(.1, .04, .4))); draw(BOX, blk, C_(T_(x + s * .3, .5, z - .02), S_(.04, .2, .05)));
  }
  draw(BOX, blk, C_(T_(x, .37, z + .12), S_(.52, .1, .5)));
  const j = drawJack({ pos: [x, 0, z], yaw: 0, hipL: 1.5, hipR: 1.5, kneeL: 1.45, kneeR: 1.45, shL: .28, shR: .28, elL: 1.25, elR: 1.25, abL: .3, abR: .3, headYaw: .1, headPitch: -.02, smile: 1, grin: 1, brow: .7, blink: 0 });
  // fone de ouvido: arco por cima, conchas nas orelhas e microfone
  const H = j.head, hp = mm('#1b1c22', { spec: .4, gloss: 40 }), hr = mm('#ff3b4f', { spec: .3, gloss: 30 });
  for (let i = -15; i <= 15; i++) { const a = i / 15 * 1.42; draw(SPH, hp, C_(H, T_(Math.sin(a) * .245, Math.cos(a) * .255 + .005, -.03), S_(.03, .03, .042))); }
  for (const s of [1, -1]) { const c = C_(H, T_(s * .228, -.015, -.012), Rz_(Math.PI / 2)); draw(CYL, hp, C_(c, S_(.1, .06, .1))); draw(CYL, hr, C_(c, T_(0, -s * .034, 0), S_(.07, .012, .07))); draw(SPH, dk, C_(c, T_(0, s * .028, 0), S_(.105, .02, .105))); }
  for (let i = 0; i <= 10; i++) { const q = i / 10; draw(SPH, hp, C_(H, T_(.225 - .12 * q * q, -.07 - .075 * q, .03 + .2 * q - .05 * q * q), S_(.011))); }
  draw(SPH, hp, C_(H, T_(.105, -.145, .19), S_(.026, .02, .02)));
}
// Fichas de referência: Jack em fundo neutro liso. A vista é escolhida pelo tempo (0, 1, 2...).
function REF(T) {
  const v = Math.round(T); setSky(0); R.sun = V.norm([.45, .8, .55]); R.fogD = 0;
  const bg = M('#e4e7ec', { spec: 0 }), fl = M('#e4e7ec', { spec: 0 });
  draw(BOX, fl, C_(T_(0, -.05, 0), S_(40, .1, 40))); draw(BOX, bg, C_(T_(0, 6, -3), S_(40, 14, .1)));
  R.shC = [0, 0, 0]; R.shR = 3;
  const base = { pos: [0, 0, 0], abL: .32, abR: .32, elL: .12, elR: .12, smile: .5, brow: .3, blink: 0 };
  const full = () => camera([0, 1.02, 4.3], [0, 1.0, 0], .52), face = (y = 0) => camera([Math.sin(y) * 2.1, 1.66, Math.cos(y) * 2.1], [0, 1.64, 0], .52);
  const thumb = (j) => { const h = Mx.pt(j.hands.R, [0, 0, 0]), k = 1.3, at = (x, y, z) => T_(h[0] + x * k, h[1] + y * k, h[2] + z * k), sk = JC.skin;
    draw(SPH, sk, C_(at(0, .02, 0), S_(.066 * k, .06 * k, .055 * k))); for (let f = 0; f < 4; f++) draw(SPH, sk, C_(at(.004, .058 - f * .027, .036), S_(.06 * k, .0165 * k, .032 * k)));
    draw(SPH, sk, C_(at(-.012, .075, .012), S_(.036 * k, .032 * k, .036 * k))); draw(CAP(.026 * k, .058 * k), sk, C_(at(-.016, .158, .012), Rz_(.12))); };
  const V_ = [
    () => { full(); drawJack(Object.assign({}, base, { yaw: 0 })); },                        // 0 frente
    () => { full(); drawJack(Object.assign({}, base, { yaw: .75 })); },                      // 1 três quartos
    () => { full(); drawJack(Object.assign({}, base, { yaw: Math.PI / 2 })); },               // 2 lado
    () => { full(); drawJack(Object.assign({}, base, { yaw: Math.PI })); },                   // 3 costas
    () => { face(); drawJack(Object.assign({}, base, { smile: .2, brow: 0 })); },                       // 4 neutro
    () => { face(); drawJack(Object.assign({}, base, { smile: 1, grin: 1, brow: .7 })); },              // 5 feliz
    () => { face(); drawJack(Object.assign({}, base, { smile: 0, mouth: .8, brow: 1 })); },             // 6 surpreso
    () => { face(); drawJack(Object.assign({}, base, { smile: 0, grin: -.25, brow: .25, gazeY: .9, gazeX: .6, headYaw: -.15 })); }, // 7 pensando
    () => { face(); drawJack(Object.assign({}, base, { smile: 0, grin: -.55, brow: -.5, gazeY: -.6, headPitch: .08 })); },        // 8 triste
    () => { camera([Math.sin(.8) * 2.6 + .1 * Math.cos(.8), 1.68, Math.cos(.8) * 2.6 - .1 * Math.sin(.8)], [.1 * Math.cos(.8), 1.66, -.1 * Math.sin(.8)], .52); drawJack(Object.assign({}, base, { smile: .6, brow: .4 })); },                    // 9 detalhe 3/4 (cabelo e óculos)
    () => { full(); drawJack(Object.assign({}, base, { yaw: .3, hipL: .45, hipR: -.4, kneeR: .55, kneeL: .1, shL: -.5, shR: .5, elL: .5, elR: .5, abL: .12, abR: .12, smile: .8 })); }, // 10 andando
    () => { camera([-.24, 1.02, 4.4], [-.24, 1.0, 0], .52); drawJack(Object.assign({}, base, { yaw: .35, abR: 1.45, elR: .08, pointR: 1, headYaw: -.5, smile: .8, brow: .6 })); },      // 11 apontando
    () => { full(); const j = drawJack(Object.assign({}, base, { yaw: .15, shR: 1.0, elR: 1.7, abR: .72, twR: .7, smile: 1, grin: 1, brow: .7 })); thumb(j); }, // 12 joia
    () => { full(); drawJack(Object.assign({}, base, { yaw: .15, abR: 2.5, elR: .7, smile: 1, grin: 1, brow: .7 })); }, // 13 pensando (corpo)
  ];
  (V_[v] || V_[0])();
}
