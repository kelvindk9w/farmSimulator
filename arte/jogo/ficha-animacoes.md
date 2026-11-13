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

## 1. Personagem: movimento e lavoura

| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |
|---|---|---|---|---|---|---|---|---|
| `personagem/parada-frente` | Pronta | 12 (4 desenhos) | 152x320 | 76,298 | 6 | 1 | `personagem-parada-frente.md` | 4 desenhos (descanso, inspira, peito cheio, piscada) montados em 12 quadros para a piscada vir uma vez a cada 2 segundos. |
| `personagem/parada-costas` | Pronta | 12 (3 desenhos) | 136x320 | 68,298 | 6 | 1 | `personagem-parada-costas.md` | 3 desenhos montados em 12 quadros. Vista um pouco mais de costas que a do andar; escala só pela altura (o lenço aparece mais e enganaria a medida). |
| `personagem/andar-frente` | Pendente | 8 | 152x312 | 76,290 | 10 | 1 | `personagem-andar-frente.md` | Viva e coerente, mas os quadros 5 a 8 repetem os 1 a 4: as pernas não trocam de verdade (é um ciclo de 4 poses tocado duas vezes). |
| `personagem/andar-costas` | Pendente | 8 | 160x320 | 80,298 | 10 | 1 | `personagem-andar-costas.md` | Mesmo caso da de frente: 4 poses tocadas duas vezes. |
| `personagem/correr-frente` | Falta | | | | |  |  |  |
| `personagem/correr-costas` | Falta | | | | |  |  |  |
| `personagem/enxadar-frente` | Falta | | | | |  |  |  |
| `personagem/enxadar-costas` | Falta | | | | |  |  |  |
| `personagem/semear-frente` | Falta | | | | |  |  |  |
| `personagem/semear-costas` | Falta | | | | |  |  |  |
| `personagem/regar-frente` | Falta | | | | |  |  |  |
| `personagem/regar-costas` | Falta | | | | |  |  |  |
| `personagem/colher-frente` | Falta | | | | |  |  |  |
| `personagem/colher-costas` | Falta | | | | |  |  |  |
| `personagem/carregar-frente` | Falta | | | | |  |  |  |
| `personagem/carregar-costas` | Falta | | | | |  |  |  |
| `personagem/manivela-frente` | Falta | | | | |  |  |  |
| `personagem/manivela-costas` | Falta | | | | |  |  |  |

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
| `personagem/parada-costas` | `parada-costas.png` (2172x724) | `--quadros 3 --altura 294 --qps 6 --alinhar molde --em-pe-quadro 1 --sequencia 1,1,2,3,3,3,2,1,1,1,1,1` | 0.8% |  |
| `personagem/parada-frente` | `parada-frente.png` (2172x724) | `--quadros 4 --altura 294 --qps 6 --alinhar molde --em-pe-quadro 1 --tamanho-cor 47.5 --sequencia 1,1,2,3,3,3,2,1,1,4,1,1` | 0% |  |

## Decisões e observações

- Altura da personagem em pé: 294 pontos (2,3 unidades de tela a 128 por unidade).
- No andar, o chão de cada quadro é a média entre o ponto mais baixo do quadro e o da folha inteira (`--base 0.5`): guarda o sobe e desce que o Codex desenhou sem deixar os pés longe do chão.
- O tamanho da figura entre folhas é conferido pela área do lenço vermelho (coluna tamanho pela cor de `medidas-animacoes.json`): na folha de modelo, com 294 pontos de altura, dá 47,5 de frente e 48,7 de costas. Com `--tamanho-cor`, a escala é a média entre a da altura e a do lenço, para nem a altura nem a cabeça destoarem de uma folha para a outra. Quando a vista muda (mais de costas, cabeça baixa), o lenço engana e vale só a altura.

## Resumo

2 prontas, 2 pendentes (no catálogo, com defeito anotado) e 78 em falta, de 82 folhas da lista.

As tiras de conferência (`arte/jogo/folhas/<nome>.png`: os quadros lado a lado, a linha do chão, o ponto de apoio e todos os quadros sobrepostos) e as animações (`.gif`) têm o nome da chave com hífens, por exemplo `personagem-andar-frente.png`.
