# Ficha das animações (personagem e bichos)

Gerada por `node jogo/tools/arte/ficha.mjs`; não edite à mão. As notas de cada folha ficam em `arte/jogo/notas-animacoes.json`.

- **Pronta**: está no catálogo e passou na conferência por código e no olho.
- **Pendente**: está no catálogo (o jogo já usa), mas tem um defeito anotado e merece ser refeita.
- **Falta**: ainda não foi pedida ou não chegou a um desenho aproveitável; o jogo usa a figura de reserva.

Como é feito: o pedido (`arte/jogo/pedidos/<nome>.md`) vai ao Codex com a cena de estilo e a folha de modelo da figura; a folha crua fica fora do repositório (`/root/arte-codex/anim-*`); `jogo/tools/arte/folha.mjs` separa os quadros, limpa, põe na escala, alinha, grava a peça em `jogo/arte/`, a entrada no catálogo, a tira e a animação de conferência em `arte/jogo/folhas/`.

## Folhas de modelo

| Figura | Arquivo | Pedido | Nota |
|---|---|---|---|
| personagem | `arte/jogo/modelos/personagem.png` | `modelo-personagem.md` | Frente, costas e perfil. Feita a partir das duas figuras aprovadas da rodada 4. Uma rodada. |
| ferramentas | `arte/jogo/modelos/ferramentas.png` | `modelo-ferramentas.md` | As dez ferramentas de mão (enxada, regador, cesto, saquinho de sementes, martelo, machado, picareta, tesoura de tosquia, balde, banquinho) ao lado da personagem, para dar o tamanho. Vai anexada a toda ação com ferramenta. Uma rodada. |
| galinha | `arte/jogo/modelos/galinha.png` | `modelo-galinha.md` | A galinha branca da cena de estilo: frente, costas e perfil. Uma rodada. |

## 1. Personagem: movimento e lavoura

| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |
|---|---|---|---|---|---|---|---|---|
| `personagem/parada-frente` | Pronta | 12 (4 desenhos) | 152x320 | 76,298 | 6 | 1 | `personagem-parada-frente.md` | 4 desenhos (descanso, inspira, peito cheio, piscada) montados em 12 quadros para a piscada vir uma vez a cada 2 segundos. |
| `personagem/parada-costas` | Pronta | 12 (3 desenhos) | 136x320 | 68,298 | 6 | 1 | `personagem-parada-costas.md` | 3 desenhos montados em 12 quadros. Vista um pouco mais de costas que a do andar; escala só pela altura (o lenço aparece mais e enganaria a medida). |
| `personagem/andar-frente` | Pendente | 8 | 152x312 | 76,290 | 10 | 1 | `personagem-andar-frente.md` | Viva e coerente, mas os quadros 5 a 8 repetem os 1 a 4: as pernas não trocam de verdade (é um ciclo de 4 poses tocado duas vezes). |
| `personagem/andar-costas` | Pendente | 8 | 160x320 | 80,298 | 10 | 1 | `personagem-andar-costas.md` | Mesmo caso da de frente: 4 poses tocadas duas vezes. |
| `personagem/correr-frente` | Pronta | 8 | 160x288 | 80,266 | 12 | 1 | `personagem-correr-frente.md` | Corrida inclinada, com dois quadros no ar (4 e 8). Escala só pelo lenço, porque correndo ela não chega à altura de pé. |
| `personagem/correr-costas` | Pronta | 8 | 184x312 | 92,290 | 12 | 1 | `personagem-correr-costas.md` | Par da corrida de frente; dois quadros no ar (4 e 8). |
| `personagem/enxadar-frente` | Pronta | 6 | 288x408 | 144,375 | 8 | 1 | `personagem-enxadar-frente.md` | Prepara, ergue, topo, golpe, crava, puxa. Pés plantados (alinhados pelas botas); a lâmina desce abaixo dos pés no golpe, por isso a casa é alta. |
| `personagem/enxadar-costas` | Pronta | 6 | 240x392 | 120,370 | 8 | 1 | `personagem-enxadar-costas.md` | Par da de frente. A lâmina cai à direita dela, quase na altura dos pés. |
| `personagem/semear-frente` | Pronta | 6 | 184x320 | 92,298 | 8 | 1 | `personagem-semear-frente.md` | Pega no saquinho, tira, abaixa, solta, cobre a terra, levanta. O saquinho fica na mão esquerda. |
| `personagem/semear-costas` | Pronta | 6 | 216x320 | 108,298 | 8 | 1 | `personagem-semear-costas.md` | Par da de frente; o saquinho aparece ao lado do quadril. |
| `personagem/regar-frente` | Pronta | 6 | 208x328 | 104,306 | 8 | 1 | `personagem-regar-frente.md` | Segura, ergue (antecipação), inclina, rega, espalha, volta. Sem água: o jogo faz com partículas. |
| `personagem/regar-costas` | Pronta | 6 | 240x320 | 120,298 | 8 | 1 | `personagem-regar-costas.md` | Par da de frente; o regador aparece ao lado do corpo. |
| `personagem/colher-frente` | Pronta | 6 | 192x328 | 96,306 | 8 | 1 | `personagem-colher-frente.md` | Prepara, abaixa, agarra, puxa com força (cara de esforço), levanta contente, guarda. Mãos vazias: o jogo desenha o que foi colhido. |
| `personagem/colher-costas` | Pronta | 6 | 184x320 | 92,298 | 8 | 1 | `personagem-colher-costas.md` | Par da de frente. |
| `personagem/carregar-frente` | Pronta | 8 | 152x320 | 76,298 | 10 | 1 | `personagem-carregar-frente.md` | Anda com o cesto de vime nas duas mãos, à frente da barriga. O cesto vai vazio. |
| `personagem/carregar-costas` | Pronta | 8 | 152x320 | 76,298 | 10 | 1 | `personagem-carregar-costas.md` | Par da de frente; aparece a borda do cesto ao lado da cintura. |
| `personagem/manivela-frente` | Pronta | 6 | 168x328 | 84,306 | 8 | 1 | `personagem-manivela-frente.md` | As mãos juntas fazem um círculo à frente do corpo; a manivela não é desenhada (é do poço). |
| `personagem/manivela-costas` | Pronta | 6 | 168x328 | 84,306 | 8 | 1 | `personagem-manivela-costas.md` | Par da de frente. |

