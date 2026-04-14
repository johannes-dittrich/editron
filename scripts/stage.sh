#!/usr/bin/env bash
# Create or update a per-branch staging deployment on Azin.
#
# Usage:
#   scripts/stage.sh                 # stage the current branch
#   scripts/stage.sh <branch>        # stage a specific branch
#   scripts/stage.sh --destroy       # destroy the staging env for the current branch
#   scripts/stage.sh --destroy <br>  # destroy a specific one
#
# Each branch maps to its own Azin environment, forked from production on
# first use. The App service's source is repointed at the target branch,
# and the local branch is mirrored to johannes-dittrich/editron to trigger
# the Azin build. Subsequent runs on the same branch are idempotent.

set -euo pipefail

PROJECT="editron"
SERVICE="web"
MIRROR_REMOTE="mirror"
PRODUCTION_ENV="production"

# optional telegram notifier — no-op if scripts aren't present or creds missing
notify() {
  local msg="$1"
  local notifier
  notifier="$(dirname "${BASH_SOURCE[0]}")/telegram/notify.sh"
  if [[ -x "$notifier" ]]; then
    "$notifier" "$msg" 2>/dev/null || true
  fi
}

usage() {
  sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

destroy=0
branch=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --destroy) destroy=1 ;;
    -h|--help) usage ;;
    *)
      if [[ -z "$branch" ]]; then
        branch="$1"
      else
        echo "unexpected extra argument: $1" >&2
        usage 1
      fi
      ;;
  esac
  shift
done

if [[ -z "$branch" ]]; then
  branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$branch" == "HEAD" ]]; then
    echo "detached HEAD — pass an explicit branch name" >&2
    exit 1
  fi
fi

# env slug: lowercase, replace anything non-alnum with '-', collapse runs, trim.
# drop an existing 'staging' prefix so 'staging/foo' → 'staging-foo' (not
# 'staging-staging-foo').
clean="$(printf '%s' "$branch" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
case "$clean" in
  staging-*) slug="$clean" ;;
  *)         slug="staging-$clean" ;;
esac

# refuse to stage branches that are already production sources — otherwise
# `stage.sh main` would fight production for the same env/service.
case "$branch" in
  main|master|production|setup/claude-harness)
    echo "'$branch' is a production source; staging would collide. refusing." >&2
    exit 1
    ;;
esac

if (( destroy )); then
  printf '\033[1;33m→ destroying staging env %s\033[0m\n' "$slug"
  printf '%s\n' "$slug" | zin environment delete "$slug" -p "$PROJECT" 2>&1 || true
  notify "🗑 staging env \`${slug}\` destroyed (branch \`${branch}\`)"
  echo "done."
  exit 0
fi

printf '\033[1;34m→ branch:      %s\033[0m\n' "$branch"
printf '\033[1;34m→ staging env: %s\033[0m\n' "$slug"

# 1. mirror the branch so johannes-dittrich/editron has a matching ref
printf '\033[1;34m→ mirroring branch to %s\033[0m\n' "$MIRROR_REMOTE"
git push --force "$MIRROR_REMOTE" "$branch:$branch"

# 2. create the staging env if it doesn't exist yet (fork from production)
if zin environment get "$slug" -p "$PROJECT" >/dev/null 2>&1; then
  printf '\033[1;34m→ env %s already exists — reusing\033[0m\n' "$slug"
else
  printf '\033[1;34m→ forking %s → %s\033[0m\n' "$PRODUCTION_ENV" "$slug"
  zin environment fork "$PRODUCTION_ENV" --name "$slug" -p "$PROJECT" >/dev/null
fi

# 3. retarget the web service at this branch on the mirror repo
#    the production env already has the repo wired up, and fork copies it.
printf '\033[1;34m→ pointing %s at branch %s\033[0m\n' "$SERVICE" "$branch"
mirror_repo_id="$(zin repo list -e "$slug" --search editron --json 2>/dev/null \
  | jq -r '.page[] | select(.fullName == "johannes-dittrich/editron") | ._id')"

if [[ -z "$mirror_repo_id" ]]; then
  echo "cannot find johannes-dittrich/editron in Azin repo list for env $slug" >&2
  exit 1
fi

zin service set source "$SERVICE" \
  --type github \
  --repo "$mirror_repo_id" \
  --branch "$branch" \
  --build-type dockerfile \
  --dockerfile Dockerfile \
  --build-context website \
  -e "$slug" >/dev/null

# 4. deploy the env. with auto-deploy enabled, pushes also trigger a rebuild —
#    but the first deploy needs an explicit run to apply the source change.
printf '\033[1;34m→ running deploy\033[0m\n'
echo y | zin deploy run -e "$slug" >/dev/null

# 5. wait for the deploy to reach a terminal state
printf '\033[1;34m→ waiting for rollout\033[0m'
for _ in $(seq 1 120); do
  st="$(zin deploy status -e "$slug" --json 2>/dev/null | jq -r .status 2>/dev/null || true)"
  case "$st" in
    active|deployed)
      printf '\n\033[1;32m✓ rollout complete (%s)\033[0m\n' "$st"
      break
      ;;
    failed|cancelled)
      printf '\n\033[1;31m✗ rollout %s\033[0m\n' "$st"
      zin service builds "$SERVICE" -e "$slug" --json | jq -r '.[0].lastLogLines[]' 2>/dev/null || true
      notify "🔴 staging deploy *failed* — branch \`${branch}\` env \`${slug}\`
run \`zin service builds ${SERVICE} -e ${slug}\` for logs"
      exit 1
      ;;
    *)
      printf '.'
      sleep 3
      ;;
  esac
done

# 6. print the live URL
url="$(zin service open "$SERVICE" -e "$slug" --json 2>/dev/null | jq -r .url || true)"
if [[ -n "$url" && "$url" != "null" ]]; then
  printf '\n\033[1;32m🟢 %s → %s\033[0m\n' "$branch" "$url"
  notify "🟢 staging *active* — branch \`${branch}\`
${url}"
else
  printf '\033[1;33m(could not resolve public URL — run: zin service open %s -e %s)\033[0m\n' "$SERVICE" "$slug"
  notify "🟡 staging deployed but public URL unknown — env \`${slug}\` branch \`${branch}\`"
fi
