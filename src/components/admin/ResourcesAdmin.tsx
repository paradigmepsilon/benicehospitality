"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface ResourceRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  externalUrl: string | null;
  requiredTier: "any" | "cohort" | "operator";
  isPublished: boolean;
  createdAt: string;
}

interface Props {
  initialResources: ResourceRow[];
}

const TIER_LABEL: Record<ResourceRow["requiredTier"], string> = {
  any: "All members",
  cohort: "Cohort+",
  operator: "Operator only",
};

function fmtDate(iso: string): string {
  return new Date(iso).toISOString().split("T")[0];
}

export default function ResourcesAdmin({ initialResources }: Props) {
  const router = useRouter();
  const [resources, setResources] = useState(initialResources);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [requiredTier, setRequiredTier] =
    useState<ResourceRow["requiredTier"]>("any");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 4) {
      setError("Title must be at least 4 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          body: body,
          externalUrl: externalUrl.trim() || null,
          requiredTier,
          isPublished,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Create failed.");
        return;
      }
      setTitle("");
      setSummary("");
      setBody("");
      setExternalUrl("");
      setRequiredTier("any");
      setIsPublished(true);
      refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(r: ResourceRow) {
    const res = await fetch(`/api/admin/resources/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !r.isPublished }),
    });
    if (res.ok) {
      setResources((prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, isPublished: !x.isPublished } : x,
        ),
      );
      refresh();
    }
  }

  async function handleDelete(r: ResourceRow) {
    if (!confirm(`Delete "${r.title}"? This is permanent.`)) return;
    const res = await fetch(`/api/admin/resources/${r.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setResources((prev) => prev.filter((x) => x.id !== r.id));
      refresh();
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-near-black mb-1">
          Member resources
        </h1>
        <p className="text-sm text-near-black/60">
          Create gated downloads / templates / external links. Tier governs
          which members can see each resource.
        </p>
      </div>

      <div className="bg-white border border-light-gray rounded-lg p-6 mb-10">
        <h2 className="text-base font-semibold text-near-black mb-4">
          Add a resource
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Title
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cleaner SOP — STR turnover checklist"
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Summary (one line)
            </span>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="The 30-step turnover checklist your cleaner follows"
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              External URL (optional — Drive, Notion, etc.)
            </span>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Body (optional, plain text)
            </span>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Long-form description, instructions, change-log notes."
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green resize-y"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
              Required tier
            </span>
            <select
              value={requiredTier}
              onChange={(e) =>
                setRequiredTier(e.target.value as ResourceRow["requiredTier"])
              }
              className="border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green"
            >
              <option value="any">Any (all members)</option>
              <option value="cohort">Cohort+</option>
              <option value="operator">Operator only</option>
            </select>
          </label>
          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-primary-green"
            />
            <span className="text-sm text-near-black/85">Publish immediately</span>
          </label>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-green text-white hover:bg-primary-green-dark px-5 py-2.5 text-sm font-semibold rounded-md disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create resource"}
            </button>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {pending && (
              <p className="text-sm text-near-black/55">Refreshing…</p>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream border-b border-light-gray">
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Title
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Tier
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Created
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-near-black/55"
                >
                  No resources yet. Create one above.
                </td>
              </tr>
            ) : (
              resources.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-light-gray last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-near-black">
                      {r.title}
                    </p>
                    <p className="text-xs text-near-black/55 truncate max-w-[400px]">
                      {r.summary}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/85">
                    {TIER_LABEL[r.requiredTier]}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold",
                        r.isPublished
                          ? "bg-primary-green/10 text-primary-green"
                          : "bg-charcoal/10 text-charcoal/70",
                      ].join(" ")}
                    >
                      {r.isPublished ? "published" : "draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/70">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => togglePublish(r)}
                        className="text-xs font-semibold text-primary-green hover:underline"
                      >
                        {r.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="text-xs font-semibold text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
