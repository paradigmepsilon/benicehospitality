#!/usr/bin/env python3
"""
build_hybrid_lesson.py — spec-driven hybrid player builder.

Generalizes the Lesson 0.1 hybrid format (see build_hybrid.py, which stays
as the hand-built 0.1 reference): reads <lesson_dir>/hybrid_spec.json and
produces Lesson_M_L_Hybrid_Bundle/ with the word-synced player.

Layouts: video-intro · video-split · statement · rows · columns · steps ·
checklist · table. Cue positions come from ElevenLabs STT word timestamps
(work_player/v2/timings/seg_NN.json); an element's "at": {"p": "phrase",
"o": occurrence} resolves to the second that phrase is spoken.

Assets expected in work_player/v2/: seg_NN.mp3 (+ timings), intro_avatar.mp4,
and any b-roll clips named in the spec.

Usage:
  python scripts/lessons/module0/build_hybrid_lesson.py "Courses/.../Module 0.2"
"""
from __future__ import annotations

import html as html_mod
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_hybrid import EXTRA_CSS, PLAYER_JS, SVG_DIR, TEMPLATE, check_svg, duration, norm  # noqa: E402

TABLE_CSS = """
/* ---- comparison table layout ---- */
.slide-table { padding: 6vh 6.5vw 5vh; display: flex; flex-direction: column; height: 100%; }
.slide-table .header { margin-bottom: 3.4vh; }
.slide-table .header .eyebrow { margin-bottom: 12px; }
.slide-table .header h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(26px, 3.4vw, 46px); line-height: 1.08; color: var(--bnhg-ink-primary); letter-spacing: -0.015em; }
.slide-table .header h2 em { color: var(--bnhg-primary); font-style: italic; }
.cmp-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; }
.cmp-table { width: 100%; border-collapse: collapse; }
.cmp-table th { font-family: var(--font-mono); font-size: clamp(10px, 0.95vw, 13px); letter-spacing: 0.18em; text-transform: uppercase; color: var(--bnhg-ink-muted); font-weight: 500; text-align: left; padding: 1.4vh 1.4vw; border-bottom: 1px solid var(--bnhg-ink-secondary); }
.cmp-table td { font-family: var(--font-body); font-size: clamp(13px, 1.35vw, 17px); color: var(--bnhg-ink-secondary); padding: 1.6vh 1.4vw; border-bottom: 1px solid var(--bnhg-hairline); font-variant-numeric: tabular-nums; }
.cmp-table td:first-child { font-family: var(--font-mono); font-size: clamp(11px, 1.05vw, 14px); letter-spacing: 0.1em; text-transform: uppercase; color: var(--bnhg-ink-muted); }
.cmp-table th:last-child, .cmp-table td:last-child { background: var(--bnhg-primary-soft); color: var(--bnhg-primary-dark); font-weight: 600; }
.cmp-table th:last-child { color: var(--bnhg-primary-dark); }
.cmp-table.plain th:last-child, .cmp-table.plain td:last-child { background: none; color: var(--bnhg-ink-secondary); font-weight: 400; }
.cmp-table.plain th:last-child { color: var(--bnhg-ink-muted); }
.table-verdict { margin-top: 3vh; font-family: var(--font-display); font-style: italic; font-size: clamp(15px, 1.7vw, 22px); color: var(--bnhg-primary-dark); border-left: 3px solid var(--bnhg-primary); padding-left: 18px; }
.slide .table-verdict { opacity: 0; transform: translateY(var(--reveal-distance)); }
"""

TIMINGS: dict[str, list[dict]] = {}


def cue(at) -> str | None:
    """at = {"seg": "02", "p": "phrase", "o": 1, "lead": 0.2} -> seconds string."""
    if not at:
        return None
    words = TIMINGS[at["seg"]]
    ph = [norm(t) for t in at["p"].split() if norm(t)]
    seq = [norm(w["w"]) for w in words]
    occ = at.get("o", 1)
    hits = 0
    for i in range(len(seq) - len(ph) + 1):
        if seq[i:i + len(ph)] == ph:
            hits += 1
            if hits == occ:
                return f"{max(0.0, words[i]['s'] - at.get('lead', 0.2)):.2f}"
    sys.exit(f"cue not found: seg {at['seg']} phrase {at['p']!r} (occurrence {occ})")


def esc(t: str) -> str:
    return html_mod.escape(t, quote=False)


def rat(at) -> str:
    t = cue(at)
    return f' data-reveal-at="{t}"' if t else ""


class Ctx:
    def __init__(self, spec):
        self.total = len(spec["slides"])
        self.n = 0

    def num(self, invert=False) -> str:
        self.n += 1
        inv = " invert" if invert else ""
        return f'<span class="slide-number{inv}">{self.n:02d} <span class="total">/ {self.total:02d}</span></span>'


def mark(invert=False) -> str:
    return f'<img class="corner-mark{" invert" if invert else ""}" src="BNHG_letter_mark.svg" alt="">'


def header(s) -> str:
    return (f'<div class="header"><div class="eyebrow">{esc(s["eyebrow"])}</div>'
            f'<h2>{s["title_html"]}</h2></div>')


