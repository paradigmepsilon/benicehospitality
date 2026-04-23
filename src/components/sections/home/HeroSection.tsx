'use client';

import { motion } from 'framer-motion';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import Button from '@/components/ui/Button';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HeroSection() {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="/images/BNHG Intro Video.mp4"
      bgImageSrc="/images/backgroundimage2.jpg"
      titleLine1="Your Boutique Hotel Deserves"
      titleLine2="Better Than Guesswork"
      scrollToExpand="Scroll to explore"
      textBlend
    >
      <motion.div
        className="flex flex-col items-center text-center px-6 py-16 max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={itemVariants}
          className="font-sans text-sm md:text-base tracking-[0.3em] uppercase text-charcoal/60 mb-4"
        >
          We help
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="font-script text-primary-green text-4xl md:text-5xl lg:text-6xl font-normal mb-10 leading-tight"
        >
          Independent Luxury Boutique Properties
        </motion.p>

        <motion.div variants={itemVariants} className="w-full space-y-6 mb-10">
          <p className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-near-black tracking-tight">
            Grow Direct Revenue
          </p>
          <div className="w-16 h-px bg-warm-gold mx-auto" />
          <p className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-near-black tracking-tight">
            Streamline Operations
          </p>
          <div className="w-16 h-px bg-warm-gold mx-auto" />
          <p className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-near-black tracking-tight">
            Create Guest Experiences that Feel
            <span className="text-warm-gold italic"> Premium</span>
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-display text-lg md:text-xl text-charcoal/70 italic"
        >
          — Without adding complexity.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10">
          <Button href="/book" variant="primary" size="lg">
            Book a Discovery Call
          </Button>
        </motion.div>
      </motion.div>
    </ScrollExpandMedia>
  );
}
