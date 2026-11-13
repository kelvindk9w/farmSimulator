// Conjunto "contorno": o desenho das construções, das plantas e dos objetos de mão.
// Só o DESENHO mora aqui. Os esqueletos (nomes e posições dos ossos) e toda a animação são os de ../codigo/objetos.js:
// cada função abaixo desenha as peças de um osso, em coordenadas locais do osso. As formas partem das do conjunto
// "brinquedo" (arredondadas), com as linhas de dentro do desenho feitas de peças escuras: as juntas das tábuas são ripas
// escuras finas por cima da parede, entre as telhas aparece o fundo escuro do telhado, e as travessas da porta têm uma
// cama escura por baixo. O traço de fora de cada peça vem da casca do kit; onde a peça encosta no chão, do lado da
// câmera, a casca fica enterrada, e o risco é uma "pegada" (chapa escura um pouco maior que a peça).
import * as THREE from 'three';
import { TIPOS } from '../../jogo/contrato.js';
import { P } from './kit.js';

const GRAUS = 180 / Math.PI;

// Telhado de duas águas com telhas em fiadas: cada telha é uma placa de quinas quebradas deitada na água do telhado, com
// uma fresta para a vizinha do lado, e a fiada de cima um degrau acima da de baixo. As linhas entre as telhas são o
// fundo escuro que aparece pelas frestas e uma ripa escura ao pé de cada fiada; o fundo sobra um risco em volta, e é
// ele que leva o traço da silhueta. A cumeeira corre ao longo de Z, na altura yCume, em gomos curtos.
const RISCO = 0.05;
function telhado(b, { yCume, corre, sobe, beiral, fundo, colunas, fiadas, esp = 0.11, raio = 0.2, cumes = 5 }) {
  const k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2);
  const vao = 0.05, lw = (fundo - vao) / colunas, lf = comp / fiadas, passa = 0.07, degrau = 0.035;
  for (const s of [-1, 1]) {
    b.group({ p: [0, yCume, 0], r: [0, 0, -s * ang] }, () => {
      b.box(comp + RISCO, 0.11, fundo + 2 * RISCO, P.telhaEscura, { p: [(s * (comp + RISCO)) / 2, -0.25, 0], q: 0.02, seg: 1 });
      for (let j = 0; j < fiadas; j++) {
        const y = -0.15 + (fiadas - 1 - j) * degrau, ate = (j + 1) * lf + (j < fiadas - 1 ? passa : 0), len = ate - j * lf;
        for (let i = 0; i < colunas; i++) b.box(len, esp, lw - vao, P.telha, { p: [s * (j * lf + len / 2), y, -fundo / 2 + vao / 2 + (i + 0.5) * lw], q: 0.035, seg: 1, semTraco: true });
        if (j < fiadas - 1) b.box(RISCO, 0.02, fundo, P.telhaEscura, { p: [s * (ate + RISCO / 2 - 0.005), y - degrau + esp - 0.012, 0], q: 0.004, seg: 1, semTraco: true });
      }
    });
  }
  const lc = (fundo + 0.16) / cumes;
  for (let i = 0; i < cumes; i++) b.cap(raio * (i % 2 ? 0.92 : 1), lc + 0.06, P.telhaClara, { p: [0, yCume - 0.03, -(fundo + 0.16) / 2 + i * lc - 0.03], r: [90, 0, 0], n: 10, nc: 2 });
}

// bloco de pedra curvo (um pedaço de anel de cantos arredondados): raios r0..r1, alturas y0..y1, ângulos a0..a1
function blocoCurvo(b, r0, r1, y0, y1, a0, a1, cor, q = 0.05) {
  const pts = [], canto = (cx, cy, g0) => { for (let i = 0; i <= 2; i++) { const g = (g0 + i * 45) / GRAUS; pts.push(new THREE.Vector2(cx + Math.cos(g) * q, cy + Math.sin(g) * q)); } };
  canto(r0 + q, y0 + q, 180); canto(r1 - q, y0 + q, 270); canto(r1 - q, y1 - q, 0); canto(r0 + q, y1 - q, 90); pts.push(pts[0].clone());
  return b.add(new THREE.LatheGeometry(pts, 2, a0, a1 - a0), cor);
}

