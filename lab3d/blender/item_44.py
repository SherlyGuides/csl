"""Item 44 — Sieve, stainless steel: 16.5 cm woven-mesh bowl strainer with steel rim, twin-wire handle and resting ear.
Real size 33.5 L x 7.5 H x 16.5 cm. Pose = placeholder: bowl opening up, handle along +X (the room turns it 90 deg to hang by
the handle). Mesh is an alpha-tiled wire texture. Source: typical 16 cm strainer + catalogue photo."""
import math
from kt_lib import *
SNO, WALL = 44, False

def build():
    st = mat('#d5dadd', 0.28, 0.7)
    mesh = pattern_mat('sieve_mesh', '#c9ced2', 0.4, 0.6, 'mesh', cells=4, fill=0.3)
    D, R = 0.066, 0.080; zr = D
    b = bowl('mesh', R, R, D, mesh, rings=7, segs=32, power=2.3, uvtile=0.009); b.location.z = zr
    lathe('rim', [(0.0792, zr - 0.009), (0.0812, zr - 0.009), (0.0822, zr - 0.003), (0.0826, zr + 0.001), (0.0812, zr + 0.003), (0.0794, zr + 0.002), (0.0792, zr - 0.009)], st, 32, close_bottom=False)
    z = zr - 0.002
    hp = [(0.080, -0.015, z), (0.115, -0.0125, z + 0.004), (0.165, -0.0105, z + 0.008), (0.205, -0.0095, z + 0.010), (0.222, -0.007, z + 0.011),
          (0.229, 0, z + 0.0115), (0.222, 0.007, z + 0.011), (0.205, 0.0095, z + 0.010), (0.165, 0.0105, z + 0.008), (0.115, 0.0125, z + 0.004), (0.080, 0.015, z)]
    wire('handle', crom(hp, 3), 0.0021, st, segs=6)
    ep = [(-0.080, -0.013, z), (-0.094, -0.011, z + 0.001), (-0.103, -0.005, z + 0.0015), (-0.105, 0, z + 0.0015), (-0.103, 0.005, z + 0.0015), (-0.094, 0.011, z + 0.001), (-0.080, 0.013, z)]
    wire('ear', crom(ep, 3), 0.0019, st, segs=6)
