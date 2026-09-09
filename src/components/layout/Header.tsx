"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { NAV_TREE, UTILITY_NAV } from "@/lib/nav";
import type { NavGroup } from "@/lib/types";

function isActiveGroup(group: NavGroup, pathname: string): boolean {
  if (group.href && pathname === group.href) return true;
  if (group.children) {
    return group.children.some((child) => {
      const base = child.href.split("#")[0];
      return base !== "" && pathname.startsWith(base);
    });
  }
  return false;
}

interface SessionUser {
  email: string;
  name: string;
  role: "admin" | "user";
}

/**
 * The floating pill nav from the reference pins. It is inset from the
 * viewport and glass-white, so it sits over the framed photo heroes and over
 * plain cream pages alike without a solid bar behind it. Logo left, nav
 * centre, account pill right; the mobile sheet is unchanged in behaviour.
 */
export default function Header({
  ownerPortalUrl,
}: {
  /** Set only when process.env.OWNER_PORTAL_URL exists. Passed down from the
   *  server-rendered layout, since this component is "use client" and cannot
   *  read server env vars itself. Undefined hides the link entirely rather
   *  than rendering a dead one. */
  ownerPortalUrl?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resolve auth state from /api/auth/me on mount. Header is "use client", so
  // SSR renders the logged-out state; this swap-in happens once the cookie is
  // resolved server-side. Acceptable flicker, chrome surface, not critical
  // content. Re-runs whenever the route changes (covers post-login navs).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { user: SessionUser | null };
        return data.user;
      })
      .catch(() => null)
      .then((user) => {
        if (!cancelled) setAuthUser(user ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort
    }
    window.location.assign("/login");
  }

  // Close every menu surface on route change. The React docs recommend
  // tracking the previous value via state and resetting in render so the next
  // commit reflects the closed state without an intermediate flash.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
    if (openMenu) setOpenMenu(null);
    if (openMobileGroup) setOpenMobileGroup(null);
  }

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close any open desktop dropdown on Escape or when focus leaves the nav.
  useEffect(() => {
    if (!openMenu) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openMenu]);

  // Click-outside to close desktop dropdown.
  useEffect(() => {
    if (!openMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  const toggleMobileGroup = useCallback((label: string) => {
    setOpenMobileGroup((prev) => (prev === label ? null : label));
  }, []);

  // If the user clicks the logo while already on the homepage, scroll to top
  // instead of re-navigating (which Next would no-op on, leaving them mid-page).
  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname],
  );

  const topLinkBase =
    "font-sans text-sm font-medium tracking-wide px-3.5 py-2 rounded-full transition-colors duration-200";

  function renderTopLink(group: NavGroup) {
    const active = isActiveGroup(group, pathname);
    const hasChildren = !!group.children?.length;
    const isOpen = openMenu === group.label;

    if (!hasChildren && group.href) {
      return (
        <Link
          key={group.label}
          href={group.href}
          aria-current={active ? "page" : undefined}
          className={[
            topLinkBase,
            active
              ? "bg-near-black text-white"
              : "text-charcoal/80 hover:text-charcoal hover:bg-near-black/5",
          ].join(" ")}
        >
          {group.label}
        </Link>
      );
    }

    return (
      <div
        key={group.label}
        className="relative"
        onMouseEnter={() => setOpenMenu(group.label)}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setOpenMenu(isOpen ? null : group.label)}
          onFocus={() => setOpenMenu(group.label)}
          className={[
            topLinkBase,
            "flex items-center gap-1",
            active || isOpen
              ? "bg-near-black text-white"
              : "text-charcoal/80 hover:text-charcoal hover:bg-near-black/5",
          ].join(" ")}
        >
          {group.label}
          <svg
            className={[
              "w-3 h-3 transition-transform duration-200",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              role="menu"
              className="absolute left-0 top-full pt-3 w-80"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-charcoal/10 shadow-2xl rounded-card py-2 overflow-hidden">
                {group.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    role="menuitem"
                    className="block px-4 py-3 hover:bg-charcoal/5 transition-colors duration-150 group/item"
                  >
                    <span className="font-sans text-sm font-medium text-charcoal group-hover/item:text-warm-gold transition-colors">
                      {child.label}
                    </span>
                    {child.description && (
                      <span className="block font-sans text-xs text-charcoal/55 mt-0.5 leading-relaxed">
                        {child.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-3 md:top-5 inset-x-0 z-50 px-3 md:px-5">
        <div
          ref={navRef}
          className={[
            "mx-auto max-w-7xl rounded-[10px]",
            "bg-white/85 backdrop-blur-xl border border-white/70",
            "transition-shadow duration-300",
            scrolled
              ? "shadow-lg shadow-near-black/10"
              : "shadow-md shadow-near-black/5",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-4 pl-4 pr-2 py-1.5 md:pl-5 md:py-2">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center flex-shrink-0"
              aria-label="Be Nice Hospitality Group home"
            >
              <Image
                src="/images/logo.png"
                alt="Be Nice Hospitality Group"
                width={400}
                height={150}
                sizes="(min-width: 768px) 150px, 120px"
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>

            <nav
              aria-label="Primary"
              className="hidden lg:flex items-center gap-1"
            >
              {NAV_TREE.map(renderTopLink)}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {authUser ? (
                <>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="font-sans text-sm font-medium text-charcoal/60 hover:text-charcoal px-3 py-2 rounded-full transition-colors"
                  >
                    Sign out
                  </button>
                  <Button
                    href={authUser.role === "admin" ? "/admin" : "/account"}
                    variant="primary"
                    size="sm"
                    arrow
                  >
                    {authUser.role === "admin" ? "Admin" : "Your account"}
                  </Button>
                </>
              ) : (
                <>
                  {ownerPortalUrl && (
                    <a
                      href={ownerPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-sm font-medium text-charcoal/70 hover:text-charcoal px-3 py-2 rounded-full transition-colors"
                    >
                      Owner portal
                    </a>
                  )}
                  <Button
                    href={UTILITY_NAV.communityLogin.href}
                    variant="primary"
                    size="sm"
                    arrow
                  >
                    {UTILITY_NAV.communityLogin.label}
                  </Button>
                </>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden flex flex-col gap-1.5 items-center justify-center w-11 h-11 rounded-full bg-near-black text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span
                className={[
                  "block w-5 h-0.5 bg-current transition-all duration-300",
                  mobileOpen ? "rotate-45 translate-y-2" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block w-5 h-0.5 bg-current transition-all duration-300",
                  mobileOpen ? "opacity-0" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block w-5 h-0.5 bg-current transition-all duration-300",
                  mobileOpen ? "-rotate-45 -translate-y-2" : "",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={[
          "fixed inset-0 z-40 bg-cream overflow-y-auto",
          "transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div className="min-h-full flex flex-col px-6 pt-28 pb-16">
          <nav aria-label="Mobile primary" className="flex flex-col">
            {NAV_TREE.map((group) => {
              const active = isActiveGroup(group, pathname);
              const hasChildren = !!group.children?.length;
              const isOpen = openMobileGroup === group.label;

              if (!hasChildren && group.href) {
                return (
                  <Link
                    key={group.label}
                    href={group.href}
                    className={[
                      "font-display text-3xl py-4 border-b border-charcoal/10",
                      active ? "text-warm-gold" : "text-charcoal",
                    ].join(" ")}
                  >
                    {group.label}
                  </Link>
                );
              }

              return (
                <div key={group.label} className="border-b border-charcoal/10">
                  <button
                    type="button"
                    onClick={() => toggleMobileGroup(group.label)}
                    aria-expanded={isOpen}
                    className={[
                      "w-full flex items-center justify-between font-display text-3xl py-4",
                      active ? "text-warm-gold" : "text-charcoal",
                    ].join(" ")}
                  >
                    <span>{group.label}</span>
                    <svg
                      className={[
                        "w-4 h-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 flex flex-col gap-1">
                          {group.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="font-sans text-base text-charcoal/75 hover:text-charcoal py-2"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="mt-10 flex flex-col gap-4">
            {authUser ? (
              <>
                <Button
                  href={authUser.role === "admin" ? "/admin" : "/account"}
                  variant="primary"
                  size="lg"
                  fullWidth
                  arrow
                >
                  {authUser.role === "admin" ? "Admin" : "Your account"}
                </Button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="font-sans text-sm text-charcoal/70 hover:text-charcoal py-3 text-center"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Button
                  href={UTILITY_NAV.communityLogin.href}
                  variant="primary"
                  size="lg"
                  fullWidth
                  arrow
                >
                  {UTILITY_NAV.communityLogin.label}
                </Button>
                {ownerPortalUrl && (
                  <a
                    href={ownerPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-charcoal/70 hover:text-charcoal py-3 text-center"
                  >
                    Owner portal
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
