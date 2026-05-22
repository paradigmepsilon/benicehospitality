#!/usr/bin/env python3
"""
generate_manifest.py · Build Lesson_X_X_Image_Reference.csv + .md from a lesson spec.

Output format matches Lesson_1_2_Image_Reference (canonical reference).

Usage:
    python3 generate_manifest.py <spec.json> <output_dir>

Reads:
    spec.json · the lesson spec used for build_lesson_html.py
Writes (into output_dir):
    Lesson_<M>_<L>_Image_Reference.csv
    Lesson_<M>_<L>_Image_Reference.md
"""
import csv
import json
import sys
from pathlib import Path


def build_csv_rows(spec):
    """Build CSV rows. Each image gets one row."""
    rows = []
    order = 1
    for slide in spec["slides"]:
        slide_num = slide["num"]
        slide_label = f"S{slide_num:02d}"
        slide_title = slide.get("title_label", f"Slide {slide_num}")
        for img in slide.get("images", []):
            rows.append({
                "order": order,
                "slide": slide_label,
                "slot_description": f"{slide_title} - {img.get('slot', '')}",
                "filename": img.get("filename", ""),
                "aspect_ratio": img.get("aspect_ratio", "16:9"),
                "higgsfield_job_id": img.get("higgsfield_job_id", ""),
                "subject": img.get("subject", ""),
            })
            order += 1
    return rows


def write_csv(rows, out_path: Path):
    with out_path.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "order", "slide", "slot_description", "filename",
            "aspect_ratio", "higgsfield_job_id"
        ])
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in w.fieldnames})


def write_md(rows, spec, out_path: Path):
    module_num = spec["module_num"]
    lesson_num = spec["lesson_num"]
    title = spec["lesson_title"]
    total = len(rows)

    lines = []
    lines.append(f"# Lesson {module_num}.{lesson_num} · Image Reference & Placement Guide\n")
    lines.append(f"**Course:** Room Rental Riches")
    lines.append(f"**Module:** {module_num}")
    lines.append(f"**Lesson:** {module_num}.{lesson_num} · {title}")
    lines.append(f"**Total images:** {total}")
    lines.append(f"**Generated with:** Higgsfield Nano Banana Pro (2K resolution)")
    lines.append(f"\n---\n")

    lines.append("## How to use this file\n")
    lines.append("Every image listed below is referenced by relative path in the lesson HTML")
    lines.append(f"(e.g. `images/L{module_num}-{lesson_num}_S01_01_cover_hero.webp`).")
    lines.append("The PNG masters live in the top-level `images/` folder; the WEBP versions")
    lines.append("in `Lesson_X_X_Bundle/images/` are what the player loads.\n")
    lines.append("---\n")

    # Quick table
    lines.append("## Image Index\n")
    lines.append("| # | Slide | Filename | Aspect | Slot |")
    lines.append("|---|---|---|---|---|")
    for r in rows:
        lines.append(
            f"| {r['order']} | {r['slide']} | `{r['filename']}` | {r['aspect_ratio']} | {r['slot_description']} |"
        )
    lines.append("\n---\n")

    # Detailed guide
    lines.append("## Detailed image guide\n")
    for r in rows:
        lines.append(f"### `{r['filename']}`")
        lines.append(f"- **Slide:** {r['slide']}")
        lines.append(f"- **Slot:** {r['slot_description']}")
        lines.append(f"- **Aspect ratio:** {r['aspect_ratio']}")
        if r.get("subject"):
            lines.append(f"- **Subject:** {r['subject']}")
        if r.get("higgsfield_job_id"):
            lines.append(f"- **Job ID:** `{r['higgsfield_job_id']}`")
        lines.append("")

    lines.append("---\n")
    lines.append("## QC checklist\n")
    lines.append("1. Hands and fingers · count digits, check thumb position")
    lines.append("2. Eyes · both pupils visible, same color, no extra reflections")
    lines.append("3. Hair texture on Black and mixed-race subjects looks natural, not waxy")
    lines.append("4. Skin tones · warm undertones, no gray")
    lines.append("5. Text artifacts · meaningful structures, not melted gibberish")
    lines.append("6. Cohesion · lay all images out as a contact sheet; regenerate outliers")
    lines.append("\n*End of reference guide.*\n")

    out_path.write_text("\n".join(lines))


def main():
    if len(sys.argv) < 3:
        print("Usage: generate_manifest.py <spec.json> <output_dir>", file=sys.stderr)
        sys.exit(1)

    spec_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    with spec_path.open() as f:
        spec = json.load(f)

    rows = build_csv_rows(spec)
    module_num = spec["module_num"]
    lesson_num = spec["lesson_num"]

    csv_path = out_dir / f"Lesson_{module_num}_{lesson_num}_Image_Reference.csv"
    md_path = out_dir / f"Lesson_{module_num}_{lesson_num}_Image_Reference.md"

    write_csv(rows, csv_path)
    write_md(rows, spec, md_path)

    print(f"Wrote {csv_path} ({len(rows)} rows)")
    print(f"Wrote {md_path}")


if __name__ == "__main__":
    main()
