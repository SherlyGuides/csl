"""Item 19 — Spray pump 2 L pressure sprayer (spec). Real size ≈ 29 cm wide (wand to grip) x 31 cm tall x 12.5 cm deep;
bottle Ø 12.5 cm. Translucent-white bottle with petaloid feet, green ribbed collar and pump head with pistol grip, black
trigger lever and pump knob, brass wand and nozzle, black hose from the bottle shoulder. Source: spec + catalogue photo."""
import math
from _lib import *
from agri_util import *
SNO, WALL = 19, False
X = (0, math.pi / 2, 0)     # local Z -> +X
MX = (0, -math.pi / 2, 0)   # local Z -> -X

def build():
    white = mat('#f6f7f4', 0.38)
    green = mat('#22b04a', 0.42)
    dgreen = mat('#178a37', 0.45)
    black = BLACKPL()
    brass = mat('#c9a04a', 0.3, 0.75)
    # bottle with five petaloid feet
    def feet(th, r, z):
        if z > 0.034: return r
        k = (1 - z / 0.034)
        return r * (1 - 0.09 * k * (0.5 - 0.5 * math.cos(5 * th)))
    prof = [(0.0005, 0.007), (0.026, 0.005), (0.046, 0.0), (0.056, 0.004), (0.061, 0.016), (0.0625, 0.034), (0.0625, 0.125), (0.0605, 0.150),
            (0.054, 0.172), (0.044, 0.189), (0.034, 0.199), (0.031, 0.204), (0.031, 0.210)]
    revolve('bottle', prof, white, 30, mod=feet)
    # ribbed green collar (screw cap) and head
    def ribs(th, r, z):
        return r * (1.035 if (0.2085 < z < 0.2295 and math.cos(18 * th) > 0) else 1.0)
    revolve('collar', [(0.033, 0.203), (0.037, 0.204), (0.0375, 0.209), (0.0375, 0.229), (0.037, 0.2305), (0.031, 0.232)], green, 36, mod=ribs)
    crisp(lathe('head', [(0.031, 0.230), (0.029, 0.236), (0.027, 0.258), (0.025, 0.2625), (0.014, 0.264), (0.0125, 0.266), (0.0125, 0.281), (0.011, 0.283), (0, 0.283)], green, 14, close_bottom=False), 30)
    # pump rod and mushroom knob
    cyl('rod', 0.0048, 0.024, black, loc=(0, 0, 0.282), segs=12)
    crisp(lathe('knob', [(0, 0.303), (0.007, 0.303), (0.010, 0.306), (0.027, 0.308), (0.0295, 0.311), (0.0285, 0.316), (0.020, 0.3195), (0, 0.3205)], black, 16), 30)
    # pistol grip (+X): arm out of the head, bending down, with finger ribs
    g = tube('grip', [(0.012, 0, 0.250), (0.060, 0, 0.253), (0.083, 0, 0.243), (0.092, 0, 0.215), (0.098, 0, 0.170), (0.106, 0, 0.128)], 0.0115, green, res=2)
    g.data.resolution_u = 4; g.scale = (1, 0.85, 1)
    for i in range(3):  # finger ribs
        z = 0.203 - i * 0.026; x = 0.0935 + (0.205 - z) * 0.14 - 0.0105
        sphere('rib', 0.0075, dgreen, loc=(x, 0, z), scale=(0.75, 1.25, 1.15), segs=6)
    # trigger / lock lever on top of the arm
    rbox('lever', 0.052, 0.013, 0.006, black, loc=(0.058, 0, 0.2655), rot=(0, math.radians(8), 0), r=0.002, segs=1)
    hull('tab', [(x, y, z) for x, z in ((0.028, 0.268), (0.040, 0.268), (0.031, 0.280), (0.036, 0.281)) for y in (-0.0055, 0.0055)], black)
    # outlet (-X): green boss, black nut, brass wand + nozzle
    cyl('boss', 0.0095, 0.030, green, loc=(-0.020, 0, 0.246), rot=MX, segs=16)
    ang = math.radians(14); dx, dz = -math.cos(ang), math.sin(ang)
    p0 = (-0.048, 0, 0.246)
    def along(t): return (p0[0] + dx * t, 0, p0[2] + dz * t)
    def ribn(th, r, z): return r * (1.06 if math.cos(10 * th) > 0 else 1.0)
    nut = revolve('nut', [(0.0085, 0), (0.0115, 0.002), (0.0115, 0.018), (0.0075, 0.022), (0.0045, 0.024)], black, 20, mod=ribn, cap0=True, cap1=True)
    nut.location = p0; nut.rotation_euler = (0, -(math.pi / 2 - ang), 0)
    rod('wand', along(0.022), along(0.118), 0.0030, brass, segs=10)
    wrot = (0, -(math.pi / 2 - ang), 0)
    nz = lathe('nozzle', [(0, 0), (0.0045, 0), (0.0058, 0.002), (0.0058, 0.007), (0.0048, 0.008), (0.0058, 0.009), (0.0058, 0.015), (0.0040, 0.019), (0.0018, 0.020), (0, 0.020)], brass, 10)
    crisp(place(nz, along(0.114), wrot), 30)
    # hose: from under the nut, looping down to a fitting on the bottle shoulder
    hs = tube('hose', [(-0.052, 0, 0.240), (-0.078, 0, 0.228), (-0.098, 0, 0.196), (-0.092, 0, 0.166), (-0.072, 0, 0.158), (-0.056, 0, 0.160)], 0.0036, black, res=1)
    hs.data.resolution_u = 4
    cyl('fit', 0.0075, 0.016, black, loc=(-0.066, 0, 0.160), rot=X, segs=12)
    cyl('fit2', 0.0055, 0.010, black, loc=(-0.074, 0, 0.160), rot=X, segs=12)
