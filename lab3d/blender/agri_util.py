"""Helpers for the Agriculture & Gardening item scripts (items 3, 4, 9, 13, 19, 20, 23)."""
import math, random, bmesh, bpy
from mathutils import Vector
from _lib import *

def crisp(ob, deg=40):
    """Keep smooth shading but split normals at hard edges (rims, flanges)."""
    try: ob.data.set_sharp_from_angle(angle=math.radians(deg))
    except Exception: pass
    return ob

def revolve(name, profile, m, segs=40, mod=None, cap0=False, cap1=False):
    """Lathe about Z with optional radial modulation mod(theta, r, z) -> r."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for r, z in profile:
        ring = []
        for i in range(segs):
            th = 2 * math.pi * i / segs; rr = mod(th, r, z) if mod else r
            ring.append(bm.verts.new((rr * math.cos(th), rr * math.sin(th), z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(segs): bm.faces.new((a[i], a[(i + 1) % segs], b[(i + 1) % segs], b[i]))
    if cap0: bm.faces.new(list(reversed(rings[0])))
    if cap1: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return crisp(ob)

def rr_ring(hx, hy, r, cseg=4):
    pts = []
    for q, (sx, sy) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
        cx, cy = sx * (hx - r), sy * (hy - r)
        for k in range(cseg + 1):
            a = q * math.pi / 2 + (math.pi / 2) * k / cseg
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def rr_loft(name, sections, m, cseg=4, cap0=True, cap1=True, loc=(0, 0, 0)):
    """Loft rounded-rectangle sections [(hx, hy, corner_r, z, [x_offset])...]."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for s in sections:
        hx, hy, r, z = s[:4]; ox = s[4] if len(s) > 4 else 0.0
        rings.append([bm.verts.new((x + ox, y, z)) for x, y in rr_ring(hx, hy, r, cseg)])
    n = len(rings[0])
    for a, b in zip(rings, rings[1:]):
        for i in range(n): bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    if cap0: bm.faces.new(list(reversed(rings[0])))
    if cap1: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    ob.location = loc
    return crisp(ob)

def hull(name, pts, m):
    """Convex solid through the given points (gussets, ribs, wedges)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vs = [bm.verts.new(p) for p in pts]
    res = bmesh.ops.convex_hull(bm, input=vs)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(m)
    return ob

def rod(name, p0, p1, r, m, segs=8, r2=None):
    """Straight cylinder between two points."""
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    ob = cyl(name, r, d.length, m, segs=segs, r2=r2)
    ob.location = p0; ob.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return ob

def soil(name, r, z, seed=0, lumps=5):
    m = mat('#3a281b', 0.95)
    rnd = random.Random(seed)
    def mod(th, rr, zz): return rr
    ob = lathe(name, [(0, z + r * 0.07), (r * 0.5, z + r * 0.06), (r * 0.85, z + r * 0.025), (r, z)], m, 28, close_bottom=False)
    m2 = mat('#4b3424', 0.95)
    for i in range(lumps):
        a = rnd.uniform(0, 6.28); d = r * rnd.uniform(0.35, 0.85); s = r * rnd.uniform(0.05, 0.09)
        sphere(name + '_l', s, m2, loc=(d * math.cos(a), d * math.sin(a), z + r * 0.045 * (1 - d / r) + s * 0.2), scale=(1, rnd.uniform(0.7, 1.2), 0.6), segs=6)
    return ob
