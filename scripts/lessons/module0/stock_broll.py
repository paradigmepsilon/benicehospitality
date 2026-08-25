#!/usr/bin/env python3
"""
stock_broll.py — free stock b-roll for hybrid lessons (Pexels + Pixabay).

Replaces paid AI video generation for the `video-split` slots. Reads the b-roll
queries straight out of hybrid_spec.json, searches both providers, and writes
normalized clips to work_player/v2/ where build_hybrid_lesson.py expects them.

Spec: give any slide that has a "video" an optional "stock" block. The lesson
builder ignores the key, so adding it is backwards compatible.

  {
    "layout": "video-split",
    "seg": "02",
    "video": "broll_02.mp4",
    "stock": {
      "query": "bedroom interior bed",             # concrete nouns, NOT mood words
      "avoid": ["cartoon", "logo"],                # drops matching titles/tags
      "pick": {"provider": "pexels", "id": 6658333},  # pins one clip
      "crop_x": 0.5,                               # 0=left, 0.5=centre, 1=right
      "crop_y": 0.5,                               # 0=top, 0.5=centre, 1=bottom
      "fit": "cover"                               # or "fit"; auto by default
    },
    ...
  }

Write queries as plain nouns. Stock search matches tags, so mood language wins
over subject: "furnished bedroom apartment natural window light" returns
mountain sunrises and rain on glass, while "bedroom interior bed" returns
bedrooms.

Clip length matters here. The player slows b-roll so one clip spans the whole
narration (rate = clipDuration / voDuration, floored at 0.3), then freezes on a
push-in. A clip shorter than ~1/3 of its segment runs out early, so selection
prefers sources at least as long as the VO and the normalizer trims to the
segment length rather than a fixed duration.

Aspect ratio matters just as much. Clips are encoded to the shape of the slot
they fill (see GEOMETRY), so the browser never crops. `video-split` is a nearly
square 1008x1080 panel and stock is almost all 16:9 or 9:16, so nothing keeps
more than ~60% of frame. Which axis gets cut decides the treatment: a source
TALLER than the slot loses only ceiling and floor and is cropped to full bleed,
while a WIDER one loses its sides and is centred whole on a blurred copy of
itself. See fit_for(). `crop_x` / `crop_y` position the crop window.

Stages (idempotent; fetch skips slots whose mp4 already exists):
  search   rank candidates per slot and print them. No download, no writes.
  preview  contact sheet of the top candidates, framed as the slot will
           actually show them. LOOK AT IT before fetching.
  fetch    download the pick (or top match), normalize, record credits.

Always preview before fetching anything student-facing. Titles and tags do not
tell you what is in frame: "nurse walking hospital corridor" has returned a
neonatal ICU as its top-ranked result.

Usage:
  python scripts/lessons/module0/stock_broll.py "Courses/.../Module 1.2" search
  python scripts/lessons/module0/stock_broll.py "Courses/.../Module 1.2" preview
  python scripts/lessons/module0/stock_broll.py "Courses/.../Module 1.2" fetch
  python scripts/lessons/module0/stock_broll.py "Courses/.../Module 1.2" fetch broll_02.mp4 --force

Keys (both free, personal, no card): PEXELS_API_KEY, PIXABAY_API_KEY.
Read from the environment, falling back to .env.local like the rest of the
pipeline. Either one alone works; the script just searches fewer sources.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build import ROOT, duration, run  # noqa: E402

FPS = 30
MAX_KBPS = 2500                     # bitrate ceiling; ~13MB for a 41s clip

# Encode to the shape of the hole the clip drops into, so the browser never has
# to crop. `video-split` puts the media in a 1.1fr column of a 1.1fr/1fr grid on
# the 1920x1080 canvas: 1920 * 1.1/2.1 = ~1006 wide, full height. Feeding that a
# 16:9 clip and letting object-fit:cover sort it out discards ~48% of the frame
# width. 1008 keeps the width a multiple of 16 for h264.
GEOMETRY = {
    "video-split": (1008, 1080),
    "video-intro": (1920, 1080),
}
DEFAULT_GEOMETRY = (1280, 720)

# Minimum source a provider file must offer. The video-split slot is 1080 tall,
# so anything shorter gets upscaled and goes soft. 720p sources were fine when
# output was 1280x720; they are not fine now.
MIN_SRC_W, MIN_SRC_H = 1008, 1080
TAIL_PAD = 0.5                      # trim target = VO duration + pad
MIN_SRC_SECONDS = 4.0               # anything shorter can't carry a segment
UA = "bnhg-lesson-pipeline/1.0"

# The player sets rate = (clipDuration - 0.2) / voDuration, clamped to [0.3, 1.0]
# (bgBaseRate in build_hybrid.py). So a clip only genuinely fails when it lands
# under the floor: below that it ends early and freezes on the push-in. Between
# the floor and NATURAL it just plays in gentle slow motion, which is the
# intended look.
RATE_FLOOR = 0.3
RATE_NATURAL = 0.6


# ---------------------------------------------------------------- credentials

def env_val(name: str) -> str | None:
    """Same lookup build.py uses for ELEVENLABS_API_KEY, for any var."""
    val = os.environ.get(name)
    if not val:
        env = ROOT / ".env.local"
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith(f"{name}="):
                    val = line.split("=", 1)[1].strip().strip('"')
    return val or None


def get_json(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


# ------------------------------------------------------------------- providers
# Each provider returns a list of normalized candidate dicts:
#   provider id title duration width height url(download) page author author_url

def search_pexels(query: str, per_page: int = 15) -> list[dict]:
    key = env_val("PEXELS_API_KEY")
    if not key:
        return []
    # Pull both orientations. The video-split panel is taller than it is wide,
    # so portrait and square sources often survive the crop far better than
    # landscape ones; ranking picks the winner on retention, not orientation.
    videos = []
    for orientation in ("landscape", "portrait"):
        url = ("https://api.pexels.com/videos/search?"
               + urllib.parse.urlencode({"query": query, "per_page": per_page,
                                         "orientation": orientation, "size": "medium"}))
        try:
            videos += get_json(url, {"Authorization": key}).get("videos", [])
        except Exception as e:  # noqa: BLE001 - a dead provider shouldn't kill the run
            print(f"  ! pexels {orientation} search failed: {e}")

    out = []
    for v in videos:
        # Smallest file that still clears the slot, so we don't pull a 4K master.
        files = [f for f in v.get("video_files", [])
                 if (f.get("width") or 0) >= MIN_SRC_W and (f.get("height") or 0) >= MIN_SRC_H
                 and f.get("file_type") == "video/mp4"]
        if not files:
            continue
        f = min(files, key=lambda f: f["width"] * f["height"])
        out.append({
            "provider": "pexels", "id": v["id"],
            "title": (v.get("url", "").rstrip("/").rsplit("/", 1)[-1] or "").replace("-", " "),
            "duration": float(v.get("duration") or 0),
            "width": f["width"], "height": f["height"],
            "url": f["link"], "page": v.get("url", ""),
            "thumb": v.get("image", ""),
            "author": (v.get("user") or {}).get("name", ""),
            "author_url": (v.get("user") or {}).get("url", ""),
            "license": "Pexels License",
        })
    return out


def search_pixabay(query: str, per_page: int = 15) -> list[dict]:
    key = env_val("PIXABAY_API_KEY")
    if not key:
        return []
    url = ("https://pixabay.com/api/videos/?"
           + urllib.parse.urlencode({"key": key, "q": query, "per_page": per_page,
                                     "video_type": "film", "safesearch": "true"}))
    try:
        data = get_json(url)
    except Exception as e:  # noqa: BLE001
        print(f"  ! pixabay search failed: {e}")
        return []

    out = []
    for v in data.get("hits", []):
        streams = v.get("videos", {})
        files = [s for s in streams.values()
                 if (s.get("width") or 0) >= MIN_SRC_W and (s.get("height") or 0) >= MIN_SRC_H and s.get("url")]
        if not files:
            continue
        f = min(files, key=lambda s: s["width"] * s["height"])
        out.append({
            "provider": "pixabay", "id": v["id"],
            "title": v.get("tags", ""),
            "duration": float(v.get("duration") or 0),
            "width": f["width"], "height": f["height"],
            "url": f["url"], "page": v.get("pageURL", ""),
            "thumb": f.get("thumbnail", ""),
            "author": v.get("user", ""),
            "author_url": f"https://pixabay.com/users/{v.get('user', '')}-{v.get('user_id', '')}/",
            "license": "Pixabay Content License",
        })
    return out


# ------------------------------------------------------------------- selection

def play_rate(clip_seconds: float, vo: float) -> float:
    """What the player will actually run this clip at, unclamped."""
    return (clip_seconds - 0.2) / vo if vo else 1.0


def tier(clip_seconds: float, vo: float) -> str:
    """OK    plays at a natural rate, or gets trimmed down to the narration
       SLOW  noticeable slow motion, still covers the segment edge to edge
       SHORT under the player's floor: ends early and freezes on the push-in"""
    r = play_rate(clip_seconds, vo)
    if r >= RATE_NATURAL:
        return "OK"
    return "SLOW" if r >= RATE_FLOOR else "SHORT"


