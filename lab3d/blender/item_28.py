"""Item 28 — Gas lighter (stainless steel, piezo push type). Real size 24 L x 2.6 dia (thumb disc) x 5.6 cm (finger guard).
Lies flat along X, plunger/handle end at -X (as the placeholder). Source: typical Indian kitchen lighter + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 28, False

def build():
    st = mat('#d5dadd', 0.28, 0.7); dk = DARK()
    with Collect() as c:
        # thumb disc + plunger rod
        lathe('disc', [(0, 0), (0.011, 0), (0.013, 0.0012), (0.013, 0.0035), (0.0115, 0.0048), (0, 0.0048)], st, 28)
        lathe('plunger', [(0.0048, 0.0048), (0.0048, 0.03)], st, 16, close_bottom=False)
        # barrel: collar, long tube, ring groove, stepped nozzle with open end
        body = [(0, 0.028), (0.0075, 0.028), (0.0097, 0.030), (0.0097, 0.037), (0.0088, 0.038), (0.0088, 0.198), (0.0093, 0.199),
                (0.0093, 0.203), (0.0088, 0.204), (0.0088, 0.212), (0.0080, 0.214), (0.0080, 0.237), (0.0072, 0.240),
                (0.0048, 0.240), (0.0048, 0.234), (0, 0.234)]
        lathe('barrel', body, st, 28)
        cyl('bore', 0.0047, 0.0008, dk, loc=(0, 0, 0.2345), segs=16)
        for k in range(4):                       # flame slots round the nozzle
            a = k * math.pi / 2 + math.pi / 4
            rbox('slot', 0.0034, 0.0012, 0.013, dk, loc=(0.0077 * math.cos(a), 0.0077 * math.sin(a), 0.2185), rot=(0, 0, a + math.pi / 2), r=0.0005)
        # finger guard: flat crescent plate through the barrel, horns swept back toward the plunger
        n = 12; pts = []; ws = []
        for i in range(n + 1):
            u = -1 + 2 * i / n
            pts.append((0, 0.027 * u, 0.060 - 0.017 * u * u)); ws.append(0.004 + 0.010 * (1 - u * u) ** 0.8)
        strip('guard', pts, ws, 0.0014, st, N=(1, 0, 0))
    xform(c.objs, LAY_X)
