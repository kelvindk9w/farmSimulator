// Gerador dos pacotes PROVISÓRIOS de arte (roda dentro do Chromium, via tools/gerar-assets.mjs).
// Parte do avatar construído por código em tools/visual-refs e produz exatamente o formato do contrato:
//   3d/personagem.glb (+ cabelo-b, cabelo-c, barba)  e  2d/sprites/*.png + sprites.json + variante-b/walk.png
// As folhas de sprites são renders do próprio GLB, com a câmera do jogo.
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { setPalette, C } from '../../../../tools/visual-refs/src/lib/palette.js';
import { Builder, resetMat } from '../../../../tools/visual-refs/src/lib/builder.js';
import { criarAvatar, BONES, BONE_INDEX } from '../../../../tools/visual-refs/src/avatar/rig.js';
import { POSES, lerpPose, aplicarPose } from '../../../../tools/visual-refs/src/avatar/poses.js';
import { Character3D } from '../../threejs/src/character3d.js';
import { addBenchLights } from '../../threejs/src/lights.js';
import { Iso } from '../../threejs/src/iso.js';

const ease = (t) => t * t * (3 - 2 * t);
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

// respiração um pouco mais marcada que a do avatar original, para aparecer em 4 quadros
function parado(t) {
  const p = POSES.parado(0);
  const br = Math.sin(t * Math.PI * 2);
  p.spine = [0.6 + br * 1.0, 0, 0];
  p.chest = [1 + br * 2.4, 0, 0];
  p.head = [-1.6 - br * 2.2, 0, 0];
  p.upperArmL = [0, 0, 7 + br * 2.2]; p.upperArmR = [0, 0, -7 - br * 2.2];
  p.lowerArmL = [-10 - br * 2, 0, 0]; p.lowerArmR = [-10 - br * 2, 0, 0];
  return p;
}

// pulo do avatar original, mais baixo: no contrato 2D só há 232 px acima do ponto do chão
function pular(t) {
  const p = POSES.pular(t);
  p.lift = (p.lift || 0) * 0.62;
  return p;
}

// corrida do avatar original com a passada 15% mais curta: o pé de trás saía 2 px da célula nas direções de costas
function correr(t) {
  const p = POSES.correr(t);
  for (const k of ['upperLegL', 'upperLegR']) p[k][0] = -14 + (p[k][0] + 14) * 0.85;
  return p;
}

// Os sete clipes do contrato. dur em segundos; fn recebe t em 0..1.
// amostras = fases usadas nos quadros 2D quando não são uniformes.
// plantar(t) = 0..1: quanto os pés ficam presos ao ponto do chão (o quadril é que recua ao agachar/sentar).
export const ANIMS = {
  idle: { dur: 2.0, loop: true, fn: (t) => parado(t) },
  walk: { dur: 0.8, loop: true, fn: (t) => POSES.andar(t) },
  run: { dur: 8 / 15, loop: true, fn: (t) => correr(t) },
  // preparar, impulso, subindo, ponto mais alto, descendo, aterrissar
  jump: { dur: 0.75, loop: false, fn: (t) => pular(t), amostras: [0.18, 0.36, 0.46, 0.56, 0.74, 0.88], plantar: () => 1 },
  crouch: { dur: 0.4, loop: false, fn: (t) => lerpPose(parado(0), POSES.agachado(), ease(t)), plantar: () => 1 },
  sit: { dur: 0.5, loop: false, fn: (t) => lerpPose(parado(0), POSES.sentadoChao(), ease(t)), plantar: () => 1 },
  // senta (pés no lugar) e depois deita; deitado, o corpo fica centrado no ponto do chão
  lie: { dur: 1.0, loop: false, fn: (t) => keys(t, [[0, parado(0)], [0.45, POSES.sentadoChao()], [1, POSES.deitado()]]), plantar: (t) => (t <= 0.45 ? 1 : 1 - ease((t - 0.45) / 0.55)) },
};
// animações em que o desenho 2D não cabe na célula em todas as direções sem sair do ponto do chão
const PODE_DESLOCAR = ['sit', 'lie'];

const HAIR = () => new THREE.Color('#3b281c'); // castanho-escuro
const novoMaterial = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });

// ---------- peças da cabeça (coordenadas locais do osso da cabeça; o rosto olha para +Z) ----------
const R = 0.235, CY = 0.2, HR = R * 1.065;
const S = { smooth: true };
function touca(b, cor, thetaLen) {
  b.add(new THREE.SphereGeometry(HR, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.36), cor, { p: [0, CY + 0.012, -0.004], s: [1, 0.97, 1], ...S });
  b.add(new THREE.SphereGeometry(HR, 10, 5, Math.PI * 0.95, Math.PI * 1.1, Math.PI * 0.33, Math.PI * thetaLen), cor, { p: [0, CY + 0.012, -0.004], s: [1, 0.97, 1], ...S });
}
const PECAS = {
  // A: curto e cacheado (o cabelo que vai dentro do personagem.glb)
  cabelo(b) {
    const cor = HAIR();
    touca(b, cor, 0.3);
    const bola = (theta, phi, r) => {
      const t = (theta * Math.PI) / 180, p = (phi * Math.PI) / 180; // phi 0 = frente (+Z)
      const d = HR * 0.9;
      b.sph(r, 6, 4, cor, { p: [Math.sin(t) * Math.sin(p) * d, CY + 0.012 + Math.cos(t) * d * 0.97, Math.sin(t) * Math.cos(p) * d - 0.004], ...S });
    };
    bola(0, 0, 0.06);
    for (let i = 0; i < 6; i++) bola(30, i * 60 + 30, 0.058);
    for (let i = 0; i < 8; i++) bola(60, 62 + i * 33.7, 0.056);
    for (const ph of [-26, 26]) bola(50, ph, 0.054);
    for (let i = 0; i < 5; i++) bola(90, 118 + i * 31, 0.05);
  },
  // B: black power
  'cabelo-b'(b) {
    const cor = HAIR();
    b.sph(0.3, 12, 8, cor, { p: [0, CY + 0.1, -0.06], s: [1.06, 1, 0.86], ...S });
    const pts = [[0, 0.3, -0.06, 0.17], [0.2, 0.22, -0.04, 0.16], [-0.2, 0.22, -0.04, 0.16], [0.27, 0.06, -0.1, 0.15], [-0.27, 0.06, -0.1, 0.15],
      [0, 0.16, -0.26, 0.19], [0.11, 0.27, 0.1, 0.12], [-0.11, 0.27, 0.1, 0.12], [0, -0.04, -0.24, 0.15], [0.17, -0.06, -0.17, 0.12], [-0.17, -0.06, -0.17, 0.12]];
    for (const [x, y, z, r] of pts) b.sph(r, 7, 5, cor, { p: [x, CY + y, z], ...S });
  },
  // C: comprido, preso atrás
  'cabelo-c'(b) {
    const cor = HAIR();
    touca(b, cor, 0.37);
    for (const sx of [-1, 1]) b.sph(0.09, 7, 5, cor, { p: [sx * 0.075, CY + 0.165, 0.145], s: [1.25, 0.5, 0.8], ...S });
    b.sph(0.07, 7, 5, new THREE.Color('#e24a3d'), { p: [0, CY + 0.05, -0.255], s: [1, 1, 0.7], ...S }); // elástico
    b.sph(0.085, 7, 5, cor, { p: [0, CY + 0.0, -0.3], ...S });
    b.cone(0.095, 0.5, 7, cor, { p: [0, CY + 0.03, -0.31], r: [180 + 16, 0, 0], ...S });
  },
  // barba cheia
  barba(b) {
    const cor = HAIR();
    b.add(new THREE.SphereGeometry(R * 1.045, 12, 5, -Math.PI * 0.1, Math.PI * 1.2, Math.PI * 0.56, Math.PI * 0.36), cor, { p: [0, CY, 0], s: [1, 0.97, 0.98], ...S });
    b.sph(0.1, 8, 5, cor, { p: [0, CY - 0.19, 0.125], s: [1.35, 0.85, 0.95], ...S });
    for (const sx of [-1, 1]) {
      b.sph(0.07, 6, 4, cor, { p: [sx * 0.15, CY - 0.13, 0.12], s: [1, 1.1, 0.9], ...S });
      b.box(0.085, 0.034, 0.024, cor, { p: [sx * 0.045, CY - 0.078, 0.222], r: [0, sx * 14, sx * -14] });
    }
    b.box(0.06, 0.014, 0.012, new THREE.Color('#a8433f'), { p: [0, CY - 0.112, 0.238] }); // boca por cima da barba
  },
};

