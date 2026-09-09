import PhotoHero from "@/components/sections/shared/PhotoHero";

export default function InsightsHero() {
  return (
    <PhotoHero
      eyebrow="Insights"
      headline="Operator thinking for hospitality and the sharing economy."
      lede="Strategy, operations, and technology, written by the people running co-living properties and rental fleets."
      image={{
        src: "/images/Website Images/hf_20260510_014447_ef5dbd72-7cea-474b-b318-1c2098bc0723.png",
        alt: "A boutique stay lounge with a reading area",
        position: "object-[60%_center]",
      }}
      compact
    />
  );
}
