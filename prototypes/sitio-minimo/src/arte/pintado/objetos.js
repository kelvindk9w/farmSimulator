// Conjunto "pintado": o desenho das construções, das plantas e dos objetos de mão.
// Só o DESENHO mora aqui. Os esqueletos (nomes e posições dos ossos) e toda a animação são os de ../codigo/objetos.js:
// cada função abaixo desenha as peças de um osso, em coordenadas locais do osso. As formas partem das do conjunto
// "brinquedo"; o que muda é que cada peça diz qual textura pintada usa (pela cor, ver P no kit) e como a pintura assenta.
import * as THREE from 'three';
import { TIPOS } from '../../jogo/contrato.js';
import { P, tom } from './kit.js';
import { PROJETORES as DO_BRINQUEDO } from '../brinquedo/objetos.js';
import { desenharCerca } from './cenario.js';

const GRAUS = 180 / Math.PI, TAU = Math.PI * 2;

// Pedaços da textura "telha" e da textura "pedra" que têm uma telha ou um bloco inteiro pintado ([u0, v0, u1, v1]).
const TELHAS = [];
for (const [v0, v1] of [[0.7, 0.995], [0.365, 0.69], [0.03, 0.355]]) for (const u0 of [0.005, 0.25, 0.505, 0.76]) TELHAS.push([u0, v0, u0 + 0.24, v1]);
const PEDRAS = [[0.35, 0.76, 0.695, 1.0], [0.17, 0.505, 0.565, 0.76], [0.565, 0.505, 0.96, 0.76], [0.32, 0.25, 0.73, 0.5], [0.14, 0.0, 0.54, 0.25], [0.54, 0.0, 0.945, 0.25], [0, 0.76, 0.35, 1.0], [0, 0.25, 0.325, 0.5]];

// Uma telha de barro: chapa em arco que desce de x = 0 (o alto, que entra debaixo da fiada de cima) até x = comp (a
// boca, mais levantada, com a espessura à mostra). A pintura da telha (escura no alto, clara na boca) cai certinha nela.
function telha(b, comp, larg, arco, sobe, esp, k, o) {
  const [u0, v0, u1, v1] = TELHAS[k % TELHAS.length], N = 4, pos = [], uvs = [], idx = [], vBoca = v0 + (v1 - v0) * 0.17;
  for (let i = 0; i <= N; i++) {
    const t = i / N, z = (t - 0.5) * larg, y = arco * Math.sin(Math.PI * t) ** 0.75, u = u0 + (u1 - u0) * t;
    pos.push(0, y, z, comp, y + sobe, z, comp + esp * 0.25, y + sobe - esp, z); uvs.push(u, v1, u, vBoca, u, v0);
  }
  for (let i = 0; i < N; i++) { const a = i * 3, c = a + 3; idx.push(a, c, a + 1, a + 1, c, c + 1, a + 1, c + 1, a + 2, a + 2, c + 1, c + 2); }
  return b.solta(pos, uvs, idx, P.telha, o);
}
// Telhado de duas águas com a cumeeira ao longo de z, na altura yCume: fiadas de telhas grandes, cada fiada por cima da
// de baixo, capas de cumeeira e as tábuas do beiral nas duas pontas.
function telhado(b, { yCume, corre, sobe, beiral, fundo, colunas, fiadas, arco = 0.11, tabua = true }) {
  const k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre) * GRAUS, comp = Math.hypot(corre + beiral, sobe * k2);
  const lw = fundo / colunas, lf = comp / fiadas, passa = lf * 0.2;
  let k = 0;
  for (const s of [-1, 1]) {
    b.group({ p: [0, yCume, 0], r: [0, 0, -s * ang] }, () => {
      // forro escuro por baixo das telhas (fecha as frestas)
      b.box(comp, 0.1, fundo - 0.1, tom(P.telhaEscura, 0.55), { p: [(s * comp) / 2, -0.19, 0], q: 0.02, seg: 1 });
      for (let j = 0; j < fiadas; j++) for (let i = 0; i < colunas; i++, k++) {
        const ini = j * lf - (j ? passa : 0), len = lf + (j ? passa : 0) + (j === fiadas - 1 ? 0.06 : 0);
        // cada telha com o seu tom: umas mais escuras e arroxeadas, outras mais claras e alaranjadas
        const t = 0.8 + 0.3 * (((k * 7919) % 13) / 12), cor = (g) => { const c = g.attributes.color; for (let q = 0; q < c.count; q++) c.setXYZ(q, c.getX(q) * t, c.getY(q) * t * (0.9 + 0.1 * t), c.getZ(q) * t * (1.25 - 0.25 * t)); };
        telha(b, len, lw * 1.04, arco, 0.07, 0.085, k * 5 + j, { p: [s * ini, -0.13, -fundo / 2 + (i + 0.5) * lw], s: [s, 1, 1], pintar: cor });
      }
      // tábua do beiral, por baixo da ponta das telhas, nas duas empenas
      if (tabua) for (const e of [-1, 1]) b.box(comp + 0.05, 0.17, 0.07, P.madeiraEscura, { p: [(s * comp) / 2, -0.33, e * (fundo / 2 - 0.06)], q: 0.02, seg: 1 });
    });
  }
  // cumeeira: capas em arco, uma depois da outra
  const nc = Math.max(3, Math.round(fundo / 0.62)), lc = (fundo + 0.1) / nc;
  for (let i = 0; i < nc; i++) telha(b, lc + 0.06, 0.52, 0.2, 0.035, 0.07, i * 3 + 1, { p: [0, yCume - 0.07, fundo / 2 + 0.05 - i * lc], r: [0, 90, 0] });
}

