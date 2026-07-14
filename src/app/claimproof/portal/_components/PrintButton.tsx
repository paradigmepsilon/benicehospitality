"use client";

import { useState } from "react";

/**
 * Downloads a server-generated PDF of the current tool from /api/claimproof/pdf.
 * The PDF is a complete, sectioned document that includes the host's saved
 * checklist/step state and typed worksheet content — not a screenshot of the
 * screen. Falls back to a clear error if the export fails.
 */
export default function PrintButton({
  packSlug,
  toolSlug,
  claimId,
}: {
  packSlug: string;
  toolSlug: string;
  claimId: number | null;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function download() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ pack: packSlug, tool: toolSlug });
      if (claimId != null) params.set("claim", String(claimId));
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
      const name = match?.[1] || `claim-proof-${toolSlug}.pdf`;
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
        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-sans text-xs font-semibold text-white/70 transition-colors hover:border-[#8BA5BE] hover:text-[#8BA5BE] disabled:opacity-50"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M4 1h8v4h1.5A1.5 1.5 0 0 1 15 6.5v5A1.5 1.5 0 0 1 13.5 13H12v2H4v-2H2.5A1.5 1.5 0 0 1 1 11.5v-5A1.5 1.5 0 0 1 2.5 5H4V1Zm1.5 1.5V5h5V2.5h-5ZM5.5 10v3.5h5V10h-5Z" />
        </svg>
        {busy ? "Building PDF…" : "Download PDF"}
      </button>
      {err && <span className="font-sans text-xs text-[#E19C63]">{err}</span>}
    </span>
  );
}
