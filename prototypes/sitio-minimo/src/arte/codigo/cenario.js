// Chão (grama, caminho de terra, terreiro das galinhas, pasto) e a cerca do pasto. Parados: uma malha cada.
import { Visual } from '../registro.js';
import { TIPOS } from '../../jogo/contrato.js';
import { malha, C, mix, shade, acaso } from './base.js';
import { cerca as cercaDeMadeira } from '../../../../../tools/visual-refs/src/models/props.js';
import { tufo, flor } from '../../../../../tools/visual-refs/src/models/nature.js';

// retângulo de cantos arredondados (pontos x, z)
function cantosRedondos(x0, z0, x1, z1, r, n = 4) {
  const pts = [];
  for (const [cx, cz, a0] of [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]]) {
    for (let i = 0; i <= n; i++) { const a = ((a0 + (90 * i) / n) * Math.PI) / 180; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  }
  return pts;
}
const distSeg = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; const u = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)) : 0; return Math.hypot(px - ax - dx * u, pz - az - dz * u); };

export function chao({ sitio }) {
  const v = new Visual('chao');
  const L = sitio.terreno, w = sitio.larguraCaminho, P = sitio.pasto, T = sitio.terreiro;
  const longeDoCaminho = (x, z, d) => sitio.caminhos.every((l) => l.every((p, i) => i === 0 || distSeg(x, z, l[i - 1][0], l[i - 1][1], p[0], p[1]) > d));
  const livre = (x, z, d) => {
    if (Math.abs(x) > L - 0.25 || Math.abs(z) > L - 0.25 || !longeDoCaminho(x, z, w / 2 + d)) return false;
    for (const o of Object.values(sitio.objetos)) {
      const t = TIPOS[o.tipo]; if (o.tipo === 'vaca' || o.tipo === 'galinha') continue;
      const r = (t.tamanho ? Math.hypot(t.tamanho[0], t.tamanho[1]) / 2 : (t.raio || t.raioTronco || 0.5)) + d + 0.25;
      if (Math.hypot(x - o.x, z - o.z) < r) return false;
      for (const p of Object.values(t.pontos)) if (Math.hypot(x - o.x - p[0], z - o.z - p[2]) < 0.6) return false;
    }
    return true;
  };
  v.raiz.add(malha((b) => {
    // bloco de terra com a grama por cima
    b.box(2 * L, 0.16, 2 * L, C.grassDark, { p: [0, -0.16, 0], grad: C.grass });
    b.box(2 * L, 0.46, 2 * L, C.soilDark, { p: [0, -0.62, 0], grad: C.soil });
    // manchas de grama mais clara e mais escura
    for (let i = 0; i < 16; i++) {
      const x = (acaso(i * 3 + 1) * 2 - 1) * (L - 1.1), z = (acaso(i * 3 + 2) * 2 - 1) * (L - 1.1), r = 0.55 + acaso(i * 3 + 3) * 0.7;
      b.disc(r, r * (0.6 + acaso(i + 40) * 0.3), 9, 0.004, i % 3 ? mix(C.grass, C.grassLight, 0.55) : mix(C.grass, C.grassDark, 0.5), { p: [x, 0.001 + (i % 4) * 0.0006, z], r: [0, acaso(i + 9) * 180, 0] });
    }
    // pasto: grama mais clara, com o chão batido no ponto de ordenha
    b.slab(cantosRedondos(P.x0 + 0.12, P.z0 + 0.12, P.x1 - 0.12, P.z1 - 0.12, 0.5), 0.006, mix(C.grassLight, C.grass, 0.25), { p: [0, 0.004, 0] });
    b.disc(1.0, 0.72, 10, 0.006, mix(C.path, C.grass, 0.45), { p: [P.ordenha.x - 0.2, 0.008, P.ordenha.z + 0.25] });
    // terreiro das galinhas: terra clara
    b.slab(cantosRedondos(T.x0 - 0.2, T.z0 - 0.2, T.x1 + 0.2, T.z1 + 0.2, 0.7), 0.006, mix(C.sand, C.path, 0.3), { p: [0, 0.004, 0] });
    b.slab(cantosRedondos(T.x0 + 0.25, T.z0 + 0.2, T.x1 - 0.2, T.z1 - 0.25, 0.6), 0.006, mix(C.sand, C.pathLight, 0.5), { p: [0, 0.008, 0] });
    for (let i = 0; i < 14; i++) b.box(0.05, 0.012, 0.05, i % 2 ? C.cornEar : C.hay, { p: [T.x0 + 0.4 + acaso(i + 70) * (T.x1 - T.x0 - 0.8), 0.014, T.z0 + 0.4 + acaso(i + 90) * (T.z1 - T.z0 - 0.8)], r: [0, acaso(i) * 90, 0] });
    // caminho de terra: borda escura por baixo, miolo claro por cima
    for (const [larg, cor, y] of [[w + 0.16, C.pathDark, 0.012], [w, C.path, 0.018]]) {
      for (const linha of sitio.caminhos) {
        linha.forEach((p, i) => {
          b.disc(larg / 2, larg / 2, 12, 0.004, cor, { p: [p[0], y, p[1]] });
          if (!i) return;
          const [x0, z0] = linha[i - 1], dx = p[0] - x0, dz = p[1] - z0;
          b.box(larg, 0.004, Math.hypot(dx, dz), cor, { p: [(x0 + p[0]) / 2, y, (z0 + p[1]) / 2], r: [0, (Math.atan2(dx, dz) * 180) / Math.PI, 0] });
        });
      }
    }
    // pedrinhas e marcas claras no caminho
    let k = 0;
    for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) for (let j = 0; j < 3; j++, k++) {
      const u = (j + 0.3 + acaso(k) * 0.4) / 3, lado = (acaso(k + 5) - 0.5) * (w - 0.35);
      const dx = linha[i][0] - linha[i - 1][0], dz = linha[i][1] - linha[i - 1][1], c = Math.hypot(dx, dz);
      const x = linha[i - 1][0] + dx * u + (dz / c) * lado, z = linha[i - 1][1] + dz * u - (dx / c) * lado;
      b.disc(0.1 + acaso(k + 2) * 0.1, 0.07 + acaso(k + 3) * 0.05, 6, 0.004, k % 3 ? C.pathLight : C.pathDark, { p: [x, 0.023, z], r: [0, acaso(k + 7) * 180, 0] });
    }
    // tufos de capim e umas flores, longe dos caminhos e dos pontos onde ele pisa
    let postos = 0;
    for (let i = 0; i < 200 && postos < 34; i++) {
      const x = (acaso(i * 2 + 300) * 2 - 1) * L, z = (acaso(i * 2 + 301) * 2 - 1) * L;
      if (!livre(x, z, 0.3)) continue;
      if (x > T.x0 - 0.3 && x < T.x1 + 0.3 && z > T.z0 - 0.3 && z < T.z1 + 0.3) continue;
      b.group({ p: [x, 0, z], r: [0, acaso(i) * 360, 0], s: 0.8 + acaso(i + 1) * 0.5 }, () => { if (postos % 6 === 5) flor(b, { color: [C.flowerA, C.flowerB, C.flowerC][postos % 3] }); else tufo(b); });
      postos++;
    }
  }, 21));
  return v;
}

