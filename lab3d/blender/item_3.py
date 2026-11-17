"""Item 3 — Drip irrigation unit: 16 mm main pipe 15 m (coil Ø 39 cm, 4 x 4 turns), 4 mm feeder line coil, green-handled
ball valve, threaded adapters, tee, end cap, barbed connectors, 8 red emitters, bundle of stakes. Laid out flat as in the
catalogue photo. Real size ≈ 50 x 6.5 x 56 cm. Source: spec + catalogue photo."""
import math, random
from _lib import *
from agri_util import *
SNO, WALL = 3, False
X = (0, math.pi / 2, 0)

def coil(name, R, p, cols, rows, m, segs, loc):
    """Coiled pipe bundle as one lathe: scalloped outline of a cols x rows pack of pipes of radius p."""
    prof = []
    def arc(cx, cz, degs): prof.extend((cx + p * math.cos(math.radians(a)), cz + p * math.sin(math.radians(a))) for a in degs)
    xs = [R + (i - (cols - 1) / 2) * 2 * p for i in range(cols)]; zs = [p + j * 2 * p * 0.98 for j in range(rows)]
    for x in xs: arc(x, zs[0], (-150, -90, -30))
    for z in zs: arc(xs[-1], z, (-60, 0, 60))
    for x in reversed(xs): arc(x, zs[-1], (30, 90, 150))
    for z in reversed(zs): arc(xs[0], z, (120, 180, 240))
    prof.append(prof[0])
    ob = lathe(name, prof, m, segs, close_bottom=False); ob.location = loc
    return crisp(ob, 50)

