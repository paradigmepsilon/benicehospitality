# CLAUDE.md — BNHG Course Production

Claude Code reads this on every session. It encodes how Room Rental Riches lessons are built inside the `benicehospitality` Next.js project. Treat it as project law.

This file lives at the repo root next to `README.md` and `package.json`.

---

## 1. Project Context

You are working inside the `benicehospitality/` Next.js application. The web app is a Vercel-hosted LMS with auth, Stripe checkout, course delivery, admin tooling, and a Neon Postgres database.

The course **Room Rental Riches** is taught by **Della Henry**. Della's voice: direct, warm, no-hype, operator-to-operator. She runs MTRs in the Southeast. She is not a guru, hype merchant, or motivational speaker. Numbers and specifics over abstractions.

The course is priced at $500 self-paced. Treat every lesson like it has to justify that price.

### How a lesson reaches a student

1. Source files live in `Courses/Room Rental Riches/Module N.M/` on disk
2. `scripts/import-lesson.ts` walks that folder, base64-encodes every file, and writes rows to the `lesson_assets` table in Neon Postgres
3. The Next.js admin patches the bundle's main HTML with a postMessage bridge (already done by the import script)
4. The student-facing player (`src/components/sections/courses/BundleFrame.tsx`) iframes that HTML at `/api/account/lessons/{lessonId}/asset/{relativePath}` and renders it inside a 1920×1080 design canvas CSS-scaled to fit
5. Auth-gated: only enrolled users at the right tier can fetch assets

**Critical:** the filesystem is the source of truth at build time. Postgres is the source of truth at serve time. The import script is the bridge. Never edit `lesson_assets` rows directly.

---

## 2. Locked Specifications

### Voice (never changes)
- **Voice clone ID:** `13baf65f739742068cb912c60784c680` (HeyGen "Be Nice Hospitality")
- Engine: Starfish

### Avatars (per-module, read from `scripts/lessons/config/avatars.json`)
- Module 1 front-facing: `3b4169a21ffe4ab0a1b3336c67d8add9`
- Module 1 side-angle: `9e3d44858d994af4b2c899d0ba8d4302`
- Module 2: `ac61ab42480e40ab816dc2104d41425e` (Della at podcast desk, green blazer, LIVE neon — "responsible adult in the room" tone for legal/tax/insurance)

When a new module needs a new avatar, the user generates one in HeyGen and adds the ID to `avatars.json` before invoking lesson builds.

### Internal canvas (locked by BundleFrame.tsx)
- The iframe is **always** 1920×1080 internally, regardless of player size
- All slide CSS uses `vw`/`vh`/`clamp()` against that internal viewport
- BundleFrame scales the iframe via `transform: scale()` to fit the visible 16:9 stage
- **Design at 1920×1080.** Never write CSS assuming a different viewport.

### Asset format
- Audio: **MP3** (mono or stereo, 128kbps, 48kHz)
- Image masters: **PNG** at native Higgsfield resolution (2K via Nano Banana Pro)
- Image serving: **WEBP** in the Bundle subfolder, quality 85
- Logo SVGs: `BNHG_full_lockup.svg` (cover only) + `BNHG_letter_mark.svg` (corner mark)

### Design tokens (do not invent new colors)
- `--bnhg-primary: #5b9a2f` — olive (good, recommendations, ✓)
- `--bnhg-primary-dark: #4a7d25` — dark olive (end cards, hover states)
- `--bnhg-secondary: #f5a623` — gold (highlights, "NEW", featured)
- `--bnhg-tertiary: #c0674a` — terracotta (warnings, exclusions, ✗)
- `--bnhg-bg: #f8f6f1` — cream background
- `--bnhg-ink-primary: #1a1a1a` / `--bnhg-ink-secondary: #3d3d3d` / `--bnhg-ink-muted: #807868`
- **Fonts:** Playfair Display (display, italics for emphasis), DM Sans (body), Dancing Script (rare script accents), JetBrains Mono (meta/timestamps)
- **Photo filter:** `saturate(0.85) contrast(1.05)` — applied to all photography

### Output runtime targets
- Module 1 lessons: 6 to 15 minutes
- Module 2 lessons: 5 to 20 minutes
- Slide count: 8 to 20 slides per lesson typically

