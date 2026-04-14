#!/usr/bin/env bash
# Orchestrator tick — drains the telegram inbox, forwards directives to a
# persistent Claude Code session, and replies to Telegram with the result.
#
# Runs once per invocation (systemd-timer fires it every 15min OR whenever
# the inbox file grows via an inotify trigger — whichever comes first).
#
# Session id is stored at $EDITRON_STATE_DIR/orchestrator.session. If missing
# or expired, the first directive starts a new session.
#
# Safety: orchestrator runs claude with --dangerously-skip-permissions inside
# a locked-down allowlist (the .claude/ harness settings govern what the
# agent can actually do). Main-branch pushes are blocked at the harness layer.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=telegram/_lib.sh
source "$DIR/telegram/_lib.sh"

REPO_DIR="${REPO_DIR:-$HOME/editron}"
SESSION_FILE="$EDITRON_STATE_DIR/orchestrator.session"
LOCK_FILE="$EDITRON_STATE_DIR/orchestrator.lock"

cd "$REPO_DIR"

# single-writer: if a previous tick is still running, bail early
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "previous orchestrator tick still running; skipping" >&2
  exit 0
fi

# drain inbox atomically: move to a temp file, then process
if [[ ! -s "$INBOX_FILE" ]]; then
  exit 0
fi

pending="$(mktemp)"
mv "$INBOX_FILE" "$pending"
: > "$INBOX_FILE"

# concatenate all directives into one prompt. newline between items, bullet
# markers only inside the text so claude never sees a leading dash on the CLI.
prompt="$(jq -r '"• " + .text' < "$pending" | awk 'NR==1{printf "%s", $0; next}{printf "\n%s", $0}')"
if [[ -z "${prompt// /}" ]]; then
  rm -f "$pending"
  exit 0
fi

echo "draining $(wc -l < "$pending") directive(s)…"

session_id=""
if [[ -f "$SESSION_FILE" ]]; then
  session_id="$(cat "$SESSION_FILE")"
fi

run_claude() {
  local args=(-p --output-format json --dangerously-skip-permissions)
  if [[ -n "$session_id" ]]; then
    args+=(--resume "$session_id")
  fi
  # feed the prompt on stdin so no shell parsing / flag confusion
  printf '%s' "$1" | claude "${args[@]}"
}

resp="$(run_claude "$prompt" 2>&1 || true)"

# extract session_id for future ticks
new_sid="$(echo "$resp" | jq -r '.session_id // empty' 2>/dev/null || true)"
if [[ -n "$new_sid" ]]; then
  echo "$new_sid" > "$SESSION_FILE"
fi

# extract agent reply. keep it short for Telegram.
reply="$(echo "$resp" | jq -r '.result // .response // empty' 2>/dev/null || true)"
if [[ -z "$reply" ]]; then
  reply="$(echo "$resp" | head -c 2000)"
fi

# cap at 3500 chars to stay under Telegram's 4096 message limit
if (( ${#reply} > 3500 )); then
  reply="${reply:0:3500}
…
_truncated, full reply in logs_"
fi

"$DIR/telegram/notify.sh" "🤖 orchestrator:
${reply}"

rm -f "$pending"
