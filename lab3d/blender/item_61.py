"""Item 61 — Absorbent cotton roll. Real size ≈ 13 cm wide × Ø9 cm (100 g roll), lying on its side with the loose end
trailing in front, spiral visible on both ends. Source: typical 100 g roll + photo."""
import math
from hc_util import *
SNO, WALL = 61, False
def build():
    cot = mat('#f7f7f4', 1.0); shade = mat('#e2e3e3', 1.0)
    R, L = 0.045, 0.13
    prof = [(0.0, -L / 2 + 0.007), (R * 0.55, -L / 2 + 0.004), (R * 0.9, -L / 2 + 0.001), (R, -L / 2 + 0.01), (R, -L / 4), (R, 0), (R, L / 4),
            (R, L / 2 - 0.01), (R * 0.9, L / 2 - 0.001), (R * 0.55, L / 2 - 0.004), (0.0, L / 2 - 0.007)]
    def fn(u, v):
        j = min(int(round(v * (len(prof) - 1))), len(prof) - 1); r, x = prof[j]; th = 2 * math.pi * u
        r *= 1 + 0.035 * math.sin(5 * th + x * 60) + 0.02 * math.sin(11 * th - x * 90) + 0.012 * math.sin(17 * th + 1.3)
        return (x + 0.002 * math.sin(7 * th), r * math.cos(th), R + r * math.sin(th))
    surface('roll', fn, 36, len(prof) - 1, cot)
    for sx in (-1, 1):   # rolled-layer spiral on each end
        pts = []
        for i in range(52):
            t = i / 51; a = t * 6.2 * math.pi; r = 0.005 + (R * 0.86 - 0.005) * t
            pts.append((sx * (L / 2 - 0.0035 + 0.003 * t), r * math.cos(a), R + r * math.sin(a)))
        sweep('spiral', pts, 0.0011, shade, segs=4, up=(1, 0, 0), smooth_path=False)
    # loose flap trailing forward from under the roll, wispy edge
    def flap(u, v):
        x = (-L / 2 + 0.006) + (L - 0.012) * u
        y = -0.012 - (0.05 + 0.006 * math.sin(u * 23) + 0.004 * math.sin(u * 51)) * v
        return (x, y, 0.0075 * (1 - 0.75 * v ** 2) + 0.001 * math.sin(u * 31 + v * 5))
    surface('flap', flap, 14, 3, cot, thickness=0.0)
    surface('flap_under', lambda u, v: (flap(u, v)[0], flap(u, v)[1], 0.0), 14, 1, cot)
