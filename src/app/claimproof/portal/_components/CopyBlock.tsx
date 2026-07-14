"use client";

import { useState } from "react";

/**
 * Copyable template block: monospace body, one-tap copy. [BRACKETED] tokens
 * are the fill-ins; the copy carries them verbatim so the host fills them in
 * their own message draft.
 */
export default function CopyBlock({
  title,
  context,
  body,
}: {
  title: string;
  context?: string;
  body: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: user can still select the text manually
    }
  }

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div className="min-w-0">
          <p className="font-sans text-sm font-bold text-white truncate">
            {title}
          </p>
          {context && (
            <p className="font-sans text-xs text-white/50">{context}</p>
          )}
        </div>
        <button
          onClick={copy}
          className={
            "flex-none rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all " +
            (copied
              ? "bg-[#E19C63] text-[#27262E]"
              : "border border-[#E19C63]/50 text-[#E19C63] hover:bg-[#E19C63] hover:text-[#27262E]")
          }
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap px-5 py-4 font-mono text-[13px] leading-relaxed text-white/80 overflow-x-auto">
        {body}
      </pre>
    </div>
  );
}
