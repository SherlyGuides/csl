// Shared, cached geometry for the stylised school characters in kid.js.
// Every builder runs once; all characters reuse the same BufferGeometry objects.
// Frames: +y up, +z is the character's front, +x is the character's left.
import * as THREE from 'three';

const PI = Math.PI;
const ZERO = [0, 0, 0];
const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c3 = new THREE.Vector3();
const _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _m = new THREE.Matrix4(), _col = new THREE.Color();

const GEO = new Map();
export function geo(key, make) { let g = GEO.get(key); if (!g) { g = make(); GEO.set(key, g); } return g; }

// ---- primitives (centred) ----
const sph = (r, w = 12, h = 8, ...a) => new THREE.SphereGeometry(r, w, h, ...a);
const cyl = (rt, rb, h, seg = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const circ = (r, seg = 10) => new THREE.CircleGeometry(r, seg);
const tor = (R, t, rs = 5, ts = 12, arc = PI * 2) => new THREE.TorusGeometry(R, t, rs, ts, arc);

// make triangle winding agree with the vertex normals (lathe orientation depends on the profile direction)
function orient(g) {
  const ix = g.index.array, P = g.attributes.position, N = g.attributes.normal;
  for (let t = 0; t < ix.length; t += 3) {
    _a.fromBufferAttribute(P, ix[t]); _b.fromBufferAttribute(P, ix[t + 1]); _c3.fromBufferAttribute(P, ix[t + 2]);
    _b.sub(_a); _c3.sub(_a); _b.cross(_c3); if (_b.lengthSq() < 1e-14) continue;
    _c3.fromBufferAttribute(N, ix[t]).add(_a.fromBufferAttribute(N, ix[t + 1])).add(_a.fromBufferAttribute(N, ix[t + 2]));
    if (_b.dot(_c3) < 0) for (let k = 0; k < ix.length; k += 3) { const x = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = x; }
    break;
  }
  return g;
}
// surface of revolution about y. pts: [radius, y] walked bottom to top (outside on the right of the walk)
function lathe(pts, seg = 12, phiStart = 0, phiLength = PI * 2) {
  return orient(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg, phiStart, phiLength));
}
// tapered capsule hanging from its pivot: top cap centre at y=0, bottom cap centre at y=-len.
// The rounded ends double as joint spheres, so bent elbows and knees never open a gap.
function tcap(rt, rb, len, seg = 10, flat = false, n = 3) {
  const pts = [];
  if (flat) pts.push([0, -len], [rb, -len]);
  else for (let i = 0; i <= n; i++) { const a = -PI / 2 + (PI / 2) * i / n; pts.push([rb * Math.cos(a), -len + rb * Math.sin(a)]); }
  for (let i = 0; i <= n; i++) { const a = (PI / 2) * i / n; pts.push([rt * Math.cos(a), rt * Math.sin(a)]); }
  return lathe(pts, seg);
}

// baked, optionally coloured copy of a geometry: o = { p:[x,y,z], r:[rx,ry,rz], q:Quaternion, s:number|[x,y,z], c:'#hex' }
function part(g, o = {}) {
  const n = g.index ? g.toNonIndexed() : g.clone();
  const s = o.s ?? 1;
  if (Array.isArray(s)) _s.set(s[0], s[1], s[2]); else _s.setScalar(s);
  if (o.q) _q.copy(o.q); else { const r = o.r ?? ZERO; _q.setFromEuler(_e.set(r[0], r[1], r[2])); }
  const p = o.p ?? ZERO; _v.set(p[0], p[1], p[2]);
  n.applyMatrix4(_m.compose(_v, _q, _s));
  if (o.c) {
    _col.set(o.c); const cnt = n.attributes.position.count, a = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) { a[i * 3] = _col.r; a[i * 3 + 1] = _col.g; a[i * 3 + 2] = _col.b; }
    n.setAttribute('color', new THREE.BufferAttribute(a, 3));
  }
  return n;
}
function merge(parts) {
  let n = 0; for (const p of parts) n += p.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  const col = parts.some(p => p.attributes.color) ? new Float32Array(n * 3).fill(1) : null;
  let o = 0;
  for (const p of parts) {
    pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3);
    if (col && p.attributes.color) col.set(p.attributes.color.array, o * 3);
    o += p.attributes.position.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return g;
}
// flat band between two points (width w across, thickness t)
function strip(a, b, w, t, c) {
  if (b[1] < a[1]) { const x = a; a = b; b = x; }
  _a.set(a[0], a[1], a[2]); _b.set(b[0], b[1], b[2]);
  const len = _a.distanceTo(_b), q = new THREE.Quaternion().setFromUnitVectors(UP, _b.sub(_a).normalize());
  return part(box(w, len, t), { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], q, c });
}
// round tube through points
function tube(pts, r, seg = 8, c) {
  const out = [];
  pts.forEach((p, i) => {
    out.push(part(sph(r, seg, 4), { p, c }));
    if (!i) return;
    let a = pts[i - 1], b = p; if (b[1] < a[1]) { const x = a; a = b; b = x; }
    _a.set(a[0], a[1], a[2]); _b.set(b[0], b[1], b[2]);
    const len = _a.distanceTo(_b), q = new THREE.Quaternion().setFromUnitVectors(UP, _b.sub(_a).normalize());
    out.push(part(cyl(r, r, len, seg, true), { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], q, c }));
  });
  return out;
}
const both = (f) => [f(1), f(-1)];

