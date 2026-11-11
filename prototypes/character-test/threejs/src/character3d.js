// Personagem 3D: carrega o GLB do contrato, acha os clipes PELO NOME, toca com transição suave
// e troca cabelo/barba. Não depende de nomes de ossos, só do osso da cabeça (configurável ou detectado).
import { AnimationMixer, Box3, Group, LoopOnce, LoopRepeat, Matrix4, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
// Hospedagens que não servem arquivos .glb: o build "--embutido" entrega os GLB dentro de um .js (endereço -> base64)
const embutidos = globalThis.__benchEmbutidos || null;
const deBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
export function loadGLB(src) {
  if (typeof src === 'string' && embutidos && embutidos[src]) return loader.parseAsync(deBase64(embutidos[src]), '');
  return typeof src === 'string' ? loader.loadAsync(src) : loader.parseAsync(src, '');
}

// minúsculas, sem acentos
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// "Armature|walk" -> "walk"
export const clipKey = (name) => norm(String(name).split('|').pop().trim());

export function findClip(clips, name) {
  const k = norm(name);
  return clips.find((c) => c.name === name)
    || clips.find((c) => clipKey(c.name) === k)
    || clips.find((c) => new RegExp(`(^|[^a-z])${k}$`).test(clipKey(c.name)))
    || null;
}

export function findHeadBone(root, wanted = 'auto') {
  const bones = [];
  root.traverse((o) => { if (o.isBone) bones.push(o); });
  if (wanted && wanted !== 'auto') {
    const w = norm(wanted).replace(/[\s.:/[\]]/g, '');
    const hit = bones.find((b) => b.name === wanted) || bones.find((b) => norm(b.name).replace(/[\s.:/[\]_]/g, '') === w.replace(/_/g, ''));
    if (hit) return hit;
    console.warn(`[bancada] osso da cabeça "${wanted}" não encontrado; tentando detectar`);
  }
  const cands = bones.filter((b) => /head|cabeca/.test(norm(b.name)));
  const exact = cands.find((b) => ['head', 'cabeca'].includes(norm(b.name)));
  if (exact) return exact;
  const semPontas = cands.filter((b) => !/(end|top|tip|nub)/.test(norm(b.name)));
  const lista = (semPontas.length ? semPontas : cands).sort((a, b) => a.name.length - b.name.length);
  if (lista.length) return lista[0];
  // último recurso: o osso mais alto
  let best = null, bestY = -Infinity;
  const v = new Vector3();
  for (const b of bones) { b.getWorldPosition(v); if (v.y > bestY) { bestY = v.y; best = b; } }
  if (best) console.warn(`[bancada] nenhum osso com "head" no nome; usando o mais alto: ${best.name}`);
  return best;
}

function findMeshes(root, wanted, re) {
  const out = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    const names = [norm(o.name), norm(o.parent && !o.parent.isBone ? o.parent.name : '')];
    const ok = wanted && wanted !== 'auto' ? names.includes(norm(wanted)) : names.some((n) => re.test(n));
    if (ok) out.push(o);
  });
  return out;
}

function countTriangles(root) {
  let n = 0;
  root.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const g = o.geometry;
    n += (g.index ? g.index.count : g.attributes.position.count) / 3;
  });
  return n;
}

export class Character3D {
  // base: URL da pasta 3d/ (com barra no fim). buffer: ArrayBuffer opcional do GLB (usado pelo gerador).
  static async load(base, modelCfg, animCfg, { buffer = null } = {}) {
    const gltf = await loadGLB(buffer || base + modelCfg.file);
    return new Character3D(gltf, base, modelCfg, animCfg);
  }

