"""Item 79 — Financial literacy simulation kit: storage tray (27 × 19 × 4.5 cm) with bundles of mock currency and coin stacks,
plus the contents laid out beside it as in the catalogue photo: three fanned note bundles (14.6 × 6.6 cm notes), coin stacks and
loose coins, an open cheque book (20 × 9 cm leaves, navy cover) and a fan of four A5 sample bank / loan forms with a pay-in slip.
Real size of the layout ≈ 50 × 8 × 40 cm (W × H × D). Printed faces are one embedded atlas texture. Source: spec + catalogue photo."""
import math
from _lib import *
from itb_tex import Canvas, texmat, quad, flat_quad, sheet, draw_note, NOTE_COLS, COIN_MATS, coin_stack
SNO, WALL = 79, False
NW, NH = 320, 144                                        # note cell in the atlas
FORM_COLS = ['#3f7fd1', '#e2607f', '#2a9d8f', '#8463c9']

def note_rect(i): x, y = 10 + (i % 3) * 330, 10 + (i // 3) * 154; return (x, y, x + NW, y + NH)
CHEQUE = (10, 330, 490, 530); SLIP = (500, 330, 920, 530)
def form_rect(i): return (10 + i * 250, 545, 10 + i * 250 + 240, 885)
LABEL = (10, 900, 1014, 1014)

def atlas():
    c = Canvas(1024, 1024, '#ffffff')
    for i, (base, dark, light) in enumerate(NOTE_COLS):
        x0, y0, x1, y1 = note_rect(i); draw_note(c, x0, y0, NW, NH, base, dark, light)
    # cheque leaf
    x0, y0, x1, y1 = CHEQUE; c.rect(x0, y0, x1, y1, '#dbe8f6'); c.circle(x0 + 110, y0 + 105, 62, '#c5d9f0'); c.circle(x0 + 110, y0 + 105, 40, '#dbe8f6')
    c.rect(x0, y0, x1, y0 + 34, '#3d6fb3'); c.rect(x0 + 14, y0 + 10, x0 + 150, y0 + 24, '#e8f0fa', r=3)
    c.lines(x0 + 60, y0 + 70, x1 - 150, 3, 30, 3, '#6f8fb5', short_last=False); c.frame(x1 - 130, y0 + 64, x1 - 16, y0 + 104, 3, '#3d6fb3')
    c.rect(x1 - 150, y0 + 138, x1 - 20, y0 + 141, '#6f8fb5'); c.rect(x0, y1 - 30, x1, y1, '#f4f7fb')
    for k in range(26): c.rect(x0 + 60 + k * 14, y1 - 21, x0 + 68 + k * 14, y1 - 9, '#2c3e58')
    # pay-in slip
    x0, y0, x1, y1 = SLIP; c.rect(x0, y0, x1, y1, '#f8cfa4'); c.rect(x0, y0, x1, y0 + 40, '#ee9550'); c.circle(x0 + 28, y0 + 20, 12, '#fbe3cb')
    c.rect(x0 + 52, y0 + 13, x0 + 220, y0 + 27, '#fbe3cb', r=3)
    c.lines(x0 + 20, y0 + 66, x1 - 150, 5, 24, 3, '#c97b3f'); c.frame(x1 - 130, y0 + 60, x1 - 16, y1 - 16, 3, '#c97b3f')
    for k in range(4): c.rect(x1 - 130, y0 + 84 + k * 24, x1 - 16, y0 + 86 + k * 24, '#c97b3f')
    # four A5 forms
    for i, col in enumerate(FORM_COLS):
        x0, y0, x1, y1 = form_rect(i); c.rect(x0, y0, x1, y1, '#fbfbf8'); c.frame(x0, y0, x1, y1, 2, '#d4d6d2')
        c.rect(x0, y0, x1, y0 + 56, col); c.circle(x0 + 30, y0 + 28, 15, '#ffffff'); c.rect(x0 + 56, y0 + 18, x0 + 190, y0 + 30, '#ffffff', r=3); c.rect(x0 + 56, y0 + 36, x0 + 140, y0 + 42, '#ffffff', alpha=0.7)
        if i == 0:                                           # account-opening form: table grid
            c.frame(x0 + 18, y0 + 76, x1 - 18, y0 + 250, 2, col)
            for k in range(1, 6): c.rect(x0 + 18, y0 + 76 + k * 29, x1 - 18, y0 + 78 + k * 29, col, alpha=0.6)
            c.rect(x0 + 100, y0 + 76, x0 + 102, y0 + 250, col, alpha=0.6); c.lines(x0 + 18, y0 + 272, x1 - 18, 3, 20, 3, '#9aa3ad')
        else:
            c.lines(x0 + 18, y0 + 78, x1 - 18, 4, 20, 3, '#9aa3ad')
            for k in range(5):                               # checkbox rows
                yy = y0 + 172 + k * 26; c.frame(x0 + 18, yy, x0 + 32, yy + 14, 2, col); c.rect(x0 + 44, yy + 5, x1 - 40 - (k % 3) * 22, yy + 8, '#9aa3ad')
            c.rect(x0 + 18, y0 + 150, x0 + 120, y0 + 158, col, r=2)
        c.rect(x1 - 110, y1 - 28, x1 - 18, y1 - 25, '#6b727a')  # signature line
    # box label
    x0, y0, x1, y1 = LABEL; c.rect(x0, y0, x1, y1, '#00796b'); c.rect(x0 + 24, y0 + 20, x0 + 560, y1 - 20, '#f4f7f3', r=14)
    c.rect(x0 + 50, y0 + 40, x0 + 420, y0 + 58, '#00796b', r=4); c.rect(x0 + 50, y0 + 70, x0 + 300, y0 + 80, '#6aa9a1', r=3)
    for k, (base, dark, light) in enumerate(NOTE_COLS): draw_note(c, x0 + 600 + k * 78, y0 + 30, 120, 54, base, dark, light)
    return c

def build():
    c = atlas(); img = c.image('simkit_atlas'); tex = texmat('simkit_print', img, 0.62, (0.85, 0.82, 0.78))
    teal = mat('#00897b', 0.5); teal_in = mat('#e9ece6', 0.7); paper = mat('#efeee8', 0.8); navy = mat('#1f3560', 0.5)
    gold, silver, copper = COIN_MATS()
    UV = lambda r: c.uv(*r)
    # ---- storage tray with dividers
    TX, TY, TW, TD, TH, t = -0.095, 0.055, 0.270, 0.190, 0.045, 0.003
    rbox('tray_floor', TW, TD, t, teal, loc=(TX, TY, 0), r=0.001, segs=1)
    rbox('tray_liner', TW - 2 * t, TD - 2 * t, 0.0004, teal_in, loc=(TX, TY, t), r=0)
    for sy in (-1, 1): rbox('tray_wall', TW, t, TH, teal, loc=(TX, TY + sy * (TD - t) / 2, 0), r=0.001, segs=1)
    for sx in (-1, 1): rbox('tray_wall', t, TD, TH, teal, loc=(TX + sx * (TW - t) / 2, TY, 0), r=0.001, segs=1)
    rbox('divider', 0.002, TD - 2 * t, TH - 0.008, teal, loc=(-0.0715, TY, t), r=0)
    yf = TY - TD / 2 - 0.0003
    quad('tray_label', [(TX - 0.115, yf, 0.010), (TX + 0.115, yf, 0.010), (TX + 0.115, yf, 0.036), (TX - 0.115, yf, 0.036)], UV(LABEL), tex)
    # bundles and coins in the tray
    z0 = t + 0.0004
    sheet('bundle_y', -0.1495, 0.100, z0, 0.146, 0.066, 0.022, 0.0, UV(note_rect(3)), tex, paper)
    sheet('bundle_p', -0.1495, 0.012, z0, 0.146, 0.066, 0.018, 0.0, UV(note_rect(4)), tex, paper)
    sheet('bundle_b', -0.0345, 0.055, z0, 0.146, 0.066, 0.015, math.pi / 2, UV(note_rect(1)), tex, paper)
    coin_stack('tc_g', 0.018, 0.118, z0, 0.0135, 8, gold, seed=3); coin_stack('tc_s', 0.018, 0.078, z0, 0.0125, 7, silver, seed=4)
    coin_stack('tc_c', 0.018, 0.040, z0, 0.0110, 6, copper, seed=5); coin_stack('tc_g2', 0.018, 0.000, z0, 0.0135, 4, gold, seed=6)
    # ---- three fanned bundles in front (purple, blue, green)
    for k, (x, ni, r0) in enumerate([(-0.200, 0, 0.10), (-0.125, 1, 0.0), (-0.050, 2, -0.08)]):
        for j in range(3):
            rz = math.pi / 2 + r0 + (j - 1) * 0.07
            sheet(f'fan{k}_{j}', x + (j - 1) * 0.004, -0.122 - (j - 1) * 0.002, j * 0.0042, 0.146, 0.066, 0.004, rz, UV(note_rect(ni)), tex, paper)
    # ---- coins on the table
    coin_stack('c_g', 0.012, -0.082, 0, 0.0135, 6, gold, seed=7); coin_stack('c_s', 0.015, -0.116, 0, 0.0125, 5, silver, seed=8)
    coin_stack('c_c', 0.011, -0.148, 0, 0.0110, 4, copper, seed=9)
    for x, y, r, m in [(-0.012, -0.182, 0.0135, gold), (0.016, -0.178, 0.0125, silver), (0.044, -0.186, 0.011, copper), (0.068, -0.181, 0.0125, silver)]:
        cyl('loose', r, 0.002, m, loc=(x, y, 0), segs=16)
    # ---- cheque book: back cover, leaves, front cover flipped up
    CX, CY = 0.145, -0.125
    rbox('chq_back', 0.204, 0.094, 0.0012, navy, loc=(CX, CY, 0), r=0)
    sheet('chq_leaves', CX, CY, 0.0012, 0.200, 0.090, 0.0075, 0.0, UV(CHEQUE), tex, paper)
    rbox('chq_stub', 0.204, 0.006, 0.0082, navy, loc=(CX, CY + 0.045, 0.0012), r=0)        # glued binding strip
    a = math.radians(50)
    rbox('chq_cover', 0.204, 0.094, 0.0012, navy, loc=(CX, CY + 0.047 + 0.047 * math.cos(a), 0.0094 + 0.047 * math.sin(a)), rot=(a, 0, 0), r=0)
    # ---- fan of four A5 forms + pay-in slip
    FX, FY = 0.153, 0.085
    for i, (rz, dx) in enumerate([(0.15, -0.020), (0.05, -0.007), (-0.05, 0.007), (-0.15, 0.020)]):
        sheet(f'form{i}', FX + dx, FY, i * 0.0008, 0.148, 0.210, 0.0004, rz, UV(form_rect(i)), tex, paper)
    sheet('slip', 0.165, 0.022, 0.0036, 0.160, 0.076, 0.0015, 0.06, UV(SLIP), tex, paper)
