"""Item 25 — Dust pan, blue plastic, medium, short handle with hang hole. Lies flat, mouth to the front.
≈ 23 × 9 × 33 cm (W × H × L). Source: typical medium hand dustpan / photo."""
import math
from _lib import *
SNO, WALL = 25, False
def build():
    blue = mat('#2f73d8', 0.45); dark = mat('#2560bd', 0.5)
    Lp, Hb = 0.215, 0.068           # pan length (front lip -> back), back wall height
    def fn(u, v):
        y = -0.115 + Lp * u
        hw = 0.115 - 0.014 * u                       # half width narrows to the back
        # floor: flat, then curls up into the back wall
        if u < 0.80: zf = 0.0; yy = y
        else:
            a = (u - 0.80) / 0.20 * math.pi / 2; rr = 0.2 * Lp
            yy = -0.115 + 0.8 * Lp + rr * math.sin(a) * 0.55; zf = Hb * (1 - math.cos(a)) ** 0.9
        ht = max(zf, 0.006 + (Hb - 0.006) * min(1, u / 0.8) ** 0.75)   # side-wall top rises to the back
        # cross profile: wall top -> rounded corner -> floor -> corner -> wall top
        s = abs(v - 0.5) * 2; sg = 1 if v > 0.5 else -1
        if s < 0.62: return (sg * (hw - 0.012) * s / 0.62, yy, zf)
        t = (s - 0.62) / 0.38
        if t < 0.35:
            a = t / 0.35 * math.pi / 2; r = min(0.012, (ht - zf) * 0.9 + 1e-4)
            return (sg * (hw - 0.012 + 0.012 * math.sin(a)), yy, zf + r * (1 - math.cos(a)))
        r = min(0.012, (ht - zf) * 0.9 + 1e-4); k = (t - 0.35) / 0.65
        return (sg * (hw + 0.006 * k), yy, zf + r + (ht - zf - r) * k)
    surface('pan', fn, 16, 28, blue, thickness=0.0028)
    # short handle off the back wall, rising ~18°, with a hang-hole loop at the end
    ang = math.radians(18); y0 = -0.115 + 0.8 * Lp + 0.2 * Lp * 0.55 - 0.004; z0 = Hb - 0.012
    pts = [(-0.019, 0), (0.019, 0), (0.015, 0.075), (0.016, 0.095), (0.020, 0.108), (0.020, 0.122), (0.014, 0.133), (0, 0.137),
           (-0.014, 0.133), (-0.020, 0.122), (-0.020, 0.108), (-0.016, 0.095), (-0.015, 0.075)]
    prism('handle', pts, 0.012, blue, 'XY', loc=(0, y0, z0), rot=(ang, 0, 0), bev=0.003)
    hc = (0, y0 + 0.118 * math.cos(ang) - 0.0065 * math.sin(ang), z0 + 0.118 * math.sin(ang) + 0.0065 * math.cos(ang))
    cyl('hole', 0.0085, 0.0008, mat('#16335f', 0.6), loc=hc, rot=(ang, 0, 0), segs=16)
    cyl('hole_b', 0.0085, 0.0008, mat('#16335f', 0.6), loc=(hc[0], hc[1] + 0.0138 * math.sin(ang), hc[2] - 0.0138 * math.cos(ang)), rot=(ang, 0, 0), segs=16)
    # stiffening rib where the handle meets the pan + front lip
    rbox('root', 0.044, 0.012, 0.012, blue, loc=(0, y0 - 0.001, z0 - 0.004), rot=(ang, 0, 0), r=0.003, segs=2)
    rbox('lip', 0.226, 0.006, 0.0022, dark, loc=(0, -0.117, 0), r=0.0008, segs=1)
