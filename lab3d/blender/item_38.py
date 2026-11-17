"""Item 38 — Plastic containers, food grade, set of 4 (round tubs with snap lids), stacked largest at the bottom.
Tubs Ø 17 / 14.5 / 12.5 / 10.5 cm, heights 10 / 8.5 / 7.5 / 6.5 cm; stack ≈ 17.6 × 32.5 × 17.6 cm. Source: photo / typical."""
import math
from _lib import *
SNO, WALL = 38, False
def build():
    clear = mat('#eef3f5', 0.2, 0.0, 0.4); lid = mat('#f6f8f9', 0.4, 0.0, 0.8)
    z = 0.0
    for i, (R, H) in enumerate(((0.085, 0.100), (0.0725, 0.085), (0.0625, 0.075), (0.0525, 0.065))):
        rb = R * 0.84; hb = H - 0.008          # tub body height below the lid
        tub = [(0, 0), (rb - 0.004, 0), (rb, 0.004), (R - 0.002, hb - 0.006), (R + 0.001, hb - 0.005), (R + 0.001, hb - 0.002),
               (R - 0.002, hb), (R - 0.0035, hb), (rb - 0.0015, 0.005), (0, 0.0025)]
        lathe(f'tub{i}', tub, clear, 30).location.z = z
        lp = [(R + 0.003, hb - 0.004), (R + 0.0035, hb + 0.004), (R + 0.0015, hb + 0.0065), (R - 0.006, hb + 0.0065), (R - 0.009, hb + 0.003),
              (R - 0.016, hb + 0.003), (R - 0.019, hb + 0.008), (0, hb + 0.008)]
        lathe(f'lid{i}', lp, lid, 30, close_bottom=False).location.z = z
        z += H
