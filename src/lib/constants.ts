import type {
  PillarCard,
  CaseStudy,
  InsightPost,
  TeamMember,
  Differentiator,
  FrameworkPhase,
  FreeResource,
  MetricStat,
  FAQItem,
} from "./types";

// NAV_LINKS retired in the IA migration. The primary nav now lives in
// src/lib/nav.ts as NAV_TREE. Header and Footer consume NAV_TREE directly.

// The three pillars of the Host-to-Operator Method. Locked names from the
// brand brief; do not rename. Editorial body paragraphs replace the legacy
// bullet-list pattern. No stat kickers, since invented operational claims violate
// the brand's no-income-claims rule and real outcome data does not yet exist.
export const PILLARS: PillarCard[] = [
  {
    title: "Operate Like a Business",
    tagline:
      "Numbers, systems, and accountability. Not just hospitality instincts.",
    body: "If you can't pull your direct booking percentage, your revenue per available night, and your cost per booking in under a minute, you're hosting, not operating. Our methods teaches you how to create and use dashboards, SOPs, and weekly review cadence that turn a portfolio into a P&L.",
  },
  {
    title: "Automate With Intelligence",
    tagline: "Automation that knows when to stop.",
    body: "Cleaner SMS that fires when the cleaner's running late. Pricing that adjusts when the comp set moves. Replenishment that orders before you're out of supplies. The right automation handles those tasks you'd otherwise forget, but stays out of the conversations that need you in them.",
  },
  {
    title: "Own Your Guests",
    tagline:
      "OTAs are a discovery channel. They are not your customer list.",
    body: "Every booking that comes through Airbnb, VRBO, Booking.com or Turo belongs to them. You have to make it yours. Direct booking pages that convert, post-stay capture flows, owned email lists, and a reason to come back. Without these, you're paying 15 to20% commission for a customer relationship you don't actually own.",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    propertyType: "24-Room Urban Boutique",
    location: "Savannah, GA",
    challenge: "OTA dependency exceeding 70% of total bookings",
    result: "Direct bookings increased 34% in 90 days",
    metric: "+34% Direct Bookings",
    placeholder: true,
  },
  {
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    propertyType: "38-Room Destination Property",
    location: "Asheville, NC",
    challenge: "Fragmented tech stack with no central guest data",
    result: "$42K in ancillary revenue recovered in first quarter",
    metric: "+$42K Ancillary Revenue",
    placeholder: true,
  },
  {
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    propertyType: "16-Room Historic Inn",
    location: "Charleston, SC",
    challenge: "High staff turnover driven by inconsistent SOPs",
    result: "Staff retention improved 40% after SOP buildout and training",
    metric: "+40% Staff Retention",
    placeholder: true,
  },
];

export const INSIGHTS: InsightPost[] = [
  {
    title:
      "What Independent Boutique Stays Get Wrong About Direct Bookings",
    excerpt:
      "Most boutique stays have a direct booking problem they don't know how to solve, or worse, one they don't know they have. Here's where the money is hiding and how to reclaim it.",
    category: "Revenue Strategy",
    date: "February 2026",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    slug: "direct-booking-mistakes-boutique-hotels",
  },
  {
    title:
      "Why Your Boutique Stay's Tech Stack Is Costing You More Than You Think",
    excerpt:
      "The average independent operator pays for 6 to 8 technology tools. Fewer than half are configured correctly. The overlap is costing you time, money, and data you'll never get back.",
    category: "Hotel Technology",
    date: "January 2026",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    slug: "boutique-hotel-tech-stack-costs",
  },
  {
    title:
      "The Service Recovery Framework That Turns Complaints Into Loyalty",
    excerpt:
      "How you handle a problem tells a guest more about your hotel than anything they experienced when things were going right. Here's the framework that transforms complaints into your most loyal advocates.",
    category: "Guest Experience",
    date: "December 2025",
    image:
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80",
    slug: "service-recovery-framework-boutique-hotels",
  },
];

