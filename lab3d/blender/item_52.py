"""Item 52 — Vegetable peeler, all stainless steel Y-peeler: tubular handle with hanging loop, forked yoke, swivel twin-slot blade.
Real size 18.5 L x 1.9 H x 6.8 W cm. Lies flat along X, handle at -X (placeholder pose). Source: typical Y peeler + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 52, False

def build():
    st = mat('#d5dadd', 0.27, 0.7); br = mat('#c4c9cd', 0.38, 0.65); dk = DARK(); Z = 0.0095
    with Collect() as c:
        prof = [(0, 0), (0.006, 0), (0.0085, 0.002), (0.0092, 0.006), (0.0092, 0.070), (0.0096, 0.071), (0.0096, 0.074), (0.0086, 0.075), (0.0086, 0.078),
                (0.0096, 0.079), (0.0096, 0.082), (0.0086, 0.083), (0.0076, 0.097), (0.005, 0.103), (0, 0.103)]
        lathe('handle', prof, br, 24)
    xform(c.objs, TR(0, 0, Z) @ LAY_X)
    wire('loop', crom([(0.003, -0.0048, Z), (-0.006, -0.0052, Z), (-0.012, -0.003, Z), (-0.0135, 0, Z), (-0.012, 0.003, Z), (-0.006, 0.0052, Z), (0.003, 0.0048, Z)], 2), 0.0014, st, segs=5)
    # yoke: neck fan + U fork (flat plate)
    prism('neck', [(0.098, -0.0055), (0.124, -0.019), (0.129, -0.012), (0.131, 0), (0.129, 0.012), (0.124, 0.019), (0.098, 0.0055)], 0.0022, st, loc=(0, 0, Z), bev=0.0004)
    up = [(0.171, -0.0295, Z), (0.150, -0.0295, Z), (0.134, -0.0265, Z), (0.1255, -0.0155, Z), (0.1235, 0, Z), (0.1255, 0.0155, Z), (0.134, 0.0265, Z), (0.150, 0.0295, Z), (0.171, 0.0295, Z)]
    pts = crom(up, 3); n = len(pts)
    strip('fork', pts, [0.0045 if i in (0, n - 1) else 0.0075 for i in range(n)], 0.0022, st, N=(0, 0, 1), sharp=None)
    # swivel blade: two slats with a slot between, slightly tilted; pivot pins in the fork tips
    with Collect() as c:
        rbox('blade', 0.0125, 0.0555, 0.0011, mat('#e4e7e9', 0.2, 0.7), loc=(0, 0, -0.00055), r=0)
        rbox('slot', 0.0026, 0.046, 0.0015, dk, loc=(0.0005, 0, -0.00075), r=0)
    xform(c.objs, TR(0.164, 0, Z) @ RY(math.radians(-18)))
    for sy in (-1, 1): cyl('pin', 0.0022, 0.0045, st, loc=(0.164, sy * 0.0295 - 0.00225, Z), rot=(-math.pi / 2, 0, 0), segs=10)
