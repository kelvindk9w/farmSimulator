// O poço: enche o regador que está no cinto (ou busca o regador no suporte antes, como toda ação com ferramenta).
import { registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { ferramentaNoCinto, ferramentaNoSuporte } from './posses.js';

// o regador que a ação usaria: o do cinto; sem ele, o do suporte (a personagem vai buscar)
const regador = (m) => ferramentaNoCinto(m, 'regador') || ferramentaNoSuporte(m, 'regador');

registrarAcao({
  id: 'encher', ferramenta: 'regador', dur: 1.5, efeitoEm: 1.1, estadoVisual: 'manivela',
  pode(m) {
    const id = regador(m);
    if (!id) return { ok: false, motivo: 'sem-ferramenta', dados: { funcao: 'regador' } };
    if (m.posses.ferramentas[id].agua >= m.dados.itens[id].capacidade) return { ok: false, motivo: 'regador-cheio' };
    return { ok: true };
  },
  aoEfeito(m, alvo) {
    const id = ferramentaNoCinto(m, 'regador'), f = m.posses.ferramentas[id], cap = m.dados.itens[id].capacidade;
    const n = cap - f.agua;
    f.agua = cap;
    m.eventos.emitir('encheu', { item: id, n, agua: cap, entidade: alvo.entidade });
  },
});

registrarTipo({
  tipo: 'poco', casas: [2, 2], bloqueia: true,
  acaoPossivel(m) {
    const id = regador(m);
    if (!id) return { acao: null, texto: 'sem-ferramenta', dados: { funcao: 'regador' } };
    const f = m.posses.ferramentas[id], cap = m.dados.itens[id].capacidade;
    if (f.agua >= cap) return { acao: null, texto: 'regador-cheio' };
    return { acao: 'encher', dados: { agua: f.agua, capacidade: cap } };
  },
});

registrarEvento('encheu', { campos: ['item', 'n', 'agua', 'entidade'] });
