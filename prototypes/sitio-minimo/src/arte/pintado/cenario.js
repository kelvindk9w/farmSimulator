// Conjunto "pintado": o chão (bloco de terreno com grama pintada, barranco de terra com a franja de grama, terreiro e
// caminho de terra batida, com tufos de grama avançando sobre a beira da areia) e a cerca do pasto (mourões quadrados e
// réguas de tábua, com parafusos de ferro). Parados: uma malha cada.
import * as THREE from 'three';
import { Visual } from '../registro.js';
import { malha, acaso } from '../codigo/base.js';
import { P, tom } from './kit.js';

const GR = Math.PI / 180;
const M_CHAO = 2.2, DIV = 2, CASA = M_CHAO / DIV; // uma cópia da textura do chão cobre 2,2 unidades; a malha é cortada em casas de 1,1
const distSeg = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; const u = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)) : 0; return Math.hypot(px - ax - dx * u, pz - az - dz * u); };

// retângulo de cantos arredondados (pontos x, z)
function cantosRedondos(x0, z0, x1, z1, r, n = 6) {
  const pts = [];
  for (const [cx, cz, a0] of [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]]) {
    for (let i = 0; i <= n; i++) { const a = (a0 + (90 * i) / n) * GR; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  }
  return pts;
}
// faixa de pontas redondas entre dois pontos
function capsula(x0, z0, x1, z1, larg, n = 7) {
  const a = Math.atan2(z1 - z0, x1 - x0), r = larg / 2, pts = [];
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + (Math.PI * i) / n; pts.push([x1 + Math.cos(t) * r, z1 + Math.sin(t) * r]); }
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + (Math.PI * i) / n; pts.push([x0 + Math.cos(t) * r, z0 + Math.sin(t) * r]); }
  return pts;
}
// corta um polígono convexo (pontos [x, z]) pelo semiplano a*x + b*z <= c
function cortar(pol, a, b, c) {
  const out = [];
  for (let i = 0; i < pol.length; i++) {
    const p = pol[i], q = pol[(i + 1) % pol.length], dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c;
    if (dp <= 0) out.push(p);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) { const t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return out;
}
// Chapa deitada no chão, na altura y, com a textura repetindo pelo mundo: os triângulos são cortados pela grade de casas
// e cada pedaço fica dentro de uma cópia da textura. Duas chapas, uma por cima da outra, pegam os mesmos pontos da pintura.
//   tris: lista de triângulos [[x, z], [x, z], [x, z]]
function ladrilhar(b, tris, y, cor, o = {}) {
  const pos = [], uvs = [], idx = [];
  for (const tri of tris) {
    const xs = tri.map((p) => p[0]), zs = tri.map((p) => p[1]);
    for (let i = Math.floor(Math.min(...xs) / CASA); i * CASA < Math.max(...xs); i++) for (let j = Math.floor(Math.min(...zs) / CASA); j * CASA < Math.max(...zs); j++) {
      let pol = cortar(cortar(cortar(cortar(tri, 1, 0, (i + 1) * CASA), -1, 0, -i * CASA), 0, 1, (j + 1) * CASA), 0, -1, -j * CASA);
      if (pol.length < 3) continue;
      const base = pos.length / 3, du = (((i % DIV) + DIV) % DIV) / DIV, dv = (((j % DIV) + DIV) % DIV) / DIV;
      for (const [x, z] of pol) { pos.push(x, y, z); uvs.push(Math.min(1, Math.max(0, (x - i * CASA) / M_CHAO + du)), Math.min(1, Math.max(0, 1 - ((z - j * CASA) / M_CHAO + dv)))); }
      // de cara para cima, qualquer que seja o sentido em que o triângulo veio
      const sentido = (pol[1][1] - pol[0][1]) * (pol[2][0] - pol[0][0]) - (pol[1][0] - pol[0][0]) * (pol[2][1] - pol[0][1]);
      for (let k = 1; k < pol.length - 1; k++) { if (sentido > 0) idx.push(base, base + k, base + k + 1); else idx.push(base, base + k + 1, base + k); }
    }
  }
  if (idx.length) b.solta(pos, uvs, idx, cor, o);
}
// triângulos de um contorno fechado (pontos [x, z])
function triangular(pts) {
  const c = pts.map((p) => new THREE.Vector2(p[0], p[1]));
  return THREE.ShapeUtils.triangulateShape(c, []).map((f) => f.map((i) => pts[i]));
}
const chapa = (b, pts, y, cor, o) => ladrilhar(b, triangular(pts), y, cor, o);

// manchas largas de claro e escuro na grama (por vértice da grade): é a "variação pintada" do chão
function manchas(g) {
  const pos = g.attributes.position, cor = g.attributes.color;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), k = 0.13 * Math.sin(x * 0.83 + 1.3) * Math.sin(z * 0.71 + 0.4) + 0.08 * Math.sin(x * 1.9 - z * 1.6 + 2.0) - 0.03;
    cor.setXYZ(i, cor.getX(i) * (1 + k * 1.25), cor.getY(i) * (1 + k * 0.8), cor.getZ(i) * (1 - k * 1.2));
  }
}

