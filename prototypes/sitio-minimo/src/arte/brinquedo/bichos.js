// Conjunto "brinquedo": a roupa da vaca e da galinha, osso por osso, em cima dos esqueletos do conjunto "codigo"
// (src/arte/codigo/vaca.js e galinha.js; as medidas dos ossos estão lá). As formas seguem as folhas de modelo
// arte/estilo/rodada-02/folha-vaca.png e folha-galinha.png: corpo em cápsula, cabeça redonda, focinho rosa grande,
// manchas chapadas na vaca; galinha quase esférica com asas e rabo em gomos.
import * as THREE from 'three';
import { shade } from '../codigo/base.js';
import { P, decalque, ovalDe } from './kit.js';

const TAU = Math.PI * 2, GR = Math.PI / 180;

// ---------------- vaca ----------------
const COXA = 0.4, CANELA = 0.44;
// o corpo é uma cápsula deitada ao longo de z; esta função dá o ponto da superfície (ângulo em volta, z) para as manchas
const CORPO = { R: 0.45, meio: 0.84, sx: 1.04, y: -0.03 };
function peleDoCorpo(t, z, e = 0) {
  const { R, meio, sx, y } = CORPO, a = meio - R, c = Math.max(-a, Math.min(a, z)), d = Math.max(-R, Math.min(R, z - c));
  const ro = Math.sqrt(Math.max(0, R * R - d * d)), k = (R + e) / R;
  return [Math.cos(t) * ro * k * sx, y + Math.sin(t) * ro * k, c + d * k];
}
// a cabeça é um ovo; ponto da superfície pela direção (x, y) vista de frente
const CRANIO = { c: [0, 0, 0.02], r: [0.2, 0.21, 0.19] }, CABECA = 1.28; // a cabeça é grande: desenhada 1,28 vez maior em volta do osso

export function vaca(b, nome) {
  const creme = P.vacaCreme, escuro = P.vacaEscuro, rosa = P.focinho;
  if (nome === 'tronco') {
    const { R, meio, sx, y } = CORPO;
    b.cap(R, meio * 2, creme, { p: [0, y, -meio], r: [90, 0, 0], s: [sx, 1, 1], n: 24, nc: 6 });
    // manchas chapadas: uma sela grande atrás e uma oval em cada lado, na frente
    decalque(b, peleDoCorpo, ovalDe(95 * GR, -0.33, 1.32, 0.33, 30, 0.1, 3), escuro, { aneis: 5 });
    decalque(b, peleDoCorpo, ovalDe(14 * GR, 0.34, 0.5, 0.2, 20, 0.08, 2), escuro, { aneis: 2 });
    decalque(b, peleDoCorpo, ovalDe(168 * GR, 0.28, 0.56, 0.22, 20, 0.08, 2), escuro, { aneis: 2 });
  } else if (nome === 'ubere') {
    b.sph(0.17, 0, 0, rosa, { p: [0, -0.12, 0], s: [1, 0.74, 1.12] });
    for (const x of [-0.065, 0.065]) for (const z of [-0.07, 0.07]) b.cap(0.03, 0.1, P.focinhoEscuro, { p: [x, -0.3, z], n: 6, nc: 2 });
  } else if (nome === 'pescoco') {
    // uma bola na junta (fica dentro do corpo em qualquer giro) e o pescoço grosso saindo dela
    b.sph(0.19, 0, 0, creme, { n: 14 });
    b.cyl(0.165, 0.2, 0.44, 0, creme, { r: [41, 0, 0], q: 0.08, n: 14 });
    b.add(new THREE.TorusGeometry(0.2, 0.034, 6, 18), P.coleira, { p: [0, 0.12, 0.09], r: [131, 0, 0] });
    b.sph(0.062, 0, 0, P.sino, { p: [0, -0.03, 0.262], s: [1, 1.08, 1] });
    b.sph(0.02, 0, 0, P.palhaEscura, { p: [0, -0.095, 0.27] });
  } else if (nome === 'cabeca') {
    b.group({ r: [8, 0, 0], s: CABECA }, () => {
      const { c, r } = CRANIO;
      b.sph(1, 0, 0, creme, { p: c, s: r, n: 20 });
      // topo escuro, entre os chifres, descendo até a testa
      b.group({ p: c, s: [r[0] * 1.04, r[1] * 1.04, r[2] * 1.04] }, () => b.add(new THREE.SphereGeometry(1, 22, 6, 0, TAU, 0, 0.36 * Math.PI), escuro, { r: [-24, 0, 0] }));
      // focinho rosa grande, com as duas narinas
      b.sph(1, 0, 0, rosa, { p: [0, -0.14, 0.165], s: [0.195, 0.122, 0.155], n: 18 });
      for (const sx of [-1, 1]) {
        b.sph(0.024, 0, 0, P.focinhoEscuro, { p: [sx * 0.07, -0.118, 0.306], s: [0.9, 1.25, 0.5] });
        b.sph(0.03, 0, 0, P.olho, { p: [sx * 0.1, 0.03, 0.172], s: [0.8, 1.3, 0.55] });
        b.cone(0.047, 0.14, 0, P.chifre, { p: [sx * 0.118, 0.155, 0], r: [0, 0, sx * -24], n: 10 });
      }
    });
  } else if (nome === 'mandibula') {
    b.group({ r: [8, 0, 0], s: CABECA }, () => b.sph(1, 0, 0, P.focinhoEscuro, { p: [0, -0.11, 0.1], s: [0.15, 0.058, 0.115], n: 10 }));
  } else if (nome === 'orelhaE' || nome === 'orelhaD') {
    const sx = nome === 'orelhaE' ? 1 : -1;
    b.group({ p: [sx * 0.05, 0.025, 0.04], r: [0, 0, sx * -14], s: CABECA }, () => {
      b.sph(1, 0, 0, escuro, { p: [sx * 0.19, -0.01, 0.02], s: [0.165, 0.092, 0.05], n: 12 });
      b.sph(1, 0, 0, rosa, { p: [sx * 0.2, -0.016, 0.046], s: [0.112, 0.055, 0.03], n: 10 });
    });
  } else if (nome === 'rabo1' || nome === 'rabo2') {
    b.cap(nome === 'rabo1' ? 0.04 : 0.035, 0.36, creme, { p: [0, 0.03, 0.005], r: [190, 0, 0], n: 7, nc: 2 });
  } else if (nome === 'rabo3') {
    b.sph(1, 0, 0, escuro, { p: [0, -0.1, -0.018], s: [0.072, 0.125, 0.072], n: 8 });
  } else if (nome.endsWith('1') && nome.startsWith('p')) {
    b.cap(0.125, COXA + 0.27, creme, { p: [0, -COXA - 0.12, 0], n: 12, nc: 2 });
  } else if (nome.endsWith('2') && nome.startsWith('p')) {
    b.cap(0.119, CANELA + 0.02, creme, { p: [0, -CANELA + 0.1, 0], n: 12, nc: 2 });
    b.cyl(0.128, 0.136, 0.15, 0, P.casco, { p: [0, -CANELA, 0], q: 0.045, n: 12 });
  }
}

