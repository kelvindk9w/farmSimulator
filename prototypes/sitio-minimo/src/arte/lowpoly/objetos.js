// Conjunto "lowpoly": o desenho das construções, das plantas e dos objetos de mão, em peças facetadas.
// Só o DESENHO mora aqui. Os esqueletos (nomes e posições dos ossos) e toda a animação são os de ../codigo/objetos.js:
// cada função abaixo desenha as peças de um osso, em coordenadas locais do osso.
import { TIPOS } from '../../jogo/contrato.js';
import { acaso } from '../codigo/base.js';
import { P } from './kit.js';

const GRAUS = 180 / Math.PI;

// Telhado de duas águas em fiadas de telhas chatas: cada telha é uma placa com espessura, deitada um pouco menos
// inclinada que a água do telhado, de modo que a ponta de baixo fica por cima da telha da fiada seguinte e faz degrau.
// A cumeeira corre ao longo de Z, na altura yCume.
function telhado(b, { yCume, corre, sobe, beiral, fundo, fiadas, colunas, esp = 0.075, deita = 7, vao = 0.035, tom = 0 }) {
  const k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2);
  const lf = comp / fiadas, lw = fundo / colunas, tons = [P.telha, P.telhaClara, P.telhaEscura, P.telha, P.telhaClara];
  for (const s of [-1, 1]) {
    b.group({ p: [0, yCume, 0], r: [0, 0, -s * ang] }, () => {
      b.box(comp - 0.06, 0.07, fundo - 0.12, P.beiral, { p: [(s * (comp - 0.06)) / 2, -0.1, 0] }); // tabuado por baixo
      for (let j = 0; j < fiadas; j++) for (let i = 0; i < colunas; i++) {
        b.box(lf + 0.09, esp, lw - vao, tons[(i * 2 + j * 3 + (s > 0 ? 0 : 2) + tom) % tons.length], { p: [s * (j + 0.5) * lf, -0.01, -fundo / 2 + (i + 0.5) * lw], r: [0, 0, s * deita], jit: 0.03 });
      }
      b.box(0.3, 0.07, fundo + 0.1, P.cumeeira, { p: [s * 0.12, 0.05, 0] }); // meia cumeeira
    });
  }
}

