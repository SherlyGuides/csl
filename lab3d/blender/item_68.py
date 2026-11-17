"""Item 68 — Hot water bag, red rubber, 2 L. Real size 20.5 × 3.6 × 33 cm lying flat, neck toward the front (-Y) like the
placeholder. Diagonal ribbing, welded rim, funnel neck with cream screw stopper. Source: typical 2 L bag + photo."""
import math
from hc_util import *
SNO, WALL = 68, False
def build():
    red = mat('#d8402f', 0.6); rib = mat('#bf3324', 0.65); cream = mat('#ead9b4', 0.5)
    a, b, c, n = 0.098, 0.128, 0.0165, 4.5; zc = 0.018
    outline = lambda th: (a * se(th, n)[0], b * se(th, n)[1])
    zt = lambda s: c * (1 - s ** 3.2) ** 0.55
    dome('top', outline, lambda s, x, y: zc + zt(s), red, 44, 7)
    dome('bottom', outline, lambda s, x, y: zc - zt(s), red, 44, 7, flip=True)
    prism('rim', [(1.045 * a * se(2 * math.pi * i / 44, n)[0], 1.035 * b * se(2 * math.pi * i / 44, n)[1]) for i in range(44)], 0.004, red, loc=(0, 0, zc), bev=0.0012)
    # diagonal ribbing on the upper face
    def smet(x, y): return (abs(x / a) ** n + abs(y / b) ** n) ** (1 / n)
    k = -0.132
    while k < 0.133:
        # line: points p = k*nrm + t*dir, dir = (1,1)/sqrt2, nrm = (1,-1)/sqrt2
        ts = [t / 200 - 0.2 for t in range(81)]
        ins = [t for t in ts if smet((k + t) * 0.7071, (-k + t) * 0.7071) < 0.86]
        if len(ins) > 3:
            t0, t1 = ins[0], ins[-1]
            def fn(u, v, k=k, t0=t0, t1=t1):
                t = t0 + (t1 - t0) * u; x, y = (k + t) * 0.7071, (-k + t) * 0.7071; w = (v - 0.5) * 0.0032
                x += w * 0.7071; y -= w * 0.7071
                return (x, y, zc + zt(min(smet(x, y), 0.99)) + 0.0007)
            surface('rib', fn, max(4, int((t1 - t0) / 0.018)), 1, rib)
        k += 0.0115
    # neck: narrow throat flaring to a funnel mouth, stopper
    loft('neck', [(-0.108, 0.036, 0.013, zc, 3), (-0.128, 0.026, 0.012, zc, 2.6), (-0.146, 0.0195, 0.0115, zc, 2.3), (-0.16, 0.0205, 0.012, zc, 2.2),
                  (-0.175, 0.031, 0.0145, zc, 2.2), (-0.184, 0.0365, 0.0165, zc, 2.2), (-0.187, 0.0365, 0.0165, zc, 2.2)], red, 20, axis='Y', cap0=False)
    loft('mouth', [(-0.1872, 0.03, 0.012, zc, 2.2), (-0.1876, 0.03, 0.012, zc, 2.2)], rib, 20, axis='Y')
    cyl('stopper', 0.0105, 0.013, cream, loc=(0, -0.187, zc), rot=(math.pi / 2, 0, 0), segs=16)
    for i in range(12):
        an = 2 * math.pi * i / 12
        box('grip', 0.0022, 0.0012, 0.011, cream, loc=(0.0107 * math.cos(an), -0.1885, zc + 0.0107 * math.sin(an)), rot=(math.pi / 2, an + math.pi / 2, 0))
