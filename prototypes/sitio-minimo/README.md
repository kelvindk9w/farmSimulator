# Sítio mínimo

Este é um protótipo jogável, pequeno, feito para responder a duas perguntas antes de começar o jogo de verdade.

1. Cada tipo de objeto do sítio funciona e tem uma animação que dá gosto de ver? Aqui há um objeto de cada tipo: personagem, canteiro, poço, celeiro, vaca, galinha com ninho e laranjeira.
2. Dá para trocar a arte de **um** objeto sem mexer nas regras do jogo? Aqui a arte de cada tipo fica atrás de uma interface pequena, e há dois conjuntos de arte que se trocam com o jogo andando.

Não é o jogo. Não tem economia, níveis, gravação de progresso nem cenário além do necessário.

O que a arte de cada tipo precisa entregar está em [CONTRATO-DE-ARTE.md](CONTRATO-DE-ARTE.md).

## Como rodar

É preciso ter o Node.js 20.9 ou mais novo. Aqui foi usado o Node.js 22.

```
npm install
npm run build
npm run servir
```

O primeiro comando baixa as dependências. O segundo monta a pasta `dist/`, que tem só dois arquivos: `index.html` e `main.js`. O terceiro serve essa pasta em `http://localhost:8090/`.

Para abrir no celular, pela mesma rede sem fio, rode `node tools/servir.mjs dist 8090 --rede`. O comando mostra o endereço que deve ser digitado no celular.

A pasta `dist/` pode ser publicada como está em qualquer hospedagem de arquivos estáticos. Ela não usa nada depois de `?` no endereço e não tem arquivos `.glb`.

As opções vão depois de `#` no endereço, separadas por vírgula:

| Opção | O que faz |
|---|---|
| `#demo` | Abre já na demonstração. |
| `#arte-molde` ou `#arte-codigo` | Escolhe o conjunto de arte inicial. |
| `#perto` ou `#tudo` | Escolhe o enquadramento inicial. Sem a opção, a tela estreita abre de perto e a tela larga abre vendo tudo. |
| `#sem-hud` | Esconde a interface. |
| `#passo` | Modo das ferramentas: a simulação só anda quando a ferramenta manda. |

Exemplo: `http://localhost:8090/#demo,arte-molde`.

## Como jogar

- Toque ou clique num objeto. O personagem anda até ele e faz a ação que faz sentido naquele momento.
- Toque no chão. O personagem anda até o ponto tocado.
- Antes de agir, a linha no pé da tela diz o que o objeto tocado vai fazer, ou por que ainda não dá para fazer nada com ele.
- O botão **Demonstração** recomeça o sítio e faz um passeio fixo que executa cada ação uma vez. Durante o passeio a tela não aceita comandos. Quando o passeio acaba, o controle volta sozinho. Tocar no botão antes do fim interrompe o passeio e recomeça o sítio.
- O botão **Arte** troca o conjunto de arte de todos os objetos de uma vez, sem recarregar a página e sem parar o que está acontecendo.
- O botão **Ver de perto / Ver tudo** troca o enquadramento. De perto, a câmera acompanha o personagem, e dá para arrastar o dedo para olhar em volta.

No alto ficam três contadores: a água no regador, o que o personagem leva na mão e o que já está guardado no celeiro.

## O que cada objeto faz

| Objeto | O que ele faz sozinho | O que o toque faz |
|---|---|---|
| **Canteiro** (dois) | Passa por vazio, semeado, broto, crescendo e pronto. Só cresce depois de regado; a terra regada fica mais escura. O ciclo dura 17,5 s depois da rega. | Vazio: plantar milho. Plantado e seco: regar, o que gasta 1 de água. Pronto: colher, o que dá 1 milho. |
| **Poço** | Nada. | Tirar água: o personagem gira a manivela, o balde sobe e despeja, e o regador fica com 3 de água. |
| **Celeiro** | Nada. | O personagem vai até a porta, a porta abre, ele entra e some, o que ele levava passa para o estoque do celeiro, ele sai e a porta fecha. |
| **Vaca** | Fica parada (respira, abana o rabo, mexe as orelhas), pasta (cabeça baixa, mastiga) e anda devagar pelo pasto. Quando o leite fica pronto, ela vai até o ponto de ordenha e aparece um aviso em cima dela. O primeiro leite fica pronto aos 6 s. Depois de cada ordenha, o leite seguinte leva 25 s. | Com o leite pronto: ordenhar, o que dá 1 leite. |
| **Galinhas** (duas) | Andam, bicam o chão e de vez em quando batem as asas. Fogem um pouco quando o personagem chega perto. A branca bota: sobe no ninho, fica um tempo e deixa um ovo. Ela vai para o ninho pela primeira vez aos 2 s, e o ovo aparece perto dos 6 s. Depois que o ovo é pego, ela volta a botar em 15 s. | Tocar na galinha é o mesmo que tocar no ninho. |
| **Ninho** | Guarda o ovo. | Com ovo: pegar o ovo, o que dá 1 ovo. |
| **Laranjeira** | Balança de leve. A árvore começa com duas laranjas maduras. Uma laranja nova leva 12 s para amadurecer, e cabem três na árvore. | Com fruta madura: colher. O personagem estica o braço, a copa sacode, a fruta solta e ele fica com 1 laranja. |
| **Chão, cerca e caminho** | Nada. | O personagem anda até o ponto tocado. Ele dá a volta na cerca e nos objetos e entra no pasto pela porteira. |