// ---------------- celeiro ----------------
export function celeiro(b, nome) {
  const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, Pt = TIPOS.celeiro.porta, hw = Pt.largura / 2, fz = D / 2;
  const sobe = 1.3, corre = W / 2;
  if (nome === 'raiz') {
    const dentro = P.interior;
    // por dentro é escuro: chão, fundo, lados, forro; e uns fardos de feno
    b.box(W - 0.3, 0.02, D - 0.24, '#5a3a1c', { p: [0, 0.002, 0], q: 0.004, seg: 1, semTraco: true });
    b.box(W - 0.3, H, 0.06, dentro, { p: [0, 0, -fz + 0.2], q: 0.01, seg: 1, semTraco: true });
    for (const s of [-1, 1]) b.box(0.06, H, D - 0.3, dentro, { p: [s * (W / 2 - 0.2), 0, 0], q: 0.01, seg: 1, semTraco: true });
    b.box(W - 0.3, 0.06, D - 0.3, dentro, { p: [0, H - 0.05, 0], q: 0.01, seg: 1, semTraco: true });
    for (const s of [-1, 1]) b.box(W / 2 - hw - 0.16, H, 0.05, dentro, { p: [s * (hw + (W / 2 - hw - 0.16) / 2 + 0.02), 0, fz - 0.2], q: 0.01, seg: 1, semTraco: true });
    b.box(0.85, 0.46, 0.52, P.palha, { p: [-1.0, 0, -0.9], q: 0.09, seg: 2 });
    b.box(0.8, 0.44, 0.5, P.palhaEscura, { p: [0.9, 0, -0.95], r: [0, -6, 0], q: 0.09, seg: 2 });
    // paredes: uma placa lisa cada, com as juntas das tábuas riscadas por cima (ripas escuras e finas, sem traço)
    const junta = (x, y, z, alt, daFrente) => b.box(daFrente ? 0.045 : 0.02, alt, daFrente ? 0.02 : 0.045, P.paredeFriso, { p: [x, y, z], q: 0.004, seg: 1, semTraco: true });
    b.box(W, H, 0.14, P.parede, { p: [0, 0, -fz + 0.07], q: 0.02, seg: 1 }); // fundo e lado esquerdo: a câmera nunca vê
    b.box(0.14, H, D, P.parede, { p: [-W / 2 + 0.07, 0, 0], q: 0.02, seg: 1 });
    b.box(0.13, H, D - 0.02, P.parede, { p: [W / 2 - 0.065, 0, 0], q: 0.02, seg: 1 }); // lado direito
    for (let i = 1; i < 6; i++) junta(W / 2 + 0.002, 0.2, -fz + (i * D) / 6, H - 0.2, false);
    // parede da frente: um pano de cada lado da porta e outro em cima
    for (const s of [-1, 1]) {
      b.box(W / 2 - hw, H, 0.13, P.paredeClara, { p: [s * (hw + (W / 2 - hw) / 2), 0, fz - 0.065], q: 0.02, seg: 1 });
      junta(s * (hw + 0.15 + (W / 2 - hw - 0.15) / 2), 0.2, fz + 0.002, H - 0.2, true);
    }
    b.box(Pt.largura + 0.02, H - Pt.altura, 0.13, P.paredeClara, { p: [0, Pt.altura, fz - 0.065], q: 0.02, seg: 1, semTraco: true });
    // quinas da casa: um caibro mais escuro em cada canto que a câmera vê
    for (const s of [-1, 1]) b.box(0.17, H, 0.17, P.madeiraEscura, { p: [s * (W / 2 - 0.07), 0, fz - 0.07], q: 0.03, seg: 1 });
    b.box(0.17, H, 0.17, P.madeiraEscura, { p: [W / 2 - 0.07, 0, -fz + 0.07], q: 0.03, seg: 1 });
    // empenas (frente e fundo), com as juntas das tábuas riscadas na da frente, e a janelinha do paiol
    for (const s of [-1, 1]) b.ext([[-corre, 0], [corre, 0], [0, sobe]], 0.13, P.paredeClara, { p: [0, H - 0.01, s * (fz - 0.065)], q: 0.02 });
    for (let i = 1; i < 8; i++) {
      const x = -corre + i * (W / 8), alt = sobe * (1 - Math.abs(x) / corre) - 0.16 + (H - Pt.altura - 0.2);
      if (Math.abs(x) > 0.5) junta(x, Pt.altura + 0.2, fz + 0.002, alt, true);
    }
    b.box(0.6, 0.5, 0.06, P.vidro, { p: [0, H + 0.24, fz - 0.02], q: 0.02, seg: 1, semTraco: true });
    for (const [x, y, lw, lh] of [[0, 0.16, 0.84, 0.1], [0, 0.72, 0.84, 0.1], [-0.37, 0.2, 0.1, 0.58], [0.37, 0.2, 0.1, 0.58]]) b.box(lw, lh, 0.12, P.madeiraEscura, { p: [x, H + y, fz - 0.01], q: 0.03, seg: 1 });
    // batentes e verga da porta
    for (const s of [-1, 1]) b.box(0.15, Pt.altura + 0.08, 0.16, P.madeiraEscura, { p: [s * (hw + 0.075), 0, fz - 0.03], q: 0.04, seg: 1 });
    b.box(Pt.largura + 0.44, 0.18, 0.2, P.madeiraEscura, { p: [0, Pt.altura, fz - 0.02], q: 0.05, seg: 1 });
    // baldrame claro ao pé das paredes (menos no vão da porta)
    b.box(0.2, 0.24, D + 0.2, P.base, { p: [W / 2 + 0.02, 0, 0], q: 0.05, seg: 1 });
    b.box(0.2, 0.24, D + 0.2, P.base, { p: [-W / 2 - 0.02, 0, 0], q: 0.05, seg: 1 });
    b.box(W + 0.2, 0.24, 0.2, P.base, { p: [0, 0, -fz - 0.02], q: 0.05, seg: 1 });
    for (const s of [-1, 1]) b.box(W / 2 - hw - 0.02, 0.24, 0.2, P.base, { p: [s * (hw + 0.13 + (W / 2 - hw - 0.02) / 2), 0, fz + 0.02], q: 0.05, seg: 1 });
    // tábuas de beiral na empena da frente e o telhado
    const beiral = 0.46, k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2), fundo = D + 0.8, yCume = H + sobe + 0.2;
    for (const s of [-1, 1]) b.group({ p: [0, yCume, fundo / 2 - 0.12], r: [0, 0, -s * ang] }, () => b.box(comp - 0.06, 0.18, 0.09, P.madeira, { p: [(s * (comp - 0.06)) / 2, -0.43, 0], q: 0.03, seg: 1 }));
    telhado(b, { yCume, corre, sobe, beiral, fundo, colunas: 6, fiadas: 3, raio: 0.24, cumes: 6 });
  } else {
    // folha da porta: almofada verde, moldura clara e travessas em X, igual dos dois lados; por baixo da moldura e das
    // travessas vai uma cama escura um pouco mais larga, que faz o traço delas dos dois lados
    const s = nome === 'folhaE' ? 1 : -1, lw = hw - 0.012, alt = Pt.altura - 0.04, cx = (s * lw) / 2, cama = P.traco;
    b.box(lw - 0.06, alt - 0.06, 0.07, P.portaVerde, { p: [cx, 0.05, 0], q: 0.02, seg: 1, semTraco: true });
    b.box(lw - 0.2, alt - 0.2, 0.085, cama, { p: [cx, 0.12, 0], q: 0.01, seg: 1, semTraco: true });
    b.box(lw - 0.34, alt - 0.34, 0.1, P.portaVerde, { p: [cx, 0.19, 0], q: 0.01, seg: 1, semTraco: true });
    b.box(lw, 0.15, 0.13, P.creme, { p: [cx, 0.02, 0], q: 0.04, seg: 1 });
    b.box(lw, 0.15, 0.13, P.creme, { p: [cx, alt - 0.13, 0], q: 0.04, seg: 1 });
    for (const e of [-1, 1]) b.box(0.14, alt, 0.13, P.creme, { p: [cx + e * (lw / 2 - 0.07), 0.02, 0], q: 0.04, seg: 1 });
    const dg = Math.hypot(lw - 0.24, alt - 0.3), a = Math.atan2(lw - 0.24, alt - 0.3) * GRAUS;
    for (const e of [-1, 1]) b.group({ p: [cx, alt / 2 + 0.02, 0], r: [0, 0, e * a] }, () => {
      b.box(0.16, dg, 0.11, cama, { p: [0, -dg / 2, 0], q: 0.01, seg: 1, semTraco: true });
      b.box(0.095, dg, 0.125, P.creme, { p: [0, -dg / 2, 0], q: 0.02, seg: 1, semTraco: true });
    });
    b.cap(0.035, 0.3, P.metalEscuro, { p: [s * (lw - 0.13), 1.02, 0.08] });
    b.cap(0.035, 0.3, P.metalEscuro, { p: [s * (lw - 0.13), 1.02, -0.08] });
  }
}

