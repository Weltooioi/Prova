// prova-3d — 8 s, 1080x1920, 120 BPM. A Three.js scene posed as a pure function of t, drawn into the film canvas.
// Every object's transform and the camera are computed from t alone; nothing carries over between frames.
import '../../lib/three-shim.js'; // must come before 'three'
import * as THREE from 'three';
import { RoomEnvironment } from '../../lib/vendor/RoomEnvironment.js';
import * as opentype from '../../lib/vendor/opentype.min.mjs';
import { defineFilm } from '../../lib/runtime.js';
import { clamp, lerp, prog, ease } from '../../lib/time.js';

const PAPER = '#ECE8DF', INK = '#1A1A1A', ACCENT = '#FF4A1C';
const UI = '"JetBrains Mono", monospace';
const W = 1080, H = 1920;
const WORD = 'PROVA', ACC = 2; // the O carries the accent

defineFilm({
  fonts: [`500 52px ${UI}`],
  async setup() {
    const buf = await (await fetch('../../assets/fonts/InterDisplay-Black.otf')).arrayBuffer();
    const font = opentype.parse(buf);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PAPER);
    scene.fog = new THREE.Fog(PAPER, 14, 34);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;

    scene.add(new THREE.HemisphereLight('#ffffff', '#b9b2a4', 1.4));
    const sun = new THREE.DirectionalLight('#fff6ea', 2.6);
    sun.position.set(-4, 9, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 8, bottom: -4, near: 1, far: 30 });
    sun.shadow.radius = 5;
    sun.shadow.bias = -0.0004;
    scene.add(sun, sun.target);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: PAPER, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ink = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.42, metalness: 0.0 });
    const accent = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.38, metalness: 0.0 });

    // Extruded glyphs. Each geometry is centred on x/z, with its bottom at y = 0 so it can sit on the floor.
    const letters = [...WORD].map((ch, i) => {
      const geo = glyph(font, ch);
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
      geo.computeBoundingBox();
      const size = geo.boundingBox.getSize(new THREE.Vector3());
      const mesh = new THREE.Mesh(geo, i === ACC ? accent : ink);
      mesh.castShadow = mesh.receiveShadow = true;
      const pivot = new THREE.Group(); // pivot at the glyph's centre, so flips and squashes read well
      pivot.add(mesh);
      scene.add(pivot);
      return { pivot, mesh, w: size.x, h: size.y };
    });
    // Row layout: tight tracking, centred on x = 0.
    const gap = 0.05;
    const total = letters.reduce((a, l) => a + l.w, 0) + gap * (letters.length - 1);
    let x = -total / 2;
    for (const l of letters) { l.rowX = x + l.w / 2; x += l.w + gap; }
    // Tower layout: A at the bottom, P on top, reading downwards.
    let y = 0;
    for (let i = letters.length - 1; i >= 0; i--) { letters[i].stackY = y; y += letters[i].h + 0.03; }
    const towerH = y;

    // Hole of the O: centre of its counter, which the camera flies through.
    const o = letters[ACC];
    const camera = new THREE.PerspectiveCamera(32, W / H, 0.02, 100);
    return { renderer, scene, camera, letters, o, towerH, sun };
  },

  frame(t, film, env) {
    const { ctx } = film;
    const { renderer, scene, camera, letters, o, towerH } = env;
    const b = (i) => film.beats[i] ?? i * 0.5;

    const T2 = b(4), T3 = b(8), T4 = b(12);

    for (let i = 0; i < letters.length; i++) {
      const L = letters[i];
      let px = L.rowX, py = 0, pz = 0, rx = 0, ry = 0, sx = 1, sy = 1, show = true;

      if (t < T4) {
        // S1: drop in on the 8ths with a squash on landing.
        const t0 = b(0) + i * (b(1) - b(0)) / 2 - 0.3, land = t0 + 0.3;
        const fall = prog(t, t0, land);
        py = (1 - ease.inQuad(fall)) * 4.5;
        show = t >= t0;
        const sq = squash(t - land);
        sx = 1 + sq * 0.35; sy = 1 - sq * 0.4;

        // S2: one flip per beat, hopping up and turning a full revolution around x.
        const f0 = T2 + i * (b(5) - b(4)) * 0.75, f1 = f0 + 0.42;
        const k = prog(t, f0, f1);
        if (k > 0) {
          py += Math.sin(Math.PI * k) * 0.9;
          rx = -ease.inOutCubic(k) * Math.PI * 2;
          const sq2 = squash(t - f1);
          sx *= 1 + sq2 * 0.25; sy *= 1 - sq2 * 0.3;
        }

        // S3: the O rises to eye height; the rest slide apart and sink out of frame.
        if (t >= T3) {
          const k3 = ease.outCubic(prog(t, T3, T3 + 0.7));
          if (i === ACC) {
            py += k3 * 0.55;
          } else {
            const side = i < ACC ? -1 : 1;
            px += side * k3 * (1.2 + Math.abs(i - ACC) * 0.5);
            py -= ease.inCubic(prog(t, T3 + 0.2, T3 + 1.2)) * 2.2;
          }
        }
      } else {
        // S4: the tower. A lands first, P last, one per 8th, each with a squash.
        const order = letters.length - 1 - i;
        const land = T4 + order * (b(13) - b(12)) / 2, t0 = land - 0.32;
        px = 0;
        py = L.stackY + (1 - ease.inQuad(prog(t, t0, land))) * 6;
        show = t >= t0 || t >= T4;
        ry = (1 - ease.outCubic(prog(t, t0, land + 0.2))) * (order % 2 ? 0.6 : -0.6);
        const sq = squash(t - land);
        sx = 1 + sq * 0.3; sy = 1 - sq * 0.35;
      }

      L.pivot.visible = show;
      // Squash around the base: scale the mesh, keep the pivot at the glyph's centre for rotation.
      L.pivot.position.set(px, py + L.h / 2 * sy, pz);
      L.mesh.position.set(0, -L.h / 2 * sy, 0);
      L.pivot.rotation.set(rx, ry, 0);
      L.mesh.scale.set(sx, sy, sx);
    }

    poseCamera(t, camera, { T2, T3, T4, o, towerH, b });
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0);
    caption(ctx, t, T4, b);
  },
});

