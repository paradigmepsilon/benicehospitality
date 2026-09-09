interface SectionDividerProps {
  /** Hex color of the section above (fills the area above the curve). */
  fromColor: string;
  /** Hex color of the section below (fills the area below the curve). */
  toColor: string;
  /** Mirror the curve horizontally, used to alternate direction between dividers. */
  flip?: boolean;
  /** Curve height. Tall by default; "md" is the older, quieter curve. */
  size?: "md" | "lg";
  /**
   * Hex color of a line drawn along the curve itself, warm gold by default.
   * Two near-identical grounds (white and cream) need it for the edge to
   * read as a border. Pass `null` to draw the curve with no line.
   */
  stroke?: string | null;
}

// Mirrors --color-warm-gold in globals.css (see src/lib/section-colors.ts).
const DEFAULT_STROKE = "#B08D57";

const CURVE = "M0,0 C360,80 1080,0 1440,50";

export default function SectionDivider({
  fromColor,
  toColor,
  flip = false,
  size = "lg",
  stroke = DEFAULT_STROKE,
}: SectionDividerProps) {
  return (
    <div
      className="w-full leading-[0]"
      style={{ backgroundColor: fromColor }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={[
          "block w-full",
          size === "lg" ? "h-14 md:h-24 lg:h-28" : "h-10 md:h-16 lg:h-20",
        ].join(" ")}
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <path d={`${CURVE} L1440,80 L0,80 Z`} fill={toColor} />
        {stroke && (
          <path
            d={CURVE}
            fill="none"
            stroke={stroke}
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
