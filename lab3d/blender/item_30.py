"""Item 30 — Grater / shredder, 4-sided stainless steel box grater. Real size 10.5 W x 23 H x 8.2 D cm (base), tapering to a
6.8 x 4.8 cm top with a band handle. Stands upright (as the placeholder). Faces: coarse teardrop (front), fine (right),
medium (left), slicer slots (back). Source: typical 9 in box grater + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 30, False

def build():
    st = mat('#d6dadd', 0.3, 0.7); lipm = mat('#eef1f3', 0.25, 0.7); dk = mat('#26282b', 0.6, 0.2)
    bw, bd, tw, td, h = 0.105, 0.082, 0.068, 0.048, 0.20
    B = [V((-bw / 2, -bd / 2, 0)), V((bw / 2, -bd / 2, 0)), V((bw / 2, bd / 2, 0)), V((-bw / 2, bd / 2, 0))]
    T = [V((-tw / 2, -td / 2, h)), V((tw / 2, -td / 2, h)), V((tw / 2, td / 2, h)), V((-tw / 2, td / 2, h))]
    body = loft('body', [B, T], st, cap0=False, cap1=True, sharp=30); bevel(body, 0.004, 2)
    lerp = lambda k, f: B[k].lerp(T[k], f)
    grow = lambda p, e: V((p.x + math.copysign(e, p.x), p.y + math.copysign(e, p.y), p.z))
    # rolled bands at the foot and the top
    for f0, f1, e in ((0.0, 0.055, 0.0014), (0.955, 1.0, 0.001)):
        r0 = [grow(lerp(k, f0), e) for k in range(4)]; r1 = [grow(lerp(k, f1), e) for k in range(4)]
        bevel(loft('band', [r0, r1], st, cap0=False, cap1=True, sharp=30), 0.004, 2)
    # band handle arching over the top
    a = tw / 2 - 0.0012
    hp = [(-a, 0, h - 0.012), (-a, 0, h + 0.020), (-a + 0.003, 0, h + 0.028), (-a + 0.010, 0, h + 0.032), (a - 0.010, 0, h + 0.032),
          (a - 0.003, 0, h + 0.028), (a, 0, h + 0.020), (a, 0, h - 0.012)]
    strip('handle', hp, 0.0016, 0.024, st, N=(0, 1, 0))
    darkf, lipf = [], []
    for k in range(4):
        b0, b1, t0, t1 = B[k], B[(k + 1) % 4], T[k], T[(k + 1) % 4]
        O = (b0 + b1) / 2; u = (b1 - b0).normalized(); Tc = (t0 + t1) / 2; L = (Tc - O).length; v = (Tc - O).normalized(); nrm = u.cross(v)
        wb, wt = (b1 - b0).length, (t1 - t0).length
        P = lambda x, s, o=0.0004: O + u * x + v * s + nrm * o
        width = lambda s: wb + (wt - wb) * s / L
        def tooth(x, s, sc):
            darkf.append([P(x + dx * sc, s + ds * sc) for dx, ds in ((0, -0.0062), (0.0036, -0.002), (0.003, 0.003), (0, 0.0052), (-0.003, 0.003), (-0.0036, -0.002))])
            ap = P(x, s - 0.0025 * sc, 0.0028 * sc); l, r, bt = P(x - 0.0038 * sc, s - 0.002 * sc, 0.0005), P(x + 0.0038 * sc, s - 0.002 * sc, 0.0005), P(x, s - 0.0068 * sc, 0.0005)
            lipf.extend([[l, bt, ap], [bt, r, ap], [r, l, ap]])
        if k == 0 or k == 3:                    # coarse (front) and medium (left) teardrop teeth
            sc, dx, ds = (1.0, 0.0165, 0.0185) if k == 0 else (0.62, 0.0115, 0.0125)
            s = 0.026; row = 0
            while s < L - 0.022:
                nmax = int((width(s) - 0.022) / dx); ncol = nmax - (row % 2)
                for i in range(ncol + 1): tooth((i - ncol / 2) * dx, s, sc)
                s += ds; row += 1
        elif k == 1:                            # fine: rows of small punched stars
            s = 0.022; row = 0
            while s < L - 0.018:
                nmax = int((width(s) - 0.02) / 0.0075); ncol = nmax - (row % 2)
                for i in range(ncol + 1):
                    x = (i - ncol / 2) * 0.0075; d = 0.0017
                    darkf.append([P(x, s - d), P(x + d, s), P(x, s + d), P(x - d, s)])
                s += 0.0078; row += 1
        else:                                   # slicer: three raised slots, fine holes above
            for s in (0.045, 0.085, 0.125):
                w = width(s) - 0.028
                darkf.append([P(-w / 2, s - 0.003), P(w / 2, s - 0.003), P(w / 2, s + 0.003), P(-w / 2, s + 0.003)])
                lipf.append([P(-w / 2, s - 0.003, 0.0005), P(w / 2, s - 0.003, 0.0005), P(w / 2, s + 0.0015, 0.0045), P(-w / 2, s + 0.0015, 0.0045)])
                lipf.append([P(-w / 2, s - 0.003, 0.0005), P(-w / 2, s + 0.0015, 0.0045), P(-w / 2, s + 0.003, 0.0005)])
                lipf.append([P(w / 2, s - 0.003, 0.0005), P(w / 2, s + 0.003, 0.0005), P(w / 2, s + 0.0015, 0.0045)])
            s = 0.15; row = 0
            while s < L - 0.018:
                ncol = int((width(s) - 0.022) / 0.009) - (row % 2)
                for i in range(ncol + 1):
                    x = (i - ncol / 2) * 0.009; d = 0.002
                    darkf.append([P(x, s - d), P(x + d, s), P(x, s + d), P(x - d, s)])
                s += 0.0095; row += 1
    polys('holes', darkf, dk); polys('lips', lipf, lipm)
