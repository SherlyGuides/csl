"""Item 80 — Financial literacy board game, laid open on the table: 50 × 50 cm folding board (4 mm greyboard, navy edge) printed with
a looping money / budget track, four goal corners (home, savings, investing, shopping) and a central bank; two decks of colour-coded
cards, four pawns, two dice and play coins sit on the board, so the footprint stays the board's 50 × 50 cm.
Real size 50 × 3.6 × 50 cm (W × H × D). Board art is an embedded texture. Source: placeholder size + catalogue photo."""
import math
from _lib import *
from itb_tex import Canvas, texmat, flat_quad, COIN_MATS, coin_stack
SNO, WALL = 80, False
N = 1024
NAVY, PALE = '#1f3a5f', '#eef1ea'
TILE = ['#3f7fd1', '#f2c230', '#4aa564', '#ef8a3c', '#d9534f', '#8e6bbf']
P = lambda f: f * N

def board_art():
    c = Canvas(N, N, NAVY)
    c.rect(P(.022), P(.022), P(.978), P(.978), PALE, r=P(.012))
    # soft city / park backdrop
    for x, y, w, h in [(.30, .10, .035, .07), (.34, .12, .03, .05), (.62, .09, .04, .08), (.67, .12, .03, .05), (.07, .40, .035, .08), (.11, .44, .03, .05),
                       (.89, .52, .035, .08), (.85, .56, .03, .05), (.30, .86, .04, .06), (.36, .84, .03, .08), (.62, .85, .04, .07), (.07, .60, .03, .06), (.90, .36, .03, .07)]:
        c.rect(P(x), P(y), P(x + w), P(y + h), '#c9d8e6', r=3)
    for x, y in [(.26, .15), (.74, .15), (.06, .33), (.94, .45), (.06, .69), (.94, .66), (.26, .88), (.74, .88), (.45, .06), (.55, .945), (.42, .945), (.57, .06)]:
        c.circle(P(x), P(y), P(.017), '#a9d0ad'); c.rect(P(x) - 2, P(y + .012), P(x) + 2, P(y + .03), '#9b8466')
    # goal corners
    R = P(.118)
    def corner(cx, cy, col):
        c.circle(P(cx), P(cy), R + 7, '#ffffff'); c.circle(P(cx), P(cy), R, col); c.ring(P(cx), P(cy), R - 14, R - 10, '#ffffff', alpha=0.55)
    corner(.16, .16, '#f2c94c')                                              # home
    c.rect(P(.118), P(.158), P(.202), P(.215), '#fff6dc'); c.tri((P(.102), P(.160)), (P(.218), P(.160)), (P(.16), P(.098)), '#d9534f')
    c.rect(P(.150), P(.180), P(.172), P(.215), '#8a5a3c'); c.rect(P(.128), P(.170), P(.144), P(.186), '#7fb6e6'); c.rect(P(.178), P(.170), P(.194), P(.186), '#7fb6e6')
    corner(.84, .16, '#58a55c')                                              # savings: piggy bank
    c.circle(P(.84), P(.175), P(.05), '#f6a9bb', sy=0.78); c.circle(P(.885), P(.170), P(.016), '#ee8fa6'); c.tri((P(.80), P(.138)), (P(.822), P(.146)), (P(.806), P(.160)), '#ee8fa6')
    c.rect(P(.812), P(.205), P(.826), P(.228), '#ee8fa6'); c.rect(P(.856), P(.205), P(.870), P(.228), '#ee8fa6'); c.circle(P(.866), P(.160), P(.005), '#3a2a30')
    c.rect(P(.826), P(.134), P(.856), P(.140), '#c9788c'); c.circle(P(.842), P(.105), P(.017), '#f2c230'); c.circle(P(.842), P(.105), P(.010), '#f8de7a')
    corner(.16, .84, '#4f8fd0')                                              # investing: rising bars
    for k, hgt in enumerate((.03, .05, .072, .098)): c.rect(P(.105 + k * .029), P(.895 - hgt), P(.127 + k * .029), P(.895), '#ffffff')
    c.rect(P(.098), P(.895), P(.225), P(.901), '#1f3a5f'); c.tri((P(.215), P(.772)), (P(.225), P(.800)), (P(.196), P(.790)), '#f2c230')
    corner(.84, .84, '#e9705a')                                              # shopping: cart
    c.rect(P(.800), P(.812), P(.890), P(.858), '#ffffff', r=4)
    for k in range(1, 4): c.rect(P(.800 + k * .0225) - 1.5, P(.812), P(.800 + k * .0225) + 1.5, P(.858), '#e9705a')
    c.rect(P(.800), P(.834), P(.890), P(.837), '#e9705a'); c.rect(P(.780), P(.800), P(.806), P(.806), '#ffffff'); c.rect(P(.810), P(.862), P(.884), P(.868), '#ffffff')
    c.circle(P(.818), P(.884), P(.011), '#ffffff'); c.circle(P(.876), P(.884), P(.011), '#ffffff')
    # looping track: 24 spaces
    cx = cy = P(.5); r0, r1 = P(.325), P(.412)
    c.ring(cx, cy, r0 - 6, r1 + 6, '#ffffff')
    for k in range(24):
        a0 = k * 15 + 0.9; special = k % 6 == 3
        c.ring(cx, cy, r0, r1, NAVY if special else TILE[k % 6], a0, a0 + 13.2)
        am = math.radians(k * 15 + 7.5); rm = (r0 + r1) / 2; px, py = cx + rm * math.cos(am), cy - rm * math.sin(am)
        if special: c.rect(px - 15, py - 15, px + 15, py + 15, '#ffffff', r=5); c.circle(px, py, 8, TILE[(k // 6) % 6])
        else: c.circle(px, py, 9, '#ffffff', alpha=0.55)
    # START arrow space (front) and spokes from the track to the bank
    for sgn, cols in ((1, ['#4aa564', '#f2c230', '#4aa564']), (-1, ['#d9534f', '#ef8a3c', '#d9534f'])):
        for k, col in enumerate(cols):
            ya = .5 + sgn * (.135 + k * .064); c.rect(P(.462), P(min(ya, ya + sgn * .058)), P(.538), P(max(ya, ya + sgn * .058)), '#ffffff')
            c.rect(P(.467), P(min(ya, ya + sgn * .058)) + 4, P(.533), P(max(ya, ya + sgn * .058)) - 4, col, r=6)
    # card-deck bays
    for bx, col in ((.29, '#3f7fd1'), (.71, '#4aa564')):
        c.rect(P(bx - .075), P(.5 - .1), P(bx + .075), P(.5 + .1), col, r=12); c.rect(P(bx - .068), P(.5 - .093), P(bx + .068), P(.5 + .093), '#dfe7dd', r=9)
    # central bank
    c.circle(cx, cy, P(.128), '#ffffff'); c.circle(cx, cy, P(.118), '#d7e6f5'); c.ring(cx, cy, P(.100), P(.105), '#8fb4dc')
    c.tri((P(.432), P(.468)), (P(.568), P(.468)), (P(.5), P(.420)), NAVY); c.rect(P(.440), P(.470), P(.560), P(.482), NAVY)
    for k in range(4): c.rect(P(.449 + k * .0285), P(.486), P(.466 + k * .0285), P(.545), NAVY)
    c.rect(P(.438), P(.548), P(.562), P(.560), NAVY); c.rect(P(.428), P(.562), P(.572), P(.572), NAVY)
    # fold
    c.rect(P(.5) - 1, P(.022), P(.5) + 1, P(.978), '#9aa3a0', alpha=0.6)
    return c

def pawn(name, x, y, z, col):
    m = mat(col, 0.35)
    ob = lathe(name, [(0, 0), (0.0105, 0), (0.0112, 0.0015), (0.0105, 0.004), (0.0062, 0.0085), (0.0042, 0.016), (0.0050, 0.0185), (0.0036, 0.0205),
                      (0.0058, 0.0225), (0.0070, 0.026), (0.0058, 0.0295), (0.003, 0.0315), (0, 0.032)], m, 16)
    ob.location = (x, y, z)

def die(name, x, y, z, rz, top, front, side):
    S = 0.016; white = mat('#f7f6f1', 0.3); pip = mat('#1c1d20', 0.4)
    rbox(name, S, S, S, white, loc=(x, y, z), rot=(0, 0, rz), r=0.0022, segs=2)
    lay = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)], 4: [(-1, -1), (-1, 1), (1, -1), (1, 1)],
           5: [(-1, -1), (-1, 1), (1, -1), (1, 1), (0, 0)], 6: [(-1, -1), (-1, 0), (-1, 1), (1, -1), (1, 0), (1, 1)]}
    cs, sn = math.cos(rz), math.sin(rz); g = 0.0042; h = S / 2
    def W(lx, ly, lz): return (x + lx * cs - ly * sn, y + lx * sn + ly * cs, z + h + lz)
    for u, v in lay[top]: cyl(name + 'p', 0.0015, 0.0003, pip, loc=W(u * g, v * g, h - 0.0001), segs=8)
    for u, v in lay[front]: cyl(name + 'p', 0.0015, 0.0003, pip, loc=W(u * g, -h + 0.0001, v * g), rot=(math.pi / 2, 0, rz), segs=8)
    for u, v in lay[side]: cyl(name + 'p', 0.0015, 0.0003, pip, loc=W(h - 0.0001, u * g, v * g), rot=(0, math.pi / 2, rz), segs=8)

