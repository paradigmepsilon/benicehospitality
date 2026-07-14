/**
 * Testimonials — real, permissioned reviews from Claim Proof customers, shown as
 * a two-row scrolling wall (top row left, bottom row right) that pauses on hover
 * and stops entirely under prefers-reduced-motion. Pure CSS via `animate-cp-marquee`
 * (see globals.css); each row renders its cards twice so the -50% loop is seamless.
 *
 * SOURCE OF TRUTH: these 20 quotes are real customer testimonials provided by the
 * founder (2026-07-13), with permission to publish first name + city. Keep the
 * signed-consent file on record for FTC substantiation. Do NOT add invented
 * reviews to this list.
 */

type Tier = "Complete Defense" | "Emergency Kit" | "Fleet License";

type Testimonial = {
  quote: string;
  name: string;
  city: string;
  cars: number;
  tier: Tier;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: `I'll be honest, I almost skipped this. Figured it was just another PDF someone slapped together. It's not. The first time a renter brought my Camry back with a bumper that "was already like that," I actually had the pre-trip photos organized the way this thing tells you to organize them. Turo sided with me in two days. Before ClaimProof I would have eaten that repair and moved on quietly. Ninety-seven dollars to stop losing money on stuff that isn't my fault. Easy math.`,
    name: "Marcus T.",
    city: "Marietta, GA",
    cars: 4,
    tier: "Complete Defense",
    initials: "MT",
  },
  {
    quote: `I'm still pretty new to this, only two cars, and the claims side scared me more than anything. I didn't want to buy the biggest package right away so I grabbed the emergency kit to see if it was worth it. It walked me through my first minor claim step by step and I didn't panic once. I'll probably upgrade later. For now this was exactly the amount of help I needed without overspending.`,
    name: "Danielle R.",
    city: "Charlotte, NC",
    cars: 2,
    tier: "Emergency Kit",
    initials: "DR",
  },
  {
    quote: `Running twelve vehicles means claims are just a fact of life. Somebody's always denting something. What I needed was a system my two part-time helpers could follow without me hovering over them. The fleet license gave me that. Everybody documents the same way now, same photo standard, same worksheet. The valuation gap tracker alone recovered more than the license cost on one claim last month. This is the first thing I've bought for the business that actually saved me time instead of adding a task.`,
    name: "Jerome W.",
    city: "Memphis, TN",
    cars: 12,
    tier: "Fleet License",
    initials: "JW",
  },
  {
    quote: `What I appreciate is how methodical it is. I'm the kind of person who wants a checklist and a reason behind every step, and this delivers both. The condition worksheet made me realize how sloppy my old documentation was. I was basically hoping nobody would file a claim. Now I have a real file for every trip. Filed my first proper claim last week and the difference in how seriously it got taken was obvious.`,
    name: "Ashley P.",
    city: "Tampa, FL",
    cars: 3,
    tier: "Complete Defense",
    initials: "AP",
  },
  {
    quote: `Spent enough years being told to document everything the right way, so a system built around discipline speaks my language. The command center approach fits how I already think. Everything in one place, timestamped, nothing scattered across my phone and three email threads. My only note is I wish the video walkthrough was a little shorter, but the actual content is solid. Would recommend to any operator who takes the fleet seriously.`,
    name: "Ray B.",
    city: "Columbus, GA",
    cars: 6,
    tier: "Fleet License",
    initials: "RB",
  },
  {
    quote: `I bought this because I already got burned once. Renter returned my SUV with interior damage and I had nothing but a couple of blurry photos and a bad feeling. Lost about six hundred bucks I should have won. Never again. The emergency kit is simple but it fixed the exact hole I had, which was not knowing what to send or when. Wish I'd found it a year ago.`,
    name: "Tanya M.",
    city: "Birmingham, AL",
    cars: 2,
    tier: "Emergency Kit",
    initials: "TM",
  },
  {
    quote: `Let me talk numbers because that's what convinced me. My last approved claim came in about fourteen hundred under what the repair and downtime actually cost me. That gap is the whole game and nobody warns you about it. The defense system is basically built to fight that gap specifically. First claim I ran through it closed way tighter to my real number. If you have more than two cars and you're not doing this, you're leaving money on the table every single trip.`,
    name: "Kevin O.",
    city: "Jacksonville, FL",
    cars: 5,
    tier: "Complete Defense",
    initials: "KO",
  },
  {
    quote: `Okay so I was expecting something dry and complicated and it really wasn't. It's laid out in a way that just makes sense. I did the whole setup in an afternoon while my kid was napping. The part I use most is the pre-trip photo standard because it takes the guesswork out. I don't have to wonder if I got enough shots. Genuinely one of the better purchases I've made for the car business this year.`,
    name: "Brittany S.",
    city: "Nashville, TN",
    cars: 3,
    tier: "Complete Defense",
    initials: "BS",
  },
  {
    quote: `Does what it says. Bought it, set it up, used it on a claim within the week. Won the claim. Not much else to add. If you have a fleet, get the fleet license and stop overthinking it.`,
    name: "Derrick H.",
    city: "Augusta, GA",
    cars: 8,
    tier: "Fleet License",
    initials: "DH",
  },
  {
    quote: `This is a side hustle for me, just one car while I keep my day job. I didn't think I needed anything fancy and the emergency kit was priced right for someone in my spot. Had a small windshield dispute and instead of stressing about it I just followed the steps and submitted a clean file. Got it handled. For forty-seven dollars it paid for itself the first time I opened it.`,
    name: "Monica L.",
    city: "Savannah, GA",
    cars: 1,
    tier: "Emergency Kit",
    initials: "ML",
  },
  {
    quote: `The pre-trip photo standard changed how I hand off every car. I used to take random pictures and hope for the best. Now I know exactly which angles matter and why. When a renter tried to say a scratch was there before, I had the timestamped proof it wasn't. That one moment was worth the whole price. The rest of the system is good too, but that feature alone sold me.`,
    name: "Chris D.",
    city: "Greenville, SC",
    cars: 4,
    tier: "Complete Defense",
    initials: "CD",
  },
  {
    quote: `At fifteen vehicles the single-license price on the fleet plan is almost silly. I was budgeting for something ten times this. What I really wanted was consistency across the whole operation and a way to onboard new drivers fast. The fleet license nails both. Everyone documents identically, so when a claim comes in I'm not chasing anybody for missing photos. It's become part of our standard operating procedure and I don't see us ever going back.`,
    name: "Patrick N.",
    city: "Raleigh, NC",
    cars: 15,
    tier: "Fleet License",
    initials: "PN",
  },
  {
    quote: `I cannot tell you how much lighter I feel knowing I have this. Claims used to keep me up at night because it felt like my word against the renter's and I always assumed I'd lose. The defense system gave me structure and honestly some confidence. My first real claim after buying it went in my favor and I actually teared up a little. Silly maybe, but that money mattered to my family.`,
    name: "Yolanda F.",
    city: "Baton Rouge, LA",
    cars: 2,
    tier: "Complete Defense",
    initials: "YF",
  },
  {
    quote: `I'm not a tech guy. I'll admit I was worried this would be over my head with apps and logins and all that. It wasn't. Everything is plain and easy to follow. My son helped me get set up but honestly I could have done it alone. Used it on a claim last month and it held up fine. If a 61 year old who barely texts can run this, anybody can.`,
    name: "Steve G.",
    city: "Knoxville, TN",
    cars: 3,
    tier: "Emergency Kit",
    initials: "SG",
  },
  {
    quote: `We run the fleet together, so having one shared system instead of two people documenting two different ways has been a quiet lifesaver. No more "did you get the photos" arguments. We both follow the same file now. Our first claim using it went smoother than any we'd done before, and we've been doing this three years. Worth it just for the peace between us honestly.`,
    name: "Amanda & Joel K.",
    city: "Chattanooga, TN",
    cars: 5,
    tier: "Complete Defense",
    initials: "AJ",
  },
  {
    quote: `The thing nobody tells you is that winning the claim is only half of it. You can win and still lose money because the payout doesn't cover the real loss. The valuation gap worksheet is the piece I didn't know I needed. It gave me the language and the numbers to push back when the offer came in low. Recovered close to a thousand extra on one claim by not just accepting the first figure. That's the whole point.`,
    name: "Terrence J.",
    city: "Columbia, SC",
    cars: 7,
    tier: "Fleet License",
    initials: "TJ",
  },
  {
    quote: `I haven't had a major claim yet, and part of me hesitated to review something I haven't fully battle tested. But that's kind of the point of buying it, right? I wanted to be ready before disaster instead of scrambling after. Just having the files built and the process in place has taken a real weight off. I sleep better. When the bad day comes, and it will, I'll be prepared instead of guessing.`,
    name: "Nicole A.",
    city: "Orlando, FL",
    cars: 2,
    tier: "Complete Defense",
    initials: "NA",
  },
  {
    quote: `I've tried building my own tracking spreadsheets, cobbling together folders, the whole DIY thing. It always fell apart because I'd get lazy about it. This is just better organized than anything I was going to make myself. The command center layout keeps everything in one spot and it's actually structured for claims, not just storage. Saved me from reinventing a wheel that was never going to roll as well anyway.`,
    name: "Bryan M.",
    city: "Richmond, VA",
    cars: 4,
    tier: "Complete Defense",
    initials: "BM",
  },
  {
    quote: `I'm retired and rent out one car for a little extra income. I don't need anything complicated and this suited me perfectly. The instructions are clear and not written for young tech people, which I appreciated. Had a small fender dispute and felt completely in control filing it. For someone doing this at a small scale, the emergency kit is just the right size and price. No regrets at all.`,
    name: "Denise C.",
    city: "Macon, GA",
    cars: 1,
    tier: "Emergency Kit",
    initials: "DC",
  },
  {
    quote: `I know most of you all are out east but figured I'd add mine from Texas. Ten cars, lots of miles, plenty of claims. The fleet license standardized my whole documentation flow and my turnaround on filing dropped noticeably. What used to take me an evening of digging now takes minutes because the file is already built. Recovered more on my last two claims than I did all of last year combined. This one earns its keep.`,
    name: "Luis R.",
    city: "Houston, TX",
    cars: 10,
    tier: "Fleet License",
    initials: "LR",
  },
];

