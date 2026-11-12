// Conjunto de arte "molde": cada objeto em formas cinza, lisas, sem cor nem detalhe.
// Serve para duas coisas: mostrar a etapa "molde nu" (antes de qualquer textura) e provar que trocar a arte
// de um tipo não mexe na lógica. Tem os mesmos estados e pontos do conjunto "codigo", com animação bem crua.
import * as THREE from 'three';
import { Visual, registrarConjunto } from '../registro.js';
import { TIPOS, ACOES, ESCALA_PERSONAGEM } from '../../jogo/contrato.js';

const TAU = Math.PI * 2;
const CLARO = new THREE.MeshLambertMaterial({ color: 0xd8d8d8 });
const CHAO = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });
const ESCURO = new THREE.MeshLambertMaterial({ color: 0x8f8f8f });
const CAMINHO = new THREE.MeshLambertMaterial({ color: 0xa6a6a6 });
const suave = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const janela = (t, a, b, s = 0.15, d = 0.15) => suave((t - a) / s) * (1 - suave((t - (b - d)) / d));

// caixa com a origem na base (ou no topo, para braços e pernas que pendem de um pivô)
function caixa(w, h, d, { x = 0, y = 0, z = 0, mat = CLARO, pende = false } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, pende ? -h / 2 : h / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  return m;
}
function cilindro(r, h, { x = 0, y = 0, z = 0, mat = CLARO, seg = 10 } = {}) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  g.translate(0, h / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  return m;
}
function bola(r, { x = 0, y = 0, z = 0, mat = CLARO } = {}) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
  m.position.set(x, y, z);
  return m;
}
function pivo(pai, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); return g; }
// aproxima "atual" de "alvo" sem tranco (k = rapidez); na primeira vez vai direto
const rumoA = (atual, alvo, k, dt, direto) => (direto ? alvo : atual + (alvo - atual) * (1 - Math.exp(-k * dt)));

