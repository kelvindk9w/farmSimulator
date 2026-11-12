// Vaca do conjunto "codigo": peças articuladas (corpo, pescoço, cabeça, mandíbula, orelhas, rabo em três
// pedaços, quatro pernas com joelho, úbere) numa malha só. A animação é toda por código, em camadas:
// respiração, rabo com atraso de um pedaço para o outro, orelhas que espantam mosca, cabeça que desce para
// pastar e mastiga, passo de quatro tempos com o casco preso ao chão (a fase vem da lógica), olhar para trás
// na ordenha e o sinal de "leite pronto". As cores e as medidas seguem a vaca malhada de tools/visual-refs.
import { Visual } from '../registro.js';
import { TIPOS, PASSADA } from '../../jogo/contrato.js';
import { THREE, C, mix, shade, malha, articulado, sombra, Mola, pernaDeBicho, TAU, limitar, suave, rampa, janela, amortecer, acaso } from './base.js';

const S = { smooth: true };
const QUADRIL = 0.82, COXA = 0.4, CANELA = 0.44; // altura do quadril e comprimento das duas partes da perna
// pernas: [nome, x, z, dobra do joelho, atraso no ciclo]. Passo de quatro tempos: traseira, dianteira do mesmo lado, e o outro lado.
const PERNAS = [['pte', 0.21, -0.52, -1, 0], ['pfe', 0.21, 0.5, 1, 0.25], ['ptd', -0.21, -0.52, -1, 0.5], ['pfd', -0.21, 0.5, 1, 0.75]];
const APOIO = 0.62; // fração do ciclo com o casco no chão

function ossosDaVaca() {
  const o = [
    ['raiz', null, [0, 0, 0]], ['corpo', 'raiz', [0, 1.0, 0]], ['tronco', 'corpo', [0, 0, 0]], ['ubere', 'corpo', [0, -0.32, -0.25]],
    ['pescoco', 'corpo', [0, 0.12, 0.6]], ['cabeca', 'pescoco', [0, 0.36, 0.31]], ['mandibula', 'cabeca', [0, -0.153, 0.06]],
    ['orelhaE', 'cabeca', [0.17, 0.05, -0.1]], ['orelhaD', 'cabeca', [-0.17, 0.05, -0.1]],
    ['rabo1', 'corpo', [0, 0.2, -0.8]], ['rabo2', 'rabo1', [0, -0.295, -0.052]], ['rabo3', 'rabo2', [0, -0.295, -0.052]],
  ];
  for (const [n, x, z] of PERNAS) o.push([n + '1', 'corpo', [x, QUADRIL - 1.0, z]], [n + '2', n + '1', [0, -COXA, 0]]);
  return o;
}

