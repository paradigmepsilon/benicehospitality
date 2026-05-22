#!/usr/bin/env python3
"""
convert_audio.py — Convert HeyGen WAV files to MP3 for Bundle ingestion.

Used during the Module 2.1-2.5 migration: existing TTS WAVs in `raw_segments/audio/`
are converted to MP3s with the canonical `voiceover_NN.mp3` naming the Editorial
player expects.

Usage:
    python3 convert_audio.py <src_dir> <dest_dir>

The script:
1. Sorts input files (any order — the script handles slide_01_xxx.wav, block_2_xxx.wav, etc.)
2. Maps them to voiceover_01.mp3, voiceover_02.mp3, ... in numerical order based on filename
3. Encodes at 128k mono MP3 (Della's voice doesn't need stereo) at 48kHz

If you need a different mapping (e.g. block_1 maps to voiceover_03), pass a JSON mapping
file via --mapping:

    python3 convert_audio.py <src> <dest> --mapping mapping.json

mapping.json format:
    {"block_1_intro.wav": "voiceover_01.mp3", "block_2_template.wav": "voiceover_02.mp3"}
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def extract_sort_key(filename: str) -> int:
    """Extract the leading slide/block number from a filename for sorting."""
    m = re.search(r"(?:slide|block|voiceover)[\W_]+(\d+)", filename, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)", filename)
    return int(m.group(1)) if m else 9999


def convert_one(src: Path, dest: Path) -> dict:
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(src),
            "-c:a", "libmp3lame", "-b:a", "128k",
            "-ar", "48000", "-ac", "1",  # mono — Della voice doesn't need stereo
            str(dest),
        ],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {r.stderr[:200]}")
    return {
        "src": src.name,
        "dest": dest.name,
        "src_kb": src.stat().st_size // 1024,
        "dest_kb": dest.stat().st_size // 1024,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src", help="Source directory containing WAV files")
    p.add_argument("dest", help="Destination directory for MP3 outputs")
    p.add_argument("--mapping", help="Optional JSON file mapping source filenames to dest filenames")
    args = p.parse_args()

    src_dir = Path(args.src)
    dest_dir = Path(args.dest)

    if not src_dir.is_dir():
        print(f"Source not a directory: {src_dir}", file=sys.stderr)
        sys.exit(1)

    # Build the mapping
    if args.mapping:
        with open(args.mapping) as f:
            mapping = json.load(f)
        pairs = [(src_dir / src, dest_dir / dest) for src, dest in mapping.items()]
    else:
        # Default: number sequentially based on filename order
        wavs = sorted(src_dir.glob("*.wav"), key=lambda f: extract_sort_key(f.name))
        if not wavs:
            print(f"No WAVs in {src_dir}", file=sys.stderr)
            sys.exit(1)
        pairs = [
            (wav, dest_dir / f"voiceover_{i:02d}.mp3")
            for i, wav in enumerate(wavs, 1)
        ]

    for src, dest in pairs:
        if not src.exists():
            print(f"  SKIP (not found): {src}", file=sys.stderr)
            continue
        try:
            r = convert_one(src, dest)
            print(f"  {r['src']:40s} -> {r['dest']:24s} ({r['src_kb']}KB -> {r['dest_kb']}KB)")
        except Exception as e:
            print(f"  FAIL {src.name}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
