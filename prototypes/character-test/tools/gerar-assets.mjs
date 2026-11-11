// Gera os pacotes PROVISÓRIOS de arte em assets/2d e assets/3d, no formato exato do contrato.
// Uso: node tools/gerar-assets.mjs
// (O código que desenha roda dentro do Chromium: tools/gerador/main.js.)
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { raiz, cfg, cache, GL_ARGS, playwright } from './comum.mjs';

fs.mkdirSync(cache, { recursive: true });
const bundle = path.join(cache, 'gerador.js');
await build({
  entryPoints: [path.join(raiz, 'tools/gerador/main.js')],
  bundle: true, format: 'iife', outfile: bundle, logLevel: 'warning',
  // o código reaproveitado de tools/visual-refs e o desta pasta usam a MESMA cópia do three
  alias: { three: path.join(raiz, 'node_modules/three') },
});

const { chromium } = playwright();
const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || process.env.LOG) console.log(`[página ${m.type()}]`, m.text()); });
page.on('pageerror', (e) => console.log('[erro na página]', e.stack || e.message));
const html = path.join(cache, 'gerador.html');
fs.writeFileSync(html, '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>gerador</title></head><body></body></html>');
await page.goto('file://' + html);
await page.addScriptTag({ path: bundle });
const t0 = Date.now();
const res = await page.evaluate((c) => window.GERADOR.gerar(c), cfg);
await browser.close();

const dir3d = path.join(raiz, 'assets/3d'), dir2d = path.join(raiz, 'assets/2d');
for (const d of [dir3d, path.join(dir2d, 'sprites'), path.join(dir2d, 'variante-b')]) fs.mkdirSync(d, { recursive: true });

// --- 3D ---
for (const [nome, b64] of Object.entries(res.glb)) fs.writeFileSync(path.join(dir3d, nome), Buffer.from(b64, 'base64'));

// --- 2D ---
async function gravarPng(arquivo, b64) {
  const buf = Buffer.from(b64, 'base64');
  const re = await sharp(buf).png({ compressionLevel: 9, effort: 10 }).toBuffer(); // recompressão sem perda
  fs.writeFileSync(arquivo, re.length < buf.length ? re : buf);
}
const sp = cfg.sprites;
const meta = {
  _nota: 'PROVISÓRIO: folhas renderizadas a partir do avatar feito em código (tools/gerar-assets.mjs). Trocar pelo pacote do gerador de arte.',
  cell: { width: sp.cell[0], height: sp.cell[1] },
  anchor: { x: sp.anchor[0], y: sp.anchor[1] },
  directions: sp.directions,
  animations: {},
};
const problemas = [];
for (const [nome, f] of Object.entries(res.sprites)) {
  await gravarPng(path.join(dir2d, 'sprites', nome + '.png'), f.png);
  meta.animations[nome] = { file: `sprites/${nome}.png`, frames: f.quadros, fps: sp.defaults[nome].fps, loop: cfg.animations[nome].loop };
  if (f.w !== f.quadros * sp.cell[0] || f.h !== sp.directions.length * sp.cell[1]) problemas.push(`${nome}: tamanho inesperado ${f.w}x${f.h}`);
  for (const r of f.relatorio) if (r.estouroX || r.estouroY) problemas.push(`${nome} ${r.dir} quadro ${r.quadro}: sai da célula por ${r.estouroX},${r.estouroY} px`);
}
await gravarPng(path.join(dir2d, 'variante-b', 'walk.png'), res.variante.walk.png);
fs.writeFileSync(path.join(dir2d, 'sprites.json'), JSON.stringify(meta, null, 2) + '\n');

// --- relatório ---
const emPe = res.sprites.idle.relatorio.find((r) => r.dir === 'S' && r.quadro === 0);
const deslocados = {};
for (const [nome, f] of Object.entries(res.sprites)) {
  for (const r of f.relatorio) if (r.deslocX || r.deslocY) (deslocados[nome] ||= []).push(`${r.dir}#${r.quadro}: ${r.deslocX},${r.deslocY}`);
}
const rel = {
  geradoEm: new Date().toISOString(), segundos: +((Date.now() - t0) / 1000).toFixed(1),
  personagem: res.info.personagem, pecas: { 'cabelo-b': res.info['cabelo-b'], 'cabelo-c': res.info['cabelo-c'], barba: res.info.barba },
  carregadoPeloThree: res.info.carregado,
  alturaEmPePx: emPe.altura,
  quadrosDeslocadosParaCaber: deslocados,
  problemas,
};
fs.writeFileSync(path.join(cache, 'gerador-relatorio.json'), JSON.stringify(rel, null, 2));
console.log(JSON.stringify(rel, null, 2));
for (const d of [dir3d, path.join(dir2d, 'sprites'), path.join(dir2d, 'variante-b')]) for (const f of fs.readdirSync(d)) console.log(path.relative(raiz, path.join(d, f)), (fs.statSync(path.join(d, f)).size / 1024).toFixed(1) + ' KB');
if (Math.abs(emPe.altura - 200) > 6) console.log(`AVISO: altura em pé = ${emPe.altura} px (o contrato pede cerca de 200). Ajuste sprites.pixelsPerUnit em config/bench.json.`);
if (problemas.length) { console.log('PROBLEMAS:\n' + problemas.join('\n')); process.exitCode = 1; }
