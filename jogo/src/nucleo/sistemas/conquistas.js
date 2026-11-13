// Conquistas: cada uma conta um evento do jogo (missoes.json → conquistas: evento, filtro, marcos, recompensas).
// Conta qualquer evento que a lógica emitir, sem lista fixa: o que as outras frentes registrarem depois já entra.
// Ao alcançar um marco a conquista fica "pronta para receber" (evento conquistaPronta); o prêmio só entra nas posses
// quando o jogador recebe (comando receberConquista), e é aí que a interface mostra a tela de recompensa.
//   "soma": soma esse campo do evento (por exemplo "ouro") em vez das unidades ("n", ou 1)
//   "conta": "nivel": vale o nível do jogador, em vez de somar
import { registrarSistema, registrarEvento, EVENTOS } from '../registro.js';
import { progressoDe, bate, resolver, entregar } from '../premios.js';

const lista = (m) => progressoDe(m.dados).conquistas;
const valor = (m, c) => (c.conta === 'nivel' ? m.progresso.nivel : m.conquistas.conta[c.id] || 0);
// quantos marcos o valor já alcançou
function alcancados(c, v) { let k = 0; while (k < c.marcos.length && v >= c.marcos[k]) k++; return k; }

// este jogo já sabe cumprir a conquista? (o evento está registrado e leva os campos do filtro, como nas missões)
export function conquistaPossivel(m, c) {
  const ev = EVENTOS[c.evento], f = c.filtro;
  if (!ev) return false;
  if (f) { for (const k in f) if (!ev.campos.includes(k)) return false; if (ev.aceita && !ev.aceita(m.dados, f)) return false; }
  return true;
}

// para o painel: como está uma conquista
//   { id, nome, def, valor, marcos, recebidos, alcancados, prontas, completa, possivel, proximo: { marco, alvo, de, recompensa, pronta } | null }
export function estadoDaConquista(m, c) {
  const v = valor(m, c), k = alcancados(c, v), r = Math.min(m.conquistas.recebidos[c.id] || 0, c.marcos.length);
  return {
    id: c.id, nome: c.nome, def: c, valor: v, marcos: c.marcos, recebidos: r, alcancados: k, prontas: Math.max(0, k - r),
    completa: r >= c.marcos.length, possivel: conquistaPossivel(m, c),
    // "de" é onde a barra do marco começa (o marco anterior)
    proximo: r < c.marcos.length ? { marco: r, alvo: c.marcos[r], de: r > 0 ? c.marcos[r - 1] : 0, recompensa: resolver(m, c.recompensas[r]), pronta: k > r } : null,
  };
}
// todas as que o jogo sabe cumprir (ou que já andaram): primeiro as que têm prêmio a receber, depois as em andamento, por fim as completas
export function listaDeConquistas(m) {
  const out = [];
  for (const c of lista(m)) { const e = estadoDaConquista(m, c); if (e.possivel || e.valor > 0 || e.recebidos > 0) out.push(e); }
  const ordem = (e) => (e.prontas > 0 ? 0 : e.completa ? 2 : 1);
  return out.map((e, i) => [e, i]).sort((a, b) => ordem(a[0]) - ordem(b[0]) || a[1] - b[1]).map((x) => x[0]);
}
// quantos prêmios esperam o jogador (o selo do botão)
export function conquistasProntas(m) {
  let n = 0;
  for (const c of lista(m)) n += Math.max(0, alcancados(c, valor(m, c)) - (m.conquistas.recebidos[c.id] || 0));
  return n;
}

// avisa (uma vez por marco) as conquistas que acabaram de ficar prontas para receber
function conferir(m) {
  const C = m.conquistas;
  if (C.ocupado) return;
  for (const c of lista(m)) {
    const k = alcancados(c, valor(m, c));
    if (k <= (C.avisadas[c.id] || 0)) continue;
    C.avisadas[c.id] = k;
    if (k > (C.recebidos[c.id] || 0)) m.eventos.emitir('conquistaPronta', { id: c.id, nome: c.nome, marco: k - 1, alvo: c.marcos[k - 1] });
  }
}

function ouvir(m, dados, tipo) {
  const P = progressoDe(m.dados), doEvento = P.porEvento[tipo];
  if (!doEvento) return;
  const C = m.conquistas;
  for (const c of doEvento) {
    if (c.conta === 'nivel' || !bate(c.filtro, dados)) continue;
    const n = c.soma ? (dados && dados[c.soma] > 0 ? dados[c.soma] : 0) : dados && typeof dados.n === 'number' ? dados.n : 1;
    if (n > 0) C.conta[c.id] = (C.conta[c.id] || 0) + n;
  }
  conferir(m);
}

registrarEvento('conquistaPronta', { campos: ['id', 'nome', 'marco', 'alvo'] });
registrarEvento('conquista', { campos: ['id', 'nome', 'marco', 'alvo', 'recompensa'] });
// recompensa resgatada: classe "conquista", "diaria" ou "convite" (cada sistema emite a sua)
registrarEvento('resgatou', { campos: ['classe', 'id', 'n'] });

registrarSistema({
  id: 'conquistas',
  iniciar(m) {
    m.conquistas = { conta: {}, recebidos: {}, avisadas: {}, ocupado: false };
    m.eventos.ouvir('*', (dados, tipo) => ouvir(m, dados, tipo));
  },
  // sem evento (jogo recém-aberto, gravação antiga já no nível 5): confere pelo relógio
  segundo: conferir,
  ausencia: conferir,
  comandos: {
    // recebe o prêmio do próximo marco já alcançado da conquista "id"
    receberConquista(m, c) {
      const def = lista(m).find((x) => x.id === c.id);
      if (!def) return { ok: false, motivo: 'conquista-desconhecida', dados: { id: c.id } };
      const C = m.conquistas, r = C.recebidos[def.id] || 0, k = alcancados(def, valor(m, def));
      if (r >= k) return { ok: false, motivo: 'conquista-ainda-nao', dados: { id: def.id, nome: def.nome } };
      const premio = resolver(m, def.recompensas[r]);
      C.recebidos[def.id] = r + 1;
      C.avisadas[def.id] = Math.max(C.avisadas[def.id] || 0, k);
      C.ocupado = true; // o que o prêmio emitir (ouro, nível) não anuncia outra conquista no meio desta
      entregar(m, premio, 'conquista');
      C.ocupado = false;
      const d = { classe: 'conquista', id: def.id, nome: def.nome, marco: r, alvo: def.marcos[r], n: 1, recompensa: premio, restam: k - r - 1 };
      m.eventos.emitir('resgatou', d);
      m.eventos.emitir('conquista', d);
      conferir(m);
      return { ok: true, dados: d };
    },
  },
  salvar(m) { const C = m.conquistas; return { conta: { ...C.conta }, recebidos: { ...C.recebidos }, avisadas: { ...C.avisadas } }; },
  carregar(m, d) {
    const C = m.conquistas, porId = {};
    for (const c of lista(m)) porId[c.id] = c; // a lista pode ter mudado entre versões
    const limpo = (o, teto) => { const out = {}; for (const k in o || {}) if (porId[k] && o[k] > 0) out[k] = teto ? Math.min(Math.floor(o[k]), porId[k].marcos.length) : o[k]; return out; };
    C.conta = limpo(d.conta, false); C.recebidos = limpo(d.recebidos, true); C.avisadas = limpo(d.avisadas, true);
  },
});
