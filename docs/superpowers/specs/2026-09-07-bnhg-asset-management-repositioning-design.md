# BNHG Repositioning: Sharing Economy Asset Management (Southeast)

Date: 2026-09-07 · Company: BNHG · Status: draft for Alex's review · Author: Claude with Alex

Supersedes the "Operator's Company for the Sharing Economy" homepage IA. Does not touch the course
production pipeline, the LMS player, or Stripe fulfillment for existing products.

## Decisions locked in chat (2026-09-07)

1. BNHG positions as **sharing economy asset management** with a three-bin ladder: Resources
   (books, tools, handouts, free ebooks) → Training (courses, masterclasses) → Management
   (done-for-you fleet and co-living management after a call).
2. **Boutique stays are off the table.** Signal, the services tiers, the boutique lead magnets,
   and the hotel audit funnel get demoted or removed (see Prune list).
3. Management offers: **Fleet Management** and **Co-living Management** only.
4. Service area: **GA, FL, SC, NC, AL, TN.**
5. **BNHG is the contracting party.** Marketing, closing, and the management agreement sit with
   BNHG. BNP (co-living) and BNA (fleet) are operations arms and are not surfaced to owners or
   prospects as separate brands.
6. Community lives in a **Facebook group**. The first-party forum is retired.
7. Managed-asset owners use the **Unified Ops external portal** ("BNHG Owner Portal"). BNHG
   links to it; it does not rebuild it.
8. Approach: **consolidate in place.** Keep the Next.js app, auth, Stripe, resources registry,
   booking calendar, and nurture engine.

## Stated assumptions (flagged once, not re-raised)

- **Co-living management requires no Georgia real estate license.** Alex's call. Research on
  2026-09-07 found the GA broker statute's under-90-day exemption is narrow and 2025 HB 399
  tightened exemptions; MTR stays of 30 to 90+ days may fall outside it. Recommendation stands to
  get a GREC or attorney read before the first co-living management agreement is signed.
- **Fees, minimums, and capacity are Alex's numbers.** The spec uses placeholders. Nothing goes
  live with an invented fee.
- **Audience is effectively zero** (14 emails, no course purchases as of 2026-09). The site's
  job is to convert the trickle from content engines and the Facebook group. It does not create
  traffic. Scope is sized accordingly.

## Positioning

**Line:** "Sharing economy asset management for the Southeast. Learn to run it, or let us run it."

**Job to be done:** the visitor owns an underused asset, a car or a house with spare rooms, and
wants it to earn without becoming a second job.

**Differentiator:** BNHG runs the assets it teaches and manages. Pure educators can't show
operations; pure management companies can't teach. Every page leads with operating evidence
(Della's units across five Southeast cities, Alex's fleet, the owner portal) and states plainly
that the course is the honest alternative to hiring BNHG.

**Voice:** professional, warm, operator-to-operator. No "unlock," "transform," "game-changer."

## Information architecture

### Top nav (replaces `src/lib/nav.ts`)

| Position | Label | Route |
|---|---|---|
| Left | Resources | `/resources` |
| Left | Training | `/training` |
| Left | Management | `/management` |
| Right | Insights | `/insights` |
| Right | About | `/about` |
| Utility | Owner Portal | Unified Ops portal URL (env `OWNER_PORTAL_URL`) |
| Utility | Login | `/login` (students and resource users) |

Mobile bottom nav: Estimate (`/estimate`), Training (`/training`), Management (`/management`).

Footer groups: Resources (Tools, Books, Free ebooks) · Training (Room Rental Riches, Car Rental
Riches, Masterclass) · Management (Fleet, Co-living, Apply, Owner Portal) · Company (About,
Insights, Community on Facebook, Contact, Privacy, Terms). Marketplace moves to the Resources
footer column as "Recommended gear."

### Route map

