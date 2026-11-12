// Conjunto "brinquedo": o desenho das construções, das plantas e dos objetos de mão.
// Só o DESENHO mora aqui. Os esqueletos (nomes e posições dos ossos) e toda a animação são os de ../codigo/objetos.js:
// cada função abaixo desenha as peças de um osso, em coordenadas locais do osso, com as formas arredondadas do kit.
// Referências: arte/estilo/rodada-02/folha-construcoes.png, folha-plantio.png e notas-de-construcao.md.
import * as THREE from 'three';
import { TIPOS } from '../../jogo/contrato.js';
import { P } from './kit.js';

const GRAUS = 180 / Math.PI;

// Telhado de duas águas com telhas gordas: em cada coluna, cilindros compridos de pontas redondas descem a água, o de
// cima um pouco mais alto e por cima do de baixo. A cumeeira corre ao longo de Z, na altura yCume.
function telhado(b, { yCume, corre, sobe, beiral, fundo, colunas, fiadas, raio = 0.2 }) {
  const k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2);
  const lw = fundo / colunas, lf = comp / fiadas, passa = 0.16;
  for (const s of [-1, 1]) {
    b.group({ p: [0, yCume, 0], r: [0, 0, -s * ang] }, () => {
      b.box(comp + 0.04, 0.12, fundo - 0.16, P.telhaEscura, { p: [(s * comp) / 2, -0.2, 0], q: 0.05, seg: 1 });
      for (let i = 0; i < colunas; i++) for (let j = 0; j < fiadas; j++) {
        const cima = fiadas - 1 - j, ini = j * lf - (j ? passa : 0), len = lf + (j ? passa : 0) + raio * 0.35;
        b.cap(raio, len, P.telha, { p: [s * ini, -0.11 + cima * 0.035, -fundo / 2 + (i + 0.5) * lw], r: [0, 0, -s * 88.2], s: [0.8, 1, (lw / (2 * raio)) * 1.03], n: 8, nc: 3 });
      }
    });
  }
  // cumeeira: uma telha gorda deitada
  b.cap(raio * 1.02, fundo + 0.24, P.telha, { p: [0, yCume + 0.03, -(fundo + 0.24) / 2], r: [90, 0, 0], n: 10 });
}

// bloco de pedra curvo (um pedaço de anel de cantos arredondados): raios r0..r1, alturas y0..y1, ângulos a0..a1
function blocoCurvo(b, r0, r1, y0, y1, a0, a1, cor, q = 0.05) {
  const pts = [], canto = (cx, cy, g0) => { for (let i = 0; i <= 2; i++) { const g = (g0 + i * 45) / GRAUS; pts.push(new THREE.Vector2(cx + Math.cos(g) * q, cy + Math.sin(g) * q)); } };
  canto(r0 + q, y0 + q, 180); canto(r1 - q, y0 + q, 270); canto(r1 - q, y1 - q, 0); canto(r0 + q, y1 - q, 90); pts.push(pts[0].clone());
  return b.add(new THREE.LatheGeometry(pts, 3, a0, a1 - a0), cor);
}

