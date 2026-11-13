Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno escuro e cores chapadas:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o ESTILO);
- `referencias/icones-vizinhos.png`: ícones que o jogo JÁ usa (martelo, lote de terra, celeiro, casinha com porteira, carroça, setas com casinha, regador, sacola). Os novos vão ficar ao lado deles: mesmo traço, mesma grossura de contorno, mesmo tamanho, mesmo jeito de mostrar uma construção pequenininha vista de cima e de lado;
- `referencias/pecas-novas.png`: as quatro construções REFORMADAS do jogo, da esquerda para a direita: o POÇO novo (mureta de pedra, telhadinho de telhas, manivela, balde de lata e água azul), a BANCA de feira (toldo listrado de vermelho e branco, balcão de madeira, caixotes de milho, tomate e alface), a CASA nova (paredes brancas, rodapé azul, telhado de telhas laranja, chaminé, porta azul, janelas com jardineira) e um trecho de CERCA de madeira nova.

Preciso de QUATRO ÍCONES de REFORMA, para o botão de reformar cada coisa. Cada ícone mostra a construção NOVA, pequenininha e inteira, e, no CANTO DE BAIXO À DIREITA, por cima dela, um MARTELO pequeno (o mesmo martelo de `icones-vizinhos.png`: cabeça de ferro cinza, cabo de madeira), inclinado, com uns dois quintos do tamanho do ícone.

Gere UMA imagem quadrada e salve na pasta atual como `icones-reforma.png`. Nela, os QUATRO ícones numa grade de 2 colunas por 2 linhas:

Linha 1, da esquerda para a direita:
1. REFORMAR O POÇO: o poço novo de `pecas-novas.png`, com o martelo no canto.
2. REFORMAR A BANCA: a banca de feira de `pecas-novas.png`, com o martelo no canto.

Linha 2:
3. REFORMAR A CASA: a casa nova de `pecas-novas.png`, com o martelo no canto.
4. REFORMAR A CERCA: um trecho curto de cerca de madeira nova de `pecas-novas.png` (três mourões e duas travessas), com o martelo no canto.

Regras:
- Cada ícone é UM desenho só, grande, simples e gordinho, visto de frente e um pouco de cima, que se reconhece mesmo bem pequeno (32 pixels): formas claras, poucas minúcias. O martelo não tapa a construção: fica no canto, por cima da beirada dela.
- Exatamente o mesmo estilo da cena e dos ícones vizinhos: o mesmo traço escuro grosso em volta de tudo, as mesmas cores chapadas com poucos tons, um brilho simples, luz vindo de cima e da esquerda.
- Todos os ícones do mesmo tamanho, cada um centrado na sua parte da grade, alinhados em linhas e colunas retas, com bastante espaço transparente entre um e outro (nenhum encosta no vizinho).
- Fundo transparente de verdade (canal alfa). Sem quadrado, círculo ou moldura atrás do ícone, sem sombra no chão, sem chão de grama, sem texto, sem letras, sem números, sem linhas de grade.
- Tudo inteiro dentro da imagem, com folga transparente em toda a volta. Imagem quadrada.
- Arte original; não imite nenhum jogo existente e não use nenhuma marca.
- Gere a imagem UMA vez só. Cor que sobra em pixels totalmente transparentes (um "halo" que só aparece para quem ignora o canal alfa) não é defeito: não refaça nem retoque por causa disso.

No fim, liste os arquivos que salvou.
