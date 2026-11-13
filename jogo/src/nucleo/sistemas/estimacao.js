// Animais de estimação: o cachorro, o gato e os especiais de cash. Não têm abrigo nem comem: vivem no terreiro e andam
// atrás da personagem. São companhia, com um agrado: o toque é um afago e, uma vez por dia, o afago rende um mimo.
// O contrato está em docs/jogo/ARQUITETURA.md, seção "Animais de trabalho e de estimação".
//
//   mundo.estimacao = { semente (o estado do sorteio dos mimos: gravado), versao, bichos }
//   no próprio animal (animais.js grava o bicho inteiro): mimoDia (o dia do último mimo) e mimoN (quantos naquele dia)
// O passeio não é gravado: ao abrir o jogo eles aparecem ao lado dela.
import { registrarSistema, registrarAcao, registrarEvento } from '../registro.js';
import { Sorteio } from '../util.js';
import { cabe } from '../caminho.js';
import { filaTem } from './personagem.js';
import { darItem } from './posses.js';
import { diaDoMundo } from './diaria.js';
import { registrarFamilia, defDoAnimal, animalPorId } from './animais.js';
import { registrarGuia } from '../guia.js';
import { TOQUE, soltar, recolher, bichoSolto, irSemPisar, ficar, esperado, chaoSemPlanta } from './acompanhar.js';

const NAO = (motivo, dados, limpar) => ({ ok: false, motivo, dados, limpar });
const SIM = { ok: true };
const um = (v) => (Array.isArray(v) ? v[0] : v);

const LARGA = 2.7; // casas: parado, o bicho só sai do lugar quando ela se afasta mais que isto
const CORRE_ACIMA = 3.6, DISPARA_ACIMA = 11; // casas de distância: corridinha; disparada (ela foi longe a cavalo)
const V_ANDA = 2.3, V_CORRE = 5.6, V_DISPARA = 8.5;
const SENTA_EM = 1.4; // segundos parado até sentar
// cada bicho tem o seu cantinho perto dela (para dois não ficarem um em cima do outro)
const CANTO = [[0, 0, 1.05], [0.55, -0.4, 1.5], [-0.5, 0.5, 1.6], [0.2, 0.7, 2.1], [-0.7, -0.3, 2.3]];

// ---------- consultas ----------
const efeitoDe = (m, a) => { const d = defDoAnimal(m, a); return d && d.efeito && d.efeito.tipo === 'mimo' ? d.efeito : null; };
// quantos mimos por dia este bicho dá: o menor entre o dele (efeito.porDia) e o da regra geral (regras.estimacao.mimosPorDia)
function mimosPorDia(m, a) {
  const ef = efeitoDe(m, a), R = m.dados.bruto && m.dados.bruto.regras && m.dados.bruto.regras.estimacao;
  if (!ef || !Array.isArray(ef.sorteia) || !ef.sorteia.length) return 0;
  const dele = ef.porDia >= 0 ? ef.porDia : 1, geral = R && R.mimosPorDia >= 0 ? R.mimosPorDia : 1;
  return Math.min(dele, geral);
}
// o afago de agora ainda rende mimo?
export function temMimo(m, a) {
  const n = mimosPorDia(m, a);
  return n > 0 && (a.mimoDia === diaDoMundo(m) ? a.mimoN || 0 : 0) < n;
}
// os bichos de estimação que o jogador tem: [{ id, animal, nome, mimo }]
export function bichosDeEstimacao(m) {
  return m.estimacao.bichos.map((a) => ({ id: a.id, animal: a.especie, nome: defDoAnimal(m, a).nome, mimo: temMimo(m, a) }));
}
// a espécie cuja figura o bicho usa se a dele não existir: o comum que faz o mesmo (o siamês usa a do gato)
function figuraDe(m, a) {
  const D = m.dados.animais, d = D[a.especie];
  if (!d || !d.especial) return a.especie;
  const efeito = JSON.stringify(d.efeito || 1);
  return Object.keys(D).find((k) => k !== a.especie && !D[k].especial && D[k].familia === d.familia && JSON.stringify(D[k].efeito || 1) === efeito) || a.especie;
}