export function chao({ sitio }) {
  const v = new Visual('chao');
  const L = sitio.terreno, w = sitio.larguraCaminho + 0.12, wB = w + 0.26, T = sitio.terreiro, Pa = sitio.pasto, ALT = 0.85;
  const segs = [];
  for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) segs.push([linha[i - 1][0], linha[i - 1][1], linha[i][0], linha[i][1]]);
  const aoCaminho = (x, z) => Math.min(...segs.map((s) => distSeg(x, z, ...s)));
  const noTerreiro = (x, z, folga = 0) => x > T.x0 - 0.25 - folga && x < T.x1 + 0.25 + folga && z > T.z0 - 0.25 - folga && z < T.z1 + 0.25 + folga;
  v.raiz.add(malha((b) => {
    // tampo de grama: a textura repete em ladrilhos e a cor por vértice faz as manchas largas
    chapa(b, [[-L, -L], [L, -L], [L, L], [-L, L]], 0, P.grama, { pintar: manchas });
    // barranco: as quatro laterais do bloco, com a franja de grama pintada no alto e a terra escurecendo para baixo
    // (na imagem-alvo as duas faces à vista têm quase o mesmo claro; aqui a da direita fica na sombra do sol, então a
    // cor dela é clareada e a da esquerda um pouco escurecida)
    const escurecer = (claro) => (g) => { const pos = g.attributes.position, cor = g.attributes.color; for (let i = 0; i < pos.count; i++) { const k = (1 - 0.4 * Math.min(1, -pos.getY(i) / ALT) ** 1.5) * claro; cor.setXYZ(i, cor.getX(i) * k, cor.getY(i) * k * Math.min(1, k), cor.getZ(i) * k); } };
    const n = Math.round((2 * L) / 1.1), lw = (2 * L) / n;
    for (const [ox, oz, dx, dz] of [[-L, L, 1, 0], [L, L, 0, -1], [L, -L, -1, 0], [-L, -L, 0, 1]]) {
      const pos = [], uvs = [], idx = [];
      for (let i = 0; i < n; i++) {
        const x0 = ox + dx * lw * i, z0 = oz + dz * lw * i, x1 = x0 + dx * lw, z1 = z0 + dz * lw, k = pos.length / 3;
        pos.push(x0, -ALT, z0, x1, -ALT, z1, x1, 0, z1, x0, 0, z0); uvs.push(0, 0.2, 1, 0.2, 1, 1, 0, 1); idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
      }
      b.solta(pos, uvs, idx, P.barranco, { pintar: escurecer(dz < 0 ? 1.9 : 0.9) });
    }
    // pontas de capim em pé nas duas beiras do fundo (as que aparecem contra o céu): quebram a linha reta do terreno.
    // São triângulos deitados no plano da tela, com o pé na beira.
    { const pos = [], uvs = [], idx = []; let q = 0;
      for (const [ox, oz, dx, dz] of [[-L, -L, 1, 0], [-L, -L, 0, 1]]) for (let d = 0.08; d < 2 * L - 0.05; d += 0.13 + acaso(q) * 0.2, q++) {
        const x = ox + dx * d, z = oz + dz * d, alt = 0.07 + acaso(q + 40) * 0.09, larg = 0.05 + acaso(q + 80) * 0.04, cai = (acaso(q + 120) - 0.5) * 0.08, v = pos.length / 3;
        pos.push(x - dx * larg, -0.01, z - dz * larg, x + dx * larg, -0.01, z + dz * larg, x + dx * cai - 0.408 * alt, 0.8165 * alt, z + dz * cai - 0.408 * alt);
        uvs.push(0.2 + acaso(q) * 0.5, 0.3, 0.25 + acaso(q) * 0.5, 0.3, 0.22 + acaso(q) * 0.5, 0.5);
        if (dx) idx.push(v, v + 1, v + 2); else idx.push(v, v + 2, v + 1); // de frente para a câmera
      }
      b.solta(pos, uvs, idx, P.grama, { pintar: manchas });
    }
    // pasto: grama mais seca e pisada no ponto de ordenha
    const oval = []; for (let i = 0; i < 14; i++) { const t = (i / 14) * Math.PI * 2, u = Math.cos(t) * 1.05, s = Math.sin(t) * 0.8; oval.push([Pa.ordenha.x - 0.2 + u * 0.95 - s * 0.3, Pa.ordenha.z + 0.25 + u * 0.3 + s * 0.95]); }
    chapa(b, oval, 0.004, P.gramaSeca);
    // terreiro das galinhas (areia clara, com a beirada mais escura) e caminho de terra batida (beirada mais escura por
    // baixo, miolo claro por cima). De baixo para cima: beirada do terreiro, beirada do caminho, terreiro, caminho; assim a
    // beirada do caminho não risca o terreiro onde os dois se encontram.
    chapa(b, cantosRedondos(T.x0 - 0.25, T.z0 - 0.25, T.x1 + 0.25, T.z1 + 0.25, 0.8), 0.006, tom(P.terreiro, 0.86));
    for (const s of segs) chapa(b, capsula(...s, wB), 0.009, tom(P.caminho, 0.84));
    chapa(b, cantosRedondos(T.x0 - 0.1, T.z0 - 0.1, T.x1 + 0.1, T.z1 + 0.1, 0.68), 0.012, P.terreiro);
    for (const s of segs) chapa(b, capsula(...s, w), 0.016, P.caminho);
    // tufos de grama avançando sobre a beira da areia: triângulos deitados, com a mesma textura e a mesma cor da grama
    const tufos = [], borda = [];
    const tufo = (x, z, dx, dz, k) => { // (dx, dz) aponta para dentro da areia
      const tx = -dz, tz = dx, nf = 2 + (acaso(k) > 0.45 ? 1 : 0);
      for (let f = 0; f < nf; f++) {
        const lado = (f - (nf - 1) / 2) * 0.085 + (acaso(k * 3 + f) - 0.5) * 0.04, comp = 0.1 + acaso(k * 5 + f) * 0.14, larg = 0.055 + acaso(k * 7 + f) * 0.03, cai = (acaso(k * 11 + f) - 0.5) * 0.12;
        const bx = x + tx * lado - dx * 0.07, bz = z + tz * lado - dz * 0.07;
        tufos.push([[bx - tx * larg, bz - tz * larg], [bx + tx * larg, bz + tz * larg], [bx + dx * (comp + 0.07) + tx * cai, bz + dz * (comp + 0.07) + tz * cai]]);
      }
    };
    // contorno do caminho: pontos a meia largura de cada trecho que não caem dentro de outro trecho nem do terreiro
    let k = 0;
    for (const s of segs) {
      const [ax, az, bx, bz] = s, c = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / c, uz = (bz - az) / c, r = wB / 2, pts = [];
      for (let d = 0.07; d < c; d += 0.15) for (const lado of [-1, 1]) pts.push([ax + ux * d - uz * lado * r, az + uz * d + ux * lado * r, uz * lado, -ux * lado]);
      for (const [cx, cz, a0] of [[ax, az, Math.atan2(-uz, -ux)], [bx, bz, Math.atan2(uz, ux)]]) for (let t = -80; t <= 80; t += 16) { const a = a0 + t * GR; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r, -Math.cos(a), -Math.sin(a)]); }
      for (const [x, z, dx, dz] of pts) { k++; if (aoCaminho(x, z) > r - 0.012 && !noTerreiro(x, z, 0.02) && Math.abs(x) < L - 0.1 && Math.abs(z) < L - 0.1) borda.push([x, z, dx, dz, k]); }
    }
    // contorno do terreiro (menos onde o caminho encosta)
    const ct = cantosRedondos(T.x0 - 0.25, T.z0 - 0.25, T.x1 + 0.25, T.z1 + 0.25, 0.8, 8), cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2;
    for (let i = 0; i < ct.length; i++) {
      const p = ct[i], q = ct[(i + 1) % ct.length], c = Math.hypot(q[0] - p[0], q[1] - p[1]), nn = Math.max(1, Math.round(c / 0.15));
      for (let j = 0; j < nn; j++) {
        const x = p[0] + ((q[0] - p[0]) * (j + 0.5)) / nn, z = p[1] + ((q[1] - p[1]) * (j + 0.5)) / nn;
        let dx = -(q[1] - p[1]) / c, dz = (q[0] - p[0]) / c; if (dx * (cx - x) + dz * (cz - z) < 0) { dx = -dx; dz = -dz; }
        k++; if (aoCaminho(x, z) > wB / 2 + 0.02 && Math.abs(x) < L - 0.1) borda.push([x, z, dx, dz, k]);
      }
    }
    for (const [x, z, dx, dz, kk] of borda) tufo(x, z, dx, dz, kk);
    ladrilhar(b, tufos, 0.021, P.grama, { pintar: manchas });
    // umas pedrinhas claras no caminho e uns grãos de milho no terreiro
    let j = 0;
    for (const s of segs) {
      const [ax, az, bx, bz] = s, c = Math.hypot(bx - ax, bz - az), np = Math.max(1, Math.round(c / 1.1));
      for (let i = 0; i < np; i++, j++) {
        const u = (i + 0.3 + acaso(j) * 0.4) / np, lado = (acaso(j + 5) - 0.5) * (w - 0.45);
        b.bola(0.06 + acaso(j + 2) * 0.035, P.pedrinha, { p: [ax + (bx - ax) * u + ((bz - az) / c) * lado, 0.012, az + (bz - az) * u - ((bx - ax) / c) * lado], s: [1.4, 0.32, 1], r: [0, acaso(j + 7) * 180, 0], seg: 6, aneis: 3 });
      }
    }
    for (let i = 0; i < 8; i++) b.bola(0.034, P.semente, { p: [T.x0 + 0.5 + acaso(i + 70) * (T.x1 - T.x0 - 1.0), 0.012, T.z0 + 0.5 + acaso(i + 90) * (T.z1 - T.z0 - 1.0)], s: [1, 0.5, 1], seg: 5, aneis: 3 });
  }, 21));
  return v;
}

