#!/usr/bin/env python3
"""
record_scripts.py — derive the TTS-ready script file from v2_scripts.json.

Strips [ALEX INPUT NEEDED: ...] and [VERIFY: ...] markers (never spoken, never
fabricated) and writes work_player/v2_scripts_record.json. Segments that lost a
marker are listed so BUILD_STATUS can flag them for re-recording once filled.

Usage: python scripts/lessons/module0/record_scripts.py "Courses/.../Module 1.2"
"""
import json, re, sys
from pathlib import Path
wp = Path(sys.argv[1]).resolve() / "work_player"
src = json.loads((wp / "v2_scripts.json").read_text())
PLACEHOLDER = "From the BNA Fleet. Alex's own story for this lesson is coming in the next update."
rec = {k: re.sub(r"\s+", " ", re.sub(r"\[(ALEX INPUT NEEDED|VERIFY):[^\]]*\]", "", v)).strip() for k, v in src.items()}
rec = {k: (v if len(v.split()) >= 4 else PLACEHOLDER) for k, v in rec.items()}   # a slot-only segment still needs audio to advance
(wp / "v2_scripts_record.json").write_text(json.dumps(rec, indent=1, ensure_ascii=False))
print("record scripts written; markers stripped in:", [k for k in src if src[k] != rec[k]])
