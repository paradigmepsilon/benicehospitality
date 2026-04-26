interface SignalBrandMarkProps {
  light?: boolean;
  className?: string;
}

export default function SignalBrandMark({ light = false, className = "" }: SignalBrandMarkProps) {
  return (
    <span
      className={[
        "inline-flex items-baseline gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-script text-6xl leading-none text-terracotta">
        Signal
      </span>
      <span
        className={[
          "font-display text-2xl tracking-tight",
          light ? "text-white" : "text-near-black",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        by BNHG
      </span>
    </span>
  );
}
