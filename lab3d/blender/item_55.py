"""Item 55 — Pot lifter (pakkad / sandasi), stainless steel: scissor-action with two long wire-loop handles, riveted flat levers and
two curved gripping jaws. Real size 22 L x 2.4 H x 8 W cm. Pose = placeholder: lying along X, jaws at +X (the room turns it to
hang jaws-down). Source: typical Indian steel pakkad + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 55, False

def build():
    st = mat('#d5dadd', 0.27, 0.7); br = mat('#c8cdd1', 0.34, 0.68); zc = 0.012
    for sg in (1, -1):
        z = zc + sg * 0.0012
        strip('lever', crom([(-0.052, 0.0175 * sg, z), (-0.025, 0.0085 * sg, z), (0, 0, z), (0.018, -0.0065 * sg, z), (0.031, -0.0125 * sg, z)], 2), 0.013, 0.0022, br, N=(0, 0, 1))
        # long wire-loop handle
        p0 = V((-0.040, 0.0135 * sg, z)); p1 = V((-0.126, 0.034 * sg, z)); e = (p1 - p0).normalized(); q = V((-e.y, e.x, 0)); hw = 0.0085; lp = []
        for k in range(9): a = -math.pi / 2 + math.pi * k / 8; lp.append(p1 + e * hw * math.cos(a) + q * hw * math.sin(a))
        for k in range(9): a = math.pi / 2 + math.pi * k / 8; lp.append(p0 + e * hw * 0.55 * math.cos(a) + q * hw * 0.55 * math.sin(a))
        wire('grip', lp, 0.0026, st, segs=6, closed=True)
        # curved jaw: upright band bent into a C
        jp = [(0.027, -0.0105 * sg, zc), (0.040, -0.0215 * sg, zc), (0.056, -0.0305 * sg, zc), (0.072, -0.0305 * sg, zc), (0.083, -0.0215 * sg, zc), (0.0865, -0.0105 * sg, zc), (0.083, -0.0035 * sg, zc)]
        pts = crom(jp, 3); n = len(pts)
        strip('jaw', pts, 0.002, [0.012 + 0.012 * min(1, i / 4) for i in range(n)], st, N=(0, 0, 1), sharp=None)
    cyl('rivet', 0.0052, 0.0075, st, loc=(0, 0, zc - 0.00375), segs=14)
