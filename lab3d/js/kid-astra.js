// Pose-compatible replacement for kid.js; metres, +z forward, standing soles at y=0.
// Options: seed, girl, trousers, skin, hair, shirt, pants, apron, tie, goggles,
// headphones, cap, scale, pose, act, label. No assets or network requests.
// Geometry, canvas printing, materials, and per-joint merged geometry are shared.
// The animation loop only updates existing transforms; it allocates no objects.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, tex } from './kit.js';

const SKIN = ['#945e40', '#b77d54', '#cd9367', '#78482f', '#ac704b', '#875438'];
const HAIR = ['#181514', '#211916', '#302019'];
const GEO = new Map(), PRINT = new Map(), BATCH = new Map();
const PI = Math.PI, HALF_PI = PI / 2;
const THIGH = 0.38, SHIN = 0.36, UPPER = 0.27, FORE = 0.24;
const HIP_OFFSET = 0.035, HIP_Y = THIGH + SHIN + 0.05 - HIP_OFFSET;
const NAMES = ['pelvis', 'torso', 'neck', 'head', 'lSh', 'lEl', 'lHand',
  'rSh', 'rEl', 'rHand', 'lHip', 'lKn', 'rHip', 'rKn'];

function geometry(key, create) {
  if (!GEO.has(key)) GEO.set(key, create());
  return GEO.get(key);
}
function group(parent, x = 0, y = 0, z = 0, name = '') {
  const g = new THREE.Group(); g.position.set(x, y, z); g.name = name;
  parent.add(g); return g;
}
function part(parent, geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.z = rz;
  m.castShadow = m.receiveShadow = true; m.userData.kid = true;
  parent.add(m); return m;
}
function oval(parent, mat, x, y, z, sx, sy, sz, rz = 0, seg = 8, rings = 6) {
  return part(parent, geometry(`sphere:${seg}:${rings}`, () =>
    new THREE.SphereGeometry(1, seg, rings)), mat, x, y, z, sx, sy, sz, rz);
}
function block(parent, mat, x, y, z, w, h, d, rz = 0) {
  return part(parent, geometry('box', () => new THREE.BoxGeometry(1, 1, 1)),
    mat, x, y, z, w, h, d, rz);
}
function disc(parent, mat, x, y, z, rx, ry = rx, seg = 12) {
  return part(parent, geometry(`disc:${seg}`, () => new THREE.CircleGeometry(1, seg)),
    mat, x, y, z, rx, ry, 1);
}
function turned(key, points, segments = 10) {
  return geometry(key, () => new THREE.LatheGeometry(points.map(p => new THREE.Vector2(...p)), segments));
}
function curve(parent, key, points, radius, mat, steps = 6, sides = 4) {
  return part(parent, geometry(key, () => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))),
    steps, radius, sides, false)), mat);
}
function flatShape(key, pts, depth = 0.002, bevel = 0.0008) {
  return geometry(key, () => {
    const s = new THREE.Shape();
    for (let i = 0; i < pts.length; i++) i ? s.lineTo(...pts[i]) : s.moveTo(...pts[i]);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth, steps: 1, bevelEnabled: bevel > 0,
      bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: 2 });
  });
}
function print(key, w, h, draw, transparent = false) {
  if (!PRINT.has(key)) PRINT.set(key, new THREE.MeshStandardMaterial({
    map: tex(w, h, draw), roughness: 0.8, transparent, depthWrite: !transparent,
    side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1,
  }));
  return PRINT.get(key);
}
function panel(parent, mat, x, y, z, w, h) {
  return part(parent, geometry('plane', () => new THREE.PlaneGeometry(1, 1)), mat,
    x, y, z, w, h, 1);
}

