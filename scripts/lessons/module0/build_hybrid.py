#!/usr/bin/env python3
"""
build_hybrid.py — Lesson 0.1 hybrid player builder (v2).

Format: short HeyGen avatar intro (slide 1, video with its own audio), then
natural-speech ElevenLabs VO driving polished presentation slides. Slide
elements reveal on data-reveal-at cues computed from STT word timestamps;
inside a data-focus-group the element being narrated holds full ink while
already-spoken siblings dim (the "read along with Della" mechanic).
B-roll slides play a single 10s video once, then a slow CSS push-in takes
over. No loops.

Inputs (Module 0.1 dir):
  work_player/v2/seg_02..08.mp3            natural-speech VO
  work_player/v2/timings/seg_NN.json       word timestamps
  work_player/v2/intro_avatar.mp4          HeyGen render (new avatar)
  work_player/v2/broll_02.mp4, broll_06.mp4  10s single-take clips

Output:
  Lesson_0_1_Hybrid_Bundle/Lesson_0_1_Hybrid_v2.html (+ audio/ video/ SVGs)

Usage:
  python scripts/lessons/module0/build_hybrid.py "Courses/.../Module 0.1"
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TEMPLATE = ROOT / "scripts/lessons/templates/lesson_player.html"
SVG_DIR = ROOT / "Courses/Room Rental Riches/Module 1.3"

TIMINGS: dict[str, list[dict]] = {}


def norm(tok: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", tok.lower())


def cue(seg: str, phrase: str, occurrence: int = 1, lead: float = 0.2) -> str:
    words = TIMINGS[seg]
    ph = [norm(t) for t in phrase.split() if norm(t)]
    seq = [norm(w["w"]) for w in words]
    hits = 0
    for i in range(len(seq) - len(ph) + 1):
        if seq[i:i + len(ph)] == ph:
            hits += 1
            if hits == occurrence:
                return f"{max(0.0, words[i]['s'] - lead):.2f}"
    sys.exit(f"cue not found: seg {seg} phrase {phrase!r} (occurrence {occurrence})")


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True).stdout
    return float(out.strip())


EXTRA_CSS = """
/* ============================================================
   HYBRID V2 · editorial presentation language
   Locked BNHG tokens; layout carries the premium feel.
   ============================================================ */

/* ---- intro video slide ---- */
.slide-video-intro { background: var(--bnhg-bg); }
.slide-video-intro video.slide-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: var(--bnhg-ink-primary); }
.slide-video-intro .full-lockup { position: absolute; top: 32px; left: 36px; height: 34px; width: auto; opacity: 0.92; z-index: 3; }
.slide-video-intro .intro-overlay { position: absolute; left: 4.5vw; bottom: 8vh; z-index: 3; max-width: 46%; background: rgba(14, 14, 12, 0.52); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); padding: 26px 32px 28px; border-left: 2px solid var(--bnhg-secondary); }
.slide-video-intro .intro-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--bnhg-secondary); }
.slide-video-intro .intro-title { font-family: var(--font-display); font-weight: 400; font-size: clamp(24px, 3vw, 42px); line-height: 1.1; color: #fff; margin-top: 12px; letter-spacing: -0.01em; }

/* ---- split b-roll slides: video panel + content panel, no overlay ---- */
.slide-video-split { display: grid; grid-template-columns: 1.1fr 1fr; height: 100%; background: var(--bnhg-bg); }
.slide-video-split.reverse { grid-template-columns: 1fr 1.1fr; }
.slide-video-split.reverse .split-media { order: 2; }
.slide-video-split.reverse .split-content { order: 1; }
.split-media { position: relative; overflow: hidden; background: #101010; }
.split-media video.bg-loop { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: var(--bnhg-photo-filter); transform: scale(1); }
.split-media video.bg-loop.bg-ended { animation: bg-push 26s linear forwards; }
@keyframes bg-push { from { transform: scale(1); } to { transform: scale(1.08); } }
.split-content { position: relative; padding: 7vh 3.6vw 6vh; display: flex; flex-direction: column; justify-content: center; }
.split-content .eyebrow { margin-bottom: 2.4vh; }
.split-content h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(26px, 3.1vw, 44px); line-height: 1.1; color: var(--bnhg-ink-primary); letter-spacing: -0.015em; margin-bottom: 3.4vh; }
.split-content h2 em { color: var(--bnhg-primary); font-style: italic; }
.split-points { border-top: 1px solid var(--bnhg-hairline); }
.s-point { padding: 2.2vh 0 2.2vh 1.4vw; border-bottom: 1px solid var(--bnhg-hairline); border-left: 3px solid transparent; transition: border-color 0.5s var(--anim-ease), background 0.5s var(--anim-ease); }
.s-point .point-tag { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--bnhg-primary); }
.s-point .point-text { font-family: var(--font-body); font-weight: 500; font-size: clamp(15px, 1.5vw, 20px); line-height: 1.4; color: var(--bnhg-ink-primary); margin-top: 6px; }
.s-point.active { border-left-color: var(--bnhg-primary); background: var(--bnhg-primary-soft); }

/* ---- mission statement ---- */
.slide-mission { padding: 0 6.5vw; display: flex; flex-direction: column; justify-content: center; height: 100%; }
.slide-mission .eyebrow { margin-bottom: 3.4vh; }
.slide-mission h1 { font-family: var(--font-display); font-weight: 400; font-size: clamp(34px, 4.6vw, 66px); line-height: 1.14; color: var(--bnhg-ink-primary); letter-spacing: -0.018em; max-width: 86%; }
.slide-mission h1 em { font-style: italic; color: var(--bnhg-primary-dark); }
.slide-mission .mission-kicker { margin-top: 5vh; padding-top: 2.6vh; border-top: 1px solid var(--bnhg-hairline); font-family: var(--font-display); font-style: italic; font-size: clamp(15px, 1.7vw, 21px); color: var(--bnhg-ink-muted); max-width: 60%; }

