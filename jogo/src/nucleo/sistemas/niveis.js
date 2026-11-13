// Experiência e níveis. Subir de nível dá a recompensa de niveis.json e avisa o que foi liberado
// (tudo que tem "nivel": n nos outros arquivos de dados).
import { registrarSistema, registrarEvento } from '../registro.js';
import { liberaNoNivel } from '../dados.js';
import { darRecompensa } from './posses.js';

// O que a tela de subida mostra em "liberou": só o que este jogo já sabe usar (os dados já trazem o conteúdo dos
// marcos seguintes). Uma função por tipo de novidade: (mundo, { tipo, id, nome, item }) → bool. A loja responde
// pelos itens (MOSTRA_LIBERADO.item); cada frente acrescenta o seu tipo: 'animais', 'construcoes', 'arvores', 'receitas'.
export const MOSTRA_LIBERADO = { cultura: () => true };
const mostra = (m, x) => { const f = MOSTRA_LIBERADO[x.tipo] || MOSTRA_LIBERADO.item; return !!f && f(m, x); };

export function darXp(m, n, origem) {
  if (!(n > 0)) return;
  const P = m.progresso, N = m.dados.niveis;
  P.xp += n;
  m.eventos.emitir('ganhouXp', { n, origem });
  while (P.nivel < N.max && P.xp >= N.limiar[P.nivel + 1]) {
    P.nivel++;
    const recompensa = N.recompensas[P.nivel] || null;
    darRecompensa(m, recompensa, 'nivel');
    m.eventos.emitir('subiuDeNivel', { nivel: P.nivel, recompensa, liberou: liberaNoNivel(m.dados, P.nivel).filter((x) => mostra(m, x)) });
  }
}

// quanto falta para o próximo nível: { nivel, feito, precisa, fracao } (no último nível, fracao = 1)
export function barraDeXp(m) {
  const P = m.progresso, N = m.dados.niveis;
  if (P.nivel >= N.max) return { nivel: P.nivel, feito: 0, precisa: 0, fracao: 1 };
  const base = N.limiar[P.nivel], prox = N.limiar[P.nivel + 1];
  return { nivel: P.nivel, feito: P.xp - base, precisa: prox - base, fracao: Math.min(1, (P.xp - base) / (prox - base)) };
}

registrarSistema({
  id: 'niveis',
  iniciar(m) { m.progresso = { xp: 0, nivel: 1 }; },
  salvar(m) { return { xp: m.progresso.xp, nivel: m.progresso.nivel }; },
  carregar(m, d) {
    const N = m.dados.niveis;
    m.progresso.xp = d.xp || 0;
    // o nível gravado vale (as recompensas já foram dadas), mas não passa do que os dados permitem
    m.progresso.nivel = Math.max(1, Math.min(N.max, d.nivel || 1));
  },
});

registrarEvento('ganhouXp', { campos: ['n', 'origem'] });
registrarEvento('subiuDeNivel', { campos: ['nivel', 'recompensa', 'liberou'] });
