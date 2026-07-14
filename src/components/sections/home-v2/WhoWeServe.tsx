import Image from "next/image";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import {
  STOCK_PROPERTY,
  STOCK_AUTO_FLEET,
  STOCK_BOUTIQUE_HOTEL,
  STOCK_COLIVING,
  type StockImage,
} from "@/lib/stock-images";

interface Audience {
  title: string;
  body: string;
  detail: string;
  image: StockImage;
}

const AUDIENCES: Audience[] = [
  {
    title: "Co-living Properties",
    body: "Co-living operators renting rooms by the door, plus the short-term and mid-term portfolios that mix in.",
    detail: "Foundation and Flagship, Co-living edition. Plus Guestally and the Nice Host Network.",
    image: STOCK_PROPERTY,
  },
  {
    title: "Autos",
    body: "Aspiring Turo hosts and small fleet operators running 3 to 30 economy vehicles.",
    detail: "Foundation and Flagship, Auto edition. Built for fleet realities, not rebranded co-living content.",
    image: STOCK_AUTO_FLEET,
  },
  {
    title: "Boutique Stays",
    body: "Independent boutique hotels, inns, and the design-forward short-term and vacation stays guests book on purpose.",
    detail: "Signal: productized AI services with outcome guarantees. Led by Alex.",
    image: STOCK_BOUTIQUE_HOTEL,
  },
  {
    title: "Multi-Asset Innovators",
    body: "Operators running across categories: co-living plus boutique stays plus fleet, plus experiences.",
    detail: "The Operator's Boardroom advisory engagement, 12-month commitment.",
    image: STOCK_COLIVING,
  },
];

export default function WhoWeServe() {
  return (
    <AnimatedSection theme="light" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel>Who We Serve</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
              Built for operators across the sharing economy.
            </h2>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AUDIENCES.map((a) => (
            <AnimatedItem key={a.title}>
              <div className="bg-cream/40 border border-light-gray rounded-md overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[16/9] bg-charcoal/10">
                  <Image
                    src={a.image.src}
                    alt={a.image.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-near-black mb-3 leading-tight">
                    {a.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal/80 mb-3 leading-relaxed">
                    {a.body}
                  </p>
                  <p className="font-sans text-sm text-charcoal/60 leading-relaxed border-t border-light-gray pt-3 mt-auto">
                    {a.detail}
                  </p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
