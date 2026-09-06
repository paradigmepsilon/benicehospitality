# Course Funnel System: Design Spec

Date: 2026-09-05 · Company: BNHG · Status: approved by Alex in chat (decisions 1 to 7 below), implementation pending.

Evidence and market research behind every decision: `/Users/alexhenry/Projects/Car Rental Riches/00_Strategy/funnel_system_proposal_2026-09-05.md`.

## Decisions locked (2026-09-05)

1. Car Rental Riches (CRR) price: $197 founding, $297 retail self-paced. Cohort and Operator stay "Pricing TBA".
2. Room Rental Riches (RRR) Blueprint book ($32) goes live in production now.
3. CRR founding buy button is hidden until Module 1 is produced. The page keeps the price and takes waitlist signups.
4. RRR self-paced sales open only after full Module 0 to 6 QA. No change now; waitlist stays.
5. Nurture engine is in-house: Neon + Resend + Vercel cron. No new platform.
6. Paid spend defaults to $0. The $1,000 ceiling unlocks only through the proof gates in the proposal.
7. Audience is treated as zero (Instagram: BNHG 39, BNA 29, BNP 274, Della 1,121 followers on 2026-09-05).
8. Sharing Economy Operator Bundle (RRR + CRR self-paced) at $497: build the rails, display gated on its Stripe Price env var. Della approved via Alex.
9. RRR pricing unchanged.

## Non-goals

- No paid ads, no ad accounts, no pixels beyond PostHog.
- No ESP migration. No changes to the hotel-audit nurture.
- No lesson production. No changes to course content or tiers.
- No founding-launch broadcast (Sequence A) yet: there is no list to send it to.

## Components

### 1. Production switches (no code)

