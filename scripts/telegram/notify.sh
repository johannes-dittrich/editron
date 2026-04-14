#!/usr/bin/env bash
# Send a plain-text notification to the editron telegram chat.
#
# Usage:
#   scripts/telegram/notify.sh "build failed: see logs"
#   echo "multiline" | scripts/telegram/notify.sh
#
# Markdown is enabled. Escape backticks / asterisks in user input with jq -R.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$DIR/_lib.sh"

if [[ $# -gt 0 ]]; then
  text="$*"
else
  text="$(cat)"
fi

if [[ -z "${text// /}" ]]; then
  echo "empty message, not sending" >&2
  exit 1
fi

resp=$(tg_send_message "$text")
ok=$(echo "$resp" | jq -r '.ok')
if [[ "$ok" != "true" ]]; then
  echo "telegram send failed: $resp" >&2
  exit 1
fi
