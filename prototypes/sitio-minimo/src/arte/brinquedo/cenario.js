// Conjunto "brinquedo": o chão (bloco de terra de borda arredondada, caminho, terreiro, tufos gordinhos, florzinhas)
// e a cerca do pasto (mourões e réguas roliços). Parados: uma malha cada.
import * as THREE from 'three';
import { Visual } from '../registro.js';
import { TIPOS } from '../../jogo/contrato.js';
import { malha, acaso, mix } from '../codigo/base.js';
import { P } from './kit.js';

const GR = Math.PI / 180;
// retângulo de cantos arredondados (pontos x, z)
function cantosRedondos(x0, z0, x1, z1, r, n = 6) {
  const pts = [];
  for (const [cx, cz, a0] of [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]]) {
    for (let i = 0; i <= n; i++) { const a = (a0 + (90 * i) / n) * GR; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  }
  return pts;
}
const distSeg = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; const u = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)) : 0; return Math.hypot(px - ax - dx * u, pz - az - dz * u); };

// chapa lisa deitada no chão (sem espessura): contorno de pontos [x, z], na altura y
function chapa(b, pts, y, cor) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1]))), 1);
  g.rotateX(-Math.PI / 2);
  return b.add(g, cor, { p: [0, y, 0] });
}
// faixa de pontas redondas entre dois pontos, largura larg
function faixa(b, x0, z0, x1, z1, larg, y, cor, n = 7) {
  const a = Math.atan2(z1 - z0, x1 - x0), r = larg / 2, pts = [];
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + (Math.PI * i) / n; pts.push([x1 + Math.cos(t) * r, z1 + Math.sin(t) * r]); }
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + (Math.PI * i) / n; pts.push([x0 + Math.cos(t) * r, z0 + Math.sin(t) * r]); }
  return chapa(b, pts, y, cor);
}
function elipse(b, x, z, rx, rz, giro, y, cor, n = 10) {
  const pts = [], c = Math.cos(giro), s = Math.sin(giro);
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, u = Math.cos(t) * rx, w = Math.sin(t) * rz; pts.push([x + u * c - w * s, z + u * s + w * c]); }
  return chapa(b, pts, y, cor);
}

