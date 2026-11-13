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
| boi | `arte/jogo/modelos/boi.png` | `modelo-boi.md` | Boi de trabalho caramelo com coalheira, tirantes de corrente e o arado de madeira atrás: frente, costas e perfil. O arado faz parte da figura. Uma rodada. |
| cavalo | `arte/jogo/modelos/cavalo.png` | `modelo-cavalo.md` | Cavalo castanho com sela de couro sobre manta vermelha, estribos, cabeçada e rédeas; ninguém montado: frente, costas e perfil. Uma rodada. |
| montaria | `arte/jogo/modelos/montaria.png` | `modelo-montaria.md` | Folha de modelo da INTERAÇÃO: a personagem montada no cavalo selado (pés nos estribos, mãos nas rédeas), de frente, de costas e de perfil. Anexada aos pedidos da personagem montada. A folha veio com um véu de sujeira quase transparente no fundo, que foi limpo antes de guardar. Uma rodada. |

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
| `animal/ovelha/parada-frente` | Pronta | 8 (4 desenhos) | 224x216 | 112,187 | 4 | 1 | `ovelha-parada-frente.md` | Mastiga, respira, vira a cabeça e pisca; patas plantadas. Figura com 190 pontos de altura (fora da tabela de escala: lombo na cintura da personagem). Tamanho pela massa 143. |
| `animal/ovelha/parada-costas` | Pronta | 8 (4 desenhos) | 208x224 | 104,194 | 4 | 1 | `ovelha-parada-costas.md` | Par da de frente (204 pontos de altura; tamanho pela massa 137). |
| `animal/ovelha/andar-frente` | Pronta | 6 | 208x224 | 104,195 | 9 | 1 | `ovelha-andar-frente.md` | Trotezinho de seis quadros, o corpo sobe e desce, a cabeça balança. |
| `animal/ovelha/andar-costas` | Pronta | 6 | 216x232 | 108,202 | 9 | 1 | `ovelha-andar-costas.md` | Par da de frente. |
| `animal/ovelha-tosquiada/parada-frente` | Pronta | 8 (4 desenhos) | 216x208 | 108,180 | 4 | 1 | `ovelha-tosquiada-parada-frente.md` | A mesma ovelha sem a lã, com a cabeça do mesmo tamanho da lanuda (181 pontos de altura; tamanho pela massa 132). Mesmo movimento da folha com lã, que foi anexada ao pedido. |
| `animal/ovelha-tosquiada/parada-costas` | Pronta | 8 (4 desenhos) | 176x216 | 88,187 | 4 | 1 | `ovelha-tosquiada-parada-costas.md` | Par da de frente (194 pontos de altura; tamanho pela massa 119). |
| `animal/ovelha-tosquiada/andar-frente` | Pronta | 6 | 192x216 | 96,188 | 9 | 1 | `ovelha-tosquiada-andar-frente.md` | Mesmo trotezinho da lanuda. A cabeça veio um pouco maior que na folha parada: tamanho pela massa 126 em vez de 132 iguala a cabeça. |
| `animal/ovelha-tosquiada/andar-costas` | Pronta | 6 | 208x224 | 104,195 | 9 | 1 | `ovelha-tosquiada-andar-costas.md` | Par da de frente; saiu mais saltitante (as patas encolhem nos quadros 3 e 6). Tamanho pela massa 116. |
| `animal/boi/parado-frente` | Pronta | 8 (4 desenhos) | 472x320 | 236,282 | 4 | 1 | `boi-parado-frente.md` | Boi com o arado atrás (um desenho só): rumina, respira, pisca, abana o rabo; o arado não se mexe. 290 pontos de altura, um pouco maior que a vaca; apoio levado para baixo do corpo do boi (--apoio-dx -55). Tamanho pela massa 227. |
| `animal/boi/parado-costas` | Pronta | 8 (4 desenhos) | 432x392 | 216,312 | 4 | 1 | `boi-parado-costas.md` | Par da de frente. De costas o arado fica em primeiro plano, abaixo dos cascos: a figura inteira tem 358 pontos e o apoio fica no chão sob o corpo do boi (--chao 0.19 --apoio-dx 50), não na ponta do arado. Tamanho pela massa 226. |
| `animal/boi/puxar-frente` | Pronta | 8 | 488x296 | 244,258 | 8 | 1 | `boi-puxar-frente.md` | Passo de quatro tempos com a cabeça baixa, fazendo força; o arado vem atrás, ligado pelos tirantes. Folha pedida em duas fileiras de 4 (3 por 2) para o desenho sair maior; ampliada 1,07 vez. |
| `animal/boi/puxar-costas` | Pronta | 8 | 448x376 | 224,296 | 8 | 1 | `boi-puxar-costas.md` | Par da de frente, em duas fileiras de 4; ampliada 1,09 vez. Apoio sob o corpo do boi (--chao 0.19 --apoio-dx 30). |
| `animal/cavalo/parado-frente` | Pronta | 8 (4 desenhos) | 344x368 | 172,326 | 4 | 1 | `cavalo-parado-frente.md` | Cavalo selado, sem ninguém: mexe as orelhas, sacode a crina, pisca, balança o rabo. 335 pontos de altura (lombo um pouco acima do da vaca; fora da tabela de escala). Tamanho pela massa 229. |
| `animal/cavalo/parado-costas` | Pronta | 8 (4 desenhos) | 288x376 | 144,332 | 4 | 1 | `cavalo-parado-costas.md` | Par da de frente (354 pontos de altura; tamanho pela massa 210). |
| `animal/cavalo/andar-frente` | Pronta | 8 | 352x352 | 176,310 | 8 | 1 | `cavalo-andar-frente.md` | Passo de quatro tempos, uma pata por vez; a cabeça balança. Em duas fileiras de 4. No quadro 8 ele pisca. |
| `animal/cavalo/andar-costas` | Pronta | 8 | 288x376 | 144,332 | 8 | 1 | `cavalo-andar-costas.md` | Par da de frente. |
| `animal/cavalo/galope-frente` | Pronta | 8 | 472x352 | 236,310 | 12 | 1 | `cavalo-galope-frente.md` | Galope de oito tempos: recolhe no ar, pousa atrás, estica, pousa na frente, impulso e voo esticado; crina e rabo voando. Em duas fileiras de 4. |
| `animal/cavalo/galope-costas` | Pronta | 8 | 392x344 | 196,300 | 12 | 1 | `cavalo-galope-costas.md` | Par da de frente; nos quadros 5 a 7 o corpo esticado fica quase de lado. |
| `personagem/montada-andar-frente` | Pronta | 8 | 392x504 | 196,462 | 8 | 1 | `personagem-montada-andar-frente.md` | Cavalo e personagem num desenho só (o jogo troca as duas figuras por esta): o cavalo faz o mesmo passo da folha dele, ela acompanha na sela com as rédeas na mão. Em duas fileiras de 4. A personagem veio um pouco pequena para o cavalo: --ajuste 1.06 reparte a diferença (cavalo 6% maior que o solto, cabeça dela uns 10% menor que a pé). Tamanho pela massa 291. |
| `personagem/montada-andar-costas` | Pronta | 8 | 352x480 | 176,439 | 8 | 1 | `personagem-montada-andar-costas.md` | Par da de frente. Figura inteira com 458 pontos: o cavalo fica uns 5% maior que o solto e a cabeça dela do tamanho da de a pé. Tamanho pela massa 263. O pedido foi com seis referências e a ferramenta do Codex só aceita cinco (ele mesmo descartou uma). |
| `personagem/montada-galope-frente` | Pronta | 8 | 520x488 | 260,446 | 12 | 1 | `personagem-montada-galope-frente.md` | Cavalo e personagem num desenho só, no galope da folha do cavalo; ela vai inclinada para a frente, o lenço voando. Em duas fileiras de 4; ampliada 1,09 vez. Mesma escala da montada andando (tamanho pela massa 291). |
| `personagem/montada-galope-costas` | Pronta | 8 | 456x456 | 228,415 | 12 | 1 | `personagem-montada-galope-costas.md` | Par da de frente, na escala da montada andando de costas (tamanho pela massa 263). Pedido com cinco referências (sem a folha de modelo do cavalo, que a da montaria já mostra). |
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
| `animal/boi/parado-costas` | `parado-costas.png` (2172x724) | `--altura 358 --quadros 4 --qps 4 --alinhar molde --molde 0.4-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.19 --sequencia 1,2,2,3,3,1,4,1 --altura-livre --apoio-dx 50` | 3.3% | altura varia 3.3% entre quadros (358 358 366 354), esperado nesta ação |
| `animal/boi/parado-frente` | `parado-frente.png` (2172x724) | `--altura 290 --quadros 4 --qps 4 --alinhar molde --molde 0.4-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1 --altura-livre --apoio-dx -55` | 3.1% | altura varia 3.1% entre quadros (290 290 297 288), esperado nesta ação |
| `animal/boi/puxar-costas` | `puxar-costas.png` (1536x1024) | `--altura 358 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.19 --tamanho-massa 226 --altura-livre --apoio-dx 30` | 1.8% | a folha crua é menor que a saída (figura em pé com 327 pontos para 358): a figura foi ampliada 1.09 vezes |
| `animal/boi/puxar-frente` | `puxar-frente.png` (1536x1024) | `--altura 290 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.09 --tamanho-massa 227 --altura-livre --apoio-dx -20` | 5.4% | a folha crua é menor que a saída (figura em pé com 257 pontos para 290): a figura foi ampliada 1.07 vezes; altura varia 5.4% entre quadros (276 273 272 268 276 269 261 264), esperado nesta ação |
| `animal/cavalo/andar-costas` | `andar-costas.png` (1536x1024) | `--altura 354 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.09 --tamanho-massa 210 --altura-livre` | 2.9% |  |
| `animal/cavalo/andar-frente` | `andar-frente.png` (1536x1024) | `--altura 335 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.09 --tamanho-massa 229 --altura-livre` | 5.2% | altura varia 5.2% entre quadros (327 326 326 314 326 328 331 319), esperado nesta ação |
| `animal/cavalo/galope-costas` | `galope-costas.png` (1536x1024) | `--altura 354 --quadros 8 --qps 12 --eixo massa --base linha --chao 0.09 --tamanho-massa 210 --altura-livre` | 15.3% | altura varia 15.3% entre quadros (267 315 308 304 289 285 272 268), esperado nesta ação |
| `animal/cavalo/galope-frente` | `galope-frente.png` (1536x1024) | `--altura 335 --quadros 8 --qps 12 --eixo massa --base linha --chao 0.09 --tamanho-massa 229 --altura-livre` | 14.7% | altura varia 14.7% entre quadros (257 293 280 300 298 296 264 256), esperado nesta ação |
| `animal/cavalo/parado-costas` | `parado-costas.png` (2172x724) | `--altura 354 --quadros 4 --qps 4 --alinhar molde --molde 0.5-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1 --altura-livre` | 1.9% |  |
| `animal/cavalo/parado-frente` | `parado-frente.png` (2172x724) | `--altura 335 --quadros 4 --qps 4 --alinhar molde --molde 0.5-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1 --altura-livre` | 4.2% | altura varia 4.2% entre quadros (335 333 344 330), esperado nesta ação |
| `animal/galinha/andar-costas` | `andar-costas.png` (2172x724) | `--altura 129 --quadros 6 --qps 9 --eixo massa --base 0.5 --chao 0.05 --cor-ref 236,40,40 --altura-livre` | 10% | altura varia 10.0% entre quadros (128 118 129 127 116 129), esperado nesta ação |
| `animal/galinha/andar-frente` | `andar-frente.png` (2172x724) | `--altura 129 --quadros 6 --qps 9 --eixo massa --base 0.5 --chao 0.05 --cor-ref 236,40,40 --altura-livre` | 13.1% | altura varia 13.1% entre quadros (128 113 127 129 112 129), esperado nesta ação |
| `animal/galinha/ciscar-costas` | `ciscar-costas.png` (2172x724) | `--altura 129 --quadros 6 --qps 7 --alinhar molde --molde 0.78-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --tamanho-massa 85 --altura-livre` | 12.8% | altura varia 12.8% entre quadros (127 112 123 116 121 129), esperado nesta ação |
| `animal/galinha/ciscar-frente` | `ciscar-frente.png` (2172x724) | `--altura 129 --quadros 6 --qps 7 --alinhar molde --molde 0.78-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --tamanho-massa 84 --altura-livre` | 17.5% | altura varia 17.5% entre quadros (128 106 114 115 120 129), esperado nesta ação |
| `animal/galinha/parada-costas` | `parada-costas.png` (2172x724) | `--altura 129 --quadros 4 --qps 4 --alinhar molde --molde 0-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --cor-ref 236,40,40 --altura-livre --sequencia 1,2,2,1,3,3,1,4` | 10.1% | altura varia 10.1% entre quadros (129 138 131 124), esperado nesta ação |
| `animal/galinha/parada-frente` | `parada-frente.png` (2172x724) | `--altura 129 --quadros 4 --qps 4 --alinhar molde --molde 0-1 --em-pe-quadro 1 --faixa-pes 0.12 --chao 0.05 --cor-ref 236,40,40 --altura-livre --sequencia 1,2,2,1,3,3,1,4` | 12.3% | altura varia 12.3% entre quadros (129 138 129 121), esperado nesta ação; tamanho pela cor de referência varia 13% entre quadros (24 21 21 24): confira se a figura muda de tamanho |
| `animal/ovelha-tosquiada/andar-costas` | `andar-costas.png` (2172x724) | `--altura 194 --quadros 6 --qps 9 --eixo massa --base linha --chao 0.09 --tamanho-massa 116 --altura-livre` | 11.5% | altura varia 11.5% entre quadros (198 187 180 197 181 176), esperado nesta ação |
| `animal/ovelha-tosquiada/andar-frente` | `andar-frente.png` (2172x724) | `--altura 181 --quadros 6 --qps 9 --eixo massa --base linha --chao 0.09 --tamanho-massa 126 --altura-livre` | 9.5% | altura varia 9.5% entre quadros (176 163 171 180 169 168), esperado nesta ação |
| `animal/ovelha-tosquiada/parada-costas` | `parada-costas.png` (2172x724) | `--altura 194 --quadros 4 --qps 4 --alinhar molde --molde 0.55-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1 --altura-livre` | 1.6% |  |
| `animal/ovelha-tosquiada/parada-frente` | `parada-frente.png` (2172x724) | `--altura 181 --quadros 4 --qps 4 --alinhar molde --molde 0.55-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1 --altura-livre` | 3.2% | altura varia 3.2% entre quadros (181 179 185 179), esperado nesta ação |
| `animal/ovelha/andar-costas` | `andar-costas.png` (2172x724) | `--altura 204 --quadros 6 --qps 9 --eixo massa --base linha --chao 0.09 --tamanho-massa 137 --altura-livre` | 7.6% | altura varia 7.6% entre quadros (209 197 204 208 195 193), esperado nesta ação |
| `animal/ovelha/andar-frente` | `andar-frente.png` (2172x724) | `--altura 190 --quadros 6 --qps 9 --eixo massa --base linha --chao 0.09 --tamanho-massa 143 --altura-livre` | 8.5% | altura varia 8.5% entre quadros (191 177 184 193 183 181), esperado nesta ação |
| `animal/ovelha/parada-costas` | `parada-costas.png` (2172x724) | `--altura 204 --quadros 4 --qps 4 --alinhar molde --molde 0.55-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1` | 0.7% |  |
| `animal/ovelha/parada-frente` | `parada-frente.png` (2172x724) | `--altura 190 --quadros 4 --qps 4 --alinhar molde --molde 0.55-1 --em-pe-quadro 1 --faixa-pes 0.25 --chao 0.09 --sequencia 1,2,2,3,3,1,4,1` | 2.4% |  |
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
| `personagem/montada-andar-costas` | `montada-andar-costas.png` (1536x1024) | `--altura 458 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.064 --altura-livre` | 2.7% | a folha crua é menor que a saída (figura em pé com 441 pontos para 458): a figura foi ampliada 1.04 vezes |
| `personagem/montada-andar-frente` | `montada-andar-frente.png` (1536x1024) | `--altura 452 --quadros 8 --qps 8 --eixo massa --base linha --chao 0.066 --altura-livre --ajuste 1.06` | 1.9% | a folha crua é menor que a saída (figura em pé com 432 pontos para 452): a figura foi ampliada 1.11 vezes |
| `personagem/montada-galope-costas` | `montada-galope-costas.png` (1536x1024) | `--altura 458 --quadros 8 --qps 12 --eixo massa --base linha --chao 0.064 --tamanho-massa 263 --altura-livre` | 19.6% | a folha crua é menor que a saída (figura em pé com 408 pontos para 458): a figura foi ampliada 1.04 vezes; altura varia 19.6% entre quadros (373 426 415 409 375 374 343 354), esperado nesta ação; tamanho pela cor de referência varia 16% entre quadros (118 129 134 139 127 126 125 122): confira se a figura muda de tamanho |
| `personagem/montada-galope-frente` | `montada-galope-frente.png` (1536x1024) | `--altura 479 --quadros 8 --qps 12 --eixo massa --base linha --chao 0.062 --tamanho-massa 291 --altura-livre` | 14% | a folha crua é menor que a saída (figura em pé com 408 pontos para 479): a figura foi ampliada 1.09 vezes; altura varia 14.0% entre quadros (389 444 427 431 443 436 396 382), esperado nesta ação; tamanho pela cor de referência varia 14% entre quadros (127 135 141 139 133 131 132 122): confira se a figura muda de tamanho |
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

64 prontas, 2 pendentes (no catálogo, com defeito anotado) e 16 em falta, de 82 folhas da lista.

As tiras de conferência (`arte/jogo/folhas/<nome>.png`: os quadros lado a lado, a linha do chão, o ponto de apoio e todos os quadros sobrepostos) e as animações (`.gif`) têm o nome da chave com hífens, por exemplo `personagem-andar-frente.png`.
