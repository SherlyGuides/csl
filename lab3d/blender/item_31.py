"""Item 31 — Hand-operated chikki slicer / roller cutter (stainless steel). Real size 21.6 W x 8.4 H x ~18 D cm:
seven 8.4 cm wavy-edge cutting discs on a spacer axle, two side plates, 2.2 cm tube handle.
Lies on the counter resting on its discs and handle bar; roller axis along X, handle toward the front (-Y) as the placeholder.
Source: typical multi-wheel dough/chikki cutter + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 31, False

def build():
    st = mat('#d3d8dc', 0.3, 0.7); br = mat('#c2c7cb', 0.4, 0.65); edge = mat('#e6e9eb', 0.22, 0.7)
    R, arm, hr = 0.042, 0.125, 0.011
    sa = (R - hr) / arm; ca = math.sqrt(1 - sa * sa)
    A = V((0, 0, R)); d = V((0, -ca, -sa)); t = V((0, -sa, ca))
    # cutting discs, wavy rim
    n = 36
    for k in range(7):
        x = (k - 3) * 0.027; ring = []
        for i in range(n):
            a = 2 * math.pi * i / n; r = R * (1 - 0.035 + 0.035 * math.cos(9 * a))
            ring.append((r * math.cos(a), r * math.sin(a)))
        rr = [[(x - 0.0006, 0, R)] * n, [(x - 0.0006, y, R + z) for y, z in ring], [(x + 0.0006, y, R + z) for y, z in ring], [(x + 0.0006, 0, R)] * n]
        loft('disc', rr, st, cap0=False, cap1=False, sharp=30)
        if k < 6: cyl('spacer', 0.0085, 0.027 - 0.0012, br, loc=(x + 0.0006, 0, R), rot=(0, math.pi / 2, 0), segs=14)
    for sx in (-1, 1): cyl('spacer_e', 0.0085, 0.0155, br, loc=(sx * 0.0816 if sx > 0 else -0.0816 - 0.0155, 0, R), rot=(0, math.pi / 2, 0), segs=14)
    cyl('axle', 0.004, 0.216, st, loc=(-0.108, 0, R), rot=(0, math.pi / 2, 0), segs=12)
    for sx in (-1, 1): cyl('nut', 0.0085, 0.006, st, loc=(0.1005 if sx > 0 else -0.1065, 0, R), rot=(0, math.pi / 2, 0), segs=6)
    # side plates
    out = [(-0.026, -0.026), (0.0, -0.034), (0.112, -0.017), (0.128, -0.0125), (0.1365, 0), (0.128, 0.0125), (0.112, 0.017), (0.0, 0.034), (-0.026, 0.026), (-0.032, 0)]
    for sx in (-1, 1):
        rr = [[A + d * s + t * q + V((sx * 0.099 + e, 0, 0)) for s, q in out] for e in (-0.0013, 0.0013)]
        bevel(loft('plate', rr, st, sharp=30), 0.0006, 1)
    # tube handle with end caps
    Hc = A + d * arm
    cyl('handle', hr, 0.197, br, loc=(-0.0985, Hc.y, Hc.z), rot=(0, math.pi / 2, 0), segs=20)
    for sx in (-1, 1): cyl('cap', 0.0125, 0.004, st, loc=(0.1003 if sx > 0 else -0.1043, Hc.y, Hc.z), rot=(0, math.pi / 2, 0), segs=20)
