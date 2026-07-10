import type { Metadata } from "next";
import Image from "next/image";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import BuyTierButton from "./_components/BuyTierButton";
import GuideForm from "./_components/GuideForm";

/**
 * Claim Proof — sales page. Anonymous-checkout digital product (Be Nice Autos
 * product on BNHG rails), pattern cloned from /thehostsedge. Three tiers;
 * the $97 Pro is the hero. Copy strategy: loss-anchoring (a denied claim
 * costs $1k–$5k; the kit costs $47–$197) + operator credibility.
 */

export const metadata: Metadata = {
  title: "Claim Proof — The Turo Host's Damage-Claim Defense System",
  description:
    "Stop losing damage claims. The documentation system, dispute scripts, and arbitration playbook for Turo hosts — built and used daily by a working fleet. Verified against Turo's July 2026 policy.",
};

const TIER_FEATURES: Record<
  "core" | "pro" | "fleet",
  { name: string; price: string; tagline: string; features: string[]; note?: string }
> = {
  core: {
    name: "Core Kit",
    price: "$47",
    tagline: "The documentation system",
    features: [
      "The 32-page field manual foundation: how Turo claims really work",
      "The Clock Map — every deadline that can kill a claim, one page",
      "Pre-trip & post-trip documentation SOPs (the 12-shot ritual)",
      "The printable per-trip checklist",
      "Damage photo standards — what wins, what loses",
      "3 core dispute message scripts",
    ],
  },
  pro: {
    name: "Pro Kit",
    price: "$97",
    tagline: "The full defense system",
    features: [
      "Everything in Core, plus:",
      "The complete 10-script dispute library — guest denials, lowball appraisals, mechanical claims, theft, escalation",
      "The denied-claim appeal workflow, matched to every denial reason",
      "Arbitration, demystified — including the documents-only “desk arbitration” and your 10-page statement, pre-structured",
      "The 30-day arbitration opt-out almost no host knows exists",
      "The per-trip evidence tracker template",
      "Fight-or-fold money math with worked examples",
    ],
    note: "Most popular — the tier built for the day a claim goes sideways.",
  },
  fleet: {
    name: "Fleet Kit",
    price: "$197",
    tagline: "For operators running multiple cars",
    features: [
      "Everything in Pro, plus:",
      "The Fleet Operations supplement — batch documentation, monthly baseline libraries",
      "The one-page team training card for cleaners, co-hosts & VAs",
      "The fleet risk ledger — retire-the-lemon math, guest screening signals",
      "Recorded fleet walkthrough video",
      "Lifetime policy updates — when Turo changes the rules, the new edition lands in your inbox free",
    ],
  },
};

function CheckIcon() {
  return (
    <svg
      className="mt-1 h-4 w-4 flex-none text-warm-gold"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" />
    </svg>
  );
}