/* ---- editorial row list (audience) ---- */
.slide-rows { padding: 6.5vh 6.5vw 5vh; display: flex; flex-direction: column; height: 100%; }
.slide-rows .header { margin-bottom: 3.6vh; }
.slide-rows .header .eyebrow { margin-bottom: 14px; }
.slide-rows .header h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(28px, 3.6vw, 50px); line-height: 1.08; color: var(--bnhg-ink-primary); letter-spacing: -0.015em; }
.slide-rows .header h2 em { color: var(--bnhg-primary); font-style: italic; }
.row-list { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; }
.row-item { display: grid; grid-template-columns: 1.05fr 1fr; align-items: baseline; gap: 3vw; padding: 2.1vh 0 2.1vh 1.6vw; border-bottom: 1px solid var(--bnhg-hairline); border-left: 3px solid transparent; transition: border-color 0.5s var(--anim-ease), background 0.5s var(--anim-ease); }
.row-item:first-child { border-top: 1px solid var(--bnhg-hairline); }
.row-item .row-title { font-family: var(--font-body); font-weight: 600; font-size: clamp(17px, 1.9vw, 25px); color: var(--bnhg-ink-primary); letter-spacing: -0.01em; }
.row-item .row-desc { font-family: var(--font-display); font-style: italic; font-size: clamp(14px, 1.5vw, 19px); color: var(--bnhg-ink-muted); line-height: 1.35; }
.row-item.active { border-left-color: var(--bnhg-primary); background: var(--bnhg-primary-soft); }
.row-item.active .row-desc { color: var(--bnhg-ink-secondary); }
.rows-footnote { margin-top: 3vh; font-family: var(--font-display); font-style: italic; font-size: clamp(13px, 1.5vw, 19px); color: var(--bnhg-tertiary); }

/* ---- pillar columns ---- */
.slide-pillars { padding: 6.5vh 6.5vw; display: flex; flex-direction: column; height: 100%; }
.slide-pillars .header { margin-bottom: 4.5vh; }
.slide-pillars .header .eyebrow { margin-bottom: 14px; }
.slide-pillars .header h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(28px, 3.6vw, 50px); line-height: 1.08; color: var(--bnhg-ink-primary); letter-spacing: -0.015em; }
.slide-pillars .header h2 em { color: var(--bnhg-primary); font-style: italic; }
.pillar-row { display: grid; grid-template-columns: repeat(3, 1fr); flex: 1; min-height: 0; align-content: start; border-top: 1px solid var(--bnhg-hairline); }
.pillar { padding: 3.4vh 2.4vw 0 0; border-left: 3px solid transparent; transition: border-color 0.5s var(--anim-ease); }
.pillar + .pillar { padding-left: 2.4vw; border-left: 1px solid var(--bnhg-hairline); }
.pillar .pillar-tag { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--bnhg-primary); }
.pillar .pillar-heading { font-family: var(--font-display); font-weight: 400; font-size: clamp(20px, 2.3vw, 31px); color: var(--bnhg-ink-primary); margin-top: 1.6vh; line-height: 1.16; letter-spacing: -0.008em; }
.pillar .pillar-body { font-family: var(--font-body); font-size: clamp(13px, 1.35vw, 17px); line-height: 1.6; color: var(--bnhg-ink-secondary); margin-top: 1.6vh; max-width: 94%; }
.pillar.active .pillar-tag { color: var(--bnhg-primary-dark); }

/* ---- roadmap steps ---- */
.slide-steps { padding: 6vh 6.5vw 5vh; display: flex; flex-direction: column; height: 100%; }
.slide-steps .header { margin-bottom: 3vh; }
.slide-steps .header .eyebrow { margin-bottom: 12px; }
.slide-steps .header h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(26px, 3.4vw, 46px); line-height: 1.08; color: var(--bnhg-ink-primary); letter-spacing: -0.015em; }
.slide-steps .header h2 em { color: var(--bnhg-primary); font-style: italic; }
.step-list { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; }
.step { display: grid; grid-template-columns: 5vw 15vw 1fr; align-items: baseline; gap: 2vw; padding: 1.45vh 0; border-bottom: 1px solid var(--bnhg-hairline); }
.step:first-child { border-top: 1px solid var(--bnhg-hairline); }
.step .step-num { font-family: var(--font-mono); font-weight: 400; font-size: clamp(18px, 2vw, 27px); color: var(--bnhg-ink-muted); font-variant-numeric: tabular-nums; transition: color 0.5s var(--anim-ease); }
.step .step-name { font-family: var(--font-display); font-weight: 400; font-size: clamp(18px, 2vw, 27px); color: var(--bnhg-ink-primary); letter-spacing: -0.008em; }
.step .step-desc { font-family: var(--font-body); font-size: clamp(13px, 1.3vw, 16px); line-height: 1.5; color: var(--bnhg-ink-secondary); }
.step.active .step-num { color: var(--bnhg-primary); }
.step.bonus .step-num { color: var(--bnhg-secondary); }
.step.bonus.active .step-num { color: var(--bnhg-secondary); }

/* ---- closing checklist ---- */
.slide-close { padding: 6.5vh 6.5vw 5.5vh; display: flex; flex-direction: column; height: 100%; }
.slide-close .header { margin-bottom: 4vh; }
.slide-close .header .eyebrow { margin-bottom: 14px; }
.slide-close .header h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(28px, 3.6vw, 50px); line-height: 1.08; color: var(--bnhg-ink-primary); letter-spacing: -0.015em; }
.slide-close .header h2 em { color: var(--bnhg-primary); font-style: italic; }
.check-list { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; gap: 2.6vh; max-width: 78%; }
.check-item { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 22px; }
.check-item .check-mark { width: 34px; height: 34px; }
.check-item .check-mark circle { stroke: var(--bnhg-hairline); stroke-width: 1.5; fill: none; }
.check-item .check-mark path { stroke: var(--bnhg-primary); stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 30; stroke-dashoffset: 30; transition: stroke-dashoffset 0.6s var(--anim-ease) 0.15s; }
.check-item.revealed .check-mark path { stroke-dashoffset: 0; }
.check-item .check-text { font-family: var(--font-body); font-weight: 500; font-size: clamp(16px, 1.8vw, 23px); color: var(--bnhg-ink-primary); line-height: 1.4; letter-spacing: -0.005em; }
.up-next-band { margin-top: 3.6vh; padding-top: 2.8vh; border-top: 1px solid var(--bnhg-hairline); display: flex; align-items: baseline; gap: 20px; }
.up-next-band .up-next-tag { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--bnhg-secondary); white-space: nowrap; }
.up-next-band .up-next-title { font-family: var(--font-display); font-style: italic; font-size: clamp(15px, 1.7vw, 21px); color: var(--bnhg-ink-primary); }

