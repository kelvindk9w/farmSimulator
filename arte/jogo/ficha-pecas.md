# Ficha das peças de arte parada

Construções, objetos, plantas, ícones e retratos do jogo, pedidos ao Codex de terminal e preparados por `jogo/tools/arte/peca.mjs`. A personagem e os animais são de outra frente (`personagem`, `animais`).

## Como é feito

1. O pedido fica em `arte/jogo/pedidos/NN-nome.md` (numerados; `_cabecalho*.txt`, `_regras*.txt` e `_guia.txt` são os trechos comuns). Todo pedido leva anexa a cena aprovada `arte/estilo/rodada-03/var-2-contorno.png`.
2. `CODEX_HOME=/root/.codex-farm tools/arte/codex.sh /root/arte-codex/jogo-NN-nome arte/jogo/pedidos/NN-nome.md <referências>`. As imagens cruas ficam em `/root/arte-codex/` (fora do repositório).
3. Construções levam também um **bloco-guia** cinza feito por código (`peca.mjs guia --bloco LxPxH --telhado R`), na câmera exata do jogo. Sem ele o Codex erra a inclinação da base (o primeiro celeiro veio com 0,27 de um lado e 0,57 do outro; com a guia, 0,54 e 0,56; o certo é 0,58).
4. `peca.mjs` confere (alfa de verdade, cantos transparentes, nada tocando a borda, ciscos, meia-transparência), apara, põe em 128 px por unidade, grava em `jogo/arte/<grupo>/` e escreve `jogo/arte/catalogo/<grupo>.json`. O registro de como cada peça foi feita fica em `arte/jogo/pecas.json`.
5. `peca.mjs folha` refaz as folhas de contato de `arte/jogo/folhas/` (em cima, sobre grama, com o losango das casas ocupadas e a peça em tamanho de celular ao lado; embaixo, sobre fundo claro). `peca.mjs ficha` refaz a tabela abaixo.
6. Outros comandos de `peca.mjs`: `serie` (estágios de uma cultura ou árvore desenhados numa tira), `icones` (grade de ícones), `cercado` (curral e outros cercados montados com as peças do catálogo), `piso` e `parede` (texturas do celeiro por dentro), `chao` (calçamento de 1 casa), `apelido`, `remover`, `situacao`. O cabeçalho do arquivo explica as opções.

## Convenções das peças

- Câmera do jogo em todas as peças de cena (isométrica verdadeira, 128 px por unidade; uma casa é um losango de 181 x 104,5 px). `apoio` é o ponto da imagem que cai no centro das casas ocupadas, no chão.
- Construções: porta e frente na face de **+Z** (a da esquerda na tela), que tem `L` casas de largura; a face da direita tem `P` casas. A chave é o `id` de `jogo/dados/construcoes.json`.
- Estado é outra chave, com o mesmo apoio, para trocar uma pela outra sem deslocar: `objeto/celeiro` e `objeto/celeiro-aberto`, `objeto/porteira` e `objeto/porteira-aberta`, `objeto/prateleira-simples`, `-meia` e `-cheia` (o mesmo na reforçada), `objeto/suporte-de-ferramentas` (com as ferramentas) e `-vazio`.
- Celeiro e ampliações, todos em 5 x 4 casas: `objeto/celeiro` (básico), `objeto/celeiro-2` (Celeiro de tábua), `-3` (Celeiro grande), `-4` (Celeiro de dois andares), `-5` (Galpão); cada um com a sua `-aberto`. A chave é `celeiro-<ampliações feitas + 1>`.
- Cerca: `objeto/cerca-x` (corre em X, desce para a direita na tela) e `objeto/cerca-z` (corre em Z, desce para a esquerda) têm exatamente 1 unidade de mourão a mourão e o apoio no meio do trecho, no chão; trechos vizinhos sobrepõem o mourão. `objeto/mourao` é o mourão sozinho. `objeto/porteira` tem 2 unidades de mourão a mourão, corre em X; para a outra direção, espelhe. `objeto/cerca-de-madeira` é apelido de `cerca-x`.
- Curral (6 x 5): montado por código com as cercas, a porteira, a sombra, o cocho e o bebedouro do catálogo (`peca.mjs cercado`). `objeto/curral` é o conjunto; `objeto/curral-fundo` e `objeto/curral-frente` têm o mesmo quadro e o mesmo apoio, para desenhar fundo, bichos, frente. O mesmo comando faz outros cercados.
- Celeiro por dentro: `objeto/piso-tabuas` (1 casa, apoio no centro, encosta no vizinho sem vão), `objeto/parede-x` e `objeto/parede-z` (1 unidade de parede, 3 de altura, apoio no meio do pé; a parede do fundo fica em z = 0 e x = 0). Os móveis (suporte, prateleiras, baú, caixote, saco de sementes, fardo de feno) têm o apoio no centro da casa. Montagem de teste com o piso de 8 x 5 dos dados: `arte/jogo/folhas/cena-celeiro-por-dentro.png`.
- Começo da fazenda (pedidos 59 a 63): `objeto/casa-velha` tem o mesmo quadro (681 x 642) e o mesmo apoio (340, 470) de `objeto/casa`, para trocar uma pela outra quando a casa é reformada; `objeto/poco-velho` tem o apoio no mesmo ponto do chão de `objeto/poco` e a mureta do mesmo tamanho, mas o quadro é outro (sem a manivela); `objeto/caixote-de-venda` e `-cheio` têm o mesmo quadro e apoio (1 casa). Arame farpado na regra da cerca: `objeto/arame-x` e `objeto/arame-z` (e os caídos `arame-caido-x` e `-z`) têm 1 unidade de mourão a mourão e o apoio no meio do trecho, no chão; trechos vizinhos sobrepõem o mourão. `objeto/mourao-velho` é o mourão sozinho (apoio no pé); `objeto/mourao-caido` está deitado na direção X (desce para a direita); para a direção Z, espelhe. `objeto/regador-no-chao` tem o apoio no centro da casa; `objeto/enxada-escorada` inclui a estaca, com o apoio no pé da estaca. Montagem de teste: `arte/jogo/folhas/cena-comeco-fazenda.png`.
- Chão: `objeto/caminho-de-pedra` é chato, ocupa a casa inteira e encosta no vizinho (`peca.mjs chao`).
- Culturas: `cultura/<id>-<estágio>` (1 a 4; alface 1 a 3), um punhado de plantas que cabe numa casa, sem a terra; apoio no centro da casa.
- Árvores: `arvore/<id>-muda`, `-jovem`, `-adulta`, `-fruta` (adulta carregada), com os apelidos `-1` a `-4`; apoio no pé do tronco, o mesmo em `adulta` e `fruta`.
- Ícones: `icone/<id do item>` para todos os itens de `jogo/dados/itens.json`, 128 x 128, apoio no centro. Fora dos itens: `icone/ouro`, `cash`, `xp`, `folego`, `gota`, `convite`, `martelo`; `icone/enxada`, `icone/regador` e `icone/cesto` são apelidos dos do começo do jogo.
- Interface (`ui/...`, 128 x 128): `mao`, `enxada`, `semear`, `regar`, `loja`, `mochila`, `missoes`, `pedidos`, `config`, `fechar`, `seta`, `cadeado`, `som`, `tela-cheia`, `relogio`, `trofeu`, `presente`, `concluir` (terminar na hora), `vaga` (vaga de fila), `compartilhar`, `lote` (comprar terra), `mover` (mudar construção de lugar). `ui/subida-de-nivel` é a faixa da tela de nível (528 x 278, sem texto: o número vai por cima); `ui/bau-fechado` e `ui/bau-aberto` são o baú de recompensa, com o apoio no pé.
- Retratos (256 x 256): `retrato/seu-tonho` (neutro; apelido `-neutro`), `-alegre`, `-explicando`. Folha de modelo: `arte/jogo/modelos/seu-tonho.png`.

