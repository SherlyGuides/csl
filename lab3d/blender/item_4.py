"""Item 4 — Pot (Gamla), 6 in plastic (spec 4-6 in). Real size: rim Ø 15.4 cm, 12 cm tall, base Ø 10 cm; with soil and a
leafy plant as it stands in the room. Terracotta-colour plastic, rolled rim, collar band, stepped base with drain notches.
Source: spec + catalogue photo."""
import math
from _lib import *
from agri_util import *
from plants import rosette
SNO, WALL = 4, False

def build():
    terra = mat('#c0562b', 0.5)
    dark = mat('#6a2c14', 0.6)
    s = 0.945
    prof = [(0, 0.004), (0.048, 0.004), (0.050, 0.0), (0.0535, 0.0), (0.0555, 0.012), (0.0578, 0.0135), (0.0700, 0.094),
            (0.0750, 0.0965), (0.0762, 0.115), (0.0800, 0.117), (0.0815, 0.1215), (0.0800, 0.1258), (0.0762, 0.127), (0.0728, 0.125),
            (0.0708, 0.115), (0.0690, 0.100)]
    crisp(lathe('pot', [(r * s, z * s) for r, z in prof], terra, 48), 35)
    # drain notches round the base
    for k in range(4):
        a = math.radians(45 + 90 * k); r0, r1, hw, h = 0.049 * s, 0.0545 * s, 0.009, 0.0065
        c, sn = math.cos(a), math.sin(a)
        pts = [(rr * c - t * sn, rr * sn + t * c, z) for rr in (r0, r1 - 0.0004) for t in (-hw, hw) for z in (0, h)]
        hull('notch', pts, dark)
    soil('soil', 0.0655, 0.098 * s, seed=4, lumps=4)
    rosette('plant', loc=(0, 0, 0.097), radius=0.125, n=11, height=0.085, seed=41)
