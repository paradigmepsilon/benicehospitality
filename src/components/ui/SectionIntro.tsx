import type { ReactNode } from "react";

interface SectionIntroProps {
  /** The section's name, sentence case. Sits on the rule that opens the section. */
  label: string;
  heading: ReactNode;
  /** Supporting paragraph set under the heading. */
  lede?: ReactNode;
  /** Supporting line set to the right of the heading on wide screens. */
  aside?: ReactNode;
  /** An element (a button) set to the right of the heading. */
  action?: ReactNode;
  dark?: boolean;
  className?: string;
}

/**
 * The opener every home page section shares. A rule with the section's name
 * on it marks the break in thought; the heading below states the new message.
 * The curved dividers and alternating grounds between sections do the rest.
 */
export default function SectionIntro({
  label,
  heading,
  lede,
  aside,
  action,
  dark = false,
  className = "",
}: SectionIntroProps) {
  return (
    <div className={["mb-8 md:mb-10", className].join(" ")}>
      <div className="flex items-center gap-4 mb-5 md:mb-6">
        <span
          className={[
            "font-sans text-base md:text-lg font-semibold shrink-0",
            dark ? "text-warm-gold-dark" : "text-warm-gold",
          ].join(" ")}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={["h-px flex-1", dark ? "bg-white/20" : "bg-warm-gold/40"].join(" ")}
        />
      </div>
      <div
        className={[
          "grid gap-5",
          aside ? "lg:grid-cols-[1.2fr_1fr] lg:items-end" : "",
          action ? "sm:grid-cols-[1fr_auto] sm:items-end" : "",
        ].join(" ")}
      >
        <div>
          <h2
            className={[
              "font-display text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold leading-[1.02] tracking-tight text-balance",
              aside ? "" : "max-w-5xl",
              dark ? "text-white" : "text-deep-teal",
            ].join(" ")}
          >
            {heading}
          </h2>
          {lede && (
            <p
              className={[
                "font-sans text-lg md:text-xl leading-relaxed mt-5 max-w-2xl",
                dark ? "text-white/80" : "text-charcoal/80",
              ].join(" ")}
            >
              {lede}
            </p>
          )}
        </div>
        {aside && (
          <p
            className={[
              "font-sans text-lg leading-snug lg:max-w-md lg:justify-self-end",
              dark ? "text-white/80" : "text-charcoal/80",
            ].join(" ")}
          >
            {aside}
          </p>
        )}
        {action && <div className="sm:justify-self-end">{action}</div>}
      </div>
    </div>
  );
}