// A cerca: mourões de seção quadrada com o topo chanfrado, duas réguas de tábua por vão e um parafuso de ferro em cada
// encontro. A sombra dela no mapa vem de uma forma mais simples (ver PROJETORES em objetos.js).
export function desenharCerca(b, sitio, simples = false) {
  const p = sitio.pasto, g = p.porteira;
  let k = 0;
  const mourao = (x, z, alt = 1.0, lado = 0.25) => {
    if (simples) return b.box(lado, alt, lado, '#000', { p: [x, 0, z] });
    b.box(lado, alt, lado, P.cerca, { p: [x, 0, z], r: [0, (acaso(k++) - 0.5) * 8, 0], q: 0.035, seg: 1, uv: { veio: 'y', m: [1.5, 2.2] }, ao: 0.25 });
    b.box(lado + 0.05, 0.07, lado + 0.05, P.madeiraClara, { p: [x, alt - 0.02, z], q: 0.025, seg: 1, uv: { m: [1.8, 2.2] } });
  };
  // um lance de (x0, z0) a (x1, z1): mourões a cada ~1,2 e duas réguas por vão, pregadas por fora (do lado da câmera)
  const lance = (x0, z0, x1, z1, comInicio, comFim) => {
    const c = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(c / 1.2)), giro = (Math.atan2(x1 - x0, z1 - z0) * 180) / Math.PI;
    const ux = (x1 - x0) / c, uz = (z1 - z0) / c, fx = Math.abs(uz) > 0.5 ? 0.13 : 0, fz = Math.abs(ux) > 0.5 ? 0.13 : 0; // para fora: +x nos lances ao longo de z, +z nos lances ao longo de x
    for (let i = 0; i <= n; i++) { if ((i === 0 && !comInicio) || (i === n && !comFim)) continue; mourao(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n); }
    for (let i = 0; i < n; i++) for (const y of [0.3, 0.66]) {
      const cx = x0 + ((x1 - x0) * (i + 0.5)) / n, cz = z0 + ((z1 - z0) * (i + 0.5)) / n, lv = c / n + 0.16;
      if (simples) { b.box(0.07, 0.2, lv, '#000', { p: [cx + fx, y, cz + fz], r: [0, giro, 0] }); continue; }
      b.box(0.075, 0.2, lv, y > 0.5 ? P.cerca : tom(P.cerca, 0.93), { p: [cx + fx, y + (acaso(k++) - 0.5) * 0.03, cz + fz], r: [(acaso(k++) - 0.5) * 3, giro, 0], q: 0.022, seg: 1, uv: { veio: 'z', m: [1.3, 2.6] } });
      for (const e of [-1, 1]) b.add(new THREE.BoxGeometry(0.055, 0.055, 0.03), P.ferro, { p: [cx + fx * 1.34 + ux * e * (c / n / 2), y + 0.1, cz + fz * 1.34 + uz * e * (c / n / 2)], r: [0, fx ? 90 : 0, 45] });
    }
  };
  lance(p.x0, p.z0, p.x1, p.z0, true, true);
  lance(p.x0, p.z0, p.x0, p.z1, false, true);
  lance(p.x1, p.z0, p.x1, p.z1, false, true);
  lance(p.x0, p.z1, g.x0, p.z1, false, false);
  lance(g.x1, p.z1, p.x1, p.z1, false, false);
  // mourões mais altos na porteira (que fica sempre aberta)
  for (const x of [g.x0, g.x1]) mourao(x, p.z1, 1.22, 0.28);
}
export function cerca({ sitio }) {
  const v = new Visual('cerca');
  v.raiz.add(malha((b) => desenharCerca(b, sitio), 31));
  return v;
}
