// A banca na porteira: sempre compra, pelo preço base de cada item (campo "venda" de itens.json), na hora.
// No começo humilde, antes da banca, o que vende é o caixote de venda da beira da estrada (construcoes.json:
// "caixote-de-venda"): ela põe a colheita no caixote, até "vagas" coisas por vez, e os fregueses que passam levam
// uma a cada "segPorItem" segundos, pagando o mesmo preço base. Enquanto há coisa no caixote, a figura é a do caixote
// cheio. Fechado o jogo, o que estava no caixote se vende do mesmo jeito (a ausência resolve tudo de uma vez).
// A reforma do caixote em banca (comeco.js) é o ganho: a banca leva o cesto inteiro, na hora.
//   mundo.banca = { caixote: { item: n }, proxima (instante da próxima venda do caixote, ms) }
// Eventos: vendeu { item, n, ouro, entidade }, vendeuTudo { n, ouro, entidade } (a banca, na hora),
//          encheuCaixote { n, itens, entidade } (pôs no caixote), caixoteVendeu { item, n, ouro, entidade }.
import { registrarSistema, registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { ganharOuro, noCesto, valorDoCesto, cestoECargas, naCarga, valorDaCarga } from './posses.js';
import { somar } from '../util.js';
import { filaTem } from './personagem.js';

const defDoAlvo = (m, alvo) => { const e = alvo && alvo.entidade !== undefined ? m.local.porId[alvo.entidade] : null; return e ? m.dados.construcoes[e.tipo] || null : null; };
// quantas coisas há no caixote agora
export function noCaixote(m) { let n = 0; const C = m.banca ? m.banca.caixote : null; for (const k in C) n += C[k]; return n; }
// quantas cabem ainda no caixote (def = a do caixote, construcoes.json "vagas")
const vagasDo = (def) => (def && def.vagas > 0 ? def.vagas : 0);
export function espacoNoCaixote(m, def) { return Math.max(0, vagasDo(def) - noCaixote(m)); }
const segPorItem = (def) => (def && def.segPorItem > 0 ? def.segPorItem : 0.6);
// o caixote da fazenda (a entidade "banca" ainda caixote), ou null
function caixote(m) {
  const loc = m.locais.fazenda, e = loc && loc.porId.banca;
  const d = e && m.dados.construcoes[e.tipo];
  return d && vagasDo(d) ? { e, d } : null;
}

registrarAcao({
  id: 'vender', dur: 1.0, efeitoEm: 0.6, estadoVisual: 'entregar',
  pode(m, alvo) {
    if (!(noCesto(m) + naCarga(m) > 0)) return { ok: false, motivo: 'cesto-vazio' };
    const d = defDoAlvo(m, alvo);
    if (vagasDo(d) && !(espacoNoCaixote(m, d) > 0)) return { ok: false, motivo: 'caixote-cheio', dados: { vagas: vagasDo(d) } };
    return { ok: true };
  },
  aoEfeito(m, alvo) {
    const d = defDoAlvo(m, alvo);
    if (vagasDo(d)) { porNoCaixote(m, alvo, d); return; }
    let totalOuro = 0, totalItens = 0;
    for (const c of cestoECargas(m)) for (const item in c) { // o cesto e o que veio na carroça
      const n = c[item], ouro = n * m.dados.itens[item].venda;
      totalOuro += ouro; totalItens += n;
      delete c[item];
      m.eventos.emitir('vendeu', { item, n, ouro, entidade: alvo.entidade });
    }
    ganharOuro(m, totalOuro, 'banca');
    m.eventos.emitir('vendeuTudo', { n: totalItens, ouro: totalOuro, entidade: alvo.entidade });
  },
});

// o caixote: o que cabe sai do cesto (e da carroça) e fica no caixote, à espera dos fregueses
function porNoCaixote(m, alvo, d) {
  const B = m.banca, itens = {};
  let cabe = espacoNoCaixote(m, d), n = 0;
  for (const c of cestoECargas(m)) for (const item in c) {
    const vai = Math.min(c[item], cabe);
    if (vai <= 0) break;
    somar(c, item, -vai); somar(B.caixote, item, vai); somar(itens, item, vai);
    cabe -= vai; n += vai;
  }
  if (!(B.proxima > m.agora)) B.proxima = m.agora + segPorItem(d) * 1000;
  m.eventos.emitir('encheuCaixote', { n, itens, entidade: alvo.entidade });
  if (noCesto(m) + naCarga(m) > 0) m.eventos.emitir('faltou', { motivo: 'caixote-cheio', dados: { vagas: vagasDo(d) }, entidade: alvo.entidade });
}
// os fregueses levam do caixote o que o relógio deixa (um a cada segPorItem segundos)
function venderDoCaixote(m) {
  const B = m.banca;
  if (!(B.proxima > 0) || m.agora < B.proxima) return;
  const cx = caixote(m);
  if (!noCaixote(m)) { B.proxima = 0; return; }
  const seg = segPorItem(cx ? cx.d : null) * 1000;
  let n = 0;
  while (B.proxima <= m.agora && n < 100000) {
    let item = null;
    for (const k in B.caixote) if (B.caixote[k] > 0) { item = k; break; }
    if (!item) { B.proxima = 0; break; }
    somar(B.caixote, item, -1); n++;
    const ouro = m.dados.itens[item] ? m.dados.itens[item].venda : 0;
    ganharOuro(m, ouro, 'banca');
    m.eventos.emitir('vendeu', { item, n: 1, ouro, entidade: 'banca' });
    m.eventos.emitir('caixoteVendeu', { item, n: 1, ouro, entidade: 'banca' });
    B.proxima = noCaixote(m) > 0 ? B.proxima + seg : 0;
  }
}

// com colheita na fila, o toque na banca (ou no caixote) já vale: quando ela chegar lá o cesto terá o que vender
function tocarParaVender(m, e) {
  if (noCesto(m) + naCarga(m) > 0 || filaTem(m, 'colher') || filaTem(m, 'pegar')) {
    const d = m.dados.construcoes[e.tipo];
    if (vagasDo(d) && !(espacoNoCaixote(m, d) > 0)) return { acao: null, texto: 'caixote-cheio', dados: { vagas: vagasDo(d) } };
    return { acao: 'vender', dados: { ouro: valorDoCesto(m) + valorDaCarga(m), n: noCesto(m) + naCarga(m) } };
  }
  return { acao: null, texto: 'cesto-vazio' };
}
registrarTipo({ tipo: 'banca', casas: [3, 2], bloqueia: true, acaoPossivel: tocarParaVender });
// o caixote de venda do começo humilde: cheio enquanto há coisa nele
registrarTipo({
  tipo: 'caixote-de-venda', casas: [1, 1], bloqueia: true, altura: 1, semVeu: true, acaoPossivel: tocarParaVender, // (baixinho: não tapa ninguém)
  visual(m, e, v) { v.chave = noCaixote(m) > 0 ? 'objeto/caixote-de-venda-cheio' : 'objeto/caixote-de-venda'; v.variante = 0; return v; },
});

registrarEvento('vendeu', { campos: ['item', 'n', 'ouro', 'entidade'] });
registrarEvento('vendeuTudo', { campos: ['n', 'ouro', 'entidade'] });
registrarEvento('encheuCaixote', { campos: ['n', 'itens', 'entidade'] });
registrarEvento('caixoteVendeu', { campos: ['item', 'n', 'ouro', 'entidade'] });

registrarSistema({
  id: 'banca',
  iniciar(m) { m.banca = { caixote: {}, proxima: 0 }; },
  passo: venderDoCaixote,
  ausencia: venderDoCaixote,
  salvar(m) { return { caixote: { ...m.banca.caixote }, proxima: Math.round(m.banca.proxima || 0) }; },
  carregar(m, d) {
    const B = m.banca;
    B.caixote = {};
    if (d && d.caixote && typeof d.caixote === 'object') for (const k in d.caixote) if (m.dados.itens[k] && d.caixote[k] > 0) B.caixote[k] = Math.round(d.caixote[k]);
    B.proxima = noCaixote(m) > 0 ? (d.proxima > 0 ? d.proxima : m.agora) : 0;
  },
});
