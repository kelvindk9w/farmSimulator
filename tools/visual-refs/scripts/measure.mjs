// Medições que alimentam a decisão 3D x 2D. Grava dist/medidas.json.
import { build } from 'esbuild';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { openPage, root, outDir } from './browser.mjs';

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const br = (buf) => brotliCompressSync(buf).length;
const kb = (n) => +(n / 1024).toFixed(1);
const out = {};
const dist = path.join(root, 'dist');

// ---------- 1) pacote JavaScript ----------
// (a) só o que a cena usa do Three.js; (b) o aplicativo inteiro da cena A (three + modelos + HUD)
{
  const used = new Set();
  const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (p.endsWith('.js') && !p.includes('medidas') && !p.includes('catalogo')) { const s = fs.readFileSync(p, 'utf8'); for (const m of s.matchAll(/THREE\.([A-Z][A-Za-z0-9]+)/g)) used.add(m[1]); } } };
  walk(path.join(root, 'src'));
  const three = await import('three');
  const names = [...used].filter((n) => n in three).sort();
  const entryThree = path.join(dist, '_entry-three.js');
  fs.writeFileSync(entryThree, `export { ${names.join(', ')} } from 'three';\nexport { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';\n`);
  const entryApp = path.join(dist, '_entry-app.js');
  fs.writeFileSync(entryApp, `import { cenaA, cenaB } from '../src/shots/cenas.js';\nwindow.jogo = { cenaA, cenaB };\n`);
  for (const [k, entry] of [['three', entryThree], ['app', entryApp]]) {
    const r = await build({ entryPoints: [entry], bundle: true, minify: true, format: 'esm', write: false, treeShaking: true, legalComments: 'none', absWorkingDir: root, metafile: true, logLevel: 'silent' });
    const code = Buffer.from(r.outputFiles[0].contents);
    const o = Object.values(r.metafile.outputs)[0];
    let threeBytes = 0, ownBytes = 0;
    for (const [inp, v] of Object.entries(o.inputs)) (inp.includes('node_modules/three') ? (threeBytes += v.bytesInOutput) : (ownBytes += v.bytesInOutput));
    out['js_' + k] = { minKB: kb(code.length), gzipKB: kb(gz(code)), brotliKB: kb(br(code)), bytesDoThree: threeBytes, bytesProprios: ownBytes, simbolosThree: k === 'three' ? names.length : undefined };
  }
  out.three_versao = three.REVISION;
}

// ---------- 2) cenas no navegador ----------
const { browser, page } = await openPage({ width: 1920, height: 1080, dpr: 2 });
const call = (fn, ...args) => page.evaluate(([f, a]) => { const parts = f.split('.'); let o = window.VR; for (const p of parts) o = o[p]; return o(...a); }, [fn, args]);

const a = await page.evaluate(() => window.VR.shot('cenaA', { medir: true, hud: false }));
out.cenaA = a.stats;
const b = await page.evaluate(() => window.VR.shot('cenaB', { medir: true, hud: false }));
out.cenaB = b.stats;
const c2 = await page.evaluate(() => window.VR.shot('cena2D', { medir: true, hud: false }));
out.cena2D = c2.stats;
{
  // peso do cenário 2D: cada sprite recomprimido sem perda (mesmo critério dos sprites do personagem)
  const lista = await page.evaluate(() => window.__sprites2d);
  let total = 0;
  for (const b64s of lista) { const buf = Buffer.from(b64s, 'base64'); const re = await sharp(buf).png({ compressionLevel: 9, effort: 10 }).toBuffer(); total += Math.min(buf.length, re.length); }
  out.cena2D.pngMB = +(total / 1048576).toFixed(2);
  delete out.cena2D.pngBytes;
  await page.evaluate(() => { delete window.__sprites2d; });
}

