"""Item 69 — Mercury clinical thermometer. Real size 11 × 0.52 × 0.58 cm, lying flat, bulb to the left like the placeholder.
Clear glass stem, cream scale strip with graduations, silver mercury column and bulb. Source: typical + photo."""
import math
from hc_util import *
SNO, WALL = 69, False
def build():
    glass = mat('#eef6f8', 0.05, 0.0, 0.35); hg = mat('#c9ced2', 0.15, 0.75); strip = mat('#f3efdd', 0.6); ink = mat('#20201e', 0.5)
    zc = 0.0026; f = lambda t, hw, hh: (t, hw, hh, zc)
    loft('bulb', [f(-0.055, 0.0007, 0.0007), f(-0.0543, 0.0015, 0.0015), f(-0.053, 0.0018, 0.0018), f(-0.046, 0.0018, 0.0018), f(-0.0445, 0.0013, 0.0013)], hg, 12)
    loft('stem', [f(-0.0447, 0.0014, 0.0014), f(-0.039, 0.0027, 0.0024), f(-0.036, 0.0029, 0.0026), f(0.052, 0.0029, 0.0026), f(0.0543, 0.0022, 0.002), f(0.055, 0.001, 0.001)], glass, 12)
    box('scale', 0.078, 0.0036, 0.0003, strip, loc=(0.008, 0, zc - 0.0006))
    box('column', 0.046, 0.0006, 0.0005, hg, loc=(-0.021, 0, zc - 0.0003))
    for i in range(29):
        x = -0.026 + i * 0.0025; big = i % 5 == 0
        box('tick', 0.00035, 0.0016 if big else 0.001, 0.0002, ink, loc=(x, 0.0009 if big else 0.0012, zc - 0.0003))
