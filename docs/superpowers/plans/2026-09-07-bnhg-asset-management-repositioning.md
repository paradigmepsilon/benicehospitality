# BNHG Asset-Management Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition benicehospitality.com from "The Operator's Company for the Sharing Economy" to sharing-economy asset management for the Southeast, with a three-bin ladder (Resources → Training → Management), a working management application funnel, and the boutique/Signal/consulting surfaces pruned.

**Architecture:** Consolidate in place. Keep the Next.js app, auth, Stripe, resources registry, booking calendar, and nurture engine exactly as they are. New surfaces are additive (`/management/*`, `/training`, two estimator registry tools); retired surfaces become 308 redirects in the existing `next.config.ts` `redirects()` block. One new table (`management_applications`), one new admin page, three new nurture sequences, no destructive migrations.

**Tech Stack:** Next.js 16.1.6 App Router (nodejs runtime routes), React 19.2.3, `@neondatabase/serverless` via `@/lib/db`, Resend, Stripe, PostHog, Tailwind 4, `node:test` run through tsx.

**Spec:** `docs/superpowers/specs/2026-09-07-bnhg-asset-management-repositioning-design.md`

**Plan location note:** plan-mode restricts edits to this file. After approval, copy this to `docs/superpowers/plans/2026-09-07-bnhg-asset-management-repositioning.md` so it lives beside the spec and the prior course-funnel plan.

---

## Context

BNHG's site currently sells four unrelated things: courses, a boutique-hotel consulting offer (Signal), an AI-labs experiment, and a hotel audit funnel. The spec collapses that into one story: BNHG manages the assets it teaches you to run. Fleet and co-living only, six Southeast states (GA, FL, SC, NC, AL, TN), BNHG as the sole contracting party with BNP and BNA invisible underneath.

The audience is effectively zero (14 emails, no course purchases as of 2026-09). The site's job is to convert a trickle from content engines and the Facebook group, not to create traffic. Scope is sized to that: no new design system, no ads, no ESP changes.

### Decisions taken during planning (2026-09-07)

These override the spec where they conflict. The spec was written against assumptions that exploration disproved.

1. **Estimator is an account-gated registry tool, not an email gate.** The spec assumed it could reuse a `free-email` unlock. That unlock was deleted in the account-required cutover: `POST /api/resources/[slug]/unlock` no longer exists and `access: "free-email"` is a vestigial label. Alex chose account-required. Consequence to accept: a cold visitor must create an account to see their number.
2. **Two estimator tools, one front door.** The registry maps one tool to one `category`, and `recordResourceToolLead()` routes nurture off that category. A single combined tool could only ever enroll one sequence. So `/estimate` is a thin chooser page that hands off to `car-earnings-estimator` (fleet lane) and `room-earnings-estimator` (property lane).
3. **Audit: cut acquisition only.** Remove `/audit/request`, `/audit/request/thanks`, `POST /api/audit/request`, and delist audit from nav/footer/sitemap. **Keep** `/audit/[token]`, its APIs, the `audits`/`audit_views`/`audit_events`/`nurture_queue` tables, and all five crons. Rationale: `/audit/[token]` is the landing page every already-sent outreach email links to via `buildAuditUrl()`, and `/api/cron/process-nurture` hard-joins those tables.
4. **"Nice Host Network" rename: marketing and community surfaces only.** Course tier feature bullets, Stripe purchase emails, the verification email, nurture copy, and the `migrate.ts` seed string are left alone this phase so nothing a paying buyer was promised changes mid-flight.
5. **Full prune including legal copy.** `/terms` and `/privacy` carry Signal engagement and IP clauses for services BNHG will no longer sell. Those get rewritten. **Legal flag: Alex reviews the `/terms` and `/privacy` diff before merge. Do not merge legal copy on the executor's judgment alone.**

### Facts established by exploration that the spec got wrong

Read these before starting. Each one invalidates something the spec asserts.

| Spec says | Reality |
|---|---|
| `withErrorHandling` pattern in API routes | **Does not exist.** No wrapper of any kind. Every route is a bare `export async function POST` with an inline try/catch. |
| `sendEmail` helper | **Does not exist.** Only `sendAuditEmail` in `src/lib/email/send.ts`. The house pattern is a module-local lazily-cached `getResend()`. |
| Estimator reuses email capture "for free" | Email unlock route deleted; tools are account-gated. See decision 1. |
| Seed rates from the two existing calculators | Neither holds market rates. `co-living-profit-calculator` is a 12-month P&L of user-entered numbers; `vehicle-profitability-calculator` inputs are all editable. **No metro rate data exists anywhere in the repo.** |
| `SERVICES_*` in `constants.ts` | Actual symbols are `SERVICE_TIERS_PREVIEW`, `TIER_ONE_SERVICES`, `TIER_TWO_SERVICES`, `TIER_THREE_SERVICES`. |
| Remove forum parts of `community-auth.ts` | **No-op and dangerous.** That file has zero forum code. It is the site-wide auth backbone: 49 importers covering LMS, ClaimProof, resources, scorecard, admin, and the Stripe webhook. Do not touch it. |
| Signal spotlight on the homepage | Live homepage does not render it. It exists only on `/preview/home` (noindex staging). |
| "about twenty" Nice Host Network files | 44 files. Scope narrowed by decision 4. |
| Hotel audit cron | **No audit cron exists.** `vercel.json` has five crons; none is an audit cron, though `process-nurture` joins audit tables. Spec's open item 5 is moot. |
| `/education` is a stub to replace | It is a 9-line `redirect("/courses/room-rental-riches")`, and `/courses` 308s to it, creating a live two-hop chain to collapse. |
| `/books` footer column | **`/books` has no index page.** Only three static children exist. Either build an index or point the footer at the three children. |

---

## Global Constraints

- **No em-dashes (U+2014) or en-dashes (U+2013)** in any page copy, email copy, or comment. Rewrite as two sentences or a comma. Sweep before each commit: `grep -rPn '[–—]' src/`.
- **Voice:** professional, warm, operator-to-operator. Short declarative sentences, specifics over abstractions. Banned words: "unlock", "transform", "game-changer", "revolutionary", "passive", "secret", "hack", "seamless".
- **No invented numbers.** Fees, minimums, capacity, metro rates, and proof-band figures come from Alex. Every unfilled number renders as structure-only copy behind a gate, never as a placeholder digit on a live page. If a task needs a number Alex has not given, ship the gated fallback and list it in the handoff.
- **BNHG is the only brand named** on owner-facing surfaces. Never name BNP or BNA on `/management/*`, `/estimate`, or the homepage.
- **Do not touch:** `src/lib/community-auth.ts`, the audit tables or any cron, Stripe fulfillment or webhook dispatch, course content, tiers, or prices, the lesson build pipeline under `Courses/` and `scripts/lessons/`.
- **Unset env hides the surface, never renders a dead link.** Same pattern as `isCrrPresaleOpen()` in `src/lib/car-rental-riches.ts:60`.
- **New `BOOKING_SOURCES` values must be under 80 characters** (`bookings.click_source` is `VARCHAR(80)`). Never delete an existing key: `VALID_BOOKING_SOURCES` is a runtime allowlist and historic rows must keep validating.
- `npx tsc --noEmit`, `npm run lint`, and `npm test` clean before each commit.
- Work on branch `bnhg/asset-management-2026-09`. **No push, no merge, no deploy without Alex.**

---

## File Structure

**New modules**

| Path | Responsibility |
|---|---|
| `src/lib/management/constants.ts` | Service-area states, offer definitions, fee-model gating. Single source for both offer pages. |
| `src/lib/management/applications.ts` | `management_applications` reads and writes. |
| `src/lib/management/validate.ts` | Pure application-payload validation. Unit-tested. |
| `src/lib/estimate/rates.ts` | Metro rate lookup table (empty until Alex fills it) + `lookupRate()`. |
| `src/lib/estimate/model.ts` | Pure gross/net arithmetic. Unit-tested. |
| `src/lib/estimate/flag.ts` | `isEstimatorEnabled()` env gate. |
| `src/lib/nurture/sequences/estimate-car.ts` | 5-step sequence, signed Alex. |
| `src/lib/nurture/sequences/estimate-rooms.ts` | 5-step sequence, signed Della. |
| `src/lib/nurture/sequences/mgmt-applicant.ts` | 3-step sequence over 7 days, stops on booking. |
| `src/components/sections/management/ManagementOffer.tsx` | One template, two offer pages. |
| `src/components/sections/management/ApplicationForm.tsx` | Client form for `/management/apply`. |
| `src/components/resources/earnings-estimator/EarningsEstimator.tsx` | Shared estimator UI, `asset` prop. |

**New routes:** `/estimate`, `/management`, `/management/fleet`, `/management/co-living`, `/management/apply`, `/training`, `/resources/car-earnings-estimator`, `/resources/room-earnings-estimator`, `/admin/applications`, `POST /api/management/apply`.

**Deleted:** `/signal/*`, `/services`, `/boutique-stays`, `/labs/*`, `/audit/request*`, `/preview/home`, `/account/community/*`, `/api/forum/*`, `src/lib/forum.ts`, `src/components/sections/{signal,services,forum,labs,home-v2,offerings,co-living}/`, `src/lib/tier-zero-resources.ts`, `/resources/[slug]`, and 6 orphaned `sections/home/*` components.

---

### Task 1: Branch, prune the orphans, collapse the redirect chain

Pure deletion of code with zero inbound references, plus the one existing redirect bug. Nothing user-visible changes. This lands first so later tasks work in a smaller repo.

**Files:**
- Delete: `src/components/sections/signal/` (all 10 files, verified 0 importers)
- Delete: `src/components/sections/home/{AEOCallout,ServiceTiersPreview,HomeCTA,GuestallyIntro,PainPointsSection,TestimonialsSection,WhoWeServeSection}.tsx` (7 files, 0 importers)
- Delete: `src/app/(marketing)/preview/home/page.tsx` and `src/components/sections/home-v2/` (11 files) — staging for an IA this plan replaces
- Modify: `next.config.ts` (redirects array)

**Interfaces:**
- Produces: nothing importable. Reduces the surface later tasks must grep.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b bnhg/asset-management-2026-09
git status --short
```

- [ ] **Step 2: Verify each deletion target really has no importers**

Run this and confirm every count is 0 before deleting anything:

```bash
for f in AEOCallout ServiceTiersPreview HomeCTA GuestallyIntro PainPointsSection TestimonialsSection WhoWeServeSection; do
  echo -n "$f: "; grep -rl "sections/home/$f" src/ | grep -v "sections/home/$f.tsx" | wc -l
