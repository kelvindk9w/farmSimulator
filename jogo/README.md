# O jogo de fazenda (marco M1: o chão)

Jogo de fazenda isométrico para navegador, celular e TV. O plano está em `docs/jogo/PLANO.md` e o contrato entre as partes em `docs/jogo/ARQUITETURA.md`. Esta pasta tem o primeiro marco: o mundo, a personagem, a lavoura inteira, a banca, a loja, níveis e as missões do Seu Tonho.

## Como rodar

```
npm install          # esbuild e sharp (só para montar)
npm run build        # monta dist/ (index.html, main.js e as páginas de arte)
npm run servir       # serve dist/ em http://127.0.0.1:8091/
npm run testar       # testes da lógica (node:test, sem navegador)
npm run verificar    # joga no Chromium sem janela, com toques e teclas de verdade; grava as fotos em capturas/
npm run bot -- --horas 2 --perfil direto     # jogador automático: imprime o ritmo do jogo
npm run validar      # confere dados/ do jeito que o jogo lê
```

- `node build.mjs --legivel` monta sem minificar.
- Várias frentes na mesma pasta: `JOGO_DIST=dist-minha-frente` muda a pasta de saída do build, do servidor e da verificação; `JOGO_CAPTURAS=capturas-minha-frente` muda a das fotos; `JOGO_PORTA` muda a porta do servidor.
- `npm run verificar` usa o Playwright instalado na máquina (não é dependência do jogo).
- `npm run verificar` também abre o jogo sem `#teste` para conferir a tela de carregando (aparece, a barra anda com rede lenta, some sozinha, nada fica por cima, o erro quando o `main.js` não chega) e tira as fotos `carga-844x390`, `carga-1280x720`, `carga-1920x1080` e `carga-erro`.
- `node tools/verificar-terras.mjs` (depois do build) joga a frente das terras do mesmo jeito: limpar, comprar lote, bananeira, regador de área, desgaste e conserto, em 1280x720 e 844x390.
- `node tools/verificar-progresso.mjs` (depois do build) joga a frente de progresso: presente do dia (com o relógio indo para o dia seguinte), conquista ganha e recebida, convite copiado e fazenda nova aberta por `#convite-<codigo>`, foto da fazenda, compra simulada de cash, concluir um relógio de teste, comprar e vestir roupa, caderno do vizinho, em 1280x720 e 844x390.
- `node tools/verificar-chegada.mjs` (depois do build) confere a chegada do jogo novo (o começo humilde): a fazenda do começo, a cena quadro a quadro, a porteira de arame (fechada; aberta para a estrada quando ela passa), a fala dela (dois balões com o nome e o retrato dela, e as sementes saindo da trouxa), o aceno e as boas-vindas do Seu Tonho, a trouxa que ela larga no chão, o "Pular" (botão, clique no chão, dedo), as reformas (os ícones na aba Reformas, na fila, no cartão da obra e no aviso; a obra de cada uma com a peça própria; a porteira de madeira), a espera pela tela de carregando, que a cena não volta depois de gravar, e a gravação de antes com a pergunta da versão de teste ("Agora não" e "Sim, começar de novo"), em 1280x720 e 844x390 (fotos `h-`).
- O endereço com `#teste` (por exemplo `http://127.0.0.1:8091/#teste`) abre o modo em que o tempo só anda quando a ferramenta manda, por `window.__jogo`.
- Perfis do bot: `direto` (não fecha o jogo), `casual`, `regular`, `engajado` (sessões por dia, como no modelo de `tools/economia/ritmo.mjs`).

## Como jogar

