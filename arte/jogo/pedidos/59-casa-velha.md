Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

A imagem anexa (`referencias/var-2-contorno.png`) é a cena de um jogo de fazenda original, em desenho com contorno escuro e cores chapadas. Ela dá o ESTILO e a CÂMERA. Preciso de peças desse jogo desenhadas de novo, SOZINHAS, para entrar no jogo como figuras 2D. Cada peça tem de parecer recortada dessa cena.

A segunda imagem anexa (`referencias/guia-casa.png`) é um BLOCO-GUIA cinza, feito por computador na câmera exata do jogo. Ele dá o tamanho, a posição e os ângulos EXATOS da construção. Desenhe a construção exatamente em cima do bloco, como quem pinta por cima dele, com o mesmo enquadramento da guia:
- os três cantos de baixo das paredes ficam nos mesmos pontos da imagem que os três cantos de baixo do bloco;
- as arestas de baixo das duas paredes têm a mesma inclinação das da guia (30°), e as arestas verticais ficam no mesmo lugar;
- a cumeeira e os beirais do telhado seguem as linhas do telhado da guia.
O cinza da guia NÃO aparece no resultado: sobra só a construção, com fundo transparente.

A terceira imagem anexa (`referencias/casa.png`) é a casa que JÁ ESTÁ no jogo: a casa REFORMADA, o "depois". A quarta (`referencias/comeco-antes-e-depois.png`) e a quinta (`referencias/comeco-fazenda.png`) são as imagens já aprovadas do começo do jogo. A casa que eu quero agora é a CASA VELHA: a da esquerda, em cima, na quarta imagem (antes da seta), que é a mesma casa do meio da quinta imagem.

Gere uma imagem quadrada e salve na pasta atual como `casa-velha.png`:

A MESMA CASINHA de `casa.png` (mesma forma, mesmo tamanho, mesmo telhado de duas águas, mesma chaminé no mesmo lugar, a porta e as janelas nos mesmos lugares), redesenhada exatamente em cima do bloco-guia, mas VELHA E MAL CUIDADA, como a casa velha das imagens aprovadas:
- telhado de telhas de barro laranja, um pouco mais apagadas, algumas tortas; um BURACO escuro no telhado e, perto dele, um REMENDO de tábuas de madeira pregadas por cima de outro buraco;
- paredes de cal branca DESCASCADA: manchas onde a cal caiu e aparece o tijolo laranja por baixo, algumas rachaduras finas; o rodapé azul gasto e falhado;
- porta de madeira AZUL DESBOTADA, com a tinta gasta, e o mesmo degrau baixo de pedra;
- as janelas de madeira com as folhas abertas, a madeira gasta;
- a chaminé de tijolo com a boca lascada;
- na jardineira da janela da parede da direita, UMA FLORZINHA vermelha só (no lugar das várias da casa nova).
Mesmas cores de base de `casa.png`, só mais gastas. A casa velha precisa poder ficar exatamente no lugar da casa nova: mesma base, mesmos cantos, mesma altura de parede e de telhado.

Regras:
- Mesma câmera da cena: isométrica verdadeira (girada 45°, olhando de cima a cerca de 35°), sem perspectiva: as arestas do chão sobem a 30° para a esquerda e para a direita, e linhas paralelas continuam paralelas.
- Exatamente o mesmo estilo da cena: o mesmo traço escuro de espessura parecida, as mesmas cores chapadas com poucos tons, luz vindo de cima e da esquerda.
- Fundo transparente de verdade (canal alfa). Sem chão, sem grama, sem mato, sem terra, sem sombra projetada no chão, sem cenário, sem baú, sem objetos em volta, sem texto, sem letras, sem números, sem moldura.
- Tudo inteiro dentro da imagem, sem cortar nada, com folga transparente em toda a volta.
- Arte original; não imite nenhum jogo existente.
- Gere a imagem UMA vez só. Cor que sobra em pixels totalmente transparentes (um "halo" que só aparece para quem ignora o canal alfa) não é defeito: não refaça nem retoque por causa disso.

No fim, liste os arquivos que salvou.
