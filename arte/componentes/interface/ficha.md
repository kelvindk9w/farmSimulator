# Ficha das peças da interface

Base: os mockups aprovados de `arte/mockups/interface/` (ouro = Ouro A, cash = Cash A). Relação das peças: `pecas.md`. Medidas, fatias e CSS de cada peça: `componentes.json`. Tudo junto: `folha-de-contato.png`. Teste montado em HTML: `teste/`.

## Como as peças foram feitas

1. O Codex desenhou cada grupo de peças de novo, sozinho, sobre fundo transparente, com o mockup anexado (pedidos em `pedidos/`). Uma imagem por pedido (o 07 fez duas). **9 imagens geradas, nenhuma descartada**: todas passaram na primeira rodada.
2. Acabamento por código (`acabamento/`, Python com PIL):
   - separar cada peça da imagem, pôr na escala (3 px da imagem = 1 px do CSS no celular deitado);
   - espelhar a metade esquerda para a direita (cantos e lados iguais dos dois lados), menos na lista do Menu (o biquinho fica só à direita) e na tábua do título;
   - deixar os lados iguais ao longo do comprimento (cada coluna do meio vira a coluna central) e encolher o meio, que só serve para esticar;
   - alisar o miolo creme e o vermelho da fita, para não aparecer emenda entre o canto e o meio esticado;
   - nos botões e abas com degradê de cima para baixo, só as colunas foram igualadas: o degradê continua e estica junto com a altura;
   - estados da mesma peça (normal, apertado, desativado...) com o mesmo tamanho e as mesmas fatias;
   - peças fixas aparadas rente ao desenho, com 3 px de folga transparente; estados no mesmo quadro, centrados.
3. Ícones: gravados no catálogo do jogo pelo `jogo/tools/arte/peca.mjs icones` (128 x 128, apoio no centro), com a folha `arte/jogo/folhas/interface.png` e a tabela de `arte/jogo/ficha-pecas.md` refeitas.

## Pedido de cada peça

| Peças | Pedido | Imagem crua (fora do repositório) | Rodadas |
|---|---|---|---|
| `painel`, `painel-moldura`, `painel-fundo`, `menu-lista`, `balao`, `pilula`, `aviso` | `pedidos/01-paineis.md` | `/root/arte-codex/interface-pecas-01/paineis.png` | 1 |
| `botao-verde-*`, `botao-turquesa-*`, `botao-marrom` | `pedidos/02-botoes-de-acao.md` | `interface-pecas-02/botoes-acao.png` | 1 |
| `botao-hud-*`, `aba-*` | `pedidos/03-botoes-quadrados-e-abas.md` | `interface-pecas-03/botoes-quadrados.png` | 1 |
| `cartao-item-*`, `cartao-dia-*` | `pedidos/04-cartoes.md` | `interface-pecas-04/cartoes.png` | 1 |
| `botao-fechar-*`, `selo-nivel`, `botao-agir-*`, `bolinha-contador` | `pedidos/05-redondos.md` | `interface-pecas-05/redondos.png` | 1 |
| `faixa-nivel`, `cabecalho`, `barra-moldura`, `barra-enchimento-*` | `pedidos/06-compridas.md` | `interface-pecas-06/compridas.png` | 1 |
| `raios`, `alavanca-base`, `alavanca-pino`, `bolinha-novidade` | `pedidos/07-raios-e-alavanca.md` | `interface-pecas-07/raios.png`, `alavanca.png` | 1 |
| ícones `ui/menu`, `ui/missoes`, `ui/minha-fazenda`, `ui/mais`, `ui/certo`, `ui/estrela`, `ui/mao`, `ui/semear`, `ui/enxada` | `pedidos/08-icones.md` (também em `arte/jogo/pedidos/ui-interface-aprovada.md`) | `interface-pecas-08/icones.png` | 1 |

`painel-moldura` e `painel-fundo` saíram do `painel` por código (a moldura sem o miolo e o miolo sozinho). O miolo de `alavanca-base` foi deixado com 55% de opacidade por código.

## Fatias (9-slice)

Fatias em px da imagem, na ordem topo, direita, baixo, esquerda. Borda no CSS = fatia / 3.