// ---------------- celeiro ----------------
export function celeiro(b, nome) {
  const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, Pt = TIPOS.celeiro.porta, hw = Pt.largura / 2, fz = D / 2;
  const sobe = 1.45, corre = W / 2, tons = [P.parede, P.paredeClara, P.paredeEscura, P.paredeClara];
  if (nome === 'raiz') {
    let k = 0;
    // tábuas largas em pé, de tons alternados, uma mais saída que a outra
    const tabua = (x, z, giro, larg, alt, y) => { b.box(larg, alt, 0.12 + (k % 2) * 0.025, tons[k % tons.length], { p: [x, y, z], r: [0, giro, 0], jit: 0.03 }); k++; };
    // parede da direita e parede da frente (com o vão da porta); o fundo e a esquerda, que a câmera nunca vê, são uma placa cada
    for (let i = 0; i < 6; i++) tabua(W / 2 - 0.06, -fz + 0.25 + i * 0.5, 90, 0.5, H, 0);
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) tabua(s * (hw + 0.2375 + i * 0.475), fz - 0.06, 0, 0.475, H, 0);
    for (let i = 0; i < 4; i++) tabua(-hw + 0.2125 + i * 0.425, fz - 0.06, 0, 0.425, H - Pt.altura, Pt.altura);
    b.box(W, H, 0.12, P.paredeEscura, { p: [0, 0, -fz + 0.06] });
    b.box(0.12, H, D - 0.2, P.paredeEscura, { p: [-W / 2 + 0.06, 0, 0] });
    // empena da frente: as tábuas continuam até o telhado; a do fundo é uma placa
    const alt = (x) => sobe * (1 - Math.abs(x) / corre);
    for (let i = 0; i < 8; i++) {
      const xa = -corre + i * 0.45, xb = xa + 0.45, pts = [[xa, 0], [xb, 0]];
      if (alt(xb) > 0.001) pts.push([xb, alt(xb)]);
      if (alt(xa) > 0.001) pts.push([xa, alt(xa)]);
      b.ext(pts, 0.12 + (i % 2) * 0.025, tons[(i + 1) % tons.length], { p: [0, H, fz - 0.06], jit: 0.03 });
    }
    b.ext([[-corre, 0], [corre, 0], [0, sobe]], 0.12, P.paredeEscura, { p: [0, H, -fz + 0.06] });
    // janelinha do paiol
    b.box(0.5, 0.44, 0.06, P.vidro, { p: [0, H + 0.22, fz + 0.005], jit: 0 });
    for (const [x, y, lw, lh] of [[0, 0.14, 0.7, 0.08], [0, 0.66, 0.7, 0.08], [-0.31, 0.2, 0.08, 0.48], [0.31, 0.2, 0.08, 0.48]]) b.box(lw, lh, 0.1, P.vigas, { p: [x, H + y, fz + 0.01] });
    // por dentro é escuro: chão, forro e paredes; e dois fardos de feno lá no fundo
    b.box(W - 0.26, 0.012, D - 0.2, P.interior, { p: [0, 0.004, 0], jit: 0 });
    b.box(W - 0.24, 0.04, D - 0.24, P.interior, { p: [0, H - 0.02, 0], jit: 0 });
    b.box(W - 0.26, H, 0.03, P.interior, { p: [0, 0, -fz + 0.135], jit: 0 });
    for (const s of [-1, 1]) b.box(0.03, H, D - 0.26, P.interior, { p: [s * (W / 2 - 0.135), 0, 0], jit: 0 });
    for (const s of [-1, 1]) b.box(W / 2 - hw - 0.13, H, 0.03, P.interior, { p: [s * (hw + (W / 2 - hw - 0.13) / 2), 0, fz - 0.135], jit: 0 });
    b.box(0.8, 0.45, 0.5, P.palha, { p: [-1.0, 0, -0.9] });
    b.box(0.75, 0.42, 0.5, P.palhaEscura, { p: [0.9, 0, -0.95], r: [0, -6, 0] });
    // batentes e verga da porta
    for (const s of [-1, 1]) b.box(0.14, Pt.altura + 0.05, 0.16, P.vigas, { p: [s * (hw + 0.07), 0, fz - 0.02] });
    b.box(Pt.largura + 0.5, 0.17, 0.2, P.friso, { p: [0, Pt.altura, fz] });
    // baldrame de pedra clara (menos no vão da porta)
    b.box(W + 0.16, 0.22, 0.12, P.base, { p: [0, 0, -fz - 0.02] });
    for (const s of [-1, 1]) { b.box(0.12, 0.22, D + 0.16, P.base, { p: [s * (W / 2 + 0.02), 0, 0] }); b.box(W / 2 - hw - 0.1, 0.22, 0.12, P.base, { p: [s * (hw + 0.14 + (W / 2 - hw - 0.1) / 2), 0, fz + 0.02] }); }
    // tábuas de beiral na empena da frente e o telhado de telhas chatas
    const beiral = 0.34, k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2), fundo = D + 0.7, yCume = H + sobe + 0.1;
    for (const s of [-1, 1]) b.group({ p: [0, yCume, fundo / 2 - 0.09], r: [0, 0, -s * ang] }, () => b.box(comp - 0.02, 0.16, 0.08, P.friso, { p: [(s * (comp - 0.02)) / 2, -0.27, 0] }));
    telhado(b, { yCume, corre, sobe, beiral, fundo, fiadas: 4, colunas: 6 });
  } else {
    // folha da porta: almofada verde, moldura creme e travessas em X, igual dos dois lados
    const s = nome === 'folhaE' ? 1 : -1, lw = hw - 0.01, alt = Pt.altura - 0.04, cx = (s * lw) / 2;
    b.box(lw, alt, 0.07, P.portaVerde, { p: [cx, 0.02, 0], jit: 0.03 });
    for (const zz of [0.045, -0.045]) {
      b.box(lw, 0.13, 0.03, P.creme, { p: [cx, 0.03, zz], jit: 0.02 });
      b.box(lw, 0.13, 0.03, P.creme, { p: [cx, alt - 0.12, zz], jit: 0.02 });
      for (const e of [-1, 1]) b.box(0.12, alt, 0.03, P.creme, { p: [cx + e * (lw / 2 - 0.06), 0.02, zz], jit: 0.02 });
      const diag = Math.hypot(lw - 0.2, alt - 0.3), a = Math.atan2(lw - 0.2, alt - 0.3) * GRAUS;
      for (const e of [-1, 1]) b.group({ p: [cx, alt / 2 + 0.02, zz], r: [0, 0, e * a] }, () => b.box(0.1, diag, 0.026, P.creme, { p: [0, -diag / 2, 0], jit: 0.02 }));
    }
    b.box(0.05, 0.28, 0.13, P.metalEscuro, { p: [s * (lw - 0.13), 1.05, 0] });
  }
}

