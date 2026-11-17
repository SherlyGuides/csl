/*
 * Batch 3 — catalogue photographs inspected. Geometry units: metres.
 * sno | item            | W×H×D cm       | source (spec / typical)
 *   6 | Hand rake       | 29.5×132.5×8.5 | spec: exact envelope, wood, 12 teeth
 *  16 | Shovel or spade | 21×115×5.5     | typical photo-shaped medium blade;
 *     |                 |                | spec: 7.5 mm blade, shaft < 3 ft
 *  17 | Sickle          | 32×38×3.6      | spec: 18 in curved blade; typical grip
 *
 * Sickle's 18 in = 0.4572 m along the curved blade centreline, NOT its chord
 * or overall height. Its 14.3 cm turned grip matches the catalogue proportions.
 * Spade blade is 26.5 cm long; exposed wooden shaft 79.5 cm, inserted to 88 cm.
 * All three are upright, handle down, with blade faces towards +z. The brief's
 * explicit rail-pose requirement takes precedence over #16's old negative-y
 * blade and schematic D grip: the photograph has a straight wooden handle.
 * Rake tooth count follows the spec, even though its photo shows more teeth.
 * Only translation is used to bottom-align and centre the final envelopes.
 * Deterministic canvas grain / forge marks; no disk textures, brands or loads.
 */
import * as THREE from 'three';
import { M, tex } from '../kit.js';

const geometries = new Map();
const surfaces = new Map();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const iron = () => M('#363a39', { m: 0.65, r: 0.52 });
const edge = () => M('#babbb6', { m: 0.72, r: 0.37 });

