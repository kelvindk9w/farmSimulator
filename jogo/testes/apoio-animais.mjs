// Apoio dos testes da frente dos animais. testes/dados já traz a galinha (animais.json), o ovo, a caixa de ovos e o
// galinheiro com cocho e bebedouro; aqui entram, sem mexer nos arquivos, a vaca e a ovelha com o que elas pedem
// (curral, aprisco, ração, leite, lã, balde, tesoura) e os números do trato. Números redondos, independentes da economia.
import { novoMundo, porConstrucao } from './apoio.mjs';
import { darItem } from '../src/nucleo/sistemas/posses.js';
import { porAnimal } from '../src/nucleo/sistemas/animais.js';

export function comAnimais(b) {
  Object.assign(b.itens, {
    leite: { nome: 'Leite', tipo: 'produto', venda: 12 },
    la: { nome: 'Lã', tipo: 'produto', venda: 30 },
    racao: { nome: 'Ração', tipo: 'racao', venda: 1, compra: 3, nivel: 1 },
    'caixa-de-ovos-grande': { nome: 'Caixa de ovos grande', tipo: 'recipiente', funcao: 'caixa-de-ovos', degrau: 2, capacidade: 9, compra: 20, nivel: 1 },
    balde: { nome: 'Balde', tipo: 'recipiente', funcao: 'balde', capacidade: 2, compra: 9, nivel: 1 },
    'tesoura-de-tosquia': { nome: 'Tesoura de tosquia', tipo: 'ferramenta', funcao: 'tesoura', compra: 15, nivel: 1 },
  });
  Object.assign(b.construcoes, {
    curral: { nome: 'Curral', tipo: 'abrigo', onde: 'fazenda', casas: [4, 3], custo: { ouro: 30 }, obraSeg: 60, nivel: 1, vagas: 2, cocho: 4, bebedouro: 8, limite: 2, xp: 6, ampliacoes: [{ nome: 'Curral para 4', nivel: 1, custo: { ouro: 40 }, obraSeg: 100, vagas: 4, cocho: 8, bebedouro: 16 }] },
    aprisco: { nome: 'Aprisco', tipo: 'abrigo', onde: 'fazenda', casas: [3, 3], custo: { ouro: 30 }, obraSeg: 60, nivel: 1, vagas: 3, cocho: 6, bebedouro: 6, limite: 1, xp: 6 },
  });
  Object.assign(b.animais, {
    vaca: { nome: 'Vaca', familia: 'producao', abrigo: 'curral', preco: { ouro: 40 }, nivel: 1, come: { racao: 1 }, bebe: 2, produto: 'leite', rende: 1, cicloSeg: 300, acumula: 1, ferramenta: 'balde', vidaProdutiva: 10, fimDeVida: { frigorifico: 15, fazendeiro: 20 }, xp: 5 },
    ovelha: { nome: 'Ovelha', familia: 'producao', abrigo: 'aprisco', preco: { ouro: 60 }, nivel: 1, come: { racao: 1 }, bebe: 1, produto: 'la', rende: 1, cicloSeg: 600, acumula: 1, ferramenta: 'tesoura', vidaProdutiva: 5, fimDeVida: { frigorifico: 25, fazendeiro: 30 }, xp: 7 },
  });
  b.loja.ouro.itens.push('racao', 'caixa-de-ovos', 'caixa-de-ovos-grande', 'balde', 'tesoura-de-tosquia');
  b.regras.animais = { semTratoRende: 0.5, aguasPorRega: 4 };
  Object.assign(b.regras.acoes, { abastecerCocho: 1, abastecerBebedouro: 1, recolherOvo: 0.5, ordenhar: 1, tosquiar: 1 });
  b.regras.inicio.vagasNoCinto = 3;
  return b;
}
// um mundo com os dados acima; "mais(bruto)" muda mais alguma coisa antes de preparar
export function mundoDosAnimais(mais, opc) { return novoMundo((b) => { comAnimais(b); if (mais) mais(b); }, opc); }

// onde cada abrigo fica nos testes (casas livres da área inicial, longe do campo e do caminho)
export const LUGAR = { galinheiro: [6, 12], curral: [15, 12], aprisco: [6, 16] };
// põe o abrigo já pronto no lugar de costume (ou em x, z)
export function porAbrigo(m, tipo, x, z, opc) { const [px, pz] = LUGAR[tipo] || [6, 12]; return porConstrucao(m, tipo, x === undefined ? px : x, z === undefined ? pz : z, opc); }
// enche cocho e bebedouro direto (sem a personagem andar)
export function fartura(m, e) { const s = m.animais.abrigos[e.id]; s.cocho = m.dados.construcoes[e.tipo].cocho; s.bebedouro = m.dados.construcoes[e.tipo].bebedouro; return e; }
// galinheiro pronto com n galinhas e o cocho e o bebedouro cheios: { m, e, bichos }
export function galinheiroCom(n = 2, mais, opc) {
  const m = mundoDosAnimais(mais, opc), e = fartura(m, porAbrigo(m, 'galinheiro')), bichos = [];
  for (let k = 0; k < n; k++) bichos.push(porAnimal(m, 'galinha', { quieto: true }));
  return { m, e, bichos };
}
// dá ao jogador os itens (comida no celeiro, caixa, balde, tesoura): dar(m, { milho: 5, 'caixa-de-ovos': 1 })
export function dar(m, itens) { for (const k in itens) darItem(m, k, itens[k], 'teste'); return m; }
