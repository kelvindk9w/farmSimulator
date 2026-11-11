// Mini-DSL de modelagem procedural: acumula primitivas coloridas por vértice
// e devolve UMA BufferGeometry (posição, normal, cor) => um draw call por modelo.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rng } from './rng.js';

const DEG = Math.PI / 180;
const _c1 = new THREE.Color(), _c2 = new THREE.Color();

export function col(c) {
  if (c && c.isColor) return c;
  return new THREE.Color(c);
}

export function matFrom(o = {}) {
  const m = new THREE.Matrix4();
  const p = o.p || [0, 0, 0];
  const r = o.r || [0, 0, 0];
  const s = o.s === undefined ? [1, 1, 1] : typeof o.s === 'number' ? [o.s, o.s, o.s] : o.s;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, o.order || 'YXZ'));
  m.compose(new THREE.Vector3(p[0], p[1], p[2]), q, new THREE.Vector3(s[0], s[1], s[2]));
  return m;
}

function flipWinding(g) {
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name];
    const n = a.itemSize;
    const arr = a.array;
    for (let i = 0; i < arr.length; i += n * 3) {
      for (let k = 0; k < n; k++) {
        const t = arr[i + n + k];
        arr[i + n + k] = arr[i + 2 * n + k];
        arr[i + 2 * n + k] = t;
      }
    }
  }
}

export class Builder {
  constructor(seed = 7) {
    this.parts = [];
    this.stack = [new THREE.Matrix4()];
    this.rand = rng(seed);
    this.tag = null; // etiqueta opcional (ex.: índice do osso) gravada por parte
    this.glow = false; // quando true, as partes vão para a camada sem iluminação (janelas acesas)
    this.glowParts = [];
  }
  get M() { return this.stack[this.stack.length - 1]; }
  push(o) { this.stack.push(this.M.clone().multiply(matFrom(o))); return this; }
  pop() { this.stack.pop(); return this; }
  group(o, fn) { this.push(o); fn(this); this.pop(); return this; }

