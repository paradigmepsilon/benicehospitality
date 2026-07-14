"use client";

import { useMemo, useState } from "react";
import { useSyncedState } from "./sync-client";
import { exampleFor } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";
import { IconCopy, IconCheck, IconDoc } from "./Icons";

/**
 * Editable template. [BRACKETED] tokens in the authored body become real
 * form fields; the assembled document previews live below and is what the
 * print styles keep. Entries persist on-device, so a host can fill, print,
 * come back, edit, and print again. Example mode previews the same template
 * completed with the product's one shared fictional claim.
 */

const TOKEN_RE = /(\[[^\[\]\n]{1,70}\])/g;

function tokenLabel(t: string): string {
  const inner = t.slice(1, -1).trim();
  // Format patterns like YYYY-MM-DD or DATE, TIME stay as authored.
  if (/^[ymdhs\s,:/-]+$/i.test(inner)) return inner.toUpperCase();
  const words = inner.replace(/-/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function TemplateEditor({
  toolSlug,
  claimId,
  id,
  title,
  context,
  body,
}: {
  toolSlug: string;
  claimId: number | null;
  id: string;
  title: string;
  context?: string;
  body: string;
}) {
  const [values, setValues] = useSyncedState<Record<string, string>>(
    `tpl:${toolSlug}:${id}`,
    claimId,
    {},
  );
  const [example, setExample] = useState(false);
  const [copied, setCopied] = useState(false);

  const segments = useMemo(() => body.split(TOKEN_RE), [body]);
  const tokens = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of segments) {
      TOKEN_RE.lastIndex = 0;
      // A fill-in token needs a letter; "[ ]" and "[X]" checkboxes stay literal.
      const inner = s.slice(1, -1).trim();
      const isFillIn = /[A-Za-z]/.test(inner) && inner.toUpperCase() !== "X";
      if (TOKEN_RE.test(s) && isFillIn && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
      TOKEN_RE.lastIndex = 0;
    }
    return out;
  }, [segments]);

  const filledCount = tokens.filter((t) => (values[t] ?? "").trim()).length;

  async function copyMine() {
    const text = segments
      .map((s) =>
        tokens.includes(s) && (values[s] ?? "").trim() ? values[s].trim() : s,
      )
      .join("");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: user can still select the preview manually
    }
  }

  return (
    <div className="rounded-[1.4rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
      <div className="rounded-[calc(1.4rem-0.375rem)] bg-[#2A2932] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        {/* header */}
        <div className="cp-noprint flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#E19C63]/12 text-[#E19C63]">
              <IconDoc className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-bold text-white">
                {title}
              </p>
              {context && (
                <p className="font-sans text-xs text-white/50">{context}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tokens.length > 0 && <ExampleToggle on={example} onToggle={setExample} />}
            <button
              onClick={copyMine}
              className={
                "inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] " +
                (copied
                  ? "bg-[#E19C63] text-[#27262E]"
                  : "border border-[#E19C63]/50 text-[#E19C63] hover:bg-[#E19C63] hover:text-[#27262E]")
              }
            >
              {copied ? (
                <IconCheck className="h-3.5 w-3.5" />
              ) : (
                <IconCopy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : example ? "Copy my version" : "Copy"}
            </button>
          </div>
        </div>

        {/* fill-in fields */}
        {tokens.length > 0 && !example && (
          <div className="cp-noprint border-b border-white/10 px-5 py-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Fill in your details
              </p>
              <span className="font-sans text-[11px] tabular-nums text-[#8BA5BE]">
                {filledCount}/{tokens.length} filled
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tokens.map((t) => (
                <label key={t} className="block">
                  <span className="mb-1 block font-sans text-[11px] text-white/50">
                    {tokenLabel(t)}
                  </span>
                  <input
                    value={values[t] ?? ""}
                    onChange={(e) =>
                      setValues((p) => ({ ...p, [t]: e.target.value }))
                    }
                    placeholder={exampleFor(t.slice(1, -1))}
                    className="w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 font-sans text-sm text-white outline-none transition-colors placeholder:text-white/22 focus:border-[#E19C63]"
                  />
                </label>
              ))}
            </div>
            {filledCount > 0 && (
              <button
                onClick={() => setValues({})}
                className="mt-3 cursor-pointer font-sans text-[11px] text-white/35 underline underline-offset-4 transition-colors hover:text-[#E19C63]"
              >
                Clear my entries
              </button>
            )}
          </div>
        )}

        {example && (
          <div className="cp-noprint px-5 pt-4">
            <ExampleBanner />
          </div>
        )}

        {/* live document preview (this is what prints) */}
        <div className="px-5 py-4">
          <p className="cp-noprint mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {example ? "Completed example" : "Your document"}
          </p>
          <pre className="cp-paper whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-white/80">
            {segments.map((s, i) => {
              if (!tokens.includes(s)) return s;
              if (example) {
                return (
                  <span key={i} className="font-medium italic text-[#8BA5BE]">
                    {exampleFor(s.slice(1, -1))}
                  </span>
                );
              }
              const v = (values[s] ?? "").trim();
              return v ? (
                <span key={i} className="font-semibold text-[#EBB183]">
                  {v}
                </span>
              ) : (
                <span
                  key={i}
                  className="rounded border border-dashed border-[#8BA5BE]/50 px-1 text-[#8BA5BE]/80"
                >
                  {s}
                </span>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
}
