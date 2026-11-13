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

## Em andamento (frentes abertas no fim de 13/11/2026)

- **Ações por toque** (aprovado; veja `arte/mockups/acoes/LEIA.md`):
  - sai a barra Mão/Enxada/Semear/Regar;
  - o toque faz a ação natural do alvo, com balãozinho do que vai acontecer;
  - vaga "Na mão" para escolher semente e ração;
  - roda de ações em bichos e árvores.
- **Área de plantio:**
  - arar só no campo (antes dava para arar qualquer grama: defeito achado pelo dono);
  - ampliar o campo por fileira encostada nele, "preparando a terra" com ouro e **adubo**;
  - limite do campo por nível.
- **Bancada simples:** o caixote vira bancada simples (só o balcão, sem postes nem toldo), e a bancada vira a banca completa. Arte no Codex, depois ligar a cadeia de reformas.
- **Completar com cash** (fase A): em todo lugar em que falta item, botão turquesa "Completar com N de cash", com o caminho de graça ("Onde conseguir?") sempre junto.
- **Fase B** (depois da área de plantio, que cuida do ritmo):
  - item processado (tábua, prego, produtos) sai da loja de ouro e passa a ser produzido;
  - material bruto pode continuar na loja, mais caro;
  - definir de onde vem o prego (proposta em `docs/jogo/economia-cash-e-producao.md`);
  - acertar o ritmo de novo.

## Pendências conhecidas

- **Ritmo:** com as ações por toque em andamento, o regular caiu para nível 18 no dia 30 (a meta é 19).
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
