"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "terracotta" | "light";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: warm-gold bg, near-black text. Brief calls for white text on gold,
  // but #B08D57 + white only reaches 3.1:1 (fails WCAG AA at most button sizes).
  // Near-black on gold is 5.6:1 — passes AA for normal text and reads more
  // editorial than the high-contrast gold/white combo would.
  primary:
    "bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark",
  // Secondary: deep-teal outline + text on cream/white. Hover fills teal, flips
  // text to white. Passes AAA on cream backgrounds.
  secondary:
    "bg-transparent text-primary-green border-2 border-primary-green hover:bg-primary-green hover:text-white",
  ghost:
    "bg-transparent text-white border-2 border-white/40 hover:border-white hover:bg-white/10",
  terracotta:
    "bg-terracotta text-white hover:bg-terracotta/85 border-2 border-terracotta hover:border-terracotta/85",
  // Light: warm light-gray fill with dark text and a visible darken-on-hover.
  // Designed for secondary CTAs sitting on dark hero overlays where outline
  // and ghost variants disappear; cream/white was reading too bright.
  light:
    "bg-stone-200 text-near-black hover:bg-stone-300 border-2 border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-base",
  lg: "px-9 py-4 text-lg",
};

export default function Button({
  children,
  href,
  external = false,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center",
    "font-sans font-semibold tracking-wide",
    "transition-all duration-200",
    "cursor-pointer select-none",
    "min-h-[44px] min-w-[44px]",
    "rounded-lg",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
