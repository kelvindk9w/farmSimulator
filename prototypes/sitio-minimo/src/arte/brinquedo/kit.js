// Kit do conjunto de arte "brinquedo": o que dá a cara de brinquedo de vinil da imagem de referência
// (arte/estilo/rodada-01/estilo-a.png): formas arredondadas com normais suaves, cores quentes e saturadas sem
// microtextura, material fosco, sol de cima e da esquerda com sombra projetada suave e sombra de contato.
// Os esqueletos e a animação são os do conjunto "codigo"; aqui só muda a roupa (ver comEstilo em ../codigo/base.js).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Builder, col } from '../../../../../tools/visual-refs/src/lib/builder.js';

// ---------------- cores ----------------
// Medidas na imagem de referência, nas faces viradas para cima (onde a luz deste conjunto vale 1).
export const P = {
  grama: '#97c63a', gramaClara: '#a6d145', gramaEscura: '#86b830', tufo: '#5fae2c', tufoClaro: '#7cc637',
  terra: '#b0652f', terraEscura: '#8f4a22', terraClara: '#c47a3c', terraMolhada: '#7a3f1e',
  faixa: '#a4582a', faixaEscura: '#8a4520',
  caminho: '#f0a85a', caminhoBorda: '#e09148', pedrinha: '#fcc377', terreiro: '#f4c874', terreiroBorda: '#e9b660',
  madeira: '#d08a3c', madeiraClara: '#e2a24e', madeiraEscura: '#a9642a', madeiraSombra: '#7c431a', tronco: '#8a4a20', troncoEscuro: '#6f3916',
  telha: '#ee6234', telhaClara: '#f67a45', telhaEscura: '#d44e25',
  portaVerde: '#4e9c35', portaVerdeEscuro: '#3f8a2c', creme: '#f1e2b4', cremeEscuro: '#dcc99a',
  pedra: '#cfc4ae', pedraClara: '#e2d9c6', pedraEscura: '#ad9f86', base: '#c9b48c',
  agua: '#3fb3e8', aguaClara: '#8fd8f6', aguaFunda: '#2a93cf',
  folha: '#5fb630', folhaClara: '#7cc93a', folhaEscura: '#47992a',
  laranja: '#fca416', laranjaClara: '#ffc04a',
  milhoCaule: '#7fbf35', milhoFolha: '#62ad2c', milhoEspiga: '#f8c62c', milhoPalha: '#d6e27a', milhoPendao: '#f0d98a',
  palha: '#f2c038', palhaEscura: '#d99d22', ovo: '#fff3da',
  vacaCreme: '#fbe6c2', vacaSombra: '#ecd0a6', vacaEscuro: '#4f4136', focinho: '#f0a28c', focinhoEscuro: '#d98572', chifre: '#f2e3c0', casco: '#5a4636',
  sino: '#f2b92c', coleira: '#d8402c',
  galinhaBranca: '#fff4d6', galinhaCaramelo: '#f5a43a', galinhaCarameloEscuro: '#dc8826', crista: '#e2382b', bico: '#f7a81f', pe: '#f39a1c',
  pele: '#d98548', peleClara: '#e69a5c', cabelo: '#3a2416', lenco: '#de3b2c', lencoEscuro: '#bf2d21', camisa: '#f6c02e', jardineira: '#2f74c0', jardineiraEscura: '#255fa3',
  bota: '#7a4424', botaEscura: '#5e3219', olho: '#2a1a12', boca: '#8c3526', bochecha: '#ef8f6a', branco: '#ffffff',
  metal: '#b9c7cf', metalEscuro: '#8fa2ad', metalClaro: '#dfe8ec', regador: '#6fa8c4', regadorEscuro: '#5489a6',
  corda: '#d9b06a', saco: '#e6cf9c', sacoEscuro: '#cbb07a', caixote: '#d59a52', caixoteEscuro: '#b67a38',
  vidro: '#3c2a1c', leite: '#fffaf0',
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
  if (!_mat) _mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 });
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
  if (!_matMancha) _matMancha = new THREE.MeshBasicMaterial({ color: 0x33220c, map: texturaMancha(), transparent: true, opacity: 0.42, depthWrite: false });
  return _matMancha;
}
export function sombra(rx, rz, x = 0, z = 0, y = 0.03) {
  const m = new THREE.Mesh(GEO_MANCHA, matMancha());
  m.scale.set(rx * 1.35, 1, rz * 1.35); m.position.set(x, y, z); m.renderOrder = 2;
  return m;
}
export const sombraRet = (w, d, x = 0, z = 0, y = 0.03) => sombra(w * 0.62, d * 0.62, x, z, y);