// Weld decorative meshes into material batches within each joint. Animated
// children (including eyes and the skirt) remain separate and fully poseable.
function batchTree(g) {
  const children = g.children.slice();
  for (let i = 0; i < children.length; i++) if (!children[i].isMesh) batchTree(children[i]);
  const buckets = new Map();
  for (let i = 0; i < children.length; i++) {
    const m = children[i]; if (!m.isMesh || m.userData.dynamicGeometry) continue;
    if (!buckets.has(m.material)) buckets.set(m.material, []);
    buckets.get(m.material).push(m);
  }
  for (const [mat, meshes] of buckets) {
    if (meshes.length < 2) continue;
    let key = '';
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].updateMatrix();
      key += meshes[i].geometry.uuid + ':' + meshes[i].matrix.elements.join(',') + ';';
    }
    if (!BATCH.has(key)) {
      const pieces = meshes.map(m => {
        const p = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        p.applyMatrix4(m.matrix); return p;
      });
      const merged = mergeGeometries(pieces, false);
      for (let i = 0; i < pieces.length; i++) pieces[i].dispose();
      merged.computeBoundingSphere(); BATCH.set(key, merged);
    }
    for (let i = 0; i < meshes.length; i++) g.remove(meshes[i]);
    part(g, BATCH.get(key), mat);
  }
}

