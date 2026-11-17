"""Item 39 — Plastic dustbin: grey pedal bin, tapered square body, hinged overhanging lid, foot pedal in a front recess.
≈ 27.5 × 37 × 27 cm (≈ 14 L). Source: typical pedal bin / photo."""
import math
from _lib import *
from kst_util import loft
SNO, WALL = 39, False
def build():
    grey = mat('#878c91', 0.48); lidm = mat('#959a9f', 0.46); dark = mat('#4b4f54', 0.6); ped = mat('#a4a9ad', 0.45)
    Hb = 0.315
    hx = lambda z: 0.105 + 0.025 * z / Hb
    hy = lambda z: 0.098 + 0.024 * z / Hb
    loft('body', [(hx(0) - 0.004, hy(0) - 0.004, 0, 0.022), (hx(0.006), hy(0.006), 0.006, 0.026), (hx(0.15), hy(0.15), 0.15, 0.03),
                  (hx(0.295), hy(0.295), 0.295, 0.034), (hx(0.3) + 0.004, hy(0.3) + 0.004, 0.300, 0.036), (hx(Hb) + 0.004, hy(Hb) + 0.004, Hb, 0.036)], grey, 5)
    # lid: overhanging, softly domed, front grip lip
    a, b = hx(Hb) + 0.008, hy(Hb) + 0.008
    loft('lid', [(a, b, Hb - 0.004, 0.04), (a, b, Hb + 0.022, 0.04), (a - 0.004, b - 0.004, Hb + 0.034, 0.04), (a - 0.016, b - 0.016, Hb + 0.045, 0.036),
                 (a - 0.04, b - 0.04, Hb + 0.052, 0.03), (a - 0.075, b - 0.075, Hb + 0.055, 0.02)], lidm, 5)
    rbox('lid_lip', 0.11, 0.012, 0.012, lidm, loc=(0, -b - 0.003, Hb + 0.002), r=0.004)
    rbox('hinge', 0.15, 0.022, 0.05, grey, loc=(0, b + 0.002, Hb - 0.03), r=0.006)
    cyl('hinge_pin', 0.006, 0.156, dark, loc=(-0.078, b + 0.012, Hb + 0.012), rot=(0, math.pi / 2, 0), segs=12)
    # front: raised arched panel, pedal recess, pedal
    tilt = math.atan2(0.024, Hb)
    def front_y(z): return -hy(z)
    arch = [(-0.07, 0.0), (0.07, 0.0), (0.078, 0.10), (0.072, 0.15), (0.05, 0.178), (0, 0.188), (-0.05, 0.178), (-0.072, 0.15), (-0.078, 0.10)]
    prism('panel', arch, 0.006, grey, 'XZ', loc=(0, front_y(0.075) - 0.0005, 0.075), rot=(tilt, 0, 0), bev=0.0015)
    rbox('recess', 0.105, 0.012, 0.055, dark, loc=(0, front_y(0.03) + 0.003, 0.004), rot=(tilt, 0, 0), r=0.004)
    rbox('pedal', 0.085, 0.05, 0.011, ped, loc=(0, front_y(0.02) - 0.02, 0.012), rot=(math.radians(-8), 0, 0), r=0.004)
    for i in range(4):
        rbox('rib', 0.07, 0.0035, 0.002, grey, loc=(0, front_y(0.02) - 0.038 + i * 0.011, 0.0245 - i * 0.0015), rot=(math.radians(-8), 0, 0), r=0)
    for sx in (-1, 1):
        rbox('grip', 0.004, 0.09, 0.02, grey, loc=(sx * (hx(0.27) + 0.003), 0, 0.262), r=0.0015)
