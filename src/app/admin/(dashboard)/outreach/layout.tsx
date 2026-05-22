"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Leads", href: "/admin/outreach/leads" },
  { label: "CRM", href: "/admin/outreach/crm" },
  { label: "Campaigns", href: "/admin/outreach/campaigns" },
];

export default function OutreachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Outreach</h1>
        <p className="text-sm text-[#1a1a1a]/60 mt-1">
          Leads, pipeline, and bulk campaigns.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-[#e8e4dd]">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