// bloco de pedra curvo (um pedaço de anel de cantos arredondados): raios r0..r1, alturas y0..y1, ângulos a0..a1
function blocoCurvo(b, r0, r1, y0, y1, a0, a1, cor, q, k) {
  const pts = [], canto = (cx, cy, g0) => { for (let i = 0; i <= 1; i++) { const g = (g0 + i * 90) / GRAUS; pts.push(new THREE.Vector2(cx + Math.cos(g) * q, cy + Math.sin(g) * q)); } };
  canto(r0 + q, y0 + q, 180); canto(r1 - q, y0 + q, 270); canto(r1 - q, y1 - q, 0); canto(r0 + q, y1 - q, 90); pts.push(pts[0].clone());
  return b.add(new THREE.LatheGeometry(pts, 3, a0, a1 - a0), cor, { uv: { modo: 'cil', fase: a0, voltas: TAU / (a1 - a0), rect: PEDRAS[k % PEDRAS.length], m: 0.01 } });
}
// bloco de pedra reto, com um bloco inteiro da pintura em cada face
const bloco = (b, w, h, d, cor, k, o) => b.box(w, h, d, cor, { q: 0.055, seg: 1, ...o, uv: { rect: PEDRAS[k % PEDRAS.length], m: 0.01, fixo: [0, 0] } });
const TONS_DE_PEDRA = [P.pedra, P.pedraClara, P.pedra, P.pedraEscura, P.pedraClara];

