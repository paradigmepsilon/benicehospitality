import type {
  NavLink,
  PainPoint,
  PillarCard,
  ServiceTier,
  Testimonial,
  CaseStudy,
  InsightPost,
  TeamMember,
  Differentiator,
  FrameworkPhase,
  FreeResource,
  PropertyType,
  GuestallyFeature,
  MetricStat,
} from "./types";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },

  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export const PAIN_POINTS: PainPoint[] = [
  {
    stat: "61% of independent hotel bookings go through OTAs",
    description:
      "At 15–25% commission per booking, that's a staggering portion of your revenue walking out the door before you've even opened your doors.",
    image: "/images/ota.jpeg",
  },
  {
    stat: "65% of hotels reported staffing shortages in early 2025",
    description:
      "One bad shift shows up in tomorrow's reviews. Without systems, every absence is a guest experience liability.",
    image: "/images/staffshortage.jpeg",
  },
  {
    stat: "36% of owners say tech setup was the hardest part of opening",
    description:
      "You're overpaying for tools you underuse, and the ones you need most are still missing from your stack.",
    image: "/images/tech.jpeg",
  },
  {
    stat: "You're the owner, GM, revenue manager, and maintenance supervisor",
    description:
      "When you're wearing every hat, something always falls through the cracks. Usually the thing that costs you the most.",
    image: "/images/allhats.jpeg",
  },
];

export const PILLARS: PillarCard[] = [
  {
    title: "Commercial Performance",
    tagline: "We help you increase profitable revenue, not just occupancy.",
    points: [
      "Direct booking strategy and conversion optimization",
      "OTA rebalancing and channel distribution",
      "Package and ancillary revenue design",
      "Pricing strategy and yield management",
      "KPI dashboards that show what actually matters",
    ],
    stat:
      "37% of travelers planned to book direct in 2025. We make sure they book with you.",
  },
  {
    title: "Guest Experience & Operations",
    tagline: "Deliver a luxury feel without bloated labor costs.",
    points: [
      "Guest journey mapping from search to checkout",
      "Standard operating procedures and service standards",
      "Staff training and service excellence programs",
      "Service recovery frameworks that turn complaints into loyalty",
      "Review management and reputation strategy",
    ],
    stat:
      "In boutique luxury, consistency isn't optional. It's the product.",
  },
  {
    title: "Tech & Automation",
    tagline: "Technology should save you time, not create more work.",
    points: [
      "PMS, CRM, and channel manager audit",
      "Vendor selection and implementation support",
      "Workflow automation design",
      "Guestally SMS guest engagement platform",
      "Analytics setup and reporting dashboards",
    ],
    stat: "Stop overpaying for tools you underuse.",
  },
];

export const PROPERTY_TYPES: PropertyType[] = [
  {
    name: "Urban Boutique Hotels",
    description:
      "City properties where every detail signals intentionality, from the art on the walls to the coffee program.",
    image: "/images/urban.jpeg",
  },
  {
    name: "Destination Properties",
    description:
      "Resort-style boutiques where the experience extends far beyond the room: gardens, pools, and curated local access.",
    image: "/images/resort.jpeg",
  },
  {
    name: "Lifestyle Hotels",
    description:
      "Design-driven properties that attract a specific guest. The vibe is the brand and the brand is the marketing.",
    image: "/images/lifestyle2.jpeg",
  },
  {
    name: "Historic Inns & Character Properties",
    description:
      "Properties with a story to tell. The building itself is the competitive advantage, if you know how to use it.",
    image: "/images/historic.jpeg",
  },
];

export const SERVICE_TIERS_PREVIEW = [
  {
    tier: 0,
    label: "Free Resources",
    headline: "We do the research. You get the insight.",
    description:
      "Custom, property-specific resources delivered at no cost. No strings attached. Just a demonstration of what we know about your market.",
    cta: "Request a Free Resource",
    ctaHref: "/contact",
  },
  {
    tier: 1,
    label: "Diagnostics",
    headline: "See exactly where the opportunities are.",
    description:
      "A focused audit that identifies your highest-impact opportunities, with enough specificity to act on immediately.",
    cta: "Learn More",
    ctaHref: "/services",
  },
  {
    tier: 2,
    label: "Implementation",
    headline: "We don't just advise. We build.",
    description:
      "From direct booking campaigns to full SOP libraries. We configure, build, and train so your team can execute from day one.",
    cta: "Learn More",
    ctaHref: "/services",
  },
  {
    tier: 3,
    label: "Fractional Advisory",
    headline: "Your commercial director, without the full-time salary.",
    description:
      "Ongoing strategic partnership. We embed into your operation on a retainer basis and act as your commercial leadership team.",
    cta: "Learn More",
    ctaHref: "/services",
  },
];

