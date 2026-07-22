"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

// The airlock. Visitors reach this straight off Della's bio page or a live
// session, so it opens in her first-person voice with her face — but in BNHG's
// cream/teal/gold system, not the bio page's warm dark. It should look
// unmistakably like BNHG and sound exactly like the person they just left.

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function CoLivingHero() {
  return (
    <section className="relative bg-off-white pt-36 md:pt-44 pb-16 md:pb-24 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12 lg:gap-16 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.p
            variants={itemVariants}
            className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6"
          >
            Co-living · Run by Della Henry
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-near-black leading-[1.0] tracking-tight mb-8"
          >
            Co-living,
            <br />
            run like a business.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-display italic text-xl md:text-2xl text-charcoal/80 leading-snug max-w-xl mb-6"
          >
            I run twelve co-living and mid-term units across five Southeast
            cities. Everything I know about renting by the room lives on this
            page.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="font-sans text-base md:text-lg text-charcoal leading-snug max-w-xl mb-9"
          >
            The calculators, the checklists, the course, and the answers I wish
            somebody had handed me in year one. Start with the free property
            score. It takes about ten minutes and tells you whether your
            property is worth converting before you spend a dollar on it.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              href="/resources/co-living-property-calculator"
              variant="primary"
              size="lg"
            >
              Score Your Property Free
            </Button>
            <Button
              href={bookingUrl({
                founder: "della",
                source: BOOKING_SOURCES.COLIVING_HERO,
              })}
              variant="secondary"
              size="lg"
            >
              Book a Call With Me
            </Button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="font-sans text-sm text-charcoal/60 mt-6 italic"
          >
            No sales theater. Calls are working sessions.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none lg:mx-0"
        >
          <div className="absolute inset-0 bg-warm-gold/25 rounded-sm translate-x-4 translate-y-4" />
          <div className="relative w-full h-full overflow-hidden rounded-sm">
            <Image
              src="/images/Website%20Images/Della%20Casual.png"
              alt="Della Henry, co-living and mid-term rental operator, co-founder of Be Nice Hospitality Group"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 42vw"
              className="object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
