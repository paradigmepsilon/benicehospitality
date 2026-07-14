import Image from "next/image";

export default function InsightsHero() {
  return (
    <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1920&q=80"
        alt="Boutique stay lobby with a reading area"
        fill
        className="object-cover opacity-30"
        priority
        sizes="100vw"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-near-black via-near-black/85 to-near-black/60"
      />
      <div className="relative z-10 max-w-4xl">
        <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-8">
          Insights
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
          Insights for{" "}
          <span className="text-warm-gold italic">
            Hospitality and the Sharing Economy
          </span>
        </h1>
        <p className="font-sans text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
          Strategy, operations, and technology thinking for Independent
          Operators.
        </p>
      </div>
    </section>
  );
}
