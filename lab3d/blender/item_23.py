"""Item 23 — NFT Hydroponics set-up, 40 plants (no catalogue photo). 2.2 m long A-frame rack, 4 white rectangular PVC
channels (100 x 50 mm) x 10 net cups of lettuce, staggered front/back, reservoir tank with pump line up to the top channel
and gravity drains zig-zagging back to the tank. Real size ≈ 229 x 140 x 60 cm. Same footprint/orientation as the placeholder
(channels along X). Source: proposal description + typical 40-plant NFT kit."""
import math
from _lib import *
from agri_util import *
from plants import rosette
SNO, WALL = 23, False

def build():
    pvc = mat('#f2f3f1', 0.42)
    frame = mat('#dfe1e2', 0.4, 0.3)
    blk = BLACKPL()
    tank = mat('#37474f', 0.5)
    lidm = mat('#263238', 0.5)
    TOP = 1.36; BY = 0.20; TY = 0.035
    def leg_y(z): return BY + (TY - BY) * z / TOP
    # A-frame ends
    for x in (-1.0, 0.0, 1.0):
        for s in (-1, 1):
            rod('leg', (x, s * BY, 0), (x, s * TY, TOP), 0.016, frame, segs=8)
            cyl('foot', 0.021, 0.012, blk, loc=(x, s * BY, 0), segs=8)
        rod('top', (x, -TY - 0.01, TOP), (x, TY + 0.01, TOP), 0.016, frame, segs=8)
        rod('brace', (x, -leg_y(0.25), 0.25), (x, leg_y(0.25), 0.25), 0.012, frame, segs=6)
    for z, s in ((0.25, -1), (0.25, 1)):
        rod('rail', (-1.0, s * leg_y(z), z), (1.0, s * leg_y(z), z), 0.012, frame, segs=6)
    rod('ridge', (-1.0, 0, TOP), (1.0, 0, TOP), 0.016, frame, segs=8)
    # channels: (height of channel underside, side) front = -Y
    chans = [(0.38, -1), (0.66, 1), (0.92, -1), (1.19, 1)]
    CW, CH, CL = 0.10, 0.05, 2.2
    k = 0
    ends = []
    for ci, (z, s) in enumerate(chans):
        yl = s * leg_y(z); yc = yl + s * (0.016 + CW / 2 + 0.004)
        for x in (-1.0, 0.0, 1.0):     # support arm + bracket under the channel
            rod('arm', (x, yl, z - 0.008), (x, yc + s * CW / 2, z - 0.008), 0.008, frame, segs=6)
            rod('strut', (x, s * leg_y(z - 0.10), z - 0.10), (x, yc + s * 0.03, z - 0.012), 0.006, frame, segs=5)
        rbox('channel', CL, CW, CH, pvc, loc=(0, yc, z), r=0.006, segs=2)
        for sx in (-1, 1):
            rbox('endcap', 0.012, CW + 0.006, CH + 0.006, pvc, loc=(sx * (CL / 2 + 0.002), yc, z - 0.003), r=0.003, segs=1)
        for i in range(10):
            x = -0.945 + i * 0.21
            cyl('cup', 0.027, 0.006, blk, loc=(x, yc, z + CH - 0.0005), segs=7, r2=0.0285)
            rosette('lettuce', loc=(x, yc, z + CH + 0.004), radius=0.15 + 0.02 * ((i + ci) % 3), n=6, height=0.085, seed=230 + k, nu=3, nv=2,
                    palette=('#6fbf3f', '#8fd14f', '#4f9f33')); k += 1
        ends.append((yc, z))
    # reservoir with lid, under the frame
    rr_loft('tank', [(0.29, 0.165, 0.03, 0.0), (0.30, 0.175, 0.03, 0.27), (0.31, 0.185, 0.03, 0.27), (0.31, 0.185, 0.03, 0.285)], tank, cseg=3)
    rr_loft('lid', [(0.312, 0.187, 0.03, 0.285), (0.312, 0.187, 0.03, 0.300), (0.29, 0.165, 0.03, 0.306)], lidm, cseg=3, cap0=False)
    cyl('lidcap', 0.035, 0.012, blk, loc=(-0.18, 0.0, 0.304), segs=10)
    # pump line: tank lid -> right end of the top channel
    yt, zt = ends[3]
    pl = tube('pump', [(0.20, 0.0, 0.30), (0.24, 0.02, 0.42), (0.90, 0.10, 0.60), (1.13, yt, 1.00), (1.13, yt, zt + CH + 0.035), (1.08, yt, zt + CH + 0.045), (1.05, yt, zt + CH - 0.002)], 0.008, blk, res=1)
    pl.data.resolution_u = 4
    # drains at alternate ends: top -> 3rd -> 2nd -> lowest -> tank
    xl = -1.06
    def drain(a, b, x):
        (ya, za), (yb, zb) = a, b
        d = tube('drain', [(x, ya, za + 0.002), (x, ya, za - 0.05), (x, (ya + yb) / 2, (za + zb) / 2 + 0.03), (x, yb, zb + CH + 0.05), (x, yb, zb + CH - 0.004)], 0.014, pvc, res=1)
        d.data.resolution_u = 3
    drain(ends[3], ends[2], xl); drain(ends[2], ends[1], -xl); drain(ends[1], ends[0], xl)
    y0, z0 = ends[0]
    d = tube('return', [(1.06, y0, z0 + 0.002), (1.06, y0, z0 - 0.06), (0.70, y0 * 0.6, 0.36), (0.24, -0.08, 0.34), (0.20, -0.08, 0.302)], 0.014, pvc, res=1)
    d.data.resolution_u = 4
