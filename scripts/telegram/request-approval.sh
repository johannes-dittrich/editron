#!/usr/bin/env bash
# Ask the human for merge approval via Telegram inline buttons.
#
# Usage:
#   scripts/telegram/request-approval.sh <pr-number> "<summary>" [staging-url]
#
# Writes the approval key into approvals.json with status "pending" so the
# merger loop and the poller can coordinate. The poller replaces "pending"
# with "approved"/"rejected" based on the button press.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$DIR/_lib.sh"

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <pr-number> <summary> [staging-url]" >&2
  exit 1
fi

pr_number="$1"
summary="$2"
staging_url="${3:-}"

key="pr:${pr_number}"

# build the message body
text="🟡 *PR #${pr_number} ready*
${summary}"
if [[ -n "$staging_url" ]]; then
  text+="
🔗 staging: ${staging_url}"
fi
text+="
_tap a button below to decide_"

reply_markup=$(jq -nc \
  --arg approve "approve:${pr_number}" \
  --arg reject  "reject:${pr_number}" \
  '{inline_keyboard: [[
    {text: "✅ Merge",  callback_data: $approve},
    {text: "❌ Reject", callback_data: $reject}
  ]]}')

resp=$(tg_send_message "$text" "$reply_markup")
ok=$(echo "$resp" | jq -r '.ok')
if [[ "$ok" != "true" ]]; then
  echo "telegram send failed: $resp" >&2
  exit 1
fi

approvals_set "$key" "pending"
echo "approval requested for PR #${pr_number} (key=$key)"
