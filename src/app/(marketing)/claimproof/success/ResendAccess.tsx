"use client";

import { useState } from "react";

/**
 * Self-serve "resend my access email" for the Claim Proof success page. Posts
 * to /api/claimproof/resend-access, which re-sends the delivery email (download
 * link + Command Center portal magic link). Prefilled with the buyer's email
 * when the success page could resolve it from the Stripe session.
 */
export default function ResendAccess({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    setMsg("");
    try {
      const r = await fetch("/api/claimproof/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const d = (await r.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (r.ok) {
        setState("done");
        setMsg(d.message || "Sent. Check your inbox.");
      } else {
        setState("error");
        setMsg(d.error || "Could not send. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Could not send. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-near-black/10 bg-white p-6 text-left shadow-sm">
      <h2 className="font-display text-lg font-semibold text-deep-teal mb-2">
        Didn&rsquo;t get the email?
      </h2>
      <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-4">
        Enter the email you used at checkout and we&rsquo;ll resend your access
        link and download.
      </p>
      {state === "done" ? (
        <p className="font-sans text-sm text-deep-teal leading-relaxed">
          {msg}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="cp-resend-email" className="sr-only">
            Email address
          </label>
          <input
            id="cp-resend-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-near-black/15 bg-cream px-4 py-3 font-sans text-sm text-near-black outline-none focus:border-deep-teal"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded-lg bg-deep-teal px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-teal-light disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Resend access"}
          </button>
        </form>
      )}
      {state === "error" && (
        <p className="mt-3 font-sans text-sm text-terracotta">{msg}</p>
      )}
    </div>
  );
}
