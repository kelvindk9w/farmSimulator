#!/usr/bin/env bash
# Chama o Codex de terminal sem interação, para gerar imagens do jogo.
#
# Uso:
#   tools/arte/codex.sh <pasta-de-trabalho> <pedido.md> [imagem-de-referência ...]
#
# - <pasta-de-trabalho> fica FORA do repositório (por exemplo /root/arte-codex/<tarefa>).
#   O Codex roda no sandbox dele em modo "workspace-write": só escreve nessa pasta e os
#   comandos que ele executa não têm rede. O que for aprovado é copiado para arte/ por quem chamou.
# - <pedido.md> é o texto do pedido. As imagens de referência são anexadas ao pedido.
# - A resposta final do Codex fica em <pasta-de-trabalho>/ultima-resposta.md e o registro
#   completo em <pasta-de-trabalho>/codex.log.
#
# O login do Codex fica em $CODEX_HOME (padrão ~/.codex-farm), fora do repositório.
# Nunca copie, mostre nem versione nada dessa pasta.
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: tools/arte/codex.sh <pasta-de-trabalho> <pedido.md> [imagem-de-referência ...]" >&2
  exit 2
fi

trabalho="$1"; pedido="$2"; shift 2
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex-farm}"
CODEX_BIN="${CODEX_BIN:-codex}"

[ -f "$pedido" ] || { echo "Pedido não encontrado: $pedido" >&2; exit 2; }
mkdir -p "$trabalho"
raiz_repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
case "$(cd "$trabalho" && pwd)/" in
  "$raiz_repo"/*) echo "A pasta de trabalho precisa ficar fora do repositório: $trabalho" >&2; exit 2 ;;
esac

imagens=()
for img in "$@"; do
  [ -f "$img" ] || { echo "Imagem de referência não encontrada: $img" >&2; exit 2; }
  imagens+=("--image=$img")
done

"$CODEX_BIN" exec \
  --skip-git-repo-check \
  --sandbox workspace-write \
  --cd "$trabalho" \
  --color never \
  --output-last-message "$trabalho/ultima-resposta.md" \
  "${imagens[@]}" \
  - < "$pedido" 2>&1 | tee "$trabalho/codex.log"
