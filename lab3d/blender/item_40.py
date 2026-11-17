"""Item 40 — Polpat and latan (chakla-belan): round wooden rolling board Ø 25 cm on three short feet (5 cm high) with a
33 cm rolling pin resting on it. ≈ 33 × 8.5 × 25 cm. Source: typical / photo."""
import math
from _lib import *
SNO, WALL = 40, False
def build():
    wood = mat('#b9773a', 0.55); dark = mat('#8a5527', 0.6); pinw = mat('#c08548', 0.5)
    R = 0.125
    board = [(0, 0.026), (R - 0.012, 0.026), (R - 0.004, 0.029), (R, 0.036), (R, 0.044), (R - 0.003, 0.048), (R - 0.008, 0.050), (0, 0.050)]
    lathe('board', board, wood, 56)
    for r in (0.045, 0.085):                     # turned grain rings on the top face
        lathe('ring', [(r, 0.0502), (r + 0.0012, 0.0502)], dark, 56, close_bottom=False)
    for k in range(3):                           # squat bun feet
        a = math.radians(90 + 120 * k)
        ob = lathe('foot', [(0, 0), (0.012, 0), (0.016, 0.004), (0.017, 0.012), (0.013, 0.019), (0.016, 0.024), (0.016, 0.027), (0, 0.027)], dark, 20)
        ob.location = (0.088 * math.cos(a), 0.088 * math.sin(a), 0)
    # belan: turned pin with grip necks and ball ends
    L = 0.165
    p = [(0, -L), (0.007, -L + 0.001), (0.0105, -L + 0.007), (0.0095, -L + 0.016), (0.0078, -L + 0.026), (0.0082, -L + 0.050), (0.0098, -L + 0.058),
         (0.0135, -L + 0.064), (0.0160, -0.060), (0.0175, 0.0)]
    prof = p + [(r, -z) for r, z in reversed(p[:-1])]
    pin = lathe('belan', prof, pinw, 24)
    for zz in (-L + 0.061, L - 0.061):
        lathe('pin_groove', [(0.0128, zz - 0.0008), (0.0131, zz + 0.0008)], dark, 24, close_bottom=False).parent = pin
    pin.rotation_euler = (0, math.pi / 2, 0.4); pin.location = (0, 0, 0.050 + 0.0175)
