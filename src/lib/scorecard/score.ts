import {
  SCORECARD_MAX_SCORE,
  SCORECARD_SECTIONS,
  type ScorecardSectionId,
} from "./questions";

export type ScorecardBand = "high" | "moderate" | "low";

export type ScorecardAnswers = Record<string, boolean>;

export type SectionScores = Record<ScorecardSectionId, number>;

export interface ComputedScorecard {
  sectionScores: SectionScores;
  overallScore: number;
  maxScore: number;
  normalized: number;
  band: ScorecardBand;
}

const HIGH_THRESHOLD = 0.8;
const MODERATE_THRESHOLD = 0.6;

export function bandFor(normalized: number): ScorecardBand {
  if (normalized >= HIGH_THRESHOLD) return "high";
  if (normalized >= MODERATE_THRESHOLD) return "moderate";
  return "low";
}

export function computeScorecard(answers: ScorecardAnswers): ComputedScorecard {
  const sectionScores = {} as SectionScores;
  let overall = 0;

  for (const section of SCORECARD_SECTIONS) {
    const yesCount = section.questions.reduce(
      (acc, q) => acc + (answers[q.id] === true ? 1 : 0),
      0,
    );
    const ratio = section.questions.length > 0
      ? yesCount / section.questions.length
      : 0;
    const score = round2(ratio * section.weight);
    sectionScores[section.id] = score;
    overall += score;
  }

  const overallScore = round2(overall);
  const normalized = SCORECARD_MAX_SCORE > 0
    ? overallScore / SCORECARD_MAX_SCORE
    : 0;

  return {
    sectionScores,
    overallScore,
    maxScore: SCORECARD_MAX_SCORE,
    normalized,
    band: bandFor(normalized),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
