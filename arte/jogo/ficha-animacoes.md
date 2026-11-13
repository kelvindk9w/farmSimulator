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
| vaca | `arte/jogo/modelos/vaca.png` | `modelo-vaca.md` | Vaca leiteira malhada: frente, costas e perfil. Uma rodada. |
| ordenha | `arte/jogo/modelos/ordenha.png` | `modelo-ordenha.md` | Folha de modelo da INTERAÇÃO: a personagem no banquinho ordenhando a vaca, vista por trás dela, pela frente dela (a vaca em primeiro plano) e a pose dela sozinha com banquinho e balde. Anexada aos pedidos de ordenhar. Uma rodada. |
| ovelha | `arte/jogo/modelos/ovelha.png` | `modelo-ovelha.md` | Ovelha com lã: frente, costas e perfil. Lã creme em tufos, cara e patas castanho-escuras. Uma rodada. |
| ovelha-tosquiada | `arte/jogo/modelos/ovelha-tosquiada.png` | `modelo-ovelha-tosquiada.md` | A mesma ovelha depois da tosquia: corpo magro creme-rosado, topetinho e tufo no rabo; mesma cabeça e mesmas patas. Feita com a folha da ovelha com lã anexa. Uma rodada. |
| tosquia | `arte/jogo/modelos/tosquia.png` | `modelo-tosquia.md` | Folha de modelo da INTERAÇÃO: a personagem ajoelhada tosquiando a ovelha, vista por trás dela, pela frente dela (a ovelha em primeiro plano) e a pose dela sozinha com a tesoura. Anexada aos pedidos de tosquiar. Uma rodada. |

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
| `animal/galinha/parada-frente` | Pronta | 8 (4 desenhos) | 128x160 | 64,142 | 4 | 1 | `galinha-parada-frente.md` | 4 desenhos (descanso, espicha, vira a cabeça, afofa de olho fechado) em 8 quadros. Altura da galinha: 129 pontos (0,88 unidade, na proporção da personagem). |
| `animal/galinha/parada-costas` | Pronta | 8 (4 desenhos) | 112x160 | 56,142 | 4 | 1 | `galinha-parada-costas.md` | Par da de frente. |
| `animal/galinha/andar-frente` | Pronta | 6 | 120x152 | 60,134 | 9 | 1 | `galinha-andar-frente.md` | Andar de galinha com a cabeça indo e vindo; eixo pelo centro de massa. |
| `animal/galinha/andar-costas` | Pronta | 6 | 112x152 | 56,134 | 9 | 1 | `galinha-andar-costas.md` | Par da de frente. |
| `animal/galinha/ciscar-frente` | Pronta | 6 | 144x152 | 72,134 | 7 | 1 | `galinha-ciscar-frente.md` | Olha, cisca com uma pata, com a outra, abaixa, bica (o bico desce abaixo dos pés), levanta. Escala pela área de tinta, igual à da parada. |
| `animal/galinha/ciscar-costas` | Pronta | 6 | 152x152 | 76,134 | 7 | 1 | `galinha-ciscar-costas.md` | Par da de frente: risca o chão com um pé e com o outro, bica duas vezes e volta. |
| `animal/vaca/parada-frente` | Pronta | 8 (4 desenhos) | 336x304 | 168,267 | 4 | 1 | `vaca-parada-frente.md` | 4 desenhos (descanso, rumina, respira com o rabo no alto, pisca) em 8 quadros. Alinhada pelo corpo e pelas patas. |
| `animal/vaca/parada-costas` | Pronta | 8 (4 desenhos) | 312x320 | 156,281 | 4 | 1 | `vaca-parada-costas.md` | Balança o rabo, respira e mexe a orelha; cascos plantados. Tamanho pela massa 202 (alvo das folhas de costas). |
| `animal/vaca/andar-frente` | Pronta | 8 | 320x320 | 160,283 | 8 | 1 | `vaca-andar-frente.md` | 8 quadros; eixo pelo centro de massa e chão da folha inteira. A folha crua veio pequena (265 pontos de altura) e foi ampliada 10% para bater com a parada: o traço fica um pouco menos nítido. |
| `animal/vaca/andar-costas` | Pronta | 8 | 312x336 | 156,297 | 8 | 2 | `vaca-andar-costas-r2.md` | 1ª rodada saiu um trote, com o corpo maior e as patas mais curtas que as da vaca parada; a 2ª pede passo lento de quatro tempos (uma pata por vez) e as proporções da folha parada: corpo igual, patas inteiras. |
| `animal/vaca/pastar-frente` | Pronta | 6 | 384x304 | 192,256 | 6 | 1 | `vaca-pastar-frente.md` | Desce a cabeça, morde, arranca, mastiga, sobe. Patas plantadas (alinhadas pelo corpo e pelas patas). |
| `animal/vaca/pastar-costas` | Pronta | 6 | 344x320 | 172,281 | 6 | 1 | `vaca-pastar-costas.md` | Par da de frente: desce a cabeça, morde, arranca, mastiga e sobe; cascos plantados. |

