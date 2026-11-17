"""Item 42 — Kitchen scissors, stainless blades, black plastic handles (large finger bow + thumb bow). Real size 21.5 L x 8.5 W x
0.9 cm. Lies flat, blades toward +X, slightly open (placeholder pose). Source: typical 8.5 in kitchen shears + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 42, False

def build():
    st = mat('#d6dadd', 0.26, 0.7); hb = mat('#18191b', 0.45)
    th = math.radians(6.5)
    for sg, (cx, cy, ax, ay) in ((1, (-0.078, -0.0215, 0.0215, 0.0135)), (-1, (-0.083, -0.0235, 0.0285, 0.0155))):
        with Collect() as c:
            out = [(-0.034, -0.0045), (0.012, -0.0058), (0.070, -0.0032), (0.1085, -0.0006), (0.1092, 0.0003), (0.06, 0.0052), (0.02, 0.0078), (0.0, 0.008), (-0.034, 0.0045)]
            out = [(x, y * sg) for x, y in out]
            if sg < 0: out.reverse()
            prism('blade', out, 0.0015, st, loc=(0, 0, sg * 0.00078), bev=0.0003)
            sh = crom([(-0.022, 0.0, 0), (-0.040, -0.0035 * sg, 0), (-0.054, -0.0085 * sg, 0), (cx + ax * 0.75, (cy + ay * 0.75) * sg, 0)], 3)
            strip('shank', sh, [0.0125, 0.012, 0.0115, 0.011, 0.0105, 0.010, 0.0095, 0.009, 0.0085, 0.008], 0.0078, hb, N=(0, 0, 1))
            lp = []
            for k in range(22):
                a = 2 * math.pi * k / 22; x, y = ax * math.cos(a), ay * math.sin(a) * (1 + 0.12 * math.cos(a))
                ca, sa = math.cos(-0.30), math.sin(-0.30)
                lp.append((cx + x * ca - y * sa, (cy + x * sa + y * ca) * sg, 0))
            wire('bow', lp, 0.0043, hb, segs=6, closed=True)
        xform(c.objs, RZ(sg * th))
    cyl('pivot', 0.0042, 0.0046, st, loc=(0, 0, -0.0023), segs=16)
    rbox('slot', 0.006, 0.001, 0.0003, DARK(), loc=(0, 0, 0.0023), r=0)
