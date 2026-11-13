Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/andar-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).

Preciso da folha de animação da MESMA personagem ANDANDO, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `andar-costas.png`:

- Uma única fileira horizontal com 8 quadros, da esquerda para a direita, nesta ordem:
  1. CONTATO: perna direita esticada à frente, calcanhar tocando o chão; perna esquerda atrás, na ponta do pé. Braço esquerdo à frente, braço direito atrás.
  2. DESCIDA: o peso cai sobre a perna direita, o joelho dela dobra, o pé de trás sai do chão. É o ponto mais BAIXO do corpo.
  3. PASSAGEM: a perna direita reta embaixo do corpo; a perna esquerda passa dobrada ao lado dela, com o pé no ar. Braços passando junto ao corpo.
  4. SUBIDA: a perna esquerda avança no ar, o pé direito empurra o chão na ponta. É o ponto mais ALTO do corpo.
  5. CONTATO do outro lado: perna esquerda esticada à frente, calcanhar no chão; perna direita atrás. Braço direito à frente, braço esquerdo atrás.
  6. DESCIDA sobre a perna esquerda (ponto mais baixo).
  7. PASSAGEM: a perna direita passa dobrada ao lado da esquerda.
  8. SUBIDA: a perna direita avança no ar (ponto mais alto). O quadro 8 emenda no quadro 1.
- Movimento vivo, não duro: passada larga, braços balançando bem (dobrados de leve no cotovelo, sempre opostos às pernas), ombros e quadril girando um pouco, a cabeça subindo e descendo de leve (mais baixa nos quadros 2 e 6, mais alta nos 4 e 8), as pontas do lenço balançando.
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; vê-se o coque, o nó do lenço e as costas do macacão com os dois bolsos, e do rosto só um pouco da bochecha. Ela anda nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 8 quadros têm a personagem do MESMO tamanho (a cabeça tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso. Mãos vazias.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
