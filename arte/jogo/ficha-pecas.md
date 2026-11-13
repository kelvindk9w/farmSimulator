# Ficha das peças de arte parada

Construções, objetos, plantas, ícones e retratos do jogo, pedidos ao Codex de terminal e preparados por `jogo/tools/arte/peca.mjs`. A personagem e os animais são de outra frente (`personagem`, `animais`).

## Como é feito

1. O pedido fica em `arte/jogo/pedidos/NN-nome.md` (numerados; `_cabecalho*.txt`, `_regras*.txt` e `_guia.txt` são os trechos comuns). Todo pedido leva anexa a cena aprovada `arte/estilo/rodada-03/var-2-contorno.png`.
2. `CODEX_HOME=/root/.codex-farm tools/arte/codex.sh /root/arte-codex/jogo-NN-nome arte/jogo/pedidos/NN-nome.md <referências>`. As imagens cruas ficam em `/root/arte-codex/` (fora do repositório).
3. Construções levam também um **bloco-guia** cinza feito por código (`peca.mjs guia --bloco LxPxH --telhado R`), na câmera exata do jogo. Sem ele o Codex erra a inclinação da base (o primeiro celeiro veio com 0,27 de um lado e 0,57 do outro; com a guia, 0,54 e 0,56; o certo é 0,58).
4. `peca.mjs` confere (alfa de verdade, cantos transparentes, nada tocando a borda, ciscos, meia-transparência), apara, põe em 128 px por unidade, grava em `jogo/arte/<grupo>/` e escreve `jogo/arte/catalogo/<grupo>.json`. O registro de como cada peça foi feita fica em `arte/jogo/pecas.json`.
5. `peca.mjs folha` refaz as folhas de contato de `arte/jogo/folhas/` (em cima, sobre grama, com o losango das casas ocupadas e a peça em tamanho de celular ao lado; embaixo, sobre fundo claro). `peca.mjs ficha` refaz a tabela abaixo.

## Convenções das peças

- Porta e frente das construções na face de **+Z** (a da esquerda na tela), que tem `L` casas de largura; a face da direita tem `P` casas. `apoio` é o centro da base (o centro das casas ocupadas).
- Estado aberto é outra chave: `objeto/celeiro` e `objeto/celeiro-aberto`, `objeto/porteira` e `objeto/porteira-aberta`.
- Cerca: `objeto/cerca-x` (corre em X, desce para a direita na tela) e `objeto/cerca-z` (corre em Z, desce para a esquerda) têm exatamente 1 unidade de mourão a mourão e o apoio no meio do trecho, no chão; trechos vizinhos sobrepõem o mourão. `objeto/mourao` é o mourão sozinho. `objeto/porteira` tem 2 unidades de mourão a mourão, corre em X; para a outra direção, espelhe. `objeto/cerca-de-madeira` é apelido de `cerca-x`.
- Culturas: `cultura/<id>-<estágio>`, um punhado de plantas que cabe numa casa, sem a terra; apoio no centro da casa.
- Ícones: 128 x 128, apoio no centro. Retratos: 256 x 256.

## Peças

<!-- tabela:inicio -->

No catálogo: 200 chaves (200 prontas, 0 pendentes).

