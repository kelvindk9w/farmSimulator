// Construtor de moldes: junta faces planas por slot de material e devolve uma BufferGeometry por slot,
// com posição, normal e UV. Não há cor por vértice nem textura aqui dentro.
import * as THREE from 'three';
import { SLOTS, SLOTS_QUE_REPETEM, DENSIDADE, FOLGA } from '../config.js';

const EIXOS = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);

export class Molde {
  constructor(nome) {
    this.nome = nome;
    this.partes = {}; // slot -> { pos, nor, uv, idx }
  }

  _parte(slot) {
    if (!SLOTS.includes(slot)) throw new Error(`slot desconhecido: ${slot}`);
    return (this.partes[slot] ||= { pos: [], nor: [], uv: [], idx: [] });
  }

  // Face plana convexa. `pts` são os cantos em volta da face; `o.normal` diz para que lado ela olha
  // (a ordem dos pontos é invertida se for preciso). O UV sai de uma destas duas formas:
  //  - o.uv: um par [u, v] por canto (usado nos quadros de porta e janela);
  //  - projeção em unidades de mundo: V segue `o.v` (por padrão, "para cima" na face) e U fica à direita
  //    de quem olha a face de fora. `o.origem` é o ponto onde UV = (0, 0) e `o.desloc` soma [u, v] em unidades de mundo.
  poligono(slot, pts, o = {}) {
    const P = pts.map(V);
    let uvs = o.uv ? o.uv.map((t) => [...t]) : null;
    const n = new THREE.Vector3().crossVectors(P[1].clone().sub(P[0]), P[2].clone().sub(P[0])).normalize();
    if (o.normal && n.dot(V(o.normal)) < 0) { P.reverse(); if (uvs) uvs.reverse(); n.negate(); }
    if (!uvs) {
      if (!SLOTS_QUE_REPETEM.includes(slot)) throw new Error(`o slot ${slot} não repete: informe o UV de 0 a 1`);
      let vDir = o.v ? V(o.v) : Math.abs(n.y) > 0.999 ? new THREE.Vector3(0, 0, -n.y) : new THREE.Vector3(0, 1, 0);
      vDir.addScaledVector(n, -vDir.dot(n)).normalize(); // traz V para dentro do plano da face
      const uDir = new THREE.Vector3().crossVectors(vDir, n); // U x V = normal: a imagem nunca sai espelhada
      const org = V(o.origem || [0, 0, 0]);
      const [du, dv] = o.desloc || [0, 0];
      uvs = P.map((p) => { const d = p.clone().sub(org); return [(d.dot(uDir) + du) / DENSIDADE, (d.dot(vDir) + dv) / DENSIDADE]; });
    }
    const part = this._parte(slot);
    const base = part.pos.length / 3;
    P.forEach((p, i) => { part.pos.push(p.x, p.y, p.z); part.nor.push(n.x, n.y, n.z); part.uv.push(uvs[i][0], uvs[i][1]); });
    for (let i = 1; i < P.length - 1; i++) part.idx.push(base, base + i, base + i + 1);
    return this;
  }

