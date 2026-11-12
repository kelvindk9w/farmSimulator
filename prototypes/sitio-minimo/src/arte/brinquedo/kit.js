// Kit do conjunto de arte "brinquedo": o que dá a cara de brinquedo de vinil da imagem de referência
// (arte/estilo/rodada-01/estilo-a.png): formas arredondadas com normais suaves, cores quentes e saturadas sem
// microtextura, material fosco, sol de cima e da esquerda com sombra projetada suave e sombra de contato.
// Os esqueletos e a animação são os do conjunto "codigo"; aqui só muda a roupa (ver comEstilo em ../codigo/base.js).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toCreasedNormals, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Builder, col } from '../../../../../tools/visual-refs/src/lib/builder.js';

// ---------------- cores ----------------
// Medidas na imagem de referência, nas faces viradas para cima (onde a luz deste conjunto vale 1).
export const P = {
  grama: '#97c63a', gramaClara: '#a6d145', gramaEscura: '#86b830', tufo: '#5fae2c', tufoClaro: '#7cc637',
  terra: '#a65a2a', terraEscura: '#8f4b25', terraClara: '#c47a3c', terraMolhada: '#7a3f1e',
  faixa: '#a4582a', faixaEscura: '#8a4520',
  caminho: '#f0a85a', caminhoBorda: '#e09148', pedrinha: '#fcc377', terreiro: '#f4c874', terreiroBorda: '#e9b660',
  madeira: '#d08a3c', madeiraClara: '#e2a24e', madeiraEscura: '#a9642a', madeiraSombra: '#7c431a', tronco: '#8a4a20', troncoEscuro: '#6f3916',
  telha: '#e85424', telhaClara: '#f0683a', telhaEscura: '#c9461f',
  portaVerde: '#4e9c35', portaVerdeEscuro: '#3f8a2c', creme: '#f1e2b4', cremeEscuro: '#dcc99a',
  pedra: '#d3c8b2', pedraClara: '#e0d6c2', pedraMedia: '#c6baa2', pedraEscura: '#9d8f78', base: '#c9b48c',
  agua: '#3fb3e8', aguaClara: '#8fd8f6', aguaFunda: '#2a93cf',
  folha: '#5fb630', folhaClara: '#7cc93a', folhaEscura: '#47992a',
  laranja: '#f7921a', laranjaClara: '#fcae36',
  milhoCaule: '#7fbf35', milhoFolha: '#62ad2c', milhoEspiga: '#f8c62c', milhoPalha: '#d6e27a', milhoPendao: '#f0d98a',
  palha: '#f2c038', palhaEscura: '#d99d22', ovo: '#fff3da',
  vacaCreme: '#fbe6c2', vacaSombra: '#ecd0a6', vacaEscuro: '#4f4136', focinho: '#f0a28c', focinhoEscuro: '#d98572', chifre: '#f2e3c0', casco: '#5a4636',
  sino: '#f2b92c', coleira: '#d8402c',
  galinhaBranca: '#fff4d6', galinhaCaramelo: '#f5a43a', galinhaCarameloEscuro: '#dc8826', crista: '#e2382b', bico: '#f7a81f', pe: '#f39a1c',
  pele: '#d98548', peleClara: '#e69a5c', cabelo: '#3a2416', lenco: '#de3b2c', lencoEscuro: '#bf2d21', camisa: '#f6c02e', jardineira: '#2f74c0', jardineiraEscura: '#255fa3',
  bota: '#7a4424', botaEscura: '#5e3219', olho: '#2a1a12', boca: '#8c3526', bochecha: '#ef8f6a', branco: '#ffffff',
  metal: '#b9c7cf', metalEscuro: '#8fa2ad', metalClaro: '#dfe8ec', regador: '#3d9fe0', regadorEscuro: '#2f84c4',
  corda: '#d9b06a', saco: '#e6cf9c', sacoEscuro: '#cbb07a', caixote: '#d59a52', caixoteEscuro: '#b67a38',
  vidro: '#3c2a1c', leite: '#fff6e2', tampa: '#3d9fd8', crivo: '#f3ead2',
  interior: '#3a2616', parede: '#cf7a2e', paredeClara: '#d98838', paredeFriso: '#8f4f1e',
  cerca: '#c57a2b', regua: '#d38a35', cordaEscura: '#c2954e', baldeAzul: '#3d9fe0', baldeAzulEscuro: '#2f84c4',
  palhaClara: '#f9d254', troncoClaro: '#a05a28', semente: '#f2c63c', caixoteClaro: '#e3ab62',
  lingua: '#ec7a62', jardineiraClara: '#3b84cf',
};