// ---------------- body ----------------
// torso profile [radius, y] in the torso frame (pivot at the waist); depth is squashed to DEPTH
const TP = [[0, -0.035], [0.09, -0.03], [0.118, -0.01], [0.122, 0.03], [0.13, 0.12], [0.145, 0.22], [0.15, 0.30], [0.146, 0.35], [0.13, 0.385], [0.10, 0.41], [0.07, 0.43], [0.045, 0.445], [0, 0.45]];
const DEPTH = 0.66;

export const G = {
  // shirt body: 'uniform' has collar + chest pocket, 'plain' is a round-neck kurta top
  shirt: (kind) => geo('shirt-' + kind, () => {
    const ps = [part(lathe(TP, 14), { s: [1, 1, DEPTH] })];
    ps.push(part(cyl(0.05, 0.07, 0.035, 12, true), { p: [0, 0.44, 0], s: [1, 1, 0.88] }));
    if (kind === 'uniform') {
      ps.push(...both(s => part(box(0.05, 0.007, 0.03), { p: [0.03 * s, 0.434, 0.054], r: [0.55, 0.5 * s, -0.3 * s] })));
      ps.push(part(box(0.05, 0.052, 0.006), { p: [0.072, 0.285, 0.0885], r: [0, 0.34, 0] }));
    }
    return merge(ps);
  }),
  // shoulder ball + sleeve
  sleeve: (kind) => geo('sleeve-' + kind, () => kind === 'long'
    ? tcap(0.058, 0.047, 0.27, 12, false, 4)
    : merge([part(tcap(0.058, 0.054, 0.13, 12, true, 4)), part(cyl(0.0575, 0.0575, 0.02, 12, true), { p: [0, -0.121, 0] })])),
  upperArm: () => geo('upperArm', () => tcap(0.044, 0.037, 0.27, 10)),
  foreArm: () => geo('foreArm', () => tcap(0.037, 0.03, 0.24, 10)),
  // mitten hand: palm faces -z (down when the forearm is forward), thumb on the inner side. s = +1 left, -1 right
  hand: (s) => geo('hand' + s, () => merge([
    part(sph(0.03, 8, 5), { p: [0, -0.012, 0], s: [1.05, 1.25, 0.52] }),
    part(sph(0.028, 8, 5), { p: [0, -0.056, -0.007], s: [0.98, 1.15, 0.5], r: [0.38, 0, 0] }),
    part(tcap(0.0125, 0.0105, 0.032, 6, false, 2), { p: [-0.026 * s, -0.004, -0.004], r: [0.35, 0, -0.75 * s] }),
  ])),
  neck: () => geo('neck', () => part(cyl(0.04, 0.047, 0.13, 10, true), { p: [0, 0.045, 0] })),
  hips: () => geo('hips', () => merge([
    part(sph(0.13, 14, 8), { p: [0, -0.03, 0], s: [1.08, 0.8, 0.74] }),
    part(cyl(0.126, 0.131, 0.09, 16, true), { p: [0, 0.015, 0], s: [1, 1, 0.7] }),
  ])),
  belt: () => geo('belt', () => merge([
    part(cyl(0.131, 0.131, 0.028, 16, true), { p: [0, 0.05, 0], s: [1, 1, 0.7], c: '#17171b' }),
    part(box(0.036, 0.027, 0.008), { p: [0, 0.05, 0.092], c: '#c9cdd3' }),
    part(box(0.02, 0.013, 0.009), { p: [0, 0.05, 0.0925], c: '#17171b' }),
  ])),
  thigh: () => geo('thigh', () => tcap(0.07, 0.054, 0.38, 10)),
  shinTrouser: () => geo('shinT', () => tcap(0.053, 0.047, 0.3, 12, true)),
  shinBare: () => geo('shinB', () => tcap(0.05, 0.037, 0.33, 10)),
  // school shoe + sock, in the ankle frame (ankle 0.06 above the sole). long = calf-length sock for skirts
  shoe: (long) => geo('shoe' + (long ? 'L' : 'S'), () => merge([
    part(cyl(0.05, 0.05, 0.016, 12), { p: [0, -0.052, 0.035], s: [0.9, 1, 1.9], c: '#2c2c31' }),
    part(sph(0.05, 10, 4, 0, PI * 2, 0, PI / 2), { p: [0, -0.045, 0.035], s: [0.86, 0.82, 1.85], c: '#131316' }),
    part(cyl(0.04, 0.044, 0.032, 8), { p: [0, -0.014, -0.004], c: '#131316' }),
    ...(long
      ? [part(cyl(0.047, 0.04, 0.13, 10, true), { p: [0, 0.045, 0], c: '#f4f4f2' }), part(cyl(0.049, 0.049, 0.014, 10, true), { p: [0, 0.106, 0], c: '#f4f4f2' })]
      : [part(cyl(0.038, 0.037, 0.06, 10, true), { p: [0, 0.01, 0], c: '#f4f4f2' })]),
  ])),
  // skirt / kurta hem, standing (hangs from the waist) and sitting (lies along the thighs)
  skirtStand: () => geo('skirtStand', () => part(lathe([[0, -0.27], [0.205, -0.31], [0.19, -0.2], [0.15, -0.03], [0.133, 0.055], [0.126, 0.085]], 16), { s: [1, 1, 0.78] })),
  skirtSit: () => geo('skirtSit', () => part(lathe([[0, -0.1], [0.14, -0.085], [0.152, 0], [0.2, 0.3], [0, 0.315]], 16), { s: [1, 1, 0.5], r: [PI / 2, 0, 0], p: [0, -0.055, 0] })),
  // pinafore bib + shoulder straps (over the shirt)
  bib: () => geo('bib', () => merge([
    part(lathe([[0.124, -0.015], [0.129, 0.03], [0.137, 0.12], [0.152, 0.22], [0.1545, 0.268], [0.146, 0.272]], 12), { s: [1, 1, DEPTH] }),
    ...both(s => [
      strip([0.075 * s, 0.262, 0.091], [0.08 * s, 0.362, 0.089], 0.03, 0.008),
      strip([0.08 * s, 0.362, 0.089], [0.086 * s, 0.414, 0.046], 0.03, 0.008),
      strip([0.086 * s, 0.414, 0.046], [0.086 * s, 0.431, 0], 0.03, 0.008),
      strip([0.086 * s, 0.431, 0], [0.086 * s, 0.414, -0.046], 0.03, 0.008),
      strip([0.086 * s, 0.414, -0.046], [0.08 * s, 0.362, -0.089], 0.03, 0.008),
      strip([0.08 * s, 0.362, -0.089], [0.075 * s, 0.262, -0.091], 0.03, 0.008),
    ]).flat(),
  ])),
  // lab / kitchen apron: bib, skirt, pocket, waistband with a bow, neck strap
  apron: () => geo('apron', () => merge([
    part(lathe([[0.134, 0], [0.142, 0.12], [0.157, 0.22], [0.162, 0.30], [0.159, 0.335]], 8, -0.72, 1.44), { s: [1, 1, DEPTH] }),
    part(lathe([[0.158, -0.36], [0.15, -0.15], [0.136, 0.02]], 10, -1.25, 2.5), { s: [1, 1, 0.74] }),
    part(box(0.13, 0.075, 0.006), { p: [0, -0.13, 0.111], r: [0.04, 0, 0] }),
    part(cyl(0.134, 0.134, 0.026, 16, true), { p: [0, 0.02, 0], s: [1, 1, 0.71] }),
    ...both(s => part(sph(0.028, 8, 5), { p: [0.03 * s, 0.02, -0.097], s: [1, 0.6, 0.3], r: [0, 0, 0.35 * s] })),
    ...both(s => [
      strip([0.088 * s, 0.325, 0.094], [0.064 * s, 0.412, 0.062], 0.02, 0.006),
      strip([0.064 * s, 0.412, 0.062], [0.052 * s, 0.447, -0.01], 0.02, 0.006),
    ]).flat(),
  ])),
  // tie blade + knot (uv = metres, for the stripe texture). short = tucked into a pinafore
  tie: (short) => geo('tie' + (short ? 'S' : 'L'), () => {
    const pts = short
      ? [[-0.017, 0], [0.017, 0], [0.013, -0.03], [0.0185, -0.125], [-0.0185, -0.125], [-0.013, -0.03]]
      : [[-0.017, 0], [0.017, 0], [0.013, -0.03], [0.023, -0.215], [0, -0.25], [-0.023, -0.215], [-0.013, -0.03]];
    return new THREE.ShapeGeometry(new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))));
  }),
  tieKnot: () => geo('tieKnot', () => part(box(0.03, 0.03, 0.03), { p: [0, 0.403, 0.08], s: [1, 1, 1] })),
  // lanyard + ID card + pocket crest (vertex colours)
  idCard: (c, crest) => geo('id' + c + crest, () => merge([
    ...both(s => [
      strip([0.06 * s, 0.437, 0.05], [0.042 * s, 0.36, 0.103], 0.008, 0.003, c),
      strip([0.042 * s, 0.36, 0.103], [0.004 * s, 0.176, 0.118], 0.008, 0.003, c),
    ]).flat(),
    part(box(0.014, 0.014, 0.006), { p: [0, 0.174, 0.118], c: '#b9bec5' }),
    part(box(0.054, 0.072, 0.003), { p: [0, 0.134, 0.118], c: '#fbfbf8' }),
    part(box(0.054, 0.016, 0.0036), { p: [0, 0.162, 0.118], c }),
    part(box(0.02, 0.024, 0.0036), { p: [-0.012, 0.136, 0.118], c: '#c79a72' }),
    part(box(0.02, 0.01, 0.0038), { p: [-0.012, 0.149, 0.118], c: '#1b1512' }),
    part(box(0.02, 0.004, 0.0036), { p: [0.013, 0.143, 0.118], c: '#8a8f98' }),
    part(box(0.02, 0.004, 0.0036), { p: [0.013, 0.134, 0.118], c: '#8a8f98' }),
    part(box(0.036, 0.004, 0.0036), { p: [0, 0.109, 0.118], c: '#8a8f98' }),
    ...(crest ? [part(circ(0.012, 10), { p: [0.0735, 0.29, 0.0925], r: [0, 0.34, 0], c: '#e0b23c' }), part(circ(0.0065, 8), { p: [0.0737, 0.29, 0.0931], r: [0, 0.34, 0], c: '#1c2b4a' })] : []),
  ])),
  // rolled dupatta: U across the chest, both ends down the back (teacher's kurta)
  dupatta: () => geo('dupatta', () => {
    const P = [[0.1, 0.1, -0.085], [0.1, 0.38, -0.076], [0.105, 0.437, -0.005], [0.095, 0.405, 0.052], [0.06, 0.33, 0.105], [0, 0.30, 0.115],
      [-0.06, 0.33, 0.105], [-0.095, 0.405, 0.052], [-0.105, 0.437, -0.005], [-0.1, 0.38, -0.076], [-0.1, 0.1, -0.085]];
    return part(merge(tube(P.map(p => [p[0], p[1], p[2] / 0.45]), 0.03, 8)), { s: [1, 1, 0.45] });
  }),

  // ---------------- head (head frame: origin at the skull centre) ----------------
  headSkin: () => geo('headSkin', () => merge([
    part(sph(0.115, 16, 10), { s: [0.94, 1.06, 0.98] }),
    part(sph(0.085, 12, 7), { p: [0, -0.042, 0.012], s: [0.98, 1, 0.95] }),
    ...both(s => part(sph(0.024, 6, 5), { p: [0.108 * s, -0.005, -0.004], s: [0.45, 1, 0.7] })),
    part(sph(0.014, 6, 4), { p: [0, -0.022, 0.108], s: [0.9, 1.1, 1] }),
  ])),
  // eyes (white, iris, pupil, highlight, lash line), brows, smile; optional bindi
  face: (bindi) => geo('face' + (bindi ? 'B' : ''), () => {
    const eye = merge([
      part(sph(0.02, 8, 5), { s: [1, 1.08, 0.3], c: '#f6f3ec' }),
      part(circ(0.0115, 12), { p: [0, -0.001, 0.0062], c: '#3a2212' }),
      part(circ(0.0062, 10), { p: [0, -0.001, 0.0069], c: '#090909' }),
      part(circ(0.0032, 8), { p: [0.0045, 0.0042, 0.0076], c: '#ffffff' }),
      part(box(0.04, 0.003, 0.004), { p: [0, 0.02, 0.003], c: '#1d1410' }),
    ]);
    return merge([
      ...both(s => part(eye, { p: [0.043 * s, 0.004, 0.1], r: [0, 0.36 * s, 0] })),
      ...both(s => part(box(0.036, 0.006, 0.006), { p: [0.044 * s, 0.041, 0.0975], r: [0, 0.38 * s, -0.1 * s], c: '#17100c' })),
      part(tor(0.032, 0.003, 5, 8, 1.1), { p: [0, -0.03, 0.0985], r: [0, 0, -PI / 2 - 0.55], s: [1, 1, 0.8], c: '#6e2a26' }),
      ...(bindi ? [part(circ(0.0048, 8), { p: [0, 0.05, 0.1045], r: [-0.35, 0, 0], c: '#c2182b' })] : []),
    ]);
  }),
  hair: (style) => geo('hair-' + style, () => {
    const cap = part(sph(0.12, 14, 6, 0, PI * 2, 0, PI * 0.52), { s: [0.955, 1.06, 1], r: [-0.6, 0, 0] });
    const nape = part(sph(0.085, 10, 6), { p: [0, -0.045, -0.06], s: [1.05, 0.75, 0.6] });
    const burns = both(s => part(sph(0.018, 6, 5), { p: [0.104 * s, 0.014, 0.035], s: [0.4, 1.3, 0.9] }));
    const lobes = both(s => part(sph(0.07, 8, 5), { p: [0.052 * s, 0.085, -0.01], s: [0.82, 0.62, 1.15], r: [0, 0, -0.5 * s] }));
    const sides = both(s => part(sph(0.05, 8, 6), { p: [0.105 * s, 0.035, -0.03], s: [0.35, 1, 1] }));
    if (style === 'side') return merge([cap, nape, ...burns,
      part(sph(0.075, 12, 7), { p: [0.012, 0.108, 0.015], s: [1.25, 0.36, 1.15], r: [0, 0, -0.12] }),
      part(sph(0.045, 10, 6), { p: [0.03, 0.088, 0.083], s: [1.5, 0.5, 0.75], r: [0.35, 0.2, -0.25] }),
      part(sph(0.03, 8, 5), { p: [-0.055, 0.078, 0.068], s: [1.2, 0.5, 0.7], r: [0.4, -0.5, 0.3] })]);
    if (style === 'plaits') return merge([cap, ...lobes, ...sides,
      part(sph(0.085, 10, 6), { p: [0, -0.02, -0.06], s: [1.05, 0.9, 0.6] }),
      ...both(s => [0, 1, 2, 3].map(i => part(sph(0.023, 6, 4), { p: [(0.109 + 0.004 * (i % 2)) * s, -0.038 - 0.036 * i, -0.035 + (i % 2 ? 0.004 : -0.004)] }))).flat()]);
    if (style === 'ponytail') return merge([cap, ...sides,
      part(sph(0.085, 10, 6), { p: [0, 0, -0.07], s: [1.1, 1, 0.6] }),
      part(sph(0.04, 10, 6), { p: [0.02, 0.083, 0.08], s: [1.6, 0.42, 0.6], r: [0.45, 0.15, -0.2] }),
      part(sph(0.03, 8, 5), { p: [-0.055, 0.076, 0.068], s: [1.2, 0.5, 0.7], r: [0.4, -0.5, 0.3] }),
      part(sph(0.034, 8, 5), { p: [0, 0.04, -0.118] }),
      part(tcap(0.032, 0.015, 0.17, 8, false, 2), { p: [0, 0.036, -0.128], r: [0.2, 0, 0] })]);
    if (style === 'bob') return merge([cap,
      part(sph(0.128, 16, 6, PI / 2 + 0.95, PI * 2 - 1.9, PI * 0.2, PI * 0.52), { s: [0.97, 1, 1] }),
      ...both(s => part(tcap(0.03, 0.022, 0.115, 8, false, 2), { p: [0.103 * s, 0.05, 0.045], s: [0.65, 1, 1.25], r: [0, 0, 0.03 * s] })),
      part(sph(0.034, 8, 5), { p: [0, 0.08, 0.086], s: [1, 0.55, 0.5], r: [0.4, 0, 0] }),
      ...both(s => part(sph(0.034, 8, 5), { p: [0.045 * s, 0.076, 0.073], s: [1, 0.55, 0.5], r: [0.4, 0.45 * s, 0] }))]);
    if (style === 'bun') return merge([cap, nape, ...lobes, ...sides,
      part(sph(0.05, 12, 8), { p: [0, -0.015, -0.118], s: [1, 1, 0.85] })]);
    // 'crop'
    return merge([cap, nape, ...burns,
      part(sph(0.06, 10, 6), { p: [0, 0.106, 0.012], s: [1.5, 0.42, 1.5] }),
      part(sph(0.035, 8, 5), { p: [0, 0.08, 0.086], s: [1.1, 0.45, 0.6], r: [0.5, 0, 0] }),
      ...both(s => part(sph(0.035, 8, 5), { p: [0.047 * s, 0.073, 0.072], s: [1.1, 0.45, 0.6], r: [0.5, 0.45 * s, 0] }))]);
  }),
  // ribbons / scrunchie for the girls' styles (null when the style has none)
  ribbon: (style) => style === 'plaits' ? geo('rib-plaits', () => merge(both(s => [
    part(sph(0.024, 6, 4), { p: [0.119 * s, -0.022, -0.014], s: [0.3, 0.7, 1] }),
    part(sph(0.024, 6, 4), { p: [0.119 * s, -0.022, -0.056], s: [0.3, 0.7, 1] }),
    part(sph(0.011, 6, 4), { p: [0.121 * s, -0.022, -0.035] }),
    part(sph(0.019, 6, 4), { p: [0.11 * s, -0.158, -0.035], s: [1, 0.55, 1] }),
  ]).flat())) : style === 'ponytail' ? geo('rib-pony', () => part(tor(0.023, 0.01, 5, 10), { p: [0, 0.042, -0.117] })) : null,
  goggleFrame: () => geo('gogFrame', () => merge([
    ...both(s => part(part(tor(0.031, 0.0045, 4, 14), { s: [1.15, 1, 1.3] }), { p: [0.043 * s, 0.004, 0.116], r: [0, 0.3 * s, 0] })),
    part(box(0.03, 0.008, 0.008), { p: [0, 0.007, 0.121] }),
    ...both(s => strip([0.078 * s, 0.004, 0.106], [0.113 * s, 0.0041, 0.05], 0.02, 0.006)),
    part(tor(0.121, 0.005, 4, 14, 4.0), { s: [0.97, 1, 2.2], r: [PI / 2, 0, 2.712] }),
  ])),
  goggleLens: () => geo('gogLens', () => merge(both(s => part(part(cyl(0.03, 0.03, 0.008, 14), { r: [PI / 2, 0, 0], s: [1.15, 1, 1] }), { p: [0.043 * s, 0.004, 0.116], r: [0, 0.3 * s, 0] })))),
  headphones: () => geo('phones', () => merge([
    part(tor(0.14, 0.008, 5, 14, PI), { s: [1, 1.02, 1.8], c: '#23262b' }),
    ...both(s => [
      part(cyl(0.043, 0.043, 0.03, 12), { r: [0, 0, PI / 2], p: [0.134 * s, -0.012, 0], c: '#23262b' }),
      part(cyl(0.046, 0.046, 0.012, 12), { r: [0, 0, PI / 2], p: [0.121 * s, -0.012, 0], c: '#3b3f45' }),
      part(cyl(0.03, 0.03, 0.006, 12), { r: [0, 0, PI / 2], p: [0.151 * s, -0.012, 0], c: '#e5484d' }),
    ]).flat(),
    ...tube([[0.134, -0.03, 0.02], [0.112, -0.062, 0.08], [0.062, -0.07, 0.11]], 0.004, 5, '#23262b'),
    part(sph(0.01, 6, 4), { p: [0.062, -0.07, 0.11], c: '#3b3f45' }),
  ])),
  cap: () => geo('cap', () => merge([
    part(sph(0.124, 14, 6, 0, PI * 2, 0, PI / 2), { p: [0, 0.04, 0], s: [0.97, 0.85, 1.02] }),
    part(cyl(0.07, 0.07, 0.008, 12), { p: [0, 0.045, 0.12], s: [1.15, 1, 1], r: [0.12, 0, 0] }),
  ])),
};
