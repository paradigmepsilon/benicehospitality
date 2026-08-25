#!/usr/bin/env python3
"""
heygen_package.py — Build a HeyGen "Lesson" upload package from a lesson spec.

Input:  Courses/Room Rental Riches/Blueprint Course/Module N.M/heygen_spec.json
Output: Courses/Room Rental Riches/Module N.M/heygen_package/
          00_README_fill_the_form.md
          01_lesson_title.txt
          02_lesson_content.md          (editing rules + script with cues + verbatim slide text)
          source_material/
            Lesson_N_M_Slides.pdf       (title slide + every content slide)
            slide_NN.png
            BNHG_Lesson_Brief.pdf       (brand, voice, pacing, and this lesson's locked facts)

Spec format:
{
  "lesson": "1.2", "title": "...", "subtitle": "...", "length_min": 8,
  "disclaimer": "legal" | "tax" | "insurance" | "regulatory" | null,
  "facts": ["locked fact 1", ...],            # numbers/claims the agent must not alter
  "prior": "what the previous lesson covered (one line)",
  "next": "what the next lesson covers (one line)",
  "segments": [
    {"kind": "avatar", "vo": "..."},                                  # keep each under ~12 s of speech
    {"kind": "slide", "eyebrow": "...", "heading": "...", "bullets": [...] | "table": {"headers": [...], "rows": [[...]]}, "vo": "..."},
    {"kind": "broll", "shots": ["shot 1 ...", "shot 2 ...", ...], "vo": "..."},
    {"kind": "cutaway", "shot": "...", "vo": "..."}                   # short insert inside an on-camera stretch
  ]
}

Usage: python scripts/lessons/heygen_package.py "Courses/Room Rental Riches/Module 1.2" [--all]
"""
from __future__ import annotations

import html
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/lessons/module0"))
import build  # noqa: E402  (card CSS + colors)

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
W, H = 1920, 1080

DISCLAIMERS = {
    "legal": "Della and BNHG are not attorneys, CPAs, or licensed insurance brokers. Educational information only. Consult a licensed attorney, CPA, and insurance broker in your state before acting.",
    "tax": "Della and BNHG are not CPAs. Tax law changes annually. Educational information only. Consult a licensed CPA in your state before filing or making tax decisions.",
    "insurance": "Della and BNHG are not licensed insurance brokers. Coverage varies by state, carrier, and property. Educational information only. Verify coverage and exclusions in writing with a licensed broker.",
    "regulatory": "Della and BNHG are not attorneys. Regulations change. Educational information only. Verify all rules with your city, county, state, and a licensed attorney before operating.",
}

EDITING_RULES = """## Editing rules for this lesson (apply every one of them)

1. CONTENT FIRST. The slides and B-roll are the lesson. Della on camera is the relief between them. Keep Della on screen for no more than about 25 percent of the runtime. Every [ON CAMERA] block below is short on purpose; do not extend it and do not add on-camera time that is not marked.
2. PACING. No single video shot longer than 10 seconds, stock or Della. Where Della speaks for longer than about 12 seconds, cut away to a matching stock shot for 4 to 8 seconds, then cut back. Text slides may hold for the whole spoken passage (20 to 45 seconds) with items building in as they are spoken.
3. SLIDES, VERBATIM, ONCE. Where the script says SLIDE TEXT, put exactly that text on screen, in that order, in the uploaded slide style (cream background, Playfair Display headings, DM Sans body, olive accent). Show each slide one time. Do not rewrite, summarize, add subtext, add tags, or add captions. Never produce a second version of the same data (no alternate charts, no "analysis" tables, no restyled tables). Never alter a number.
4. NO INVENTED BRANDING. No third-party logos, product names, "Scene 01" labels, watermarks, or fake report mastheads. The only brand on screen is Room Rental Riches / Be Nice Hospitality Group.
5. B-ROLL. Stock video only, never stills. Residential and lived-in: furnished bedrooms, shared kitchens with people in them, front porches, arrivals with suitcases, a host checking a room, a cleaner at work. Warm natural light. A person in frame in nearly every shot. Never: empty showroom kitchens, hotels, corporate offices, skylines, handshake footage, anything glossy or commercial. No black frames between cuts.
6. PEOPLE. Across the lesson the people shown must be diverse: Black, white, Hispanic, and mixed-race. Not the same person in every shot.
7. VOICE. Read the spoken lines verbatim. Numbers are spelled out for speech on purpose. Della's tone: direct, warm, operator to operator, short sentences, no hype.
8. LENGTH. Hit the lesson length in the form. Do not pad with extra transitions or summaries.
"""