| Route | Status | Purpose |
|---|---|---|
| `/` | Rewrite | Hero with one CTA (the estimator), three doors, proof band, founders band |
| `/estimate` | New | Asset earnings estimator, car or rooms, email-gated result, routes to DIY or managed |
| `/resources` | Reorganize | Hub: tools (existing 21), books (3), free ebooks. Grouped by asset class |
| `/training` | New (replaces `/education` stub) | Hub: RRR, CRR, Masterclass, Operator Bundle. Links to existing course pages |
| `/management` | New | Overview of both management offers plus service area and "how it works" |
| `/management/fleet` | New | Fleet Management offer page |
| `/management/co-living` | New | Co-living Management offer page |
| `/management/apply` | New | Application form → booking |
| `/community` | Rewrite | One page: what the Facebook group is, link out, join rules |
| `/co-living`, `/fleet` | Redirect | 308 to `/management/co-living` and `/management/fleet` |
| `/services`, `/signal`, `/boutique-stays`, `/audit/*`, `/labs/*` | Remove | See Prune list |
| `/education` | Redirect | 308 to `/training` |

Existing course, book, checkout, account, and API routes are unchanged except where the Prune
list says otherwise.

## Components

### 1. Homepage (`src/app/(marketing)/page.tsx`)

Section order:

1. **Hero.** Eyebrow "Sharing economy asset management · GA · FL · SC · NC · AL · TN". H1 is the
   positioning line. One primary CTA: "See what your asset would earn" → `/estimate`. One text
   link: "Already own a managed asset? Owner Portal."
2. **Three doors.** Resources / Training / Management cards. Each has a one-line promise and the
   bin's entry action (browse tools · see the courses · check your fit).
3. **Proof band.** Real operating figures from `src/lib/constants.ts`: units, cities, vehicles,
   years operating. Numbers come from Alex; no placeholders ship.
4. **How the ladder works.** Three steps: learn free → train → hand it off. States the
   transparency line: "You can run this yourself with our course. If you'd rather not, we do."
5. **Founders band.** Existing component, unchanged.

Removed from the homepage: ThreePillarsSection, WhoItsForBanner, ProductSurfaces, Signal spotlight.

### 2. Estimator (`/estimate`)

The single front door. Reuses the resource tool rails (`src/lib/resources/registry.ts`,
archetype `calculator`, access `free-email`) so email capture, persistence, and the account
dashboard "save" behavior come for free.

Flow:

1. Choose asset: **Car** or **Rooms**.
2. Four to five inputs. Car: year/make class, market (metro picker limited to the six states),
   days available per month, condition. Rooms: bedrooms, market, furnished or not, current use.
3. Email gate before the result (existing pattern).
4. Result: monthly gross range, estimated net after a stated management fee placeholder, and two
   paths side by side: **Run it yourself** (book + course for that asset class) and **Let BNHG
   run it** (→ `/management/apply?asset=car|rooms`).

Estimation logic is a deterministic lookup table in `src/lib/estimate/` keyed by asset class and
metro, seeded from the existing `co-living-profit-calculator` and `vehicle-profitability-calculator`
assumptions. Alex supplies the metro rate table; the spec does not invent market rates. Until the
table is filled, the page ships behind a feature flag (`ESTIMATOR_ENABLED`) and the hero CTA falls
back to `/management`.

Enrollment hook: on email capture, enroll in a new nurture sequence `estimate_car` or
`estimate_rooms` (5 steps, mirrors `crr-calculator.ts` structure). Suppressed when the email
already has an active management application.

### 3. Management pages

`/management` (overview) plus two offer pages built from one template
(`src/components/sections/management/ManagementOffer.tsx`). Sections, in order:

1. Hero: offer name, one-line promise, service area, primary CTA "Check your fit" → apply.
2. **Who it's for / who it isn't.** Fit criteria (asset age, location, condition, owner
   expectations). Placeholders for minimums.
