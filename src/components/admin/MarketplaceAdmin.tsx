"use client";

import { useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  AffiliateNetwork,
  MarketplaceProduct,
  MarketplaceTabId,
  ProductBadge,
  ProductStatus,
} from "@/lib/marketplace";
import { isRenderableImageUrl } from "@/lib/image-sources";
import {
  DEFAULT_IMAGE_ANCHOR,
  IMAGE_ANCHORS,
  IMAGE_ANCHOR_LABELS,
  objectPositionFor,
  type ImageAnchor,
} from "@/lib/image-anchor";
import {
  MARKETPLACE_TAB_IDS,
  MARKETPLACE_TAB_LABELS,
  categoriesForTab,
  categoryLabel,
  findCategory,
  isKnownCategory,
} from "@/lib/marketplace-categories";

// Labels and ids both come from marketplace-categories.ts. They used to be
// declared here as well, and the drift between the two copies is how the
// retired "hotel" tab survived in some places and vanished from others.
const TAB_LABELS = MARKETPLACE_TAB_LABELS;

const NETWORK_LABELS: Record<AffiliateNetwork, string> = {
  amazon: "Amazon",
  lowes: "Lowe's",
  wayfair: "Wayfair",
  direct: "Direct",
  other: "Other",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  live: "Live",
  "out-of-stock": "Out of stock",
  soon: "Coming soon",
};

const TAB_IDS: readonly MarketplaceTabId[] = MARKETPLACE_TAB_IDS;
const NETWORKS: AffiliateNetwork[] = [
  "amazon",
  "lowes",
  "wayfair",
  "direct",
  "other",
];
const STATUSES: ProductStatus[] = ["live", "out-of-stock", "soon"];
const BADGES: ProductBadge[] = [
  "Della Uses This",
  "New",
  "Best Value",
  "Editor's Pick",
];

interface Props {
  initialProducts: MarketplaceProduct[];
}

type FilterTab = "all" | MarketplaceTabId;

interface FormState {
  slug: string;
  tabId: MarketplaceTabId;
  category: string;
  name: string;
  body: string;
  bullets: string;
  imageUrl: string;
  imageAlt: string;
  imageAnchor: ImageAnchor;
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  badge: "" | ProductBadge;
  status: ProductStatus;
  tags: string;
  position: string;
  isPublished: boolean;
}

function blankForm(): FormState {
  return {
    slug: "",
    tabId: "property",
    category: "",
    name: "",
    body: "",
    bullets: "",
    imageUrl: "",
    imageAlt: "",
    imageAnchor: DEFAULT_IMAGE_ANCHOR,
    priceRange: "",
    network: "amazon",
    affiliateUrl: "",
    badge: "",
    status: "live",
    tags: "",
    position: "0",
    isPublished: true,
  };
}

function productToForm(p: MarketplaceProduct): FormState {
  return {
    slug: p.slug,
    tabId: p.tabId,
    category: p.category,
    name: p.name,
    body: p.body,
    bullets: p.bullets.join("\n"),
    imageUrl: p.imageUrl,
    imageAlt: p.imageAlt,
    imageAnchor: p.imageAnchor,
    priceRange: p.priceRange,
    network: p.network,
    affiliateUrl: p.affiliateUrl,
    badge: p.badge ?? "",
    status: p.status,
    tags: p.tags.join(", "),
    position: String(p.position),
    isPublished: p.isPublished,
  };
}

function formToPayload(f: FormState) {
  return {
    slug: f.slug.trim() || undefined,
    tabId: f.tabId,
    category: f.category,
    name: f.name.trim(),
    body: f.body.trim(),
    bullets: f.bullets
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    imageUrl: f.imageUrl.trim(),
    imageAlt: f.imageAlt.trim(),
    imageAnchor: f.imageAnchor,
    priceRange: f.priceRange.trim(),
    network: f.network,
    affiliateUrl: f.affiliateUrl.trim(),
    badge: f.badge === "" ? null : f.badge,
    status: f.status,
    tags: f.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    position: Number(f.position) || 0,
    isPublished: f.isPublished,
  };
}

