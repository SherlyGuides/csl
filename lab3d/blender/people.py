"""Realistic students/teacher with MPFB (MakeHuman for Blender). Run inside Blender with MPFB + the
makehuman_system_assets pack installed. Order matters: shape the body first, then rig, then assets.

build_person(spec) -> rig object        pose_person(rig, pose)        export_person(rig, path, seat_back=0.04)
"""
import bpy, os, glob, math, numpy as np
from mathutils import Vector, Matrix, Quaternion
from bl_ext.blender_org.mpfb.entities.objectproperties import HumanObjectProperties as HOP
from bl_ext.blender_org.mpfb.services.targetservice import TargetService as TS
from bl_ext.blender_org.mpfb.services.locationservice import LocationService as LS

UD = LS.get_user_data()

def _sel(o):
    bpy.ops.object.select_all(action='DESELECT'); o.hide_set(False); o.select_set(True); bpy.context.view_layer.objects.active = o

def _asset(sub, name, ext):
    m = glob.glob(os.path.join(UD, sub, name, '*' + ext)); return m[0] if m else None

def _body_height(h):
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); ev = h.evaluated_get(dg); me = ev.to_mesh()
    zs = [(ev.matrix_world @ v.co).z for v in me.vertices]; ev.to_mesh_clear(); return max(zs) - min(zs)

def _pixels(img):
    W, H = img.size; return np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)

def _new_image(name, arr):
    H, W = arr.shape[:2]
    img = bpy.data.images.get(name) or bpy.data.images.new(name, W, H, alpha=True)
    if tuple(img.size) != (W, H): img.scale(W, H)
    img.pixels[:] = arr.ravel(); img.update(); img.pack(); return img

def _tex_node(mat):
    return mat.node_tree.nodes.get('diffuseTexture')

