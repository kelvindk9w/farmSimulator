// Escreve os pedidos de animação ao Codex (um .md por folha) a partir de uma tabela, para a redação sair sempre igual.
// Uso: node arte/jogo/pedidos/gerar.mjs [nome-do-pedido ...]   (sem nomes, escreve todos)
// Os pedidos de folha de modelo (modelo-*.md) são escritos à mão. Um pedido refeito ganha o sufixo -r2, -r3.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));

const CABECA = `Use a sua ferramenta própria de geração de imagens. Não escreva código para desenhar.

As imagens anexas são de um jogo de fazenda original, em desenho com contorno:
- \`referencias/var-2-contorno.png\`: a cena do jogo (dá o estilo e a câmera);`;

// ---------- personagem ----------

const P_MODELO = '- `referencias/personagem.png`: a FOLHA DE MODELO da personagem (parada de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e na roupa.';
const P_FERRAMENTAS = '- `referencias/ferramentas.png`: a FOLHA DE MODELO das ferramentas, com a personagem ao lado para dar o tamanho. A ferramenta deste pedido tem de sair igual à da folha: mesma forma, mesmas cores, mesmo tamanho em relação a ela.';
const P_VISTA = {
  frente: 'de FRENTE três quartos, exatamente como a primeira figura da folha de modelo: o corpo virado para a esquerda de quem olha, o rosto aparece',
  costas: 'de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; vê-se o coque, o nó do lenço e as costas do macacão com os dois bolsos, e do rosto só um pouco da bochecha',
};
const P_RUMO = { frente: 'para a esquerda e para baixo de quem olha, vindo na direção da câmera', costas: 'para a direita e para cima de quem olha, afastando-se da câmera' };
const P_ALVO = { frente: 'no chão logo à frente dela, para a esquerda e para baixo de quem olha', costas: 'no chão logo à frente dela, para a direita e para cima de quem olha (ela trabalha de costas para a câmera, e o corpo dela esconde parte do que faz)' };
const P_MESMA = 'A personagem é a MESMA da folha de modelo em todos os quadros: mesmas proporções (cabeça grande, corpo pequeno), mesmo rosto, lenço vermelho com o nó e o coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons, mesmas cores chapadas, mesmo traço escuro grosso.';
const LIMPO = 'Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem poeira, sem riscos de movimento, sem gotas, sem brilhos, sem números, sem texto, sem linhas de grade, sem moldura.';
const FIM = `- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.`;

// Ciclos em que ela se desloca (andar, correr, carregar) ou fica parada: sem figura de referência.
function ciclo({ arquivo, titulo, uso, n, quadros, vivo, vista, extra = '', refs = [], maos = 'Mãos vazias.' }) {
  return `${CABECA}
${P_MODELO}
${refs.join('\n')}${refs.length ? '\n' : ''}
Preciso da folha de animação da MESMA personagem ${titulo}, vista ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo${uso ? ` ${uso}` : ''}.

Gere uma imagem e salve na pasta atual como \`${arquivo}\`:

- Uma única fileira horizontal com ${n} quadros, da esquerda para a direita, nesta ordem:
${quadros.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}
- ${vivo}
- Em todos os quadros ela é vista pela mesma câmera da cena (isométrica, de cima), ${P_VISTA[vista]}.${extra ? ` ${extra}` : ''}
- Os ${n} quadros têm a personagem do MESMO tamanho (a cabeça tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- ${P_MESMA} ${maos}
- ${LIMPO}
${FIM}
`;
}

// Ações com os pés plantados: a primeira figura é ela parada em pé (dá a escala); depois vêm os quadros da ação.
function acao({ arquivo, titulo, uso, n, quadros, vivo, vista, ferramenta, refs = [], semObjeto = '' }) {
  return `${CABECA}
${P_MODELO}
${ferramenta ? `${P_FERRAMENTAS}\n` : ''}${refs.join('\n')}${refs.length ? '\n' : ''}
Preciso da folha de animação da MESMA personagem ${titulo}, vista ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo${uso ? ` ${uso}` : ''}.

Gere uma imagem e salve na pasta atual como \`${arquivo}\`:

- Uma única fileira horizontal com ${n + 1} figuras, da esquerda para a direita:
  - Figura 1 (referência de tamanho): ela PARADA EM PÉ, igual à folha de modelo, pés juntos, braços soltos, mãos vazias.
  - Figuras 2 a ${n + 1}: os ${n} quadros da ação, nesta ordem:
${quadros.map((q, i) => `    ${i + 1}. ${q}`).join('\n')}
- ${vivo}
- Em todas as figuras ela é vista pela mesma câmera da cena (isométrica, de cima), ${P_VISTA[vista]}. O que ela trabalha fica ${P_ALVO[vista]}.
- Nos ${n} quadros da ação os dois PÉS FICAM PLANTADOS NO MESMO LUGAR, um pouco afastados; só os joelhos, o quadril, o tronco, os braços e a cabeça se mexem.
- As ${n + 1} figuras na MESMA escala (a cabeça tem o mesmo tamanho em todas), os pés na mesma linha de base, igualmente espaçadas, cada uma centrada numa casa de mesma largura, com um vão vazio entre uma e outra (nenhuma encosta na vizinha, nem a ferramenta).
- ${P_MESMA}
${ferramenta ? `- A ferramenta: ${ferramenta} Ela aparece inteira em todos os quadros da ação, sempre do mesmo tamanho.\n` : ''}${semObjeto ? `- ${semObjeto}\n` : ''}- ${LIMPO}
${FIM}
`;
}

const ANDAR = [
  'CONTATO: perna direita esticada à frente, calcanhar tocando o chão; perna esquerda atrás, na ponta do pé. Braço esquerdo à frente, braço direito atrás.',
  'DESCIDA: o peso cai sobre a perna direita, o joelho dela dobra, o pé de trás sai do chão. É o ponto mais BAIXO do corpo.',
  'PASSAGEM: a perna direita reta embaixo do corpo; a perna esquerda passa dobrada ao lado dela, com o pé no ar. Braços passando junto ao corpo.',
  'SUBIDA: a perna esquerda avança no ar, o pé direito empurra o chão na ponta. É o ponto mais ALTO do corpo.',
  'CONTATO do outro lado: perna esquerda esticada à frente, calcanhar no chão; perna direita atrás. Braço direito à frente, braço esquerdo atrás.',
  'DESCIDA sobre a perna esquerda (ponto mais baixo).',
  'PASSAGEM: a perna direita passa dobrada ao lado da esquerda.',
  'SUBIDA: a perna direita avança no ar (ponto mais alto). O quadro 8 emenda no quadro 1.',
];
const CORRER = [
  'CONTATO: o pé direito bate no chão à frente do corpo, joelho dobrado; a perna esquerda vem atrás, dobrada, com o calcanhar alto. Braço esquerdo à frente, direito atrás.',
  'APOIO: o corpo afunda sobre a perna direita (ponto mais BAIXO); o joelho esquerdo começa a vir para a frente.',
  'IMPULSO: a perna direita estica e empurra o chão para trás; o joelho esquerdo sobe alto à frente.',
  'VOO: os dois pés fora do chão, pernas abertas em tesoura (a esquerda à frente, a direita atrás). É o ponto mais ALTO: o corpo inteiro fica mais alto que nos outros quadros.',
  'CONTATO do outro lado: o pé esquerdo bate no chão à frente; a perna direita atrás, dobrada. Braço direito à frente, esquerdo atrás.',
  'APOIO sobre a perna esquerda (ponto mais baixo).',
  'IMPULSO: a perna esquerda estica e empurra; o joelho direito sobe alto à frente.',
  'VOO: os dois pés fora do chão, pernas em tesoura (a direita à frente). O quadro 8 emenda no quadro 1.',
];
const CARREGAR = [
  'CONTATO: perna direita esticada à frente, calcanhar no chão; perna esquerda atrás, na ponta do pé.',
  'DESCIDA: o peso cai sobre a perna direita, o joelho dobra; o cesto desce junto (ponto mais baixo).',
  'PASSAGEM: a perna esquerda passa dobrada ao lado da direita.',
  'SUBIDA: a perna esquerda avança no ar; o cesto sobe (ponto mais alto).',
  'CONTATO do outro lado: perna esquerda esticada à frente; perna direita atrás.',
  'DESCIDA sobre a perna esquerda (ponto mais baixo).',
  'PASSAGEM: a perna direita passa dobrada ao lado da esquerda.',
  'SUBIDA: a perna direita avança no ar (ponto mais alto). O quadro 8 emenda no quadro 1.',
];

