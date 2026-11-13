# Lista de elementos da interface

Tudo o que aparece nos mockups desta pasta, um elemento por linha, com os estados que cada um precisa e para que serve. Depois que o dono aprovar os mockups, esta lista vira a relação de peças a produzir (agente `producao-de-componentes`).

**Estados**, em palavras simples:
- **normal**: como fica parado na tela.
- **apertado**: enquanto o dedo está em cima (o botão "afunda": perde o relevo e escurece um pouco).
- **desativado**: não dá para usar agora (fica apagado, acinzentado).
- **selecionado**: é o escolhido no momento (fundo verde, contorno dourado).
- **com novidade**: tem uma bolinha vermelha no canto avisando que há algo novo lá dentro.

Mockups (todos no formato do celular deitado, 1844 x 853, que é o celular de 844 x 390 ampliado um pouco mais de duas vezes; `moedas.png` é uma prancha à parte):
- `tela-do-jogo.png` — a tela do jogo, com o Menu fechado.
- `tela-do-jogo-menu-aberto.png` — a mesma tela com o Menu aberto (mostra também o botão apertado).
- `painel-loja.png` — a loja aberta.
- `subiu-de-nivel.png` — a tela de subir de nível.
- `presente-do-dia.png` — a recompensa diária.
- `moedas.png` — opções de ícone para o ouro e o cash.

Os pedidos usados no Codex estão em `pedidos/`.

## Peças que se repetem em toda a interface

| Elemento | Estados | Para que serve |
|---|---|---|
| Moldura de painel (corpo creme com moldura de madeira) | normal | Fundo de todos os painéis (loja, construir, mochila, presente...). Feita em pedaços que esticam, para servir em qualquer tamanho. |
| Cabeçalho de tábua (ícone + título) | normal | Faixa de madeira no alto de cada painel, com o nome do painel. |
| Película escura | normal | Escurece a fazenda atrás de um painel aberto, para o painel se destacar. |
| Botão Fechar (X branco em círculo vermelho) | normal, apertado | Fecha o painel aberto. |
| Botão Voltar (seta) | normal, apertado | Volta para o painel anterior (existe hoje no presente do dia e na loja de cash; não aparece nestes mockups). |
| Botão verde grande (ação principal) | normal, apertado, desativado, em destaque (brilho piscando, quando o tutorial manda tocar nele) | Ação principal: Comprar, Construir, Fazer, Encher, Receber, Continuar. |
| Botão creme (ação secundária) | normal, apertado, desativado | Ação de segunda importância: Ver no mapa, Entendi, ×5. |
| Pílula de número (caixinha creme com moldura) | normal | Mostra um ícone e um número (ouro, cash, cesto, água, recompensas). |
| Bolinha de novidade (vermelha) | normal, piscando | Avisa que há algo novo num botão, aba ou linha do menu. |
| Bolinha de contador (número pequeno no canto) | azul (água), creme (quantidade), vermelha (zerado) | Mostra quanto resta de algo num botão (água do regador, sementes na mão). |
| Visto verde | normal | Marca o que já foi feito ou recebido. |
| Cadeado | normal | Marca o que ainda está travado. |
| Faixa "Nível N" | normal | Diz em que nível um item travado é liberado. |
| Barra de progresso com moldura | vazia, enchendo, cheia (com brilho) | Experiência, missão, produção. |
| Aviso curto (toast) | informação, sucesso (visto verde), alerta (exclamação laranja) | Mensagem rápida no alto da tela que some sozinha ("Missão cumprida: Regar"). No mockup a letra ficou no limite (cerca de 14 px no celular); na produção, usar 16 px. |

## Moedas

| Elemento | Estados | Para que serve |
|---|---|---|
| Moeda de ouro (ícone) | grande (painéis e recompensas), pequena (barra do alto), mínima (dentro de botões de preço) | A moeda comum, que se ganha vendendo a colheita. Opções em `moedas.png`. |
| Cash (ícone) | grande, pequena, mínima | A moeda especial, mais rara. Opções em `moedas.png`. |

## Tela do jogo (`tela-do-jogo.png`)

