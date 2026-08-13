import { type CheckSection } from "@/components/resources/ChecklistTool";

// The Room Rental Riches path as a working checklist: the milestones of The Be
// Nice Way, phase by phase, so a reader finishes with a business rather than a
// pile of notes. Mirrors the book's Welcome and Chapters 1-6.
export const COURSE_SECTIONS: CheckSection[] = [
  {
    id: "getting-started",
    label: "Getting Started (Welcome)",
    shortLabel: "Getting Started",
    items: [
      { id: "why", label: "Write down why you are doing this and the monthly income that makes it worth it" },
      { id: "space", label: "Take an honest inventory of your space: bedrooms, bathrooms, condition" },
      { id: "map", label: "Map every demand center within a 15-20 minute drive (hospitals, universities, business districts, bases)" },
      { id: "time", label: "Block two or three recurring work sessions a week on your calendar" },
    ],
  },
  {
    id: "ch1",
    label: "Chapter 1 — Property Viability & Audience",
    shortLabel: "Ch 1: Viability",
    items: [
      { id: "viability", label: "Score your target property in the Property Viability Calculator" },
      { id: "audience", label: "Build your Target Audience Matrix for your top one to three segments" },
      { id: "market", label: "Complete the Market Demand Worksheet for your area" },
      { id: "match", label: 'Write your one-sentence match: "My property serves [audience] because [reason]"' },
    ],
  },
  {
    id: "ch2",
    label: "Chapter 2 — Financial Foundations",
    shortLabel: "Ch 2: Financials",
    items: [
      { id: "tier", label: "Choose your budget tier (economy, standard, premium)" },
      // Label only. The `id` is persisted in every member's saved checklist
      // state, so renaming it would silently untick this row for everyone.
      { id: "startup", label: "Complete the launch-cost section of the Co-Living Property Profitability Analysis Worksheet" },
      { id: "reserve", label: "Set your operating reserve at two to three months of fixed costs" },
      { id: "comps", label: "Research eight to ten comparable listings and record their rates" },
      { id: "price", label: "Set introductory per-room prices in the Co-Living Property Profitability Analysis Worksheet" },
      { id: "projection", label: "Build a 12-month revenue projection with best, likely, and worst cases" },
      { id: "profitfirst", label: "Set your profit-first percentage and open a separate profit account" },
      { id: "pandl", label: "Set up the Profit & Loss tracker before your first booking" },
    ],
  },
  {
    id: "ch3",
    label: "Chapter 3 — Setup & Design",
    shortLabel: "Ch 3: Setup",
    items: [
      { id: "profile", label: "Write the audience profile that drives every design decision" },
      { id: "zones", label: "Measure your rooms and define zones (sleep, work, connect)" },
      { id: "mood", label: "Build a mood board and choose a style on a neutral foundation" },
      { id: "furniture", label: "Create a room-by-room furniture plan with target prices and sources" },
      { id: "inventory", label: "Stock the home with the essentials that make it genuinely livable" },
      { id: "stage", label: "Style and stage the space, then shoot it in natural light" },
    ],
  },
  {
    id: "ch4",
    label: "Chapter 4 — Operations & Management",
    shortLabel: "Ch 4: Operations",
    items: [
      { id: "platforms", label: "Choose your primary and secondary listing platforms and create profiles" },
      { id: "listing", label: "Draft your listing: title, 12-15 sequenced photos, four-part description, positive rules" },
      { id: "agreement", label: "Customize the Room Rental Agreement and House Rules, and have an attorney review" },
      { id: "calendar", label: "Set up your Google Calendar system with color coding, buffers, and booking rules" },
      { id: "messages", label: "Write and schedule your five automated guest messages" },
      { id: "trackers", label: "Set up your Tenant Tracker, rent log, and monthly review" },
      { id: "cleaners", label: "Hire a primary and a backup cleaner and sign an agreement" },
      { id: "maintenance", label: "Build your Maintenance Tracker and add two vetted providers per category" },
    ],
  },
  {
    id: "ch5",
    label: "Chapter 5 — Marketing",
    shortLabel: "Ch 5: Marketing",
    items: [
      { id: "brand", label: "Define your brand: positioning, visual identity, and voice" },
      { id: "content", label: "Build your content system: a monthly plan, batched creation, and a schedule" },
      { id: "video", label: "Start posting short-form video on TikTok and Instagram, three to five times a week" },
      { id: "convert", label: "Set up conversion scripts, under-one-hour responses, and a follow-up cadence" },
      { id: "reviews", label: "Build the review-and-referral loop", optional: true },
    ],
  },
  {
    id: "ch6",
    label: "Chapter 6 — Maximizing Revenue & Scaling",
    shortLabel: "Ch 6: Scaling",
    items: [
      { id: "upsell", label: "Add two or three upsells and read the demand" },
      { id: "loyalty", label: "Launch your loyalty and referral systems" },
      { id: "community", label: "Build genuine community among your tenants", optional: true },
      { id: "scale", label: "Run the five-point readiness checklist before adding property two", optional: true },
    ],
  },
];
