import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  bordered?: boolean;
}

export default function Card({
  children,
  className = "",
  dark = false,
  hover = true,
  bordered = false,
}: CardProps) {
  return (
    <div
      className={[
        "relative",
        "rounded-lg",
        dark
          ? "bg-charcoal/50 text-white"
          : "bg-white text-charcoal",
        bordered
          ? dark
            ? "border border-white/10"
            : "border border-light-gray"
          : "",
        hover
          ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
