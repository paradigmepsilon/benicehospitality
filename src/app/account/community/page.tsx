import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { listCategories } from "@/lib/forum";

export const metadata: Metadata = {
  title: "Community",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmtRelative(iso: string | null): string {
  if (!iso) return "no activity yet";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toISOString().split("T")[0];
}

export default async function CommunityIndexPage() {
  const categories = await listCategories();

  return (
    <>
      <div className="max-w-5xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
        >
          ← Your account
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
              The Nice Host Network
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight">
              Community
            </h1>
            <p className="font-sans text-base text-charcoal/85 leading-relaxed mt-3 max-w-2xl">
              Operator-class conversation. Ask the room a question, share what
              worked, post a problem before it gets bigger. Six rooms; pick
              the one closest to your operation.
            </p>
          </div>
          <Link
            href="/account/community/new"
            className="inline-flex items-center gap-2 bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-5 py-2.5 transition-colors whitespace-nowrap"
          >
            Start a thread
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/account/community/${c.slug}`}
              className="block bg-white border border-light-gray rounded-lg p-6 hover:border-primary-green/40 transition-colors group"
            >
              <div className="flex items-start gap-3 mb-3">
                <MessageSquare
                  className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5"
                  aria-hidden
                />
                <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors">
                  {c.name}
                </h2>
              </div>
              <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-4">
                {c.description}
              </p>
              <div className="flex items-center justify-between font-sans text-xs text-charcoal/60">
                <span>
                  {c.threadCount} thread{c.threadCount === 1 ? "" : "s"}
                </span>
                <span>Last activity: {fmtRelative(c.lastActivityAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
