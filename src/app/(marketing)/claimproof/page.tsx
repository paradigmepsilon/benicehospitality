import type { Metadata } from "next";
import Image from "next/image";
import BuyTierButton from "./_components/BuyTierButton";
import GuideForm from "./_components/GuideForm";
import StageSelector from "./_components/StageSelector";
import ExposureCalculator from "./_components/ExposureCalculator";
import Testimonials from "./_components/Testimonials";

/**
 * Claim Proof — v2 (A/B alternate). Governing idea: APPROVED-BUT-UNDERPAID is
 * the primary wound; the page sells financial protection and operational
 * control. Offer architecture per the July 2026 product brief:
 *
 *   DELIVERY MODEL: one master product (Claim Proof Complete),
 *   presented as a mobile-first "Claim Command Center" (guided workflows +
 *   printable PDFs + editable docs + short videos). Emergency Kit is the
 *   urgent-filing excerpt; Fleet License adds the Operations layer + team
 *   rights. Free 24-Hour Checklist is the lead magnet, surfaced 3x (hero,
 *   stage selector, footer).
 *
 *   UPGRADE LADDER — Emergency → Complete: full $47 credit within 7 days.
 *   Complete → Fleet: purchase applies within 30 days. (Checkout mechanism =
 *   manual/email honoring until a Stripe coupon flow exists. TODO: build the
 *   upgrade route before scaling paid traffic.)
 *
 *   UPDATE POLICY — permanent access to purchased version + 12 months of
 *   template/policy-reference updates. NOT "lifetime". FAQ matches.
 *
 * HONESTY GUARDRAILS:
 *  - $8,800/$5,700/$3,100 is an ILLUSTRATIVE INDUSTRY EXAMPLE, labeled so.
 *  - Product previews + the demo video are REAL captures of the live Command
 *    Center (public/images/claimproof/portal/, public/videos/) with example
 *    data. Recapture via scratchpad capture-assets.mjs after product changes;
 *    bump the -vN filename suffix (Chrome pins images by URL).
 *  - PLACEHOLDER founder stats mirror v1 ProofBand (24 cars / 4,500+ trips /
 *    200+ claims / 8 years). Verify against real BNA records before launch.
 *  - No testimonials are shown because none are verified yet. Add only real,
 *    permissioned ones after the beta cohort. Search: TESTIMONIALS TODO.
 *  - Every tool named in a tier exists in the shipped Command Center (36
 *    tools, see src/app/claimproof/portal/_content/).
 * No em dashes in user-facing text on this page by brand rule.
 */

export const metadata: Metadata = {
  title: "Host Claim Defense System - Turo Damage Claims, Underpayment & Downtime",
  description:
    "An approved Turo claim can still leave you paying thousands. A mobile-first Claim Command Center: capture defensible evidence, file inside the window, compare the appraisal to the shop estimate, and keep every follow-up organized. Independent resource, not affiliated with Turo.",
};

// --- Four-layer mechanism (Fleet adds Layer 05: Operations) -------------------
const LAYERS: Array<{ n: string; name: string; head: string; body: string }> = [
  {
    n: "01",
    name: "Proof",
    head: "Establish the condition, before and after.",
    body: "A repeatable photo sequence with context shots, detail shots, timestamps, and consistent angles. When a guest says 'that was already there,' your file answers for you.",
  },
  {
    n: "02",
    name: "Timing",
    head: "File the right information inside the window.",
    body: "A step-by-step process for the first 24 hours: what to capture, what to write, what to upload, and in what order, so a valid claim never dies on the deadline.",
  },
  {
    n: "03",
    name: "Valuation",
    head: "Find the gap the appraisal left behind.",
    body: "A line-by-line method for comparing the initial appraisal against the body-shop estimate, and organizing the documentation behind a supplement request.",
  },
  {
    n: "04",
    name: "Follow-up",
    head: "Control the communication, not just the claim.",
    body: "A follow-up cadence, escalation record, and downtime tracker so the claim lives in one organized file instead of scattered emails and texts.",
  },
];

// --- Command Center workflow --------------------------------------------------
const WORKFLOW: Array<{ step: string; head: string; body: string }> = [
  { step: "1", head: "Choose your situation", body: "Preparing, damage found today, approved too low, or stuck. No course library to dig through." },
  { step: "2", head: "Follow the next-action checklist", body: "Each workflow shows the immediate next step, the time it takes, and the mistakes that sink it." },
  { step: "3", head: "Build the claim file", body: "Templates, a completed example, and a file index so 'complete' is never a guess." },
  { step: "4", head: "Compare the valuation", body: "The appraisal and the shop estimate, side by side, line by line, with the gap totaled for you." },
  { step: "5", head: "Track the follow-up", body: "Every contact, promise, and deadline logged, so nothing dies waiting on a callback." },
];

