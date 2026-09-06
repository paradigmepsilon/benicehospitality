# Course Funnel System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the in-house nurture engine, the enrollment hooks at every capture point, CRR presale gating, the Operator Bundle rails, and the funnel report, so both courses have a working lead-to-purchase system that starts from an empty list.

**Architecture:** Sequences are TypeScript modules; enrollments and sends are two Neon tables; a Vercel cron route every 15 minutes renders and sends due steps through Resend with suppression checked at send time. Existing capture routes gain one best-effort `enrollInNurture` call each. The CRR page and tier table take a server-computed `presaleOpen` flag. The bundle mirrors the CRR presale rails with a new product tag.

**Tech Stack:** Next.js App Router (nodejs runtime routes), `@neondatabase/serverless` via `@/lib/db`, Resend, posthog-node, Stripe, `node:test` run through tsx.

**Spec:** `docs/superpowers/specs/2026-09-05-course-funnel-design.md`

## Global Constraints

- No em-dashes (U+2014) or en-dashes (U+2013) in any email copy, page copy, or comment. Rewrite as two sentences or a comma.
- Every nurture email carries the one-click unsubscribe link from `buildUnsubscribeUrl(email)` (`src/lib/outreach/unsubscribe.ts`) and, where earnings are mentioned, the line "Educational content only, not financial, legal, tax, or insurance advice. Earnings figures are illustrative, not a promise of results."
- RRR emails are signed "Della"; CRR emails are signed "Alex". Voice: short declarative sentences, specifics over abstractions, no "game-changer", "unlock", "passive", "secret", "hack".
- Every hook is best-effort: wrap in try/catch, log with a `[nurture]` prefix, never change the route's response.
- Display prices come from `RRR_PRICES`, `BLUEPRINT`, `CRR`, `CRR_BLUEPRINT`, and the new `OPERATOR_BUNDLE` constants. Never retype a dollar amount.
- `tsc --noEmit`, `npm run lint`, and `npm test` must be clean before each commit. Commits stay on branch `crr/inside-lane-2026-09`; no push, no merge, no deploy without Alex.

---

### Task 1: Test harness and pure schedule helpers

**Files:**
- Create: `src/lib/nurture/schedule.ts`
- Create: `src/lib/nurture/schedule.test.ts`
- Modify: `package.json` (add `"test"` script)

**Interfaces:**
- Produces: `nextSendAt(from: Date, delayHours: number): Date`, `advance(step: number, total: number): { nextStep: number; completed: boolean }`, `isSuppressed(email: string, unsubscribed: Set<string>): boolean`, `normalizeEmail(email: string): string`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/nurture/schedule.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { advance, isSuppressed, nextSendAt, normalizeEmail } from "./schedule";

test("nextSendAt adds whole hours", () => {
  const from = new Date("2026-09-05T12:00:00Z");
  assert.equal(nextSendAt(from, 48).toISOString(), "2026-09-07T12:00:00Z");
  assert.equal(nextSendAt(from, 0).toISOString(), from.toISOString());
});

test("advance moves to the next step until the last one completes", () => {
  assert.deepEqual(advance(0, 4), { nextStep: 1, completed: false });
  assert.deepEqual(advance(3, 4), { nextStep: 4, completed: true });
});

test("isSuppressed matches case-insensitively", () => {
  const set = new Set(["a@b.com"]);
  assert.equal(isSuppressed("A@B.com", set), true);
  assert.equal(isSuppressed("c@d.com", set), false);
});

