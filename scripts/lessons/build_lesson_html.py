#!/usr/bin/env python3
"""
build_lesson_html.py — Assemble a lesson HTML from a spec JSON and the player template.

Usage:
    python3 build_lesson_html.py <spec.json> <output.html>

The spec JSON shape is documented in scripts/lessons/README.md.

How it works:
1. Reads the player template (templates/lesson_player.html)
2. Reads each slide from the spec
3. Renders each slide using the appropriate layout snippet (templates/layouts/<layout>.html)
4. Builds the LESSON_CONFIG JSON
5. Substitutes the template markers and writes the output

The template has these markers (do not remove from the template):
    {{HTML_TITLE}}        — the <title> element
    {{MODULE_TAG}}        — header "Module X · Lesson Y"
    {{LESSON_TITLE}}      — header lesson title
    {{LESSON_CONFIG_JSON}} — the JS const LESSON_CONFIG = {...};
    {{SLIDES_HTML}}       — all <section class="slide"> blocks concatenated
"""
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = SCRIPT_DIR / "templates"
LAYOUTS_DIR = TEMPLATE_DIR / "layouts"


# Layouts that never render a disclaimer footer, even when the lesson has one.
# cover = clean hero, quote = the slide itself is the callout.
NO_DISCLAIMER_LAYOUTS = {"cover", "quote"}


def build_disclaimer_html(layout: str, extra_classes: str, disclaimer_text: str) -> str:
    """Return the disclaimer footer HTML for a slide, or empty string if it should be skipped."""
    if not disclaimer_text:
        return ""
    if layout in NO_DISCLAIMER_LAYOUTS:
        return ""
    if "no-disclaimer" in (extra_classes or "").split():
        return ""
    return (
        '<div class="disclaimer-footer">'
        '<strong>Disclaimer</strong> · ' + disclaimer_text + "</div>"
    )


def render_slide(
    slide: dict,
    total_slides: int,
    module_num: int,
    lesson_num: int,
    disclaimer_text: str = "",
) -> str:
    """Render one slide from spec into HTML."""
    layout = slide["layout"]
    layout_path = LAYOUTS_DIR / f"{layout.replace('-', '_')}.html"
    if not layout_path.exists():
        raise ValueError(f"Unknown layout: {layout}. Expected file: {layout_path}")

    snippet = layout_path.read_text()

    # Build context for substitution.
    classes = f"slide-{layout}"
    extra = slide.get("classes", "")
    if extra:
        classes = f"{classes} {extra}"

    slide_num = slide["num"]
    audio = slide.get("audio_file", f"audio/voiceover_{slide_num:02d}.mp3")

    ctx = {
        "SLIDE_CLASSES": classes,
        "AUDIO_FILE": audio,
        "SLIDE_NUM": f"{slide_num:02d}",
        "TOTAL_SLIDES": f"{total_slides:02d}",
        "MODULE_NUM": str(module_num),
        "LESSON_NUM": str(lesson_num),
        "DISCLAIMER_FOOTER": build_disclaimer_html(layout, extra, disclaimer_text),
    }

    content = slide.get("content", {})
    for k, v in content.items():
        ctx[k.upper()] = v if v is not None else ""

    # Image substitutions: images[N].filename → IMG_N_FILENAME, etc.
    for i, img in enumerate(slide.get("images", []), 1):
        ctx[f"IMG_{i}_FILENAME"] = img.get("filename", "")
        ctx[f"IMG_{i}_SLOT"] = img.get("slot", "")

    # Items (for lists, columns, grids, cards): a parallel array
    for i, item in enumerate(slide.get("items", []), 1):
        for k, v in item.items():
            ctx[f"ITEM_{i}_{k.upper()}"] = v if v is not None else ""

    # Substitute placeholders. Unknown placeholders left empty (so missing fields don't crash).
    out = snippet
    while "{{" in out:
        # Find the next placeholder
        start = out.find("{{")
        end = out.find("}}", start)
        if end == -1:
            break
        key = out[start + 2: end].strip()
        value = ctx.get(key, "")
        out = out[:start] + str(value) + out[end + 2:]

    # The spec records master image filenames as .png (the masters live next to the
    # bundle for archival/regeneration). The bundle ships .webp copies produced by
    # optimize_images.py, so the served HTML must reference .webp. Rewrite any
    # `images/...png` reference inside the rendered slide to `.webp`. Top-level
    # `.png` SVGs/logos are unaffected because they live at the bundle root, not
    # under `images/`.
    out = _IMG_PNG_RE.sub(r"images/\1.webp", out)

    return out


