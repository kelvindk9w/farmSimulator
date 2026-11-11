# Arte do jogo

A arte é gerada pelo Codex de terminal, comandado por dois agentes com papéis separados. Entre um e outro há sempre uma aprovação do dono do projeto.

| Etapa | Quem faz | O que entrega | Onde |
|---|---|---|---|
| 1. Mockup da tela | agente `direcao-de-arte` | três opções de estilo da tela inteira e, depois da escolha, a versão aprovada | `arte/mockups/<tela>/` |
| 2. Aprovação | dono do projeto | escolhe uma opção ou pede ajustes | — |
| 3. Componentes | agente `producao-de-componentes` | cada item do mockup como peça separada, pronta para o jogo | `arte/componentes/<tela>/` |
| 4. Entrada no jogo | sessão principal | coloca as peças no protótipo e mostra o resultado | `prototypes/` |

Os papéis estão em `.claude/agents/direcao-de-arte.md` e `.claude/agents/producao-de-componentes.md`.

## Como o Codex é chamado

```bash
tools/arte/codex.sh /root/arte-codex/<tarefa> /root/arte-codex/<tarefa>/pedido-01.md [imagens de referência]
```

- O Codex roda sem interação, no sandbox dele: só escreve na pasta de trabalho, que fica fora do repositório, e os comandos que ele executa não têm rede.
- Só o que foi olhado e aprovado pelo agente é copiado para `arte/`. As tentativas descartadas não entram no repositório.

## Preparar uma sessão nova

O Codex e o login dele não ficam guardados entre sessões na nuvem. Em cada sessão nova:

```bash
npm install -g @openai/codex@0.167.1
```

```bash
CODEX_HOME=~/.codex-farm codex login --device-auth
```

O segundo comando mostra um endereço e um código de uso único; o dono da conta do ChatGPT digita o código nesse endereço. O ambiente precisa permitir os endereços `auth.openai.com` e `chatgpt.com`. O login fica em `~/.codex-farm`, fora do repositório, e nunca deve ser copiado ou versionado.
