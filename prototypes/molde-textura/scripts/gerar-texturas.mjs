// Gera os conjuntos de texturas provisórios (texturas/provisorio-a, texturas/provisorio-b) e o de teste de UV
// (texturas/teste-uv). A saída é idêntica byte a byte a cada execução.
// Uso: node scripts/gerar-texturas.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as P from './lib/pinturas.mjs';
import { gravarPNG } from './lib/raster.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, 'config/molde.json'), 'utf8'));
const SLOTS = Object.keys(cfg.slots);
const REPETICAO = cfg.densidade.unidadesDeMundoPorRepeticao;

const CONJUNTOS = {
  'provisorio-a': {
    nome: 'Provisório A',
    descricao: 'Reboco branco, telha de barro, madeira marrom, porta e janela azuis, grama viva, terra escura.',
    pinturas: {
      parede: () => P.reboco(),
      telhado: () => P.telhaDeBarro(),
      madeira: () => P.tabuas({ tons: ['#8a5a33', '#a06c3e'], fresta: '#3a2413', nos: [[1, 0.4, 0.31], [4, 0.6, 0.73], [6, 0.35, 0.12]] }),
      porta: () => P.portaDeTabuas(),
      janela: () => P.janelaEmArco(),
      grama: () => P.grama({ tons: ['#5f9a34', '#77b241', '#93c653'] }),
      'terra-arada': () => P.terraArada({ fundo: '#3b281b', crista: '#644733' }),
    },
  },
  'provisorio-b': {
    nome: 'Provisório B',
    descricao: 'Ripas amarelas, ardósia cinza, tábuas vermelhas, porta e janela de moldura branca, grama escura com flores, terra vermelha.',
    pinturas: {
      parede: () => P.ripasDeitadas(),
      telhado: () => P.ardosia(),
      madeira: () => P.tabuas({ tons: ['#a3382a', '#b44434'], fresta: '#4f1712', veio: 0.55, larguras: [64, 64, 64, 64, 64, 64, 64, 64], semente: 35 }),
      porta: () => P.portaComEscoras(),
      janela: () => P.janelaDeMolduraBranca(),
      grama: () => P.grama({ tons: ['#2c6b45', '#3a8153', '#4f9963'], folhas: 2200, flores: 70, coresDasFlores: ['#f4f1e4', '#f4f1e4', '#f2d24b'], semente: 45 }),
      'terra-arada': () => P.terraArada({ fundo: '#6a3220', crista: '#9a573b', sulcos: 6, palha: 260, semente: 55 }),
    },
  },
  'teste-uv': {
    nome: 'Teste de UV',
    descricao: 'Xadrez numerado, uma cor por slot. Serve para conferir a direção e a densidade do UV dos moldes; não entra na comparação.',
    uso: 'teste',
    pinturas: {
      parede: () => P.xadrezNumerado({ cores: ['#e9e4d8', '#bdb6a6'] }),
      telhado: () => P.xadrezNumerado({ cores: ['#f0a58c', '#d9684a'] }),
      madeira: () => P.xadrezNumerado({ cores: ['#ecc98a', '#c99848'] }),
      porta: () => P.xadrezNumerado({ cores: ['#9cc4f2', '#5f97dc'], linhas: 8, altura: 1024 }),
      janela: () => P.xadrezNumerado({ cores: ['#a8ead9', '#5cc7ae'] }),
      grama: () => P.xadrezNumerado({ cores: ['#bfe39a', '#8cc45c'] }),
      'terra-arada': () => P.xadrezNumerado({ cores: ['#d9b8e6', '#b282c6'] }),
    },
  },
};

// Tamanho de uma repetição no mundo, por slot, nos conjuntos provisórios. A grama cobre o dobro do padrão:
// num gramado grande a repetição aparece menos. O conjunto de teste fica todo no padrão, para a densidade ser lida direto.
const TAMANHO_NO_MUNDO = { grama: 2 * REPETICAO };

// Mede a emenda: diferença média entre a última e a primeira coluna (e linha) da imagem, comparada com a diferença
// entre colunas (linhas) vizinhas dentro dela. Se a emenda não passa do maior valor de dentro, ela não se destaca.
function emenda({ dados, largura: w, altura: h, canais: c }) {
  const dif = (x0, y0, x1, y1) => { let s = 0; for (let k = 0; k < 3; k++) s += Math.abs(dados[(y0 * w + x0) * c + k] - dados[(y1 * w + x1) * c + k]); return s / 3; };
  const colunas = [], linhas = [];
  for (let x = 0; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += dif(x, y, (x + 1) % w, y); colunas.push(s / h); }
  for (let y = 0; y < h; y++) { let s = 0; for (let x = 0; x < w; x++) s += dif(x, y, x, (y + 1) % h); linhas.push(s / w); }
  const resumo = (v) => ({ emenda: v[v.length - 1], maiorDeDentro: Math.max(...v.slice(0, -1)) });
  return { horizontal: resumo(colunas), vertical: resumo(linhas) };
}

// --saida=<pasta> grava em outro lugar (usado por scripts/verificar.mjs para conferir que a saída não muda).
const saida = (process.argv.find((a) => a.startsWith('--saida=')) || '').slice(8) || path.join(raiz, 'texturas');
const kb = (n) => (n / 1024).toFixed(0).padStart(4) + ' KB';
let emendasRuins = 0;
for (const [pasta, conj] of Object.entries(CONJUNTOS)) {
  const dir = path.join(saida, pasta);
  fs.mkdirSync(dir, { recursive: true });
  const slots = {};
  let total = 0;
  for (const slot of SLOTS) {
    const repete = cfg.slots[slot].repete;
    const tela = conj.pinturas[slot]();
    const img = tela.bytes({ alfa: !repete });
    const arquivo = `${slot}.png`;
    await gravarPNG(path.join(dir, arquivo), img);
    const bytes = fs.statSync(path.join(dir, arquivo)).size;
    total += bytes;
    slots[slot] = repete
      ? { arquivo, repete: true, tamanhoNoMundo: (conj.uso !== 'teste' && TAMANHO_NO_MUNDO[slot]) || REPETICAO }
      : { arquivo, repete: false, transparente: true };
    let nota = '';
    if (repete && conj.uso !== 'teste') {
      const e = emenda(img);
      const ok = e.horizontal.emenda <= e.horizontal.maiorDeDentro * 1.05 && e.vertical.emenda <= e.vertical.maiorDeDentro * 1.05;
      if (!ok) emendasRuins++;
      nota = `  emenda ${e.horizontal.emenda.toFixed(1)}/${e.vertical.emenda.toFixed(1)}, maior de dentro ${e.horizontal.maiorDeDentro.toFixed(1)}/${e.vertical.maiorDeDentro.toFixed(1)} ${ok ? 'ok' : 'EMENDA APARENTE'}`;
    }
    console.log(`${pasta}/${arquivo.padEnd(16)} ${img.largura}x${img.altura} ${kb(bytes)}${nota}`);
  }
  const json = { nome: conj.nome, descricao: conj.descricao, ...(conj.uso ? { uso: conj.uso } : {}), slots };
  fs.writeFileSync(path.join(dir, 'texturas.json'), JSON.stringify(json, null, 2) + '\n');
  console.log(`${pasta}: ${kb(total)} em imagens`);
}
if (emendasRuins) { console.error(`${emendasRuins} textura(s) com emenda aparente`); process.exit(1); }
