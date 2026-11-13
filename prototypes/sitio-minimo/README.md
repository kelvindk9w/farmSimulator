# Sítio mínimo

Este é um protótipo jogável, pequeno, feito para responder a duas perguntas antes de começar o jogo de verdade.

1. Cada tipo de objeto do sítio funciona e tem uma animação que dá gosto de ver? Aqui há um objeto de cada tipo: personagem, canteiro, poço, celeiro, vaca, galinha com ninho e laranjeira.
2. Dá para trocar a arte de **um** objeto sem mexer nas regras do jogo? Aqui a arte de cada tipo fica atrás de uma interface pequena, e há três conjuntos de arte que se trocam com o jogo andando.

Depois veio uma terceira pergunta: o quanto um 3D desenhado em tempo real, com a arte do Codex definindo formas, cores e acabamento, chega perto da imagem de estilo escolhida (`arte/estilo/rodada-01/estilo-a.png`)? O conjunto de arte `brinquedo` é essa tentativa, e é ele que abre. A seção [O conjunto brinquedo](#o-conjunto-brinquedo) diz o que ficou perto da imagem e o que ficou longe.

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
| `#arte-brinquedo`, `#arte-codigo` ou `#arte-molde` | Escolhe o conjunto de arte inicial. Sem a opção, abre o `brinquedo`. |
| `#perto` ou `#tudo` | Escolhe o enquadramento inicial. Sem a opção, a tela estreita abre de perto e a tela larga abre vendo tudo. |
| `#sem-hud` | Esconde a interface. |
| `#passo` | Modo das ferramentas: a simulação só anda quando a ferramenta manda. |

Exemplo: `http://localhost:8090/#demo,arte-molde`.

## Como jogar

- Toque ou clique num objeto. O personagem anda até ele e faz a ação que faz sentido naquele momento.
- Toque no chão. O personagem anda até o ponto tocado.
- Antes de agir, a linha no pé da tela diz o que o objeto tocado vai fazer, ou por que ainda não dá para fazer nada com ele.
- O botão **Demonstração** recomeça o sítio e faz um passeio fixo que executa cada ação uma vez. Durante o passeio a tela não aceita comandos. Quando o passeio acaba, o controle volta sozinho. Tocar no botão antes do fim interrompe o passeio e recomeça o sítio.
- O botão **Arte** troca o conjunto de arte de todos os objetos de uma vez, sem recarregar a página e sem parar o que está acontecendo. Ele roda pelos três conjuntos: `brinquedo`, `codigo` e `molde`.
- O botão **Ver de perto / Ver tudo** troca o enquadramento. De perto, a câmera acompanha o personagem, e dá para arrastar o dedo para olhar em volta.
- O botão **Medidor** mostra, no pé da tela, quantos quadros por segundo o aparelho está desenhando (a leitura de agora, a menor desde que o medidor foi aberto e o quadro mais demorado do último segundo), mais as chamadas de desenho e os triângulos do conjunto de arte atual. Serve para testar o mesmo sítio num celular fraco ou numa TV.
- O botão **Ver alvo** aparece nos conjuntos que têm uma imagem-alvo (a imagem do Codex que o conjunto tenta reproduzir). Ele abre a imagem ao lado do jogo, na tela deitada, ou embaixo dele, na tela em pé. Tocar na imagem fecha.

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
| `src/arte/codigo/` | O primeiro conjunto, modelado e animado por código, de formas facetadas. O personagem reaproveita o avatar de `tools/visual-refs/src/avatar/`. Os esqueletos e a animação de todos os tipos moram aqui. |
| `src/arte/brinquedo/` | O conjunto que abre. Usa os esqueletos e a animação do `codigo` e desenha de novo cada peça, com formas roliças de brinquedo. Traz a própria luz e o próprio mapa de sombra. |
| `src/arte/molde/` | O conjunto de molde: formas cinza e lisas, com os mesmos estados e os mesmos pontos. |
| `src/cena/` | A câmera, a luz (que vem do conjunto de arte que desenha o chão) e a ponte que lê a lógica e entrega o estado a cada visual. |
| `src/ui/` | A interface em HTML por cima da tela de desenho. |
| `config/arte.json` | Qual conjunto de arte cada tipo usa ao abrir. |
| `tools/` | As ferramentas de verificação, captura e medida. |
| `capturas/` | As imagens e o vídeo gerados pelas ferramentas. |

## Como trocar a arte de um objeto

1. Crie um arquivo em `src/arte/` com a fábrica do tipo que você quer trocar e registre com `registrarConjunto('nome', 'Rótulo', { vaca: fabricaDaVaca })`. O conjunto não precisa ter todos os tipos.
2. Importe o arquivo em `src/main.js`, junto dos outros conjuntos.
3. Em `config/arte.json`, aponte o tipo para o conjunto novo: `{ "padrao": "brinquedo", "porTipo": { "vaca": "nome" } }`.
4. Rode `npm run build` e depois `npm run verificar`.

O arquivo de configuração entra no `main.js` na hora do build. Por isso, mudar a configuração pede um build novo. Com a página aberta, a troca é feita pelo botão "Arte".

Os estados, os dados e os pontos que cada tipo tem de suportar estão em [CONTRATO-DE-ARTE.md](CONTRATO-DE-ARTE.md). O conjunto `molde` cabe num arquivo só e serve de exemplo curto.

## O conjunto brinquedo

O alvo é a imagem `arte/estilo/rodada-01/estilo-a.png`, feita pelo Codex: um sítio de brinquedo, de formas gordinhas e material fosco. Os detalhes de cada objeto vêm das folhas de modelo de `arte/estilo/rodada-02/` (personagem, vaca, galinha, construções e plantio). A imagem `capturas/comparacao-estilo-a.png` põe a referência à esquerda e o jogo à direita, na mesma câmera.

### De onde veio cada coisa

| Coisa | De onde veio |
|---|---|
| Esqueletos, poses, animação, partículas e pontos do contrato | Do conjunto `codigo`, sem mudança. O `brinquedo` só desenha de novo as peças de cada osso. |
| Formas e proporções do personagem, da vaca, da galinha, do celeiro, do poço, da cerca, do canteiro, do milho, da laranjeira, do ninho, do chão e dos objetos de mão | Código novo em `src/arte/brinquedo/`, escrito olhando as folhas de modelo do Codex. |
| Cores | Lidas à mão da imagem de referência e das folhas, e escritas como números na paleta de `src/arte/brinquedo/kit.js`. |
| Rosto do personagem e manchas da vaca | Código: recortes chapados e finos, colados na superfície curva. Não são textura. |
| Luz, sombra projetada e sombra de contato | Código, no ambiente do conjunto (`AMBIENTE` em `kit.js`). |
| Imagens do Codex dentro do jogo | Nenhuma. As imagens do Codex serviram só de referência para olhar. |
| Imagens novas pedidas ao Codex para este conjunto | Nenhuma. O limite era de 8. |

A única textura do conjunto é a mancha da sombra de contato, de 64 por 64 pontos, gerada por código.

### Como é feito

- **Mesma animação, roupa nova.** As fábricas do `codigo` rodam dentro de um "estilo" (`comEstilo`, em `src/arte/codigo/base.js`). O estilo troca o construtor de malhas, o material, a paleta, a sombra de contato e as partículas, e pode trocar o desenho de cada malha. O contrato de arte descreve isso em "Vestir um conjunto com outro estilo".
- **Formas roliças.** O construtor do conjunto (`BuilderBrinquedo`, em `kit.js`) faz caixas de canto redondo, cilindros de borda redonda, cápsulas e bolas, todos com normais suaves. Não há contorno desenhado.
- **Um material só.** Fosco, com a cor em cada vértice. Cada objeto continua sendo uma malha.
- **Luz.** Um sol quente vindo de cima e da esquerda, mais a luz do céu. Não há correção de cor nem efeito em tela cheia.
- **Sombra.** Um mapa de sombra só, de 1024 por 1024 pontos, com a borda borrada. Embaixo de cada objeto há também uma mancha escura esfumada, que assenta o objeto no chão.
- **Economia.** Tudo o que faz sombra é desenhado duas vezes por quadro. Por isso o celeiro, o poço e a laranjeira fazem sombra com uma forma simples e invisível, e as peças pequenas (galinhas, ninho, canteiros, milho) ficam só com a mancha de contato.

### O que ficou perto da referência

- As cores e o clima geral: grama, caminho, terreiro, telha, madeira, céu, luz quente e sombra macia caindo para baixo e para a direita.
- As formas: tudo roliço e sem aresta viva. O terreno é um bloco de borda redonda com uma faixa fina de terra. As telhas são gordas, a cerca tem mourões e réguas roliços, o poço é de blocos de pedra com telhadinho, o canteiro é uma almofada com leiras e a copa da laranjeira é feita de bolas.
- O personagem e os bichos seguem as folhas de modelo. O personagem tem cabeça grande, rosto simples, lenço vermelho com laço, coque, jardineira azul de botões amarelos e botas. A vaca tem focinho rosa grande, orelhas largas, manchas chapadas, coleira e sino. A galinha é quase uma bola, com crista, asas e rabo em gomos.

### O que ficou longe, e por quê

- **A composição.** Na referência os objetos são maiores em relação ao terreno e ficam em outros lugares: o celeiro mais ao centro, e o poço, o personagem e as galinhas bem maiores. A planta do sítio e os tamanhos são da lógica do jogo, que não foi mexida.
- **O acabamento da luz.** A referência tem escuro nos vincos, luz rebatida de uma peça na outra e degradês suaves. Aqui há só a luz direta, a luz do céu e a sombra projetada. O resultado é mais chapado.
- **As juntas.** Braços, pernas e pescoços são peças rígidas, cada uma presa a um osso, e de perto a emenda aparece. Na referência o corpo é uma massa só.
- **As facetas.** Bem de perto, o contorno das bolas e das cápsulas mostra os lados. É o preço do limite de triângulos.
- **A sombra dos detalhes.** As telhas e a copa não fazem sombra nelas mesmas, e as galinhas, o ninho, os canteiros e o milho não projetam sombra.
- **O detalhe pintado.** Não há veio na madeira, pinta na pedra nem brilho suave, porque não há textura.
- **O ângulo dos personagens.** Na referência o personagem e os bichos aparecem quase de frente, como se a câmera estivesse mais baixa só para eles. Com uma câmera só, de cima, vê-se mais o alto da cabeça.
- **O milho.** As plantas são simples, de poucos triângulos.

### O que só chegaria lá por outro caminho

- Corpos de pele contínua, com as juntas dobrando sem emenda, pedem modelos esculpidos, feitos por artista ou por uma IA de imagem para 3D, e pesos suaves em cada vértice.
- O escuro nos vincos e a luz rebatida pedem um modelo com essa luz já pintada na textura ou na cor dos vértices, ou um efeito em tela cheia, que ficou fora do orçamento.
- A composição da referência pede mudar a planta do sítio e o tamanho dos objetos, que são da lógica.

## Ferramentas

| Comando | O que faz |
|---|---|
| `npm run build` | Monta `dist/` e mostra o tamanho dos arquivos. |
| `npm run servir` | Serve `dist/` em `http://localhost:8090/`. |
| `npm run simular` | Roda a demonstração só com a lógica, no Node, sem navegador. Confere que o passeio chega ao fim e que duas execuções dão o mesmo resultado. |
| `npm run verificar` | A verificação completa, descrita abaixo. Leva alguns minutos. |
| `npm run capturas` | Refaz tudo o que está em `capturas/`. Os vídeos são a parte demorada; `node tools/capturar.mjs --sem-video` pula os vídeos, `--so-video` faz só os vídeos e `--so-brinquedo` faz só o que é do conjunto `brinquedo`. |
| `npm run medir` | Mede o tamanho do download, as chamadas de desenho e os triângulos dos três conjuntos. |
| `node tools/comparar.mjs <conjunto> <alvo.png> <saída>` | Leva o sítio ao estado das imagens de referência (sementes num canteiro, milho pronto no outro, ovo no ninho, leite pronto) e grava o alvo e o jogo lado a lado. |
| `node tools/alvos.mjs` | Refaz as imagens reduzidas de `alvos/`, que o botão "Ver alvo" mostra. A lista de conjuntos com alvo está em `config/alvos.json`. |
| `node tools/olhar.mjs` e `node tools/folha.mjs` | Ferramentas de trabalho: uma foto num passo qualquer e uma folha com vários instantes lado a lado. O modo de usar está no começo de cada arquivo. |

As ferramentas que abrem o navegador usam o Chromium e o Playwright que já estão instalados na máquina. O Playwright não está no `package.json`.

## Medidas

Tamanho do que o navegador baixa (pasta `dist/`):

| Arquivo | Bruto | gzip | brotli |
|---|---|---|---|
| `index.html` | 3,5 KB | 1,4 KB | 1,1 KB |
| `main.js` | 907,3 KB | 250,3 KB | 205,2 KB |
| **Total** | **910,8 KB** | **251,8 KB** | **206,4 KB** |

Os três conjuntos de arte vão no mesmo `main.js`; não há um download por conjunto. Do `main.js`, 740 KB são a biblioteca three, 136 KB são o código deste protótipo e 31 KB são o avatar e o construtor de malhas reaproveitados de `tools/visual-refs`. Antes do conjunto `brinquedo` o código do protótipo tinha 99 KB e o total era de 870,8 KB. Não há imagens nem modelos para baixar: tudo é gerado por código.

Desenho da cena inteira, numa tela de 1280 por 720:

| Conjunto | No começo | Pico durante a demonstração |
|---|---|---|
| `brinquedo` | 31 chamadas de desenho e 75.968 triângulos | 38 chamadas e 78.780 triângulos |
| `codigo` | 22 chamadas de desenho e 18.596 triângulos | 26 chamadas e 19.192 triângulos |
| `molde` | 85 chamadas de desenho e 1.480 triângulos | 92 chamadas e 1.700 triângulos |

Os números do `brinquedo` somam as duas passadas de cada quadro. No começo são 57.310 triângulos na cena e 18.658 na passada do mapa de sombra; no pico, 59.430 e 19.350. O limite combinado para aparelho fraco era de cerca de 80 mil triângulos e 60 chamadas.

No conjunto `brinquedo` e no `codigo`, cada objeto é uma malha só: as peças são fundidas, e as que se mexem ficam presas a ossos. No `codigo` as sombras são manchas no chão, sem mapa de sombra. O conjunto `molde` não tem esse cuidado, porque é só um molde: cada forma é uma malha separada, e por isso ele faz mais chamadas com menos triângulos.

Memória de vídeo do `brinquedo`, por conta feita e não por medida: a única textura tem 64 por 64 pontos e ocupa 16 KB; o mapa de sombra tem 1024 por 1024 pontos e ocupa perto de 8 MB, somando a profundidade e a imagem de cor que o three cria junto com ela. O tamanho do mapa é um número só, em `AMBIENTE.sombra` de `src/arte/brinquedo/kit.js`. Com 2048 a borda da sombra ficou igual nas capturas e o mapa ocuparia quatro vezes mais.

A tela de desenho usa no máximo 2 pixels por ponto. Numa tela de celular de 390 por 844 pontos com 3 pixels por ponto, a tela de desenho fica com 780 por 1688 pixels.

Quadros por segundo não foram medidos. Nesta máquina o WebGL roda em software, e o número não diria nada sobre um celular.

## O que foi verificado

`npm run verificar` passa. Ele confere, num Chromium sem janela:

- A pasta `dist/` só tem arquivos `.html`, `.js`, `.json` ou `.png`, e o código não usa `?` no endereço, `alert`, `confirm`, `.glb` nem service worker.
- A demonstração chega ao fim com cada um dos três conjuntos (`codigo`, `molde` e `brinquedo`), em menos de 30 s, com as oito ações feitas e com a mudança esperada nos contadores depois de cada uma.
- Os três conjuntos passam pelos mesmos estados de jogo nos mesmos passos. A comparação é feita a cada meio segundo de demonstração.
- Sem `#arte-...` no endereço, a página abre com o conjunto `brinquedo`.
- Trocar a arte no meio da demonstração não muda o jogo. São cinco trocas: todos os tipos de uma vez, só a vaca, pelo botão "Arte", pelo endereço e de volta ao `brinquedo`.
- O botão "Arte" passa pelos três conjuntos e volta ao primeiro.
- A cada meio segundo, todos os visuais continuam cumprindo o contrato: os pontos estão no lugar e nenhuma peça tem posição, giro ou escala inválidos.
- Toques de verdade funcionam em três telas: celular em pé (390 por 844, toque), celular deitado (844 por 390, toque) e computador (1280 por 720, mouse). Em cada uma: andar até um ponto do chão, tirar água, plantar, regar, pegar o ovo, guardar no celeiro (com a porta fechando no fim) e os botões "Arte" e "Demonstração". Nas duas telas de celular, também arrastar a câmera com o dedo sem dar comando.
- O laço normal do jogo, em tempo real, anda sozinho com `#demo`.
- Nenhuma página escreve erro no console.

Além disso, foi conferido à mão:

- Uma cópia limpa dos arquivos que vão para o repositório, com `npm ci` e `npm run build`, gera um `dist/` idêntico byte a byte ao de trabalho.
- Com `config/arte.json` apontando a vaca e a laranjeira para `molde` e o resto para `codigo`, o build abre com a mistura certa, o botão mostra "Arte: misto" e a demonstração termina no mesmo estado de jogo.
- Um conjunto de teste que só tinha a vaca funcionou pelo arquivo de configuração, pelo botão "Arte" e pelo endereço. Os tipos que faltavam nele ficaram com a arte que já tinham, e o jogo terminou no mesmo estado.
- Cada animação foi olhada numa folha de contato, e o que estava duro, escorregando, atravessando ou sumindo foi corrigido. As folhas finais estão em `capturas/folhas/`.
- Depois do conjunto novo, as capturas dos conjuntos `codigo` e `molde` foram refeitas. As imagens saíram idênticas byte a byte às que já estavam gravadas, e os dois vídeos saíram com os mesmos quadros.
- O conjunto `brinquedo` foi posto lado a lado com a imagem de referência, na mesma câmera, em oito rodadas. A cada rodada foi corrigido o que mais denunciava a diferença. Também foram olhados de perto o personagem, a vaca, a galinha e o poço, e as oito ações.

## O que não foi verificado

- Nenhum celular de verdade. O toque foi testado com o toque emulado do Chromium.
- O conjunto `brinquedo` numa placa de vídeo de verdade. O mapa de sombra e os cerca de 76 mil triângulos por quadro só rodaram no WebGL em software desta máquina. Não se sabe se um aparelho fraco aguenta.
- A memória de vídeo. Os números acima são conta feita, não medida.
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

O conjunto `brinquedo` usa as mesmas poses e os mesmos tempos do `codigo`, e o que está dito acima vale para ele também. As formas novas mudam isto:

- **Bater as asas da galinha** ficou mais fácil de ver: as asas são gomos grandes e claros, e abrem bem para fora do corpo redondo.
- **Ordenhar** ficou um pouco mais escondido. A cabeça da vaca é grande e vira para a câmera, e as mãos dele continuam atrás do corpo.
- **Colher a laranja.** Um gomo da copa cobre o alto da cabeça dele. A mão e a fruta continuam à vista.
- **Vaca pastando.** Com a cabeça no chão, de cima vê-se só o topo escuro da cabeça e os chifres. O focinho rosa fica escondido.
- **Juntas.** Quando ele agacha (pegar o ovo, colher o milho), aparece a emenda entre as peças do cotovelo e do joelho.

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
| `comparacao-estilo-a.png` | A imagem de referência do Codex à esquerda e o jogo com o conjunto `brinquedo` à direita, na mesma câmera, cada um com 1920 por 1080. |
| `cena-brinquedo.png` | O sítio inteiro, em tela deitada, com o conjunto `brinquedo`. |
| `acoes-brinquedo.png` | Um quadro do meio de cada uma das oito interações, com o conjunto `brinquedo`. |
| `celular-retrato-brinquedo.png` | Tela de celular em pé, como abre: conjunto `brinquedo`, de perto, acompanhando o personagem. |
| `demonstracao-brinquedo.webm` | A demonstração inteira com o conjunto `brinquedo`, de perto, com a câmera acompanhando o personagem, em 960 por 540. |
| `folhas/*-brinquedo.png` | Folhas de contato do conjunto `brinquedo`: a galinha andando, bicando, batendo as asas e botando; a vaca parada, pastando, andando e sendo ordenhada; o personagem andando, correndo e andando com o caixote. |
| `cena-paisagem.png` | O sítio inteiro, em tela deitada, com o conjunto `codigo`. |
| `cena-molde.png` | O mesmo instante com o conjunto `molde`. |
| `acoes-codigo.png` | Os mesmos oito quadros de interação com o conjunto `codigo`. |
| `acoes-molde.png` | Os mesmos oito quadros com o conjunto `molde`. |
| `celular-retrato.png` | Tela de celular em pé, de perto, com o conjunto `codigo`. |
| `celular-retrato-tudo.png` | Tela de celular em pé, vendo o sítio inteiro, com o conjunto `codigo`. |
| `celular-paisagem.png` | Tela de celular deitada, com o conjunto `codigo`. |
| `demonstracao.webm` | A demonstração inteira com o conjunto `codigo`, vendo o sítio todo, em 960 por 540, com 29,8 s. |
| `demonstracao-de-perto.webm` | A mesma demonstração de perto, com a câmera acompanhando o personagem. É onde as ações do personagem aparecem melhor em movimento. |
| `folhas/*.png` (sem o sufixo) | Uma folha de contato por animação, com o conjunto `codigo`: cada ação do personagem, a vaca parada, pastando e andando, a galinha andando, bicando, batendo as asas e botando, e as fases do canteiro. |
