// O campo de plantação e como ele cresce. A terra boa de plantar é a do campo (chão CAMPO ou ARADA): a enxada e o boi
// só aram ali (lavoura.js: podeArar). Para plantar mais, o jogador PREPARA A TERRA: a fileira de grama encostada no
// campo (as casas ao lado de uma fileira do campo, do mesmo comprimento dela) vira campo, com um pouco de ouro e
// adubo. Ela vai até lá e trabalha uns segundos (capina e espalha o adubo); com o boi, mais rápido; com o arado de
// ferro, mais ainda. Nunca casa por casa: a fileira inteira de uma vez.
// O tamanho máximo do campo cresce com o nível (regras.json "campo.limite"). A regra vale para a fazenda que tem campo
// demarcado nos dados (terras.json inicial.campo, como o jogo de verdade); sem ele (os dados pequenos dos testes
// antigos), a enxada ara a grama como antes e não há o que preparar.
//
//   regras.json "campo": { limite: [{ nivel, casas }...], preparo: { ouroPorCasa, aduboPorCasa, item, segPorCasa,
//                          comBoi, comAradoDeFerro, fileira } }
//
// Para a interface (as ações por toque, sistemas/acoes.js, ligam no toque, no balão e na roda):
//   preparoNaCasa(m, x, z)  o que o toque na grama (x, z) faria (só lê): null | { acao: 'prepararTerra', comando, casas,
//                           dados: { n, ouro, adubo, seg, restam, limite } } | { acao: null, texto, dados, casas, falta | info }
//   estadoDoCampo(m)        { casas, limite, restam, proximo: { nivel, casas } | null, porCasa: { ouro, adubo }, fileira }
//   avisarForaDoCampo(m, x, z)  o aviso "aqui não é terra de plantio", uma vez por sessão (devolve true se avisou)
// Comando prepararTerra { x, z }: enfileira a tarefa (cobra no fim do trabalho; a fila reserva o ouro e o adubo).
// Evento preparou { n, x, z }: a fileira virou campo (a missão "ampliar-o-campo").
import { registrarSistema, registrarAcao, registrarEvento } from '../registro.js';
import { GRAMA, CAMPO, deLavoura } from '../local.js';
import { campoInicial } from './terras.js';
import { quantoTem, gastarItens, gastarOuro } from './posses.js';
import { enfileirar } from './personagem.js';
import { registrarGuia } from '../guia.js';
import * as TRABALHO from './trabalho.js'; // o boi e o arado (lido na hora: trabalho.js carrega depois deste)

const VIZINHAS = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // primeiro em Z (a fileira nova corre ao longo de X, como os sulcos)
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v) => typeof v === 'number' && isFinite(v);

// ---------- as regras (lidas uma vez por conjunto de dados) ----------
const REGRAS = new WeakMap();
export function regrasDoCampo(D) {
  let r = REGRAS.get(D);
  if (r) return r;
  const C = D.bruto && obj(D.bruto.regras) && obj(D.bruto.regras.campo) ? D.bruto.regras.campo : {}, P = obj(C.preparo) ? C.preparo : {};
  const limite = (Array.isArray(C.limite) ? C.limite : [])
    .filter((e) => obj(e) && num(e.nivel) && num(e.casas) && e.casas >= 0)
    .map((e) => ({ nivel: Math.max(1, Math.round(e.nivel)), casas: Math.round(e.casas) }))
    .sort((a, b) => a.nivel - b.nivel);
  const item = typeof P.item === 'string' ? P.item : 'adubo';
  r = {
    limite, // [] = sem limite
    ouroPorCasa: num(P.ouroPorCasa) && P.ouroPorCasa >= 0 ? P.ouroPorCasa : 0,
    item: D.itens[item] ? item : null,
    aduboPorCasa: D.itens[item] && num(P.aduboPorCasa) && P.aduboPorCasa >= 0 ? P.aduboPorCasa : 0,
    segPorCasa: num(P.segPorCasa) && P.segPorCasa > 0 ? P.segPorCasa : 1.2,
    comBoi: num(P.comBoi) && P.comBoi > 0 ? P.comBoi : 0.6,
    comAradoDeFerro: num(P.comAradoDeFerro) && P.comAradoDeFerro > 0 ? P.comAradoDeFerro : 0.4,
    fileira: num(P.fileira) && P.fileira >= 1 ? Math.round(P.fileira) : 6, // a fileira do campo vazio (sem vizinha)
  };
  REGRAS.set(D, r);
  return r;
}
// a regra "arar só no campo" vale nesta fazenda? (há campo demarcado nos dados)
export const soNoCampo = (m) => !!campoInicial(m);