def retention(c: dict, slot_ar: float) -> float:
    """Fraction of the source frame that survives a cover-crop into the slot.
    1.0 means the shapes match; 0.52 is a 16:9 clip in the near-square
    video-split panel, i.e. half the shot thrown away."""
    src_ar = (c["width"] / c["height"]) if c["height"] else slot_ar
    return min(src_ar, slot_ar) / max(src_ar, slot_ar)


def score(c: dict, vo: float, slot_ar: float) -> tuple:
    """Sort key, best first. Length that covers the narration comes first, then
    how much of the frame survives the crop, then the cheapest download."""
    rank = {"OK": 0, "SLOW": 1, "SHORT": 2}[tier(c["duration"], vo)]
    # A source at least as tall as the slot can be cropped to full bleed
    # without losing anything at the sides, so it beats a wide source that
    # would have to be letterboxed. See fit_for().
    src_ar = (c["width"] / c["height"]) if c["height"] else slot_ar
    fills = 0 if src_ar <= slot_ar + 0.02 else 1
    slack = abs(c["duration"] - vo)
    return (rank, fills, 0 if c["duration"] >= MIN_SRC_SECONDS else 1,
            round(slack / 5), -c["width"] * c["height"])


def candidates(stock: dict, vo: float, slot_ar: float = 16 / 9) -> list[dict]:
    query = stock["query"]
    found = search_pexels(query) + search_pixabay(query)

    avoid = [a.lower() for a in stock.get("avoid", [])]
    if avoid:
        found = [c for c in found
                 if not any(a in (c["title"] + " " + str(c["id"])).lower() for a in avoid)]

    found = [c for c in found if c["duration"] >= MIN_SRC_SECONDS]
    found.sort(key=lambda c: score(c, vo, slot_ar))
    return found


