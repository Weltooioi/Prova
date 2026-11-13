// Corte de árvores, destaque do que mudou em cada tentativa e legendas.
function treeChop(u, tw, n) {
  const px = .6, pz = -5.2, gy = sandY(pz);
  if (u < 2.7) {
    camera([px + 3.3, 1.9, pz + 3.9], [px - .7, 1.45, pz], .9); R.shC = [px - 1, 0, pz]; R.shR = 9; drawBeach(tw);
    const hits = [.45, .95, 1.45], fall = E.inq(E.seg(u, 1.55, 2.35));
    drawPalm(0, 0, 5.6, .25, 77, C_(T_(px, gy - .1, pz), Rz_(1.5 * fall)));
    hits.forEach((h, i) => drawChips(u, h, [px + .2, gy + .72, pz], 90 + i, 6));
    const d = u - 2.35; if (d > 0) for (let i = 0; i < 6; i++) draw(SPH, M('#e8d6a8', { a: Math.max(0, .5 - d * 1.4), nosh: 1, norecv: 1 }), C_(T_(px - 1.2 - i * .7, gy + .15 + d * .5, pz + (i % 2 ? .3 : -.3)), S_(.3 + d * 1.1)));
    const act = 1 - E.sseg(u, 1.55, 1.8), a = chopSwing(u, .45, .5) * act, P = chopPose(a), ch = 1 - act;
    const j = drawJack(Object.assign(P, { pos: [px + .8, gy, pz], yaw: -PI / 2, lean: P.lean * act, shR: P.shR * act + .3 * ch, elR: P.elR * act + .4 * ch, shL: P.shL * act, elL: P.elL * act + .2, headPitch: .2 * act - .15 * ch, smile: ch, brow: ch - .3 * act, mouth: .3 * ch, blink: blinkF(u + 1) }));
    drawAxe(j.hands.R, CHOP.q);
  } else {
    const v = u - 2.7; camera([px + 2.6, 2.0, pz + 6.0], [px - 1.5, .75, pz + .3], .9); R.shC = [px - 1.5, 0, pz]; R.shR = 9; drawBeach(tw);
    for (let i = 0; i < n; i++) { const z = pz + .9 - i * .42; drawLog(C_(T_(px - 2.5, sandY(z) + (n > 1 ? RAFT.r : LOGR), z), Rx_(i * 1.3)), n > 1 ? RAFT.len : LOGL, n > 1 ? RAFT.r : LOGR, { clean: n > 1 }); }
    for (let i = 0; i < Math.min(3, n); i++) { const sx = px + .2 - i * 1.5, sz = pz - 1.5 - (i % 2) * .5; draw(CYL, WC.bark, C_(T_(sx, sandY(sz) + .12, sz), S_(.17, .26, .17))); draw(DISC, WC.cut, C_(T_(sx, sandY(sz) + .252, sz), S_(.16))); }
    for (let i = 0; i < 7; i++) draw(CONE, i % 2 ? WC.leaf : WC.leafD, C_(T_(px - 5.2, gy + .1, pz - .6), Ry_(i * .9), Rx_(1.35), S_(.3, 1.3, .05)));
    const j = drawJack({ pos: [px - .35, sandY(pz + 1.7), pz + 1.7], yaw: .45, abL: .5, elL: 1.4, twL: -.6, shR: .15, elR: .35, smile: 1, brow: .7, mouth: .3 * E.sseg(v, .1, .4), blink: blinkF(v + 2.6) }); drawAxe(j.hands.R, CHOP.q);
  }
}
function recap(name, what, p, k) { if (k > 0) R.recap = { name, what, p, k: E.c01(k) }; }
function recapK(t, a, b) { return Math.min((t - a) * 4, (b - t) * 4); }
function drawRecap(c, r, frame) {
  const k = E.ss(r.k), q = proj(r.p), y0 = 838 + (1 - k) * 30; c.save(); c.globalAlpha = k;
  c.strokeStyle = '#ffd23f'; c.lineWidth = 5; c.beginPath(); c.arc(q[0], q[1], 48 + 5 * Math.sin(frame * .35), 0, 7); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(q[0], q[1] + 54); c.lineTo(q[0], Math.max(q[1] + 54, y0)); c.stroke();
  c.fillStyle = 'rgba(10,20,36,.88)'; c.beginPath(); c.roundRect(50, y0, 620, 132, 22); c.fill(); c.fillStyle = '#ffd23f'; c.fillRect(50, y0 + 20, 8, 92);
  c.textAlign = 'left'; c.font = '700 20px "DejaVu Sans", Arial, sans-serif'; c.fillText('O QUE MUDOU', 80, y0 + 34); c.fillStyle = '#fff'; c.font = '800 40px "DejaVu Sans", Arial, sans-serif'; c.fillText(r.name, 80, y0 + 78);
  c.font = '600 24px "DejaVu Sans", Arial, sans-serif'; c.fillStyle = 'rgba(255,255,255,.92)'; c.fillText(r.what, 80, y0 + 112); c.restore();
}
window.SUBS = [];   // [{a, b, text}] em tempo global; preenchido quando a narração chegar
function drawSub(c, T) {
  const s = window.SUBS.find(x => T >= x.a && T < x.b); if (!s) return; c.save(); c.font = '800 36px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round';
  const words = s.text.split(' '), lines = ['']; for (const w of words) { const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w; if (c.measureText(t).width > 610 && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t; }
  lines.forEach((ln, i) => { const y = 1100 - (lines.length - 1 - i) * 46; c.strokeStyle = 'rgba(0,0,0,.9)'; c.lineWidth = 9; c.strokeText(ln, 360, y); c.fillStyle = '#fff'; c.fillText(ln, 360, y); }); c.restore();
}
