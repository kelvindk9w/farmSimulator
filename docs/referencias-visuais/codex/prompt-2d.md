# Prompt para o gerador — conversa do 2D

Abra outra conversa nova, **anexe a imagem `personagem-aprovado.png`** que saiu da conversa do 3D e cole o texto abaixo.

```text
Comece do zero. Não use memória, preferências salvas, cache nem nada de outras conversas ou projetos, e não reaproveite imagens já geradas. Use apenas esta mensagem e a imagem anexada. Responda em português.

CONTEXTO
Estou testando a arte do personagem de um jogo de fazenda original em 2D, com câmera isométrica fixa. O personagem vai ser animado por folhas de sprites, quadro a quadro, usadas em Three.js e em Godot 4. Nesta conversa quero as folhas de sprites prontas para entrar no jogo. Não quero cenário.

PERSONAGEM
A imagem anexada (personagem-aprovado.png) é o desenho aprovado e a única referência de aparência: mesmas proporções, cores, roupa e estilo em todos os quadros. Se não houver imagem anexada, pare e me peça a imagem.

COMO DESENHAR
- Os quadros devem ser desenhados com o gerador de imagens. Não construa um modelo 3D para renderizar os quadros: o objetivo do teste é saber se o desenho quadro a quadro se sustenta.
- Câmera do jogo: o personagem é visto um pouco de cima, com cerca de 35° de inclinação, sem perspectiva.
- Cinco direções desenhadas, nesta ordem: S (de frente para quem olha), SE (três quartos de frente, virado para a direita), E (de perfil, virado para a direita), NE (três quartos de costas, virado para a direita), N (de costas). As direções viradas para a esquerda serão espelhadas pelo jogo, então o personagem precisa ser simétrico.
- Luz uniforme vinda de cima, sem sombra no chão, fundo transparente.

ANIMAÇÕES
- idle: 4 quadros, repete. Parado, respirando.
- walk: 8 quadros, repete. Ciclo de caminhada.
- run: 8 quadros, repete. Ciclo de corrida.
- jump: 6 quadros, toca uma vez. Preparar, impulso, subindo, ponto mais alto, descendo, aterrissar.
- crouch: 4 quadros, toca uma vez. De pé até agachado.
- sit: 4 quadros, toca uma vez. De pé até sentado no chão.
- lie: 6 quadros, toca uma vez. De pé até deitado de costas no chão.

FORMATO FINAL
- Um PNG por animação na pasta sprites/: idle.png, walk.png, run.png, jump.png, crouch.png, sit.png, lie.png.
- Grade uniforme. Cada célula tem 256 x 256 px. Colunas = quadros, em ordem. Linhas = direções, na ordem S, SE, E, NE, N. Exemplo: walk.png tem 2048 x 1280 px.
- Em todas as células: mesma escala; o personagem em pé tem cerca de 200 px de altura; o ponto do chão entre os pés fica em x = 128, y = 232 da célula. No pulo, o corpo sobe e o ponto do chão continua no mesmo lugar. Deitado, o corpo fica centrado em x = 128. Nada cortado nas bordas da célula.
- sprites.json com: tamanho da célula, ponto de apoio, ordem das direções e, para cada animação, arquivo, número de quadros, quadros por segundo sugeridos e se repete.
- Gere as imagens como achar melhor (por exemplo, uma tira por direção) e depois use código para remover o fundo, recortar, alinhar pelos pés, igualar a escala e montar a grade final.

ORDEM DE TRABALHO
1. Faça primeiro só o walk, nas 5 direções. Monte previa/walk.gif com as 5 direções lado a lado e confira você mesmo: o personagem continua o mesmo em todos os quadros? As pernas alternam e o ciclo fecha? O tamanho e a posição dos pés ficam firmes, sem tremer? Refaça o que falhar. Depois me mostre o GIF e espere o meu ok.
2. Com o meu ok, faça as outras seis animações, com um GIF de prévia para cada uma.
3. Teste de personalização: refaça só o walk com outro visual do mesmo personagem (cabelo black power, barba cheia, camiseta vermelha), no mesmo formato, em variante-b/walk.png.

ENTREGA
Coloque tudo em uma pasta teste-2d/ (sprites/, previa/, variante-b/, sprites.json) e me entregue em um arquivo zip. Inclua um RELATORIO.md curto: o que foi entregue, quais animações ou direções não ficaram boas, quantas imagens você gerou, quantas refez e quanto tempo levou.

Se alguma animação não ficar consistente depois de algumas tentativas, entregue o melhor resultado e diga com clareza qual falhou. Não esconda falha.
```
