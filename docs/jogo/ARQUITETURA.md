# Arquitetura do jogo

Contrato entre as partes do jogo (`jogo/`). Leia `PLANO.md` antes. Quem mexe no código segue este arquivo; se algo aqui estiver errado ou faltando, corrija o arquivo junto com o código e diga no relato.

## Escolhas técnicas

- JavaScript puro em módulos ES, empacotado com esbuild num único `dist/main.js`. Sem framework. Nomes e comentários em português, como no protótipo (`prototypes/sitio-minimo`, que serve de referência de estilo de código e de ferramentas de teste, não de base).
- **Desenho em Canvas 2D** (isométrico por conta própria, figuras 2D ordenadas por profundidade). **Interface em HTML e CSS** por cima do canvas.
- A lógica (`src/nucleo`) não toca em DOM nem em canvas e roda no Node: é assim que os testes e o jogador automático funcionam.
- Hospedagem de teste (página de artefato): `dist/` só pode ter `.html`, `.js`, `.json` e `.png`; nada de `?` em endereços; sem `alert`, `confirm`, `prompt`, service worker, downloads, Web Share. Tela cheia, áudio e área de transferência só dentro de um clique e com `try/catch`. `localStorage` com `try/catch` (pode faltar): o jogo tem de abrir e funcionar sem ele. Opções de endereço só por `#palavra` (letras, dígitos e hífens, separadas por vírgula não: uma palavra só; use `-` para juntar).
- Alvos: celular fraco deitado, navegador de computador, TV com controle remoto. Meta de 60 quadros por segundo em celular médio e 30 no fraco.

## Pastas

```
jogo/
  package.json     scripts: build, testar, verificar, bot, servir
  build.mjs        gera dist/ (index.html, main.js, arte/*.png, arte/atlas.json)
  index.html
  dados/           conteúdo e números do jogo, em JSON (dono: economia)
  arte/            peças prontas para o jogo e catalogo/<grupo>.json (dono: arte)
  src/
    main.js        só liga as partes
    nucleo/        lógica pura
      sistemas/    um arquivo por sistema; index.js só importa cada um
    render/        canvas isométrico, atlas, câmera, partículas, figuras de reserva
    entrada/       toque, teclado, controle de videogame, controle de TV
    ui/            HUD, painéis (ui/paineis/, um por arquivo; index.js só importa), tutorial, avisos
    plataforma/    gravação, tela cheia e orientação, áudio, compartilhar
  tools/           build, empacotador de atlas, servidor, verificação no navegador, jogador automático
  testes/          testes da lógica (node:test)
```

Para várias frentes trabalharem ao mesmo tempo: cada funcionalidade nova é um arquivo novo em `nucleo/sistemas/`, outro em `ui/paineis/` e outro em `testes/`, registrados por uma linha no `index.js` da pasta. Evite editar arquivo alheio; quando precisar, mude o mínimo.

## Mundo, tempo e comandos

- `Mundo` guarda todo o estado. `mundo.passo()` avança `PASSO = 1/60 s`. O relógio (`mundo.agora`, em ms) é injetado: no jogo vem do relógio de verdade, nos testes é avançado à mão. Nada na lógica lê `Date.now()` nem `Math.random()` (há um sorteio com semente em `nucleo/util.js`).
- Tudo que dura (crescimento, produção, obra, fila) guarda **instantes absolutos** (`prontoEm`) ou tempo acumulado que se resolve por conta; ao abrir o jogo, `mundo.acertarRelogio(agora)` deixa cada sistema resolver a ausência com `sistema.ausencia(mundo, segundos)`, sem simular passo a passo.
- **Locais**: `mundo.locais[id]` (`fazenda`, `celeiro`, ...), cada um com malha própria, entidades e ponto de entrada. A personagem está em um local por vez.
- **Comandos**: toda entrada do jogador vira `mundo.comando({ tipo, ... })`, que devolve `{ ok, motivo }`. Toque, teclado, tutorial, testes e jogador automático usam os mesmos comandos. Exemplos: `tocarCasa`, `tocarEntidade`, `rumar`, `frear`, `escolherModo`, `comprar`, `construir`, `entrar`, `sair`.
- **Eventos**: `mundo.eventos.emitir(tipo, dados)` e `ouvir(tipo, fn)`. A interface, o som, as partículas, as missões e as conquistas reagem a eventos (`colheu`, `plantou`, `regou`, `vendeu`, `subiuDeNivel`, `comprou`, `construiu`, `recolheu`, `produziu`, `faltou`...). A lógica nunca chama a interface.
- **Sistemas** (`registrarSistema`): `{ id, iniciar(mundo), passo(mundo), segundo(mundo), ausencia(mundo, seg), comandos: { nome(mundo, args) }, salvar(mundo), carregar(mundo, dados) }`. Só `passo` roda 60 vezes por segundo; o que é lento usa `segundo`.
- **Ações da personagem** (`registrarAcao`): `{ id, ferramenta, dur, efeitoEm, estadoVisual, pode(mundo, alvo), aoEfeito(mundo, alvo) }`. A personagem tem uma **fila de tarefas** (andar até, agir, buscar ferramenta, guardar); um toque pode enfileirar várias.
- **Tipos de entidade** (`registrarTipo`): construções, árvores, animais, objetos soltos. `{ tipo, casas: [l, p], bloqueia, pontos, acaoPossivel(mundo, e) → { acao, texto }, visual(mundo, e) → { chave, quadro|fase, espelhar, extras } }`.
- **Gravação**: `mundo.salvar()` devolve um objeto com versão e o estado de cada sistema; `Mundo.carregar(dados, obj)` refaz. Gravação automática a cada 10 s e ao esconder a página; chave `fazenda.jogo.v1`. Há exportar e importar por texto nas configurações. Mudança de formato pede migração e teste.

