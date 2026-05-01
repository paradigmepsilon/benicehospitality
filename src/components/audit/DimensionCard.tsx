import type { DimensionScore, LetterGrade } from "@/lib/types/audit";

interface DimensionCardProps {
  title: string;
  data: DimensionScore;
  note?: string;
}

function gradeColors(grade: LetterGrade) {
  if (grade === "A") return { text: "text-[#2D8A6E]", bg: "bg-[#2D8A6E]/10", bar: "bg-[#2D8A6E]" };
  if (grade === "B" || grade === "C") return { text: "text-warm-gold-dark", bg: "bg-warm-gold/15", bar: "bg-warm-gold" };
  return { text: "text-terracotta", bg: "bg-terracotta/10", bar: "bg-terracotta" };
}

export default function DimensionCard({ title, data, note }: DimensionCardProps) {
  const c = gradeColors(data.grade);
  return (
    <div className="bg-white border border-light-gray rounded-lg p-6 flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg md:text-xl font-semibold text-near-black leading-tight">
          {title}
        </h3>
        <span
          className={[
            "inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm shrink-0",
            c.bg,
            c.text,
          ].join(" ")}
          aria-label={`Grade ${data.grade}`}
        >
          {data.grade}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-display text-2xl md:text-3xl font-semibold text-near-black">
            {data.subscore}
          </span>
          <span className="text-charcoal/50 text-sm">/ 100</span>
        </div>
        <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden">
          <div
            className={["h-full rounded-full", c.bar].join(" ")}
            style={{ width: `${data.subscore}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <ul className="space-y-2 mt-1">
        {data.findings.map((finding, i) => (
          <li key={i} className="flex gap-2 text-sm text-charcoal leading-relaxed">
            <span className="text-warm-gold mt-1.5 shrink-0" aria-hidden="true">
              <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                <circle cx="3" cy="3" r="3" />
              </svg>
            </span>
            <span>{finding}</span>
          </li>
        ))}
      </ul>

      {note && (
        <p className="text-xs text-charcoal/60 italic mt-auto pt-2 border-t border-light-gray">
          {note}
        </p>
      )}
    </div>
  );
}