const pedidos = {};
for (const vista of ['frente', 'costas']) {
  const fmt = vista === 'costas' ? (n) => [`- \`referencias/${n}-frente.png\`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).`] : () => [];
  pedidos[`personagem-parada-${vista}`] = ciclo({
    arquivo: `parada-${vista}.png`, titulo: 'PARADA, respirando', vista, n: vista === 'frente' ? 4 : 3,
    quadros: [
      'DESCANSO: em pé, igual à folha de modelo; os dois pés inteiros no chão, lado a lado; braços soltos.',
      'INSPIRA: o peito enche e os ombros sobem um pouco; os braços abrem de leve; a cabeça sobe um tiquinho.',
      'PEITO CHEIO: o ponto mais alto da respiração: ombros no alto, queixo um pouco erguido, as pontas do lenço mexem.',
      ...(vista === 'frente' ? ['PISCADA: igual ao quadro 1, mas com os dois OLHOS FECHADOS (uma linha curva no lugar de cada olho).'] : []),
    ],
    vivo: 'É uma respiração calma, mas que se percebe: os ombros e o peito sobem e descem, os braços acompanham. Os PÉS NÃO SE MEXEM: ficam plantados no mesmo lugar, lado a lado, em todos os quadros. Pernas retas, nada de passo.',
    extra: 'Ela não sai do lugar.',
  });
  pedidos[`personagem-andar-${vista}`] = ciclo({
    arquivo: `andar-${vista}.png`, titulo: 'ANDANDO', vista, n: 8, quadros: ANDAR, refs: fmt('andar'),
    vivo: 'Movimento vivo, não duro: passada larga, braços balançando bem (dobrados de leve no cotovelo, sempre opostos às pernas), ombros e quadril girando um pouco, a cabeça subindo e descendo de leve (mais baixa nos quadros 2 e 6, mais alta nos 4 e 8), as pontas do lenço balançando.',
    extra: `Ela anda nessa direção (${P_RUMO[vista]}) sem sair do lugar.`,
  });
  pedidos[`personagem-correr-${vista}`] = ciclo({
    arquivo: `correr-${vista}.png`, titulo: 'CORRENDO', vista, n: 8, quadros: CORRER, refs: fmt('correr'),
    vivo: 'É uma CORRIDA de verdade, bem diferente de andar: o tronco inclinado para a frente, passadas muito largas, joelhos altos, braços dobrados em ângulo reto bombeando com força (sempre opostos às pernas), punhos fechados, as pontas do lenço voando para trás. Nos quadros 4 e 8 ela está no ar.',
    extra: `Ela corre nessa direção (${P_RUMO[vista]}) sem sair do lugar.`,
  });
  pedidos[`personagem-carregar-${vista}`] = ciclo({
    arquivo: `carregar-${vista}.png`, titulo: 'ANDANDO E CARREGANDO O CESTO', vista, n: 8, quadros: CARREGAR, refs: ['- `referencias/ferramentas.png`: a FOLHA DE MODELO das ferramentas, com a personagem ao lado para dar o tamanho. O cesto tem de sair igual ao da folha.', ...fmt('carregar')],
    vivo: 'Ela leva o CESTO de vime da folha de ferramentas com as DUAS MÃOS, na frente do corpo, na altura da barriga, com os cotovelos dobrados. O cesto está VAZIO (o jogo desenha o que vai dentro). Anda com peso: passada um pouco mais curta, o tronco inclinado de leve para trás, o cesto subindo e descendo com o passo, a cabeça subindo e descendo (mais baixa nos quadros 2 e 6, mais alta nos 4 e 8), as pontas do lenço balançando.',
    extra: `Ela anda nessa direção (${P_RUMO[vista]}) sem sair do lugar.${vista === 'costas' ? ' De costas, o corpo dela esconde quase todo o cesto: aparecem os cotovelos abertos e as bordas do cesto dos dois lados da cintura.' : ''}`,
    maos: 'O cesto é o mesmo e do mesmo tamanho em todos os quadros.',
  });

  pedidos[`personagem-enxadar-${vista}`] = acao({
    arquivo: `enxadar-${vista}.png`, titulo: 'CAPINANDO COM A ENXADA', uso: 'quando ela prepara a terra', vista, n: 6, refs: fmt('enxadar'),
    ferramenta: 'a ENXADA da folha de ferramentas (cabo de madeira comprido, lâmina de ferro), segura com as DUAS MÃOS.',
    quadros: [
      'PREPARA: em pé, um pé um pouco à frente do outro, joelhos soltos; segura a enxada atravessada na frente do corpo, com a lâmina na altura do joelho.',
      'ERGUE: levanta a enxada acima do ombro; o corpo se estica e inclina um pouco para trás; o peso vai para a perna de trás.',
      'TOPO: a enxada no ponto mais alto, lâmina acima da cabeça, braços quase esticados para cima. É a antecipação do golpe.',
      'GOLPE: a enxada desce depressa; o tronco dobra para a frente, os joelhos dobram, o peso passa para a perna da frente.',
      'CRAVA: a lâmina bate no chão à frente dela; tronco bem inclinado, braços esticados para baixo, joelhos bem dobrados. É o ponto mais BAIXO do corpo.',
      'PUXA: ela puxa a enxada para perto dos pés e começa a endireitar o corpo. Emenda no quadro 1.',
    ],
    vivo: 'Movimento com peso e antecipação: ela se estica para trás antes de bater, dobra o corpo inteiro no golpe e volta. Cabeça, ombros e quadril mudam de altura de um quadro para o outro.',
  });
  pedidos[`personagem-semear-${vista}`] = acao({
    arquivo: `semear-${vista}.png`, titulo: 'SEMEANDO', uso: 'quando ela planta uma semente na terra arada', vista, n: 6, refs: fmt('semear'),
    ferramenta: 'o SAQUINHO DE SEMENTES da folha de ferramentas (saco pequeno de pano cru), seguro na mão esquerda, junto à cintura.',
    quadros: [
      'PEGA: em pé, o saquinho na mão esquerda junto à cintura; a mão direita entra no saquinho. Ela olha para o saquinho.',
      'TIRA: a mão direita sai fechada, com as sementes dentro (não aparecem), e sobe um pouco; o corpo se apruma.',
      'ABAIXA: dobra bem os joelhos e inclina o tronco para a frente; a mão direita desce na direção do chão.',
      'SOLTA: agachada, a mão direita aberta perto do chão, soltando as sementes. É o ponto mais BAIXO do corpo.',
      'COBRE: ainda agachada, a mão direita espalmada dá um tapinha na terra, um pouco para o lado.',
      'LEVANTA: endireita as pernas e o tronco; a mão direita volta para o saquinho. Emenda no quadro 1.',
    ],
    vivo: 'Movimento vivo: ela se apruma antes de abaixar, agacha de verdade (o quadril desce, os joelhos abrem) e levanta. A cabeça acompanha a mão.',
    semObjeto: 'NÃO desenhe sementes, nem terra, nem planta, nem buraco: só a personagem e o saquinho.',
  });
  pedidos[`personagem-regar-${vista}`] = acao({
    arquivo: `regar-${vista}.png`, titulo: 'REGANDO COM O REGADOR', uso: 'quando ela rega a terra plantada', vista, n: 6, refs: fmt('regar'),
    ferramenta: 'o REGADOR da folha de ferramentas (de metal, com alça em cima, alça atrás e bico comprido com crivo), seguro com as duas mãos: uma na alça de cima, outra na alça de trás.',
    quadros: [
      'SEGURA: em pé, o regador na frente do corpo, na altura da cintura, reto, com o bico apontando para a frente.',
      'ERGUE: levanta o regador até o peito e puxa um pouco para trás; o corpo se inclina para trás, o peso vai para a perna de trás (antecipação).',
      'INCLINA: leva o regador para a frente e começa a virar o bico para baixo; o tronco se inclina para a frente.',
      'REGA: o regador bem inclinado, o bico apontando para o chão à frente dela; braços esticados, joelhos dobrados, tronco inclinado. É o ponto mais BAIXO.',
      'ESPALHA: ainda regando, ela balança o regador um pouco para o lado; o peso passa para a outra perna.',
      'VOLTA: levanta o bico, traz o regador de volta para a cintura e endireita o corpo. Emenda no quadro 1.',
    ],
    vivo: 'Movimento com peso: o regador está cheio e pesa; ela usa o corpo todo, inclina para trás antes de derramar e dobra os joelhos ao regar.',
    semObjeto: 'NÃO desenhe água, gotas, respingos nem poça: o jogo faz a água. Só a personagem e o regador.',
  });
  pedidos[`personagem-colher-${vista}`] = acao({
    arquivo: `colher-${vista}.png`, titulo: 'COLHENDO', uso: 'quando ela arranca do chão o que plantou', vista, n: 6, refs: fmt('colher'),
    quadros: [
      'PREPARA: em pé, começa a dobrar os joelhos; os dois braços vão para a frente e para baixo, mãos abertas.',
      'ABAIXA: agachada, joelhos bem dobrados, tronco inclinado; as duas mãos chegam ao chão à frente dos pés.',
      'AGARRA: as duas mãos fechadas junto ao chão, uma ao lado da outra; ombros para a frente. É o ponto mais BAIXO do corpo.',
      'PUXA: ela puxa com força: o corpo joga para trás e para cima, os braços esticados, as mãos fechadas subindo até a altura dos joelhos; a cabeça vai para trás.',
      'LEVANTA: fica em pé, as duas mãos fechadas juntas na frente do peito, como quem segura o que colheu; um pequeno salto de alegria nos ombros.',
      'GUARDA: em pé, leva as mãos para o lado do quadril, como quem põe no cesto, e solta os braços. Emenda no quadro 1.',
    ],
    vivo: 'Movimento com esforço e alegria: abaixa de verdade (o quadril desce quase até os calcanhares), faz força para puxar, joga o corpo para trás e levanta.',
    semObjeto: 'As mãos estão VAZIAS: NÃO desenhe planta, raiz, fruto, terra nem cesto. O jogo desenha o que foi colhido.',
  });
  pedidos[`personagem-manivela-${vista}`] = acao({
    arquivo: `manivela-${vista}.png`, titulo: 'GIRANDO UMA MANIVELA', uso: 'quando ela puxa água do poço', vista, n: 6, refs: fmt('manivela'),
    quadros: [
      'ALTO: as duas mãos fechadas, juntas, no ponto mais alto do círculo: na altura do peito, à frente do corpo. Corpo ereto.',
      'FRENTE: as mãos vão para a frente e começam a descer; os braços esticam, o tronco se inclina para a frente.',
      'DESCE: as mãos na frente, na altura da cintura, descendo; os joelhos dobram, o peso vai para a perna da frente.',
      'BAIXO: as mãos no ponto mais baixo do círculo, na altura das coxas; tronco inclinado, joelhos dobrados. É o ponto mais BAIXO do corpo.',
      'VOLTA: as mãos vêm para perto do corpo e começam a subir; os cotovelos dobram para trás, o peso vai para a perna de trás.',
      'SOBE: as mãos sobem junto ao corpo até o peito; o tronco endireita. Emenda no quadro 1.',
    ],
    vivo: 'Ela gira com as duas mãos o cabo de uma manivela pesada, como a de um poço: as mãos juntas descrevem um CÍRCULO grande na frente do corpo (alto, frente, baixo, perto, alto). Faz força: os ombros giram, os joelhos dobram quando as mãos descem, o corpo balança para a frente e para trás.',
    semObjeto: 'NÃO desenhe a manivela, nem o poço, nem corda, nem balde: as mãos fechadas seguram um cabo que não aparece (o poço do jogo já tem a manivela).',
  });
}

