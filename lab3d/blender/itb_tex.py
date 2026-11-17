"""Helpers for the IT / BFSI item scripts (57, 58, 79-82): a small numpy raster canvas for printed surfaces (notes, forms,
board art, book covers) that becomes an embedded Blender image, plus textured quads and a few shared builders.
Canvas coordinates are final pixels, origin top-left, y down. Colours are sRGB hex."""
import bpy, bmesh, math, os, tempfile
import numpy as np
from mathutils import Matrix, Vector
from _lib import *


def _rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], dtype=np.float32)


class Canvas:
    def __init__(self, w, h, bg='#ffffff', ss=2):
        self.w, self.h, self.ss = w, h, ss
        self.a = np.empty((h * ss, w * ss, 3), dtype=np.float32); self.a[:] = _rgb(bg)
        self.clip = None

    def _reg(self, x0, y0, x1, y1):
        if self.clip:
            cx0, cy0, cx1, cy1 = self.clip; x0, y0, x1, y1 = max(x0, cx0), max(y0, cy0), min(x1, cx1), min(y1, cy1)
        s = self.ss
        i0, i1 = max(0, int(math.floor(x0 * s))), min(self.w * s, int(math.ceil(x1 * s)))
        j0, j1 = max(0, int(math.floor(y0 * s))), min(self.h * s, int(math.ceil(y1 * s)))
        if i1 <= i0 or j1 <= j0: return None
        X, Y = np.meshgrid((np.arange(i0, i1) + 0.5) / s, (np.arange(j0, j1) + 0.5) / s)
        return self.a[j0:j1, i0:i1], X, Y

    def _fill(self, reg, mask, col, alpha=1.0):
        sub = reg[0]; c = _rgb(col)
        if alpha >= 1: sub[mask] = c
        else: sub[mask] = sub[mask] * (1 - alpha) + c * alpha

    def rect(self, x0, y0, x1, y1, col, r=0, alpha=1.0):
        reg = self._reg(x0, y0, x1, y1)
        if reg is None: return
        _, X, Y = reg
        if r > 0:
            dx = np.maximum(np.maximum(x0 + r - X, X - (x1 - r)), 0); dy = np.maximum(np.maximum(y0 + r - Y, Y - (y1 - r)), 0)
            mask = dx * dx + dy * dy <= r * r
        else: mask = np.ones(X.shape, dtype=bool)
        self._fill(reg, mask, col, alpha)

    def frame(self, x0, y0, x1, y1, t, col):
        self.rect(x0, y0, x1, y0 + t, col); self.rect(x0, y1 - t, x1, y1, col); self.rect(x0, y0, x0 + t, y1, col); self.rect(x1 - t, y0, x1, y1, col)

    def circle(self, cx, cy, r, col, alpha=1.0, sy=1.0):
        reg = self._reg(cx - r, cy - r * sy, cx + r, cy + r * sy)
        if reg is None: return
        _, X, Y = reg; self._fill(reg, (X - cx) ** 2 + ((Y - cy) / sy) ** 2 <= r * r, col, alpha)

    def ring(self, cx, cy, r0, r1, col, a0=None, a1=None, alpha=1.0):
        """Annulus (optionally only the sector a0..a1 degrees, counter-clockwise from +x, y up)."""
        reg = self._reg(cx - r1, cy - r1, cx + r1, cy + r1)
        if reg is None: return
        _, X, Y = reg; d2 = (X - cx) ** 2 + (Y - cy) ** 2; mask = (d2 >= r0 * r0) & (d2 <= r1 * r1)
        if a0 is not None:
            th = np.degrees(np.arctan2(-(Y - cy), X - cx)) % 360.0; mask &= ((th - a0) % 360.0) <= (a1 - a0)
        self._fill(reg, mask, col, alpha)

    def tri(self, p1, p2, p3, col):
        xs, ys = [p[0] for p in (p1, p2, p3)], [p[1] for p in (p1, p2, p3)]
        reg = self._reg(min(xs), min(ys), max(xs), max(ys))
        if reg is None: return
        _, X, Y = reg
        def e(a, b): return (X - a[0]) * (b[1] - a[1]) - (Y - a[1]) * (b[0] - a[0])
        d1, d2, d3 = e(p1, p2), e(p2, p3), e(p3, p1)
        self._fill(reg, ((d1 >= 0) & (d2 >= 0) & (d3 >= 0)) | ((d1 <= 0) & (d2 <= 0) & (d3 <= 0)), col)

    def lines(self, x0, y0, x1, n, pitch, t, col, short_last=True):
        """n ruled 'text' lines starting at y0."""
        for i in range(n):
            xe = x1 - (x1 - x0) * 0.35 if (short_last and i == n - 1) else x1
            self.rect(x0, y0 + i * pitch, xe, y0 + i * pitch + t, col)

    def uv(self, x0, y0, x1, y1):
        """UV corners (BL, BR, TR, TL) of a canvas pixel rectangle."""
        u0, u1, v0, v1 = x0 / self.w, x1 / self.w, 1 - y1 / self.h, 1 - y0 / self.h
        return [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]

    def image(self, name):
        s = self.ss
        a = self.a.reshape(self.h, s, self.w, s, 3).mean(axis=(1, 3))[::-1]          # downsample, flip to bottom-up
        px = np.ones((self.h, self.w, 4), dtype=np.float32); px[..., :3] = a
        img = bpy.data.images.new(name, self.w, self.h, alpha=False)
        img.pixels.foreach_set(px.ravel())
        path = os.path.join(tempfile.gettempdir(), f'itb_{name}_{os.getpid()}.png')
        img.filepath_raw = path; img.file_format = 'PNG'; img.save(); img.pack()
        try: os.remove(path)
        except OSError: pass
        self.avg = a.reshape(-1, 3).mean(axis=0)
        return img


