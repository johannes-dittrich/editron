#!/usr/bin/env bash
# Merger loop — scans open PRs, requests approval via Telegram, and merges
# the ones the human approved.
#
# Runs once per invocation (systemd-timer fires it every 15min). For every
# open PR on the origin repo:
#
#   - unknown   → request approval (buttons), write "pending" to approvals.json
#   - pending   → skip, human hasn't tapped yet
#   - approved  → gh pr merge --squash --delete-branch, notify
#   - rejected  → gh pr close --comment, notify
#
# Requires: gh auth, telegram scripts, approvals.json writable.
# The poll.sh loop is responsible for flipping pending → approved/rejected.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=telegram/_lib.sh
source "$DIR/telegram/_lib.sh"

REPO_DIR="${REPO_DIR:-$HOME/editron}"
READY_LABEL="${READY_LABEL:-ready}"

cd "$REPO_DIR"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh not installed" >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  # fall back to the boxd git credential helper token
  export GH_TOKEN="$(echo -e 'protocol=https\nhost=github.com\n' | git credential fill 2>/dev/null | awk -F= '/^password=/{print $2}')"
  if [[ -z "${GH_TOKEN:-}" ]]; then
    echo "no gh auth and no boxd credential; cannot query PRs" >&2
    exit 1
  fi
fi

# list open PRs with the ready label. empty list is a normal no-op exit.
prs_json="$(gh pr list --state open --label "$READY_LABEL" --limit 50 \
  --json number,title,headRefName,headRefOid,url 2>/dev/null || echo '[]')"

count="$(echo "$prs_json" | jq 'length')"
if (( count == 0 )); then
  exit 0
fi

echo "$prs_json" | jq -c '.[]' | while read -r pr; do
  number=$(echo "$pr"  | jq -r '.number')
  title=$(echo "$pr"   | jq -r '.title')
  branch=$(echo "$pr"  | jq -r '.headRefName')
  url=$(echo "$pr"     | jq -r '.url')
  key="pr:${number}"
  status="$(approvals_get "$key" | jq -r '.status // empty' 2>/dev/null || true)"

  case "$status" in
    "")
      # never asked — compute the staging url for this branch and send request
      slug_clean="$(printf '%s' "$branch" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
      case "$slug_clean" in
        staging-*) slug="$slug_clean" ;;
        *)         slug="staging-$slug_clean" ;;
      esac
      staging_url="$(zin service open web -e "$slug" -p editron --json 2>/dev/null | jq -r .url || true)"
      summary="*${title}*
branch: \`${branch}\`
${url}"
      "$DIR/telegram/request-approval.sh" "$number" "$summary" "${staging_url:-}"
      ;;
    pending)
      # waiting for human
      ;;
    approved)
      echo "merging PR #${number}"
      if gh pr merge "$number" --squash --delete-branch --admin 2>&1; then
        "$DIR/telegram/notify.sh" "✅ *merged* PR #${number} — ${title}
${url}"
        approvals_set "$key" "merged"
        # best-effort staging teardown
        "$DIR/stage.sh" --destroy "$branch" 2>/dev/null || true
      else
        "$DIR/telegram/notify.sh" "⚠️ PR #${number} could not be auto-merged (conflicts or checks). check manually: ${url}"
        approvals_set "$key" "merge_failed"
      fi
      ;;
    rejected)
      echo "closing PR #${number}"
      gh pr close "$number" --comment "rejected via merger loop" 2>&1 || true
      "$DIR/telegram/notify.sh" "❌ *rejected & closed* PR #${number} — ${title}"
      approvals_set "$key" "closed"
      "$DIR/stage.sh" --destroy "$branch" 2>/dev/null || true
      ;;
    merged|closed|merge_failed)
      # nothing to do
      ;;
  esac
done