// ---------------- Personagem ----------------
function personagem() {
  const v = new Visual('personagem');
  const corpo = pivo(v.raiz, 0, 0, 0);
  corpo.scale.setScalar(ESCALA_PERSONAGEM / 1.25);
  const tronco = pivo(corpo, 0, 0.88, 0);
  tronco.add(caixa(0.56, 0.72, 0.32));
  tronco.add(caixa(0.44, 0.42, 0.42, { y: 0.74 }));
  const bD = pivo(tronco, -0.37, 0.68, 0), bE = pivo(tronco, 0.37, 0.68, 0);
  bD.add(caixa(0.15, 0.62, 0.15, { pende: true })); bE.add(caixa(0.15, 0.62, 0.15, { pende: true }));
  const pD = pivo(corpo, -0.15, 0.88, 0), pE = pivo(corpo, 0.15, 0.88, 0);
  pD.add(caixa(0.2, 0.88, 0.22, { pende: true })); pE.add(caixa(0.2, 0.88, 0.22, { pende: true }));
  const caixote = caixa(0.52, 0.3, 0.38, { y: 0.28, z: 0.42 }); tronco.add(caixote);
  const naMao = caixa(0.2, 0.2, 0.2, { y: -0.72 }); bD.add(naMao);
  // na ordenha: um banquinho debaixo dele e o balde no ponto que a vaca indica
  const banco = caixa(0.34, 0.3, 0.3, { z: -0.04 }), balde = cilindro(0.17, 0.26, { seg: 8 }); v.raiz.add(banco, balde);
  const a = { tx: 0, bd: 0, be: 0, pd: 0, pe: 0, y: 0 }; // pose atual (ângulos em radianos, y = quanto o corpo desce)
  const mao = new THREE.Vector3();
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, e = v.estado, direto = v.primeira;
    v.raiz.visible = d.visivel !== false && e !== 'dentro';
    const alvo = { tx: 0, bd: 0, be: 0, pd: 0, pe: 0, y: 0 };
    let mostra = false;
    if (e === 'andar' || e === 'correr') {
      const A = e === 'correr' ? 0.85 : 0.55, f = (d.fase || 0) * TAU, k = Math.min(1, (d.vel || 0) / 1.2);
      alvo.pe = -A * Math.sin(f) * k; alvo.pd = A * Math.sin(f) * k; alvo.be = A * 0.8 * Math.sin(f) * k; alvo.bd = -A * 0.8 * Math.sin(f) * k;
      alvo.tx = e === 'correr' ? 0.2 : 0.04; alvo.y = -0.05 * Math.abs(Math.sin(f)) * k;
    } else if (e === 'plantar') { alvo.tx = 0.15; alvo.bd = -1.0 - 0.6 * Math.sin(d.p * TAU * 2); }
    else if (e === 'regar') { alvo.tx = 0.14; alvo.bd = -0.9 - 0.25 * janela(d.p, 0.15, 0.85); mostra = true; }
    else if (e === 'colher') { alvo.tx = 0.95 * Math.sin(Math.PI * d.p); alvo.bd = -1.2; alvo.be = -0.6; mostra = d.feito; }
    else if (e === 'girarManivela') { const s = Math.sin(d.angulo || 0) * (d.maos || 0); alvo.tx = 0.15 + 0.1 * s; alvo.bd = alvo.be = -1.3 * (d.maos || 0) + 0.35 * s; }
    else if (e === 'ordenhar') { const k = janela(d.p, 0, 1, 0.12, 0.12); alvo.y = 0.5 * k; alvo.pd = alvo.pe = -1.35 * k; alvo.tx = 0.35 * k; alvo.bd = (-0.9 + 0.3 * Math.sin(d.t * 11)) * k; alvo.be = (-0.9 - 0.3 * Math.sin(d.t * 11)) * k; }
    else if (e === 'pegarOvo') { alvo.tx = 0.85 * Math.sin(Math.PI * d.p); alvo.bd = -1.3; mostra = d.feito; }
    else if (e === 'colherFruta') { alvo.bd = -2.85 * janela(d.p, 0.05, 0.8, 0.25, 0.2); mostra = d.feito; }
    if (d.carregando) { alvo.bd = alvo.be = -1.15; }
    const k = e === 'andar' || e === 'correr' ? 40 : 14;
    for (const n of Object.keys(a)) a[n] = rumoA(a[n], alvo[n], k, dt, direto);
    tronco.rotation.x = a.tx; bD.rotation.x = a.bd; bE.rotation.x = a.be; pD.rotation.x = a.pd; pE.rotation.x = a.pe;
    corpo.position.y = -a.y * corpo.scale.y + (e === 'parado' ? 0.012 * Math.sin(v.tempo * 2.6) : 0);
    caixote.visible = !!d.carregando; naMao.visible = mostra;
    v.raiz.updateMatrixWorld(true);
    const A = d.alvoPontos;
    banco.visible = e === 'ordenhar'; balde.visible = e === 'ordenhar' && !!(A && A.balde);
    if (balde.visible) v.raiz.worldToLocal(balde.position.copy(A.balde));
    for (const [nome, b] of [['maoD', bD], ['maoE', bE]]) v.pontos[nome].copy(v.raiz.worldToLocal(b.localToWorld(mao.set(0, -0.62, 0))));
  };
  return v;
}

