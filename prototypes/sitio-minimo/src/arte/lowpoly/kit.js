// Kit do conjunto de arte "lowpoly" (alvo: arte/estilo/rodada-03/var-1-low-poly.png): tudo em faces planas bem
// visíveis, sem textura e sem contorno, cor em blocos com um leve tom diferente em cada face, sol dourado e baixo de
// fim de tarde com sombra projetada nítida e comprida, fundo pêssego.
// Os esqueletos e a animação são os do conjunto "codigo"; aqui só muda a roupa (ver comEstilo em ../codigo/base.js).
import * as THREE from 'three';
import { Builder, col } from '../../../../../tools/visual-refs/src/lib/builder.js';

// ---------------- cores ----------------
// Lidas à mão da imagem-alvo. São a cor de uma face virada para cima em pleno sol (onde a luz deste conjunto vale 1);
// as paredes viradas para a câmera ficam um pouco abaixo disso e as viradas para a direita, na sombra, bem abaixo.
export const P = {
  grama: '#9aae29', gramaClara: '#a2b52c', gramaEscura: '#92a727', gramaBorda: '#869b24',
  bloco: '#cc7438', blocoEscuro: '#b06030', blocoClaro: '#dc8848',
  caminho: '#f2a048', caminhoClaro: '#f7ad56', pedrinha: '#fdc680', terreiro: '#fdbe60', terreiroClaro: '#ffca72',
  solo: '#a9582c', soloClaro: '#c26c38', soloEscuro: '#8f4824', soloMolhado: '#6d361c',
  parede: '#c46e2a', paredeClara: '#d17b32', paredeEscura: '#a95a22', friso: '#e0913f', vigas: '#b0601f',
  madeira: '#dd8a38', madeiraClara: '#eb9c46', madeiraEscura: '#bd6f2a', tronco: '#9c5524', troncoEscuro: '#7c411b', troncoClaro: '#b06630',
  telha: '#ff7a30', telhaClara: '#ff8c3e', telhaEscura: '#ee6626', cumeeira: '#f47030', beiral: '#d9682a',
  portaVerde: '#69a838', portaVerdeEscuro: '#58932e', creme: '#f8eed2', cremeEscuro: '#e6d8b4',
  pedra: '#ddd0b4', pedraClara: '#ebdfc4', pedraEscura: '#c5b89c', pedraSombra: '#a99c82', base: '#d8cdb4',
  agua: '#2e94cc', aguaFunda: '#2079ad', aguaClara: '#7cc4e8',
  copa: '#84ac24', copaClara: '#a6c62c', copaEscura: '#5e8e1c',
  laranja: '#ff9a1c', laranjaClara: '#ffb23a', laranjaEscura: '#f07c10',
  milhoCaule: '#8cba30', milhoFolha: '#6ea62a', milhoFolhaClara: '#9cc63c', milhoEspiga: '#f9c41e', milhoEspigaEscura: '#eba614', milhoPalha: '#b4d050', milhoPendao: '#ead47a',
  palha: '#f2b624', palhaClara: '#fbc93a', palhaEscura: '#d9981a', ovo: '#f8f1e4', semente: '#f6c626',
  vaca: '#f6ebd4', vacaSombra: '#e4d5b6', vacaPreto: '#3b312a', focinho: '#eaa28c', focinhoEscuro: '#cf8672', chifre: '#eadfc4', casco: '#3a302a',
  galinhaBranca: '#f8f0e0', galinhaCaramelo: '#f29c3a', galinhaCarameloEscuro: '#d9822c', crista: '#dc281c', bico: '#f7aa1c', pe: '#f2a01a',
  pele: '#b5703a', peleEscura: '#9e5e2e', cabelo: '#3a2418', lenco: '#dc3a26', lencoEscuro: '#bd2c1c', camisa: '#f4b42a', camisaEscura: '#dd9c1e',
  jardineira: '#3f80b6', jardineiraEscura: '#33699a', jardineiraClara: '#5293c6', bota: '#7e4b24', botaEscura: '#623819',
  olho: '#2a1a12', boca: '#7a2e1e', branco: '#ffffff',
  metal: '#aeaca4', metalEscuro: '#8c8a84', metalClaro: '#c9c7be', corda: '#e4b44c', cordaEscura: '#c9982e',
  regador: '#4a93c0', regadorEscuro: '#3a7aa4', saco: '#e8d4a4', sacoEscuro: '#cdb680', caixote: '#dca25c', caixoteEscuro: '#bd8340', caixoteClaro: '#eab672',
  leite: '#fbf6ea', tampa: '#4a93c0', interior: '#3a2414', vidro: '#2c1a0e',
};

