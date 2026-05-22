#!/usr/bin/env python3
"""
optimize_images.py — Convert PNG masters to WEBP for the Bundle folder.

Usage:
    python3 optimize_images.py <src_images_dir> <dest_images_dir> [--quality 85]

The Editorial player references images at relative paths like `images/L2-6_S01_01_cover_hero.webp`
which resolve inside the Bundle folder. The top-level `images/` folder keeps the PNG masters
for archival and regeneration. This script syncs PNGs from the master folder into WEBPs in
the Bundle folder.

Default quality 85 — visually identical to PNG at roughly 12-18% of the file size.
"""
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Run: pip3 install pillow", file=sys.stderr)
    sys.exit(1)


def optimize_one(src_path: Path, dest_path: Path, quality: int = 85) -> dict:
    """Convert one PNG to WEBP. Returns stats."""
    if not src_path.exists():
        raise FileNotFoundError(src_path)

    dest_path.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(src_path)
    # Convert to RGB if necessary (WEBP supports RGBA but for editorial photos, RGB is smaller)
    if img.mode in ("RGBA", "LA"):
        # Composite alpha onto a cream background to preserve appearance
        bg = Image.new("RGB", img.size, (248, 246, 241))
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.save(dest_path, "WEBP", quality=quality, method=6)

    src_size = src_path.stat().st_size
    dest_size = dest_path.stat().st_size
    return {
        "src": src_path.name,
        "dest": dest_path.name,
        "src_kb": src_size // 1024,
        "dest_kb": dest_size // 1024,
        "ratio": dest_size / src_size if src_size else 0,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src", help="Source directory of PNG masters")
    p.add_argument("dest", help="Destination directory for WEBP outputs")
    p.add_argument("--quality", type=int, default=85, help="WEBP quality (1-100, default 85)")
    args = p.parse_args()

    src_dir = Path(args.src)
    dest_dir = Path(args.dest)

    if not src_dir.is_dir():
        print(f"Source not a directory: {src_dir}", file=sys.stderr)
        sys.exit(1)

    pngs = sorted(src_dir.glob("*.png"))
    if not pngs:
        print(f"No PNGs in {src_dir}", file=sys.stderr)
        sys.exit(1)

    total_src = total_dest = 0
    for png in pngs:
        webp = dest_dir / png.with_suffix(".webp").name
        try:
            s = optimize_one(png, webp, quality=args.quality)
            total_src += s["src_kb"]
            total_dest += s["dest_kb"]
            print(f"  {s['src']:48s} {s['src_kb']:5d}KB -> {s['dest_kb']:5d}KB  ({s['ratio'] * 100:.0f}%)")
        except Exception as e:
            print(f"  FAIL {png.name}: {e}", file=sys.stderr)

    if total_src:
        print(f"\nTotal: {total_src // 1024}MB -> {total_dest // 1024}MB ({total_dest / total_src * 100:.0f}%)")


if __name__ == "__main__":
    main()
