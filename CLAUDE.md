# Fazenda: como continuar este projeto

Este arquivo é o ponto de partida de qualquer sessão nova (gente ou agente). Leia ele inteiro antes de mexer em qualquer coisa. Ele diz o que é o projeto, como o trabalho é feito, onde está cada coisa, o que já está pronto e o que falta.

## O projeto e o dono

- Jogo **original** de fazenda isométrico para navegador, celular deitado (aparelhos fracos também) e TV. Monetização por anúncios e "cash"; multiplayer assíncrono no futuro. Não é hardcore: tem de ser bonito, leve e sem frustrar.
- O dono do projeto é brasileiro e **não é programador**. Fale sempre em **português do Brasil simples**, sem jargão. Ele testa a versão publicada e manda retorno (muitas vezes por áudio transcrito, com prints).
- Quando houver uma decisão, **recomende a melhor opção** e explique por quê em poucas linhas. Quando ele pede "analise e me dê um feedback", responda com a análise e a recomendação e siga com o que ele aprovar. "Prossiga" e "aprovado, pode seguir com as suas recomendações" querem dizer: siga com o que você recomendou.
- **Nunca copie outro jogo** (nome, personagens, arte, telas, músicas, fases). Referência é só inspiração.
- O e-mail e os dados pessoais do dono são privados: nunca vão para serviços de fora, nem para o repositório.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Plano do jogo (fonte de verdade das regras) | `docs/jogo/PLANO.md` |
| Arquitetura do código (contrato entre as partes) | `docs/jogo/ARQUITETURA.md` |
| Economia e números | `docs/jogo/economia.md`, `docs/jogo/materiais.md`, `docs/jogo/ritmo-medido.md`; propostas novas em `docs/jogo/economia-cash-e-producao.md` |
| Pesquisa (jogadores, mercado, vida real) | `docs/pesquisa/`, `docs/planejamento/`, `docs/economia/` |
| O jogo (código, dados, testes, ferramentas) | `jogo/` (leia `jogo/README.md`) |
| Arte pronta para o jogo (catálogo, peças, molduras) | `jogo/arte/` |
| Arte de origem, pedidos ao Codex, fichas | `arte/` (`arte/jogo/ficha-pecas.md`, `arte/jogo/ficha-animacoes.md`, `arte/jogo/pecas.json`) |
| Telas de referência aprovadas pelo dono | `arte/mockups/` (`interface/APROVADO.md`, `acoes/LEIA.md`, `carregando/`) |
| Agente de produção de arte | `.claude/agents/producao-de-componentes.md` |

## Como o trabalho é feito

1. **Arte primeiro no Codex, aprovada pelo dono.** Para tela ou visual novo: gerar a referência (mockup) no Codex no estilo aprovado, mostrar ao dono, e só depois produzir as peças (agente `producao-de-componentes`) e implementar. Botões, telas, avisos, ícones, moeda e cash também vêm do Codex, para combinar com a arte.
   - Codex de terminal: `tools/arte/codex.sh /root/arte-codex/<tarefa> <pedido.md> <referências...>`. O login já está feito na máquina da sessão; para conferir: `CODEX_HOME=$HOME/.codex-farm codex login status`.
   - **Nunca** leia, copie, mostre ou faça commit dos arquivos de login do Codex (`~/.codex-farm`, `~/.codex`). **Nunca** use o login por código (device code): o dono pediu.
   - Peças estáticas: `jogo/tools/arte/peca.mjs` (128 px por unidade). Animações: `jogo/tools/arte/folha.mjs`.
2. **Frentes em subagentes.** O coordenador (a sessão principal) divide o trabalho em frentes, cada uma num subagente, e integra. Regras:
   - todo subagente roda no modelo Opus (`model: "opus"`); a autocompactação de 400 mil já está em `.claude/settings.json`;
   - cada frente usa a própria pasta de saída: `JOGO_DIST=dist-<frente>`, `JOGO_CAPTURAS=<pasta>`, `JOGO_PORTA=<porta>`;
   - frentes em paralelo combinam entre si antes de mexer no mesmo arquivo (`git diff` antes de editar, aviso por mensagem);
   - subagente não faz commit; quem faz é o coordenador.
