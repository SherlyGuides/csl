"""Item 33 — Kitchen knife set: 4 stainless knives (chef, bread, utility, paring) with black riveted handles, kept in a slanted
wooden block (the placeholder's arrangement). Real size 11 W x 31 H x 18 D cm. Source: typical 4-slot block + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 33, False

def build():
    wood = mat('#a8703c', 0.6); dk = DARK(); st = mat('#d3d8dc', 0.3, 0.7); hb = mat('#1b1c1f', 0.42)
    ang = math.radians(25); a = V((0, -math.sin(ang), math.cos(ang))); f = V((0, math.cos(ang), math.sin(ang)))
    A0 = V((0, -0.012, 0)); P2 = A0 + a * 0.205; P1 = P2 + f * 0.078
    out = [A0, V((0, 0.082, 0)), V((0, 0.082, 0.034)), P1 - a * 0.135, P1, P2]
    rr = [[V((x, p.y, p.z)) for p in out] for x in (-0.055, 0.055)]
    bevel(loft('block', rr, wood, sharp=30), 0.004, 2)
    mid = P2 + f * 0.039
    #        x      blade w  handle w  handle len
    knives = [(-0.039, 0.046, 0.027, 0.125), (-0.013, 0.032, 0.025, 0.120), (0.013, 0.026, 0.023, 0.110), (0.039, 0.020, 0.021, 0.100)]
    for x, bwid, hw, hl in knives:
        with Collect() as c:
            rbox('slot', 0.0045, bwid + 0.006, 0.0006, dk, r=0)
            rbox('blade', 0.0022, bwid, 0.006, st, r=0)
            rbox('bolster', 0.0135, hw * 0.9, 0.011, st, loc=(0, 0, 0.005), r=0.002)
            rbox('grip', 0.0165, hw, hl, hb, loc=(0, 0, 0.0155), r=0.0045)
            rbox('tang', 0.0168, 0.004, hl - 0.012, st, loc=(0, 0, 0.0215), r=0)          # full tang seen edge-on
            for q in (0.2, 0.5, 0.8):
                cyl('rivet', 0.0024, 0.0172, st, loc=(-0.0086, 0, 0.0155 + hl * q), rot=(0, math.pi / 2, 0), segs=10)
        xform(c.objs, TR(x, mid.y, mid.z) @ RX(ang))
