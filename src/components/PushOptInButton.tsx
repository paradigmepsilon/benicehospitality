"use client";

import { useEffect, useState } from "react";
import { pushSupported, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";

type Status = "pending" | "idle" | "working" | "subscribed" | "blocked" | "unsupported";

export default function PushOptInButton({ className }: { className?: string }) {
  // Start "pending" so SSR and first client render match; the effect resolves
  // the real state asynchronously, which keeps setState out of the sync path.
  const [status, setStatus] = useState<Status>("pending");

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      if (!pushSupported()) return "unsupported" as const;
      if (Notification.permission === "denied") return "blocked" as const;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        return sub ? ("subscribed" as const) : ("idle" as const);
      } catch {
        return "idle" as const;
      }
    };
    resolve().then((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "pending" || status === "unsupported") return null;

  const toggle = async () => {
    setStatus("working");
    try {
      if (status === "subscribed") {
        await unsubscribeFromPush();
        setStatus("idle");
      } else {
        const ok = await subscribeToPush();
        setStatus(ok ? "subscribed" : Notification.permission === "denied" ? "blocked" : "idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  const label =
    status === "working"
      ? "..."
      : status === "subscribed"
        ? "Notifications on"
        : status === "blocked"
          ? "Notifications blocked"
          : "Enable notifications";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={status === "working" || status === "blocked"}
      className={className}
      style={
        className
          ? undefined
          : {
              background: status === "subscribed" ? "#4a7d25" : "#5b9a2f",
              color: "#fff",
              border: "none",
              borderRadius: "0.625rem",
              padding: "0.6rem 1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: status === "blocked" ? "not-allowed" : "pointer",
              opacity: status === "blocked" ? 0.6 : 1,
              fontFamily: "var(--font-dm-sans), sans-serif",
            }
      }
    >
      {label}
    </button>
  );
}