def esc(t: str) -> str:
    return html.escape(t, quote=False)


def card_html(spec, s) -> str:
    mark = build.LETTER_MARK.read_text() if build.LETTER_MARK.exists() else ""
    body = [f'<div class="eyebrow">{esc(s.get("eyebrow", ""))}</div>', f'<h1>{esc(s["heading"])}</h1>']
    if s.get("table"):
        t = s["table"]
        rows = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in t["rows"])
        head = "".join(f"<th>{esc(h)}</th>" for h in t["headers"])
        body.append(f"<table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table>")
    elif s.get("bullets"):
        items = "".join(f'<li><span class="n">{i+1}.</span><span>{esc(b)}</span></li>' for i, b in enumerate(s["bullets"]))
        body.append(f"<ul>{items}</ul>")
    solo = "solo" if not s.get("bullets") and not s.get("table") else ""
    many = "many" if len(s.get("bullets") or []) > 6 or len((s.get("table") or {}).get("rows", [])) > 6 else ""
    extra = ".many li{font-size:26px;line-height:1.3} .many ul{gap:14px} .many h1{font-size:54px;margin-bottom:28px} .many td,.many th{padding:12px 20px;font-size:25px}"
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{build.CARD_CSS}{extra}</style></head>
<body><div class="card {solo} {many}"><div class="bar"></div><div class="mark">{mark}</div>{''.join(body)}
<div class="foot">Room Rental Riches · Lesson {esc(spec['lesson'])} · {esc(spec['title'])}</div></div></body></html>"""


def title_html(spec) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{build.CARD_CSS}
.title h1{{font-size:84px;max-width:1560px;margin-bottom:28px}} .title .sub{{font-size:34px;color:{build.COLORS['ink2']};max-width:1300px;line-height:1.4}}</style></head>
<body><div class="card title"><div class="bar"></div><div class="eyebrow">Room Rental Riches · Module {esc(spec['lesson'].split('.')[0])} · Lesson {esc(spec['lesson'])}</div>
<h1>{esc(spec['title'])}</h1><div class="sub">{esc(spec['subtitle'])}</div><div class="foot">Be Nice Hospitality Group · Della Henry</div></div></body></html>"""


def shot(htmlfile: Path, png: Path):
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=6000",
                    f"--window-size={W},{H}", f"--screenshot={png}", f"file://{htmlfile.resolve()}"],
                   check=True, capture_output=True)


def pdf_from_md(md: str, out: Path):
    body = []
    for line in md.splitlines():
        if line.startswith("# "): body.append(f"<h1>{esc(line[2:])}</h1>")
        elif line.startswith("## "): body.append(f"<h2>{esc(line[3:])}</h2>")
        elif line.startswith("- "): body.append(f"<li>{esc(line[2:])}</li>")
        elif re.match(r"^\d+\. ", line): body.append(f"<li>{esc(line.split('. ', 1)[1])}</li>")
        elif line.strip(): body.append(f"<p>{esc(line)}</p>")
    h = f"""<!doctype html><html><head><meta charset="utf-8"><style>@page{{size:Letter;margin:0.8in}}
body{{font-family:Georgia,serif;color:#1a1a1a;line-height:1.45;font-size:12pt}} h1{{font-size:22pt;margin:0 0 10pt}}
h2{{font-size:14pt;color:#4a7d25;margin:16pt 0 6pt}} li{{margin:3pt 0 3pt 16pt}} p{{margin:6pt 0}}</style></head><body>{''.join(body)}</body></html>"""
    tmp = out.with_suffix(".html"); tmp.write_text(h)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={out.resolve()}", f"file://{tmp.resolve()}"],
                   check=True, capture_output=True)
    tmp.unlink()


