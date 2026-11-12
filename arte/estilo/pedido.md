# Pedido da arte de referência — estilo do sítio atual

Serve para escolher o estilo visual do jogo a partir do que já existe no protótipo (`prototypes/sitio-minimo`). Não é o cenário completo do jogo: é a mesma cena pequena de hoje, repintada em três estilos.

Abra uma conversa nova no Codex, **anexe `arte/estilo/base-sitio-minimo.png`** (a captura do protótipo, sem a interface) e cole o texto abaixo.

```text
Comece do zero. Não use memória, preferências salvas, cache nem nada de outras conversas ou projetos, e não reaproveite imagens já geradas. Use apenas o que está nesta mensagem e a imagem anexada. Responda em português.

O QUE EU QUERO
A imagem anexada é uma captura de um protótipo de jogo de fazenda original. O jogo funciona, mas o visual está simples demais. Quero três versões da MESMA cena, cada uma num estilo diferente, para escolher o estilo do jogo. Use a sua ferramenta de geração de imagens, com a imagem anexada como base da composição.

O QUE NÃO PODE MUDAR
- A câmera: vista isométrica fixa, sem perspectiva, a mesma da imagem anexada.
- O que existe na cena e onde está: um celeiro de madeira com telhado de telha de barro e porta dupla verde; uma laranjeira com laranjas ao lado dele; um cercado de madeira com uma vaca malhada; um poço de pedra com telhadinho e manivela; dois canteiros de terra arada, vazios; um terreiro de terra clara com um ninho de palha e duas galinhas (uma branca, uma caramelo); um caminho de terra batida ligando tudo; chão de grama; o personagem em pé perto do poço.
- O personagem: adulto com proporção de desenho animado (cabeça grande, cerca de 3 cabeças de altura), pele morena, cabelo escuro preso num coque com lenço vermelho, camiseta amarelo-mostarda, jardineira jeans azul, botas marrons.
- O tamanho de cada coisa em relação às outras e a posição de cada uma. Cada objeto inteiro, com espaço em volta, sem um cobrir o outro.
- O bloco de terreno flutuando sobre um fundo liso, como na imagem anexada.

O QUE PODE (E DEVE) MUDAR
O desenho de cada coisa: formas, proporções internas, detalhes, cores, materiais, luz e acabamento. O objetivo é que a pessoa olhe e pense "que bonito, quero jogar".

LIMITE IMPORTANTE: TEM QUE DAR PARA CONSTRUIR
Isto vai virar um jogo 3D que roda no navegador, em celular fraco e em TV. Então a imagem tem que parecer uma captura de jogo rodando, não uma ilustração de capa:
- Formas simples, com poucas peças por objeto. Nada de detalhe miúdo que só existe em pintura.
- Materiais lisos ou com textura pintada simples. Sem pelo fio a fio, sem pena por pena, sem folha por folha, sem grama fio a fio cobrindo o chão.
- Luz simples: sol vindo de cima e da esquerda, sombras suaves. Sem reflexo realista, sem névoa, sem desfoque de fundo, sem brilho exagerado, sem raios de luz.
- Nada de interface, texto, números, logotipo ou marca d'água.

OS TRÊS ESTILOS
- estilo-a.png — Desenho animado com cara de brinquedo: volumes arredondados e gordinhos, cantos macios, cores quentes e bem saturadas, materiais que lembram brinquedo de vinil ou massinha. Simpático, mas não infantil.
- estilo-b.png — Fofinho: tudo ainda mais redondo e baixinho, cabeças e olhos maiores, bichos bem rechonchudos, cores mais claras e suaves (tons pastel).
- estilo-c.png — Pintado à mão: as mesmas formas simples, mas com textura de pincel visível nas superfícies (madeira, telha, pedra, grama) e um contorno suave mais escuro em volta de cada objeto, como ilustração de livro infantil.

FORMATO
Uma imagem por arquivo, deitada, proporção 16:9, com pelo menos 1920 x 1080 px, em PNG.

ANTES DE ENTREGAR
Confira você mesmo cada imagem e refaça a que falhar: a câmera e a posição das coisas batem com a imagem anexada? Estão lá o celeiro, a laranjeira, o cercado com a vaca, o poço, os dois canteiros, o terreiro com o ninho e as duas galinhas, o caminho e o personagem? Alguma parte parece impossível de construir com formas simples? Há texto ou interface?

ENTREGA
1. As três imagens.
2. Para cada uma: o texto exato que você usou para gerar e quantas tentativas foram necessárias.
3. Para cada uma: as 10 cores principais em hexadecimal (grama, terra do caminho, terra arada, madeira clara, madeira escura, telha, pedra, pele, e as duas mais usadas nos bichos) e 5 regras curtas do estilo (formas, proporções, contorno, materiais, luz). Isso vai ser usado para reproduzir o estilo no jogo.
4. O que não ficou como pedido em cada imagem.
```

## O que mandar de volta

- As três imagens, anexadas na conversa (ou colocadas nesta pasta como `estilo-a.png`, `estilo-b.png`, `estilo-c.png`).
- A resposta em texto do Codex, com as cores e as regras de cada estilo.

Quando um estilo for escolhido, a versão final fica aqui como `aprovado.png`.

## Depois da escolha

1. O conjunto de arte do protótipo ganha uma opção nova no botão "Arte", refeita para chegar perto do estilo aprovado (formas, cores, texturas pintadas pelo Codex, luz).
2. A comparação lado a lado, a imagem do Codex e o jogo rodando, mostra o quanto o caminho escolhido chega perto, e o que precisa de outro caminho (por exemplo, personagem e bichos feitos por uma IA de imagem para 3D).