// As cores de C (paleta de tools/visual-refs) trocadas enquanto uma fábrica do "codigo" é reaproveitada por este conjunto.
export const PALETA_DE_C = {
  grass: P.grama, grassLight: P.gramaClara, grassDark: P.gramaEscura, grassOuter: P.gramaEscura, grassTuft: P.tufo,
  flowerA: '#fff2a8', flowerB: '#ff9ec4', flowerC: '#ffffff',
  soil: P.terra, soilDark: P.terraEscura, soilLight: P.terraClara, soilWet: P.terraMolhada,
  path: P.caminho, pathLight: P.pedrinha, pathDark: P.caminhoBorda, sand: P.terreiro,
  water: P.agua, waterDeep: P.aguaFunda, waterLight: P.aguaClara, foam: '#e6f8fd',
  stone: P.pedra, stoneDark: P.pedraEscura, stoneLight: P.pedraClara,
  wood: P.madeira, woodDark: P.madeiraEscura, woodLight: P.madeiraClara, woodPale: '#ecc27e', woodGrey: '#b79a78',
  wall: P.creme, wallShade: P.cremeEscuro, wallBase: P.base, barnWall: P.madeira, barnDoor: P.portaVerde, barnDoorDark: P.portaVerdeEscuro,
  roof: P.telha, roofDark: P.telhaEscura, roofLight: P.telhaClara,
  metal: P.metal, metalDark: P.metalEscuro, metalLight: P.metalClaro, glass: P.vidro,
  rope: P.corda, hay: P.palha, hayDark: P.palhaEscura, sack: P.saco, sackDark: P.sacoEscuro,
  leaf: P.folha, leafDark: P.folhaEscura, leafLight: P.folhaClara, trunk: P.tronco, trunkDark: P.troncoEscuro,
  orangeLeaf: P.folha, orangeLeafLight: P.folhaClara, orange: P.laranja,
  cornStalk: P.milhoCaule, cornLeaf: P.milhoFolha, cornEar: P.milhoEspiga, cornHusk: P.milhoPalha, cornTassel: P.milhoPendao,
  henWhite: P.galinhaBranca, henCaramel: P.galinhaCaramelo, henBrown: P.galinhaCarameloEscuro, comb: P.crista, beak: P.bico,
  cowWhite: P.vacaCreme, cowShade: P.vacaSombra, cowDark: P.vacaEscuro, cowPink: P.focinho, horn: P.chifre, hoof: P.casco,
  clothRed: P.lenco, clothYellow: P.camisa, clothWhite: '#fff8ea', denim: P.jardineira, denimDark: P.jardineiraEscura,
  boot: P.bota, leather: P.bota, leatherDark: P.botaEscura, crate: P.caixote, crateDark: P.caixoteEscuro, can: P.regador, canDark: P.regadorEscuro,
  skin3: P.pele, hairBlack: P.cabelo, eye: P.olho, mouth: P.boca, blush: P.bochecha, straw: P.palha, strawDark: P.palhaEscura,
};

// ---------------- material ----------------
// Um material só para tudo: cor por vértice, fosco, com um brilho largo e discreto (vinil).
let _mat = null;
export function material() {
  if (!_mat) _mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 });
  return _mat;
}
const _particulas = new Map();
function matParticula(cor) {
  const k = new THREE.Color(cor).getHexString();
  if (!_particulas.has(k)) _particulas.set(k, new THREE.MeshStandardMaterial({ color: new THREE.Color(cor), roughness: 0.5, metalness: 0 }));
  return _particulas.get(k);
}

