/*
 * Batch 16 — general equipment and safety. Metres; fronts face +z.
 * sno | item                     | W×H×D cm          | source (spec / typical)
 *  83 | Student worktable        | 121.92×74×182.88   | spec: 6×4 ft; typical 74 cm height
 *  86 | Adjustable teacher chair | 65×110×65          | typical cushioned office task chair
 *  87 | Steel storage cupboard   | 91×198×48          | typical Indian two-door steel cupboard
 *  88 | Pegboard with hooks      | 121.92×91.44×8.2   | spec: 4×3 ft; typical hook projection
 *  89 | Rack of 20 storage bins  | 99×160×40          | spec: 20 bins; typical 22×22×36 cm bins
 *  91 | Three-antenna router     | 22×19.3×14.2       | typical desktop router; placeholder pose
 *  94 | First-aid cabinet        | 36×28×12.8         | typical wall cabinet, closed and stocked
 *  96 | Two sand buckets / stand| 80×122×38          | typical stand; buckets Ø26×28 cm
 *  97 | Safety gloves in tray    | 36×23.3×26         | typical 23 cm gloves; placeholder tray pose
 *  98 | Seven aprons on rail     | 140×84×10.4        | typical 80 cm hanging aprons, sides folded
 *  99 | Four goggles in tray     | 36×20.1×26         | typical 15.4×5.6×8 cm goggles
 *
 * Every catalogue record above is src:"proposal", img:null. No associated
 * photo exists in ../catalogue. Shapes/colours are therefore assumptions
 * based on specs and the existing placeholders, not claimed photo matches.
 * Dimensions are whole displayed assemblies, not purchase quantities.
 * Worktable keeps the placeholder's short x / long z orientation.
 * Wall anchors are intentionally NOT auto-centred: pegboard's panel centre
 * is y=0, z=0 (back z=-.006); router's base is y=0, z=0 (back -.07);
 * first-aid base is y=0, z=0 (back -.06); apron rail bottom y=1.55, z=0
 * (back -.02). Those offsets match models.js, including apron floor datum.
 * All other assemblies are bottom-centred by translation, never scaling.
 * Gloves/goggles retain the placeholder's bench storage trays. Aprons are
 * adult garments with their side panels folded behind to fit seven hooks.
 * Geometry and canvas materials are reused between duplicate parts/builds.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, tex, FONT, at } from '../kit.js';

const geo = new Map(), inks = new Map();
const V = (...v) => new THREE.Vector3(...v);
const steel = () => M('#bac2c7', { m: 0.72, r: 0.31 });
const dark = () => M('#282e33', { r: 0.87 });
const white = () => M('#eeeee8', { r: 0.43 });
const frame = () => M('#49545c', { m: 0.55, r: 0.42 });
function cache(k, fn) { if (!geo.has(k)) geo.set(k, fn()); return geo.get(k); }
function mesh(g, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true; return o;
}
function box(w, h, d, m, x = 0, y = 0, z = 0, r = 0) {
  return mesh(cache(`b:${w}:${h}:${d}:${r}`, () => r
    ? new RoundedBoxGeometry(w, h, d, 1, r) : new THREE.BoxGeometry(w, h, d)), m, x, y, z);
}
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, n = 12) {
  return mesh(cache(`c:${rt}:${rb}:${h}:${n}`, () => new THREE.CylinderGeometry(rt, rb, h, n)), m, x, y, z);
}
function rod(a, b, r, m, n = 8) {
  const p = V(...a), q = V(...b), o = cyl(r, r, p.distanceTo(q), m, 0, 0, 0, n);
  o.position.copy(p).add(q).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), q.sub(p).normalize()); return o;
}
function tube(k, points, r, m, steps = 12, sides = 5, closed = false) {
  return mesh(cache(k, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(
    points.map(p => V(...p)), closed, 'centripetal'), steps, r, sides, closed)), m);
}
function lathe(k, points, m, n = 32) {
  return mesh(cache(k, () => new THREE.LatheGeometry(points.map(p => new THREE.Vector2(...p)), n)), m);
}
function shape(points) {
  const s = new THREE.Shape(); points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
  s.closePath(); return s;
}
function extrude(k, s, d, m, bevel = 0.0007, curves = 3) {
  return mesh(cache(k, () => {
    const g = new THREE.ExtrudeGeometry(s, { depth: d, steps: 1, curveSegments: curves,
      bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1 });
    g.translate(0, 0, -d / 2); return g;
  }), m);
}
function print(k, w, h, draw, transparent = false) {
  if (!inks.has(k)) inks.set(k, new THREE.MeshStandardMaterial({ map: tex(w, h, draw),
    roughness: 0.78, transparent, depthWrite: !transparent, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  return inks.get(k);
}
function panel(w, h, m, x, y, z) {
  return mesh(cache(`p:${w}:${h}`, () => new THREE.PlaneGeometry(w, h)), m, x, y, z);
}
function words(k, lines, bg = '#f4f2e8', fg = '#29332e') {
  return print(k, 512, 256, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.textAlign = 'center';
    lines.forEach((s, i) => { c.font = `${i ? '' : 'bold '} ${lines.length > 2 ? 40 : 58}px ${FONT}`;
      c.fillText(s, w / 2, (i + 0.7) * h / lines.length); });
  });
}
function screw(g, x, y, z, r = 0.003) {
  const o = cyl(r, r, 0.0012, steel(), x, y, z, 8); o.rotation.x = Math.PI / 2; g.add(o);
  g.add(box(r * 1.3, 0.0006, 0.0003, dark(), x, y, z + 0.0007));
}
function finish(g, sno, anchored = false) {
  if (!anchored) {
    g.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(g);
    const d = V(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
    g.children.forEach(c => c.position.add(d));
  }
  g.name = `HIFI ${sno}`; g.userData.sno = sno;
  g.userData.dimensionSource = [83, 88].includes(sno) ? 'spec footprint; typical details' : 'typical; no catalogue photo';
  g.userData.wallAnchorPreserved = anchored; g.updateMatrixWorld(true); return g;
}

function worktable() {
  const g = new THREE.Group(), w = 1.2192, d = 1.8288, h = 0.74;
  const laminate = print('table-laminate', 512, 512, (c, W, H) => {
    c.fillStyle = '#e5d8bb'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 190; i++) {
      c.strokeStyle = i % 3 ? 'rgba(137,110,76,.07)' : 'rgba(255,251,229,.18)';
      c.lineWidth = 0.5 + (i % 4) * 0.3; c.beginPath();
      const y = i * 2.8; c.moveTo(0, y); c.bezierCurveTo(130,y+3,300,y-2,W,y+2); c.stroke();
    }
  });
  g.add(box(w, 0.03, d, M('#b58859', { r: 0.65 }), 0, h - 0.015, 0, 0.004));
  const top = panel(w - 0.008, d - 0.008, laminate, 0, h + 0.0001, 0);
  top.rotation.x = -Math.PI / 2; g.add(top);
  for (const x of [-1, 1]) g.add(box(0.003, 0.026, d - 0.006, M('#946d43'), x * (w / 2 - 0.0015), h - 0.015, 0));
  for (const z of [-1, 1]) g.add(box(w - 0.006, 0.026, 0.003, M('#946d43'), 0, h - 0.015, z * (d / 2 - 0.0015)));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (w / 2 - 0.07), z = sz * (d / 2 - 0.07);
    g.add(box(0.05, 0.681, 0.05, frame(), x, 0.3675, z, 0.002));
    g.add(box(0.053, 0.022, 0.053, dark(), x, 0.017, z, 0.003));
    g.add(cyl(0.018, 0.021, 0.006, dark(), x, 0.003, z));
    for (const y of [0.63, 0.68]) screw(g, x, y, z + 0.0258, 0.004);
    g.add(box(0.09, 0.003, 0.09, frame(), x, 0.7085, z));
  }
  for (const z of [-d / 2 + 0.07, d / 2 - 0.07])
    g.add(box(w - 0.14, 0.075, 0.03, frame(), 0, 0.665, z));
  for (const x of [-w / 2 + 0.07, w / 2 - 0.07])
    g.add(box(0.03, 0.075, d - 0.14, frame(), x, 0.665, 0));
  for (const z of [-0.40, 0.40]) g.add(box(w - 0.14, 0.028, 0.032, frame(), 0, 0.695, z));
  return finish(g, 83);
}

function teacherChair() {
  const g = new THREE.Group(), fabric = M('#303c43', { r: 0.96 }), shell = M('#20282c', { r: 0.68 });
  // Five spoke cast base, twin-wheel casters and telescoping gas lift.
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5, x = Math.sin(a) * 0.286, z = Math.cos(a) * 0.286;
    g.add(rod([0,0.13,0],[x,0.075,z],0.018,shell));
    g.add(cyl(0.009,0.009,0.034,steel(),x,0.061,z,8));
    for (const s of [-1, 1]) {
      const wheel = cyl(0.027,0.027,0.017,dark(),x+s*0.012,0.027,z,12);
      wheel.rotation.z = Math.PI / 2; g.add(wheel);
    }
    g.add(box(0.044,0.018,0.033,shell,x,0.059,z,0.005));
  }
  g.add(cyl(0.035,0.047,0.17,shell,0,0.185,0,16));
  g.add(cyl(0.017,0.017,0.17,steel(),0,0.345,0,16));
  g.add(box(0.23,0.048,0.26,shell,0,0.425,-0.015,0.012));
  g.add(box(0.49,0.045,0.47,shell,0,0.466,0.012,0.022));
  g.add(box(0.49,0.075,0.465,fabric,0,0.504,0.015,0.033));
  // Back is reclined around its lower connection; +z is the sitting direction.
  g.add(rod([0,0.43,-0.17],[0,0.67,-0.25],0.024,shell));
  const back = new THREE.Group(); back.position.set(0,0.58,-0.22); back.rotation.x = -0.10;
  back.add(box(0.455,0.515,0.037,shell,0,0.2575,-0.015,0.018));
  back.add(box(0.45,0.51,0.065,fabric,0,0.255,0.016,0.031));
  back.add(box(0.36,0.095,0.026,fabric,0,0.13,0.047,0.012));
  g.add(back);
  for (const s of [-1,1]) {
    g.add(tube('chair-arm-'+s,[[s*.22,.45,-.10],[s*.288,.49,-.11],[s*.288,.655,-.08],
      [s*.288,.67,.15]],.015,shell,9,6));
    g.add(box(.074,.035,.29,dark(),s*.288,.687,.025,.016));
  }
  g.add(rod([.09,.435,.035],[.26,.415,.065],.005,steel()));
  g.add(box(.058,.017,.034,shell,.26,.415,.065,.006));
  g.add(cyl(.034,.034,.048,dark(),0,.393,.105,12));
  return finish(g,86);
}

function cupboard() {
  const g = new THREE.Group(), enamel = M('#8d9da6',{m:.42,r:.46}), seam = M('#3b4850',{r:.7});
  // Folded sheet shell and internal adjustable shelves, behind closed doors.
  g.add(box(.91,.075,.455,enamel,0,.0375,-.0125));
  g.add(box(.91,.022,.455,enamel,0,1.969,-.0125));
  g.add(box(.012,1.883,.455,enamel,-.449,1.0165,-.0125));
  g.add(box(.012,1.883,.455,enamel,.449,1.0165,-.0125));
  g.add(box(.886,1.883,.006,enamel,0,1.0165,-.237));
  for(const y of [.46,.87,1.28,1.69]) g.add(box(.885,.015,.415,enamel,0,y,-.008));
  g.add(box(.018,1.85,.026,seam,0,1.005,.2));
  const vent = print('cupboard-vents',512,128,(c,w,h)=>{
    c.fillStyle='#8d9da6';c.fillRect(0,0,w,h);
    for(let i=0;i<5;i++){c.fillStyle='#4d5d64';c.fillRect(15,12+i*23,w-30,8);
      c.fillStyle='#bac3c7';c.fillRect(15,21+i*23,w-30,2);}
  });
  for(const s of [-1,1]) {
    g.add(box(.438,1.866,.017,enamel,s*.223,1.013,.2055,.004));
    for(const y of [.27,1.76]) g.add(panel(.27,.085,vent,s*.223,y,.2142));
    g.add(box(.039,.23,.003,seam,s*.046,1.04,.216));
    g.add(tube('cupboard-pull-'+s,[[s*.046,.965,.218],[s*.046,.979,.237],
      [s*.046,1.10,.237],[s*.046,1.115,.218]],.003,steel(),8,6));
    for(const y of [.3,1.0,1.73]) g.add(cyl(.004,.004,.052,steel(),s*.438,y,.214,8));
  }
  const lock = cyl(.008,.008,.003,steel(),.044,1.19,.217,16);lock.rotation.x=Math.PI/2;g.add(lock);
  g.add(box(.0015,.007,.001,dark(),.044,1.19,.219));
  g.add(panel(.095,.025,words('cupboard-label',['LAB STORAGE']),-.22,1.50,.2142));
  for(const x of [-.37,.37])g.add(box(.12,.028,.005,seam,x,.024,-.239));
  return finish(g,87);
}

function pegboard() {
  const g = new THREE.Group(), w=1.2192,h=.9144;
  g.add(box(w,h,.012,M('#aa8152',{r:.88}),0,0,0));
  const holes = print('pegboard-perforations',1536,1152,(c,W,H)=>{
    c.fillStyle='#c59d6c';c.fillRect(0,0,W,H);
    // 25.4 mm pitch / 6 mm bore. Painted dark recesses save geometry for hooks.
    for(let i=1;i<48;i++)for(let j=1;j<36;j++){
      const x=i*W/48,y=j*H/36;c.fillStyle='#e4c497';c.beginPath();c.arc(x,y+1,4.2,0,Math.PI*2);c.fill();
      c.fillStyle='#4c3a26';c.beginPath();c.arc(x,y-1,3.7,0,Math.PI*2);c.fill();
    }
  });
  g.add(panel(w-.018,h-.018,holes,0,0,.0062));
  const edge=M('#6c7477',{m:.65,r:.43});
  for(const x of [-1,1])g.add(box(.017,h,.016,edge,x*(w/2-.0085),0,.002));
  for(const y of [-1,1])g.add(box(w-.034,.017,.016,edge,0,y*(h/2-.0085),.002));
  for(const x of [-w/2+.026,w/2-.026])for(const y of [-h/2+.026,h/2-.026])screw(g,x,y,.011, .004);
  for(let i=0;i<10;i++) {
    const x=-.48+(i%5)*.24,y=i<5?.225:-.16;
    g.add(box(.016,.032,.003,steel(),x,y,.009));
    const hook=tube('peg-hook',[[0,.01,.007],[0,-.005,.016],[0,-.008,.062],
      [0,0,.073]],.003,steel(),8,6);hook.position.set(x,y,0);g.add(hook);
  }
  return finish(g,88,true);
}

function binRack() {
  const g=new THREE.Group(), f=frame(), colours=['#d97835','#377f9c','#4a8a67','#d6ad45'];
  for(const x of [-.48,.48])for(const z of [-.18,.18]) {
    g.add(box(.03,1.6,.03,f,x,.8,z));
    for(let y=.10;y<1.56;y+=.12)g.add(box(.005,.012,.0007,dark(),x,y,z+.0155));
  }
  // Braced rear and shallow shelves; the twenty open fronts face +z.
  g.add(rod([-.46,.10,-.19],[.46,1.51,-.19],.006,f,6));
  g.add(rod([.46,.10,-.19],[-.46,1.51,-.19],.006,f,6));
  const sideShape=shape([[-.18,0],[.18,0],[.18,.09],[.11,.105],[.055,.22],[-.18,.22]]);
  for(let r=0;r<5;r++) {
    const y=.07+r*.31;g.add(box(.99,.02,.4,f,0,y-.01,0));
    for(let k=0;k<4;k++) {
      const x=-.36+k*.24,b=new THREE.Group(),m=M(colours[k],{r:.43});
      b.add(box(.22,.006,.36,m,0,.003,0));
      b.add(box(.22,.214,.006,m,0,.113,-.177));
      b.add(box(.22,.088,.006,m,0,.05,.177));
      for(const s of [-1,1]) {
        const side=extrude('bin-side',sideShape,.005,m,0);side.rotation.y=-Math.PI/2;
        side.position.x=s*.1075;b.add(side);
        b.add(box(.009,.007,.235,m,s*.1055,.217,-.0625));
      }
      b.add(box(.22,.008,.009,m,0,.218,-.1755));
      b.add(box(.12,.044,.002,M('#52616a',{r:.6}),0,.052,.181));
      b.add(panel(.108,.032,words('bin-label-'+(r*4+k),['BIN '+String(r*4+k+1).padStart(2,'0')]),0,.052,.1822));
      b.position.set(x,y,0);g.add(b);
    }
  }
  return finish(g,89);
}

function router() {
  const g=new THREE.Group(), cream=white();
  g.add(box(.22,.027,.14,cream,0,.0205,0,.010));
  g.add(box(.208,.009,.128,M('#b5babb',{r:.6}),0,.0075,0,.004));
  for(const x of [-.08,.08])for(const z of [-.045,.045])g.add(cyl(.006,.006,.004,dark(),x,.002,z,8));
  g.add(box(.215,.0015,.133,M('#ccd1ce'),0,.011,0,.0005));
  for(let i=0;i<3;i++) {
    const a=new THREE.Group();a.position.set((i-1)*.08,.032,-.06);a.rotation.x=(i-1)*.25;
    a.add(cyl(.007,.008,.017,dark(),0,.006,0,12));
    a.add(cyl(.0047,.006,.144,dark(),0,.085,0,12));
    a.add(cyl(.003,.0047,.004,dark(),0,.159,0,12));g.add(a);
  }
  const topPrint=print('router-top',768,400,(c,w,h)=>{
    c.fillStyle='#eeeee8';c.fillRect(0,0,w,h);
    c.fillStyle='#858e8e';for(let i=0;i<22;i++)c.fillRect(50+i*31,48,3,95);
    c.fillStyle='#7c8582';c.font=`23px ${FONT}`;c.textAlign='center';c.fillText('WIRELESS • 300 Mbps',w/2,245);
    c.font=`15px ${FONT}`;['POWER','WAN','WLAN','LAN'].forEach((s,i)=>c.fillText(s,185+i*130,362));
  });
  const p=panel(.195,.112,topPrint,0,.0341,0);p.rotation.x=-Math.PI/2;g.add(p);
  for(let i=0;i<4;i++) {
    g.add(box(.009,.002,.004,M('#2e4b36'),-.051+i*.033,.027,.069));
    g.add(box(.004,.0015,.0005,M('#75ba47',{e:'#5b9c36',ei:.6}),-.051+i*.033,.027,.0712));
  }
  // Rear RJ45 jacks, metal contact mouths, reset pinhole and power socket.
  for(let i=0;i<4;i++) {
    const x=-.055+i*.025;g.add(box(.020,.014,.003,M(i===0?'#4c92b0':'#d8b745'),x,.020,-.070));
    g.add(box(.015,.010,.001,dark(),x,.021,-.072));
    for(let j=0;j<6;j++)g.add(box(.0007,.002,.0005,M('#c6ad64',{m:.6}),x-.005+j*.002,.017,-.0726));
  }
  const power=cyl(.0035,.0035,.002,dark(),.070,.019,-.071,12);power.rotation.x=Math.PI/2;g.add(power);
  return finish(g,91,true);
}

function firstAid() {
  const g=new THREE.Group(), enamel=white(), green=M('#267445',{r:.5});
  g.add(box(.36,.28,.118,enamel,0,.14,-.001,.005));
  g.add(box(.344,.264,.0015,M('#a6aea7'),0,.14,.0585,.003));
  g.add(box(.337,.257,.006,enamel,0,.14,.062,.003));
  const label=print('first-aid-front',600,440,(c,w,h)=>{
    c.fillStyle='#eeeee8';c.fillRect(0,0,w,h);c.fillStyle='#267445';
    c.fillRect(254,55,92,230);c.fillRect(185,124,230,92);
    c.textAlign='center';c.font=`bold 51px ${FONT}`;c.fillText('FIRST AID',w/2,365);
    c.font=`19px ${FONT}`;c.fillText('KEEP CLEAN • CHECK CONTENTS',w/2,410);
  });
  g.add(panel(.27,.21,label,0,.147,.0652));
  for(const y of [.065,.215]) {
    g.add(box(.016,.040,.003,enamel,-.171,y,.060));
    g.add(cyl(.003,.003,.039,steel(),-.170,y,.064,8));
  }
  g.add(box(.019,.045,.005,green,.151,.14,.0655,.002));
  const lock=cyl(.005,.005,.002,steel(),.151,.146,.069,12);lock.rotation.x=Math.PI/2;g.add(lock);
  g.add(box(.0012,.005,.0005,dark(),.151,.146,.0702));
  // Concealed wall-mount holes remain within the original back plane.
  for(const x of [-.12,.12]) {const p=cyl(.003,.003,.001,dark(),x,.23,-.0597,8);p.rotation.x=Math.PI/2;g.add(p);}
  return finish(g,94,true);
}

function sandStand() {
  const g=new THREE.Group(), red=M('#bc302b',{m:.28,r:.43}), bright=M('#d83b2d',{m:.22,r:.38});
  for(const x of [-.38,.38]) {
    g.add(box(.034,1.16,.034,red,x,.58,-.13));
    g.add(box(.04,.025,.38,red,x,.0125,0));
    g.add(rod([x,.022,.16],[x,.44,-.13],.009,red));
  }
  g.add(box(.80,.038,.038,red,0,1.02,-.13));
  g.add(box(.74,.025,.025,red,0,.45,-.13));
  g.add(box(.64,.16,.012,red,0,1.14,-.13,.003));
  g.add(panel(.59,.135,words('sand-sign',['FIRE','SAND BUCKETS'],'#bc302b','#fff5dd'),0,1.14,-.1235));
  for(const x of [-.225,.225]) {
    const b=new THREE.Group();
    b.add(lathe('fire-bucket',[[0,0],[.085,0],[.096,.008],[.128,.266],[.130,.273],
      [.129,.280],[.124,.280],[.123,.269],[.092,.012],[0,.012]],bright,24));
    const sandMat=print('sand-grain',256,256,(c,w,h)=>{
      c.fillStyle='#ccb17d';c.fillRect(0,0,w,h);
      for(let i=0;i<900;i++){c.fillStyle=i%2?'#b49a68':'#dfca98';c.fillRect((i*73)%w,(i*137+Math.floor(i/7))%h,1.5,1.5);}
    });
    b.add(cyl(.120,.118,.012,sandMat,0,.255,0,24));
    for(const s of [-1,1]) {
      const lug=cyl(.009,.009,.006,red,s*.124,.245,0,10);lug.rotation.z=Math.PI/2;b.add(lug);
    }
    b.add(tube('fire-bucket-bail',[[-.128,.245,0],[-.126,.33,0],[-.08,.385,0],
      [0,.402,0],[.08,.385,0],[.126,.33,0],[.128,.245,0]],.003,steel(),16,5));
    const grip=cyl(.006,.006,.065,dark(),0,.400,0,12);grip.rotation.z=Math.PI/2;b.add(grip);
    // Curved label follows the actual taper, avoiding a floating front placard.
    const decal=mesh(cache('fire-bucket-decal',()=>new THREE.CylinderGeometry(.122,.108,.105,12,1,true,-.58,1.16)),
      words('bucket-fire',['FIRE'],'#d83b2d','#fff7e9'),0,.165,0);b.add(decal);
    b.position.set(x,.615,.025);g.add(b);
    g.add(tube('bucket-hook',[[0,1.035,-.13],[0,1.04,.025],[0,1.005,.025]],.005,steel(),7,6).translateX(x));
  }
  return finish(g,96);
}

function tray(g, h, name) {
  const m=M('#506571',{r:.58});
  g.add(box(.36,.006,.26,m,0,.003,0));
  for(const x of [-.177,.177])g.add(box(.006,h-.006,.26,m,x,h/2+.003,0));
  for(const z of [-.127,.127])g.add(box(.348,h-.006,.006,m,0,h/2+.003,z));
  for(const x of [-.177,.177])g.add(box(.008,.008,.26,m,x,h-.004,0));
  for(const z of [-.127,.127])g.add(box(.36,.008,.008,m,0,h-.004,z));
  g.add(panel(.13,.035,words(name+'-tray-label',[name]),0,h*.44,.1302));
  for(const x of [-.174,.174])g.add(box(.001,.012,.065,dark(),x,h-.028,0));
}
function gloveShape() {
  // Continuous hand outline: four separate fingers, thumb, palm and knitted cuff.
  const s=new THREE.Shape();s.moveTo(-.030,-.104);s.lineTo(.030,-.104);s.lineTo(.034,-.047);
  s.lineTo(.055,-.012);s.quadraticCurveTo(.060,.005,.049,.012);
  s.quadraticCurveTo(.041,.017,.029,-.006);s.lineTo(.028,.059);
  s.quadraticCurveTo(.029,.081,.019,.081);s.quadraticCurveTo(.010,.081,.011,.059);
  s.lineTo(.009,.040);s.lineTo(.009,.095);s.quadraticCurveTo(.009,.116,-.001,.116);
  s.quadraticCurveTo(-.010,.116,-.010,.094);s.lineTo(-.010,.043);
  s.lineTo(-.013,.101);s.quadraticCurveTo(-.013,.123,-.023,.123);
  s.quadraticCurveTo(-.032,.123,-.031,.100);s.lineTo(-.029,.039);
  s.lineTo(-.034,.080);s.quadraticCurveTo(-.037,.098,-.045,.095);
  s.quadraticCurveTo(-.053,.092,-.049,.075);s.lineTo(-.045,.020);
  s.lineTo(-.042,-.045);s.closePath();return s;
}
function safetyGloves() {
  const g=new THREE.Group();tray(g,.20,'WORK GLOVES');
  const cotton=M('#d8d4c4',{r:.98}), nitrile=M('#3c5660',{r:.83});
  for(let i=0;i<3;i++)for(let j=0;j<2;j++) {
    const glove=new THREE.Group(), m=i===1?M('#d9ac4d',{r:.9}):cotton;
    glove.add(extrude('glove-outline',gloveShape(),.008,m,.001,2));
    const palm=extrude('glove-coating',shape([[-.039,-.045],[.029,-.045],[.038,-.010],
      [.028,.017],[.023,.052],[-.038,.050],[-.043,.013]]),.001,nitrile,0);
    palm.position.z=.0052;glove.add(palm);
    glove.add(box(.058,.043,.010,m,0,-.081,0,.004));
    for(let n=0;n<10;n++)glove.add(box(.001,.037,.0006,M('#a8a899',{r:1}),-.025+n*.0055,-.081,.0055));
    // Mirror hand shapes for each pair; the second glove lies over the first.
    glove.scale.x=j?-1:1;glove.rotation.x=-Math.PI/2;
    glove.position.set(-.114+i*.114,.208+j*.014,j*.005);g.add(glove);
  }
  return finish(g,97);
}

function apronRail() {
  const g=new THREE.Group();g.add(box(1.4,.04,.04,M('#ae8154',{r:.8}),0,1.57,0,.003));
  for(const x of [-.66,.66])screw(g,x,1.57,.021,.004);
  const clothGeo=cache('folded-apron-cloth',()=>{
    const p=[],uv=[],idx=[],rows=12,cols=8;
    for(let j=0;j<=rows;j++) {
      const t=j/rows,y=.75+t*.68;
      const half=t<.62?.098:THREE.MathUtils.lerp(.098,.052,(t-.62)/.38);
      for(let i=0;i<=cols;i++) {
        const u=i/cols,x=(u*2-1)*half;
        p.push(x,y,.060+.008*Math.sin(u*Math.PI*6+.4)*(.6+.4*(1-t)));
        uv.push(u,t);
      }
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const a=j*(cols+1)+i,b=a+cols+1;idx.push(a,a+1,b,a+1,b+1,b);
    }
    const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
    b.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));b.setIndex(idx);b.computeVertexNormals();return b;
  });
  for(let i=0;i<7;i++) {
    const x=-.60+i*.20,colour=i%2?'#376a86':'#cd793d';
    const cloth=print('apron-cloth-'+colour,256,768,(c,w,h)=>{
      c.fillStyle=colour;c.fillRect(0,0,w,h);
      c.strokeStyle='rgba(255,244,207,.55)';c.lineWidth=1.3;c.setLineDash([3,5]);
      c.strokeRect(9,9,w-18,h-18);c.setLineDash([]);
      for(let j=0;j<200;j++){c.fillStyle='rgba(25,30,35,.04)';c.fillRect((j*73)%w,0,1,h);}
    });
    g.add(mesh(clothGeo,cloth,x));
    const strapMat=M(colour,{r:.98,side:THREE.DoubleSide});
    // Flat fabric neck loop, two sides suspended over each metal peg.
    const strap=extrude('apron-neck-loop',shape([[-.049,1.423],[-.044,1.493],[-.009,1.552],
      [.009,1.552],[.044,1.493],[.049,1.423],[.038,1.423],[.033,1.486],
      [0,1.536],[-.033,1.486],[-.038,1.423]]),.001,strapMat,0);
    strap.position.set(x,0,.050);g.add(strap);
    g.add(tube('apron-peg',[[0,1.57,.018],[0,1.56,.071],[0,1.572,.078]],.003,steel(),6,5).translateX(x));
    const pocket=box(.132,.126,.003,strapMat,x,1.046,.072,.001);g.add(pocket);
    const seam=print('apron-pocket-'+colour,256,256,(c,w,h)=>{
      c.strokeStyle='#d6cbb0';c.lineWidth=2;c.setLineDash([4,5]);c.strokeRect(8,8,w-16,h-16);
      c.beginPath();c.moveTo(w/2,6);c.lineTo(w/2,h-6);c.stroke();
    },true);g.add(panel(.129,.123,seam,x,1.046,.074));
    // Fold return at the hem and waist tie tabs visible at both sides.
    g.add(box(.19,.012,.006,strapMat,x,.756,.057));
    for(const s of [-1,1])g.add(box(.009,.22,.002,strapMat,x+s*.094,1.05,.046));
  }
  return finish(g,98,true);
}

function goggles() {
  const g=new THREE.Group();tray(g,.14,'SAFETY GOGGLES');
  const outline=[[-.073,.016],[-.067,.027],[-.04,.029],[0,.027],[.04,.029],[.067,.027],
    [.073,.016],[.070,-.018],[.059,-.024],[.021,-.025],[.010,-.011],
    [0,-.006],[-.010,-.011],[-.021,-.025],[-.059,-.024],[-.070,-.018]];
  const zAt=x=>.022-.015*(x/.073)**2;
  const lensGeo=cache('goggle-curved-lens',()=>{
    // Triangulated profile with nose cutout; wrap in z instead of a flat blue box.
    const b=new THREE.ShapeGeometry(shape(outline),3),p=b.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,zAt(p.getX(i)));b.computeVertexNormals();return b;
  });
  const clear=M('#dbeaf0',{o:.27,r:.13,side:THREE.DoubleSide});
  const seal=M('#9cbdc5',{o:.75,r:.5,side:THREE.DoubleSide});
  for(let i=0;i<4;i++) {
    const a=new THREE.Group();a.add(mesh(lensGeo,clear));
    a.add(tube('goggle-frame',outline.map(([x,y])=>[x,y,zAt(x)]),.0035,seal,32,4,true));
    for(const s of [-1,1]) {
      a.add(box(.005,.028,.026,seal,s*.071,.005,-.007,.002));
      a.add(box(.004,.015,.018,dark(),s*.077,.005,-.014,.001));
      for(let j=0;j<3;j++)a.add(box(.001,.002,.004,M('#526a70'),s*.074,.002+j*.006,-.007));
    }
    a.add(tube('goggle-elastic',[[-.077,.003,-.018],[-.064,.004,-.049],
      [0,.004,-.056],[.064,.004,-.049],[.077,.003,-.018]],.003,dark(),10,4));
    a.add(box(.023,.009,.004,dark(),.02,.005,-.055,.001));
    a.position.set(i%2?.086:-.086,.170,i<2?-.043:.073);g.add(a);
  }
  return finish(g,99);
}

export const HIFI = {
  83: () => worktable(), 86: () => teacherChair(), 87: () => cupboard(),
  88: () => pegboard(), 89: () => binRack(), 91: () => router(),
  94: () => firstAid(), 96: () => sandStand(), 97: () => safetyGloves(),
  98: () => apronRail(), 99: () => goggles(),
};