function desenharVaca(b, nome) {
  const corpo = C.cowWhite, som = C.cowShade, malhaPreta = C.cowDark;
  if (nome === 'tronco') {
    b.sph(0.5, 10, 7, corpo, { s: [0.82, 0.76, 1.62], ...S, ao: 0.22 });
    b.sph(0.34, 8, 6, malhaPreta, { p: [0.13, 0.14, -0.3], s: [1.05, 0.84, 1.25], ...S });
    b.sph(0.27, 8, 6, malhaPreta, { p: [-0.2, 0.06, 0.36], s: [1.0, 0.9, 1.1], ...S });
    b.sph(0.2, 8, 6, malhaPreta, { p: [0.24, -0.07, 0.42], s: [0.9, 0.9, 1.0], ...S });
    b.sph(0.23, 8, 6, malhaPreta, { p: [-0.25, 0.0, -0.5], s: [0.9, 0.95, 1.1], ...S });
  } else if (nome === 'ubere') {
    b.sph(0.17, 7, 5, C.cowPink, { s: [1.1, 0.9, 1.2], ...S });
    for (const x of [-0.07, 0.07]) for (const z of [-0.07, 0.07]) b.cyl(0.024, 0.018, 0.08, 5, shade(C.cowPink, 0.9), { p: [x, -0.2, z] });
  } else if (nome === 'pescoco') {
    b.cyl(0.18, 0.27, 0.52, 7, corpo, { r: [46, 0, 0], ...S });
    b.cyl(0.212, 0.232, 0.06, 8, C.clothRed, { p: [0, 0.16, 0.166], r: [46, 0, 0], ...S, open: true }); // coleira
    b.sph(0.062, 6, 5, C.clothYellow, { p: [0, -0.02, 0.33], s: [1, 1.1, 1] }); // sininho
  } else if (nome === 'cabeca') {
    b.group({ r: [16, 0, 0] }, () => {
      b.box(0.34, 0.31, 0.3, corpo, { p: [0, -0.15, -0.02] });
      b.tbox(0.32, 0.29, 0.23, 0.2, 0.3, corpo, { p: [0, 0.0, 0.12], r: [90, 0, 0] });
      b.box(0.24, 0.15, 0.1, C.cowPink, { p: [0, -0.08, 0.4] });
      for (const sx of [-1, 1]) b.box(0.035, 0.03, 0.02, shade(C.cowPink, 0.6), { p: [sx * 0.055, 0.005, 0.445] }); // narinas
      b.box(0.36, 0.2, 0.2, malhaPreta, { p: [0, 0.0, -0.06] });
      for (const sx of [-1, 1]) {
        b.sph(0.034, 6, 5, C.eye, { p: [sx * 0.165, 0.04, 0.12] });
        b.sph(0.012, 4, 3, C.white, { p: [sx * 0.178, 0.055, 0.135] });
        b.cone(0.04, 0.17, 5, C.horn, { p: [sx * 0.12, 0.13, -0.1], r: [-18, 0, sx * -38] });
      }
    });
  } else if (nome === 'mandibula') {
    b.group({ r: [16, 0, 0] }, () => {
      b.box(0.19, 0.06, 0.3, shade(corpo, 0.94), { p: [0, -0.058, 0.15] });
      b.box(0.2, 0.05, 0.08, shade(C.cowPink, 0.92), { p: [0, -0.056, 0.285] });
    });
  } else if (nome === 'orelhaE' || nome === 'orelhaD') {
    const sx = nome === 'orelhaE' ? 1 : -1;
    b.box(0.22, 0.045, 0.12, som, { p: [sx * 0.1, -0.02, 0], r: [0, 0, sx * -6] });
    b.box(0.13, 0.012, 0.07, C.cowPink, { p: [sx * 0.11, 0.024, 0.005], r: [0, 0, sx * -6] });
  } else if (nome === 'rabo1' || nome === 'rabo2') {
    b.cyl(nome === 'rabo1' ? 0.026 : 0.022, nome === 'rabo1' ? 0.032 : 0.026, 0.305, 4, som, { r: [190, 0, 0] });
  } else if (nome === 'rabo3') {
    b.sph(0.062, 5, 4, malhaPreta, { p: [0, -0.09, -0.015], s: [1, 1.9, 1] });
  } else if (nome.endsWith('1') && nome.startsWith('p')) {
    b.cyl(0.108, 0.088, COXA + 0.06, 6, som, { p: [0, -COXA, 0], ...S, grad: corpo });
  } else if (nome.endsWith('2') && nome.startsWith('p')) {
    b.cyl(0.088, 0.074, CANELA - 0.08, 6, som, { p: [0, -CANELA + 0.08, 0], ...S, grad: mix(som, corpo, 0.5) });
    b.cyl(0.084, 0.096, 0.1, 6, C.hoof, { p: [0, -CANELA, 0] });
  }
}

// um espasmo curto que se repete a cada "periodo" segundos (para o rabo e as orelhas)
const espasmo = (t, periodo, desloc, rapidez = 26, dura = 9) => { const u = (((t + desloc) % periodo) + periodo) % periodo; return Math.exp(-dura * u) * Math.sin(rapidez * u); };