# ----------------------------------------------------------------- normalizing

def crop_filter(w: int, h: int, cx: float, cy: float = 0.5) -> str:
    """COVER: fill w x h, then take the crop window at position (cx, cy), each
    0.0 = top/left edge, 0.5 = centre, 1.0 = bottom/right edge.

    Whichever axis overflows is the one that matters. A portrait source in the
    video-split panel is cropped vertically, so `cy` is the live control there:
    lower it to keep heads in frame, raise it to favour the foreground."""
    cx = min(1.0, max(0.0, cx))
    cy = min(1.0, max(0.0, cy))
    return (f"scale={w}:{h}:force_original_aspect_ratio=increase,"
            f"crop={w}:{h}:(iw-ow)*{cx:.4f}:(ih-oh)*{cy:.4f},"
            f"fps={FPS},format=yuv420p")


def fit_filter(w: int, h: int, tag: str = "") -> str:
    """FIT: whole frame, centred and scaled to fit inside w x h, with the
    leftover space filled by a blurred, darkened, enlarged copy of the same
    footage. Nothing is cropped, and the panel still reads full bleed rather
    than letterboxed against a flat colour.

    `tag` disambiguates the intermediate labels so several of these can live in
    one filter_complex (the preview contact sheet runs one per tile)."""
    bg, fg, bgb, fgs = (f"bg{tag}", f"fg{tag}", f"bgb{tag}", f"fgs{tag}")
    return (
        f"split=2[{bg}][{fg}];"
        f"[{bg}]scale={w}:{h}:force_original_aspect_ratio=increase,"
        f"crop={w}:{h},gblur=sigma=28,eq=brightness=-0.12:saturation=0.85[{bgb}];"
        f"[{fg}]scale={w}:{h}:force_original_aspect_ratio=decrease[{fgs}];"
        f"[{bgb}][{fgs}]overlay=(W-w)/2:(H-h)/2,fps={FPS},format=yuv420p"
    )


