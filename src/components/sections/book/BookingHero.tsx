export default function BookingHero() {
  return (
    <section className="bg-near-black pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-4xl">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
          Book a Discovery Call
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
          Schedule Your{" "}
          <span className="text-warm-gold italic">Discovery Call</span>
        </h1>
        <p className="font-sans text-xl text-white/70 max-w-2xl leading-relaxed">
          Pick a time that works for you. It&apos;s a relaxed 45-minute
          conversation about your property. No sales pressure. Just honest
          insight from people who&apos;ve been in your shoes.
        </p>
      </div>
    </section>
  );
}
