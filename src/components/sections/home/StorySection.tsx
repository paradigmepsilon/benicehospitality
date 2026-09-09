import Image from "next/image";
import Button from "@/components/ui/Button";

/**
 * The origin block, from the monochrome pin's split "story" panel. Large
 * Playfair on near-black, the founders at a property on the right, one link
 * out. The copy is the operator origin line the hero used to carry; the hero
 * now leads with the positioning and this section carries the reason.
 */
export default function StorySection() {
  return (
    <section className="bg-cream px-3 md:px-5 py-4 md:py-6">
      <div className="overflow-hidden rounded-panel bg-near-black text-white grid lg:grid-cols-2">
        <div className="p-8 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
          <p className="font-sans text-sm md:text-base text-white/65 mb-5">
            Why BNHG exists
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-semibold leading-[1.05] tracking-tight">
            Operators first. Everything on this site runs on our own units
            before it reaches yours.
          </h2>
          <p className="font-sans text-base md:text-lg text-white/80 leading-relaxed mt-6 max-w-xl">
            We run co-living properties and a rental fleet across the
            Southeast. The calculators, the courses, and the management
            service are the same systems we use every week, written down so
            another operator can pick them up.
          </p>
          <p className="font-display italic text-xl md:text-2xl text-warm-gold-dark mt-8 max-w-xl">
            You can run this yourself with our course. If you would rather
            not, we can do it for you.
          </p>
          <div className="mt-8">
            <Button href="/about" variant="ghost" size="md" arrow>
              Meet the founders
            </Button>
          </div>
        </div>
        <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-full">
          <Image
            src="/images/Website Images/Della Behind Desk.png"
            alt="Della Henry at her desk with a laptop, a notebook, and a Be Nice mug"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={90}
            className="object-cover object-[center_30%]"
            style={{ filter: "saturate(0.9) contrast(1.05)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-near-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-near-black/40 lg:via-transparent lg:to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
