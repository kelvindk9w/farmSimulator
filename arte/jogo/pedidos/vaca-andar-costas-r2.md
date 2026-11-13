Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/vaca.png`: a FOLHA DE MODELO da vaca (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
- `referencias/parada-costas.png`: a folha já pronta da mesma vaca parada, nesta mesma vista (dá o formato da folha, o tamanho e o jeito do desenho: a vaca tem de sair igual a esta).
- `referencias/andar-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui o bicho é visto de costas).

Preciso da folha de animação da MESMA vaca ANDANDO, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `andar-costas.png`:

- Uma única fileira horizontal com 8 quadros, da esquerda para a direita. É um PASSO LENTO de vaca, de quatro tempos: só UMA pata sai do chão de cada vez, as outras três ficam apoiadas e quase retas. Nesta ordem:
  1. A pata de TRÁS do lado da câmera (a que está mais perto de quem olha) sai do chão, dobrada, o casco um pouco levantado. As outras três apoiadas.
  2. Essa pata de trás pousa um pouco à frente. O quadril desse lado desce de leve.
  3. A pata da FRENTE do mesmo lado sai do chão, dobrada no joelho.
  4. Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco.
  5. A pata de TRÁS do lado de lá (a mais longe de quem olha) sai do chão, dobrada.
  6. Essa pata pousa um pouco à frente. O quadril desse lado desce de leve.
  7. A pata da FRENTE do lado de lá sai do chão, dobrada no joelho.
  8. Essa pata pousa um pouco à frente. A cabeça desce um pouco. O quadro 8 emenda no quadro 1.
- É andar, NÃO é trote nem corrida: o corpo fica na horizontal, na mesma altura e na mesma inclinação da vaca parada de `referencias/parada-costas.png`, sem se jogar para a frente; as patas apoiadas ficam retas e do MESMO comprimento das patas da vaca parada (não encurte as patas, não abra as patas para os lados); nenhuma pata se estica para trás. A cabeça balança de leve, o rabo balança de um lado para o outro, o úbere balança.
- A vaca tem as MESMAS proporções da vaca parada: mesmo tamanho de corpo, mesma altura de pernas, mesmo tamanho de cabeça. Se você puser um quadro desta folha por cima da vaca parada, o corpo e a cabeça coincidem; só as patas, o rabo e a cabeça se mexem um pouco.
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás. Ela anda nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 8 quadros têm a vaca do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É a MESMA vaca da folha de modelo em todos os quadros: branca com as MESMAS manchas pretas nos mesmos lugares, focinho rosa, chifres curtos, orelhas para os lados, úbere rosa, rabo com tufo preto, cascos cinza-escuros. Mesmas cores chapadas, mesmo traço escuro grosso.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