// ---------------- poço ----------------
const RAIO_MANIVELA = 0.26;
export function poco(b, nome) {
  if (nome === 'raiz') {
    // anel de pedra: duas fiadas de blocos curvos, com a junta escura aparecendo entre eles, e a água lá dentro
    b.disco(0.845 + RISCO, P.traco, { p: [0, 0.022, 0], n: 18 }); // pegada
    b.lathe([[0.6, 0], [0.815, 0], [0.815, 0.76], [0.6, 0.76], [0.6, 0.3]], 20, P.pedraEscura, { n: 18 });
    const NB = 8, passo = (Math.PI * 2) / NB, vao = 0.05, tons = [P.pedra, P.pedraClara, P.pedra, P.pedraMedia];
    for (let f = 0; f < 2; f++) for (let i = 0; i < NB; i++) {
      const a0 = (i + f * 0.5) * passo + 0.3;
      blocoCurvo(b, 0.57, 0.845, f * 0.405, f * 0.405 + 0.38, a0 + vao / 2, a0 + passo - vao / 2, tons[(i * 3 + f * 5) % tons.length], 0.05);
    }
    b.cyl(0.6, 0.6, 0.02, 16, P.agua, { p: [0, 0.4, 0], q: 0.002, semTraco: true });
    b.cyl(0.3, 0.3, 0.006, 12, P.aguaClara, { p: [0.1, 0.42, -0.08], q: 0.001, semTraco: true });
    // esteios, travessa e telhadinho (alto, para não esconder o balde)
    for (const s of [-1, 1]) b.box(0.19, 1.72, 0.19, P.tronco, { p: [0, 0.7, s * 0.74], q: 0.04, seg: 1 }); // nascem de dentro da pedra
    b.box(0.14, 0.14, 1.7, P.tronco, { p: [0, 2.24, 0], q: 0.03, seg: 1 });
    telhado(b, { yCume: 2.74, corre: 0.56, sobe: 0.38, beiral: 0.24, fundo: 2.2, colunas: 4, fiadas: 2, esp: 0.1, raio: 0.17, cumes: 4 });
  } else if (nome === 'eixo') {
    b.cap(0.05, 1.9, P.tronco, { p: [0, 0, -0.84], r: [90, 0, 0] });
    b.cyl(0.11, 0.11, 0.9, 12, P.madeira, { p: [0, 0, -0.45], r: [90, 0, 0], q: 0.03 });
    for (let i = 0; i < 5; i++) b.add(new THREE.TorusGeometry(0.1, 0.04, 4, 8), i % 2 ? P.corda : P.cordaEscura, { p: [0, 0, -0.152 + i * 0.076] });
    // manivela: braço de ferro e pegador de madeira
    b.box(0.09, RAIO_MANIVELA + 0.1, 0.07, P.metal, { p: [0, -0.05, 1.0], q: 0.03, seg: 1 });
    b.cap(0.05, 0.34, P.madeira, { p: [0, RAIO_MANIVELA, 1.0], r: [90, 0, 0] });
  } else if (nome === 'corda') {
    b.cyl(0.022, 0.022, 1, 7, P.corda, { p: [0, -1, 0], q: 0.004, n: 5 }); // de 0 a -1: a escala em Y dá o comprimento
  } else if (nome === 'balde') {
    // origem na boca do balde; a alça sobe até onde a corda amarra
    b.lathe([[0, -0.27], [0.135, -0.27], [0.155, -0.25], [0.2, -0.03], [0.205, 0], [0.19, 0.012], [0.172, 0], [0.135, -0.22], [0, -0.22]], 14, P.balde, {});
    b.cyl(0.165, 0.165, 0.012, 12, P.agua, { p: [0, -0.13, 0], q: 0.002, semTraco: true });
    b.cyl(0.208, 0.2, 0.045, 14, P.baldeEscuro, { p: [0, -0.07, 0], q: 0.015, semTraco: true });
    b.tube([[0, -0.02, -0.2], [0, 0.13, -0.11], [0, 0.17, 0], [0, 0.13, 0.11], [0, -0.02, 0.2]], 0.02, 6, P.metalEscuro, { steps: 6, n: 5 });
  }
}

