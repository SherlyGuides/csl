/*
 * Batch 12 — all four catalogue photographs and placeholders inspected.
 * sno | item                          | W×H×D cm     | source (spec / typical)
 *  60 | Digital blood pressure monitor| 30×10×24     | typical; monitor 12.8×8×16, rolled cuff + hose
 *  62 | CPR training torso, supine    | 70×21×40     | typical adult half-body trainer; head at -x
 *  66 | Wall-mounted stature meter   | 9×211×18     | spec: 200 cm measuring span; typical reel/headpiece
 *  78 | Analogue bowl weighing scale | 28×32×28     | typical photographed countertop mechanical scale
 *
 * Metres throughout. Dimensions are complete displayed envelopes, not packing
 * sizes. #62 retains the placeholder's face-up, head-left resting pose.
 * #66 deliberately retains the placeholder's wall datum: x=0, floor y=0,
 * wall z=0, with the headpiece underside at y=1.50 and projection to z=0.18.
 * Its 2 m ruler runs from y=0 to y=2; the reel sits ABOVE the measuring span.
 * #78 follows the catalogue bowl scale (the old bathroom-scale block does not).
 * No logos, fetched assets, disk textures, or random geometry.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, tex, FONT } from '../kit.js';

const geos = new Map(), prints = new Map();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ivory = () => M('#eeeae0', { r: 0.4 });
const rubber = () => M('#252729', { r: 0.9 });
const steel = () => M('#c3c9ca', { m: 0.72, r: 0.3 });
function cached(key, create) {
  if (!geos.has(key)) geos.set(key, create());
  return geos.get(key);
}
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
}
function box(w, h, d, mat, x = 0, y = 0, z = 0, r = 0) {
  return mesh(cached(`b:${w}:${h}:${d}:${r}`, () => r
    ? new RoundedBoxGeometry(w, h, d, 1, r)
    : new THREE.BoxGeometry(w, h, d)), mat, x, y, z);
}
function cyl(r, h, mat, x, y, z, n = 16) {
  return mesh(cached(`c:${r}:${h}:${n}`, () => new THREE.CylinderGeometry(r, r, h, n)), mat, x, y, z);
}
function ellipsoid(rx, ry, rz, mat, x, y, z, n = 16, rings = 10) {
  const m = mesh(cached(`s:${n}:${rings}`, () => new THREE.SphereGeometry(1, n, rings)), mat, x, y, z);
  m.scale.set(rx, ry, rz); return m;
}
function lathe(key, pts, mat, n = 40) {
  return mesh(cached(key, () => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(...p)), n)), mat);
}
function tube(key, pts, r, mat, n = 24, sides = 6) {
  return mesh(cached(key, () => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts.map(p => V(...p))), n, r, sides, false)), mat);
}
function ring(r, t, mat, x, y, z, n = 40, sides = 5) {
  return mesh(cached(`r:${r}:${t}:${n}:${sides}`, () => new THREE.TorusGeometry(r, t, sides, n)), mat, x, y, z);
}
function plane(w, h, mat, x, y, z) {
  return mesh(cached(`p:${w}:${h}`, () => new THREE.PlaneGeometry(w, h)), mat, x, y, z);
}
function disk(r, mat, x, y, z, n = 40) {
  return mesh(cached(`d:${r}:${n}`, () => new THREE.CircleGeometry(r, n)), mat, x, y, z);
}
function print(key, w, h, draw, transparent = false) {
  if (!prints.has(key)) prints.set(key, new THREE.MeshStandardMaterial({
    map: tex(w, h, draw), roughness: 0.78, transparent,
    depthWrite: !transparent, polygonOffset: true, polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  }));
  return prints.get(key);
}
function shape(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
  s.closePath(); return s;
}
function extrude(key, s, d, mat, bevel = 0.001) {
  return mesh(cached(key, () => {
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, steps: 1,
      bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel,
      bevelSegments: 1, curveSegments: 4 });
    geo.translate(0, 0, -d / 2); return geo;
  }), mat);
}
function finish(g, sno, wall = false) {
  g.name = `HIFI ${sno}`; g.userData.sno = sno;
  if (!wall) {
    g.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(g);
    const offset = V(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
    g.children.forEach(c => c.position.add(offset));
  }
  g.updateMatrixWorld(true);
  return g;
}

function bloodPressure() {
  const g = new THREE.Group(), white = M('#f4f3ee', { r: 0.36 });
  const grey = M('#a7aaad', { r: 0.48 }), hose = M('#777c7b', { r: 0.78 });
  const cx = -0.086;
  for (const x of [-0.043, 0.043]) for (const z of [-0.053, 0.052])
    g.add(cyl(0.007, 0.005, rubber(), cx + x, 0.0025, z, 12));
  // The casing's height changes continuously along z, matching the sloped photo.
  const housing = cached('bp-sloped-shell', () => {
    const geo = new RoundedBoxGeometry(0.128, 0.06, 0.16, 2, 0.015);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), z = p.getZ(i);
      p.setY(i, 0.005 + (y + 0.03) / 0.06 * (0.049 - z * 0.275));
    }
    geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(housing, white, cx, 0, 0));
  g.add(box(0.114, 0.009, 0.143, M('#d9dbd8', { r: 0.55 }), cx, 0.012, 0, 0.004));
  const deck = new THREE.Group();
  deck.position.set(cx, 0.054, 0);
  deck.rotation.x = -Math.PI / 2 + Math.atan(0.275);
  g.add(deck);
  // XY control surface; +z here is normal to the inclined panel.
  deck.add(box(0.123, 0.155, 0.0028, white, 0, 0, 0, 0.0013));
  const bezelShape = new THREE.Shape();
  const rr = (s, w, h, r) => {
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    s.closePath(); return s;
  };
  rr(bezelShape, 0.111, 0.112, 0.013);
  const bezel = extrude('bp-screen-bezel', bezelShape, 0.001, grey, 0.0005);
  bezel.position.set(0, 0.017, 0.002); deck.add(bezel);
  const lcdShape = rr(new THREE.Shape(), 0.087, 0.080, 0.003);
  const seal = extrude('bp-lcd-gasket', lcdShape, 0.0008, M('#343b3a', { r: 0.6 }), 0.0003);
  seal.position.set(0, 0.018, 0.0032); deck.add(seal);
  // Catalogue display is switched off: do not invent patient measurements.
  const lcd = extrude('bp-lcd', rr(new THREE.Shape(), 0.084, 0.077, 0.0025),
    0.0003, M('#666e68', { r: 0.25 }), 0.0002);
  lcd.position.set(0, 0.018, 0.0038); deck.add(lcd);
  for (const x of [-0.038, 0.038]) {
    const key = extrude(`bp-key-${x}`, rr(new THREE.Shape(), 0.019, 0.012, 0.004), 0.002,
      grey, 0.0005); key.position.set(x, -0.053, 0.003); deck.add(key);
  }
  const start = cyl(0.013, 0.0025, grey, 0, -0.053, 0.0035, 28);
  start.rotation.x = Math.PI / 2; deck.add(start);
  // Side pneumatic connector, battery cover and moulded rear grille.
  const port = cyl(0.0058, 0.010, grey, cx + 0.064, 0.035, -0.025, 12);
  port.rotation.z = Math.PI / 2; g.add(port);
  g.add(box(0.068, 0.001, 0.086, M('#d2d4d0'), cx, 0.0045, -0.003, 0.0004));
  for (let i = 0; i < 5; i++) g.add(box(0.019, 0.0015, 0.0005,
    M('#8f9693'), cx + 0.026, 0.027 + i * 0.004, -0.078));

  // Open rolled cuff: concentric cloth layers with real empty lumen.
  const fabric = print('bp-cuff-woven', 512, 512, (c, w, h) => {
    c.fillStyle = '#85898b'; c.fillRect(0, 0, w, h);
    c.lineWidth = 1;
    for (let i = 0; i < w; i += 4) {
      c.strokeStyle = i % 8 ? '#909395' : '#73797b';
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke();
    }
    c.strokeStyle = '#989c9d';
    for (let j = 0; j < h; j += 5) { c.beginPath(); c.moveTo(0, j); c.lineTo(w, j); c.stroke(); }
    c.strokeStyle = '#d2d1c9'; c.lineWidth = 2; c.setLineDash([6, 4]);
    for (const y of [24, 38, 474, 488]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  });
  const cuff = lathe('bp-open-cuff', [[0.036, -0.071], [0.046, -0.071],
    [0.049, -0.067], [0.049, 0.067], [0.046, 0.071], [0.036, 0.071],
    [0.035, 0.068], [0.035, -0.068], [0.036, -0.071]], fabric, 40);
  cuff.rotation.x = Math.PI / 2; cuff.position.set(0.098, 0.051, -0.009); g.add(cuff);
  const inner = lathe('bp-cuff-inner', [[0.029, -0.066], [0.034, -0.068],
    [0.036, -0.066], [0.036, 0.066], [0.034, 0.068], [0.029, 0.066], [0.029, -0.066]],
  M('#555b5c', { r: 1 }), 32);
  inner.rotation.x = Math.PI / 2; inner.position.copy(cuff.position); g.add(inner);
  for (const z of [-0.077, 0.059]) g.add(ring(0.044, 0.0022, hose, 0.098, 0.051, z, 32));
  // Free fastening tab and its transverse metal D-ring.
  g.add(box(0.063, 0.004, 0.102, M('#707779', { r: 1 }), 0.098, 0.006, -0.004, 0.0018));
  g.add(tube('bp-cuff-buckle', [[0.068, 0.011, 0.045], [0.066, 0.012, 0.066],
    [0.071, 0.012, 0.071], [0.125, 0.012, 0.071], [0.130, 0.012, 0.066],
    [0.128, 0.011, 0.045]], 0.0017, steel(), 16, 5));
  g.add(tube('bp-air-hose', [[cx + 0.069, 0.035, -0.025], [-0.006, 0.025, 0.018],
    [-0.008, 0.008, 0.093], [0.026, 0.006, 0.146], [0.100, 0.006, 0.148],
    [0.144, 0.007, 0.109], [0.101, 0.010, 0.084], [0.035, 0.012, 0.114],
    [0.029, 0.014, 0.149], [0.080, 0.014, 0.150], [0.112, 0.021, 0.099],
    [0.115, 0.035, 0.060]], 0.0042, hose, 64, 7));
  return finish(g, 60);
}

// Smooth section interpolation for the sculpted, single-surface torso shell.
function section(rows, x) {
  let j = 0;
  while (j < rows.length - 2 && x > rows[j + 1][0]) j++;
  const a = rows[j], b = rows[j + 1];
  let t = THREE.MathUtils.clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
  t = t * t * (3 - 2 * t);
  return a.slice(1).map((v, i) => v + (b[i + 1] - v) * t);
}
const gauss = (x, center, spread) => Math.exp(-(((x - center) / spread) ** 2));
const torsoSections = [
  [-0.159, 0.049, 0.056], [-0.138, 0.054, 0.063], [-0.116, 0.075, 0.069],
  [-0.080, 0.158, 0.074], [-0.047, 0.199, 0.079], [-0.004, 0.195, 0.094],
  [0.063, 0.182, 0.085], [0.130, 0.174, 0.070], [0.230, 0.170, 0.064],
  [0.307, 0.163, 0.059], [0.334, 0.148, 0.049],
];
function chestHeight(x, z, angularTop = 1) {
  const [w, h] = section(torsoSections, x);
  const f = Math.sqrt(Math.max(0, 1 - (z / w) ** 2));
  let y = 0.062 + h * f;
  // Broad paired pectorals, shallow sternum, costal arch and abdomen.
  y += 0.022 * gauss(x, 0.028, 0.062) * (gauss(z, -0.091, 0.060) + gauss(z, 0.091, 0.060));
  y -= 0.006 * gauss(z, 0, 0.017) * gauss(x, 0.025, 0.078);
  y += 0.010 * gauss(x, 0.120 + Math.abs(z) * 0.32, 0.018) * gauss(z, 0, 0.14);
  y += 0.009 * gauss(x, 0.232, 0.070) * gauss(z, 0, 0.10);
  y -= 0.006 * gauss(x, 0.287, 0.009) * gauss(z, 0, 0.009);
  y += 0.008 * gauss(x, -0.078 + Math.abs(z) * 0.18, 0.012) * gauss(z, 0, 0.13);
  return 0.062 + (y - 0.062) * angularTop;
}
function faceHeight(x, z) {
  const u = (x + 0.252) / 0.098, v = z / 0.076;
  const n = Math.sqrt(Math.max(0, 1 - u * u - v * v));
  let y = 0.105 + 0.073 * n;
  // Integrated nasal bridge/tip, eye sockets, cheek bones, chin and mouth bed.
  let relief = 0.033 * gauss(x, -0.233, 0.014) * gauss(z, 0, 0.010);
  relief += 0.012 * gauss(x, -0.254, 0.025) * gauss(z, 0, 0.008);
  relief -= 0.007 * gauss(x, -0.268, 0.014) * (gauss(z, -0.032, 0.019) + gauss(z, 0.032, 0.019));
  relief += 0.006 * gauss(x, -0.279, 0.009) * (gauss(z, -0.031, 0.019) + gauss(z, 0.031, 0.019));
  relief += 0.006 * gauss(x, -0.233, 0.022) * (gauss(z, -0.040, 0.020) + gauss(z, 0.040, 0.020));
  relief += 0.012 * gauss(x, -0.183, 0.015) * gauss(z, 0, 0.025);
  relief += 0.007 * gauss(x, -0.205, 0.013) * gauss(z, 0, 0.028);
  return y + relief * n * n;
}
function mannequin() {
  const g = new THREE.Group(), skin = M('#e8b98e', { r: 0.63 });
  const lips = M('#cc9972', { r: 0.7 }), crease = M('#8e634b', { r: 0.92 });
  // Black compression backplate, following the torso rather than a blue mattress.
  g.add(box(0.475, 0.022, 0.400, rubber(), 0.1125, 0.011, 0, 0.010));
  g.add(box(0.155, 0.012, 0.126, rubber(), -0.245, 0.014, 0, 0.005));
  const torsoGeo = cached('cpr-anatomical-torso', () => {
    const pos = [], uv = [], idx = [], nx = 40, nt = 40;
    for (let i = 0; i <= nx; i++) {
      const x = -0.159 + 0.493 * i / nx, [w] = section(torsoSections, x);
      for (let j = 0; j <= nt; j++) {
        const a = j / nt * Math.PI * 2, z = Math.cos(a) * w, s = Math.sin(a);
        // Flat-backed shell with a rounded ventral surface, never a stack of spheres.
        const y = s >= 0 ? chestHeight(x, z) : 0.062 + 0.039 * s;
        pos.push(x, y, z); uv.push(i / nx, j / nt);
        if (i < nx && j < nt) {
          const k = i * (nt + 1) + j;
          idx.push(k, k + 1, k + nt + 1, k + 1, k + nt + 2, k + nt + 1);
        }
      }
    }
    for (const end of [0, nx]) {
      const center = pos.length / 3, x = -0.159 + 0.493 * end / nx;
      pos.push(x, 0.062, 0); uv.push(end / nx, 0.5);
      for (let j = 0; j < nt; j++) {
        const k = end * (nt + 1) + j;
        if (end === 0) idx.push(center, k + 1, k); else idx.push(center, k, k + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(torsoGeo, skin));
  // Bald head with one continuous sculpted face; face points upward in resting pose.
  const headGeo = cached('cpr-sculpted-head', () => {
    const geo = new THREE.SphereGeometry(1, 40, 28), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = -0.252 + p.getX(i) * 0.098, z = p.getZ(i) * 0.076;
      const sy = p.getY(i);
      p.setXYZ(i, x, sy > 0 ? faceHeight(x, z) : 0.105 + sy * 0.073, z);
    }
    geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(headGeo, skin));
  for (const side of [-1, 1]) {
    const z = side * 0.077;
    g.add(ellipsoid(0.021, 0.012, 0.008, skin, -0.233, 0.110, z, 16, 10));
    g.add(ellipsoid(0.012, 0.006, 0.002, lips, -0.232, 0.112, z + side * 0.006, 12, 8));
    const lid = [];
    for (let i = 0; i <= 8; i++) {
      const zz = side * 0.031 + (i / 8 - 0.5) * 0.033;
      const xx = -0.267 + 0.0025 * Math.sin(i / 8 * Math.PI);
      lid.push([xx, faceHeight(xx, zz) + 0.0005, zz]);
    }
    g.add(tube(`cpr-closed-eye-${side}`, lid, 0.00065, crease, 10, 4));
    const nx = -0.226, nz = side * 0.006;
    g.add(ellipsoid(0.0035, 0.0009, 0.0024, M('#50372b', { r: 1 }),
      nx, faceHeight(nx, nz) + 0.0009, nz, 12, 8));
    const nippleX = 0.040, nippleZ = side * 0.128;
    g.add(ellipsoid(0.005, 0.0022, 0.005, skin,
      nippleX, chestHeight(nippleX, nippleZ), nippleZ, 12, 8));
    // Two removable-skin fasteners at the lower flanks, visible in the photo.
    const fastener = cyl(0.005, 0.0015, lips, 0.285, 0.064, side * 0.165, 12);
    fastener.rotation.x = Math.PI / 2; g.add(fastener);
  }
  // Open airway, inset into the sculpted mouth bed; separately rolled lips.
  const mouthGeo = cached('cpr-airway-opening', () => {
    const p = [-0.205, faceHeight(-0.205, 0) + 0.0008, 0], idx = [];
    for (let i = 0; i <= 32; i++) {
      const a = i / 32 * Math.PI * 2, x = -0.205 + Math.sin(a) * 0.0055, z = Math.cos(a) * 0.022;
      p.push(x, faceHeight(x, z) + 0.0008, z);
      if (i < 32) idx.push(0, i + 1, i + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(mouthGeo, M('#34261e', { r: 1, side: THREE.DoubleSide })));
  const lip = [];
  for (let i = 0; i <= 24; i++) {
    const a = i / 24 * Math.PI * 2, x = -0.205 + Math.sin(a) * 0.0065, z = Math.cos(a) * 0.023;
    lip.push([x, faceHeight(x, z) + 0.001, z]);
  }
  g.add(tube('cpr-lip-contour', lip, 0.0017, skin, 28, 5));
  // Replaceable face-mask seam runs below the jaw, not across the cheeks.
  g.add(tube('cpr-jaw-seam', [[-0.213, 0.090, -0.073], [-0.184, 0.080, -0.050],
    [-0.159, 0.090, -0.026], [-0.156, 0.094, 0], [-0.159, 0.090, 0.026],
    [-0.184, 0.080, 0.050], [-0.213, 0.090, 0.073]], 0.0009, crease, 24, 4));
  return finish(g, 62);
}

function statureMeter() {
  const g = new THREE.Group(), plastic = ivory(), trim = M('#bdbeb4', { r: 0.55 });
  // All backs remain at or in front of z=0; do not centre this assembly in depth.
  g.add(box(0.034, 2, 0.0016, M('#eeeede'), 0, 1, 0.0008));
  const ruler = print('stature-millimetres-200cm', 256, 8192, (c, w, h) => {
    c.fillStyle = '#f2f0df'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3b3d36'; c.textAlign = 'left'; c.textBaseline = 'middle';
    for (let mm = 0; mm <= 2000; mm++) {
      const y = h - mm / 2000 * h;
      c.fillRect(w - (mm % 10 === 0 ? 120 : mm % 5 === 0 ? 82 : 44), y,
        mm % 10 === 0 ? 120 : mm % 5 === 0 ? 82 : 44, mm % 10 === 0 ? 2 : 1);
      if (mm % 10 === 0 && mm > 0 && mm < 2000) {
        c.font = `22px ${FONT}`; c.fillText(String(mm / 10), 10, y);
      }
    }
  });
  g.add(plane(0.034, 2, ruler, 0, 1, 0.00165));
  g.add(box(0.046, 0.025, 0.008, plastic, 0, 0.0125, 0.004, 0.002));
  g.add(box(0.090, 0.110, 0.008, plastic, 0, 2.055, 0.004, 0.003));
  // Rounded reel shell projects from the mounting plate like the reference.
  const reelSide = new THREE.Shape();
  reelSide.moveTo(0.009, 2.006); reelSide.lineTo(0.032, 2.006);
  reelSide.bezierCurveTo(0.060, 2.006, 0.063, 2.025, 0.063, 2.050);
  reelSide.bezierCurveTo(0.063, 2.080, 0.055, 2.094, 0.032, 2.094);
  reelSide.lineTo(0.009, 2.094); reelSide.closePath();
  const reel = extrude('stature-reel-shell', reelSide, 0.068, plastic, 0.001);
  reel.rotation.y = -Math.PI / 2; g.add(reel);
  const seam = tube('stature-reel-seam', [[-0.023, 2.009, 0.031], [-0.023, 2.016, 0.052],
    [-0.023, 2.05, 0.0641], [-0.023, 2.081, 0.054], [-0.023, 2.092, 0.031]],
  0.00055, trim, 20, 4); g.add(seam);
  g.add(box(0.036, 0.003, 0.005, M('#777a70'), 0, 2.006, 0.012));
  for (const [x, y, z] of [[-0.031, 2.098, 0.0084], [0.031, 2.098, 0.0084], [0, 0.013, 0.0084]]) {
    g.add(disk(0.0032, steel(), x, y, z, 12));
    g.add(box(0.0034, 0.00065, 0.0002, M('#4b514c'), x, y, z + 0.0002));
  }
  // Sliding guide and a tapered, rigid horizontal headpiece. Bottom = 150 cm.
  for (const x of [-0.023, 0.023])
    g.add(box(0.011, 0.044, 0.025, plastic, x, 1.522, 0.0145, 0.004));
  g.add(box(0.047, 0.038, 0.010, plastic, 0, 1.522, 0.023, 0.003));
  const arm = extrude('stature-headpiece', shape([[0.028, 1.501], [0.179, 1.501],
    [0.179, 1.505], [0.101, 1.514], [0.059, 1.522], [0.038, 1.538], [0.028, 1.538]]),
  0.074, plastic, 0.001);
  arm.rotation.y = -Math.PI / 2; g.add(arm);
  g.add(box(0.058, 0.0007, 0.120, trim, 0, 1.5004, 0.113));
  return finish(g, 66, true);
}

function weighingScale() {
  const g = new THREE.Group(), enamel = M('#efeee8', { r: 0.32 });
  const brass = M('#b89a58', { m: 0.65, r: 0.35 });
  for (const x of [-0.092, 0.092]) for (const z of [-0.084, 0.084])
    g.add(cyl(0.013, 0.009, rubber(), x, 0.0045, z, 12));
  g.add(box(0.232, 0.024, 0.223, enamel, 0, 0.021, 0, 0.009));
  const housing = cached('analogue-scale-enamel-body', () => {
    const geo = new RoundedBoxGeometry(0.211, 0.198, 0.187, 1, 0.012);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const f = (p.getY(i) + 0.099) / 0.198;
      p.setX(i, p.getX(i) * (1 - f * 0.25));
      p.setZ(i, p.getZ(i) * (1 - f * 0.17));
    }
    geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(housing, enamel, 0, 0.127, -0.006));
  const surround = cyl(0.102, 0.008, enamel, 0, 0.128, 0.088, 48);
  surround.rotation.x = Math.PI / 2; g.add(surround);
  const dial = print('analogue-scale-dial', 1024, 1024, (c, w, h) => {
    c.fillStyle = '#f3f3ef'; c.fillRect(0, 0, w, h); c.translate(w / 2, h / 2);
    // Reference dial has ticks without numbers or capacity branding.
    for (let i = 0; i < 200; i++) {
      c.save(); c.rotate(i / 200 * Math.PI * 2);
      c.strokeStyle = '#272d2b'; c.lineWidth = i % 20 === 0 ? 6 : i % 10 === 0 ? 3.2 : 1.8;
      c.beginPath(); c.moveTo(0, -465); c.lineTo(0, i % 20 === 0 ? -377 : i % 10 === 0 ? -413 : -434);
      c.stroke(); c.restore();
    }
  });
  g.add(disk(0.096, dial, 0, 0.128, 0.0922, 48));
  g.add(ring(0.098, 0.0025, steel(), 0, 0.128, 0.092, 48, 5));
  g.add(ring(0.0949, 0.0007, M('#9fa6a6', { m: 0.7, r: 0.4 }), 0, 0.128, 0.0925, 48, 4));
  const needle = extrude('analogue-scale-pointer', shape([[-0.0012, 0.216],
    [-0.006, 0.132], [-0.004, 0.115], [-0.010, 0.103], [-0.009, 0.097],
    [-0.005, 0.094], [0.005, 0.094], [0.009, 0.097], [0.010, 0.103],
    [0.004, 0.115], [0.005, 0.132], [0.0006, 0.216]]), 0.001, M('#252828'), 0.0003);
  needle.position.z = 0.094; g.add(needle);
  g.add(disk(0.0054, brass, 0, 0.128, 0.095, 20));
  for (const y of [0.020, 0.237]) {
    g.add(disk(0.003, steel(), 0, y, 0.092, 12));
    g.add(box(0.003, 0.0006, 0.0004, M('#545b59'), 0, y, 0.0923));
  }
  // Two upright stainless brackets and underside bearing pads under the pan.
  for (const x of [-0.058, 0.058]) {
    g.add(box(0.009, 0.035, 0.018, steel(), x, 0.2425, -0.003, 0.001));
    g.add(box(0.039, 0.004, 0.037, steel(), x, 0.258, -0.003, 0.001));
  }
  g.add(cyl(0.004, 0.007, brass, 0, 0.230, 0.026, 12));
  g.add(cyl(0.008, 0.007, brass, 0, 0.237, 0.026, 24));
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    g.add(cyl(0.00045, 0.006, brass, Math.sin(a) * 0.008, 0.237, 0.026 + Math.cos(a) * 0.008, 4));
  }
  // Closed, thin-walled spun bowl: the inside floor and wall are visible from above.
  g.add(lathe('analogue-scale-pan', [[0, 0.260], [0.078, 0.260], [0.104, 0.265],
    [0.122, 0.279], [0.136, 0.312], [0.140, 0.316], [0.139, 0.320],
    [0.1365, 0.319], [0.134, 0.314], [0.120, 0.282], [0.102, 0.269],
    [0.078, 0.264], [0, 0.264]], steel(), 40));
  return finish(g, 78);
}

export const HIFI = {
  60: () => bloodPressure(),
  62: () => mannequin(),
  66: () => statureMeter(),
  78: () => weighingScale(),
};