const FIRST_15: Array<[string, string]> = [
  ["Minute 1", "Select your claim stage"],
  ["Minute 3", "Open the correct checklist"],
  ["Minute 5", "Identify what evidence is missing"],
  ["Minute 10", "Complete the incident summary"],
  ["Minute 15", "Know your next submission or follow-up step"],
];

// --- What you get: real screenshots from the live Command Center --------------
const PREVIEWS: Array<{ label: string; outcome: string; src: string }> = [
  { label: "Damage Photo Protocol", outcome: "Photos a reviewer can trust: angles, context, scale, and a quality self-check.", src: "/images/claimproof/portal/photo-protocol-v4.png" },
  { label: "Incident Summary Builder", outcome: "A factual, specific account of what happened, without emotional language.", src: "/images/claimproof/portal/incident-summary-v3.png" },
  { label: "Valuation Gap Worksheet", outcome: "Both estimates in one document, differences totaled, largest gaps flagged.", src: "/images/claimproof/portal/gap-worksheet-v3.png" },
  { label: "Supplement Request Builder", outcome: "A cover email, comparison attachment, and evidence index, ready to send.", src: "/images/claimproof/portal/supplement-builder-v3.png" },
  { label: "Communication Log", outcome: "Every contact, promise, and missed callback on record, with the next follow-up dated.", src: "/images/claimproof/portal/comms-log-v3.png" },
  { label: "Fleet Claim Dashboard", outcome: "Every open claim by vehicle, stage, gap, idle days, owner, and next action.", src: "/images/claimproof/portal/fleet-tracker-v3.png" },
];

// --- Use-case pricing (checkout keys stay core/pro/fleet) ---------------------
const TIERS: Array<{
  id: "core" | "pro" | "fleet";
  name: string;
  price: string;
  who: string;
  cta: string;
  features: string[];
  hero?: boolean;
  note?: string;
}> = [
  {
    id: "core",
    name: "Claim Proof Core",
    price: "47",
    who: "For the host who found damage today.",
    cta: "Protect my next claim",
    features: [
      "Emergency Quick Start: the one-screen do-this-next sequence",
      "24-Hour Action Timeline, from the first 15 minutes through day 7",
      "Damage Photo Protocol with vehicle-angle map and quality self-check",
      "Evidence Sufficiency Scorecard: know what is missing before you submit",
      "Incident Summary Builder, submission checklist, and claim file index",
      "Neutral guest and support communication templates",
      "A completed example claim file, plus guided video walkthroughs",
    ],
    note: "Your full $47 applies toward Complete if you upgrade within 7 days.",
  },
  {
    id: "pro",
    name: "Claim Proof Complete",
    price: "97",
    who: "The master system: prevention, filing, underpayment, and follow-up.",
    cta: "Get Complete Claim Defense",
    hero: true,
    features: [
      "Everything in Emergency, plus:",
      "Proof Pack: pre-trip photo standard, return-inspection SOP, five-minute inspection card, evidence quality audit",
      "Valuation Pack: appraisal-vs-estimate worksheet, repair estimate glossary, missing-or-reduced-item checklist, supplement request builder, completed valuation example",
      "Follow-Up Pack: communication log, follow-up script library, escalation decision map, downtime tracker, claim economics worksheet",
      "Difficult-claim decision matrix and claim closeout checklist",
      "Task-specific walkthrough videos, under one hour total",
      "12 months of template and policy-reference updates included",
    ],
  },
  {
    id: "fleet",
    name: "Claim Proof Fleet",
    price: "197",
    who: "For operators running multiple cars or a team.",
    cta: "Equip my fleet",
    features: [
      "Everything in Complete, plus Layer 05: Operations",
      "Multi-vehicle claim dashboard and vehicle evidence folder system",
      "Staff check-in and check-out SOP, plus the claim handoff form",
      "Role matrix, photo-quality audit form, manager review checklist",
      "Fleet KPI dashboard and the 20-minute weekly claim review agenda",
      "Staff training pack: short videos, editable deck, sign-off sheet",
      "Team license: up to 5 staff users and 10 vehicles, internal use",
    ],
    note: "Bought Complete first? It applies toward Fleet within 30 days.",
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Will this guarantee Turo approves or increases my claim?",
    a: "No. The system cannot control platform decisions. It helps you build a more complete, timely, organized, and supportable claim file, which is the part you actually control.",
  },
  {
    q: "Can it help after I've already received a low appraisal?",
    a: "Yes, within limits. The valuation gap worksheet and supplement builder are designed for exactly this: putting the appraisal next to the shop estimate, identifying reduced or missing line items, and organizing a supplement request. It does not promise Turo will accept it.",
  },
  {
    q: "What if the 24-hour deadline already passed?",
    a: "We won't pretend the product can reverse a hard eligibility rule. If the window closed, the kit shows what you can still document and what may no longer be recoverable, so you spend your energy where it can matter.",
  },
  {
    q: "Does this make smoking or wear-and-tear claims payable?",
    a: "No. Those categories have higher evidence thresholds and common exclusions. The decision matrix helps you judge whether a claim is worth pursuing before you sink ten hours into it.",
  },
  {
    q: "Is this a course I have to sit through?",
    a: "No. It is your Claim Command Center: you pick your situation and follow a guided workflow with checklists, templates, and a completed example. Total video time is under an hour, split into short task-specific chapters. The templates are the product; the videos just explain them.",
  },
  {
    q: "What if I buy the Emergency Kit and realize I need more?",
    a: "Upgrade within 7 days and your full $47 applies toward the Complete system, so choosing fast under pressure carries no penalty. Complete purchases apply toward the Fleet license within 30 days.",
  },
  {
    q: "How often is it updated?",
    a: "You keep permanent access to the version you purchased, and every policy-dependent page carries a visible 'last reviewed' date. Template and policy-reference updates are included for 12 months, with a public version history, and you can renew updates after that if you want them.",
  },
  {
    q: "Where is my claim data stored?",
    a: "Your claims, worksheets, and logs save to your Claim Proof account and sync securely across your devices, so you can start on your phone beside the car and finish on your laptop. Your actual photos and ID scans stay in your own folders and cloud drive, organized by our file structure. We store what you type into the tools; you keep the files.",
  },
  {
    q: "Is this legal, insurance, or claims-adjusting advice?",
    a: "No. It is operational guidance for organizing your own documentation and follow-up. For legal or coverage questions specific to your situation, consult a qualified professional.",
  },
  {
    q: "Is this affiliated with Turo?",
    a: "No. This is an independent resource. 'Turo' is a trademark of Turo Inc., used only to describe the platform this product addresses.",
  },
];