## Terreno e projeção

- Malha de casas de 1 unidade; o mundo usa X e Z no chão e Y para cima. A câmera olha de (+X, +Z): na tela, +X desce para a direita e +Z desce para a esquerda.
- Projeção (E = pixels por unidade, o zoom): `tx = (x - z) · 0,7071 · E`; `ty = (x + z) · 0,4082 · E - y · 0,8165 · E`. Uma casa é um losango de 1,4142·E por 0,8165·E. É a mesma câmera das imagens do Codex (isométrica verdadeira: 45° de giro, 35,264° de inclinação).
- Ordem de desenho: chão (em blocos guardados em canvas fora da tela, refeitos só quando mudam), depois entidades e personagem ordenados por `x + z`, depois efeitos, depois a interface. Só se desenha o que está na tela.
- O chão (grama, terra arada seca e molhada, caminho) é desenhado por código no estilo de contorno: cor chapada, detalhe leve e traço escuro só na borda de fora de cada mancha. Objetos, plantas, bichos e personagem são peças do catálogo de arte.
- Caminho da personagem: A* na malha, com as casas ocupadas pelas entidades; o movimento é contínuo.

## Arte: o catálogo

O jogo só conhece o catálogo: os arquivos `jogo/arte/catalogo/<grupo>.json` (`personagem`, `animais`, `objetos`, `culturas`, `icones`, `retratos`, `interface`...), todos no formato abaixo, que o build junta. É um arquivo por grupo para duas frentes de arte não escreverem no mesmo arquivo. Quem produz arte entrega a peça e a linha no catálogo; quem programa pede a peça pela chave. **Peça que ainda não existe é desenhada por uma figura de reserva** (forma simples com o nome), para o jogo nunca depender da arte para funcionar.

```json
{
  "escala": 128,
  "pecas": {
    "personagem/andar-frente": { "arquivo": "personagem/andar-frente.png", "quadros": 8, "casa": [256, 352], "apoio": [128, 330], "qps": 12, "laco": true },
    "objeto/poco": { "arquivo": "objetos/poco.png", "quadros": 1, "casa": [300, 380], "apoio": [150, 330] }
  }
}
```

- `escala`: pixels por unidade de mundo em que as peças foram feitas (128). O empacotador do build pode reduzir.
- `arquivo`: PNG com fundo transparente, dentro de `jogo/arte/`. Animação é uma folha de uma linha só, quadros do mesmo tamanho, da esquerda para a direita.
- `casa`: tamanho de um quadro. `apoio`: o ponto do quadro que cai sobre o ponto do chão da entidade (meio dos pés; nos objetos, o canto da frente da base ou o centro da base, dito em `ancora`: `"centro"` é o padrão).
- Chaves: `personagem/<acao>-<frente|costas>`, `animal/<bicho>/<acao>-<frente|costas>`, `objeto/<nome>[-<estado>]`, `cultura/<nome>-<1..n>`, `arvore/<nome>-<estagio>`, `icone/<item>`, `retrato/<quem>[-<humor>]`, `ui/<nome>`, `efeito/<nome>`.
- **Direções**: toda figura que anda tem dois desenhos. `frente`: de frente para a câmera, três quartos, indo para a **esquerda e para baixo** da tela (+Z). `costas`: de costas, indo para a **direita e para cima** (-Z). O jogo espelha para as outras duas direções.
- Tamanhos: use `docs/planejamento/escala.json` (pessoa com 2,0 unidades de altura; a figura da personagem ocupa cerca de 2,3 unidades de tela, por ser cabeçuda).
- O build junta as peças em páginas de atlas (no máximo 2048 por 2048, peças aparadas) por grupo, e grava `dist/arte/atlas.json`. Cada grupo só é baixado quando é usado.

