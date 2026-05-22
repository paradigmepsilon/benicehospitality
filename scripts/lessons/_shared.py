"""
_shared.py — Common design tokens and helpers for BNHG lesson production.

Imported by build_lesson_html.py, generate_manifest.py, etc.
"""

# =============================================================================
# DESIGN TOKENS (mirror of CLAUDE.md Section 2)
# =============================================================================

COLORS = {
    "primary": "#5b9a2f",       # olive — recommendations, ✓
    "primary_dark": "#4a7d25",  # dark olive — end cards, hover
    "secondary": "#f5a623",     # gold — highlights, NEW, featured
    "tertiary": "#c0674a",      # terracotta — warnings, ✗
    "bg": "#f8f6f1",            # cream
    "ink_primary": "#1a1a1a",
    "ink_secondary": "#3d3d3d",
    "ink_muted": "#807868",
}

# =============================================================================
# HIGGSFIELD STYLE PROMPT
# =============================================================================

STYLE_PROMPT = """Editorial magazine photography, warm natural light (golden hour or soft window light), boutique hospitality aesthetic. Cream and terracotta neutrals, sage and olive accents, warm wood tones, considered minimalism. Composition: single-subject focus or wide architectural establishing shot. Style references: Cereal Magazine, Kinfolk, Magnolia Journal. Soft depth of field."""

# =============================================================================
# DISCLAIMER FOOTER TEMPLATES (Module 2 only)
# =============================================================================

DISCLAIMERS = {
    "legal": "Della and BNHG are not attorneys, CPAs, or licensed insurance brokers. Educational information only. Before forming an entity, filing taxes, purchasing insurance, or operating in any specific jurisdiction, you must consult with a licensed attorney, CPA, and insurance broker in your state.",
    "tax": "Della and BNHG are not attorneys, CPAs, or licensed insurance brokers. Tax law changes annually. Educational information only. Before filing or making tax decisions, you must consult with a licensed CPA in your state.",
    "insurance": "Della and BNHG are not licensed insurance brokers. Insurance products and coverage terms vary by state, carrier, and property. Educational information only. Before binding any policy, you must consult with a licensed broker in your state. Always verify coverage and exclusions in writing.",
    "regulatory": "Della and BNHG are not attorneys. Regulations change. Educational information only. Verify all rules with the relevant city, county, and state authorities and a licensed attorney in your jurisdiction before operating.",
    "none": "",  # Module 1 default
}


# =============================================================================
# VOICE / AVATAR IDS (mirror — but config/avatars.json is the source of truth)
# =============================================================================

VOICE_CLONE_ID = "13baf65f739742068cb912c60784c680"

AVATARS = {
    "module_1_front": "3b4169a21ffe4ab0a1b3336c67d8add9",
    "module_1_side": "9e3d44858d994af4b2c899d0ba8d4302",
    "module_2": "ac61ab42480e40ab816dc2104d41425e",
}


# =============================================================================
# FILENAME HELPERS
# =============================================================================

def image_filename(module_num: int, lesson_num: int, slide_num: int, image_num: int, slug: str) -> str:
    """Generate a canonical image filename.

    Example: image_filename(2, 6, 1, 1, "cover_hero") -> "L2-6_S01_01_cover_hero.png"
    """
    slug_clean = slug.lower().replace(" ", "_").replace("-", "_")
    return f"L{module_num}-{lesson_num}_S{slide_num:02d}_{image_num:02d}_{slug_clean}.png"


def audio_filename(slide_num: int) -> str:
    """Generate a canonical audio filename for a slide."""
    return f"voiceover_{slide_num:02d}.mp3"


# =============================================================================
# EM-DASH SWEEP
# =============================================================================

def emdash_sweep(text: str) -> list:
    """Find em-dashes and en-dashes in text. Returns list of (line_num, char, context)."""
    offenders = []
    for line_num, line in enumerate(text.split("\n"), 1):
        for i, ch in enumerate(line):
            if ch in ("\u2014", "\u2013"):
                ctx = line[max(0, i - 20): i + 20]
                offenders.append((line_num, ch, ctx))
    return offenders
