"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import type { CostScope } from "@/lib/resources/breakeven-analysis-worksheet/costs";
import { PRICE_STALE_DAYS } from "@/lib/resources/breakeven-analysis-worksheet/costs";
import type {
  CostOverride,
  EditableFields,
} from "@/lib/resources/breakeven-analysis-worksheet/catalog";

// Editor for the Co-Living Property Profitability Analysis Worksheet's cost
// defaults.
//
// THE CENTRAL CONVENTION: an empty input means "use the config default", and
// the config default is shown as the grey placeholder. Typing a value creates
// an override; clearing it back to empty removes that override. This is the
// same placeholder-is-the-default rule the member-facing tool uses, so the two
// screens teach each other.
//
// Nothing here can add, delete, rename, or re-categorize a line. Line ids are
// the keys of every saved member analysis, so the id set stays a compile-time
// constant in costs.ts — this screen only changes values.

/** Restated rather than imported: @/lib/marketplace pulls in the DB client. */
const NETWORK_OPTIONS = [
  { value: "amazon", label: "Amazon" },
  { value: "lowes", label: "Lowe's" },
  { value: "wayfair", label: "Wayfair" },
  { value: "direct", label: "Direct" },
  { value: "other", label: "Other" },
];

export interface AdminCostLine {
  id: string;
  label: string;
  hint: string | null;
  scope: CostScope;
  /** Human-readable "One-time · Furniture" style labels. First one is its home. */
  categories: string[];
  editable: EditableFields;
  /** What the line falls back to when the override is cleared. */
  base: {
    oneTimeCost: number | null;
    monthlyCost: number | null;
    monthlyPercent: number | null;
    sourceNote: string | null;
    affiliateUrl: string | null;
    productName: string | null;
    network: string | null;
    price: number | null;
    priceCheckedAt: string | null;
  };
}

interface Draft {
  oneTimeCost: string;
  monthlyCost: string;
  /** Whole percent as typed, e.g. "5". Stored as 0.05. */
  monthlyPercent: string;
  sourceNote: string;
  productName: string;
  affiliateUrl: string;
  network: string;
  price: string;
}

const EMPTY_DRAFT: Draft = {
  oneTimeCost: "",
  monthlyCost: "",
  monthlyPercent: "",
  sourceNote: "",
  productName: "",
  affiliateUrl: "",
  network: "",
  price: "",
};

function draftFromOverride(o: CostOverride | undefined): Draft {
  if (!o) return EMPTY_DRAFT;
  return {
    oneTimeCost: o.oneTimeCost === null ? "" : String(o.oneTimeCost),
    monthlyCost: o.monthlyCost === null ? "" : String(o.monthlyCost),
    monthlyPercent: o.monthlyPercent === null ? "" : String(o.monthlyPercent * 100),
    sourceNote: o.sourceNote ?? "",
    productName: o.productName ?? "",
    affiliateUrl: o.affiliateUrl ?? "",
    network: o.network ?? "",
    price: o.price === null ? "" : String(o.price),
  };
}