/* ---- narration focus: spoken item holds ink, spoken-past items dim ---- */
[data-focus-group] > [data-reveal-at].revealed { transition: opacity 0.7s var(--anim-ease), transform 0.7s var(--anim-ease); }
.slide.active [data-focus-group] > [data-reveal-at].revealed:not(.active) { opacity: 0.42; }
.slide.active [data-focus-group] > [data-reveal-at].revealed.active { opacity: 1; }

/* entrance defaults for v2 elements that are not cue-driven */
.slide .intro-overlay, .slide .overlay-title, .slide .overlay-eyebrow,
.slide .mission-kicker, .slide .rows-footnote, .slide .up-next-band { opacity: 0; transform: translateY(var(--reveal-distance)); }
.slide.active .overlay-eyebrow { animation: reveal-up var(--reveal-duration) 0.2s var(--anim-ease) forwards; }
.slide.active .overlay-title:not([data-reveal-at]) { animation: reveal-up var(--reveal-duration) 0.45s var(--anim-ease) forwards; }
.slide.skip-reveal .overlay-eyebrow, .slide.skip-reveal .overlay-title:not([data-reveal-at]) { animation: none !important; opacity: 1 !important; transform: none !important; }
"""


def check_svg() -> str:
    return ('<svg class="check-mark" viewBox="0 0 34 34" aria-hidden="true">'
            '<circle cx="17" cy="17" r="15.5"></circle>'
            '<path d="M10.5 17.5 L15 22 L24 12.5"></path></svg>')


def slides_html(c) -> str:
    lockup = '<img class="full-lockup" src="BNHG_full_lockup.svg" alt="Be Nice Hospitality Group">'

    def mark(invert=False):
        return f'<img class="corner-mark{" invert" if invert else ""}" src="BNHG_letter_mark.svg" alt="">'

    def num(n, invert=False):
        return f'<span class="slide-number{" invert" if invert else ""}">0{n} <span class="total">/ 08</span></span>'

    return f"""
<!-- SLIDE 1 · AVATAR INTRO (video owns audio) -->
<section class="slide slide-video-intro active" data-layout="video-intro">
  <video class="slide-media" src="video/intro_avatar.mp4" preload="auto" playsinline></video>
  {lockup}
  <div class="intro-overlay" data-reveal-at="0.40">
    <div class="intro-eyebrow">Module 0 · Lesson 1</div>
    <h1 class="intro-title">Who We Are and What We Do</h1>
  </div>
  {num(1)}
</section>

<!-- SLIDE 2 · B-ROLL SPLIT · what co-living is -->
<section class="slide slide-video-split" data-layout="video-split" data-audio="audio/voiceover_02.mp3">
  <div class="split-media"><video class="bg-loop" src="video/broll_02.mp4" muted playsinline preload="auto" style="object-position: 70% center"></video></div>
  {mark()}
  <div class="split-content">
    <div class="eyebrow">Hear this first</div>
    <h2 data-reveal-at="{c['s2_title']}">Not a trick. <em>Not a trend.</em></h2>
    <div class="split-points" data-focus-group>
      <div class="s-point" data-reveal-at="{c['s2_p1']}"><div class="point-tag">Income</div><div class="point-text">Beats a single lease</div></div>
      <div class="s-point" data-reveal-at="{c['s2_p2']}"><div class="point-tag">Time</div><div class="point-text">Less of your week than a short-term rental</div></div>
      <div class="s-point" data-reveal-at="{c['s2_p3']}"><div class="point-tag">People</div><div class="point-text">A soft place to land for good tenants</div></div>
    </div>
  </div>
  {num(2, True)}
</section>

<!-- SLIDE 3 · MISSION -->
<section class="slide slide-mission" data-layout="mission" data-audio="audio/voiceover_03.mp3">
  {mark()}
  <div class="eyebrow">Our mission</div>
  <h1 class="reveal-words" data-reveal-at="{c['s3_head']}">Turn <em>underutilized space</em> into income-generating, community-building co-living homes.</h1>
  <p class="mission-kicker" data-reveal-at="{c['s3_kick']}">Every lesson in this course serves that sentence.</p>
  {num(3)}
</section>

<!-- SLIDE 4 · WHO IT'S FOR -->
<section class="slide slide-rows" data-layout="rows" data-audio="audio/voiceover_04.mp3">
  {mark()}
  <div class="header">
    <div class="eyebrow">The audience</div>
    <h2>Built for people with <em>room to spare</em></h2>
  </div>
  <div class="row-list" data-focus-group>
    <div class="row-item" data-reveal-at="{c['s4_r1']}"><div class="row-title">Aspiring entrepreneurs</div><div class="row-desc">A real business, not a weekend side hustle</div></div>
    <div class="row-item" data-reveal-at="{c['s4_r2']}"><div class="row-title">Working professionals</div><div class="row-desc">A spare bedroom, put to work</div></div>
    <div class="row-item" data-reveal-at="{c['s4_r3']}"><div class="row-title">Homeowners</div><div class="row-desc">More house than the household needs</div></div>
    <div class="row-item" data-reveal-at="{c['s4_r4']}"><div class="row-title">Investors</div><div class="row-desc">Done with thin long-lease margins</div></div>
  </div>
  <div class="rows-footnote" data-reveal-at="{c['s4_foot']}">No get-rich-quick pitch here. One property, done right. Then we build.</div>
  {num(4)}
</section>

