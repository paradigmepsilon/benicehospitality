import Image from "next/image";
import Button from "@/components/ui/Button";
import OwnerPortalLink from "@/components/sections/home/OwnerPortalLink";
import { isEstimatorEnabled } from "@/lib/estimate/flag";

/**
 * The home hero. One framed golden-hour photograph of the founders and the
 * positioning line bottom-left; the photograph carries the right-hand side.
 * The entrance animation is the only non-user-triggered motion on the site.
 */
export default function HeroSection() {
  const ownerPortalUrl = process.env.OWNER_PORTAL_URL;
  // The estimator tool stays unreachable until the metro rate table has real
  // data (see src/lib/estimate/flag.ts). Until then the one primary CTA
  // falls back to the management overview rather than linking to an empty
  // tool. Same pattern the estimator page itself uses.
  const estimatorEnabled = isEstimatorEnabled();
  const primaryCta = estimatorEnabled
    ? { label: "See what your asset would earn", href: "/estimate" }
    : { label: "See how management works", href: "/management" };

  return (
    <section
      className="relative bg-cream px-3 md:px-5 pt-24 md:pt-28"
      aria-labelledby="hero-headline"
    >
      <div className="relative overflow-hidden rounded-panel bg-near-black text-white min-h-[600px] md:min-h-[680px] lg:min-h-[calc(100vh-7rem)] lg:max-h-[920px] flex items-end">
        <Image
          src="/images/Website Images/image2.png"
          alt="Della and Alex Henry in front of the Atlanta skyline at golden hour"
          fill
          sizes="100vw"
          quality={90}
          priority
          className="object-cover object-[62%_center]"
          style={{ filter: "saturate(0.9) contrast(1.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-near-black/85 via-near-black/40 to-near-black/10"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-near-black/80 via-near-black/30 to-transparent"
        />

        <div className="relative z-10 w-full p-6 sm:p-8 md:p-12 lg:p-14">
          <div className="max-w-3xl">
            <p
              className="animate-rise font-sans text-sm md:text-base font-medium text-white/80 mb-5"
              style={{ animationDelay: "0.05s" }}
            >
              Sharing economy asset management for the Southeast U.S.
            </p>
            <h1
              id="hero-headline"
              className="animate-rise font-display text-[2.6rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] font-semibold leading-[1.0] tracking-tight"
              style={{ animationDelay: "0.15s" }}
            >
              Learn to run it,
              <br />
              or let us run it for you.
            </h1>
            <p
              className="animate-rise font-sans text-base md:text-lg text-white/85 leading-relaxed mt-6 max-w-xl"
              style={{ animationDelay: "0.3s" }}
            >
              We&rsquo;re operators who got tired of running our portfolios on
              duct tape. So we built the systems, training, and management
              services we wished existed for co-living properties and rental
              fleets.
            </p>
            <div
              className="animate-rise flex flex-wrap items-center gap-3 mt-8"
              style={{ animationDelay: "0.4s" }}
            >
              <Button href={primaryCta.href} variant="primary" size="lg" arrow>
                {primaryCta.label}
              </Button>
              {ownerPortalUrl && <OwnerPortalLink href={ownerPortalUrl} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
