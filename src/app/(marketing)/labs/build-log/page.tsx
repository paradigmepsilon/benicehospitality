import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import EmailCaptureForm from "@/components/forms/EmailCaptureForm";
import BuildLogCard, {
  type BuildLogEntry,
} from "@/components/sections/labs/BuildLogCard";
import { STOCK_CODE_SCREEN, STOCK_DASHBOARD } from "@/lib/stock-images";

export const metadata: Metadata = {
  title: "Build Log",
  description:
    "Saturday build updates from BNHG Labs. Real code, real progress, no marketing spin. Pulled in from LinkedIn and YouTube as Alex ships.",
  alternates: {
    canonical: "https://benicehospitality.com/labs/build-log",
  },
  openGraph: {
    title: "Build Log | BNHG Labs",
    description:
      "What got built this week. Build-in-public posts and short videos from Alex Henry.",
    url: "https://benicehospitality.com/labs/build-log",
    type: "website",
  },
};

// Server component: render-time DB read. The list is small (a few entries per
// month at most) so we avoid pagination for now and just sort newest-first.
async function fetchBuildLog(): Promise<BuildLogEntry[]> {
  // Lazy-import the DB client so a missing DATABASE_URL surfaces here as an
  // empty feed (the page falls through to the "Coming this Saturday" card)
  // rather than crashing at module load time.
  if (!process.env.DATABASE_URL) return [];
  try {
    const { sql } = await import("@/lib/db");
    const rows = await sql`
      SELECT id, title, slug, excerpt, embed_url, embed_platform, published_at, created_at
      FROM blog_posts
      WHERE post_type = 'build_log'
        AND published = true
        AND (published_at IS NULL OR published_at <= NOW())
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT 50
    `;
    return rows.map((r) => ({
      id: r.id as number,
      title: r.title as string,
      slug: r.slug as string,
      excerpt: r.excerpt as string,
      embed_url: (r.embed_url as string | null) ?? null,
      embed_platform: (r.embed_platform as string | null) ?? null,
      published_at: r.published_at ? new Date(r.published_at as string).toISOString() : null,
      created_at: new Date(r.created_at as string).toISOString(),
    }));
  } catch (err) {
    console.error("Build Log fetch failed:", err);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function BuildLogPage() {
  const entries = await fetchBuildLog();

  return (
    <>
      <AnimatedSection theme="dark" className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={STOCK_CODE_SCREEN.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-near-black/75 via-near-black/85 to-near-black" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>The Build Log</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-6 leading-[1.1]">
              Saturday, in public.
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed">
              Every Saturday, Alex posts what got built that week. Code, automation flows, working prototypes. The feed below pulls those updates as they ship. No marketing spin, no sponsored takes.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {entries.length > 0 ? (
        <AnimatedSection theme="off-white" className="py-20 px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {entries.map((entry) => (
              <BuildLogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection theme="off-white" className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-light-gray rounded-md overflow-hidden">
              <div className="relative aspect-[21/9] bg-charcoal/10">
                <Image
                  src={STOCK_DASHBOARD.src}
                  alt={STOCK_DASHBOARD.alt}
                  fill
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-10">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold mb-3">
                  Coming this Saturday
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-near-black mb-4 leading-tight">
                  The first post: how we shipped the Audit Generator with Claude Code.
                </h2>
                <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-3">
                  The audit generator at /audit/request goes from URL input to branded report in about 90 seconds. The first Build Log post walks through the prompt design, the n8n flow, and the failure modes that almost killed it twice.
                </p>
                <p className="font-sans text-xs text-charcoal/55 italic">
                  Once the first entry ships, this page lists every post with embedded video and the original LinkedIn or YouTube link.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection theme="light" className="py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="font-sans text-base text-charcoal/75 mb-5 leading-relaxed">
            Get a 1-line note when a new Build Log entry drops.
          </p>
          <EmailCaptureForm
            source="build_log_subscribers"
            variant="card"
            buttonLabel="Subscribe"
            placeholder="you@yourbusiness.com"
            helperText="1 email per release. Unsubscribe in 1 click."
            successMessage="You're subscribed. Watch for the next entry."
          />
          <div className="mt-10">
            <Link
              href="/labs"
              className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark underline underline-offset-4"
            >
              ← Back to BNHG Labs
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
