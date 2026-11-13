// Cash: concluir um relógio na hora, a loja de cash (pacotes com compra SIMULADA) e as ofertas de loja.json.
// Cash só compra tempo, enfeite e bicho de estimação especial; nada de útil é exclusivo dele.
//   concluir { relogio, alvo }   relogio = tipo registrado em nucleo/concluir.js ("obra", "fila", "muda"); o preço
//                                sai de regras.concluir: de graça até gratisAteSeg; depois teto(coef × minutos^expoente).
//                                "limitePorDia" (se houver) conta só as conclusões pagas.
//   comprarCash { pacote }       versão de teste: nenhuma cobrança é feita (loja.cash.compraSimulada)
//   comprarOferta { oferta }     roupa (vai para a bolsa), enfeite de fazenda (fica guardado para colocar), animal especial
// A vaga de fila se compra na própria construção (comando "ampliar" da construção, com ouro ou com cash).
//
// Para as outras frentes:
//   gastarCash(mundo, n, destino)            cobra (false se não há saldo) e emite gastouCash { n, destino }
//   consultaDeConcluir(mundo, tipo, alvo)    o preço e se dá para concluir agora (é o que o botão da interface mostra)
//   ENTREGAS.animal / ENTREGAS.construcao    quem dá vida ao que foi comprado: { pode(mundo, id) → { ok, motivo, dados }, entregar(mundo, id) }
//   animaisEspeciais(mundo)                  os animais especiais que o jogador comprou (ids de animais.json)
// Eventos: comprouCash { pacote, cash, precoBRL, simulada }, comprouComCash { oferta, classe, item | animal | construcao, cash },
//   ganhouAnimalEspecial { animal }, concluiu { relogio, alvo, seg, cash, nome }, gastouCash { n, destino }.
import { registrarSistema, registrarEvento } from '../registro.js';
import { CONCLUIVEIS } from '../concluir.js';
import { progressoDe } from '../premios.js';
import { ganharCash, darItem } from './posses.js';
import { diaDoMundo } from './diaria.js';
import { VESTIVEL, temCosmetico } from './roupas.js';

export function gastarCash(m, n, destino) {
  if (!(n >= 0) || m.posses.cash < n) return false;
  if (n > 0) { m.posses.cash -= n; m.eventos.emitir('gastouCash', { n, destino }); }
  return true;
}

// quanto custa concluir um relógio a que faltam "seg" segundos
export function precoDeConcluir(m, seg) {
  const R = progressoDe(m.dados).concluir;
  if (!(seg > 0) || seg <= R.gratisAteSeg || !(R.coef > 0)) return 0;
  return Math.max(1, Math.ceil(R.coef * Math.pow(seg / 60, R.expoente) - 1e-9));
}
const pagasHoje = (m) => (m.cash.concluiuDia === diaDoMundo(m) ? m.cash.concluiuN : 0);

// dá para concluir agora? { ok, motivo, dados: { relogio, seg, preco, gratis, nome, falta (de cash), limite } }
// motivos: concluir-nao-vale (ninguém registrou esse relógio, ou regras.concluir.vale não o lista), nada-a-concluir,
// concluir-limite, sem-cash
export function consultaDeConcluir(m, tipo, alvo) {
  const R = progressoDe(m.dados).concluir, c = CONCLUIVEIS[tipo];
  if (!c || !R.vale.includes(tipo)) return { ok: false, motivo: 'concluir-nao-vale', dados: { relogio: tipo } };
  const seg = c.falta(m, alvo);
  if (!(seg > 0)) return { ok: false, motivo: 'nada-a-concluir', dados: { relogio: tipo } };
  const preco = precoDeConcluir(m, seg), dados = { relogio: tipo, seg, preco, gratis: preco === 0, nome: c.nome(m, alvo) || '' };
  if (preco > 0 && R.limitePorDia > 0 && pagasHoje(m) >= R.limitePorDia) return { ok: false, motivo: 'concluir-limite', dados: { ...dados, limite: R.limitePorDia } };
  if (m.posses.cash < preco) return { ok: false, motivo: 'sem-cash', dados: { ...dados, falta: preco - m.posses.cash } };
  return { ok: true, dados };
}

