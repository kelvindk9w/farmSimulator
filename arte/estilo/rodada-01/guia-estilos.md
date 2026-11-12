# Guia das três versões

Geradas com a ferramenta integrada `image_gen`, usando somente a captura original como referência visual. Duas tentativas por estilo, seis gerações no total. Os textos exatos de todas as tentativas estão em `prompts-geracao.json`: `prompts_finais` corresponde às imagens entregues, e `prompts_anteriores` às versões descartadas.

Os três PNGs foram ampliados com Lanczos de 1672 × 941 para 1920 × 1080, com ajuste mínimo da proporção (aproximadamente 0,07%). Não são gerações nativas em Full HD. Nenhum objeto foi acrescentado por edição posterior.

## Paletas

Cores representativas das superfícies visíveis, para orientar a reprodução. Não são valores de albedo recuperados do render nem um ranking de frequência global: iluminação e sombras alteram as cores dos pixels. As duas cores de bichos são o creme e o escuro da vaca, também úteis para a galinha branca e detalhes.

| Uso | A — brinquedo | B — fofinho | C — pintado |
|---|---|---|---|
| Grama | #78AA26 | #7DAA3A | #729231 |
| Terra do caminho | #F0A658 | #F1AA68 | #ECA259 |
| Terra arada | #AC5E30 | #B8744E | #AD683A |
| Madeira clara | #CE8F3F | #CC8841 | #C58B45 |
| Madeira escura | #6A3514 | #915932 | #8C5124 |
| Telha | #EC6435 | #EB7040 | #EB7840 |
| Pedra | #7C6B50 | #8D8375 | #827863 |
| Pele | #C16B30 | #D58452 | #C26C34 |
| Bichos — creme | #F7DCB3 | #F4E4D0 | #F4E5CE |
| Bichos — escuro | #5A4B3F | #574B43 | #4D4741 |

## A — regras

1. Formas: caixas com cantos suaves, cápsulas e copas em poucas massas arredondadas.
2. Proporções: volumes robustos, membros simples e cabeça grande; buscar três cabeças no personagem.
3. Contorno: sem linha desenhada; separar volumes por cor e sombra.
4. Materiais: cores quentes saturadas, vinil fosco ou massinha, sem microtextura.
5. Luz: sol superior esquerdo, sombra suave e brilho amplo discreto.

Limitações observadas: enquadramento ampliado para mostrar o telhado inteiro; posições e escalas não coincidem exatamente com a referência. Vaca, poço e personagem ficaram relativamente menores. O rosto ainda pode parecer jovem. A vaca recebeu coleira e sino não solicitados. Há leve variação tonal no fundo, em vez de cor perfeitamente uniforme. A copa encobre parte da lateral do celeiro, como na composição original. As marcas do caminho parecem pedrinhas adicionais.

## B — regras

1. Formas: volumes ainda mais redondos, animais rechonchudos e poucos apêndices.
2. Proporções: corpos baixos e olhos maiores; manter o adulto com cerca de três cabeças.
3. Contorno: sem linha externa; usar contraste suave entre superfícies.
4. Materiais: superfícies foscas lisas e cores claras, sem textura miúda.
5. Luz: sol superior esquerdo e sombras suaves, sem reflexos fortes.

Limitações observadas: câmera mantém aspecto isométrico, mas enquadramento, posições e escalas não são idênticos aos da captura. O personagem continua com aparência jovem apesar da segunda tentativa. A paleta ficou mais clara, porém verdes e telhas ainda têm saturação acima de um pastel estrito. O caminho ganhou marcas semelhantes a pedras. Fundo com leve variação tonal. A copa ainda cobre parte da lateral do celeiro.

## C — regras

1. Formas: prismas simples, telhas largas e copas em grandes massas.
2. Proporções: silhuetas de desenho animado com anatomia simplificada.
3. Contorno: linha fina escura, suavizada e colorida conforme o objeto.
4. Materiais: pinceladas largas em textura difusa, sem modelar cada marca.
5. Luz: sol superior esquerdo, sombra simples e sem efeitos de câmera.

Limitações observadas: o acabamento ainda lembra uma ilustração mais do que uma captura 3D. Enquadramento, tamanho relativo e posições diferem da referência; o personagem e a vaca ficaram menores. O contorno é mais marcado do que o solicitado em alguns objetos. Fundo com leve variação tonal; copa cobre parte do celeiro. O caminho ganhou marcas adicionais. A idade adulta do personagem não fica inequívoca.

## Conferência

Nas três imagens foram identificados: celeiro de madeira com porta dupla verde e telhado de barro, laranjeira com laranjas, cerca com uma vaca malhada, poço de pedra com telhado e manivela, dois canteiros vazios, terreiro com ninho e duas galinhas nas cores pedidas, caminhos, grama e personagem com coque, lenço vermelho, camiseta amarela, jardineira azul e botas marrons. Não foi identificado texto, interface, número, logotipo ou marca-d'água.

As formas sugerem construção com malhas simples e texturas básicas. Isso é uma avaliação visual: as imagens não fornecem malhas, contagem de polígonos ou prova de desempenho em celular e TV. A preservação exata da câmera e do arranjo não foi alcançada, mesmo após as revisões; estes arquivos servem como propostas de direção visual.

## Arquivos finais

- `estilo-a.png`: 1920 × 1080 px, PNG, 2 tentativas.
- `estilo-b.png`: 1920 × 1080 px, PNG, 2 tentativas.
- `estilo-c.png`: 1920 × 1080 px, PNG, 2 tentativas.