<!-- SLIDE 5 · THREE PILLARS -->
<section class="slide slide-pillars" data-layout="pillars" data-audio="audio/voiceover_05.mp3">
  {mark()}
  <div class="header">
    <div class="eyebrow">The three Be Nice pillars</div>
    <h2>How we run <em>every home</em></h2>
  </div>
  <div class="pillar-row" data-focus-group>
    <div class="pillar" data-reveal-at="{c['s5_c1']}"><div class="pillar-tag">Cash flow</div><div class="pillar-heading">Steady, secure income</div><div class="pillar-body">Rooms priced right, rented to the right people, paid on time.</div></div>
    <div class="pillar" data-reveal-at="{c['s5_c2']}"><div class="pillar-tag">Experience</div><div class="pillar-heading">Guests who feel taken care of</div><div class="pillar-body">Clean, furnished, thoughtful. People stay longer and refer their friends.</div></div>
    <div class="pillar" data-reveal-at="{c['s5_c3']}"><div class="pillar-tag">Efficiency</div><div class="pillar-heading">Systems, not heroics</div><div class="pillar-body">Ten to fifteen hours a month. Not forty.</div></div>
  </div>
  {num(5)}
</section>

<!-- SLIDE 6 · B-ROLL SPLIT · our specialty -->
<section class="slide slide-video-split reverse" data-layout="video-split" data-audio="audio/voiceover_06.mp3">
  <div class="split-media"><video class="bg-loop" src="video/broll_06.mp4" muted playsinline preload="auto" style="object-position: 40% center"></video></div>
  {mark(True)}
  <div class="split-content">
    <div class="eyebrow">Our specialty</div>
    <h2>Three things, done <em>well</em></h2>
    <div class="split-points" data-focus-group>
      <div class="s-point" data-reveal-at="{c['s6_p1']}"><div class="point-tag">Setup</div><div class="point-text">Rent-ready in weeks, not months</div></div>
      <div class="s-point" data-reveal-at="{c['s6_p2']}"><div class="point-tag">Self-management</div><div class="point-text">No ten percent property manager</div></div>
      <div class="s-point" data-reveal-at="{c['s6_p3']}"><div class="point-tag">Loyalty</div><div class="point-text">A rebooking tenant beats any ad</div></div>
    </div>
  </div>
  {num(6)}
</section>

<!-- SLIDE 7 · ROADMAP -->
<section class="slide slide-steps" data-layout="steps" data-audio="audio/voiceover_07.mp3">
  {mark()}
  <div class="header">
    <div class="eyebrow">The Be Nice Way</div>
    <h2>Five phases. <em>One roadmap.</em></h2>
  </div>
  <div class="step-list" data-focus-group>
    <div class="step" data-reveal-at="{c['s7_p1']}"><div class="step-num">01</div><div class="step-name">Research</div><div class="step-desc">Your tenant, your property, your local rules.</div></div>
    <div class="step" data-reveal-at="{c['s7_p2']}"><div class="step-num">02</div><div class="step-name">Planning</div><div class="step-desc">Costs, pricing, budget, entity, insurance.</div></div>
    <div class="step" data-reveal-at="{c['s7_p3']}"><div class="step-num">03</div><div class="step-name">Setup</div><div class="step-desc">Design, furnish, stage, and wire the house.</div></div>
    <div class="step" data-reveal-at="{c['s7_p4']}"><div class="step-num">04</div><div class="step-name">Operations</div><div class="step-desc">Listings, screening, rent, cleaning.</div></div>
    <div class="step" data-reveal-at="{c['s7_p5']}"><div class="step-num">05</div><div class="step-name">Marketing</div><div class="step-desc">Brand, social, and turning inquiries into tenants.</div></div>
    <div class="step bonus" data-reveal-at="{c['s7_bonus']}"><div class="step-num">+</div><div class="step-name">Bonus</div><div class="step-desc">Upsells, community, and property number two.</div></div>
  </div>
  {num(7)}
</section>

<!-- SLIDE 8 · CLOSE -->
<section class="slide slide-close" data-layout="close" data-audio="audio/voiceover_08.mp3">
  {mark()}
  <div class="header">
    <div class="eyebrow">By the end</div>
    <h2>What you'll <em>walk away with</em></h2>
  </div>
  <div class="check-list" data-focus-group>
    <div class="check-item" data-reveal-at="{c['s8_o1']}">{check_svg()}<div class="check-text">Find a property and a tenant that fit each other.</div></div>
    <div class="check-item" data-reveal-at="{c['s8_o2']}">{check_svg()}<div class="check-text">Design a room people want, without hiring a designer.</div></div>
    <div class="check-item" data-reveal-at="{c['s8_o3']}">{check_svg()}<div class="check-text">Run several tenants under one roof, calmly.</div></div>
    <div class="check-item" data-reveal-at="{c['s8_o4']}">{check_svg()}<div class="check-text">Build an experience that brings good people back.</div></div>
  </div>
  <div class="up-next-band" data-reveal-at="{c['s8_next']}">
    <span class="up-next-tag">Up next · Lesson 0.2</span>
    <span class="up-next-title">The three rental models, side by side, with real numbers.</span>
  </div>
  {num(8)}
</section>
"""


PLAYER_JS = r"""
const LESSON_CONFIG = {{LESSON_CONFIG_JSON}};

const state = {
  currentSlide: 0,
  isPlaying: false,
  speed: 1,
  captionsEnabled: true,
  audioReady: false,
  slidePositions: new Map(),
  completedSlides: new Set(),
  pendingAdvance: null,
  loadedSrc: null,
  debugMode: false
};

const slides = document.querySelectorAll('.slide');
const audio = document.getElementById('audio');
const timelineProgress = document.getElementById('timeline-progress');
const timelineHandle = document.getElementById('timeline-handle');
const timelineEl = document.getElementById('timeline');
const timeDisplay = document.getElementById('time-display');
const slideIndicator = document.getElementById('slide-indicator');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const captionsEl = document.getElementById('captions');
const captionsBtn = document.getElementById('btn-captions');
const cuePanel = document.getElementById('cue-panel');
const cueBtn = document.getElementById('btn-cue');
const cueListEl = document.getElementById('cue-list');
const overviewEl = document.getElementById('overview');
const overviewGridEl = document.getElementById('overview-grid');
const speedMenu = document.getElementById('speed-menu');
const speedLabel = document.getElementById('speed-label');
const noticeEl = document.getElementById('notice');

