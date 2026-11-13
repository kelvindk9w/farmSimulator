// A interface de construir (frente A). Por enquanto: o toque numa construção que abre painel.
// (O painel "Construir", o cartão da construção e o modo de escolher o lugar entram a seguir.)
import '../textos/construcao.js';
import { aoInstalarMundo } from '../ligacoes.js';
import { abrirPainel } from './registro.js';

// convenção: acaoPossivel devolve { painel, arg, texto } e o comando tocarEntidade emite "pediuPainel";
// vale para o toque, para a tecla de ação e para o botão do controle
aoInstalarMundo((m) => {
  m.eventos.ouvir('pediuPainel', (d) => abrirPainel(d.painel, d.arg));
});