## 3. Personagem: trato e ofícios

| Chave | Estado | Quadros | Casa | Apoio | qps | Rodadas | Pedido | Nota |
|---|---|---|---|---|---|---|---|---|
| `personagem/ordenhar-frente` | Pronta | 6 | 184x288 | 92,266 | 8 | 1 | `personagem-ordenhar-frente.md` | Sentada no banquinho com o balde entre os pés (fazem parte do desenho); as mãos sobem e descem alternadas, o tronco balança. A vaca é desenhada à parte pelo jogo. A figura sentada veio maior que a de referência em pé: --ajuste 0.955 deixa o lenço do tamanho da parada. |
| `personagem/ordenhar-costas` | Pronta | 6 | 160x296 | 80,274 | 8 | 1 | `personagem-ordenhar-costas.md` | Par da de frente: de costas o corpo esconde parte do balde; os cotovelos sobem e descem alternados. |
| `personagem/alimentar-frente` | Pronta | 6 | 184x328 | 92,306 | 8 | 1 | `personagem-alimentar-frente.md` | Pega no balde, arma, lança num arco largo e volta. Pernas um pouco mais compridas que as da folha de modelo (aviso de 9% na proporção cabeça/corpo), no mesmo jeito de semear e regar. |
| `personagem/alimentar-costas` | Pronta | 6 | 208x320 | 104,298 | 8 | 1 | `personagem-alimentar-costas.md` | Par da de frente, com o balde na outra mão. |
| `personagem/martelar-frente` | Pronta | 6 | 208x336 | 104,314 | 8 | 1 | `personagem-martelar-frente.md` | Aponta, ergue, arma no alto, desce, bate na altura da cintura e quica. |
| `personagem/martelar-costas` | Pronta | 6 | 192x320 | 96,298 | 8 | 1 | `personagem-martelar-costas.md` | Par da de frente. |
| `personagem/colher-fruta-frente` | Pronta | 6 | 184x328 | 92,304 | 8 | 1 | `personagem-colher-fruta-frente.md` | Olha para cima, estica na ponta dos pés, apanha no alto, desce e guarda. Mão vazia: a fruta é do jogo. |
| `personagem/colher-fruta-costas` | Pronta | 6 | 176x336 | 88,308 | 8 | 1 | `personagem-colher-fruta-costas.md` | Par da de frente. Corpo um pouco mais esguio que o da folha de modelo (aviso de 9%). |
| `personagem/tosquiar-frente` | Pronta | 6 | 280x288 | 140,266 | 8 | 1 | `personagem-tosquiar-frente.md` | Ajoelhada, a mão esquerda segura (a ovelha é do jogo), a tesoura abre e fecha avançando; o tronco vai e volta. A lã cortada é do jogo. |
| `personagem/tosquiar-costas` | Pronta | 6 | 344x288 | 172,266 | 8 | 1 | `personagem-tosquiar-costas.md` | Par da de frente. A referência em pé veio com a cabeça pequena (aviso de 12%); --ajuste 0.96 iguala a altura ajoelhada à da folha de frente. |
| `personagem/machado-frente` | Pronta | 6 | 256x328 | 128,306 | 8 | 1 | `personagem-machado-frente.md` | Prepara, torce para trás, arma no alto, desce na diagonal, crava na altura dos joelhos e arranca. O aviso do lenço no quadro 3 é o braço na frente da cabeça. |
| `personagem/machado-costas` | Pronta | 6 | 248x328 | 124,306 | 8 | 1 | `personagem-machado-costas.md` | Par da de frente. |
| `personagem/picareta-frente` | Pronta | 6 | 240x336 | 120,314 | 8 | 1 | `personagem-picareta-frente.md` | Prepara, ergue, arma acima da cabeça, desce, bate no chão à frente dos pés e a picareta quica. |
| `personagem/picareta-costas` | Pronta | 6 | 224x368 | 112,346 | 8 | 1 | `personagem-picareta-costas.md` | Par da de frente. |

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
| `animal/galinha/andar-costas` | `andar-costas.png` (2172x724) | `--altura 129 --quadros 6 --qps 9 --eixo massa --base 0.5 --chao 0.05 --cor-ref 236,40,40 --altura-livre` | 10% | altura varia 10.0% entre quadros (128 118 129 127 116 129), esperado nesta ação |
| `animal/galinha/andar-frente` | `andar-frente.png` (2172x724) | `--altura 129 --quadros 6 --qps 9 --eixo massa --base 0.5 --chao 0.05 --cor-ref 236,40,40 --altura-livre` | 13.1% | altura varia 13.1% entre quadros (128 113 127 129 112 129), esperado nesta ação |
| `animal/galinha/ciscar-costas` | `ciscar-costas.png` (2172x724) | `--altura 129 --quadros 6 --qps 7 --alinhar molde --molde 0.78-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --tamanho-massa 85 --altura-livre` | 12.8% | altura varia 12.8% entre quadros (127 112 123 116 121 129), esperado nesta ação |
| `animal/galinha/ciscar-frente` | `ciscar-frente.png` (2172x724) | `--altura 129 --quadros 6 --qps 7 --alinhar molde --molde 0.78-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --tamanho-massa 84 --altura-livre` | 17.5% | altura varia 17.5% entre quadros (128 106 114 115 120 129), esperado nesta ação |
| `animal/galinha/parada-costas` | `parada-costas.png` (2172x724) | `--altura 129 --quadros 4 --qps 4 --alinhar molde --molde 0-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --cor-ref 236,40,40 --altura-livre --sequencia 1,2,2,1,3,3,1,4` | 10.1% | altura varia 10.1% entre quadros (129 138 131 124), esperado nesta ação |
| `animal/galinha/parada-frente` | `parada-frente.png` (2172x724) | `--altura 129 --quadros 4 --qps 4 --alinhar molde --molde 0-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --cor-ref 236,40,40 --altura-livre --sequencia 1,2,2,1,3,3,1,4` | 12.3% | altura varia 12.3% entre quadros (129 138 129 121), esperado nesta ação; tamanho pela cor de referência varia 13% entre quadros (24 21 21 24): confira se a figura muda de tamanho |
| `animal/vaca/andar-costas` | `andar-costas.png` (2172x724) | `--altura 297 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.09 --tamanho-massa 202 --altura-livre` | 6.9% | altura varia 6.9% entre quadros (309 307 303 299 300 300 312 291), esperado nesta ação |
| `animal/vaca/andar-frente` | `andar-frente.png` (2172x724) | `--altura 273 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.09 --tamanho-massa 212 --altura-livre` | 6.4% | a folha crua é menor que a saída (figura em pé com 265 pontos para 273): a figura foi ampliada 1.10 vezes; altura varia 6.4% entre quadros (287 274 288 277 292 274 289 281), esperado nesta ação |
| `animal/vaca/parada-costas` | `parada-costas.png` (2172x724) | `--altura 297 --quadros 4 --qps 4 --alinhar molde --molde 0.35-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1` | 2.1% |  |
| `animal/vaca/parada-frente` | `parada-frente.png` (2172x724) | `--altura 273 --quadros 4 --qps 4 --alinhar molde --molde 0.35-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1` | 2.6% |  |
| `animal/vaca/pastar-costas` | `pastar-costas.png` (2172x724) | `--altura 297 --quadros 6 --qps 6 --alinhar molde --molde 0.45-1 --faixa-pes 0.25 --chao 0.09 --tamanho-massa 202 --altura-livre` | 21.3% | altura varia 21.3% entre quadros (301 246 238 237 244 298), esperado nesta ação |
| `animal/vaca/pastar-frente` | `pastar-frente.png` (2172x724) | `--altura 273 --quadros 6 --qps 6 --alinhar molde --molde 0.45-1 --faixa-pes 0.25 --chao 0.09 --tamanho-massa 212 --altura-livre` | 15.6% | altura varia 15.6% entre quadros (275 235 251 235 232 275), esperado nesta ação |
| `personagem/alimentar-costas` | `alimentar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 4.6% | altura varia 4.6% entre quadros (288 302 300 293 295 298), esperado nesta ação |
| `personagem/alimentar-frente` | `alimentar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 5.5% | a proporção entre cabeça e corpo difere 9% da folha de modelo; altura varia 5.5% entre quadros (295 303 299 289 299 306), esperado nesta ação |
| `personagem/andar-costas` | `andar-costas.png` (2172x724) | `--quadros 8 --altura 294 --qps 10 --base 0.5 --tamanho-cor 48.7 --altura-livre` | 6.3% | altura varia 6.3% entre quadros (300 282 294 290 298 281 297 291), esperado nesta ação |
| `personagem/andar-frente` | `andar-frente.png` (2172x724) | `--quadros 8 --altura 294 --qps 10 --base 0.5 --tamanho-cor 47.5 --altura-livre` | 7.2% | altura varia 7.2% entre quadros (291 274 287 278 287 277 287 271), esperado nesta ação |
| `personagem/carregar-costas` | `carregar-costas.png` (2172x724) | `--altura 294 --quadros 8 --qps 10 --base 0.5 --tamanho-cor 48.7 --altura-livre` | 6% | altura varia 6.0% entre quadros (297 281 292 290 296 280 289 290), esperado nesta ação |
| `personagem/carregar-frente` | `carregar-frente.png` (2172x724) | `--altura 294 --quadros 8 --qps 10 --base 0.5 --tamanho-cor 47.5 --altura-livre` | 4.6% | altura varia 4.6% entre quadros (294 286 296 295 297 284 295 292), esperado nesta ação |
| `personagem/colher-costas` | `colher-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 28.6% | altura varia 28.6% entre quadros (282 244 215 253 300 298), esperado nesta ação |
| `personagem/colher-frente` | `colher-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 31.9% | a proporção entre cabeça e corpo difere 8% da folha de modelo; altura varia 31.9% entre quadros (284 237 207 255 305 303), esperado nesta ação; tamanho pela cor de referência varia 16% entre quadros (47 48 48 41 45 46): confira se a figura muda de tamanho |
| `personagem/colher-fruta-costas` | `colher-fruta-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 6.3% | a proporção entre cabeça e corpo difere 9% da folha de modelo; altura varia 6.3% entre quadros (304 299 320 310 303 308), esperado nesta ação |
| `personagem/colher-fruta-frente` | `colher-fruta-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 5.6% | altura varia 5.6% entre quadros (297 297 312 313 295 297), esperado nesta ação |
| `personagem/correr-costas` | `correr-costas.png` (2172x724) | `--altura 294 --quadros 8 --qps 12 --base linha --tamanho-cor 48.7 --peso-cor 1 --altura-livre` | 16.3% | altura varia 16.3% entre quadros (275 258 273 230 267 256 273 232), esperado nesta ação |
| `personagem/correr-frente` | `correr-frente.png` (2172x724) | `--altura 294 --quadros 8 --qps 12 --base linha --tamanho-cor 47.5 --peso-cor 1 --altura-livre` | 12.6% | a proporção entre cabeça e corpo difere 15% da folha de modelo; altura varia 12.6% entre quadros (250 238 244 218 246 236 243 220), esperado nesta ação |
| `personagem/enxadar-costas` | `enxadar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 32.9% | altura varia 32.9% entre quadros (300 298 370 278 248 290), esperado nesta ação |
| `personagem/enxadar-frente` | `enxadar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 31.3% | alinhamento incerto pelo molde nos quadros 3, 5 (custos 0 131 173 139 152 101): olhe a sobreposição na tira; altura varia 31.3% entre quadros (301 300 374 282 257 291), esperado nesta ação |
| `personagem/machado-costas` | `machado-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 10.5% | altura varia 10.5% entre quadros (299 299 303 293 271 293), esperado nesta ação |
| `personagem/machado-frente` | `machado-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 12.8% | altura varia 12.8% entre quadros (303 303 303 293 265 294), esperado nesta ação; tamanho pela cor de referência varia 17% entre quadros (46 46 41 47 48 47): confira se a figura muda de tamanho |
| `personagem/manivela-costas` | `manivela-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 7.3% | altura varia 7.3% entre quadros (305 305 301 283 297 305), esperado nesta ação |
| `personagem/manivela-frente` | `manivela-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 12.9% | a proporção entre cabeça e corpo difere 8% da folha de modelo; altura varia 12.9% entre quadros (306 296 283 267 293 306), esperado nesta ação |
| `personagem/martelar-costas` | `martelar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 10% | altura varia 10.0% entre quadros (288 294 295 281 265 279), esperado nesta ação |
| `personagem/martelar-frente` | `martelar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 13.6% | altura varia 13.6% entre quadros (292 299 310 288 268 290), esperado nesta ação |
| `personagem/ordenhar-costas` | `ordenhar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 2.7% |  |
| `personagem/ordenhar-frente` | `ordenhar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8 --ajuste 0.955` | 1.6% | a proporção entre cabeça e corpo difere 9% da folha de modelo |
| `personagem/parada-costas` | `parada-costas.png` (2172x724) | `--quadros 3 --altura 294 --qps 6 --alinhar molde --em-pe-quadro 1 --sequencia 1,1,2,3,3,3,2,1,1,1,1,1` | 0.8% |  |
| `personagem/parada-frente` | `parada-frente.png` (2172x724) | `--quadros 4 --altura 294 --qps 6 --alinhar molde --em-pe-quadro 1 --tamanho-cor 47.5 --sequencia 1,1,2,3,3,3,2,1,1,4,1,1` | 0% |  |
| `personagem/picareta-costas` | `picareta-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 25.5% | altura varia 25.5% entre quadros (294 299 348 287 259 285), esperado nesta ação |
| `personagem/picareta-frente` | `picareta-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 19.4% | altura varia 19.4% entre quadros (289 292 313 270 253 288), esperado nesta ação |
| `personagem/regar-costas` | `regar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 6.8% | altura varia 6.8% entre quadros (294 294 291 274 276 292), esperado nesta ação |
| `personagem/regar-frente` | `regar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 11.1% | altura varia 11.1% entre quadros (303 301 293 270 277 303), esperado nesta ação |
| `personagem/semear-costas` | `semear-costas.png` (2171x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8` | 21.5% | altura varia 21.5% entre quadros (297 301 271 243 236 293), esperado nesta ação |
| `personagem/semear-frente` | `semear-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 24.6% | altura varia 24.6% entre quadros (301 302 266 236 228 282), esperado nesta ação |
| `personagem/tosquiar-costas` | `tosquiar-costas.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 48.7 --altura-livre --qps 8 --ajuste 0.96` | 9% | a proporção entre cabeça e corpo difere 12% da folha de modelo; altura varia 9.0% entre quadros (269 264 256 245 261 264), esperado nesta ação |
| `personagem/tosquiar-frente` | `tosquiar-frente.png` (2172x724) | `--altura 294 --quadros 7 --ref --alinhar molde --tamanho-cor 47.5 --altura-livre --qps 8` | 9% | altura varia 9.0% entre quadros (265 262 255 242 265 266), esperado nesta ação |

## Decisões e observações

- Altura da personagem em pé: 294 pontos (2,3 unidades de tela a 128 por unidade).
- No andar, o chão de cada quadro é a média entre o ponto mais baixo do quadro e o da folha inteira (`--base 0.5`): guarda o sobe e desce que o Codex desenhou sem deixar os pés longe do chão.
- O tamanho da figura entre folhas é conferido pela área do lenço vermelho (coluna tamanho pela cor de `medidas-animacoes.json`): na folha de modelo, com 294 pontos de altura, dá 47,5 de frente e 48,7 de costas. Com `--tamanho-cor`, a escala é a média entre a da altura e a do lenço, para nem a altura nem a cabeça destoarem de uma folha para a outra. Quando a vista muda (mais de costas, cabeça baixa), o lenço engana e vale só a altura.
- Bichos: a galinha tem 129 pontos de altura (0,88 unidade de `escala.json`, na mesma proporção que dá 294 pontos à personagem de 2,0 unidades). A vaca tem 226 pontos até o lombo (1,54 unidade); como de frente três quartos a figura inteira (chifres até o casco mais baixo) mede 1,21 vez isso, a figura de frente tem 273 pontos e a de costas 297.
- Ponto de apoio dos bichos: o meio das patas. Na vaca fica 9% da altura acima do casco mais baixo (as quatro patas se espalham na tela por causa da câmera); na galinha, 5%.

## Resumo

42 prontas, 2 pendentes (no catálogo, com defeito anotado) e 38 em falta, de 82 folhas da lista.

As tiras de conferência (`arte/jogo/folhas/<nome>.png`: os quadros lado a lado, a linha do chão, o ponto de apoio e todos os quadros sobrepostos) e as animações (`.gif`) têm o nome da chave com hífens, por exemplo `personagem-andar-frente.png`.