done
echo -n "signal components: "; grep -rl "sections/signal/" src/ | grep -v "^src/components/sections/signal/" | wc -l
echo -n "home-v2: "; grep -rl "home-v2" src/ | grep -v "^src/components/sections/home-v2/" | grep -v "preview/home" | wc -l
```

Expected: every line prints `0`. If any prints non-zero, stop and report which file has a live importer.

- [ ] **Step 3: Delete**

```bash
git rm -r src/components/sections/signal src/components/sections/home-v2 "src/app/(marketing)/preview"
git rm src/components/sections/home/{AEOCallout,ServiceTiersPreview,HomeCTA,GuestallyIntro,PainPointsSection,TestimonialsSection,WhoWeServeSection}.tsx
```

- [ ] **Step 4: Collapse the `/courses` two-hop chain**

In `next.config.ts`, the first redirect currently sends `/courses` to `/education`, which then runtime-redirects again. The file's own comment at the redirects block says to point legacy slugs straight at the current destination. `/education` becomes `/training` in Task 9, so point `/courses` there now and leave a note:

```ts
// /courses and /education both resolve to the Training hub. Pointing /courses
// straight at /training avoids the two-hop chain the old entry created.
{ source: "/courses", destination: "/training", permanent: true },
```

Leave every other existing redirect untouched.

- [ ] **Step 5: Verify the build still compiles**

Run: `npx tsc --noEmit && npm run lint`
Expected: both clean. A failure here means something did import a "orphan" file; re-run Step 2's grep for the named symbol.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(ia): delete orphaned Signal, home, and home-v2 components

Ten sections/signal components, seven unrendered sections/home components,
and the eleven-file home-v2 set behind the noindex /preview/home staging
route all had zero live importers. Also collapses the /courses to /education
to /courses/room-rental-riches two-hop redirect chain.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Management constants and the service area

The shared data both offer pages, the apply form, and the estimator read from. Pure module, no I/O, unit-tested.

**Files:**
- Create: `src/lib/management/constants.ts`
- Create: `src/lib/management/constants.test.ts`

**Interfaces:**
- Produces:
  - `SERVICE_AREA_STATES: readonly { code: string; name: string }[]` (6 entries)
  - `SERVICE_AREA_LABEL: string` ("GA · FL · SC · NC · AL · TN")
  - `type ManagedAsset = "car" | "rooms"`
  - `MANAGEMENT_OFFERS: Record<ManagedAsset, ManagementOffer>`
  - `interface ManagementOffer { asset; slug; name; promise; handles: string[]; ownerKeeps: string[]; operator: { name; blurb } }`
  - `getManagementFeeModel(asset): FeeModel | null` — returns `null` until env is set, so pages render structure-only copy
  - `isServiceAreaState(code: string): boolean`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/management/constants.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_AREA_STATES,
  SERVICE_AREA_LABEL,
  MANAGEMENT_OFFERS,
  isServiceAreaState,
  getManagementFeeModel,
} from "./constants";

test("service area is exactly the six Southeast states", () => {
  assert.equal(SERVICE_AREA_STATES.length, 6);
  assert.deepEqual(
    SERVICE_AREA_STATES.map((s) => s.code),
    ["GA", "FL", "SC", "NC", "AL", "TN"],
  );
});

test("service area label lists every state", () => {
  for (const s of SERVICE_AREA_STATES) {
    assert.ok(SERVICE_AREA_LABEL.includes(s.code), `${s.code} missing from label`);
  }
});

test("isServiceAreaState is case insensitive and rejects outsiders", () => {
  assert.equal(isServiceAreaState("ga"), true);
  assert.equal(isServiceAreaState("TN"), true);
  assert.equal(isServiceAreaState("TX"), false);
  assert.equal(isServiceAreaState(""), false);
});

test("both offers exist and name no operating company", () => {
  const banned = ["Be Nice Properties", "Be Nice Autos", "BNP", "BNA"];
  for (const asset of ["car", "rooms"] as const) {
    const offer = MANAGEMENT_OFFERS[asset];
    assert.equal(offer.asset, asset);
    assert.ok(offer.handles.length > 0);
    assert.ok(offer.ownerKeeps.length > 0);
    const blob = JSON.stringify(offer);
    for (const b of banned) {
      assert.ok(!blob.includes(b), `${asset} offer names ${b}`);
    }
  }
});

test("fee model stays null until env is configured", () => {
  delete process.env.MANAGEMENT_FEE_CAR_PCT;
  assert.equal(getManagementFeeModel("car"), null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/management/constants.test.ts`
Expected: FAIL, cannot find module `./constants`.

- [ ] **Step 3: Implement**

```ts
// src/lib/management/constants.ts
/**
 * Shared data for the management bin. BNHG is the contracting party on every
 * owner-facing surface, so nothing here names an operating company. Fees are
 * env-gated: getManagementFeeModel returns null until Alex sets real numbers,
 * and the offer pages render structure-only copy in that state. No invented
 * fee ever renders.
 */

export type ManagedAsset = "car" | "rooms";

export const SERVICE_AREA_STATES = [
  { code: "GA", name: "Georgia" },
  { code: "FL", name: "Florida" },
  { code: "SC", name: "South Carolina" },
  { code: "NC", name: "North Carolina" },
  { code: "AL", name: "Alabama" },
  { code: "TN", name: "Tennessee" },
] as const;

export const SERVICE_AREA_LABEL = SERVICE_AREA_STATES.map((s) => s.code).join(" · ");

export function isServiceAreaState(code: string): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  return SERVICE_AREA_STATES.some((s) => s.code === upper);
}

export interface ManagementOffer {
  asset: ManagedAsset;
  slug: string;
  name: string;
  promise: string;
  handles: string[];
  ownerKeeps: string[];
  operator: { name: string; blurb: string };
}

export const MANAGEMENT_OFFERS: Record<ManagedAsset, ManagementOffer> = {
  car: {
    asset: "car",
    slug: "fleet",
    name: "Fleet Management",
    promise: "Your vehicle earns without becoming your second job.",
    handles: [
      "Listing and photography",
      "Pricing and calendar",
      "Turnover and cleaning",
      "Damage claims and disputes",
      "Maintenance coordination",
      "Renter communication",
    ],
    ownerKeeps: [
      "Title and registration",
      "Insurance policy and carrier choice",
      "Capital decisions, including when to buy or sell",
      "Final say on any major repair",
    ],
    operator: {
      name: "Alex Henry",
      blurb:
        "Alex runs the fleet side day to day and built the systems this service runs on.",
    },
  },
  rooms: {
    asset: "rooms",
    slug: "co-living",
    name: "Co-living Management",
    promise: "Your spare rooms earn without becoming your second job.",
    handles: [
      "Listing and photography",
      "Tenant screening",
      "Leases and renewals",
      "Rent collection",
      "House rules and conflict resolution",
      "Turnover between tenants",
      "Maintenance coordination",
      "Tenant communication",
    ],
    ownerKeeps: [
      "Title and mortgage",
      "Insurance policy and carrier choice",
      "Capital decisions, including refinance and sale",
      "Final say on any major repair",
    ],
    operator: {
      name: "Della Henry",
      blurb:
        "Della runs the co-living side day to day across five Southeast cities.",
    },
  },
};

export interface FeeModel {
  grossPct: number;
  onboardingUsd: number;
  minimumTermMonths: number;
}

/**
 * Null until every value is configured. Partial configuration is treated as
 * unconfigured on purpose: a page showing a percentage but no minimum term
 * would be a worse promise than one that says "we cover this on the call".
 */
export function getManagementFeeModel(asset: ManagedAsset): FeeModel | null {
  const suffix = asset === "car" ? "CAR" : "ROOMS";
  const pct = process.env[`MANAGEMENT_FEE_${suffix}_PCT`];
  const onboarding = process.env[`MANAGEMENT_FEE_${suffix}_ONBOARDING_USD`];
  const term = process.env[`MANAGEMENT_FEE_${suffix}_MIN_TERM_MONTHS`];
  if (!pct || !onboarding || !term) return null;
  const parsed = {
    grossPct: Number(pct),
    onboardingUsd: Number(onboarding),
    minimumTermMonths: Number(term),
  };
  if (Object.values(parsed).some((n) => !Number.isFinite(n))) return null;
  return parsed;
}
```

- [ ] **Step 4: Run tests**

Run: `node --import tsx --test src/lib/management/constants.test.ts`
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/management/
git commit -m "feat(management): service area, offer definitions, gated fee model

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Application table, validation, and booking prefill

The data spine for the apply funnel. Includes a real gap the spec assumed away: `bookingUrl()` has no name/email prefill and `BookingCalendar` never reads them, so the apply-to-book handoff cannot prefill anything today.

**Files:**
- Modify: `scripts/migrate.ts` (append a new table block before the closing log)
- Create: `src/lib/management/validate.ts`
- Create: `src/lib/management/validate.test.ts`
- Modify: `src/lib/booking-url.ts` (add sources + prefill options)
- Modify: `src/components/sections/book/BookingCalendar.tsx` (read prefill params)

**Interfaces:**
- Consumes: `isServiceAreaState` from Task 2.
- Produces:
  - `validateApplication(raw: unknown): { ok: true; value: ApplicationInput } | { ok: false; error: string }`
  - `interface ApplicationInput { name; email; phone; asset: ManagedAsset; assetCount; state; city; currentStatus; timeline; wants; heardFrom }`
  - `bookingUrl()` gains `prefillName?: string` and `prefillEmail?: string`
  - New `BOOKING_SOURCES` keys: `MGMT_APPLY_CAR`, `MGMT_APPLY_ROOMS`, `MGMT_FLEET_HERO`, `MGMT_FLEET_FINAL_CTA`, `MGMT_COLIVING_HERO`, `MGMT_COLIVING_FINAL_CTA`, `MGMT_OVERVIEW_CTA`, `HOME_OWNER_PORTAL`

- [ ] **Step 1: Write the failing validation test**

```ts
// src/lib/management/validate.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateApplication } from "./validate";

const good = {
  name: "Sam Rivera",
  email: "Sam@Example.COM ",
  phone: "770-555-0100",
  asset: "car",
  assetCount: "2",
  state: "ga",
  city: "Atlanta",
  currentStatus: "on_platform",
  timeline: "30_days",
  wants: "Tired of handling turnovers on weekends.",
  heardFrom: "facebook_group",
};

test("accepts a complete application and normalizes email and state", () => {
  const r = validateApplication(good);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.email, "sam@example.com");
  assert.equal(r.value.state, "GA");
  assert.equal(r.value.assetCount, 2);
});

test("rejects a state outside the six-state service area", () => {
  const r = validateApplication({ ...good, state: "TX" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /service area/i);
});

test("rejects a missing email and a malformed one", () => {
  assert.equal(validateApplication({ ...good, email: "" }).ok, false);
  assert.equal(validateApplication({ ...good, email: "nope" }).ok, false);
});

test("rejects an unknown asset type", () => {
  assert.equal(validateApplication({ ...good, asset: "boat" }).ok, false);
});

test("rejects a non-object payload", () => {
  assert.equal(validateApplication(null).ok, false);
  assert.equal(validateApplication("hi").ok, false);
});

test("clamps assetCount to a sane range", () => {
  assert.equal(validateApplication({ ...good, assetCount: "0" }).ok, false);
  const r = validateApplication({ ...good, assetCount: "9999" });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.assetCount, 999);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/management/validate.test.ts`
