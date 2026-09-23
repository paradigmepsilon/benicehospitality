#!/usr/bin/env python3
"""
build_cohort_decks.py — live-cohort presenter decks (human-paced, click-to-build).

Reads  <cohort dir>/sessions/session_*.json
Writes <cohort dir>/decks/session_*.html  (one self-contained deck per session)
       <cohort dir>/decks/index.html      (session picker, cohort name, key list)

The decks are for a person presenting live, so nothing in them runs on a timer except the
countdowns the presenter starts. One click reveals one idea. The session JSON carries the
on-screen text, the per-click talk track ("say") and the planned minutes per slide, which is
what the presenter window uses for its pace readout.

Usage:
  python3 scripts/lessons/masterclass/build_cohort_decks.py "Courses/Car Rental Riches/Masterclass"
  python3 scripts/lessons/masterclass/build_cohort_decks.py "Courses/Car Rental Riches/Masterclass" --check

Schema: Courses/Car Rental Riches/Masterclass/AUTHORING.md
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "deck_template.html"

TYPES = {
    "title", "section", "agenda", "statement", "bullets", "columns", "stat", "table",
    "compare", "poll", "board", "timer", "tool", "checklist", "quote", "close",
}
# Production markers may sit in the talk track (the presenter window highlights them) but
# must never reach the audience. These keys are the ones the presenter reads, not the room.
PRIVATE_KEYS = {"say", "notes", "support_say", "verdict_say", "debrief_say"}
MARKER = re.compile(r"\[(ALEX|VERIFY|SCREENSHOT|TODO)", re.I)
DASH = re.compile(r"[–—]")
MAX_BUILDS = 7  # more clicks than this on one slide and the room loses the thread


def walk(node, path=""):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk(v, f"{path}/{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node


def builds_of(sl: dict) -> int:
    t = sl["type"]
    if t in ("bullets", "checklist"):
        return len(sl["items"])
    if t == "columns":
        return len(sl["cols"])
    if t == "table":
        return len(sl["rows"])
    if t == "tool":
        return len(sl["steps"])
    if t == "timer":
        return len(sl.get("instructions", []))
    if t == "stat":
        return 1 + bool(sl.get("support")) + bool(sl.get("source"))
    if t == "compare":
        return 2 + bool(sl.get("verdict"))
    if t == "poll":
        return 1 + bool(sl.get("debrief"))
    if t == "agenda":
        return 1
    if t == "statement":
        return 1 if sl.get("kicker") else 0
    if t == "close":
        return 1 if sl.get("next_prework") else 0
    return 0


REQUIRED = {
    "agenda": ["rows"], "statement": ["headline"], "bullets": ["items"], "columns": ["cols"],
    "stat": ["figure", "label"], "table": ["columns", "rows"], "compare": ["left", "right"],
    "poll": ["options"], "board": ["board_id", "columns"], "timer": ["timer_minutes"],
    "tool": ["tool_name", "steps"], "checklist": ["items"], "quote": ["quote"],
    "close": ["next_title"], "section": ["title"],
}


def validate(deck: dict, name: str, board_cols: dict) -> list[str]:
    errs: list[str] = []
    s = deck.get("session", {})
    for k in ("id", "week", "label", "title", "modules", "duration_min"):
        if k not in s:
            errs.append(f"session.{k} missing")
    slides = deck.get("slides", [])
    if not slides or slides[0].get("type") != "title":
        errs.append("first slide must be type 'title'")
    if slides and slides[-1].get("type") != "close":
        errs.append("last slide must be type 'close'")
    total = 0.0
    for i, sl in enumerate(slides, 1):
        t = sl.get("type")
        if t not in TYPES:
            errs.append(f"slide {i}: unknown type {t!r}")
            continue
        for k in REQUIRED.get(t, []):
            if k not in sl:
                errs.append(f"slide {i} ({t}): missing {k!r}")
        if "minutes" not in sl:
            errs.append(f"slide {i} ({t}): missing 'minutes'")
        total += float(sl.get("minutes", 0))
        if not sl.get("segment"):
            errs.append(f"slide {i} ({t}): missing 'segment'")
        try:
            n = builds_of(sl)
        except (KeyError, TypeError) as e:
            errs.append(f"slide {i} ({t}): malformed ({e})")
            continue
        if n > MAX_BUILDS:
            errs.append(f"slide {i} ({t}): {n} clicks; split it (max {MAX_BUILDS})")
        if t == "columns" and not 2 <= len(sl["cols"]) <= 4:
            errs.append(f"slide {i}: columns needs 2 to 4 cols")
        if t == "poll" and not 2 <= len(sl["options"]) <= 5:
            errs.append(f"slide {i}: poll needs 2 to 5 options")
        if t == "table":
            w = len(sl["columns"])
            for r, row in enumerate(sl["rows"], 1):
                if len(row.get("cells", [])) != w:
                    errs.append(f"slide {i}: table row {r} has {len(row.get('cells', []))} cells, header has {w}")
        if t == "board":
            keys = [c["key"] for c in sl["columns"]]
            prior = board_cols.setdefault(sl["board_id"], keys)
            if prior != keys:
                errs.append(f"slide {i}: board {sl['board_id']!r} columns differ from its first use ({prior})")
        # the talk track has to cover every click, or the presenter window shows a blank
        if t in ("bullets", "checklist", "columns", "table", "tool"):
            key = {"bullets": "items", "checklist": "items", "columns": "cols", "table": "rows", "tool": "steps"}[t]
            for j, it in enumerate(sl[key], 1):
                if not it.get("say"):
                    errs.append(f"slide {i} ({t}) click {j}: no 'say' line for the presenter")
    want = float(s.get("duration_min", 0))
    if abs(total - want) > 0.01:
        errs.append(f"planned minutes add up to {total:g}, session is {want:g}")
    for path, text in walk(deck):
        if DASH.search(text):
            errs.append(f"{path}: en or em dash (banned; rewrite the sentence)")
        leaf = re.sub(r"\[\d+\]", "", path).rsplit("/", 1)[-1]
        if leaf not in PRIVATE_KEYS and MARKER.search(text):
            errs.append(f"{path}: production marker in audience-facing text")
    return [f"{name}: {e}" for e in errs]


def index_html(decks: list[dict]) -> str:
    cards = "".join(
        f'<a class="card" href="{d["file"]}"><div class="wk">{d["label"]} · {d["modules"]}</div>'
        f'<div class="ti">{d["title"]}</div><div class="me">{d["slides"]} slides · {d["clicks"]} clicks · '
        f'{d["minutes"]:g} minutes</div></a>'
        for d in decks
    )
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>CRR Fleet Builder · Live Sessions</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
body{{margin:0;background:#f8f6f1;color:#1a1a1a;font-family:"DM Sans",-apple-system,sans-serif;padding:56px clamp(20px,6vw,96px)}}
h1{{font-family:"Playfair Display",Georgia,serif;font-weight:400;font-size:clamp(34px,5vw,60px);letter-spacing:-.015em;margin:0 0 8px}}h1 em{{color:#5b9a2f}}
p{{color:#3d3d3d;max-width:760px;line-height:1.55;font-size:17px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin:34px 0}}
.card{{display:block;background:#fff;border:1px solid rgba(26,26,26,.14);border-top:5px solid #5b9a2f;border-radius:4px;padding:22px 24px;text-decoration:none;color:inherit}}
.card:hover{{border-top-color:#f5a623}}.wk{{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#5b9a2f}}
.ti{{font-family:"Playfair Display",Georgia,serif;font-size:25px;line-height:1.18;margin:10px 0 12px}}.me{{font-size:14px;color:#807868}}
.row{{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:20px}}input{{font:inherit;padding:10px 12px;border:1px solid rgba(26,26,26,.2);border-radius:4px;min-width:240px}}
button{{font:inherit;font-weight:600;padding:10px 18px;border:0;border-radius:4px;background:#4a7d25;color:#fff;cursor:pointer}}
code{{font-family:"JetBrains Mono",monospace;font-size:13px;background:#ece8dd;padding:2px 6px;border-radius:3px}}small{{color:#807868}}
</style></head><body>
<h1>Fleet Builder, <em>live.</em></h1>
<p>Eight weekly sessions plus the bonus week. Every deck is paced by you: one click shows one idea, and nothing moves on its own. Press <code>P</code> in a deck for the presenter window (talk track, clock, pace), <code>?</code> for every key.</p>
<div class="row"><label for="c">Cohort name</label><input id="c" placeholder="for example 2027-spring"><button id="s">Save</button><small id="m"></small></div>
<p><small>Boards and poll counts are saved in this browser under the cohort name, so a new cohort starts clean. They hold student names: export them from a deck's overview (<code>O</code>) and keep the file private.</small></p>
<div class="grid">{cards}</div>
<script>var i=document.getElementById("c"),m=document.getElementById("m");try{{i.value=JSON.parse(localStorage.getItem("crrfb:cohort")||'"default"')}}catch(e){{}}
document.getElementById("s").onclick=function(){{try{{localStorage.setItem("crrfb:cohort",JSON.stringify(i.value.trim()||"default"));m.textContent="Saved. Decks opened from here use this cohort."}}catch(e){{m.textContent="This browser is blocking storage; boards will not persist."}}}};</script>
</body></html>"""


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check_only = "--check" in sys.argv
    if not args:
        print(__doc__)
        return 2
    root = Path(args[0])
    sessions = sorted((root / "sessions").glob("session_*.json"))
    if not sessions:
        print(f"no session_*.json under {root / 'sessions'}")
        return 1
    template = TEMPLATE.read_text()
    out = root / "decks"
    errs: list[str] = []
    board_cols: dict = {}
    decks = []
    loaded = []
    for p in sessions:
        try:
            deck = json.loads(p.read_text())
        except json.JSONDecodeError as e:
            errs.append(f"{p.name}: invalid JSON ({e})")
            continue
        errs += validate(deck, p.name, board_cols)
        loaded.append((p, deck))
    if errs:
        print("\n".join(errs))
        print(f"\n{len(errs)} problem(s). Nothing written.")
        return 1
    for p, deck in loaded:
        s = deck["session"]
        clicks = sum(builds_of(sl) for sl in deck["slides"])
        mins = sum(float(sl["minutes"]) for sl in deck["slides"])
        print(f"{p.name}: {len(deck['slides'])} slides, {clicks} clicks, {mins:g} min  OK")
        decks.append({"file": p.stem + ".html", "label": s["label"], "modules": s["modules"], "title": s["title"],
                      "slides": len(deck["slides"]), "clicks": clicks, "minutes": mins})
        if check_only:
            continue
        out.mkdir(parents=True, exist_ok=True)
        payload = json.dumps(deck, ensure_ascii=False).replace("</", "<\\/")
        html = template.replace("{{PAGE_TITLE}}", f"{s['label']} · {s['title']} · CRR Fleet Builder").replace("{{DECK_JSON}}", payload)
        if "{{" in html.split('<script id="deck-data"')[0]:
            print(f"{p.name}: unreplaced template marker")
            return 1
        (out / (p.stem + ".html")).write_text(html)
    if check_only:
        return 0
    (out / "index.html").write_text(index_html(decks))
    # brand marks sit next to the decks, same files the lesson bundles use
    for svg in ("BNHG_full_lockup.svg", "BNHG_letter_mark.svg"):
        if not (out / svg).exists():
            src = next(iter(sorted(root.parent.glob(f"Module */*_Bundle/{svg}"))), None)
            if src:
                shutil.copy(src, out / svg)
            else:
                print(f"WARNING {svg} not found to copy")
    print(f"wrote {len(decks)} deck(s) + index.html -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
