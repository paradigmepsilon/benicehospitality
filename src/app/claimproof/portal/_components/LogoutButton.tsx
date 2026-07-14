"use client";

import { useState } from "react";

/**
 * Portal sign-out. Revokes the session server-side (/api/auth/logout) then hard-
 * navigates to the Claim Proof login door so the cleared cookie takes effect on
 * the next request. Styled to sit in the portal's glass nav.
 */
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // fall through to navigation regardless; the endpoint clears the cookie
    }
    window.location.assign("/claimproof/login");
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="rounded-full px-3.5 py-1.5 font-sans text-sm text-white/60 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
