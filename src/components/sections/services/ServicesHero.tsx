import Image from "next/image";

export default function ServicesHero() {
  return (
    <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-near-black">
      <Image
        src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1920&q=80"
        alt="Luxury hotel suite"
        fill
        className="object-cover opacity-35"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-near-black/50 to-near-black/85" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
          Services
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-3xl">
          Services Built for{" "}
          <span className="text-warm-gold italic">Boutique Hotels</span>
        </h1>
        <p className="font-sans text-lg sm:text-xl text-white/70 mt-6 max-w-2xl leading-relaxed">
          From free research to full implementation. Every engagement is
          designed to pay for itself.
        </p>
      </div>
    </section>
  );
}
