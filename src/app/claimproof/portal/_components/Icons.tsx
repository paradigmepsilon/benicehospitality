/**
 * Portal icon set: inline SVG, 1.5px stroke, currentColor. One visual
 * language across the Command Center (no emoji, no mixed icon families).
 * All server-safe; size via className (defaults to h-5 w-5).
 */

type IconProps = { className?: string };

function base(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: className ?? "h-5 w-5",
    "aria-hidden": true as const,
  };
}

/** Emergency / urgent: bolt. */
export function IconBolt({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
    </svg>
  );
}

/** Proof Pack: camera. */
export function IconCamera({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.4-2h7.8l1.4 2h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

/** Valuation Pack: scale. */
export function IconScale({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3v18M5 21h14M12 5.5 6 7m6-1.5L18 7" />
      <path d="M3.5 13 6 7l2.5 6a2.6 2.6 0 0 1-5 0ZM15.5 13 18 7l2.5 6a2.6 2.6 0 0 1-5 0Z" />
    </svg>
  );
}

/** Follow-Up Pack: chat bubble. */
export function IconChat({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </svg>
  );
}

/** Fleet Operations: layered grid. */
export function IconFleet({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function IconArrowUpRight({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M7 17 17 7m0 0H8.5M17 7v8.5" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconPrinter({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M7 8V3.5h10V8M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-6A1.5 1.5 0 0 1 4.5 8h15A1.5 1.5 0 0 1 21 9.5v6a1.5 1.5 0 0 1-1.5 1.5H17" />
      <path d="M7 13.5h10v7H7v-7Z" />
    </svg>
  );
}

export function IconCopy({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

/** Example / "what right looks like": sparkle. */
export function IconSparkle({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3.5c.7 3.9 2.6 5.8 6.5 6.5-3.9.7-5.8 2.6-6.5 6.5-.7-3.9-2.6-5.8-6.5-6.5 3.9-.7 5.8-2.6 6.5-6.5Z" />
      <path d="M18.5 15.5c.35 1.9 1.1 2.65 3 3-1.9.35-2.65 1.1-3 3-.35-1.9-1.1-2.65-3-3 1.9-.35 2.65-1.1 3-3Z" />
    </svg>
  );
}

export function IconPencil({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m14.5 5.5 4 4L8 20l-4.5.5L4 16 14.5 5.5Z" />
      <path d="m12.5 7.5 4 4" />
    </svg>
  );
}

export function IconDoc({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 3.5h8L19 8.5v12H6v-17Z" />
      <path d="M13.5 3.5v5.5H19M9 12.5h6M9 15.5h6M9 9.5h2" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 19.5h15" />
    </svg>
  );
}

/** Warn callouts: alert triangle. */
export function IconAlert({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 4 2.8 19.5h18.4L12 4Z" />
      <path d="M12 10v4.5m0 2.5v.5" />
    </svg>
  );
}

/** Map a pack slug to its icon. */
export function PackIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  switch (slug) {
    case "emergency":
      return <IconBolt className={className} />;
    case "proof":
      return <IconCamera className={className} />;
    case "valuation":
      return <IconScale className={className} />;
    case "followup":
      return <IconChat className={className} />;
    case "fleet-ops":
      return <IconFleet className={className} />;
    default:
      return <IconDoc className={className} />;
  }
}
