"use client";

import { useEffect, useState } from "react";

// The beforeinstallprompt event is non-standard; type it locally.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "bnhg-install-dismissed";
// Re-show the banner this many days after a dismissal.
const DISMISS_DAYS = 30;

function recentlyDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const elapsed = Date.now() - Number(ts);
    return elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed (standalone) — never show.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore storage failures
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install app"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "1rem",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "min(92vw, 32rem)",
        padding: "0.875rem 1rem",
        borderRadius: "0.875rem",
        background: "#f8f6f1",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      {/* Small static banner icon; next/image is unnecessary here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-192.png"
        alt=""
        width={40}
        height={40}
        style={{ borderRadius: "0.5rem", flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.95rem" }}>
          Install Be Nice
        </div>
        <div style={{ color: "#807868", fontSize: "0.8rem" }}>
          Add to your home screen for quick access.
        </div>
      </div>
      <button
        onClick={dismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "#807868",
          cursor: "pointer",
          fontSize: "0.85rem",
          padding: "0.5rem",
        }}
      >
        Not now
      </button>
      <button
        onClick={install}
        style={{
          background: "#5b9a2f",
          color: "#fff",
          border: "none",
          borderRadius: "0.625rem",
          padding: "0.55rem 0.9rem",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Install
      </button>
    </div>
  );
}