function malhaDaPeca(nome) {
  const b = new Builder(5);
  PECAS[nome](b);
  const g = mergeVertices(b.build(), 1e-5);
  const m = new THREE.Mesh(g, novoMaterial());
  m.name = nome;
  return m;
}

// ---------- avatar ----------
function visual({ camiseta }) {
  C.testeCabelo = HAIR();
  C.testeCamiseta = new THREE.Color(camiseta);
  C.testeBota = new THREE.Color('#7a4f2e');
  return {
    nome: 'Personagem de teste', skin: 'skin3', hair: { style: 'careca', color: 'testeCabelo' }, hat: null,
    top: { color: 'testeCamiseta', sleeves: 'curta', bib: 'denim' }, bottom: { color: 'denim' }, shoes: { type: 'bota', color: 'testeBota' },
    extras: [], tag: '#d9a521',
  };
}

const _f = new THREE.Vector3();
function posar(av, a, t) {
  const pose = a.fn(a.loop ? t % 1 : t);
  aplicarPose(av, pose);
  const w = a.plantar ? a.plantar(t) : 0;
  if (w > 0) {
    // centro dos pés em relação à raiz -> a raiz recua esse tanto
    let fx = 0, fz = 0;
    for (const n of ['footL', 'footR']) { _f.setFromMatrixPosition(av.bones[BONE_INDEX[n]].matrixWorld); fx += _f.x / 2; fz += _f.z / 2; }
    av.root.position.x -= w * (fx - av.root.position.x);
    av.root.position.z -= w * (fz - av.root.position.z);
    av.group.updateMatrixWorld(true);
  }
}

function gerarClipes(av, fps = 30) {
  const out = [];
  for (const [nome, a] of Object.entries(ANIMS)) {
    const n = Math.max(2, Math.round(a.dur * fps) + 1);
    const times = [], pos = [];
    const quats = BONES.map(() => []);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      times.push(t * a.dur);
      posar(av, a, t);
      BONES.forEach((_, bi) => { const q = av.bones[bi].quaternion; quats[bi].push(q.x, q.y, q.z, q.w); });
      pos.push(av.root.position.x, av.root.position.y, av.root.position.z);
    }
    // todas as trilhas em todos os clipes: nenhum osso fica com valor "herdado" do clipe anterior
    const tracks = BONES.map(([bone], bi) => new THREE.QuaternionKeyframeTrack(`${bone}.quaternion`, times, quats[bi]));
    tracks.push(new THREE.VectorKeyframeTrack('root.position', times, pos));
    out.push(new THREE.AnimationClip(nome, a.dur, tracks));
  }
  return out;
}

const exportar = (obj, animations = []) => new GLTFExporter().parseAsync(obj, { binary: true, animations, onlyVisible: false });

const ALTURA = 1.6; // altura total do contrato, já com o cabelo A
let ESCALA = 1; // definida ao montar o personagem principal

async function personagemGLB({ camiseta = '#dba62a' } = {}) {
  setPalette('base'); resetMat();
  const av = criarAvatar(visual({ camiseta }), { material: novoMaterial() });
  av.mesh.geometry = mergeVertices(av.mesh.geometry, 1e-5);
  av.group.name = 'personagem';
  av.mesh.name = 'corpo';
  const cabelo = malhaDaPeca('cabelo');
  av.bones[BONE_INDEX.head].add(cabelo); // malha separada, presa ao osso da cabeça
  const clipes = gerarClipes(av);
  // volta à pose de ligação (braços ao longo do corpo, pés na origem)
  for (const b of av.bones) b.rotation.set(0, 0, 0);
  av.root.position.set(0, 0, 0);
  av.group.updateMatrixWorld(true);
  // escala tudo de uma vez para o personagem (com o cabelo A) ter exatamente a altura do contrato
  const caixa3 = new THREE.Box3().setFromObject(av.mesh).union(new THREE.Box3().setFromObject(cabelo));
  ESCALA = ALTURA / (caixa3.max.y - caixa3.min.y);
  av.mesh.geometry.scale(ESCALA, ESCALA, ESCALA);
  cabelo.geometry.scale(ESCALA, ESCALA, ESCALA);
  for (const b of av.bones) b.position.multiplyScalar(ESCALA);
  av.group.updateMatrixWorld(true);
  av.skeleton.calculateInverses();
  for (const c of clipes) for (const tr of c.tracks) if (tr.name.endsWith('.position')) for (let i = 0; i < tr.values.length; i++) tr.values[i] *= ESCALA;
  av.mesh.geometry.computeBoundingBox(); av.mesh.geometry.computeBoundingSphere();
  const tri = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;
  const info = {
    triangulosCorpo: tri(av.mesh.geometry), triangulosCabelo: tri(cabelo.geometry), ossos: BONES.length, escala: +ESCALA.toFixed(4),
    clipes: clipes.map((c) => ({ nome: c.name, duracao: +c.duration.toFixed(4), chaves: c.tracks[0].times.length })),
  };
  return { buffer: await exportar(av.group, clipes), info };
}

