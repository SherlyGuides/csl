import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { M, B, C, P, G, at, tex, Panel, FONT, wrapText, STEEL, BLACK } from './kit.js';
import * as MD from './models.js';
import { makeKid } from './kid.js';
import { ITEMS } from '../catalogue-data.js';

// ---------------- Room: 36 x 32 ft (1,152 sq ft), 3.2 m ceiling ----------------
const W = 10.97, D = 9.75, H = 3.2, X = W / 2, Z = D / 2;
const ITEM = Object.fromEntries(ITEMS.map(i => [i.sno, i]));
const ZONES = {
  electronics: { label: 'Robotics & Electronics', color: '#2f9e5b' }, general: { label: 'General & Teaching', color: '#2a6f97' },
  agriculture: { label: 'Agriculture & Gardening', color: '#c4441c' }, food: { label: 'Food Production', color: '#2e86ab' },
  healthcare: { label: 'Healthcare', color: '#7465ad' }, it: { label: 'IT / ITeS', color: '#c98a0b' }, bfsi: { label: 'BFSI', color: '#0f7c7c' }, safety: { label: 'Safety Corner', color: '#c62828' },
};

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(app.clientWidth, app.clientHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);
const labelR = new CSS2DRenderer(); labelR.setSize(app.clientWidth, app.clientHeight); labelR.domElement.className = 'labels'; app.appendChild(labelR.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e9e2d6');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;

const camera = new THREE.PerspectiveCamera(50, app.clientWidth / app.clientHeight, 0.03, 120);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 0.35; controls.maxDistance = 26;
const walk = new PointerLockControls(camera, renderer.domElement);

scene.add(new THREE.HemisphereLight('#fffaf0', '#b9a991', 1.1));
const sun = new THREE.DirectionalLight('#fff3e0', 2.2); sun.position.set(9, 11, -3); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun);
const fill = new THREE.DirectionalLight('#dfe9ff', 0.5); fill.position.set(-6, 8, 6); scene.add(fill);

// ---------------- registry ----------------
const itemObjs = {}; // sno -> [Object3D]
function reg(sno, obj) { obj.userData.sno = sno; (itemObjs[sno] ??= []).push(obj); return obj; }
function add(obj, parent = scene) { parent.add(obj); return obj; }
function item(sno, x, y, z, ry = 0, parent = scene) { const f = MD.ITEM_MODELS[sno]; const o = at(f(), x, y, z, ry); reg(sno, o); parent.add(o); return o; }
function itemWall(sno, side, s, depth, y = 0) { return reg(sno, onWall(MD.ITEM_MODELS[sno](), side, s, depth, y)); }

// floor-standing against a wall. s = world coordinate along that wall
function onWall(obj, side, s, depth = 0, y = 0) {
  const o = depth / 2;
  if (side === 'F') at(obj, s, y, -Z + o, 0);
  if (side === 'B') at(obj, s, y, Z - o, Math.PI);
  if (side === 'L') at(obj, -X + o, y, s, Math.PI / 2);
  if (side === 'R') at(obj, X - o, y, s, -Math.PI / 2);
  scene.add(obj); return obj;
}

// ---------------- floor, walls, ceiling ----------------
const floorTex = tex(512, 512, (c, w, h) => {
  c.fillStyle = '#5d6469'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = ['#6f777c', '#4f5559', '#7e868b', '#c4441c', '#2a6f97'][i % 37 === 0 ? 3 + (i % 2) : i % 3]; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  c.strokeStyle = '#50575b'; c.lineWidth = 3; c.strokeRect(0, 0, w, h);
}, [W / 1, D / 1]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.92 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const slab = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M('#d9d0c2', { r: 1 })); slab.rotation.x = -Math.PI / 2; slab.position.y = -0.02; slab.receiveShadow = true; scene.add(slab);
// floor zone tints (subtle) + walkway
function floorZone(x0, x1, z0, z1, color) { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M(color, { r: 1, o: 0.16 })); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.002, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); }

const wallMat = M('#f4efe7', { r: 0.92 }), dadoMat = M('#e5dccd', { r: 0.9 }), bandMat = M('#ef7d37', { r: 0.6 }), skirt = M('#3a4650', { r: 0.6 });
const walls = {};
const WALLDEF = {
  F: { len: W, pos: [0, 0, -Z], ry: 0, n: [0, 0, 1], open: [[3.6, 4.8, 0, 2.25]] },
  B: { len: W, pos: [0, 0, Z], ry: Math.PI, n: [0, 0, -1], open: [[-1.8, 0, 0, 2.3]] },
  L: { len: D, pos: [-X, 0, 0], ry: Math.PI / 2, n: [1, 0, 0], open: [] },
  R: { len: D, pos: [X, 0, 0], ry: -Math.PI / 2, n: [-1, 0, 0], open: [[-3.9, -2.6, 1.0, 2.2], [-1.6, -0.3, 1.0, 2.2], [0.7, 2.0, 1.0, 2.2]] },
};
const T = 0.16;
for (const [k, d] of Object.entries(WALLDEF)) {
  const g = new THREE.Group(); g.position.set(...d.pos); g.rotation.y = d.ry; scene.add(g);
  const L = d.len + 2 * T, ops = [...d.open].sort((a, b) => a[0] - b[0]);
  const seg = (u0, u1, y0, y1) => { if (u1 - u0 < 0.001 || y1 - y0 < 0.001) return;
    const m = B(u1 - u0, y1 - y0, T, wallMat); m.position.set((u0 + u1) / 2, y0, -T / 2); m.userData.wall = true; g.add(m);
    if (y0 < 1.2) { const dd = B(u1 - u0, Math.min(1.2, y1) - y0, 0.004, dadoMat); dd.position.set((u0 + u1) / 2, y0, 0.002); dd.castShadow = false; g.add(dd); if (y1 >= 1.2) { const bb = B(u1 - u0, 0.06, 0.006, bandMat); bb.position.set((u0 + u1) / 2, 1.2, 0.003); g.add(bb); } }
    if (y0 === 0) { const sk = B(u1 - u0, 0.1, 0.012, skirt); sk.position.set((u0 + u1) / 2, 0, 0.006); g.add(sk); }
  };
  let u = -L / 2;
  for (const [a, b, y0, y1] of ops) { seg(u, a, 0, H); seg(a, b, 0, y0); seg(a, b, y1, H); u = b; }
  seg(u, L / 2, 0, H);
  walls[k] = { g, n: new THREE.Vector3(...d.n), p: new THREE.Vector3(...d.pos), def: d };
}
// wall-mounted object in a wall group; s = world coordinate along wall
function wallAdd(side, obj, s, y, zoff = 0, sno) {
  const u = side === 'F' ? s : side === 'B' ? -s : side === 'L' ? -s : s;
  at(obj, u, y, zoff); walls[side].g.add(obj); if (sno) reg(sno, obj); return obj;
}
// openings: doors and windows
wallAdd('F', MD.door(1.2, 2.25, false, 0.35), 4.2, 0, 0);
wallAdd('B', MD.door(1.8, 2.3, true, 0.55), 0.9, 0, 0);
[[-3.25], [-0.95], [1.35]].forEach(([s]) => wallAdd('R', MD.windowUnit(1.3, 1.2), s, 1.0, -0.06));
wallAdd('F', MD.signage(), 4.2, 2.45, 0.01, 95); wallAdd('B', MD.signage(), 0.9, 2.5, 0.01);
// sockets: 15A & 5A points on all walls
for (const [side, list] of Object.entries({ F: [-1.0, 1.8, 3.0], B: [-3.65, -2.75, -1.0, 2.0, 4.6], L: [-3.3, -2.5, -0.95, 1.3, 2.0, 2.7], R: [-4.3, -0.6, 2.3, 4.65] }))
  list.forEach((s, i) => wallAdd(side, MD.socket(), s, (side === 'B' && s < 0) || (side === 'L' && s > -3) || (side === 'R' && s === -0.6) ? 1.05 : 0.35, 0.006));

