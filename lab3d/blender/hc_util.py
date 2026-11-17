"""Healthcare-item helpers (items 59-77): superellipse loft, polyline sweep, polar dome, group transform."""
import bpy, bmesh, math
from mathutils import Vector, Matrix, Euler
from _lib import *
from _lib import _link

def se(theta, n):
    c, s = math.cos(theta), math.sin(theta); e = 2.0 / n
    return (math.copysign(abs(c) ** e, c), math.copysign(abs(s) ** e, s))

def loft(name, st, m, segs=24, axis='X', n=2.0, cap0=True, cap1=True):
    """Loft superellipse sections. st = [(t, hw, hh[, c[, n]]), ...].
    axis X: section in YZ (hw along Y, hh along Z, c = z centre). Y: hw along X, hh along Z, c = z centre.
    Z: hw along X, hh along Y, c = y centre."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for s in st:
        t, hw, hh = s[0], s[1], s[2]; c = s[3] if len(s) > 3 else 0.0; nn = s[4] if len(s) > 4 else n
        ring = []
        for i in range(segs):
            a, b = se(2 * math.pi * i / segs, nn)
            if axis == 'X': p = (t, hw * a, c + hh * b)
            elif axis == 'Y': p = (hw * a, t, c + hh * b)
            else: p = (hw * a, c + hh * b, t)
            ring.append(bm.verts.new(p))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(segs): bm.faces.new((a[i], a[(i + 1) % segs], b[(i + 1) % segs], b[i]))
    caps = []
    if cap0: caps.append(bm.faces.new(list(reversed(rings[0]))))
    if cap1: caps.append(bm.faces.new(rings[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    for f in caps: f.smooth = False
    bm.to_mesh(me); bm.free()
    return _link(bpy.data.objects.new(name, me), m)

def catmull(pts, per=6, closed=False):
    P = [Vector(p) for p in pts]; n = len(P); out = []
    segs = n if closed else n - 1
    for i in range(segs):
        if closed: p0, p1, p2, p3 = P[(i - 1) % n], P[i], P[(i + 1) % n], P[(i + 2) % n]
        else: p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, n - 1)]
        for k in range(per):
            t = k / per
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    if not closed: out.append(P[-1])
    return out

def sweep(name, pts, r, m, segs=8, closed=False, up=(0, 0, 1), rh=None, per=6, smooth_path=True):
    """Tube along a path with elliptical section: r across (perpendicular to up), rh along up. r/rh may be functions of s in [0,1]."""
    P = catmull(pts, per, closed) if smooth_path else [Vector(p) for p in pts]
    up = Vector(up).normalized(); N = len(P)
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for i, p in enumerate(P):
        if closed: t = P[(i + 1) % N] - P[i - 1]
        else: t = P[min(i + 1, N - 1)] - P[max(i - 1, 0)]
        t.normalize(); side = up.cross(t).normalized(); u2 = t.cross(side).normalized()
        s = i / (N - 1) if N > 1 else 0
        a = r(s) if callable(r) else r
        b = (rh(s) if callable(rh) else rh) if rh is not None else a
        rings.append([bm.verts.new(p + side * (a * math.cos(2 * math.pi * k / segs)) + u2 * (b * math.sin(2 * math.pi * k / segs))) for k in range(segs)])
    pairs = list(zip(rings, rings[1:])) + ([(rings[-1], rings[0])] if closed else [])
    for a, b in pairs:
        for k in range(segs): bm.faces.new((a[k], a[(k + 1) % segs], b[(k + 1) % segs], b[k]))
    caps = []
    if not closed:
        caps.append(bm.faces.new(list(reversed(rings[0])))); caps.append(bm.faces.new(rings[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    for f in caps: f.smooth = False
    bm.to_mesh(me); bm.free()
    return _link(bpy.data.objects.new(name, me), m)

def dome(name, outline, zf, m, nu=40, nv=6, flip=False):
    """Polar sheet: outline(theta)->(x,y); point = s*outline, z = zf(s, x, y); centre vertex fan."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    c = bm.verts.new((0, 0, zf(0, 0, 0))); rings = []
    for j in range(1, nv + 1):
        s = j / nv; ring = []
        for i in range(nu):
            x, y = outline(2 * math.pi * i / nu); x *= s; y *= s
            ring.append(bm.verts.new((x, y, zf(s, x, y))))
        rings.append(ring)
    for i in range(nu): bm.faces.new((c, rings[0][i], rings[0][(i + 1) % nu]))
    for a, b in zip(rings, rings[1:]):
        for i in range(nu): bm.faces.new((a[i], b[i], b[(i + 1) % nu], a[(i + 1) % nu]))
    if flip: bmesh.ops.reverse_faces(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free()
    return _link(bpy.data.objects.new(name, me), m)

def box(name, sx, sy, sz, m, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Plain sharp box (12 tris), base at local z=0."""
    return rbox(name, sx, sy, sz, m, loc=loc, rot=rot, r=0)

def xf(objs, loc=(0, 0, 0), rot=(0, 0, 0)):
    M = Matrix.Translation(Vector(loc)) @ Euler(rot).to_matrix().to_4x4()
    for o in objs: o.matrix_basis = M @ o.matrix_basis

class grp:
    """with grp(loc, rot): ...  moves every object created inside the block as one rigid group."""
    def __init__(self, loc=(0, 0, 0), rot=(0, 0, 0)): self.loc, self.rot = loc, rot
    def __enter__(self): self.before = set(bpy.context.scene.objects); return self
    def __exit__(self, *a): xf([o for o in bpy.context.scene.objects if o not in self.before], self.loc, self.rot)
