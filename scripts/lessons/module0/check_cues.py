#!/usr/bin/env python3
"""
check_cues.py — validate every "at" cue in a hybrid_spec.json.

Pre-TTS: checks phrases against work_player/v2_scripts.json (unique, in order,
no number words except "one", no em/en-dashes anywhere).
Post-STT: if work_player/v2/timings/seg_NN.json exist, checks against the real
transcripts instead and prints the transcript neighbourhood for every miss.

Usage: python scripts/lessons/module0/check_cues.py "Courses/.../Module 1.2"
Exit 1 on any problem.
"""
from __future__ import annotations
import json, re, sys
from pathlib import Path

NUMBER_WORDS = {"two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen",
    "fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty",
    "seventy","eighty","ninety","hundred","thousand","million","billion","first","second","third","fourth","fifth",
    "sixth","seventh","eighth","ninth","tenth","percent"}
norm = lambda t: re.sub(r"[^a-z0-9]+", "", t.lower())

def main():
    d = Path(sys.argv[1]).resolve()
    spec = json.loads((d / "hybrid_spec.json").read_text())
    scripts = json.loads((d / "work_player" / "v2_scripts.json").read_text())
    tdir = d / "work_player" / "v2" / "timings"
    use_timings = tdir.exists() and any(tdir.glob("seg_*.json"))
    seqs, texts = {}, {}
    for sid, txt in scripts.items():
        tf = tdir / f"seg_{sid}.json"
        if use_timings and tf.exists():
            j = json.loads(tf.read_text()); seqs[sid] = [norm(w["w"]) for w in j["words"]]; texts[sid] = j["text"]
        else:
            spoken = re.sub(r"\[(ALEX INPUT NEEDED|VERIFY):[^\]]*\]", "", txt)   # markers are never spoken
            seqs[sid] = [norm(t) for t in spoken.split() if norm(t)]; texts[sid] = spoken
    problems, count, last = [], 0, {}
    def check(at, label):
        nonlocal count
        if not at: return
        count += 1
        if at["seg"] not in seqs: problems.append(f"{label}: seg {at['seg']} has no script"); return
        ph = [norm(t) for t in at["p"].split() if norm(t)]; seq = seqs[at["seg"]]
        hits = [i for i in range(len(seq) - len(ph) + 1) if seq[i:i+len(ph)] == ph]
        occ = at.get("o", 1)
        if len(hits) < occ:
            snippet = ""
            txt = texts[at["seg"]]
            for m in re.finditer(r"\S+", txt):
                if norm(m.group()).startswith(ph[0][:5]):
                    snippet = " … " + txt[max(0, m.start()-50):m.end()+70].replace("\n", " ") + " …"; break
            problems.append(f"{label}: '{at['p']}' NOT FOUND in seg {at['seg']}{snippet}")
        elif len(hits) > occ and occ == 1:
            problems.append(f"{label}: '{at['p']}' AMBIGUOUS in seg {at['seg']} ({len(hits)} hits; set \"o\")")
        else:
            pos = hits[occ-1]
            if at["seg"] in last and pos < last[at["seg"]]: problems.append(f"{label}: '{at['p']}' OUT OF ORDER in seg {at['seg']}")
            last[at["seg"]] = pos
        if not use_timings and any(w in NUMBER_WORDS or w.isdigit() for w in ph):
            problems.append(f"{label}: '{at['p']}' contains a number word (transcription flips these)")
    for i, s in enumerate(spec["slides"], 1):
        for key in ("title_at", "headline_at"): check(s.get(key), f"S{i} {key}")
        for grp in ("points", "rows", "cols", "steps", "items"):
            for j, it in enumerate(s.get(grp, []), 1): check(it.get("at"), f"S{i} {grp}[{j}]")
        for key in ("kicker", "footnote", "verdict", "upnext"):
            if s.get(key): check(s[key].get("at"), f"S{i} {key}")
        if s.get("seg") and s["seg"] not in scripts: problems.append(f"S{i}: seg {s['seg']} has no script")
    for name, blob in (("hybrid_spec.json", json.dumps(spec)), ("v2_scripts.json", json.dumps(scripts))):
        if re.search("[–—]", blob): problems.append(f"{name}: em/en-dash present")
    # production markers belong in the scripts (stripped before TTS), never in on-screen text
    leak = re.search(r"\[?(VERIFY|ALEX INPUT|SCREENSHOT)\b[^\"]{0,60}", json.dumps(spec, ensure_ascii=False))
    if leak: problems.append(f"hybrid_spec.json: production marker in on-screen text: {leak.group(0)!r}")
    # spec_to_hybrid.py artifacts: a parser label left on the front of on-screen text, and a
    # checklist title whose step count disagrees with the items under it
    label = re.compile(r"\s*(Lines?|Checklist|Points?|List|Heading|Bullets?|Steps|Footer line|Supporting text|Pull quote|Big stat|Caption|Card \d|Col \d)\s*:", re.I)
    def shown(node, key=""):
        if isinstance(node, dict):
            for k, v in node.items():
                if k not in ("at", "stock", "video", "layout", "seg", "note"): yield from shown(v, k)
        elif isinstance(node, list):
            for v in node: yield from shown(v, key)
        elif isinstance(node, str): yield re.sub(r"<[^>]+>", "", node)
    for i, s in enumerate(spec["slides"], 1):
        for t in shown(s):
            if label.match(t) or re.search(r"\b(Supporting text|Supporting|Footer line|Pull quote|Big stat|Attribution):", t): problems.append(f"S{i}: parser label on screen: {t[:50]!r}")
            elif re.search(r"\(\d*$", t.strip()) or t.count("(") != t.count(")"): problems.append(f"S{i}: on-screen text cut mid-sentence: {t[:60]!r}")
            elif re.match(r"\s*1\.\s.*\s2\.\s", t): problems.append(f"S{i}: a whole numbered list in one on-screen string: {t[:50]!r}")
        m = re.match(r"\s*(\d+)\s+steps?\b", re.sub(r"<[^>]+>", "", s.get("title_html", "")))
        if s.get("layout") == "checklist" and m and int(m.group(1)) != len(s.get("items", [])):
            problems.append(f"S{i}: title says {m.group(1)} steps, slide shows {len(s.get('items', []))}")
    mode ="timings" if use_timings else "scripts"
    print(f"{d.name}: {len(spec['slides'])} slides, {len(scripts)} segments, {count} cues checked against {mode}")
    blocked = [k for k, v in scripts.items() if "[ALEX INPUT" in v]
    if blocked: print("segments with ALEX INPUT slots:", blocked)
    if problems:
        print("PROBLEMS:"); [print("  " + p) for p in problems]; sys.exit(1)
    print("all cues resolve uniquely and in order")

if __name__ == "__main__":
    main()