// ---------------- ninho ----------------
export function ninho(b, nome) {
  const R = TIPOS.ninho.raio;
  if (nome === 'raiz') {
    // anel baixo de palha: um rolo gordo por baixo e gomos grossos trançados por cima
    b.cyl(R - 0.05, R - 0.02, 0.07, 16, P.palhaEscura, { q: 0.02 });
    const anel = []; for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI * 2; anel.push([R - 0.07 + Math.cos(a) * 0.09, 0.1 + Math.sin(a) * 0.09]); }
    b.lathe(anel, 16, P.palhaEscura, {});
    for (let i = 0; i < 9; i++) {
      const a0 = (i / 9) * Math.PI * 2, da = 0.85, r = R - 0.06, pts = [];
      for (let k = 0; k <= 3; k++) { const a = a0 + (da * k) / 3, sobe = Math.sin((k / 3) * Math.PI); pts.push([Math.cos(a) * (r + 0.04 * sobe * (i % 2 ? 1 : -1)), 0.13 + 0.07 * sobe + (i % 3) * 0.012, Math.sin(a) * (r + 0.04 * sobe * (i % 2 ? 1 : -1))]); }
      b.tube(pts, 0.052, 6, i % 2 ? P.palha : P.palhaClara, { steps: 5, n: 5 });
    }
  } else b.sph(0.1, 0, 0, P.ovo, { p: [0, 0.1, 0], s: [1, 1.28, 1], r: [0, 0, 18] });
}