// ---------- personagem: trato e ofícios ----------
for (const vista of ['frente', 'costas']) {
  const fmt = vista === 'costas' ? (n) => [`- \`referencias/${n}-frente.png\`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).`] : () => [];
  pedidos[`personagem-alimentar-${vista}`] = acao({
    arquivo: `alimentar-${vista}.png`, titulo: 'JOGANDO MILHO PARA AS GALINHAS', uso: 'quando ela trata dos bichos', vista, n: 6, refs: fmt('alimentar'),
    ferramenta: 'o BALDE de metal da folha de ferramentas, seguro pela alça na mão esquerda, ao lado do corpo, na altura do quadril.',
    quadros: [
      'PEGA: em pé, o balde na mão esquerda ao lado do corpo; a mão direita entra no balde. Ela olha para o balde.',
      'ARMA: tira a mão direita fechada, cheia, e leva o braço para trás e para o lado; o tronco gira para trás, o peso vai para a perna de trás (antecipação).',
      'LANÇA: o braço direito varre para a frente num arco largo; o tronco gira para a frente, o peso passa para a perna da frente.',
      'SOLTA: o braço direito esticado à frente, a mão aberta com os dedos espalhados; o corpo inclinado para a frente. É o ponto de maior alcance.',
      'SEGUE: o braço continua o arco e desce para o outro lado, mão aberta; ela sorri olhando para onde jogou.',
      'VOLTA: o corpo endireita e a mão direita volta para o balde. Emenda no quadro 1.',
    ],
    vivo: 'Gesto largo de semeador: arma para trás, varre para a frente com o corpo todo e segue o movimento. O balde balança um pouco na outra mão.',
    semObjeto: 'NÃO desenhe milho, grãos, pontinhos voando nem galinhas: o jogo faz os grãos. Só a personagem e o balde.',
  });
  pedidos[`personagem-martelar-${vista}`] = acao({
    arquivo: `martelar-${vista}.png`, titulo: 'MARTELANDO', uso: 'quando ela constrói ou conserta alguma coisa na bancada', vista, n: 6, refs: fmt('martelar'),
    ferramenta: 'o MARTELO da folha de ferramentas (cabo curto de madeira, cabeça de ferro), na mão direita.',
    quadros: [
      'APONTA: em pé, joelhos soltos, o tronco um pouco inclinado; a mão esquerda à frente, na altura da cintura, como quem segura um prego numa peça que não aparece; o martelo encostado perto da mão esquerda.',
      'ERGUE: o martelo sobe até a altura do ombro; o corpo se estica um pouco.',
      'TOPO: o martelo acima da cabeça, cotovelo dobrado, braço armado. É a antecipação.',
      'DESCE: o martelo desce depressa; o tronco acompanha para a frente.',
      'BATE: o martelo bate à frente dela, na altura da cintura, logo ao lado da mão esquerda; ombros para baixo, joelhos dobrados. É o ponto mais BAIXO.',
      'QUICA: o martelo volta um palmo para cima com o tranco; o corpo sobe um pouco. Emenda no quadro 1.',
    ],
    vivo: 'Batida seca, com peso: arma no alto, desce com o ombro e o tronco, e o martelo quica depois de bater.',
    semObjeto: 'NÃO desenhe prego, tábua, bancada, estrelinhas nem faíscas: só a personagem e o martelo. O que ela martela fica à frente dela, na altura da cintura, e é desenhado pelo jogo.',
  });
  pedidos[`personagem-colher-fruta-${vista}`] = acao({
    arquivo: `colher-fruta-${vista}.png`, titulo: 'COLHENDO UMA FRUTA NO ALTO', uso: 'quando ela apanha fruta de uma árvore', vista, n: 6, refs: fmt('colher-fruta'),
    quadros: [
      'OLHA: em pé, a cabeça erguida olhando para cima e para a frente; o braço direito começa a subir.',
      'ESTICA: o braço direito sobe esticado para o alto e para a frente; ela sobe na ponta dos pés; o braço esquerdo abre para equilibrar.',
      'ALCANÇA: na ponta dos pés, o corpo todo esticado, a mão direita aberta no ponto mais alto, bem acima da cabeça. É o ponto mais ALTO do corpo.',
      'APANHA: a mão direita fecha lá no alto (segura a fruta, que não aparece) e dá uma torcida; ela ainda na ponta dos pés.',
      'DESCE: os calcanhares voltam ao chão, os joelhos dobram de leve; a mão fechada desce até a frente do peito e ela olha para a mão, contente.',
      'GUARDA: leva a mão para o lado do quadril, como quem põe no cesto, e solta o braço. Emenda no quadro 1.',
    ],
    vivo: 'Ela se estica de verdade (ponta dos pés, braço e corpo numa linha só) e depois relaxa. Os pés não saem do lugar.',
    semObjeto: 'A mão está VAZIA: NÃO desenhe fruta, galho, folha, árvore nem cesto. O jogo desenha a árvore e a fruta.',
  });
  pedidos[`personagem-machado-${vista}`] = acao({
    arquivo: `machado-${vista}.png`, titulo: 'CORTANDO COM O MACHADO', uso: 'quando ela corta um toco ou uma árvore para limpar o terreno', vista, n: 6, refs: fmt('machado'),
    ferramenta: 'o MACHADO da folha de ferramentas (cabo de madeira, lâmina de ferro em cunha), seguro com as DUAS MÃOS.',
    quadros: [
      'PREPARA: em pé, pernas afastadas, um pé à frente; o machado atravessado na frente do corpo, nas duas mãos.',
      'ERGUE: leva o machado para trás e para cima, por cima do ombro; o tronco gira para trás, o peso vai para a perna de trás.',
      'TOPO: o machado no alto, atrás da cabeça, braços dobrados, corpo esticado e torcido. É a antecipação.',
      'GOLPE: o machado desce na diagonal, depressa; o tronco gira e dobra para a frente, o peso passa para a perna da frente.',
      'CRAVA: a lâmina bate embaixo, à frente dela, na altura dos joelhos (num toco que não aparece); braços esticados, joelhos dobrados. É o ponto mais BAIXO.',
      'ARRANCA: ela puxa o machado de volta com um tranco e começa a endireitar o corpo. Emenda no quadro 1.',
    ],
    vivo: 'Golpe forte, de corpo inteiro: torce para trás, desce na diagonal com o peso do corpo e arranca o machado de volta.',
    semObjeto: 'NÃO desenhe toco, tronco, árvore, lascas nem cavacos: só a personagem e o machado.',
  });
  pedidos[`personagem-picareta-${vista}`] = acao({
    arquivo: `picareta-${vista}.png`, titulo: 'QUEBRANDO PEDRA COM A PICARETA', uso: 'quando ela quebra uma pedra para limpar o terreno', vista, n: 6, refs: fmt('picareta'),
    ferramenta: 'a PICARETA da folha de ferramentas (cabo de madeira, ferro curvo com duas pontas), segura com as DUAS MÃOS.',
    quadros: [
      'PREPARA: em pé, pernas bem afastadas; a picareta atravessada na frente do corpo, nas duas mãos, com o ferro na altura da cintura.',
      'ERGUE: levanta a picareta por cima da cabeça; o corpo se estica e inclina para trás.',
      'TOPO: a picareta no ponto mais alto, braços esticados para cima, ferro atrás da cabeça. É a antecipação.',
      'GOLPE: a picareta desce reta e depressa; o tronco dobra para a frente, os joelhos dobram.',
      'BATE: a ponta bate no chão logo à frente dos pés (numa pedra que não aparece); tronco bem inclinado, braços esticados para baixo. É o ponto mais BAIXO.',
      'TRANCO: a picareta quica um palmo para cima com o tranco; ela começa a endireitar o corpo. Emenda no quadro 1.',
    ],
    vivo: 'Golpe pesado, de cima para baixo: estica o corpo todo para trás, desce com tudo e a picareta quica na pedra.',
    semObjeto: 'NÃO desenhe pedra, lascas, faíscas nem poeira: só a personagem e a picareta.',
  });
}

// ---------- personagem: ordenha (sentada no banquinho; nasce da folha de modelo da interação) ----------
for (const vista of ['frente', 'costas']) {
  const n = 6;
  pedidos[`personagem-ordenhar-${vista}`] = `${CABECA}
${P_MODELO}
${P_FERRAMENTAS.replace('A ferramenta deste pedido tem', 'O balde de leite e o banquinho de ordenha têm').replace('igual à da folha', 'iguais aos da folha')}
- \`referencias/ordenha.png\`: a FOLHA DE MODELO DA ORDENHA (a personagem sentada no banquinho ordenhando a vaca, vista por trás dela, pela frente dela, e a pose dela sozinha). Ela manda na pose, na posição do banquinho e do balde.
${vista === 'costas' ? '- `referencias/ordenhar-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).\n' : ''}
Preciso da folha de animação da MESMA personagem ORDENHANDO, sentada no banquinho, vista ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo. A VACA NÃO APARECE nesta folha: o jogo desenha a vaca à parte, ${vista === 'frente' ? 'na frente dela' : 'atrás dela'}.

Gere uma imagem e salve na pasta atual como \`ordenhar-${vista}.png\`:

- Uma única fileira horizontal com ${n + 1} figuras, da esquerda para a direita:
  - Figura 1 (referência de tamanho): ela PARADA EM PÉ, igual à folha de modelo, pés juntos, braços soltos, mãos vazias, sem banquinho e sem balde.
  - Figuras 2 a ${n + 1}: os ${n} quadros da ordenha. Em todos ela está SENTADA no banquinho de três pés, joelhos dobrados e abertos, os dois pés no chão, o tronco inclinado para a frente, os dois braços esticados para a frente e para baixo com as mãos fechadas (segurando as tetas, que não aparecem), e o balde de leite no chão à frente dela, entre os pés. Nesta ordem:
    1. A mão DIREITA desce, puxando; a mão esquerda está no alto. O ombro direito desce junto.
    2. A mão direita no ponto mais BAIXO, quase na boca do balde; o tronco balança para esse lado, a cabeça inclina.
    3. A mão direita sobe de volta; a mão ESQUERDA começa a descer. O tronco volta ao meio.
    4. A mão ESQUERDA desce, puxando; a mão direita está no alto. O ombro esquerdo desce junto.
    5. A mão esquerda no ponto mais BAIXO; o tronco balança para o outro lado, a cabeça inclina para lá.
    6. A mão esquerda sobe de volta; a mão direita começa a descer. Emenda no quadro 1.
- Movimento ritmado e vivo: as mãos sobem e descem alternadas, uma de cada vez; os ombros acompanham, o tronco balança de um lado para o outro, a cabeça segue as mãos, as pontas do lenço balançam.
- Em todas as figuras ela é vista pela mesma câmera da cena (isométrica, de cima), ${P_VISTA[vista]}. ${vista === 'frente' ? 'É a terceira pose da folha de modelo da ordenha (ela sozinha, de frente).' : 'É como no primeiro desenho da folha de modelo da ordenha (visto por trás dela), mas SEM a vaca: o corpo dela esconde parte dos braços e do balde; aparecem os cotovelos subindo e descendo e as bordas do balde entre as pernas.'}
- Nos ${n} quadros da ordenha o BANQUINHO, o BALDE e os dois PÉS ficam exatamente no MESMO LUGAR; só os braços, os ombros, o tronco e a cabeça se mexem.
- As ${n + 1} figuras na MESMA escala (a cabeça tem o mesmo tamanho em todas), os pés na mesma linha de base, igualmente espaçadas, cada uma centrada numa casa de mesma largura, com um vão vazio entre uma e outra (nenhuma encosta na vizinha).
- ${P_MESMA}
- O BANQUINHO DE ORDENHA (madeira, redondo, três pés, da altura da canela dela) e o BALDE DE LEITE (metal cinza-claro, com alça de arame, da altura do joelho dela) são os da folha de ferramentas, inteiros e do mesmo tamanho em todos os quadros da ordenha.
- NÃO desenhe a vaca, nem úbere, nem tetas, nem leite, nem jatos, nem gotas: só a personagem, o banquinho e o balde.
- ${LIMPO}
${FIM}
`;
}

// ---------- bichos ----------

