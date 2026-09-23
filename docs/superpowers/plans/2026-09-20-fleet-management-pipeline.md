# Fleet Management Pipeline · Build Record + What Is Left

**Company:** bnhg · **Date:** 2026-09-20 · **Spec:** `docs/superpowers/specs/2026-09-20-fleet-management-pipeline-design.md`

The car-side twin of the Co-Living Launch Partnership tracker. This file records
what was built, in what order, and what is deliberately not done yet.

## Built (v1)

| Piece | Where |
|---|---|
| Journey: 13 stages, owner checklists, per-vehicle Exhibit C checklists, monthly cycle, doc registry | `src/lib/fleet/journey.ts` |
| Data access, patch validation, vehicles, checklist completions | `src/lib/fleet/engagements.ts` |
| Onboarding-fee payment: line item, webhook parsing, once-only recording | `src/lib/fleet/payments.ts`, `src/app/api/admin/fleet/[id]/checkout/route.ts`, fleet branch in `src/app/api/webhooks/stripe/route.ts`, `src/app/(marketing)/management/thanks/page.tsx` |
| Email drafts: shared pack parser, fleet merge slots | `src/lib/fleet/emails.ts` |
| Doc library paths + sign-off | `src/lib/fleet/doc-files.ts`, `src/lib/fleet/doc-reviews.ts` (shared path logic gained an optional `root` in `src/lib/partnership/doc-files.ts`) |
| Tables: `fleet_engagements`, `fleet_vehicles`, `fleet_steps`, `fleet_events`, `fleet_doc_reviews` | `scripts/migrate.ts` (run against Neon 2026-09-20) |
| Admin API | `src/app/api/admin/fleet/**` |
| Admin UI: board, owner page, doc library, guide | `src/app/admin/(dashboard)/fleet/**` |
| Entry points: admin nav, Applications page (car applications), CRM contact | `AdminShell.tsx`, `applications/`, `outreach/crm/page.tsx` |
| Document set (git-ignored, public repo) | `docs/fleet-management/` |

## Rules the code enforces

- No default fee. The payment link charges `onboarding_fee_cents` for that owner
  and refuses when it is 0.
- The tracker never stores a VIN, a policy number, a lienholder, or the
  management percentage. `journey.test.ts` fails if a fleet table grows one.
- The statement-late flag only fires once the owner's statement day (from their
  Exhibit B) is entered. There is no assumed day.
- The 60-day term review window is a tracker reminder, not a contract term.
- Emails and payment links happen only after a person confirms.
- `fleet_steps` uniqueness is two partial indexes. Every `ON CONFLICT` on that
  table restates the predicate.

## Phase 2, built 2026-09-22 (Unified Ops repo)

| Piece | Where |
|---|---|
| Read-only reader (no email, phone, VIN, or percentage selected) | `src/lib/bnhg-db.ts` `fetchFleetEngagements` |
| Labels + attention rules: overdue, no next action, statement late, term review, stuck onboarding | `src/lib/bnhg-fleet.ts`, `tests/lib/bnhg-fleet.test.ts` |
| Board at `/BNHG/fleet-management`, dashboard callout, sidebar link | `src/app/(platform)/[businessCode]/fleet-management/`, `src/components/bnhg/fleet/`, `sidebar.tsx`, `dashboard/page.tsx` |
| Morning Brief cron, weekdays 11:35 UTC, five minutes before the partnership check | `src/app/api/cron/bnhg-fleet-check/route.ts`, `vercel.json` |

The route is `fleet-management`, not `fleet`, so it cannot be confused with
BNA's own `/vehicles` module. "Stuck in onboarding" means an owner in the
Onboarding stage for more than 21 days with no vehicle live, or a vehicle in
Onboarding status on a running owner with no edit and no ticked step for 21
days. Uncommitted in the UO repo as of 2026-09-22.

## Not done, on purpose

1. **Production use of the payment link.** BNHG Stripe is live mode. Tested
   against the webhook parser and the database only, never against Stripe.
   Alex decides when the first real link goes out.
2. **Private home for the docs.** Same open issue as co-living: prod shows an
   empty doc library and no email drafts until `docs/fleet-management/` lives
   somewhere private (private repo, or private Vercel Blob).

## Blocked on people, not code

- Alex: Exhibit B numbers (management fee, onboarding fee, reserve, minimum
  term, statement day, payment day, admin fee) and the legal entity names.
- Georgia attorney: agreement structure, early-termination fee, indemnity,
  forum, fees clause, vehicle lien.
- CPA: state rental-tax registrations, 1099 characterization of distributions.
- Broker: direct-rental coverage quote. Until then Exhibit D is not offerable.
