// Poses e animações do avatar: tudo é rotação de juntas (graus, ordem XYZ) no mesmo esqueleto.
// Convenção: personagem olha para +Z; +X é o lado ESQUERDO dele.
//   pernas/braços: rx negativo = para a frente; joelho: rx positivo dobra; cotovelo: rx negativo dobra
//   braço esquerdo abre com rz positivo (o direito é espelhado automaticamente por sym()).
import * as THREE from 'three';
import { Builder, MAT } from '../lib/builder.js';
import { C, mix, shade } from '../lib/palette.js';
import { BONES, BONE_INDEX } from './rig.js';
import { caixote } from '../models/buildings.js';

const DEG = Math.PI / 180;
const LIMBS = ['upperArm', 'lowerArm', 'hand', 'upperLeg', 'lowerLeg', 'foot'];

// atalho: define os dois lados de uma vez (espelha ry e rz no lado direito)
function sym(pose, both) {
  for (const k of Object.keys(both)) {
    const [x, y, z] = both[k];
    pose[k + 'L'] = [x, y, z];
    pose[k + 'R'] = [x, -y, -z];
  }
  return pose;
}
const R = (v) => [v[0], -v[1], -v[2]]; // espelha uma rotação para o lado direito

const s = Math.sin, c = Math.cos, TAU = Math.PI * 2;
const ease = (t) => t * t * (3 - 2 * t);

function base() {
  return sym({ hips: [0, 0, 0], spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], root: [0, 0, 0], lift: 0 },
    { upperArm: [0, 0, 7], lowerArm: [-10, 0, 0], hand: [0, 0, 0], upperLeg: [0, 0, 2], lowerLeg: [0, 0, 0], foot: [0, 0, 0] });
}

export function lerpPose(a, b, t) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const va = a[k], vb = b[k];
    if (k === 'props' || k === 'ground' || k === 'seat') { out[k] = t < 0.5 ? va ?? vb : vb ?? va; continue; }
    if (typeof va === 'number' || typeof vb === 'number') { out[k] = (va || 0) + ((vb || 0) - (va || 0)) * t; continue; }
    const A = va || [0, 0, 0], B = vb || [0, 0, 0];
    out[k] = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
  }
  return out;
}
// interpola uma lista [[t, pose], ...]
function keys(t, list) {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) {
      const u = (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]);
      return lerpPose(list[i - 1][1], list[i][1], ease(u));
    }
  }
  return list[list.length - 1][1];
}

