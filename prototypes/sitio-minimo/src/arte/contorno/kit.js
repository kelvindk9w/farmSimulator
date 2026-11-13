// Kit do conjunto de arte "contorno" (alvo: arte/estilo/rodada-03/var-2-contorno.png): desenho animado com traço escuro
// e firme em volta de tudo, cor chapada em dois ou três tons por objeto, formas arredondadas, luz simples.
// Como é feito:
//   - as formas são as arredondadas do conjunto "brinquedo" (o construtor de lá, aqui com menos gomos);
//   - a cor vem de um material próprio, sem luz de verdade: cada ponto fica com a cor cheia, um tom do meio ou um tom de
//     sombra, conforme o lado para onde a face está virada em relação a um sol fixo (são degraus, sem dégradé);
//   - o traço é uma "casca virada": cada malha é desenhada outra vez, um pouco inchada, só com as faces de trás e toda
//     escura. Serve também para as malhas com esqueleto e não usa nenhum efeito de tela inteira;
//   - a sombra é uma mancha chapada no chão, sem mapa de sombra.
// Os esqueletos e a animação são os do conjunto "codigo" (ver comEstilo em ../codigo/base.js).
import * as THREE from 'three';
import { BuilderBrinquedo, decalque as decalqueDoBrinquedo, ovalDe } from '../brinquedo/kit.js';

// ---------------- cores ----------------
// Lidas da imagem-alvo: é a cor da face em plena luz (o tom do meio e o de sombra saem dela, no material).
export const P = {
  traco: '#2f1a08',
  grama: '#89c517', gramaClara: '#96d01f', gramaEscura: '#7ab812', gramaBorda: '#4c9406',
  terra: '#a5530f', terraEscura: '#8c4409', terraClara: '#c8722a', terraLeira: '#b6611b', terraMolhada: '#6f3306',
  faixa: '#a04e1a',
  caminho: '#fbab50', caminhoBorda: '#b8651d', pedrinha: '#fdc57a', terreiro: '#fec563', terreiroBorda: '#c08232',
  madeira: '#d98a28', madeiraClara: '#e8a23e', madeiraEscura: '#a9601c', tronco: '#a5510c', troncoEscuro: '#7f3c01',
  telha: '#e2511a', telhaClara: '#ee6a2c', telhaEscura: '#4a1204',
  portaVerde: '#2f9a12', creme: '#fff6e0',
  pedra: '#b9a792', pedraClara: '#c9b9a4', pedraMedia: '#ad9a85', pedraEscura: '#4a3a2c', base: '#d2c8b6',
  agua: '#16a6e8', aguaClara: '#7ed0f5', aguaFunda: '#0b86c9',
  folha: '#55b512', folhaClara: '#6cc51a', folhaEscura: '#3fa00c',
  laranja: '#fb8f0e', laranjaClara: '#ffb03a',
  milhoCaule: '#58b015', milhoFolha: '#3f9a0c', milhoEspiga: '#f7c520', milhoPalha: '#b9d84a', milhoPendao: '#f0d98a',
  palha: '#f0b83a', palhaEscura: '#d2952a', palhaClara: '#f7cf5e', ovo: '#fffaf0',
  vacaCreme: '#fffaf0', vacaEscuro: '#2e2a2a', focinho: '#f7a3b0', focinhoEscuro: '#e07a8e', chifre: '#e8c98a', casco: '#3a302c',
  galinhaBranca: '#fffdf5', galinhaCaramelo: '#dd8f2a', crista: '#e8281c', bico: '#f7a81f', pe: '#f39a1c',
  pele: '#c98349', peleEscura: '#a8622c', cabelo: '#3a2212', lenco: '#e0301e', lencoEscuro: '#b82414', camisa: '#f5c21f', camisaEscura: '#e0a516', jardineira: '#2f7fc8', jardineiraEscura: '#2467a8', jardineiraClara: '#4a96d8',
  bota: '#8a4a1c', botaEscura: '#6a3612', olho: '#24140a', boca: '#8c2f20', bochecha: '#e58a5e', branco: '#ffffff',
  metal: '#b5bcc2', metalEscuro: '#8b949c', regador: '#3d9fe0', regadorEscuro: '#2f84c4',
  corda: '#e0ae52', cordaEscura: '#c2903a', saco: '#ecd8a8', sacoEscuro: '#cbb07a', caixote: '#dd9a4c', caixoteEscuro: '#b67a38', caixoteClaro: '#eab264',
  vidro: '#2a1608', leite: '#fffaf0', tampa: '#3d9fd8', crivo: '#f3ead2',
  interior: '#3a2212', parede: '#cf7c20', paredeClara: '#da8a2a', paredeFriso: '#3b1c06',
  cerca: '#d98a28', regua: '#e39a35', balde: '#b5bcc2', baldeEscuro: '#8b949c', semente: '#f7c520',
};