Expected: FAIL, cannot find module `./validate`.

- [ ] **Step 3: Implement the validator**

```ts
// src/lib/management/validate.ts
/**
 * Hand-rolled validation, matching the house style in the existing capture
 * routes. Returns a discriminated result rather than throwing so the route can
 * keep the visitor's form state and show one inline message.
 */

import { isServiceAreaState, type ManagedAsset } from "./constants";

export interface ApplicationInput {
  name: string;
  email: string;
  phone: string;
  asset: ManagedAsset;
  assetCount: number;
  state: string;
  city: string;
  currentStatus: string;
  timeline: string;
  wants: string;
  heardFrom: string;
}

export type ApplicationResult =
  | { ok: true; value: ApplicationInput }
  | { ok: false; error: string };

const CURRENT_STATUS = ["idle", "self_managed", "on_platform"];
const TIMELINE = ["now", "30_days", "90_days", "exploring"];

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validateApplication(raw: unknown): ApplicationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Missing application details." };
  }
  const r = raw as Record<string, unknown>;

  const name = str(r.name, 120);
  if (!name) return { ok: false, error: "Please add your name." };

  const email = str(r.email, 200).toLowerCase();
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    return { ok: false, error: "Please add a valid email address." };
  }

  const asset = str(r.asset, 10);
  if (asset !== "car" && asset !== "rooms") {
    return { ok: false, error: "Please choose a car or rooms." };
  }

  const state = str(r.state, 2).toUpperCase();
  if (!isServiceAreaState(state)) {
    return {
      ok: false,
      error: "We manage assets in Georgia, Florida, South Carolina, North Carolina, Alabama, and Tennessee. That state is outside our service area today.",
    };
  }

  const countRaw = Number(str(r.assetCount, 6));
  if (!Number.isFinite(countRaw) || countRaw < 1) {
    return { ok: false, error: "How many do you have? Please enter at least one." };
  }
  const assetCount = Math.min(Math.floor(countRaw), 999);

  const currentStatus = str(r.currentStatus, 20);
  if (!CURRENT_STATUS.includes(currentStatus)) {
    return { ok: false, error: "Please tell us how the asset is used today." };
  }

  const timeline = str(r.timeline, 20);
  if (!TIMELINE.includes(timeline)) {
    return { ok: false, error: "Please pick a timeline." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      phone: str(r.phone, 40),
      asset,
      assetCount,
      state,
      city: str(r.city, 120),
      currentStatus,
      timeline,
      wants: str(r.wants, 2000),
      heardFrom: str(r.heardFrom, 120),
    },
  };
}
```

- [ ] **Step 4: Run tests**

Run: `node --import tsx --test src/lib/management/validate.test.ts`
Expected: 6 tests PASS.

- [ ] **Step 5: Add the table to `scripts/migrate.ts`**

Append this block near the other late-added tables, immediately before the final `console.log("Migrations complete!")`. Follow the file's conventions exactly: `IF NOT EXISTS`, `SERIAL PRIMARY KEY`, `TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `CHECK` for enums, a `✓` log.

```ts
  await sql`
    CREATE TABLE IF NOT EXISTS management_applications (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      asset TEXT NOT NULL CHECK (asset IN ('car', 'rooms')),
      asset_count INTEGER NOT NULL DEFAULT 1,
      state VARCHAR(2) NOT NULL,
      city TEXT,
      current_status TEXT NOT NULL,
      timeline TEXT NOT NULL,
      wants TEXT,
      heard_from TEXT,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new','contacted','call_booked','qualified','declined','signed')),
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Admin list is "newest first, optionally filtered by status", so one
  // composite index serves the default view and every filtered view.
  await sql`
    CREATE INDEX IF NOT EXISTS idx_management_applications_status
    ON management_applications(status, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_management_applications_email
    ON management_applications(email)
  `;
  console.log("  ✓ management_applications table created");
```

- [ ] **Step 6: Run the migration and confirm the table exists**

Run: `npm run db:migrate`
Expected: output ends with `Migrations complete!` and includes `✓ management_applications table created`. Re-run it once more and confirm it succeeds again (idempotency).

- [ ] **Step 7: Add booking sources and prefill support**

In `src/lib/booking-url.ts`, append the eight new keys to `BOOKING_SOURCES` (do not remove or rename any existing key), and extend the options:

```ts
  // Management bin. BNHG is the contracting party on all of these.
  MGMT_OVERVIEW_CTA: "mgmt_overview_cta",
  MGMT_FLEET_HERO: "mgmt_fleet_hero",
  MGMT_FLEET_FINAL_CTA: "mgmt_fleet_final_cta",
  MGMT_COLIVING_HERO: "mgmt_coliving_hero",
  MGMT_COLIVING_FINAL_CTA: "mgmt_coliving_final_cta",
  MGMT_APPLY_CAR: "mgmt_apply_car",
  MGMT_APPLY_ROOMS: "mgmt_apply_rooms",
  HOME_OWNER_PORTAL: "home_owner_portal",
```

Then in `BookingUrlOptions` add `prefillName?: string; prefillEmail?: string;` and in `bookingUrl()` append, keeping the existing fixed key order and adding the two new keys last:

```ts
  if (options.prefillName) p.set("name", options.prefillName);
  if (options.prefillEmail) p.set("email", options.prefillEmail);
```

- [ ] **Step 8: Read the prefill params in `BookingCalendar`**

In `src/components/sections/book/BookingCalendar.tsx`, extend the existing founder/source `useEffect` (the one that already parses `founder` and `source`) with two more reads. Do not add a new effect:

```ts
    const prefillName = params.get("name");
    if (prefillName) setName(prefillName.slice(0, 120));
    const prefillEmail = params.get("email");
    if (prefillEmail && prefillEmail.includes("@")) setEmail(prefillEmail.slice(0, 200));
```

Use whatever the component's existing name and email state setters are called. If they are not named `setName` and `setEmail`, match the real names; do not rename existing state.

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: all clean, 15 tests passing (4 pre-existing schedule tests plus 11 new).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(management): applications table, payload validation, booking prefill

Adds management_applications with a status check constraint and two indexes,
a pure validator that rejects out-of-area states, eight new booking sources,
and name/email prefill on bookingUrl plus BookingCalendar so the apply to
book handoff carries the applicant forward.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The mgmt_applicant nurture sequence

Three steps over seven days, stopping when a booking with a matching email is created.

**Files:**
- Create: `src/lib/nurture/sequences/mgmt-applicant.ts`
- Modify: `src/lib/nurture/types.ts` (add the key to the union and the key array)
- Modify: `src/lib/nurture/registry.ts` (register it)
- Modify: `src/lib/nurture/schedule.test.ts` (add a sequence-shape test)

**Interfaces:**
- Consumes: `NurtureSequence`, `NurtureContext`, `nurtureLayout`, `p`, `primaryButton`, `textLink`, `callout` from the existing nurture modules.
- Produces: `mgmtApplicant: NurtureSequence` with `key: "mgmt_applicant"`.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/nurture/schedule.test.ts`:

```ts
import { allSequences, getSequence } from "./registry";

test("mgmt_applicant is registered with three steps over seven days", () => {
  const seq = getSequence("mgmt_applicant");
  assert.equal(seq.steps.length, 3);
  const total = seq.steps.reduce((sum, s) => sum + s.delayHours, 0);
  assert.ok(total <= 7 * 24, `sequence runs ${total}h, longer than seven days`);
});

test("every sequence renders without throwing and carries an unsubscribe link", () => {
  const ctx = {
    email: "a@b.com",
    firstName: "Sam",
    baseUrl: "https://example.com",
    unsubscribeUrl: "https://example.com/unsubscribe?t=x",
  };
  for (const seq of allSequences()) {
    for (const [i, step] of seq.steps.entries()) {
      const html = step.html(ctx);
      assert.ok(html.length > 0, `${seq.key} step ${i} rendered empty`);
      assert.ok(
        html.includes(ctx.unsubscribeUrl),
        `${seq.key} step ${i} is missing the unsubscribe link`,
      );
    }
  }
});

test("no sequence copy contains an em dash or en dash", () => {
  const ctx = {
    email: "a@b.com",
    baseUrl: "https://example.com",
    unsubscribeUrl: "https://example.com/u",
  };
  for (const seq of allSequences()) {
    for (const [i, step] of seq.steps.entries()) {
      const blob = step.subject + step.preheader + step.html(ctx);
      assert.ok(!/[–—]/.test(blob), `${seq.key} step ${i} has a dash`);
    }
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/nurture/schedule.test.ts`
Expected: FAIL on `unknown sequence: mgmt_applicant`.

- [ ] **Step 3: Register the key**

In `src/lib/nurture/types.ts` add `| "mgmt_applicant"` to `NurtureSequenceKey` and `"mgmt_applicant"` to `NURTURE_SEQUENCE_KEYS`.

- [ ] **Step 4: Write the sequence**

```ts
// src/lib/nurture/sequences/mgmt-applicant.ts
/**
 * mgmt_applicant: someone applied for fleet or co-living management but has
 * not booked the call yet. Three touches over seven days, then it stops on its
 * own. The apply route stops it early when a booking lands for that address.
 *
 * Signed BNHG, not a founder. The management agreement is with the company,
 * and the owner-facing brand stays singular.
 */

import { nurtureLayout, p, primaryButton, textLink } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

function fromAddress(): string {
  return (
    process.env.MANAGEMENT_FROM_EMAIL ||
    process.env.BNHG_AUTH_FROM ||
    "BNHG <onboarding@resend.dev>"
  );
}

export const mgmtApplicant: NurtureSequence = {
  key: "mgmt_applicant",
  from: fromAddress,
  steps: [
    {
      delayHours: 24,
      subject: "Your management application, and what happens next",
      preheader: "A short call, then an asset review.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "A short call, then an asset review.",
          signoff: "BNHG",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Thanks for applying. Here is the whole process, so nothing is a surprise.")}
            ${p("First a call. Thirty minutes, no deck. We ask what the asset is, where it sits, and what you want it to do. Then an asset review, where we look at condition, location, and what the market actually pays. If it is a fit, you get an agreement and an onboarding checklist. If it is not, we say so on the call.")}
            ${primaryButton(`${ctx.baseUrl}/book`, "Pick a time")}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "The honest alternative to hiring us",
      preheader: "You can run this yourself. Here is what that takes.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "You can run this yourself. Here is what that takes.",
          signoff: "BNHG",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Management is not the only answer, and we would rather say that now than after you have signed something.")}
            ${p("If you have the time and you want the control, run it yourself. Our courses are the same playbook we operate on, written down. Plenty of owners take that route and never hire us. That is a good outcome.")}
            ${p(`If you would rather hand it off, the call is still open. ${textLink(`${ctx.baseUrl}/training`, "See the courses")} or ${textLink(`${ctx.baseUrl}/book`, "pick a time")}.`)}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "Still want us to look at it?",
      preheader: "Last note on your application.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Last note on your application.",
          signoff: "BNHG",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("This is the last email about your application. We keep it on file either way, so there is nothing to redo if the timing changes.")}
            ${p("If you want the asset review, book the call. If the timing is wrong, ignore this and we will leave you alone.")}
            ${primaryButton(`${ctx.baseUrl}/book`, "Book the call")}
          `,
        }),
    },
  ],
};
```

- [ ] **Step 5: Register in `src/lib/nurture/registry.ts`**

Add the import and the `mgmt_applicant: mgmtApplicant` entry to the `SEQUENCES` record.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: all pass, including the three new sequence tests. The em-dash and unsubscribe tests now cover every existing sequence too, so a failure there means a pre-existing sequence has a problem. If that happens, report it rather than editing the old sequence's copy without asking.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(nurture): mgmt_applicant sequence plus sequence-wide render tests

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The apply API route

Insert, notify, enroll, and hand off to booking. Follows the `POST /api/crr-free-ebook/request` shape exactly: rate limit, honeypot, Turnstile, hand-rolled validation, insert, best-effort side effects.

**Files:**
- Create: `src/lib/management/applications.ts`
- Create: `src/app/api/management/apply/route.ts`
- Modify: `src/lib/rate-limit.ts` (add one limiter)
- Modify: `src/lib/email-templates.ts` (add the internal notification body)

**Interfaces:**
- Consumes: `validateApplication` (Task 3), `enrollInNurture`, `stopNurture` (existing engine), `verifyTurnstileToken`, `getClientIp`.
- Produces:
  - `createApplication(input: ApplicationInput): Promise<{ id: number }>`
  - `listApplications(opts?: { status?: string; limit?: number }): Promise<ApplicationRow[]>`
  - `updateApplicationStatus(id: number, status: string, notes?: string): Promise<void>`
  - `internalManagementApplicationEmail(input: ApplicationInput & { id: number }): string`
  - `managementApplyLimiter` (5 per 15 minutes)

- [ ] **Step 1: Add the limiter**

In `src/lib/rate-limit.ts`, beside the other exported limiters:

```ts
export const managementApplyLimiter = createLimiter(5, 15 * 60 * 1000);
```

- [ ] **Step 2: Write the data module**

```ts
// src/lib/management/applications.ts
import { sql } from "@/lib/db";
import type { ApplicationInput } from "./validate";

