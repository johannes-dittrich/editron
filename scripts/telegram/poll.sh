#!/usr/bin/env bash
# Poll Telegram getUpdates for callback queries and write approval decisions.
#
# Usage:
#   scripts/telegram/poll.sh         # single pass, exits
#   scripts/telegram/poll.sh --loop  # loop forever, 5s interval
#
# Each recognized "approve:<pr>" or "reject:<pr>" callback from the authorized
# chat id updates approvals.json and edits the original message so the buttons
# disappear and show the outcome.
#
# Offset is persisted to poll_offset so we don't reprocess old updates.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$DIR/_lib.sh"

loop=0
if [[ "${1:-}" == "--loop" ]]; then
  loop=1
fi

process_once() {
  local offset=0
  if [[ -f "$POLL_OFFSET_FILE" ]]; then
    offset=$(cat "$POLL_OFFSET_FILE")
  fi

  local resp
  resp=$(curl -s "$TG_API/getUpdates?offset=${offset}&timeout=0&allowed_updates=%5B%22callback_query%22%2C%22message%22%5D")
  local ok
  ok=$(echo "$resp" | jq -r '.ok')
  if [[ "$ok" != "true" ]]; then
    echo "getUpdates failed: $resp" >&2
    return 1
  fi

  local updates_len
  updates_len=$(echo "$resp" | jq '.result | length')
  [[ "$updates_len" -eq 0 ]] && return 0

  # iterate
  echo "$resp" | jq -c '.result[]' | while read -r update; do
    local update_id
    update_id=$(echo "$update" | jq -r '.update_id')
    # advance offset past this update regardless of whether we handled it
    echo $((update_id + 1)) > "$POLL_OFFSET_FILE"

    # ----- plain text + voice messages (freeform directives + slash commands) -----
    local msg msg_from msg_chat msg_text msg_id voice_id
    msg=$(echo "$update" | jq -c '.message // empty')
    if [[ -n "$msg" && "$msg" != "null" ]]; then
      msg_from=$(echo "$msg" | jq -r '.from.id')
      msg_chat=$(echo "$msg" | jq -r '.chat.id')
      msg_text=$(echo "$msg" | jq -r '.text // ""')
      msg_id=$(echo "$msg"  | jq -r '.message_id')
      voice_id=$(echo "$msg" | jq -r '.voice.file_id // .audio.file_id // empty')

      if [[ "$msg_from" != "$TELEGRAM_CHAT_ID" ]]; then
        echo "ignored message from unauthorized user $msg_from" >&2
        continue
      fi

      # voice note / audio file → download and transcribe, treat text as directive
      if [[ -n "$voice_id" ]]; then
        local file_resp file_path local_path transcript
        file_resp=$(curl -s "$TG_API/getFile?file_id=${voice_id}")
        file_path=$(echo "$file_resp" | jq -r '.result.file_path // empty')
        if [[ -z "$file_path" ]]; then
          tg_send_message "⚠️ could not fetch voice file: $(echo "$file_resp" | jq -r '.description')" >/dev/null
          continue
        fi
        local_path="$EDITRON_STATE_DIR/voice-${msg_id}.ogg"
        curl -s -o "$local_path" "https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file_path}"
        if transcript=$("$DIR/transcribe-audio.sh" "$local_path" 2>/dev/null); then
          inbox_append "voice" "$transcript" "$msg_id"
          tg_send_message "🎙 *transcribed:* $transcript" >/dev/null
        else
          tg_send_message "⚠️ voice received but transcription failed — set \`ELEVENLABS_API_KEY\` or \`OPENAI_API_KEY\` in \`~/.config/editron/telegram.env\`" >/dev/null
        fi
        rm -f "$local_path"
        continue
      fi

      case "$msg_text" in
        ""|"/start")
          tg_send_message "👋 hi. send me any text to queue a directive for the orchestrator agent. slash-commands: \`/status\` \`/staging\` \`/drain\`" >/dev/null
          ;;
        "/status")
          local c
          c=$(wc -l < "$INBOX_FILE" 2>/dev/null || echo 0)
          tg_send_message "📊 *status*
- inbox pending: ${c}
- orchestrator: check with \`systemctl --user status editron-orchestrator\`
- last commit: \`$(git -C "$HOME/editron" log -1 --format='%h %s' 2>/dev/null || echo unknown)\`" >/dev/null
          ;;
        "/drain")
          local n
          n=$(wc -l < "$INBOX_FILE" 2>/dev/null || echo 0)
          : > "$INBOX_FILE"
          tg_send_message "🗑 drained ${n} queued directive(s)" >/dev/null
          ;;
        /*)
          tg_send_message "unknown command \`${msg_text}\`" >/dev/null
          ;;
        *)
          inbox_append "directive" "$msg_text" "$msg_id"
          tg_send_message "📥 queued: _$(printf '%s' "$msg_text" | head -c 120)_" >/dev/null
          ;;
      esac
      continue
    fi

    # ----- callback queries (approval buttons) -----
    local cb cb_id cb_from cb_data cb_chat cb_msg_id orig_text
    cb=$(echo "$update" | jq -c '.callback_query // empty')
    [[ -z "$cb" || "$cb" == "null" ]] && continue

    cb_id=$(echo "$cb" | jq -r '.id')
    cb_from=$(echo "$cb" | jq -r '.from.id')
    cb_data=$(echo "$cb" | jq -r '.data')
    cb_chat=$(echo "$cb" | jq -r '.message.chat.id')
    cb_msg_id=$(echo "$cb" | jq -r '.message.message_id')
    orig_text=$(echo "$cb" | jq -r '.message.text')

    # authorize: only our chat id
    if [[ "$cb_from" != "$TELEGRAM_CHAT_ID" ]]; then
      tg_answer_callback "$cb_id" "unauthorized"
      echo "rejected callback from unauthorized user $cb_from" >&2
      continue
    fi

    case "$cb_data" in
      approve:*)
        local pr="${cb_data#approve:}"
        approvals_set "pr:${pr}" "approved"
        tg_answer_callback "$cb_id" "queued for merge"
        tg_edit_message "$cb_chat" "$cb_msg_id" "${orig_text}

*decision:* ✅ approved — merging"
        echo "PR #${pr} approved"
        ;;
      reject:*)
        local pr="${cb_data#reject:}"
        approvals_set "pr:${pr}" "rejected"
        tg_answer_callback "$cb_id" "rejected"
        tg_edit_message "$cb_chat" "$cb_msg_id" "${orig_text}

*decision:* ❌ rejected — will close"
        echo "PR #${pr} rejected"
        ;;
      *)
        tg_answer_callback "$cb_id" "unknown callback"
        ;;
    esac
  done
}

if (( loop )); then
  while true; do
    process_once || true
    sleep 5
  done
else
  process_once
fi
