// A banca na porteira: sempre compra, pelo preço base de cada item (campo "venda" de itens.json).
import { registrarAcao, registrarTipo } from '../registro.js';
import { ganharOuro, noCesto, valorDoCesto } from './posses.js';
import { filaTem } from './personagem.js';

registrarAcao({
  id: 'vender', dur: 1.0, efeitoEm: 0.6, estadoVisual: 'entregar',
  pode(m) { return noCesto(m) > 0 ? { ok: true } : { ok: false, motivo: 'cesto-vazio' }; },
  aoEfeito(m, alvo) {
    const c = m.posses.cesto.itens;
    let totalOuro = 0, totalItens = 0;
    for (const item in c) {
      const n = c[item], ouro = n * m.dados.itens[item].venda;
      totalOuro += ouro; totalItens += n;
      delete c[item];
      m.eventos.emitir('vendeu', { item, n, ouro, entidade: alvo.entidade });
    }
    ganharOuro(m, totalOuro, 'banca');
    m.eventos.emitir('vendeuTudo', { n: totalItens, ouro: totalOuro, entidade: alvo.entidade });
  },
});

registrarTipo({
  tipo: 'banca', casas: [3, 2], bloqueia: true,
  acaoPossivel(m) {
    // com colheita na fila, o toque na banca já vale: quando ela chegar lá o cesto terá o que vender
    if (noCesto(m) > 0 || filaTem(m, 'colher') || filaTem(m, 'pegar')) return { acao: 'vender', dados: { ouro: valorDoCesto(m), n: noCesto(m) } };
    return { acao: null, texto: 'cesto-vazio' };
  },
  visual: () => ({ chave: 'objeto/banca' }),
});
