Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/montaria.png`: a FOLHA DE MODELO DA MONTARIA (a personagem montada no cavalo, de frente três quartos, de costas três quartos e de perfil). Ela manda na pose dela na sela e no tamanho de uma figura em relação à outra.
- `referencias/cavalo-galope-costas.png`: a folha de animação já pronta do MESMO cavalo, SEM ninguém montado, na mesma ação e na mesma vista. O cavalo desta folha nova faz EXATAMENTE o mesmo movimento, quadro a quadro, na mesma ordem e no mesmo formato de folha; a diferença é que agora a personagem vai montada.
- `referencias/montada-galope-frente.png`: a folha já pronta da mesma ação com a personagem montada, vista de frente (dá o jeito dela na sela; aqui tudo é visto de costas).

Preciso da folha de animação da personagem MONTADA NO CAVALO, GALOPANDO, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo. O cavalo e a personagem são um desenho só em cada quadro.

Gere uma imagem e salve na pasta atual como `montada-galope-costas.png`:

- DUAS fileiras horizontais, uma em cima da outra, com 4 quadros cada: a fileira de CIMA tem os quadros 1 a 4, a de BAIXO tem os quadros 5 a 8, sempre da esquerda para a direita. As duas fileiras bem separadas por uma faixa vazia (nada de uma fileira encosta na outra). Os quadros, pelo movimento do cavalo:
  1. RECOLHIDO: as quatro patas no ar, dobradas e juntas embaixo da barriga. É o ponto mais ALTO do corpo.
  2. As duas patas de TRÁS descem e tocam o chão, bem embaixo do corpo; as da frente ainda no ar, dobradas.
  3. APOIO ATRÁS: o peso sobre as patas de trás, que dobram; as patas da frente se esticam para a frente.
  4. As patas da FRENTE tocam o chão à frente; o corpo se alonga.
  5. APOIO NA FRENTE: o peso passa para as patas da frente; as de trás saem do chão e vão para trás. É o ponto mais BAIXO do corpo.
  6. IMPULSO: as patas da frente empurram o chão para trás, quase retas; as de trás esticadas para trás, no ar.
  7. ESTICADO: o corpo todo alongado no ar, as patas da frente saindo do chão para trás, as de trás lá atrás.
  8. RECOLHE: as quatro patas começam a se juntar embaixo da barriga. O quadro 8 emenda no quadro 1.
- É um GALOPE de verdade: o cavalo se encolhe e se estica, o pescoço esticado para a frente, a crina e o rabo voando para trás. A personagem galopa junto: inclinada para a frente, levanta um pouco da sela quando o cavalo se estica e senta quando ele se recolhe, os cotovelos dobrados, as rédeas curtas, as pontas do lenço voando para trás. O cavalo e a personagem têm o MESMO tamanho da folha de modelo da montaria.
- Ela vai SENTADA NA SELA em todos os quadros, uma perna de cada lado, os pés nos estribos, as duas mãos segurando as rédeas, como na folha de modelo da montaria.
- Em todos os quadros o conjunto é visto pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a garupa do cavalo fica em primeiro plano e vemos as costas dela. O cavalo anda nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 8 quadros têm o cavalo e a personagem do MESMO tamanho (a cabeça dela e o corpo do cavalo têm o mesmo tamanho em todos), cada fileira sobre a sua linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso. E o MESMO cavalo da folha de modelo: pelo castanho, crina e rabo castanho-escuros, listra branca na testa, quatro meias brancas, sela de couro marrom sobre manta vermelha, estribos, cabeçada e rédeas.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço.
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
