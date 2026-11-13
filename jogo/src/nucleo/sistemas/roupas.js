// O guarda-roupa: os cosméticos da personagem (itens de tipo "cosmetico", com "parte": chapeu, roupa, calcado, pintura).
// Cosmético ganho ou comprado fica na bolsa (darItem); aqui se guarda o que ela está vestindo, uma peça por parte.
// Só se compra e se veste o que o desenho sabe mostrar: quem desenha registra VESTIVEL[id] = true (render/roupas.js).
// O que ainda não tem desenho aparece no painel como "em breve" e não se vende.
//   comprarCosmetico { item }   com ouro (o preço "compra" de itens.json); com cash é a oferta da loja de cash (cash.js)
//   vestir { item }             tirar { parte }
import { registrarSistema, registrarEvento } from '../registro.js';
import { gastarOuro, darItem } from './posses.js';
import { MOSTRA_LIBERADO } from './niveis.js';
import { progressoDe } from '../premios.js';

export const PARTES = ['chapeu', 'roupa', 'calcado', 'pintura'];
export const VESTIVEL = {};

const cosmetico = (m, id) => { const it = m.dados.itens[id]; return it && it.tipo === 'cosmetico' && PARTES.includes(it.parte) ? it : null; };
export const temCosmetico = (m, id) => (m.posses.bolsa[id] || 0) > 0;
// a oferta da loja de cash que vende este item (ou null)
export function ofertaDoItem(m, id) { return progressoDe(m.dados).cash.ofertas.find((o) => o.item === id && o.cash > 0) || null; }

// para o painel: todos os cosméticos, por parte
//   [{ parte, itens: [{ id, nome, descricao, parte, tem, vestindo, pronto (o desenho existe), nivel, liberado, ouro, cash, oferta }] }]
// ouro e cash são os preços (0 = não se vende assim); quem não tem preço nenhum é prêmio (nível, presente do dia)
export function guardaRoupa(m) {
  const out = PARTES.map((parte) => ({ parte, itens: [] }));
  for (const it of Object.values(m.dados.itens)) {
    const c = cosmetico(m, it.id);
    if (!c) continue;
    const of = ofertaDoItem(m, it.id);
    out[PARTES.indexOf(c.parte)].itens.push({
      id: it.id, nome: it.nome, descricao: it.descricao || '', parte: c.parte, tem: temCosmetico(m, it.id), vestindo: m.roupas.vestindo[c.parte] === it.id,
      pronto: !!VESTIVEL[it.id], nivel: it.nivel, liberado: it.nivel <= m.progresso.nivel, ouro: it.compra > 0 ? it.compra : 0, cash: of ? of.cash : 0, oferta: of ? of.id : null,
    });
  }
  // primeiro o que ela tem, depois o que se compra com ouro, depois com cash, por fim os prêmios
  const ordem = (x) => (x.tem ? 0 : x.ouro > 0 ? 1 : x.cash > 0 ? 2 : 3);
  for (const g of out) g.itens.sort((a, b) => ordem(a) - ordem(b) || a.ouro - b.ouro || a.cash - b.cash);
  return out.filter((g) => g.itens.length);
}

registrarEvento('vestiu', { campos: ['item', 'parte'] });
// na subida de nível aparece a roupa que passou a ter na loja (e que o desenho já mostra)
MOSTRA_LIBERADO.cosmetico = (m, x) => !!VESTIVEL[x.id];

function vestir(m, it) {
  m.roupas.vestindo[it.parte] = it.id;
  m.eventos.emitir('vestiu', { item: it.id, parte: it.parte });
}

registrarSistema({
  id: 'roupas',
  iniciar(m) { m.roupas = { vestindo: { chapeu: null, roupa: null, calcado: null, pintura: null } }; },
  comandos: {
    comprarCosmetico(m, c) {
      const it = cosmetico(m, c.item);
      if (!it) return { ok: false, motivo: 'nao-existe', dados: { item: c.item } };
      if (!VESTIVEL[it.id]) return { ok: false, motivo: 'em-breve', dados: { item: it.id } };
      if (temCosmetico(m, it.id)) return { ok: false, motivo: 'ja-tem', dados: { item: it.id } };
      if (!(it.compra > 0)) return { ok: false, motivo: 'nao-vende', dados: { item: it.id } };
      if (it.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: it.nivel, item: it.id } };
      if (!gastarOuro(m, it.compra, 'loja')) return { ok: false, motivo: 'sem-ouro', dados: { falta: it.compra - m.posses.ouro, item: it.id } };
      darItem(m, it.id, 1, 'compra');
      m.eventos.emitir('comprou', { item: it.id, n: 1, ouro: it.compra, classe: 'cosmetico' });
      vestir(m, it);
      return { ok: true, dados: { item: it.id, ouro: it.compra } };
    },
    vestir(m, c) {
      const it = cosmetico(m, c.item);
      if (!it) return { ok: false, motivo: 'nao-existe', dados: { item: c.item } };
      if (!temCosmetico(m, it.id)) return { ok: false, motivo: 'nao-tem', dados: { item: it.id } };
      if (!VESTIVEL[it.id]) return { ok: false, motivo: 'em-breve', dados: { item: it.id } };
      vestir(m, it);
      return { ok: true, dados: { item: it.id, parte: it.parte } };
    },
    tirar(m, c) {
      if (!PARTES.includes(c.parte)) return { ok: false, motivo: 'nao-existe', dados: { parte: c.parte } };
      m.roupas.vestindo[c.parte] = null;
      m.eventos.emitir('vestiu', { item: null, parte: c.parte });
      return { ok: true, dados: { parte: c.parte } };
    },
  },
  salvar(m) { return { vestindo: { ...m.roupas.vestindo } }; },
  carregar(m, d) {
    const V = m.roupas.vestindo, g = (d && d.vestindo) || {};
    // (a posse é conferida ao desenhar: a bolsa pode carregar depois deste sistema)
    for (const parte of PARTES) { const it = cosmetico(m, g[parte]); V[parte] = it && it.parte === parte ? it.id : null; }
  },
});