export const TEAM: TeamMember[] = [
  {
    name: "Alex Henry",
    title: "Co-Founder & Principal Consultant",
    bio: "Alex spent years at Delta Air Lines leading enterprise customer notification systems that reached millions of travelers. That experience taught him how communication infrastructure at scale either builds trust or breaks it. A United States Marine Corps veteran, he brings operational discipline to everything he touches. At BNHG, Alex leads the commercial performance and technology practice. He handles revenue management strategy, rate optimization, channel distribution, OTA rebalancing, direct booking conversion, PMS and CRM architecture, tech stack audits, and automation design. He built Guestally from the ground up after seeing the same guest engagement gap across dozens of boutique properties: hotels spending money to get guests in the door but leaving revenue on the table once they arrived. When Alex walks a property, he is reading your STR comp set data, auditing your channel manager configuration, and mapping every point where revenue leaks out of your operation.",
    image: "/images/Lex.jpeg",
  },
  {
    name: "Della Henry",
    title: "Co-Founder & Director of Guest Experience",
    bio: "Della is a U.S. Army veteran who brings the same leadership discipline from her military career into the guest experience and operations side of BNHG. Her background in behavioral psychology sets her apart from traditional hospitality trainers. She does not teach staff to follow a script. She teaches them to read guests, anticipate needs, and recover service failures before they become 1-star reviews. Della leads guest journey mapping, SOP development, front desk and housekeeping service standards, pre-arrival and in-stay touchpoint design, staff training programs, and post-checkout loyalty workflows. She builds the human operating system that sits underneath everything else. Your PMS can track a guest preference, but Della makes sure your team actually acts on it. From turndown service details to the language your front desk uses during check-in, she designs every service moment to feel intentional rather than transactional. Hotels that work with Della do not just get higher review scores. They get repeat guests who book direct.",
    image: "/images/Dee.jpeg",
  },
];

export const DIFFERENTIATORS: Differentiator[] = [
  {
    title: "Systems Thinking Meets People Thinking",
    description:
      "We pair revenue strategy and data analytics with behavioral psychology and guest experience design. Most consultants do one or the other. We do both, and the results compound.",
  },
  {
    title: "We Built Proprietary Software",
    description:
      "Guestally solves one of the biggest gaps in boutique hospitality: meaningful, automated guest communication that actually drives revenue. We built it because nothing else on the market did what our clients needed.",
  },
  {
    title: "We Focus Exclusively on the Segment Everyone Else Overlooks",
    description:
      "10 to 50 room independents get ignored by large consulting firms and underserved by tech vendors who are building for Marriott. We built BNHG specifically for you.",
  },
];

export const FRAMEWORK_PHASES: FrameworkPhase[] = [
  {
    number: 1,
    name: "Diagnose",
    description:
      "We start by understanding your current state with precision, not assumptions. Revenue data, tech stack, guest feedback, competitive positioning. We map what's working and what's costing you.",
  },
  {
    number: 2,
    name: "Prioritize",
    description:
      "Not every opportunity is equal. We rank improvements by financial impact and implementation effort, so we're always working on the thing that moves the needle most.",
  },
  {
    number: 3,
    name: "Implement",
    description:
      "We don't leave you with a report and a handshake. We build, configure, and execute alongside your team: a direct booking campaign, an SOP library, or a full tech migration.",
  },
  {
    number: 4,
    name: "Train",
    description:
      "Systems only work if people use them correctly. We design training that sticks, not binders that collect dust. Your team leaves every engagement more capable than when we arrived.",
  },
  {
    number: 5,
    name: "Optimize",
    description:
      "The best hospitality operations never stop improving. We build feedback loops into every engagement so results compound over time, not just in the first 90 days.",
  },
];

export const FREE_RESOURCES: FreeResource[] = [
  {
    name: "Revenue Opportunity Snapshot",
    description:
      "A property-specific look at where your top revenue opportunities are hiding right now.",
  },
  {
    name: "Online Reputation Briefing",
    description:
      "An analysis of your review footprint across platforms and where perception gaps are costing you bookings.",
  },
  {
    name: "Competitive Position Map",
    description:
      "How you stack up against your top 3 competitors on price, positioning, and perceived value.",
  },
  {
    name: "Guest Persona Highlights",
    description:
      "A sketch of who's actually booking boutique stays in your market and what they're looking for.",
  },
  {
    name: "Tech Stack Quick Scan",
    description:
      "A surface-level review of your current technology tools: what's redundant, what's missing, and what to prioritize.",
  },
  {
    name: "Guestally ROI Estimate",
    description:
      "A projection of the incremental revenue and time savings Guestally would generate at your property.",
  },
  {
    name: "Visibility & Discoverability Audit",
    description:
      "How easily can travelers find your property? SEO, listing optimization, and distribution gap analysis.",
  },
  {
    name: "Quick Win Action List",
    description:
      "5 to 10 specific, implementable actions you could take this month to improve performance.",
  },
];