/* ============================================================
   MEDIA LAYER · a slide's media is either its own <video
   class="slide-media"> (avatar intro) or the shared <audio> fed
   from data-audio. B-roll slides carry a muted <video class="bg-loop">
   that plays ONCE alongside the VO; when it ends, a slow CSS
   push-in (.bg-ended) keeps the frame alive. No loops.
   ============================================================ */
function mediaFor(idx) { return slides[idx]?.querySelector('video.slide-media') || audio; }
function currentMedia() { return mediaFor(state.currentSlide); }
function getSlideAudioSrc(idx) { return slides[idx]?.dataset.audio || null; }
function mediaLabel(idx) {
  const v = slides[idx]?.querySelector('video.slide-media');
  return (v ? v.getAttribute('src') : getSlideAudioSrc(idx)) || '...';
}

function syncBgVideos() {
  slides.forEach((s, i) => {
    const v = s.querySelector('video.bg-loop');
    if (!v) return;
    if (i === state.currentSlide && state.isPlaying && !v.ended) { const p = v.play(); if (p) p.catch(() => {}); }
    else v.pause();
  });
}

/* Slow the b-roll so one clip spans the whole narration: rate =
   clipDuration / voDuration (clamped), scaled by the lesson speed.
   The clip then runs edge-to-edge with no pause and no loop. */
function bgBaseRate(idx) {
  const v = slides[idx]?.querySelector('video.bg-loop');
  const m = mediaFor(idx);
  if (!v || !isFinite(v.duration) || !v.duration || !isFinite(m.duration) || !m.duration) return null;
  return Math.min(1, Math.max(0.3, (v.duration - 0.2) / m.duration));
}

function applyBgRate(idx) {
  const v = slides[idx]?.querySelector('video.bg-loop');
  const base = bgBaseRate(idx);
  if (!v || base === null) return;
  v.playbackRate = base * state.speed;
}

function resetBgVideo(idx) {
  const v = slides[idx]?.querySelector('video.bg-loop');
  if (!v) return;
  try { v.currentTime = 0; } catch (e) { /* ignore */ }
  v.classList.remove('bg-ended');
  applyBgRate(idx);
}

function seekBgVideo(idx, voTime) {
  const v = slides[idx]?.querySelector('video.bg-loop');
  const base = bgBaseRate(idx);
  if (!v || base === null) return;
  const t = Math.min(v.duration - 0.05, voTime * base);
  try { v.currentTime = Math.max(0, t); } catch (e) { /* ignore */ }
  v.classList.toggle('bg-ended', t >= v.duration - 0.1);
  applyBgRate(idx);
}

document.querySelectorAll('video.bg-loop').forEach(v => {
  v.addEventListener('ended', () => v.classList.add('bg-ended'));
  v.addEventListener('loadedmetadata', () => applyBgRate(state.currentSlide));
});

function loadSlideMedia(idx, opts = {}) {
  if (state.pendingAdvance) { clearTimeout(state.pendingAdvance); state.pendingAdvance = null; }
  const media = mediaFor(idx);

  if (media !== audio) {
    if (media.readyState >= 1) {
      state.audioReady = true;
      applyResumeAndPlay(idx, opts);
    } else {
      state.audioReady = false;
      const onReady = () => {
        media.removeEventListener('loadedmetadata', onReady);
        media.removeEventListener('canplay', onReady);
        state.audioReady = true;
        hideNotice();
        applyResumeAndPlay(idx, opts);
      };
      media.addEventListener('loadedmetadata', onReady);
      media.addEventListener('canplay', onReady);
      if (media.load) media.load();
    }
    return;
  }

  const src = getSlideAudioSrc(idx);
  if (!src) { showNotice('No audio for this slide'); return; }
  if (state.loadedSrc === src && state.audioReady) { applyResumeAndPlay(idx, opts); return; }

  state.loadedSrc = src;
  state.audioReady = false;
  audio.pause();
  audio.src = src;
  audio.load();

  let ready = false;
  const onReady = () => {
    if (ready) return;
    ready = true;
    audio.removeEventListener('loadedmetadata', onReady);
    audio.removeEventListener('canplay', onReady);
    audio.removeEventListener('loadeddata', onReady);
    state.audioReady = true;
    hideNotice();
    applyResumeAndPlay(idx, opts);
  };
  audio.addEventListener('loadedmetadata', onReady);
  audio.addEventListener('canplay', onReady);
  audio.addEventListener('loadeddata', onReady);
}

function applyResumeAndPlay(idx, opts = {}) {
  const media = mediaFor(idx);
  let resumeTime = 0;

  if (state.completedSlides.has(idx)) {
    resumeTime = 0;
    state.completedSlides.delete(idx);
    state.slidePositions.set(idx, 0);
  } else {
    resumeTime = state.slidePositions.get(idx) || 0;
  }

  try { media.currentTime = resumeTime; } catch (e) { /* ignore */ }
  media.playbackRate = state.speed;

  resetReveals(slides[idx]);

  const shouldAnimate = (resumeTime < 0.05) || opts.forceAnimate;
  if (shouldAnimate) {
    slides[idx].classList.remove('skip-reveal');
    resetBgVideo(idx);
    triggerSlideAnimations(slides[idx]);
  } else {
    slides[idx].classList.add('skip-reveal');
    seekBgVideo(idx, resumeTime);
    showSlideAtFinalState(slides[idx]);
  }

  processReveals(slides[idx], resumeTime, true);

  if (opts.autoPlay) {
    const playPromise = media.play();
    if (playPromise) playPromise.catch(() => {});
  }

  updateTimeDisplay();
}