## Peças

<!-- tabela:inicio -->

No catálogo: 297 chaves (297 prontas, 0 pendentes).

### objetos (86)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `objeto/aprisco` | objetos/aprisco.png | 858 x 736 | 431, 512 | 5 x 4 | casas 5x4 | 34-aprisco.md | pronto |
| `objeto/arame-caido-x` | objetos/arame-caido-x.png | 157 x 170 | 79, 117 | 1 x 1 | fator 0.3694 | 61-arame-farpado-r2.md | pronto: arame-x arrebentado e caído (fios soltos, mourões tortos); mesmo enquadramento de regra do arame-x, apoio no meio do trecho |
| `objeto/arame-caido-z` | objetos/arame-caido-z.png | 150 x 167 | 75, 116 | 1 x 1 | fator 0.3455 | 61-arame-farpado-r2.md | pronto: arame-z arrebentado e caído; apoio no meio do trecho, como o arame-z |
| `objeto/arame-x` | objetos/arame-x.png | 157 x 172 | 79, 119 | 1 x 1 | fator 0.3694 | 61-arame-farpado-r2.md | pronto: trecho de arame farpado de 1 casa ao longo de X (desce para a direita na tela), mesma regra da cerca-x: 1 unidade de mourão a mourão, apoio no meio do trecho, no chão; trechos vizinhos se sobrepõem no mourão |
| `objeto/arame-z` | objetos/arame-z.png | 152 x 169 | 76, 117 | 1 x 1 | fator 0.348 | 61-arame-farpado-r2.md | pronto: trecho de arame farpado de 1 casa ao longo de Z (sobe para a direita na tela), mesma regra da cerca-z: apoio no meio do trecho, no chão |
| `objeto/arbusto` | objetos/arbusto.png | 170 x 142 | 85, 97 | 1 x 1 | largura 1.2 | 06-natureza.md | pronto |
| `objeto/arvore` | objetos/mata.png (apelido) | 444 x 503 | 224, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/aspersor` | objetos/aspersor.png | 131 x 143 | 66, 113 | 1 x 1 | largura 0.9 | 41-decoracao-1.md | pronto |
| `objeto/banca` | objetos/banca.png | 402 x 462 | 202, 344 | 3 x 2 | casas 3x2 | 04-banca.md | pronto |
| `objeto/bancada-de-carpintaria` | objetos/bancada-de-carpintaria.png | 257 x 236 | 129, 159 | 2 x 1 | largura 1.88 | 29-bancadas.md | pronto |
| `objeto/bancada-de-embalar` | objetos/bancada-de-embalar.png | 257 x 237 | 129, 160 | 2 x 1 | largura 1.88 | 29-bancadas.md | pronto |
| `objeto/banco-de-madeira` | objetos/banco-de-madeira.png | 214 x 229 | 107, 164 | 2 x 1 | largura 1.55 | 41-decoracao-1.md | pronto |
| `objeto/bandeirinhas-de-festa` | objetos/bandeirinhas-de-festa.png | 289 x 354 | 145, 270 | 3 x 1 | fator 0.606 | 42-decoracao-2.md | pronto |
| `objeto/bau` | objetos/bau.png | 221 x 217 | 111, 150 | 2 x 1 | largura 1.6 | 39-moveis-do-celeiro.md | pronto |
| `objeto/bebedouro` | objetos/bebedouro.png | 111 x 115 | 56, 81 | 1 x 1 | largura 0.74 | 28-pecas-de-trato.md | pronto |
| `objeto/bebedouro-grande` | objetos/bebedouro-grande.png | 266 x 225 | 133, 145 | 2 x 1 | largura 1.95 | 28-pecas-de-trato.md | pronto |
| `objeto/caixa-de-correio` | objetos/caixa-de-correio.png | 127 x 212 | 64, 197 | 1 x 1 | altura 1.8 | objeto-caixa-de-correio.md | pronto |
| `objeto/caixote` | objetos/caixote.png | 161 x 173 | 81, 123 | 1 x 1 | largura 1.13 | 39-moveis-do-celeiro.md | pronto: câmera um pouco mais de cima que o resto (inclinação da base 0,70 em vez de 0,58) |
| `objeto/caixote-de-venda` | objetos/caixote-de-venda.png | 168 x 151 | 84, 99 | 1 x 1 | casas 1x1 | 62-caixote-de-venda.md | pronto: caixote de venda da beira da estrada, vazio; na câmera do jogo (guia de 0,9 x 0,7 x 0,45) |
| `objeto/caixote-de-venda-cheio` | objetos/caixote-de-venda-cheio.png | 168 x 151 | 84, 99 | 1 x 1 | casas 1x1 | 62-caixote-de-venda.md | pronto: o mesmo caixote com milho, alface e tomate; mesmo apoio do vazio |
| `objeto/caminho-de-pedra` | objetos/caminho-de-pedra.png | 199 x 123 | 100, 62 | 1 x 1 | chão de 1 casa | 44-caminho-de-pedra.md | pronto: esticado na vertical para caber no losango da casa |
| `objeto/canteiro-de-flores` | objetos/canteiro-de-flores.png | 182 x 151 | 91, 95 | 1 x 1 | largura 1.3 | 41-decoracao-1.md | pronto |
| `objeto/carro-de-boi-antigo` | objetos/carro-de-boi-antigo.png | 349 x 291 | 175, 203 | 3 x 2 | largura 2.6 | 42-decoracao-2.md | pronto |
| `objeto/casa` | objetos/casa.png | 681 x 642 | 340, 470 | 4 x 3 | casas 4x3 | 25-casa.md | pronto |
| `objeto/casa-velha` | objetos/casa-velha.png | 681 x 642 | 340, 470 | 4 x 3 | fator 0.72637 | 59-casa-velha-r2.md | pronto: estado velho da casa (começo do jogo): mesma escala, mesmo quadro e mesmo apoio de objeto/casa (desenhada em cima da casa nova, na mesma guia); 2 rodadas, a 1ª saiu maior e com a parede da esquerda deitada |
| `objeto/celeiro` | objetos/celeiro.png | 856 x 834 | 426, 601 | 5 x 4 | casas 5x4 | 23-celeiro-fechado.md | pronto |
| `objeto/celeiro-2` | objetos/celeiro-2.png | 838 x 835 | 416, 615 | 5 x 4 | casas 5x4 | 49-celeiro-medio.md | pronto: primeira ampliação (Celeiro de tábua) |
| `objeto/celeiro-2-aberto` | objetos/celeiro-2-aberto.png | 838 x 835 | 416, 615 | 5 x 4 | fator 0.904 | 52-celeiro-medio-aberto.md | pronto: igual ao fechado fora da porta (só a região que muda foi tirada do desenho aberto) |
| `objeto/celeiro-3` | objetos/celeiro-3.png | 845 x 1017 | 421, 797 | 5 x 4 | casas 5x4 | 50-celeiro-grande.md | pronto: segunda ampliação (Celeiro grande) |
| `objeto/celeiro-3-aberto` | objetos/celeiro-3-aberto.png | 845 x 1017 | 421, 797 | 5 x 4 | fator 0.914 | 53-celeiro-grande-aberto.md | pronto: igual ao fechado fora da porta (só a região que muda foi tirada do desenho aberto) |
| `objeto/celeiro-4` | objetos/celeiro-4.png | 835 x 1133 | 419, 913 | 5 x 4 | fator 0.921 | 55-celeiro-dois-andares.md | pronto: terceira ampliação (Celeiro de dois andares) |
| `objeto/celeiro-4-aberto` | objetos/celeiro-4-aberto.png | 835 x 1132 | 419, 913 | 5 x 4 | fator 0.921 | 57-celeiro-dois-andares-aberto.md | pronto: igual ao fechado fora da porta (só a região que muda foi tirada do desenho aberto) |
| `objeto/celeiro-5` | objetos/celeiro-5.png | 860 x 978 | 430, 749 | 5 x 4 | fator 0.897 | 56-galpao.md | pronto: quarta ampliação (Galpão) |
| `objeto/celeiro-5-aberto` | objetos/celeiro-5-aberto.png | 860 x 978 | 430, 749 | 5 x 4 | fator 0.897 | 58-galpao-aberto.md | pronto: igual ao fechado fora da porta (só a região que muda foi tirada do desenho aberto) |
| `objeto/celeiro-aberto` | objetos/celeiro-aberto.png | 856 x 834 | 426, 601 | 5 x 4 | casas 5x4 | 24-celeiro-aberto.md | pronto: igual ao fechado fora da porta (só a região que muda foi tirada do desenho aberto) |
| `objeto/cerca-de-madeira` | objetos/cerca-x.png (apelido) | 142 x 163 | 71, 119 | 1 x 1 | fator 0.5085 | 05-cercas.md | pronto |
| `objeto/cerca-x` | objetos/cerca-x.png | 142 x 163 | 71, 119 | 1 x 1 | fator 0.5085 | 05-cercas.md | pronto |
| `objeto/cerca-z` | objetos/cerca-z.png | 142 x 163 | 71, 119 | 1 x 1 | fator 0.5113 | 05-cercas.md | pronto |
| `objeto/cocho` | objetos/cocho.png | 259 x 237 | 130, 159 | 2 x 1 | largura 1.9 | 28-pecas-de-trato.md | pronto |
| `objeto/comedouro` | objetos/comedouro.png | 144 x 114 | 72, 69 | 1 x 1 | largura 1.0 | 28-pecas-de-trato.md | pronto |
| `objeto/cozinha` | objetos/cozinha.png | 696 x 749 | 346, 562 | 4 x 3 | casas 4x3 | 32-cozinha.md | pronto: o piso vermelho é da peça e ocupa as 4x3 casas |
| `objeto/curral` | objetos/curral.png | 1009 x 769 | 504, 474 | 6 x 5 | cercado de 6x5 montado por código | 05-cercas.md, 28-pecas-de-trato.md, 43-sombra-do-curral.md | pronto: montado por código com as peças do catálogo; para pôr os bichos entre as cercas use curral-fundo e curral-frente |
| `objeto/curral-frente` | objetos/curral-frente.png | 1009 x 769 | 504, 474 | 6 x 5 | cercado de 6x5 montado por código | 05-cercas.md, 28-pecas-de-trato.md, 43-sombra-do-curral.md | pronto: camada da frente (cercas da frente e porteira) |
| `objeto/curral-fundo` | objetos/curral-fundo.png | 1009 x 769 | 504, 474 | 6 x 5 | cercado de 6x5 montado por código | 05-cercas.md, 28-pecas-de-trato.md, 43-sombra-do-curral.md | pronto: camada de trás (cercas do fundo e o que fica dentro) |
| `objeto/enxada-escorada` | objetos/enxada-escorada.png | 140 x 153 | 22, 69 | 1 x 1 | fator 0.252 | 63-regador-e-enxada.md | pronto: enxada escorada na estaca do canto do campo (a estaca faz parte da peça); apoio no pé da estaca |
| `objeto/espantalho` | objetos/espantalho.png | 165 x 240 | 78, 227 | 1 x 1 | altura 2.1 | 41-decoracao-1.md | pronto |
| `objeto/estabulo` | objetos/estabulo.png | 769 x 770 | 380, 570 | 4 x 4 | casas 4x4 | 33-estabulo.md | pronto |
| `objeto/fardo-de-feno` | objetos/fardo-de-feno.png | 179 x 162 | 90, 107 | 1 x 1 | largura 1.27 | 39-moveis-do-celeiro.md | pronto |
| `objeto/flores` | objetos/flores.png | 138 x 128 | 69, 98 | 1 x 1 | largura 0.95 | 06-natureza.md | pronto |
| `objeto/fogueira-de-sao-joao` | objetos/fogueira-de-sao-joao.png | 252 x 330 | 126, 254 | 2 x 2 | largura 1.84 | 42-decoracao-2.md | pronto |
| `objeto/fonte-de-pedra` | objetos/fonte-de-pedra.png | 234 x 278 | 117, 207 | 2 x 2 | largura 1.7 | 42-decoracao-2.md | pronto |
| `objeto/galinheiro` | objetos/galinheiro.png | 567 x 525 | 279, 363 | 3 x 3 | casas 3x3 | 27-galinheiro.md | pronto |
| `objeto/ipe` | objetos/ipe.png | 456 x 493 | 214, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/laticinio` | objetos/laticinio.png | 665 x 729 | 337, 537 | 4 x 3 | casas 4x3 | 31-laticinio.md | pronto |
| `objeto/mata` | objetos/mata.png | 444 x 503 | 224, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/mato` | objetos/mato.png | 144 x 158 | 72, 128 | 1 x 1 | largura 1.0 | 06-natureza.md | pronto |
| `objeto/moinho` | objetos/moinho.png | 493 x 534 | 246, 389 | 3 x 3 | casas 3x3 | 30-moinho.md | pronto |
| `objeto/mourao` | objetos/mourao.png | 50 x 117 | 25, 99 |  | fator 0.439 | 05-cercas.md | pronto |
| `objeto/mourao-caido` | objetos/mourao-caido.png | 136 x 83 | 76, 53 | 1 x 1 | fator 0.3587 | 61-arame-farpado-r2.md | pronto: mourão caído no chão com arame enrolado, raiz à esquerda e ponta quebrada à direita (desce para a direita, como o lado X); para a outra direção, espelhe; apoio no meio dele, no chão |
| `objeto/mourao-velho` | objetos/mourao-velho.png | 74 x 143 | 36, 119 | 1 x 1 | fator 0.3587 | 61-arame-farpado-r2.md | pronto: mourão velho sozinho, um pouco torto, com raiz e duas voltas de arame; mesma escala dos mourões do arame; apoio no pé do mourão |
| `objeto/ninho` | objetos/ninho.png | 108 x 78 | 54, 48 | 1 x 1 | largura 0.72 | 28-pecas-de-trato.md | pronto |
| `objeto/parede-x` | objetos/parede-x.png | 109 x 382 | 54, 348 |  | parede de 1 unidade, altura 3 | 40-texturas-do-celeiro.md | pronto |
| `objeto/parede-z` | objetos/parede-z.png | 109 x 382 | 54, 348 |  | parede de 1 unidade, altura 3 | 40-texturas-do-celeiro.md | pronto |
| `objeto/pedra` | objetos/pedra.png | 125 x 103 | 63, 74 | 1 x 1 | largura 0.85 | 06-natureza.md | pronto |
| `objeto/piso-tabuas` | objetos/piso-tabuas.png | 198 x 121 | 99, 61 | 1 x 1 | piso de 1 casa | 40-texturas-do-celeiro.md | pronto |
| `objeto/placa` | objetos/placa.png | 140 x 171 | 63, 158 | 1 x 1 | largo-px 124 | 05-cercas.md | pronto |
| `objeto/poco` | objetos/poco.png | 308 x 441 | 142, 370 | 2 x 2 | largura 2.28 | 01-poco.md | pronto |
| `objeto/poco-velho` | objetos/poco-velho.png | 275 x 424 | 136, 353 | 2 x 2 | fator 0.3466 | 60-poco-velho.md | pronto: estado velho do poço (começo do jogo): mureta do mesmo tamanho e apoio no mesmo ponto do chão que objeto/poco; sem manivela |
| `objeto/porteira` | objetos/porteira.png | 252 x 292 | 126, 216 | 2 x 1 | fator 0.7016 | 05-cercas.md | pronto |
| `objeto/porteira-aberta` | objetos/porteira-aberta.png | 252 x 311 | 126, 235 | 2 x 1 | fator 0.7016 | 05-cercas.md | pronto |
| `objeto/poste-de-lampiao` | objetos/poste-de-lampiao.png | 169 x 311 | 121, 280 | 1 x 1 | altura 2.6 | 41-decoracao-1.md | pronto |
| `objeto/prateleira-reforcada` | objetos/prateleira-reforcada.png | 222 x 360 | 111, 293 | 2 x 1 | fator 0.53 | 51-prateleira-reforcada.md | pronto |
| `objeto/prateleira-reforcada-cheia` | objetos/prateleira-reforcada-cheia.png | 230 x 360 | 111, 293 | 2 x 1 | fator 0.53 | 51-prateleira-reforcada.md | pronto |
| `objeto/prateleira-reforcada-meia` | objetos/prateleira-reforcada-meia.png | 221 x 360 | 111, 293 | 2 x 1 | fator 0.53 | 51-prateleira-reforcada.md | pronto |
| `objeto/prateleira-simples` | objetos/prateleira-simples.png | 251 x 326 | 126, 250 | 2 x 1 | fator 0.566 | 38-prateleira.md | pronto |
| `objeto/prateleira-simples-cheia` | objetos/prateleira-simples-cheia.png | 263 x 327 | 125, 251 | 2 x 1 | fator 0.566 | 38-prateleira.md | pronto |
| `objeto/prateleira-simples-meia` | objetos/prateleira-simples-meia.png | 253 x 326 | 126, 250 | 2 x 1 | fator 0.566 | 38-prateleira.md | pronto |
| `objeto/quadro-de-pedidos` | objetos/quadro-de-pedidos.png | 185 x 257 | 93, 217 | 1 x 1 | altura 2.0 | 28-pecas-de-trato.md | pronto |
| `objeto/regador-no-chao` | objetos/regador-no-chao.png | 120 x 103 | 68, 80 | 1 x 1 | largo-px 104 | 63-regador-e-enxada.md | pronto: regador de lata do começo pousado no chão, ao lado do poço; apoio no centro do fundo (centro da casa); largura igual à do regador na mão da personagem |
| `objeto/rochedo` | objetos/rochedo.png | 189 x 143 | 95, 91 | 1 x 1 | largura 1.35 | 06-natureza.md | pronto |
| `objeto/saco-de-sementes` | objetos/saco-de-sementes.png | 106 x 134 | 53, 104 | 1 x 1 | largura 0.7 | 39-moveis-do-celeiro.md | pronto |
| `objeto/sombra-do-curral` | objetos/sombra-do-curral.png | 541 x 477 | 275, 346 | 3 x 2 | casas 3x2 | 43-sombra-do-curral.md | pronto |
| `objeto/suporte-de-ferramentas` | objetos/suporte-de-ferramentas.png | 223 x 286 | 112, 219 | 2 x 1 | fator 0.35 | 08-suporte-ferramentas.md | pronto |
| `objeto/suporte-de-ferramentas-vazio` | objetos/suporte-de-ferramentas-vazio.png | 223 x 286 | 112, 219 | 2 x 1 | fator 0.35 | 08-suporte-ferramentas.md | pronto |
| `objeto/toco` | objetos/toco.png | 144 x 126 | 72, 85 | 1 x 1 | largura 1.0 | 06-natureza.md | pronto |
| `objeto/vaso` | objetos/vaso.png | 112 x 133 | 56, 108 | 1 x 1 | largura 0.75 | 41-decoracao-1.md | pronto |

### culturas (31)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `cultura/abobora-1` | culturas/abobora-1.png | 56 x 39 | 28, 23 |  | largura 1.42 | 14-cultura-abobora.md | pronto |
| `cultura/abobora-2` | culturas/abobora-2.png | 95 x 66 | 48, 42 |  | largura 1.42 | 14-cultura-abobora.md | pronto |
| `cultura/abobora-3` | culturas/abobora-3.png | 155 x 89 | 78, 53 |  | largura 1.42 | 14-cultura-abobora.md | pronto |
| `cultura/abobora-4` | culturas/abobora-4.png | 198 x 110 | 99, 65 |  | largura 1.42 | 14-cultura-abobora.md | pronto |
| `cultura/alface-1` | culturas/alface-1.png | 111 x 74 | 56, 47 |  | largura 1.28 | 11-cultura-alface.md | pronto |
| `cultura/alface-2` | culturas/alface-2.png | 139 x 88 | 70, 55 |  | largura 1.28 | 11-cultura-alface.md | pronto |
| `cultura/alface-3` | culturas/alface-3.png | 180 x 108 | 90, 67 |  | largura 1.28 | 11-cultura-alface.md | pronto |
| `cultura/arroz-1` | culturas/arroz-1.png | 94 x 75 | 47, 51 |  | largura 1.3 | 13-cultura-arroz.md | pronto |
| `cultura/arroz-2` | culturas/arroz-2.png | 126 x 109 | 63, 79 |  | largura 1.3 | 13-cultura-arroz.md | pronto |
| `cultura/arroz-3` | culturas/arroz-3.png | 160 x 144 | 80, 107 |  | largura 1.3 | 13-cultura-arroz.md | pronto |
| `cultura/arroz-4` | culturas/arroz-4.png | 182 x 155 | 91, 114 |  | largura 1.3 | 13-cultura-arroz.md | pronto |
| `cultura/cana-1` | culturas/cana-1.png | 117 x 76 | 59, 54 |  | altura 2.2 | 16-cultura-cana.md | pronto |
| `cultura/cana-2` | culturas/cana-2.png | 158 x 98 | 79, 70 |  | altura 2.2 | 16-cultura-cana.md | pronto |
| `cultura/cana-3` | culturas/cana-3.png | 172 x 182 | 86, 152 |  | altura 2.2 | 16-cultura-cana.md | pronto |
| `cultura/cana-4` | culturas/cana-4.png | 202 x 233 | 101, 199 |  | altura 2.2 | 16-cultura-cana.md | pronto |
| `cultura/feijao-1` | culturas/feijao-1.png | 94 x 55 | 47, 31 |  | largura 1.28 | 10-cultura-feijao.md | pronto |
| `cultura/feijao-2` | culturas/feijao-2.png | 119 x 93 | 60, 64 |  | largura 1.28 | 10-cultura-feijao.md | pronto |
| `cultura/feijao-3` | culturas/feijao-3.png | 155 x 116 | 78, 80 |  | largura 1.28 | 10-cultura-feijao.md | pronto |
| `cultura/feijao-4` | culturas/feijao-4.png | 180 x 135 | 90, 94 |  | largura 1.28 | 10-cultura-feijao.md | pronto |
| `cultura/mandioca-1` | culturas/mandioca-1.png | 94 x 62 | 47, 48 |  | altura 1.7 | 15-cultura-mandioca.md | pronto |
| `cultura/mandioca-2` | culturas/mandioca-2.png | 123 x 97 | 62, 81 |  | altura 1.7 | 15-cultura-mandioca.md | pronto |
| `cultura/mandioca-3` | culturas/mandioca-3.png | 163 x 165 | 82, 146 |  | altura 1.7 | 15-cultura-mandioca.md | pronto |
| `cultura/mandioca-4` | culturas/mandioca-4.png | 189 x 182 | 95, 161 |  | altura 1.7 | 15-cultura-mandioca.md | pronto |
| `cultura/milho-1` | culturas/milho-1.png | 93 x 62 | 47, 38 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/milho-2` | culturas/milho-2.png | 127 x 104 | 64, 73 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/milho-3` | culturas/milho-3.png | 155 x 212 | 78, 175 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/milho-4` | culturas/milho-4.png | 160 x 213 | 80, 175 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/tomate-1` | culturas/tomate-1.png | 112 x 50 | 56, 35 |  | altura 1.5 | 12-cultura-tomate.md | pronto |
| `cultura/tomate-2` | culturas/tomate-2.png | 149 x 106 | 75, 88 |  | altura 1.5 | 12-cultura-tomate.md | pronto |
| `cultura/tomate-3` | culturas/tomate-3.png | 174 x 182 | 87, 162 |  | altura 1.5 | 12-cultura-tomate.md | pronto |
| `cultura/tomate-4` | culturas/tomate-4.png | 182 x 182 | 91, 161 |  | altura 1.5 | 12-cultura-tomate.md | pronto |

### arvores (24)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `arvore/bananeira-1` | arvores/bananeira-muda.png (apelido) | 126 x 107 | 64, 91 |  | altura 3.4 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-2` | arvores/bananeira-jovem.png (apelido) | 183 x 261 | 99, 243 |  | altura 3.4 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-3` | arvores/bananeira-adulta.png (apelido) | 297 x 398 | 144, 373 | 1 x 1 | fator 0.597 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-4` | arvores/bananeira-fruta.png (apelido) | 297 x 397 | 144, 372 | 1 x 1 | fator 0.597 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-adulta` | arvores/bananeira-adulta.png | 297 x 398 | 144, 373 | 1 x 1 | fator 0.597 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-fruta` | arvores/bananeira-fruta.png | 297 x 397 | 144, 372 | 1 x 1 | fator 0.597 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-jovem` | arvores/bananeira-jovem.png | 183 x 261 | 99, 243 |  | altura 3.4 | 36-arvore-bananeira.md | pronto |
| `arvore/bananeira-muda` | arvores/bananeira-muda.png | 126 x 107 | 64, 91 |  | altura 3.4 | 36-arvore-bananeira.md | pronto |
| `arvore/goiabeira-1` | arvores/goiabeira-muda.png (apelido) | 81 x 99 | 37, 88 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-2` | arvores/goiabeira-jovem.png (apelido) | 174 x 222 | 87, 204 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-3` | arvores/goiabeira-adulta.png (apelido) | 321 x 375 | 134, 353 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-4` | arvores/goiabeira-fruta.png (apelido) | 323 x 375 | 136, 353 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-adulta` | arvores/goiabeira-adulta.png | 321 x 375 | 134, 353 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-fruta` | arvores/goiabeira-fruta.png | 323 x 375 | 136, 353 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-jovem` | arvores/goiabeira-jovem.png | 174 x 222 | 87, 204 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/goiabeira-muda` | arvores/goiabeira-muda.png | 81 x 99 | 37, 88 |  | altura 3.3 | 37-arvore-goiabeira.md | pronto |
| `arvore/laranjeira-1` | arvores/laranjeira-muda.png (apelido) | 88 x 127 | 43, 113 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-2` | arvores/laranjeira-jovem.png (apelido) | 185 x 235 | 95, 213 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-3` | arvores/laranjeira-adulta.png (apelido) | 348 x 389 | 176, 353 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-4` | arvores/laranjeira-fruta.png (apelido) | 349 x 389 | 176, 353 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-adulta` | arvores/laranjeira-adulta.png | 348 x 389 | 176, 353 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-fruta` | arvores/laranjeira-fruta.png | 349 x 389 | 176, 353 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-jovem` | arvores/laranjeira-jovem.png | 185 x 235 | 95, 213 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |
| `arvore/laranjeira-muda` | arvores/laranjeira-muda.png | 88 x 127 | 43, 113 |  | altura 3.3 | 35-arvore-laranjeira.md | pronto |