// sinal de "leite pronto": a garrafinha de leite de tampa azul
export function sinalDeLeite(b) {
  b.lathe([[0.001, 0], [0.09, 0], [0.118, 0.025], [0.122, 0.2], [0.1, 0.26], [0.062, 0.3], [0.058, 0.35], [0.001, 0.35]], 0, P.leite, { n: 10 });
  b.cyl(0.07, 0.07, 0.06, 0, P.tampa, { p: [0, 0.335, 0], q: 0.02, n: 10 });
}

// ---------------- galinha ----------------
const COXA_G = 0.085, CANELA_G = 0.1;
export function galinha(b, nome, padrao, ctx) {
  const caramelo = ctx && ctx.def && ctx.def.variante !== 'branca';
  const cor = new THREE.Color(caramelo ? P.galinhaCaramelo : P.galinhaBranca), asa = shade(cor, caramelo ? 0.92 : 0.94), rabo = shade(cor, caramelo ? 0.96 : 0.975);
  if (nome === 'corpo') b.sph(0.232, 0, 0, cor, { p: [0, -0.012, -0.01], s: [1, 0.95, 1.06], n: 22 });
  else if (nome === 'asaE' || nome === 'asaD') { // gomo achatado que pende da junta (abre para o lado no bater de asas)
    const sx = nome === 'asaE' ? 1 : -1;
    b.sph(1, 0, 0, asa, { p: [sx * 0.072, -0.095, -0.045], s: [0.062, 0.118, 0.135], r: [-18, 0, 0], n: 12 });
  } else if (nome === 'cauda') { // três gomos gordos
    b.sph(1, 0, 0, rabo, { p: [0, 0.075, -0.075], s: [0.062, 0.095, 0.07], r: [-28, 0, 0], n: 8 });
    for (const sx of [-1, 1]) b.sph(1, 0, 0, rabo, { p: [sx * 0.068, 0.045, -0.06], s: [0.052, 0.08, 0.062], r: [-28, 0, sx * -22], n: 8 });
  } else if (nome === 'pescoco') { // pera: larga embaixo (o papo), fina em cima, para o corpo virar cabeça sem degrau
    b.lathe([[0, -0.13], [0.14, -0.125], [0.18, -0.07], [0.178, -0.02], [0.161, 0.03], [0.137, 0.082], [0.114, 0.132], [0.098, 0.16], [0, 0.18]], 0, cor, { p: [0, 0, -0.012], n: 16 });
  } else if (nome === 'cabeca') {
    b.sph(0.126, 0, 0, cor, { p: [0, -0.015, 0], n: 18 });
    b.cone(0.047, 0.095, 0, P.bico, { p: [0, -0.03, 0.1], r: [90, 0, 0], n: 8 });
    // crista de três bolinhas e a barbela embaixo do bico
    b.bola(0.04, P.crista, { p: [0, 0.105, 0.055], seg: 8, aneis: 6 });
    b.bola(0.047, P.crista, { p: [0, 0.125, 0.0], seg: 8, aneis: 6 });
    b.bola(0.037, P.crista, { p: [0, 0.1, -0.055], seg: 8, aneis: 6 });
    for (const sx of [-1, 1]) {
      b.bola(1, P.crista, { p: [sx * 0.02, -0.092, 0.098], s: [0.022, 0.036, 0.022] });
      b.bola(0.022, P.olho, { p: [sx * 0.07, 0.002, 0.097], s: [1, 1.15, 0.6], seg: 8, aneis: 6 });
    }
  } else if (nome.endsWith('1')) b.cap(0.028, COXA_G + 0.05, P.pe, { p: [0, -COXA_G - 0.02, 0], n: 6, nc: 2 });
  else if (nome.endsWith('2')) { // canela curta e pé de três dedos gordinhos
    b.cap(0.026, CANELA_G + 0.03, P.pe, { p: [0, -CANELA_G, 0], n: 6, nc: 2 });
    for (const [x, z, g] of [[0, 0.05, 0], [0.034, 0.036, 28], [-0.034, 0.036, -28]]) b.bola(1, P.pe, { p: [x, -CANELA_G + 0.016, z], s: [0.023, 0.018, 0.04], r: [0, g, 0] });
    b.bola(1, P.pe, { p: [0, -CANELA_G + 0.017, 0], s: [0.036, 0.019, 0.036] });
  }
}
