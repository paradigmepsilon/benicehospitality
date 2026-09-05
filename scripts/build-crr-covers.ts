/**
 * Render the covers for Alex's two car rental books, deterministically, from
 * HTML: no image credits, no design tool, reproducible on any machine that has
 * the repo's Playwright chromium.
 *
 *   The Inside Lane            (paid, $32)   -> car-rental-riches-blueprint
 *   Before You Buy the Car     (free magnet) -> before-you-buy-the-car
 *
 * Run:
 *   npm run crr-covers:build
 *
 * Outputs, per book:
 *   <build dir>/cover.png   1600 x 2400 master (the book pipeline embeds this
 *                           as the PDF's first page and the ePub cover image)
 *   <build dir>/cover.jpg   same master as JPEG, the format KDP asks for
 *   public/images/<name>.webp   1400 x 2100 for the site (sales page, landing
 *                               page, Open Graph), same dimensions the RRR
 *                               Blueprint cover uses
 *
 * Fonts: Playfair Display + DM Sans, read from ~/Library/Fonts when present
 * (they are the site's display and body faces). If a file is missing the
 * cover falls back to Georgia / Helvetica, and says so, rather than failing.
 *
 * Design: BNHG signature palette only (deep teal, warm gold, cream, near
 * black). The paid book is dark with a converging-lane motif; the free guide
 * is the same family on a cream ground so the two read as a set but never as
 * the same product. No dashes of either kind anywhere in the copy.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const CRR_ROOT = "/Users/alexhenry/Projects/Car Rental Riches/04_Book";
const REPO_ROOT = path.resolve(__dirname, "..");
const PUBLIC_IMAGES = path.join(REPO_ROOT, "public", "images");

const MASTER_W = 1600;
const MASTER_H = 2400;
const SITE_W = 1400;
const SITE_H = 2100;

// Palette (src/app/globals.css)
const TEAL = "#1A4D4F";
const GOLD = "#B08D57";
const GOLD_LIGHT = "#D4B894";
const CREAM = "#FAF8F3";
const NEAR_BLACK = "#1a1a1a";
const CHARCOAL = "#2C3E50";

interface CoverSpec {
  key: string;
  buildDir: string;
  siteFile: string;
  html: string;
}

// --- Fonts -------------------------------------------------------------------

function fontFace(family: string, file: string, style: "normal" | "italic"): string {
  const abs = path.join(homedir(), "Library", "Fonts", file);
  if (!existsSync(abs)) {
    console.warn(`  font missing, falling back: ${abs}`);
    return "";
  }
  const b64 = readFileSync(abs).toString("base64");
  // Variable TTFs: declare the whole weight range so bold/semibold resolve.
  return `@font-face{font-family:"${family}";font-style:${style};font-weight:100 900;src:url(data:font/ttf;base64,${b64}) format("truetype");}`;
}

function fontCss(): string {
  return [
    fontFace("Playfair Display", "PlayfairDisplay.ttf", "normal"),
    fontFace("Playfair Display", "PlayfairDisplay-Italic.ttf", "italic"),
    fontFace("DM Sans", "DMSans.ttf", "normal"),
  ].join("\n");
}

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${MASTER_W}px; height: ${MASTER_H}px; overflow: hidden; }
  body { -webkit-font-smoothing: antialiased; }
  .display { font-family: "Playfair Display", Georgia, "Times New Roman", serif; }
  .sans { font-family: "DM Sans", Helvetica, Arial, sans-serif; }
  .cover { position: relative; width: ${MASTER_W}px; height: ${MASTER_H}px; overflow: hidden; }
  .eyebrow { font-size: 30px; font-weight: 600; letter-spacing: 0.34em; text-transform: uppercase; }
  .rule { height: 4px; width: 180px; background: ${GOLD}; }
`;

// --- The Inside Lane ---------------------------------------------------------

/**
 * Two lane lines converge toward a vanishing point in the upper right; the
 * inside lane carries the gold dashes. The road sits behind the type, low in
 * the frame, so the title stays the loudest thing on the cover.
 */