// ---------------- Canteiro ----------------
const ALTURA_PLANTA = { vazio: 0, semeado: 0.07, broto: 0.28, crescendo: 0.85, pronto: 1.5 };
function canteiro() {
  const v = new Visual('canteiro');
  const [w, d] = TIPOS.canteiro.tamanho;
  const terra = new THREE.MeshLambertMaterial({ color: 0xcfcfcf }); terra.userData.proprio = true;
  v.raiz.add(caixa(w, 0.16, d, { mat: terra }));
  const plantas = [];
  for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) { const p = caixa(0.22, 1, 0.22, { x, y: 0.16, z }); v.raiz.add(p); plantas.push(p); }
  let h = 0, tom = 1;
  v.atualizar = (dt) => {
    v.tempo += dt;
    const dd = v.dados, ac = dd.acao;
    let alvo = ALTURA_PLANTA[v.estado] * (v.estado === 'vazio' || v.estado === 'pronto' ? 1 : 0.8 + 0.2 * (dd.p || 0));
    if (ac && ac.nome === 'colher' && !ac.feito) alvo *= 1 - 0.3 * suave(ac.p * 2);
    h = rumoA(h, alvo, 8, dt, v.primeira);
    let molha = dd.molhado ? 1 : 0;
    if (ac && ac.nome === 'regar') molha = suave((ac.t - 0.4) / 1.0);
    tom = rumoA(tom, 1 - 0.3 * molha, 10, dt, v.primeira);
    terra.color.setScalar(0.81 * tom);
    for (const p of plantas) { p.visible = h > 0.01; p.scale.y = Math.max(0.01, h); }
  };
  return v;
}

// ---------------- Poço ----------------
function poco() {
  const v = new Visual('poco');
  v.raiz.add(cilindro(0.8, 0.75, { seg: 12 }));
  v.raiz.add(caixa(0.14, 1.9, 0.14, { z: -0.72 })); v.raiz.add(caixa(0.14, 1.9, 0.14, { z: 0.72 }));
  v.raiz.add(caixa(1.5, 0.12, 2.0, { y: 1.9 }));
  const eixo = pivo(v.raiz, 0, 1.2, 0);
  const tambor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.9, 8).rotateX(Math.PI / 2), CLARO); tambor.position.z = 0.1; eixo.add(tambor);
  eixo.add(caixa(0.08, 0.3, 0.08, { z: 1.0 })); eixo.add(caixa(0.08, 0.08, 0.3, { y: 0.26, z: 1.13 }));
  const balde = pivo(v.raiz, 0, 0, 0);
  balde.add(cilindro(0.2, 0.26, { seg: 8 }));
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados;
    eixo.rotation.z = -(d.angulo || 0);
    balde.position.y = 0.25 + 0.75 * (d.balde || 0);
    balde.rotation.z = 0.9 * (d.despejo || 0);
    v.pontos.manivela.set(0.26 * Math.sin(d.angulo || 0), 1.2 + 0.26 * Math.cos(d.angulo || 0), 1.15);
  };
  return v;
}

// ---------------- Celeiro ----------------
function celeiro() {
  const v = new Visual('celeiro');
  const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, P = TIPOS.celeiro.porta;
  v.raiz.add(caixa(W, H, D));
  const telhado = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-W / 2 - 0.25, 0), new THREE.Vector2(W / 2 + 0.25, 0), new THREE.Vector2(0, 1.45)]), { depth: D + 0.4, bevelEnabled: false }), CLARO);
  telhado.position.set(0, H, -D / 2 - 0.2); v.raiz.add(telhado);
  v.raiz.add(caixa(P.largura, P.altura, 0.04, { z: D / 2 + 0.005, mat: ESCURO })); // o vão
  const folhas = [];
  for (const s of [-1, 1]) {
    const f = pivo(v.raiz, s * P.largura / 2, 0, D / 2 + 0.06);
    f.add(caixa(P.largura / 2, P.altura, 0.07, { x: -s * P.largura / 4 }));
    folhas.push([f, s]);
  }
  v.atualizar = (dt) => { v.tempo += dt; for (const [f, s] of folhas) f.rotation.y = s * 1.75 * suave(v.dados.abertura || 0); };
  return v;
}