// As cores de C (paleta de tools/visual-refs) trocadas enquanto uma fábrica do "codigo" roda vestida por este conjunto:
// valem para o que não foi redesenhado aqui (as partículas de água, de semente e de folha).
export const PALETA_DE_C = {
  grass: P.grama, grassLight: P.gramaClara, grassDark: P.gramaEscura, soil: P.terra, soilDark: P.terraEscura, soilLight: P.terraClara, soilWet: P.terraMolhada,
  water: P.agua, waterDeep: P.aguaFunda, waterLight: P.aguaClara, wood: P.madeira, woodDark: P.madeiraEscura, woodLight: P.madeiraClara,
  hay: P.palha, hayDark: P.palhaEscura, straw: P.palha, strawDark: P.palhaEscura, leaf: P.folha, leafDark: P.folhaEscura, leafLight: P.folhaClara,
  orangeLeaf: P.folha, orangeLeafLight: P.folhaClara, orange: P.laranja, cornStalk: P.milhoCaule, cornLeaf: P.milhoFolha, cornEar: P.milhoEspiga, cornHusk: P.milhoPalha,
};

// ---------------- material de cor chapada em degraus ----------------
// O sol é fixo no mundo (não usa as luzes da cena): vem de cima, da esquerda e um pouco da frente. Face virada para ele
// fica com a cor cheia; face de lado, com o tom do meio; face de costas, com o tom de sombra (mais escuro e mais vivo).
const SOL = new THREE.Vector3(-0.35, 0.75, 0.56).normalize();
const VERTICE = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
varying vec3 vCor;
varying vec3 vNormalDaVista;
void main() {
  vCor = color;
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  vNormalDaVista = normalMatrix * objectNormal;
  #include <begin_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
}`;
const FRAGMENTO = /* glsl */ `
uniform vec3 diffuse;
uniform vec3 sol;
varying vec3 vCor;
varying vec3 vNormalDaVista;
void main() {
  vec3 cheia = vCor * diffuse;
  vec3 sombra = pow(cheia, vec3(1.22)) * 0.5;
  float d = dot(normalize(vNormalDaVista), normalize((viewMatrix * vec4(sol, 0.0)).xyz));
  vec3 cor = d > 0.38 ? cheia : (d > -0.04 ? mix(sombra, cheia, 0.58) : sombra);
  gl_FragColor = vec4(cor, 1.0);
  #include <colorspace_fragment>
}`;
// material.color existe (as fábricas do "codigo" escurecem o boneco dentro do celeiro e a terra molhada por ele)
export class MaterialContorno extends THREE.ShaderMaterial {
  constructor() {
    super({ uniforms: { diffuse: { value: new THREE.Color(1, 1, 1) }, sol: { value: SOL } }, vertexShader: VERTICE, fragmentShader: FRAGMENTO, vertexColors: true });
    this.type = 'MaterialContorno';
  }
  get color() { return this.uniforms.diffuse.value; }
}
let _mat = null;
export function material() {
  if (!_mat) _mat = new MaterialContorno();
  return _mat;
}
const _particulas = new Map();
function matParticula(cor) {
  const k = new THREE.Color(cor).getHexString();
  if (!_particulas.has(k)) _particulas.set(k, new THREE.MeshBasicMaterial({ color: new THREE.Color(cor) }));
  return _particulas.get(k);
}

// ---------------- o traço: casca virada ----------------
// Espessura do traço em pontos de tela (CSS). Acompanha o tamanho da tela (perto de 0,4% do lado menor na vista
// "tudo") e cresce só um pouco com o zoom: de perto o traço engrossa cerca de um quarto, e não o dobro como o desenho.
export const espessuraDoTraco = (menorLado, pxPorUnidade) => Math.max(1.5, Math.min(6, 0.0096 * menorLado ** 0.7 * pxPorUnidade ** 0.3));
const VERTICE_TRACO = /* glsl */ `
uniform float espessura; // em unidades do mundo
#include <common>
#include <skinning_pars_vertex>
void main() {
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vec3 n = normalMatrix * objectNormal;
  float c = length(n);
  // peça encolhida (o objeto que nasce na mão, o sinal de leite que aparece) tem o traço encolhido junto
  float tamanho = min(1.0, length(modelMatrix[0].xyz) * 3.0);
  if (c > 1e-6) mvPosition.xyz += (n / c) * length(objectNormal) * espessura * tamanho;
  gl_Position = projectionMatrix * mvPosition;
}`;
const FRAGMENTO_TRACO = /* glsl */ `
uniform vec3 cor;
void main() {
  gl_FragColor = vec4(cor, 1.0);
  #include <colorspace_fragment>
}`;
let _matTraco = null;
function matTraco() {
  if (!_matTraco) {
    _matTraco = new THREE.ShaderMaterial({ uniforms: { espessura: { value: 0.04 }, cor: { value: new THREE.Color(P.traco) } }, vertexShader: VERTICE_TRACO, fragmentShader: FRAGMENTO_TRACO, side: THREE.BackSide });
    _matTraco.type = 'MaterialDoTraco';
  }
  return _matTraco;
}
const _tam = new THREE.Vector2();
// antes de desenhar cada casca: a espessura em unidades do mundo que dá os pontos de tela pedidos nesta câmera
function acertarEspessura(renderer, cena, camera) {
  renderer.getSize(_tam);
  const pxPorUnidade = (_tam.y * camera.zoom) / (camera.top - camera.bottom);
  matTraco().uniforms.espessura.value = espessuraDoTraco(Math.min(_tam.x, _tam.y), pxPorUnidade) / pxPorUnidade;
}

// A casca usa os mesmos pontos da malha, mas com outra "normal": em cada ponto, o vetor que afasta de uma espessura
// todas as faces que se encontram ali (numa quina de caixa ele é mais comprido que 1). Assim a casca não abre nas quinas
// e o traço tem a mesma largura numa bola e numa caixa.
const _A = new THREE.Matrix3(), _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
function geometriaDaCasca(geo) {
  // as peças marcadas "sem traço" (decalques, brilhos, chapas no chão) ficam fora da casca
  const marca = geo.attributes.traco;
  if (marca) {
    const fica = [];
    for (let i = 0; i + 2 < marca.count; i += 3) if (marca.getX(i) > 0.5) fica.push(i, i + 1, i + 2);
    if (fica.length < marca.count) {
      const so = new THREE.BufferGeometry();
      for (const nome of ['position', 'skinIndex', 'skinWeight']) {
        const a = geo.attributes[nome];
        if (!a) continue;
        const v = new a.array.constructor(fica.length * a.itemSize);
        fica.forEach((de, para) => { for (let k = 0; k < a.itemSize; k++) v[para * a.itemSize + k] = a.array[de * a.itemSize + k]; });
        so.setAttribute(nome, new THREE.BufferAttribute(v, a.itemSize));
      }
      geo = so;
    }
  }
  const pos = geo.attributes.position, n = pos.count, osso = geo.attributes.skinIndex || null;
  const grupoDe = new Int32Array(n), grupos = [], mapa = new Map();
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(pos.getX(i) * 1500)},${Math.round(pos.getY(i) * 1500)},${Math.round(pos.getZ(i) * 1500)},${osso ? osso.getX(i) : 0}`;
    let g = mapa.get(k);
    if (g === undefined) { g = grupos.length; grupos.push([]); mapa.set(k, g); }
    grupoDe[i] = g;
  }
  // as normais das faces em volta de cada ponto (sem repetir as iguais)
  for (let i = 0; i + 2 < n; i += 3) {
    _a.fromBufferAttribute(pos, i); _b.fromBufferAttribute(pos, i + 1); _c.fromBufferAttribute(pos, i + 2);
    _v.subVectors(_b, _a).cross(_c.sub(_a));
    const comp = _v.length();
    if (comp < 1e-10) continue;
    _v.divideScalar(comp);
    for (let k = 0; k < 3; k++) {
      const lista = grupos[grupoDe[i + k]];
      let nova = true;
      for (let j = 0; j < lista.length; j += 3) if (lista[j] * _v.x + lista[j + 1] * _v.y + lista[j + 2] * _v.z > 0.995) { nova = false; break; }
      if (nova) lista.push(_v.x, _v.y, _v.z);
    }
  }
  // em cada ponto: o vetor v com v . normal = 1 para todas as normais dali (mínimos quadrados, com um freio)
  const saida = new Float32Array(grupos.length * 3), e = 0.03;
  grupos.forEach((lista, g) => {
    let xx = e, xy = 0, xz = 0, yy = e, yz = 0, zz = e, bx = 0, by = 0, bz = 0;
    for (let j = 0; j < lista.length; j += 3) {
      const x = lista[j], y = lista[j + 1], z = lista[j + 2];
      xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z; bx += x; by += y; bz += z;
    }
    _A.set(xx, xy, xz, xy, yy, yz, xz, yz, zz).invert();
    _v.set(bx, by, bz).applyMatrix3(_A);
    const comp = _v.length();
    if (comp > 2.2) _v.multiplyScalar(2.2 / comp);
    saida[g * 3] = _v.x; saida[g * 3 + 1] = _v.y; saida[g * 3 + 2] = _v.z;
  });
  const normal = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const g = grupoDe[i] * 3; normal[i * 3] = saida[g]; normal[i * 3 + 1] = saida[g + 1]; normal[i * 3 + 2] = saida[g + 2]; }
  const casca = new THREE.BufferGeometry();
  casca.setAttribute('position', pos);
  casca.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  if (osso) { casca.setAttribute('skinIndex', osso); casca.setAttribute('skinWeight', geo.attributes.skinWeight); }
  return casca;
}
// Põe o traço numa malha: a casca entra como filha dela (some, cresce e anda junto). Na malha com esqueleto, a casca usa
// o esqueleto da mãe (que só é ligado depois de a malha nascer; por isso a consulta é feita na hora de desenhar).
export function comTraco(mesh) {
  if (!mesh.geometry.attributes.position || mesh.isInstancedMesh) return mesh;
  const geo = geometriaDaCasca(mesh.geometry);
  if (!geo.attributes.position.count) return mesh;
  let casca;
  if (mesh.isSkinnedMesh) {
    casca = new THREE.SkinnedMesh(geo, matTraco());
    Object.defineProperty(casca, 'skeleton', { get: () => mesh.skeleton, set() {}, configurable: true });
    Object.defineProperty(casca, 'bindMatrix', { get: () => mesh.bindMatrix, set() {}, configurable: true });
  } else casca = new THREE.Mesh(geo, matTraco());
  casca.name = 'traço'; casca.frustumCulled = false; casca.castShadow = false; casca.receiveShadow = false;
  casca.onBeforeRender = acertarEspessura;
  mesh.add(casca);
  return mesh;
}