// ---------------- celeiro ----------------
export function celeiro(b, nome) {
  const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, Pt = TIPOS.celeiro.porta, hw = Pt.largura / 2, fz = D / 2;
  const sobe = 1.45, corre = W / 2, emPe = { veio: 'y' };
  if (nome === 'raiz') {
    const dentro = P.interior;
    // por dentro é escuro: chão, fundo, lados, forro; e uns fardos de feno
    b.box(W - 0.3, 0.02, D - 0.24, P.chaoDoCeleiro, { p: [0, 0.002, 0], q: 0.004, seg: 1 });
    b.box(W - 0.3, H, 0.06, dentro, { p: [0, 0, -fz + 0.2], q: 0.01, seg: 1 });
    for (const s of [-1, 1]) b.box(0.06, H, D - 0.3, dentro, { p: [s * (W / 2 - 0.2), 0, 0], q: 0.01, seg: 1 });
    b.box(W - 0.3, 0.06, D - 0.3, dentro, { p: [0, H - 0.05, 0], q: 0.01, seg: 1 });
    for (const s of [-1, 1]) b.box(W / 2 - hw - 0.16, H, 0.05, dentro, { p: [s * (hw + (W / 2 - hw - 0.16) / 2 + 0.02), 0, fz - 0.2], q: 0.01, seg: 1 });
    b.box(0.85, 0.46, 0.52, P.palha, { p: [-1.0, 0, -0.9], q: 0.09, seg: 2 });
    b.box(0.8, 0.44, 0.5, P.palhaEscura, { p: [0.9, 0, -0.95], r: [0, -6, 0], q: 0.09, seg: 2 });
    b.box(0.75, 0.42, 0.48, P.palha, { p: [-0.85, 0.46, -0.95], r: [0, 10, 0], q: 0.09, seg: 2 });
    // paredes que a câmera nunca vê (fundo e lado esquerdo): uma placa cada, só para fechar a casa
    b.box(W, H, 0.14, P.madeiraEscura, { p: [0, 0, -fz + 0.07], q: 0.03, seg: 1, uv: emPe });
    b.box(0.14, H, D, P.madeiraEscura, { p: [-W / 2 + 0.07, 0, 0], q: 0.03, seg: 1, uv: emPe });
    // parede da direita: tábuas largas em pé (cada caixa pega uma tábua inteira da pintura), sobre um fundo escuro
    const nt = 6, lt = (D - 0.04) / nt, tons = [1, 0.9, 1.06, 0.95, 1.02, 0.88];
    b.box(0.06, H - 0.04, D - 0.12, P.madeiraFunda, { p: [W / 2 - 0.11, 0, 0], q: 0.01, seg: 1 });
    for (let i = 0; i < nt; i++) b.box(0.13, H, lt - 0.025, tom(P.madeira, tons[i]), { p: [W / 2 - 0.065, 0, -fz + 0.02 + (i + 0.5) * lt], q: 0.03, seg: 1, uv: emPe });
    // parede da frente: duas tábuas de cada lado da porta e uma faixa em cima
    const lf = (W / 2 - hw - 0.02) / 2;
    b.box(W - 0.12, H - 0.04, 0.06, P.madeiraFunda, { p: [0, Pt.altura + 0.02, fz - 0.11], q: 0.01, seg: 1, s: [1, (H - Pt.altura) / (H - 0.04), 1] });
    for (const s of [-1, 1]) {
      b.box(W / 2 - hw - 0.1, H - 0.04, 0.06, P.madeiraFunda, { p: [s * (hw + (W / 2 - hw) / 2), 0, fz - 0.11], q: 0.01, seg: 1 });
      for (let i = 0; i < 2; i++) b.box(lf - 0.025, H, 0.13, tom(P.madeira, tons[i + (s > 0 ? 2 : 0)]), { p: [s * (hw + 0.02 + (i + 0.5) * lf), 0, fz - 0.065], q: 0.03, seg: 1, uv: emPe });
    }
    for (let i = 0; i < 4; i++) b.box(Pt.largura / 4 - 0.025, H - Pt.altura, 0.13, tom(P.madeira, tons[i + 1]), { p: [-hw + (i + 0.5) * (Pt.largura / 4), Pt.altura, fz - 0.065], q: 0.03, seg: 1, uv: emPe });
    // cunhais: uma tábua mais escura em cada quina que a câmera vê
    for (const [x, z] of [[W / 2 - 0.03, fz - 0.03], [-W / 2 + 0.03, fz - 0.03], [W / 2 - 0.03, -fz + 0.03]]) b.box(0.2, H, 0.2, P.madeiraEscura, { p: [x, 0, z], q: 0.04, seg: 1, uv: emPe });
    // empenas (frente e fundo), em duas metades para as tábuas ficarem da largura das de baixo, e a janelinha do paiol
    for (const s of [-1, 1]) for (const e of [-1, 1]) b.ext([[0, 0], [e * corre, 0], [0, sobe]], 0.13, tom(P.madeira, e > 0 ? 1.04 : 0.96), { p: [0, H - 0.01, s * (fz - 0.065)], q: 0.03, uv: emPe });
    b.box(W + 0.12, 0.15, 0.2, P.madeiraEscura, { p: [0, H - 0.1, fz - 0.02], q: 0.04, seg: 1 }); // frechal: a viga entre a parede e a empena
    b.box(0.6, 0.5, 0.06, P.interior, { p: [0, H + 0.26, fz - 0.02], q: 0.02, seg: 1 });
    for (const [x, y, lw, lh] of [[0, 0.18, 0.84, 0.1], [0, 0.74, 0.84, 0.1], [-0.37, 0.22, 0.1, 0.58], [0.37, 0.22, 0.1, 0.58]]) b.box(lw, lh, 0.12, P.madeiraEscura, { p: [x, H + y, fz - 0.01], q: 0.035, seg: 1 });
    // batentes e verga da porta
    for (const s of [-1, 1]) b.box(0.15, Pt.altura + 0.08, 0.16, P.madeiraEscura, { p: [s * (hw + 0.075), 0, fz - 0.03], q: 0.045, seg: 1 });
    b.box(Pt.largura + 0.44, 0.18, 0.2, P.madeiraEscura, { p: [0, Pt.altura, fz - 0.02], q: 0.05, seg: 1 });
    // baldrame: blocos de pedra nas duas paredes que a câmera vê (menos no vão da porta) e uma barra nas outras
    let k = 0;
    const nb = 6, lb = (D + 0.3) / nb;
    for (let i = 0; i < nb; i++, k++) bloco(b, 0.26, 0.33, lb - 0.02, TONS_DE_PEDRA[k % 5], k, { p: [W / 2 + 0.03, 0, -fz - 0.15 + (i + 0.5) * lb] });
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++, k++) { const lw = (W / 2 - hw + 0.02) / 2; bloco(b, lw - 0.02, 0.33, 0.26, TONS_DE_PEDRA[k % 5], k + 2, { p: [s * (hw + 0.14 + (i + 0.5) * lw), 0, fz + 0.03] }); }
    b.box(0.2, 0.3, D + 0.2, P.pedraEscura, { p: [-W / 2 - 0.02, 0, 0], q: 0.06, seg: 1 });
    b.box(W + 0.2, 0.3, 0.2, P.pedraEscura, { p: [0, 0, -fz - 0.02], q: 0.06, seg: 1 });
    telhado(b, { yCume: H + sobe + 0.12, corre, sobe, beiral: 0.36, fundo: D + 0.74, colunas: 7, fiadas: 4 });
  } else {
    // folha da porta: almofada verde de tábuas em pé, moldura creme e travessas em X, igual dos dois lados
    const s = nome === 'folhaE' ? 1 : -1, lw = hw - 0.012, alt = Pt.altura - 0.04, cx = (s * lw) / 2;
    b.box(lw - 0.06, alt - 0.06, 0.07, P.portaVerde, { p: [cx, 0.05, 0], q: 0.02, seg: 1, uv: emPe });
    b.box(lw, 0.2, 0.12, P.creme, { p: [cx, 0.02, 0], q: 0.04, seg: 1 });
    b.box(lw, 0.2, 0.12, P.creme, { p: [cx, alt - 0.18, 0], q: 0.04, seg: 1 });
    for (const e of [-1, 1]) b.box(0.19, alt, 0.12, e * s > 0 ? P.creme : P.cremeEscuro, { p: [cx + e * (lw / 2 - 0.095), 0.02, 0], q: 0.04, seg: 1, uv: emPe });
    const dg = Math.hypot(lw - 0.3, alt - 0.34), a = Math.atan2(lw - 0.3, alt - 0.34) * GRAUS;
    for (const e of [-1, 1]) b.group({ p: [cx, alt / 2 + 0.02, 0], r: [0, 0, e * a] }, () => b.box(0.15, dg, 0.1, e > 0 ? P.creme : P.cremeEscuro, { p: [0, -dg / 2, 0], q: 0.03, seg: 1, uv: emPe }));
    // dobradiças de ferro no lado de fora e o puxador no meio
    for (const y of [0.42, alt - 0.5]) for (const z of [0.065, -0.065]) b.add(new THREE.BoxGeometry(0.24, 0.07, 0.025), P.ferro, { p: [s * 0.1, y, z] });
    for (const z of [0.075, -0.075]) b.cap(0.03, 0.28, P.ferro, { p: [s * (lw - 0.13), 1.02, z], n: 6, nc: 1 });
  }
}

