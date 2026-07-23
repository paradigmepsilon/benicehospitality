interface SectionLabelProps {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}

/**
 * The eyebrow. Inside a <LaneSection> this picks up the lane's accent; anywhere
 * else the CSS fallback keeps the original teal/gold. Lane identity lives at
 * the smallest type size on the page while the display type stays on the house
 * palette everywhere — that's what keeps three verticals from fragmenting the
 * site. See src/lib/lanes.ts.
 */
export default function SectionLabel({
  children,
  light = false,
  className = "",
}: SectionLabelProps) {
  return (
    <p
      className={[
        "text-xs font-semibold tracking-[0.2em] uppercase font-sans mb-4",
        light
          ? "text-(--lane-accent-on-dark,var(--color-warm-gold))"
          : "text-(--lane-accent,var(--color-primary-green))",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
