// Ponto de entrada do pacote que roda dentro do Chromium (via Playwright).
import * as THREE from 'three';
import { setPalette, C } from './lib/palette.js';
import { resetMat } from './lib/builder.js';
import { catalogo } from './shots/catalogo.js';
import * as N from './models/nature.js';
import * as B from './models/buildings.js';
import * as P from './models/props.js';
import * as A from './models/animals.js';
import { Estudio } from './avatar/estudio.js';
import { POSES, ANIMS, quadro } from './avatar/poses.js';
import { OUTFITS } from './avatar/rig.js';
import { cenaA, cenaB } from './shots/cenas.js';
import * as medidas from './shots/medidas.js';
import { visaoGeral } from './shots/visaoGeral.js';
import { cena2D, atlas2D, comparacaoZoom } from './shots/cena2d.js';
import { folhaPoses, folhaCiclos, folhaVisuais, folhaSprites } from './shots/folhas.js';

const shots = {};

const NAT = () => [
  { name: 'Laranjeira', fn: (b) => N.laranjeira(b) },
  { name: 'Bananeira', fn: (b) => N.bananeira(b) },
  { name: 'Cajueiro', fn: (b) => N.cajueiro(b) },
  { name: 'Árvore da mata', fn: (b) => N.arvoreMata(b, { kind: 'redonda' }) },
  { name: 'Ipê-amarelo', fn: (b) => N.arvoreMata(b, { kind: 'ipe', color: C.clothYellow }) },
  { name: 'Palmeira', fn: (b) => N.arvoreMata(b, { kind: 'palmeira' }) },
  { name: 'Araucária', fn: (b) => N.arvoreMata(b, { kind: 'araucaria' }) },
  ...[['milho', 'Milho'], ['cafe', 'Café'], ['mandioca', 'Mandioca'], ['cana', 'Cana']].map(([k, nome]) => ({
    name: `${nome}: 3 estágios`, fn: (b) => { P.canteiro(b, 3.6, 1.4, { rows: 1 }); [0, 1, 2].forEach((s) => b.group({ p: [-1.2 + s * 1.2, 0.2, 0] }, () => N.CULTURAS[k](b, s))); },
  })),
];
const CONS = () => [
  { name: 'Casa com varanda', fn: (b) => B.casa(b) },
  { name: 'Galpão', fn: (b) => B.galpao(b) },
  { name: 'Silo', fn: (b) => B.silo(b) },
  { name: 'Galinheiro', fn: (b) => B.galinheiro(b) },
  { name: 'Barraca de feira', fn: (b) => B.barraca(b) },
  { name: 'Lagoa', fn: (b) => { P.lagoa(b); P.pato(b, { p: [0.5, 0.07, -0.5] }); } },
  { name: 'Poço', fn: (b) => P.poco(b) },
  { name: 'Trator', fn: (b) => P.trator(b) },
  { name: 'Porteira e cerca', fn: (b) => { P.porteira(b); P.cerca(b, 1.9, 0, 5.9, 0, { noStart: true }); P.cerca(b, -5.9, 0, -1.9, 0, { noEnd: true }); } },
  { name: 'Bandeirinhas', fn: (b) => { P.poste(b, { p: [-2.5, 0, 0] }); P.poste(b, { p: [2.5, 0, 0] }); P.bandeirinhas(b, [-2.5, 3.3, 0], [2.5, 3.3, 0]); } },
  { name: 'Espantalho', fn: (b) => P.espantalho(b) },
  { name: 'Caixotes, fardo e saca', fn: (b) => { B.fardo(b); B.saca(b, { p: [1, 0, 0] }); B.caixote(b, { p: [-1, 0, 0] }, 'laranja'); B.caixote(b, { p: [-1, 0, 0.7] }, 'banana'); B.caixote(b, { p: [-1.8, 0, 0] }, 'milho'); B.caixote(b, { p: [-1.8, 0, 0.7] }, 'caju'); } },
  { name: 'Cocho e latões de leite', fn: (b) => { P.cocho(b); P.latao(b, { p: [1.4, 0, 0] }); P.latao(b, { p: [1.8, 0, 0.3] }); } },
  { name: 'Carrinho de mão', fn: (b) => P.carrinho(b) },
  { name: 'Banco, lenha e feno', fn: (b) => { B.banco(b, { p: [-1.6, 0, 0] }); P.lenha(b, { p: [0.4, 0, 0] }); P.monteFeno(b, { p: [2.2, 0, 0] }); } },
  { name: 'Galinhas, galo e pintinhos', fn: (b) => { A.galinha(b); b.group({ p: [0.6, 0, 0.2], r: [0, 40, 0] }, () => A.galinha(b, { color: C.henBrown, peck: true })); b.group({ p: [-0.6, 0, 0.1], r: [0, -30, 0] }, () => A.galinha(b, { color: C.henCaramel, rooster: true, scale: 1.15 })); b.group({ p: [0.2, 0, 0.6] }, () => A.pintinho(b)); b.group({ p: [-0.2, 0, 0.7], r: [0, 60, 0] }, () => A.pintinho(b)); } },
  { name: 'Vaca nelore', fn: (b) => A.vaca(b) },
  { name: 'Vaca malhada pastando', fn: (b) => A.vaca(b, { tipo: 'malhada', graze: true }) },
];
shots.catNatureza = () => catalogo(NAT());
shots.catConstrucoes = () => catalogo(CONS().slice(0, 6), { cols: 3, cell: 560 });
shots.catObjetos = () => catalogo(CONS().slice(6), { cols: 6, cell: 320 });
shots.catalogoGeral = () => { setPalette('base'); resetMat(); return catalogo([...CONS(), ...NAT()], { cols: 6, cell: 304, titulo: 'Catálogo dos modelos provisórios', sub: 'Todos feitos em código (caixas, cilindros, esferas, extrusões e tornos) com cores por vértice: nenhum arquivo de arte, nenhuma textura. O número é a contagem de triângulos de cada modelo.' }); };

