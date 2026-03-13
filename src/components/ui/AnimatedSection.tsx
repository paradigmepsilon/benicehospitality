"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

interface AnimatedSectionProps {
  children: ReactNode;
  theme?: "dark" | "light" | "off-white" | "green" | "none";
  className?: string;
  delay?: number;
  stagger?: boolean;
  id?: string;
}

const themeClasses: Record<string, string> = {
  dark: "bg-near-black text-white",
  light: "bg-white text-charcoal",
  "off-white": "bg-off-white text-charcoal",
  green: "bg-primary-green text-white",
  none: "",
};

export default function AnimatedSection({
  children,
  theme = "light",
  className = "",
  delay = 0,
  stagger = false,
  id,
}: AnimatedSectionProps) {
  const variants = stagger ? staggerContainer : fadeUp;

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      custom={delay}
      className={[
        "relative",
        theme !== "none" ? themeClasses[theme] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedDiv({
  children,
  className = "",
  delay = 0,
  stagger = false,
}: Omit<AnimatedSectionProps, "theme" | "id">) {
  const variants = stagger ? staggerContainer : fadeUp;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
