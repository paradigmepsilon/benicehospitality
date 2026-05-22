"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

interface LessonCompleteToggleProps {
  lessonId: number;
  initialComplete: boolean;
  nextHref: string | null;
  courseHref: string;
}

export default function LessonCompleteToggle({
  lessonId,
  initialComplete,
  nextHref,
  courseHref,
}: LessonCompleteToggleProps) {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(initialComplete);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function toggle(target: boolean) {
    setError("");
    const optimistic = target;
    setIsComplete(optimistic);
    try {
      const res = await fetch("/api/lesson-progress", {
        method: target ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      // Revalidate any server-rendered data that depends on progress
      // (course page completion bar, /account dashboard counts).
      startTransition(() => router.refresh());
    } catch {
      setIsComplete(!optimistic);
      setError("Couldn't save. Try again.");
    }
  }

  return (
    <div className="bg-white border border-light-gray rounded-lg p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => toggle(!isComplete)}
          disabled={pending}
          className={[
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isComplete
              ? "bg-primary-green text-white"
              : "bg-cream text-charcoal/50 border-2 border-light-gray hover:border-primary-green",
          ].join(" ")}
          aria-pressed={isComplete}
          aria-label={isComplete ? "Mark as not complete" : "Mark as complete"}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
        </button>
        <div>
          <p className="font-display text-lg font-semibold text-deep-teal leading-tight">
            {isComplete ? "Lesson complete" : "Mark this lesson complete"}
          </p>
          {error ? (
            <p className="font-sans text-xs text-red-700 mt-0.5">{error}</p>
          ) : (
            <p className="font-sans text-xs text-charcoal/60 mt-0.5">
              Keeps your progress synced across devices.
            </p>
          )}
        </div>
      </div>

      {nextHref ? (
        <Link
          href={nextHref}
          className="inline-flex items-center justify-center gap-2 bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-6 py-3 transition-colors whitespace-nowrap"
        >
          Next lesson
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      ) : (
        <Link
          href={courseHref}
          className="inline-flex items-center justify-center gap-2 bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-6 py-3 transition-colors whitespace-nowrap"
        >
          Back to course
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
