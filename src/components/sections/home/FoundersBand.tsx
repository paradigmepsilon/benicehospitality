import PhotoCard from "@/components/ui/PhotoCard";
import SectionIntro from "@/components/ui/SectionIntro";

interface Founder {
  name: string;
  role: string;
  image: { src: string; alt: string; position?: string };
  href: string;
}

const FOUNDERS: Founder[] = [
  {
    name: "Alex Henry",
    role: "Technology and services. Runs the fleet side.",
    image: {
      src: "/images/Website Images/Lex.png",
      alt: "Alex Henry",
      position: "object-[center_20%]",
    },
    href: "/alex",
  },
  {
    name: "Della Henry",
    role: "Operator-led education. Runs the co-living side.",
    image: {
      src: "/images/Website Images/Dee.png",
      alt: "Della Henry",
      position: "object-[center_20%]",
    },
    href: "/della",
  },
];

export default function FoundersBand() {
  return (
    <section className="bg-cream px-3 md:px-5 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-3 md:px-5">
        <SectionIntro
          label="Who built this"
          heading="Built and run by operators."
          lede="Atlanta-headquartered. Veteran-founded. Two operators who built the company they wished existed when they were running their own portfolios."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {FOUNDERS.map((f) => (
            <PhotoCard
              key={f.name}
              image={f.image}
              title={f.name}
              body={f.role}
              href={f.href}
              ctaLabel={`More about ${f.name.split(" ")[0]}`}
              aspect="aspect-[5/4]"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
