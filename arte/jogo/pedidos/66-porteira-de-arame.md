Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

A imagem anexa (`referencias/var-2-contorno.png`) é a cena de um jogo de fazenda original, em desenho com contorno escuro e cores chapadas. Ela dá o ESTILO e a CÂMERA. Preciso de peças desse jogo desenhadas de novo, SOZINHAS, para entrar no jogo como figuras 2D. Cada peça tem de parecer recortada dessa cena.

As outras imagens anexas:
- `referencias/arame-farpado.png`: a folha da CERCA VELHA DE ARAME FARPADO que já está no jogo (mourões velhos de madeira cinza, tortos, com raiz e tufinho de capim no pé, e fios de arame farpado). Ela dá o DESENHO dos mourões e do arame e a ESCALA: os mourões da porteira são IGUAIS a esses, do mesmo tamanho.
- `referencias/cercas.png`: a folha das cercas de MADEIRA NOVA do jogo. A peça da esquerda da linha de baixo é a PORTEIRA nova: ela dá a ARRUMAÇÃO da porteira (dois mourões nas pontas e a folha da porteira entre eles) e a proporção: de um mourão ao outro, DUAS vezes o comprimento de um trecho de cerca.
- `referencias/comeco-fazenda.png`: a imagem já aprovada do começo do jogo, com a cerca velha de arame em volta do sítio.

Quero a PORTEIRA VELHA DE PAU E ARAME, a porteira da roça que combina com a cerca de arame farpado:
- nas duas pontas, DOIS MOURÕES VELHOS iguais aos de `arame-farpado.png` (madeira acinzentada e rachada, ponta de cima lascada, raízes finas e um tufinho de capim no pé, uma volta de arame em cada um), em pé;
- entre eles, a FOLHA DA PORTEIRA feita de PAUS ROLIÇOS finos, tortos e acinzentados (galhos descascados, não tábua serrada): um pau em pé junto de cada mourão, um pau atravessado em cima, um embaixo e um na diagonal, amarrados nas juntas com voltas de arame;
- DOIS FIOS DE ARAME FARPADO esticados no meio da folha, de um pau em pé ao outro;
- do lado ESQUERDO, a folha presa ao mourão por duas argolas de arame (as dobradiças); do lado DIREITO, fechada com uma argola de arame passada por cima do pau e do mourão;
- velha e gasta, mas inteira e fechada.

Gere UMA imagem larga (proporção 3 por 2) e salve na pasta atual como `porteira-de-arame.png`, com DUAS peças soltas lado a lado, cada uma no centro da sua metade, com bastante espaço transparente entre elas, as duas NA MESMA ESCALA e na escala de `arame-farpado.png`:

1. Metade da ESQUERDA: a porteira correndo na diagonal que DESCE PARA A DIREITA (o mourão da esquerda fica mais alto na imagem; o da direita, mais baixo), como a porteira de `cercas.png` e o primeiro trecho de `arame-farpado.png`.
2. Metade da DIREITA: a MESMA porteira correndo na outra diagonal: DESCE PARA A ESQUERDA (o mourão da direita fica mais alto na imagem; o da esquerda, mais baixo), como o segundo trecho de `arame-farpado.png`. As argolas de dobradiça continuam no mourão da esquerda.

Em cada porteira, a distância na horizontal de um mourão ao outro é IGUAL a DUAS VEZES a altura do mourão (do pé até a ponta de cima). Os dois mourões são do mesmo tamanho, e a folha da porteira é mais baixa que os mourões (a ponta deles passa um pouco por cima).

Regras:
- Mesma câmera da cena: isométrica verdadeira (girada 45°, olhando de cima a cerca de 35°), sem perspectiva: a linha do chão de cada porteira sobe ou desce a 30°, e linhas paralelas continuam paralelas.
- Exatamente o mesmo estilo da cena e de `arame-farpado.png`: o mesmo traço escuro de espessura parecida, as mesmas cores chapadas com poucos tons, luz vindo de cima e da esquerda.
- Fundo transparente de verdade (canal alfa). Sem chão, sem grama além dos tufinhos no pé dos mourões, sem terra, sem sombra projetada no chão, sem cenário, sem texto, sem letras, sem números, sem moldura.
- Tudo inteiro dentro da imagem, sem cortar nada, com folga transparente em toda a volta.
- Arte original; não imite nenhum jogo existente.
- Gere a imagem UMA vez só. Cor que sobra em pixels totalmente transparentes (um "halo" que só aparece para quem ignora o canal alfa) não é defeito: não refaça nem retoque por causa disso.

No fim, liste os arquivos que salvou.
