"""Item 37 — Plastic bucket 10 L, blue, with moulded rim collar and blue bail handle (hanging down at the front).
Ø 28.6 (rim) / 21 (base) × 25 cm, ≈ 11.5 L brimful = 10 L nominal; ≈ 31 × 25 × 29 cm with lugs. Source: spec (10 L) / photo."""
import math
from _lib import *
SNO, WALL = 37, False
def build():
    blue = mat('#2379e0', 0.42); inner = mat('#1c69c9', 0.5)
    H = 0.25
    R = lambda z: 0.105 + 0.033 * z / 0.243
    out = [(0, 0), (0.098, 0), (0.103, 0.002), (0.105, 0.006), (R(0.207), 0.207), (R(0.207) + 0.004, 0.211), (R(0.24) + 0.004, 0.238),
           (0.143, 0.243), (0.143, 0.248), (0.141, H), (0.137, H), (0.1345, 0.246)]
    lathe('bucket', out, blue, 48)
    lathe('inside', [(0.1345, 0.246), (R(0.12) - 0.003, 0.12), (0.102, 0.010), (0.097, 0.006), (0, 0.006)], inner, 48, close_bottom=False)
    for z in (0.012, 0.018):                              # base hoops
        lathe('hoop', [(R(z) - 0.0003, z - 0.002), (R(z) + 0.0012, z), (R(z) - 0.0003, z + 0.002)], blue, 48, close_bottom=False)
    # handle lugs + bail
    zp, Rh, al = 0.224, 0.153, math.radians(60)
    for sx in (-1, 1):
        rbox('lug', 0.012, 0.03, 0.032, blue, loc=(sx * 0.146, 0, zp - 0.018), r=0.004)
        cyl('pin', 0.006, 0.006, blue, loc=(sx * 0.150, 0, zp), rot=(0, sx * math.pi / 2, 0), segs=12)
    def P(phi): return (Rh * math.cos(phi), -Rh * math.sin(phi) * math.sin(al), zp - Rh * math.sin(phi) * math.cos(al))
    n = 16
    tube('bail', [P(math.pi * i / n) for i in range(n + 1)], 0.0036, blue, res=2).data.resolution_u = 3
    g0, g1 = math.radians(72), math.radians(108)
    tube('grip', [P(g0 + (g1 - g0) * i / 6) for i in range(7)], 0.0085, blue, res=2).data.resolution_u = 2
    for i in range(7):
        ph = g0 + (g1 - g0) * (i + 0.5) / 7; p = P(ph)
        cyl('rib', 0.0098, 0.003, inner, loc=(p[0] - 0.0015, p[1], p[2]), rot=(0, math.pi / 2, 0), segs=12)
    text('cap', '10 L', 0.02, blue, loc=(0.085, -R(0.19) * math.cos(math.asin(0.085 / R(0.19))) - 0.0005, 0.185),
         rot=(math.pi / 2 - math.atan2(0.033, 0.243), 0, 0.62), depth=0.0012).data.resolution_u = 2
