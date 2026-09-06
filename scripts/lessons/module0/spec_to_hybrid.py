#!/usr/bin/env python3
"""
spec_to_hybrid.py — draft a hybrid lesson from an Editorial spec.md (Car Rental Riches).

Reads  Module N.M/spec.md  (the Editorial-format lesson spec) and writes
  Module N.M/hybrid_spec.json          slide structure for build_hybrid_lesson.py
  Module N.M/work_player/intro_script.txt   avatar intro (cover VO, trimmed)
  Module N.M/work_player/v2_scripts.json    per-segment VO (slides 2..N, verbatim)

Layout mapping (Editorial -> hybrid):
  cover -> video-intro · hero-stat / quote / spread -> statement (one spread per
  lesson becomes video-split with stock b-roll) · three-col -> columns ·
  two-col -> table · card-grid -> rows (the closing "next up" card-grid ->
  statement with an upnext band) · action -> checklist.

Cue phrases are chosen automatically: for every slide element the VO sentence
with the best word overlap is found, then a 3 to 4 word window with no number
words, no hyphenated compounds, unique in the segment and in narration order.
check_cues.py validates the result; anything it flags is fixed by hand or by
fix_cues.py after STT.

Usage:
  python scripts/lessons/module0/spec_to_hybrid.py "Courses/Car Rental Riches/Module 2.1" [--force]
  python scripts/lessons/module0/spec_to_hybrid.py --all "Courses/Car Rental Riches" [--force]
"""
from __future__ import annotations
import html as html_mod
import json
import re
import sys
from pathlib import Path

NOTE_DEFAULT = "Car Rental Riches is an independent educational product, not affiliated with Turo Inc."
MODULE_TAGS = {
    1: "Module 1 · The Business Nobody Explains", 2: "Module 2 · Business Foundation",
    3: "Module 3 · Market Analysis & Vehicle Underwriting", 4: "Module 4 · Acquisition & Financing",
    5: "Module 5 · Storefront, Pricing & the Lead-Time Game", 6: "Module 6 · Systems From Car One",
    7: "Module 7 · Insurance, Claims, Fraud & Theft", 8: "Module 8 · Guest Experience & Five-Star Defense",
    9: "Module 9 · The Money Module", 10: "Module 10 · The Channels the Giants Don't Want You In",
    11: "Module 11 · The Direct-Booking Floor & Stack", 12: "Module 12 · From Car 2 to Fifty",
}
NUMBER_WORDS = {"two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen",
    "fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty",
    "seventy","eighty","ninety","hundred","thousand","million","billion","first","second","third","fourth",
    "fifth","sixth","seventh","eighth","ninth","tenth","percent","half","quarter"}
STOP = {"a","an","the","in","of","with","at","his","her","their","on","and","to","beside","by","from","into",
    "under","near","over","its","one","two","three","for","or","as","is","are","that","this","black","white",
    "mixed","race","thirties","forties","twenties","fifties","man","woman","person","young","clean","small","tidy",
    "modest","early","late","soft","warm","light","morning","evening","dusk","dawn","night","seen","shot","close",
    "up","style","styled","blurred","unbranded","printed","hand","hands","append","standard","crr","block",
    "authoring","guide","everyday","neat","quiet","single","overhead","angle","focus","depth","shallow"}
norm = lambda t: re.sub(r"[^a-z0-9]+", "", t.lower())


# ---------- spec parsing ----------

