// Objetos parados do conjunto "codigo": canteiro, poço, celeiro, ninho e laranjeira.
// Cada um é uma malha articulada (uma chamada de desenho) animada por código a partir do estado que a lógica entrega.
import { Visual } from '../registro.js';
import { TIPOS, TIRAR_AGUA } from '../../jogo/contrato.js';
import { THREE, C, mix, shade, materialProprio, malha, articulado, sombra, sombraRet, Borrifo, Mola, TAU, GRAUS, limitar, suave, rampa, janela, amortecer, acaso, elastico } from './base.js';
import { canteiro as canteiroDeTerra } from '../../../../../tools/visual-refs/src/models/props.js';
import { milho } from '../../../../../tools/visual-refs/src/models/nature.js';
import { fardo } from '../../../../../tools/visual-refs/src/models/buildings.js';

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), BAIXO = new THREE.Vector3(0, -1, 0);

// ---------------- Canteiro ----------------
const LUGARES = [[-0.42, -0.39], [0.42, -0.39], [-0.42, 0.39], [0.42, 0.39]]; // um pé de milho em cada
const FASES = ['semeado', 'broto', 'crescendo', 'pronto'];
const TAMANHO = { semeado: [1, 1], broto: [0.5, 1.2], crescendo: [0.62, 1.1], pronto: [0.85, 0.85] }; // escala no começo e no fim da fase
const BALANCO = { semeado: 0, broto: 0.05, crescendo: 0.05, pronto: 0.04 };
const MOLHADA = new THREE.Color(0.56, 0.52, 0.6);
export function canteiro() {
  const v = new Visual('canteiro');
  const [w, d] = TIPOS.canteiro.tamanho;
  const terra = materialProprio();
  v.raiz.add(malha((b) => canteiroDeTerra(b, w - 0.25, d - 0.25, { rows: 2 }), 3, terra));
  const ossos = [['raiz', null, [0, 0, 0]]];
  FASES.forEach((f, s) => LUGARES.forEach(([x, z], i) => ossos.push([`f${s}p${i}`, 'raiz', [x, 0.22, z]])));
  const g = articulado(ossos, (b, nome) => {
    if (nome === 'raiz') return;
    const s = +nome[1], i = +nome[3];
    b.group({ r: [0, i * 67 + s * 30, 0] }, () => {
      if (s === 0) { // montinho de terra com as sementes
        b.sph(0.12, 6, 4, C.soilLight, { s: [1, 0.5, 1], jit: 0.05 });
        for (let k = 0; k < 3; k++) b.ico(0.03, 0, C.cornEar, { p: [Math.cos(k * 2.1) * 0.05, 0.055, Math.sin(k * 2.1) * 0.05] });
      } else milho(b, s - 1);
    });
  }, 40);
  v.raiz.add(g.grupo);
  const palha = new Borrifo(14, C.cornHusk, 0.05, { g: 6, vida: 0.7, achatada: 0.35, gira: 9 });
  v.raiz.add(palha.mesh);
  const molas = FASES.map(() => LUGARES.map(() => new Mola(0, 2.6, 0.38)));
  let molha = 0, desde = 0, colhido = false;
  v.atualizar = (dt) => {
    v.tempo += dt;
    const dd = v.dados, ac = dd.acao, e = v.estado;
    if (v.trocou) desde = 0; else desde += dt;
    // terra molhada fica mais escura; durante a rega escurece aos poucos, conforme a água cai
    let alvoMolha = dd.molhado ? 1 : 0;
    if (ac && ac.nome === 'regar') alvoMolha = Math.max(alvoMolha, rampa(ac.t, 0.55, 1.35));
    molha = v.primeira ? alvoMolha : amortecer(molha, alvoMolha, 7, dt);
    terra.color.setRGB(1 + (MOLHADA.r - 1) * molha, 1 + (MOLHADA.g - 1) * molha, 1 + (MOLHADA.b - 1) * molha);
    const colhendo = ac && ac.nome === 'colher';
    FASES.forEach((f, s) => LUGARES.forEach((_, i) => {
      const osso = g.o[`f${s}p${i}`], mola = molas[s][i];
      let alvo = 0;
      if (e === f) {
        const [a, b] = TAMANHO[f];
        alvo = a + (b - a) * (dd.p || 0);
        if (f === 'semeado' && desde < i * 0.07) alvo = 0; // os montinhos aparecem um depois do outro
        if (f === 'pronto') alvo *= 1 + 0.03 * Math.max(0, Math.sin(v.tempo * 3 + i)) ** 6; // um pulinho de vez em quando: está pronto
      }
      const esc = v.primeira ? mola.por(alvo) : alvo > mola.x || alvo > 0 ? mola.passo(alvo, dt) : mola.por(amortecer(mola.x, 0, 16, dt));
      osso.scale.setScalar(Math.max(0.0001, esc));
      const A = BALANCO[f];
      let rx = A * 0.7 * Math.sin(v.tempo * 1.25 + i * 2.1), rz = A * Math.sin(v.tempo * 1.6 + i * 1.3);
      if (colhendo && f === 'pronto') {
        // ele puxa a espiga do pé mais perto: o pé verga para o lado dele e todos tremem
        const puxa = janela(ac.t, 0.5, 0.97, 0.3, 0.04);
        if (i === 1) { rx -= 0.2 * puxa; rz -= 0.05 * puxa; }
        rz += 0.03 * puxa * Math.sin(ac.t * 38 + i);
      }
      osso.rotation.set(rx, 0, rz);
    }));
    // ponto de mão: a espiga do pé mais perto dele (acompanha o pé quando ele verga)
    v.raiz.updateMatrixWorld(true);
    v.pontos.espiga.copy(v.raiz.worldToLocal(g.o.f3p1.localToWorld(_v.set(-0.02, 1.02, -0.1))));
    // na colheita, os pés somem numa nuvem de palha
    if (colhendo && ac.feito && !colhido) {
      colhido = true;
      for (let k = 0; k < 14; k++) { const [x, z] = LUGARES[k % 4], a = acaso(k) * TAU; palha.emitir(x, 0.5 + acaso(k + 3) * 0.8, z, Math.cos(a) * 1.1, 1.6 + acaso(k + 7) * 1.4, Math.sin(a) * 1.1, 0.8 + acaso(k + 9) * 0.6); }
    }
    if (!colhendo) colhido = false;
    palha.passo(dt);
  };
  return v;
}

