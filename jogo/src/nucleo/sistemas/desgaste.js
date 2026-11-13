// Desgaste leve e conserto (regras.json: desgaste). Cada uso gasta 1 dos "usos" do item (0 = não gasta nunca).
// No fim a ferramenta NÃO quebra: fica "gasta" e rende menos (rendeQuandoGasta) até o conserto, que custa "conserto"
// em ouro e se faz com um toque, de qualquer lugar. Nada disso interrompe uma tarefa: gasta, ela só trabalha mais devagar.
//   ferramenta gasta: a ação demora mais (duração ÷ rendeQuandoGasta)
//   cesto gasto: leva menos (capacidade × rendeQuandoGasta)
// Os usos das ferramentas já são contados por posses.js (ferramentas[id].usos, a cada ação); aqui fica só de quanto
// era a conta no último conserto. Recipiente (cesto, caixa, balde) não tem contador lá: a frente dona chama gastar().
import { registrarSistema, registrarEvento } from '../registro.js';
import { gastarOuro } from './posses.js';

const itemDe = (m, id) => m.dados.itens[id];
// quantos usos o item aguenta entre um conserto e outro (0 = não gasta)
const aguenta = (m, id) => { const it = itemDe(m, id); return it && it.usos > 0 ? it.usos : 0; };
// usos contados desde sempre: os da ferramenta estão em posses; os de recipiente, aqui
function usosDe(m, id) { const f = m.posses.ferramentas[id]; return f ? f.usos || 0 : m.desgaste.usos[id] || 0; }
const temItem = (m, id) => !!m.posses.ferramentas[id] || m.posses.recipientes.includes(id);

// quanto falta até ficar gasta: { usos (restantes), total, fracao (1 = nova, 0 = gasta) }; sem desgaste, fracao = 1 e total = 0
export function estadoDoItem(m, id) {
  const total = aguenta(m, id);
  if (!total) return { usos: 0, total: 0, fracao: 1 };
  const resta = Math.max(0, total - (usosDe(m, id) - (m.desgaste.base[id] || 0)));
  return { usos: resta, total, fracao: resta / total };
}
export const estaGasta = (m, id) => { const e = estadoDoItem(m, id); return e.total > 0 && e.usos <= 0; };
// quanto o item rende agora: 1, ou rendeQuandoGasta se está gasto
export const rendeDe = (m, id) => (m.desgaste && m.desgaste.gastas[id] ? m.dados.desgaste.rendeQuandoGasta : 1);
// o que multiplica a duração da ação feita com a ferramenta: a "rapidez" dela e, gasta, a lentidão
export const rapidezDe = (m, id) => itemDe(m, id).rapidez / rendeDe(m, id);
// preço do conserto (0 = não há o que consertar: o item não gasta, ou está novo)
export function precoDoConserto(m, id) {
  const it = itemDe(m, id), e = estadoDoItem(m, id);
  if (!it || !e.total || e.usos >= e.total) return 0;
  return it.conserto > 0 ? it.conserto : Math.max(1, Math.round((it.compra || 0) * m.dados.desgaste.consertoFracao));
}
// o que o jogador tem e pede atenção: [{ item, usos, total, fracao, gasta, preco }], do mais gasto para o menos
export function itensGastando(m, soAviso = true) {
  const out = [], ids = [...Object.keys(m.posses.ferramentas), ...m.posses.recipientes];
  for (const id of ids) {
    const e = estadoDoItem(m, id);
    if (!e.total || (soAviso && e.fracao > m.dados.desgaste.avisoEm)) continue;
    out.push({ item: id, usos: e.usos, total: e.total, fracao: e.fracao, gasta: e.usos <= 0, preco: precoDoConserto(m, id) });
  }
  return out.sort((a, b) => a.fracao - b.fracao);
}

