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
- O endereço com `#teste` (por exemplo `http://127.0.0.1:8091/#teste`) abre o modo em que o tempo só anda quando a ferramenta manda, por `window.__jogo`.
- Perfis do bot: `direto` (não fecha o jogo), `casual`, `regular`, `engajado` (sessões por dia, como no modelo de `tools/economia/ritmo.mjs`).

## Como jogar

- **Toque ou mouse**: toque numa casa ou numa construção e a personagem vai e faz. Vários toques enfileiram. Com enxada, semear ou regar escolhidos, arrastar pinta as casas. No modo mão, um toque rega o que tem sede e colhe o que está pronto; arrastar anda como alavanca. Dois dedos (ou a roda do mouse) dão zoom.
- **Teclado**: setas ou WASD andam, Shift corre, Espaço age na casa à frente, Q/E ou 1 a 4 trocam o modo, L loja, B mochila, M missões, C configurações, F tela cheia, Tab leva o foco aos botões, Esc cancela ou fecha.
- **Controle de videogame e de TV**: direcional ou alavanca andam, A/OK age, B/voltar cancela ou fecha, ombros trocam o modo.
- O poço enche o regador, a banca compra o que está no cesto, o celeiro guarda o cesto (e é onde fica o suporte de ferramentas).
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

## O que ainda não existe (fica para os próximos marcos)

- Limpar mato, pedra e toco, e comprar lote: o mapa, os lotes e as placas já existem; o toque explica que é para depois.
- O celeiro por dentro, construir, animais, árvores, indústria, pedidos, conquistas, recompensa diária, cash.
- Desgaste e conserto das ferramentas (`regras.desgaste`), ferramenta que age em várias casas (`area`).
- Cercas, porteira, o quadro de pedidos e o Seu Tonho em pessoa no terreno (hoje ele aparece no balão).
- O fôlego segue `regras.json` (`folego`): hoje são 10 s de corrida e volta em 5 s andando ou 3 s parada.
