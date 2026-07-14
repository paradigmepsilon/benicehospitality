"use client";

import { useState } from "react";

/** Copy-to-clipboard button with brief "Copied" feedback. */
export default function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — no-op; the text is still selectable on screen.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        "inline-flex items-center gap-1.5 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-xs px-3 py-1.5 rounded-md transition-colors " +
        className
      }
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
