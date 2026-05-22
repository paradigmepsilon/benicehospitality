import { Check } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface CTA {
  label: string;
  href: string;
}

interface CourseHeroProps {
  eyebrow: string;
  headline: React.ReactNode;
  body: React.ReactNode;
  primaryCta?: CTA;
  secondaryCta?: CTA;
  previewTitle?: string;
  previewItems?: string[];
  /** Optional full-bleed background. When set, the hero renders dark with light text. */
  backgroundImage?: { src: string; alt: string };
}

export default function CourseHero({
  eyebrow,
  headline,
  body,
  primaryCta,
  secondaryCta,
  previewTitle,
  previewItems,
  backgroundImage,
}: CourseHeroProps) {
  const hasPreview = Boolean(
    previewTitle && previewItems && previewItems.length > 0
  );
  const hasCtas = Boolean(primaryCta || secondaryCta);
  const hasImage = Boolean(backgroundImage);

  return (
    <section
      className={[
        "relative overflow-hidden px-6 md:px-12 lg:px-20",
        hasImage
          ? "bg-near-black pt-32 md:pt-40 lg:pt-44 pb-24 md:pb-28"
          : "bg-cream pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-20 lg:pb-24",
      ].join(" ")}
    >
      {hasImage && backgroundImage && (
        <>
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-near-black/85 via-near-black/65 to-near-black/30"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-near-black/40 via-transparent to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-near-black/70 to-near-black pointer-events-none"
          />
        </>
      )}

      <div className="relative w-full">
        <div
          className={[
            "grid grid-cols-1 gap-10 lg:gap-16 items-start",
            hasPreview ? "lg:grid-cols-12" : "",
          ].join(" ")}
        >
          <div className={hasPreview ? "lg:col-span-7" : ""}>
            <p
              className={[
                "font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-6 md:mb-8",
                hasImage ? "text-warm-gold" : "text-charcoal/70",
              ].join(" ")}
            >
              {eyebrow}
            </p>
            <h1
              className={[
                "font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight mb-6 md:mb-8",
                hasImage ? "text-white" : "text-deep-teal",
              ].join(" ")}
            >
              {headline}
            </h1>
            <p
              className={[
                "font-sans text-lg md:text-xl leading-relaxed max-w-2xl",
                hasCtas ? "mb-8 md:mb-10" : "",
                hasImage ? "text-cream/90" : "text-charcoal",
              ].join(" ")}
            >
              {body}
            </p>
            {hasCtas && (
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryCta && (
                  <Button href={primaryCta.href} variant="primary" size="lg">
                    {primaryCta.label}
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    href={secondaryCta.href}
                    variant={hasImage ? "light" : "secondary"}
                    size="lg"
                  >
                    {secondaryCta.label}
                  </Button>
                )}
              </div>
            )}
          </div>

          {hasPreview && (
            <div className="lg:col-span-5">
              <div className="relative bg-white border border-warm-gold/40 rounded-lg p-7 md:p-8 lg:p-10 shadow-sm overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-warm-gold/8 via-transparent to-deep-teal/8 pointer-events-none"
                  aria-hidden
                />
                <div className="relative">
                  <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-deep-teal mb-6">
                    {previewTitle}
                  </p>
                  <ul className="space-y-4">
                    {previewItems!.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-deep-teal/10 flex items-center justify-center"
                        >
                          <Check
                            className="w-3 h-3 text-deep-teal"
                            strokeWidth={3}
                          />
                        </span>
                        <span className="font-sans text-base text-charcoal leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