// ---------------- celeiro ----------------
export function celeiro(b, nome) {
  const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, Pt = TIPOS.celeiro.porta, hw = Pt.largura / 2, fz = D / 2;
  const sobe = 1.45, corre = W / 2;
  if (nome === 'raiz') {
    const dentro = P.interior;
    // por dentro é escuro: chão, fundo, lados, forro; e uns fardos de feno
    b.box(W - 0.3, 0.02, D - 0.24, '#6a4524', { p: [0, 0.002, 0], q: 0.004, seg: 1 });
    b.box(W - 0.3, H, 0.06, dentro, { p: [0, 0, -fz + 0.2], q: 0.01, seg: 1 });
    for (const s of [-1, 1]) b.box(0.06, H, D - 0.3, dentro, { p: [s * (W / 2 - 0.2), 0, 0], q: 0.01, seg: 1 });
    b.box(W - 0.3, 0.06, D - 0.3, dentro, { p: [0, H - 0.05, 0], q: 0.01, seg: 1 });
    for (const s of [-1, 1]) b.box(W / 2 - hw - 0.16, H, 0.05, dentro, { p: [s * (hw + (W / 2 - hw - 0.16) / 2 + 0.02), 0, fz - 0.2], q: 0.01, seg: 1 });
    b.box(0.85, 0.46, 0.52, P.palha, { p: [-1.0, 0, -0.9], q: 0.09, seg: 2 });
    b.box(0.8, 0.44, 0.5, P.palhaEscura, { p: [0.9, 0, -0.95], r: [0, -6, 0], q: 0.09, seg: 2 });
    b.box(0.75, 0.42, 0.48, P.palha, { p: [-0.85, 0.46, -0.95], r: [0, 10, 0], q: 0.09, seg: 2 });
    // paredes que a câmera nunca vê (fundo e lado esquerdo): uma placa cada, só para fechar a casa e fazer sombra
    b.box(W, H, 0.14, P.parede, { p: [0, 0, -fz + 0.07], q: 0.03, seg: 1 });
    b.box(0.14, H, D, P.parede, { p: [-W / 2 + 0.07, 0, 0], q: 0.03, seg: 1 });
    // parede da direita: tábuas largas em pé, com um friso escuro entre elas
    const nt = 6, lt = (D - 0.04) / nt;
    b.box(0.06, H - 0.04, D - 0.12, P.paredeFriso, { p: [W / 2 - 0.11, 0, 0], q: 0.01, seg: 1 });
    for (let i = 0; i < nt; i++) b.box(0.13, H, lt - 0.03, i % 2 ? P.parede : P.paredeClara, { p: [W / 2 - 0.065, 0, -fz + 0.02 + (i + 0.5) * lt], q: 0.04, seg: 1 });
    // parede da frente: duas tábuas de cada lado da porta e uma faixa em cima
    const lf = (W / 2 - hw - 0.02) / 2;
    b.box(W - 0.12, H - 0.04, 0.06, P.paredeFriso, { p: [0, Pt.altura + 0.02, fz - 0.11], q: 0.01, seg: 1, s: [1, (H - Pt.altura) / (H - 0.04), 1] });
    for (const s of [-1, 1]) {
      b.box(W / 2 - hw - 0.1, H - 0.04, 0.06, P.paredeFriso, { p: [s * (hw + (W / 2 - hw) / 2), 0, fz - 0.11], q: 0.01, seg: 1 });
      for (let i = 0; i < 2; i++) b.box(lf - 0.03, H, 0.13, i % 2 ? P.parede : P.paredeClara, { p: [s * (hw + 0.02 + (i + 0.5) * lf), 0, fz - 0.065], q: 0.04, seg: 1 });
    }
    for (let i = 0; i < 4; i++) b.box(Pt.largura / 4 - 0.03, H - Pt.altura, 0.13, i % 2 ? P.paredeClara : P.parede, { p: [-hw + (i + 0.5) * (Pt.largura / 4), Pt.altura, fz - 0.065], q: 0.04, seg: 1 });
    // empenas (frente e fundo) e a janelinha do paiol
    for (const s of [-1, 1]) b.ext([[-corre, 0], [corre, 0], [0, sobe]], 0.13, P.paredeClara, { p: [0, H - 0.01, s * (fz - 0.065)], q: 0.03 });
    b.box(0.6, 0.5, 0.06, P.interior, { p: [0, H + 0.24, fz - 0.02], q: 0.02, seg: 1 });
    for (const [x, y, lw, lh] of [[0, 0.16, 0.84, 0.1], [0, 0.72, 0.84, 0.1], [-0.37, 0.2, 0.1, 0.58], [0.37, 0.2, 0.1, 0.58]]) b.box(lw, lh, 0.12, P.madeiraEscura, { p: [x, H + y, fz - 0.01], q: 0.035, seg: 1 });
    // batentes e verga da porta
    for (const s of [-1, 1]) b.box(0.15, Pt.altura + 0.08, 0.16, P.madeiraEscura, { p: [s * (hw + 0.075), 0, fz - 0.03], q: 0.045, seg: 1 });
    b.box(Pt.largura + 0.44, 0.18, 0.2, P.madeiraEscura, { p: [0, Pt.altura, fz - 0.02], q: 0.06, seg: 2 });
    // baldrame claro: barras arredondadas ao pé das paredes (menos no vão da porta)
    b.box(0.2, 0.24, D + 0.2, P.base, { p: [W / 2 + 0.02, 0, 0], q: 0.08, seg: 2 });
    b.box(0.2, 0.24, D + 0.2, P.base, { p: [-W / 2 - 0.02, 0, 0], q: 0.08, seg: 1 });
    b.box(W + 0.2, 0.24, 0.2, P.base, { p: [0, 0, -fz - 0.02], q: 0.08, seg: 1 });
    for (const s of [-1, 1]) b.box(W / 2 - hw - 0.02, 0.24, 0.2, P.base, { p: [s * (hw + 0.13 + (W / 2 - hw - 0.02) / 2), 0, fz + 0.02], q: 0.08, seg: 2 });
    telhado(b, { yCume: H + sobe + 0.12, corre, sobe, beiral: 0.36, fundo: D + 0.74, colunas: 7, fiadas: 2, raio: 0.26 });
  } else {
    // folha da porta: moldura creme, almofada verde e travessas em X, igual dos dois lados
    const s = nome === 'folhaE' ? 1 : -1, lw = hw - 0.012, alt = Pt.altura - 0.04, cx = (s * lw) / 2;
    b.box(lw - 0.06, alt - 0.06, 0.07, P.portaVerde, { p: [cx, 0.05, 0], q: 0.02, seg: 1 });
    b.box(lw, 0.15, 0.12, P.creme, { p: [cx, 0.02, 0], q: 0.045, seg: 1 });
    b.box(lw, 0.15, 0.12, P.creme, { p: [cx, alt - 0.13, 0], q: 0.045, seg: 1 });
    for (const e of [-1, 1]) b.box(0.14, alt, 0.12, P.creme, { p: [cx + e * (lw / 2 - 0.07), 0.02, 0], q: 0.045, seg: 1 });
    const dg = Math.hypot(lw - 0.24, alt - 0.3), a = Math.atan2(lw - 0.24, alt - 0.3) * GRAUS;
    for (const e of [-1, 1]) b.group({ p: [cx, alt / 2 + 0.02, 0], r: [0, 0, e * a] }, () => b.box(0.1, dg, 0.1, P.creme, { p: [0, -dg / 2, 0], q: 0.035, seg: 1 }));
    b.cap(0.035, 0.3, P.metalEscuro, { p: [s * (lw - 0.13), 1.02, 0.075] });
    b.cap(0.035, 0.3, P.metalEscuro, { p: [s * (lw - 0.13), 1.02, -0.075] });
  }
}

