// Small modelling kit: cached materials, bottom-aligned primitives, canvas textures.
import * as THREE from 'three';

const matCache = new Map();
export function M(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache.has(key)) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.6, metalness: o.m ?? 0, transparent: o.o != null, opacity: o.o ?? 1, side: o.side ?? THREE.FrontSide, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, map: o.map ?? null, depthWrite: o.o != null && o.o < 0.6 ? false : true });
    matCache.set(key, m);
  }
  return matCache.get(key);
}
export const STEEL = () => M('#c9ced3', { r: 0.3, m: 0.8 });
export const ALU = () => M('#b8bcc0', { r: 0.45, m: 0.6 });
export const GLASS = () => M('#cfe6ee', { r: 0.05, o: 0.35 });
export const BLACK = () => M('#22262b', { r: 0.5 });
export const WOOD = () => M('#b7834f', { r: 0.7 });

function shadow(m) { m.castShadow = true; m.receiveShadow = true; return m; }

// box with bottom at y=0 unless at() moves it
export function B(w, h, d, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.geometry.translate(0, h / 2, 0); return shadow(m); }
// cylinder, bottom at y=0
export function C(rt, rb, h, mat, seg = 20, open = false) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat); m.geometry.translate(0, h / 2, 0); return shadow(m); }
export function S(r, mat, seg = 16) { return shadow(new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.75 | 0)), mat)); }
export function Tor(r, t, mat, arc = Math.PI * 2, seg = 24) { return shadow(new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, seg, arc), mat)); }
export function P(w, h, mat) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.receiveShadow = true; return m; }
// rod between two points
export function Rod(a, b, r, mat, seg = 8) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), len = A.distanceTo(Bv);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(A).add(Bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize());
  return shadow(m);
}
export function at(o, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; }
export function G(...kids) { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; }

// Canvas texture. draw(ctx, w, h)
export function tex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
export function texMat(w, h, draw, o = {}) { return new THREE.MeshStandardMaterial({ map: tex(w, h, draw), roughness: o.r ?? 0.7, metalness: 0, transparent: !!o.transparent }); }

// Plane with a canvas-drawn label/poster facing +z
export function Panel(w, h, px, draw, o) { return P(w, h, texMat(px, Math.round(px * h / w), draw, o)); }

export function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t; }
  if (line) ctx.fillText(line, x, y); return y;
}
export const FONT = '"Archivo", "Helvetica Neue", Arial, sans-serif';
