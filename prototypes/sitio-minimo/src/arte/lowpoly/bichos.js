// Conjunto "lowpoly": a vaca, as galinhas e o sinal de leite, em peças facetadas.
// Só o DESENHO mora aqui. Os esqueletos e a animação são os de ../codigo/vaca.js e ../codigo/galinha.js: cada função
// desenha as peças de um osso, em coordenadas locais do osso.
import { P } from './kit.js';

// ---------------- vaca ----------------
const COXA = 0.4, CANELA = 0.44; // as medidas das pernas de ../codigo/vaca.js
// contorno do tronco: um octógono mais para caixa, com o lombo mais estreito que a barriga (começa em cima e desce pelo lado +X)
const OITO = [[0.17, 0.37], [0.37, 0.23], [0.41, -0.12], [0.24, -0.36], [-0.24, -0.36], [-0.41, -0.12], [-0.37, 0.23], [-0.17, 0.37]];
const anelVaca = (z, sx, sy, dy = 0) => OITO.map(([x, y]) => [x * sx, y * sy + dy, z]);
// malhas pretas: os triângulos do tronco cujo meio cai dentro de uma destas bolas [x, y, z, raio]
const MALHAS = [[-0.2, 0.3, -0.5, 0.36], [0.42, 0.02, -0.06, 0.3], [0.2, 0.3, 0.72, 0.26], [-0.42, -0.1, 0.3, 0.28]];
const naMalha = ([x, y, z]) => MALHAS.some(([mx, my, mz, r]) => Math.hypot(x - mx, y - my, z - mz) < r);
const PERNA_PRETA = new Set(['ptd1']);

export function vaca(b, nome) {
  const branco = P.vaca, som = P.vacaSombra, preto = P.vacaPreto, J = 0.03;
  if (nome === 'tronco') {
    b.casca([anelVaca(-0.8, 0.62, 0.7, 0.05), anelVaca(-0.56, 0.98, 1), anelVaca(-0.28, 1.02, 1), anelVaca(0, 1.03, 0.97, -0.01), anelVaca(0.26, 1, 0.98), anelVaca(0.5, 0.97, 1), anelVaca(0.78, 0.62, 0.74, 0.04)],
      [branco, preto], (s, i, meio) => (naMalha(meio) ? 1 : 0), { jit: J, pontas: [-0.07, 0.05] });
  } else if (nome === 'ubere') {
    b.tbox(0.24, 0.28, 0.3, 0.36, 0.17, P.focinho, { p: [0, -0.13, 0], jit: J });
    for (const x of [-0.07, 0.07]) for (const z of [-0.07, 0.07]) b.cyl(0.028, 0.02, 0.08, 4, P.focinhoEscuro, { p: [x, -0.2, z] });
  } else if (nome === 'pescoco') {
    b.cyl(0.19, 0.3, 0.54, 6, preto, { r: [46, 0, 0], jit: J });
  } else if (nome === 'cabeca') {
    b.group({ r: [16, 0, 0] }, () => {
      b.tbox(0.37, 0.31, 0.32, 0.27, 0.33, branco, { p: [0, -0.16, -0.03], jit: J });
      b.tbox(0.385, 0.2, 0.33, 0.17, 0.14, preto, { p: [0, 0.04, -0.1], jit: J }); // a malha do alto da cabeça
      b.tbox(0.32, 0.28, 0.26, 0.21, 0.25, branco, { p: [0, -0.01, 0.1], r: [90, 0, 0], jit: J });
      b.tbox(0.28, 0.23, 0.25, 0.2, 0.13, P.focinho, { p: [0, -0.01, 0.34], r: [90, 0, 0], jit: J }); // focinho rosa
      for (const sx of [-1, 1]) {
        b.box(0.04, 0.035, 0.02, P.focinhoEscuro, { p: [sx * 0.06, 0.0, 0.462] }); // narinas
        b.box(0.03, 0.06, 0.06, P.olho, { p: [sx * 0.176, 0.0, 0.07], jit: 0 });
        b.cone(0.046, 0.16, 4, P.chifre, { p: [sx * 0.13, 0.15, -0.1], r: [-18, 0, sx * -38] });
      }
    });
  } else if (nome === 'mandibula') {
    b.group({ r: [16, 0, 0] }, () => {
      b.box(0.2, 0.065, 0.3, som, { p: [0, -0.06, 0.15], jit: J });
      b.box(0.22, 0.055, 0.09, P.focinhoEscuro, { p: [0, -0.058, 0.3], jit: J });
    });
  } else if (nome === 'orelhaE' || nome === 'orelhaD') {
    const sx = nome === 'orelhaE' ? 1 : -1; // uma lasca que sai para o lado, mais fina na ponta
    b.tbox(0.05, 0.14, 0.02, 0.04, 0.23, P.focinho, { r: [0, 0, sx * -96], jit: J });
  } else if (nome === 'rabo1' || nome === 'rabo2') {
    b.cyl(nome === 'rabo1' ? 0.03 : 0.025, nome === 'rabo1' ? 0.037 : 0.03, 0.305, 4, som, { r: [190, 0, 0] });
  } else if (nome === 'rabo3') {
    b.ico(0.07, 0, preto, { p: [0, -0.1, -0.015], s: [0.9, 1.9, 0.9] });
  } else if (nome.startsWith('p') && nome.endsWith('1')) { // coxa: tronco de pirâmide, mais largo no quadril
    const cor = PERNA_PRETA.has(nome) ? preto : som;
    b.tbox(0.17, 0.2, 0.22, 0.27, COXA + 0.1, cor, { p: [0, -COXA, 0], grad: PERNA_PRETA.has(nome) ? preto : branco, jit: J });
  } else if (nome.startsWith('p') && nome.endsWith('2')) { // canela e casco
    b.tbox(0.15, 0.17, 0.17, 0.2, CANELA - 0.09, som, { p: [0, -CANELA + 0.1, 0], jit: J });
    b.tbox(0.2, 0.22, 0.16, 0.18, 0.11, P.casco, { p: [0, -CANELA, 0] });
  }
}

