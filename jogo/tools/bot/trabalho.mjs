// Animais de trabalho e de estimação: arar com o boi (modo "Arado", uma fileira por toque), ligar "ir a cavalo",
// levar o jumento com a carroça, e afagar o bicho de estimação uma vez por dia (o mimo). Tudo defensivo: são
// sistemas novos; se faltar algo, a habilidade fica de fora e o relato diz o quê.
import { X, precisa } from './jogo.mjs';
import { passo, emModo, nota, evitado, evitar, naFazenda, fazenda, comando, cmd } from './contexto.mjs';
import { zona } from './lavoura.mjs';

const T = X.trabalho, E = X.estimacao;
export const LIGADA_TRABALHO = precisa('trabalho', { trabalho: ['bichoDe', 'faltaDe', 'pronto', 'podeArarComBoi', 'podeMontar', 'podeLevar'] });
export const LIGADA_ESTIMACAO = precisa('estimacao', { estimacao: ['temMimo', 'bichosDeEstimacao'] });

// o bicho de trabalho deste papel ('arar' | 'montaria' | 'carga'), e o apetrecho que falta para ele trabalhar
export const bicho = (J, papel) => (LIGADA_TRABALHO ? T.bichoDe(J.m, papel) : null);
export const apetrechoQueFalta = (J, papel) => { const a = bicho(J, papel); return a ? T.faltaDe(J.m, a) : null; };
export const especieDoPapel = (J, papel) => { const d = Object.values(J.D.animais).find((x) => x.efeito && x.efeito.tipo === papel && x.preco.ouro > 0); return d ? d.id : null; };

// arar com o boi: a grama (ou campo) livre mais perto, começando pela lavoura
export function ararComBoi(J) {
  if (!LIGADA_TRABALHO || !naFazenda(J) || !T.podeArarComBoi(J.m)) return null;
  const loc = fazenda(J), m = J.m, Z = zona(J);
  if (J.p.fila.length >= 4) return null;
  const pode = (x, z) => (X.lavoura.podeArar ? X.lavoura.podeArar(m, x, z, loc) : loc.chao[z * loc.l + x] === X.local.GRAMA && !loc.ocupa[z * loc.l + x]);
  const naFila = (x, z) => { const p = J.p, s = (t) => t && t.tipo === 'agir' && (t.acao === 'ararComBoi' || t.acao === 'arar') && ((t.x === x && t.z === z) || (t.args && t.args.casas && t.args.casas.some((c) => c[0] === x && c[1] === z))); return s(p.tarefa) || p.fila.some(s); };
  let alvo = null;
  for (const i of Z) { const x = i % loc.l, z = (i - x) / loc.l; if (pode(x, z) && !naFila(x, z)) { alvo = [x, z]; break; } }
  if (!alvo) {
    // a lavoura está toda plantada: ara a grama própria mais perto dela
    const p = J.p, x0 = Math.floor(p.x), z0 = Math.floor(p.z);
    let dm = Infinity;
    for (let z = z0 - 12; z <= z0 + 12; z++) for (let x = x0 - 12; x <= x0 + 12; x++) {
      if (!loc.dentro(x, z) || !loc.propria[z * loc.l + x] || !pode(x, z) || naFila(x, z)) continue;
      const d = Math.abs(x - x0) + Math.abs(z - z0);
      if (d < dm) { dm = d; alvo = [x, z]; }
    }
  }
  if (!alvo) return nota(J, 'não há grama livre para o boi arar');
  return emModo(J, 'arado') || passo(J, 'casa', { x: alvo[0], z: alvo[1] });
}

// "ir a cavalo": liga o botão; a viagem longa já é montada. Para a missão, ela vai a um ponto a umas dez casas.
export function cavalgar(J, paraMissao) {
  if (!LIGADA_TRABALHO || !naFazenda(J) || !T.podeMontar(J.m)) return null;
  if (!J.m.trabalho.aCavalo && comando(J, 'irACavalo') && !evitado(J, 'cavalo')) { evitar(J, 'cavalo', 60); return cmd(J, { tipo: 'irACavalo', ligado: true }, 1, 'cavalo'); }
  if (!paraMissao || J.p.fila.length || J.m.trabalho.viagem) return null;
  const loc = fazenda(J), p = J.p;
  let alvo = null, dm = Infinity;
  for (let z = Math.floor(p.z) - 14; z <= p.z + 14; z++) for (let x = Math.floor(p.x) - 14; x <= p.x + 14; x++) {
    if (!loc.andavel(x, z) || loc.plantas[z * loc.l + x]) continue;
    const d = Math.abs(Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z) - 10);
    if (d < dm) { dm = d; alvo = [x, z]; }
  }
  return alvo ? emModo(J, 'mao') || passo(J, 'casa', { x: alvo[0], z: alvo[1] }) : null;
}

// o jumento com a carroça: liga uma vez (o cesto passa para a carroça e, com o barril, o regador se enche no campo)
export function levarJumento(J) {
  if (!LIGADA_TRABALHO || !naFazenda(J) || !T.podeLevar(J.m) || J.m.trabalho.levando || !comando(J, 'levarJumento') || evitado(J, 'jumento')) return null;
  evitar(J, 'jumento', 120);
  return cmd(J, { tipo: 'levarJumento', ligado: true }, 1, 'jumento');
}

// afagar o bicho de estimação que ainda tem mimo hoje
export function afagar(J) {
  if (!LIGADA_ESTIMACAO || !naFazenda(J) || J.m.agora < (J.proxAfago || 0)) return null;
  J.proxAfago = J.m.agora + 30000;
  for (const b of E.bichosDeEstimacao(J.m)) {
    if (!b.mimo) continue;
    const loc = fazenda(J), e = loc.porId['bicho:' + b.id];
    if (!e || evitado(J, 'afago:' + b.id)) continue;
    // o bicho está passando por cima de uma obra (ou ficou dentro dela): ela não chega; tenta daqui a pouco
    const cx = Math.floor(e.x + 0.5), cz = Math.floor(e.z + 0.5);
    if (loc.dentro(cx, cz) && loc.ocupa[loc.i(cx, cz)] && loc.porNum[loc.ocupa[loc.i(cx, cz)]] !== e) { evitar(J, 'afago:' + b.id, 300); continue; }
    // o afago de antes não rendeu (o mimo continua) e o bicho não saiu do lugar: ela não chega nele
    const T = (J.afagos = J.afagos || {}), t = T[b.id];
    if (t && t.x === e.x && t.z === e.z) {
      if (++t.n >= 3) {
        if (!t.anotado) { t.anotado = true; J.S.preso.push([(J.m.agora - J.T0) / 1000, `${b.nome} (${b.id}) parado em ${e.x.toFixed(2)},${e.z.toFixed(2)}: o afago falha (sem caminho) e ele não sai dali`]); }
        evitar(J, 'afago:' + b.id, 6 * 3600);
        continue;
      }
    } else T[b.id] = { x: e.x, z: e.z, n: 1 };
    evitar(J, 'afago:' + b.id, 60);
    return passo(J, 'entidade', { id: e.id });
  }
  return null;
}
