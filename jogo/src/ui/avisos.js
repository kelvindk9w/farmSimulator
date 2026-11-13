// Avisos curtos no alto da tela ("o regador está vazio: toque no poço"). Somem sozinhos e nunca bloqueiam o jogo.
// No máximo dois ao mesmo tempo: os outros esperam a vez (e apressam o mais velho). Enquanto uma tela de recompensa
// (a subida de nível) está aberta, nenhum aparece: ficam guardados e saem quando ela fecha.
import { el } from './dom.js';

const MAXIMO = 2, DURA = 2800, ESPERA_MAX = 4;
const MINIMO = 1100; // ms que um aviso fica na tela antes de ceder o lugar a outro que espera
let caixa = null, seguro = false;
const vivos = []; // { e, texto, tipo, dura, some, desde }
const espera = []; // { texto, tipo, dura }

export function prepararAvisos(ui) { caixa = el('div', 'avisos'); ui.append(caixa); }

function tirar(a, jaJa) {
  const i = vivos.indexOf(a);
  if (i < 0) return;
  vivos.splice(i, 1);
  clearTimeout(a.some);
  if (jaJa) a.e.remove(); else { a.e.classList.add('sai'); setTimeout(() => a.e.remove(), 320); }
  escoar();
}
function mostrar(p) {
  const a = { e: el('div', 'aviso' + (p.tipo ? ' ' + p.tipo : ''), p.texto), texto: p.texto, tipo: p.tipo, dura: p.dura, some: 0, desde: Date.now() };
  a.e.setAttribute('role', 'status');
  caixa.append(a.e);
  vivos.push(a);
  a.some = setTimeout(() => tirar(a), p.dura);
}
// põe na tela os que esperam, enquanto houver lugar; se ainda sobra alguém, o mais velho da tela sai mais cedo
function escoar() {
  if (seguro || !caixa) return;
  while (espera.length && vivos.length < MAXIMO) mostrar(espera.shift());
  if (espera.length && vivos.length) {
    const a = vivos[0], resta = Math.max(200, MINIMO - (Date.now() - a.desde));
    if (!a.apressado) { a.apressado = true; clearTimeout(a.some); a.some = setTimeout(() => tirar(a), Math.min(resta, a.dura)); }
  }
}

// tipo: '' (falta alguma coisa) | 'bom' (ganhou, conseguiu). O mesmo texto repetido só renova o que já está na tela.
export function avisar(texto, tipo = '', dura = DURA) {
  if (!texto || !caixa) return;
  const igual = vivos.find((a) => a.texto === texto);
  if (igual) {
    if (!igual.apressado) { clearTimeout(igual.some); igual.some = setTimeout(() => tirar(igual), dura); }
    igual.e.classList.remove('treme'); void igual.e.offsetWidth; igual.e.classList.add('treme');
    return;
  }
  if (espera.some((p) => p.texto === texto)) return;
  if (espera.length >= ESPERA_MAX) espera.shift(); // fila comprida demais: o mais antigo se perde
  espera.push({ texto, tipo, dura });
  escoar();
}

// uma tela de recompensa abriu (sim) ou fechou (não): com ela aberta os avisos saem da tela e esperam
export function segurarAvisos(sim) {
  if (seguro === !!sim) return;
  seguro = !!sim;
  if (seguro) {
    const voltam = vivos.map((a) => ({ texto: a.texto, tipo: a.tipo, dura: a.dura }));
    for (const a of [...vivos]) { clearTimeout(a.some); a.e.remove(); }
    vivos.length = 0;
    espera.unshift(...voltam);
    while (espera.length > ESPERA_MAX) espera.shift();
  } else escoar();
}
export function avisosNaTela() { return vivos.map((a) => a.texto); }
export function avisosEmEspera() { return espera.map((p) => p.texto); }
