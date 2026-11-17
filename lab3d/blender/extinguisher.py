"""Shared builder for the 2 kg ISI fire extinguishers (items 92 CO2, 93 ABC). Wall-mounted: back toward +Y, front faces -Y.
2 kg ABC (stored pressure): Ø11 cm × 34 cm body, valve + squeeze lever, gauge, 40 cm hose with nozzle → ≈ 48 cm overall.
2 kg CO2: slimmer, taller seamless cylinder Ø11 × 44 cm, no gauge, black hose with discharge horn → ≈ 57 cm overall."""
import math
from _lib import *

def build_extinguisher(kind):
    red = mat('#c8102e', 0.28, 0.15)          # glossy fire-red enamel
    black = mat('#16181a', 0.55)
    chrome = mat('#dfe3e6', 0.18, 0.75)
    brass = BRASS()
    white = mat('#f4f4f2', 0.5)
    green = mat('#2e9e4a', 0.5)
    yellow = mat('#f2c230', 0.45)
    H = 0.44 if kind == 'CO2' else 0.34
    R = 0.054
    # body: rounded base, straight wall, domed shoulder (surface of revolution)
    prof = [(0, 0.006), (0.04, 0.006), (0.05, 0.009), (R, 0.022), (R, H - 0.03), (R - 0.006, H - 0.012), (R - 0.02, H), (0.026, H + 0.012), (0.018, H + 0.016), (0, H + 0.016)]
    lathe('body', prof, red, 64)
    lathe('foot', [(0, 0), (R - 0.004, 0), (R + 0.001, 0.004), (R + 0.001, 0.016), (0.04, 0.016), (0, 0.016)], black, 64)  # plastic foot ring
    # printed instruction label wrapped on the front of the cylinder
    lab_lo, lab_hi = H * 0.32, H * 0.78
    surface('label', lambda u, v: (R * 1.004 * math.sin(math.radians(-55 + 110 * u)), -R * 1.004 * math.cos(math.radians(-55 + 110 * u)), lab_lo + (lab_hi - lab_lo) * v), 24, 2, white)
    surface('label_band', lambda u, v: (R * 1.006 * math.sin(math.radians(-55 + 110 * u)), -R * 1.006 * math.cos(math.radians(-55 + 110 * u)), lab_hi - 0.03 + 0.03 * v), 24, 1, black if kind == 'CO2' else mat('#1565c0', 0.5))
    text('t_kind', kind, 0.03, black, loc=(0, -R - 0.0015, lab_lo + (lab_hi - lab_lo) * 0.5), depth=0.0004)
    text('t_kg', '2 kg', 0.016, black, loc=(0, -R - 0.0015, lab_lo + (lab_hi - lab_lo) * 0.28), depth=0.0003)
    text('t_isi', 'ISI', 0.012, mat('#1565c0', 0.5), loc=(0.022, -R * 0.93 - 0.0015, lab_lo + 0.012), depth=0.0003)
    # neck, valve head, levers
    top = H + 0.016
    cyl('neck', 0.016, 0.018, brass, loc=(0, 0, top), segs=24)
    rbox('valve', 0.05, 0.034, 0.04, chrome, loc=(0, 0, top + 0.016), r=0.006)
    lever = [(-0.012, 0), (0.075, 0.006), (0.08, 0.014), (0.07, 0.016), (-0.012, 0.012)]
    prism('carry_handle', lever, 0.024, black, plane='XZ', loc=(0, 0, top + 0.03), bev=0.002)
    prism('squeeze_lever', [(-0.01, 0), (0.07, 0.022), (0.075, 0.03), (0.065, 0.031), (-0.01, 0.012)], 0.02, red, plane='XZ', loc=(0, 0, top + 0.05), bev=0.002)
    # safety pin + tamper seal
    tube('pin_ring', [(-0.022 + 0.012 * math.cos(a), -0.02, top + 0.045 + 0.012 * math.sin(a)) for a in [i * math.pi / 4 for i in range(8)]], 0.0016, yellow, closed=True)
    if kind == 'ABC':
        # pressure gauge facing front, green operating band
        cyl('gauge_rim', 0.017, 0.012, chrome, loc=(0, -0.017, top + 0.02), rot=(math.pi / 2, 0, 0), segs=32)
        cyl('gauge_face', 0.0145, 0.0008, white, loc=(0, -0.0292, top + 0.02), rot=(math.pi / 2, 0, 0), segs=32)
        prism('gauge_green', [(0.0125 * math.cos(math.radians(a)), 0.0125 * math.sin(math.radians(a))) for a in range(60, 121, 10)] + [(0.008 * math.cos(math.radians(a)), 0.008 * math.sin(math.radians(a))) for a in range(120, 59, -10)], 0.0004, green, plane='XZ', loc=(0, -0.0302, top + 0.02), bev=0)
        prism('needle', [(-0.0008, 0), (0.0008, 0), (0.0002, 0.011), (-0.0002, 0.011)], 0.0004, black, plane='XZ', loc=(0, -0.0306, top + 0.02), rot=(0, math.radians(-8), 0), bev=0)
        # hose down the right side, nozzle clipped near the base
        tube('hose', [(0.028, -0.004, top + 0.02), (0.06, -0.01, top - 0.01), (0.072, -0.02, top - 0.08), (0.07, -0.024, 0.16), (0.066, -0.022, 0.1)], 0.0065, black)
        cyl('nozzle', 0.006, 0.05, black, loc=(0.066, -0.022, 0.05), segs=16, r2=0.009)
    else:
        # CO2: black hose to a discharge horn, horn clipped beside the cylinder
        tube('hose', [(0.028, -0.004, top + 0.02), (0.062, -0.012, top - 0.02), (0.075, -0.02, top - 0.1), (0.075, -0.022, top - 0.17)], 0.006, black)
        cyl('horn_tube', 0.008, 0.05, black, loc=(0.075, -0.022, top - 0.22), segs=16)
        lathe('horn', [(0, 0), (0.042, 0), (0.044, 0.004), (0.012, 0.11), (0, 0.11)], black, 32)
        import bpy
        h = bpy.data.objects['horn']; h.location = (0.075, -0.022, top - 0.335)
    # wall bracket: strap round the body + back plate
    rbox('bracket_plate', 0.06, 0.006, 0.12, chrome, loc=(0, R + 0.006, H * 0.62), r=0.002)
    tube('strap', [(R * 1.02 * math.cos(a), R * 1.02 * math.sin(a), H * 0.7) for a in [math.radians(d) for d in range(0, 360, 30)]], 0.003, chrome, closed=True)
