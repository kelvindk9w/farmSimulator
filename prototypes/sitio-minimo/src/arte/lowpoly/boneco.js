// Conjunto "lowpoly": o boneco da Ana em peças facetadas. O esqueleto é o mesmo do conjunto "codigo" (BONES de
// tools/visual-refs), e por isso as poses e a animação de src/arte/codigo/personagem.js servem sem mudança; aqui só se
// desenha cada osso de novo: cabeça de oito lados com o lenço vermelho e o coque, tronco de seis lados com a camisa
// amarela e a jardineira azul, braços e pernas em prismas, botas marrons. O rosto são pecinhas escuras saltadas.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BONES, BONE_INDEX } from '../../../../../tools/visual-refs/src/avatar/rig.js';
import { P, BuilderLowpoly, material } from './kit.js';

const GR = Math.PI / 180, J = 0.022;

function cabeca(b) {
  const pele = P.pele;
  // oito lados, com uma face chata virada para a frente
  b.lathe([[0.001, 0], [0.12, 0], [0.2, 0.08], [0.225, 0.2], [0.21, 0.32], [0.14, 0.42], [0.001, 0.45]], 8, pele, { r: [0, 22.5, 0], jit: J });
  for (const sx of [-1, 1]) {
    b.box(0.036, 0.052, 0.02, P.olho, { p: [sx * 0.066, 0.185, 0.203], jit: 0 });
    b.box(0.054, 0.013, 0.02, P.cabelo, { p: [sx * 0.068, 0.262, 0.198], r: [0, 0, sx * -8], jit: 0 });
    b.box(0.03, 0.065, 0.045, P.peleEscura, { p: [sx * 0.222, 0.14, -0.005], jit: J }); // orelha
  }
  b.cone(0.024, 0.034, 4, P.peleEscura, { p: [0, 0.148, 0.198], r: [90, 0, 0], jit: J }); // nariz
  b.box(0.066, 0.015, 0.02, P.boca, { p: [0, 0.092, 0.186], jit: 0 });
  // cabelo: uma faixa atrás e dos lados, a nuca, e o coque no alto
  b.add(new THREE.CylinderGeometry(0.226, 0.24, 0.15, 5, 1, true, 67.5 * GR, 225 * GR), P.cabelo, { p: [0, 0.265, 0], jit: J });
  b.add(new THREE.CylinderGeometry(0.24, 0.2, 0.14, 3, 1, true, 112.5 * GR, 135 * GR), P.cabelo, { p: [0, 0.12, 0], jit: J });
  b.ico(0.1, 0, P.cabelo, { p: [0, 0.49, -0.11], jit: 0.04 });
  b.cone(0.075, 0.36, 5, P.cabelo, { p: [0, 0.3, -0.2], r: [196, 0, 0], jit: J }); // rabo de cavalo
  // lenço vermelho: uma touca de oito lados por cima, com o nó e as duas pontas atrás
  b.lathe([[0.238, 0.295], [0.246, 0.36], [0.165, 0.45], [0.001, 0.478]], 8, P.lenco, { r: [0, 22.5, 0], jit: 0.04 });
  b.box(0.07, 0.05, 0.04, P.lencoEscuro, { p: [0.03, 0.3, -0.25] });
  for (const k of [-1, 1]) b.tbox(0.05, 0.02, 0.02, 0.012, 0.13, P.lencoEscuro, { p: [0.03 + k * 0.03, 0.32, -0.26], r: [-150, 0, k * 22] });
}