// ---------- o afago ----------
registrarAcao({
  id: 'afagar', dur: 1.2, efeitoEm: 0.7, estadoVisual: 'afagar',
  pode(m, alvo) {
    const e = m.local.porId[alvo.entidade];
    return e && e.familia === 'estimacao' && animalPorId(m, e.animal) ? SIM : NAO('nao-existe');
  },
  aoEfeito(m, alvo) {
    const E = m.estimacao, e = m.local.porId[alvo.entidade], a = animalPorId(m, e.animal);
    e.feliz = 1.6; // o bicho festeja (o desenho usa)
    m.eventos.emitir('afagou', { animal: a.especie, id: a.id, entidade: e.id });
    if (!temMimo(m, a)) return;
    // o mimo do dia: um dos sorteios do bicho (a semente fica gravada: o mesmo jogo dá sempre os mesmos mimos)
    const lista = efeitoDe(m, a).sorteia, s = new Sorteio(E.semente), mimo = lista[s.inteiro(0, lista.length - 1)], hoje = diaDoMundo(m);
    E.semente = s.a >>> 0;
    a.mimoN = (a.mimoDia === hoje ? a.mimoN || 0 : 0) + 1; a.mimoDia = hoje;
    for (const item in mimo) {
      if (!m.dados.itens[item] || !(mimo[item] > 0)) continue;
      darItem(m, item, mimo[item], 'mimo');
      m.eventos.emitir('ganhouMimo', { animal: a.especie, id: a.id, item, n: mimo[item], entidade: e.id });
    }
  },
});
// o toque no bicho é o afago (quantas vezes quiser; o mimo é que é um por dia)
TOQUE.estimacao = (m, e) => {
  const a = animalPorId(m, e.animal);
  if (!a) return null;
  const p = m.personagem, serve = (t) => t && t.tipo === 'agir' && t.acao === 'afagar' && t.entidade === e.id;
  if (serve(p.tarefa) || p.fila.some(serve)) return { acao: null, texto: 'na-fila' };
  return { acao: 'afagar', dados: { animal: a.especie, mimo: temMimo(m, a) } };
};

// ---------- o passeio ----------
function passear(m, loc, chao, p, e, k) {
  if (e.feliz > 0) e.feliz -= 1 / 60;
  const c = CANTO[k % CANTO.length], d = Math.hypot(p.x - e.x - 0.5, p.z - e.z - 0.5);
  if (esperado(m, e) || (!e.indo && d < LARGA + c[2] - 1)) { // ela vem fazer um afago, ou está por perto: fica
    ficar(e); e.indo = false;
    e.estado = e.parado > SENTA_EM && !(e.feliz > 0) ? 'sentado' : 'parada';
    return;
  }
  // vai para o cantinho dele perto dela; se ela está no meio da lavoura, para a beira (não pisa em planta de propósito)
  const naLavoura = !!loc.plantas[Math.floor(p.z) * loc.l + Math.floor(p.x)];
  e.indo = irSemPisar(m, e, naLavoura ? p.x : p.x + c[0], naLavoura ? p.z : p.z + c[1], c[2], d > DISPARA_ACIMA ? V_DISPARA : d > CORRE_ACIMA ? V_CORRE : V_ANDA);
  e.estado = e.vel > 3.6 ? 'correr' : e.vel > 0.25 ? 'andar' : 'parada';
}
// um lugar livre ao lado dela para o bicho aparecer
function aoLadoDela(m, p, k, out) {
  const loc = m.locais.fazenda, chao = chaoSemPlanta(m);
  const x0 = p.local === 'fazenda' ? p.x : (m.dados.terras.pontos.personagem || [p.x, p.z])[0], z0 = p.local === 'fazenda' ? p.z : (m.dados.terras.pontos.personagem || [p.x, p.z])[1];
  out[0] = x0; out[1] = z0;
  for (let j = 0; j < 12; j++) {
    const a = (j + k * 3) * 2.4, r = 1 + 0.25 * j, x = x0 + Math.sin(a) * r, z = z0 + Math.cos(a) * r;
    if (loc.dentro(Math.floor(x), Math.floor(z)) && cabe(chao, x, z)) { out[0] = x; out[1] = z; return out; }
  }
  return out;
}
const pt = [0, 0];
// a lista de bichos mudou (compra, entrega do cash, gravação aberta): cada um ganha o seu lugar no terreiro
function conferir(m) {
  const E = m.estimacao, loc = m.locais.fazenda, p = m.personagem;
  E.versao = m.animais.versao;
  E.bichos = m.animais.lista.filter((a) => a.familia === 'estimacao');
  for (const e of [...loc.entidades]) if (e.tipo === 'bicho' && e.familia === 'estimacao' && !E.bichos.some((a) => a.id === e.animal)) loc.tirar(e.id);
  E.bichos.forEach((a, k) => {
    if (bichoSolto(m, a.id)) return;
    aoLadoDela(m, p, k, pt);
    soltar(m, a, pt[0], pt[1], { tipo: 'bicho', figura: figuraDe(m, a), estado: 'parada', feliz: 0, bx: -1, bz: -1, beiraEm: 0, indo: false });
  });
}

