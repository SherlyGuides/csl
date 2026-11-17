"""Item 57 — Webcam (720p, clip-on monitor webcam). Real size 10.0 × 6.4 × 5.6 cm (W × H × D): bar body 10 × 3.2 × 2.4 cm with a
central lens barrel, on a folded two-hinge monitor clip. Sits on top of a monitor, lens facing the user (-Y).
Source: typical 720p USB webcam + catalogue photo."""
import math
from _lib import *
SNO, WALL = 57, False

def rrect(w, h, r, cz, n=6):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n); pts.append((cx + r * math.cos(a), cz + cy + r * math.sin(a)))
    return pts

def build():
    shell = mat('#1c1d20', 0.5)                    # matte black ABS
    gloss = mat('#0e0f11', 0.18)                   # glossy front fascia
    ring = mat('#43474d', 0.3, 0.6)                # gunmetal lens ring
    glass = mat('#16223c', 0.06, 0.3)              # coated lens
    grey = mat('#70757b', 0.5)
    cz = 0.046
    F = (math.pi / 2, 0, 0)                        # local +Z -> world -Y (toward the user)
    prism('body', rrect(0.100, 0.032, 0.011, cz), 0.024, shell, plane='XZ', bev=0.0022)
    prism('fascia', rrect(0.094, 0.026, 0.009, cz), 0.0012, gloss, plane='XZ', bev=0.0003, loc=(0, -0.0122, 0))
    # lens barrel
    place(lathe('barrel', [(0.0168, 0), (0.0168, 0.0058), (0.0152, 0.0074), (0.0126, 0.0074), (0.0116, 0.0052), (0.0082, 0.0042), (0, 0.0038)], gloss, 28), (0, -0.0128, cz), F)
    place(lathe('ring', [(0.0170, 0.0008), (0.0176, 0.0016), (0.0176, 0.0042), (0.0170, 0.0050)], ring, 28, close_bottom=False), (0, -0.0128, cz), F)
    place(lathe('glass', [(0.0080, 0.0042), (0.0064, 0.0054), (0.0034, 0.0061), (0, 0.0063)], glass, 24, close_bottom=False), (0, -0.0128, cz), F)
    place(lathe('iris', [(0.0034, 0.0062), (0.0018, 0.0066), (0, 0.0067)], mat('#3b5fa8', 0.05, 0.4), 16, close_bottom=False), (0, -0.0128, cz), F)
    # stereo mic ports (3 dots each side) and status LED
    for s in (-1, 1):
        for k in range(3): cyl('mic', 0.0009, 0.0004, grey, loc=(s * (0.030 + k * 0.0042), -0.0134, cz), rot=F, segs=8)
    cyl('led', 0.0011, 0.0004, mat('#4fc3f7', 0.2), loc=(0.0225, -0.0134, cz + 0.006), rot=F, segs=8)
    # folded monitor clip: foot, middle leaf, two hinges, neck
    rbox('foot', 0.056, 0.046, 0.011, shell, loc=(0, -0.004, 0), r=0.004)
    rbox('foot_pad', 0.046, 0.034, 0.0006, RUBBER(), loc=(0, -0.004, -0.0005), r=0.0002)
    rbox('leaf', 0.044, 0.031, 0.0115, shell, loc=(0, -0.0015, 0.0115), r=0.004)
    cyl('hinge_lo', 0.0058, 0.048, shell, loc=(-0.024, 0.0165, 0.0115), rot=(0, math.pi / 2, 0), segs=20)
    cyl('hinge_up', 0.0056, 0.034, shell, loc=(-0.017, 0.003, 0.0255), rot=(0, math.pi / 2, 0), segs=20)
    rbox('neck', 0.022, 0.013, 0.008, shell, loc=(0, 0.002, 0.024), r=0.002)
    # USB cable leaving the back and dropping behind the monitor
    cyl('boot', 0.003, 0.007, shell, loc=(0.030, 0.011, cz), rot=(-math.pi / 2, 0, 0), segs=12)
    tube('cable', [(0.030, 0.016, cz), (0.030, 0.0235, cz - 0.003), (0.030, 0.0275, cz - 0.016), (0.031, 0.0275, 0.014), (0.036, 0.026, 0.004), (0.050, 0.024, 0.002)], 0.0016, RUBBER(), res=1).data.resolution_u = 4
