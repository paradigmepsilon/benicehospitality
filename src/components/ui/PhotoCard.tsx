import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface PhotoCardProps {
  image: { src: string; alt: string; position?: string };
  title: string;
  body?: string;
  /** Small line above the title: a role, a category, a step. */
  kicker?: ReactNode;
  href?: string;
  /** Tailwind aspect class, e.g. "aspect-[4/5]". */
  aspect?: string;
  /** Link label rendered under the body when the card is a link. */
  ctaLabel?: string;
  /** Responsive `sizes` for next/image. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * The photo card every reference pin draws: a rounded photograph that carries
 * its own title on a bottom gradient. The image is the card; nothing sits
 * beside it. Used for the three doors, the founders, and the latest insights.
 *
 * When `href` is set the whole card is the link and the image scales slowly
 * on hover. That is the only hover motion in the kit.
 */
export default function PhotoCard({
  image,
  title,
  body,
  kicker,
  href,
  aspect = "aspect-[4/5]",
  ctaLabel,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className = "",
}: PhotoCardProps) {
  const inner = (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={[
          "object-cover transition-transform duration-700 ease-out",
          href ? "group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" : "",
          image.position ?? "object-center",
        ].join(" ")}
        style={{ filter: "saturate(0.9) contrast(1.05)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-near-black/85 via-near-black/30 to-transparent"
      />
      {href && (
        <span
          aria-hidden
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/85 backdrop-blur text-near-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 motion-reduce:group-hover:rotate-0"
        >
          <ArrowUpRight className="w-4 h-4" strokeWidth={2.25} />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-white">
        {kicker && (
          <div className="font-sans text-xs font-semibold text-white/75 mb-2">
            {kicker}
          </div>
        )}
        <h3 className="font-display text-2xl md:text-[1.75rem] font-semibold leading-tight">
          {title}
        </h3>
        {body && (
          <p className="font-sans text-sm md:text-[15px] text-white/80 leading-snug mt-2 max-w-prose">
            {body}
          </p>
        )}
        {href && ctaLabel && (
          <p className="font-sans text-sm font-semibold text-warm-gold-dark mt-4 inline-flex items-center gap-1.5">
            {ctaLabel}
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.25} aria-hidden />
          </p>
        )}
      </div>
    </>
  );

  const shell = [
    "group relative block overflow-hidden rounded-card bg-near-black",
    aspect,
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={shell} aria-label={title}>
        {inner}
      </Link>
    );
  }
  return <div className={shell}>{inner}</div>;
}
