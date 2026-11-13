Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/ferramentas.png`: a FOLHA DE MODELO das ferramentas, com a personagem ao lado para dar o tamanho. A tesoura de tosquia tem de sair igual à da folha: mesma forma, mesmas cores, mesmo tamanho em relação a ela.
- `referencias/tosquia.png`: a FOLHA DE MODELO DA TOSQUIA (a personagem ajoelhada tosquiando a ovelha, vista por trás dela, pela frente dela, e a pose dela sozinha). Ela manda na pose.

Preciso da folha de animação da MESMA personagem TOSQUIANDO, ajoelhada, vista de FRENTE três quartos, para usar como figura 2D animada dentro do jogo. A OVELHA NÃO APARECE nesta folha: o jogo desenha a ovelha à parte, na frente dela.

Gere uma imagem e salve na pasta atual como `tosquiar-frente.png`:

- Uma única fileira horizontal com 7 figuras, da esquerda para a direita:
  - Figura 1 (referência de tamanho): ela PARADA EM PÉ, igual à folha de modelo, pés juntos, braços soltos, mãos vazias.
  - Figuras 2 a 7: os 6 quadros da tosquia. Em todos ela está com UM JOELHO NO CHÃO e o outro pé apoiado à frente, o tronco inclinado para a frente, a mão esquerda espalmada à frente na altura do peito (segurando a ovelha, que não aparece) e a TESOURA DE TOSQUIA na mão direita. Nesta ordem:
    1. SEGURA: a mão esquerda firme à frente; a tesoura ABERTA, encostada perto da mão esquerda. Ela olha para a tesoura.
    2. CORTA: a tesoura FECHA; o braço direito avança um palmo; o ombro direito desce.
    3. ABRE: a tesoura abre de novo, mais à frente; o tronco se inclina mais.
    4. CORTA de novo: a tesoura FECHA no ponto mais distante; o braço direito esticado, o tronco bem inclinado. É o ponto de maior alcance.
    5. AFASTA: a mão esquerda faz um gesto para o lado, como quem afasta a lã cortada (que não aparece); a tesoura aberta recua; ela sorri.
    6. VOLTA: o tronco endireita um pouco, a mão esquerda volta a segurar, a tesoura volta para perto. Emenda no quadro 1.
- Movimento ritmado e vivo: abre e fecha a tesoura, avança o braço, o tronco vai e volta, a cabeça segue a tesoura, as pontas do lenço balançam.
- Em todas as figuras ela é vista pela mesma câmera da cena (isométrica, de cima), de FRENTE três quartos, exatamente como a primeira figura da folha de modelo: o corpo virado para a esquerda de quem olha, o rosto aparece. É a terceira pose da folha de modelo da tosquia (ela sozinha, de frente).
- Nos 6 quadros da tosquia o JOELHO no chão e o PÉ apoiado ficam exatamente no MESMO LUGAR; só os braços, os ombros, o tronco e a cabeça se mexem.
- As 7 figuras na MESMA escala (a cabeça tem o mesmo tamanho em todas), os pés e o joelho na mesma linha de base, igualmente espaçadas, cada uma centrada numa casa de mesma largura, com um vão vazio entre uma e outra (nenhuma encosta na vizinha).
- A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso.
- A TESOURA DE TOSQUIA é a da folha de ferramentas (tesoura de mola, de ferro cinza, duas lâminas triangulares largas, do tamanho do antebraço dela), inteira e do mesmo tamanho em todos os quadros da tosquia.
- NÃO desenhe a ovelha, nem lã, nem tufos caindo, nem lã no chão: só a personagem e a tesoura.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
