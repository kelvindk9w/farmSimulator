# Relação de peças da interface

Base: `arte/mockups/interface/aprovado.png` e os outros mockups aprovados da pasta (`APROVADO.md`). Ouro = Ouro A (moeda com trigo), cash = Cash A (esmeralda verde).

A interface do jogo é HTML e CSS. Por isso há três grupos de peça:

1. **Ícones** (128 x 128, apoio no centro, fundo transparente): vão para o catálogo do jogo (`jogo/arte/catalogo/`) pelo `jogo/tools/arte/peca.mjs icones`, com a mesma chave quando é o mesmo ícone.
2. **Molduras de esticar** (9 fatias, para `border-image` do CSS): vistas de frente, sem perspectiva, simétricas da esquerda para a direita, bordas retas e iguais ao longo do comprimento. Ficam em `arte/componentes/interface/` e em `jogo/arte/interface/molduras/`.
3. **Peças fixas** (redondas ou desenhadas, que só mudam de tamanho por igual): selo, alavanca, botão de agir, botão fechar, raios de sol. Mesmas pastas das molduras.

Escala das molduras e peças fixas: **3 px da imagem para 1 px do CSS no celular deitado (844 x 390)**. Ou seja, uma fatia de 36 px na imagem vira uma borda de 12 px no CSS (`border-image-width: 12px`). O tamanho de cada peça no celular foi medido no mockup (que é o celular ampliado 2,18 vezes).

## 1. Ícones (catálogo, 128 x 128)

| Chave | O que é | Situação no catálogo | O que fazer |
|---|---|---|---|
| `ui/menu` | três tábuas de madeira empilhadas (o "hambúrguer" de madeira do botão Menu) | não existe | desenhar |
| `ui/missoes` | caderno de espiral marrom com um visto verde (linha Missões do Menu) | existe (pergaminho) | redesenhar como no mockup |
| `ui/minha-fazenda` | celeiro vermelho com portas brancas em X e cerquinha (linha Minha fazenda) | não existe (`ui/fazenda` é parecido) | desenhar |
| `ui/mais` | botãozinho verde quadrado com "+" branco (o "+" do cash) | não existe | desenhar |
| `ui/certo` | visto branco num círculo verde (aviso curto, "Aberto") | não existe | desenhar |
| `ui/estrela` | estrela dourada gordinha (em volta do selo de nível) | não existe (`icone/xp` é parecida) | desenhar |
| `ui/mao` | luva de trabalho amarela (no mockup é amarela; a de hoje é bege) | existe | redesenhar |
| `ui/semear` | mão soltando sementes sobre a terra, com saquinho de sementes ao lado | existe (sem o saquinho) | redesenhar |
| `ui/enxada` | enxada de lâmina cinza clara e cabo de madeira, na diagonal | existe | redesenhar junto, para ficar igual às vizinhas |
| `ui/regar` | regador de lata com gotas | existe e já igual ao mockup | manter |
| `ui/loja` | sacola de pano com folhinha | existe e já igual | manter |
| `ui/mochila` | mochila de couro marrom | existe e já igual | manter |
| `ui/config` | engrenagem cinza | existe e já igual | manter |
| `ui/correio` | envelope com coração | existe e já igual | manter |
| `ui/tela-cheia` | quatro cantos de moldura | existe e já igual | manter |
| `ui/cadeado` | cadeado cinza | existe e já igual | manter |
| `ui/presente` | caixa vermelha com laço amarelo | existe e já igual | manter |
| `ui/fechar` | X vermelho | existe; no mockup o X fica dentro do botão vermelho redondo (peça fixa `botao-fechar`) | manter |
| `icone/ouro` | Ouro A (moeda com trigo) | existe e é a escolhida | manter |
| `icone/cash` | Cash A (esmeralda em gota) | existe e é a escolhida | manter |
| `icone/xp`, `icone/gota`, `icone/martelo`, `icone/cesto` | estrela, gota, martelo, cesto | existem e já iguais | manter |