def brief_md(spec) -> str:
    m = spec["lesson"].split(".")[0]
    facts = "\n".join(f"- {f}" for f in spec.get("facts", []))
    disc = DISCLAIMERS.get(spec.get("disclaimer") or "", "")
    disc_block = f"\n## Disclaimer (show as a small footer line on every slide in this lesson)\n- {disc}\n" if disc else ""
    return f"""# Room Rental Riches — Instructor and Brand Brief (Lesson {spec['lesson']})

Context document for the lesson generator. Keep the script, tone, pacing, facts, and visuals on brand.

## The course
- Title: Room Rental Riches. Companion book: Room Rental Riches: The Blueprint, by Della Henry.
- Structure: Module 0 (Welcome) plus six core modules following the Be Nice Way: Research (Module 1), Planning (Module 2), Setup (Module 3), Operations (Module 4), Marketing (Module 5), and a Bonus module on revenue and scaling (Module 6).
- Audience: first-time co-living hosts. Homeowners with spare rooms, working professionals, small investors.
- This is Lesson {spec['lesson']}, in Module {m}. Previous lesson: {spec.get('prior', 'n/a')}. Next lesson: {spec.get('next', 'n/a')}.

## The instructor
- Della Henry. Co-owner of Be Nice Properties, co-founder of Be Nice Hospitality Group (Atlanta). Veteran; her husband Alex is also a veteran and co-founder. More than twenty one co-living homes across the Southeast.
- Voice: direct, warm, operator to operator. Short declarative sentences. Says "don't", not "do not". Specific numbers over adjectives.
- Never: hype, "game-changer", "unlock", "transform", "revolutionary", get-rich-quick framing, motivational-speaker energy.
- Spoken numbers are spelled out. No em dashes or en dashes in spoken text.

## Pacing and structure
- Content first: slides and B-roll carry the lesson; Della on camera is no more than about a quarter of the runtime.
- No single video shot longer than 10 seconds, stock or Della. Cut away from Della after about 12 seconds of speech.
- Text slides hold for the full spoken passage with items building in as spoken.
- Show each slide once. Never produce alternate versions of the same data. Never alter a number.

## Slides
- SLIDE TEXT in the script goes on screen verbatim, in order. No added subtext, tags, captions, or brands.
- Style: cream #f8f6f1 background, Playfair Display headings, DM Sans body, olive #5b9a2f accent, dark olive #4a7d25 highlight, ink #1a1a1a, muted #807868. The uploaded deck shows the intended look for each slide.

## B-roll
- Stock video only. Residential, lived-in, warm natural light, a person in frame. Never showroom kitchens, hotels, offices, skylines, handshakes, black frames.
- People across the lesson must be diverse: Black, white, Hispanic, and mixed-race.

## Locked facts for this lesson (do not alter, round, or re-derive)
{facts}
{disc_block}"""


def content_md(spec) -> str:
    out = [f"# Lesson {spec['lesson']}: {spec['title']}", "", f"_{spec['subtitle']}_", "",
           "Instructor: Della Henry. Target length: about " + str(spec.get("length_min", 8)) + " minutes.", "", EDITING_RULES, "---", ""]
    n = 0
    for s in spec["segments"]:
        k = s["kind"]
        if k == "avatar":
            out.append("## [ON CAMERA: Della, keep under 12 seconds]")
        elif k == "cutaway":
            out.append(f"## [CUTAWAY, 5 to 8 s, voice continues: stock video, {s['shot']}]")
        elif k == "broll":
            shots = "; ".join(f"({i+1}) {x}" for i, x in enumerate(s["shots"]))
            out.append(f"## [B-ROLL SEQUENCE, {len(s['shots'])} shots, 5 to 8 s each, voice continues: {shots}]")
        elif k == "slide":
            n += 1
            out.append(f"## [SLIDE {n}. SLIDE TEXT, verbatim, show once, items build in as spoken]")
            out.append("")
            if s.get("eyebrow"): out.append(f"Eyebrow: {s['eyebrow']}")
            out.append(f"Heading: {s['heading']}")
            if s.get("table"):
                t = s["table"]
                out.append("Table columns: " + " | ".join(h if h else "(blank)" for h in t["headers"]))
                for r in t["rows"]:
                    out.append("Row: " + " | ".join(r))
            for i, b in enumerate(s.get("bullets") or []):
                out.append(f"{i+1}. {b}")
        out += ["", s["vo"], ""]
    return "\n".join(out)