export default function MarketplaceAdmin({ initialProducts }: Props) {
  const router = useRouter();
  const [products, setProducts] =
    useState<MarketplaceProduct[]>(initialProducts);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(blankForm());
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [editForm, setEditForm] = useState<FormState>(blankForm());
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.tabId === filter);
  }, [products, filter]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (form.name.trim().length < 3) {
      setCreateError("Name must be at least 3 characters.");
      return;
    }
    if (!form.affiliateUrl.trim()) {
      setCreateError("Affiliate URL is required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data.error || "Create failed.");
        return;
      }
      setProducts((prev) =>
        [...prev, data.product as MarketplaceProduct].sort((a, b) => {
          if (a.tabId !== b.tabId) return a.tabId.localeCompare(b.tabId);
          if (a.position !== b.position) return a.position - b.position;
          return a.id - b.id;
        }),
      );
      setForm(blankForm());
      refresh();
    } catch {
      setCreateError("Network error. Try again.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(p: MarketplaceProduct) {
    setEditing(p);
    setEditForm(productToForm(p));
    setEditError("");
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditError("");
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/marketplace/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(editForm)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Update failed.");
        return;
      }
      const updated = data.product as MarketplaceProduct;
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      setEditing(null);
      refresh();
    } catch {
      setEditError("Network error. Try again.");
    } finally {
      setUpdating(false);
    }
  }

  async function togglePublish(p: MarketplaceProduct) {
    const res = await fetch(`/api/admin/marketplace/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !p.isPublished }),
    });
    if (!res.ok) return;
    setProducts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, isPublished: !x.isPublished } : x,
      ),
    );
    refresh();
  }

  async function handleDelete(p: MarketplaceProduct) {
    if (!confirm(`Delete "${p.name}"? This is permanent.`)) return;
    const res = await fetch(`/api/admin/marketplace/${p.id}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    refresh();
  }

  // A Map, not a literal Record: `out[p.tabId]++` on a Record produces NaN for
  // any tab outside the declared set rather than failing loudly. That is how a
  // stale tab value stayed invisible here for months.
  const countsByTab = useMemo(() => {
    const out = new Map<string, number>();
    for (const p of products) out.set(p.tabId, (out.get(p.tabId) ?? 0) + 1);
    return out;
  }, [products]);

  // Surfaced as a chip so a row that slipped through without a category is
  // visible immediately rather than sitting under "More gear" for a month.
  const uncategorizedCount = useMemo(
    () => products.filter((p) => !isKnownCategory(p.category)).length,
    [products],
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-near-black mb-1">
          Marketplace
        </h1>
        <p className="text-sm text-near-black/60">
          Curated affiliate products shown on /marketplace. Edits and drafts
          take effect on the public page after a refresh.
        </p>
      </div>

      <ProductForm
        title="Add a product"
        form={form}
        setForm={setForm}
        onSubmit={handleCreate}
        error={createError}
        submitting={creating}
        submitLabel="Create product"
        pending={pending}
      />

      <div className="mt-10 mb-4 flex flex-wrap items-center gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={products.length}
        />
        {TAB_IDS.map((id) => (
          <FilterChip
            key={id}
            active={filter === id}
            onClick={() => setFilter(id)}
            label={TAB_LABELS[id]}
            count={countsByTab.get(id) ?? 0}
          />
        ))}
        {/* The silent failure this guards against: a row created during a
            rolling deploy lands with category '', renders on the public page
            under "More gear", and nobody notices. If this reads 0 you are
            fine; if it does not, it is visible the next time you open admin. */}
        {uncategorizedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta/50 bg-terracotta/10 px-3 py-1.5 text-xs font-semibold text-terracotta">
            {uncategorizedCount} uncategorized
          </span>
        )}
      </div>

      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream border-b border-light-gray">
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Product
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Tab
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Network
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Price
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Pos
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Status
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-near-black/65 px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-near-black/55"
                >
                  No products in this view. Create one above.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-light-gray last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-near-black">
                      {p.name}
                    </p>
                    <p className="text-xs text-near-black/55 truncate max-w-[360px]">
                      {p.slug}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/85">
                    {TAB_LABELS[p.tabId]}
                    <span className="block text-near-black/45 text-[11px]">
                      {isKnownCategory(p.category)
                        ? categoryLabel(p.category)
                        : "— uncategorized —"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/85">
                    {NETWORK_LABELS[p.network]}
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/85">
                    {p.priceRange || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-near-black/70">
                    {p.position}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold w-fit",
                          p.isPublished
                            ? "bg-primary-green/10 text-primary-green"
                            : "bg-charcoal/10 text-charcoal/70",
                        ].join(" ")}
                      >
                        {p.isPublished ? "published" : "draft"}
                      </span>
                      <span className="text-[11px] text-near-black/55">
                        {STATUS_LABELS[p.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-xs font-semibold text-deep-teal hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(p)}
                        className="text-xs font-semibold text-primary-green hover:underline"
                      >
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
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

      {editing && (
        <EditModal
          title={`Edit: ${editing.name}`}
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleUpdate}
          error={editError}
          submitting={updating}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
        active
          ? "bg-near-black text-white"
          : "bg-cream text-near-black/70 hover:bg-cream/70 border border-light-gray",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-semibold",
          active ? "bg-white/20 text-white" : "bg-near-black/10 text-near-black/60",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function ProductForm({
  title,
  form,
  setForm,
  onSubmit,
  error,
  submitting,
  submitLabel,
  pending,
}: {
  title: string;
  form: FormState;
  setForm: (next: FormState) => void;
  onSubmit: (e: FormEvent) => void;
  error: string;
  submitting: boolean;
  submitLabel: string;
  pending?: boolean;
}) {
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm({ ...form, [key]: value });

  /**
   * Categories are disjoint per tab, so switching tabs must drop a category
   * that no longer applies. Handled explicitly rather than through update(),
   * because leaving stale state behind reproduces the exact bug that stranded
   * the retired "hotel" rows: the <select> renders the first option while state
   * still holds a value absent from the list, and submit writes the stale one.
   */
  const onTabChange = (next: MarketplaceTabId) => {
    const stillValid = categoriesForTab(next).some((c) => c.id === form.category);
    setForm({ ...form, tabId: next, category: stillValid ? form.category : "" });
  };

  return (
    <div className="bg-white border border-light-gray rounded-lg p-6">
      <h2 className="text-base font-semibold text-near-black mb-4">{title}</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="md:col-span-2 flex flex-col gap-1.5">
          <FieldLabel>Name *</FieldLabel>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g., Smart Lockbox (4-Digit Combo)"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Tab (audience) *</FieldLabel>
          <select
            value={form.tabId}
            onChange={(e) => onTabChange(e.target.value as MarketplaceTabId)}
            className={inputClass}
          >
            {TAB_IDS.map((id) => (
              <option key={id} value={id}>
                {TAB_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Category (section) *</FieldLabel>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a category…</option>
            {/* An unrecognized stored value is shown rather than silently
                swapped for whichever option the browser defaults to. Without
                this, opening a drifted row and saving an unrelated field would
                rewrite its category. */}
            {form.category && !findCategory(form.category) && (
              <option value={form.category} disabled>
                {form.category} (unrecognized)
              </option>
            )}
            {categoriesForTab(form.tabId).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>
            Slug{" "}
            <span className="text-near-black/45 normal-case">
              (optional — auto-derived if blank)
            </span>
          </FieldLabel>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="property-smart-lockbox"
            className={inputClass}
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-1.5">
          <FieldLabel>Description (1–2 sentences)</FieldLabel>
          <textarea
            rows={3}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            placeholder="The unattended check-in workhorse. Weatherproof, rotatable code."
            className={`${inputClass} resize-y`}
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-1.5">
          <FieldLabel>
            Bullets{" "}
            <span className="text-near-black/45 normal-case">
              (one per line, 3–4 recommended)
            </span>
          </FieldLabel>
          <textarea
            rows={4}
            value={form.bullets}
            onChange={(e) => update("bullets", e.target.value)}
            placeholder={"Rotatable code, no key handoff\nSurvives Southeast humidity\nDella uses this on every door"}
            className={`${inputClass} resize-y`}
          />
        </label>

        <ImageField
          value={form.imageUrl}
          onChange={(next) => update("imageUrl", next)}
          anchor={form.imageAnchor}
          onAnchorChange={(next) => update("imageAnchor", next)}
        />

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Image alt text</FieldLabel>
          <input
            type="text"
            value={form.imageAlt}
            onChange={(e) => update("imageAlt", e.target.value)}
            placeholder="Smart lockbox mounted by a front door"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Price range</FieldLabel>
          <input
            type="text"
            value={form.priceRange}
            onChange={(e) => update("priceRange", e.target.value)}
            placeholder="$24–$40"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Network *</FieldLabel>
          <select
            value={form.network}
            onChange={(e) =>
              update("network", e.target.value as AffiliateNetwork)
            }
            className={inputClass}
          >
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {NETWORK_LABELS[n]}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2 flex flex-col gap-1.5">
          <FieldLabel>Affiliate URL *</FieldLabel>
          <input
            type="url"
            value={form.affiliateUrl}
            onChange={(e) => update("affiliateUrl", e.target.value)}
            placeholder="https://www.amazon.com/dp/B0XXXXXXX?tag=benicehosp-20"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Badge</FieldLabel>
          <select
            value={form.badge}
            onChange={(e) =>
              update("badge", e.target.value as "" | ProductBadge)
            }
            className={inputClass}
          >
            <option value="">— none —</option>
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Status *</FieldLabel>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as ProductStatus)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Position (lower = first)</FieldLabel>
          <input
            type="number"
            value={form.position}
            onChange={(e) => update("position", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>
            Tags{" "}
            <span className="text-near-black/45 normal-case">
              (comma-separated, used for search)
            </span>
          </FieldLabel>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="lockbox, access, check-in"
            className={inputClass}
          />
        </label>

        <label className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update("isPublished", e.target.checked)}
            className="w-4 h-4 accent-primary-green"
          />
          <span className="text-sm text-near-black/85">
            Publish immediately
          </span>
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-green text-white hover:bg-primary-green-dark px-5 py-2.5 text-sm font-semibold rounded-md disabled:opacity-50"
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
          {pending && (
            <p className="text-sm text-near-black/55">Refreshing…</p>
          )}
        </div>
      </form>
    </div>
  );
}

function EditModal({
  title,
  form,
  setForm,
  onSubmit,
  error,
  submitting,
  onCancel,
}: {
  title: string;
  form: FormState;
  setForm: (next: FormState) => void;
  onSubmit: (e: FormEvent) => void;
  error: string;
  submitting: boolean;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-6 overflow-y-auto bg-near-black/60"
    >
      <div className="relative w-full max-w-3xl my-6 bg-white border border-light-gray rounded-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray">
          <h2 className="text-base font-semibold text-near-black">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-near-black/55 hover:text-near-black hover:bg-near-black/5 transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <ProductForm
            title=""
            form={form}
            setForm={setForm}
            onSubmit={onSubmit}
            error={error}
            submitting={submitting}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Product image: type a path, upload a file, or import from a web URL.
 *
 * Upload and import both resolve to /api/images/<id>. A pasted link is copied
 * server-side rather than stored as-is -- see src/lib/image-import.ts for why.
 */
function ImageField({
  value,
  onChange,
  anchor,
  onAnchorChange,
}: {
  value: string;
  onChange: (next: string) => void;
  anchor: ImageAnchor;
  onAnchorChange: (next: ImageAnchor) => void;
}) {
  const [busy, setBusy] = useState<"" | "upload" | "import">("");
  const [error, setError] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [broken, setBroken] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function post(
    endpoint: string,
    init: RequestInit,
    kind: "upload" | "import",
  ) {
    setError("");
    setBusy(kind);
    try {
      const res = await fetch(endpoint, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setBroken(false);
      onChange(data.url as string);
      setLink("");
      setLinkOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const trimmed = value.trim();
  // Flags a value the public page cannot render BEFORE it is saved: an
  // un-allowlisted host in image_url 500s /marketplace on next/image.
  const willNotRender = trimmed !== "" && !isRenderableImageUrl(trimmed);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Product image</FieldLabel>

      <div className="flex gap-3 items-start">
        {/* 16:9 to match ProductCard's aspect box, so the crop shown here is
            the crop that ships. A square preview would lie about it. */}
        {trimmed && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trimmed}
            alt=""
            onError={() => setBroken(true)}
            onLoad={() => setBroken(false)}
            style={{ objectPosition: objectPositionFor(anchor) }}
            className="w-32 aspect-video rounded-md object-cover border border-light-gray bg-white shrink-0"
          />
        ) : (
          <div className="w-32 aspect-video rounded-md border border-dashed border-light-gray bg-off-white shrink-0 flex items-center justify-center text-[10px] text-near-black/40 text-center px-1">
            {broken ? "Won't load" : "No image"}
          </div>
        )}

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
            placeholder="/images/products/lockbox.jpg"
            className={inputClass}
          />

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const body = new FormData();
                body.append("file", file);
                void post("/api/admin/uploads", { method: "POST", body }, "upload");
              }}
            />
            <button
              type="button"
              disabled={busy !== ""}
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-light-gray hover:border-primary-green disabled:opacity-50"
            >
              {busy === "upload" ? "Uploading..." : "Upload file"}
            </button>
            <button
              type="button"
              disabled={busy !== ""}
              onClick={() => setLinkOpen((o) => !o)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-light-gray hover:border-primary-green disabled:opacity-50"
            >
              Import from URL
            </button>
            {trimmed && (
              <button
                type="button"
                disabled={busy !== ""}
                onClick={() => {
                  setBroken(false);
                  setError("");
                  onChange("");
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-light-gray hover:border-terracotta text-near-black/60 disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-near-black/50 mr-0.5">
              Anchor
            </span>
            {IMAGE_ANCHORS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={anchor === a}
                onClick={() => onAnchorChange(a)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                  anchor === a
                    ? "border-primary-green bg-primary-green text-white"
                    : "border-light-gray text-near-black/60 hover:border-primary-green"
                }`}
              >
                {IMAGE_ANCHOR_LABELS[a]}
              </button>
            ))}
          </div>

          {linkOpen && (
            <div className="flex gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  // The field lives inside the product <form>; Enter would
                  // otherwise submit the whole product.
                  e.preventDefault();
                  if (link.trim() && busy === "") {
                    void post(
                      "/api/admin/uploads/from-url",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: link.trim() }),
                      },
                      "import",
                    );
                  }
                }}
                placeholder="https://example.com/product-photo.jpg"
                className={`${inputClass} flex-1 min-w-0`}
              />
              <button
                type="button"
                disabled={busy !== "" || !link.trim()}
                onClick={() =>
                  void post(
                    "/api/admin/uploads/from-url",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: link.trim() }),
                    },
                    "import",
                  )
                }
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-green text-white disabled:opacity-50 shrink-0"
              >
                {busy === "import" ? "Importing..." : "Import"}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-terracotta">{error}</p>}
          {!error && willNotRender && (
            <p className="text-xs text-terracotta">
              This value will not render on /marketplace. Upload the file or
              import it from its URL instead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-near-black/60">
      {children}
    </span>
  );
}

const inputClass =
  "border border-light-gray rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-green";