def build():
    c = board_art(); img = c.image('board_art'); tex = texmat('board_print', img, 0.55, (0.8, 0.82, 0.78))
    navy = mat(NAVY, 0.6); T = 0.004
    for s in (-1, 1): rbox('board', 0.2496, 0.5, T, navy, loc=(s * 0.1250, 0, 0), r=0.0008, segs=1)      # two hinged halves
    flat_quad('board_face', 0, 0, T + 0.0002, 0.4985, 0.4985, 0, c.uv(0, 0, N, N), tex)
    z = T + 0.0002
    # card decks in their bays: three colour-coded stacks each side (chance / invest / home ... as in the photo)
    white = mat('#fbfbf7', 0.5)
    for bx, cols in ((-0.105, ['#3f7fd1', '#4aa564', '#f2c230']), (0.105, ['#d9534f', '#8e6bbf', '#58b7c4'])):
        for k, col in enumerate(cols):
            m = mat(col, 0.45); y = 0.061 - k * 0.061; rz = (k - 1) * 0.05 * (1 if bx < 0 else -1); hgt = 0.010 - k * 0.002
            rbox('deck', 0.058, 0.052, hgt, m, loc=(bx, y, z), rot=(0, 0, rz), r=0.003, segs=2)
            rbox('deck_icon', 0.026, 0.022, 0.0004, white, loc=(bx, y, z + hgt), rot=(0, 0, rz), r=0.002, segs=1)
            cyl('deck_dot', 0.006, 0.0003, m, loc=(bx, y, z + hgt + 0.0004), segs=12)
    # pawns on track spaces (front arc), dice, play coins
    rm = 0.5 * (0.325 + 0.412) / 2
    for k, col in zip((15, 16, 19, 20), ('#2f6fd0', '#2e9e4a', '#f2c230', '#d6342f')):
        a = math.radians(k * 15 + 7.5); pawn(f'pawn{k}', rm * math.cos(a), rm * math.sin(a), z, col)
    die('die_a', 0.012, -0.118, z, 0.35, 5, 4, 6); die('die_b', 0.040, -0.128, z, -0.5, 3, 2, 1)
    gold, silver, copper = COIN_MATS()
    coin_stack('coins_g', -0.030, 0.112, z, 0.0125, 4, gold, seed=2); coin_stack('coins_s', 0.000, 0.120, z, 0.0125, 3, silver, seed=3)
    cyl('coin1', 0.0125, 0.002, copper, loc=(0.028, 0.110, z), segs=16); cyl('coin2', 0.0125, 0.002, gold, loc=(-0.012, 0.096, z), segs=16)
