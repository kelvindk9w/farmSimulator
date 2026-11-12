# Rodada 3 — seis direções de arte para a mesma cena

O estilo "brinquedo" foi aplicado no jogo (`prototypes/sitio-minimo`, conjunto `brinquedo`) e o dono do projeto achou que melhorou, mas não ficou bom. Esta rodada volta um passo: seis direções de arte bem diferentes para a mesma cena, para escolher a que segue.

## Como usar

1. Abra uma conversa nova no Codex (ou no ChatGPT).
2. Anexe a captura do jogo: `arte/estilo/rodada-02/captura-do-jogo.png`. Se a imagem não chegar, o pedido funciona mesmo assim, porque descreve a cena inteira.
3. Cole o texto abaixo.

A sessão também roda este mesmo pedido pelo Codex de terminal (`tools/arte/codex.sh`) e guarda o resultado nesta pasta.

```text
Comece do zero. Não use memória, preferências salvas, cache nem nada de outras conversas ou projetos, e não reaproveite imagens já geradas. Use apenas o que está nesta mensagem e a imagem anexada, se houver. Responda em português.

O QUE EU QUERO
Estou escolhendo o estilo visual de um jogo de fazenda original. Quero SEIS imagens da MESMA cena, cada uma numa direção de arte bem diferente das outras, para comparar lado a lado e escolher uma. Use a sua ferramenta de geração de imagens. Gere uma imagem por vez, uma depois da outra, sem parar para perguntar nada, até completar as seis.

A IMAGEM ANEXADA
Se houver uma imagem anexada, ela é uma captura do protótipo do jogo, com um visual provisório e simples demais. Use-a só para a COMPOSIÇÃO: o que existe na cena, onde está cada coisa e o ângulo da câmera. Não copie o estilo dela. Se nenhuma imagem tiver chegado, não pare: siga a descrição abaixo, que diz tudo.

A CENA (igual nas seis imagens)
- Um sítio pequeno e quadrado, visto de cima e de lado, em vista isométrica (sem perspectiva), como um bloco de terreno flutuando sobre um fundo liso de uma cor só.
- No fundo, ao centro: um celeiro de madeira com telhado de telha de barro e porta dupla verde com um X branco em cada folha. À direita dele, uma laranjeira com laranjas.
- À direita: um cercado de madeira com uma vaca malhada dentro.
- Na frente, à direita do centro: um poço de pedra com telhadinho, manivela, corda e balde.
- À esquerda: um terreiro de terra clara com um ninho de palha com um ovo dentro e duas galinhas, uma branca e uma caramelo.
- Na frente, à esquerda: dois canteiros de terra arada. Um com montinhos de sementes recém-plantadas; o outro com pés de milho altos, com espigas, prontos para colher.
- Um caminho de terra batida liga o celeiro, o terreiro, os canteiros, o poço e o cercado. O resto do chão é grama.
- O personagem está em pé ao lado do canteiro de milho: adulto, pele morena, cabelo escuro preso num coque com lenço vermelho, camiseta amarelo-mostarda, jardineira jeans azul, botas marrons.
- Cada coisa inteira, com espaço em volta, sem uma cobrir a outra.

O QUE MUDA DE UMA IMAGEM PARA A OUTRA
Só a direção de arte: o desenho das formas, as proporções, os materiais, as cores, a luz e o acabamento. As seis têm que ser claramente diferentes entre si; se duas ficarem parecidas, refaça uma delas. Em todas, o objetivo é o mesmo: a pessoa bate o olho e pensa "que bonito, quero jogar".

AS SEIS DIREÇÕES
1. var-1-low-poly.png — Low poly: tudo feito de faces planas e bem visíveis, sem textura, cores em blocos com degradês suaves, luz dourada de fim de tarde com sombras longas. Limpo e elegante.
2. var-2-contorno.png — Desenho animado com contorno: cores chapadas em dois ou três tons por objeto, contorno escuro e firme em volta de tudo, formas expressivas e um pouco exageradas, como um desenho de TV em 3D.
3. var-3-pintado.png — 3D de textura pintada à mão: formas cheias e arredondadas, com cada superfície pintada a pincel (tábuas, telhas, pedras, palha, terra), cores ricas e quentes, sombras coloridas. O acabamento caprichado dos jogos casuais de celular mais populares.
4. var-4-massinha.png — Massinha: tudo parece modelado à mão em massinha, como numa animação quadro a quadro: superfícies levemente irregulares, marcas suaves de dedo, bordas grossas, cores vivas, luz de estúdio macia.
5. var-5-aquarela.png — Livro ilustrado: aquarela e lápis de cor, contornos finos e irregulares, cores suaves com manchas de tinta, papel aparecendo de leve. Aconchegante e artesanal.
6. var-6-blocos.png — Blocos: tudo construído com cubinhos (voxel), como uma maquete de bloquinhos, com cores vivas e luz nítida.

LIMITES (valem para as seis)
- Isto vai virar um jogo 3D que roda no navegador, em celular fraco e em TV. A imagem tem que parecer uma captura do jogo rodando, não uma ilustração de capa.
- Pode ter textura pintada rica. O que não pode: pelo fio a fio, pena por pena, folha por folha, grama fio a fio cobrindo o chão, reflexo realista, névoa, desfoque de fundo, raios de luz.
- Não é realista e não é infantil demais: é para adultos e crianças.
- Sem interface, sem texto, sem números, sem logotipo, sem marca d'água.
- Não imite nenhum jogo, filme ou marca que exista.

FORMATO
Uma imagem por arquivo, deitada, proporção 16:9, em PNG, no maior tamanho que a ferramenta entregar.

ONDE SALVAR (se você puder gravar arquivos)
Na pasta atual, com exatamente os nomes acima. Se a ferramenta gravar em outro lugar, copie para a pasta atual.

ANTES DE ENTREGAR
Confira cada imagem e refaça a que falhar (no máximo duas tentativas por imagem): estão lá o celeiro, a laranjeira, o cercado com a vaca, o poço, o terreiro com o ninho, o ovo e as duas galinhas, os dois canteiros (sementes e milho alto), o caminho e o personagem? A câmera é a isométrica? O estilo é o pedido para aquela imagem e diferente das outras cinco? Há texto ou interface?

ENTREGA
1. As seis imagens.
2. Para cada uma: as 8 cores principais em hexadecimal e 4 regras curtas do estilo (formas, contorno, materiais, luz).
3. O que não ficou como pedido em cada imagem.
```

## Depois da escolha

1. Uma rodada curta só com a direção escolhida: duas ou três variações dela (cores, proporções, luz), para fechar o estilo.
2. As folhas de modelo de cada objeto nesse estilo.
3. O teste de como levar esse acabamento para o jogo. No conjunto `brinquedo` as formas foram feitas por código, sem textura, e foi isso que mais afastou o jogo da imagem. O próximo teste usa textura pintada pelo Codex sobre os modelos, ou modelos feitos por uma IA de imagem para 3D.