// ---------- o tamanho e o limite ----------
// quantas casas de campo (sem sulco, aradas ou plantadas) a fazenda tem. A conta se refaz quando o chão muda.
export function tamanhoDoCampo(m) {
  const C = m.campo;
  if (C.tamanho >= 0) return C.tamanho;
  const loc = m.locais.fazenda;
  let n = 0;
  for (let i = 0; i < loc.chao.length; i++) if (deLavoura(loc.chao[i])) n++;
  return (C.tamanho = n);
}
// o maior campo que o nível deixa ter (Infinity sem tabela)
export function limiteDoCampo(m, nivel = m.progresso.nivel) {
  const L = regrasDoCampo(m.dados).limite;
  if (!L.length) return Infinity;
  let c = L[0].casas;
  for (const e of L) if (e.nivel <= nivel) c = Math.max(c, e.casas);
  return c;
}
// o próximo degrau da tabela: { nivel, casas } (o primeiro nível acima do atual que deixa o campo maior) ou null
export function proximoLimite(m, nivel = m.progresso.nivel) {
  const agora = limiteDoCampo(m, nivel);
  for (const e of regrasDoCampo(m.dados).limite) if (e.nivel > nivel && e.casas > agora) return { nivel: e.nivel, casas: e.casas };
  return null;
}
// o custo de preparar n casas: { ouro, itens: { adubo: k } } (o campo vazio, sem vizinha, sai de graça: ninguém trava)
export function custoDoPreparo(m, n) {
  const R = regrasDoCampo(m.dados), itens = {};
  if (tamanhoDoCampo(m) === 0) return { ouro: 0, itens };
  if (R.item && R.aduboPorCasa > 0) itens[R.item] = Math.ceil(n * R.aduboPorCasa - 1e-9);
  return { ouro: Math.ceil(n * R.ouroPorCasa - 1e-9), itens };
}
// quantos segundos de trabalho para preparar n casas: mais rápido com o boi pronto; mais ainda com o arado de ferro
export function segundosDoPreparo(m, n) {
  const R = regrasDoCampo(m.dados);
  return n * R.segPorCasa * ajuda(m, R);
}
function ajuda(m, R = regrasDoCampo(m.dados)) {
  const boi = TRABALHO.pronto && TRABALHO.pronto(m, 'arar');
  if (!boi) return 1;
  const a = TRABALHO.apetrechoDe(m, boi);
  return a && a.degrau >= 2 ? R.comAradoDeFerro : R.comBoi;
}
// o que os preparos da fila já prometem: { casas: Set de índices, ouro, adubo } (para descontar do limite e do bolso)
function prometido(m) {
  const p = m.personagem, out = { casas: new Set(), ouro: 0, adubo: 0 }, R = regrasDoCampo(m.dados);
  const loc = m.locais.fazenda;
  const conta = (t) => {
    if (!t || t.tipo !== 'agir' || t.acao !== 'prepararTerra' || !t.args || !Array.isArray(t.args.casas)) return;
    const c = custoDoPreparo(m, t.args.casas.length);
    out.ouro += c.ouro; out.adubo += (R.item && c.itens[R.item]) || 0;
    for (const [x, z] of t.args.casas) out.casas.add(z * loc.l + x);
  };
  if (!(p.acao && p.acao.feito)) conta(p.tarefa);
  for (const t of p.fila) conta(t);
  return out;
}
// tudo o que a interface mostra de uma vez
export function estadoDoCampo(m) {
  const R = regrasDoCampo(m.dados), casas = tamanhoDoCampo(m), limite = limiteDoCampo(m), pr = prometido(m);
  const n = R.fileira, c = custoDoPreparo(m, n);
  return {
    casas, limite, prometidas: pr.casas.size, restam: Math.max(0, limite - casas - pr.casas.size), proximo: proximoLimite(m),
    porCasa: { ouro: R.ouroPorCasa, adubo: R.aduboPorCasa }, item: R.item,
    fileira: { n, ouro: c.ouro, itens: c.itens, seg: segundosDoPreparo(m, n) },
  };
}

