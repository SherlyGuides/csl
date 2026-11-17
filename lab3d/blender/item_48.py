"""Item 48 — Stainless steel plates (thali), stack of 4. Each Ø 26 cm × 1.8 cm, stacked ≈ 26 × 3.3 × 26 cm. Source: typical / photo."""
import math
from _lib import *
SNO, WALL = 48, False
def build():
    st = mat('#d3d8dc', 0.28, 0.7); inner = mat('#c3c8cc', 0.36, 0.68)   # brushed well, polished rim
    pitch, n = 0.005, 4
    out = [(0, 0), (0.096, 0), (0.101, 0.0012), (0.112, 0.0125), (0.116, 0.0158), (0.127, 0.0165), (0.1295, 0.0172), (0.130, 0.0180)]
    lathe('plate0', out, st, 44)
    for i in range(1, n):   # only the exposed outer band of the nested plates
        ob = lathe(f'plate{i}', out[3:], st, 44, close_bottom=False); ob.location.z = i * pitch
    z = (n - 1) * pitch
    top_in = [(0.130, 0.0180), (0.1285, 0.0186), (0.1265, 0.0180), (0.117, 0.0172), (0.1125, 0.0145), (0.1015, 0.0030)]
    lathe('rim_top', top_in, st, 44, close_bottom=False).location.z = z
    lathe('well', [(0.1015, 0.0030), (0.097, 0.0014), (0.060, 0.0012), (0, 0.0012)], inner, 44, close_bottom=False).location.z = z