// ---------------- laranjeira ----------------
const PENCAS = [[-0.57, -0.19, 0.86, 0.1], [-0.39, -0.16, 0.82, 0.13], [-0.5, -0.13, 1.0, 0.12]]; // as mesmas de ../codigo/objetos.js
const RAIO_LARANJA = 0.19, MIOLO = 0.117; // o miolo fica onde o conjunto "codigo" o põe (é o ponto de mão)
const COPA = [[0.05, 1.62, -0.1, 1.12], [0.98, 0.92, 0.3, 0.74], [-0.95, 0.95, -0.25, 0.78], [0.2, 0.95, -1.0, 0.76], [0.1, 0.8, 0.85, 0.6], [-0.62, 1.95, 0.5, 0.56], [0.8, 1.9, -0.45, 0.6]]; // [x, y, z, raio] a partir do osso da copa
export function arvore(b, nome) {
  if (nome === 'raiz') {
    // tronco afunilado, com o pé alargado
    b.disco(0.46 + RISCO, P.traco, { p: [0, 0.022, 0], n: 12 }); // pegada
    b.lathe([[0, 0], [0.46, 0], [0.42, 0.06], [0.3, 0.26], [0.24, 0.6], [0.21, 1.2], [0.23, 1.75], [0.27, 2.0], [0, 2.0]], 14, P.tronco, {});
    b.cyl(0.1, 0.15, 0.85, 8, P.tronco, { p: [0.05, 1.5, 0], r: [0, 0, -34] });
    b.cyl(0.1, 0.15, 0.85, 8, P.tronco, { p: [-0.05, 1.45, -0.05], r: [-22, 0, 30] });
    b.cyl(0.08, 0.12, 1.05, 8, P.tronco, { p: [0, 1.62, 0.05], r: [52, -4, 0] });
  } else if (nome === 'copa') {
    // copa de nuvem: um domo grande em cima e bolas menores em volta, mais abaixo; cada bola ganha o seu traço
    for (const [x, y, z, r] of COPA) b.sph(r, 0, 0, P.folha, { p: [x, y, z], s: [1, 0.92, 1], n: 20 });
  } else if (nome === 'galho') {
    b.sph(0.5, 0, 0, P.folha, { p: [-0.5, 0.36, 0.8], s: [1, 0.9, 1] });
  } else {
    const c = PENCAS[+nome[5]][3];
    b.cap(0.02, c + 0.2, P.troncoEscuro, { p: [0, -c, 0], n: 4, nc: 1 });
    b.sph(RAIO_LARANJA, 0, 0, P.laranja, { p: [0, -c - MIOLO, 0], n: 12 });
    b.bola(0.05, P.laranjaClara, { p: [-0.055, -c - MIOLO + 0.08, 0.14], s: [1, 0.8, 0.4], seg: 6, aneis: 4, semTraco: true }); // brilho
    for (const e of [-1, 1]) b.bola(0.095, P.folhaClara, { p: [e * 0.085, -c + 0.09, 0.03], s: [1, 0.3, 0.6], r: [0, e * 20, e * 28] });
  }
}

