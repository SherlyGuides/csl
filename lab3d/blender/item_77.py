"""Item 77 — Cotton towels 30 × 30 cm, stack of 4 folded in quarters. Each folded towel 15.5 × 2.2 × 15.5 cm → stack
≈ 16.5 × 8.8 × 16.5 cm. White terry with one cream towel, hemmed edges. Source: spec + photo."""
import math
from hc_util import *
SNO, WALL = 77, False
def build():
    white = mat('#f6f6f2', 1.0); white2 = mat('#eeeeea', 1.0); cream = mat('#ebe3cc', 1.0); cream2 = mat('#e2d9c0', 1.0)
    lay = [(0, 0, 0, white, white2), (0.004, -0.003, 4, cream, cream2), (-0.003, 0.003, -3, white, white2), (0.002, -0.002, 2, white, white2)]
    for i, (dx, dy, a, m, m2) in enumerate(lay):
        with grp(loc=(dx, dy, i * 0.022), rot=(0, 0, math.radians(a))):
            def half(name, w, d, z, ox, oy):
                loft(name, [(z, w / 2 - 0.005, d / 2 - 0.005, oy, 5), (z + 0.0025, w / 2, d / 2, oy, 6), (z + 0.0085, w / 2, d / 2, oy, 6), (z + 0.011, w / 2 - 0.005, d / 2 - 0.005, oy, 5)], m, 24, axis='Z')
                xf([bpy.data.objects[name]], loc=(ox, 0, 0)); bpy.data.objects[name].name = 'towel'
            half('half_a', 0.153, 0.146, 0, 0, 0.0045)
            half('half_b', 0.151, 0.144, 0.011, 0.0008, 0.0052)
            cyl('fold', 0.0104, 0.14, m, loc=(-0.07, -0.0625, 0.011), rot=(0, math.pi / 2, 0), segs=12)     # rounded folded edge at the front
            box('hem', 0.011, 0.132, 0.0004, m2, loc=(0.062, 0.006, 0.0219))                                    # flat-woven hem band near the right edge
