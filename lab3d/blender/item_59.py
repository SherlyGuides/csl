"""Item 59 — AAA batteries, blister pack of 10. Real size 12.6 × 8.6 × 1.3 cm (10 × Ø10.5 × 44.5 mm cells side by side
in a clear hang-card blister). Stands upright like the placeholder pack. Source: IEC LR03 cell size + photo."""
import math
from hc_util import *
SNO, WALL = 59, False
def build():
    silver = mat('#c9cdd0', 0.3, 0.7); copper = mat('#c27a3a', 0.3, 0.7); dark = mat('#2a2b2d', 0.5)
    clear = mat('#eef4f7', 0.12, 0.0, 0.3); clear2 = mat('#f4f8fa', 0.2, 0.0, 0.45)
    R, z0 = 0.00525, 0.009
    for i in range(10):
        x = (i - 4.5) * 0.0112
        b = lathe('cell', [(0, 0), (R * 0.7, 0), (R * 0.72, 0.0006), (R, 0.0012), (R, 0.0315)], silver, 12); b.location = (x, 0, z0)
        r = lathe('ring', [(R + 0.00012, 0.031), (R + 0.00012, 0.0322)], dark, 12, close_bottom=False); r.location = (x, 0, z0)
        c = lathe('cap', [(R, 0.0322), (R, 0.0418), (R * 0.82, 0.043), (0.0019, 0.043), (0.0019, 0.0445), (0, 0.0445)], copper, 12, close_bottom=False); c.location = (x, 0, z0)
    # clear card with hang tab + formed blister bubble
    rbox('card', 0.126, 0.0008, 0.066, clear2, loc=(0, 0.0061, 0), r=0)
    prism('tab', [(-0.045, 0.066), (0.045, 0.066), (0.045, 0.082), (0.041, 0.086), (-0.041, 0.086), (-0.045, 0.082)], 0.0008, clear2, plane='XZ', loc=(0, 0.0061, 0), bev=0)
    rbox('slot', 0.03, 0.0012, 0.006, mat('#b9c2c8', 0.4, 0.0, 0.6), loc=(0, 0.0061, 0.073), r=0.0005)
    rbox('bubble', 0.117, 0.0122, 0.052, clear, loc=(0, -0.0004, 0.005), r=0.003, segs=2)
