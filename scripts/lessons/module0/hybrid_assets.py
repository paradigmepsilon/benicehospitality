#!/usr/bin/env python3
"""
hybrid_assets.py — asset prep for the hybrid (avatar-intro + word-synced VO) player.

Stages:
  tts   ElevenLabs TTS for work_player/intro_script.txt -> work_player/intro.mp3
  stt   ElevenLabs scribe word timestamps for existing work/seg_NN.mp3 files
        -> work_player/timings/seg_NN.json  (words with start/end seconds)

Usage:
  python scripts/lessons/module0/hybrid_assets.py "Courses/.../Module 0.1" tts
  python scripts/lessons/module0/hybrid_assets.py "Courses/.../Module 0.1" stt 02 03 04 05 06 07 08
"""
from __future__ import annotations

import json
import sys
import urllib.request
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build import ELEVEN_MODEL, VOICE_ID, VOICE_SETTINGS, env_key  # noqa: E402


def tts(lesson_dir: Path):
    wp = lesson_dir / "work_player"
    out = wp / "intro.mp3"
    if out.exists():
        print(f"skip {out.name} (exists)")
        return
    text = (wp / "intro_script.txt").read_text().strip()
    body = json.dumps({"text": text, "model_id": ELEVEN_MODEL, "voice_settings": VOICE_SETTINGS}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
        data=body, method="POST",
        headers={"xi-api-key": env_key(), "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        out.write_bytes(r.read())
    print(f"tts {out.name} written")


def stt(lesson_dir: Path, seg_ids: list[str]):
    key = env_key()
    tdir = lesson_dir / "work_player" / "timings"
    tdir.mkdir(parents=True, exist_ok=True)
    for sid in seg_ids:
        mp3 = lesson_dir / "work" / f"seg_{sid}.mp3"
        out = tdir / f"seg_{sid}.json"
        if out.exists():
            print(f"skip {out.name} (exists)")
            continue
        boundary = uuid.uuid4().hex
        parts = []
        for name, val in (("model_id", "scribe_v1"), ("timestamps_granularity", "word")):
            parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{val}\r\n".encode())
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{mp3.name}\"\r\n"
            f"Content-Type: audio/mpeg\r\n\r\n".encode() + mp3.read_bytes() + b"\r\n")
        parts.append(f"--{boundary}--\r\n".encode())
        req = urllib.request.Request(
            "https://api.elevenlabs.io/v1/speech-to-text",
            data=b"".join(parts), method="POST",
            headers={"xi-api-key": key, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.loads(r.read())
        words = [
            {"w": w["text"], "s": round(w["start"], 3), "e": round(w["end"], 3)}
            for w in data.get("words", []) if w.get("type") == "word"
        ]
        out.write_text(json.dumps({"text": data.get("text", ""), "words": words}, indent=1))
        print(f"stt {out.name}  {len(words)} words")


def tts_batch(lesson_dir: Path, scripts_name: str, out_subdir: str):
    """TTS every segment in work_player/<scripts_name>.json -> work_player/<out_subdir>/seg_NN.mp3"""
    wp = lesson_dir / "work_player"
    scripts = json.loads((wp / f"{scripts_name}.json").read_text())
    out_dir = wp / out_subdir
    out_dir.mkdir(exist_ok=True)
    key = env_key()
    for sid, text in scripts.items():
        out = out_dir / f"seg_{sid}.mp3"
        if out.exists():
            print(f"skip {out.name} (exists)")
            continue
        body = json.dumps({"text": text, "model_id": ELEVEN_MODEL, "voice_settings": VOICE_SETTINGS}).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
            data=body, method="POST",
            headers={"xi-api-key": key, "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=180) as r:
            out.write_bytes(r.read())
        print(f"tts {out.name} written")


def stt_dir(lesson_dir: Path, mp3_subdir: str):
    """STT every seg_NN.mp3 under work_player/<mp3_subdir>/ -> <mp3_subdir>/timings/seg_NN.json"""
    key = env_key()
    src_dir = lesson_dir / "work_player" / mp3_subdir
    tdir = src_dir / "timings"
    tdir.mkdir(parents=True, exist_ok=True)
    for mp3 in sorted(src_dir.glob("seg_*.mp3")):
        out = tdir / f"{mp3.stem}.json"
        if out.exists():
            print(f"skip {out.name} (exists)")
            continue
        boundary = uuid.uuid4().hex
        parts = []
        for name, val in (("model_id", "scribe_v1"), ("timestamps_granularity", "word")):
            parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{val}\r\n".encode())
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{mp3.name}\"\r\n"
            f"Content-Type: audio/mpeg\r\n\r\n".encode() + mp3.read_bytes() + b"\r\n")
        parts.append(f"--{boundary}--\r\n".encode())
        req = urllib.request.Request(
            "https://api.elevenlabs.io/v1/speech-to-text",
            data=b"".join(parts), method="POST",
            headers={"xi-api-key": key, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.loads(r.read())
        words = [
            {"w": w["text"], "s": round(w["start"], 3), "e": round(w["end"], 3)}
            for w in data.get("words", []) if w.get("type") == "word"
        ]
        out.write_text(json.dumps({"text": data.get("text", ""), "words": words}, indent=1))
        print(f"stt {out.name}  {len(words)} words")


def main():
    lesson_dir = Path(sys.argv[1]).resolve()
    stage = sys.argv[2]
    if stage == "tts":
        tts(lesson_dir)
    elif stage == "stt":
        stt(lesson_dir, sys.argv[3:] or ["02", "03", "04", "05", "06", "07", "08"])
    elif stage == "tts-batch":
        tts_batch(lesson_dir, sys.argv[3], sys.argv[4])
    elif stage == "stt-dir":
        stt_dir(lesson_dir, sys.argv[3])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
