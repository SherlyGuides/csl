"""Item 82 — Case study workbooks: a loose stack of four printed A4 workbooks (21 × 29.7 cm, 8 mm each, soft cover).
Real size of the stack ≈ 25 × 3.3 × 32 cm (W × H × D). Cover art as in the catalogue photo (navy / teal / yellow circles, title rules),
drawn as an embedded 512 px texture. Source: A4 + catalogue photo."""
import math
from _lib import *
from itb_tex import Canvas, texmat, flat_quad
SNO, WALL = 82, False
NAVY, TEAL, YEL, WHITE = '#1f3560', '#2a8f96', '#f2bd3a', '#f6f5f0'

def cover():
    c = Canvas(512, 724, NAVY)
    c.circle(512 * 0.98, 724 * 0.02, 512 * 0.92, WHITE)          # big white field, top right
    c.circle(512 * 0.86, 724 * 0.62, 512 * 0.50, TEAL)           # teal disc, right
    c.circle(512 * 0.30, 724 * 0.86, 512 * 0.36, YEL)            # yellow disc, bottom left
    c.ring(512 * 0.86, 724 * 0.62, 512 * 0.50, 512 * 0.505, '#bfe0e0')
    c.lines(250, 66, 470, 4, 18, 3, '#9fb5b8')                   # title / name rules
    c.rect(250, 150, 330, 162, TEAL, r=3)
    c.rect(0, 0, 14, 724, '#182a4d')                             # spine shadow
    return c

def build():
    c = cover(); img = c.image('workbook_cover'); tex = texmat('cover', img, 0.55, c.avg)
    navy = mat(NAVY, 0.55); paper = mat('#f1efe8', 0.8)
    W, D, T = 0.210, 0.297, 0.008
    z = 0.0
    for i, (rz, dx, dy) in enumerate([(0.0, 0, 0), (0.07, 0.006, -0.004), (-0.05, -0.004, 0.005), (0.16, 0.008, -0.006)]):
        cs, sn = math.cos(rz), math.sin(rz)
        def P(x, y): return (dx + x * cs - y * sn, dy + x * sn + y * cs)
        rbox(f'back{i}', W, D, 0.0005, navy, loc=(dx, dy, z), rot=(0, 0, rz), r=0)
        x, y = P(0.0012, 0); rbox(f'pages{i}', W - 0.0045, D - 0.004, T - 0.001, paper, loc=(x, y, z + 0.0005), rot=(0, 0, rz), r=0)
        x, y = P(-W / 2 + 0.0008, 0); rbox(f'spine{i}', 0.0016, D, T, navy, loc=(x, y, z), rot=(0, 0, rz), r=0)
        rbox(f'front{i}', W, D, 0.0005, navy, loc=(dx, dy, z + T - 0.0005), rot=(0, 0, rz), r=0)
        flat_quad(f'art{i}', dx, dy, z + T + 0.0002, W, D, rz, c.uv(0, 0, 512, 724), tex)
        z += T + 0.0003
