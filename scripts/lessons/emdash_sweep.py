#!/usr/bin/env python3
"""
emdash_sweep.py — Scan a directory for em-dashes and en-dashes.

The Della voice rule: never use \u2014 (em-dash) or \u2013 (en-dash) anywhere
in slide content, VO scripts, image references, or any user-facing text.

Usage:
    python3 emdash_sweep.py <directory>

Exits 0 if clean, 1 if any offenders found. Reports file path, line number,
and surrounding context for each.

Scans: .html, .md, .csv, .srt, .txt
Skips: .json (specs may legitimately contain em-dashes in description fields
that get rewritten before TTS — those get caught by build_lesson_html.py
output sweep)
"""
import sys
from pathlib import Path

EXTENSIONS = {".html", ".md", ".csv", ".srt", ".txt"}


def scan_file(path: Path):
    """Return list of (line_num, char, context) for em/en dashes."""
    try:
        text = path.read_text(errors="replace")
    except Exception:
        return []
    offenders = []
    for line_num, line in enumerate(text.split("\n"), 1):
        for i, ch in enumerate(line):
            if ch in ("\u2014", "\u2013"):
                ctx = line[max(0, i - 30): i + 30]
                offenders.append((line_num, ch, ctx))
    return offenders


def main():
    if len(sys.argv) < 2:
        print("Usage: emdash_sweep.py <directory>", file=sys.stderr)
        sys.exit(1)

    root = Path(sys.argv[1])
    if not root.is_dir():
        print(f"Not a directory: {root}", file=sys.stderr)
        sys.exit(1)

    files_scanned = 0
    total_offenders = 0
    for f in root.rglob("*"):
        if f.is_file() and f.suffix in EXTENSIONS:
            files_scanned += 1
            offs = scan_file(f)
            if offs:
                total_offenders += len(offs)
                print(f"\n{f}:")
                for line_num, ch, ctx in offs:
                    label = "EM-DASH" if ch == "\u2014" else "EN-DASH"
                    print(f"  line {line_num} {label}: ...{ctx}...")

    print(f"\nScanned {files_scanned} files.")
    if total_offenders:
        print(f"FAIL — {total_offenders} dashes found. Rewrite as periods + capitals or commas.")
        sys.exit(1)
    print("PASS — clean.")
    sys.exit(0)


if __name__ == "__main__":
    main()