// Real product screenshot card. `src` is a capture of the live Command Center
// (public/images/claimproof/portal/); the styled fallback renders only when a
// shot hasn't been captured yet.
function PreviewPlaceholder({
  label,
  tall = false,
  src,
  focus = "top",
}: {
  label: string;
  tall?: boolean;
  src?: string;
  focus?: "top" | "center";
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-xl " +
        (src
          ? // real app captures get an elevated-window treatment so they lift
            // off the page: steel-blue ring + soft glow from the app palette
            "border border-[#8BA5BE]/30 bg-[#27262E] shadow-[0_12px_48px_-12px_rgba(139,165,190,0.25)] ring-1 ring-[#8BA5BE]/10 "
          : "border border-white/15 bg-near-black ") +
        (tall ? "aspect-[3/4]" : "aspect-[4/3]")
      }
    >
      {src ? (
        <Image
          src={src}
          alt={`${label} — inside the Claim Command Center`}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className={
            "object-cover " +
            (focus === "top" ? "object-top" : "object-center")
          }
        />
      ) : (
        <div aria-hidden className="absolute inset-0 p-5 space-y-3 opacity-70">
          <div className="h-2.5 w-1/3 rounded bg-warm-gold/60" />
          <div className="h-2 w-4/5 rounded bg-white/25" />
          <div className="h-2 w-3/5 rounded bg-white/25" />
          <div className="mt-4 h-14 rounded-lg border border-white/15 bg-white/[0.05]" />
          <div className="h-2 w-2/3 rounded bg-white/25" />
          <div className="h-2 w-1/2 rounded bg-white/25" />
          <div className="mt-3 h-9 w-28 rounded-full bg-warm-gold/40" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-near-black/95 via-near-black/60 to-transparent p-4 pt-8">
        <p className="font-sans text-xs font-semibold text-white/90">{label}</p>
        <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-warm-gold/70">
          {src ? "Inside the product" : "Preview"}
        </p>
      </div>
    </div>
  );
}

function CheckIcon({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      className={
        "mt-1 h-4 w-4 flex-none " + (dark ? "text-warm-gold" : "text-warm-gold")
      }
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" />
    </svg>
  );
}

export default function ClaimProofV2() {
  return (
    <main className="bg-near-black text-white">
      {/* Suppress the marketing site's chrome on this conversion page: the
          brief calls for a minimal header with no exit paths, and this page
          renders its own strip + nav below. Safe because this page contains
          no <header>/<footer> elements of its own. */}
      <style
        dangerouslySetInnerHTML={{
          __html: "header, footer { display: none !important; }",
        }}
      />
      {/* ---------- URGENT STRIP + MINIMAL HEADER ---------- */}
      <div className="fixed inset-x-0 top-0 z-50">
        <a
          href="#free-guide"
          className="block bg-terracotta px-4 py-2 text-center font-sans text-xs md:text-sm font-medium text-white transition-colors hover:bg-terracotta/85"
        >
          Damage found in the last 24 hours? Get the free emergency claim
          checklist →
        </a>
        {/* Fully opaque: the marketing layout's own nav sits underneath and
            ghosts through any translucency. */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-near-black px-5 py-3 md:px-8">
          <span className="font-display text-lg font-semibold text-white">
            Claim<span className="text-warm-gold">Proof</span>
          </span>
          <nav className="hidden items-center gap-6 md:flex">
            {[
              ["What you get", "#what-you-get"],
              ["How it works", "#how-it-works"],
              ["Results", "#results"],
              ["Pricing", "#pricing"],
            ].map(([t, href]) => (
              <a
                key={href}
                href={href}
                className="font-sans text-sm text-white/60 transition-colors hover:text-warm-gold"
              >
                {t}
              </a>
            ))}
          </nav>
          <div className="flex flex-none items-center gap-3 md:gap-4">
            <a
              href="/claimproof/login"
              className="font-sans text-sm font-medium text-white/70 transition-colors hover:text-warm-gold"
            >
              Log in
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-warm-gold px-5 py-2 font-sans text-sm font-semibold text-near-black transition-colors hover:bg-gold-light"
            >
              Get the System
            </a>
          </div>
        </div>
      </div>

      {/* ---------- HERO: approved-but-underpaid ---------- */}
      <section
        id="cp-hero"
        className="relative px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-16 md:pb-20 overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-5">
              For active Turo hosts and fleet operators
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] mb-6">
              An approved claim can still leave you paying{" "}
              <span className="text-[#E8917A]">thousands.</span>
            </h1>
            <p className="font-display text-xl md:text-2xl font-semibold italic text-warm-gold mb-6">
              Approved isn&rsquo;t paid. Claim Proof closes the gap.
            </p>
            <p className="font-sans text-lg md:text-xl text-white/75 leading-relaxed max-w-xl mb-8">
              Your mobile-first Claim Command Center. Capture defensible
              before-and-after evidence, file inside the window, compare the
              initial appraisal against the body-shop estimate, prepare a
              supplement request, and keep every follow-up organized. Pick your
              situation; it hands you the next step.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-5">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-warm-gold px-7 py-2.5 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
              >
                Get the Complete System
              </a>
              <a
                href="#stage-today"
                className="text-center font-sans text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-warm-gold transition-colors"
              >
                Damage happened today? Start with the 24-hour tools
              </a>
            </div>
            <p className="font-sans text-sm text-white/55 mb-5">
              Not ready to buy?{" "}
              <a
                href="#free-guide"
                className="font-semibold text-warm-gold underline underline-offset-4 hover:text-gold-light"
              >
                Get the free 24-Hour Claim Rescue Checklist
              </a>
              .
            </p>
            <p className="font-sans text-xs text-white/45 leading-relaxed max-w-lg">
              Instant portal access · one-time purchase · built to use on your
              phone, beside the car · independent resource, not affiliated with
              Turo · no approval or payout guarantee
            </p>
          </div>

          {/* product-first visual, not a car photo */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <PreviewPlaceholder
                label="24-hour emergency checklist"
                tall
                src="/images/claimproof/portal/mobile-checklist-v3.png"
              />
              <div className="space-y-4 pt-8">
                <PreviewPlaceholder
                  label="Valuation gap worksheet"
                  src="/images/claimproof/portal/gap-worksheet-v3.png"
                />
                <PreviewPlaceholder
                  label="Supplement request builder"
                  src="/images/claimproof/portal/supplement-builder-v3.png"
                />
              </div>
            </div>
            {/* the gap, made concrete, clearly illustrative */}
            <div className="mt-4 rounded-xl border border-warm-gold/30 bg-near-black/80 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3 font-sans">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/45">
                    Shop estimate
                  </p>
                  <p className="font-display text-xl font-semibold text-white">
                    $8,800
                  </p>
                </div>
                <span className="text-white/30">vs</span>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/45">
                    Initial appraisal
                  </p>
                  <p className="font-display text-xl font-semibold text-white">
                    $5,700
                  </p>
                </div>
                <span className="text-white/30">=</span>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#E8917A]">
                    Your gap
                  </p>
                  <p className="font-display text-xl font-semibold text-[#E8917A]">
                    $3,100
                  </p>
                </div>
              </div>
              <p className="mt-2 font-sans text-[10px] text-white/35 text-center">
                Illustrative industry example. Not a Be Nice Autos result.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- STAGE SELECTOR ---------- */}
      <section className="px-6 md:px-12 lg:px-20 py-10 md:py-14 border-t border-white/10 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <StageSelector />
          <p className="mt-6 font-sans text-sm text-white/50">
            Just researching for now? Start with the free{" "}
            <a
              href="#free-guide"
              className="font-semibold text-warm-gold underline underline-offset-4 hover:text-gold-light"
            >
              24-Hour Claim Rescue Checklist
            </a>{" "}
            and keep it in the glovebox.
          </p>
        </div>
      </section>

      {/* ---------- REFRAME THE PROBLEM: the gap (pain-point zone) ---------- */}
      <section
        id="stage-underpaid"
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-terracotta/25 bg-terracotta/[0.08] scroll-mt-28"
      >
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            Where the loss really happens
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-6 max-w-3xl">
            Most hosts do not lose at &ldquo;denied.&rdquo; They lose in the gap.
          </h2>
          <p className="font-sans text-lg text-white/70 leading-relaxed max-w-2xl mb-12">
            A claim can be technically approved and still leave you paying a
            large share of the repair. It can be valid but filed too late.
            Obvious in person but impossible to prove in weak photos. Eventually
            paid, while the car spends weeks earning nothing.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              [
                "Approved, but short",
                "A $8,800 repair approved at $5,700 leaves a $3,100 gap the host absorbs. Approval is not the same as being made whole.",
                true,
              ],
              [
                "The 24-hour window",
                "A legitimate claim can fail before anyone evaluates the damage, if the filing deadline from trip end is missed.",
                false,
              ],
              [
                "&ldquo;That was already there&rdquo;",
                "Without clear pre-trip and post-trip evidence, a guest denial becomes one person's word against another's.",
                false,
              ],
              [
                "A parked car earns $0",
                "Even a successful claim becomes a major loss when the vehicle sits out of service for 30 to 90 days.",
                false,
              ],
            ].map(([title, body, hot]) => (
              <div
                key={title as string}
                className={
                  "rounded-2xl border p-6 md:p-7 " +
                  (hot
                    ? "border-terracotta/40 bg-terracotta/[0.08]"
                    : "border-white/12 bg-white/[0.02]")
                }
              >
                <h3
                  className="font-sans font-bold text-white mb-3"
                  dangerouslySetInnerHTML={{ __html: title as string }}
                />
                <p
                  className="font-sans text-sm text-white/70 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: body as string }}
                />
              </div>
            ))}
          </div>
          <p className="mt-10 font-display text-xl md:text-2xl text-warm-gold italic leading-relaxed max-w-3xl">
            Most trips go exactly as planned. One bad claim can erase the profit
            from dozens of good ones.
          </p>
        </div>
      </section>

      {/* ---------- MECHANISM: four-layer defense ---------- */}
      <section
        id="how-it-works"
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 bg-white/[0.015] scroll-mt-28"
      >
        {/* anchor for stage selector: "Preparing before a claim" */}
        <span id="stage-prepare" aria-hidden className="block scroll-mt-40" />
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            The mechanism
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-4 max-w-3xl">
            Support may be inconsistent. Your claim file cannot be.
          </h2>
          <p className="font-sans text-base text-white/60 max-w-2xl mb-14">
            Your Four-Layer Claim Defense System. Each layer closes one of the
            ways you lose money on an otherwise valid claim. Fleet operators add
            a fifth layer: Operations, so your whole team runs the same standard.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {LAYERS.map((l) => (
              <div
                key={l.n}
                className="rounded-2xl border border-white/12 bg-white/[0.02] p-6 md:p-8"
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-display text-3xl font-semibold text-warm-gold">
                    {l.n}
                  </span>
                  <span className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                    {l.name}
                  </span>
                </div>
                <h3 className="font-sans font-bold text-white mb-3 text-lg leading-snug">
                  {l.head}
                </h3>
                <p className="font-sans text-sm text-white/70 leading-relaxed">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-warm-gold/25 bg-warm-gold/[0.05] p-6 md:p-7">
            <h3 className="font-sans font-bold text-warm-gold mb-2">
              Plus: know what is worth pursuing
            </h3>
            <p className="font-sans text-sm text-white/75 leading-relaxed max-w-3xl">
              Your claim-category matrix that shows where evidence thresholds are
              higher and where you may be dealing with wear-and-tear, an
              exclusion, or a weak claim. It will not make hard categories
              payable. It helps you make a faster, more informed decision before
              you spend ten hours chasing one.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- COMMAND CENTER: how it's delivered ---------- */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 scroll-mt-28">
        {/* anchor for stage selector + hero secondary CTA: "Damage found today" */}
        <span id="stage-today" aria-hidden className="block scroll-mt-40" />
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            How it&rsquo;s delivered
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-4 max-w-3xl">
            Your Claim Command Center, not a folder of downloads.
          </h2>
          <p className="font-sans text-base text-white/60 max-w-2xl mb-12">
            After purchase you land on one screen with four choices, matching
            the selector above. Each choice opens a guided workflow: the next
            action, the time it takes, the template, a completed example, and
            the mistakes to avoid. You never dig through a library.
          </p>

          {/* the 5-step workflow */}
          <div className="grid md:grid-cols-5 gap-4 mb-14">
            {WORKFLOW.map((w) => (
              <div
                key={w.step}
                className="rounded-xl border border-white/12 bg-white/[0.02] p-5"
              >
                <p className="font-display text-2xl font-semibold text-warm-gold mb-2">
                  {w.step}
                </p>
                <p className="font-sans text-sm font-bold text-white mb-2 leading-snug">
                  {w.head}
                </p>
                <p className="font-sans text-xs text-white/60 leading-relaxed">
                  {w.body}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* first 15 minutes */}
            <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-6 md:p-8">
              <h3 className="font-sans font-bold text-white mb-1">
                Your first 15 minutes after purchase
              </h3>
              <p className="font-sans text-xs text-white/50 mb-6">
                So this is not another resource you never open.
              </p>
              <ul className="space-y-3">
                {FIRST_15.map(([t, action]) => (
                  <li key={t} className="flex items-baseline gap-4">
                    <span className="flex-none w-20 font-sans text-xs font-bold uppercase tracking-wider text-warm-gold">
                      {t}
                    </span>
                    <span className="font-sans text-sm text-white/80">
                      {action}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* formats + demo slot */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-6 md:p-8">
                <h3 className="font-sans font-bold text-white mb-4">
                  Every tool, in the format you need it
                </h3>
                <ul className="grid grid-cols-2 gap-3 font-sans text-sm text-white/75">
                  <li>Mobile web checklists with copy buttons</li>
                  <li>Printable one-page PDFs</li>
                  <li>Editable documents and spreadsheets</li>
                  <li>Short task videos, under an hour total</li>
                </ul>
                <p className="mt-4 font-sans text-xs text-white/45 leading-relaxed">
                  Your claims and worksheets sync securely to your account across
                  your devices. Your photos and ID scans stay in your own cloud
                  drive, in your control.
                </p>
              </div>
              {/* Real screen recording of the live Command Center: dashboard →
                  "approved too low" → gap worksheet typed live → gap totaled →
                  supplement builder → follow-up log. Narrated walkthrough with a
                  calm male voiceover (starts on play; not muted, no autoplay). */}
              <div className="overflow-hidden rounded-2xl border border-warm-gold/25 bg-warm-gold/[0.04]">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/images/claimproof/portal/demo-poster-v3.jpg"
                  className="aspect-[16/10] w-full"
                >
                  <source src="/videos/claimproof-demo-v4.mp4" type="video/mp4" />
                </video>
                <div className="px-5 py-4">
                  <p className="font-sans text-sm font-bold text-white">
                    Watch it work: a narrated walk inside the product
                  </p>
                  <p className="font-sans text-xs text-white/55">
                    From &ldquo;my claim was approved too low&rdquo; to a
                    totaled valuation gap and a ready supplement packet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHAT YOU GET: large previews with outcome captions ---------- */}
      <section
        id="what-you-get"
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 bg-white/[0.015] scroll-mt-28"
      >
        {/* anchor for stage selector: "Claim stuck" (follow-up tooling lives here) */}
        <span id="stage-stuck" aria-hidden className="block scroll-mt-40" />
        <div className="max-w-6xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            What you actually get
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-4 max-w-3xl">
            Not a course. Your working claim file, ready when the car comes back
            damaged.
          </h2>
          <p className="font-sans text-base text-white/60 max-w-2xl mb-14">
            Six of the flagship tools, and the result each one creates. Every
            preview below is drawn from the actual product.
          </p>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
            {PREVIEWS.map((p) => (
              <figure key={p.label}>
                <PreviewPlaceholder label={p.label} src={p.src} />
                <figcaption className="mt-3 font-sans text-sm text-white/65 leading-relaxed">
                  <span className="font-semibold text-white">{p.label}.</span>{" "}
                  {p.outcome}
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-12 font-sans text-sm text-white/50 max-w-3xl">
            Behind these sit the full packs: the Emergency filing sequence, the
            Proof Pack, the Valuation Pack, the Follow-Up Pack, and the Fleet
            Operations layer. The complete contents are listed under each plan
            below.
          </p>
        </div>
      </section>

      {/* ---------- RESULTS: cream visual reset — case study + authority ---------- */}
      <section
        id="results"
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-[#FAF8F3] text-near-black scroll-mt-28"
      >
        <div className="max-w-4xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            Show the math, not just a testimonial
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-4 text-deep-teal">
            Anatomy of a valuation gap.
          </h2>
          <p className="font-sans text-base text-charcoal/80 mb-10 max-w-2xl">
            An illustrative breakdown of how an approved claim can still fall
            short of the actual repair cost, and where a supplement request
            focuses.
          </p>

          <div className="rounded-2xl border border-near-black/10 bg-white overflow-hidden shadow-sm">
            <table className="w-full">
              <tbody className="font-sans">
                {[
                  ["Body-shop estimate", "$8,800", "normal"],
                  ["Initial appraisal", "$5,700", "normal"],
                  ["Unfunded repair gap", "$3,100", "hot"],
                ].map(([label, amt, tone]) => (
                  <tr
                    key={label}
                    className="border-b border-near-black/8 last:border-0"
                  >
                    <td className="px-5 md:px-7 py-4 text-charcoal text-sm md:text-base">
                      {label}
                    </td>
                    <td
                      className={
                        "px-5 md:px-7 py-4 text-right font-display text-xl md:text-2xl font-semibold tabular-nums " +
                        (tone === "hot" ? "text-terracotta" : "text-near-black")
                      }
                    >
                      {amt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {[
              ["Where the gap hides", "Calibration, blend labor, and materials are the line items appraisals most often reduce or omit."],
              ["What a supplement does", "Puts the shop's itemized quote next to the appraisal and requests review of the specific differences."],
              ["What you cannot control", "Whether every disputed item is accepted. The file makes the case; the platform still decides."],
            ].map(([h, b]) => (
              <div
                key={h}
                className="rounded-xl border border-near-black/10 bg-white p-5"
              >
                <p className="font-sans font-semibold text-deep-teal mb-2 text-sm">
                  {h}
                </p>
                <p className="font-sans text-sm text-charcoal/80 leading-relaxed">
                  {b}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 font-sans text-xs text-charcoal/60 leading-relaxed">
            Illustrative example drawn from publicly documented host-dispute
            reporting, not a Be Nice Autos claim outcome. Results vary. This
            product does not guarantee any recovery.
          </p>

        </div>
      </section>

      {/* ---------- BUILT BY A WORKING FLEET (gray section, enlarged) ---------- */}
      <section
        id="operators"
        className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-[#E9E6E0] text-near-black scroll-mt-28"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-sm font-semibold tracking-[0.28em] uppercase text-warm-gold mb-5">
            The operators behind it
          </p>
          {/* Stats are PLACEHOLDER (mirror v1 ProofBand). Swap for real BNA
              records before launch — the enlarged treatment raises the stakes
              on accuracy. Search: PLACEHOLDER founder stats. */}
          <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] text-deep-teal mb-6">
            Built by a working fleet, not a marketer.
          </h2>
          <p className="font-sans text-base md:text-lg text-charcoal/80 max-w-2xl mx-auto mb-14">
            Claim Proof came out of a real metro-Atlanta rental operation, built
            from the claims we had to win to stay in business.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {[
              ["8 yrs", "operating rental vehicles"],
              ["4,500+", "trips completed"],
              ["200+", "claims handled"],
              ["24", "cars run in metro Atlanta"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-5xl md:text-7xl font-semibold text-deep-teal leading-none">
                  {n}
                </p>
                <p className="font-sans text-sm md:text-base text-charcoal/70 mt-3">
                  {l}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-14 font-sans text-sm md:text-base text-charcoal/75 leading-relaxed max-w-3xl mx-auto">
            Every policy-dependent rule in the product carries a visible
            &ldquo;last reviewed&rdquo; date, currently{" "}
            <strong className="font-semibold text-deep-teal">July 2026</strong>,
            with a source note and a public version history. When the rules
            change, the update log says exactly what changed and when.
          </p>
        </div>
      </section>

      {/* ---------- TESTIMONIALS (scrolling wall, below the fleet section) ---------- */}
      <section
        id="testimonials"
        className="py-16 md:py-24 bg-cream text-near-black border-t border-near-black/10 scroll-mt-28"
      >
        <div className="px-6 md:px-12 lg:px-20 max-w-4xl mx-auto text-center mb-12">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            Hosts and fleet operators, in their words
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight text-deep-teal">
            Real operators. Real claims. Real recoveries.
          </h2>
        </div>
        <Testimonials />
      </section>

      {/* ---------- EXPOSURE CALCULATOR ---------- */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 scroll-mt-28">
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            The repair gap is only half the loss
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-10 max-w-3xl">
            Run your own numbers.
          </h2>
          <ExposureCalculator />
        </div>
      </section>

      {/* ---------- PRICING (use-case ladder) ---------- */}
      <section
        id="pricing"
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 bg-white/[0.015] scroll-mt-28"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
              Pick the version for your situation
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-4">
              One system for the next claim. One license for the whole fleet.
            </h2>
            <p className="font-sans text-base text-white/60">
              One-time purchase, instant portal access. Review the tools for 14
              days, and if they are not more practical and usable than what you
              could assemble yourself, email for a refund.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={
                  "relative flex flex-col rounded-2xl p-6 md:p-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 " +
                  (t.hero
                    ? "border-2 border-warm-gold bg-warm-gold/[0.06]"
                    : "border border-white/12 bg-white/[0.02] hover:border-warm-gold/50")
                }
              >
                {t.hero && (
                  <span className="absolute -top-3 left-6 rounded-full bg-warm-gold px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-near-black">
                    Recommended
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold text-white mb-1 leading-snug">
                  {t.name}
                </h3>
                <p className="font-sans text-sm text-warm-gold mb-5">{t.who}</p>
                <p className="font-display text-5xl font-semibold text-white mb-6">
                  <span className="align-[0.2em] text-2xl text-white/40">$</span>
                  {t.price}
                  <span className="font-sans text-sm font-normal text-white/40">
                    {" "}
                    one-time
                  </span>
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <CheckIcon />
                      <span className="font-sans text-sm text-white/80 leading-relaxed">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <BuyTierButton
                  tier={t.id}
                  label={t.cta}
                  variant={t.hero ? "solid" : "outline-dark"}
                />
                {t.note && (
                  <p className="mt-4 font-sans text-xs text-white/55 text-center leading-relaxed">
                    {t.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.02] p-6 md:p-7 max-w-3xl">
            <h3 className="font-sans font-bold text-white mb-2">
              Choosing under pressure? There is no wrong door.
            </h3>
            <p className="font-sans text-sm text-white/65 leading-relaxed">
              Buy the Emergency Kit today to handle the claim in front of you,
              and if you upgrade within 7 days, your full $47 applies toward the
              Complete system. Complete purchases apply toward the Fleet license
              within 30 days. Start where the fire is; the ladder keeps your
              money.
            </p>
          </div>

          <p className="mt-8 font-sans text-sm text-white/50 max-w-2xl">
            Prefer to start free? Get the{" "}
            <a
              href="#free-guide"
              className="font-semibold text-warm-gold underline underline-offset-4"
            >
              24-Hour Claim Rescue Checklist
            </a>{" "}
            and decide later. One underpaid claim can cost more than the entire
            system.
          </p>
        </div>
      </section>

      {/* ---------- FAQ (objections) ---------- */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 scroll-mt-28">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-10">
            Straight answers before you buy.
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-white/12 bg-white/[0.02] p-5 md:p-6 [&_svg]:open:rotate-45"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-sans font-semibold text-white list-none">
                  {f.q}
                  <svg
                    className="h-5 w-5 flex-none text-warm-gold transition-transform duration-300"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="mt-4 font-sans text-sm text-white/70 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CLOSE ---------- */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 bg-white/[0.015] scroll-mt-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-6">
            File on time. Prove it was not pre-existing. Challenge the valuation
            before the gap becomes yours.
          </h2>
          <p className="font-sans text-base md:text-lg text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            You cannot control who reviews the claim, how fast an adjuster
            responds, or whether every disputed item is accepted. You can control
            the quality of the photos, the completeness of the filing, the
            clarity of the repair comparison, and the consistency of the
            follow-up.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-full bg-warm-gold px-10 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
          >
            Get Complete Claim Defense
          </a>
          <p className="mt-6 font-sans text-sm text-white/50">
            One underpaid claim can cost more than the entire system.
          </p>
        </div>
      </section>

      {/* ---------- FREE 24-HOUR CHECKLIST ---------- */}
      <section
        id="free-guide"
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-white/10 scroll-mt-28"
      >
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.28em] uppercase text-warm-gold mb-4">
            Not ready to buy? Start free.
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-4">
            The free 24-Hour Claim Rescue Checklist.
          </h2>
          <p className="font-sans text-base text-white/65 leading-relaxed mb-8 max-w-xl">
            Found damage? Use this before the vehicle moves, the evidence
            disappears, or the filing window closes. The first 15 minutes, the
            first hour, the before-submission checks, the photo shot list, and
            the five mistakes that sink otherwise valid claims. Two pages,
            mobile-friendly. No catch.
          </p>
          <GuideForm />
          <p className="font-sans text-xs text-white/40 mt-4">
            One email with the checklist, then the occasional operator note.
            Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ---------- FINE PRINT ---------- */}
      <section className="px-6 md:px-12 lg:px-20 pb-14">
        <div className="max-w-6xl mx-auto border-t border-white/10 pt-8">
          <p className="font-sans text-xs text-white/40 leading-relaxed">
            Claim Proof is operational guidance, not legal, insurance, or
            claims-adjusting advice, and is not affiliated with, endorsed by, or
            sponsored by Turo Inc. &ldquo;Turo&rdquo; is a trademark of Turo
            Inc., used only to describe the platform this product addresses. It
            does not guarantee that any claim will be approved, increased, or
            paid. Purchases include permanent access to the purchased version
            and 12 months of template and policy-reference updates. Policy facts
            verified against Turo&rsquo;s published US policies, reviewed July
            2026. A Be Nice Autos product.
          </p>
        </div>
      </section>
    </main>
  );
}
