Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

A imagem anexa (`referencias/var-2-contorno.png`) é a cena de um jogo de fazenda original, em desenho com contorno escuro e cores chapadas. Ela dá o ESTILO e a CÂMERA. Preciso de peças desse jogo desenhadas de novo, SOZINHAS, para entrar no jogo como figuras 2D. Cada peça tem de parecer recortada dessa cena.

As outras imagens anexas:
- `referencias/porteira-de-arame-r1.png`: uma primeira tentativa destas duas porteiras. O DESENHO está aprovado (os mourões velhos lascados com raiz e capim, a folha de paus roliços cinza amarrados com arame, os dois fios de arame farpado, as argolas de arame), mas ela saiu CURTA DEMAIS e com a linha do chão DEITADA DEMAIS: no jogo não emenda com a cerca.
- `referencias/guia-porteira-de-arame.png`: a GUIA, feita por computador na câmera exata do jogo, no mesmo tamanho da imagem que eu quero. Ela tem as duas porteiras: os dois cilindros cinza de cada uma são os MOURÕES (posição, altura e grossura exatas) e a faixa cinza-clara entre eles é a FOLHA da porteira (o plano onde ela fica, a altura de baixo e a de cima). A linha tracejada é a linha do chão, de um pé de mourão ao outro.
- `referencias/arame-farpado.png`: a folha da cerca velha de arame farpado que já está no jogo (o mesmo mourão, o mesmo arame).

Refaça as DUAS porteiras de `porteira-de-arame-r1.png`, com o mesmo desenho, pintando por cima da guia, como quem pinta por cima dela, com o mesmo enquadramento:
- cada mourão velho fica EXATAMENTE em cima de um cilindro cinza da guia: o pé no pé do cilindro (o tufinho de capim e as raízes em volta do pé), a ponta lascada na altura do topo do cilindro, com a mesma grossura;
- a folha da porteira (o pau em pé junto de cada mourão, o pau de cima, o de baixo, o da diagonal e os dois fios de arame farpado) preenche a faixa cinza-clara de um mourão ao outro, com o pau de cima na borda de cima da faixa e o de baixo na borda de baixo; os paus de cima e de baixo correm PARALELOS à linha tracejada do chão;
- na porteira da ESQUERDA da imagem (que desce para a direita), as argolas de dobradiça ficam no mourão da esquerda e a argola de fechar no da direita; na porteira da DIREITA da imagem (que desce para a esquerda), igual: dobradiças no mourão da esquerda, argola de fechar no da direita.
O cinza da guia, o contorno da guia e o tracejado NÃO aparecem no resultado: sobram só as duas porteiras, com fundo transparente.

Gere UMA imagem do MESMO tamanho da guia (1536 x 1024) e salve na pasta atual como `porteira-de-arame.png`.

Regras:
- Mesma câmera da guia: isométrica verdadeira, sem perspectiva; os mourões em pé, na vertical; a linha do chão de cada porteira com a inclinação da linha tracejada.
- Exatamente o mesmo estilo da cena e de `porteira-de-arame-r1.png`: o mesmo traço escuro de espessura parecida, as mesmas cores chapadas com poucos tons, luz vindo de cima e da esquerda.
- Fundo transparente de verdade (canal alfa). Sem chão, sem grama além dos tufinhos no pé dos mourões, sem terra, sem sombra projetada no chão, sem cenário, sem texto, sem letras, sem números, sem moldura.
- Tudo inteiro dentro da imagem, sem cortar nada, com folga transparente em toda a volta; as duas porteiras separadas por um vão transparente.
- Arte original; não imite nenhum jogo existente.
- Gere a imagem UMA vez só. Cor que sobra em pixels totalmente transparentes (um "halo" que só aparece para quem ignora o canal alfa) não é defeito: não refaça nem retoque por causa disso.

No fim, liste os arquivos que salvou e o tamanho em pixels.
