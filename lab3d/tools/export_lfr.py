"""Export the finished Grade 3 Session 8 Line Following Robot (fully assembled) as lab3d/models/lfr.glb.
Usage: Blender -b "<...>/G3_S8_Line_Following_Robot_Build_v002_REVIEW.blend" -P tools/export_lfr.py
The source .blend is opened read-only in a background session and never saved."""
import bpy, math, os
from mathutils import Vector, Matrix

OUT = '/Users/happyguy/Desktop/csl/lab3d/models/lfr.glb'
sc = bpy.context.scene
sc.frame_set(int(sc.get('build_end') or 18200))          # end of the build = robot fully assembled, before the demo spin
col = bpy.data.collections['Line_Following_Robot']
objs = list(col.all_objects)
bpy.context.view_layer.update()

def centre(names):
    pts = [bpy.data.objects[n].matrix_world.translation for n in names if n in bpy.data.objects]
    return sum(pts, Vector()) / len(pts)

wheels = centre(['Wheel 1', 'Wheel 2'])
front = centre(['Beam 3', 'Pin 21', 'Pin 22'])             # the range (IR) sensors mount on Beam 3: the nose of the robot
fwd = (front - wheels); fwd.z = 0; fwd.normalize()

# bake every object's current world matrix, drop animation, so the export is the assembled pose
mats = {o.name: o.matrix_world.copy() for o in objs}
for o in objs:
    o.animation_data_clear(); o.parent = None
for o in objs:
    o.matrix_world = mats[o.name]
bpy.context.view_layer.update()

# root: rotate so the nose points to -Y (Blender front = glTF +Z), scale cm -> m
ang = math.atan2(fwd.x, -fwd.y)                            # angle from -Y to fwd
root = bpy.data.objects.new('line_follower', None); sc.collection.objects.link(root)
for o in objs: o.parent = root
root.rotation_euler.z = -ang
root.scale = (0.01, 0.01, 0.01)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get(); lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
for o in objs:
    if o.type != 'MESH': continue
    for c in o.evaluated_get(dg).bound_box:
        w = o.matrix_world @ Vector(c); lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
root.location = (-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z)
bpy.context.view_layer.update()

bpy.ops.object.select_all(action='DESELECT')
for o in objs + [root]: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                          export_animations=False, export_cameras=False, export_lights=False)
sz = hi - lo
print(f'EXPORTED line follower: {sz.x*100:.1f} x {sz.z*100:.1f} x {sz.y*100:.1f} cm (W x H x L), {os.path.getsize(OUT)//1024} KB, nose dir {tuple(round(v,2) for v in fwd)}')