// ---------------- sombra de contato ----------------
// A sombra projetada vem do mapa de sombra do sol. Embaixo de cada objeto vai ainda uma mancha escura e bem esfumada,
// que "assenta" o objeto no chão. A mancha usa uma textura de 64 x 64 feita por código (16 KB na memória de vídeo).
let _texMancha = null;
function texturaMancha() {
  if (_texMancha) return _texMancha;
  const n = 64, dados = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const d = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) * 2, a = Math.max(0, 1 - d);
    const i = (y * n + x) * 4; dados[i] = dados[i + 1] = dados[i + 2] = 255; dados[i + 3] = Math.round(255 * a * a * (3 - 2 * a));
  }
  _texMancha = new THREE.DataTexture(dados, n, n, THREE.RGBAFormat);
  _texMancha.magFilter = THREE.LinearFilter; _texMancha.minFilter = THREE.LinearFilter; _texMancha.needsUpdate = true;
  return _texMancha;
}
const GEO_MANCHA = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
GEO_MANCHA.userData.compartilhada = true;
let _matMancha = null;
function matMancha() {
  if (!_matMancha) _matMancha = new THREE.MeshBasicMaterial({ color: 0x2b2a12, map: texturaMancha(), transparent: true, opacity: 0.34, depthWrite: false });
  return _matMancha;
}
export function sombra(rx, rz, x = 0, z = 0, y = 0.03) {
  const m = new THREE.Mesh(GEO_MANCHA, matMancha());
  m.scale.set(rx * 1.15, 1, rz * 1.15); m.position.set(x, y, z); m.renderOrder = 2;
  return m;
}
export const sombraRet = (w, d, x = 0, z = 0, y = 0.03) => sombra(w * 0.62, d * 0.62, x, z, y);

// ---------------- construtor de formas arredondadas ----------------
const GR = Math.PI / 180;
const PERFIL_FOLHA = [[0, 0], [0.8, 0.1], [1, 0.36], [0.6, 0.74], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y)); // (largura, altura) da folha gorda
// perfil (raio, altura) de um cilindro/cone com as quinas arredondadas, para o torno
function perfilRedondo(rb, rt, h, q) {
  const pts = [], n = 2;
  const qb = Math.min(q, rb * 0.6, h * 0.45), qt = Math.min(q, rt * 0.6, h * 0.45);
  if (rb > 1e-4) { pts.push([0, 0]); for (let i = 0; i <= n; i++) { const a = (-90 + (90 * i) / n) * GR; pts.push([rb - qb + Math.cos(a) * qb, qb + Math.sin(a) * qb]); } } else pts.push([0, 0]);
  if (rt > 1e-4) { for (let i = 0; i <= n; i++) { const a = ((90 * i) / n) * GR; pts.push([rt - qt + Math.cos(a) * qt, h - qt + Math.sin(a) * qt]); } pts.push([0, h]); } else pts.push([0, h]);
  return pts.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
}
// quantos gomos em volta, conforme o tamanho da peça (peça pequena não precisa de muitos); o.n força um valor
const gomos = (r, o) => (o && o.n) || (r < 0.035 ? 6 : r < 0.09 ? 8 : r < 0.22 ? 10 : r < 0.6 ? 14 : 20);