// ---------------- poses-chave ----------------
export const POSES = {
  parado: (t = 0) => {
    const p = base(); const br = s(t * TAU);
    p.chest = [1 + br * 1.2, 0, 0]; p.head = [-1 - br * 0.8, 0, 0];
    p.upperArmL = [0, 0, 7 + br]; p.upperArmR = [0, 0, -7 - br];
    return p;
  },
  andar: (t = 0) => {
    const p = base(); const f = t * TAU;
    const A = 30, B = 26;
    p.upperLegL = [-A * s(f) - 4, 0, 2]; p.upperLegR = [A * s(f) - 4, 0, -2];
    p.lowerLegL = [6 + 52 * Math.max(0, c(f - 0.5)), 0, 0]; p.lowerLegR = [6 + 52 * Math.max(0, c(f + Math.PI - 0.5)), 0, 0];
    p.footL = [-10 * s(f) * Math.max(0, s(f)) + 14 * Math.max(0, -s(f - 0.6)), 0, 0];
    p.footR = [-10 * s(f + Math.PI) * Math.max(0, s(f + Math.PI)) + 14 * Math.max(0, -s(f + Math.PI - 0.6)), 0, 0];
    p.upperArmL = [B * s(f), 0, 6]; p.upperArmR = [-B * s(f), 0, -6];
    p.lowerArmL = [-16 - 12 * Math.max(0, -s(f)), 0, 0]; p.lowerArmR = [-16 - 12 * Math.max(0, s(f)), 0, 0];
    p.hips = [2, -6 * s(f), 2 * c(f * 1)]; p.spine = [2, 5 * s(f), -1.5 * c(f)]; p.chest = [1, 6 * s(f), 0];
    p.head = [-3, -5 * s(f), 0];
    return p;
  },
  correr: (t = 0) => {
    const p = base(); const f = t * TAU;
    const A = 48, B = 50;
    p.upperLegL = [-A * s(f) - 14, 0, 2]; p.upperLegR = [A * s(f) - 14, 0, -2];
    p.lowerLegL = [14 + 88 * Math.max(0, c(f - 0.7)), 0, 0]; p.lowerLegR = [14 + 88 * Math.max(0, c(f + Math.PI - 0.7)), 0, 0];
    p.footL = [18 * Math.max(0, -s(f - 0.4)), 0, 0]; p.footR = [18 * Math.max(0, s(f - 0.4)), 0, 0];
    p.upperArmL = [B * s(f) - 6, 0, 10]; p.upperArmR = [-B * s(f) - 6, 0, -10];
    p.lowerArmL = [-82, 0, 0]; p.lowerArmR = [-82, 0, 0];
    p.hips = [12, -9 * s(f), 0]; p.spine = [6, 8 * s(f), 0]; p.chest = [3, 9 * s(f), 0];
    p.head = [-14, -8 * s(f), 0];
    p.lift = 0.07 * Math.abs(s(f)) ** 1.5;
    return p;
  },
  agachado: () => {
    const p = base();
    sym(p, { upperLeg: [-112, 0, 14], lowerLeg: [138, 0, 0], foot: [-26, 0, 0], upperArm: [-52, 0, 8], lowerArm: [-48, 0, 0] });
    p.hips = [8, 0, 0]; p.spine = [14, 0, 0]; p.chest = [8, 0, 0]; p.head = [-22, 0, 0];
    return p;
  },
  sentado: () => {
    const p = base();
    sym(p, { upperLeg: [-88, 0, 7], lowerLeg: [86, 0, 0], foot: [2, 0, 0], upperArm: [-28, 0, 6], lowerArm: [-42, 0, -8] });
    p.hips = [-4, 0, 0]; p.spine = [3, 0, 0]; p.chest = [3, 0, 0]; p.head = [-2, 0, 0];
    p.ground = 'assento'; p.seat = 0.27;
    return p;
  },
  // sentado no chão (transição para deitar)
  sentadoChao: () => {
    const p = base();
    sym(p, { upperLeg: [-70, 0, 9], lowerLeg: [64, 0, 0], foot: [10, 0, 0], upperArm: [28, 0, 16], lowerArm: [-8, 0, 0] });
    p.hips = [-18, 0, 0]; p.spine = [6, 0, 0]; p.chest = [4, 0, 0]; p.head = [8, 0, 0];
    return p;
  },
  deitado: () => {
    const p = base();
    p.root = [-90, 0, 0];
    p.upperLegL = [-4, 0, 6]; p.lowerLegL = [4, 0, 0]; p.footL = [-24, 0, 6];
    p.upperLegR = [-58, 0, -6]; p.lowerLegR = [104, 0, 0]; p.footR = [-36, 0, 0];
    // mãos atrás da cabeça
    p.upperArmL = [-10, 0, 142]; p.lowerArmL = [-10, 0, 128]; p.upperArmR = R([-10, 0, 142]); p.lowerArmR = R([-10, 0, 128]);
    p.head = [-8, 0, 0]; p.neck = [-4, 0, 0];
    p.shift = [0, 0, 0.85]; // centraliza o corpo deitado
    return p;
  },
  regar: (t = 0.5) => {
    const p = base(); const k = s(t * TAU) * 0.5 + 0.5; // 0..1: inclina o regador
    p.upperLegL = [-16, 0, 6]; p.lowerLegL = [18, 0, 0]; p.footL = [-2, 0, 0];
    p.upperLegR = [12, 0, -6]; p.lowerLegR = [10, 0, 0]; p.footR = [-22, 0, 0];
    p.hips = [6, -10, 0]; p.spine = [8, 0, 0]; p.chest = [6, 6, 0]; p.head = [14, 6, 0];
    p.upperArmR = [-50 - k * 8, 0, -12]; p.lowerArmR = [-38, 0, 0];
    p.upperArmL = [-34, 0, 4]; p.lowerArmL = [-66, 0, -40];
    p.props = [{ type: 'regador', at: 'handR', pitch: 16 + k * 22, water: k > 0.25 ? k : 0 }];
    return p;
  },
  colher: (t = 0.35) => {
    // t: 0 = alcança a planta (abaixado) ... 1 = levanta com o fruto
    const down = base();
    sym(down, { upperLeg: [-74, 0, 12], lowerLeg: [96, 0, 0], foot: [-22, 0, 0] });
    down.upperLegR = [-40, 0, -10]; down.lowerLegR = [108, 0, 0]; down.footR = [-36, 0, 0];
    down.hips = [22, 0, 0]; down.spine = [22, -6, 0]; down.chest = [12, -8, 0]; down.head = [-18, 6, 0];
    down.upperArmR = [-70, 0, -4]; down.lowerArmR = [-14, 0, 0];
    down.upperArmL = [-18, 0, 20]; down.lowerArmL = [-78, 0, -30];
    const up = base();
    up.upperLegL = [-10, 0, 4]; up.lowerLegL = [14, 0, 0]; up.upperLegR = [6, 0, -4]; up.lowerLegR = [8, 0, 0]; up.footR = [-12, 0, 0];
    up.hips = [2, 0, 0]; up.spine = [2, 0, 0]; up.chest = [0, 0, 0]; up.head = [-10, -12, 0];
    up.upperArmR = [-96, 0, -14]; up.lowerArmR = [-52, 0, 0];
    up.upperArmL = [-18, 0, 20]; up.lowerArmL = [-78, 0, -30];
    const p = lerpPose(down, up, ease(Math.min(1, Math.max(0, t))));
    p.props = [{ type: 'cesto', at: 'handL', fill: t > 0.6 }, ...(t > 0.3 ? [{ type: 'espiga', at: 'handR' }] : [])];
    return p;
  },
  carregar: (t = 0.12) => {
    const p = POSES.andar(t); const f = t * TAU;
    p.upperArmL = [-38, 0, 2]; p.upperArmR = [-38, 0, -2];
    p.lowerArmL = [-64, 0, -30]; p.lowerArmR = [-64, 0, 30];
    p.spine = [-3, 2 * s(f), 0]; p.chest = [-3, 2 * s(f), 0]; p.hips = [0, -4 * s(f), 0]; p.head = [-2, 0, 0];
    p.props = [{ type: 'caixa', at: 'hands' }];
    return p;
  },
  // pulo: preparo -> impulso -> ápice -> queda -> aterrissagem
  pular: (t = 0.5) => {
    const prep = POSES.agachado(); prep.upperArmL = [38, 0, 14]; prep.upperArmR = [38, 0, -14]; prep.lowerArmL = [-20, 0, 0]; prep.lowerArmR = [-20, 0, 0];
    sym(prep, { upperLeg: [-78, 0, 10], lowerLeg: [104, 0, 0], foot: [-26, 0, 0] }); prep.spine = [20, 0, 0]; prep.head = [-16, 0, 0];
    const push = base(); sym(push, { upperLeg: [6, 0, 3], lowerLeg: [4, 0, 0], foot: [38, 0, 0], upperArm: [-150, 0, 12], lowerArm: [-12, 0, 0] });
    push.spine = [-4, 0, 0]; push.head = [-10, 0, 0]; push.lift = 0.12;
    const apex = base(); sym(apex, { upperLeg: [-52, 0, 12], lowerLeg: [84, 0, 0], foot: [24, 0, 0], upperArm: [-150, 0, 34], lowerArm: [-22, 0, 0] });
    apex.spine = [4, 0, 0]; apex.head = [-6, 0, 0]; apex.lift = 0.5;
    const fall = base(); sym(fall, { upperLeg: [-22, 0, 8], lowerLeg: [28, 0, 0], foot: [26, 0, 0], upperArm: [-70, 0, 62], lowerArm: [-20, 0, 0] });
    fall.spine = [4, 0, 0]; fall.head = [6, 0, 0]; fall.lift = 0.26;
    const land = POSES.agachado(); sym(land, { upperLeg: [-66, 0, 10], lowerLeg: [92, 0, 0], foot: [-26, 0, 0], upperArm: [-40, 0, 30], lowerArm: [-30, 0, 0] });
    land.spine = [16, 0, 0];
    return keys(t, [[0, base()], [0.18, prep], [0.36, push], [0.56, apex], [0.74, fall], [0.88, land], [1, base()]]);
  },
};

