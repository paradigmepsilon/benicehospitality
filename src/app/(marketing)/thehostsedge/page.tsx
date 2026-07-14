import type { Metadata } from "next";
import Image from "next/image";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { HOSTS_EDGE } from "@/lib/hosts-edge";
import BuyButton from "./_components/BuyButton";

/**
 * The Host's Edge — Guest Message System sales page.
 *
 * Copy is the finalized humanized version from
 * the-hosts-edge/products/guest-message-system/SALES-PAGE-COPY.md (real VOC
 * quotes, approved $27/$37 pricing, 14-day guarantee, FAQ). The testimonial
 * placeholder from that doc is intentionally OMITTED — no fabricated quotes.
 *
 * Faceless "we operators" voice. Rendered inside the (marketing) shell, so the
 * BNHG Header + Footer wrap it automatically. Design matches the site brand:
 * Playfair display headings, warm-gold eyebrows, deep-teal / cream / near-black.
 */

const PRICE = `$${HOSTS_EDGE.priceUsd}`;
const CTA_LABEL = `Get the system for ${PRICE}`;

export const metadata: Metadata = {
  title: "The Host's Edge: Guest Message System",
  description:
    "A lean, tool-agnostic guest-message system for self-managing Airbnb & STR hosts. Six messages that kill repeat questions, protect your review, and sound like you. Not a spammy auto-drip.",
  alternates: { canonical: "https://benicehospitality.com/thehostsedge" },
  openGraph: {
    title: "The Host's Edge: Guest Message System",
    description:
      "Six sharp guest messages that actually get read. Kill the repeat questions, protect your rating, keep your evenings. Drops into Hospitable, Guesty, Hostaway, or native Airbnb.",
    url: "https://benicehospitality.com/thehostsedge",
    type: "website",
  },
};

