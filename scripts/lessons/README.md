# scripts/lessons/ — BNHG Lesson Production Toolkit

These scripts produce Room Rental Riches lesson bundles compatible with the Editorial HTML player. They live alongside `scripts/import-lesson.ts` and are designed to be invoked by Claude Code (which orchestrates HeyGen + Higgsfield via MCP and runs these as local utilities).

---

## One-Time Setup

```bash
# Python deps
pip3 install pillow

# System deps (Mac)
brew install ffmpeg webp

# MCP servers (Claude Code .mcp.json)
# See ../../CLAUDE.md Section 11
```

---

## Per-Lesson Build Flow

This is what Claude Code does for you. The user just drops a spec and approves.

```bash
# 1. User puts spec in Courses/Room Rental Riches/Module 2.6/spec.md
# 2. Claude Code reads CLAUDE.md, spec, prior lesson script
# 3. Claude Code proposes design decisions; user confirms
# 4. Claude Code:

#    a. Calls HeyGen:create_speech via MCP for each slide
#       → saves audio/voiceover_NN.mp3 + captures word_timestamps
#
#    b. Calls Higgsfield:generate_image via MCP for each image slot
#       → saves images/L2-6_SNN_NN_slug.png
#
#    c. Optimizes images to WEBP for the Bundle folder:
       python3 scripts/lessons/optimize_images.py \
         "Courses/Room Rental Riches/Module 2.6/images" \
         "Courses/Room Rental Riches/Module 2.6/Lesson_2_6_Bundle/images"
#
#    d. Builds the lesson HTML from the template:
       python3 scripts/lessons/build_lesson_html.py \
         "Courses/Room Rental Riches/Module 2.6/lesson_spec.json" \
         "Courses/Room Rental Riches/Module 2.6/Lesson_2_6_Bundle/Lesson_2_6_Editorial_v1.html"
#
#    e. Copies SVGs (from prior lesson):
       cp "Courses/Room Rental Riches/Module 2.5/BNHG_full_lockup.svg" \
          "Courses/Room Rental Riches/Module 2.6/Lesson_2_6_Bundle/"
       cp "Courses/Room Rental Riches/Module 2.5/BNHG_letter_mark.svg" \
          "Courses/Room Rental Riches/Module 2.6/Lesson_2_6_Bundle/"
#
#    f. Generates Image Reference manifests:
       python3 scripts/lessons/generate_manifest.py \
         "Courses/Room Rental Riches/Module 2.6/lesson_spec.json" \
         "Courses/Room Rental Riches/Module 2.6/"
#
#    g. Runs quality gates:
       python3 scripts/lessons/emdash_sweep.py \
         "Courses/Room Rental Riches/Module 2.6/"

# 5. User reviews the Bundle folder
# 6. User runs the importer:
       tsx scripts/import-lesson.ts \
         room-rental-riches \
         legal-regulatory-business-setup \
         lesson-2-6 \
         "Courses/Room Rental Riches/Module 2.6/Lesson_2_6_Bundle" \
         --title="Southeast Regulatory Landscape" \
         --summary="A 30,000-foot view before we go state by state." \
         --position=6 \
         --minTier=self-paced \
         --mainHtml=Lesson_2_6_Editorial_v1.html
```

---

## Module 2.1 to 2.5 Migration

For each lesson that was originally built as concat-MP4:

```bash
# 1. Convert existing TTS WAVs to MP3 (reuse, no new TTS calls):
python3 scripts/lessons/convert_audio.py \
  "Courses/Room Rental Riches/Module 2.1/raw_segments/audio/" \
  "Courses/Room Rental Riches/Module 2.1/Lesson_2_1_Bundle/audio/"

# 2. Generate per-slide Higgsfield imagery (this is new for Module 2)
# 3. Build the lesson HTML using the redesigned slide spec
# 4. Generate manifests
# 5. Delete legacy MP4 + SRT + raw_segments
# 6. Re-import:
tsx scripts/import-lesson.ts \
  room-rental-riches legal-regulatory-business-setup lesson-2-1 \
  "Courses/Room Rental Riches/Module 2.1/Lesson_2_1_Bundle" \
  --mainHtml=Lesson_2_1_Editorial_v1.html
```

The import is idempotent on `(lesson_id, relative_path)`, so re-importing cleanly replaces the old MP4-based assets.

---

## Spec format

Each lesson has a `lesson_spec.json` adjacent to its `spec.md`. The spec.md is human writing; the .json is the machine-readable structured form Claude Code generates from it.

```json
{
  "course": "room-rental-riches",
  "module": "legal-regulatory-business-setup",
  "lesson_slug": "lesson-2-6",
  "module_num": 2,
  "lesson_num": 6,
  "lesson_title": "Southeast Regulatory Landscape",
  "disclaimer_topic": "regulatory",
  "runtime_estimate": "10:30",
  "slides": [
    {
      "num": 1,
      "layout": "cover",
      "classes": "active",
      "title_label": "Module 2 · Lesson 6",
      "audio_file": "audio/voiceover_01.mp3",
      "vo_script": "Welcome back. Now we zoom out...",
      "content": {
        "eyebrow": "Module 2 · Lesson 6",
        "h1": "Southeast Regulatory <em class='italic-green'>Landscape</em>",
        "subtitle": "A 30,000-foot view before we go state by state.",
        "meta": "10 min · 12 slides · Be Nice Hospitality Group"
      },
      "images": [
        { "slot": "background", "filename": "L2-6_S01_01_cover_hero.png", "aspect_ratio": "16:9", "subject": "..." }
      ]
    },
    ...
  ]
}
```

`build_lesson_html.py` reads this and the player template, fills the slides, and outputs the final HTML.

---

## Files in this directory

- `README.md` — this file
- `config/avatars.json` — per-module avatar IDs (read by Claude Code, not the scripts)
- `templates/lesson_player.html` — the player chrome extracted from Lesson 1.2 with `{{LESSON_CONFIG_JSON}}` and `{{SLIDES_HTML}}` markers
- `templates/layouts/*.html` — per-layout slide snippets with placeholders
- `build_lesson_html.py` — assembles the lesson HTML from spec + template
- `optimize_images.py` — Pillow-based PNG → WEBP conversion (quality 85)
- `generate_manifest.py` — produces `Image_Reference.csv` + `.md`
- `convert_audio.py` — ffmpeg WAV → MP3 (for Module 2.1-2.5 migration)
- `emdash_sweep.py` — scans for `\u2014` and `\u2013` across a directory
- `_shared.py` — STYLE_PROMPT, design tokens, lesson helpers