// ---------------- Poço ----------------
// O eixo do sarilho corre ao longo de Z; a manivela fica na ponta +Z e gira no plano XY, de frente para o personagem.
const EIXO_Y = 1.2, RAIO_MANIVELA = 0.26;
export function poco() {
  const v = new Visual('poco');
  const borda = TIPOS.poco.ancoras.borda;
  const g = articulado([
    ['raiz', null, [0, 0, 0]],
    ['eixo', 'raiz', [0, EIXO_Y, 0]],
    ['corda', 'raiz', [0, EIXO_Y - 0.1, 0]],
    ['balde', 'raiz', [0, 0.6, 0]],
  ], (b, nome) => {
    if (nome === 'raiz') {
      // anel de pedra oco, com a água lá dentro
      b.lathe([[0.8, 0], [0.8, 0.7], [0.85, 0.7], [0.85, 0.8], [0.56, 0.8], [0.56, 0.72], [0.6, 0.72], [0.6, 0.2]], 12, C.stone, { jit: 0.08, grad: C.stoneLight });
      b.cyl(0.6, 0.6, 0.02, 12, C.waterDeep, { p: [0, 0.4, 0] });
      b.cyl(0.3, 0.3, 0.005, 8, C.water, { p: [0.1, 0.421, -0.08] });
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3; b.box(0.2, 0.14, 0.03, C.stoneDark, { p: [Math.sin(a) * 0.8, 0.12 + (i % 3) * 0.18, Math.cos(a) * 0.8], r: [0, (a * 180) / Math.PI, 0] }); }
      // esteios, travessa e telhadinho (alto, para não esconder o balde)
      for (const s of [-1, 1]) b.box(0.13, 2.3, 0.13, C.woodDark, { p: [0, 0, s * 0.74], grad: C.wood });
      b.box(0.1, 0.1, 1.7, C.woodDark, { p: [0, 2.2, 0] });
      for (const s of [-1, 1]) {
        b.box(0.8, 0.06, 2.1, C.roof, { p: [s * 0.33, 2.38, 0], r: [0, 0, -s * 32] });
        for (let i = 0; i < 5; i++) b.box(0.82, 0.03, 0.2, i % 2 ? C.roofLight : C.roofDark, { p: [s * 0.345, 2.425, -0.84 + i * 0.42], r: [0, 0, -s * 32] });
      }
      b.box(0.14, 0.08, 2.16, C.roofDark, { p: [0, 2.6, 0] });
    } else if (nome === 'eixo') {
      b.cyl(0.045, 0.045, 1.85, 6, C.woodDark, { p: [0, 0, -0.82], r: [90, 0, 0] });
      b.cyl(0.1, 0.1, 0.9, 8, C.wood, { p: [0, 0, -0.45], r: [90, 0, 0], grad: C.woodLight });
      for (let i = 0; i < 4; i++) b.cyl(0.108, 0.108, 0.05, 8, C.rope, { p: [0, 0, -0.14 + i * 0.07], r: [90, 0, 0] });
      // manivela: braço e pegador
      b.box(0.07, RAIO_MANIVELA + 0.07, 0.05, C.metalDark, { p: [0, -0.035, 1.02] });
      b.cyl(0.04, 0.04, 0.3, 6, C.woodLight, { p: [0, RAIO_MANIVELA, 1.03], r: [90, 0, 0] });
    } else if (nome === 'corda') {
      b.cyl(0.014, 0.014, 1, 4, C.rope, { p: [0, -1, 0] }); // de 0 a -1: a escala em Y dá o comprimento
    } else if (nome === 'balde') {
      // origem na boca do balde; a alça sobe até onde a corda amarra
      b.cyl(0.2, 0.15, 0.27, 8, C.wood, { p: [0, -0.27, 0], grad: C.woodLight, open: true });
      b.cyl(0.19, 0.145, 0.27, 8, shade(C.woodDark, 0.8), { p: [0, -0.27, 0], s: [-1, 1, 1], open: true });
      b.cyl(0.15, 0.15, 0.01, 8, C.woodDark, { p: [0, -0.27, 0] });
      b.cyl(0.165, 0.165, 0.012, 8, C.water, { p: [0, -0.13, 0] });
      b.cyl(0.203, 0.196, 0.035, 8, C.metalDark, { p: [0, -0.05, 0], open: true });
      b.cyl(0.172, 0.165, 0.035, 8, C.metalDark, { p: [0, -0.21, 0], open: true });
      b.tube([[0, 0, -0.19], [0, 0.14, -0.1], [0, 0.17, 0], [0, 0.14, 0.1], [0, 0, 0.19]], 0.013, 4, C.metalDark, {});
    }
  }, 60);
  v.raiz.add(g.grupo, sombra(1.15, 1.1, 0.12, -0.1));
  const agua = new Borrifo(30, mix(C.water, C.white, 0.35), 0.046, { g: 7.5, vida: 0.5 });
  v.raiz.add(agua.mesh);
  const ALCA = 0.17; // da boca do balde até o nó da corda
  // direção (no chão) do centro do poço para o regador pousado na borda
  const dir = new THREE.Vector2(borda[0], borda[2]).normalize();
  let resto = 0;
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, ang = d.angulo || 0, sobe = d.balde || 0, vira = d.despejo || 0;
    g.o.eixo.rotation.z = -ang;
    v.pontos.manivela.set(RAIO_MANIVELA * Math.sin(ang), EIXO_Y + RAIO_MANIVELA * Math.cos(ang), 1.15);
    // o balde sobe pendurado; para despejar, vem para o lado do regador, sobe mais um pouco e vira
    const bx = dir.x * 0.4 * vira, bz = dir.y * 0.4 * vira;
    const by = 0.5 + 0.47 * sobe + 0.32 * vira + (sobe > 0.02 && sobe < 0.98 ? 0.008 * Math.sin(ang * 2) : 0);
    const B = g.o.balde;
    B.position.set(bx, by, bz);
    // inclina em torno do eixo horizontal perpendicular à direção do regador
    B.quaternion.setFromAxisAngle(_v.set(dir.y, 0, -dir.x), 1.05 * vira + 0.05 * Math.sin(v.tempo * 2.2) * (1 - vira));
    // corda: do tambor até a alça
    const no = _v.set(0, ALCA, 0).applyQuaternion(B.quaternion).add(B.position);
    v.pontos.balde.copy(no);
    const c = g.o.corda, fio = _w.copy(no).sub(c.position), comp = fio.length();
    c.scale.set(1, Math.max(0.02, comp), 1);
    c.quaternion.setFromUnitVectors(BAIXO, fio.normalize());
    // água caindo do balde no regador
    if (vira > 0.55 && dt > 0) {
      resto += dt * 56;
      const boca = _v.set(dir.x * 0.2, 0, dir.y * 0.2).applyQuaternion(B.quaternion).add(B.position);
      while (resto >= 1) { resto -= 1; const k = agua.conta; agua.emitir(boca.x + (acaso(k) - 0.5) * 0.05, boca.y, boca.z + (acaso(k + 1) - 0.5) * 0.05, dir.x * 0.55, -0.3, dir.y * 0.55, 0.8 + acaso(k + 2) * 0.5, 0.26); }
    }
    agua.passo(dt);
  };
  return v;
}

