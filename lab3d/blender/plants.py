"""Leafy plants as single meshes (cupped, drooping leaves) for pots, trays and the NFT rack."""
import math, random, bmesh, bpy
from _lib import mat

def rosette(name, loc=(0, 0, 0), radius=0.07, n=9, height=0.05, seed=0, palette=('#5aa83a', '#76bf45', '#3f8f2f'), stem='#4f7d2a', nu=5, nv=3):
    """Lettuce/basil-like rosette: n leaves spiralling out from a short stem, each a cupped, drooping blade."""
    rnd = random.Random(seed)
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    mats = [mat(c, 0.62) for c in palette] + [mat(stem, 0.7)]
    for k in range(n):
        ang = k * 2.39996 + rnd.uniform(-0.2, 0.2)              # golden-angle spiral
        L = radius * rnd.uniform(0.7, 1.05) * (0.65 + 0.35 * k / max(1, n - 1))
        W = L * rnd.uniform(0.55, 0.75)
        tilt = math.radians(rnd.uniform(35, 65)) * (1.15 - 0.4 * k / n)
        z0 = height * (0.15 + 0.5 * (1 - k / n))
        verts = []
        for i in range(nu + 1):
            u = i / nu; row = []
            hw = W / 2 * math.sin(math.pi * min(1.0, u * 1.05)) ** 0.75
            for j in range(nv + 1):
                v = j / nv * 2 - 1; x = v * hw
                r = u * L * math.cos(tilt); z = z0 + u * L * math.sin(tilt) - (u ** 2) * L * 0.45 + (v * v) * hw * 0.35
                cx, cy = r * math.cos(ang) - x * math.sin(ang), r * math.sin(ang) + x * math.cos(ang)
                row.append(bm.verts.new((loc[0] + cx, loc[1] + cy, loc[2] + z)))
            verts.append(row)
        mi = k % len(palette)
        for i in range(nu):
            for j in range(nv):
                f = bm.faces.new((verts[i][j], verts[i + 1][j], verts[i + 1][j + 1], verts[i][j + 1])); f.material_index = mi; f.smooth = True
    # short stem
    s0 = [bm.verts.new((loc[0] + 0.004 * math.cos(a), loc[1] + 0.004 * math.sin(a), loc[2])) for a in [i * math.pi / 3 for i in range(6)]]
    s1 = [bm.verts.new((loc[0] + 0.003 * math.cos(a), loc[1] + 0.003 * math.sin(a), loc[2] + height * 0.6)) for a in [i * math.pi / 3 for i in range(6)]]
    for i in range(6):
        f = bm.faces.new((s0[i], s0[(i + 1) % 6], s1[(i + 1) % 6], s1[i])); f.material_index = len(palette)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    for m_ in mats: me.materials.append(m_)
    for m_ in mats:
        try: m_.use_backface_culling = False
        except Exception: pass
    return ob
