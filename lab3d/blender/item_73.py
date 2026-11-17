"""Item 73 — Reflex (Taylor percussion) hammer. Real size 19 × 1.9 × 5.4 cm lying flat, head at +X like the placeholder.
Black triangular rubber head in a chrome band, chrome handle flattening to a paddle tail. Source: typical Taylor hammer + photo."""
import math
from hc_util import *
SNO, WALL = 73, False
def build():
    rubber = mat('#1d1e20', 0.85); chrome = mat('#d6dadd', 0.2, 0.75)
    x0, T = 0.0735, 0.0185
    tri = [(x0 - 0.0215, 0.017), (x0 - 0.0195, 0.021), (x0 + 0.0195, 0.021), (x0 + 0.0215, 0.017), (x0 + 0.003, -0.031), (x0, -0.033), (x0 - 0.003, -0.031)]
    prism('head', tri, T, rubber, loc=(0, 0, T / 2), bev=0.0022)
    yb = -0.006
    rbox('band', 0.0235, 0.0105, T + 0.0012, chrome, loc=(x0, yb, -0.0006), r=0.0008, segs=1)
    cyl('ferrule', 0.0042, 0.012, chrome, loc=(x0 - 0.0225, yb, T / 2), rot=(0, math.pi / 2, 0), segs=14)
    zc = lambda x: 0.0026 + (T / 2 - 0.0026) * max(0.0, min(1.0, (x + 0.095) / 0.15))
    st = [(-0.095, 0.004, 0.0012), (-0.0925, 0.0068, 0.002), (-0.085, 0.0082, 0.0024), (-0.068, 0.0086, 0.0026), (-0.05, 0.0068, 0.0026),
          (-0.035, 0.0038, 0.0028), (-0.02, 0.003, 0.003), (0.03, 0.003, 0.003), (x0 - 0.012, 0.003, 0.003)]
    loft('handle', [(x, hw, hh, zc(x), 2.4) for x, hw, hh in st], chrome, 14)
    xf([bpy.data.objects['handle']], loc=(0, yb, 0))
