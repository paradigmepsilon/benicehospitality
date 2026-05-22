/**
 * Visual placeholder for imagery that has not been shot or uploaded yet.
 * Renders a clearly labeled gray block so the team can spot unfilled slots
 * during review. Drop in `<Image>` (next/image) to swap.
 *
 * Usage:
 *   <PlaceholderImage label="Della" aspect="portrait" rounded="full" />
 *   <PlaceholderImage label="Founder photo" aspect="landscape" />
 */

type Aspect = "square" | "portrait" | "landscape" | "auto";
type Rounded = "none" | "md" | "lg" | "full";

interface PlaceholderImageProps {
  /** Short label rendered inside the placeholder (e.g. "Della", "Founder photo"). */
  label: string;
  /** Aspect ratio. "auto" lets the parent control sizing. */
  aspect?: Aspect;
  /** Corner rounding. */
  rounded?: Rounded;
  /** Optional supplementary line under the label. */
  hint?: string;
  className?: string;
}

const ASPECT_CLASSES: Record<Aspect, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[16/9]",
  auto: "",
};

const ROUNDED_CLASSES: Record<Rounded, string> = {
  none: "",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export default function PlaceholderImage({
  label,
  aspect = "auto",
  rounded = "md",
  hint,
  className = "",
}: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder image)`}
      className={[
        "relative overflow-hidden bg-gradient-to-br from-charcoal/15 to-charcoal/30",
        "flex flex-col items-center justify-center text-center px-3",
        "border border-dashed border-charcoal/25",
        ASPECT_CLASSES[aspect],
        ROUNDED_CLASSES[rounded],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        className="w-6 h-6 text-charcoal/40 mb-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/65 leading-tight">
        {label}
      </p>
      {hint && (
        <p className="font-sans text-[10px] text-charcoal/50 mt-0.5 leading-tight">
          {hint}
        </p>
      )}
    </div>
  );
}
