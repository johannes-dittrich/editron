#!/usr/bin/env bash
# Send a rendered video to the editron telegram chat.
#
# Usage:
#   scripts/telegram/send-video.sh <path> [caption]
#
# Limits: Telegram Bot API caps sendVideo at 50MB. Larger files get a warning.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$DIR/_lib.sh"

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <video-path> [caption]" >&2
  exit 1
fi

path="$1"
caption="${2:-🎬 new render: \`$(basename "$path")\`}"

resp=$(tg_send_video "$path" "$caption")
ok=$(echo "$resp" | jq -r '.ok // false')
if [[ "$ok" != "true" ]]; then
  echo "telegram sendVideo failed: $resp" >&2
  exit 1
fi
echo "sent."
