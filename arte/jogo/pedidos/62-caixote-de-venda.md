Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

A imagem anexa (`referencias/var-2-contorno.png`) é a cena de um jogo de fazenda original, em desenho com contorno escuro e cores chapadas. Ela dá o ESTILO e a CÂMERA. Preciso de peças desse jogo desenhadas de novo, SOZINHAS, para entrar no jogo como figuras 2D. Cada peça tem de parecer recortada dessa cena.

A segunda imagem anexa (`referencias/guia-caixote.png`) tem dois BLOCOS-GUIA cinza, feitos por computador na câmera exata do jogo, lado a lado. Cada bloco dá o tamanho, a posição e os ângulos EXATOS de um caixote; o losango tracejado em volta é a casa do chão que ele ocupa. Desenhe cada caixote exatamente em cima do seu bloco, como quem pinta por cima dele, com o mesmo enquadramento da guia:
- os três cantos de baixo do caixote ficam nos mesmos pontos da imagem que os três cantos de baixo do bloco;
- as arestas de baixo têm a mesma inclinação das da guia (30°), e as arestas verticais ficam no mesmo lugar;
- a borda de cima do caixote fica na altura da face de cima do bloco.
O cinza da guia e o tracejado NÃO aparecem no resultado: sobram só os caixotes, com fundo transparente.

A terceira imagem anexa (`referencias/caixote.png`) é o caixote de madeira que já está no jogo (o desenho e a madeira estão bons, mas a câmera dele ficou de cima demais: o certo é a câmera da guia). A quarta (`referencias/comeco-antes-e-depois.png`) e a quinta (`referencias/comeco-fazenda.png`) são as imagens já aprovadas do começo do jogo: o caixote que eu quero é o CAIXOTE DE VENDA da beira da estrada (na quarta imagem, o caixote da fileira de baixo antes da seta; na quinta, o caixote perto da estrada).

Gere uma imagem e salve na pasta atual como `caixote-de-venda.png`, com os DOIS caixotes, cada um em cima do seu bloco:

1. Bloco da ESQUERDA: o CAIXOTE DE VENDA VAZIO. Caixote de feira de madeira marrom-alaranjada, aberto em cima, feito de ripas horizontais (duas ripas em cada lado, com uma fresta entre elas) presas em quatro cantoneiras quadradas, com pregos à mostra. Por dentro aparece o fundo de ripas, vazio.
2. Bloco da DIREITA: o MESMO caixote, igual em tudo (mesmo tamanho, mesmas ripas, na mesma posição), mas CHEIO DE COLHEITA, como os caixotes da banca na quarta imagem: espigas de milho amarelas com a palha verde, pés de alface verde-claros e tomates vermelhos, num monte que passa um pouco da borda.

Regras:
- Mesma câmera da cena: isométrica verdadeira (girada 45°, olhando de cima a cerca de 35°), sem perspectiva: as arestas do chão sobem a 30° para a esquerda e para a direita, e linhas paralelas continuam paralelas.
- Exatamente o mesmo estilo da cena: o mesmo traço escuro de espessura parecida, as mesmas cores chapadas com poucos tons, luz vindo de cima e da esquerda.
- Fundo transparente de verdade (canal alfa). Sem chão, sem grama, sem terra, sem sombra projetada no chão, sem cenário, sem texto, sem letras, sem números, sem preço, sem placa, sem moldura.
- Tudo inteiro dentro da imagem, sem cortar nada, com folga transparente em toda a volta; os dois caixotes separados por um vão transparente.
- Arte original; não imite nenhum jogo existente.
- Gere a imagem UMA vez só. Cor que sobra em pixels totalmente transparentes (um "halo" que só aparece para quem ignora o canal alfa) não é defeito: não refaça nem retoque por causa disso.

No fim, liste os arquivos que salvou.
