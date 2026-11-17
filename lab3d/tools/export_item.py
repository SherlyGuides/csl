"""Build one catalogue item in Blender from its script, normalise it, export a GLB and a preview render.

Usage (from lab3d/):
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/export_item.py -- blender/item_46.py

The item script must define:
  SNO  = 46               # catalogue S.No
  WALL = False            # True for wall-mounted items (back face goes flush to the wall)
  def build(): ...        # creates the objects in the current scene. Metres, Z up,
                          # FRONT OF THE ITEM FACES -Y (Blender front view), item sits on z=0.
Outputs:
  models/item-<SNO>.glb           (Y-up glTF: front faces +Z, origin bottom-centre)
  models/preview/item-<SNO>.png   (3/4 view on a 10 cm grid, for checking against the catalogue photo)
  models/manifest.json            (list of every exported item, rebuilt each run)
"""
import bpy, sys, os, json, math, runpy, glob
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = sys.argv[sys.argv.index('--') + 1]
script = script if os.path.isabs(script) else os.path.join(ROOT, script)

bpy.ops.wm.read_factory_settings(use_empty=True)
sys.path.insert(0, os.path.dirname(script))
ns = runpy.run_path(script)
SNO, WALL = int(ns['SNO']), bool(ns.get('WALL', False))
ns['build']()
bpy.context.view_layer.update()

objs = [o for o in bpy.context.scene.objects if o.type in {'MESH', 'CURVE', 'SURFACE', 'META', 'FONT'}]
if not objs:
    raise SystemExit(f'item {SNO}: build() created no geometry')

# convert curves/text to meshes so they export and bound correctly
for o in objs:
    if o.type != 'MESH':
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.convert(target='MESH')
bpy.context.view_layer.update()
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']

def world_bbox(objs):
    dg = bpy.context.evaluated_depsgraph_get(); lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
    for o in objs:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            w = ev.matrix_world @ v.co; lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
        ev.to_mesh_clear()
    return lo, hi

lo, hi = world_bbox(meshes)
# normalise: centred on x, resting on z=0; y centred (floor/table items) or back face at y=0 (wall items, body toward -y)
root = bpy.data.objects.new('item_%d' % SNO, None); bpy.context.scene.collection.objects.link(root)
for o in meshes:
    if o.parent is None:
        o.parent = root
dy = -hi.y if WALL else -(lo.y + hi.y) / 2
root.location = (-(lo.x + hi.x) / 2, dy, -lo.z)
bpy.context.view_layer.update()
lo, hi = world_bbox(meshes)
size = hi - lo
tris = 0
dg = bpy.context.evaluated_depsgraph_get()
for o in meshes:
    me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles); o.evaluated_get(dg).to_mesh_clear()

os.makedirs(os.path.join(ROOT, 'models', 'preview'), exist_ok=True)
out = os.path.join(ROOT, 'models', f'item-{SNO}.glb')
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True,
                          export_cameras=False, export_lights=False, export_image_format='AUTO')

# preview: workbench 3/4 view on a 10 cm grid
sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'
sc.display.shading.show_shadows = True; sc.display.shading.show_cavity = True
sc.render.resolution_x = sc.render.resolution_y = 768; sc.render.film_transparent = False
sc.world = sc.world or bpy.data.worlds.new('w')
ext = max(size.x, size.y, 0.2) * 1.2
bpy.ops.mesh.primitive_grid_add(x_subdivisions=int(ext * 2 / 0.1) + 1, y_subdivisions=int(ext * 2 / 0.1) + 1, size=ext * 2)
grid = bpy.context.active_object; grid.location.z = -0.0005
gm = bpy.data.materials.new('grid'); gm.diffuse_color = (0.85, 0.83, 0.8, 1); grid.data.materials.append(gm)
mod = grid.modifiers.new('wire', 'WIREFRAME'); mod.thickness = 0.002; mod.use_replace = False
cam_d = max(size.length, 0.25) * 1.9
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
centre = Vector((0, -size.y / 2 if WALL else 0, size.z / 2))
cam.location = centre + Vector((cam_d * 0.6, -cam_d * 0.75, cam_d * 0.45))
cam.rotation_euler = (centre - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 50
sc.render.filepath = os.path.join(ROOT, 'models', 'preview', f'item-{SNO}.png')
bpy.ops.render.render(write_still=True)

# manifest of everything exported so far
items = sorted(int(os.path.basename(p)[5:-4]) for p in glob.glob(os.path.join(ROOT, 'models', 'item-*.glb')))
with open(os.path.join(ROOT, 'models', 'manifest.json'), 'w') as f:
    json.dump({'items': items}, f)

print(f'EXPORTED item {SNO}: {size.x*100:.1f} x {size.z*100:.1f} x {size.y*100:.1f} cm (W x H x D), {tris} tris, {os.path.getsize(out)/1024:.0f} KB -> {out}')
