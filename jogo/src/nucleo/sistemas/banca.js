// A banca na porteira: sempre compra, pelo preço base de cada item (campo "venda" de itens.json).
import { registrarAcao, registrarTipo, registrarEvento } from '../registro.js';
import { ganharOuro, noCesto, valorDoCesto, cestoECargas, naCarga, valorDaCarga } from './posses.js';
import { filaTem } from './personagem.js';

registrarAcao({
  id: 'vender', dur: 1.0, efeitoEm: 0.6, estadoVisual: 'entregar',
  pode(m) { return noCesto(m) + naCarga(m) > 0 ? { ok: true } : { ok: false, motivo: 'cesto-vazio' }; },
  aoEfeito(m, alvo) {
    let totalOuro = 0, totalItens = 0;
    for (const c of cestoECargas(m)) for (const item in c) { // o cesto e o que veio na carroça
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
    if (noCesto(m) + naCarga(m) > 0 || filaTem(m, 'colher') || filaTem(m, 'pegar')) return { acao: 'vender', dados: { ouro: valorDoCesto(m) + valorDaCarga(m), n: noCesto(m) + naCarga(m) } };
    return { acao: null, texto: 'cesto-vazio' };
  },
});

registrarEvento('vendeu', { campos: ['item', 'n', 'ouro', 'entidade'] });
registrarEvento('vendeuTudo', { campos: ['n', 'ouro', 'entidade'] });
