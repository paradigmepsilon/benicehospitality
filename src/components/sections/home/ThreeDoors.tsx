import PhotoCard from "@/components/ui/PhotoCard";
import SectionIntro from "@/components/ui/SectionIntro";

interface Door {
  label: string;
  promise: string;
  ctaLabel: string;
  href: string;
  image: { src: string; alt: string; position?: string };
}

// The three-bin ladder: Resources (free, email-gated) -> Training (paid courses) ->
// Management (done-for-you). Same order as NAV_TREE in src/lib/nav.ts, so
// the homepage teaches the same structure the header already shows. The
// cards are numbered because the ladder is a sequence: most operators start
// free, some train, a few hand it off.
const DOORS: Door[] = [
  {
    label: "Learn it",
    promise:
      "Calculators, checklists, and guides for co-living and rental fleet operators. Most are free; an email address opens them.",
    ctaLabel: "Browse the resources",
    href: "/resources",
    image: {
      src: "/images/Website Images/hf_20260512_145736_e7084398-0668-4426-9b89-fbfaf407bf36.png",
      alt: "An operator working through a worksheet on a laptop",
    },
  },
  {
    label: "Train for it",
    promise:
      "Room Rental Riches and Car Rental Riches, self-paced or live, taught by the operators who run both businesses.",
    ctaLabel: "See the courses",
    href: "/training",
    image: {
      src: "/images/Website Images/course-masterclass-cohort-v2.png",
      alt: "A small Masterclass cohort around a table",
    },
  },
  {
    label: "Hand it off",
    promise:
      "When you would rather not run it yourself, apply for management. BNHG takes the day-to-day and you keep ownership.",
    ctaLabel: "Check your fit",
    href: "/management",
    image: {
      src: "/images/Website Images/crr-collage-01-keys-handoff.png",
      alt: "Keys handed over at a vehicle",
    },
  },
];

export default function ThreeDoors() {
  return (
    <section className="bg-white px-3 md:px-5 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-3 md:px-5">
        <SectionIntro
          label="Three ways in"
          heading="Pick how involved you want to be."
          lede="Most of the tools are free and take an email address to open. The courses teach the method behind them. Management is for owners who would rather hand BNHG the keys. Most operators walk through the three in that order, but you can start at any door."
        />

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {DOORS.map((door, i) => (
            <li key={door.href}>
              <PhotoCard
                image={door.image}
                kicker={
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/85 text-near-black font-display text-base font-semibold">
                    {i + 1}
                  </span>
                }
                title={door.label}
                body={door.promise}
                ctaLabel={door.ctaLabel}
                href={door.href}
                aspect="aspect-[4/5]"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