  // Adiciona uma geometria three.js com cor (ou gradiente vertical) e transformação local.
  add(geo, color, o = {}) {
    let g = geo;
    if (!o.smooth) {
      g = g.index ? g.toNonIndexed() : g.clone();
    } else {
      g = g.index ? g.toNonIndexed() : g.clone();
    }
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    const local = matFrom(o);
    g.applyMatrix4(local);
    // cor por vértice (gradiente em Y local antes da matriz do grupo)
    const pos = g.attributes.position;
    const n = pos.count;
    const colors = new Float32Array(n * 3);
    const c0 = _c1.copy(col(color));
    let y0 = Infinity, y1 = -Infinity;
    if (o.grad || o.ao) {
      for (let i = 0; i < n; i++) { const y = pos.getY(i); if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    const cTop = o.grad ? _c2.copy(col(o.grad)) : null;
    const jit = o.jit || 0;
    const tmp = new THREE.Color();
    for (let f = 0; f < n; f += 3) {
      const j = jit ? 1 + (this.rand() - 0.5) * 2 * jit : 1;
      for (let k = 0; k < 3; k++) {
        const i = f + k;
        tmp.copy(c0);
        if (o.grad || o.ao) {
          const t = y1 > y0 ? (pos.getY(i) - y0) / (y1 - y0) : 1;
          if (cTop) tmp.lerp(cTop, t);
          if (o.ao) tmp.multiplyScalar(1 - o.ao * (1 - t) * (1 - t));
        }
        if (jit) tmp.multiplyScalar(j);
        colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
      }
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const full = this.M;
    g.applyMatrix4(full);
    const det = local.determinant() * full.determinant();
    if (det < 0) flipWinding(g);
    if (!o.smooth) g.computeVertexNormals();
    else if (det < 0) { /* normais já transformadas pela matriz normal */ }
    if (this.tag !== null) g.userData.tag = this.tag;
    (this.glow ? this.glowParts : this.parts).push(g);
    return this;
  }

  // ---- primitivas (origem na base, exceto esferas) ----
  box(w, h, d, color, o = {}) {
    const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }
  // caixa com topo de tamanho diferente (tronco de pirâmide)
  tbox(wb, db, wt, dt, h, color, o = {}) {
    const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const top = p.getY(i) > 0.5;
      p.setXYZ(i, p.getX(i) * (top ? wt : wb), p.getY(i) * h, p.getZ(i) * (top ? dt : db));
    }
    g.computeVertexNormals();
    return this.add(g, color, o);
  }
  cyl(rt, rb, h, seg, color, o = {}) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg || 8, 1, !!o.open); g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }
  cone(r, h, seg, color, o = {}) {
    const g = new THREE.ConeGeometry(r, h, seg || 8, 1, !!o.open); g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }
  sph(r, ws, hs, color, o = {}) {
    return this.add(new THREE.SphereGeometry(r, ws || 8, hs || 6), color, o);
  }
  ico(r, detail, color, o = {}) {
    return this.add(new THREE.IcosahedronGeometry(r, detail || 0), color, o);
  }
  // "pedra"/"copa" irregular: icosaedro com vértices perturbados
  blob(r, detail, color, o = {}) {
    let g = new THREE.IcosahedronGeometry(r, detail || 0);
    g.deleteAttribute('uv'); g.deleteAttribute('normal');
    g = mergeVertices(g, 1e-4);
    const p = g.attributes.position;
    const amt = o.rough === undefined ? 0.18 : o.rough;
    for (let i = 0; i < p.count; i++) {
      const k = 1 + (this.rand() - 0.5) * 2 * amt;
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return this.add(g, color, o);
  }
  lathe(pts, seg, color, o = {}) {
    const g = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg || 10);
    return this.add(g, color, o);
  }
  // polígono 2D (x,y) extrudado em Z, centrado em Z
  ext(pts, depth, color, o = {}) {
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return this.add(g, color, o);
  }
  // polígono deitado no chão (pontos x,z), espessura h para cima
  slab(pts, h, color, o = {}) {
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return this.add(g, color, o);
  }
  // disco/elipse no chão
  disc(rx, rz, seg, h, color, o = {}) {
    const pts = [];
    for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push([Math.cos(a) * rx, Math.sin(a) * rz]); }
    return this.slab(pts, h, color, o);
  }
  // telhado de duas águas: cumeeira ao longo de Z
  gable(w, h, d, color, o = {}) {
    return this.ext([[-w / 2, 0], [w / 2, 0], [0, h]], d, color, o);
  }
  // telhado de quatro águas (cumeeira ao longo de X, comprimento ridge)
  hip(w, h, d, ridge, color, o = {}) {
    const hw = w / 2, hd = d / 2, hr = Math.min(ridge, w) / 2;
    const v = [
      [-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd], [-hr, h, 0], [hr, h, 0],
    ];
    const tris = [
      [3, 2, 5], [3, 5, 4], // frente (+z)
      [1, 0, 4], [1, 4, 5], // fundo (-z)
      [0, 3, 4], // lado -x
      [2, 1, 5], // lado +x
      [0, 1, 2], [0, 2, 3], // base
    ];
    const arr = [];
    for (const t of tris) for (const i of t) arr.push(...v[i]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    g.computeVertexNormals();
    return this.add(g, color, o);
  }
  // tubo ao longo de pontos 3D
  tube(pts, r, seg, color, o = {}) {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const g = new THREE.TubeGeometry(curve, o.steps || pts.length * 3, r, seg || 5, false);
    return this.add(g, color, o);
  }
  // folha/lâmina curva de dupla face. Nasce na origem, cresce em +Y e dobra para +Z.
  // len: comprimento, w: largura máx., bend: graus de curvatura total, fold: dobra em V
  leaf(len, w, bend, color, o = {}) {
    const steps = o.steps || 4;
    const pos = [];
    const fold = o.fold === undefined ? 0.25 : o.fold;
    const rows = [];
    let y = 0, z = 0, ang = (o.start || 0) * DEG;
    const dA = (bend * DEG) / steps, dl = len / steps;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const prof = o.profile ? o.profile(t) : Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.88)) ** 0.7;
      const hw = (w / 2) * prof;
      // direção normal local (perpendicular à lâmina) para a dobra em V
      const ny = -Math.sin(ang), nz = Math.cos(ang);
      rows.push({ c: [0, y, z], l: [-hw, y - ny * hw * fold * -1, z - nz * hw * fold * -1], r: [hw, y - ny * hw * fold * -1, z - nz * hw * fold * -1] });
      y += Math.cos(ang) * dl; z += Math.sin(ang) * dl; ang += dA;
    }
    const tri = (a, b, c) => pos.push(...a, ...b, ...c);
    for (let i = 0; i < steps; i++) {
      const A = rows[i], B = rows[i + 1];
      // metade esquerda e direita, frente e verso
      tri(A.l, A.c, B.c); tri(A.l, B.c, B.l);
      tri(A.c, A.r, B.r); tri(A.c, B.r, B.c);
      tri(A.c, A.l, B.c); tri(B.c, A.l, B.l);
      tri(A.r, A.c, B.r); tri(B.r, A.c, B.c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.computeVertexNormals();
    return this.add(g, color, o);
  }

  get triangles() { return this.parts.reduce((s, g) => s + g.attributes.position.count / 3, 0); }

  build() {
    if (!this.parts.length) return new THREE.BufferGeometry();
    const g = mergeGeometries(this.parts, false);
    g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }
  glowMesh() {
    if (!this.glowParts.length) return null;
    const m = new THREE.Mesh(mergeGeometries(this.glowParts, false), new THREE.MeshBasicMaterial({ vertexColors: true }));
    m.name = 'brilho';
    return m;
  }
  mesh(material) {
    const m = new THREE.Mesh(this.build(), material || MAT());
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
}

let _mat = null;
// Material único compartilhado por todo o cenário (cores por vértice, sem texturas).
export function MAT() {
  if (!_mat) _mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  return _mat;
}
export function resetMat() { _mat = null; }
export { DEG };
