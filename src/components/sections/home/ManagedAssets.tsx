import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { MANAGEMENT_OFFERS } from "@/lib/management/constants";
import SectionIntro from "@/components/ui/SectionIntro";

const ASSET_IMAGES = {
  car: {
    src: "/images/Website Images/image5.png",
    alt: "Three rental vehicles parked with the Atlanta skyline behind them",
  },
  rooms: {
    src: "/images/Website Images/image4.png",
    alt: "A furnished co-living living room with an open kitchen",
  },
} as const;

// Home page copy for each card. The offer pages carry the full list of what
// BNHG handles (MANAGEMENT_OFFERS.handles); here each card gets its own
// promise and four lines written for that asset, so the two do not read as
// a template with the noun swapped.
const HOME_COPY = {
  car: {
    promise:
      "Your vehicle should be paying you back, not paging you at midnight. BNHG lists it, prices it, turns it, and takes the claims calls.",
    points: [
      "Listing, photos, and pricing that moves with the market",
      "Turnover, cleaning, and maintenance coordination",
      "Damage claims and dispute evidence, handled for you",
      "Renter messaging from booking to return",
    ],
  },
  rooms: {
    promise:
      "Rooms rented by the door, without you screening tenants or chasing rent. BNHG fills the house and keeps it running.",
    points: [
      "Tenant screening, leases, and renewals",
      "Rent collection and house rules, enforced kindly",
      "Turnover between tenants and maintenance coordination",
      "Listings and photography that fill rooms fast",
    ],
  },
} as const;

const OFFERS = [MANAGEMENT_OFFERS.car, MANAGEMENT_OFFERS.rooms];

/**
 * The two assets BNHG manages, each as a wide photo card. Promise and the
 * first four items BNHG handles come straight from MANAGEMENT_OFFERS, so the
 * homepage can never drift from the offer pages.
 */
interface ManagedAssetsProps {
  eyebrow?: string;
  heading?: ReactNode;
  id?: string;
  /** Set the offer name above the photograph instead of under it. */
  titleAbove?: boolean;
}

export default function ManagedAssets({
  eyebrow = "Management",
  heading = (
    <>
      <span className="block">Two types of assets we manage.</span>
      <span className="block">You keep ownership of both.</span>
    </>
  ),
  id,
  titleAbove = false,
}: ManagedAssetsProps) {
  return (
    <section id={id} className="bg-white px-3 md:px-5 py-10 md:py-14 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-3 md:px-5">
        <SectionIntro label={eyebrow} heading={heading} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {OFFERS.map((offer) => {
            const image = ASSET_IMAGES[offer.asset];
            const copy = HOME_COPY[offer.asset];
            return (
              <article
                key={offer.asset}
                className="group overflow-hidden rounded-card bg-white border border-charcoal/10 flex flex-col"
              >
                {titleAbove && (
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight px-7 md:px-8 pt-7 md:pt-8 pb-5">
                    {offer.name}
                  </h3>
                )}
                <Link
                  href={`/management/${offer.slug}`}
                  className="relative block aspect-[16/10] overflow-hidden bg-near-black"
                  aria-label={`See ${offer.name}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                    style={{ filter: "saturate(0.9) contrast(1.05)" }}
                  />
                  <span
                    aria-hidden
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/85 backdrop-blur text-near-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 motion-reduce:group-hover:rotate-0"
                  >
                    <ArrowUpRight className="w-4 h-4" strokeWidth={2.25} />
                  </span>
                </Link>
                <div className="p-7 md:p-8 flex flex-col flex-1">
                  {!titleAbove && (
                    <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-3">
                      {offer.name}
                    </h3>
                  )}
                  <p className="font-sans text-base text-charcoal/80 leading-snug">
                    {copy.promise}
                  </p>
                  <ul className="grid gap-y-2.5 mt-6">
                    {copy.points.map((item) => (
                      <li
                        key={item}
                        className="font-sans text-sm text-charcoal/80 flex items-start gap-2.5"
                      >
                        <Check
                          aria-hidden
                          className="w-4 h-4 mt-0.5 shrink-0 text-deep-teal"
                          strokeWidth={2.5}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 pt-6 border-t border-charcoal/10 font-sans text-sm text-charcoal/65">
                    {offer.operator.blurb}{" "}
                    <Link
                      href={`/management/${offer.slug}`}
                      className="font-semibold text-deep-teal hover:text-warm-gold transition-colors"
                    >
                      See {offer.name}
                    </Link>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
