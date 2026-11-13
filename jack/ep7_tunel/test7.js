// Quadros de teste do cenário (PAGE=test.html node capture.js stills 0,1,2,... dir)
window.scene = function (T) {
  const i = Math.floor(T + 1e-6), t = T; beginFrame(t); R.fx = 0; R.chip = null; R.leaders = []; R.fade = 0; R.title = 0; R.ov2 = null; R.recap = null;
  if (i === 0) { drawValley(t); camera([3, 2.2, 14], [0, 3.5, 0], .9); R.shC = [0, 0, 4]; R.shR = 10; drawJack({ pos: [.5, 0, 4], yaw: PI, smile: .6 }); }
  if (i === 1) { drawValley(t, { portal: 'rough' }); camera([-3, 2.5, 11], [0, 2, 0], .9); R.shC = [0, 0, 3]; R.shR = 10; drawJack({ pos: [2.2, 0, 2.5], yaw: -2.6, smile: -.3 }); }
  if (i === 2) { setInside(.7); drawTunnel(t, { kind: 'rough', end: 22 }); camera([.6, 1.7, -1], [0, 1.4, -14], .95); R.shC = [0, 0, -6]; R.shR = 8; drawJack({ pos: [-.6, floorR(-.6, -6), -6], yaw: .3, brow: -.4 }); }
  if (i === 3) { setInside(.9); drawTunnel(t, { kind: 'smooth', asphalt: true, gutter: 1, tilt: 1, lamps: 1, fans: 1 }); camera([-1.2, 1.6, -1], [.3, 1.6, -20], .95); R.shC = [0, 0, -8]; R.shR = 10; const c = drawCar(carFrame(.9, -8, 0)); drawCar(carFrame(-1.1, -16, PI), { col: M('#2f6fb0', { spec: .5 }) }); }
  if (i === 4) { drawValley(t, { portal: 'round' }); camera([7, 3.5, 13], [0, 2, 0], .9); R.shC = [0, 0, 5]; R.shR = 12; drawTBM(C_(T_(0, TUN.cy, 4)), t, {}); drawJack({ pos: [4, 0, 6], yaw: -.8, smile: 1, brow: .7 }); }
  if (i === 5) { setInside(.8); drawRings(-14.25); drawRing(-15.75, 3); drawErector(-15.75, .5, 3); draw(BOX, TM.concF, C_(T_(0, -.6, -8), S_(5.2, 1.2, 16))); drawTBM(C_(T_(0, TUN.cy, -24)), 0, {}); camera([1.2, 1.3, -4], [0, 1.9, -16], .95); R.shC = [0, 0, -10]; R.shR = 10; }
  if (i === 6) { drawValley(t, { portal: 'modern', asphalt: true }); setInside(1); drawTunnel(t, { kind: 'smooth', asphalt: true, gutter: 1, lamps: 1, fans: 1 }); setSky(0); camera([6, 3, 18], [0, 3, 0], .9); R.shC = [0, 0, 6]; R.shR = 14; drawCar(carFrame(1.1, 9, PI)); }
  if (i === 7) { drawValley(t); camera([1.5, 1.5, 3.6], [0, 1.4, 0], .9); R.shC = [0, 0, 1]; R.shR = 4; drawFire(t, [0, 0, .5], 1); drawHoles(6); drawFuses(.4, [0, .05, 1.2], t); const j = drawJack({ pos: [1.2, 0, 1.4], yaw: PI + .5, ...chopPose(.6) }); drawPick(j.hands.R, CHOP.q); }
  if (i === 8) { setInside(.7); draw(floorGeo(), TM.floorR, Mx.I()); camera([.6, 1.7, -1], [0, 1.0, -8], .95); R.shC = [0, 0, -6]; R.shR = 8; drawJack({ pos: [-.6, floorR(-.6, -6), -6], yaw: .3 }); }
  if (i === 9) { setInside(.7); draw(tubeGeo('rough', roughR), TM.wallR, Mx.I()); camera([.6, 1.7, 3], [0, 1.4, -14], .95); }
  R.overlay = c => { if (R.ov2) R.ov2(c); };
};
