// Monta a cena da demonstração a partir dos moldes e de um mapa slot -> material.
// A geometria é criada uma vez só; trocar de conjunto de texturas troca apenas os materiais.
import * as THREE from 'three';
import { MOLDES, LADO_DO_CANTEIRO } from './moldes/index.js';
import { SLOTS_QUE_REPETEM } from './config.js';

export const LADO_DO_CHAO = 21;
const PASSO = (LADO_DO_CANTEIRO + 0.6) / 2; // meio passo entre canteiros vizinhos (0,6 de corredor)
// Onde cada molde fica na cena (x, z) — o chão é centrado na origem. Os canteiros formam um bloco de 2 x 2.
export const POSICOES = {
  casa: [[-5.3, -4.8]],
  celeiro: [[6.5, -3.6]],
  canteiro: [-PASSO, PASSO].flatMap((dx) => [-PASSO, PASSO].map((dz) => [0.6 + dx, 6.2 + dz])),
  chao: [[0, 0]],
};

let cache = null;
export function geometrias() {
  if (!cache) {
    cache = {};
    for (const [nome, fn] of Object.entries(MOLDES)) cache[nome] = (nome === 'chao' ? fn(LADO_DO_CHAO) : fn()).geometrias();
  }
  return cache;
}

// Um grupo com uma malha por slot. As malhas de porta e janela não projetam sombra (são imagens com transparência).
function instanciar(nome, materiais) {
  const g = new THREE.Group();
  g.name = nome;
  for (const [slot, geo] of Object.entries(geometrias()[nome])) {
    const malha = new THREE.Mesh(geo, materiais[slot]);
    malha.name = `${nome}:${slot}`;
    malha.castShadow = SLOTS_QUE_REPETEM.includes(slot);
    malha.receiveShadow = true;
    g.add(malha);
  }
  return g;
}

export function montarCena(materiais, { so = null } = {}) {
  const cena = new THREE.Scene();
  for (const [nome, lugares] of Object.entries(POSICOES)) {
    if (so && nome !== so) continue;
    if (so) { cena.add(instanciar(nome, materiais)); continue; } // o molde sozinho, na origem
    for (const [x, z] of lugares) {
      const g = instanciar(nome, materiais);
      g.position.set(x, 0, z);
      cena.add(g);
    }
  }
  return cena;
}

// Linhas finas nas arestas dos moldes (só para o estado "molde puro", onde tudo tem a mesma cor).
export function adicionarArestas(cena, cor = '#6f6a63') {
  const mat = new THREE.LineBasicMaterial({ color: cor });
  const novas = [];
  cena.traverse((o) => {
    if (!o.isMesh) return;
    const linhas = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 1), mat);
    linhas.name = 'arestas';
    novas.push([o, linhas]);
  });
  for (const [o, l] of novas) o.add(l);
}

