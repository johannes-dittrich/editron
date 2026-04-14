#!/usr/bin/env bash
# Transcribe an audio file using ElevenLabs Scribe (preferred) or OpenAI Whisper
# as a fallback. Writes the transcription text to stdout.
#
# Usage:
#   scripts/telegram/transcribe-audio.sh <path-to-audio>
#
# Keys (one of these must be set, loaded from $EDITRON_CONFIG or environment):
#   ELEVENLABS_API_KEY   — preferred
#   OPENAI_API_KEY       — fallback (Whisper)

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$DIR/_lib.sh"

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <audio-file>" >&2
  exit 1
fi

path="$1"
if [[ ! -f "$path" ]]; then
  echo "file not found: $path" >&2
  exit 1
fi

# ElevenLabs Scribe — single short audio
if [[ -n "${ELEVENLABS_API_KEY:-}" ]]; then
  resp=$(curl -sS -X POST https://api.elevenlabs.io/v1/speech-to-text \
    -H "xi-api-key: ${ELEVENLABS_API_KEY}" \
    -F "file=@${path}" \
    -F "model_id=scribe_v1" \
    -F "diarize=false" \
    -F "tag_audio_events=false" \
    -F "timestamps_granularity=none")
  text=$(echo "$resp" | jq -r '.text // empty' 2>/dev/null || true)
  if [[ -n "$text" ]]; then
    printf '%s' "$text"
    exit 0
  fi
  echo "elevenlabs returned no text: $resp" >&2
  # fall through to whisper if configured
fi

# OpenAI Whisper fallback
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  resp=$(curl -sS -X POST https://api.openai.com/v1/audio/transcriptions \
    -H "Authorization: Bearer ${OPENAI_API_KEY}" \
    -F "file=@${path}" \
    -F "model=whisper-1")
  text=$(echo "$resp" | jq -r '.text // empty' 2>/dev/null || true)
  if [[ -n "$text" ]]; then
    printf '%s' "$text"
    exit 0
  fi
  echo "whisper returned no text: $resp" >&2
fi

echo "no transcription provider configured (set ELEVENLABS_API_KEY or OPENAI_API_KEY in $EDITRON_CONFIG)" >&2
exit 1
