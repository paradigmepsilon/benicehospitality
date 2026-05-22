import Link from "next/link";

export interface BuildLogEntry {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  embed_url: string | null;
  embed_platform: string | null;
  published_at: string | null;
  created_at: string;
}

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  x: "X / Twitter",
  threads: "Threads",
};

function extractYouTubeId(url: string): string | null {
  // Handles youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>, youtube.com/shorts/<id>
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.split("/")[1];
      return id || null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        return u.searchParams.get("v");
      }
      const parts = u.pathname.split("/").filter(Boolean);
      // /embed/<id> or /shorts/<id>
      if (parts.length === 2 && (parts[0] === "embed" || parts[0] === "shorts")) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

function formatDate(iso: string | null): string {
  const date = iso ? new Date(iso) : null;
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BuildLogCard({ entry }: { entry: BuildLogEntry }) {
  const platformLabel = entry.embed_platform
    ? PLATFORM_LABEL[entry.embed_platform] ?? entry.embed_platform
    : null;
  const date = formatDate(entry.published_at ?? entry.created_at);
  const youtubeId =
    entry.embed_platform === "youtube" && entry.embed_url
      ? extractYouTubeId(entry.embed_url)
      : null;

  return (
    <article className="bg-white border border-light-gray rounded-md overflow-hidden">
      <header className="px-6 pt-6 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {platformLabel && (
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-gold bg-warm-gold/10 px-2 py-1 rounded">
              {platformLabel}
            </span>
          )}
          {date && (
            <span className="font-sans text-xs text-charcoal/55">{date}</span>
          )}
        </div>
      </header>

      <div className="px-6 pb-2">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-near-black leading-tight mb-2">
          {entry.title}
        </h3>
        {entry.excerpt && (
          <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
            {entry.excerpt}
          </p>
        )}
      </div>

      {/* YouTube embeds render inline. Other platforms get a link-out card so we
          do not have to ship third-party embed scripts on every page load. */}
      {youtubeId && (
        <div className="mx-6 mt-4 mb-6 aspect-video bg-near-black rounded overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={entry.title}
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      )}

      {entry.embed_url && !youtubeId && (
        <div className="mx-6 mt-4 mb-6">
          <a
            href={entry.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-cream/40 border border-light-gray rounded-md p-4 hover:border-primary-green hover:bg-cream/60 transition-colors duration-200"
          >
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-charcoal/55 font-semibold mb-1">
              View on {platformLabel ?? "the source"}
            </p>
            <p className="font-sans text-sm text-charcoal/75 break-all">
              {entry.embed_url}
            </p>
          </a>
        </div>
      )}

      <footer className="px-6 pb-6 flex items-center justify-between border-t border-light-gray pt-4">
        <Link
          href={`/insights/${entry.slug}`}
          className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark underline underline-offset-4"
        >
          Read the full notes →
        </Link>
      </footer>
    </article>
  );
}
