import Image from "next/image";

export default function InsightsHero() {
  return (
    <section className="relative h-[55vh] min-h-[420px] overflow-hidden bg-near-black">
      <Image
        src="https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1920&q=80"
        alt="Hotel lobby with reading area"
        fill
        className="object-cover opacity-30"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-near-black/60 to-near-black/90" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
          Insights
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight max-w-3xl">
          Insights for{" "}
          <span className="text-warm-gold italic">
            Independent Hoteliers
          </span>
        </h1>
        <p className="font-sans text-xl text-white/70 mt-6 max-w-xl leading-relaxed">
          Strategy, operations, and technology thinking for the boutique hotel
          market.
        </p>
      </div>
    </section>
  );
}