// ---------------- sombra ----------------
// Uma mancha chapada e escura no chão, de borda nítida, embaixo de cada coisa (não há mapa de sombra neste conjunto).
const GEO_MANCHA = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
GEO_MANCHA.userData.compartilhada = true;
let _matMancha = null;
export function sombra(rx, rz, x = 0, z = 0, y = 0.03) {
  if (!_matMancha) _matMancha = new THREE.MeshBasicMaterial({ color: '#2c3a06', transparent: true, opacity: 0.34, depthWrite: false });
  const m = new THREE.Mesh(GEO_MANCHA, _matMancha);
  m.scale.set(rx * 0.82, 1, rz * 0.82); m.position.set(x, y, z); m.renderOrder = 2;
  return m;
}
// O celeiro (o único que pede sombra retangular; a fábrica passa a planta dele com folga) não ganha mancha: ganha uma
// "pegada", uma chapa da cor do traço um pouco maior que o baldrame, que faz o risco do pé das paredes do lado de cá.
const GEO_PEGADA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
GEO_PEGADA.userData.compartilhada = true;
let _matPegada = null;
export function sombraRet(w, d) {
  if (!_matPegada) _matPegada = new THREE.MeshBasicMaterial({ color: P.traco });
  const m = new THREE.Mesh(GEO_PEGADA, _matPegada);
  m.scale.set(w - 0.9 + 0.34, 1, d - 0.8 + 0.34); m.position.set(0, 0.022, 0);
  return m;
}

