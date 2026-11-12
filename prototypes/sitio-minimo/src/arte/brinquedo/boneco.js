// Conjunto "brinquedo": o boneco da Ana. O esqueleto é o mesmo do conjunto "codigo" (BONES de tools/visual-refs), e por
// isso as poses e a animação de src/arte/codigo/personagem.js servem sem mudança; aqui só se desenha cada osso de novo,
// pela folha arte/estilo/rodada-02/folha-personagem.png: cabeça grande (perto de três cabeças de altura), tronco em
// caixa arredondada, braços e pernas em cápsula, mãos ovais, botas gordinhas, lenço vermelho com nó e coque.
// O rosto (olhos, sobrancelhas, boca, bochechas) é de decalques chapados sobre a cabeça, sem textura.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BONES, BONE_INDEX } from '../../../../../tools/visual-refs/src/avatar/rig.js';
import { mix } from '../codigo/base.js';
import { P, BuilderBrinquedo, material, decalque, ovalDe } from './kit.js';

const TAU = Math.PI * 2, GR = Math.PI / 180;
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
    // olho oval com brilho, sobrancelha grossa, bochecha
    decalque(b, rosto, ovalDe(sx * 0.102, -0.005, 0.034, 0.05, 14), P.olho, { alt: 0.006 });
    decalque(b, rosto, ovalDe(sx * 0.102 + 0.012, 0.017, 0.012, 0.014, 8), P.branco, { alt: 0.009 });
    decalque(b, rosto, ovalDe(sx * 0.105, 0.08, 0.044, 0.012, 12, 0, 3, sx * -0.14), P.cabelo, { alt: 0.006 });
    decalque(b, rosto, ovalDe(sx * 0.192, -0.085, 0.04, 0.028, 12), mix(new THREE.Color(pele), new THREE.Color(P.bochecha), 0.55), { alt: 0.005 });
  }
  b.sph(1, 0, 0, P.peleClara, { p: [0, cy - 0.058, 0.276], s: [0.03, 0.026, 0.024], n: 8 }); // nariz
  // boca aberta sorrindo: um "D" deitado, com a língua
  const boca = [];
  for (let i = 0; i <= 12; i++) { const t = (i / 12) * Math.PI; boca.push([Math.cos(t) * 0.054, -0.108 - Math.sin(t) * 0.056]); }
  boca.push([-0.028, -0.115], [0, -0.118], [0.028, -0.115]);
  decalque(b, rosto, boca, P.boca, { alt: 0.006, centro: [0, -0.134] });
  decalque(b, rosto, ovalDe(0, -0.147, 0.028, 0.013, 10), P.lingua, { alt: 0.009 });

  // cabelo: uma capa por cima e por trás, duas mechas nas têmporas, costeletas e o coque
  b.group({ p: [c[0], cy, c[2] - 0.004], s: [r[0] * 1.035, r[1] * 1.035, r[2] * 1.04] }, () => b.add(new THREE.SphereGeometry(1, 24, 7, 0, TAU, 0, 0.5 * Math.PI), P.cabelo, { r: [-34, 0, 0] }));
  for (const sx of [-1, 1]) {
    b.sph(1, 0, 0, P.cabelo, { p: [sx * 0.2, cy + 0.125, 0.165], s: [0.095, 0.05, 0.06], r: [0, sx * 40, sx * -30], n: 10 });
    b.sph(1, 0, 0, P.cabelo, { p: [sx * 0.262, cy + 0.005, 0.085], s: [0.035, 0.07, 0.055], n: 8 });
  }
  b.sph(0.132, 0, 0, P.cabelo, { p: [0, cy + 0.335, -0.09], n: 16 });
  // lenço: faixa larga e fofa em volta da cabeça, mais alta na testa e mais baixa na nuca, com o laço na frente
  const faixa = [];
  for (let i = 0; i <= 4; i++) { const t = (62 + i * 6) * GR, R = 1.03 + 0.055 * Math.sin((i / 4) * Math.PI); faixa.push(new THREE.Vector2(R * Math.sin(t), R * Math.cos(t))); }
  b.group({ p: c, s: r }, () => b.add(new THREE.LatheGeometry(faixa.reverse(), 28), P.lenco, { r: [-20, 0, 0] }));
  b.sph(0.056, 0, 0, P.lencoEscuro, { p: [0, cy + 0.176, 0.262], n: 8 });
  for (const sx of [-1, 1]) b.sph(1, 0, 0, P.lenco, { p: [sx * 0.108, cy + 0.198, 0.226], s: [0.105, 0.068, 0.055], r: [0, sx * 30, sx * 16], n: 10 });
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
      b.cap(0.08, 0.2, P.camisa, { p: [0, -0.14, 0], n: 10, nc: 3 }); // manga curta
      b.cap(0.068, 0.2, pele, { p: [0, -0.275, 0], n: 8, nc: 2 });
      break;
    case 'lowerArmL': case 'lowerArmR':
      b.cap(0.066, 0.3, pele, { p: [0, -0.25, 0], n: 8, nc: 3 });
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
    const b = new BuilderBrinquedo(5);
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
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(root, mesh);
  const skeleton = new THREE.Skeleton(bones);
  mesh.bind(skeleton);
  return { group, root, mesh, bones, skeleton, probes, triangles: n / 3 };
}
