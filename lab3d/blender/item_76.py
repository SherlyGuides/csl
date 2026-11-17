"""Item 76 — Reusable plastic syringes, group of 3 (20 ml Ø2.1 × 12.8 cm, 10 ml Ø1.7 × 11.5 cm, 5 ml Ø1.35 × 9.8 cm),
lying flat side by side, tips toward +X like the placeholder. Clear barrels with graduations, coloured plungers and tip caps,
black gasket. Group ≈ 13 × 2.4 × 9 cm. Source: typical sizes + photo."""
import math
from hc_util import *
SNO, WALL = 76, False
def syringe(Rb, Lb, col):
    clear = mat('#eef4f6', 0.08, 0.0, 0.35); flange = mat('#eaf1f4', 0.15, 0.0, 0.55); black = mat('#17181a', 0.6); ink = mat('#16181a', 0.5)
    c = mat(col, 0.4)
    G = Lb * 0.84; P = Lb + 0.012 - G
    lathe('barrel', [(Rb, 0), (Rb, Lb), (Rb * 0.55, Lb + 0.003), (0.0023, Lb + 0.0042), (0.0019, Lb + 0.013)], clear, 20, close_bottom=False)
    loft('flange', [(-0.0009, Rb + 0.0012, Rb + 0.0085, 0, 2.6), (0.0009, Rb + 0.0012, Rb + 0.0085, 0, 2.6)], flange, 20, axis='Z')
    w = Rb * 1.5
    box('rod_a', 0.0012, w, G - 0.006 + P, c, loc=(0, 0, -P)); box('rod_b', w, 0.0012, G - 0.006 + P, c, loc=(0, 0, -P))
    cyl('thumb', Rb + 0.0012, 0.002, c, loc=(0, 0, -P - 0.002), segs=20)
    cyl('guide', Rb * 0.86, 0.0012, c, loc=(0, 0, -0.004), segs=16)
    lathe('gasket', [(0, G - 0.0065), (Rb * 0.93, G - 0.0065), (Rb * 0.93, G - 0.0045), (Rb * 0.8, G - 0.0035), (Rb * 0.93, G - 0.0025), (Rb * 0.93, G - 0.0008), (Rb * 0.3, G + 0.0022), (0, G + 0.0024)], black, 16)
    lathe('tipcap', [(0, Lb + 0.0185), (0.0026, Lb + 0.0185), (0.0034, Lb + 0.017), (0.0042, Lb + 0.006), (0.0042, Lb + 0.0045), (0, Lb + 0.0045)], c, 14)
    n = 10
    for i in range(n + 1):
        big = i % 5 == 0
        box('tick', 0.0003, Rb * (1.0 if big else 0.6), 0.0004, ink, loc=(-(Rb + 0.00005), 0, Lb * (0.12 + 0.76 * i / n)))
def build():
    specs = [(0.0105, 0.085, '#2f7fe0', 0.03, 3), (0.0085, 0.075, '#8a63c9', 0.0, -2), (0.00675, 0.062, '#1fa58a', -0.0265, 2)]
    for Rb, Lb, col, y, a in specs:
        with grp(loc=(0, y, Rb + 0.0012), rot=(0, 0, math.radians(a))):
            with grp(rot=(0, math.pi / 2, 0)):
                syringe(Rb, Lb, col)