// ---------------- poço ----------------
const RAIO_MANIVELA = 0.26;
// bloco de pedra de faces chatas, um pouco menor que o seu lugar no anel (a fresta deixa ver o anel escuro de trás)
function pedra(b, r0, r1, y0, y1, a0, a1, cor) {
  const pt = (r, y, a) => [r * Math.sin(a), y, r * Math.cos(a)];
  const pts = [pt(r1, y0, a0), pt(r1, y0, a1), pt(r1, y1, a1), pt(r1, y1, a0), pt(r0, y1, a0), pt(r0, y1, a1), pt(r0, y0, a0), pt(r0, y0, a1)];
  b.tris(pts, [[0, 1, 2], [0, 2, 3], [3, 2, 5], [3, 5, 4], [4, 5, 7], [4, 7, 6], [1, 7, 5], [1, 5, 2], [6, 0, 3], [6, 3, 4]], cor, { jit: 0.012 });
}
export function poco(b, nome) {
  if (nome === 'raiz') {
    // anel de pedra de dez lados, em duas fiadas desencontradas de blocos de tons diferentes, com a água lá dentro
    const N = 10, passo = (Math.PI * 2) / N, tons = [P.pedra, P.pedraClara, P.pedraEscura, P.pedra, P.pedraClara, P.pedraEscura, P.pedraClara];
    b.cyl(0.83, 0.83, 0.79, N, P.pedraSombra, { r: [0, (0.2 + passo / 2) * GRAUS, 0], open: true, jit: 0 });
    b.cyl(0.61, 0.61, 0.79, N, P.pedraSombra, { r: [0, (0.2 + passo / 2) * GRAUS, 0], s: [-1, 1, 1], open: true, jit: 0 });
    for (let f = 0; f < 2; f++) for (let i = 0; i < N; i++) {
      const a0 = (i + f * 0.5) * passo + 0.2;
      pedra(b, 0.58, 0.87, f * 0.41, f * 0.41 + 0.39, a0 + 0.022, a0 + passo - 0.022, tons[(i * 3 + f * 2) % tons.length]);
    }
    b.cyl(0.6, 0.6, 0.02, 10, P.aguaFunda, { p: [0, 0.42, 0], jit: 0.04 });
    b.cyl(0.3, 0.3, 0.006, 6, P.agua, { p: [0.1, 0.441, -0.08], jit: 0.02 });
    // esteios, travessa, empenas e telhadinho (alto, para não esconder o balde)
    for (const s of [-1, 1]) b.box(0.17, 2.3, 0.17, P.madeiraEscura, { p: [0, 0, s * 0.74], grad: P.madeira });
    b.box(0.12, 0.12, 1.7, P.madeiraEscura, { p: [0, 2.2, 0] });
    for (const s of [-1, 1]) b.ext([[-0.62, 0], [0.62, 0], [0, 0.4]], 0.07, P.madeira, { p: [0, 2.26, s * 0.86] });
    telhado(b, { yCume: 2.76, corre: 0.6, sobe: 0.39, beiral: 0.2, fundo: 2.1, fiadas: 2, colunas: 3, esp: 0.065, tom: 1 });
  } else if (nome === 'eixo') {
    b.cyl(0.045, 0.045, 1.85, 6, P.madeiraEscura, { p: [0, 0, -0.82], r: [90, 0, 0] });
    b.cyl(0.105, 0.105, 0.9, 8, P.madeira, { p: [0, 0, -0.45], r: [90, 0, 0] });
    for (let i = 0; i < 4; i++) b.cyl(0.125, 0.125, 0.075, 7, i % 2 ? P.corda : P.cordaEscura, { p: [0, 0, -0.17 + i * 0.08], r: [90, 0, i * 20] });
    // manivela: braço de ferro e pegador de madeira
    b.box(0.07, RAIO_MANIVELA + 0.08, 0.055, P.metal, { p: [0, -0.04, 1.02] });
    b.cyl(0.042, 0.042, 0.32, 6, P.tronco, { p: [0, RAIO_MANIVELA, 1.03], r: [90, 0, 0] });
  } else if (nome === 'corda') {
    b.cyl(0.016, 0.016, 1, 4, P.corda, { p: [0, -1, 0], jit: 0 }); // de 0 a -1: a escala em Y dá o comprimento
  } else if (nome === 'balde') {
    // origem na boca do balde; a alça sobe até onde a corda amarra
    b.cyl(0.2, 0.15, 0.27, 8, P.metal, { p: [0, -0.27, 0], grad: P.metalClaro, open: true });
    b.cyl(0.19, 0.145, 0.27, 8, P.metalEscuro, { p: [0, -0.27, 0], s: [-1, 1, 1], open: true });
    b.cyl(0.15, 0.15, 0.01, 8, P.metalEscuro, { p: [0, -0.27, 0] });
    b.cyl(0.165, 0.165, 0.012, 8, P.agua, { p: [0, -0.13, 0] });
    b.cyl(0.208, 0.2, 0.04, 8, P.metalEscuro, { p: [0, -0.045, 0], open: true });
    b.tube([[0, 0, -0.19], [0, 0.14, -0.1], [0, 0.17, 0], [0, 0.14, 0.1], [0, 0, 0.19]], 0.014, 4, P.metalEscuro, { steps: 4 });
  }
}