// ---------- a fileira para preparar ----------
// a casa (x, z) é grama que dá para virar campo? (própria, livre, sem planta)
function gramaLivre(loc, x, z) {
  if (!loc.dentro(x, z)) return false;
  const i = z * loc.l + x;
  return loc.chao[i] === GRAMA && loc.propria[i] === 1 && !loc.ocupa[i] && !loc.plantas[i];
}
// A fileira de grama que um toque em (x, z) prepara, antes do limite: a casa encosta no campo de um lado (em Z: a fileira
// nova corre ao longo de X; só em X, na ponta das fileiras: a coluna nova corre ao longo de Z). Ela copia o comprimento
// da fileira vizinha do campo (as casas de campo seguidas, na linha ao lado, que passam pela casa tocada) e pega dessas
// as de grama livre seguidas a partir da tocada. Sem campo nenhum: a fileira de "fileira" casas ao longo de X.
// Devolve { casas: [[x, z]...] em ordem ao longo do eixo, eixo: 'x' | 'z' } ou null.
function fileiraCrua(m, loc, x, z, ja) {
  if (!gramaLivre(loc, x, z) || ja.has(z * loc.l + x)) return null;
  const serve = (cx, cz) => gramaLivre(loc, cx, cz) && !ja.has(cz * loc.l + cx);
  if (tamanhoDoCampo(m) === 0) {
    const n = regrasDoCampo(m.dados).fileira, out = [[x, z]];
    for (let k = 1; out.length < n && serve(x + k, z); k++) out.push([x + k, z]);
    for (let k = 1; out.length < n && serve(x - k, z); k++) out.unshift([x - k, z]);
    return { casas: out, eixo: 'x' };
  }
  for (const [dx, dz] of VIZINHAS) {
    const vx = x + dx, vz = z + dz;
    if (!deLavoura(loc.chaoEm(vx, vz))) continue;
    const ax = dz !== 0 ? 1 : 0, az = 1 - ax; // o eixo da fileira: X se a vizinha está em Z
    // a fileira vizinha do campo: de a até b ao longo do eixo, passando pela vizinha
    let a = 0, b = 0;
    while (deLavoura(loc.chaoEm(vx + ax * (a - 1), vz + az * (a - 1)))) a--;
    while (deLavoura(loc.chaoEm(vx + ax * (b + 1), vz + az * (b + 1)))) b++;
    // na linha da casa tocada, as de grama livre seguidas a partir dela, sem passar das pontas da vizinha
    let i0 = 0, i1 = 0;
    while (i0 - 1 >= a && serve(x + ax * (i0 - 1), z + az * (i0 - 1))) i0--;
    while (i1 + 1 <= b && serve(x + ax * (i1 + 1), z + az * (i1 + 1))) i1++;
    const casas = [];
    for (let k = i0; k <= i1; k++) casas.push([x + ax * k, z + az * k]);
    return { casas, eixo: ax ? 'x' : 'z' };
  }
  return null;
}
// corta a fileira em n casas, numa janela que contém a tocada (a ponta de menor X/Z quando ela cabe)
function cortar(casas, x, z, n) {
  if (casas.length <= n) return casas;
  const k = casas.findIndex(([cx, cz]) => cx === x && cz === z);
  const ini = Math.max(0, Math.min(k, casas.length - n), k - n + 1 > 0 ? k - n + 1 : 0);
  return casas.slice(Math.min(ini, k), Math.min(ini, k) + n);
}

