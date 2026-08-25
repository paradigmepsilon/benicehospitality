#!/usr/bin/env python3
"""
build.py — Hybrid avatar lesson builder (Module 0 pipeline).

A lesson is a list of segments in lesson_spec.json:
  avatar  -> Della's HeyGen avatar, lip-synced to ElevenLabs audio
  card    -> BNHG content card (HTML -> PNG) with VO and a slow push-in
  broll   -> Higgsfield still with VO and a slow pan (Ken Burns)

Stages (run in order; each is idempotent and skips finished work):
  tts        ElevenLabs TTS for every segment      -> work/seg_NN.mp3
  cards      Render card segments to PNG            -> work/card_NN.png
  manifest   Print what still needs HeyGen/Higgsfield (avatar mp4s, broll pngs)
  assemble   Build per-segment mp4s and concat      -> Lesson_0_N_<slug>.mp4

Usage:
  python scripts/lessons/module0/build.py "Courses/Room Rental Riches/Module 0.1" tts
  python scripts/lessons/module0/build.py "Courses/Room Rental Riches/Module 0.1" cards
  python scripts/lessons/module0/build.py "Courses/Room Rental Riches/Module 0.1" manifest
  python scripts/lessons/module0/build.py "Courses/Room Rental Riches/Module 0.1" assemble

External inputs the script expects you to drop in work/:
  avatar_NN.mp4   HeyGen render for each avatar segment (audio = work/seg_NN.mp3)
  broll_NN.png    Higgsfield image for each broll segment
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
VOICE_ID = "LLikB69fa1yJc7tSWzls"
AVATAR_ID = "68f8703101dc4936859e9162507396b1"  # HeyGen "Frontal Avatar" (photo avatar); render with Avatar IV, expressiveness low, no motion prompt
ELEVEN_MODEL = "eleven_v3"
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.7, "style": 0.0, "use_speaker_boost": True}  # eleven_v3: stability must be 0/0.5/1
W, H, FPS = 1920, 1080, 30
LETTER_MARK = ROOT / "Courses/Room Rental Riches/Module 1.3/BNHG_letter_mark.svg"

COLORS = {
    "primary": "#5b9a2f", "primary_dark": "#4a7d25", "secondary": "#f5a623",
    "tertiary": "#c0674a", "bg": "#f8f6f1", "ink": "#1a1a1a", "ink2": "#3d3d3d", "muted": "#807868",
}

STYLE_PROMPT = (
    "Editorial magazine photography, warm natural light (golden hour or soft window light), "
    "boutique hospitality aesthetic. Cream and terracotta neutrals, sage and olive accents, warm wood tones, "
    "considered minimalism. Style references: Cereal Magazine, Kinfolk, Magnolia Journal. Soft depth of field. "
    "16:9 cinematic crop. Photorealistic, natural skin texture, correct hands."
)


def env_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        for line in (ROOT / ".env.local").read_text().splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"')
    if not key:
        sys.exit("ELEVENLABS_API_KEY not found")
    return key


def load(lesson_dir: Path):
    spec = json.loads((lesson_dir / "lesson_spec.json").read_text())
    work = lesson_dir / "work"
    work.mkdir(exist_ok=True)
    return spec, work


def dash_check(spec):
    bad = [s["id"] for s in spec["segments"] if re.search("[–—]", s["vo"])]
    if bad:
        sys.exit(f"em/en-dash found in VO of segments {bad}")


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def duration(path: Path) -> float:
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]).stdout
    return float(out.strip())


# --------------------------------------------------------------------------- tts
def stage_tts(spec, work):
    key = env_key()
    for s in spec["segments"]:
        out = work / f"seg_{s['id']}.mp3"
        if out.exists():
            continue
        body = json.dumps({"text": s["vo"], "model_id": ELEVEN_MODEL, "voice_settings": VOICE_SETTINGS}).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
            data=body, method="POST",
            headers={"xi-api-key": key, "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            out.write_bytes(r.read())
        print(f"tts  {out.name}  {duration(out):.1f}s")


# ------------------------------------------------------------------------- cards
CARD_CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,500;1,600&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:{COLORS['bg']};color:{COLORS['ink']};font-family:'DM Sans',system-ui,sans-serif}}
.card{{position:relative;width:100%;height:100%;padding:110px 140px 100px 140px;display:flex;flex-direction:column;justify-content:center}}
.mark{{position:absolute;top:56px;right:64px;width:64px;height:64px;opacity:.9}} .mark svg{{width:100%;height:100%}}
.bar{{position:absolute;left:0;top:0;bottom:0;width:14px;background:{COLORS['primary']}}}
.eyebrow{{font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:{COLORS['muted']};margin-bottom:28px}}
h1{{font-family:'Playfair Display',serif;font-weight:600;font-size:64px;line-height:1.12;max-width:1480px;margin-bottom:44px}}
h1 em{{font-style:italic;color:{COLORS['primary_dark']}}}
ul{{list-style:none;display:grid;gap:22px;max-width:1500px}}
li{{display:grid;grid-template-columns:56px 1fr;align-items:start;font-size:31px;line-height:1.35;color:{COLORS['ink2']}}}
li .n{{font-family:'Playfair Display',serif;font-style:italic;font-size:34px;color:{COLORS['primary']};line-height:1.25}}
.solo h1{{font-size:76px;max-width:1560px;margin-bottom:0}}
table{{border-collapse:collapse;width:100%;font-size:30px}}
th,td{{text-align:left;padding:20px 26px;border-bottom:1px solid #d9d4c7}}
th{{font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:{COLORS['muted']};font-weight:400}}
td:first-child{{color:{COLORS['muted']};width:360px}}
td:last-child,th:last-child{{background:rgba(91,154,47,.10);color:{COLORS['primary_dark']};font-weight:600}}
.foot{{position:absolute;left:140px;bottom:54px;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:{COLORS['muted']}}}
"""


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def card_html(spec, s) -> str:
    mark = LETTER_MARK.read_text() if LETTER_MARK.exists() else ""
    body = []
    body.append(f'<div class="eyebrow">{esc(s.get("eyebrow", ""))}</div>')
    body.append(f'<h1>{esc(s["headline"])}</h1>')
    if s.get("table"):
        t = s["table"]
        rows = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in t["rows"])
        head = "".join(f"<th>{esc(h)}</th>" for h in t["headers"])
        body.append(f"<table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table>")
    elif s.get("bullets"):
        items = "".join(f'<li><span class="n">{i+1}.</span><span>{esc(b)}</span></li>' for i, b in enumerate(s["bullets"]))
        body.append(f"<ul>{items}</ul>")
    solo = "solo" if not s.get("bullets") and not s.get("table") else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CARD_CSS}</style></head>
