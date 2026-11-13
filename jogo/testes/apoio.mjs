// Apoio dos testes: carrega os dados pequenos de testes/dados (independentes dos números da economia) e cria mundos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../src/nucleo/sistemas/index.js';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { ocupada } from '../src/nucleo/sistemas/personagem.js';
import { plantaEm, estadoDaPlanta } from '../src/nucleo/sistemas/lavoura.js';
import { colocar } from '../src/nucleo/sistemas/construcao.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));

export function lerPasta(pasta) {
  const bruto = {};
  for (const f of fs.readdirSync(pasta)) if (f.endsWith('.json')) bruto[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8'));
  return bruto;
}
export const brutoDeTeste = () => lerPasta(path.join(aqui, 'dados'));

// muda(bruto) permite trocar um número antes de preparar (ex.: mais vagas no cinto)
export function dadosDeTeste(muda) {
  const bruto = brutoDeTeste();
  if (muda) muda(bruto);
  const { dados, problemas } = prepararDados(bruto);
  const graves = problemas.filter((p) => p.grave);
  if (graves.length) throw new Error('dados de teste com erro: ' + graves.map((p) => p.texto).join('; '));
  return dados;
}
export function novoMundo(muda, opc = { agora: 1_000_000 }) { return new Mundo(dadosDeTeste(muda), opc); }

// avança até a personagem ficar sem ter o que fazer (ou até "max" segundos); devolve os segundos passados
export function ateParar(m, max = 120) {
  let n = 0;
  while (ocupada(m) && n < max * 60) { m.passo(); n++; }
  if (ocupada(m)) throw new Error(`a personagem não parou em ${max} s (fila: ${m.personagem.fila.length}, ação: ${m.personagem.acao && m.personagem.acao.id})`);
  return n / 60;
}
// junta os eventos emitidos: registro = ouvirTudo(m); registro.tipos() → ['arou', ...]; registro.de('faltou') → [dados...]
export function ouvirTudo(m) {
  const lista = [];
  m.eventos.ouvir('*', (dados, tipo) => lista.push({ tipo, dados }));
  return { lista, tipos: () => lista.map((e) => e.tipo), de: (tipo) => lista.filter((e) => e.tipo === tipo).map((e) => e.dados), limpar: () => { lista.length = 0; } };
}

// ---------- atalhos de jogo (os mesmos comandos que o toque manda) ----------
export const modo = (m, id, semente) => m.comando({ tipo: 'escolherModo', modo: id, semente });
export const tocar = (m, x, z) => m.comando({ tipo: 'tocarCasa', x: x + 0.5, z: z + 0.5 });
export const tocarEm = (m, id) => m.comando({ tipo: 'tocarEntidade', id });
export function arar(m, casas) { modo(m, 'enxada'); for (const [x, z] of casas) tocar(m, x, z); return ateParar(m); }
export function semear(m, casas, semente = 'semente-rabanete') { modo(m, 'semear', semente); for (const [x, z] of casas) tocar(m, x, z); return ateParar(m); }
export function encher(m) { tocarEm(m, 'poco'); return ateParar(m); }
export function regar(m, casas) { modo(m, 'regar'); for (const [x, z] of casas) tocar(m, x, z); return ateParar(m); }
export function colher(m, casas) { modo(m, 'mao'); for (const [x, z] of casas) tocar(m, x, z); return ateParar(m); }
// enche o regador e rega, quantas idas ao poço forem precisas, até nenhuma das casas ter sede
export function regarTudo(m, casas) {
  for (let k = 0; k < 30; k++) {
    const sede = casas.filter(([x, z]) => { const pl = plantaEm(m, x, z); return pl && estadoDaPlanta(m, pl) === 'sede'; });
    if (!sede.length) return;
    encher(m); regar(m, sede);
  }
  throw new Error('não consegui regar tudo');
}
// ara, semeia, rega e espera a cultura ficar pronta (pulando o relógio a cada rega)
export function plantarAtePronta(m, casas, semente = 'semente-rabanete') {
  arar(m, casas); semear(m, casas, semente);
  const c = m.dados.culturas[m.dados.culturaDaSemente[semente]];
  for (let r = 0; r < c.regas; r++) { regarTudo(m, casas); pular(m, c.tempoSeg / c.regas + 1); }
}
// pula o relógio como quem fecha o jogo e volta depois
export const pular = (m, seg) => m.acertarRelogio(m.agora + seg * 1000);
export const CAMPO = [[12, 13], [13, 13], [12, 14], [13, 14]];

// ---------- construções (frente A) ----------
// põe uma construção já pronta em (x, z), sem cobrar, sem obra e sem evento: porConstrucao(m, 'galinheiro', 11, 12).
// opc = { local, nivel, obraSeg } (obraSeg > 0 = nasce em obra). Devolve a entidade.
export const porConstrucao = (m, id, x, z, opc = {}) => colocar(m, id, x, z, { quieto: true, ...opc });
// dá ouro e materiais para construir à vontade: rico(m, { madeira: 10, tabua: 10 })
export function rico(m, itens = {}, ouro = 1000) { m.posses.ouro += ouro; for (const k in itens) m.posses.bolsa[k] = (m.posses.bolsa[k] || 0) + itens[k]; return m; }