// ---------------- poço ----------------
const RAIO_MANIVELA = 0.26;
export function poco(b, nome) {
  if (nome === 'raiz') {
    // anel de pedra: três fiadas de blocos curvos e gordos, com a junta escura aparecendo entre eles, e a água lá dentro
    b.lathe([[0.6, 0], [0.815, 0], [0.815, 0.7], [0.6, 0.7], [0.6, 0.3]], 20, P.junta, { n: 18 });
    const NB = 9, passo = TAU / NB, vao = 0.045, AF = 0.76 / 3;
    let k = 0;
    for (let f = 0; f < 3; f++) for (let i = 0; i < NB; i++, k++) {
      const a0 = (i + f * 0.5) * passo + 0.3;
      blocoCurvo(b, 0.575, 0.85, f * AF + 0.012, (f + 1) * AF - 0.012, a0 + vao / 2, a0 + passo - vao / 2, f === 2 ? tom(TONS_DE_PEDRA[(i * 3 + f) % 5], 1.06) : TONS_DE_PEDRA[(i * 3 + f * 2) % 5], 0.05, k);
    }
    b.cyl(0.6, 0.6, 0.02, 16, P.aguaFunda, { p: [0, 0.4, 0], q: 0.002 });
    b.cyl(0.34, 0.34, 0.006, 12, P.agua, { p: [0.08, 0.42, -0.06], q: 0.001 });
    // esteios quadrados, travessa e telhadinho (alto, para não esconder o balde)
    for (const s of [-1, 1]) {
      b.box(0.17, 2.42, 0.17, P.cerca, { p: [0, 0, s * 0.74], q: 0.03, seg: 1, uv: { veio: 'y', m: [1.2, 2.6] } });
      // mãos-francesas: do esteio para a travessa do telhado
      for (const e of [-1, 1]) b.box(0.09, 0.5, 0.09, P.madeiraEscura, { p: [e * 0.05, 1.86, s * 0.74], r: [0, 0, e * -42], q: 0.02, seg: 1 });
    }
    for (const s of [-1, 1]) b.box(0.8, 0.11, 0.11, P.madeiraEscura, { p: [0, 2.14, s * 0.74], q: 0.02, seg: 1 }); // travessa curta e baixa: a ponta não pode furar as telhas
    telhado(b, { yCume: 2.7, corre: 0.52, sobe: 0.34, beiral: 0.26, fundo: 2.16, colunas: 4, fiadas: 2, arco: 0.1 });
  } else if (nome === 'eixo') {
    b.cap(0.05, 1.9, P.madeiraEscura, { p: [0, 0, -0.84], r: [90, 0, 0], uv: { modo: 'cil' } });
    b.cyl(0.11, 0.11, 0.9, 12, P.madeira, { p: [0, 0, -0.45], r: [90, 0, 0], q: 0.03, uv: { modo: 'cil' } });
    for (let i = 0; i < 5; i++) b.add(new THREE.TorusGeometry(0.1, 0.04, 4, 9), i % 2 ? P.corda : P.cordaEscura, { p: [0, 0, -0.152 + i * 0.076] });
    // manivela: braço de ferro e pegador de madeira
    b.box(0.09, RAIO_MANIVELA + 0.1, 0.07, P.ferroClaro, { p: [0, -0.05, 1.0], q: 0.03, seg: 1 });
    b.cap(0.055, 0.36, P.madeiraClara, { p: [0, RAIO_MANIVELA, 1.0], r: [90, 0, 0], uv: { modo: 'cil' } });
  } else if (nome === 'corda') {
    b.cyl(0.022, 0.022, 1, 7, P.corda, { p: [0, -1, 0], q: 0.004 }); // de 0 a -1: a escala em Y dá o comprimento
  } else if (nome === 'balde') {
    // balde de aduelas de madeira com dois aros de ferro; origem na boca; a alça sobe até onde a corda amarra
    b.lathe([[0, -0.27], [0.135, -0.27], [0.155, -0.25], [0.2, -0.03], [0.205, 0], [0.19, 0.012], [0.172, 0], [0.135, -0.22], [0, -0.22]], 14, P.madeiraClara, { uv: { modo: 'cil', m: [1, 0.5] } });
    b.cyl(0.165, 0.165, 0.012, 12, P.agua, { p: [0, -0.13, 0], q: 0.002 });
    b.cyl(0.208, 0.2, 0.04, 14, P.ferro, { p: [0, -0.075, 0], q: 0.012 });
    b.cyl(0.168, 0.16, 0.04, 14, P.ferro, { p: [0, -0.235, 0], q: 0.012 });
    b.tube([[0, -0.02, -0.2], [0, 0.13, -0.11], [0, 0.17, 0], [0, 0.13, 0.11], [0, -0.02, 0.2]], 0.018, 6, P.ferro, {});
  }
}