def video_filter(w: int, h: int, cx: float, cy: float, fit: str, tag: str = "") -> str:
    return fit_filter(w, h, tag) if fit == "fit" else crop_filter(w, h, cx, cy)


def fit_for(slide: dict, chosen: dict | None = None) -> str:
    """`cover` crops to fill the panel; `fit` shows the whole frame on a
    blurred bed of itself.

    Which crop is acceptable depends on WHICH axis gets cut. Stock is almost
    exclusively 16:9 or 9:16 (square barely exists), so nothing keeps more than
    ~60% of frame in the near-square video-split panel. But a source TALLER
    than the slot loses only ceiling and floor, which a vertically composed
    shot survives happily. A source WIDER than the slot loses its sides, which
    is what cuts subjects out of frame and reads as "cropped too close".

    So: crop tall sources to full bleed, letterbox wide ones."""
    explicit = slide.get("stock", {}).get("fit")
    if explicit in ("cover", "fit"):
        return explicit
    if not chosen or not chosen.get("height"):
        return "cover"
    w, h = geometry_for(slide)
    src_ar = chosen["width"] / chosen["height"]
    return "cover" if src_ar <= (w / h) + 0.02 else "fit"


def normalize(src: Path, out: Path, seconds: float, w: int, h: int,
              cx: float = 0.5, cy: float = 0.5, fit: str = "cover"):
    """Crop/scale to w x h, 30fps, no audio, trimmed to `seconds` (or the source
    length, whichever is shorter).

    Constrained CRF: quality-driven, but capped so a high-motion source can't
    produce a 20MB+ clip. These get base64-encoded into lesson_assets, and
    import-lesson.ts starts chunking past 32MB, so bitrate needs a ceiling."""
    run(["ffmpeg", "-y", "-i", str(src), "-t", f"{seconds:.2f}",
         "-filter_complex", video_filter(w, h, cx, cy, fit), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "23",
         "-maxrate", f"{MAX_KBPS}k", "-bufsize", f"{MAX_KBPS * 2}k",
         "-movflags", "+faststart", str(out)])


# ---------------------------------------------------------------------- slots

def slots(lesson_dir: Path, only: list[str]) -> list[dict]:
    spec = json.loads((lesson_dir / "hybrid_spec.json").read_text())
    found = []
    for s in spec["slides"]:
        if not (s.get("video") and s.get("stock")):
            continue
        if only and s["video"] not in only:
            continue
        found.append(s)
    if only:
        missing = set(only) - {s["video"] for s in found}
        if missing:
            sys.exit(f"no slide with a 'stock' block for: {sorted(missing)}")
    return found


def geometry_for(slide: dict) -> tuple[int, int]:
    """Output size for the slot this clip fills."""
    return GEOMETRY.get(slide.get("layout", ""), DEFAULT_GEOMETRY)


def vo_for(lesson_dir: Path, slide: dict) -> float:
    """Narration length for the slot. Clip selection and trimming key off this."""
    seg = slide.get("seg")
    if not seg:
        return 10.0
    mp3 = lesson_dir / "work_player" / "v2" / f"seg_{seg}.mp3"
    if not mp3.exists():
        print(f"  ! {mp3.name} missing, falling back to a 10s target "
              f"(run the tts stage first for a length-matched clip)")
        return 10.0
    return duration(mp3)


# --------------------------------------------------------------------- stages

