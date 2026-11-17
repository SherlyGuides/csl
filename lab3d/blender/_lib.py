"""Shared helpers for item scripts. Import with:  from _lib import *
Conventions: metres, Z up, front faces -Y, item rests on z=0. tools/export_item.py normalises origin and exports.
Colours are given as sRGB hex from the catalogue photo; mat() converts them to Blender's linear space."""
import bpy, bmesh, math
from mathutils import Vector, Matrix

def _lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex_rgb(h):
    h = h.lstrip('#'); return tuple(_lin(int(h[i:i + 2], 16)) for i in (0, 2, 4))

_mats = {}
def mat(hexcol, rough=0.5, metal=0.0, alpha=1.0, name=None):
    """Principled material from an sRGB hex colour. Cached per (colour, rough, metal, alpha)."""
    key = (hexcol, rough, metal, alpha)
    if key in _mats: return _mats[key]
    m = bpy.data.materials.new(name or f'm_{hexcol.strip("#")}_{rough}_{metal}')
    m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; rgb = hex_rgb(hexcol)
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    m.diffuse_color = (*rgb, alpha); m.roughness = rough; m.metallic = metal
    _mats[key] = m; return m

# common materials
STEEL = lambda: mat('#d3d8dc', 0.3, 0.7)
BRUSHED = lambda: mat('#c4c9cd', 0.38, 0.65)
ALU = lambda: mat('#b8bcc0', 0.45, 0.85)
BRASS = lambda: mat('#d1a646', 0.32, 0.75)
WOOD = lambda: mat('#9a6233', 0.65)
DARKWOOD = lambda: mat('#4a2a1a', 0.55)
BLACKPL = lambda: mat('#1d1f22', 0.45)
RUBBER = lambda: mat('#222426', 0.85)

def _link(ob, m=None):
    bpy.context.scene.collection.objects.link(ob)
    if m is not None: ob.data.materials.append(m)
    return ob

def smooth(ob, angle=40):
    for p in ob.data.polygons: p.use_smooth = True
    return ob

def bevel(ob, width=0.001, segs=2, angle=35):
    m = ob.modifiers.new('bevel', 'BEVEL'); m.width = width; m.segments = segs; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(angle)
    m.harden_normals = False; return ob

def subsurf(ob, levels=1):
    m = ob.modifiers.new('sub', 'SUBSURF'); m.levels = levels; m.render_levels = levels; return ob

def solidify(ob, t, offset=0.0):
    m = ob.modifiers.new('solid', 'SOLIDIFY'); m.thickness = t; m.offset = offset; return ob

def place(ob, loc=(0, 0, 0), rot=(0, 0, 0), scale=None):
    ob.location = loc; ob.rotation_euler = rot
    if scale: ob.scale = scale
    return ob

def lathe(name, profile, m, segs=48, close_bottom=True, close_top=False):
    """Surface of revolution about Z. profile = [(radius, z), ...] in order along the outline."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for r, z in profile:
        if r < 1e-6: rings.append([bm.verts.new((0, 0, z))] * segs)
        else: rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / segs), r * math.sin(2 * math.pi * i / segs), z)) for i in range(segs)])
    for a, b in zip(rings, rings[1:]):
        for i in range(segs):
            q = [a[i], a[(i + 1) % segs], b[(i + 1) % segs], b[i]]; uq = list(dict.fromkeys(q))
            if len(uq) >= 3:
                try: bm.faces.new(uq)
                except ValueError: pass
    if close_bottom and len(set(rings[0])) > 1: bm.faces.new(list(reversed(rings[0])))
    if close_top and len(set(rings[-1])) > 1: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = _link(bpy.data.objects.new(name, me), m); return smooth(ob)

def cyl(name, r, h, m, loc=(0, 0, 0), rot=(0, 0, 0), segs=32, r2=None):
    """Cylinder (or cone if r2) centred on its axis, axis along local Z, base at local z=0."""
    prof = [(0, 0), (r, 0), (r2 if r2 is not None else r, h), (0, h)]
    ob = lathe(name, prof, m, segs); ob.data.polygons.foreach_set('use_smooth', [False] * len(ob.data.polygons))
    for p in ob.data.polygons:
        if abs(p.normal.z) < 0.5: p.use_smooth = True
    return place(ob, loc, rot)

def rbox(name, sx, sy, sz, m, loc=(0, 0, 0), rot=(0, 0, 0), r=0.003, segs=3):
    """Rounded box: size sx,sy,sz, base at local z=0, centred in x/y."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts); bmesh.ops.translate(bm, vec=(0, 0, sz / 2), verts=bm.verts)
    bm.to_mesh(me); bm.free(); ob = _link(bpy.data.objects.new(name, me), m)
    if r > 0: bevel(ob, min(r, min(sx, sy, sz) / 2.1), segs, 30)
    return place(ob, loc, rot)

