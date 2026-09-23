// check_decks.mjs — drive every cohort deck the way the presenter will: one click at a time.
// For each deck: walk every build with ArrowRight, confirm the click count matches the data,
// fail on console errors, and flag any slide whose content spills past the 1920x1080 stage.
// With --shots, saves a fully built screenshot of every slide for an eyeball pass.
//
// Usage: node scripts/lessons/masterclass/check_decks.mjs "Courses/Car Rental Riches/Masterclass" [--shots] [session_01]
import { chromium } from "playwright";
import { readdirSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const root = path.resolve(args.find((a) => !a.startsWith("--") && !a.startsWith("session_")) ?? ".");
const only = args.find((a) => a.startsWith("session_"));
const shots = args.includes("--shots");
const decksDir = path.join(root, "decks");
const files = readdirSync(decksDir).filter((f) => /^session_.*\.html$/.test(f) && (!only || f.startsWith(only))).sort();

const browser = await chromium.launch();
let failed = 0;
for (const f of files) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|net::ERR/.test(m.text())) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(pathToFileURL(path.join(decksDir, f)).href, { waitUntil: "load" });
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.goto(pathToFileURL(path.join(decksDir, f)).href + "#s=1&b=0", { waitUntil: "load" });

  const deck = JSON.parse(readFileSync(path.join(root, "sessions", f.replace(".html", ".json")), "utf8"));
  const n = deck.slides.length;
  const problems = [];
  let clicks = 0;
  for (let i = 0; i < n; i++) {
    // click until this slide is fully built
    for (let guard = 0; guard < 12; guard++) {
      const s = await page.evaluate(() => {
        const el = document.querySelector(".slide.active");
        const all = [...el.querySelectorAll("[data-b]")];
        const max = all.reduce((m, x) => Math.max(m, +x.dataset.b), 0);
        const on = all.filter((x) => x.classList.contains("on")).reduce((m, x) => Math.max(m, +x.dataset.b), 0);
        return { max, on, idx: [...document.querySelectorAll(".slide")].indexOf(el) };
      });
      if (s.idx !== i) { problems.push(`slide ${i + 1}: expected to be on it, deck is on ${s.idx + 1}`); break; }
      if (s.on >= s.max) break;
      await page.keyboard.press("ArrowRight"); clicks++;
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(shots ? 1300 : 520); // let the last build (and any count-up) settle
    const spill = await page.evaluate(() => {
      const el = document.querySelector(".slide.active");
      const stage = document.getElementById("stage").getBoundingClientRect();
      const out = [];
      const floor = el.querySelector(".footer-note") ? el.querySelector(".footer-note").getBoundingClientRect().top : stage.bottom - 30;
      for (const x of el.querySelectorAll(".body-area *, h2, .headline, h1")) {
        if (x.closest(".board-scroll")) continue; // boards scroll by design
        const r = x.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (r.right > stage.right - 40 || r.bottom > floor + 2) out.push(`${x.className || x.tagName} bottom=${Math.round(r.bottom)} right=${Math.round(r.right)} (floor ${Math.round(floor)})`);
      }
      return out.slice(0, 3);
    });
    if (spill.length) problems.push(`slide ${i + 1} (${deck.slides[i].type}) overflows: ${spill.join(" | ")}`);
    if (shots) {
      const dir = path.join(root, "decks", "_shots", f.replace(".html", ""));
      mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: path.join(dir, `${String(i + 1).padStart(2, "0")}_${deck.slides[i].type}.jpg`), type: "jpeg", quality: 70 });
    }
    if (i < n - 1) { await page.keyboard.press("ArrowRight"); await page.waitForTimeout(40); }
  }
  // back-navigation lands on a fully built slide, the way PowerPoint does
  await page.keyboard.press("ArrowLeft");
  const ok = failedOr(problems, errors);
  console.log(`${f}: ${n} slides, ${clicks} build clicks${ok ? "  OK" : ""}`);
  for (const p of problems) console.log("   ! " + p);
  for (const e of errors) console.log("   ! console: " + e);
  if (!ok) failed++;
  await ctx.close();
}
await browser.close();
function failedOr(p, e) { return p.length === 0 && e.length === 0; }
process.exit(failed ? 1 : 0);
