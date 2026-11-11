// Opção C: cena isométrica 2D montada SÓ com sprites pré-renderizados.
// 1) cada tipo de objeto da planta é renderizado uma vez (objeto + sombra) num canvas com transparência;
// 2) a cena é composta num canvas 2D: ladrilhos de chão -> caminhos/canteiros/lagoa -> sombras -> objetos em ordem de profundidade.
import * as THREE from 'three';
import { setPalette, C } from '../lib/palette.js';
import { Builder, MAT, resetMat } from '../lib/builder.js';
import { getRenderer, LUZ, sunDir, addLights, isoCamera, renderToCanvas } from '../lib/stage.js';
import { gerarLayout, mascara, AVATARES } from '../farm/layout.js';
import { KINDS, chave } from '../farm/kinds.js';
import { corGramaN, ruidoGrama, bordaGrama, ESCALA_AVATAR, montarFazenda } from '../farm/scene3d.js';
import { Estudio } from '../avatar/estudio.js';
import { ANIMS } from '../avatar/poses.js';
import { OUTFITS } from '../avatar/rig.js';
import { espelhar } from './folhas.js';
import { montarHUD, etiquetas } from '../hud/hud.js';
import { ELEV } from './cenas.js';

const DEG = Math.PI / 180;
const e = ELEV * DEG;
const RIGHT = new THREE.Vector3(1, 0, -1).normalize();
const UP = new THREE.Vector3(-Math.sin(e) / Math.SQRT2, Math.cos(e), -Math.sin(e) / Math.SQRT2);
const DIR = new THREE.Vector3(Math.cos(e) / Math.SQRT2, Math.sin(e), Math.cos(e) / Math.SQRT2);
const proj = (x, y, z) => [x * RIGHT.x + z * RIGHT.z, x * UP.x + y * UP.y + z * UP.z];

// ---- fábrica de sprites ----
class Fabrica {
  constructor(S, luz = 'dia') {
    this.S = S; // pixels por unidade de mundo
    this.preset = LUZ[luz];
    this.scene = new THREE.Scene();
    this.hemi = new THREE.HemisphereLight(this.preset.hemi.sky, this.preset.hemi.ground, this.preset.hemi.intensity);
    this.sun = new THREE.DirectionalLight(this.preset.sun.color, this.preset.sun.intensity);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.03; this.sun.shadow.radius = this.preset.shadowRadius;
    this.scene.add(this.hemi, this.sun, this.sun.target);
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 1, color: 0x000000 }));
    this.floor.receiveShadow = true;
    this.ghost = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
    this.cache = new Map();
    this.renders = 0;
  }
  // desenha `mesh` (na origem). modo: 'obj' | 'sombra' | 'chao'
  _render(mesh, modo) {
    const S = this.S;
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    const sd = sunDir(this.preset);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const acc = (x, y, z) => { const [px, py] = proj(x, y, z); minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); };
    for (let i = 0; i < 8; i++) {
      const x = i & 1 ? bb.max.x : bb.min.x, y = i & 2 ? bb.max.y : bb.min.y, z = i & 4 ? bb.max.z : bb.min.z;
      if (modo !== 'sombra') acc(x, y, z);
      else { const t = Math.max(0, y) / sd.y; acc(x - sd.x * t, 0, z - sd.z * t); }
    }
    const pad = 4;
    const w = Math.ceil((maxX - minX) * S) + pad * 2, h = Math.ceil((maxY - minY) * S) + pad * 2;
    const left = minX - pad / S, top = maxY + pad / S;
    const cx = left + w / S / 2, cy = top - h / S / 2;
    const cam = new THREE.OrthographicCamera(-w / S / 2, w / S / 2, h / S / 2, -h / S / 2, 0.1, 600);
    const target = new THREE.Vector3().addScaledVector(RIGHT, cx).addScaledVector(UP, cy);
    cam.position.copy(target).addScaledVector(DIR, 250);
    cam.lookAt(target); cam.updateMatrixWorld(true);
    // luz/sombra ajustadas ao objeto
    const sph = new THREE.Sphere(); bb.getBoundingSphere(sph);
    const rad = sph.radius + 1;
    this.sun.position.copy(sph.center).addScaledVector(sd, rad * 3);
    this.sun.target.position.copy(sph.center);
    const sc = this.sun.shadow.camera;
    sc.left = -rad; sc.right = rad; sc.top = rad; sc.bottom = -rad; sc.near = 0.1; sc.far = rad * 6.5; sc.updateProjectionMatrix();
    const old = mesh.material;
    mesh.castShadow = modo !== 'chao'; mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (modo === 'sombra') { mesh.material = this.ghost; this.scene.add(this.floor); }
    const r = getRenderer();
    const ss = 2;
    r.setPixelRatio(1); r.setSize(w * ss, h * ss, false); r.setClearColor(0x000000, 0);
    r.render(this.scene, cam);
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const ctx = out.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(r.domElement, 0, 0, w, h);
    this.scene.remove(mesh); this.scene.remove(this.floor);
    mesh.material = old;
    this.renders++;
    return { img: out, ax: -left * S, ay: top * S, w, h };
  }
  // sprite de uma entidade (com cache por chave). Devolve { obj, sombra? }
  sprite(key, drawFn, { sombra = true, chao = false } = {}) {
    if (this.cache.has(key)) return this.cache.get(key);
    const b = new Builder(3);
    drawFn(b);
    const mesh = new THREE.Mesh(b.build(), MAT());
    const sp = { key, tris: b.triangles };
    sp.obj = this._render(mesh, chao ? 'chao' : 'obj');
    if (sombra && !chao) sp.sombra = this._render(mesh, 'sombra');
    mesh.geometry.dispose();
    this.cache.set(key, sp);
    return sp;
  }
}