// As partes de um osso, em coordenadas do osso (medidas dos ossos em tools/visual-refs/src/avatar/rig.js).
function partes(b, osso) {
  const azul = P.jardineira, pele = P.pele;
  // tronco: prisma de seis lados achatado para trás, com uma face virada para a frente
  const seis = (rt, rb, h, y, cor) => b.group({ p: [0, y, 0], s: [1, 1, 0.72] }, () => b.cyl(rt, rb, h, 6, cor, { r: [0, 30, 0], jit: J }));
  switch (osso) {
    case 'hips':
      seis(0.2, 0.185, 0.22, -0.17, azul);
      break;
    case 'spine':
      seis(0.196, 0.2, 0.19, -0.03, azul);
      break;
    case 'chest':
      seis(0.205, 0.196, 0.25, -0.01, P.camisa);
      // jardineira: peitilho com bolso, alças por cima do ombro e costas
      b.box(0.2, 0.16, 0.03, azul, { p: [0, -0.01, 0.12], jit: J });
      b.box(0.11, 0.06, 0.012, P.jardineiraEscura, { p: [0, 0.035, 0.138], jit: 0 });
      b.box(0.2, 0.12, 0.03, azul, { p: [0, -0.01, -0.12], jit: J });
      for (const sx of [-1, 1]) {
        b.box(0.05, 0.11, 0.03, azul, { p: [sx * 0.075, 0.145, 0.12], jit: J });
        b.box(0.05, 0.022, 0.27, azul, { p: [sx * 0.075, 0.24, 0], jit: J });
        b.box(0.05, 0.14, 0.03, azul, { p: [sx * 0.075, 0.105, -0.12], jit: J });
        b.box(0.026, 0.026, 0.012, P.camisaEscura, { p: [sx * 0.075, 0.125, 0.14], jit: 0 }); // botão
      }
      break;
    case 'neck':
      b.cyl(0.062, 0.072, 0.1, 5, P.peleEscura, { p: [0, -0.04, 0], jit: J });
      break;
    case 'head':
      cabeca(b);
      break;
    case 'upperArmL': case 'upperArmR': // manga comprida
      b.cyl(0.05, 0.072, 0.04, 5, P.camisa, { p: [0, 0.02, 0], jit: J }); // ombro
      b.cyl(0.072, 0.064, 0.27, 5, P.camisa, { p: [0, -0.25, 0], jit: J });
      break;
    case 'lowerArmL': case 'lowerArmR':
      b.cyl(0.064, 0.058, 0.16, 5, P.camisa, { p: [0, -0.14, 0], jit: J });
      b.cyl(0.068, 0.068, 0.04, 5, P.camisaEscura, { p: [0, -0.17, 0], jit: J }); // manga dobrada
      b.cyl(0.05, 0.046, 0.07, 5, pele, { p: [0, -0.22, 0], jit: J });
      break;
    case 'handL': case 'handR':
      b.tbox(0.07, 0.085, 0.085, 0.092, 0.1, pele, { p: [0, -0.1, 0.005], jit: J });
      b.box(0.03, 0.04, 0.035, P.peleEscura, { p: [(osso === 'handL' ? -1 : 1) * 0.035, -0.06, 0.055], jit: J }); // polegar
      break;
    case 'upperLegL': case 'upperLegR':
      b.cyl(0.1, 0.086, 0.34, 6, azul, { p: [0, -0.31, 0], jit: J });
      break;
    case 'lowerLegL': case 'lowerLegR':
      b.cyl(0.086, 0.08, 0.2, 6, azul, { p: [0, -0.17, 0], jit: J });
      b.cyl(0.094, 0.094, 0.05, 6, P.jardineiraClara, { p: [0, -0.19, 0], jit: J }); // barra dobrada
      b.cyl(0.086, 0.092, 0.13, 6, P.bota, { p: [0, -0.3, 0], jit: J }); // cano da bota
      break;
    case 'footL': case 'footR':
      b.tbox(0.17, 0.28, 0.15, 0.2, 0.11, P.bota, { p: [0, -0.06, 0.04], jit: J });
      b.box(0.182, 0.026, 0.292, P.botaEscura, { p: [0, -0.06, 0.04], jit: J });
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
    const b = new BuilderLowpoly(5 + i);
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