const ceiling = new THREE.Group(); scene.add(ceiling);
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M('#fbfaf7', { r: 1 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; ceiling.add(ceil);
for (const x of [-3.6, 0, 3.6]) for (const z of [-2.8, 0, 2.8]) { const l = B(0.6, 0.02, 0.6, M('#ffffff', { e: '#fffaf0', ei: 1.4 })); l.position.set(x, H - 0.02, z); l.castShadow = false; ceiling.add(l); }
for (const [x, z] of [[-1.8, -1.4], [1.8, -1.4], [-1.8, 2.2], [1.8, 2.2]]) { const f = MD.ceilingFan(); f.position.set(x, H, z); ceiling.add(f); f.userData.spin = true; }
// ventilation: exhaust fans
wallAdd('B', MD.exhaustFan(), -2.9, 2.55, 0.05); wallAdd('L', MD.exhaustFan(), 0.1, 2.6, 0.05);

// ---------------- canvases: display, boards, posters ----------------
const logoImg = new Image(); logoImg.src = './tpa-logo.png';
const displayTex = tex(1280, 720, () => {}); const displayCanvas = displayTex.image;
function drawDisplay(slide) {
  const c = displayCanvas.getContext('2d'), w = 1280, h = 720;
  c.fillStyle = '#0e1419'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#ef7d37'; c.fillRect(0, 0, 18, h);
  c.fillStyle = '#f79b5e'; c.font = `600 34px ${FONT}`; c.fillText(slide.kicker, 70, 95);
  c.fillStyle = '#fcfaf6'; c.font = `800 74px ${FONT}`; wrapText(c, slide.title, 70, 190, 760, 82);
  c.fillStyle = '#a9b7c2'; c.font = `400 32px ${FONT}`; slide.lines.forEach((l, i) => { c.fillStyle = '#ef7d37'; c.fillRect(70, 395 + i * 58, 14, 14); c.fillStyle = '#c9d3da'; c.fillText(l, 102, 410 + i * 58); });
  // gear train sketch
  const gear = (x, y, r, n, col, rot) => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, rr = i % 2 ? r : r + 14; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.fill(); c.fillStyle = '#0e1419'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, 7); c.fill(); c.restore(); };
  const t = performance.now() / 1000; gear(1000, 300, 120, 24, '#2f9e5b', t * 0.3); gear(1000 - 120 - 55, 300 + 0, 40, 8, '#f79b5e', -t * 0.9);
  c.fillStyle = '#a9b7c2'; c.font = `400 26px ${FONT}`; c.fillText('24 : 8  →  3× speed', 880, 480);
  if (logoImg.complete) { c.globalAlpha = 0.9; c.filter = 'invert(1)'; c.drawImage(logoImg, w - 300, h - 95, 250, 59); c.filter = 'none'; c.globalAlpha = 1; }
  displayTex.needsUpdate = true;
}
const SLIDE = { kicker: 'ELECTRONICS & MECHATRONICS · CBSE 420', title: 'Gears & Motion: build a geared buggy', lines: ['Sense → Think → Act', 'Mesh a 24-tooth gear with an 8-tooth', 'Test it on the arena line track', '4 students per ThinkPro kit'] };

const screenTex = (kind) => tex(512, 300, (c, w, h) => {
  c.fillStyle = kind === 'ai' ? '#0f1720' : '#1e1e1e'; c.fillRect(0, 0, w, h);
  if (kind === 'ai') { c.fillStyle = '#ef7d37'; c.font = `bold 22px ${FONT}`; c.fillText('ThinkPro AI Studio', 16, 32); const msgs = [['You', 'How does a line-follower robot see the line?'], ['AI', 'Two IR sensors read light bounced off the mat; dark tape reflects less…'], ['You', 'Write the steering logic in blocks']]; msgs.forEach(([who, m], i) => { c.fillStyle = who === 'AI' ? '#1f3b2d' : '#22303c'; c.fillRect(16, 52 + i * 78, w - 32, 66); c.fillStyle = '#9fb3c2'; c.font = `bold 15px ${FONT}`; c.fillText(who, 26, 72 + i * 78); c.fillStyle = '#e6edf2'; c.font = `16px ${FONT}`; wrapText(c, m, 26, 94 + i * 78, w - 60, 19); }); }
  else { const col = ['#569cd6', '#ce9178', '#4ec9b0', '#dcdcaa', '#c586c0']; c.font = `16px monospace`; ['if (left < 300) {', '  motorL.speed(40);', '  motorR.speed(90);', '} else if (right < 300) {', '  motorL.speed(90);', '  motorR.speed(40);', '} else {', '  drive(80);', '}'].forEach((l, i) => { c.fillStyle = '#858585'; c.fillText(String(i + 1).padStart(2), 10, 30 + i * 26); c.fillStyle = col[i % 5]; c.fillText(l, 44, 30 + i * 26); }); }
});

