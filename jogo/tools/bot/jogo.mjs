// O jogo, do jeito que o jogador automático o enxerga. Carrega os sistemas como o jogo carrega
// (src/nucleo/sistemas/index.js) e, de cada arquivo, pega só o que existir: outras frentes ainda mexem nesses
// arquivos, e o jogador não pode quebrar porque uma função mudou de nome ou um sistema ainda não entrou no jogo.
//   X.<arquivo>            o módulo (ou undefined, se o sistema não está no jogo)
//   precisa(rotulo, {...}) confere, uma vez, se o que uma habilidade usa existe; se não, a habilidade fica desligada
//                          e o motivo vai para o relato
// Um arquivo de sistema só é importado aqui se o próprio jogo já o importou (o sistema está registrado): importar
// por conta própria um sistema que o jogo não carrega mudaria o jogo que se está medindo.
import '../../src/nucleo/sistemas/index.js';
import { Mundo } from '../../src/nucleo/mundo.js';
import * as registro from '../../src/nucleo/registro.js';

const temSistema = (id) => registro.SISTEMAS.some((s) => s.id === id);
const sempre = () => true;
const ARQUIVOS = {
  guia: ['../../src/nucleo/guia.js', sempre],
  local: ['../../src/nucleo/local.js', sempre],
  caminho: ['../../src/nucleo/caminho.js', sempre],
  personagem: ['../../src/nucleo/sistemas/personagem.js', () => temSistema('personagem')],
  posses: ['../../src/nucleo/sistemas/posses.js', () => temSistema('posses')],
  loja: ['../../src/nucleo/sistemas/loja.js', () => temSistema('loja')],
  lavoura: ['../../src/nucleo/sistemas/lavoura.js', () => temSistema('lavoura')],
  missoes: ['../../src/nucleo/sistemas/missoes.js', () => temSistema('missoes')],
  terras: ['../../src/nucleo/sistemas/terras.js', () => temSistema('terras')],
  lotes: ['../../src/nucleo/sistemas/lotes.js', () => temSistema('lotes')],
  limpeza: ['../../src/nucleo/sistemas/limpeza.js', () => !!registro.ACOES.rocar],
  desgaste: ['../../src/nucleo/sistemas/desgaste.js', () => temSistema('desgaste')],
  arvores: ['../../src/nucleo/sistemas/arvores.js', () => temSistema('arvores')],
  diaria: ['../../src/nucleo/sistemas/diaria.js', () => temSistema('diaria')],
  conquistas: ['../../src/nucleo/sistemas/conquistas.js', () => temSistema('conquistas')],
  correio: ['../../src/nucleo/sistemas/correio.js', () => temSistema('correio')],
  aspersor: ['../../src/nucleo/sistemas/aspersor.js', () => temSistema('aspersor')],
  construcao: ['../../src/nucleo/sistemas/construcao.js', () => temSistema('construcao')],
  celeiroDentro: ['../../src/nucleo/sistemas/celeiro-dentro.js', () => temSistema('celeiroDentro')],
  animais: ['../../src/nucleo/sistemas/animais.js', () => temSistema('animais')],
  producao: ['../../src/nucleo/sistemas/producao.js', () => temSistema('producao')],
  industria: ['../../src/nucleo/sistemas/industria.js', () => temSistema('industria')],
  pedidos: ['../../src/nucleo/sistemas/pedidos.js', () => temSistema('pedidos')],
  trabalho: ['../../src/nucleo/sistemas/trabalho.js', () => temSistema('trabalho')],
  estimacao: ['../../src/nucleo/sistemas/estimacao.js', () => temSistema('estimacao')],
  comeco: ['../../src/nucleo/sistemas/comeco.js', () => temSistema('comeco')],
  banca: ['../../src/nucleo/sistemas/banca.js', () => temSistema('banca')],
};

export const X = {};
export const FORA = []; // arquivos que o jogo ainda não carrega (ou que não abriram), com o porquê
for (const [nome, [arq, existe]] of Object.entries(ARQUIVOS)) {
  if (!existe()) { FORA.push(`${nome}: o sistema não está em src/nucleo/sistemas/index.js`); continue; }
  try { X[nome] = await import(new URL(arq, import.meta.url)); } catch (e) { FORA.push(`${nome}: ${e.message}`); }
}

// o que cada habilidade usa e não achou (o relato lista)
export const DESLIGADAS = [];
export function precisa(rotulo, pedidos) {
  const falta = [];
  for (const mod in pedidos) for (const n of pedidos[mod]) if (!X[mod] || X[mod][n] === undefined) falta.push(`${mod}.${n}`);
  if (falta.length) DESLIGADAS.push(`${rotulo}: falta ${falta.join(', ')}`);
  return !falta.length;
}

export { Mundo, registro };