export interface ApplicationRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  asset: "car" | "rooms";
  assetCount: number;
  state: string;
  city: string | null;
  currentStatus: string;
  timeline: string;
  wants: string | null;
  heardFrom: string | null;
  status: string;
  bookingId: number | null;
  notes: string | null;
  createdAt: string;
}

export async function createApplication(
  input: ApplicationInput,
): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO management_applications
      (name, email, phone, asset, asset_count, state, city,
       current_status, timeline, wants, heard_from)
    VALUES
      (${input.name}, ${input.email}, ${input.phone || null}, ${input.asset},
       ${input.assetCount}, ${input.state}, ${input.city || null},
       ${input.currentStatus}, ${input.timeline}, ${input.wants || null},
       ${input.heardFrom || null})
    RETURNING id
  `;
  return { id: Number(rows[0].id) };
}

export async function listApplications(
  opts: { status?: string; limit?: number } = {},
): Promise<ApplicationRow[]> {
  const limit = Math.min(opts.limit ?? 200, 500);
  const rows = opts.status
    ? await sql`
        SELECT * FROM management_applications
        WHERE status = ${opts.status}
        ORDER BY created_at DESC LIMIT ${limit}
      `
    : await sql`
        SELECT * FROM management_applications
        ORDER BY created_at DESC LIMIT ${limit}
      `;
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    email: r.email,
    phone: r.phone,
    asset: r.asset,
    assetCount: Number(r.asset_count),
    state: r.state,
    city: r.city,
    currentStatus: r.current_status,
    timeline: r.timeline,
    wants: r.wants,
    heardFrom: r.heard_from,
    status: r.status,
    bookingId: r.booking_id === null ? null : Number(r.booking_id),
    notes: r.notes,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function updateApplicationStatus(
  id: number,
  status: string,
  notes?: string,
): Promise<void> {
  if (notes === undefined) {
    await sql`
      UPDATE management_applications
      SET status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
    return;
  }
  await sql`
    UPDATE management_applications
    SET status = ${status}, notes = ${notes}, updated_at = NOW() WHERE id = ${id}
  `;
}
```

- [ ] **Step 3: Add the internal email body**

In `src/lib/email-templates.ts`, matching the style of the existing `internalResourceLeadEmail`:

```ts
export function internalManagementApplicationEmail(a: {
  id: number;
  name: string;
  email: string;
  phone: string;
  asset: string;
  assetCount: number;
  state: string;
  city: string;
  currentStatus: string;
  timeline: string;
  wants: string;
  heardFrom: string;
}): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#807868;">${label}</td><td style="padding:4px 0;color:#1a1a1a;">${value || "not given"}</td></tr>`;
  return `
    <h2 style="font-family:Georgia,serif;color:#1a1a1a;">New management application</h2>
    <p style="color:#3d3d3d;">Application #${a.id}. ${a.asset === "car" ? "Fleet" : "Co-living"}, ${a.assetCount} asset(s), ${a.city ? a.city + ", " : ""}${a.state}.</p>
    <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px;">
      ${row("Name", a.name)}
      ${row("Email", a.email)}
      ${row("Phone", a.phone)}
      ${row("Asset", a.asset)}
      ${row("Count", String(a.assetCount))}
      ${row("Location", [a.city, a.state].filter(Boolean).join(", "))}
      ${row("Today", a.currentStatus)}
      ${row("Timeline", a.timeline)}
      ${row("Heard from", a.heardFrom)}
    </table>
    <p style="color:#3d3d3d;"><strong>What they want:</strong><br>${a.wants || "not given"}</p>
  `;
}
```

- [ ] **Step 4: Write the route**

```ts
// src/app/api/management/apply/route.ts
/**
 * Management application intake. Mirrors the shape of every other capture
 * route in this repo: rate limit, honeypot, Turnstile, hand-rolled validation,
 * insert, then best-effort side effects that must never fail the submission.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { after } from "next/server";
import { sql } from "@/lib/db";
import { getClientIp, managementApplyLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";
import { CANONICAL_CALL_TYPE } from "@/lib/constants/call-types";
import { validateApplication } from "@/lib/management/validate";
import { createApplication } from "@/lib/management/applications";
import { internalManagementApplicationEmail } from "@/lib/email-templates";
import { enrollInNurture } from "@/lib/nurture/engine";
import { getPostHogClient } from "@/lib/posthog-server";

export const runtime = "nodejs";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!managementApplyLimiter.check(ip).success) {
      return NextResponse.json(
        { error: "Too many applications. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = await request.json();
    // Honeypot: silently accept so the bot does not learn anything.
    if (body?.website) return NextResponse.json({ success: true });

    if (!(await verifyTurnstileToken(body?.turnstileToken))) {
      return NextResponse.json({ error: "Verification failed." }, { status: 400 });
    }

    const result = validateApplication(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const input = result.value;

    const { id } = await createApplication(input);

    // Everything below is best effort. The application is already saved.
    after(async () => {
      try {
        await enrollInNurture({
          email: input.email,
          sequenceKey: "mgmt_applicant",
          context: { firstName: input.name.split(" ")[0] },
        });
      } catch (err) {
        console.error("[management] nurture enroll failed:", err);
      }
      try {
        const to = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@benicehospitality.com";
        const sent = await getResend().emails.send({
          from:
            process.env.MANAGEMENT_FROM_EMAIL ||
            process.env.BNHG_AUTH_FROM ||
            "BNHG <onboarding@resend.dev>",
          to,
          subject: `New management application: ${input.asset === "car" ? "Fleet" : "Co-living"}, ${input.state}`,
          html: internalManagementApplicationEmail({ ...input, id }),
        });
        // The Resend SDK returns { data, error } and does not throw on 4xx.
        if (sent.error) console.error("[management] admin email failed:", sent.error);
      } catch (err) {
        console.error("[management] admin email threw:", err);
      }
      try {
        getPostHogClient().capture({
          distinctId: input.email,
          event: "management_application_submitted",
          properties: { asset: input.asset, state: input.state, timeline: input.timeline },
        });
      } catch (err) {
        console.error("[management] posthog capture failed:", err);
      }
    });

    // Build the handoff with the shared helper so the source value stays in
    // sync with VALID_BOOKING_SOURCES and the param order matches every other
    // booking CTA on the site.
    return NextResponse.json({
      success: true,
      redirectTo: bookingUrl({
        callType: CANONICAL_CALL_TYPE,
        source:
          input.asset === "car"
            ? BOOKING_SOURCES.MGMT_APPLY_CAR
            : BOOKING_SOURCES.MGMT_APPLY_ROOMS,
        prefillName: input.name,
        prefillEmail: input.email,
      }),
    });
  } catch (err) {
    console.error("[management] apply failed:", err);
    // The spec asks for failed submissions to land in user_events. Best effort:
    // if the database is what broke, this write fails too and we still return
    // the friendly error rather than throwing again.
    try {
      await sql`
        INSERT INTO user_events (event_type, metadata)
        VALUES ('management_apply_failed', ${JSON.stringify({ message: String(err) })}::jsonb)
      `;
    } catch {
      // swallowed on purpose
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
```

The `user_events` columns are `event_type VARCHAR(64)` and `metadata JSONB` (`scripts/migrate.ts:863`). `user_id` is nullable, so an anonymous applicant's failure still records.

- [ ] **Step 5: Stop the sequence when a booking lands**

In `src/app/api/bookings/route.ts`, after the booking insert succeeds, add a best-effort stop. Place it beside the existing post-insert side effects, not before the insert:

```ts
    // A booked call ends the management applicant sequence for that address.
    try {
      await stopNurture(email, "booked_call", ["mgmt_applicant"]);
    } catch (err) {
      console.error("[management] stop on booking failed:", err);
    }
```

Import `stopNurture` from `@/lib/nurture/engine`. Use whatever the route's normalized email variable is actually called.

- [ ] **Step 6: Verify the route end to end against local**

```bash
npm run dev   # in another shell
curl -s -X POST http://localhost:3000/api/management/apply \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Owner","email":"admin@benicehospitality.com","phone":"7705550100","asset":"car","assetCount":"1","state":"GA","city":"Atlanta","currentStatus":"idle","timeline":"30_days","wants":"testing","heardFrom":"test"}'
```

Expected: `{"success":true,"redirectTo":"/book?call_type=discovery_call_45&source=mgmt_apply_car&name=Test%20Owner&email=..."}`.

Then confirm the row and the enrollment landed:

```bash
node --env-file=.env.local --import tsx -e '
import { sql } from "./src/lib/db.ts";
async function main() {
  console.log(await sql`SELECT id, name, asset, state, status FROM management_applications ORDER BY id DESC LIMIT 3`);
  console.log(await sql`SELECT email, sequence_key, status FROM course_nurture_enrollments WHERE sequence_key = ${"mgmt_applicant"} ORDER BY id DESC LIMIT 3`);
}
main();
'
```

Expected: one application row with `status = new`, one enrollment row with `status = active`. Note: top-level await is not allowed in this repo's tsx scripts, hence the `main()` wrapper.

Then check the out-of-area rejection:

```bash
curl -s -X POST http://localhost:3000/api/management/apply -H 'Content-Type: application/json' \
  -d '{"name":"T","email":"t@t.com","asset":"car","assetCount":"1","state":"TX","city":"Austin","currentStatus":"idle","timeline":"now"}'
```

Expected: HTTP 400 with the service-area message.

- [ ] **Step 7: Clean up the test rows**

```bash
node --env-file=.env.local --import tsx -e '
import { sql } from "./src/lib/db.ts";
async function main() {
  await sql`DELETE FROM management_applications WHERE heard_from = ${"test"}`;
  await sql`DELETE FROM course_nurture_enrollments WHERE sequence_key = ${"mgmt_applicant"} AND email = ${"admin@benicehospitality.com"}`;
  console.log("cleaned");
}
main();
'
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(management): apply API route, data module, admin notification

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Management pages

One template, two offer pages, one overview, one apply page. All nine sections from the spec, in order. Copy is written as BNHG; BNP and BNA are never named.

**Files:**
- Create: `src/components/sections/management/ManagementOffer.tsx`
- Create: `src/components/sections/management/ApplicationForm.tsx`
- Create: `src/app/(marketing)/management/page.tsx`
- Create: `src/app/(marketing)/management/fleet/page.tsx`
- Create: `src/app/(marketing)/management/co-living/page.tsx`
- Create: `src/app/(marketing)/management/apply/page.tsx`
- Modify: `next.config.ts` (308s for `/co-living`, `/fleet`, `/boutique-stays`)
- Modify: `src/app/sitemap.ts`
- Delete: `src/app/(marketing)/co-living/`, `src/app/(marketing)/fleet/`, `src/app/(marketing)/boutique-stays/`, `src/components/sections/co-living/` (7 files), `src/components/sections/offerings/` (4 files)

**Interfaces:**
- Consumes: `MANAGEMENT_OFFERS`, `SERVICE_AREA_LABEL`, `SERVICE_AREA_STATES`, `getManagementFeeModel` (Task 2); `bookingUrl`, `BOOKING_SOURCES` (Task 3); `POST /api/management/apply` (Task 5).
- Produces: `<ManagementOffer asset="car" | "rooms" />`.

- [ ] **Step 1: Build the offer template**

`ManagementOffer.tsx` takes a single `asset: ManagedAsset` prop and renders the nine spec sections in order:

1. **Hero** — offer name, `offer.promise`, `SERVICE_AREA_LABEL` as the eyebrow, primary CTA "Check your fit" linking to `/management/apply?asset=car|rooms`.
2. **Who it's for / who it isn't** — two columns. Fit criteria read from a `fit` block on the offer. Where a minimum is unknown, write the criterion qualitatively ("the car is road-ready today") rather than inventing a threshold.
3. **What we handle / what you keep** — two columns straight from `offer.handles` and `offer.ownerKeeps`.
4. **Fee model** — `const fees = getManagementFeeModel(asset)`. When `fees` is `null`, render structure-only copy: "We charge a percentage of gross, a one-time onboarding fee, and ask for a minimum term. We give you all three numbers on the call, before you sign anything." When non-null, render the three real figures. **Never render a placeholder digit.**
5. **Onboarding** — six steps: apply, call, asset review, agreement, onboarding checklist, live. No named timeline until Alex supplies one; describe order, not duration.
6. **Owner portal preview** — rendered only when `process.env.OWNER_PORTAL_URL` is set. Otherwise the whole section is omitted. Describe what owners see monthly: revenue, expenses, occupancy or utilization, open issues, statements.
7. **Objections** — damage and disputes, screening, insurance requirements, what happens when the asset sits idle, how and when you are paid, how to exit. On the fleet page, the damage objection links to `/claimproof` as proof of process.
8. **Transparency line and the DIY alternative** — "You can run this yourself with our course. If you would rather not, we do." Links to `/training`.
9. **Final CTA** — apply, using `MGMT_FLEET_FINAL_CTA` or `MGMT_COLIVING_FINAL_CTA`.

Plus a **"Your operator" sidebar** carrying `offer.operator`, which is where the old `/fleet` "Run by Alex Henry" eyebrow and `/co-living`'s Della framing land.

Reuse existing primitives rather than inventing any: `SectionDivider`, `SECTION_COLORS`, and the `Button` component the other marketing pages use. Do not add design tokens.

- [ ] **Step 2: Build the two offer pages and the overview**

Each offer page is a thin wrapper: metadata plus `<ManagementOffer asset="car" />`. The `/management` overview presents both offers as cards, the service area, and a "how it works" band, with `MGMT_OVERVIEW_CTA` on its call to action.

- [ ] **Step 3: Build the apply page and form**

`ApplicationForm.tsx` is a client component POSTing to `/api/management/apply`. Fields exactly as the spec lists: name, email, phone, asset type (prefilled from `?asset=`), asset count, state (a select limited to `SERVICE_AREA_STATES`), city, current status, timeline, what they want, how they heard. Include the `website` honeypot field and the Turnstile widget, matching `src/components/forms/EmailCaptureForm.tsx`.

On success, `router.push(json.redirectTo)`. On failure, keep every field's value and show one inline error above the submit button. Never clear the form on error.

- [ ] **Step 4: Add redirects and delete the old lane pages**

In `next.config.ts`:

```ts
// Lane pages became management offers. The old pages sold a lane; these sell
// a service, so the mapping is by asset class, not by name.
{ source: "/co-living", destination: "/management/co-living", permanent: true },
{ source: "/fleet", destination: "/management/fleet", permanent: true },
{ source: "/boutique-stays", destination: "/management", permanent: true },
```

Then delete the three page directories and the two now-orphaned component sets. Confirm they are orphaned first:

```bash
grep -rl "sections/co-living/\|sections/offerings/" src/ | grep -v "^src/components/sections/"
```

Expected: empty output. If not empty, the named file still imports them; fix it before deleting.

- [ ] **Step 5: Update the sitemap**

In `src/app/sitemap.ts`, remove the `/co-living`, `/fleet`, `/boutique-stays`, `/signal`, `/services`, `/labs*`, and `/audit/request` entries; add `/management`, `/management/fleet`, `/management/co-living`, and `/estimate`.

- [ ] **Step 6: Verify visually**

```bash
npm run dev
```

Open each of `/management`, `/management/fleet`, `/management/co-living`, `/management/apply?asset=car`. Confirm with `OWNER_PORTAL_URL` unset that the portal section does not render and no dead link appears. Confirm the fee section shows structure-only copy. Confirm `/co-living` and `/fleet` 308 to the new pages. Take a screenshot of each and review it before moving on.

- [ ] **Step 7: Verify the whole app still builds**

Run: `npx tsc --noEmit && npm run lint && npm test && npx next build`
Expected: all clean. `next build` is the gate that catches a deleted component still imported somewhere.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(management): overview, fleet and co-living offer pages, apply form

Retires the /co-living, /fleet, and /boutique-stays lane pages behind 308s.
Fee model and owner portal sections stay hidden until their env is set, so no
invented number or dead link ships.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Admin applications page

**Files:**
- Create: `src/app/admin/(dashboard)/applications/page.tsx`
- Create: `src/app/api/admin/applications/route.ts` (GET list)
- Create: `src/app/api/admin/applications/[id]/route.ts` (PATCH status and notes)
- Modify: `src/components/admin/AdminShell.tsx` (nav entry)

**Interfaces:**
- Consumes: `listApplications`, `updateApplicationStatus` (Task 5), `requireAuth` from `@/lib/auth`.
- Produces: nothing importable.

- [ ] **Step 1: Write the two API routes**

Both start with the house admin guard, exactly as every other `/api/admin/*` route does:

```ts
const authError = await requireAuth(request);
if (authError) return authError;
```

`GET` returns `listApplications({ status })` reading `status` from the query string. `PATCH` reads `{ status, notes }`, validates `status` against the same six values the table's CHECK constraint allows, and calls `updateApplicationStatus`. Reject an unknown status with a 400 rather than letting Postgres throw.

- [ ] **Step 2: Write the page**

Follow admin pattern A, the one `waitlist/page.tsx` uses: a `"use client"` page that fetches on mount, holds rows in `useState`, filters and sorts with `useMemo`, renders a table, and fires a `PATCH` from a per-row `<select>` with an `updating: number | null` guard for the in-flight row. Reuse `relativeTime()` from `@/lib/utils` and define a local `const STATUS_BADGE: Record<string, string>` of Tailwind classes, the same way the other admin pages do. There is no shared table primitive in this repo; do not build one for a single page.

Columns: created, name, email, asset, count, location, timeline, status select, notes. Add a CSV export button; the spec puts CRM sync out of scope.

- [ ] **Step 3: Add the nav entry**

In `src/components/admin/AdminShell.tsx`, add `{ label: "Applications", href: "/admin/applications", icon: "clipboard" }` to the nav array. Use an icon name the existing array already uses if `clipboard` is not available.

- [ ] **Step 4: Verify**

Run `npm run dev`, sign in as admin, open `/admin/applications`. Submit one application through `/management/apply`, confirm it appears, change its status, reload, and confirm the change persisted. Then delete the test row.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): management applications list with status and notes

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Estimator logic, rate table, and feature flag

Pure arithmetic and a lookup table with no data in it yet. This is where the "no invented numbers" rule bites hardest: the table ships empty and the flag ships off.

**Files:**
- Create: `src/lib/estimate/rates.ts`
- Create: `src/lib/estimate/model.ts`
- Create: `src/lib/estimate/model.test.ts`
- Create: `src/lib/estimate/flag.ts`

**Interfaces:**
- Consumes: `ManagedAsset` from `src/lib/management/constants.ts` (Task 2).
- Produces:
  - `type EstimateAsset = ManagedAsset` (alias, not a second union)
  - `interface MetroRate { metro: string; state: string; asset: EstimateAsset; monthlyGrossLow: number; monthlyGrossHigh: number }`
  - `lookupRate(asset, metro): MetroRate | null`
  - `listMetros(asset): { value: string; label: string }[]`
  - `estimate(input: EstimateInput): EstimateResult | { unavailable: true }`
  - `isEstimatorEnabled(): boolean`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/estimate/model.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate } from "./model";
import { lookupRate, METRO_RATES } from "./rates";

test("an unknown metro returns unavailable instead of a made-up number", () => {
  const r = estimate({ asset: "car", metro: "nowhere", daysAvailable: 20, condition: "good" });
  assert.deepEqual(r, { unavailable: true });
});

test("lookupRate is null for a metro with no data", () => {
  assert.equal(lookupRate("car", "nowhere"), null);
});

test("every seeded rate has a low below its high and a service-area state", () => {
  const states = ["GA", "FL", "SC", "NC", "AL", "TN"];
  for (const rate of METRO_RATES) {
    assert.ok(
      rate.monthlyGrossLow < rate.monthlyGrossHigh,
      `${rate.metro} low is not below high`,
    );
    assert.ok(states.includes(rate.state), `${rate.metro} is outside the service area`);
  }
});

test("net subtracts the management fee from gross", () => {
  const r = estimate({
    asset: "car",
    metro: "nowhere",
    daysAvailable: 20,
    condition: "good",
    rateOverride: { metro: "test", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
    feePct: 0.2,
  });
  assert.ok(!("unavailable" in r));
  if ("unavailable" in r) return;
  assert.equal(r.grossLow, 1000);
  assert.equal(r.grossHigh, 2000);
  assert.equal(r.netLow, 800);
  assert.equal(r.netHigh, 1600);
});

test("availability scales the range and never goes negative", () => {
  const half = estimate({
    asset: "car",
    metro: "nowhere",
    daysAvailable: 15,
    condition: "good",
    rateOverride: { metro: "t", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  if ("unavailable" in half) throw new Error("expected a result");
  assert.ok(half.grossLow < 1000);
  assert.ok(half.grossLow >= 0);
});

test("net is omitted when no fee is configured", () => {
  const r = estimate({
    asset: "rooms",
    metro: "nowhere",
    bedrooms: 3,
    rateOverride: { metro: "t", state: "GA", asset: "rooms", monthlyGrossLow: 900, monthlyGrossHigh: 1500 },
  });
  if ("unavailable" in r) throw new Error("expected a result");
  assert.equal(r.netLow, null);
  assert.equal(r.netHigh, null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/estimate/model.test.ts`
Expected: FAIL, cannot find module `./model`.

- [ ] **Step 3: Write the rate table**

```ts
// src/lib/estimate/rates.ts
/**
 * Metro rate table for the earnings estimator.
 *
 * DELIBERATELY EMPTY. Neither existing calculator holds market rates: the
 * co-living P&L and the vehicle calculator both take numbers the member types
 * in. There is no rate data in this repo to seed from, and inventing one would
 * put a fabricated earnings figure in front of a prospect.
 *
 * Alex fills this array. Until it has entries, every lookup returns null, the
 * estimator renders its "no number for that market yet" state, and
 * isEstimatorEnabled() should stay false so the surface is not reachable.
 *
 * Figures are monthly GROSS, before any fee, for one asset.
 */

