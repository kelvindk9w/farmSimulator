Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno escuro e cores chapadas:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/casa-nova-na-guia.png`: a casa REFORMADA que já está no jogo, desenhada exatamente em cima do bloco-guia da câmera do jogo. A FORMA, o TAMANHO e a POSIÇÃO dela na imagem estão CERTOS;
- `referencias/casa-velha-r1.png`: uma primeira tentativa da casa VELHA. A PINTURA dela está aprovada (telhado com buraco e remendo de tábuas, cal descascada mostrando o tijolo, rachaduras, rodapé azul falhado, porta azul desbotada, chaminé lascada, uma florzinha só na jardineira), mas ela saiu MAIOR que a casa nova e com a parede da esquerda mais deitada que a câmera do jogo: não serve para ficar no lugar da casa nova;
- `referencias/guia-casa.png`: o bloco-guia cinza, feito por computador na câmera exata do jogo, no mesmo enquadramento de `casa-nova-na-guia.png`.

Gere uma imagem quadrada, do MESMO tamanho de `casa-nova-na-guia.png`, e salve na pasta atual como `casa-velha.png`:

Use `casa-nova-na-guia.png` como base e ENVELHEÇA a casa sem mudar o desenho de lugar: o contorno de fora, os cantos de baixo das paredes, as arestas do chão (a 30°), a altura das paredes, a cumeeira, os beirais, a chaminé, a porta, o degrau e as janelas ficam EXATAMENTE nos mesmos pontos da imagem, do mesmo tamanho. Se eu puser uma casa por cima da outra, os contornos têm de coincidir. Mude só a pintura, copiando o desgaste de `casa-velha-r1.png`:
- telhas de barro mais apagadas, algumas tortas; um BURACO escuro no telhado e, perto dele, um REMENDO de tábuas de madeira pregadas;
- cal branca DESCASCADA, com manchas de tijolo laranja aparecendo e rachaduras finas; o rodapé azul gasto e falhado;
- porta AZUL DESBOTADA, com a tinta gasta; o mesmo degrau de pedra;
- janelas com a madeira gasta;
- chaminé de tijolo com a boca lascada;
- na jardineira da janela da direita, UMA FLORZINHA vermelha só.

Regras:
- Mesma câmera e mesmo enquadramento de `casa-nova-na-guia.png` (isométrica verdadeira, sem perspectiva; as arestas do chão sobem a 30° para a esquerda e para a direita).
- Exatamente o mesmo estilo da cena: o mesmo traço escuro de espessura parecida, as mesmas cores chapadas com poucos tons, luz vindo de cima e da esquerda.
- Fundo transparente de verdade (canal alfa). Sem chão, sem grama, sem mato, sem terra, sem sombra projetada no chão, sem cenário, sem objetos em volta, sem texto, sem letras, sem números, sem moldura. O cinza da guia NÃO aparece.
- Tudo inteiro dentro da imagem, sem cortar nada, com folga transparente em toda a volta.
- Arte original; não imite nenhum jogo existente.
- Gere a imagem UMA vez só. Cor que sobra em pixels totalmente transparentes (um "halo" que só aparece para quem ignora o canal alfa) não é defeito: não refaça nem retoque por causa disso.

No fim, liste os arquivos que salvou.
