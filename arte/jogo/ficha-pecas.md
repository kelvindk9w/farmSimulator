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

No catálogo: 28 chaves (28 prontas, 0 pendentes).

### objetos (21)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `objeto/arbusto` | objetos/arbusto.png | 170 x 142 | 85, 97 | 1 x 1 | largura 1.2 | 06-natureza.md | pronto |
| `objeto/arvore` | objetos/mata.png (apelido) | 444 x 503 | 224, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/banca` | objetos/banca.png | 402 x 462 | 202, 344 | 3 x 2 | casas 3x2 | 04-banca.md | pronto |
| `objeto/casa` | objetos/casa.png | 681 x 642 | 340, 470 | 4 x 3 | casas 4x3 | 25-casa.md | pronto |
| `objeto/celeiro` | objetos/celeiro.png | 856 x 834 | 426, 601 | 5 x 4 | casas 5x4 | 23-celeiro-fechado.md | pronto |
| `objeto/celeiro-aberto` | objetos/celeiro-aberto.png | 856 x 834 | 426, 601 | 5 x 4 | casas 5x4 | 24-celeiro-aberto.md | pronto: igual ao fechado fora da porta (só a região que muda foi tirada do desenho aberto) |
| `objeto/cerca-de-madeira` | objetos/cerca-x.png (apelido) | 142 x 163 | 71, 119 | 1 x 1 | fator 0.5085 | 05-cercas.md | pronto |
| `objeto/cerca-x` | objetos/cerca-x.png | 142 x 163 | 71, 119 | 1 x 1 | fator 0.5085 | 05-cercas.md | pronto |
| `objeto/cerca-z` | objetos/cerca-z.png | 142 x 163 | 71, 119 | 1 x 1 | fator 0.5113 | 05-cercas.md | pronto |
| `objeto/flores` | objetos/flores.png | 138 x 128 | 69, 98 | 1 x 1 | largura 0.95 | 06-natureza.md | pronto |
| `objeto/ipe` | objetos/ipe.png | 456 x 493 | 214, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/mata` | objetos/mata.png | 444 x 503 | 224, 457 | 1 x 1 | altura 4.3 | 07-arvores-enfeite.md | pronto |
| `objeto/mato` | objetos/mato.png | 144 x 158 | 72, 128 | 1 x 1 | largura 1.0 | 06-natureza.md | pronto |
| `objeto/mourao` | objetos/mourao.png | 50 x 117 | 25, 99 |  | fator 0.439 | 05-cercas.md | pronto |
| `objeto/pedra` | objetos/pedra.png | 125 x 103 | 63, 74 | 1 x 1 | largura 0.85 | 06-natureza.md | pronto |
| `objeto/placa` | objetos/placa.png | 140 x 171 | 63, 158 | 1 x 1 | largo-px 124 | 05-cercas.md | pronto |
| `objeto/poco` | objetos/poco.png | 308 x 441 | 142, 370 | 2 x 2 | largura 2.28 | 01-poco.md | pronto |
| `objeto/porteira` | objetos/porteira.png | 252 x 292 | 126, 216 | 2 x 1 | fator 0.7016 | 05-cercas.md | pronto |
| `objeto/porteira-aberta` | objetos/porteira-aberta.png | 252 x 311 | 126, 235 | 2 x 1 | fator 0.7016 | 05-cercas.md | pronto |
| `objeto/rochedo` | objetos/rochedo.png | 189 x 143 | 95, 91 | 1 x 1 | largura 1.35 | 06-natureza.md | pronto |
| `objeto/toco` | objetos/toco.png | 144 x 126 | 72, 85 | 1 x 1 | largura 1.0 | 06-natureza.md | pronto |

### culturas (7)

| Chave | Arquivo | Quadro (px) | Apoio | Casas | Tamanho pedido | Pedido | Situação |
|---|---|---|---|---|---|---|---|
| `cultura/alface-1` | culturas/alface-1.png | 111 x 74 | 56, 33 |  | largura 1.28 | 11-cultura-alface.md | pronto |
| `cultura/alface-2` | culturas/alface-2.png | 139 x 88 | 70, 47 |  | largura 1.28 | 11-cultura-alface.md | pronto |
| `cultura/alface-3` | culturas/alface-3.png | 180 x 108 | 90, 67 |  | largura 1.28 | 11-cultura-alface.md | pronto |
| `cultura/milho-1` | culturas/milho-1.png | 93 x 62 | 47, 24 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/milho-2` | culturas/milho-2.png | 127 x 104 | 64, 66 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/milho-3` | culturas/milho-3.png | 155 x 212 | 78, 174 |  | altura 1.6 | 09-cultura-milho.md | pronto |
| `cultura/milho-4` | culturas/milho-4.png | 160 x 213 | 80, 175 |  | altura 1.6 | 09-cultura-milho.md | pronto |

<!-- tabela:fim -->

## Pendências e observações

(atualizado a cada entrega; ver o fim do arquivo)
