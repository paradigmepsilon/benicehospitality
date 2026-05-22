"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { NAV_LEFT, NAV_RIGHT, NAV_TREE, UTILITY_NAV } from "@/lib/nav";
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

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resolve auth state from /api/auth/me on mount. Header is "use client", so
  // SSR renders the logged-out state; this swap-in happens once the cookie is
  // resolved server-side. Acceptable flicker — chrome surface, not critical
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

  function renderTopLink(group: NavGroup) {
    const active = isActiveGroup(group, pathname);
    const hasChildren = !!group.children?.length;
    const isOpen = openMenu === group.label;

    if (!hasChildren && group.href) {
      return (
        <Link
          key={group.label}
          href={group.href}
          className={[
            "font-sans text-sm font-medium tracking-wide",
            "transition-colors duration-200 relative group/link",
            "after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-warm-gold",
            "after:origin-left after:transition-transform after:duration-300",
            active
              ? "text-warm-gold after:scale-x-100"
              : "text-charcoal/80 hover:text-charcoal after:scale-x-0 hover:after:scale-x-100",
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
            "font-sans text-sm font-medium tracking-wide flex items-center gap-1 relative",
            "transition-colors duration-200",
            "after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-warm-gold",
            "after:right-4 after:origin-left after:transition-transform after:duration-300",
            active || isOpen
              ? "text-warm-gold after:scale-x-100"
              : "text-charcoal/80 hover:text-charcoal after:scale-x-0 hover:after:scale-x-100",
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
              <div className="bg-white border border-charcoal/10 shadow-2xl rounded-md py-2 overflow-hidden">
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
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm py-2"
            : "bg-white py-5",
        ].join(" ")}
      >
        {/* Mobile row — logo left, hamburger right */}
        <div className="lg:hidden max-w-7xl mx-auto px-6 flex items-center justify-between gap-4 relative z-10">
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
              className="h-16 sm:h-20 w-auto"
              priority
            />
          </Link>

          <button
            type="button"
            className="flex flex-col gap-1.5 p-2 min-h-[44px] min-w-[44px] items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span
              className={[
                "block w-6 h-0.5 bg-charcoal transition-all duration-300",
                mobileOpen ? "rotate-45 translate-y-2" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-6 h-0.5 bg-charcoal transition-all duration-300",
                mobileOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-6 h-0.5 bg-charcoal transition-all duration-300",
                mobileOpen ? "-rotate-45 -translate-y-2" : "",
              ].join(" ")}
            />
          </button>
        </div>

        {/* Desktop row — 3-col grid: left nav | centered logo | right nav + login */}
        <div
          ref={navRef}
          className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center max-w-7xl mx-auto px-6 gap-8 relative z-10"
        >
          <nav aria-label="Primary left" className="flex items-center justify-end gap-7 xl:gap-9">
            {NAV_LEFT.map(renderTopLink)}
          </nav>

          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center justify-center flex-shrink-0"
            aria-label="Be Nice Hospitality Group home"
          >
            {/* Full lockup — visible at top of page */}
            <Image
              src="/images/logo.png"
              alt="Be Nice Hospitality Group"
              width={400}
              height={150}
              className={[
                "w-auto transition-all duration-300",
                scrolled ? "h-0 opacity-0 absolute" : "h-20 opacity-100",
              ].join(" ")}
              priority
            />
            {/* Transparent letter mark — visible once scrolled */}
            <Image
              src="/images/logo-mark-transparent.png"
              alt=""
              aria-hidden="true"
              width={400}
              height={400}
              className={[
                "w-auto transition-all duration-300",
                scrolled ? "h-14 opacity-100" : "h-0 opacity-0 absolute",
              ].join(" ")}
            />
          </Link>

          <div className="flex items-center justify-start gap-7 xl:gap-9">
            <nav aria-label="Primary right" className="flex items-center gap-7 xl:gap-9">
              {NAV_RIGHT.map(renderTopLink)}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              {authUser ? (
                <>
                  <Link
                    href={authUser.role === "admin" ? "/admin" : "/account"}
                    className="font-sans text-sm font-medium text-charcoal/80 hover:text-charcoal"
                  >
                    {authUser.role === "admin" ? "Admin" : "Your Account"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="font-sans text-sm font-medium text-charcoal/60 hover:text-warm-gold transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Button
                  href={UTILITY_NAV.communityLogin.href}
                  variant="primary"
                  size="sm"
                >
                  {UTILITY_NAV.communityLogin.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={[
          "fixed inset-0 z-40 bg-white overflow-y-auto",
          "transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div className="min-h-full flex flex-col px-6 pt-24 pb-16">
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
                      "font-display text-2xl py-4 border-b border-charcoal/10",
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
                      "w-full flex items-center justify-between font-display text-2xl py-4",
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
                >
                  {authUser.role === "admin" ? "Admin" : "Your Account"}
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
              <Button
                href={UTILITY_NAV.communityLogin.href}
                variant="primary"
                size="lg"
                fullWidth
              >
                {UTILITY_NAV.communityLogin.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