// ---------------- poço ----------------
const RAIO_MANIVELA = 0.26;
export function poco(b, nome) {
  if (nome === 'raiz') {
    // anel de pedra: duas fiadas de blocos curvos e gordos, com a junta escura aparecendo entre eles, e a água lá dentro
    b.lathe([[0.6, 0], [0.815, 0], [0.815, 0.76], [0.6, 0.76], [0.6, 0.3]], 20, P.pedraEscura, { n: 18 });
    const NB = 8, passo = (Math.PI * 2) / NB, vao = 0.035, tons = [P.pedra, P.pedraClara, P.pedra, P.pedraMedia];
    for (let f = 0; f < 2; f++) for (let i = 0; i < NB; i++) {
      const a0 = (i + f * 0.5) * passo + 0.3;
      blocoCurvo(b, 0.57, 0.845, f * 0.405, f * 0.405 + 0.39, a0 + vao / 2, a0 + passo - vao / 2, tons[(i * 3 + f * 5) % tons.length], 0.06);
    }
    b.cyl(0.6, 0.6, 0.02, 16, P.aguaFunda, { p: [0, 0.4, 0], q: 0.002 });
    b.cyl(0.32, 0.32, 0.006, 12, P.agua, { p: [0.08, 0.42, -0.06], q: 0.001 });
    // esteios, travessa e telhadinho (alto, para não esconder o balde)
    for (const s of [-1, 1]) b.cyl(0.085, 0.095, 2.42, 10, P.tronco, { p: [0, 0, s * 0.74] });
    b.cap(0.06, 1.7, P.tronco, { p: [0, 2.3, -0.85], r: [90, 0, 0] });
    telhado(b, { yCume: 2.68, corre: 0.52, sobe: 0.33, beiral: 0.24, fundo: 2.2, colunas: 5, fiadas: 1, raio: 0.22 });
  } else if (nome === 'eixo') {
    b.cap(0.05, 1.9, P.tronco, { p: [0, 0, -0.84], r: [90, 0, 0] });
    b.cyl(0.11, 0.11, 0.9, 12, P.madeira, { p: [0, 0, -0.45], r: [90, 0, 0], q: 0.03 });
    for (let i = 0; i < 5; i++) b.add(new THREE.TorusGeometry(0.1, 0.04, 5, 10), i % 2 ? P.corda : P.cordaEscura, { p: [0, 0, -0.152 + i * 0.076] });
    // manivela: braço e pegador
    b.box(0.09, RAIO_MANIVELA + 0.1, 0.07, P.metalEscuro, { p: [0, -0.05, 1.0], q: 0.03, seg: 1 });
    b.cap(0.05, 0.34, P.madeiraClara, { p: [0, RAIO_MANIVELA, 1.0], r: [90, 0, 0] });
  } else if (nome === 'corda') {
    b.cyl(0.02, 0.02, 1, 7, P.corda, { p: [0, -1, 0], q: 0.004 }); // de 0 a -1: a escala em Y dá o comprimento
  } else if (nome === 'balde') {
    // origem na boca do balde; a alça sobe até onde a corda amarra
    b.lathe([[0, -0.27], [0.135, -0.27], [0.155, -0.25], [0.2, -0.03], [0.205, 0], [0.19, 0.012], [0.172, 0], [0.135, -0.22], [0, -0.22]], 14, P.baldeAzul, {});
    b.cyl(0.165, 0.165, 0.012, 12, P.agua, { p: [0, -0.13, 0], q: 0.002 });
    b.cyl(0.208, 0.2, 0.045, 14, P.baldeAzulEscuro, { p: [0, -0.07, 0], q: 0.015 });
    b.tube([[0, -0.02, -0.2], [0, 0.13, -0.11], [0, 0.17, 0], [0, 0.13, 0.11], [0, -0.02, 0.2]], 0.018, 6, P.metalEscuro, {});
  }
}

