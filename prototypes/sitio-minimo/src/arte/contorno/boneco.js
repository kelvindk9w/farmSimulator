// Conjunto "contorno": o boneco da Ana. O esqueleto é o mesmo do conjunto "codigo" (BONES de tools/visual-refs), e por
// isso as poses e a animação de src/arte/codigo/personagem.js servem sem mudança; aqui só se desenha cada osso de novo,
// a partir do boneco do conjunto "brinquedo": cabeça grande, tronco em caixa arredondada, braços e pernas em cápsula,
// mãos ovais, botas gordinhas, lenço vermelho com nó e coque. O rosto (olhos, sobrancelhas, boca, bochechas) é de
// decalques chapados sobre a cabeça, sem textura e sem traço em volta; o traço do corpo é a casca do kit.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BONES, BONE_INDEX } from '../../../../../tools/visual-refs/src/avatar/rig.js';
import { mix } from '../codigo/base.js';
import { P, BuilderContorno, material, comTraco, decalque, ovalDe } from './kit.js';

const TAU = Math.PI * 2;
// a cabeça: um ovo um pouco achatado, com o centro acima do osso
const CAB = { c: [0, 0.25, 0], r: [0.3, 0.28, 0.285] };
// ponto da frente da cabeça, pela posição (x, y) em relação ao centro, levantado de "e"
function rosto(x, y, e = 0) {
  const { c, r } = CAB, k = 1 + e / 0.29, w = Math.sqrt(Math.max(0, 1 - (x / r[0]) ** 2 - (y / r[1]) ** 2));
  return [c[0] + x * k, c[1] + y * k, c[2] + r[2] * w * k];
}

function cabeca(b) {
  const { c, r } = CAB, cy = c[1], pele = P.pele;
  b.sph(1, 0, 0, pele, { p: c, s: r, n: 26 });
  for (const sx of [-1, 1]) {
    b.sph(1, 0, 0, pele, { p: [sx * 0.293, cy - 0.06, -0.005], s: [0.042, 0.068, 0.055], n: 8 }); // orelha
    // olho grande: o branco, a íris escura e o brilho; sobrancelha grossa
    decalque(b, rosto, ovalDe(sx * 0.105, -0.002, 0.052, 0.064, 14), P.branco, { alt: 0.005 });
    decalque(b, rosto, ovalDe(sx * 0.098, -0.008, 0.035, 0.05, 12), P.olho, { alt: 0.008 });
    decalque(b, rosto, ovalDe(sx * 0.098 + 0.013, 0.012, 0.012, 0.014, 8), P.branco, { alt: 0.011 });
    decalque(b, rosto, ovalDe(sx * 0.108, 0.092, 0.05, 0.015, 12, 0, 3, sx * -0.16), P.cabelo, { alt: 0.006 });
    decalque(b, rosto, ovalDe(sx * 0.19, -0.09, 0.038, 0.026, 10), mix(new THREE.Color(pele), new THREE.Color(P.bochecha), 0.5), { alt: 0.005 });
  }
  b.bola(1, P.peleEscura, { p: [0, cy - 0.06, 0.279], s: [0.026, 0.02, 0.018], semTraco: true }); // nariz
  // boca aberta sorrindo: um "D" deitado, com os dentes em cima
  const boca = [];
  for (let i = 0; i <= 10; i++) { const t = (i / 10) * Math.PI; boca.push([Math.cos(t) * 0.062, -0.112 - Math.sin(t) * 0.058]); }
  boca.push([-0.03, -0.119], [0, -0.122], [0.03, -0.119]);
  decalque(b, rosto, boca, P.boca, { alt: 0.006, centro: [0, -0.138] });
  decalque(b, rosto, [[-0.046, -0.117], [0.046, -0.117], [0.036, -0.136], [0, -0.141], [-0.036, -0.136]], P.branco, { alt: 0.009 });

  // cabelo: uma capa por cima e por trás, duas mechas nas têmporas e o coque no alto
  b.group({ p: [c[0], cy, c[2] - 0.004], s: [r[0] * 1.035, r[1] * 1.035, r[2] * 1.04] }, () => b.add(new THREE.SphereGeometry(1, 16, 5, 0, TAU, 0, 0.5 * Math.PI), P.cabelo, { r: [-34, 0, 0] }));
  for (const sx of [-1, 1]) b.sph(1, 0, 0, P.cabelo, { p: [sx * 0.262, cy + 0.005, 0.085], s: [0.035, 0.07, 0.055], n: 8 });
  b.sph(0.14, 0, 0, P.cabelo, { p: [0, cy + 0.33, -0.13], n: 14 });
  // lenço vermelho: uma touca por cima do cabelo, da testa até atrás, com o nó de lado e as duas pontas caindo
  b.group({ p: [c[0], cy, c[2]], s: [r[0] * 1.065, r[1] * 1.065, r[2] * 1.075] }, () => b.add(new THREE.SphereGeometry(1, 16, 5, 0, TAU, 0, 0.33 * Math.PI), P.lenco, { r: [-26, 0, 0] }));
  b.sph(0.055, 0, 0, P.lencoEscuro, { p: [0.2, cy + 0.03, -0.235], n: 8 });
  for (const k of [0, 1]) b.folha(0.2, 0.11, P.lenco, { p: [0.205, cy + 0.02, -0.25], r: [0, 60 + k * 50, -150 + k * 16], dobra: 20, esp: 0.5 });
}

