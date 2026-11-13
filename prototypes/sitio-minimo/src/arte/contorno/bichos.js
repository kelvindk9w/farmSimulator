// Conjunto "contorno": a roupa da vaca e da galinha, osso por osso, em cima dos esqueletos do conjunto "codigo"
// (src/arte/codigo/vaca.js e galinha.js; as medidas dos ossos estão lá). As formas partem das do conjunto "brinquedo":
// corpo em cápsula, cabeça redonda, focinho rosa grande e manchas chapadas na vaca; galinha quase esférica com asas e
// rabo em gomos. Olhos grandes com brilho. As manchas, os olhos e os brilhos são chapas sem traço em volta.
import * as THREE from 'three';
import { shade } from '../codigo/base.js';
import { P, decalque, ovalDe } from './kit.js';

const GR = Math.PI / 180;

// ---------------- vaca ----------------
const COXA = 0.4, CANELA = 0.44;
// o corpo é uma cápsula deitada ao longo de z; esta função dá o ponto da superfície (ângulo em volta, z) para as manchas
const CORPO = { R: 0.45, meio: 0.84, sx: 1.04, y: -0.03 };
function peleDoCorpo(t, z, e = 0) {
  const { R, meio, sx, y } = CORPO, a = meio - R, c = Math.max(-a, Math.min(a, z)), d = Math.max(-R, Math.min(R, z - c));
  const ro = Math.sqrt(Math.max(0, R * R - d * d)), k = (R + e) / R;
  return [Math.cos(t) * ro * k * sx, y + Math.sin(t) * ro * k, c + d * k];
}
// a cabeça é um ovo, desenhada bem maior em volta do osso (cabeça grande, como no desenho animado)
const CRANIO = { c: [0, 0, 0.02], r: [0.2, 0.21, 0.19] }, CABECA = 1.5;
// ponto da pele da cabeça: u = ângulo em volta (0 = frente, para +x), v = altura (0 = meio, para cima), em radianos
function peleDaCabeca(u, v, e = 0) {
  const { c, r } = CRANIO, k = 1 + e / 0.2;
  return [c[0] + Math.sin(u) * Math.cos(v) * r[0] * k, c[1] + Math.sin(v) * r[1] * k, c[2] + Math.cos(u) * Math.cos(v) * r[2] * k];
}

