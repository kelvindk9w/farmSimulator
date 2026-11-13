// A loja de ouro: vende o que tem preço de compra em itens.json (sementes, ferramentas, recipientes...).
// Abre de qualquer lugar; o que cada nível libera vem do campo "nivel" do item.
import { registrarSistema } from '../registro.js';
import { gastarOuro, darItem } from './posses.js';

// o jogador já tem este item único (ferramenta ou recipiente)?
export function jaTem(m, id) {
  const it = m.dados.itens[id];
  if (it.tipo === 'ferramenta') return !!m.posses.ferramentas[id];
  if (it.tipo === 'recipiente') return m.posses.recipientes.includes(id);
  return false;
}

// lista para o painel: [{ item, preco, nivel, liberado, tem, unico }]
export function ofertasDaLoja(m) {
  return m.dados.loja.ouro.map((id) => {
    const it = m.dados.itens[id], unico = it.tipo === 'ferramenta' || it.tipo === 'recipiente';
    return { item: id, tipo: it.tipo, preco: it.compra, nivel: it.nivel, liberado: it.nivel <= m.progresso.nivel, unico, tem: unico ? (jaTem(m, id) ? 1 : 0) : (m.posses.bolsa[id] || 0) };
  });
}

registrarSistema({
  id: 'loja',
  comandos: {
    comprar(m, c) {
      const it = m.dados.itens[c.item], n = Math.max(1, Math.floor(c.n || 1));
      if (!it || !(it.compra > 0) || !m.dados.loja.ouro.includes(it.id)) return { ok: false, motivo: 'nao-vende', dados: { item: c.item } };
      if (it.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: it.nivel, item: it.id } };
      const unico = it.tipo === 'ferramenta' || it.tipo === 'recipiente';
      if (unico && jaTem(m, it.id)) return { ok: false, motivo: 'ja-tem', dados: { item: it.id } };
      const q = unico ? 1 : n, preco = it.compra * q;
      if (m.posses.ouro < preco) {
        m.eventos.emitir('faltou', { motivo: 'sem-ouro', dados: { falta: preco - m.posses.ouro, item: it.id } });
        return { ok: false, motivo: 'sem-ouro', dados: { falta: preco - m.posses.ouro, item: it.id } };
      }
      gastarOuro(m, preco, 'loja');
      darItem(m, it.id, q, 'loja');
      m.eventos.emitir('comprou', { item: it.id, n: q, ouro: preco, classe: it.tipo });
      return { ok: true, dados: { item: it.id, n: q, ouro: preco } };
    },
  },
});