// ---------------- FRONT: teaching wall ----------------
floorZone(-X, X, -Z, -3.05, '#2a6f97');
const display = MD.ITEM_MODELS[90](); display.userData.screen.material = new THREE.MeshBasicMaterial({ map: displayTex, toneMapped: false }); display.userData.screen.userData.keep = true; wallAdd('F', display, 0, 1.05, 0.03, 90);
// co-branding above the display: the school (lab owner) leads, ThinkPro Academy as lab partner
const logoMat = (src) => new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; }), transparent: true, roughness: 0.8 });
const schoolLogo = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.55 * 236 / 1331), logoMat('./school-logo.png'));
wallAdd('F', schoolLogo, -0.42, 2.555, 0.01);
const logoRule = B(0.012, 0.24, 0.004, M('#c9bfb1')); wallAdd('F', logoRule, 0.5, 2.435, 0.006);
const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82 * 204 / 864), logoMat('./tpa-logo.png'));
wallAdd('F', logoPlane, 0.98, 2.555, 0.01);
// school logo again above the main entrance (back wall), seen as you walk in and in the entrance view
const schoolLogoEntrance = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4 * 236 / 1331), logoMat('./school-logo.png'));
wallAdd('B', schoolLogoEntrance, 0.9, 2.85, 0.01);
wallAdd('F', MD.whiteboard(2.0, 1.1, (c, w, h) => { c.fillStyle = '#fbfbfb'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1565c0'; c.lineWidth = 5; c.fillStyle = '#1565c0'; c.font = `bold 44px ${FONT}`; c.fillText('Sense → Think → Act', 40, 70); [[60, 'IR sensor', '#2e7d32'], [310, 'Microcontroller', '#1565c0'], [590, 'Motor + gears', '#c62828']].forEach(([x, t, col]) => { c.strokeStyle = col; c.strokeRect(x, 150, 200, 110); c.fillStyle = col; c.font = `28px ${FONT}`; c.fillText(t, x + 12, 215); }); c.strokeStyle = '#333'; c.beginPath(); c.moveTo(260, 205); c.lineTo(310, 205); c.moveTo(510, 205); c.lineTo(590, 205); c.stroke(); c.fillStyle = '#333'; c.font = `26px ${FONT}`; c.fillText('Gear ratio = driven teeth ÷ driver teeth', 40, 360); c.fillText('40 ÷ 8 = 5  → slower, stronger', 40, 405); }), -2.45, 2.25, 0.01);
wallAdd('F', MD.whiteboard(2.0, 1.1, (c, w, h) => { c.fillStyle = '#fbfbfb'; c.fillRect(0, 0, w, h); c.fillStyle = '#c62828'; c.font = `bold 40px ${FONT}`; c.fillText("Today in the Skill Lab", 40, 66); c.fillStyle = '#333'; c.font = `28px ${FONT}`; ['Robotics: geared buggy + arena run', 'Agriculture: NFT nutrient check (pH 6)', 'Food: chikki, measure & roll', 'Healthcare: CPR rhythm 100–120/min', 'BFSI: budget board game', 'IT: AI helper for robot code'].forEach((t, i) => c.fillText('✓ ' + t, 40, 130 + i * 50)); }), 2.45, 2.25, 0.01);
for (let i = 0; i < 3; i++) item(87, -4.97 + i * 0.91, 0, -Z + 0.245);
item(85, -1.6, 0, -3.8, Math.PI); item(86, -1.6, 0, -4.4);
item(91, 0, 0, 0, 0, walls.L.g).position.set(-2.05, 2.35, 0.105); // router on left wall above IT
wallAdd('F', MD.ITEM_MODELS[94](), 2.95, 1.22, 0.06, 94);
wallAdd('F', MD.ITEM_MODELS[92](), 3.25, 0.85, 0.004, 92); wallAdd('F', MD.ITEM_MODELS[93](), 3.45, 0.85, 0.004, 93);

// ---------------- CENTRE: 5 worktables x 8 chairs = 40 seats ----------------
const TABLES = [{ x: -3, z: -1.81, kits: ['T01', 'T02'] }, { x: 3, z: -1.81, kits: ['T03', 'T04'] }, { x: -3, z: 1.82, kits: ['T05', 'T06'] }, { x: 0, z: 1.82, kits: ['T07', 'T08'] }, { x: 3, z: 1.82, bfsi: true }];
const seats = [];
TABLES.forEach((t, ti) => {
  item(83, t.x, 0, t.z);
  const sp = [];
  [-0.6, 0, 0.6].forEach(dz => { sp.push([t.x - 0.88, t.z + dz, Math.PI / 2]); sp.push([t.x + 0.88, t.z + dz, -Math.PI / 2]); });
  sp.push([t.x, t.z - 1.2, 0]); sp.push([t.x, t.z + 1.2, Math.PI]);
  sp.forEach(([x, z, r], i) => { item(84, x, 0, z, r); seats.push({ x, z, r, t: ti, i }); });
});
floorZone(-4.3, 4.3, -3.05, 3.3, '#2f9e5b');
// BFSI table
{ const t = TABLES[4], y = 0.74; item(80, t.x, y, t.z - 0.35, 0.05); item(80, t.x - 0.4, y, t.z + 0.78, 0).scale.set(0.5, 1, 0.5); item(79, t.x, y, t.z + 0.45, Math.PI / 2); item(82, t.x - 0.4, y, t.z + 0.42, 0.25);
  [[0.42, -0.6], [-0.42, -0.6], [0.42, -0.15], [-0.42, -0.15], [0.42, 0.3], [0.42, 0.7]].forEach(([dx, dz], i) => item(81, t.x + dx, y, t.z + dz, (i % 2 ? -1 : 1) * 0.2)); }

// ---------------- ROBOTICS: arena, build bench, kit almirah ----------------
const arena = new THREE.Group(); arena.position.set(0, 0, -1.81); scene.add(arena);
const AW = 2.2, AD = 1.5;
const arenaMat = tex(1100, 750, (c, w, h) => {
  c.fillStyle = '#f7f7f2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e3e3dc'; c.lineWidth = 2; for (let x = 0; x < w; x += 50) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.strokeStyle = '#111'; c.lineWidth = 26; c.beginPath(); c.roundRect(110, 110, w - 220, h - 220, 200); c.stroke();
  c.fillStyle = '#ef7d37'; c.fillRect(w / 2 - 6, 80, 12, 60); c.fillStyle = '#2f9e5b'; c.font = `bold 34px ${FONT}`; c.fillText('START', w / 2 + 20, 70);
  c.fillStyle = '#c4441c'; c.font = `800 46px ${FONT}`; c.textAlign = 'center'; c.fillText('ROBOT ARENA', w / 2, h / 2 + 15);
});
arena.add(at(new THREE.Mesh(new THREE.PlaneGeometry(AW, AD), new THREE.MeshStandardMaterial({ map: arenaMat, roughness: 0.8 })), 0, 0.006, 0, 0, -Math.PI / 2));
arena.children[0].receiveShadow = true;
[[0, -AD / 2, AW, 0.04], [0, AD / 2, AW, 0.04], [-AW / 2, 0, 0.04, AD], [AW / 2, 0, 0.04, AD]].forEach(([x, z, w, d]) => arena.add(at(B(w + 0.02, 0.07, d + 0.02, M('#ef7d37')), x, 0, z)));
const arenaLabel = 'Robot test arena · line-follow track';

onWall(MD.counter(2.0, 0.76, 0.65, '#cdbfa8', '#e9e2d6'), 'L', -1.85, 0.65);
wallAdd('L', MD.ITEM_MODELS[88](), -1.85, 1.5, 0.0, 88);
// robotics tool wall: real tools hanging on the pegboard's hooks (blender/toolwall.py -> models/toolwall.glb)
{ const tw = new THREE.Group(); at(tw, 1.85, 1.5, 0); walls.L.g.add(tw);
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('./models/toolwall.glb', g => { g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); tw.add(g.scene); }); }
wallAdd('L', MD.poster(0.6, 0.8, 'Robotics, IoT & Automation', 'Microcontroller · sensors · motors · gears. CBSE 420 Electronics & Mechatronics.', '#2f9e5b', '⚙'), -2.35, 2.75, 0.01);
wallAdd('L', MD.poster(0.6, 0.8, 'Build · Test · Improve', 'Every team of 4 shares one ThinkPro kit. Return every part to its tub.', '#ef7d37', '★'), -1.35, 2.75, 0.01);
const almirah = onWall(MD.almirah(1.22, 2.05, 0.5), 'L', 0.1, 0.5); reg(56, almirah);
floorZone(-X, -4.4, -3.4, 0.75, '#2f9e5b');

// ---------------- IT / ITeS: AI computer wall ----------------
onWall(MD.counter(2.1, 0.76, 0.6, '#cfd8dc', '#eceff1'), 'L', 2.05, 0.6);
[1.4, 2.05, 2.7].forEach((z, i) => { const p = MD.pc(); p.userData.screen.material = new THREE.MeshBasicMaterial({ map: screenTex(i === 1 ? 'code' : 'ai'), toneMapped: false }); onWall(p, 'L', z, 0.5, 0.76); const cam = MD.ITEM_MODELS[57](); reg(57, at(cam, -X + 0.06, 1.33, z, Math.PI / 2)); scene.add(cam); const st = MD.stool('#c98a0b'); at(st, -X + 0.95, 0, z); scene.add(st); });
{ const hs = []; for (let i = 0; i < 5; i++) hs.push(wallAdd('L', MD.ITEM_MODELS[58](), 1.15 + i * 0.22, 1.55, 0.05, 58)); }
wallAdd('L', MD.poster(0.55, 0.75, 'Life Forms · Machines & Materials · Human Services', 'Every CSL covers all three Forms of Work.', '#2a6f97', '◎'), 1.7, 2.75, 0.01);
wallAdd('L', MD.poster(0.55, 0.75, 'IT / ITeS · CBSE 402', 'Coding, AI fundamentals, ML, cybersecurity, app development.', '#c98a0b', '⌘'), 2.6, 2.75, 0.01);
itemWall(87, 'L', 3.6, 0.48); itemWall(89, 'L', -3.85, 0.4);
floorZone(-X, -4.5, 0.85, 3.2, '#c98a0b');

// ---------------- FOOD PRODUCTION: wet & heat wall (back-left) ----------------
floorZone(-X, -0.6, 3.6, Z, '#2e86ab');
onWall(MD.fridge(), 'B', -4.825, 0.62);
const CH = 0.86, cz = Z - 0.3;
onWall(MD.counter(4.29, CH, 0.6), 'B', -2.395, 0.6);                     // x -4.54 .. -0.25
add(at(MD.sinkUnit(), -4.3, CH, cz, Math.PI));
// back row: appliances (measured footprints, no overlaps)
item(46, -3.55, CH, cz, Math.PI); item(46, -2.95, CH, cz, Math.PI);
item(41, -3.55, CH + 0.12, cz, Math.PI); item(27, -2.95, CH + 0.12, cz, Math.PI * 0.8);   // snapped onto the burners after load
item(36, -2.30, CH, cz, Math.PI); item(26, -1.75, CH, cz - 0.02, Math.PI); item(26, -1.15, CH, cz - 0.02, Math.PI);
item(40, -0.62, CH, cz - 0.13, 0.3); item(31, -0.62, CH, cz + 0.15, Math.PI / 2); item(33, -0.36, CH, cz + 0.14, Math.PI);
// front strip: small tools 3-8 cm from the counter edge
wallAdd('B', MD.ITEM_MODELS[35](), -1.9, 1.475, 0.14, 35); item(42, -4.30, CH, cz - 0.245, 0); item(24, -3.90, CH, cz - 0.15, Math.PI);
item(42, -3.45, CH, cz - 0.255, 0.05); item(28, -3.02, CH, cz - 0.255, 0.04); item(28, -2.72, CH, cz - 0.25, -0.04);
item(30, -2.40, CH, cz - 0.215, 0.2); item(30, -2.25, CH, cz - 0.215, -0.15);
[-1.86, -1.66, -1.26, -1.06].forEach((x, i) => item(52, x, CH, cz - 0.265, (i % 2 ? -0.06 : 0.06)));
// wall shelves above counter
for (const y of [1.45, 1.85]) wallAdd('B', B(3.6, 0.025, 0.28, M('#cdbfa8')), -2.75, y, 0.14);
{ const sh = walls.B.g, put = (sno, s, y, ry = 0) => wallAdd('B', MD.ITEM_MODELS[sno](), s, y, 0.14, sno).rotation.y = ry;
  [-4.3, -4.17, -4.04, -3.91].forEach(s => put(29, s, 1.475)); [-3.6, -3.35].forEach(s => put(32, s, 1.475)); put(47, -3.05, 1.475);
  [-2.6, -2.4, -2.2].forEach(s => put(38, s, 1.475)); [-1.85, -1.63, -1.41].forEach(s => put(38, s, 1.875)); put(48, -1.25, 1.475); put(49, -1.0, 1.475);
  put(35, -1.62, 1.475); put(31, -1.15, 1.875, Math.PI / 2);
  put(53, -4.3, 1.875); put(53, -4.12, 1.875); put(34, -3.9, 1.875); put(34, -3.75, 1.875); put(50, -3.55, 1.875); put(47, -3.2, 1.875); put(41, -2.75, 1.875); put(48, -2.3, 1.875); put(49, -2.05, 1.875);
  wallAdd('B', MD.ITEM_MODELS[43](), -3.25, 0.875, 0.03, 43); wallAdd('B', MD.ITEM_MODELS[43](), -2.0, 0.875, 0.03, 43); // ladle rails flat on the wall, between counter and shelf
  [[51, -1.55], [51, -1.45], [54, -1.25], [54, -1.15], [55, -0.95], [44, -4.40], [44, -4.15], [45, -3.90], [45, -0.62]].forEach(([s, x]) => { const o = wallAdd('B', MD.ITEM_MODELS[s](), x, 1.25, s === 44 || s === 45 ? 0.03 : 0.05, s); if (s === 44 || s === 45) o.rotation.set(Math.PI / 2, 0, Math.PI / 2, 'ZYX'); else o.rotation.z = -Math.PI / 2; });   // sieves hang flat, bowl to the room, handle up
}
item(37, -1.28, 0, 3.97); item(37, -0.94, 0, 3.97); item(39, -4.62, 0, 3.95); item(39, -0.18, 0, 3.97);
item(25, -0.58, 0, 3.98, Math.PI); item(25, -0.58, 0.028, 3.97, Math.PI * 1.03);
wallAdd('B', MD.poster(0.55, 0.7, 'Food Production · CBSE 409', 'Wash · weigh · measure · cook · clean. Gas off after every session.', '#2e86ab', '♨'), -0.95, 2.55, 0.01);
itemWall(96, 'L', 4.45, 0.38);

// ---------------- SAFETY CORNER: entrance ----------------
floorZone(1.9, 3.6, 4.0, Z, '#c62828');
wallAdd('B', MD.ITEM_MODELS[92](), 2.15, 0.85, 0.004, 92); wallAdd('B', MD.ITEM_MODELS[93](), 2.45, 0.85, 0.004, 93);
itemWall(96, 'B', 3.1, 0.38);
wallAdd('B', MD.ITEM_MODELS[94](), 3.1, 1.5, 0.06, 94);
wallAdd('B', MD.signage('SAFETY CORNER', '#c62828', 0.9, 0.2), 2.75, 2.35, 0.01, 95);
wallAdd('B', MD.poster(0.42, 0.56, "Lab Do's & Don'ts", 'Goggles on for tools. Aprons for cooking. Report every spill. Know both exits.', '#c62828', '!'), 2.2, 2.05, 0.01, 95);
// PPE station: aprons x40, gloves x40, goggles x40
wallAdd('B', MD.ITEM_MODELS[98](), 4.3, 0, 0.025, 98);
item(97, 3.95, 0, Z - 0.2, Math.PI); item(99, 4.4, 0, Z - 0.2, Math.PI);
wallAdd('B', MD.signage('PPE', '#1565c0', 0.3, 0.14), 4.3, 1.85, 0.01, 95);

// ---------------- HEALTHCARE BAY (back-right corner) ----------------
floorZone(3.75, X, 2.45, Z, '#7465ad');
const hShelf = onWall(MD.shelf(1.0, 1.8, 0.4, 5, '#d8d3e8'), 'R', 3.0, 0.4);
{ const L = hShelf.userData.levels, sx = X - 0.2, put = (sno, z, lvl, ry = -Math.PI / 2) => item(sno, sx, L[lvl] - 0.03 + 0.02, z, ry);
  put(60, 2.66, 0); put(70, 3.08, 0); put(77, 2.7, 1); put(61, 3.0, 1); put(61, 3.3, 1, 0); put(64, 2.75, 2); put(59, 3.05, 2); put(68, 3.3, 2);
  put(75, 2.65, 3); put(67, 2.8, 3); put(76, 3.0, 3, 0); put(72, 3.25, 3, 0); put(74, 3.35, 4, 0); put(73, 2.7, 4, 0).position.y += 0.012; put(69, 3.0, 4, 0); put(63, 3.15, 4, 0); }
onWall(MD.worktable(0.9, 0.5, 0.74), 'R', 3.95, 0.5);
{ const y = 0.74, x = X - 0.25; item(60, x - 0.02, y, 3.74, -Math.PI / 2); item(71, x - 0.15, y, 4.2, -Math.PI / 2); item(71, x - 0.15, y, 4.3, -Math.PI / 2); item(65, x + 0.07, y, 4.18, -Math.PI / 2); item(63, x - 0.17, y, 3.98, -Math.PI / 2 + 0.2); }
wallAdd('B', MD.ITEM_MODELS[66](), 5.2, 0, 0.01, 66);
item(78, 5.2, 0, Z - 0.3, Math.PI);
item(62, 4.55, 0, 3.35, Math.PI / 2);
add(at(MD.stool('#7465ad'), 4.62, 0, 3.95));
wallAdd('R', MD.poster(0.55, 0.72, 'Healthcare · CBSE 413', 'First aid, vital signs, CPR: 30 compressions, 2 breaths.', '#7465ad', '✚'), 3.0, 2.75, 0.01);
wallAdd('R', MD.ITEM_MODELS[94](), 4.35, 1.55, 0.06, 94);

// ---------------- AGRICULTURE: long wall (right) ----------------
floorZone(4.4, X, -Z, 2.45, '#c4441c');
item(23, X - 0.45, 0, -2.7, -Math.PI / 2);
onWall(MD.counter(2.1, 0.76, 0.6, '#b9a58b', '#e5dccd'), 'R', -0.5, 0.6);
{ const y = 0.76, x = X - 0.3, R = -Math.PI / 2;
  item(9, x, y, -1.25, R); [-0.8, -0.65, -0.5, -0.72, -0.58].forEach((z, i) => item(4, x + (i < 3 ? 0.12 : -0.08), y, z));
  item(18, x + 0.02, y, -0.14, R); item(22, x + 0.06, y, 0.21, R); item(10, x + 0.1, y, 0.44, R); item(11, x - 0.25, y, 0.17);
  item(15, x - 0.23, y, -0.47, 0.2); item(15, x - 0.21, y, -1.47, 1.4); item(14, x - 0.2, y, -0.33, Math.PI / 2); item(2, x - 0.2, y, 0.3, 0.08); item(2, x - 0.2, y, 0.37, -0.06); }
item(1, 0, 0, 0, 0, walls.R.g).position.set(0.5, 1.35, 0.013);
// hanging tool rail under the third window
wallAdd('R', B(1.6, 0.04, 0.04, M('#5d4037')), 1.45, 0.9, 0.04);
{ const hang = (sno, s, ry = 0) => { const o = wallAdd('R', MD.ITEM_MODELS[sno](), s, 0.9, 0.07, sno); o.rotation.set(Math.PI, ry, 0); };
  hang(5, 0.75); hang(5, 0.88); [1.0, 1.1, 1.2, 1.3].forEach(s => hang(7, s)); hang(21, 1.42); hang(21, 1.52); [1.75, 1.785, 2.05, 2.085].forEach(s => hang(17, s)); }
// long tools in a floor stand
{ const z0 = -4.62, x0 = X - 0.33; add(at(G(B(0.5, 0.04, 0.26, M('#5d4037')), at(B(0.5, 0.04, 0.26, M('#5d4037')), 0, 0.6, 0)), x0, 0, z0));
  [[6, -0.22, Math.PI / 2], [6, -0.15, Math.PI / 2], [16, 0.0, 0], [16, 0.22, 0]].forEach(([s, dx, ry]) => { const o = item(s, x0 + dx, 0.02, z0 + 0.02); o.rotation.set(-0.1, ry, 0); }); }
item(13, X - 0.35, 0, 0.85); item(13, X - 0.35, 0, 1.35); item(12, X - 0.95, 0, -0.1); item(20, X - 0.95, 0, -1.25, 0.5); item(19, X - 0.95, 0, 0.35); item(19, X - 0.78, 0, 0.6, 0.8); { const gl = wallAdd('R', MD.ITEM_MODELS[8](), 1.92, 0.73, 0.012, 8); gl.rotation.x = Math.PI / 2; }   // garden gloves hang on the tool rail item(3, X - 1.05, 0, -3.45, -Math.PI / 2);
wallAdd('R', MD.poster(0.55, 0.72, 'Agriculture & Gardening · CBSE 408', 'Organic farming, hydroponics, drip irrigation. 40-plant NFT kit.', '#c4441c', '❀'), -1.95, 2.65, 0.01);
wallAdd('F', MD.poster(0.5, 0.66, 'Composite Skill Lab', '6 vocations · 40 students · Classes VI–X · ThinkPro Academy', '#ef7d37', '◆'), 5.15, 2.3, 0.01);

// ---------------- labels (zone pins) ----------------
const VIEWS = [
  { id: 'overview', label: 'Whole lab', zone: null, pos: [9.5, 10.5, 10], tgt: [0, 0.4, 0] },
  { id: 'robotics', label: 'Robotics build floor', zone: 'electronics', pos: [-0.2, 3.1, 2.6], tgt: [-1.2, 0.6, -1.8], pin: [-3, 1.5, -1.81] },
  { id: 'arena', label: 'Robot arena + Zing', zone: 'electronics', pos: [-1.7, 1.45, -0.3], tgt: [0.1, 0.3, -1.9], pin: [0, 1.35, -1.81] },
  { id: 'bench', label: 'Build bench + ThinkBox kits', zone: 'electronics', pos: [-2.6, 1.9, -0.6], tgt: [-5.2, 1.0, -1.0], pin: [-5.0, 2.3, -0.9] },
  { id: 'teach', label: 'Teaching wall', zone: 'general', pos: [0.6, 1.9, -0.4], tgt: [0, 1.4, -4.8], pin: [-1.6, 2.0, -4.1] },
  { id: 'it', label: 'AI computer wall', zone: 'it', pos: [-3.2, 1.7, 2.3], tgt: [-5.4, 1.0, 2.0], pin: [-5.0, 2.1, 2.05] },
  { id: 'food', label: 'Food production', zone: 'food', pos: [-2.6, 1.8, 1.9], tgt: [-2.8, 1.0, 4.8], pin: [-2.8, 2.35, 4.4] },
  { id: 'safety', label: 'Safety corner + PPE', zone: 'safety', pos: [2.9, 1.7, 2.2], tgt: [3.2, 1.0, 4.8], pin: [2.8, 2.5, 4.5] },
  { id: 'health', label: 'Healthcare bay', zone: 'healthcare', pos: [2.6, 1.9, 2.4], tgt: [4.9, 0.7, 3.8], pin: [4.8, 2.1, 3.6] },
  { id: 'agri', label: 'Agriculture + hydroponics', zone: 'agriculture', pos: [3.3, 1.75, -0.4], tgt: [5.2, 0.8, -1.2], pin: [5.0, 2.2, -2.0] },
  { id: 'bfsi', label: 'BFSI money game', zone: 'bfsi', pos: [3.0, 1.75, 0.1], tgt: [3.0, 0.7, 1.9], pin: [3.0, 1.45, 1.82] },
];
const pins = [];
VIEWS.filter(v => v.pin).forEach((v, i) => {
  const el = document.createElement('button'); el.className = 'pin'; el.style.setProperty('--c', ZONES[v.zone].color);
  el.innerHTML = `<b>${i + 1}</b><span>${v.label}</span>`; el.onclick = (e) => { e.stopPropagation(); goView(v.id); };
  const o = new CSS2DObject(el); o.position.set(...v.pin); scene.add(o); pins.push(o);
});

// ---------------- kids ----------------
const kids = [];
const kidRoot = new THREE.Group(); scene.add(kidRoot);
function addKid(o, x, y, z, ry, extra) { const k = makeKid(o); at(k.root, x, y, z, ry); kidRoot.add(k.root); kids.push(k); k.root.userData.activity = o.label; extra?.(k); return k; }
const seatAt = (t, i) => seats.find(s => s.t === t && s.i === i);
const sitKid = (t, i, o) => { const s = seatAt(t, i); return addKid({ pose: 'sit', act: 'build', ...o }, s.x, 0, s.z, s.r); };
let seed = 0;
// robotics tables: kids in uniform, goggles on for building
[[0, [0, 1, 2, 3]], [1, [1, 2, 4, 6]], [2, [0, 3, 5]], [3, [1, 2, 7]]].forEach(([t, list]) => list.forEach((i, n) => sitKid(t, i, { seed: seed++, goggles: n % 2 === 0, label: 'Building a geared buggy with a ThinkPro kit' })));
// BFSI game
[[4, 0], [4, 1], [4, 6]].forEach(([t, i]) => sitKid(t, i, { seed: seed++, act: 'talk', label: 'Playing the budgeting board game (BFSI)' }));
// arena
addKid({ seed: seed++, pose: 'kneel', act: 'idle', label: 'Running the buggy on the line track' }, -0.3, 0, -0.85, Math.PI - 0.2);
addKid({ seed: seed++, pose: 'watch', act: 'cheer', label: 'Watching Zing dance in the arena' }, 1.4, 0, -1.25, -Math.PI / 2 - 0.3);
// build bench
addKid({ seed: seed++, pose: 'counter', act: 'build', goggles: true, label: 'Wiring a sensor at the build bench' }, -4.6, 0, -1.9, -Math.PI / 2);
// IT: on stool with headphones
addKid({ seed: seed++, pose: 'sit', act: 'type', headphones: true, label: 'Asking the AI helper for robot code' }, -X + 0.95, 0.08, 2.05, -Math.PI / 2);
// food: cooking and rolling, aprons on
addKid({ seed: seed++, pose: 'counter', act: 'stir', apron: '#ef7d37', label: 'Cooking at the single-burner stove' }, -3.4, 0, Z - 0.85, 0);
addKid({ seed: seed++, pose: 'counter', act: 'build', apron: '#2a6f97', label: 'Rolling chikki with the polpat & latan' }, -2.15, 0, Z - 0.85, 0);
// healthcare: CPR + vitals
addKid({ seed: seed++, pose: 'kneel', act: 'cpr', label: 'Practising CPR compressions on the mannequin' }, 4.55, 0, 2.85, 0);
addKid({ seed: seed++, pose: 'sit', act: 'idle', label: 'Having blood pressure measured' }, 4.62, 0.08, 3.95, Math.PI / 2);
addKid({ seed: seed++, pose: 'counter', act: 'talk', label: 'Taking a pulse-oximeter reading' }, 4.85, 0, 4.5, -2.68);
// agriculture: watering the NFT channels
const waterer = addKid({ seed: seed++, pose: 'reach', act: 'water', label: 'Topping up the NFT hydroponics' }, X - 1.0, 0, -2.6, Math.PI / 2);
{ const can = MD.ITEM_MODELS[20](); at(can, 0, -0.24, -0.05, Math.PI / 2, 0, 0); reg(20, can); waterer.hold(can); }
// teacher
addKid({ seed: 3, pose: 'point', act: 'talk', scale: 1.17, shirt: '#ef7d37', pants: '#2a2f36', girl: true, trousers: true, tie: false, label: 'Facilitator explaining gear ratios' }, 1.05, 0, -4.15, -0.25);

// ---------------- load our kits + Zing from the Hobby Class build ----------------
const mixers = []; let car = null;
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
// realistic MPFB students + teacher (models/people/index.json: kid index -> posed GLB + right-hand point).
// Each replaces the stylised kid at the same spot; the stylised kid stays as the fallback if a model fails.
const realCache = new Map();
const realModel = (file) => { if (!realCache.has(file)) realCache.set(file, loader.loadAsync(`./models/people/${file}`)); return realCache.get(file); };
function dressReal(root) {
  root.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; o.userData.kid = true;
    const mt = o.material, n = o.name.toLowerCase(); mt.alphaHash = false;
    if (/hair|braid|bob|ponytail|short0|afro|long0|eyebrow|eyelash/.test(n)) { mt.transparent = false; mt.alphaTest = 0.5; mt.side = THREE.DoubleSide; o.castShadow = !/eyebrow|eyelash/.test(n); }
    else if (/high-poly|low-poly/.test(n)) { mt.transparent = true; mt.alphaTest = 0; mt.depthWrite = false; o.castShadow = false; o.renderOrder = 2; }
    else { mt.transparent = false; mt.alphaTest = 0; mt.opacity = 1; mt.depthWrite = true; }
    mt.needsUpdate = true; });
  return root;
}
fetch('./models/people/index.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(idx => {
  (idx?.kids ?? []).forEach((entry, i) => { const k = kids[i]; if (!entry || !k) return;
    realModel(entry.file).then(g => {
      const held = [...k.J.rHand.children];                       // e.g. the watering can
      const model = dressReal(g.scene.clone(true));
      k.root.children.forEach(c => c.visible = false);
      k.root.add(model); k.update = () => {}; k.root.userData.real = entry.file;
      if (held.length && entry.hand_r) { const grip = new THREE.Group(); grip.position.fromArray(entry.hand_r); model.add(grip); held.forEach(h => { h.position.set(0, -0.2, 0.02); grip.add(h); }); }
    }).catch(e => console.warn('realistic kid failed', entry.file, e));
  });
});
loader.load('./kits.glb', (gltf) => {
  const src = gltf.scene, kids0 = [...src.children];
  const take = (pred) => { const g = new THREE.Group(); kids0.filter(c => pred(c.name)).forEach(c => g.add(c)); return g; };
  const centre = (g) => { const b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3()); g.children.forEach(ch => { ch.position.x -= c.x; ch.position.z -= c.z; ch.position.y -= b.min.y; }); return g; };
  const shadowy = (g) => g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  // kit spreads on the tables (2 kits per table)
  TABLES.forEach(t => t.kits?.forEach((k, i) => { const g = centre(take(n => n.startsWith(k + '_'))); shadowy(g); at(g, t.x, 0.741, t.z + (i ? 0.47 : -0.47), i * Math.PI); reg(56, g); scene.add(g); }));
  // build bench: T09 build + parts that fit the bench depth
  { const g = centre(take(n => n.startsWith('T09_'))); g.children.slice().forEach(ch => { if (Math.abs(ch.position.z) > 0.24) g.remove(ch); }); shadowy(g); at(g, -X + 0.36, 0.761, -1.3, Math.PI / 2); reg(56, g); scene.add(g); }
  // ThinkBox tubs: 8 in the almirah, 2 on the bench = 10 kits
  const tubs = take(n => /^Box_\d_\d$/.test(n)); shadowy(tubs);
  const tb = new THREE.Box3().setFromObject(tubs), tc = tb.getCenter(new THREE.Vector3());
  const rows = [...new Set(tubs.children.map(c => +c.position.y.toFixed(2)))].sort((a, b) => a - b);
  tubs.children.forEach(ch => { ch.position.x -= tc.x; ch.position.z -= tc.z; ch.position.y += 0.06 - tb.min.y; });
  at(tubs, -X + 0.27, 0, 0.1); scene.add(tubs); reg(56, tubs);
  rows.forEach(ry => { const sh = B(0.46, 0.02, 1.17, almirah.userData.m); at(sh, -X + 0.25, ry - tb.min.y + 0.04, 0.1); scene.add(sh); });
  // one tub on the bench, the tenth kit stored on top of the almirah
  [[-X + 0.27, 0.764, -2.56], [-X + 0.27, 2.05 + 0.004, 0.1]].forEach(([x, y, z]) => { const t = tubs.children[0].clone(); t.position.set(x, y, z); t.rotation.copy(tubs.children[0].rotation); scene.add(t); reg(56, t); });
  // Zing dancing in the arena
  const zing = src.getObjectByName('ZING_RIG');
  if (zing) { zing.position.set(0, 0.008, -0.05); arena.add(zing); shadowy(zing); reg('zing', zing);
    const mx = new THREE.AnimationMixer(zing); gltf.animations.forEach(a => mx.clipAction(a).play()); mixers.push(mx); }
  // T10 geared buggy drives the line track
  // Line Following Robot (Grade 3 Session 8 build, fully assembled) drives the arena track
  car = new THREE.Group(); arena.add(car); reg(56, car);
  loader.load('./models/lfr.glb', (g) => { shadowy(g.scene); car.add(g.scene); }, undefined, (e) => console.warn('lfr.glb failed', e));
  const rest = centre(take(n => n.startsWith('T10_'))); rest.children.slice().forEach(ch => { if (Math.abs(ch.position.x) > 0.3 || Math.abs(ch.position.z) > 0.24) rest.remove(ch); }); shadowy(rest); at(rest, -X + 0.36, 0.761, -1.98, Math.PI / 2); scene.add(rest); reg(56, rest);
  document.body.classList.add('loaded');
  buildItemList();
}, undefined, (e) => { console.error(e); document.getElementById('loading').textContent = 'Could not load kits.glb'; });

