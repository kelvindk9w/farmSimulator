// Animais de produção (galinha, vaca, ovelha): a família "producao" da base de animais (animais.js).
// O bicho rende "rende" por ciclo tratado e a metade (regras.animais.semTratoRende) no ciclo sem trato; o meio
// produto fica guardado em "resto" e sai quando junta um inteiro. O ninho (úbere, lã) guarda até "acumula" produtos;
// aí o bicho para (não come, não perde nada) e espera a coleta. Recolhe-se com a ferramenta certa:
//   recipiente (caixa de ovos, balde): o produto vai no recipiente, que leva "capacidade" e esvazia junto com o
//     cesto, no celeiro ou na banca (viaja em posses.cesto.itens sem ocupar o lugar do cesto: posses.foraDoCesto);
//   ferramenta (tesoura de tosquia): fica no cinto, como a enxada, e o produto vai para o cesto.
// Vida produtiva: contada em produtos ("vidaProdutiva" × "rende": 300 ovos, 400 ordenhas, 200 tosquias). Nos últimos
// 10% o jogo avisa; no fim o bicho para de produzir (e de comer) e espera o jogador escolher, sem pressa:
// vender ao frigorífico, vender a um fazendeiro ou ficar com ele de estimação (não produz, ocupa a vaga e volta a comer).
//   campos da família no bicho: resto (fração de produto), fim ('' | 'espera' | 'estimacao'), avisou
import { registrarSistema, registrarAcao, registrarEvento } from '../registro.js';
import { somar } from '../util.js';
import { RECIPIENTES, espacoNoCesto, porNoCesto, ferramentaNoCinto, ferramentaNoSuporte, ganharOuro, darItem } from './posses.js';
import { darXp } from './niveis.js';
import { gastar, rendeDe } from './desgaste.js';
import { construcaoPorId, estaPronta } from './construcao.js';
import { registrarFamilia, animalPorId, defDoAnimal, comecarCiclo, pararCiclo, tirarAnimal, resolver, cicloDoAnimal, faltaNoAbrigo } from './animais.js';

const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };
const AVISO_DE_FIM = 0.1; // avisa quando resta este tanto da vida produtiva
const eDeProducao = (a) => a.familia === 'producao';

// ---------- como se recolhe ----------
// a ação da personagem para cada ferramenta de recolher (a duração vem de regras.acoes)
const ACAO_DA_FERRAMENTA = { 'caixa-de-ovos': 'recolherOvo', balde: 'ordenhar', tesoura: 'tosquiar' };
export const acaoDeRecolher = (d) => ACAO_DA_FERRAMENTA[d.ferramenta] || 'recolherOvo';
// 'recipiente' (caixa, balde) | 'ferramenta' (tesoura, no cinto) | 'mao' (nada: vai direto para o cesto)
export function jeitoDeRecolher(m, d) { return !d.ferramenta ? 'mao' : m.dados.recipienteDoProduto[d.produto] ? 'recipiente' : 'ferramenta'; }
// o recipiente que o jogador tem para a função (o de maior degrau), ou null
export function recipienteDe(m, funcao) {
  const I = m.dados.itens;
  let achou = null;
  for (const id of m.posses.recipientes) if (I[id] && I[id].funcao === funcao && (!achou || I[id].degrau > I[achou].degrau)) achou = id;
  return achou;
}
// quanto o recipiente leva (gasto, leva menos até o conserto, como o cesto) e quanto já tem dentro
export const capacidadeDoRecipiente = (m, id) => Math.max(1, Math.floor(m.dados.itens[id].capacidade * rendeDe(m, id)));
export function noRecipiente(m, funcao) {
  const R = m.dados.recipienteDoProduto, c = m.posses.cesto.itens;
  let n = 0;
  for (const k in c) if (R[k] === funcao) n += c[k];
  return n;
}
// o item mais simples que faz a função (é o que a dica manda comprar): o de menor degrau
export function itemDaFuncao(m, funcao) {
  let achou = null;
  for (const it of Object.values(m.dados.itens)) if (it.funcao === funcao && (!achou || it.degrau < achou.degrau)) achou = it;
  return achou ? achou.id : null;
}
// Dá para recolher o produto desta espécie agora? Devolve { ok, cabe } ou o motivo:
//   falta-de-recolher { item (o que comprar), funcao, animal }, recipiente-cheio { item (o recipiente), produto }, cesto-cheio
export function podeRecolher(m, d) {
  const jeito = jeitoDeRecolher(m, d);
  if (jeito === 'recipiente') {
    const rec = recipienteDe(m, d.ferramenta);
    if (!rec) return NAO('falta-de-recolher', { item: itemDaFuncao(m, d.ferramenta), funcao: d.ferramenta, animal: d.id }, true);
    const cabe = capacidadeDoRecipiente(m, rec) - noRecipiente(m, d.ferramenta);
    return cabe > 0 ? { ok: true, cabe, recipiente: rec } : NAO('recipiente-cheio', { item: rec, produto: d.produto }, true);
  }
  if (jeito === 'ferramenta' && !ferramentaNoCinto(m, d.ferramenta) && !ferramentaNoSuporte(m, d.ferramenta)) return NAO('falta-de-recolher', { item: itemDaFuncao(m, d.ferramenta), funcao: d.ferramenta, animal: d.id }, true);
  const cabe = espacoNoCesto(m);
  return cabe > 0 ? { ok: true, cabe, recipiente: null } : NAO('cesto-cheio', null, true);
}

