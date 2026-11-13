// Apoio dos testes dos animais de trabalho (boi, cavalo, jumento) e de estimação (gato, cachorro e os especiais).
// testes/dados não traz nenhum deles: aqui entram, sem mexer nos arquivos, o estábulo, os bichos, os apetrechos (arado,
// sela, carroça, barril) e as durações das ações. Números redondos, independentes da economia.
import { novoMundo, porConstrucao, ateParar } from './apoio.mjs';
import { darItem } from '../src/nucleo/sistemas/posses.js';
import { porAnimal } from '../src/nucleo/sistemas/animais.js';

const SORTEIA_GATO = [{ 'semente-milho': 4 }, { 'semente-rabanete': 3 }];
export function comTrabalho(b) {
  Object.assign(b.itens, {
    racao: { nome: 'Ração', tipo: 'racao', venda: 1, compra: 3, nivel: 1 },
    arado: { nome: 'Arado', tipo: 'ferramenta', funcao: 'arado', degrau: 1, nivel: 1, compra: 15 },
    sela: { nome: 'Sela', tipo: 'ferramenta', funcao: 'sela', degrau: 1, nivel: 1, compra: 20 },
    carroca: { nome: 'Carroça', tipo: 'recipiente', funcao: 'carroca', degrau: 1, nivel: 1, compra: 30, capacidade: 10 },
    'barril-de-agua': { nome: 'Barril de água', tipo: 'recipiente', funcao: 'barril', degrau: 1, nivel: 1, compra: 25, capacidade: 8 },
  });
  b.construcoes.estabulo = { nome: 'Estábulo', tipo: 'abrigo', onde: 'fazenda', casas: [4, 3], custo: { ouro: 30 }, obraSeg: 60, nivel: 1, vagas: 4, cocho: 8, bebedouro: 8, limite: 1, xp: 0 };
  Object.assign(b.animais, {
    boi: { nome: 'Boi de arado', familia: 'trabalho', abrigo: 'estabulo', preco: { ouro: 40 }, nivel: 1, come: { racao: 1 }, bebe: 2, cicloSeg: 600, exige: ['arado'], efeito: { tipo: 'arar', casas: 5, seg: 2.5 } },
    cavalo: { nome: 'Cavalo', familia: 'trabalho', abrigo: 'estabulo', preco: { ouro: 50 }, nivel: 1, come: { racao: 1 }, bebe: 2, cicloSeg: 600, exige: ['sela'], efeito: { tipo: 'montaria', velocidade: 7, semFolego: true } },
    jumento: { nome: 'Jumento', familia: 'trabalho', abrigo: 'estabulo', preco: { ouro: 45 }, nivel: 1, come: { racao: 1 }, bebe: 1, cicloSeg: 600, exige: ['carroca'], efeito: { tipo: 'carga', recipiente: 'carroca' } },
    'cavalo-mangalarga': { nome: 'Cavalo mangalarga', familia: 'trabalho', abrigo: 'estabulo', preco: { cash: 50 }, nivel: 1, especial: true, come: { racao: 1 }, bebe: 2, cicloSeg: 600, exige: ['sela'], efeito: { tipo: 'montaria', velocidade: 7, semFolego: true } },
    gato: { nome: 'Gato', familia: 'estimacao', abrigo: null, preco: { ouro: 12 }, nivel: 1, efeito: { tipo: 'mimo', porDia: 1, sorteia: SORTEIA_GATO } },
    cachorro: { nome: 'Cachorro caramelo', familia: 'estimacao', abrigo: null, preco: { ouro: 15 }, nivel: 1, efeito: { tipo: 'mimo', porDia: 1, sorteia: [{ madeira: 2 }, { pedra: 2 }] } },
    'gato-siames': { nome: 'Gato siamês', familia: 'estimacao', abrigo: null, preco: { cash: 20 }, nivel: 1, especial: true, efeito: { tipo: 'mimo', porDia: 1, sorteia: SORTEIA_GATO } },
  });
  b.loja.ouro.itens.push('racao', 'arado', 'sela', 'carroca', 'barril-de-agua');
  b.regras.animais = { semTratoRende: 0.5, aguasPorRega: 4 };
  b.regras.estimacao = { mimosPorDia: 1 };
  Object.assign(b.regras.acoes, { ararComBoi: 2.5, montar: 1.2, apear: 0.8, afagar: 1.2, encherBarril: 4, encherNoBarril: 1.2, abastecerCocho: 1, abastecerBebedouro: 1 });
  b.regras.inicio.vagasNoCinto = 3;
  return b;
}
export function mundoDoTrabalho(mais, opc) { return novoMundo((b) => { comTrabalho(b); if (mais) mais(b); }, opc); }

// o estábulo fica a oeste da lavoura dos testes, longe do campo, do poço e do caminho
export const ESTABULO = [5, 13];
export function porEstabulo(m, x = ESTABULO[0], z = ESTABULO[1]) {
  const e = porConstrucao(m, 'estabulo', x, z);
  const s = m.animais.abrigos[e.id];
  s.cocho = 8; s.bebedouro = 8;
  return e;
}
export function dar(m, itens) { for (const k in itens) darItem(m, k, itens[k], 'teste'); return m; }
// um bicho de trabalho já no estábulo, com o apetrecho (ou sem: apetrecho = false)
export function comBicho(m, especie, apetrecho) {
  if (!m.locais.fazenda.entidades.some((e) => e.tipo === 'estabulo')) porEstabulo(m);
  const a = porAnimal(m, especie, { quieto: true });
  if (apetrecho) dar(m, { [apetrecho]: 1 });
  m.passo();
  return a;
}
// anda passos até a condição valer (ou falha depois de "seg" segundos)
export function ate(m, cond, seg = 60) {
  for (let n = 0; n < seg * 60; n++) { if (cond()) return n / 60; m.passo(); }
  throw new Error('a condição não aconteceu em ' + seg + ' s');
}
export function passos(m, seg) { for (let n = 0; n < seg * 60; n++) m.passo(); }
export { ateParar };