function showSlideAtFinalState(slideEl) {
  slideEl.querySelectorAll('[data-count-to]').forEach(el => {
    if (el.hasAttribute('data-reveal-at')) return;
    el.textContent = el.dataset.countTo + (el.dataset.countSuffix || '');
  });
}

/* ============================================================
   CUE-DRIVEN REVEAL ENGINE with narration focus
   Inside a [data-focus-group], the most recently fired element
   holds .active (full ink) while earlier ones keep .revealed
   and dim via CSS.
   ============================================================ */
function resetReveals(slideEl) {
  if (!slideEl) return;
  slideEl.querySelectorAll('[data-reveal-at]').forEach(el => {
    el.classList.remove('revealed', 'cue-instant', 'active');
    if (el.dataset.countTo) el.textContent = '0' + (el.dataset.countSuffix || '');
  });
}

function processReveals(slideEl, currentTime, instant) {
  if (!slideEl) return;
  slideEl.querySelectorAll('[data-reveal-at]').forEach(el => {
    if (el.classList.contains('revealed')) return;
    const t = parseFloat(el.dataset.revealAt);
    if (!isFinite(t) || currentTime < t) return;
    el.classList.add('revealed');
    if (instant) el.classList.add('cue-instant');
    const group = el.closest('[data-focus-group]');
    if (group) {
      group.querySelectorAll('[data-reveal-at].active').forEach(sib => sib.classList.remove('active'));
      el.classList.add('active');
    }
    if (el.dataset.countTo) {
      if (instant) el.textContent = el.dataset.countTo + (el.dataset.countSuffix || '');
      else animateCount(el);
    }
  });
  // After an instant catch-up (resume/seek), the LAST passed element in each
  // group should hold focus, not whichever iterated last by DOM order quirks.
  if (instant) {
    slideEl.querySelectorAll('[data-focus-group]').forEach(group => {
      const revealed = [...group.querySelectorAll('[data-reveal-at].revealed')];
      if (!revealed.length) return;
      revealed.forEach(el => el.classList.remove('active'));
      revealed.sort((a, b) => parseFloat(a.dataset.revealAt) - parseFloat(b.dataset.revealAt));
      revealed[revealed.length - 1].classList.add('active');
    });
  }
}

function goToSlide(idx, opts = {}) {
  if (idx < 0 || idx >= slides.length) return;
  if (idx === state.currentSlide && !opts.force) { loadSlideMedia(idx, opts); return; }

  const leaving = currentMedia();
  if (state.audioReady && !state.completedSlides.has(state.currentSlide)) {
    state.slidePositions.set(state.currentSlide, leaving.currentTime);
  }
  leaving.pause();

  slides[state.currentSlide].classList.remove('active');
  slides[state.currentSlide].classList.remove('skip-reveal');
  state.currentSlide = idx;
  slides[idx].classList.add('active');
  slideIndicator.textContent = `${idx + 1} / ${slides.length}`;
  updateOverviewActive();
  syncBgVideos();

  loadSlideMedia(idx, opts);
}

function nextSlide(opts = {}) { goToSlide(state.currentSlide + 1, { autoPlay: state.isPlaying, ...opts }); }
function prevSlide(opts = {}) { goToSlide(state.currentSlide - 1, { autoPlay: state.isPlaying, ...opts }); }

function togglePlay() {
  const media = currentMedia();
  if (media.paused) {
    if (!state.audioReady) {
      loadSlideMedia(state.currentSlide, { autoPlay: true });
    } else {
      const p = media.play();
      if (p) p.catch(() => {});
    }
  } else {
    media.pause();
  }
}

function attachMediaEvents(m) {
  m.addEventListener('play', () => {
    if (m !== currentMedia()) { m.pause(); return; }
    state.isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    syncBgVideos();
  });

  m.addEventListener('playing', () => {
    if (m !== currentMedia()) return;
    state.audioReady = true;
    hideNotice();
  });

  m.addEventListener('pause', () => {
    if (m !== currentMedia()) return;
    state.isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    syncBgVideos();
    if (state.audioReady && !m.ended) {
      state.slidePositions.set(state.currentSlide, m.currentTime);
    }
  });

  m.addEventListener('ended', () => {
    if (m !== currentMedia()) return;
    state.completedSlides.add(state.currentSlide);
    state.slidePositions.set(state.currentSlide, 0);
    if (state.currentSlide < slides.length - 1) {
      state.pendingAdvance = setTimeout(() => {
        state.pendingAdvance = null;
        goToSlide(state.currentSlide + 1, { autoPlay: true });
      }, LESSON_CONFIG.interSlidePauseMs);
    }
  });

  m.addEventListener('timeupdate', () => {
    if (m !== currentMedia()) return;
    if (m.readyState < 1) return;
    if (!m.paused) state.slidePositions.set(state.currentSlide, m.currentTime);
    processReveals(slides[state.currentSlide], m.currentTime, false);
  });

  m.addEventListener('seeked', () => {
    if (m !== currentMedia()) return;
    seekBgVideo(state.currentSlide, m.currentTime);
    processReveals(slides[state.currentSlide], m.currentTime, true);
  });
}

attachMediaEvents(audio);
document.querySelectorAll('video.slide-media').forEach(attachMediaEvents);

audio.addEventListener('error', () => {
  if (audio.networkState === 0 || audio.networkState === 3) return;
  if (!state.loadedSrc || !audio.src.endsWith(state.loadedSrc)) return;
  state.audioReady = false;
  showNotice(`Audio failed to load: ${audio.src.split('/').pop()}`);
});
document.querySelectorAll('video.slide-media').forEach(v => {
  v.addEventListener('error', () => {
    showNotice(`Video failed to load: ${(v.getAttribute('src') || '').split('/').pop()}`);
  });
});

function tick() {
  const media = currentMedia();
  if (media.readyState >= 1 && isFinite(media.duration) && media.duration > 0) {
    const t = media.currentTime, d = media.duration;
    timelineProgress.style.width = `${(t / d) * 100}%`;
    timelineHandle.style.left = `${(t / d) * 100}%`;
    updateTimeDisplay();
  }
  requestAnimationFrame(tick);
}

