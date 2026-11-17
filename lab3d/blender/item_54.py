"""Item 54 — Whisk (whisker), stainless steel balloon whisk, 10 in: tubular handle with hanging loop, 5 wire loops (10 strands).
Real size 27 L x 6.9 dia cm. Lies along X with the handle/hanging loop at -X and the balloon at +X, the same axis as the
tong and pot lifter, so the room's -90 deg turn hangs it loop-up / balloon-down. (The low-poly placeholder stood on its
handle, which the room turned sideways on the rail; set UPRIGHT = True to get that pose back.)
Source: typical 10 in balloon whisk + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 54, False
UPRIGHT = False

def build():
    st = mat('#d5dadd', 0.27, 0.7); br = mat('#c4c9cd', 0.38, 0.65); R = 0.0345
    with Collect() as c:
        with Collect() as h:
            prof = [(0, 0), (0.007, 0), (0.0095, 0.002), (0.0105, 0.008), (0.0105, 0.076), (0.0096, 0.078), (0.0096, 0.080), (0.0105, 0.082), (0.0092, 0.093), (0.0064, 0.100), (0, 0.100)]
            lathe('handle', prof, br, 24)
        xform(h.objs, LAY_X)
        wire('loop', crom([(0.003, -0.0052, 0), (-0.006, -0.0056, 0), (-0.0125, -0.0032, 0), (-0.014, 0, 0), (-0.0125, 0.0032, 0), (-0.006, 0.0056, 0), (0.003, 0.0052, 0)], 2), 0.0015, st, segs=5)
        hp = [(0.094, 0.0032), (0.124, 0.012), (0.158, 0.0265), (0.192, R), (0.224, 0.031), (0.246, 0.0175), (0.2535, 0.0)]
        for k in range(5):
            ph = k * math.pi / 5; f = 1 - 0.035 * k; dx = -0.0021 * k
            full = [(x + (dx if i >= 3 else 0), r * (f if i >= 2 else 1)) for i, (x, r) in enumerate(hp)]
            full = full + [(x, -r) for x, r in full[-2::-1]]
            wire('loop%d' % k, [(p.x, p.y * math.cos(ph), p.y * math.sin(ph)) for p in crom([(x, r, 0) for x, r in full], 3)], 0.0009, st, segs=4)
    if UPRIGHT: xform(c.objs, RY(-math.pi / 2))
