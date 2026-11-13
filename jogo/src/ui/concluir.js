// O botão de concluir um relógio com cash, para qualquer painel que mostre uma espera (obra, fila, muda):
//   corpo.append(botaoConcluir('obra', { entidade: e.id }))
// tipo e alvo são os do concluível registrado em nucleo/concluir.js. O botão mostra o preço de agora e se atualiza
// sozinho enquanto o relógio anda; some quando não há o que concluir. De graça (falta pouco), conclui num toque;
// pago, pergunta antes na própria página, mostrando o preço. Sem cash, só avisa: não empurra a loja.
import { el, icone, botao, por, classe } from './dom.js';
import './textos/progresso.js';
import { T, frase, numero } from './textos.js';
import { J } from '../contexto.js';
import { som } from '../plataforma/som.js';
import { avisar } from './avisos.js';
import { perguntar } from './dialogo.js';
import { consultaDeConcluir } from '../nucleo/sistemas/cash.js';

const vivos = new Set();

function pintar(b) {
  const r = consultaDeConcluir(J.mundo, b._tipo, b._alvo), d = r.dados || {};
  const some = !r.ok && (r.motivo === 'nada-a-concluir' || r.motivo === 'concluir-nao-vale');
  if (b.hidden !== some) b.hidden = some;
  if (some) return;
  const gratis = d.preco === 0;
  por(b._preco, gratis ? T.concluir.gratis : numero(d.preco || 0));
  if (b._moeda.hidden !== gratis) b._moeda.hidden = gratis;
  classe(b, 'sem', !r.ok);
}

export function botaoConcluir(tipo, alvo, opc = {}) {
  const b = botao({ icone: 'ui/concluir', tamanho: 24, texto: opc.texto || T.concluir.botao, classe: 'concluir' + (opc.classe ? ' ' + opc.classe : ''), aoClicar: () => {
    const m = J.mundo, r = consultaDeConcluir(m, tipo, alvo), d = r.dados || {};
    const fazer = () => {
      const f = m.comando({ tipo: 'concluir', relogio: tipo, alvo });
      if (!f.ok) { som.tocar('erro'); avisar(frase(f.motivo, f.dados, J.dados)); } else if (opc.aoConcluir) opc.aoConcluir(f.dados);
    };
    if (!r.ok) { som.tocar('erro'); avisar(frase(r.motivo, d, J.dados)); return; }
    if (d.preco === 0) { fazer(); return; }
    perguntar({ icone: 'ui/relogio', titulo: T.concluir.titulo, texto: T.concluir.pergunta(d.nome, d.seg, d.preco), nota: T.cash.saldo(m.posses.cash), sim: T.concluir.sim(d.preco), nao: T.concluir.nao, aoSim: fazer });
  } });
  b.dataset.k = opc.k || 'concluir-' + tipo;
  b._tipo = tipo; b._alvo = alvo;
  const preco = el('span', 'preco');
  b._moeda = icone('icone/cash', 18); b._preco = el('span');
  preco.append(b._moeda, b._preco);
  b.append(preco);
  vivos.add(b);
  pintar(b);
  return b;
}

// todo quadro: o preço cai conforme o relógio anda (quem chama é ui/progresso.js)
export function atualizarBotoesDeConcluir() {
  for (const b of vivos) { if (!b.isConnected) { if (b._visto) vivos.delete(b); } else { b._visto = true; pintar(b); } }
}