import type { ManagedAsset } from "@/lib/management/constants";

/** Same two assets the management bin offers. Aliased, not redeclared, so the
 *  estimator and the offer pages can never drift apart. */
export type EstimateAsset = ManagedAsset;

export interface MetroRate {
  /** Stable key used in the select and in lookups. */
  metro: string;
  /** Two-letter state, must be inside the six-state service area. */
  state: string;
  asset: EstimateAsset;
  monthlyGrossLow: number;
  monthlyGrossHigh: number;
}

export const METRO_RATES: MetroRate[] = [];

export function lookupRate(asset: EstimateAsset, metro: string): MetroRate | null {
  const key = metro.trim().toLowerCase();
  return (
    METRO_RATES.find((r) => r.asset === asset && r.metro.toLowerCase() === key) ?? null
  );
}

export function listMetros(asset: EstimateAsset): { value: string; label: string }[] {
  return METRO_RATES.filter((r) => r.asset === asset).map((r) => ({
    value: r.metro,
    label: `${r.metro}, ${r.state}`,
  }));
}
```

- [ ] **Step 4: Write the model**

```ts
// src/lib/estimate/model.ts
/**
 * Deterministic estimator arithmetic. No I/O, no randomness, no defaults that
 * stand in for missing market data: an unknown metro returns { unavailable }
 * so the page can say so honestly and still capture the lead.
 */

