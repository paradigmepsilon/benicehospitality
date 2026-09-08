# BNHG Asset-Management Repositioning: Handoff

Branch: `bnhg/asset-management-2026-09` · 28 commits · 167 files, +8,175 / -11,011
Spec: `docs/superpowers/specs/2026-09-07-bnhg-asset-management-repositioning-design.md`
Plan: `docs/superpowers/plans/2026-09-07-bnhg-asset-management-repositioning.md`
Status: **not pushed, not merged, not deployed.**

## Verification actually run

| Check | Result |
|---|---|
| `npm test` | 57 pass, 0 fail (was 4 before this branch) |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | 30 problems, one BELOW the 31 pre-existing baseline |
| `npx next build` | succeeds |
| Browser, 9 pages at 1440 and 390 | passed, screenshots reviewed |
| 9 legacy redirects | all 308 to a live destination |
| Nurture URLs | all resolve, none 404 |
| Database | zero rows in `management_applications`, `bookings`, `course_nurture_enrollments` |

Every task passed its own review; the branch then passed a whole-branch review
that found four seam defects, all fixed and re-reviewed.

## DO THIS BEFORE DEPLOYING

**1. Run `npm run db:migrate`.** This is a whole-site gate, not just a new-funnel one.
The live `bookings_call_type_check` constraint rejects `discovery_call_45`, which is
`CANONICAL_CALL_TYPE` and what `BookingCalendar` sends for **every** visitor from every
CTA. Until the migration runs, every booking attempt on the site returns 500. The fix
is committed (`701eb98`), additive, idempotent, and `bookings` has zero rows. It was
deliberately not applied because running production migrations is your call.

**2. Review the legal copy in commit `d152f8f`** (terms and privacy only, isolated so you
can revert it independently). It removes two Signal clauses outright and rescopes two
passages descriptively. A reviewer read all three surviving sections in full context and
confirmed it invents no obligation, guarantee, or liability term.

**3. Legal gap that is NOT fixed and needs counsel.** The Terms have no management-services
section. Section 7's only recurring-service clause still says retainers are month-to-month
with no claw-back, which contradicts the minimum term the offer pages advertise. There is
no clause covering custody, insurance, or funds handling for holding someone's vehicle or
house. The site is about to solicit exactly that. This needs your decision with counsel
before the first application is answered. I did not draft contract language.

## Numbers you still owe

Each currently ships as a gated fallback, never a placeholder digit.

| Item | Blocks | Current behavior |
|---|---|---|
| Fee percent, onboarding fee, minimum term per offer | Fee section on both offer pages | Structure-only copy, no numbers |
| Metro rate table (`src/lib/estimate/rates.ts`) | `/estimate` and both estimator tools | Flag off, pages redirect to `/management`, both tools set `status: "soon"` |
| Proof-band figures (`OPERATING_PROOF`) | Homepage proof band | Band does not render |
| `FACEBOOK_GROUP_URL` | Community join button, footer link | Page says the group opens soon |
| `OWNER_PORTAL_URL` | Nav item, footer link, portal preview | All three hidden |

**Fee unit matters:** `MANAGEMENT_FEE_*_PCT` is a **whole percent**. Set `20`, not `0.2`.
A cross-consumer test now pins that both the offer page and the estimator read it the same way.

## Two positioning contradictions for you to settle

1. `/training` sells "a year in the Nice Host Network" while `/community` says the group
   opens soon. You scoped paid-tier copy out of the rename, so I honored that rather than
   quietly resolving it. Either finish the rename into tier bullets or restore the name on
   `/community`; the half state is the worst option.
2. The audit report surfaces (`AuditReport.tsx`, `CTABand.tsx`) still market "Signal by BNHG".
   They sit inside the protected outreach path reached by already-sent emails, so they were
   deliberately left alone.

## Known follow-up tickets

- Marketplace rows with `tab_id = 'hotel'` no longer render and cannot be edited in admin.
  Rows are untouched in the database. One migration retabs or unpublishes them.
- Offer-page attribution: five of seven new `MGMT_*` booking sources never reach the database,
  because the apply form reads only `asset` from the URL.
- Nurture stop scope: booking stops `mgmt_applicant` but not `estimate_car` / `estimate_rooms`.
- CSV formula injection and unescaped HTML in the admin notification email. House pattern,
  but this branch added the largest free-text field on the site.
- `/audit/request/thanks` has no redirect entry beside `/audit/request`.
- Owner Portal header link renders only when logged out.
- `mgmt_applicant` step 1 says "thirty minutes"; the booking UI says 45.
