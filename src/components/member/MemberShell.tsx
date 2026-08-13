"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import { personId } from "@/lib/posthog-identity";
import type { PreviewMode } from "@/lib/preview-cookie";

const MODE_LABEL: Record<NonNullable<PreviewMode>, string> = {
  "self-paced": "Tier 1 · Self-paced",
  cohort: "Tier 2 · Cohort",
  operator: "Tier 3 · Operator",
};

const NAV_ITEMS = [
  { label: "Overview", href: "/account", icon: "grid" },
  { label: "Courses", href: "/account/courses", icon: "book" },
  { label: "Community", href: "/account/community", icon: "users" },
  { label: "Your resources", href: "/account/resources", icon: "edit" },
];

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "grid":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "book":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "edit":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MemberShell({
  children,
  userId,
  userEmail,
  previewMode = null,
  previewPicker,
}: {
  children: React.ReactNode;
  userId: number;
  userEmail: string;
  previewMode?: PreviewMode;
  // Server-rendered preview-mode picker. Slotted in as a prop so this client
  // component doesn't have to import server actions directly.
  previewPicker?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPreview = previewMode !== null;

  // Re-identify on every page load so returning sessions are linked to the user.
  // Keyed on email (see lib/posthog-identity) so a member's course activity
  // joins the same person as the free-resource unlock that first brought them
  // in, rather than starting a second profile at account creation.
  useEffect(() => {
    posthog.identify(personId(userEmail), { user_id: userId });
  }, [userId, userEmail]);

  async function handleLogout() {
    posthog.reset();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort; the redirect below lands on /login regardless
    }
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex bg-[#f8f6f1]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="font-display text-lg font-semibold">BNHG Member</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive(item.href)
                  ? "bg-[#5b9a2f] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#e8e4dd] px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 text-[#1a1a1a]"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-display text-lg font-semibold text-[#1a1a1a]">
              BNHG Member
            </span>
            {isPreview && previewMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#1a1a1a] text-warm-gold rounded whitespace-nowrap">
                Preview · {MODE_LABEL[previewMode]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isPreview && previewPicker}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to BNHG website</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