import { lookupRate, type EstimateAsset, type MetroRate } from "./rates";

export interface EstimateInput {
  asset: EstimateAsset;
  metro: string;
  /** Car only. Days per month the owner can make it available. */
  daysAvailable?: number;
  /** Car only. */
  condition?: "excellent" | "good" | "fair";
  /** Rooms only. */
  bedrooms?: number;
  /** Rooms only. */
  furnished?: boolean;
  /** Injected in tests, and by callers that already hold the rate. */
  rateOverride?: MetroRate;
  /** Management fee as a decimal. Omit to suppress the net figures. */
  feePct?: number;
}

export interface EstimateResult {
  grossLow: number;
  grossHigh: number;
  /** Null when no fee is configured. Never guessed. */
  netLow: number | null;
  netHigh: number | null;
  metro: string;
  state: string;
}

const FULL_MONTH_DAYS = 30;

/** Condition nudges the range. Kept mild: this is a range, not a valuation. */
const CONDITION_FACTOR: Record<string, number> = {
  excellent: 1.05,
  good: 1,
  fair: 0.9,
};

function round(n: number): number {
  return Math.max(0, Math.round(n));
}

export function estimate(
  input: EstimateInput,
): EstimateResult | { unavailable: true } {
  const rate = input.rateOverride ?? lookupRate(input.asset, input.metro);
  if (!rate) return { unavailable: true };

  let factor = 1;

  if (input.asset === "car") {
    const days = input.daysAvailable;
    if (typeof days === "number" && days > 0) {
      factor *= Math.min(days, FULL_MONTH_DAYS) / FULL_MONTH_DAYS;
    }
    factor *= CONDITION_FACTOR[input.condition ?? "good"] ?? 1;
  } else {
    // Rooms rates are quoted per room, so bedrooms scales linearly.
    const rooms = input.bedrooms;
    if (typeof rooms === "number" && rooms > 0) factor *= rooms;
    if (input.furnished === false) factor *= 0.85;
  }

  const grossLow = round(rate.monthlyGrossLow * factor);
  const grossHigh = round(rate.monthlyGrossHigh * factor);
  const fee = input.feePct;
  const hasFee = typeof fee === "number" && fee > 0 && fee < 1;

  return {
    grossLow,
    grossHigh,
    netLow: hasFee ? round(grossLow * (1 - fee)) : null,
    netHigh: hasFee ? round(grossHigh * (1 - fee)) : null,
    metro: rate.metro,
    state: rate.state,
  };
}
```

- [ ] **Step 5: Write the flag**

```ts
// src/lib/estimate/flag.ts
/**
 * The estimator is reachable only when it has data to work with. Mirrors
 * isCrrPresaleOpen(): a boolean derived from env, so an unset variable hides
 * the surface rather than shipping an empty tool.
 */

import { METRO_RATES } from "./rates";

export function isEstimatorEnabled(): boolean {
  if (process.env.ESTIMATOR_ENABLED !== "true") return false;
  // Guard against the flag being flipped before the table is filled.
  return METRO_RATES.length > 0;
}
```

- [ ] **Step 6: Run tests**

Run: `node --import tsx --test src/lib/estimate/model.test.ts`
Expected: 6 tests PASS. The "every seeded rate" test passes vacuously on an empty table, and starts doing real work the moment Alex adds a row.

- [ ] **Step 7: Commit**

```bash
git add src/lib/estimate/
git commit -m "feat(estimate): deterministic estimator model, empty rate table, env flag

Rate table ships empty on purpose. No market rate data exists in this repo to
seed from, and the estimator stays unreachable until Alex supplies one.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Estimator tools and the /estimate front door

Two registry tools plus a chooser page. Account-gated per Alex's decision, which means the existing `ResourceGate` does the work and no new gate is written.

**Files:**
- Modify: `src/lib/resources/registry.ts` (two new entries)
- Create: `src/components/resources/earnings-estimator/EarningsEstimator.tsx`
- Create: `src/app/(marketing)/resources/car-earnings-estimator/page.tsx`
- Create: `src/app/(marketing)/resources/room-earnings-estimator/page.tsx`
- Create: `src/app/(marketing)/estimate/page.tsx`
- Create: `src/lib/nurture/sequences/estimate-car.ts`, `estimate-rooms.ts`
- Modify: `src/lib/nurture/{types,registry}.ts`
- Modify: `src/lib/resources/leads.ts` (route the two slugs to the new sequences)

**Interfaces:**
- Consumes: `estimate`, `listMetros`, `isEstimatorEnabled` (Task 8); `ResourceToolLayout`, `ResourceGate`, `getResourceAccess`, `useResourceTool` (existing).
- Produces: two registry entries with slugs `car-earnings-estimator` (category `fleet`) and `room-earnings-estimator` (category `property`).

- [ ] **Step 1: Add the registry entries**

