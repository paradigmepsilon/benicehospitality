export default function ContactHero() {
  return (
    <section className="bg-near-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
          Contact
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
          Let&apos;s Start a{" "}
          <span className="text-warm-gold italic">Conversation</span>
        </h1>
        <p className="font-sans text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          Whether you want a free resource, a diagnostic, or just a second
          opinion on your property, we&apos;re here. No sales pressure. Just
          a genuine conversation about what&apos;s possible for your hotel.
        </p>
      </div>
    </section>
  );
}