// ---------------- high-fidelity Blender models (lab3d/models/item-<sno>.glb) ----------------
// Any item listed in models/manifest.json replaces its placeholder everywhere it appears; the rest keep the placeholder.
const HIFI_SKIP = new Set([56, 90, 95]); // 56 = real kits from kits.glb, 95 = text-specific signage
function swapIn(sno, make) {
  for (const holder of itemObjs[sno]) {
    const obj = make();
    obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    holder.children.filter(c => !c.userData.keep).forEach(c => holder.remove(c));
    holder.add(obj); holder.userData.hifi = true;
  }
}
// Astra / hand-written three.js modules in js/hifi/ (listed in js/hifi/manifest.json), each exporting HIFI = { [sno]: () => Group }
async function applyHifiModules() {
  let files = [];
  try { const r = await fetch('./js/hifi/manifest.json', { cache: 'no-store' }); if (r.ok) files = (await r.json()).files ?? []; } catch { return; }
  for (const f of files) {
    try { const mod = await import(`./hifi/${f}?v=${Date.now() / 6e4 | 0}`);
      for (const [s, make] of Object.entries(mod.HIFI ?? {})) { const sno = +s; if (HIFI_SKIP.has(sno) || !itemObjs[sno]) continue; try { swapIn(sno, make); } catch (e) { console.warn(`hi-fi ${f} item ${sno} failed`, e); } }
    } catch (e) { console.warn(`hi-fi module ${f} failed, keeping placeholders`, e); }
  }
}
applyHifiModules().then(() => setTimeout(fixups, 0));
// Post-load fit-ups that depend on the real model shapes
function fixups() {
  const B3 = (o) => new THREE.Box3().setFromObject(o);
  // 1) cookware sits centred on its own stove's burner, on the pan supports
  [[41, 0], [27, 1]].forEach(([sno, si]) => {
    const stove = itemObjs[46]?.[si], pot = itemObjs[sno]?.[0]; if (!stove || !pot) return;
    stove.updateMatrixWorld(true); pot.updateMatrixWorld(true);
    const sc = stove.getWorldPosition(new THREE.Vector3());
    let top = 0; stove.traverse(m => { if (!m.isMesh) return; const b = B3(m), c = b.getCenter(new THREE.Vector3()); if (Math.hypot(c.x - sc.x, c.z - sc.z) < 0.17) top = Math.max(top, b.max.y); });
    let body = null, vol = 0; pot.traverse(m => { if (!m.isMesh) return; const s = B3(m).getSize(new THREE.Vector3()); const v = s.x * s.y * s.z; if (v > vol) { vol = v; body = m; } });
    if (!body) return; const bc = B3(body).getCenter(new THREE.Vector3()), pb = B3(pot);
    pot.position.x += sc.x - bc.x; pot.position.z += sc.z - bc.z; pot.position.y += (top + 0.002) - pb.min.y;
  });
  // 2) warmer, mid-tone laminate on the student worktables (less glare, kits read better)
  (itemObjs[83] ?? []).forEach(t => t.traverse(m => { if (m.isMesh && m.material?.map) { const s = B3(m).getSize(new THREE.Vector3()); if (s.x > 0.9 && s.y < 0.05) { m.material = m.material.clone(); m.material.color.set('#c2a07a'); m.material.roughness = 0.6; } } }));
}
async function applyHifi() {
  let list = [];
  try { const r = await fetch('./models/manifest.json', { cache: 'no-store' }); if (r.ok) list = (await r.json()).items ?? []; } catch { return; }
  await Promise.all(list.filter(s => !HIFI_SKIP.has(s) && itemObjs[s]).map(async (sno) => {
    try {
      const g = await loader.loadAsync(`./models/item-${sno}.glb?v=${Date.now() / 6e4 | 0}`);
      swapIn(sno, () => g.scene.clone(true));
    } catch (e) { console.warn(`hi-fi model for item ${sno} failed, keeping placeholder`, e); }
  }));
  window.__hifi = list;
}
applyHifi();