Two entries in `RESOURCE_TOOLS`, following the shape of the existing entries exactly. Every field on `ResourceToolMeta` is required; `persistence` has no default. Use `archetype: "calculator"`, `access: "free-email"` (the union's only member), `persistence: "blob"`, `status: "live"`. Place the car entry at the top of the fleet block and the rooms entry at the top of the co-living block, because insertion order is the running order on `/resources`.

- [ ] **Step 2: Route the nurture enrollment**

`recordResourceToolLead()` in `src/lib/resources/leads.ts` currently branches on the tool's lane: fleet enrolls `crr_calculator`, everything else enrolls `rrr_welcome`. Add a slug check ahead of that branch so the two estimator tools get their own sequences:

```ts
  const ESTIMATOR_SEQUENCES: Record<string, NurtureSequenceKey> = {
    "car-earnings-estimator": "estimate_car",
    "room-earnings-estimator": "estimate_rooms",
  };
  const sequenceKey =
    ESTIMATOR_SEQUENCES[slug] ?? (lane === "fleet" ? "crr_calculator" : "rrr_welcome");
```

Then pass `sequenceKey` to the existing `enrollInNurture` call. Do not change the fallback behavior for any other tool.

- [ ] **Step 3: Write the two sequences**

Five steps each, following `crr-calculator.ts` structurally. `estimate_car` signs "Alex" and uses `getCrrFromAddress`; `estimate_rooms` signs "Della" and uses the RRR from-address helper. Each sequence walks the same arc: your number is a range and here is why, gross versus net, what management actually costs versus your time, the DIY path with a link to `/training`, and a close pointing at `/management/apply`. Register both keys in `types.ts` and `registry.ts` as in Task 4.

The sequence-wide tests written in Task 4 now cover these automatically: they must render without throwing, carry the unsubscribe link, and contain no dashes.

- [ ] **Step 4: Build the estimator component**

One component, `asset` prop, used by both tool pages. Inputs per the spec: car takes market, days available, and condition; rooms takes market, bedrooms, and furnished. Market is a `<select>` built from `listMetros(asset)`.

Call `estimate()` on change. When it returns `{ unavailable: true }`, show the honest state: "We do not have a number for that market yet. Tell us about the asset and we will give you a real one." with a link to `/management/apply?asset=...`. When it returns a result, show the gross range, the net range only if it is non-null, and the two paths side by side: **Run it yourself** linking to the course for that asset class, and **Let BNHG run it** linking to `/management/apply?asset=car|rooms`.

Persist state with `useResourceTool(slug, initial, { sync: access.canSync })`, matching every other blob tool.

- [ ] **Step 5: Build the tool pages and the /estimate chooser**

Each tool page is the 30-line boilerplate every other tool page uses: `getResourceTool(slug)!`, metadata, `getResourceAccess(tool)`, then `ResourceToolLayout` wrapping `ResourceGate` wrapping `<EarningsEstimator asset="car" />`.

`/estimate` is the single front door. It renders two cards, Car and Rooms, linking to the two tools. When `isEstimatorEnabled()` is false, it calls `redirect("/management")` instead, and both tool pages do the same. This is what makes the flag real rather than cosmetic.

- [ ] **Step 6: Verify both states of the flag**

With `ESTIMATOR_ENABLED` unset, run `npm run dev` and confirm `/estimate` and both tool URLs redirect to `/management`.

Then temporarily add one fake row to `METRO_RATES` locally, set `ESTIMATOR_ENABLED=true` in `.env.local`, and confirm the flow renders, gates on account, and computes. **Revert the fake row and the env change before committing.** Confirm with `git diff src/lib/estimate/rates.ts` that the array is empty again.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: clean, with the estimator sequences now covered by the Task 4 sequence tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(estimate): two registry estimator tools, /estimate chooser, two sequences

Estimator is account gated per Alex's call and stays behind ESTIMATOR_ENABLED
until the metro rate table has data. /estimate redirects to /management while
the flag is off, so the homepage CTA never lands on an empty tool.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Training hub and resources regroup

**Files:**
- Create: `src/app/(marketing)/training/page.tsx`
- Delete: `src/app/(marketing)/education/page.tsx`
- Modify: `next.config.ts` (308 `/education` to `/training`)
- Modify: `src/app/(marketing)/resources/page.tsx`
- Delete: `src/lib/tier-zero-resources.ts`, `src/app/(marketing)/resources/[slug]/`
- Modify: `src/components/sections/contact/ContactForm.tsx`, `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `liveResourceTools`, `RESOURCE_TOOLS` (existing); course constants from `src/lib/courses.ts`, `room-rental-riches.ts`, `car-rental-riches.ts`, `operator-bundle.ts`.
- Produces: nothing importable.

- [ ] **Step 1: Build `/training`**

An index listing Room Rental Riches (self-paced, Masterclass, Operator), Car Rental Riches, and the Operator Bundle, linking to the existing course pages. **Do not re-implement price display.** Read prices from the existing constants and respect the existing gating: `isCrrPresaleOpen()` and the env-gated buy buttons. No price is retyped as a literal.

Add a management pointer to the page: "Would rather not run it yourself? See what management costs." linking to `/management`.

- [ ] **Step 2: Retire `/education`**

Delete the stub page and add the redirect:

```ts
{ source: "/education", destination: "/training", permanent: true },
```

Then fix the six surfaces that link to `/education`. Find them with:

```bash
grep -rn '"/education"' src/ --include=*.tsx --include=*.ts
```

Repoint each to `/training`. `Footer.tsx` is one of them and gets rewritten wholesale in Task 11 anyway.

- [ ] **Step 3: Delete the tier-zero route and lead magnets**

`src/app/(marketing)/resources/[slug]/` exists only to serve the nine boutique lead magnets from `tier-zero-resources.ts`; every real tool has its own static directory. Delete both, then fix the two remaining references: the `resourcePages` block in `src/app/sitemap.ts`, and `slugToResourceName()` in `ContactForm.tsx` (which powers the `?resource=` prefill). In `ContactForm`, drop the import and have the prefill fall back to the raw slug or to no prefill.

- [ ] **Step 4: Regroup `/resources` by asset class**

Group the 21 tools into **Rooms** and **Cars** sections using `liveResourceTools("property")` and `liveResourceTools("fleet")`. Remove the boutique audit cards and the "For boutique stays" section. Add the three books and the free ebooks into the same grid.

Retire the boutique lane from the UI without breaking types: `LaneId` is used by the saved-resources shelf and the account tabs, but the lane is resolved at read time and never stored, so this is type work only, no data migration. Remove `"boutique"` from `ResourceCategory` and from `RESOURCE_CATEGORY_TO_LANE`, remove it from `LaneId` and `LANES` in `src/lib/lanes.ts`, and fix the two places that enumerate all lanes: the `byLane` initializer in `src/lib/resources/saved.ts` and the account resources tabs in `src/app/account/resources/_components/tabs.ts`. TypeScript will point at every other site.

- [ ] **Step 5: Add the "Next step" footer to tool detail pages**

`ResourceToolLayout.tsx` renders the shared chrome for all 21 tools, so add the footer there once rather than editing 21 pages. It shows the course for that tool's lane and "Or let us run it" linking to the matching management page. Derive the lane with the existing `laneForTool(tool)`.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test && npx next build`

Then `npm run dev` and check `/training`, `/resources`, `/account/resources` (confirm the boutique tab is gone and the other two still render), and one tool detail page for the new footer.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ia): training hub, resources regrouped by asset class, tier-zero removed

Retires the /education stub behind a 308, deletes the nine boutique lead
magnets and the dynamic route that served them, and drops the boutique lane
from the registry and account tabs. Lane is resolved at read time and never
stored, so no data migration is needed.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Navigation, footer, homepage, and community

The visible repositioning. Everything before this was plumbing.

**Files:**
- Modify: `src/lib/nav.ts`, `src/components/layout/Footer.tsx`, `src/components/layout/MobileBottomNav.tsx`
- Modify: `src/app/(marketing)/page.tsx`
- Create: `src/components/sections/home/ThreeDoors.tsx`, `ProofBand.tsx`, `LadderSection.tsx`
- Modify: `src/components/sections/home/HeroSection.tsx`
- Delete: `src/components/sections/home/{ThreePillarsSection,WhoItsForBanner,WhoItsFor,ProductSurfaces}.tsx`
- Modify: `src/app/(marketing)/community/page.tsx`
- Delete: forum surfaces (see Step 6)

**Interfaces:**
- Consumes: `SERVICE_AREA_LABEL` (Task 2), `bookingUrl` and the new sources (Task 3), `isEstimatorEnabled` (Task 8).
- Produces: nothing importable.

- [ ] **Step 1: Rewrite `nav.ts`**

```ts
export const NAV_LEFT: NavGroup[] = [
  { label: "Resources", href: "/resources" },
  { label: "Training", href: "/training" },
  { label: "Management", href: "/management" },
];

export const NAV_RIGHT: NavGroup[] = [
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];
```

`UTILITY_NAV` keeps `communityLogin` pointing at `/login`. Delete the stale `freeAudit` entry, which currently duplicates the login link, and remove it from the `UtilityNav` interface in `src/lib/types.ts`, fixing `Header.tsx` if it references it.

`MOBILE_BOTTOM_NAV` becomes Estimate, Training, Management. Note the existing bug in `MobileBottomNav.tsx`: its `ICONS` map is keyed by label and two of the three current labels have no icon. Add `Estimate`, `Training`, and `Management` keys to that map so all three render.

The Owner Portal link is conditional, so it does not belong in the static array. Render it in `Header.tsx` only when `process.env.OWNER_PORTAL_URL` is set, as an external utility link.

- [ ] **Step 2: Rewrite the footer**

`Footer.tsx` hardcodes six local column consts and does not read `nav.ts`. Replace them with the four groups the spec names:

- **Resources** — Tools (`/resources`), Books (the three static book pages, since `/books` has no index), Free ebooks
- **Training** — Room Rental Riches, Car Rental Riches, Masterclass
- **Management** — Fleet, Co-living, Apply, Owner Portal (rendered only when `OWNER_PORTAL_URL` is set)
- **Company** — About, Insights, Community on Facebook (only when `FACEBOOK_GROUP_URL` is set), Contact, Privacy, Terms

Move Marketplace into the Resources column as "Recommended gear" and drop the `?tab=hotel` link. Keep the Guestally affiliate link. Remove the `/signal` and `/labs` entries from `COMPANY_LINKS_SECONDARY`.

- [ ] **Step 3: Rewrite the homepage**

Five sections in the spec's order:

1. **Hero** — eyebrow `Sharing economy asset management · ${SERVICE_AREA_LABEL}`, H1 "Sharing economy asset management for the Southeast. Learn to run it, or let us run it." One primary CTA: "See what your asset would earn" to `/estimate` when `isEstimatorEnabled()`, otherwise "See how management works" to `/management`. One text link: "Already own a managed asset? Owner Portal." rendered only when `OWNER_PORTAL_URL` is set, using `HOME_OWNER_PORTAL` for attribution.
2. **ThreeDoors** — Resources, Training, Management cards, each with a one-line promise and the bin's entry action.
3. **ProofBand** — real operating figures. **Alex has not supplied these.** Until he does, render the band only when the figures exist: put them in `src/lib/constants.ts` as an exported `OPERATING_PROOF` array and have `ProofBand` return `null` when it is empty. Do not ship the old `METRICS` values (34% direct bookings, 42K ancillary, 18hrs saved) on this page; those are consulting-era claims for a business BNHG no longer runs.
4. **LadderSection** — three steps, learn free, train, hand it off, carrying the transparency line: "You can run this yourself with our course. If you would rather not, we do."
5. **FoundersBand** — unchanged.

Delete the four replaced components after confirming nothing else imports them.

- [ ] **Step 4: Fix the site-wide JSON-LD**

`src/app/(marketing)/layout.tsx` declares `SIGNAL_ID` as a `subOrganization` and mentions Signal in the Organization description. Remove the Signal node and the reference, and update the description to the asset-management positioning. Leave the WebSite, Guestally, and Person nodes alone.

- [ ] **Step 5: Rewrite `/community`**

One page describing the Facebook group: what it is, who it is for, the join rules, and a join button reading `process.env.FACEBOOK_GROUP_URL`. When that env is unset, render the page without a dead button and say the group opens soon. Rewrite the "Nice Host Network" naming on this page, `/login`, `/signup`, `AccountDashboard.tsx`, and `WelcomeModal.tsx` to describe the group and the live sessions. Per Alex's decision, **do not touch** `src/lib/courses.ts` tier bullets, the tier comparison components, the book FAQ pages, `auth-email.ts`, `blueprint.ts`, `crr-blueprint.ts`, the nurture sequences, or the `migrate.ts` seed.

