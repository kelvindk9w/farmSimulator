// O poço: enche o regador que está no cinto (ou busca antes o regador guardado, no lugar dele ao lado do poço ou no
// suporte do celeiro, como toda ação com ferramenta).
import { registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { ferramentaNoCinto, ferramentaGuardada } from './posses.js';
import { filaTem } from './personagem.js';

// o regador que a ação usaria: o do cinto; sem ele, o guardado (a personagem vai buscar)
const regador = (m) => ferramentaNoCinto(m, 'regador') || ferramentaGuardada(m, 'regador');

// o poço velho do começo humilde (corda puída, sem manivela) enche mais devagar e dá menos água de uma vez:
// construcoes.json "demora" multiplica o tempo, "aguaMax" é o máximo de regas por puxada (o regador grande não enche)
const defDoPoco = (m, t) => { const e = t && t.entidade !== undefined ? m.local.porId[t.entidade] : null; return e ? m.dados.construcoes[e.tipo] : null; };
function duracao(m, t, args, dur) { const d = defDoPoco(m, t); return d && d.demora > 0 ? dur * d.demora : dur; }
// até quanto o poço enche este regador
const enchimento = (m, d, id) => { const cap = m.dados.itens[id].capacidade; return d && d.aguaMax > 0 ? Math.min(cap, d.aguaMax) : cap; };

registrarAcao({
  id: 'encher', ferramenta: 'regador', dur: 1.5, efeitoEm: 1.1, estadoVisual: 'manivela', duracao,
  pode(m, alvo) {
    const id = regador(m);
    if (!id) return { ok: false, motivo: 'sem-ferramenta', dados: { funcao: 'regador' } };
    if (m.posses.ferramentas[id].agua >= enchimento(m, defDoPoco(m, alvo), id)) return { ok: false, motivo: 'regador-cheio' };
    return { ok: true };
  },
  aoEfeito(m, alvo) {
    const id = ferramentaNoCinto(m, 'regador'), f = m.posses.ferramentas[id], cap = enchimento(m, defDoPoco(m, alvo), id);
    const n = Math.max(0, cap - f.agua);
    f.agua = Math.max(f.agua, cap);
    m.eventos.emitir('encheu', { item: id, n, agua: f.agua, entidade: alvo.entidade });
  },
});

export const ehPoco = (e) => !!e && (e.tipo === 'poco' || e.tipo === 'poco-velho');
function tocarNoPoco(m, e) {
    const id = regador(m);
    if (!id) return { acao: null, texto: 'sem-ferramenta', dados: { funcao: 'regador' } };
    const f = m.posses.ferramentas[id], cap = enchimento(m, e && m.dados.construcoes[e.tipo], id);
    // cheio agora, mas com regas na fila: quando ela chegar ao poço já haverá o que encher
    if (f.agua >= cap && !filaTem(m, 'regar')) return { acao: null, texto: 'regador-cheio' };
    return { acao: 'encher', dados: { agua: f.agua, capacidade: cap } };
}
registrarTipo({ tipo: 'poco', casas: [2, 2], bloqueia: true, poco: true, acaoPossivel: tocarNoPoco });
// o poço velho: o mesmo poço, sem manivela (a reforma troca um pelo outro, no mesmo lugar)
registrarTipo({ tipo: 'poco-velho', casas: [2, 2], bloqueia: true, poco: true, acaoPossivel: tocarNoPoco });

registrarEvento('encheu', { campos: ['item', 'n', 'agua', 'entidade'] });
