// A stylised, poseable school student (or adult teacher) built from cached low-poly parts.
// Local frame: feet at y=0, facing +z. Joints rotate about x (pitch) mostly.
// Geometry lives in kid-parts.js and is shared by every character; materials are cached by colour.
import * as THREE from 'three';
import { M, tex } from './kit.js';
import { G } from './kid-parts.js';

const SKIN = ['#8d5a3b', '#a8714a', '#c48a5f', '#7a4a2e', '#b77b52', '#9b6542', '#d09a6c', '#6e452c'];
const HAIR = ['#15110f', '#1c1512', '#261a13'];
const LANYARD = ['#1f5fbf', '#c62828', '#2e7d32'];
const GIRL_HAIR = ['plaits', 'ponytail', 'bob'], BOY_HAIR = ['crop', 'side'];

// one material for every multi-coloured detail mesh (face, shoes, belt, ID card, headphones)
let detailMat, tieMat;
const DETAIL = () => detailMat ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 });
const TIE = () => tieMat ??= new THREE.MeshStandardMaterial({
  roughness: 0.7, side: THREE.DoubleSide,
  map: tex(64, 64, (c, w, h) => { // diagonal school-tie stripes, tileable
    c.fillStyle = '#7d1528'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) for (let k = -1; k < 2; k++) {
      c.fillStyle = '#e0b23c'; c.fillRect((y % 32) + 32 * k, y, 5, 1);
      c.fillStyle = '#1c2b4a'; c.fillRect((y % 32) + 32 * k + 5, y, 2, 1);
    }
  }, [20, 20]),
});

function add(parent, geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); parent.add(m); return m;
}
const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

