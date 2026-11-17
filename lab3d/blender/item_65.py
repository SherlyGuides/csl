"""Item 65 — Glucometer kit: meter 5.5 × 9.5 × 1.8 cm lying flat (screen up), test-strip vial Ø3.2 × 5.7 cm, lancing device
10.5 cm, three strips and two lancets. Group ≈ 12 × 5.7 × 11 cm. Source: typical kit + photo."""
import math
from hc_util import *
SNO, WALL = 65, False
def build():
    white = mat('#f2f3f4', 0.4); navy = mat('#1f3558', 0.35); navy2 = mat('#2c4a7c', 0.4); lcd = mat('#9aa49f', 0.25)
    ink = mat('#1b211f', 0.4); grey = mat('#8d949b', 0.5); blue = mat('#4b8fe0', 0.45)
    # meter
    with grp(loc=(0.012, 0, 0)):
        loft('meter', [(0, 0.0235, 0.0435, 0, 3), (0.0025, 0.027, 0.047, 0, 3), (0.0135, 0.0275, 0.0475, 0, 3), (0.0168, 0.0262, 0.0462, 0, 3)], white, 32, axis='Z')
        loft('face', [(0.0166, 0.0232, 0.0432, 0, 3), (0.0176, 0.0228, 0.0428, 0, 3)], navy, 32, axis='Z')
        rbox('lcd', 0.034, 0.033, 0.0006, lcd, loc=(0, 0.011, 0.0174), r=0.0003, segs=1)
        text('reading', '5.6', 0.014, ink, loc=(0, 0.011, 0.0181), rot=(0, 0, 0), depth=0.0001)
        loft('button', [(0.0175, 0.0085, 0.0048, -0.027, 2.6), (0.0186, 0.008, 0.0043, -0.027, 2.6)], navy2, 16, axis='Z')
        box('port', 0.009, 0.002, 0.0022, ink, loc=(0, 0.0468, 0.0075))
    # strip vial with flip cap
    with grp(loc=(-0.042, 0.022, 0)):
        lathe('vial', [(0, 0), (0.0135, 0), (0.0145, 0.0012), (0.0145, 0.044), (0, 0.044)], white, 24)
        lathe('vcap', [(0.016, 0.043), (0.016, 0.055), (0.0148, 0.057), (0, 0.057)], white, 24)
        box('vtab', 0.008, 0.004, 0.003, white, loc=(0, -0.017, 0.043))
    # lancing device lying beside the meter
    with grp(loc=(0.05, -0.05, 0.0082), rot=(0, 0, math.radians(84))):
        c = lambda t, r: (t, r, r)
        loft('l_tip', [c(0, 0.0045), c(0.001, 0.006), c(0.018, 0.0078), c(0.02, 0.0078)], grey, 16)
        loft('l_body', [c(0.02, 0.0082), c(0.06, 0.0082), c(0.082, 0.0076), c(0.086, 0.0074)], white, 16)
        loft('l_end', [c(0.086, 0.0068), c(0.1, 0.0066), c(0.104, 0.0058), c(0.105, 0.004)], grey, 16)
        rbox('l_slide', 0.02, 0.007, 0.0022, blue, loc=(0.05, 0, 0.0072), r=0.001, segs=1)
    # test strips fanned in front of the vial
    for i, a in enumerate((-18, -4, 10)):
        with grp(loc=(-0.05 + i * 0.008, -0.03, 0), rot=(0, 0, math.radians(a))):
            box('strip', 0.0055, 0.032, 0.0006, white)
            box('s_blue', 0.0055, 0.006, 0.0007, blue, loc=(0, 0.01, 0))
            box('s_cont', 0.0045, 0.005, 0.0007, ink, loc=(0, -0.0135, 0))
    for i in range(2):
        with grp(loc=(-0.026 + i * 0.011, -0.05, 0.003), rot=(0, 0, math.radians(100 + i * 25))):
            loft('lancet', [(0, 0.003, 0.003), (0.016, 0.0028, 0.0028)], blue, 8)
            cyl('lancet_cap', 0.0042, 0.003, blue, loc=(0.016, 0, 0), rot=(0, math.pi / 2, 0), segs=10)