// ---------------- construtor de formas ----------------
// O construtor arredondado do "brinquedo", com menos gomos: a cor em degraus não mostra o facetado, e cada triângulo
// conta duas vezes neste conjunto (uma na malha, outra na casca do traço).
const menos = (n) => Math.max(6, Math.round(n * 0.7));
const gomos = (r) => (r < 0.035 ? 6 : r < 0.09 ? 7 : r < 0.22 ? 8 : r < 0.6 ? 11 : 14);
const comGomos = (r, o) => ({ ...o, n: o.n ? menos(o.n) : gomos(r) });
export class BuilderContorno extends BuilderBrinquedo {
  // cada peça leva uma marca por ponto: 1 = entra na casca do traço; 0 = fica sem traço (o.semTraco, ou tudo o que for
  // posto enquanto this.semTraco estiver ligado)
  add(geo, color, o = {}) {
    super.add(geo, color, o);
    const g = this.parts[this.parts.length - 1];
    g.setAttribute('traco', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(o.semTraco || this.semTraco ? 0 : 1), 1));
    return this;
  }
  // caixa: no máximo um gomo em cada quina (108 triângulos); a de quina miúda continua chanfrada (44)
  box(w, h, d, color, o = {}) {
    const menor = Math.min(w, h, d), q = Math.min(o.q !== undefined ? o.q : Math.max(0.012, menor * 0.22), menor * 0.499);
    return super.box(w, h, d, color, { ...o, seg: Math.min(o.seg || (q > 0.05 ? 2 : 1), 2) });
  }
  cyl(rt, rb, h, seg, color, o = {}) { return super.cyl(rt, rb, h, seg, color, comGomos(Math.max(rt, rb), o)); }
  cone(r, h, seg, color, o = {}) { return super.cone(r, h, seg, color, comGomos(r, o)); }
  sph(r, ws, hs, color, o = {}) {
    const n = o.n ? menos(o.n) : gomos(r * Math.max(...(Array.isArray(o.s) ? o.s : [typeof o.s === 'number' ? o.s : 1]).map(Math.abs)));
    return this.add(new THREE.SphereGeometry(r, n + 1, Math.max(5, Math.round(n * 0.62))), color, o);
  }
  lathe(pts, seg, color, o = {}) {
    const n = o.n ? menos(o.n) : gomos(Math.max(...pts.map((p) => p[0])));
    return this.add(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), n + 1), color, o);
  }
  cap(r, h, color, o = {}) { return super.cap(r, h, color, { ...comGomos(r, o), nc: Math.min(o.nc || 2, 2) }); }
  // chapas deitadas no chão, sem traço: servem de "pegada" escura (o risco do pé de uma peça, do lado de cá, que a
  // casca não faz porque fica enterrada) e de mancha de cor
  disco(r, cor, o = {}) { return this.add(new THREE.CircleGeometry(r, o.n || 14).rotateX(-Math.PI / 2), cor, { ...o, semTraco: true }); }
  ret(w, d, cor, o = {}) { return this.add(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), cor, { ...o, semTraco: true }); }
  // a folha fina (lâmina de duas faces) não tem casca; aqui ela vira a folha gorda, que tem volume e portanto traço
  leaf(len, w, bend, color, o = {}) {
    return this.group({ p: o.p, r: o.r, s: o.s }, () => this.folha(len, w, color, { r: [0, -90, 0], dobra: Math.min(80, bend), esp: 0.5 }));
  }
}
// decalque (chapa fina deitada numa superfície curva): o do "brinquedo", sem traço em volta
export function decalque(b, ...resto) {
  const antes = b.semTraco;
  b.semTraco = true;
  try { return decalqueDoBrinquedo(b, ...resto); } finally { b.semTraco = antes; }
}
export { ovalDe };

