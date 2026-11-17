"""Item 64 — Disposable gloves, box of 100. Real box 24 × 7 × 12 cm (standard nitrile dispenser carton), lid flipped open
(overall 19.5 cm high, 25.5 cm across the open end flaps), blue gloves heaped inside. Source: typical carton + photo."""
import math
from hc_util import *
SNO, WALL = 64, False
def glove(m):
    loft('palm', [(0, 0.03, 0.0022, 0.0022, 3), (0.004, 0.036, 0.0025, 0.0025, 3), (0.085, 0.04, 0.0025, 0.0025, 3), (0.1, 0.037, 0.0022, 0.0022, 3)], m, 8)
    for k, (y, ln) in enumerate([(-0.029, 0.058), (-0.0095, 0.07), (0.0095, 0.066), (0.029, 0.05)]):
        with grp(loc=(0.097, y, 0), rot=(0, 0, math.radians((y / 0.029) * 7))):
            loft('finger', [(0, 0.0085, 0.0022, 0.0022, 2.5), (ln * 0.8, 0.008, 0.0022, 0.0022, 2.5), (ln, 0.004, 0.0015, 0.0022, 2)], m, 8)
    with grp(loc=(0.05, 0.036, 0), rot=(0, 0, math.radians(38))):
        loft('thumb', [(0, 0.0095, 0.0022, 0.0022, 2.5), (0.045, 0.0085, 0.0022, 0.0022, 2.5), (0.055, 0.004, 0.0015, 0.0022, 2)], m, 8)
def build():
    card = mat('#f1f1ee', 0.7); inner = mat('#e2e1dc', 0.8); blue = mat('#3f93e6', 0.45); blue2 = mat('#3585d6', 0.5)
    W, D, H, t = 0.24, 0.12, 0.07, 0.0015
    box('bottom', W, D, t, card)
    box('front', W, t, H, card, loc=(0, -D / 2 + t / 2, 0)); box('back', W, t, H, card, loc=(0, D / 2 - t / 2, 0))
    box('left', t, D, H, card, loc=(-W / 2 + t / 2, 0, 0)); box('right', t, D, H, card, loc=(W / 2 - t / 2, 0, 0))
    # open lid hinged on the back edge, leaning back; tuck flap folded forward
    a = math.radians(12)
    with grp(loc=(0, D / 2 - t / 2, H), rot=(-a, 0, 0)):
        box('lid', W, t, D - 0.002, card)
        box('tuck', W - 0.012, 0.024, t, card, loc=(0, -0.012, D - 0.002), rot=(math.radians(-18), 0, 0))
    for s in (-1, 1):
        with grp(loc=(s * (W / 2 - t / 2), 0, H), rot=(0, s * math.radians(12), 0)):
            box('dust', t, D - 0.012, 0.032, inner)
    # heap of gloves
    def heap(u, v):
        x = (-W / 2 + 0.004) + (W - 0.008) * u; y = (-D / 2 + 0.004) + (D - 0.008) * v
        return (x, y, 0.058 + 0.0045 * math.sin(x * 70 + 1) * math.cos(y * 95) + 0.003 * math.sin(x * 160 + y * 120) - 0.006 * ((2 * v - 1) ** 4 + (2 * u - 1) ** 6))
    surface('heap', heap, 20, 8, blue2)
    with grp(loc=(-0.095, -0.012, 0.0625), rot=(0, math.radians(-2), math.radians(12))): glove(blue)
    with grp(loc=(0.1, 0.018, 0.0655), rot=(0, math.radians(2), math.radians(196))): glove(blue)
    text('qty', '100 PCS', 0.013, mat('#2f7fd6', 0.5), loc=(0.07, -D / 2 - 0.0002, 0.016), depth=0.0002)
    box('band', W * 0.999, 0.0004, 0.006, mat('#3f93e6', 0.5), loc=(0, -D / 2 - 0.0001, 0.003))
