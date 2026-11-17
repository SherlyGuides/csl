"""Item 20 — Watering can 5 L, plastic (spec). Real size ≈ 46 cm long (handle to rose) x 28 cm tall x 14 cm deep; body
24 x 14 x 19 cm ≈ 5 L. Green blow-moulded body with wavy embossed lines, threaded filler neck, big arched band handle,
long tapering spout and a yellow rose with holes. Spout points +X, handle at -X (same as the placeholder).
Source: spec + catalogue photo."""
import math
from _lib import *
from agri_util import *
SNO, WALL = 20, False

def build():
    green = mat('#1f8a4c', 0.45)
    dgreen = mat('#176c3b', 0.5)
    yellow = mat('#f2c81e', 0.42)
    dot = mat('#8a6c08', 0.6)
    dark = mat('#0c2e19', 0.8)
    # body: rounded-rectangular, slightly waisted foot, sloping shoulder
    rr_loft('body', [(0.108, 0.058, 0.030, 0.0), (0.117, 0.066, 0.036, 0.010), (0.120, 0.069, 0.038, 0.060), (0.120, 0.069, 0.038, 0.150),
                     (0.116, 0.066, 0.038, 0.170), (0.106, 0.058, 0.036, 0.183), (0.088, 0.044, 0.030, 0.190), (0.050, 0.020, 0.015, 0.192)], green, cseg=4)
    # filler neck with thread rings, dark opening
    nx = -0.052
    ob = lathe('neck', [(0.040, 0.186), (0.036, 0.192), (0.034, 0.196), (0.034, 0.200), (0.0365, 0.202), (0.0365, 0.206), (0.034, 0.208),
                        (0.034, 0.212), (0.0365, 0.214), (0.0365, 0.220), (0.034, 0.222), (0.0305, 0.222), (0.0305, 0.200)], green, 16, close_bottom=False)
    crisp(ob, 30); ob.location.x = nx
    cyl('open', 0.0305, 0.001, dark, loc=(nx, 0, 0.200), segs=16)
    # handle: wide flat band from the back of the body, arching over the neck to the front shoulder
    h = tube('handle', [(-0.108, 0, 0.075), (-0.136, 0, 0.115), (-0.141, 0, 0.195), (-0.112, 0, 0.248), (-0.045, 0, 0.262),
                        (0.020, 0, 0.248), (0.052, 0, 0.210), (0.060, 0, 0.180)], 0.0115, green, res=2)
    h.data.resolution_u = 4; h.scale = (1, 1.7, 1)
    # spout: wide root tapering to the rose
    tip = (0.246, 0, 0.212)
    sp = tube('spout', [(0.085, 0, 0.040), (0.140, 0, 0.085), (0.195, 0, 0.152), tip], 0.036, green, res=3, taper=[1.0, 0.72, 0.47, 0.40])
    sp.data.resolution_u = 5
    d = (0.246 - 0.195, 0.212 - 0.152); phi = math.atan2(d[0], d[1])
    rot = (0, phi, 0)
    crisp(place(lathe('collar', [(0, 0), (0.0165, 0), (0.0175, 0.003), (0.0175, 0.012), (0.0155, 0.014)], dgreen, 20), tip, rot), 30)
    rose = lathe('rose', [(0.0150, 0.010), (0.0160, 0.016), (0.0370, 0.046), (0.0385, 0.050), (0.0370, 0.053), (0.028, 0.0565), (0.014, 0.0585), (0, 0.059)], yellow, 24, close_bottom=False)
    crisp(place(rose, tip, rot), 30)
    # holes on the rose face
    ux, uz = math.sin(phi), math.cos(phi)
    for ring, n in ((0.0, 1), (0.011, 6), (0.022, 10), (0.031, 12)):
        for k in range(n):
            a = 2 * math.pi * k / n + ring * 40
            lx, ly = ring * math.cos(a), ring * math.sin(a); lz = 0.0589 - 0.0045 * (ring / 0.031) ** 2
            # local (lx, ly, lz) -> world: rotate about Y by phi
            wx = tip[0] + lx * math.cos(phi) + lz * math.sin(phi); wz = tip[2] - lx * math.sin(phi) + lz * math.cos(phi)
            cyl('hole', 0.0017, 0.0006, dot, loc=(wx, ly, wz), rot=rot, segs=5)
    # wavy embossed lines on both sides
    for sy in (-1, 1):
        for z0 in (0.062, 0.100):
            pts = [(x, sy * 0.0692, z0 + 0.016 * math.sin((x + 0.085) / 0.17 * math.pi * 1.5 + 0.5)) for x in (-0.082, -0.04, 0.0, 0.04, 0.082)]
            w = tube('wave', pts, 0.0022, dgreen, res=0); w.data.resolution_u = 3