// ---------------- ninho ----------------
export function ninho(b, nome) {
  const R = TIPOS.ninho.raio;
  if (nome === 'raiz') {
    // anel baixo de palha: um rolo gordo por baixo e gomos grossos trançados por cima
    b.cyl(R - 0.05, R - 0.02, 0.07, 16, P.palhaEscura, { q: 0.02 });
    const anel = []; for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI * 2; anel.push([R - 0.07 + Math.cos(a) * 0.085, 0.1 + Math.sin(a) * 0.085]); }
    b.lathe(anel, 16, P.palhaEscura, { uv: { modo: 'cil', voltas: 3, m: [1, 0.5] } });
    for (let i = 0; i < 11; i++) {
      const a0 = (i / 11) * Math.PI * 2, da = 0.75, r = R - 0.06, pts = [];
      for (let k = 0; k <= 3; k++) { const a = a0 + (da * k) / 3, sobe = Math.sin((k / 3) * Math.PI); pts.push([Math.cos(a) * (r + 0.035 * sobe * (i % 2 ? 1 : -1)), 0.13 + 0.07 * sobe + (i % 3) * 0.012, Math.sin(a) * (r + 0.035 * sobe * (i % 2 ? 1 : -1))]); }
      b.tube(pts, 0.05, 6, i % 2 ? P.palha : P.palhaClara, { steps: 6, uv: { modo: 'proprio', rect: [(i % 3) * 0.25, (i % 4) * 0.2, (i % 3) * 0.25 + 0.5, (i % 4) * 0.2 + 0.3] } }); // os fios da pintura correm ao longo do gomo
    }
    // uns fios soltos para fora, como no ninho pintado
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.2; b.cap(0.018, 0.2, P.palhaClara, { p: [Math.cos(a) * (R - 0.02), 0.06 + (i % 3) * 0.03, Math.sin(a) * (R - 0.02)], r: [0, -a * GRAUS, -62 - (i % 2) * 14], n: 4, nc: 1 }); }
  } else b.sph(0.088, 0, 0, P.ovo, { p: [0, 0.1, 0], s: [1, 1.28, 1], r: [0, 0, 18], grad: '#ffffff' });
}

// ---------------- laranjeira ----------------
const PENCAS = [[-0.57, -0.19, 0.86, 0.1], [-0.39, -0.16, 0.82, 0.13], [-0.5, -0.13, 1.0, 0.12]]; // as mesmas de ../codigo/objetos.js
const RAIO_LARANJA = 0.155;
// copa: massas grandes [x, y, z, raio] a partir do osso da copa, e tufos menores que quebram o contorno redondo
const COPA = [[0.05, 1.55, -0.1, 1.08], [0.98, 0.95, 0.3, 0.76], [-0.95, 0.98, -0.25, 0.8], [0.2, 0.98, -1.0, 0.76], [0.1, 0.82, 0.85, 0.62]];
const TUFOS = [[0.75, 1.95, 0.45, 0.46], [-0.6, 2.05, 0.35, 0.44], [0.1, 2.5, -0.2, 0.42], [1.5, 1.3, -0.1, 0.4], [-1.55, 1.2, 0.1, 0.42], [-0.75, 1.45, 0.75, 0.4], [0.75, 1.15, 0.95, 0.4], [1.3, 0.6, 0.75, 0.36], [-1.45, 0.62, -0.75, 0.36], [0.85, 1.75, -0.85, 0.42], [-0.5, 1.9, -0.9, 0.42], [-0.25, 0.45, 1.25, 0.34]];
const LARANJA_NO_PE = tom(P.laranja, 1.2), LARANJA_NO_PE_CLARA = tom(P.laranjaClara, 1.2);
// Pontas de folha em volta de um cacho da copa: uma coroa de triângulos deitada no plano da tela (a câmera do jogo nunca
// gira), com o pé escondido dentro da bola e só as pontas para fora. Quebra o contorno redondo, como as folhas pintadas
// da imagem-alvo, por dez triângulos em cada cacho.
const TELA_D = [Math.SQRT1_2, 0, -Math.SQRT1_2], TELA_C = [-0.40825, 0.8165, -0.40825];
function pontasDeFolha(b, x, y, z, r, n, k0) {
  const pos = [], uvs = [], idx = [], p = (a, d) => { const c = Math.cos(a) * d, s = Math.sin(a) * d * 0.94; pos.push(x + TELA_D[0] * c + TELA_C[0] * s, y + TELA_D[1] * c + TELA_C[1] * s, z + TELA_D[2] * c + TELA_C[2] * s); uvs.push(0.5 + (Math.cos(a) * d) / (2.6 * r), 0.5 + (Math.sin(a) * d) / (2.6 * r)); };
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5 * (k0 % 2)) / n) * TAU, j = ((k0 * 31 + i * 17) % 7) / 6, larg = (0.62 * TAU) / n, comp = r * (1.14 + 0.12 * j), v = pos.length / 3;
    p(a - larg / 2, r * 0.82); p(a + larg / 2, r * 0.82); p(a + (j - 0.5) * 0.25, comp);
    idx.push(v, v + 2, v + 1); // de frente para a câmera
  }
  b.solta(pos, uvs, idx, P.folha, { uv: { rect: [((k0 * 37) % 10) / 20, ((k0 * 53) % 10) / 20, ((k0 * 37) % 10) / 20 + 0.5, ((k0 * 53) % 10) / 20 + 0.5] } });
}
export function arvore(b, nome) {
  if (nome === 'raiz') {
    // tronco afunilado, com o pé alargado, e três galhos grossos
    b.lathe([[0, 0], [0.5, 0], [0.44, 0.06], [0.31, 0.26], [0.25, 0.6], [0.22, 1.2], [0.24, 1.75], [0.28, 2.0], [0, 2.0]], 14, P.casca, { grad: P.cascaClara });
    b.cyl(0.1, 0.15, 0.85, 8, P.casca, { p: [0.05, 1.5, 0], r: [0, 0, -34] });
    b.cyl(0.1, 0.15, 0.85, 8, P.casca, { p: [-0.05, 1.45, -0.05], r: [-22, 0, 30] });
    b.cyl(0.08, 0.12, 1.05, 8, P.casca, { p: [0, 1.62, 0.05], r: [52, -4, 0] });
    // raízes à mostra
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.5; b.cap(0.09, 0.5, P.casca, { p: [Math.sin(a) * 0.3, 0.06, Math.cos(a) * 0.3], r: [0, a * GRAUS, 68], n: 6, nc: 2, uv: { modo: 'cil' } }); }
  } else if (nome === 'copa') {
    // a folhagem pintada é projetada pela câmera em cada massa: cada bola vira um cacho de folhas largas
    for (const [x, y, z, r] of COPA) b.sph(r, 0, 0, P.folha, { p: [x, y, z], s: [1, 0.92, 1], n: 14 });
    for (const [x, y, z, r] of TUFOS) b.sph(r, 0, 0, P.folha, { p: [x, y, z], s: [1, 0.9, 1], n: 9 });
    COPA.forEach(([x, y, z, r], i) => pontasDeFolha(b, x, y, z, r, 13, i));
    TUFOS.forEach(([x, y, z, r], i) => pontasDeFolha(b, x, y, z, r, 9, i + 5));
  } else if (nome === 'galho') {
    b.sph(0.5, 0, 0, P.folha, { p: [-0.5, 0.36, 0.8], s: [1, 0.9, 1], n: 12 });
    b.sph(0.3, 0, 0, P.folha, { p: [-0.9, 0.42, 1.02], s: [1, 0.85, 1], n: 8 });
    pontasDeFolha(b, -0.5, 0.36, 0.8, 0.5, 10, 3); pontasDeFolha(b, -0.9, 0.42, 1.02, 0.3, 7, 4);
  } else {
    const c = PENCAS[+nome[5]][3];
    b.cap(0.02, c + 0.2, P.casca, { p: [0, -c, 0], n: 4, nc: 1 });
    b.sph(RAIO_LARANJA, 0, 0, LARANJA_NO_PE, { p: [0, -c - RAIO_LARANJA * 0.9, 0], grad: LARANJA_NO_PE_CLARA, n: 10 });
    b.bola(0.07, P.milhoFolhaClara, { p: [0.05, -c + 0.03, 0.02], s: [1, 0.28, 0.6], r: [0, 30, 25] });
  }
}