const NA_FILA = { acao: null, texto: 'na-fila' };
// O que o toque na grama (x, z) faria (sem fazer nada): ver o contrato no alto do arquivo.
export function preparoNaCasa(m, x, z) {
  if (!soNoCampo(m) || m.personagem.local !== 'fazenda') return null;
  const loc = m.locais.fazenda, pr = prometido(m);
  if (loc.dentro(x, z) && pr.casas.has(z * loc.l + x)) return NA_FILA;
  const f = fileiraCrua(m, loc, x, z, pr.casas);
  if (!f || !f.casas.length) return null;
  const limite = limiteDoCampo(m), restam = limite - tamanhoDoCampo(m) - pr.casas.size;
  if (restam <= 0) {
    const prox = proximoLimite(m);
    return { acao: null, texto: 'campo-no-limite', info: true, casas: f.casas, dados: { limite, casas: tamanhoDoCampo(m), nivel: prox ? prox.nivel : null, proximo: prox ? prox.casas : null } };
  }
  const casas = cortar(f.casas, x, z, restam), n = casas.length, custo = custoDoPreparo(m, n), R = regrasDoCampo(m.dados);
  const adubo = (R.item && custo.itens[R.item]) || 0;
  const dados = { n, ouro: custo.ouro, adubo, item: R.item, seg: segundosDoPreparo(m, n), restam: restam - n, limite };
  const ouroLivre = m.posses.ouro - pr.ouro;
  if (ouroLivre < custo.ouro) return { acao: null, texto: 'sem-ouro', falta: true, casas, dados: { ...dados, falta: custo.ouro - Math.max(0, ouroLivre) } };
  if (adubo > 0) {
    const tem = Math.max(0, quantoTem(m, R.item) - pr.adubo);
    if (tem < adubo) return { acao: null, texto: 'falta-material', falta: true, casas, dados: { ...dados, item: R.item, precisa: adubo, tem, falta: adubo - tem } };
  }
  return { acao: 'prepararTerra', comando: { tipo: 'prepararTerra', x, z }, casas, dados };
}

// o aviso "aqui não é terra de plantio" (tentou arar grama fora do campo), uma vez por sessão (não vai para a gravação)
export function avisarForaDoCampo(m, x, z) {
  if (m.campo.avisou || !soNoCampo(m)) return false;
  m.campo.avisou = true;
  m.eventos.emitir('faltou', { motivo: 'so-no-campo', x, z });
  return true;
}

// ---------- a ação ----------
const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
registrarAcao({
  id: 'prepararTerra', ferramenta: 'enxada', dur: 1, efeitoEm: 0.94, estadoVisual: 'enxadar',
  // segPorCasa por casa da fileira, vezes a ajuda do boi (o "dur" de regras.acoes não vale aqui: a conta é por casa)
  duracao(m, t, args) { return segundosDoPreparo(m, args && args.casas ? args.casas.length : 1); },
  pode(m, alvo, args) {
    if (m.personagem.local !== 'fazenda') return NAO('so-no-terreiro', null, true);
    const loc = m.locais.fazenda, c = args && args.casas;
    const livres = Array.isArray(c) ? c.filter(([x, z]) => gramaLivre(loc, x, z)) : [];
    if (!livres.length) return NAO('nada-para-preparar');
    const custo = custoDoPreparo(m, c.length), R = regrasDoCampo(m.dados);
    if (m.posses.ouro < custo.ouro) return NAO('sem-ouro', { falta: custo.ouro - m.posses.ouro }, true);
    const precisa = (R.item && custo.itens[R.item]) || 0, tem = R.item ? quantoTem(m, R.item) : 0;
    if (precisa > tem) return NAO('falta-material', { item: R.item, precisa, tem, falta: precisa - tem }, true);
    return { ok: true };
  },
  // no fim do trabalho: cobra (o preço das casas que ainda eram grama) e a fileira vira campo
  aoEfeito(m, alvo, args) {
    const loc = m.locais.fazenda, livres = args.casas.filter(([x, z]) => gramaLivre(loc, x, z));
    const custo = custoDoPreparo(m, livres.length);
    if (custo.ouro > 0) gastarOuro(m, custo.ouro, 'campo');
    if (Object.keys(custo.itens).length) gastarItens(m, custo.itens);
    for (const [x, z] of livres) { loc.chao[z * loc.l + x] = CAMPO; m.eventos.emitir('chaoMudou', { local: loc.id, x, z }); }
    m.eventos.emitir('preparou', { n: livres.length, x: alvo.x, z: alvo.z, casas: livres });
  },
});