export function chao({ sitio }) {
  const v = new Visual('chao');
  const L = sitio.terreno, w = sitio.larguraCaminho + 0.12, T = sitio.terreiro, Pa = sitio.pasto;
  const longeDoCaminho = (x, z, d) => sitio.caminhos.every((l) => l.every((p, i) => i === 0 || distSeg(x, z, l[i - 1][0], l[i - 1][1], p[0], p[1]) > d));
  const livre = (x, z, d) => {
    if (Math.abs(x) > L - 0.5 || Math.abs(z) > L - 0.5 || !longeDoCaminho(x, z, w / 2 + d)) return false;
    if (x > T.x0 - 0.5 && x < T.x1 + 0.5 && z > T.z0 - 0.5 && z < T.z1 + 0.5) return false;
    for (const o of Object.values(sitio.objetos)) {
      const t = TIPOS[o.tipo]; if (o.tipo === 'vaca' || o.tipo === 'galinha') continue;
      const r = (t.tamanho ? Math.hypot(t.tamanho[0], t.tamanho[1]) / 2 : (t.raio || t.raioTronco || 0.5)) + d + 0.3;
      if (Math.hypot(x - o.x, z - o.z) < r) return false;
      for (const p of Object.values(t.pontos)) if (Math.hypot(x - o.x - p[0], z - o.z - p[2]) < 0.7) return false;
    }
    return true;
  };
  v.raiz.add(malha((b) => {
    // bloco: grama por cima, com a borda rolando para baixo, e uma faixa grossa de terra
    b.slab(cantosRedondos(-L, -L, L, L, 0.6, 7), 0.22, P.grama, { p: [0, -0.22, 0], q: 0.1 });
    b.slab(cantosRedondos(-L + 0.02, -L + 0.02, L - 0.02, L - 0.02, 0.6, 7), 0.46, P.faixa, { p: [0, -0.6, 0], q: 0.12, grad: P.terra });
    // pasto: chão batido claro no ponto de ordenha
    elipse(b, Pa.ordenha.x - 0.2, Pa.ordenha.z + 0.25, 1.0, 0.75, 0.3, 0.004, mix(new THREE.Color(P.grama), new THREE.Color(P.terreiro), 0.28), 14);
    // terreiro das galinhas: areia clara com a beirada um pouco mais escura
    chapa(b, cantosRedondos(T.x0 - 0.25, T.z0 - 0.25, T.x1 + 0.25, T.z1 + 0.25, 0.8), 0.005, P.terreiroBorda);
    chapa(b, cantosRedondos(T.x0 - 0.13, T.z0 - 0.13, T.x1 + 0.13, T.z1 + 0.13, 0.7), 0.009, P.terreiro);
    // caminho de terra: beirada mais escura por baixo, miolo claro por cima
    for (const [larg, cor, y] of [[w + 0.2, P.caminhoBorda, 0.012], [w, P.caminho, 0.016]]) {
      for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) faixa(b, linha[i - 1][0], linha[i - 1][1], linha[i][0], linha[i][1], larg, y, cor);
    }
    // marcas de pedrinha: ovais claras, poucas e grandes
    let k = 0;
    for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) {
      const dx = linha[i][0] - linha[i - 1][0], dz = linha[i][1] - linha[i - 1][1], c = Math.hypot(dx, dz), n = Math.max(1, Math.round(c / 0.75));
      for (let j = 0; j < n; j++, k++) {
        const u = (j + 0.3 + acaso(k) * 0.4) / n, lado = (acaso(k + 5) - 0.5) * (w - 0.5);
        const x = linha[i - 1][0] + dx * u + (dz / c) * lado, z = linha[i - 1][1] + dz * u - (dx / c) * lado;
        elipse(b, x, z, 0.12 + acaso(k + 2) * 0.05, 0.075 + acaso(k + 3) * 0.03, Math.atan2(dz, dx) + (acaso(k + 7) - 0.5), 0.02, P.pedrinha, 9);
      }
    }
    // grãos de milho no terreiro (bolinhas baixas)
    for (let i = 0; i < 9; i++) b.bola(0.035, P.milhoEspiga, { p: [T.x0 + 0.5 + acaso(i + 70) * (T.x1 - T.x0 - 1.0), 0.012, T.z0 + 0.5 + acaso(i + 90) * (T.z1 - T.z0 - 1.0)], s: [1, 0.5, 1], seg: 5, aneis: 3 });
    // tufos de capim gordinhos (três folhas) e umas florzinhas
    let postos = 0;
    for (let i = 0; i < 400 && postos < 11; i++) {
      const x = (acaso(i * 2 + 300) * 2 - 1) * L, z = (acaso(i * 2 + 301) * 2 - 1) * L;
      if (!livre(x, z, 0.35)) continue;
      const flor = postos % 4 === 3;
      b.group({ p: [x, 0, z], r: [0, acaso(i) * 360, 0], s: 1.05 + acaso(i + 1) * 0.4 }, () => {
        if (flor) {
          b.cap(0.02, 0.2, P.tufo, { n: 5, nc: 1 });
          b.bola(0.066, postos % 8 === 3 ? '#fff6dc' : '#ffd9e6', { p: [0, 0.2, 0], s: [1, 0.72, 1], seg: 8, aneis: 5 });
          b.bola(0.032, P.milhoEspiga, { p: [0, 0.236, 0], s: [1, 0.6, 1], seg: 6, aneis: 3 });
          b.folha(0.17, 0.09, P.tufoClaro, { p: [0.01, 0, 0], r: [0, 20, -35], dobra: 40, esp: 0.6 });
        } else {
          // uma folha em pé no meio e três caindo para os lados (em três direções, para o tufo ter corpo de qualquer lado)
          b.folha(0.42, 0.13, P.tufo, { esp: 0.7, dobra: 14 });
          for (let k = 0; k < 3; k++) b.folha(0.31 - k * 0.02, 0.12, k === 1 ? P.tufo : P.tufoClaro, { p: [0, 0, 0], r: [0, 35 + k * 120, -34], esp: 0.7, dobra: 38 });
        }
      });
      postos++;
    }
  }, 21));
  return v;
}

export function cerca({ sitio }) {
  const v = new Visual('cerca');
  const p = sitio.pasto, g = p.porteira;
  v.raiz.add(malha((b) => {
    const mourao = (x, z, alt = 0.98, r = 0.155) => b.cap(r, alt + r, P.cerca, { p: [x, -r, z], n: 10, nc: 2 });
    // um lance de cerca de (x0, z0) a (x1, z1): mourões a cada ~1,2 e duas réguas roliças por vão
    const lance = (x0, z0, x1, z1, comInicio, comFim) => {
      const c = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(c / 1.2)), giro = (Math.atan2(x1 - x0, z1 - z0) * 180) / Math.PI;
      for (let i = 0; i <= n; i++) { if ((i === 0 && !comInicio) || (i === n && !comFim)) continue; mourao(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n); }
      const ux = (x1 - x0) / c, uz = (z1 - z0) / c;
      for (const y of [0.34, 0.68]) b.cap(0.085, c + 0.1, P.regua, { p: [x0 - ux * 0.05, y, z0 - uz * 0.05], r: [90, giro, 0] });
    };
    lance(p.x0, p.z0, p.x1, p.z0, true, true);
    lance(p.x0, p.z0, p.x0, p.z1, false, true);
    lance(p.x1, p.z0, p.x1, p.z1, false, true);
    lance(p.x0, p.z1, g.x0, p.z1, false, false);
    lance(g.x1, p.z1, p.x1, p.z1, false, false);
    // mourões mais altos na porteira (que fica sempre aberta)
    for (const x of [g.x0, g.x1]) mourao(x, p.z1, 1.2, 0.17);
  }, 31));
  return v;
}
