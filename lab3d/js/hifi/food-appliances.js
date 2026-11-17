/*
 * Batch 6 — catalogue photographs and specifications inspected individually.
 * sno | item                         | W×H×D cm     | source (spec / typical)
 *  26 | Electric/gas oven (OTG)      | 48×30×36     | typical 25 L countertop OTG; spec: OTG-equivalent
 *  36 | Mixer + second jar          | 42.5×41×18   | typical 800 W base and two jars; spec: ISI, 800 W, two containers
 *  46 | Single-burner stove + hose  | 54.5×12×34   | typical 30×12×30 cm stove; spec: pipe & clip
 *
 * Overall envelopes include accessories; figures are rounded to 0.5 cm.
 * Mixer motor housing is 22×22×18 cm; the second jar stands alongside it.
 * Large jar: ~1.2 L brim capacity, 1 L working capacity; small jar: ~0.5 L.
 * Oven cavity: 36×23×30 cm = 24.84 L before fittings.
 * Stove hose rests coiled to the left, retaining the placeholder's hose side.
 * All appliances stand on their feet, controls face +z. Origins are translated
 * to bottom-centre, never rescaled. Cached geometry/materials serve duplicates.
 * Only canvas-drawn markings; no logos, file loads or external assets.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, tex, FONT } from '../kit.js';

const geometries = new Map(), prints = new Map();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const steel = () => M('#c6cbce', { m: 0.72, r: 0.3 });
const dark = () => M('#202223', { r: 0.55 });
const rubber = () => M('#191b1c', { r: 0.9 });
const white = () => M('#f2f2ed', { r: 0.35 });
function geo(key, build) {
  if (!geometries.has(key)) geometries.set(key, build());
  return geometries.get(key);
}
function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
}
function box(w, h, d, mat, x, y, z, r = 0) {
  return mesh(geo(`box:${w}:${h}:${d}:${r}`, () => r
    ? new RoundedBoxGeometry(w, h, d, 1, r)
    : new THREE.BoxGeometry(w, h, d)), mat, x, y, z);
}
function cyl(rt, rb, h, mat, x, y, z, n = 24) {
  return mesh(geo(`cyl:${rt}:${rb}:${h}:${n}`, () =>
    new THREE.CylinderGeometry(rt, rb, h, n)), mat, x, y, z);
}
function lathe(key, points, mat, n = 40) {
  return mesh(geo(key, () => new THREE.LatheGeometry(
    points.map(p => new THREE.Vector2(...p)), n)), mat);
}
function rod(a, b, r, mat, n = 8) {
  const start = V(...a), end = V(...b), delta = end.clone().sub(start);
  const m = cyl(r, r, delta.length(), mat, 0, 0, 0, n);
  m.position.copy(start).add(end).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize()); return m;
}
function tube(key, points, r, mat, segments = 20, radial = 6) {
  return mesh(geo(key, () => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(p => V(...p))), segments, r, radial, false)), mat);
}
function ring(r, t, mat, x, y, z, n = 40) {
  const m = mesh(geo(`tor:${r}:${t}:${n}`, () => new THREE.TorusGeometry(r, t, 5, n)), mat, x, y, z);
  m.rotation.x = -Math.PI / 2; return m;
}
function rect(w, h, r) {
  const s = new THREE.Shape(), x = w / 2, y = h / 2;
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r); s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y); s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y); s.closePath(); return s;
}
function extrusion(key, shape, depth, mat, bevel = 0.0007) {
  return mesh(geo(key, () => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, curveSegments: 3,
      bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1 });
    g.translate(0, 0, -depth / 2); return g;
  }), mat);
}
function frame(key, w, h, iw, ih, d, mat, x, y, z, r = 0.006) {
  const s = rect(w, h, r); s.holes.push(rect(iw, ih, r * 0.7));
  const m = extrusion(key, s, d, mat); m.position.set(x, y, z); return m;
}
function print(key, w, h, draw, transparent = true) {
  if (!prints.has(key)) prints.set(key, new THREE.MeshStandardMaterial({
    map: tex(w, h, draw), roughness: 0.6, transparent, depthWrite: !transparent,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  return prints.get(key);
}
function panel(w, h, mat, x, y, z) {
  return mesh(geo(`plane:${w}:${h}`, () => new THREE.PlaneGeometry(w, h)), mat, x, y, z);
}
function frontCylinder(r, h, mat, x, y, z, n = 32) {
  const m = cyl(r, r, h, mat, x, y, z, n); m.rotation.x = Math.PI / 2; return m;
}
function screw(g, x, y, z) {
  g.add(frontCylinder(0.0024, 0.001, steel(), x, y, z, 10));
  g.add(box(0.003, 0.0005, 0.0002, dark(), x, y, z + 0.0006));
}
function finish(g, sno) {
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g);
  const shift = V(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  for (const c of g.children) c.position.add(shift);
  g.name = `HIFI ${sno}`; g.userData.sno = sno;
  g.updateMatrixWorld(true); return g;
}

function oven() {
  const g = new THREE.Group(), metal = steel();
  const lining = M('#a6aaa7', { m: 0.65, r: 0.38 });
  for (const x of [-0.207, 0.207]) for (const z of [-0.14, 0.12])
    g.add(box(0.027, 0.022, 0.033, rubber(), x, 0.011, z, 0.005));
  // Folded outer shell: open at the front, with a genuinely hollow oven cavity.
  g.add(box(0.48, 0.011, 0.33, metal, 0, 0.2945, -0.015, 0.005));
  g.add(box(0.48, 0.011, 0.33, metal, 0, 0.0275, -0.015, 0.004));
  for (const x of [-0.2345, 0.2345])
    g.add(box(0.011, 0.268, 0.33, metal, x, 0.161, -0.015, 0.005));
  g.add(box(0.46, 0.256, 0.009, metal, 0, 0.16, -0.1755, 0.002));
  // Internal clear envelope x[-.222,.138], y[.044,.274], z[-.167,.133].
  g.add(box(0.364, 0.003, 0.30, lining, -0.042, 0.0425, -0.017));
  g.add(box(0.364, 0.003, 0.30, lining, -0.042, 0.2755, -0.017));
  for (const x of [-0.2235, 0.1395])
    g.add(box(0.003, 0.23, 0.30, lining, x, 0.159, -0.017));
  g.add(box(0.36, 0.23, 0.003, lining, -0.042, 0.159, -0.1685));
  g.add(frame('oven-rear-stamp', 0.322, 0.183, 0.311, 0.172, 0.001,
    metal, -0.042, 0.159, -0.166, 0.012));
  // Rack runners pressed into both side walls, plus the lower baking tray.
  for (const x of [-0.219, 0.135]) for (const y of [0.074, 0.117, 0.16, 0.203])
    g.add(box(0.005, 0.004, 0.257, metal, x, y, -0.018, 0.001));
  g.add(box(0.335, 0.002, 0.264, dark(), -0.042, 0.075, -0.015));
  for (const x of [-0.209, 0.125]) g.add(box(0.002, 0.013, 0.264, lining, x, 0.081, -0.015));
  for (const z of [-0.147, 0.117]) g.add(box(0.336, 0.013, 0.002, lining, -0.042, 0.081, z));
  for (const z of [-0.14, 0.116])
    g.add(rod([-0.213, 0.163, z], [0.129, 0.163, z], 0.0017, metal));
  for (let i = 0; i < 16; i++) {
    const x = -0.209 + i * 0.022;
    g.add(rod([x, 0.163, -0.14], [x, 0.163, 0.116], 0.0011, metal, 6));
  }
  for (const y of [0.056, 0.26]) g.add(tube(`oven-element-${y}`, [
    [-0.196, y, -0.145], [-0.196, y, 0.095], [-0.18, y, 0.11],
    [0.097, y, 0.11], [0.111, y, 0.095], [0.111, y, -0.145]],
  0.0026, M('#3f4242', { m: 0.55, r: 0.48 }), 18));
  // Front surround, door gasket, real glazed opening and brushed bottom rail.
  g.add(frame('oven-front-surround', 0.474, 0.264, 0.385, 0.248, 0.004,
    metal, -0.001, 0.161, 0.148, 0.009));
  g.add(box(0.087, 0.254, 0.009, metal, 0.19, 0.161, 0.147, 0.005));
  g.add(frame('oven-gasket', 0.385, 0.247, 0.37, 0.232, 0.006,
    rubber(), -0.041, 0.16, 0.151, 0.008));
  g.add(frame('oven-door', 0.375, 0.237, 0.337, 0.181, 0.006,
    dark(), -0.041, 0.16, 0.155, 0.006));
  const glass = panel(0.338, 0.183, M('#bacbcc', { r: 0.12, o: 0.22, side: THREE.DoubleSide }),
    -0.041, 0.16, 0.1585);
  glass.castShadow = false; g.add(glass);
  g.add(box(0.369, 0.025, 0.002, metal, -0.041, 0.055, 0.159, 0.001));
  for (const x of [-0.215, 0.133]) g.add(box(0.019, 0.021, 0.023, dark(), x, 0.267, 0.166, 0.005));
  g.add(rod([-0.208, 0.267, 0.171], [0.126, 0.267, 0.171], 0.009, metal, 20));
  for (const x of [-0.182, 0.1]) g.add(box(0.028, 0.006, 0.013, dark(), x, 0.038, 0.15, 0.002));
  // The catalogue has TWO dials, not the placeholder's three.
  const dialPrint = print('oven-dial-marks', 256, 256, (c, w, h) => {
    c.translate(w / 2, h / 2); c.strokeStyle = '#454747'; c.lineWidth = 3;
    for (let i = 0; i < 13; i++) { c.save(); c.rotate((-0.8 + i * 0.4));
      c.beginPath(); c.moveTo(0, -94); c.lineTo(0, -104); c.stroke(); c.restore(); }
  });
  for (const y of [0.113, 0.208]) {
    g.add(panel(0.073, 0.073, dialPrint, 0.19, y, 0.152));
    g.add(frontCylinder(0.026, 0.008, dark(), 0.19, y, 0.156));
    g.add(frontCylinder(0.0225, 0.008, metal, 0.19, y, 0.162));
    g.add(box(0.0017, 0.011, 0.001, dark(), 0.19, y + 0.013, 0.1665, 0.0004));
  }
  const labels = print('oven-labels', 256, 512, c => {
    c.fillStyle = '#434747'; c.textAlign = 'center'; c.font = `18px ${FONT}`;
    c.fillText('°C', 128, 100); c.fillText('MIN', 128, 360);
  });
  g.add(panel(0.065, 0.18, labels, 0.19, 0.169, 0.153));
  // Dark vent slots and lower lips on the visible side, arranged like the photo.
  for (const y0 of [0.065, 0.217]) for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
    const z = -0.132 + col * 0.026, y = y0 + row * 0.011;
    g.add(box(0.0008, 0.004, 0.018, dark(), 0.2401, y, z));
    g.add(box(0.0012, 0.001, 0.018, metal, 0.2404, y - 0.002, z));
  }
  return finish(g, 26);
}

function jar(key, large) {
  const g = new THREE.Group(), r = large ? 0.064 : 0.058;
  const h = large ? 0.14 : 0.087, rb = large ? 0.045 : 0.042;
  // Separate foot/coupler, tapered double wall, rolled mouth and transparent dome.
  g.add(lathe(`${key}-coupler`, [[0,0],[rb,0],[rb+0.003,0.005],
    [rb+0.006,0.026],[rb+0.005,0.031],[0,0.031]], dark(), 32));
  const shell = lathe(`${key}-shell`, [[0,0.03],[rb-0.005,0.03],[rb+0.002,0.034],
    [rb+0.006,0.045],[r,0.03+h-0.006],[r+0.001,0.03+h],
    [r-0.001,0.032+h],[r-0.003,0.03+h-0.005],
    [rb+0.003,0.046],[rb-0.005,0.034],[0,0.034]], steel(), 40);
  g.add(shell);
  // The long stamped channels are shallow steel ribs, following the taper.
  for (const angle of [-0.68, 0.68, Math.PI]) {
    const points = [0.2, 0.3, 0.75, 0.84].map(t => {
      const rr = rb + 0.006 + (r - rb - 0.006) * t;
      return [Math.sin(angle) * rr, 0.03 + h * t, Math.cos(angle) * rr];
    });
    g.add(tube(`${key}-rib-${angle}`, points, 0.0017, M('#a6adae', { m: 0.7, r: 0.32 }), 8, 5));
  }
  g.add(ring(r, 0.0016, steel(), 0, 0.031+h, 0));
  g.add(ring(r-0.002, 0.0017, rubber(), 0, 0.033+h, 0));
  const clear = M('#dbe4e6', { r: 0.2, o: 0.38, side: THREE.DoubleSide });
  const dy = 0.034 + h, dome = large ? 0.029 : 0.022;
  const lid = lathe(`${key}-lid`, [[r+0.004,dy],[r+0.005,dy+0.002],
    [r-0.001,dy+0.004],[r-0.008,dy+0.013],[0.023,dy+dome],
    [0.022,dy+dome+0.009],[0.018,dy+dome+0.011],[0,dy+dome+0.011]], clear, 40);
  lid.castShadow = false; g.add(lid);
  g.add(ring(r+0.004, 0.0012, steel(), 0, dy+0.002, 0));
  g.add(ring(0.022, 0.0009, steel(), 0, dy+dome+0.008, 0, 24));
  // Broad, open-backed black handle with an angled free end, as photographed.
  const s = new THREE.Shape(), top = 0.022+h;
  s.moveTo(r-0.002, top); s.lineTo(r+0.024, top-0.004);
  s.quadraticCurveTo(r+0.045, top-0.008, r+0.047, top-0.032);
  s.lineTo(r+0.052, 0.052); s.lineTo(r+0.043, 0.057);
  s.quadraticCurveTo(r+0.032, 0.06, r+0.032, 0.075);
  s.lineTo(r+0.027, top-0.036); s.quadraticCurveTo(r+0.027, top-0.021, r+0.017, top-0.02);
  s.lineTo(r-0.002, top-0.018); s.closePath();
  g.add(extrusion(`${key}-handle`, s, 0.019, dark(), 0.002));
  return g;
}

function mixer() {
  const g = new THREE.Group(), body = new THREE.Group();
  // Elliptical, smoothly shouldered motor housing (not a rectangular block).
  const base = lathe('mixer-lower-skirt', [[0,0.009],[0.076,0.009],[0.098,0.016],
    [0.109,0.032],[0.11,0.053],[0.108,0.059],[0,0.059]], M('#727777', { r: 0.4 }), 48);
  base.scale.z = 0.81818; body.add(base);
  const shell = lathe('mixer-motor-shell', [[0,0.052],[0.11,0.052],[0.109,0.071],
    [0.099,0.12],[0.082,0.17],[0.068,0.21],[0.061,0.219],[0,0.219]], white(), 48);
  shell.scale.z = 0.81818; body.add(shell);
  const seam = lathe('mixer-shoulder-seam', [[0.082,0.169],[0.0818,0.1705]], M('#d7d9d4', { r: 0.48 }), 48);
  seam.scale.z = 0.81818; body.add(seam);
  for (const x of [-0.076, 0.076]) for (const z of [-0.054, 0.054])
    body.add(cyl(0.01, 0.014, 0.012, rubber(), x, 0.006, z, 16));
  body.add(cyl(0.05, 0.055, 0.009, dark(), 0, 0.222, 0, 32));
  body.add(frontCylinder(0.028, 0.008, M('#d8dcd6', { r: 0.4 }), 0, 0.098, 0.08));
  body.add(frontCylinder(0.024, 0.009, dark(), 0, 0.098, 0.086));
  body.add(frontCylinder(0.0218, 0.006, M('#777c7c', { r: 0.38 }), 0, 0.098, 0.092));
  body.add(box(0.006, 0.035, 0.006, M('#949a99', { r: 0.4 }), 0, 0.098, 0.096, 0.002));
  body.add(box(0.0015, 0.007, 0.0008, white(), 0, 0.112, 0.0995));
  const marks = print('mixer-speeds', 384, 192, (c, w) => {
    c.fillStyle = '#666c69'; c.textAlign = 'center'; c.font = `22px ${FONT}`;
    c.fillText('0', w/2, 35); c.fillText('1', 273, 67); c.fillText('2', 309, 118);
    c.fillText('3', 287, 175); c.fillText('P', 85, 70);
  });
  body.add(panel(0.075, 0.04, marks, 0, 0.11, 0.083));
  // Small rear cooling slots, repeated geometry and a discreet neutral rating.
  for (let i = 0; i < 8; i++) body.add(box(0.004, 0.014, 0.001,
    dark(), -0.025 + i*0.007, 0.038, -0.085));
  const rating = print('mixer-rating', 256, 80, (c, w) => {
    c.fillStyle = '#606865'; c.textAlign = 'center'; c.font = `22px ${FONT}`;
    c.fillText('ISI  ·  800 W', w/2, 50);
  });
  body.add(panel(0.056, 0.016, rating, 0, 0.035, 0.087));
  const mainJar = jar('mix-large', true); mainJar.position.y = 0.197; body.add(mainJar);
  body.position.x = -0.112; g.add(body);
  const spare = jar('mix-small', false); spare.position.set(0.095, 0, 0.008); g.add(spare);
  return finish(g, 36);
}

function stove() {
  const g = new THREE.Group(), metal = steel(), cast = M('#242625', { r: 0.82, m: 0.18 });
  for (const x of [-0.122, 0.122]) for (const z of [-0.121, 0.121])
    g.add(cyl(0.012, 0.01, 0.018, rubber(), x, 0.009, z, 14));
  // Tapered pressed steel skirt and top with a real circular drip-well opening.
  const shellGeo = geo('stove-skirt', () => {
    const a = new RoundedBoxGeometry(0.3, 0.069, 0.3, 1, 0.004);
    const p = a.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i)+0.0345)/0.069;
      p.setX(i, p.getX(i)*(1-0.035*t));
      p.setZ(i, p.getZ(i)*(1-0.035*t));
    }
    a.computeVertexNormals(); return a;
  });
  g.add(mesh(shellGeo, metal, 0, 0.0505, 0));
  // The shallow well sits above the folded skirt; no hidden solid covers its mouth.
  const topShape = rect(0.29, 0.29, 0.009), hole = new THREE.Path();
  hole.absarc(0, 0, 0.1, 0, Math.PI*2, true); topShape.holes.push(hole);
  const top = extrusion('stove-top', topShape, 0.002, metal, 0.0005);
  top.rotation.x = -Math.PI/2; top.position.set(0, 0.088, -0.003); g.add(top);
  const well = lathe('stove-drip-well', [[0.04,0.0855],[0.064,0.0855],
    [0.079,0.087],[0.09,0.089],[0.1,0.089],[0.101,0.091],
    [0.098,0.092],[0.088,0.091],[0.077,0.089],[0.064,0.0875],[0.04,0.0875]], metal, 48);
  well.position.z = -0.003; g.add(well);
  const burner = lathe('stove-burner', [[0.02,0.087],[0.044,0.087],
    [0.044,0.094],[0.039,0.102],[0.027,0.105],[0.02,0.102],[0.02,0.087]],
  M('#cba449', { m: 0.72, r: 0.36 }), 48);
  burner.position.z = -0.003; g.add(burner);
  g.add(ring(0.042, 0.002, cast, 0, 0.089, -0.003));
  // Actual dark ports on the two sloping brass faces; shared small disk geometry.
  const portGeo = geo('burner-port', () => new THREE.CircleGeometry(0.0008, 6));
  for (let row = 0; row < 2; row++) for (let i = 0; i < 48; i++) {
    const a = (i+row*0.5)*Math.PI/24, rr = row ? 0.0398 : 0.042;
    const port = mesh(portGeo, rubber(), Math.sin(a)*rr, row ? 0.101 : 0.097, -0.003+Math.cos(a)*rr);
    port.quaternion.setFromUnitVectors(V(0,0,1), V(Math.sin(a),0.6,Math.cos(a)).normalize());
    port.castShadow = false; g.add(port);
  }
  // Square cast pan support and four inward-pointing, vertical tapered fins.
  const support = frame('stove-pan-support', 0.238, 0.238, 0.205, 0.205,
    0.006, cast, 0, 0.098, -0.003, 0.013);
  support.rotation.x = -Math.PI/2; g.add(support);
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Shape();
    s.moveTo(0.052,0.101); s.lineTo(0.117,0.101);
    s.lineTo(0.117,0.119); s.lineTo(0.052,0.112); s.closePath();
    const fin = extrusion('stove-support-fin', s, 0.005, cast, 0.0007);
    fin.rotation.y = Math.PI/4+i*Math.PI/2; fin.position.z = -0.003; g.add(fin);
  }
  g.add(frame('stove-front-stamp', 0.239, 0.047, 0.232, 0.04, 0.001,
    M('#aeb4b6', { m: 0.7, r: 0.36 }), 0, 0.051, 0.149, 0.009));
  g.add(frontCylinder(0.025, 0.006, metal, 0, 0.05, 0.152));
  g.add(frontCylinder(0.0225, 0.011, dark(), 0, 0.05, 0.159));
  g.add(box(0.01, 0.038, 0.009, dark(), 0, 0.05, 0.168, 0.003));
  g.add(box(0.0015, 0.005, 0.001, M('#c5c7bf'), 0, 0.065, 0.173));
  const gasMarks = print('gas-controls', 256, 80, (c, w) => {
    c.fillStyle = '#393d3b'; c.textAlign = 'center'; c.font = `21px ${FONT}`;
    c.fillText('OFF', w/2, 29); c.fillText('ISI', 222, 68);
  });
  g.add(panel(0.13, 0.036, gasMarks, 0.023, 0.068, 0.15));
  for (const x of [-0.136, 0.136]) for (const y of [0.031, 0.074]) screw(g, x, y, 0.148);
  // Supplied hose is loose beside the appliance, as in the catalogue, not live.
  const hosePoints = [];
  for (let i = 0; i <= 100; i++) {
    const t = i/100, a = -0.4 + t*Math.PI*3.65;
    const r = 0.073 - t*0.018;
    hosePoints.push([-0.314+Math.cos(a)*r, 0.009+0.011*t, -0.005+Math.sin(a)*r]);
  }
  const orange = M('#c7541f', { r: 0.65 });
  g.add(tube('stove-hose', hosePoints, 0.008, orange, 100, 8));
  for (const index of [0, 100]) {
    const p = V(...hosePoints[index]), neighbour = V(...hosePoints[index===0?1:99]);
    const outward = p.clone().sub(neighbour).normalize();
    const end = mesh(geo('hose-end', () => new THREE.RingGeometry(0.0048,0.008,16)), orange);
    end.position.copy(p); end.quaternion.setFromUnitVectors(V(0,0,1),outward); g.add(end);
    const bore = mesh(geo('hose-bore', () => new THREE.CircleGeometry(0.0048,16)), rubber());
    bore.position.copy(p).addScaledVector(outward,-0.0005); bore.quaternion.copy(end.quaternion); g.add(bore);
  }
  // Worm-drive clip: open steel band, screw housing and slotted screw.
  const clip = lathe('stove-hose-clip', [[0.009,0],[0.01,0],[0.01,0.007],
    [0.009,0.007],[0.009,0]], metal, 24);
  clip.position.set(-0.213,0,0.112); g.add(clip);
  for (let i=0;i<12;i++) {
    const a = i*Math.PI/6;
    const slot = box(0.0005,0.004,0.001, dark(), -0.213+Math.sin(a)*0.0101,0.0035,0.112+Math.cos(a)*0.0101);
    slot.rotation.y = a; g.add(slot);
  }
  g.add(box(0.009,0.008,0.007,metal,-0.2,0.004,0.112,0.001));
  g.add(rod([-0.2,0.004,0.105],[-0.2,0.004,0.12],0.0024,metal,12));
  screw(g,-0.2,0.004,0.1205);
  // Short capped brass gas inlet at the rear-left side.
  g.add(rod([-0.141,0.047,-0.09],[-0.161,0.047,-0.09],0.005,
    M('#aa8b46',{m:0.7,r:0.4}),12));
  return finish(g, 46);
}

export const HIFI = {
  26: () => oven(),
  36: () => mixer(),
  46: () => stove(),
};
