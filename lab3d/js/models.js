// Low-poly, real-scale models for every Composite Skill Lab catalogue item (keyed by catalogue S.No.)
// and the room fixtures. Every builder returns a Group: origin at bottom-centre, front facing +z, metres.
import * as THREE from 'three';
import { M, B, C, S, Tor, P, Rod, G, at, Panel, tex, texMat, STEEL, ALU, GLASS, BLACK, WOOD, FONT, wrapText } from './kit.js';

const red = () => M('#c62828', { r: 0.45 }), green = () => M('#2e7d32'), white = () => M('#f4f4f2', { r: 0.5 });
const plastic = (c) => M(c, { r: 0.45 });
const soil = () => M('#5b3a24', { r: 1 }), leaf = () => M('#4caf50', { r: 0.8 }), leaf2 = () => M('#7cb342', { r: 0.8 });

function plant(h = 0.2, r = 0.08, seed = 0) {
  const g = new THREE.Group();
  g.add(C(0.006, 0.008, h * 0.6, M('#558b2f')));
  for (let i = 0; i < 5; i++) { const l = S(r * (0.55 + 0.1 * (i % 3)), i % 2 ? leaf() : leaf2(), 8); l.scale.y = 0.6; l.position.set(Math.cos(i * 1.3 + seed) * r * 0.6, h * (0.45 + 0.12 * i), Math.sin(i * 1.3 + seed) * r * 0.6); g.add(l); }
  return g;
}
function handle(len, r = 0.012, mat = WOOD()) { return Rod([0, 0, 0], [0, len, 0], r, mat); }
function flat(o) { o.rotation.x = -Math.PI / 2; return o; } // lay a tool flat (y-up length → +z)

// ---------- Agriculture ----------
const A = {
  1: () => G(B(0.1, 0.13, 0.025, white()), at(Panel(0.075, 0.05, 150, (c, w, h) => { c.fillStyle = '#c8d6b9'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = `bold 34px ${FONT}`; c.fillText('27.4°', 8, 42); c.font = `22px ${FONT}`; c.fillText('RH 62%', 8, 80); }), 0, 0.08, 0.0126)),
  2: () => G(at(B(0.11, 0.02, 0.014, M('#1565c0')), 0, 0, 0), at(B(0.07, 0.012, 0.004, STEEL()), 0.085, 0.004, 0), at(B(0.03, 0.008, 0.004, M('#c9a227', { m: 0.7, r: 0.3 })), -0.07, 0.006, 0)),
  3: () => { const g = G(); for (let i = 0; i < 5; i++) g.add(at(Tor(0.16 - i * 0.004, 0.008, BLACK(), Math.PI * 2, 32), 0, 0.17, i * 0.016)); g.add(at(B(0.12, 0.08, 0.06, M('#1e88e5')), 0, 0, 0.12)); for (let i = 0; i < 4; i++) g.add(at(C(0.008, 0.008, 0.03, M('#ff7043')), -0.04 + i * 0.027, 0.08, 0.12)); return g; },
  4: () => G(C(0.075, 0.055, 0.12, plastic('#bf5b30'), 16), at(C(0.07, 0.07, 0.005, soil()), 0, 0.11, 0), at(plant(0.16, 0.06), 0, 0.11, 0)),
  5: () => G(handle(0.32), at(B(0.06, 0.07, 0.006, M('#555', { m: 0.6 })), 0, 0.3, 0.03)),
  6: () => { const g = G(handle(1.3, 0.013)); const head = at(B(0.3, 0.02, 0.02, M('#666', { m: 0.6 })), 0, 1.3, 0); g.add(head); for (let i = 0; i < 12; i++) g.add(at(B(0.008, 0.06, 0.008, M('#666', { m: 0.6 })), -0.14 + i * 0.0255, 1.25, 0.015)); return g; },
  7: () => G(at(C(0.014, 0.014, 0.12, plastic('#2e7d32'), 10), 0, 0, 0), at(B(0.06, 0.15, 0.01, STEEL()), 0, 0.12, 0)),
  8: () => { const g = G(C(0.17, 0.14, 0.18, M('#a1887f', { r: 1 }), 16, true)); const cs = ['#43a047', '#fb8c00', '#43a047', '#1e88e5']; for (let i = 0; i < 7; i++) { const s = S(0.05, plastic(cs[i % 4]), 8); s.scale.set(1.3, 0.5, 0.8); s.position.set(Math.cos(i) * 0.08, 0.17, Math.sin(i * 1.7) * 0.07); g.add(s); } return g; },
  9: () => { const g = G(B(0.61, 0.1, 0.305, M('#262a2e', { r: 0.5 }))); g.add(at(B(0.58, 0.01, 0.28, M('#4fc3f7', { o: 0.7 })), 0, 0.085, 0)); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.add(at(plant(0.1, 0.04, i + j), -0.22 + i * 0.145, 0.09, -0.07 + j * 0.14)); return g; },
  10: () => G(at(C(0.07, 0.07, 0.035, M('#f57c00')), 0, 0.07, 0, 0, Math.PI / 2), at(B(0.03, 0.05, 0.02, BLACK()), 0, 0, 0)),
  11: () => G(C(0.035, 0.032, 0.1, GLASS(), 16), at(C(0.03, 0.03, 0.04, M('#81c784', { o: 0.6 })), 0, 0.003, 0)),
  12: () => G(C(0.15, 0.12, 0.3, plastic('#1976d2')), at(Tor(0.15, 0.004, M('#333'), Math.PI), 0, 0.3, 0)),
  13: () => G(C(0.18, 0.14, 0.14, plastic('#a1471f')), at(C(0.17, 0.17, 0.005, soil()), 0, 0.13, 0), at(plant(0.3, 0.12, 2), 0, 0.13, 0)),
  14: () => G(at(B(0.12, 0.004, 0.02, STEEL()), 0.06, 0, 0), at(B(0.12, 0.004, 0.02, STEEL()), 0.06, 0.004, 0, 0.12), at(Tor(0.022, 0.006, plastic('#d32f2f')), -0.02, 0.006, 0.015, 0, Math.PI / 2), at(Tor(0.022, 0.006, plastic('#d32f2f')), -0.02, 0.006, -0.015, 0, Math.PI / 2)),
  15: () => G(at(B(0.13, 0.016, 0.02, plastic('#2e7d32')), 0, 0, 0.012, 0.12), at(B(0.13, 0.016, 0.02, plastic('#2e7d32')), 0, 0, -0.012, -0.12), at(B(0.06, 0.006, 0.025, STEEL()), 0.09, 0.006, 0)),
  16: () => G(handle(0.95, 0.014), at(Tor(0.05, 0.012, BLACK(), Math.PI), 0, 0.95, 0, 0, 0, 0), at(B(0.18, 0.26, 0.012, M('#6d6d6d', { m: 0.7, r: 0.4 })), 0, -0.25, 0)),
  17: () => G(at(handle(0.14, 0.014), 0, 0, 0), at(Tor(0.12, 0.008, STEEL(), Math.PI * 1.1, 20), 0.12, 0.15, 0, 0, 0, -0.3)),
  18: () => { const g = G(B(0.22, 0.06, 0.15, plastic('#00897b'))); g.add(at(B(0.2, 0.004, 0.13, white()), 0, 0.06, 0)); for (let i = 0; i < 4; i++) g.add(at(C(0.01, 0.01, 0.08, GLASS()), -0.06 + i * 0.04, 0.06, 0)); return g; },
  19: () => G(C(0.06, 0.065, 0.22, M('#f5f5f5', { r: 0.4 })), at(C(0.03, 0.04, 0.04, M('#2e7d32')), 0, 0.22, 0), at(C(0.008, 0.008, 0.12, M('#2e7d32')), 0, 0.26, 0), at(Rod([0, 0.3, 0], [0.1, 0.25, 0.05], 0.006, BLACK()), 0, 0, 0)),
  20: () => G(C(0.09, 0.1, 0.22, plastic('#43a047')), at(Rod([0.06, 0.04, 0], [0.26, 0.24, 0], 0.012, plastic('#43a047')), 0, 0, 0), at(C(0.025, 0.012, 0.03, plastic('#2e7d32')), 0.26, 0.23, 0, 0, 0, -0.8), at(Tor(0.08, 0.012, plastic('#43a047'), Math.PI), -0.03, 0.22, 0)),
  21: () => G(at(C(0.016, 0.016, 0.11, WOOD()), 0, 0, 0), at(Tor(0.045, 0.006, M('#555', { m: 0.6 }), Math.PI), 0.03, 0.13, 0)),
  22: () => G(B(0.16, 0.04, 0.16, white()), at(C(0.08, 0.08, 0.01, STEEL()), 0, 0.04, 0), at(Panel(0.05, 0.02, 100, (c, w, h) => { c.fillStyle = '#9ccc65'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = `bold 30px ${FONT}`; c.fillText('0.450', 10, 33); }), 0, 0.02, 0.0805)),
  23: () => nft(),
};
function nft() { // 40-plant NFT kit: stepped A-frame, 4 channels x 10 net pots, reservoir + pump line
  const g = new THREE.Group(), frame = M('#e0e0e0', { m: 0.4, r: 0.4 }), pipe = white();
  [[-1.0, 0], [1.0, 0]].forEach(([x]) => { g.add(Rod([x, 0, -0.22], [x, 1.35, -0.05], 0.015, frame)); g.add(Rod([x, 0, 0.22], [x, 1.35, 0.05], 0.015, frame)); });
  const ch = [[0.35, 0.18], [0.7, 0.12], [1.0, -0.12], [1.3, -0.04]];
  ch.forEach(([y, z], k) => {
    const p = at(C(0.045, 0.045, 2.2, pipe, 14), 0, y, z, 0, 0, Math.PI / 2); p.position.x = 1.1; p.geometry.translate(0, 0, 0); g.add(p);
    for (let i = 0; i < 10; i++) { const x = -0.95 + i * 0.21; g.add(at(C(0.03, 0.025, 0.03, BLACK()), x, y + 0.03, z)); g.add(at(plant(0.15 + 0.05 * ((i + k) % 3), 0.06, i + k), x, y + 0.05, z)); }
  });
  g.add(at(B(0.6, 0.3, 0.35, plastic('#37474f')), 0, 0, 0)); g.add(at(Rod([0.2, 0.3, 0], [0.9, 1.3, -0.04], 0.008, BLACK()), 0, 0, 0));
  return g;
}

