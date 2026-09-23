#!/usr/bin/env bash
# reimport_lesson.sh — rebuild one or more already-imported CRR hybrid lessons and re-import them
# as drafts, keeping the title and summary that are in the database.
# finish_lesson.sh is for a first import: it passes --title/--summary, and an empty --title=
# blanks the stored title. This script never passes either.
# Usage: scripts/lessons/module0/reimport_lesson.sh 7.5 4.2 4.3
set -uo pipefail
cd "$(dirname "$0")/../../.."
MODS=(x the-business-nobody-explains business-foundation market-analysis-vehicle-underwriting acquisition-financing storefront-pricing-lead-time systems-from-car-one insurance-claims-fraud-theft guest-experience-five-star-defense the-money-module the-channels direct-booking-floor-stack from-car-2-to-fifty)
fail=0
for m in "$@"; do
  t="${m/./_}"; L="Courses/Car Rental Riches/Module $m"; mod="${MODS[${m%%.*}]}"
  if ! python3 scripts/lessons/module0/check_cues.py "$L" >/dev/null; then echo "!! $m check_cues failed, not importing"; fail=1; continue; fi
  out=$(python3 scripts/lessons/module0/build_hybrid_lesson.py "$L" 2>&1)
  if echo "$out" | grep -q "WARNING missing"; then echo "!! $m missing assets, not importing"; fail=1; continue; fi
  res=$(node --env-file=.env.local --import tsx scripts/import-lesson.ts car-rental-riches "$mod" "lesson-${m/./-}" \
    "$L/Lesson_${t}_Hybrid_Bundle" --position="${m##*.}" --minTier=self-paced \
    --mainHtml="Lesson_${t}_Hybrid_v1.html" 2>&1 | grep -E "Done\.|rror" | tail -1)
  echo "$m  $(echo "$out" | grep -o 'runtime ~[0-9:]*')  $res"
  echo "$res" | grep -q "Done\." || fail=1
done
exit $fail