export function cerca({ sitio }) {
  const v = new Visual('cerca');
  const p = sitio.pasto, g = p.porteira;
  v.raiz.add(malha((b) => {
    const o = { step: 1.2 };
    cercaDeMadeira(b, p.x0, p.z0, p.x1, p.z0, o);
    cercaDeMadeira(b, p.x0, p.z0, p.x0, p.z1, { ...o, noStart: true });
    cercaDeMadeira(b, p.x1, p.z0, p.x1, p.z1, { ...o, noStart: true });
    cercaDeMadeira(b, p.x0, p.z1, g.x0, p.z1, { ...o, noStart: true, noEnd: true });
    cercaDeMadeira(b, g.x1, p.z1, p.x1, p.z1, { ...o, noStart: true, noEnd: true });
    // mourões mais altos na porteira (que fica sempre aberta)
    for (const x of [g.x0, g.x1]) {
      b.box(0.2, 1.3, 0.2, C.woodDark, { p: [x, 0, p.z1], grad: C.wood });
      b.tbox(0.2, 0.2, 0.1, 0.1, 0.1, C.wood, { p: [x, 1.3, p.z1] });
    }
    // sombra pintada no chão, ao pé da cerca
    const faixa = (x0, z0, x1, z1) => b.box(Math.abs(x1 - x0) + 0.3, 0.004, Math.abs(z1 - z0) + 0.3, shade(C.grass, 0.82), { p: [(x0 + x1) / 2 - 0.1, 0.012, (z0 + z1) / 2 - 0.08] });
    faixa(p.x0, p.z0, p.x1, p.z0); faixa(p.x0, p.z0, p.x0, p.z1); faixa(p.x1, p.z0, p.x1, p.z1); faixa(p.x0, p.z1, g.x0, p.z1); faixa(g.x1, p.z1, p.x1, p.z1);
  }, 31));
  return v;
}