// ---------------- ninho ----------------
export function ninho(b, nome) {
  const R = TIPOS.ninho.raio;
  if (nome === 'raiz') {
    // anel baixo de palha: um rolo gordo por baixo e gomos grossos trançados por cima
    b.cyl(R - 0.05, R - 0.02, 0.07, 16, P.palhaEscura, { q: 0.02 });
    const anel = []; for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI * 2; anel.push([R - 0.07 + Math.cos(a) * 0.085, 0.1 + Math.sin(a) * 0.085]); }
    b.lathe(anel, 16, P.palhaEscura, {});
    for (let i = 0; i < 11; i++) {
      const a0 = (i / 11) * Math.PI * 2, da = 0.75, r = R - 0.06, pts = [];
      for (let k = 0; k <= 3; k++) { const a = a0 + (da * k) / 3, sobe = Math.sin((k / 3) * Math.PI); pts.push([Math.cos(a) * (r + 0.035 * sobe * (i % 2 ? 1 : -1)), 0.13 + 0.07 * sobe + (i % 3) * 0.012, Math.sin(a) * (r + 0.035 * sobe * (i % 2 ? 1 : -1))]); }
      b.tube(pts, 0.05, 6, i % 2 ? P.palha : P.palhaClara, { steps: 6 });
    }
  } else b.sph(0.088, 0, 0, P.ovo, { p: [0, 0.1, 0], s: [1, 1.28, 1], r: [0, 0, 18] });
}

