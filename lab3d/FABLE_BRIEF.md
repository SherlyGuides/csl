# Brief: model Composite Skill Lab equipment in Blender, real scale, photo-faithful

You are building high-fidelity 3D models of school-lab equipment for a web 3D walkthrough of a CBSE Composite Skill Lab
(ThinkPro Academy). Each item becomes one GLB that the page loads automatically in place of a low-poly placeholder.
The two things that matter: **real-world dimensions** and **looking like the catalogue photo**. Quality bar: `blender/item_21.py`
(khurpi: tapered forged crescent, bright edge, turned handle) and `blender/extinguisher.py` (fire extinguishers). Read both first.

## Tools and files (working directory: /Users/happyguy/Desktop/csl/lab3d)
- Blender 5.1: `/Applications/Blender.app/Contents/MacOS/Blender`. Work **headless only** (the commands below). Do NOT use any
  Blender MCP / live-Blender tools: other agents share that session.
- `catalogue-data.js`: every item (sno, item, spec, qty, zone, img). `spec` often holds real sizes.
- `../catalogue/<img>`: the catalogue photo for each item (webp). Convert to PNG to view it:
  `sips -s format png -Z 400 ../catalogue/<img> --out <your scratch dir>/<name>.png` and then read the PNG. Look at every photo.
- `blender/_lib.py` (`from _lib import *`): `mat(hex, rough, metal, alpha)` (sRGB hex → correct colour), `STEEL() BRUSHED() ALU()
  BRASS() WOOD() DARKWOOD() BLACKPL() RUBBER()`, `lathe(name, [(r,z)...], m, segs)` surface of revolution about Z,
  `cyl(name, r, h, m, loc, rot, segs, r2)`, `rbox(name, sx, sy, sz, m, loc, rot, r)` rounded box (base at z=0),
  `sphere`, `tube(name, pts, radius, m, closed)` swept tube through points, `prism(name, outline, depth, m, plane='XY'|'XZ')`
  extruded 2D outline with bevel, `surface(name, fn(u,v)->xyz, nu, nv, m, thickness)` parametric sheet,
  `text(name, s, size, m, loc, rot)` raised lettering, `bevel/subsurf/solidify`, `circle_pts`. You may add helpers in your own files.
- `blender/plants.py`: `rosette(name, loc, radius, n, height, seed, palette)` realistic leafy plant (one mesh).
- `js/models.js`: the current placeholders `ITEM_MODELS[sno]`. Read your items' placeholders to copy their **resting pose**.

## One script per item: `blender/item_<sno>.py`
```python
"""Item <sno> — <name>. Real size W × H × D cm. Source: spec / typical / photo."""
import math
from _lib import *
SNO, WALL = <sno>, False      # WALL=True only for wall-mounted items
def build():
    ...                       # create objects in the scene (metres, Z up, front of the item faces -Y, resting on z=0)
```
Export (also renders a preview on a 10 cm grid and updates models/manifest.json):
```
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/export_item.py -- blender/item_<sno>.py
```
It prints `EXPORTED item <sno>: W x H x D cm, tris, KB`. Then compress for the web:
```
node tools/compress.mjs models/item-<sno>.glb 512
```
Open `models/preview/item-<sno>.png` next to the catalogue photo and iterate until the shape, colours and size match.
The preview is a quick flat render: metals look darker there than in the room. Judge shape, proportion and colour.

## Conventions the room depends on
- Metres. Z up. Front faces −Y. The exporter centres the item in X/Y and puts its lowest point at z=0.
- **Resting pose = the placeholder's pose.** Small tools that lie on a bench/counter lie flat. Containers, appliances, bottles stand upright.
  Items hung on a wall rail (sieves, tongs, whisks, ladles, pot lifter) — check how main.js/models.js places them and keep the same pose.
- Realistic multiples where the placeholder shows them (e.g. a stack of 4 plates, a set of 4 containers, a ring of measuring spoons, a
  holder with table spoons): keep the same grouping the placeholder uses, so the room still shows the right thing.
- Never model items 56, 90, 95 or anything not in your list.

## Quality bar
1. Dimensions first: spec numbers win; otherwise the typical size of that exact product in India. Within ±5 %.
2. Silhouette: lathe for anything round; prism/surface for flat profiles; tube for handles, spouts, hoses, wires; rbox + bevel for boxes.
   Concave flat shapes (hooks, crescents) as a surface strip, not one prism outline (concave n-gons triangulate badly).
3. Details readable at 1–2 m: rims, lips, lids, knobs, hinges, spouts, nozzles, rivets, ribbed grips, dial ticks, LCD digits, raised
   "ISI"/"5 L"/"250 ml" lettering. No brand names or logos.
4. Materials from the photo via `mat(hex, rough, metal)`. Metalness ≤ 0.75 (steel ≈ `mat('#d3d8dc', 0.3, 0.7)`); plastics r 0.4–0.5;
   rubber r 0.85; glass/clear plastic alpha ≈ 0.35.
5. Budget: ≤ 3,000 triangles for small items, ≤ 8,000 for appliances/large items; ≤ 300 KB after compression. Text adds many
   triangles — keep lettering short.

## Rules
- Create only `blender/item_<sno>.py` (plus helper .py files with your own unique prefix if needed) for YOUR items. Do not edit
  `_lib.py`, `plants.py`, `tools/`, `js/`, `index.html`, other items' scripts, or anything outside lab3d.
- Finish with a table: `sno | item | target W×H×D cm | exported W×H×D cm | tris | KB | notes` and list anything you could not do.
