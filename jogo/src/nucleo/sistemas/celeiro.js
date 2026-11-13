// O celeiro visto de fora (M1): um toque guarda o que está no cesto; com o cesto vazio, um toque pega de volta
// (para vender). É nele que fica o suporte de ferramentas: a personagem vai até ele buscar a que não está no cinto.
// A casa também mora aqui, por enquanto só como construção.
import { registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { somar } from '../util.js';
import { noCesto, espacoNoCesto, noCeleiro, espacoNoCeleiro, ferramentaNoCinto, ferramentaNoSuporte, pegarDoSuporte } from './posses.js';
import { filaTem } from './personagem.js';

registrarAcao({
  id: 'guardar', dur: 0.9, efeitoEm: 0.5, estadoVisual: 'entregar',
  pode(m) {
    if (!(noCesto(m) > 0)) return { ok: false, motivo: 'cesto-vazio' };
    if (!(espacoNoCeleiro(m) > 0)) return { ok: false, motivo: 'celeiro-cheio' };
    return { ok: true };
  },
  aoEfeito(m, alvo) {
    const c = m.posses.cesto.itens, cel = m.posses.celeiro.itens, itens = {};
    let cabe = espacoNoCeleiro(m), n = 0;
    for (const item in c) {
      const vai = Math.min(c[item], cabe);
      if (vai <= 0) break;
      somar(c, item, -vai); somar(cel, item, vai);
      itens[item] = vai; cabe -= vai; n += vai;
    }
    m.eventos.emitir('guardou', { itens, n, entidade: alvo.entidade });
    if (noCesto(m) > 0) m.eventos.emitir('faltou', { motivo: 'celeiro-cheio', entidade: alvo.entidade });
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
    m.eventos.emitir('pegou', { itens, n, entidade: alvo.entidade });
  },
});

registrarAcao({
  id: 'pegarFerramenta', dur: 0.8, efeitoEm: 0.5, estadoVisual: 'entregar',
  pode(m, alvo, args) {
    if (ferramentaNoCinto(m, args.funcao)) return { ok: true }; // já está com ela: a ação vira só uma passada no celeiro
    return ferramentaNoSuporte(m, args.funcao) ? { ok: true } : { ok: false, motivo: 'sem-ferramenta', dados: { funcao: args.funcao } };
  },
  aoEfeito(m, alvo, args) {
    const id = ferramentaNoSuporte(m, args.funcao);
    if (!id || ferramentaNoCinto(m, args.funcao)) return;
    const r = pegarDoSuporte(m, id);
    if (r) m.eventos.emitir('pegouFerramenta', { item: r.item, guardou: r.guardou, entidade: alvo.entidade });
  },
});

registrarTipo({
  tipo: 'celeiro', casas: [5, 4], bloqueia: true, suporte: true,
  pontos: { ficar: (e) => [[e.l / 2, e.p + 0.5]] }, // diante da porta, no meio da face de +Z (a que olha para a câmera, à esquerda)
  acaoPossivel(m) {
    if (noCesto(m) > 0 || filaTem(m, 'colher')) return espacoNoCeleiro(m) > 0 ? { acao: 'guardar', dados: { n: noCesto(m), livre: espacoNoCeleiro(m) } } : { acao: null, texto: 'celeiro-cheio' };
    if (noCeleiro(m) > 0) return { acao: 'pegar', dados: { n: noCeleiro(m) } };
    return { acao: null, texto: 'celeiro-vazio' };
  },
});

registrarTipo({
  tipo: 'casa', casas: [4, 3], bloqueia: true,
  pontos: { ficar: (e) => [[e.l / 2, e.p + 0.5]] },
  acaoPossivel: () => ({ acao: null, texto: 'sua-casa' }),
});

registrarEvento('guardou', { campos: ['itens', 'n', 'entidade'] });
registrarEvento('pegou', { campos: ['itens', 'n', 'entidade'] });
registrarEvento('pegouFerramenta', { campos: ['item', 'guardou', 'entidade'] });
