Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/cavalo.png`: a FOLHA DE MODELO do cavalo selado (parado de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
- `referencias/parado-frente.png`: a folha já pronta do mesmo cavalo selado parado, nesta mesma vista (dá o formato da folha, o tamanho e o jeito do desenho: a figura tem de sair igual a esta).

Preciso da folha de animação do MESMO cavalo selado ANDANDO A PASSO, visto de FRENTE três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `andar-frente.png`:

- Uma única fileira horizontal com 8 quadros, da esquerda para a direita, nesta ordem:
  1. A pata de TRÁS do lado da câmera (a mais perto de quem olha) sai do chão, dobrada, o casco um pouco levantado. As outras três apoiadas.
  2. Essa pata de trás pousa um pouco à frente. O quadril desse lado desce de leve.
  3. A pata da FRENTE do mesmo lado sai do chão, dobrada no joelho.
  4. Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco.
  5. A pata de TRÁS do lado de lá (a mais longe de quem olha) sai do chão, dobrada.
  6. Essa pata pousa um pouco à frente. O quadril desse lado desce de leve.
  7. A pata da FRENTE do lado de lá sai do chão, dobrada no joelho.
  8. Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco. O quadro 8 emenda no quadro 1.
- É um PASSO de quatro tempos, NÃO é trote nem corrida: só UMA pata sai do chão de cada vez; as outras três ficam apoiadas e quase retas, do MESMO comprimento das patas da figura parada. O corpo fica na mesma altura e na mesma inclinação da figura parada, sem se jogar para a frente; corpo, cabeça e patas têm as MESMAS proporções da folha parada anexa. A cabeça balança para cima e para baixo a cada passo, a crina e o rabo balançam, os estribos balançam de leve.
- Em todos os quadros elo é visto pela mesma câmera da cena (isométrica, de cima), de FRENTE três quartos, exatamente como a primeira figura da folha de modelo: o corpo virado para a esquerda de quem olha e para a câmera, a cara aparece. Elo anda nessa direção (para a esquerda e para baixo de quem olha, vindo na direção da câmera) sem sair do lugar.
- Os 8 quadros têm o cavalo selado do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É o MESMO cavalo selado da folha de modelo em todos os quadros: pelo castanho, crina e rabo castanho-escuros, listra branca na testa, quatro meias brancas, sela de couro marrom sobre manta vermelha, estribos, cabeçada e rédeas. Mesmas cores chapadas, mesmo traço escuro grosso.
- NINGUÉM montado: a sela vazia.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
