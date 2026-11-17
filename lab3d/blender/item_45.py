"""Item 45 — Sieve, plastic, with multiple sieving plates: cream 21 cm round frame with grey grip lugs, a fine steel-mesh
plate fitted, and three spare plates (fine / medium / coarse holes) stacked under it. Real size 25 W x 8.8 H x 22 D cm.
Pose = placeholder sieve: opening up, lugs along X (the room turns it 90 deg to hang). Source: typical interchangeable-plate
atta/flour sieve + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 45, False

def build():
    cream = mat('#ece5d3', 0.5); grey = mat('#8f9ba8', 0.5)
    mesh = pattern_mat('p_mesh', '#b9bec2', 0.4, 0.6, 'mesh', cells=4, fill=0.3)
    holes = pattern_mat('p_holes', '#ece5d3', 0.5, 0.0, 'holes', cells=2, fill=0.31)
    pitch = 0.0096; z0 = 3 * pitch
    for k, tile in enumerate((0.024, 0.015, 0.009)):          # spare plates: coarse at the bottom
        z = k * pitch
        lathe('plate_rim', [(0.0845, z), (0.0925, z), (0.0938, z + 0.002), (0.0938, z + 0.007), (0.0925, z + 0.009), (0.0845, z + 0.009), (0.0845, z)], cream, 32, close_bottom=False)
        d = bowl('plate', 0.085, 0.085, 0.0, holes, rings=1, segs=32, uvtile=tile); d.location.z = z + 0.0045
    fr = [(0.091, z0), (0.105, z0), (0.1055, z0 + 0.048), (0.110, z0 + 0.052), (0.110, z0 + 0.058), (0.1015, z0 + 0.058), (0.100, z0 + 0.007), (0.091, z0 + 0.007), (0.091, z0)]
    lathe('frame', fr, cream, 36, close_bottom=False)
    for zz in (0.016, 0.03):                                   # moulded ribs round the frame
        lathe('rib', [(0.1052, z0 + zz), (0.1066, z0 + zz + 0.0015), (0.1052, z0 + zz + 0.003)], cream, 36, close_bottom=False)
    d = bowl('mesh', 0.0915, 0.0915, 0.0, mesh, rings=1, segs=32, uvtile=0.009); d.location.z = z0 + 0.009
    lathe('mesh_rim', [(0.0905, z0 + 0.007), (0.0995, z0 + 0.007), (0.0995, z0 + 0.012), (0.0905, z0 + 0.012), (0.0905, z0 + 0.007)], cream, 32, close_bottom=False)
    for sx in (-1, 1):
        rbox('lug', 0.022, 0.062, 0.017, grey, loc=(sx * 0.1175, 0, z0 + 0.040), r=0.005, segs=2)
