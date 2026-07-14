/**
 * Capture a Claim Proof portal walkthrough video (Ticket 3, approach A).
 *
 * Drives the live portal in a recorded 1920x1080 chromium context, following a
 * per-video choreography of deliberate cursor moves, scrolls, and clicks paced
 * to the matching VO track. Produces a webm, then muxes the VO with ffmpeg into
 * a final MP4.
 *
 * Prereqs: dev server on :3000, demo sessions seeded (seed-claimproof-demo.ts),
 * VO tracks in videos/vo/, ffmpeg on PATH.
 *
 * Run: CP_VIDEO=1 node --env-file=.env.local --import tsx scripts/capture-claimproof-video.ts
 */
import { chromium, type Page, type BrowserContext } from "playwright";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const pexec = promisify(execFile);

const VIDEOS_DIR = "/Users/alexhenry/Sites/bna-claim-proof/videos";
const VO_DIR = path.join(VIDEOS_DIR, "vo");
const OUT_DIR = path.join(VIDEOS_DIR, "final");
const RAW_DIR = path.join(VIDEOS_DIR, "_raw");
const BASE = "http://localhost:3000/claimproof/portal";

// Demo sessions minted by seed-claimproof-demo.ts (7-day TTL).
const SESSIONS: Record<"core" | "pro" | "fleet", string> = {
  core: "oQ_1ndkdweK6IHXVm3KZKdSRDnVUxIg4vZ92wh7RCio",
  pro: "mg7_AjH9bLaUxnYa7Hcl18e-oitTRPl7KCHIWoyVkd4",
  fleet: "ho6V1Q4YTQhD6E4lYyHWIt9Qa4wSsiUDGmmI7OnMwSs",
};