const B_VISTA = {
  frente: 'de FRENTE três quartos, exatamente como a primeira figura da folha de modelo: o corpo virado para a esquerda de quem olha e para a câmera, a cara aparece',
  costas: 'de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás',
};
// Folha de um bicho. plantado: as patas não saem do lugar (parada, ciscar, pastar); senão é um ciclo de andar.
function bicho({ nome, artigo = 'a', modelo, igual, arquivo, titulo, n, quadros, vivo, vista, plantado, refs = [], semObjeto = '', grade = false }) {
  return `${CABECA}
- \`referencias/${modelo}.png\`: a FOLHA DE MODELO d${artigo} ${nome} (parad${artigo} de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
${refs.join('\n')}${refs.length ? '\n' : ''}
Preciso da folha de animação d${artigo} MESM${artigo.toUpperCase()} ${nome} ${titulo}, vist${artigo} ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como \`${arquivo}\`:

- ${grade ? `DUAS fileiras horizontais, uma em cima da outra, com ${n / 2} quadros cada: a fileira de CIMA tem os quadros 1 a ${n / 2}, a de BAIXO tem os quadros ${n / 2 + 1} a ${n}, sempre da esquerda para a direita. As duas fileiras bem separadas por uma faixa vazia (nada de uma fileira encosta na outra)` : `Uma única fileira horizontal com ${n} quadros, da esquerda para a direita`}, nesta ordem:
${quadros.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}
- ${vivo}
- Em todos os quadros el${artigo} é vist${artigo} pela mesma câmera da cena (isométrica, de cima), ${B_VISTA[vista]}. ${plantado ? `El${artigo} NÃO sai do lugar: as patas ficam plantadas no mesmo ponto em todos os quadros.` : `El${artigo} anda nessa direção (${P_RUMO[vista]}) sem sair do lugar.`}
- Os ${n} quadros têm ${artigo} ${nome} do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É ${artigo} MESM${artigo.toUpperCase()} ${nome} da folha de modelo em todos os quadros: ${igual} Mesmas cores chapadas, mesmo traço escuro grosso.
${semObjeto ? `- ${semObjeto}\n` : ''}- ${LIMPO}
${grade ? FIM.replace('Imagem bem larga (proporção perto de 3 por 1)', 'Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço') : FIM}
`;
}

const GALINHA = { nome: 'galinha', modelo: 'galinha', igual: 'corpo branco gordinho, crista e barbela vermelhas, bico amarelo-alaranjado, olho preto, asa marcada, rabo curto erguido, pernas finas amarelo-alaranjadas.' };
const VACA = { nome: 'vaca', modelo: 'vaca', igual: 'branca com as MESMAS manchas pretas nos mesmos lugares, focinho rosa, chifres curtos, orelhas para os lados, úbere rosa, rabo com tufo preto, cascos cinza-escuros.' };
const ANDAR4 = (b) => [
  `PASSO 1: a pata da frente do lado da câmera avança e toca o chão; a pata de trás do outro lado avança junto. As outras duas ficam para trás, empurrando.`,
  `PESO: o corpo passa por cima das patas apoiadas e desce um pouco; as patas que estavam atrás saem do chão.`,
  `PASSAGEM: as duas patas no ar passam dobradas embaixo do corpo; o lombo sobe um pouco.`,
  `ESTICA: as patas no ar se esticam para a frente, quase tocando o chão.`,
  `PASSO 2: agora é a pata da frente do lado de lá que toca o chão à frente, junto com a pata de trás do lado da câmera.`,
  `PESO do outro lado: o corpo desce um pouco.`,
  `PASSAGEM do outro lado: as outras duas patas passam dobradas embaixo do corpo.`,
  `ESTICA do outro lado. O quadro 8 emenda no quadro 1.`,
];
for (const vista of ['frente', 'costas']) {
  const fmt = (b, n) => (vista === 'costas' ? [`- \`referencias/${n}-frente.png\`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui o bicho é visto de costas).`] : []);
  pedidos[`galinha-parada-${vista}`] = bicho({
    ...GALINHA, arquivo: `parada-${vista}.png`, titulo: 'PARADA, olhando em volta', vista, n: 4, plantado: true,
    quadros: [
      'DESCANSO: em pé, igual à folha de modelo, bico fechado.',
      'ESPICHA: o pescoço estica e a cabeça vai para a frente e para cima, atenta; o rabo sobe um pouco.',
      'VIRA: a cabeça vira de lado e inclina, olhando com um olho só, do jeito das galinhas.',
      'AFOFA: a cabeça volta, o corpo se abaixa um tiquinho e as penas afofam (o corpo fica um pouco mais redondo); olho fechado (uma linha curva).',
    ],
    vivo: 'Movimentos curtos e secos de galinha: só o pescoço, a cabeça, o rabo e as penas se mexem; o corpo quase não sai do lugar e as duas patas ficam plantadas.',
  });
  pedidos[`galinha-andar-${vista}`] = bicho({
    ...GALINHA, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO', vista, n: 6, refs: fmt('galinha', 'andar'),
    quadros: [
      'CONTATO: uma pata esticada à frente, tocando o chão; a outra atrás. A cabeça está recuada, junto ao corpo.',
      'PESO: o corpo passa por cima da pata da frente e desce um pouco; a cabeça avança num tranco para a frente.',
      'PASSAGEM: a pata de trás sobe dobrada, com os dedos fechados, e passa ao lado da outra; a cabeça fica esticada à frente.',
      'CONTATO do outro lado: a outra pata esticada à frente, tocando o chão. A cabeça recua.',
      'PESO do outro lado: o corpo desce um pouco; a cabeça avança num tranco.',
      'PASSAGEM do outro lado: a pata de trás sobe dobrada e passa. O quadro 6 emenda no quadro 1.',
    ],
    vivo: 'Andar de galinha, engraçado e vivo: a cabeça vai e vem a cada passo (avança, para, avança), o corpo gingando de um lado para o outro, o rabo balançando, as patas subindo bem dobradas.',
  });
  pedidos[`galinha-ciscar-${vista}`] = bicho({
    ...GALINHA, arquivo: `ciscar-${vista}.png`, titulo: 'CISCANDO E BICANDO O CHÃO', vista, n: 6, plantado: true, refs: fmt('galinha', 'ciscar'),
    quadros: [
      'OLHA: em pé, a cabeça inclinada para baixo, olhando o chão à frente.',
      'CISCA 1: uma pata risca o chão para trás (a perna estica para trás, dedos abertos); o corpo se inclina para a frente.',
      'CISCA 2: a outra pata risca o chão para trás; o corpo balança para o outro lado.',
      'ABAIXA: o corpo tomba para a frente, o rabo sobe bem alto, o pescoço desce.',
      'BICA: o bico toca o chão logo à frente das patas; o rabo é o ponto mais alto do corpo.',
      'LEVANTA: a cabeça sobe com o bico entreaberto, engolindo; o corpo volta a ficar reto. Emenda no quadro 1.',
    ],
    vivo: 'Movimento vivo: o corpo inteiro tomba para a frente na bicada (cabeça embaixo, rabo em cima) e volta.',
    semObjeto: 'NÃO desenhe milho, grãos, minhoca, terra voando nem buraco: só a galinha.',
  });
  const jeito = [`- \`referencias/parada-${vista}.png\`: a folha já pronta da mesma vaca parada, nesta mesma vista (dá o formato da folha, o tamanho e o jeito do desenho: a vaca tem de sair igual a esta).`];
  pedidos[`vaca-parada-${vista}`] = bicho({
    ...VACA, arquivo: `parada-${vista}.png`, titulo: 'PARADA, ruminando', vista, n: 4, plantado: true,
    quadros: [
      'DESCANSO: em pé nas quatro patas, igual à folha de modelo, cabeça erguida, rabo caído.',
      'RUMINA: a boca mastiga de lado (o queixo vai para um lado); uma orelha abaixa; o rabo começa a balançar para um lado.',
      'RESPIRA: a barriga enche um pouco, a cabeça sobe um tiquinho; o rabo no alto do balanço, com o tufo para o lado.',
      'PISCA: os olhos fechados (uma linha curva), o queixo mastiga para o outro lado; a outra orelha abana; o rabo volta.',
    ],
    vivo: 'É uma vaca calma, mas viva: mastiga, pisca, abana as orelhas e o rabo, a barriga respira. As quatro patas ficam plantadas e o corpo não sai do lugar.',
  });
  pedidos[`vaca-andar-${vista}`] = bicho({
    ...VACA, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO', vista, n: 8, quadros: ANDAR4(), refs: [...jeito, ...fmt('vaca', 'andar')],
    vivo: 'Andar pesado e calmo de vaca: as patas em diagonal andam juntas, a cabeça balança para cima e para baixo a cada passo, o lombo sobe e desce de leve, o rabo balança de um lado para o outro, o úbere balança.',
  });
  pedidos[`vaca-pastar-${vista}`] = bicho({
    ...VACA, arquivo: `pastar-${vista}.png`, titulo: 'PASTANDO', vista, n: 6, plantado: true, refs: [...jeito, ...fmt('vaca', 'pastar')],
    quadros: [
      'COMEÇA: em pé, a cabeça começa a descer, o pescoço se estica para a frente e para baixo.',
      'DESCE: a cabeça na altura dos joelhos, o focinho apontando para o chão.',
      'MORDE: o focinho encosta no chão logo à frente das patas da frente; a boca aberta.',
      'ARRANCA: a boca fecha e a cabeça dá um puxão curto para o lado e para cima, ainda perto do chão; o rabo balança.',
      'MASTIGA: a cabeça sobe até a altura dos joelhos, o queixo mastiga de lado; uma orelha abana.',
      'SOBE: a cabeça volta a subir, mastigando. Emenda no quadro 1.',
    ],
    vivo: 'Só o pescoço, a cabeça, as orelhas e o rabo se mexem; o corpo balança de leve para a frente quando a cabeça desce.',
    semObjeto: 'NÃO desenhe capim, folhas, chão nem cocho: só a vaca.',
  });
}

// ---------- folhas de modelo dos outros bichos e das interações ----------

function modeloBicho({ arquivo, nome, artigo = 'a', oQueE, descricao, refs = [], sem = '', pose }) {
  const o = artigo === 'a' ? 'a' : 'o';
  return `${CABECA}
- \`referencias/personagem.png\`: a folha de modelo da personagem do jogo (dá o traço, o acabamento e o formato de uma folha de modelo).
${refs.join('\n')}${refs.length ? '\n' : ''}
Preciso da FOLHA DE MODELO d${o} ${nome} do jogo${oQueE ? `: ${oQueE}` : ''}. Ela vai ser anexada a todos os pedidos de animação dess${o === 'a' ? 'a figura' : 'e bicho'}, para sair sempre igual.

Gere uma imagem e salve na pasta atual como \`${arquivo}\`:

- Uma única fileira horizontal com 3 figuras d${o} MESM${o.toUpperCase()} ${nome}, parad${o} em pé nas quatro patas, da esquerda para a direita:
  1. de FRENTE três quartos: o corpo virado para a esquerda de quem olha e para a câmera; vê-se a cara de frente, o peito, um lado inteiro do corpo e as quatro patas;
  2. de COSTAS três quartos: o corpo virado para o fundo e para a direita de quem olha; vê-se a traseira e o rabo em primeiro plano, um lado do corpo, e a cabeça lá na frente, vista de trás;
  3. de PERFIL: o corpo todo de lado, com a cabeça para a esquerda de quem olha.
- As três são vistas pela mesma câmera da cena (isométrica, de cima, a cerca de 35 graus).
- ${descricao} Os MESMOS detalhes, nos mesmos lugares, nas três vistas.
- As três do mesmo tamanho e com as mesmas proporções, o lombo na mesma altura, as patas na mesma linha de base, bem separadas uma da outra por um vão vazio largo.
- ${pose || 'Pose de descanso nas três: as quatro patas no chão, retas, cabeça erguida, rabo caído.'}
- Mesmo estilo da cena e da personagem: traço escuro grosso, cores chapadas com poucos tons, jeito simpático.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem cerca, sem capim${sem ? `, ${sem}` : ''}, sem números, sem texto, sem setas, sem linhas de grade, sem moldura.
- As figuras inteiras dentro da imagem, sem cortar nada. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
`;
}

