# Module 2.1 to 2.5 Migration Plan

These five lessons were built in the legacy concat-MP4 pattern (one `Lesson_2_X_<Topic>.mp4` + SRT + raw_segments). They need to be redone in the Editorial HTML player pattern matching Module 1.2 through 1.6.

## Current state

```
Courses/Room Rental Riches/Module 2.X/
├── raw_segments/
│   ├── audio/                          ← KEEP (will convert WAV → MP3)
│   │   ├── slide_01_<topic>.wav
│   │   └── ...
│   ├── slides/
│   │   ├── slide_01.html               ← REWRITE in Editorial layouts
│   │   ├── slide_01_states/            ← DELETE
│   │   └── ...
│   ├── segment_01.mp4                  ← DELETE
│   └── ...
├── BNHG_full_lockup.svg                ← KEEP (move to Bundle folder)
├── BNHG_letter_mark.svg                ← KEEP (move to Bundle folder)
├── Lesson_2_X_<Topic>.mp4              ← DELETE
├── Lesson_2_X_<Topic>.srt              ← DELETE (the player generates captions live)
└── Lesson_2_X_Script_FINAL.md          ← KEEP and update for the new structure
```

## Target state

```
Courses/Room Rental Riches/Module 2.X/
├── Lesson_2_X_Bundle/                          ← SERVED FORMAT
│   ├── audio/
│   │   ├── voiceover_01.mp3
│   │   └── ...
│   ├── images/                                 ← WEBP optimized
│   │   ├── L2-X_S01_01_<slug>.webp
│   │   └── ...
│   ├── BNHG_full_lockup.svg
│   ├── BNHG_letter_mark.svg
│   └── Lesson_2_X_Editorial_v1.html
├── audio/                                       ← MP3 copies (top-level)
├── images/                                      ← PNG masters (top-level)
│   ├── L2-X_S01_01_<slug>.png
│   └── ...
├── BNHG_full_lockup.svg
├── BNHG_letter_mark.svg
├── Lesson_2_X_Image_Reference.csv
├── Lesson_2_X_Image_Reference.md
├── Lesson_2_X_Script_FINAL.md                  ← Updated
└── spec.md                                      ← Lesson spec (for reference)
```

## Per-lesson procedure (one at a time, user approves each before proceeding)

### Step 1 — Audit existing content

Read `Module 2.X/Lesson_2_X_Script_FINAL.md` and `raw_segments/slides/slide_NN.html`. Build a mapping of current slide content to the Editorial layout library.

Likely mappings:
- Title slide → `cover`
- "Don't do this" / "Here's the rule" → `spread reverse large-text`
- Lists of states / steps / categories → `card-grid cols-2` or `card-grid cols-3`
- "The two paths" → `two-col`
- Big stat moments → `hero-stat`
- Three categories / three pillars → `three-col`
- "The question to ask yourself" → `quote` (used sparingly, once per lesson max)
- Action step → `action`
- Next-up preview → `card-grid cols-2 large-headline`

### Step 2 — Convert existing audio

```bash
python3 scripts/lessons/convert_audio.py \
  "Courses/Room Rental Riches/Module 2.X/raw_segments/audio/" \
  "Courses/Room Rental Riches/Module 2.X/audio/"
```

This produces `voiceover_01.mp3`, `voiceover_02.mp3`, ... in numerical order based on the original WAV filenames. The default sort key handles `slide_01_intro.wav`, `block_2_template.wav`, and `voiceover_02.wav` correctly.

**Caveat:** if the original WAV count doesn't match the redesigned slide count, regenerate the affected slides via HeyGen `create_speech` rather than trying to remap.

Then copy MP3s into the Bundle folder:
```bash
mkdir -p "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle/audio"
cp "Courses/Room Rental Riches/Module 2.X/audio/"*.mp3 \
   "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle/audio/"
```

### Step 3 — Generate per-slide imagery

This is new for Module 2 (the original builds had no per-slide imagery). Claude Code does this via Higgsfield MCP. See CLAUDE.md Section 5.

