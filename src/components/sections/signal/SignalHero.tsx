"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";

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

export default function SignalHero() {
  return (
    <section className="relative bg-off-white pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-baseline gap-3"
          >
            <span className="font-script text-7xl md:text-8xl lg:text-9xl leading-none text-terracotta">
              Signal
            </span>
            <span className="font-display text-xl md:text-2xl tracking-tight text-near-black">
              by BNHG
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold text-near-black leading-[0.98] tracking-tight mb-8"
          >
            Be the hotel
            <br />
            AI recommends.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-display italic text-xl md:text-2xl text-charcoal/80 leading-snug max-w-xl mb-8"
          >
            The AI-first services layer for independent boutique luxury hotels. We help
            10 to 50 room properties get cited in ChatGPT, recover revenue from OTA
            leakage, and automate the manual work eating your week. Delivered in
            sprints. Backed by guarantees.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-6 mt-8"
          >
            <Button href="/book" variant="primary" size="lg">
              Book a 40-Minute Discovery Call
            </Button>
            <a
              href="#offerings"
              className="font-sans text-sm font-medium text-near-black border-b border-warm-gold pb-1 hover:text-primary-green hover:border-primary-green transition-colors"
            >
              See the offerings
            </a>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="font-sans text-sm text-charcoal/60 max-w-lg leading-relaxed mt-6"
          >
            For US boutique luxury properties. No long-term contracts. Every engagement
            backed by a specific outcome guarantee.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden"
        >
          {/* Aesthetic: editorial boutique hotel interior, morning light, no people, material texture (Aman / Rosewood register). */}
          <Image
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
            alt="Soft morning light falling across a quiet boutique hotel sitting room with warm wood and linen textures."
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-near-black/5 mix-blend-multiply pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