// ---------- Food Production ----------
const F = {
  24: () => G(B(0.18, 0.025, 0.2, M('#eceff1')), at(B(0.15, 0.004, 0.15, STEEL()), 0, 0.025, -0.02), at(Panel(0.08, 0.025, 100, (c, w, h) => { c.fillStyle = '#263238'; c.fillRect(0, 0, w, h); c.fillStyle = '#7cf'; c.font = `bold 22px ${FONT}`; c.fillText('250 g', 12, 24); }), 0, 0.013, 0.1005)),
  25: () => G(B(0.24, 0.005, 0.2, plastic('#1e88e5')), at(B(0.24, 0.06, 0.005, plastic('#1e88e5')), 0, 0, -0.1), at(Rod([0, 0.06, -0.1], [0, 0.6, -0.12], 0.01, plastic('#1e88e5')), 0, 0, 0)),
  26: () => oven(),
  27: () => G(C(0.12, 0.1, 0.045, STEEL(), 24), at(C(0.1, 0.1, 0.003, M('#b87333', { m: 0.8, r: 0.35 })), 0, 0, 0), at(Rod([0.12, 0.035, 0], [0.32, 0.05, 0], 0.012, BLACK()), 0, 0, 0)),
  28: () => G(at(Rod([0, 0, 0], [0.22, 0, 0], 0.006, STEEL()), 0, 0.01, 0), at(B(0.06, 0.02, 0.02, M('#e53935')), -0.03, 0, 0)),
  29: () => G(C(0.055, 0.055, 0.12, GLASS(), 16), at(C(0.04, 0.04, 0.07, M('#f9a825', { r: 0.9 })), 0, 0.005, 0), at(C(0.058, 0.058, 0.02, plastic('#e53935')), 0, 0.12, 0)),
  30: () => G(C(0.04, 0.06, 0.22, STEEL(), 4), at(Tor(0.03, 0.006, BLACK(), Math.PI), 0, 0.22, 0)),
  31: () => G(at(C(0.03, 0.03, 0.08, STEEL(), 16), 0, 0.03, 0, 0, 0, Math.PI / 2), at(Rod([0, 0.03, 0], [0, 0.03, 0.2], 0.008, BLACK()), 0, 0, 0)),
  32: () => G(C(0.1, 0.1, 0.16, ALU(), 22), at(C(0.104, 0.104, 0.012, ALU()), 0, 0.16, 0), at(C(0.015, 0.015, 0.015, BLACK()), 0, 0.172, 0)),
  33: () => { const g = G(at(B(0.1, 0.2, 0.12, WOOD()), 0, 0, 0, 0, 0.3)); for (let i = 0; i < 4; i++) g.add(at(B(0.018, 0.09, 0.022, BLACK()), -0.03 + i * 0.02, 0.18, -0.03, 0, 0.3)); return g; },
  34: () => G(C(0.045, 0.04, 0.1, M('#e3f2fd', { o: 0.6 }), 16), at(Tor(0.03, 0.006, M('#e3f2fd', { o: 0.7 }), Math.PI), 0.05, 0.05, 0, Math.PI / 2, 0, -Math.PI / 2)),
  35: () => { const g = G(at(Tor(0.025, 0.003, STEEL()), 0, 0.06, 0, 0, Math.PI / 2)); ['#e53935', '#fdd835', '#43a047', '#1e88e5'].forEach((c, i) => { g.add(at(Rod([0, 0.06, 0], [0.12 * Math.cos(i * 0.4), 0.0, 0.12 * Math.sin(i * 0.4)], 0.006, plastic(c)), 0, 0, 0)); g.add(at(S(0.015 + i * 0.003, plastic(c), 10), 0.12 * Math.cos(i * 0.4), 0.0, 0.12 * Math.sin(i * 0.4))); }); return g; },
  36: () => G(B(0.2, 0.17, 0.2, M('#fafafa', { r: 0.35 })), at(C(0.03, 0.03, 0.02, BLACK()), 0, 0.08, 0.1, 0, Math.PI / 2), at(C(0.075, 0.06, 0.2, STEEL(), 18), 0, 0.17, 0), at(C(0.078, 0.078, 0.03, BLACK()), 0, 0.37, 0)),
  37: () => G(C(0.13, 0.11, 0.26, plastic('#1e88e5')), at(Tor(0.13, 0.004, M('#333'), Math.PI), 0, 0.26, 0)),
  38: () => { const g = G(); ['#f5f5f5', '#eeeeee', '#f5f5f5', '#eeeeee'].forEach((c, i) => { g.add(at(B(0.16 - i * 0.02, 0.07, 0.11 - i * 0.012, M('#f5f5f5', { o: 0.7 })), 0, i * 0.08, 0)); g.add(at(B(0.162 - i * 0.02, 0.012, 0.112 - i * 0.012, plastic(c)), 0, i * 0.08 + 0.07, 0)); }); return g; },
  39: () => G(C(0.13, 0.12, 0.34, plastic('#78858f')), at(C(0.135, 0.135, 0.03, plastic('#5f6b74')), 0, 0.34, 0)),
  40: () => G(C(0.13, 0.13, 0.02, WOOD(), 28), at(C(0.02, 0.02, 0.3, M('#a0703c'), 12), 0, 0.04, 0, 0, Math.PI / 2, 0.4)),
  41: () => G(C(0.11, 0.11, 0.17, ALU(), 24), at(C(0.112, 0.105, 0.03, ALU(), 24), 0, 0.17, 0), at(C(0.012, 0.015, 0.05, BLACK()), 0, 0.2, 0), at(Rod([0.1, 0.18, 0], [0.32, 0.19, 0], 0.014, BLACK()), 0, 0, 0)),
  42: () => A[14](),
  43: () => { const g = G(at(Rod([-0.25, 0.5, 0], [0.25, 0.5, 0], 0.006, STEEL()), 0, 0, 0)); [-0.2, -0.1, 0, 0.1, 0.2].forEach((x, i) => { g.add(Rod([x, 0.49, 0.01], [x, 0.22, 0.01], 0.006, STEEL())); g.add(at(S(i % 2 ? 0.03 : 0.04, STEEL(), 10), x, 0.2, 0.02)); }); return g; },
  44: () => sieve(STEEL()),
  45: () => sieve(plastic('#26a69a')),
  46: () => stove(),
  47: () => G(C(0.07, 0.07, 0.11, STEEL(), 20), at(C(0.09, 0.09, 0.14, STEEL(), 20), 0.2, 0, 0)),
  48: () => { const g = G(); for (let i = 0; i < 4; i++) g.add(at(C(0.13, 0.11, 0.012, STEEL(), 28), 0, i * 0.013, 0)); return g; },
  49: () => { const g = G(); for (let i = 0; i < 4; i++) g.add(at(C(0.076, 0.05, 0.05, STEEL(), 20), 0, i * 0.018, 0)); return g; },
  50: () => { const g = G(C(0.04, 0.035, 0.1, STEEL(), 16)); for (let i = 0; i < 6; i++) g.add(at(Rod([0, 0.04, 0], [Math.cos(i) * 0.03, 0.18, Math.sin(i) * 0.03], 0.004, STEEL()), 0, 0, 0)); return g; },
  51: () => G(at(Rod([0, 0, 0], [0.25, 0.02, 0.02], 0.005, STEEL()), 0, 0.01, 0), at(Rod([0, 0, 0], [0.25, 0.02, -0.02], 0.005, STEEL()), 0, 0.01, 0)),
  52: () => G(at(Rod([0, 0, 0], [0.11, 0, 0], 0.01, plastic('#fb8c00')), 0, 0.01, 0), at(B(0.05, 0.004, 0.03, STEEL()), 0.13, 0.008, 0)),
  53: () => G(C(0.06, 0.07, 0.18, STEEL(), 20), at(C(0.015, 0.03, 0.04, STEEL(), 10), 0.06, 0.15, 0, 0, 0, -0.9), at(Tor(0.05, 0.008, STEEL(), Math.PI), -0.07, 0.1, 0, 0, 0, Math.PI / 2)),
  54: () => { const g = G(at(C(0.012, 0.012, 0.12, BLACK(), 8), 0, 0, 0)); for (let i = 0; i < 4; i++) { const t = Tor(0.035, 0.002, STEEL(), Math.PI * 2, 16); t.scale.set(1, 2.2, 1); at(t, 0, 0.19, 0, i * Math.PI / 4); g.add(t); } return g; },
  55: () => G(at(Rod([0, 0, 0], [0.18, 0.02, 0], 0.006, STEEL()), 0, 0.01, 0), at(Tor(0.03, 0.005, STEEL(), Math.PI), 0.19, 0.03, 0, 0, Math.PI / 2)),
};
function oven() {
  const g = G(B(0.5, 0.32, 0.38, M('#3e4348', { r: 0.4, m: 0.3 })));
  g.add(at(B(0.34, 0.24, 0.005, M('#111', { r: 0.1, o: 0.85 })), -0.06, 0.04, 0.191));
  g.add(at(Rod([-0.22, 0.29, 0.2], [0.1, 0.29, 0.2], 0.008, STEEL()), 0, 0, 0));
  for (let i = 0; i < 3; i++) g.add(at(C(0.022, 0.022, 0.02, BLACK()), 0.19, 0.08 + i * 0.08, 0.19, 0, Math.PI / 2));
  g.add(at(B(0.3, 0.003, 0.25, M('#ff8a3d', { e: '#ff5a1f', ei: 0.6 })), -0.06, 0.06, 0));
  return g;
}
function stove() {
  const g = G(B(0.3, 0.09, 0.3, STEEL()));
  g.add(at(C(0.09, 0.09, 0.01, BLACK(), 24), 0, 0.09, -0.02));
  g.add(at(C(0.05, 0.05, 0.02, M('#444', { m: 0.6 }), 16), 0, 0.09, -0.02));
  for (let i = 0; i < 4; i++) g.add(at(B(0.02, 0.025, 0.14, BLACK()), 0, 0.1, -0.02, i * Math.PI / 4));
  g.add(at(C(0.02, 0.02, 0.03, BLACK()), 0.1, 0.035, 0.15, 0, Math.PI / 2));
  g.add(at(Rod([-0.15, 0.04, 0], [-0.3, 0.02, -0.2], 0.008, M('#ff6f00')), 0, 0, 0));
  return g;
}
function sieve(mat) { const g = G(); const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(mat.color.getStyle(), { r: 0.4, m: mat.metalness, side: THREE.DoubleSide })); bowl.material.wireframe = false; bowl.position.y = 0.08; g.add(bowl); g.add(at(Rod([0.08, 0.08, 0], [0.24, 0.09, 0], 0.007, mat), 0, 0, 0)); return g; }

