# BNHG Resource Catalog — Boutique Stays + Fleet Management

**Company:** BNHG · **Date:** 2026-07-26 · **Status:** Proposed (research-backed, not yet ticketed)

The benicehospitality resources page currently has ~21 free resources — **all co-living** — plus 9 Tier-0 URL-driven audits that are boutique-consulting lead magnets. The boutique lane has zero free tools/templates, and the fleet lane has zero resources of any kind. This catalog fills both, mirroring the existing three-lane content cadence (co-living / boutique / fleet).

**Research basis (last 30 days + market scan):**
- OTA share of independent hotel bookings hit **63.4%** (Hospitality Net) — direct-booking pressure is the #1 boutique commercial pain.
- Labor is **~60% of hotel opex**; workforce cost is the most-searched hotelier challenge of 2026 (Innstrata/RoomPriceGenie).
- **67% of independents** cite disparate systems as a top concern, losing 1–2 workdays/week reconciling data.
- AI discovery is reshaping hotel search; misconfigured chatbots actively damage service-led independents (The Traveler, Hotel Online).
- r/turo this month: a damage claim escalating **$2,400 → $19,000+** (92 pts / 147 comments), a guest-theft thread where hosts learned Turo sides with guests if damage isn't caught in the 24-hour window (75 pts), and multiple "Turo is a scam" threads. Documentation and claims defense dominate host anxiety.
- Turo host tooling demand (MyFleetOS, FleetSnap, TuroHostTools): break-even daily-rate calculators, mileage-based maintenance scheduling, damage-claim tracking through payout, and escaping spreadsheet accounting at scale.
- The free-resource landscape for hotels is generic chain-scale SOP packs (Smartsheet, Xenia, checklist.com) — nothing tailored to 10–50 room boutique properties. Clear whitespace.

Formats follow existing site patterns: **interactive calculator** (like co-living-profit-calculator), **gated template/download** (like room-rental-agreement), or **Tier-0 URL-driven audit** (like revenue-opportunity-snapshot). All acceptance criteria assume the existing resources architecture in `src/lib/resources/` and `src/lib/tier-zero-resources.ts`.

---

## Lane 1 — Boutique Stays (8 resources)

### B1. Direct Booking Shift Calculator ⭐ P1
**Format:** Interactive calculator
**Description:** Operator enters room count, ADR, occupancy, and current OTA share; tool shows annual commission leakage and projects dollar impact of shifting bookings direct in 5-point increments, with a 12-month payback view for direct-booking investments (booking engine, email list, metasearch).
**Why:** 63.4% OTA share is the single loudest boutique pain, and it's BNHG's core consulting pitch. Complements the Revenue Opportunity Snapshot (which is done-for-you); this is self-serve and instant.
**Acceptance criteria:**
- GIVEN a visitor on the resources page, WHEN they open the calculator and enter rooms=20, ADR=$250, occupancy=65%, OTA share=70%, OTA commission=18%, THEN they see annual commission leakage in dollars and a table of savings at 60/50/40/30% OTA share, computed correctly from the inputs.
- GIVEN completed inputs, WHEN the visitor requests their results as a download/email, THEN the email-capture gate fires and the lead lands in the existing capture flow with source tagged to this resource.
- GIVEN the calculator page, WHEN it loads, THEN it renders on mobile without horizontal scroll and matches the existing resource-page layout/branding.

