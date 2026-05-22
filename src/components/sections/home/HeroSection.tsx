import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="relative isolate w-full bg-near-black pt-32 md:pt-28 pb-2 md:pb-4"
      aria-labelledby="hero-headline"
    >
      {/* Text — sits above the image on mobile, overlays on md+ */}
      <div className="md:absolute md:inset-0 md:z-10 md:flex md:items-center md:pointer-events-none">
        <div className="px-6 pb-8 md:px-12 lg:px-20 md:py-0 md:pointer-events-auto">
          <div className="max-w-xl">
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-cream/70 md:text-cream/90 mb-6">
              Built by operators, for operators
            </p>

            <h1
              id="hero-headline"
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-cream leading-[1.05] tracking-tight mb-6"
            >
              Use OTAs for discovery.
              <br />
              Run the rest like a business.
            </h1>

            <p className="font-sans text-base md:text-lg text-cream/90 leading-relaxed">
              We&rsquo;re operators who got tired of running our portfolios on
              duct tape. So we built the systems, training, services, and
              software we wished existed for our properties and vehicle rental
              businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Full-width image — natural 3:2, capped on very wide screens.
          On mobile it appears below the text block; on md+ the text overlays it. */}
      <div className="relative w-full aspect-[3/2] max-h-[760px] overflow-hidden">
        <Image
          src="/images/Website Images/image2.png"
          alt="Della and Alex Henry in front of an Atlanta skyline at golden hour"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Scrim only when text overlays (md+) */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block bg-gradient-to-r from-black/70 via-black/35 to-transparent"
        />
        {/* Bottom fade — softens the image edge into the section's near-black bg */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-b from-transparent to-near-black"
        />
      </div>
    </section>
  );
}
