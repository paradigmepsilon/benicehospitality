"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center bg-warm-gold hover:bg-warm-gold/90 text-near-black font-semibold px-5 py-2.5 rounded-md transition-colors text-sm"
    >
      Print or save as PDF
    </button>
  );
}
