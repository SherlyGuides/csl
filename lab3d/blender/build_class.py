"""Build the realistic class with MPFB: 8 students + teacher, each posed for the scenes main.js uses.
Writes models/people/<variant>_<pose>.glb and models/people/index.json (kid index -> file + right-hand point).
Run inside Blender (live or `Blender -b -P`, with MPFB and the system asset pack installed)."""
import bpy, os, json, importlib, sys
P = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else '/Users/happyguy/Desktop/csl/lab3d/blender'
if P not in sys.path: sys.path.insert(0, P)
import people; importlib.reload(people)
OUT = os.path.join(os.path.dirname(P), 'models', 'people')
WHITE, NAVY, BLACK = (0.94, 0.95, 0.97), (0.045, 0.06, 0.13), (0.12, 0.12, 0.13)
IND = lambda a, af, c: {'asian': a, 'african': af, 'caucasian': c}
G = dict(girl=True, outfit='female_casualsuit01', shoes='shoes02', top_rgb=WHITE, bottom_rgb=NAVY, shoe_rgb=BLACK, eyes_ok=True)
B = dict(girl=False, outfit='male_casualsuit06', shoes='shoes01', top_rgb=WHITE, bottom_rgb=NAVY, shoe_rgb=BLACK)
VARIANTS = {
    'g1': dict(G, age=0.22, height_m=1.52, race=IND(0.60, 0.22, 0.18), weight=0.42, muscle=0.42, proportions=0.45, skin='young_asian_female', skin_rgb=(0.80, 0.60, 0.47), hair='braid01', hair_rgb=(0.32, 0.28, 0.26), brows='eyebrow006'),
    'g2': dict(G, age=0.24, height_m=1.55, race=IND(0.50, 0.32, 0.18), weight=0.48, muscle=0.40, proportions=0.50, skin='young_african_female', skin_rgb=(1.20, 1.00, 0.88), hair='ponytail01', hair_rgb=(0.30, 0.26, 0.24), brows='eyebrow002'),
    'g3': dict(G, age=0.20, height_m=1.48, race=IND(0.62, 0.18, 0.20), weight=0.40, muscle=0.40, proportions=0.42, skin='young_asian_female', skin_rgb=(0.86, 0.66, 0.52), hair='bob02', hair_rgb=(0.28, 0.25, 0.23), brows='eyebrow004'),
    'g4': dict(G, age=0.25, height_m=1.58, race=IND(0.45, 0.35, 0.20), weight=0.46, muscle=0.44, proportions=0.52, skin='young_african_female', skin_rgb=(1.08, 0.90, 0.78), hair='ponytail01', hair_rgb=(0.26, 0.23, 0.21), brows='eyebrow009'),
    'b1': dict(B, age=0.22, height_m=1.55, race=IND(0.58, 0.24, 0.18), weight=0.45, muscle=0.48, proportions=0.45, skin='young_asian_male', skin_rgb=(0.78, 0.58, 0.45), hair='short02', hair_rgb=(0.30, 0.27, 0.25), brows='eyebrow001'),
    'b2': dict(B, age=0.25, height_m=1.62, race=IND(0.45, 0.35, 0.20), weight=0.50, muscle=0.50, proportions=0.50, skin='young_african_male', skin_rgb=(1.12, 0.94, 0.82), hair='short04', hair_rgb=(0.28, 0.25, 0.23), brows='eyebrow003'),
    'b3': dict(B, age=0.20, height_m=1.50, race=IND(0.62, 0.20, 0.18), weight=0.44, muscle=0.44, proportions=0.42, skin='young_asian_male', skin_rgb=(0.85, 0.64, 0.50), hair='short01', hair_rgb=(0.30, 0.27, 0.25), brows='eyebrow007'),
    'b4': dict(B, age=0.26, height_m=1.66, race=IND(0.50, 0.30, 0.20), weight=0.52, muscle=0.52, proportions=0.52, skin='young_african_male', skin_rgb=(1.00, 0.84, 0.72), hair='short03', hair_rgb=(0.27, 0.24, 0.22), brows='eyebrow005'),
    'tch': dict(girl=True, outfit='female_elegantsuit01', shoes='shoes04', top_rgb=(0.93, 0.50, 0.23), bottom_rgb=(0.14, 0.14, 0.17), shoe_rgb=(0.22, 0.14, 0.10),
                age=0.47, height_m=1.60, race=IND(0.55, 0.27, 0.18), weight=0.52, muscle=0.45, proportions=0.6, skin='young_asian_female', skin_rgb=(0.82, 0.62, 0.50), hair='bob01', hair_rgb=(0.25, 0.22, 0.20), brows='eyebrow010', waist_z=0.50),
}
# kid index in main.js order -> (variant, pose, seat_back)
ASSIGN = [
    ('g1', 'sit_build'), ('b1', 'sit_build'), ('g2', 'sit_build'), ('b2', 'sit_build'),            # table 0
    ('g3', 'sit_build'), ('b3', 'sit_build'), ('g4', 'sit_build'), ('b4', 'sit_build'),            # table 1
    ('g2', 'sit_build'), ('b1', 'sit_build'), ('g3', 'sit_build'),                                 # table 2
    ('b4', 'sit_build'), ('g4', 'sit_build'), ('b2', 'sit_build'),                                 # table 3
    ('g1', 'sit_talk'), ('b3', 'sit_talk'), ('g4', 'sit_talk'),                                    # BFSI table
    ('b1', 'kneel1'), ('g2', 'watch'),                                                              # arena
    ('b4', 'counter'),                                                                             # build bench
    ('b2', 'sit_type'),                                                                            # AI computer (stool)
    ('g3', 'counter'), ('g1', 'counter'),                                                          # kitchen
    ('g4', 'kneel'), ('b3', 'sit_idle'), ('g2', 'counter'),                                        # healthcare
    ('b1', 'reach'),                                                                               # watering
    ('tch', 'point'),                                                                              # teacher
]
SEATED = {'sit_build', 'sit_talk', 'sit_type', 'sit_idle'}

