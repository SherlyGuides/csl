"""Item 15 — Secateurs (bypass pruner), SS 15 mm cut with lock nut (spec). 20 cm, lies flat, closed.
Green handles with black soft grips, curved polished bypass blade, dark anvil hook, centre nut, coil spring, lock latch. Source: spec + photo."""
import math
from _lib import *
SNO, WALL = 15, False
def build():
    green, black, steel, dark = mat('#1e7a46', 0.45), RUBBER(), STEEL(), mat('#6a6e72', 0.4, 0.6)
    ha = [(0.005, 0.012), (-0.03, 0.014), (-0.08, 0.02), (-0.125, 0.026), (-0.138, 0.022), (-0.14, 0.012), (-0.08, 0.006), (-0.03, 0.002), (0.005, 0.0)]
    hb = [(x, -y - 0.002) for x, y in ha]
    prism('handle_a', ha, 0.016, green, bev=0.004)
    prism('handle_b', hb, 0.016, green, bev=0.004)
    ga = [(-0.06, 0.0215), (-0.125, 0.0275), (-0.137, 0.024), (-0.06, 0.017)]
    prism('grip_a', ga, 0.0172, black, bev=0.003)
    prism('grip_b', [(x, -y - 0.002) for x, y in ga], 0.0172, black, bev=0.003)
    blade = [(0.0, 0.009), (0.03, 0.013), (0.055, 0.009), (0.068, 0.001), (0.07, -0.004), (0.055, -0.001), (0.03, -0.003), (0.0, -0.007)]
    prism('blade', blade, 0.0032, steel, loc=(0, 0, 0.0035), bev=0.0004)
    anvil = [(0.0, -0.004), (0.03, -0.004), (0.048, -0.01), (0.044, -0.017), (0.02, -0.016), (0.0, -0.015)]
    prism('anvil', anvil, 0.004, dark, loc=(0, 0, -0.0025), bev=0.0005)
    cyl('nut', 0.0075, 0.02, steel, loc=(0.004, -0.003, -0.01), segs=6)
    coil = [(-0.022 + 0.003 * math.sin(t * 2), -0.001 + 0.011 * (t / (6 * math.pi)) - 0.0065, 0.0045 * math.cos(t)) for t in [i * math.pi / 4 for i in range(25)]]
    tube('spring', coil, 0.0009, steel)
    rbox('latch', 0.012, 0.006, 0.003, dark, loc=(-0.012, 0.012, 0.008), r=0.001)
