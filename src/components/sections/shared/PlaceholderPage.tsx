import Image from "next/image";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import EmailCaptureForm from "@/components/forms/EmailCaptureForm";
import type { StockImage } from "@/lib/stock-images";

export interface PlaceholderBullet {
  title: string;
  body: string;
}

interface PlaceholderPageProps {
  /** Top eyebrow label, all caps. */
  eyebrow: string;
  /** Hero H1. Keep it short. */
  headline: string;
  /** One or two sentences below the H1. */
  intro: string;
  /** Three to five bullets that earn the visit. */
  bullets: PlaceholderBullet[];
  /** Newsletter source string. Goes into newsletter_subscribers.source. */
  emailSource: string;
  /** Heading above the email capture. */
  captureHeading: string;
  /** Helper line under the email field. */
  captureHelper: string;
  /** Confirmation copy after submit. */
  captureSuccess?: string;
  /** Optional secondary CTA shown below the capture. */
  secondaryCta?: { label: string; href: string };
  /** Optional small footer note about timing or status. */
  statusNote?: string;
  /** Optional hero background image. Renders behind the dark hero with a tinted overlay. */
  heroImage?: StockImage;
}

/**
 * Shared layout for the new routes the redesign introduces. Each page ships
 * with real positioning, an email capture, and a clear next step so the URL
 * is useful from day one even before the full content lands.
 */
export default function PlaceholderPage({
  eyebrow,
  headline,
  intro,
  bullets,
  emailSource,
  captureHeading,
  captureHelper,
  captureSuccess,
  secondaryCta,
  statusNote,
  heroImage,
}: PlaceholderPageProps) {
  return (
    <>
      <AnimatedSection theme="dark" className="relative pt-32 pb-20 px-6 overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={heroImage.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-near-black/70 via-near-black/80 to-near-black" />
          </div>
        )}
        <div className="relative max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>{eyebrow}</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-6 leading-[1.1]">
              {headline}
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed">{intro}</p>
          </AnimatedItem>
          {statusNote && (
            <AnimatedItem>
              <p className="mt-6 font-sans text-xs text-warm-gold/80 uppercase tracking-[0.2em]">
                {statusNote}
              </p>
            </AnimatedItem>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection theme="off-white" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {bullets.map((b, i) => (
              <AnimatedItem key={b.title}>
                <div>
                  <p className="font-display text-warm-gold text-sm font-semibold mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-near-black mb-2 leading-tight">
                    {b.title}
                  </h2>
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                    {b.body}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection theme="light" className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mb-4 leading-tight">
              {captureHeading}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/70 mb-8 leading-relaxed">
              {captureHelper}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="max-w-md mx-auto">
              <EmailCaptureForm
                source={emailSource}
                variant="card"
                buttonLabel="Notify Me"
                placeholder="you@yourbusiness.com"
                helperText="We'll send the announcement once. No spam, no follow-up sequence."
                successMessage={captureSuccess ?? "You're on the list. We'll be in touch."}
              />
            </div>
          </AnimatedItem>
          {secondaryCta && (
            <AnimatedItem>
              <p className="mt-8 font-sans text-sm text-charcoal/60">
                Or{" "}
                <Link
                  href={secondaryCta.href}
                  className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
                >
                  {secondaryCta.label}
                </Link>
                .
              </p>
            </AnimatedItem>
          )}
        </div>
      </AnimatedSection>
    </>
  );
}
