"""Item 51 — Tong, stainless steel utility tongs with scalloped heads, spring U-hinge and pull ring. Real size 25.5 L x 3.6 H x
7.5 cm (open). Pose = placeholder: along X, hinge at -X, tips at +X, arms opening in depth (the room turns it to hang tips-down).
Source: typical 9-10 in kitchen tong + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 51, False

def build():
    st = mat('#d5dadd', 0.27, 0.7)
    X1 = 0.240
    def arm(sg):
        pts, ws = [], []
        xs = [0.008 + (0.170 - 0.008) * i / 6 for i in range(7)] + [0.170 + (X1 - 0.170) * i / 18 for i in range(1, 19)]
        for x in xs:
            y = 0.008 + 0.028 * ((x - 0.008) / (X1 - 0.008)) ** 0.9
            u = max(0.0, (x - 0.170) / (X1 - 0.170))
            if u > 0.85: y -= 0.004 * ((u - 0.85) / 0.15) ** 2          # tips toe in
            w = 0.0165 + 0.0195 * math.sin(math.pi * u * 0.78) ** 0.8 if u > 0 else 0.0165 + 0.0015 * math.sin(math.pi * (x - 0.008) / 0.162)
            if u > 0.25: w += 0.0022 * math.cos(u * 7 * math.pi)        # scalloped gripping edge
            if u > 0.96: w *= 0.8
            pts.append((x, sg * y, 0)); ws.append(w)
        return pts, ws
    pa, wa = arm(1); pb, wb = arm(-1)
    hinge = [(0.008 + 0.008 * math.cos(a), 0.008 * math.sin(a), 0) for a in [math.radians(90 + 180 * i / 8) for i in range(1, 8)]]
    pts = pa[::-1] + hinge + pb; ws = wa[::-1] + [0.0165] * len(hinge) + wb
    strip('tong', pts, 0.0013, ws, st, N=(0, 0, 1), sharp=40)
    # stiffening rib down each arm (pressed channel)
    for sg in (1, -1):
        rp = [(x, sg * (0.008 + 0.028 * ((x - 0.008) / (X1 - 0.008)) ** 0.9 + 0.0009), 0) for x in (0.02, 0.06, 0.10, 0.14, 0.168)]
        strip('rib', rp, 0.0012, 0.005, st, N=(0, 0, 1))
    ring = [(-0.0085 + 0.0085 * math.cos(2 * math.pi * k / 16), 0, 0.0085 * math.sin(2 * math.pi * k / 16)) for k in range(16)]
    wire('pull', ring, 0.0014, st, segs=5, closed=True)
