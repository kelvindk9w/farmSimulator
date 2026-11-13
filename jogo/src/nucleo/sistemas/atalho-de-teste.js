// Atalho da versão de teste: o dono do jogo pula para um nível e ganha ouro e material, para testar o que vem
// depois (galinhas, indústrias, bichos de trabalho) sem jogar horas. Sai quando o jogo for para a loja.
//   comando atalhoDeTeste { nivel }   → sobe direto para o nível (uma só tela de subida, com tudo o que liberou
//                                        no caminho), dá o ouro e os materiais de ATALHO e marca a gravação.
import { registrarSistema, registrarEvento } from '../registro.js';
import { liberaNoNivel } from '../dados.js';
import { MOSTRA_LIBERADO } from './niveis.js';

export const ATALHO = {
  ouro: 60000,
  itens: { madeira: 60, tabua: 60, prego: 150, pedra: 60, fibra: 60, milho: 60, racao: 40, 'semente-alface': 20, 'semente-milho': 20 },
};
const mostra = (m, x) => { const f = MOSTRA_LIBERADO[x.tipo] || MOSTRA_LIBERADO.item; return !!f && f(m, x); };

registrarEvento('usouAtalhoDeTeste', { campos: ['nivel'] });

registrarSistema({
  id: 'atalhoDeTeste',
  iniciar(m) { m.atalhoDeTeste = { usado: 0 }; },
  salvar(m) { return { usado: m.atalhoDeTeste.usado }; },
  carregar(m, d) { m.atalhoDeTeste.usado = (d && d.usado) || 0; },
  comandos: {
    atalhoDeTeste(m, c) {
      const N = m.dados.niveis, P = m.progresso;
      const alvo = Math.max(1, Math.min(N.max, Math.floor(Number(c.nivel) || 0)));
      if (alvo <= P.nivel && !c.soMaterial) return { ok: false, motivo: 'ja-passou', dados: { nivel: P.nivel } };
      const de = P.nivel, liberou = [];
      if (alvo > P.nivel) {
        for (let n = de + 1; n <= alvo; n++) for (const x of liberaNoNivel(m.dados, n)) if (mostra(m, x)) liberou.push(x);
        P.nivel = alvo; P.xp = Math.max(P.xp, N.limiar[alvo]);
      }
      m.posses.ouro += ATALHO.ouro;
      for (const k in ATALHO.itens) if (m.dados.itens[k]) m.posses.bolsa[k] = (m.posses.bolsa[k] || 0) + ATALHO.itens[k];
      m.atalhoDeTeste.usado++;
      m.eventos.emitir('usouAtalhoDeTeste', { nivel: P.nivel });
      if (P.nivel > de) m.eventos.emitir('subiuDeNivel', { nivel: P.nivel, recompensa: null, liberou });
      return { ok: true, dados: { nivel: P.nivel, ouro: ATALHO.ouro } };
    },
  },
});
