// A loja de ouro: vende o que tem preço de compra em itens.json, separado nas abas de loja.json.
// Abre de qualquer lugar; o nível de cada item vem do campo "nivel". Só entra o que este jogo já sabe usar:
// semente de cultura, ferramenta que alguma ação pede, recipiente com papel conhecido. O resto chega com a sua frente.
import { registrarSistema, registrarEvento, ACOES } from '../registro.js';
import { gastarOuro, darItem, valorDoCesto, RECIPIENTES } from './posses.js';

// por tipo de item: este jogo já sabe usar? As frentes novas acrescentam aqui (VENDAVEL.material = () => true, ...)
export const VENDAVEL = {
  semente: (m, it) => !!m.dados.culturaDaSemente[it.id],
  ferramenta: (m, it) => { for (const k in ACOES) if (ACOES[k].ferramenta === it.funcao || ACOES[k].ajudante === it.funcao) return true; return false; },
  recipiente: (m, it) => !!RECIPIENTES[it.funcao],
};
const unico = (it) => it.tipo === 'ferramenta' || it.tipo === 'recipiente';

// o jogador já tem este item único (ferramenta ou recipiente)?
export function jaTem(m, id) {
  const it = m.dados.itens[id];
  if (it.tipo === 'ferramenta') return !!m.posses.ferramentas[id];
  if (it.tipo === 'recipiente') return m.posses.recipientes.includes(id);
  return false;
}
// o maior degrau que o jogador tem de uma função (0 = nenhum)
function degrauQueTem(m, it) {
  let d = 0;
  const I = m.dados.itens, lista = it.tipo === 'ferramenta' ? Object.keys(m.posses.ferramentas) : m.posses.recipientes;
  for (const k of lista) if (I[k] && I[k].tipo === it.tipo && I[k].funcao === it.funcao) d = Math.max(d, I[k].degrau);
  return d;
}

// a loja mostra este item agora? (existe uso para ele e, nas abas de "só o próximo degrau", é a melhoria seguinte)
function aVenda(m, aba, it) {
  const v = VENDAVEL[it.tipo];
  if (!v || !v(m, it)) return false;
  if (!unico(it)) return true;
  const tem = degrauQueTem(m, it);
  if (it.degrau <= tem) return false; // já tem igual ou melhor
  if (!aba.soProximoDegrau) return true;
  const I = m.dados.itens;
  for (const id of aba.itens) { const o = I[id]; if (o !== it && o.tipo === it.tipo && o.funcao === it.funcao && o.degrau > tem && o.degrau < it.degrau) return false; }
  return true;
}

// para o painel: [{ id, nome, ofertas: [{ item, tipo, preco, nivel, liberado, unico, tem }] }], por nível e preço
export function ofertasDaLoja(m) {
  const I = m.dados.itens, out = [];
  for (const aba of m.dados.loja.abas) {
    const ofertas = [];
    for (const id of aba.itens) {
      const it = I[id];
      if (!aVenda(m, aba, it)) continue;
      ofertas.push({ item: id, tipo: it.tipo, preco: it.compra, nivel: it.nivel, liberado: it.nivel <= m.progresso.nivel, unico: unico(it), tem: unico(it) ? 0 : (m.posses.bolsa[id] || 0) });
    }
    ofertas.sort((a, b) => a.nivel - b.nivel || a.preco - b.preco);
    if (ofertas.length) out.push({ id: aba.id, nome: aba.nome, ofertas });
  }
  return out;
}
function ofertaDe(m, id) {
  const it = m.dados.itens[id];
  if (!it) return false;
  for (const aba of m.dados.loja.abas) if (aba.itens.includes(id) && aVenda(m, aba, it)) return true;
  return false;
}

// a semente mais barata que o nível do jogador deixa comprar
function sementeMaisBarata(m) {
  let achou = null;
  const I = m.dados.itens;
  for (const id of m.dados.loja.ouro) { const it = I[id]; if (it.tipo === 'semente' && m.dados.culturaDaSemente[id] && it.nivel <= m.progresso.nivel && (!achou || it.compra < achou.compra)) achou = it; }
  return achou;
}

// Ninguém fica travado: sem semente, sem planta no chão, sem nada para vender e sem ouro para a semente mais barata,
// o vizinho dá um punhado de sementes (regras.json: antiTrava).
function socorro(m) {
  const A = m.dados.regras.antiTrava, P = m.posses;
  if (!A) return;
  for (const id in m.locais) if (m.locais[id].plantadas.length) return;
  for (const k in P.bolsa) if (P.bolsa[k] > 0 && m.dados.culturaDaSemente[k]) return;
  const barata = sementeMaisBarata(m);
  let vale = P.ouro + valorDoCesto(m);
  for (const k in P.celeiro.itens) vale += P.celeiro.itens[k] * m.dados.itens[k].venda;
  if (barata && vale >= barata.compra) return;
  darItem(m, A.semente, A.quantidade, 'vizinho');
  m.eventos.emitir('socorro', { item: A.semente, n: A.quantidade });
}

registrarEvento('comprou', {
  campos: ['item', 'n', 'ouro', 'classe'],
  aceita: (dados, f) => {
    const um = (v, existe) => v === undefined || (Array.isArray(v) ? v.some(existe) : existe(v));
    return um(f.item, (id) => dados.loja.ouro.includes(id)) && um(f.classe, (c) => dados.loja.ouro.some((id) => dados.itens[id].tipo === c));
  },
});
registrarEvento('socorro', { campos: ['item', 'n'] });

registrarSistema({
  id: 'loja',
  segundo: socorro,
  ausencia: socorro,
  comandos: {
    comprar(m, c) {
      const it = m.dados.itens[c.item], n = Math.max(1, Math.floor(c.n || 1));
      if (!it || !(it.compra > 0) || !m.dados.loja.ouro.includes(it.id)) return { ok: false, motivo: 'nao-vende', dados: { item: c.item } };
      if (unico(it) && jaTem(m, it.id)) return { ok: false, motivo: 'ja-tem', dados: { item: it.id } };
      if (!ofertaDe(m, it.id)) return { ok: false, motivo: 'nao-vende', dados: { item: it.id } };
      if (it.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: it.nivel, item: it.id } };
      const q = unico(it) ? 1 : n, preco = it.compra * q;
      if (m.posses.ouro < preco) {
        const dados = { falta: preco - m.posses.ouro, item: it.id };
        m.eventos.emitir('faltou', { motivo: 'sem-ouro', dados });
        return { ok: false, motivo: 'sem-ouro', dados };
      }
      gastarOuro(m, preco, 'loja');
      darItem(m, it.id, q, 'loja');
      m.eventos.emitir('comprou', { item: it.id, n: q, ouro: preco, classe: it.tipo });
      return { ok: true, dados: { item: it.id, n: q, ouro: preco } };
    },
  },
});
