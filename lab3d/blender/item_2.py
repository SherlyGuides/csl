"""Item 2 — Budding/grafting knife. Lies flat. Closed handle 11 cm (rosewood, brass bolsters + rivets), hawkbill pruning blade
and straight budding blade open, brass budding spatula at the tail. Overall ≈ 22 × 4 × 1.5 cm open. Source: photo + typical."""
import math
from _lib import *
SNO, WALL = 2, False
def build():
    wood, brass, steel = DARKWOOD(), BRASS(), STEEL()
    prism('handle', circle_pts(0.055, 0.0095, 40), 0.012, wood, bev=0.0035)
    for x in (0.053, -0.053):
        prism('bolster', circle_pts(0.007, 0.0102, 24, cx=x), 0.0128, brass, bev=0.001)
    for x in (-0.03, 0.0, 0.03):
        cyl('rivet', 0.0018, 0.0134, brass, loc=(x, 0, -0.0067), segs=12)
    spat = [(-0.058, 0.003), (-0.08, 0.0025), (-0.095, 0.007), (-0.103, 0.008), (-0.106, 0.0), (-0.103, -0.008), (-0.095, -0.007), (-0.08, -0.0025), (-0.058, -0.003)]
    prism('spatula', spat, 0.002, brass, bev=0.0004)
    hawk = [(0, 0.006), (0.03, 0.0075), (0.055, 0.0065), (0.07, 0.002), (0.077, -0.007), (0.071, -0.006), (0.058, -0.002), (0.035, -0.004), (0.012, -0.006), (0, -0.006)]
    prism('hawkbill', hawk, 0.0016, steel, loc=(0.058, 0.0, 0.0035), rot=(0, 0, math.radians(12)), bev=0.0003)
    bud = [(0, 0.004), (0.058, 0.0045), (0.064, 0.0), (0.058, -0.0025), (0, -0.004)]
    prism('budding', bud, 0.0014, steel, loc=(0.056, 0.003, -0.0035), rot=(0, 0, math.radians(38)), bev=0.0003)