## 2. Galinha e vaca

| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |
|---|---|---|---|---|---|---|---|---|
| `animal/galinha/parada-frente` | Falta | | | | |  |  |  |
| `animal/galinha/parada-costas` | Falta | | | | |  |  |  |
| `animal/galinha/andar-frente` | Falta | | | | |  |  |  |
| `animal/galinha/andar-costas` | Falta | | | | |  |  |  |
| `animal/galinha/ciscar-frente` | Falta | | | | |  |  |  |
| `animal/galinha/ciscar-costas` | Falta | | | | |  |  |  |
| `animal/vaca/parada-frente` | Falta | | | | |  |  |  |
| `animal/vaca/parada-costas` | Falta | | | | |  |  |  |
| `animal/vaca/andar-frente` | Falta | | | | |  |  |  |
| `animal/vaca/andar-costas` | Falta | | | | |  |  |  |
| `animal/vaca/pastar-frente` | Falta | | | | |  |  |  |
| `animal/vaca/pastar-costas` | Falta | | | | |  |  |  |

## 3. Personagem: trato e ofícios

| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |
|---|---|---|---|---|---|---|---|---|
| `personagem/ordenhar-frente` | Falta | | | | |  |  |  |
| `personagem/ordenhar-costas` | Falta | | | | |  |  |  |
| `personagem/alimentar-frente` | Falta | | | | |  |  |  |
| `personagem/alimentar-costas` | Falta | | | | |  |  |  |
| `personagem/martelar-frente` | Falta | | | | |  |  |  |
| `personagem/martelar-costas` | Falta | | | | |  |  |  |
| `personagem/colher-fruta-frente` | Falta | | | | |  |  |  |
| `personagem/colher-fruta-costas` | Falta | | | | |  |  |  |
| `personagem/tosquiar-frente` | Falta | | | | |  |  |  |
| `personagem/tosquiar-costas` | Falta | | | | |  |  |  |
| `personagem/machado-frente` | Falta | | | | |  |  |  |
| `personagem/machado-costas` | Falta | | | | |  |  |  |
| `personagem/picareta-frente` | Falta | | | | |  |  |  |
| `personagem/picareta-costas` | Falta | | | | |  |  |  |

## 4. Outros bichos e montaria

| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |
|---|---|---|---|---|---|---|---|---|
| `animal/ovelha/parada-frente` | Falta | | | | |  |  |  |
| `animal/ovelha/parada-costas` | Falta | | | | |  |  |  |
| `animal/ovelha/andar-frente` | Falta | | | | |  |  |  |
| `animal/ovelha/andar-costas` | Falta | | | | |  |  |  |
| `animal/ovelha-tosquiada/parada-frente` | Falta | | | | |  |  |  |
| `animal/ovelha-tosquiada/parada-costas` | Falta | | | | |  |  |  |
| `animal/ovelha-tosquiada/andar-frente` | Falta | | | | |  |  |  |
| `animal/ovelha-tosquiada/andar-costas` | Falta | | | | |  |  |  |
| `animal/boi/parado-frente` | Falta | | | | |  |  |  |
| `animal/boi/parado-costas` | Falta | | | | |  |  |  |
| `animal/boi/puxar-frente` | Falta | | | | |  |  |  |
| `animal/boi/puxar-costas` | Falta | | | | |  |  |  |
| `animal/cavalo/parado-frente` | Falta | | | | |  |  |  |
| `animal/cavalo/parado-costas` | Falta | | | | |  |  |  |
| `animal/cavalo/andar-frente` | Falta | | | | |  |  |  |
| `animal/cavalo/andar-costas` | Falta | | | | |  |  |  |
| `animal/cavalo/galope-frente` | Falta | | | | |  |  |  |
| `animal/cavalo/galope-costas` | Falta | | | | |  |  |  |
| `personagem/montada-andar-frente` | Falta | | | | |  |  |  |
| `personagem/montada-andar-costas` | Falta | | | | |  |  |  |
| `personagem/montada-galope-frente` | Falta | | | | |  |  |  |
| `personagem/montada-galope-costas` | Falta | | | | |  |  |  |
| `animal/jumento/parado-frente` | Falta | | | | |  |  |  |
| `animal/jumento/parado-costas` | Falta | | | | |  |  |  |
| `animal/jumento/andar-frente` | Falta | | | | |  |  |  |
| `animal/jumento/andar-costas` | Falta | | | | |  |  |  |
| `animal/cachorro/parado-frente` | Falta | | | | |  |  |  |
| `animal/cachorro/parado-costas` | Falta | | | | |  |  |  |
| `animal/cachorro/andar-frente` | Falta | | | | |  |  |  |
| `animal/cachorro/andar-costas` | Falta | | | | |  |  |  |
| `animal/cachorro/sentado-frente` | Falta | | | | |  |  |  |
| `animal/cachorro/sentado-costas` | Falta | | | | |  |  |  |
| `animal/gato/parado-frente` | Falta | | | | |  |  |  |
| `animal/gato/parado-costas` | Falta | | | | |  |  |  |
| `animal/gato/andar-frente` | Falta | | | | |  |  |  |
| `animal/gato/andar-costas` | Falta | | | | |  |  |  |
| `animal/gato/sentado-frente` | Falta | | | | |  |  |  |
| `animal/gato/sentado-costas` | Falta | | | | |  |  |  |

## Como cada folha foi preparada

A folha crua de cada chave e as opções passadas a `folha.mjs` (para refazer igual):