def parse_spec(md: str) -> dict:
    head = {}
    for key in ("lesson_title", "module_num", "lesson_num", "disclaimer_flag", "review_gate", "status"):
        m = re.search(rf"^{key}:\s*(.+)$", md, re.M)
        if m: head[key] = m.group(1).strip()
    slides = []
    for m in re.finditer(r"^### Slide (\d+) - (.+?)\n(.*?)(?=^### Slide \d+|^## Quiz|\Z)", md, re.M | re.S):
        num, label, body = int(m.group(1)), m.group(2).strip(), m.group(3)
        def field(name):
            mm = re.search(rf"^- {re.escape(name)}:\s*(.*?)$", body, re.M)
            return mm.group(1).strip() if mm else ""
        vo_m = re.search(r"^- vo: \|\n((?:[ \t]+.*\n?)+)", body, re.M)
        vo = " ".join(l.strip() for l in vo_m.group(1).splitlines() if l.strip()) if vo_m else ""
        slides.append({
            "num": num, "label": label, "layout": field("layout"), "title": field("title"),
            "meta": field("subtitle/meta"), "content": field("content"),
            "image": field("image") or field("image(s)"), "vo": vo,
        })
    return {"head": head, "slides": slides}


# ---------- text helpers ----------

def clean_vo(vo: str) -> str:
    vo = vo.replace("—", ", ").replace("–", " to ")
    vo = re.sub(r"(?<=[A-Za-z])-(?=[A-Za-z])", " ", vo)   # de-hyphenate compounds (cue robustness)
    vo = re.sub(r"\s+", " ", vo).strip()
    return vo


def strip_markers(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"\[(ALEX INPUT NEEDED|VERIFY):[^\]]*\]", "", text)).strip()


def sentences(text: str) -> list[str]:
    text = strip_markers(text)
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", text)
    return [p.strip() for p in parts if p.strip()]


def esc(t: str) -> str:
    return html_mod.escape(t, quote=False)


def em_split(text: str) -> str:
    """Return heading HTML with the tail in <em>, period inside the em."""
    t = text.strip().strip('"').rstrip(".").strip()
    t = t.replace("—", ",").replace("–", "-")
    t = t[:1].upper() + t[1:]
    words = t.split()
    if ": " in t:
        a, b = t.split(": ", 1)
        return f"{esc(a)}: <em>{esc(b)}.</em>"
    if ", " in t and len(words) > 5:
        a, b = t.rsplit(", ", 1)
        return f"{esc(a)}, <em>{esc(b)}.</em>"
    if len(words) >= 4:
        k = 2 if len(words) < 8 else 3
        return f"{esc(' '.join(words[:-k]))} <em>{esc(' '.join(words[-k:]))}.</em>"
    return f"<em>{esc(t)}.</em>"


def cap(t: str) -> str:
    t = t.strip()
    return t[:1].upper() + t[1:] if t else t


def clip(t: str, n: int) -> str:
    t = t.strip()
    if len(t) <= n: return t
    cut = t[:n]
    for sep in (". ", "; ", ", "):
        if sep in cut: return cut[:cut.rfind(sep) + 1].rstrip(",; ")
    return cut.rsplit(" ", 1)[0] + "."


def split_part(part: str) -> tuple[str, str]:
    """'Title (desc)' / 'Title: desc' / 'Title - desc' -> (title, desc)."""
    part = part.strip().rstrip(".")
    m = re.match(r"^(.{3,70}?)\s*\((.*)\)\s*$", part)
    if m: return cap(m.group(1)), cap(m.group(2))
    for sep in (": ", " - "):
        if sep in part and len(part.split(sep, 1)[0]) <= 70:
            a, b = part.split(sep, 1); return cap(a), cap(b)
    if ", " in part and len(part.split(", ", 1)[0]) <= 60 and len(part) > 70:
        a, b = part.split(", ", 1); return cap(a), cap(b)
    words = part.split()
    if len(words) > 9:
        return cap(" ".join(words[:6])), cap(" ".join(words[6:]))
    return cap(part), ""


def title_case_label(label: str) -> str:
    return label[:1].upper() + label[1:]


def q(s: str) -> str:
    return s.strip().strip('"').strip()


def unquote_all(s: str) -> str:
    return re.sub(r"\s+", " ", s.replace('"', "")).strip(" .;:")


# ---------- content parsing ----------

def get_heading(content: str) -> str:
    m = re.search(r"(?:Heading|Headline)\s*:?\s*\"([^\"]+)\"", content)
    return m.group(1).strip() if m else ""