// ---------------- canteiro e milho ----------------
// Terra arada: uma base baixa e três leiras feitas de torrões (bolas achatadas, baratas), com a pintura de torrões por
// cima, projetada pela câmera. Os pés de milho ficam nas leiras de fora (z = ±0,39 no contrato do "codigo").
const LEIRAS = [-0.47, 0, 0.47], ALTO_DA_LEIRA = 0.25;
export function canteiroTerra(b) {
  const [w, d] = TIPOS.canteiro.tamanho, lw = w - 0.12, ld = d - 0.12, pelaCamera = { modo: 'camera', m: [1.5, 1.5] };
  b.box(lw, 0.13, ld, P.terraEscura, { q: 0.06, seg: 2, uv: { m: [1.9, 1.9] } });
  let k = 0;
  for (const z of LEIRAS) for (let i = 0; i < 5; i++, k++) {
    const x = (i - 2) * (lw / 5.2) + (((k * 37) % 7) - 3) * 0.008, r = 0.21 + (((k * 53) % 5) - 2) * 0.008;
    b.bola(r, k % 3 === 1 ? P.terraClara : P.terra, { p: [x, 0.09, z + (((k * 29) % 5) - 2) * 0.012], s: [1.1, (ALTO_DA_LEIRA - 0.09) / r, 1.12], seg: 8, aneis: 5, uv: pelaCamera });
  }
}
// Os pés de milho são de peças baratas (cápsulas de poucos gomos e a folha gorda do kit): as quatro fases dos quatro
// lugares de cada canteiro moram na mesma malha, e a que não está à vista fica com escala zero.
function espigaNoPe(b, o) {
  b.group(o, () => {
    b.cap(0.1, 0.44, P.milhoEspiga, { p: [0, 0.03, 0], n: 7, nc: 2, grad: '#ffd630' });
    b.folha(0.26, 0.15, P.milhoFolha, { p: [0.06, -0.02, 0], r: [0, 0, -10], dobra: 30, esp: 0.5, grad: P.milhoFolhaClara });
    b.folha(0.26, 0.15, P.milhoCaule, { p: [-0.06, -0.02, 0], r: [0, 180, -10], dobra: 30, esp: 0.5, grad: P.milhoFolhaClara });
  });
}
export function canteiroPlantas(b, nome) {
  if (nome === 'raiz') return;
  const s = +nome[1], i = +nome[3];
  // o osso de cada lugar fica em y = 0,22, perto do alto da leira (0,25)
  b.group({ r: [0, i * 67 + s * 30, 0] }, () => {
    if (s === 0) { // semente: um montinho de terra clara com três grãos amarelos bem à vista em cima
      b.bola(0.17, P.terraClara, { p: [0, 0.03, 0], s: [1, 0.55, 1], seg: 7, aneis: 4, uv: { modo: 'camera', m: [1.5, 1.5] } });
      for (let k = 0; k < 3; k++) b.bola(0.058, P.semente, { p: [Math.cos(k * 2.1) * 0.07, 0.125, Math.sin(k * 2.1) * 0.07], s: [1, 0.85, 1], seg: 6, aneis: 4 });
    } else if (s === 1) { // broto: duas folhinhas gordas e uma menor no meio
      b.cap(0.035, 0.16, P.milhoCaule, { n: 5, nc: 1 });
      for (const e of [0, 1]) b.folha(0.36, 0.17, P.milhoFolha, { p: [0, 0.08, 0], r: [0, e * 180, -32], dobra: 50, esp: 0.45, grad: P.milhoFolhaClara });
      b.folha(0.24, 0.11, P.milhoCaule, { p: [0, 0.11, 0], r: [0, 90, -12], dobra: 30, esp: 0.45, grad: P.milhoFolhaClara });
    } else { // pé crescendo (0,9 de altura) e pé pronto (1,8, com as espigas)
      const h = s === 2 ? 0.9 : 1.8, nf = s === 2 ? 4 : 6;
      b.cap(s === 2 ? 0.055 : 0.07, h, tom(P.milhoCaule, 0.82), { n: 6, nc: 1, grad: P.milhoCaule });
      for (let k = 0; k < nf; k++) b.folha(s === 2 ? 0.58 : 0.84, s === 2 ? 0.19 : 0.25, k % 2 ? P.milhoFolha : tom(P.milhoFolha, 0.86), { p: [0, h * (0.16 + (k / nf) * 0.66), 0], r: [0, k * 137, -38], dobra: 75, grad: P.milhoFolhaClara });
      if (s === 3) {
        espigaNoPe(b, { p: [0.07, h * 0.46, 0.02], r: [0, 0, -24] });
        espigaNoPe(b, { p: [-0.06, h * 0.64, -0.03], r: [-10, 0, 26] });
        for (let k = 0; k < 3; k++) b.cap(0.022, 0.3, P.milhoPendao, { p: [0, h - 0.03, 0], r: [k ? 28 : 0, k * 150, 0], n: 4, nc: 1 });
      } else b.folha(0.32, 0.12, P.milhoFolhaClara, { p: [0, h - 0.06, 0], dobra: 20 });
    }
  });
}