// ---------------- views, walk mode, interaction ----------------
let tween = null;
function flyTo(pos, tgt, dur = 1.1) { if (walk.isLocked) walk.unlock(); setMode('orbit'); tween = { t: 0, dur, p0: camera.position.clone(), t0: controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...tgt) }; }
function goView(id) { const v = VIEWS.find(v => v.id === id); flyTo(v.pos, v.tgt); document.querySelectorAll('.views button').forEach(b => b.classList.toggle('on', b.dataset.id === id)); }

let mode = 'orbit';
function setMode(m) {
  mode = m; document.body.classList.toggle('walking', m === 'walk');
  if (m === 'walk') { controls.enabled = false; camera.position.set(0.9, 1.45, 4.2); camera.lookAt(0, 1.3, 0); walk.lock?.(); }
  else { controls.enabled = true; }
}
walk.addEventListener('unlock', () => { if (mode === 'walk') { setMode('orbit'); controls.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2)); } });
const keys = {}; addEventListener('keydown', e => { keys[e.code] = true; }); addEventListener('keyup', e => { keys[e.code] = false; });

// pick
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
const hl = new THREE.Box3Helper(new THREE.Box3(), new THREE.Color('#ef7d37')); hl.visible = false; scene.add(hl);
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || mode === 'walk') return;
  const r = renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(scene.children, true).filter(h => h.object.visible && !h.object.isLine && isShown(h.object));
  for (const h of hits) { let o = h.object; while (o && o.userData.sno == null && !o.userData.kidObj) o = o.parent; if (o) { select(o); return; } if (h.object === floor || h.object.userData.wall) break; }
  select(null);
});
function isShown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
const card = document.getElementById('card');
function select(o) {
  if (!o) { card.hidden = true; hl.visible = false; return; }
  hl.box.setFromObject(o); hl.visible = true;
  if (o.userData.kidObj) { showCard({ title: 'Student activity', body: o.userData.activity, zone: null }); return; }
  const s = o.userData.sno;
  if (s === 'zing') return showCard({ title: 'Zing humanoid robot', body: 'ThinkPro’s 17-joint humanoid (68 cm), dancing on the arena: the demo that hooks every batch.', zone: 'electronics' });
  const it = ITEM[s]; showCard({ title: it.item, body: it.spec + (it.note ? ` · ${it.note}` : ''), qty: it.qty, zone: it.zone, img: it.img, sno: s, src: it.src });
}
function showCard({ title, body, qty, zone, img, sno, src }) {
  card.hidden = false; const z = zone ? ZONES[zone] : null;
  card.innerHTML = `<button class="x" aria-label="Close">×</button>${img ? `<img src="../catalogue/${img}" alt="">` : ''}<div class="cz" style="--c:${z?.color ?? '#8fa0ad'}">${z ? z.label : 'In the lab'}</div><h3>${title}</h3><p>${body}</p>${qty ? `<div class="q"><b>×${qty}</b> ${src === 'catalogue' ? 'per batch of 40 · Equipment Catalogue' : 'per lab · proposal'}${sno ? ` · item ${sno}` : ''}</div>` : ''}`;
  card.querySelector('.x').onclick = () => select(null);
}
function focusItem(sno) {
  const o = itemObjs[sno]?.[0]; if (!o) return; const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), r = Math.max(0.25, b.getSize(new THREE.Vector3()).length());
  const dir = new THREE.Vector3(-c.x, 0, -c.z).normalize(); if (!isFinite(dir.x)) dir.set(0, 0, 1);
  const p = c.clone().add(dir.multiplyScalar(r * 1.6 + 0.6)); p.y = Math.max(c.y + r * 0.9 + 0.3, 0.6);
  flyTo(p.toArray(), c.toArray()); select(o);
}