export function vaca() {
  const v = new Visual('vaca');
  const E = TIPOS.vaca.escala;
  const g = articulado(ossosDaVaca(), desenharVaca, 200);
  g.grupo.scale.setScalar(E);
  // sinal de "leite pronto": uma garrafinha de leite que flutua e gira em cima dela
  const sinal = malha((b) => {
    b.lathe([[0.001, 0], [0.105, 0], [0.118, 0.03], [0.118, 0.2], [0.06, 0.3], [0.055, 0.35], [0.001, 0.35]], 8, '#ffffff', { grad: '#f1f6ff' });
    b.cyl(0.066, 0.066, 0.055, 8, C.trim, { p: [0, 0.35, 0] });
    b.cyl(0.121, 0.121, 0.09, 8, C.trimLight, { p: [0, 0.07, 0], open: true });
  }, 9);
  v.raiz.add(g.grupo, sombra(0.62 * E, 1.02 * E), sinal);
  const escSinal = new Mola(0, 2.6, 0.32);
  const o = g.o, _v = new THREE.Vector3();
  let pasta = 0, mastiga = 0, anda = 0, faseAntes = null, olha = 0, muge = 9, feitoAntes = false, parou = 0;
  const estic = new Mola(0, 2.2, 0.5);
  v.atualizar = (dt) => {
    v.tempo += dt;
    const d = v.dados, e = v.estado, t = v.tempo, fase = d.fase || 0, a = d.acao;
    // quanto ela está andando: pela fase da passada (que também avança quando ela gira no lugar)
    const taxa = faseAntes === null || dt <= 0 ? 0 : (fase - faseAntes) / dt; faseAntes = fase;
    anda = v.primeira ? (taxa > 0.05 ? 1 : 0) : amortecer(anda, taxa > 0.05 ? 1 : 0, 7, dt);
    pasta = v.primeira ? (e === 'pastando' ? 1 : 0) : amortecer(pasta, e === 'pastando' ? 1 : 0, e === 'pastando' ? 2.4 : 3.4, dt);
    mastiga = amortecer(mastiga, e === 'andando' ? 0 : e === 'pastando' ? 1 : 0.5, 3, dt);
    olha = amortecer(olha, e === 'ordenhada' ? 1 : 0, 3.2, dt);
    if (a && a.feito && !feitoAntes) muge = 0; // acabou a ordenha: um mugido
    feitoAntes = !!(a && a.feito); muge += dt;
    const mugido = janela(muge, 0, 0.55, 0.12, 0.2);

    // corpo: respira, balança com o passo e abaixa a frente para pastar
    const f2 = fase * TAU;
    o.corpo.position.set(0.012 * anda * Math.sin(f2), 1.0 - 0.036 * anda - 0.03 * pasta + 0.01 * anda * Math.sin(2 * f2 + 0.6), 0);
    o.corpo.rotation.set(0.075 * pasta + 0.012 * anda * Math.sin(2 * f2), 0.02 * anda * Math.sin(f2 + 0.4), 0.022 * anda * Math.sin(f2 + 1.2) + 0.006 * Math.sin(t * 0.6));
    const resp = Math.sin(t * 1.9);
    o.tronco.scale.set(1 + 0.014 * resp, 1 + 0.02 * resp, 1);
    o.ubere.scale.setScalar(0.82 + 0.3 * (d.leite === undefined ? 0.5 : d.leite));

    // pernas: o casco fica parado no chão durante o apoio e volta pelo ar
    const curso = APOIO * (PASSADA.vaca / E), altQuadril = o.corpo.position.y + (QUADRIL - 1.0);
    for (const [n, , z, dobra, atraso] of PERNAS) {
      const u = (((fase + atraso) % 1) + 1) % 1;
      let dz, sobe = 0;
      if (u < APOIO) dz = curso * (0.5 - u / APOIO);
      else { const w = (u - APOIO) / (1 - APOIO); dz = curso * (-0.5 + suave(w)); sobe = 0.11 * Math.sin(Math.PI * w); }
      // a frente do corpo desce quando ela pasta: os quadris da frente acompanham
      const quadril = altQuadril - Math.sin(o.corpo.rotation.x) * z;
      const [r1, r2] = pernaDeBicho(dz * anda, -quadril + sobe * anda, COXA, CANELA, dobra);
      o[n + '1'].rotation.x = r1 - o.corpo.rotation.x; o[n + '2'].rotation.x = r2;
    }

    // pescoço e cabeça: olha em volta, acena com o passo, desce para pastar, vira para trás na ordenha
    const vaga = 0.2 * Math.sin(t * 0.31 + 1) + 0.12 * Math.sin(t * 0.83);
    const arranca = pasta * Math.max(0, espasmo(t, 1.45, 0, 9, 5)); // de vez em quando arranca o capim com um puxão
    const esticada = estic.passo(mugido, dt);
    o.pescoco.rotation.set(
      1.72 * suave(pasta) - 0.1 * arranca + 0.045 * anda * Math.sin(2 * f2 + 0.9) + 0.02 * Math.sin(t * 1.9 + 1) - 0.42 * esticada - 0.1 * olha,
      (1 - pasta) * (1 - anda) * (vaga * (1 - olha) - 0.36 * olha) + 0.05 * pasta * Math.sin(t * 2.9),
      0,
    );
    o.cabeca.rotation.set(-0.4 * suave(pasta) + 0.1 * arranca + 0.03 * Math.sin(t * 1.3) - 0.2 * esticada + 0.12 * olha, (1 - pasta) * (1 - anda) * (vaga * 0.6 * (1 - olha) - 0.3 * olha), 0.07 * pasta * Math.sin(t * 2.9 + 1) - 0.12 * olha);
    // mandíbula: mastiga de lado; abre no mugido
    const m = Math.sin(t * 6.4);
    o.mandibula.rotation.set(0.16 * mastiga * Math.max(0, m) + 0.5 * mugido, 0.1 * mastiga * Math.sin(t * 3.2), 0);
    o.mandibula.position.x = 0.012 * mastiga * Math.sin(t * 3.2);
    // orelhas: cada uma espanta a mosca no seu tempo; caem um pouco quando ela pasta
    o.orelhaE.rotation.set(0, 0.5 * espasmo(t, 3.1, 0.4), -0.2 * pasta + 0.45 * espasmo(t, 3.1, 0.4) + 0.2 * mugido);
    o.orelhaD.rotation.set(0, -0.5 * espasmo(t, 4.3, 1.9), 0.2 * pasta - 0.45 * espasmo(t, 4.3, 1.9) - 0.2 * mugido);
    // rabo: balança devagar, cada pedaço atrasado em relação ao de cima, e dá uma chicotada de vez em quando
    const chicote = espasmo(t, 4.7, 2.2, 15, 3.2) * (e === 'ordenhada' ? 1.5 : 1), bal = 0.16 + 0.1 * olha;
    o.rabo1.rotation.set(0.06 + 0.1 * anda, 0, bal * Math.sin(t * 2.1) + 0.5 * chicote + 0.08 * anda * Math.sin(f2));
    o.rabo2.rotation.set(-0.04, 0, bal * 1.5 * Math.sin(t * 2.1 - 0.7) + 0.7 * espasmo(t - 0.07, 4.7, 2.2, 15, 3.2) + 0.1 * anda * Math.sin(f2 - 0.6));
    o.rabo3.rotation.set(-0.04, 0, bal * 1.8 * Math.sin(t * 2.1 - 1.4) + 0.8 * espasmo(t - 0.14, 4.7, 2.2, 15, 3.2) + 0.12 * anda * Math.sin(f2 - 1.2));

    // sinal de leite pronto
    const mostra = d.leitePronto && e !== 'ordenhada' ? 1 : 0;
    const s = v.primeira ? escSinal.por(mostra) : mostra ? escSinal.passo(1, dt) : escSinal.por(amortecer(escSinal.x, 0, 14, dt));
    sinal.visible = s > 0.03;
    sinal.scale.setScalar(Math.max(0.001, s) * 1.25);
    sinal.position.set(0, 2.0 + 0.07 * Math.sin(t * 3.4), 0.25);
    sinal.rotation.set(0.25, t * 1.6, 0);

    // ponto de mão: as tetas (acompanham o corpo)
    v.raiz.updateMatrixWorld(true);
    v.pontos.ubere.copy(v.raiz.worldToLocal(o.ubere.localToWorld(_v.set(-0.05, -0.2, 0))));
  };
  return v;
}
