interface StatItem {
  value: string;
  label: string;
}

interface StatsStripProps {
  items: StatItem[];
}

export default function StatsStrip({ items }: StatsStripProps) {
  return (
    <section className="bg-cream pb-16 md:pb-20 lg:pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="border-y border-warm-gold/30 py-8 md:py-10">
          <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-warm-gold/30">
            {items.map((it, i) => (
              <div
                key={i}
                className="flex-1 text-center px-4 py-4 sm:py-2"
              >
                <p className="font-display text-3xl md:text-4xl font-semibold text-deep-teal mb-1.5 leading-none">
                  {it.value}
                </p>
                <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-charcoal/65">
                  {it.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
