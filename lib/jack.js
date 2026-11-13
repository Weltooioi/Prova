// O Curioso Jack — the character, built from primitives in Three.js.
// Reference: reference/jack/ficha_*.png. Units: metres-ish, Jack stands ~1.92 tall, facing +z, feet at y = 0.
//
//   const jack = createJack(THREE);  scene.add(jack.root);
//   jack.pose({ ...POSES.idle, ...EXPR.feliz });   // call once per frame with values computed from t
//
// Rig: root -> hips -> torso -> neck -> head; torso -> shoulderL/R -> elbow -> hand; hips -> hipL/R -> knee -> foot.
// Elbows only bend forward (pose clamps them), knees only bend backward.
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export const COLORS = {
  skin: '#EDD5B0', nose: '#E6BE98', lips: '#9E1F1F', mouthIn: '#5A0E12', teeth: '#FFFFFF',
  hair: '#94522A', brow: '#7A4524', iris: '#6A3412', pupil: '#1A0D06', sclera: '#FFFFFF', socket: '#D9D6D0',
  jacket: '#7C8946', jacketDark: '#5E6833', pants: '#2C3654', boot: '#6E3E1E', sole: '#22160F',
  band: '#1C1F21', gold: '#EEC24A', lens: '#B4E0EE', belt: '#3A2416', buckle: '#ECECE6', strap: '#7A3E1C', button: '#F4F4F0',
};