### B2. Boutique Hotel Labor Cost & Staffing Model ⭐ P1
**Format:** Interactive calculator + downloadable spreadsheet
**Description:** Staffing model for 10–50 room properties: enter room count, service level (limited / full / luxury), and local wage inputs; output is a recommended staffing grid (FTEs by role), labor cost as % of revenue vs. the ~60% industry benchmark, and the top 3 roles where automation/AI can absorb hours.
**Why:** Workforce cost is the #1 most-searched hotelier challenge of 2026. Nobody offers this at boutique scale.
**Acceptance criteria:**
- GIVEN a visitor enters property size, service tier, and average wages, WHEN they calculate, THEN they see an FTE-by-role grid, total annual labor cost, and labor-as-%-of-revenue vs. benchmark.
- GIVEN results are shown, WHEN labor % exceeds benchmark, THEN the tool flags it and lists the three highest-leverage automation opportunities with estimated hours saved.
- GIVEN the download CTA, WHEN clicked, THEN an XLSX version gates behind email capture and downloads with the visitor's inputs pre-filled.

### B3. AI Concierge & Chatbot Readiness Checklist
**Format:** Gated PDF checklist + scored self-assessment
**Description:** A 25-point checklist covering knowledge-base completeness, escalation-to-human paths, tone calibration, and the failure modes that make automated support feel worse than none. Ends with a red/yellow/green readiness score.
**Why:** Independents are adopting AI under margin pressure, but forums are full of complaints about rigid bots undermining the service differentiation boutiques compete on. BNHG can own the "do it without losing your soul" position.
**Acceptance criteria:**
- GIVEN the resource page, WHEN a visitor completes the 25-item self-assessment, THEN they receive a red/yellow/green score with the specific failed items listed.
- GIVEN a completed assessment, WHEN the visitor submits their email, THEN they get the full PDF checklist and the lead is tagged to this resource.
- GIVEN the checklist content, WHEN reviewed, THEN every item is actionable (verb-first, testable) and no item requires a specific vendor.

### B4. Boutique SOP Starter Pack (10–50 Rooms)
**Format:** Gated download bundle (editable docs)
**Description:** Front desk, housekeeping, and guest-recovery SOPs written for owner-operated boutique properties — thin-staff reality, cross-trained roles — not chain-scale departments. Includes a service-recovery decision tree.
**Why:** The free SOP landscape (Smartsheet, Xenia, checklist.com) is generic and chain-shaped. Boutique-tailored SOPs are whitespace and a natural consulting door-opener.
**Acceptance criteria:**
- GIVEN the bundle, WHEN downloaded, THEN it contains at minimum: front-desk SOP, housekeeping SOP, guest-recovery SOP + decision tree, each in editable format with BNHG branding and a services CTA page.
- GIVEN each SOP, WHEN reviewed, THEN role assumptions never exceed a 10-person total staff and each procedure fits on ≤2 pages.
- GIVEN the resource page, WHEN a visitor requests the pack, THEN email capture gates the download and the lead is tagged to this resource.

### B5. Rate Parity & Pricing Health Self-Check
**Format:** Guided worksheet (interactive, URL-assisted)
**Description:** Walks an operator through checking their own rates across Google, top OTAs, and their booking engine for 3 sample dates, then scores parity health and shows what leakage pattern they have (undercut by OTA, stale direct rates, package mismatch).
**Why:** Rate parity is already named in the Revenue Opportunity Snapshot pitch; this self-serve version catches operators earlier in the funnel and demonstrates the problem with their own data.
**Acceptance criteria:**
- GIVEN the worksheet, WHEN an operator enters observed rates for 3 dates across 4 channels, THEN the tool computes parity deltas and classifies the leakage pattern with a plain-language explanation.
- GIVEN a completed check, WHEN any channel undercuts direct by >5%, THEN the result flags it and links the Revenue Opportunity Snapshot as the next step.
- GIVEN no email, WHEN the operator wants the summary saved/sent, THEN capture gates that step only (the check itself runs ungated).