// ---------------- laranjeira ----------------
const PENCAS = [[-0.57, -0.19, 0.86, 0.1], [-0.39, -0.16, 0.82, 0.13], [-0.5, -0.13, 1.0, 0.12]]; // as mesmas de ../codigo/objetos.js
const RAIO_LARANJA = 0.155;
const COPA = [[0.05, 1.62, -0.1, 1.12], [0.98, 0.92, 0.3, 0.74], [-0.95, 0.95, -0.25, 0.78], [0.2, 0.95, -1.0, 0.76], [0.1, 0.8, 0.85, 0.6]]; // [x, y, z, raio] a partir do osso da copa
// penduradas embaixo da copa, as laranjas ficam na sombra: a cor vai um pouco acima da tinta para continuarem vivas
const LARANJA_NO_PE = new THREE.Color(P.laranja).multiplyScalar(1.22), LARANJA_NO_PE_CLARA = new THREE.Color(P.laranjaClara).multiplyScalar(1.22);
export function arvore(b, nome) {
  if (nome === 'raiz') {
    // tronco afunilado, com o pé alargado
    b.lathe([[0, 0], [0.46, 0], [0.42, 0.06], [0.3, 0.26], [0.24, 0.6], [0.21, 1.2], [0.23, 1.75], [0.27, 2.0], [0, 2.0]], 14, P.tronco, { grad: P.troncoClaro });
    b.cyl(0.1, 0.15, 0.85, 8, P.tronco, { p: [0.05, 1.5, 0], r: [0, 0, -34] });
    b.cyl(0.1, 0.15, 0.85, 8, P.tronco, { p: [-0.05, 1.45, -0.05], r: [-22, 0, 30] });
    b.cyl(0.08, 0.12, 1.05, 8, P.tronco, { p: [0, 1.62, 0.05], r: [52, -4, 0] });
  } else if (nome === 'copa') {
    // copa em poucas massas redondas bem separadas: um domo grande em cima e bolas menores em volta, mais abaixo
    for (const [x, y, z, r] of COPA) b.sph(r, 0, 0, P.folhaEscura, { p: [x, y, z], s: [1, 0.92, 1], grad: P.folhaClara, n: 18 });
  } else if (nome === 'galho') {
    b.sph(0.5, 0, 0, P.folhaEscura, { p: [-0.5, 0.36, 0.8], s: [1, 0.9, 1], grad: P.folhaClara });
  } else {
    const c = PENCAS[+nome[5]][3];
    b.cap(0.02, c + 0.2, P.troncoEscuro, { p: [0, -c, 0], n: 4, nc: 1 });
    b.sph(RAIO_LARANJA, 0, 0, LARANJA_NO_PE, { p: [0, -c - RAIO_LARANJA * 0.9, 0], grad: LARANJA_NO_PE_CLARA });
    b.bola(0.07, P.folhaClara, { p: [0.05, -c + 0.03, 0.02], s: [1, 0.28, 0.6], r: [0, 30, 25] });
  }
}

// ---------------- canteiro e milho ----------------
// almofada de terra alta, de borda bem redonda, com três leiras gordas (os pés de milho ficam nas de fora)
export function canteiroTerra(b) {
  const [w, d] = TIPOS.canteiro.tamanho, lw = w - 0.16, ld = d - 0.16, rl = ld * 0.158;
  b.box(lw, 0.27, ld, P.terraEscura, { q: 0.13, seg: 3 });
  for (const k of [-1, 0, 1]) b.cap(rl, lw - 0.26, P.terra, { p: [-(lw - 0.26) / 2, 0.16, k * ld * 0.29], r: [0, 0, -90], s: [0.74, 1, 1], n: 10, nc: 3 });
}
// Os pés de milho são de peças baratas (cápsulas de poucos gomos e a folha gorda do kit): as quatro fases dos quatro
// lugares de cada canteiro moram na mesma malha, e a que não está à vista fica com escala zero.
function espigaNoPe(b, o) {
  b.group(o, () => {
    b.cap(0.085, 0.36, P.milhoEspiga, { p: [0, 0.04, 0], n: 6, nc: 2 });
    b.folha(0.34, 0.17, P.milhoFolha, { p: [0.055, 0, 0], r: [0, 0, -8], dobra: 25, esp: 0.5 });
    b.folha(0.34, 0.17, P.milhoCaule, { p: [-0.055, 0, 0], r: [0, 180, -8], dobra: 25, esp: 0.5 });
  });
}
export function canteiroPlantas(b, nome) {
  if (nome === 'raiz') return;
  const s = +nome[1], i = +nome[3];
  b.group({ r: [0, i * 67 + s * 30, 0] }, () => {
    if (s === 0) { // semente: uma meia bolinha amarela num montinho
      b.bola(0.13, P.terraClara, { s: [1, 0.42, 1], seg: 7, aneis: 3 });
      b.bola(0.07, P.semente, { p: [0, 0.04, 0], s: [1, 0.8, 1] });
    } else if (s === 1) { // broto: duas folhinhas gordas e uma menor no meio
      b.cap(0.035, 0.14, P.milhoCaule, { n: 5, nc: 1 });
      for (const e of [0, 1]) b.folha(0.34, 0.16, P.milhoFolha, { p: [0, 0.07, 0], r: [0, e * 180, -32], dobra: 50, esp: 0.45 });
      b.folha(0.22, 0.1, P.milhoCaule, { p: [0, 0.1, 0], r: [0, 90, -12], dobra: 30, esp: 0.45 });
    } else { // pé crescendo (0,9 de altura) e pé pronto (1,8, com as espigas)
      const h = s === 2 ? 0.9 : 1.8, nf = s === 2 ? 4 : 6;
      b.cap(s === 2 ? 0.055 : 0.07, h, P.milhoCaule, { n: 6, nc: 1 });
      for (let k = 0; k < nf; k++) b.folha(s === 2 ? 0.55 : 0.8, s === 2 ? 0.18 : 0.23, k % 2 ? P.milhoFolha : P.milhoCaule, { p: [0, h * (0.16 + (k / nf) * 0.66), 0], r: [0, k * 137, -38], dobra: 75 });
      if (s === 3) {
        espigaNoPe(b, { p: [0.07, h * 0.46, 0.02], r: [0, 0, -24] });
        espigaNoPe(b, { p: [-0.06, h * 0.64, -0.03], r: [-10, 0, 26] });
        for (let k = 0; k < 3; k++) b.cap(0.022, 0.3, P.milhoPendao, { p: [0, h - 0.03, 0], r: [k ? 28 : 0, k * 150, 0], n: 4, nc: 1 });
      } else b.folha(0.32, 0.12, P.milhoFolha, { p: [0, h - 0.06, 0], dobra: 20 });
    }
  });
}