// As cores de C (paleta de tools/visual-refs) trocadas enquanto uma fábrica do "codigo" roda vestida por este conjunto:
// valem para o que não foi redesenhado aqui (partículas, fardos de feno lá dentro do celeiro).
export const PALETA_DE_C = {
  grass: P.grama, grassLight: P.gramaClara, grassDark: P.gramaEscura, grassOuter: P.gramaEscura, grassTuft: P.gramaEscura,
  soil: P.solo, soilDark: P.soloEscuro, soilLight: P.soloClaro, soilWet: P.soloMolhado,
  path: P.caminho, pathLight: P.pedrinha, pathDark: P.caminho, sand: P.terreiro,
  water: P.agua, waterDeep: P.aguaFunda, waterLight: P.aguaClara,
  stone: P.pedra, stoneDark: P.pedraEscura, stoneLight: P.pedraClara,
  wood: P.madeira, woodDark: P.madeiraEscura, woodLight: P.madeiraClara,
  roof: P.telha, roofDark: P.telhaEscura, roofLight: P.telhaClara, barnDoor: P.portaVerde, barnDoorDark: P.portaVerdeEscuro,
  metal: P.metal, metalDark: P.metalEscuro, metalLight: P.metalClaro, rope: P.corda,
  hay: P.palha, hayDark: P.palhaEscura, straw: P.palhaClara, strawDark: P.palhaEscura, sack: P.saco, sackDark: P.sacoEscuro,
  leaf: P.copa, leafDark: P.copaEscura, leafLight: P.copaClara, trunk: P.tronco, trunkDark: P.troncoEscuro,
  orangeLeaf: P.copa, orangeLeafLight: P.copaClara, orange: P.laranja,
  cornStalk: P.milhoCaule, cornLeaf: P.milhoFolha, cornEar: P.milhoEspiga, cornHusk: P.milhoPalha, cornTassel: P.milhoPendao,
  henWhite: P.galinhaBranca, henCaramel: P.galinhaCaramelo, henBrown: P.galinhaCarameloEscuro, comb: P.crista, beak: P.bico,
  cowWhite: P.vaca, cowShade: P.vacaSombra, cowDark: P.vacaPreto, cowPink: P.focinho, horn: P.chifre, hoof: P.casco,
  clothRed: P.lenco, clothYellow: P.camisa, clothWhite: P.creme, denim: P.jardineira, denimDark: P.jardineiraEscura,
  boot: P.bota, leather: P.bota, leatherDark: P.botaEscura, crate: P.caixote, crateDark: P.caixoteEscuro, can: P.regador, canDark: P.regadorEscuro,
  skin3: P.pele, hairBlack: P.cabelo, eye: P.olho, mouth: P.boca,
};

// ---------------- material ----------------
// Um material só, fosco, com a cor em cada vértice. As faces são planas porque cada triângulo tem a própria normal.
let _mat = null;
export function material() {
  if (!_mat) _mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  return _mat;
}