const quant = (v, step) => Math.round(v / step) * step;
const ARVORES = new Set(['laranjeira', 'bananeira', 'cajueiro', 'arvore', 'arbusto', 'pedra', 'planta', 'tufo', 'flor']);

// Normaliza uma entidade para o que um jogo 2D conseguiria ter: poucas rotações e escalas por tipo.
function normalizar(en) {
  const k = KINDS[en.k];
  let r = en.r || 0, s = en.s || 1;
  if (k.cat === 'inst') {
    if (ARVORES.has(en.k)) { r = 0; s = en.k === 'arvore' ? (s > 1.2 ? 1.3 : 1.0) : 1; }
    else if (k.animal) { r = ((quant(r, 45) % 360) + 360) % 360; s = quant(s, 0.05); }
    else { r = ((quant(r, 90) % 360) + 360) % 360; s = 1; }
  }
  return { r, s };
}

export function comporCena2D({ W, H, k, viewW, target, hudMode = 'A' }) {
  const Wc = Math.round(W * k), Hc = Math.round(H * k);
  const S = Wc / viewW;
  const layout = gerarLayout();
  const fab = new Fabrica(S, 'dia');
  const [tx, ty] = proj(target[0], 0, target[2]);
  const toPx = (x, y, z) => { const [px, py] = proj(x, y, z); return [Wc / 2 + (px - tx) * S, Hc / 2 - (py - ty) * S]; };
  const main = document.createElement('canvas'); main.width = Wc; main.height = Hc;
  const ctx = main.getContext('2d');
  ctx.fillStyle = '#' + C.grassOuter.getHexString(); ctx.fillRect(0, 0, Wc, Hc);
  const blit = (c2, sp, x, y, z) => { const [px, py] = toPx(x, y, z); c2.drawImage(sp.img, Math.round(px - sp.ax), Math.round(py - sp.ay)); };
  const usados = new Map(); // chave -> { sp, n }
  const usar = (sp) => { const u = usados.get(sp.key) || { sp, n: 0 }; u.n++; usados.set(sp.key, u); };

  // 1) ladrilhos de grama 2x2 (cor quantizada em poucos tons)
  const T = 2;
  for (let x = -64; x < 64; x += T) for (let z = -64; z < 64; z += T) {
    const [px, py] = toPx(x + T / 2, 0, z + T / 2);
    if (px < -S * 3 || px > Wc + S * 3 || py < -S * 2 || py > Hc + S * 2) continue;
    const cxw = x + T / 2, czw = z + T / 2;
    const edge = bordaGrama(cxw, czw);
    const n = quant(ruidoGrama(cxw, czw), 1 / 7), eq = edge < 0 ? -1 : quant(edge, 0.34);
    const key = `grama:${n.toFixed(2)}:${eq}`;
    const sp = fab.sprite(key, (b) => {
      const c = corGramaN(n, eq), c2 = c.clone().multiplyScalar(0.985);
      const m = T / 2 + 0.03;
      b.slab([[-m, -m], [m, -m], [m, m]], 0.001, c, {}); b.slab([[-m, -m], [m, m], [-m, m]], 0.001, c2, {});
    }, { chao: true });
    blit(ctx, sp.obj, cxw, 0, czw); usar(sp);
  }
  // 2) caminhos, canteiros, lagoa
  for (const key of layout.paths) {
    const [x, z] = key.split(',').map(Number);
    const mask = mascara(layout.paths, x, z);
    const variante = (x * 7 + z * 13) & 1;
    const sp = fab.sprite(`caminho:${mask}:${variante}`, (b) => KINDS.caminho.draw(b, { mask, seed: variante ? 37 : 5 }), { chao: true });
    blit(ctx, sp.obj, x + 0.5, 0, z + 0.5); usar(sp);
  }
  const objetos = [];
  for (const en of layout.E) {
    const kd = KINDS[en.k];
    if (kd.cat === 'chao') {
      const sp = fab.sprite(chave(en) + '@' + (en.r || 0), (b) => b.group({ r: [0, en.r || 0, 0] }, () => kd.draw(b, en)), { chao: true });
      blit(ctx, sp.obj, en.x, 0, en.z); usar(sp);
      continue;
    }
    const { r, s } = normalizar(en);
    const key = chave(en) + '@' + r + 'x' + s.toFixed(2);
    const sp = fab.sprite(key, (b) => { if (kd.abs) kd.draw(b, en); else b.group({ r: [0, r, 0], s }, () => kd.draw(b, en)); }, { sombra: !kd.noShadow });
    const pos = kd.abs ? [0, 0, 0] : [en.x, en.y || 0, en.z];
    const depth = kd.abs ? (en.a[0] + en.b[0]) / 2 + (en.a[2] + en.b[2]) / 2 : en.x + en.z;
    objetos.push({ sp, pos, depth });
    usar(sp);
  }
  // avatares: sprite do personagem em 8 direções (as "do lado esquerdo" são espelhadas) + sombra em elipse
  const est = new Estudio({ light: 'sprite', shadow: false });
  const tags = [];
  const avSprites = [];
  for (const a of AVATARES.A) {
    let rel = ((quant(a.r - 45, 45) % 360) + 360) % 360; // direção relativa à câmera, em passos de 45°
    const mirror = rel > 180;
    const yaw = mirror ? 360 - rel : rel;
    const cell = Math.round(3.4 * S);
    let img = est.render({ outfit: a.outfit, pose: ANIMS[a.anim].fn(a.t), yaw, w: cell, h: cell, ppu: S * ESCALA_AVATAR, chao: 0.8, elev: ELEV });
    if (mirror) img = espelhar(img);
    const sp = { key: `avatar:${a.outfit}:${a.anim}:${rel}`, obj: { img, ax: cell / 2, ay: cell * 0.8, w: cell, h: cell }, avatar: true, mirror };
    objetos.push({ sp, pos: [a.x, 0, a.z], depth: a.x + a.z + 0.01, blob: true });
    usar(sp); avSprites.push(sp);
    const [px, py] = toPx(a.x, a.anim === 'colher' ? 1.95 : 2.55, a.z);
    tags.push({ nome: OUTFITS[a.outfit].nome, cor: OUTFITS[a.outfit].tag, x: px / k, y: py / k });
  }
  // 3) camada de sombras: máscara única (sombras sobrepostas não escurecem em dobro), aplicada em multiplicação
  const mask = document.createElement('canvas'); mask.width = Wc; mask.height = Hc;
  const mctx = mask.getContext('2d');
  for (const o of objetos) {
    if (o.sp.sombra) blit(mctx, o.sp.sombra, ...o.pos);
    if (o.blob) { const [px, py] = toPx(...o.pos); mctx.fillStyle = 'rgba(0,0,0,0.85)'; mctx.beginPath(); mctx.ellipse(px, py, 0.42 * S, 0.24 * S, 0, 0, Math.PI * 2); mctx.fill(); }
  }
  mctx.globalCompositeOperation = 'source-in';
  mctx.fillStyle = 'rgb(150,166,190)'; mctx.fillRect(0, 0, Wc, Hc);
  ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(mask, 0, 0); ctx.globalCompositeOperation = 'source-over';
  // 4) objetos em ordem de profundidade (x+z crescente = do fundo para a frente)
  objetos.sort((a, b2) => a.depth - b2.depth);
  for (const o of objetos) blit(ctx, o.sp.obj, ...o.pos);
  return { canvas: main, usados, tags, fab, S, objetos: objetos.length };
}

