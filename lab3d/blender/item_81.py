"""Item 81 — Basic calculator (student desktop calculator). Real size 9.5 × 2.0 × 12.0 cm (W × H × D), lying flat on the table,
display end raised on its battery hump as in the catalogue photo. Source: typical 8-digit student calculator + photo."""
import math
from _lib import *
from itb_tex import rotate_all
SNO, WALL = 81, False

def rrect(w, d, r, n=4):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def build():
    body = mat('#2b2d30', 0.5)                      # charcoal ABS
    face = mat('#35383c', 0.42)
    black = mat('#141517', 0.45)                    # number keys
    grey = mat('#80858b', 0.45)                     # operator keys
    lcd = mat('#a7b09f', 0.22)                      # reflective grey-green LCD
    ink = mat('#2b302b', 0.5)
    white = mat('#f1f1ee', 0.5)
    T = 0.011
    prism('body', rrect(0.095, 0.120, 0.007), T, body, plane='XY', centred=False, bev=0.0015)
    prism('faceplate', rrect(0.089, 0.114, 0.005), 0.0008, face, plane='XY', centred=False, bev=0.0003, loc=(0, 0, T - 0.0002))
    rbox('hump', 0.084, 0.022, 0.0062, body, loc=(0, 0.045, -0.006), r=0.003)          # battery hump: tilts the display toward the user
    for x in (-0.036, 0.036): rbox('pad', 0.008, 0.004, 0.0008, RUBBER(), loc=(x, -0.052, -0.0006), r=0.0003)
    # display: glossy bezel + LCD with a resting "0."
    zt = T + 0.0006
    rbox('bezel', 0.081, 0.031, 0.0014, mat('#0f1012', 0.2), loc=(0, 0.0375, zt), r=0.0012)
    rbox('lcd', 0.070, 0.021, 0.0004, lcd, loc=(0, 0.0375, zt + 0.0013), r=0)
    text('digit', '0.', 0.015, ink, loc=(0.031, 0.0375, zt + 0.0017), rot=(0, 0, 0), depth=0.00005, align='RIGHT').data.resolution_u = 2
    # 4 × 4 keypad
    rows = ['789÷', '456×', '123−', '0.=+']
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            x, y = -0.0315 + i * 0.021, 0.0075 - j * 0.0172
            rbox(f'key_{j}{i}', 0.0172, 0.0128, 0.0030, grey if i == 3 else black, loc=(x, y, zt - 0.0002), r=0.0012, segs=1)
            text(f'leg_{j}{i}', '•' if ch == '.' else ch, 0.0082, white, loc=(x, y, zt + 0.0028), rot=(0, 0, 0), depth=0.00005).data.resolution_u = 2
    rotate_all(math.atan2(0.006, 0.116))
