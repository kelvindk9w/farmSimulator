// Conjunto "lowpoly": o chão (bloco de terra de quinas vivas, com a grama em triângulos grandes de tons vizinhos, o
// caminho e o terreiro em polígonos de quina marcada) e a cerca do pasto (mourões grossos de ponta em pirâmide e réguas
// largas). Parados: uma malha cada. O chão só recebe sombra; a cerca projeta a dela.
import { Visual } from '../registro.js';
import { malha, acaso } from '../codigo/base.js';
import { P } from './kit.js';

const GRAUS = 180 / Math.PI;

// grama: uma grade de n x n com os vértices de dentro fora do lugar; cada célula vira dois triângulos, com a diagonal
// alternada, e cada triângulo fica com um dos três verdes (mais o tom próprio de cada face, que o construtor dá)
function gramado(b, L, n) {
  const passo = (2 * L) / n, pts = [], id = (i, j) => j * (n + 1) + i;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const dentro = i > 0 && i < n && j > 0 && j < n ? 0.62 * passo : 0;
    pts.push([-L + i * passo + (acaso(i * 7 + j * 13 + 1) - 0.5) * dentro, 0, -L + j * passo + (acaso(i * 11 + j * 5 + 2) - 0.5) * dentro]);
  }
  const grupos = [[], [], []];
  let k = 0;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = id(i, j), c = id(i + 1, j), d = id(i + 1, j + 1), e = id(i, j + 1);
    const dois = (i + j) % 2 ? [[a, e, c], [c, e, d]] : [[a, e, d], [a, d, c]];
    for (const t of dois) grupos[Math.floor(acaso(k++ * 3 + 5) * 2.999)].push(t);
  }
  [P.grama, P.gramaClara, P.gramaEscura].forEach((cor, g) => b.tris(pts, grupos[g], cor, { jit: 0.03 }));
}
// lados do bloco que a câmera vê (+X e +Z), de y0 a y1, em n trechos de dois triângulos
function lados(b, L, y0, y1, n, cor, jit) {
  const pts = [], tris = [];
  for (let i = 0; i <= n; i++) {
    const meio = i > 0 && i < n ? ((acaso(i * 17 + n) - 0.5) * 2 * L) / n * 0.5 : 0, u = -L + (2 * L * i) / n + meio;
    pts.push([u, y0, L], [u, y1, L], [L, y0, u], [L, y1, u]);
  }
  for (let i = 0; i < n; i++) {
    const a = i * 4, d = a + 4;
    if (i % 2) tris.push([a, d, d + 1], [a, d + 1, a + 1], [a + 2, d + 3, d + 2], [a + 2, a + 3, d + 3]);
    else tris.push([a, d, a + 1], [d, d + 1, a + 1], [a + 2, a + 3, d + 2], [d + 2, a + 3, d + 3]);
  }
  b.tris(pts, tris, cor, { jit });
}

