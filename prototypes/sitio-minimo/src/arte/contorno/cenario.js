// Conjunto "contorno": o chão (bloco de grama com a faixa de terra, caminho e terreiro com a beirada riscada) e a cerca
// do pasto (mourões quadrados e réguas de tábua). Parados: uma malha cada.
import * as THREE from 'three';
import { Visual } from '../registro.js';
import { malha, acaso } from '../codigo/base.js';
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

// chapa lisa deitada no chão (sem espessura e sem traço): contorno de pontos [x, z], na altura y
function chapa(b, pts, y, cor) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1]))), 1);
  g.rotateX(-Math.PI / 2);
  return b.add(g, cor, { p: [0, y, 0], semTraco: true });
}
// faixa de pontas redondas entre dois pontos, largura larg
function faixa(b, x0, z0, x1, z1, larg, y, cor, n = 6) {
  const a = Math.atan2(z1 - z0, x1 - x0), r = larg / 2, pts = [];
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + (Math.PI * i) / n; pts.push([x1 + Math.cos(t) * r, z1 + Math.sin(t) * r]); }
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + (Math.PI * i) / n; pts.push([x0 + Math.cos(t) * r, z0 + Math.sin(t) * r]); }
  return chapa(b, pts, y, cor);
}
function elipse(b, x, z, rx, rz, giro, y, cor, n = 8) {
  const pts = [], c = Math.cos(giro), s = Math.sin(giro);
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, u = Math.cos(t) * rx, w = Math.sin(t) * rz; pts.push([x + u * c - w * s, z + u * s + w * c]); }
  return chapa(b, pts, y, cor);
}

// largura da beirada riscada do caminho e do terreiro (o traço deles é uma chapa escura um pouco maior, por baixo)
const RISCO = 0.05;

export function chao({ sitio }) {
  const v = new Visual('chao');
  const L = sitio.terreno, w = sitio.larguraCaminho + 0.12, T = sitio.terreiro;
  v.raiz.add(malha((b) => {
    // bloco em camadas: a grama por cima, uma faixa de grama escura na beirada, um risco, e a faixa de terra
    b.slab(cantosRedondos(-L, -L, L, L, 0.6, 5), 0.1, P.grama, { p: [0, -0.1, 0], q: 0.03 });
    b.slab(cantosRedondos(-L, -L, L, L, 0.6, 5), 0.26, P.gramaBorda, { p: [0, -0.35, 0], q: 0.02 });
    b.slab(cantosRedondos(-L - 0.012, -L - 0.012, L + 0.012, L + 0.012, 0.61, 5), 0.035, P.traco, { p: [0, -0.37, 0], q: 0.001, semTraco: true });
    b.slab(cantosRedondos(-L, -L, L, L, 0.6, 5), 0.4, P.faixa, { p: [0, -0.76, 0], q: 0.05 });
    // terreiro das galinhas: areia clara com a beirada riscada
    chapa(b, cantosRedondos(T.x0 - 0.13 - RISCO, T.z0 - 0.13 - RISCO, T.x1 + 0.13 + RISCO, T.z1 + 0.13 + RISCO, 0.7 + RISCO), 0.004, P.terreiroBorda);
    chapa(b, cantosRedondos(T.x0 - 0.13, T.z0 - 0.13, T.x1 + 0.13, T.z1 + 0.13, 0.7), 0.008, P.terreiro);
    // caminho de terra: a beirada riscada por baixo, o miolo claro por cima
    for (const [larg, cor, y] of [[w + 2 * RISCO, P.caminhoBorda, 0.012], [w, P.caminho, 0.016]]) {
      for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) faixa(b, linha[i - 1][0], linha[i - 1][1], linha[i][0], linha[i][1], larg, y, cor);
    }
    // marcas de pedrinha no caminho: ovais claras, poucas
    let k = 0;
    for (const linha of sitio.caminhos) for (let i = 1; i < linha.length; i++) {
      const dx = linha[i][0] - linha[i - 1][0], dz = linha[i][1] - linha[i - 1][1], c = Math.hypot(dx, dz), n = Math.max(1, Math.round(c / 0.8));
      for (let j = 0; j < n; j++, k++) {
        const u = (j + 0.3 + acaso(k) * 0.4) / n, lado = (acaso(k + 5) - 0.5) * (w - 0.5);
        const x = linha[i - 1][0] + dx * u + (dz / c) * lado, z = linha[i - 1][1] + dz * u - (dx / c) * lado;
        elipse(b, x, z, 0.11 + acaso(k + 2) * 0.05, 0.07 + acaso(k + 3) * 0.03, Math.atan2(dz, dx) + (acaso(k + 7) - 0.5), 0.02, P.pedrinha, 8);
      }
    }
    // pintas mais escuras na areia do terreiro
    for (let i = 0; i < 9; i++) elipse(b, T.x0 + 0.4 + acaso(i + 70) * (T.x1 - T.x0 - 0.8), T.z0 + 0.4 + acaso(i + 90) * (T.z1 - T.z0 - 0.8), 0.05, 0.035, acaso(i) * 3, 0.012, P.terreiroBorda, 6);
  }, 21));
  return v;
}

export function cerca({ sitio }) {
  const v = new Visual('cerca');
  const p = sitio.pasto, g = p.porteira;
  v.raiz.add(malha((b) => {
    // mourão quadrado com a cabeça mais clara
    const mourao = (x, z, alt = 1.0, l = 0.25) => {
      b.ret(l + 2 * RISCO, l + 2 * RISCO, P.traco, { p: [x, 0.022, z] }); // pegada
      b.box(l, alt, l, P.cerca, { p: [x, 0, z], q: 0.035, seg: 1 });
      b.box(l + 0.035, 0.07, l + 0.035, P.regua, { p: [x, alt - 0.02, z], q: 0.025, seg: 1 });
    };
    // um lance de cerca de (x0, z0) a (x1, z1): mourões a cada ~1,2 e duas réguas de tábua por vão
    const lance = (x0, z0, x1, z1, comInicio, comFim) => {
      const c = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(c / 1.2)), giro = (Math.atan2(x1 - x0, z1 - z0) * 180) / Math.PI;
      for (let i = 0; i <= n; i++) { if ((i === 0 && !comInicio) || (i === n && !comFim)) continue; mourao(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n); }
      for (const y of [0.3, 0.64]) b.box(0.1, 0.17, c, P.regua, { p: [(x0 + x1) / 2, y, (z0 + z1) / 2], r: [0, giro, 0], q: 0.03, seg: 1 });
    };
    lance(p.x0, p.z0, p.x1, p.z0, true, true);
    lance(p.x0, p.z0, p.x0, p.z1, false, true);
    lance(p.x1, p.z0, p.x1, p.z1, false, true);
    lance(p.x0, p.z1, g.x0, p.z1, false, false);
    lance(g.x1, p.z1, p.x1, p.z1, false, false);
    // mourões mais altos na porteira (que fica sempre aberta)
    for (const x of [g.x0, g.x1]) mourao(x, p.z1, 1.2, 0.28);
  }, 31));
  return v;
}