// ---------------- Vaca ----------------
function vaca() {
  const v = new Visual('vaca');
  const s = TIPOS.vaca.escala;
  const corpo = pivo(v.raiz, 0, 0, 0); corpo.scale.setScalar(s);
  const tronco = caixa(0.8, 0.72, 1.7, { y: 0.72 }); corpo.add(tronco);
  const pescoco = pivo(corpo, 0, 1.3, 0.8);
  pescoco.add(caixa(0.36, 0.36, 0.6, { y: -0.18, z: 0.3 })); pescoco.add(caixa(0.44, 0.42, 0.5, { y: -0.2, z: 0.75 }));
  const pernas = [];
  for (const [x, z, fase] of [[0.26, 0.6, 0], [-0.26, 0.6, 0.5], [0.26, -0.6, 0.75], [-0.26, -0.6, 0.25]]) { const p = pivo(corpo, x, 0.74, z); p.add(caixa(0.2, 0.74, 0.2, { pende: true })); pernas.push([p, fase]); }
  const rabo = pivo(corpo, 0, 1.35, -0.85); rabo.add(caixa(0.08, 0.75, 0.08, { pende: true }));
  const sinal = bola(0.16, { y: 2.2 }); corpo.add(sinal);
  let cab = 0;
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, e = v.estado;
    cab = rumoA(cab, e === 'pastando' ? 1.15 : 0.1, 4, dt, v.primeira);
    pescoco.rotation.x = cab + (e === 'pastando' ? 0.06 * Math.sin(v.tempo * 9) : 0.03 * Math.sin(v.tempo * 1.7));
    const anda = e === 'andando' ? 1 : 0;
    for (const [p, fase] of pernas) p.rotation.x = 0.38 * Math.sin(((d.fase || 0) + fase) * TAU) * anda;
    rabo.rotation.z = 0.3 * Math.sin(v.tempo * 2.2);
    sinal.visible = !!d.leitePronto && e !== 'ordenhada'; sinal.position.y = 2.2 + 0.08 * Math.sin(v.tempo * 4);
  };
  return v;
}

// ---------------- Galinha ----------------
function galinha() {
  const v = new Visual('galinha');
  const corpo = pivo(v.raiz, 0, 0, 0);
  const tronco = pivo(corpo, 0, 0.2, 0);
  tronco.add(caixa(0.3, 0.3, 0.44));
  const cab = pivo(tronco, 0, 0.26, 0.2); cab.add(caixa(0.18, 0.3, 0.18));
  const asas = [];
  for (const s of [-1, 1]) { const a = pivo(tronco, s * 0.16, 0.26, 0); a.add(caixa(0.04, 0.22, 0.32, { pende: true })); asas.push([a, s]); }
  const pes = [];
  for (const s of [-1, 1]) { const p = pivo(corpo, s * 0.08, 0.2, 0); p.add(caixa(0.05, 0.2, 0.05, { pende: true })); pes.push([p, s]); }
  let bx = 0, y = 0;
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, e = v.estado;
    const f = (d.fase || 0) * TAU, anda = e === 'andando' || e === 'fugindo';
    for (const [p, s] of pes) p.rotation.x = anda ? 0.7 * Math.sin(f) * s : 0;
    const bica = e === 'bicando' ? Math.max(0, Math.sin((d.t || 0) * TAU * 2.2)) : 0;
    bx = rumoA(bx, bica * 1.1, 30, dt, v.primeira);
    tronco.rotation.x = bx * 0.5; cab.rotation.x = bx * 0.8 + (anda ? 0.25 * Math.sin(f * 2) : 0);
    const bate = e === 'batendoAsas' || e === 'fugindo' ? Math.abs(Math.sin(v.tempo * 22)) : 0;
    for (const [a, s] of asas) a.rotation.z = s * 1.3 * bate;
    y = rumoA(y, e === 'botando' ? -0.1 : 0, 8, dt, v.primeira);
    corpo.position.y = y + 0.17 * (d.noNinho || 0);
  };
  return v;
}

// ---------------- Ninho ----------------
function ninho() {
  const v = new Visual('ninho');
  v.raiz.add(cilindro(TIPOS.ninho.raio, 0.16, { seg: 10 }));
  const ovo = bola(0.09, { y: 0.22 }); ovo.scale.set(1, 1.3, 1); v.raiz.add(ovo);
  v.atualizar = (dt) => { v.tempo += dt; const a = v.dados.acao; ovo.visible = v.dados.ovos > 0 && !(a && a.feito); };
  return v;
}

