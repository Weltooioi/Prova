// Ficha do Jack com o motor e o personagem ORIGINAIS (lib/jack-engine), uma tomada por segundo:
//   0-3 vistas · 4-8 expressões · 9 detalhe · 10-13 poses. Compare com reference/jack/ficha_*.png usando --still.
/* global beginFrame, camera, draw, flush, drawJack, walkPose, M, R, V, BOX, Mx */
import { defineFilm } from '../../lib/runtime.js';

const EXPR = { // do arquivo original (cena de demonstração)
  neutro: { smile: .2, brow: 0 },
  feliz: { smile: 1, grin: 1, brow: .7 },
  surpreso: { smile: 0, mouth: .8, brow: 1 },
  pensando: { smile: 0, grin: -.25, brow: .25, gazeY: .9, gazeX: .6 },
  triste: { smile: 0, grin: -.55, brow: -.5, gazeY: -.6 },
};
const POSE = {
  idle: { abL: .32, abR: .32, elL: .12, elR: .12 },
  andando: { ...walkPose(0.25), abL: .12, abR: .12 },
  apontando: { abR: 1.45, shR: .15, elR: .05, pointR: 1, abL: .25, elL: .12, headYaw: -.15 },
  joinha: { abR: .35, shR: .95, elR: 2.2, abL: .3, elL: .12 },
  acenando: { abR: 2.6, shR: .1, elR: .3, abL: .3, elL: .12 },
};
const SHOTS = [
  { yaw: 0 }, { yaw: .75 }, { yaw: Math.PI / 2 }, { yaw: Math.PI },
  { face: 1, e: 'neutro' }, { face: 1, e: 'feliz' }, { face: 1, e: 'surpreso' }, { face: 1, e: 'pensando' }, { face: 1, e: 'triste' },
  { face: 1, e: 'neutro', yaw: 1.0 },
  { p: 'andando', yaw: .35 }, { p: 'apontando', dx: -.22 }, { p: 'joinha', e: 'feliz' }, { p: 'acenando', e: 'feliz' },
];

defineFilm({
  frame(t, film) {
    const s = SHOTS[Math.min(SHOTS.length - 1, Math.floor(t))];
    beginFrame(t);
    R.sun = V.norm([.45, .8, .55]); R.sunC = [1.55, 1.36, 1.08]; R.sky = [.36, .48, .72]; R.gnd = [.3, .36, .2]; R.fogD = 0;
    R.zen = [.1, .34, .85]; R.hor = [.56, .78, .99]; R.fog = [.66, .83, .98];
    const bg = M('#e4e7ec', { spec: 0 });
    draw(BOX, bg, Mx.chain(Mx.T(0, -.05, 0), Mx.S(40, .1, 40)));
    draw(BOX, bg, Mx.chain(Mx.T(0, 6, -3), Mx.S(40, 14, .1)));
    R.shC = [0, 0, 0]; R.shR = 3;
    const dx = s.dx || 0;
    if (s.face) camera([0, 1.66, 2.1], [0, 1.64, 0], .52); else camera([dx, 1.02, 4.3], [dx, 1.0, 0], .52);
    drawJack({ pos: [0, 0, 0], yaw: s.yaw || 0, ...POSE[s.p || 'idle'], ...EXPR[s.e || 'neutro'] });
    flush();
    film.ctx.drawImage(document.getElementById('gl'), 0, 0);
    if (R.overlay) R.overlay(film.ctx);
  },
});
