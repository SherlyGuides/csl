"""Robotics tool wall: real tools hanging on the pegboard's own hooks (item 88, 1219 x 914 mm, hooks at
x = -0.48..0.48 step 0.24, rows y = +0.225 and -0.16 from the board centre, hook tip 0.07 m out).
Coordinates: X = along the board, Z = up (board centre = 0), -Y = out from the board face. Exported as-is.
Run: Blender -b --factory-startup -P blender/toolwall.py"""
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'toolwall.glb')
TOP, LOW, OUTY = 0.225, -0.16, -0.055       # hook rows and the depth where hung items sit

def hang_point(x, row):
    return x, OUTY, row - 0.012

def grip_handles(name, x, z, length, spread, c1, steel, jaw_len, jaw_w, jaw_kind):
    """Pliers-type tool hanging jaws-down from a hook: two handle arms opening slightly at the top."""
    # handles (from hook down to the pivot), PVC dipped grips
    for s in (-1, 1):
        tube(f'{name}_arm{s}', [(x + s * spread, OUTY, z), (x + s * spread * 0.55, OUTY, z - length * 0.5), (x + s * 0.006, OUTY, z - length)], 0.0055, c1)
        tube(f'{name}_steel{s}', [(x + s * 0.006, OUTY, z - length), (x + s * 0.004, OUTY, z - length - 0.012)], 0.004, steel)
    cyl(f'{name}_pivot', 0.007, 0.012, steel, loc=(x, OUTY + 0.006, z - length - 0.012), rot=(math.pi / 2, 0, 0), segs=16)
    jz = z - length - 0.016
    if jaw_kind == 'needle':
        prism(f'{name}_jaw', [(-0.006, 0), (0.006, 0), (0.0015, -jaw_len), (-0.0015, -jaw_len)], 0.008, steel, plane='XZ', loc=(x, OUTY, jz), bev=0.0006)
    elif jaw_kind == 'cutter':
        prism(f'{name}_jaw', [(-0.009, 0), (0.009, 0), (0.007, -jaw_len * 0.7), (0.0, -jaw_len), (-0.007, -jaw_len * 0.7)], 0.009, steel, plane='XZ', loc=(x, OUTY, jz), bev=0.0008)
    else:  # stripper: flat jaws with notches
        prism(f'{name}_jaw', [(-0.008, 0), (0.008, 0), (0.008, -jaw_len), (-0.008, -jaw_len)], 0.007, steel, plane='XZ', loc=(x, OUTY, jz), bev=0.0006)
        for i in range(4): cyl(f'{name}_notch{i}', 0.0012 + i * 0.0004, 0.0074, BLACKPL(), loc=(x - 0.002, OUTY - 0.0037, jz - 0.012 - i * 0.009), rot=(math.pi / 2, 0, 0), segs=8)

