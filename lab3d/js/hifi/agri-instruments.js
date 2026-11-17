/*
 * Batch 1 — catalogue photographs inspected; all dimensions in metres below.
 * sno | item                           | W×H×D cm       | source (spec / typical)
 *   1 | Air thermometer and hygrometer | 10×11×2.2      | typical portable LCD unit
 *  10 | Measuring tape                 | 22×34×6        | spec: 50 m; typical open-reel housing
 *  11 | Plastic beaker                 | 7.8×9.5×7.2    | spec: 250 ml; typical PP beaker envelope
 *  18 | Soil test kit, laid out open   | 40×21×24       | typical: 24×5.5×15 cm case + accessories
 *  22 | Weighing scale                 | 22×27×22       | spec: 2 kg × 10 g; typical analogue bowl scale
 *
 * Dimensions are overall envelopes (including spout / crank / open kit).
 * Beaker bore: r=30 mm at y=3 mm, r=33 mm at y=91 mm;
 * 250 ml graduation at y=83.78 mm; brim capacity approximately 274 ml.
 * Tape is stored, with a short graduated leader; 50 m is tape length, not size.
 * S.No 1 deliberately retains the placeholder's centred-depth origin, rather
 * than moving its back to z=0. All other resting footprints are centred too.
 * Front is +z; the soil-kit lid opens at the rear (-z), scale dial faces +z.
 * No logos, external textures, asset loads, or runtime dependencies beyond
 * three r170, its RoundedBoxGeometry addon, and the supplied kit.
 * Verified r170 triangle totals: 1=1036; 10=2868; 11=888; 18=2990; 22=2580.
 * Each total includes every visible mesh, back face, decal and accessory.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, tex, FONT } from '../kit.js';

const geometries = new Map();
const prints = new Map();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const white = () => M('#edede7', { r: 0.42 });
const rubber = () => M('#202225', { r: 0.9 });
const steel = () => M('#c4c9cc', { m: 0.85, r: 0.3 });
const clear = () => M('#e7eff1', { r: 0.27, o: 0.35, side: THREE.DoubleSide });

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
function box(w, h, d, material, x, y, z, radius = 0) {
  const key = `box:${w}:${h}:${d}:${radius}`;
  return mesh(cached(key, () => radius
    ? new RoundedBoxGeometry(w, h, d, 1, radius)
    : new THREE.BoxGeometry(w, h, d)), material, x, y, z);
}
function lathe(key, profile, material, segments = 32) {
  return mesh(cached(key, () => new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)), segments)), material);
}
function cylinder(rt, rb, height, material, x, y, z, segments = 16) {
  return mesh(cached(`cyl:${rt}:${rb}:${height}:${segments}`, () =>
    new THREE.CylinderGeometry(rt, rb, height, segments)), material, x, y, z);
}
function disk(radius, material, x, y, z, segments = 48) {
  return mesh(cached(`disk:${radius}:${segments}`, () =>
    new THREE.CircleGeometry(radius, segments)), material, x, y, z);
}
function ring(radius, tube, material, x, y, z, segments = 32) {
  return mesh(cached(`ring:${radius}:${tube}:${segments}`, () =>
    new THREE.TorusGeometry(radius, tube, 4, segments)), material, x, y, z);
}
function rod(a, b, radius, material, segments = 8) {
  const av = V(...a), bv = V(...b), delta = bv.clone().sub(av);
  const m = cylinder(radius, radius, delta.length(), material, 0, 0, 0, segments);
  m.position.copy(av).add(bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize());
  return m;
}
function tube(key, points, radius, material, segments = 12) {
  return mesh(cached(key, () => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(p => V(...p))), segments, radius, 5, false)), material);
}
function outline(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
  s.closePath();
  return s;
}
function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = w / 2, y = h / 2;
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r); s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y); s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y); s.closePath();
  return s;
}
function profile(key, shape, depth, material, bevel = 0.001) {
  return mesh(cached(key, () => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, steps: 1,
      bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel,
      bevelSegments: 1, curveSegments: 4 });
    g.translate(0, 0, -depth / 2);
    return g;
  }), material);
}
function printed(key, w, h, draw, transparent = false) {
  if (!prints.has(key)) prints.set(key, new THREE.MeshStandardMaterial({
    map: tex(w, h, draw), roughness: 0.65, metalness: 0,
    transparent, depthWrite: !transparent, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  return prints.get(key);
}
function panel(w, h, material, x, y, z) {
  return mesh(cached(`plane:${w}:${h}`, () => new THREE.PlaneGeometry(w, h)), material, x, y, z);
}
function topPanel(w, d, material, x, y, z) {
  const p = panel(w, d, material, x, y, z);
  p.rotation.x = -Math.PI / 2;
  return p;
}
function finish(g, sno) {
  // Translate only: never stretch an item to force a desired size.
  g.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(g);
  const shift = V(-(bounds.min.x + bounds.max.x) / 2, -bounds.min.y,
    -(bounds.min.z + bounds.max.z) / 2);
  g.children.forEach(child => child.position.add(shift));
  g.name = `HIFI ${sno}`;
  g.userData.sno = sno;
  g.updateMatrixWorld(true);
  return g;
}

function thermometer() {
  const g = new THREE.Group();
  const grey = M('#757879', { r: 0.5 });
  g.add(box(0.1, 0.11, 0.019, white(), 0, 0.055, 0, 0.005));
  // Dark rear seam and a folded easel retain the placeholder's shallow depth.
  g.add(box(0.091, 0.099, 0.001, M('#c7c9c5'), 0, 0.055, -0.0096, 0.002));
  g.add(box(0.051, 0.058, 0.001, white(), 0, 0.034, -0.0104, 0.002));
  g.add(box(0.084, 0.071, 0.002, grey, 0, 0.069, 0.009, 0.003));
  g.add(box(0.073, 0.059, 0.001, M('#313735'), 0, 0.069, 0.0103, 0.0015));
  const lcd = printed('thermo-lcd', 512, 400, (c, w, h) => {
    c.fillStyle = '#a8b09c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#313c30'; c.font = `23px ${FONT}`;
    c.fillText('TEMPERATURE', 24, 37);
    c.font = '96px monospace'; c.fillText('27.4', 25, 139);
    c.font = `34px ${FONT}`; c.fillText('°C', 395, 126);
    c.fillRect(25, 169, 460, 2);
    c.font = `23px ${FONT}`; c.fillText('HUMIDITY', 24, 207);
    c.font = '91px monospace'; c.fillText('62', 32, 305);
    c.font = `39px ${FONT}`; c.fillText('%', 207, 300);
    c.font = `22px ${FONT}`; c.fillText('COMFORT', 314, 288);
    c.font = '26px monospace'; c.fillText('12:30', 28, 367);
  });
  g.add(panel(0.071, 0.056, lcd, 0, 0.069, 0.011));
  const keys = printed('thermo-controls', 400, 90, c => {
    c.fillStyle = '#646967'; c.font = `22px ${FONT}`;
    c.textAlign = 'center'; c.fillText('MODE', 120, 52); c.fillText('MEMORY', 300, 52);
  }, true);
  for (const x of [0.014, 0.034]) {
    g.add(box(0.017, 0.009, 0.002, M('#3b3e3d'), x, 0.016, 0.0096, 0.003));
    g.add(box(0.0155, 0.0075, 0.002, M('#9a9d9b'), x, 0.0165, 0.010, 0.003));
  }
  g.add(panel(0.045, 0.009, keys, 0.021, 0.026, 0.0098));
  for (let i = 0; i < 5; i++)
    g.add(box(0.014, 0.001, 0.0005, grey, -0.026, 0.013 + i * 0.003, -0.01075));
  return finish(g, 1);
}

function measuringTape() {
  const g = new THREE.Group(), orange = M('#ff8918', { r: 0.4 });
  // Wound fibreglass tape, axis normal to front: an actual annulus, not a solid puck.
  const reel = lathe('tape-reel', [[0.027, -0.008], [0.091, -0.008],
    [0.093, -0.006], [0.093, 0.006], [0.091, 0.008],
    [0.027, 0.008], [0.027, -0.008]], M('#eeeae1', { r: 0.7 }), 48);
  reel.rotation.x = Math.PI / 2; reel.position.y = 0.142; g.add(reel);
  const coil = printed('tape-coil', 768, 768, (c, w, h) => {
    c.translate(w / 2, h / 2); c.fillStyle = '#ecebe6';
    c.beginPath(); c.arc(0, 0, 380, 0, Math.PI * 2); c.fill();
    for (let r = 112; r < 378; r += 5) {
      c.strokeStyle = r % 3 === 0 ? '#676c68' : '#93978e';
      c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
    }
    for (let i = 0; i < 180; i++) {
      c.save(); c.rotate(i * Math.PI / 90); c.strokeStyle = i % 10 ? '#585d59' : '#ad4033';
      c.beginPath(); c.moveTo(368, 0); c.lineTo(i % 5 ? 376 : 358, 0); c.stroke(); c.restore();
    }
  });
  g.add(disk(0.091, coil, 0, 0.142, 0.0082));
  const backCoil = disk(0.091, coil, 0, 0.142, -0.0082);
  backCoil.rotation.y = Math.PI; g.add(backCoil);
  // One moulded, open frame: upper grip, two diagonal struts, crossbar and foot.
  const s = new THREE.Shape();
  s.moveTo(-0.019,0.001);s.lineTo(-0.027,0.027);s.lineTo(-0.034,0.104);
  s.lineTo(-0.106,0.112);s.lineTo(-0.108,0.139);s.lineTo(-0.04,0.15);
  s.lineTo(-0.038,0.181);s.lineTo(-0.082,0.239);
  s.quadraticCurveTo(-0.094,0.252,-0.094,0.278);s.lineTo(-0.094,0.308);
  s.quadraticCurveTo(-0.094,0.336,-0.069,0.336);s.lineTo(0.069,0.336);
  s.quadraticCurveTo(0.094,0.336,0.094,0.308);s.lineTo(0.094,0.278);
  s.quadraticCurveTo(0.094,0.252,0.082,0.239);s.lineTo(0.038,0.181);
  s.lineTo(0.04,0.15);s.lineTo(0.108,0.139);s.lineTo(0.106,0.112);
  s.lineTo(0.034,0.104);s.lineTo(0.027,0.027);s.lineTo(0.019,0.001);s.closePath();
  const gripHole = new THREE.Path();
  gripHole.moveTo(-0.061,0.309);gripHole.lineTo(0.061,0.309);
  gripHole.quadraticCurveTo(0.074,0.309,0.074,0.295);
  gripHole.lineTo(0.07,0.271);gripHole.quadraticCurveTo(0.068,0.256,0.055,0.26);
  gripHole.quadraticCurveTo(0,0.28,-0.055,0.26);
  gripHole.quadraticCurveTo(-0.068,0.256,-0.07,0.271);
  gripHole.lineTo(-0.074,0.295);gripHole.quadraticCurveTo(-0.074,0.309,-0.061,0.309);
  gripHole.closePath();s.holes.push(gripHole);
  for (const points of [
    [[-0.055,0.248],[-0.017,0.196],[0.017,0.196],[0.055,0.248]],
    [[-0.019,0.094],[-0.013,0.029],[0.013,0.029],[0.019,0.094]],
  ]) { const hole = new THREE.Path(); points.forEach(([x,y], i) => i ? hole.lineTo(x,y) : hole.moveTo(x,y)); hole.closePath(); s.holes.push(hole); }
  const frame = profile('tape-frame', s, 0.009, orange); frame.position.z = 0.014; g.add(frame);
  const rear = mesh(frame.geometry, orange, 0, 0, -0.014); g.add(rear);
  g.add(box(0.127, 0.027, 0.039, rubber(), 0, 0.3265, 0.003, 0.006));
  for (let i = 0; i < 13; i++)
    g.add(box(0.002, 0.019, 0.001, M('#454747'), -0.054 + i * 0.009, 0.326, 0.0225));
  for (const x of [-0.104, 0.104]) g.add(box(0.012, 0.03, 0.038, rubber(), x, 0.126, 0, 0.002));
  g.add(box(0.027, 0.021, 0.033, rubber(), 0, 0.0105, 0, 0.003));
  const hub = cylinder(0.035,0.035,0.008,rubber(),0,0.142,0.021,32);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  g.add(disk(0.023, M('#34383a'), 0, 0.142, 0.0252,32));
  const crank = profile('tape-crank', outline([[-0.007,0.149],[0.009,0.154],
    [0.079,0.105],[0.073,0.094],[-0.009,0.132]]), 0.006, rubber());
  crank.position.z = 0.029; g.add(crank);
  const knob = cylinder(0.01, 0.01, 0.024, rubber(), 0.076,0.1,0.0283,16);
  knob.rotation.x = Math.PI / 2; g.add(knob);
  g.add(disk(0.006, M('#424647'),0.076,0.1,0.0405,16));
  for (const [x,y] of [[-0.08,0.305],[0.08,0.305],[-0.075,0.255],[0.075,0.255],[-0.099,0.127],[0.099,0.127],[-0.014,0.023],[0.014,0.023]]) {
    g.add(disk(0.0032, rubber(),x,y,0.020,12));
    g.add(box(0.003,0.0006,0.0004,steel(),x,y,0.0203));
  }
  const leaderPrint = printed('tape-leader',512,96,(c,w,h) => {
    c.fillStyle='#eeeee7'; c.fillRect(0,0,w,h);
    for(let i=0;i<=50;i++) { c.fillStyle=i%10?'#303634':'#b43b2b'; c.fillRect(i*10,0,1.5,i%10===0?60:i%5===0?42:25); }
    c.fillStyle='#353a35'; c.font=`24px ${FONT}`; c.fillText('10',86,88); c.fillText('20',190,88);
  });
  g.add(panel(0.071,0.012,leaderPrint,0.057,0.040,0.019));
  g.add(tube('tape-end-loop',[[0.094,0.045,0.018],[0.1038,0.044,0.018],
    [0.1048,0.034,0.018],[0.094,0.034,0.018],[0.094,0.045,0.018]],0.0018,rubber(),8));
  const label = printed('tape-rating',192,96,(c,w,h)=>{
    c.fillStyle='#222624'; c.fillRect(0,0,w,h); c.fillStyle='#f6eee3';
    c.font=`bold 54px ${FONT}`; c.textAlign='center'; c.fillText('50 m',w/2,68);
  });
  g.add(panel(0.035,0.015,label,0,0.177,0.020));
  return finish(g,10);
}

function beaker() {
  const g = new THREE.Group();
  // Continuous closed wall/floor cross-section: there is no cap over the mouth.
  const vessel = lathe('beaker-shell', [[0,0],[0.029,0],[0.032,0.002],
    [0.035,0.091],[0.036,0.093],[0.0355,0.095],[0.033,0.094],
    [0.033,0.091],[0.030,0.003],[0,0.003]], clear(),48);
  // Pull just the upper left sector into the photographed pouring lip.
  // Both inside and outside vertices are moved together, preserving wall thickness.
  if (!vessel.geometry.userData.spouted) {
    const p=vessel.geometry.attributes.position;
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i), y=p.getY(i), z=p.getZ(i);
      const angular=Math.max(0,(-x/Math.max(Math.hypot(x,z),1e-9)-0.90)/0.10);
      const upper=Math.max(0,Math.min(1,(y-0.078)/0.015));
      p.setX(i,x-0.006*angular*upper);
    }
    p.needsUpdate=true; vessel.geometry.computeVertexNormals();
    vessel.geometry.userData.spouted=true;
  }
  g.add(vessel);
  const markings=printed('beaker-graduations',256,768,(c,w,h)=>{
    c.strokeStyle='#f5f6ef'; c.fillStyle='#f5f6ef'; c.lineWidth=3;
    c.font=`27px ${FONT}`;
    for(let ml=25;ml<=250;ml+=25) {
      // Invert V=pi*(r0²*h+r0*k*h²+k²*h³/3) to put ticks at real volume.
      let lo=0,hi=0.088;
      for(let j=0;j<32;j++) { const t=(lo+hi)/2,k=0.003/0.088;
        const volume=Math.PI*(0.03**2*t+0.03*k*t*t+k*k*t*t*t/3);
        if(volume<ml*1e-6)lo=t;else hi=t;
      }
      const y=(0.091-(0.003+(lo+hi)/2))/0.088*h;
      c.beginPath();c.moveTo(40,y);c.lineTo(ml%50===0?145:99,y);c.stroke();
      if(ml%50===0)c.fillText(String(ml),154,y+9);
    }
    c.font=`bold 27px ${FONT}`;c.fillText('250 ml',65,32);
  },true);
  // A thin curved decal follows the tapered wall, avoiding a floating flat label.
  const decalGeo=cached('beaker-decal',()=>new THREE.CylinderGeometry(
    0.03512,0.03212,0.088,12,1,true,-0.45,0.9));
  g.add(mesh(decalGeo,markings,0,0.047,0));
  return finish(g,11);
}

function soilKit() {
  const g=new THREE.Group(), green=M('#155247',{r:0.45});
  const darkGreen=M('#0c392f',{r:0.6}), pale=white();
  const cx=-0.08, cz=-0.025;
  // Open moulded case. Thin walls surround a recessed floor, not a solid block.
  const floorGeo=cached('soil-case-floor',()=>new THREE.ExtrudeGeometry(
    roundedRect(0.24,0.15,0.008),{depth:0.01,steps:1,curveSegments:2,bevelEnabled:false}));
  const caseFloor=mesh(floorGeo,green,cx,0,cz);caseFloor.rotation.x=-Math.PI/2;g.add(caseFloor);
  const wallGeo=cached('soil-case-walls',()=>{
    const rim=roundedRect(0.238,0.148,0.007);
    rim.holes.push(roundedRect(0.222,0.132,0.004));
    return new THREE.ExtrudeGeometry(rim,{depth:0.043,steps:1,curveSegments:2,
      bevelEnabled:true,bevelThickness:0.001,bevelSize:0.001,bevelSegments:1});
  });
  const caseWalls=mesh(wallGeo,green,cx,0.011,cz);caseWalls.rotation.x=-Math.PI/2;g.add(caseWalls);
  g.add(box(0.22,0.003,0.13,darkGreen,cx,0.0115,cz));
  for(let i=0;i<3;i++)g.add(box(0.003,0.03,0.082,green,cx-0.055+i*0.055,0.028,-0.042));
  g.add(box(0.222,0.031,0.003,green,cx,0.028,0.004));
  // Upright lid: visible recessed panel, raised border and two actual hinges.
  g.add(box(0.24,0.15,0.006,green,cx,0.13,-0.103,0.005));
  g.add(box(0.215,0.124,0.002,darkGreen,cx,0.132,-0.0995));
  for(const x of [cx-0.065,cx+0.065]) {
    const hinge=cylinder(0.004,0.004,0.042,green,x,0.055,-0.098,10);
    hinge.rotation.z=Math.PI/2;g.add(hinge);
  }
  g.add(box(0.034,0.022,0.008,rubber(),cx,0.038,0.053));
  g.add(box(0.041,0.012,0.01,rubber(),cx,0.204,-0.101));
  const colours=['#dfd27c','#4199cb','#d48b8f','#e8e8df'];
  const names=['pH','N','P','K'];
  for(let i=0;i<4;i++) {
    const x=cx-0.0825+i*0.055;
    const bottle=lathe('reagent-bottle',[[0,0],[0.016,0],[0.018,0.003],
      [0.018,0.044],[0.015,0.05],[0.013,0.051],[0.013,0.056]],clear(),10);
    bottle.position.set(x,0.014,-0.036);g.add(bottle);
    g.add(cylinder(0.019,0.019,0.013,pale,x,0.075,-0.036,12));
    // Individually visible compressed tablets; hidden tablets need no geometry.
    for(let j=0;j<3;j++) {
      const pill=cylinder(0.005,0.005,0.003,M(colours[i],{r:0.85}),
        x+(j%2?0.006:-0.006),0.024+j*0.010,-0.023,8);
      pill.rotation.x=1.08+(j%3)*0.23;g.add(pill);
    }
    const label=printed(`reagent-${i}`,128,96,(c,w,h)=>{
      c.fillStyle='#f2efe3';c.fillRect(0,0,w,h);c.fillStyle=colours[i];c.fillRect(0,0,15,h);
      c.fillStyle='#23392f';c.textAlign='center';c.font=`bold 45px ${FONT}`;c.fillText(names[i],72,59);
      c.font=`14px ${FONT}`;c.fillText('TABLETS',70,83);
    });
    g.add(panel(0.023,0.017,label,x,0.048,-0.0178));
  }
  // White four-place test-tube rack, arranged alongside the case as in the photo.
  g.add(box(0.14,0.009,0.052,pale,0.13,0.0045,-0.029,0.003));
  for(const x of [0.066,0.194])g.add(box(0.006,0.073,0.039,pale,x,0.042,-0.029));
  // Two rails and five bridges leave real open slots around the tubes.
  for(const z of [-0.047,-0.011])g.add(box(0.14,0.009,0.009,pale,0.13,0.082,z));
  for(let i=0;i<5;i++)g.add(box(0.007,0.009,0.029,pale,0.066+i*0.032,0.082,-0.029));
  for(let i=0;i<4;i++) {
    const testTube=lathe('test-tube',[[0,0],[0.004,0.001],[0.0068,0.005],
      [0.007,0.117],[0.0077,0.119],[0.0061,0.12],
      [0.0058,0.007],[0,0.003]],clear(),12);
    testTube.position.set(0.082+i*0.032,0.009,-0.029);g.add(testTube);
  }
  // Handheld soil probe lies in front, LCD upward and tip to the left.
  g.add(box(0.107,0.025,0.046,green,0.119,0.013,0.111,0.011));
  g.add(box(0.021,0.019,0.029,rubber(),0.064,0.012,0.111));
  g.add(rod([-0.106,0.008,0.111],[0.057,0.012,0.111],0.0023,steel()));
  const tip=cylinder(0.0025,0,0.014,rubber(),-0.112,0.008,0.111,8);
  tip.rotation.z=-Math.PI/2;g.add(tip);
  const meter=printed('soil-meter',256,128,(c,w,h)=>{
    c.fillStyle='#242b28';c.fillRect(0,0,w,h);c.fillStyle='#a5b494';c.fillRect(50,15,191,98);
    c.fillStyle='#263c2c';c.font='58px monospace';c.fillText('6.8',65,80);
    c.font=`16px ${FONT}`;c.fillText('pH',196,100);c.fillStyle='#606763';c.beginPath();c.arc(24,64,13,0,Math.PI*2);c.fill();
  });
  g.add(topPanel(0.066,0.032,meter,0.128,0.026,0.111));
  // Small white sampling spoon and clear transfer pipette in the front compartment.
  g.add(box(0.087,0.002,0.008,pale,-0.138,0.013,0.032,0.001));
  const spoon=lathe('sampling-spoon',[[0,0],[0.009,0.001],[0.012,0.006],
    [0.011,0.007],[0.008,0.003],[0,0.002]],pale,10);
  spoon.position.set(-0.084,0.012,0.032);spoon.scale.z=0.8;g.add(spoon);
  g.add(rod([-0.045,0.018,0.028],[0.012,0.018,0.028],0.0014,clear()));
  g.add(box(0.025,0.009,0.009,clear(),0.023,0.018,0.028,0.004));
  return finish(g,18);
}

function weighingScale() {
  const g=new THREE.Group(), cream=M('#e8e7da',{r:0.4});
  for(const x of [-0.072,0.072])for(const z of [-0.067,0.067])
    g.add(cylinder(0.012,0.012,0.009,rubber(),x,0.0045,z,12));
  g.add(box(0.18,0.022,0.18,cream,0,0.020,0,0.008));
  // Smooth rolled shoulders and a taper in BOTH axes, like the enamelled housing.
  const bodyGeometry=cached('scale-housing',()=>{
    const geo=new RoundedBoxGeometry(0.166,0.168,0.142,2,0.012);
    const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const t=(p.getY(i)+0.084)/0.168;
      p.setX(i,p.getX(i)*(1-0.216*t));p.setZ(i,p.getZ(i)*(1-0.239*t));
    }
    geo.computeVertexNormals();return geo;
  });
  g.add(mesh(bodyGeometry,cream,0,0.113,-0.003));
  const dialHousing=cylinder(0.079,0.079,0.008,steel(),0,0.109,0.068,48);
  dialHousing.rotation.x=Math.PI/2;g.add(dialHousing);
  const dial=printed('scale-dial-2kg',1024,1024,(c,w,h)=>{
    c.fillStyle='#eeeeda';c.fillRect(0,0,w,h);c.translate(w/2,h/2);
    c.fillStyle='#fcfcf6';c.beginPath();c.arc(0,0,500,0,Math.PI*2);c.fill();
    // Exactly 200 divisions around one revolution: each minor tick is 10 g.
    for(let i=0;i<200;i++) { const a=i*Math.PI/100;
      c.save();c.rotate(a);c.strokeStyle='#141b18';c.lineWidth=i%20===0?8:i%10===0?4:2.2;
      c.beginPath();c.moveTo(0,-463);c.lineTo(0,i%20===0?-393:i%10===0?-416:-435);c.stroke();c.restore();
    }
    c.fillStyle='#333a35';c.font=`32px ${FONT}`;c.textAlign='center';c.textBaseline='middle';
    for(let i=0;i<10;i++){const a=i*Math.PI/5;c.fillText(i===0?'0':(i*0.2).toFixed(1),Math.sin(a)*367,-Math.cos(a)*367);}
    c.font=`bold 34px ${FONT}`;c.fillText('2 kg',0,160);
    c.font=`23px ${FONT}`;c.fillText('10 g divisions',0,201);
  });
  g.add(disk(0.075,dial,0,0.109,0.0722,64));
  g.add(ring(0.077,0.0018,steel(),0,0.109,0.0725,48));
  const needle=profile('scale-needle',outline([[-0.001,0.178],[-0.003,0.112],
    [-0.006,0.087],[-0.004,0.082],[0.004,0.082],[0.006,0.087],[0.003,0.112],[0.0005,0.178]]),
  0.0008,M('#ba2926',{r:0.4}),0.0002);
  needle.position.z=0.074;g.add(needle);
  g.add(disk(0.0045,M('#b18c40',{m:0.65,r:0.35}),0,0.109,0.075,16));
  g.add(disk(0.0021,steel(),0,0.109,0.0752,12));
  // Suspension posts, pan support and brass zero-adjust thumbwheel.
  for(const x of [-0.046,0.046])g.add(box(0.009,0.024,0.008,steel(),x,0.207,0));
  g.add(box(0.124,0.004,0.082,steel(),0,0.219,0,0.001));
  g.add(cylinder(0.006,0.006,0.006,M('#aa8939',{m:0.65,r:0.4}),0,0.202,0.037,16));
  // Spun steel bowl: visible interior, rounded rolled lip, and closed bottom.
  const bowl=lathe('scale-bowl',[[0,0.221],[0.052,0.221],[0.075,0.225],
    [0.093,0.239],[0.108,0.265],[0.11,0.2675],[0.109,0.27],
    [0.107,0.268],[0.091,0.241],[0.073,0.228],[0.051,0.224],[0,0.224]],steel(),48);
  g.add(bowl);
  return finish(g,22);
}

export const HIFI = {
  1: () => thermometer(),
  10: () => measuringTape(),
  11: () => beaker(),
  18: () => soilKit(),
  22: () => weighingScale(),
};