registrarEvento('preparou', { campos: ['n', 'x', 'z'] });

// o guia da missão "ampliar-o-campo": a melhor fileira de grama encostada no campo, perto do ponto da lavoura
export function fileiraSugerida(m) {
  if (!soNoCampo(m)) return null;
  const loc = m.locais.fazenda, T = m.dados.terras.pontos, c = T.lavoura || T.poco || [loc.entrada[0], loc.entrada[1]];
  const pr = prometido(m);
  let melhor = null, nota = -Infinity;
  for (let z = 0; z < loc.p; z++) for (let x = 0; x < loc.l; x++) {
    if (!gramaLivre(loc, x, z) || pr.casas.has(z * loc.l + x)) continue;
    let encosta = false;
    for (const [dx, dz] of VIZINHAS) if (deLavoura(loc.chaoEm(x + dx, z + dz))) { encosta = true; break; }
    if (!encosta) continue;
    const f = fileiraCrua(m, loc, x, z, pr.casas);
    if (!f) continue;
    // a fileira mais comprida (ao longo de X primeiro), e a mais perto do ponto da lavoura
    const v = f.casas.length * 100 + (f.eixo === 'x' ? 50 : 0) - Math.hypot(x + 0.5 - c[0], z + 0.5 - c[1]);
    if (v > nota) { nota = v; melhor = { x, z, casas: f.casas }; }
  }
  return melhor;
}
registrarGuia('preparou', (m, f, out) => {
  const s = fileiraSugerida(m);
  if (!s) return null;
  out.tipo = 'casa'; out.x = s.x; out.z = s.z; out.casas = s.casas.length > 1 ? s.casas : null;
  return out;
});

registrarSistema({
  id: 'campo',
  iniciar(m) {
    m.campo = { tamanho: -1, avisou: false };
    m.eventos.ouvir('chaoMudou', () => { m.campo.tamanho = -1; });
  },
  comandos: {
    // prepararTerra { x, z }: tocou na grama encostada no campo. Confere (limite, ouro e adubo, descontando o que a fila
    // já prometeu) e põe na fila a tarefa de preparar a fileira toda; o pagamento sai no fim do trabalho.
    prepararTerra(m, c) {
      const x = Math.floor(c.x), z = Math.floor(c.z), d = preparoNaCasa(m, x, z);
      if (!d) { m.eventos.emitir('faltou', { motivo: 'nada-para-preparar', x, z }); return { ok: false, motivo: 'nada-para-preparar' }; }
      if (d.texto === 'na-fila') return { ok: true, repetida: true };
      if (!d.acao) { m.eventos.emitir(d.info ? 'informou' : 'faltou', { motivo: d.texto, dados: d.dados, x, z }); return { ok: false, motivo: d.texto, dados: d.dados }; }
      const meio = d.casas[Math.floor((d.casas.length - 1) / 2)];
      const r = enfileirar(m, { tipo: 'agir', acao: 'prepararTerra', x: meio[0], z: meio[1], args: { casas: d.casas } });
      if (r.ok && !r.repetida) m.personagem.rumando = false;
      return r.ok ? { ...r, dados: d.dados } : r;
    },
  },
});