async function pecaGLB(nome) {
  // peça avulsa no espaço do modelo: fica na altura da cabeça do personagem em pé (pose de ligação)
  const m = malhaDaPeca(nome);
  let y = 0;
  for (let b = 'head'; b; b = BONES[BONE_INDEX[b]][1]) y += BONES[BONE_INDEX[b]][2][1];
  m.geometry.translate(0, y, 0);
  m.geometry.scale(ESCALA, ESCALA, ESCALA);
  const g = new THREE.Group(); g.name = nome; g.add(m);
  const tri = (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
  return { buffer: await exportar(g), info: { triangulos: tri } };
}

// ---------- folhas de sprites ----------
const STAGE = 512; // área de render (px lógicos), maior que a célula para medir o que sairia dela
function criarEstudio(cfg, ss) {
  const sp = cfg.sprites;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(STAGE * ss, STAGE * ss, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  addBenchLights(scene, cfg.light);
  const iso = new Iso(cfg.camera);
  const view = STAGE / sp.pixelsPerUnit;
  const cam = new THREE.OrthographicCamera(-view / 2, view / 2, view / 2, -view / 2, 0.1, 100);
  const d = new THREE.Vector3(...iso.camDir());
  cam.position.copy(d).multiplyScalar(30);
  cam.lookAt(0, 0, 0);
  // ponto do chão (origem) cai em (STAGE/2, ancY) do palco: desloca a câmera no próprio plano
  const ancY = STAGE / 2 + (sp.anchor[1] - sp.cell[1] / 2);
  const ancX = STAGE / 2 + (sp.anchor[0] - sp.cell[0] / 2);
  cam.updateMatrixWorld(true);
  const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1), right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
  cam.position.addScaledVector(up, (ancY - STAGE / 2) / sp.pixelsPerUnit).addScaledVector(right, -(ancX - STAGE / 2) / sp.pixelsPerUnit);
  cam.updateMatrixWorld(true);
  const holder = new THREE.Group();
  scene.add(holder);
  const stage = document.createElement('canvas'); stage.width = STAGE; stage.height = STAGE;
  const sctx = stage.getContext('2d', { willReadFrequently: true });
  sctx.imageSmoothingEnabled = true; sctx.imageSmoothingQuality = 'high';
  return { renderer, scene, cam, holder, stage, sctx, iso, ancX, ancY };
}

function caixa(ctx) {
  const d = ctx.getImageData(0, 0, STAGE, STAGE).data;
  let x0 = STAGE, x1 = -1, y0 = STAGE, y1 = -1;
  for (let y = 0; y < STAGE; y++) for (let x = 0; x < STAGE; x++) if (d[(y * STAGE + x) * 4 + 3] > 6) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, x1, y0, y1 };
}

