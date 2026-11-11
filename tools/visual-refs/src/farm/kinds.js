// Registro de tipos de entidade: como desenhar cada uma e como agrupá-las.
//   cat 'lote'  -> fundida numa única malha estática (1 draw call para todas)
//   cat 'inst'  -> desenhada por instanciamento (1 draw call por tipo/variação)
//   cat 'chao'  -> também fundida, mas não projeta sombra (canteiros, lagoa, caminhos)
import { C } from '../lib/palette.js';
import * as N from '../models/nature.js';
import * as B from '../models/buildings.js';
import * as P from '../models/props.js';
import * as A from '../models/animals.js';

const HEN = { branca: 'henWhite', marrom: 'henBrown', caramelo: 'henCaramel', galo: 'henCaramel' };
const CROP_COLOR = { milho: 'cornEar', cafe: 'coffeeCherry', mandioca: 'cassavaRoot', cana: 'caneStalk' };
const IPE = { ipeA: 'clothYellow', ipeR: 'clothPink' };

export const KINDS = {
  // construções
  casa: { cat: 'lote', draw: (b, e) => B.casa(b, { lit: e.lit }), h: 5.5 },
  galpao: { cat: 'lote', draw: (b) => B.galpao(b), h: 6.2 },
  silo: { cat: 'lote', draw: (b) => B.silo(b), h: 6.8 },
  galinheiro: { cat: 'lote', draw: (b) => B.galinheiro(b), h: 3.2 },
  barraca: { cat: 'lote', draw: (b) => B.barraca(b), h: 3.4 },
  // chão
  canteiro: { cat: 'chao', draw: (b, e) => P.canteiro(b, e.w, e.d, { wet: e.wet }), key: (e) => `${e.w}x${e.d}:${e.wet}` },
  lagoa: { cat: 'chao', draw: (b) => P.lagoa(b) },
  caminho: { cat: 'chao', draw: (b, e) => P.celulaCaminho(b, e.mask, e.seed || 1), key: (e) => `${e.mask}:${e.seed2d ?? e.seed}` },
  // objetos únicos
  plaquinha: { cat: 'lote', draw: (b, e) => P.plaquinha(b, C[CROP_COLOR[e.crop]]), key: (e) => e.crop },
  espantalho: { cat: 'lote', draw: (b) => P.espantalho(b) },
  vasoGrande: { cat: 'lote', draw: (b) => P.vasoGrande(b) },
  trator: { cat: 'lote', draw: (b) => P.trator(b) },
  fardo: { cat: 'lote', draw: (b) => B.fardo(b) },
  saca: { cat: 'lote', draw: (b) => B.saca(b) },
  lenha: { cat: 'lote', draw: (b) => P.lenha(b) },
  monteFeno: { cat: 'lote', draw: (b) => P.monteFeno(b) },
  caixote: { cat: 'lote', draw: (b, e) => B.caixote(b, {}, e.fill), key: (e) => e.fill },
  cocho: { cat: 'lote', draw: (b) => P.cocho(b) },
  latao: { cat: 'lote', draw: (b) => P.latao(b) },
  comedouro: { cat: 'lote', draw: (b) => P.comedouro(b) },
  banco: { cat: 'lote', draw: (b) => B.banco(b) },
  poco: { cat: 'lote', draw: (b) => P.poco(b) },
  carrinho: { cat: 'lote', draw: (b) => P.carrinho(b) },
  poste: { cat: 'lote', draw: (b, e) => P.poste(b, { h: e.h }), key: (e) => e.h },
  bandeirinhas: { cat: 'lote', draw: (b, e) => P.bandeirinhas(b, e.a, e.b, { offset: e.off || 0 }), key: (e) => JSON.stringify([e.a, e.b]), abs: true },
  porteira: { cat: 'lote', draw: (b) => P.porteira(b) },
  // repetidos -> instanciamento
  cercaSeg: { cat: 'inst', draw: (b) => { P.cerca(b, -1, 0, 1, 0, { noEnd: true }); } },
  telaSeg: { cat: 'inst', draw: (b, e) => { const L = e.len || 2.2; P.tela(b, -L / 2, 0, L / 2, 0); }, key: (e) => e.len || 2.2 },
  laranjeira: { cat: 'inst', draw: (b, e) => N.laranjeira(b, { seed: 10 + e.v }), key: (e) => e.v },
  bananeira: { cat: 'inst', draw: (b, e) => N.bananeira(b, { seed: 20 + e.v }), key: (e) => e.v },
  cajueiro: { cat: 'inst', draw: (b, e) => N.cajueiro(b, { seed: 30 + e.v }), key: (e) => e.v },
  arvore: { cat: 'inst', draw: (b, e) => N.arvoreMata(b, { kind: IPE[e.kind] ? 'ipe' : e.kind, color: IPE[e.kind] ? C[IPE[e.kind]] : undefined, seed: 40 + e.v }), key: (e) => e.kind + e.v },
  arbusto: { cat: 'inst', draw: (b, e) => N.arbusto(b, { seed: e.v, flowers: e.v === 2 ? C.flowerB : e.v === 3 ? C.clothYellow : null }), key: (e) => e.v },
  pedra: { cat: 'inst', draw: (b, e) => N.pedra(b, { pair: e.v === 2 }), key: (e) => e.v },
  planta: { cat: 'inst', draw: (b, e) => N.CULTURAS[e.crop](b, e.stage), key: (e) => e.crop + e.stage },
  tufo: { cat: 'inst', draw: (b) => N.tufo(b), noShadow: true },
  flor: { cat: 'inst', draw: (b, e) => N.flor(b, { color: C[e.cor] }), key: (e) => e.cor, noShadow: true },
  // animais (no jogo seriam animados; aqui, instâncias em pose fixa)
  galinha: { cat: 'inst', animal: true, draw: (b, e) => A.galinha(b, { color: C[HEN[e.cor]], peck: !!e.peck, rooster: e.cor === 'galo' }), key: (e) => e.cor + (e.peck ? 'p' : '') },
  pintinho: { cat: 'inst', animal: true, draw: (b) => A.pintinho(b) },
  vaca: { cat: 'inst', animal: true, draw: (b, e) => A.vaca(b, { tipo: e.tipo, graze: !!e.graze }), key: (e) => e.tipo + (e.graze ? 'g' : '') },
  pato: { cat: 'inst', animal: true, draw: (b) => P.pato(b) },
};

export function chave(e) {
  const k = KINDS[e.k];
  return e.k + (k.key ? ':' + k.key(e) : '');
}
