"""Item 13 — Plastic pan (Gamla), Ø 14 in (spec) = 35.6 cm rim, 11.5 cm deep, base Ø 25 cm. Red terracotta-colour plastic
basin with a rolled rim; filled with soil and a leafy plant as in the room. Source: spec + catalogue photo."""
import math
from _lib import *
from agri_util import *
from plants import rosette
SNO, WALL = 13, False

def build():
    red = mat('#b5412c', 0.48)
    prof = [(0, 0.003), (0.116, 0.003), (0.122, 0.0), (0.128, 0.002), (0.137, 0.012), (0.150, 0.036), (0.161, 0.072), (0.1665, 0.100),
            (0.172, 0.1025), (0.177, 0.106), (0.178, 0.1105), (0.1755, 0.114), (0.171, 0.115), (0.166, 0.113), (0.1625, 0.104), (0.160, 0.090)]
    crisp(lathe('pan', prof, red, 56), 35)
    soil('soil', 0.1605, 0.089, seed=13, lumps=7)
    rosette('plant', loc=(0, 0, 0.094), radius=0.21, n=15, height=0.14, seed=131)
    for k, (a, d) in enumerate(((0.6, 0.105), (2.9, 0.11), (4.6, 0.10))):
        rosette('sprout', loc=(d * math.cos(a), d * math.sin(a), 0.092), radius=0.04, n=5, height=0.03, seed=140 + k, nu=4, nv=2)
