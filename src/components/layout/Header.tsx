"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isHomePage = pathname === "/";
  const isDark = isHomePage && !scrolled;

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300",
          scrolled
            ? "bg-near-black/95 backdrop-blur-md shadow-lg py-3"
            : isHomePage
            ? "bg-transparent py-5"
            : "bg-near-black py-4",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Be Nice Hospitality Group"
              width={400}
              height={150}
              className="h-14 sm:h-16 md:h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "font-sans text-sm font-medium tracking-wide",
                  "transition-colors duration-200",
                  "relative group",
                  pathname === link.href
                    ? "text-warm-gold"
                    : "text-white/80 hover:text-white",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {link.label}
                <span
                  className={[
                    "absolute -bottom-1 left-0 h-px transition-all duration-200",
                    pathname === link.href
                      ? "w-full bg-warm-gold"
                      : "w-0 bg-primary-green group-hover:w-full",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Button href="/contact" variant="primary" size="sm">
              Book a Call
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 min-h-[44px] min-w-[44px] items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span
              className={[
                "block w-6 h-0.5 bg-white transition-all duration-300",
                mobileOpen ? "rotate-45 translate-y-2" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <span
              className={[
                "block w-6 h-0.5 bg-white transition-all duration-300",
                mobileOpen ? "opacity-0" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <span
              className={[
                "block w-6 h-0.5 bg-white transition-all duration-300",
                mobileOpen ? "-rotate-45 -translate-y-2" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 bg-near-black",
          "flex flex-col justify-center items-center",
          "transition-all duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "font-display text-2xl sm:text-3xl font-normal",
                "transition-colors duration-200",
                pathname === link.href
                  ? "text-warm-gold"
                  : "text-white hover:text-primary-green",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4">
            <Button href="/contact" variant="primary" size="lg">
              Book a Discovery Call
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
