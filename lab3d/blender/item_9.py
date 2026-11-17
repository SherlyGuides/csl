"""Item 9 — Hydroponic tray, HDPE, 2 x 1 ft x 4 in (spec) = 61 x 30.5 x 10.2 cm. Black, tapered walls, flanged rim,
vertical stiffening ribs outside and inside, floor ridges, drainage holes; 8 seedling plugs as in the room.
Source: spec + catalogue photo."""
import math
from _lib import *
from agri_util import *
from plants import rosette
SNO, WALL = 9, False

def build():
    blk = mat('#2b2d30', 0.5)
    hole = mat('#060606', 0.9)
    H = 0.1016
    rr_loft('tray', [(0.287, 0.1345, 0.022, 0.0), (0.298, 0.1455, 0.022, H - 0.008), (0.305, 0.1525, 0.012, H - 0.008),
                     (0.305, 0.1525, 0.012, H), (0.2945, 0.1420, 0.020, H), (0.284, 0.1315, 0.020, 0.005)], blk, cseg=5)
    t = 0.003; zt = H - 0.008
    # outside gussets under the flange
    for x in (-0.21, -0.07, 0.07, 0.21):
        for sy in (-1, 1):
            hull('rib', [(x + dx, sy * y, z) for dx in (-t, t) for y, z in ((0.133, 0.004), (0.1375, 0.004), (0.1505, zt), (0.144, zt))], blk)
            hull('irib', [(x + dx, sy * y, z) for dx in (-t, t) for y, z in ((0.133, 0.005), (0.129, 0.005), (0.1395, H - 0.004), (0.143, H - 0.004))], blk)
    for y in (-0.06, 0.06):
        for sx in (-1, 1):
            hull('rib', [(sx * x, y + dy, z) for dy in (-t, t) for x, z in ((0.2855, 0.004), (0.290, 0.004), (0.303, zt), (0.2965, zt))], blk)
            hull('irib', [(sx * x, y + dy, z) for dy in (-t, t) for x, z in ((0.2855, 0.005), (0.2815, 0.005), (0.292, H - 0.004), (0.2955, H - 0.004))], blk)
    # floor ridges and drainage holes
    for y in (-0.045, 0.045):
        rbox('ridge', 0.50, 0.006, 0.003, blk, loc=(0, y, 0.0045), r=0.001, segs=1)
    for x in (-0.24, 0, 0.24):
        for y in (-0.1, 0.1):
            cyl('hole', 0.006, 0.0006, hole, loc=(x, y, 0.005), segs=10)
    # seedling plugs (coco/rockwool cubes) with young seedlings
    plug = mat('#7a5a3a', 0.95)
    k = 0
    for i in range(4):
        for j in range(2):
            x, y = -0.2175 + i * 0.145, -0.07 + j * 0.14
            rbox('plug', 0.04, 0.04, 0.036, plug, loc=(x, y, 0.005), r=0.004, segs=1)
            rosette('seedling', loc=(x, y, 0.039), radius=0.04 + 0.006 * ((i + j) % 3), n=5, height=0.035, seed=90 + k, nu=4, nv=2); k += 1
