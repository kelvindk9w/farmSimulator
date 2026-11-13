Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- `referencias/var-2-contorno.png`: a cena do jogo (dá o estilo e a câmera);
- `referencias/ovelha-tosquiada.png`: a FOLHA DE MODELO da ovelha tosquiada (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
- `referencias/parada-costas.png`: a folha já pronta da mesma ovelha tosquiada parada, nesta mesma vista (dá o formato da folha, o tamanho e o jeito do desenho: a figura tem de sair igual a esta).
- `referencias/ovelha-andar-costas.png`: a folha já pronta da ovelha COM LÃ na mesma ação e na mesma vista (dá o formato da folha, o tamanho e o movimento: a tosquiada faz o MESMO movimento, quadro a quadro, com a cabeça e as patas do mesmo tamanho).

Preciso da folha de animação da MESMA ovelha tosquiada ANDANDO, vista de COSTAS três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como `andar-costas.png`:

- Uma única fileira horizontal com 6 quadros, da esquerda para a direita, nesta ordem:
  1. CONTATO: a pata da frente do lado da câmera e a pata de trás do lado de lá estão à frente, tocando o chão; as outras duas estão para trás.
  2. PESO: o corpo passa por cima das patas apoiadas e desce um pouco; as duas patas de trás do passo saem do chão.
  3. PASSAGEM: as duas patas no ar passam dobradas por baixo do corpo; o lombo sobe um pouco.
  4. CONTATO do outro lado: agora a pata da frente do lado de lá e a pata de trás do lado da câmera tocam o chão à frente.
  5. PESO do outro lado: o corpo desce um pouco.
  6. PASSAGEM do outro lado: as outras duas patas passam dobradas por baixo do corpo. O quadro 6 emenda no quadro 1.
- Andar miúdo e saltitante de ovelha: passos curtos, o corpo sobe e desce de leve a cada passo, a cabeça balança, as orelhas e o rabinho sacodem. As patas continuam do MESMO comprimento das da folha parada; o corpo e a cabeça têm o mesmo tamanho dela.
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás. Ela anda nessa direção (para a direita e para cima de quem olha, afastando-se da câmera) sem sair do lugar.
- Os 6 quadros têm a ovelha tosquiada do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É a MESMA ovelha tosquiada da folha de modelo em todos os quadros: corpo magro e liso cor creme-rosada (sem lã), topetinho curto, cara e orelhas castanho-escuras, patas castanho-escuras com cascos pretos. Mesmas cores chapadas, mesmo traço escuro grosso.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