registrarFamilia('estimacao', {
  podeComprar: () => SIM, // não pede abrigo, apetrecho nem comida
  aoChegar(m) { if (m.estimacao) m.estimacao.versao = -1; },
  aoCarregar(m) { if (m.estimacao) m.estimacao.versao = -1; },
  aoSair(m, a) { if (m.estimacao) m.estimacao.versao = -1; recolher(m, a.id); },
});

// ---------- eventos que missões e conquistas escutam ----------
const haEstimacao = (dados) => !!dados.animais && Object.values(dados.animais).some((d) => d.familia === 'estimacao');
registrarEvento('afagou', { campos: ['animal', 'id', 'entidade'], aceita: (dados) => haEstimacao(dados) });
registrarEvento('ganhouMimo', { campos: ['animal', 'id', 'item', 'n', 'entidade'], aceita: (dados) => haEstimacao(dados) });

// ---------- o guia das missões ----------
// "adote um bicho de estimação" (missão "companheiro"): a aba "Animais" da loja, no bicho mais barato que já dá para comprar
registrarGuia('comprou', (m, f, out) => {
  if (f.animal !== undefined || um(f.familia) !== 'estimacao') return null;
  let melhor = null;
  for (const d of Object.values(m.dados.animais)) if (d.familia === 'estimacao' && d.preco.ouro > 0 && d.nivel <= m.progresso.nivel && (!melhor || d.preco.ouro < melhor.preco.ouro)) melhor = d;
  out.tipo = 'painel'; out.painel = 'animais'; out.item = melhor ? melhor.id : null;
  return out;
});
// afagar: o bicho mais perto dela (de preferência o que tem mimo)
function guiaDoAfago(m, f, out) {
  const p = m.personagem;
  let melhor = Infinity;
  out.tipo = null;
  if (p.local !== 'fazenda' || filaTem(m, 'afagar')) return out;
  for (const a of m.estimacao.bichos) {
    if (f.animal !== undefined && ![].concat(f.animal).includes(a.especie)) continue;
    const e = bichoSolto(m, a.id);
    if (!e) continue;
    const d = Math.hypot(e.x + 0.5 - p.x, e.z + 0.5 - p.z) + (temMimo(m, a) ? 0 : 100);
    if (d < melhor) { melhor = d; out.tipo = 'entidade'; out.id = e.id; }
  }
  return out;
}
registrarGuia('afagou', guiaDoAfago);
registrarGuia('ganhouMimo', guiaDoAfago);

registrarSistema({
  id: 'estimacao',
  iniciar(m) {
    m.estimacao = { semente: (m.sorteio.a ^ 0x2f6b9d4e) >>> 0, versao: -1, bichos: [] };
  },

  passo(m) {
    const E = m.estimacao;
    if (E.versao !== m.animais.versao) conferir(m);
    const B = E.bichos;
    if (!B.length) return;
    const p = m.personagem, loc = m.locais.fazenda, fora = p.local === 'fazenda', chao = chaoSemPlanta(m);
    for (let k = 0; k < B.length; k++) {
      const e = bichoSolto(m, B[k].id);
      if (!e) continue;
      if (fora) passear(m, loc, chao, p, e, k);
      else { ficar(e); e.indo = false; e.estado = e.parado > SENTA_EM ? 'sentado' : 'parada'; } // ela entrou no celeiro: esperam do lado de fora
    }
  },

  salvar(m) { return { semente: m.estimacao.semente >>> 0 }; },
  // gravação de antes desta frente não traz este sistema: vale o que iniciar() montou
  carregar(m, d) {
    if (Number.isFinite(d.semente)) m.estimacao.semente = d.semente >>> 0;
    m.estimacao.versao = -1;
  },
});