export function createJack(THREE, { seed = 7 } = {}) {
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.62, metalness: 0, ...o });
  const M = {
    skin: mat(COLORS.skin, { roughness: 0.7 }), nose: mat(COLORS.nose, { roughness: 0.7 }), lips: mat(COLORS.lips),
    mouthIn: mat(COLORS.mouthIn), teeth: mat(COLORS.teeth), hair: mat(COLORS.hair, { roughness: 0.75 }),
    brow: mat(COLORS.brow), iris: mat(COLORS.iris, { roughness: 0.3 }), pupil: mat(COLORS.pupil, { roughness: 0.2 }),
    sclera: mat(COLORS.sclera, { roughness: 0.35 }), socket: mat(COLORS.socket), shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    jacket: mat(COLORS.jacket, { roughness: 0.88 }), jacketDark: mat(COLORS.jacketDark, { roughness: 0.9 }),
    pants: mat(COLORS.pants, { roughness: 0.85 }), boot: mat(COLORS.boot, { roughness: 0.45 }), sole: mat(COLORS.sole),
    band: mat(COLORS.band, { roughness: 0.32 }), gold: mat(COLORS.gold, { roughness: 0.3, metalness: 0.35 }),
    lens: mat(COLORS.lens, { roughness: 0.1 }), belt: mat(COLORS.belt, { roughness: 0.4 }), buckle: mat(COLORS.buckle, { roughness: 0.3 }),
    strap: mat(COLORS.strap, { roughness: 0.5 }), button: mat(COLORS.button, { roughness: 0.3 }),
  };
  const mesh = (geo, m, parent, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(...p); o.rotation.set(...r); o.scale.set(...s);
    o.castShadow = true; o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const group = (parent, p = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...p); parent.add(g); return g; };
  const capsule = (r, len, seg = 20) => new THREE.CapsuleGeometry(r, len, 8, seg);
  const sphere = (r, w = 32, h = 20) => new THREE.SphereGeometry(r, w, h);

  const root = new THREE.Group();
  const hips = group(root, [0, 0.70, 0]);

  // ---------- torso (jacket) ----------
  const torso = group(hips, [0, 0, 0]);
  mesh(new RoundedBoxGeometry(0.40, 0.58, 0.25, 4, 0.07), M.jacket, torso, [0, 0.27, 0]);
  // belt + buckle
  mesh(new RoundedBoxGeometry(0.414, 0.036, 0.262, 2, 0.016), M.belt, torso, [0, 0.135, 0]);
  mesh(new THREE.BoxGeometry(0.05, 0.03, 0.01), M.buckle, torso, [0, 0.135, 0.132]);
  // pockets (flap + pocket) and buttons
  for (const s of [-1, 1]) {
    mesh(new THREE.BoxGeometry(0.075, 0.06, 0.008), M.jacketDark, torso, [s * 0.095, 0.37, 0.126]);
    mesh(new THREE.BoxGeometry(0.08, 0.018, 0.012), M.jacketDark, torso, [s * 0.095, 0.405, 0.127]);
    mesh(sphere(0.007, 10, 8), M.button, torso, [s * 0.095 - s * 0.022, 0.405, 0.134]);
  }
  for (const y of [0.42, 0.33, 0.24]) mesh(sphere(0.008, 10, 8), M.button, torso, [0, y, 0.127]);
  // collar: two folded flaps either side of the neck
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.07, 0.03, 0.06), M.jacketDark, torso, [s * 0.045, 0.555, 0.06], [0.5, 0, s * -0.35]);
  mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.035, 20), M.jacketDark, torso, [0, 0.565, 0]);
  // cross strap: over Jack's right shoulder (-x), down to his left hip (+x), front and back
  {
    const P = (x, y, z) => new THREE.Vector3(x, y - 0.70, z);
    const pts = [P(0.205, 0.83, 0.02), P(0.15, 0.87, 0.133), P(-0.02, 1.02, 0.135), P(-0.15, 1.15, 0.13), P(-0.175, 1.245, 0.0),
      P(-0.15, 1.15, -0.13), P(-0.02, 1.02, -0.135), P(0.15, 0.87, -0.133), P(0.205, 0.83, -0.02)];
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, 0.011, 8, true), M.strap, torso);
  }

  // ---------- neck + head ----------
  const neck = group(torso, [0, 0.56, 0]);
  mesh(new THREE.CylinderGeometry(0.03, 0.033, 0.11, 16), M.skin, neck, [0, 0.04, 0]);
  const head = group(neck, [0, 0.085, 0]);
  const HR = { x: 0.2, y: 0.218, z: 0.19 }, HC = new THREE.Vector3(0, 0.215, 0); // head ellipsoid radii and centre
  mesh(sphere(1, 48, 32), M.skin, head, HC.toArray(), [0, 0, 0], [HR.x, HR.y, HR.z]);
  // a point on the face surface at (x, y) relative to the head centre, plus the outward normal
  const surf = (x, y, push = 0) => {
    const k = 1 - (x / HR.x) ** 2 - (y / HR.y) ** 2;
    const z = HR.z * Math.sqrt(Math.max(0, k));
    const n = new THREE.Vector3(x / HR.x ** 2, y / HR.y ** 2, z / HR.z ** 2).normalize();
    return { p: new THREE.Vector3(x, y, z).add(HC).addScaledVector(n, push), n };
  };
  const faceAt = (x, y, push = 0) => {
    const g = new THREE.Group();
    const { p, n } = surf(x, y, push);
    g.position.copy(p);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    head.add(g);
    return g;
  };
  // ears
  for (const s of [-1, 1]) mesh(sphere(0.042, 20, 14), M.skin, head, [s * 0.195, 0.205, -0.01], [0, 0, 0], [0.45, 1, 0.75]);
  // nose
  mesh(sphere(0.021, 20, 14), M.nose, faceAt(0, -0.035, 0.008));

  // eyes: socket ring, sclera, iris, pupil, shine; upper lid is a cap of the same ellipsoid, so it can never overhang
  const EYE = { rx: 0.046, ry: 0.054, rz: 0.03 };
  const eyes = [-1, 1].map((s) => {
    const base = faceAt(s * 0.082, 0.0, -0.006);
    mesh(sphere(1, 32, 20), M.socket, base, [0, 0, -0.004], [0, 0, 0], [EYE.rx + 0.007, EYE.ry + 0.007, EYE.rz]);
    mesh(sphere(1, 32, 20), M.sclera, base, [0, 0, 0], [0, 0, 0], [EYE.rx, EYE.ry, EYE.rz]);
    const look = group(base, [0, 0, EYE.rz + 0.0012]); // in front of the sclera, so the iris is a full disc
    mesh(new THREE.CircleGeometry(0.03, 32), M.iris, look, [0, 0, 0.0005]);
    mesh(new THREE.CircleGeometry(0.016, 24), M.pupil, look, [0, 0, 0.001]);
    mesh(new THREE.CircleGeometry(0.0065, 12), M.shine, look, [0.01, 0.011, 0.0015]);
    const lid = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, 0.3), M.skin, base, [0, 0, 0], [0, 0, 0],
      [EYE.rx * 1.06, EYE.ry * 1.06, EYE.rz * 1.25]);
    const brow = faceAt(s * 0.085, 0.072, 0.004);
    const browBar = mesh(capsule(0.0115, 0.042, 10), M.brow, brow, [0, 0, 0], [0, 0, Math.PI / 2]);
    return { s, look, lid, brow, browBar, lidAmt: -1 };
  });

  // mouth: rebuilt from parameters each frame (cheap): a lip tube, or an open oval with teeth
  const mouthAt = faceAt(0, -0.105, 0.002);
  const mouth = { line: null, open: null, teeth: null };
  let mouthKey = '';

  // ---------- hair ----------
  const hairG = group(head, HC.toArray());
  // back cap: covers the back and sides of the skull above the nape
  mesh(new THREE.SphereGeometry(1, 40, 24, Math.PI * 0.95, Math.PI * 1.1, 0, Math.PI * 0.8), M.hair, hairG, [0, 0.0, -0.006], [0, 0, 0],
    [HR.x * 1.045, HR.y * 1.04, HR.z * 1.06]);
  // top: a dome under the spikes so no scalp shows between them
  mesh(new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.3), M.hair, hairG, [0, 0.01, 0], [0, 0, 0],
    [HR.x * 1.0, HR.y * 1.02, HR.z * 1.0]);
  const rnd = mulberry(seed);
  const spike = (pos, dir, r, h) => {
    const m = mesh(new THREE.ConeGeometry(r, h, 7), M.hair, hairG);
    const d = new THREE.Vector3(...dir).normalize();
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    m.position.set(...pos).addScaledVector(d, h / 2);
  };
  // crown spikes: a tall centre, shorter towards the sides and back
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 * 2.618 + rnd() * 0.3; // golden-angle scatter over the crown
    const ring = 0.02 + Math.sqrt(i / 24) * 0.13;
    const x = Math.sin(a) * ring, z = Math.cos(a) * ring * 0.9 - 0.015;
    const h = 0.25 - ring * 0.75 + rnd() * 0.06;
    spike([x, 0.16, z], [x * 2.6, 1, z * 2.0], 0.05 + rnd() * 0.014, h);
  }
  // side spikes just above the ears, pointing out and up
  for (const s of [-1, 1]) {
    spike([s * 0.17, 0.06, 0.02], [s * 1, 0.6, -0.05], 0.06, 0.19);
    spike([s * 0.165, 0.0, -0.07], [s * 1, 0.3, -0.4], 0.05, 0.14);
  }
  // back spikes, a ragged nape
  for (let i = 0; i < 4; i++) {
    const a = -0.9 + (i / 3) * 1.8;
    spike([Math.sin(a) * 0.17, 0.09, -Math.cos(a) * 0.15], [Math.sin(a) * 0.5, 0.9, -0.8], 0.05, 0.12);
  }

  // ---------- headband + goggles ----------
  mesh(new THREE.TorusGeometry(0.178, 0.036, 16, 48), M.band, head, [0, 0.355, -0.005], [Math.PI / 2 + 0.06, 0, 0], [1.05, 1, 1.0]);
  const gog = group(head, [0, 0.41, 0.15]);
  gog.rotation.x = -0.62;
  for (const s of [-1, 1]) {
    mesh(new THREE.TorusGeometry(0.056, 0.014, 14, 36), M.gold, gog, [s * 0.066, 0, 0]);
    mesh(new THREE.CircleGeometry(0.056, 32), M.lens, gog, [s * 0.066, 0, -0.003]);
  }
  mesh(new THREE.TorusGeometry(0.022, 0.009, 8, 16, Math.PI), M.gold, gog, [0, 0.012, 0]);

  // ---------- arms ----------
  const arms = [-1, 1].map((s) => {
    const shoulder = group(torso, [s * 0.208, 0.5, 0]);
    mesh(capsule(0.066, 0.2), M.jacket, shoulder, [0, -0.12, 0]);
    const elbow = group(shoulder, [0, -0.25, 0]);
    mesh(capsule(0.06, 0.17), M.jacket, elbow, [0, -0.1, 0]);
    mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.05, 20), M.jacketDark, elbow, [0, -0.205, 0]);
    const hand = group(elbow, [0, -0.27, 0]);
    const fist = mesh(sphere(0.064, 24, 16), M.skin, hand, [0, -0.005, 0], [0, 0, 0], [0.9, 1.0, 1.05]);
    const thumb = mesh(capsule(0.017, 0.035, 8), M.skin, hand, [-s * 0.035, -0.005, 0.03], [0, 0, 0]);
    const finger = mesh(capsule(0.015, 0.06, 8), M.skin, hand, [0, -0.07, 0.02]);
    return { s, shoulder, elbow, hand, fist, thumb, finger };
  });

  // ---------- legs + boots ----------
  const legs = [-1, 1].map((s) => {
    const hip = group(hips, [s * 0.086, 0.02, 0]);
    mesh(capsule(0.068, 0.2), M.pants, hip, [0, -0.15, 0]);
    const knee = group(hip, [0, -0.27, 0]);
    mesh(capsule(0.064, 0.2), M.pants, knee, [0, -0.13, 0]);
    const foot = group(knee, [0, -0.27, 0]);
    mesh(new THREE.CylinderGeometry(0.072, 0.07, 0.12, 20), M.boot, foot, [0, -0.04, 0]);
    mesh(new RoundedBoxGeometry(0.13, 0.09, 0.2, 3, 0.04), M.boot, foot, [0, -0.1, 0.035]);
    mesh(sphere(0.065, 20, 14), M.boot, foot, [0, -0.105, 0.11], [0, 0, 0], [1, 0.7, 0.8]);
    mesh(new RoundedBoxGeometry(0.14, 0.022, 0.23, 2, 0.008), M.sole, foot, [0, -0.15, 0.04]);
    return { s, hip, knee, foot };
  });
  // standing height: sole bottom at y = 0
  const STAND = 0.27 + 0.27 + 0.161 - 0.02; // hips height that puts the soles on y = 0
  hips.position.y = STAND;

  // ---------- pose: apply a full set of joint values (all optional) ----------
  function pose(P = {}) {
    const g = (k, d) => (P[k] ?? d);
    root.position.set(g('x', 0), 0, g('z', 0));
    root.rotation.y = g('turn', 0);
    hips.position.y = STAND + g('bob', 0);
    torso.rotation.set(g('lean', 0), g('twist', 0), g('tilt', 0));
    neck.rotation.set(g('nod', 0) * 0.4, g('look', 0) * 0.4, g('headTilt', 0) * 0.4);
    head.rotation.set(g('nod', 0) * 0.6, g('look', 0) * 0.6, g('headTilt', 0) * 0.6);
    for (const A of arms) {
      const side = A.s < 0 ? 'R' : 'L'; // Jack's right arm is at -x
      A.shoulder.rotation.set(g('arm' + side + 'Fwd', 0) * -1, g('arm' + side + 'Twist', 0), A.s * g('arm' + side + 'Out', 0.2));
      A.elbow.rotation.set(-Math.max(0, g('arm' + side + 'Bend', 0.12)), 0, 0);   // forward only
      A.hand.rotation.set(0, g('hand' + side + 'Turn', 0), 0);
      const h = g('hand' + side, 'fist');
      A.thumb.visible = h === 'thumb' || h === 'point' || h === 'fist';
      A.finger.visible = h === 'point';
      if (h === 'thumb') { A.thumb.position.set(0, -0.075, 0.015); A.thumb.rotation.set(0, 0, 0); A.thumb.scale.setScalar(1.25); }
      else { A.thumb.position.set(-A.s * 0.036, -0.01, 0.032); A.thumb.rotation.set(0.5, 0, -A.s * 0.4); A.thumb.scale.setScalar(1); }
    }
    for (const L of legs) {
      const side = L.s < 0 ? 'R' : 'L';
      L.hip.rotation.set(-g('leg' + side + 'Fwd', 0), 0, L.s * g('leg' + side + 'Out', 0.0));
      L.knee.rotation.set(Math.max(0, g('leg' + side + 'Bend', 0)), 0, 0);             // backward only
      L.foot.rotation.set(-g('foot' + side, 0), 0, 0);
    }
    // face
    for (const E of eyes) {
      const lid = clamp01(g('lids', 0.06) + (E.s < 0 ? g('lidR', 0) : g('lidL', 0)));
      if (Math.abs(lid - E.lidAmt) > 1e-4) {
        E.lid.geometry.dispose();
        E.lid.geometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, 0.35 + lid * (Math.PI - 0.35));
        E.lidAmt = lid;
      }
      E.look.position.x = g('gazeX', 0) * 0.014;
      E.look.position.y = g('gazeY', 0) * 0.014;
      const raise = g('browUp', 0) + (E.s < 0 ? g('browR', 0) : g('browL', 0));
      E.browBar.position.y = raise * 0.02;
      // browIn > 0: inner ends up (sad / worried); < 0: inner ends down (cross)
      E.browBar.rotation.z = Math.PI / 2 + E.s * g('browIn', 0) * -0.45;
    }
    setMouth(g('smile', 0), g('open', 0), g('mouthW', 1));
  }

  function setMouth(smile, open, w) {
    const key = `${smile.toFixed(3)}|${open.toFixed(3)}|${w.toFixed(3)}`;
    if (key === mouthKey) return;
    mouthKey = key;
    for (const k of ['line', 'open', 'teeth']) if (mouth[k]) { mouthAt.remove(mouth[k]); mouth[k].geometry.dispose(); mouth[k] = null; }
    const W = 0.085 * w;
    if (open < 0.08) {
      // corners at y = smile * c, middle at y = -smile * c
      const c = 0.022 * smile;
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-W / 2, c, 0), new THREE.Vector3(0, -c * 1.2, 0.004), new THREE.Vector3(W / 2, c, 0));
      mouth.line = mesh(new THREE.TubeGeometry(curve, 24, 0.0075 + Math.abs(smile) * 0.002, 8), M.lips, mouthAt);
    } else {
      const h = 0.012 + open * 0.05;
      mouth.open = mesh(new THREE.SphereGeometry(1, 28, 14), M.mouthIn, mouthAt, [0, 0, -0.004], [0, 0, 0], [W * 0.45 + open * 0.004, h / 2, 0.01]);
      mouth.line = mesh(new THREE.TorusGeometry(1, 0.13, 8, 32), M.lips, mouthAt, [0, 0, 0.001], [0, 0, 0], [W * 0.45 + open * 0.004, h / 2, 0.06]);
      mouth.teeth = mesh(new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, 0.9), M.teeth, mouthAt, [0, h * 0.18, 0.002], [Math.PI / 2, 0, 0],
        [W * 0.32, 0.004, h * 0.26]);
    }
  }

  pose({});
  return { root, pose, parts: { hips, torso, neck, head, arms, legs, eyes } };
}

