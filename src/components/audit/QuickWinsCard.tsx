import type { QuickWin } from "@/lib/types/audit";

interface QuickWinsCardProps {
  wins: [QuickWin, QuickWin, QuickWin];
}

const EFFORT_LABEL: Record<QuickWin["effort"], string> = {
  this_week: "This Week",
  this_month: "This Month",
  this_quarter: "This Quarter",
};

const PILLAR_LABEL: Record<QuickWin["pillar"], string> = {
  commercial: "Commercial",
  guest_experience: "Guest Experience",
  tech: "Tech",
};

export default function QuickWinsCard({ wins }: QuickWinsCardProps) {
  return (
    <div className="bg-near-black text-white rounded-lg p-6 md:p-8 flex flex-col gap-5 h-full">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warm-gold/20 text-warm-gold">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </span>
        <h3 className="font-display text-xl md:text-2xl font-semibold">Quick Wins</h3>
      </div>
      <p className="text-white/60 text-sm leading-relaxed">
        The three highest-impact, lowest-friction actions across your seven dimensions.
      </p>

      <ol className="space-y-4 flex-1">
        {wins.map((w, i) => (
          <li key={i} className="border-l-2 border-warm-gold/40 pl-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-display text-warm-gold font-semibold text-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded">
                {EFFORT_LABEL[w.effort]}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded">
                {PILLAR_LABEL[w.pillar]}
              </span>
            </div>
            <h4 className="font-semibold text-white mb-1">{w.title}</h4>
            <p className="text-sm text-white/70 leading-relaxed mb-1.5">
              <span className="text-white/50">Finding: </span>
              {w.finding}
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              <span className="text-white/50">Action: </span>
              {w.action}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