const D_OVELHA = 'A ovelha: lanuda e simpática, corpo redondo e fofo coberto de LÃ creme-clara em tufos arredondados (o contorno do corpo parece uma nuvem), com um topete de lã na testa; cara castanho-escura sem lã, olhos pretos redondos, orelhas castanho-escuras caídas para os lados, quatro patas curtas e finas castanho-escuras com cascos pretos, rabinho curto de lã. É um bicho de porte médio: bem menor que uma vaca.';
const D_TOSQUIADA = 'É a MESMA ovelha da folha de modelo anexa, logo DEPOIS DA TOSQUIA: sem a lã comprida, o corpo fica bem mais magro e liso, de cor creme-rosada clara, com algumas linhas curtas marcando a lã cortada rente; sobra só um topetinho curto de lã na testa e um tufinho na ponta do rabo. A mesma cara castanho-escura, as mesmas orelhas caídas, as mesmas patas castanho-escuras com cascos pretos. A cabeça e as patas têm o MESMO tamanho das da ovelha com lã; só o corpo emagrece.';
const D_BOI = 'O boi de trabalho: grande e forte, um pouco maior e mais largo que a vaca do jogo, pelo cor de caramelo (castanho-avermelhado claro) com o focinho e a barriga mais claros, pescoço grosso com um cupim pequeno, dois chifres claros maiores que os da vaca, orelhas para os lados, SEM úbere, rabo comprido com tufo escuro, cascos escuros. Ele usa uma COALHEIRA de couro e madeira no pescoço, de onde saem dois tirantes de corrente, um de cada lado do corpo, até o ARADO que vem logo atrás dele: arado simples de madeira, com um só ferro cinza (a aiveca) apontado para o chão e duas rabiças (cabos) de madeira voltadas para trás e para cima. O arado FAZ PARTE da figura nas três vistas, sempre atrás do boi e ligado a ele pelos tirantes.';
const D_CAVALO = 'O cavalo de sela: simpático, pelo castanho com a crina e o rabo castanho-escuros e compridos, uma listra branca na testa, quatro meias brancas acima dos cascos, cascos escuros, olhos pretos redondos, orelhas pontudas em pé. Estilizado como os outros bichos do jogo: cabeça grande, pernas firmes, não muito finas. Ele usa SELA de couro marrom sobre uma manta vermelha, com cilha na barriga e um estribo pendurado de cada lado, e uma cabeçada de couro com as rédeas apoiadas no pescoço. A sela e os arreios FAZEM PARTE da figura nas três vistas. NINGUÉM montado.';
const D_JUMENTO = 'O jumento: pequeno e robusto, pelo cinza com o focinho, a barriga e a volta dos olhos brancos, orelhas bem compridas em pé, crina curta e escura em pé, uma listra escura ao longo do lombo, rabo fino com tufo escuro na ponta, cascos escuros, olhos pretos redondos. Ele está atrelado a uma CARROÇA pequena de madeira, de DUAS RODAS: caixa de tábuas castanho-claras, aberta em cima e VAZIA; duas rodas grandes de madeira com raios e aro de ferro; dois varais de madeira que saem da carroça e passam um de cada lado do jumento, presos a uma coalheira de couro no pescoço dele. A carroça FAZ PARTE da figura nas três vistas, sempre logo atrás do jumento. Ninguém na carroça.';
const D_CACHORRO = 'O cachorro: vira-lata caramelo de porte médio, simpático e esperto, pelo curto cor de caramelo com o peito, a ponta das quatro patas e a ponta do rabo brancos, focinho um pouco mais escuro com nariz preto, olhos pretos redondos, orelhas dobradas (caídas na ponta), rabo comprido curvado para cima, coleira vermelha.';
const D_GATO = 'O gato: gato de sítio laranja rajado (listras laranja-escuras no lombo, na cabeça e no rabo), com o peito, o focinho e a ponta das patas brancos, orelhas pontudas rosa por dentro, olhos verdes grandes, nariz rosa, bigodes, rabo comprido listrado. É pequeno e esguio.';

pedidos['modelo-ovelha'] = modeloBicho({ arquivo: 'modelo-ovelha.png', nome: 'OVELHA', oQueE: 'a ovelha com lã', descricao: D_OVELHA, sem: 'sem sino', pose: 'Pose de descanso nas três: as quatro patas no chão, retas, cabeça erguida.' });
pedidos['modelo-ovelha-tosquiada'] = modeloBicho({ arquivo: 'modelo-ovelha-tosquiada.png', nome: 'OVELHA TOSQUIADA', oQueE: 'a mesma ovelha depois de tosquiada', descricao: D_TOSQUIADA, sem: 'sem lã no chão, sem tesoura',
  refs: ['- `referencias/ovelha.png`: a FOLHA DE MODELO da ovelha com lã. A tosquiada é a mesma ovelha, com as mesmas três vistas, na mesma ordem e do mesmo tamanho.'], pose: 'Pose de descanso nas três: as quatro patas no chão, retas, cabeça erguida.' });
pedidos['modelo-boi'] = modeloBicho({ arquivo: 'modelo-boi.png', nome: 'BOI COM ARADO', artigo: 'o', oQueE: 'o boi de trabalho que puxa o arado', descricao: D_BOI, sem: 'sem terra, sem sulco, sem ninguém segurando o arado',
  refs: ['- `referencias/vaca.png`: a folha de modelo da vaca do jogo (dá o jeito de desenhar o gado: o boi é da mesma família de desenho, mas é outro bicho, maior e de outra cor).'] });
pedidos['modelo-cavalo'] = modeloBicho({ arquivo: 'modelo-cavalo.png', nome: 'CAVALO COM SELA', artigo: 'o', oQueE: 'o cavalo de montaria, selado', descricao: D_CAVALO, sem: 'sem cavaleiro',
  refs: ['- `referencias/vaca.png`: a folha de modelo da vaca do jogo (dá o jeito de desenhar os bichos grandes e o tamanho: o cavalo tem o lombo um pouco mais alto que o da vaca).'], pose: 'Pose de descanso nas três: as quatro patas no chão, retas, cabeça erguida, rabo caído, rédeas apoiadas no pescoço.' });
pedidos['modelo-jumento'] = modeloBicho({ arquivo: 'modelo-jumento.png', nome: 'JUMENTO COM CARROÇA', artigo: 'o', oQueE: 'o jumento atrelado à carroça de duas rodas', descricao: D_JUMENTO, sem: 'sem carga, sem condutor',
  refs: ['- `referencias/vaca.png`: a folha de modelo da vaca do jogo (dá o jeito de desenhar os bichos; o jumento é bem menor que a vaca).'] });
pedidos['modelo-cachorro'] = modeloBicho({ arquivo: 'modelo-cachorro.png', nome: 'CACHORRO', artigo: 'o', oQueE: 'o cachorro do sítio', descricao: D_CACHORRO, sem: 'sem osso, sem casinha',
  refs: ['- `referencias/galinha.png`: a folha de modelo da galinha do jogo (dá o jeito de desenhar os bichos pequenos).'], pose: 'Pose de descanso nas três: em pé nas quatro patas, retas, cabeça erguida, boca fechada, rabo erguido.' });
pedidos['modelo-gato'] = modeloBicho({ arquivo: 'modelo-gato.png', nome: 'GATO', artigo: 'o', oQueE: 'o gato do sítio', descricao: D_GATO, sem: 'sem novelo, sem peixe',
  refs: ['- `referencias/galinha.png`: a folha de modelo da galinha do jogo (dá o jeito de desenhar os bichos pequenos).'], pose: 'Pose de descanso nas três: em pé nas quatro patas, retas, cabeça erguida, rabo erguido com a ponta curvada.' });

// ---------- animações dos outros bichos ----------

const OVELHA = { nome: 'ovelha', modelo: 'ovelha', igual: 'corpo redondo de lã creme em tufos, topete de lã, cara e orelhas castanho-escuras, patas curtas castanho-escuras com cascos pretos, rabinho de lã.' };
const TOSQUIADA = { nome: 'ovelha tosquiada', modelo: 'ovelha-tosquiada', igual: 'corpo magro e liso cor creme-rosada (sem lã), topetinho curto, cara e orelhas castanho-escuras, patas castanho-escuras com cascos pretos.' };
const BOI = { nome: 'boi com o arado', artigo: 'o', modelo: 'boi', igual: 'pelo caramelo, focinho claro, chifres claros, cupim pequeno, coalheira no pescoço, tirantes de corrente e o ARADO de madeira com ferro cinza e duas rabiças logo atrás dele, sempre inteiro e do mesmo tamanho.' };
const CAVALO = { nome: 'cavalo selado', artigo: 'o', modelo: 'cavalo', igual: 'pelo castanho, crina e rabo castanho-escuros, listra branca na testa, quatro meias brancas, sela de couro marrom sobre manta vermelha, estribos, cabeçada e rédeas.' };
const JUMENTO = { nome: 'jumento com a carroça', artigo: 'o', modelo: 'jumento', igual: 'pelo cinza, focinho e barriga brancos, orelhas compridas, crina curta escura, coalheira, os dois varais e a CARROÇA de madeira de duas rodas, vazia, logo atrás dele, sempre inteira e do mesmo tamanho.' };
const CACHORRO = { nome: 'cachorro', artigo: 'o', modelo: 'cachorro', igual: 'pelo caramelo, peito, patas e ponta do rabo brancos, orelhas dobradas, nariz preto, coleira vermelha.' };
const GATO = { nome: 'gato', artigo: 'o', modelo: 'gato', igual: 'laranja rajado, peito, focinho e patas brancos, orelhas pontudas, olhos verdes, rabo comprido listrado.' };

