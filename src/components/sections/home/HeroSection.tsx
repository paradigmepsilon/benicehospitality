import Image from "next/image";
import Button from "@/components/ui/Button";
import OwnerPortalLink from "@/components/sections/home/OwnerPortalLink";
import { SERVICE_AREA_LABEL } from "@/lib/management/constants";
import { isEstimatorEnabled } from "@/lib/estimate/flag";

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
      className="relative isolate w-full bg-near-black pt-32 md:pt-28 pb-2 md:pb-4"
      aria-labelledby="hero-headline"
    >
      {/* Centered wrapper caps the hero width so the image box stays an exact 3:2
          and never crops. On screens wider than max-w the section's near-black bg
          shows as side margins. Text + image share this wrapper so the overlay
          stays anchored to the image's left edge on wide screens. */}
      <div className="relative w-full max-w-[1280px] mx-auto">
        {/* Text sits above the image on mobile, overlays on md+ */}
        <div className="md:absolute md:inset-0 md:z-10 md:flex md:items-center md:pointer-events-none">
          <div className="px-6 pb-8 md:px-12 lg:px-20 md:py-0 md:pointer-events-auto">
            <div className="max-w-xl">
              <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-cream/70 md:text-cream/90 mb-6">
                Sharing economy asset management &middot; {SERVICE_AREA_LABEL}
              </p>

              <h1
                id="hero-headline"
                className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-cream leading-[1.05] tracking-tight mb-6"
              >
                Sharing economy asset management for the Southeast.
                <br />
                Learn to run it, or let us run it.
              </h1>

              <p className="font-sans text-base md:text-lg text-cream/90 leading-relaxed mb-8">
                We&rsquo;re operators who got tired of running our portfolios
                on duct tape. So we built the systems, training, and
                management services we wished existed for co-living
                properties and rental fleets.
              </p>

              <div className="flex flex-col items-start gap-5">
                <Button href={primaryCta.href} variant="primary" size="lg">
                  {primaryCta.label}
                </Button>
                {ownerPortalUrl && <OwnerPortalLink href={ownerPortalUrl} />}
              </div>
            </div>
          </div>
        </div>

        {/* Image box is always an exact 3:2 (width capped by the wrapper), so
            object-cover never has overflow to crop. On mobile it appears below
            the text block; on md+ the text overlays it. */}
        <div className="relative w-full aspect-[3/2] overflow-hidden">
          <Image
            src="/images/Website Images/image2.png"
            alt="Della and Alex Henry in front of an Atlanta skyline at golden hour"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
            priority
          />
          {/* Scrim only when text overlays (md+) */}
          <div
            aria-hidden
            className="absolute inset-0 hidden md:block bg-gradient-to-r from-black/70 via-black/35 to-transparent"
          />
          {/* Bottom fade softens the image edge into the section's near-black bg */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-b from-transparent to-near-black"
          />
          {/* Side fades melt the left/right edges into the near-black margins on
              wide screens (and lightly vignette the edges on mobile) */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-near-black to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-near-black to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
