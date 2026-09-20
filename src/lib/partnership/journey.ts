/**
 * Co-Living Launch Partnership: the client journey, start to finish.
 *
 * Single source of truth for the admin tracker (/admin/partnership), the doc
 * library, and docs/co-living-launch-partnership/01_operating_manual.md. Pure
 * data with no server imports, so client components can use it directly.
 *
 * Step keys are persisted in partnership_steps. Renaming a key orphans its
 * completions, so add new keys instead of renaming old ones.
 */

export const PHASES = [
  { key: "qualify", label: "Qualify", blurb: "From first touch to a signed Section 1" },
  { key: "validate", label: "Validate", blurb: "Section 1: research, modeling, verdict" },
  { key: "decide", label: "Decide", blurb: "The fork: Go, Adjust, or No-go" },
  { key: "build", label: "Build", blurb: "Sections 2 and 3: setup, listings, booking" },
  { key: "launch", label: "Launch", blurb: "Section 4: marketing system" },
  { key: "operate", label: "Operate", blurb: "Section 5: operate, advise, hand off" },
  { key: "after", label: "After", blurb: "Managed, alumni, nurture, or lost" },
] as const;

export type PhaseKey = (typeof PHASES)[number]["key"];

export const STAGES = [
  { key: "lead", phase: "qualify", label: "New lead", exit: "Discovery call booked", why: "Someone raised a hand. Nothing is sold yet; the only job is to get a real conversation on the calendar." },
  { key: "discovery", phase: "qualify", label: "Discovery call", exit: "Fit decision made", why: "The call decides fit before anyone spends money. A bad fit costs more in Section 2 than it earns in Section 1." },
  { key: "s1_proposed", phase: "qualify", label: "Section 1 proposed", exit: "Signed and paid", why: "Paper before work. The signed letter sets the scope and the disclaimers; payment starts the 14-day clock." },
  { key: "s1_intake", phase: "validate", label: "Intake", exit: "Intake returned, call held", why: "The research is only as good as the owner's numbers. Get them once, in writing, and keep them in the client folder." },
  { key: "s1_research", phase: "validate", label: "Research + modeling", exit: "All worksheets saved", why: "Every figure in the packet has to trace to a saved worksheet or a sourced comp. This is where that trail gets built." },
  { key: "s1_verdict", phase: "validate", label: "Verdict call", exit: "Verdict logged", why: "One of three words, delivered by Della on a call, never by email alone. Log it here the same day: the credit clock starts on this date." },
  { key: "decision", phase: "decide", label: "Decision window", exit: "Path chosen", why: "A Go client has 30 days of credit. Two follow-ups, no pressure, then either a signed proposal or a move to Market Watch." },
  { key: "fix_it", phase: "decide", label: "Fix-It Path", exit: "Re-score issued", why: "The property can work after specific fixes. Hold the credit 90 days, check in twice, re-score once." },
  { key: "pivot", phase: "decide", label: "Alternate path", exit: "New offer signed, or moved to nurture", why: "The house is a No-go for co-living. Offer two paths at most: the strategy that won the comparison, or the search for a better house." },
  { key: "s2_setup", phase: "build", label: "Design + setup", exit: "Readiness walkthrough signed", why: "Turn the plan into a photo-ready house in three on-site days. The client buys everything; BNHG specifies, installs, and stages." },
  { key: "s3_launch", phase: "build", label: "Listings + booking", exit: "Client approves go-live", why: "Listings and the client's own booking site go live. Everything is in the client's name, and only Alex flips payment keys to live." },
  { key: "s4_marketing", phase: "launch", label: "Marketing system", exit: "Content scheduled, baseline saved", why: "The house gets found without an OTA. Capture the baseline first so day 90 has something to compare against." },
  { key: "s5_operate", phase: "operate", label: "Month 2 · BNHG operates", exit: "30 days operated", why: "BNHG runs the house for 30 days under a signed authorization while the owner watches every decision." },
  { key: "s5_advise", phase: "operate", label: "Month 3 · Advisory", exit: "Playbook drafted", why: "The owner runs it, BNHG reviews. Sessions finish and the playbook gets written from what actually happened." },
  { key: "handoff", phase: "operate", label: "Day-90 handoff", exit: "Access revoked, scorecard delivered", why: "Prove the result, hand over the playbook, and remove every BNHG access. Nothing should depend on a BNHG login after this." },
  { key: "managed", phase: "after", label: "Ongoing management", exit: "", why: "The owner chose to hand it off. A separate management agreement governs this; the partnership is complete." },
  { key: "alumni", phase: "after", label: "Alumni · self-managing", exit: "", why: "Self-managing owners are the referral engine. Two light check-ins keep the door open." },
  { key: "nurture", phase: "after", label: "Market Watch", exit: "", why: "Not now is not no. Quarterly contact, a re-screen when something changes, and a gracious exit at 12 months." },
  { key: "closed_lost", phase: "after", label: "Closed · lost", exit: "", why: "Record why. The reasons are how the offer gets better." },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
export const STAGE_KEYS = STAGES.map((s) => s.key) as readonly StageKey[];

export const VERDICTS = [
  { key: "go", label: "Go", creditCents: 100_000, creditDays: 30, nextStage: "decision" },
  { key: "adjust", label: "Adjust", creditCents: 100_000, creditDays: 90, nextStage: "fix_it" },
  { key: "no_go", label: "No-go", creditCents: 50_000, creditDays: 365, nextStage: "pivot" },
] as const;

export type VerdictKey = (typeof VERDICTS)[number]["key"];
export const VERDICT_KEYS = VERDICTS.map((v) => v.key) as readonly VerdictKey[];

export const PATHS = [
  { key: "undecided", label: "Undecided" },
  { key: "partnership", label: "Launch Partnership" },
  { key: "a_la_carte", label: "A la carte sections" },
  { key: "fix_it", label: "Fix-It Path" },
  { key: "alt_strategy", label: "Alternate Strategy Launch" },
  { key: "next_property", label: "Next Property Path" },
  { key: "market_watch", label: "Market Watch" },
] as const;

export type PathKey = (typeof PATHS)[number]["key"];
export const PATH_KEYS = PATHS.map((p) => p.key) as readonly PathKey[];

export const PACKAGES = [
  { key: "none", label: "None yet", priceCents: 0 },
  { key: "founding", label: "Founding client", priceCents: 749_700 },
  { key: "standard", label: "Standard package", priceCents: 1_000_000 },
  { key: "a_la_carte", label: "A la carte", priceCents: 0 },
] as const;

export type PackageKey = (typeof PACKAGES)[number]["key"];
export const PACKAGE_KEYS = PACKAGES.map((p) => p.key) as readonly PackageKey[];

export const SECTIONS = [
  { n: 1, short: "Research", label: "Property Research + Launch Strategy", priceCents: 100_000 },
  { n: 2, short: "Setup", label: "Design + Property Setup", priceCents: 250_000 },
  { n: 3, short: "Booking", label: "Listing Launch + Direct Booking", priceCents: 325_000 },
  { n: 4, short: "Marketing", label: "Launch Marketing System", priceCents: 150_000 },
  { n: 5, short: "Advisory", label: "Operator Advisory + Operations Support", priceCents: 300_000 },
] as const;

export const SECTION_STATUSES = [
  { key: "not_sold", label: "Not sold" },
  { key: "proposed", label: "Proposed" },
  { key: "sold", label: "Sold" },
  { key: "in_progress", label: "In progress" },
  { key: "delivered", label: "Delivered" },
] as const;

export type SectionStatusKey = (typeof SECTION_STATUSES)[number]["key"];
export const SECTION_STATUS_KEYS = SECTION_STATUSES.map((s) => s.key) as readonly SectionStatusKey[];

export const OWNERS = ["della", "alex"] as const;
export type OwnerKey = (typeof OWNERS)[number];

/* ── Doc library ──────────────────────────────────────────────────────────
   `pdf` is relative to docs/co-living-launch-partnership/dist/. Audience
   drives the badge and the warning: internal docs never leave the building,
   agreements are attorney-review drafts. */

export type DocAudience = "client" | "internal" | "template" | "agreement";

export interface PartnershipDoc {
  group: string;
  key: string;
  title: string;
  audience: DocAudience;
  pdf: string;
}

export const DOCS: readonly PartnershipDoc[] = [
  { group: "Program", key: "overview", title: "Program overview + gaps", audience: "internal", pdf: "internal/00_program_overview.pdf" },
  { group: "Program", key: "system_guide", title: "How the system works: guide for admins + managers", audience: "internal", pdf: "internal/02_partnership_system_guide.pdf" },
  { group: "Program", key: "manual", title: "Operating manual: stage by stage", audience: "internal", pdf: "internal/01_operating_manual.pdf" },
  { group: "Sell", key: "sales_playbook", title: "Sales playbook: discovery script + objections", audience: "internal", pdf: "internal/00_sales_playbook.pdf" },
  { group: "Sell", key: "offer_menu", title: "Offer menu (2 pages)", audience: "client", pdf: "00_offer_menu.pdf" },
  { group: "Sell", key: "fit_scorecard", title: "Discovery fit scorecard", audience: "template", pdf: "templates/sales/discovery_fit_scorecard.pdf" },
  { group: "Sell", key: "proposal", title: "Proposal + order form", audience: "template", pdf: "templates/sales/proposal_order_form.pdf" },
  { group: "Sell", key: "welcome", title: "Welcome + kickoff packet", audience: "template", pdf: "templates/sales/welcome_kickoff.pdf" },
  { group: "Sell", key: "email_pack", title: "Email pack: every stage transition", audience: "template", pdf: "templates/sales/email_pack.pdf" },
  { group: "Agreements", key: "services_agreement", title: "Consulting services agreement + SOWs", audience: "agreement", pdf: "templates/agreements/consulting_services_agreement.pdf" },
  { group: "Agreements", key: "s1_letter", title: "Section 1 engagement letter", audience: "agreement", pdf: "templates/agreements/section1_engagement_letter.pdf" },
  { group: "Agreements", key: "operating_auth", title: "Limited operating authorization", audience: "agreement", pdf: "templates/agreements/limited_operating_authorization.pdf" },
  { group: "Agreements", key: "handyman_agreement", title: "Handyman day-rate agreement", audience: "agreement", pdf: "templates/agreements/handyman_day_rate_agreement.pdf" },
  { group: "Agreements", key: "management_agreement", title: "Ongoing management agreement", audience: "agreement", pdf: "templates/agreements/ongoing_management_agreement.pdf" },
  { group: "Section 1 · Validate", key: "s1_sales", title: "Section 1 · client sheet", audience: "client", pdf: "01_property_research_launch_strategy.pdf" },
  { group: "Section 1 · Validate", key: "s1_workplan", title: "Section 1 · workplan", audience: "internal", pdf: "internal/01_property_research_launch_strategy_workplan.pdf" },
  { group: "Section 1 · Validate", key: "intake", title: "Client intake form (blank)", audience: "template", pdf: "templates/client_intake_blank.pdf" },
  { group: "Section 1 · Validate", key: "packet_sample", title: "Strategy Packet (sample)", audience: "template", pdf: "templates/sample_owner_strategy_packet.pdf" },
  { group: "Section 1 · Validate", key: "call_agenda", title: "Strategy call agenda", audience: "template", pdf: "templates/verdict/strategy_call_agenda.pdf" },
  { group: "Section 1 · Validate", key: "decision_record", title: "Verdict decision record", audience: "template", pdf: "templates/verdict/decision_record.pdf" },
  { group: "Verdict fork", key: "fork_playbook", title: "Verdict fork: retention playbook", audience: "internal", pdf: "internal/06_verdict_fork_retention_playbook.pdf" },
  { group: "Verdict fork", key: "verdict_paths", title: "Your verdict, your options", audience: "client", pdf: "06_verdict_paths.pdf" },
  { group: "Verdict fork", key: "fix_plan", title: "Viability Fix Plan + re-score", audience: "template", pdf: "templates/verdict/viability_fix_plan.pdf" },
  { group: "Verdict fork", key: "buy_box", title: "Co-Living Buy Box", audience: "template", pdf: "templates/verdict/coliving_buy_box.pdf" },
  { group: "Verdict fork", key: "rapid_screen_sales", title: "Rapid Property Screen · client sheet", audience: "client", pdf: "07_rapid_property_screen.pdf" },
  { group: "Verdict fork", key: "rapid_screen_report", title: "Rapid Property Screen · report", audience: "template", pdf: "templates/verdict/rapid_screen_report.pdf" },
  { group: "Verdict fork", key: "alt_strategy_sales", title: "Alternate Strategy Launch · client sheet", audience: "client", pdf: "08_alternate_strategy_launch.pdf" },
  { group: "Verdict fork", key: "market_watch", title: "Market Watch: 12-month nurture", audience: "template", pdf: "templates/verdict/market_watch_nurture.pdf" },
  { group: "Section 2 · Setup", key: "s2_sales", title: "Section 2 · client sheet", audience: "client", pdf: "02_design_property_setup.pdf" },
  { group: "Section 2 · Setup", key: "s2_workplan", title: "Section 2 · workplan", audience: "internal", pdf: "internal/02_design_property_setup_workplan.pdf" },
  { group: "Section 2 · Setup", key: "room_spec", title: "Room spec", audience: "template", pdf: "templates/section2/room_spec.pdf" },
  { group: "Section 2 · Setup", key: "staging_standard", title: "Della's staging standard", audience: "template", pdf: "templates/section2/staging_standard.pdf" },
  { group: "Section 2 · Setup", key: "onsite_runbook", title: "On-site runbook: 3 days", audience: "template", pdf: "templates/section2/onsite_runbook.pdf" },
  { group: "Section 2 · Setup", key: "shopping_list", title: "Furnishing + supply list", audience: "template", pdf: "templates/section2/shopping_list.pdf" },
  { group: "Section 2 · Setup", key: "readiness_signoff", title: "Readiness walkthrough sign-off", audience: "template", pdf: "templates/section2/readiness_walkthrough_signoff.pdf" },
  { group: "Section 2 · Setup", key: "access_handoff", title: "Access + accounts handoff", audience: "template", pdf: "templates/section2/access_handoff.pdf" },
  { group: "Section 3 · Listings + booking", key: "s3_sales", title: "Section 3 · client sheet", audience: "client", pdf: "03_listing_launch_direct_booking.pdf" },
  { group: "Section 3 · Listings + booking", key: "s3_workplan", title: "Section 3 · workplan", audience: "internal", pdf: "internal/03_listing_launch_direct_booking_workplan.pdf" },
  { group: "Section 3 · Listings + booking", key: "photographer_brief", title: "Photographer brief", audience: "template", pdf: "templates/section3/photographer_brief.pdf" },
  { group: "Section 3 · Listings + booking", key: "listing_copy", title: "Listing copy: 3 channels", audience: "template", pdf: "templates/section3/listing_copy_template.pdf" },
  { group: "Section 3 · Listings + booking", key: "house_rules", title: "House rules: Parking + What Ends a Stay Early", audience: "template", pdf: "templates/section3/house_rules_fill.pdf" },
  { group: "Section 3 · Listings + booking", key: "white_label_runbook", title: "White-label deployment runbook", audience: "internal", pdf: "templates/section3/white_label_runbook.pdf" },
  { group: "Section 3 · Listings + booking", key: "go_live", title: "Go-live checklist + client approval", audience: "template", pdf: "templates/section3/go_live_checklist.pdf" },
  { group: "Section 3 · Listings + booking", key: "legal_toolkit", title: "Legal toolkit overview: 8 documents + attorney questions", audience: "template", pdf: "templates/section3/legal_toolkit_overview.pdf" },
  { group: "Section 3 · Listings + booking", key: "rental_agreement_guide", title: "Room rental agreement + house rules guide", audience: "template", pdf: "templates/section3/rental_agreement_guide.pdf" },
  { group: "Section 4 · Marketing", key: "s4_sales", title: "Section 4 · client sheet", audience: "client", pdf: "04_launch_marketing_system.pdf" },
  { group: "Section 4 · Marketing", key: "s4_workplan", title: "Section 4 · workplan", audience: "internal", pdf: "internal/04_launch_marketing_system_workplan.pdf" },
  { group: "Section 4 · Marketing", key: "brand_kit", title: "Client mini brand kit", audience: "template", pdf: "templates/section4/mini_brand_kit.pdf" },
  { group: "Section 4 · Marketing", key: "marketing_strategy", title: "12-month marketing strategy", audience: "template", pdf: "templates/section4/marketing_strategy_12mo.pdf" },
  { group: "Section 4 · Marketing", key: "article_prompt", title: "Client-voice article prompt", audience: "internal", pdf: "templates/section4/client_voice_article_prompt.pdf" },
  { group: "Section 4 · Marketing", key: "visibility_baseline", title: "Visibility baseline + account access", audience: "template", pdf: "templates/section4/visibility_baseline.pdf" },
  { group: "Section 5 · Operate", key: "s5_sales", title: "Section 5 · client sheet", audience: "client", pdf: "05_operator_advisory_operations_support.pdf" },
  { group: "Section 5 · Operate", key: "s5_workplan", title: "Section 5 · workplan", audience: "internal", pdf: "internal/05_operator_advisory_operations_support_workplan.pdf" },
  { group: "Section 5 · Operate", key: "agenda_pack", title: "12-session agenda pack", audience: "template", pdf: "templates/section5/session_agenda_pack.pdf" },
  { group: "Section 5 · Operate", key: "weekly_note", title: "Weekly operating note", audience: "template", pdf: "templates/section5/weekly_operating_note.pdf" },
  { group: "Section 5 · Operate", key: "playbook", title: "Self-management playbook", audience: "template", pdf: "templates/section5/self_management_playbook.pdf" },
  { group: "Section 5 · Operate", key: "day90_scorecard", title: "Day-90 scorecard", audience: "template", pdf: "templates/section5/day90_scorecard.pdf" },
  { group: "Section 5 · Operate", key: "handoff_checklist", title: "Handoff + credential revocation", audience: "template", pdf: "templates/section5/handoff_revocation_checklist.pdf" },
  { group: "Section 5 · Operate", key: "testimonial_referral", title: "Testimonial + referral ask", audience: "template", pdf: "templates/section5/testimonial_referral_request.pdf" },
  { group: "Section 5 · Operate", key: "upsell_playbook", title: "Revenue + upsell playbook", audience: "template", pdf: "templates/section5/upsell_playbook.pdf" },
  { group: "Section 5 · Operate", key: "tenant_tracker_guide", title: "Tenant tracker + rent log guide (CSV beside it)", audience: "template", pdf: "templates/section5/tenant_tracker_guide.pdf" },
  { group: "Decisions", key: "g04", title: "Decision · management fee model", audience: "internal", pdf: "internal/g04_management_fee_model.pdf" },
  { group: "Decisions", key: "g06", title: "Decision · who is PM on site", audience: "internal", pdf: "internal/g06_onsite_pm.pdf" },
  { group: "Decisions", key: "g07", title: "Decision · client folder convention", audience: "internal", pdf: "internal/g07_client_folder_convention.pdf" },
  { group: "Decisions", key: "g14", title: "Decision · messaging + Stripe model", audience: "internal", pdf: "internal/g14_messaging_and_stripe_model.pdf" },
  { group: "Decisions", key: "g22", title: "Decision · the four deleted tools", audience: "internal", pdf: "internal/g22_deleted_tools.pdf" },
] as const;

const DOC_BY_KEY: ReadonlyMap<string, PartnershipDoc> = new Map(DOCS.map((d) => [d.key, d]));
export function getDoc(key: string): PartnershipDoc | undefined {
  return DOC_BY_KEY.get(key);
}

/* ── Checklists ───────────────────────────────────────────────────────────
   `paths` limits a step to clients on those paths. `flag` marks steps that
   carry money or legal weight; the UI calls them out. */

export type StepOwner = "della" | "alex" | "claude" | "client";

export interface JourneyStep {
  key: string;
  stage: StageKey;
  label: string;
  owner: StepOwner;
  doc?: string;
  paths?: readonly PathKey[];
  flag?: "money" | "legal";
}

export const STEPS: readonly JourneyStep[] = [
  // lead
  { key: "lead.crm_linked", stage: "lead", label: "Log the source and link the CRM contact", owner: "alex" },
  { key: "lead.menu_sent", stage: "lead", label: "Send the offer menu", owner: "della", doc: "offer_menu" },
  { key: "lead.discovery_booked", stage: "lead", label: "Discovery call booked through /book", owner: "della" },
  // discovery
  { key: "discovery.scorecard", stage: "discovery", label: "Run the fit scorecard on the call", owner: "della", doc: "fit_scorecard" },
  { key: "discovery.recap", stage: "discovery", label: "Send the recap email within 24 hours", owner: "della", doc: "email_pack" },
  { key: "discovery.fit_decision", stage: "discovery", label: "Fit decision: propose Section 1, propose the package, or decline", owner: "della", doc: "sales_playbook" },
  // s1_proposed
  { key: "s1_proposed.proposal", stage: "s1_proposed", label: "Send the proposal + order form", owner: "alex", doc: "proposal" },
  { key: "s1_proposed.agreement", stage: "s1_proposed", label: "Send the Section 1 engagement letter (services agreement if buying the package)", owner: "alex", doc: "s1_letter", flag: "legal" },
  { key: "s1_proposed.signed", stage: "s1_proposed", label: "Signed agreement on file in the client folder", owner: "alex", flag: "legal" },
  { key: "s1_proposed.paid", stage: "s1_proposed", label: "Payment received", owner: "alex", flag: "money" },
  // s1_intake
  { key: "s1_intake.welcome", stage: "s1_intake", label: "Send the welcome + kickoff packet", owner: "della", doc: "welcome" },
  { key: "s1_intake.folder", stage: "s1_intake", label: "Create the client folder", owner: "alex", doc: "g07" },
  { key: "s1_intake.form_sent", stage: "s1_intake", label: "Send the intake form", owner: "della", doc: "intake" },
  { key: "s1_intake.form_back", stage: "s1_intake", label: "Intake returned and saved to the client folder", owner: "client" },
  { key: "s1_intake.call", stage: "s1_intake", label: "30-minute intake call held", owner: "della" },
  // s1_research
  { key: "s1_research.viability", stage: "s1_research", label: "Viability Calculator run, report URL saved", owner: "alex", doc: "s1_workplan" },
  { key: "s1_research.demand", stage: "s1_research", label: "Market Demand Worksheet complete", owner: "claude" },
  { key: "s1_research.comps", stage: "s1_research", label: "6 to 10 comps pulled with source URLs", owner: "claude" },
  { key: "s1_research.compliance", stage: "s1_research", label: "Compliance screen: Green / Yellow / Red with citations", owner: "della", flag: "legal" },
  { key: "s1_research.pricing", stage: "s1_research", label: "Every room priced with the BNP method", owner: "alex" },
  { key: "s1_research.startup", stage: "s1_research", label: "Startup cost assessment itemized", owner: "alex" },
  { key: "s1_research.profitability", stage: "s1_research", label: "Profitability worksheet saved at 3 occupancy cases", owner: "alex" },
  { key: "s1_research.comparison", stage: "s1_research", label: "Rental strategy comparison drafted", owner: "claude" },
  { key: "s1_research.pnl", stage: "s1_research", label: "Profit Calculator run for the recommended strategy", owner: "alex" },
  // s1_verdict
  { key: "s1_verdict.written", stage: "s1_verdict", label: "Verdict written and signed off by Della", owner: "della" },
  { key: "s1_verdict.packet", stage: "s1_verdict", label: "Strategy Packet builds and validates", owner: "alex", doc: "packet_sample" },
  { key: "s1_verdict.acceptance", stage: "s1_verdict", label: "Acceptance checklist passed", owner: "alex", doc: "s1_workplan" },
  { key: "s1_verdict.sent", stage: "s1_verdict", label: "Packet sent 24 hours before the call", owner: "della" },
  { key: "s1_verdict.call", stage: "s1_verdict", label: "60-minute strategy call held", owner: "della", doc: "call_agenda" },
  { key: "s1_verdict.record", stage: "s1_verdict", label: "Decision record filled, verdict logged here", owner: "della", doc: "decision_record" },
  // decision
  { key: "decision.options", stage: "decision", label: "Send Your verdict, your options", owner: "della", doc: "verdict_paths" },
  { key: "decision.credit", stage: "decision", label: "Credit amount and expiry confirmed in the tracker", owner: "alex", flag: "money" },
  { key: "decision.proposal", stage: "decision", label: "Send the partnership or a la carte proposal", owner: "alex", doc: "proposal", paths: ["undecided", "partnership", "a_la_carte"] },
  { key: "decision.agreement", stage: "decision", label: "Services agreement signed", owner: "alex", doc: "services_agreement", paths: ["undecided", "partnership", "a_la_carte"], flag: "legal" },
  { key: "decision.paid", stage: "decision", label: "Payment received, Section 1 credit applied", owner: "alex", paths: ["undecided", "partnership", "a_la_carte"], flag: "money" },
  { key: "decision.followup_7", stage: "decision", label: "Day-7 follow-up", owner: "della", doc: "email_pack" },
  { key: "decision.followup_21", stage: "decision", label: "Day-21 follow-up: credit window closing", owner: "della", doc: "email_pack" },
  // fix_it
  { key: "fix_it.plan", stage: "fix_it", label: "Viability Fix Plan delivered", owner: "della", doc: "fix_plan" },
  { key: "fix_it.checkin_30", stage: "fix_it", label: "Day-30 check-in", owner: "della" },
  { key: "fix_it.checkin_60", stage: "fix_it", label: "Day-60 check-in", owner: "della" },
  { key: "fix_it.rescore", stage: "fix_it", label: "Free re-score run", owner: "alex", doc: "fix_plan" },
  { key: "fix_it.verdict", stage: "fix_it", label: "Updated verdict issued and logged", owner: "della" },
  // pivot
  { key: "pivot.options", stage: "pivot", label: "Send Your verdict, your options", owner: "della", doc: "verdict_paths" },
  { key: "pivot.credit", stage: "pivot", label: "No-go credit and expiry confirmed in the tracker", owner: "alex", flag: "money" },
  { key: "pivot.alt_sheet", stage: "pivot", label: "Send the Alternate Strategy Launch sheet", owner: "della", doc: "alt_strategy_sales", paths: ["alt_strategy"] },
  { key: "pivot.alt_proposal", stage: "pivot", label: "Alternate scope proposed, signed, paid", owner: "alex", doc: "proposal", paths: ["alt_strategy"], flag: "money" },
  { key: "pivot.buy_box", stage: "pivot", label: "Co-Living Buy Box delivered (no charge)", owner: "claude", doc: "buy_box", paths: ["next_property"] },
  { key: "pivot.screen_offered", stage: "pivot", label: "Rapid Property Screen offered", owner: "della", doc: "rapid_screen_sales", paths: ["next_property"] },
  { key: "pivot.screen_delivered", stage: "pivot", label: "Screens delivered (log each address in the timeline)", owner: "alex", doc: "rapid_screen_report", paths: ["next_property"] },
  { key: "pivot.second_address", stage: "pivot", label: "Second-address Section 1 proposed", owner: "della", doc: "proposal", paths: ["next_property"] },
  { key: "pivot.followup_7", stage: "pivot", label: "Day-7 follow-up", owner: "della", doc: "email_pack" },
  { key: "pivot.followup_21", stage: "pivot", label: "Day-21 follow-up: path chosen, or move to Market Watch", owner: "della", doc: "market_watch" },
  // s2_setup
  { key: "s2.room_specs", stage: "s2_setup", label: "Room specs written for every room and shared space", owner: "della", doc: "room_spec" },
  { key: "s2.shopping_list", stage: "s2_setup", label: "Furnishing + supply list approved by the client", owner: "alex", doc: "shopping_list" },
  { key: "s2.handyman", stage: "s2_setup", label: "Handyman booked, day-rate agreement signed", owner: "alex", doc: "handyman_agreement", flag: "legal" },
  { key: "s2.access", stage: "s2_setup", label: "Access + accounts handoff complete", owner: "client", doc: "access_handoff" },
  { key: "s2.day1", stage: "s2_setup", label: "On-site day 1", owner: "alex", doc: "onsite_runbook" },
  { key: "s2.day2", stage: "s2_setup", label: "On-site day 2", owner: "alex", doc: "onsite_runbook" },
  { key: "s2.day3", stage: "s2_setup", label: "On-site day 3: staging to Della's standard", owner: "della", doc: "staging_standard" },
  { key: "s2.inventory", stage: "s2_setup", label: "Supply inventory + par levels loaded", owner: "alex" },
  { key: "s2.signoff", stage: "s2_setup", label: "Readiness walkthrough signed", owner: "della", doc: "readiness_signoff" },
  // s3_launch
  { key: "s3.photos", stage: "s3_launch", label: "Photography complete", owner: "della", doc: "photographer_brief" },
  { key: "s3.copy", stage: "s3_launch", label: "Listing copy written for all 3 channels", owner: "claude", doc: "listing_copy" },
  { key: "s3.airbnb", stage: "s3_launch", label: "Airbnb listings live, every room", owner: "alex" },
  { key: "s3.rules", stage: "s3_launch", label: "House rules reviewed with the client", owner: "della", doc: "house_rules" },
  { key: "s3.site", stage: "s3_launch", label: "Booking site deployed on the client's domain", owner: "alex", doc: "white_label_runbook" },
  { key: "s3.lease", stage: "s3_launch", label: "Lease workflow reviewed with the client", owner: "della", doc: "rental_agreement_guide", flag: "legal" },
  { key: "s3.stripe", stage: "s3_launch", label: "Client's own Stripe connected; Alex flips live keys by hand", owner: "alex", doc: "g14", flag: "money" },
  { key: "s3.alerts", stage: "s3_launch", label: "Email + text alerts tested end to end", owner: "alex" },
  { key: "s3.go_live", stage: "s3_launch", label: "Go-live checklist passed, client approval signed", owner: "della", doc: "go_live" },
  // s4_marketing
  { key: "s4.accounts", stage: "s4_marketing", label: "Instagram + TikTok created, brand kit delivered", owner: "alex", doc: "brand_kit" },
  { key: "s4.baseline", stage: "s4_marketing", label: "Visibility baseline saved", owner: "alex", doc: "visibility_baseline" },
  { key: "s4.strategy", stage: "s4_marketing", label: "12-month strategy delivered", owner: "della", doc: "marketing_strategy" },
  { key: "s4.content", stage: "s4_marketing", label: "10 pieces produced, approved, scheduled", owner: "claude" },
  { key: "s4.seo", stage: "s4_marketing", label: "AEO / SEO foundation live", owner: "alex" },
  { key: "s4.blog", stage: "s4_marketing", label: "Blog page + first 2 articles published", owner: "claude", doc: "article_prompt" },
  { key: "s4.calendar", stage: "s4_marketing", label: "30-day posting calendar delivered", owner: "claude" },
  // s5_operate
  { key: "s5.auth", stage: "s5_operate", label: "Limited operating authorization signed", owner: "alex", doc: "operating_auth", flag: "legal" },
  { key: "s5.toolkit", stage: "s5_operate", label: "Operating toolkit pre-loaded with rooms and numbers", owner: "alex", doc: "tenant_tracker_guide" },
  { key: "s5.vendors", stage: "s5_operate", label: "Vendor network shared", owner: "alex" },
  { key: "s5.note_1", stage: "s5_operate", label: "Weekly operating note · week 1", owner: "della", doc: "weekly_note" },
  { key: "s5.note_2", stage: "s5_operate", label: "Weekly operating note · week 2", owner: "della", doc: "weekly_note" },
  { key: "s5.note_3", stage: "s5_operate", label: "Weekly operating note · week 3", owner: "della", doc: "weekly_note" },
  { key: "s5.note_4", stage: "s5_operate", label: "Weekly operating note · week 4", owner: "della", doc: "weekly_note" },
  { key: "s5.sessions_a", stage: "s5_operate", label: "Operator sessions 1 to 4 held", owner: "della", doc: "agenda_pack" },
  // s5_advise
  { key: "s5.sessions_b", stage: "s5_advise", label: "Operator sessions 5 to 8 held", owner: "della", doc: "agenda_pack" },
  { key: "s5.sessions_c", stage: "s5_advise", label: "Operator sessions 9 to 12 held", owner: "della", doc: "agenda_pack" },
  { key: "s5.playbook_draft", stage: "s5_advise", label: "Self-management playbook drafted", owner: "claude", doc: "playbook" },
  // handoff
  { key: "handoff.scorecard", stage: "handoff", label: "Day-90 scorecard delivered", owner: "alex", doc: "day90_scorecard" },
  { key: "handoff.playbook", stage: "handoff", label: "Playbook delivered", owner: "della", doc: "playbook" },
  { key: "handoff.revoke", stage: "handoff", label: "BNHG access revoked, checklist signed", owner: "alex", doc: "handoff_checklist", flag: "legal" },
  { key: "handoff.ask", stage: "handoff", label: "Testimonial + referral ask sent", owner: "della", doc: "testimonial_referral" },
  { key: "handoff.decision", stage: "handoff", label: "Client chooses: self-manage or apply for management", owner: "client" },
  // after
  { key: "managed.agreement", stage: "managed", label: "Ongoing management agreement signed", owner: "alex", doc: "management_agreement", flag: "legal" },
  { key: "alumni.q1", stage: "alumni", label: "Quarterly check-in · 1", owner: "della" },
  { key: "alumni.q2", stage: "alumni", label: "Quarterly check-in · 2", owner: "della" },
  { key: "nurture.enrolled", stage: "nurture", label: "Market Watch started", owner: "della", doc: "market_watch" },
  { key: "nurture.q1", stage: "nurture", label: "Quarterly check-in · 1", owner: "della", doc: "market_watch" },
  { key: "nurture.q2", stage: "nurture", label: "Quarterly check-in · 2", owner: "della", doc: "market_watch" },
  { key: "nurture.q3", stage: "nurture", label: "Quarterly check-in · 3", owner: "della", doc: "market_watch" },
  { key: "nurture.q4", stage: "nurture", label: "Quarterly check-in · 4: re-screen or release", owner: "della", doc: "market_watch" },
  { key: "closed_lost.reason", stage: "closed_lost", label: "Reason logged in the timeline", owner: "della" },
] as const;

export const STEP_KEYS: ReadonlySet<string> = new Set(STEPS.map((s) => s.key));

const STAGE_BY_KEY = new Map(STAGES.map((s) => [s.key, s]));
export function getStage(key: string) {
  return STAGE_BY_KEY.get(key as StageKey);
}

export function stageIndex(key: StageKey): number {
  return STAGE_KEYS.indexOf(key);
}

/** Steps a client on `path` sees at `stage`. */
export function stepsFor(stage: StageKey, path: PathKey): JourneyStep[] {
  return STEPS.filter((s) => s.stage === stage && (!s.paths || s.paths.includes(path)));
}

/** Credit the approved tiered policy grants for a verdict logged on `verdictDate` (YYYY-MM-DD). */
export function creditForVerdict(verdict: VerdictKey, verdictDate: string): { creditCents: number; creditExpiresAt: string } {
  const rule = VERDICTS.find((v) => v.key === verdict)!;
  const expires = new Date(`${verdictDate}T12:00:00Z`);
  expires.setUTCDate(expires.getUTCDate() + rule.creditDays);
  return { creditCents: rule.creditCents, creditExpiresAt: expires.toISOString().slice(0, 10) };
}

/** Whole days from `today` until `date`; negative once past. Both YYYY-MM-DD. */
export function daysUntil(date: string, today: string): number {
  const ms = Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}
