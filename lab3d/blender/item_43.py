"""Item 43 — Set of cooking spoons (stainless steel): ladle, slotted spoon, solid spoon, turner and skimmer, 31 cm each,
hanging by S-hooks on a 50 cm rail (the placeholder's arrangement). Real size 54 W x 57 H x 5 D cm.
The rail is carried on two slim uprights so the set keeps the placeholder's height (rail ~0.56 m above the item origin,
utensils clear of the first 0.23 m, which sits inside the counter in the room). Source: typical 5-pc set + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 43, False
ZR, ZTOP, YU = 0.56, 0.535, -0.011      # rail height, utensil top, utensil plane

def handle(x, m, dk):
    secs = [(0.0, 0.006, 0.003), (-0.004, 0.0165, 0.0048), (-0.03, 0.018, 0.005), (-0.09, 0.0135, 0.005), (-0.17, 0.009, 0.0046), (-0.205, 0.0075, 0.004)]
    rr = [[(x + w / 2 * math.cos(2 * math.pi * k / 8), YU + t / 2 * math.sin(2 * math.pi * k / 8), ZTOP + dz) for k in range(8)] for dz, w, t in secs]
    loft('handle', rr, m, sharp=None)
    rbox('eye', 0.0062, 0.0056, 0.022, dk, loc=(x, YU, ZTOP - 0.033), r=0.0027, segs=1)
    # S-hook over the rail and through the eye
    zh = ZTOP - 0.013
    pts = [(x, 0.0075, ZR - 0.006), (x, 0.0078, ZR + 0.001), (x, 0, ZR + 0.0078), (x, -0.0078, ZR + 0.001), (x, -0.0075, ZR - 0.012),
           (x, YU - 0.0075, zh - 0.002), (x, YU - 0.004, zh - 0.0085), (x, YU + 0.004, zh - 0.0085), (x, YU + 0.0075, zh - 0.001)]
    wire('hook', pts, 0.0015, m, segs=5)
    return ZTOP - 0.205

def build():
    st = mat('#d5dadd', 0.26, 0.7); dk = DARK(); br = mat('#c4c9cd', 0.36, 0.65)
    FACE = Matrix(((0, 1, 0, 0), (0, 0, -1, 0), (-1, 0, 0, 0), (0, 0, 0, 1)))   # bowl long axis X -> down, opening -> front (-Y)
    xs = [-0.2, -0.1, 0.0, 0.1, 0.2]
    # 1 ladle
    zn = handle(xs[0], st, dk)
    b = bowl('ladle', 0.041, 0.041, 0.030, st, rings=4, segs=18, power=2.2); b.matrix_basis = TR(xs[0], YU - 0.004, zn - 0.040) @ RX(math.radians(75)) @ b.matrix_basis
    wire('neck', [(xs[0], YU, zn + 0.004), (xs[0], YU + 0.004, zn - 0.006)], 0.0036, st, segs=6)
    # 2 slotted spoon, 3 solid spoon
    for x, slotted in ((xs[1], True), (xs[2], False)):
        zn = handle(x, st, dk)
        b = bowl('spoon', 0.047, 0.031, 0.011, st, rings=3, segs=18, egg=-0.12); b.matrix_basis = TR(x, YU - 0.002, zn - 0.044) @ FACE
        if slotted:
            for dx in (-0.012, 0, 0.012):
                rbox('slot', 0.0042, 0.006, 0.034 if dx == 0 else 0.026, dk, loc=(x + dx, YU + 0.0095 - 0.002 - (0.0016 if dx else 0), zn - 0.062 + (0 if dx == 0 else 0.004)), r=0.002, segs=1)
    # 4 turner: flat blade with three slots, slight forward crank
    zn = handle(xs[3], st, dk)
    out = [(-0.024, zn - 0.004), (-0.03, zn - 0.012), (-0.036, zn - 0.092), (-0.033, zn - 0.096), (0.033, zn - 0.096), (0.036, zn - 0.092), (0.03, zn - 0.012), (0.024, zn - 0.004)]
    prism('turner', [(xs[3] + a, z) for a, z in out], 0.0016, st, plane='XZ', loc=(0, YU, 0), bev=0.0004)
    for dx in (-0.016, 0, 0.016): rbox('tslot', 0.005, 0.0024, 0.045, dk, loc=(xs[3] + dx, YU, zn - 0.078), r=0.0011, segs=1)
    # 5 skimmer: shallow round dish, perforated
    zn = handle(xs[4], st, dk)
    hm = pattern_mat('skim_holes', '#d5dadd', 0.26, 0.7, 'holes', cells=2, fill=0.27)
    b = bowl('skimmer', 0.046, 0.046, 0.008, hm, rings=3, segs=20, uvtile=0.017); b.matrix_basis = TR(xs[4], YU - 0.002, zn - 0.044) @ FACE
    lathe('skim_rim', [(0.0462, 0.0), (0.0472, 0.0008), (0.0462, 0.0016), (0.0452, 0.0008), (0.0462, 0.0)], st, 20, close_bottom=False).matrix_basis = TR(xs[4], YU - 0.002, zn - 0.044) @ FACE
    # rail on two slim uprights with round feet
    cyl('rail', 0.005, 0.52, br, loc=(-0.26, 0, ZR), rot=(0, math.pi / 2, 0), segs=14)
    for sx in (-1, 1):
        sphere('finial', 0.008, st, loc=(sx * 0.262, 0, ZR), segs=10)
        cyl('post', 0.0045, ZR, br, loc=(sx * 0.25, 0, 0), segs=10)
        lathe('foot', [(0, 0), (0.016, 0), (0.016, 0.003), (0.007, 0.007), (0.0045, 0.012)], st, 14).location.x = sx * 0.25
