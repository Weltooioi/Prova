// Episódio 7 — cenas. Cada cena é f(t local, t global). O paredão da montanha fica em z = 0; o Jack trabalha nele olhando para -z (yaw = PI).
// ---------- utilidades ----------
// braço sobe e desce batendo nos instantes hits (0 = baixo, 1 = no alto)
function hitEnv(u, hits) { let a = 0; for (const h of hits) { if (u >= h - .6 && u < h - .2) a = Math.max(a, E.ss((u - (h - .6)) / .4)); else if (u >= h - .2 && u < h) a = Math.max(a, 1 - E.inq((u - (h - .2)) / .2)); } return a; }
// caminhar em linha reta de p0 a p1 entre t0 e t1; devolve posição, pose das pernas e direção
function walker(u, t0, t1, p0, p1, yawStill) {
  const k = E.c01((u - t0) / (t1 - t0)), d = V.sub(p1, p0), len = Math.hypot(d[0], d[2]), pos = V.mix(p0, p1, k), moving = u > t0 && u < t1;
  return { pos, yaw: moving || yawStill === undefined ? Math.atan2(d[0], d[2]) : yawStill, w: moving ? walkPose(len * k / 1.15, 1) : {}, moving };
}
// ombro para a mão (braço esticado, ~0,55 m) chegar na altura hy
const armTo = hy => Math.acos(Math.max(-1, Math.min(1, (1.62 - hy) / .55)));
function shake(u, te, amp = .25, dur = .7) { const d = u - te; if (d < 0 || d > dur) return [0, 0, 0]; const k = amp * (1 - d / dur); return [k * Math.sin(d * 71), k * Math.sin(d * 53 + 1), 0]; }
function ovFlash(k) { if (k <= 0) return; const prev = R.ov2; R.ov2 = c => { if (prev) prev(c); c.save(); c.fillStyle = `rgba(255,246,220,${E.c01(k)})`; c.fillRect(0, 0, 720, 1280); c.restore(); }; }
const CAR = { red: M('#c8442f', { spec: .5, gloss: 60 }), blue: M('#2f6fb0', { spec: .5, gloss: 60 }), yel: M('#e2b33a', { spec: .5, gloss: 60 }), grn: M('#3f9a5a', { spec: .5, gloss: 60 }), wht: M('#e9e9e4', { spec: .5, gloss: 60 }) };
// Jack dirigindo o conversível: F é o quadro do carro; extra mistura rosto e braços
function driveJack(F, extra = {}) { return drawJack(Object.assign({ root: C_(F, T_(.35, .9, -.5)), hipL: 1.55, hipR: 1.55, kneeL: 1.35, kneeR: 1.35, shL: 1.15, shR: 1.15, abL: .18, abR: .18, elL: .45, elR: .45, smile: .6, brow: .3 }, extra)); }

// ---------- abertura: a estrada termina na montanha ----------
function A01(t, g) {
  const tw = g + t; drawValley(tw);
  const wk = walker(t, 0, 3.4, [.4, 0, 8.5], [.4, 0, 3.6], PI);
  if (t < 3.6) { const k = E.sseg(t, 0, 3.6); camera(V.mix([9, 6, 58], [3.4, 2.0, wk.pos[2] + 6.5], k), V.mix([0, 11, -10], [.2, 3.0, 0], k), .9); }
  else if (t < 8.3) { const k = E.sseg(t, 3.6, 5.0); camera(V.mix([3.4, 2.0, 10.1], [13, 13, 60], k), V.mix([.2, 3.0, 0], [6, 10, -10], k), .9); }
  else { const k = E.sseg(t, 8.3, 9.0); camera(V.mix([13, 13, 60], [7.5, 2.0, 2.6], k), V.mix([6, 10, -10], [.2, 1.5, 1.8], k), V.mix([.9, .9, .9], [1.0, 1.0, 1.0], k)[0]); }
  R.shC = [.4, 0, wk.pos[2]]; R.shR = 9;
  // olhar para os lados e para cima, balançar a cabeça, depois apontar para o paredão
  const lookL = E.sseg(t, 4.0, 4.6) * (1 - E.sseg(t, 5.9, 6.3)), lookUp = E.sseg(t, 6.1, 6.6) * (1 - E.sseg(t, 7.4, 7.8)), no = t > 7.6 && t < 8.3 ? Math.sin((t - 7.6) * 16) * .35 : 0, pt = E.sseg(t, 8.8, 9.3);
  drawJack(Object.assign({ pos: wk.pos, yaw: wk.yaw }, wk.w, { headYaw: .7 * lookL + no, headPitch: -.45 * lookUp, shR: 1.45 * pt, abR: .12, elR: .1 * pt + .12 * (1 - pt), pointR: pt, smile: pt > .5 ? 1 : .2, brow: pt > .5 ? .6 : (t > 7 ? -.4 : .2), mouth: .25 * pt, blink: blinkF(t) }));
  ovPath([[2.4, .3, 2], [9, .3, 4], [18, .3, 2], [26, .3, -6], [32, .3, -16]], E.sseg(t, 4.0, 5.6) * (1 - E.sseg(t, 7.9, 8.3)), '#ffd23f', 'DAR A VOLTA: O DIA INTEIRO', 360, 900);
  ovPath([[-1.5, 1, 1], [-2.5, 9, -3], [-3, 16, -12], [-3.2, 27, -26]], E.sseg(t, 6.1, 7.2) * (1 - E.sseg(t, 7.9, 8.3)), '#ff7a5a', 'ÍNGREME DEMAIS', 360, 300);
  if (t > 9.2) ovArrow([.4, 1.5, 1.8], [.1, 1.5, -.6], E.sseg(t, 9.2, 9.6), '#5ee08a', 'POR DENTRO!');
}