def sphere(name, r, m, loc=(0, 0, 0), scale=(1, 1, 1), segs=24):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=max(8, segs // 2), radius=r); bm.to_mesh(me); bm.free()
    ob = _link(bpy.data.objects.new(name, me), m); smooth(ob); return place(ob, loc, scale=scale)

def tube(name, pts, radius, m, closed=False, res=4, kind='BEZIER', taper=None):
    """Swept circular tube through points (smooth Bezier). Exporter converts to mesh."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = res; cu.use_fill_caps = True
    cu.resolution_u = 12
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1); sp.use_cyclic_u = closed
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    if taper:
        for bp, t in zip(sp.bezier_points, taper): bp.radius = t
    return _link(bpy.data.objects.new(name, cu), m)

def prism(name, pts, depth, m, plane='XY', loc=(0, 0, 0), rot=(0, 0, 0), bev=0.0006, centred=True):
    """Extrude a 2D outline. plane 'XY': outline in x,y, thickness along +z.  'XZ': outline in x,z (upright, seen from front -Y), thickness along y."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    off = -depth / 2 if centred else 0.0
    if plane == 'XY': vs = [bm.verts.new((a, b, off)) for a, b in pts]; d = Vector((0, 0, depth))
    else: vs = [bm.verts.new((a, -off, b)) for a, b in pts]; d = Vector((0, -depth, 0))
    f = bm.faces.new(vs); res = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=d, verts=[e for e in res['geom'] if isinstance(e, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = _link(bpy.data.objects.new(name, me), m)
    if bev: bevel(ob, bev, 2, 30)
    return place(ob, loc, rot)

def surface(name, fn, nu, nv, m, thickness=0.0, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Parametric sheet fn(u,v)->(x,y,z) for u,v in [0,1]; optional solidify thickness."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    g = [[bm.verts.new(fn(i / nu, j / nv)) for j in range(nv + 1)] for i in range(nu + 1)]
    for i in range(nu):
        for j in range(nv): bm.faces.new((g[i][j], g[i + 1][j], g[i + 1][j + 1], g[i][j + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = _link(bpy.data.objects.new(name, me), m); smooth(ob)
    if thickness: solidify(ob, thickness)
    return place(ob, loc, rot)

def text(name, s, size, m, loc=(0, 0, 0), rot=(math.pi / 2, 0, 0), depth=0.0003, align='CENTER'):
    """Raised text (front view by default: reads from -Y). Converted to mesh on export."""
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = s; cu.size = size; cu.extrude = depth; cu.align_x = align; cu.align_y = 'CENTER'
    ob = _link(bpy.data.objects.new(name, cu), m); return place(ob, loc, rot)

def circle_pts(rx, ry=None, n=32, a0=0.0, a1=2 * math.pi, cx=0.0, cy=0.0):
    ry = rx if ry is None else ry
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + (0 if a1 - a0 >= 2 * math.pi - 1e-6 else 1))]