const TIER_ACCENT: Record<Tier, string> = {
  "Complete Defense": "bg-deep-teal/10 text-deep-teal",
  "Emergency Kit": "bg-terracotta/10 text-terracotta",
  "Fleet License": "bg-warm-gold/15 text-warm-gold",
};

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex w-[320px] flex-none flex-col justify-between rounded-2xl border border-near-black/8 bg-white p-6 shadow-sm sm:w-[400px]">
      <div>
        <span
          className={
            "inline-block rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide " +
            TIER_ACCENT[t.tier]
          }
        >
          {t.tier}
        </span>
        <blockquote className="mt-4 font-sans text-sm leading-relaxed text-charcoal">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
      </div>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-near-black/8 pt-4">
        <span
          aria-hidden
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-deep-teal font-sans text-xs font-bold text-white"
        >
          {t.initials}
        </span>
        <span className="font-sans text-sm leading-tight">
          <span className="block font-bold text-near-black">{t.name}</span>
          <span className="block text-warm-gray">
            {t.cars} {t.cars === 1 ? "vehicle" : "vehicles"} &middot; {t.city}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  // Single row of all reviews. Render the list twice so the -50% translate
  // loops seamlessly. Hovering anywhere on the track pauses the scroll so a
  // card can be read; reduced-motion users get a static (manually scrollable) row.
  const track = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <div
      className="cp-marquee-pause-group relative w-full overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <div className="flex w-max items-stretch gap-6 animate-cp-marquee motion-reduce:animate-none">
        {track.map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </div>
    </div>
  );
}
