import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="min-h-screen bg-near-black flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
          404: Page Not Found
        </p>
        <h1 className="font-display text-6xl md:text-7xl font-semibold text-white mb-6">
          Wrong Turn
        </h1>
        <p className="font-sans text-lg text-white/60 mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/" variant="primary" size="lg">
            Back to Home
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