// Passo lento de quatro tempos (uma pata de cada vez): é o que mantém as proporções da figura parada.
const PASSO8 = [
  'A pata de TRÁS do lado da câmera (a mais perto de quem olha) sai do chão, dobrada, o casco um pouco levantado. As outras três apoiadas.',
  'Essa pata de trás pousa um pouco à frente. O quadril desse lado desce de leve.',
  'A pata da FRENTE do mesmo lado sai do chão, dobrada no joelho.',
  'Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco.',
  'A pata de TRÁS do lado de lá (a mais longe de quem olha) sai do chão, dobrada.',
  'Essa pata pousa um pouco à frente. O quadril desse lado desce de leve.',
  'A pata da FRENTE do lado de lá sai do chão, dobrada no joelho.',
  'Essa pata da frente pousa um pouco à frente. A cabeça desce um pouco. O quadro 8 emenda no quadro 1.',
];
const PASSO8_VIVO = (extra) => `É um PASSO de quatro tempos, NÃO é trote nem corrida: só UMA pata sai do chão de cada vez; as outras três ficam apoiadas e quase retas, do MESMO comprimento das patas da figura parada. O corpo fica na mesma altura e na mesma inclinação da figura parada, sem se jogar para a frente; corpo, cabeça e patas têm as MESMAS proporções da folha parada anexa. ${extra}`;
// Trotezinho de bicho pequeno, em seis quadros (as patas em diagonal andam juntas).
const TROTE6 = [
  'CONTATO: a pata da frente do lado da câmera e a pata de trás do lado de lá estão à frente, tocando o chão; as outras duas estão para trás.',
  'PESO: o corpo passa por cima das patas apoiadas e desce um pouco; as duas patas de trás do passo saem do chão.',
  'PASSAGEM: as duas patas no ar passam dobradas por baixo do corpo; o lombo sobe um pouco.',
  'CONTATO do outro lado: agora a pata da frente do lado de lá e a pata de trás do lado da câmera tocam o chão à frente.',
  'PESO do outro lado: o corpo desce um pouco.',
  'PASSAGEM do outro lado: as outras duas patas passam dobradas por baixo do corpo. O quadro 6 emenda no quadro 1.',
];
const GALOPE8 = [
  'RECOLHIDO: as quatro patas no ar, dobradas e juntas embaixo da barriga. É o ponto mais ALTO do corpo.',
  'As duas patas de TRÁS descem e tocam o chão, bem embaixo do corpo; as da frente ainda no ar, dobradas.',
  'APOIO ATRÁS: o peso sobre as patas de trás, que dobram; as patas da frente se esticam para a frente.',
  'As patas da FRENTE tocam o chão à frente; o corpo se alonga.',
  'APOIO NA FRENTE: o peso passa para as patas da frente; as de trás saem do chão e vão para trás. É o ponto mais BAIXO do corpo.',
  'IMPULSO: as patas da frente empurram o chão para trás, quase retas; as de trás esticadas para trás, no ar.',
  'ESTICADO: o corpo todo alongado no ar, as patas da frente saindo do chão para trás, as de trás lá atrás.',
  'RECOLHE: as quatro patas começam a se juntar embaixo da barriga. O quadro 8 emenda no quadro 1.',
];

for (const vista of ['frente', 'costas']) {
  const par = (n) => (vista === 'costas' ? [`- \`referencias/${n}-frente.png\`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui o bicho é visto de costas).`] : []);
  const parada = (g, nomeArq) => [`- \`referencias/${nomeArq}-${vista}.png\`: a folha já pronta d${g.artigo === 'o' ? 'o' : 'a'} mesm${g.artigo === 'o' ? 'o' : 'a'} ${g.nome} parad${g.artigo === 'o' ? 'o' : 'a'}, nesta mesma vista (dá o formato da folha, o tamanho e o jeito do desenho: a figura tem de sair igual a esta).`];

  // ovelha com lã e tosquiada
  for (const [chave, G, outra] of [['ovelha', OVELHA, null], ['ovelha-tosquiada', TOSQUIADA, 'ovelha']]) {
    const lanuda = (acao) => (outra ? [`- \`referencias/${outra}-${acao}-${vista}.png\`: a folha já pronta da ovelha COM LÃ na mesma ação e na mesma vista (dá o formato da folha, o tamanho e o movimento: a tosquiada faz o MESMO movimento, quadro a quadro, com a cabeça e as patas do mesmo tamanho).`] : []);
    pedidos[`${chave}-parada-${vista}`] = bicho({
      ...G, arquivo: `parada-${vista}.png`, titulo: 'PARADA, mastigando', vista, n: 4, plantado: true, refs: lanuda('parada'),
      quadros: [
        'DESCANSO: em pé nas quatro patas, igual à folha de modelo, cabeça erguida.',
        'MASTIGA: o queixo vai para um lado, mastigando; uma orelha abana para baixo.',
        'RESPIRA: o corpo enche um pouco, a cabeça sobe um tiquinho e vira de leve; o rabinho mexe.',
        'PISCA: os olhos fechados (uma linha curva), o queixo mastiga para o outro lado; a outra orelha abana.',
      ],
      vivo: 'É uma ovelha calma, mas viva: mastiga, pisca, abana as orelhas e o rabinho, o corpo respira. As quatro patas ficam plantadas e o corpo não sai do lugar.',
    });
    pedidos[`${chave}-andar-${vista}`] = bicho({
      ...G, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO', vista, n: 6, quadros: TROTE6, refs: [...parada(G, 'parada'), ...lanuda('andar'), ...(outra ? [] : par('andar'))],
      vivo: 'Andar miúdo e saltitante de ovelha: passos curtos, o corpo sobe e desce de leve a cada passo, a cabeça balança, as orelhas e o rabinho sacodem. As patas continuam do MESMO comprimento das da folha parada; o corpo e a cabeça têm o mesmo tamanho dela.',
    });
  }

  // boi com arado
  pedidos[`boi-parado-${vista}`] = bicho({
    ...BOI, arquivo: `parado-${vista}.png`, titulo: 'PARADO, esperando', vista, n: 4, plantado: true,
    quadros: [
      'DESCANSO: em pé nas quatro patas, igual à folha de modelo, cabeça erguida, rabo caído, o arado atrás dele.',
      'RUMINA: o queixo mastiga de lado; uma orelha abana; o rabo começa a balançar para um lado.',
      'RESPIRA: o peito enche, a cabeça sobe um pouco e solta o ar pelo focinho; o rabo no alto do balanço.',
      'PISCA: os olhos fechados (uma linha curva); a cabeça baixa de leve; a outra orelha abana; o rabo volta.',
    ],
    vivo: 'É um boi manso e paciente: mastiga, pisca, abana as orelhas e o rabo, o peito respira. As quatro patas ficam plantadas e o ARADO não se mexe: fica exatamente no mesmo lugar em todos os quadros.',
    semObjeto: 'NÃO desenhe terra, sulco, torrões nem ninguém segurando o arado.',
  });
  pedidos[`boi-puxar-${vista}`] = bicho({
    ...BOI, grade: true, arquivo: `puxar-${vista}.png`, titulo: 'PUXANDO O ARADO', vista, n: 8, quadros: PASSO8, refs: [...parada(BOI, 'parado'), ...par('puxar')],
    vivo: PASSO8_VIVO('Ele faz FORÇA para puxar: o pescoço esticado e a cabeça baixa, empurrando a coalheira; os tirantes de corrente sempre esticados; os ombros trabalham, o rabo balança. O arado vem atrás, sempre na mesma distância do boi e na mesma posição, com um leve tranco para cima e para baixo.'),
    semObjeto: 'NÃO desenhe terra, sulco, torrões, poeira nem ninguém segurando o arado: o jogo faz a terra.',
  });

  // cavalo com sela
  pedidos[`cavalo-parado-${vista}`] = bicho({
    ...CAVALO, arquivo: `parado-${vista}.png`, titulo: 'PARADO, esperando', vista, n: 4, plantado: true,
    quadros: [
      'DESCANSO: em pé nas quatro patas, igual à folha de modelo, cabeça erguida, rabo caído.',
      'ORELHAS: uma orelha gira para trás, a cabeça vira de leve; o rabo começa a balançar para um lado.',
      'RESPIRA: o peito enche, a cabeça sobe e sacode de leve a crina; o rabo no alto do balanço.',
      'PISCA: os olhos fechados (uma linha curva), a cabeça baixa um pouco; o rabo volta.',
    ],
    vivo: 'É um cavalo manso e atento: mexe as orelhas, sacode a crina, pisca, balança o rabo, o peito respira. As quatro patas ficam plantadas e o corpo não sai do lugar.',
    semObjeto: 'NINGUÉM montado: a sela vazia.',
  });
  pedidos[`cavalo-andar-${vista}`] = bicho({
    ...CAVALO, grade: true, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO A PASSO', vista, n: 8, quadros: PASSO8, refs: [...parada(CAVALO, 'parado'), ...par('andar')],
    vivo: PASSO8_VIVO('A cabeça balança para cima e para baixo a cada passo, a crina e o rabo balançam, os estribos balançam de leve.'),
    semObjeto: 'NINGUÉM montado: a sela vazia.',
  });
  pedidos[`cavalo-galope-${vista}`] = bicho({
    ...CAVALO, grade: true, arquivo: `galope-${vista}.png`, titulo: 'GALOPANDO', vista, n: 8, quadros: GALOPE8, refs: [...parada(CAVALO, 'parado'), ...par('galope')],
    vivo: 'É um GALOPE de verdade, bem diferente do passo: o corpo se encolhe e se estica, as patas da frente e as de trás trabalham em pares, o pescoço esticado para a frente, a crina e o rabo voando para trás, os estribos sacudindo. O cavalo tem o MESMO tamanho de corpo e de cabeça da folha parada anexa.',
    semObjeto: 'NINGUÉM montado: a sela vazia.',
  });

  // jumento com carroça
  pedidos[`jumento-parado-${vista}`] = bicho({
    ...JUMENTO, arquivo: `parado-${vista}.png`, titulo: 'PARADO, esperando', vista, n: 4, plantado: true,
    quadros: [
      'DESCANSO: em pé nas quatro patas, igual à folha de modelo, cabeça erguida, orelhas em pé, a carroça atrás dele.',
      'ORELHAS: uma orelha comprida tomba para o lado; o rabo começa a balançar.',
      'RESPIRA: o peito enche, a cabeça sobe um pouco; as duas orelhas para trás; o rabo no alto do balanço.',
      'PISCA: os olhos fechados (uma linha curva), a cabeça baixa de leve; a outra orelha tomba; o rabo volta.',
    ],
    vivo: 'É um jumento manso e teimoso: mexe as orelhas compridas, pisca, balança o rabo, o peito respira. As quatro patas ficam plantadas e a CARROÇA não se mexe: fica exatamente no mesmo lugar, com as rodas na mesma posição, em todos os quadros.',
    semObjeto: 'NÃO desenhe carga nem condutor: a carroça vazia.',
  });
  pedidos[`jumento-andar-${vista}`] = bicho({
    ...JUMENTO, grade: true, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO E PUXANDO A CARROÇA', vista, n: 8, quadros: PASSO8, refs: [...parada(JUMENTO, 'parado'), ...par('andar')],
    vivo: PASSO8_VIVO('A cabeça balança para cima e para baixo, as orelhas compridas balançam, o rabo balança. A carroça vem atrás, sempre na mesma distância e do mesmo tamanho; as RODAS GIRAM: os raios mudam de posição um pouco a cada quadro; a caixa da carroça dá um leve tranco para cima e para baixo.'),
    semObjeto: 'NÃO desenhe carga, condutor, poeira nem marcas de roda: a carroça vazia.',
  });

  // cachorro e gato
  for (const [chave, G, parado, sentado, andarVivo] of [
    ['cachorro', CACHORRO,
      ['DESCANSO: em pé nas quatro patas, igual à folha de modelo, boca fechada, rabo erguido.', 'OFEGA: a boca abre e a língua rosa aparece; o rabo abana para um lado; as orelhas sobem um pouco.', 'ABANA: o rabo abana para o outro lado; a cabeça inclina de lado, curiosa; a língua ainda de fora.', 'PISCA: os olhos fechados (uma linha curva), a boca fecha; o rabo no meio do caminho.'],
      ['SENTADO: sentado sobre as patas de trás, as patas da frente retas apoiadas no chão, peito erguido, cabeça alta, boca fechada, rabo no chão para o lado.', 'OFEGA: a boca abre, a língua rosa de fora; o rabo varre o chão para um lado.', 'ABANA: o rabo varre o chão para o outro lado; a cabeça inclina de lado; uma orelha levanta.', 'PISCA: os olhos fechados (uma linha curva), contente; a boca fecha; o rabo volta.'],
      'Trote alegre de cachorro: passos leves, o corpo sobe e desce a cada passo, a língua de fora, as orelhas sacodem, o rabo erguido abanando.'],
    ['gato', GATO,
      ['DESCANSO: em pé nas quatro patas, igual à folha de modelo, rabo erguido com a ponta curvada.', 'RABO: a ponta do rabo curva para um lado; uma orelha gira; a cabeça vira de leve.', 'ESPREGUIÇA: as patas da frente esticam um pouco à frente, o lombo arqueia de leve, o rabo bem alto.', 'PISCA: os olhos fechados (duas linhas curvas), devagar; o rabo curva para o outro lado.'],
      ['SENTADO: sentado sobre as patas de trás, as patas da frente juntas e retas apoiadas no chão, cabeça alta, o rabo enrolado em volta das patas.', 'RABO: a ponta do rabo bate no chão para um lado; uma orelha gira.', 'LAMBE: levanta uma pata da frente até a boca e lambe, a cabeça inclinada.', 'PISCA: a pata volta ao chão; os olhos fechados (duas linhas curvas), devagar; a ponta do rabo bate para o outro lado.'],
      'Andar macio e elegante de gato: passos leves, o lombo ondula de leve, a cabeça quase não balança, o rabo erguido com a ponta balançando.'],
  ]) {
    // o código do jogo chama de "parada" a folha de espera do cachorro e do gato
    pedidos[`${chave}-parada-${vista}`] = bicho({
      ...G, arquivo: `parada-${vista}.png`, titulo: 'PARADO, olhando em volta', vista, n: 4, plantado: true, quadros: parado,
      vivo: `Movimentos pequenos e vivos: só a cabeça, as orelhas, o rabo e o peito se mexem; as quatro patas ficam plantadas e o corpo não sai do lugar.`,
    });
    pedidos[`${chave}-andar-${vista}`] = bicho({
      ...G, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO', vista, n: 6, quadros: TROTE6, refs: [...parada(G, 'parada'), ...par('andar')],
      vivo: `${andarVivo} As patas continuam do MESMO comprimento das da folha parada; o corpo e a cabeça têm o mesmo tamanho dela.`,
    });
    pedidos[`${chave}-sentado-${vista}`] = bicho({
      ...G, arquivo: `sentado-${vista}.png`, titulo: 'SENTADO', vista, n: 4, plantado: true, quadros: sentado, refs: [...parada(G, 'parada'), ...par('sentado')],
      vivo: `Ele fica SENTADO em todos os quadros, no mesmo lugar: o traseiro e as patas não saem do ponto; só a cabeça, as orelhas, o rabo${chave === 'gato' ? ' e uma pata da frente' : ' e a língua'} se mexem. A cabeça e o corpo têm o MESMO tamanho da folha parada anexa.`,
    });
  }
}