Os tempos são curtos de propósito, para ver tudo acontecer em meio minuto. Eles estão em `src/jogo/contrato.js`.

## A demonstração

O passeio fixo faz, nesta ordem: tirar água no poço, plantar milho, regar, pegar o ovo, guardar no celeiro, colher uma laranja, ordenhar a vaca, voltar ao canteiro e colher o milho. Ele termina em 1756 passos de simulação, que são 29,3 s.

Como a lógica é determinística, o passeio acontece sempre nos mesmos passos, com qualquer conjunto de arte. A verificação automática confere isso.

## Como o código está organizado

| Pasta ou arquivo | O que tem |
|---|---|
| `src/jogo/` | As regras. Anda em passos fixos de 1/60 de segundo, com sorteio de semente fixa. Cada coisa do sítio é uma máquina de estados. Não importa `three` e não toca na página; por isso roda também no Node, sem navegador. |
| `src/jogo/contrato.js` | Os números que a lógica e a arte dividem: durações das ações, pontos onde o personagem para, comprimento das passadas. |
| `src/jogo/sitio.js` | Onde fica cada objeto. |
| `src/jogo/roteiro.js` | O passeio da demonstração. |
| `src/arte/registro.js` | O registro `conjunto de arte → tipo de objeto → fábrica` e a conferência do contrato. |
| `src/arte/codigo/` | O conjunto de verdade, modelado e animado por código. O personagem reaproveita o avatar de `tools/visual-refs/src/avatar/`. |
| `src/arte/molde/` | O conjunto de molde: formas cinza e lisas, com os mesmos estados e os mesmos pontos. |
| `src/cena/` | A câmera, a luz e a ponte que lê a lógica e entrega o estado a cada visual. |
| `src/ui/` | A interface em HTML por cima da tela de desenho. |
| `config/arte.json` | Qual conjunto de arte cada tipo usa ao abrir. |
| `tools/` | As ferramentas de verificação, captura e medida. |
| `capturas/` | As imagens e o vídeo gerados pelas ferramentas. |

## Como trocar a arte de um objeto

1. Crie um arquivo em `src/arte/` com a fábrica do tipo que você quer trocar e registre com `registrarConjunto('nome', 'Rótulo', { vaca: fabricaDaVaca })`. O conjunto não precisa ter todos os tipos.
2. Importe o arquivo em `src/main.js`, junto dos outros dois conjuntos.
3. Em `config/arte.json`, aponte o tipo para o conjunto novo: `{ "padrao": "codigo", "porTipo": { "vaca": "nome" } }`.
4. Rode `npm run build` e depois `npm run verificar`.

O arquivo de configuração entra no `main.js` na hora do build. Por isso, mudar a configuração pede um build novo. Com a página aberta, a troca é feita pelo botão "Arte".

Os estados, os dados e os pontos que cada tipo tem de suportar estão em [CONTRATO-DE-ARTE.md](CONTRATO-DE-ARTE.md). O conjunto `molde` cabe num arquivo só e serve de exemplo curto.

## Ferramentas

| Comando | O que faz |
|---|---|
| `npm run build` | Monta `dist/` e mostra o tamanho dos arquivos. |
| `npm run servir` | Serve `dist/` em `http://localhost:8090/`. |
| `npm run simular` | Roda a demonstração só com a lógica, no Node, sem navegador. Confere que o passeio chega ao fim e que duas execuções dão o mesmo resultado. |
| `npm run verificar` | A verificação completa, descrita abaixo. Leva alguns minutos. |
| `npm run capturas` | Refaz tudo o que está em `capturas/`. Os vídeos são a parte demorada; `node tools/capturar.mjs --sem-video` pula os vídeos. |
| `npm run medir` | Mede o tamanho do download e as chamadas de desenho. |
| `node tools/olhar.mjs` e `node tools/folha.mjs` | Ferramentas de trabalho: uma foto num passo qualquer e uma folha com vários instantes lado a lado. O modo de usar está no começo de cada arquivo. |

