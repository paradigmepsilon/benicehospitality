interface SectionLabelProps {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}

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
          ? "text-warm-gold"
          : "text-primary-green",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