def get_supporting(content: str) -> str:
    m = re.search(r"(?:Supporting(?: text| line)?|Caption|Support|Sub-line|label|Body)\s*:?\s*(.+)", content, re.I)
    if not m: return ""
    s = m.group(1).strip()
    s = re.split(r"\s(?:Footnotes?|Footer line|Honest framing line)\s*:", s)[0]
    s = re.sub(r"\s*·\s*attribution\s*\".*$", "", s)
    return unquote_all(s)


def get_big_stat(content: str) -> str:
    m = re.search(r"Big (?:stat|numeral)\s*:?\s*\"([^\"]+)\"", content) or re.search(r"Big (?:stat|numeral)\s*:\s*([^.]+)\.", content)
    return m.group(1).strip() if m else ""


def get_points_list(content: str) -> list[str]:
    """'Points: a · b · c' / 'Postmortem questions: a; b; c' / 'Bullets: a, b' -> items."""
    m = re.search(r"(?:Points|Bullets|Postmortem questions|Questions|Rules|Signals)\s*:\s*(.+)", content)
    if not m: return []
    txt = re.split(r"\s(?:Footer line|Footer note|Footnotes?)\s*:", m.group(1))[0]
    parts = [x.strip() for x in re.split(r"\s*·\s*|;\s+", txt) if len(x.strip()) > 3]
    return [cap(unquote_all(x)) for x in parts[:6]]


def get_footer(content: str) -> str:
    m = re.search(r"(?:Footer line|Footnotes?|Honest framing line)\s*:\s*(.+)", content)
    return unquote_all(m.group(1)) if m else ""


def get_cols(content: str) -> list[dict]:
    body = re.sub(r"^(?:Heading|Headline)\s*:?\s*\"[^\"]+\"\.?\s*", "", content).strip()
    lr = re.findall(r"(?:Left|Right) column heading:\s*\"([^\"]+)\"\.?\s*(?:Bullets?:\s*)?(.*?)(?=\s(?:Left|Right) column heading:|$)", body, re.S)
    if len(lr) >= 2:
        return [{"title": cap(t.strip(" .")), "body": cap(unquote_all(b).rstrip("."))} for t, b in lr[:3]]
    chunks = re.split(r"(?:^|\s)Col(?:umn)?\s+(\d+)\s*(?:heading)?\s*:?\s*", body)
    cols = []
    for i in range(1, len(chunks) - 1, 2):
        text = chunks[i + 1].strip()
        text = re.split(r"\s(?:Footer line|Footer note|Footnotes?)\s*:", text)[0]
        sub = re.search(r"with sub-line\s*\"([^\"]*)\"", text)
        m = re.match(r"\"([^\"]+)\"\s*(?:\((.*)\)|:\s*(.*)|list:\s*\"([^\"]*)\"|(.*))?", text, re.S)
        if m:
            title = m.group(1).strip()
            bodytxt = sub.group(1) if sub else (next((g for g in m.groups()[1:] if g), "") or "")
            if sub: bodytxt = sub.group(1)
        else:
            title, bodytxt = text, ""
        if not bodytxt or len(title) > 70:
            for sep in (". ", " - ", ": "):
                if sep in title and len(title.split(sep, 1)[0]) <= 70:
                    a, b = title.split(sep, 1); title, bodytxt = a, (b + (" " + bodytxt if bodytxt else "")); break
        bodytxt = re.sub(r"\bwith sub-line\b.*$", "", unquote_all(bodytxt)).strip().lstrip("-· ").strip()
        cols.append({"title": cap(title.strip(" .:")), "body": cap(bodytxt)})
    return cols


