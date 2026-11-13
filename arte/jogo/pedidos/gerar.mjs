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

// ---------- bichos ----------

const B_VISTA = {
  frente: 'de FRENTE três quartos, exatamente como a primeira figura da folha de modelo: o corpo virado para a esquerda de quem olha e para a câmera, a cara aparece',
  costas: 'de COSTAS três quartos, exatamente como a segunda figura da folha de modelo: o corpo virado para o fundo e para a direita de quem olha; a traseira fica em primeiro plano e a cabeça lá na frente, vista de trás',
};
// Folha de um bicho. plantado: as patas não saem do lugar (parada, ciscar, pastar); senão é um ciclo de andar.
function bicho({ nome, artigo = 'a', modelo, igual, arquivo, titulo, n, quadros, vivo, vista, plantado, refs = [], semObjeto = '' }) {
  return `${CABECA}
- \`referencias/${modelo}.png\`: a FOLHA DE MODELO d${artigo} ${nome} (parad${artigo} de frente três quartos, de costas três quartos e de perfil). Ela manda nas proporções, nas cores e nos detalhes.
${refs.join('\n')}${refs.length ? '\n' : ''}
Preciso da folha de animação d${artigo} MESM${artigo.toUpperCase()} ${nome} ${titulo}, vist${artigo} ${vista === 'frente' ? 'de FRENTE' : 'de COSTAS'} três quartos, para usar como figura 2D animada dentro do jogo.

Gere uma imagem e salve na pasta atual como \`${arquivo}\`:

- Uma única fileira horizontal com ${n} quadros, da esquerda para a direita, nesta ordem:
${quadros.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}
- ${vivo}
- Em todos os quadros el${artigo} é vist${artigo} pela mesma câmera da cena (isométrica, de cima), ${B_VISTA[vista]}. ${plantado ? `El${artigo} NÃO sai do lugar: as patas ficam plantadas no mesmo ponto em todos os quadros.` : `El${artigo} anda nessa direção (${P_RUMO[vista]}) sem sair do lugar.`}
- Os ${n} quadros têm ${artigo} ${nome} do MESMO tamanho (o corpo tem o mesmo tamanho em todos), sobre a mesma linha de base, igualmente espaçados, cada um centrado numa casa de mesma largura, com um vão vazio entre um quadro e o outro (nenhum quadro encosta no vizinho).
- É ${artigo} MESM${artigo.toUpperCase()} ${nome} da folha de modelo em todos os quadros: ${igual} Mesmas cores chapadas, mesmo traço escuro grosso.
${semObjeto ? `- ${semObjeto}\n` : ''}- ${LIMPO}
${FIM}
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
    ...VACA, arquivo: `andar-${vista}.png`, titulo: 'ANDANDO', vista, n: 8, quadros: ANDAR4(), refs: fmt('vaca', 'andar'),
    vivo: 'Andar pesado e calmo de vaca: as patas em diagonal andam juntas, a cabeça balança para cima e para baixo a cada passo, o lombo sobe e desce de leve, o rabo balança de um lado para o outro, o úbere balança.',
  });
  pedidos[`vaca-pastar-${vista}`] = bicho({
    ...VACA, arquivo: `pastar-${vista}.png`, titulo: 'PASTANDO', vista, n: 6, plantado: true, refs: fmt('vaca', 'pastar'),
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

const quais = process.argv.slice(2);
for (const [nome, texto] of Object.entries(pedidos)) {
  if (quais.length && !quais.includes(nome)) continue;
  const arq = path.join(aqui, `${nome}.md`);
  if (!quais.length && fs.existsSync(arq)) continue; // sem nomes, não sobrescreve o que já foi enviado
  fs.writeFileSync(arq, texto);
  console.log('escrito', path.basename(arq));
}
