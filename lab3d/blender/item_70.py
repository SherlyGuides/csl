"""Item 70 — PPE kits: stack of 4 folded 40 GSM disposable isolation gowns. Each folded pack 30 × 3 × 24 cm → stack
≈ 31 × 12.3 × 25 cm. Light-blue non-woven, white neck ties on the top pack, small label. Source: typical pack + photo."""
import math
from hc_util import *
SNO, WALL = 70, False
def build():
    blue = mat('#86bdec', 0.85); blue2 = mat('#79b2e4', 0.85); tie = mat('#c4e0f7', 0.8); white = mat('#f6f7f7', 0.5)
    offs = [(0, 0, 0), (0.004, -0.003, 2.5), (-0.003, 0.002, -2), (0.002, -0.001, 1.5)]
    for i, (dx, dy, a) in enumerate(offs):
        with grp(loc=(dx, dy, i * 0.0305), rot=(0, 0, math.radians(a))):
            rbox('fold_a', 0.30, 0.24, 0.015, blue if i % 2 == 0 else blue2, r=0.006, segs=2)
            rbox('fold_b', 0.296, 0.237, 0.015, blue2 if i % 2 == 0 else blue, loc=(0.001, 0.0015, 0.015), r=0.006, segs=2)
            cyl('spine', 0.0149, 0.292, blue, loc=(-0.146, -0.108, 0.015), rot=(0, math.pi / 2, 0), segs=12)   # rounded folded edge at the front
            if i == 3:
                z = 0.0305
                # neckline with tie loops and a bow
                pts = [(0.05 * math.cos(math.radians(t)), 0.045 + 0.03 * math.sin(math.radians(t)), z) for t in range(180, 361, 30)]
                sweep('neck', pts, 0.004, tie, segs=6, rh=0.0012, per=3)
                sweep('bow_l', [(0, 0.016, z), (-0.03, 0.03, z), (-0.04, 0.012, z), (-0.012, 0.012, z)], 0.003, tie, segs=6, rh=0.001, closed=True, per=4)
                sweep('bow_r', [(0, 0.016, z), (0.03, 0.03, z), (0.04, 0.012, z), (0.012, 0.012, z)], 0.003, tie, segs=6, rh=0.001, closed=True, per=4)
                sweep('tail_l', [(0, 0.014, z), (-0.012, -0.012, z), (-0.02, -0.04, z)], 0.003, tie, segs=6, rh=0.001, per=3)
                sweep('tail_r', [(0, 0.014, z), (0.01, -0.016, z), (0.024, -0.036, z)], 0.003, tie, segs=6, rh=0.001, per=3)
                rbox('label', 0.075, 0.04, 0.0006, white, loc=(0.09, -0.07, z), r=0.0003, segs=1)
                text('t', 'PPE', 0.02, mat('#2f6fb8', 0.5), loc=(0.09, -0.07, z + 0.0007), rot=(0, 0, 0), depth=0.0002)