function cached(key, build) {
  if (!geometries.has(key)) geometries.set(key, build());
  return geometries.get(key);
}
function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function lathe(key, profile, material, segments = 20) {
  return mesh(cached(key, () => new THREE.LatheGeometry(
    profile.map(p => new THREE.Vector2(...p)), segments)), material);
}
function cylinder(radius, length, material, x, y, z, segments = 12) {
  return mesh(cached(`c:${radius}:${length}:${segments}`, () =>
    new THREE.CylinderGeometry(radius, radius, length, segments)), material, x, y, z);
}
function rod(a, b, radius, material, segments = 10) {
  const av = V(...a), bv = V(...b), d = bv.clone().sub(av);
  const m = cylinder(radius, d.length(), material, 0, 0, 0, segments);
  m.position.copy(av).add(bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
function shape(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
  s.closePath();
  return s;
}
function plate(key, outline, depth, material, bevel = 0.0006) {
  return mesh(cached(key, () => {
    const g = new THREE.ExtrudeGeometry(outline, { depth, steps: 1,
      bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel,
      bevelSegments: 1, curveSegments: 4 });
    g.translate(0, 0, -depth / 2);
    return g;
  }), material);
}
function rivet(g, x, y, z, radius = 0.0032) {
  const m = cylinder(radius, 0.0018, edge(), x, y, z, 12);
  m.rotation.x = Math.PI / 2;
  g.add(m);
  const slot = mesh(cached('rivet-slot', () => new THREE.BoxGeometry(
    0.0036, 0.00055, 0.0002)), iron(), x, y, z + 0.00095);
  slot.rotation.z = 0.3;
  g.add(slot);
}

// Small, reproducible painted textures. One material/map is shared by all grips
// and another by all forged parts, including subsequent builder invocations.
function surface(kind) {
  if (surfaces.has(kind)) return surfaces.get(kind);
  let seed = kind === 'wood' ? 7127 : 3601;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const map = tex(256, 1024, (c, w, h) => {
    c.fillStyle = kind === 'wood' ? '#b9884e' : '#777a76';
    c.fillRect(0, 0, w, h);
    if (kind === 'wood') {
      // Long fibres with softer latewood bands; no random geometry or seams.
      for (let i = 0; i < 260; i++) {
        const x = random() * w, bend = 1 + random() * 5;
        c.strokeStyle = i % 3 ? `rgba(72,38,12,${0.04 + random() * 0.15})`
          : `rgba(255,226,166,${0.1 + random() * 0.2})`;
        c.lineWidth = 0.35 + random() * 1.2;
        c.beginPath(); c.moveTo(x, 0);
        for (let y = 0; y <= h; y += 16)
          c.lineTo(x + Math.sin(y * 0.009 + x * 0.12) * bend, y);
        c.stroke();
      }
      for (let i = 0; i < 65; i++) {
        const x = random() * w, y = random() * h;
        c.strokeStyle = 'rgba(72,39,15,.20)'; c.lineWidth = 0.6;
        c.beginPath(); c.ellipse(x, y, 1.1 + random() * 1.8,
          5 + random() * 18, 0.08, 0, Math.PI * 2); c.stroke();
      }
    } else {
      for (let i = 0; i < 14000; i++) {
        const x = random() * w, y = random() * h, v = random();
        c.fillStyle = v > 0.47 ? `rgba(223,224,213,${random() * 0.17})`
          : `rgba(23,29,26,${random() * 0.22})`;
        c.fillRect(x, y, 0.4 + random() * 3, 0.5 + random() * 7);
      }
      for (let i = 0; i < 500; i++) {
        const x = random() * w, y = random() * h;
        c.strokeStyle = 'rgba(231,231,214,.14)'; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + random() * 9, y + 3 + random() * 18); c.stroke();
      }
    }
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const material = new THREE.MeshStandardMaterial({ map,
    roughness: kind === 'wood' ? 0.72 : 0.57,
    metalness: kind === 'wood' ? 0 : 0.68,
    bumpMap: map, bumpScale: kind === 'wood' ? 0.00016 : 0.00009 });
  surfaces.set(kind, material);
  return material;
}
function finish(g, sno) {
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g);
  const shift = V(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  for (const child of g.children) child.position.add(shift);
  g.name = `HIFI ${sno}`;
  g.userData.sno = sno;
  g.updateMatrixWorld(true);
  return g;
}

function rake() {
  const g = new THREE.Group(), black = iron();
  // Turned end, straight ash shaft and tapered steel socket, all contiguous.
  g.add(lathe('rake-shaft', [[0, 0], [0.010, 0], [0.013, 0.003],
    [0.014, 0.008], [0.014, 0.055], [0.0135, 1.16],
    [0.0126, 1.215], [0, 1.215]], surface('wood'), 20));
  const socket = lathe('rake-socket', [[0.013, 1.172], [0.0153, 1.172],
    [0.0158, 1.177], [0.0155, 1.195], [0.011, 1.245],
    [0.006, 1.299], [0.005, 1.312], [0, 1.313]], black, 16);
  g.add(socket);
  rivet(g, 0, 1.189, 0.0156);
  const bar = plate('rake-spine', shape([[-0.1467, 1.3118], [0.1467, 1.3118],
    [0.1467, 1.3242], [-0.1467, 1.3242]]), 0.0094, black, 0.0008);
  bar.position.z = -0.0125; g.add(bar);
  // Photograph's triangular steel brace, with flattened (not tubular) legs.
  for (const side of [-1, 1]) {
    const brace = plate(`rake-brace:${side}`, shape([
      [side * 0.010, 1.225], [side * 0.015, 1.225],
      [side * 0.105, 1.308], [side * 0.101, 1.313],
    ]), 0.003, black, 0.0004);
    brace.position.z = -0.007; g.add(brace);
    g.add(rod([side * 0.096, 1.314, -0.006],
      [side * 0.106, 1.314, -0.006], 0.0018, black, 6));
  }
  // One reusable flat forged tooth. Profile in z/y, extruded across x:
  // a generous bend at the shoulder and a narrow, slightly recurved point.
  const tooth = shape([[-0.017, 1.317], [-0.006, 1.317],
    [0.011, 1.307], [0.033, 1.290], [0.054, 1.268],
    [0.0669, 1.245], [0.064, 1.244], [0.047, 1.262],
    [0.025, 1.280], [0.004, 1.294], [-0.017, 1.303]]);
  for (let i = 0; i < 12; i++) {
    const t = plate('rake-tooth', tooth, 0.006, black, 0.0004);
    t.rotation.y = -Math.PI / 2;
    t.position.x = -0.1425 + i * 0.285 / 11; g.add(t);
  }
  return finish(g, 6);
}

function spade() {
  const g = new THREE.Group();
  g.add(lathe('spade-shaft', [[0, 0], [0.0105, 0], [0.014, 0.003],
    [0.016, 0.009], [0.016, 0.035], [0.0157, 0.72],
    [0.0148, 0.88], [0, 0.88]], surface('wood'), 24));
  // A real shallow pressed dish, with closed front/back and a sharpened rim.
  // Rows describe the inverted photograph silhouette (handle at bottom).
  const rows = [[0.885, 0.093], [0.890, 0.102], [0.908, 0.105],
    [0.950, 0.104], [0.995, 0.100], [1.035, 0.089],
    [1.073, 0.071], [1.105, 0.050], [1.130, 0.028],
    [1.145, 0.011], [1.150, 0.0004]];
  const blade = cached('spade-dish', () => {
    const positions = [], uv = [], indices = [], cols = 12, stride = cols + 1;
    const sideCount = rows.length * stride;
    for (const face of [1, -1]) {
      rows.forEach(([y, half], row) => {
        for (let j = 0; j <= cols; j++) {
          const u = j / cols * 2 - 1, x = half * u;
          const longitudinal = Math.sin((y - 0.885) / 0.265 * Math.PI);
          const dish = -0.010 + 0.026 * u * u + 0.004 * longitudinal;
          // 7.5 mm body; final edge land ~1 mm, with a broad ground bevel.
          const rim = Math.min(1, (1 - Math.abs(u)) * 7,
            (rows.length - 1 - row) * 0.8);
          const thickness = 0.001 + 0.0065 * rim;
          positions.push(x, y, dish + face * thickness / 2);
          uv.push((x + 0.105) / 0.210, (y - 0.885) / 0.265);
        }
      });
    }
    for (let row = 0; row < rows.length - 1; row++) for (let j = 0; j < cols; j++) {
      const a = row * stride + j, b = a + 1, d = a + stride, c = d + 1;
      indices.push(a, b, d, b, c, d);
      indices.push(a + sideCount, d + sideCount, b + sideCount,
        b + sideCount, d + sideCount, c + sideCount);
    }
    const boundary = [];
    for (let j = 0; j <= cols; j++) boundary.push(j);
    for (let r = 1; r < rows.length; r++) boundary.push(r * stride + cols);
    for (let j = cols - 1; j >= 0; j--) boundary.push((rows.length - 1) * stride + j);
    for (let r = rows.length - 2; r > 0; r--) boundary.push(r * stride);
    for (let i = 0; i < boundary.length; i++) {
      const a = boundary[i], b = boundary[(i + 1) % boundary.length];
      indices.push(a, a + sideCount, b, b, a + sideCount, b + sideCount);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices); geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(blade, surface('forge')));
  // Drawn socket dies away into a tapered pressed rib down the blade centre.
  const socket = lathe('spade-socket', [[0.015, 0.795], [0.0185, 0.795],
    [0.019, 0.8], [0.0182, 0.862], [0.016, 0.891],
    [0.012, 0.925], [0.006, 0.98], [0.001, 1.027], [0, 1.03]], surface('forge'), 24);
  socket.position.z = 0.007; g.add(socket);
  // Rear of the shaft stays seated in the socket without a detached ferrule.
  rivet(g, 0, 0.817, 0.0258, 0.0034);
  // Two rolled shoulder lips where a boot bears on the blade.
  for (const sign of [-1, 1]) {
    g.add(rod([sign * 0.027, 0.89, -0.004],
      [sign * 0.093, 0.89, 0.012], 0.003, surface('forge'), 10));
  }
  return finish(g, 16);
}

function sickle() {
  const g = new THREE.Group();
  g.add(lathe('sickle-grip', [[0, 0], [0.011, 0], [0.0165, 0.004],
    [0.018, 0.011], [0.018, 0.024], [0.0175, 0.040],
    [0.016, 0.092], [0.0145, 0.129], [0.0133, 0.143], [0, 0.143]], surface('wood'), 24));
  // Two incised rings near the butt, following the turned grip in the photo.
  for (const y of [0.025, 0.030]) {
    const ring = mesh(cached('sickle-grip-ring', () => new THREE.TorusGeometry(
      0.0179, 0.00035, 4, 24)), M('#704c2d', { r: 0.85 }), 0, y, 0);
    ring.rotation.x = Math.PI / 2; g.add(ring);
  }
  g.add(lathe('sickle-ferrule', [[0.0125, 0.131], [0.0147, 0.131],
    [0.015, 0.133], [0.0144, 0.157], [0.0135, 0.160],
    [0.0117, 0.160], [0.0117, 0.132]], surface('forge'), 20));
  const start = Math.PI + 0.18, end = 0.25;
  const radius = 0.4572 / (start - end);
  const cx = -Math.cos(start) * radius, cy = 0.185 - Math.sin(start) * radius;
  const tang = plate('sickle-tang', shape([[-0.008, 0.149], [0.008, 0.149],
    [0.013, 0.170], [0.018, 0.187], [-0.012, 0.202], [-0.016, 0.181]]),
    0.0034, surface('forge'), 0.00045);
  g.add(tang);
  const bladeGeo = cached('sickle-crescent', () => {
    const pos = [], uv = [], indices = [], n = 56, lanes = 4;
    // Inner edge, bevel shoulder, body, spine; matching back surface.
    const across = [-0.5, -0.29, 0.44, 0.5];
    const halfThickness = [0.00015, 0.0017, 0.0017, 0.0013];
    for (const face of [1, -1]) for (let i = 0; i <= n; i++) {
      const t = i / n, a = start + (end - start) * t;
      const width = 0.030 * Math.pow(Math.sin(Math.PI * t), 0.72) + 0.018 * (1 - t) + 0.00015;
      for (let j = 0; j < lanes; j++) {
        const r = radius + width * across[j];
        pos.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r,
          face * halfThickness[j] * (1 - 0.9 * Math.pow(t, 12)));
        uv.push(t, (across[j] + 0.5) * 0.65);
      }
    }
    const offset = (n + 1) * lanes;
    // Separate ground edge material groups on both faces.
    const groups = [];
    for (let j = 0; j < lanes - 1; j++) {
      const first = indices.length;
      for (let i = 0; i < n; i++) {
        const a = i * lanes + j, b = a + 1, c = a + lanes, d = c + 1;
        indices.push(a, c, b, b, c, d);
        indices.push(a + offset, b + offset, c + offset, b + offset, d + offset, c + offset);
      }
      groups.push([first, indices.length - first, j === 0 ? 1 : 0]);
    }
    const first = indices.length;
    for (let i = 0; i < n; i++) for (const j of [0, lanes - 1]) {
      const a = i * lanes + j, b = a + lanes;
      if (j === 0) indices.push(a, a + offset, b, b, a + offset, b + offset);
      else indices.push(a, b, a + offset, b, b + offset, a + offset);
    }
    for (const i of [0, n]) for (let j = 0; j < lanes - 1; j++) {
      const a = i * lanes + j, b = a + 1;
      if (i === 0) indices.push(a, b, a + offset, b, b + offset, a + offset);
      else indices.push(a, a + offset, b, b, a + offset, b + offset);
    }
    groups.push([first, indices.length - first, 0]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices);
    groups.forEach(args => geo.addGroup(...args));
    geo.computeVertexNormals(); return geo;
  });
  g.add(mesh(bladeGeo, [surface('forge'), edge()]));
  g.userData.bladeCentrelineMetres = 0.4572;
  return finish(g, 17);
}

export const HIFI = {
  6: () => rake(),
  16: () => spade(),
  17: () => sickle(),
};
