"""Item 7 — Hand trowel. Spec 11.5 × 2.5 in → 29 cm long, blade 8 cm wide. Upright, blade tip up, scoop opening to the front (-Y).
Green ribbed plastic handle with hang hole, steel shank, brushed pointed scoop blade. Source: spec + photo."""
import math
from _lib import *
SNO, WALL = 7, False
def build():
    green, dark, steel = mat('#1f6b45', 0.45), mat('#14472e', 0.5), BRUSHED()
    prof = [(0, 0), (0.008, 0.0), (0.0135, 0.004)]
    for i in range(7):
        z = 0.012 + i * 0.014; prof += [(0.0155, z), (0.0165, z + 0.006)]
    prof += [(0.016, 0.11), (0.012, 0.118), (0.009, 0.122), (0, 0.122)]
    lathe('handle', prof, green, 36)
    cyl('cap', 0.0095, 0.008, dark, loc=(0, 0, 0.118), segs=24)
    tube('shank', [(0, 0, 0.124), (0, 0, 0.138), (0, -0.01, 0.152), (0, -0.016, 0.162)], 0.0042, steel)
    def blade(u, v):
        hw = 0.04 * (1 - u ** 2.4) ** 0.55 * (0.62 + 0.38 * min(1.0, u * 4))
        x = (2 * v - 1) * hw
        y = -0.016 - 0.018 * (1 - (2 * v - 1) ** 2) * (1 - u ** 3) * -1 - 0.004 * u
        return (x, y + 0.01 * (1 - (2 * v - 1) ** 2), 0.16 + u * 0.13)
    surface('blade', blade, 28, 14, steel, thickness=0.0015)
