// Apoio dos testes: carrega os dados pequenos de testes/dados (independentes dos números da economia) e cria mundos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../src/nucleo/sistemas/index.js';
import { Mundo } from '../src/nucleo/mundo.js';
import { prepararDados } from '../src/nucleo/dados.js';
import { ocupada } from '../src/nucleo/sistemas/personagem.js';

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