export function chao({ sitio }) {
  const v = new Visual('chao');
  const L = sitio.terreno, w = sitio.larguraCaminho + 0.1, T = sitio.terreiro;
  v.raiz.add(malha((b) => {
    gramado(b, L, 7);
    lados(b, L, -0.13, 0, 5, P.gramaBorda, 0.05);
    lados(b, L, -0.62, -0.13, 6, P.bloco, 0.1);
    // terreiro das galinhas: um octógono de terra clara
    const x0 = T.x0 - 0.25, x1 = T.x1 + 0.25, z0 = T.z0 - 0.25, z1 = T.z1 + 0.25, c = 0.8;
    b.slab([[x0 + c, z0], [x1 - c, z0], [x1, z0 + c], [x1, z1 - c], [x1 - c, z1], [x0 + c, z1], [x0, z1 - c], [x0, z0 + c]], 0.008, P.terreiro, { jit: 0.03 });
    for (let i = 0; i < 10; i++) b.box(0.05, 0.02, 0.05, P.milhoEspiga, { p: [T.x0 + 0.4 + acaso(i + 70) * (T.x1 - T.x0 - 0.8), 0.008, T.z0 + 0.4 + acaso(i + 90) * (T.z1 - T.z0 - 0.8)], r: [0, acaso(i) * 90, 0] });
    // caminho de terra: trechos retos emendados por hexágonos (a quina fica marcada)
    for (const linha of sitio.caminhos) {
      linha.forEach((p, i) => {
        b.disc(w / 2 / Math.cos(Math.PI / 6), w / 2 / Math.cos(Math.PI / 6), 6, 0.012, i % 2 ? P.caminho : P.caminhoClaro, { p: [p[0], 0, p[1]], r: [0, 30 + acaso(i * 3 + 1) * 20, 0], jit: 0.02 });
        if (!i) return;
        const [xa, za] = linha[i - 1], dx = p[0] - xa, dz = p[1] - za;
        b.box(w, 0.012, Math.hypot(dx, dz), P.caminho, { p: [(xa + p[0]) / 2, 0.0005, (za + p[1]) / 2], r: [0, Math.atan2(dx, dz) * GRAUS, 0], jit: 0.02 });
      });
    }
    // marcas claras no meio do caminho, de espaço em espaço
    let k = 0;
    for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) {
      const dx = linha[i][0] - linha[i - 1][0], dz = linha[i][1] - linha[i - 1][1], comp = Math.hypot(dx, dz), n = Math.max(1, Math.round(comp / 0.8));
      for (let j = 0; j < n; j++, k++) {
        const u = (j + 0.5) / n, lado = (acaso(k + 5) - 0.5) * 0.3;
        b.disc(0.13 + acaso(k + 2) * 0.03, 0.085 + acaso(k + 3) * 0.02, 6, 0.006, P.pedrinha, { p: [linha[i - 1][0] + dx * u + (dz / comp) * lado, 0.0125, linha[i - 1][1] + dz * u - (dx / comp) * lado], r: [0, Math.atan2(dx, dz) * GRAUS + 90 + (acaso(k + 7) - 0.5) * 40, 0], jit: 0.015 });
      }
    }
  }, 21));
  return v;
}

export function cerca({ sitio }) {
  const v = new Visual('cerca');
  const p = sitio.pasto, g = p.porteira;
  v.raiz.add(malha((b) => {
    const mourao = (x, z, alt = 1.0, l = 0.22) => {
      b.box(l, alt, l, P.madeiraEscura, { p: [x, 0, z], grad: P.madeira });
      b.tbox(l, l, 0.02, 0.02, 0.11, P.madeiraClara, { p: [x, alt, z] });
    };
    // um lance de cerca de (x0, z0) a (x1, z1): mourões a cada ~1,2 e duas réguas grossas em cada vão
    const lance = (x0, z0, x1, z1, comInicio, comFim) => {
      const c = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(c / 1.2)), giro = Math.atan2(x1 - x0, z1 - z0) * GRAUS;
      for (let i = 0; i <= n; i++) { if ((i === 0 && !comInicio) || (i === n && !comFim)) continue; mourao(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n); }
      for (let i = 0; i < n; i++) for (const [y, k] of [[0.3, 0], [0.63, 1]]) {
        b.box(0.085, 0.15, c / n, (i + k) % 2 ? P.madeira : P.madeiraClara, { p: [x0 + ((x1 - x0) * (i + 0.5)) / n, y, z0 + ((z1 - z0) * (i + 0.5)) / n], r: [0, giro, 0] });
      }
    };
    lance(p.x0, p.z0, p.x1, p.z0, true, true);
    lance(p.x0, p.z0, p.x0, p.z1, false, true);
    lance(p.x1, p.z0, p.x1, p.z1, false, true);
    lance(p.x0, p.z1, g.x0, p.z1, false, false);
    lance(g.x1, p.z1, p.x1, p.z1, false, false);
    // mourões da porteira (que fica sempre aberta)
    for (const x of [g.x0, g.x1]) mourao(x, p.z1, 1.12, 0.24);
  }, 31));
  return v;
}
