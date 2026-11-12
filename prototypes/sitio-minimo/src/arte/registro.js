// Registro de arte: conjunto de arte -> tipo de objeto -> fábrica.
// A lógica do jogo nunca vê nada daqui. A cena pede "um visual do tipo X no conjunto Y" e recebe um objeto com:
//   raiz                         THREE.Object3D (a cena põe a raiz na posição do objeto; o visual cuida do resto)
//   pontos                       { nome: THREE.Vector3 } no espaço local da raiz (pontos de jogo e de mão)
//   definirEstado(nome, dados)   chamado a cada passo com o estado atual e os dados dele
//   atualizar(dt)                avança a animação
//   descartar()                  libera o que criou
// O contrato completo (estados, dados e pontos de cada tipo) está em CONTRATO-DE-ARTE.md.
import * as THREE from 'three';
import { TIPOS } from '../jogo/contrato.js';

const conjuntos = new Map(); // nome -> { rotulo, tipos: Map(tipo -> fábrica) }

export function registrarConjunto(nome, rotulo, fabricas) {
  conjuntos.set(nome, { rotulo, tipos: new Map(Object.entries(fabricas)) });
}
export const listarConjuntos = () => [...conjuntos.keys()];
export const rotuloDoConjunto = (nome) => (conjuntos.get(nome) || {}).rotulo || nome;
export const temVisual = (conjunto, tipo) => !!(conjuntos.get(conjunto) && conjuntos.get(conjunto).tipos.has(tipo));

// ctx: { id, tipo, def (entrada da planta do sítio), sitio }
export function criarVisual(conjunto, tipo, ctx) {
  const c = conjuntos.get(conjunto);
  if (!c || !c.tipos.has(tipo)) throw new Error(`não há arte para "${tipo}" no conjunto "${conjunto}"`);
  const v = c.tipos.get(tipo)(ctx);
  v.conjunto = conjunto; v.tipo = tipo;
  return v;
}

// Base comum (opcional) para os visuais: guarda estado e dados e cria os pontos do contrato.
export class Visual {
  constructor(tipo) {
    this.raiz = new THREE.Group();
    this.raiz.name = tipo;
    this.pontos = {};
    const T = TIPOS[tipo];
    for (const [n, p] of Object.entries({ ...T.ancoras, ...T.pontos })) this.pontos[n] = new THREE.Vector3(p[0], p[1], p[2]);
    this.estado = null; this.anterior = null; this.dados = {}; this.tempo = 0;
    this.trocou = false; // true no primeiro atualizar() depois de mudar de estado
    this.primeira = true; // true até o primeiro atualizar(): o visual deve aparecer já no estado certo, sem transição
  }
  definirEstado(nome, dados) {
    if (nome !== this.estado) { this.anterior = this.estado; this.estado = nome; this.trocou = true; }
    this.dados = dados;
  }
  atualizar(dt) { this.tempo += dt; }
  fimDoQuadro() { this.trocou = false; this.primeira = false; }
  descartar() {
    this.raiz.traverse((o) => {
      if (o.geometry && !o.geometry.userData.compartilhada) o.geometry.dispose();
      if (o.material && o.material.userData && o.material.userData.proprio) o.material.dispose();
    });
    if (this.raiz.parent) this.raiz.parent.remove(this.raiz);
  }
}

// Confere um visual contra o contrato. Devolve a lista de problemas (vazia = está conforme).
export function conferirVisual(tipo, v, tolerancia = 0.05) {
  const problemas = [], T = TIPOS[tipo];
  if (!v.raiz || !v.raiz.isObject3D) problemas.push('falta "raiz" (THREE.Object3D)');
  for (const f of ['definirEstado', 'atualizar', 'descartar']) if (typeof v[f] !== 'function') problemas.push(`falta a função "${f}"`);
  if (!v.pontos) problemas.push('falta "pontos"');
  else {
    for (const [n, p] of Object.entries(T.pontos)) {
      const q = v.pontos[n];
      if (!q) problemas.push(`falta o ponto de jogo "${n}"`);
      else if (Math.hypot(q.x - p[0], q.y - p[1], q.z - p[2]) > tolerancia) problemas.push(`ponto de jogo "${n}" em (${q.x.toFixed(2)}, ${q.y.toFixed(2)}, ${q.z.toFixed(2)}), o contrato pede (${p.join(', ')})`);
    }
    for (const n of Object.keys(T.ancoras)) if (!v.pontos[n]) problemas.push(`falta o ponto de mão "${n}"`);
  }
  return problemas;
}
