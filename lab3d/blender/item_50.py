"""Item 50 — Table spoons (stainless steel), set of 12 standing bowl-up in a steel spoon holder (the placeholder's arrangement).
Spoons 18.2 cm; holder 9.3 dia x 11 cm. Real size 13.5 W x 18 H x 13.5 D cm. Source: typical table spoon + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 50, False

def spoon(st):
    zs = [0.0, 0.004, 0.012, 0.045, 0.085, 0.108, 0.118, 0.128]
    ws = [0.006, 0.0125, 0.0145, 0.0115, 0.0072, 0.0058, 0.0066, 0.011]
    ys = [0.0030, 0.0022, 0.0012, 0.0, 0.0008, 0.0030, 0.0048, 0.0062]
    h = strip('sp_handle', [(0, y, z) for y, z in zip(ys, zs)], ws, 0.0022, st, N=(0, 1, 0))
    b = bowl('sp_bowl', 0.0295, 0.0195, 0.0072, st, rings=3, segs=12, egg=-0.14)
    b.matrix_basis = TR(0, 0.0, 0.1525) @ Matrix(((0, -1, 0, 0), (0, 0, -1, 0), (1, 0, 0, 0), (0, 0, 0, 1)))
    return [h, b]

def build():
    st = mat('#d8dcdf', 0.24, 0.7); br = mat('#c6cbcf', 0.34, 0.65)
    prof = [(0, 0), (0.043, 0), (0.045, 0.002), (0.045, 0.012), (0.0456, 0.013), (0.0456, 0.016), (0.045, 0.017), (0.045, 0.094), (0.0456, 0.095),
            (0.0456, 0.098), (0.045, 0.099), (0.045, 0.106), (0.0466, 0.108), (0.0466, 0.110), (0.0436, 0.110), (0.0436, 0.004), (0, 0.004)]
    lathe('holder', prof, br, 36)
    for i in range(6):                  # outer ring: leaning on the rim, bowls facing in
        th = i * math.pi / 3 + 0.2
        xform(spoon(st), RZ(th) @ TR(0.019, 0, 0.0045) @ RY(math.radians(13.5 + (i % 2) * 1.5)) @ RZ(-math.pi / 2))
    for i in range(6):                  # inner ring: nearly upright, turned edge-on
        th = i * math.pi / 3 + 0.2 + math.pi / 6
        xform(spoon(st), RZ(th) @ TR(0.010, 0, 0.0045 + 0.003 * (i % 3)) @ RY(math.radians(5 + (i % 2) * 2)) @ RZ(0.25 * (-1) ** i))
