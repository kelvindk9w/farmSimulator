// Compara um conjunto de arte com a imagem-alvo dele: leva o sítio ao estado das imagens de referência da rodada 2 em
// diante (canteiro 1 com sementes, canteiro 2 com milho pronto, ovo no ninho, leite pronto, personagem ao lado do milho),
// fotografa sem a interface e monta um lado a lado: o alvo à esquerda, o jogo à direita.
// Uso: node tools/comparar.mjs <conjunto> <alvo.png> <saida.jpg|png> [escala do aparelho, padrão 2]
//   A foto do jogo sozinha fica ao lado da saída, com o sufixo "-jogo" e o mesmo formato dela.
import path from 'node:path';
import { createRequire } from 'node:module';
import { abrirNavegador, abrirPagina } from './comum.mjs';
const sharp = createRequire(import.meta.url)('sharp');

const [conjunto, alvo, saida, dsf = '2'] = process.argv.slice(2);
if (!conjunto || !alvo || !saida) { console.error('Uso: node tools/comparar.mjs <conjunto> <alvo.png> <saida.jpg|png> [escala]'); process.exit(2); }
const TELA = { width: 1672, height: 941, deviceScaleFactor: +dsf }; // a mesma proporção das imagens do Codex

const amb = await abrirNavegador();
let foto;
try {
  const { pagina, erros } = await abrirPagina(amb, `passo,sem-hud,tudo,arte-${conjunto}`, TELA);
  const aberto = await pagina.evaluate(() => window.__sitio.info().conjunto);
  if (aberto !== conjunto) throw new Error(`o conjunto "${conjunto}" não existe (abriu "${aberto}")`);
  const ler = () => pagina.evaluate(() => { const s = window.__sitio; return { info: s.info(), obj: s.objetos() }; });
  const andar = (n) => pagina.evaluate((k) => { const s = window.__sitio; s.avancarAte(s.info().passo + k); }, n);
  const ate = async (nome, cond, max = 60 * 90) => {
    for (let n = 0; n <= max; n += 20) { const e = await ler(); if (cond(e)) return e; await andar(20); }
    throw new Error('o sítio não chegou a: ' + nome);
  };
  const tocar = (id) => pagina.evaluate((i) => window.__sitio.tocar(i), id);
  const livre = (e) => e.info.estado === 'parado';
  await tocar('canteiro1'); await andar(20);
  await ate('canteiro 1 semeado', (e) => e.obj.canteiro1.estado === 'semeado' && livre(e));
  await tocar('poco'); await andar(20);
  await ate('regador cheio', (e) => e.info.contadores.agua === 3 && livre(e));
  await tocar('canteiro2'); await andar(20);
  await ate('canteiro 2 semeado', (e) => e.obj.canteiro2.estado === 'semeado' && livre(e));
  await tocar('canteiro2'); await andar(20);
  await ate('canteiro 2 regado', (e) => e.info.contadores['canteiro2.molhado'] === true && livre(e));
  await ate('milho pronto e ovo no ninho', (e) => e.obj.canteiro2.estado === 'pronto' && e.info.contadores['ninho.ovos'] > 0 && livre(e));
  await andar(120); // o milho pronto leva um instante para assentar
  foto = await pagina.screenshot();
  const est = await pagina.evaluate(() => window.__sitio.estatisticas());
  console.log(`conjunto "${conjunto}": ${est.chamadas} chamadas de desenho, ${est.triangulos} triângulos; erros no console: ${erros.length}${erros.length ? '\n' + erros.join('\n') : ''}`);
} finally { await amb.fechar(); }

const jpeg = /\.jpe?g$/i.test(saida), soJogo = saida.replace(/\.[a-z]+$/i, '') + '-jogo' + (jpeg ? '.jpg' : '.png');
await (jpeg ? sharp(foto).jpeg({ quality: 88 }) : sharp(foto).png()).toFile(soJogo);
const A = 941, FAIXA = 80, VAO = 24;
const paineis = [[alvo, 'O alvo (imagem do Codex)'], [foto, `O jogo rodando (conjunto "${conjunto}")`]];
const pecas = [];
let x = 0;
for (const [img, rotulo] of paineis) {
  const m = await sharp(img).metadata(), w = Math.round((m.width / m.height) * A);
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${FAIXA}"><text x="${w / 2}" y="${FAIXA / 2 + 13}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="38" font-weight="700" fill="#3a2a1a">${rotulo}</text></svg>`);
  pecas.push({ input: svg, left: x, top: 0 }, { input: await sharp(img).resize(w, A, { fit: 'fill' }).png().toBuffer(), left: x, top: FAIXA });
  x += w + VAO;
}
const folha = sharp({ create: { width: x - VAO, height: A + FAIXA, channels: 3, background: '#fff8ec' } }).composite(pecas);
await (jpeg ? folha.jpeg({ quality: 88 }) : folha.png()).toFile(saida);
console.log('gravou', path.relative(process.cwd(), saida), 'e', path.relative(process.cwd(), soJogo));
