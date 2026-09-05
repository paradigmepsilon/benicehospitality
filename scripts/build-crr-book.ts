/**
 * Build "The Inside Lane" (Alex's car rental business book, formerly titled
 * "The Car Rental Riches Blueprint") as PDF + ePub from the manuscript
 * markdown chapters. Also builds the free ebook via env overrides (below).
 *
 * Run:
 *   npm run crr-book:build
 *   npm run crr-book:build -- --allow-drafts   (build with DRAFT watermark)
 *
 * Source:  CRR_BOOK_SRC or the default manuscript folder below.
 *          Chapter files match chapter_NN_<slug>.md and are sorted by
 *          filename, so chapter_00_front_matter.md sorts first and
 *          chapter_99_back_matter.md sorts last if present.
 * Output:  CRR_BOOK_OUT or the default build folder below.
 *          <slug>.pdf / <slug>.epub (plus epub-src staging); slug defaults
 *          to car-rental-riches-blueprint (CRR_BOOK_SLUG overrides).
 *
 * Guards:
 *   - Refuses to build if any "[ALEX INPUT" / "[VERIFY" / "[PRODUCTION GATE" draft markers remain,
 *     unless --allow-drafts is passed (then a DRAFT watermark + notice page
 *     is added to both formats).
 *   - Always hard-fails on U+2014 / U+2013 characters (banned in this book),
 *     even with --allow-drafts.
 *
 * Cover: if <out>/cover.png exists (rendered by scripts/build-crr-covers.ts,
 * `npm run crr-covers:build`), it becomes the PDF's first page and the ePub's
 * cover image. CRR_BOOK_COVER overrides the path. Without it, the typographic
 * title page stands alone, as before.
 *
 * No network, no database, no Stripe. PDF is rendered with the repo's
 * Playwright chromium; the ePub is zipped with the macOS system `zip`; the
 * cover page is joined onto the PDF with the macOS Automator `join` tool
 * (already the platform assumption `zip` makes). If that tool is missing the
 * build still succeeds, without the cover page, and says so.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { marked } from "marked";
import { chromium } from "playwright";

const DEFAULT_SRC = "/Users/alexhenry/Projects/Car Rental Riches/04_Book/manuscript";
const DEFAULT_OUT = "/Users/alexhenry/Projects/Car Rental Riches/04_Book/build";

const SRC = process.env.CRR_BOOK_SRC || DEFAULT_SRC;
const OUT = process.env.CRR_BOOK_OUT || DEFAULT_OUT;
const ALLOW_DRAFTS = process.argv.includes("--allow-drafts");
const COVER = process.env.CRR_BOOK_COVER || path.join(OUT, "cover.png");
const PDF_JOIN =
  "/System/Library/Automator/Combine PDF Pages.action/Contents/MacOS/join";

// Title, subtitle, output slug, and ePub identity can be overridden so the
// same pipeline builds the free ebook ("Before You Buy the Car") from its own
// manuscript folder:
//   CRR_BOOK_SRC=".../04_Book/free_ebook" CRR_BOOK_SLUG=before-you-buy-the-car \
//   CRR_BOOK_TITLE="Before You Buy the Car" CRR_BOOK_SUBTITLE="..." \
//   npm run crr-book:build -- --allow-drafts
const TITLE = process.env.CRR_BOOK_TITLE || "The Inside Lane";
const SUBTITLE =
  process.env.CRR_BOOK_SUBTITLE ||
  "What Turo, the Rental Giants, and the Gurus Won't Tell You About Building a Car Rental Business, From One Car to Fifty";
const AUTHOR = "Alex Henry";
const PUBLISHER = "Be Nice Hospitality Group";
// Output basename. The paid book keeps the legacy slug so the download rails
// and blob keys in src/lib/crr-blueprint.ts stay valid.
const SLUG = process.env.CRR_BOOK_SLUG || "car-rental-riches-blueprint";
// Stable identifier so re-builds keep the same book identity in readers. The
// free ebook gets its own identity so readers never treat it as an update to
// the paid book.
const EPUB_UUID =
  SLUG === "car-rental-riches-blueprint"
    ? "urn:uuid:7c9e4b2a-51d3-4f8e-9a06-c3d2b1a0e5f4"
    : `urn:uuid:5b1d0e9c-2f47-4a63-8e1b-${SLUG.replace(/[^a-z0-9]/g, "").padEnd(12, "0").slice(0, 12)}`;

const DASH_RE = /[–—]/; // en dash, em dash: banned in this book

interface Chapter {
  file: string;
  /** Full H1 text, e.g. "Chapter 1: The $874 Question" */
  heading: string;
  /** "Chapter N" label if the H1 carries one, else null (front/back matter). */
  label: string | null;
  /** Title portion after the label, or the full heading when no label. */
  title: string;
  /** Markdown body with the H1 removed. */
  bodyMd: string;
  bodyHtml: string;
  draftMarkers: number;
  words: number;
}

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function loadChapters(): Chapter[] {
  if (!existsSync(SRC)) {
    fail(`Manuscript folder not found:\n  ${SRC}\nSet CRR_BOOK_SRC to override.`);
  }
  const files = readdirSync(SRC)
    .filter((f) => /^chapter_\d{2}_.+\.md$/.test(f))
    .sort(); // lexicographic: 00 front matter first, 99 back matter last
  if (files.length === 0) {
    fail(`No chapter_NN_*.md files found in:\n  ${SRC}`);
  }

  // ---- hard guard: banned dash characters (fails even with --allow-drafts)
  const dashHits: string[] = [];
  const rawByFile = new Map<string, string>();
  for (const f of files) {
    const raw = readFileSync(path.join(SRC, f), "utf8");
    rawByFile.set(f, raw);
    raw.split("\n").forEach((line, i) => {
      if (DASH_RE.test(line)) dashHits.push(`  ${f}:${i + 1}`);
    });
  }
  if (dashHits.length > 0) {
    fail(
      `BUILD BLOCKED: U+2014 / U+2013 characters are banned in this book.\n` +
        `Found on:\n${dashHits.join("\n")}\nFix the manuscript, then rebuild.`,
    );
  }

  // ---- draft-marker guard
  const chapters: Chapter[] = [];
  let totalMarkers = 0;
  const markerLines: string[] = [];
  for (const f of files) {
    const raw = rawByFile.get(f)!;
    const markers =
      (raw.match(/\[ALEX INPUT/g)?.length ?? 0) +
      (raw.match(/\[VERIFY/g)?.length ?? 0) +
      (raw.match(/\[PRODUCTION GATE/g)?.length ?? 0);
    totalMarkers += markers;
    if (markers > 0) markerLines.push(`  ${f}: ${markers}`);

    const h1 = raw.match(/^#\s+(.+?)\s*$/m);
    const heading = h1 ? h1[1].trim() : path.basename(f, ".md");
    const bodyMd = h1 ? raw.replace(h1[0], "").trim() : raw.trim();
    const labelMatch = heading.match(/^(Chapter\s+\d+)\s*[:–—-]\s*(.+)$/i);
    chapters.push({
      file: f,
      heading,
      label: labelMatch ? labelMatch[1] : null,
      title: labelMatch ? labelMatch[2] : heading,
      bodyMd,
      bodyHtml: mdToHtml(bodyMd),
      draftMarkers: markers,
      words: countWords(bodyMd),
    });
  }

  if (totalMarkers > 0 && !ALLOW_DRAFTS) {
    fail(
      `BUILD BLOCKED: ${totalMarkers} draft marker(s) ([ALEX INPUT / [VERIFY / [PRODUCTION GATE) remain:\n` +
        `${markerLines.join("\n")}\n` +
        `Resolve them, or re-run with --allow-drafts to build a watermarked draft.`,
    );
  }
  if (totalMarkers > 0) {
    console.log(`Building DRAFT (${totalMarkers} draft markers present):`);
    console.log(markerLines.join("\n"));
  }
  return chapters;
}

function mdToHtml(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string;
}

function countWords(md: string): number {
  return md
    .replace(/[#*_>|`]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Shared book CSS (system serif only; no external resources)
// ---------------------------------------------------------------------------

const INK = "#2e2c29"; // charcoal
const GOLD = "#a8843c"; // restrained warm gold

const BOOK_CSS = `
body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.55;
  color: ${INK};
  margin: 0;
}
p { margin: 0 0 0.7em 0; text-align: justify; hyphens: auto; }
h2 {
  font-size: 13.5pt;
  font-weight: 700;
  margin: 1.6em 0 0.5em 0;
  color: ${INK};
  page-break-after: avoid;
  break-after: avoid;
  text-align: left;
}
h3 {
  font-size: 11.5pt;
  font-weight: 700;
  margin: 1.3em 0 0.4em 0;
  page-break-after: avoid;
  break-after: avoid;
  text-align: left;
}
ul, ol { margin: 0 0 0.8em 0; padding-left: 1.4em; }
li { margin-bottom: 0.25em; }
blockquote {
  margin: 0.9em 0.9em;
  padding-left: 0.8em;
  border-left: 2pt solid ${GOLD};
  font-style: italic;
}
strong { font-weight: 700; }
code {
  font-family: Menlo, Courier, monospace;
  font-size: 9.5pt;
  background: #f4f1ea;
  padding: 0 2pt;
}
pre {
  font-family: Menlo, Courier, monospace;
  font-size: 9pt;
  background: #f4f1ea;
  padding: 6pt 8pt;
  overflow-x: auto;
  white-space: pre-wrap;
}
hr { border: 0; border-top: 0.5pt solid ${GOLD}; margin: 1.4em 20%; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.9em 0 1em 0;
  font-size: 9.5pt;
  line-height: 1.35;
  page-break-inside: auto;
}
th {
  border-bottom: 1.2pt solid ${INK};
  padding: 3pt 6pt;
  text-align: left;
  font-weight: 700;
}
td { border-bottom: 0.5pt solid #cfc8bb; padding: 3pt 6pt; vertical-align: top; }
tr { page-break-inside: avoid; break-inside: avoid; }

.chapter { page-break-before: always; break-before: page; }
.chapter-open { margin: 1.2in 0 0.55in 0; text-align: left; }
.chapter-label {
  font-size: 10pt;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${GOLD};
  margin: 0 0 0.35em 0;
}
.chapter-title {
  font-size: 21pt;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 0.45em 0;
  color: ${INK};
}
.chapter-rule {
  border: 0;
  border-top: 1.5pt solid ${GOLD};
  width: 1.1in;
  margin: 0;
}

.title-page {
  text-align: center;
  page-break-after: always;
  break-after: page;
}
.tp-space { height: 1.9in; }
.tp-title { font-size: 26pt; font-weight: 700; line-height: 1.15; margin: 0 0 0.5em 0; }
.tp-rule { border: 0; border-top: 1.5pt solid ${GOLD}; width: 1.4in; margin: 0 auto 1.6em auto; }
.tp-subtitle { font-size: 12.5pt; font-style: italic; margin: 0 0 2.6in 0; text-align: center; }
.tp-author { font-size: 14pt; letter-spacing: 0.08em; margin: 0 0 0.3em 0; text-align: center; }
.tp-publisher {
  font-size: 9.5pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${GOLD};
  text-align: center;
}

.draft-notice {
  page-break-before: always;
  break-before: page;
  margin-top: 2in;
  text-align: center;
}
.draft-notice h2 { text-align: center; color: #8a2f24; font-size: 16pt; letter-spacing: 0.1em; }
.draft-notice p { text-align: center; font-size: 10.5pt; }
`;

const PRINT_CSS = `
@page {
  size: 6in 9in;
  margin: 0.75in 0.7in 0.8in 0.7in;
  @bottom-center { content: counter(page); font-family: Georgia, serif; font-size: 9pt; }
}
`;

// ---------------------------------------------------------------------------
// Combined HTML document (for the PDF)
// ---------------------------------------------------------------------------

function chapterOpenHtml(ch: Chapter): string {
  return `<header class="chapter-open">
${ch.label ? `<p class="chapter-label">${esc(ch.label)}</p>` : ""}
<h1 class="chapter-title">${esc(ch.title)}</h1>
<hr class="chapter-rule" />
</header>`;
}

function draftNoticeHtml(totalMarkers: number): string {
  return `<section class="draft-notice">
<h2>DRAFT COPY</h2>
<p>This build contains ${totalMarkers} unresolved draft marker(s) ([ALEX INPUT] / [VERIFY]).</p>
<p>Not for sale or distribution. Numbers and claims in this copy are not final.</p>
</section>`;
}

function buildCombinedHtml(chapters: Chapter[], draftMode: boolean): string {
  const totalMarkers = chapters.reduce((n, c) => n + c.draftMarkers, 0);
  const sections = chapters
    .map((ch) => `<section class="chapter">\n${chapterOpenHtml(ch)}\n${ch.bodyHtml}\n</section>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(TITLE)}</title>
<style>${BOOK_CSS}\n${PRINT_CSS}</style>
</head>
<body>
<section class="title-page">
  <div class="tp-space"></div>
  <h1 class="tp-title">${esc(TITLE)}</h1>
  <hr class="tp-rule" />
  <p class="tp-subtitle">${esc(SUBTITLE)}</p>
  <p class="tp-author">${esc(AUTHOR)}</p>
  <p class="tp-publisher">${esc(PUBLISHER)}</p>
</section>
${draftMode ? draftNoticeHtml(totalMarkers) : ""}
${sections}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// PDF via Playwright chromium
// ---------------------------------------------------------------------------

async function buildPdf(html: string, pdfPath: string, draftMode: boolean): Promise<void> {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/executable doesn't exist|browserType\.launch|install/i.test(msg)) {
      console.error(
        "Playwright's chromium browser is not installed. Install it with:\n\n" +
          "  npx playwright install chromium\n\n" +
          "then re-run: npm run crr-book:build",
      );
      process.exit(1);
    }
    throw err;
  }
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: pdfPath,
      width: "6in",
      height: "9in",
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      margin: { top: "0.75in", bottom: "0.8in", left: "0.7in", right: "0.7in" },
      headerTemplate: draftMode
        ? `<div style="font-family:Georgia,serif;font-size:9px;width:100%;text-align:center;color:#8a2f24;letter-spacing:2px;">DRAFT, not for sale</div>`
        : `<div></div>`,
      footerTemplate: `<div style="font-family:Georgia,serif;font-size:9px;width:100%;text-align:center;color:${INK};"><span class="pageNumber"></span></div>`,
    });
  } finally {
    await browser.close();
  }
}

/**
 * The cover as a one-page, full-bleed PDF, then joined in front of the body.
 * Rendering it inside the main document would put it inside the page margins
 * and under the page-number footer; a separate render keeps it edge to edge.
 * Returns false (and leaves the body PDF untouched) when the join tool is
 * unavailable, so a non-macOS build still produces a sellable file.
 */
async function prependCover(pdfPath: string, coverPath: string): Promise<boolean> {
  if (!existsSync(PDF_JOIN)) {
    console.warn(`Cover skipped: PDF join tool not found at ${PDF_JOIN}`);
    return false;
  }
  const coverPdf = path.join(OUT, "cover-page.pdf");
  const bodyPdf = path.join(OUT, "body-only.pdf");
  const b64 = readFileSync(coverPath).toString("base64");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page { size: 6in 9in; margin: 0; }
html, body { margin: 0; padding: 0; }
img { display: block; width: 6in; height: 9in; object-fit: cover; }
</style></head><body><img src="data:image/png;base64,${b64}" alt="" /></body></html>`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: coverPdf,
      width: "6in",
      height: "9in",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
  } finally {
    await browser.close();
  }

  rmSync(bodyPdf, { force: true });
  execFileSync("mv", [pdfPath, bodyPdf]);
  try {
    execFileSync(PDF_JOIN, ["-o", pdfPath, coverPdf, bodyPdf], { stdio: "pipe" });
  } catch (err) {
    // Put the body back so the build still yields a complete book.
    execFileSync("mv", [bodyPdf, pdfPath]);
    console.warn(`Cover skipped: join failed (${err instanceof Error ? err.message : err})`);
    return false;
  }
  rmSync(bodyPdf, { force: true });
  rmSync(coverPdf, { force: true });
  return true;
}

/** Count pages by scanning the PDF's page objects; 0 if the scan finds none. */
function pdfPageCount(pdfPath: string): number {
  const s = readFileSync(pdfPath).toString("latin1");
  return (s.match(/\/Type\s*\/Page[^s]/g) || []).length;
}

// ---------------------------------------------------------------------------
// EPUB 3 (no extra dependencies; zipped with the system `zip` binary)
// ---------------------------------------------------------------------------

/** Convert marked's HTML output to XHTML that an EPUB reader will accept. */
function htmlToXhtml(html: string): string {
  let out = html;
  // Self-close void elements: <br>, <hr>, <img src=".."> etc.
  out = out.replace(
    /<(br|hr|img|input|meta|link|source|col|area|embed|track|wbr)((?:[^>"']|"[^"]*"|'[^']*')*?)\s*\/?>/gi,
    (_m, tag, attrs) => `<${tag}${attrs} />`,
  );
  // Bare boolean attributes on inputs (task lists) -> XHTML form.
  out = out.replace(/(<input[^>]*?)\b(checked|disabled)(?=[\s/>])/gi, `$1$2="$2"`);
  // Legacy align attribute (older table renderers) -> inline style.
  out = out.replace(/ align="(left|center|right)"/gi, ` style="text-align:$1"`);
  return out;
}

function xhtmlDoc(title: string, bodyHtml: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head>
<title>${esc(title)}</title>
<link rel="stylesheet" type="text/css" href="../css/book.css" />
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function buildEpub(chapters: Chapter[], epubPath: string, draftMode: boolean): void {
  const totalMarkers = chapters.reduce((n, c) => n + c.draftMarkers, 0);
  const staging = path.join(OUT, "epub-src");
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(path.join(staging, "META-INF"), { recursive: true });
  mkdirSync(path.join(staging, "OEBPS", "text"), { recursive: true });
  mkdirSync(path.join(staging, "OEBPS", "css"), { recursive: true });

  // mimetype: exact content, no trailing newline (must be the first, stored entry)
  writeFileSync(path.join(staging, "mimetype"), "application/epub+zip");

  writeFileSync(
    path.join(staging, "META-INF", "container.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
  );

  // ePub CSS: book CSS minus the print-only @page rules.
  writeFileSync(path.join(staging, "OEBPS", "css", "book.css"), BOOK_CSS);

  // Cover image (optional): readers show it in the library and as page one.
  const hasCover = existsSync(COVER);
  if (hasCover) {
    mkdirSync(path.join(staging, "OEBPS", "images"), { recursive: true });
    writeFileSync(
      path.join(staging, "OEBPS", "images", "cover.png"),
      readFileSync(COVER),
    );
    writeFileSync(
      path.join(staging, "OEBPS", "text", "cover.xhtml"),
      `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head>
<title>Cover</title>
<style type="text/css">body{margin:0;padding:0;text-align:center;} img{max-width:100%;max-height:100%;}</style>
</head>
<body epub:type="cover">
<section epub:type="cover"><img src="../images/cover.png" alt="${esc(TITLE)}" /></section>
</body>
</html>
`,
    );
  }

  // Title page
  const titleBody = `<section class="title-page" epub:type="titlepage">
<h1 class="tp-title">${esc(TITLE)}</h1>
<hr class="tp-rule" />
<p class="tp-subtitle">${esc(SUBTITLE)}</p>
<p class="tp-author">${esc(AUTHOR)}</p>
<p class="tp-publisher">${esc(PUBLISHER)}</p>
</section>`;
  writeFileSync(
    path.join(staging, "OEBPS", "text", "titlepage.xhtml"),
    xhtmlDoc(TITLE, htmlToXhtml(titleBody)),
  );

  if (draftMode) {
    writeFileSync(
      path.join(staging, "OEBPS", "text", "draft-notice.xhtml"),
      xhtmlDoc("Draft Notice", htmlToXhtml(draftNoticeHtml(totalMarkers))),
    );
  }

  // Chapters
  const items: Array<{ id: string; href: string; navLabel: string }> = [];
  chapters.forEach((ch, i) => {
    const id = `ch${String(i + 1).padStart(2, "0")}`;
    const href = `text/${id}.xhtml`;
    const body = `<section class="chapter" epub:type="chapter">
${chapterOpenHtml(ch)}
${ch.bodyHtml}
</section>`;
    writeFileSync(
      path.join(staging, "OEBPS", href),
      xhtmlDoc(ch.heading, htmlToXhtml(body)),
    );
    items.push({ id, href, navLabel: ch.heading });
  });

  // nav.xhtml
  const navItems = [
    ...(hasCover ? [`<li><a href="text/cover.xhtml">Cover</a></li>`] : []),
    `<li><a href="text/titlepage.xhtml">${esc(TITLE)}</a></li>`,
    ...(draftMode ? [`<li><a href="text/draft-notice.xhtml">Draft Notice</a></li>`] : []),
    ...items.map((it) => `<li><a href="${it.href}">${esc(it.navLabel)}</a></li>`),
  ].join("\n      ");
  writeFileSync(
    path.join(staging, "OEBPS", "nav.xhtml"),
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head>
<title>Contents</title>
<link rel="stylesheet" type="text/css" href="css/book.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h2>Contents</h2>
    <ol>
      ${navItems}
    </ol>
  </nav>
</body>
</html>
`,
  );

  // content.opf
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="css/book.css" media-type="text/css"/>`,
    ...(hasCover
      ? [
          `<item id="cover-image" href="images/cover.png" media-type="image/png" properties="cover-image"/>`,
          `<item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml"/>`,
        ]
      : []),
    `<item id="titlepage" href="text/titlepage.xhtml" media-type="application/xhtml+xml"/>`,
    ...(draftMode
      ? [`<item id="draftnotice" href="text/draft-notice.xhtml" media-type="application/xhtml+xml"/>`]
      : []),
    ...items.map(
      (it) => `<item id="${it.id}" href="${it.href}" media-type="application/xhtml+xml"/>`,
    ),
  ].join("\n    ");
  const spineItems = [
    ...(hasCover ? [`<itemref idref="cover" linear="no"/>`] : []),
    `<itemref idref="titlepage"/>`,
    ...(draftMode ? [`<itemref idref="draftnotice"/>`] : []),
    ...items.map((it) => `<itemref idref="${it.id}"/>`),
  ].join("\n    ");
  writeFileSync(
    path.join(staging, "OEBPS", "content.opf"),
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${EPUB_UUID}</dc:identifier>
    <dc:title>${esc(TITLE)}${draftMode ? " (DRAFT)" : ""}</dc:title>
    <dc:creator>${esc(AUTHOR)}</dc:creator>
    <dc:publisher>${esc(PUBLISHER)}</dc:publisher>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
    ${hasCover ? `<meta name="cover" content="cover-image"/>` : ""}
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>
`,
  );

  // Zip: mimetype first, stored uncompressed, then the rest.
  rmSync(epubPath, { force: true });
  execFileSync("zip", ["-X0", epubPath, "mimetype"], { cwd: staging, stdio: "pipe" });
  execFileSync("zip", ["-Xr9D", epubPath, "META-INF", "OEBPS"], { cwd: staging, stdio: "pipe" });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const chapters = loadChapters();
  const draftMode = ALLOW_DRAFTS && chapters.some((c) => c.draftMarkers > 0);

  mkdirSync(OUT, { recursive: true });
  const pdfPath = path.join(OUT, `${SLUG}.pdf`);
  const epubPath = path.join(OUT, `${SLUG}.epub`);

  console.log(`Chapters (${chapters.length}):`);
  for (const ch of chapters) {
    console.log(`  ${ch.file}  "${ch.heading}"  ${ch.words} words`);
  }

  const html = buildCombinedHtml(chapters, draftMode);
  await buildPdf(html, pdfPath, draftMode);
  const coverAdded = existsSync(COVER) ? await prependCover(pdfPath, COVER) : false;
  buildEpub(chapters, epubPath, draftMode);

  const words = chapters.reduce((n, c) => n + c.words, 0);
  const scanned = pdfPageCount(pdfPath);
  const pages = scanned > 0 ? `${scanned}` : `~${Math.round(words / 280)} (estimated)`;
  const mb = (p: string) => (statSync(p).size / 1024 / 1024).toFixed(2);

  console.log("");
  console.log(`Word count:  ${words.toLocaleString()}`);
  console.log(`Page count:  ${pages}`);
  console.log(`Cover:       ${coverAdded ? COVER : "none (render one with npm run crr-covers:build)"}`);
  console.log(`PDF:   ${pdfPath}  (${mb(pdfPath)} MB)`);
  console.log(`ePub:  ${epubPath}  (${mb(epubPath)} MB)`);
  if (draftMode) console.log(`\nDRAFT build: watermarked, not for sale.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
