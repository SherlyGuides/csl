// Shrink an exported item GLB for the web: textures → ≤512 px WebP, geometry welded + meshopt-compressed.
// Usage: node tools/compress.mjs models/item-84.glb [maxTexture=512]
const NM = '/Users/happyguy/Desktop/walkable/pipeline/node_modules/';
const { NodeIO } = await import(NM + '@gltf-transform/core/dist/index.js');
const { ALL_EXTENSIONS } = await import(NM + '@gltf-transform/extensions/dist/index.js');
const F = await import(NM + '@gltf-transform/functions/dist/index.js');
const { MeshoptEncoder, MeshoptDecoder } = await import(NM + 'meshoptimizer/index.js');
const sharp = (await import(NM + 'sharp/lib/index.js').catch(() => null))?.default;
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const file = process.argv[2], max = +(process.argv[3] ?? 512);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(file);
const before = (await import('node:fs')).statSync(file).size;
const steps = [F.dedup(), F.weld(), F.prune()];
if (sharp) steps.push(F.textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [max, max], quality: 82 }));
steps.push(F.meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await doc.transform(...steps);
await io.write(file, doc);
const after = (await import('node:fs')).statSync(file).size;
console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB${sharp ? '' : ' (no sharp: textures not resized)'}`);