// ---------------- Celeiro ----------------
const ABERTA = 172 * GRAUS; // as folhas abrem para fora até encostar na parede da frente
export function celeiro() {
  const v = new Visual('celeiro');
  const [W, D] = TIPOS.celeiro.tamanho, H = 2.75, P = TIPOS.celeiro.porta, hw = P.largura / 2, fz = D / 2;
  const sobe = 1.45, corre = W / 2;
  const escuro = shade(C.woodDark, 0.42);
  const g = articulado([
    ['raiz', null, [0, 0, 0]],
    ['folhaE', 'raiz', [-hw, 0, fz + 0.1]],
    ['folhaD', 'raiz', [hw, 0, fz + 0.1]],
  ], (b, nome) => {
    if (nome === 'raiz') {
      const tabua = (x, z, giro, larg, alt, y, k) => b.box(larg, alt, 0.12, k % 2 ? C.wood : mix(C.wood, C.woodLight, 0.42), { p: [x, y, z], r: [0, giro, 0] });
      let k = 0;
      // paredes de tábuas em pé: fundo, lados e frente (com o vão da porta)
      for (let i = 0; i < 8; i++) tabua(-W / 2 + 0.225 + i * 0.45, -fz + 0.06, 0, 0.45, H, 0, k++);
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) tabua(s * (W / 2 - 0.06), -fz + 0.25 + i * 0.5, 90, 0.5, H, 0, k++);
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) tabua(s * (hw + 0.2375 + i * 0.475), fz - 0.06, 0, 0.475, H, 0, k++);
      for (let i = 0; i < 4; i++) tabua(-hw + 0.2125 + i * 0.425, fz - 0.06, 0, 0.425, H - P.altura, P.altura, k++);
      // empenas e janelinha do paiol
      for (const s of [-1, 1]) b.ext([[-corre, 0], [corre, 0], [0, sobe]], 0.12, mix(C.wood, C.woodLight, 0.6), { p: [0, H, s * (fz - 0.06)] });
      b.box(0.62, 0.56, 0.05, C.black, { p: [0, H + 0.22, fz] });
      for (const [x, y, lw, lh] of [[0, 0.16, 0.8, 0.08], [0, 0.78, 0.8, 0.08], [-0.36, 0.2, 0.08, 0.6], [0.36, 0.2, 0.08, 0.6]]) b.box(lw, lh, 0.1, C.woodDark, { p: [x, H + y, fz] });
      // por dentro é escuro: chão, forro e paredes
      b.box(W - 0.26, 0.012, D - 0.2, shade(C.soilDark, 0.5), { p: [0, 0.004, 0] });
      b.box(W - 0.24, 0.04, D - 0.24, escuro, { p: [0, H - 0.02, 0] });
      b.box(W - 0.26, H, 0.03, escuro, { p: [0, 0, -fz + 0.135] });
      for (const s of [-1, 1]) b.box(0.03, H, D - 0.26, escuro, { p: [s * (W / 2 - 0.135), 0, 0] });
      for (const s of [-1, 1]) b.box(W / 2 - hw - 0.13, H, 0.03, escuro, { p: [s * (hw + (W / 2 - hw - 0.13) / 2), 0, fz - 0.135] });
      // fardos de feno lá no fundo
      b.group({ s: 0.9 }, () => { fardo(b, { p: [-1.1, 0, -0.95] }); fardo(b, { p: [-0.9, 0.5, -1.0], r: [0, 10, 0] }); fardo(b, { p: [0.9, 0, -1.05], r: [0, -6, 0] }); });
      // batentes e verga da porta
      for (const s of [-1, 1]) b.box(0.14, P.altura + 0.1, 0.12, C.woodDark, { p: [s * (hw + 0.07), 0, fz - 0.02] });
      b.box(P.largura + 0.42, 0.16, 0.18, C.woodDark, { p: [0, P.altura, fz] });
      // baldrame de pedra (menos no vão da porta)
      b.box(W + 0.14, 0.2, 0.1, C.stone, { p: [0, 0, -fz - 0.02], jit: 0.06 });
      for (const s of [-1, 1]) { b.box(0.1, 0.2, D + 0.14, C.stone, { p: [s * (W / 2 + 0.02), 0, 0], jit: 0.06 }); b.box(W / 2 - hw - 0.1, 0.2, 0.1, C.stone, { p: [s * (hw + 0.14 + (W / 2 - hw - 0.1) / 2), 0, fz + 0.02], jit: 0.06 }); }
      // telhado de duas águas, cumeeira ao longo de Z
      const beiral = 0.34, k2 = (corre + beiral) / corre, ang = Math.atan2(sobe, corre), comp = Math.hypot(corre + beiral, sobe * k2), fundo = D + 0.7;
      for (const s of [-1, 1]) {
        b.group({ p: [0, H + sobe + 0.06, 0], r: [0, 0, (-s * ang * 180) / Math.PI] }, () => {
          b.box(comp, 0.09, fundo, C.roofDark, { p: [(s * comp) / 2, -0.1, 0] });
          const n = 9, lw = fundo / n;
          for (let i = 0; i < n; i++) b.box(comp + 0.04, 0.06, lw * 0.6, i % 3 === 1 ? C.roofLight : C.roof, { p: [(s * comp) / 2, -0.02, -fundo / 2 + (i + 0.5) * lw] });
        });
      }
      b.box(0.3, 0.13, fundo + 0.1, C.roofDark, { p: [0, H + sobe + 0.02, 0] });
    } else {
      // folha da porta: verde com travessas brancas em X, igual dos dois lados
      const s = nome === 'folhaE' ? 1 : -1, lw = hw - 0.01, alt = P.altura - 0.04, cx = (s * lw) / 2;
      b.box(lw, alt, 0.07, C.barnDoor, { p: [cx, 0.02, 0] });
      for (const zz of [0.045, -0.045]) {
        b.box(lw, 0.12, 0.025, C.clothWhite, { p: [cx, 0.05, zz] });
        b.box(lw, 0.12, 0.025, C.clothWhite, { p: [cx, alt - 0.12, zz] });
        for (const e of [-1, 1]) b.box(0.11, alt, 0.025, C.clothWhite, { p: [cx + e * (lw / 2 - 0.055), 0.02, zz] });
        const diag = Math.hypot(lw - 0.2, alt - 0.3), a = (Math.atan2(lw - 0.2, alt - 0.3) * 180) / Math.PI;
        for (const e of [-1, 1]) b.group({ p: [cx, alt / 2 + 0.02, zz], r: [0, 0, e * a] }, () => b.box(0.1, diag, 0.022, C.clothWhite, { p: [0, -diag / 2, 0] }));
      }
      b.box(0.05, 0.3, 0.12, C.metalDark, { p: [s * (lw - 0.12), 1.05, 0] });
    }
  }, 80);
  v.raiz.add(g.grupo, sombraRet(W + 0.9, D + 0.8, 0.25, -0.2));
  let total = -1, pulso = 9;
  const e = [new Mola(0, 3.2, 0.42), new Mola(0, 3.2, 0.42)];
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, a = d.abertura || 0;
    // uma folha começa um pouco antes da outra; a mola dá o balanço quando ela bate na parede ou no batente
    const alvoE = suave(a * 1.12), alvoD = suave(a * 1.12 - 0.12);
    const xe = v.primeira ? e[0].por(alvoE) : limitar(e[0].passo(alvoE, dt), -0.01, 1.012), xd = v.primeira ? e[1].por(alvoD) : limitar(e[1].passo(alvoD, dt), -0.01, 1.012);
    g.o.folhaE.rotation.y = -ABERTA * xe; g.o.folhaD.rotation.y = ABERTA * xd;
    // quando ele guarda alguma coisa, o celeiro dá um "pulo"
    const t = Object.values(d.estoque || {}).reduce((s, n) => s + n, 0);
    if (total >= 0 && t > total) pulso = 0;
    total = t; pulso += dt;
    const k = pulso < 0.5 ? Math.sin((pulso / 0.5) * Math.PI) * Math.exp(-pulso * 3) : 0;
    g.grupo.scale.set(1 + 0.025 * k, 1 - 0.035 * k, 1 + 0.025 * k);
  };
  return v;
}