def r_video_intro(s, ctx):
    return f"""
<section class="slide slide-video-intro{' active' if ctx.n == 0 else ''}" data-layout="video-intro">
  <video class="slide-media" src="video/{s['video']}" preload="auto" playsinline></video>
  <img class="full-lockup" src="BNHG_full_lockup.svg" alt="Be Nice Hospitality Group">
  <div class="intro-overlay" data-reveal-at="0.40">
    <div class="intro-eyebrow">{esc(s['eyebrow'])}</div>
    <h1 class="intro-title">{esc(s['title'])}</h1>
  </div>
  {ctx.num()}
</section>"""


def r_video_split(s, ctx):
    rev = " reverse" if s.get("reverse") else ""
    pos = f' style="object-position: {s["object_position"]}"' if s.get("object_position") else ""
    points = "".join(
        f'<div class="s-point"{rat(p.get("at"))}><div class="point-tag">{esc(p["tag"])}</div>'
        f'<div class="point-text">{esc(p["text"])}</div></div>'
        for p in s["points"])
    title_at = rat(s.get("title_at"))
    return f"""
<section class="slide slide-video-split{rev}" data-layout="video-split" data-audio="audio/voiceover_{s['seg']}.mp3">
  <div class="split-media"><video class="bg-loop" src="video/{s['video']}" muted playsinline preload="auto"{pos}></video></div>
  {mark(bool(s.get('reverse')))}
  <div class="split-content">
    <div class="eyebrow">{esc(s['eyebrow'])}</div>
    <h2{title_at}>{s['title_html']}</h2>
    <div class="split-points" data-focus-group>{points}</div>
  </div>
  {ctx.num(not s.get('reverse'))}
</section>"""


def r_statement(s, ctx):
    kicker = ""
    if s.get("kicker"):
        kicker = f'<p class="mission-kicker"{rat(s["kicker"].get("at"))}>{esc(s["kicker"]["text"])}</p>'
    upnext = ""
    if s.get("upnext"):
        u = s["upnext"]
        upnext = (f'<div class="up-next-band"{rat(u.get("at"))}>'
                  f'<span class="up-next-tag">{esc(u["tag"])}</span>'
                  f'<span class="up-next-title">{esc(u["title"])}</span></div>')
    return f"""
<section class="slide slide-mission" data-layout="statement" data-audio="audio/voiceover_{s['seg']}.mp3">
  {mark()}
  <div class="eyebrow">{esc(s['eyebrow'])}</div>
  <h1 class="reveal-words"{rat(s.get('headline_at'))}>{s['headline_html']}</h1>
  {kicker}
  {upnext}
  {ctx.num()}
</section>"""


def r_rows(s, ctx):
    rows = "".join(
        f'<div class="row-item"{rat(r.get("at"))}><div class="row-title">{esc(r["title"])}</div>'
        f'<div class="row-desc">{esc(r["desc"])}</div></div>'
        for r in s["rows"])
    foot = ""
    if s.get("footnote"):
        foot = f'<div class="rows-footnote"{rat(s["footnote"].get("at"))}>{esc(s["footnote"]["text"])}</div>'
    return f"""
<section class="slide slide-rows" data-layout="rows" data-audio="audio/voiceover_{s['seg']}.mp3">
  {mark()}
  {header(s)}
  <div class="row-list" data-focus-group>{rows}</div>
  {foot}
  {ctx.num()}
</section>"""


def r_columns(s, ctx):
    cols = "".join(
        f'<div class="pillar"{rat(col.get("at"))}><div class="pillar-tag">{esc(col["tag"])}</div>'
        f'<div class="pillar-heading">{esc(col["heading"])}</div>'
        f'<div class="pillar-body">{esc(col["body"])}</div></div>'
        for col in s["cols"])
    return f"""
<section class="slide slide-pillars" data-layout="columns" data-audio="audio/voiceover_{s['seg']}.mp3">
  {mark()}
  {header(s)}
  <div class="pillar-row" data-focus-group>{cols}</div>
  {ctx.num()}
</section>"""


def r_steps(s, ctx):
    steps = "".join(
        f'<div class="step{" bonus" if st.get("bonus") else ""}"{rat(st.get("at"))}>'
        f'<div class="step-num">{esc(st["num"])}</div><div class="step-name">{esc(st["name"])}</div>'
        f'<div class="step-desc">{esc(st["desc"])}</div></div>'
        for st in s["steps"])
    return f"""
<section class="slide slide-steps" data-layout="steps" data-audio="audio/voiceover_{s['seg']}.mp3">
  {mark()}
  {header(s)}
  <div class="step-list" data-focus-group>{steps}</div>
  {ctx.num()}
</section>"""