Budget: 20-40 images per lesson. Module 2.1 through 2.5 have 12-18 slides each, so expect ~25-40 images per lesson × 5 lessons = ~150-200 images total. At Nano Banana Pro pricing, that's a meaningful Higgsfield credit spend — confirm budget with the user before starting.

### Step 4 — Build the lesson HTML

Generate `lesson_spec.json` and run:

```bash
python3 scripts/lessons/build_lesson_html.py \
  "Courses/Room Rental Riches/Module 2.X/lesson_spec.json" \
  "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle/Lesson_2_X_Editorial_v1.html"
```

### Step 5 — Optimize images + generate manifest

```bash
python3 scripts/lessons/optimize_images.py \
  "Courses/Room Rental Riches/Module 2.X/images" \
  "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle/images"

python3 scripts/lessons/generate_manifest.py \
  "Courses/Room Rental Riches/Module 2.X/lesson_spec.json" \
  "Courses/Room Rental Riches/Module 2.X/"
```

### Step 6 — Copy SVGs

```bash
cp "Courses/Room Rental Riches/Module 2.X/BNHG_full_lockup.svg" \
   "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle/"
cp "Courses/Room Rental Riches/Module 2.X/BNHG_letter_mark.svg" \
   "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle/"
```

### Step 7 — Quality gates

```bash
python3 scripts/lessons/emdash_sweep.py "Courses/Room Rental Riches/Module 2.X/"
```

Plus visual review by user in browser (open the Editorial HTML directly in Chrome to test playback).

### Step 8 — Delete legacy outputs

After user approves the new bundle:

```bash
rm -rf "Courses/Room Rental Riches/Module 2.X/raw_segments"
rm "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_"*.mp4
rm "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_"*.srt
```

### Step 9 — Re-import to Neon Postgres

```bash
tsx scripts/import-lesson.ts \
  room-rental-riches legal-regulatory-business-setup lesson-2-X \
  "Courses/Room Rental Riches/Module 2.X/Lesson_2_X_Bundle" \
  --mainHtml=Lesson_2_X_Editorial_v1.html
```

The import is idempotent on `(lesson_id, relative_path)`. The old MP4-format `lesson_assets` rows get replaced row-by-row. The `body_kind` auto-flips from `video` to `bundle`. The lesson's `video_url` column should be cleared — verify with a `SELECT video_url, body_kind FROM course_lessons WHERE slug = 'lesson-2-X'` after import. If `video_url` is still set, manually clear it:

```sql
UPDATE course_lessons SET video_url = NULL
WHERE slug = 'lesson-2-X' AND body_kind = 'bundle';
```

### Step 10 — Manual verification in the live app

Load the lesson in the LMS as an enrolled user. Verify:
- Slides load and advance correctly
- Audio plays in sequence
- Resume works (refresh page mid-slide, re-enter, audio should pick up roughly where it left off)
- Overview panel shows correct slide titles
- Fullscreen toggle works on the iframe

## Order of operations

1. **Module 2.1** — Why Legal & Regulatory Comes First (3:20, smallest, fastest test case)
2. **User reviews 2.1.** Approves or requests changes. Do not touch 2.2 until 2.1 is locked.
3. Module 2.2 — Choosing Your Business Structure (5:07)
4. Module 2.3 — LLC + Banking + EIN (7:09)
5. Module 2.4 — Tax Foundations (7:59)
6. Module 2.5 — MTR-Specific Insurance (7:22)
7. Once all five are migrated, proceed to fresh builds for 2.6 onward.

## Risk + cost

- **Higgsfield credits:** ~150-200 images × ~30-50 credits each = ~5,000-10,000 credits across the five lessons. Confirm with the user before starting.
- **No new HeyGen credits needed** — existing WAVs reused.
- **Time:** roughly 1-2 hours of Claude Code work per lesson (image generation is the bottleneck — image jobs run async).
- **Risk:** the visual identity shifts from "Module 1 video-style slides" to "Module 1 editorial-style slides" — should feel like a coherent upgrade, not a different course. Visual review after Module 2.1 is critical.