export function vaca(b, nome) {
  const creme = P.vacaCreme, escuro = P.vacaEscuro, rosa = P.focinho;
  if (nome === 'tronco') {
    const { R, meio, sx, y } = CORPO;
    b.add(new THREE.CapsuleGeometry(R, (meio - R) * 2, 4, 16).translate(0, meio, 0), creme, { p: [0, y, -meio], r: [90, 0, 0], s: [sx, 1, 1] });
    // manchas chapadas: uma sela grande atrás e uma oval em cada lado, na frente
    decalque(b, peleDoCorpo, ovalDe(95 * GR, -0.33, 1.32, 0.33, 26, 0.1, 3), escuro, { aneis: 4 });
    decalque(b, peleDoCorpo, ovalDe(14 * GR, 0.34, 0.5, 0.2, 18, 0.08, 2), escuro, { aneis: 2 });
    decalque(b, peleDoCorpo, ovalDe(168 * GR, 0.28, 0.56, 0.22, 18, 0.08, 2), escuro, { aneis: 2 });
  } else if (nome === 'ubere') {
    b.sph(0.17, 0, 0, rosa, { p: [0, -0.12, 0], s: [1, 0.74, 1.12] });
    for (const x of [-0.065, 0.065]) for (const z of [-0.07, 0.07]) b.cap(0.03, 0.1, P.focinhoEscuro, { p: [x, -0.3, z], n: 6, nc: 1 });
  } else if (nome === 'pescoco') {
    // uma bola na junta (fica dentro do corpo em qualquer giro) e o pescoço grosso saindo dela
    b.sph(0.19, 0, 0, creme, { n: 14 });
    b.cyl(0.165, 0.2, 0.44, 0, creme, { r: [41, 0, 0], q: 0.08, n: 14 });
  } else if (nome === 'cabeca') {
    b.group({ r: [8, 0, 0], s: CABECA }, () => {
      const { c, r } = CRANIO;
      b.sph(1, 0, 0, creme, { p: c, s: r, n: 20 });
      // malha escura no alto da cabeça, entre os chifres, caindo para trás de um lado
      decalque(b, peleDaCabeca, ovalDe(2.3, 0.75, 0.9, 0.42, 14, 0.08, 3), escuro, { aneis: 2, alt: 0.004 });
      // focinho rosa grande, com as duas narinas
      b.sph(1, 0, 0, rosa, { p: [0, -0.125, 0.165], s: [0.19, 0.122, 0.15], n: 18 });
      for (const sx of [-1, 1]) {
        b.bola(0.024, P.focinhoEscuro, { p: [sx * 0.07, -0.105, 0.303], s: [0.9, 1.25, 0.5], semTraco: true });
        b.bola(0.042, P.olho, { p: [sx * 0.118, 0.04, 0.152], s: [0.8, 1.3, 0.55], r: [0, sx * 32, 0], seg: 8, aneis: 5, semTraco: true });
        b.bola(0.014, P.branco, { p: [sx * 0.128 + 0.008, 0.062, 0.168], s: [1, 1, 0.5], semTraco: true });
        b.cone(0.042, 0.13, 0, P.chifre, { p: [sx * 0.105, 0.165, 0], r: [0, 0, sx * -30], n: 9 });
      }
    });
  } else if (nome === 'mandibula') {
    b.group({ r: [8, 0, 0], s: CABECA }, () => b.sph(1, 0, 0, P.focinhoEscuro, { p: [0, -0.11, 0.1], s: [0.15, 0.058, 0.115], n: 10 }));
  } else if (nome === 'orelhaE' || nome === 'orelhaD') {
    const sx = nome === 'orelhaE' ? 1 : -1;
    b.group({ p: [sx * 0.07, 0.035, 0.04], r: [0, 0, sx * -14], s: CABECA }, () => {
      b.sph(1, 0, 0, escuro, { p: [sx * 0.19, -0.01, 0.02], s: [0.15, 0.085, 0.05], n: 12 });
      b.bola(1, rosa, { p: [sx * 0.195, -0.014, 0.05], s: [0.1, 0.05, 0.022], seg: 8, aneis: 4, semTraco: true });
    });
  } else if (nome === 'rabo1' || nome === 'rabo2') {
    b.cap(nome === 'rabo1' ? 0.045 : 0.04, 0.36, creme, { p: [0, 0.03, 0.005], r: [190, 0, 0], n: 7, nc: 1 });
  } else if (nome === 'rabo3') {
    b.sph(1, 0, 0, escuro, { p: [0, -0.1, -0.018], s: [0.085, 0.14, 0.085], n: 8 });
  } else if (nome.endsWith('1') && nome.startsWith('p')) {
    b.cap(0.15, COXA + 0.3, creme, { p: [0, -COXA - 0.12, 0], n: 12, nc: 2 });
  } else if (nome.endsWith('2') && nome.startsWith('p')) {
    b.cap(0.142, CANELA + 0.02, creme, { p: [0, -CANELA + 0.1, 0], n: 12, nc: 2 });
    b.cyl(0.152, 0.164, 0.17, 0, P.casco, { p: [0, -CANELA, 0], q: 0.045, n: 12 });
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
    b.sph(1, 0, 0, rabo, { p: [0, 0.1, -0.085], s: [0.066, 0.125, 0.075], r: [-30, 0, 0], n: 8 });
    for (const sx of [-1, 1]) b.sph(1, 0, 0, rabo, { p: [sx * 0.075, 0.06, -0.065], s: [0.056, 0.1, 0.066], r: [-30, 0, sx * -26], n: 8 });
  } else if (nome === 'pescoco') { // pera: larga embaixo (o papo), fina em cima, para o corpo virar cabeça sem degrau
    b.lathe([[0, -0.13], [0.14, -0.125], [0.18, -0.07], [0.178, -0.02], [0.161, 0.03], [0.137, 0.082], [0.114, 0.132], [0.098, 0.16], [0, 0.18]], 0, cor, { p: [0, 0, -0.012], n: 16 });
  } else if (nome === 'cabeca') {
    b.sph(0.126, 0, 0, cor, { p: [0, -0.015, 0], n: 18 });
    b.cone(0.047, 0.095, 0, P.bico, { p: [0, -0.03, 0.1], r: [90, 0, 0], n: 8 });
    // crista de três bolinhas e a barbela embaixo do bico
    b.bola(0.046, P.crista, { p: [0, 0.108, 0.06], seg: 7, aneis: 4 });
    b.bola(0.054, P.crista, { p: [0, 0.132, 0.0], seg: 7, aneis: 4 });
    b.bola(0.042, P.crista, { p: [0, 0.104, -0.06], seg: 7, aneis: 4 });
    for (const sx of [-1, 1]) {
      b.bola(1, P.crista, { p: [sx * 0.022, -0.095, 0.098], s: [0.026, 0.042, 0.026] });
      b.bola(0.027, P.olho, { p: [sx * 0.07, 0.002, 0.097], s: [1, 1.2, 0.6], seg: 8, aneis: 5, semTraco: true });
      b.bola(0.01, P.branco, { p: [sx * 0.074, 0.014, 0.112], s: [1, 1, 0.5], semTraco: true });
    }
  } else if (nome.endsWith('1')) b.cap(0.028, COXA_G + 0.05, P.pe, { p: [0, -COXA_G - 0.02, 0], n: 6, nc: 2 });
  else if (nome.endsWith('2')) { // canela curta e pé de três dedos gordinhos
    b.cap(0.026, CANELA_G + 0.03, P.pe, { p: [0, -CANELA_G, 0], n: 6, nc: 2 });
    for (const [x, z, g] of [[0, 0.05, 0], [0.034, 0.036, 28], [-0.034, 0.036, -28]]) b.bola(1, P.pe, { p: [x, -CANELA_G + 0.016, z], s: [0.023, 0.018, 0.04], r: [0, g, 0] });
    b.bola(1, P.pe, { p: [0, -CANELA_G + 0.017, 0], s: [0.036, 0.019, 0.036] });
  }
}
