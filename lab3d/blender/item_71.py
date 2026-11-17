"""Item 71 — Fingertip pulse oximeter. Real size 3.3 × 3.2 × 5.8 cm (W × H × L), long axis front-to-back like the
placeholder, finger opening at the front, black OLED window on top. Source: typical + photo."""
import math
from hc_util import *
SNO, WALL = 71, False
def build():
    white = mat('#f1f2f3', 0.38); grey = mat('#4a4f55', 0.6); black = mat('#101214', 0.15); pad = mat('#34383d', 0.85)
    N = 3.6
    # lower jaw (dark underside + white shell), upper jaw
    loft('base', [(-0.0285, 0.0143, 0.002, 0.002, N), (-0.02, 0.0162, 0.0022, 0.0022, N), (0.024, 0.0165, 0.0022, 0.0022, N), (0.029, 0.0135, 0.002, 0.002, N)], grey, 20, axis='Y')
    loft('lower', [(-0.029, 0.0146, 0.0045, 0.0075, N), (-0.02, 0.0164, 0.0052, 0.0078, N), (0.01, 0.0165, 0.0058, 0.0083, N), (0.025, 0.0165, 0.0066, 0.009, N), (0.029, 0.014, 0.006, 0.009, N)], white, 20, axis='Y')
    loft('upper', [(-0.029, 0.0146, 0.0048, 0.0262, N), (-0.022, 0.0163, 0.0062, 0.0255, N), (0.0, 0.0165, 0.0072, 0.0246, N), (0.022, 0.0165, 0.0078, 0.0238, N), (0.0275, 0.0152, 0.007, 0.0236, N), (0.029, 0.0125, 0.0055, 0.0234, N)], white, 20, axis='Y')
    # silicone finger pads between the jaws and the dark finger opening
    loft('pads', [(-0.0278, 0.0128, 0.0052, 0.0165, 3), (0.02, 0.014, 0.0045, 0.0162, 3)], pad, 12, axis='Y')
    loft('hole', [(-0.0283, 0.0092, 0.0027, 0.0166, 2), (-0.0277, 0.0092, 0.0027, 0.0166, 2)], black, 16, axis='Y')
    # hinge bosses on both sides
    cyl('hinge', 0.0058, 0.0336, white, loc=(-0.0168, 0.0165, 0.0162), rot=(0, math.pi / 2, 0), segs=20)
    # display window, readings, power button
    rbox('window', 0.0235, 0.033, 0.0012, black, loc=(0, -0.006, 0.0311), r=0.0006, segs=2)
    text('spo2', '98', 0.0085, mat('#35e0d0', 0.3), loc=(-0.0035, -0.01, 0.0324), rot=(0, 0, 0), depth=0.0001)
    text('pr', '72', 0.0055, mat('#f0c030', 0.3), loc=(0.004, 0.0015, 0.0324), rot=(0, 0, 0), depth=0.0001)
    loft('button', [(0.0312, 0.0052, 0.003, 0.018, 2.5), (0.0322, 0.0048, 0.0026, 0.018, 2.5)], grey, 12, axis='Z')
