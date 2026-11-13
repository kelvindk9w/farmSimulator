// Apoio dos testes das indústrias e dos pedidos: junta aos dados pequenos de testes/dados os de testes/dados/industria
// (receitas, pedidos, moinho, cozinha e o quadro), que não dependem dos números da economia. Ficam numa pasta à parte
// para o toque na bancada dos outros testes continuar sendo o da frente de construir.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { novoMundo, lerPasta } from './apoio.mjs';
import { colocar } from '../src/nucleo/sistemas/construcao.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const QUADRO_EM = [16, 13]; // onde o quadro de pedidos nasce nos testes

export function comIndustria(b) {
  const mais = lerPasta(path.join(aqui, 'dados', 'industria'));
  // o que os dados pequenos já têm (o ovo, a galinha e o galinheiro são da frente dos animais) fica como está
  for (const k in mais.itens) if (!b.itens[k]) b.itens[k] = mais.itens[k];
  if (!b.itens.ovo) b.itens.ovo = { nome: 'Ovo', tipo: 'produto', venda: 3 };
  for (const k in mais.construcoes) if (!b.construcoes[k]) b.construcoes[k] = mais.construcoes[k];
  b.receitas = mais.receitas;
  b.pedidos = mais.pedidos;
  b.terras.pontos['quadro-de-pedidos'] = QUADRO_EM;
  b.regras.industria = { filaInicial: 2, cancelarDevolve: true };
  b.regras.concluir = { coef: 0.28, expoente: 0.7, gratisAteSeg: 30, vale: ['obra', 'fila', 'muda'] };
  b.regras.acoes.retirarProduto = 1;
  b.regras.celeiro.capacidade = 40;
  if (b.construcoes['prateleira-simples']) b.construcoes['prateleira-simples'].capacidade = 40; // o espaço do celeiro vem das prateleiras
  b.loja.ouro.itens.push('cartela');
  return b;
}
// mundo com os dados acima; "mais(bruto)" muda mais alguma coisa antes de preparar
export function mundoDaIndustria(mais, opc) { return novoMundo((b) => { comIndustria(b); if (mais) mais(b); }, opc); }

// põe o jogador no nível dado (sem dar as recompensas de nível)
export function noNivel(m, n) { m.progresso.nivel = n; m.progresso.xp = Math.max(m.progresso.xp, m.dados.niveis.limiar[n] || 0); return m; }
// dá itens direto no estoque: colheita e produto no celeiro, o resto na bolsa
export function dar(m, itens) {
  for (const k in itens) {
    const t = m.dados.itens[k].tipo, onde = t === 'colheita' || t === 'produto' ? m.posses.celeiro.itens : m.posses.bolsa;
    onde[k] = (onde[k] || 0) + itens[k];
  }
  return m;
}
// uma indústria já pronta: bancada em (12, 16), moinho em (15, 16), cozinha em (6, 14)
const LUGAR = { 'bancada-de-carpintaria': [12, 16], moinho: [15, 16], cozinha: [6, 14] };
export function porIndustria(m, id, opc = {}) { const [x, z] = LUGAR[id]; return colocar(m, id, x, z, { quieto: true, ...opc }); }
export const produzir = (m, e, receita) => m.comando({ tipo: 'produzir', entidade: e.id, receita });
export const retirar = (m, e) => m.comando({ tipo: 'retirar', entidade: e.id });
