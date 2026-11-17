"""Item 63 — Digital clinical thermometer (plastic). Real size 12.5 × 1.0 × 1.85 cm, lying flat, probe to the left.
White body tapering to a steel probe tip, LCD window, light-blue button and end cap. Source: typical + photo."""
import math
from hc_util import *
SNO, WALL = 63, False
def build():
    white = mat('#f3f4f5', 0.4); blue = mat('#8fc0e8', 0.4); steel = STEEL(); lcd = mat('#97a39a', 0.3); ink = mat('#1c2320', 0.4)
    f = lambda t, hw, hh, n=2.0: (t, hw, hh, hh, n)
    loft('tip', [f(-0.0625, 0.0010, 0.0010), f(-0.0618, 0.0018, 0.0018), f(-0.0605, 0.0021, 0.0021), f(-0.052, 0.0022, 0.0022)], steel, 12)
    loft('body', [f(-0.0525, 0.0024, 0.0024), f(-0.03, 0.0031, 0.0029), f(-0.008, 0.0046, 0.0037, 2.3), f(0.006, 0.0078, 0.0046, 2.8), f(0.016, 0.0091, 0.005, 3),
                  f(0.045, 0.0092, 0.005, 3), f(0.0505, 0.0091, 0.005, 3)], white, 16)
    loft('cap', [f(0.0505, 0.0092, 0.0051, 3), f(0.057, 0.0088, 0.005, 2.8), f(0.0608, 0.0068, 0.0042, 2.4), f(0.0625, 0.0035, 0.0028, 2)], blue, 16)
    rbox('bezel', 0.023, 0.0125, 0.0006, mat('#dfe2e4', 0.4), loc=(0.024, 0, 0.0097), r=0.0003, segs=1)
    box('lcd', 0.019, 0.009, 0.0005, lcd, loc=(0.024, 0, 0.0101))
    text('digits', '36.6', 0.0062, ink, loc=(0.024, 0, 0.0106), rot=(0, 0, 0), depth=0.0001)
    cyl('button', 0.0037, 0.0009, blue, loc=(0.0425, 0, 0.0097), segs=16)