// ---------------- projetores de sombra ----------------
// Formas simples que fazem a sombra do celeiro, do poço e da laranjeira no mapa de sombra (ver projetorDeSombra no kit).
// As medidas repetem as dos desenhos de cima, um pouco para dentro.
export const PROJETORES = {
  celeiro: (b) => {
    const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, sobe = 1.45, corre = W / 2, beiral = 0.36, cume = H + sobe + 0.07, meia = corre + beiral - 0.06;
    b.box(W - 0.12, H, D - 0.12, '#000');
    b.ext([[-meia, cume - (sobe * meia) / corre], [meia, cume - (sobe * meia) / corre], [0, cume]], D + 0.62, '#000');
  },
  poco: (b) => {
    b.lathe([[0.6, 0.02], [0.82, 0.02], [0.82, 0.78], [0.6, 0.78], [0.6, 0.02]], 12, '#000');
    for (const s of [-1, 1]) b.box(0.14, 2.4, 0.14, '#000', { p: [0, 0, s * 0.74] });
    b.ext([[-0.72, 2.63 - (0.33 * 0.72) / 0.52], [0.72, 2.63 - (0.33 * 0.72) / 0.52], [0, 2.63]], 2.1, '#000');
    b.box(0.16, 0.16, 1.7, '#000', { p: [0, 1.12, 0.1] });
  },
  arvore: (b) => {
    b.cyl(0.21, 0.4, 2.0, 7, '#000');
    for (const [x, y, z, r] of COPA) b.sph(r * 0.95, 12, 7, '#000', { p: [x, 1.6 + y, z], s: [1, 0.92, 1] });
    b.sph(0.46, 10, 6, '#000', { p: [-0.5, 0.85 + 0.36, 0.72 + 0.8] });
  },
};

