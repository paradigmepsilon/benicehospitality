'use client';

import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import Button from '@/components/ui/Button';

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
      <div className="flex flex-col items-center text-center gap-6 px-6 py-16 max-w-2xl mx-auto">
        <div className="font-display text-2xl md:text-3xl text-near-black font-semibold leading-snug text-center">
          <p>We help</p>
          <p className="font-script text-primary-green text-3xl md:text-4xl font-normal mb-3">Independent Luxury Boutique Hotels</p>
          <ul className="text-center inline-block space-y-1 mb-3 text-base md:text-lg font-sans font-normal">
            <li>Grow Direct Revenue</li>
            <li><div className="w-8 h-px bg-warm-gold/50 mx-auto my-1" /></li>
            <li>Streamline Operations</li>
            <li><div className="w-8 h-px bg-warm-gold/50 mx-auto my-1" /></li>
            <li>Create Guest Experiences that Feel Premium</li>
          </ul>
          <p>Without adding complexity.</p>
        </div>
        <div className="mt-4">
          <Button href="/book" variant="primary" size="lg">
            Book a Discovery Call
          </Button>
        </div>
      </div>
    </ScrollExpandMedia>
  );
}