### B6. Ancillary Revenue & Upsell Playbook — Boutique Edition
**Format:** Gated PDF playbook
**Description:** 15 upsell/package plays sized for boutique properties (early check-in, experience packages, local partnerships, room-upgrade ladders) with pricing guidance, scripts, and expected revenue-per-occupied-room impact for each.
**Why:** Ancillary gaps are already a Snapshot pillar; the co-living lane's upsell-playbook proves the format works. Boutique version is a direct port with new content.
**Acceptance criteria:**
- GIVEN the playbook, WHEN reviewed, THEN it contains ≥15 plays, each with implementation steps, a guest-facing script, and an estimated per-occupied-room revenue range.
- GIVEN the resource page, WHEN a visitor downloads, THEN email capture fires with resource tagging, matching the existing upsell-playbook flow.

### B7. Systems Consolidation Worksheet ("The 2-Workday Audit")
**Format:** Interactive worksheet
**Description:** Operator lists their current systems (PMS, channel manager, booking engine, payments, messaging, accounting) and hours/week spent reconciling between them; output is an integration-gap map and the estimated annual cost of their stack friction in labor dollars.
**Why:** 67% of independents cite disparate systems as a top concern, losing 1–2 workdays/week. Pairs with (but is distinct from) the URL-based Tech Stack Quick Scan — this one quantifies internal friction the scan can't see.
**Acceptance criteria:**
- GIVEN the worksheet, WHEN an operator inventories ≥3 systems with reconciliation hours, THEN the tool outputs total hours/week, annualized labor cost (using their entered wage), and the top 2 integration gaps.
- GIVEN results, WHEN annualized cost exceeds $10k, THEN the output recommends the Tech Stack Quick Scan as the follow-up with a prefilled link.

### B8. Boutique Guest Journey Message Pack
**Format:** Gated template download
**Description:** Pre-arrival → in-stay → post-stay message templates (email + SMS) tuned for boutique voice: confirmation, pre-arrival upsell, arrival-day logistics, mid-stay check-in, review ask, win-back. Guestally-aware but tool-agnostic.
**Why:** The co-living guest-message-templates resource is a proven top performer; the boutique lane has no equivalent. Also seeds the Guestally funnel naturally.
**Acceptance criteria:**
- GIVEN the pack, WHEN downloaded, THEN it contains ≥12 templates across the 6 journey stages, each in email and SMS variants with personalization placeholders.
- GIVEN the templates, WHEN reviewed, THEN tone matches BNHG brand voice (professional-warm, never salesy) and one template per stage references how automation (e.g., Guestally) can send it — value-first, no hard pitch.
- GIVEN the resource page, WHEN a visitor downloads, THEN email capture fires with resource tagging.

---

## Lane 2 — Fleet Management (8 resources)

### F1. Damage Claim Defense Checklist (Free Lite) ⭐ P1
**Format:** Gated PDF checklist
**Description:** The exact photo/video documentation protocol for trip start and end (angles, timestamps, odometer, fuel, interior), the 24-hour reporting window rules, and a claim-escalation script. Free lite version of the paid BNA Turo Defense Kit — this is the funnel top.
**Why:** The loudest fleet signal of the month: a $2,400 claim ballooning to $19,000+ (92 pts/147 comments on r/turo), and hosts discovering Turo sides with guests when damage isn't documented inside the window. Fear of the claims process is the #1 host anxiety, and BNA's validated paid product needs a free front door.
**Acceptance criteria:**
- GIVEN the checklist, WHEN reviewed, THEN it covers pre-trip documentation (≥8 shot list items), post-trip documentation, the reporting-window timeline, and a step-by-step claim filing sequence.
- GIVEN the final page, WHEN read, THEN it presents the paid Defense Kit as the complete system (dispute letters, valuation pushback, arbitration prep) with a purchase link.
- GIVEN the resource page, WHEN a visitor downloads, THEN email capture fires and the lead is tagged fleet-lane for the Defense Kit nurture sequence.

