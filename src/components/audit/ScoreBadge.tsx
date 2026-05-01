import type { LetterGrade } from "@/lib/types/audit";

interface ScoreBadgeProps {
  score: number;
  grade: LetterGrade;
  size?: "lg" | "md" | "sm";
}

function gradeColor(grade: LetterGrade): string {
  if (grade === "A") return "text-[#2D8A6E]";
  if (grade === "B" || grade === "C") return "text-warm-gold";
  return "text-terracotta";
}

function gradeBg(grade: LetterGrade): string {
  if (grade === "A") return "bg-[#2D8A6E]/10 border-[#2D8A6E]/30";
  if (grade === "B" || grade === "C") return "bg-warm-gold/10 border-warm-gold/30";
  return "bg-terracotta/10 border-terracotta/30";
}

export default function ScoreBadge({ score, grade, size = "md" }: ScoreBadgeProps) {
  const sizes = {
    lg: { wrap: "w-32 h-32 md:w-40 md:h-40", num: "text-5xl md:text-6xl", grade: "text-xl md:text-2xl", label: "text-xs" },
    md: { wrap: "w-24 h-24", num: "text-3xl", grade: "text-base", label: "text-[10px]" },
    sm: { wrap: "w-16 h-16", num: "text-xl", grade: "text-sm", label: "text-[9px]" },
  };
  const s = sizes[size];
  return (
    <div
      className={[
        "inline-flex flex-col items-center justify-center rounded-full border-2",
        s.wrap,
        gradeBg(grade),
      ].join(" ")}
      aria-label={`Score ${score} out of 100, grade ${grade}`}
    >
      <span className={["font-display font-semibold leading-none text-near-black", s.num].join(" ")}>
        {score}
      </span>
      <span className="text-charcoal/50 text-[10px] mt-0.5 tracking-wide">/ 100</span>
      <span className={["font-semibold mt-1", s.grade, gradeColor(grade)].join(" ")}>
        {grade}
      </span>
    </div>
  );
}