<body><div class="card {solo}"><div class="bar"></div><div class="mark">{mark}</div>{''.join(body)}
<div class="foot">Room Rental Riches · Lesson {esc(spec['lesson'])} · {esc(spec['title'])}</div></div></body></html>"""


def stage_cards(spec, work):
    for s in spec["segments"]:
        if s["kind"] != "card":
            continue
        png = work / f"card_{s['id']}.png"
        if png.exists():
            continue
        html = work / f"card_{s['id']}.html"
        html.write_text(card_html(spec, s))
        run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=6000",
             f"--window-size={W},{H}", f"--screenshot={png}", f"file://{html.resolve()}"])
        print(f"card {png.name}")


# ---------------------------------------------------------------------- manifest
def stage_manifest(spec, work):
    print(f"\n== Lesson {spec['lesson']} · {spec['title']} ==")
    total = 0.0
    for s in spec["segments"]:
        mp3 = work / f"seg_{s['id']}.mp3"
        d = duration(mp3) if mp3.exists() else 0
        total += d
        need = ""
        if s["kind"] == "avatar" and not (work / f"avatar_{s['id']}.mp4").exists():
            need = f"NEED HeyGen render  <- audio {mp3.name}"
        if s["kind"] == "broll" and not (work / f"broll_{s['id']}.png").exists():
            need = f"NEED Higgsfield image  prompt: {s['image_prompt']} {STYLE_PROMPT}"
        print(f"{s['id']}  {s['kind']:6}  {d:5.1f}s  {need}")
    print(f"VO total {total/60:.1f} min")


# ---------------------------------------------------------------------- assemble
def still_to_video(img: Path, audio: Path, out: Path, motion: str):
    d = duration(audio) + 0.35
    frames = int(d * FPS)
    if motion == "push":   # slow push-in for cards
        zp = f"zoompan=z='min(1.0+0.00045*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS}"
    else:                  # slow lateral drift for b-roll
        zp = f"zoompan=z='1.10':x='(iw-iw/zoom)*on/{frames}':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS}"
    vf = f"scale={W*2}:-2,{zp},format=yuv420p"
    run(["ffmpeg", "-y", "-loop", "1", "-i", str(img), "-i", str(audio), "-vf", vf,
         "-t", f"{d:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-shortest", str(out)])


def normalize_avatar(src: Path, out: Path):
    run(["ffmpeg", "-y", "-i", str(src),
         "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0x{COLORS['bg'][1:]},fps={FPS},format=yuv420p",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", str(out)])


def stage_assemble(spec, work, lesson_dir: Path):
    parts = []
    for s in spec["segments"]:
        sid = s["id"]
        out = work / f"part_{sid}.mp4"
        audio = work / f"seg_{sid}.mp3"
        if not out.exists():
            if s["kind"] == "avatar":
                src = work / f"avatar_{sid}.mp4"
                if not src.exists():
                    sys.exit(f"missing {src}")
                normalize_avatar(src, out)
            elif s["kind"] == "card":
                still_to_video(work / f"card_{sid}.png", audio, out, "push")
            else:
                img = work / f"broll_{sid}.png"
                if not img.exists():
                    sys.exit(f"missing {img}")
                still_to_video(img, audio, out, "drift")
            print(f"part {out.name}  {duration(out):.1f}s")
        parts.append(out)
    lst = work / "concat.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
    slug = re.sub(r"[^A-Za-z0-9]+", "_", spec["title"]).strip("_")
    final = lesson_dir / f"Lesson_{spec['lesson'].replace('.', '_')}_{slug}.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(final)])
    print(f"\nFINAL {final.name}  {duration(final)/60:.2f} min")


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    lesson_dir = (ROOT / sys.argv[1]).resolve() if not sys.argv[1].startswith("/") else Path(sys.argv[1])
    stage = sys.argv[2]
    spec, work = load(lesson_dir)
    dash_check(spec)
    {"tts": lambda: stage_tts(spec, work),
     "cards": lambda: stage_cards(spec, work),
     "manifest": lambda: stage_manifest(spec, work),
     "assemble": lambda: stage_assemble(spec, work, lesson_dir)}[stage]()


if __name__ == "__main__":
    main()