// sinal de "leite pronto": uma garrafa de seis lados com tampa azul
export function sinalDeLeite(b) {
  b.lathe([[0.001, 0], [0.11, 0], [0.12, 0.2], [0.06, 0.3], [0.055, 0.35], [0.001, 0.35]], 6, P.leite, { jit: 0.02 });
  b.cyl(0.068, 0.068, 0.055, 6, P.tampa, { p: [0, 0.35, 0] });
  b.cyl(0.124, 0.124, 0.08, 6, P.aguaClara, { p: [0, 0.07, 0], open: true });
}

// ---------------- galinha ----------------
const COXA_G = 0.085, CANELA_G = 0.1; // as medidas das pernas de ../codigo/galinha.js
// contorno do corpo: seis lados (começa em cima e desce pelo lado +X)
const SEIS = [[0.5, 1], [1, 0.1], [0.6, -1], [-0.6, -1], [-1, 0.1], [-0.5, 1]];
const anelGalinha = (z, w, h, dy = 0) => SEIS.map(([x, y]) => [x * w, y * h + dy, z]);
const PENAS = {
  branca: { cor: P.galinhaBranca, escura: '#e9dfca', asa: '#e4d9c2', ponta: '#cfc3aa' },
  caramelo: { cor: P.galinhaCaramelo, escura: P.galinhaCarameloEscuro, asa: P.galinhaCarameloEscuro, ponta: '#b8691f' },
};

export function galinha(b, nome, _padrao, ctx) {
  const { cor, escura, asa, ponta } = PENAS[ctx && ctx.def && ctx.def.variante] || PENAS.branca;
  if (nome === 'corpo') {
    // peito gordo na frente e o lombo que sobe para a cauda
    b.casca([anelGalinha(-0.27, 0.04, 0.05, 0.13), anelGalinha(-0.16, 0.12, 0.12, 0.045), anelGalinha(-0.02, 0.175, 0.17), anelGalinha(0.12, 0.15, 0.155), anelGalinha(0.23, 0.07, 0.09, 0.02)],
      [cor, escura], (s, i) => (i === 2 || (s < 1 && i !== 5) ? 1 : 0), { jit: 0.035, pontas: [-0.03, 0.03] });
  } else if (nome === 'asaE' || nome === 'asaD') { // a asa pende da junta; a ponta é mais escura, para o bater de asas aparecer
    const sx = nome === 'asaE' ? 1 : -1;
    b.tbox(0.05, 0.24, 0.03, 0.1, 0.17, asa, { p: [sx * 0.012, 0.01, -0.05], r: [180, 0, 0] });
    b.tbox(0.035, 0.1, 0.02, 0.03, 0.11, ponta, { p: [sx * 0.012, -0.12, -0.12], r: [-140, 0, 0] });
  } else if (nome === 'cauda') { // três penas em leque, apontadas para cima e para trás
    for (const k of [-1, 0, 1]) b.cone(0.075, 0.28 - Math.abs(k) * 0.05, 4, k ? escura : cor, { p: [k * 0.04, 0, 0], r: [-38, 0, -k * 24], s: [1, 1, 0.4] });
  } else if (nome === 'pescoco') {
    b.cyl(0.062, 0.098, 0.24, 5, cor, { p: [0, -0.02, 0], r: [-6, 0, 0], jit: 0.035 });
  } else if (nome === 'cabeca') {
    b.lathe([[0.001, -0.05], [0.07, -0.05], [0.096, 0.03], [0.07, 0.115], [0.001, 0.125]], 6, cor, { p: [0, 0, 0.01], r: [0, 30, 0], jit: 0.035 });
    b.cone(0.04, 0.1, 4, P.bico, { p: [0, 0.03, 0.08], r: [90, 0, 0] });
    b.tbox(0.03, 0.05, 0.02, 0.02, 0.07, P.crista, { p: [0, 0.115, 0.042] });
    b.tbox(0.03, 0.055, 0.02, 0.02, 0.095, P.crista, { p: [0, 0.115, -0.008] });
    b.tbox(0.03, 0.045, 0.02, 0.02, 0.06, P.crista, { p: [0, 0.11, -0.055] });
    b.tbox(0.036, 0.036, 0.016, 0.016, 0.065, P.crista, { p: [0, -0.0, 0.088], r: [180, 0, 0] }); // barbela
    for (const sx of [-1, 1]) b.box(0.028, 0.03, 0.014, P.olho, { p: [sx * 0.071, 0.035, 0.05], r: [0, sx * 60, 0], jit: 0 });
  } else if (nome.endsWith('1')) {
    b.cyl(0.022, 0.022, COXA_G + 0.01, 4, P.pe, { p: [0, -COXA_G, 0] });
  } else if (nome.endsWith('2')) {
    b.cyl(0.018, 0.018, CANELA_G, 4, P.pe, { p: [0, -CANELA_G, 0] });
    b.tbox(0.095, 0.13, 0.03, 0.03, 0.03, P.pe, { p: [0, -CANELA_G, 0.035] });
  }
}