// ---------- 3) dados 3D: avatar e cenário ----------
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
async function otimizar(buf) {
  const doc = await io.readBinary(new Uint8Array(buf));
  await doc.transform(dedup(), prune(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  return Buffer.from(await io.writeBinary(doc));
}
async function glbInfo(b64s, name) {
  const raw = Buffer.from(b64s, 'base64');
  fs.writeFileSync(path.join(dist, name + '.glb'), raw);
  let opt = null;
  try { opt = await otimizar(raw); fs.writeFileSync(path.join(dist, name + '.opt.glb'), opt); } catch (e) { console.log('otimização falhou em', name, e.message); }
  return { glbKB: kb(raw.length), glbGzipKB: kb(gz(raw)), otimizadoKB: opt ? kb(opt.length) : null, otimizadoGzipKB: opt ? kb(gz(opt)) : null };
}
out.avatar = {};
{
  const full = await call('medidas.avatarGLB', 'ana', { comAnimacoes: true });
  const mesh = await call('medidas.avatarGLB', 'ana', { comAnimacoes: false });
  const { glb: g1, ...metaFull } = full; const { glb: g2 } = mesh;
  out.avatar.info = metaFull;
  out.avatar.comAnimacoes = await glbInfo(g1, 'avatar-ana');
  out.avatar.soMalha = await glbInfo(g2, 'avatar-ana-malha');
  out.avatar.animacoesKB = +(out.avatar.comAnimacoes.glbKB - out.avatar.soMalha.glbKB).toFixed(1);
  out.avatar.animacoesOtimizadasGzipKB = +(out.avatar.comAnimacoes.otimizadoGzipKB - out.avatar.soMalha.otimizadoGzipKB).toFixed(1);
  out.avatar.visuais = {};
  for (const nome of ['leo', 'bia', 'junino', 'boiadeira', 'chuva', 'base']) {
    const r = await call('medidas.avatarGLB', nome, { comAnimacoes: false });
    const { glb, ...m } = r;
    out.avatar.visuais[nome] = { triangulos: m.triangulos, vertices: m.vertices, ...(await glbInfo(glb, 'avatar-' + nome + '-malha')) };
  }
}
{
  const r = await call('medidas.cenarioGLB');
  const { glb, ...m } = r;
  out.cenario3D = { ...m, ...(await glbInfo(glb, 'cenario')) };
}

// ---------- 4) sprites completos de UM visual ----------
async function pesos(pngBuf) {
  const lossless = await sharp(pngBuf).png({ compressionLevel: 9, effort: 10 }).toBuffer();
  const pal = await sharp(pngBuf).png({ palette: true, quality: 90, effort: 10, colours: 256 }).toBuffer();
  const webp = await sharp(pngBuf).webp({ quality: 90, alphaQuality: 95, effort: 6 }).toBuffer();
  return { png32: Math.min(pngBuf.length, lossless.length), png8: pal.length, webp90: webp.length };
}
out.sprites = {};
for (const cell of [128, 256]) {
  const r = await call('medidas.spritesCompletos', { outfit: 'ana', cell });
  const dirs = [];
  for (const at of r.atlas) {
    const buf = Buffer.from(at.png, 'base64');
    if (cell === 256 && at.yaw === 45) fs.writeFileSync(path.join(dist, 'atlas-ana-sudeste-256.png'), buf);
    dirs.push({ yaw: at.yaw, w: at.w, h: at.h, recorte: at.recorte, ...(await pesos(buf)) });
  }
  const soma = (list, k) => list.reduce((s, d) => s + d[k], 0);
  const reais = dirs.filter((d) => d.yaw <= 180);
  const f = r.quadrosPorDirecao;
  const linha = (list, nDir) => ({
    direcoesRenderizadas: nDir, quadros: f * nDir,
    png32MB: +(soma(list, 'png32') / 1048576).toFixed(2), png8MB: +(soma(list, 'png8') / 1048576).toFixed(2), webp90MB: +(soma(list, 'webp90') / 1048576).toFixed(2),
    vramMB: +((f * nDir * cell * cell * 4) / 1048576).toFixed(1),
    vramRecortadoMB: +((soma(list, 'recorte') * 4) / 1048576).toFixed(1),
  });
  out.sprites['celula' + cell] = { quadrosPorDirecao: f, animacoes: r.animacoes, semEspelho: linha(dirs, 8), comEspelho: linha(reais, 5) };
}
await browser.close();
fs.writeFileSync(path.join(dist, 'medidas.json'), JSON.stringify(out, null, 2));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'medidas.json'), JSON.stringify(out, null, 2) + '\n'); // cópia ao lado do README
console.log(JSON.stringify(out, null, 2));