// ---------- consultas ----------
// a vida produtiva do bicho: { total, feitos, restam, fracao (do que resta, 0..1), perto, acabou }; total 0 = não tem fim
export function vidaDoAnimal(m, a, out = {}) {
  const d = defDoAnimal(m, a), total = d && d.vidaProdutiva > 0 ? d.vidaProdutiva * d.rende : 0;
  out.total = total; out.feitos = a.produzidos || 0;
  out.restam = total ? Math.max(0, total - out.feitos) : Infinity;
  out.fracao = total ? out.restam / total : 1;
  out.acabou = !!a.fim;
  out.perto = !out.acabou && total > 0 && out.restam <= Math.max(1, Math.floor(total * AVISO_DE_FIM));
  return out;
}
// o primeiro bicho do abrigo com produto esperando (da ação pedida, se houver), ou null
function prontoNoAbrigo(m, idDaEntidade, acao) {
  for (const a of m.animais.lista) {
    if (a.abrigo !== idDaEntidade || !eDeProducao(a) || !(a.pronto > 0)) continue;
    if (!acao || acaoDeRecolher(defDoAnimal(m, a)) === acao) return a;
  }
  return null;
}
// quantos produtos esperam a coleta neste abrigo
export function prontosNoAbrigo(m, idDaEntidade) { let n = 0; for (const a of m.animais.lista) if (a.abrigo === idDaEntidade && eDeProducao(a)) n += a.pronto || 0; return n; }
// o que o balão em cima do abrigo mostra: { produto (item pronto, ou null), comida, agua (faltam), fim (alguém espera o destino) }
export function pedidoDoAbrigo(m, e, out = {}) {
  out.produto = null; out.fim = false;
  for (const a of m.animais.lista) {
    if (a.abrigo !== e.id || !eDeProducao(a)) continue;
    if (a.pronto > 0 && !out.produto) out.produto = defDoAnimal(m, a).produto;
    if (a.fim === 'espera') out.fim = true;
  }
  faltaNoAbrigo(m, e, out);
  return out;
}
// como o bicho está, para o painel: 'fim' (espera o destino) | 'estimacao' | 'pronto' (ninho cheio, parou) |
// 'produzindo' | 'sem-trato' (produzindo a metade); mais o relógio do ciclo
export function situacaoDoAnimal(m, a, out = {}) {
  cicloDoAnimal(m, a, out);
  const d = defDoAnimal(m, a);
  out.pronto = a.pronto || 0;
  out.estado = a.fim === 'espera' ? 'fim' : a.fim === 'estimacao' ? 'estimacao' : !out.rodando ? 'pronto' : a.tratado ? 'produzindo' : 'sem-trato';
  out.cheio = !!d && out.pronto >= d.acumula;
  return out;
}