// ---------- quem dá vida ao que a loja de cash vende ----------
const ok = { ok: true };
export const ENTREGAS = {
  // enfeite de fazenda: fica entre as construções guardadas (colocar uma guardada não custa nada); sem o sistema de
  // construção, fica anotado aqui até ele existir
  construcao: {
    pode(m, id) {
      const def = (m.dados.construcoes && m.dados.construcoes[id]) || (m.dados.bruto.construcoes && m.dados.bruto.construcoes[id]);
      if (!def) return { ok: false, motivo: 'nao-existe', dados: { construcao: id } };
      if (def.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: def.nivel, construcao: id } };
      if (def.limite > 0 && quantasConstrucoes(m, id) >= def.limite) return { ok: false, motivo: 'limite', dados: { limite: def.limite, construcao: id } };
      return ok;
    },
    entregar(m, id) {
      const C = m.construcao;
      if (C && C.guardadas) C.guardadas[id] = (C.guardadas[id] || 0) + 1;
      else m.cash.construcoes[id] = (m.cash.construcoes[id] || 0) + 1;
    },
  },
  // animal especial: a frente de animais troca esta entrada pela dela (pôr o bicho na fazenda, pedir estábulo e sela...)
  animal: {
    pode(m, id) {
      const def = m.dados.bruto.animais && m.dados.bruto.animais[id];
      if (!def) return { ok: false, motivo: 'nao-existe', dados: { animal: id } };
      if (def.nivel > m.progresso.nivel) return { ok: false, motivo: 'nivel-baixo', dados: { nivel: def.nivel, animal: id } };
      return ok;
    },
    entregar() {},
  },
};
function quantasConstrucoes(m, id) {
  const C = m.construcao;
  let n = m.cash.construcoes[id] || 0;
  if (C) { n += (C.guardadas && C.guardadas[id]) || 0; for (const e of C.todas || []) if (e.tipo === id) n++; }
  return n;
}
export const animaisEspeciais = (m) => m.cash.animais;

// uma oferta de loja.json, do jeito que o painel mostra e que o comando confere
//   { id, nome, tipo, classe: 'cosmetico' | 'construcao' | 'animal' | 'tempo' | 'vaga', alvo (id do item, da construção
//     ou do animal), cash, tem, pode: { ok, motivo, dados } }
export function estadoDaOferta(m, o) {
  const classe = o.tipo === 'tempo' || o.tipo === 'vaga' ? o.tipo : o.item ? 'cosmetico' : o.construcao ? 'construcao' : o.animal ? 'animal' : o.tipo;
  const alvo = o.item || o.construcao || o.animal || null, e = { id: o.id, nome: o.nome, tipo: o.tipo, classe, alvo, cash: o.cash, tem: false, pode: ok };
  if (classe === 'cosmetico') {
    const it = m.dados.itens[alvo];
    e.tem = temCosmetico(m, alvo);
    if (!it) e.pode = { ok: false, motivo: 'nao-existe', dados: { item: alvo } };
    else if (!VESTIVEL[alvo]) e.pode = { ok: false, motivo: 'em-breve', dados: { item: alvo } };
    else if (e.tem) e.pode = { ok: false, motivo: 'ja-tem', dados: { item: alvo } };
    else if (it.nivel > m.progresso.nivel) e.pode = { ok: false, motivo: 'nivel-baixo', dados: { nivel: it.nivel, item: alvo } };
  } else if (classe === 'construcao') {
    e.tem = quantasConstrucoes(m, alvo) > 0;
    e.pode = ENTREGAS.construcao.pode(m, alvo);
  } else if (classe === 'animal') {
    e.tem = m.cash.animais.includes(alvo);
    e.pode = e.tem ? { ok: false, motivo: 'ja-tem', dados: { animal: alvo } } : ENTREGAS.animal.pode(m, alvo);
  } else e.pode = { ok: false, motivo: 'nao-vende', dados: { oferta: o.id } }; // tempo e vaga não se compram por aqui
  if (e.pode.ok && !(o.cash > 0)) e.pode = { ok: false, motivo: 'nao-vende', dados: { oferta: o.id } };
  if (e.pode.ok && m.posses.cash < o.cash) e.pode = { ok: false, motivo: 'sem-cash', dados: { falta: o.cash - m.posses.cash, oferta: o.id } };
  return e;
}
// para o painel: { compraSimulada, cashPorReal, pacotes, ofertas: [estadoDaOferta], vagas }
export function lojaDeCash(m) {
  const C = progressoDe(m.dados).cash;
  return { compraSimulada: C.compraSimulada, cashPorReal: C.cashPorReal, pacotes: C.pacotes, ofertas: C.ofertas.map((o) => estadoDaOferta(m, o)), vagas: progressoDe(m.dados).vagas };
}

registrarEvento('comprouCash', { campos: ['pacote', 'cash'] });
registrarEvento('comprouComCash', { campos: ['oferta', 'classe', 'item', 'animal', 'construcao', 'cash'] });
registrarEvento('concluiu', { campos: ['relogio', 'cash', 'seg'] });

