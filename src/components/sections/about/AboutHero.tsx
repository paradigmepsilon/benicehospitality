import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-near-black">
      <Image
        src="https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?auto=format&fit=crop&w=1920&q=80"
        alt="Hotel team working together"
        fill
        className="object-cover opacity-40"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-near-black/40 to-near-black/80" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
          Our Story
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-3xl">
          Hospitality Expertise Meets{" "}
          <span className="text-warm-gold italic">Systems Thinking</span>
        </h1>
        <p className="font-sans text-lg sm:text-xl text-white/70 mt-6 max-w-2xl leading-relaxed">
          BNHG was built by people who understand both the art of hospitality
          and the science of running a profitable property.
        </p>
      </div>
    </section>
  );
}
