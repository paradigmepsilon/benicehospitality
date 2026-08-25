"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseReviewState } from "@/lib/course-review";

function StatusBadge({ approved }: { approved: boolean }) {
  return approved ? (
    <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary-green/15 text-primary-green px-2 py-0.5 rounded">
      Approved
    </span>
  ) : (
    <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
      Draft
    </span>
  );
}

export default function CourseReviewPanel({
  initialState,
}: {
  initialState: CourseReviewState;
}) {
  const router = useRouter();
  const state = initialState;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(url: string, body: object, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Request failed (${res.status})`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  const totalLessons = state.modules.reduce((n, m) => n + m.lessons.length, 0);
  const approvedLessons = totalLessons
    ? state.modules.reduce(
        (n, m) =>
          n + m.lessons.filter((l) => l.reviewStatus === "approved").length,
        0,
      )
    : 0;
  const allApproved =
    state.draftLessonCount === 0 && state.draftModuleCount === 0 && totalLessons > 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 font-sans text-sm">
          {error}
        </div>
      )}

      {/* Course readiness */}
      <div className="bg-white border border-light-gray rounded-lg p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-charcoal/50 mb-1">
              Course status
            </p>
            <div className="flex items-center gap-2">
              {state.isReady ? (
                <span className="text-xs font-semibold uppercase tracking-wider bg-primary-green/15 text-primary-green px-2.5 py-1 rounded">
                  Ready · live to students
                </span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/70 px-2.5 py-1 rounded">
                  In review · hidden from students
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-charcoal/65 mt-2 max-w-xl">
              {approvedLessons} of {totalLessons} lessons approved.{" "}
              {state.isReady
                ? "The course is published and purchasable."
                : "Students can't see or buy this course until every lesson and module is approved and the course is marked ready."}
            </p>
          </div>
          {state.isReady ? (
            <button
              onClick={() =>
                post(`/api/admin/courses/${state.courseId}/ready`, { ready: false }, "ready")
              }
              disabled={busy !== null}
              className="font-sans text-sm font-semibold px-4 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {busy === "ready" ? "Working…" : "Take course offline"}
            </button>
          ) : (
            <button
              onClick={() =>
                post(`/api/admin/courses/${state.courseId}/ready`, { ready: true }, "ready")
              }
              disabled={busy !== null || !allApproved}
              title={
                allApproved
                  ? undefined
                  : "Approve every lesson and module first"
              }
              className="font-sans text-sm font-semibold px-4 py-2 rounded bg-primary-green text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy === "ready" ? "Working…" : "Mark course ready"}
            </button>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {state.modules.map((m) => {
          const lessonsApproved = m.lessons.every(
            (l) => l.reviewStatus === "approved",
          );
          const moduleApproved = m.reviewStatus === "approved";
          return (
            <div key={m.id} className="bg-white border border-light-gray rounded-lg">
              <div className="flex items-start justify-between gap-3 p-4 border-b border-light-gray/70">
                <div className="min-w-0">
                  {m.phaseLabel && (
                    <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-charcoal/50 mb-0.5">
                      {m.phaseLabel}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-semibold text-deep-teal">
                      {m.title}
                    </h3>
                    {m.lessons.length > 0 && <StatusBadge approved={moduleApproved} />}
                  </div>
                  {m.approvedAt && moduleApproved && (
                    <p className="font-sans text-[11px] text-charcoal/50 mt-0.5">
                      Approved {new Date(m.approvedAt).toLocaleDateString()}
                      {m.approvedBy ? ` by ${m.approvedBy}` : ""}
                    </p>
                  )}
                </div>
                {m.lessons.length > 0 && (
                  <button
                    onClick={() =>
                      post(
                        `/api/admin/modules/${m.id}/review`,
                        { approved: !moduleApproved },
                        `module-${m.id}`,
                      )
                    }
                    disabled={busy !== null || (!moduleApproved && !lessonsApproved)}
                    title={
                      !moduleApproved && !lessonsApproved
                        ? "Approve every lesson in this module first"
                        : undefined
                    }
                    className={[
                      "font-sans text-xs font-semibold px-3 py-1.5 rounded border shrink-0 disabled:opacity-40 disabled:cursor-not-allowed",
                      moduleApproved
                        ? "border-charcoal/25 text-charcoal/70 hover:bg-charcoal/5"
                        : "border-primary-green text-primary-green hover:bg-primary-green/10",
                    ].join(" ")}
                  >
                    {busy === `module-${m.id}`
                      ? "Working…"
                      : moduleApproved
                        ? "Unapprove module"
                        : "Approve module"}
                  </button>
                )}
              </div>

              {m.lessons.length === 0 ? (
                <p className="font-sans text-xs text-charcoal/50 px-4 py-3">
                  No lessons yet.
                </p>
              ) : (
                <ul className="divide-y divide-light-gray/60">
                  {m.lessons.map((l) => {
                    const approved = l.reviewStatus === "approved";
                    return (
                      <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans text-sm font-semibold text-near-black truncate">
                              {l.title}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/60 px-2 py-0.5 rounded">
                              {l.bodyKind}
                            </span>
                            <StatusBadge approved={approved} />
                          </div>
                          {approved && l.approvedAt && (
                            <p className="font-sans text-[11px] text-charcoal/50 mt-0.5">
                              Approved {new Date(l.approvedAt).toLocaleDateString()}
                              {l.approvedBy ? ` by ${l.approvedBy}` : ""}
                            </p>
                          )}
                        </div>
                        <a
                          href={`/api/admin/lessons/${l.id}/preview`}
                          target="_blank"
                          rel="noreferrer"
                          title="Opens the lesson in the student player (member preview mode)"
                          className="font-sans text-xs font-semibold text-deep-teal hover:text-primary-green shrink-0"
                        >
                          Preview ↗
                        </a>
                        <button
                          onClick={() =>
                            post(
                              `/api/admin/lessons/${l.id}/review`,
                              { approved: !approved },
                              `lesson-${l.id}`,
                            )
                          }
                          disabled={busy !== null}
                          className={[
                            "font-sans text-xs font-semibold px-3 py-1.5 rounded border shrink-0 disabled:opacity-40",
                            approved
                              ? "border-charcoal/25 text-charcoal/70 hover:bg-charcoal/5"
                              : "border-primary-green text-primary-green hover:bg-primary-green/10",
                          ].join(" ")}
                        >
                          {busy === `lesson-${l.id}`
                            ? "Working…"
                            : approved
                              ? "Unapprove"
                              : "Approve"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
