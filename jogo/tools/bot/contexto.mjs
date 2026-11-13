// O jogador automático por dentro: o estado dele (o que decidiu, o que evita, o que quer guardar) e o jeito de
// tocar no jogo. Cada decisão vira UM passo (J.g), que fazer() executa com os mesmos comandos do toque:
//   modo      escolherModo { modo, semente }                         1 toque
//   casa      tocarCasa { x, z }                                     1 toque
//   entidade  tocarEntidade { id }                                   1 toque
//   comprar   comprar { item, n }  (a loja abre de qualquer lugar)   2 toques
//   cmd       um comando de painel (construir, produzir, entregarPedido...)   n toques (abrir o painel e escolher)
//   esperar   não há o que fazer: fica olhando por "seg" segundos; "porque" vai para o relato
//   aguardar  a fila dela está cheia: espera andar
import { X } from './jogo.mjs';

export function criarJogador(m, perfil, opc = {}) {
  const J = {
    m, D: m.dados, I: m.dados.itens, P: m.posses, p: m.personagem, perfil,
    TOQUE: 0.4 / perfil.aproveitamento, // segundos entre um toque e o seguinte (o resto é olhar, ler, errar o toque)
    T0: opc.T0 || 0, FIM: opc.FIM || Infinity,
    agenda: opc.agenda || [], // [[início, fim]] das sessões, em ms do relógio do jogo
    g: { tipo: null }, notas: [], evita: new Map(),
    resta: 0, foraSeg: 0, // segundos que ainda faltam nesta sessão; quanto o jogo fica fechado depois dela
    quer: {}, querEm: -1, // o que guardar em vez de vender (pedido, missão, trato, receita), refeito a cada segundo
    reserva: 0, reservaPara: '', // ouro guardado para a meta da vez (missão, obra)
    campoExtra: 0, // casas a mais na lavoura (cresce quando ela fica à toa com o campo cheio)
    erros: {}, desligou: {}, // habilidade → mensagem da exceção (a habilidade é desligada)
    S: opc.S,
  };
  return J;
}

// ---------- o passo ----------
const LIMPO = { tipo: null, x: 0, z: 0, id: null, modo: null, item: null, n: 0, seg: 0, porque: '', cmd: null, chave: '', rotulo: '' };
export function passo(J, tipo, extra) { return Object.assign(J.g, LIMPO, { tipo }, extra); }
export const emModo = (J, modo, semente) => (J.m.modo.id !== modo || (semente && J.m.modo.semente !== semente) ? passo(J, 'modo', { modo, item: semente || null }) : null);
// um comando de painel: "toques" = quantos toques custa (abrir o painel, escolher, confirmar)
export const cmd = (J, c, toques = 2, chave = '') => passo(J, 'cmd', { cmd: c, n: toques, chave: chave || c.tipo });
// "não posso agora, por isto": a primeira nota de uma decisão sem passo vira o motivo da espera
export function nota(J, motivo) { if (motivo && J.notas.length < 8) J.notas.push(motivo); return null; }

// ---------- o que evitar por um tempo (recusas do jogo, lugares que não serviram) ----------
export function evitar(J, chave, seg) { J.evita.set(chave, J.m.agora + seg * 1000); }
export function evitado(J, chave) { const t = J.evita.get(chave); if (t === undefined) return false; if (t > J.m.agora) return true; J.evita.delete(chave); return false; }

// ---------- leituras rápidas ----------
export const nivel = (J) => J.m.progresso.nivel;
export const naFazenda = (J) => J.p.local === 'fazenda';
export const fazenda = (J) => J.m.locais.fazenda;
export const tem = (J, item) => (X.posses ? X.posses.quantoTem(J.m, item) : 0);
export const comando = (J, nome) => typeof J.m.comandos[nome] === 'function';
export function filaTem(J, acao, x, z) { return X.personagem ? X.personagem.filaTem(J.m, acao, x, z) : false; }
export function contarNaFila(J, acao, f) { return X.personagem ? X.personagem.contarNaFila(J.m, acao, f) : 0; }
export const ocupada = (J) => (X.personagem ? X.personagem.ocupada(J.m) : false);
// ouro que dá para gastar sem mexer na reserva da meta
export const livre = (J) => J.P.ouro - J.reserva;
// segundos (do relógio do bot) desde o começo
export const rel = (J, t = J.m.agora) => (t - J.T0) / 1000;

// o próximo instante (ms) em que o jogador está jogando, a partir de t
export function presenca(J, t) {
  const A = J.agenda;
  for (let k = 0; k < A.length; k++) { if (t < A[k][0]) return A[k][0]; if (t <= A[k][1]) return t; }
  return t + 86400000;
}

// soma n ao que se quer ter guardado de um item
export function querer(Q, item, n) { if (n > 0) Q[item] = (Q[item] || 0) + n; }