## Dados (`jogo/dados/*.json`)

Os números do jogo ficam fora do código. O porquê de cada um está em `docs/jogo/economia.md`. Antes de gravar uma mudança, rode `node jogo/tools/economia/validar.mjs` (coerência) e `node jogo/tools/economia/ritmo.mjs` (ritmo). Formatos:

| Arquivo | Conteúdo |
|---|---|
| `regras.json` | `inicio` (`ouro`, `cash`, `cesto`, `cinto`: ferramentas à mão, `suporte`, `vagasNoCinto`, `itens`); `personagem` (`andar`, `correr`, `correrAcimaDe`, `alcance`); `folego` (`max`, `gastoPorSeg`, `recuperaAndando`, `recuperaParado`); `acoes`: segundos de cada ação (`arar`, `semear`, `regar`, `colher`, `encher`, `vender`, `guardar`, `pegar`, `pegarFerramenta`, `rocar`, `cortar`, `quebrar`, `plantarMuda`, `colherFruta`, `recolherOvo`, `ordenhar`, `tosquiar`, `abastecerCocho`, `abastecerBebedouro`, `entregarPedido`, `abastecerFila`, `retirarProduto`, `colocarConstrucao`, `montarMovel`, `ararComBoi`, `montar`, `apear`, `afagar`, `encherBarril`, `encherNoBarril`); `xp`: experiência por ação (arar, semear, regar, construir e tratar valem 0: a experiência vem do resultado); `filaMax`: quantas ordens a personagem enfileira; `lavoura` (`sementesPorCasa`, `reararAposColher`, `plantaSemAguaEspera`); `celeiro.capacidade` (vale enquanto o celeiro por dentro não existe); `animais` (`semTratoRende`, `aguasPorRega`); `industria` (`filaInicial`, `cancelarDevolve`); `construir` (`mudarDeLugar: "gratis"`, `usaMaterialDoCeleiro`); `desgaste` (`rendeQuandoGasta`, `avisoEm`, `consertoFracao`); `concluir` (`coef`, `expoente`, `gratisAteSeg`, `vale`: o que o cash pode concluir); `antiTrava` (`semente`, `quantidade`); `estimacao.mimosPorDia` |
| `itens.json` | `{ id: { nome, tipo, venda, compra, nivel, descricao } }`. Sem `compra` não aparece na loja de ouro; sem `venda` a banca não compra. Tipos: `colheita`, `produto`, `semente`, `muda`, `material`, `racao`, `embalagem`, `ferramenta`, `recipiente`, `cosmetico`. Semente tem `cultura`; muda tem `arvore`. Ferramenta e recipiente têm `funcao` (`enxada`, `regador`, `foice`, `machado`, `picareta`, `plantadeira`, `arado`, `tesoura`, `balde`, `caixa-de-ovos`, `sela`, `cesto`, `cinto`, `carroca`, `barril`), `degrau` (posição na escada daquela função; a loja mostra só o próximo), `usos` (0 = não gasta) e `conserto` (ouro); conforme o caso, `capacidade` (quanto leva: regas, coisas ou ferramentas), `rapidez` (multiplica o tempo da ação), `area` (casas por toque, em linha) e `forca` (o que consegue limpar). Cosmético tem `parte` (`chapeu`, `roupa`, `calcado`, `pintura`) |
| `culturas.json` | `{ id: { nome, semente, produto, rende, tempoSeg, estagios, regas, xp, nivel } }` (`regas`: quantas vezes pede água até ficar pronta) |
| `arvores.json` | `{ id: { nome, muda, fruto, cresceSeg, safraSeg, rende, xp, nivel, casas, espacamento, acumula } }` (`espacamento`: casas de distância da árvore vizinha; `acumula`: quantas safras prontas esperam no pé) |
| `animais.json` | `{ id: { nome, familia: "producao" \| "trabalho" \| "estimacao", abrigo (ou `null`), preco: { ouro } ou { cash }, nivel, come: { item: n }, bebe, cicloSeg, xp, descricao } }`. Produção: `produto`, `rende`, `acumula` (quantos produtos esperam), `ferramenta`, `vidaProdutiva` (ciclos) e `fimDeVida: { frigorifico, fazendeiro }` (ouro da venda). Trabalho e estimação: `efeito` (`{ tipo: "arar", casas, seg }`, `{ tipo: "carga", recipiente }`, `{ tipo: "montaria", velocidade, semFolego }`, `{ tipo: "mimo", porDia, sorteia: [{ item: n }] }`), `exige: [item]` (arado, carroça, sela) e `especial: true` nos que só se compram com cash |
| `construcoes.json` | `{ id: { nome, tipo: "abrigo" \| "industria" \| "armazem" \| "util" \| "movel" \| "decoracao", onde: "fazenda" \| "celeiro", casas: [l, p], nivel, descricao, custo: { ouro, itens } ou { cash }, obraSeg, exige: [], limite, xp } }`. `inicial: true`: já vem na fazenda (o lugar está em `terras.pontos`). Abrigo: `vagas`, `cocho`, `bebedouro`. Indústria: `fila`. Móvel: `guarda` (`produtos`, `materiais` ou `ferramentas`) e `capacidade`. Celeiro: `interior: { piso: [l, p], moveis: [{ id, x, z }] }`. `efeito` (aspersor: `{ tipo: "regar", raio }`). `ampliacoes`: lista em ordem, `{ nome, nivel, custo: { ouro, itens }, obraSeg, xp }` mais o que muda (`vagas`, `cocho`, `bebedouro`, `fila`, `piso`); a vaga de fila tem também `cash`: o jogador paga com ouro **ou** com cash |
| `receitas.json` | `{ id: { nome, onde, entra: { item: n }, sai: { item: n }, tempoSeg, xp, nivel } }` |
| `terras.json` | `mapa: { largura, profundidade }`; `inicial: { area, limpo, natureza }` (o miolo `limpo` vem sem obstáculo); `pontos: { nome: [x, z] }` (casa, celeiro, poço, banca, quadro de pedidos, personagem, vizinho, porteira, lavoura); `caminhos: [[x0, z0, x1, z1]]`; `natureza`: chance por casa de cada obstáculo fora dos lotes; `obstaculos: { id: { nome, ferramenta, resistencia, forcaMinima, da: { item: n }, chance, xp } }` (`mato`, `toco`, `pedra`, `mata`); `lotes: [{ id, nome, area, preco, nivel, exige: [lote], natureza, xp, descricao }]` (`preco` é um número, em ouro; `natureza` é a mistura daquele lote). Área = `[x0, z0, x1, z1]`, com x1 e z1 de fora |
| `niveis.json` | `maximo`; `conteudoAte` (último nível que libera novidade); `xp`: lista em que `xp[n-1]` é a experiência total para chegar ao nível n; `recompensas: { nivel: { ouro, cash, itens } }`. O que cada nível libera sai dos campos `nivel` dos outros arquivos |
| `pedidos.json` | `nivel` (quando o quadro abre); `vagas: [{ nivel, vagas }]`; `valorAlvo: { base, expoente, variacao }`; `bonusOuro`; `xpPorOuro`; `esperaSeg: { base, porNivel, max }`; `descartar.esperaVezes`; `trocaGratisAposSeg`; `linhas: [{ ateNivel, pesos }]` (quantos itens diferentes o pedido traz); `categorias` (peso de cultura, fruta, animal e receita); `loteMaximo`; `regras`; `fora`; `clientes: [{ id, nome }]` |
| `missoes.json` | `quem` (o vizinho); `eventos.lista`: os eventos que a lógica emite e os campos de cada um; `vizinho`: sequência `{ id, nivel, titulo, fala, objetivo: { evento, filtro, n }, recompensa: { xp, ouro, cash, itens }, ensina, valeJaTer }`; `conquistas`: `{ id, nome, evento, filtro, soma, conta, marcos: [], recompensas: [{ ouro, cash }] }`; `diaria: { avancaPor: "dia-jogado", zeraAoFaltar: false, dias: [{ dia, recompensa, primeiraVolta }] }`; `convite: { ligado, amigoChegaAoNivel, recompensaPorAmigo, limite, convidado }`; `compartilhar: { ligado, recompensa, limitePorDia }` |
| `loja.json` | `ouro.abas: [{ id, nome, tipos, fonte, filtro, soProximoDegrau }]`: a loja de ouro vende todo item com `compra`, mais animais, construções e lotes (cada um no seu arquivo); `cash`: `compraSimulada`, `cashPorReal`, `pacotes: [{ id, nome, cash, precoBRL }]` e `ofertas: [{ id, nome, tipo: "cosmetico" \| "estimacao" \| "tempo" \| "vaga", cash, item ou construcao ou animal }]`. As ofertas `concluir-relogio` e `vaga-de-fila` têm `cash: null`: o preço vem de `regras.concluir` e da ampliação em `construcoes.json` |