- Create the live Stripe Price for the Blueprint (scripts/create-blueprint-price.ts against the production key), then set `BLUEPRINT_STRIPE_PRICE_ID`, `BLUEPRINT_BLOB_KEY_PDF`, `BLUEPRINT_BLOB_KEY_EPUB`, `BLUEPRINT_DOWNLOAD_SECRET` in Vercel production. Redeploy. Verify: POST to the production checkout route returns 200 with a Stripe URL.
- Free CRR ebook: upload the built PDF and ePub to the private Blob store (`npm run crr-free-ebook:upload`) and set `CRR_FREE_EBOOK_BLOB_KEY_PDF` and `_EPUB` in Vercel. Depends on the branch being merged and deployed (Alex's call).

### 2. Nurture engine (`src/lib/nurture/`)

Data model (added to `scripts/migrate.ts`, idempotent):

```sql
CREATE TABLE IF NOT EXISTS course_nurture_enrollments (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  sequence_key TEXT NOT NULL,
  next_step INT NOT NULL DEFAULT 0,
  next_send_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','stopped')),
  stop_reason TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, sequence_key)
);
CREATE INDEX ... ON course_nurture_enrollments (status, next_send_at);

CREATE TABLE IF NOT EXISTS course_nurture_sends (
  id SERIAL PRIMARY KEY,
  enrollment_id INT NOT NULL REFERENCES course_nurture_enrollments(id) ON DELETE CASCADE,
  step INT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, step)
);
```

Sequences are code, not rows: `src/lib/nurture/sequences/<key>.ts` exports a `NurtureSequence` `{ key, from, steps: NurtureStep[] }` where a step is `{ delayHours, subject, preheader, html(ctx) }`. `ctx` carries `email`, `firstName?`, `metro?`, `carsToday?`, `unsubscribeUrl`, `baseUrl`. Copy follows the founders' voices: RRR emails sign off Della, CRR emails sign off Alex. No em-dashes anywhere. Every email carries the one-click unsubscribe link from `buildUnsubscribeUrl` and the earnings disclaimer where earnings are discussed.

Engine (`src/lib/nurture/engine.ts`):

- `enrollInNurture({ email, sequenceKey, context })`: upserts an enrollment with `next_send_at = NOW() + steps[0].delayHours`. Re-enrolling an existing row is a no-op (never restarts a sequence). Returns `{ enrolled: boolean }`. Never throws to callers; logs and returns false.
- `stopNurture(email, reason, sequenceKeys?)`: marks active enrollments stopped. Used on unsubscribe, bounce, complaint, and purchase.
- `processDueNurture({ now, limit })`: selects active enrollments with `next_send_at <= now`, skipping any email present in `unsubscribes`; for each, renders the step, sends via Resend, records the send row (the `UNIQUE (enrollment_id, step)` makes retries idempotent), then advances `next_step` and `next_send_at`, or marks `completed` after the last step. A Resend failure records the error and leaves the enrollment unchanged so the next tick retries.
- Pure helpers in `src/lib/nurture/schedule.ts` (`nextSendAt`, `isSuppressed`, `advance`) are unit-tested with `node:test` via `node --import tsx --test`. This is the first test harness in the repo; add `npm test`.

Cron: `src/app/api/cron/process-course-nurture/route.ts`, gated by the `x-vercel-cron` header exactly like the audit nurture, scheduled `*/15 * * * *` in `vercel.json`.

Suppression sources: `unsubscribes` table (already written by `/api/unsubscribe`), Resend webhook `email.bounced` and `email.complained` (call `stopNurture`), and purchase (the Stripe webhook calls `stopNurture` for the matching sequences when a buyer converts).

### 3. Sequences shipped in this pass

| Key | Trigger | Steps | Signed |
|---|---|---|---|
| `rrr_welcome` | RRR resource tool lead, RRR waitlist (any tier), newsletter source `home` or `insights` | 4 emails over 8 days: what co-living by the room is, the viability math, Della's operator story, the Blueprint at $32 as the next step | Della |
| `rrr_book` | Blueprint purchase webhook | 3 emails over 10 days: how to read the book, the one exercise to do first, the course waitlist ask | Della |
| `crr_ebook` (Sequence D) | free ebook request | D2 to D5 from `02_Funnel/email_sequences.md` | Alex |
| `crr_calculator` (Sequence C) | Autos-tab tool lead, `/turo-calculator` | C2 to C5 | Alex |
| `crr_waitlist` | CRR waitlist | 3 emails over 7 days: what changed in 2026, the calculator, the free ebook; presale mention only says "you will hear first" | Alex |

Segmentation by `carsToday` and `metro` happens inside a step's `html(ctx)` (one sequence, branching copy), not as separate sequences.

### 4. Enrollment hooks (existing routes, one call each)

- `POST /api/newsletter`: source `crr-free-ebook` is enrolled by the ebook route, not here; other sources enroll in `rrr_welcome`.
- `POST /api/crr-free-ebook/request`: enroll `crr_ebook` with metro and carsToday.
- `recordResourceToolLead`: RRR tools (co-living category) enroll `rrr_welcome`; Autos tools enroll `crr_calculator`. Category comes from the resource registry.
- `POST /api/waitlist`: `room-rental-riches` enrolls `rrr_welcome`; `car-rental-riches` enrolls `crr_waitlist`.
- Stripe webhook: `fulfillBlueprint` enrolls `rrr_book` and stops `rrr_welcome`; `fulfillCrrPresale` and the bundle stop every CRR sequence.

### 5. CRR presale gating

`isCrrPresaleOpen()` in `src/lib/car-rental-riches.ts` returns `!!getCrrPresalePriceId()`. The course page and `CarRentalRichesTierPreview` take an `presaleOpen` prop from the server component. When closed: no buy buttons anywhere, the hero eyebrow reads "Founding price $197 · presale opens with Module 1", the self-paced tier card shows "Join the waitlist" and "Founding $197 locks for the waitlist", and the copy stops promising "within 30 days of launch". The checkout route stays as is (503 while unset).

### 6. Operator Bundle rails

`src/lib/operator-bundle.ts`: tag `sharing-economy-operator-bundle`, $497, env `OPERATOR_BUNDLE_STRIPE_PRICE_ID`, `isOperatorBundleOpen()`. Anonymous checkout at `POST /api/operator-bundle/checkout` (same shape as the CRR presale route). Webhook branch `fulfillOperatorBundle`: provision the account, grant `self-paced` enrollment on both courses, one welcome email, stop all nurture sequences. Display: a "Both courses, $497" band on both course pages, rendered only when open. Nothing is visible until Alex sets the env var, which he will not do until both courses are sellable.

### 7. Measurement

- Server-side PostHog events (existing `getPostHogClient`): `nurture_enrolled`, `nurture_sent`, `nurture_stopped`, with `sequence_key` and `step`.
- `scripts/funnel-report.ts`: prints the last 4 weeks by week: new leads by source, nurture sends and errors, waitlist signups per course, purchases by product. Run with `node --env-file=.env.local --import tsx scripts/funnel-report.ts`.

### 8. Traffic (docs only)

Every weekly-content piece for BNHG, BNP, and BNA points at one magnet per course with `?utm_source=<platform>&utm_medium=social&utm_campaign=<course>`: RRR pieces to `/resources/co-living-viability-calculator` or the Blueprint; CRR pieces to `/before-you-buy-the-car` or `/turo-calculator`. One YouTube long-form per course per month. Recorded in `Car Rental Riches/02_Funnel/funnel_map.md` and the RRR funnel note.

## Error handling

Every hook is best-effort: a nurture failure never blocks a signup, a download, or a purchase. The cron never throws; per-enrollment errors are logged to `course_nurture_sends.error` and retried next tick. Suppression is checked at send time, not only at enrollment.

## Testing

- `npm test`: schedule and suppression helpers.
- `npm run lint` and `npx tsc --noEmit` clean.
- Local dry run: `scripts/nurture-dry-run.ts` renders every step of every sequence to HTML files in the scratchpad for a visual check, and sweeps for em-dashes.
- Production verification after Alex deploys: POST checkout returns a Stripe URL; cron route returns 403 without the header; one test enrollment advances on the next tick.

## Out of scope for this pass, queued

Founding launch broadcast (Sequence A), post-completion Sequence F, referral codes, the CRR course sales-page copy v2, the RRR self-paced open.