function estat(usados, comBytes) {
  let sprites = 0, pixels = 0, bytes = 0, instancias = 0;
  for (const { sp, n } of usados.values()) {
    for (const part of [sp.obj, sp.sombra]) {
      if (!part) continue;
      sprites++; pixels += part.w * part.h;
      if (comBytes) bytes += Math.round((part.img.toDataURL('image/png').length - 22) * 0.75);
    }
    instancias += n;
  }
  return { tiposDeSprite: usados.size, imagens: sprites, megapixels: +(pixels / 1e6).toFixed(2), vramMB: +((pixels * 4) / 1048576).toFixed(1), pngBytes: bytes, instancias };
}

export function cena2D(o = {}) {
  setPalette('base'); resetMat();
  document.body.innerHTML = ''; document.body.style.cssText = 'margin:0;overflow:hidden;background:#000';
  const W = window.innerWidth, H = window.innerHeight, k = window.devicePixelRatio || 1;
  const portrait = H > W;
  const viewW = o.viewW || (portrait ? 24.5 : 41);
  const target = o.target || (portrait ? [0.2, 0, 0.6] : [-0.4, 0, -0.2]);
  const { canvas, usados, tags, objetos } = comporCena2D({ W, H, k, viewW, target });
  canvas.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px`;
  document.body.appendChild(canvas);
  if (o.hud !== false) { etiquetas(tags, { portrait }); montarHUD({ portrait, modo: 'A' }); }
  const stats = { ...estat(usados, false), objetosDesenhados: objetos };
  // para medir o peso em PNG, os sprites são devolvidos ao Node, que os recomprime sem perda
  if (o.medir) window.__sprites2d = [...usados.values()].flatMap(({ sp }) => [sp.obj, sp.sombra].filter(Boolean).map((p) => p.img.toDataURL('image/png').split(',')[1]));
  return { stats };
}

// Comparação de zoom: metade 3D (re-renderizada no zoom) x metade 2D (sprites do zoom padrão ampliados).
export function comparacaoZoom(o = {}) {
  setPalette('base'); resetMat();
  const W = window.innerWidth, H = window.innerHeight, k = window.devicePixelRatio || 1;
  const zoom = o.zoom || 3;
  const baseView = 41, target = [-0.4, 0, -0.2], foco = o.foco || [4.5, 0.9, 0.6];
  // 2D: compõe no zoom padrão e amplia o recorte
  const { canvas } = comporCena2D({ W: 1920, H: 1080, k, viewW: baseView, target });
  const S = canvas.width / baseView;
  const [tx, ty] = proj(target[0], 0, target[2]);
  const [fx, fy] = proj(...foco);
  const cxp = canvas.width / 2 + (fx - tx) * S, cyp = canvas.height / 2 - (fy - ty) * S;
  const hw = Math.round((W / 2) * k), hh = Math.round(H * k);
  const d2 = document.createElement('canvas'); d2.width = hw; d2.height = hh;
  const c2 = d2.getContext('2d'); c2.imageSmoothingEnabled = true; c2.imageSmoothingQuality = 'high';
  c2.drawImage(canvas, cxp - hw / zoom / 2, cyp - hh / zoom / 2, hw / zoom, hh / zoom, 0, 0, hw, hh);
  // 3D: mesma região, renderizada de novo
  const { scene } = montarFazenda({ avatarSet: 'A' });
  const cam = isoCamera({ target: foco, viewW: (baseView / 2) / zoom, aspect: (W / 2) / H, elev: ELEV });
  addLights(scene, 'dia', { center: new THREE.Vector3(foco[0], 0, foco[2]), radius: 16, mapSize: 4096 });
  const d3 = renderToCanvas(scene, cam, hw, hh, { ss: 1, clear: '#' + C.grassOuter.getHexString() });
  document.body.innerHTML = '';
  document.body.style.cssText = 'margin:0;overflow:hidden;background:#000;font-family:Inter,sans-serif';
  const mk = (cv, left, titulo, sub, cor) => {
    cv.style.cssText = `position:fixed;top:0;left:${left}px;width:${W / 2}px;height:${H}px`;
    document.body.appendChild(cv);
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;left:${left + 24}px;top:22px;max-width:${W / 2 - 60}px;background:#fff8e7;border:3px solid #4a2f1b;border-radius:16px;padding:12px 18px;box-shadow:0 5px 0 rgba(58,36,20,.32);color:#4a2f1b`;
    t.innerHTML = `<div style="font-size:26px;font-weight:900"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${cor};border:3px solid #4a2f1b;margin-right:10px;vertical-align:-2px"></span>${titulo}</div><div style="font-size:17px;font-weight:600;opacity:.8;margin-top:3px;line-height:1.3">${sub}</div>`;
    document.body.appendChild(t);
  };
  mk(d3, 0, `3D em tempo real · zoom ${zoom}×`, 'A cena é redesenhada no novo zoom: tudo continua nítido, sem nenhum arquivo a mais.', '#41b871');
  mk(d2, W / 2, `2D com sprites · zoom ${zoom}×`, `Os sprites foram feitos para o zoom padrão e são ampliados: borram. Para ficar nítido seria preciso guardar tudo ${zoom}× maior (${zoom * zoom}× a memória).`, '#f6923a');
  const div = document.createElement('div'); div.style.cssText = `position:fixed;left:${W / 2 - 3}px;top:0;width:6px;height:${H}px;background:#fff8e7;box-shadow:0 0 0 2px #4a2f1b`;
  document.body.appendChild(div);
  return {};
}

