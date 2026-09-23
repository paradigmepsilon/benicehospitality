/**
 * Fleet Management: the owner journey, application to offboarding.
 *
 * Single source of truth for the admin tracker (/admin/fleet), the doc
 * library, and docs/fleet-management/01_operating_manual.md. Pure data with no
 * server imports, so client components can use it directly. The car-side twin
 * of src/lib/partnership/journey.ts; the two share types and nothing else.
 *
 * One card is one owner, because one agreement is one owner. Vehicles hang off
 * the card, one per Exhibit A column, each with its own Exhibit C checklist.
 *
 * Step keys are persisted in fleet_steps. Renaming a key orphans its
 * completions, so add new keys instead of renaming old ones.
 */

import type { DocAudience, PartnershipDoc, StepOwner } from "@/lib/partnership/journey";
export { daysUntil } from "@/lib/partnership/journey";
export type { DocAudience, StepOwner };

export const PHASES = [
  { key: "qualify", label: "Qualify", blurb: "From application to an accepted vehicle" },
  { key: "paper", label: "Paper", blurb: "Terms, agreement, onboarding fee" },
  { key: "onboard", label: "Onboard", blurb: "Owner paperwork, then every vehicle through Exhibit C" },
  { key: "operate", label: "Operate", blurb: "The monthly cycle and the term review" },
  { key: "after", label: "After", blurb: "Offboarding, alumni, nurture, declined, or lost" },
] as const;

export type PhaseKey = (typeof PHASES)[number]["key"];

