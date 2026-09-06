#!/usr/bin/env python3
"""
fix_cues.py — repair cue phrases that the STT transcript did not reproduce.

After hybrid_assets.py stt-dir, run this on a lesson. For every "at" cue whose
phrase is not found exactly once in the segment transcript, it locates where the
phrase sits in the written script, maps that position onto the transcript, and
picks a new 3 to 4 word window from the transcript near that point that is
unique, in narration order, and free of number words. Writes hybrid_spec.json
in place and prints every change. Run check_cues.py afterwards.

Usage: python scripts/lessons/module0/fix_cues.py "Courses/.../Module 2.1"
"""
from __future__ import annotations
import json, re, sys
from pathlib import Path

NUMBER_WORDS = {"two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen",
    "fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty",
    "seventy","eighty","ninety","hundred","thousand","million","billion","first","second","third","fourth",
    "fifth","sixth","seventh","eighth","ninth","tenth","percent","half","quarter"}
norm = lambda t: re.sub(r"[^a-z0-9]+", "", t.lower())


def find(seq, ph):
    n = len(ph)
    return [i for i in range(len(seq) - n + 1) if seq[i:i + n] == ph]


def main():
    d = Path(sys.argv[1]).resolve()
    spec_p = d / "hybrid_spec.json"; spec = json.loads(spec_p.read_text())
    scripts = json.loads((d / "work_player" / "v2_scripts.json").read_text())
    tdir = d / "work_player" / "v2" / "timings"
    T = {}
    for sid in scripts:
        f = tdir / f"seg_{sid}.json"
        if f.exists():
            j = json.loads(f.read_text())
            T[sid] = {"raw": [w["w"] for w in j["words"]], "tok": [norm(w["w"]) for w in j["words"]]}
    S = {sid: [norm(w) for w in re.sub(r"\[(ALEX INPUT NEEDED|VERIFY):[^\]]*\]", "", txt).split() if norm(w)] for sid, txt in scripts.items()}
    last = {}
    changes = 0

    def clean(tok, raw):
        return tok.isalpha() and tok not in NUMBER_WORDS and "-" not in raw and len(tok) >= 2

    def repair(at, label):
        nonlocal changes
        if not at or at["seg"] not in T: return
        sid = at["seg"]; tt = T[sid]["tok"]; tr = T[sid]["raw"]
        ph = [norm(x) for x in at["p"].split() if norm(x)]
        hits = find(tt, ph)
        floor = last.get(sid, 0)
        if len(hits) == 1 and hits[0] >= floor:
            last[sid] = hits[0]; return
        # estimate where this cue should land in the transcript
        s_hits = find(S[sid], ph)
        if s_hits:
            est = int(s_hits[0] * len(tt) / max(1, len(S[sid])))
        elif len(hits) > 1:
            est = next((h for h in hits if h >= floor), hits[0])
        else:
            est = floor
        start = max(floor, est - 12); end = min(len(tt), est + 25)
        for size in (3, 4, 2):
            for i in range(start, max(start, end - size + 1)):
                cand = tt[i:i + size]; raw = tr[i:i + size]
                if all(clean(t, r) for t, r in zip(cand, raw)) and len(find(tt, cand)) == 1:
                    newp = " ".join(re.sub(r"[^A-Za-z']", "", r) for r in raw)
                    print(f"  {label}: '{at['p']}' -> '{newp}'")
                    at["p"] = newp; last[sid] = i; changes += 1
                    return
        print(f"  {label}: '{at['p']}' UNRESOLVED (seg {sid})")

    for i, s in enumerate(spec["slides"], 1):
        for key in ("title_at", "headline_at"): repair(s.get(key), f"S{i} {key}")
        for grp in ("points", "rows", "cols", "steps", "items"):
            for j, it in enumerate(s.get(grp, []), 1): repair(it.get("at"), f"S{i} {grp}[{j}]")
        for key in ("kicker", "footnote", "verdict", "upnext"):
            if s.get(key): repair(s[key].get("at"), f"S{i} {key}")
    spec_p.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
    print(f"{d.name}: {changes} cue(s) repaired")


if __name__ == "__main__":
    main()