// teste rápido de poses (iteração)
shots.testeAvatar = (o = {}) => {
  document.body.innerHTML = '';
  document.body.style.cssText = 'margin:0;background:#efe9dd;font-family:Inter,sans-serif;color:#3b2a1e';
  const est = new Estudio();
  const wrap = document.createElement('div');
  const cell = o.cell || 300;
  wrap.style.cssText = `display:grid;grid-template-columns:repeat(${o.cols || 6},${cell}px);gap:6px;padding:10px`;
  const list = o.list || [
    ['ana', POSES.parado(0), 0], ['ana', POSES.parado(0), 45], ['ana', POSES.parado(0), 90], ['ana', POSES.parado(0), 180], ['leo', POSES.parado(0), 0], ['bia', POSES.parado(0), 0],
    ['ana', POSES.andar(0.125), 90], ['ana', POSES.andar(0.375), 90], ['leo', POSES.correr(0.125), 90], ['leo', POSES.correr(0.375), 90], ['bia', POSES.agachado(), 60], ['bia', POSES.sentado(), 60, [{ type: 'banquinho' }]],
    ['ana', POSES.regar(0.25), 60], ['leo', POSES.colher(0.1), 60], ['leo', POSES.colher(0.9), 60], ['bia', POSES.carregar(0.12), 45], ['ana', POSES.pular(0.56), 45], ['leo', POSES.deitado(), 90, [], 0.6],
    ['junino', POSES.parado(0), 20], ['boiadeira', POSES.parado(0), 20], ['chuva', POSES.parado(0), 20], ['base', POSES.parado(0), 20], ['junino', POSES.parado(0), 160], ['chuva', POSES.parado(0), 200],
  ];
  for (const [outfit, pose, yaw, extras, sc] of list) {
    const c = est.render({ outfit, pose, yaw, w: cell, h: cell, ppu: cell / 2.2 * (sc || 1), extras: extras || [], elev: o.elev ?? 12 });
    c.style.background = '#fff'; c.style.borderRadius = '8px';
    wrap.appendChild(c);
  }
  document.body.appendChild(wrap);
  return { width: (o.cols || 6) * (cell + 6) + 14, height: Math.ceil(list.length / (o.cols || 6)) * (cell + 6) + 14 };
};

shots.folhaPoses = folhaPoses;
shots.folhaCiclos = folhaCiclos;
shots.folhaVisuais = folhaVisuais;
shots.folhaSprites = folhaSprites;
shots.visaoGeral = visaoGeral;
shots.cena2D = cena2D;
shots.atlas2D = atlas2D;
shots.comparacaoZoom = comparacaoZoom;
shots.cenaA = cenaA;
shots.cenaB = cenaB;

window.VR = {
  THREE,
  async shot(name, opts = {}) {
    if (opts.palette) { setPalette(opts.palette); resetMat(); }
    const fn = shots[name];
    if (!fn) throw new Error('shot desconhecido: ' + name + ' (' + Object.keys(shots).join(', ') + ')');
    return (await fn(opts)) || {};
  },
  list: () => Object.keys(shots),
  medidas,
};
export { shots };
