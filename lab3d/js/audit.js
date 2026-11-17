// Placement audit for the lab: run in the page console as `await import('./js/audit.js').then(m => m.audit())`
// Reports: objects pushed into walls/floor/ceiling, items floating with nothing under them, items overhanging
// the surface they stand on, and overlapping objects. Kids and wall structure are ignored.
import * as THREE from 'three';

export function audit({ X = 10.97 / 2, Z = 9.75 / 2, H = 3.2, tol = 0.012 } = {}) {
  const L = window.__lab, out = { wall: [], floating: [], overhang: [], overlap: [] };
  const box = (o) => {
    const b = new THREE.Box3(); o.updateMatrixWorld(true);
    o.traverse(m => { if (m.isMesh && m.visible && !m.userData.kid && !m.isSkinnedMesh) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } });
    return b;
  };
  const isWallGroup = (o) => Object.values(L.walls).some(w => w.g === o);
  const onWall = (o) => { for (let p = o.parent; p; p = p.parent) if (isWallGroup(p)) return true; return false; };
  // collect: catalogue items + top-level furniture/fixtures + wall-mounted items
  const ents = [], seen = new Set();
  for (const [s, arr] of Object.entries(L.itemObjs)) arr.forEach((o, i) => { seen.add(o); ents.push({ name: `${s}#${i}`, o, wall: onWall(o), item: true }); });
  L.scene.children.forEach((o, i) => {
    if (seen.has(o) || isWallGroup(o) || o.isLight || o.isCamera || o.userData.kidObj) return;
    let mesh = false; o.traverse(m => { if (m.isMesh && !m.userData.kid) mesh = true; }); if (!mesh) return;
    const b = box(o), s = b.getSize(new THREE.Vector3()); if (b.min.y > 2.6 || ((s.x > 3 || s.z > 3) && s.y < 0.06)) return;   // floor slab, ceiling, lights
    ents.push({ name: `fixture${i}${o.name ? ':' + o.name : ''}`, o, wall: false, item: false });
  });
  Object.entries(L.walls).forEach(([k, w]) => w.g.children.forEach((o, i) => {
    if (seen.has(o) || o.userData.wall) return; const b = box(o), s = b.getSize(new THREE.Vector3());
    if (b.isEmpty() || Math.max(s.x, s.y, s.z) > 2.5 || Math.min(s.x, s.z) < 0.004 && s.y > 0.5) return; // dado/skirt strips
    ents.push({ name: `wall${k}:${i}`, o, wall: true, item: false });
  }));
  ents.forEach(e => e.b = box(e.o));
  const live = ents.filter(e => !e.b.isEmpty());
  // 1) walls / floor / ceiling
  live.forEach(({ name, b }) => {
    const pen = Math.max(-X - b.min.x, b.max.x - X, -Z - b.min.z, b.max.z - Z, -b.min.y, b.max.y - H);
    if (pen > tol) out.wall.push(`${name} pokes ${(pen * 100).toFixed(1)} cm through a wall/floor/ceiling`);
  });
  // 2) floating / 3) overhang: free-standing items above the floor need a surface under their footprint
  const surfaces = live.filter(e => !e.wall);
  // shelf boards and other interior levels of furniture count as surfaces too
  live.filter(e => !e.item && !e.wall).forEach(e => e.o.traverse(m => { if (m.isMesh && m.visible) { const b = new THREE.Box3().setFromObject(m); if (b.getSize(new THREE.Vector3()).y < 0.06) surfaces.push({ name: e.name, o: e.o, b }); } }));
  Object.values(L.walls).forEach(w => w.g.children.forEach(o => { if (o.userData.wall) return; o.traverse(m => { if (m.isMesh) { const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()); if (s.y < 0.04 && Math.min(s.x, s.z) > 0.1) surfaces.push({ name: 'wall-shelf', o, b }); } }); }));
  live.filter(e => e.item && !e.wall && e.b.min.y > 0.03).forEach(e => {
    const fb = e.b; let best = null, bestCover = 0;
    surfaces.forEach(s => {
      if (s === e || s.o === e.o) return;
      const top = s.b.max.y; if (Math.abs(top - fb.min.y) > 0.035 && !(s.b.min.y < fb.min.y && top > fb.min.y && top - fb.min.y < 0.06)) return;
      const ix = Math.max(0, Math.min(fb.max.x, s.b.max.x) - Math.max(fb.min.x, s.b.min.x)), iz = Math.max(0, Math.min(fb.max.z, s.b.max.z) - Math.max(fb.min.z, s.b.min.z));
      const cover = (ix * iz) / Math.max(1e-6, (fb.max.x - fb.min.x) * (fb.max.z - fb.min.z));
      if (cover > bestCover) { bestCover = cover; best = s; }
    });
    if (!best) out.floating.push(`${e.name} floats at ${fb.min.y.toFixed(2)} m with nothing under it`);
    else if (bestCover < 0.8) out.overhang.push(`${e.name} only ${(bestCover * 100).toFixed(0)}% on ${best.name}`);
  });
  // 4) overlaps between distinct objects (ignore an item sitting inside the outline of the furniture it rests on)
  const vol = b => { const s = b.getSize(new THREE.Vector3()); return s.x * s.y * s.z; };
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const a = live[i], c = live[j]; const I = a.b.clone().intersect(c.b); if (I.isEmpty()) continue;
    const v = vol(I), m = Math.min(vol(a.b), vol(c.b)); if (v < 3e-5 || v < 0.15 * m) continue;
    const container = (p, q) => !p.item && p.b.containsBox(q.b.clone().expandByScalar(-0.005));   // item on a shelf / in a cabinet outline
    if (container(a, c) || container(c, a)) continue;
    out.overlap.push(`${a.name} x ${c.name} ${(100 * v / m).toFixed(0)}%`);
  }
  return out;
}
