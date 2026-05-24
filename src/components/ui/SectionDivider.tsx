interface SectionDividerProps {
  /** Hex color of the section above (fills the area above the curve). */
  fromColor: string;
  /** Hex color of the section below (fills the area below the curve). */
  toColor: string;
  /** Mirror the curve horizontally, used to alternate direction between dividers. */
  flip?: boolean;
}

export default function SectionDivider({
  fromColor,
  toColor,
  flip = false,
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
        className="block w-full h-10 md:h-16 lg:h-20"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <path
          d="M0,0 C360,80 1080,0 1440,50 L1440,80 L0,80 Z"
          fill={toColor}
        />
      </svg>
    </div>
  );
}
