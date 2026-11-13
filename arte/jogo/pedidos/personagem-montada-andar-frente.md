Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/cavalo.png`: a FOLHA DE MODELO do cavalo com sela.
- `referencias/montaria.png`: a FOLHA DE MODELO DA MONTARIA (a personagem montada no cavalo, de frente três quartos, de costas três quartos e de perfil). Ela manda na pose dela na sela e no tamanho de uma figura em relação à outra.
- `referencias/cavalo-andar-frente.png`: a folha de animação já pronta do MESMO cavalo, SEM ninguém montado, na mesma ação e na mesma vista. O cavalo desta folha nova faz EXATAMENTE o mesmo movimento, quadro a quadro, na mesma ordem e no mesmo formato de folha; a diferença é que agora a personagem vai montada.

Preciso da folha de animação da personagem MONTADA NO CAVALO, ANDANDO A PASSO, vista de FRENTE três quartos, para usar como figura 2D animada dentro do jogo. O cavalo e a personagem são um desenho só em cada quadro.

Gere uma imagem e salve na pasta atual como `montada-andar-frente.png`:

- DUAS fileiras horizontais, uma em cima da outra, com 4 quadros cada: a fileira de CIMA tem os quadros 1 a 4, a de BAIXO tem os quadros 5 a 8, sempre da esquerda para a direita. As duas fileiras bem separadas por uma faixa vazia (nada de uma fileira encosta na outra). Os quadros, pelo movimento do cavalo:
  1. A pata de TRÁS do lado da câmera (a mais perto de quem olha) sai do chão, dobrada, o casco um pouco levantado. As outras três apoiadas.
  2. Essa pata de trás pousa um pouco à frente. O quadril desse lado desce de leve.
  3. A pata da FRENTE do mesmo lado sai do chão, dobrada no joelho.
  4. Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco.
  5. A pata de TRÁS do lado de lá (a mais longe de quem olha) sai do chão, dobrada.
  6. Essa pata pousa um pouco à frente. O quadril desse lado desce de leve.
  7. A pata da FRENTE do lado de lá sai do chão, dobrada no joelho.
  8. Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco. O quadro 8 emenda no quadro 1.
- É um PASSO de quatro tempos, NÃO é trote nem corrida: só UMA pata sai do chão de cada vez; as outras três ficam apoiadas e quase retas, do MESMO comprimento das patas da figura parada. O corpo fica na mesma altura e na mesma inclinação da figura parada, sem se jogar para a frente; corpo, cabeça e patas têm as MESMAS proporções da folha parada anexa. A cabeça do cavalo balança para cima e para baixo a cada passo, a crina e o rabo balançam. A personagem acompanha o passo: o quadril dela balança de leve com o lombo do cavalo, o tronco sobe e desce um pouquinho, as mãos com as rédeas vão e vêm de leve, as pontas do lenço balançam.
- Ela vai SENTADA NA SELA em todos os quadros, uma perna de cada lado, os pés nos estribos, as duas mãos segurando as rédeas, como na folha de modelo da montaria.
- Em todos os quadros o conjunto é visto pela mesma câmera da cena (isométrica, de cima), de FRENTE três quartos, exatamente como a primeira figura da folha de modelo: o corpo virado para a esquerda de quem olha e para a câmera, aparecem a cara do cavalo e o rosto dela. O cavalo anda nessa direção (para a esquerda e para baixo de quem olha, vindo na direção da câmera) sem sair do lugar.
- Os 8 quadros têm o cavalo e a personagem do MESMO tamanho (a cabeça dela e o corpo do cavalo têm o mesmo tamanho em todos), cada fileira sobre a sua linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso. E o MESMO cavalo da folha de modelo: pelo castanho, crina e rabo castanho-escuros, listra branca na testa, quatro meias brancas, sela de couro marrom sobre manta vermelha, estribos, cabeçada e rédeas.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço.
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