// confere um item depois de um uso: avisa uma vez quando falta pouco e uma vez quando fica gasto
function conferir(m, id) {
  const G = m.desgaste, e = estadoDoItem(m, id);
  if (!e.total) return;
  if (e.usos <= 0) {
    if (!G.gastas[id]) { G.gastas[id] = 1; m.eventos.emitir('ferramentaGasta', { item: id, preco: precoDoConserto(m, id) }); }
  } else if (e.fracao <= m.dados.desgaste.avisoEm && !G.avisadas[id]) {
    G.avisadas[id] = 1;
    m.eventos.emitir('ferramentaGastando', { item: id, usos: e.usos, total: e.total });
  }
}
// conta n usos de um item que posses.js não conta (cesto, caixa de ovos, balde...)
export function gastar(m, id, n = 1) {
  if (!aguenta(m, id) || !temItem(m, id)) return;
  m.desgaste.usos[id] = (m.desgaste.usos[id] || 0) + n;
  conferir(m, id);
}
function refazer(m) {
  const G = m.desgaste;
  G.gastas = {}; G.avisadas = {};
  for (const id of [...Object.keys(m.posses.ferramentas), ...m.posses.recipientes]) {
    const e = estadoDoItem(m, id);
    if (!e.total) continue;
    if (e.usos <= 0) G.gastas[id] = 1;
    if (e.fracao <= m.dados.desgaste.avisoEm) G.avisadas[id] = 1;
  }
}

function consertarUm(m, id) {
  const preco = precoDoConserto(m, id);
  if (!temItem(m, id)) return { ok: false, motivo: 'nao-tem', dados: { item: id } };
  if (!preco) return { ok: false, motivo: 'nada-a-consertar', dados: { item: id } };
  if (m.posses.ouro < preco) {
    const dados = { falta: preco - m.posses.ouro, item: id };
    m.eventos.emitir('faltou', { motivo: 'sem-ouro', dados });
    return { ok: false, motivo: 'sem-ouro', dados };
  }
  gastarOuro(m, preco, 'conserto');
  m.desgaste.base[id] = usosDe(m, id);
  delete m.desgaste.gastas[id]; delete m.desgaste.avisadas[id];
  m.eventos.emitir('consertou', { item: id, ouro: preco });
  return { ok: true, dados: { item: id, ouro: preco } };
}

registrarEvento('ferramentaGastando', { campos: ['item', 'usos', 'total'] });
registrarEvento('ferramentaGasta', { campos: ['item', 'preco'] });
registrarEvento('consertou', { campos: ['item', 'ouro'] });

registrarSistema({
  id: 'desgaste',
  iniciar(m) {
    // base[id] = usos contados no último conserto; usos[id] = usos de recipiente; gastas e avisadas se refazem da conta
    m.desgaste = { base: {}, usos: {}, gastas: {}, avisadas: {} };
    m.eventos.ouvir('carregou', () => refazer(m)); // a gravação voltou (com ou sem o estado daqui): refaz a conta
    // depois de cada ação, confere as ferramentas do cinto (quem acabou de trabalhar está nele)
    m.eventos.ouvir('terminouAcao', () => { const F = m.posses.ferramentas; for (const id in F) if (F[id].onde === 'cinto') conferir(m, id); });
    // cada colheita posta no cesto é um uso dele
    m.eventos.ouvir('colheu', () => gastar(m, m.posses.cesto.item, 1));
  },
  comandos: {
    // { item }: conserta um; { tudo: true }: conserta tudo o que o ouro der, do mais gasto para o menos
    consertar(m, c) {
      if (!c.tudo) return consertarUm(m, c.item);
      let n = 0, ouro = 0, ultimo = null;
      for (const g of itensGastando(m, false)) { if (!g.preco) continue; ultimo = consertarUm(m, g.item); if (!ultimo.ok) break; n++; ouro += ultimo.dados.ouro; }
      return n ? { ok: true, dados: { n, ouro } } : ultimo || { ok: false, motivo: 'nada-a-consertar' };
    },
  },
  salvar(m) { return { base: { ...m.desgaste.base }, usos: { ...m.desgaste.usos } }; },
  carregar(m, d) {
    const limpo = (o) => { const out = {}; for (const k in o || {}) if (m.dados.itens[k] && o[k] > 0) out[k] = o[k]; return out; };
    m.desgaste.base = limpo(d.base); m.desgaste.usos = limpo(d.usos);
  },
});