def build():
    pipe = mat('#1b1c1e', 0.55)
    blk = mat('#232427', 0.45)
    green = mat('#1f9a4a', 0.45)
    red = mat('#d8262c', 0.42)
    # main 16 mm coil with three tie straps, loose end tucked on top
    C = (0.0, 0.085, 0.0); R = 0.163; p = 0.008
    coil('coil', R, p, 4, 4, pipe, 32, C)
    strap = mat('#0c0c0d', 0.4)
    for a in (math.radians(200), math.radians(320), math.radians(80)):
        c, s = math.cos(a), math.sin(a)
        pts = [(C[0] + (R + dr) * c, C[1] + (R + dr) * s, z) for dr, z in ((-0.0335, 0.0), (0.0335, 0.0), (0.0335, 0.0635), (-0.0335, 0.0635))]
        t = 0.004
        hull('strap', [(x - s * e, y + c * e, z) for x, y, z in pts for e in (-t, t)], strap)
    # 4 mm feeder-line coil, resting against the big coil (front right)
    coil('feeder', 0.064, 0.004, 3, 2, pipe, 22, (0.165, -0.105, 0.0))
    # ball valve: black body with threaded ends, green butterfly handle
    vx, vy = -0.185, -0.165
    cyl('v_body', 0.016, 0.050, blk, loc=(vx - 0.025, vy, 0.022), rot=X, segs=14)
    for sx in (-1, 1):
        def thr(th, r, z): return r * (1.0 + 0.05 * (int(z * 1000) % 2))
        o = revolve('v_thr', [(0.0125, 0.0), (0.0125, 0.003), (0.0125, 0.006), (0.0125, 0.009), (0.0125, 0.012), (0.0125, 0.015), (0.0125, 0.018)], blk, 12,
                    mod=lambda th, r, z: r * (1.07 if round(z / 0.003) % 2 else 0.95), cap1=True)
        o.location = (vx + sx * 0.025, vy, 0.022); o.rotation_euler = (0, sx * math.pi / 2, 0)
        cyl('v_nut', 0.019, 0.010, blk, loc=(vx + sx * 0.018 - (0.010 if sx < 0 else 0), vy, 0.022), rot=X, segs=8)
    cyl('v_stem', 0.008, 0.012, blk, loc=(vx, vy, 0.036), segs=10)
    hull('v_handle', [(vx + x, vy + y, z) for x, y in ((-0.030, -0.013), (-0.030, 0.013), (0.030, -0.013), (0.030, 0.013), (-0.008, -0.006), (-0.008, 0.006), (0.008, -0.006), (0.008, 0.006)) for z in (0.047, 0.056)]
         + [(vx + x, vy + y, 0.060) for x, y in ((-0.006, -0.005), (0.006, -0.005), (-0.006, 0.005), (0.006, 0.005))], green)
    # threaded adapters (upright)
    for i, (ax, r) in enumerate(((-0.105, 0.017), (-0.062, 0.015))):
        o = revolve('adapter', [(r, 0), (r, 0.012), (r * 0.8, 0.013), (r * 0.8, 0.017), (r * 0.8, 0.021), (r * 0.8, 0.025), (r * 0.8, 0.029), (r * 0.55, 0.029)], blk, 12,
                    mod=lambda th, rr, z: rr * (1.06 if (z > 0.014 and round(z / 0.004) % 2) else 1.0), cap0=True)
        o.location = (ax, -0.170, 0)
    # 16 mm barbed tee and end cap
    tx, ty = 0.0, -0.160
    cyl('tee', 0.0085, 0.085, blk, loc=(tx - 0.0425, ty, 0.0085), rot=X, segs=10)
    cyl('tee_b', 0.0085, 0.034, blk, loc=(tx, ty, 0.0085), rot=(-math.pi / 2, 0, 0), segs=10)
    for dx in (-0.034, -0.024, 0.024, 0.034):
        cyl('barb', 0.0105, 0.004, blk, loc=(tx + dx - 0.002, ty, 0.0105), rot=X, segs=10, r2=0.0085)
    crisp(place(lathe('cap', [(0, 0), (0.014, 0), (0.0155, 0.002), (0.0155, 0.020), (0.013, 0.023), (0, 0.023)], blk, 12), (0.045, -0.215, 0)), 30)
    # 4 mm barbed connectors: 2 straight, 2 tees
    def conn(x, y, ang, tee):
        c, s = math.cos(ang), math.sin(ang); L = 0.027
        rod('conn', (x - c * L, y - s * L, 0.004), (x + c * L, y + s * L, 0.004), 0.0036, blk, segs=6)
        for t in (-0.02, -0.012, 0.012, 0.02):
            rod('cb', (x + c * t, y + s * t, 0.004), (x + c * (t + 0.004 * (1 if t < 0 else -1)), y + s * (t + 0.004 * (1 if t < 0 else -1)), 0.004), 0.0052, blk, segs=6, r2=0.0036)
        rod('cmid', (x - c * 0.003, y - s * 0.003, 0.004), (x + c * 0.003, y + s * 0.003, 0.004), 0.006, blk, segs=6)
        if tee: rod('ct', (x, y, 0.004), (x - s * 0.022, y + c * 0.022, 0.004), 0.0036, blk, segs=6)
    conn(0.125, -0.215, 0.35, False); conn(0.150, -0.250, 0.30, False); conn(0.215, -0.240, -0.5, True); conn(0.165, -0.285, 0.45, True)
    # 8 emitters: black barbed base, red flow cap with nipple
    k = 0
    for row, n in ((0, 3), (1, 3), (2, 2)):
        for i in range(n):
            x = -0.085 + i * 0.045 + row * 0.022; y = -0.215 - row * 0.038
            cyl('e_base', 0.0075, 0.007, blk, loc=(x, y, 0), segs=8)
            crisp(place(lathe('emitter', [(0.0125, 0.007), (0.0135, 0.008), (0.0135, 0.012), (0.011, 0.014), (0.0055, 0.016), (0.0035, 0.024), (0.0025, 0.027), (0, 0.027)], red, 8, close_bottom=False), (x, y, 0)), 30)
            k += 1
    # bundle of 8 stakes with hooked heads, fanned out
    rnd = random.Random(3)
    for i in range(8):
        hx, hy = -0.262 + i * 0.011, -0.212 - (i % 2) * 0.006
        tx_, ty_ = -0.100 - i * 0.004 + rnd.uniform(-0.004, 0.004), -0.305 + i * 0.002
        z = 0.004 + (i % 3) * 0.004
        rod('stake', (hx, hy, z), (tx_, ty_, 0.003), 0.004, blk, segs=5, r2=0.0008)
        d = math.atan2(ty_ - hy, tx_ - hx)
        hk = tube('hook', [(hx, hy, z), (hx - 0.008 * math.cos(d) - 0.006 * math.sin(d), hy - 0.008 * math.sin(d) + 0.006 * math.cos(d), z),
                           (hx - 0.003 * math.cos(d) - 0.014 * math.sin(d), hy - 0.003 * math.sin(d) + 0.014 * math.cos(d), z)], 0.0026, blk, res=0)
        hk.data.resolution_u = 3