def get_cards(content: str) -> list[dict]:
    cards = []
    for m in re.finditer(r"(?:^|(?<=[\s.]))(?:Card\s*)?(\d{1,2})[:.]?\s+\"([^\"]+)\"\s*(?:\(([^)]*)\)|with sub-line\s*\"([^\"]*)\")?", content):
        title, desc = m.group(2).strip(), (m.group(3) or m.group(4) or "").strip()
        if not desc:
            for sep in (". ", " - ", ": "):
                if sep in title:
                    title, desc = title.split(sep, 1); break
        cards.append({"title": cap(title.strip(" .")), "desc": cap(unquote_all(desc))})
    if cards: return cards
    body = re.sub(r"^(?:cols-\d,?\s*)?\d+ cards[.:]?\s*", "", content.strip())
    body = re.split(r"\s(?:Footer note|Footer line|Footnotes?)\s*:", body)[0]
    parts = [x.strip() for x in re.split(r"(?:^|\s)\d{1,2}\)\s*", body) if x.strip()]
    if len(parts) >= 2:
        for prt in parts[:6]:
            t, d = split_part(prt); cards.append({"title": t, "desc": d})
        return cards
    quoted = re.findall(r"\"([^\"]+)\"(?:\s*\(([^)]*)\))?", body)
    if len(quoted) >= 2:
        return [{"title": cap(q.strip(" .")), "desc": cap(unquote_all(d))} for q, d in quoted[:6]]
    return cards


def get_steps(content: str) -> list[str]:
    content = re.sub(r"^(?:Heading|Headline)\s*:?\s*\"[^\"]+\"\.?\s*(?:·\s*)?", "", content)
    m = re.search(r"Steps?(?: shown on slide)?\s*:\s*(.+)", content)
    if m:
        parts = re.split(r"\s*(?:^|\s)\d{1,2}[.)]\s+(?=[A-Z])", " " + m.group(1))
        out = [cap(unquote_all(p)) for p in parts if len(p.strip()) > 3]
        if len(out) >= 2: return out
    content = re.sub(r"^(?:Heading|Headline)\s*:?\s*\"[^\"]+\"\.?\s*(?:·\s*)?", "", content)
    m = re.search(r"checklist\s*:\s*(.+)", content, re.I)
    if m:
        parts = [x.strip() for x in re.split(r"\s*·\s*|;\s*", m.group(1)) if x.strip()]
        if len(parts) >= 2: return [cap(unquote_all(x)) for x in parts[:6]]
    m = re.search(r"Tasks?\s*:\s*(.+)", content)
    if m:
        txt = unquote_all(m.group(1))
        sents = [x.strip() for x in re.split(r"(?<=[.!?])\s+(?=[A-Z])", txt) if len(x.strip()) > 12]
        return [cap(x) for x in sents[:5]]
    parts = [x.strip() for x in re.split(r"(?:^|\s)\d{1,2}\)\s*", content) if x.strip()]
    if len(parts) >= 2: return [cap(unquote_all(x)) for x in parts[:6]]
    return []


def get_quote(content: str) -> tuple[str, str]:
    m = re.search(r"(?:Pull quote|Callout|Quote)\s*:?\s*\"([^\"]+)\"", content)
    a = re.search(r"Attribution:\s*(.+)", content)
    return (m.group(1).strip() if m else ""), (unquote_all(a.group(1)) if a else "")


def stock_query(image: str) -> str:
    text = image.split(",")[0]
    text = re.sub(r"^\s*(?:\d\)\s*)?(?:A|An|The)\s+", "", text.strip())
    words = [w for w in re.findall(r"[A-Za-z']+", text) if w.lower() not in STOP]
    return " ".join(words[:5]).lower() or "car parked driveway"


# ---------- cue selection ----------

