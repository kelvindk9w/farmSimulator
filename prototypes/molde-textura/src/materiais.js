// Materiais: o "molde puro" (cinza uniforme) e os conjuntos de texturas lidos de texturas/<pasta>/texturas.json.
import * as THREE from 'three';
import { SLOTS, DENSIDADE } from './config.js';
import { getRenderer } from './palco.js';

export const COR_DO_MOLDE = '#cfcfcf';

// O mesmo cinza claro em todos os slots, sem textura.
export function materiaisDoMolde() {
  const m = new THREE.MeshLambertMaterial({ color: COR_DO_MOLDE, name: 'molde' });
  return Object.fromEntries(SLOTS.map((s) => [s, m]));
}

const conjuntos = new Map();
// Lê texturas/<pasta>/texturas.json e cria um material por slot. É o único lugar que sabe de arquivos de imagem.
export async function carregarConjunto(pasta) {
  if (conjuntos.has(pasta)) return conjuntos.get(pasta);
  const base = `texturas/${pasta}/`;
  const resp = await fetch(base + 'texturas.json');
  if (!resp.ok) throw new Error(`não achei ${base}texturas.json`);
  const def = await resp.json();
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, getRenderer().capabilities.getMaxAnisotropy());
  const materiais = {};
  for (const slot of SLOTS) {
    const s = def.slots[slot];
    if (!s) throw new Error(`o conjunto ${pasta} não tem o slot ${slot}`);
    const tex = await loader.loadAsync(base + s.arquivo);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;
    if (s.repete) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const r = DENSIDADE / (s.tamanhoNoMundo || DENSIDADE); // o molde já traz UV = mundo / DENSIDADE
      tex.repeat.set(r, r);
    }
    materiais[slot] = new THREE.MeshLambertMaterial({ map: tex, name: slot, transparent: !!s.transparente, alphaTest: s.transparente ? 0.02 : 0 });
  }
  const conjunto = { pasta, def, materiais };
  conjuntos.set(pasta, conjunto);
  return conjunto;
}