### icones (114)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `icone/abobora` | icones/abobora.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/acucar-mascavo` | icones/acucar-mascavo.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/alface` | icones/alface.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/arado` | icones/arado.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/arroz` | icones/arroz.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/arroz-com-feijao` | icones/arroz-com-feijao.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/balaio` | icones/balaio.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/balde` | icones/balde.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/banana` | icones/banana.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/barril-de-agua` | icones/barril-de-agua.png | 128 x 128 | 64, 64 |  | caixa 128 | 54-icones-rega.md | pronto |
| `icone/bolo-de-banana` | icones/bolo-de-banana.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/bolo-de-fuba` | icones/bolo-de-fuba.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/bone-vermelho` | icones/bone-vermelho.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/bota-de-borracha` | icones/bota-de-borracha.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/bota-de-couro` | icones/bota-de-couro.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/caixa-de-ovos` | icones/caixa-de-ovos.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/caixa-de-ovos-grande` | icones/caixa-de-ovos-grande.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/camisa-xadrez` | icones/camisa-xadrez.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/cana` | icones/cana.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/carrinho-de-mao` | icones/carrinho-de-mao.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/carroca` | icones/carroca.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/cartela-vazia` | icones/cartela-vazia.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/cash` | icones/cash.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cesto` | icones/cesto-de-palha.png (apelido) | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cesto-de-palha` | icones/cesto-de-palha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cesto-grande` | icones/cesto-grande.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/chapeu-de-couro` | icones/chapeu-de-couro.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/chapeu-de-palha` | icones/chapeu-de-palha.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/cinto-de-couro` | icones/cinto-de-couro.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cinto-de-oficio` | icones/cinto-de-oficio.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/convite` | icones/convite.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/doce-de-abobora` | icones/doce-de-abobora.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/doce-de-leite` | icones/doce-de-leite.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/duzia-de-ovos` | icones/duzia-de-ovos.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/enxada` | icones/enxada-velha.png (apelido) | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/enxada-de-aco` | icones/enxada-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/enxada-de-ferro` | icones/enxada-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/enxada-velha` | icones/enxada-velha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/fardo-de-la` | icones/fardo-de-la.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/farinha-de-mandioca` | icones/farinha-de-mandioca.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/feijao` | icones/feijao.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/feijao-tropeiro` | icones/feijao-tropeiro.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/fibra` | icones/fibra.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/foice-de-aco` | icones/foice-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/foice-de-ferro` | icones/foice-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/foice-velha` | icones/foice-velha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/folego` | icones/folego.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/fuba` | icones/fuba.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/garrafa-de-leite` | icones/garrafa-de-leite.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/garrafa-vazia` | icones/garrafa-vazia.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/goiaba` | icones/goiaba.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/goiabada` | icones/goiabada.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/gota` | icones/gota.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/la` | icones/la.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/laranja` | icones/laranja.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/latao-de-leite` | icones/latao-de-leite.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/leite` | icones/leite.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/lenco-de-chita` | icones/lenco-de-chita.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/macacao-jeans` | icones/macacao-jeans.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/machado-de-aco` | icones/machado-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/machado-de-ferro` | icones/machado-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/machado-velho` | icones/machado-velho.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/madeira` | icones/madeira.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/mandioca` | icones/mandioca.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/manteiga` | icones/manteiga.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/martelo` | icones/martelo.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/matraca` | icones/matraca.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/milho` | icones/milho.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/molho-de-tomate` | icones/molho-de-tomate.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/muda-bananeira` | icones/muda-bananeira.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/muda-goiabeira` | icones/muda-goiabeira.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/muda-laranjeira` | icones/muda-laranjeira.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/ouro` | icones/ouro.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/ovo` | icones/ovo.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/pamonha` | icones/pamonha.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/pao-de-queijo` | icones/pao-de-queijo.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/pedra` | icones/pedra.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/picareta-de-aco` | icones/picareta-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/picareta-de-ferro` | icones/picareta-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/picareta-velha` | icones/picareta-velha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/pintura-azul` | icones/pintura-azul.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/pintura-dourada` | icones/pintura-dourada.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/pintura-vermelha` | icones/pintura-vermelha.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/polvilho` | icones/polvilho.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/prego` | icones/prego.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/queijo-minas` | icones/queijo-minas.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/racao` | icones/racao.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/regador` | icones/regador-velho.png (apelido) | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/regador-de-cobre` | icones/regador-de-cobre.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/regador-de-crivo` | icones/regador-de-crivo.png | 128 x 128 | 64, 64 |  | caixa 128 | 54-icones-rega.md | pronto |
| `icone/regador-de-lata` | icones/regador-de-lata.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/regador-grande` | icones/regador-grande.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/regador-velho` | icones/regador-velho.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/romeu-e-julieta` | icones/romeu-e-julieta.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/roupa-de-festa-junina` | icones/roupa-de-festa-junina.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/saca-de-arroz` | icones/saca-de-arroz.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/saca-de-feijao` | icones/saca-de-feijao.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/saco-vazio` | icones/saco-vazio.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/salada` | icones/salada.png | 128 x 128 | 64, 64 |  | caixa 128 | 45-icones-produtos-2.md | pronto |
| `icone/sela` | icones/sela.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/semente-abobora` | icones/semente-abobora.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-alface` | icones/semente-alface.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-arroz` | icones/semente-arroz.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-cana` | icones/semente-cana.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-feijao` | icones/semente-feijao.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-mandioca` | icones/semente-mandioca.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-milho` | icones/semente-milho.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-tomate` | icones/semente-tomate.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/suco-de-laranja` | icones/suco-de-laranja.png | 128 x 128 | 64, 64 |  | caixa 128 | 46-icones-produtos-3.md | pronto |
| `icone/tabua` | icones/tabua.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/tesoura-de-tosquia` | icones/tesoura-de-tosquia.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/tomate` | icones/tomate.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/vestido-de-chita` | icones/vestido-de-chita.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `icone/xp` | icones/xp.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |

### retratos (4)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `retrato/seu-tonho` | retratos/seu-tonho.png | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |
| `retrato/seu-tonho-alegre` | retratos/seu-tonho-alegre.png | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |
| `retrato/seu-tonho-explicando` | retratos/seu-tonho-explicando.png | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |
| `retrato/seu-tonho-neutro` | retratos/seu-tonho.png (apelido) | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |

### interface (38)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `ui/amigos` | interface/amigos.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/bau-aberto` | interface/bau-aberto.png | 268 x 280 | 134, 272 |  | fator 0.5 | 22-nivel-e-bau.md | pronto |
| `ui/bau-fechado` | interface/bau-fechado.png | 252 x 226 | 126, 218 |  | fator 0.5 | 22-nivel-e-bau.md | pronto |
| `ui/cadeado` | interface/cadeado.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/caderno` | interface/caderno.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/certo` | interface/certo.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/compartilhar` | interface/compartilhar.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `ui/concluir` | interface/concluir.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `ui/config` | interface/config.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/correio` | interface/correio.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/enxada` | interface/enxada.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/estrela` | interface/estrela.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/fazenda` | interface/fazenda.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/fechar` | interface/fechar.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/foto` | interface/foto.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/guarda-roupa` | interface/guarda-roupa.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/limpar` | interface/limpar.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |
| `ui/loja` | interface/loja.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/lote` | interface/lote.png | 128 x 128 | 64, 64 |  | caixa 128 | 54-icones-rega.md | pronto |
| `ui/mais` | interface/mais.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/mao` | interface/mao.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/menu` | interface/menu.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/minha-fazenda` | interface/minha-fazenda.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/missoes` | interface/missoes.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/mochila` | interface/mochila.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/mover` | interface/mover.png | 128 x 128 | 64, 64 |  | caixa 128 | 54-icones-rega.md | pronto |
| `ui/pedidos` | interface/pedidos.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/presente` | interface/presente.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/regar` | interface/regar.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/relogio` | interface/relogio.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/semear` | interface/semear.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-interface-aprovada.md | pronto |
| `ui/seta` | interface/seta.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/som` | interface/som.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/subida-de-nivel` | interface/subida-de-nivel.png | 528 x 278 | 264, 270 |  | largo-px 512 | 22-nivel-e-bau.md | pronto |
| `ui/tela-cheia` | interface/tela-cheia.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/trofeu` | interface/trofeu.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/vaga` | interface/vaga.png | 128 x 128 | 64, 64 |  | caixa 128 | 48-icones-cosmeticos.md | pronto |
| `ui/voltar` | interface/voltar.png | 128 x 128 | 64, 64 |  | caixa 128 | ui-modos-e-progresso.md | pronto |

