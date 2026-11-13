// O Curioso Jack: o personagem (drawJack). Extraído de reference/jack/Jack_modelo_3D.html. Depende de engine.js.
// Jack: personagem articulado. Olha para +z. Lado "L" = +x, lado "R" = -x.
const JC = {
  skin: M('#f3d2b0', { rim: .35 }), skinD: M('#e2b08c'), hair: M('#6b3f22', { rim: .3 }), cap: M('#23221f', { spec: .15, gloss: 20 }),
  gold: M('#d8a03a', { spec: .9, gloss: 50 }), lens: M('#8fd0f2', { spec: 1, gloss: 90, e: [.05, .12, .18] }),
  jacket: M('#5f6638', { rim: .2 }), jacketD: M('#474d28'), strap: M('#5a3519', { spec: .2 }), belt: M('#2c1c12', { spec: .2 }), buckle: M('#c9c9c9', { spec: .8, gloss: 60 }),
  btn: M('#eeeeea'), pants: M('#27304c'), boot: M('#4a2c17', { spec: .15 }), sole: M('#1d1410'),
  white: M('#ffffff', { rim: 0 }), iris: M('#6a3a17', { rim: 0 }), pupil: M('#120b06', { rim: 0 }), mouth: M('#5a1414', { rim: 0 }), teeth: M('#f5f1e8', { rim: 0 }), brow: M('#5a341c', { rim: 0 }),
};
const JD = { thigh: .30, shin: .28, boot: .09, up: .23, fore: .21 };
function jackPose(o) { return Object.assign({ pos: [0, 0, 0], yaw: 0, roll: 0, tip: 0, lean: 0, twist: 0, hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, shL: 0, shR: 0, abL: .12, abR: .12, elL: .15, elR: .15, twL: 0, twR: 0, headYaw: 0, headPitch: 0, blink: 0, mouth: 0, smile: 0, brow: 0, gazeX: 0, gazeY: 0, pointR: 0, drop: 0 }, o || {}); }
// altura do quadril para os pés tocarem o chão
function jackHipY(P) { const f = (h, k) => JD.thigh * Math.cos(h) + JD.shin * Math.cos(k - h); return Math.max(f(P.hipL, P.kneeL), f(P.hipR, P.kneeR)) + JD.boot; }
function walkPose(ph, amp = 1) { // ph em ciclos
  const a = ph * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
  return { hipL: .45 * s * amp, hipR: -.45 * s * amp, kneeL: Math.max(0, .15 + .75 * Math.max(0, -c) * (s > 0 ? .4 : 1)) * amp, kneeR: Math.max(0, .15 + .75 * Math.max(0, c) * (s < 0 ? .4 : 1)) * amp, shL: -.5 * s * amp, shR: .5 * s * amp, elL: .35, elR: .35, bob: .02 * Math.abs(c) * amp };
}
function drawJack(P) {
  P = jackPose(P); const J = P.mats ? Object.assign({}, JC, P.mats) : JC; const C = Mx.chain, T = Mx.T, S = Mx.S, Rx = Mx.Rx, Ry = Mx.Ry, Rz = Mx.Rz;
  const hipY = P.hipY !== undefined ? P.hipY : jackHipY(P) - P.drop;
  const root = P.root || C(T(P.pos[0], P.pos[1], P.pos[2]), Ry(P.yaw), Rz(P.roll), Rx(P.tip), T(0, hipY, 0));
  // pernas
  for (const s of [1, -1]) {
    const h = s > 0 ? P.hipL : P.hipR, k = s > 0 ? P.kneeL : P.kneeR;
    const th = C(root, T(s * .085, 0, 0), Rx(-h)); draw(CAP(.072, JD.thigh), J.pants, th);
    const sh = C(th, T(0, -JD.thigh, 0), Rx(k)); draw(CAP(.062, JD.shin), J.pants, sh);
    const ft = C(sh, T(0, -JD.shin, 0), Rx(h - k));
    draw(CAP(.07, .05), J.boot, C(ft, T(0, .03, 0)));
    draw(BOX, J.boot, C(ft, T(0, -.04, .045), S(.125, .075, .2))); draw(SPH, J.boot, C(ft, T(0, -.04, .14), S(.0625, .0375, .06)));
    draw(BOX, J.sole, C(ft, T(0, -.082, .05), S(.13, .016, .27)));
  }
  // tronco
  const w = C(root, T(0, .02, 0), Rx(P.lean), Ry(P.twist));
  draw(CYL, J.jacket, C(w, T(0, .05, 0), S(.196, .16, .136)));
  draw(CAP(.5, 1), J.jacket, C(w, T(0, .395, 0), S(.40, .25, .272)));
  draw(TORUS(.09), J.belt, C(w, T(0, .12, 0), S(.196, .2, .137))); draw(BOX, J.buckle, C(w, T(0, .12, .148), S(.05, .04, .012)));
  draw(TORUS(.045), J.strap, C(w, T(0, .29, 0), Rz(-.72), S(.25, .3, .14)));
  for (const s of [1, -1]) {
    const pk = C(w, T(s * .092, .33, .112), Ry(s * .42));
    draw(BOX, J.jacketD, C(pk, S(.085, .075, .016))); draw(BOX, J.jacket, C(pk, T(0, .028, .006), S(.092, .03, .016))); draw(SPH, J.btn, C(pk, T(0, .022, .016), S(.008)));
    draw(BOX, J.jacketD, C(w, T(s * .05, .5, .085), Rz(s * .6), Rx(-.5), S(.075, .035, .016)));
  }
  for (const y of [.2, .27]) draw(SPH, J.btn, C(w, T(0, y, .139), S(.008)));
  draw(CYL, J.skin, C(w, T(0, .565, 0), S(.042, .15, .042)));
  // braços
  const hands = {};
  for (const s of [1, -1]) {
    const L = s > 0, shd = L ? P.shL : P.shR, ab = L ? P.abL : P.abR, el = L ? P.elL : P.elR, tw = L ? P.twL : P.twR;
    const up = C(w, T(s * .2, .45, 0), Rz(s * ab), Rx(-shd), Ry(s * tw)); draw(CAP(.058, JD.up), J.jacket, up);
    const fo = C(up, T(0, -JD.up, 0), Rx(-el)); draw(CAP(.052, JD.fore), J.jacket, fo);
    draw(CYL, J.jacketD, C(fo, T(0, -JD.fore + .01, 0), S(.057, .035, .057)));
    const hd = C(fo, T(0, -JD.fore - .055, 0)); draw(SPH, J.skin, C(hd, S(.05, .06, .04)));
    draw(SPH, J.skin, C(hd, T(-s * .035, .0, .02), S(.02, .03, .02)));
    if (!L && P.pointR > 0) draw(CAP(.014, .06), J.skin, C(hd, T(0, -.04, .015), Rx(-.1), S(1, P.pointR, 1)));
    hands[L ? 'L' : 'R'] = hd;
  }
  // cabeça
  const head = C(w, T(0, .62, 0), Ry(P.headYaw), Rx(P.headPitch), T(0, .17, 0));
  const HS = S(.2, .215, .195);
  draw(SPH, J.skin, C(head, HS));
  const on = (yaw, pit, r = 1) => C(head, HS, Ry(yaw), Rx(-pit), T(0, 0, r));
  // cabelo, boina e óculos
  draw(SPH, J.hair, C(head, T(0, .03, -.035), S(.207, .215, .2)));
  if (P.plain) { draw(SPH, J.hair, C(head, T(0, .045, -.03), S(.21, .2, .205))); for (const s of [1, -1]) draw(SPH, J.skin, C(head, T(s * .198, -.01, -.01), S(.028, .048, .03))); if (P.plain === 2) draw(SPH, J.hair, C(head, T(0, .1, -.2), S(.09))); } else {
  // cabelo espetado para cima (como no episódio de referência), faixa escura e óculos na frente
  const rr = rng(7);
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + .26, front = Math.cos(a) > .55; const rad = front ? .06 : .115, hgt = (front ? .09 : .13) + rr() * .06;
    draw(CONE, J.hair, C(head, T(0, front ? .2 : .175, -.02), Ry(a), T(0, 0, rad), Rx(.25 + rr() * .3), S(.052, hgt, .052))); }
  for (let i = 0; i < 5; i++) { const a = i * 1.257 + .4; draw(CONE, J.hair, C(head, T(0, .215, -.03), Ry(a), T(0, 0, .045), Rx(.12 + rr() * .2), S(.05, .13 + rr() * .05, .05))); }
  for (let i = 0; i < 7; i++) { const ya = 1.5 + i * .55, pi = .05 + rr() * .2; draw(CONE, J.hair, C(on(ya, pi, .92), Rx(Math.PI / 2 - .75), S(.26, .5 + rr() * .2, .26))); }
  for (const s of [1, -1]) { draw(SPH, J.hair, C(on(s * 1.32, .1, .97), S(.13, .26, .06))); draw(SPH, J.skin, C(head, T(s * .198, -.01, -.01), S(.028, .048, .03))); }
  const cap = C(head, T(0, .135, -.012), Rx(-.14));
  draw(TORUS(.1), J.cap, C(cap, S(.2, .36, .195)));
  for (const s of [1, -1]) { const g = C(cap, T(s * .06, .05, .178), Rx(1.15)); draw(TORUS(.22), J.gold, C(g, S(.05, .05, .05))); draw(DISC, J.lens, C(g, T(0, .004, 0), S(.045))); }
  draw(BOX, J.gold, C(cap, T(0, .052, .182), Rx(1.15), S(.03, .012, .02)));
  }
  if (P.mask) { draw(BOX, M('#2b2b2e'), C(head, T(0, -.01, .2), S(.33, .34, .03))); draw(BOX, M('#1c3a2a', { spec: .8, gloss: 60 }), C(head, T(0, .03, .217), S(.2, .07, .01))); }
  // olhos: a pálpebra NÃO existe como peça de pele; piscar achata o próprio olho
  const k = 1 - .94 * E.c01(P.blink);
  for (const s of [1, -1]) {
    const e = (r) => C(on(s * .40, .06, r), S(1, k, 1));
    draw(SPH, J.white, C(e(.985), S(.2, .25, .05)));
    const g = C(e(1.0), T(P.gazeX * .04, P.gazeY * .05, 0));
    draw(SPH, J.iris, C(g, S(.155, .19, .05))); draw(SPH, J.pupil, C(g, T(0, 0, .03), S(.085, .105, .04)));
    if (k > .5) draw(SPH, J.white, C(g, T(.05, .07, .06), S(.035, .035, .02)));
    draw(BOX, J.brow, C(on(s * .40, .46 + .05 * P.brow - .06 * Math.max(0, -P.brow), 1.0), Rz(s * (-.1 + .5 * Math.max(0, -P.brow))), S(.26, .075, .08)));
  }
  draw(SPH, J.skinD, C(on(0, -.13, .99), S(.1, .095, .1)));
  const mo = E.c01(P.mouth), mw = .17 + .08 * P.smile - .04 * mo;
  if (P.grin) { for (let i = -12; i <= 12; i++) { const q = i / 12; draw(SPH, J.mouth, C(on(q * .3 * Math.abs(P.grin), P.grin > 0 ? -.58 + .12 * q * q : -.55 - .1 * q * q, .985), S(.05, .036, .05))); } return { root, head, hands, hipY, waist: w }; }
  draw(SPH, J.mouth, C(on(0, -.52, .985), S(mw, .025 + .15 * mo, .05)));
  if (mo > .25) draw(SPH, J.teeth, C(on(0, -.52 + .1 * mo, 1.0), S(mw * .72, .035, .04)));
  return { root, head, hands, hipY, waist: w };
}
