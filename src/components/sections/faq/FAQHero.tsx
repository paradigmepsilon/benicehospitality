export default function FAQHero() {
  return (
    <section className="relative bg-near-black py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-near-black to-near-black/90" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
          Frequently Asked Questions
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight">
          Answers for{" "}
          <span className="text-warm-gold italic">Independent Operators</span>
        </h1>
        <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed">
          What boutique hotel consulting actually costs, how to reduce OTA
          dependency, which guest messaging tools are right for small hotels,
          and everything else we get asked.
        </p>
      </div>
    </section>
  );
}
