"""Item 34 — Measuring mug/cup 250 ml, clear plastic, graduated, pouring spout and D handle.
Body Ø 8.2 (top) / 6.4 (base) × 9.2 cm; with handle and spout ≈ 12.3 × 9.2 × 8.2 cm. Source: spec (250 ml) / photo."""
import math
from _lib import *
SNO, WALL = 34, False
def build():
    clear = mat('#e6f0f4', 0.12, 0.0, 0.35); mark = mat('#5d7480', 0.5); foot = mat('#d5e2e8', 0.15, 0.0, 0.6)
    H, rb, rt = 0.092, 0.032, 0.041
    R = lambda z: rb + (rt - rb) * z / H
    prof = [(0, 0), (rb - 0.002, 0), (rb, 0.002), (R(0.03), 0.03), (R(0.06), 0.06), (R(0.08), 0.08), (rt, H), (rt - 0.0018, H),
            (R(0.08) - 0.0018, 0.08), (R(0.06) - 0.0018, 0.06), (R(0.03) - 0.0018, 0.03), (rb - 0.0018, 0.005), (0, 0.004)]
    body = lathe('mug', prof, clear, 32)
    for v in body.data.vertices:                      # pull the rim into a pouring spout at -X
        x, y, z = v.co; rr = math.hypot(x, y)
        if rr < 1e-5: continue
        d = math.atan2(y, -x); w = math.exp(-(d / 0.42) ** 2) * max(0, (z - 0.062) / (H - 0.062)) ** 1.6
        k = (rr + 0.011 * w) / rr; v.co.x *= k; v.co.y *= k
    lathe('foot', [(0, 0.0003), (rb - 0.001, 0.0003), (rb - 0.0005, 0.004), (0, 0.004)], foot, 32)
    # D handle on +X
    tube('handle', [(rt - 0.0015, 0, 0.083), (0.058, 0, 0.085), (0.071, 0, 0.076), (0.072, 0, 0.045), (0.068, 0, 0.026), (0.052, 0, 0.020), (R(0.022) - 0.001, 0, 0.022)],
         0.0042, clear, res=2).data.resolution_u = 6
    # graduations on the front (-Y): long ticks at 50 ml steps, short between, 250 ml lettering
    slope = math.atan2(rt - rb, H)
    def zml(ml): return 0.004 + 0.056 * (ml / 250.0) ** 0.9          # 250 ml sits ~6 cm up
    for ml in range(25, 251, 25):
        z = zml(ml); long = ml % 50 == 0
        rbox('tick', 0.016 if long else 0.008, 0.0008, 0.0009, mark, loc=(-0.012 + (0.008 if long else 0.004), -R(z) - 0.0002, z), rot=(-slope, 0, 0), r=0)
    text('t250', '250 ml', 0.0068, mark, loc=(0.017, -R(zml(250)) - 0.0005, zml(250)), rot=(math.pi / 2 - slope, 0, 0), depth=0.0003).data.resolution_u = 2
    text('t100', '100', 0.0055, mark, loc=(0.013, -R(zml(100)) - 0.0005, zml(100)), rot=(math.pi / 2 - slope, 0, 0), depth=0.0003).data.resolution_u = 2
