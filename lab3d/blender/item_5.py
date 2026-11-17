"""Item 5 — Hand hoe (digging tool). Upright (handle down, head up) like the placeholder; hangs head-down on the tool rail.
Turned wooden handle 22 cm Ø3.2 cm, black steel ferrule, forged gooseneck, trapezoid blade 10 cm wide × 9 cm. Overall ≈ 36 cm. Source: photo + typical."""
import math
from _lib import *
SNO, WALL = 5, False
def build():
    wood, forged = WOOD(), mat('#575b5f', 0.55, 0.6)
    lathe('handle', [(0, 0), (0.011, 0.0), (0.015, 0.006), (0.0165, 0.06), (0.016, 0.16), (0.0145, 0.215), (0, 0.215)], wood, 40)
    cyl('ferrule', 0.0155, 0.032, forged, loc=(0, 0, 0.21), segs=32, r2=0.012)
    tube('neck', [(0, 0, 0.24), (0, -0.008, 0.256), (0, -0.032, 0.264), (0, -0.05, 0.258)], 0.0055, forged)
    blade = [(-0.022, 0.0), (0.022, 0.0), (0.05, -0.085), (0.03, -0.09), (0.0, -0.092), (-0.03, -0.09), (-0.05, -0.085)]
    b = prism('blade', blade, 0.0035, forged, plane='XZ', loc=(0, -0.054, 0.265), rot=(math.radians(-14), 0, 0), bev=0.0006)
    edge = [(-0.05, -0.084), (0.05, -0.084), (0.03, -0.09), (0.0, -0.092), (-0.03, -0.09)]
    prism('edge', edge, 0.0037, mat('#b9bec2', 0.3, 0.7), plane='XZ', loc=(0, -0.054, 0.265), rot=(math.radians(-14), 0, 0), bev=0)
