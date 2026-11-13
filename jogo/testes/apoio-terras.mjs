// Apoio dos testes da frente das terras: acrescenta aos dados pequenos de testes/dados o que estes testes usam
// (ferramentas de limpar, materiais, regador de área, muda e fruta, obstáculos e a árvore), sem mexer nos arquivos.
import { novoMundo } from './apoio.mjs';

export function comTerras(b) {
  Object.assign(b.itens, {
    fibra: { nome: 'Fibra', tipo: 'material', venda: 1 },
    madeira: { nome: 'Madeira', tipo: 'material', venda: 1 },
    pedra: { nome: 'Pedra', tipo: 'material', venda: 1 },
    foice: { nome: 'Foice velha', tipo: 'ferramenta', funcao: 'foice', degrau: 1, forca: 1, area: 1 },
    'foice-de-ferro': { nome: 'Foice de ferro', tipo: 'ferramenta', funcao: 'foice', degrau: 2, forca: 2, area: 3, compra: 30, usos: 5, conserto: 9, nivel: 1 },
    machado: { nome: 'Machado velho', tipo: 'ferramenta', funcao: 'machado', degrau: 1, forca: 1 },
    'machado-de-ferro': { nome: 'Machado de ferro', tipo: 'ferramenta', funcao: 'machado', degrau: 2, forca: 2, compra: 40, nivel: 1 },
    picareta: { nome: 'Picareta velha', tipo: 'ferramenta', funcao: 'picareta', degrau: 1, forca: 1 },
    'regador-de-crivo': { nome: 'Regador de crivo', tipo: 'ferramenta', funcao: 'regador', degrau: 3, capacidade: 4, area: 3, compra: 50, nivel: 1 },
    'enxada-de-ferro': { nome: 'Enxada de ferro', tipo: 'ferramenta', funcao: 'enxada', degrau: 2, rapidez: 0.5, compra: 20, usos: 4, conserto: 6, nivel: 1 },
    banana: { nome: 'Banana', tipo: 'colheita', venda: 6 },
    'muda-bananeira': { nome: 'Muda de bananeira', tipo: 'muda', arvore: 'bananeira', compra: 15, nivel: 1 },
  });
  b.itens['cesto-grande'].usos = 3; b.itens['cesto-grande'].conserto = 7; // o cesto grande gasta depressa nos testes
  b.terras.obstaculos = {
    mato: { nome: 'Mato', ferramenta: 'foice', resistencia: 1, forcaMinima: 1, da: { fibra: 1 }, chance: 1, xp: 1 },
    toco: { nome: 'Toco', ferramenta: 'machado', resistencia: 3, forcaMinima: 1, da: { madeira: 2 }, chance: 1, xp: 3 },
    pedra: { nome: 'Pedra', ferramenta: 'picareta', resistencia: 3, forcaMinima: 1, da: { pedra: 2 }, chance: 1, xp: 3 },
    mata: { nome: 'Árvore do mato', ferramenta: 'machado', resistencia: 8, forcaMinima: 2, da: { madeira: 6 }, chance: 1, xp: 8 },
  };
  b.arvores = { bananeira: { nome: 'Bananeira', muda: 'muda-bananeira', fruto: 'banana', cresceSeg: 100, safraSeg: 50, rende: 3, xp: 4, nivel: 1, espacamento: 2, acumula: 1 } };
  b.regras.desgaste = { rendeQuandoGasta: 0.5, avisoEm: 0.4, consertoFracao: 0.3 };
  b.regras.acoes.rocar = 1; b.regras.acoes.cortar = 1; b.regras.acoes.quebrar = 1; b.regras.acoes.plantarMuda = 1; b.regras.acoes.colherFruta = 1;
  b.regras.inicio.vagasNoCinto = 6;
  b.regras.inicio.cinto = ['enxada', 'regador'];
  b.regras.inicio.suporte = [];
  return b;
}
// mundo com os dados acima; "mais(bruto)" muda mais alguma coisa antes de preparar
export function mundoDasTerras(mais, opc) { return novoMundo((b) => { comTerras(b); if (mais) mais(b); }, opc); }
// dá uma ferramenta direto no cinto (como a recompensa de uma missão daria)
export function darFerramenta(m, id) { m.posses.ferramentas[id] = { onde: 'cinto', agua: 0, usos: 0, vez: ++m.posses.vez }; return m; }
// põe um obstáculo à mão numa casa (os dados pequenos não têm mato na área inicial)
export function porObstaculo(m, tipo, x, z) { return m.local.por({ id: `${tipo}-${x}-${z}`, tipo, x, z, v: 0 }); }