function updateTimeDisplay() {
  const media = currentMedia();
  if (media.readyState < 1 || !isFinite(media.duration)) { timeDisplay.textContent = '0:00 / 0:00'; return; }
  timeDisplay.textContent = `${formatTime(media.currentTime)} / ${formatTime(media.duration || 0)}`;
}
function formatTime(sec) { if (!isFinite(sec)) return '0:00'; const m = Math.floor(sec / 60); const s = Math.floor(sec % 60); return `${m}:${String(s).padStart(2, '0')}`; }

timelineEl.addEventListener('click', (e) => {
  const media = currentMedia();
  if (media.readyState < 1 || !isFinite(media.duration)) return;
  const rect = timelineEl.getBoundingClientRect();
  media.currentTime = ((e.clientX - rect.left) / rect.width) * media.duration;
});

function toggleCaptions() {
  state.captionsEnabled = !state.captionsEnabled;
  captionsBtn.classList.toggle('active', state.captionsEnabled);
  if (!state.captionsEnabled) captionsEl.classList.remove('visible');
}

function toggleDebugMode() {
  state.debugMode = !state.debugMode;
  cuePanel.classList.toggle('visible', state.debugMode);
  cueBtn.classList.toggle('active', state.debugMode);
  if (state.debugMode) renderDebugPanel();
}
function renderDebugPanel() {
  const lines = [`<div class="cue-line"><span><strong>#</strong></span><span><strong>Media</strong></span><span><strong>Position</strong></span><span><strong>Status</strong></span></div>`];
  for (let i = 0; i < slides.length; i++) {
    const pos = state.slidePositions.get(i) || 0;
    const status = state.completedSlides.has(i) ? '✓ done' : i === state.currentSlide ? '▶ now' : '·';
    lines.push(`<div class="cue-line"><span>${String(i+1).padStart(2,'0')}</span><span>${mediaLabel(i).split('/').pop()}</span><span>${formatTime(pos)}</span><span>${status}</span></div>`);
  }
  cueListEl.innerHTML = lines.join('');
}
setInterval(() => { if (state.debugMode) renderDebugPanel(); }, 500);

function setSpeed(speed) {
  state.speed = parseFloat(speed);
  audio.playbackRate = state.speed;
  document.querySelectorAll('video.slide-media').forEach(v => { v.playbackRate = state.speed; });
  applyBgRate(state.currentSlide);
  speedLabel.textContent = `${state.speed}x`;
  speedMenu.querySelectorAll('button').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === state.speed));
}

function buildOverview() {
  overviewGridEl.innerHTML = '';
  slides.forEach((slide, i) => {
    const item = document.createElement('div');
    item.className = 'overview-item' + (i === state.currentSlide ? ' active' : '');
    item.innerHTML = `<span class="index">${String(i+1).padStart(2,'0')}</span><span>${LESSON_CONFIG.slideTitles[i] || `Slide ${i+1}`}</span><span class="layout-tag">${slide.dataset.layout || ''}</span>`;
    item.addEventListener('click', () => { goToSlide(i, { autoPlay: state.isPlaying }); toggleOverview(); });
    overviewGridEl.appendChild(item);
  });
}
function updateOverviewActive() { overviewGridEl.querySelectorAll('.overview-item').forEach((el, i) => el.classList.toggle('active', i === state.currentSlide)); }
function toggleOverview() { overviewEl.classList.toggle('visible'); }
function showNotice(text) { noticeEl.textContent = text; noticeEl.classList.add('visible'); }
function hideNotice() { noticeEl.classList.remove('visible'); }

document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
  const a = btn.dataset.action;
  if (a === 'prev') prevSlide();
  else if (a === 'next') nextSlide();
  else if (a === 'playpause') togglePlay();
  else if (a === 'overview') toggleOverview();
  else if (a === 'captions') toggleCaptions();
  else if (a === 'speed') speedMenu.classList.toggle('visible');
  else if (a === 'cue') toggleDebugMode();
}));
document.querySelectorAll('[data-speed]').forEach(btn => btn.addEventListener('click', () => { setSpeed(btn.dataset.speed); speedMenu.classList.remove('visible'); }));

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
  else if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  else if (e.key.toLowerCase() === 'c') toggleCaptions();
  else if (e.key.toLowerCase() === 'o') toggleOverview();
  else if (e.key.toLowerCase() === 'd') toggleDebugMode();
  else if (e.key === 'Escape') { overviewEl.classList.remove('visible'); speedMenu.classList.remove('visible'); cuePanel.classList.remove('visible'); state.debugMode = false; cueBtn.classList.remove('active'); }
});

/* ============================================================
   ANIMATION ENGINE · word split, stagger, count-up
   ============================================================ */
function splitWords() {
  document.querySelectorAll('.reveal-words').forEach(el => {
    if (el.dataset.wordsSplit) return;
    const html = el.innerHTML;
    const tokens = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        const close = html.indexOf('>', i);
        const tag = html.substring(i, close + 1);
        if (tag.startsWith('<em')) {
          const endTag = html.indexOf('</em>', close);
          const inner = html.substring(close + 1, endTag);
          const words = inner.split(/\s+/).filter(Boolean);
          tokens.push(...words.map(w => `<em>${w}</em>`));
          i = endTag + 5;
        } else {
          tokens.push(tag);
          i = close + 1;
        }
      } else {
        const next = html.indexOf('<', i);
        const chunk = next === -1 ? html.substring(i) : html.substring(i, next);
        const words = chunk.split(/\s+/).filter(Boolean);
        tokens.push(...words);
        i = next === -1 ? html.length : next;
      }
    }
    el.innerHTML = tokens.map((tok, idx) => `<span class="word" style="--word-i:${idx}">${tok}</span>`).join(' ');
    el.dataset.wordsSplit = '1';
  });
}

function setStaggerIndices() {
  const containers = document.querySelectorAll('.text-list, .columns, .grid, .point-row, .row-list, .pillar-row, .step-list, .check-list');
  containers.forEach(c => {
    const children = c.children;
    for (let i = 0; i < children.length; i++) children[i].style.setProperty('--i', i);
  });
}

