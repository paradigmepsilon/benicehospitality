import PhotoHero from "@/components/sections/shared/PhotoHero";

export default function ContactHero() {
  return (
    <PhotoHero
      eyebrow="Contact"
      headline="Start a conversation."
      lede={
        <>
          Whether you want a diagnostic or just a second opinion on your
          asset, we&apos;re here. No sales pressure. Just a genuine
          conversation about what&apos;s possible.
        </>
      }
      image={{
        src: "/images/Website Images/alex in hotel lobby.png",
        alt: "Alex Henry in conversation in a hotel lobby",
        position: "object-[60%_center]",
      }}
      compact
    />
  );
}