// ---------------- projetores de sombra ----------------
// Formas simples que fazem a sombra do celeiro, do poço, da laranjeira e da cerca no mapa de sombra (ver projetorDeSombra
// no kit do "brinquedo"). O celeiro e o poço têm as mesmas medidas do "brinquedo" e usam os projetores de lá.
export const PROJETORES = {
  celeiro: DO_BRINQUEDO.celeiro,
  poco: DO_BRINQUEDO.poco,
  arvore: (b) => {
    b.cyl(0.21, 0.4, 2.0, 7, '#000');
    for (const [x, y, z, r] of COPA) b.sph(r * 0.95, 8, 5, '#000', { p: [x, 1.6 + y, z], s: [1, 0.92, 1] });
    TUFOS.forEach(([x, y, z, r], i) => { if (i % 2 === 0) b.sph(r, 5, 3, '#000', { p: [x, 1.6 + y, z] }); }); // metade dos tufos basta para o recorte da sombra
    b.sph(0.46, 6, 4, '#000', { p: [-0.5, 0.85 + 0.36, 0.72 + 0.8] });
  },
  cerca: (b, ctx) => desenharCerca(b, ctx.sitio, true),
};

// ---------------- objetos de mão ----------------
function caixote(b, recheio) {
  // origem no meio da caixa, como no conjunto "codigo" (ele segura pelos lados)
  b.group({ p: [0, -0.16, 0], s: 0.9 }, () => {
    const w = 0.64, d = 0.46, h = 0.3, ripa = { m: [0.8, 1.2] };
    b.box(w - 0.04, 0.045, d - 0.04, P.madeiraEscura, { q: 0.015, seg: 1 });
    for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) b.box(w - 0.02, 0.105, 0.045, P.madeiraClara, { p: [0, 0.035 + i * 0.14, sz * (d / 2 - 0.022)], q: 0.02, seg: 1, uv: ripa });
    for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) b.box(0.045, 0.105, d - 0.02, P.madeiraClara, { p: [sx * (w / 2 - 0.022), 0.035 + i * 0.14, 0], q: 0.02, seg: 1, uv: ripa });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.075, h + 0.02, 0.075, P.cerca, { p: [sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)], q: 0.025, seg: 1, uv: ripa });
    if (recheio === 'milho') {
      for (let i = 0; i < 3; i++) { b.cap(0.075, 0.34, P.milhoEspiga, { p: [-0.2 + i * 0.2, 0.13, 0.13], r: [-62, 20 - i * 20, 0], n: 8 }); b.cap(0.065, 0.26, P.milhoFolha, { p: [-0.13 + i * 0.2, 0.12, 0.12], r: [-58, 20 - i * 20, 0], s: [0.45, 1, 1], n: 6 }); }
    } else if (recheio === 'laranja') {
      for (const [x, y, z] of [[-0.17, 0.18, -0.07], [0.02, 0.19, 0.08], [0.19, 0.18, -0.06], [-0.06, 0.3, -0.03], [0.1, 0.3, 0.02]]) b.sph(0.105, 0, 0, P.laranja, { p: [x, y, z], grad: P.laranjaClara, n: 8 });
    } else if (recheio === 'ovo') {
      b.box(w - 0.12, 0.12, d - 0.12, P.palha, { p: [0, 0.05, 0], q: 0.05, seg: 1 });
      for (let i = 0; i < 3; i++) b.sph(0.075, 0, 0, P.ovo, { p: [-0.17 + i * 0.17, 0.25, i % 2 ? -0.05 : 0.05], s: [1, 1.25, 1], n: 8 });
    } else { // leite: duas garrafas de corpo cor de marfim e tampa azul
      for (const x of [-0.14, 0.14]) {
        b.lathe([[0, 0], [0.085, 0], [0.1, 0.02], [0.1, 0.2], [0.085, 0.26], [0.05, 0.3], [0.05, 0.34], [0, 0.34]], 12, P.leite, { p: [x, 0.05, 0], n: 8 });
        b.cyl(0.062, 0.062, 0.05, 10, P.tampa, { p: [x, 0.38, 0], q: 0.015 });
      }
    }
  });
}
export const OBJETOS_DE_MAO = {
  // regador azul; origem na alça; bico para +Z
  regador: (b) => b.group({ p: [0, -0.2, 0.02] }, () => {
    b.cyl(0.105, 0.12, 0.21, 14, P.regadorEscuro, { q: 0.035, grad: P.regador });
    b.cyl(0.075, 0.075, 0.012, 12, P.regadorEscuro, { p: [0, 0.2, 0], q: 0.003 });
    b.cyl(0.026, 0.04, 0.32, 8, P.regador, { p: [0, 0.04, 0.09], r: [58, 0, 0], q: 0.01 });
    b.cyl(0.066, 0.04, 0.045, 10, P.crivo, { p: [0, 0.2, 0.345], r: [58, 0, 0], q: 0.012 });
    b.tube([[0, 0.17, -0.07], [0, 0.31, -0.08], [0, 0.31, -0.2], [0, 0.08, -0.13]], 0.022, 6, P.regador, {});
  }),
  // banquinho de três pernas grossas
  banquinho: (b) => {
    b.cyl(0.2, 0.2, 0.07, 14, P.madeiraClara, { p: [0, 0.2, 0], q: 0.03, uv: { m: [0.9, 0.9] } });
    for (let i = 0; i < 3; i++) b.cap(0.042, 0.26, P.madeira, { p: [Math.cos(i * 2.09) * 0.13, -0.02, Math.sin(i * 2.09) * 0.13], r: [Math.sin(i * 2.09) * -10, 0, Math.cos(i * 2.09) * 10], uv: { modo: 'cil' } });
  },
  // espiga colhida: cápsula amarela com duas folhas de palha
  espiga: (b) => b.group({ p: [0, -0.1, 0.04], r: [20, 0, 0] }, () => {
    b.cap(0.048, 0.22, P.milhoEspiga, { grad: '#ffe36a' });
    for (const e of [-1, 1]) b.cap(0.045, 0.17, P.milhoFolha, { p: [e * 0.03, -0.03, 0], r: [0, 0, e * 18], s: [0.45, 1, 1] });
  }),
  caixaMilho: (b) => caixote(b, 'milho'), caixaLeite: (b) => caixote(b, 'leite'), caixaOvo: (b) => caixote(b, 'ovo'), caixaLaranja: (b) => caixote(b, 'laranja'),
  // saquinho de sementes; origem na boca
  saco: (b) => {
    b.sph(0.105, 0, 0, P.saco, { p: [0, -0.1, 0], s: [1, 1.12, 0.86] });
    b.cyl(0.08, 0.066, 0.05, 10, P.sacoEscuro, { p: [0, -0.03, 0], q: 0.015 });
    b.cyl(0.062, 0.062, 0.012, 10, P.semente, { p: [0, 0.014, 0], q: 0.004 });
  },
  // balde de leite de metal, de parede grossa; origem no fundo
  balde: (b) => {
    b.lathe([[0, 0], [0.13, 0], [0.148, 0.018], [0.19, 0.235], [0.192, 0.25], [0.18, 0.262], [0.166, 0.25], [0.13, 0.04], [0, 0.04]], 14, P.metalEscuro, { grad: P.metal });
    b.cyl(0.198, 0.192, 0.04, 14, P.metalEscuro, { p: [0, 0.2, 0], q: 0.014 });
    b.tube([[-0.19, 0.24, 0], [-0.14, 0.33, 0.02], [0, 0.37, 0.03], [0.14, 0.33, 0.02], [0.19, 0.24, 0]], 0.016, 6, P.metalEscuro, {});
  },
  leite: (b) => b.cyl(1, 1, 0.01, 14, P.leite, { q: 0.002 }), // a superfície do leite dentro do balde (a animação dá o tamanho)
  ovo: (b) => b.sph(0.07, 0, 0, P.ovo, { s: [1, 1.28, 1] }),
  laranja: (b) => { b.sph(0.104, 0, 0, P.laranja, { grad: P.laranjaClara }); b.sph(0.06, 0, 0, P.milhoFolhaClara, { p: [0.03, 0.1, 0], s: [1, 0.28, 0.6], r: [0, 30, 25] }); },
};