3. **What we handle / what you keep.** Two columns. Fleet: listing, pricing, turnover, cleaning,
   claims, maintenance coordination, guest comms. Co-living: listing, screening, leases, rent
   collection, house rules, turnover, maintenance coordination, tenant comms. Owner keeps title,
   insurance, capital decisions, final say on major repairs.
4. **Fee model.** Placeholder block. Structure only (percentage of gross, onboarding fee, minimum
   term) until Alex fills numbers.
5. **Onboarding.** Apply → call → asset review → agreement → onboarding checklist → live.
   Named timeline placeholder.
6. **Owner portal preview.** Screenshots of the Unified Ops portal vehicles view (and properties
   view once it exists). What owners see monthly: revenue, expenses, occupancy or utilization,
   issues, statements.
7. **Objections.** Damage and disputes (fleet links ClaimProof as proof of process), screening,
   insurance requirements, what happens when the asset sits, how and when you're paid, how to exit.
8. **Transparency line** and the DIY alternative with a link to the course.
9. Final CTA: apply.

Copy is written as BNHG. BNP and BNA are not named. The `/co-living` page's "Della-led" framing
and the `/fleet` page's "Alex-led" framing move into a "Your operator" sidebar on each page.

### 4. Application and intake

`/management/apply` form. Fields: name, email, phone, asset type, asset count, location (state
picker limited to six states plus city), current status (idle / self-managed / on a platform),
timeline, what they want from management, how they heard. Honeypot plus rate limit via existing
`withErrorHandling` pattern in this repo's API routes.

Storage: new table `management_applications` in `scripts/migrate.ts` (idempotent), columns for
every field plus `status` (`new` / `contacted` / `call_booked` / `qualified` / `declined` /
`signed`), `booking_id` nullable FK to `bookings`, `notes`, timestamps.

On submit:

1. Insert row.
2. Send admin notification email via Resend (existing `sendEmail` helper).
3. Redirect to `/book?source=mgmt_apply_<asset>` with the applicant's name and email prefilled.
   New `BOOKING_SOURCES` entries: `MGMT_APPLY_CAR`, `MGMT_APPLY_ROOMS`, `MGMT_FLEET_HERO`,
   `MGMT_FLEET_FINAL_CTA`, `MGMT_COLIVING_HERO`, `MGMT_COLIVING_FINAL_CTA`, `MGMT_OVERVIEW_CTA`,
   `HOME_OWNER_PORTAL`.
4. Enroll in nurture sequence `mgmt_applicant` (3 steps over 7 days) that stops when a booking
   with a matching email is created. Reuses `src/lib/nurture/engine.ts` stop semantics.

Admin: applications list at `/admin/applications` (table, status change, notes) following the
existing admin page patterns. Out of scope: CRM sync to Unified Ops; export is CSV.

### 5. Resources hub (`/resources`)

Regroup the existing 21 tools by asset class (Rooms / Cars) with the three books and free ebooks
in the same grid. Boutique category (empty) removed from the registry type. Tier-zero boutique
audits removed from the page. Each tool detail page gains a "Next step" footer: course for that
asset class, and "Or let us run it" → management page.

### 6. Training hub (`/training`)

New index page listing Room Rental Riches (self-paced, Masterclass, Operator), Car Rental Riches,
and the Operator Bundle, with current price display rules unchanged (env-gated buttons, presale
gating). Course end cards and the "How This Fits Together" section on the RRR pages gain a
management pointer. `/education` redirects here.

### 7. Community

`/community` becomes a single page describing the Facebook group with the join link (env
`FACEBOOK_GROUP_URL`) and rules. Tier copy in every file that mentions "The Nice Host Network" (about twenty, found by grep)
changes to describe the group and the live sessions; live sessions stay bundled with paid tiers
and are delivered as calendar links from the account dashboard.

Retire the forum: remove `/account/community/*`, `/api/forum/*`, `src/lib/forum.ts`, the forum
card in `AccountDashboard.tsx`, and the forum-specific parts of `src/lib/community-auth.ts`
(keep the auth pieces the LMS uses). Leave the `forum_*` tables in place; no destructive
migration. Note in the plan which `community-auth.ts` functions survive.

