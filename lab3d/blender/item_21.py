"""Item 21 — Weeding hook (khurpi), curved 5 in blade (spec). Upright (handle down, blade up), hangs head-down on the tool rail.
Turned sheesham-style handle 12 cm with grooved butt, black forged ferrule + neck, crescent blade forged thick at the spine
and tapering to a bright worn cutting edge on the outer curve. Overall ≈ 27 cm. Source: spec + catalogue photo."""
import math, bmesh, bpy
from _lib import *
SNO, WALL = 21, False

def crescent_blade(name, forged, edge, cx=-0.022, cz=0.205, rs=0.038, w_max=0.034, a0=-62, a1=158, nu=48, nv=8,
                   spine_t=0.0042, edge_t=0.0007):
    """Solid crescent: spine on the inner arc (radius rs), cutting edge on the outer arc (rs + w(t)).
    Lies in the XZ plane (faces -Y), thickness along Y tapers from spine to edge."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    def width(t):  # narrow at the root, widest at ~40 %, sharp point at the tip
        return 0.011 + (w_max - 0.011) * math.sin(math.pi * min(1, t * 1.15)) ** 0.9 * (1 - t ** 3) if t < 0.999 else 0.0
    rows = []
    for i in range(nu + 1):
        t = i / nu; a = math.radians(a0 + (a1 - a0) * t); w = width(t)
        row = []
        for j in range(nv + 1):
            s = j / nv; r = rs + w * s
            th = (spine_t + (edge_t - spine_t) * s ** 1.4) * (1 - 0.6 * t ** 2)
            x, z = cx + r * math.cos(a), cz + r * math.sin(a)
            row.append((bm.verts.new((x, -th / 2, z)), bm.verts.new((x, th / 2, z))))
        rows.append(row)
    faces_edge = []
    for i in range(nu):
        for j in range(nv):
            a, b, c, d = rows[i][j], rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]
            f1 = bm.faces.new((a[0], d[0], c[0], b[0])); f2 = bm.faces.new((a[1], b[1], c[1], d[1]))
            if j >= nv - 2: faces_edge += [f1, f2]
        # spine side and edge side walls
        bm.faces.new((rows[i][0][0], rows[i + 1][0][0], rows[i + 1][0][1], rows[i][0][1]))
        fe = bm.faces.new((rows[i][nv][0], rows[i][nv][1], rows[i + 1][nv][1], rows[i + 1][nv][0])); faces_edge.append(fe)
    # root cap
    bm.faces.new([rows[0][j][0] for j in range(nv + 1)] + [rows[0][j][1] for j in range(nv, -1, -1)])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.material_index = 0
    for f in faces_edge:
        if f.is_valid: f.material_index = 1
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    me.materials.append(forged); me.materials.append(edge)
    for p in me.polygons: p.use_smooth = True
    root = (cx + rs * math.cos(math.radians(a0)), cz + rs * math.sin(math.radians(a0)))
    return ob, root

def build():
    wood = mat('#8a4a24', 0.55)                     # oiled sheesham
    groove = mat('#4a2412', 0.6)
    forged = mat('#3a3d40', 0.62, 0.55)             # black forged steel
    edge = mat('#b8bdc1', 0.32, 0.7)                # sharpened bright edge
    # handle: turned, swelling to the palm, rounded butt with two grooves
    prof = [(0, 0), (0.009, 0.0), (0.0145, 0.003), (0.0165, 0.009), (0.0168, 0.014), (0.0152, 0.016), (0.0168, 0.018),
            (0.0168, 0.022), (0.0152, 0.024), (0.0168, 0.026), (0.0178, 0.06), (0.0172, 0.09), (0.0152, 0.112), (0.0135, 0.118), (0, 0.118)]
    lathe('handle', prof, wood, 40)
    for z in (0.016, 0.024):
        cyl('groove', 0.0153, 0.0018, groove, loc=(0, 0, z - 0.0009), segs=40)
    # ferrule: tapered forged collar
    lathe('ferrule', [(0, 0), (0.0142, 0), (0.0146, 0.004), (0.0118, 0.026), (0.0085, 0.032), (0, 0.032)], forged, 32)
    ferrule = bpy.data.objects['ferrule']; ferrule.location.z = 0.113
    blade, root = crescent_blade('blade', forged, edge)
    # forged neck from the ferrule into the blade root (square-ish section via low-res tube)
    tube('neck', [(0, 0, 0.142), (0, 0, 0.152), (root[0] * 0.5, 0, (0.152 + root[1]) / 2 + 0.004), (root[0], 0, root[1] + 0.002)], 0.0042, forged, res=1)
