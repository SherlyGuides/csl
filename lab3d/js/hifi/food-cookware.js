/*
 * Batch 7 — all five catalogue photographs inspected; geometry is in metres.
 * sno | item                      | W×H×D cm       | source (spec / typical)
 *  27 | Copper-bottom frying pan  | 44×8×24        | typical: medium Ø24 cm, 20 cm steel handle
 *  32 | Hindalium pot with lid    | 26.7×16×19.6   | spec: 3 L; typical Ø18.4 cm body
 *  41 | Aluminium pressure cooker| 44×21.6×24     | spec: 5 L; typical Ø22.8 cm body
 *  47 | Two stainless steel pots | 35.6×11.4×17.4 | spec: 1 L + 2 L; side-by-side resting pose
 *  53 | Stainless steel water jug| 16.8×17×9.5    | spec: 1 L; typical formed neck and pouring lip
 *
 * Overall envelopes include handles, lips and regulator. Capacity is computed
 * from the actual inner-wall profiles using the frustum integral, not from the
 * external bounding box. Nominal litre sizes are recorded in userData along
 * with calculated brim capacities. The lid on 32 seats below the rolled rim.
 * 47: individual envelopes are 13.8×9×13.8 and 17.4×11.4×17.4 cm.
 * All vessels stand upright. Pan and cooker handles point +x, and jug spout
 * points +x / handle -x, as in the placeholders. Presentation front is +z.
 * Each complete group is translated to bottom-centre, never resized to fit.
 * No brands, external resources or disk textures. Geometry/materials are
 * cached and reused across builder calls and repeated components.
 */
import * as THREE from 'three';
import { M } from '../kit.js';

const cache = new Map();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const steel = () => M('#d0d2d2', { m: 0.73, r: 0.28 });
const inside = () => M('#c5c9cb', { m: 0.7, r: 0.34 });
const aluminium = () => M('#c6c9ca', { m: 0.68, r: 0.38 });
const bright = () => M('#e0e1df', { m: 0.74, r: 0.22 });
const bakelite = () => M('#252625', { r: 0.53 });
const dark = () => M('#121615', { r: 0.82 });

