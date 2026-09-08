import Link from "next/link";
import Image from "next/image";
import HomeNewsletter from "@/components/sections/home/HomeNewsletter";

interface SocialLink {
  href: string;
  label: string;
  path: string;
}

const SOCIALS: SocialLink[] = [
  {
    href: "https://www.linkedin.com/company/be-nice-hospitality/",
    label: "LinkedIn",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
  {
    href: "https://www.instagram.com/benicehospitality",
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    href: "https://www.youtube.com/@benicehospitality",
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

interface FooterColumn {
  heading: string;
  links: Array<{ label: string; href: string; external?: boolean }>;
}

// Books link straight to their own sales pages rather than to /books, which
// has no index route (only these three static children exist). Guestally and
// The Retreat at Douglasville are both sibling-property affiliate links,
// carried over from the old Affiliates column with the same external
// treatment; the marketplace ("Recommended gear") joins them here rather
// than keeping its own standalone column.
const RESOURCES_COLUMN: FooterColumn = {
  heading: "Resources",
  links: [
    { label: "Tools", href: "/resources" },
    {
      label: "Room Rental Riches: The Blueprint",
      href: "/books/room-rental-riches-blueprint",
    },
    { label: "The Inside Lane", href: "/books/car-rental-riches-blueprint" },
    { label: "Before You Buy the Car", href: "/books/before-you-buy-the-car" },
    { label: "Recommended gear", href: "/marketplace" },
    { label: "Guestally", href: "https://guestally.ai", external: true },
    {
      label: "The Retreat at Douglasville",
      href: "https://www.theretreatatdouglasville.com",
      external: true,
    },
  ],
};

const TRAINING_COLUMN: FooterColumn = {
  heading: "Training",
  links: [
    { label: "Room Rental Riches", href: "/courses/room-rental-riches" },
    { label: "Car Rental Riches", href: "/courses/car-rental-riches" },
    { label: "Masterclass", href: "/courses/room-rental-riches/masterclass" },
  ],
};

export default function Footer() {
  const ownerPortalUrl = process.env.OWNER_PORTAL_URL;
  const facebookGroupUrl = process.env.FACEBOOK_GROUP_URL;

  // Owner Portal only renders once Alex sets the Unified Ops URL. Omitted
  // entirely rather than shown as a dead link.
  const managementColumn: FooterColumn = {
    heading: "Management",
    links: [
      { label: "Fleet", href: "/management/fleet" },
      { label: "Co-living", href: "/management/co-living" },
      { label: "Apply", href: "/management/apply" },
      ...(ownerPortalUrl
        ? [{ label: "Owner Portal", href: ownerPortalUrl, external: true }]
        : []),
    ],
  };

  const companyLinks: FooterColumn["links"] = [
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ];

  // Same omit-don't-degrade rule as Owner Portal: no Facebook link until the
  // group URL exists.
  const companyLinksSecondary: FooterColumn["links"] = [
    ...(facebookGroupUrl
      ? [{ label: "Community on Facebook", href: facebookGroupUrl, external: true }]
      : []),
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <footer
      className="bg-near-black text-white"
      role="contentinfo"
    >
      <HomeNewsletter />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-10 mb-12">
          {/* Brand block */}
          <div>
            <Link href="/" className="block mb-5" aria-label="Be Nice Hospitality Group home">
              <Image
                src="/images/brand-asset.png"
                alt="Be Nice Hospitality Group"
                width={80}
                height={80}
                sizes="64px"
                className="h-16 w-16 object-contain"
              />
            </Link>
            <p className="text-white/65 text-sm leading-relaxed font-sans mb-2">
              Sharing economy asset management for the Southeast.
            </p>
            <p className="text-white/45 text-sm leading-relaxed font-sans italic">
              Learn to run it, or let us run it.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/55 hover:border-warm-gold hover:text-warm-gold transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <FooterLinkColumn column={RESOURCES_COLUMN} />

          {/* Training */}
          <FooterLinkColumn column={TRAINING_COLUMN} />

          {/* Management */}
          <FooterLinkColumn column={managementColumn} />

          {/* Get in Touch */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-5">
              Get in Touch
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:admin@benicehospitality.com"
                  className="font-sans text-sm text-white/65 hover:text-white transition-colors duration-200"
                >
                  admin@benicehospitality.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+14045419934"
                  className="font-sans text-sm text-white/65 hover:text-white transition-colors duration-200"
                >
                  (404) 541-9934
                </a>
              </li>
              <li className="font-sans text-sm text-white/65">Hapeville, Georgia</li>
              <li className="font-sans text-xs text-white/40 italic">
                We answer within 1 business day.
              </li>
            </ul>
          </div>

          {/* Company, two stacked columns */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-5">
              Company
            </h3>
            {/* On md (when the parent grid becomes 2-col, halving this column's
                width), collapse to a single column so the small links don't
                compress. lg restores the 2-col split. */}
            <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-1 md:gap-y-0">
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-white/65 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3">
                {companyLinksSecondary.map((link) =>
                  link.external ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm text-white/65 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans text-sm text-white/65 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-white/40">
            © {new Date().getFullYear()} Be Nice Hospitality Group. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="font-sans text-xs text-white/40 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-xs text-white/40 hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({ column }: { column: FooterColumn }) {
  return (
    <div>
      <h3 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-5">
        {column.heading}
      </h3>
      <ul className="space-y-3">
        {column.links.map((link) => (
          <li key={`${column.heading}-${link.label}`}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-white/65 hover:text-warm-gold transition-colors duration-200 inline-flex items-center gap-1.5"
              >
                {link.label}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ) : (
              <Link
                href={link.href}
                className="font-sans text-sm text-white/65 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