// ---------------- Laranjeira ----------------
function arvore() {
  const v = new Visual('arvore');
  v.raiz.add(cilindro(0.22, 2.0, { seg: 8 }));
  const copa = pivo(v.raiz, 0, 1.9, 0);
  copa.add(bola(1.4, { y: 1.1 }));
  copa.add(bola(0.62, { x: -0.5, y: 0.92, z: 1.3 })); // o galho baixo de onde pendem as frutas
  const frutas = [[-0.6, 0.17, 1.52], [-0.42, 0.2, 1.46], [-0.5, 0.24, 1.64]].map(([x, y, z]) => { const f = bola(0.13, { x, y, z, mat: ESCURO }); copa.add(f); return f; });
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, a = d.acao;
    const efeito = ACOES.colherFruta.efeito;
    const puxa = a && !a.feito ? janela(a.t, 0.75, efeito + 0.05, 0.2, 0.05) : 0;
    const treme = a && a.feito ? Math.exp(-(a.t - efeito) * 4) * Math.sin((a.t - efeito) * 28) : 0;
    copa.rotation.z = 0.02 * Math.sin(v.tempo * 1.3) + 0.05 * treme; copa.rotation.x = 0.04 * puxa + 0.04 * treme;
    frutas.forEach((f, i) => {
      const s = d.frutas[i] ? 1 : i === d.crescendo ? 0.15 + 0.7 * d.matura : 0;
      f.visible = s > 0 && !(a && a.feito && i === d.alvo); f.scale.setScalar(Math.max(0.01, s));
    });
    const i = d.alvo >= 0 ? d.alvo : Math.max(0, d.frutas.indexOf(1));
    copa.updateMatrix();
    v.pontos.fruta.copy(frutas[i].position).applyMatrix4(copa.matrix);
  };
  return v;
}

// ---------------- Chão e cerca ----------------
function chao({ sitio }) {
  const v = new Visual('chao');
  const L = sitio.terreno * 2;
  v.raiz.add(caixa(L, 0.6, L, { y: -0.6, mat: CHAO }));
  for (const linha of sitio.caminhos) for (let i = 0; i < linha.length - 1; i++) {
    const [x0, z0] = linha[i], [x1, z1] = linha[i + 1], c = Math.hypot(x1 - x0, z1 - z0);
    const m = caixa(sitio.larguraCaminho, 0.02, c + sitio.larguraCaminho * 0.5, { x: (x0 + x1) / 2, z: (z0 + z1) / 2, mat: CAMINHO });
    m.rotation.y = Math.atan2(x1 - x0, z1 - z0); v.raiz.add(m);
  }
  return v;
}
function cerca({ sitio }) {
  const v = new Visual('cerca');
  const p = sitio.pasto;
  const lado = (x0, z0, x1, z1) => {
    const c = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(c / 1.2));
    for (let i = 0; i <= n; i++) v.raiz.add(caixa(0.14, 0.95, 0.14, { x: x0 + ((x1 - x0) * i) / n, z: z0 + ((z1 - z0) * i) / n }));
    for (const y of [0.3, 0.64]) { const m = caixa(0.06, 0.1, c, { x: (x0 + x1) / 2, y, z: (z0 + z1) / 2 }); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); v.raiz.add(m); }
  };
  lado(p.x0, p.z0, p.x1, p.z0); lado(p.x0, p.z0, p.x0, p.z1); lado(p.x1, p.z0, p.x1, p.z1);
  lado(p.x0, p.z1, p.porteira.x0, p.z1); lado(p.porteira.x1, p.z1, p.x1, p.z1);
  return v;
}

registrarConjunto('molde', 'molde', { personagem, canteiro, poco, celeiro, vaca, galinha, ninho, arvore, chao, cerca });