### F2. Fleet Break-Even & Daily Rate Calculator ⭐ P1
**Format:** Interactive calculator
**Description:** Per-vehicle economics: payment/depreciation, insurance, platform take, maintenance reserve, cleaning/turnover → break-even daily rate at the host's real utilization, plus profit at 3 utilization scenarios. Multi-vehicle mode sums to fleet view.
**Why:** Break-even daily-rate calculators are the most-requested Turo host tool (TuroHostTools, MyFleetOS). Turo's own Carculator estimates earnings but hides true costs — the independent version that includes ALL costs is the trust play.
**Acceptance criteria:**
- GIVEN a visitor enters vehicle cost inputs and utilization, WHEN they calculate, THEN they see break-even daily rate and monthly profit/loss at 50/65/80% utilization, computed correctly.
- GIVEN multiple vehicles added, WHEN viewing fleet mode, THEN per-vehicle and fleet-total views both render, and any vehicle priced below break-even is flagged.
- GIVEN results, WHEN the visitor requests the spreadsheet version, THEN email capture gates an XLSX download with their inputs pre-filled.

### F3. Vehicle Acquisition ROI Scorecard
**Format:** Interactive calculator
**Description:** Score a prospective vehicle before buying: purchase price, class demand, insurance class, depreciation curve, parts availability → a 0–100 acquisition score and projected 24-month ROI vs. the host's target.
**Why:** "Which car should I buy for Turo" is the evergreen question in every host community; Turo's Carculator answers with platform-optimistic averages. An independent scorecard is a shareable, linkable asset.
**Acceptance criteria:**
- GIVEN vehicle inputs, WHEN scored, THEN the tool outputs a 0–100 score with the 3 factors that most helped/hurt it, plus projected 24-month ROI.
- GIVEN two saved vehicles, WHEN compared, THEN a side-by-side view shows both scorecards.
- GIVEN a score below 50, WHEN displayed, THEN the tool states plainly the purchase doesn't meet the profile and why.

### F4. Fleet Maintenance & Mileage Tracker
**Format:** Gated spreadsheet download
**Description:** Per-vehicle log tracking mileage per trip, service intervals (oil, tires, brakes, registration, inspection) with conditional-formatting alerts as thresholds approach, plus a maintenance-reserve accrual tab that feeds the break-even calculator's numbers.
**Why:** Mileage-interval maintenance scheduling is a named must-have in 2026 fleet-tool roundups, and the co-living maintenance-tracker proves the downloadable-tracker format converts.
**Acceptance criteria:**
- GIVEN the spreadsheet, WHEN a trip's end mileage is logged, THEN cumulative mileage updates and any service item within 500 miles of its interval highlights.
- GIVEN the reserve tab, WHEN monthly revenue is entered, THEN the recommended maintenance-reserve accrual computes per vehicle.
- GIVEN the resource page, WHEN downloaded, THEN email capture fires with fleet-lane tagging.

### F5. Guest Screening & Risk Playbook
**Format:** Gated PDF playbook
**Description:** A screening framework: profile red flags, trip-request risk scoring (trip length, distance, vehicle class, account age, reviews), decline scripts that don't tank acceptance metrics, and theft/no-return response protocol with law-enforcement escalation steps.
**Why:** This month's r/turo is wall-to-wall guest-risk horror stories — theft threads, scam accusations, hosts eating losses. Screening is the prevention-side twin of the Defense Kit's cure.
**Acceptance criteria:**
- GIVEN the playbook, WHEN reviewed, THEN it contains a risk-scoring rubric with ≥6 weighted factors, ≥3 decline scripts, and a stolen-vehicle response checklist with escalation order.
- GIVEN the response checklist, WHEN reviewed, THEN it includes GPS/recovery steps, platform reporting, police report guidance, and insurance notification — in time order.
- GIVEN the resource page, WHEN downloaded, THEN email capture fires with fleet-lane tagging.

