#!/usr/bin/env python3
"""patch_empty.py — replace slides whose item lists came out empty with a fresh translation of that
slide (spec_to_hybrid parsers), keeping every other slide (picks, repaired cues) untouched.
Usage: python scripts/lessons/module0/patch_empty.py "Courses/.../Module 3.3"  (then fix_cues + check_cues + rebuild)"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import spec_to_hybrid as T
d = Path(sys.argv[1]).resolve()
p = d / "hybrid_spec.json"; spec = json.loads(p.read_text())
fresh, _, _ = T.build_slides(T.parse_spec((d / "spec.md").read_text()))
fresh = T.drop_none_cues(fresh)
n = 0
for i, sl in enumerate(spec["slides"]):
    empty = any(k in sl and not sl[k] for k in ("items", "rows", "cols", "points")) or (sl["layout"] == "table" and not sl["table"]["rows"])
    if empty and i < len(fresh) and fresh[i].get("seg") == sl.get("seg"):
        spec["slides"][i] = fresh[i]; n += 1; print(f"  S{i+1}: replaced with fresh {fresh[i]['layout']}")
p.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n"); print(f"{d.name}: {n} slide(s) patched")
