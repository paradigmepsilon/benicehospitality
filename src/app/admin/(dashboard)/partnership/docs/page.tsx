"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DocAudience, PartnershipDoc } from "@/lib/partnership/journey";
import type { DocReview } from "@/lib/partnership/doc-reviews";
import { AUDIENCE_BADGE, docHref } from "@/components/admin/partnership/ui";
import { Modal } from "@/components/admin/partnership/Modal";

type LibraryDoc = PartnershipDoc & { rendered: boolean; editable: string | null };

const AUDIENCES: ("all" | DocAudience)[] = ["all", "client", "template", "agreement", "internal"];

export default function PartnershipDocsPage() {
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [reviews, setReviews] = useState<Map<string, DocReview>>(new Map());
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState<"all" | DocAudience>("all");
  const [search, setSearch] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(
    () =>
      Promise.all([
        fetch("/api/admin/partnership/docs").then((res) => (res.ok ? res.json() : [])),
        fetch("/api/admin/partnership/docs/reviews").then((res) => (res.ok ? res.json() : [])),
      ]) as Promise<[LibraryDoc[], DocReview[]]>,
    [],
  );
  const apply = useCallback(([d, r]: [LibraryDoc[], DocReview[]]) => {
    setDocs(d);
    setReviews(new Map(r.map((x) => [x.docKey, x])));
    setLoading(false);
  }, []);
  const load = useCallback(() => fetchAll().then(apply), [fetchAll, apply]);

  useEffect(() => {
    fetchAll().then(apply);
  }, [fetchAll, apply]);

  async function toggle(docKey: string, reviewed: boolean) {
    // Optimistic, then reconcile: a checklist that lags feels broken.
    setReviews((prev) => {
      const next = new Map(prev);
      if (reviewed) next.set(docKey, { docKey, reviewedBy: null, reviewedAt: new Date().toISOString(), approvedBy: null, approvedAt: null });
      else next.delete(docKey);
      return next;
    });
    const res = await fetch("/api/admin/partnership/docs/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docKey, reviewed }),
    });
    if (!res.ok) setError("That tick did not save.");
    await load();
  }

  async function approveAll() {
    setError("");
    const res = await fetch("/api/admin/partnership/docs/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approveAll: true }),
    });
    setConfirmApprove(false);
    if (!res.ok) setError((await res.json()).error || "Could not approve");
    await load();
  }

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = new Map<string, LibraryDoc[]>();
    for (const d of docs) {
      if (audience !== "all" && d.audience !== audience) continue;
      if (q && !d.title.toLowerCase().includes(q)) continue;
      if (onlyOpen && reviews.has(d.key)) continue;
      out.set(d.group, [...(out.get(d.group) ?? []), d]);
    }
    return [...out.entries()];
  }, [docs, audience, search, onlyOpen, reviews]);

  const total = docs.length;
  const checked = docs.filter((d) => reviews.has(d.key)).length;
  const approved = docs.filter((d) => reviews.get(d.key)?.approvedAt).length;
  const allChecked = total > 0 && checked === total;
  const allApproved = total > 0 && approved === total;
  const missing = docs.filter((d) => !d.rendered).length;

  const pill = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;

  return (
    <div className="space-y-4">
      {/* Review tracker */}
      <div className={`rounded-lg border p-4 ${allApproved ? "bg-[#5b9a2f]/10 border-[#5b9a2f]/35" : "bg-white border-[#e8e4dd]"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-[#1a1a1a]">
              {allApproved ? "All documents reviewed and approved for use" : "Document review"}
            </h2>
            <p className="text-sm text-[#1a1a1a]/60">
              {allApproved
                ? "Unticking any document withdraws its approval so it can be re-read."
                : "Open each document, read it, and tick it. When every box is ticked, Submit approves the set for use."}
            </p>
          </div>
          <button
            disabled={!allChecked || allApproved}
            onClick={() => setConfirmApprove(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#5b9a2f] text-white hover:bg-[#4a7d25] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {allApproved ? "Approved ✓" : `Submit review (${checked} of ${total})`}
          </button>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#1a1a1a]/8 overflow-hidden">
          <div className="h-full bg-[#5b9a2f] transition-all" style={{ width: total ? `${(checked / total) * 100}%` : "0%" }} />
        </div>
        <p className="mt-2 text-xs text-[#1a1a1a]/55">
          Ticking a box means you read it, not that a lawyer has. Agreements stay drafts until the attorney reviews them, whatever this tracker says.
        </p>
      </div>

      {error && <div className="bg-[#c0674a]/10 border border-[#c0674a]/30 text-[#8a4a32] text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="bg-white border border-[#e8e4dd] rounded-lg p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors"
        />
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCES.map((a) => (
            <button key={a} onClick={() => setAudience(a)} className={pill(audience === a)}>
              {a === "all" ? "All" : AUDIENCE_BADGE[a].label}
            </button>
          ))}
          <button onClick={() => setOnlyOpen((v) => !v)} className={pill(onlyOpen)}>Still to review</button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#1a1a1a]/50 py-12 text-center">Loading the library…</p>
      ) : (
        <>
          {missing > 0 && (
            <p className="text-xs text-[#8a6215]">
              {missing} document{missing === 1 ? " has" : "s have"} no PDF yet. Run{" "}
              <code className="bg-[#1a1a1a]/5 px-1 rounded">bash docs/co-living-launch-partnership/render.sh</code>.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groups.map(([group, items]) => (
              <section key={group} className="bg-white border border-[#e8e4dd] rounded-lg p-4 min-w-0">
                <h2 className="font-display text-lg font-semibold text-[#1a1a1a] mb-2">{group}</h2>
                <ul className="divide-y divide-[#e8e4dd]">
                  {items.map((d) => {
                    const review = reviews.get(d.key);
                    return (
                      <li key={d.key} className="flex items-start gap-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={!!review}
                          onChange={(e) => toggle(d.key, e.target.checked)}
                          className="mt-1 w-4 h-4 accent-[#5b9a2f]"
                          aria-label={`Reviewed: ${d.title}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#1a1a1a] break-words">{d.title}</div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                            {d.rendered ? (
                              <a href={docHref(d.key)} target="_blank" rel="noopener noreferrer" className="text-[#1A4D4F] hover:underline">
                                {d.audience === "client" || d.audience === "internal" ? "Open PDF" : "Blank PDF"} ↗
                              </a>
                            ) : (
                              <span className="text-[#1a1a1a]/35">not rendered</span>
                            )}
                            {d.editable && d.audience !== "client" && (
                              <a href={`/api/admin/partnership/files/${d.editable}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[#5b9a2f] hover:underline">
                                Fill in + print ↗
                              </a>
                            )}
                            {review?.approvedAt ? (
                              <span className="text-[#3d6a1f] font-medium">Approved for use{review.approvedBy ? ` · ${review.approvedBy}` : ""}</span>
                            ) : review ? (
                              <span className="text-[#1a1a1a]/50">Reviewed{review.reviewedBy ? ` by ${review.reviewedBy}` : ""}</span>
                            ) : null}
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${AUDIENCE_BADGE[d.audience].className}`}>
                          {AUDIENCE_BADGE[d.audience].label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      {confirmApprove && (
        <Modal title="Approve these documents for use?" onClose={() => setConfirmApprove(false)}>
          <p className="text-sm text-[#1a1a1a]/70">
            All {total} documents are ticked as read. Submitting records your name and today&apos;s date against each one as approved for use.
          </p>
          <p className="text-sm text-[#1a1a1a]/70 mt-2">
            This does not replace the attorney&apos;s review of the agreements or Della&apos;s sign-off on client-facing voice.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-[#e8e4dd] text-[#1a1a1a]/70" onClick={() => setConfirmApprove(false)}>Not yet</button>
            <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#5b9a2f] text-white hover:bg-[#4a7d25]" onClick={approveAll}>Approve for use</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
