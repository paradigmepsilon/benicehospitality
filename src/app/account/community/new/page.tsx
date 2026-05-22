import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { listCategories } from "@/lib/forum";
import NewThreadForm from "@/components/sections/forum/NewThreadForm";

export const metadata: Metadata = {
  title: "New thread",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewThreadPage() {
  const categories = await listCategories();
  return (
    <div className="max-w-2xl">
      <Link
        href="/account/community"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Community
      </Link>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-3">
        Start a thread
      </h1>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed mb-8 max-w-xl">
        Pick the room closest to your operation, then write the post you wish
        someone would write for you. Specifics get specific answers.
      </p>
      <Suspense
        fallback={
          <div className="bg-white border border-light-gray rounded-lg p-7 h-[480px]" />
        }
      >
        <NewThreadForm
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
          }))}
        />
      </Suspense>
    </div>
  );
}