3. **Verificar antes de publicar** (em `jogo/`):
   - `npm run testar` (testes da lógica) e `node tools/validar.mjs` (dados);
   - `npm run build`;
   - as 9 verificações no navegador: `node tools/verificar.mjs` e `tools/verificar-{animais,campo,chegada,construcao,industria,progresso,terras,trabalho}.mjs`. **No máximo 4 ao mesmo tempo**, cada uma numa porta: com 8 juntas aparecem falhas falsas de tempo;
   - o jogador automático: `npm run bot -- --horas 720 --perfil casual|regular|engajado --resumo`. Metas de nível do jogador regular no fim dos dias 1, 3, 7, 14 e 30: **6, 8, 11, 14, 19**;
   - olhar as fotos de verdade (844x390 = celular deitado, 1280x720) antes de dizer que está bom.
4. **Publicar a versão de teste.** O jogo publicado fica em https://claude.ai/artifact/D5GejLpaqv5Vp5LkG7gS3v (artefato `61c648b2-874e-4242-aacc-8ac6c9e13645`, privado do dono).
   - Monte de uma cópia limpa do commit: `git worktree add --detach <pasta> HEAD`, ligue `node_modules` e rode testes, build e verificações.
   - Copie o `dist` para `jogo/dist/` e publique os arquivos com a ferramenta de artefatos (`publish_files`). Pegue a versão atual com `get_artifact` e mande-a como `base_version`.
   - As páginas de arte têm o resumo no nome: se a arte não mudou, basta mandar `index.html` e `main.js`; se mudou, mande os novos e remova os velhos.
   - Mande ao dono o endereço e o que mudou.
5. **Git.** Trabalhe no branch indicado pela sessão. Faça commit e push com frequência: o contêiner da sessão é descartável. Não abra pull request sem o dono pedir.

## O que já está pronto (13/11/2026)

- **Núcleo:** mundo grande isométrico, câmera, zoom, tela cheia, celular deitado, TV e controle, gravação contínua no aparelho, relógio real.
- **Lavoura:** campo de 12 casas no começo, enxada, sementes, regador e poço, colheita.
- **Bichos:**
  - boi velho no nível 4 (presente do Seu Tonho), que ara a fileira inteira;
  - cavalo, jumento, cachorro, gato;
  - galinha, vaca, ovelha.
- **Construção e produção:** celeiro por dentro com prateleiras; carpintaria; construções que mudam de lugar; indústrias com fila; quadro de pedidos; lotes de terra e limpeza.
- **Progresso:** missões do Seu Tonho, conquistas, presente do dia, convite, loja de cash de teste, cosméticos.
- **Interface nova aprovada:** HUD, Menu no celular, loja com 6 abas, telas de subir de nível e presente do dia, molduras 9-slice.
- **Começo humilde:**
  - chegada com a trouxa e fala da personagem (nome provisório "Rosa");
  - casa velha, poço velho, cerca de arame, baú, caixote de venda;
  - celeiro e quadro de pedidos por missão;
  - reformas (poço, caixote → banca, casa, cerca), com as obras desenhadas.
- **Tela de carregando.**
- **Versão de teste:**
  - pular de nível;
  - "Resetar: conta nova";
  - pergunta de começo novo para gravação antiga.
- **Materiais:** "Onde conseguir?" em todo custo; o Seu Tonho explica cada material uma vez; prêmios que dizem para que servem.

## Em andamento: pausado em 13/11/2026 (limite semanal)

Todas as frentes foram paradas no meio e o que fizeram está nos commits "Andamento" do branch. Os 331 testes passam, mas **o branch ainda não foi conferido no navegador nem publicado**. A versão publicada (artefato versão `1794596238-c4f6`) é a do commit `2ecd24f`: começo humilde, tela de carregando, "Resetar: conta nova".

**Para retomar:**
1. Ler este arquivo e `git log --oneline -15`.
2. Rodar `npm run testar` e `node tools/validar.mjs` em `jogo/`, para ver o estado.
3. Reabrir as frentes abaixo, uma por subagente, cada uma lendo o próprio pedaço daqui.

**As frentes e onde cada uma parou:**

- **Ações por toque** (aprovado; veja `arte/mockups/acoes/LEIA.md`):
  - o que muda: sai a barra Mão/Enxada/Semear/Regar; o toque faz a ação natural do alvo, com balãozinho do que vai acontecer; vaga "Na mão" para escolher semente e ração; roda de ações em bichos e árvores; arrastar repete a primeira ação;
  - parou: a lógica (`src/nucleo/sistemas/acoes.js`, `testes/acoes.test.mjs`) está feita em boa parte; estava reescrevendo as verificações do navegador (`tools/verificar-terras.mjs`, `verificar-animais.mjs`, `verificar-industria.mjs`, `verificar-campo.mjs`) para o jeito novo;
  - falta: terminar as 9 verificações, olhar as fotos e conferir o ritmo (com essa frente o regular caiu para nível 18 no dia 30; a meta é 19).
