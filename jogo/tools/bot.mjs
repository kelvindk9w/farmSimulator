// Jogador automático: joga o jogo de verdade (os mesmos comandos do toque, a mesma lógica, os dados de dados/),
// sem tela, do nível 1 até onde o conteúdo for, e mede o ritmo: o nível ao longo dos dias, o tempo de cada missão,
// de onde vem e para onde vai o ouro, o que construiu, os bichos, as receitas, os pedidos, o tempo dela andando e
// trabalhando, as idas ao poço e ao celeiro, e onde o jogador ficou sem ter o que fazer (e por quê).
//   node tools/bot.mjs --horas 2                       2 horas sem parar (perfil "direto")
//   node tools/bot.mjs --horas 168 --perfil regular    uma semana de 3 sessões de 15 min por dia
//   --resumo                                           só a tabela curta (dia, nível, ouro, missões)
//   --json arquivo.json                                grava as medidas em JSON
// Perfis: direto (não fecha o jogo), casual, regular, engajado (as sessões do modelo de tools/economia/ritmo.mjs).
// O bot não compra cash nem gasta cash em "terminar agora": o cash grátis fica guardado e só é relatado.
// Por dentro: tools/bot/ (um arquivo por assunto: lavoura, terras, construir, animais, industria, pedidos,
// progresso, trabalho, metas, decidir, medir).
import fs from 'node:fs';
import path from 'node:path';
import { raiz, lerDados, conferirDados } from './comum.mjs';
import { X, Mundo, FORA, DESLIGADAS } from './bot/jogo.mjs';
import { criarJogador, ocupada } from './bot/contexto.mjs';
import { decidir, fazer } from './bot/decidir.mjs';
import { criarMedidas, ouvir, relato, resumo } from './bot/medir.mjs';

const PERFIS = {
  direto: { nome: 'direto', sessoes: null, aproveitamento: 0.8, inicio: 8 },
  casual: { nome: 'casual', sessoes: [[8, 10], [20, 10]], aproveitamento: 0.65 },
  regular: { nome: 'regular', sessoes: [[7.5, 15], [12.5, 15], [20, 15]], aproveitamento: 0.7 },
  engajado: { nome: 'engajado', sessoes: [[7, 20], [9.5, 20], [12.5, 20], [16, 20], [19, 20], [22, 20]], aproveitamento: 0.75 },
};
const arg = (nome, padrao) => { const i = process.argv.indexOf('--' + nome); if (i >= 0 && process.argv[i + 1] !== undefined && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]; const j = process.argv.find((a) => a.startsWith(`--${nome}=`)); return j ? j.split('=')[1] : padrao; };
const tem = (nome) => process.argv.includes('--' + nome);
const HORAS = Math.max(0.05, Number(arg('horas', 1)) || 1);
const perfil = PERFIS[arg('perfil', 'direto')];
if (!perfil) { console.error(`perfil desconhecido; use um destes: ${Object.keys(PERFIS).join(', ')}`); process.exit(2); }
const ADIANTE = 5; // quantas tarefas o jogador deixa na fila antes de esperar
const DIA = 86400000, FUSO_MIN = -180; // o relógio do bot é o de Brasília: o dia do presente vira à meia-noite dela

const { dados, problemas, texto } = conferirDados(lerDados(path.join(raiz, 'dados')));
if (problemas.some((p) => p.grave)) { console.error(texto); process.exit(1); }

// ---------- o relógio: a primeira sessão começa às h0 (hora local) de uma segunda-feira ----------
const h0 = perfil.sessoes ? perfil.sessoes[0][0] : perfil.inicio;
const T0 = Date.UTC(2026, 0, 5) + (h0 * 3600000 - FUSO_MIN * 60000);
const FIM = T0 + HORAS * 3600000;
const agenda = [];
if (!perfil.sessoes) agenda.push([T0, FIM]);
else for (let d = 0; ; d++) {
  let parou = false;
  for (const [hora, min] of perfil.sessoes) {
    const ini = T0 + (d * 24 + hora - h0) * 3600000;
    if (ini >= FIM) { parou = true; break; }
    agenda.push([ini, Math.min(FIM, ini + min * 60000)]);
  }
  if (parou) break;
}

const m = new Mundo(dados, { agora: T0 });
if (typeof m.comandos.fuso === 'function') m.comando({ tipo: 'fuso', minutos: FUSO_MIN });
const S = criarMedidas();
const J = criarJogador(m, perfil, { T0, FIM, agenda, S });
J.querExtra = {};
if (process.env.BOT_DEPURAR) J.rastro = [];
const rel = () => (m.agora - T0) / 1000;
ouvir(m, S, rel);
const diaDe = (t) => Math.floor((t + FUSO_MIN * 60000) / DIA);
const dia0 = diaDe(T0);
function fotoDoDia() {
  const d = diaDe(m.agora - 1) - dia0 + 1;
  S.dias[d - 1] = { dia: d, nivel: m.progresso.nivel, xp: m.progresso.xp, ouro: m.posses.ouro, missoes: S.missoes.length, jogado: S.jogado };
}