| Arquivo | Imagem (px) | Fatias | Borda no CSS (px) | Estica |
|---|---|---|---|---|
| `painel.png` | 192 x 195 | 84 84 87 84 | 28 28 29 28 | largura e altura |
| `painel-moldura.png` | 192 x 195 | 84 84 87 84 | 28 28 29 28 | largura e altura |
| `painel-fundo.png` | 124 x 118 | 48 51 48 51 | 16 17 16 17 | largura e altura |
| `menu-lista.png` | 183 x 159 | 81 108 54 51 | 27 36 18 17 | largura e altura |
| `balao.png` | 156 x 153 | 63 66 66 66 | 21 22 22 22 | largura e altura |
| `pilula.png` | 132 x 109 | 54 54 54 54 | 18 18 18 18 | só largura, altura 36 px |
| `aviso.png` | 114 x 86 | 45 45 42 45 | 15 15 14 15 | só largura, altura 29 px |
| `cabecalho.png` | 797 x 136 | 66 84 66 84 | 22 28 22 28 | só largura, altura 45 px |
| `botao-verde-normal/apertado/desativado.png`, `botao-turquesa-normal/apertado.png`, `botao-marrom.png` | 132 x 130 | 54 54 45 54 | 18 18 15 18 | largura e altura |
| `botao-hud-normal/apertado/selecionado.png` | 156 x 238 | 84 66 66 66 | 28 22 22 22 | largura e altura |
| `aba-normal/selecionada.png` | 132 x 128 | 48 54 12 54 | 16 18 4 18 | largura e altura |
| `cartao-item-normal/travado.png` | 144 x 147 | 63 60 60 60 | 21 20 20 20 | largura e altura |
| `cartao-dia-aberto/futuro/especial.png` | 120 x 177 | 54 48 99 48 | 18 16 33 16 | largura e altura |
| `cartao-dia-hoje.png` | 162 x 231 | 81 69 126 69 | 27 23 42 23 | largura e altura; brilho para fora: `border-image-outset: 9px 7px` |
| `barra-moldura.png` | 78 x 51 | 24 27 24 27 | 8 9 8 9 | só largura, altura 17 px |
| `barra-enchimento-dourado/verde.png` | 66 x 36 | 18 21 18 21 | 6 7 6 7 | só largura, altura 12 px |
| `faixa-nivel.png` | 744 x 235 | 117 360 117 360 | 39 120 39 120 | só largura, altura 78 px |

Peças fixas (só mudam de tamanho por igual): `botao-fechar-normal/apertado` (187 x 189), `selo-nivel` (368 x 377), `botao-agir-normal/apertado` (263 x 270), `bolinha-contador` (78 x 80), `bolinha-novidade` (54 x 55), `alavanca-base` (337 x 341), `alavanca-pino` (145 x 147), `raios` (900 x 900, centro dos raios no centro da imagem).

## O que ficou de fora ou pendente

- Nada pendente das peças pedidas.
- Ícones que já existiam e já são iguais ao mockup foram mantidos, sem redesenho: `ui/regar`, `ui/loja`, `ui/mochila`, `ui/correio`, `ui/config`, `ui/tela-cheia`, `ui/cadeado`, `ui/presente`, `ui/fechar`, `icone/ouro` (já é o Ouro A), `icone/cash` (já é o Cash A), `icone/xp`, `icone/gota`, `icone/martelo`, `icone/cesto`. `ui/correio` estava na lista de novos, mas já existe e é o envelope com coração do mockup.
- Não pedidos e não feitos (estão na lista de elementos): ícone de alerta do aviso curto (exclamação laranja), plaquinha de preço no chão (pode ser a `pilula` escurecida pelo CSS), confete, retrato redondo com aro de madeira (no teste foi feito com borda do CSS), bolinha de contador creme e vermelha (dá para tingir a azul pelo CSS ou pedir depois).
- Estados feitos pelo CSS, sem peça: com novidade (bolinha por cima), piscando, brilhando, apertado da aba e do cartão, desativado dos botões quadrados (filtro cinza), barra cheia com brilho.

## Diferenças em relação ao mockup

- O lábio escuro de baixo das pílulas e dos botões quadrados é um pouco mais fino que no mockup; o relevo existe, mas é mais discreto.
- A fita "Subiu de nível!" é reta (no mockup é em arco), para o texto do HTML ficar alinhado; as pontas dobradas continuam.
- A tábua do título tem o veio do desenho original (não foi espelhada); esticada, o veio só alonga.
- O botão fechar tem o aro dourado do mockup da loja (no presente do dia o aro é vermelho-escuro).
- No teste, com a letra de 16 px pedida para o aviso curto, o aviso não cabe na linha de cima do celular (entre o cash e os botões): foi posto na segunda linha, no meio.