- **Área de plantio**:
  - o que muda: arar só no campo (antes dava para arar qualquer grama, defeito achado pelo dono); ampliar o campo por fileira encostada nele, "preparando a terra" com ouro e **adubo**; limite do campo por nível;
  - parou: começou `src/nucleo/sistemas/campo.js` e a ligação em `sistemas/index.js`; ainda não estão nos dados: o item `adubo` (material, nível 3, compra 3, venda 1, provisório), o campo em `regras.json`, a missão nova "ampliar-o-campo" (nível 3, +6 adubos), +6 adubos na missão "regador-novo" e o mimo do gato que sorteia 3 adubos (nível 6);
  - já pronto, na frente de materiais: `nucleo/fontes.js` já cobra fonte para o adubo e mostra "Onde conseguir?". Quando os dados entrarem, `node tools/validar.mjs` tem de listar o adubo em "Materiais com fontes";
  - falta também: tela "Preparar a terra"; tirar o "arar grama" de `podeArar` em `src/nucleo/sistemas/lavoura.js`; ajustar o jogador automático (`tools/bot/`); acertar o ritmo para 6, 8, 11, 14, 19.
- **Bancada simples** (o caixote vira bancada simples, só o balcão, sem postes nem toldo; a bancada vira a banca completa):
  - parou: o Codex já gerou as 4 imagens brutas, guardadas em `arte/jogo/folhas/`: `bancada-de-venda.png`, `bancada-de-venda-cheia.png`, `obra-reforma-bancada.png`, `icone-reforma-bancada.png`; os pedidos estão em `arte/jogo/pedidos/72` a `75`;
  - falta: conferir as imagens, recortar as peças (`jogo/tools/arte/peca.mjs`, catálogo `jogo/arte/catalogo/`), ligar a cadeia caixote → bancada → banca em `jogo/dados/construcoes.json` (campo `reforma`) e mostrar ao dono.
- **Completar com cash** (fase A):
  - o que muda: em todo lugar em que falta item, botão turquesa "Completar com N de cash", com o caminho de graça ("Onde conseguir?") sempre junto; o preço em cash acompanha o tempo de fazer o item; as missões nunca mandam gastar cash;
  - parou: **nada ficou salvo**; começar do zero, escrevendo primeiro a proposta em `docs/jogo/economia-cash-e-producao.md`.
- **Fase B** (depois da área de plantio, que mexe no ritmo):
  - item processado (tábua, prego, produtos) sai da loja de ouro e passa a ser produzido;
  - material bruto (madeira, pedra) fica na loja, mais caro;
  - prego feito numa forja, de ferro velho (proposta a detalhar);
  - acertar o ritmo de novo.
  - Hoje os materiais de obra são baratos e sem conta de complexidade (prego 4, tábua 36, madeira 14, pedra 16 de ouro), enquanto colheitas e receitas seguem as fórmulas de `docs/jogo/economia.md` ("Regras de formação de preço").

## Pendências conhecidas

- **Gato:** às vezes fica parado sem caminho.
- **Animais:** o pet passa por cima de construção; filas de bebedouro e cocho; cocho e bebedouro sem desenho de "vazio"; galinheiro e aprisco sem camadas.
- **Arte que falta:**
  - jumento parado com barril;
  - personagem montada parada;
  - gestos afagar, encher no barril e conduzir;
  - gato siamês parado e sentado de costas;
  - ícones de loja do boi, do jumento e do cavalo;
  - personagem andando de costas sem a trouxa;
  - estaca do campo sozinha;
  - ícone do arado de ferro.
- **Decisões do dono ainda em aberto:**
  - nome da personagem ("Rosa" é provisório, em `jogo/dados/missoes.json`, campo `ela.nome`);
  - preço do cash em reais;
  - regras das lojas para convite e compartilhar.
- **Antes de lançar de verdade:**
  - cópia de segurança fora do aparelho (conta ou código de transferência);
  - desligar a versão de teste (`jogo/dados/regras.json`, `versaoDeTeste.ligada: false`).
- **Repositório:** em 13/11/2026 o repositório no GitHub estava **público**; o dono quer privado. Só o dono muda isso: GitHub → repositório → Settings → General → Danger Zone → Change visibility → Make private.