As ferramentas que abrem o navegador usam o Chromium e o Playwright que já estão instalados na máquina. O Playwright não está no `package.json`.

## Medidas

Tamanho do que o navegador baixa (pasta `dist/`):

| Arquivo | Bruto | gzip | brotli |
|---|---|---|---|
| `index.html` | 3,5 KB | 1,4 KB | 1,1 KB |
| `main.js` | 867,3 KB | 235,4 KB | 193,8 KB |
| **Total** | **870,8 KB** | **236,8 KB** | **194,9 KB** |

Do `main.js`, 737 KB são a biblioteca three, 99 KB são o código deste protótipo e 31 KB são o avatar e o construtor de malhas reaproveitados de `tools/visual-refs`. Não há imagens nem modelos para baixar: tudo é gerado por código.

Desenho da cena inteira, numa tela de 1280 por 720:

| Conjunto | No começo | Pico durante a demonstração |
|---|---|---|
| `codigo` | 22 chamadas de desenho e 18.596 triângulos | 26 chamadas e 19.192 triângulos |
| `molde` | 85 chamadas de desenho e 1.480 triângulos | 92 chamadas e 1.700 triângulos |

No conjunto `codigo`, cada objeto é uma malha só: as peças são fundidas, e as que se mexem ficam presas a ossos. As sombras são manchas no chão, sem mapa de sombra. O conjunto `molde` não tem esse cuidado, porque é só um molde: cada forma é uma malha separada, e por isso ele faz mais chamadas com menos triângulos.

A tela de desenho usa no máximo 2 pixels por ponto. Numa tela de celular de 390 por 844 pontos com 3 pixels por ponto, a tela de desenho fica com 780 por 1688 pixels.

Quadros por segundo não foram medidos. Nesta máquina o WebGL roda em software, e o número não diria nada sobre um celular.

## O que foi verificado

`npm run verificar` passa. Ele confere, num Chromium sem janela:

- A pasta `dist/` só tem arquivos `.html`, `.js`, `.json` ou `.png`, e o código não usa `?` no endereço, `alert`, `confirm`, `.glb` nem service worker.
- A demonstração chega ao fim com o conjunto `codigo` e com o conjunto `molde`, em menos de 30 s, com as oito ações feitas e com a mudança esperada nos contadores depois de cada uma.
- Os dois conjuntos passam pelos mesmos estados de jogo nos mesmos passos. A comparação é feita a cada meio segundo de demonstração.
- Trocar a arte no meio da demonstração não muda o jogo. São quatro trocas: todos os tipos de uma vez, só a vaca, pelo botão "Arte" e pelo endereço.
- A cada meio segundo, todos os visuais continuam cumprindo o contrato: os pontos estão no lugar e nenhuma peça tem posição, giro ou escala inválidos.
- Toques de verdade funcionam em três telas: celular em pé (390 por 844, toque), celular deitado (844 por 390, toque) e computador (1280 por 720, mouse). Em cada uma: andar até um ponto do chão, tirar água, plantar, regar, pegar o ovo, guardar no celeiro (com a porta fechando no fim) e os botões "Arte" e "Demonstração". Nas duas telas de celular, também arrastar a câmera com o dedo sem dar comando.
- O laço normal do jogo, em tempo real, anda sozinho com `#demo`.
- Nenhuma página escreve erro no console.

Além disso, foi conferido à mão:

- Uma cópia limpa dos arquivos que vão para o repositório, com `npm ci` e `npm run build`, gera um `dist/` idêntico byte a byte ao de trabalho.
- Com `config/arte.json` apontando a vaca e a laranjeira para `molde` e o resto para `codigo`, o build abre com a mistura certa, o botão mostra "Arte: misto" e a demonstração termina no mesmo estado de jogo.
- Um conjunto de teste que só tinha a vaca funcionou pelo arquivo de configuração, pelo botão "Arte" e pelo endereço. Os tipos que faltavam nele ficaram com a arte que já tinham, e o jogo terminou no mesmo estado.
- Cada animação foi olhada numa folha de contato, e o que estava duro, escorregando, atravessando ou sumindo foi corrigido. As folhas finais estão em `capturas/folhas/`.

## O que não foi verificado