def readme_md(spec, nslides) -> str:
    return f"""# HeyGen "Lesson Basics" form, Lesson {spec['lesson']}

| Field | Value |
|---|---|
| Lesson Title | paste from `01_lesson_title.txt` |
| Lesson Content | paste the whole of `02_lesson_content.md` |
| Source Material | upload `Lesson_{spec['lesson'].replace('.', '_')}_Slides.pdf`, the {nslides} `slide_NN.png`, and `BNHG_Lesson_Brief.pdf`. No photos; B-roll is HeyGen stock video per the cues |
| Lesson length | {spec.get('length_min', 8)} min |
| Speaker | Della, look "Della hosting a live broadcast" (id 3b4169a21ffe4ab0a1b3336c67d8add9) |
| Voice | the same voice used on Lesson 0.1 and 0.2 |
| Orientation | Landscape |
| Continuing a course? | pick the previous lesson's video |

## What to judge in the result
- Della on screen no more than about a quarter of the runtime; no shot over 10 s.
- Every slide shown once, text verbatim, numbers unchanged. No alternate charts or tables. No invented brands or "Scene" labels.
- B-roll residential with people in frame; diverse across the lesson; no black frames.
- Runtime within a minute of the target.
"""


def word_stats(spec):
    av = sum(len(s["vo"].split()) for s in spec["segments"] if s["kind"] == "avatar")
    tot = sum(len(s["vo"].split()) for s in spec["segments"])
    return av, tot


def check(spec):
    errs = []
    for s in spec["segments"]:
        if re.search("[–—]", s["vo"]):
            errs.append(f"dash in VO: {s['vo'][:60]}")
        if s["kind"] == "avatar" and len(s["vo"].split()) > 45:
            errs.append(f"avatar segment too long ({len(s['vo'].split())} words): {s['vo'][:50]}")
    av, tot = word_stats(spec)
    if tot and av / tot > 0.30:
        errs.append(f"avatar share {av/tot:.0%} of words (target <= 25%)")
    est = tot / 140
    if abs(est - spec.get("length_min", 8)) > 2.5:
        errs.append(f"VO is ~{est:.1f} min but length_min is {spec.get('length_min')}")
    return errs


def build_package(lesson_dir: Path):
    spec = json.loads((lesson_dir / "heygen_spec.json").read_text())
    errs = check(spec)
    P = lesson_dir / "heygen_package"; SM = P / "source_material"; SM.mkdir(parents=True, exist_ok=True)
    work = lesson_dir / "work_heygen"; work.mkdir(exist_ok=True)
    for old in SM.glob("slide_*.png"): old.unlink()
    # slides
    pngs = []
    t = work / "slide_00.html"; t.write_text(title_html(spec)); p = work / "slide_00.png"; shot(t, p); pngs.append(p)
    n = 0
    for s in spec["segments"]:
        if s["kind"] != "slide": continue
        n += 1
        hf = work / f"slide_{n:02d}.html"; hf.write_text(card_html(spec, s)); pf = work / f"slide_{n:02d}.png"; shot(hf, pf); pngs.append(pf)
    pages = [Image.open(p).convert("RGB") for p in pngs]
    pages[0].save(SM / f"Lesson_{spec['lesson'].replace('.', '_')}_Slides.pdf", save_all=True, append_images=pages[1:], resolution=144)
    for i, p in enumerate(pngs): Image.open(p).convert("RGB").save(SM / f"slide_{i:02d}.png")
    # docs
    (P / "01_lesson_title.txt").write_text(f"Room Rental Riches · Lesson {spec['lesson']} · {spec['title']}\n")
    (P / "02_lesson_content.md").write_text(content_md(spec))
    pdf_from_md(brief_md(spec), SM / "BNHG_Lesson_Brief.pdf")
    (P / "00_README_fill_the_form.md").write_text(readme_md(spec, len(pngs)))
    av, tot = word_stats(spec)
    print(f"{spec['lesson']:5} {spec['title'][:48]:48} slides={n:2} words={tot:5} avatar={av/tot:4.0%} est={tot/140:4.1f}min" + (f"  WARN: {' | '.join(errs)}" if errs else ""))


def main():
    if "--all" in sys.argv:
        dirs = sorted((ROOT / "Courses/Room Rental Riches").glob("Blueprint Course/Module */heygen_spec.json"), key=lambda p: [float(x) for x in p.parent.name.split()[1].split(".")])
        for d in dirs: build_package(d.parent)
    else:
        d = Path(sys.argv[1]); build_package(d if d.is_absolute() else ROOT / d)


if __name__ == "__main__":
    main()