// ---------------- construtor de formas arredondadas ----------------
const GR = Math.PI / 180;
// perfil (raio, altura) de um cilindro/cone com as quinas arredondadas, para o torno
function perfilRedondo(rb, rt, h, q) {
  const pts = [], n = 3;
  const qb = Math.min(q, rb * 0.6, h * 0.45), qt = Math.min(q, rt * 0.6, h * 0.45);
  if (rb > 1e-4) { pts.push([0, 0]); for (let i = 0; i <= n; i++) { const a = (-90 + (90 * i) / n) * GR; pts.push([rb - qb + Math.cos(a) * qb, qb + Math.sin(a) * qb]); } } else pts.push([0, 0]);
  if (rt > 1e-4) { for (let i = 0; i <= n; i++) { const a = ((90 * i) / n) * GR; pts.push([rt - qt + Math.cos(a) * qt, h - qt + Math.sin(a) * qt]); } pts.push([0, h]); } else pts.push([0, h]);
  return pts.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
}
const gomos = (r, pedido) => Math.max(pedido || 8, r < 0.05 ? 8 : r < 0.2 ? 12 : r < 0.6 ? 16 : 24);

export class BuilderBrinquedo extends Builder {
  // tudo com normal suave e sem variação de cor por face
  add(geo, color, o = {}) {
    return super.add(geo, color, { ...o, smooth: o.liso === false ? false : true, jit: 0 });
  }
  // caixa de cantos arredondados; o.q = raio do canto (padrão: proporcional ao lado menor)
  box(w, h, d, color, o = {}) {
    const menor = Math.min(w, h, d), q = Math.min(o.q !== undefined ? o.q : Math.max(0.012, menor * 0.22), menor * 0.499);
    const seg = o.seg || (q > 0.09 ? 3 : q > 0.035 ? 2 : 1);
    const g = new RoundedBoxGeometry(w, h, d, seg, q); g.translate(0, h / 2, 0);
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
    const r = Math.max(rt, rb), n = gomos(r, seg);
    if (o.open) { const g = new THREE.CylinderGeometry(rt, rb, h, n, 1, true); g.translate(0, h / 2, 0); return this.add(g, color, o); }
    const q = o.q !== undefined ? o.q : Math.min(0.06, r * 0.3, h * 0.3);
    return this.add(new THREE.LatheGeometry(perfilRedondo(rb, rt, h, q), n), color, o);
  }
  cone(r, h, seg, color, o = {}) {
    if (o.open) return super.cone(r, h, gomos(r, seg), color, o);
    const q = Math.min(0.05, r * 0.3), pts = perfilRedondo(r, r * 0.16, h, q);
    return this.add(new THREE.LatheGeometry(pts, gomos(r, seg)), color, o);
  }
  sph(r, ws, hs, color, o = {}) { const n = gomos(r, 12); return this.add(new THREE.SphereGeometry(r, n, Math.max(8, Math.round(n * 0.7))), color, o); }
  ico(r, detail, color, o = {}) { return this.sph(r, 0, 0, color, o); }
  // massa arredondada (copa, pedra, saco): esfera lisa, sem facetas
  blob(r, detail, color, o = {}) { return this.sph(r, 0, 0, color, o); }
  lathe(pts, seg, color, o = {}) {
    const r = Math.max(...pts.map((p) => p[0]));
    return this.add(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), gomos(r, seg)), color, o);
  }
  // cápsula em pé: origem na base; altura total h
  cap(r, h, color, o = {}) {
    const n = gomos(r, 10), g = new THREE.CapsuleGeometry(r, Math.max(0.001, h - 2 * r), Math.max(3, Math.round(n / 3)), n); g.translate(0, h / 2, 0);
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
    const g = new THREE.TubeGeometry(curve, o.steps || pts.length * 4, r, Math.max(seg || 6, 7), false);
    this.add(g, color, o);
    if (!o.semPontas) for (const p of [pts[0], pts[pts.length - 1]]) this.add(new THREE.SphereGeometry(r, 7, 5), color, { p });
    return this;
  }
  // folha: lâmina fina dos dois lados; fica com a normal de cada face (não dá para alisar frente e verso juntos)
  leaf(len, w, bend, color, o = {}) { return super.leaf(len, w, bend, color, { ...o, liso: false }); }
}

// ---------------- o estilo entregue às fábricas ----------------
export const aoCriar = (mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; };
export const ESTILO = {
  nome: 'brinquedo', Builder: BuilderBrinquedo, material, paleta: PALETA_DE_C, sombra, sombraRet, aoCriar,
  geoParticula: (raio) => new THREE.SphereGeometry(raio, 8, 6), matParticula,
};

// Luz e fundo deste conjunto (a cena aplica quando o chão é deste conjunto; ver Cena.definirAmbiente).
// As intensidades dão luz total 1 numa face virada para cima, perto de 0,65 na parede da frente e de 0,35 na parede em sombra.
export const AMBIENTE = {
  fundo: '#b2e5fd',
  ceu: { cor: '#dff1ff', chao: '#d9c08a', intensidade: 1.32 },
  sol: { cor: '#fff3dc', intensidade: 2.3, direcao: [-0.4, 0.8, 0.45] },
  sombra: { tamanho: 2048, raio: 3.5, intensidade: 0.92 },
};
export { col };
