// A cabeça do jogador: a cada toque, decide UM passo, pela ordem do que mais importa agora, e o faz com os mesmos
// comandos do toque. Cada habilidade roda protegida: se uma quebrar (um sistema que mudou no meio do caminho), ela é
// desligada, o erro vai para o relato, e o jogo segue com as outras.
import { X } from './jogo.mjs';
import { passo, nota, ocupada, naFazenda, cmd, evitar } from './contexto.mjs';
import * as LV from './lavoura.mjs';
import * as TE from './terras.mjs';
import * as AN from './animais.mjs';
import * as IN from './industria.mjs';
import * as PE from './pedidos.mjs';
import * as TR from './trabalho.mjs';
import { progresso } from './progresso.mjs';
import { montarMovel } from './construir.mjs';
import { lerMissao, passoDaMissao, atualizarQuer, investir } from './metas.mjs';

// roda a habilidade "nome"; exceção desliga a habilidade (e conta no relato)
function tenta(J, nome, f) {
  if (J.desligou[nome]) return null;
  try { return f(); } catch (e) {
    J.desligou[nome] = (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e));
    return null;
  }
}

export function decidir(J) {
  J.notas.length = 0;
  const m = J.m;
  const missao = () => { J.reserva = 0; J.reservaPara = ''; return passoDaMissao(J); };
  tenta(J, 'missao', () => lerMissao(J));
  tenta(J, 'quer', () => atualizarQuer(J));
  // dentro do celeiro: o móvel que veio montar, depois sair
  if (J.p.local !== 'fazenda') {
    if (ocupada(J)) return passo(J, 'aguardar');
    if (J.dentroPara) { const s = tenta(J, 'construir', () => montarMovel(J, J.dentroPara)); if (s) return s; J.dentroPara = null; }
    return cmd(J, { tipo: 'sair' }, 1, 'sair');
  }
  // cercada (árvore e mato em volta: o jogo deixa plantar a muda que a tranca): limpa o que der para sair
  if (!ocupada(J) && tenta(J, 'terras', () => TE.alcanceDela(J)) < 30) {
    if (!J.cercada) { J.cercada = true; J.S.preso.push([(m.agora - J.T0) / 1000, `a personagem ficou cercada em ${J.p.x.toFixed(1)},${J.p.z.toFixed(1)} (alcança ${TE.alcanceDela(J)} casas): limpa o obstáculo para sair`]); }
    const s = tenta(J, 'terras', () => TE.limpar(J, null));
    if (s) { s.hab = 'sair do cerco'; return s; }
  } else J.cercada = false;
  // vai entrar no celeiro (montar um móvel): não põe tarefa nova até a fila acabar (no máximo 1 min)
  if (J.vaiEntrar && m.agora - J.vaiEntrar < 60000) {
    if (ocupada(J)) return passo(J, 'aguardar');
    const s = tenta(J, 'missao', missao) || tenta(J, 'investir', () => investir(J));
    J.vaiEntrar = 0;
    if (s) { s.hab = 'entrar'; return s; }
  } else J.vaiEntrar = 0;
  // a cada tantas decisões, a missão e os investimentos vêm primeiro (senão a lavoura de ciclo curto toma todos os toques)
  // escolher o modo é meio passo: a habilidade que escolheu continua na decisão seguinte
  const cont = J.cont;
  J.cont = null;
  if (cont) { const s = tenta(J, cont[0], cont[1]); if (s) { if (s.tipo === 'modo') J.cont = cont; s.hab = cont[0]; if (J.rastro) rastrear(J, cont[0] + '+'); return s; } }
  J.vez = ((J.vez || 0) + 1) % 6;
  if (J.vez === 0) for (const par of [['missao', missao], ['ferramentas', () => LV.ferramentas(J) || LV.consertar(J)], ['investir', () => investir(J)]]) { const s = tenta(J, par[0], par[1]); if (s) { if (s.tipo === 'modo') J.cont = par; s.hab = par[0]; if (J.rastro) rastrear(J, par[0] + '*'); return s; } }
  const ordem = [
    ['progresso', () => progresso(J)],
    ['lavoura', () => LV.venderDoCeleiro(J, 'cheio')],
    ['animais', () => AN.fimDeVida(J)],
    ['industria', () => IN.retirar(J)],
    ['pedidos', () => PE.pedidos(J, J.reservados)],
    ['lavoura', () => LV.colher(J)],
    ['lavoura', () => LV.regar(J)],
    ['terras', () => TE.colherFruta(J)],
    ['animais', () => AN.recolher(J)],
    ['animais', () => AN.tratar(J)],
    ['industria', () => IN.enfileirar(J)],
    ['lavoura', () => LV.plantar(J, { semente: J.metaSemente, arar: J.metaArar })],
    ['missao', missao],
    ['lavoura', () => (J.metaCesto && X.posses.noCesto(m) > 0 ? LV.esvaziar(J, true) : null)],
    ['estimacao', () => TR.afagar(J)],
    ['trabalho', () => TR.levarJumento(J) || TR.cavalgar(J, false)],
    ['ferramentas', () => LV.ferramentas(J) || LV.consertar(J)],
    ['investir', () => investir(J)],
    ['lavoura', () => LV.esvaziar(J, false)],
    ['lavoura', () => LV.venderDoCeleiro(J, false)],
    ['terras', () => (J.p.fila.length < 2 ? TE.limpar(J, null, { quieto: true }) : null)],
  ];
  for (const par of ordem) { const s = tenta(J, par[0], par[1]); if (s) { if (s.tipo === 'modo') J.cont = par; s.hab = par[0]; if (J.rastro) rastrear(J, par[0]); return s; } }
  if (ocupada(J)) return passo(J, 'aguardar');
  // a lavoura está cheia e ela está à toa: o campo cresce um pouco (até onde a zona e o bolso deixam)
  if (m.agora >= (J.proxCampo || 0) && J.aradas >= LV.campoAlvo(J) && !J.campoSemEspaco) {
    J.proxCampo = m.agora + 20000;
    if (LV.campoAlvo(J) < LV.zona(J).length - J.zonaObst) { J.campoExtra += 2; const s = tenta(J, 'lavoura', () => LV.plantar(J, {})); if (s) return s; }
  }
  // nada a fazer: espera o próximo acontecimento (a planta secar ou amadurecer, o bicho produzir, a receita sair)
  let seg = 10;
  const w = [LV.esperaDaLavoura(J), AN.esperaDosAnimais(J), IN.esperaDasIndustrias(J)];
  for (const x of w) if (x !== null && x !== undefined && x < seg) seg = x;
  const porque = J.notas[0] || (X.posses.noCesto(m) > 0 ? 'esperando para esvaziar o cesto' : 'esperando a lavoura crescer');
  return passo(J, 'esperar', { seg: Math.max(0.5, seg), porque });
}

