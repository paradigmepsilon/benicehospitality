"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Tier {
  id: number;
  tier: "self-paced" | "cohort" | "operator";
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  isPublished: boolean;
  position: number;
}

const TIER_OPTIONS: Array<Tier["tier"]> = ["self-paced", "cohort", "operator"];

export default function TiersEditor({
  courseId,
  initialTiers,
}: {
  courseId: number;
  initialTiers: Tier[];
}) {
  const router = useRouter();
  const [tiers, setTiers] = useState(initialTiers);
  const [creating, setCreating] = useState(false);
  const [newTier, setNewTier] = useState({
    tier: "self-paced" as Tier["tier"],
    name: "",
    description: "",
    priceDollars: "",
  });
  const [busyId, setBusyId] = useState<number | "new" | null>(null);

  const usedTiers = new Set(tiers.map((t) => t.tier));
  const availableTiers = TIER_OPTIONS.filter((t) => !usedTiers.has(t));

  async function patchTier(id: number, patch: Record<string, unknown>) {
    setBusyId(id);
    const res = await fetch(`/api/admin/tiers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusyId(null);
    if (!res.ok) return;
    if (Object.prototype.hasOwnProperty.call(patch, "price_cents")) {
      // Reset stripe_price_id locally to reflect server behavior.
      setTiers((ts) =>
        ts.map((t) => (t.id === id ? { ...t, stripePriceId: null } : t)),
      );
    }
    router.refresh();
  }

  async function handleCreate() {
    const cents = Math.round(Number(newTier.priceDollars) * 100);
    if (!Number.isFinite(cents) || cents <= 0 || !newTier.name.trim()) return;
    setBusyId("new");
    const res = await fetch(`/api/admin/courses/${courseId}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier: newTier.tier,
        name: newTier.name,
        description: newTier.description,
        price_cents: cents,
      }),
    });
    setBusyId(null);
    if (res.ok) {
      setCreating(false);
      setNewTier({ tier: "self-paced", name: "", description: "", priceDollars: "" });
      router.refresh();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this tier? Existing purchases stay valid.")) return;
    setBusyId(id);
    await fetch(`/api/admin/tiers/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-warm-gold/10 border border-warm-gold/40 rounded-md px-4 py-3 font-sans text-sm text-charcoal/85">
        <strong className="text-warm-gold-dark">Heads up:</strong> after
        adding/changing a price, run{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">
          npm run stripe:sync
        </code>{" "}
        to push the new price to Stripe and unlock checkout.
      </div>

      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream/50 border-b border-light-gray">
            <tr>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">Tier</th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">Name</th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">Price</th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">Stripe</th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">Published</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tiers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-sans text-sm text-charcoal/55">
                  No tiers yet.
                </td>
              </tr>
            ) : (
              tiers.map((t) => (
                <tr key={t.id} className="border-b border-light-gray last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/70">{t.tier}</td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={t.name}
                      onBlur={(e) => {
                        if (e.target.value !== t.name) {
                          patchTier(t.id, { name: e.target.value });
                        }
                      }}
                      className="w-full font-sans text-sm border border-light-gray rounded-md px-2 py-1.5 focus:outline-none focus:border-primary-green"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-sans text-xs text-charcoal/55">$</span>
                      <input
                        type="number"
                        step="1"
                        defaultValue={(t.priceCents / 100).toString()}
                        onBlur={(e) => {
                          const cents = Math.round(Number(e.target.value) * 100);
                          if (Number.isFinite(cents) && cents > 0 && cents !== t.priceCents) {
                            patchTier(t.id, { price_cents: cents });
                          }
                        }}
                        className="w-24 font-sans text-sm border border-light-gray rounded-md px-2 py-1.5 focus:outline-none focus:border-primary-green"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {t.stripePriceId ? (
                      <span className="font-mono text-[10px] text-charcoal/65 truncate max-w-[140px] block">
                        {t.stripePriceId}
                      </span>
                    ) : (
                      <span className="font-sans text-xs text-warm-gold-dark font-semibold">
                        sync needed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={t.isPublished}
                      onChange={(e) => {
                        setTiers((ts) =>
                          ts.map((x) =>
                            x.id === t.id ? { ...x, isPublished: e.target.checked } : x,
                          ),
                        );
                        patchTier(t.id, { is_published: e.target.checked });
                      }}
                      disabled={busyId === t.id}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="font-sans text-xs font-semibold text-red-600 hover:text-red-800"
                      disabled={busyId === t.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {availableTiers.length > 0 && !creating && (
        <button
          onClick={() => setCreating(true)}
          className="bg-[#1a1a1a] text-white font-sans text-sm font-semibold rounded-md px-4 py-2 hover:bg-charcoal/90 transition-colors"
        >
          + Add tier
        </button>
      )}

      {creating && (
        <div className="bg-white border border-light-gray rounded-lg p-5 space-y-4">
          <h3 className="font-display text-base font-semibold text-deep-teal">
            New tier
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-1.5">
                Tier slug
              </span>
              <select
                value={newTier.tier}
                onChange={(e) =>
                  setNewTier((n) => ({ ...n, tier: e.target.value as Tier["tier"] }))
                }
                className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
              >
                {availableTiers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-1.5">
                Display name
              </span>
              <input
                value={newTier.name}
                onChange={(e) => setNewTier((n) => ({ ...n, name: e.target.value }))}
                placeholder="Self-paced"
                className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-1.5">
                Price (USD)
              </span>
              <input
                type="number"
                value={newTier.priceDollars}
                onChange={(e) =>
                  setNewTier((n) => ({ ...n, priceDollars: e.target.value }))
                }
                placeholder="497"
                className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-1.5">
              Description
            </span>
            <textarea
              value={newTier.description}
              onChange={(e) => setNewTier((n) => ({ ...n, description: e.target.value }))}
              rows={2}
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={busyId === "new"}
              className="bg-primary-green text-white font-sans text-sm font-semibold rounded-md px-4 py-2 hover:bg-primary-green-dark disabled:opacity-50"
            >
              {busyId === "new" ? "Creating…" : "Create tier"}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="font-sans text-sm text-charcoal/70 hover:text-charcoal px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
