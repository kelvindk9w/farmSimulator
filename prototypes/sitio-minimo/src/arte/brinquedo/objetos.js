// Conjunto "brinquedo": o desenho das construções, das plantas e dos objetos de mão.
// Só o DESENHO mora aqui. Os esqueletos (nomes e posições dos ossos) e toda a animação são os de ../codigo/objetos.js:
// cada função abaixo desenha as peças de um osso, em coordenadas locais do osso, com as formas arredondadas do kit.
// Referências: arte/estilo/rodada-02/folha-construcoes.png, folha-plantio.png e notas-de-construcao.md.
import { TIPOS } from '../../jogo/contrato.js';
import { acaso } from '../codigo/base.js';
import { P } from './kit.js';

const GRAUS = 180 / Math.PI;

// Telhado de duas águas com telhas gordas: fileiras de meias cápsulas descendo a água, cada telha um pouco por cima da de baixo.
// A cumeeira corre ao longo de Z, na altura yCume.
function telhado(b, { yCume, corre, sobe, beiral, fundo, colunas, fiadas, raio = 0.2 }) {
  const k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2);
  const lw = fundo / colunas, lf = comp / fiadas;
  for (const s of [-1, 1]) {
    b.group({ p: [0, yCume, 0], r: [0, 0, -s * ang] }, () => {
      b.box(comp + 0.04, 0.12, fundo - 0.16, P.telhaEscura, { p: [(s * comp) / 2, -0.2, 0], q: 0.05, seg: 1 });
      for (let i = 0; i < colunas; i++) for (let j = 0; j < fiadas; j++) {
        b.cap(raio, lf + raio * 1.25, (i * 3 + j * 2) % 7 === 0 ? P.telhaClara : P.telha, { p: [s * (j * lf - raio * 0.15), -0.1, -fundo / 2 + (i + 0.5) * lw], r: [0, 0, -s * 85.5], s: [0.78, 1, lw / (2 * raio) * 1.04] });
      }
    });
  }
  // cumeeira: uma telha gorda deitada
  b.cap(raio * 1.05, fundo + 0.24, P.telha, { p: [0, yCume + 0.02, -(fundo + 0.24) / 2], r: [90, 0, 0] });
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
    telhado(b, { yCume: H + sobe + 0.1, corre, sobe, beiral: 0.36, fundo: D + 0.74, colunas: 8, fiadas: 3, raio: 0.22 });
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
    // anel de pedra grosso e arredondado, com a água lá dentro
    b.lathe([[0.72, 0], [0.82, 0.05], [0.84, 0.2], [0.84, 0.66], [0.8, 0.77], [0.7, 0.82], [0.62, 0.8], [0.57, 0.73], [0.57, 0.2]], 20, P.pedra, {});
    b.cyl(0.6, 0.6, 0.02, 16, P.aguaFunda, { p: [0, 0.4, 0], q: 0.002 });
    b.cyl(0.32, 0.32, 0.006, 12, P.agua, { p: [0.08, 0.42, -0.06], q: 0.001 });
    // poucos blocos grandes, um pouco saltados
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4, alto = i % 2; b.box(0.36, 0.2, 0.08, alto ? P.pedraEscura : P.pedraClara, { p: [Math.sin(a) * 0.815, alto ? 0.42 : 0.14, Math.cos(a) * 0.815], r: [0, a * GRAUS, 0], q: 0.04, seg: 1 }); }
    // esteios, travessa e telhadinho (alto, para não esconder o balde)
    for (const s of [-1, 1]) b.cyl(0.085, 0.095, 2.42, 10, P.tronco, { p: [0, 0, s * 0.74] });
    b.cap(0.06, 1.7, P.tronco, { p: [0, 2.3, -0.85], r: [90, 0, 0] });
    telhado(b, { yCume: 2.66, corre: 0.5, sobe: 0.312, beiral: 0.2, fundo: 2.1, colunas: 5, fiadas: 2, raio: 0.2 });
  } else if (nome === 'eixo') {
    b.cap(0.05, 1.9, P.tronco, { p: [0, 0, -0.84], r: [90, 0, 0] });
    b.cyl(0.11, 0.11, 0.9, 12, P.madeira, { p: [0, 0, -0.45], r: [90, 0, 0], q: 0.03 });
    for (let i = 0; i < 5; i++) b.cyl(0.128, 0.128, 0.075, 12, i % 2 ? P.corda : P.cordaEscura, { p: [0, 0, -0.19 + i * 0.076], r: [90, 0, 0], q: 0.03 });
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
const RAIO_LARANJA = 0.13;
export function arvore(b, nome) {
  if (nome === 'raiz') {
    // tronco afunilado, com o pé alargado
    b.lathe([[0, 0], [0.46, 0], [0.42, 0.06], [0.3, 0.26], [0.24, 0.6], [0.21, 1.2], [0.23, 1.75], [0.27, 2.0], [0, 2.0]], 14, P.tronco, { grad: P.troncoClaro });
    b.cyl(0.1, 0.15, 0.85, 8, P.tronco, { p: [0.05, 1.5, 0], r: [0, 0, -34] });
    b.cyl(0.1, 0.15, 0.85, 8, P.tronco, { p: [-0.05, 1.45, -0.05], r: [-22, 0, 30] });
    b.cyl(0.08, 0.12, 1.05, 8, P.tronco, { p: [0, 1.62, 0.05], r: [52, -4, 0] });
  } else if (nome === 'copa') {
    // copa em poucas massas redondas, mais claras em cima
    const bolas = [[0, 1.42, -0.05, 1.3], [0.9, 1.0, 0.3, 0.92], [-0.85, 0.98, -0.15, 0.98], [0.1, 1.05, -0.9, 0.9], [-0.25, 1.15, 0.66, 0.8], [0.2, 2.12, 0.0, 0.84]];
    for (const [x, y, z, r] of bolas) b.sph(r, 0, 0, P.folhaEscura, { p: [x, y, z], s: [1, 0.9, 1], grad: P.folhaClara });
  } else if (nome === 'galho') {
    b.sph(0.52, 0, 0, P.folhaEscura, { p: [-0.5, 0.33, 0.8], s: [1, 0.86, 1], grad: P.folhaClara });
    b.sph(0.32, 0, 0, P.folha, { p: [-0.82, 0.2, 1.0], s: [1, 0.8, 1], grad: P.folhaClara });
  } else {
    const c = PENCAS[+nome[5]][3];
    b.cyl(0.018, 0.018, c + 0.2, 6, P.troncoEscuro, { p: [0, -c, 0], q: 0.005 });
    b.sph(RAIO_LARANJA, 0, 0, P.laranja, { p: [0, -c - RAIO_LARANJA * 0.9, 0], grad: P.laranjaClara });
    b.sph(0.07, 0, 0, P.folhaClara, { p: [0.05, -c + 0.03, 0.02], s: [1, 0.28, 0.6], r: [0, 30, 25] });
  }
}

// ---------------- canteiro e milho ----------------
// almofada de terra com três leiras largas (os pés de milho ficam em cima das de fora)
export function canteiroTerra(b) {
  const [w, d] = TIPOS.canteiro.tamanho, lw = w - 0.2, ld = d - 0.2;
  b.box(lw, 0.19, ld, P.terraEscura, { q: 0.085, seg: 3 });
  for (const z of [-0.39, 0, 0.39]) b.cap(0.18, lw - 0.26, P.terra, { p: [-(lw - 0.26) / 2, 0.14, z], r: [0, 0, -90], s: [0.5, 1, 1] });
}
// folha gorda: uma cápsula achatada que nasce na origem, sobe inclinada e dobra para fora
function folha(b, comp, larg, cor, o) {
  b.group(o, () => {
    b.cap(larg / 2, comp * 0.62, cor, { s: [1, 1, 0.34] });
    b.cap(larg / 2 * 0.9, comp * 0.5, cor, { p: [0, comp * 0.5, 0], r: [0, 0, -38], s: [1, 1, 0.34] });
  });
}
function espigaNoPe(b, o) {
  b.group(o, () => {
    b.cap(0.085, 0.36, P.milhoEspiga, { p: [0, 0.04, 0] });
    b.cap(0.075, 0.3, P.milhoFolha, { p: [0.045, 0, 0], r: [0, 0, -14], s: [0.5, 1, 1] });
    b.cap(0.075, 0.3, P.milhoCaule, { p: [-0.045, 0, 0], r: [0, 0, 14], s: [0.5, 1, 1] });
  });
}
export function canteiroPlantas(b, nome) {
  if (nome === 'raiz') return;
  const s = +nome[1], i = +nome[3];
  b.group({ r: [0, i * 67 + s * 30, 0] }, () => {
    if (s === 0) { // semente: uma meia bolinha amarela num montinho
      b.sph(0.13, 0, 0, P.terraClara, { s: [1, 0.42, 1] });
      b.sph(0.07, 0, 0, P.semente, { p: [0, 0.04, 0], s: [1, 0.8, 1] });
    } else if (s === 1) { // broto: duas folhinhas gordas
      b.cyl(0.03, 0.04, 0.12, 7, P.milhoCaule, {});
      for (const e of [-1, 1]) b.cap(0.075, 0.3, P.milhoFolha, { p: [0, 0.08, 0], r: [0, 0, e * 42], s: [1, 1, 0.4] });
      b.cap(0.05, 0.2, P.milhoCaule, { p: [0, 0.1, 0], r: [30, 0, 0], s: [1, 1, 0.4] });
    } else { // pé crescendo (0,9 de altura) e pé pronto (1,8, com as espigas)
      const h = s === 2 ? 0.9 : 1.8, nf = s === 2 ? 4 : 6;
      b.cyl(s === 2 ? 0.05 : 0.06, s === 2 ? 0.065 : 0.085, h, 8, P.milhoCaule, {});
      for (let k = 0; k < nf; k++) folha(b, s === 2 ? 0.5 : 0.72, s === 2 ? 0.17 : 0.21, k % 2 ? P.milhoFolha : P.milhoCaule, { p: [0, h * (0.18 + (k / nf) * 0.66), 0], r: [0, k * 137, -40] });
      if (s === 3) {
        espigaNoPe(b, { p: [0.07, h * 0.46, 0.02], r: [0, 0, -24] });
        espigaNoPe(b, { p: [-0.06, h * 0.64, -0.03], r: [-10, 0, 26] });
        for (let k = 0; k < 3; k++) b.cap(0.022, 0.3, P.milhoPendao, { p: [0, h - 0.03, 0], r: [k ? 28 : 0, k * 150, 0] });
      } else b.cap(0.05, 0.3, P.milhoFolha, { p: [0, h - 0.06, 0], s: [1, 1, 0.4] });
    }
  });
}

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
export { acaso };
