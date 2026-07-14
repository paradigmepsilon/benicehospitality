import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import ScorecardReport from "@/components/sections/scorecard/ScorecardReport";
import type { ScorecardBand } from "@/lib/scorecard/score";
import type { ScorecardSectionId } from "@/lib/scorecard/questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Your Co-living Property Calculator | BNHG" },
  robots: { index: false, follow: false },
};

type ScorecardRow = {
  id: number;
  token: string;
  property_nickname: string | null;
  answers: Record<string, boolean>;
  section_scores: Record<ScorecardSectionId, number | string>;
  overall_score: string | number;
  band: ScorecardBand;
  status: "pending_capture" | "unlocked";
  created_at: string;
};

export default async function ScorecardResultsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const rows = (await sql`
    SELECT id, token, property_nickname, answers, section_scores,
           overall_score, band, status, created_at
    FROM viability_scorecards
    WHERE token = ${token}
    LIMIT 1
  `) as ScorecardRow[];

  if (rows.length === 0) notFound();
  const sc = rows[0];
  if (sc.status !== "unlocked") notFound();

  const sectionScoresNumeric: Record<ScorecardSectionId, number> =
    Object.fromEntries(
      Object.entries(sc.section_scores).map(([k, v]) => [k, Number(v)]),
    ) as Record<ScorecardSectionId, number>;

  return (
    <ScorecardReport
      propertyNickname={sc.property_nickname || "Your property"}
      overallScore={Number(sc.overall_score)}
      band={sc.band}
      sectionScores={sectionScoresNumeric}
      answers={sc.answers}
      createdAt={sc.created_at}
    />
  );
}