// item list
function buildItemList() {
  const list = document.getElementById('items'), q = document.getElementById('q');
  const render = () => { const s = q.value.trim().toLowerCase();
    list.innerHTML = Object.entries(ZONES).map(([z, Z_]) => { const its = ITEMS.filter(i => i.zone === z && (!s || i.item.toLowerCase().includes(s))); if (!its.length) return '';
      return `<h4 style="--c:${Z_.color}">${Z_.label} <small>${its.length}</small></h4>` + its.map(i => `<button data-s="${i.sno}" ${itemObjs[i.sno] ? '' : 'disabled'}><span>${i.item}</span><em>×${i.qty}</em></button>`).join(''); }).join(''); };
  q.oninput = render; render();
  list.onclick = e => { const b = e.target.closest('button[data-s]'); if (b) { focusItem(+b.dataset.s); if (innerWidth < 760) document.body.classList.remove('list-open'); } };
  const placed = ITEMS.filter(i => itemObjs[i.sno]).length;
  document.getElementById('placed').textContent = `${placed} of ${ITEMS.length} items modelled in the room`;
}

// UI wiring
document.querySelector('.views').innerHTML = VIEWS.map((v, i) => `<button data-id="${v.id}" style="--c:${v.zone ? ZONES[v.zone].color : '#1b242d'}">${i ? `<b>${i}</b>` : ''}${v.label}</button>`).join('');
document.querySelector('.views').onclick = e => { const b = e.target.closest('button'); if (b) goView(b.dataset.id); };
document.getElementById('walk').onclick = () => setMode('walk');
document.getElementById('kidsT').onchange = e => { kidRoot.visible = e.target.checked; };
document.getElementById('pinsT').onchange = e => { pins.forEach(p => p.visible = e.target.checked); };
document.getElementById('listB').onclick = () => document.body.classList.toggle('list-open');
document.getElementById('dance').onchange = e => { mixers.forEach(m => m.timeScale = e.target.checked ? 1 : 0); };