| Elemento | Estados | Para que serve |
|---|---|---|
| Selo do nível (medalhão verde com aro dourado e número) | normal, apertado, brilhando (quando sobe de nível) | Mostra o nível do jogador. |
| Barra de experiência ("15/40") | enchendo, cheia | Quanto falta para o próximo nível. |
| Pílula do ouro (moeda + número) | normal, ganhou (número pisca verde), gastou (número pisca vermelho) | Quanto ouro o jogador tem. |
| Pílula do cash (cash + número + botão "+") | normal, apertado, com novidade | Quanto cash o jogador tem. O "+" abre a loja de cash. |
| Pílula do cesto ("4/12") | normal, cheio (número vermelho, treme) | Quanto o cesto está carregando. |
| Pílula da água do regador ("3/4") | normal, vazio (número vermelho "0/4") | Quanta água resta no regador. |
| Botão Mochila | normal, apertado, com novidade | Abre a mochila e o celeiro. |
| Botão Loja | normal, apertado, com novidade | Abre a loja. |
| Botão Construir (martelo) | normal, apertado, desativado (antes de liberar), com novidade | Abre o catálogo de construções. |
| Botão Menu (tábuas empilhadas + "Menu") | normal, apertado/aberto, com novidade | No celular, guarda os botões que não cabem: Correio, Missões, Minha fazenda, Configurações, Tela cheia. A bolinha aparece quando algo lá dentro tem novidade. |
| Lista do Menu (painel que desce do botão) | aberta, fechada | Mostra os botões guardados, cada um com ícone e nome. |
| Linha do Menu: Correio | normal, apertado, com novidade | Abre a caixa de correio (presentes). |
| Linha do Menu: Missões (caderno) | normal, apertado, com novidade | Abre o caderno de missões. |
| Linha do Menu: Minha fazenda | normal, apertado, com novidade | Abre terras, conquistas e progresso. |
| Linha do Menu: Configurações (engrenagem) | normal, apertado | Abre as configurações. |
| Linha do Menu: Tela cheia | entrar, sair, apertado | Liga e desliga a tela cheia. |
| Botões Correio, Missões, Minha fazenda, Configurações, Tela cheia (soltos) | normal, apertado, com novidade | No computador e no tablet, que têm espaço, os oito botões ficam à vista, sem o Menu. |
| Balão do vizinho (painel com retrato, título, fala e barra) | normal, apertado, missão cumprida (barra cheia e visto), recolhido (só o retrato, para liberar a tela) | Mostra a missão do Seu Tonho. Tocar abre o caderno de missões. |
| Retrato do Seu Tonho (redondo, moldura de madeira) | normal, falando (balança de leve) | Quem está dando a missão. |
| Barra de ferramentas (fundo) | normal | Segura os botões de ferramenta embaixo, no meio. |
| Botão Mão | normal, apertado, selecionado | Mão livre: anda, colhe, pega. |
| Botão Enxada | normal, apertado, selecionado, desativado | Ara a terra. |
| Botão Semear | normal, apertado, selecionado, desativado (sem semente), com contador | Planta sementes. |
| Botão Regar | normal, apertado, selecionado, desativado, com contador (água que resta; vermelho quando zera) | Rega as plantas. |
| Outros botões de ferramenta (Foice, Machado, Picareta, Martelo) | os mesmos dos de cima | Aparecem na barra quando o jogador tem a ferramenta. |
| Alavanca virtual (base + pino) | parada (meio transparente), em uso (mais forte, pino deslocado) | Anda com a personagem no celular. |
| Botão de agir (redondo, grande) | normal, apertado, desativado (nada perto), ícone trocado conforme a ação (mão, enxada, regador...) | Faz a ação na casa em frente à personagem. |
| Seta de dica (amarela) | normal, pulando | Aponta para onde tocar no tutorial. |
| Plaquinha de preço no chão (cadeado + valor) | normal, dá para comprar (brilho) | Mostra o preço de um lote ou de algo travado na fazenda. |

## Painel da loja (`painel-loja.png`)

