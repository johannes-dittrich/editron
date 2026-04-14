# Editron Agent Harness

Infrastructure for running a team of Claude Code agents that build editron in
parallel, coordinated via Telegram and approved through a human merge gate.

## What's wired up so far

### Telegram chat (`@editron_otter_bot`)

Two-way chat between you and the orchestrator. Runs on this VM
(`calm-wolf`) as a long-lived systemd user service.

| Script | Purpose |
|---|---|
| `scripts/telegram/_lib.sh` | Shared helpers — loads creds, `tg_send_message`, `tg_send_video`, `inbox_append`, `approvals_{get,set}`, markdown-fallback. |
| `scripts/telegram/notify.sh` | Plain text notification. Used by `stage.sh`, `merger.sh`, anything else. |
| `scripts/telegram/send-video.sh` | Upload a rendered video (≤50 MB Bot API limit). |
| `scripts/telegram/request-approval.sh` | Send a PR approval message with ✅/❌ inline buttons. Writes `pr:N → pending` into `approvals.json`. |
| `scripts/telegram/transcribe-audio.sh` | ElevenLabs Scribe (preferred) or OpenAI Whisper fallback. |
| `scripts/telegram/poll.sh` | Long-running loop: reads `getUpdates`, handles callback buttons, text directives, and voice notes. Voice notes get auto-transcribed via `transcribe-audio.sh` and appended to `inbox.jsonl` as directives. |

State (gitignored, per-VM):

- `~/.config/editron/telegram.env` — bot token, chat id, ElevenLabs key
- `~/.local/share/editron/inbox.jsonl` — pending directives for the orchestrator
- `~/.local/share/editron/approvals.json` — `{pr:N: {status, at}}`
- `~/.local/share/editron/poll_offset` — Telegram `getUpdates` cursor
- `~/.local/share/editron/orchestrator.session` — Claude Code session id for resume
- `~/.local/share/editron/{poll,orchestrator,merger}.log` — per-component logs

### Loops

| Unit | Cadence | What it does |
|---|---|---|
| `editron-poll.service` | always on | Polls Telegram every 5 s, transcribes voice, updates inbox + approvals. |
| `editron-orchestrator.timer` | every 15 min | Drains `inbox.jsonl`, feeds directives to a persistent Claude Code session via `claude -p --resume`, replies via Telegram. |
| `editron-merger.timer` | every 15 min | Lists open PRs with label `ready`, requests approval, merges/rejects based on button taps. |

All three are user-level systemd units under `~/.config/systemd/user/`. Start /
stop individually with `systemctl --user {start,stop,restart} editron-*`.

### Staging deployments

`scripts/stage.sh <branch>` forks the Azin `production` environment into
`staging-<slug>`, points the web service at the branch, runs the deploy, and
sends a `🟢 staging active — <url>` telegram notification. On failure sends
`🔴 staging deploy failed` with the log pointer. `--destroy` tears down the
env and notifies.

## Flow: you drive it from Telegram

```
you → text msg  ──▶ poll → inbox.jsonl ──▶ orchestrator tick ──▶ claude -p ──▶ reply
you → voice     ──▶ poll → transcribe → inbox.jsonl ──▶ orchestrator tick ──▶ ...
you → ✅/❌      ──▶ poll → approvals.json ──▶ merger tick ──▶ gh pr merge/close
```

Commands recognized in Telegram text:

- `/status` — queued-directives count + last commit
- `/drain` — clear the inbox without running anything
- anything else — queued as a directive for the next orchestrator tick

## Next, not wired yet

- **`/continue` command** — trigger the orchestrator service immediately
  instead of waiting for the 15 min timer.
- **Agent roster** — five track agents (backend / frontend / qa / growth /
  devops), each with its own branch + VM fork + work queue. See `plans/` for
  the 15 plan files that need to be split across tracks.
- **Main-branch protection** — the harness `.claude/settings.json` already
  denies `git push origin main`, but we should add a hook that rejects any
  merge commit not authored by the merger loop.