function animateCount(el, duration = 1800) {
  const to = parseFloat(el.dataset.countTo);
  const from = parseFloat(el.dataset.countFrom || 0);
  const suffix = el.dataset.countSuffix || '';
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = from + (to - from) * eased;
    el.textContent = Math.round(value) + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function triggerSlideAnimations(slideEl) {
  slideEl.querySelectorAll('[data-count-to]').forEach(el => {
    if (el.hasAttribute('data-reveal-at')) return;
    el.textContent = '0' + (el.dataset.countSuffix || '');
    setTimeout(() => animateCount(el), 800);
  });
}

/* ============================================================
   INITIALIZE
   ============================================================ */
slideIndicator.textContent = `1 / ${slides.length}`;
splitWords();
setStaggerIndices();
buildOverview();
triggerSlideAnimations(slides[0]);
loadSlideMedia(0, { autoPlay: false });
requestAnimationFrame(tick);
setTimeout(() => { if (!state.audioReady) showNotice('Place the audio/ and video/ folders next to this HTML'); }, 1500);
"""


def build(lesson_dir: Path):
    v2 = lesson_dir / "work_player" / "v2"
    for sid in ["02", "03", "04", "05", "06", "07", "08"]:
        TIMINGS[sid] = json.loads((v2 / "timings" / f"seg_{sid}.json").read_text())["words"]

    c = {
        "s2_title": cue("02", "some trick"),
        "s2_p1": cue("02", "beats a single lease"),
        "s2_p2": cue("02", "takes less of your week"),
        "s2_p3": cue("02", "gives good people"),
        "s3_head": cue("03", "we take space"),
        "s3_kick": cue("03", "every single lesson"),
        "s4_r1": cue("04", "real business"),
        "s4_r2": cue("04", "spare bedroom"),
        "s4_r3": cue("04", "too big"),
        "s4_r4": cue("04", "investor"),
        "s4_foot": cue("04", "straight with you"),
        "s5_c1": cue("05", "steady cash flow"),
        "s5_c2": cue("05", "second"),
        "s5_c3": cue("05", "and third"),
        "s6_p1": cue("06", "rent-ready"),
        "s6_p2": cue("06", "managing it ourselves"),
        "s6_p3": cue("06", "keeping guests happy"),
        "s7_p1": cue("07", "starts with research"),
        "s7_p2": cue("07", "then planning"),
        "s7_p3": cue("07", "phase three"),
        "s7_p4": cue("07", "then operations"),
        "s7_p5": cue("07", "phase five"),
        "s7_bonus": cue("07", "bonus module"),
        "s8_o1": cue("08", "find a property"),
        "s8_o2": cue("08", "design a room"),
        "s8_o3": cue("08", "several tenants"),
        "s8_o4": cue("08", "good people back"),
        "s8_next": cue("08", "next lesson"),
    }

    bundle = lesson_dir / "Lesson_0_1_Hybrid_Bundle"
    (bundle / "audio").mkdir(parents=True, exist_ok=True)
    (bundle / "video").mkdir(exist_ok=True)

    total = 0.0
    for sid in ["02", "03", "04", "05", "06", "07", "08"]:
        src = v2 / f"seg_{sid}.mp3"
        shutil.copy2(src, bundle / "audio" / f"voiceover_{sid}.mp3")
        total += duration(src)

    missing = []
    for name in ["intro_avatar.mp4", "broll_02.mp4", "broll_06.mp4"]:
        src = v2 / name
        if src.exists():
            shutil.copy2(src, bundle / "video" / name)
            if name == "intro_avatar.mp4":
                total += duration(src)
        else:
            missing.append(name)

    for svg in ["BNHG_full_lockup.svg", "BNHG_letter_mark.svg"]:
        shutil.copy2(SVG_DIR / svg, bundle / svg)

    total += 7 * 0.4
    runtime = f"{int(total // 60)}:{int(total % 60):02d}"

    config = {
        "meta": {"moduleNumber": 0, "lessonNumber": 1,
                 "lessonTitle": "Who We Are and What We Do", "runtime": runtime},
        "interSlidePauseMs": 400,
        "slideTitles": [
            "Intro · Meet Della",
            "Hear this first · What co-living is",
            "Our mission",
            "Who this course is for",
            "The three Be Nice pillars",
            "Our specialty · Three things",
            "The Be Nice Way · Five phases",
            "What you'll walk away with · Up next",
        ],
    }

    tpl = TEMPLATE.read_text()
    head, _script = tpl.split("<script>", 1)
    head = (head
            .replace("{{HTML_TITLE}}", "Room Rental Riches · Lesson 0.1 · Who We Are and What We Do")
            .replace("{{MODULE_TAG}}", "Module 0 · Getting Started")
            .replace("{{LESSON_TITLE}}", "Lesson 0.1 · Who We Are and What We Do")
            .replace("</style>", EXTRA_CSS + "\n</style>")
            .replace("<!-- {{SLIDES_HTML}} -->", slides_html(c))
            .replace('<div class="avatar-pip" id="avatar-pip"><span>Della Avatar</span></div>', ""))

    js = PLAYER_JS.replace("{{LESSON_CONFIG_JSON}}", json.dumps(config, indent=2))
    html = head + "<script>" + js + "</script>\n\n</body>\n</html>\n"

    if re.search("[–—]", slides_html(c) + json.dumps(config)):
        sys.exit("em/en-dash found in slide content or config")

    old = bundle / "Lesson_0_1_Hybrid_v1.html"
    if old.exists():
        old.unlink()
    out = bundle / "Lesson_0_1_Hybrid_v2.html"
    out.write_text(html)
    print(f"built {out}")
    print(f"runtime ~{runtime}  ({total:.1f}s incl. pauses)")
    for k in sorted(c):
        print(f"  cue {k:10} {c[k]}s")
    if missing:
        print(f"WARNING missing videos (drop into work_player/v2/ and re-run): {missing}")


if __name__ == "__main__":
    build(Path(sys.argv[1]).resolve())
