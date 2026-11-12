// Mede triângulos e chamadas de desenho de cada molde e o tamanho em disco dos conjuntos e dos .glb.
// Grava medidas.json e atualiza a tabela entre os marcadores "medidas" do README.md.
import fs from 'node:fs';
import path from 'node:path';
import { abrirPagina, raiz } from './navegador.mjs';
import { listarConjuntos } from './lib/conjuntos.mjs';

const conjuntos = listarConjuntos(raiz);
const { browser, page } = await abrirPagina();
const moldes = await page.evaluate((c) => window.MT.medir(c), conjuntos.find((c) => !c.teste).pasta);
await browser.close();

for (const nome of Object.keys(moldes)) {
  const glb = path.join(raiz, 'moldes', `${nome}.glb`);
  moldes[nome].glbBytes = fs.existsSync(glb) ? fs.statSync(glb).size : null;
}
// memória de vídeo estimada (conta, não medição): RGBA de 8 bits sem compressão, com mipmaps (4/3)
const dimensoes = async (arquivo) => { const sharp = (await import('sharp')).default; const m = await sharp(arquivo).metadata(); return m.width * m.height; };
const texturas = {};
for (const c of conjuntos) {
  let pixels = 0;
  for (const s of Object.values(c.def.slots)) pixels += await dimensoes(path.join(raiz, 'texturas', c.pasta, s.arquivo));
  texturas[c.pasta] = { nome: c.def.nome, bytesEmDisco: c.bytes, arquivos: c.arquivos, memoriaDeVideoEstimadaBytes: Math.round((pixels * 4 * 4) / 3) };
}
const medidas = { geradoPor: 'node scripts/medir.mjs', moldes, texturas };
fs.writeFileSync(path.join(raiz, 'medidas.json'), JSON.stringify(medidas, null, 2) + '\n');

const n = (v) => v.toLocaleString('pt-BR');
const kb = (b) => `${(b / 1024).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KB`;
const mb = (b) => `${(b / 1048576).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
const linhas = [
  '| Molde | Triângulos | Vértices | Slots usados | Chamadas de desenho | Com a passada de sombra | Arquivo `.glb` |',
  '|---|---:|---:|---|---:|---:|---:|',
  ...Object.entries(moldes).map(([nome, m]) => `| \`${nome}\` | ${n(m.triangulos)} | ${n(m.vertices)} | ${m.slots.join(', ')} | ${m.chamadasDeDesenho} | ${m.chamadasComSombra} | ${m.glbBytes === null ? '—' : kb(m.glbBytes)} |`),
  '',
  '| Conjunto de texturas | Tamanho em disco (7 PNG) | Memória de vídeo estimada |',
  '|---|---:|---:|',
  ...Object.entries(texturas).map(([pasta, t]) => `| \`texturas/${pasta}/\` | ${kb(t.bytesEmDisco)} | ${mb(t.memoriaDeVideoEstimadaBytes)} |`),
];
const tabela = linhas.join('\n');
console.log(tabela);

const readme = path.join(raiz, 'README.md');
if (fs.existsSync(readme)) {
  const txt = fs.readFileSync(readme, 'utf8');
  const novo = txt.replace(/(<!-- medidas:inicio -->)[\s\S]*?(<!-- medidas:fim -->)/, `$1\n${tabela}\n$2`);
  if (novo !== txt) { fs.writeFileSync(readme, novo); console.log('README.md: tabela de medidas atualizada'); }
}
