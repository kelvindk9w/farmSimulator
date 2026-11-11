// Gera um GLB de TESTE a partir do personagem.glb, para exercitar o que a arte final pode trazer de
// diferente: textura (uma paleta 16x16) no lugar de cor por vértice, ossos com outros nomes
// ("mixamorig:Head"), clipes com prefixo e maiúsculas ("Armature|Walk") e a malha de cabelo "Hair".
// Não faz parte do build. Para testar, use uma cópia do projeto e troque o assets/3d/personagem.glb dela:
//   node tools/glb-de-teste.mjs assets/3d/personagem.glb /caminho/da/copia/assets/3d/personagem.glb
import fs from 'node:fs';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');
const [,, entrada, saida] = process.argv;
if (!entrada || !saida) { console.error('Uso: node tools/glb-de-teste.mjs entrada.glb saida.glb'); process.exit(1); }
const b = fs.readFileSync(entrada);
const jlen = b.readUInt32LE(12);
const j = JSON.parse(b.subarray(20, 20 + jlen).toString('utf8'));
let bin = Buffer.from(b.subarray(20 + jlen + 8, 20 + jlen + 8 + b.readUInt32LE(20 + jlen)));

const toSrgb = (c) => Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
const paleta = new Map(); // "r,g,b" -> índice
const N = 16; // textura N x N
const acrescentar = (buf) => { const off = bin.length; const pad = (4 - (buf.length % 4)) % 4; bin = Buffer.concat([bin, buf, Buffer.alloc(pad)]); return off; };
for (const m of j.meshes) for (const p of m.primitives) {
  const acc = j.accessors[p.attributes.COLOR_0];
  const bv = j.bufferViews[acc.bufferView];
  const comps = acc.type === 'VEC4' ? 4 : 3;
  const stride = bv.byteStride || comps * 4;
  const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const uv = Buffer.alloc(acc.count * 8);
  for (let i = 0; i < acc.count; i++) {
    const k = [0, 1, 2].map((c) => toSrgb(bin.readFloatLE(base + i * stride + c * 4))).join(',');
    if (!paleta.has(k)) paleta.set(k, paleta.size);
    const idx = paleta.get(k);
    uv.writeFloatLE(((idx % N) + 0.5) / N, i * 8);
    uv.writeFloatLE((Math.floor(idx / N) + 0.5) / N, i * 8 + 4);
  }
  const off = acrescentar(uv);
  j.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: uv.length, target: 34962 });
  j.accessors.push({ bufferView: j.bufferViews.length - 1, componentType: 5126, count: acc.count, type: 'VEC2' });
  p.attributes.TEXCOORD_0 = j.accessors.length - 1;
  delete p.attributes.COLOR_0;
}
if (paleta.size > N * N) throw new Error('cores demais: ' + paleta.size);
const px = Buffer.alloc(N * N * 3, 255);
for (const [k, i] of paleta) { const [r, g, bl] = k.split(',').map(Number); px[i * 3] = r; px[i * 3 + 1] = g; px[i * 3 + 2] = bl; }
const png = await sharp(px, { raw: { width: N, height: N, channels: 3 } }).png().toBuffer();
const offPng = acrescentar(png);
j.bufferViews.push({ buffer: 0, byteOffset: offPng, byteLength: png.length });
j.images = [{ bufferView: j.bufferViews.length - 1, mimeType: 'image/png', name: 'paleta' }];
j.samplers = [{ magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071 }];
j.textures = [{ source: 0, sampler: 0 }];
for (const m of j.materials) m.pbrMetallicRoughness.baseColorTexture = { index: 0 };

// nomes diferentes: ossos no estilo "mixamorig:Head", clipes "Armature|Walk", malha de cabelo "Hair"
const ossos = new Set(j.skins.flatMap((s) => s.joints));
for (const i of ossos) { const n = j.nodes[i].name; j.nodes[i].name = 'mixamorig:' + n[0].toUpperCase() + n.slice(1); }
for (const n of j.nodes) { if (n.name === 'cabelo') n.name = 'Hair'; if (n.name === 'corpo') n.name = 'Body'; }
for (const a of j.animations) a.name = 'Armature|' + a.name[0].toUpperCase() + a.name.slice(1);
j.buffers[0].byteLength = bin.length;

let js = Buffer.from(JSON.stringify(j), 'utf8');
js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
const out = Buffer.alloc(12 + 8 + js.length + 8 + bin.length);
out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
out.writeUInt32LE(js.length, 12); out.writeUInt32LE(0x4e4f534a, 16); js.copy(out, 20);
out.writeUInt32LE(bin.length, 20 + js.length); out.writeUInt32LE(0x004e4942, 24 + js.length); bin.copy(out, 28 + js.length);
fs.writeFileSync(saida, out);
console.log('ok', saida, out.length, 'bytes; cores na paleta:', paleta.size, '; ossos:', [...ossos].map((i) => j.nodes[i].name).slice(0, 6).join(', '), '…; clipes:', j.animations.map((a) => a.name).join(', '));
