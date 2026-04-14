#!/usr/bin/env bash
# Shared helpers for the editron telegram toolkit.
# Source this, don't execute it.

set -euo pipefail

EDITRON_CONFIG="${EDITRON_CONFIG:-$HOME/.config/editron/telegram.env}"
EDITRON_STATE_DIR="${EDITRON_STATE_DIR:-$HOME/.local/share/editron}"
APPROVALS_FILE="$EDITRON_STATE_DIR/approvals.json"
POLL_OFFSET_FILE="$EDITRON_STATE_DIR/poll_offset"
INBOX_FILE="$EDITRON_STATE_DIR/inbox.jsonl"

mkdir -p "$EDITRON_STATE_DIR"
[[ -f "$APPROVALS_FILE" ]] || echo '{}' > "$APPROVALS_FILE"

if [[ ! -f "$EDITRON_CONFIG" ]]; then
  echo "telegram config missing: $EDITRON_CONFIG" >&2
  echo "create it with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (chmod 600)" >&2
  return 1 2>/dev/null || exit 1
fi
# shellcheck disable=SC1090
source "$EDITRON_CONFIG"

: "${TELEGRAM_BOT_TOKEN:?not set in $EDITRON_CONFIG}"
: "${TELEGRAM_CHAT_ID:?not set in $EDITRON_CONFIG — run /start in the bot chat and add the chat id}"

TG_API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"

tg_send_message() {
  local text="$1"
  local reply_markup="${2:-}"
  local parse_mode="${3:-Markdown}"
  local args=(-s -X POST "$TG_API/sendMessage"
    --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}"
    --data-urlencode "text=${text}"
    --data-urlencode "disable_web_page_preview=false")
  if [[ -n "$parse_mode" ]]; then
    args+=(--data-urlencode "parse_mode=${parse_mode}")
  fi
  if [[ -n "$reply_markup" ]]; then
    args+=(--data-urlencode "reply_markup=${reply_markup}")
  fi
  local resp
  resp=$(curl "${args[@]}")
  # markdown fallback: if the server rejects our entities, retry as plain text
  if [[ -n "$parse_mode" ]] && echo "$resp" | grep -q '"ok":false' && \
     echo "$resp" | grep -q "can't parse entities"; then
    local plain_args=(-s -X POST "$TG_API/sendMessage"
      --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}"
      --data-urlencode "text=${text}")
    if [[ -n "$reply_markup" ]]; then
      plain_args+=(--data-urlencode "reply_markup=${reply_markup}")
    fi
    resp=$(curl "${plain_args[@]}")
  fi
  echo "$resp"
}

tg_send_video() {
  local path="$1"
  local caption="${2:-}"
  if [[ ! -f "$path" ]]; then
    echo "file not found: $path" >&2
    return 1
  fi
  local size_bytes
  size_bytes=$(stat -c%s "$path" 2>/dev/null || stat -f%z "$path" 2>/dev/null)
  # telegram bot api limit for sendVideo is 50MB
  if (( size_bytes > 50 * 1024 * 1024 )); then
    tg_send_message "⚠️ video too large for Bot API ($((size_bytes / 1024 / 1024)) MB, max 50). path: \`$path\`"
    return 1
  fi
  curl -s -X POST "$TG_API/sendVideo" \
    -F "chat_id=${TELEGRAM_CHAT_ID}" \
    -F "video=@${path}" \
    -F "caption=${caption}" \
    -F "parse_mode=Markdown" \
    -F "supports_streaming=true"
}

tg_answer_callback() {
  local cb_id="$1"
  local text="${2:-}"
  curl -s -X POST "$TG_API/answerCallbackQuery" \
    --data-urlencode "callback_query_id=${cb_id}" \
    --data-urlencode "text=${text}" \
    --data-urlencode "show_alert=false" >/dev/null
}

tg_edit_message() {
  local chat_id="$1"
  local message_id="$2"
  local text="$3"
  curl -s -X POST "$TG_API/editMessageText" \
    --data-urlencode "chat_id=${chat_id}" \
    --data-urlencode "message_id=${message_id}" \
    --data-urlencode "text=${text}" \
    --data-urlencode "parse_mode=Markdown" >/dev/null
}

inbox_append() {
  local kind="$1" text="$2" message_id="${3:-}"
  jq -cn \
    --arg kind "$kind" \
    --arg text "$text" \
    --arg mid "$message_id" \
    --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{kind:$kind, text:$text, message_id:$mid, at:$at}' >> "$INBOX_FILE"
}

approvals_get() {
  local key="$1"
  jq -r --arg k "$key" '.[$k] // empty' "$APPROVALS_FILE"
}

approvals_set() {
  local key="$1" status="$2"
  local tmp
  tmp=$(mktemp)
  jq --arg k "$key" --arg s "$status" --arg t "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '.[$k] = {status: $s, at: $t}' "$APPROVALS_FILE" > "$tmp"
  mv "$tmp" "$APPROVALS_FILE"
}
