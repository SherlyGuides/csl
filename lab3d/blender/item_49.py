"""Item 49 — Steel bowls Ø 6 in (15.2 cm, spec), nest of 4. Each 15.2 × 6.0 cm; nested ≈ 15.2 × 9.6 × 15.2 cm. Source: spec / photo."""
import math
from _lib import *
SNO, WALL = 49, False
def build():
    st = mat('#d3d8dc', 0.28, 0.7); inner = mat('#c0c5c9', 0.4, 0.66)    # polished outside, satin inside
    pitch, n, R, H = 0.012, 4, 0.076, 0.060
    def wall(off=0.0, r_top=R):
        # flat base Ø 7 cm, round belly, nearly upright near the rim
        pts = [(0.034 - off, off)]
        for i in range(1, 11):
            a = math.pi / 2 * i / 10
            pts.append((0.034 - off + (r_top - 0.034) * math.sin(a) ** 0.85, off + 0.004 + (H - 0.004 - off) * (1 - math.cos(a)) ** 0.9))
        return pts
    out = [(0, 0), (0.030, 0), (0.034, 0.0008)] + wall()[1:] + [(R + 0.0012, H + 0.0006)]
    lathe('bowl0', out, st, 36)
    for i in range(1, n):
        ob = lathe(f'bowl{i}', out[-5:], st, 36, close_bottom=False); ob.location.z = i * pitch
    z = (n - 1) * pitch
    inn = wall(0.0012, R - 0.0012)
    rim = [(R + 0.0012, H + 0.0006), (R + 0.0004, H + 0.0016), (R - 0.0012, H + 0.0008)]
    lathe('rim_top', rim + list(reversed(inn))[:3], st, 36, close_bottom=False).location.z = z
    lathe('inside', list(reversed(inn))[2:] + [(0.020, 0.0012), (0, 0.0012)], inner, 36, close_bottom=False).location.z = z