// ---------------- canteiro e milho ----------------
// almofada de terra de borda redonda, com três leiras gordas (os pés de milho ficam nas de fora)
export function canteiroTerra(b) {
  const [w, d] = TIPOS.canteiro.tamanho, lw = w - 0.16, ld = d - 0.16, rl = ld * 0.158;
  b.ret(lw + 2 * RISCO - 0.04, ld + 2 * RISCO - 0.04, P.traco, { p: [0, 0.022, 0] }); // pegada: o risco do pé do canteiro
  b.box(lw, 0.27, ld, P.terra, { q: 0.05, seg: 1 });
  for (const k of [-1, 0, 1]) b.cap(rl, lw - 0.26, P.terraLeira, { p: [-(lw - 0.26) / 2, 0.16, k * ld * 0.29], r: [0, 0, -90], s: [0.6, 1, 1], n: 8, nc: 2, semTraco: true });
}
// Os pés de milho são de poucas peças e gordas (o traço engole peça fina): caule grosso, folhas largas e espiga grande.
function espigaNoPe(b, o) {
  b.group(o, () => {
    b.cap(0.125, 0.5, P.milhoEspiga, { p: [0, 0.03, 0], n: 8, nc: 2 });
    b.folha(0.4, 0.26, P.milhoFolha, { p: [0.08, -0.02, 0], r: [0, 0, -6], dobra: 22, esp: 0.5 });
    b.folha(0.4, 0.26, P.milhoCaule, { p: [-0.08, -0.02, 0], r: [0, 180, -6], dobra: 22, esp: 0.5 });
  });
}
export function canteiroPlantas(b, nome) {
  if (nome === 'raiz') return;
  const s = +nome[1], i = +nome[3];
  b.group({ r: [0, i * 67 + s * 30, 0] }, () => {
    if (s === 0) { // semente: uma meia bolinha amarela num montinho
      // o osso fica dentro da leira (o alto dela passa 0,1 acima dele): o montinho sobe para aparecer em cima da terra
      b.bola(0.18, P.terraClara, { p: [0, 0.1, 0], s: [1, 0.5, 1], seg: 7, aneis: 3 });
      b.bola(0.085, P.semente, { p: [0, 0.18, 0], s: [1, 0.8, 1] });
    } else if (s === 1) { // broto: duas folhinhas gordas e uma menor no meio
      b.cap(0.05, 0.2, P.milhoCaule, { n: 5, nc: 1 });
      for (const e of [0, 1]) b.folha(0.48, 0.27, P.milhoFolha, { p: [0, 0.1, 0], r: [0, e * 180, -32], dobra: 50, esp: 0.5 });
      b.folha(0.3, 0.17, P.milhoCaule, { p: [0, 0.13, 0], r: [0, 90, -12], dobra: 30, esp: 0.5 });
    } else { // pé crescendo (0,9 de altura) e pé pronto (1,8, com as espigas)
      const h = s === 2 ? 0.9 : 1.8, nf = s === 2 ? 3 : 4;
      b.cap(s === 2 ? 0.07 : 0.09, h, P.milhoCaule, { n: 6, nc: 1 });
      for (let k = 0; k < nf; k++) b.folha(s === 2 ? 0.6 : 0.85, s === 2 ? 0.27 : 0.36, k % 2 ? P.milhoFolha : P.milhoCaule, { p: [0, h * (0.14 + (k / nf) * 0.6), 0], r: [0, k * 137, -34], dobra: 70, esp: 0.36 });
      if (s === 3) {
        espigaNoPe(b, { p: [0.09, h * 0.42, 0.02], r: [0, 0, -26] });
        espigaNoPe(b, { p: [-0.08, h * 0.66, -0.03], r: [-10, 0, 24] });
        for (let k = 0; k < 3; k++) b.cap(0.032, 0.3, P.milhoPendao, { p: [0, h - 0.03, 0], r: [k ? 28 : 0, k * 150, 0], n: 5, nc: 1 });
      } else b.folha(0.36, 0.2, P.milhoFolha, { p: [0, h - 0.06, 0], dobra: 20, esp: 0.5 });
    }
  });
}

