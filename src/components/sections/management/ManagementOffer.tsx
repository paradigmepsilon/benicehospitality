import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import PhotoHero from "@/components/sections/shared/PhotoHero";
import PhotoCTA from "@/components/sections/shared/PhotoCTA";
import OnboardingTimeline from "@/components/sections/management/OnboardingTimeline";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { BOOKING_SOURCES, type BookingSource } from "@/lib/booking-url";
import {
  MANAGEMENT_OFFERS,
  SERVICE_AREA_LABEL,
  getManagementFeeModel,
  type ManagedAsset,
} from "@/lib/management/constants";

/**
 * The one template behind both management offer pages (/management/fleet and
 * /management/co-living). Renders the nine sections from the repositioning
 * spec, in order, for whichever asset is passed in. BNHG is the only brand
 * named anywhere in this file; the operator sidebar names the person, not the
 * operating company.
 *
 * Two sections are conditional by design, not by omission:
 *   - Fee model (4): getManagementFeeModel() returns null until Alex sets
 *     every env var. The null branch renders structure only, never a
 *     placeholder digit.
 *   - Owner portal (6): renders only when OWNER_PORTAL_URL is set, otherwise
 *     the whole section (and its dividers) are skipped so no dead link ships.
 *
 * Copy that differs by asset lives in ASSET_COPY below rather than in
 * MANAGEMENT_OFFERS, because the "who it's for" and "objections" content
 * never made it into that data module (no `fit` field exists there). Writing
 * it here keeps constants.ts limited to what Task 2 actually shipped.
 */

export const ONBOARDING_STEPS = [
  {
    step: "Apply",
    body: "Tell us about the asset and what you want from management.",
  },
  {
    step: "Call",
    body: "A working conversation. We ask questions, you ask questions, and we both find out if it's a fit.",
  },
  {
    step: "Asset review",
    body: "We look at the vehicle or property itself and note anything that needs attention before it goes live.",
  },
  {
    step: "Agreement",
    body: "The management agreement, in writing, before anything changes hands.",
  },
  {
    step: "Onboarding checklist",
    body: "Listing, photography, pricing, and the handoff details specific to your asset.",
  },
  {
    step: "Live",
    body: "The asset is listed and taking bookings or applications.",
  },
] as const;

const HERO_IMAGE: Record<ManagedAsset, { src: string; alt: string; position?: string }> = {
  car: {
    src: "/images/Website Images/Alex Turo Shot.png",
    alt: "Alex Henry at the wheel of a managed rental vehicle",
    position: "object-[24%_center]",
  },
  rooms: {
    src: "/images/Website Images/hf_20260528_162140_0ee925d0-fbc6-4a93-af15-0c4174b02574.png",
    alt: "Della Henry staging a furnished co-living living room",
    position: "object-[45%_center]",
  },
};

const CTA_IMAGE: Record<ManagedAsset, { src: string; alt: string; position?: string }> = {
  car: {
    src: "/images/Website Images/image5.png",
    alt: "Managed rental vehicles with the Atlanta skyline behind them",
  },
  rooms: {
    src: "/images/Website Images/hf_20260312_143806_033b0238-3b74-42ea-ad06-8c3119b6ad1a.jpeg",
    alt: "A welcome basket on a co-living kitchen counter",
  },
};

/**
 * What the percentage is a percentage OF. For a vehicle the management
 * agreement defines rental revenue as what the platform pays out for the
 * vehicle, after the platform's own share, so "gross" here would promise a
 * different base than the contract signs. Rooms keep "gross": there is no
 * platform share between the tenant's rent and the owner.
 */
const FEE_BASIS: Record<ManagedAsset, { label: string; short: string; sentence: string }> = {
  car: {
    label: "Percentage of rental revenue",
    short: "of rental revenue",
    sentence: "a percentage of rental revenue, meaning what the platform pays out for your vehicle after its own share",
  },
  rooms: {
    label: "Percentage of gross",
    short: "of gross",
    sentence: "a percentage of gross",
  },
};

const FEE_STRUCTURE = [
  {
    label: "Percentage of gross",
    note: "Tied to what the asset actually earns, not a flat rate regardless of performance.",
  },
  {
    label: "One-time onboarding fee",
    note: "Covers listing setup and getting the asset ready to go live. Charged once.",
  },
  {
    label: "Minimum term",
    note: "So the onboarding work makes sense for both sides.",
  },
] as const;

interface Objection {
  q: string;
  a: string;
  link?: { href: string; label: string };
}

