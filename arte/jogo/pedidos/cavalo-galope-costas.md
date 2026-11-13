Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/cavalo.png`: a FOLHA DE MODELO do cavalo selado (parado de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
- `referencias/parado-costas.png`: a folha já pronta do mesmo cavalo selado parado, nesta mesma vista (dá o formato da folha, o tamanho e o jeito do desenho: a figura tem de sair igual a esta).
- `referencias/galope-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui o bicho é visto de costas).

Preciso da folha de animação do MESMO cavalo selado GALOPANDO, visto de COSTAS três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `galope-costas.png`:

- DUAS fileiras horizontais, uma em cima da outra, com 4 quadros cada: a fileira de CIMA tem os quadros 1 a 4, a de BAIXO tem os quadros 5 a 8, sempre da esquerda para a direita. As duas fileiras bem separadas por uma faixa vazia (nada de uma fileira encosta na outra), nesta ordem:
  1. RECOLHIDO: as quatro patas no ar, dobradas e juntas embaixo da barriga. É o ponto mais ALTO do corpo.
  2. As duas patas de TRÁS descem e tocam o chão, bem embaixo do corpo; as da frente ainda no ar, dobradas.
  3. APOIO ATRÁS: o peso sobre as patas de trás, que dobram; as patas da frente se esticam para a frente.
  4. As patas da FRENTE tocam o chão à frente; o corpo se alonga.
  5. APOIO NA FRENTE: o peso passa para as patas da frente; as de trás saem do chão e vão para trás. É o ponto mais BAIXO do corpo.
  6. IMPULSO: as patas da frente empurram o chão para trás, quase retas; as de trás esticadas para trás, no ar.
  7. ESTICADO: o corpo todo alongado no ar, as patas da frente saindo do chão para trás, as de trás lá atrás.
  8. RECOLHE: as quatro patas começam a se juntar embaixo da barriga. O quadro 8 emenda no quadro 1.
- É um GALOPE de verdade, bem diferente do passo: o corpo se encolhe e se estica, as patas da frente e as de trás trabalham em pares, o pescoço esticado para a frente, a crina e o rabo voando para trás, os estribos sacudindo. O cavalo tem o MESMO tamanho de corpo e de cabeça da folha parada anexa.
- Em todos os quadros elo é visto pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás. Elo anda nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 8 quadros têm o cavalo selado do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É o MESMO cavalo selado da folha de modelo em todos os quadros: pelo castanho, crina e rabo castanho-escuros, listra branca na testa, quatro meias brancas, sela de couro marrom sobre manta vermelha, estribos, cabeçada e rédeas. Mesmas cores chapadas, mesmo traço escuro grosso.
- NINGUÉM montado: a sela vazia.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço.
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
