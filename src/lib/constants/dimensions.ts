import type { FocusDimensionKey } from "@/lib/types/audit";

export interface DimensionOption {
  key: FocusDimensionKey;
  label: string;
  description: string;
}

export const DIMENSIONS: DimensionOption[] = [
  {
    key: "revenue_opportunity",
    label: "Revenue Opportunity",
    description: "OTA dependency, direct booking gap, upsell economics",
  },
  {
    key: "online_reputation",
    label: "Online Reputation",
    description: "Review patterns, sentiment gap, response coverage",
  },
  {
    key: "competitive_position",
    label: "Competitive Position",
    description: "Pricing relative to comp set, positioning gaps",
  },
  {
    key: "guest_personas",
    label: "Guest Personas",
    description: "Who actually stays vs. who you're marketing to",
  },
  {
    key: "tech_stack",
    label: "Tech Stack",
    description: "Booking engine, mobile experience, guest comms",
  },
  {
    key: "visibility_discoverability",
    label: "Visibility & Discoverability",
    description: "Distribution, OTAs, Google, AI search",
  },
  {
    key: "quick_wins",
    label: "Quick Wins",
    description: "Cross-domain top 5 highest-impact fixes",
  },
  {
    key: "general_all_seven",
    label: "General / All Seven",
    description: "I'm not sure where to focus, let's talk through everything",
  },
];

export const FOCUS_DIMENSION_KEYS: FocusDimensionKey[] = DIMENSIONS.map((d) => d.key);