def _bsdf(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')

def _uv_mask(ob, W, H, classify):
    """Rasterise each face's UV triangle into a label mask using classify(face_center_world) -> label int."""
    me = ob.data; uv = me.uv_layers.active.data; mw = ob.matrix_world
    mask = np.zeros((H, W), dtype=np.uint8)
    co = [mw @ v.co for v in me.vertices]
    for p in me.polygons:
        c = sum((co[i] for i in p.vertices), Vector()) / len(p.vertices); val = classify(c, p)
        pts = [(uv[li].uv[0] * W, uv[li].uv[1] * H) for li in p.loop_indices]
        for k in range(1, len(pts) - 1):
            (x0, y0), (x1, y1), (x2, y2) = pts[0], pts[k], pts[k + 1]
            xmin, xmax = int(max(0, math.floor(min(x0, x1, x2)) - 1)), int(min(W - 1, math.ceil(max(x0, x1, x2)) + 1))
            ymin, ymax = int(max(0, math.floor(min(y0, y1, y2)) - 1)), int(min(H - 1, math.ceil(max(y0, y1, y2)) + 1))
            if xmax < xmin or ymax < ymin: continue
            xs, ys = np.meshgrid(np.arange(xmin, xmax + 1) + 0.5, np.arange(ymin, ymax + 1) + 0.5)
            d = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
            if abs(d) < 1e-9: continue
            a = ((y1 - y2) * (xs - x2) + (x2 - x1) * (ys - y2)) / d; b = ((y2 - y0) * (xs - x2) + (x0 - x2) * (ys - y2)) / d
            inside = (a >= -0.03) & (b >= -0.03) & (1 - a - b >= -0.03)
            mask[ymin:ymax + 1, xmin:xmax + 1][inside] = val
    return mask

def _blur(a, r):
    k = np.ones(2 * r + 1, dtype=np.float32) / (2 * r + 1)
    a = np.apply_along_axis(lambda x: np.convolve(x, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda x: np.convolve(x, k, mode='same'), 1, a)

def _fold_shade(px, r=5):
    """Low-frequency fabric shading (folds) without printed detail."""
    lum = 0.3 * px[..., 0] + 0.59 * px[..., 1] + 0.11 * px[..., 2]
    small = lum[::4, ::4]; sb = _blur(small, r)
    lb = np.kron(sb, np.ones((4, 4), dtype=np.float32))[:px.shape[0], :px.shape[1]]
    return lb

def _split_by_fabric(cloth_ob, px, waist_z):
    """Label each face 1 (top garment) or 2 (bottom garment) by clustering the original fabric colour, so the
    split follows the real hem of whatever outfit is used. Falls back to the waist height if colours are alike."""
    me = cloth_ob.data; uv = me.uv_layers.active.data; mw = cloth_ob.matrix_world; H, W = px.shape[:2]
    cols, zs = [], []
    for p in me.polygons:
        u = sum(uv[l].uv[0] for l in p.loop_indices) / p.loop_total; v = sum(uv[l].uv[1] for l in p.loop_indices) / p.loop_total
        cols.append(px[min(H - 1, max(0, int(v * H))), min(W - 1, max(0, int(u * W))), :3]); zs.append((mw @ p.center).z)
    cols = np.array(cols); zs = np.array(zs)
    # 2-means on colour, seeded with the faces well above / below the waist
    c1 = cols[zs > waist_z + 0.1].mean(0) if (zs > waist_z + 0.1).any() else cols.mean(0)
    c2 = cols[zs < waist_z - 0.15].mean(0) if (zs < waist_z - 0.15).any() else cols.mean(0)
    for _ in range(8):
        lab = np.where(((cols - c1) ** 2).sum(1) <= ((cols - c2) ** 2).sum(1), 1, 2)
        if (lab == 1).any(): c1 = cols[lab == 1].mean(0)
        if (lab == 2).any(): c2 = cols[lab == 2].mean(0)
    if np.abs(c1 - c2).sum() < 0.12 or (lab == 1).sum() == 0 or (lab == 2).sum() == 0:
        lab = np.where(zs > waist_z, 1, 2)
    elif zs[lab == 1].mean() < zs[lab == 2].mean():
        lab = 3 - lab
    # majority vote per UV island (each garment piece is its own island), so print/distress noise can't leak
    parent = list(range(len(me.polygons)))
    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    edge_faces = {}
    for p in me.polygons:
        for li in p.loop_indices:
            lp = me.loops[li]; e = lp.edge_index; vid = lp.vertex_index
            key = (e,)
            edge_faces.setdefault(e, []).append((p.index, vid, tuple(round(x, 5) for x in uv[li].uv)))
    for e, lst in edge_faces.items():
        if len(lst) < 2: continue
        f0 = {v: u for f, v, u in lst if f == lst[0][0]}
        for f, v, u in lst:
            if f == lst[0][0]: continue
        faces = {}
        for f, v, u in lst: faces.setdefault(f, {})[v] = u
        fl = list(faces.items())
        for i in range(1, len(fl)):
            (fa, ua), (fb, ub) = fl[0], fl[i]
            if all(ua.get(v) == ub.get(v) for v in ua):   # shared edge has identical UVs -> same island
                ra, rb = find(fa), find(fb)
                if ra != rb: parent[ra] = rb
    roots = np.array([find(i) for i in range(len(lab))]); out = lab.copy()
    for r in np.unique(roots):
        sel = roots == r
        out[sel] = 1 if (lab[sel] == 1).sum() >= (lab[sel] == 2).sum() else 2
    return {i: int(l) for i, l in enumerate(out)}

def uniform_repaint(cloth_ob, waist_z, top_rgb, bottom_rgb, tag, crest=None):
    mat = cloth_ob.data.materials[0]; tn = _tex_node(mat); src = tn.image
    px = _pixels(src); H, W = px.shape[:2]
    labels = _split_by_fabric(cloth_ob, px, waist_z)
    mask = _uv_mask(cloth_ob, W, H, lambda c, p: labels[p.index])
    out = px.copy()
    for lab, rgb, rng, r in ((1, top_rgb, (0.86, 1.02), 16), (2, bottom_rgb, (0.6, 1.25), 5)):
        sel = mask == lab
        if not sel.any(): continue
        lb = _fold_shade(px, r)
        ref = np.percentile(lb[sel], 75); sh = np.clip(lb / ref, *rng)[..., None]
        out[..., :3][sel] = (np.array(rgb, dtype=np.float32) * sh)[sel]
    # unlabeled texels (gutters) take the bottom colour so no stray original texture shows at seams
    out[..., :3][mask == 0] = np.array(bottom_rgb, dtype=np.float32)
    if crest: _stamp_crest(cloth_ob, out, crest, waist_z)
    tn.image = _new_image(f'{tag}_uniform', out)

CREST = os.path.join(os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else '/Users/happyguy/Desktop/csl/lab3d/blender', 'school-crest.png')

def _stamp_crest(cloth_ob, out, crest, waist_z, width_m=0.062):
    """Stamp the school crest on the wearer's left chest (+X), mapped through the shirt UVs so it sits flat and upright."""
    img = bpy.data.images.load(crest, check_existing=True); cw, chh = img.size
    cpx = np.array(img.pixels[:], dtype=np.float32).reshape(chh, cw, 4)
    me = cloth_ob.data; mw = cloth_ob.matrix_world; uv = me.uv_layers.active.data; H, W = out.shape[:2]
    co = [mw @ v.co for v in me.vertices]
    zs = [c.z for c in co]; top = max(zs)
    target_z = waist_z + (top - waist_z) * 0.62
    # front-most shirt face near the left-chest point
    best, bd = None, 1e9
    for p in me.polygons:
        c = sum((co[i] for i in p.vertices), Vector()) / len(p.vertices)
        nrm = (mw.to_3x3() @ p.normal).normalized()
        if nrm.y > -0.5 or c.z < waist_z: continue
        d = (c.x - 0.085) ** 2 + (c.z - target_z) ** 2
        if d < bd: bd, best = d, p
    if best is None: return
    li = list(best.loop_indices); vi = list(best.vertices)
    P0, P1, P2 = co[vi[0]], co[vi[1]], co[vi[2]]
    U0, U1, U2 = [Vector((uv[l].uv[0] * W, uv[l].uv[1] * H)) for l in li[:3]]
    # affine map world(x,z) -> texel(u,v) from this face
    A = np.array([[P1.x - P0.x, P2.x - P0.x], [P1.z - P0.z, P2.z - P0.z]]); Bm = np.array([[U1.x - U0.x, U2.x - U0.x], [U1.y - U0.y, U2.y - U0.y]])
    try: J = Bm @ np.linalg.inv(A)
    except np.linalg.LinAlgError: return
    centre = sum((co[i] for i in vi), Vector()) / len(vi); cu = U0 + Vector(J @ np.array([centre.x - P0.x, centre.z - P0.z]))
    Jinv = np.linalg.inv(J); half = width_m / 2
    corners = [J @ np.array([sx * half, sz * half]) for sx in (-1, 1) for sz in (-1, 1)]
    r = int(max(abs(c).max() for c in corners)) + 2
    for y in range(int(cu.y) - r, int(cu.y) + r + 1):
        if y < 0 or y >= H: continue
        for x in range(int(cu.x) - r, int(cu.x) + r + 1):
            if x < 0 or x >= W: continue
            dx, dz = Jinv @ np.array([x - cu.x, y - cu.y])
            # crest u runs with the wearer's right-to-left as seen from the front (-X -> +X mirrored), v up
            sx, sz = 0.5 + dx / width_m, 0.5 + dz / width_m
            if not (0 <= sx < 1 and 0 <= sz < 1): continue
            c = cpx[int(sz * chh), int(sx * cw)]
            a = c[3]
            if a > 0.02: out[y, x, :3] = out[y, x, :3] * (1 - a) + c[:3] * a

def tint_texture(mat, rgb, tag, rough=None):
    tn = _tex_node(mat); px = _pixels(tn.image); px[..., :3] *= np.array(rgb, dtype=np.float32)
    tn.image = _new_image(f'{tag}_{mat.name}', px)
    b = _bsdf(mat); b.inputs['Base Color'].default_value = (1, 1, 1, 1)
    mat.node_tree.links.new(tn.outputs['Color'], b.inputs['Base Color'])
    if rough is not None: b.inputs['Roughness'].default_value = rough
    for key in ('Specular IOR Level', 'Specular'):
        if key in b.inputs and rough is not None and rough >= 0.7: b.inputs[key].default_value = 0.12

def build_person(spec):
    """spec: name, girl(bool), age(macro 0..1), height_m, race(dict), weight, muscle, proportions,
    skin(str), skin_rgb(tint), hair(str), hair_rgb, brows(str), outfit(str), shoes(str),
    top_rgb, bottom_rgb, waist_z(fraction of height)"""
    before = set(bpy.data.objects)
    bpy.ops.mpfb.create_human(); h = bpy.context.active_object
    vals = {'gender': 0.0 if spec['girl'] else 1.0, 'age': spec['age'], 'muscle': spec.get('muscle', 0.45),
            'weight': spec.get('weight', 0.45), 'proportions': spec.get('proportions', 0.5)}
    vals.update(spec['race'])
    for k, v in vals.items(): HOP.set_value(k, v, entity_reference=h)
    lo, hi = 0.0, 1.0
    for _ in range(10):  # binary search the height macro for the target height (no clothes yet: basemesh is complete)
        mid = (lo + hi) / 2; HOP.set_value('height', mid, entity_reference=h); TS.reapply_macro_details(h)
        if _body_height(h) > spec['height_m']: hi = mid
        else: lo = mid
    body_h = _body_height(h)
    h.name = spec['name']
    bpy.context.scene.MPFB_ADR_standard_rig = 'game_engine'
    _sel(h); bpy.ops.mpfb.add_standard_rig(); rig = h.parent; rig.name = spec['name'] + '.rig'
    _sel(h); bpy.ops.mpfb.load_library_skin(filepath=_asset('skins', spec['skin'], '.mhmat'))
    for sub, name, typ in (('eyes', 'high-poly', 'Eyes'), ('eyebrows', spec['brows'], 'Eyebrows'), ('eyelashes', 'eyelashes02', 'Eyelashes'),
                           ('hair', spec['hair'], 'Hair'), ('clothes', spec['outfit'], 'Clothes'), ('clothes', spec['shoes'], 'Clothes')):
        _sel(h); bpy.ops.mpfb.load_library_clothes(filepath=_asset(sub, name, '.mhclo'), object_type=typ)
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    tag = spec['name']
    tint_texture(h.data.materials[0], spec['skin_rgb'], tag, rough=0.55)
    for o in new:
        n = o.name.lower()
        if spec['hair'] in n: tint_texture(o.data.materials[0], spec.get('hair_rgb', (0.55, 0.5, 0.48)), tag, rough=0.78)
        elif spec['outfit'] in n: uniform_repaint(o, body_h * spec.get('waist_z', 0.585), spec['top_rgb'], spec['bottom_rgb'], tag, crest=None if spec.get('no_crest') else CREST)
        elif spec['shoes'] in n: tint_texture(o.data.materials[0], spec.get('shoe_rgb', (0.16, 0.16, 0.17)), tag, rough=0.35)
    for o in new:
        for m in o.data.materials:
            if m and m.use_nodes:
                try: m.surface_render_method = 'DITHERED'
                except Exception: pass
    return rig

# ---------------- posing ----------------
def _turn(rig, name, axis, deg):
    pb = rig.pose.bones[name]; bpy.context.view_layer.update()
    M = pb.matrix.copy(); head = M.translation.copy()
    R = Quaternion(Vector(axis), math.radians(deg)).to_matrix().to_4x4()
    pb.matrix = Matrix.Translation(head) @ R @ Matrix.Translation(-head) @ M; bpy.context.view_layer.update()

def _aim(rig, name, target):
    pb = rig.pose.bones[name]; bpy.context.view_layer.update()
    cur = (pb.tail - pb.head).normalized(); q = cur.rotation_difference(Vector(target).normalized())
    M = pb.matrix.copy(); head = M.translation.copy()
    pb.matrix = Matrix.Translation(head) @ q.to_matrix().to_4x4() @ Matrix.Translation(-head) @ M; bpy.context.view_layer.update()

def _roll(rig, bone, deg):
    pb = rig.pose.bones[bone]; ax = (pb.tail - pb.head).normalized(); _turn(rig, bone, tuple(ax), deg)

def _curl(rig, side, deg, thumb=12):
    for f in ('index', 'middle', 'ring', 'pinky'):
        for i in ('01', '02', '03'): _turn(rig, f'{f}_{i}_{side}', (1, 0, 0), deg * (0.7 if i == '01' else 1.0))
    for i in ('02', '03'): _turn(rig, f'thumb_{i}_{side}', (0, 0, 1 if side == 'l' else -1), thumb)

def reset_pose(rig):
    _sel(rig); bpy.ops.object.mode_set(mode='POSE')
    for pb in rig.pose.bones: pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
    bpy.context.view_layer.update()

def pose_person(rig, pose):
    """Character faces -Y (Blender front). +X is the character's left."""
    reset_pose(rig); A = lambda n, t: _aim(rig, n, t); T = lambda n, ax, d: _turn(rig, n, ax, d)
    arms_down = lambda: (A('upperarm_l', (0.12, 0.02, -1)), A('upperarm_r', (-0.12, 0.02, -1)), A('lowerarm_l', (0.05, -0.12, -1)), A('lowerarm_r', (-0.05, -0.12, -1)))
    if pose in ('sit', 'sit_build', 'sit_type', 'sit_talk', 'sit_idle'):
        A('thigh_l', (0.07, -1, -0.03)); A('thigh_r', (-0.07, -1, -0.03))
        A('calf_l', (0.0, 0.06, -1)); A('calf_r', (0.0, 0.06, -1))
        A('foot_l', (0.0, -1, -0.3)); A('foot_r', (0.0, -1, -0.3))
        if pose == 'sit_idle':   # upright, forearm resting forward for a BP cuff
            T('neck_01', (1, 0, 0), 2)
            A('upperarm_l', (0.15, -0.25, -1)); A('upperarm_r', (-0.15, -0.25, -1)); A('lowerarm_l', (-0.25, -1, -0.15)); A('lowerarm_r', (0.25, -1, -0.15))
            _curl(rig, 'l', 25); _curl(rig, 'r', 25)
        else:                   # forearms on a 0.74 m table whose edge is 0.27 m in front of the seat centre
            T('spine_01', (1, 0, 0), 14 if pose != 'sit_talk' else 9); T('neck_01', (1, 0, 0), 4)
            T('head', (1, 0, 0), 12 if pose != 'sit_talk' else 0)
            if pose == 'sit_talk': T('head', (0, 0, 1), 15)
            A('upperarm_l', (0.18, -1, -0.15)); A('upperarm_r', (-0.18, -1, -0.15))
            A('lowerarm_l', (-0.3, -1, 0.0)); A('lowerarm_r', (0.3, -1, 0.0))
            A('hand_l', (-0.25, -1, -0.25)); A('hand_r', (0.25, -1, -0.25))
            _roll(rig, 'lowerarm_l', 75); _roll(rig, 'lowerarm_r', -75)
            _curl(rig, 'l', 30, thumb=10); _curl(rig, 'r', 30, thumb=10)
    elif pose == 'counter':
        arms_down(); A('upperarm_l', (0.15, -0.55, -1)); A('upperarm_r', (-0.15, -0.55, -1))
        A('lowerarm_l', (-0.25, -1, 0.1)); A('lowerarm_r', (0.25, -1, 0.1)); T('neck_01', (1, 0, 0), 10); T('head', (1, 0, 0), 10)
        _roll(rig, 'lowerarm_l', 75); _roll(rig, 'lowerarm_r', -75)
        _curl(rig, 'l', 30); _curl(rig, 'r', 30)
    elif pose == 'kneel':
        A('thigh_l', (0.1, -0.05, -1)); A('thigh_r', (-0.1, -0.05, -1)); A('calf_l', (0, 1, -0.05)); A('calf_r', (0, 1, -0.05))
        A('foot_l', (0, 1, -0.6)); A('foot_r', (0, 1, -0.6))
        T('spine_01', (1, 0, 0), 22); T('spine_02', (1, 0, 0), 10); T('neck_01', (1, 0, 0), 10); T('head', (1, 0, 0), 12)
        A('upperarm_l', (0.08, -0.5, -1)); A('upperarm_r', (-0.08, -0.5, -1)); A('lowerarm_l', (-0.15, -0.3, -1)); A('lowerarm_r', (0.15, -0.3, -1))
        _curl(rig, 'l', 18); _curl(rig, 'r', 18)
    elif pose == 'kneel1':   # one knee down beside the arena, forearm on the raised knee, watching the robot
        A('thigh_l', (0.12, -0.12, -1)); A('calf_l', (0.02, 1, -0.06)); A('foot_l', (0, 1, -0.7))
        A('thigh_r', (-0.12, -1, -0.12)); A('calf_r', (0, 0.08, -1)); A('foot_r', (0, -1, -0.15))
        T('spine_01', (1, 0, 0), 14); T('spine_02', (1, 0, 0), 6); T('neck_01', (1, 0, 0), 8); T('head', (1, 0, 0), 14)
        A('upperarm_r', (-0.08, -0.55, -1)); A('lowerarm_r', (0.15, -1, -0.25))
        A('upperarm_l', (0.18, -0.35, -1)); A('lowerarm_l', (0.02, -0.55, -1))
        _curl(rig, 'l', 25); _curl(rig, 'r', 35)
    elif pose == 'point':
        arms_down(); A('upperarm_r', (-0.75, -0.55, 0.3)); A('lowerarm_r', (-0.8, -0.5, 0.35)); T('head', (0, 0, 1), -18)
        _curl(rig, 'r', 55); _turn(rig, 'index_01_r', (1, 0, 0), -45); _turn(rig, 'index_02_r', (1, 0, 0), -45); _turn(rig, 'index_03_r', (1, 0, 0), -40)
        _curl(rig, 'l', 25)
    elif pose == 'watch':
        arms_down(); A('upperarm_l', (0.25, -0.2, -1)); A('upperarm_r', (-0.25, -0.2, -1)); A('lowerarm_l', (-0.6, -0.8, 0.1)); A('lowerarm_r', (0.6, -0.8, 0.1))
        T('neck_01', (1, 0, 0), 12); _curl(rig, 'l', 35); _curl(rig, 'r', 35)
    elif pose == 'reach':
        arms_down(); A('upperarm_r', (-0.15, -1, -0.45)); A('lowerarm_r', (-0.05, -1, -0.15)); T('neck_01', (1, 0, 0), 8); _curl(rig, 'r', 45); _curl(rig, 'l', 20)
    else:  # stand
        arms_down(); _curl(rig, 'l', 20); _curl(rig, 'r', 20)
    bpy.ops.object.mode_set(mode='OBJECT')

def export_person(rig, path, seat_back=0.04, origin='pelvis'):
    """Bake the posed character into a static GLB. Origin: under the pelvis (seated: the seat point, `seat_back` m
    behind it) or under the feet; lowest point at y=0; front = glTF +Z."""
    parts = [o for o in rig.children_recursive if o.type == 'MESH']
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); minz = 1e9
    for o in parts:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices: minz = min(minz, (ev.matrix_world @ v.co).z)
        ev.to_mesh_clear()
    pel = rig.matrix_world @ rig.pose.bones['pelvis'].head
    old = rig.location.copy(); rig.location = old + Vector((-pel.x, -pel.y + seat_back, -minz)); bpy.context.view_layer.update()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts + [rig]: o.hide_set(False); o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True, export_skins=False,
                              export_animations=False, export_yup=True, export_cameras=False, export_lights=False)
    rig.location = old; bpy.context.view_layer.update()
    return round(pel.z - minz, 3)

