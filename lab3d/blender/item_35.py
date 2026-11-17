"""Item 35 — Measuring spoons (plastic), ring set of 5: 1 tbsp, 1/2 tbsp, 1 tsp, 1/2 tsp, 1/4 tsp in red / orange / yellow /
green / blue on a white ring. Real size ~15 x 3 H x 15 cm fanned out flat on the counter (ring at one end, as the placeholder).
Source: typical 5-piece set + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 35, False

def build():
    sizes = [('#e3242b', 0.0240, 0.122), ('#f47c20', 0.0205, 0.110), ('#f6d21a', 0.0175, 0.099), ('#3bab3a', 0.0145, 0.089), ('#1e6fd9', 0.0112, 0.079)]
    for i, (col, r, L) in enumerate(sizes):
        m = mat(col, 0.42); th = math.radians((-38, -16.5, 3.8, 22.6, 39)[i]); u = V((math.cos(th), math.sin(th), 0))
        d = 0.62 * r; t = 0.0016; zs = 0.0036 + 0.0030 * i; ze = d - 0.0012
        # bowl (solid wall, lathe)
        prof = [(0, 0)] + [(r * math.sin(p), d * (1 - math.cos(p))) for p in (0.4, 0.8, 1.2, math.pi / 2)]
        prof += [((r - t) * math.sin(p), t + (d - t) * (1 - math.cos(p))) for p in (math.pi / 2, 1.2, 0.8, 0.4)] + [(0, t)]
        b = lathe('bowl', prof, m, 16); b.location = u * L
        # handle: flat tapered strip from the ring eye to the bowl rim
        sl = [-0.007, -0.003, 0.012, 0.35 * L, 0.7 * L, L - r * 1.02, L - r * 0.86]
        ws = [0.005, 0.0115, 0.0115, 0.010, 0.0105, 0.014, 0.019]
        pts = []
        for s in sl:
            q = min(1, max(0, s / (L - r))); q = q * q * (3 - 2 * q)
            p = u * s; pts.append((p.x, p.y, zs + (ze - zs) * q))
        strip('handle', pts, ws, 0.0024, m, N=(0, 0, 1))
        cyl('eye', 0.0032, 0.0027, DARK(), loc=(0, 0, zs - 0.00135), segs=10)
    # white split ring through the eyes
    c = V((-0.0125, 0, 0.0142)); R = 0.014
    ring = [(c.x + R * math.cos(2 * math.pi * k / 20), 0.002 * math.sin(2 * math.pi * k / 20), c.z + R * math.sin(2 * math.pi * k / 20)) for k in range(20)]
    wire('ring', ring, 0.0016, mat('#f3f3f0', 0.45), segs=6, closed=True)
