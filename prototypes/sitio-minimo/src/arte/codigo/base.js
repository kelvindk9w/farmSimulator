// Peças comuns do conjunto de arte "codigo": tudo é modelado por código, com cores chapadas por vértice,
// no mesmo estilo de tools/visual-refs (de onde vêm o construtor de malhas, a paleta e o avatar).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Builder, MAT } from '../../../../../tools/visual-refs/src/lib/builder.js';
import { C, mix, shade } from '../../../../../tools/visual-refs/src/lib/palette.js';

export { THREE, Builder, MAT, C, mix, shade };
export const TAU = Math.PI * 2;
export const GRAUS = Math.PI / 180;
export const limitar = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const suave = (t) => { t = limitar(t); return t * t * (3 - 2 * t); };
// sobe de 0 a 1 entre a e b (suave)
export const rampa = (t, a, b) => suave((t - a) / (b - a));
// 0 fora de [a, b]; sobe em "sobe" segundos e desce em "desce" segundos
export const janela = (t, a, b, sobe = 0.15, desce = 0.15) => suave((t - a) / sobe) * (1 - suave((t - (b - desce)) / desce));
// aproxima "atual" de "alvo" sem tranco (k = rapidez por segundo)
export const amortecer = (atual, alvo, k, dt) => atual + (alvo - atual) * (1 - Math.exp(-k * dt));
// número pseudoaleatório fixo para um inteiro (para variar tempos e tamanhos sem sorteio)
export const acaso = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// passa do alvo e volta (para coisas que "pulam" ao aparecer)
export const elastico = (t) => { t = limitar(t); return t === 1 ? 1 : 1 - Math.exp(-6.5 * t) * Math.cos(t * 11.5); };

// mola amortecida: segue um alvo com um pouco de atraso e de balanço
export class Mola {
  constructor(x = 0, freq = 5, amort = 0.5) { this.x = x; this.v = 0; this.freq = freq; this.amort = amort; }
  passo(alvo, dt) {
    const w = this.freq * TAU, n = Math.max(1, Math.ceil(dt / 0.01)), h = dt / n;
    for (let i = 0; i < n; i++) { this.v += (-w * w * (this.x - alvo) - 2 * this.amort * w * this.v) * h; this.x += this.v * h; }
    return this.x;
  }
  por(x) { this.x = x; this.v = 0; return x; }
}

// malha estática feita com o construtor (um desenho = uma chamada de desenho)
export function malha(desenhar, semente = 7, material = null) {
  const b = new Builder(semente);
  desenhar(b);
  const m = new THREE.Mesh(b.build(), material || MAT());
  return m;
}

// Malha articulada com skinning rígido (cada vértice segue um osso), como o avatar.
// ossos: [[nome, pai | null, [x, y, z]]] (posição de repouso relativa ao pai; o primeiro é a raiz)
// desenhar(b, nome): desenha as partes daquele osso em coordenadas locais do osso.
export function articulado(ossos, desenhar, semente = 5) {
  const indice = {};
  const bones = ossos.map(([nome], i) => { indice[nome] = i; const b = new THREE.Bone(); b.name = nome; return b; });
  ossos.forEach(([, pai, pos], i) => { bones[i].position.set(pos[0], pos[1], pos[2]); if (pai) bones[indice[pai]].add(bones[i]); });
  bones[0].updateMatrixWorld(true);
  const geos = [];
  ossos.forEach(([nome], i) => {
    const b = new Builder(semente + i * 3);
    desenhar(b, nome);
    for (const g of b.parts) { g.applyMatrix4(bones[i].matrixWorld); g.userData.osso = i; geos.push(g); }
  });
  const junta = mergeGeometries(geos, false);
  const n = junta.attributes.position.count;
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  let k = 0;
  for (const g of geos) { const c = g.attributes.position.count; for (let j = 0; j < c; j++, k++) { si[k * 4] = g.userData.osso; sw[k * 4] = 1; } }
  junta.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  junta.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  const mesh = new THREE.SkinnedMesh(junta, MAT());
  mesh.frustumCulled = false;
  const grupo = new THREE.Group();
  grupo.add(bones[0]); grupo.add(mesh);
  mesh.bind(new THREE.Skeleton(bones));
  const o = {}, repouso = {};
  ossos.forEach(([nome, , pos], i) => { o[nome] = bones[i]; repouso[nome] = pos; });
  return { grupo, malha: mesh, o, repouso };
}

