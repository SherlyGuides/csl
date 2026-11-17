"""Item 12 — Plastic bucket, 15 L (Agriculture). Example/template for item scripts.
Real size: rim Ø 32 cm, base Ø 25 cm, height 30 cm (≈15.5 L brim-full). Blue HDPE, steel wire bail handle with grip.
Conventions: metres, Z up, front faces -Y, sits on z=0 (tools/export_item.py normalises origin and exports)."""
import bpy, math

SNO = 12
WALL = False

def mat(name, rgb, rough=0.45, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if alpha < 1: b.inputs['Alpha'].default_value = alpha
    m.diffuse_color = (*rgb, alpha)  # used by workbench preview
    return m

def lathe(name, profile, segs=64, material=None):
    """profile: list of (radius, z) from bottom-centre outward/up; builds a closed surface of revolution."""
    import bmesh
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rings = []
    for r, z in profile:
        ring = [bm.verts.new((r * math.cos(2 * math.pi * i / segs), r * math.sin(2 * math.pi * i / segs), z)) for i in range(segs)]
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(segs):
            bm.faces.new((a[i], a[(i + 1) % segs], b[(i + 1) % segs], b[i]))
    bm.faces.new(list(reversed(rings[0])))
    bm.normal_update(); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    if material: me.materials.append(material)
    for p in me.polygons: p.use_smooth = True
    return ob

def build():
    blue = mat('bucket_blue', (0.05, 0.32, 0.78), 0.4)
    steel = mat('wire', (0.75, 0.76, 0.78), 0.3, 1.0)
    grip = mat('grip', (0.04, 0.2, 0.55), 0.5)
    # wall with thickness: outer up, lip roll, inner down
    prof = [(0.0, 0.0), (0.118, 0.0), (0.125, 0.006), (0.128, 0.02), (0.157, 0.285), (0.163, 0.288), (0.166, 0.296), (0.163, 0.302),
            (0.155, 0.302), (0.151, 0.29), (0.122, 0.022), (0.115, 0.012), (0.0, 0.012)]
    lathe('bucket', prof, 72, blue)
    # handle lugs
    for s in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.02, location=(s * 0.16, 0, 0.265), rotation=(0, math.pi / 2, 0))
        o = bpy.context.active_object; o.data.materials.append(blue)
    # wire bail as a curve
    cu = bpy.data.curves.new('bail', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0028; cu.bevel_resolution = 3
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
    pts = [(-0.172, 0, 0.265), (0, -0.0, 0.43), (0.172, 0, 0.265)]
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new('bail', cu); bpy.context.scene.collection.objects.link(ob); cu.materials.append(steel)
    # plastic grip on the bail
    bpy.ops.mesh.primitive_cylinder_add(radius=0.011, depth=0.11, location=(0, 0, 0.428), rotation=(0, math.pi / 2, 0), vertices=24)
    o = bpy.context.active_object; o.data.materials.append(grip)
    bpy.ops.object.shade_smooth()
