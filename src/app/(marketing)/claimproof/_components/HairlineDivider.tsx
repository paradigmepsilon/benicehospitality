/**
 * HairlineDivider — a short centered gold rule that sits between two
 * same-colored sections so they read as distinct rather than merging into
 * one continuous block. `bg` should match the surrounding section color.
 */
export default function HairlineDivider({ bg }: { bg: string }) {
  return (
    <div className={`${bg} flex justify-center`}>
      <span className="h-px w-24 bg-gradient-to-r from-transparent via-warm-gold to-transparent" />
    </div>
  );
}