// ---------------- o estilo entregue às fábricas ----------------
// desenhos: { 'tipo.articulado0': (b, osso, padrao, ctx) => ..., 'tipo.malha0': ... } troca o desenho de uma malha de uma fábrica
// do "codigo" (a ordem é a das chamadas dentro da fábrica); sem entrada, vale o desenho de lá, arredondado.
export function criarEstilo(tipo, desenhos, extras = {}, ctx = null) {
  const conta = { articulado: 0, malha: 0 };
  return {
    nome: 'contorno', Builder: BuilderContorno, material, paleta: PALETA_DE_C, sombra, sombraRet,
    aoCriar(mesh) { mesh.castShadow = false; mesh.receiveShadow = false; comTraco(mesh); },
    geoParticula: (raio) => new THREE.SphereGeometry(raio * 1.25, 6, 4), matParticula,
    redesenhar(qual, padrao) { const f = desenhos[`${tipo}.${qual}${conta[qual]++}`]; return f ? (b, nome) => f(b, nome, padrao, ctx) : padrao; },
    ...extras,
  };
}

// Fundo deste conjunto. As luzes da cena não entram na conta da cor (o material tem o sol dele), mas ficam acesas, brancas
// e sem mapa de sombra, para qualquer peça de material comum que apareça. "cabe": as pontas da cumeeira e do beiral do
// celeiro têm de caber na vista "tudo".
export const AMBIENTE = {
  fundo: '#98dcfd',
  ceu: { cor: '#ffffff', chao: '#ffffff', intensidade: 2.2 },
  sol: { cor: '#ffffff', intensidade: 0.9, direcao: [SOL.x, SOL.y, SOL.z] },
  sombra: null,
  cabe: { celeiro: [[0, 4.75, -2.0], [-2.2, 3.1, -2.0]] },
};
