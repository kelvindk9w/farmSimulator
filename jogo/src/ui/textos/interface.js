// Os textos da interface nova (o Menu do celular, o "+" do cash, as abas curtas da loja, o atalho das terras em
// "Minha fazenda"). Entram na tabela T de ui/textos.js.
import { T } from '../textos.js';
import './progresso.js';

T.menu = {
  botao: 'Menu',
  abrir: 'Menu: correio, missões, minha fazenda, configurações e tela cheia',
  correio: 'Correio', missoes: 'Missões', fazenda: 'Minha fazenda', config: 'Configurações', telaCheia: 'Tela cheia',
  novidade: 'Tem novidade no Menu',
};
T.hud.maisCash = 'Mais cash';
// a fileira de abas da loja (o nome inteiro de cada aba continua no rótulo, para o leitor de tela)
T.loja.abasCurtas = { sementes: 'Sementes', ferramentas: 'Ferramentas', materiais: 'Materiais', animais: 'Animais', enfeites: 'Enfeites', cash: 'Cash' };
T.loja.nivelCurto = (n) => `Nível ${n}`;
T.loja.comprarPor = (nome, n, preco) => `Comprar ${n > 1 ? n + ' × ' : ''}${nome} por ${preco}`;
// as terras saem da loja e entram em "Minha fazenda"
T.fazenda.terras = 'Terras';
T.fazenda.resumo.terras = 'Comprar mais chão';