// ---------- a família ----------
const arred = (v) => Math.round(v * 1e6) / 1e6;
registrarFamilia('producao', {
  aoChegar(m, a) { a.resto = 0; a.fim = ''; a.avisou = false; },
  aoCarregar(m, a) {
    const d = defDoAnimal(m, a);
    a.pronto = Math.max(0, Math.round(a.pronto) || 0); a.produzidos = Math.max(0, Math.round(a.produzidos) || 0);
    a.resto = a.resto > 0 && a.resto < 1 ? a.resto : 0; a.fim = a.fim === 'espera' || a.fim === 'estimacao' ? a.fim : ''; a.avisou = !!a.avisou;
    // quem espera (o destino ou a coleta) não está em ciclo; quem devia estar e não está, começa agora
    const parado = a.fim === 'espera' || (!a.fim && a.pronto >= d.acumula);
    if (parado) pararCiclo(m, a); else if (!(a.cicloDesde > 0) && a.abrigo) comecarCiclo(m, a);
  },
  // o ciclo acabou: sai o produto (inteiro se comeu e bebeu, a metade se não); false = o bicho para e espera
  aoCiclo(m, a, tratado, quando) {
    if (a.fim === 'estimacao') return true; // aposentado: só come
    if (a.fim) return false;
    const d = defDoAnimal(m, a), total = d.vidaProdutiva > 0 ? d.vidaProdutiva * d.rende : Infinity;
    a.resto = arred((a.resto || 0) + d.rende * (tratado ? 1 : m.dados.trato.semTratoRende));
    const n = Math.min(Math.floor(a.resto + 1e-9), total - a.produzidos);
    if (n > 0) {
      a.resto = arred(a.resto - n); a.pronto += n; a.produzidos += n;
      m.eventos.emitir('animalProduziu', { id: a.id, animal: d.id, item: d.produto, n, entidade: a.abrigo, quando });
    }
    if (a.produzidos >= total) {
      a.fim = 'espera'; a.resto = 0;
      m.eventos.emitir('fimDeVida', { id: a.id, animal: d.id, entidade: a.abrigo });
      return false;
    }
    if (!a.avisou && vidaDoAnimal(m, a).perto) { a.avisou = true; m.eventos.emitir('fimDeVidaPerto', { id: a.id, animal: d.id, restam: total - a.produzidos, item: d.produto, entidade: a.abrigo }); }
    return a.pronto < d.acumula; // ninho cheio: para e espera a coleta
  },
  // no modo mão, tocar no abrigo com produto pronto recolhe direto; o resto é com o painel do abrigo
  toqueNoAbrigo(m, e) {
    if (m.modo.id !== 'mao') return null;
    const a = prontoNoAbrigo(m, e.id);
    if (!a) return null;
    const d = defDoAnimal(m, a), acao = acaoDeRecolher(d);
    if (naFila(m, acao, e.id)) return { acao: null, texto: 'na-fila' };
    if (!podeRecolher(m, d).ok) return null; // falta a ferramenta ou o recipiente encheu: o painel explica
    return { acao, dados: { animal: d.id, item: d.produto, n: prontosNoAbrigo(m, e.id), construcao: e.tipo } };
  },
});
const naFila = (m, acao, entidade) => { const p = m.personagem, s = (t) => t && t.tipo === 'agir' && t.acao === acao && t.entidade === entidade; return s(p.tarefa) || p.fila.some(s); };

// ---------- recolher: uma ação por bicho; havendo outro pronto e lugar, ela emenda no seguinte ----------
const abrigoDoAlvo = (m, alvo) => { const e = m.local.porId[alvo.entidade]; return e && estaPronta(e) && m.animais.abrigos[e.id] ? e : null; };
function registrarRecolher(id, mais) {
  registrarAcao({
    id, ...mais,
    pode(m, alvo) {
      const e = abrigoDoAlvo(m, alvo);
      if (!e) return NAO('nao-existe');
      resolver(m);
      const a = prontoNoAbrigo(m, e.id, id);
      if (!a) return NAO('nada-para-recolher', { construcao: e.tipo });
      const r = podeRecolher(m, defDoAnimal(m, a));
      return r.ok ? SIM : r;
    },
    aoEfeito(m, alvo) {
      const e = abrigoDoAlvo(m, alvo), a = prontoNoAbrigo(m, e.id, id), d = defDoAnimal(m, a), r = podeRecolher(m, d);
      const n = Math.min(a.pronto, r.cabe);
      if (r.recipiente) { somar(m.posses.cesto.itens, d.produto, n); gastar(m, r.recipiente, n); } else porNoCesto(m, d.produto, n);
      a.pronto -= n;
      // tirou do ninho: o bicho que esperava a coleta volta a produzir (e come) agora
      if (!a.fim && !(a.cicloDesde > 0) && a.pronto < d.acumula) comecarCiclo(m, a);
      m.eventos.emitir('recolheu', { item: d.produto, n, animal: d.id, id: a.id, entidade: e.id, x: e.x + e.l / 2, z: e.z + e.p / 2 });
      darXp(m, d.xp * n, 'recolher');
      const outro = prontoNoAbrigo(m, e.id, id);
      if (outro && podeRecolher(m, defDoAnimal(m, outro)).ok && !m.personagem.fila.some((t) => t.tipo === 'agir' && t.acao === id && t.entidade === e.id)) m.personagem.fila.unshift({ tipo: 'agir', acao: id, entidade: e.id, args: null, auto: true });
    },
  });
}
registrarRecolher('recolherOvo', { dur: 0.8, efeitoEm: 0.5, estadoVisual: 'colher' });
registrarRecolher('ordenhar', { dur: 2.5, efeitoEm: 2.0, estadoVisual: 'ordenhar' });
registrarRecolher('tosquiar', { ferramenta: 'tesoura', dur: 3, efeitoEm: 2.4, estadoVisual: 'tosquiar' });