// faz o passo; devolve quantos segundos até o próximo toque (negativo = esperando, sem tocar)
export function fazer(J, S) {
  const m = J.m, g = J.g, T = J.TOQUE;
  let r;
  switch (g.tipo) {
    case 'modo':
      r = m.comando({ tipo: 'escolherModo', modo: g.modo, semente: g.item || undefined });
      S.toques++;
      if (!r.ok) { conta(S.recusas, 'modo: ' + (r.motivo || '?')); evitar(J, 'modo:' + g.modo, 30); return 1; }
      return T;
    case 'casa':
      r = m.comando({ tipo: 'tocarCasa', x: g.x + 0.5, z: g.z + 0.5 });
      S.toques++;
      break;
    case 'entidade':
      r = m.comando({ tipo: 'tocarEntidade', id: g.id });
      S.toques++;
      if (r.ok && r.dados && r.dados.painel) conta(S.recusas, 'toque abriu painel sem ação: ' + r.dados.painel);
      break;
    case 'comprar':
      r = m.comando({ tipo: 'comprar', item: g.item, n: g.n });
      S.toques += 2;
      if (!r.ok) { conta(S.recusas, `compra de ${g.item}: ${r.motivo}`); evitar(J, 'compra:' + g.item, 60); return 1; }
      return 2 * T;
    case 'cmd':
      r = m.comando(g.cmd);
      S.toques += g.n || 2;
      if (!r || !r.ok) { conta(S.recusas, `${g.cmd.tipo}: ${(r && r.motivo) || '?'}`); evitar(J, g.chave || g.cmd.tipo, 20); return 1; }
      return (g.n || 2) * T;
    case 'esperar':
      return -Math.min(g.seg, 20);
    default:
      return 0.3; // aguardar a fila andar
  }
  if (!r.ok) { conta(S.recusas, `toque: ${r.motivo || '?'} (${g.hab || '?'})`); return 1; }
  return r.repetida ? 1 : T;
}
const conta = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

// depuração (BOT_DEPURAR=1): as últimas decisões
function rastrear(J, nome) {
  const g = J.g;
  J.rastro.push(`${((J.m.agora - J.T0) / 1000).toFixed(0)}s ${nome}: ${g.tipo} ${g.id || g.item || g.modo || (g.cmd ? JSON.stringify(g.cmd) : '')} ${g.tipo === 'casa' ? g.x + ',' + g.z : ''} | ${J.notas.join(' / ')}`);
  if (J.rastro.length > 60) J.rastro.shift();
  if (process.env.BOT_DEPURAR === 'compras' && g.tipo === 'comprar') console.log('compra', J.rastro[J.rastro.length - 1], g.n, 'missão', J.meta && J.meta.id, 'tem', JSON.stringify(J.P.bolsa[g.item] || 0), 'quer', JSON.stringify(J.querExtra));
}
