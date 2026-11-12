# Arte do jogo

Enquanto o caminho da arte não estiver decidido, o trabalho segue estas etapas. As etapas 3 e 4 só existem se a arte gerada pelo Codex for a escolhida; se o jogo usar os modelos feitos em código (`tools/visual-refs`), elas não são necessárias.

| Etapa | Quem faz | O que entrega | Onde |
|---|---|---|---|
| 1. Mockup da tela | o dono do projeto gera no Codex, com o pedido escrito pela sessão principal | opções de estilo da tela inteira | `arte/mockups/<tela>/` |
| 2. Análise e ajustes | dono do projeto e sessão principal | a arte principal da tela: `aprovado.png` | `arte/mockups/<tela>/` |
| 3. Componentes | agente `producao-de-componentes` | cada item da tela como peça separada, pronta para o jogo | `arte/componentes/<tela>/` |
| 4. Entrada no jogo | sessão principal | a tela montada com as peças | `prototypes/` |

- O pedido de cada mockup fica em `arte/mockups/<tela>/pedido.md`. O primeiro é o da tela principal: `arte/mockups/fazenda-principal/pedido.md`.
- O papel do agente de componentes está em `.claude/agents/producao-de-componentes.md`.
- Os pedidos do personagem animado (`docs/referencias-visuais/codex/`) vêm depois da arte principal e serão revistos para seguir o estilo aprovado.

## Etapa 3: o Codex chamado daqui

A etapa 3 gera dezenas de imagens, então o agente chama o Codex de terminal direto, sem passar pelo dono do projeto:

```bash
tools/arte/codex.sh /root/arte-codex/<tarefa> /root/arte-codex/<tarefa>/pedido-01.md [imagens de referência]
```

- O Codex roda sem interação, no sandbox dele: só escreve na pasta de trabalho, que fica fora do repositório, e os comandos que ele executa não têm rede.
- Só o que foi olhado e aprovado pelo agente é copiado para `arte/`. As tentativas descartadas não entram no repositório.

Isso exige o Codex instalado e com login na máquina onde a sessão roda:

- **Sessão no computador do dono do projeto** (aplicativo do Claude ou `claude` no terminal, na pasta do projeto): o Codex já instalado e logado ali é usado direto, e o login continua valendo de uma sessão para a outra. É o caminho recomendado para a etapa 3.
- **Sessão na nuvem**: a máquina é apagada no fim da sessão, então o Codex precisa ser instalado (`npm install -g @openai/codex@0.167.1`) e logado de novo a cada sessão (`CODEX_HOME=~/.codex-farm codex login`), e o ambiente precisa permitir `auth.openai.com` e `chatgpt.com`. O login feito no computador não chega até a nuvem.

Sem login do Codex na sessão, a etapa 3 funciona como a 1: o agente escreve os pedidos e o dono do projeto gera as imagens.