// ---------- jogar ----------
let grave = null;
const t0 = Date.now();
function sessao(ate) {
  S.sessoes++;
  let livreEm = 0, motivo = null, semOuro = null; // livreEm: quando ela toca de novo; motivo: por que está parada
  while (m.agora < ate) {
    if (m.agora >= livreEm) {
      motivo = null; semOuro = null;
      if (m.personagem.fila.length < ADIANTE) {
        J.jogadoSeg = S.jogado;
        decidir(J);
        const espera = fazer(J, S);
        if (espera < 0) {
          motivo = J.g.porque; livreEm = m.agora - espera * 1000;
          if (J.reservaPara && m.posses.ouro < J.reserva) semOuro = J.reservaPara;
        } else livreEm = m.agora + espera * 1000;
      } else livreEm = m.agora + 300;
    }
    try { m.passo(); } catch (e) { grave = `o jogo quebrou no passo ${m.n} (${(m.agora - T0) / 1000} s): ${e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e}`; return false; }
    S.jogado += 1 / 60;
    if (motivo && !ocupada(J)) {
      S.parado[motivo] = (S.parado[motivo] || 0) + 1 / 60;
      if (semOuro) { S.semOuro += 1 / 60; S.semOuroPor[semOuro] = (S.semOuroPor[semOuro] || 0) + 1 / 60; }
    }
  }
  return true;
}
for (const [ini, fim] of agenda) {
  if (ini > m.agora) {
    S.ausente += (ini - m.agora) / 1000;
    try { m.acertarRelogio(ini); } catch (e) { grave = `o jogo quebrou ao voltar de uma ausência: ${e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e}`; break; }
  }
  if (!sessao(fim)) break;
  fotoDoDia();
}
if (!grave && m.agora < FIM) { S.ausente += (FIM - m.agora) / 1000; try { m.acertarRelogio(FIM); } catch (e) { grave = `o jogo quebrou na última ausência: ${e}`; } }
for (let i = 0; i < S.dias.length; i++) if (!S.dias[i]) S.dias[i] = { ...S.dias[i - 1], dia: i + 1 };

// ---------- o relato ----------
const cfg = { perfil: perfil.nome, horas: HORAS, rodou: (Date.now() - t0) / 1000, fora: FORA, desligadas: DESLIGADAS, grave };
if (tem('resumo')) {
  const a = X.missoes ? X.missoes.missaoAtual(m) : null;
  const fim = a ? `missão no fim: ${a.missao.id} (${a.conta}/${a.n}${a.esperaNivel ? `, espera o nível ${a.esperaNivel}` : ''})${grave ? ' | O JOGO QUEBROU: ' + grave : ''}` : (grave ? 'O JOGO QUEBROU: ' + grave : 'sem missão no fim');
  console.log(resumo(S, fim));
}
else console.log(relato(J, S, cfg));
const arqJson = arg('json', null);
if (arqJson) {
  const a = X.missoes ? X.missoes.missaoAtual(m) : null;
  const saida = {
    perfil: perfil.nome, horas: HORAS, rodouSeg: cfg.rodou, grave, nivel: m.progresso.nivel, xp: m.progresso.xp, ouro: m.posses.ouro, cash: m.posses.cash,
    missaoNoFim: a ? { id: a.missao.id, conta: a.conta, n: a.n, esperaNivel: a.esperaNivel, nota: J.notas[0] || null } : null,
    reserva: { para: J.reservaPara, ouro: J.reserva }, habilidadesFora: [...FORA, ...DESLIGADAS, ...Object.entries(J.desligou).map(([k, v]) => `${k}: ${v}`)],
    tempoDela: m.personagem.conta, ...S,
  };
  fs.writeFileSync(path.resolve(arqJson), JSON.stringify(saida, null, 1) + '\n');
}
if (J.rastro) { console.log('\n--- as últimas decisões ---'); for (const l of J.rastro) console.log(l); console.log('quer', JSON.stringify(J.quer), 'plano', JSON.stringify(Object.fromEntries(Object.entries(J.plano || {}).map(([k, r]) => [k, r.id]))), 'celeiro', JSON.stringify(m.posses.celeiro), 'cesto', JSON.stringify(m.posses.cesto), 'bolsa', JSON.stringify(m.posses.bolsa)); }
if (grave) process.exitCode = 3;