---

## 3. The Editorial Player Architecture

The production deliverable is a **single self-contained HTML file** + companion folders (audio/, images/, two SVGs). Reference: `Courses/Room Rental Riches/Module 1.2/Lesson_1_2_Editorial_v4.html`.

### Slide-owns-audio
- Each `<section class="slide">` has a `data-audio="audio/voiceover_NN.mp3"` attribute
- One `<audio id="audio">` element gets re-sourced when the active slide changes
- Audio ends → 400ms pause → auto-advance to next slide
- Returning to a partially-played slide resumes; returning to a completed slide restarts from 0
- `state.slidePositions` (Map) tracks resume positions; `state.completedSlides` (Set) tracks finished slides

### Animation engine (already in the player template — do not reinvent)
- `.reveal-words` on headings → `splitWords()` splits into spans with `--word-i` for staggered word reveal
- `.text-list`, `.columns`, `.grid`, `.slide-action ol` children → `setStaggerIndices()` adds `--i` for sequenced reveal
- `data-count-to="61" data-count-suffix="%"` on stat numerals → animated count-up via `animateCount()`
- `.skip-reveal` class on slide → entrance animations bypassed (used when resuming mid-audio)

### Layout library (8 layouts — pick from these, do not invent new ones)

Layout name (data-layout value), required structure, typical use:

1. **`cover`** — `<div class="photo">` full-bleed background, `<div class="content">` with eyebrow + h1 + subtitle + meta. The hero. Always slide 1. Includes `BNHG_full_lockup.svg` top-left.

2. **`hero-stat`** — 1.4fr / 1fr grid. Left: eyebrow + giant italic numeral (`.figure` with `data-count-to`) + supporting text + secondary stat + source. Right: atmospheric photo. Used for "the big number" moments (61%, 2x, etc.).

3. **`spread`** — Photo + text columns side-by-side. Add `.reverse` to flip photo to right. Add `.large-text` when text needs more breathing room. Use for narrative moments with one strong supporting image. Photo gets a `.photo-caption` label.

4. **`three-col`** — Header (eyebrow + h2) + 3 columns. Each column: `.col-photo` background, `.col-numeral` (i/ii/iii), `.col-heading`, `.col-body`. Used for "three eras", "three forces", "three beliefs". The most common layout.

5. **`two-col`** — Header + 2 columns, often used for compare/contrast (workforce vs premium, top column vs bottom). Photos are 21:9 ultrawide.

6. **`card-grid`** — Header + grid of cards. Add `.cols-3` for 3-wide (6 cards typical), `.cols-2` for 2-wide (4 cards typical). Each card: `.card-photo` (3:2 or 16:9), `.card-content` with `.card-numeral` + `.card-title` + `.card-body`. Add `.large-headline` for bigger card text. Used for personas, options, what's coming next.

7. **`quote`** — Pull-quote slide with atmospheric background. `.quote-mark` + `<blockquote>` + `.attribution` + optional `.signature` (Dancing Script). Used sparingly — once per lesson maximum, for the "the question to ask yourself" moment.

8. **`action`** — End-of-lesson action step. Numbered ordered list with stagger. Right square photo. Used for slide N - 1 (the "before next lesson, do this" page). The final slide is usually `card-grid cols-2 large-headline` previewing the next lessons.

### LESSON_CONFIG (per-lesson constants)

```js
const LESSON_CONFIG = {
  meta: { moduleNumber: 2, lessonNumber: 6, lessonTitle: "...", runtime: "11:23" },
  interSlidePauseMs: 400,  // do not change unless requested
  slideTitles: ["Cover · ...", "Three forces · ...", ...]  // one per slide for the Overview panel
};
```

---

## 4. The Build Workflow

### Per-lesson invocation

User drops a spec into `Courses/Room Rental Riches/Module N.M/spec.md` and says:

> Build the lesson from `Courses/Room Rental Riches/Module 2.6/spec.md`.

You then:

1. **Read spec + CLAUDE.md + the closest reference lesson** (e.g., for Module 2.6, read `Module 2.5/Lesson_2_5_Script_FINAL.md`).
2. **Propose 5 to 8 design decisions** before any expensive work (see Section 6).
3. Wait for user confirmation.
4. Build in this order:
   - a. Generate **per-slide VO scripts** in `slide_scripts.md` (em-dash free, numbers spelled out)
   - b. Call **HeyGen TTS** (`HeyGen:create_speech` via MCP) for each slide. Save MP3s as `audio/voiceover_NN.mp3`. Capture `word_timestamps` for later use.
   - c. Generate **Higgsfield image prompts** in `image_prompts.md`. Pre-flight cost with `get_cost: true`.
   - d. Call **Higgsfield** (`Higgsfield:generate_image` via MCP). Download PNG masters to `images/L{moduleNum}-{lessonNum}_S{NN}_{NN}_{slug}.png`.
   - e. Optimize: `python scripts/lessons/optimize_images.py` produces `.webp` copies in `Lesson_X_X_Bundle/images/`.
   - f. Generate **lesson HTML**: `python scripts/lessons/build_lesson_html.py specs/lesson_2_6_spec.json`. Reads the template + slide content from the spec and produces `Lesson_2_6_Editorial_v1.html` in the Bundle folder.
   - g. Copy `BNHG_full_lockup.svg` + `BNHG_letter_mark.svg` from a prior lesson into the Bundle folder and root.
   - h. Generate **Image Reference**: `python scripts/lessons/generate_manifest.py` produces `.csv` + `.md`.
   - i. Generate **Script_FINAL.md** combining VO + slide notes.
5. **Quality gates** (see Section 8). Run all of them before reporting complete.
6. **Report**: total runtime, file count, image count, credits used, any warnings.
7. **Auto-run** `scripts/import-lesson.ts` after the quality gates pass. Pull `--title` and `--summary` from the spec (`lesson_title` + a one-line subtitle), `--position` from `lesson_num`, and `--minTier` from `spec.min_tier` (default `self-paced`). Pass `--mainHtml=Lesson_X_X_Editorial_v1.html`. After the importer succeeds, run `psql` / `tsx` against Neon to verify `course_lessons.body_kind = 'bundle'` for the slug and clear `video_url` to NULL if a legacy MP4 row left one set. Report importer output and the verified row state in the final summary.

### Output structure (per lesson)

```
Courses/Room Rental Riches/Module 2.6/
├── Lesson_2_6_Bundle/                       ← SERVED FORMAT (gets imported)
│   ├── audio/
│   │   ├── voiceover_01.mp3
│   │   └── ...
│   ├── images/
│   │   ├── L2-6_S01_01_cover_hero.webp
│   │   └── ...
│   ├── BNHG_full_lockup.svg
│   ├── BNHG_letter_mark.svg
│   └── Lesson_2_6_Editorial_v1.html
├── audio/                                   ← Same MP3s (top-level, for archival)
├── images/                                  ← PNG MASTERS (top-level, for archival)
│   ├── L2-6_S01_01_cover_hero.png
│   └── ...
├── BNHG_full_lockup.svg                     ← Top-level copies
├── BNHG_letter_mark.svg
├── Lesson_2_6_Image_Reference.csv
├── Lesson_2_6_Image_Reference.md
├── Lesson_2_6_Script_FINAL.md
└── spec.md                                  ← The user's input
```

### Import to Neon Postgres (auto-run after quality gates)

```bash
node --env-file=.env.local --import tsx scripts/import-lesson.ts \
  room-rental-riches legal-regulatory-business-setup lesson-2-6 \
  "Courses/Room Rental Riches/Module 2.6/Lesson_2_6_Bundle" \
  --title="Southeast Regulatory Landscape" \
  --summary="A 30,000-foot view before we go state by state." \
  --position=6 \
  --minTier=self-paced \
  --mainHtml=Lesson_2_6_Editorial_v1.html
```

The script base64-encodes everything, chunks files over 32MB, patches the main HTML with the postMessage bridge, and writes rows to Neon. Re-running is idempotent.

### Module slugs (DB → filesystem folder)

The importer's `<moduleSlug>` argument is the DB slug, **not** the filesystem folder name. The mapping is fixed by `scripts/migrate.ts`:

| Folder | DB module slug |
|---|---|
| `Module 1.x` | `the-mtr-co-living-opportunity` |
| `Module 2.x` | `legal-regulatory-business-setup` |
| `Module 3.x` | `choosing-your-path` |
| `Module 4.x` | `market-analysis-property-selection` |
| `Module 5.x` | `securing-your-first-property` |
| `Module 6.x` | `hospitality-grade-design` |
| `Module 7.x` | `your-modern-tech-stack` |
| `Module 8.x` | `multi-channel-listing-strategy` |
| `Module 9.x` | `pricing-for-profit` |
| `Module 10.x` | `guest-experience-systems` |
| `Module 11.x` | `cleaning-maintenance-vendor-management` |
| `Module 12.x` | `scaling-beyond-your-first-property` |

Lesson slug is always `lesson-<M>-<L>` (e.g., `lesson-2-1`).

---

## 5. Per-Slide Image Generation Rules

### When to generate
- Every slide except `quote` layout needs at least one image (quote uses atmospheric background, optional)
- `card-grid cols-3` slide: 6 images (one per card)
- `card-grid cols-2`: 4 images
- `three-col`: 3 images (one per column) + optional hero image
- `two-col`: 2 images
- `spread`: 1 image
- `hero-stat`: 1 image (right square panel)
- `cover`: 1 image (full-bleed background)
- `action`: 1 image (right square panel)

Typical lesson: 20 to 40 images (look at Lesson 1.2 which has 36 across 18 slides).

### Style direction (paste into every Higgsfield prompt)

> Editorial magazine photography, warm natural light (golden hour or soft window light), boutique hospitality aesthetic. Cream and terracotta neutrals, sage and olive accents, warm wood tones, considered minimalism. Composition: single-subject focus or wide architectural establishing shot. Style references: Cereal Magazine, Kinfolk, Magnolia Journal. Soft depth of field. 16:9 cinematic crop (or aspect_ratio specific to the slot).

### When to include people
- People are allowed, but match the diversity distribution Della has set: Black, white, and mixed-race subjects distributed across the lesson as a whole
- Travel nurse persona is Black (locked from Lesson 1.2)
- Reference `Lesson_1_2_Image_Reference.md` for the diversity log pattern

### Higgsfield call pattern

```
model: "nano_banana_2"  // Higgsfield Nano Banana Pro — top quality, editorial
prompt: <subject> + STYLE_PROMPT
aspect_ratio: "16:9" | "3:2" | "1:1" | "5:4" | "21:9"  // match the slot
count: 1
get_cost: true  // ALWAYS preflight first
```

### Filename convention (locked)

`L{moduleNum}-{lessonNum}_S{NN}_{NN}_{slug}.png`

- `L2-6_S01_01_cover_hero.png` — Module 2 Lesson 6, Slide 01, Image 01, slug "cover_hero"
- `L2-6_S06_03_persona_corporate_exec.png` — Module 2 Lesson 6, Slide 06, Image 03 (third card in the grid)

### Quality control checklist (for AI-generated imagery)
1. Hands and fingers — count digits, check thumb position
2. Eyes — both pupils visible, same color, no extra reflections
3. Hair texture on Black and mixed-race subjects should look natural, not waxy
4. Skin tones — Black skin warm not gray; mixed-race subjects distinct features
5. Text artifacts — books/papers/screens/signs should be meaningful structure, not melted gibberish
6. Cohesion — lay all images out as a contact sheet. If one feels glossy/commercial while rest feel editorial, regenerate the outlier

---

## 6. The 5 to 8 Question Proposal Pattern

Before building, propose a structure and 5 to 8 design decisions. Format:

> **Lesson 2.X — [Title].** N slides. Estimated runtime: ~X:XX.
>
> **Proposed slide structure:** [table with slide#, layout, content summary]
>
> **N design calls before I generate:**
> 1. [Question with recommendation] — *Recommend: Y*
> 2. [Question with recommendation] — *Recommend: Y*
> ...
>
> **Estimated cost:** ~XXX HeyGen credits (TTS) + ~XXX Higgsfield credits (N images @ ~$X each).
>
> Confirm and I'll kick off generation.

Cover topics like:
- Slide count + layout selection
- Image count + which slots get imagery
- Cross-references to prior lessons (Module 2.4 FL exception, etc.)
- Disclaimer footer wording (Module 2 only — varies by topic: tax, insurance, legal, regulatory)
- Specific endorsements ("Della Uses This" callouts)
- Recurring badge decisions (NEW 2026, Della's Take, etc.)
- New treatments the spec implies but doesn't define

**Do not** propose decisions that are already locked in CLAUDE.md.

---

## 7. VO Script Rules

### Numbers (for TTS naturalness)
- Spell out numbers under 100: "fifteen point three percent" not "15.3%"
- Years: numerals OK ("2026")
- Dollar amounts: "two to three thousand dollars" not "$2,000 to $3,000"
- Acronyms (MTR, LLC, IRS): TTS handles fine, leave as letters
- Percentages with decimals: spell out

### Em-dashes (ABSOLUTE BAN)
- Never use `—` (em-dash, U+2014) or `–` (en-dash, U+2013) anywhere
- Rewrite as two sentences, or period + capital, or comma
- Sweep with: `grep -P '[\u2013\u2014]' Courses/Room\ Rental\ Riches/Module\ X.Y/Lesson_X_X_Bundle/`

### Della's voice
- Short declarative sentences
- "Here's what to do." / "Here's why." / "Here's the rule."
- "Della's Take" is a recurring callout
- "Don't" not "do not"
- Specifics over abstractions ($400 to $1,500/year, not "affordable")
- No marketing language (no "game-changer", "revolutionary", "unlock", "transform")

---

## 8. Quality Gates (run before reporting complete)

1. **Em-dash sweep:** zero `\u2014` and `\u2013` in HTML + script.md + image reference
2. **Asset count parity:** N slides means N audio files. Image count matches Image Reference. SVGs present.
3. **Disclaimer footer:** Module 2 only. Wording matches the lesson topic (tax / insurance / legal / regulatory). Present visibly on every content slide.
4. **Runtime within ±10%** of estimate. Total runtime = sum of audio durations + (N - 1) × 0.4s pauses.
5. **HTML validity:** template's `{{SLIDES_HTML}}` and `{{LESSON_CONFIG_JSON}}` markers replaced. No leftover `{{...}}` anywhere.
6. **Image reference matches images folder:** every PNG/WEBP in `images/` listed in Image_Reference.csv, and vice versa.
7. **Filenames follow the L{M}-{L}_S{NN}_{NN}_{slug} convention.**
8. **No `loremflickr.com` URLs left in the HTML** (placeholders all replaced with relative image paths).
9. **LESSON_CONFIG.slideTitles.length === N** (matches actual slide count).
10. **No raw transcripts left at slide root** (build artifacts cleaned).

---

## 9. Tooling Location

All production tooling lives in `scripts/lessons/`:

```
scripts/lessons/
├── README.md                    # Quick reference
├── config/
│   └── avatars.json             # Per-module avatar IDs
├── templates/
│   ├── lesson_player.html       # Player chrome extracted from Lesson 1.2
│   └── layouts/                 # Per-layout HTML snippets with placeholders
│       ├── cover.html
│       ├── hero_stat.html
│       ├── spread.html
│       ├── three_col.html
│       ├── two_col.html
│       ├── card_grid.html
│       ├── quote.html
│       └── action.html
├── build_lesson_html.py         # Fills the template from a spec JSON
├── optimize_images.py           # PNG → WEBP via Pillow
├── generate_manifest.py         # Builds Image_Reference.csv + .md
├── convert_audio.py             # WAV → MP3 (for Module 2.1-2.5 redo)
├── emdash_sweep.py              # Standalone QA gate
└── _shared.py                   # STYLE_PROMPT, COLORS, helpers
```

These coexist with the existing `scripts/import-lesson.ts`. Python for content generation, TypeScript for DB ingestion. Claude Code orchestrates both via the shell.

---

## 10. Module 2.1 to 2.5 Migration

These were built in the legacy concat-MP4 pattern. Migration plan (one lesson at a time, user reviews each before proceeding to the next):

### For each lesson 2.1 → 2.5:
1. Read existing `Lesson_2_X_Script_FINAL.md` and the slide HTMLs in `Module 2.X/raw_segments/slides/`
2. Run `python scripts/lessons/convert_audio.py "Courses/Room Rental Riches/Module 2.X/raw_segments/audio/"` to convert WAVs → MP3s. **No new TTS calls — reuse existing audio.**
3. Re-imagine slides using the Editorial layout library. Most existing slides will map cleanly to `spread`, `three-col`, or `card-grid`. The user will help redesign as needed.
4. Generate Higgsfield imagery for each slide (this is new — Module 2.X had no per-slide imagery).
5. Build the lesson HTML via the standard pipeline.
6. **Delete** the legacy outputs: `raw_segments/`, `Lesson_2_X_<Topic>.mp4`, `Lesson_2_X_<Topic>.srt`. The MP3s in `raw_segments/audio/` get copied to the new Bundle folder first.
7. Re-run `tsx scripts/import-lesson.ts` to overwrite the DB rows. The import is idempotent on `(lesson_id, relative_path)`, so this works cleanly.

### Order
2.1 first (simplest, 3:20). User reviews. Then 2.2, 2.3, 2.4, 2.5. Then build 2.6 onward fresh.

---

## 11. MCP Tools Required

In Claude Code's `.mcp.json`:
- `heygen` at `https://mcp.heygen.com/mcp/v1` — for `create_speech`, `create_video_from_avatar`, `get_video`
- `higgsfield` at `https://mcp.higgsfield.ai/mcp` — for `generate_image`, `balance`

Setup is in `scripts/lessons/README.md`. Verify credits before each lesson:

> Run `HeyGen:get_current_user` and `Higgsfield:balance`. Confirm positive balances.

---

## 12. What to Just Decide vs. Ask the User

### Just decide (per locked specs above)
- Colors, fonts, output format
- Disclaimer footer presence (Module 2 = always)
- Layout selection when the spec clearly implies one
- Em-dash rewriting
- VO number spelling
- Bundle folder structure
- Filename conventions

### Ask the user
- Image count and subject for ambiguous slots
- Whether to break a long slide into two
- New visual treatments the spec implies but doesn't define
- Cross-lesson references
- Specific endorsements ("Della Uses This" callouts)
- Disclaimer footer wording variations

### Never assume
- A new avatar ID is correct (confirm by ID + visual reference)
- That an image is regenerable for free (always preflight Higgsfield cost)
- That a previously-built lesson's pattern applies to the current one without checking the spec

---

## 13. Failure Modes to Watch For

- **Slide content with em-dashes:** the spec.md often has them. Strip them in your VO script before TTS.
- **Higgsfield image style drift:** if an image doesn't match the lesson, regenerate with a more explicit style block. Add geographic specificity for exteriors ("Atlanta craftsman" beats "Southeastern home").
- **Audio duration mismatch:** if `LESSON_CONFIG.runtime` doesn't match actual playback, recompute and update.
- **The 1920×1080 trap:** never let CSS in a layout use `px` for typography — must be `clamp(min, vw, max)` so it scales correctly inside BundleFrame's transform.
- **Missing letter-mark SVG:** every slide except `cover` references `BNHG_letter_mark.svg` as a corner mark. The cover uses `BNHG_full_lockup.svg`. Both files must be in the Bundle root.
- **Forgotten import:** the file build doesn't reach the live app. Auto-run `tsx scripts/import-lesson.ts` after the quality gates pass (see Section 4 step 7).

---

## 14. Reference Material

The closest in-module lesson is the best calibration source. Before building Module 2.6, read `Module 2.5/Lesson_2_5_Script_FINAL.md`. Before building Module 3.X, read the latest Module 2 lesson.

Lesson 1.2 is the canonical Editorial reference — the player template was extracted from it. When the layout library here isn't clear enough, open `Module 1.2/Lesson_1_2_Editorial_v4.html` and search for the layout class.

The master plan is in `Courses/Room Rental Riches/Room_Rental_Riches_Master_Course_Plan_FINAL.md`. Modules 2.6 through 2.10, plus Module 3+, are scoped there.


---

## Build Tracker
- Project: BNHG
- Repo / Location: benicehospitality (branch: main)
This repo follows the global Build Tracker Protocol. Tag all tickets with the Project above; do not re-ask.