## 2. Molduras de esticar (9 fatias)

Tamanho no celular medido no mockup (px do CSS). Nada de texto nem ícone dentro.

| Arquivo | O que é | Estados (um arquivo cada) | Altura no celular |
|---|---|---|---|
| `painel.png` | painel: moldura de madeira clara com contorno marrom, miolo creme | normal | livre (borda de ~14 px) |
| `painel-moldura.png` | só a moldura do painel, miolo transparente (para pôr por cima de outro fundo) | normal | livre |
| `painel-fundo.png` | só o miolo creme do painel, cantos arredondados | normal | livre |
| `cabecalho.png` | tábua de madeira do título do painel ("Presente do dia"), com dois preguinhos nas pontas | normal | ~40 |
| `pilula.png` | pílula do HUD: creme com aro de madeira e contorno marrom | normal | ~36 |
| `aviso.png` | aviso curto (toast): faixa creme com aro fino de madeira | normal | ~28 |
| `balao.png` | balão do vizinho: painel creme com moldura de madeira mais fina | normal | ~95 |
| `menu-lista.png` | lista do Menu: painel creme com moldura de madeira e biquinho para cima no canto direito | normal | livre |
| `botao-verde-*.png` | botão de ação verde com relevo | normal, apertado, desativado | ~42 |
| `botao-turquesa-*.png` | botão de preço em cash | normal, apertado | ~42 |
| `botao-marrom.png` | botão travado ("Nível 6") | normal | ~42 |
| `botao-hud-*.png` | botão quadrado do HUD e da barra de ferramentas | normal, apertado, selecionado (verde com aro amarelo) | ~55 a 70 |
| `aba-*.png` | aba da loja (cantos redondos só em cima) | normal, selecionada | ~44 |
| `cartao-item-*.png` | cartão de item da loja | normal, travado | ~125 |
| `cartao-dia-*.png` | cartão do dia do presente | aberto, hoje (com brilho), futuro, especial (dourado) | ~150 |
| `barra-moldura.png` | trilho da barra de progresso (marrom com contorno) | normal | ~16 |
| `barra-enchimento-dourado.png` | enchimento da barra de experiência | normal | ~12 |
| `barra-enchimento-verde.png` | enchimento da barra de missão (balão do vizinho) | normal | ~12 |
| `faixa-nivel.png` | fita vermelha "Subiu de nível!" sem texto (estica só na largura) | normal | ~80 |

## 3. Peças fixas

| Arquivo | O que é | Estados | Tamanho no celular |
|---|---|---|---|
| `botao-fechar-*.png` | botão vermelho redondo com X branco | normal, apertado | ~42 |
| `selo-nivel.png` | medalhão verde com aro dourado, sem número | normal | 46 no HUD, 120 na tela de nível |
| `raios.png` | raios de sol dourados (fundo da tela de nível; gira pelo CSS) | normal | ~400 |
| `alavanca-base.png` | base redonda da alavanca, aro de madeira, miolo meio transparente | normal | ~110 |
| `alavanca-pino.png` | pino redondo creme da alavanca | normal | ~46 |
| `botao-agir-*.png` | botão redondo grande de agir (o ícone vai por cima, pelo HTML) | normal, apertado | ~85 |
| `bolinha-novidade.png` | bolinha vermelha de novidade | normal | ~12 |
| `bolinha-contador.png` | bolinha azul do contador (o número vai pelo HTML) | normal | ~18 |

## Fica no CSS (sem peça)

- Película escura atrás dos painéis (cor preta meio transparente).
- Linhas que separam as linhas do Menu (borda de 1 px marrom-clara).
- Estados "com novidade" (bolinha por cima), "piscando", "ganhou/gastou" (cor do número), "desativado" dos botões quadrados (filtro cinza), número vermelho.
- Botão creme de ação secundária: usa `botao-hud-normal.png` / `-apertado.png` (o mesmo creme com aro de madeira).
- Confete (pedacinhos coloridos pelo CSS).