// ---------- tentativa 1: picareta ----------
function B01(t, g) {
  chipSet('TENTATIVA 1', 'a picareta'); const r = RW(t, 10.6, 10.85, 12.0, 1.4), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  drawValley(tw);
  const close = u > 7.6 && u < 8.9, hits = [3.9, 5.3, 6.0, 6.7, 9.6];
  if (close) { camera([-1.0, .55, 1.1], [-.2, .3, .1], .8); R.shC = [0, 0, .6]; R.shR = 3; }
  else if (u < 2.6) { camera([3.6, 1.7, 3.6], [.3, 1.2, 1.2], .85); R.shC = [0, 0, 1]; R.shR = 5; }
  else { camera([3.4, 1.6, 1.15], [-.6, 1.3, .55], .88); R.shC = [0, 0, 1]; R.shR = 5; }
  const wk = walker(u, .6, 2.6, [1.6, 0, 3.2], [.35, 0, .95], PI);
  const a = u > 2.8 ? hitEnv(u, hits) : 0, P = chopPose(a), broken = u >= 9.6, sad = E.sseg(u, 9.8, 10.2);
  const pose = u > 2.8 ? Object.assign(P, { shR: P.shR * (1 - sad) + .85 * sad, elR: P.elR * (1 - sad) + 1.1 * sad, shL: P.shL * (1 - sad) + .2 * sad }) : { shR: .25, elR: .4, shL: .2, elL: .3 };
  const j = drawJack(Object.assign({ pos: wk.pos, yaw: wk.yaw }, wk.w, pose, { headPitch: .2 + .3 * sad, smile: broken ? -.8 : .5, brow: broken ? -.7 : .3, mouth: broken ? .3 : 0, blink: blinkF(u) }));
  drawPick(j.hands.R, u > 2.8 ? CHOP.q : .3, { broken });
  // o que sai da pedra: faíscas, pozinho e riscos
  const spot = [.05, 1.0, .04];
  hits.forEach((h, i) => { drawSparks(u, h, spot, 500 + i, 10, .45); smallDust(u, h, spot); });
  const nh = hits.filter(h => u >= h).length; for (let i = 0; i < Math.min(nh, 4); i++) draw(BOX, TM.rockD, C_(T_(.05 + (i - 1.5) * .05, 1.0, .02), Rz_(.5 + i * .3), S_(.01, .12, .01)));
  if (nh > 0) draw(SPH, M('#c9c0b0'), C_(T_(-.2, .02, .14), S_(.04 + .015 * Math.min(nh, 4), .02 + .006 * Math.min(nh, 4), .04 + .012 * Math.min(nh, 4))));
  if (broken) { const d = Math.min(u - 9.6, .9), y = Math.max(.05, 1.05 + 2.6 * d - 4.9 * d * d); pickHead(C_(T_(-.9 * d + .1, y, .5 + .9 * d), Rz_(d * 14), Rx_(d * 9))); }
  if (r.v === undefined) {
    recap('PICARETA', 'cava a pedra na força', Mx.pt(j.hands.R, [0, 0, 0]), lk(u, 1.0, 2.8));
    if (!close) leader('ROCHA DURA', spot, 360, 260, lk(u, 3.5, 5.0));
    if (close) ovText([-.2, .25, .14], 'só um pozinho...', lk(u, 7.8, 8.8), '#ffffff', 40);
  }
}