### 8. Prune list

| Surface | Action | Notes |
|---|---|---|
| `/signal`, Signal components, `HOME_SIGNAL_SPOTLIGHT` | Remove | Keep `BOOKING_SOURCES` values so old rows stay valid |
| `/services` and `SERVICES_*` in `constants.ts` | Remove | |
| `/boutique-stays` | Remove, 308 to `/management` | |
| `/audit`, `/audit/request`, `/api/audit` | Remove routes, keep tables and cron | Hotel audit nurture is a non-goal; cron stays until Alex says otherwise |
| `src/lib/tier-zero-resources.ts` and the nine boutique lead magnets | Remove from site | Skills in `~/.claude` that reference them are untouched |
| `/labs`, `/labs/guestally` | Remove, 308 to `/` | Guestally stays a footer affiliate link |
| `/marketplace` | Demote | Footer only, hotel tab removed |
| `/thehostsedge` | Keep | Still sells; link from Resources hub under Cars |
| `the-hosts-edge/` repo folder | Leave | Separate cleanup ticket; not part of this build |
| `/claimproof` | Keep | Linked from fleet management objections section |
| `/alex`, `/della` | Keep | Booking CTAs re-pointed to management apply where they said "book a call" |

Redirects go in `next.config` `redirects()` (existing IA migration block).

### 9. Owner portal (dependency outside this repo)

Unified Ops already has an external portal with a `CLIENT` role and `/portal/vehicles` for fleet
owners. Needed on the Unified Ops side, tracked as separate tickets, not built here:

- A properties view for co-living owners under `/portal/`.
- BNHG-branded login surface (logo, copy "BNHG Owner Portal").
- Monthly statement view matching what the management pages promise.

BNHG links out via `OWNER_PORTAL_URL`. Until it's set, the nav item is hidden.

## Data flow

```
Visitor → /estimate (email) → nurture estimate_* → DIY: /books or /courses
                                                 → Managed: /management/apply
/management/* → /management/apply → management_applications row
             → admin email → /book (prefilled, source=mgmt_apply_*) → bookings row
             → nurture mgmt_applicant (stops on booking)
Signed owner → Unified Ops portal (separate auth, separate repo)
```

## Error handling

- Estimator with missing metro rate: show "we don't have a number for that market yet," still
  capture email, route to apply.
- Application submit failure: keep form state, show inline error, log to `user_events`.
- Booking prefill missing: `/book` behaves as today.
- Unset env (`OWNER_PORTAL_URL`, `FACEBOOK_GROUP_URL`, `ESTIMATOR_ENABLED`): hide the surface,
  never render a dead link. Same pattern as Stripe price env gating.

## Testing

- Unit: estimator lookup and net calculation (`src/lib/estimate/*.test.ts`), application
  validation, nurture sequence step schedules (extend `schedule.test.ts`).
- Route tests: redirects table checked with a script hitting each old path against a local build.
- Manual: Playwright pass on `/`, `/estimate` (both branches), `/management/*`, `/training`,
  `/resources`, `/community`, and the apply → book handoff. Screenshots reviewed.
- Existing: `npm test`, `tsc --noEmit`, `npm run lint`, `next build`.

## Non-goals

- No new design system. Existing tokens and components.
- No paid ads, pixels, or ESP changes.
- No changes to lesson content, tiers, or prices.
- No CRM integration between BNHG applications and Unified Ops.
- No boutique-stay offers of any kind.
- No Unified Ops changes in this plan (tracked separately).

## Open items for Alex

1. Fee structure, minimums, and capacity per offer.
2. Metro rate table for the estimator (or approve shipping the estimator flagged off at launch).
3. Facebook group URL and name.
4. Proof-band figures (units, vehicles, cities, years).
5. Confirm the hotel audit cron can stay running unattended after the routes are removed.
