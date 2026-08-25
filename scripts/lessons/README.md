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

## Stock b-roll (hybrid lessons)

`module0/stock_broll.py` fills the `video-split` b-roll slots from Pexels and
Pixabay instead of paid AI video generation. Both APIs are free and allow
commercial use with no attribution required.

**Keys** — add to `.env.local` (same lookup as `ELEVENLABS_API_KEY`):

```
PEXELS_API_KEY=...      # pexels.com/api  — free, no card
PIXABAY_API_KEY=...     # pixabay.com/api — free, no card
```

Either key alone works; the script just searches fewer sources.

**Spec** — give any slide that has a `video` an optional `stock` block. The
lesson builder ignores the key, so existing specs keep building byte-identically.

```json
{
  "layout": "video-split",
  "seg": "02",
  "video": "broll_02.mp4",
  "stock": {
    "query": "bedroom interior bed",
    "avoid": ["cartoon", "logo"],
    "pick": { "provider": "pexels", "id": 6658333 },
    "crop_x": 0.5,
    "crop_y": 0.5,
    "fit": "cover"
  }
}
```

`avoid`, `pick`, `crop_x`, `crop_y`, and `fit` are all optional. Use `pick` to lock a clip once
you've chosen it from `preview`, so later runs stay reproducible.

**Write queries as concrete nouns, not mood.** Stock search matches tags, and
atmospheric words beat the subject:
`"furnished bedroom apartment natural window light"` returns mountain sunrises
and rain on glass; `"bedroom interior bed"` returns bedrooms.

**Run** — `search`, then `preview`, then `fetch`:

```bash
# rank candidates per slot, no downloads
python3 scripts/lessons/module0/stock_broll.py "…/Module 1.2" search

# contact sheet of the top 8 per slot, cropped to the slot shape
python3 scripts/lessons/module0/stock_broll.py "…/Module 1.2" preview

# download + normalize -> work_player/v2/
python3 scripts/lessons/module0/stock_broll.py "…/Module 1.2" fetch

# redo one slot after changing its query or pick
python3 scripts/lessons/module0/stock_broll.py "…/Module 1.2" fetch broll_02.mp4 --force
```

`fetch` skips slots whose mp4 already exists. Then run `build_hybrid_lesson.py`
as usual.

**Always `preview` before `fetch` for anything student-facing.** Titles and tags
do not tell you what is in frame — `"nurse walking hospital corridor"` returned
a neonatal ICU as its top-ranked result. Sheets land in
`work_player/v2/stock_preview/`; tiles are ordered left to right, top to bottom
to match the printed legend (they are not numbered in-image, because `drawtext`
needs libfreetype and Homebrew's ffmpeg ships without it).

**Aspect ratio.** Clips are encoded to the shape of the slot they fill, so the
browser never crops:

| Layout | Output |
|---|---|
| `video-split` | 1008x1080 (the 1.1fr column of the 1.1fr/1fr grid) |
| `video-intro` | 1920x1080 |
| anything else | 1280x720 |

`video-split` is nearly square, and stock footage is almost exclusively 16:9 or
9:16 — square barely exists — so **nothing keeps more than ~60% of frame** here.
Which axis gets cut is what matters:

- A source **taller** than the slot loses only ceiling and floor. A vertically
  composed shot survives that, so it is cropped to full bleed (`fit: cover`).
- A source **wider** than the slot loses its sides, which cuts subjects out of
  frame and reads as "cropped too close". Those are centred whole on a blurred,
  darkened copy of themselves instead (`fit: fit`).

The search pulls **both orientations** from Pexels and ranks portrait first for
this slot. `fit` is chosen per clip automatically; set `"fit": "cover"` or
`"fit"` in the stock block to override.

`crop_x` / `crop_y` position the crop window on whichever axis overflows:
`0` = left/top, `0.5` = centre (default), `1` = right/bottom. For a portrait
source in `video-split` the vertical axis is the live one, so `crop_y` is the
knob that keeps heads in frame.

Source files must be at least 1008x1080 or they would be upscaled, which is why
the provider filter demands 1080p, not 720p.

Output is 30fps, no audio, constrained-CRF with a 2500 kbps ceiling. The cap
matters: these get base64-encoded into `lesson_assets`, and a high-motion source
at unbounded CRF 23 can otherwise produce a 20MB+ clip.

**Clip length matters.** The player slows b-roll so one clip spans the whole
narration (`rate = clipDuration / voDuration`, clamped to `[0.3, 1.0]` by
`bgBaseRate` in `build_hybrid.py`), then freezes on a CSS push-in. Candidates
are ranked and labelled by the rate they'd need:

| | Rate | Meaning |
|---|---|---|
| `OK` | 0.6 – 1.0 | natural or gently slowed; trimmed to the narration |
| `SLOW` | 0.3 – 0.6 | visible slow motion, still covers the segment |
| `SHORT` | below 0.3 | hits the floor, ends early, holds a still frame |

Selection prefers `OK` clips closest to the narration length. Run the `tts`
stage before `fetch` so segment durations are known — without the mp3s, slots
fall back to a 10s target and the ranking is meaningless.

**Provenance.** Every fetch appends to `work_player/v2/broll_credits.json`
(provider, clip id, page URL, author, license, query). Keep it — it's the
license record for a paid product, and it makes a clip reproducible later.

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
- `module0/stock_broll.py` — free Pexels/Pixabay b-roll for hybrid `video-split` slots