class Cuer:
    def __init__(self, seg: str, vo: str):
        self.seg = seg
        self.words = strip_markers(vo).split()
        self.toks = [norm(w) for w in self.words]
        self.sents = []   # (start_idx, end_idx, text)
        i = 0
        for s in sentences(vo):
            n = len(s.split())
            self.sents.append((i, i + n, s)); i += n
        self.min_pos = 0
        self.used = set()

    def _clean(self, tok: str) -> bool:
        return bool(tok) and tok.isalpha() and tok not in NUMBER_WORDS and len(tok) >= 2

    def _unique(self, ph: list[str]) -> int:
        n = len(ph)
        return sum(1 for i in range(len(self.toks) - n + 1) if self.toks[i:i + n] == ph)

    def _window(self, start: int, end: int, size: int):
        for i in range(start, max(start, end - size + 1)):
            ph = self.toks[i:i + size]
            raw = self.words[i:i + size]
            if all(self._clean(t) for t in ph) and not any("-" in w for w in raw) and self._unique(ph) == 1 and ph[0] not in self.used:
                return i, " ".join(re.sub(r"[^A-Za-z']", "", w) for w in raw)
        return None

    def pick(self, target: str, advance: bool = True) -> dict | None:
        """Best sentence by overlap at/after min_pos; return {"seg","p"}."""
        ttoks = {norm(w) for w in re.findall(r"[A-Za-z']+", target) if len(w) > 3 and norm(w) not in NUMBER_WORDS}
        cands = []
        for si, (a, b, s) in enumerate(self.sents):
            if a < self.min_pos: continue
            stoks = set(self.toks[a:b])
            score = len(ttoks & stoks) / (len(ttoks) or 1)
            cands.append((score, a, b, si))
        if not cands: return None
        cands.sort(key=lambda c: (-c[0], c[1]))
        for score, a, b, si in cands:
            if score == 0 and cands[0][0] > 0: break
            for size in (3, 4, 2):
                w = self._window(max(a, self.min_pos), b, size)
                if w:
                    pos, phrase = w
                    if advance: self.min_pos = pos + 1
                    self.used.add(self.toks[pos])
                    return {"seg": self.seg, "p": phrase}
        # last resort: first clean window anywhere after min_pos
        for size in (3, 4):
            w = self._window(self.min_pos, len(self.toks), size)
            if w:
                pos, phrase = w
                if advance: self.min_pos = pos + 1
                return {"seg": self.seg, "p": phrase}
        return None


# ---------- slide construction ----------