# Matches `images/<name>.png` inside any quoted attribute or url() — used to
# rewrite bundle image references from master .png to served .webp.
import re as _re
_IMG_PNG_RE = _re.compile(r"images/([A-Za-z0-9_\-]+)\.png")


def resolve_disclaimer_text(spec: dict) -> str:
    """Inline `spec.disclaimer` wins; otherwise look up by `spec.disclaimer_topic`."""
    text = spec.get("disclaimer")
    if text:
        return text
    topic = spec.get("disclaimer_topic")
    if not topic or topic == "none":
        return ""
    try:
        from _shared import DISCLAIMERS
        return DISCLAIMERS.get(topic, "")
    except ImportError:
        return ""


def build_lesson_html(spec: dict) -> str:
    template = (TEMPLATE_DIR / "lesson_player.html").read_text()

    total = len(spec["slides"])
    module_num = spec["module_num"]
    lesson_num = spec["lesson_num"]
    lesson_title = spec["lesson_title"]

    disclaimer_text = resolve_disclaimer_text(spec)

    # Render each slide
    rendered_slides = [
        render_slide(s, total, module_num, lesson_num, disclaimer_text)
        for s in spec["slides"]
    ]
    slides_html = "\n\n".join(rendered_slides)

    # Build LESSON_CONFIG
    lesson_config = {
        "meta": {
            "moduleNumber": module_num,
            "lessonNumber": lesson_num,
            "lessonTitle": lesson_title,
            "runtime": spec.get("runtime_estimate", ""),
        },
        "interSlidePauseMs": 400,
        "slideTitles": [s.get("title_label", f"Slide {s['num']}") for s in spec["slides"]],
    }
    lesson_config_json = json.dumps(lesson_config, indent=2)

    # Substitute top-level markers
    out = template
    out = out.replace("{{HTML_TITLE}}",
                      f"Room Rental Riches · Module {module_num} · Lesson {lesson_num}")
    out = out.replace("{{MODULE_TAG}}", f"Module {module_num} · Lesson {lesson_num}")
    out = out.replace("{{LESSON_TITLE}}", lesson_title)
    out = out.replace("{{LESSON_CONFIG_JSON}}", lesson_config_json)
    out = out.replace("<!-- {{SLIDES_HTML}} -->", slides_html)

    return out


def main():
    if len(sys.argv) < 3:
        print("Usage: build_lesson_html.py <spec.json> <output.html>", file=sys.stderr)
        sys.exit(1)

    spec_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    with spec_path.open() as f:
        spec = json.load(f)

    html = build_lesson_html(spec)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html)

    # Quality check: scan for unsubstituted placeholders
    leftovers = []
    i = 0
    while i < len(html):
        start = html.find("{{", i)
        if start == -1:
            break
        end = html.find("}}", start)
        if end == -1:
            break
        leftovers.append(html[start: end + 2])
        i = end + 2
    if leftovers:
        # Some are intentional ({{...}} inside CSS template strings inside JS, etc.)
        # Report but don't crash.
        unique = set(leftovers)
        for l in sorted(unique):
            print(f"  WARN: unsubstituted placeholder: {l}", file=sys.stderr)

    print(f"Wrote {out_path} ({len(html)} chars, {len(spec['slides'])} slides)")


if __name__ == "__main__":
    main()
