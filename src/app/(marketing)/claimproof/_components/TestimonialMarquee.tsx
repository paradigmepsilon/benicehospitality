/**
 * TestimonialMarquee — 10 testimonials in a continuous horizontal auto-scroll
 * that pauses on hover. Pure CSS animation (no JS), so it works server-rendered.
 *
 * ⚠️ PLACEHOLDER CONTENT (2026-07-10): all 10 quotes and names below are
 * realistic-but-invented. DO NOT present as real customer reviews until they
 * are collected and permissioned. Search `PLACEHOLDER` to find them. Swap the
 * `quote`, `name`, and `context` fields with real reviews when you have them.
 */

type Testimonial = { quote: string; name: string; context: string; initials: string };

// PLACEHOLDER testimonials — replace with real, permissioned reviews.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "First claim after I bought this, I already had the exact photos Turo asked for. Four minutes at pickup. It paid for itself the same week.",
    name: "Marcus D.",
    context: "3-car host, Atlanta GA",
    initials: "MD",
  },
  {
    quote:
      "I used to dread the dispute messages. Now I copy the script, fill the blanks, and send. The tone alone has won me two claims I would have fumbled.",
    name: "Priya S.",
    context: "Single-car host, Austin TX",
    initials: "PS",
  },
  {
    quote:
      "A guest swore a dent was already there. My date-stamped baseline said otherwise. Turo paid out in a day. I would have eaten that $900 before this.",
    name: "Terrell W.",
    context: "5-car host, Charlotte NC",
    initials: "TW",
  },
  {
    quote:
      "The Clock Map alone is worth it. I did not know the 24-hour window started at trip end. I was reporting late every single time and losing.",
    name: "Jenna M.",
    context: "2-car host, Phoenix AZ",
    initials: "JM",
  },
  {
    quote:
      "Went all the way to arbitration for the first time. Used the written-statement template exactly as laid out. The denial got reversed. $2,400 back.",
    name: "Andre B.",
    context: "7-car host, Houston TX",
    initials: "AB",
  },
  {
    quote:
      "My cleaners run the 12-shot sequence now off the one-page card. I stopped being the bottleneck and my documentation actually got more consistent.",
    name: "Sofia R.",
    context: "11-car fleet, Miami FL",
    initials: "SR",
  },
  {
    quote:
      "I am not a paperwork person. This made me one in about ten minutes. Every trip now has a clean folder before the guest even pulls off.",
    name: "Kevin L.",
    context: "Single-car host, Denver CO",
    initials: "KL",
  },
  {
    quote:
      "The fight-or-fold math saved me from chasing a claim that would have cost more than it was worth. Knowing when to walk is half the game.",
    name: "Danielle P.",
    context: "4-car host, Nashville TN",
    initials: "DP",
  },
  {
    quote:
      "Lowball estimate on a bumper. I sent the estimate-dispute script almost word for word. They came back with the real number. No drama.",
    name: "Omar H.",
    context: "6-car host, Newark NJ",
    initials: "OH",
  },
  {
    quote:
      "Bought the Fleet edition for the training card and the risk ledger. It quietly told me which car was a lemon before it cost me another claim.",
    name: "Rachel T.",
    context: "14-car fleet, Dallas TX",
    initials: "RT",
  },
];

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex w-[300px] flex-none flex-col justify-between rounded-2xl bg-cream p-6 shadow-sm sm:w-[360px]">
      <blockquote className="font-sans text-sm leading-relaxed text-charcoal">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-deep-teal font-sans text-xs font-bold text-white"
        >
          {t.initials}
        </span>
        <span className="font-sans text-sm leading-tight">
          <span className="block font-bold text-near-black">{t.name}</span>
          <span className="block text-warm-gray">{t.context}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function TestimonialMarquee() {
  // Render the list twice back-to-back so the -50% translate loops seamlessly.
  const track = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <div
      className="group relative w-full overflow-hidden"
      // Fade the left/right edges so cards scroll in and out softly.
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className="flex w-max gap-6 animate-cp-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {track.map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </div>
    </div>
  );
}