export const STAGES = [
  { key: "lead", phase: "qualify", label: "New application", exit: "Fit call booked", why: "An owner raised a hand. Nothing is promised yet; the only job is a real conversation on the calendar." },
  { key: "fit_call", phase: "qualify", label: "Fit call", exit: "Fit decision made", why: "Management works when the owner and the vehicle are both ready. The call decides the owner; the next stage decides the vehicle." },
  { key: "vehicle_review", phase: "qualify", label: "Vehicle review", exit: "Every vehicle accepted or declined", why: "A vehicle that cannot earn its keep costs both sides. Review each one before any paper goes out, and tell the owner why." },
  { key: "proposed", phase: "paper", label: "Terms + agreement sent", exit: "Agreement signed", why: "Paper before keys. The agreement and its exhibits set the fee, the term, and who pays for what, in writing, before a vehicle changes hands." },
  { key: "signed", phase: "paper", label: "Signed · fee due", exit: "Onboarding fee and reserve received", why: "Signed is not funded. Onboarding starts when the fee and the operating reserve have landed, not before." },
  { key: "onboarding", phase: "onboard", label: "Onboarding", exit: "First vehicle live", why: "Exhibit C, line by line. The owner delivers the paperwork and the keys; BNHG documents the vehicle, installs the tracker, and builds the listing." },
  { key: "operating", phase: "operate", label: "Operating", exit: "Minimum term inside its last 60 days", why: "The steady state. One statement and one distribution per month, on the dates the agreement names." },
  { key: "renewal", phase: "operate", label: "Term review", exit: "Continue, change the mix, or notice given", why: "The minimum term is ending and the agreement rolls month to month after it. Review the numbers with the owner before that happens, not after." },
  { key: "offboarding", phase: "after", label: "Offboarding", exit: "Vehicles returned, final statement sent", why: "Leave it cleaner than it arrived. Every vehicle gets a return report, every listing comes down, and the final statement closes the books." },
  { key: "alumni", phase: "after", label: "Alumni", exit: "", why: "An owner who left on good terms is a referral source. Two light check-ins keep the door open." },
  { key: "nurture", phase: "after", label: "Not now", exit: "", why: "Right owner, wrong moment: no vehicle yet, a lien to clear, a policy to change. Log what has to change and check back." },
  { key: "declined", phase: "after", label: "Declined by BNHG", exit: "", why: "Not a fit. Say so plainly, give the reason, and point to something useful." },
  { key: "closed_lost", phase: "after", label: "Closed · lost", exit: "", why: "Record why. The reasons are how the offer gets better." },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
export const STAGE_KEYS = STAGES.map((s) => s.key) as readonly StageKey[];

/** Stages where BNHG is running at least one vehicle, so the monthly cycle applies. */
export const OPERATING_STAGES: readonly StageKey[] = ["operating", "renewal", "offboarding"];

/** A tracker reminder, not a contract term: how far ahead of the minimum term's end the review starts. */
export const TERM_REVIEW_WINDOW_DAYS = 60;

export const OWNERS = ["alex", "della"] as const;
export type OwnerKey = (typeof OWNERS)[number];

export const VEHICLE_STATUSES = [
  { key: "proposed", label: "Proposed", blurb: "The owner wants it managed; not reviewed yet" },
  { key: "accepted", label: "Accepted", blurb: "Passed review; waiting on the agreement" },
  { key: "declined", label: "Declined", blurb: "Did not pass review" },
  { key: "onboarding", label: "Onboarding", blurb: "Working through Exhibit C" },
  { key: "live", label: "Live", blurb: "Listed and taking bookings" },
  { key: "paused", label: "Paused", blurb: "Delisted for now: repair, recall, owner use, claim" },
  { key: "returned", label: "Returned", blurb: "Back with the owner" },
] as const;

export type VehicleStatusKey = (typeof VEHICLE_STATUSES)[number]["key"];
export const VEHICLE_STATUS_KEYS = VEHICLE_STATUSES.map((s) => s.key) as readonly VehicleStatusKey[];

export const EVENT_KINDS = ["created", "stage", "vehicle", "money", "note", "call", "email", "doc"] as const;

/* ── Doc library ──────────────────────────────────────────────────────────
   `pdf` is relative to docs/fleet-management/dist/. Audience drives the badge
   and the warning: internal docs never leave the building, agreements are
   attorney-review drafts. */

export type FleetDoc = PartnershipDoc;

export const DOCS: readonly FleetDoc[] = [
  { group: "Program", key: "overview", title: "Program overview + gaps", audience: "internal", pdf: "internal/00_program_overview.pdf" },
  { group: "Program", key: "system_guide", title: "How the system works: guide for admins + managers", audience: "internal", pdf: "internal/02_fleet_system_guide.pdf" },
  { group: "Program", key: "manual", title: "Operating manual: stage by stage", audience: "internal", pdf: "internal/01_operating_manual.pdf" },
  { group: "Program", key: "decision_log", title: "Decision log: working defaults + what is still the attorney's", audience: "internal", pdf: "internal/03_decision_log.pdf" },
  { group: "Sell", key: "sales_playbook", title: "Sales playbook: fit call script + objections", audience: "internal", pdf: "internal/00_sales_playbook.pdf" },
  { group: "Sell", key: "offer_sheet", title: "Owner offer sheet (2 pages)", audience: "client", pdf: "00_owner_offer_sheet.pdf" },
  { group: "Sell", key: "fit_scorecard", title: "Owner fit scorecard", audience: "template", pdf: "templates/sales/owner_fit_scorecard.pdf" },
  { group: "Sell", key: "vehicle_review", title: "Vehicle review worksheet", audience: "template", pdf: "templates/sales/vehicle_review_worksheet.pdf" },
  { group: "Sell", key: "terms_summary", title: "Commercial terms summary (Exhibit B cover sheet)", audience: "template", pdf: "templates/sales/terms_summary.pdf" },
  { group: "Sell", key: "email_pack", title: "Email pack: every stage transition", audience: "template", pdf: "templates/sales/email_pack.pdf" },
  { group: "Agreements", key: "management_agreement", title: "Vehicle management agreement v2 + Exhibits A to E", audience: "agreement", pdf: "templates/agreements/vehicle_management_agreement.pdf" },
  { group: "Onboard", key: "welcome", title: "Owner welcome packet", audience: "template", pdf: "templates/onboarding/owner_welcome_packet.pdf" },
  { group: "Onboard", key: "vehicle_intake", title: "Vehicle intake form (one per vehicle)", audience: "template", pdf: "templates/onboarding/vehicle_intake_form.pdf" },
  { group: "Onboard", key: "intake_report", title: "Intake condition report", audience: "template", pdf: "templates/onboarding/intake_condition_report.pdf" },
  { group: "Operate", key: "owner_statement", title: "Monthly owner statement (fill in)", audience: "template", pdf: "templates/operate/owner_statement.pdf" },
  { group: "Operate", key: "incident_notice", title: "Incident + claim notice to owner", audience: "template", pdf: "templates/operate/incident_notice.pdf" },
  { group: "Operate", key: "term_review", title: "Term review letter", audience: "template", pdf: "templates/operate/term_review_letter.pdf" },
  { group: "Offboard", key: "return_checklist", title: "Vehicle return report + checklist", audience: "template", pdf: "templates/offboarding/vehicle_return_report.pdf" },
  { group: "Offboard", key: "testimonial_referral", title: "Testimonial + referral ask", audience: "template", pdf: "templates/offboarding/testimonial_referral_request.pdf" },
] as const;

const DOC_BY_KEY: ReadonlyMap<string, FleetDoc> = new Map(DOCS.map((d) => [d.key, d]));
export function getDoc(key: string): FleetDoc | undefined {
  return DOC_BY_KEY.get(key);
}

/* ── Owner checklists ─────────────────────────────────────────────────────
   One list per stage. `flag` marks steps that carry money or legal weight;
   the UI calls them out. */

export interface JourneyStep {
  key: string;
  stage: StageKey;
  label: string;
  owner: StepOwner;
  doc?: string;
  flag?: "money" | "legal";
}

export const STEPS: readonly JourneyStep[] = [
  // lead
  { key: "lead.crm_linked", stage: "lead", label: "Log the source and link the CRM contact", owner: "alex" },
  { key: "lead.application_read", stage: "lead", label: "Read the application: vehicle count, state, timeline", owner: "alex" },
  { key: "lead.offer_sent", stage: "lead", label: "Send the owner offer sheet", owner: "alex", doc: "offer_sheet" },
  { key: "lead.call_booked", stage: "lead", label: "Fit call booked through /book", owner: "alex" },
  // fit_call
  { key: "fit_call.scorecard", stage: "fit_call", label: "Run the owner fit scorecard on the call", owner: "alex", doc: "fit_scorecard" },
  { key: "fit_call.recap", stage: "fit_call", label: "Send the recap email within 24 hours", owner: "alex", doc: "email_pack" },
  { key: "fit_call.decision", stage: "fit_call", label: "Fit decision: review the vehicles, not now, or decline", owner: "alex", doc: "sales_playbook" },
  // vehicle_review
  { key: "vehicle_review.added", stage: "vehicle_review", label: "Every vehicle the owner wants managed is added to this card", owner: "alex" },
  { key: "vehicle_review.worksheet", stage: "vehicle_review", label: "Vehicle review worksheet run for each vehicle", owner: "alex", doc: "vehicle_review" },
  { key: "vehicle_review.eligibility", stage: "vehicle_review", label: "Platform eligibility checked against the platform's current rules", owner: "claude", doc: "vehicle_review" },
  { key: "vehicle_review.title_insurance", stage: "vehicle_review", label: "Title, lien or lease, and insurance position asked about", owner: "alex", flag: "legal" },
  { key: "vehicle_review.decision", stage: "vehicle_review", label: "Each vehicle marked accepted or declined, and the owner told why", owner: "alex" },
  // proposed
  { key: "proposed.terms", stage: "proposed", label: "Exhibit B terms for this owner confirmed by Alex", owner: "alex", doc: "terms_summary", flag: "money" },
  { key: "proposed.agreement_sent", stage: "proposed", label: "Agreement sent with Exhibits A, B, and E", owner: "alex", doc: "management_agreement", flag: "legal" },
  { key: "proposed.followup_3", stage: "proposed", label: "Day-3 follow-up", owner: "alex", doc: "email_pack" },
  { key: "proposed.followup_7", stage: "proposed", label: "Day-7 follow-up: answer questions, or move to Not now", owner: "alex", doc: "email_pack" },
  // signed
  { key: "signed.on_file", stage: "signed", label: "Signed agreement with Exhibits A, B, and E on file in the owner folder", owner: "alex", flag: "legal" },
  { key: "signed.dates", stage: "signed", label: "Signed date, minimum term end, and statement day entered on this card", owner: "alex" },
  { key: "signed.fee_entered", stage: "signed", label: "This owner's onboarding fee entered on this card", owner: "alex", flag: "money" },
  { key: "signed.fee_paid", stage: "signed", label: "Onboarding fee received", owner: "alex", flag: "money" },
  { key: "signed.reserve", stage: "signed", label: "Operating reserve received", owner: "alex", flag: "money" },
  // onboarding
  { key: "onboarding.welcome", stage: "onboarding", label: "Send the owner welcome packet", owner: "alex", doc: "welcome" },
  { key: "onboarding.folder", stage: "onboarding", label: "Create the owner folder", owner: "alex" },
  { key: "onboarding.w9", stage: "onboarding", label: "W-9 received", owner: "client", flag: "legal" },
  { key: "onboarding.ach", stage: "onboarding", label: "ACH form received", owner: "client", flag: "money" },
  { key: "onboarding.intake_forms", stage: "onboarding", label: "Vehicle intake form returned for every accepted vehicle", owner: "client", doc: "vehicle_intake" },
  { key: "onboarding.portal", stage: "onboarding", label: "Owner portal access granted (Unified Ops portal, Vehicle Asset Owner role)", owner: "alex" },
  { key: "onboarding.first_live", stage: "onboarding", label: "First vehicle live", owner: "alex" },
  // operating
  { key: "operating.kickoff", stage: "operating", label: "First-month expectations call held", owner: "alex" },
  { key: "operating.first_statement", stage: "operating", label: "First statement walked through with the owner", owner: "alex", doc: "owner_statement" },
  { key: "operating.checkin_90", stage: "operating", label: "Day-90 owner check-in", owner: "alex" },
  // renewal
  { key: "renewal.review", stage: "renewal", label: "Term review prepared: utilization, net to owner, vehicle condition", owner: "alex" },
  { key: "renewal.letter", stage: "renewal", label: "Term review letter sent", owner: "alex", doc: "term_review" },
  { key: "renewal.decision", stage: "renewal", label: "Owner decision logged: continue, change the vehicle mix, or exit", owner: "client" },
  { key: "renewal.dates", stage: "renewal", label: "New term end entered on this card, or the notice date logged", owner: "alex", flag: "legal" },
  // offboarding
  { key: "offboarding.notice", stage: "offboarding", label: "Written notice on file and exit date confirmed", owner: "alex", flag: "legal" },
  { key: "offboarding.trips", stage: "offboarding", label: "Booked trips through the exit date handled as the agreement says", owner: "alex" },
  { key: "offboarding.vehicles", stage: "offboarding", label: "Return checklist complete on every vehicle", owner: "alex", doc: "return_checklist" },
  { key: "offboarding.final_statement", stage: "offboarding", label: "Final statement and final distribution sent", owner: "alex", doc: "owner_statement", flag: "money" },
  { key: "offboarding.access", stage: "offboarding", label: "Owner portal and shared access closed out", owner: "alex" },
  { key: "offboarding.ask", stage: "offboarding", label: "Testimonial + referral ask sent", owner: "alex", doc: "testimonial_referral" },
  // after
  { key: "alumni.q1", stage: "alumni", label: "Quarterly check-in · 1", owner: "alex" },
  { key: "alumni.q2", stage: "alumni", label: "Quarterly check-in · 2", owner: "alex" },
  { key: "nurture.reason", stage: "nurture", label: "What has to change is logged in the timeline", owner: "alex" },
  { key: "nurture.q1", stage: "nurture", label: "Quarterly check-in · 1", owner: "alex" },
  { key: "nurture.q2", stage: "nurture", label: "Quarterly check-in · 2: re-open or release", owner: "alex" },
  { key: "declined.told", stage: "declined", label: "Owner told, with the reason and one useful next step", owner: "alex", doc: "email_pack" },
  { key: "closed_lost.reason", stage: "closed_lost", label: "Reason logged in the timeline", owner: "alex" },
] as const;

export const STEP_KEYS: ReadonlySet<string> = new Set(STEPS.map((s) => s.key));

/* ── Vehicle checklists ───────────────────────────────────────────────────
   Exhibit C of the agreement, per vehicle. C-1 items that belong to the owner
   rather than the vehicle (the signed agreement, W-9, ACH, fee and reserve)
   live in STEPS above, so they are ticked once per owner. */

export const VEHICLE_STEP_GROUPS = [
  { key: "owner_delivers", label: "Owner delivers before listing", source: "Exhibit C-1" },
  { key: "manager_intake", label: "BNHG completes at intake", source: "Exhibit C-2" },
  { key: "return", label: "Return to owner", source: "Offboarding" },
] as const;

export type VehicleStepGroupKey = (typeof VEHICLE_STEP_GROUPS)[number]["key"];

export interface VehicleStep {
  key: string;
  group: VehicleStepGroupKey;
  label: string;
  owner: StepOwner;
  doc?: string;
  flag?: "money" | "legal";
}

export const VEHICLE_STEPS: readonly VehicleStep[] = [
  { key: "v.c1.title", group: "owner_delivers", label: "Title or registration in the owner's name; lienholder or lessor confirmation if financed or leased", owner: "client", flag: "legal" },
  { key: "v.c1.insurance", group: "owner_delivers", label: "Insurance declarations page, and the carrier told in writing of car-sharing use", owner: "client", flag: "legal" },
  { key: "v.c1.keys", group: "owner_delivers", label: "Two working keys or fobs, plus any wheel-lock key", owner: "client" },
  { key: "v.c1.registration", group: "owner_delivers", label: "Current registration in the vehicle, copy on file", owner: "client" },
  { key: "v.c1.recall", group: "owner_delivers", label: "Recall check shows no open recalls, or repair confirmed", owner: "client" },
  { key: "v.c1.disclosure", group: "owner_delivers", label: "Owner's written disclosure of defects, prior accidents, and modifications", owner: "client", doc: "vehicle_intake", flag: "legal" },
  { key: "v.c1.clean", group: "owner_delivers", label: "Delivered clean, with a quarter tank or 50 percent charge", owner: "client" },
  { key: "v.c2.intake_report", group: "manager_intake", label: "Intake condition report with dated photographs", owner: "alex", doc: "intake_report" },
  { key: "v.c2.mechanical", group: "manager_intake", label: "Mechanical check: tires, brakes, fluids", owner: "alex" },
  { key: "v.c2.telematics", group: "manager_intake", label: "Telematics installed and tested", owner: "alex" },
  { key: "v.c2.listing", group: "manager_intake", label: "Listing photography, description, and pricing set up", owner: "alex" },
  { key: "v.c2.plan", group: "manager_intake", label: "Platform plan selected, eligibility confirmed, any required safety inspection scheduled", owner: "alex" },
  { key: "v.c2.exhibit_a", group: "manager_intake", label: "Exhibit A column complete and initialed by both sides", owner: "alex", doc: "management_agreement", flag: "legal" },
  { key: "v.c2.live", group: "manager_intake", label: "Listing live", owner: "alex" },
  { key: "v.off.delist", group: "return", label: "Listings taken down and future trips handled", owner: "alex" },
  { key: "v.off.telematics", group: "return", label: "Telematics removed", owner: "alex" },
  { key: "v.off.report", group: "return", label: "Return report with dated photographs, signed by the owner", owner: "alex", doc: "return_checklist", flag: "legal" },
  { key: "v.off.keys", group: "return", label: "Keys, fobs, and documents handed back", owner: "alex" },
] as const;

export const VEHICLE_STEP_KEYS: ReadonlySet<string> = new Set(VEHICLE_STEPS.map((s) => s.key));

/* ── Monthly cycle ────────────────────────────────────────────────────────
   One set per owner per calendar month, persisted as "month:YYYY-MM.<key>",
   so a new month needs no migration and no new rows until something is done. */

export const MONTHLY_STEP_KEYS = ["statement_prepared", "statement_sent", "payout_sent", "reserve_checked"] as const;
export type MonthlyStepKey = (typeof MONTHLY_STEP_KEYS)[number];

export interface MonthlyStep {
  key: MonthlyStepKey;
  label: string;
  owner: StepOwner;
  doc?: string;
  flag?: "money" | "legal";
}

export const MONTHLY_STEPS: readonly MonthlyStep[] = [
  { key: "statement_prepared", label: "Statement prepared", owner: "alex", doc: "owner_statement" },
  { key: "statement_sent", label: "Statement sent to the owner", owner: "alex", doc: "owner_statement" },
  { key: "payout_sent", label: "Owner distribution sent", owner: "alex", flag: "money" },
  { key: "reserve_checked", label: "Operating reserve checked against the agreed floor", owner: "alex", flag: "money" },
] as const;

const MONTH_KEY = /^month:(\d{4})-(0[1-9]|1[0-2])\.([a-z_]+)$/;

export function monthStepKey(month: string, key: MonthlyStepKey): string {
  return `month:${month}.${key}`;
}

/** The month (YYYY-MM) and monthly step a persisted key names, or null if it is not a valid monthly key. */
export function parseMonthStepKey(stepKey: string): { month: string; step: MonthlyStep } | null {
  const m = MONTH_KEY.exec(stepKey);
  if (!m) return null;
  const step = MONTHLY_STEPS.find((s) => s.key === m[3]);
  return step ? { month: `${m[1]}-${m[2]}`, step } : null;
}

/** "October 2026" for "2026-10". */
export function monthLabel(month: string): string {
  return new Date(`${month}-15T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
}

/** The calendar month before the one `today` (YYYY-MM-DD) falls in: the month a statement is owed for. */
export function previousMonth(today: string): string {
  const [y, m] = today.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/** The last `count` statement months, newest first, never earlier than `notBefore` (YYYY-MM). */
export function statementMonths(today: string, count: number, notBefore?: string | null): string[] {
  const out: string[] = [];
  let cursor = previousMonth(today);
  while (out.length < count && (!notBefore || cursor >= notBefore)) {
    out.push(cursor);
    cursor = previousMonth(`${cursor}-01`);
  }
  return out;
}

/**
 * True when last month's statement has not gone out and the owner's statement
 * day has passed. `statementDay` comes from that owner's Exhibit B; with none
 * entered there is no deadline to miss, so nothing is flagged. An owner whose
 * first vehicle went live this month owes no statement yet.
 */
export function isStatementLate(input: {
  doneKeys: readonly string[];
  statementDay: number | null;
  firstLiveAt: string | null;
  today: string;
}): boolean {
  const { doneKeys, statementDay, firstLiveAt, today } = input;
  if (!statementDay || !firstLiveAt) return false;
  const owed = previousMonth(today);
  if (firstLiveAt.slice(0, 7) > owed) return false;
  if (Number(today.slice(8, 10)) <= statementDay) return false;
  return !doneKeys.includes(monthStepKey(owed, "statement_sent"));
}

const STAGE_BY_KEY = new Map(STAGES.map((s) => [s.key, s]));
export function getStage(key: string) {
  return STAGE_BY_KEY.get(key as StageKey);
}

export function stageIndex(key: StageKey): number {
  return STAGE_KEYS.indexOf(key);
}

export function stepsFor(stage: StageKey): JourneyStep[] {
  return STEPS.filter((s) => s.stage === stage);
}

export function vehicleStepsFor(group: VehicleStepGroupKey): VehicleStep[] {
  return VEHICLE_STEPS.filter((s) => s.group === group);
}

/** "2021 Toyota Camry", or whatever parts of it are known. */
export function vehicleLabel(v: { year: number | null; make: string | null; model: string | null }): string {
  return [v.year, v.make, v.model].filter(Boolean).join(" ") || "Unnamed vehicle";
}