// Caixa de quinas chanfradas com as normais das faces: 44 triângulos, e a luz desliza pela quina como se fosse redonda.
// (A RoundedBoxGeometry gasta 108 no mínimo; fica para as peças de canto bem redondo.)
function caixaChanfrada(w, h, d, q) {
  const X = w / 2, Y = h / 2, Z = d / 2, pos = [], nor = [], idx = [];
  const id = (ix, iy, iz, f) => ((ix * 2 + iy) * 2 + iz) * 3 + f; // canto (0/1 em cada eixo) e face (0 = x, 1 = y, 2 = z)
  for (let ix = 0; ix < 2; ix++) for (let iy = 0; iy < 2; iy++) for (let iz = 0; iz < 2; iz++) {
    const sx = ix ? 1 : -1, sy = iy ? 1 : -1, sz = iz ? 1 : -1;
    pos.push(sx * X, sy * (Y - q), sz * (Z - q), sx * (X - q), sy * Y, sz * (Z - q), sx * (X - q), sy * (Y - q), sz * Z);
    nor.push(sx, 0, 0, 0, sy, 0, 0, 0, sz);
  }
  const P3 = (i) => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  const tri = (a, b, c) => { // vira o triângulo para fora (a caixa é convexa: fora é o lado oposto ao centro)
    const A = P3(a), n = P3(b).sub(A).cross(P3(c).sub(A));
    if (n.dot(A.add(P3(b)).add(P3(c))) < 0) idx.push(a, c, b); else idx.push(a, b, c);
  };
  const quad = (a, b, c, e) => { tri(a, b, c); tri(a, c, e); };
  for (let i = 0; i < 2; i++) {
    quad(id(i, 0, 0, 0), id(i, 1, 0, 0), id(i, 1, 1, 0), id(i, 0, 1, 0));
    quad(id(0, i, 0, 1), id(1, i, 0, 1), id(1, i, 1, 1), id(0, i, 1, 1));
    quad(id(0, 0, i, 2), id(1, 0, i, 2), id(1, 1, i, 2), id(0, 1, i, 2));
    for (let j = 0; j < 2; j++) {
      quad(id(i, j, 0, 0), id(i, j, 1, 0), id(i, j, 1, 1), id(i, j, 0, 1));
      quad(id(i, 0, j, 0), id(i, 1, j, 0), id(i, 1, j, 2), id(i, 0, j, 2));
      quad(id(0, i, j, 1), id(1, i, j, 1), id(1, i, j, 2), id(0, i, j, 2));
      for (let k = 0; k < 2; k++) tri(id(i, j, k, 0), id(i, j, k, 1), id(i, j, k, 2));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
  return g;
}

export class BuilderBrinquedo extends Builder {
  // tudo com normal suave e sem variação de cor por face
  add(geo, color, o = {}) {
    return super.add(geo, color, { ...o, smooth: o.liso === false ? false : true, jit: 0 });
  }
  // caixa de cantos arredondados; o.q = raio do canto (padrão: proporcional ao lado menor)
  box(w, h, d, color, o = {}) {
    const menor = Math.min(w, h, d), q = Math.min(o.q !== undefined ? o.q : Math.max(0.012, menor * 0.22), menor * 0.499);
    const seg = o.seg || (q > 0.12 ? 3 : q > 0.05 ? 2 : 1);
    const g = seg === 1 ? caixaChanfrada(w, h, d, q) : new RoundedBoxGeometry(w, h, d, seg - 1, q);
    g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }
  tbox(wb, db, wt, dt, h, color, o = {}) {
    let g = new RoundedBoxGeometry(1, 1, 1, 2, 0.12); g.translate(0, 0.5, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i); p.setXYZ(i, p.getX(i) * (wb + (wt - wb) * t), t * h, p.getZ(i) * (db + (dt - db) * t)); }
    g.deleteAttribute('uv'); g = toCreasedNormals(g, 70 * GR);
    return this.add(g, color, o);
  }
  cyl(rt, rb, h, seg, color, o = {}) {
    const r = Math.max(rt, rb), n = gomos(r, o);
    if (o.open) { const g = new THREE.CylinderGeometry(rt, rb, h, n, 1, true); g.translate(0, h / 2, 0); return this.add(g, color, o); }
    const q = o.q !== undefined ? o.q : Math.min(0.06, r * 0.3, h * 0.3);
    return this.add(new THREE.LatheGeometry(perfilRedondo(rb, rt, h, q), n), color, o);
  }
  cone(r, h, seg, color, o = {}) {
    if (o.open) return super.cone(r, h, gomos(r, o), color, o);
    const q = Math.min(0.05, r * 0.3), pts = perfilRedondo(r, r * 0.16, h, q);
    return this.add(new THREE.LatheGeometry(pts, gomos(r, o)), color, o);
  }
  sph(r, ws, hs, color, o = {}) { const n = gomos(r, o) + 2; return this.add(new THREE.SphereGeometry(r, n, Math.max(6, Math.round(n * 0.7))), color, o); }
  ico(r, detail, color, o = {}) { return this.sph(r, 0, 0, color, o); }
  // massa arredondada (copa, pedra, saco): esfera lisa, sem facetas
  blob(r, detail, color, o = {}) { return this.sph(r, 0, 0, color, o); }
  lathe(pts, seg, color, o = {}) {
    const r = Math.max(...pts.map((p) => p[0]));
    return this.add(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), gomos(r, o) + 2), color, o);
  }
  // cápsula em pé: origem na base; altura total h
  cap(r, h, color, o = {}) {
    const n = gomos(r, o), g = new THREE.CapsuleGeometry(r, Math.max(0.001, h - 2 * r), o.nc || (n >= 10 ? 3 : 2), n); g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }
  // contorno 2D extrudado com as quinas quebradas
  _extrudar(sh, depth, q) {
    const b = Math.min(q, depth * 0.4);
    let g = new THREE.ExtrudeGeometry(sh, { depth: depth - 2 * b, bevelEnabled: b > 0.002, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: 6 });
    g.translate(0, 0, b);
    g.deleteAttribute('uv'); g = toCreasedNormals(g, 50 * GR);
    return g;
  }
  ext(pts, depth, color, o = {}) {
    const g = this._extrudar(new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1]))), depth, o.q !== undefined ? o.q : 0.03);
    g.translate(0, 0, -depth / 2);
    return this.add(g, color, o);
  }
  slab(pts, h, color, o = {}) {
    const g = this._extrudar(new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1]))), h, o.q !== undefined ? o.q : Math.min(0.03, h * 0.4));
    g.rotateX(-Math.PI / 2);
    return this.add(g, color, o);
  }
  tube(pts, r, seg, color, o = {}) {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const g = new THREE.TubeGeometry(curve, o.steps || pts.length * 3, r, o.n || 6, false);
    this.add(g, color, o);
    if (!o.semPontas) for (const p of [pts[0], pts[pts.length - 1]]) this.add(new THREE.SphereGeometry(r, 6, 4), color, { p });
    return this;
  }
  // bola barata, para peça miúda ou escondida: o.seg gomos em volta e o.aneis de alto a baixo
  bola(r, color, o = {}) { return this.add(new THREE.SphereGeometry(r, o.seg || 6, o.aneis || 4), color, o); }
  // folha gorda e barata (40 triângulos): um fuso de ponta fina que nasce na origem, sobe e, da metade em diante, dobra
  // para +x. larg é a largura (ao longo de z); o.esp a espessura em relação à largura; o.dobra o ângulo da ponta, em graus.
  folha(comp, larg, color, o = {}) {
    let g = new THREE.LatheGeometry(PERFIL_FOLHA, o.n || 5);
    g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
    const p = g.attributes.position;
    const dobra = Math.max(0.001, (o.dobra === undefined ? 70 : o.dobra) * GR), esp = (larg / 2) * (o.esp === undefined ? 0.34 : o.esp), k = dobra / (0.5 * comp);
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i), s = Math.max(0, t - 0.5) * comp, a = k * s;
      const ex = p.getX(i) * esp, ez = (p.getZ(i) * larg) / 2;
      p.setXYZ(i, (1 - Math.cos(a)) / k + ex * Math.cos(a), Math.min(t, 0.5) * comp + Math.sin(a) / k - ex * Math.sin(a), ez);
    }
    g.computeVertexNormals();
    return this.add(g, color, o);
  }
  // folha: lâmina fina dos dois lados; fica com a normal de cada face (não dá para alisar frente e verso juntos)
  leaf(len, w, bend, color, o = {}) { return super.leaf(len, w, bend, color, { ...o, liso: false }); }
}

