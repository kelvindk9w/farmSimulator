Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.
- `referencias/comeco-personagem-trouxa.png`: a imagem APROVADA da personagem chegando à fazenda com a TROUXA e a ENXADA (à esquerda, de frente; à direita, de costas). Ela manda em como a trouxa e a enxada são levadas.
- `referencias/andar-costas.png`: a folha já pronta da caminhada de COSTAS, sem nada nas mãos. Ela dá o TAMANHO da figura, a vista e o balanço. O defeito dela: as poses se repetem e ela dá sempre o passo com a MESMA perna. Nesta folha nova os dois passos têm de ser diferentes.
- `referencias/andar-frente.png`: a folha já pronta da caminhada vista de FRENTE, em duas fileiras de 4: a fileira de cima é o passo de uma perna, a de baixo o passo da outra. Faça igual, vista de costas.

Preciso da folha de animação da MESMA personagem ANDANDO COM A TROUXA NO OMBRO E A ENXADA NA MÃO, vista de COSTAS três quartos: é ela entrando na fazenda, de costas para nós.

Como ela está de costas, virada para a direita de quem olha, cada perna sai de um quadril: o QUADRIL DE CÁ fica à esquerda de quem olha, mais perto; o QUADRIL DE LÁ fica à direita de quem olha, meio escondido. Andando para o fundo, a perna da FRENTE vai para cima e para a direita (mais longe); a perna de TRÁS fica embaixo e à esquerda, mais perto de nós, e mostra a SOLA da bota quando sai do chão.

Gere uma imagem e salve na pasta atual como `andar-trouxa-costas.png`, com DUAS fileiras horizontais de 4 quadros cada:

- Fileira de CIMA, quadros 1 a 4: o passo em que a perna de TRÁS (a que mostra a sola) é a que sai do quadril de CÁ.
  1. CONTATO: a perna de lá esticada à frente (para o fundo), calcanhar no chão; a perna de cá atrás, na ponta do pé, mostrando a sola.
  2. DESCIDA: o peso cai sobre a perna de lá, o joelho dela dobra; o pé de cá sai do chão. O corpo no ponto mais BAIXO.
  3. PASSAGEM: a perna de lá reta embaixo do corpo; a perna de cá passa dobrada ao lado dela, com o pé no ar.
  4. SUBIDA: a perna de cá avança no ar; o pé de lá empurra o chão na ponta. O corpo no ponto mais ALTO.
- Fileira de BAIXO, quadros 5 a 8: o outro passo, com as pernas TROCADAS. Agora a perna de TRÁS (a que mostra a sola, embaixo à esquerda) é a que sai do quadril de LÁ: ela cruza por baixo da outra, e as duas pernas formam um X na altura dos joelhos. A perna de cá vai à frente, para o fundo.
  5. CONTATO: a perna de cá esticada à frente (para o fundo), calcanhar no chão; a perna de lá atrás, cruzada, na ponta do pé, mostrando a sola.
  6. DESCIDA: o peso cai sobre a perna de cá, o joelho dela dobra; o pé de lá sai do chão.
  7. PASSAGEM: a perna de cá reta embaixo do corpo; a perna de lá passa dobrada, meio escondida atrás dela, com o pé no ar.
  8. SUBIDA: a perna de lá avança no ar; o pé de cá empurra o chão na ponta. O quadro 8 emenda no quadro 1.
- Confira antes de salvar: a fileira de baixo não pode repetir as pernas da fileira de cima. No quadro 1 a sola que aparece é a da bota da ESQUERDA de quem olha; no quadro 5, a sola que aparece é a da outra bota, que cruzou por baixo.
- A TROUXA: um pano AZUL com FLORZINHAS BRANCAS de miolo amarelo, amarrado em trouxinha com o nó em cima, pendurado na ponta de um PAU de madeira. O pau vai apoiado no OMBRO, segurado pela mão da direita de quem olha, e a trouxa fica pendurada na outra ponta, do lado ESQUERDO de quem olha, na altura do ombro, igual à figura de costas da imagem aprovada. Esse braço NÃO balança: fica segurando o pau. A trouxa balança um pouquinho com o passo.
- A ENXADA: na outra mão (a da esquerda de quem olha), segurada pelo meio do cabo, com a lâmina de ferro escuro para baixo, perto do chão mas SEM tocar o chão nem as botas, do lado de fora da perna. Esse braço balança de leve com o passo, levando a enxada junto.
- Movimento vivo: ombros e quadril girando um pouco, a cabeça subindo e descendo de leve, as pontas do lenço balançando.
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: de costas para nós, virada para a direita de quem olha; vemos o coque, o nó do lenço e as costas do macacão. Ela anda nessa direção (para a direita e para o fundo) sem sair do lugar.
- Os 8 quadros têm a personagem do MESMO tamanho de `andar-costas.png` (a cabeça tem o mesmo tamanho em todos), o pé apoiado sempre na linha de base da sua fileira, igualmente espaçados, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho, nem pela trouxa nem pela enxada) e uma faixa vazia entre as duas fileiras.
- A personagem é a MESMA da folha de modelo: mesmas proporções, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com os suspensórios nas costas, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso. A trouxa e a enxada são as mesmas e do mesmo tamanho em todos os quadros.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem números, sem texto, sem setas, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço.
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
