#!/usr/bin/env bash
# produce_audio.sh — narration pipeline for one or more CRR hybrid lessons.
# For each "Module N.M": strip markers -> ElevenLabs TTS (intro + segments) -> scribe word
# timings -> repair cues against the transcript -> verify. Idempotent: existing mp3/json are kept.
# Usage: ELEVEN_VOICE_ID=... scripts/lessons/module0/produce_audio.sh 1.5 1.6 3.1
set -u
cd "$(dirname "$0")/../../.."
: "${ELEVEN_VOICE_ID:?set ELEVEN_VOICE_ID}"
for m in "$@"; do
  L="Courses/Car Rental Riches/Module $m"
  echo "=== $m $(date +%H:%M:%S)"
  python3 scripts/lessons/module0/record_scripts.py "$L" || { echo "!! $m record_scripts failed"; continue; }
  python3 scripts/lessons/module0/hybrid_assets.py "$L" tts || { echo "!! $m intro tts failed"; continue; }
  python3 scripts/lessons/module0/hybrid_assets.py "$L" tts-batch v2_scripts_record v2 || { echo "!! $m tts-batch failed"; continue; }
  python3 scripts/lessons/module0/hybrid_assets.py "$L" stt-dir v2 || { echo "!! $m stt failed"; continue; }
  python3 scripts/lessons/module0/fix_cues.py "$L"
  python3 scripts/lessons/module0/check_cues.py "$L" || echo "!! $m cue problems remain"
  t=0; for f in "$L"/work_player/intro.mp3 "$L"/work_player/v2/seg_*.mp3; do t=$(echo "$t + $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")" | bc); done
  echo "--- $m audio total ${t%.*}s"
done
echo "=== DONE $(date +%H:%M:%S)"