interface AssetCopy {
  /** Fits naturally into a sentence: "Everything it takes to keep {subject} earning." */
  subject: string;
  fitFor: string[];
  fitNotFor: string[];
  courseLabel: string;
  objections: Objection[];
}

const ASSET_COPY: Record<ManagedAsset, AssetCopy> = {
  car: {
    subject: "your vehicle",
    fitFor: [
      "The vehicle is titled and insured in your name today, or will be before management starts.",
      "The vehicle is road-ready today: no open recalls, no mechanical work standing between now and a rental.",
      "You want the vehicle earning as a rental, not parked between trips.",
      "You're ready to hand day-to-day pricing, scheduling, and renter communication to an operator.",
      "The vehicle is based inside our service area.",
    ],
    fitNotFor: [
      "You want to set every price and approve every booking yourself.",
      "The vehicle needs mechanical work before it can be rented safely.",
      "You're not ready to carry rental-appropriate insurance on the vehicle.",
      "The vehicle is based outside our service area and isn't moving into it.",
    ],
    courseLabel: "Car Rental Riches",
    objections: [
      {
        q: "Damage and disputes",
        a: "Damage happens. What decides the outcome is documentation taken before the trip, not a story after it. We follow the same process on every vehicle.",
        link: { href: "/claimproof", label: "See how Claim Proof documents a trip" },
      },
      {
        q: "Screening",
        a: "Renters go through the platform's own screening before they can book. We review anything unusual before it's approved.",
      },
      {
        q: "Insurance requirements",
        a: "You carry a policy built for rental use, not a personal auto policy. The policy and the carrier stay your choice; we can tell you what it needs to cover.",
      },
      {
        q: "When the vehicle sits idle",
        a: "An idle vehicle is a signal, not a surprise you hear about later. We flag falling utilization and adjust pricing or positioning before it becomes a pattern.",
      },
      {
        q: "How and when you're paid",
        a: "You're paid out on a set schedule with a statement showing what the vehicle earned and what came out for the fee and any pass-through costs.",
      },
      {
        q: "How to exit",
        a: "Your minimum term and exit notice are both in the management agreement. When it ends, the vehicle and its listings come back to you.",
      },
    ],
  },
  rooms: {
    subject: "your rooms",
    fitFor: [
      "You own the property, or hold clear authority to lease its rooms, today.",
      "The rooms are livable today: no renovation standing between now and a tenant moving in.",
      "You want the rooms filled and run as a business, not managed as a favor.",
      "You're ready to hand day-to-day tenant, turnover, and house-rule decisions to an operator.",
      "The property is inside our service area.",
    ],
    fitNotFor: [
      "You want final say on every tenant and every house rule.",
      "The property needs renovation before its rooms are rentable.",
      "You're not ready to carry a landlord policy built for tenant occupancy.",
      "The property is outside our service area and isn't relocating.",
    ],
    courseLabel: "Room Rental Riches",
    objections: [
      {
        q: "Damage and disputes",
        a: "Move-out damage gets checked against a documented move-in condition, not a guess. Deposits get applied the same way every time.",
      },
      {
        q: "Screening",
        a: "Every tenant goes through a consistent screening process before a lease is signed. Nobody moves in on a hunch.",
      },
      {
        q: "Insurance requirements",
        a: "You carry a landlord policy built for tenant occupancy, not a standard homeowner policy. The policy and the carrier stay your choice.",
      },
      {
        q: "When a room sits open",
        a: "An open room is a signal, not a surprise you hear about later. We flag it and adjust pricing or marketing before it becomes a pattern.",
      },
      {
        q: "How and when you're paid",
        a: "You're paid out on a set schedule with a statement showing what the property earned and what came out for the fee and any pass-through costs.",
      },
      {
        q: "How to exit",
        a: "Your minimum term and exit notice are both in the management agreement. When it ends, the property and its listings come back to you.",
      },
    ],
  },
};

const HERO_SOURCE: Record<ManagedAsset, BookingSource> = {
  car: BOOKING_SOURCES.MGMT_FLEET_HERO,
  rooms: BOOKING_SOURCES.MGMT_COLIVING_HERO,
};

const FINAL_CTA_SOURCE: Record<ManagedAsset, BookingSource> = {
  car: BOOKING_SOURCES.MGMT_FLEET_FINAL_CTA,
  rooms: BOOKING_SOURCES.MGMT_COLIVING_FINAL_CTA,
};

/**
 * Builds the /management/apply link for a given click source. Not bookingUrl
 * (that helper is hardcoded to /book) but the same shape: a source param for
 * click attribution, asset optional so the overview page's CTA can omit it.
 */
