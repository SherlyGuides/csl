"""Item 67 — Hand sanitizer, 500 ml pump bottle. Real size Ø7.5 × 21 cm (clear round PET bottle 16.6 cm + lotion pump),
white wrap label, nozzle pointing +X like the placeholder. Source: spec volume + photo."""
import math
from hc_util import *
SNO, WALL = 67, False
def build():
    clear = mat('#e3eff5', 0.08, 0.0, 0.35); white = mat('#f4f5f5', 0.4); tube_m = mat('#f2f4f5', 0.3, 0.0, 0.6)
    R = 0.0375
    lathe('bottle', [(0, 0.002), (0.02, 0.0), (0.033, 0.0), (0.0365, 0.003), (R, 0.01), (R, 0.118), (0.0362, 0.131), (0.031, 0.144), (0.021, 0.153),
                     (0.0135, 0.157), (0.0135, 0.166)], clear, 32)
    lathe('label', [(R + 0.0003, 0.042), (R + 0.0003, 0.108)], white, 32, close_bottom=False)
    text('vol', '500 ml', 0.008, mat('#7d8a94', 0.5), loc=(0, -R - 0.0005, 0.052), depth=0.0002)
    cyl('dip', 0.0022, 0.15, tube_m, loc=(0.004, 0, 0.008), rot=(0, math.radians(-1.5), 0), segs=8)
    # pump: ribbed closure, collar, stem, actuator with spout
    lathe('closure', [(0, 0.157), (0.0158, 0.157), (0.0158, 0.176), (0.014, 0.178), (0, 0.178)], white, 24)
    for i in range(16):
        a = 2 * math.pi * i / 16
        box('rib', 0.0008, 0.0014, 0.017, white, loc=(0.016 * math.cos(a), 0.016 * math.sin(a), 0.158), rot=(0, 0, a))
    lathe('collar', [(0.009, 0.178), (0.009, 0.186), (0.0075, 0.188), (0, 0.188)], white, 20, close_bottom=False)
    cyl('stem', 0.0045, 0.012, white, loc=(0, 0, 0.187), segs=14)
    loft('head', [(-0.0125, 0.008, 0.004, 0.2035, 2.5), (-0.01, 0.0115, 0.0058, 0.2035, 2.5), (0.004, 0.012, 0.0065, 0.2035, 2.5), (0.014, 0.0085, 0.0058, 0.2032, 2.3),
                  (0.028, 0.0048, 0.0042, 0.2015, 2), (0.04, 0.0036, 0.0034, 0.199, 2), (0.045, 0.0032, 0.003, 0.196, 2)], white, 12)
