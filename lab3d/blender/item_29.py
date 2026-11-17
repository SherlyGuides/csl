"""Item 29 — Glass container 0.5 kg with red plastic screw lid. Ø 9.0 × 13.6 cm. Source: spec (0.5 kg) / typical / photo."""
import math
from _lib import *
SNO, WALL = 29, False
def build():
    glass = mat('#e4eef0', 0.08, 0.0, 0.35); red = mat('#d8232a', 0.42); thick = mat('#cfdfe2', 0.1, 0.0, 0.55)
    out = [(0, 0), (0.038, 0), (0.0425, 0.0015), (0.045, 0.006), (0.045, 0.092), (0.0442, 0.099), (0.0415, 0.105), (0.038, 0.1085),
           (0.0372, 0.111), (0.0372, 0.127), (0.0345, 0.127), (0.0345, 0.110), (0.0385, 0.104), (0.0418, 0.097), (0.0425, 0.090),
           (0.0425, 0.010), (0.039, 0.0065), (0, 0.0065)]
    lathe('jar', out, glass, 40)
    lathe('base_glass', [(0, 0.0005), (0.040, 0.0005), (0.041, 0.006), (0, 0.006)], thick, 40)   # heavy glass foot reads denser
    # lid: knurled skirt + smooth domed top
    n = 44; pts = []
    for i in range(n * 2):
        a = math.pi * i / n; r = 0.0415 if i % 2 == 0 else 0.0403
        pts.append((r * math.cos(a), r * math.sin(a)))
    prism('lid_skirt', pts, 0.017, red, 'XY', loc=(0, 0, 0.1125), bev=0, centred=False)
    lathe('lid_top', [(0.0403, 0.1293), (0.0413, 0.1300), (0.0410, 0.1335), (0.0390, 0.1355), (0.030, 0.1360), (0, 0.1360)], red, 44, close_bottom=False)
    lathe('lid_lip', [(0.0403, 0.1125), (0.0420, 0.1120), (0.0420, 0.1140), (0.0403, 0.1145)], red, 44, close_bottom=False)
