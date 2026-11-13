Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/ferramentas.png`: a FOLHA DE MODELO das ferramentas, com a personagem ao lado para dar o tamanho. O balde de leite e o banquinho de ordenha têm de sair iguais aos da folha: mesma forma, mesmas cores, mesmo tamanho em relação a ela.
- `referencias/ordenha.png`: a FOLHA DE MODELO DA ORDENHA (a personagem sentada no banquinho ordenhando a vaca, vista por trás dela, pela frente dela, e a pose dela sozinha). Ela manda na pose, na posição do banquinho e do balde.
- `referencias/ordenhar-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).

Preciso da folha de animação da MESMA personagem ORDENHANDO, sentada no banquinho, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo. A VACA NÃO APARECE nesta folha: o jogo desenha a vaca à parte, atrás dela.

Gere uma imagem e salve na pasta atual como `ordenhar-costas.png`:

- Uma única fileira horizontal com 7 figuras, da esquerda para a direita:
  - Figura 1 (referência de tamanho): ela PARADA EM PÉ, igual à folha de modelo, pés juntos, braços soltos, mãos vazias, sem banquinho e sem balde.
  - Figuras 2 a 7: os 6 quadros da ordenha. Em todos ela está SENTADA no banquinho de três pés, joelhos dobrados e abertos, os dois pés no chão, o tronco inclinado para a frente, os dois braços esticados para a frente e para baixo com as mãos fechadas (segurando as tetas, que não aparecem), e o balde de leite no chão à frente dela, entre os pés. Nesta ordem:
    1. A mão DIREITA desce, puxando; a mão esquerda está no alto. O ombro direito desce junto.
    2. A mão direita no ponto mais BAIXO, quase na boca do balde; o tronco balança para esse lado, a cabeça inclina.
    3. A mão direita sobe de volta; a mão ESQUERDA começa a descer. O tronco volta ao meio.
    4. A mão ESQUERDA desce, puxando; a mão direita está no alto. O ombro esquerdo desce junto.
    5. A mão esquerda no ponto mais BAIXO; o tronco balança para o outro lado, a cabeça inclina para lá.
    6. A mão esquerda sobe de volta; a mão direita começa a descer. Emenda no quadro 1.
- Movimento ritmado e vivo: as mãos sobem e descem alternadas, uma de cada vez; os ombros acompanham, o tronco balança de um lado para o outro, a cabeça segue as mãos, as pontas do lenço balançam.
- Em todas as figuras ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; vê-se o coque, o nó do lenço e as costas do macacão com os dois bolsos, e do rosto só um pouco da bochecha. É como no primeiro desenho da folha de modelo da ordenha (visto por trás dela), mas SEM a vaca: o corpo dela esconde parte dos braços e do balde; aparecem os cotovelos subindo e descendo e as bordas do balde entre as pernas.
- Nos 6 quadros da ordenha o BANQUINHO, o BALDE e os dois PÉS ficam exatamente no MESMO LUGAR; só os braços, os ombros, o tronco e a cabeça se mexem.
- As 7 figuras na MESMA escala (a cabeça tem o mesmo tamanho em todas), os pés na mesma linha de base, igualmente espaçadas, cada uma centrada numa casa de mesma largura, com um vão vazio entre uma e outra (nenhuma encosta na vizinha).
- A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso.
- O BANQUINHO DE ORDENHA (madeira, redondo, três pés, da altura da canela dela) e o BALDE DE LEITE (metal cinza-claro, com alça de arame, da altura do joelho dela) são os da folha de ferramentas, inteiros e do mesmo tamanho em todos os quadros da ordenha.
- NÃO desenhe a vaca, nem úbere, nem tetas, nem leite, nem jatos, nem gotas: só a personagem, o banquinho e o balde.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
