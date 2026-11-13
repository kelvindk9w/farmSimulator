// O correio: o que espera o jogador para abrir. O presente de convidado, os presentes dos amigos que chegaram e o
// presente do dia ficam na caixa de correio até ele tocar nela; nada abre sozinho.
//   abrirCorreio   abre o próximo que espera (um por vez) e devolve o que veio, como o comando de cada um
import { registrarSistema } from '../registro.js';
import { temPresente } from './diaria.js';

// [{ classe: 'convidado' | 'amigo' | 'diaria', n, comando }], na ordem em que abrem
export function noCorreio(m) {
  const out = [], A = m.amigos;
  if (A.presente === 'espera') out.push({ classe: 'convidado', n: 1, comando: 'receberConvite' });
  if (A.aReceber > 0) out.push({ classe: 'amigo', n: A.aReceber, comando: 'receberDeAmigo' });
  if (temPresente(m)) out.push({ classe: 'diaria', n: 1, comando: 'abrirPresente' });
  return out;
}
export function quantosNoCorreio(m) { let n = 0; for (const c of noCorreio(m)) n += c.n; return n; }

registrarSistema({
  id: 'correio',
  comandos: {
    abrirCorreio(m) {
      const c = noCorreio(m)[0];
      if (!c) return { ok: false, motivo: 'correio-vazio' };
      return m.comando({ tipo: c.comando });
    },
  },
});