def build_slides(spec: dict) -> tuple[list[dict], dict, str]:
    head = spec["head"]
    slides_in = spec["slides"]
    mod = int(head.get("module_num", 0)); les = int(head.get("lesson_num", 0))
    out, scripts = [], {}
    split_used = False
    total = len(slides_in)
    for s in slides_in:
        n = s["num"]; layout = (s["layout"].split() or [""])[0]; content = s["content"]; label = s["label"]
        seg = f"{n:02d}"
        if n == 1:
            note = NOTE_DEFAULT
            m = re.search(r"(Car Rental Riches is an independent[^.]*\.)", s["meta"] or "")
            if m: note = m.group(1)
            if head.get("disclaimer_flag") in ("tax", "legal", "insurance"):
                note += {"tax": " Educational information only, not tax advice.",
                         "legal": " Educational information only, not legal advice.",
                         "insurance": " Educational information only, not insurance advice."}[head["disclaimer_flag"]]
            out.append({"layout": "video-intro", "video": "intro_avatar.mp4", "eyebrow": f"Module {mod} · Lesson {les}",
                        "title": head.get("lesson_title", s["title"]), "note": note, "nav_title": "Intro"})
            continue
        vo = clean_vo(s["vo"])
        scripts[seg] = vo
        C = Cuer(seg, vo)
        eyebrow = title_case_label(label)
        if re.fullmatch(r"(?i)(cover|hero-?stat|two-?col|three-?col|card-?grid|spread|action|quote|next up)", label.strip()):
            eyebrow = {"hero-stat": "The number", "two-col": "Side by side", "three-col": "Three ways", "card-grid": "The list",
                       "spread": "The idea", "action": "Before the next lesson", "quote": "Alex's take", "next up": "Up next"}.get(label.strip().lower(), "The idea")
        heading = get_heading(content)
        supporting = get_supporting(content)
        if not heading and re.fullmatch(r"(?i)(hero-?stat|two-?col|three-?col|card-?grid|spread|action|quote|next up)", label.strip()):
            first = sentences(vo)[0] if sentences(vo) else ""
            if 3 <= len(first.split()) <= 12: heading = first.rstrip(".")
            else: heading = eyebrow
        supporting = re.sub(r"^(?:Points|Bullets)\s*:.*$", "", supporting)
        is_bna = "bna fleet" in label.lower() or "from the bna" in heading.lower()
        is_last = n == total
        slide: dict

        if layout == "action":
            steps = get_steps(content)
            items = [{"text": clip(st, 170), "at": C.pick(st)} for st in steps[:6]]
            slide = {"layout": "checklist", "seg": seg, "eyebrow": heading or "Before the next lesson",
                     "title_html": em_split(f"{len(items)} steps before the next lesson") if items else em_split("Before the next lesson"),
                     "nav_title": "Your move", "items": items}
        elif layout == "card-grid" and is_last:
            cards = get_cards(content)
            if mod == 12:
                for c in cards: c["title"] = re.sub(r"\b10\.(\d)\b", r"12.\1", c["title"])
            headline = heading or "Next up"
            nxt = cards[0]["title"] if cards else "Next lesson"
            slide = {"layout": "statement", "seg": seg, "eyebrow": "Up next", "headline_html": em_split(nxt),
                     "nav_title": "Up next", "headline_at": None}
            if cards:
                slide["kicker"] = {"text": cap(clip(cards[0]["desc"] or "", 230)), "at": C.pick(cards[0]["desc"] or cards[0]["title"])}
                rest = [c["title"] for c in cards[1:]]
                if rest:
                    slide["upnext"] = {"tag": "Then", "title": clip(" · ".join(rest), 220), "at": C.pick(" ".join(rest))}
                if not slide["kicker"]["text"]: del slide["kicker"]
        elif layout == "card-grid":
            cards = get_cards(content)
            rows = [{"title": clip(c["title"], 70), "desc": clip(c["desc"], 170), "at": C.pick(c["title"] + " " + c["desc"])} for c in cards[:6]]
            slide = {"layout": "rows", "seg": seg, "eyebrow": eyebrow, "title_html": em_split(heading or label),
                     "nav_title": eyebrow, "rows": rows}
            foot = get_footer(content)
            if foot: slide["footnote"] = {"text": cap(clip(foot, 200)), "at": C.pick(foot)}
        elif layout == "three-col":
            cols = get_cols(content)
            slide = {"layout": "columns", "seg": seg, "eyebrow": eyebrow, "title_html": em_split(heading or label),
                     "nav_title": eyebrow,
                     "cols": [{"tag": f"0{i+1}", "heading": clip(c["title"], 60), "body": clip(c["body"], 260), "at": C.pick(c["title"] + " " + c["body"])}
                              for i, c in enumerate(cols[:3])]}
            foot = get_footer(content)
            if foot and len(slide["cols"]) < 3:
                slide["cols"].append({"tag": "Note", "heading": "Footnote", "body": foot, "at": C.pick(foot)})
        elif layout == "two-col":
            cols = get_cols(content)
            if len(cols) >= 2:
                left = [x.strip() for x in re.split(r"\s*[;·]\s*", cols[0]["body"]) if x.strip()] or [cols[0]["body"]]
                right = [x.strip() for x in re.split(r"\s*[;·]\s*", cols[1]["body"]) if x.strip()] or [cols[1]["body"]]
                k = max(len(left), len(right)); left += [""] * (k - len(left)); right += [""] * (k - len(right))
                slide = {"layout": "table", "seg": seg, "plain": True, "eyebrow": eyebrow,
                         "title_html": em_split(heading or label), "nav_title": eyebrow,
                         "table": {"headers": [cols[0]["title"], cols[1]["title"]], "rows": [[cap(clip(l, 90)), cap(clip(r, 90))] for l, r in zip(left, right)][:6]}}
                vt = get_footer(content) or supporting
                if vt: slide["verdict"] = {"text": cap(clip(vt, 200)), "at": C.pick(vt)}
            else:
                slide = {"layout": "statement", "seg": seg, "eyebrow": eyebrow, "headline_html": em_split(heading or label),
                         "nav_title": eyebrow, "headline_at": None}
        elif layout == "hero-stat":
            stat = get_big_stat(content)
            caption = supporting
            headline = f"{esc(stat)} <em>{esc(caption.split('.')[0].rstrip('.'))}.</em>" if stat and caption else em_split(stat or heading or label)
            slide = {"layout": "statement", "seg": seg, "eyebrow": eyebrow, "headline_html": headline,
                     "nav_title": eyebrow, "headline_at": None}
            rest = ". ".join(caption.split(". ")[1:]).strip() if caption else ""
            foot = get_footer(content)
            if rest: slide["kicker"] = {"text": cap(clip(rest, 230)), "at": C.pick(rest)}
            if foot: slide["upnext"] = {"tag": "Note", "title": cap(clip(foot, 200)), "at": C.pick(foot)}
        elif layout == "quote":
            quote, attr = get_quote(content)
            slide = {"layout": "statement", "seg": seg, "eyebrow": "Alex's take" if "alex" in attr.lower() else eyebrow,
                     "headline_html": em_split(quote or heading or label), "nav_title": eyebrow, "headline_at": None}
            if attr and "alex henry" not in attr.lower().strip(" ."):
                slide["kicker"] = {"text": attr, "at": C.pick(attr)}
        elif layout == "spread" and not is_bna and not split_used:
            split_used = True
            pts = [x.strip() for x in re.split(r"\s*;\s*", supporting) if x.strip()][:3]
            if len(pts) < 2:
                pts = [x.strip() for x in re.split(r"(?<=[.!?])\s+", supporting) if x.strip()][:3]
            if len(pts) < 2:
                pl = get_points_list(content)
                if len(pl) >= 2: pts = pl[:3]
            if len(pts) < 2:
                numbered = [x.strip() for x in re.split(r"(?:^|\s)\d{1,2}\.\s+(?=[A-Z])", " " + content) if len(x.strip()) > 3]
                if len(numbered) >= 3: pts = numbered[1:4]
            points = [{"tag": f"0{i+1}", "text": cap(clip(p.rstrip("."), 140)), "at": C.pick(p)} for i, p in enumerate(pts)] if pts else []
            slide = {"layout": "video-split", "seg": seg, "video": f"broll_{seg}.mp4",
                     "stock": {"query": stock_query(s["image"]), "avoid": ["cartoon", "animation", "3d", "render", "logo", "luxury", "supercar", "night"]},
                     "eyebrow": eyebrow, "title_html": em_split(heading or label), "nav_title": eyebrow, "title_at": None,
                     "points": points}
            if not points:
                slide = {"layout": "statement", "seg": seg, "eyebrow": eyebrow, "headline_html": em_split(heading or label),
                         "nav_title": eyebrow, "headline_at": None}
                split_used = False
        else:  # spread (incl. BNA fleet)
            parts = [x.strip() for x in re.split(r"\s*;\s*", supporting) if x.strip()] if supporting else []
            numbered = [x.strip() for x in re.split(r"(?:^|\s)\d{1,2}\.\s+(?=[A-Z])", " " + content) if len(x.strip()) > 3]
            if len(numbered) >= 3 and not is_bna: parts = numbered[1:]
            pl = get_points_list(content)
            if len(pl) >= 2 and not is_bna: parts = pl
            if len(parts) == 2 and not is_bna: parts = parts + [""]   # two items still read better as rows
            parts = [x for x in parts if x]
            if not parts and not is_bna and supporting == "":
                rest = unquote_all(re.sub(r"^(?:Heading|Headline)\s*:?\s*\"[^\"]+\"\.?\s*", "", content))
                if len(rest) > 20: parts = [rest]
            if not is_bna and len(parts) >= 2:
                rows = []
                for prt in parts[:6]:
                    t, dsc = split_part(prt)
                    rows.append({"title": t, "desc": dsc, "at": C.pick(prt)})
                slide = {"layout": "rows", "seg": seg, "eyebrow": eyebrow, "title_html": em_split(heading or label),
                         "nav_title": eyebrow, "rows": rows}
            else:
                slide = {"layout": "statement", "seg": seg, "eyebrow": "From the BNA Fleet" if is_bna else eyebrow,
                         "headline_html": em_split(heading or label), "nav_title": eyebrow, "headline_at": None}
                if parts:
                    slide["kicker"] = {"text": cap(clip(parts[0], 230)).rstrip(".") + ".", "at": C.pick(parts[0])}
                    if len(parts) > 1:
                        slide["upnext"] = {"tag": "Also", "title": cap(clip("; ".join(parts[1:]), 200)).rstrip(".") + ".", "at": C.pick(" ".join(parts[1:]))}
        empty = any(k in slide and not slide[k] for k in ("items", "rows", "cols", "points")) or (slide["layout"] == "table" and not slide["table"]["rows"])
        if empty:
            slide = {"layout": "statement", "seg": seg, "eyebrow": eyebrow, "headline_html": em_split(heading or label),
                     "nav_title": eyebrow, "headline_at": None,
                     "kicker": {"text": cap(clip(unquote_all(re.sub(r"^(?:Heading|Headline)\s*:?\s*\"[^\"]+\"\.?\s*", "", content)), 230)), "at": C.pick(content)}}
        out.append(slide)

    intro_words = clean_vo(strip_markers(slides_in[0]["vo"])).split() if slides_in else []
    intro = ""
    for sent in sentences(" ".join(intro_words)):
        if len((intro + " " + sent).split()) > 125: break
        intro = (intro + " " + sent).strip()
    return out, scripts, intro