<!-- tabela:fim -->

## Pendências e observações

Nenhuma peça ficou marcada como pendente. O que vale saber:

- **Descartes**: o primeiro celeiro (pedido 02, sem bloco-guia: base com 0,27 de um lado e 0,57 do outro) e a primeira casa (pedido 03) foram refeitos com guia (pedidos 23 a 25). Nenhuma peça passou de duas rodadas.
- **Inclinação da base das construções**: mesmo com a guia o Codex desenha a base um pouco mais deitada que a do jogo (0,47 a 0,56; o certo é 0,58). Na tela a diferença é de poucos pixels no canto da frente; a escala e o apoio foram tirados da base desenhada, não da guia.
- **Celeiros abertos**: o Codex redesenha tudo quando se pede a porta aberta. Para as duas versões baterem pixel a pixel fora da porta, só a região que muda é colada sobre a imagem fechada (os `*-composto.png` em `/root/arte-codex/`).
- `objeto/caixote`: câmera um pouco mais de cima que o resto (base com 0,70). Só aparece dentro do celeiro; refazer se incomodar.
- `objeto/cozinha`: o piso vermelho faz parte da peça e ocupa as 4 x 3 casas.
- `objeto/caminho-de-pedra`: veio mais achatado que a casa (proporção 2,06 em vez de 1,73) e foi esticado por código até o losango exato; o contorno escuro de cada casa aparece entre casas vizinhas.
- `objeto/suporte-de-ferramentas`, `objeto/quadro-de-pedidos` e `objeto/bandeirinhas-de-festa` vieram com a diagonal mais deitada (0,39 a 0,42) e foram acertados por código (`--inclinar`).
- `icone/folego` é uma nuvenzinha de sopro; `icone/xp` é a estrela; `icone/cash` é a gema verde.
- `icone/regador-grande` e `icone/regador-de-crivo` são os dois verdes; o de crivo se distingue pelo bico em leque com três jatos.
- Fora da lista original, para cobrir `jogo/dados`: as ampliações 3 e 4 do celeiro (dois andares e Galpão), `icone/regador-de-crivo`, `icone/barril-de-agua`, `ui/lote` e `ui/mover`.
- **Peso**: o grupo `objetos` soma cerca de 17 milhões de pixels (mais de 4 páginas de atlas de 2048); mais da metade são os 10 celeiros e as 3 camadas do curral. Se pesar no celular, carregar só o celeiro do nível atual ou reduzir essas peças no atlas.
- **Não feito**: a personagem e os animais são de outra frente. Só os itens têm `icone/<id>`: não há ícone de construção nem de animal. A tela de subida de nível pede `icone/<id>` do que foi liberado e cai na figura de reserva quando o liberado não é item; se a interface precisar, pedir uma grade nova no modelo dos pedidos 45 a 48.
- **Começo da fazenda (pedidos 59 a 63)**: `casa-velha` saiu na 2ª rodada (59-casa-velha-r2.md): a 1ª veio 5% maior e com a parede da esquerda mais deitada; a 2ª envelheceu a própria casa nova sem mexer na forma, e bate com ela a 1 ou 2 px. O arame também foi para a 2ª rodada (61-arame-farpado-r2.md): na 1ª os mourões vinham baixos (na canela da personagem); agora têm a altura da cerca de madeira. Os trechos de arame vieram com a diagonal mais deitada (0,38 a 0,44) e foram acertados com `--inclinar`. Os trechos X e Z vêm de fatores um pouco diferentes (0,37 e 0,35) para o vão de 1 unidade ficar exato; no canto onde X encontra Z o mourão de um é uns 6% maior que o do outro. O regador no chão tem a largura do regador que a personagem segura na animação de regar.
- **Codex**: nenhuma recusa, nenhum aviso de limite de uso nem de login em todos os pedidos (54 a 112 s cada). As imagens saem com alfa de verdade; o "halo" que aparece em alguns visualizadores é cor em pixels totalmente transparentes.
