"""kt_lib — helpers for the kitchen hand-tool items (28-55). Low-poly lofts, wires, strips, spoon bowls and
alpha-pattern materials (wire mesh / perforated plate). Import with:  from kt_lib import *"""
import bpy, bmesh, math
from mathutils import Vector, Matrix
from _lib import *
from _lib import _link, hex_rgb

DARK = lambda: mat('#17181a', 0.6)


def V(p): return Vector(p)


def autosharp(ob, deg=35):
    for p in ob.data.polygons: p.use_smooth = True
    try: ob.data.set_sharp_from_angle(angle=math.radians(deg))
    except Exception: pass
    return ob


def loft(name, rings, m, cap0=True, cap1=True, closed=True, loop=False, sharp=35, uvfn=None):
    """Skin a list of rings (each a list of n 3D points). closed: every ring is a loop. loop: last ring joins the first."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vr = [[bm.verts.new(tuple(p)) for p in r] for r in rings]
    n = len(rings[0]); pairs = list(zip(vr, vr[1:])) + ([(vr[-1], vr[0])] if loop else [])
    for a, b in pairs:
        for i in range(n if closed else n - 1):
            j = (i + 1) % n
            try: bm.faces.new((a[i], a[j], b[j], b[i]))
            except ValueError: pass

    def ext(r):
        c = sum((V(p) for p in r), Vector()) / len(r); return max((V(p) - c).length for p in r)
    if closed and not loop:
        if cap0 and ext(rings[0]) > 1e-6: bm.faces.new(list(reversed(vr[0])))
        if cap1 and ext(rings[-1]) > 1e-6: bm.faces.new(vr[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if uvfn:
        uv = bm.loops.layers.uv.new('UVMap')
        for f in bm.faces:
            for l in f.loops: l[uv].uv = uvfn(l.vert.co)
    bm.to_mesh(me); bm.free()
    ob = _link(bpy.data.objects.new(name, me), m)
    if sharp: autosharp(ob, sharp)
    else: smooth(ob)
    return ob


def _tangents(P, closed):
    n = len(P); T = []
    for i in range(n):
        a = P[i - 1] if i > 0 else (P[-1] if closed else P[0])
        b = P[i + 1] if i < n - 1 else (P[0] if closed else P[-1])
        T.append((b - a).normalized())
    return T


def wire(name, pts, r, m, segs=6, closed=False, radii=None):
    """Round wire through a polyline (parallel-transport frames). Much lighter than a bevelled curve."""
    P = [V(p) for p in pts]; T = _tangents(P, closed)
    t0 = T[0]; ref = Vector((0, 0, 1)) if abs(t0.z) < 0.9 else Vector((1, 0, 0))
    N = (ref - t0 * ref.dot(t0)).normalized(); rings = []
    for i, p in enumerate(P):
        N2 = N - T[i] * N.dot(T[i])
        if N2.length > 1e-6: N = N2.normalized()
        B = T[i].cross(N); rr = radii[i] if radii else r
        rings.append([p + (N * math.cos(2 * math.pi * k / segs) + B * math.sin(2 * math.pi * k / segs)) * rr for k in range(segs)])
    return loft(name, rings, m, cap0=not closed, cap1=not closed, loop=closed, sharp=None)


def strip(name, pts, wside, wn, m, N=(0, 0, 1), closed=False, sharp=30):
    """Rectangular-section strip along a path lying in the plane with normal N.
    wside = size across the path inside the plane, wn = size along N. Either may be a list (one per point)."""
    P = [V(p) for p in pts]; T = _tangents(P, closed); N = V(N).normalized(); rings = []
    for i, p in enumerate(P):
        s = N.cross(T[i]).normalized()
        a = (wside[i] if isinstance(wside, (list, tuple)) else wside) / 2; b = (wn[i] if isinstance(wn, (list, tuple)) else wn) / 2
        rings.append([p + s * a + N * b, p - s * a + N * b, p - s * a - N * b, p + s * a - N * b])
    return loft(name, rings, m, loop=closed, sharp=sharp)


def crom(pts, k=4, closed=False):
    """Catmull-Rom resample: k points per segment."""
    P = [V(p) for p in pts]; n = len(P); out = []
    for i in range(n if closed else n - 1):
        p0 = P[(i - 1) % n] if (closed or i > 0) else P[0]; p1 = P[i]; p2 = P[(i + 1) % n]
        p3 = P[(i + 2) % n] if (closed or i + 2 < n) else P[-1]
        for j in range(k):
            t = j / k
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    if not closed: out.append(P[-1])
    return out


def bowl(name, a, b, depth, m, rings=3, segs=14, egg=0.0, power=2.0, uvtile=None, sharp=None):
    """Oval dish, opening +Z, rim in z=0, bottom at -depth, long axis X. Single skin (double-sided)."""
    rr = [[(0, 0, -depth)] * segs]
    for k in range(1, rings + 1):
        rho = k / rings
        rr.append([(a * rho * math.cos(2 * math.pi * i / segs),
                    b * rho * math.sin(2 * math.pi * i / segs) * (1 + egg * math.cos(2 * math.pi * i / segs)),
                    -depth * (1 - rho ** power)) for i in range(segs)])
    uvfn = None
    if uvtile:
        def uvfn(co):
            rho = math.hypot(co.x, co.y)
            if rho < 1e-9: return (0.0, 0.0)
            s = math.hypot(rho, co.z + depth)
            return (co.x / rho * s / uvtile, co.y / rho * s / uvtile)
    return loft(name, rr, m, cap0=False, cap1=False, sharp=sharp, uvfn=uvfn)


def xform(objs, M):
    for o in objs: o.matrix_basis = M @ o.matrix_basis
    return objs


class Collect:
    """with Collect() as c: ...   -> c.objs = objects created inside the block."""
    def __enter__(self): self._b = set(bpy.data.objects); self.objs = []; return self
    def __exit__(self, *a): self.objs = [o for o in bpy.data.objects if o not in self._b]


RX = lambda a: Matrix.Rotation(a, 4, 'X')
RY = lambda a: Matrix.Rotation(a, 4, 'Y')
RZ = lambda a: Matrix.Rotation(a, 4, 'Z')
TR = lambda x, y, z: Matrix.Translation((x, y, z))
LAY_X = RY(math.pi / 2)          # object built along +Z  ->  lies along +X


def pattern_mat(name, hexcol, rough, metal, kind='mesh', px=64, cells=4, fill=0.28):
    """Material whose alpha comes from a tiny generated texture: 'mesh' = woven wire grid, 'holes' = perforated sheet.
    Map with UVs in tile units (1 UV = one texture tile = `cells` cells)."""
    h = hexcol.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    img = bpy.data.images.new(name, px, px, alpha=True); c = px / cells; buf = []
    for y in range(px):
        for x in range(px):
            fx = ((x + 0.5) % c) / c; fy = ((y + 0.5) % c) / c
            if kind == 'mesh': a = 1.0 if (fx < fill or fy < fill) else 0.0
            else: a = 0.0 if math.hypot(fx - 0.5, fy - 0.5) < fill else 1.0
            buf += [r, g, b, a]
    img.pixels = buf
    try: img.pack()
    except Exception: pass
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    cov = sum(buf[3::4]) / (px * px)
    m.diffuse_color = (*hex_rgb(hexcol), 0.35 + 0.5 * cov); m.roughness = rough; m.metallic = metal
    return m


def polys(name, faces, m, sharp=30):
    """Mesh from a list of polygons (each a list of 3D points)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    for f in faces:
        try: bm.faces.new([bm.verts.new(tuple(p)) for p in f])
        except ValueError: pass
    bm.to_mesh(me); bm.free(); ob = _link(bpy.data.objects.new(name, me), m)
    for p in ob.data.polygons: p.use_smooth = False
    return ob
