"""Item 74 — Everyday scissors. Real size 17.5 × 0.9 × 8 cm lying flat, slightly open, blades toward +X.
Satin steel blades with rounded tips, black moulded handles (small thumb bow, larger finger bow), pivot screw. Source: typical 7 in + photo."""
import math
from hc_util import *
SNO, WALL = 74, False
def build():
    steel = mat('#cfd4d8', 0.32, 0.7); black = mat('#17181a', 0.45)
    b1 = [(-0.014, 0.004), (0.0, 0.0078), (0.085, 0.0036), (0.096, 0.0012), (0.0985, -0.0015), (0.095, -0.0034), (0.0, -0.0056), (-0.014, -0.002)]
    A = math.radians(9)
    prism('blade_a', b1, 0.002, steel, loc=(0, 0, 0.0052), rot=(0, 0, A), bev=0.0003)
    prism('blade_b', [(x, -y) for x, y in reversed(b1)], 0.002, steel, loc=(0, 0, 0.0032), rot=(0, 0, -A), bev=0.0003)
    cyl('pivot', 0.0038, 0.0064, steel, loc=(0, 0, 0.001), segs=16)
    box('slot', 0.005, 0.0008, 0.0003, mat('#6d7377', 0.4, 0.6), loc=(0, 0, 0.0073), rot=(0, 0, 0.6))
    def bow(name, sgn, cx, cy, rx, ry, ang, z):
        ca, sa = math.cos(ang), math.sin(ang)
        pts = [(cx + rx * math.cos(t) * ca - ry * math.sin(t) * sa, cy + rx * math.cos(t) * sa + ry * math.sin(t) * ca, z) for t in [2 * math.pi * i / 20 for i in range(20)]]
        sweep(name, pts, 0.0048, black, segs=8, closed=True, rh=0.0038, smooth_path=False)
        # shank from the pivot into the bow
        end = (cx + rx * 0.98 * ca, cy + rx * 0.98 * sa, z)
        sweep(name + '_shank', [(-0.003, sgn * 0.0015, z), (-0.016, sgn * 0.006, z), end], lambda s: 0.0062 - 0.001 * s, black, segs=8, rh=0.0036, per=4)
    bow('bow_a', 1, -0.051, 0.0225, 0.0235, 0.0155, math.radians(-22), 0.0045)
    bow('bow_b', -1, -0.049, -0.0265, 0.0285, 0.0175, math.radians(20), 0.004)
