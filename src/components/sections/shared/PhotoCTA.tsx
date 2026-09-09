import Image from "next/image";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

interface Cta {
  label: string;
  href: string;
}

interface PhotoCTAProps {
  headline: ReactNode;
  body?: ReactNode;
  primary: Cta;
  secondary?: Cta;
  image: { src: string; alt: string; position?: string };
  /** Small line under the buttons, e.g. "Nothing is signed until the call." */
  note?: ReactNode;
  /**
   * Ground colour of the section before this band. The band draws the curved
   * divider out of it. Pass `null` when the page renders its own.
   */
  dividerFrom?: string | null;
}

/**
 * The full-bleed photo band that closes a page, from the yoga and nonprofit
 * pins. Headline left, buttons right, one photograph behind both. Sits on the
 * cream page as a rounded panel so it hands off cleanly to the dark footer.
 */
export default function PhotoCTA({
  headline,
  body,
  primary,
  secondary,
  image,
  note,
  dividerFrom = C.cream,
}: PhotoCTAProps) {
  return (
    <>
    {dividerFrom && <SectionDivider fromColor={dividerFrom} toColor={C.cream} flip />}
    <section className="bg-cream px-3 md:px-5 py-3 md:py-5">
      <div className="relative overflow-hidden rounded-panel bg-near-black text-white min-h-[420px] md:min-h-[480px] flex items-end">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className={["object-cover", image.position ?? "object-center"].join(" ")}
          style={{ filter: "saturate(0.9) contrast(1.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-near-black/90 via-near-black/50 to-near-black/20"
        />
        <div className="relative z-10 w-full p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
              {headline}
            </h2>
            {body && (
              <p className="font-sans text-base md:text-lg text-white/85 leading-relaxed mt-5 max-w-xl">
                {body}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start lg:items-end gap-4 shrink-0">
            <div className="flex flex-wrap gap-3">
              <Button href={primary.href} variant="primary" size="lg" arrow>
                {primary.label}
              </Button>
              {secondary && (
                <Button href={secondary.href} variant="ghost" size="lg">
                  {secondary.label}
                </Button>
              )}
            </div>
            {note && (
              <p className="font-sans text-sm text-white/60">{note}</p>
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
