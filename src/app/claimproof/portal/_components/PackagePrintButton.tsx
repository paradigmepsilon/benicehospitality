"use client";

import { useState } from "react";

/**
 * Downloads a whole-package PDF from /api/claimproof/pdf: every tool the
 * buyer's tier unlocks, in one print-ready document (cover + contents + one
 * page per tool). Pass a packSlug to export just that pack instead of the
 * whole tier. Same fetch->blob->download pattern as the per-tool PrintButton;
 * the server enforces tier access.
 */
export default function PackagePrintButton({
  packSlug,
  label = "Download my whole kit",
}: {
  packSlug?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function download() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const params = new URLSearchParams(
        packSlug ? { pack: packSlug } : { scope: "all" },
      );
      const r = await fetch(`/api/claimproof/pdf?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Could not generate the PDF.");
      }
      const blob = await r.blob();
      const dispo = r.headers.get("Content-Disposition") || "";
      const match = /filename="([^"]+)"/.exec(dispo);
      const name = match?.[1] || "claim-proof-kit.pdf";
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = name;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not generate the PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2 print:hidden">
      <button
        onClick={download}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-[#E19C63]/40 bg-[#E19C63]/[0.08] px-4 py-2 font-sans text-xs font-semibold text-[#E19C63] transition-colors hover:border-[#E19C63] hover:bg-[#E19C63]/15 disabled:opacity-50"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M4 1h8v4h1.5A1.5 1.5 0 0 1 15 6.5v5A1.5 1.5 0 0 1 13.5 13H12v2H4v-2H2.5A1.5 1.5 0 0 1 1 11.5v-5A1.5 1.5 0 0 1 2.5 5H4V1Zm1.5 1.5V5h5V2.5h-5ZM5.5 10v3.5h5V10h-5Z" />
        </svg>
        {busy ? "Building your kit…" : label}
      </button>
      {err && <span className="font-sans text-xs text-[#E19C63]">{err}</span>}
    </span>
  );
}
