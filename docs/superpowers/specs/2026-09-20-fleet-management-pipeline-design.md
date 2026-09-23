# Fleet Management Pipeline · Design

**Company:** bnhg · **Date:** 2026-09-20 · **Status:** approved by Alex in chat 2026-09-20

The car-side twin of the Co-Living Launch Partnership system: one journey
definition driving an admin tracker, a doc library, a generated operating
manual, per-stage email drafts, and an admin-raised Stripe link. The offer it
runs is the service BNHG already sells, fleet management under the vehicle
management agreement v2, not a new consulting product.

## Decisions (made with Alex)

1. **Offer:** fleet management pipeline. Apply, fit call, vehicle review,
   agreement, onboarding, operating, renewal, offboarding. No new pricing.
2. **Tracking unit:** one card per owner, matching the agreement. Vehicles are
   child rows, one per Exhibit A column, each with its own Exhibit C checklist
   and status.
3. **Operate depth:** track the monthly cycle and ship a fill-in-and-print
   owner statement. No earnings data is stored.
4. **Architecture:** a parallel module (`src/lib/fleet/`, `fleet_*` tables,
   `/admin/fleet`). The live co-living tracker and its prod tables are not
   touched. Generic helpers are shared by parameter, not copied.

## Journey (`src/lib/fleet/journey.ts`)

| Phase | Stages |
|---|---|
| Qualify | `lead` New application · `fit_call` Fit call · `vehicle_review` Vehicle review |
| Paper | `proposed` Terms + agreement sent · `signed` Signed, fee due |
| Onboard | `onboarding` Owner paperwork, then each vehicle through Exhibit C |
| Operate | `operating` Monthly cycle · `renewal` Renewal window |
| After | `offboarding` · `alumni` · `nurture` · `declined` · `closed_lost` |

Three step lists, all in the one file:

- `STEPS`: owner-level, one checklist per stage.
- `VEHICLE_STEPS`: per vehicle, grouped `owner_delivers` (Exhibit C-1),
  `manager_intake` (C-2), `return` (offboarding).
- `MONTHLY_STEPS`: per owner per calendar month, persisted as
  `month:YYYY-MM.<key>` so a new month needs no migration.

Vehicle statuses: proposed, accepted, declined, onboarding, live, paused,
returned. Default card owner is Alex.

## Data (`scripts/migrate.ts`)

- `fleet_engagements`: contact fields, market city/state, stage, owner,
  `agreement_signed_at`, `term_ends_at`, `onboarding_fee_cents`, `paid_cents`,
  next action + due, notes.
- `fleet_vehicles`: year, make, model, color, plate state, garaging city/state,
  status, `live_at`, `returned_at`, notes. **No VIN, policy number, or
  lienholder detail**; those live on the signed Exhibit A only.
- `fleet_steps`: completions only, nullable `vehicle_id`, two partial unique
  indexes (owner-level and vehicle-level). Every `ON CONFLICT` restates the
  index predicate.
- `fleet_events`: the timeline. Deliberate actions only, same rule as co-living.
- `fleet_doc_reviews`: doc library sign-off.

The management percentage is never stored; it lives in the signed agreement.
`journey.test.ts` fails if the CHECK lists drift from `journey.ts`.

## Money

An admin-raised Stripe Checkout link for the onboarding fee. The amount is the
`onboarding_fee_cents` Alex enters for that owner; there is no default and no
public buy button. Sessions carry `product: fleet_management`; the shared
webhook routes on it and records the payment exactly once. BNHG Stripe is in
live mode, so this is tested against test keys only and production use is
Alex's call.

## Docs (`docs/fleet-management/`, git-ignored: the repo is public)

Program overview + gaps, generated operating manual, system guide, sales
playbook, owner offer sheet, fit scorecard, vehicle intake form, intake
condition report, owner welcome packet, monthly owner statement (fill-in),
incident notice, renewal letter, offboarding + return checklist, email pack,
and agreement v2 rendered as an attorney-review draft. Every fee figure is
blank or stamped PROPOSED until Alex confirms Exhibit B.

## Entry points

`/admin/applications` (car applications) and CRM contacts both offer "Start a
fleet engagement", which opens the New owner form prefilled. Admin nav gets a
Fleet Management item with Clients, Doc library, How to use this.

## Out of scope for v1

Unified Ops read-only board and Morning Brief flags (late statement, term
ending, vehicle stuck in onboarding, no next action). Separate plan in the UO
repo once v1 is accepted.

## Carried risks

- Prod doc library and email drafts are empty until the docs get a private
  home (same open issue as co-living).
- Agreement v2 is a draft: Exhibit B numbers, entity names, Georgia attorney
  review, CPA items, and a broker quote are all still open. Nothing here treats
  them as settled.

## Testing

Node test runner: journey/migrate drift, step and doc integrity, monthly key
parsing, renewal and statement-late math, patch validation, payment session
parsing, email slot merge, doc path safety. Local Playwright pass over the
board, an owner page, a vehicle checklist, and the doc library.
