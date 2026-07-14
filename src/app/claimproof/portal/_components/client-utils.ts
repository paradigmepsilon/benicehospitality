"use client";

/**
 * Formatting + CSV helpers for the portal's interactive tools. Tool state
 * itself now syncs to the buyer's account via useSyncedState (sync-client.ts);
 * these are the pure client-side utilities that remain.
 */

/** Client-side CSV download. Quotes every cell; no server round-trip. */
export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function num(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Format a ratio 0..100 as a whole-number percent, or "—" when undefined. */
export function pct(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}

/** One-decimal number, or "—" when undefined. */
export function dec1(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}
