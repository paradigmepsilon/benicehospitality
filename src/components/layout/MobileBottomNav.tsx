"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, GraduationCap, Building2 } from "lucide-react";
import { MOBILE_BOTTOM_NAV } from "@/lib/nav";

// Keyed by label, not by route, so it stays a plain lookup against
// MOBILE_BOTTOM_NAV's NavLink[]. Every label in that array must have a
// matching key here or that item renders with no icon.
const ICONS: Record<string, React.ReactNode> = {
  Estimate: <Calculator className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />,
  Training: <GraduationCap className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />,
  Management: <Building2 className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />,
};

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile shortcuts"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-near-black/95 backdrop-blur-md border-t border-white/10"
    >
      <ul className="flex">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={[
                  "flex flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] px-1",
                  "font-sans text-[10px] font-medium uppercase tracking-normal",
                  "transition-colors duration-200",
                  active ? "text-warm-gold" : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                {ICONS[item.label] ?? null}
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
