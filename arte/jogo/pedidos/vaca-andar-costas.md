Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/vaca.png`: a FOLHA DE MODELO da vaca (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
- `referencias/andar-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui o bicho é visto de costas).

Preciso da folha de animação da MESMA vaca ANDANDO, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `andar-costas.png`:

- Uma única fileira horizontal com 8 quadros, da esquerda para a direita, nesta ordem:
  1. PASSO 1: a pata da frente do lado da câmera avança e toca o chão; a pata de trás do outro lado avança junto. As outras duas ficam para trás, empurrando.
  2. PESO: o corpo passa por cima das patas apoiadas e desce um pouco; as patas que estavam atrás saem do chão.
  3. PASSAGEM: as duas patas no ar passam dobradas embaixo do corpo; o lombo sobe um pouco.
  4. ESTICA: as patas no ar se esticam para a frente, quase tocando o chão.
  5. PASSO 2: agora é a pata da frente do lado de lá que toca o chão à frente, junto com a pata de trás do lado da câmera.
  6. PESO do outro lado: o corpo desce um pouco.
  7. PASSAGEM do outro lado: as outras duas patas passam dobradas embaixo do corpo.
  8. ESTICA do outro lado. O quadro 8 emenda no quadro 1.
- Andar pesado e calmo de vaca: as patas em diagonal andam juntas, a cabeça balança para cima e para baixo a cada passo, o lombo sobe e desce de leve, o rabo balança de um lado para o outro, o úbere balança.
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás. Ela anda nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 8 quadros têm a vaca do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É a MESMA vaca da folha de modelo em todos os quadros: branca com as MESMAS manchas pretas nos mesmos lugares, focinho rosa, chifres curtos, orelhas para os lados, úbere rosa, rabo com tufo preto, cascos cinza-escuros. Mesmas cores chapadas, mesmo traço escuro grosso.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