export default function HostsEdgePage() {
  return (
    <>
      {/* ---- Hero ------------------------------------------------------- */}
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-28 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src="/images/thehostsedge/hero-livingroom.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-near-black via-near-black/85 to-near-black/50"
        />
        <div className="relative z-10 max-w-4xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-8">
            For self-managing Airbnb &amp; STR hosts
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] tracking-tight mb-8">
            You didn&rsquo;t start hosting to answer &ldquo;what&rsquo;s the
            wifi?&rdquo; for the fourth time today.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mb-10">
            The lean guest-message pack that gets read the first time. Six
            messages that kill the repeat questions, protect your review, and
            sound like you. Drops into Hospitable, Guesty, Hostaway, or native
            Airbnb in an afternoon.
          </p>
          <BuyButton label={CTA_LABEL} />
          <p className="mt-5 font-sans text-sm text-white/55">
            One-time. Instant delivery by email. 14-day money-back guarantee.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* ---- The problem ----------------------------------------------- */}
      <section className="bg-cream px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            The problem
          </p>
          <p className="font-sans text-lg md:text-xl text-charcoal leading-relaxed mb-6">
            Guest messaging eats two to four hours a day. For a couple of
            properties, that&rsquo;s ten hours a week you&rsquo;re spending as an
            unpaid front desk, answering the same handful of questions you
            already answered in the listing, in the confirmation, and yesterday.
          </p>
          <p className="font-sans text-base text-warm-gray leading-relaxed mb-8">
            Every host hits the same wall:
          </p>

          <div className="space-y-6 mb-10">
            <blockquote className="border-l-2 border-warm-gold pl-6 font-display text-xl md:text-2xl text-deep-teal italic leading-snug">
              &ldquo;I feel like I have to sit down and teach grown adults to
              read on a daily basis.&rdquo;
            </blockquote>
            <blockquote className="border-l-2 border-warm-gold pl-6 font-display text-xl md:text-2xl text-deep-teal italic leading-snug">
              &ldquo;Every person has one boss. For us, every guest is our
              boss.&rdquo;
            </blockquote>
          </div>

          <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
            So you go looking for a fix, and the internet hands you a 12-message
            auto-drip. Set it and forget it. Except the hosts who&rsquo;ve
            actually run those know how it ends:
          </p>
          <blockquote className="border-l-2 border-warm-gold pl-6 font-display text-xl md:text-2xl text-deep-teal italic leading-snug mb-10">
            &ldquo;Way, way, way too many messages. I really despise
            auto-messaging.&rdquo;
          </blockquote>

          <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
            Here&rsquo;s the thing nobody selling those packs will tell you:{" "}
            <strong className="text-deep-teal">
              more messages is the problem, not the solution.
            </strong>{" "}
            Send a guest a dozen and they learn to ignore you. So the one message
            that actually matters, the one with the door code, gets skimmed past
            like the rest. That&rsquo;s how you end up with an &ldquo;I
            can&rsquo;t get in!&rdquo; call at 11pm from a guest you messaged five
            times.
          </p>
          <p className="font-display text-2xl md:text-3xl text-deep-teal leading-snug">
            Two-thirds of guests get two or fewer messages the entire stay. The
            best hosts aren&rsquo;t sending more. They&rsquo;re sending better.
          </p>
        </div>
      </section>

      {/* ---- Proof stats ----------------------------------------------- */}
      <section className="bg-deep-teal px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center">
          <div>
            <p className="font-display text-5xl md:text-6xl font-semibold text-warm-gold mb-3">
              69%
            </p>
            <p className="font-sans text-base text-white/85 leading-relaxed">
              of guests say communication drove their review.
            </p>
          </div>
          <div>
            <p className="font-display text-5xl md:text-6xl font-semibold text-warm-gold mb-3">
              &#8532;
            </p>
            <p className="font-sans text-base text-white/85 leading-relaxed">
              of guests get two or fewer messages from their host all stay.
            </p>
          </div>
          <div>
            <p className="font-display text-5xl md:text-6xl font-semibold text-warm-gold mb-3">
              2 to 4 hrs
            </p>
            <p className="font-sans text-base text-white/85 leading-relaxed">
              a day lost to messaging, even for just a few properties.
            </p>
          </div>
        </div>
      </section>

      {/* ---- What this is ---------------------------------------------- */}
      <section className="bg-white px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            What this is
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-8">
            Not a drip. Not a bot. Six messages, in order, each one doing a real
            job.
          </h2>
          <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
            Convert the inquiry, set expectations, get them in the door without
            confusion, keep the stay smooth, get them out cleanly, earn the
            review.
          </p>
          <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
            One of the six is optional, and we tell you exactly when to skip it.
            The rest are the floor of good hosting. The minimum set that answers
            the question before it&rsquo;s asked, so your phone stops buzzing and
            your reviews stop paying for messages you never sent well.
          </p>
          <p className="font-sans text-lg text-charcoal leading-relaxed">
            You fill in the brackets once. You paste them into whatever tool you
            already use. That&rsquo;s the system.
          </p>
        </div>
      </section>

      {/* ---- What's inside (over door-lock image) ---------------------- */}
      <section className="relative bg-near-black px-6 md:px-12 lg:px-20 py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/thehostsedge/doorlock.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-near-black/90 via-near-black/85 to-near-black/95"
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            What&rsquo;s inside
          </p>
          <ul className="space-y-8">
            {WHATS_INSIDE.map((item) => (
              <li key={item.title}>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="font-sans text-base md:text-lg text-white/80 leading-relaxed">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Who it's for / not for ------------------------------------ */}
      <section className="bg-cream px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-deep-teal mb-6">
              Who it&rsquo;s for
            </p>
            <ul className="space-y-4">
              {WHO_FOR.map((t) => (
                <li
                  key={t}
                  className="font-sans text-base text-charcoal leading-relaxed pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-2 before:h-2 before:rounded-full before:bg-warm-gold"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gray mb-6">
              Who it&rsquo;s not for
            </p>
            <ul className="space-y-4">
              {WHO_NOT_FOR.map((t) => (
                <li
                  key={t}
                  className="font-sans text-base text-warm-gray leading-relaxed pl-5 relative before:content-['\00d7'] before:absolute before:left-0 before:top-0 before:text-warm-gray"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Price + guarantee (over dusk image) ----------------------- */}
      <section className="relative bg-near-black px-6 md:px-12 lg:px-20 py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/thehostsedge/dusk-closer.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/80 to-near-black/60"
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            Price &amp; guarantee
          </p>
          <p className="font-display text-6xl md:text-7xl font-semibold text-white mb-2">
            {PRICE}
          </p>
          <p className="font-sans text-base text-white/60 mb-8">
            at launch. Regular $37.
          </p>
          <p className="font-sans text-lg text-white/85 leading-relaxed mb-8">
            One-time. Yours forever, including updates as Airbnb keeps changing
            the rules.
          </p>
          <p className="font-sans text-base text-white/75 leading-relaxed mb-10">
            <strong className="text-white">The guarantee:</strong> use it on your
            next few guests. If the messages don&rsquo;t get read cleaner and cut
            down the back-and-forth, email us inside 14 days and we&rsquo;ll
            refund you in full. Keep the pack either way. The risk is ours.
            That&rsquo;s how confident we are that lean beats loud.
          </p>
          <BuyButton label={CTA_LABEL} className="flex justify-center" />
        </div>
      </section>

      {/* ---- FAQ -------------------------------------------------------- */}
      <section className="bg-white px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-8">
            Questions hosts ask
          </p>
          <div className="space-y-10">
            {FAQ.map((qa) => (
              <div key={qa.q}>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-3 leading-snug">
                  {qa.q}
                </h3>
                <p className="font-sans text-base md:text-lg text-charcoal leading-relaxed">
                  {qa.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.white} toColor={C.deepTeal} />

      {/* ---- Final CTA -------------------------------------------------- */}
      <section className="bg-deep-teal px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-6">
            Stop repeating yourself. Start hosting.
          </h2>
          <p className="font-sans text-lg text-white/85 leading-relaxed mb-10">
            Six messages. One afternoon to set up. Your guests get what they need
            the first time, and you get your evenings back.
          </p>
          <BuyButton
            label={`Get the Guest Message System for ${PRICE}`}
            className="flex justify-center"
          />
          <p className="mt-6 font-sans text-sm text-white/55">
            One-time. Both formats. 14-day guarantee. Works with the tool you
            already use.
          </p>
        </div>
      </section>
    </>
  );
}

// --- Copy (finalized, from SALES-PAGE-COPY.md) -------------------------------

const WHATS_INSIDE: { title: string; body: string }[] = [
  {
    title: "The 6 core messages, written out and ready.",
    body: "Inquiry response through review request, with the fluff cut. Each one comes with a plain-English note on why it's built the way it is and when to send it.",
  },
  {
    title: "The check-in message guests actually read.",
    body: "The five things they need (address, code, wifi, parking, checkout) front-loaded, one fact per line, skimmable on a phone. This single message is the one that ends the late-night “how do I get in?” texts.",
  },
  {
    title: "A checkout message that won't cost you the 5-star.",
    body: "No guilt-trip chore list, no “but you paid a cleaning fee” lecture. The light-touch version guests respect, so checkout day stops quietly tanking your rating.",
  },
  {
    title: "An AI Prompt Pack.",
    body: "Five copy-paste prompts for ChatGPT or Claude that rewrite every template in your property's voice, tailor them to your exact door lock, and turn your repeat questions into saved replies. About ten minutes per listing.",
  },
  {
    title: "Both formats in one download.",
    body: "A clean PDF to read through, plus a plain-text or Notion copy-paste version so you're not fighting formatting to drop a template into Hospitable, Guesty, Hostaway, or Airbnb.",
  },
];

const WHO_FOR: string[] = [
  "Self-managing hosts with 1 to 10 units who are doing the messaging themselves.",
  "Hosts who are remote from their property and need the messages to carry the load when they can't.",
  "Anyone tired of being on call for questions the listing already answered.",
];

const WHO_NOT_FOR: string[] = [
  "Big property-management companies with a support team. You've already got software and staff for this.",
  "Anyone who wants a 12-message robot sequence that runs on autopilot. That's the opposite of what this is, on purpose.",
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is this just more spam? I don't want to blast my guests.",
    a: "It's the opposite, and that's the whole design. Experienced hosts hate auto-drip for good reason. It trains guests to tune you out. This is six messages, one of them optional, each one earning its place. We spend more of the pack telling you what not to send than what to send. If anything, most hosts end up messaging less after this, not more.",
  },
  {
    q: "Will it work with my tool?",
    a: "Yes. The templates are tool-agnostic plain text. They drop into Hospitable, Guesty, Hostaway, or straight into the native Airbnb message field. We include a copy-paste version specifically so you're not wrestling a PDF to move a message over. If your tool supports merge tags like the guest's first name, you plug those in once.",
  },
  {
    q: "I already have saved replies. Why buy this?",
    a: "Saved replies solve half the problem, the repeat questions. What they don't give you is the sequence: the confirmation that stops early “how do I get in?” messages, the check-in layout guests actually read, the checkout that protects your review, the review request that converts. This is the whole flow, tested and ordered, plus prompts to turn your best saved replies into the rest. If your saved replies were enough, your phone would already be quiet.",
  },
  {
    q: "Is this AI-generated slop like everything else out there?",
    a: "No. It's written by operators who run 40+ units. People who've cleaned the toilets, eaten the bad reviews, and learned the checkout-message mistake the hard way. Every message is built around what actually happens with real guests, and it's current to 2026's Airbnb, not recycled advice from three years ago. The AI Prompt Pack is a tool you use to adapt the templates fast. The templates themselves come from doing the work.",
  },
  {
    q: "What do I actually get, and how?",
    a: "A PDF and a copy-paste companion (plain text / Notion), delivered by email right after purchase. Read the PDF once, paste the templates into your tool, adapt with the prompts if you want. You'll be running the system the same day.",
  },
  {
    q: "Refunds?",
    a: "14 days, full refund, keep the pack. If it doesn't make your messaging cleaner, we don't want your money.",
  },
];
