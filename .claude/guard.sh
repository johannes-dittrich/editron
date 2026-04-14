#!/usr/bin/env bash
# PreToolUse hook: belt-and-suspenders check for Bash calls.
# The settings.json deny-list is the primary defense; this catches
# things the glob matcher misses (piped commands, creative quoting).
#
# Input: JSON on stdin with {tool_name, tool_input:{command, ...}}
# Output: exit 0 = allow, exit 2 = block with message on stderr.

set -euo pipefail

payload="$(cat)"
cmd="$(printf '%s' "$payload" | /usr/bin/python3 -c \
  'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("command",""))' \
  2>/dev/null || true)"

if [[ -z "$cmd" ]]; then
  exit 0
fi

block() {
  echo "guard.sh blocked: $1" >&2
  echo "command was: $cmd" >&2
  exit 2
}

# Never touch main/master directly.
if [[ "$cmd" =~ git[[:space:]]+push.*(origin[[:space:]]+)?(main|master)([[:space:]]|$) ]]; then
  block "push to main/master"
fi

# No force anything.
if [[ "$cmd" =~ --force|[[:space:]]-f([[:space:]]|$) ]] && [[ "$cmd" =~ git[[:space:]]+push ]]; then
  block "force push"
fi

# No destructive resets.
if [[ "$cmd" =~ git[[:space:]]+reset[[:space:]]+--hard ]]; then
  block "git reset --hard"
fi

# No piping untrusted downloads into a shell.
if [[ "$cmd" =~ (curl|wget).*\|[[:space:]]*(sh|bash|zsh) ]]; then
  block "pipe-to-shell install"
fi

# No reading or writing secrets.
if [[ "$cmd" =~ (\.env($|[[:space:]/])|id_rsa|\.pem($|[[:space:]])) ]]; then
  block "touching secrets file"
fi

# No installing new dependencies without explicit approval.
if [[ "$cmd" =~ (pip[[:space:]]+install|uv[[:space:]]+add|poetry[[:space:]]+add) ]]; then
  block "installing new dependencies"
fi

# No merging PRs — human approves.
if [[ "$cmd" =~ gh[[:space:]]+pr[[:space:]]+merge ]]; then
  block "gh pr merge (human approves merges)"
fi

# No sudo, ever.
if [[ "$cmd" =~ (^|[[:space:]])sudo([[:space:]]|$) ]]; then
  block "sudo"
fi

exit 0