// ---------------- construtor de formas facetadas ----------------
// O construtor de tools/visual-refs já faz uma normal por face; aqui nenhuma peça é alisada e toda face ganha um tom
// um pouco diferente da vizinha (o.jit, padrão 4,5%): é isso que deixa as facetas à vista até numa parede lisa.
export const JIT = 0.045;
export class BuilderLowpoly extends Builder {
  add(geo, color, o = {}) {
    return super.add(geo, color, { ...o, smooth: false, jit: o.jit === undefined ? JIT : o.jit });
  }
  // prisma de n lados em pé, com a base (rb) e o topo (rt) de tamanhos diferentes
  prisma(rt, rb, h, n, color, o = {}) { return this.cyl(rt, rb, h, n, color, o); }
  // malha solta de triângulos: pts = [[x, y, z], ...], tris = [[a, b, c], ...]
  tris(pts, tris, color, o = {}) {
    const pos = [];
    for (const t of tris) for (const i of t) pos.push(pts[i][0], pts[i][1], pts[i][2]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return this.add(g, color, o);
  }
  // casca facetada (corpo de bicho): anéis de mesmo número de pontos ligados por faces, com tampa em leque nas pontas.
  // aneis: [[[x, y, z], ...], ...], em Z crescente; em cada anel os pontos começam em cima e descem pelo lado +X.
  // cores: lista de cores; qual(trecho, lado, meio) dá o índice da cor de cada triângulo (trecho -1 = tampa de trás, o último =
  // tampa da frente; meio = [x, y, z] do meio do triângulo). o.pontas = [atrás, frente]: quanto o meio de cada tampa sai para fora.
  casca(aneis, cores, qual = () => 0, o = {}) {
    const n = aneis[0].length, ult = aneis.length - 1, pts = [], listas = cores.map(() => []), pontas = o.pontas || [0, 0];
    for (const a of aneis) pts.push(...a);
    const meio = (a, dz) => { const c = [0, 0, dz]; for (const p of a) for (let k = 0; k < 3; k++) c[k] += p[k] / n; return c; };
    const c0 = pts.push(meio(aneis[0], pontas[0])) - 1, c1 = pts.push(meio(aneis[ult], pontas[1])) - 1;
    const por = (s, i, t) => listas[qual(s, i, [0, 1, 2].map((k) => (pts[t[0]][k] + pts[t[1]][k] + pts[t[2]][k]) / 3))].push(t);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      por(-1, i, [c0, i, j]);
      por(ult, i, [c1, ult * n + j, ult * n + i]);
      for (let s = 0; s < ult; s++) {
        const a = s * n + i, a2 = s * n + j, b = a + n, b2 = a2 + n;
        if ((s + i) % 2) { por(s, i, [a, b, a2]); por(s, i, [a2, b, b2]); } else { por(s, i, [a, b, b2]); por(s, i, [a, b2, a2]); }
      }
    }
    const { pontas: _, ...resto } = o;
    cores.forEach((cor, k) => { if (listas[k].length) this.tris(pts, listas[k], cor, resto); });
    return this;
  }
}

// ---------------- sombra ----------------
// A sombra deste conjunto é a do sol, projetada pelo mapa de sombra: nítida e comprida, como na imagem. Não há mancha
// de contato; quem pede uma recebe um objeto vazio (as fábricas do "codigo" só mexem na posição e na visibilidade dele).
export const sombra = () => new THREE.Object3D();
export const sombraRet = () => new THREE.Object3D();

// ---------------- o estilo entregue às fábricas ----------------
// Malhas que não entram no mapa de sombra: o chão (só recebe) e o sinal de leite, que flutua. Todo o resto projeta.
const SEM_SOMBRA = new Set(['chao.malha0', 'vaca.malha0']);
// desenhos: { 'tipo.articulado0': (b, osso, padrao, ctx) => ..., 'tipo.malha0': (b, _, padrao, ctx) => ... } troca o desenho de
// uma malha de uma fábrica do "codigo" (a ordem é a das chamadas dentro da fábrica); sem entrada, vale o desenho de lá.
export function criarEstilo(tipo, desenhos, extras = {}, ctx = null) {
  const conta = { articulado: 0, malha: 0 };
  let ultima = '';
  return {
    nome: 'lowpoly', Builder: BuilderLowpoly, material, paleta: PALETA_DE_C, sombra, sombraRet,
    aoCriar(mesh) { mesh.castShadow = !SEM_SOMBRA.has(ultima); mesh.receiveShadow = true; },
    redesenhar(qual, padrao) { ultima = `${tipo}.${qual}${conta[qual]++}`; const f = desenhos[ultima]; return f ? (b, nome) => f(b, nome, padrao, ctx) : padrao; },
    ...extras,
  };
}

// Luz e fundo deste conjunto (a cena aplica quando o chão é deste conjunto; ver Cena.definirAmbiente).
// O sol vem da esquerda e um pouco da frente, a 42 graus de altura: a sombra cai para a direita da tela, com o
// comprimento de 1,1 vez a altura de quem a faz. Sol amarelado e céu azulado somam luz 1 numa face virada para cima;
// uma parede virada para a frente (+Z) fica perto de 0,85 e uma virada para a direita (+X), só com a luz do céu, de 0,32.
export const AMBIENTE = {
  fundo: '#f8a97f',
  ceu: { cor: '#cee8ff', chao: '#c8b59f', intensidade: 1.6 },
  sol: { cor: '#ffeedc', intensidade: 3.19, direcao: [-0.45, 0.62, 0.52] },
  // um mapa de sombra só, de 2048 pontos, sem borrão: a borda nítida faz parte do estilo
  sombra: { tamanho: 2048, raio: 1, intensidade: 1 },
  // a ponta de trás da cumeeira e o beiral do celeiro têm de caber na vista "tudo"
  cabe: { celeiro: [[0, 4.5, -1.9], [-2.2, 2.9, -1.9]] },
};
export { col };
