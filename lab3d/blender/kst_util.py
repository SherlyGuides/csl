"""Helpers for the kitchen-storage item scripts (items 24,25,29,34,37,38,39,40,48,49)."""
import bpy, bmesh, math
from _lib import *

def rrect(hx, hy, r, k=4, cx=0.0, cy=0.0):
    """Rounded-rectangle outline, 4*(k+1) points, counter-clockwise."""
    r = min(r, hx - 1e-5, hy - 1e-5); pts = []
    for q, (sx, sy) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
        for i in range(k + 1):
            a = math.pi / 2 * (q + i / k)
            pts.append((cx + sx * (hx - r) + r * math.cos(a), cy + sy * (hy - r) + r * math.sin(a)))
    return pts

def loft(name, rings, m, k=4, cap_bottom=True, cap_top=True, smooth_all=True):
    """Loft through rounded-rect sections. rings = [(hx, hy, z, r[, cx, cy]), ...] bottom to top."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); vr = []
    for rg in rings:
        hx, hy, z, r = rg[:4]; cx, cy = (rg[4], rg[5]) if len(rg) > 4 else (0, 0)
        vr.append([bm.verts.new((x, y, z)) for x, y in rrect(hx, hy, r, k, cx, cy)])
    n = len(vr[0])
    for a, b in zip(vr, vr[1:]):
        for i in range(n): bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    caps = ([bm.faces.new(list(reversed(vr[0])))] if cap_bottom else []) + ([bm.faces.new(vr[-1])] if cap_top else [])
    for cf in caps:
        for e in cf.edges: e.smooth = False            # keep the big flat caps from bending the wall normals
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.faces.ensure_lookup_table(); f0 = bm.faces[0]; c = f0.calc_center_median()
    cx0, cy0 = (rings[0][4], rings[0][5]) if len(rings[0]) > 4 else (0, 0)
    if f0.normal.x * (c.x - cx0) + f0.normal.y * (c.y - cy0) < 0: bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(m)
    for p in me.polygons: p.use_smooth = smooth_all and abs(p.normal.z) < 0.95
    return ob

def arc(r0, z0, r1, z1, n=5, bulge=1.0, first=False):
    """Quarter-ellipse profile points from (r0,z0) to (r1,z1): leaves vertically if bulge>0 ... convex outward."""
    out = []
    for i in range(0 if first else 1, n + 1):
        a = math.pi / 2 * i / n
        out.append((r0 + (r1 - r0) * math.sin(a), z0 + (z1 - z0) * (1 - math.cos(a))))
    return out