// enfeite comprado antes de existir o sistema de construção: quando ele existe, passa para as guardadas dele
function passarEnfeites(m) {
  const C = m.cash.construcoes, G = m.construcao && m.construcao.guardadas;
  if (!G) return;
  for (const k in C) { G[k] = (G[k] || 0) + C[k]; delete C[k]; }
}

registrarSistema({
  id: 'cash',
  segundo: passarEnfeites,
  iniciar(m) {
    m.cash = { comprado: 0, compras: 0, gasto: 0, concluiuDia: null, concluiuN: 0, animais: [], construcoes: {} };
    m.eventos.ouvir('gastouCash', (d) => { if (d && d.n > 0) m.cash.gasto += d.n; }); // qualquer frente que cobre entra na conta
  },
  comandos: {
    concluir(m, c) {
      const tipo = c.relogio, r = consultaDeConcluir(m, tipo, c.alvo);
      if (!r.ok) return r;
      const { preco, seg, nome } = r.dados;
      if (!gastarCash(m, preco, 'concluir')) return { ok: false, motivo: 'sem-cash', dados: { ...r.dados, falta: preco - m.posses.cash } };
      if (preco > 0) { const dia = diaDoMundo(m); if (m.cash.concluiuDia !== dia) { m.cash.concluiuDia = dia; m.cash.concluiuN = 0; } m.cash.concluiuN++; }
      CONCLUIVEIS[tipo].terminar(m, c.alvo);
      m.eventos.emitir('concluiu', { relogio: tipo, alvo: c.alvo, seg, cash: preco, nome });
      return { ok: true, dados: { relogio: tipo, seg, cash: preco, nome } };
    },
    comprarCash(m, c) {
      const C = progressoDe(m.dados).cash, p = C.pacotes.find((x) => x.id === c.pacote);
      if (!p) return { ok: false, motivo: 'nao-existe', dados: { pacote: c.pacote } };
      if (!C.compraSimulada) return { ok: false, motivo: 'compra-indisponivel' }; // compra de verdade não existe nesta versão
      m.cash.comprado += p.cash; m.cash.compras++;
      ganharCash(m, p.cash, 'compra');
      m.eventos.emitir('comprouCash', { pacote: p.id, nome: p.nome, cash: p.cash, precoBRL: p.precoBRL, simulada: true });
      return { ok: true, dados: { pacote: p.id, cash: p.cash, simulada: true } };
    },
    comprarOferta(m, c) {
      const o = progressoDe(m.dados).cash.ofertas.find((x) => x.id === c.oferta);
      if (!o) return { ok: false, motivo: 'nao-existe', dados: { oferta: c.oferta } };
      const e = estadoDaOferta(m, o);
      if (!e.pode.ok) return e.pode;
      if (!gastarCash(m, o.cash, 'oferta')) return { ok: false, motivo: 'sem-cash', dados: { falta: o.cash - m.posses.cash, oferta: o.id } };
      const d = { oferta: o.id, nome: o.nome, classe: e.classe, cash: o.cash, n: 1 };
      if (e.classe === 'cosmetico') { d.item = e.alvo; darItem(m, e.alvo, 1, 'cash'); }
      else if (e.classe === 'construcao') { d.construcao = e.alvo; ENTREGAS.construcao.entregar(m, e.alvo); }
      else { d.animal = e.alvo; m.cash.animais.push(e.alvo); ENTREGAS.animal.entregar(m, e.alvo); m.eventos.emitir('ganhouAnimalEspecial', { animal: e.alvo }); }
      m.eventos.emitir('comprouComCash', d);
      return { ok: true, dados: d };
    },
  },
  salvar(m) { const C = m.cash; return { comprado: C.comprado, compras: C.compras, gasto: C.gasto, concluiuDia: C.concluiuDia, concluiuN: C.concluiuN, animais: [...C.animais], construcoes: { ...C.construcoes } }; },
  carregar(m, d) {
    const C = m.cash, A = m.dados.bruto.animais || {}, K = m.dados.bruto.construcoes || {};
    C.comprado = d.comprado > 0 ? d.comprado : 0; C.compras = d.compras > 0 ? d.compras : 0; C.gasto = d.gasto > 0 ? d.gasto : 0;
    C.concluiuDia = Number.isFinite(d.concluiuDia) ? d.concluiuDia : null; C.concluiuN = d.concluiuN > 0 ? Math.floor(d.concluiuN) : 0;
    C.animais = Array.isArray(d.animais) ? [...new Set(d.animais.filter((id) => A[id]))] : [];
    C.construcoes = {};
    for (const k in d.construcoes || {}) if (K[k] && d.construcoes[k] > 0) C.construcoes[k] = Math.floor(d.construcoes[k]);
  },
});
