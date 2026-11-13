// Episódio 5 — A evolução dos navios. Planos da praia e do tronco.
const PI = Math.PI;
const blinkF = t => { const p = ((t % 2.9) + 2.9) % 2.9; return p < .06 ? p / .06 : p < .15 ? 1 - (p - .06) / .09 : 0; };
const LOGR = .22, LOGL = 2.6;

function shotA(u, tw) { // Jack olha o mar e aponta a ilha
  const k = E.sseg(u, 0, 3.5); camera(V.mix([-.5, 2.1, -6.0], [-.4, 1.85, -4.9], k), [.3, 1.35, 8], .78); R.shC = [0, 0, -2.5]; R.shR = 7;
  drawBeach(tw);
  const a = E.sseg(u, 1.1, 1.9);
  drawJack({ pos: [0, sandY(-2.2), -2.2], shR: 1.45 * a, elR: .15, abR: .12 + .1 * a, pointR: a, headPitch: -.05, lean: .02 * Math.sin(u * 1.7) });
}
function shotB(u, tw) { // close: pensa, vê o tronco, tem a ideia
  camera([.5, 1.82, -.45], [0, 1.76, -2.2], .6); R.shC = [0, 1, -2.2]; R.shR = 4;
  drawBeach(tw);
  const dn = E.sseg(u, .1, .6) * (1 - E.sseg(u, 1.25, 1.6)), idea = E.sseg(u, 1.35, 1.75);
  drawJack({ pos: [0, sandY(-2.2), -2.2], shR: 1.45 * (1 - E.sseg(u, 0, .5)) + .5 * idea, elR: .15 + 2.2 * idea, abR: .12 + .2 * idea, pointR: Math.max(1 - E.sseg(u, 0, .3), idea),
    headPitch: .12 * dn - .12 * idea, gazeY: -.5 * dn + .6 * idea, gazeX: .8 * idea, brow: -.7 * dn + idea, mouth: .55 * idea * (1 - .5 * E.sseg(u, 2.0, 2.4)), smile: idea, blink: Math.max(blinkF(u + 2.2), 0), headYaw: .18 });
}
function logC(u) { const z = -.5 + 2.9 * E.sseg(u, 1.5, 3.0); return { z, th: (z + .5) / LOGR }; }
function shotC(u, tw, v) { // empurra o tronco para a água (v: variação depois do tempo reverso)
  const cz = v === undefined ? 0 : E.sseg(v, .2, 1.6); camera([6.6 - 2.6 * cz, 1.5, -.3 + 1.2 * E.sseg(u, 1.5, 3.2) - .5 * cz], [0, .8 + .35 * cz, -.5 + 1.3 * E.sseg(u, 1.5, 3.2) - .5 * cz], .85); R.shC = [0, 0, 0]; R.shR = 7;
  drawBeach(tw);
  const L = logC(u); const ly = Math.max(sandY(L.z) + LOGR, waveH(0, L.z, tw) + .05);
  drawLog(Mx.chain(Mx.T(0, ly, L.z), Mx.Rx(L.th)), LOGL, LOGR);
  if (u > 2.15) drawSplash(u, 2.15, [0, 0, .95], .55, 3, 26);
  const wk = E.seg(u, 0, 1.0), zw = -2.2 + 1.15 * E.ss(wk), w = walkPose(wk * 1.5, Math.sin(wk * PI) > .05 ? 1 : 0);
  const cr = E.sseg(u, 1.0, 1.5) * (1 - E.sseg(u, 1.95, 2.6)), push = Math.min(.7, L.z + .5), st = Math.sin(u * 14) * .12 * (u > 1.5 && u < 1.95 ? 1 : 0);
  const P = { pos: [0, 0, zw + push], lean: .65 * cr, hipL: w.hipL * (1 - cr) + 1.2 * cr + st, hipR: w.hipR * (1 - cr) + 1.2 * cr - st, kneeL: w.kneeL * (1 - cr) + 1.9 * cr + st, kneeR: w.kneeR * (1 - cr) + 1.9 * cr - st,
    shL: w.shL * (1 - cr) + 1.0 * cr, shR: w.shR * (1 - cr) + 1.0 * cr, elL: .3 * (1 - cr) + .1 * cr, elR: .3 * (1 - cr) + .1 * cr, headPitch: .25 * cr - .5 * cr, blink: blinkF(u + .7),
    smile: E.sseg(u, 2.6, 3.0), brow: .6 * E.sseg(u, 2.6, 3.0) };
  if (v !== undefined) { const no = Math.sin(v * 9) * .35 * E.sseg(v, .25, .45) * (1 - E.sseg(v, 1.0, 1.25)), idea = E.sseg(v, 1.5, 1.9);
    Object.assign(P, { headYaw: no + .85 * idea, brow: -.8 * (1 - idea) + idea, mouth: .5 * idea, smile: idea, shR: .5 * idea, elR: .3 + 2.0 * idea, abR: .12 + .2 * idea, pointR: idea, blink: blinkF(v + 1.2) }); }
  P.pos[1] = sandY(P.pos[2]); drawJack(P);
}
function shotD(u, tw) { // equilíbrio no tronco, queda e banho
  const lz = 6, lx = .15 * E.sseg(u, 3.2, 4.6); camera(V.mix([3.7, 1.55, 2.5], [3.3, 1.45, 2.9], E.sseg(u, 0, 4.6)), [0, .95, 5.8], .78); R.shC = [0, 0, 5.5]; R.shR = 7;
  drawBeach(tw);
  const sp = u < 2.9 ? 2.2 * u * u : 2.2 * 2.9 * 2.9 + 12.76 * (1 - Math.exp(-(u - 2.9) * 1.2)) / 1.2;
  const ly = waveH(0, lz, tw) + .05 - .05 * E.sseg(u, 0, .3) * (1 - E.sseg(u, 2.9, 3.2));
  drawLog(Mx.chain(Mx.T(lx, ly, lz), Mx.Rx(sp)), LOGL, LOGR);
  if (u < 3.32) {
    const wob = .05 * Math.sin(5 * u) * (1 + 1.2 * Math.min(u, 2.6)), fall = E.inq(E.seg(u, 2.6, 3.25)), ph = 1.2 * u * u * .5, s = Math.sin(ph * 2 * PI);
    const roll = wob - 1.45 * fall, sink = E.sseg(u, 2.95, 3.35);
    drawJack({ pos: [0, ly + LOGR - .95 * sink, lz - .55 * fall], yaw: PI / 2, roll, hipL: .3 * s, hipR: -.3 * s, kneeL: .3 + .3 * Math.max(0, s), kneeR: .3 + .3 * Math.max(0, -s),
      abL: 1.2 - wob * 4 + .4 * Math.sin(u * 17) * fall, abR: 1.2 + wob * 4 + .4 * Math.sin(u * 19 + 1) * fall, elL: .25, elR: .25, shL: .3 * Math.sin(u * 9) * (.3 + fall), shR: -.3 * Math.sin(u * 9) * (.3 + fall),
      headYaw: .7, mouth: .35 + .5 * E.sseg(u, 1.5, 2.6), brow: 1, lean: .1 });
  }
  drawSplash(u, 3.2, [0, 0, lz - 1.05], 1.35, 9);
  if (u > 3.7) { const up = E.sseg(u, 3.7, 4.15); drawSplash(u, 3.72, [.1, 0, 5.0], .6, 21, 22);
    drawJack({ pos: [.1, sandY(5.0), 5.0], yaw: 2.16, drop: .55 * (1 - up), abL: .35 + .25 * up, abR: .35 + .25 * up, elL: 1.25 * up, elR: 1.25 * up, twL: -.5, twR: -.5, brow: -1, headPitch: .08, blink: u > 4.25 && u < 4.4 ? 1 : 0, mouth: 0, smile: -.5 }); }
}