export default function ClaimProofPage() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative bg-near-black px-6 md:px-12 lg:px-20 pt-36 md:pt-44 pb-24 md:pb-32 overflow-hidden">
        <Image
          src="/images/claimproof/hero.png"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-near-black/40 via-near-black/60 to-near-black" />
        <div className="relative max-w-4xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            For Turo hosts · From a working fleet
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-[1.05] mb-8">
            One denied claim costs more than every tool you own.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mb-6">
            Turo decides damage claims from your photos and your paperwork —
            they never see the car. Claim Proof is the documentation system,
            dispute scripts, and arbitration playbook that make your paper
            unbeatable. Built and used daily by a real fleet.
          </p>
          <p className="font-sans text-sm text-white/60 mb-10">
            Every deadline and rule inside is verified against Turo&rsquo;s
            published US policy — July 2026 — and date-stamped.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full bg-warm-gold px-8 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light hover:shadow-lg active:scale-[0.98]"
            >
              Get Claim Proof — from $47
            </a>
            <a
              href="#free-guide"
              className="font-sans text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-warm-gold transition-colors"
            >
              Or start with the free 24-Hour Rule guide
            </a>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* ---------- THE TRAP ---------- */}
      <section className="bg-cream px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
            Why hosts lose
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-deep-teal leading-tight mb-14 max-w-3xl">
            The claim you lose was lost before you filed it.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-sm rounded-2xl">
              <p className="font-display text-5xl font-semibold text-warm-gold mb-4">
                24h
              </p>
              <h3 className="font-sans font-bold text-near-black mb-3">
                The clock starts at trip end
              </h3>
              <p className="font-sans text-sm text-charcoal leading-relaxed">
                Not when you find the scratch. Report damage more than 24 hours
                after the trip ends and Turo can decline to process the claim
                at all. Most hosts learn this rule by losing to it.
              </p>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-2xl">
              <p className="font-display text-5xl font-semibold text-warm-gold mb-4">
                100%
              </p>
              <h3 className="font-sans font-bold text-near-black mb-3">
                Decided on photos alone
              </h3>
              <p className="font-sans text-sm text-charcoal leading-relaxed">
                Turo appraises damage from images — good ones price in under a
                day; unclear ones trigger new-photo requests, 5–7-day field
                inspections, and even violation fees for missing photos.
              </p>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-2xl">
              <p className="font-display text-5xl font-semibold text-warm-gold mb-4">
                10 pg
              </p>
              <h3 className="font-sans font-bold text-near-black mb-3">
                Disputes are a paper fight
              </h3>
              <p className="font-sans text-sm text-charcoal leading-relaxed">
                Under Turo&rsquo;s current terms, most disputes resolve by
                documents-only arbitration: one arbitrator, a ten-page written
                statement from each side, no hearing. The better paper wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* ---------- WHAT IT IS ---------- */}
      <section className="bg-white px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
              What you get
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-6">
              A field manual, not a lecture.
            </h2>
            <p className="font-sans text-base text-charcoal leading-relaxed mb-6">
              Claim Proof is a designed, print-ready system: the 12-shot
              documentation ritual, the per-trip checklist that lives where you
              stage your cars, ten fill-in dispute scripts, the appeal
              workflow, and the arbitration playbook — every deadline verified
              against Turo&rsquo;s published policy and marked with its
              verification date.
            </p>
            <blockquote className="border-l-2 border-warm-gold pl-6 font-display text-lg text-deep-teal italic leading-relaxed mb-6">
              The process is a documentation contest, and most hosts show up
              unarmed. Four minutes per trip changes which side of that
              statistic you&rsquo;re on.
            </blockquote>
            <p className="font-sans text-sm text-warm-gray leading-relaxed">
              Written by the operator of a metro-Atlanta rental fleet — the
              systems in this manual run on real cars, real guests, and real
              claims. Not affiliated with Turo Inc.
            </p>
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/claimproof/wheel.png"
              alt="Editorial detail photograph of a black car wheel"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-near-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-display text-2xl font-semibold text-white">
                Shoot first.
              </p>
              <p className="font-sans text-sm text-white/70">
                The two-word version of the entire system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.white} toColor={C.deepTeal} />

      {/* ---------- VERIFIED BAND ---------- */}
      <section className="bg-deep-teal px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-gold-light mb-6">
            Built on Turo&rsquo;s actual rules — not host-forum folklore
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              ["24-hr report window", "from trip end — verified"],
              ["Photo metadata rules", "date · time · geolocation"],
              ["20-day escalation window", "your direct-resolution safety net"],
              ["Desk arbitration ≤ $200k", "documents only, 10-page cap"],
            ].map(([head, sub]) => (
              <div key={head} className="border-l-2 border-warm-gold pl-4">
                <p className="font-sans text-sm font-bold text-white mb-1">
                  {head}
                </p>
                <p className="font-sans text-xs text-white/65">{sub}</p>
              </div>
            ))}
          </div>
          <p className="font-sans text-sm text-white/70 mt-10 leading-relaxed">
            Platforms move the goalposts. Every policy fact in Claim Proof
            carries a <span className="text-gold-light font-semibold">Verified 07·2026</span> mark
            so you always know what was checked, and when. Fleet-tier owners
            get revised editions when the rules materially change.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.deepTeal} toColor={C.cream} />

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="bg-cream px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
              Pricing
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-deep-teal leading-tight mb-4">
              Cheaper than the deductible on one bad weekend.
            </h2>
            <p className="font-sans text-base text-charcoal max-w-2xl mx-auto">
              One-time purchase. Instant email delivery.
              Run the checklist on your next trip — if it doesn&rsquo;t give you
              cleaner evidence than you&rsquo;ve ever had, full refund and keep
              the kit.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {(Object.keys(TIER_FEATURES) as Array<"core" | "pro" | "fleet">).map(
              (tier) => {
                const t = TIER_FEATURES[tier];
                const isHero = tier === "pro";
                return (
                  <div
                    key={tier}
                    className={
                      isHero
                        ? "relative bg-near-black text-white p-8 rounded-2xl shadow-xl md:-mt-4 md:mb-[-1rem] ring-2 ring-warm-gold"
                        : "bg-white p-8 rounded-2xl shadow-sm"
                    }
                  >
                    {isHero && (
                      <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-warm-gold px-4 py-1 font-sans text-xs font-bold uppercase tracking-[0.15em] text-near-black">
                        Most popular
                      </p>
                    )}
                    <h3
                      className={`font-display text-2xl font-semibold mb-1 ${isHero ? "text-white" : "text-deep-teal"}`}
                    >
                      {t.name}
                    </h3>
                    <p
                      className={`font-sans text-sm mb-5 ${isHero ? "text-white/70" : "text-warm-gray"}`}
                    >
                      {t.tagline}
                    </p>
                    <p
                      className={`font-display text-5xl font-semibold mb-6 ${isHero ? "text-warm-gold" : "text-near-black"}`}
                    >
                      {t.price}
                      <span
                        className={`font-sans text-sm font-normal ${isHero ? "text-white/60" : "text-warm-gray"}`}
                      >
                        {" "}
                        one-time
                      </span>
                    </p>
                    <ul className="space-y-3 mb-8">
                      {t.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <CheckIcon />
                          <span
                            className={`font-sans text-sm leading-relaxed ${isHero ? "text-white/85" : "text-charcoal"}`}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <BuyTierButton
                      tier={tier}
                      label={`Get the ${t.name}`}
                      variant={isHero ? "solid" : "outline"}
                    />
                    {t.note && (
                      <p className="mt-4 font-sans text-xs text-white/60 text-center">
                        {t.note}
                      </p>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* ---------- GUARANTEE + FAQ ---------- */}
      <section className="bg-white px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <div className="bg-cream rounded-2xl p-8 md:p-10 mb-16 text-center">
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
              The guarantee, plainly
            </p>
            <p className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-snug mb-4">
              Use the checklist on your next trip. If your evidence isn&rsquo;t
              the cleanest it&rsquo;s ever been, email for a full refund —
              and keep the kit.
            </p>
            <p className="font-sans text-sm text-warm-gray">
              No forms, no return shipping on a PDF, no hard feelings.
            </p>
          </div>

          <h2 className="font-display text-3xl font-semibold text-deep-teal mb-8">
            Fair questions
          </h2>
          <div className="space-y-8">
            {[
              [
                "Isn't Turo's app documentation enough?",
                "The app is where photos go — this system is what makes them win. Turo's own process penalizes blurry, late, metadata-stripped, or badly framed photos with denials, delays, and even violation fees. Hosts lose claims using the free tool every day; Claim Proof is the rigor layered on top of it.",
              ],
              [
                "Is this legal advice?",
                "No. It's operational guidance from a working fleet operator — systems, scripts, and verified process facts. For big-dollar disputes or anything genuinely legal, the manual repeatedly tells you the same thing: talk to a lawyer, and bring them your (now excellent) evidence file.",
              ],
              [
                "I have one car. Which tier?",
                "Core if you want the documentation ritual and nothing else. Pro if you want the full defense — the scripts, appeal workflow, and arbitration playbook are the pages you'll want open the day something goes wrong. Most single-car hosts choose Pro.",
              ],
              [
                "What if Turo changes its policy?",
                "Every policy fact in the manual is date-stamped (verified July 2026) so nothing pretends to be evergreen. Fleet-tier owners receive revised editions free when the rules materially change; every tier gets the re-verification checklist built into the appendix.",
              ],
              [
                "How does delivery work?",
                "Instantly by email after Stripe checkout — print-ready PDFs. No account, no login, no course platform.",
              ],
            ].map(([q, a]) => (
              <div key={q}>
                <h3 className="font-sans font-bold text-near-black mb-2">{q}</h3>
                <p className="font-sans text-sm text-charcoal leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.white} toColor={C.nearBlack} />

      {/* ---------- FREE GUIDE ---------- */}
      <section
        id="free-guide"
        className="relative bg-near-black px-6 md:px-12 lg:px-20 py-20 md:py-28 overflow-hidden"
      >
        <Image
          src="/images/claimproof/fleet.png"
          alt=""
          fill
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-near-black via-near-black/80 to-near-black/40" />
        <div className="relative max-w-4xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
            Not ready? Start free
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight mb-4 max-w-xl">
            The 24-Hour Rule — the one deadline that decides most claims.
          </h2>
          <p className="font-sans text-base text-white/75 leading-relaxed max-w-xl mb-8">
            A free two-page field guide: the clock, the first-24-hours play, and
            the 10-shot mini baseline. If you host on Turo, this page will save
            you a claim someday.
          </p>
          <GuideForm />
          <p className="font-sans text-xs text-white/40 mt-4">
            One email with the guide, occasional operator notes after. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ---------- FINE PRINT ---------- */}
      <section className="bg-near-black px-6 md:px-12 lg:px-20 pb-12">
        <div className="max-w-4xl mx-auto border-t border-white/10 pt-8">
          <p className="font-sans text-xs text-white/40 leading-relaxed">
            Claim Proof is operational guidance, not legal advice, and is not
            affiliated with, endorsed by, or sponsored by Turo Inc.
            &ldquo;Turo&rdquo; is a trademark of Turo Inc., used only to
            describe the platform this product addresses. Policy facts verified
            against Turo&rsquo;s published US policies, July 2026. A Be Nice
            Autos product.
          </p>
        </div>
      </section>
    </>
  );
}
