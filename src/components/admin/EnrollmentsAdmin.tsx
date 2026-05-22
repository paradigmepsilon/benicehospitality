"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface EnrollmentRow {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  tier: "self-paced" | "cohort" | "operator" | "comp";
  status: "active" | "paused" | "revoked";
  grantedAt: string;
  expiresAt: string | null;
}

interface CourseOption {
  id: number;
  slug: string;
  title: string;
  isPlaceholder: boolean;
}

interface UserOption {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Props {
  initialEnrollments: EnrollmentRow[];
  courses: CourseOption[];
  users: UserOption[];
}

const TIER_LABEL: Record<EnrollmentRow["tier"], string> = {
  "self-paced": "Self-paced",
  cohort: "Cohort",
  operator: "Operator (1:1)",
  comp: "Complimentary",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().split("T")[0];
}

export default function EnrollmentsAdmin({
  initialEnrollments,
  courses,
  users,
}: Props) {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [pending, startTransition] = useTransition();

  const [userId, setUserId] = useState<string>(
    users[0]?.id ? String(users[0].id) : "",
  );
  const [courseId, setCourseId] = useState<string>(
    courses[0]?.id ? String(courses[0].id) : "",
  );
  const [tier, setTier] = useState<EnrollmentRow["tier"]>("cohort");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleGrant(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId || !courseId) {
      setError("Pick a user and a course.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          courseId: Number(courseId),
          tier,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Grant failed.");
        return;
      }
      setNotes("");
      setExpiresAt("");
      startTransition(() => router.refresh());
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm("Revoke this enrollment? The student will lose access on the next page load.")) return;
    try {
      const res = await fetch(`/api/admin/enrollments?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Revoke failed.");
        return;
      }
      // Optimistically mark revoked locally; refresh server data too.
      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "revoked" as const } : e,
        ),
      );
      startTransition(() => router.refresh());
    } catch {
      alert("Network error. Try again.");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-near-black mb-1">
          Enrollments
        </h1>
        <p className="text-sm text-near-black/60">
          Grant or revoke course access. Revoking is a soft delete — the
          history stays on the row, the student loses access immediately.
        </p>
      </div>

      <div className="bg-white border border-light-gray rounded-lg p-6 mb-10">
        <h2 className="text-base font-semibold text-near-black mb-4">
          Grant access
        </h2>
        <form
          onSubmit={handleGrant}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              User
            </span>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            >
              {users.length === 0 && <option value="">No users</option>}
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Course
            </span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            >
              {courses.length === 0 && <option value="">No courses</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id} disabled={c.isPlaceholder}>
                  {c.title}
                  {c.isPlaceholder ? " (placeholder — not yet released)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Tier
            </span>
            <select
              value={tier}
              onChange={(e) =>
                setTier(e.target.value as EnrollmentRow["tier"])
              }
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            >
              <option value="self-paced">Self-paced</option>
              <option value="cohort">Cohort</option>
              <option value="operator">Operator (1:1)</option>
              <option value="comp">Complimentary</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Expires (optional)
            </span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            />
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stripe charge ID, manual sale ref, etc."
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            />
          </label>
          <div className="flex items-end md:col-span-3 gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-green text-white hover:bg-primary-green-dark px-5 py-2.5 text-sm font-semibold rounded-md disabled:opacity-50"
            >
              {submitting ? "Granting…" : "Grant or upsert"}
            </button>
            {error && (
              <p className="text-sm text-red-700 ml-2">{error}</p>
            )}
            {pending && (
              <p className="text-sm text-near-black/55 ml-2">Refreshing…</p>
            )}
          </div>
        </form>
        <p className="mt-3 text-xs text-near-black/55">
          If the user is already enrolled in the course, this updates the
          existing row (tier, expiry, notes) and unrevokes if revoked.
        </p>
      </div>

      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream border-b border-light-gray">
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Student
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Course
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Tier
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Granted
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Expires
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-near-black/55"
                >
                  No enrollments yet. Grant access using the form above.
                </td>
              </tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e.id} className="border-b border-light-gray last:border-0">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-near-black">
                      {e.userName}
                    </p>
                    <p className="text-xs text-near-black/55">{e.userEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black">
                    {e.courseTitle}
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/85">
                    {TIER_LABEL[e.tier]}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold",
                        e.status === "active" &&
                          "bg-primary-green/10 text-primary-green",
                        e.status === "paused" &&
                          "bg-warm-gold/15 text-warm-gold-dark",
                        e.status === "revoked" &&
                          "bg-red-100 text-red-700",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/70">
                    {fmtDate(e.grantedAt)}
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/70">
                    {fmtDate(e.expiresAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {e.status !== "revoked" && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(e.id)}
                        className="text-xs font-semibold text-red-700 hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
