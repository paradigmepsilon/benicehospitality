"use client";

// "Add to my dashboard" — the one control that puts a resource on a member's
// shelf. Used on the /resources index cards, on tool pages, and in remove mode
// on /account/resources.
//
// ONE-WAY BY DESIGN. This was a toggle: it rendered its own state as its label,
// so a saved tool showed "Saved" and clicking it removed the tool. Combined
// with the old auto-add-on-open, a member landed on a tool page, saw "Saved"
// for something they had never saved, clicked it expecting to save, and
// un-saved it instead.
//
// Now: unsaved renders an ASK ("Add to my dashboard"), saved renders a
// CONFIRMATION that is not a button at all. Removal lives in exactly one place,
// the dashboard, via variant="remove". A control cannot be mistaken for its own
// opposite if it only does one thing.
//
// There is no toast system in this app and this feature does not justify
// adding one; feedback is an adjacent aria-live region instead.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Lock, Trash2 } from "lucide-react";
import posthog from "posthog-js";
import { useSavedTools } from "./SavedToolsProvider";

const MESSAGE_TIMEOUT_MS = 2500;

export type SaveToolVariant = "card" | "page" | "remove";

interface SaveToolButtonProps {
  slug: string;
  toolName: string;
  /** Server-known values. Context wins once it has loaded. */
  loggedIn?: boolean;
  initialSaved?: boolean;
  variant?: SaveToolVariant;
  /** Admin previewing a member tier — writes are refused server-side too. */
  readOnly?: boolean;
  onChange?: (saved: boolean) => void;
  className?: string;
}

export default function SaveToolButton({
  slug,
  toolName,
  loggedIn: loggedInProp = false,
  initialSaved = false,
  variant = "card",
  readOnly = false,
  onChange,
  className = "",
}: SaveToolButtonProps) {
  const ctx = useSavedTools();
  const [saved, setLocalSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Context is authoritative once loaded (it reflects saves made on other
  // cards this session); props carry the server's answer until then.
  const loggedIn = ctx?.ready ? ctx.loggedIn : loggedInProp;
  const isSaved = ctx?.ready ? ctx.isSaved(slug) : saved;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const flash = useCallback((text: string) => {
    setMessage(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }, []);

  const handleClick = useCallback(async () => {
    if (pending || readOnly) return;
    // Only the dashboard's remove variant may un-save. Everywhere else this is
    // an add-only control and the saved state does not render a button at all,
    // so this guard is belt to that brace.
    if (isSaved && variant !== "remove") return;
    const next = !isSaved;

    // Optimistic in both places, reverted together on failure.
    setLocalSaved(next);
    ctx?.setSaved(slug, next);
    setPending(true);

    try {
      const res = await fetch(`/api/resources/${slug}/save`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) {
        setLocalSaved(!next);
        ctx?.setSaved(slug, !next);
        flash(
          res.status === 401
            ? "Sign in to save."
            : "Couldn't save. Try again.",
        );
        return;
      }
      flash(next ? "Saved to your dashboard" : "Removed");
      onChange?.(next);
      try {
        posthog.capture(next ? "resource_saved" : "resource_unsaved", {
          tool_slug: slug,
          surface: variant,
        });
      } catch {
        // Analytics must never break the interaction.
      }
    } catch {
      setLocalSaved(!next);
      ctx?.setSaved(slug, !next);
      flash("Couldn't save. Try again.");
    } finally {
      setPending(false);
    }
  }, [pending, readOnly, isSaved, ctx, slug, flash, onChange, variant]);

  const base =
    "inline-flex items-center gap-1.5 font-sans font-semibold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizing =
    variant === "page"
      ? "w-full justify-center rounded-lg px-6 py-3 text-sm min-h-[48px] border-2"
      : "rounded-md px-3 py-1.5 text-xs border";

  // Logged out: no write is possible, so this is a link into signup that
  // returns to the tool. Never a button.
  if (!loggedIn) {
    return (
      <Link
        href={`/signup?next=/resources/${slug}`}
        className={`${base} ${sizing} border-light-gray text-charcoal/70 hover:border-warm-gold hover:text-warm-gold-dark bg-white ${className}`}
      >
        <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
        Save to your dashboard
      </Link>
    );
  }

  // Saved, outside the dashboard: a statement of fact, not a control. Rendering
  // a button here is what made "Saved" look like the thing to click.
  if (isSaved && variant !== "remove") {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <span
          className={`${base} ${sizing} border-primary-green bg-primary-green/10 text-primary-green ${className}`}
        >
          <BookmarkCheck className="w-3.5 h-3.5 shrink-0" aria-hidden />
          Saved
        </span>
        {variant === "page" && (
          <Link
            href="/account/resources"
            className="font-sans text-xs text-charcoal/60 hover:text-primary-green underline underline-offset-2"
          >
            On your dashboard — manage it there
          </Link>
        )}
      </span>
    );
  }

  const Icon = variant === "remove" ? Trash2 : Bookmark;
  const label =
    variant === "remove"
      ? "Remove"
      : variant === "page"
        ? "Add to my dashboard"
        : "Save";

  const tone =
    variant === "remove"
      ? "border-light-gray text-charcoal/60 hover:border-terracotta hover:text-terracotta bg-white"
      : "border-light-gray bg-white text-charcoal/70 hover:border-primary-green hover:text-primary-green";

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || readOnly}
        title={
          readOnly
            ? "Not available in preview mode"
            : variant === "remove"
              ? `Remove ${toolName} from your dashboard`
              : `Add ${toolName} to your dashboard`
        }
        className={`${base} ${sizing} ${tone} ${className}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
        {label}
      </button>
      {message && (
        <span
          role="status"
          aria-live="polite"
          className="font-sans text-xs text-charcoal/60"
        >
          {message}
        </span>
      )}
    </span>
  );
}
