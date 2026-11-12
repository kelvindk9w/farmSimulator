// Conferências automáticas da demonstração. Não substituem olhar as imagens; cobrem o que dá para medir.
// Uso: node scripts/build.mjs && node scripts/verificar.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { abrirPagina, raiz } from './navegador.mjs';
import { listarConjuntos } from './lib/conjuntos.mjs';

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let falhas = 0;
const dizer = (ok, texto) => { console.log(`${ok ? 'ok   ' : 'FALHA'} ${texto}`); if (!ok) falhas++; };

// 1. as texturas provisórias saem idênticas, byte a byte, quando geradas de novo
const tmp = path.join(raiz, 'dist', 'verificacao'); // pasta de build, fora do git
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
const r = spawnSync(process.execPath, [path.join(raiz, 'scripts/gerar-texturas.mjs'), `--saida=${tmp}`], { encoding: 'utf8' });
if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); }
let iguais = 0, diferentes = [];
for (const pasta of fs.readdirSync(tmp)) for (const f of fs.readdirSync(path.join(tmp, pasta))) {
  const original = path.join(raiz, 'texturas', pasta, f);
  if (fs.existsSync(original) && sha(original) === sha(path.join(tmp, pasta, f))) iguais++; else diferentes.push(`${pasta}/${f}`);
}
dizer(!diferentes.length, `texturas geradas de novo: ${iguais} arquivos idênticos aos de texturas/${diferentes.length ? `, diferentes: ${diferentes.join(', ')}` : ''}`);
fs.rmSync(tmp, { recursive: true, force: true });

const conjuntos = listarConjuntos(raiz).filter((c) => !c.teste);
const { browser, page } = await abrirPagina();

// 2. os .glb saem idênticos quando exportados de novo
for (const nome of await page.evaluate(() => window.MT.moldes())) {
  const novo = Buffer.from(await page.evaluate((n) => window.MT.exportarGLB(n), nome), 'base64');
  const arquivo = path.join(raiz, 'moldes', `${nome}.glb`);
  dizer(fs.existsSync(arquivo) && novo.equals(fs.readFileSync(arquivo)), `moldes/${nome}.glb idêntico ao exportado agora`);
}

// 3. o enquadramento é o mesmo em todos os estados (mesma silhueta, pixel a pixel)
const estados = ['molde', ...conjuntos.map((c) => c.pasta)];
const silhuetas = [];
for (const e of estados) silhuetas.push(await page.evaluate((x) => window.MT.silhueta(x), e));
dizer(silhuetas.every((s) => s.hash === silhuetas[0].hash && s.cobertos === silhuetas[0].cobertos), `mesma silhueta em ${estados.join(', ')} (${silhuetas[0].cobertos} pixels cobertos)`);

// 4. a cena montada a partir dos .glb fica igual à montada direto do código (geometria, UV e slots chegam inteiros ao arquivo)
async function foto(opts) {
  await page.evaluate((o) => window.MT.shot('estado', o), opts);
  await page.setViewportSize({ width: opts.w, height: opts.h });
  return sharp(await page.screenshot({ type: 'png' })).raw().toBuffer();
}
for (const c of conjuntos) {
  const base = { estado: c.pasta, w: 1600, h: 1040 };
  const a = await foto(base), b = await foto({ ...base, origem: 'glb' });
  let maior = 0, quantos = 0;
  for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d) quantos++; if (d > maior) maior = d; }
  dizer(maior <= 2 && quantos < a.length * 0.001, `${c.pasta}: cena dos .glb x cena do código — maior diferença ${maior}/255 em ${quantos} de ${a.length} valores`);
}

await browser.close();
if (falhas) { console.error(`${falhas} conferência(s) falharam`); process.exit(1); }
console.log('todas as conferências passaram');