def stage_search(lesson_dir: Path, only: list[str]):
    for slide in slots(lesson_dir, only):
        vo = vo_for(lesson_dir, slide)
        print(f"\n{slide['video']}  seg {slide.get('seg', '--')}  "
              f"narration {vo:.1f}s  query: {slide['stock']['query']!r}")
        found = candidates(slide["stock"], vo)
        if not found:
            print("  no candidates")
            continue
        for c in found[:8]:
            t = tier(c["duration"], vo)
            rate = min(1.0, max(RATE_FLOOR, play_rate(c["duration"], vo)))
            print(f"  {t:<5} {c['provider']:<8} {c['id']:<10} {c['duration']:>5.1f}s  "
                  f"rate {rate:.2f}  {c['width']}x{c['height']:<5}  "
                  f"{c['author'][:18]:<18}  {c['page']}")


def stage_preview(lesson_dir: Path, only: list[str], top: int = 8):
    """Tile the top candidates' thumbnails into one contact sheet per slot.

    Stock search drifts hard: 'furnished bedroom apartment natural window light'
    returns mountain sunrises, and 'nurse walking hospital corridor' returns a
    neonatal ICU. Titles and tags do not tell you that. Look at the sheet, then
    pin the one you want with "pick" in the spec before running fetch.
    """
    out_dir = lesson_dir / "work_player" / "v2" / "stock_preview"
    out_dir.mkdir(parents=True, exist_ok=True)

    for slide in slots(lesson_dir, only):
        vo = vo_for(lesson_dir, slide)
        gw, gh = geometry_for(slide)
        cx = float(slide["stock"].get("crop_x", 0.5))
        cy = float(slide["stock"].get("crop_y", 0.5))
        slot_ar = gw / gh
        found = candidates(slide["stock"], vo, slot_ar)[:top]
        if not found:
            print(f"{slide['video']}: no candidates")
            continue

        stem = Path(slide["video"]).stem
        tiles, legend, tile_fits = [], [], []
        for i, c in enumerate(found, 1):
            if not c.get("thumb"):
                continue
            tile = out_dir / f".{stem}_{i:02d}.jpg"
            try:
                req = urllib.request.Request(c["thumb"], headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=60) as r:
                    tile.write_bytes(r.read())
            except Exception as e:  # noqa: BLE001
                print(f"  ! thumb {i} failed: {e}")
                continue
            tiles.append(tile)
            keep = retention(c, slot_ar)
            tile_fits.append(fit_for(slide, c))
            legend.append(f"  {i:>2}. {tier(c['duration'], vo):<5} {c['provider']:<8} "
                          f"{c['id']:<10} {c['duration']:>5.1f}s  "
                          f"{c['width']}x{c['height']:<5} keeps {keep * 100:>3.0f}% "
                          f"{tile_fits[-1]:<5}  {c['page']}")

        if not tiles:
            print(f"{slide['video']}: no thumbnails available")
            continue

        sheet = out_dir / f"{stem}_candidates.jpg"
        # Tiles carry the SLOT's aspect ratio and crop offset, not the source's,
        # so the sheet shows what will actually be visible on the slide rather
        # than the full frame the browser would then crop in half.
        n, th = len(tiles), 300
        tw = max(2, int(round(th * gw / gh / 2)) * 2)
        cols = min(4, n)
        rows = (n + cols - 1) // cols

        # Uniform tiles on a row-major grid. Tiles are NOT numbered in-image:
        # drawtext needs libfreetype and Homebrew's ffmpeg ships without it.
        # Reading order matches the legend printed below instead: left to right,
        # top to bottom, `cols` per row.
        cell_w, cell_h = tw + 4, th + 4
        labels = "".join(
            f"[{i}:v]{video_filter(tw, th, cx, cy, tile_fits[i], str(i)).replace(f',fps={FPS}', '')},"
            f"pad={cell_w}:{cell_h}:2:2:color=white[v{i}];"
            for i in range(n))
        layout = "|".join(f"{(i % cols) * cell_w}_{(i // cols) * cell_h}" for i in range(n))
        chain = (labels + "".join(f"[v{i}]" for i in range(n))
                 + f"xstack=inputs={n}:layout={layout}:fill=white[out]")

        cmd = ["ffmpeg", "-y", "-v", "error"]
        for t in tiles:
            cmd += ["-i", str(t)]
        cmd += ["-filter_complex", chain, "-map", "[out]", "-frames:v", "1", str(sheet)]
        run(cmd)
        for t in tiles:
            t.unlink()

        print(f"\n{slide['video']}  seg {slide.get('seg', '--')}  narration {vo:.1f}s"
              f"  {gw}x{gh} crop=({cx},{cy})  query: {slide['stock']['query']!r}")
        print(f"  sheet: {sheet}  (tiles show the cropped slot, not the full frame)")
        print(f"  {n} candidates, {rows} row(s) x {cols}, left to right, top to bottom:")
        print("\n".join(legend))