// Sombra simples: uma mancha escura e transparente no chão (no lugar de mapas de sombra).
const GEO_SOMBRA = new THREE.CircleGeometry(1, 22).rotateX(-Math.PI / 2);
GEO_SOMBRA.userData.compartilhada = true;
const MAT_SOMBRA = new THREE.MeshBasicMaterial({ color: 0x16260f, transparent: true, opacity: 0.2, depthWrite: false });
export function sombra(rx, rz, x = 0, z = 0, y = 0.028) {
  const m = new THREE.Mesh(GEO_SOMBRA, MAT_SOMBRA);
  m.scale.set(rx, 1, rz); m.position.set(x, y, z); m.renderOrder = 2;
  return m;
}

const GEO_SOMBRA_RET = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
GEO_SOMBRA_RET.userData.compartilhada = true;
export function sombraRet(w, d, x = 0, z = 0, y = 0.028) {
  const m = new THREE.Mesh(GEO_SOMBRA_RET, MAT_SOMBRA);
  m.scale.set(w, 1, d); m.position.set(x, y, z); m.renderOrder = 2;
  return m;
}

// Partículas simples (gotas, sementes, folhas): uma malha instanciada, uma chamada de desenho.
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler();
const mats = new Map();
function matParticula(cor) {
  const k = new THREE.Color(cor).getHexString();
  if (!mats.has(k)) mats.set(k, new THREE.MeshLambertMaterial({ color: new THREE.Color(cor) }));
  return mats.get(k);
}
export class Borrifo {
  // n: máximo de partículas vivas; raio: tamanho; g: gravidade; vida: segundos; chao: altura em que somem (null = não somem)
  constructor(n, cor, raio, { g = 9, vida = 0.8, chao = null, achatada = 1, gira = 0, arrasto = 0 } = {}) {
    const geo = new THREE.IcosahedronGeometry(raio, 0);
    if (achatada !== 1) geo.scale(1, achatada, 1);
    this.mesh = new THREE.InstancedMesh(geo, matParticula(cor), n);
    this.mesh.frustumCulled = false;
    this.n = n; this.g = g; this.vida = vida; this.chao = chao; this.gira = gira; this.arrasto = arrasto;
    this.p = []; for (let i = 0; i < n; i++) this.p.push({ t: -1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, s: 1, vida });
    this.prox = 0; this.vivas = 0; this.conta = 0;
    this._gravar();
  }
  // posição e velocidade no espaço do pai da malha
  emitir(x, y, z, vx, vy, vz, s = 1, vida = this.vida) {
    const p = this.p[this.prox]; this.prox = (this.prox + 1) % this.n; this.conta++;
    p.t = 0; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.s = s; p.vida = vida;
  }
  passo(dt) {
    this.vivas = 0;
    for (const p of this.p) {
      if (p.t < 0) continue;
      p.t += dt;
      p.vy -= this.g * dt;
      if (this.arrasto) { const k = Math.exp(-this.arrasto * dt); p.vx *= k; p.vz *= k; p.vy *= k; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.t >= p.vida || (this.chao !== null && p.y < this.chao)) p.t = -1; else this.vivas++;
    }
    this._gravar();
  }
  limpar() { for (const p of this.p) p.t = -1; this.vivas = 0; this._gravar(); }
  _gravar() {
    let i = 0;
    for (const p of this.p) {
      if (p.t < 0) continue;
      const u = p.t / p.vida, s = p.s * (u < 0.15 ? 0.4 + 4 * u : u > 0.8 ? Math.max(0.05, (1 - u) / 0.2) : 1);
      if (this.gira) _q.setFromEuler(_e.set(p.t * this.gira, p.t * this.gira * 0.7 + i, 0)); else _q.identity();
      this.mesh.setMatrixAt(i++, _m.compose(_p.set(p.x, p.y, p.z), _q, _s.set(s, s, s)));
    }
    this.mesh.count = i;
    this.mesh.visible = i > 0;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// Perna de bicho com duas partes, no plano que vai para a frente (Z) e para cima (Y).
// (dz, dy) = onde o pé tem de ficar em relação ao quadril; l1, l2 = comprimentos; dobra = +1 joelho para a frente, -1 para trás.
// Devolve [rxDeCima, rxDeBaixo] em radianos (rx negativo leva a perna para a frente, como no avatar).
export function pernaDeBicho(dz, dy, l1, l2, dobra = 1) {
  let d = Math.hypot(dz, dy);
  const max = l1 + l2 - 1e-4, min = Math.abs(l1 - l2) + 1e-4;
  d = Math.max(min, Math.min(max, d));
  const base = Math.atan2(-dz, -dy); // ângulo da reta quadril-pé (0 = para baixo; negativo = pé para a frente)
  const a = Math.acos(limitar((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)); // ângulo no quadril
  const j = Math.PI - Math.acos(limitar((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1)); // quanto o joelho dobra
  return [base - dobra * a, dobra * j];
}
