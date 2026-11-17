// Reduce triangle count of a GLB for the web while keeping its look (meshoptimizer simplifier), then meshopt-compress.
// Skinned meshes (Zing) are left alone. Usage: node tools/simplify.mjs in.glb out.glb [ratio=0.25] [error=0.002]
const NM = '/Users/happyguy/Desktop/walkable/pipeline/node_modules/';
const { NodeIO } = await import(NM + '@gltf-transform/core/dist/index.js');
const { ALL_EXTENSIONS } = await import(NM + '@gltf-transform/extensions/dist/index.js');
const F = await import(NM + '@gltf-transform/functions/dist/index.js');
const { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } = await import(NM + 'meshoptimizer/index.js');
await MeshoptEncoder.ready; await MeshoptDecoder.ready; await MeshoptSimplifier.ready;
const [inp, out, ratio = '0.25', error = '0.002'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(inp);
const tris = () => doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().reduce((k, p) => k + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0), 0);
const before = tris();
// keep skinned meshes (Zing's rig) out of the simplifier
const skinned = new Set(doc.getRoot().listNodes().filter(n => n.getSkin() && n.getMesh()).map(n => n.getMesh()));
await doc.transform(F.dedup(), F.weld());
for (const m of doc.getRoot().listMeshes()) if (!skinned.has(m)) for (const prim of m.listPrimitives())
  F.simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio: +ratio, error: +error, lockBorder: false });
await doc.transform(F.prune());
await doc.transform(F.meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(out, doc);
console.log(`${inp}: ${Math.round(before)} -> ${Math.round(tris())} tris, ${(await import('node:fs')).statSync(out).size >> 10} KB`);