// ---------------- ninho ----------------
export function ninho(b, nome) {
  const R = TIPOS.ninho.raio;
  if (nome === 'raiz') {
    // rosca de palha de oito gomos, com o fundo forrado, e gravetos atravessados por cima
    b.lathe([[R - 0.12, 0], [R + 0.06, 0], [R + 0.1, 0.1], [R + 0.03, 0.2], [R - 0.1, 0.2], [R - 0.2, 0.1], [0.001, 0.06]], 8, P.palhaEscura, { jit: 0.1, grad: P.palha });
    for (let i = 0; i < 10; i++) {
      const a = i * 0.63 + acaso(i) * 0.2, r = R - 0.03 + (i % 2) * 0.06;
      b.box(0.045, 0.04, 0.32 + acaso(i + 5) * 0.1, i % 2 ? P.palhaClara : P.palha, { p: [Math.cos(a) * r, 0.17 + (i % 2) * 0.03, Math.sin(a) * r], r: [(i % 2 ? 1 : -1) * 8, -a * GRAUS + (i % 2 ? 22 : -22), 0], jit: 0.06 });
    }
  } else b.sph(0.105, 7, 5, P.ovo, { p: [0, 0.1, 0], s: [1, 1.28, 1], r: [0, 0, 18], jit: 0.015 });
}