// ---------- tosquia: folha de modelo da interação e a animação da personagem ----------

pedidos['modelo-tosquia'] = `${CABECA}
${P_MODELO}
- \`referencias/ovelha.png\`: a FOLHA DE MODELO da ovelha com lã (de frente três quartos, de costas três quartos e de perfil).
- \`referencias/ferramentas.png\`: a FOLHA DE MODELO das ferramentas, com a personagem ao lado para dar o tamanho. Dela sai a TESOURA DE TOSQUIA (tesoura de mola, de ferro cinza, com duas lâminas triangulares largas).

Preciso da FOLHA DE MODELO DA TOSQUIA: a personagem ajoelhada ao lado da ovelha, tosquiando. Essa folha vai ser anexada aos pedidos de animação da tosquia, para a pose, a tesoura e o tamanho de uma figura em relação à outra saírem sempre iguais.

Gere uma imagem e salve na pasta atual como \`modelo-tosquia.png\`, com TRÊS desenhos lado a lado, bem separados:

1. A TOSQUIA VISTA POR TRÁS DELA (à esquerda): a ovelha está parada em pé, atravessada, com a cabeça para a direita de quem olha, vista pela câmera da cena. A personagem está do lado de cá da ovelha (em primeiro plano), com UM JOELHO NO CHÃO e o outro pé apoiado, virada para a ovelha: nós a vemos de COSTAS três quartos (o coque, o nó do lenço, as costas do macacão). A mão esquerda apoiada no lombo da ovelha, segurando; a mão direita com a tesoura de tosquia aberta, encostada na lã do flanco.
2. A TOSQUIA VISTA PELA FRENTE DELA (no meio): a mesma cena vista do outro lado. A personagem ajoelhada, de FRENTE três quartos para a câmera (o rosto aparece, atento, olhando para a tesoura), e a ovelha está entre ela e a câmera, atravessada, em primeiro plano: a ovelha esconde as pernas dela; aparecem a cabeça, os ombros e os braços dela por cima do lombo da ovelha, com a mão esquerda no lombo e a tesoura na mão direita.
3. A POSE DELA SOZINHA (à direita), SEM a ovelha: a personagem com um joelho no chão e o outro pé apoiado, de FRENTE três quartos como a primeira figura da folha de modelo dela (corpo virado para a esquerda de quem olha), o tronco inclinado para a frente, a mão esquerda espalmada à frente na altura do peito (como quem segura a ovelha, que não aparece) e a tesoura de tosquia aberta na mão direita, à frente, na altura da cintura. Ela aparece inteira.

- Tamanhos certos: a ovelha é de porte médio; em pé, o lombo da ovelha bate na cintura da personagem em pé. Ajoelhada, a cabeça da personagem fica um pouco acima do topete da ovelha. A tesoura tem o tamanho do antebraço dela.
- É a MESMA personagem da folha de modelo (lenço vermelho com nó, coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons) e a MESMA ovelha da folha de modelo (lã creme em tufos, topete, cara e orelhas castanho-escuras, patas castanho-escuras com cascos pretos).
- Tudo visto pela mesma câmera da cena (isométrica, de cima, a cerca de 35 graus), no mesmo estilo: traço escuro grosso, cores chapadas com poucos tons.
- NÃO desenhe lã cortada, tufos caindo nem lã no chão.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem capim, sem números, sem nomes, sem texto, sem setas, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
`;

for (const vista of ['frente', 'costas']) {
  const n = 6;
  pedidos[`personagem-tosquiar-${vista}`] = `${CABECA}
${P_MODELO}
${P_FERRAMENTAS.replace('A ferramenta deste pedido tem', 'A tesoura de tosquia tem')}
- \`referencias/tosquia.png\`: a FOLHA DE MODELO DA TOSQUIA (a personagem ajoelhada tosquiando a ovelha, vista por trás dela, pela frente dela, e a pose dela sozinha). Ela manda na pose.
${vista === 'costas' ? '- `referencias/tosquiar-frente.png`: a folha de animação já pronta da mesma ação vista de frente (dá o formato da folha, o tamanho e o jeito do movimento; aqui a personagem é vista de costas).\n' : ''}
Preciso da folha de animação da MESMA personagem TOSQUIANDO, ajoelhada, vista ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo. A OVELHA NÃO APARECE nesta folha: o jogo desenha a ovelha à parte, ${vista === 'frente' ? 'na frente dela' : 'atrás dela'}.

Gere uma imagem e salve na pasta atual como \`tosquiar-${vista}.png\`:

- Uma única fileira horizontal com ${n + 1} figuras, da esquerda para a direita:
  - Figura 1 (referência de tamanho): ela PARADA EM PÉ, igual à folha de modelo, pés juntos, braços soltos, mãos vazias.
  - Figuras 2 a ${n + 1}: os ${n} quadros da tosquia. Em todos ela está com UM JOELHO NO CHÃO e o outro pé apoiado à frente, o tronco inclinado para a frente, a mão esquerda espalmada à frente na altura do peito (segurando a ovelha, que não aparece) e a TESOURA DE TOSQUIA na mão direita. Nesta ordem:
    1. SEGURA: a mão esquerda firme à frente; a tesoura ABERTA, encostada perto da mão esquerda. Ela olha para a tesoura.
    2. CORTA: a tesoura FECHA; o braço direito avança um palmo; o ombro direito desce.
    3. ABRE: a tesoura abre de novo, mais à frente; o tronco se inclina mais.
    4. CORTA de novo: a tesoura FECHA no ponto mais distante; o braço direito esticado, o tronco bem inclinado. É o ponto de maior alcance.
    5. AFASTA: a mão esquerda faz um gesto para o lado, como quem afasta a lã cortada (que não aparece); a tesoura aberta recua; ela sorri.
    6. VOLTA: o tronco endireita um pouco, a mão esquerda volta a segurar, a tesoura volta para perto. Emenda no quadro 1.
- Movimento ritmado e vivo: abre e fecha a tesoura, avança o braço, o tronco vai e volta, a cabeça segue a tesoura, as pontas do lenço balançam.
- Em todas as figuras ela é vista pela mesma câmera da cena (isométrica, de cima), ${P_VISTA[vista]}. ${vista === 'frente' ? 'É a terceira pose da folha de modelo da tosquia (ela sozinha, de frente).' : 'É como no primeiro desenho da folha de modelo da tosquia (visto por trás dela), mas SEM a ovelha: o corpo dela esconde parte dos braços; aparecem os cotovelos, e a tesoura aparece ao lado do corpo quando o braço avança.'}
- Nos ${n} quadros da tosquia o JOELHO no chão e o PÉ apoiado ficam exatamente no MESMO LUGAR; só os braços, os ombros, o tronco e a cabeça se mexem.
- As ${n + 1} figuras na MESMA escala (a cabeça tem o mesmo tamanho em todas), os pés e o joelho na mesma linha de base, igualmente espaçadas, cada uma centrada numa casa de mesma largura, com um vão vazio entre uma e outra (nenhuma encosta na vizinha).
- ${P_MESMA}
- A TESOURA DE TOSQUIA é a da folha de ferramentas (tesoura de mola, de ferro cinza, duas lâminas triangulares largas, do tamanho do antebraço dela), inteira e do mesmo tamanho em todos os quadros da tosquia.
- NÃO desenhe a ovelha, nem lã, nem tufos caindo, nem lã no chão: só a personagem e a tesoura.
- ${LIMPO}
${FIM}
`;
}

