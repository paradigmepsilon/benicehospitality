#!/usr/bin/env bash
# rerecord_segments.sh — re-record specific segments of already-imported CRR lessons whose
# script text was corrected after the audio was made, then rebuild and re-import them.
#
# For each lesson:seg pair it parks the stale mp3 and timing file in work_player/v2/_stale/
# (out of reach of the seg_*.mp3 globs), runs produce_audio.sh (which records only what is
# missing, so one segment costs one segment), then reimport_lesson.sh (keeps title and summary).
#
# Preflight: reads the ElevenLabs balance and refuses to start unless it covers every queued
# segment at ~0.55 credits per character (eleven_v3 plus scribe timings, measured 0.50 to 0.51).
#
# Usage:
#   scripts/lessons/module0/rerecord_segments.sh [--dry-run] 4.2:12 4.3:12 7.3:12 7.4:12 7.5:12 7.5:13
set -uo pipefail
cd "$(dirname "$0")/../../.."
DRY=0; [ "${1:-}" = "--dry-run" ] && { DRY=1; shift; }
[ $# -gt 0 ] || { sed -n 2,14p "$0"; exit 2; }
export ELEVEN_VOICE_ID="${ELEVEN_VOICE_ID:-c3EeAYYvate8k0VKaxQL}"   # Alex_H; hybrid_assets.py refuses anything else for CRR

key=$(grep '^ELEVENLABS_API_KEY=' .env.local | cut -d= -f2- | tr -d '"')
[ -n "$key" ] || { echo "ELEVENLABS_API_KEY not in .env.local"; exit 1; }
sub=$(curl -s -H "xi-api-key: $key" https://api.elevenlabs.io/v1/user/subscription)
left=$(python3 -c "import json,sys; d=json.loads(sys.argv[1]); print(d['character_limit']-d['character_count'])" "$sub")

need=0; plan=()
for pair in "$@"; do
  m="${pair%%:*}"; sg="${pair##*:}"; L="Courses/Car Rental Riches/Module $m"
  [ -f "$L/work_player/v2_scripts.json" ] || { echo "!! $m has no scripts"; exit 1; }
  n=$(python3 -c "import json,sys,re; t=json.load(open(sys.argv[1]))[sys.argv[2]]; print(len(re.sub(r'\[(ALEX INPUT NEEDED|VERIFY):[^\]]*\]','',t)))" "$L/work_player/v2_scripts.json" "$sg")
  need=$((need + n)); plan+=("$m seg $sg: $n chars")
done
cost=$(( need * 55 / 100 ))
printf '%s\n' "${plan[@]}"
echo "queued: $need characters, about $cost credits; ElevenLabs has $left"
if [ "$left" -lt "$cost" ]; then echo "!! not enough credits. Nothing recorded."; exit 3; fi
[ $DRY = 1 ] && { echo "dry run: would record the above, then rebuild and re-import."; exit 0; }

lessons=()
for pair in "$@"; do
  m="${pair%%:*}"; sg="${pair##*:}"; L="Courses/Car Rental Riches/Module $m"; v="$L/work_player/v2"
  mkdir -p "$v/_stale"
  [ -f "$v/seg_$sg.mp3" ] && mv "$v/seg_$sg.mp3" "$v/_stale/seg_${sg}_$(date +%Y%m%d).mp3"
  [ -f "$v/timings/seg_$sg.json" ] && mv "$v/timings/seg_$sg.json" "$v/_stale/seg_${sg}_$(date +%Y%m%d).json"
  case " ${lessons[*]:-} " in *" $m "*) ;; *) lessons+=("$m");; esac
done
echo "=== recording"
scripts/lessons/module0/produce_audio.sh "${lessons[@]}" 2>&1 | grep -E "^===|^!!|^tts |^stt |repaired|->|PROBLEMS|^  S|audio total|cues resolve"
echo "=== read every '->' line above: that is fix_cues moving a cue, and it can land wrong (see BUILD_STATUS 09-19, 5.4 seg 11)"
echo "=== rebuild + re-import"
scripts/lessons/module0/reimport_lesson.sh "${lessons[@]}"
