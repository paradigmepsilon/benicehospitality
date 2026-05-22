import Image from "next/image";

interface HeroImageBandProps {
  src: string;
  alt: string;
}

/**
 * Wide editorial image band that flows directly under a centered hero. The
 * hero supplies its own top + bottom padding; this component supplies its own
 * bottom padding to space the next section. Renders via next/image — add new
 * hostnames in next.config.ts before sourcing from a new provider.
 */
export default function HeroImageBand({ src, alt }: HeroImageBandProps) {
  return (
    <section className="bg-cream pb-12 md:pb-16 lg:pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative aspect-[16/10] md:aspect-[3/1] overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