// Ring loft with elliptical cross-sections. Soft shoulders, waist taper and
// trouser creases come from the silhouette, rather than stacked cylinders.
function loft(key, levels, segments = 12, pleats = 0, seated = false) {
  return geometry(key, () => {
    const p = [], uv = [], idx = [];
    for (let j = 0; j < levels.length; j++) {
      const [y, rx, rz] = levels[j], t = j / (levels.length - 1);
      for (let i = 0; i <= segments; i++) {
        const a = i / segments * PI * 2;
        const fold = 1 + pleats * (i % 2 ? -1 : 1);
        p.push(Math.sin(a) * rx * fold,
          seated ? 0.065 - 0.08 * t + 0.065 * Math.cos(a) * t : y,
          Math.cos(a) * rz * fold + (seated ? 0.28 * t : 0));
        uv.push(i / segments, 1 - t);
        if (j && i < segments) {
          const b = j * (segments + 1) + i, a0 = b - segments - 1;
          if (levels[levels.length - 1][0] > levels[0][0])
            idx.push(a0, a0 + 1, b, b, a0 + 1, b + 1);
          else idx.push(a0, b, a0 + 1, b, b + 1, a0 + 1);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  });
}

function scalp(style) {
  return geometry(`scalp:${style}`, () => {
    const p = [], uv = [], ids = [], n = 16, rings = 6;
    for (let j = 0; j <= rings; j++) for (let i = 0; i <= n; i++) {
      const a = i / n * 2 * PI, front = (Math.cos(a) + 1) / 2;
      const hairline = style === 'bob' ? 2.22 - 1.01 * front ** 5
        : 2.03 - 0.82 * front ** 2 + (style === 'part' ? 0.12 * Math.sin(a) * front : 0);
      const t = j / rings * hairline;
      const ridge = 1 + 0.018 * Math.cos(a * 7 + t * 2);
      p.push(Math.sin(a) * Math.sin(t) * 0.122 * ridge,
        Math.cos(t) * 0.14 + 0.011,
        Math.cos(a) * Math.sin(t) * 0.112 * ridge - 0.007);
      uv.push(i / n, j / rings);
      if (j && i < n) { const b = j * (n + 1) + i, a0 = b - n - 1;
        ids.push(a0, b, a0 + 1, b, b + 1, a0 + 1); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(ids); g.computeVertexNormals(); return g;
  });
}

function addHair(head, style, hair, ribbon, adult) {
  part(head, scalp(style), hair);
  // Directional overlapping locks describe the crop / part and a real hairline.
  if (style === 'crop') {
    for (let i = 0; i < 3; i++) oval(head, hair, -0.056 + i * 0.049,
      0.093 - i * 0.005, 0.077, 0.043, 0.027, 0.029, -0.2, 8, 4);
  } else {
    oval(head, hair, -0.026, 0.103, 0.072, 0.076, 0.028, 0.04, -0.28, 10, 5);
    oval(head, hair, 0.074, 0.075, 0.059, 0.035, 0.05, 0.033, 0.33, 8, 4);
    curve(head, 'hair-part-line', [[0.042,0.137,0.03],[0.052,0.123,0.064],
      [0.06,0.102,0.083]], 0.0018, M('#4b382b', { r: 0.9 }), 5, 3);
  }
  if (style === 'plaits') for (const s of [-1, 1]) {
    oval(head, hair, s * 0.099, -0.011, -0.035, 0.031, 0.077, 0.035, s * 0.17, 8, 4);
    for (let j = 0; j < 4; j++) oval(head, hair,
      s * (0.115 + (j % 2 ? 0.008 : -0.003)), -0.065 - j * 0.035,
      -0.018 + j * 0.009, 0.025 - j * 0.0028, 0.026, 0.019,
      s * (j % 2 ? 0.32 : -0.32), 8, 4);
    const x = s * 0.12, y = -0.196;
    oval(head, hair, x, y - 0.021, 0.01, 0.013, 0.027, 0.013, -s * 0.15, 6, 4);
    for (const d of [-1, 1]) oval(head, ribbon, x + d * 0.014, y, 0.027,
      0.017, 0.011, 0.006, d * 0.35, 6, 4);
    oval(head, ribbon, x, y, 0.03, 0.006, 0.007, 0.006, 0, 6, 4);
  }
  if (style === 'pony') {
    oval(head, hair, 0, 0.049, -0.123, 0.041, 0.043, 0.037, 0, 8, 5);
    const tail = oval(head, hair, 0, -0.036, -0.149,
      adult ? 0.039 : 0.034, 0.112, 0.036, -0.12, 10, 6);
    tail.rotation.x = -0.24;
    oval(head, ribbon, 0, 0.025, -0.143, 0.037, 0.01, 0.033, 0, 8, 4);
  }
  if (style === 'bob') for (const s of [-1, 1])
    oval(head, hair, s * 0.108, -0.011, -0.015, 0.023, 0.084, 0.076, s * 0.08, 8, 5);
}

function face(head, skin, hair, skinInner, blinkEyes) {
  const headGeo = geometry('head-sculpt', () => {
    const g = new THREE.SphereGeometry(1, 16, 12), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), chin = 1 - 0.19 * Math.max(0, -y);
      p.setXYZ(i, p.getX(i) * 0.113 * chin, y * 0.132,
        p.getZ(i) * 0.106 * (y < -0.5 ? 0.92 : 1));
    }
    g.computeVertexNormals(); return g;
  });
  part(head, headGeo, skin);
  const white = M('#fff8ec', { r: 0.45 }), iris = M('#68412a', { r: 0.42 });
  const pupil = M('#151d21', { r: 0.3 }), shine = M('#ffffff', { r: 0.15 });
  for (const s of [-1, 1]) {
    oval(head, skin, s * 0.108, -0.006, -0.002, 0.02, 0.029, 0.018);
    oval(head, skinInner, s * 0.119, -0.007, 0.011, 0.007, 0.015, 0.005, 0, 6, 4);
    const eye = group(head, s * 0.039, 0.013, 0.098, 'blink-eye');
    oval(eye, white, 0, 0, 0, 0.023, 0.015, 0.01, s * 0.04, 10, 6);
    disc(eye, iris, -s * 0.001, 0, 0.0102, 0.0088, 0.0098, 12);
    disc(eye, pupil, -s * 0.001, 0, 0.0105, 0.0048, 0.0062, 10);
    disc(eye, shine, -0.0035, 0.0037, 0.0108, 0.0026, 0.0026, 6);
    disc(eye, shine, 0.0025, -0.003, 0.0108, 0.0011, 0.0011, 5);
    blinkEyes.push(eye);
    curve(head, `brow:${s}`, [[s*0.018,0.042,0.103],[s*0.038,0.048,0.103],
      [s*0.06,0.041,0.094]], 0.0037, hair, 5, 4);
  }
  oval(head, skin, 0, -0.015, 0.102, 0.013, 0.018, 0.019, 0, 8, 6);
  const lips = M('#703e32', { r: 0.85 });
  curve(head, 'smile', [[-0.025,-0.045,0.095],[-0.014,-0.051,0.102],
    [0,-0.053,0.104],[0.014,-0.051,0.102],[0.025,-0.045,0.095]], 0.0022, lips, 8, 4);
  oval(head, skinInner, 0, -0.057, 0.1, 0.013, 0.0027, 0.003, 0, 8, 4);
}

function accessories(head, o, shirt) {
  const dark = M('#263441', { r: 0.6 }), blue = M('#3c7d98', { r: 0.42 });
  if (o.goggles) {
    const lens = M('#b6e2e7', { r: 0.12, o: 0.25, side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const ring = part(head, geometry('goggle-rim', () => new THREE.TorusGeometry(1,0.08,4,12)),
        blue, s*0.04,0.013,0.119,0.034,0.026,0.027);
      ring.rotation.y = s * 0.08;
      disc(head,lens,s*0.04,0.013,0.119,0.032,0.024,16);
    }
    curve(head,'goggle-bridge',[[-0.009,0.017,0.119],[0,0.024,0.123],[0.009,0.017,0.119]],0.003,blue,4,4);
    for(const s of [-1,1]) curve(head,`goggle-arm:${s}`,
      [[s*0.074,0.015,0.112],[s*0.116,0.014,0.04],[s*0.118,0.016,-0.048]],0.004,dark,5,4);
  }
  if (o.headphones) {
    curve(head,'headphone-band',[[-0.132,0.006,0],[ -0.132,0.101,0],
      [-0.086,0.17,0],[0,0.184,0],[0.086,0.17,0],[0.132,0.101,0],[0.132,0.006,0]],
    0.009,dark,12,5);
    for(const s of [-1,1]) {
      oval(head,M('#17212a',{r:0.95}),s*0.128,-0.008,0,0.018,0.042,0.037,0,8,6);
      oval(head,blue,s*0.141,-0.008,0,0.012,0.034,0.029,0,8,5);
    }
  }
  if(o.cap) {
    const capMat=typeof o.cap==='boolean'?shirt:M(o.cap,{r:0.85});
    part(head,turned('cap-crown',[[0.113,0.072],[0.114,0.104],[0.096,0.147],
      [0.06,0.167],[0,0.174]],12),capMat);
    oval(head,capMat,0,0.073,0.083,0.117,0.008,0.094,0,12,4);
  }
}

export function makeKid(o = {}) {
  const rawSeed = o.seed ?? Math.floor(Math.random() * 100);
  const seed = Number.isFinite(Number(rawSeed)) ? Math.abs(Math.trunc(Number(rawSeed))) : 0;
  const girl = o.girl ?? (seed % 2 === 1), k = o.scale ?? 1;
  const adult = k >= 1.1, kurta = adult && o.tie === false;
  const skirt = girl && !o.trousers && !kurta;
  const skin = M(o.skin ?? SKIN[seed % SKIN.length], { r: 0.72 });
  const skinInner = M(new THREE.Color(o.skin ?? SKIN[seed % SKIN.length]).multiplyScalar(0.8).getHex(), { r: 0.8 });
  const hair = M(o.hair ?? HAIR[seed % HAIR.length], { r: 0.83 });
  const shirt = M(o.shirt ?? (seed % 3 === 0 ? '#f3f1e6' : '#c9dfef'), { r: 0.85 });
  const pants = M(o.pants ?? '#23334e', { r: 0.87 });
  const sock = M('#f2f1e8', { r: 0.95 }), shoe = M('#20252b', { r: 0.43 });
  const sole = M('#101923', { r: 0.95 }), tie = M('#8c3442', { r: 0.8 });
  const root = new THREE.Group(); root.name = adult ? 'Teacher' : 'Student';
  root.userData.activity = o.label;
  const body = group(root); body.scale.setScalar(k);
  const pelvis = group(body, 0, HIP_Y, 0, 'pelvis');
  oval(pelvis,pants,0,0.031,0,0.135,0.051,0.086,0,12,6);
  const torso = group(pelvis, 0, 0.05, 0, 'torso');
  part(torso,loft('shirt-torso',[[0,0.125,0.078],[0.05,0.125,0.08],
    [0.20,0.137,0.088],[0.33,0.153,0.081],[0.38,0.139,0.071],
    [0.405,0.075,0.046]],12),shirt);
  // Close the shirt neckline with a softly sloping yoke.
  oval(torso,shirt,0,0.383,0,0.139,0.028,0.071,0,12,4);
  const beltMat = M('#263039', { r: 0.75 });
  part(torso,loft('belt',[[0.011,0.127,0.08],[0.03,0.127,0.08]],12),beltMat);
  block(torso,M('#b2b8b9',{m:0.5,r:0.4}),0,0.021,0.082,0.026,0.019,0.004);

  // Separate collar leaves sit proud of the shirt; a shallow centre placket.
  const collar = flatShape('collar-leaf',[[-0.005,0],[-0.052,0.008],[-0.068,-0.022],[-0.026,-0.055]]);
  part(torso,collar,sock,0,0.396,0.061);
  part(torso,flatShape('collar-right',[[0.005,0],[0.052,0.008],[0.068,-0.022],[0.026,-0.055]]),sock,0,0.396,0.061);
  block(torso,shirt,0,0.22,0.088,0.014,0.28,0.003);
  const seam = print('shirt-stitches',128,512,(c,w,h)=>{
    c.strokeStyle='#a5b7bf';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();
    c.moveTo(18,0);c.lineTo(18,h);c.moveTo(w-18,0);c.lineTo(w-18,h);c.stroke();
    c.setLineDash([]);c.fillStyle='#f4f4ef';c.strokeStyle='#8b9ba4';
    for(let y=45;y<h;y+=105){c.beginPath();c.arc(w/2,y,10,0,PI*2);c.fill();c.stroke();}
  },true);
  panel(torso,seam,0,0.215,0.0905,0.014,0.27);
  part(torso,flatShape('shirt-pocket',[[-0.026,0.022],[0.026,0.022],[0.024,-0.019],[0,-0.028],[-0.024,-0.019]]),
    shirt,0.082,0.275,0.076);
  block(torso,sock,0.082,0.296,0.081,0.049,0.003,0.002);

  if(o.tie!==false&&!o.apron) {
    part(torso,flatShape('tie-knot',[[-0.013,0.012],[0.013,0.012],[0.009,-0.012],[-0.008,-0.012]]),tie,0,0.352,0.083);
    const tieGeo=flatShape('tie-blade',[[-0.008,0.09],[0.008,0.09],[0.017,-0.07],[0,-0.09],[-0.017,-0.07]]);
    part(torso,tieGeo,tie,0,0.25,0.095);
    const stripes=print('tie-stripes',96,512,(c,w,h)=>{
      c.clearRect(0,0,w,h);c.strokeStyle='#dfc492';c.lineWidth=15;
      for(let y=-100;y<h+100;y+=100){c.beginPath();c.moveTo(0,y);c.lineTo(w,y-58);c.stroke();}
    },true);
    // A matching silhouette and UVs keep diagonal stripes inside the tie.
    const mapped=geometry('tie-print',()=>{
      const geo=tieGeo.clone(),uv=geo.attributes.uv,p=geo.attributes.position;
      for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+0.017)/0.034,(p.getY(i)+0.09)/0.18);
      return geo;
    });
    part(torso,mapped,stripes,0,0.25,0.0952);
  }

  let hem = null;
  const hemLevels=[[0.065,0.142,0.088],[0.015,0.151,0.094],[-0.12,0.183,0.115],[-0.225,0.202,0.13]];
  const skirtStand=skirt?loft('skirt-standing',hemLevels,16,0.035):null;
  const skirtSit=skirt?loft('skirt-seated',hemLevels,16,0.035,true):null;
  if(skirt){hem=part(pelvis,skirtStand,pants);hem.userData.dynamicGeometry=true;}
  if(kurta) {
    const kurtaGeo=loft('kurta-hem',[[0.065,0.135,0.086],[-0.02,0.145,0.09],[-0.18,0.159,0.1],[-0.23,0.165,0.103]],12);
    hem=part(pelvis,kurtaGeo,shirt);hem.userData.dynamicGeometry=true;
    block(torso,tie,0,0.295,0.091,0.018,0.18,0.003);
    for(let i=0;i<3;i++)disc(torso,M('#c7a05b',{m:0.35,r:0.5}),0,0.34-i*0.045,0.095,0.003,0.003,8);
  }
  let apronLower = null;
  if(o.apron) {
    const ap=M(typeof o.apron==='boolean'?'#e4dfcb':o.apron,{r:0.92});
    part(torso,flatShape('apron-bib',[[-0.067,0.35],[0.067,0.35],[0.1,0.03],[-0.1,0.03]],0.003,0.001),ap,0,0,0.097);
    apronLower=part(pelvis,flatShape('apron-skirt',[[-0.105,0.06],[0.105,0.06],[0.14,-0.21],[-0.14,-0.21]],0.003,0.001),ap,0,0,0.102);
    apronLower.userData.dynamicGeometry=true;
    for(const s of [-1,1])curve(torso,`apron-strap:${s}`,[[s*0.06,0.35,0.101],
      [s*0.055,0.415,0.035],[s*0.06,0.35,-0.071]],0.007,ap,5,4);
    block(torso,sock,0,0.078,0.104,0.215,0.012,0.004);
    part(torso,flatShape('apron-pocket',[[-0.057,0.027],[0.057,0.027],[0.054,-0.022],[-0.054,-0.022]],0.002,0),ap,0,0.155,0.103);
  }

  // An ID sits to one side of the tie; cords follow the curved chest.
  const lanyard=M('#376778',{r:0.85});
  for(const s of [-1,1])curve(torso,`lanyard:${s}`,[[s*0.049,0.397,0.053],
    [s*0.065,0.31,0.09],[0.048+s*0.018,0.194,0.107]],0.0025,lanyard,6,3);
  block(torso,sock,0.048,0.161,0.111,0.043,0.059,0.004);
  const idPrint=print(adult?'id-teacher':'id-student',192,256,(c,w,h)=>{
    c.fillStyle='#f5f3e9';c.fillRect(0,0,w,h);c.fillStyle='#376778';c.fillRect(0,0,w,40);
    c.fillStyle='#f5f3e9';c.textAlign='center';c.font='bold 22px Arial';c.fillText('SCHOOL',w/2,28);
    c.fillStyle='#bacbd0';c.fillRect(22,57,65,92);c.fillStyle='#6b818b';
    c.beginPath();c.arc(54,88,17,0,PI*2);c.fill();c.fillRect(31,110,46,32);
    c.fillStyle='#566a70';for(let i=0;i<4;i++)c.fillRect(105,67+i*22,65-i*6,5);
    c.font='bold 20px Arial';c.fillText(adult?'FACULTY':'STUDENT',w/2,189);
    for(let i=0;i<28;i++)c.fillRect(22+i*5,210,i%3===0?3:1,25);
  });
  panel(torso,idPrint,0.048,0.161,0.1132,0.04,0.056);
  block(torso,M('#aab4b8',{m:0.5,r:0.4}),0.048,0.193,0.111,0.008,0.012,0.003);

  const neck=group(torso,0,0.44,0,'neck');
  part(neck,turned('neck',[ [0.043,-0.041],[0.039,-0.015],[0.038,0.048],[0.045,0.066] ],10),skin);
  const head=group(neck,0,adult?0.125:0.145,0,'head');
  const appearance=group(head);appearance.scale.setScalar(adult?0.88:1);
  const blinkEyes=[];
  face(appearance,skin,hair,skinInner,blinkEyes);
  const style=girl?['plaits','pony','bob'][Math.floor(seed/2)%3]:['crop','part'][Math.floor(seed/2)%2];
  addHair(appearance,style,hair,tie,adult);accessories(appearance,o,shirt);

  function arm(s) {
    const sh=group(torso,s*0.151,0.37,0,s===1?'lSh':'rSh');
    oval(sh,shirt,0,-0.019,0,0.055,0.056,0.055);
    part(sh,turned('upper-arm',[[0.039,0],[0.041,-0.035],[0.033,-UPPER]],10),skin);
    part(sh,turned('shirt-sleeve',[[0.052,-0.015],[0.055,-0.06],[0.046,-0.143],[0.042,-0.15]],10),shirt);
    part(sh,turned('sleeve-cuff',[[0.046,-0.137],[0.046,-0.151]],10),sock);
    const el=group(sh,0,-UPPER,0,s===1?'lEl':'rEl');
    oval(el,skin,0,0,0,0.034,0.034,0.034);
    part(el,turned('forearm',[[0.032,0],[0.034,-0.04],[0.025,-FORE]],10),skin);
    const hand=group(el,0,-FORE-0.02,0,s===1?'lHand':'rHand');
    oval(hand,skin,0,0.016,0,0.025,0.028,0.023,0,8,5);
    oval(hand,skin,0,-0.013,0.006,0.031,0.043,0.026,0,8,6);
    oval(hand,skin,-s*0.028,-0.005,0.022,0.014,0.026,0.016,-s*0.48,6,5);
    // A thumb pad and palm recess leave the hand origin usable as a prop grip.
    return {sh,el,hand};
  }
  function leg(s) {
    const hip=group(pelvis,s*0.074,HIP_OFFSET,0,s===1?'lHip':'rHip');
    const legMat=skirt?skin:pants;
    oval(hip,legMat,0,0,0,0.061,0.061,0.06);
    part(hip,turned('thigh',[[0.06,0],[0.062,-0.05],[0.046,-THIGH]],10),legMat);
    const kn=group(hip,0,-THIGH,0,s===1?'lKn':'rKn');
    oval(kn,legMat,0,0,0,0.047,0.047,0.047);
    part(kn,turned('shin',[[0.044,0],[0.046,-0.085],[0.032,-SHIN]],10),legMat);
    part(kn,turned('sock',[[0.035,-0.245],[0.036,-0.258],[0.032,-0.365]],10),sock);
    // The sole is a rounded foot loft with a genuinely flat lower face.
    const soleGeo=geometry('shoe-sole',()=>{
      const shape=new THREE.Shape();shape.moveTo(-0.039,-0.043);shape.lineTo(-0.043,0.069);
      shape.quadraticCurveTo(-0.043,0.139,0,0.139);shape.quadraticCurveTo(0.043,0.139,0.043,0.069);
      shape.lineTo(0.039,-0.043);shape.quadraticCurveTo(0,-0.058,-0.039,-0.043);
      return new THREE.ExtrudeGeometry(shape,{depth:0.013,steps:1,bevelEnabled:false,curveSegments:3});
    });
    const bottom=part(kn,soleGeo,sole,0,-SHIN-0.037,0);bottom.rotation.x=HALF_PI;
    oval(kn,shoe,0,-SHIN-0.013,0.037,0.043,0.03,0.088,0,10,6);
    block(kn,shoe,0,-SHIN+0.006,0.021,0.065,0.013,0.035);
    for(let j=0;j<3;j++)block(kn,M('#515c65',{r:0.85}),0,-SHIN+0.014-j*0.002,0.018+j*0.012,0.043,0.002,0.002);
    return {hip,kn};
  }
  const L=arm(1), R=arm(-1), LL=leg(1), RL=leg(-1);
  const J={pelvis,torso,neck,head,lSh:L.sh,lEl:L.el,lHand:L.hand,
    rSh:R.sh,rEl:R.el,rHand:R.hand,lHip:LL.hip,lKn:LL.kn,rHip:RL.hip,rKn:RL.kn};
  const joints=NAMES.map(n=>J[n]);
  const base=Object.create(null);
  for(let i=0;i<NAMES.length;i++)base[NAMES[i]]={r:new THREE.Euler(),p:new THREE.Vector3()};
  const baseList=NAMES.map(n=>base[n]);
  const kid={root,J,pose:'stand',phase:((Math.imul(seed+1,16807)>>>0)%6283)/1000,
    act:o.act??'idle',k,base};

  kid.setPose=(p)=>{
    kid.pose=p;
    for(let i=0;i<joints.length;i++)joints[i].rotation.set(0,0,0);
    pelvis.position.set(0,HIP_Y,0);
    J.lSh.rotation.z=0.08;J.rSh.rotation.z=-0.08;
    if(hem){
      hem.rotation.x=0;hem.position.set(0,0,0);
      if(skirt)hem.geometry=p==='sit'?skirtSit:skirtStand;
      else if(p==='sit'){hem.rotation.x=-0.9;hem.position.z=0.035;}
    }
    if(apronLower){apronLower.rotation.x=p==='sit'?-1.12:0;apronLower.position.z=p==='sit'?0.13:0.102;}
    if(p==='sit'){
      pelvis.position.y=0.47/k;pelvis.position.z=-0.05;
      J.lHip.rotation.x=J.rHip.rotation.x=-1.42;J.lKn.rotation.x=J.rKn.rotation.x=1.42;
      J.lSh.rotation.x=J.rSh.rotation.x=-0.7;J.lEl.rotation.x=J.rEl.rotation.x=-1.05;
      J.lSh.rotation.z=0.12;J.rSh.rotation.z=-0.12;
      J.lSh.rotation.y=-0.35;J.rSh.rotation.y=0.35;
      J.lEl.rotation.y=-0.4;J.rEl.rotation.y=0.4;
      neck.rotation.x=0.35;torso.rotation.x=0.12;
    }else if(p==='kneel'){
      pelvis.position.y=THIGH+0.05-HIP_OFFSET;
      J.lKn.rotation.x=J.rKn.rotation.x=HALF_PI;
      torso.rotation.x=0.55;J.lSh.rotation.x=J.rSh.rotation.x=-0.6;neck.rotation.x=0.4;
    }else if(p==='reach'){
      J.rSh.rotation.x=-1.15;J.rEl.rotation.x=-0.3;J.lSh.rotation.x=-0.2;neck.rotation.x=0.25;
    }else if(p==='counter'){
      J.lSh.rotation.x=J.rSh.rotation.x=-0.75;J.lEl.rotation.x=J.rEl.rotation.x=-0.9;
      neck.rotation.x=0.35;J.lSh.rotation.z=0.2;J.rSh.rotation.z=-0.2;
    }else if(p==='point'){
      J.rSh.rotation.x=-1.4;J.rSh.rotation.z=-0.5;J.rEl.rotation.x=-0.15;neck.rotation.y=-0.4;
    }else if(p==='watch'){
      J.lSh.rotation.x=J.rSh.rotation.x=-0.3;J.lEl.rotation.x=J.rEl.rotation.x=-1.2;
      J.lSh.rotation.z=0.45;J.rSh.rotation.z=-0.45;neck.rotation.x=0.35;
    }
    for(let i=0;i<joints.length;i++){baseList[i].r.copy(joints[i].rotation);baseList[i].p.copy(joints[i].position);}
    return kid;
  };
  kid.update=(t)=>{
    const ph=t+kid.phase, s=Math.sin(ph*2.2),s2=Math.sin(ph*1.3),b=base;
    // Restore the captured pose so changing activities never leaves stale offsets.
    for(let i=0;i<joints.length;i++){joints[i].rotation.copy(baseList[i].r);joints[i].position.copy(baseList[i].p);}
    head.rotation.y=b.head.r.y+0.15*Math.sin(ph*0.5);
    if(kid.act==='build'){
      J.rSh.rotation.x=b.rSh.r.x+0.08*s;J.rEl.rotation.x=b.rEl.r.x+0.18*Math.sin(ph*3.1);
      J.lEl.rotation.x=b.lEl.r.x+0.1*s2;neck.rotation.x=b.neck.r.x+0.05*s2;
    }else if(kid.act==='cpr'){
      const c=Math.max(0,Math.sin(ph*9));torso.rotation.x=b.torso.r.x+0.08*c;pelvis.position.y=b.pelvis.p.y-0.01*c;
    }else if(kid.act==='water'){
      J.rSh.rotation.x=b.rSh.r.x+0.05*s2;J.rHand.rotation.x=0.4+0.25*Math.max(0,s2);
    }else if(kid.act==='stir'){
      J.rEl.rotation.x=b.rEl.r.x+0.15*Math.sin(ph*4);J.rSh.rotation.z=b.rSh.r.z+0.12*Math.cos(ph*4);
    }else if(kid.act==='type'){
      J.lHand.rotation.x=0.2*Math.sin(ph*14);J.rHand.rotation.x=0.2*Math.cos(ph*13);
    }else if(kid.act==='talk'){
      J.rSh.rotation.x=b.rSh.r.x+0.15*s2;neck.rotation.y=b.neck.r.y+0.2*Math.sin(ph*0.7);
    }else if(kid.act==='cheer'){
      J.lEl.rotation.x=b.lEl.r.x+0.2*Math.sin(ph*6);J.rEl.rotation.x=b.rEl.r.x-0.2*Math.sin(ph*6);
    }
    if(kid.pose==='stand'||kid.pose==='watch'||kid.pose==='reach'||kid.pose==='counter'||kid.pose==='point')
      torso.rotation.z=b.torso.r.z+0.015*Math.sin(ph*0.8);
    const cycle=((ph%5.9)+5.9)%5.9;
    const open=cycle<0.13?Math.max(0.06,Math.abs(cycle-0.065)/0.065):1;
    blinkEyes[0].scale.y=blinkEyes[1].scale.y=open;
  };
  kid.hold=(obj,hand='r')=>{(hand==='r'?J.rHand:J.lHand).add(obj);return obj;};
  kid.setPose(o.pose??'stand');
  batchTree(body);
  root.userData.kidObj=kid;
  return kid;
}
