import Image from "next/image";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import {
  STOCK_DASHBOARD,
  STOCK_CODE_SCREEN,
  STOCK_LAPTOP_WORK,
  type StockImage,
} from "@/lib/stock-images";

interface Tool {
  name: string;
  body: string;
  href: string;
  status: "live" | "beta" | "next";
  image: StockImage;
}

const TOOLS: Tool[] = [
  {
    name: "Guestally",
    body: "Property-side AI concierge. Bernice handles guest messaging, upsells, and the operational back-and-forth. Flagship Labs product.",
    href: "/labs/guestally",
    status: "live",
    image: STOCK_DASHBOARD,
  },
  {
    name: "The Audit Generator",
    body: "URL in, branded report out. The same diagnostic engine the team uses to scope paid engagements, free for any operator.",
    href: "/audit/request",
    status: "live",
    image: STOCK_LAPTOP_WORK,
  },
  {
    name: "What's Coming Next",
    body: "Operator audits for property and auto, an AI-assisted fleet screener, and the Bernice sandbox. Members and advisory clients see it first.",
    href: "/labs",
    status: "next",
    image: STOCK_CODE_SCREEN,
  },
];

const STATUS_LABEL: Record<Tool["status"], string> = {
  live: "Live",
  beta: "Beta",
  next: "Coming next",
};

const STATUS_STYLE: Record<Tool["status"], string> = {
  live: "bg-primary-green/15 text-primary-green",
  beta: "bg-warm-gold/15 text-warm-gold-dark",
  next: "bg-charcoal/10 text-charcoal/65",
};

export default function LabsSpotlight() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel>BNHG Labs</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
              Where Alex builds the future of operator tech.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/70 mt-4 leading-relaxed">
              Claude Code, n8n, and modern AI shipping tools members and advisory clients get first. Guestally is the flagship; the rest of the portfolio is on the way.
            </p>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {TOOLS.map((t) => (
            <AnimatedItem key={t.name}>
              <Link
                href={t.href}
                className="group block bg-white border border-light-gray rounded-md overflow-hidden h-full hover:border-primary-green transition-colors duration-200"
              >
                <div className="relative aspect-[16/9] bg-charcoal/10 overflow-hidden">
                  <Image
                    src={t.image.src}
                    alt={t.image.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-near-black group-hover:text-primary-green transition-colors leading-tight">
                      {t.name}
                    </h3>
                    <span
                      className={[
                        "font-sans text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1",
                        STATUS_STYLE[t.status],
                      ].join(" ")}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">{t.body}</p>
                </div>
              </Link>
            </AnimatedItem>
          ))}
        </div>

        <div className="text-center">
          <Button href="/labs" variant="primary" size="md">
            Visit BNHG Labs
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}
