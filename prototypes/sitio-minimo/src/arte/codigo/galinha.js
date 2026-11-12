// Galinha do conjunto "codigo": corpo, pescoço, cabeça, duas asas, cauda e duas pernas com junta, numa malha só.
// Animação por código: cabeça que vira aos trancos, passo com a cabeça "ficando para trás" e dando o bote para a
// frente, bicada com preparo, bater de asas com pulinho, corrida de susto e a postura no ninho.
import { Visual } from '../registro.js';
import { PASSADA } from '../../jogo/contrato.js';
import { THREE, C, mix, shade, articulado, sombra, Mola, pernaDeBicho, TAU, limitar, suave, rampa, janela, amortecer, acaso } from './base.js';

const E = 1.2; // escala do modelo
const QUADRIL = 0.17, COXA = 0.085, CANELA = 0.1, APOIO = 0.6;
const CORES = { branca: 'henWhite', caramelo: 'henCaramel', marrom: 'henBrown' };
const OSSOS = [
  ['raiz', null, [0, 0, 0]], ['corpo', 'raiz', [0, 0.3, 0]], ['pescoco', 'corpo', [0, 0.1, 0.17]], ['cabeca', 'pescoco', [0, 0.2, 0.01]],
  ['asaE', 'corpo', [0.15, 0.07, 0.04]], ['asaD', 'corpo', [-0.15, 0.07, 0.04]], ['cauda', 'corpo', [0, 0.05, -0.2]],
  ['pernaE1', 'corpo', [0.07, QUADRIL - 0.3, 0]], ['pernaE2', 'pernaE1', [0, -COXA, 0]],
  ['pernaD1', 'corpo', [-0.07, QUADRIL - 0.3, 0]], ['pernaD2', 'pernaD1', [0, -COXA, 0]],
];
const S = { smooth: true };

// bicadas: três por vez, cada uma com um recuo antes do golpe e uma pausa no chão. Devolve -0.2..1.
const BICADAS = [0.3, 0.7, 1.06];
function bicada(t) {
  let a = 0;
  for (const c of BICADAS) {
    const x = t - c;
    if (x > -0.2 && x <= -0.08) a -= 0.22 * Math.sin((Math.PI * (x + 0.2)) / 0.12);
    else if (x > -0.08 && x <= 0) a += suave((x + 0.08) / 0.08);
    else if (x > 0 && x <= 0.06) a += 1;
    else if (x > 0.06 && x < 0.24) a += 1 - suave((x - 0.06) / 0.18);
  }
  return a;
}

