// O celeiro visto de fora (M1): um toque guarda o que está no cesto; com o cesto vazio, um toque pega de volta
// (para vender). É nele que fica o suporte de ferramentas: a personagem vai até ele buscar a que não está no cinto
// (a que tem lugar no sítio, como o regador velho ao lado do poço, ela busca lá: sistemas/lugares.js).
// A casa também mora aqui, por enquanto só como construção.
import { registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { somar } from '../util.js';
import { noCesto, espacoNoCesto, noCeleiro, espacoNoCeleiro, ferramentaNoCinto, ferramentaNoSuporte, pegarGuardada, cestoECargas, naCarga } from './posses.js';
import { filaTem } from './personagem.js';

// antes do celeiro (o começo humilde), o estoque é o baú ao lado da casa: cheio, a saída é vender no caixote
const temCeleiro = (m) => !!m.construcao && m.construcao.todas.some((e) => e.tipo === 'celeiro' && e.local === 'fazenda' && !(e.obraAte > 0));
export const motivoDoCheio = (m) => (temCeleiro(m) ? 'celeiro-cheio' : 'bau-sem-espaco');
const tipoDoAlvo = (m, alvo) => { const e = alvo && alvo.entidade !== undefined ? m.local.porId[alvo.entidade] : null; return e ? e.tipo : null; };

registrarAcao({
  id: 'guardar', dur: 0.9, efeitoEm: 0.5, estadoVisual: 'entregar',
  pode(m) {
    if (!(noCesto(m) + naCarga(m) > 0)) return { ok: false, motivo: 'cesto-vazio' };
    if (!(espacoNoCeleiro(m) > 0)) return { ok: false, motivo: motivoDoCheio(m) };
    return { ok: true };
  },
  aoEfeito(m, alvo) {
    const cel = m.posses.celeiro.itens, itens = {};
    let cabe = espacoNoCeleiro(m), n = 0;
    for (const c of cestoECargas(m)) for (const item in c) { // o cesto e o que veio na carroça
      const vai = Math.min(c[item], cabe);
      if (vai <= 0) break;
      somar(c, item, -vai); somar(cel, item, vai);
      somar(itens, item, vai); cabe -= vai; n += vai;
    }
    m.eventos.emitir('guardou', { itens, n, entidade: alvo.entidade, construcao: tipoDoAlvo(m, alvo) });
    // (a colheita nunca se perde: o que não coube fica no cesto, e o aviso diz onde vender)
    if (noCesto(m) + naCarga(m) > 0) m.eventos.emitir('faltou', { motivo: motivoDoCheio(m), entidade: alvo.entidade });
  },
});

registrarAcao({
  id: 'pegar', dur: 0.9, efeitoEm: 0.5, estadoVisual: 'entregar',
  pode(m) {
    if (!(noCeleiro(m) > 0)) return { ok: false, motivo: 'celeiro-vazio' };
    if (!(espacoNoCesto(m) > 0)) return { ok: false, motivo: 'cesto-cheio' };
    return { ok: true };
  },
  aoEfeito(m, alvo) {
    const c = m.posses.cesto.itens, cel = m.posses.celeiro.itens, itens = {};
    let cabe = espacoNoCesto(m), n = 0;
    for (const item in cel) {
      if (!(m.dados.itens[item].venda > 0)) continue; // só o que a banca compra
      const vai = Math.min(cel[item], cabe);
      if (vai <= 0) break;
      somar(cel, item, -vai); somar(c, item, vai);
      itens[item] = vai; cabe -= vai; n += vai;
    }
    m.eventos.emitir('pegou', { itens, n, entidade: alvo.entidade, construcao: tipoDoAlvo(m, alvo) });
  },
});

// pegar a ferramenta guardada: no suporte do celeiro (ou no móvel, lá dentro) ou no lugar dela no sítio (sistemas/lugares.js).
// args = { funcao, item }: "item" é a que ela foi buscar (sem ele, a melhor do suporte)
const qualPegar = (m, args) => (args.item && m.posses.ferramentas[args.item] && m.posses.ferramentas[args.item].onde !== 'cinto' ? args.item : ferramentaNoSuporte(m, args.funcao));
registrarAcao({
  id: 'pegarFerramenta', dur: 0.8, efeitoEm: 0.5, estadoVisual: 'entregar',
  pode(m, alvo, args) {
    if (ferramentaNoCinto(m, args.funcao)) return { ok: true }; // já está com ela: a ação vira só uma passada
    return qualPegar(m, args) ? { ok: true } : { ok: false, motivo: 'sem-ferramenta', dados: { funcao: args.funcao } };
  },
  aoEfeito(m, alvo, args) {
    if (ferramentaNoCinto(m, args.funcao)) return;
    const id = qualPegar(m, args);
    const r = id && pegarGuardada(m, id);
    if (r) m.eventos.emitir('pegouFerramenta', { item: r.item, guardou: r.guardou, entidade: alvo.entidade, lugar: r.de === 'lugar' });
  },
});

// o toque no celeiro (e no baú do começo): com o cesto cheio, guarda; vazio, pega de volta o que se vende
function guardarOuPegar(m) {
  if (noCesto(m) + naCarga(m) > 0 || filaTem(m, 'colher')) return espacoNoCeleiro(m) > 0 ? { acao: 'guardar', dados: { n: noCesto(m) + naCarga(m), livre: espacoNoCeleiro(m) } } : { acao: null, texto: motivoDoCheio(m) };
  if (noCeleiro(m) > 0) return { acao: 'pegar', dados: { n: noCeleiro(m) } };
  return { acao: null, texto: temCeleiro(m) ? 'celeiro-vazio' : 'bau-vazio' };
}
registrarTipo({
  tipo: 'celeiro', casas: [5, 4], bloqueia: true, suporte: true,
  pontos: { ficar: (e) => [[e.l / 2, e.p + 0.5]] }, // diante da porta, no meio da face de +Z (a que olha para a câmera, à esquerda)
  acaoPossivel: guardarOuPegar,
});
// O baú do começo humilde, ao lado da casa: o estoque pequeno de antes do celeiro (a capacidade é a de
// construcoes.json, somada à das prateleiras quando o celeiro fica pronto: celeiro-dentro.js). É também onde ficam
// as ferramentas sem lugar no sítio enquanto não há celeiro (a foice que o Seu Tonho dá, o regador de lata).
registrarTipo({
  tipo: 'bau-da-casa', casas: [2, 1], bloqueia: true, suporte: true, altura: 1.2,
  pontos: { ficar: (e) => [[e.l / 2, e.p + 0.55]] },
  acaoPossivel: guardarOuPegar,
  visual(m, e, v) { v.chave = 'objeto/bau'; v.variante = 0; return v; },
});

registrarTipo({
  tipo: 'casa', casas: [4, 3], bloqueia: true,
  pontos: { ficar: (e) => [[e.l / 2, e.p + 0.5]] },
  acaoPossivel: () => ({ acao: null, texto: 'sua-casa' }),
});
// a casa velha do começo humilde: a mesma base e o mesmo quadro da casa (a reforma troca uma pela outra)
registrarTipo({
  tipo: 'casa-velha', casas: [4, 3], bloqueia: true,
  pontos: { ficar: (e) => [[e.l / 2, e.p + 0.5]] },
  acaoPossivel: () => ({ acao: null, texto: 'casa-velha' }),
});

registrarEvento('guardou', { campos: ['itens', 'n', 'entidade', 'construcao'] });
registrarEvento('pegou', { campos: ['itens', 'n', 'entidade', 'construcao'] });
registrarEvento('pegouFerramenta', { campos: ['item', 'guardou', 'entidade', 'lugar'] });