// ---------------- Ninho ----------------
export function ninho() {
  const v = new Visual('ninho');
  const R = TIPOS.ninho.raio;
  const g = articulado([['raiz', null, [0, 0, 0]], ['ovo', 'raiz', [0, 0.1, 0]]], (b, nome) => {
    if (nome === 'raiz') {
      b.lathe([[0.001, 0.07], [0.17, 0.07], [0.29, 0.13], [0.34, 0.21], [R + 0.02, 0.16], [R + 0.04, 0.05], [R - 0.04, 0]], 10, C.hayDark, { jit: 0.1, grad: C.hay });
      for (let i = 0; i < 12; i++) { const a = i * 0.55 + acaso(i) * 0.4, r = R - 0.02; b.box(0.03, 0.03, 0.24 + acaso(i + 5) * 0.12, i % 2 ? C.straw : C.hay, { p: [Math.cos(a) * r, 0.1 + acaso(i + 2) * 0.1, Math.sin(a) * r], r: [20 - acaso(i + 8) * 40, (-a * 180) / Math.PI + 10 + acaso(i + 3) * 30, 0] }); }
    } else b.sph(0.088, 8, 6, '#fff6e4', { p: [0, 0.1, 0], s: [1, 1.28, 1], r: [0, 0, 18], smooth: true, grad: '#ffffff' });
  }, 90);
  v.raiz.add(g.grupo, sombra(0.55, 0.5, 0.05, -0.04));
  const esc = new Mola(0, 3, 0.3);
  let antes = 0, tomba = new Mola(0, 2.4, 0.2);
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, a = d.acao, tem = d.ovos > 0 && !(a && a.feito);
    if (v.primeira) esc.por(tem ? 1 : 0);
    else if (tem) esc.passo(1, dt); else esc.por(amortecer(esc.x, 0, 30, dt));
    if (d.ovos > antes && !v.primeira) tomba.v = 5; // acabou de ser botado: balança um pouco
    antes = d.ovos;
    g.o.ovo.scale.setScalar(Math.max(0.0001, esc.x));
    g.o.ovo.rotation.z = tomba.passo(0, dt) * 0.25;
    v.pontos.ovo.set(0, 0.2, 0);
  };
  return v;
}

