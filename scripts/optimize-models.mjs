import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(process.env.ANATO_TOOLING_DIR ? path.join(process.env.ANATO_TOOLING_DIR, 'package.json') : path.join(root, 'package.json'));
const { NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS, EXTMeshoptCompression } = require('@gltf-transform/extensions');
const { MeshoptEncoder } = require('meshoptimizer');
// Validate against the actual decoder shipped with the application.
const { MeshoptDecoder } = await import(pathToFileURL(path.join(root, 'node_modules/three/examples/jsm/libs/meshopt_decoder.module.js')).href);
const sharp = createRequire(path.join(root, 'package.json'))('sharp');
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const hash = array => createHash('sha256').update(new Uint8Array(array.buffer, array.byteOffset, array.byteLength)).digest('hex');
function fingerprint(doc) {
  const indices = new Set(doc.getRoot().listMeshes().flatMap(mesh => mesh.listPrimitives().map(primitive => primitive.getIndices())).filter(Boolean));
  const accessors = doc.getRoot().listAccessors().map(accessor => {
    const data = accessor.getArray();
    if (!data) return null;
    if (!indices.has(accessor)) return [accessor.getType(), accessor.getNormalized(), hash(data)];
    // Triangle codecs may rotate indices inside each triangle without changing
    // winding or geometry. Normalize that cyclic rotation for comparison.
    const canonical = Array.from(data);
    for (let i = 0; i < canonical.length; i += 3) {
      const triangle = canonical.slice(i, i + 3);
      const first = triangle.indexOf(Math.min(...triangle));
      canonical.splice(i, 3, ...triangle.slice(first), ...triangle.slice(0, first));
    }
    return ['indices', hash(new Uint32Array(canonical))];
  });
  return { accessors: accessors.map(x => JSON.stringify(x)).sort(), nodes: doc.getRoot().listNodes().map(n => [n.getName(), n.getTranslation().map(v => v === 0 ? 0 : v), n.getRotation().map(v => v === 0 ? 0 : v), n.getScale().map(v => v === 0 ? 0 : v), n.listChildren().map(c => c.getName())]), animations: doc.getRoot().listAnimations().map(a => [a.getName(), a.listChannels().length, a.listSamplers().length]), skins: doc.getRoot().listSkins().map(s => [s.getName(), s.listJoints().map(j => j.getName())]) };
}
function preserveTransforms(output, original) {
  const readJson = bytes => JSON.parse(Buffer.from(bytes).subarray(20, Buffer.from(bytes).readUInt32LE(12) + 20).toString());
  const before = readJson(original), after = readJson(output);
  assert.deepEqual(after.nodes.map(n => n.name), before.nodes.map(n => n.name), 'Node ordering changed');
  // The serializer omits near-identity transforms. Restore the source values so
  // skeleton transforms and all original matrices remain exactly represented.
  after.nodes.forEach((node, i) => {
    for (const key of ['matrix', 'translation', 'rotation', 'scale']) {
      delete node[key];
      if (before.nodes[i][key] !== undefined) node[key] = before.nodes[i][key];
    }
  });
  const text = Buffer.from(JSON.stringify(after));
  const json = Buffer.alloc(Math.ceil(text.length / 4) * 4, 32); text.copy(json);
  const bin = Buffer.from(output).subarray(20 + Buffer.from(output).readUInt32LE(12));
  const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(20 + json.length + bin.length, 8); header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  return new Uint8Array(Buffer.concat([header, json, bin]));
}
const report = [];
for (const gender of ['male', 'female']) {
  const dir = path.join(root, 'public/models', gender);
  for (const file of await fs.readdir(dir)) {
    if (!file.endsWith('.glb')) continue;
    const target = path.join(dir, file);
    const original = await fs.readFile(target);
    const doc = await io.readBinary(original);
    if (doc.getRoot().listExtensionsUsed().some(e => e.extensionName === 'EXT_meshopt_compression')) {
      if (process.env.ANATO_MODEL_BACKUP) {
        const source = await fs.readFile(path.join(process.env.ANATO_MODEL_BACKUP, gender, file));
        assert.deepEqual(fingerprint(doc), fingerprint(await io.readBinary(source)));
        report.push({ model: `${gender}/${file}`, beforeBytes: source.length, afterBytes: original.length, savedPercent: +(100*(1-original.length/source.length)).toFixed(1), verified: 'Original geometry, transforms, skins and animations match' });
      }
      console.log('Already optimized:', file); continue;
    }
    const before = fingerprint(doc);
    for (const texture of doc.getRoot().listTextures()) {
      if (texture.getMimeType() !== 'image/png' || !texture.getImage()) continue;
      const pixels = await sharp(texture.getImage()).raw().toBuffer();
      const encoded = await sharp(texture.getImage()).png({ compressionLevel: 9, adaptiveFiltering: true, palette: false }).toBuffer();
      if (encoded.length < texture.getImage().length) {
        assert.deepEqual(await sharp(encoded).raw().toBuffer(), pixels, 'Texture pixels changed');
        texture.setImage(encoded);
      }
    }
    // Deliberately skip geometry simplification, quantization, and lossy filters.
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
    const output = preserveTransforms(await io.writeBinary(doc), original);
    const decoded = await io.readBinary(output);
    assert.deepEqual(fingerprint(decoded), before, `${file}: geometry/animation changed`);
    if (output.length < original.length) {
      if (process.env.ANATO_MODEL_BACKUP) {
        const backup = path.join(process.env.ANATO_MODEL_BACKUP, gender);
        await fs.mkdir(backup, { recursive: true }); await fs.writeFile(path.join(backup, file), original);
      }
      await fs.writeFile(target, output);
    }
    const afterBytes = Math.min(original.length, output.length);
    report.push({ model: `${gender}/${file}`, beforeBytes: original.length, afterBytes, savedPercent: +(100 * (1 - afterBytes / original.length)).toFixed(1), verified: 'Geometry, transforms, skins, animation samples, and texture pixels preserved; app decoder tested' });
    console.log(`${file}: ${(original.length / 1048576).toFixed(2)} -> ${(afterBytes / 1048576).toFixed(2)} MiB`);
  }
}
if (report.length) {
  await fs.mkdir(path.join(root, 'docs'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/model-optimization.json'), JSON.stringify({ method: 'Meshopt lossless buffer compression and lossless PNG recompression; no simplification or quantization', models: report }, null, 2) + '\n');
  console.log('Total bytes:', report.reduce((n,r)=>n+r.beforeBytes,0), '->', report.reduce((n,r)=>n+r.afterBytes,0));
}
