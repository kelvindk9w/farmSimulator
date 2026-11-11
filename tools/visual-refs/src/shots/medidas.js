// Medições feitas dentro do navegador (os scripts Node só gravam e compactam os resultados).
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { setPalette } from '../lib/palette.js';
import { Builder, MAT, resetMat } from '../lib/builder.js';
import { criarAvatar, OUTFITS, BONES } from '../avatar/rig.js';
import { aplicarPose, clipes, ANIMS, quadro, POSES } from '../avatar/poses.js';
import { Estudio } from '../avatar/estudio.js';
import { gerarLayout, mascara } from '../farm/layout.js';
import { KINDS, chave } from '../farm/kinds.js';
import { ELEV_SPRITE } from './folhas.js';

function b64(buf) {
  const u = new Uint8Array(buf); let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
const exportar = (obj, animations = []) => new GLTFExporter().parseAsync(obj, { binary: true, animations, onlyVisible: false });

// Avatar como dado 3D: malha indexada + esqueleto + clipes de animação.
export async function avatarGLB(outfit = 'ana', { comAnimacoes = true, fps = 15 } = {}) {
  setPalette('base'); resetMat();
  const av = criarAvatar(outfit);
  const tri = av.mesh.geometry.attributes.position.count / 3;
  const g = mergeVertices(av.mesh.geometry, 1e-5); // indexa (junta vértices idênticos)
  av.mesh.geometry = g;
  const anims = comAnimacoes ? clipes(av, fps) : [];
  aplicarPose(av, POSES.parado(0));
  for (const m of av.props) av.group.remove(m);
  av.group.updateMatrixWorld(true);
  const buf = await exportar(av.group, anims);
  const keys = anims.reduce((s, c) => s + c.tracks.reduce((t, tr) => t + tr.times.length, 0), 0);
  return { glb: b64(buf), triangulos: tri, vertices: g.attributes.position.count, ossos: BONES.length, clipes: anims.length, chavesDeAnimacao: keys, duracaoTotal: anims.reduce((s, c) => s + c.duration, 0) };
}

// Cenário como dado 3D: cada modelo único UMA vez (o jogo instancia/junta na carga).
export async function cenarioGLB() {
  setPalette('base'); resetMat();
  const layout = gerarLayout();
  const grupo = new THREE.Group();
  const vistos = new Set();
  let tri = 0, modelos = 0;
  const add = (key, fn) => {
    if (vistos.has(key)) return; vistos.add(key);
    const b = new Builder(3); fn(b);
    tri += b.triangles; modelos++;
    const g = mergeVertices(b.build(), 1e-5);
    const m = new THREE.Mesh(g, MAT()); m.name = key;
    grupo.add(m);
  };
  for (const en of layout.E) add(chave(en), (b) => KINDS[en.k].draw(b, en));
  for (let mask = 0; mask < 16; mask++) for (const v of [5, 37]) add(`caminho:${mask}:${v}`, (b) => KINDS.caminho.draw(b, { mask, seed: v }));
  const buf = await exportar(grupo);
  return { glb: b64(buf), triangulos: tri, modelos };
}

// Conjunto completo de sprites de UM visual: todas as animações x direções, no tamanho pedido.
// Devolve um PNG (atlas) por direção, em base64, + contagem de quadros.
export function spritesCompletos({ outfit = 'ana', cell = 256, direcoes = [0, 45, 90, 135, 180, 225, 270, 315] } = {}) {
  setPalette('base'); resetMat();
  const est = new Estudio({ light: 'sprite', shadow: false });
  const lista = [];
  for (const [nome, a] of Object.entries(ANIMS)) for (let i = 0; i < a.frames; i++) lista.push([nome, i]);
  const cols = 9, rows = Math.ceil(lista.length / cols);
  const out = [];
  for (const yaw of direcoes) {
    const atlas = document.createElement('canvas'); atlas.width = cols * cell; atlas.height = rows * cell;
    const ctx = atlas.getContext('2d');
    let recorte = 0; // área somada dos retângulos justos (sem as bordas transparentes)
    lista.forEach(([nome, i], n) => {
      const c = est.render({ outfit, pose: quadro(nome, i), yaw, w: cell, h: cell, ppu: cell / 2.5, chao: 0.84, elev: ELEV_SPRITE });
      ctx.drawImage(c, (n % cols) * cell, Math.floor(n / cols) * cell);
      const d = c.getContext('2d').getImageData(0, 0, cell, cell).data;
      let x0 = cell, x1 = -1, y0 = cell, y1 = -1;
      for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) if (d[(y * cell + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= x0) recorte += (x1 - x0 + 1) * (y1 - y0 + 1);
    });
    out.push({ yaw, png: atlas.toDataURL('image/png').split(',')[1], w: atlas.width, h: atlas.height, recorte });
  }
  return { quadrosPorDirecao: lista.length, animacoes: Object.fromEntries(Object.entries(ANIMS).map(([k, a]) => [k, a.frames])), cell, atlas: out };
}