### objetos (54)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `objeto/aprisco` | objetos/aprisco.png | 858 x 736 | 431, 512 | 5 x 4 | casas 5x4 | 34-aprisco.md | pronto |
| `objeto/arbusto` | objetos/arbusto.png | 170 x 142 | 85, 97 | 1 x 1 | largura 1.2 | 06-natureza.md | pronto |
| `objeto/arvore` | objetos/mata.png (apelido) | 444 x 503 | 224, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/banca` | objetos/banca.png | 402 x 462 | 202, 344 | 3 x 2 | casas 3x2 | 04-banca.md | pronto |
| `objeto/bancada-de-carpintaria` | objetos/bancada-de-carpintaria.png | 257 x 236 | 129, 159 | 2 x 1 | largura 1.88 | 29-bancadas.md | pronto |
| `objeto/bancada-de-embalar` | objetos/bancada-de-embalar.png | 257 x 237 | 129, 160 | 2 x 1 | largura 1.88 | 29-bancadas.md | pronto |
| `objeto/bau` | objetos/bau.png | 221 x 217 | 111, 150 | 2 x 1 | largura 1.6 | 39-moveis-do-celeiro.md | pronto |
| `objeto/bebedouro` | objetos/bebedouro.png | 111 x 115 | 56, 81 | 1 x 1 | largura 0.74 | 28-pecas-de-trato.md | pronto |
| `objeto/bebedouro-grande` | objetos/bebedouro-grande.png | 266 x 225 | 133, 145 | 2 x 1 | largura 1.95 | 28-pecas-de-trato.md | pronto |
| `objeto/caixote` | objetos/caixote.png | 161 x 173 | 81, 123 | 1 x 1 | largura 1.13 | 39-moveis-do-celeiro.md | pronto: câmera um pouco mais de cima que o resto (inclinação da base 0,70 em vez de 0,58) |
| `objeto/casa` | objetos/casa.png | 681 x 642 | 340, 470 | 4 x 3 | casas 4x3 | 25-casa.md | pronto |
| `objeto/celeiro` | objetos/celeiro.png | 856 x 834 | 426, 601 | 5 x 4 | casas 5x4 | 23-celeiro-fechado.md | pronto |
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
| `objeto/estabulo` | objetos/estabulo.png | 769 x 770 | 380, 570 | 4 x 4 | casas 4x4 | 33-estabulo.md | pronto |
| `objeto/fardo-de-feno` | objetos/fardo-de-feno.png | 179 x 162 | 90, 107 | 1 x 1 | largura 1.27 | 39-moveis-do-celeiro.md | pronto |
| `objeto/flores` | objetos/flores.png | 138 x 128 | 69, 98 | 1 x 1 | largura 0.95 | 06-natureza.md | pronto |
| `objeto/galinheiro` | objetos/galinheiro.png | 567 x 525 | 279, 363 | 3 x 3 | casas 3x3 | 27-galinheiro.md | pronto |
| `objeto/ipe` | objetos/ipe.png | 456 x 493 | 214, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/laticinio` | objetos/laticinio.png | 665 x 729 | 337, 537 | 4 x 3 | casas 4x3 | 31-laticinio.md | pronto |
| `objeto/mata` | objetos/mata.png | 444 x 503 | 224, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/mato` | objetos/mato.png | 144 x 158 | 72, 128 | 1 x 1 | largura 1.0 | 06-natureza.md | pronto |
| `objeto/moinho` | objetos/moinho.png | 493 x 534 | 246, 389 | 3 x 3 | casas 3x3 | 30-moinho.md | pronto |
| `objeto/mourao` | objetos/mourao.png | 50 x 117 | 25, 99 |  | fator 0.439 | 05-cercas.md | pronto |
| `objeto/ninho` | objetos/ninho.png | 108 x 78 | 54, 48 | 1 x 1 | largura 0.72 | 28-pecas-de-trato.md | pronto |
| `objeto/parede-x` | objetos/parede-x.png | 109 x 382 | 54, 348 |  | parede de 1 unidade, altura 3 | 40-texturas-do-celeiro.md | pronto |
| `objeto/parede-z` | objetos/parede-z.png | 109 x 382 | 54, 348 |  | parede de 1 unidade, altura 3 | 40-texturas-do-celeiro.md | pronto |
| `objeto/pedra` | objetos/pedra.png | 125 x 103 | 63, 74 | 1 x 1 | largura 0.85 | 06-natureza.md | pronto |
| `objeto/piso-tabuas` | objetos/piso-tabuas.png | 198 x 121 | 99, 61 | 1 x 1 | piso de 1 casa | 40-texturas-do-celeiro.md | pronto |
| `objeto/placa` | objetos/placa.png | 140 x 171 | 63, 158 | 1 x 1 | largo-px 124 | 05-cercas.md | pronto |
| `objeto/poco` | objetos/poco.png | 308 x 441 | 142, 370 | 2 x 2 | largura 2.28 | 01-poco.md | pronto |
| `objeto/porteira` | objetos/porteira.png | 252 x 292 | 126, 216 | 2 x 1 | fator 0.7016 | 05-cercas.md | pronto |
| `objeto/porteira-aberta` | objetos/porteira-aberta.png | 252 x 311 | 126, 235 | 2 x 1 | fator 0.7016 | 05-cercas.md | pronto |
| `objeto/prateleira-reforcada` | objetos/prateleira-reforcada.png | 222 x 360 | 111, 293 | 2 x 1 | fator 0.53 | 51-prateleira-reforcada.md | pronto |
| `objeto/prateleira-reforcada-cheia` | objetos/prateleira-reforcada-cheia.png | 230 x 360 | 111, 293 | 2 x 1 | fator 0.53 | 51-prateleira-reforcada.md | pronto |
| `objeto/prateleira-reforcada-meia` | objetos/prateleira-reforcada-meia.png | 221 x 360 | 111, 293 | 2 x 1 | fator 0.53 | 51-prateleira-reforcada.md | pronto |
| `objeto/prateleira-simples` | objetos/prateleira-simples.png | 251 x 326 | 126, 250 | 2 x 1 | fator 0.566 | 38-prateleira.md | pronto |
| `objeto/prateleira-simples-cheia` | objetos/prateleira-simples-cheia.png | 263 x 327 | 125, 251 | 2 x 1 | fator 0.566 | 38-prateleira.md | pronto |
| `objeto/prateleira-simples-meia` | objetos/prateleira-simples-meia.png | 253 x 326 | 126, 250 | 2 x 1 | fator 0.566 | 38-prateleira.md | pronto |
| `objeto/quadro-de-pedidos` | objetos/quadro-de-pedidos.png | 185 x 257 | 93, 217 | 1 x 1 | altura 2.0 | 28-pecas-de-trato.md | pronto |
| `objeto/rochedo` | objetos/rochedo.png | 189 x 143 | 95, 91 | 1 x 1 | largura 1.35 | 06-natureza.md | pronto |
| `objeto/saco-de-sementes` | objetos/saco-de-sementes.png | 106 x 134 | 53, 104 | 1 x 1 | largura 0.7 | 39-moveis-do-celeiro.md | pronto |
| `objeto/sombra-do-curral` | objetos/sombra-do-curral.png | 541 x 477 | 275, 346 | 3 x 2 | casas 3x2 | 43-sombra-do-curral.md | pronto |
| `objeto/suporte-de-ferramentas` | objetos/suporte-de-ferramentas.png | 223 x 286 | 112, 219 | 2 x 1 | fator 0.35 | 08-suporte-ferramentas.md | pronto |
| `objeto/suporte-de-ferramentas-vazio` | objetos/suporte-de-ferramentas-vazio.png | 223 x 286 | 112, 219 | 2 x 1 | fator 0.35 | 08-suporte-ferramentas.md | pronto |
| `objeto/toco` | objetos/toco.png | 144 x 126 | 72, 85 | 1 x 1 | largura 1.0 | 06-natureza.md | pronto |

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

### icones (67)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `icone/abobora` | icones/abobora.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/alface` | icones/alface.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/arroz` | icones/arroz.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/balde` | icones/balde.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/banana` | icones/banana.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/caixa-de-ovos` | icones/caixa-de-ovos.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/caixa-de-ovos-grande` | icones/caixa-de-ovos-grande.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/cana` | icones/cana.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/carroca` | icones/carroca.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/cash` | icones/cash.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cesto` | icones/cesto-de-palha.png (apelido) | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cesto-de-palha` | icones/cesto-de-palha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cesto-grande` | icones/cesto-grande.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cinto-de-couro` | icones/cinto-de-couro.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/cinto-de-oficio` | icones/cinto-de-oficio.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/convite` | icones/convite.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/duzia-de-ovos` | icones/duzia-de-ovos.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/enxada` | icones/enxada-velha.png (apelido) | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/enxada-de-aco` | icones/enxada-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/enxada-de-ferro` | icones/enxada-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/enxada-velha` | icones/enxada-velha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/feijao` | icones/feijao.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/fibra` | icones/fibra.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/foice-de-aco` | icones/foice-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/foice-de-ferro` | icones/foice-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/foice-velha` | icones/foice-velha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/folego` | icones/folego.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/fuba` | icones/fuba.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/garrafa-de-leite` | icones/garrafa-de-leite.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/gota` | icones/gota.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/la` | icones/la.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/laranja` | icones/laranja.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/leite` | icones/leite.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/machado-de-aco` | icones/machado-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/machado-de-ferro` | icones/machado-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/machado-velho` | icones/machado-velho.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/madeira` | icones/madeira.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/mandioca` | icones/mandioca.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/manteiga` | icones/manteiga.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/martelo` | icones/martelo.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/milho` | icones/milho.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/ouro` | icones/ouro.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/ovo` | icones/ovo.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/pedra` | icones/pedra.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/picareta-de-aco` | icones/picareta-de-aco.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/picareta-de-ferro` | icones/picareta-de-ferro.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/picareta-velha` | icones/picareta-velha.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/prego` | icones/prego.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/queijo-minas` | icones/queijo-minas.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/racao` | icones/racao.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/regador` | icones/regador-velho.png (apelido) | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/regador-de-cobre` | icones/regador-de-cobre.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/regador-de-lata` | icones/regador-de-lata.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/regador-grande` | icones/regador-grande.png | 128 x 128 | 64, 64 |  | caixa 128 | 47-icones-ferramentas-2.md | pronto |
| `icone/regador-velho` | icones/regador-velho.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/semente-abobora` | icones/semente-abobora.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-alface` | icones/semente-alface.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-arroz` | icones/semente-arroz.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-cana` | icones/semente-cana.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-feijao` | icones/semente-feijao.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-mandioca` | icones/semente-mandioca.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-milho` | icones/semente-milho.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/semente-tomate` | icones/semente-tomate.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/tabua` | icones/tabua.png | 128 x 128 | 64, 64 |  | caixa 128 | 19-icones-produtos.md | pronto |
| `icone/tesoura-de-tosquia` | icones/tesoura-de-tosquia.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |
| `icone/tomate` | icones/tomate.png | 128 x 128 | 64, 64 |  | caixa 128 | 17-icones-colheitas-sementes.md | pronto |
| `icone/xp` | icones/xp.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto |

### retratos (4)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `retrato/seu-tonho` | retratos/seu-tonho.png | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |
| `retrato/seu-tonho-alegre` | retratos/seu-tonho-alegre.png | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |
| `retrato/seu-tonho-explicando` | retratos/seu-tonho-explicando.png | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |
| `retrato/seu-tonho-neutro` | retratos/seu-tonho.png (apelido) | 256 x 256 | 128, 248 |  | caixa 256 | 21-retratos-seu-tonho.md | pronto |

### interface (20)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `ui/bau-aberto` | interface/bau-aberto.png | 268 x 280 | 134, 272 |  | fator 0.5 | 22-nivel-e-bau.md | pronto |
| `ui/bau-fechado` | interface/bau-fechado.png | 252 x 226 | 126, 218 |  | fator 0.5 | 22-nivel-e-bau.md | pronto |
| `ui/cadeado` | interface/cadeado.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/config` | interface/config.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/enxada` | interface/enxada.png | 128 x 128 | 64, 64 |  | caixa 128 | 18-icones-ferramentas.md | pronto: o mesmo desenho de icone/enxada-velha |
| `ui/fechar` | interface/fechar.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/loja` | interface/loja.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/mao` | interface/mao.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/missoes` | interface/missoes.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/mochila` | interface/mochila.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/pedidos` | interface/pedidos.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/presente` | interface/presente.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/regar` | interface/regar.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/relogio` | interface/relogio.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/semear` | interface/semear.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/seta` | interface/seta.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/som` | interface/som.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/subida-de-nivel` | interface/subida-de-nivel.png | 528 x 278 | 264, 270 |  | largo-px 512 | 22-nivel-e-bau.md | pronto |
| `ui/tela-cheia` | interface/tela-cheia.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |
| `ui/trofeu` | interface/trofeu.png | 128 x 128 | 64, 64 |  | caixa 128 | 26-icones-interface.md | pronto |

<!-- tabela:fim -->

## Pendências e observações

(atualizado a cada entrega; ver o fim do arquivo)
