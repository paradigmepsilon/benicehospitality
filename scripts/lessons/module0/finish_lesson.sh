#!/usr/bin/env bash
# finish_lesson.sh — build a CRR hybrid bundle and import it as a draft.
# Usage: scripts/lessons/module0/finish_lesson.sh 1.5 "Lesson title" "One-line summary" <position>
# Requires work_player/v2/{seg_NN.mp3,timings,intro_avatar.mp4,broll_*.mp4} to exist.
set -euo pipefail
cd "$(dirname "$0")/../../.."
m="$1"; title="$2"; summary="$3"; pos="$4"; t="${m/./_}"
L="Courses/Car Rental Riches/Module $m"
python3 scripts/lessons/module0/check_cues.py "$L" >/dev/null
out=$(python3 scripts/lessons/module0/build_hybrid_lesson.py "$L" 2>&1); echo "$out" | tail -2
echo "$out" | grep -q "WARNING missing" && { echo "!! missing videos, not importing"; exit 1; }
MODS=(x the-business-nobody-explains business-foundation market-analysis-vehicle-underwriting acquisition-financing storefront-pricing-lead-time systems-from-car-one insurance-claims-fraud-theft guest-experience-five-star-defense the-money-module the-channels direct-booking-floor-stack from-car-2-to-fifty)
mod="${MODS[${m%%.*}]}"
node --env-file=.env.local --import tsx scripts/import-lesson.ts car-rental-riches "$mod" "lesson-${m/./-}" \
  "$L/Lesson_${t}_Hybrid_Bundle" --title="$title" --summary="$summary" --position="$pos" --minTier=self-paced \
  --mainHtml="Lesson_${t}_Hybrid_v1.html" 2>&1 | tail -2
