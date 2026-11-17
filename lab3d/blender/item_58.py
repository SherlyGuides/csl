"""Item 58 — Headphone with mic (over-ear stereo headset, boom microphone). Real size 19.1 × 21.2 × 18.4 cm (W × H × D incl. boom):
ear cups 10 × 8.6 cm oval, padded headband, steel sliders, C-yokes, flexible boom with foam windscreen on the left cup.
Upright as it hangs on the wall hook (headband up, cups down), boom toward the room (-Y). Source: typical headset + catalogue photo."""
import math
from _lib import *
SNO, WALL = 58, True

def build():
    shell = mat('#1f2023', 0.48)                   # matte black ABS
    plate = mat('#2a2c30', 0.3)                    # smoother cup plate
    pad = mat('#161618', 0.72)                     # leatherette
    cloth = mat('#0c0c0d', 0.95)
    steel = mat('#9a9ea3', 0.32, 0.7)
    foam = mat('#0f0f10', 1.0)
    SY = 0.86                                      # cups are oval: 10 cm tall, 8.6 cm deep
    for s in (-1, 1):
        R = (0, s * math.pi / 2, 0)                # local +Z -> outward (+/-X)
        x0 = s * 0.066
        c = lathe(f'cup{s}', [(0.049, 0), (0.0502, 0.004), (0.0492, 0.014), (0.0445, 0.021), (0.034, 0.0252), (0, 0.0262)], shell, 20)
        place(c, (x0, 0, 0.05), R, (1, SY, 1))
        p = lathe(f'plate{s}', [(0.031, 0.0254), (0.0295, 0.0268), (0, 0.0274)], plate, 20, close_bottom=False)
        place(p, (x0, 0, 0.05), R, (1, SY, 1))
        q = lathe(f'cushion{s}', [(0.049, 0), (0.0512, -0.006), (0.0475, -0.0165), (0.039, -0.0205), (0.031, -0.0165), (0.0272, -0.007)], pad, 20)
        place(q, (x0, 0, 0.05), R, (1, SY, 1))
        d = lathe(f'cloth{s}', [(0.028, -0.006), (0, -0.0055)], cloth, 16, close_bottom=False)
        place(d, (x0, 0, 0.05), R, (1, SY, 1))
        # C-yoke with pivots, hub, steel slider, headband end cap
        xf = s * 0.0835
        tube(f'yoke{s}', [(xf, -0.0455, 0.05), (xf, -0.044, 0.076), (xf, -0.027, 0.099), (xf, 0, 0.1055), (xf, 0.027, 0.099), (xf, 0.044, 0.076), (xf, 0.0455, 0.05)], 0.0038, shell, res=1).data.resolution_u = 4
        for y in (-0.0455, 0.0455): sphere(f'pivot{s}', 0.0052, shell, loc=(xf, y, 0.05), segs=8)
        rbox(f'hub{s}', 0.008, 0.024, 0.022, shell, loc=(s * 0.0862, 0, 0.097), r=0.003, segs=1)
        rbox(f'slider{s}', 0.0016, 0.014, 0.036, steel, loc=(s * 0.0868, 0, 0.108), r=0.0004, segs=1)
        rbox(f'cap{s}', 0.009, 0.033, 0.024, shell, loc=(s * 0.0862, 0, 0.130), r=0.003, segs=1)
    # headband: plastic outer arc + padded underside
    cz, RB = 0.120, 0.0885
    band = surface('band', lambda u, v: (RB * math.cos(math.radians(11 + 158 * u)), (v - 0.5) * 0.031, cz + RB * math.sin(math.radians(11 + 158 * u))), 18, 2, shell, thickness=0.0045)
    bevel(band, 0.0012, 1)
    RP = RB - 0.008
    cushion = surface('band_pad', lambda u, v: (RP * math.cos(math.radians(38 + 104 * u)), (v - 0.5) * 0.035, cz + RP * math.sin(math.radians(38 + 104 * u))), 12, 2, pad, thickness=0.012)
    bevel(cushion, 0.004, 1)
    # boom microphone on the left cup
    cyl('mic_pivot', 0.0095, 0.0045, shell, loc=(-0.0915, -0.012, 0.036), rot=(0, -math.pi / 2, 0), segs=20)
    tube('boom', [(-0.0945, -0.012, 0.036), (-0.0945, -0.045, 0.023), (-0.086, -0.080, 0.015), (-0.064, -0.104, 0.013), (-0.047, -0.114, 0.013)], 0.0022, shell, res=1).data.resolution_u = 5
    w = sphere('windscreen', 0.0115, foam, loc=(-0.037, -0.120, 0.013), scale=(1.4, 1, 1), segs=16); w.rotation_euler = (0, 0, math.radians(-31))
    # cable strain relief under the left cup
    cyl('relief', 0.0032, 0.010, shell, loc=(-0.079, 0.012, 0.012), rot=(math.radians(200), 0, 0), segs=10)