// ---------------- animações (t em 0..1) ----------------
// frames = quantos quadros um sprite 2D precisaria; dur = duração em segundos (para os clipes 3D)
export const ANIMS = {
  parado: { nome: 'Parado (respirando)', frames: 8, dur: 2.4, loop: true, fn: (t) => POSES.parado(t) },
  andar: { nome: 'Andar', frames: 8, dur: 0.9, loop: true, fn: (t) => POSES.andar(t) },
  correr: { nome: 'Correr', frames: 8, dur: 0.6, loop: true, fn: (t) => POSES.correr(t) },
  pular: { nome: 'Pular', frames: 6, dur: 0.8, loop: false, fn: (t) => POSES.pular(t) },
  agachar: { nome: 'Agachar', frames: 4, dur: 0.35, loop: false, fn: (t) => lerpPose(POSES.parado(0), POSES.agachado(), ease(t)) },
  sentar: { nome: 'Sentar', frames: 4, dur: 0.5, loop: false, fn: (t) => { const p = lerpPose(POSES.parado(0), POSES.sentado(), ease(t)); if (t > 0.5) { p.ground = 'assento'; p.seat = 0.27; } return p; } },
  deitar: { nome: 'Deitar', frames: 6, dur: 1.0, loop: false, fn: (t) => keys(t, [[0, POSES.parado(0)], [0.45, POSES.sentadoChao()], [1, POSES.deitado()]]) },
  regar: { nome: 'Regar', frames: 8, dur: 1.2, loop: true, fn: (t) => POSES.regar(t) },
  colher: { nome: 'Colher', frames: 8, dur: 1.1, loop: false, fn: (t) => POSES.colher(t) },
  carregar: { nome: 'Carregar caixa', frames: 8, dur: 0.95, loop: true, fn: (t) => POSES.carregar(t) },
};
export const quadro = (anim, i) => ANIMS[anim].fn(ANIMS[anim].loop ? i / ANIMS[anim].frames : i / (ANIMS[anim].frames - 1));