// ---------------- laranjeira ----------------
const PENCAS = [[-0.57, -0.19, 0.86, 0.1], [-0.39, -0.16, 0.82, 0.13], [-0.5, -0.13, 1.0, 0.12]]; // as mesmas de ../codigo/objetos.js
const RAIO_LARANJA = 0.175, MIOLO = 0.117; // o miolo fica onde o conjunto "codigo" o põe (é o ponto de mão)
export function arvore(b, nome) {
  if (nome === 'raiz') {
    // tronco de sete lados, grosso, com o pé alargado em raízes
    b.lathe([[0.4, 0], [0.27, 0.3], [0.22, 0.9], [0.2, 1.5], [0.25, 2.05], [0.001, 2.05]], 7, P.troncoEscuro, { grad: P.troncoClaro, jit: 0.07 });
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.5; b.tbox(0.2, 0.42, 0.1, 0.12, 0.34, P.tronco, { p: [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3], r: [0, a * GRAUS, 0], jit: 0.07 }); }
    b.cyl(0.08, 0.13, 0.85, 5, P.tronco, { p: [0.05, 1.5, 0], r: [0, 0, -34] });
    b.cyl(0.08, 0.13, 0.85, 5, P.tronco, { p: [-0.05, 1.45, -0.05], r: [-22, 0, 30] });
    b.cyl(0.07, 0.11, 1.05, 5, P.tronco, { p: [0, 1.62, 0.05], r: [52, -4, 0] });
  } else if (nome === 'copa') {
    // copa em poucas massas grandes de faces bem visíveis: escura embaixo, clara em cima
    for (const [x, y, z, r, d] of [[0.05, 1.5, -0.1, 1.42, 1], [0.95, 0.95, 0.35, 0.92, 1], [-0.9, 1.0, -0.35, 0.9, 1], [0.15, 0.95, -0.95, 0.85, 1]]) {
      b.blob(r, d, P.copaEscura, { p: [x, y, z], s: [1, 0.9, 1], grad: P.copaClara, jit: 0.06, rough: 0.1 });
    }
  } else if (nome === 'galho') {
    b.blob(0.55, 1, P.copaEscura, { p: [-0.44, 0.46, 0.64], s: [1, 0.86, 1], grad: P.copaClara, jit: 0.06, rough: 0.12 });
  } else {
    const c = PENCAS[+nome[5]][3];
    b.cyl(0.014, 0.014, c + 0.2, 4, P.troncoEscuro, { p: [0, -c, 0] });
    b.ico(RAIO_LARANJA, 1, P.laranjaEscura, { p: [0, -c - MIOLO, 0], grad: P.laranjaClara, jit: 0.05 });
    b.leaf(0.22, 0.12, 40, P.copaClara, { p: [0, -c + 0.05, 0], r: [70, 40, 0], steps: 2 });
  }
}

// ---------------- canteiro e milho ----------------
// placa de terra de borda chanfrada; o alto fica em 0,2, logo abaixo dos ossos das plantas (0,22)
export function canteiroTerra(b) {
  const [w, d] = TIPOS.canteiro.tamanho;
  b.tbox(w, d, w - 0.16, d - 0.16, 0.2, P.soloEscuro, { grad: P.solo, jit: 0.05 });
  // o alto em seis triângulos de tons vizinhos e três sulcos rasos
  b.tris([[-0.82, 0.201, -0.82], [0, 0.201, -0.82], [0.82, 0.201, -0.82], [-0.82, 0.201, 0.82], [0, 0.201, 0.82], [0.82, 0.201, 0.82], [-0.3, 0.201, 0], [0.4, 0.201, 0.1]],
    [[0, 3, 6], [0, 6, 1], [1, 6, 7], [1, 7, 2], [2, 7, 5], [3, 4, 6], [4, 7, 6], [4, 5, 7]], P.solo, { jit: 0.06 });
  for (const z of [-0.55, 0, 0.55]) b.box(w - 0.4, 0.012, 0.07, P.soloEscuro, { p: [0, 0.196, z], jit: 0.03 });
}
// espiga grande e bem amarela, com a palha aberta embaixo
function espigaNoPe(b, o) {
  b.group(o, () => {
    b.cyl(0.115, 0.125, 0.36, 6, P.milhoEspigaEscura, { p: [0, 0.07, 0], grad: P.milhoEspiga, jit: 0.07 });
    b.cone(0.115, 0.17, 6, P.milhoEspiga, { p: [0, 0.43, 0], jit: 0.07 });
    for (let k = 0; k < 3; k++) b.leaf(0.3, 0.2, 30, P.milhoPalha, { r: [18, k * 120 + 20, 0], steps: 2, fold: 0.35 });
  });
}
export function canteiroPlantas(b, nome) {
  if (nome === 'raiz') return;
  const s = +nome[1], i = +nome[3];
  b.group({ r: [0, i * 67 + s * 30, 0] }, () => {
    if (s === 0) { // montinho de terra em pirâmide cortada, com três sementes em cima
      b.tbox(0.4, 0.4, 0.13, 0.13, 0.15, P.soloClaro, { p: [0, -0.02, 0], r: [0, 45, 0], jit: 0.08 });
      for (let k = 0; k < 3; k++) b.ico(0.036, 0, P.semente, { p: [Math.cos(k * 2.1) * 0.04, 0.145, Math.sin(k * 2.1) * 0.04], jit: 0.05 });
    } else if (s === 1) { // broto: três folhas largas
      for (let k = 0; k < 3; k++) b.leaf(0.4, 0.17, 60, k % 2 ? P.milhoFolha : P.milhoFolhaClara, { r: [24, k * 120, 0], steps: 2, grad: P.milhoCaule });
    } else { // pé crescendo (0,9 de altura) e pé pronto (1,8, com as espigas e o pendão)
      const h = s === 2 ? 0.9 : 1.8, nf = s === 2 ? 4 : 6;
      b.cyl(s === 2 ? 0.04 : 0.055, s === 2 ? 0.065 : 0.085, h, 5, P.milhoFolha, { grad: P.milhoCaule });
      for (let k = 0; k < nf; k++) b.leaf(s === 2 ? 0.58 : 0.8, s === 2 ? 0.2 : 0.23, 100, k % 2 ? P.milhoFolha : P.milhoFolhaClara, { p: [0, h * (0.18 + (k / nf) * 0.64), 0], r: [38, k * 137, 0], steps: 3, fold: 0.3 });
      if (s === 3) {
        espigaNoPe(b, { p: [0.08, h * 0.36, 0.02], r: [0, 0, -30] });
        espigaNoPe(b, { p: [-0.07, h * 0.54, -0.04], r: [-12, 0, 30] });
        espigaNoPe(b, { p: [0.0, h * 0.7, 0.08], r: [28, 0, -4] });
        for (let k = 0; k < 3; k++) b.cyl(0.012, 0.024, 0.32, 3, P.milhoPendao, { p: [0, h - 0.02, 0], r: [k ? 28 : 0, k * 150, 0] });
      } else b.leaf(0.34, 0.13, 30, P.milhoFolhaClara, { p: [0, h - 0.04, 0], steps: 2 });
    }
  });
}

