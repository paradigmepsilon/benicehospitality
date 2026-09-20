import type {
  DocAudience,
  SectionStatusKey,
  StepOwner,
  VerdictKey,
} from "@/lib/partnership/journey";

export const VERDICT_BADGE: Record<VerdictKey, string> = {
  go: "bg-[#5b9a2f]/15 text-[#2d4f15] border-[#5b9a2f]/45",
  adjust: "bg-[#f5a623]/15 text-[#8a6215] border-[#f5a623]/40",
  no_go: "bg-[#c0674a]/12 text-[#8a4a32] border-[#c0674a]/35",
};

// One pip per section. Empty ring until it is sold, filling in as it moves.
export const SECTION_PIP: Record<SectionStatusKey, string> = {
  not_sold: "bg-white border-[#1a1a1a]/15 text-[#1a1a1a]/30",
  proposed: "bg-white border-[#f5a623] text-[#8a6215]",
  sold: "bg-[#1A4D4F]/10 border-[#1A4D4F]/50 text-[#1A4D4F]",
  in_progress: "bg-[#f5a623] border-[#f5a623] text-white",
  delivered: "bg-[#5b9a2f] border-[#5b9a2f] text-white",
};

export const OWNER_CHIP: Record<StepOwner, string> = {
  della: "bg-[#B08D57]/15 text-[#7a5e36]",
  alex: "bg-[#1A4D4F]/10 text-[#1A4D4F]",
  claude: "bg-[#1a1a1a]/5 text-[#1a1a1a]/60",
  client: "bg-[#8b5cf6]/10 text-[#5b3cc4]",
};

export const AUDIENCE_BADGE: Record<DocAudience, { label: string; className: string }> = {
  client: { label: "Client-facing", className: "bg-[#5b9a2f]/12 text-[#3d6a1f] border-[#5b9a2f]/30" },
  template: { label: "Template", className: "bg-[#B08D57]/15 text-[#7a5e36] border-[#B08D57]/40" },
  internal: { label: "Internal only", className: "bg-[#c0674a]/10 text-[#8a4a32] border-[#c0674a]/30" },
  agreement: { label: "Draft · attorney review", className: "bg-[#c0674a] text-white border-[#c0674a]" },
};

export function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Today as YYYY-MM-DD in the viewer's own timezone, to compare with DATE columns. */
export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "Sep 18", or "Sep 18, 2027" once the year is not this one (a No-go credit runs 12 months). */
export function shortDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function docHref(key: string): string {
  return `/api/admin/partnership/docs/${key}`;
}