Regras que valem para todos os arquivos:

- **Filtro** de missão e de conquista: todo campo do filtro tem de bater com o do evento; uma lista vale por "qualquer um destes". Chaves aceitas: `item`, `cultura`, `arvore`, `animal`, `construcao`, `onde`, `abrigo`, `lote`, `familia`, `classe`, `obstaculo`, `com`, `parte`.
- **Recompensa**: `ouro`, `cash`, `xp`, `itens: { item: n }`. Na diária, no convite e no compartilhar existe também `ouroPorNivel`, que multiplica o nível do jogador.
- **`valeJaTer`** (missão de comprar ou construir): se o jogador já tem a coisa quando a missão fica ativa, ela se cumpre na hora. Sem isso o jogador que se adianta fica preso.
- A ferramenta que uma missão pede vem em `recompensa.itens` da missão anterior.
- Conquista: `soma` troca o que se soma (por exemplo `"ouro"`); `conta: "nivel"` usa o nível alcançado em vez de somar.
- Chave `nota` é comentário para quem lê o arquivo; o jogo ignora.

Todo `id` é minúsculo, sem acento, com hífen. Texto que o jogador lê fica em português nos próprios dados (`nome`, `fala`, `descricao`); tradução fica para depois, então não espalhe texto pelo código: o que não vier dos dados fica em `src/ui/textos.js`.

