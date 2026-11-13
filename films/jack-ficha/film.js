// Jack model sheet: one shot per second, to compare against reference/jack/ficha_*.png with --still.
//   0-3 views (front, three quarters, side, back) · 4-8 expressions · 9 detail · 10-13 poses
import '../../lib/three-shim.js'; // must come before 'three'
import * as THREE from 'three';
import { defineFilm } from '../../lib/runtime.js';
import { createJack, EXPR, POSES, walk } from '../../lib/jack.js';

const W = 1080, H = 1920;
const SHOTS = [
  { kind: 'full', turn: 0 }, { kind: 'full', turn: -0.6 }, { kind: 'full', turn: -Math.PI / 2 }, { kind: 'full', turn: Math.PI },
  { kind: 'face', e: 'neutro' }, { kind: 'face', e: 'feliz' }, { kind: 'face', e: 'surpreso' }, { kind: 'face', e: 'pensando' }, { kind: 'face', e: 'triste' },
  { kind: 'face', e: 'neutro', turn: -1.0 },
  { kind: 'full', p: 'andando', turn: -0.35 }, { kind: 'full', p: 'apontando' }, { kind: 'full', p: 'joinha', e: 'feliz' }, { kind: 'full', p: 'acenando', e: 'feliz' },
];

defineFilm({
  setup() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#CDCDCB');
    scene.add(new THREE.HemisphereLight('#ffffff', '#9fb0cc', 1.5));
    const sun = new THREE.DirectionalLight('#fffaf2', 2.4);
    sun.position.set(3.5, 5, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -1, near: 1, far: 20 });
    sun.shadow.radius = 3;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    const fill = new THREE.DirectionalLight('#e8eefc', 0.6);
    fill.position.set(-3, 2, 3);
    scene.add(fill);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#E2E3E8', roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshStandardMaterial({ color: '#CFCFCD', roughness: 1 }));
    wall.position.set(0, 10, -2.2);
    wall.receiveShadow = true;
    scene.add(floor, wall);

    const jack = createJack(THREE);
    scene.add(jack.root);
    const camera = new THREE.PerspectiveCamera(28, W / H, 0.05, 60);
    return { renderer, scene, camera, jack };
  },
  frame(t, film, { renderer, scene, camera, jack }) {
    const shot = SHOTS[Math.min(SHOTS.length - 1, Math.floor(t))];
    const pose = shot.p === 'andando' ? walk(0.25) : POSES[shot.p || 'idle'];
    jack.pose({ ...pose, ...EXPR[shot.e || 'neutro'], turn: shot.turn || 0 });
    if (shot.kind === 'full') { const dx = shot.p === 'apontando' ? -0.22 : 0; camera.position.set(dx, 1.05, 4.9); camera.lookAt(dx, 0.98, 0); }
    else { camera.position.set(0, 1.62, 2.3); camera.lookAt(0, 1.6, 0); }
    renderer.render(scene, camera);
    film.ctx.drawImage(renderer.domElement, 0, 0);
  },
});