// ---------------- objetos de mão ----------------
const propCache = new Map();
function propMesh(type, variant) {
  const key = type + ':' + variant;
  const b = new Builder(11);
  if (type === 'regador') {
    // origem na alça; bico para +Z
    b.group({ p: [0, -0.2, 0.02] }, () => {
      b.cyl(0.1, 0.115, 0.2, 8, C.can, { grad: mix(C.can, C.white, 0.25), smooth: true });
      b.cyl(0.1, 0.1, 0.015, 8, C.canDark, { p: [0, 0.2, 0] });
      b.cyl(0.02, 0.032, 0.3, 5, C.canDark, { p: [0, 0.05, 0.09], r: [58, 0, 0] });
      b.cone(0.05, 0.06, 6, C.can, { p: [0, 0.205, 0.345], r: [58 + 180, 0, 0] });
      b.tube([[0, 0.19, -0.06], [0, 0.3, -0.07], [0, 0.3, -0.19], [0, 0.1, -0.13]], 0.014, 4, C.canDark, {});
      if (variant > 0) {
        // jato de água em arco
        for (let i = 0; i < 7; i++) {
          const u = i / 6;
          const z = 0.4 + u * 0.36, y = 0.2 - u * u * 0.62 - u * 0.05;
          for (const dx of [-0.05, 0.0, 0.05]) if ((i + (dx > 0 ? 1 : 0)) % 2 === 0 || dx === 0) b.ico(0.02 + u * 0.008, 0, i % 2 ? C.waterLight : C.water, { p: [dx * (1 + u * 1.5), y + (dx !== 0 ? -0.03 : 0), z] });
        }
      }
    });
  } else if (type === 'caixa') {
    caixote(b, { p: [0, -0.16, 0], s: 0.9 }, 'laranja');
  } else if (type === 'cesto') {
    b.cyl(0.15, 0.1, 0.16, 8, C.basket, { p: [0, -0.2, 0], grad: mix(C.basket, C.white, 0.2), smooth: true });
    b.cyl(0.155, 0.155, 0.025, 8, shade(C.basket, 0.8), { p: [0, -0.06, 0], open: true });
    b.tube([[-0.14, -0.05, 0], [-0.1, 0.06, 0], [0.1, 0.06, 0], [0.14, -0.05, 0]], 0.012, 4, shade(C.basket, 0.8), {});
    if (variant) for (let i = 0; i < 3; i++) b.cyl(0.03, 0.038, 0.16, 5, C.cornEar, { p: [-0.06 + i * 0.06, -0.1, 0], r: [20 - i * 20, 0, 12 * (i - 1)] });
  } else if (type === 'espiga') {
    b.cyl(0.03, 0.042, 0.2, 6, C.cornEar, { p: [0, -0.1, 0.04], r: [20, 0, 0] });
    b.leaf(0.16, 0.07, 60, C.cornHusk, { p: [0, -0.1, 0.04], r: [150, 0, 0], steps: 2 });
    b.leaf(0.16, 0.07, 60, C.cornHusk, { p: [0, -0.1, 0.04], r: [150, 180, 0], steps: 2 });
  } else if (type === 'banquinho') {
    b.cyl(0.2, 0.2, 0.045, 10, C.woodLight, { p: [0, 0.225, 0] });
    for (let i = 0; i < 3; i++) b.cyl(0.025, 0.03, 0.24, 5, C.woodDark, { p: [Math.cos(i * 2.09) * 0.13, 0, Math.sin(i * 2.09) * 0.13], r: [Math.sin(i * 2.09) * -8, 0, Math.cos(i * 2.09) * 8] });
  } else if (type === 'esteira') {
    for (let i = 0; i < 6; i++) b.box(0.74, 0.02, 0.3, i % 2 ? C.clothRed : C.clothWhite, { p: [0, 0, -0.75 + i * 0.3] });
  }
  const m = b.mesh(MAT());
  m.userData.propKey = key;
  return m;
}

