"use client";

import { useState } from "react";
import type { AuditData, LetterGrade } from "@/lib/types/audit";
import ScoreBadge from "@/components/audit/ScoreBadge";
import EmailGate from "@/components/audit/EmailGate";
import AuditReport from "@/components/audit/AuditReport";

interface AuditPageClientProps {
  token: string;
  hotelName: string;
  hotelLocation: string | null;
  overallScore: number;
  overallGrade: LetterGrade;
  generatedAt: string;
}

function formatGeneratedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AuditPageClient({
  token,
  hotelName,
  hotelLocation,
  overallScore,
  overallGrade,
  generatedAt,
}: AuditPageClientProps) {
  const [unlocked, setUnlocked] = useState<AuditData | null>(null);

  return (
    <div className="bg-off-white min-h-[calc(100vh-200px)]">
      {/* Hero band — visible in both states for stable layout */}
      <section className="bg-near-black text-white py-12 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
            <div className="flex-1">
              <p className="text-warm-gold text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                Tier 0 Comprehensive Audit
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-3">
                {hotelName}
              </h1>
              {hotelLocation && (
                <p className="text-white/70 text-base md:text-lg mb-2">{hotelLocation}</p>
              )}
              <p className="text-white/40 text-sm">
                Generated {formatGeneratedAt(generatedAt)}
              </p>
              {unlocked && (
                <p className="text-white/80 text-base md:text-lg mt-6 leading-relaxed max-w-2xl">
                  {unlocked.overall.summary}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <ScoreBadge score={overallScore} grade={overallGrade} size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {unlocked ? (
            <AuditReport token={token} data={unlocked} />
          ) : (
            <EmailGate
              token={token}
              hotelName={hotelName}
              onUnlock={(data) => setUnlocked(data)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