// ---------- IT / ITeS, Healthcare, BFSI ----------
const IT = {
  57: () => G(B(0.08, 0.035, 0.03, BLACK()), at(C(0.012, 0.012, 0.005, M('#4fc3f7', { r: 0.1 })), 0, 0.017, 0.015, 0, Math.PI / 2)),
  58: () => G(at(Tor(0.08, 0.009, BLACK(), Math.PI), 0, 0.03, 0), at(C(0.035, 0.035, 0.025, BLACK()), -0.08, 0, 0, 0, 0, Math.PI / 2), at(C(0.035, 0.035, 0.025, BLACK()), 0.08, 0, 0, 0, 0, Math.PI / 2), at(Rod([-0.08, 0.0, 0.01], [-0.02, -0.02, 0.08], 0.003, BLACK()), 0, 0, 0)),
};
const pack = (w, h, d, c, label) => { const g = G(B(w, h, d, plastic(c))); if (label) g.add(at(Panel(w * 0.9, h * 0.6, 160, (x, W, H) => { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = c; x.font = `bold ${H * 0.45 | 0}px ${FONT}`; x.textAlign = 'center'; x.fillText(label, W / 2, H * 0.65); }), 0, h * 0.5, d / 2 + 0.001)); return g; };
const H = {
  59: () => pack(0.06, 0.09, 0.012, '#fbc02d', 'AAA'),
  60: () => G(B(0.12, 0.05, 0.14, white()), at(Panel(0.06, 0.04, 100, (c, w, h) => { c.fillStyle = '#b3c8a2'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = `bold 24px ${FONT}`; c.fillText('118', 8, 28); c.font = `bold 18px ${FONT}`; c.fillText('78', 60, 52); }), 0, 0.051, 0.01, 0, -Math.PI / 2), at(B(0.14, 0.03, 0.09, M('#283593', { r: 0.9 })), 0.16, 0, 0), at(Rod([0.06, 0.03, 0], [0.12, 0.02, 0.02], 0.004, BLACK()), 0, 0, 0)),
  61: () => G(at(C(0.04, 0.04, 0.12, M('#fafafa', { r: 1 }), 14), 0, 0.04, 0, 0, 0, Math.PI / 2)),
  62: () => cprMannequin(),
  63: () => G(at(B(0.12, 0.015, 0.02, white()), 0, 0, 0), at(B(0.03, 0.016, 0.012, M('#90a4ae')), -0.03, 0.002, 0)),
  64: () => pack(0.24, 0.12, 0.12, '#1e88e5', 'GLOVES'),
  65: () => G(B(0.06, 0.02, 0.1, M('#37474f')), at(B(0.04, 0.002, 0.04, M('#9be7ff')), 0, 0.02, 0.02)),
  66: () => statureMeter(),
  67: () => G(C(0.04, 0.04, 0.18, M('#bbdefb', { o: 0.75 }), 16), at(C(0.015, 0.02, 0.05, white()), 0, 0.18, 0), at(B(0.06, 0.01, 0.015, white()), 0.02, 0.22, 0)),
  68: () => { const g = G(); const s = S(0.1, M('#e53935', { r: 0.5 }), 16); s.scale.set(1, 0.18, 1.4); s.position.y = 0.02; g.add(s); g.add(at(C(0.02, 0.02, 0.04, M('#b71c1c')), 0, 0.01, 0.14, 0, Math.PI / 2)); return g; },
  69: () => G(at(Rod([0, 0.005, 0], [0.12, 0.005, 0], 0.004, GLASS()), 0, 0, 0), at(S(0.006, M('#9e9e9e', { m: 1, r: 0.1 })), 0, 0.005, 0)),
  70: () => { const g = G(); for (let i = 0; i < 4; i++) g.add(at(pack(0.3, 0.05, 0.22, '#4fc3f7', i === 3 ? 'PPE KIT' : ''), 0, i * 0.05, 0)); return g; },
  71: () => G(B(0.035, 0.03, 0.06, M('#1565c0')), at(B(0.025, 0.002, 0.03, M('#80deea', { e: '#00e5ff', ei: 0.4 })), 0, 0.03, 0)),
  72: () => G(at(C(0.018, 0.012, 0.12, M('#d32f2f'), 12), 0, 0.018, 0, 0, 0, Math.PI / 2), at(C(0.01, 0.01, 0.02, white()), 0.07, 0.018, 0, 0, 0, Math.PI / 2)),
  73: () => G(at(Rod([0, 0.01, 0], [0.18, 0.01, 0], 0.005, STEEL()), 0, 0, 0), at(S(0.022, M('#e53935'), 10), 0.19, 0.022, 0)),
  74: () => A[14](),
  75: () => G(C(0.04, 0.04, 0.17, M('#e1f5fe', { r: 0.3 }), 16), at(C(0.045, 0.045, 0.03, M('#0277bd')), 0, 0.17, 0)),
  76: () => { const g = G(); for (let i = 0; i < 3; i++) { g.add(at(Rod([0, 0.01, 0], [0.12, 0.01, 0], 0.008, M('#eceff1', { o: 0.8 })), 0, 0, i * 0.025)); g.add(at(Rod([0.12, 0.01, 0], [0.16, 0.01, 0], 0.001, STEEL()), 0, 0, i * 0.025)); } return g; },
  77: () => { const g = G(); ['#ffffff', '#81d4fa', '#ffffff', '#81d4fa'].forEach((c, i) => g.add(at(B(0.15, 0.025, 0.15, M(c, { r: 1 })), 0, i * 0.026, 0))); return g; },
  78: () => G(B(0.3, 0.06, 0.32, white()), at(C(0.06, 0.06, 0.005, M('#fffde7')), 0, 0.06, 0.09), at(B(0.26, 0.004, 0.18, M('#90a4ae', { r: 0.9 })), 0, 0.06, -0.05)),
};
function cprMannequin() {
  const skin = M('#e8c4a0', { r: 0.6 });
  const g = G(at(B(0.7, 0.02, 0.45, M('#1565c0', { r: 0.9 })), 0, 0, 0));
  const torso = B(0.42, 0.14, 0.32, skin); torso.position.set(0.06, 0.02, 0); g.add(torso);
  const head = S(0.1, skin, 16); head.position.set(-0.24, 0.1, 0); g.add(head);
  g.add(at(C(0.045, 0.05, 0.07, skin, 10), -0.14, 0.06, 0, 0, 0, Math.PI / 2));
  g.add(at(B(0.42, 0.003, 0.22, M('#90a4ae', { r: 0.9 })), 0.06, 0.161, 0));
  return g;
}
function statureMeter() { const g = G(at(Panel(0.06, 2.0, 60, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; for (let i = 0; i <= 200; i++) { const y = h - (i / 200) * h; c.fillRect(0, y, i % 10 ? 10 : 25, 1); if (i % 20 === 0) { c.font = `14px ${FONT}`; c.fillText(String(i), 30, y + 5); } } }), 0, 1.0, 0)); g.add(at(B(0.12, 0.02, 0.18, M('#1976d2')), 0, 1.5, 0.09)); return g; }
const BF = {
  79: () => { const g = G(B(0.3, 0.06, 0.2, plastic('#00897b'))); for (let i = 0; i < 3; i++) g.add(at(B(0.14, 0.004, 0.065, M(['#a5d6a7', '#ffcc80', '#ce93d8'][i], { r: 0.9 })), 0.22, i * 0.005, -0.05 + i * 0.03, 0.2 * i)); g.add(at(B(0.16, 0.01, 0.07, M('#1565c0')), 0.25, 0, 0.08)); return g; },
  80: () => boardGame(),
  81: () => G(B(0.075, 0.012, 0.13, M('#37474f')), at(B(0.06, 0.002, 0.025, M('#c5e1a5')), 0, 0.012, -0.035), at(B(0.06, 0.002, 0.07, M('#90a4ae')), 0, 0.012, 0.02)),
  82: () => { const g = G(); ['#ef6c00', '#00897b', '#5e35b1'].forEach((c, i) => g.add(at(B(0.21, 0.008, 0.297, M(c, { r: 0.9 })), 0, i * 0.009, 0, i * 0.08))); g.add(at(Panel(0.15, 0.06, 200, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#5e35b1'; c.font = `bold 28px ${FONT}`; c.fillText('BFSI Case Studies', 8, 50); }), 0, 0.028, -0.05, 0.16, -Math.PI / 2)); return g; },
};
function boardGame() {
  const g = G(at(Panel(0.5, 0.5, 512, (c, w, h) => {
    c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); const n = 9, s = w / n, cols = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc'];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i === 0 || j === 0 || i === n - 1 || j === n - 1) { c.fillStyle = cols[(i + j) % 5]; c.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); }
    c.fillStyle = '#1b5e20'; c.font = `bold 46px ${FONT}`; c.textAlign = 'center'; c.fillText('MONEY SMART', w / 2, h / 2 - 10); c.font = `24px ${FONT}`; c.fillText('Budget · Save · Invest', w / 2, h / 2 + 30);
  }), 0, 0.004, 0, 0, -Math.PI / 2));
  g.add(at(B(0.5, 0.004, 0.5, M('#5d4037')), 0, 0, 0)); g.children[0].position.y = 0.0045;
  ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28'].forEach((c, i) => g.add(at(C(0.012, 0.015, 0.03, plastic(c), 10), -0.2 + i * 0.03, 0.005, 0.2)));
  g.add(at(B(0.025, 0.025, 0.025, white()), 0.05, 0.005, 0.05, 0.5));
  return g;
}

// ---------- General & Safety ----------
const GE = {
  83: () => worktable(), 84: () => chair(), 85: () => teacherTable(), 86: () => teacherChair(), 87: () => cupboard(),
  88: () => pegboard(), 89: () => binRack(), 90: () => ledDisplay(), 91: () => router(),
};
const SA = {
  92: () => extinguisher('CO2'), 93: () => extinguisher('ABC'), 94: () => firstAid(), 95: () => signage(), 96: () => sandStand(),
  97: () => { const g = G(B(0.36, 0.2, 0.26, plastic('#455a64'))); for (let i = 0; i < 6; i++) { const s = S(0.05, plastic(i % 2 ? '#fff' : '#ffb300'), 8); s.scale.set(1.4, 0.5, 0.8); s.position.set(-0.1 + (i % 3) * 0.1, 0.2, i < 3 ? -0.05 : 0.05); g.add(s); } return g; },
  98: () => apronRail(), 99: () => { const g = G(B(0.36, 0.14, 0.26, plastic('#455a64'))); for (let i = 0; i < 4; i++) g.add(at(B(0.15, 0.045, 0.06, M('#b3e5fc', { o: 0.7 })), -0.08 + (i % 2) * 0.16, 0.14, i < 2 ? -0.05 : 0.05)); return g; },
};
export function worktable(w = 1.22, l = 1.83, h = 0.74) { // 6x4 ft laminate top
  const top = M('#e8dcc6', { r: 0.55 }), leg = M('#4a5560', { m: 0.6, r: 0.4 }), edge = M('#ef7d37', { r: 0.5 });
  const g = G(at(B(w, 0.03, l, top), 0, h - 0.03, 0), at(B(w + 0.004, 0.012, l + 0.004, edge), 0, h - 0.03, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(at(B(0.05, h - 0.03, 0.05, leg), a * (w / 2 - 0.06), 0, b * (l / 2 - 0.06))));
  g.add(at(B(w - 0.12, 0.05, 0.03, leg), 0, h - 0.13, l / 2 - 0.06)); g.add(at(B(w - 0.12, 0.05, 0.03, leg), 0, h - 0.13, -l / 2 + 0.06));
  return g;
}
const chairColors = ['#ef7d37', '#2a6f97', '#ef7d37', '#3a8d5c'];
let chairN = 0;
export function chair(color) { // stackable student chair, seat 0.43 m
  const c = M(color ?? chairColors[chairN++ % chairColors.length], { r: 0.45 }), f = M('#3c4650', { m: 0.6, r: 0.35 });
  const g = G(at(B(0.42, 0.025, 0.4, c), 0, 0.42, 0.02), at(B(0.42, 0.26, 0.02, c), 0, 0.56, -0.19, 0, -0.08));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(Rod([a * 0.19, 0, b * 0.18 + 0.02], [a * 0.19, 0.42, b * 0.17 + 0.02], 0.011, f)));
  g.add(Rod([-0.19, 0.42, -0.17], [-0.19, 0.78, -0.2], 0.011, f)); g.add(Rod([0.19, 0.42, -0.17], [0.19, 0.78, -0.2], 0.011, f));
  return g;
}
function teacherTable() {
  const t = M('#8d6e63', { r: 0.6 }), g = G(at(B(1.4, 0.04, 0.7, t), 0, 0.72, 0), at(B(0.45, 0.7, 0.65, t), 0.45, 0.02, 0), at(B(0.04, 0.72, 0.65, t), -0.68, 0, 0), at(B(1.3, 0.4, 0.02, t), 0, 0.3, -0.32));
  for (let i = 0; i < 3; i++) g.add(at(B(0.12, 0.015, 0.01, STEEL()), 0.45, 0.18 + i * 0.22, 0.33));
  g.add(at(B(0.34, 0.015, 0.24, M('#cfd8dc', { m: 0.5, r: 0.3 })), -0.25, 0.76, 0.05)); // laptop base
  const lid = at(B(0.34, 0.22, 0.012, M('#cfd8dc', { m: 0.5, r: 0.3 })), -0.25, 0.775, -0.07, 0, -0.25); g.add(lid);
  g.add(at(Panel(0.31, 0.19, 256, (c, w, h) => { c.fillStyle = '#1b242d'; c.fillRect(0, 0, w, h); c.fillStyle = '#ef7d37'; c.fillRect(10, 10, w * 0.4, 16); c.fillStyle = '#a9b7c2'; for (let i = 0; i < 7; i++) c.fillRect(10, 40 + i * 18, (w - 20) * (0.4 + 0.5 * ((i * 37) % 10) / 10), 8); }), -0.25, 0.888, -0.0565, 0, -0.25));
  for (let i = 0; i < 3; i++) g.add(at(B(0.22, 0.02, 0.3, M(['#ef6c00', '#00897b', '#5e35b1'][i], { r: 0.9 })), 0.42, 0.76 + i * 0.021, -0.08, 0.1 * i));
  return g;
}
function teacherChair() {
  const c = M('#263238', { r: 0.7 }), f = BLACK(), g = G(at(B(0.5, 0.08, 0.48, c), 0, 0.46, 0), at(B(0.48, 0.55, 0.07, c), 0, 0.56, -0.24, 0, -0.1), at(C(0.03, 0.03, 0.4, f), 0, 0.06, 0));
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; g.add(Rod([0, 0.06, 0], [Math.cos(a) * 0.3, 0.04, Math.sin(a) * 0.3], 0.015, f)); g.add(at(S(0.025, f, 8), Math.cos(a) * 0.3, 0.025, Math.sin(a) * 0.3)); }
  return g;
}
export function cupboard(w = 0.91, h = 1.98, d = 0.48) { // steel, lockable, adjustable shelves
  const body = M('#8a9aa6', { m: 0.55, r: 0.4 }), g = G(B(w, h, d, body));
  g.add(at(B(0.004, h - 0.06, 0.004, M('#5a6670', { m: 0.6 })), 0, 0.03, d / 2 + 0.002));
  [-1, 1].forEach(s => { g.add(at(B(0.015, 0.2, 0.02, STEEL()), s * 0.05, h * 0.5, d / 2 + 0.01)); for (let i = 0; i < 6; i++) g.add(at(B(w / 2 - 0.12, 0.006, 0.002, M('#6c7a85')), s * w / 4, 0.12 + i * 0.03, d / 2 + 0.002)); });
  g.add(at(C(0.012, 0.012, 0.01, M('#c9a227', { m: 0.8, r: 0.3 })), 0.03, h * 0.5 + 0.15, d / 2 + 0.006, 0, Math.PI / 2));
  return g;
}
export function pegboard(w = 1.22, h = 0.91) {
  const g = G(at(Panel(w, h, 512, (c, W, Hh) => { c.fillStyle = '#c69c6d'; c.fillRect(0, 0, W, Hh); c.fillStyle = '#7a5a3a'; for (let x = 12; x < W; x += 21) for (let y = 12; y < Hh; y += 21) { c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); } c.strokeStyle = '#6b4a2a'; c.lineWidth = 10; c.strokeRect(0, 0, W, Hh); }), 0, 0, 0.012));
  g.add(at(B(w, h, 0.012, M('#a07850')), 0, -h / 2, 0));
  return g;
}
function binRack() { // 4 sets = 20 labelled stackable bins on a rack
  const fr = M('#5a6670', { m: 0.6, r: 0.4 }), g = G();
  [[-0.48, -0.18], [0.48, -0.18], [-0.48, 0.18], [0.48, 0.18]].forEach(([x, z]) => g.add(at(B(0.03, 1.6, 0.03, fr), x, 0, z)));
  const cols = ['#ef7d37', '#2a6f97', '#3a8d5c', '#f2b134'];
  for (let r = 0; r < 5; r++) { g.add(at(B(0.99, 0.02, 0.4, fr), 0, 0.05 + r * 0.31, 0)); for (let k = 0; k < 4; k++) { const b = G(B(0.22, 0.22, 0.36, plastic(cols[k])), at(B(0.12, 0.08, 0.004, M(cols[k], { r: 0.4 })), 0, 0.13, 0.182), at(Panel(0.09, 0.035, 90, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = `bold 20px ${FONT}`; c.fillText(`BIN ${r * 4 + k + 1}`, 8, 28); }), 0, 0.06, 0.181)); b.position.set(-0.36 + k * 0.24, 0.07 + r * 0.31, 0); g.add(b); } }
  return g;
}
function ledDisplay() {
  const g = G(B(1.46, 0.85, 0.05, M('#111', { r: 0.25 })));
  g.userData.screen = at(new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.8), new THREE.MeshBasicMaterial({ color: '#fff' })), 0, 0.425, 0.026);
  g.add(g.userData.screen); return g;
}
function router() { const g = G(B(0.22, 0.035, 0.14, M('#fafafa', { r: 0.4 }))); [-0.08, 0, 0.08].forEach((x, i) => g.add(at(C(0.006, 0.008, 0.16, BLACK()), x, 0.03, -0.06, 0, (i - 1) * 0.25))); for (let i = 0; i < 4; i++) g.add(at(S(0.004, M('#76ff03', { e: '#76ff03', ei: 1 })), -0.06 + i * 0.03, 0.02, 0.071)); return g; }
function extinguisher(type) {
  const g = G(at(C(0.07, 0.07, 0.42, M('#d32f2f', { r: 0.3, m: 0.2 }), 18), 0, 0, 0), at(S(0.07, M('#d32f2f', { r: 0.3, m: 0.2 }), 18), 0, 0.42, 0), at(C(0.02, 0.025, 0.07, BLACK()), 0, 0.47, 0), at(B(0.1, 0.015, 0.03, BLACK()), 0.03, 0.53, 0));
  if (type === 'CO2') g.add(at(C(0.035, 0.012, 0.12, BLACK()), 0.07, 0.32, 0.03, 0, 0, 0.3)); else g.add(Rod([0.02, 0.5, 0.02], [0.08, 0.15, 0.06], 0.008, BLACK()));
  g.add(at(Panel(0.1, 0.13, 120, (c, w, h) => { c.fillStyle = type === 'CO2' ? '#111' : '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold 34px ${FONT}`; c.textAlign = 'center'; c.fillText(type, w / 2, h * 0.45); c.font = `18px ${FONT}`; c.fillText('2 kg  ISI', w / 2, h * 0.75); }), 0, 0.22, 0.071));
  g.add(at(B(0.12, 0.05, 0.02, M('#333', { m: 0.5 })), 0, 0.3, -0.08));
  return g;
}
function firstAid() { const g = G(B(0.36, 0.28, 0.12, M('#f5f5f5', { r: 0.4 }))); g.add(at(Panel(0.3, 0.22, 200, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#2e7d32'; c.fillRect(w / 2 - 22, 20, 44, h - 70); c.fillRect(w / 2 - 60, h / 2 - 37, 120, 44); c.font = `bold 22px ${FONT}`; c.textAlign = 'center'; c.fillText('FIRST AID', w / 2, h - 12); }), 0, 0.14, 0.061)); return g; }
export function signage(text = 'FIRE EXIT', color = '#1b8a3a', w = 0.5, h = 0.18) { return G(Panel(w, h, 300, (c, W, Hh) => { c.fillStyle = color; c.fillRect(0, 0, W, Hh); c.fillStyle = '#fff'; c.font = `bold ${Hh * 0.42 | 0}px ${FONT}`; c.textAlign = 'center'; c.fillText(text, W / 2 + (text === 'FIRE EXIT' ? 26 : 0), Hh * 0.64); if (text === 'FIRE EXIT') { c.fillRect(18, Hh * 0.2, 6, Hh * 0.6); c.beginPath(); c.arc(40, Hh * 0.28, 8, 0, 7); c.fill(); c.fillRect(34, Hh * 0.38, 10, Hh * 0.3); } })); }
function sandStand() {
  const g = G(at(B(0.8, 0.04, 0.25, M('#c62828')), 0, 1.0, 0), at(B(0.04, 1.0, 0.04, M('#c62828')), -0.38, 0, -0.1), at(B(0.04, 1.0, 0.04, M('#c62828')), 0.38, 0, -0.1));
  g.add(at(Panel(0.5, 0.12, 300, (c, w, h) => { c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold 40px ${FONT}`; c.textAlign = 'center'; c.fillText('FIRE', w / 2, 52); }), 0, 1.15, -0.1));
  [-0.24, 0.24].forEach(x => { const b = G(C(0.13, 0.1, 0.28, M('#d32f2f', { r: 0.35 }), 16), at(C(0.122, 0.122, 0.005, M('#e0c48c', { r: 1 })), 0, 0.25, 0), at(Tor(0.13, 0.005, BLACK(), Math.PI), 0, 0.28, 0)); b.rotation.x = 0; b.position.set(x, 0.62, 0.02); g.add(b); g.add(at(B(0.06, 0.02, 0.06, M('#333')), x, 0.88, -0.1)); });
  return g;
}
function apronRail() {
  const g = G(at(B(1.4, 0.04, 0.04, WOOD()), 0, 1.55, 0));
  const cols = ['#ef7d37', '#2a6f97', '#ef7d37', '#2a6f97', '#ef7d37', '#2a6f97', '#ef7d37'];
  cols.forEach((c, i) => { const x = -0.6 + i * 0.2; g.add(at(C(0.008, 0.008, 0.06, STEEL()), x, 1.55, 0.03, 0, Math.PI / 2)); const ap = B(0.2, 0.62, 0.012, M(c, { r: 0.95 })); at(ap, x, 0.93, 0.05, 0, 0.04); g.add(ap); g.add(at(B(0.16, 0.12, 0.004, M('#fff', { r: 0.9, o: 0.25 })), x, 1.2, 0.058)); });
  return g;
}

export const ITEM_MODELS = { ...A, ...F, ...IT, ...H, ...BF, ...GE, ...SA };

// ---------- Room fixtures not in the catalogue ----------
export function counter(len, h = 0.86, d = 0.6, top = '#d9d4cc', body = '#f1ede6') {
  const g = G(at(B(len, h - 0.04, d - 0.04, M(body, { r: 0.6 })), 0, 0, -0.02), at(B(len + 0.02, 0.04, d, M(top, { r: 0.35 })), 0, h - 0.04, 0));
  const n = Math.max(1, Math.round(len / 0.6));
  for (let i = 0; i < n; i++) { const x = -len / 2 + (i + 0.5) * len / n; g.add(at(B(len / n - 0.02, h - 0.16, 0.01, M(body, { r: 0.5 })), x, 0.08, d / 2 - 0.035)); g.add(at(B(0.1, 0.012, 0.015, STEEL()), x, h - 0.16, d / 2 - 0.02)); }
  return g;
}
export function sinkUnit() { const g = G(at(B(0.5, 0.01, 0.38, STEEL()), 0, 0, 0), at(B(0.44, 0.003, 0.32, M('#9ea6ad', { m: 0.8, r: 0.25 })), 0, 0.011, 0)); g.add(at(C(0.015, 0.015, 0.25, STEEL()), 0, 0, -0.22)); g.add(at(Rod([0, 0.25, -0.22], [0, 0.25, -0.08], 0.013, STEEL()), 0, 0, 0)); g.add(at(C(0.02, 0.02, 0.03, M('#1565c0')), 0.06, 0.0, -0.22)); return g; }
export function fridge() { const w = M('#e9edf0', { r: 0.3, m: 0.2 }); const g = G(B(0.56, 1.45, 0.62, w), at(B(0.556, 0.004, 0.004, M('#b0b8be')), 0, 1.0, 0.31)); g.add(at(B(0.02, 0.3, 0.03, STEEL()), 0.22, 1.08, 0.32)); g.add(at(B(0.02, 0.3, 0.03, STEEL()), 0.22, 0.6, 0.32)); g.add(at(Panel(0.12, 0.05, 120, (c, w2, h) => { c.fillStyle = '#e9edf0'; c.fillRect(0, 0, w2, h); c.fillStyle = '#555'; c.font = `bold 26px ${FONT}`; c.fillText('190 L', 10, 36); }), -0.15, 1.35, 0.311)); return g; }
export function pc() {
  const g = G(at(B(0.2, 0.012, 0.16, BLACK()), 0, 0, -0.05), at(B(0.04, 0.3, 0.03, BLACK()), 0, 0, -0.08), at(B(0.56, 0.34, 0.03, BLACK()), 0, 0.2, -0.06));
  g.userData.screen = at(new THREE.Mesh(new THREE.PlaneGeometry(0.53, 0.31), new THREE.MeshBasicMaterial({ color: '#fff' })), 0, 0.37, -0.044); g.add(g.userData.screen);
  g.add(at(B(0.44, 0.02, 0.14, M('#2b2f33')), 0, 0, 0.14)); g.add(at(B(0.06, 0.02, 0.1, M('#2b2f33')), 0.3, 0, 0.15));
  g.add(at(B(0.18, 0.4, 0.38, M('#2b2f33', { r: 0.4 })), 0, -0.75, -0.05)); // tower on the floor under the counter
  return g;
}
export function stool(c = '#2a6f97') { const g = G(at(C(0.17, 0.17, 0.04, M(c)), 0, 0.5, 0)); [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2 + Math.PI / 4; g.add(Rod([Math.cos(a) * 0.12, 0.5, Math.sin(a) * 0.12], [Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17], 0.012, M('#3c4650', { m: 0.6 }))); }); return g; }
export function shelf(w, h, d, n, color = '#c9cfd4') { const m = M(color, { m: 0.4, r: 0.45 }), g = G(); [-1, 1].forEach(s => g.add(at(B(0.025, h, d, m), s * (w / 2 - 0.0125), 0, 0))); for (let i = 0; i < n; i++) g.add(at(B(w, 0.02, d, m), 0, 0.05 + i * (h - 0.07) / (n - 1), 0)); g.add(at(B(w, h, 0.01, m), 0, 0, -d / 2)); g.userData.levels = Array.from({ length: n }, (_, i) => 0.07 + i * (h - 0.07) / (n - 1)); return g; }
export function ceilingFan() { const g = G(at(C(0.012, 0.012, 0.35, BLACK()), 0, -0.35, 0), at(C(0.09, 0.09, 0.08, M('#f5f5f5')), 0, -0.43, 0)); for (let i = 0; i < 3; i++) { const b = at(B(0.55, 0.008, 0.11, M('#f5f5f5', { r: 0.4 })), 0, -0.4, 0, i * Math.PI * 2 / 3); b.geometry = b.geometry.clone(); b.geometry.translate(0.33, 0, 0); g.add(b); } return g; }
export function exhaustFan() { const g = G(at(C(0.2, 0.2, 0.08, M('#dfe3e6'), 24), 0, 0, 0, 0, Math.PI / 2)); for (let i = 0; i < 5; i++) g.add(at(B(0.32, 0.003, 0.05, M('#9aa3ab', { m: 0.4 })), 0, 0, 0.082, 0, 0, i * Math.PI / 5)); return g; }
export function windowUnit(w, h) { const fr = M('#e6e8ea', { r: 0.4 }), g = G(at(B(w, 0.05, 0.12, fr), 0, 0, 0), at(B(w, 0.05, 0.12, fr), 0, h - 0.05, 0), at(B(0.05, h, 0.12, fr), -w / 2 + 0.025, 0, 0), at(B(0.05, h, 0.12, fr), w / 2 - 0.025, 0, 0), at(B(0.035, h, 0.08, fr), 0, 0, 0)); const gl = at(P(w - 0.1, h - 0.1, M('#cfe9f5', { r: 0.05, o: 0.28, side: THREE.DoubleSide })), 0, h / 2, 0); gl.castShadow = false; g.add(gl); g.add(at(B(w + 0.1, 0.03, 0.2, M('#d8d2c8')), 0, -0.03, 0.04)); return g; }
export function door(w, h = 2.25, double = false, open = 0.5) {
  const fr = M('#5c4033', { r: 0.6 }), leafM = M('#a87b52', { r: 0.6 }), g = G(at(B(0.07, h, 0.16, fr), -w / 2 - 0.035, 0, 0), at(B(0.07, h, 0.16, fr), w / 2 + 0.035, 0, 0), at(B(w + 0.14, 0.07, 0.16, fr), 0, h, 0));
  const leaves = double ? [[-w / 2, w / 2, 1], [w / 2, w / 2, -1]] : [[-w / 2, w, 1]];
  leaves.forEach(([hx, lw, s]) => { const pivot = new THREE.Group(); pivot.position.set(hx, 0, 0.04); const l = B(lw - 0.01, h - 0.02, 0.04, leafM); l.geometry.translate(s * lw / 2, 0, 0); pivot.add(l); pivot.add(at(B(0.12, 0.02, 0.04, STEEL()), s * (lw - 0.1), 1.0, 0.035)); const vp = at(B(0.15, 0.5, 0.005, GLASS()), s * lw / 2, 1.3, 0.022); pivot.add(vp); pivot.rotation.y = -s * open; g.add(pivot); });
  return g;
}
export function whiteboard(w = 2.0, h = 1.1, draw) { const g = G(at(B(w + 0.06, h + 0.06, 0.025, M('#b0b8be', { m: 0.5 })), 0, -(h + 0.06) / 2, 0)); g.add(at(Panel(w, h, 800, draw ?? ((c, W, Hh) => { c.fillStyle = '#fbfbfb'; c.fillRect(0, 0, W, Hh); })), 0, 0, 0.0135)); g.add(at(B(w * 0.6, 0.02, 0.06, M('#b0b8be', { m: 0.5 })), 0, -h / 2 - 0.05, 0.03)); return g; }
export function poster(w, h, title, sub, color, icon) {
  return G(at(B(w + 0.03, h + 0.03, 0.012, M('#1b242d')), 0, -(h + 0.03) / 2, 0), at(Panel(w, h, 420, (c, W, Hh) => {
    c.fillStyle = '#fcfaf6'; c.fillRect(0, 0, W, Hh); c.fillStyle = color; c.fillRect(0, 0, W, Hh * 0.2);
    c.fillStyle = '#fff'; c.font = `bold ${W * 0.075 | 0}px ${FONT}`; c.fillText(icon ?? '', 18, Hh * 0.14);
    c.fillStyle = '#1b242d'; c.font = `bold ${W * 0.085 | 0}px ${FONT}`; const y = wrapText(c, title, 22, Hh * 0.33, W - 44, W * 0.1);
    c.fillStyle = '#4a5560'; c.font = `${W * 0.05 | 0}px ${FONT}`; wrapText(c, sub, 22, y + W * 0.1, W - 44, W * 0.066);
    c.fillStyle = color; c.fillRect(22, Hh - 30, W * 0.3, 8);
  }), 0, 0, 0.007));
}
export function socket() { return G(at(B(0.14, 0.09, 0.012, M('#f7f7f7', { r: 0.4 })), 0, -0.045, 0), at(C(0.008, 0.008, 0.004, BLACK()), -0.03, 0, 0.012, 0, Math.PI / 2), at(C(0.008, 0.008, 0.004, BLACK()), 0.03, 0, 0.012, 0, Math.PI / 2), at(B(0.02, 0.025, 0.004, M('#e53935')), 0.0, -0.06, 0.012)); }
export function almirah(w = 1.22, h = 2.05, d = 0.5) { const m = M('#ece6dc', { r: 0.6 }), g = G(); [-1, 1].forEach(s => g.add(at(B(0.025, h, d, m), s * (w / 2 - 0.0125), 0, 0))); g.add(at(B(w, 0.025, d, m), 0, h - 0.025, 0)); g.add(at(B(w, h, 0.015, m), 0, 0, -d / 2 + 0.0075)); g.userData.m = m; return g; }