export function applyHref(source: BookingSource, asset?: ManagedAsset): string {
  const params = new URLSearchParams({ source });
  if (asset) params.set("asset", asset);
  return `/management/apply?${params.toString()}`;
}

interface ManagementOfferProps {
  asset: ManagedAsset;
}

export default function ManagementOffer({ asset }: ManagementOfferProps) {
  const offer = MANAGEMENT_OFFERS[asset];
  const copy = ASSET_COPY[asset];
  const fees = getManagementFeeModel(asset);
  const ownerPortalUrl = process.env.OWNER_PORTAL_URL;

  const feeFigures = fees
    ? ([
        `${fees.grossPct}% ${FEE_BASIS[asset].short}`,
        `$${fees.onboardingUsd.toLocaleString("en-US")} onboarding fee`,
        `${fees.minimumTermMonths}-month minimum term`,
      ] as const)
    : null;

  const portalItems = [
    { label: "Revenue", note: "What the asset earned." },
    { label: "Expenses", note: "What came out, and why." },
    {
      label: asset === "car" ? "Utilization" : "Occupancy",
      note:
        asset === "car"
          ? "How often the vehicle was out earning."
          : "How many rooms were filled.",
    },
    { label: "Open issues", note: "Anything that needs your attention or a decision." },
    { label: "Statements", note: "A monthly record you can hand to your accountant." },
  ];

  return (
    <>
      {/* 1. HERO, plus the "Your operator" card floating on the photo. */}
      <PhotoHero
        eyebrow={`${offer.name} across ${SERVICE_AREA_LABEL}`}
        headline={offer.promise}
        lede={
          <>
            BNHG manages {copy.subject} day to day: the listing, the pricing,
            the turnover, and the people. You keep ownership and the decisions
            that matter.
          </>
        }
        primaryCta={{
          label: "Check your fit",
          href: applyHref(HERO_SOURCE[asset], asset),
        }}
        note="A few minutes, no sales script."
        image={HERO_IMAGE[asset]}
        dividerTo={C.white}
        aside={
          <div className="rounded-card border border-white/60 bg-white/85 backdrop-blur-xl text-near-black p-6 md:p-7">
            <p className="font-sans text-sm text-charcoal/65 mb-2">Your operator</p>
            <h2 className="font-display text-2xl font-semibold leading-tight mb-2">
              {offer.operator.name}
            </h2>
            <p className="font-sans text-[15px] text-charcoal/80 leading-snug">
              {offer.operator.blurb}
            </p>
          </div>
        }
      />

      {/* 2. WHO IT'S FOR / WHO IT ISN'T */}
      <AnimatedSection theme="light" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>Fit check</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                Is this you?
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal leading-snug">
                Management works when the asset and the owner are both ready.
                Here&rsquo;s how to tell.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            <AnimatedItem>
              <div className="h-full bg-white border border-light-gray rounded-sm p-7 md:p-8">
                <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-5">
                  This is for you if
                </h3>
                <ul className="space-y-3">
                  {copy.fitFor.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-base text-charcoal/85 leading-snug flex items-start gap-3"
                    >
                      <span aria-hidden="true" className="text-primary-green mt-0.5">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>

            <AnimatedItem>
              <div
                className="h-full border border-terracotta/25 rounded-sm p-7 md:p-8"
                style={{ backgroundColor: C.alertWash }}
              >
                <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-5">
                  This isn&rsquo;t for you if
                </h3>
                <ul className="space-y-3">
                  {copy.fitNotFor.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-base text-charcoal/85 leading-snug flex items-start gap-3"
                    >
                      <span aria-hidden="true" className="text-terracotta mt-0.5">
                        &#10005;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* 3. WHAT WE HANDLE / WHAT YOU KEEP */}
      <AnimatedSection theme="off-white" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>The division of labor</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                What we handle. What you keep.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal leading-snug">
                BNHG runs the operations on {copy.subject}. You keep ownership
                and the decisions that matter.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            <AnimatedItem>
              <div className="h-full bg-white rounded-sm p-7 md:p-8">
                <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-5">
                  BNHG handles
                </h3>
                <ul className="space-y-3">
                  {offer.handles.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-base text-charcoal/85 leading-snug flex items-start gap-3"
                    >
                      <span aria-hidden="true" className="text-warm-gold mt-0.5">
                        &rarr;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>

            <AnimatedItem>
              <div className="h-full bg-white rounded-sm p-7 md:p-8">
                <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-5">
                  You keep
                </h3>
                <ul className="space-y-3">
                  {offer.ownerKeeps.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-base text-charcoal/85 leading-snug flex items-start gap-3"
                    >
                      <span aria-hidden="true" className="text-warm-gold mt-0.5">
                        &rarr;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* 4. FEE MODEL. Structure-only until every env var is set; never a
          placeholder digit. */}
      <AnimatedSection theme="light" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>The fee</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                How the fee works.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal leading-snug">
                {feeFigures
                  ? "Here's what you'll pay. No surprises after you sign."
                  : `We charge ${FEE_BASIS[asset].sentence}, a one-time onboarding fee, and ask for a minimum term. We give you all three numbers on the call, before you sign anything.`}
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {FEE_STRUCTURE.map((f, i) => (
              <AnimatedItem key={i === 0 ? FEE_BASIS[asset].label : f.label}>
                <div className="h-full border-t-2 border-warm-gold bg-cream rounded-sm p-7">
                  <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight mb-3">
                    {feeFigures ? feeFigures[i] : i === 0 ? FEE_BASIS[asset].label : f.label}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/70 leading-snug">
                    {f.note}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.white} flip />

      {/* 5. ONBOARDING. Order, not duration: no named timeline exists yet. */}
      <OnboardingTimeline
        lede={
          <>
            No named timeline until we&rsquo;ve seen the asset. Here&rsquo;s
            the order every application moves through.
          </>
        }
      />

      {/* 6. OWNER PORTAL PREVIEW. Renders only when OWNER_PORTAL_URL exists.
          When it doesn't, this whole block (section + both dividers) is
          skipped so nothing points at a dead link. */}
      {ownerPortalUrl ? (
        <>
          <SectionDivider fromColor={C.white} toColor={C.deepTeal} />
          <AnimatedSection theme="green" className="py-10 md:py-14 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-12 md:mb-14">
                <AnimatedItem>
                  <SectionLabel light>The owner portal</SectionLabel>
                </AnimatedItem>
                <AnimatedItem>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.1] tracking-tight mt-4 mb-6">
                    What you see, every month.
                  </h2>
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-lg text-white/85 leading-snug">
                    The BNHG Owner Portal gives you a clear view into the
                    asset without needing to call and ask.
                  </p>
                </AnimatedItem>
              </div>

              <AnimatedDiv
                stagger
                className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12"
              >
                {portalItems.map((p) => (
                  <AnimatedItem key={p.label}>
                    <div className="h-full border-t-2 border-warm-gold pt-4">
                      <h3 className="font-display text-lg font-semibold text-white leading-tight mb-2">
                        {p.label}
                      </h3>
                      <p className="font-sans text-sm text-white/70 leading-snug">
                        {p.note}
                      </p>
                    </div>
                  </AnimatedItem>
                ))}
              </AnimatedDiv>

              <AnimatedItem>
                <Button href={ownerPortalUrl} external variant="light" size="md">
                  Open the Owner Portal
                </Button>
              </AnimatedItem>
            </div>
          </AnimatedSection>
          <SectionDivider fromColor={C.deepTeal} toColor={C.white} flip />
        </>
      ) : (
        <SectionDivider fromColor={C.white} toColor={C.white} />
      )}

      {/* 7. OBJECTIONS */}
      <AnimatedSection theme="light" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>Before you ask</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                The questions every owner asks.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10"
          >
            {copy.objections.map((o) => (
              <AnimatedItem key={o.q}>
                <div className="h-full">
                  <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3">
                    {o.q}
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    {o.a}
                  </p>
                  {o.link && (
                    <Link
                      href={o.link.href}
                      className="mt-3 inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold transition-colors"
                    >
                      {o.link.label}
                    </Link>
                  )}
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* 8. TRANSPARENCY LINE + THE DIY ALTERNATIVE */}
      <AnimatedSection theme="off-white" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="max-w-3xl bg-white border-t-2 border-warm-gold p-8 md:p-10">
              <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                One more option
              </p>
              <p className="font-display italic text-2xl md:text-3xl text-deep-teal leading-snug mb-5">
                You can run this yourself with our course. If you would
                rather not, we can do it for you.
              </p>
              <p className="font-sans text-base text-charcoal/85 leading-snug mb-7">
                {copy.courseLabel} teaches the same operator method we run on
                managed assets.
              </p>
              <Button href="/training" variant="secondary" size="md">
                Explore Training
              </Button>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* 9. FINAL CTA */}
      <PhotoCTA
        headline="Check your fit."
        body="Applying takes a few minutes. Nothing is signed until the call."
        primary={{
          label: "Check your fit",
          href: applyHref(FINAL_CTA_SOURCE[asset], asset),
        }}
        image={CTA_IMAGE[asset]}
      />
    </>
  );
}