def r_checklist(s, ctx):
    items = "".join(
        f'<div class="check-item"{rat(i.get("at"))}>{check_svg()}'
        f'<div class="check-text">{esc(i["text"])}</div></div>'
        for i in s["items"])
    upnext = ""
    if s.get("upnext"):
        u = s["upnext"]
        upnext = (f'<div class="up-next-band"{rat(u.get("at"))}>'
                  f'<span class="up-next-tag">{esc(u["tag"])}</span>'
                  f'<span class="up-next-title">{esc(u["title"])}</span></div>')
    return f"""
<section class="slide slide-close" data-layout="checklist" data-audio="audio/voiceover_{s['seg']}.mp3">
  {mark()}
  {header(s)}
  <div class="check-list" data-focus-group>{items}</div>
  {upnext}
  {ctx.num()}
</section>"""


def r_table(s, ctx):
    t = s["table"]
    plain = " plain" if s.get("plain") else ""
    head = "".join(f"<th>{esc(h)}</th>" for h in t["headers"])
    rows = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in row) + "</tr>" for row in t["rows"])
    verdict = ""
    if s.get("verdict"):
        verdict = f'<div class="table-verdict" data-reveal-at="{cue(s["verdict"]["at"])}">{esc(s["verdict"]["text"])}</div>'
    return f"""
<section class="slide slide-table" data-layout="table" data-audio="audio/voiceover_{s['seg']}.mp3">
  {mark()}
  {header(s)}
  <div class="cmp-wrap">
    <table class="cmp-table{plain}"><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table>
    {verdict}
  </div>
  {ctx.num()}
</section>"""


RENDERERS = {
    "video-intro": r_video_intro,
    "video-split": r_video_split,
    "statement": r_statement,
    "rows": r_rows,
    "columns": r_columns,
    "steps": r_steps,
    "checklist": r_checklist,
    "table": r_table,
}


def build(lesson_dir: Path):
    spec = json.loads((lesson_dir / "hybrid_spec.json").read_text())
    v2 = lesson_dir / "work_player" / "v2"

    segs = sorted({s["seg"] for s in spec["slides"] if s.get("seg")})
    for sid in segs:
        TIMINGS[sid] = json.loads((v2 / "timings" / f"seg_{sid}.json").read_text())["words"]

    mod, les = spec["module"], spec["lesson_num"]
    tag = f"{mod}_{les}"
    bundle = lesson_dir / f"Lesson_{tag}_Hybrid_Bundle"
    (bundle / "audio").mkdir(parents=True, exist_ok=True)
    (bundle / "video").mkdir(exist_ok=True)

    total = 0.0
    for sid in segs:
        src = v2 / f"seg_{sid}.mp3"
        shutil.copy2(src, bundle / "audio" / f"voiceover_{sid}.mp3")
        total += duration(src)

    videos = []
    for s in spec["slides"]:
        if s.get("video") and s["video"] not in videos:
            videos.append(s["video"])
    missing = []
    for name in videos:
        src = v2 / name
        if src.exists():
            shutil.copy2(src, bundle / "video" / name)
            if name == "intro_avatar.mp4":
                total += duration(src)
        else:
            missing.append(name)

    for svg in ["BNHG_full_lockup.svg", "BNHG_letter_mark.svg"]:
        shutil.copy2(SVG_DIR / svg, bundle / svg)

    total += (len(spec["slides"]) - 1) * 0.4
    runtime = f"{int(total // 60)}:{int(total % 60):02d}"

    ctx = Ctx(spec)
    slides = "".join(RENDERERS[s["layout"]](s, ctx) for s in spec["slides"])

    config = {
        "meta": {"moduleNumber": mod, "lessonNumber": les,
                 "lessonTitle": spec["title"], "runtime": runtime},
        "interSlidePauseMs": 400,
        "slideTitles": [s.get("nav_title", f"Slide {i+1}") for i, s in enumerate(spec["slides"])],
    }

    tpl = TEMPLATE.read_text()
    head, _script = tpl.split("<script>", 1)
    head = (head
            .replace("{{HTML_TITLE}}", f"Room Rental Riches · Lesson {mod}.{les} · {spec['title']}")
            .replace("{{MODULE_TAG}}", spec["module_tag"])
            .replace("{{LESSON_TITLE}}", f"Lesson {mod}.{les} · {spec['title']}")
            .replace("</style>", EXTRA_CSS + TABLE_CSS + "\n</style>")
            .replace("<!-- {{SLIDES_HTML}} -->", slides)
            .replace('<div class="avatar-pip" id="avatar-pip"><span>Della Avatar</span></div>', ""))

    js = PLAYER_JS.replace("{{LESSON_CONFIG_JSON}}", json.dumps(config, indent=2))
    out_html = head + "<script>" + js + "</script>\n\n</body>\n</html>\n"

    if re.search("[–—]", slides + json.dumps(config)):
        sys.exit("em/en-dash found in slide content or config")

    out = bundle / f"Lesson_{tag}_Hybrid_v1.html"
    out.write_text(out_html)
    print(f"built {out}")
    print(f"runtime ~{runtime}  ({total:.1f}s incl. pauses)  slides {len(spec['slides'])}")
    if missing:
        print(f"WARNING missing videos (drop into work_player/v2/ and re-run): {missing}")


if __name__ == "__main__":
    build(Path(sys.argv[1]).resolve())
