import Image from "next/image";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

/**
 * The hero every offering door shares: /co-living, /fleet, /boutique-stays, and
 * /signal. Extracted from the /signal hero, which is the approved reference.
 *
 * Two things make it a shared component rather than four copies:
 *
 * 1. HEIGHT IS LOCKED. The original was padding-driven, so its height followed
 *    copy length and four pages would silently drift apart. The min-h floor plus
 *    `items-center` means every door renders at exactly the same height as long
 *    as the copy stays inside it — which is why `message` is one short
 *    paragraph and not the two the Signal hero used to carry.
 *
 * 2. THE OVERLAY IS LANE-TINTED. The gradient's final stop reads --lane-accent,
 *    so co-living lands red, fleet blue, boutique gold, with no per-page CSS.
 *    Must therefore be rendered inside a <LaneSection>; outside one the mix
 *    falls back to deep teal and it still renders correctly.
 */

interface HeroCta {
  label: string;
  href: string;
  /** Rare: fleet's primary CTA opens a waitlist modal instead of navigating. */
  render?: (label: string) => ReactNode;
}

interface OfferingHeroProps {
  eyebrow: string;
  /** Headline text. Split around `accentWord` to italicize the middle phrase. */
  headline: string;
  accentWord?: string;
  headlineTail?: string;
  /** One short paragraph. Keep it short — it is what holds the height lock. */
  message: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  image: { src: string; alt: string };
  /** Small italic line under the CTAs, e.g. "45 minutes. No sales theater." */
  note?: string;
}

export default function OfferingHero({
  eyebrow,
  headline,
  accentWord,
  headlineTail,
  message,
  primaryCta,
  secondaryCta,
  image,
  note,
}: OfferingHeroProps) {
  return (
    // The min-h values are deliberately set ABOVE the tallest content at each
    // breakpoint (measured: 738px mobile on /fleet, which stacks two CTAs and
    // carries the longest message). That is what makes the lock real — the
    // floor drives the height, not the copy, so no page drifts when its
    // headline wraps differently. Re-measure if copy grows materially.
    <section className="relative flex items-center min-h-186 md:min-h-176 lg:min-h-180 bg-near-black pt-32 md:pt-36 pb-16 md:pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
        style={{ filter: "saturate(0.9) contrast(1.05)" }}
      />
      {/* The scrim is asymmetric on purpose. It stays dark at the top-left,
          where the headline and CTAs sit, and thins out toward the bottom-right
          so the photograph is actually legible. The previous version opened on
          fully opaque near-black, which buried the image everywhere. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-near-black/85 via-near-black/60 to-[color-mix(in_oklab,var(--lane-accent,var(--color-deep-teal))_35%,transparent)]"
      />

      <div className="relative z-10 max-w-4xl">
        <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.35em] uppercase text-(--lane-accent-on-dark,var(--color-warm-gold)) mb-5 md:mb-7">
          {eyebrow}
        </p>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.02] tracking-tight mb-6 md:mb-8 max-w-4xl">
          {headline}
          {accentWord && (
            <>
              {" "}
              <span className="italic text-(--lane-accent-on-dark,var(--color-warm-gold))">
                {accentWord}
              </span>
            </>
          )}
          {headlineTail ? ` ${headlineTail}` : null}
        </h1>

        <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-8 md:mb-10 max-w-2xl">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {primaryCta.render ? (
            primaryCta.render(primaryCta.label)
          ) : (
            <Button href={primaryCta.href} variant="primary" size="lg">
              {primaryCta.label}
            </Button>
          )}
          {secondaryCta &&
            (secondaryCta.render ? (
              secondaryCta.render(secondaryCta.label)
            ) : (
              <Button href={secondaryCta.href} variant="light" size="lg">
                {secondaryCta.label}
              </Button>
            ))}
        </div>

        {note && (
          <p className="font-sans text-sm text-white/55 mt-6 italic">{note}</p>
        )}
      </div>
    </section>
  );
}
