import type { Pack } from "./types";

/**
 * Fleet Operations (Layer 05) — Fleet tier only. Team infrastructure: make
 * every employee or contractor document vehicles the same way, and manage
 * every open claim in one place. License: up to 5 staff users, 10 vehicles,
 * internal business use, no resale or redistribution.
 */
export const FLEET_OPS: Pack = {
  slug: "fleet-ops",
  name: "Fleet Operations",
  access: "fleet",
  blurb:
    "Every team member documenting the same way. Every open claim visible in one place.",
  tools: [
    // ------------------------------------------------------------------
    {
      slug: "fleet-tracker",
      name: "Multi-Vehicle Claim Tracker",
      tagline: "Every open claim: stage, gap, idle days, owner, next action.",
      minutes: "5 min per week per claim",
      sections: [
        {
          kind: "intro",
          body: [
            "One row per open claim. Update in the weekly review, or as events land. The two columns that run your week are Next Action and Owner: a claim with neither is a claim going stale. Your tracker syncs across your team's accounts; export CSV weekly into your fleet records, or move the structure into your own shared spreadsheet for an outside backup.",
          ],
        },
        { kind: "interactive", component: "fleet-tracker" },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "folder-system",
      name: "Vehicle Evidence Folder System",
      tagline: "A permanent per-vehicle archive in your own cloud drive.",
      minutes: "30 min setup",
      sections: [
        {
          kind: "intro",
          body: [
            "The claim-level folder (Emergency pack) handles one incident. This is the layer above it: one permanent folder per vehicle, living in YOUR cloud account, so every baseline, every claim, and every repair travels with the car.",
          ],
        },
        {
          kind: "template",
          id: "vehicle-folders",
          title: "Per-vehicle structure (copy into your drive)",
          body: `FLEET/
  [VEHICLE - e.g. 2022 CAMRY - ABC1234]/
    00 Reference/         title, registration, insurance card, key specs
    01 Baseline Library/  monthly 12-shot sets, dated folders
    02 Existing Damage/   the permanent record, updated as it changes
    03 Trips/             per-trip photo sets, dated (rotate old ones out)
    04 Maintenance/       invoices, inspections, tire records
    05 Open Claims/       one CLAIM folder per incident (Emergency structure)
    06 Closed Claims/     archived complete, with closeout notes`,
        },
        {
          kind: "prose",
          title: "The monthly baseline",
          body: [
            "Once a month, each vehicle gets a fresh 12-shot set filed in the Baseline Library regardless of trip activity. Trip photos prove one trip; the baseline library proves a history. When a guest disputes whether damage is new, a dated monthly record of the same angle is very hard to argue with.",
            "Storage discipline: trip sets older than 90 days with no dispute can rotate out. Baselines and existing-damage records never rotate; they are the vehicle's biography.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "staff-sop",
      name: "Staff Check-In / Check-Out SOP",
      tagline: "The documentation standard, written for hands that are not yours.",
      minutes: "15 min to adapt",
      sections: [
        {
          kind: "intro",
          body: [
            "Copy this, replace the bracketed names, and issue it. It assumes the reader has never filed a claim and never will; their only job is capture and escalation.",
          ],
        },
        {
          kind: "template",
          id: "sop",
          title: "The SOP (copy, adapt, issue)",
          body: `VEHICLE DOCUMENTATION SOP - [COMPANY NAME]

WHO
Check-out (before trip): [ROLE - e.g. detailer / staging staff]
Check-in (at return): [ROLE - e.g. inspector / cleaner]
Photo review: [ROLE - e.g. fleet manager]
Claims: [NAME] only. Staff never message guests about damage.

CHECK-OUT (before every trip) - 4 minutes
1. Run the 12-shot sequence exactly (card is posted at staging):
   4 corners wide, 4 sides straight-on, wheels arc, glass,
   interior sweep, odometer + fuel.
2. New scratch/dent/chip found? Add close-ups: full panel,
   half panel, close-up. Do NOT skip the trip; flag it.
3. Upload to [FOLDER PATH] / [VEHICLE] / 03 Trips / [DATE].
4. Files named: YYYY-MM-DD_what-it-is.jpg.

CHECK-IN (at every return) - 6 minutes, SAME DAY, NO EXCEPTIONS
1. Walkaround, same path as check-out.
2. Hands on bumper corners and wheel arches. Crouch at wheels.
3. Interior + smell check.
4. Compare against the check-out photos on your phone.
5. ANYTHING different, or you are UNSURE:
   a. STOP. Do not clean. Do not move the vehicle.
   b. Photograph: full panel, half panel, close-up, 3 angles.
   c. Complete the Claim Handoff Form.
   d. Notify [CLAIM OWNER] by [CHANNEL] immediately.
   The report clock runs from TRIP END. "I'll mention it
   tomorrow" loses claims. Escalate within the hour.
6. Clean vehicle? Shoot next trip's check-out set now.

THE THREE RULES
1. Shoot first. Clean later.
2. When unsure, escalate. Nobody is ever in trouble for a
   false alarm; missed damage costs real money.
3. Same order, every time. The sequence is the system.`,
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "handoff-form",
      name: "Claim Handoff Form",
      tagline: "How damage moves from whoever found it to whoever owns it.",
      minutes: "5 min",
      sections: [
        {
          kind: "intro",
          body: [
            "The gap between 'the cleaner saw something' and 'the owner filed a claim' is where deadlines die. This form is that gap, closed. Whoever finds damage fills it; the claim owner takes it from there.",
          ],
        },
        {
          kind: "template",
          id: "handoff",
          title: "Handoff form (copy per incident)",
          body: `CLAIM HANDOFF - [DATE, TIME]

Vehicle: [VEHICLE]
Trip: [TRIP NUMBER if known] - trip ended: [DATE, TIME]
Found by: [NAME], during: [check-in / cleaning / staging]
Time found: [TIME]

Damage seen: [WHAT and WHERE, plain words]
Photos taken: [ ] full panel  [ ] half panel  [ ] close-up x3 angles
Uploaded to: [FOLDER PATH]
Vehicle moved or cleaned since discovery? [YES / NO - detail]
Guest messages seen or received? [YES / NO - do not reply]
Anything else: [witnesses, notes]

Handed to claim owner: [NAME] at [TIME] via [CHANNEL]
Claim owner acknowledgment: [TIME]

>> Claim owner: hours remaining in report window: [COUNT].
>> Run Emergency Quick Start NOW if damage is confirmed.`,
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "role-matrix",
      name: "Role and Responsibility Matrix",
      tagline: "Five roles, so no task is assumed instead of assigned.",
      minutes: "15 min to assign",
      sections: [
        {
          kind: "intro",
          body: [
            "Small fleets lose claims to role gaps, not effort gaps: everyone assumed someone else was watching the window. Assign every role by name, even if one person holds three of them; the point is that each has exactly one owner.",
          ],
        },
        {
          kind: "table",
          title: "The matrix (adapt names to your team)",
          headers: ["Role", "Owns", "Never does"],
          rows: [
            ["Vehicle Inspector", "Check-out and check-in photo sets, on time, to standard; escalation within the hour", "Guest communication about damage; deciding whether to file"],
            ["Claim Owner", "The report window, filing, evidence assembly, all guest and platform communication, the Communication Log", "Repair scheduling (hands off to coordinator once filed)"],
            ["Repair Coordinator", "Shop selection, estimates, parts timeline, downtime tracker updates", "Claim communication with the platform"],
            ["Fleet Manager", "Photo-quality audits, monthly baselines, SOP training, the weekly review", "Doing everyone's roles silently instead of auditing them"],
            ["Final Reviewer", "The pre-submission check (Manager Review Checklist) on every claim before it files", "Rubber-stamping; the checklist exists to be actually run"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "License terms, plainly",
          body: "The Fleet license covers up to 5 staff users and 10 vehicles for internal business use. Share these tools with your team freely inside your operation. No resale, redistribution, or use outside your company.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "photo-audit",
      name: "Photo Quality Audit Form",
      tagline: "A five-minute spot check that keeps the standard real.",
      minutes: "5 min per audit",
      sections: [
        {
          kind: "intro",
          body: [
            "Weekly, pick one recent trip set per staff member at random and score it. Standards that are never audited decay in about a month; a five-minute audit with feedback keeps four-minute discipline alive.",
          ],
        },
        {
          kind: "checklist",
          id: "audit",
          title: "Score the set (all yes = pass)",
          items: [
            "All 12 shots present, in sequence",
            "Four corners genuinely wide (whole car + surroundings)",
            "Straight-on sides perpendicular, panel filling frame",
            "Wheel faces visible on all four wheels",
            "High-risk areas covered (bumper corners, door edges)",
            "Existing damage close-ups present where the record says they should be",
            "Every image sharp at full zoom",
            "Filed in the right folder, named to standard",
            "Timestamps within the correct window for the trip",
          ],
        },
        {
          kind: "prose",
          title: "After the audit",
          body: [
            "Pass: tell them, specifically ('your wheel arcs are the best on the team'). Fail: show, do not scold; re-shoot one car together against the card. Two consecutive fails on the same item is a training gap, not a person problem; fix the training.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "manager-review",
      name: "Manager Review Checklist",
      tagline: "The final gate before any claim files or escalates.",
      minutes: "10 min per claim",
      sections: [
        {
          kind: "checklist",
          id: "manager-review",
          title: "Before submission or escalation, verify",
          items: [
            "Evidence complete: Scorecard run, gaps honestly noted",
            "Window status confirmed: hours remaining, filing time planned",
            "Incident Summary factual, specific, free of heat",
            "Valuation comparison done (if an appraisal exists) and gap quantified",
            "Communication history logged, promises dated",
            "Next action and owner named, with a date",
            "Downtime tracker current for this vehicle",
            "Decision Matrix consulted if the category is difficult; hours cap set",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          title: "This gate is not ceremony",
          body: "The ten minutes here catch the missing wheel baseline, the summary written angry, and the claim about to file with three hours left in the window. The claims that go out through this gate are the ones your fleet's reputation is built on.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "kpi-guide",
      name: "Fleet Claim KPI Guide",
      tagline: "Eight numbers that tell you whether the system is working.",
      minutes: "30 min per month",
      sections: [
        {
          kind: "table",
          title: "The KPIs and what they signal",
          headers: ["Metric", "Watch for", "It usually means"],
          rows: [
            ["Claims per 100 trips", "A rising trend", "Screening or guest-quality problem, or one vehicle attracting incidents"],
            ["% filed inside the window", "Anything under 100%", "Check-in SOP not running same-day; fix the handoff, not the person"],
            ["Average initial valuation gap", "Consistently large gaps", "Estimate documentation thin at filing; attach shop paper earlier"],
            ["% requiring supplements", "High share", "Same as above, or photo quality triggering desk lowballs"],
            ["Average idle days per claim", "Growth stage over stage", "Use the downtime tracker's stage view to find the real bottleneck"],
            ["Average response time (yours)", "Over one business day", "The one number you fully control; keep it same-day"],
            ["Average time to close", "Trend, not one bad claim", "Process health overall"],
            ["Repeat failures by vehicle/staff", "Any repeat", "A lemon forming, or a training gap; both are cheaper caught early"],
          ],
        },
        {
          kind: "prose",
          title: "How to run it",
          body: [
            "Monthly, from the Fleet Tracker's export. Ten claims of history make these numbers meaningful; two do not, so do not over-steer early. The repeat-failure row is the money row: a vehicle whose claims keep clustering (same panel, same category) is telling you it is becoming a lemon, and which guests to screen out. Retire the car or tighten the screen before the data insists.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "kpi-dashboard",
      name: "Fleet Claim KPI Dashboard",
      tagline: "Enter the month's numbers; the eight KPIs compute live and sync to your team.",
      minutes: "10 min per month",
      sections: [
        {
          kind: "intro",
          body: [
            "The KPI Guide tells you which numbers matter. This is where you run them. Pull one period's figures from the Fleet Tracker export, type them in once, and the eight KPIs compute in front of you. It saves to your workspace, so anyone on the team opens the same board.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "One rule before you read a single number",
          body: "Ten claims of history make these meaningful. Two do not. Early on, log the numbers but do not over-steer on them. The value shows up once you have a few months to compare.",
        },
        { kind: "interactive", component: "fleet-kpi" },
        {
          kind: "resource",
          title: "Download the KPI spreadsheet template",
          description:
            "Prefer to keep the history in a sheet? Same eight KPIs, as a formula-driven template with one row per month. Opens in Google Sheets or Excel.",
          assetKey: "kpi-template",
          formatLabel: "Google Sheets or Excel · .xlsx",
        },
        {
          kind: "prose",
          title: "How to read the board",
          body: [
            "Only three numbers are colored, because only three have an absolute right answer: everything filed inside the window, your response under one business day, and zero repeat-incident cars or staff. Green means you hit it; amber means fix the system, not the person. The handoff SOP fixes filing; your own calendar fixes response time; the repeat row fixes itself when you retire a lemon or retrain.",
            "The rest stay neutral on purpose. A claims-per-100-trips number, a valuation gap, an idle-day average: none of those are good or bad in a single month. They are only meaningful as a trend, so watch them move stage over stage rather than judging any one reading. Export the board each month and keep the history; the pattern is the product.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "weekly-agenda",
      name: "Weekly Claim Review Agenda",
      tagline: "Twenty minutes that keep every claim moving.",
      minutes: "20 min per week",
      sections: [
        {
          kind: "template",
          id: "agenda",
          title: "The agenda (same 20 minutes, every week)",
          body: `WEEKLY CLAIM REVIEW - [DATE] - runs 20 min, from the tracker

1. NEW damage since last week (3 min)
   Every incident on a handoff form? Every one filed or decided?

2. DEADLINE-SENSITIVE (3 min)
   Anything inside a window right now? Escalation dates set?

3. AWAITING APPRAISAL (3 min)
   Days waiting per claim. Over a week: status script this week.

4. VALUATION GAPS (4 min)
   New appraisals vs. shop estimates. Worksheet run? Supplement
   owner + date assigned?

5. MISSED CALLBACKS (3 min)
   Promises past due from the logs. Script 3 goes out today.

6. REPAIR + RETURN TO SERVICE (2 min)
   Cars at the shop: parts, timeline, downtime tracker current.

7. PROCESS (2 min)
   One audit result. One SOP fix if a failure repeated. Done.`,
        },
        {
          kind: "prose",
          title: "The one rule",
          body: [
            "Every open claim leaves the meeting with a named owner and a dated next action, even if the action is 'wait until Thursday, then Script 5'. A claim with no next action is not being worked; it is being remembered, and remembered claims stall.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "training-pack",
      name: "Staff Training Outline",
      tagline: "Onboard a new inspector to standard in under an hour.",
      minutes: "45 min per hire",
      sections: [
        {
          kind: "intro",
          body: [
            "The training is watching, doing, and being audited, not a lecture. This outline plus the SOP and the Five-Minute Card is the whole curriculum. Video slots are marked; record them once on your own cars and reuse forever.",
          ],
        },
        {
          kind: "resource",
          title: "Download the staff training deck",
          description:
            "A ready-to-present slide deck of this curriculum: the 24-hour rule, the 12-shot standard, the return inspection, the handoff form, roles, and a sign-off slide. Copy it and swap in your own team's names and cars.",
          assetKey: "staff-deck",
          formatLabel: "Google Slides or PowerPoint · .pptx",
        },
        {
          kind: "steps",
          title: "The 45-minute onboarding",
          items: [
            { action: "Why this matters.", minutes: "5 min", detail: "One story: a claim won because a baseline existed, or lost because it did not. Then the three rules: shoot first, escalate when unsure, same order every time. [VIDEO SLOT 1: you telling that story, 3 min.]" },
            { action: "Watch the 12-shot, then do it.", minutes: "15 min", detail: "You shoot a car narrating the sequence; they shoot the same car alone. Compare sets side by side. [VIDEO SLOT 2: the 12-shot demonstrated on your car, 5 min.]" },
            { action: "Watch the check-in, then do it.", minutes: "15 min", detail: "Walk the return path, hands on bumpers, sight lines, interior, comparison against check-out photos. Then they run one solo. [VIDEO SLOT 3: the return inspection, 5 min.]" },
            { action: "The escalation drill.", minutes: "5 min", detail: "Point at a mark on any car: 'you find this at check-in; what do you do?' Correct answer ends with the handoff form and a notification inside the hour. Run it twice." },
            { action: "Sign-off.", minutes: "5 min", detail: "The knowledge check below, then the sign-off line. Their first two weeks of sets get audited weekly; tell them so, and frame it as coaching." },
          ],
        },
        {
          kind: "checklist",
          id: "knowledge-check",
          title: "Knowledge check (all correct to sign off)",
          items: [
            "When does the damage-report clock start? (Trip end, not discovery)",
            "You find a new scratch at check-in. First move? (Photos, before anything moves or gets cleaned)",
            "You are not sure a mark is new. What do you do? (Escalate; never guess silently)",
            "Who talks to the guest about damage? (The claim owner only, never inspection staff)",
            "What order do the 12 shots go in? (Recite it; the order is the system)",
          ],
        },
        {
          kind: "template",
          id: "signoff",
          title: "Sign-off record (copy per hire)",
          body: `TRAINING SIGN-OFF - [COMPANY NAME]

Staff member: [NAME]
Role: [Vehicle Inspector / other]
Trained by: [NAME] on [DATE]

[ ] Watched and performed the 12-shot sequence to standard
[ ] Watched and performed the return inspection to standard
[ ] Passed the escalation drill (x2)
[ ] Knowledge check: 5 of 5
[ ] Received: SOP, Five-Minute Card, folder access

First-two-weeks audit schedule: [DATES]

Trainer signature: ____________  Staff signature: ____________`,
        },
      ],
    },
  ],
};