// ---------- tentativa 2: fogo e água ----------
function crackLines(n, c = [0, .95, .03]) { const r = rng(8); for (let i = 0; i < n; i++) { const a = r() * 6.283, l = .3 + r() * .5; draw(BOX, TM.cave, C_(T_(c[0] + Math.cos(a) * l * .5, c[1] + Math.sin(a) * l * .5, c[2]), Rz_(a + PI / 2), S_(.025, l, .01))); } }
function C01(t, g) {
  chipSet('TENTATIVA 2', 'fogo e água'); const r = RW(t, 15.4, 15.65, 16.7, 11.6), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  const firePos = [0, 0, .55];
  if (u < 11.3) {
    const cave = E.sseg(u, 7.9, 8.4);
    drawValley(tw, { portal: cave > 0 ? 'cave' : 'none', cave: .3 + .4 * cave });
    camera([3.6, 1.5, 1.7], [-.4, 1.0, .6], .9); R.shC = [.5, 0, 1]; R.shR = 5;
    const fk = E.sseg(u, 1.3, 2.3) * (1 - E.sseg(u, 5.35, 5.6)); drawFire(tw, firePos, fk); if (u > 5.4 && u < 8) drawSmoke(tw, [0, .3, .6], 2.2, 1.2, [.2, .1]);
    const heat = E.sseg(u, 2.6, 4.6) * (1 - E.sseg(u, 5.5, 6.4)); if (heat > 0 && cave < 1) draw(CYL, M('#ff5a1a', { a: .6 * heat, nosh: 1, norecv: 1, e: [1.2 * heat, .3 * heat, .05] }), C_(T_(0, .95, .025), Rx_(PI / 2), S_(1.0, .02, .8)));
    if (u > 6.3 && cave < 1) { draw(CYL, M('#5d5852', { nosh: 1 }), C_(T_(0, .95, .02), Rx_(PI / 2), S_(1.0, .02, .8))); crackLines(Math.floor(E.seg(u, 6.3, 7.8) * 14)); }
    drawChunks(u, 8.0, [0, .95, .1], 77, 12, .7);
    // Jack: acende o fogo, espera, joga a água, comemora
    const lightUp = E.sseg(u, .7, 1.2) * (1 - E.sseg(u, 1.8, 2.3)), lift = E.sseg(u, 4.2, 4.8), thr = E.sseg(u, 4.95, 5.25) * (1 - E.sseg(u, 6.4, 6.9)), cheer = E.sseg(u, 10.5, 10.75);
    const hop = u > 10.5 && u < 11.2 ? .25 * Math.sin((u - 10.5) / .7 * PI) : 0;
    const j = drawJack({ pos: [1.35, hop, 1.55], yaw: PI + .5, lean: .45 * lightUp + .15 * thr, shR: 1.2 * lightUp + (.6 + .8 * thr) * lift * (1 - cheer), shL: (.6 + .8 * thr) * lift * (1 - cheer), elR: .3 + .5 * lift * (1 - thr), elL: .3 + .5 * lift * (1 - thr), abL: .12 + 2.5 * cheer, abR: .12 + 2.5 * cheer,
      smile: u > 8 ? 1 : .4, mouth: .5 * cheer + .2 * E.sseg(u, 8, 8.4), brow: u > 8 ? .8 : .3, headPitch: .15, blink: blinkF(u + .3) });
    if (lift > 0 && u < 6.6) { const hp = V.mix(Mx.pt(j.hands.L, [0, 0, 0]), Mx.pt(j.hands.R, [0, 0, 0]), .5); draw(CYL, TM.bucket, C_(T_(hp[0], hp[1] - .12, hp[2]), Rx_(-1.4 * thr), S_(.17, .3, .17))); if (thr < .3) draw(CYL, TM.water, C_(T_(hp[0], hp[1] + .03, hp[2]), S_(.15, .01, .15))); }
    else if (u < 4.2) draw(CYL, TM.bucket, C_(T_(2.1, .15, 1.6), S_(.17, .3, .17)));
    if (u > 5.15 && u < 5.75) { const d = u - 5.15; for (let i = 0; i < 26; i++) { const s = d - i * .012; if (s < 0 || s > .45) continue; const p = V.mix([.75, 1.4, 1.2], [0, .95, .1], s / .45); draw(SPH, TM.water, C_(T_(p[0], p[1] + .4 * Math.sin(s / .45 * PI), p[2]), S_(.07))); } }
    drawSteam(u, 5.5, [0, .9, .2], 1);
    if (r.v === undefined) { recap('FOGO E ÁGUA', 'o choque de temperatura racha a pedra', [0, .95, .05], lk(u, 8.5, 10.3)); if (u > 10.4) ovChip('FUNCIONA!', 360, 260, lk(u, 10.45, 11.3), 'rgba(28,130,70,.92)'); }
  } else {
    // mais fundo: a fumaça fica presa lá dentro
    const v = u - 11.3, sm = E.sseg(v, 0, 3.4); setInside(.55, .55 * sm); drawTunnel(tw, { kind: 'rough', end: 4.2 });
    camera([.9, 1.5, .8], [-.3, 1.2, -4], .9); R.shC = [0, 0, -2.4]; R.shR = 5;
    drawFire(tw, [-.4, floorR(-.4, -3.8), -3.6], 1); for (let i = 0; i < 4; i++) drawSmoke(tw + i * .7, [-.4 + i * .2, .5, -3.5], 2, 1.6, [.2, .5]);
    const cg = cough(tw, E.sseg(v, .9, 1.4));
    drawJack(Object.assign({ pos: [.35, floorR(.35, -2.0), -2.0], yaw: .3, abL: .25, abR: .25, elL: .5, elR: .5 }, cg));
    ovHaze(.5 * sm);
  }
}