// As partes de um osso, em coordenadas do osso (medidas dos ossos em tools/visual-refs/src/avatar/rig.js).
function partes(b, osso) {
  const lado = osso.endsWith('L') ? 1 : -1, azul = P.jardineira, pele = P.pele;
  const arco = (raio, alt, y, meio, larg, cor) => b.add(new THREE.CylinderGeometry(raio, raio, alt, 10, 1, true, meio - larg / 2, larg), cor, { p: [0, y, 0], s: [1, 1, 0.77] });
  switch (osso) {
    case 'hips':
      b.box(0.43, 0.27, 0.33, azul, { p: [0, -0.175, 0], q: 0.12, seg: 3 });
      break;
    case 'spine':
      b.cyl(0.212, 0.216, 0.2, 0, azul, { p: [0, -0.03, 0], s: [1, 1, 0.77], q: 0.03, n: 16 });
      break;
    case 'chest':
      b.cyl(0.19, 0.214, 0.27, 0, P.camisa, { p: [0, -0.01, 0], s: [1, 1, 0.77], q: 0.1, n: 16 }); // camiseta
      // jardineira: peitilho com bolso, costas, alças por cima do ombro e botões
      arco(0.224, 0.2, 0.045, 0, 1.24, azul);
      arco(0.231, 0.085, 0.03, 0, 0.62, P.jardineiraEscura);
      arco(0.224, 0.12, 0.0, Math.PI, 1.1, azul);
      for (const sx of [-1, 1]) {
        b.tube([[sx * 0.105, 0.13, 0.142], [sx * 0.112, 0.215, 0.085], [sx * 0.112, 0.242, -0.01], [sx * 0.1, 0.19, -0.105], [sx * 0.08, 0.05, -0.158]], 0.03, 0, azul, { n: 6, steps: 10 });
        b.sph(0.027, 0, 0, P.camisa, { p: [sx * 0.105, 0.125, 0.165], s: [1, 1, 0.7], n: 8 });
      }
      break;
    case 'neck':
      b.cyl(0.075, 0.082, 0.1, 0, pele, { p: [0, -0.04, 0], n: 8, q: 0.01 });
      break;
    case 'head':
      cabeca(b);
      break;
    case 'upperArmL': case 'upperArmR':
      b.cap(0.082, 0.33, P.camisa, { p: [0, -0.27, 0], n: 10, nc: 2 }); // manga até o cotovelo
      break;
    case 'lowerArmL': case 'lowerArmR':
      b.cyl(0.088, 0.088, 0.07, 0, P.camisaEscura, { p: [0, -0.06, 0], q: 0.025, n: 10 }); // a manga dobrada
      b.cap(0.066, 0.28, pele, { p: [0, -0.25, 0], n: 8, nc: 2 });
      break;
    case 'handL': case 'handR':
      b.sph(1, 0, 0, pele, { p: [0, -0.05, 0.005], s: [0.076, 0.09, 0.084], n: 10 });
      b.sph(0.034, 0, 0, pele, { p: [lado * -0.028, -0.03, 0.07], n: 6 }); // polegar
      break;
    case 'upperLegL': case 'upperLegR':
      b.cap(0.108, 0.42, azul, { p: [0, -0.345, 0], n: 12, nc: 3 });
      break;
    case 'lowerLegL': case 'lowerLegR':
      b.cap(0.1, 0.25, azul, { p: [0, -0.17, 0], n: 12, nc: 3 });
      b.cyl(0.118, 0.118, 0.078, 0, P.jardineiraClara, { p: [0, -0.205, 0], q: 0.03, n: 12 }); // barra dobrada
      b.cyl(0.104, 0.108, 0.14, 0, P.bota, { p: [0, -0.295, 0], q: 0.02, n: 12 }); // cano da bota
      break;
    case 'footL': case 'footR':
      b.box(0.192, 0.135, 0.31, P.bota, { p: [0, -0.066, 0.05], q: 0.062, seg: 3 });
      b.box(0.204, 0.04, 0.322, P.botaEscura, { p: [0, -0.082, 0.05], q: 0.018, seg: 1 });
      break;
  }
}

// Monta esqueleto e malha (um osso por vértice), no mesmo formato de criarAvatar() de tools/visual-refs.
export function avatar() {
  const bones = BONES.map(([nome]) => { const o = new THREE.Bone(); o.name = nome; return o; });
  BONES.forEach(([, pai, pos], i) => { bones[i].position.set(pos[0], pos[1], pos[2]); if (pai) bones[BONE_INDEX[pai]].add(bones[i]); });
  const root = bones[0];
  root.updateMatrixWorld(true);
  const geos = [], probes = {}; // probes: caixa de cada osso, para apoiar o corpo no chão e no banquinho
  BONES.forEach(([nome], i) => {
    if (nome === 'root') return;
    const b = new BuilderContorno(5);
    partes(b, nome);
    if (!b.parts.length) return;
    const caixa = new THREE.Box3();
    for (const g of b.parts) { g.computeBoundingBox(); caixa.union(g.boundingBox); }
    probes[nome] = caixa;
    for (const g of b.parts) { g.applyMatrix4(bones[i].matrixWorld); g.userData.bone = i; geos.push(g); }
  });
  const junta = mergeGeometries(geos, false), n = junta.attributes.position.count;
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  let k = 0;
  for (const g of geos) { const c = g.attributes.position.count; for (let j = 0; j < c; j++, k++) { si[k * 4] = g.userData.bone; sw[k * 4] = 1; } }
  junta.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  junta.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  const mesh = new THREE.SkinnedMesh(junta, material().clone());
  mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(root, mesh);
  const skeleton = new THREE.Skeleton(bones);
  mesh.bind(skeleton);
  comTraco(mesh);
  return { group, root, mesh, bones, skeleton, probes, triangles: n / 3 };
}