// ---------- montaria: folha de modelo da interação e a personagem montada (cavalo e personagem num desenho só) ----------
// A ferramenta de imagens do Codex aceita no máximo 5 imagens de referência (contando a cena de estilo): de costas, a folha de
// modelo do cavalo fica de fora (a da montaria já mostra o cavalo) para caber a folha de frente da mesma ação.

pedidos['modelo-montaria'] = `${CABECA}
${P_MODELO}
- \`referencias/cavalo.png\`: a FOLHA DE MODELO do cavalo com sela (de frente três quartos, de costas três quartos e de perfil), sem ninguém montado.

Preciso da FOLHA DE MODELO DA MONTARIA: a personagem MONTADA no cavalo selado. Essa folha vai ser anexada aos pedidos de animação dela a cavalo, para a pose, o tamanho de uma figura em relação à outra e o jeito de sentar saírem sempre iguais.

Gere uma imagem e salve na pasta atual como \`modelo-montaria.png\`:

- Uma única fileira horizontal com 3 desenhos da MESMA personagem montada no MESMO cavalo, parados, da esquerda para a direita, na mesma ordem e nas mesmas vistas da folha de modelo do cavalo:
  1. de FRENTE três quartos: o cavalo com o corpo virado para a esquerda de quem olha e para a câmera; vê-se o rosto dela e a cara do cavalo;
  2. de COSTAS três quartos: o cavalo com o corpo virado para o fundo e para a direita de quem olha; vê-se a garupa e o rabo do cavalo em primeiro plano e as costas dela (o coque, o nó do lenço, as costas do macacão);
  3. de PERFIL: o cavalo todo de lado, com a cabeça para a esquerda de quem olha.
- Ela está SENTADA NA SELA, de pernas abertas, uma perna de cada lado do cavalo, os pés nos estribos, o tronco reto, as duas mãos à frente segurando as rédeas na altura da cintura, olhando para a frente, contente.
- Tamanhos certos: é a personagem do tamanho da folha de modelo dela sobre o cavalo do tamanho da folha de modelo dele (em pé no chão, a cabeça dela ficaria na altura das orelhas do cavalo). Montada, a cintura dela fica na altura do lombo do cavalo e a cabeça dela é o ponto mais alto do desenho, bem acima das orelhas do cavalo.
- É a MESMA personagem da folha de modelo (lenço vermelho com nó, coque castanho, camisa amarela de mangas dobradas, macacão azul com dois botões amarelos, botas marrons) e o MESMO cavalo da folha de modelo (castanho, crina e rabo castanho-escuros, listra branca na testa, quatro meias brancas, sela de couro marrom sobre manta vermelha, estribos, cabeçada e rédeas).
- Os três desenhos do mesmo tamanho, os cascos na mesma linha de base, bem separados um do outro por um vão vazio largo.
- Pose de descanso nos três: o cavalo com as quatro patas no chão, retas, cabeça erguida, rabo caído.
- Tudo visto pela mesma câmera da cena (isométrica, de cima, a cerca de 35 graus), no mesmo estilo: traço escuro grosso, cores chapadas com poucos tons.
- Fundo transparente de verdade (canal alfa). Sem chão, sem sombra, sem cenário, sem números, sem nomes, sem texto, sem setas, sem linhas de grade, sem moldura.
- Nada cortado nas bordas. Imagem bem larga (proporção perto de 3 por 1).
- Arte original; não imite nenhum jogo existente.

No fim, liste os arquivos que salvou.
`;

for (const vista of ['frente', 'costas']) {
  for (const [acao, titulo, quadros, vivo] of [
    ['andar', 'ANDANDO A PASSO', PASSO8, PASSO8_VIVO('A cabeça do cavalo balança para cima e para baixo a cada passo, a crina e o rabo balançam. A personagem acompanha o passo: o quadril dela balança de leve com o lombo do cavalo, o tronco sobe e desce um pouquinho, as mãos com as rédeas vão e vêm de leve, as pontas do lenço balançam.')],
    ['galope', 'GALOPANDO', GALOPE8, 'É um GALOPE de verdade: o cavalo se encolhe e se estica, o pescoço esticado para a frente, a crina e o rabo voando para trás. A personagem galopa junto: inclinada para a frente, levanta um pouco da sela quando o cavalo se estica e senta quando ele se recolhe, os cotovelos dobrados, as rédeas curtas, as pontas do lenço voando para trás. O cavalo e a personagem têm o MESMO tamanho da folha de modelo da montaria.'],
  ]) {
    pedidos[`personagem-montada-${acao}-${vista}`] = `${CABECA}
${P_MODELO}
${vista === 'frente' ? '- `referencias/cavalo.png`: a FOLHA DE MODELO do cavalo com sela.\n' : ''}- \`referencias/montaria.png\`: a FOLHA DE MODELO DA MONTARIA (a personagem montada no cavalo, de frente três quartos, de costas três quartos e de perfil). Ela manda na pose dela na sela e no tamanho de uma figura em relação à outra.
- \`referencias/cavalo-${acao}-${vista}.png\`: a folha de animação já pronta do MESMO cavalo, SEM ninguém montado, na mesma ação e na mesma vista. O cavalo desta folha nova faz EXATAMENTE o mesmo movimento, quadro a quadro, na mesma ordem e no mesmo formato de folha; a diferença é que agora a personagem vai montada.
${vista === 'costas' ? `- \`referencias/montada-${acao}-frente.png\`: a folha já pronta da mesma ação com a personagem montada, vista de frente (dá o jeito dela na sela; aqui tudo é visto de costas).\n` : ''}
Preciso da folha de animação da personagem MONTADA NO CAVALO, ${titulo}, vista ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo. O cavalo e a personagem são um desenho só em cada quadro.

Gere uma imagem e salve na pasta atual como \`montada-${acao}-${vista}.png\`:

- DUAS fileiras horizontais, uma em cima da outra, com 4 quadros cada: a fileira de CIMA tem os quadros 1 a 4, a de BAIXO tem os quadros 5 a 8, sempre da esquerda para a direita. As duas fileiras bem separadas por uma faixa vazia (nada de uma fileira encosta na outra). Os quadros, pelo movimento do cavalo:
${quadros.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}
- ${vivo}
- Ela vai SENTADA NA SELA em todos os quadros, uma perna de cada lado, os pés nos estribos, as duas mãos segurando as rédeas, como na folha de modelo da montaria.
- Em todos os quadros o conjunto é visto pela mesma câmera da cena (isométrica, de cima), ${B_VISTA[vista].replace('a cara aparece', 'aparecem a cara do cavalo e o rosto dela').replace('a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás', 'a garupa do cavalo fica em primeiro plano e vemos as costas dela')}. O cavalo anda nessa direção (${P_RUMO[vista]}) sem sair do lugar.
- Os 8 quadros têm o cavalo e a personagem do MESMO tamanho (a cabeça dela e o corpo do cavalo têm o mesmo tamanho em todos), cada fileira sobre a sua linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- ${P_MESMA} E o MESMO cavalo da folha de modelo: ${CAVALO.igual}
- ${LIMPO}
${FIM.replace('Imagem bem larga (proporção perto de 3 por 1)', 'Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço')}
`;
  }
}

// ---------- jumento com a carroça carregada (barril): a mesma folha do andar, com o barril na carroça ----------
for (const vista of ['frente', 'costas']) {
  pedidos[`jumento-andar-barril-${vista}`] = `${CABECA}
- \`referencias/jumento.png\`: a FOLHA DE MODELO do jumento com a carroça (de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
- \`referencias/andar-${vista}.png\`: a folha de animação já pronta do MESMO jumento andando e puxando a carroça VAZIA, nesta mesma vista: 8 quadros em duas fileiras de 4.
${vista === 'costas' ? '- `referencias/andar-barril-frente.png`: a folha já pronta da carroça com o barril, vista de frente (dá o barril: o mesmo barril, do mesmo tamanho, aqui visto de costas).\n' : ''}
Preciso de uma folha IGUAL à folha \`referencias/andar-${vista}.png\`, quadro a quadro, com uma única diferença: agora a carroça leva um BARRIL.

Gere uma imagem e salve na pasta atual como \`andar-barril-${vista}.png\`:

- O MESMO formato da folha anexa: DUAS fileiras horizontais com 4 quadros cada (em cima os quadros 1 a 4, embaixo os quadros 5 a 8), os mesmos 8 quadros, na mesma ordem, com o jumento nas MESMAS poses, do mesmo tamanho e no mesmo lugar de cada quadro; a carroça igual, com as rodas girando do mesmo jeito.
- A diferença: dentro da caixa da carroça vai UM BARRIL de madeira, em pé: aduelas castanho-escuras, dois aros de ferro cinza, tampa de madeira em cima. Ele ocupa bem a caixa da carroça e a metade de cima dele aparece acima das tábuas. É o mesmo barril, do mesmo tamanho, nos 8 quadros; ele dá um leve tranco para cima e para baixo junto com a carroça.
- É o MESMO jumento da folha de modelo: ${JUMENTO.igual.replace(', vazia,', ',')}
- Tudo visto pela mesma câmera da cena (isométrica, de cima), ${B_VISTA[vista]}.
- Os 8 quadros com o jumento do MESMO tamanho, cada fileira sobre a sua linha de base, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho) e uma faixa vazia entre as duas fileiras.
- NÃO desenhe condutor, outra carga, líquido derramando, poeira nem marcas de roda.
- ${LIMPO}
${FIM.replace('Imagem bem larga (proporção perto de 3 por 1)', 'Imagem na proporção 3 por 2 (largura uma vez e meia a altura), com as duas fileiras ocupando bem o espaço')}
`;
}

const quais = process.argv.slice(2);
for (const [nome, texto] of Object.entries(pedidos)) {
  if (quais.length && !quais.includes(nome)) continue;
  const arq = path.join(aqui, `${nome}.md`);
  if (!quais.length && fs.existsSync(arq)) continue; // sem nomes, não sobrescreve o que já foi enviado
  fs.writeFileSync(arq, texto);
  console.log('escrito', path.basename(arq));
}
