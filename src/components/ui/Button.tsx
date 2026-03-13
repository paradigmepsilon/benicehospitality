"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "terracotta";
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
  primary:
    "bg-primary-green text-white hover:bg-primary-green-dark border-2 border-primary-green hover:border-primary-green-dark",
  secondary:
    "bg-transparent text-warm-gold border-2 border-warm-gold hover:bg-warm-gold hover:text-near-black",
  ghost:
    "bg-transparent text-white border-2 border-white/40 hover:border-white hover:bg-white/10",
  terracotta:
    "bg-terracotta text-white hover:bg-terracotta/85 border-2 border-terracotta hover:border-terracotta/85",
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
