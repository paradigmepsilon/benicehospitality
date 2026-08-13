import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ResourceToolMeta } from "@/lib/resources/registry";
import type { ResourceAccess } from "@/lib/resources/access";
import SaveToolButton from "@/components/resources/SaveToolButton";
import SaveProgressButton from "@/components/resources/SaveProgressButton";
import { ToolSaveProvider } from "@/components/resources/ToolSaveContext";

const SITE_URL = "https://benicehospitality.com";

// Shared page chrome for every gated resource tool: dark hero, three-step
// "how it works", and a two-column tool region (gated tool + "what you'll get"
// aside). Driven entirely by the registry meta so each tool page is a thin
// wrapper that resolves access once and passes the gated tool as children.
//
// Everything here renders for everyone, including logged-out crawlers. Only
// the `children` slot is gated, which is what keeps these twenty pages
// indexable after the account cutover.
export default function ResourceToolLayout({
  tool,
  access,
  children,
}: {
  tool: ResourceToolMeta;
  access: ResourceAccess;
  children: ReactNode;
}) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: tool.name,
    description: tool.blurb,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "United States" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    url: `${SITE_URL}/resources/${tool.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-24 px-6 overflow-hidden">
        <Image
          src={tool.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-near-black/75 via-near-black/85 to-near-black/95" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
            Free Resource · {tool.eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight whitespace-pre-line text-balance">
            {tool.headline}
          </h1>
          <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            {tool.subhead}
          </p>
          <p className="font-sans text-sm text-white/55 mt-4">
            Built by operators running co-living properties in the Southeast.
            Free to use, yours to keep.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 sm:py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3 text-center">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6">
            {tool.howItWorks.map((body, i) => (
              <div
                key={i}
                className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-6"
              >
                <p className="font-display text-4xl font-semibold text-warm-gold mb-3">
                  {i + 1}
                </p>
                <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool + side panel.

          The provider spans BOTH columns because that is the only thing they
          share: the tool's autosave lives in `children`, the Save progress
          button lives in the aside, and this layout is a server component that
          cannot hold either one's state. `children` stays server-rendered — its
          element identity never changes, so React skips it when the provider's
          status ticks. See ToolSaveContext.tsx. */}
      <section className="py-16 sm:py-20 px-6 bg-off-white">
        <ToolSaveProvider>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">{children}</div>

          <aside className="lg:col-span-2 space-y-6 no-print">
            <div className="bg-white border border-light-gray rounded-lg p-6 lg:p-7 lg:sticky lg:top-24">
              <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3">
                What you&apos;ll get
              </p>
              <ul className="space-y-2.5 mb-6">
                {tool.whatYouGet.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-charcoal"
                  >
                    <svg
                      className="w-4 h-4 text-primary-green mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              {/* Four cases, and only one of them is a working save control.
                  A reference tool has no progress to save; a visitor with no
                  account has nowhere to save it; a previewing admin must not
                  write to their own row under a member's identity. */}
              {access.mode !== "locked" && (
                <div className="mb-5">
                  {tool.persistence === "none" ? (
                    <p className="font-sans text-xs text-charcoal/70">
                      Opening this one puts it on your dashboard, so it is easy
                      to find again.{" "}
                      <Link
                        href="/account/resources"
                        className="text-primary-green font-medium hover:underline"
                      >
                        Your resources
                      </Link>
                    </p>
                  ) : !access.canSync ? (
                    <SaveToolButton
                      slug={tool.slug}
                      toolName={tool.name}
                      variant="page"
                      loggedIn={access.loggedIn}
                      initialSaved={access.saved}
                      readOnly={access.isReadOnlyPreview}
                    />
                  ) : (
                    <SaveProgressButton toolName={tool.name} />
                  )}
                </div>
              )}
              <p className="text-xs text-charcoal/60 leading-relaxed border-t border-light-gray pt-4">
                Free with a Be Nice Hospitality account. Every tool you use is
                saved to your dashboard, so your entries are still here the
                next time you sign in, on any device.
              </p>
            </div>
          </aside>
        </div>
        </ToolSaveProvider>
      </section>
    </>
  );
}