# ---------------- accessories (added at rest pose, then they follow any pose) ----------------
def _mat(name, rgb, rough=0.5, metal=0.0, alpha=1.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True
    b = _bsdf(m); b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    return m

def _bone_parent(ob, rig, bone):
    mw = ob.matrix_world.copy(); ob.parent = rig; ob.parent_type = 'BONE'; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw

def _world_bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi

def _part(rig, key):
    return next(o for o in rig.children_recursive if o.type == 'MESH' and key in o.name)

def add_accessory(rig, kind, color=(0.94, 0.49, 0.22)):
    """kind: goggles | headphones | apron. Returns the created objects (delete them to remove)."""
    reset_pose(rig); bpy.ops.object.mode_set(mode='OBJECT'); bpy.context.view_layer.update()
    eyes = _part(rig, 'high-poly'); elo, ehi = _world_bbox(eyes); ec = (elo + ehi) / 2
    made = []
    def add(ob): bpy.context.scene.collection.objects.link(ob) if ob.name not in bpy.context.scene.collection.objects else None; made.append(ob); return ob
    if kind == 'goggles':
        w = (ehi.x - elo.x) + 0.06
        bpy.ops.mesh.primitive_cube_add(size=1, location=(ec.x, elo.y - 0.022, ec.z)); lens = bpy.context.active_object
        lens.scale = (w, 0.012, 0.042); lens.name = rig.name + '_goggle_lens'
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bev = lens.modifiers.new('b', 'BEVEL'); bev.width = 0.008; bev.segments = 3
        lens.data.materials.append(_mat('goggle_lens', (0.62, 0.84, 0.95), 0.08, 0.0, 0.45)); made.append(lens)
        for gob in (lens,):
            sd = gob.modifiers.new('bend', 'SIMPLE_DEFORM'); sd.deform_method = 'BEND'; sd.deform_axis = 'Z'; sd.angle = math.radians(-75)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(ec.x, elo.y - 0.016, ec.z)); fr = bpy.context.active_object
        fr.scale = (w + 0.008, 0.016, 0.05); fr.name = rig.name + '_goggle_frame'
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        sol = fr.modifiers.new('b', 'BEVEL'); sol.width = 0.01; sol.segments = 3
        wf = fr.modifiers.new('w', 'WIREFRAME'); wf.thickness = 0.006
        sdf = fr.modifiers.new('bend', 'SIMPLE_DEFORM'); sdf.deform_method = 'BEND'; sdf.deform_axis = 'Z'; sdf.angle = math.radians(-75)
        fr.data.materials.append(_mat('goggle_frame', (0.12, 0.38, 0.58), 0.45)); made.append(fr)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.088, minor_radius=0.005, location=(ec.x, elo.y + 0.075, ec.z + 0.004)); st = bpy.context.active_object
        st.scale = (1.0, 1.08, 1.0); st.name = rig.name + '_goggle_strap'; st.data.materials.append(_mat('goggle_strap', (0.1, 0.24, 0.4), 0.7)); made.append(st)
        for o in made: _bone_parent(o, rig, 'head')
    elif kind == 'headphones':
        cz = ec.z - 0.012; cy = elo.y + 0.085
        for s in (-1, 1):
            bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.028, location=(ec.x + s * 0.083, cy, cz), rotation=(0, math.pi / 2, 0)); cup = bpy.context.active_object
            cup.name = rig.name + f'_cup{s}'; cup.data.materials.append(_mat('headset', (0.08, 0.08, 0.09), 0.5)); made.append(cup)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.09, minor_radius=0.008, location=(ec.x, cy, cz + 0.012), rotation=(0, math.pi / 2, 0)); band = bpy.context.active_object
        band.name = rig.name + '_band'; band.scale = (1, 1, 1.15); band.data.materials.append(_mat('headset', (0.08, 0.08, 0.09), 0.5)); made.append(band)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.11, location=(ec.x + 0.07, cy - 0.06, cz - 0.04), rotation=(1.2, 0, -0.35)); boom = bpy.context.active_object
        boom.name = rig.name + '_boom'; boom.data.materials.append(_mat('headset', (0.08, 0.08, 0.09), 0.5)); made.append(boom)
        for o in made: _bone_parent(o, rig, 'head')
    elif kind == 'apron':
        cloth = next(o for o in rig.children_recursive if o.type == 'MESH' and 'suit' in o.name)
        clo, chi = _world_bbox(cloth); H = chi.z
        top, bot = H * 0.80, H * 0.40; wb, ws = 0.24, 0.40          # bib width, skirt width
        bpy.ops.mesh.primitive_grid_add(x_subdivisions=14, y_subdivisions=24, size=1, location=(0, 0, 0)); ap = bpy.context.active_object
        ap.name = rig.name + '_apron'; me = ap.data
        for v in me.vertices:
            u, t = v.co.x + 0.5, v.co.y + 0.5                       # u across, t up
            z = bot + (top - bot) * t; frac = (z - bot) / (top - bot)
            width = ws if frac < 0.55 else wb + (ws - wb) * max(0, (0.75 - frac) / 0.2)
            v.co = Vector(((u - 0.5) * width, clo.y - 0.05, z))
        sw = ap.modifiers.new('wrap', 'SHRINKWRAP'); sw.target = cloth; sw.wrap_method = 'PROJECT'; sw.use_project_y = True
        sw.use_negative_direction = True; sw.use_positive_direction = True; sw.offset = 0.006
        bpy.context.view_layer.objects.active = ap; bpy.ops.object.modifier_apply(modifier='wrap')
        sol = ap.modifiers.new('s', 'SOLIDIFY'); sol.thickness = 0.003
        ap.data.materials.append(_mat('apron_' + '%.2f' % color[0], color, 0.85))
        # skin it like the shirt so it bends with the pose
        dt = ap.modifiers.new('dt', 'DATA_TRANSFER'); dt.object = cloth; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
        dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
        bpy.context.view_layer.objects.active = ap
        bpy.ops.object.datalayout_transfer(modifier='dt'); bpy.ops.object.modifier_apply(modifier='dt')
        ap.parent = rig; am = ap.modifiers.new('arm', 'ARMATURE'); am.object = rig
        made.append(ap)
    for o in made:
        for p in o.data.polygons: p.use_smooth = True
    return made

def remove_accessories(objs):
    for o in objs: bpy.data.objects.remove(o, do_unlink=True)
