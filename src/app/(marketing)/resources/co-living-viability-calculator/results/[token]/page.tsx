import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentSession } from "@/lib/community-auth";
import { memberOwnsScorecard } from "@/lib/scorecard/saved";
import ScorecardReport from "@/components/sections/scorecard/ScorecardReport";
import type { ScorecardBand } from "@/lib/scorecard/score";
import type { ScorecardSectionId } from "@/lib/scorecard/questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Your Co-living Viability Calculator | BNHG" },
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

  // The report itself stays public and token-addressed — this only tells a
  // signed-in owner where to find it again. Anonymous viewers and members
  // opening someone else's shared link see the report unchanged.
  const session = await getCurrentSession();
  const saved = session
    ? await memberOwnsScorecard(session.user.id, session.user.email, token)
    : false;

  return (
    <>
      {saved && (
        <div className="bg-primary-green/10 border-b border-primary-green/25 px-6 py-3 print:hidden">
          <p className="max-w-5xl mx-auto font-sans text-sm text-charcoal/85">
            Saved to your dashboard.{" "}
            <Link
              href="/account/resources/scorecards"
              className="font-semibold text-primary-green hover:text-primary-green-dark"
            >
              See every property you&apos;ve scored →
            </Link>
          </p>
        </div>
      )}
      <ScorecardReport
        propertyNickname={sc.property_nickname || "Your property"}
        overallScore={Number(sc.overall_score)}
        band={sc.band}
        sectionScores={sectionScoresNumeric}
        answers={sc.answers}
        createdAt={sc.created_at}
      />
    </>
  );
}