export function makeKid(o = {}) {
  const i = o.seed ?? Math.floor(Math.random() * 100);
  const k = o.scale ?? 1;
  const adult = o.adult ?? k >= 1.1;
  const girl = o.girl ?? (i % 2 === 1);
  const outfit = o.outfit ?? (adult && girl ? 'kurta' : 'uniform');   // 'uniform' | 'kurta'
  const kurta = outfit === 'kurta';
  const skirted = girl && !o.trousers && !kurta;
  const pinafore = skirted && (o.pinafore ?? ((i >> 1) % 2 === 0));
  const style = o.hairStyle ?? (girl ? (adult ? 'bun' : GIRL_HAIR[(i >> 1) % 3]) : BOY_HAIR[(i >> 1) % 2]);

  const skin = M(o.skin ?? SKIN[(i * 5 + (i >> 2)) % SKIN.length], { r: 0.7 });
  const hair = M(o.hair ?? HAIR[i % HAIR.length], { r: 0.6 });
  const shirt = M(o.shirt ?? '#e3ecf6', { r: 0.8 });
  const pants = M(o.pants ?? '#1c2b4a', { r: 0.85 });
  const detail = DETAIL();

  // skeleton lengths (unchanged, so every pose keeps working); FOOT = knee to sole
  const thighL = 0.38, FOOT = 0.39, ANKLE = 0.33, torsoL = 0.44, upperL = 0.27, foreL = 0.24;
  const root = new THREE.Group();
  const body = new THREE.Group(); body.scale.setScalar(k); root.add(body);

  // ---- pelvis ----
  const pelvis = group(body, 0, 0.06 + thighL + FOOT, 0);
  add(pelvis, G.hips(), pants);
  if (!o.apron && !kurta) add(pelvis, G.belt(), detail);
  let drapeStand = null, drapeSit = null;
  if (skirted || kurta) {
    const dm = kurta ? shirt : pants;
    drapeStand = add(pelvis, G.skirtStand(), dm); drapeSit = add(pelvis, G.skirtSit(), dm);
  }

  // ---- torso ----
  const torso = group(pelvis, 0, 0.05, 0);
  add(torso, G.shirt(kurta ? 'plain' : 'uniform'), shirt);
  if (pinafore) add(torso, G.bib(), pants);
  if (o.apron) add(torso, G.apron(), M(o.apron, { r: 0.9, side: THREE.DoubleSide }));
  else {
    if (o.tie !== false && !kurta) {
      const t = add(torso, G.tie(pinafore), TIE(), 0, 0.4, 0.095); t.rotation.x = -0.048;
      add(torso, G.tieKnot(), M('#7d1528', { r: 0.7 }));
    }
    add(torso, G.idCard(LANYARD[(i >> 1) % LANYARD.length], !kurta && !pinafore), detail);
  }
  if (kurta) add(torso, G.dupatta(), M(o.dupatta ?? '#7b1e3c', { r: 0.9 }));

  // ---- neck + head ----
  const neck = group(torso, 0, torsoL, 0);
  add(neck, G.neck(), skin);
  const head = group(neck, 0, 0.17, 0);
  if (adult) { head.scale.setScalar(0.95); head.position.y = 0.164; }
  add(head, G.headSkin(), skin);
  add(head, G.face(adult && girl), detail);
  add(head, G.hair(style), hair);
  const rib = girl ? G.ribbon(style) : null;
  if (rib) add(head, rib, M(o.ribbon ?? '#d32f2f', { r: 0.6 }));
  if (o.goggles) {
    add(head, G.goggleFrame(), M('#2a6f97', { r: 0.5 }));
    add(head, G.goggleLens(), M('#9fd3e6', { r: 0.1, o: 0.45 })).userData.noShadow = true;
  }
  if (o.headphones) add(head, G.headphones(), detail);
  if (o.cap) add(head, G.cap(), M(o.cap));

  // ---- limbs ----
  const arm = (s) => {
    const sh = group(torso, 0.15 * s, torsoL - 0.07, 0);
    add(sh, G.sleeve(kurta ? 'long' : 'short'), shirt);
    if (!kurta) add(sh, G.upperArm(), skin);
    const el = group(sh, 0, -upperL, 0);
    add(el, G.foreArm(), skin);
    const hand = group(el, 0, -foreL - 0.02, 0);
    add(hand, G.hand(s), skin);
    return { sh, el, hand };
  };
  const leg = (s) => {
    const hip = group(pelvis, 0.075 * s, -0.06, 0);
    add(hip, G.thigh(), skirted ? skin : pants);
    const kn = group(hip, 0, -thighL, 0);
    add(kn, skirted ? G.shinBare() : G.shinTrouser(), skirted ? skin : pants);
    const ank = group(kn, 0, -ANKLE, 0);
    add(ank, G.shoe(skirted), detail);
    return { hip, kn, ank };
  };
  const L = arm(1), R = arm(-1), LL = leg(1), RL = leg(-1);
  const J = { pelvis, torso, neck, head, lSh: L.sh, lEl: L.el, lHand: L.hand, rSh: R.sh, rEl: R.el, rHand: R.hand, lHip: LL.hip, lKn: LL.kn, rHip: RL.hip, rKn: RL.kn };
  const joints = Object.values(J);
  const hipY0 = pelvis.position.y;

  const kid = { root, J, pose: 'stand', phase: Math.random() * 6, act: o.act ?? 'idle', k };
  kid.setPose = (p) => {
    kid.pose = p;
    joints.forEach(j => j.rotation.set(0, 0, 0));
    pelvis.position.set(0, hipY0, 0);
    LL.ank.rotation.x = RL.ank.rotation.x = 0;
    if (drapeStand) { drapeStand.visible = p !== 'sit'; drapeSit.visible = p === 'sit'; }
    // arms slightly out so they don't clip the torso
    J.lSh.rotation.z = 0.08; J.rSh.rotation.z = -0.08;
    if (p === 'sit') {
      pelvis.position.y = 0.47 / k; pelvis.position.z = -0.05;
      J.lHip.rotation.x = J.rHip.rotation.x = -Math.PI / 2; J.lKn.rotation.x = J.rKn.rotation.x = Math.PI / 2;
      J.lSh.rotation.x = J.rSh.rotation.x = -0.7; J.lEl.rotation.x = J.rEl.rotation.x = -1.05;
      J.lSh.rotation.z = 0.12; J.rSh.rotation.z = -0.12; J.lSh.rotation.y = -0.35; J.rSh.rotation.y = 0.35; J.lEl.rotation.y = -0.4; J.rEl.rotation.y = 0.4;
      J.neck.rotation.x = 0.35; J.torso.rotation.x = 0.12;
    } else if (p === 'kneel') {
      pelvis.position.y = (thighL + 0.1); J.lKn.rotation.x = J.rKn.rotation.x = Math.PI / 2;
      LL.ank.rotation.x = RL.ank.rotation.x = 1.35;   // feet laid back flat instead of toes through the floor
      J.torso.rotation.x = 0.55; J.lSh.rotation.x = J.rSh.rotation.x = -0.6; J.neck.rotation.x = 0.4;
    } else if (p === 'reach') {
      J.rSh.rotation.x = -1.15; J.rEl.rotation.x = -0.3; J.lSh.rotation.x = -0.2; J.neck.rotation.x = 0.25;
    } else if (p === 'counter') {
      J.lSh.rotation.x = J.rSh.rotation.x = -0.75; J.lEl.rotation.x = J.rEl.rotation.x = -0.9; J.neck.rotation.x = 0.35;
      J.lSh.rotation.z = 0.2; J.rSh.rotation.z = -0.2;
    } else if (p === 'point') {
      J.rSh.rotation.x = -1.4; J.rSh.rotation.z = -0.5; J.rEl.rotation.x = -0.15; J.neck.rotation.y = -0.4;
    } else if (p === 'watch') {
      J.lSh.rotation.x = J.rSh.rotation.x = -0.3; J.lEl.rotation.x = J.rEl.rotation.x = -1.2; J.lSh.rotation.z = 0.45; J.rSh.rotation.z = -0.45; J.neck.rotation.x = 0.35;
    }
    kid.base = Object.fromEntries(Object.entries(J).map(([n, j]) => [n, { r: j.rotation.clone(), p: j.position.clone() }]));
  };
  kid.update = (t) => {
    const ph = t + kid.phase, b = kid.base; if (!b) return;
    const s = Math.sin(ph * 2.2), s2 = Math.sin(ph * 1.3);
    J.head.rotation.y = 0.15 * Math.sin(ph * 0.5);
    if (kid.act === 'build') {
      J.rSh.rotation.x = b.rSh.r.x + 0.08 * s; J.rEl.rotation.x = b.rEl.r.x + 0.18 * Math.sin(ph * 3.1);
      J.lEl.rotation.x = b.lEl.r.x + 0.1 * s2; J.neck.rotation.x = b.neck.r.x + 0.05 * s2;
    } else if (kid.act === 'cpr') {
      const c = Math.max(0, Math.sin(ph * 9)); J.torso.rotation.x = b.torso.r.x + 0.08 * c; pelvis.position.y = b.pelvis.p.y - 0.01 * c;
    } else if (kid.act === 'water') {
      J.rSh.rotation.x = b.rSh.r.x + 0.05 * s2; J.rHand.rotation.x = 0.4 + 0.25 * Math.max(0, s2);
    } else if (kid.act === 'stir') {
      J.rEl.rotation.x = b.rEl.r.x + 0.15 * Math.sin(ph * 4); J.rSh.rotation.z = b.rSh.r.z + 0.12 * Math.cos(ph * 4);
    } else if (kid.act === 'type') {
      J.lHand.rotation.x = 0.2 * Math.sin(ph * 14); J.rHand.rotation.x = 0.2 * Math.cos(ph * 13);
    } else if (kid.act === 'talk') {
      J.rSh.rotation.x = b.rSh.r.x + 0.15 * s2; J.neck.rotation.y = b.neck.r.y + 0.2 * Math.sin(ph * 0.7);
    } else if (kid.act === 'cheer') {
      J.lEl.rotation.x = b.lEl.r.x + 0.2 * Math.sin(ph * 6); J.rEl.rotation.x = b.rEl.r.x - 0.2 * Math.sin(ph * 6);
    }
    if (kid.pose === 'stand' || kid.pose === 'watch' || kid.pose === 'reach' || kid.pose === 'counter' || kid.pose === 'point') J.torso.rotation.z = 0.015 * Math.sin(ph * 0.8);
  };
  kid.hold = (obj, hand = 'r') => { (hand === 'r' ? J.rHand : J.lHand).add(obj); return obj; };
  kid.setPose(o.pose ?? 'stand');
  root.traverse(m => { if (m.isMesh) { m.castShadow = !m.userData.noShadow; m.receiveShadow = true; m.userData.kid = true; } });
  root.userData.kidObj = kid;
  return kid;
}