// ---------------- Laranjeira ----------------
const COPA_Y = 1.6;
const GALHO = [0, 0.85, 0.72]; // pivô do galho baixo, em relação à copa
// onde cada laranja pendura (em relação ao galho) e o comprimento do cabinho
const PENCAS = [[-0.57, -0.19, 0.86, 0.1], [-0.39, -0.16, 0.82, 0.13], [-0.5, -0.13, 1.0, 0.12]];
const RAIO_LARANJA = 0.13;
export function arvore() {
  const v = new Visual('arvore');
  const ossos = [['raiz', null, [0, 0, 0]], ['copa', 'raiz', [0, COPA_Y, 0]], ['galho', 'copa', GALHO]];
  PENCAS.forEach((p, i) => ossos.push([`fruta${i}`, 'galho', [p[0], p[1], p[2]]]));
  const g = articulado(ossos, (b, nome) => {
    if (nome === 'raiz') {
      b.cyl(0.17, 0.27, 1.95, 7, C.trunkDark, { grad: C.trunk });
      b.cyl(0.07, 0.12, 0.8, 5, C.trunk, { p: [0.05, 1.5, 0], r: [0, 0, -34] });
      b.cyl(0.07, 0.12, 0.8, 5, C.trunk, { p: [-0.05, 1.45, -0.05], r: [-22, 0, 30] });
      b.cyl(0.06, 0.1, 1.05, 5, C.trunk, { p: [0, 1.62, 0.05], r: [52, -4, 0] });
      for (let i = 0; i < 5; i++) b.box(0.2 + acaso(i) * 0.12, 0.012, 0.09, C.trunkDark, { p: [Math.cos(i * 1.4) * 0.3, 0.02, Math.sin(i * 1.4) * 0.3], r: [0, i * 80, 0] }); // raízes
    } else if (nome === 'copa') {
      const bolas = [[0, 1.4, -0.05, 1.3], [0.85, 1.05, 0.25, 0.9], [-0.8, 1.0, -0.2, 0.95], [0.1, 1.1, -0.85, 0.85], [-0.25, 1.2, 0.62, 0.78], [0.15, 2.1, 0.0, 0.8]];
      for (const [x, y, z, r] of bolas) b.blob(r, 1, C.orangeLeaf, { p: [x, y, z], s: [1, 0.88, 1], jit: 0.07, grad: C.orangeLeafLight, rough: 0.12 });
    } else if (nome === 'galho') {
      b.blob(0.5, 1, C.orangeLeaf, { p: [-0.5, 0.33, 0.8], s: [1, 0.84, 1], jit: 0.07, grad: C.orangeLeafLight, rough: 0.14 });
      b.blob(0.3, 0, C.orangeLeafLight, { p: [-0.82, 0.2, 1.0], s: [1, 0.7, 1], jit: 0.07, rough: 0.14 });
    } else {
      const p = PENCAS[+nome[5]], c = p[3];
      b.cyl(0.012, 0.012, c + 0.2, 4, C.trunkDark, { p: [0, -c, 0] });
      b.ico(RAIO_LARANJA, 1, C.orange, { p: [0, -c - RAIO_LARANJA * 0.9, 0], smooth: true, grad: mix(C.orange, '#ffd27a', 0.5) });
      b.leaf(0.16, 0.09, 40, C.orangeLeafLight, { p: [0, -c + 0.01, 0], r: [70, 40, 0], steps: 2 });
    }
  }, 100);
  v.raiz.add(g.grupo, sombra(1.75, 1.6, 0.12, -0.1));
  const folhas = new Borrifo(12, C.orangeLeafLight, 0.07, { g: 1.6, vida: 1.5, achatada: 0.3, gira: 5, arrasto: 1.6, chao: 0.03 });
  v.raiz.add(folhas.mesh);
  const verga = new Mola(0, 3.1, 0.14), treme = new Mola(0, 2.2, 0.2), esc = PENCAS.map(() => new Mola(0, 3, 0.35));
  let soltou = false;
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, a = d.acao, t = v.tempo;
    // puxões antes de a fruta soltar; depois o galho volta com tudo e a copa treme
    let puxa = 0;
    if (a && !a.feito) puxa = 0.45 * janela(a.t, 0.8, 1.02, 0.1, 0.1) + janela(a.t, 1.04, 1.34, 0.2, 0.02);
    if (a && a.feito && !soltou) {
      soltou = true; verga.v -= 2.2; treme.v += 1.6;
      for (let k = 0; k < 9; k++) folhas.emitir(-0.4 + acaso(k) * 0.9, 2.3 + acaso(k + 4) * 0.5, 0.9 + acaso(k + 8) * 0.9, (acaso(k + 2) - 0.5) * 1.2, 0.4 + acaso(k + 6) * 0.6, (acaso(k + 5) - 0.3) * 1.0, 0.7 + acaso(k + 1) * 0.6, 1.0 + acaso(k + 3) * 0.5);
    }
    if (!a) soltou = false;
    const vg = puxa > 0 ? verga.por(0.3 * puxa) : verga.passo(0, dt), tr = treme.passo(0, dt);
    g.o.copa.rotation.set(0.012 * Math.sin(t * 0.7 + 2) + 0.05 * tr + 0.03 * vg, 0, 0.018 * Math.sin(t * 0.9) + 0.008 * Math.sin(t * 2.3 + 1) + 0.04 * tr * Math.cos(t * 9));
    g.o.galho.rotation.set(vg + 0.02 * Math.sin(t * 1.3 + 1), 0, 0.02 * Math.sin(t * 1.1));
    PENCAS.forEach((p, i) => {
      const osso = g.o[`fruta${i}`];
      let alvo = d.frutas && d.frutas[i] ? 1 : i === d.crescendo ? 0.18 + 0.62 * (d.matura || 0) : 0;
      if (a && a.feito && i === d.alvo) alvo = 0;
      const s = v.primeira ? esc[i].por(alvo) : alvo > 0 ? esc[i].passo(alvo, dt) : esc[i].por(0);
      osso.scale.setScalar(Math.max(0.0001, s));
      // pendura sempre para baixo, mesmo com o galho vergado, e balança um pouco
      osso.rotation.set(-g.o.galho.rotation.x - g.o.copa.rotation.x + 0.06 * Math.sin(t * 1.9 + i * 2) + 0.5 * tr, 0, 0.06 * Math.sin(t * 1.5 + i));
    });
    // ponto de mão: o miolo da laranja que está sendo (ou vai ser) colhida
    const i = d.alvo >= 0 ? d.alvo : Math.max(0, (d.frutas || []).indexOf(1));
    v.raiz.updateMatrixWorld(true);
    g.o[`fruta${i}`].localToWorld(_v.set(0, -PENCAS[i][3] - RAIO_LARANJA * 0.9, 0));
    v.pontos.fruta.copy(v.raiz.worldToLocal(_v));
  };
  return v;
}