## Interface e controles

- Disposição para tela deitada. Em celular em pé o jogo gira 90° por CSS (com as coordenadas de toque corrigidas) e pede para deitar o aparelho. Botão de tela cheia.
- HUD: nível e barra de experiência, ouro, cash, fôlego, cesto (quanto leva), barra de modo (mão, enxada, semear com a semente escolhida, regar...), botões dos painéis, linha de dica do que o toque ou o botão de ação vai fazer.
- Painéis (`registrarPainel`): loja, mochila e celeiro, pedidos, missões, conquistas, recompensa diária, convidar, configurações. Todo painel fecha com um botão visível, com Esc e com o botão de voltar; todo elemento que se usa tem foco navegável pelas setas (TV).
- Toque: tocar numa casa ou entidade manda a personagem ir e fazer; tocar em várias enfileira; com um modo de ferramenta ativo, arrastar pinta as casas; sem modo, arrastar move a câmera (ela volta a seguir quando a personagem anda); pinça dá zoom. Alavanca na tela é opção das configurações.
- Teclado: setas ou WASD andam, Shift corre, Espaço ou Enter agem na casa ou entidade destacada à frente dela, Q e E trocam o modo, Esc fecha. Controle de videogame: alavanca anda, A age, B fecha, ombros trocam o modo. Controle de TV: direcional anda, OK age, voltar fecha.
- Tutorial: o vizinho fala num balão com retrato, uma seta aponta o alvo, e o passo só avança quando o evento esperado acontece. Subir de nível e ganhar recompensa têm tela própria com animação.
- Sem texto pequeno: nada abaixo de 14 px em celular; alvos de toque de 44 px ou mais.

## Testes e ferramentas

- `npm run testar`: testes da lógica com `node:test` (rápidos, sem navegador). Toda regra nova entra com teste.
- `npm run bot`: jogador automático que joga N horas simuladas só com comandos e imprime o ritmo (ouro e experiência por hora, nível por tempo, onde travou). É a régua da economia.
- `npm run verificar`: Chromium sem janela (Playwright já instalado na máquina; veja `prototypes/sitio-minimo/tools/comum.mjs`): abre, joga o começo por comandos e por toques de verdade, grava e recarrega, confere celular deitado e em pé, teclado, painéis e que não há erro no console. Termina com `Tudo certo.` ou lista as falhas.
- `window.__jogo` expõe ganchos para as ferramentas (estado, comandos, avançar o relógio, posições na tela). O endereço `#teste` liga o modo em que o tempo só anda quando a ferramenta manda.
- Quem termina uma parte roda `npm run build`, `npm run testar` e `npm run verificar`, e relata o que passou e o que não foi testado. Subagentes não fazem commit: a sessão principal grava.
