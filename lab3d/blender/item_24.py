"""Item 24 — Digital kitchen balance, ISI, 1 kg: white body with grey control panel + LCD, removable steel bowl.
Body 17 × 4.4 × 21 cm, bowl Ø 21 × 5.2 cm; overall ≈ 21 × 10.4 × 22 cm. Source: typical 1 kg bowl scale / photo."""
import math
from _lib import *
from kst_util import loft
SNO, WALL = 24, False
def build():
    white = mat('#f1f2f3', 0.42); grey = mat('#6d7379', 0.5); dgrey = mat('#3c4146', 0.6)
    lcd = mat('#8f9a8c', 0.25); digit = mat('#1c211d', 0.5); st = mat('#d3d8dc', 0.28, 0.7); stin = mat('#c0c5c9', 0.4, 0.66)
    hx, hy = 0.085, 0.105
    loft('foot', [(hx - 0.006, hy - 0.006, 0, 0.02), (hx - 0.003, hy - 0.003, 0.008, 0.022)], dgrey, 4, cap_top=False)
    loft('body', [(hx - 0.003, hy - 0.003, 0.008, 0.022), (hx, hy, 0.012, 0.024), (hx, hy, 0.036, 0.024), (hx - 0.002, hy - 0.002, 0.041, 0.023),
                  (hx - 0.007, hy - 0.007, 0.044, 0.02)], white, 4, cap_bottom=False)
    for sx in (-1, 1):
        for sy in (-1, 1): cyl('pad', 0.008, 0.002, RUBBER(), loc=(sx * 0.06, sy * 0.08, -0.002), segs=12)
    # control panel on the front face
    yf = -hy
    rbox('panel', 0.118, 0.003, 0.022, grey, loc=(0, yf - 0.0005, 0.013), r=0.0012, segs=1)
    rbox('lcd', 0.058, 0.002, 0.016, lcd, loc=(0, yf - 0.0025, 0.016), r=0.0006, segs=1)
    text('digits', '250 g', 0.011, digit, loc=(0.002, yf - 0.0036, 0.024), depth=0.0002).data.resolution_u = 2
    for sx in (-1, 1):
        cyl('btn', 0.0065, 0.002, white, loc=(sx * 0.045, yf - 0.002, 0.024), rot=(math.pi / 2, 0, 0), segs=16)
    text('isi', 'ISI  1 kg', 0.0065, grey, loc=(0, -0.088, 0.0442), rot=(0, 0, 0), depth=0.0003).data.resolution_u = 1
    # weighing platform + bowl
    cyl('platform', 0.060, 0.006, st, loc=(0, 0.004, 0.044), segs=28)
    z0, R, H = 0.050, 0.105, 0.052
    out = [(0, 0), (0.058, 0), (0.064, 0.002)]
    for i in range(1, 8):
        a = math.pi / 2 * i / 7
        out.append((0.064 + (R - 0.011 - 0.064) * math.sin(a) ** 0.8, 0.002 + (H - 0.006) * (1 - math.cos(a)) ** 0.85))
    out += [(R - 0.002, H - 0.0015), (R, H - 0.0005), (R, H + 0.0008), (R - 0.0025, H + 0.0012), (R - 0.011, H - 0.002)]
    inn = [(r - 0.0012, z + 0.0012) for r, z in reversed(out[3:10])]
    b = lathe('bowl', out + inn[:3], st, 32); b.location = (0, 0.004, z0)
    b2 = lathe('bowl_in', inn[2:] + [(0.058, 0.0014), (0, 0.0014)], stin, 32, close_bottom=False); b2.location = (0, 0.004, z0)
