"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  /**
   * Append the round arrow disc. The disc inverts the button's own colours so
   * it reads as part of the pill rather than an icon dropped next to the label.
   */
  arrow?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: warm-gold bg, near-black text. Brief calls for white text on gold,
  // but #B08D57 + white only reaches 3.1:1 (fails WCAG AA at most button sizes).
  // Near-black on gold is 5.6:1. It passes AA for normal text and reads more
  // editorial than the high-contrast gold/white combo would.
  primary:
    "bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark",
  // Secondary: deep-teal outline + text on cream/white. Hover fills teal, flips
  // text to white. Passes AAA on cream backgrounds.
  secondary:
    "bg-transparent text-primary-green border-2 border-primary-green hover:bg-primary-green hover:text-white",
  ghost:
    "bg-white/10 text-white border-2 border-white/40 hover:border-white hover:bg-white/20 backdrop-blur-sm",
  terracotta:
    "bg-terracotta text-white hover:bg-terracotta/85 border-2 border-terracotta hover:border-terracotta/85",
  // Light: warm light-gray fill with dark text and a visible darken-on-hover.
  // Designed for secondary CTAs sitting on dark hero overlays where outline
  // and ghost variants disappear; cream/white was reading too bright.
  light:
    "bg-stone-200 text-near-black hover:bg-stone-300 border-2 border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md",
};

// The disc is the label's colours flipped. `group-hover` follows the pill's
// own hover state so the two never fall out of step.
const discClasses: Record<ButtonVariant, string> = {
  primary: "bg-near-black text-warm-gold",
  secondary: "bg-primary-green text-white group-hover:bg-white group-hover:text-primary-green",
  ghost: "bg-white text-near-black",
  terracotta: "bg-white text-terracotta",
  light: "bg-near-black text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm gap-2.5",
  md: "px-7 py-3.5 text-base gap-3",
  lg: "px-9 py-4 text-lg gap-3.5",
};

// With a disc on the right the pill's own padding pulls in so the disc sits
// just inside the curve, the way the reference pins draw it.
const arrowSizeClasses: Record<ButtonSize, string> = {
  sm: "pl-5 pr-1.5 py-1.5 text-sm gap-2.5",
  md: "pl-6 pr-2 py-2 text-base gap-3",
  lg: "pl-7 pr-2 py-2 text-lg gap-3.5",
};

const discSizeClasses: Record<ButtonSize, string> = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-10 h-10",
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
  arrow = false,
}: ButtonProps) {
  const classes = [
    "group inline-flex items-center justify-center",
    "font-sans font-semibold tracking-wide",
    "transition-all duration-200",
    "cursor-pointer select-none",
    "min-h-[44px] min-w-[44px]",
    "rounded-full",
    variantClasses[variant],
    arrow ? arrowSizeClasses[size] : sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span
          aria-hidden="true"
          className={[
            "inline-flex items-center justify-center rounded-full shrink-0",
            "transition-colors duration-200",
            discClasses[variant],
            discSizeClasses[size],
          ].join(" ")}
        >
          <ArrowRight
            className="w-[45%] h-[45%] transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.25}
          />
        </span>
      )}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
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
      {content}
    </button>
  );
}