def hand_point(rig, seat_back):
    """Right-hand grip point in the exported GLB's coordinates (glTF: x, y up, z forward)."""
    parts = [o for o in rig.children_recursive if o.type == 'MESH']
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); minz = 1e9
    for o in parts:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices: minz = min(minz, (ev.matrix_world @ v.co).z)
        ev.to_mesh_clear()
    pel = rig.matrix_world @ rig.pose.bones['pelvis'].head
    h = rig.matrix_world @ rig.pose.bones['hand_r'].tail
    x, y, z = h.x - pel.x, h.y - pel.y + seat_back, h.z - minz
    return [round(x, 3), round(z, 3), round(-y, 3)]

def run(only=None):
    os.makedirs(OUT, exist_ok=True)
    needed = {}
    for v, p in ASSIGN: needed.setdefault(v, []).append(p) if p not in needed.get(v, []) else None
    files = {}
    for v, poses in needed.items():
        if only and v not in only: continue
        old = bpy.data.objects.get(v + '.rig')
        if old:
            for c in list(old.children_recursive): bpy.data.objects.remove(c, do_unlink=True)
            bpy.data.objects.remove(old, do_unlink=True)
        spec = dict(VARIANTS[v], name=v)
        rig = people.build_person(spec)
        for p in poses:
            sb = 0.04 if p in SEATED else 0.0
            people.pose_person(rig, p)
            hp = hand_point(rig, sb)
            path = os.path.join(OUT, f'{v}_{p}.glb')
            people.export_person(rig, path, seat_back=sb)
            files[(v, p)] = {'file': f'{v}_{p}.glb', 'hand_r': hp}
            print('exported', v, p, os.path.getsize(path) // 1024, 'KB')
        for c in list(rig.children_recursive): c.hide_set(True)
        rig.hide_set(True)
    idx_path = os.path.join(OUT, 'index.json')
    prev = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    kids = prev.get('kids', [None] * len(ASSIGN))
    for i, (v, p) in enumerate(ASSIGN):
        if (v, p) in files: kids[i] = files[(v, p)]
    json.dump({'kids': kids}, open(idx_path, 'w'), indent=1)
    return files