| Chave | Folha crua | Opções | Altura entre quadros | Avisos |
|---|---|---|---|---|
| `personagem/andar-costas` | `andar-costas.png` (2172x724) | `--quadros 8 --altura 294 --qps 10 --base 0.5 --tamanho-cor 48.7 --altura-livre` | 6.3% | altura varia 6.3% entre quadros (300 282 294 290 298 281 297 291), esperado nesta ação |
| `personagem/andar-frente` | `andar-frente.png` (2172x724) | `--quadros 8 --altura 294 --qps 10 --base 0.5 --tamanho-cor 47.5 --altura-livre` | 7.2% | altura varia 7.2% entre quadros (291 274 287 278 287 277 287 271), esperado nesta ação |
| `personagem/carregar-costas` | `carregar-costas.png` (2172x724) | `--altura 294 --quadros 8 --qps 10 --base 0.5 --tamanho-cor 48.7 --altura-livre` | 6% | altura varia 6.0% entre quadros (297 281 292 290 296 280 289 290), esperado nesta ação |
| `personagem/carregar-frente` | `carregar-frente.png` (2172x724) | `--altura 294 --quadros 8 --qps 10 --base 0.5 --tamanho-cor 47.5 --altura-livre` | 4.6% | altura varia 4.6% entre quadros (294 286 296 295 297 284 295 292), esperado nesta ação |
| `personagem/colher-costas` | `colher-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 28.6% | altura varia 28.6% entre quadros (282 244 215 253 300 298), esperado nesta ação |
| `personagem/colher-frente` | `colher-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 31.9% | a proporção entre cabeça e corpo difere 8% da folha de modelo; altura varia 31.9% entre quadros (284 237 207 255 305 303), esperado nesta ação; tamanho pela cor de referência varia 16% entre quadros (47 48 48 41 45 46): confira se a figura muda de tamanho |
| `personagem/correr-costas` | `correr-costas.png` (2172x724) | `--altura 294 --quadros 8 --qps 12 --base linha --tamanho-cor 48.7 --peso-cor 1 --altura-livre` | 16.3% | altura varia 16.3% entre quadros (275 258 273 230 267 256 273 232), esperado nesta ação |
| `personagem/correr-frente` | `correr-frente.png` (2172x724) | `--altura 294 --quadros 8 --qps 12 --base linha --tamanho-cor 47.5 --peso-cor 1 --altura-livre` | 12.6% | a proporção entre cabeça e corpo difere 15% da folha de modelo; altura varia 12.6% entre quadros (250 238 244 218 246 236 243 220), esperado nesta ação |
| `personagem/enxadar-costas` | `enxadar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 32.9% | altura varia 32.9% entre quadros (300 298 370 278 248 290), esperado nesta ação |
| `personagem/enxadar-frente` | `enxadar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 31.3% | alinhamento incerto pelo molde nos quadros 3, 5 (custos 0 131 173 139 152 101): olhe a sobreposição na tira; altura varia 31.3% entre quadros (301 300 374 282 257 291), esperado nesta ação |
| `personagem/manivela-costas` | `manivela-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 7.3% | altura varia 7.3% entre quadros (305 305 301 283 297 305), esperado nesta ação |
| `personagem/manivela-frente` | `manivela-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 12.9% | a proporção entre cabeça e corpo difere 8% da folha de modelo; altura varia 12.9% entre quadros (306 296 283 267 293 306), esperado nesta ação |
| `personagem/parada-costas` | `parada-costas.png` (2172x724) | `--quadros 3 --altura 294 --qps 6 --alinhar molde --em-pe-quadro 1 --sequencia 1,1,2,3,3,3,2,1,1,1,1,1` | 0.8% |  |
| `personagem/parada-frente` | `parada-frente.png` (2172x724) | `--quadros 4 --altura 294 --qps 6 --alinhar molde --em-pe-quadro 1 --tamanho-cor 47.5 --sequencia 1,1,2,3,3,3,2,1,1,4,1,1` | 0% |  |
| `personagem/regar-costas` | `regar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 6.8% | altura varia 6.8% entre quadros (294 294 291 274 276 292), esperado nesta ação |
| `personagem/regar-frente` | `regar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 11.1% | altura varia 11.1% entre quadros (303 301 293 270 277 303), esperado nesta ação |
| `personagem/semear-costas` | `semear-costas.png` (2171x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 21.5% | altura varia 21.5% entre quadros (297 301 271 243 236 293), esperado nesta ação |
| `personagem/semear-frente` | `semear-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 24.6% | altura varia 24.6% entre quadros (301 302 266 236 228 282), esperado nesta ação |

## Decisões e observações

- Altura da personagem em pé: 294 pontos (2,3 unidades de tela a 128 por unidade).
- No andar, o chão de cada quadro é a média entre o ponto mais baixo do quadro e o da folha inteira (`--base 0.5`): guarda o sobe e desce que o Codex desenhou sem deixar os pés longe do chão.
- O tamanho da figura entre folhas é conferido pela área do lenço vermelho (coluna tamanho pela cor de `medidas-animacoes.json`): na folha de modelo, com 294 pontos de altura, dá 47,5 de frente e 48,7 de costas. Com `--tamanho-cor`, a escala é a média entre a da altura e a do lenço, para nem a altura nem a cabeça destoarem de uma folha para a outra. Quando a vista muda (mais de costas, cabeça baixa), o lenço engana e vale só a altura.

## Resumo

16 prontas, 2 pendentes (no catálogo, com defeito anotado) e 64 em falta, de 82 folhas da lista.

As tiras de conferência (`arte/jogo/folhas/<nome>.png`: os quadros lado a lado, a linha do chão, o ponto de apoio e todos os quadros sobrepostos) e as animações (`.gif`) têm o nome da chave com hífens, por exemplo `personagem-andar-frente.png`.