def build():
    steel, dark = mat('#c9ced2', 0.32, 0.72), mat('#34383c', 0.5, 0.4)
    red, blue, yellow, green, black = mat('#c8202a', 0.45), mat('#1f5fbf', 0.45), mat('#f2b51c', 0.45), mat('#2f8f45', 0.45), mat('#1c1d1f', 0.5)
    # ---------------- top row ----------------
    x, _, z = hang_point(-0.48, TOP); grip_handles('needlenose', x, z, 0.085, 0.02, red, steel, 0.06, 0.01, 'needle')
    x, _, z = hang_point(-0.24, TOP); grip_handles('cutter', x, z, 0.075, 0.019, blue, steel, 0.035, 0.012, 'cutter')
    x, _, z = hang_point(0.0, TOP); grip_handles('stripper', x, z, 0.09, 0.018, yellow, steel, 0.055, 0.012, 'stripper')
    # digital multimeter hung by its stand loop, probe leads coiled over the hook
    x, _, z = hang_point(0.24, TOP)
    rbox('dmm_case', 0.078, 0.034, 0.152, mat('#f2b51c', 0.5), loc=(x, OUTY + 0.002, z - 0.165), r=0.008)
    rbox('dmm_body', 0.066, 0.004, 0.138, black, loc=(x, OUTY - 0.016, z - 0.158), r=0.004)
    rbox('dmm_lcd', 0.052, 0.002, 0.03, mat('#b9cfa6', 0.3), loc=(x, OUTY - 0.0185, z - 0.058), r=0.002)
    text('dmm_digits', '9.02', 0.016, mat('#1b2a1b', 0.4), loc=(x, OUTY - 0.0196, z - 0.043), depth=0.0003)
    cyl('dmm_dial', 0.018, 0.006, mat('#2b2e31', 0.4), loc=(x, OUTY - 0.018, z - 0.105), rot=(math.pi / 2, 0, 0), segs=24)
    rbox('dmm_pointer', 0.004, 0.003, 0.016, mat('#f5f5f5', 0.4), loc=(x, OUTY - 0.0215, z - 0.105), r=0.0005)
    for i, (dx, c) in enumerate(((-0.018, black), (0.0, red), (0.018, red))):
        cyl(f'dmm_jack{i}', 0.0045, 0.004, c, loc=(x + dx, OUTY - 0.018, z - 0.145), rot=(math.pi / 2, 0, 0), segs=12)
    tube('dmm_loop', [(x - 0.012, OUTY + 0.004, z - 0.09), (x - 0.012, OUTY + 0.004, z + 0.004), (x + 0.012, OUTY + 0.004, z + 0.004), (x + 0.012, OUTY + 0.004, z - 0.09)], 0.002, black)
    for s, c in ((-1, red), (1, black)):
        pts = [(x + s * 0.01, OUTY - 0.02, z - 0.145)] + [(x + 0.055 + s * 0.012 + 0.03 * math.sin(t), OUTY - 0.01 - 0.004 * s, z - 0.12 - 0.05 * math.cos(t)) for t in [i * 0.6 for i in range(9)]]
        tube(f'dmm_lead{s}', pts, 0.0018, c)
        cyl(f'dmm_probe{s}', 0.004, 0.11, c, loc=(x + 0.085 + s * 0.012, OUTY - 0.01, z - 0.29), segs=12)
        cyl(f'dmm_tip{s}', 0.001, 0.02, steel, loc=(x + 0.085 + s * 0.012, OUTY - 0.01, z - 0.31), segs=8)
    # hook-up wire spools on a dowel through the hook
    x, _, z = hang_point(0.48, TOP)
    tube('spool_axle', [(x - 0.075, OUTY + 0.01, z - 0.03), (x + 0.075, OUTY + 0.01, z - 0.03)], 0.0035, mat('#c79b5e', 0.6))
    for i, c in enumerate((red, black, blue, mat('#2f8f45', 0.45))):
        sx = x - 0.055 + i * 0.037
        cyl(f'spool_flange_a{i}', 0.022, 0.003, dark, loc=(sx - 0.014, OUTY + 0.01, z - 0.03), rot=(0, math.pi / 2, 0), segs=24)
        cyl(f'spool_flange_b{i}', 0.022, 0.003, dark, loc=(sx + 0.011, OUTY + 0.01, z - 0.03), rot=(0, math.pi / 2, 0), segs=24)
        cyl(f'spool_wire{i}', 0.016, 0.022, c, loc=(sx - 0.011, OUTY + 0.01, z - 0.03), rot=(0, math.pi / 2, 0), segs=24)
    # ---------------- bottom row ----------------
    # hex keys in a folding holder
    x, _, z = hang_point(-0.48, LOW)
    rbox('hex_holder', 0.07, 0.012, 0.02, black, loc=(x, OUTY, z - 0.02), r=0.003)
    for i in range(7):
        L = 0.045 + i * 0.008; dx = -0.03 + i * 0.01
        tube(f'hex{i}', [(x + dx, OUTY - 0.006, z - 0.01), (x + dx, OUTY - 0.006, z - 0.01 - L), (x + dx + 0.016, OUTY - 0.006, z - 0.01 - L)], 0.0015 + i * 0.0002, dark)
    # screwdriver rack spanning two hooks (-0.24 .. 0.0) with four screwdrivers
    x0, _, z = hang_point(-0.12, LOW)
    rbox('sd_rack', 0.32, 0.05, 0.012, mat('#5f6870', 0.45, 0.5), loc=(x0, OUTY + 0.01, z - 0.012), r=0.002)
    for i, (c, L) in enumerate(((red, 0.2), (blue, 0.18), (yellow, 0.16), (green, 0.15), (black, 0.13))):
        sx = x0 - 0.12 + i * 0.06
        lathe(f'sd_handle{i}', [(0, 0), (0.008, 0.002), (0.0125, 0.015), (0.013, 0.05), (0.0115, 0.08), (0.0105, 0.095), (0, 0.098)], c, 20)
        h = bpy.data.objects[f'sd_handle{i}']; h.location = (sx, OUTY + 0.01, z - 0.005)
        cyl(f'sd_shaft{i}', 0.0028, L - 0.09, steel, loc=(sx, OUTY + 0.01, z - 0.005 - (L - 0.09)), segs=10)
        rbox(f'sd_tip{i}', 0.006 if i % 2 else 0.0035, 0.0012, 0.012, steel, loc=(sx, OUTY + 0.01, z - 0.005 - (L - 0.09) - 0.008), r=0.0004)
    # breadboard with jumper wires
    x, _, z = hang_point(0.24, LOW)
    rbox('bb_board', 0.165, 0.009, 0.055, mat('#f4f4f1', 0.5), loc=(x, OUTY - 0.002, z - 0.075), rot=(math.pi / 2, 0, 0), r=0.002)
    for row in (-0.018, 0.018):
        rbox(f'bb_rail{row}', 0.15, 0.0006, 0.002, red if row > 0 else blue, loc=(x, OUTY - 0.0072, z - 0.075 + row * 1.3), rot=(math.pi / 2, 0, 0), r=0)
    for i, c in enumerate((red, yellow, green, blue, black, mat('#e86f1d', 0.45))):
        a = x - 0.06 + i * 0.022
        tube(f'jumper{i}', [(a, OUTY - 0.007, z - 0.06), (a + 0.008, OUTY - 0.03, z - 0.04 + 0.006 * i), (a + 0.02, OUTY - 0.007, z - 0.085)], 0.0011, c)
    tube('bb_hanger', [(x - 0.01, OUTY + 0.002, z - 0.05), (x, OUTY + 0.002, z + 0.004), (x + 0.01, OUTY + 0.002, z - 0.05)], 0.0012, steel)
    # tape measure + scissors
    x, _, z = hang_point(0.48, LOW)
    cyl('tape_case', 0.032, 0.035, mat('#f2b51c', 0.45), loc=(x - 0.03, OUTY + 0.005, z - 0.04), rot=(math.pi / 2, 0, 0), segs=28)
    cyl('tape_hub', 0.014, 0.037, black, loc=(x - 0.03, OUTY + 0.006, z - 0.04), rot=(math.pi / 2, 0, 0), segs=20)
    rbox('tape_blade', 0.018, 0.002, 0.03, mat('#e8d26a', 0.4), loc=(x - 0.03, OUTY - 0.012, z - 0.105), r=0.0005)
    for s in (-1, 1):
        tube(f'sc_loop{s}', [(x + 0.04 + s * 0.012 + 0.012 * math.cos(t), OUTY, z - 0.01 + 0.012 * math.sin(t)) for t in [i * math.pi / 4 for i in range(8)]], 0.003, black, closed=True)
    prism('sc_blades', [(-0.004, 0), (0.004, 0), (0.0015, -0.09), (-0.0015, -0.09)], 0.003, steel, plane='XZ', loc=(x + 0.04, OUTY, z - 0.028), bev=0.0003)

if __name__ == '__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build()
    for o in [o for o in bpy.context.scene.objects if o.type in ('CURVE', 'FONT')]:
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o; bpy.ops.object.convert(target='MESH')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True)
    print('EXPORTED toolwall', os.path.getsize(OUT) // 1024, 'KB')