def drop_none_cues(obj):
    if isinstance(obj, dict):
        return {k: drop_none_cues(v) for k, v in obj.items() if not (k in ("at", "headline_at", "title_at") and v is None)}
    if isinstance(obj, list):
        return [drop_none_cues(x) for x in obj]
    return obj


def convert(lesson_dir: Path, force: bool = False) -> str:
    spec_md = lesson_dir / "spec.md"
    out_spec = lesson_dir / "hybrid_spec.json"
    if out_spec.exists() and not force:
        return f"skip {lesson_dir.name} (hybrid_spec.json exists)"
    spec = parse_spec(spec_md.read_text())
    head = spec["head"]
    slides, scripts, intro = build_slides(spec)
    mod = int(head["module_num"]); les = int(head["lesson_num"])
    hybrid = drop_none_cues({
        "course": "Car Rental Riches", "module": mod, "lesson_num": les,
        "title": head.get("lesson_title", ""), "module_tag": MODULE_TAGS.get(mod, f"Module {mod}"),
        "review_gate": head.get("review_gate", "none"), "disclaimer_flag": head.get("disclaimer_flag", "none"),
        "slides": slides,
    })
    wp = lesson_dir / "work_player"; (wp / "v2" / "timings").mkdir(parents=True, exist_ok=True)
    out_spec.write_text(json.dumps(hybrid, indent=2, ensure_ascii=False) + "\n")
    (wp / "v2_scripts.json").write_text(json.dumps(scripts, indent=1, ensure_ascii=False))
    (wp / "intro_script.txt").write_text(intro + "\n")
    words = sum(len(v.split()) for v in scripts.values())
    return f"{lesson_dir.name}: {len(slides)} slides, {len(scripts)} segments, {words} VO words, intro {len(intro.split())} words"


def main():
    args = sys.argv[1:]
    force = "--force" in args
    args = [a for a in args if a != "--force"]
    if args and args[0] == "--all":
        root = Path(args[1]).resolve()
        dirs = sorted([d for d in root.glob("Module *") if (d / "spec.md").exists()],
                      key=lambda d: [int(x) for x in d.name.split()[1].split(".")])
    else:
        dirs = [Path(args[0]).resolve()]
    for d in dirs:
        print(convert(d, force))


if __name__ == "__main__":
    main()
