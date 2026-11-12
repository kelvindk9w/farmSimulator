#!/usr/bin/env bash
# Chama o Codex de terminal sem interação, para gerar imagens do jogo.
#
# Uso:
#   tools/arte/codex.sh <pasta-de-trabalho> <pedido.md> [imagem-de-referência ...]
#
# - <pasta-de-trabalho> fica FORA do repositório (por exemplo /root/arte-codex/<tarefa>).
#   O Codex roda no sandbox dele em modo "workspace-write": só escreve nessa pasta e os
#   comandos que ele executa não têm rede. O que for aprovado é copiado para arte/ por quem chamou.
# - <pedido.md> é o texto do pedido. As imagens de referência são anexadas ao pedido e copiadas
#   para <pasta-de-trabalho>/referencias/, onde o Codex consegue abri-las.
# - A resposta final do Codex fica em <pasta-de-trabalho>/ultima-resposta.md e o registro
#   completo em <pasta-de-trabalho>/codex.log.
#
# Login do Codex: usa o que já existir na máquina. Se CODEX_HOME estiver definido, vale ele;
# senão, se houver um login em ~/.codex-farm (feito numa sessão na nuvem), usa esse;
# senão, o padrão do Codex (~/.codex), que é onde fica o login de quem já usa o Codex no computador.
# Nunca copie, mostre nem versione nada dessas pastas.
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: tools/arte/codex.sh <pasta-de-trabalho> <pedido.md> [imagem-de-referência ...]" >&2
  exit 2
fi

trabalho="$1"; pedido="$2"; shift 2
if [ -z "${CODEX_HOME:-}" ] && [ -f "$HOME/.codex-farm/auth.json" ]; then export CODEX_HOME="$HOME/.codex-farm"; fi
CODEX_BIN="${CODEX_BIN:-codex}"

[ -f "$pedido" ] || { echo "Pedido não encontrado: $pedido" >&2; exit 2; }
mkdir -p "$trabalho"
raiz_repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
case "$(cd "$trabalho" && pwd)/" in
  "$raiz_repo"/*) echo "A pasta de trabalho precisa ficar fora do repositório: $trabalho" >&2; exit 2 ;;
esac

# As imagens de referência são copiadas para <pasta-de-trabalho>/referencias/ e anexadas pelo
# caminho completo: o Codex só enxerga a pasta de trabalho, e procura lá o arquivo que foi anexado.
imagens=()
for img in "$@"; do
  [ -f "$img" ] || { echo "Imagem de referência não encontrada: $img" >&2; exit 2; }
  mkdir -p "$trabalho/referencias"
  copia="$(cd "$trabalho/referencias" && pwd)/$(basename "$img")"
  cp -f "$img" "$copia"
  imagens+=("--image=$copia")
done

"$CODEX_BIN" exec \
  --skip-git-repo-check \
  --sandbox workspace-write \
  --cd "$trabalho" \
  --color never \
  --output-last-message "$trabalho/ultima-resposta.md" \
  "${imagens[@]}" \
  - < "$pedido" 2>&1 | tee "$trabalho/codex.log"