### F6. Protection Plan Decision Tool
**Format:** Interactive decision tool
**Description:** Enter vehicle value, monthly revenue, risk tolerance, and claims history; tool models expected value across Turo's plan tiers (take-rate vs. deductible exposure) and recommends a tier with the math shown.
**Why:** "Which protection plan" is a top recurring host question (RepairSnap's comparison guide ranks for it); most hosts choose by gut. Showing expected-value math builds exactly the operator-authority BNHG's fleet lane sells.
**Acceptance criteria:**
- GIVEN plan inputs, WHEN calculated, THEN the tool shows per-tier annual cost (earnings take) vs. modeled annual claim exposure and a recommended tier.
- GIVEN plan-terms data, WHEN Turo changes tiers/rates, THEN plan parameters live in one config file/table updateable without code changes.
- GIVEN the disclaimer requirement, WHEN results render, THEN a visible note states this is financial modeling, not insurance advice.

### F7. Fleet Scaling Operations Pack (1 → 10 Vehicles)
**Format:** Gated download bundle
**Description:** The systems needed to scale past owner-operator: cleaning/turnover SOP, co-host agreement template, key/lockbox logistics, pricing-review cadence, and a weekly fleet-ops scorecard (utilization, revenue/vehicle, claims open, maintenance due).
**Why:** Turo's own 2026 roadmap (co-host payments to "eliminate manual spreadsheets") confirms scaling friction is the growth-stage pain; MyFleetOS names spreadsheet accounting the bottleneck at scale. BNA's real operating experience makes this credible.
**Acceptance criteria:**
- GIVEN the bundle, WHEN downloaded, THEN it contains the turnover SOP, co-host agreement template, ops scorecard, and pricing cadence doc — all editable.
- GIVEN the co-host agreement, WHEN reviewed, THEN it carries a "have an attorney review before use" notice (legal-adjacent — flagged, not assumed).
- GIVEN the scorecard, WHEN weekly numbers are entered, THEN the 4 KPIs compute and trend week-over-week.

### F8. Beyond the Platform: Direct Rental Transition Guide
**Format:** Gated PDF guide
**Description:** The de-risking path from 100% Turo to a mixed model: direct rental legal/insurance prerequisites (flagged for professional review), booking + payment stack options, long-term/corporate rental channels, and a 90-day transition plan with revenue guardrails.
**Why:** Every "Turo is a scam / Turo sided with the guest" thread ends with hosts asking how to leave the platform. This is also BNHG's on-record strategic thesis (reduce platform dependency) applied to the fleet audience — the highest-conviction thought-leadership piece in the lane.
**Acceptance criteria:**
- GIVEN the guide, WHEN reviewed, THEN it covers insurance/legal prerequisites (explicitly flagged "consult a professional"), at least 3 direct-channel options with setup steps, and a 90-day plan with weekly milestones.
- GIVEN the revenue guardrails section, WHEN reviewed, THEN it defines the utilization threshold below which a host should NOT reduce platform reliance yet.
- GIVEN the resource page, WHEN downloaded, THEN email capture fires and the lead is tagged for the fleet consulting nurture path.

---

## Suggested build order

| Priority | Resource | Lane | Rationale |
|---|---|---|---|
| 1 | F1 Damage Claim Defense Checklist | Fleet | Funnels into validated paid Defense Kit; hottest signal |
| 2 | B1 Direct Booking Shift Calculator | Boutique | Core consulting pitch, instant self-serve proof |
| 3 | F2 Break-Even & Daily Rate Calculator | Fleet | Most-requested host tool; shareable |
| 4 | B2 Labor Cost & Staffing Model | Boutique | #1 2026 hotelier pain, zero boutique-scale competition |
| 5 | B8 Guest Journey Message Pack | Boutique | Proven format (co-living twin); Guestally funnel |
| 6 | F5 Guest Screening Playbook | Fleet | Prevention twin of F1; same audience moment |
| 7–16 | Remainder | Both | Sequence by content-calendar tie-ins |

**Next step:** these are ticket-ready drafts, not tickets. Per Build Tracker protocol, each needs criteria confirmation before creation in Notion.