  constructor(gltf, base, modelCfg, animCfg) {
    this.base = base;
    this.cfg = modelCfg;
    this.root = gltf.scene;
    this.clips = gltf.animations;
    this.root.traverse((o) => { if (o.isSkinnedMesh) o.frustumCulled = false; });
    this.root.updateMatrixWorld(true);

    // clipes pelo nome
    this.mixer = new AnimationMixer(this.root);
    this.actions = {}; this.durations = {}; this.missing = [];
    for (const [name, a] of Object.entries(animCfg)) {
      const clip = findClip(this.clips, name);
      if (!clip) { this.missing.push(name); continue; }
      const action = this.mixer.clipAction(clip);
      if (a.loop) action.setLoop(LoopRepeat, Infinity);
      else { action.setLoop(LoopOnce, 1); action.clampWhenFinished = true; }
      this.actions[name] = action;
      this.durations[name] = clip.duration;
    }
    if (this.missing.length) console.warn('[bancada] clipes não encontrados no GLB:', this.missing.join(', '), '| existentes:', this.clips.map((c) => c.name).join(', '));
    this.current = null;

    // cabeça, cabelo e barba
    this.headBone = findHeadBone(this.root, modelCfg.headBone);
    this.beardBuiltin = findMeshes(this.root, modelCfg.beardMesh, /beard|barba/);
    this.hairBuiltin = findMeshes(this.root, modelCfg.hairMesh, /hair|cabelo/).filter((m) => !this.beardBuiltin.includes(m));
    if (!this.hairBuiltin.length && this.headBone && modelCfg.hairMesh === 'auto') {
      // sem nome reconhecível: malhas sem skinning penduradas no osso da cabeça
      this.headBone.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && !this.beardBuiltin.includes(o)) this.hairBuiltin.push(o); });
    }
    // matriz que leva do espaço do modelo (pose de ligação) para o espaço local do osso da cabeça
    this.headInverseBind = new Matrix4();
    let found = false;
    this.root.traverse((o) => {
      if (found || !o.isSkinnedMesh || !this.headBone) return;
      const i = o.skeleton.bones.indexOf(this.headBone);
      if (i >= 0) { this.headInverseBind.multiplyMatrices(o.skeleton.boneInverses[i], o.bindMatrix); found = true; }
    });
    if (!found && this.headBone) this.headInverseBind.copy(this.headBone.matrixWorld).invert().multiply(this.root.matrixWorld);
    this.pieces = {}; // arquivo -> Group preso à cabeça
    this.look = { hair: 'A', beard: false };

    const box = new Box3().setFromObject(this.root);
    this.height = box.max.y - box.min.y;
    if (Math.abs(this.height - 1.6) > 0.16) console.warn(`[bancada] altura do modelo = ${this.height.toFixed(2)} (o contrato pede 1,6)`);
  }

  // Troca de animação com transição (fade em segundos). startTime permite manter a fase entre andar e correr.
  play(name, fade = 0.2, startTime = 0) {
    const next = this.actions[name];
    if (!next) return false;
    const prev = this.current;
    if (!(fade > 0)) this.mixer.stopAllAction(); // corte seco (reinício): nada fica misturando
    next.reset();
    next.time = startTime;
    next.play();
    if (prev && prev !== next && fade > 0) next.crossFadeFrom(prev, fade, false);
    this.current = next;
    return true;
  }
  update(dt) { this.mixer.update(dt); }

  async _piece(file) {
    if (this.pieces[file]) return this.pieces[file];
    if (!this.headBone) throw new Error('sem osso da cabeça para prender a peça');
    const gltf = await loadGLB(this.base + file);
    const piece = gltf.scene;
    piece.updateMatrixWorld(true);
    let space = this.cfg.pieceSpace || 'auto';
    if (space === 'auto') {
      // peça exportada na altura da cabeça do modelo em pé ("model") ou já relativa ao osso ("bone")?
      const c = new Box3().setFromObject(piece).getCenter(new Vector3());
      const headPos = new Vector3().setFromMatrixPosition(new Matrix4().copy(this.headInverseBind).invert());
      space = c.distanceTo(headPos) < c.length() ? 'model' : 'bone';
    }
    const holder = new Group();
    holder.name = 'peca:' + file;
    if (space === 'model') holder.applyMatrix4(this.headInverseBind);
    holder.add(piece);
    holder.visible = false;
    this.headBone.add(holder);
    this.pieces[file] = holder;
    return holder;
  }

  // hair: 'A' (o cabelo que vem no GLB), 'B' ou 'C' (arquivos avulsos); beard: liga/desliga a barba
  async setLook(hair = 'A', beard = false) {
    const hairFile = hair === 'A' ? null : this.cfg.hairs[hair];
    const hairPiece = hairFile ? await this._piece(hairFile) : null;
    const beardPiece = beard && !this.beardBuiltin.length ? await this._piece(this.cfg.beard) : null;
    for (const m of this.hairBuiltin) m.visible = hair === 'A';
    for (const m of this.beardBuiltin) m.visible = beard;
    for (const [file, g] of Object.entries(this.pieces)) g.visible = g === hairPiece || g === beardPiece;
    this.look = { hair, beard };
  }

  info() {
    let bones = 0;
    this.root.traverse((o) => { if (o.isBone) bones++; });
    return {
      triangles: countTriangles(this.root), bones, height: +this.height.toFixed(3),
      clips: this.clips.map((c) => c.name), missing: this.missing,
      headBone: this.headBone ? this.headBone.name : null,
      hairMeshes: this.hairBuiltin.map((m) => m.name), beardMeshes: this.beardBuiltin.map((m) => m.name),
    };
  }
}