export function galinha({ def }) {
  const v = new Visual('galinha');
  const cor = C[CORES[def.variante] || 'henWhite'], escura = shade(cor, 0.86), asa = shade(cor, 0.8), ponta = shade(cor, 0.62);
  const g = articulado(OSSOS, (b, nome) => {
    if (nome === 'corpo') b.sph(0.2, 8, 6, cor, { s: [0.86, 0.84, 1.18], ...S, grad: mix(cor, C.white, 0.2) });
    else if (nome === 'asaE' || nome === 'asaD') { // a asa pende da junta; as penas da ponta são mais escuras, para o bater de asas aparecer
      b.sph(0.13, 6, 5, asa, { p: [0, -0.085, -0.06], s: [0.32, 0.86, 1.15], ...S });
      b.box(0.022, 0.07, 0.2, ponta, { p: [0, -0.215, -0.07] });
      b.box(0.022, 0.06, 0.12, ponta, { p: [0, -0.2, -0.2], r: [-18, 0, 0] });
    }
    else if (nome === 'cauda') { b.cone(0.1, 0.26, 5, escura, { r: [-38, 0, 0] }); b.cone(0.06, 0.2, 4, cor, { p: [0, 0.03, 0.02], r: [-20, 0, 0] }); }
    else if (nome === 'pescoco') b.cyl(0.07, 0.1, 0.22, 6, cor, { p: [0, -0.01, 0], r: [-6, 0, 0], ...S });
    else if (nome === 'cabeca') {
      b.sph(0.095, 8, 6, cor, { p: [0, 0.04, 0.01], ...S });
      b.cone(0.036, 0.1, 4, C.beak, { p: [0, 0.03, 0.085], r: [90, 0, 0] });
      b.box(0.03, 0.06, 0.05, C.comb, { p: [0, 0.12, 0.04] });
      b.box(0.03, 0.08, 0.05, C.comb, { p: [0, 0.12, -0.01] });
      b.box(0.03, 0.05, 0.04, C.comb, { p: [0, 0.11, -0.06] });
      b.sph(0.03, 5, 4, C.comb, { p: [0, -0.03, 0.08], s: [0.7, 1.2, 0.8] });
      for (const sx of [-1, 1]) b.sph(0.018, 5, 4, C.eye, { p: [sx * 0.08, 0.06, 0.045] });
    } else if (nome.endsWith('1')) b.cyl(0.02, 0.02, COXA + 0.01, 4, C.beak, { p: [0, -COXA, 0] });
    else if (nome.endsWith('2')) { b.cyl(0.017, 0.017, CANELA, 4, C.beak, { p: [0, -CANELA, 0] }); b.box(0.075, 0.02, 0.12, C.beak, { p: [0, -CANELA, 0.03] }); }
  }, 300);
  g.grupo.scale.setScalar(E);
  const mancha = sombra(0.24, 0.3);
  v.raiz.add(g.grupo, mancha);
  const o = g.o;
  let anda = 0, faseAntes = null, olhar = 0, olharAlvo = 0, trocaEm = 0, nOlhar = def.variante === 'branca' ? 3 : 11, asas = 0, senta = 0, tEstado = 0;
  const pulo = new Mola(0, 3.5, 0.3);
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, e = v.estado, t = v.tempo, fase = d.fase || 0, te = d.t || 0;
    if (v.trocou) tEstado = 0; else tEstado += dt;
    const taxa = faseAntes === null || dt <= 0 ? 0 : (fase - faseAntes) / dt; faseAntes = fase;
    anda = v.primeira ? (taxa > 0.1 ? 1 : 0) : amortecer(anda, taxa > 0.1 ? 1 : 0, 16, dt);
    const foge = e === 'fugindo' ? 1 : 0, bica = e === 'bicando' ? bicada(te) : 0, bota = e === 'botando';
    // a cabeça vira aos trancos: escolhe um lado, fica, escolhe outro
    if (t >= trocaEm) { nOlhar++; olharAlvo = (acaso(nOlhar) - 0.5) * 1.5; trocaEm = t + 0.5 + acaso(nOlhar + 50) * 1.3; }
    olhar = amortecer(olhar, e === 'bicando' || foge ? 0 : olharAlvo, 22, dt);

    // bater de asas: agacha, estica e bate; na fuga as asas ficam meio abertas batendo
    let bate = 0, estica = 0, agacha = 0, sacode = 0;
    if (e === 'batendoAsas') {
      const u = d.dur ? te / d.dur : 0;
      agacha = janela(u, 0, 0.2, 0.1, 0.08); estica = janela(u, 0.16, 0.86, 0.1, 0.14);
      bate = estica * (0.3 + 0.9 * Math.abs(Math.sin((u - 0.16) * Math.PI * 7)));
      sacode = janela(u, 0.84, 1.0, 0.04, 0.1) * Math.sin(te * 46);
    }
    if (foge) bate = 0.55 + 0.45 * Math.sin(t * 44);
    asas = amortecer(asas, bate, 40, dt);

    // postura: senta no ninho, se ajeita, faz força algumas vezes e levanta orgulhosa
    senta = amortecer(senta, bota ? janela(te, 0.05, d.dur || 2.4, 0.3, 0.3) : 0, 12, dt);
    const ajeita = bota ? Math.exp(-te * 2.4) * Math.sin(te * 10) : 0;
    const forca = bota ? janela(te, 0.75, 2.0, 0.1, 0.1) * Math.max(0, Math.sin((te - 0.75) * TAU * 1.25)) ** 2 : 0;
    const orgulho = bota ? rampa(te, (d.dur || 2.4) - 0.34, (d.dur || 2.4) - 0.1) : 0;

    // corpo
    const f2 = fase * TAU, quique = pulo.passo(estica * 0.05 + foge * 0.012 * Math.abs(Math.sin(f2)), dt);
    const y = 0.3 - 0.022 * anda - 0.03 * agacha - 0.1 * senta + quique + 0.008 * anda * Math.sin(2 * f2) + 0.004 * Math.sin(t * 3);
    o.corpo.position.set(0.006 * anda * Math.sin(f2), y, 0.035 * Math.max(0, bica));
    o.corpo.rotation.set(0.62 * bica + 0.22 * foge + 0.06 * anda - 0.16 * estica + 0.1 * forca - 0.12 * orgulho, 0.16 * ajeita + 0.12 * sacode, 0.07 * anda * Math.sin(f2) + 0.1 * ajeita);
    const gordo = 1 + 0.09 * senta + 0.03 * forca;
    o.corpo.scale.set(gordo, 1 + 0.06 * senta - 0.06 * forca, gordo);
    // pernas (a junta da galinha dobra para trás)
    const curso = APOIO * (PASSADA.galinha / E), quadril = y + (QUADRIL - 0.3);
    for (const [n, atraso] of [['pernaE', 0], ['pernaD', 0.5]]) {
      const u = (((fase + atraso) % 1) + 1) % 1;
      let dz, sobe = 0;
      if (u < APOIO) dz = curso * (0.5 - u / APOIO); else { const w = (u - APOIO) / (1 - APOIO); dz = curso * (-0.5 + suave(w)); sobe = 0.06 * Math.sin(Math.PI * w); }
      const [r1, r2] = pernaDeBicho(dz * anda - 0.035 * Math.max(0, bica), -Math.max(0.03, quadril) + sobe * anda, COXA, CANELA, -1);
      o[n + '1'].rotation.x = r1 - o.corpo.rotation.x; o[n + '2'].rotation.x = r2;
      o[n + '1'].scale.setScalar(1 / gordo); // as pernas não engordam com o corpo
    }
    // pescoço e cabeça: no passo, a cabeça fica para trás e dá o bote para a frente
    const u2 = (((fase * 2) % 1) + 1) % 1, bote = u2 < 0.25 ? -1 + 2 * suave(u2 / 0.25) : 1 - (2 * (u2 - 0.25)) / 0.75;
    o.pescoco.rotation.set(0.5 * bica + 0.2 * bote * anda * (1 - foge) + 0.3 * foge - 0.28 * estica - 0.14 * senta + 0.2 * forca - 0.3 * orgulho + 0.02 * Math.sin(t * 3), olhar * 0.5, 0.05 * Math.sin(t * 1.7) * (1 - anda));
    o.cabeca.rotation.set(-0.12 * bote * anda * (1 - foge) - 0.2 * foge + 0.2 * estica + 0.12 * Math.max(0, bica) + 0.25 * orgulho * Math.sin(te * 30), olhar * 0.6, olhar * 0.18);
    // asas e cauda
    // abertas, as asas passam da horizontal (sobem acima das costas) e ficam um pouco maiores
    const abre = 1.9 * asas + 0.06 * senta + 0.25 * orgulho, cresce = 1 + 0.35 * Math.min(1, asas);
    o.asaE.rotation.set(-0.25 * Math.min(1, asas), 0, abre); o.asaD.rotation.set(-0.25 * Math.min(1, asas), 0, -abre);
    o.asaE.scale.set(1, cresce, 1); o.asaD.scale.set(1, cresce, 1);
    o.cauda.rotation.set(-0.25 * Math.max(0, bica) - 0.3 * estica - 0.35 * forca + 0.08 * Math.sin(t * 2.3) + 0.1 * anda * Math.sin(2 * f2), 0.2 * sacode, 0);
    // em cima do ninho ela fica mais alta (a lógica diz quanto ela já subiu)
    g.grupo.position.y = 0.09 * (d.noNinho || 0);
    mancha.visible = (d.noNinho || 0) < 0.5;
  };
  return v;
}