// ---------------- aplicar pose ----------------
const _v = new THREE.Vector3();
export function aplicarPose(av, pose) {
  const bones = av.bones;
  for (const [name] of BONES) {
    const bone = bones[BONE_INDEX[name]];
    const r = pose[name] || [0, 0, 0];
    bone.rotation.set(r[0] * DEG, r[1] * DEG, r[2] * DEG, 'XYZ');
  }
  const root = av.root;
  root.position.set(0, 0, 0);
  av.group.updateMatrixWorld(true);
  // apoia no chão: menor Y dos cantos das caixas de cada osso (no espaço do grupo)
  const inv = new THREE.Matrix4().copy(av.group.matrixWorld).invert();
  let minY = Infinity;
  const seat = pose.ground === 'assento';
  for (const name of Object.keys(av.probes)) {
    if (seat && !(name === 'hips' || name.startsWith('upperLeg'))) continue;
    const box = av.probes[name];
    const m = new THREE.Matrix4().multiplyMatrices(inv, bones[BONE_INDEX[name]].matrixWorld);
    for (let i = 0; i < 8; i++) {
      _v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyMatrix4(m);
      if (_v.y < minY) minY = _v.y;
    }
  }
  root.position.y = -minY + (seat ? pose.seat || 0 : 0) + (pose.lift || 0);
  if (pose.shift) { root.position.x = pose.shift[0]; root.position.z = pose.shift[2]; }
  av.group.updateMatrixWorld(true);
  // objetos de mão: seguem a posição do osso, com orientação própria no espaço do avatar
  for (const m of av.props) av.group.remove(m);
  av.props = [];
  for (const pr of pose.props || []) {
    const variant = pr.type === 'regador' ? (pr.water > 0 ? 1 : 0) : pr.fill ? 1 : 0;
    const m = propMesh(pr.type, variant);
    const pos = (bn) => _v.setFromMatrixPosition(bones[BONE_INDEX[bn]].matrixWorld).applyMatrix4(inv).clone();
    if (pr.at === 'hands') {
      const a = pos('handL'), b2 = pos('handR');
      m.position.copy(a.add(b2).multiplyScalar(0.5)); m.position.z += 0.06; m.position.y += 0.04;
      const chestYaw = pose.chest ? pose.chest[1] * 0.5 : 0;
      m.rotation.set(0, chestYaw * DEG, 0);
    } else {
      // desce até a palma (o osso é o punho)
      const wrist = bones[BONE_INDEX[pr.at]];
      const palm = new THREE.Vector3(0, -0.045, 0.01).applyMatrix4(wrist.matrixWorld).applyMatrix4(inv);
      m.position.copy(palm);
      if (pr.type === 'regador') m.rotation.set((pr.pitch || 0) * DEG, -8 * DEG, 0);
      else if (pr.type === 'cesto') m.rotation.set(0, 0, 0);
      else if (pr.type === 'espiga') m.rotation.set(-30 * DEG, 0, 0);
    }
    av.group.add(m);
    av.props.push(m);
  }
  av.group.updateMatrixWorld(true);
  av.skeleton.update();
  return av;
}