// Atlas: todos os sprites únicos que a cena 2D precisou, lado a lado.
export function atlas2D(o = {}) {
  setPalette('base'); resetMat();
  const W = 1920, k = window.devicePixelRatio || 1;
  const { usados } = comporCena2D({ W: 1920, H: 1080, k, viewW: 41, target: [-0.4, 0, -0.2] });
  const st = estat(usados, !o.pngMB);
  const pngMB = o.pngMB || st.pngBytes / 1048576;
  const nf = (v, d = 1) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  document.body.innerHTML = '';
  document.body.style.cssText = 'margin:0;background:#f6efe2;font-family:Inter,sans-serif;color:#4a2f1b';
  const pg = document.createElement('div'); pg.style.cssText = `width:${W}px;padding:34px 40px 30px;box-sizing:border-box`;
  pg.innerHTML = `<h1 style="font-size:40px;font-weight:900;margin:0 0 4px">Opção C — atlas do cenário: os sprites que a cena 2D precisa</h1>
  <p style="font-size:19px;font-weight:600;opacity:.78;margin:0 0 20px;line-height:1.35;max-width:1640px">Cada objeto, em cada rotação e variação usadas, vira uma imagem (e mais uma para a sombra). Nesta cena: <b>${st.tiposDeSprite} tipos de sprite, ${st.imagens} imagens</b>, ${nf(st.megapixels)} megapixels = <b>${nf(pngMB)} MB em PNG</b> e ${nf(st.vramMB, 0)} MB de memória de vídeo — isso para UMA iluminação, UM zoom e UMA direção de arte. O número em cada canto é quantas vezes o sprite se repete na cena.</p>`;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;background:repeating-conic-gradient(#efe6d4 0 25%,#fbf6ea 0 50%) 0 0/24px 24px;padding:14px;border-radius:14px;border:2px solid #e3d5bb';
  const lista = [...usados.values()].sort((a, b) => b.sp.obj.h - a.sp.obj.h);
  const sc = 0.5 / k * 1.0;
  for (const { sp, n } of lista) {
    if (sp.key.startsWith('grama') && !/:-1$/.test(sp.key) && !/0\.57/.test(sp.key)) continue; // mostra só alguns ladrilhos de grama
    const d = document.createElement('div'); d.style.cssText = 'position:relative;line-height:0';
    const c = sp.obj.img; c.style.width = Math.max(10, c.width * sc) + 'px'; c.style.height = Math.max(8, c.height * sc) + 'px';
    d.appendChild(c);
    if (n > 1) { const t = document.createElement('span'); t.textContent = '×' + n; t.style.cssText = 'position:absolute;right:0;bottom:0;font-size:12px;font-weight:800;line-height:1;background:#4a2f1b;color:#fff;border-radius:6px;padding:2px 4px'; d.appendChild(t); }
    wrap.appendChild(d);
  }
  pg.appendChild(wrap);
  document.body.appendChild(pg);
  return { width: W, height: Math.ceil(pg.getBoundingClientRect().height), stats: st };
}