// ---------- camera: keyed per section, eased between keys ----------
function poseCamera(t, cam, { T2, T3, T4, o, towerH, b }) {
  const O = o.pivot.position; // live position of the O this frame
  let pos, look;
  if (t < T2) {
    const k = ease.inOutQuad(prog(t, 0, T2));
    pos = v(lerp(0.5, 0.2, k), lerp(6.2, 5.2, k), lerp(15.5, 14.2, k));
    look = v(0, lerp(0.15, 0.3, k), 0);
  } else if (t < T3) {
    const k = ease.inOutCubic(prog(t, T2, T3));
    const a = lerp(0.02, -0.75, k), r = lerp(14.3, 11.5, k), hgt = lerp(5.2, 2.2, k);
    pos = v(Math.sin(a) * r, hgt, Math.cos(a) * r);
    look = v(0, lerp(0.3, 0.5, k), 0);
  } else if (t < T4) {
    // Swing back onto the O's axis, then dolly through its counter.
    const hole = v(O.x, O.y + 0.02, 0);
    const k1 = ease.inOutCubic(prog(t, T3, T3 + 0.9));
    const a = lerp(-0.75, 0, k1), r = lerp(11.5, 4.2, k1);
    const orbit = v(lerp(0, hole.x, k1) + Math.sin(a) * r, lerp(2.2, hole.y, k1), Math.cos(a) * r);
    const k2 = ease.inExpo(prog(t, T3 + 0.9, T4));
    pos = v(orbit.x, orbit.y, lerp(orbit.z, 0.02, k2)); // ends inside the counter: cut on the orange tunnel
    look = v(hole.x, hole.y, lerp(0, -10, k2));
  } else {
    const k = ease.outCubic(prog(t, T4, T4 + 2));
    pos = v(lerp(2.6, 1.6, k), lerp(towerH * 0.95, towerH * 0.62, k), lerp(9.6, 8.2, k));
    look = v(0, towerH * 0.46, 0);
  }
  cam.position.copy(pos);
  cam.lookAt(look);
}

// ---------- 2D overlay: one mono line, typed on the beat grid ----------
function caption(ctx, t, T4, b) {
  const line = 'cada quadro = f(t)';
  const k = prog(t, b(14), b(15));
  const n = Math.floor(k * line.length);
  if (n <= 0) return;
  ctx.font = `500 52px ${UI}`;
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(line.slice(0, n), W / 2, H - 120);
}

// ---------- helpers ----------
const v = (x, y, z) => new THREE.Vector3(x, y, z);
/** Landing squash: 0 before contact, a damped bounce after. */
function squash(dt) {
  if (dt < 0) return 0;
  return Math.exp(-9 * dt) * Math.cos(22 * dt) * clamp(dt / 0.02);
}

/** One glyph as an extruded, bevelled mesh geometry (units: 1 = font size). */
function glyph(font, ch) {
  const path = font.getPath(ch, 0, 0, 1);
  const sp = new THREE.ShapePath();
  for (const c of path.commands) {
    if (c.type === 'M') sp.moveTo(c.x, -c.y);
    else if (c.type === 'L') sp.lineTo(c.x, -c.y);
    else if (c.type === 'Q') sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y);
    else if (c.type === 'C') sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
  }
  let shapes = sp.toShapes(true);
  if (shapes.every((s) => s.holes.length === 0) && shapes.length > 1) shapes = sp.toShapes(false);
  return new THREE.ExtrudeGeometry(shapes, {
    depth: 0.32, curveSegments: 10,
    bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 4,
  });
}