export function cenarioPose(type) { return propMesh(type, 0); }

// Converte as animações em clipes de keyframes (quaternions por osso) — é isso que um jogo 3D carregaria.
export function clipes(av, fps = 15) {
  const out = [];
  for (const [key, a] of Object.entries(ANIMS)) {
    const n = Math.max(2, Math.round(a.dur * fps) + 1);
    const times = [];
    const tracksQ = BONES.map(() => []);
    const rootPos = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      times.push(t * a.dur);
      aplicarPose(av, a.fn(a.loop ? t % 1 : t));
      BONES.forEach(([name], bi) => { const q = av.bones[bi].quaternion; tracksQ[bi].push(q.x, q.y, q.z, q.w); });
      rootPos.push(av.root.position.x, av.root.position.y, av.root.position.z);
    }
    const tracks = [];
    BONES.forEach(([name], bi) => {
      // só exporta trilhas de ossos que realmente giram neste clipe
      const arr = tracksQ[bi];
      let moves = false;
      for (let k = 4; k < arr.length; k++) if (Math.abs(arr[k] - arr[k % 4]) > 1e-4) { moves = true; break; }
      if (moves) tracks.push(new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, arr));
    });
    tracks.push(new THREE.VectorKeyframeTrack('root.position', times, rootPos));
    out.push(new THREE.AnimationClip(key, a.dur, tracks));
  }
  return out;
}