export const METRICS: MetricStat[] = [
  { value: "34", suffix: "%", label: "Average increase in direct bookings" },
  {
    value: "42",
    suffix: "K",
    label: "Average ancillary revenue recovered",
  },
  { value: "18", suffix: "hrs", label: "Staff hours saved monthly per property" },
];

// The homepage proof band. Deliberately empty: these are consulting-era
// numbers above (direct-booking lift, ancillary revenue, staff hours saved)
// for a service BNHG no longer sells, so they never render on the asset
// management homepage. This array holds real operating figures instead
// (units managed, vehicles managed, cities, years operating) once Alex
// supplies them. ProofBand.tsx returns null while it is empty. Do not seed
// it with a placeholder or an estimated number.
export const OPERATING_PROOF: MetricStat[] = [];

export const FAQ_CATEGORIES = [
  "About BNHG & Consulting Basics",
  "Revenue & Direct Booking",
  "Hotel Technology",
  "Working with BNHG",
] as const;

export const FAQ_ITEMS: FAQItem[] = [
  // About BNHG & Consulting Basics
  {
    category: "About BNHG & Consulting Basics",
    question: "What does a boutique stay consultant do?",
    answer:
      "A boutique stay consultant helps independent operators improve revenue, operations, guest experience, and technology. For independent boutique stays, typically 10 to 50 rooms, that usually means direct booking strategy, OTA channel rebalancing, tech stack optimization, guest messaging, and operational systems. At BNHG, we focus specifically on independent luxury boutique stays, from hotels and inns to design-forward short-term rentals, and work across commercial, guest experience, and technology pillars rather than revenue management alone.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "How much does boutique stay consulting cost?",
    answer:
      "Boutique stay consulting typically ranges from a few thousand dollars for a targeted diagnostic to $5,000 to $15,000+ per month for ongoing fractional advisory. BNHG uses a 4-tier model: Tier 0 resources are free, Tier 1 diagnostics are scoped engagements, Tier 2 is implementation work, and Tier 3 is ongoing fractional advisory. Pricing depends on scope, property size, and timeline. The cheapest way to start is with a free Tier 0 resource so you can evaluate the quality of our thinking before committing.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "Who is Be Nice Hospitality Group?",
    answer:
      "Be Nice Hospitality Group (BNHG) is a boutique stay consulting and technology firm for independent luxury operators, typically 10 to 50 rooms, from boutique hotels and inns to design-forward short-term rentals. Based in Hapeville, Georgia, BNHG was co-founded by Alex and Della Henry, 2 military veterans who combine enterprise operations experience with deep hospitality expertise. The firm also builds Guestally, a guest messaging and upsell automation platform for independent operators.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "What size boutique stays does BNHG work with?",
    answer:
      "BNHG specializes in independent luxury boutique stays. That includes urban boutique hotels, destination properties, historic inns, lifestyle hotels, and design-forward short-term and vacation rentals that are owner-operated or managed by a small leadership team. Our hotel engagements typically run 10 to 50 rooms. We don't work with large branded hotels or high-volume chains.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "How is BNHG different from larger hospitality consulting firms?",
    answer:
      "Large hospitality consulting firms like Xotels or HVS primarily serve branded chains or 100+ room properties and often focus narrowly on revenue management. BNHG is built for independent operators at the 10 to 50 room range, works across commercial, guest experience, and tech pillars, and offers a free Tier 0 layer so owners can try the thinking before paying. We also build our own software (Guestally), which means we understand the tech side from the inside.",
  },

  // Revenue & Direct Booking
  {
    category: "Revenue & Direct Booking",
    question: "How do I reduce OTA dependency at my boutique stay?",
    answer:
      "Reducing OTA dependency at an independent boutique stay requires 3 things working together: a high-converting direct booking website, a parity and rate strategy that rewards direct guests, and retargeting of OTA-acquired guests into direct channels on repeat stays. In practice that means auditing your booking engine, tightening rate parity, launching a best-rate guarantee, improving on-site SEO, and capturing email on every booking. Most boutique stays we work with move from 60%+ OTA dependency to under 40% within 6 to 9 months.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "What's a realistic direct booking percentage for a boutique stay?",
    answer:
      "A healthy direct booking percentage for an independent boutique stay is 45 to 60%. Properties that lean heavily on OTAs for discovery often sit at 25 to 35% direct. Properties with strong brands, repeat guests, and a well-optimized website can push 60 to 70%. Direct booking as a percentage of total bookings is more important than total volume. Every direct booking saves 15 to 25% in OTA commission.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "How do boutique stays increase ancillary revenue?",
    answer:
      "Boutique stays increase ancillary revenue by pre-selling upgrades and experiences before arrival, offering smart in-stay upsells through guest messaging, and packaging local partnerships (restaurants, spas, activities) as add-ons. The highest-ROI moves are pre-arrival upsells (room upgrades, early check-in, late check-out, amenity kits) because guests are already committed. Guestally automates this entire flow so you capture revenue without manual effort from your front desk.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "What's the ROI on a hotel tech audit?",
    answer:
      "Hotel tech audits typically pay for themselves within 30 to 60 days. Most boutique stays we audit are overpaying for 2 to 4 overlapping tools and missing 1 to 2 critical ones. A well-run audit usually surfaces $500 to $3,000 per month in redundant software spend and unlocks new revenue opportunities (upsells, direct booking tooling, guest messaging) that were previously unavailable. The implementation timeline is usually 2 to 4 weeks.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "How long does it take to see revenue improvements from consulting?",
    answer:
      "Revenue improvements at a boutique stay show up in 3 waves. Quick wins (tech consolidation, OTA parity fixes, ancillary upsells) appear within 30 to 60 days. Direct booking shifts and conversion improvements take 90 to 120 days. Compounding revenue (brand strength, repeat guests, rate positioning) takes 6 to 12 months. Most BNHG clients see measurable revenue impact within the first 90 days.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "What's included in a hotel revenue audit?",
    answer:
      "A hotel revenue audit from BNHG covers OTA dependency and channel mix, direct booking conversion, rate parity and positioning, ancillary revenue capture, guest segmentation and acquisition cost, and benchmark comparison against comparable properties. The output is a short written report with specific, prioritized actions, not a generic scorecard. The free Tier 0 Revenue Opportunity Snapshot is a lighter version of this audit.",
  },

  // Hotel Technology
  {
    category: "Hotel Technology",
    question: "What is the best guest messaging software for small hotels?",
    answer:
      "The best guest messaging software for small independent operators is one that integrates with your PMS, automates pre-arrival and in-stay messaging, captures upsell revenue, and doesn't require a dedicated ops person to run. Guestally was built specifically for independent boutique stays (10 to 50 rooms) that want messaging and upsell automation without enterprise complexity. Other options in the market include Canary Technologies, Akia, and Duve, but most are priced and scoped for larger or branded properties.",
  },
  {
    category: "Hotel Technology",
    question: "What's included in a hotel tech audit?",
    answer:
      "A hotel tech audit reviews your PMS, booking engine, channel manager, CRM, guest messaging, payment processing, housekeeping and maintenance tools, and analytics stack. BNHG's audit flags redundant tools you can cut, critical tools you are missing, integration gaps between systems, and priorities for the next 90 days. The deliverable is a written report with a before/after stack diagram and a month-by-month implementation plan.",
  },
  {
    category: "Hotel Technology",
    question: "Do independent hotels need a PMS, booking engine, and channel manager?",
    answer:
      "Yes. An independent hotel needs a property management system (PMS) to run reservations and operations, a booking engine to accept direct reservations on your website, and a channel manager to keep rates and inventory in sync across OTAs. Modern platforms like Mews, Cloudbeds, and Little Hotelier bundle these together for small properties. The wrong combination is usually where small hotels bleed money, either through overlapping tools or missing integrations.",
  },
  {
    category: "Hotel Technology",
    question: "How do I know if my hotel tech stack is overbuilt?",
    answer:
      "Your hotel tech stack is probably overbuilt if you pay for more than 1 tool that does the same job (2 booking engines, multiple upsell tools, overlapping CRMs), if you have software nobody on staff uses, or if the total monthly cost exceeds 3 to 4% of your revenue. Most boutique stays we audit are overpaying for 2 to 4 redundant tools. A Tech Stack Quick Scan will surface this in about a week.",
  },
  {
    category: "Hotel Technology",
    question: "What is Guestally and how does it work?",
    answer:
      "Guestally is a guest messaging and upsell automation platform for independent boutique stays. It connects to your PMS, automates pre-arrival messaging, surfaces personalized upsell offers (upgrades, early check-in, experiences), handles in-stay guest requests, and captures reviews post-stay. It's built specifically for 10 to 50 room independent properties, not enterprise chains. Guestally is a subsidiary of Be Nice Hospitality Group.",
  },
  {
    category: "Hotel Technology",
    question: "Can small hotels use the same tech as major brands?",
    answer:
      "Not usually. Major brand tech stacks are priced for 100+ room properties and require dedicated operations and IT resources to run. Small independent hotels need simpler, integrated platforms built for owner-operators. The right stack for a 20-room boutique is very different from a 200-room Hilton, and trying to run enterprise tools at that scale usually costs more than the revenue lift.",
  },

  // Working with BNHG
  {
    category: "Working with BNHG",
    question: "What's the difference between Tier 0, 1, 2, and 3 services?",
    answer:
      "Tier 0 is our free layer: 8 research-backed resources (Revenue Opportunity Snapshot, Online Reputation Briefing, Tech Stack Quick Scan, and more) that we deliver with no strings attached. Tier 1 is paid diagnostics: scoped audits of a specific problem area. Tier 2 is implementation, where we do the work alongside your team. Tier 3 is ongoing fractional advisory, a monthly strategic partnership with one of our principals. Most clients start at Tier 0, move to Tier 1, and decide from there.",
  },
  {
    category: "Working with BNHG",
    question: "How do I start working with BNHG?",
    answer:
      "The fastest way to start with BNHG is to request a free Tier 0 resource. It gives you a research-backed deliverable specific to your property with no commitment. If you prefer to talk first, book a 40-minute discovery call. Both paths are free. We'll never pitch you until we understand your property, your goals, and what kind of partner (if any) you actually need.",
  },
  {
    category: "Working with BNHG",
    question: "Do you work with boutique stays outside the Southeast U.S.?",
    answer:
      "Yes. BNHG is based in Hapeville, Georgia, but we work with independent boutique stays across the United States. Most of our engagements are remote-first with occasional on-site visits depending on scope. If you are outside the U.S. and running an independent boutique stay in the 10 to 50 room range, reach out. We evaluate engagements case by case.",
  },
  {
    category: "Working with BNHG",
    question: "What happens on a discovery call?",
    answer:
      "A BNHG discovery call is 40 minutes, booked into a 1-hour slot so we never have to rush. We ask about your property, your current operations and tech, the 1 to 2 problems that are top of mind, and where you'd like to be in 12 months. We end the call with a specific recommendation: either a free Tier 0 resource, a paid engagement, or a referral if we're not the right fit. No slide decks, no pressure, no generic playbook.",
  },
  {
    category: "Working with BNHG",
    question: "What free resources does BNHG offer?",
    answer:
      "BNHG offers 8 free Tier 0 resources for boutique stay operators: the Revenue Opportunity Snapshot, Online Reputation Briefing, Competitive Position Map, Guest Persona Highlights, Tech Stack Quick Scan, Guestally ROI Estimate, Visibility & Discoverability Audit, and Quick Win Action List. Each is custom to your property, research-backed, and completely free. Start with whichever one maps to your biggest question right now.",
  },
];
