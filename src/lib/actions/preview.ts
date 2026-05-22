"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/community-auth";
import {
  PREVIEW_COOKIE_NAME,
  type PreviewMode,
} from "@/lib/preview-cookie";

// Server actions that toggle "admin previewing as member" mode. The cookie
// is the source of truth — checking session.role alone isn't enough because
// admins can be in admin mode, god-view preview, or tier-N preview, and we
// want every /account/* page to know which without each one threading the
// flag through searchParams.

const VALID_TARGETS: ReadonlyArray<NonNullable<PreviewMode>> = [
  "self-paced",
  "cohort",
  "operator",
];

function coerceTarget(raw: FormDataEntryValue | null): PreviewMode {
  if (raw === null) return null;
  const v = typeof raw === "string" ? raw : raw.toString();
  if (v === "exit") return null;
  return (VALID_TARGETS as readonly string[]).includes(v)
    ? (v as PreviewMode)
    : null;
}

// Bound form-action variant. The form posts a `target` field with one of:
//   "self-paced" — Tier 1
//   "cohort"     — Tier 2
//   "operator"   — Tier 3
//   "exit"       — exit preview, return to /admin
export async function setPreviewMode(formData: FormData): Promise<never> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }
  const target = coerceTarget(formData.get("target"));
  const cookieStore = await cookies();
  if (target === null) {
    cookieStore.delete(PREVIEW_COOKIE_NAME);
    redirect("/admin");
  }
  cookieStore.set(PREVIEW_COOKIE_NAME, target, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/account");
}