function laneMotifSvg(): string {
  return `<svg viewBox="0 0 1600 2400" width="1600" height="2400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="fade" x1="0" y1="1" x2="0.55" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="goldfade" x1="0" y1="1" x2="0.55" y2="0">
        <stop offset="0" stop-color="${GOLD}" stop-opacity="0.95"/>
        <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- outer edges of the road -->
    <path d="M -80 2400 L 1265 705" stroke="url(#fade)" stroke-width="7" fill="none"/>
    <path d="M 1120 2400 L 1265 705" stroke="url(#fade)" stroke-width="7" fill="none"/>
    <!-- the lane divider: the inside lane is between it and the left edge -->
    <path d="M 560 2400 L 1265 705" stroke="url(#goldfade)" stroke-width="10" fill="none" stroke-dasharray="120 70" stroke-linecap="round"/>
  </svg>`;
}

function insideLaneHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss()}
${BASE_CSS}
.cover { background: radial-gradient(120% 90% at 20% 15%, #245e60 0%, ${TEAL} 45%, #123536 78%, ${NEAR_BLACK} 100%); color: #ffffff; }
.motif { position: absolute; inset: 0; }
.top { position: absolute; top: 120px; left: 130px; right: 130px; display: flex; align-items: center; justify-content: space-between; color: ${GOLD_LIGHT}; }
.top .brand { color: ${GOLD}; }
.titleblock { position: absolute; left: 130px; right: 130px; top: 470px; }
.title { font-size: 236px; line-height: 0.92; font-weight: 600; letter-spacing: -0.02em; }
.title em { font-style: italic; color: ${GOLD_LIGHT}; }
.rule { margin: 74px 0 58px; }
.subtitle { font-size: 52px; line-height: 1.24; font-weight: 400; color: rgba(255,255,255,0.86); max-width: 1180px; }
.subtitle strong { font-weight: 600; color: #ffffff; }
.bottom { position: absolute; left: 130px; right: 130px; bottom: 140px; display: flex; align-items: flex-end; justify-content: space-between; }
.author { font-size: 74px; font-weight: 600; letter-spacing: 0.04em; line-height: 1; }
.role { font-size: 30px; color: rgba(255,255,255,0.7); margin-top: 20px; letter-spacing: 0.02em; }
.publisher { text-align: right; color: ${GOLD}; }
.publisher .eyebrow { font-size: 26px; }
.publisher .sub { font-size: 24px; color: rgba(255,255,255,0.55); margin-top: 14px; letter-spacing: 0.08em; }
</style></head><body>
<div class="cover">
  <div class="motif">${laneMotifSvg()}</div>
  <div class="top sans">
    <span class="eyebrow brand">Car Rental Riches</span>
    <span class="eyebrow">Operator to operator</span>
  </div>
  <div class="titleblock">
    <h1 class="display title">The<br/><em>Inside</em><br/>Lane</h1>
    <div class="rule"></div>
    <p class="sans subtitle">What Turo, the rental giants, and the gurus <strong>won&rsquo;t tell you</strong> about building a car rental business, from one car to fifty.</p>
  </div>
  <div class="bottom">
    <div>
      <p class="display author">Alex Henry</p>
      <p class="sans role">Operator, Be Nice Autos</p>
    </div>
    <div class="publisher sans">
      <p class="eyebrow">Be Nice Hospitality Group</p>
      <p class="sub">THE OPERATOR&rsquo;S COMPANY</p>
    </div>
  </div>
</div>
</body></html>`;
}

// --- Before You Buy the Car --------------------------------------------------

function keyMotifSvg(): string {
  // A plain key outline, gold, low right: the object the reader is about to
  // be handed. Drawn with strokes so it stays crisp at any size.
  return `<svg viewBox="0 0 520 220" width="520" height="220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="none" stroke="${GOLD}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="90" cy="110" r="68"/>
      <circle cx="90" cy="110" r="22"/>
      <path d="M 158 110 H 500"/>
      <path d="M 430 110 V 170"/>
      <path d="M 372 110 V 150"/>
      <path d="M 486 110 V 160"/>
    </g>
  </svg>`;
}

function beforeYouBuyHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss()}
${BASE_CSS}
.cover { background: ${CREAM}; color: ${TEAL}; }
.band { position: absolute; left: 0; right: 0; top: 0; height: 150px; background: ${TEAL}; }
.band .inner { position: absolute; left: 130px; right: 130px; top: 0; height: 150px; display: flex; align-items: center; justify-content: space-between; color: ${GOLD_LIGHT}; }
.band .brand { color: ${GOLD}; }
.pill { position: absolute; top: 260px; left: 130px; background: ${GOLD}; color: ${NEAR_BLACK}; font-size: 30px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; padding: 22px 38px; border-radius: 999px; }
.twelve { position: absolute; right: 90px; top: 330px; font-size: 640px; line-height: 0.8; font-weight: 700; color: ${TEAL}; opacity: 0.07; letter-spacing: -0.06em; }
.titleblock { position: absolute; left: 130px; right: 130px; top: 720px; }
.title { font-size: 190px; line-height: 0.95; font-weight: 600; letter-spacing: -0.02em; color: ${TEAL}; }
.title em { font-style: italic; color: ${GOLD}; }
.rule { margin: 70px 0 54px; }
.subtitle { font-size: 54px; line-height: 1.22; color: ${CHARCOAL}; max-width: 1220px; }
.subtitle strong { font-weight: 600; color: ${TEAL}; }
.key { position: absolute; right: 130px; bottom: 300px; }
.bottom { position: absolute; left: 130px; right: 130px; bottom: 130px; display: flex; align-items: flex-end; justify-content: space-between; }
.author { font-size: 70px; font-weight: 600; letter-spacing: 0.04em; line-height: 1; color: ${TEAL}; }
.role { font-size: 30px; color: ${CHARCOAL}; opacity: 0.75; margin-top: 18px; }
.from { font-size: 28px; color: ${CHARCOAL}; opacity: 0.75; margin-top: 12px; }
.from em { font-style: italic; }
.publisher { text-align: right; color: ${GOLD}; }
.publisher .eyebrow { font-size: 26px; }
</style></head><body>
<div class="cover">
  <div class="band"><div class="inner sans">
    <span class="eyebrow brand">Car Rental Riches</span>
    <span class="eyebrow">A free guide</span>
  </div></div>
  <div class="pill sans">Free guide</div>
  <div class="twelve display">12</div>
  <div class="titleblock">
    <h1 class="display title">Before<br/>You Buy<br/>the <em>Car</em></h1>
    <div class="rule"></div>
    <p class="sans subtitle"><strong>Twelve things</strong> nobody tells you before you rent out your first vehicle.</p>
  </div>
  <div class="key">${keyMotifSvg()}</div>
  <div class="bottom">
    <div>
      <p class="display author">Alex Henry</p>
      <p class="sans role">Operator, Be Nice Autos</p>
      <p class="sans from">From the author of <em>The Inside Lane</em></p>
    </div>
    <div class="publisher sans">
      <p class="eyebrow">Be Nice Hospitality Group</p>
    </div>
  </div>
</div>
</body></html>`;
}

// --- Render ------------------------------------------------------------------

const COVERS: CoverSpec[] = [
  {
    key: "The Inside Lane",
    buildDir: path.join(CRR_ROOT, "build"),
    siteFile: "crr_blueprint_cover.webp",
    html: insideLaneHtml(),
  },
  {
    key: "Before You Buy the Car",
    buildDir: path.join(CRR_ROOT, "build_free_ebook"),
    siteFile: "crr_free_ebook_cover.webp",
    html: beforeYouBuyHtml(),
  },
];

async function main() {
  const browser = await chromium.launch();
  try {
    for (const c of COVERS) {
      console.log(`${c.key}`);
      mkdirSync(c.buildDir, { recursive: true });
      const page = await browser.newPage({
        viewport: { width: MASTER_W, height: MASTER_H },
        deviceScaleFactor: 1,
      });
      await page.setContent(c.html, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const png = await page.screenshot({ type: "png", fullPage: false });
      await page.close();

      const masterPng = path.join(c.buildDir, "cover.png");
      const masterJpg = path.join(c.buildDir, "cover.jpg");
      const site = path.join(PUBLIC_IMAGES, c.siteFile);

      writeFileSync(masterPng, png);
      await sharp(png).jpeg({ quality: 92 }).toFile(masterJpg);
      await sharp(png)
        .resize(SITE_W, SITE_H, { fit: "fill" })
        .webp({ quality: 88 })
        .toFile(site);

      console.log(`  ${masterPng}`);
      console.log(`  ${masterJpg}`);
      console.log(`  ${site}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