// ---------------- objetos de mão ----------------
function caixote(b, recheio) {
  // origem no meio da caixa, como no conjunto "codigo" (ele segura pelos lados)
  b.group({ p: [0, -0.16, 0], s: 0.9 }, () => {
    const w = 0.64, d = 0.46, h = 0.3;
    b.box(w - 0.04, 0.045, d - 0.04, P.caixoteEscuro, { q: 0.015, seg: 1 });
    for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) b.box(w - 0.02, 0.105, 0.045, P.caixote, { p: [0, 0.035 + i * 0.14, sz * (d / 2 - 0.022)], q: 0.02, seg: 1 });
    for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) b.box(0.045, 0.105, d - 0.02, P.caixote, { p: [sx * (w / 2 - 0.022), 0.035 + i * 0.14, 0], q: 0.02, seg: 1 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.075, h + 0.02, 0.075, P.caixoteClaro, { p: [sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)], q: 0.025, seg: 1 });
    if (recheio === 'milho') {
      for (let i = 0; i < 3; i++) { b.cap(0.075, 0.34, P.milhoEspiga, { p: [-0.2 + i * 0.2, 0.13, 0.13], r: [-62, 20 - i * 20, 0] }); b.cap(0.065, 0.26, P.milhoFolha, { p: [-0.13 + i * 0.2, 0.12, 0.12], r: [-58, 20 - i * 20, 0], s: [0.45, 1, 1] }); }
    } else if (recheio === 'laranja') {
      for (const [x, y, z] of [[-0.17, 0.18, -0.07], [0.02, 0.19, 0.08], [0.19, 0.18, -0.06], [-0.06, 0.3, -0.03], [0.1, 0.3, 0.02]]) b.sph(0.105, 0, 0, P.laranja, { p: [x, y, z], grad: P.laranjaClara });
    } else if (recheio === 'ovo') {
      b.box(w - 0.12, 0.12, d - 0.12, P.palha, { p: [0, 0.05, 0], q: 0.05, seg: 1 });
      for (let i = 0; i < 3; i++) b.sph(0.075, 0, 0, P.ovo, { p: [-0.17 + i * 0.17, 0.25, i % 2 ? -0.05 : 0.05], s: [1, 1.25, 1] });
    } else { // leite: duas garrafas de corpo cor de marfim e tampa azul
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
    b.cyl(0.075, 0.075, 0.012, 12, P.regadorEscuro, { p: [0, 0.2, 0], q: 0.003 });
    b.cyl(0.026, 0.04, 0.32, 8, P.regador, { p: [0, 0.04, 0.09], r: [58, 0, 0], q: 0.01 });
    b.cyl(0.066, 0.04, 0.045, 10, P.crivo, { p: [0, 0.2, 0.345], r: [58, 0, 0], q: 0.012 });
    b.tube([[0, 0.17, -0.07], [0, 0.31, -0.08], [0, 0.31, -0.2], [0, 0.08, -0.13]], 0.022, 6, P.regador, {});
  }),
  // banquinho de três pernas grossas
  banquinho: (b) => {
    b.cyl(0.2, 0.2, 0.07, 14, P.madeiraClara, { p: [0, 0.2, 0], q: 0.03 });
    for (let i = 0; i < 3; i++) b.cap(0.042, 0.26, P.madeira, { p: [Math.cos(i * 2.09) * 0.13, -0.02, Math.sin(i * 2.09) * 0.13], r: [Math.sin(i * 2.09) * -10, 0, Math.cos(i * 2.09) * 10] });
  },
  // espiga colhida: cápsula amarela com duas folhas de palha
  espiga: (b) => b.group({ p: [0, -0.1, 0.04], r: [20, 0, 0] }, () => {
    b.cap(0.048, 0.22, P.milhoEspiga, {});
    for (const e of [-1, 1]) b.cap(0.045, 0.17, P.milhoFolha, { p: [e * 0.03, -0.03, 0], r: [0, 0, e * 18], s: [0.45, 1, 1] });
  }),
  caixaMilho: (b) => caixote(b, 'milho'), caixaLeite: (b) => caixote(b, 'leite'), caixaOvo: (b) => caixote(b, 'ovo'), caixaLaranja: (b) => caixote(b, 'laranja'),
  // saquinho de sementes; origem na boca
  saco: (b) => {
    b.sph(0.105, 0, 0, P.saco, { p: [0, -0.1, 0], s: [1, 1.12, 0.86] });
    b.cyl(0.08, 0.066, 0.05, 10, P.sacoEscuro, { p: [0, -0.03, 0], q: 0.015 });
    b.cyl(0.062, 0.062, 0.012, 10, P.semente, { p: [0, 0.014, 0], q: 0.004 });
  },
  // balde de leite cinza, de parede grossa; origem no fundo
  balde: (b) => {
    b.lathe([[0, 0], [0.13, 0], [0.148, 0.018], [0.19, 0.235], [0.192, 0.25], [0.18, 0.262], [0.166, 0.25], [0.13, 0.04], [0, 0.04]], 14, P.metal, {});
    b.cyl(0.198, 0.192, 0.04, 14, P.metalEscuro, { p: [0, 0.2, 0], q: 0.014 });
    b.tube([[-0.19, 0.24, 0], [-0.14, 0.33, 0.02], [0, 0.37, 0.03], [0.14, 0.33, 0.02], [0.19, 0.24, 0]], 0.016, 6, P.metalEscuro, {});
  },
  leite: (b) => b.cyl(1, 1, 0.01, 14, P.leite, { q: 0.002 }), // a superfície do leite dentro do balde (a animação dá o tamanho)
  ovo: (b) => b.sph(0.07, 0, 0, P.ovo, { s: [1, 1.28, 1] }),
  laranja: (b) => { b.sph(0.104, 0, 0, P.laranja, { grad: P.laranjaClara }); b.sph(0.06, 0, 0, P.folhaClara, { p: [0.03, 0.1, 0], s: [1, 0.28, 0.6], r: [0, 30, 25] }); },
};