// Renderiza as folhas de um personagem já carregado. Devolve { nome: { png(base64), w, h, quadros, relatorio } }.
function folhas(est, ch, cfg, nomes) {
  const sp = cfg.sprites;
  const [cw, chh] = sp.cell;
  const margem = 1;
  const out = {};
  est.holder.clear();
  est.holder.add(ch.root);
  // canto da célula dentro do palco (âncora da célula sobre a âncora do palco)
  const cx = est.ancX - sp.anchor[0], cy = est.ancY - sp.anchor[1];
  for (const nome of nomes) {
    const a = ANIMS[nome];
    const frames = sp.defaults[nome].frames;
    const action = ch.actions[nome];
    ch.mixer.stopAllAction();
    action.setLoop(THREE.LoopRepeat, Infinity); action.clampWhenFinished = false;
    action.reset(); action.play();
    const sheet = document.createElement('canvas'); sheet.width = cw * frames; sheet.height = chh * sp.directions.length;
    const ctx = sheet.getContext('2d');
    const relatorio = [];
    sp.directions.forEach((dir, row) => {
      const k = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].indexOf(dir);
      est.holder.rotation.y = (est.iso.dirYawDeg(k) * Math.PI) / 180;
      let sx = 0, sy = 0; // deslocamento acumulado (só cresce, para o desenho não tremer)
      for (let i = 0; i < frames; i++) {
        const fase = a.amostras ? a.amostras[i] : a.loop ? i / frames : i / (frames - 1);
        action.time = Math.min(fase * a.dur, a.dur - 1e-5);
        ch.mixer.update(0);
        est.renderer.render(est.scene, est.cam);
        est.sctx.clearRect(0, 0, STAGE, STAGE);
        est.sctx.drawImage(est.renderer.domElement, 0, 0, STAGE, STAGE);
        const b = caixa(est.sctx);
        // quanto falta para caber na célula (0 = cabe)
        let nx = 0, ny = 0;
        if (b.x1 - cx > cw - 1 - margem) nx = (cw - 1 - margem) - (b.x1 - cx);
        if (b.x0 - cx + nx < margem) nx = margem - (b.x0 - cx);
        if (b.y1 - cy > chh - 1 - margem) ny = (chh - 1 - margem) - (b.y1 - cy);
        if (b.y0 - cy + ny < margem) ny = margem - (b.y0 - cy);
        let ox = 0, oy = 0;
        if (PODE_DESLOCAR.includes(nome)) {
          if (Math.abs(nx) > Math.abs(sx)) sx = nx;
          if (Math.abs(ny) > Math.abs(sy)) sy = ny;
          ox = sx; oy = sy;
        }
        ctx.drawImage(est.stage, cx - ox, cy - oy, cw, chh, i * cw, row * chh, cw, chh);
        relatorio.push({ dir, quadro: i, altura: b.y1 - b.y0 + 1, largura: b.x1 - b.x0 + 1, deslocX: ox, deslocY: oy, estouroX: ox ? 0 : nx, estouroY: oy ? 0 : ny });
      }
    });
    out[nome] = { png: sheet.toDataURL('image/png').split(',')[1], w: sheet.width, h: sheet.height, quadros: frames, relatorio };
  }
  return out;
}

function b64(buf) {
  const u = new Uint8Array(buf); let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}

// Ponto de entrada chamado pelo script Node. cfg = config/bench.json.
export async function gerar(cfg, { ss = 4 } = {}) {
  const res = { glb: {}, sprites: {}, variante: {}, info: {} };
  // --- 3D ---
  const principal = await personagemGLB();
  res.glb['personagem.glb'] = b64(principal.buffer);
  res.info.personagem = principal.info;
  const pecas = {};
  for (const nome of ['cabelo-b', 'cabelo-c', 'barba']) {
    const p = await pecaGLB(nome);
    pecas[nome + '.glb'] = p.buffer;
    res.glb[nome + '.glb'] = b64(p.buffer);
    res.info[nome] = p.info;
  }
  // as peças avulsas são lidas de URLs de blob pelo mesmo código que a demo usa
  const urls = {};
  for (const [f, buf] of Object.entries(pecas)) urls[f] = URL.createObjectURL(new Blob([buf], { type: 'model/gltf-binary' }));
  const modelCfg = { ...cfg.model, hairs: { B: urls['cabelo-b.glb'], C: urls['cabelo-c.glb'] }, beard: urls['barba.glb'] };

  // --- 2D: folhas renderizadas a partir do GLB ---
  const est = criarEstudio(cfg, ss);
  const ch = await Character3D.load('', modelCfg, cfg.animations, { buffer: principal.buffer.slice(0) });
  res.info.carregado = ch.info();
  res.sprites = folhas(est, ch, cfg, Object.keys(ANIMS));

  // --- variante B: black power + barba + camiseta vermelha, só o andar ---
  const varB = await personagemGLB({ camiseta: '#d8402f' });
  const chB = await Character3D.load('', modelCfg, cfg.animations, { buffer: varB.buffer });
  await chB.setLook('B', true);
  res.variante = folhas(est, chB, cfg, ['walk']);
  res.info.animacoes = Object.fromEntries(Object.entries(ANIMS).map(([k, a]) => [k, { duracao: a.dur, repete: a.loop }]));
  return res;
}

window.GERADOR = { gerar };
