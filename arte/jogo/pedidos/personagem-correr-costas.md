Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/correr-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).

Preciso da folha de animação da MESMA personagem CORRENDO, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `correr-costas.png`:

- Uma única fileira horizontal com 8 quadros, da esquerda para a direita, nesta ordem:
  1. CONTATO: o pé direito bate no chão à frente do corpo, joelho dobrado; a perna esquerda vem atrás, dobrada, com o calcanhar alto. Braço esquerdo à frente, direito atrás.
  2. APOIO: o corpo afunda sobre a perna direita (ponto mais BAIXO); o joelho esquerdo começa a vir para a frente.
  3. IMPULSO: a perna direita estica e empurra o chão para trás; o joelho esquerdo sobe alto à frente.
  4. VOO: os dois pés fora do chão, pernas abertas em tesoura (a esquerda à frente, a direita atrás). É o ponto mais ALTO: o corpo inteiro fica mais alto que nos outros quadros.
  5. CONTATO do outro lado: o pé esquerdo bate no chão à frente; a perna direita atrás, dobrada. Braço direito à frente, esquerdo atrás.
  6. APOIO sobre a perna esquerda (ponto mais baixo).
  7. IMPULSO: a perna esquerda estica e empurra; o joelho direito sobe alto à frente.
  8. VOO: os dois pés fora do chão, pernas em tesoura (a direita à frente). O quadro 8 emenda no quadro 1.
- É uma CORRIDA de verdade, bem diferente de andar: o tronco inclinado para a frente, passadas muito largas, joelhos altos, braços dobrados em ângulo reto bombeando com força (sempre opostos às pernas), punhos fechados, as pontas do lenço voando para trás. Nos quadros 4 e 8 ela está no ar.
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; vê-se o coque, o nó do lenço e as costas do macacão com os dois bolsos, e do rosto só um pouco da bochecha. Ela corre nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 8 quadros têm a personagem do MESMO tamanho (a cabeça tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso. Mãos vazias.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