- Nenhum celular de verdade. O toque foi testado com o toque emulado do Chromium.
- Nenhum outro navegador. Safari do iPhone e Firefox não foram testados.
- Quadros por segundo e consumo de bateria.
- A publicação na hospedagem. Só foi conferido que os arquivos têm os tipos aceitos e que nada depende de `?` no endereço.
- Sessões longas. O teste mais longo no navegador andou 30 s de simulação. Só com a lógica, sem desenho, o mais longo andou 60 s.
- Ordenhar, colher a laranja e colher o milho com toques de verdade. Essas três ações só foram testadas pela demonstração, porque dependem de tempos de espera.

## Como ficaram as animações

Estas ficaram boas de ver nas folhas de contato: tirar água no poço, regar, colher o milho, pegar o ovo, entrar e sair do celeiro, colher a laranja, a corrida e o andar com o caixote, a vaca parada, pastando e andando, e a galinha andando, bicando e botando.

Estas ficaram mais fracas, e convém saber por quê:

- **Plantar.** É o gesto mais discreto. Ele pega as sementes no saquinho e joga quase de pé, com um movimento curto do braço. Lê-se mais pelas sementes voando e pousando no canteiro do que pelo corpo.
- **Ordenhar.** A cerca e o corpo da vaca obrigam a mostrar o personagem meio de costas. As mãos ficam escondidas atrás do corpo dele. Lê-se pelo banquinho, pelo balde, pelo balanço dos ombros e pela vaca, que vira a cabeça. O jato de leite não aparece.
- **Colher a laranja.** O personagem tem a cabeça grande e o braço curto, e uma mão erguida para cima nunca passa da cabeça na tela. Por isso ele fica de frente para a câmera e colhe a fruta num galho baixo, ao lado da cabeça, e não acima dela.
- **Bater as asas da galinha.** As asas abrem para os lados e, de cima, viram uma barra horizontal. Dá para ver, mas é discreto.
- **Vaca virando no ponto de ordenha.** Ela gira parada por cerca de 2 s, e os cascos não acompanham o giro.
- **Andar e correr.** Os ciclos vêm de `tools/visual-refs` e foram ajustados para o pé de apoio escorregar menos. Sobra um escorregão de 4 a 5 por cento da passada, que quase não se nota neste tamanho.
- **Poço.** A coreografia é simplificada: o regador pula da mão para a borda do poço, e o balde despeja sozinho.
- **Conjunto `molde`.** As formas são toscas de propósito e as animações são só o mínimo para cada estado ficar reconhecível.

## Onde o protótipo se afasta do pedido

- O personagem usa um lenço na cabeça em vez do chapéu de palha. A aba do chapéu escondia os braços nas ações, vista de cima.
- Há um terceiro botão, "Ver de perto / Ver tudo". Num celular em pé, o sítio inteiro fica pequeno demais para ver as animações.
- O personagem corre quando o caminho é longo e ele não leva nada. Com as mãos ocupadas, a caminho do celeiro, ele anda.
- O balde e o banquinho da ordenha são parte da arte do personagem, e não da vaca.
- O pasto tem uma abertura no lugar da porteira. Não há portão que abre.
- A escolha de arte por tipo é lida de `config/arte.json` na hora do build, e não com a página aberta.
- Os vídeos são WebM com VP8. O codificador VP9 não está disponível nesta máquina. São dois vídeos em vez de um, porque no vídeo do sítio inteiro o personagem fica pequeno.

## O que há em `capturas/`

| Arquivo | O que mostra |
|---|---|
| `cena-paisagem.png` | O sítio inteiro, em tela deitada, com o conjunto `codigo`. |
| `cena-molde.png` | O mesmo instante com o conjunto `molde`. |
| `acoes-codigo.png` | Um quadro do meio de cada uma das oito interações. |
| `acoes-molde.png` | Os mesmos oito quadros com o conjunto `molde`. |
| `celular-retrato.png` | Tela de celular em pé, como abre: de perto, acompanhando o personagem. |
| `celular-retrato-tudo.png` | Tela de celular em pé, vendo o sítio inteiro. |
| `celular-paisagem.png` | Tela de celular deitada. |
| `demonstracao.webm` | A demonstração inteira, vendo o sítio todo, em 960 por 540, com 29,8 s. |
| `demonstracao-de-perto.webm` | A mesma demonstração de perto, com a câmera acompanhando o personagem. É onde as ações do personagem aparecem melhor em movimento. |
| `folhas/*.png` | Uma folha de contato por animação: cada ação do personagem, a vaca parada, pastando e andando, a galinha andando, bicando, batendo as asas e botando, e as fases do canteiro. |