- **Toque ou mouse**: toque numa casa ou numa construção e a personagem vai e faz. Vários toques enfileiram. Com enxada, semear ou regar escolhidos, arrastar pinta as casas. No modo mão, um toque rega o que tem sede e colhe o que está pronto; arrastar anda como alavanca. Dois dedos (ou a roda do mouse) dão zoom.
- **Teclado**: setas ou WASD andam, Shift corre, Espaço age na casa à frente, Q/E ou 1 a 4 trocam o modo, L loja, B mochila, M missões, C configurações, F tela cheia, Tab leva o foco aos botões, Esc cancela ou fecha.
- **Controle de videogame e de TV**: direcional ou alavanca andam, A/OK age, B/voltar cancela ou fecha, ombros trocam o modo.
- O poço enche o regador, a banca compra o que está no cesto, o celeiro guarda o cesto (e é onde fica o suporte de ferramentas).
- **O começo humilde** (jogo novo): ela chega com a trouxa pela porteira de arame (um toque pula a cena), larga a trouxa no chão e o Seu Tonho dá as boas-vindas; um toque nele é a conversa. A fazenda começa com a casa e o poço velhos, o baú (guarda 40 até o celeiro), o caixote na porteira (cabem 12; quem passa leva uma coisa por vez) e a cerca de arame. O celeiro e o quadro de pedidos se constroem quando o Seu Tonho pede; poço, caixote (vira banca), casa e cerca se reformam na aba "Reformas" do Construir. A gravação de antes abre com a fazenda de antes.
- **Terras**: a placa de um lote (ou a etiqueta do preço em cima dela) abre a compra; a aba "Terras" da loja mostra todos. Mato, toco e pedra saem com um toque (modo mão) ou arrastando no modo "Limpar", que aparece quando há foice, machado ou picareta; toco e pedra pedem vários golpes, num toque só. A muda de árvore aparece na barra de sementes: as casas onde ela cabe ficam marcadas. Regador e foice melhores alcançam várias casas (marcadas antes do toque). Ferramenta gasta não quebra: rende menos até o conserto, pelo aviso no alto da tela ou pelo botão "Ferramentas e conserto" da mochila.
- **Minha fazenda** (o troféu no alto): conquistas, presente do dia, amigos (convite por link e foto da fazenda), guarda-roupa, loja de cash e o caderno com as lições do vizinho. Quando há presente esperando, aparece a caixa de correio no alto: um toque abre. A loja de cash é de teste: nenhuma cobrança é feita. Nada de útil é só de cash, e convidar nunca é obrigatório.
- **Construir** (o martelo no alto; a bancada de carpintaria vem primeiro): o catálogo por abas mostra custo, o que falta e o nível. Escolhida a peça, o fantasma segue o dedo, o mouse ou as setas (casas verdes servem, vermelhas não; R ou "Girar" vira a porteira) e "Confirmar" (ou Enter) manda a personagem martelar; a obra mostra a barra e o relógio. Cerca, calçamento e canteiro seguem colocando: um toque põe um, arrastar pinta a fileira. Tocar numa construção abre o cartão dela, com "Mudar de lugar" e "Guardar"; "Mudar coisas de lugar" no catálogo pega qualquer uma.
- **Celeiro por dentro**: o toque no celeiro guarda o cesto; perto da porta aparece "Entrar" na fileira dos modos (no teclado, Esc ou Tab e Enter; ou andar contra a porta). Lá dentro se montam prateleiras (produtos), baús (materiais) e suportes (ferramentas), e cada um aumenta só o seu espaço. A mochila mostra quanto cabe em cada um. "Sair" ou pisar na soleira volta para a fazenda.
- Configurações: som, esquema de toque (só toque, alavanca com botão, os dois), tamanho dos botões, tela cheia, exportar e importar a fazenda por texto, recomeçar.

## Organização

```
build.mjs          monta dist/: dados e atlas dentro do main.js, páginas de arte em dist/arte/
index.html         a página e todo o CSS da interface
dados/             números e conteúdo (dono: economia)
arte/              peças e arte/catalogo/<grupo>.json (dono: arte)
src/main.js        liga as partes, o laço do jogo, a gravação e os ganchos window.__jogo
src/nucleo/        lógica pura (roda no Node): mundo.js, registro.js, local.js, caminho.js, dados.js, guia.js
src/nucleo/sistemas/   terras, posses, personagem, lavoura, poco, banca, celeiro, loja, niveis, missoes
src/render/        camera, cena (ordem de desenho, transparência do que cobre), chao (blocos), atlas, particulas, reserva
src/entrada/       toque, teclado, controle, foco (setas nos botões)
src/ui/            hud, avisos, subida de nível, tutorial, retorno (eventos viram efeitos), textos, paineis/
src/plataforma/    gravacao, tela (tela cheia e giro), som (da coordenação)
tools/             atlas, comum, servir, validar, verificar, bot (arte/ e economia/ são das outras frentes)
testes/            *.test.mjs, apoio.mjs e dados/ pequenos, independentes da economia
capturas/          fotos tiradas pela verificação
```