// ---------- pose and expression presets (merge them: jack.pose({ ...POSES.idle, ...EXPR.feliz })) ----------
export const EXPR = {
  neutro: { lids: 0.06, smile: 0, open: 0, browUp: 0, browIn: 0 },
  feliz: { lids: 0.1, smile: 1, open: 0, mouthW: 1.3, browUp: 0.15 },
  surpreso: { lids: 0.0, smile: 0, open: 0.7, mouthW: 0.65, browUp: 0.6 },
  pensando: { lids: 0.22, smile: -0.2, open: 0.2, mouthW: 0.45, browR: 0.5, browL: -0.1, gazeX: 0.6, gazeY: 0.6 },
  triste: { lids: 0.38, smile: -1, open: 0, mouthW: 0.9, browIn: 0.9, browUp: 0.1, gazeY: -0.3 },
};

export const POSES = {
  idle: { armROut: 0.2, armLOut: 0.2, armRBend: 0.12, armLBend: 0.12 },
  apontando: { armROut: 1.3, armRFwd: 0.7, armRBend: 0.05, handR: 'point', handRTurn: 0, armLOut: 0.16, armLBend: 0.1, look: -0.15 },
  joinha: { armROut: 0.3, armRFwd: 0.95, armRBend: 2.25, handR: 'thumb', armLOut: 0.2, armLBend: 0.1 },
  acenando: { armROut: 2.6, armRFwd: 0.1, armRBend: 0.25, armLOut: 0.2, armLBend: 0.1 },
};

/** Walk cycle at phase p (1 = one full stride, two steps). Arms swing opposite to legs. */
export function walk(p, amt = 1) {
  const s = Math.sin(p * Math.PI * 2), c = Math.cos(p * Math.PI * 2);
  return {
    legRFwd: 0.42 * s * amt, legLFwd: -0.42 * s * amt,
    legRBend: Math.max(0, -c) * 0.55 * amt * (s < 0 ? 1 : 0.4), legLBend: Math.max(0, c) * 0.55 * amt * (s > 0 ? 1 : 0.4),
    footR: 0.15 * s * amt, footL: -0.15 * s * amt,
    armRFwd: -0.38 * s * amt, armLFwd: 0.38 * s * amt, armROut: 0.12, armLOut: 0.12, armRBend: 0.35, armLBend: 0.35,
    bob: -Math.abs(Math.sin(p * Math.PI * 2)) * 0.025 * amt, twist: 0.06 * s * amt,
  };
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
