// Comprar lote: a placa de cada lote abre a compra (painel "terras"); pago o preço, a terra passa a ser do jogador.
// O lote pede nível e, às vezes, outro lote comprado antes ("exige"). O que já foi comprado fica em m.terras.lotes
// (quem grava e refaz é terras.js). A compra emite "comprou" com { lote, classe: 'lote' }, como a loja.
import { registrarSistema, registrarTipo, ampliarEvento } from '../registro.js';
import { gastarOuro } from './posses.js';
import { darXp } from './niveis.js';
import { JA_COMPROU } from './loja.js';
import { loteDe, loteComprado, liberarLote, idDaPlaca } from './terras.js';
import { registrarGuia } from '../guia.js';

const nomeDoLote = (l) => l.nome || l.id;

// como o lote está para o jogador agora:
//   { lote, estado: 'comprado' | 'pode' | 'ouro' | 'nivel' | 'exige', falta (ouro que falta), exige: [nomes dos lotes que faltam] }
export function situacaoDoLote(m, l) {
  const out = { lote: l, estado: 'pode', falta: 0, exige: [] };
  if (loteComprado(m, l.id)) { out.estado = 'comprado'; return out; }
  for (const id of l.exige || []) if (!loteComprado(m, id)) { const o = loteDe(m, id); out.exige.push(o ? nomeDoLote(o) : id); }
  if (out.exige.length) out.estado = 'exige';
  else if ((l.nivel || 1) > m.progresso.nivel) out.estado = 'nivel';
  else if (m.posses.ouro < (l.preco || 0)) { out.estado = 'ouro'; out.falta = (l.preco || 0) - m.posses.ouro; }
  return out;
}
// todos os lotes, na ordem dos dados (é a ordem em que se compram)
export function situacaoDosLotes(m) { return m.dados.terras.lotes.map((l) => situacaoDoLote(m, l)); }
// o próximo lote que ainda não é do jogador (o que a placa em destaque e o guia apontam), ou null
export function proximoLote(m) {
  let achou = null;
  for (const l of m.dados.terras.lotes) {
    if (loteComprado(m, l.id)) continue;
    const s = situacaoDoLote(m, l);
    if (s.estado !== 'exige' && (!achou || (l.preco || 0) < (achou.preco || 0))) achou = l;
  }
  return achou;
}

// a placa: o toque abre a compra do lote dela (a interface abre o painel pedido em "painel")
registrarTipo({
  tipo: 'placa', casas: [1, 1], bloqueia: true, altura: 1.5,
  acaoPossivel(m, e) {
    const l = loteDe(m, e.lote);
    if (!l) return { acao: null, texto: null };
    const s = situacaoDoLote(m, l);
    return { acao: null, painel: 'terras', arg: { lote: l.id }, texto: 'lote-a-venda', dados: { lote: l.id, nome: nomeDoLote(l), preco: l.preco || 0, nivel: l.nivel || 1, estado: s.estado, exige: s.exige, falta: s.falta } };
  },
});

// o "comprou" da loja passa a levar o lote (a missão "terra-nova" filtra por ele; a conquista, pela classe "lote")
ampliarEvento('comprou', {
  campos: ['lote'],
  aceita(dados, f) {
    const existe = (id) => dados.terras.lotes.some((l) => l.id === id);
    if (f.lote !== undefined) return Array.isArray(f.lote) ? f.lote.some(existe) : existe(f.lote);
    if (f.classe === 'lote') return dados.terras.lotes.length > 0;
    return undefined;
  },
});
JA_COMPROU.lote = (m, id) => loteComprado(m, id);

registrarSistema({
  id: 'lotes',
  comandos: {
    // { lote }: compra o lote (o ouro sai na hora; não precisa a personagem ir até a placa)
    comprarLote(m, c) {
      const l = loteDe(m, c.lote);
      if (!l) return { ok: false, motivo: 'lote-desconhecido', dados: { lote: c.lote } };
      const s = situacaoDoLote(m, l), dados = { lote: l.id, nome: nomeDoLote(l), preco: l.preco || 0, nivel: l.nivel || 1, exige: s.exige, falta: s.falta };
      if (s.estado === 'comprado') return { ok: false, motivo: 'lote-ja-comprado', dados };
      if (s.estado === 'exige') return { ok: false, motivo: 'lote-exige', dados };
      if (s.estado === 'nivel') return { ok: false, motivo: 'nivel-baixo', dados };
      if (s.estado === 'ouro') { m.eventos.emitir('faltou', { motivo: 'sem-ouro', dados }); return { ok: false, motivo: 'sem-ouro', dados }; }
      gastarOuro(m, dados.preco, 'lote');
      const placa = m.locais.fazenda.porId[idDaPlaca(l.id)], a = l.area;
      liberarLote(m, l.id);
      m.eventos.emitir('comprou', { lote: l.id, n: 1, ouro: dados.preco, classe: 'lote', nome: dados.nome, area: a, x: placa ? placa.x : (a[0] + a[2]) / 2, z: placa ? placa.z : (a[1] + a[3]) / 2 });
      if (l.xp > 0) darXp(m, l.xp, 'lote');
      return { ok: true, dados };
    },
  },
});

// missão de comprar um lote: o guia aponta a placa dele (o toque nela abre a compra)
registrarGuia('comprou', (m, f, out) => {
  const id = Array.isArray(f.lote) ? f.lote[0] : f.lote;
  if (!id || !m.local.porId[idDaPlaca(id)]) return null;
  out.tipo = 'entidade'; out.id = idDaPlaca(id);
  return out;
});