Funcionalidade nova entra por registro, em arquivo próprio: `registrarSistema`, `registrarAcao`, `registrarTipo`, `registrarModo`, `registrarAutomatico`, `registrarEvento` (lógica) e `registrarPainel` (interface), mais uma linha no `index.js` da pasta. Os contratos estão em `docs/jogo/ARQUITETURA.md`.

## O que foi verificado

- `npm run testar`: 66 testes (terreno, caminho, fôlego, fila de tarefas, lavoura com relógio e ausência, cesto, venda, celeiro, compra, níveis, missões e `valeJaTer`, guia, gravar e carregar, exportar e importar).
- `npm run verificar`, no Chromium sem janela (desenho por software), termina com `Tudo certo.`:
  - 1280x720 com mouse e teclado: arar, semear, encher o regador, regar (com a volta ao poço quando a água acaba), avançar o relógio, colher, vender, comprar com clique e com Enter no botão focado, tela de subida de nível, painéis, configurações, recomeçar com confirmação, exportar e importar, menu pelo teclado, Espaço, gravar e recarregar.
  - 844x390 com toque (dedo de verdade pelo protocolo do navegador): toque, arrastar pintando, alavanca solta, pinça, botão de ação, painel; nenhum texto abaixo de 14 px, nenhum botão abaixo de 44 px, nada do HUD sobreposto ou fora da tela.
  - 390x844 em pé: o palco gira, o aviso de deitar aparece e o toque cai na casa certa.
  - Nenhum erro no console nas três telas.
- As seis fotos de `capturas/` foram olhadas uma a uma.
- `npm run bot` com os dados de hoje: nível 4 perto dos 15 minutos e nível 5 perto dos 53 minutos de jogo direto; cumpre as 10 missões que este marco sabe cumprir.

## O que NÃO foi verificado

- Aparelho de verdade: nenhum celular, tablet ou TV. Toque, pinça, giro em pé e tela cheia só foram testados no Chromium emulando.
- Desempenho: não foi medido em celular fraco (aqui o desenho é por software). A redução automática de resolução existe, mas não foi exercitada.
- Controle de videogame e controle remoto de TV: o código existe, mas a verificação só usa teclado (as setas e o Enter que a TV manda); os códigos de "voltar" das TVs não foram testados.
- Safari e Firefox. A trava de orientação e a tela cheia dependem do navegador.
- O som: é da coordenação; aqui só se confere que ligar e desligar grava a preferência.
- Partidas longas com gravação de verdade (dias): só pelo bot e pelos testes de ausência.
- Construir e o celeiro por dentro: `tools/verificar-construcao.mjs` joga tudo com mouse, teclado e toque (fotos `capturas/a-*.jpg`), mas não com controle de videogame.

## O que ainda não existe (fica para os próximos marcos)

- Mudar uma árvore frutífera de lugar (ela fica onde foi plantada).
- Animais, indústria, pedidos (cada frente descreve o seu em `docs/jogo/ARQUITETURA.md`).
- Progresso: não há servidor (o jogo não fica sabendo sozinho que o amigo convidado chegou: há um botão de teste), a compra de cash é simulada, chapéus, vestido e pintura das ferramentas estão "em breve" (pedem desenho novo) e a caixa de correio ainda não existe como objeto no terreno (só no HUD).
- O quadro de pedidos e o Seu Tonho em pessoa no terreno (hoje ele aparece no balão).
- O fôlego segue `regras.json` (`folego`): hoje são 10 s de corrida e volta em 5 s andando ou 3 s parada.