// ---------------- decalques ----------------
// Chapa fina deitada sobre uma superfície curva (mancha da vaca, olho, boca): a cor fica chapada e de borda nítida,
// sem textura. sup(u, v, e) devolve o ponto [x, y, z] da superfície, levantado de "e" para fora; contorno = pontos [u, v]
// em volta do centro (forma estrelada); "aneis" enche o miolo de anéis para acompanhar a curvatura.
export function decalque(b, sup, contorno, cor, { aneis = 0, alt = 0.007, centro } = {}) {
  const n = contorno.length, c = centro || [contorno.reduce((a, p) => a + p[0], 0) / n, contorno.reduce((a, p) => a + p[1], 0) / n];
  const pos = [...sup(c[0], c[1], alt)], idx = [];
  for (let k = 1; k <= aneis + 1; k++) { const t = k / (aneis + 1); for (const [u, v] of contorno) pos.push(...sup(c[0] + (u - c[0]) * t, c[1] + (v - c[1]) * t, alt)); }
  // o lado de fora: compara a normal do primeiro triângulo com a direção em que a superfície sobe
  const A = new THREE.Vector3(...pos.slice(0, 3)), B = new THREE.Vector3(...pos.slice(3, 6)), Cc = new THREE.Vector3(...pos.slice(6, 9));
  const fora = new THREE.Vector3(...sup(c[0], c[1], alt + 0.05)).sub(A), nrm = B.sub(A).cross(Cc.sub(A));
  const vira = nrm.dot(fora) < 0, tri = (i, j, k) => (vira ? idx.push(i, k, j) : idx.push(i, j, k));
  for (let i = 0; i < n; i++) tri(0, 1 + i, 1 + ((i + 1) % n));
  for (let k = 0; k < aneis; k++) { const a = 1 + k * n, d = a + n; for (let i = 0; i < n; i++) { const j = (i + 1) % n; tri(a + i, d + i, d + j); tri(a + i, d + j, a + j); } }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return b.add(g, cor);
}
// contorno oval em volta de (u0, v0), com raios ru e rv; "onda" e "lobos" entortam a borda; "giro" (radianos) inclina
export function ovalDe(u0, v0, ru, rv, n = 16, onda = 0, lobos = 3, giro = 0) {
  const pts = [], cg = Math.cos(giro), sg = Math.sin(giro);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, k = 1 + onda * Math.sin(lobos * t + 1.3), x = Math.cos(t) * ru * k, y = Math.sin(t) * rv * k;
    pts.push([u0 + x * cg - y * sg, v0 + x * sg + y * cg]);
  }
  return pts;
}