test("normalizeEmail lowercases and trims", () => {
  assert.equal(normalizeEmail("  Alex@Example.COM "), "alex@example.com");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/nurture/schedule.test.ts`
Expected: FAIL, cannot find module `./schedule`.

- [ ] **Step 3: Implement**

```ts
// src/lib/nurture/schedule.ts
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function nextSendAt(from: Date, delayHours: number): Date {
  return new Date(from.getTime() + delayHours * 60 * 60 * 1000);
}

export function advance(step: number, total: number): { nextStep: number; completed: boolean } {
  const nextStep = step + 1;
  return { nextStep, completed: nextStep >= total };
}

export function isSuppressed(email: string, unsubscribed: Set<string>): boolean {
  return unsubscribed.has(normalizeEmail(email));
}
```

- [ ] **Step 4: Add the npm script and run**

`package.json` scripts: `"test": "node --import tsx --test \"src/**/*.test.ts\""`.
Run: `npm test`. Expected: 4 passing.

- [ ] **Step 5: Commit** `feat(nurture): add schedule helpers and the first test harness`

---

### Task 2: Tables

**Files:**
- Modify: `scripts/migrate.ts` (append before the final log in `migrate()`)

- [ ] **Step 1: Add the two tables** exactly as in the spec section 2, plus `CREATE INDEX IF NOT EXISTS course_nurture_due_idx ON course_nurture_enrollments(status, next_send_at)`.
- [ ] **Step 2: Run** `npm run db:migrate` against the local `DATABASE_URL` (this is the shared Neon database; the statements are idempotent). Expected: two "✓ course_nurture_* table created" lines.
- [ ] **Step 3: Verify** with a one-off query that both tables exist and are empty.
- [ ] **Step 4: Commit** `feat(nurture): add course_nurture tables`

---

### Task 3: Sequence types, layout, and the engine

**Files:**
- Create: `src/lib/nurture/types.ts`
- Create: `src/lib/nurture/layout.ts`
- Create: `src/lib/nurture/engine.ts`
- Create: `src/lib/nurture/registry.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface NurtureContext { email: string; firstName?: string; metro?: string; carsToday?: "0" | "1" | "2-4" | "5+"; baseUrl: string; unsubscribeUrl: string; }
  export interface NurtureStep { delayHours: number; subject: string; preheader: string; html: (ctx: NurtureContext) => string; }
  export interface NurtureSequence { key: NurtureSequenceKey; from: () => string; steps: NurtureStep[]; }
  export type NurtureSequenceKey = "rrr_welcome" | "rrr_book" | "crr_ebook" | "crr_calculator" | "crr_waitlist";
  export async function enrollInNurture(args: { email: string; sequenceKey: NurtureSequenceKey; context?: Partial<NurtureContext> }): Promise<{ enrolled: boolean }>;
  export async function stopNurture(email: string, reason: string, sequenceKeys?: NurtureSequenceKey[]): Promise<number>;
  export async function processDueNurture(args?: { now?: Date; limit?: number }): Promise<{ sent: number; failed: number; skipped: number }>;
  ```
- `layout.ts` exports `nurtureLayout({ preheader, bodyHtml, signoff, unsubscribeUrl, disclaimer }): string` reusing the cream/olive tokens from `src/lib/email-templates.ts` `auditLayout`, and `primaryButton(href, label)`.

- [ ] **Step 1:** Write `types.ts` as above.
- [ ] **Step 2:** Write `layout.ts`: a 560px table layout, DM Sans/Arial stack, `#f8f6f1` background, `#1a1a1a` ink, olive `#5b9a2f` button, footer with "Be Nice Hospitality Group · Hapeville, GA", the unsubscribe link, and the optional disclaimer line.
- [ ] **Step 3:** Write `registry.ts`: `getSequence(key)` returning from a map filled in Task 4 (start with an empty map typed `Record<NurtureSequenceKey, NurtureSequence>` and populate as sequences land).
- [ ] **Step 4:** Write `engine.ts`:

```ts
import { sql } from "@/lib/db";
import { Resend } from "resend";
import { buildUnsubscribeUrl } from "@/lib/outreach/unsubscribe";
import { getBaseUrl } from "@/lib/stripe";
import { getPostHogClient } from "@/lib/posthog-server";
import { advance, nextSendAt, normalizeEmail } from "./schedule";
import { getSequence } from "./registry";
import type { NurtureContext, NurtureSequenceKey } from "./types";

let cachedResend: Resend | null = null;
function getResend(): Resend { if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY); return cachedResend; }

export async function enrollInNurture(args: { email: string; sequenceKey: NurtureSequenceKey; context?: Partial<NurtureContext> }): Promise<{ enrolled: boolean }> {
  try {
    const email = normalizeEmail(args.email);
    const seq = getSequence(args.sequenceKey);
    const first = seq.steps[0];
    const due = nextSendAt(new Date(), first.delayHours).toISOString();
    const ctx = JSON.stringify(args.context ?? {});
    const rows = await sql`
      INSERT INTO course_nurture_enrollments (email, sequence_key, next_step, next_send_at, context)
      VALUES (${email}, ${args.sequenceKey}, 0, ${due}, ${ctx}::jsonb)
      ON CONFLICT (email, sequence_key) DO NOTHING
      RETURNING id`;
    const enrolled = rows.length > 0;
    if (enrolled) getPostHogClient().capture({ distinctId: email, event: "nurture_enrolled", properties: { sequence_key: args.sequenceKey } });
    return { enrolled };
  } catch (err) {
    console.error("[nurture] enroll failed:", err);
    return { enrolled: false };
  }
}
```

  `stopNurture` runs `UPDATE ... SET status='stopped', stop_reason=${reason}, updated_at=NOW() WHERE email=${email} AND status='active'` (plus `AND sequence_key = ANY(${keys})` when keys are given) and returns the row count. `processDueNurture` selects due rows (`FOR UPDATE SKIP LOCKED` is not available through the HTTP driver; rely on the `UNIQUE (enrollment_id, step)` send row instead), loads the `unsubscribes` set for those emails in one query, and for each row: skip and stop with reason `unsubscribed` if suppressed; otherwise render `step.html(ctx)` with `ctx = { email, ...row.context, baseUrl: getBaseUrl(), unsubscribeUrl: buildUnsubscribeUrl(email) }`, insert the send row first (`ON CONFLICT DO NOTHING RETURNING id`; if nothing returned, another tick already sent it: advance and continue), send via Resend, and on success update the send row with `resend_message_id` and advance the enrollment (`completed` when `advance().completed`); on failure write `error` into the send row, delete nothing, and leave the enrollment untouched so the next tick retries.

- [ ] **Step 5:** `npx tsc --noEmit` clean. Commit `feat(nurture): add the sequence engine`.

---

### Task 4: The five sequences

**Files:**
- Create: `src/lib/nurture/sequences/rrr-welcome.ts`, `rrr-book.ts`, `crr-ebook.ts`, `crr-calculator.ts`, `crr-waitlist.ts`
- Modify: `src/lib/nurture/registry.ts` (register all five)
- Create: `scripts/nurture-dry-run.ts`

Each file exports one `NurtureSequence`. From addresses: RRR uses `process.env.BLUEPRINT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "Della Henry <hello@benicehospitality.com>"`; CRR uses `getCrrFromAddress()` from `@/lib/car-rental-riches`. Links use `ctx.baseUrl`.

- [ ] **Step 1: rrr_welcome (Della), 4 steps**
  1. 0h · "The room, not the whole place" · what co-living by the room is, why Della runs it, the one number to know (a room rents on its own lease and its own price), link to `/resources/co-living-viability-calculator`.
  2. 48h · "Run one address through the calculator" · how to read the verdict, what to enter, what a PASS means, link.
  3. 120h · "How I actually started" · Della's operator framing: first property, the mistake most people make (furnishing before underwriting), the Southeast focus.
  4. 192h · "The whole system, written down" · the Blueprint at `$${BLUEPRINT.priceUsd}` (`/books/room-rental-riches-blueprint`), and the course waitlist for people who want it taught. Disclaimer line.
- [ ] **Step 2: rrr_book (Della), 3 steps**: 24h "Start with chapter one, then the exercise", 120h "The one exercise to do before anything else" (underwrite a real address), 240h "When the course opens, you hear first" (waitlist link `/courses/room-rental-riches`).
- [ ] **Step 3: crr_ebook (Alex), 4 steps from Sequence D2 to D5** in `02_Funnel/email_sequences.md`: 48h "The number that brought you here is gross", 96h "The same car is three different businesses" (calculator link, branch copy on `ctx.carsToday`: "0" gets "read before you buy", anything else gets "which job does your car have"), 144h "Your personal policy wants no part of this" (Georgia line when `ctx.metro` contains "atlanta" or "georgia"), 192h "The ladder" (The Inside Lane at `$${CRR_BLUEPRINT.priceUsd}`, the course waitlist). Disclaimer on 1, 2, 4.
- [ ] **Step 4: crr_calculator (Alex), 4 steps from Sequence C2 to C5**: 24h "Why your number is lower than the YouTube guys say", 72h "Run it three ways" (carsToday branch), 120h "What Be Nice Autos actually is", 168h "The course, the book, and which one you need" (course page and book). Disclaimer on 1, 2, 4.
- [ ] **Step 5: crr_waitlist (Alex), 3 steps**: 0h "You're on the list. Here's what changed in 2026" (three earnings plans, 70/80/90 host share, damage responsibility $250/$1,500/$2,750, source: Turo host hub), 72h "Underwrite a car before you buy it" (`/turo-calculator`), 168h "Twelve things nobody tells you" (`/before-you-buy-the-car`). Say "you hear first when the presale opens"; never a date.
- [ ] **Step 6: Dry run**: `scripts/nurture-dry-run.ts` renders every step of every sequence for a fake context to `<scratchpad>/nurture/<key>-<n>.html`, then fails if any output contains U+2013 or U+2014 or the banned words. Run it. Open two files in the browser for a visual check.
- [ ] **Step 7:** Commit `feat(nurture): add the five course sequences`.

---

### Task 5: Cron route

**Files:**
- Create: `src/app/api/cron/process-course-nurture/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1:** Route: `export const runtime = "nodejs"`; `POST` and `GET` both check `request.headers.get("x-vercel-cron")` and return 403 without it; then `const result = await processDueNurture({ limit: 100 }); return NextResponse.json(result)`.
- [ ] **Step 2:** Add `{ "path": "/api/cron/process-course-nurture", "schedule": "*/15 * * * *" }` to `vercel.json`.
- [ ] **Step 3:** Local check: `curl -X POST localhost:3000/api/cron/process-course-nurture` returns 403; with `-H "x-vercel-cron: 1"` returns `{sent:0,failed:0,skipped:0}`.
- [ ] **Step 4:** Commit `feat(nurture): add the course nurture cron`.

---

### Task 6: Enrollment and suppression hooks

**Files:**
- Modify: `src/app/api/newsletter/route.ts` (after the insert: `enrollInNurture({ email, sequenceKey: "rrr_welcome" })` unless `source === "crr-free-ebook"`)
- Modify: `src/app/api/crr-free-ebook/request/route.ts` (after `recordCrrFreeEbookLead`: enroll `crr_ebook` with `{ metro: metroClean || undefined, carsToday: cars ?? undefined }`)
- Modify: `src/lib/resources/leads.ts` `recordResourceToolLead` (after the insert: `tool.category === "fleet" ? "crr_calculator" : "rrr_welcome"`, with `firstName` from `name.split(" ")[0]`)
- Modify: `src/app/api/waitlist/route.ts` (after the insert returns a row: `courseSlug === "car-rental-riches" ? "crr_waitlist" : "rrr_welcome"`, `firstName` from name)
- Modify: `src/app/api/webhooks/stripe/route.ts`: in `fulfillBlueprint` after the delivery email, `await stopNurture(email, "purchased:blueprint", ["rrr_welcome"])` then `enrollInNurture({ email, sequenceKey: "rrr_book", context: { firstName } })`; in `fulfillCrrPresale` and `fulfillCrrBlueprint`, `stopNurture(email, "purchased:<tag>", ["crr_ebook","crr_calculator","crr_waitlist"])`.
- Modify: `src/app/api/webhooks/resend/route.ts`: on `email.bounced` and `email.complained`, `stopNurture(to, "resend:" + type)` for each address in `data.to`.

- [ ] **Step 1:** Make each change; every call sits inside its own try/catch and never alters the response.
- [ ] **Step 2:** `npx tsc --noEmit` and `npm run lint` clean.
- [ ] **Step 3:** Local proof: `npm run dev`, POST to `/api/newsletter` with a test email and a valid Turnstile bypass (or call `enrollInNurture` directly through a tsx one-liner), confirm one row in `course_nurture_enrollments`, run the cron with the header, confirm one row in `course_nurture_sends` and one Resend message (to your own address). Then delete the test rows.
- [ ] **Step 4:** Commit `feat(nurture): enroll and suppress at every capture point`.

---

### Task 7: CRR presale gating

**Files:**
- Modify: `src/lib/car-rental-riches.ts` (add `export function isCrrPresaleOpen(): boolean { return !!getCrrPresalePriceId(); }`; change `doorsOpenPromise` to "Modules 1 to 3 go live first, then the rest drips weekly")
- Modify: `src/app/(marketing)/courses/car-rental-riches/page.tsx`
- Modify: `src/components/sections/courses/CarRentalRichesTierPreview.tsx` (accept `presaleOpen: boolean` prop; `buyable: presaleOpen` for the self-paced tier; when closed the featured badge reads "Founding price, presale opens with Module 1" and the CTA is the waitlist trigger labelled "Join the waitlist, lock $197")

- [ ] **Step 1:** In the page, compute `const presaleOpen = isCrrPresaleOpen();` and branch: hero eyebrow "Founding price $197 · presale opens with Module 1" when closed; the tiers footer paragraph drops "within 30 days of launch" and reads "Founding Members lock in $197 (retail $297), get every module the day it ships, lifetime access with every future update, and a 30-day unconditional money-back guarantee."; the buy button block becomes the waitlist trigger when closed; pass `presaleOpen` to the tier preview.
- [ ] **Step 2:** `npm run dev`, load the page with the env var unset: no "$197" buy buttons anywhere, waitlist buttons present, price still visible. Screenshot.
- [ ] **Step 3:** Commit `feat(crr): hide the founding buy button until the presale opens`.

---

### Task 8: Operator Bundle rails

**Files:**
- Create: `src/lib/operator-bundle.ts`
- Create: `src/app/api/operator-bundle/checkout/route.ts`
- Modify: `src/app/api/webhooks/stripe/route.ts` (branch + `fulfillOperatorBundle`)
- Create: `src/components/sections/courses/OperatorBundleBand.tsx`
- Modify: both course pages (render the band only when `isOperatorBundleOpen()`)
- Modify: `scripts/migrate.ts` is NOT touched; enrollments use the existing `enrollments` table.

- [ ] **Step 1:** `operator-bundle.ts`: `OPERATOR_BUNDLE_PRODUCT_TAG = "sharing-economy-operator-bundle"`, `OPERATOR_BUNDLE = { name: "Sharing Economy Operator Bundle", priceUsd: 497, path: "/courses" }`, `getOperatorBundlePriceId()` from `OPERATOR_BUNDLE_STRIPE_PRICE_ID`, `isOperatorBundleOpen()`, and `operatorBundleWelcomeEmail({ name, rrrUrl, crrUrl, setPasswordUrl })` in the same HTML style as `crrFoundingWelcomeEmail`, signed by both founders.
- [ ] **Step 2:** Checkout route: copy of the CRR presale route with the bundle tag, `success_url` `${base}/courses?purchase=bundle-success`.
- [ ] **Step 3:** Webhook: `else if (session.metadata?.product === OPERATOR_BUNDLE_PRODUCT_TAG) await fulfillOperatorBundle(session)`. The function provisions the account (`provisionBuyerAccount`), looks up both course ids by slug (`room-rental-riches`, `car-rental-riches`), calls `grantEnrollment({ userId, courseId, tier: "self-paced", grantedByUserId: null, notes: "operator-bundle" })` for each, sends the welcome email, stops all five nurture sequences, captures `operator_bundle_purchased`.
- [ ] **Step 4:** Band component: cream card, "Both courses. One price." headline, `$${OPERATOR_BUNDLE.priceUsd}` with the two self-paced prices struck (`RRR_PRICES.selfPacedUsd + CRR.retailPriceUsd`), a client buy button posting to the bundle route (copy `CrrFoundingBuyButton` with `source` prop), disclaimer line. Rendered on both course pages under the tier section, only when open.
- [ ] **Step 5:** `tsc`, lint. Commit `feat(bundle): add the Operator Bundle rails, gated on its Stripe price`.

---

### Task 9: Funnel report and PostHog events

**Files:**
- Create: `scripts/funnel-report.ts`
- (PostHog `nurture_enrolled`, `nurture_sent`, `nurture_stopped` captures live in `engine.ts` from Task 3.)

- [ ] **Step 1:** The script prints four weekly tables: leads by source (`newsletter_subscribers` + `resource_leads` + `course_waitlist`, by `date_trunc('week', ...)`), nurture activity (enrolled, sent, failed, stopped by reason), waitlist per course, purchases (`claimproof_purchases`, `course_purchases`, and enrollments granted by webhook notes). Uses `console.table`.
- [ ] **Step 2:** Run it locally; confirm it prints without error on the current (nearly empty) data.
- [ ] **Step 3:** Commit `feat: add the weekly funnel report`.

---

### Task 10: Docs

**Files:**
- Modify: `/Users/alexhenry/Projects/Car Rental Riches/02_Funnel/funnel_map.md` (Nurture row: "built", sequence keys; the UTM rule)
- Modify: `/Users/alexhenry/Projects/Car Rental Riches/HANDOFF.md` (one dated paragraph: what shipped, what Alex switches remain)
- Modify: `scripts/lessons/README.md` is NOT touched.

- [ ] **Step 1:** Update both docs. No commit (that folder is not a git repo).

## Self-review

Spec coverage: section 1 (switches) done live outside the plan; section 2 tasks 1 to 3 and 5; section 3 task 4; section 4 task 6; section 5 task 7; section 6 task 8; section 7 task 9; section 8 task 10. Placeholders: none. Types: `NurtureSequenceKey` union used identically in tasks 3, 4, 6, 8.