def stage_fetch(lesson_dir: Path, only: list[str], force: bool):
    v2 = lesson_dir / "work_player" / "v2"
    v2.mkdir(parents=True, exist_ok=True)
    tmp = v2 / ".stock_tmp"
    tmp.mkdir(exist_ok=True)

    credits_path = v2 / "broll_credits.json"
    credits = json.loads(credits_path.read_text()) if credits_path.exists() else {}

    for slide in slots(lesson_dir, only):
        name = slide["video"]
        out = v2 / name
        if out.exists() and not force:
            print(f"skip {name} (exists)")
            continue

        vo = vo_for(lesson_dir, slide)
        stock = slide["stock"]
        gw0, gh0 = geometry_for(slide)
        found = candidates(stock, vo, gw0 / gh0)
        if not found:
            print(f"WARNING {name}: no candidates for {stock['query']!r}")
            continue

        pick = stock.get("pick")
        if pick:
            match = [c for c in found
                     if c["provider"] == pick["provider"] and str(c["id"]) == str(pick["id"])]
            if not match:
                print(f"WARNING {name}: pinned {pick} not in results, using top match")
            chosen = match[0] if match else found[0]
        else:
            chosen = found[0]

        raw = tmp / f"{Path(name).stem}_src.mp4"
        req = urllib.request.Request(chosen["url"], headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=300) as r:
            raw.write_bytes(r.read())

        src_len = duration(raw)
        clip_len = min(vo + TAIL_PAD, src_len)
        gw, gh = geometry_for(slide)
        cx = float(stock.get("crop_x", 0.5))
        cy = float(stock.get("crop_y", 0.5))
        fit = fit_for(slide, chosen)
        normalize(raw, out, clip_len, gw, gh, cx, cy, fit)
        raw.unlink()

        credits[name] = {k: chosen[k] for k in
                         ("provider", "id", "page", "author", "author_url", "license")}
        credits[name]["query"] = stock["query"]
        credits[name]["clip_seconds"] = round(clip_len, 2)
        credits[name]["output"] = f"{gw}x{gh}"
        credits[name]["crop_x"] = cx
        credits[name]["crop_y"] = cy
        credits[name]["fit"] = fit
        credits_path.write_text(json.dumps(credits, indent=2, sort_keys=True) + "\n")

        t = tier(clip_len, vo)
        note = {"OK": "", "SLOW": "  (plays in slow motion)",
                "SHORT": "  (SHORT: ends early and freezes on the push-in)"}[t]
        print(f"fetch {name}  {chosen['provider']} {chosen['id']}  "
              f"{clip_len:.1f}s of {src_len:.1f}s vs {vo:.1f}s narration  "
              f"{chosen['author']}{note}")

    if not any(tmp.iterdir()):
        tmp.rmdir()
    if credits:
        print(f"\ncredits -> {credits_path.relative_to(lesson_dir)}")


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    lesson_dir = Path(sys.argv[1]).resolve()
    stage = sys.argv[2]
    rest = sys.argv[3:]
    force = "--force" in rest
    only = [a for a in rest if not a.startswith("--")]

    if stage == "search":
        stage_search(lesson_dir, only)
    elif stage == "preview":
        stage_preview(lesson_dir, only)
    elif stage == "fetch":
        stage_fetch(lesson_dir, only, force)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