// ---------------- projetor de sombra ----------------
// Tudo o que projeta sombra é desenhado duas vezes (uma no mapa de sombra). Para as peças grandes e paradas (celeiro,
// poço, laranjeira) o mapa recebe, no lugar da malha detalhada, um "projetor": uma malha de poucas dezenas ou centenas
// de triângulos, um pouco por dentro da de verdade, que não aparece na tela (não escreve cor nem profundidade).
let _matProjetor = null;
export function projetorDeSombra(desenhar) {
  const b = new Builder(1);
  desenhar(b);
  if (!_matProjetor) _matProjetor = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  const m = new THREE.Mesh(b.build(), _matProjetor);
  m.name = 'projetor de sombra'; m.castShadow = true; m.receiveShadow = false;
  return m;
}

// ---------------- o estilo entregue às fábricas ----------------
// Malhas que não entram no mapa de sombra: o chão, a terra e as plantas do canteiro, as galinhas e o ninho (ficam só com
// a mancha de contato), o sinal de leite, e o celeiro, o poço e a laranjeira (que têm projetor). Todas recebem sombra.
const SEM_SOMBRA = new Set(['chao.malha0', 'canteiro.malha0', 'canteiro.articulado0', 'galinha.articulado0', 'ninho.articulado0', 'vaca.malha0', 'celeiro.articulado0', 'poco.articulado0', 'arvore.articulado0']);
// desenhos: { 'tipo.articulado0': (b, osso, padrao) => ..., 'tipo.malha0': (b, _, padrao) => ... } troca o desenho de uma malha
// de uma fábrica do "codigo" (a ordem é a das chamadas dentro da fábrica); sem entrada, vale o desenho de lá, só arredondado.
// ctx é o que a fábrica recebeu (o desenho da galinha lê a variante de lá).
export function criarEstilo(tipo, desenhos, extras = {}, ctx = null) {
  const conta = { articulado: 0, malha: 0 };
  let ultima = '';
  return {
    nome: 'brinquedo', Builder: BuilderBrinquedo, material, paleta: PALETA_DE_C, sombra, sombraRet,
    aoCriar(mesh) { mesh.castShadow = !SEM_SOMBRA.has(ultima); mesh.receiveShadow = true; },
    geoParticula: (raio) => new THREE.SphereGeometry(raio, 8, 6), matParticula,
    redesenhar(qual, padrao) { ultima = `${tipo}.${qual}${conta[qual]++}`; const f = desenhos[ultima]; return f ? (b, nome) => f(b, nome, padrao, ctx) : padrao; },
    ...extras,
  };
}

// Luz e fundo deste conjunto (a cena aplica quando o chão é deste conjunto; ver Cena.definirAmbiente).
// As intensidades dão luz total 1 numa face virada para cima, perto de 0,65 na parede da frente e de 0,35 na parede em sombra.
export const AMBIENTE = {
  fundo: '#b2e5fd',
  ceu: { cor: '#eef6ff', chao: '#9c8a5e', intensidade: 1.42 },
  sol: { cor: '#fff3dc', intensidade: 2.45, direcao: [-0.4, 0.8, 0.45] },
  // um mapa de sombra só. Com 1024 a borda fica igual à de 2048 neste tamanho de sítio (o raio do borrão é em pontos do
  // mapa: 3,5 em 2048 dá o mesmo que 1,75 em 1024) e o mapa ocupa um quarto da memória de vídeo.
  sombra: { tamanho: 1024, raio: 1.75, intensidade: 0.92 },
  // o telhado de telha gorda é mais alto que o do "codigo": as pontas da cumeeira e do beiral têm de caber na vista "tudo"
  cabe: { celeiro: [[0, 4.75, -2.0], [-2.2, 3.1, -2.0]] },
};
export { col };