// ---------- tentativa 3: pólvora ----------
function D01(t, g) {
  chipSet('TENTATIVA 3', 'a pólvora'); const r = RW(t, 23.7, 23.95, 25.1, 12.2), u = r.t, tw = g + r.tw; R.fx = r.fx; if (r.v !== undefined) R.chip = null;
  if (u < 11.75) {
    const blown = u >= 9.3; drawValley(tw, { portal: blown ? 'rough' : 'none', hole: 1 });
    const sk = shake(u, 9.3, .35), work = u > 2.6 && u < 7.3; camera(V.add(work ? [3.4, 1.65, .95] : u < 7.3 ? [4.6, 2.0, 3.0] : [1.6, 2.3, 8.2], sk), work ? [-.6, 1.55, .6] : u < 7.3 ? [0, 1.5, .9] : [0, 1.7, .5], .9); R.shC = [.5, 0, 1.5]; R.shR = 7;
    const holes = holePts(), hitT = [2.9, 3.4, 3.9, 4.4, 4.9, 5.4], nh = hitT.filter(h => u >= h).length;
    if (!blown) { drawHoles(nh); if (u > 6.0) drawFuses(E.seg(u, 7.3, 9.3), [.6, .03, 1.5], tw); }
    // Jack: chega com marreta e talhadeira, fura, acende o pavio e corre
    let pos = [1.6, 0, 3.0], yaw = PI, w = {}, pose = { shR: .25, elR: .4, shL: .25, elL: .4 }, face = { smile: .5, brow: .4 };
    if (u < 2.6) { const wk = walker(u, .3, 2.4, [2.6, 0, 2.6], [-.6, 0, .78], PI); pos = wk.pos; yaw = wk.yaw; w = wk.w; }
    else if (u < 5.8) { const i = Math.min(5, Math.max(0, Math.floor((u - 2.55) / .5))), h = holes[i], hy = h[1]; pos = [h[0] + .2, 0, .78]; yaw = PI; const a = hitEnv(u, hitT);
      pose = Object.assign(hamPose(a), { shL: armTo(hy), elL: .15, abL: .05 }); face = { smile: .3, brow: .2, headPitch: -.3 * (hy - 1.6) }; }
    else if (u < 7.6) { pos = [.9, 0, 1.25]; yaw = PI + .3; const cr = E.sseg(u, 7.0, 7.3); pose = { lean: .55 * cr, shR: 1.1 * cr + .2, elR: .3, shL: .3, elL: .5 }; face = { smile: .8, brow: .5 }; }
    else if (u < 9.3) { const wk = walker(u, 7.6, 8.5, [.9, 0, 1.25], [7.5, 0, 2.2], PI); pos = wk.pos; yaw = wk.yaw; w = walkPose((u - 7.6) * 3.2, 1.3); pose = { lean: .3 }; face = { mouth: .6, brow: 1, smile: 0 }; }
    else { const wk = walker(u, 9.7, 11.0, [6.5, 0, 2.2], [2.6, 0, 2.0], PI + .9); pos = wk.pos; yaw = wk.yaw; w = wk.w; pose = { lean: .2 }; face = { smile: E.sseg(u, 10.6, 11) * 1, mouth: .3, brow: .8 }; }
    const j = drawJack(Object.assign({ pos, yaw }, w, pose, face, { blink: blinkF(u + .7) }));
    if (u < 7.0) { const hp = drawSledge(j.hands.R, HAM.q); const tip = drawChisel(j.hands.L, -1.2); hitT.forEach((h, i) => drawSparks(u, h, [holes[i][0], holes[i][1], .08], 600 + i, 8, .35)); }
    drawBlast(u, 9.3, [0, 1.6, 0], 1.2); ovFlash(u > 9.3 && u < 9.6 ? 1 - (u - 9.3) / .3 : 0);
    if (u > 9.25 && u < 9.95) ovText([0, 2.6, .5], 'BUM!', lk(u, 9.3, 9.95), '#ffd23f', 110);
    if (r.v === undefined) recap('PÓLVORA', 'explode pedaços grandes de uma vez', [0, 1.6, .05], lk(u, 9.9, 11.7));
  } else {
    const v = u - 11.75; setInside(.62); drawTunnel(tw, { kind: 'rough', end: 22 });
    camera([.5, 1.75, -10.5], [-.2, 1.3, -2], .92); R.shC = [0, 0, -5]; R.shR = 8;
    const wk = walker(v, .1, 2.9, [.1, 0, -.4], [-.4, 0, -5.4], PI), stum = v > 6.0 && v < 7.0 ? Math.sin((v - 6.0) * 9) * (1 - (v - 6.0)) : 0;
    const x = wk.pos[0], z = wk.pos[2], hitHead = 9.43, dz = E.sseg(v, 9.4, 9.7) * (1 - E.sseg(v, 11.3, 11.8));
    const j = drawJack(Object.assign({ pos: [x, floorR(x, z), z], yaw: wk.moving ? wk.yaw : PI + .2 }, wk.w, { roll: .14 * stum, abL: .2 + .9 * Math.abs(stum), abR: .2 + .9 * Math.abs(stum), elL: .2 + 1.0 * dz, elR: .2 + 1.0 * dz,
      mouth: .5 * dz + .2 * Math.abs(stum), brow: -.8 * dz - .3 * Math.abs(stum), smile: -.7 * dz, headPitch: -.2 * E.sseg(v, 8.0, 8.6) * (1 - dz), blink: blinkF(v) }));
    // pedras soltas do teto: uma acerta a cabeça do Jack, as outras caem em volta
    const rocks = [[8.55, x + .9, z - .8], [hitHead - .58, x, z], [10.0, x - 1.0, z + .6], [10.6, x + .5, z - 1.6]];
    for (const [t0, rx, rz] of rocks) { const d = v - t0; if (d < 0) continue; const top = 3.9, isHead = Math.abs(t0 - (hitHead - .58)) < 1e-6, stop = isHead ? 2.05 : floorR(rx, rz) + .1; let y = top - 4.9 * d * d, xx = rx;
      if (y < stop) { const e = d - Math.sqrt((top - stop) / 4.9); if (isHead) { xx = rx + .9 * e; y = Math.max(floorR(rx, rz) + .1, stop + 1.6 * e - 4.9 * e * e); } else { y = stop; drawDust(v, t0 + Math.sqrt((top - stop) / 4.9), [rx, stop - .1, rz], 6, '#b3a898'); } }
      draw(SPH, TM.rockL, C_(T_(xx, y, rz), Ry_(t0 * 3), S_(.13, .1, .12))); }
    if (v > hitHead) stars(j.head, lk(v, hitHead, 11.6), v);
    if (r.v === undefined) { leader('PAREDES TORTAS', [1.9, 2.3, -3.2], 360, 260, lk(v, 3.4, 5.4)); leader('CHÃO DESNIVELADO', [.4, floorR(.4, -4.0), -4.0], 360, 260, lk(v, 5.7, 8.0)); leader('PEDRAS SOLTAS', [-.3, 3.6, -6.0], 360, 260, lk(v, 8.3, 9.5)); }
  }
}