// ---------- eventos que missões e conquistas escutam ----------
const um = (v, serve) => v === undefined || (Array.isArray(v) ? v.some(serve) : serve(v));
const produtores = (dados) => Object.values(dados.animais).filter((a) => a.familia === 'producao');
registrarEvento('recolheu', {
  campos: ['item', 'n', 'animal', 'entidade'],
  aceita: (dados, f) => um(f.item, (it) => produtores(dados).some((a) => a.produto === it)) && um(f.animal, (id) => produtores(dados).some((a) => a.id === id)),
});

const falha = (m, r, quieto) => { if (!quieto) m.eventos.emitir('faltou', { motivo: r.motivo, dados: r.dados }); return { ok: false, motivo: r.motivo, dados: r.dados }; };

registrarSistema({
  id: 'producao',
  iniciar(m) {
    // os recipientes de recolher passam a ter papel no jogo (a loja só vende recipiente que tem)
    for (const f of Object.values(m.dados.recipienteDoProduto)) if (!RECIPIENTES[f]) RECIPIENTES[f] = () => {};
  },
  comandos: {
    // recolher { entidade }: a personagem vai até o abrigo e recolhe de todos os bichos prontos (o botão "Recolher tudo")
    recolher(m, c) {
      const e = construcaoPorId(m, c.entidade), p = m.personagem;
      if (!e || e.local !== p.local) return falha(m, NAO('nao-existe'), true);
      resolver(m);
      const a = prontoNoAbrigo(m, e.id);
      if (!a) return falha(m, NAO('nada-para-recolher', { construcao: e.tipo }), c.quieto);
      const d = defDoAnimal(m, a), r = podeRecolher(m, d), acao = acaoDeRecolher(d);
      if (!r.ok) return falha(m, r, c.quieto);
      if (naFila(m, acao, e.id)) return { ok: true, repetida: true };
      if (p.fila.length + 1 > m.dados.regras.filaMax) return falha(m, NAO('fila-cheia'), c.quieto);
      p.rumando = false;
      p.fila.push({ tipo: 'agir', acao, entidade: e.id, args: null });
      return { ok: true, dados: { acao, n: prontosNoAbrigo(m, e.id) } };
    },
    // destinoDoAnimal { id, destino: 'frigorifico' | 'fazendeiro' | 'estimacao' }: a escolha do fim da vida produtiva.
    // Quem ficou de estimação ainda pode ser vendido depois. O que estava no ninho vai para o celeiro: nada se perde.
    destinoDoAnimal(m, c) {
      const a = animalPorId(m, c.id), d = a && defDoAnimal(m, a);
      if (!a || !d || !eDeProducao(a)) return falha(m, NAO('nao-existe'), true);
      if (!a.fim) return falha(m, NAO('ainda-produz', { animal: d.id, restam: vidaDoAnimal(m, a).restam }), c.quieto);
      if (c.destino === 'estimacao') {
        if (a.fim === 'estimacao') return { ok: true, repetida: true };
        a.fim = 'estimacao';
        comecarCiclo(m, a);
        m.eventos.emitir('aposentou', { id: a.id, animal: d.id, entidade: a.abrigo });
        return { ok: true, dados: { id: a.id, animal: d.id, destino: 'estimacao' } };
      }
      if (c.destino !== 'frigorifico' && c.destino !== 'fazendeiro') return falha(m, NAO('destino-desconhecido'), true);
      const ouro = d.fimDeVida[c.destino], sobra = a.pronto || 0;
      if (sobra > 0) darItem(m, d.produto, sobra, 'animal');
      tirarAnimal(m, a.id);
      ganharOuro(m, ouro, 'animal');
      m.eventos.emitir('vendeuAnimal', { id: a.id, animal: d.id, destino: c.destino, ouro, sobra, item: d.produto, entidade: a.abrigo });
      return { ok: true, dados: { id: a.id, animal: d.id, destino: c.destino, ouro, sobra } };
    },
  },
});
