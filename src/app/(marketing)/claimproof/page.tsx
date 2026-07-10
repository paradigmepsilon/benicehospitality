import type { Metadata } from "next";
import Image from "next/image";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import BuyTierButton from "./_components/BuyTierButton";
import GuideForm from "./_components/GuideForm";

/**
 * Claim Proof sales page. Anonymous-checkout digital product (Be Nice Autos
 * product on BNHG rails), pattern cloned from /thehostsedge. Three tiers;
 * the $97 Pro is the hero. Copy voice: one working host talking to another.
 * No em dashes anywhere on this page by design.
 */

export const metadata: Metadata = {
  title: "Claim Proof: The Turo Host's Damage-Claim Defense System",
  description:
    "Stop losing Turo damage claims. The exact documentation routine, dispute scripts, and arbitration playbook a working fleet uses every day. Verified against Turo's July 2026 policy.",
};

const TIER_FEATURES: Record<
  "core" | "pro" | "fleet",
  { name: string; price: string; tagline: string; features: string[]; note?: string }
> = {
  core: {
    name: "Core Kit",
    price: "$47",
    tagline: "The routine that protects you before a claim ever starts",
    features: [
      "The 32-page field manual: how Turo claims actually get decided",
      "The Clock Map: every deadline that can quietly kill your claim, on one page",
      "The pre-trip and post-trip photo routine (the 12-shot ritual)",
      "The printable per-trip checklist you keep where you stage your cars",
      "Photo standards that win, and the mistakes that lose",
      "3 ready-to-send dispute messages",
    ],
  },
  pro: {
    name: "Pro Kit",
    price: "$97",
    tagline: "The tier you want open the day a claim goes sideways",
    features: [
      "Everything in Core, plus:",
      "The full library of 10 dispute messages: the “it was already like that” guest, lowball estimates, mechanical claims, theft, escalation",
      "The appeal workflow matched to every reason Turo gives for a denial",
      "Arbitration in plain English, including the documents-only “desk” process and your written statement, already structured for you",
      "The 30-day arbitration opt-out almost no host knows exists",
      "The per-trip evidence tracker",
      "Fight-or-fold money math, so you know when to push and when to walk",
    ],
    note: "Most hosts pick this one. It is the part nobody warns you about.",
  },
  fleet: {
    name: "Fleet Kit",
    price: "$197",
    tagline: "For when you are running more than one car",
    features: [
      "Everything in Pro, plus:",
      "The Fleet Operations supplement: batch documentation and monthly baseline libraries",
      "A one-page training card for your cleaners, co-hosts, and VAs",
      "The fleet risk ledger: when a car has become a lemon, and which guests to screen out",
      "The recorded walkthrough video, showing the whole system on real cars",
      "Lifetime policy updates: when Turo changes the rules, the new edition lands in your inbox free",
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
            For Turo hosts, from a working fleet
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-[1.05] mb-8">
            The scratch shows up two days later. That is where you lose.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mb-6">
            You know the feeling. The car comes back fine, you move on, and then
            a guest files something, or you spot a dent nobody mentioned. Here is
            the part that stings: Turo never sees the car. They decide from your
            photos and your timing, and if either one is weak, the money comes
            out of your pocket. Claim Proof is the exact routine a real fleet
            runs on every trip so your paperwork already wins before a claim ever
            starts.
          </p>
          <p className="font-sans text-sm text-white/60 mb-10">
            Every deadline and rule inside is checked against Turo&rsquo;s
            published US policy as of July 2026, and date-stamped so you always
            know what was verified and when.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full bg-warm-gold px-8 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light hover:shadow-lg active:scale-[0.98]"
            >
              Get Claim Proof, from $47
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
            Why good hosts still lose
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-deep-teal leading-tight mb-14 max-w-3xl">
            The claim you lose was already lost before you filed it.
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
                after the trip ends and Turo can decline to process the claim at
                all. Most hosts find this rule out the hard way, by losing to it.
              </p>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-2xl">
              <p className="font-display text-5xl font-semibold text-warm-gold mb-4">
                100%
              </p>
              <h3 className="font-sans font-bold text-near-black mb-3">
                Decided on your photos alone
              </h3>
              <p className="font-sans text-sm text-charcoal leading-relaxed">
                Turo prices damage off images. Clear ones get resolved in under a
                day. Blurry or unclear ones trigger new-photo requests, field
                inspections that drag on for a week, and sometimes fees for the
                shots you never took.
              </p>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-2xl">
              <p className="font-display text-5xl font-semibold text-warm-gold mb-4">
                10 pg
              </p>
              <h3 className="font-sans font-bold text-near-black mb-3">
                A dispute is a paper fight
              </h3>
              <p className="font-sans text-sm text-charcoal leading-relaxed">
                Under Turo&rsquo;s current terms, most disputes come down to
                documents-only arbitration. One arbitrator, a ten-page written
                statement from each side, no hearing. Whoever brought the better
                paper wins.
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
              What you actually get
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-6">
              A field manual you use, not a course you forget.
            </h2>
            <p className="font-sans text-base text-charcoal leading-relaxed mb-6">
              This is not theory and it is not a webinar. It is a print-ready
              system: the 12-shot routine you run at pickup and return, the
              one-page checklist that lives where you stage your cars, ten
              fill-in dispute scripts for the messages you dread writing, the
              appeal workflow, and the arbitration playbook. Every deadline is
              checked against Turo&rsquo;s published policy and marked with the
              date it was verified.
            </p>
            <blockquote className="border-l-2 border-warm-gold pl-6 font-display text-lg text-deep-teal italic leading-relaxed mb-6">
              The whole thing is a documentation contest, and most hosts show up
              empty-handed. Four minutes a trip is what moves you to the other
              side of that number.
            </blockquote>
            <p className="font-sans text-sm text-warm-gray leading-relaxed">
              Written by someone who runs a rental fleet in metro Atlanta. Every
              routine in here is used on real cars, with real guests, on real
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
            Built on Turo&rsquo;s actual rules, not host-forum folklore
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              ["24-hr report window", "from trip end, verified"],
              ["Photo metadata rules", "date, time, geolocation"],
              ["20-day escalation window", "your direct-resolution safety net"],
              ["Desk arbitration under $200k", "documents only, 10-page cap"],
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
            Platforms move the goalposts, so nothing in here pretends to be
            timeless. Every policy fact carries a{" "}
            <span className="text-gold-light font-semibold">Verified 07&middot;2026</span>{" "}
            mark so you always know what was checked, and when. Fleet owners get
            the revised edition free whenever the rules materially change.
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
              Less than the deductible on one bad weekend.
            </h2>
            <p className="font-sans text-base text-charcoal max-w-2xl mx-auto">
              One-time purchase, delivered to your inbox in seconds. Run the
              checklist on your very next trip. If your evidence is not the
              cleanest it has ever been, email me for a full refund and keep the
              kit anyway.
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
              My guarantee, plainly
            </p>
            <p className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-snug mb-4">
              Use the checklist on your next trip. If your evidence is not the
              cleanest it has ever been, email me for a full refund, and keep the
              kit.
            </p>
            <p className="font-sans text-sm text-warm-gray">
              No forms, nothing to ship back on a PDF, no hard feelings.
            </p>
          </div>

          <h2 className="font-display text-3xl font-semibold text-deep-teal mb-8">
            The questions every host asks first
          </h2>
          <div className="space-y-8">
            {[
              [
                "Is not Turo's own app documentation enough?",
                "The app is just where your photos go. This is what makes those photos actually win. Turo's own process punishes blurry, late, metadata-stripped, or badly framed shots with denials, delays, and even fees. People lose claims using the free tool every single day. Claim Proof is the discipline you layer on top of it.",
              ],
              [
                "Is this legal advice?",
                "No, and I am careful about that. It is operational guidance from a working fleet operator: the systems, the scripts, and the verified process facts. For a big-dollar dispute or anything truly legal, the manual tells you the same thing over and over, talk to a lawyer, and hand them the clean evidence file you now have.",
              ],
              [
                "I only have one car. Which tier is right for me?",
                "Core if you just want the documentation routine and nothing more. Pro if you want the whole defense, because the scripts, the appeal workflow, and the arbitration playbook are the pages you will be grateful for the day something goes wrong. Honestly, most single-car hosts go with Pro.",
              ],
              [
                "What happens when Turo changes its policy?",
                "Every policy fact is date-stamped, verified July 2026, so nothing in here pretends to last forever. Fleet owners get the revised edition free when the rules materially change, and every tier includes the re-verification checklist in the appendix so you can check for yourself.",
              ],
              [
                "How do I get it?",
                "Instantly by email right after checkout, as print-ready PDFs. No account to create, no login, no course platform to log into. Buy it, check your inbox, print the checklist.",
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
            Not ready yet? Start free.
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight mb-4 max-w-xl">
            The 24-Hour Rule, the one deadline that decides most claims.
          </h2>
          <p className="font-sans text-base text-white/75 leading-relaxed max-w-xl mb-8">
            A free two-page guide: how the clock really works, exactly what to do
            in the first 24 hours, and the 10-shot mini baseline. If you host on
            Turo, this one page will save you a claim someday. No catch.
          </p>
          <GuideForm />
          <p className="font-sans text-xs text-white/40 mt-4">
            One email with the guide, then the occasional operator note. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ---------- FINE PRINT ---------- */}
      <section className="bg-near-black px-6 md:px-12 lg:px-20 pb-12">
        <div className="max-w-4xl mx-auto border-t border-white/10 pt-8">
          <p className="font-sans text-xs text-white/40 leading-relaxed">
            Claim Proof is operational guidance, not legal advice, and is not
            affiliated with, endorsed by, or sponsored by Turo Inc.
            &ldquo;Turo&rdquo; is a trademark of Turo Inc., used only to describe
            the platform this product addresses. Policy facts verified against
            Turo&rsquo;s published US policies, July 2026. A Be Nice Autos
            product.
          </p>
        </div>
      </section>
    </>
  );
}
