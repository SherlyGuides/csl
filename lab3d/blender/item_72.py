"""Item 72 — Red colour, 125 ml squeeze tube. Real size 16.7 × 4 × 6.3 cm lying flat (Ø4 cm tube, crimped tail 6.3 cm wide),
white ribbed cap at +X like the placeholder. Source: spec volume + photo."""
import math
from hc_util import *
SNO, WALL = 72, False
def build():
    red = mat('#d6211f', 0.28); red2 = mat('#b81a19', 0.35); white = mat('#f4f4f3', 0.4)
    zc = 0.02; f = lambda t, hw, hh, n=2.0: (t, hw, hh, zc, n)
    loft('crimp', [f(-0.085, 0.0315, 0.0008, 4), f(-0.077, 0.0315, 0.001, 4)], red2, 16)
    for i in range(5):
        box('crimp_rib', 0.0006, 0.062, 0.0026, red2, loc=(-0.084 + i * 0.0015, 0, zc - 0.0013))
    loft('tube', [f(-0.077, 0.0314, 0.001, 4), f(-0.06, 0.0298, 0.0065, 2.6), f(-0.035, 0.0265, 0.0135, 2.2), f(-0.005, 0.0228, 0.018), f(0.025, 0.0204, 0.0198), f(0.05, 0.02, 0.02),
                  f(0.057, 0.0196, 0.0196), f(0.0605, 0.0165, 0.0165), f(0.062, 0.012, 0.012)], red, 24)
    cyl('cap', 0.0168, 0.0205, white, loc=(0.0615, 0, zc), rot=(0, math.pi / 2, 0), segs=28)
    for i in range(28):
        a = 2 * math.pi * i / 28
        box('rib', 0.017, 0.0012, 0.0008, white, loc=(0.072, 0.0168 * math.sin(a), zc - 0.0168 * math.cos(a) ), rot=(a, 0, 0))
    text('vol', '125 ml', 0.008, mat('#f6e9e6', 0.4), loc=(-0.01, -0.004, zc + 0.0181), rot=(0, 0, 0), depth=0.00015)