export const GUESTALLY_FEATURES: GuestallyFeature[] = [
  {
    title: "Automated Guest Messaging",
    description:
      "Pre-arrival welcome sequences, in-stay check-ins, and post-stay follow-ups. All delivered via SMS without lifting a finger.",
  },
  {
    title: "Revenue-Focused Upsells",
    description:
      "Late checkout offers, breakfast upgrades, local experience packages. Triggered at the right moment to maximize uptake.",
  },
  {
    title: "Unified Messaging Hub",
    description:
      "SMS, email, and webchat in one dashboard. Your team sees every conversation, no matter where it started.",
  },
  {
    title: "Revenue & Efficiency Analytics",
    description:
      "Dashboards that quantify exactly how much incremental revenue your messaging generates and how many staff hours automation saves.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We were losing direct bookings to OTAs and didn't even realize how much it was costing us until BNHG showed us the numbers. Within 90 days we had a real direct booking strategy.",
    author: "Sarah M.",
    title: "Owner-Operator",
    property: "18-Room Urban Boutique, Charleston, SC",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "The tech audit alone was worth it. We were paying for three tools that overlapped and missing the one we actually needed. They sorted it in two weeks.",
    author: "James T.",
    title: "General Manager",
    property: "32-Room Destination Property, Asheville, NC",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Having a strategic partner who understands both the hospitality side and the business side is rare. BNHG is the first firm that's talked to me like a peer, not a client.",
    author: "Patricia L.",
    title: "Owner & Founder",
    property: "22-Room Historic Inn, Savannah, GA",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
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
      "What 10 to 50 Room Hotels Get Wrong About Direct Bookings",
    excerpt:
      "Most boutique hotels have a direct booking problem they don't know how to solve, or worse, one they don't know they have. Here's where the money is hiding and how to reclaim it.",
    category: "Revenue Strategy",
    date: "February 2026",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    slug: "direct-booking-mistakes-boutique-hotels",
  },
  {
    title:
      "Why Your Boutique Hotel's Tech Stack Is Costing You More Than You Think",
    excerpt:
      "The average independent hotel pays for 6–8 technology tools. Fewer than half are configured correctly. The overlap is costing you time, money, and data you'll never get back.",
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
    bio: "Before launching BNHG, Alex led enterprise customer notifications at Delta Air Lines, designing communication systems that reached millions of travelers. A United States Marine Corps veteran, he brings military-grade operational discipline to revenue strategy, hotel technology, and systems architecture. He built Guestally from the ground up to solve the guest engagement gap he saw across boutique properties. When Alex steps into your operation, he sees the data others miss and builds the infrastructure to capture it.",
    image: "/images/Lex.jpeg",
  },
  {
    name: "Della Henry",
    title: "Co-Founder & Director of Guest Experience",
    bio: "Della is a U.S. Army veteran who channels the same leadership and precision that defined her military career into transforming how boutique hotels train staff, design service touchpoints, and build guest loyalty. Her deep expertise in behavioral psychology means she doesn't just improve your guest experience, she engineers it. From pre-arrival messaging to checkout follow-up, Della builds the human systems that turn first-time visitors into lifelong advocates.",
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
      "How you stack up against your top three competitors on price, positioning, and perceived value.",
  },
  {
    name: "Guest Persona Highlights",
    description:
      "A sketch of who's actually booking boutique hotels in your market and what they're looking for.",
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
      "Five to ten specific, implementable actions you could take this month to improve performance.",
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

export const TIER_ONE_SERVICES = [
  {
    name: "Boutique Hotel Profit Audit",
    timeline: "2–3 weeks",
    description:
      "A comprehensive financial and operational diagnostic that identifies your highest-impact profit opportunities across revenue, cost, and operations.",
    deliverables: [
      "Revenue and expense analysis with benchmarks",
      "Top 5 profit opportunities ranked by impact",
      "90-day action roadmap",
      "Executive summary with supporting data",
    ],
  },
  {
    name: "Revenue & Distribution Audit",
    timeline: "1–2 weeks",
    description:
      "A focused examination of your revenue strategy, OTA dependency, direct booking conversion, and pricing approach.",
    deliverables: [
      "Channel mix analysis and OTA cost calculation",
      "Direct booking funnel audit",
      "Rate strategy and pricing gap analysis",
      "Revenue recovery action plan",
    ],
  },
  {
    name: "Tech Stack Assessment",
    timeline: "1–2 weeks",
    description:
      "A complete inventory and analysis of your current technology tools, identifying redundancy, gaps, and optimization opportunities.",
    deliverables: [
      "Full technology inventory with cost analysis",
      "Integration and data flow mapping",
      "Gap analysis with prioritized recommendations",
      "Vendor shortlist for any missing capabilities",
    ],
  },
  {
    name: "Guest Experience Snapshot",
    timeline: "2–3 weeks",
    description:
      "An end-to-end evaluation of your guest journey, from the first digital touchpoint to post-stay follow-up, with a clear picture of where experience and revenue are being lost.",
    deliverables: [
      "Guest journey map with gap identification",
      "Review analysis and sentiment audit",
      "Service standard benchmarking",
      "Prioritized experience improvement plan",
    ],
  },
];

export const TIER_TWO_SERVICES = [
  {
    name: "Direct Booking Growth Sprint",
    timeline: "4–8 weeks",
    description:
      "A focused engagement to systematically reduce OTA dependency and build a sustainable direct booking engine.",
    deliverables: [
      "Website conversion audit and optimization",
      "Direct booking incentive strategy",
      "Email capture and nurture sequence",
      "Rate parity audit and correction",
      "90-day booking performance dashboard",
    ],
  },
  {
    name: "Revenue Engine Setup",
    timeline: "3–6 weeks",
    description:
      "Build a complete revenue management infrastructure, from pricing strategy to yield management to reporting.",
    deliverables: [
      "Dynamic pricing framework and rate strategy",
      "Demand calendar and seasonal playbook",
      "Package and ancillary revenue program",
      "Revenue management dashboard and KPIs",
      "Monthly reporting template and cadence",
    ],
  },
  {
    name: "Guest Experience & SOP Buildout",
    timeline: "4–8 weeks",
    description:
      "Design and document the complete guest experience so every team member delivers a consistent, premium experience regardless of who's working.",
    deliverables: [
      "Full guest journey documentation",
      "Department-specific SOP library",
      "Service standards and brand voice guide",
      "Service recovery playbook",
      "Staff training materials and assessment",
    ],
  },
  {
    name: "Tech Stack Optimization",
    timeline: "6–12 weeks",
    description:
      "A comprehensive technology engagement, from audit to vendor selection to implementation and staff training.",
    deliverables: [
      "Full tech stack audit and gap analysis",
      "Vendor selection support with RFP management",
      "Implementation project management",
      "Integration configuration and testing",
      "Staff training on all new systems",
    ],
  },
  {
    name: "Operations Efficiency Sprint",
    timeline: "3–4 weeks",
    description:
      "Identify and eliminate the operational inefficiencies that are quietly costing you time, money, and staff morale.",
    deliverables: [
      "Labor cost and scheduling analysis",
      "Process mapping and bottleneck identification",
      "Automation opportunity assessment",
      "Guestally implementation (if applicable)",
      "Efficiency improvement implementation plan",
    ],
  },
];

export const TIER_THREE_SERVICES = [
  {
    name: "Fractional Commercial Director",
    hours: "8–10 hours/month",
    description:
      "Strategic commercial leadership on a retainer basis: revenue management, distribution strategy, and performance oversight without the full-time overhead.",
    includes: [
      "Monthly commercial strategy session",
      "Revenue and KPI review",
      "Pricing and channel management support",
      "Direct booking strategy oversight",
      "Quarterly performance deep-dive",
    ],
  },
  {
    name: "Tech & Systems Support",
    hours: "4–6 hours/month",
    description:
      "Ongoing technology guidance and troubleshooting so your systems stay configured correctly and your team uses them effectively.",
    includes: [
      "Monthly tech health check",
      "Vendor management support",
      "New tool evaluation and onboarding",
      "Staff training for system updates",
      "Guestally performance optimization",
    ],
  },
  {
    name: "Performance Advisory",
    hours: "4–5 hours/month",
    description:
      "A focused monthly advisory relationship for operators who want a trusted strategic partner without a full commercial engagement.",
    includes: [
      "Monthly performance review call",
      "Priority-based action planning",
      "Ad hoc strategic guidance",
      "Industry benchmarking and market intel",
      "Access to BNHG research and resources",
    ],
  },
];