// ---------------- objetos de mão ----------------
function caixote(b, recheio) {
  // origem no meio da caixa, como no conjunto "codigo" (ele segura pelos lados)
  b.group({ p: [0, -0.16, 0], s: 0.9 }, () => {
    const w = 0.64, d = 0.46, h = 0.3;
    b.box(w - 0.04, 0.04, d - 0.04, P.caixoteEscuro, {});
    for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) b.box(w, 0.11, 0.04, i ? P.caixote : P.caixoteClaro, { p: [0, 0.03 + i * 0.14, sz * (d / 2 - 0.02)] });
    for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) b.box(0.04, 0.11, d, i ? P.caixoteClaro : P.caixote, { p: [sx * (w / 2 - 0.02), 0.03 + i * 0.14, 0] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.07, h + 0.02, 0.07, P.caixoteEscuro, { p: [sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)] });
    if (recheio === 'milho') {
      for (let i = 0; i < 3; i++) { b.cyl(0.06, 0.075, 0.3, 6, P.milhoEspiga, { p: [-0.2 + i * 0.2, 0.13, 0.12], r: [-62, 20 - i * 20, 0], jit: 0.07 }); b.leaf(0.24, 0.13, 20, P.milhoPalha, { p: [-0.2 + i * 0.2, 0.12, 0.1], r: [-50, 20 - i * 20, 0], steps: 2 }); }
    } else if (recheio === 'laranja') {
      for (const [x, y, z] of [[-0.17, 0.18, -0.07], [0.02, 0.19, 0.08], [0.19, 0.18, -0.06], [-0.06, 0.3, -0.03], [0.1, 0.3, 0.02]]) b.ico(0.105, 0, P.laranja, { p: [x, y, z], r: [x * 300, y * 200, 0], jit: 0.07 });
    } else if (recheio === 'ovo') {
      b.box(w - 0.12, 0.12, d - 0.12, P.palha, { p: [0, 0.05, 0], jit: 0.08 });
      for (let i = 0; i < 3; i++) b.sph(0.075, 6, 4, P.ovo, { p: [-0.17 + i * 0.17, 0.25, i % 2 ? -0.05 : 0.05], s: [1, 1.25, 1], jit: 0.015 });
    } else { // leite: duas garrafas de corpo branco e tampa azul
      for (const x of [-0.14, 0.14]) {
        b.lathe([[0.001, 0], [0.095, 0], [0.1, 0.2], [0.055, 0.29], [0.055, 0.34], [0.001, 0.34]], 6, P.leite, { p: [x, 0.05, 0], jit: 0.02 });
        b.cyl(0.062, 0.062, 0.05, 6, P.tampa, { p: [x, 0.38, 0] });
      }
    }
  });
}
export const OBJETOS_DE_MAO = {
  // regador azul; origem na alça; bico para +Z
  regador: (b) => b.group({ p: [0, -0.2, 0.02] }, () => {
    b.cyl(0.105, 0.125, 0.21, 7, P.regadorEscuro, { grad: P.regador });
    b.cyl(0.075, 0.075, 0.012, 7, P.regadorEscuro, { p: [0, 0.2, 0] });
    b.cyl(0.024, 0.04, 0.32, 5, P.regador, { p: [0, 0.04, 0.09], r: [58, 0, 0] });
    b.cyl(0.07, 0.035, 0.05, 6, P.metalClaro, { p: [0, 0.2, 0.345], r: [58, 0, 0] });
    b.tube([[0, 0.17, -0.07], [0, 0.31, -0.08], [0, 0.31, -0.2], [0, 0.08, -0.13]], 0.02, 4, P.regador, { steps: 5 });
  }),
  // banquinho de três pernas
  banquinho: (b) => {
    b.cyl(0.2, 0.19, 0.07, 7, P.madeiraClara, { p: [0, 0.2, 0] });
    for (let i = 0; i < 3; i++) b.cyl(0.035, 0.03, 0.24, 4, P.madeiraEscura, { p: [Math.cos(i * 2.09) * 0.13, -0.02, Math.sin(i * 2.09) * 0.13], r: [Math.sin(i * 2.09) * -10, 0, Math.cos(i * 2.09) * 10] });
  },
  // espiga colhida: amarela, com duas folhas de palha
  espiga: (b) => b.group({ p: [0, -0.1, 0.04], r: [20, 0, 0] }, () => {
    b.cyl(0.045, 0.055, 0.17, 6, P.milhoEspigaEscura, { grad: P.milhoEspiga, jit: 0.07 });
    b.cone(0.045, 0.08, 6, P.milhoEspiga, { p: [0, 0.17, 0], jit: 0.07 });
    for (const e of [0, 1]) b.leaf(0.17, 0.09, 30, P.milhoPalha, { p: [0, -0.02, 0], r: [18, e * 180 + 90, 0], steps: 2 });
  }),
  caixaMilho: (b) => caixote(b, 'milho'), caixaLeite: (b) => caixote(b, 'leite'), caixaOvo: (b) => caixote(b, 'ovo'), caixaLaranja: (b) => caixote(b, 'laranja'),
  // saquinho de sementes; origem na boca
  saco: (b) => {
    b.blob(0.105, 0, P.saco, { p: [0, -0.1, 0], s: [1, 1.15, 0.86], rough: 0.08 });
    b.cyl(0.075, 0.062, 0.05, 6, P.sacoEscuro, { p: [0, -0.02, 0], open: true });
    b.cyl(0.066, 0.066, 0.012, 6, P.semente, { p: [0, 0.012, 0] });
  },
  // balde de leite cinza; origem no fundo
  balde: (b) => {
    b.cyl(0.19, 0.145, 0.25, 8, P.metal, { grad: P.metalClaro, open: true });
    b.cyl(0.18, 0.137, 0.25, 8, P.metalEscuro, { s: [-1, 1, 1], open: true });
    b.cyl(0.145, 0.145, 0.012, 8, P.metalEscuro, {});
    b.cyl(0.198, 0.19, 0.035, 8, P.metalEscuro, { p: [0, 0.215, 0], open: true });
    b.tube([[-0.19, 0.24, 0], [-0.14, 0.33, 0.02], [0, 0.37, 0.03], [0.14, 0.33, 0.02], [0.19, 0.24, 0]], 0.013, 4, P.metalEscuro, { steps: 4 });
  },
  leite: (b) => b.cyl(1, 1, 0.01, 8, P.leite, { jit: 0.01 }), // a superfície do leite dentro do balde (a animação dá o tamanho)
  ovo: (b) => b.sph(0.072, 7, 5, P.ovo, { s: [1, 1.28, 1], jit: 0.015 }),
  laranja: (b) => { b.ico(0.108, 1, P.laranjaEscura, { grad: P.laranjaClara, jit: 0.05 }); b.leaf(0.13, 0.08, 40, P.copaClara, { p: [0, 0.09, 0], r: [70, 40, 0], steps: 2 }); },
};