// ---------------- objetos de mão ----------------
function caixote(b, recheio) {
  // origem no meio da caixa, como no conjunto "codigo" (ele segura pelos lados)
  b.group({ p: [0, -0.16, 0], s: 0.9 }, () => {
    const w = 0.64, d = 0.46, h = 0.3;
    b.box(w - 0.04, 0.045, d - 0.04, P.caixoteEscuro, { q: 0.015, seg: 1 });
    b.box(w - 0.06, 0.24, d - 0.06, P.traco, { p: [0, 0.03, 0], q: 0.01, seg: 1, semTraco: true }); // o escuro das frestas
    for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) b.box(w - 0.02, 0.1, 0.045, P.caixote, { p: [0, 0.035 + i * 0.14, sz * (d / 2 - 0.022)], q: 0.02, seg: 1 });
    for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) b.box(0.045, 0.1, d - 0.02, P.caixote, { p: [sx * (w / 2 - 0.022), 0.035 + i * 0.14, 0], q: 0.02, seg: 1 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.075, h + 0.02, 0.075, P.caixoteClaro, { p: [sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)], q: 0.025, seg: 1 });
    if (recheio === 'milho') {
      for (let i = 0; i < 3; i++) { b.cap(0.075, 0.34, P.milhoEspiga, { p: [-0.2 + i * 0.2, 0.13, 0.13], r: [-62, 20 - i * 20, 0] }); b.cap(0.065, 0.26, P.milhoFolha, { p: [-0.13 + i * 0.2, 0.12, 0.12], r: [-58, 20 - i * 20, 0], s: [0.45, 1, 1] }); }
    } else if (recheio === 'laranja') {
      for (const [x, y, z] of [[-0.17, 0.18, -0.07], [0.02, 0.19, 0.08], [0.19, 0.18, -0.06], [-0.06, 0.3, -0.03], [0.1, 0.3, 0.02]]) b.sph(0.105, 0, 0, P.laranja, { p: [x, y, z] });
    } else if (recheio === 'ovo') {
      b.box(w - 0.12, 0.12, d - 0.12, P.palha, { p: [0, 0.05, 0], q: 0.05, seg: 1 });
      for (let i = 0; i < 3; i++) b.sph(0.075, 0, 0, P.ovo, { p: [-0.17 + i * 0.17, 0.25, i % 2 ? -0.05 : 0.05], s: [1, 1.25, 1] });
    } else { // leite: duas garrafas brancas de tampa azul
      for (const x of [-0.14, 0.14]) {
        b.lathe([[0, 0], [0.085, 0], [0.1, 0.02], [0.1, 0.2], [0.085, 0.26], [0.05, 0.3], [0.05, 0.34], [0, 0.34]], 12, P.leite, { p: [x, 0.05, 0] });
        b.cyl(0.062, 0.062, 0.05, 10, P.tampa, { p: [x, 0.38, 0], q: 0.015 });
      }
    }
  });
}
export const OBJETOS_DE_MAO = {
  // regador azul; origem na alça; bico para +Z
  regador: (b) => b.group({ p: [0, -0.2, 0.02] }, () => {
    b.cyl(0.105, 0.12, 0.21, 14, P.regador, { q: 0.035 });
    b.cyl(0.075, 0.075, 0.012, 12, P.regadorEscuro, { p: [0, 0.2, 0], q: 0.003, semTraco: true });
    b.cyl(0.028, 0.042, 0.32, 8, P.regador, { p: [0, 0.04, 0.09], r: [58, 0, 0], q: 0.01 });
    b.cyl(0.066, 0.04, 0.045, 10, P.crivo, { p: [0, 0.2, 0.345], r: [58, 0, 0], q: 0.012 });
    b.tube([[0, 0.17, -0.07], [0, 0.31, -0.08], [0, 0.31, -0.2], [0, 0.08, -0.13]], 0.024, 6, P.regador, { steps: 8, n: 5 });
  }),
  // banquinho de três pernas grossas
  banquinho: (b) => {
    b.cyl(0.2, 0.2, 0.07, 14, P.madeiraClara, { p: [0, 0.2, 0], q: 0.03 });
    for (let i = 0; i < 3; i++) b.cap(0.042, 0.26, P.madeira, { p: [Math.cos(i * 2.09) * 0.13, -0.02, Math.sin(i * 2.09) * 0.13], r: [Math.sin(i * 2.09) * -10, 0, Math.cos(i * 2.09) * 10] });
  },
  // espiga colhida: gomo amarelo com duas folhas de palha
  espiga: (b) => b.group({ p: [0, -0.1, 0.04], r: [20, 0, 0] }, () => {
    b.cap(0.052, 0.23, P.milhoEspiga, {});
    for (const e of [-1, 1]) b.cap(0.045, 0.17, P.milhoFolha, { p: [e * 0.035, -0.03, 0], r: [0, 0, e * 18], s: [0.45, 1, 1] });
  }),
  caixaMilho: (b) => caixote(b, 'milho'), caixaLeite: (b) => caixote(b, 'leite'), caixaOvo: (b) => caixote(b, 'ovo'), caixaLaranja: (b) => caixote(b, 'laranja'),
  // saquinho de sementes; origem na boca
  saco: (b) => {
    b.sph(0.105, 0, 0, P.saco, { p: [0, -0.1, 0], s: [1, 1.12, 0.86] });
    b.cyl(0.08, 0.066, 0.05, 10, P.sacoEscuro, { p: [0, -0.03, 0], q: 0.015 });
    b.cyl(0.062, 0.062, 0.012, 10, P.semente, { p: [0, 0.014, 0], q: 0.004, semTraco: true });
  },
  // balde de leite cinza, de parede grossa; origem no fundo
  balde: (b) => {
    b.lathe([[0, 0], [0.13, 0], [0.148, 0.018], [0.19, 0.235], [0.192, 0.25], [0.18, 0.262], [0.166, 0.25], [0.13, 0.04], [0, 0.04]], 14, P.metal, {});
    b.cyl(0.198, 0.192, 0.04, 14, P.metalEscuro, { p: [0, 0.2, 0], q: 0.014, semTraco: true });
    b.tube([[-0.19, 0.24, 0], [-0.14, 0.33, 0.02], [0, 0.37, 0.03], [0.14, 0.33, 0.02], [0.19, 0.24, 0]], 0.018, 6, P.metalEscuro, { steps: 6, n: 5 });
  },
  leite: (b) => b.cyl(1, 1, 0.01, 14, P.leite, { q: 0.002, semTraco: true }), // a superfície do leite dentro do balde (a animação dá o tamanho)
  ovo: (b) => b.sph(0.075, 0, 0, P.ovo, { s: [1, 1.28, 1] }),
  laranja: (b) => { b.sph(0.108, 0, 0, P.laranja, {}); for (const e of [-1, 1]) b.bola(0.055, P.folhaClara, { p: [e * 0.045, 0.1, 0.01], s: [1, 0.3, 0.6], r: [0, e * 20, e * 28] }); },
};