def texmat(name, img, rough=0.6, flat=(0.8, 0.8, 0.8)):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    t = m.node_tree.nodes.new('ShaderNodeTexImage'); t.image = img
    m.node_tree.links.new(t.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough; m.roughness = rough
    m.diffuse_color = (*[float(c) ** 2.2 for c in flat], 1)
    return m


def quad(name, pts, uvs, m):
    """One textured quad. pts = 4 xyz corners (BL, BR, TR, TL as seen from the visible side), uvs from Canvas.uv()."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vs = [bm.verts.new(p) for p in pts]; f = bm.faces.new(vs); layer = bm.loops.layers.uv.new('UVMap')
    for loop, uv in zip(f.loops, uvs): loop[layer].uv = uv
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(m); return ob


def flat_quad(name, cx, cy, z, w, d, rotz, uvs, m, tilt=None):
    """Textured rectangle lying in XY (visible from above), w along local x, d along local y, rotated by rotz about Z."""
    c, s = math.cos(rotz), math.sin(rotz)
    pts = [(cx + x * c - y * s, cy + x * s + y * c, z) for x, y in ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2))]
    return quad(name, pts, uvs, m)


def sheet(name, cx, cy, z0, w, d, h, rotz, uvs, texm, edgem):
    """A printed slab (note bundle, form, card): plain box with the print on its top face."""
    rbox(name, w, d, h, edgem, loc=(cx, cy, z0), rot=(0, 0, rotz), r=0)
    return flat_quad(name + '_print', cx, cy, z0 + h + 0.00025, w, d, rotz, uvs, texm)


def draw_note(c, x, y, w, h, base, dark, light):
    """Mock currency note (no real design): border, guilloche medallion, corner rosettes, value panels."""
    c.rect(x, y, x + w, y + h, dark)
    m = h * 0.07; c.rect(x + m, y + m, x + w - m, y + h - m, base)
    c.frame(x + m * 1.8, y + m * 1.8, x + w - m * 1.8, y + h - m * 1.8, max(1.0, h * 0.02), light)
    cx, cy = x + w / 2, y + h / 2
    c.circle(cx, cy, h * 0.34, light); c.circle(cx, cy, h * 0.27, dark); c.circle(cx, cy, h * 0.2, base)
    for k in range(8):
        a = k * math.pi / 4; c.circle(cx + h * 0.2 * math.cos(a), cy + h * 0.2 * math.sin(a), h * 0.055, light)
    c.circle(cx, cy, h * 0.08, dark)
    for sx in (-1, 1):
        for sy in (-1, 1): c.circle(cx + sx * (w / 2 - h * 0.27), cy + sy * h * 0.25, h * 0.085, light)
        c.rect(cx + sx * w * 0.3 - h * 0.11, cy - h * 0.09, cx + sx * w * 0.3 + h * 0.11, cy + h * 0.09, dark, r=h * 0.04)
        c.rect(cx + sx * w * 0.3 - h * 0.06, cy - h * 0.04, cx + sx * w * 0.3 + h * 0.06, cy + h * 0.04, light, r=h * 0.02)


NOTE_COLS = [('#b79adf', '#7e57c2', '#e3d5f6'), ('#8fc1ee', '#3d85c6', '#d6e9fa'), ('#93cf9b', '#3f9a54', '#d9f0db'),
             ('#f2cf6b', '#d99a1e', '#fbeebf'), ('#f3a3b8', '#d6557c', '#fbdbe4')]   # (base, dark, light): purple, blue, green, yellow, pink

COIN_MATS = lambda: [mat('#d4a93c', 0.35, 0.7), mat('#bfc3c7', 0.33, 0.7), mat('#b5693a', 0.4, 0.65)]   # gold, silver, copper


def coin_stack(name, x, y, z0, r, n, m, t=0.0022, segs=16, jitter=0.0012, seed=1):
    import random
    rnd = random.Random(seed)
    for i in range(n):
        cyl(f'{name}_{i}', r, t - 0.0002, m, loc=(x + rnd.uniform(-jitter, jitter), y + rnd.uniform(-jitter, jitter), z0 + i * t), segs=segs)
    return z0 + n * t


def rotate_all(angle_x, objs=None):
    """Tilt every object in the scene about the world X axis (keeps the exporter's parentless-mesh assumption)."""
    R = Matrix.Rotation(angle_x, 4, 'X')
    bpy.context.view_layer.update()
    for o in (objs or list(bpy.context.scene.objects)): o.matrix_world = R @ o.matrix_world
