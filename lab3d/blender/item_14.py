"""Item 14 — Multipurpose scissor, stainless steel, 200 mm (spec). Lies flat, slightly open.
Two satin steel blades (11 cm), black moulded handles: small thumb loop + large finger loop, pivot screw. Source: spec + photo."""
import math
from _lib import *
SNO, WALL = 14, False
def build():
    steel, black = STEEL(), mat('#1c1d1f', 0.5)
    b1 = [(0.0, 0.007), (0.11, 0.0005), (0.112, -0.001), (0.0, -0.006), (-0.012, -0.002), (-0.012, 0.004)]
    prism('blade_a', b1, 0.0022, steel, loc=(0, 0, 0.0012), rot=(0, 0, math.radians(7)), bev=0.0003)
    b2 = [(x, -y) for x, y in b1]
    prism('blade_b', b2, 0.0022, steel, loc=(0, 0, -0.0012), rot=(0, 0, math.radians(-7)), bev=0.0003)
    cyl('pivot', 0.0045, 0.0062, steel, loc=(0, 0, -0.0031), segs=20)
    # handles: shanks + loops
    tube('shank_a', [(-0.008, 0.004, 0.001), (-0.03, 0.012, 0.001), (-0.046, 0.02, 0.001)], 0.0055, black)
    tube('loop_a', [(-0.046 - 0.02 * math.cos(a) - 0.02, 0.022 + 0.014 * math.sin(a), 0.001) for a in [i * math.pi / 4 for i in range(8)]], 0.0048, black, closed=True)
    tube('shank_b', [(-0.008, -0.004, -0.001), (-0.03, -0.013, -0.001), (-0.044, -0.022, -0.001)], 0.0055, black)
    tube('loop_b', [(-0.044 - 0.03 * math.cos(a) - 0.03, -0.028 + 0.017 * math.sin(a), -0.001) for a in [i * math.pi / 4 for i in range(8)]], 0.0052, black, closed=True)