// start view
camera.position.set(9.5, 10.5, 10); controls.target.set(0, 0.4, 0); controls.update();
setTimeout(() => goView('robotics'), 900);

// ---------------- loop ----------------
const clock = new THREE.Clock(); let slideT = 0;
const vTmp = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  if (tween) { tween.t += dt / tween.dur; const k = tween.t >= 1 ? 1 : 1 - Math.pow(1 - tween.t, 3); camera.position.lerpVectors(tween.p0, tween.p1, k); controls.target.lerpVectors(tween.t0, tween.t1, k); if (tween.t >= 1) tween = null; }
  if (mode === 'walk') {
    const sp = (keys.ShiftLeft ? 2.6 : 1.4) * dt, f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    walk.moveForward(f * sp); walk.moveRight(s * sp);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -X + 0.3, X - 0.3); camera.position.z = THREE.MathUtils.clamp(camera.position.z, -Z + 0.3, Z + 1.5); camera.position.y = 1.45;
  } else controls.update();
  // dollhouse: hide walls between camera and room, hide ceiling from above
  const inside = Math.abs(camera.position.x) < X && Math.abs(camera.position.z) < Z && camera.position.y < H;
  for (const w of Object.values(walls)) w.g.visible = mode === 'walk' || inside || vTmp.copy(camera.position).sub(w.p).dot(w.n) > -0.05;
  ceiling.visible = camera.position.y < H - 0.05;
  ceiling.children.forEach(c => { if (c.userData.spin) c.rotation.y += dt * 6; });
  mixers.forEach(m => m.update(dt));
  kids.forEach(k => k.update(t));
  if (car && !window.__pauseCar) { const u = (t * 0.09) % 1, a = (AW - 0.44) / 2, b = (AD - 0.44) / 2; const ang = u * Math.PI * 2; const sx = Math.sign(Math.cos(ang)) * Math.pow(Math.abs(Math.cos(ang)), 0.35) * a, sz = Math.sign(Math.sin(ang)) * Math.pow(Math.abs(Math.sin(ang)), 0.35) * b;
    const n = (ang + 0.02), nx = Math.sign(Math.cos(n)) * Math.pow(Math.abs(Math.cos(n)), 0.35) * a, nz = Math.sign(Math.sin(n)) * Math.pow(Math.abs(Math.sin(n)), 0.35) * b;
    car.position.set(sx, 0.006, sz); car.rotation.y = Math.atan2(nx - sx, nz - sz) + (car.userData.yaw ?? 0); }
  if ((slideT += dt) > 0.1) { slideT = 0; drawDisplay(SLIDE); }
  renderer.render(scene, camera); labelR.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
addEventListener('resize', () => { const w = app.clientWidth, h = app.clientHeight; renderer.setSize(w, h); labelR.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); });
window.__lab = { scene, camera, controls, itemObjs, kids, goView, focusItem, walls, setCarYaw: (y) => car && (car.userData.yaw = y) };