- [ ] **Step 6: Retire the forum**

Delete `src/app/account/community/`, `src/app/api/forum/`, `src/lib/forum.ts`, and `src/components/sections/forum/`. Then fix the two inbound references: remove the Community entry from `NAV_ITEMS` in `src/components/member/MemberShell.tsx`, and replace the forum card in `AccountDashboard.tsx` with a card pointing at the Facebook group (rendered only when `FACEBOOK_GROUP_URL` is set).

Leave the `forum_categories`, `forum_threads`, and `forum_posts` tables in place. No destructive migration.

**Do not touch `src/lib/community-auth.ts`.** It has no forum code. It is the auth backbone with 49 importers spanning the LMS, ClaimProof, resources, scorecard, admin, and the Stripe webhook. The six forum files import exactly one function from it, `getCurrentSession`, which 30 other files also use.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test && npx next build`

Then `npm run dev` and walk `/`, `/community`, `/account`, `/account/resources` at desktop and mobile widths. Confirm: no dead links with all three new env vars unset, the mobile bottom nav shows three icons, and the homepage proof band is absent rather than showing placeholder numbers.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ia): three-bin nav, footer, homepage rewrite, Facebook community

Homepage leads with the asset-management line and one CTA. Proof band renders
only once Alex supplies real operating figures; the consulting-era METRICS are
not reused. Retires the first-party forum, keeping its tables and leaving
community-auth.ts untouched.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Prune Signal, services, labs, and audit acquisition

The last of the removals, done after the replacements exist so nothing is unreachable mid-plan.

**Files:**
- Delete: `src/app/(marketing)/{signal,services,labs}/`, `src/components/sections/{services,labs}/`
- Delete: `src/app/(marketing)/audit/request/`, `src/app/api/audit/request/`
- Modify: `src/lib/constants.ts`, `next.config.ts`, `src/components/admin/AdminShell.tsx`
- Modify: `/terms`, `/privacy` (legal copy, flagged)
- Modify: copy-only references across roughly a dozen files

**Interfaces:**
- Produces: nothing. This task only removes.

- [ ] **Step 1: Add the redirects**

```ts
// Retired offers. Signal, the services tiers, and Labs were the boutique
// consulting era. Management is the closest live destination.
{ source: "/signal", destination: "/management", permanent: true },
{ source: "/signal/free-audit", destination: "/management", permanent: true },
{ source: "/services", destination: "/management", permanent: true },
{ source: "/labs", destination: "/", permanent: true },
{ source: "/labs/guestally", destination: "/", permanent: true },
{ source: "/labs/build-log", destination: "/insights", permanent: true },
{ source: "/audit/request", destination: "/management", permanent: true },
```

- [ ] **Step 2: Delete the routes and components**

Delete the three marketing directories, the two component directories, `/audit/request` and its thanks page, and `POST /api/audit/request`.

**Keep** `/audit/[token]`, `src/app/api/audit/[token]/*`, `src/app/api/audit/create`, `src/lib/audit/*`, `src/lib/types/audit.ts`, `src/lib/validation/audit.ts`, `src/lib/constants/dimensions.ts`, the admin audit pages, and all five crons. Those are load-bearing for outreach: `src/lib/types/outreach.ts` imports the audit types, `process-nurture` hard-joins the audit tables, and `BookingCalendar` fetches the teaser API for `?audit_token=` links already in the wild.

Remove only the "Audit Requests" entry from `AdminShell.tsx`; keep "Audits".

- [ ] **Step 3: Remove the retired constants**

From `src/lib/constants.ts`, delete `SERVICE_TIERS_PREVIEW`, `TIER_ONE_SERVICES`, `TIER_TWO_SERVICES`, and `TIER_THREE_SERVICES`. Their only consumers were `ServiceTiersPreview.tsx` (deleted in Task 1) and `TierOneTwoThree.tsx` (deleted in Step 2). Leave `PILLARS`, `METRICS`, and the rest alone; other pages still read them.

- [ ] **Step 4: Fix every remaining inbound reference**

```bash
grep -rn '"/signal\|"/services\|"/labs\|"/boutique-stays\|/audit/request' src/ --include=*.tsx --include=*.ts
```

Work the list down to zero. The known set: `sitemap.ts`, `Footer.tsx`, `PageCTA.tsx` (the `owner` preset points at `/signal`; its only consumer was `/signal` itself, so delete the preset), `/alex` (two buttons plus copy), `/about`, `AboutPillars.tsx`, `Manifesto.tsx`, `/marketplace` hotel-tab copy, `ScorecardReport.tsx`, and `src/lib/constants.ts` (the tier-zero `ctaHref`).

Also drop the `hotel` tab: remove it from `TAB_META` in `/marketplace/page.tsx`, from `MarketplaceTabId` and `VALID_TAB_IDS` in `src/lib/marketplace.ts`, and from the duplicate type in `_components/types.ts`. Note in the commit body that any existing `marketplace_products` row with `tab_id = 'hotel'` stops rendering and can no longer be edited in admin; rows are left in the database untouched.

- [ ] **Step 5: Rewrite the legal copy — REQUIRES ALEX'S REVIEW**

`/terms` has three Signal passages (engagement guarantees and an IP clause) and `/privacy` has one. Rewrite them to describe what BNHG actually sells now: resources, training, and asset management. Where a Signal clause has no management equivalent, remove it rather than adapting it.

**Do not merge this step on your own judgment.** Produce the diff, stop, and put the before and after in front of Alex. Legal and contractual language is his call, not the executor's.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test && npx next build`

Then confirm every retired path redirects rather than 404s:

```bash
npm run dev
for p in /signal /signal/free-audit /services /labs /labs/guestally /boutique-stays /co-living /fleet /education /courses /audit/request; do
  printf '%-24s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' http://localhost:3000$p)"
done
```

Expected: every line shows `308` and a live destination. Any `404` is a missing redirect; any `200` means the route was not deleted.

Then confirm the audit report path still works, since outreach depends on it:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/audit/some-known-token
```

Expected: not a 404 from a missing route. Use a real token from the `audits` table if one exists.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(ia): retire Signal, services, Labs, and audit acquisition

Deletes the boutique consulting surfaces behind 308s and removes the audit
request funnel. Keeps /audit/[token], the audit APIs, tables, and all five
crons: already-sent outreach links land there and process-nurture joins those
tables. Marketplace loses its hotel tab; existing hotel rows stay in the
database but no longer render.

Legal copy in /terms and /privacy changed. Alex reviews before merge.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Full verification pass

**Files:** none modified unless a check fails.

- [ ] **Step 1: Run every automated check**

```bash
npx tsc --noEmit && npm run lint && npm test && npx next build
```

Expected: all four clean. Record the test count.

- [ ] **Step 2: Em-dash sweep**

```bash
grep -rPn '[–—]' src/ --include=*.tsx --include=*.ts | grep -v '\.test\.ts'
```

Expected: no hits in new or rewritten copy. Pre-existing hits in files this plan did not touch are out of scope; list them rather than fixing them.

- [ ] **Step 3: Confirm no operating company leaked onto owner-facing pages**

```bash
grep -rn "Be Nice Properties\|Be Nice Autos\|\bBNP\b\|\bBNA\b" "src/app/(marketing)/management" "src/app/(marketing)/estimate" "src/app/(marketing)/page.tsx" src/components/sections/management/
```

Expected: empty. BNHG is the only brand on those surfaces.

- [ ] **Step 4: Confirm every new env var fails closed**

With `OWNER_PORTAL_URL`, `FACEBOOK_GROUP_URL`, `ESTIMATOR_ENABLED`, and the six `MANAGEMENT_FEE_*` vars all unset, walk the site and confirm: no Owner Portal link anywhere, no Facebook button, `/estimate` redirects to `/management`, and both offer pages show structure-only fee copy. Then set each one and confirm the surface appears.

- [ ] **Step 5: Playwright pass**

Drive `/`, `/estimate` (both flag states), `/management`, `/management/fleet`, `/management/co-living`, `/management/apply`, `/training`, `/resources`, `/community`, and the apply-to-book handoff. Screenshot each at 1440 and at 390 wide. Review the screenshots by eye before declaring the task done; do not assert only on status codes.

For the handoff specifically: submit the form, confirm the redirect lands on `/book` with name and email already filled, complete the booking, and confirm the `mgmt_applicant` enrollment flips to `stopped` with reason `booked_call`.

- [ ] **Step 6: Review the full diff**

```bash
git diff main...HEAD --stat
git diff main...HEAD -- "src/app/(marketing)/terms" "src/app/(marketing)/privacy"
```

Check the stat for anything unrelated that crept in. Put the legal diff in front of Alex.

- [ ] **Step 7: Write the handoff**

Append a short outcome note to the copy of this plan in `docs/superpowers/plans/`, listing: which checks ran and their results, what shipped behind a flag, and every number still owed by Alex.

**Do not push, merge, or deploy.** Report and stop.

---

## What Alex still owes before any of this goes live

Each item blocks a specific surface. Everything else ships without them.

| Item | Blocks | Until then |
|---|---|---|
| Fee percentage, onboarding fee, minimum term per offer | Fee section on both offer pages | Structure-only copy, no numbers |
| Metro rate table (metro, state, asset, gross low, gross high) | `/estimate` and both estimator tools | Flag off, `/estimate` redirects to `/management` |
| Proof-band figures (units, vehicles, cities, years) | Homepage proof band | Band does not render |
| Facebook group URL and name | Community join button, footer link | Page says the group opens soon |
| `OWNER_PORTAL_URL` | Nav item, footer link, portal preview section | All three hidden |
| Fit minimums (asset age, condition thresholds) | "Who it's for" section | Qualitative criteria only |
| `/terms` and `/privacy` legal review | Merge | Diff held for review |

**Standing flag, not re-raised after this:** the spec records co-living management as requiring no Georgia real estate license, on Alex's call. Research on 2026-09-07 found the GA broker statute's under-90-day exemption is narrow and 2025 HB 399 tightened exemptions, so MTR stays of 30 to 90-plus days may fall outside it. Four of the six service-area states have their own licensing regimes that were never researched. The recommendation stands: get a GREC or attorney read before the first co-living management agreement is signed. This plan builds the marketing and intake surfaces; it does not sign anyone.

## Out of scope

Unified Ops portal work (properties view, BNHG-branded login, monthly statement view) is tracked separately. No CRM sync between applications and Unified Ops. No changes to lesson content, course tiers, prices, Stripe fulfillment, or the audit tables and crons. The `the-hosts-edge/` repo folder is a separate cleanup ticket.
