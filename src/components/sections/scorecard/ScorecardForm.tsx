"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  SCORECARD_SECTIONS,
  type ScorecardSectionId,
} from "@/lib/scorecard/questions";
import EmailCaptureModal from "./EmailCaptureModal";

type Answers = Record<string, boolean>;

export default function ScorecardForm({
  initialNickname = "",
}: {
  initialNickname?: string;
}) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [propertyNickname, setPropertyNickname] = useState(initialNickname);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [visitedSections, setVisitedSections] = useState<Set<ScorecardSectionId>>(
    new Set([SCORECARD_SECTIONS[0].id]),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureToken, setCaptureToken] = useState<string | null>(null);

  const currentSection = SCORECARD_SECTIONS[currentSectionIdx];
  const isFirstSection = currentSectionIdx === 0;
  const isLastSection = currentSectionIdx === SCORECARD_SECTIONS.length - 1;
  const sectionCheckedCount = currentSection.questions.filter(
    (q) => answers[q.id],
  ).length;

  function toggleAnswer(questionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }

  function goToSection(idx: number) {
    if (idx < 0 || idx >= SCORECARD_SECTIONS.length) return;
    setCurrentSectionIdx(idx);
    setVisitedSections((prev) => {
      const next = new Set(prev);
      next.add(SCORECARD_SECTIONS[idx].id);
      return next;
    });
    // Scroll the wizard back to the top of the form on section change.
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const el = document.getElementById("scorecard-wizard");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  async function submitScorecard() {
    setError(null);

    const turnstileToken = turnstileRef.current?.getResponse();
    if (siteKey && !turnstileToken) {
      setError("Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const cleanedAnswers: Answers = {};
      for (const section of SCORECARD_SECTIONS) {
        for (const q of section.questions) {
          cleanedAnswers[q.id] = answers[q.id] === true;
        }
      }

      const res = await fetch("/api/scorecard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: cleanedAnswers,
          property_nickname: propertyNickname.trim() || undefined,
          turnstile_token: turnstileToken || "no-turnstile-configured",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Submission failed. Please try again.");
        turnstileRef.current?.reset();
        return;
      }

      const data = (await res.json()) as {
        token: string;
        requires_capture: boolean;
      };

      if (data.requires_capture) {
        setCaptureToken(data.token);
      } else {
        router.push(`/resources/mtr-viability-scorecard/results/${data.token}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const sectionProgressPct =
    ((currentSectionIdx + 1) / SCORECARD_SECTIONS.length) * 100;

  return (
    <>
      <div
        id="scorecard-wizard"
        className="space-y-6 scroll-mt-28"
      >
        {/* Property nickname (always visible) */}
        <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
          <label
            htmlFor="property-nickname"
            className="block font-sans text-sm font-semibold text-near-black mb-1.5"
          >
            What do you call this property? (optional)
          </label>
          <p className="font-sans text-xs text-charcoal/60 mb-3">
            We use this so your saved scorecard is easy to find later.
          </p>
          <input
            id="property-nickname"
            type="text"
            value={propertyNickname}
            onChange={(e) => setPropertyNickname(e.target.value)}
            placeholder="e.g. Smyrna Duplex, 123 Peachtree, Atlanta Triplex"
            maxLength={120}
            className="w-full border border-light-gray bg-white px-4 py-3 text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green rounded-md transition-colors"
          />
        </div>

        {/* How to use */}
        <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-4 sm:p-5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
            How this works
          </p>
          <p className="font-sans text-sm text-near-black leading-relaxed">
            Walk through one section at a time. <strong>Tick only what is true</strong> for this property. Anything you leave unchecked counts as a &ldquo;no.&rdquo; You can move between sections freely and submit whenever you&apos;re ready.
          </p>
        </div>

        {/* Top section nav */}
        <nav
          aria-label="Section navigation"
          className="bg-white border border-light-gray rounded-lg p-3 sm:p-4"
        >
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {SCORECARD_SECTIONS.map((section, idx) => {
              const isCurrent = idx === currentSectionIdx;
              const isVisited = visitedSections.has(section.id);
              const sectionChecks = section.questions.filter(
                (q) => answers[q.id],
              ).length;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(idx)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={[
                    "flex flex-col items-center justify-start gap-1 rounded-md py-2 px-1 sm:px-2 text-center transition-colors",
                    isCurrent
                      ? "bg-near-black text-white"
                      : isVisited
                        ? "bg-primary-green/5 text-near-black hover:bg-primary-green/10"
                        : "bg-off-white text-charcoal/70 hover:bg-light-gray",
                  ].join(" ")}
                  title={section.label}
                >
                  <span
                    className={[
                      "font-display font-semibold leading-none text-base sm:text-lg",
                      isCurrent ? "text-white" : "text-near-black",
                    ].join(" ")}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={[
                      "hidden sm:block font-sans text-[10px] font-medium tracking-wide leading-tight truncate w-full",
                      isCurrent ? "text-white/80" : "text-charcoal/70",
                    ].join(" ")}
                  >
                    {section.label.split(" & ")[0].split(" ")[0]}
                  </span>
                  {sectionChecks > 0 && (
                    <span
                      className={[
                        "font-sans text-[10px] font-semibold tabular-nums leading-none px-1.5 py-0.5 rounded-full",
                        isCurrent
                          ? "bg-warm-gold text-near-black"
                          : "bg-primary-green/15 text-primary-green",
                      ].join(" ")}
                    >
                      {sectionChecks}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Current section */}
        <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-light-gray">
            <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
              Section {currentSectionIdx + 1} of {SCORECARD_SECTIONS.length}
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-near-black leading-tight">
              {currentSection.label}
            </h3>
            <p className="font-sans text-sm text-charcoal/70 mt-1.5">
              {currentSection.blurb}
            </p>
            {sectionCheckedCount > 0 && (
              <p className="font-sans text-xs text-charcoal/60 mt-3 tabular-nums">
                {sectionCheckedCount} of {currentSection.questions.length} ticked in this section.
              </p>
            )}
          </div>

          <div className="bg-off-white/40 px-5 sm:px-6 py-4 space-y-2">
            {currentSection.questions.map((q) => {
              const checked = answers[q.id] === true;
              return (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    checked
                      ? "bg-primary-green/5 border border-primary-green/30"
                      : "bg-white border border-light-gray hover:border-primary-green/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAnswer(q.id)}
                    className="mt-1 h-4 w-4 accent-primary-green shrink-0"
                  />
                  <span className="font-sans text-sm text-near-black leading-relaxed">
                    {q.text}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Section nav buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-t border-light-gray bg-white">
            <button
              type="button"
              onClick={() => goToSection(currentSectionIdx - 1)}
              disabled={isFirstSection}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md border border-light-gray bg-white text-sm font-medium text-near-black hover:border-primary-green/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            {isLastSection ? (
              <button
                type="button"
                onClick={submitScorecard}
                disabled={submitting}
                className="inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:order-last"
              >
                {submitting ? "Scoring..." : "Score My Property"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToSection(currentSectionIdx + 1)}
                className="inline-flex items-center justify-center gap-1.5 bg-near-black hover:bg-charcoal text-white font-semibold px-5 py-2.5 rounded-md transition-colors text-sm sm:order-last"
              >
                Next section
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Skip-to-score escape hatch (hidden on last section since the main button submits there) */}
        {!isLastSection && (
          <div className="text-center">
            <button
              type="button"
              onClick={submitScorecard}
              disabled={submitting}
              className="font-sans text-sm text-charcoal/70 hover:text-near-black underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Scoring..." : "Skip to score with current answers →"}
            </button>
            <p className="font-sans text-xs text-charcoal/55 mt-1.5">
              Unfinished sections count as &ldquo;no&rdquo; for any unchecked item.
            </p>
          </div>
        )}

        {/* Sticky bottom progress */}
        <div className="sticky bottom-4 z-10">
          <div className="bg-near-black text-white rounded-lg shadow-xl p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="font-sans text-xs sm:text-sm font-medium text-white tabular-nums">
                <span className="font-semibold">
                  Section {currentSectionIdx + 1} of{" "}
                  {SCORECARD_SECTIONS.length}
                </span>
                <span className="text-white/60">
                  {" · "}
                  {currentSection.label}
                </span>
              </p>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-warm-gold rounded-full transition-all"
                style={{ width: `${sectionProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-terracotta/10 border border-terracotta/30 text-terracotta text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {siteKey && (
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              options={{ size: "invisible" }}
            />
          </div>
        )}
      </div>

      {captureToken && (
        <EmailCaptureModal
          token={captureToken}
          onClose={() => setCaptureToken(null)}
        />
      )}
    </>
  );
}
