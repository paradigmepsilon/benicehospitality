"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Clients", href: "/admin/partnership" },
  { label: "Doc library", href: "/admin/partnership/docs" },
  { label: "How to use this", href: "/admin/partnership/guide" },
];

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
          Co-Living Launch Partnership
        </h1>
        <p className="text-sm text-[#1a1a1a]/60 mt-1">
          Every prospect and client, from first call to day-90 handoff.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-[#e8e4dd]">
        {TABS.map((tab) => {
          // "Clients" also owns the /partnership/[id] detail pages.
          const active =
            tab.href === "/admin/partnership"
              ? !pathname.startsWith("/admin/partnership/docs") && !pathname.startsWith("/admin/partnership/guide")
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-[#5b9a2f] text-[#5b9a2f]"
                  : "border-transparent text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}
