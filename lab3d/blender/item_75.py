"""Item 75 — Sterilium hand disinfectant, 500 ml bottle. Real size 7.6 × 20.3 × 5 cm: white rounded-rectangular HDPE
bottle with a flip-top cap, standing. Source: spec volume + photo."""
import math
from hc_util import *
SNO, WALL = 75, False
def build():
    white = mat('#f3f4f3', 0.35); cap = mat('#fafafa', 0.3); lab = mat('#e9eff4', 0.45); ink = mat('#3e6fa8', 0.5)
    loft('bottle', [(0, 0.0335, 0.021, 0, 4), (0.003, 0.0362, 0.0238, 0, 4), (0.01, 0.037, 0.0246, 0, 4.5), (0.15, 0.038, 0.025, 0, 4.5), (0.163, 0.0372, 0.0244, 0, 4),
                    (0.170, 0.032, 0.0215, 0, 3.2), (0.1745, 0.022, 0.017, 0, 2.5), (0.177, 0.0142, 0.0142, 0, 2)], white, 32, axis='Z')
    lathe('cap', [(0.0142, 0.176), (0.0146, 0.178), (0.0146, 0.199), (0.0135, 0.2025), (0, 0.203)], cap, 28, close_bottom=False)
    lathe('seam', [(0.0148, 0.1895), (0.0148, 0.1902)], mat('#c9cdd0', 0.5), 28, close_bottom=False)
    rbox('thumb', 0.009, 0.003, 0.0022, cap, loc=(0, -0.0152, 0.1902), r=0.0008, segs=1)
    rbox('label', 0.058, 0.0006, 0.085, lab, loc=(0, -0.0251, 0.04), r=0)
    box('label_band', 0.058, 0.0007, 0.012, ink, loc=(0, -0.0252, 0.113))
    text('vol', '500 ml', 0.009, ink, loc=(0, -0.0256, 0.055), depth=0.0002)