function geometry(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function spun(key, points, mat, segments = 40) {
  return mesh(geometry(key, () => new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)), segments)), mat);
}
function cylinder(r, h, mat, x, y, z, n = 12, rt = r) {
  return mesh(geometry(`c:${r}:${h}:${n}:${rt}`, () =>
    new THREE.CylinderGeometry(rt, r, h, n)), mat, x, y, z);
}
function box(w, h, d, mat, x, y, z) {
  return mesh(geometry(`b:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)), mat, x, y, z);
}
function pipe(key, points, radius, mat, segments = 18, sides = 6) {
  return mesh(geometry(key, () => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(p => V(...p))), segments, radius, sides, false)), mat);
}
function path(points, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
  s.closePath();
  return s;
}
function oval(cx, cy, rx, ry) {
  const p = new THREE.Path();
  p.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, true, 0);
  return p;
}
function plate(key, shape, depth, bevel, mat) {
  return mesh(geometry(key, () => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, steps: 1,
      curveSegments: 4, bevelEnabled: bevel > 0, bevelSegments: 1,
      bevelSize: bevel, bevelThickness: bevel });
    g.translate(0, 0, -depth / 2);
    return g;
  }), mat);
}
// Closed wall/floor cross sections, with the inside returning to the axis.
function capacity(profile) {
  let litres = 0;
  for (let i = 1; i < profile.length; i++) {
    const [a, y0] = profile[i - 1], [b, y1] = profile[i];
    litres += Math.PI * (y1 - y0) * (a * a + a * b + b * b) / 3 * 1000;
  }
  return litres;
}
function vessel(g, key, outer, inner, mat, segments = 40) {
  g.add(spun(key, [[0, outer[0][1]], ...outer,
    ...inner.slice().reverse(), [0, inner[0][1]]], mat, segments));
  return capacity(inner);
}
function stud(g, x, y, z, direction, r = 0.0032, mat = bright()) {
  const m = cylinder(r, 0.0018, mat, x, y, z, 10);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), V(...direction).normalize());
  g.add(m);
}
function finish(g, sno) {
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g);
  const shift = V(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  for (const child of g.children) child.position.add(shift);
  g.name = `HIFI ${sno} cookware`;
  g.userData.sno = sno;
  g.updateMatrixWorld(true);
  return g;
}

function fryingPan() {
  const g = new THREE.Group();
  // Shallow flared steel pan with an exposed, substantial copper sandwich base.
  g.add(spun('pan-copper', [[0, 0], [0.096, 0], [0.101, 0.002],
    [0.105, 0.009], [0.106, 0.013], [0.101, 0.014], [0, 0.014]],
  M('#c58b60', { m: 0.72, r: 0.32 }), 48));
  vessel(g, 'pan-shell', [[0.098, 0.012], [0.105, 0.014], [0.11, 0.022],
    [0.119, 0.048], [0.12, 0.0495], [0.1195, 0.051]],
  [[0.094, 0.014], [0.101, 0.017], [0.106, 0.024], [0.1176, 0.049],
    [0.118, 0.0505]], steel(), 48);
  // Flat forged handle, with two genuine through-holes, rises gently to +x.
  // The small fork opening near the bowl is visible in the catalogue photo.
  const s = new THREE.Shape();
  s.moveTo(0.107, -0.016); s.lineTo(0.14, -0.010);
  s.quadraticCurveTo(0.183, -0.013, 0.218, -0.018);
  s.lineTo(0.302, -0.016); s.quadraticCurveTo(0.3185, -0.015, 0.3185, 0);
  s.quadraticCurveTo(0.3185, 0.015, 0.302, 0.016); s.lineTo(0.218, 0.018);
  s.quadraticCurveTo(0.183, 0.013, 0.14, 0.010); s.lineTo(0.107, 0.016); s.closePath();
  s.holes.push(oval(0.298, 0, 0.011, 0.006));
  s.holes.push(path([[0.121, -0.009], [0.143, -0.004], [0.148, 0],
    [0.143, 0.004], [0.121, 0.009]], true));
  const handle = plate('pan-handle', s, 0.005, 0.0015, bright());
  handle.rotation.x = -Math.PI / 2;
  // Deform once in handle-local coordinates, preserving holes and thickness.
  if (!handle.geometry.userData.raised) {
    const p = handle.geometry.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(i, p.getZ(i) + 0.037 + (p.getX(i) - 0.107) * 0.185);
    handle.geometry.computeVertexNormals(); handle.geometry.userData.raised = true;
  }
  g.add(handle);
  // Two round rivet heads inside the bowl and a curved outside attachment pad.
  for (const z of [-0.012, 0.012]) stud(g, 0.1117, 0.038, z, [-1, 0.3, 0], 0.004);
  const pad = box(0.003, 0.018, 0.034, steel(), 0.114, 0.036, 0);
  pad.rotation.z = 0.32; g.add(pad);
  g.userData.bodyDiameterM = 0.24;
  return finish(g, 27);
}

function hindaliumPot() {
  const g = new THREE.Group();
  const litres = vessel(g, 'hindalium-shell', [[0.074, 0], [0.085, 0.003],
    [0.091, 0.012], [0.092, 0.025], [0.092, 0.118], [0.095, 0.123],
    [0.096, 0.125]], [[0.075, 0.003], [0.084, 0.006], [0.089, 0.015],
    [0.09, 0.025], [0.09, 0.118], [0.093, 0.123]], aluminium());
  // Shallow dish lid: broad turned lip and recessed centre, no plastic knob.
  g.add(spun('hindalium-lid', [[0, 0.13], [0.086, 0.13], [0.092, 0.131],
    [0.098, 0.134], [0.098, 0.1355], [0.092, 0.136], [0.087, 0.133],
    [0, 0.133]], aluminium()));
  for (const sign of [-1, 1]) {
    g.add(pipe('hindalium-side-' + sign, [[sign * 0.092, 0.104, -0.027],
      [sign * 0.11, 0.123, -0.03], [sign * 0.126, 0.126, -0.023],
      [sign * 0.126, 0.126, 0.023], [sign * 0.11, 0.123, 0.03],
      [sign * 0.092, 0.104, 0.027]], 0.0038, bright(), 16));
    for (const z of [-0.027, 0.027]) {
      g.add(box(0.002, 0.023, 0.011, aluminium(), sign * 0.089, 0.102, z));
      stud(g, sign * 0.091, 0.101, z, [sign, 0, 0], 0.0034);
    }
  }
  g.add(pipe('hindalium-lid-loop', [[-0.032, 0.135, 0], [-0.023, 0.137, 0],
    [-0.02, 0.156, 0], [-0.013, 0.162, 0], [0.013, 0.162, 0],
    [0.02, 0.156, 0], [0.023, 0.137, 0], [0.032, 0.135, 0]], 0.0034, bright(), 20));
  for (const x of [-0.03, 0.03]) {
    g.add(box(0.018, 0.0015, 0.014, bright(), x, 0.134, 0));
    stud(g, x, 0.1358, 0, [0, 1, 0], 0.0027);
  }
  // Lid and handle assembly seats 7 mm lower on this three-litre body.
  for (const child of g.children.slice(1)) child.position.y -= 0.007;
  g.userData.nominalLitres = 3; g.userData.brimLitres = litres;
  return finish(g, 32);
}

function pressureCooker() {
  const g = new THREE.Group();
  const litres = vessel(g, 'cooker-shell', [[0.09, 0], [0.104, 0.003],
    [0.112, 0.011], [0.114, 0.024], [0.114, 0.129], [0.12, 0.133],
    [0.12, 0.138]], [[0.092, 0.005], [0.103, 0.009], [0.109, 0.017],
    [0.111, 0.025], [0.111, 0.132], [0.116, 0.136]], aluminium(), 36);
  // Dark gasket seam and outer-lid skirt; silhouette follows the photo's low dome.
  g.add(spun('cooker-gasket', [[0.114, 0.154], [0.1195, 0.154],
    [0.1195, 0.157], [0.114, 0.157]], dark(), 36));
  g.add(spun('cooker-lid', [[0, 0.172], [0.092, 0.172], [0.106, 0.168],
    [0.111, 0.162], [0.114, 0.156], [0.12, 0.157], [0.12, 0.16],
    [0.115, 0.163], [0.111, 0.177], [0.103, 0.183], [0.078, 0.187],
    [0, 0.188]], aluminium(), 36));
  // Two separate bakelite grips, with a readable locking gap between them.
  const lower = path([[0.111, 0.13], [0.143, 0.13], [0.169, 0.148],
    [0.203, 0.154], [0.274, 0.156], [0.277, 0.163], [0.274, 0.174],
    [0.204, 0.174], [0.164, 0.167], [0.14, 0.153], [0.111, 0.151]]);
  g.add(plate('cooker-lower-handle', lower, 0.031, 0.002, bakelite()));
  const upper = path([[0.111, 0.163], [0.145, 0.157], [0.166, 0.171],
    [0.203, 0.18], [0.274, 0.179], [0.277, 0.184], [0.275, 0.196],
    [0.261, 0.199], [0.196, 0.198], [0.154, 0.191], [0.111, 0.183]]);
  g.add(plate('cooker-upper-handle', upper, 0.033, 0.002, bakelite()));
  g.add(box(0.011, 0.029, 0.039, bright(), 0.119, 0.15, 0));
  stud(g, 0.133, 0.145, 0.0177, [0, 0, 1], 0.0034);
  // Opposite helper handle has an actual opening, not a solid black block.
  const helper = path([[-0.111, -0.027], [-0.147, -0.028], [-0.159, -0.021],
    [-0.159, 0.021], [-0.147, 0.028], [-0.111, 0.027]]);
  helper.holes.push(path([[-0.119, -0.017], [-0.147, -0.017],
    [-0.149, 0.017], [-0.119, 0.017]], true));
  const grip = plate('cooker-helper-handle', helper, 0.016, 0.002, bakelite());
  grip.rotation.x = Math.PI / 2; grip.position.y = 0.135; g.add(grip);
  // Visible short locking tabs just under the skirt.
  for (const a of [0.45, 1.65, 2.8, 4.15, 5.3]) {
    const tab = box(0.022, 0.008, 0.004, aluminium(),
      Math.sin(a) * 0.116, 0.15, Math.cos(a) * 0.116);
    tab.rotation.y = a; g.add(tab);
  }
  // Regulator: hexagonal nut, brass-toned stem, steel weight and black cap.
  g.add(cylinder(0.006, 0.005, bright(), 0, 0.1905, 0, 6));
  g.add(cylinder(0.0028, 0.009, bright(), 0, 0.197, 0));
  g.add(spun('cooker-regulator', [[0, 0.199], [0.011, 0.199],
    [0.012, 0.201], [0.011, 0.217], [0.009, 0.22], [0, 0.22]], bright(), 16));
  g.add(cylinder(0.013, 0.009, bakelite(), 0, 0.2195, 0, 16, 0.012));
  g.add(cylinder(0.005, 0.006, bakelite(), 0, 0.227, 0, 12));
  g.add(cylinder(0.008, 0.003, bakelite(), 0, 0.2315, 0, 16));
  stud(g, 0, 0.208, 0.0114, [0, 0, 1], 0.0014, dark());
  // Offset safety plug, with dark fusible centre.
  g.add(cylinder(0.0075, 0.003, bright(), -0.041, 0.189, 0.026, 6));
  g.add(cylinder(0.0027, 0.0007, dark(), -0.041, 0.1909, 0.026, 10));
  // Complete lid/locking assembly seats on the 138 mm high five-litre body.
  for (const child of g.children.slice(1)) child.position.y -= 0.017;
  g.userData.nominalLitres = 5; g.userData.brimLitres = litres;
  return finish(g, 41);
}

function potContainers() {
  const g = new THREE.Group();
  const sizes = [
    { r: 0.063, h: 0.09, lip: 0.069, x: -0.1, litres: 1 },
    { r: 0.079, h: 0.114, lip: 0.087, x: 0.1, litres: 2 },
  ];
  g.userData.containers = [];
  for (const { r, h, lip, x, litres } of sizes) {
    const pot = new THREE.Group(), ri = r - 0.0015;
    const volume = vessel(pot, `storage-pot-${litres}`,
      [[r - 0.012, 0], [r - 0.005, 0.002], [r - 0.001, 0.007],
        [r, 0.014], [r, h - 0.008], [r + 0.001, h - 0.003],
        [lip, h - 0.0015], [lip, h], [lip - 0.0015, h]],
      [[ri - 0.009, 0.002], [ri - 0.003, 0.005], [ri, 0.013],
        [ri, h - 0.008], [ri + 0.001, h - 0.003], [lip - 0.002, h - 0.001]],
      steel(), 40);
    pot.position.x = x; g.add(pot);
    g.userData.containers.push({ nominalLitres: litres, brimLitres: volume });
  }
  return finish(g, 47);
}

function waterJug() {
  const g = new THREE.Group();
  const inner = [[0.035, 0.002], [0.0425, 0.005], [0.046, 0.012],
    [0.046, 0.109], [0.039, 0.13], [0.039, 0.166], [0.04, 0.168]];
  const litres = vessel(g, 'jug-shell', [[0.036, 0], [0.0435, 0.003],
    [0.0475, 0.011], [0.0475, 0.111], [0.041, 0.132], [0.041, 0.167],
    [0.042, 0.169], [0.041, 0.17]], inner, steel(), 48);
  const shell = g.children[0];
  // Pull both walls of the upper +x sector into the same open pouring spout.
  // Unlike the placeholder cone, this lip connects continuously to the vessel.
  if (!shell.geometry.userData.spouted) {
    const p = shell.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const a = Math.max(0, (x / Math.max(Math.hypot(x, z), 1e-8) - 0.78) / 0.22);
      const t = Math.max(0, Math.min(1, (y - 0.133) / 0.034));
      p.setX(i, x + 0.022 * a * t * t);
    }
    shell.geometry.computeVertexNormals(); shell.geometry.userData.spouted = true;
  }
  // Broad swept hollow-looking steel strap, bowed away from the body.
  // Tube is oval in z to read as the pressed handle from the catalogue.
  const handle = pipe('jug-handle', [[-0.041, 0.151, 0], [-0.05, 0.161, 0],
    [-0.078, 0.162, 0], [-0.097, 0.145, 0], [-0.098, 0.119, 0],
    [-0.086, 0.086, 0], [-0.065, 0.056, 0], [-0.0475, 0.043, 0]],
  0.0048, bright(), 24, 8);
  handle.scale.z = 1.35; g.add(handle);
  for (const [x, y] of [[-0.0415, 0.149], [-0.048, 0.045]]) {
    const mount = cylinder(0.006, 0.0012, steel(), x, y, 0, 12);
    mount.scale.z = 0.68; mount.rotation.z = Math.PI / 2; g.add(mount);
  }
  g.userData.nominalLitres = 1;
  // Axisymmetric capacity excludes the extra few ml in the formed lip.
  g.userData.brimLitres = litres;
  return finish(g, 53);
}

export const HIFI = {
  27: () => fryingPan(),
  32: () => hindaliumPot(),
  41: () => pressureCooker(),
  47: () => potContainers(),
  53: () => waterJug(),
};