function money(n: number | null): string {
  return n === null ? "—" : `$${n.toLocaleString("en-US")}`;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

type Filter = "all" | "needs-link" | "overridden";

/**
 * Rows per page. Each row is a multi-field form, so all fifty-five at once is a
 * wall — five is about one screen, which is the unit of work when the job is
 * "paste a link, save, next".
 */
const PAGE_SIZE = 5;

export default function PlannerCostsAdmin({
  lines,
  initialOverrides,
}: {
  lines: AdminCostLine[];
  initialOverrides: CostOverride[];
}) {
  const [overrides, setOverrides] = useState<Record<string, CostOverride>>(() =>
    Object.fromEntries(initialOverrides.map((o) => [o.lineId, o])),
  );
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      lines.map((l) => [
        l.id,
        draftFromOverride(initialOverrides.find((o) => o.lineId === l.id)),
      ]),
    ),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);
  const listTop = useRef<HTMLDivElement | null>(null);

  /**
   * Membership is judged on SAVED state, never on the draft.
   *
   * Reading drafts here meant the first keystroke of a URL made the row fail
   * its own filter, so it unmounted from under the cursor and you could type
   * exactly one character. A row now leaves "Needs a link" when you Save it,
   * which is also the only moment the claim becomes true.
   */
  const missingLinks = useMemo(
    () =>
      lines.filter(
        (l) => l.editable.product && !(overrides[l.id]?.affiliateUrl ?? l.base.affiliateUrl),
      ),
    [lines, overrides],
  );
  const overriddenCount = Object.keys(overrides).length;

  const visible = useMemo(() => {
    if (filter === "needs-link") return missingLinks;
    if (filter === "overridden") return lines.filter((l) => overrides[l.id]);
    return lines;
  }, [filter, lines, overrides, missingLinks]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Clamp during render rather than correcting in an effect: saving the last
  // row of the last page shrinks the list, and an effect would paint one frame
  // of an empty page first. Derived, so there is no state to fall out of sync.
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const pageLines = visible.slice(start, start + PAGE_SIZE);

  function goToPage(next: number) {
    setPage(Math.max(0, Math.min(next, pageCount - 1)));
    // Five tall rows means the top of the list is off-screen by the time you
    // reach the pager. Jumping back is the difference between paging feeling
    // like a list and feeling like a treadmill.
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(0);
  }

  function setField(id: string, field: keyof Draft, value: string) {
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? EMPTY_DRAFT), [field]: value } }));
    setSaved((s) => (s[id] ? { ...s, [id]: false } : s));
  }

  function isDirty(l: AdminCostLine): boolean {
    const a = drafts[l.id] ?? EMPTY_DRAFT;
    const b = draftFromOverride(overrides[l.id]);
    return (Object.keys(EMPTY_DRAFT) as (keyof Draft)[]).some((k) => a[k] !== b[k]);
  }

  // Drafts are keyed by line id and survive paging, so an unsaved edit is still
  // there when you come back — but it is off-screen, which is exactly when a
  // count is worth showing.
  const unsavedCount = lines.filter(isDirty).length;

  /** Groups in config order, so the screen reads like costs.ts does. */
  const groups: { label: string; lines: AdminCostLine[] }[] = [];
  for (const l of pageLines) {
    const key = l.categories[0] ?? "Uncategorized";
    const g = groups.find((x) => x.label === key);
    if (g) g.lines.push(l);
    else groups.push({ label: key, lines: [l] });
  }

  async function save(l: AdminCostLine) {
    const d = drafts[l.id] ?? EMPTY_DRAFT;
    setBusy(l.id);
    setErrors((e) => ({ ...e, [l.id]: "" }));
    try {
      const res = await fetch(`/api/admin/planner-costs/${l.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oneTimeCost: d.oneTimeCost,
          monthlyCost: d.monthlyCost,
          monthlyPercent: d.monthlyPercent,
          sourceNote: d.sourceNote,
          productName: d.productName,
          affiliateUrl: d.affiliateUrl,
          network: d.network,
          price: d.price,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors((e) => ({ ...e, [l.id]: json.error || "Save failed." }));
        return;
      }
      const next: CostOverride | null = json.override ?? null;
      setOverrides((o) => {
        const copy = { ...o };
        if (next) copy[l.id] = next;
        else delete copy[l.id];
        return copy;
      });
      // Re-seed from the server's row so the price-checked stamp and any
      // rounding it applied show up immediately.
      if (next) setDrafts((dd) => ({ ...dd, [l.id]: draftFromOverride(next) }));
      setSaved((s) => ({ ...s, [l.id]: true }));
    } catch {
      setErrors((e) => ({ ...e, [l.id]: "Network error." }));
    } finally {
      setBusy(null);
    }
  }

  async function reset(l: AdminCostLine) {
    if (!confirm(`Reset "${l.label}" to the values in costs.ts?`)) return;
    setBusy(l.id);
    try {
      const res = await fetch(`/api/admin/planner-costs/${l.id}`, { method: "DELETE" });
      if (!res.ok) {
        setErrors((e) => ({ ...e, [l.id]: "Reset failed." }));
        return;
      }
      setOverrides((o) => {
        const copy = { ...o };
        delete copy[l.id];
        return copy;
      });
      setDrafts((d) => ({ ...d, [l.id]: EMPTY_DRAFT }));
      setSaved((s) => ({ ...s, [l.id]: false }));
      setErrors((e) => ({ ...e, [l.id]: "" }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-near-black">
          Worksheet cost defaults
        </h1>
        <p className="font-sans text-sm text-charcoal/70 mt-1 max-w-3xl">
          Defaults and affiliate links for the Co-Living Property Profitability
          Analysis Worksheet. Leave a field empty to use the value in{" "}
          <code>costs.ts</code>, shown as the
          grey placeholder. Members see a buy link on a line only once it has a URL
          here and they tick that line.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(
          [
            ["all", `All ${lines.length}`],
            ["needs-link", `Needs a link ${missingLinks.length}`],
            ["overridden", `Edited ${overriddenCount}`],
          ] as [Filter, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => changeFilter(id)}
            className={[
              "font-sans text-sm px-3 py-1.5 rounded-full border transition-colors cursor-pointer",
              filter === id
                ? "bg-near-black text-white border-near-black"
                : "bg-white text-charcoal/75 border-light-gray hover:border-charcoal/40",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div ref={listTop} className="scroll-mt-6" />

      {visible.length === 0 && (
        <p className="font-sans text-sm text-charcoal/60 py-10 text-center">
          Nothing in this filter.
        </p>
      )}

      {visible.length > 0 && (
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <p className="font-sans text-xs text-charcoal/60 tabular-nums">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of{" "}
            {visible.length}
          </p>
          {unsavedCount > 0 && (
            <p className="font-sans text-xs font-semibold text-warm-gold">
              {unsavedCount} unsaved {unsavedCount === 1 ? "line" : "lines"}
            </p>
          )}
        </div>
      )}

      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g.label}>
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/60 pb-1.5 mb-2 border-b border-light-gray">
              {g.label}
            </h2>
            <div className="space-y-2">
              {g.lines.map((l) => {
                const d = drafts[l.id] ?? EMPTY_DRAFT;
                const o = overrides[l.id];
                const dirty = isDirty(l);
                const effectivePrice = o?.price ?? l.base.price;
                const checkedAt = o?.priceCheckedAt ?? l.base.priceCheckedAt;
                const age = daysSince(checkedAt);
                const stale = age !== null && age > PRICE_STALE_DAYS;

                return (
                  <div
                    key={l.id}
                    className={[
                      "rounded-lg border bg-white p-3.5",
                      dirty ? "border-warm-gold" : o ? "border-primary-green/40" : "border-light-gray",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-64 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-sm font-semibold text-near-black">
                            {l.label}
                          </span>
                          <code className="font-mono text-[10px] text-charcoal/45">{l.id}</code>
                          {l.scope === "per-room" && (
                            <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal/60 bg-cream rounded px-1.5 py-0.5">
                              per room
                            </span>
                          )}
                          {o && (
                            <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-primary-green bg-primary-green/10 rounded px-1.5 py-0.5">
                              edited
                            </span>
                          )}
                          {stale && (
                            <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-terracotta bg-terracotta/10 rounded px-1.5 py-0.5">
                              price {age}d old
                            </span>
                          )}
                        </div>
                        {l.categories.length > 1 && (
                          <p className="font-sans text-[11px] text-charcoal/50 mt-0.5">
                            Also in {l.categories.slice(1).join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {saved[l.id] && !dirty && (
                          <span className="flex items-center gap-1 font-sans text-xs text-primary-green">
                            <Check className="w-3.5 h-3.5" aria-hidden /> Saved
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={!dirty || busy === l.id}
                          onClick={() => save(l)}
                          className="font-sans text-xs font-semibold px-3 py-1.5 rounded-md bg-near-black text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {busy === l.id ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          disabled={!o || busy === l.id}
                          onClick={() => reset(l)}
                          title="Back to the value in costs.ts"
                          aria-label={`Reset ${l.label}`}
                          className="font-sans text-xs px-2 py-1.5 rounded-md border border-light-gray text-charcoal/70 hover:border-charcoal/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2 mt-3">
                      {l.editable.oneTimeCost && (
                        <NumField
                          className="md:col-span-3"
                          label="One-time $"
                          value={d.oneTimeCost}
                          placeholder={l.base.oneTimeCost}
                          onChange={(v) => setField(l.id, "oneTimeCost", v)}
                        />
                      )}
                      {l.editable.monthlyCost && (
                        <NumField
                          className="md:col-span-3"
                          label="Monthly $"
                          value={d.monthlyCost}
                          placeholder={l.base.monthlyCost}
                          onChange={(v) => setField(l.id, "monthlyCost", v)}
                        />
                      )}
                      {l.editable.monthlyPercent && (
                        <NumField
                          className="md:col-span-3"
                          label="Monthly % of rent"
                          value={d.monthlyPercent}
                          placeholder={
                            l.base.monthlyPercent === null ? null : l.base.monthlyPercent * 100
                          }
                          suffix="%"
                          onChange={(v) => setField(l.id, "monthlyPercent", v)}
                        />
                      )}

                      {l.editable.product && (
                        <>
                          <NumField
                            className="md:col-span-3"
                            label="Price (one-time $)"
                            value={d.price}
                            placeholder={l.base.price}
                            onChange={(v) => setField(l.id, "price", v)}
                          />
                          <TextField
                            className="md:col-span-5"
                            label="Product"
                            value={d.productName}
                            placeholder={l.base.productName ?? ""}
                            onChange={(v) => setField(l.id, "productName", v)}
                          />
                          <div className="md:col-span-4">
                            <FieldLabel>Network</FieldLabel>
                            <select
                              value={d.network}
                              onChange={(e) => setField(l.id, "network", e.target.value)}
                              aria-label={`Affiliate network for ${l.label}`}
                              className="w-full min-h-9 border border-light-gray bg-white px-2 py-1.5 font-sans text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green"
                            >
                              <option value="">
                                {l.base.network
                                  ? `${NETWORK_OPTIONS.find((n) => n.value === l.base.network)?.label ?? l.base.network} (config)`
                                  : "— config —"}
                              </option>
                              {NETWORK_OPTIONS.map((n) => (
                                <option key={n.value} value={n.value}>
                                  {n.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-12">
                            <FieldLabel>
                              Affiliate URL
                              {!d.affiliateUrl && !l.base.affiliateUrl && (
                                <span className="ml-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-warm-gold">
                                  no link yet
                                </span>
                              )}
                            </FieldLabel>
                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                inputMode="url"
                                value={d.affiliateUrl}
                                placeholder={l.base.affiliateUrl ?? "https://… (tagged link)"}
                                onChange={(e) => setField(l.id, "affiliateUrl", e.target.value)}
                                aria-label={`Affiliate URL for ${l.label}`}
                                className="flex-1 min-h-9 border border-light-gray bg-white px-2 py-1.5 font-sans text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green"
                              />
                              {(d.affiliateUrl || l.base.affiliateUrl) && (
                                <a
                                  href={d.affiliateUrl || l.base.affiliateUrl || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open in a new tab"
                                  aria-label={`Open the affiliate link for ${l.label}`}
                                  className="shrink-0 text-charcoal/45 hover:text-primary-green"
                                >
                                  <ExternalLink className="w-4 h-4" aria-hidden />
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <TextField
                        className="md:col-span-12"
                        label="Source note (shown to members under the line)"
                        value={d.sourceNote}
                        placeholder={l.base.sourceNote ?? "Where this number came from"}
                        onChange={(v) => setField(l.id, "sourceNote", v)}
                      />
                    </div>

                    {l.hint && (
                      <p className="font-sans text-[11px] text-charcoal/50 mt-2 leading-snug">
                        Member hint: {l.hint}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
                      <p className="font-sans text-[11px] text-charcoal/50">
                        {l.editable.product
                          ? `Effective price ${money(effectivePrice)}${checkedAt ? ` · checked ${checkedAt}` : ""}`
                          : null}
                        {o?.updatedBy ? ` · last edited by ${o.updatedBy}` : ""}
                      </p>
                      {errors[l.id] && (
                        <p className="flex items-center gap-1.5 font-sans text-xs text-terracotta">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          {errors[l.id]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {pageCount > 1 && (
        <nav
          aria-label="Cost line pages"
          className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-light-gray flex-wrap"
        >
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 font-sans text-sm px-3 py-2 rounded-md border border-light-gray bg-white text-charcoal/75 hover:border-charcoal/40 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Previous
          </button>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                aria-label={`Page ${i + 1} of ${pageCount}`}
                aria-current={i === safePage ? "page" : undefined}
                className={[
                  "font-sans text-sm min-w-9 h-9 px-2 rounded-md border transition-colors cursor-pointer tabular-nums",
                  i === safePage
                    ? "bg-near-black text-white border-near-black font-semibold"
                    : "bg-white text-charcoal/70 border-light-gray hover:border-charcoal/40",
                ].join(" ")}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= pageCount - 1}
            className="inline-flex items-center gap-1 font-sans text-sm px-3 py-2 rounded-md border border-light-gray bg-white text-charcoal/75 hover:border-charcoal/40 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
        </nav>
      )}

      <p className="font-sans text-xs text-charcoal/55 mt-8 max-w-3xl leading-relaxed">
        The price-checked date stamps itself only when the price actually changes,
        so editing a link does not reset the staleness clock. Percentages are stored
        as a fraction of collected rent. Structure — which lines exist and which
        section they appear in — lives in <code>costs.ts</code> and is not editable
        here, because line ids are the keys of every saved member analysis.
      </p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/60 mb-1">
      {children}
    </span>
  );
}

function NumField({
  label,
  value,
  placeholder,
  onChange,
  className,
  suffix,
}: {
  label: string;
  value: string;
  /** The config baseline. Rendered as the placeholder — empty means inherit. */
  placeholder: number | null;
  onChange: (v: string) => void;
  className?: string;
  suffix?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          placeholder={placeholder === null ? "—" : String(placeholder)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={[
            "w-full min-h-9 border border-light-gray bg-white pl-2 py-1.5 font-sans text-sm text-near-black rounded-md tabular-nums",
            "focus:outline-none focus:border-primary-green",
            suffix ? "pr-6" : "pr-2",
          ].join(" ")}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-1/2 -translate-y-1/2 font-sans text-xs text-charcoal/45"
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  className,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full min-h-9 border border-light-gray bg-white px-2 py-1.5 font-sans text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green"
      />
    </div>
  );
}