  // Caixa alinhada aos eixos. `o.veio` ('x' | 'y' | 'z') diz para onde V aponta nas faces que contêm esse eixo
  // (o veio da madeira); `o.sem` lista faces que não são criadas (ex.: ['-y']); `o.slots` troca o slot de uma face.
  caixa(slot, min, max, o = {}) {
    const [x0, y0, z0] = min, [x1, y1, z1] = max;
    const faces = {
      '+x': [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]],
      '-x': [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
      '+y': [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]],
      '-y': [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
      '+z': [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      '-z': [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],
    };
    for (const [nome, pts] of Object.entries(faces)) {
      if (o.sem && o.sem.includes(nome)) continue;
      const normal = EIXOS[nome[1]].map((c) => c * (nome[0] === '+' ? 1 : -1));
      const noPlano = o.veio && o.veio !== nome[1];
      this.poligono((o.slots && o.slots[nome]) || slot, pts, { normal, v: noPlano ? EIXOS[o.veio] : undefined, origem: o.origem });
    }
    return this;
  }

  // Quadro de imagem única (porta, janela): UV de 0 a 1, colocado um fio à frente da parede.
  // `centro` fica no plano da parede; `normal` é o lado de fora; `o.espelhar` inverte a imagem na horizontal.
  quadro(slot, centro, largura, altura, normal, o = {}) {
    const n = V(normal).normalize(), cima = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3().crossVectors(cima, n); // direita de quem olha de fora
    const c = V(centro).addScaledVector(n, o.folga ?? FOLGA);
    const canto = (sx, sy) => c.clone().addScaledVector(dir, (sx * largura) / 2).addScaledVector(cima, (sy * altura) / 2).toArray();
    const [u0, u1] = o.espelhar ? [1, 0] : [0, 1];
    return this.poligono(slot, [canto(-1, -1), canto(1, -1), canto(1, 1), canto(-1, 1)], { normal, uv: [[u0, 0], [u1, 0], [u1, 1], [u0, 1]] });
  }

  // Água de telhado com espessura. O perfil é uma lista de pontos [afastamento, altura] do beiral até a cumeeira
  // (pode ter uma quebra no meio); `ao` é a direção da cumeeira, `fora` a direção horizontal que vai da cumeeira ao beiral.
  // Em cima vai o slot `telhado`, com V subindo a água a partir do beiral e as fiadas contínuas através da quebra;
  // embaixo e nas bordas vai `madeira`.
  agua(perfil, s0, s1, { ao, fora, espessura = 0.12, centro = [0, 0, 0], fechaTopo = false }) {
    const A = V(ao), F = V(fora), C = V(centro), Y = new THREE.Vector3(0, 1, 0);
    const pt = (s, [t, y], dy = 0) => C.clone().addScaledVector(A, s).addScaledVector(F, t).addScaledVector(Y, y - dy).toArray();
    const sm = (s0 + s1) / 2;
    let corrido = 0; // comprimento já percorrido desde o beiral, em unidades de mundo
    for (let i = 0; i < perfil.length - 1; i++) {
      const a = perfil[i], b = perfil[i + 1];
      const sobe = F.clone().multiplyScalar(b[0] - a[0]).addScaledVector(Y, b[1] - a[1]);
      const comp = sobe.length();
      sobe.normalize();
      const nTopo = new THREE.Vector3().crossVectors(A, sobe); if (nTopo.y < 0) nTopo.negate();
      const origem = pt(sm, a);
      this.poligono('telhado', [pt(s0, a), pt(s1, a), pt(s1, b), pt(s0, b)], { normal: nTopo.toArray(), v: sobe.toArray(), origem, desloc: [0, corrido] });
      this.poligono('madeira', [pt(s0, a, espessura), pt(s1, a, espessura), pt(s1, b, espessura), pt(s0, b, espessura)], { normal: nTopo.clone().negate().toArray(), v: A.toArray() });
      for (const [s, sinal] of [[s0, -1], [s1, 1]]) { // bordas laterais (oitão)
        this.poligono('madeira', [pt(s, a), pt(s, b), pt(s, b, espessura), pt(s, a, espessura)], { normal: A.clone().multiplyScalar(sinal).toArray(), v: sobe.toArray() });
      }
      corrido += comp;
    }
    const e = perfil[0], c = perfil[perfil.length - 1];
    this.poligono('madeira', [pt(s0, e), pt(s1, e), pt(s1, e, espessura), pt(s0, e, espessura)], { normal: F.toArray(), v: A.toArray() }); // testeira do beiral
    if (fechaTopo) this.poligono('madeira', [pt(s0, c), pt(s1, c), pt(s1, c, espessura), pt(s0, c, espessura)], { normal: F.clone().negate().toArray(), v: A.toArray() });
    return this;
  }

  // Uma BufferGeometry indexada por slot usado, na ordem fixa dos slots.
  geometrias() {
    const out = {};
    for (const slot of SLOTS) {
      const p = this.partes[slot];
      if (!p) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(p.nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(p.uv, 2));
      g.setIndex(p.idx);
      g.name = `${this.nome}:${slot}`;
      out[slot] = g;
    }
    return out;
  }
}