| Elemento | Estados | Para que serve |
|---|---|---|
| Painel da loja (moldura + cabeçalho "Loja" + ícone de sacola) | aberto | A loja. |
| Pílulas de ouro e cash no cabeçalho | normal | Quanto o jogador tem enquanto compra. |
| Aba (ícone + nome) | normal, selecionada, apertada, com novidade | Troca de prateleira: Sementes, Ferramentas, Materiais, Animais, Enfeites, Cash. |
| Cartão de item (ícone grande + nome + botão de preço) | normal, apertado, travado (apagado, cadeado, faixa "Nível 6"), já tem (visto, sem botão) | Um item à venda. |
| Botão de preço em ouro (verde, moeda + número) | normal, apertado, desativado (sem ouro: número vermelho) | Compra o item com ouro. |
| Botão de preço em cash (azul-turquesa, cash + número) | normal, apertado, desativado | Compra o item com cash. A cor diferente evita gastar cash sem querer. |
| Ícones de item (Canteiro de flores, Bandeirinhas de festa, Porteira, Espantalho, Caminho de pedra, Fonte de pedra) | normal, apagado (travado) | O desenho de cada item. Cada item do jogo precisa do seu. |
| Ícones das abas (semente, ferramenta, material, animal, enfeite, cash) | normal | Ajudam a achar a aba sem ler. |

## Subiu de nível (`subiu-de-nivel.png`)

| Elemento | Estados | Para que serve |
|---|---|---|
| Raios de sol dourados | girando devagar | Fundo de festa atrás do selo. |
| Confete | caindo | Festa. |
| Fita "Subiu de nível!" | normal | Título da tela. |
| Selo grande do nível | normal, aparecendo (cresce e brilha) | O número do nível novo. |
| Painel de recompensas | normal | Junta o que o jogador ganhou e o que liberou. |
| Pílula de recompensa (ícone + número) | normal | O que ganhou (ouro, cash). |
| Cartão "Liberou" (ícone + nome) | normal | O que passou a existir na loja (Galinheiro, Galinha, Caixa de ovos). |
| Botão "Continuar" | normal, apertado | Fecha a tela e volta ao jogo. |

## Presente do dia (`presente-do-dia.png`)

| Elemento | Estados | Para que serve |
|---|---|---|
| Painel "Presente do dia" (com ícone de presente) | aberto | A recompensa diária. |
| Cartão do dia ("Dia 1" a "Dia 7") | aberto (apagado, visto, "Aberto"), hoje (maior, borda dourada, "Hoje!"), fechado (dias que faltam), amanhã ("Amanhã") | Um presente por dia jogado. |
| Cartão do dia 7 (especial, fundo dourado) | aberto, hoje, fechado | O presente maior da semana. |
| Botão "Receber" (verde, com caixinha de presente) | normal, apertado, desativado (já recebeu hoje: "Volte amanhã") | Recebe o presente de hoje. |
| Ícones de presente (pregos, tábuas, madeira, pedra, chapéu de palha) | normal | O que vem em cada dia. |

## Diferenças em relação ao jogo de hoje (para o dono decidir)

- **Botões do alto, no celular:** só Mochila, Loja, Construir e Menu ficam à vista. Correio, Missões, Minha fazenda, Configurações e Tela cheia ficam dentro do Menu. No computador e no tablet os oito continuam à vista.
- **Abas da loja:** seis abas de uma linha só (Sementes, Ferramentas, Materiais, Animais, Enfeites, Cash), com nomes curtos. Hoje são oito em duas linhas; Construir e Terras saem da loja porque já têm os seus botões (Construir e Minha fazenda).
- **Botão de preço em cash:** azul-turquesa, diferente do verde do ouro, para ninguém gastar cash sem perceber. Se o ícone escolhido para o cash for a gema azul (Cash B), esse botão precisa de outra cor (por exemplo, roxo), senão o ícone some no botão.
- **Presente do dia:** o botão diz "Receber" (palavra que o jogo já usa na tela de recompensa). Hoje o painel diz "Abrir o presente de hoje", que é comprido demais para o celular.
- **Balão do vizinho:** fala curta, em duas linhas. A fala inteira continua no caderno de missões.