// Visible cursor overlay + smooth-scroll easing, injected before page scripts.
const INIT_CURSOR = `
(function () {
  // Hide dev-only overlays from capture. The Next.js dev indicator renders in a
  // <nextjs-portal> whose inline style wins the cascade, so a stylesheet rule is
  // not enough — actively remove those nodes as they appear. PostHog's toolbar
  // is a normal element, so CSS handles it.
  try {
    var st = document.createElement('style');
    st.textContent = '.ph-toolbar,#__posthog-toolbar,[id^="PostHogToolbar"]{display:none !important}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}
  try {
    var killPortals = function () {
      var ns = document.querySelectorAll('nextjs-portal');
      for (var i = 0; i < ns.length; i++) ns[i].remove();
    };
    killPortals();
    new MutationObserver(killPortals).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  function ensure() {
    if (document.getElementById('__cpcur')) return;
    var d = document.createElement('div');
    d.id = '__cpcur';
    d.style.cssText = 'position:fixed;z-index:2147483647;width:24px;height:24px;margin:-7px 0 0 -7px;border-radius:50%;pointer-events:none;background:rgba(225,156,99,.30);border:2.5px solid #E19C63;box-shadow:0 1px 6px rgba(0,0,0,.35);left:960px;top:300px;transition:width .12s ease,height .12s ease';
    (document.body || document.documentElement).appendChild(d);
  }
  document.addEventListener('mousemove', function (e) {
    ensure();
    var d = document.getElementById('__cpcur');
    if (d) { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; }
  }, true);
  document.addEventListener('mousedown', function () {
    var d = document.getElementById('__cpcur'); if (d) { d.style.width = '16px'; d.style.height = '16px'; }
  }, true);
  document.addEventListener('mouseup', function () {
    var d = document.getElementById('__cpcur'); if (d) { d.style.width = '24px'; d.style.height = '24px'; }
  }, true);
  if (document.readyState !== 'loading') ensure();
  else document.addEventListener('DOMContentLoaded', ensure);
})()
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function helpers(page: Page) {
  const start = Date.now();
  // Idle-wait until an absolute wall-clock second (measured from capture start),
  // so each beat begins on its VO timestamp regardless of nav/scroll overhead.
  async function waitUntil(sec: number) {
    const d = start + sec * 1000 - Date.now();
    if (d > 0) await sleep(d);
  }
  async function settle(ms: number) {
    await sleep(ms);
  }
  // Smooth cursor glide to an element's center (scrolls it into view first).
  async function moveTo(sel: string, opts: { nth?: number; block?: ScrollLogicalPosition } = {}) {
    const loc = opts.nth != null ? page.locator(sel).nth(opts.nth) : page.locator(sel).first();
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(500); // let any smooth scroll settle
    const box = await loc.boundingBox();
    if (!box) return false;
    const x = box.x + box.width / 2;
    const y = box.y + Math.min(box.height / 2, 400);
    await page.mouse.move(x, y, { steps: 42 });
    return true;
  }
  async function hoverHold(sel: string, ms: number, opts: { nth?: number } = {}) {
    await moveTo(sel, opts);
    await sleep(ms);
  }
  async function clickEl(sel: string, opts: { nth?: number } = {}) {
    const ok = await moveTo(sel, opts);
    await sleep(350);
    const loc = opts.nth != null ? page.locator(sel).nth(opts.nth) : page.locator(sel).first();
    await loc.click({ timeout: 5000 }).catch(async () => {
      await loc.click({ force: true, timeout: 5000 }).catch(() => {});
    });
  }
  // Gentle incremental scroll over a duration for a calm reveal.
  async function driftScroll(totalPx: number, ms: number) {
    const steps = Math.max(8, Math.round(ms / 60));
    const per = totalPx / steps;
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, per);
      await sleep(ms / steps);
    }
  }
  // Tick the first n checklist labels (visible styled checkboxes), if present.
  async function tick(n = 1) {
    const boxes = page.locator("main label:has(input[type=checkbox])");
    const count = await boxes.count();
    for (let i = 0; i < n && i < count; i++) {
      await clickEl("main label:has(input[type=checkbox])", { nth: i });
      await sleep(1400);
    }
  }
  // Type into the first worksheet inputs to show live/interactive behavior.
  async function fillFirst(values: string[]) {
    const inputs = page.locator(
      "main input[type=text], main input[type=number], main input:not([type]):not([type=checkbox]):not([type=radio]), main textarea",
    );
    const count = await inputs.count();
    for (let i = 0; i < values.length && i < count; i++) {
      const el = inputs.nth(i);
      await el.scrollIntoViewIfNeeded().catch(() => {});
      const box = await el.boundingBox();
      if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
      await el.click().catch(() => {});
      await el.pressSequentially(values[i], { delay: 55 }).catch(() => {});
      await sleep(700);
    }
  }
  async function goto(url: string) {
    await page.goto(url, { waitUntil: "networkidle" });
    await sleep(300);
  }
  return { settle, moveTo, hoverHold, clickEl, driftScroll, goto, waitUntil, tick, fillFirst };
}

type H = ReturnType<typeof helpers>;

// Gate an ordered list of beat functions to even windows across the VO length,
// so each beat starts on its narration segment. A beat that finishes early
// idles until the next boundary (calm pacing); one that overruns just proceeds.
async function schedule(h: H, voDuration: number, beats: Array<(h: H) => Promise<void>>) {
  const w = voDuration / beats.length;
  for (let i = 0; i < beats.length; i++) {
    await h.waitUntil(i * w);
    await beats[i](h).catch((e) => console.warn(`  beat ${i} warn:`, (e as Error).message));
  }
  await h.waitUntil(voDuration + 1.5);
}

// ---------------------------------------------------------------------------
// Choreographies (one per video). Each targets slightly longer than its VO so
// -shortest trims cleanly to the narration.
// ---------------------------------------------------------------------------

// Beats gated to VO paragraph boundaries (VO_1 = ~69s, 7 paragraphs).
async function video1(page: Page) {
  const h = helpers(page);
  const card = (slug: string) => `a[href='/claimproof/portal/${slug}']`;

  // Load before the clock's first beat so nav cost doesn't eat beat 1.
  await h.goto(BASE);

  // Beat 1 (0-10s) — "This is your Claim Command Center."
  await h.waitUntil(0.5);
  await h.moveTo("h1");
  await h.moveTo("button:has-text('Download my')");
  await h.moveTo("h1");

  // Beat 2 (10-21s) — "one question ... you pick the situation."
  await h.waitUntil(10);
  await h.hoverHold(card("emergency/quick-start"), 1400, { nth: 0 });
  await h.hoverHold(card("proof/pretrip-standard"), 1300);
  await h.hoverHold(card("valuation/gap-worksheet"), 1300);
  await h.hoverHold(card("followup/escalation-map"), 1300);

  // Beat 3 (21-31s) — "Found damage today ... clock is running."
  await h.waitUntil(21);
  await h.clickEl(card("emergency/quick-start"), { nth: 0 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await h.settle(1200);
  await h.driftScroll(600, 6500);

  // Beat 4 (31-41s) — "Preparing ... Approved too low ... Stuck. Four doors."
  await h.waitUntil(31);
  await h.goto(BASE);
  await h.hoverHold(card("proof/pretrip-standard"), 2400);
  await h.hoverHold(card("valuation/gap-worksheet"), 2400);
  await h.hoverHold(card("followup/escalation-map"), 2400);

  // Beat 5 (41-52s) — "Every tool is built the same way."
  await h.waitUntil(41);
  await h.goto(`${BASE}/emergency/evidence-scorecard`);
  await h.settle(1500);
  await h.driftScroll(480, 6500);

  // Beat 6 (52-60s) — "When you check something off ... it syncs."
  await h.waitUntil(52);
  await h.clickEl("label:has(input[type=checkbox])", { nth: 0 });
  await h.settle(2200);
  await h.clickEl("label:has(input[type=checkbox])", { nth: 1 });

  // Beat 7 (60-69s) — "one button prints your whole kit ... open the first workflow."
  await h.waitUntil(60);
  await h.goto(BASE);
  await h.moveTo("button:has-text('Download my')");
  await h.waitUntil(71); // hold on the button through the VO tail
}

const tool = (pack: string, slug: string) => `${BASE}/${pack}/${slug}`;
const cardSel = (slug: string) => `a[href='/claimproof/portal/${slug}']`;

// VIDEO 2 — 24-Hour Emergency Filing (Core session). VO ~203s, 14 beats.
async function video2(page: Page) {
  const h = helpers(page);
  await h.goto(BASE);
  await schedule(h, 202.9, [
    async () => { await h.hoverHold(cardSel("emergency/quick-start"), 3000, { nth: 0 }); },
    async () => { await h.clickEl(cardSel("emergency/quick-start"), { nth: 0 }); await page.waitForLoadState("networkidle").catch(()=>{}); await h.settle(1500); },
    async () => { await h.driftScroll(500, 6000); await h.tick(1); },
    async () => { await h.goto(tool("emergency","action-timeline")); await h.driftScroll(520, 8000); },
    async () => { await h.goto(tool("emergency","photo-protocol")); await h.settle(1500); },
    async () => { await h.driftScroll(620, 9000); },
    async () => { await h.goto(tool("emergency","evidence-scorecard")); await h.settle(1200); await h.tick(2); },
    async () => { await h.goto(tool("emergency","incident-summary")); await h.driftScroll(520, 8000); },
    async () => { await h.goto(tool("emergency","comms-templates")); await h.driftScroll(520, 8000); },
    async () => { await h.goto(tool("emergency","submission-checklist")); await h.settle(1200); await h.tick(2); },
    async () => { await h.goto(tool("emergency","file-index")); await h.driftScroll(500, 7000); },
    async () => { await h.goto(tool("emergency","completed-example")); await h.driftScroll(520, 8000); },
    async () => { await h.goto(tool("emergency","seven-day-plan")); await h.driftScroll(480, 7000); },
    async () => { await h.goto(BASE); await h.moveTo("h1"); },
  ]);
}

// VIDEO 3 — Building Your Proof System (Complete session). VO ~134s, 7 beats.
async function video3(page: Page) {
  const h = helpers(page);
  await h.goto(BASE);
  await schedule(h, 134.1, [
    async () => { await h.hoverHold(cardSel("proof/pretrip-standard"), 3200); },
    async () => { await h.clickEl(cardSel("proof/pretrip-standard")); await page.waitForLoadState("networkidle").catch(()=>{}); await h.settle(1500); },
    async () => { await h.driftScroll(650, 10000); },
    async () => { await h.goto(tool("proof","return-sop")); await h.driftScroll(560, 11000); },
    async () => { await h.goto(tool("proof","five-minute-card")); await h.driftScroll(500, 11000); },
    async () => { await h.goto(tool("proof","evidence-audit")); await h.settle(1200); await h.tick(2); await h.driftScroll(360, 6000); },
    async () => { await h.goto(`${BASE}/proof`); await h.moveTo("h1"); },
  ]);
}

// VIDEO 4 — Fighting a Low Appraisal (Complete session). VO ~155s, 8 beats.
async function video4(page: Page) {
  const h = helpers(page);
  await h.goto(BASE);
  await schedule(h, 154.6, [
    async () => { await h.hoverHold(cardSel("valuation/gap-worksheet"), 3200); },
    async () => { await h.clickEl(cardSel("valuation/gap-worksheet")); await page.waitForLoadState("networkidle").catch(()=>{}); await h.settle(1500); },
    async () => { await h.fillFirst(["Front bumper cover - replace", "1420", "930"]); await h.settle(1500); },
    async () => { await h.goto(tool("valuation","estimate-glossary")); await h.driftScroll(560, 11000); },
    async () => { await h.goto(tool("valuation","missing-items")); await h.settle(1000); await h.tick(2); await h.driftScroll(360, 6000); },
    async () => { await h.goto(tool("valuation","supplement-builder")); await h.driftScroll(560, 11000); },
    async () => { await h.goto(tool("valuation","valuation-example")); await h.driftScroll(560, 11000); },
    async () => { await h.goto(`${BASE}/valuation`); await h.moveTo("h1"); },
  ]);
}

// VIDEO 5 — Follow-Up and Escalation (Complete session). VO ~168s, 9 beats.
async function video5(page: Page) {
  const h = helpers(page);
  await h.goto(BASE);
  await schedule(h, 167.9, [
    async () => { await h.hoverHold(cardSel("followup/escalation-map"), 3200); },
    async () => { await h.goto(tool("followup","comms-log")); await h.settle(1200); await h.fillFirst(["2026-07-14", "Turo support - status check"]); },
    async () => { await h.goto(tool("followup","script-library")); await h.driftScroll(560, 12000); },
    async () => { await h.goto(tool("followup","escalation-map")); await h.driftScroll(540, 11000); },
    async () => { await h.goto(tool("followup","downtime-tracker")); await h.settle(1000); await h.fillFirst(["6", "82"]); },
    async () => { await h.goto(tool("followup","economics-worksheet")); await h.settle(1000); await h.fillFirst(["1200", "500"]); },
    async () => { await h.goto(tool("followup","decision-matrix")); await h.driftScroll(560, 11000); },
    async () => { await h.goto(tool("followup","closeout-checklist")); await h.settle(1000); await h.tick(2); },
    async () => { await h.goto(`${BASE}/followup`); await h.moveTo("h1"); },
  ]);
}

// VIDEO 6 — Running Claims at Fleet Scale (Fleet session). VO ~188s, 11 beats.
async function video6(page: Page) {
  const h = helpers(page);
  await h.goto(BASE);
  await schedule(h, 187.6, [
    async () => { await h.driftScroll(700, 4000); await h.moveTo("h1"); },
    async () => { await h.goto(tool("fleet-ops","fleet-tracker")); await h.driftScroll(560, 12000); },
    async () => { await h.goto(tool("fleet-ops","folder-system")); await h.driftScroll(540, 11000); },
    async () => { await h.goto(tool("fleet-ops","staff-sop")); await h.driftScroll(560, 12000); },
    async () => { await h.goto(tool("fleet-ops","handoff-form")); await h.driftScroll(520, 11000); },
    async () => { await h.goto(tool("fleet-ops","role-matrix")); await h.driftScroll(520, 11000); },
    async () => { await h.goto(tool("fleet-ops","photo-audit")); await h.settle(800); await h.tick(1); await h.settle(500); await h.goto(tool("fleet-ops","manager-review")); await h.driftScroll(360, 6000); },
    async () => { await h.goto(tool("fleet-ops","kpi-guide")); await h.driftScroll(560, 12000); },
    async () => { await h.goto(tool("fleet-ops","weekly-agenda")); await h.driftScroll(540, 11000); },
    async () => { await h.goto(tool("fleet-ops","training-pack")); await h.driftScroll(540, 11000); },
    async () => { await h.goto(BASE); await h.moveTo("h1"); },
  ]);
}

const CHOREO: Record<string, { fn: (p: Page) => Promise<void>; tier: keyof typeof SESSIONS; vo: string }> = {
  "1": { fn: video1, tier: "pro", vo: "vo_1_orientation.mp3" },
  "2": { fn: video2, tier: "core", vo: "vo_2_emergency_filing.mp3" },
  "3": { fn: video3, tier: "pro", vo: "vo_3_proof_system.mp3" },
  "4": { fn: video4, tier: "pro", vo: "vo_4_low_appraisal.mp3" },
  "5": { fn: video5, tier: "pro", vo: "vo_5_followup_escalation.mp3" },
  "6": { fn: video6, tier: "fleet", vo: "vo_6_fleet_scale.mp3" },
};

async function main() {
  const id = process.env.CP_VIDEO || "1";
  const spec = CHOREO[id];
  if (!spec) throw new Error(`No choreography for video ${id}`);
  const voPath = path.join(VO_DIR, spec.vo);
  if (!existsSync(voPath)) throw new Error(`Missing VO: ${voPath}`);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(RAW_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: RAW_DIR, size: { width: 1920, height: 1080 } },
    deviceScaleFactor: 1,
  });
  await ctx.addCookies([
    { name: "bnhg_session", value: SESSIONS[spec.tier], domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
  await ctx.addInitScript(INIT_CURSOR);
  const page = await ctx.newPage();

  console.log(`[capture] video ${id} (${spec.tier} session)...`);
  const t0 = Date.now();
  await spec.fn(page);
  console.log(`[capture] choreography done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const video = page.video();
  await ctx.close(); // finalizes the webm
  await browser.close();

  const rawWebm = await video?.path();
  if (!rawWebm) throw new Error("No recording produced");
  const stableWebm = path.join(RAW_DIR, `video_${id}.webm`);
  await rename(rawWebm, stableWebm).catch(async () => {
    // path() may already be the final; ignore
  });
  const webmToUse = existsSync(stableWebm) ? stableWebm : rawWebm;

  const finalMp4 = path.join(OUT_DIR, `claimproof_video_${id}.mp4`);
  console.log(`[mux] ${path.basename(webmToUse)} + ${spec.vo} -> ${path.basename(finalMp4)}`);
  // Mask the fixed bottom-left corner where the Next.js dev indicator sits.
  // The portal background there is a flat #25232d, so the box is invisible.
  await pexec("ffmpeg", [
    "-y",
    "-i", webmToUse,
    "-i", voPath,
    "-filter:v", "drawbox=x=0:y=1004:w=86:h=76:color=0x25232D:t=fill",
    "-map", "0:v", "-map", "1:a",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "veryfast",
    "-c:a", "aac", "-b:a", "160k",
    "-shortest",
    finalMp4,
  ]);

  // Report final duration.
  const { stdout } = await pexec("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", finalMp4,
  ]);
  const dur = parseFloat(stdout.trim());
  console.log(`[done] ${finalMp4}  (${Math.floor(dur / 60)}:${String(Math.round(dur % 60)).padStart(2, "0")})`);

  // Clean stray webm(s) in RAW_DIR except the stable one.
  for (const f of await readdir(RAW_DIR)) {
    if (f.endsWith(".webm") && f !== `video_${id}.webm`) {
      await rm(path.join(RAW_DIR, f)).catch(() => {});
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
