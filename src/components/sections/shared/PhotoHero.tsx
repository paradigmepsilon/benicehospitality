import Image from "next/image";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

interface HeroCta {
  label: string;
  href: string;
}

interface PhotoHeroProps {
  /** Short sentence-case line above the headline, e.g. "Resource library". */
  eyebrow?: string;
  headline: ReactNode;
  lede?: ReactNode;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  image: { src: string; alt: string; position?: string };
  /** Optional content for the right-hand side of the panel (glass cards). */
  aside?: ReactNode;
  /** Small line under the CTAs. */
  note?: ReactNode;
  /** Shorter panel for secondary surfaces. */
  compact?: boolean;
  /**
   * Ground colour of the section that follows. The hero draws the curved
   * divider into it, so every page opens the same way. Pass `null` when the
   * page renders its own divider.
   */
  dividerTo?: string | null;
}

/**
 * The framed photo hero every primary surface opens with. The panel is inset
 * from the viewport by the page gutter so the photograph reads as an object on
 * the cream page rather than the page itself, which is what lets the floating
 * header sit over it without a solid bar.
 *
 * Text is bottom-left, on a scrim that only darkens the side the text is on.
 * The right side is left for the photograph, or for `aside`.
 */
export default function PhotoHero({
  eyebrow,
  headline,
  lede,
  primaryCta,
  secondaryCta,
  image,
  aside,
  note,
  compact = false,
  dividerTo = C.cream,
}: PhotoHeroProps) {
  return (
    <>
    <section className="bg-cream px-3 md:px-5 pt-24 md:pt-28">
      <div
        className={[
          "relative overflow-hidden rounded-panel bg-near-black text-white",
          "flex items-end",
          compact
            ? "min-h-[460px] md:min-h-[520px]"
            : "min-h-[560px] md:min-h-[620px] lg:min-h-[680px]",
        ].join(" ")}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          quality={90}
          className={["object-cover", image.position ?? "object-center"].join(" ")}
          style={{ filter: "saturate(0.9) contrast(1.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-near-black/85 via-near-black/45 to-near-black/10"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-near-black/70 to-transparent"
        />

        <div className="relative z-10 w-full p-6 sm:p-8 md:p-12 lg:p-14 grid gap-8 lg:grid-cols-[1.4fr_minmax(0,1fr)] lg:items-end">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="font-sans text-sm md:text-base font-medium text-white/80 mb-4 md:mb-5">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold leading-[1.02] tracking-tight">
              {headline}
            </h1>
            {lede && (
              <p className="font-sans text-base md:text-lg text-white/85 leading-relaxed mt-5 md:mt-6 max-w-xl">
                {lede}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap gap-3 mt-7 md:mt-8">
                {primaryCta && (
                  <Button href={primaryCta.href} variant="primary" size="md" arrow>
                    {primaryCta.label}
                  </Button>
                )}
                {secondaryCta && (
                  <Button href={secondaryCta.href} variant="ghost" size="md">
                    {secondaryCta.label}
                  </Button>
                )}
              </div>
            )}
            {note && (
              <p className="font-sans text-sm text-white/60 mt-5">{note}</p>
            )}
          </div>
          {aside && <div className="lg:justify-self-end w-full lg:max-w-sm">{aside}</div>}
        </div>
      </div>
    </section>
    {dividerTo && <SectionDivider fromColor={C.cream} toColor={dividerTo} />}
    </>
  );
}
