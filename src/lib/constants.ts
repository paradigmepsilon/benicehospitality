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
  FAQItem,
} from "./types";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },

  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/faq" },
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
  },
  {
    quote:
      "The tech audit alone was worth it. We were paying for three tools that overlapped and missing the one we actually needed. They sorted it in two weeks.",
    author: "James T.",
    title: "General Manager",
    property: "32-Room Destination Property, Asheville, NC",
  },
  {
    quote:
      "Having a strategic partner who understands both the hospitality side and the business side is rare. BNHG is the first firm that's talked to me like a peer, not a client.",
    author: "Patricia L.",
    title: "Owner & Founder",
    property: "22-Room Historic Inn, Savannah, GA",
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
    bio: "Alex spent years at Delta Air Lines leading enterprise customer notification systems that reached millions of travelers. That experience taught him how communication infrastructure at scale either builds trust or breaks it. A United States Marine Corps veteran, he brings operational discipline to everything he touches. At BNHG, Alex leads the commercial performance and technology practice. He handles revenue management strategy, rate optimization, channel distribution, OTA rebalancing, direct booking conversion, PMS and CRM architecture, tech stack audits, and automation design. He built Guestally from the ground up after seeing the same guest engagement gap across dozens of boutique properties: hotels spending money to get guests in the door but leaving revenue on the table once they arrived. When Alex walks a property, he is reading your STR comp set data, auditing your channel manager configuration, and mapping every point where revenue leaks out of your operation.",
    image: "/images/Lex.jpeg",
  },
  {
    name: "Della Henry",
    title: "Co-Founder & Director of Guest Experience",
    bio: "Della is a U.S. Army veteran who brings the same leadership discipline from her military career into the guest experience and operations side of BNHG. Her background in behavioral psychology sets her apart from traditional hospitality trainers. She does not teach staff to follow a script. She teaches them to read guests, anticipate needs, and recover service failures before they become one-star reviews. Della leads guest journey mapping, SOP development, front desk and housekeeping service standards, pre-arrival and in-stay touchpoint design, staff training programs, and post-checkout loyalty workflows. She builds the human operating system that sits underneath everything else. Your PMS can track a guest preference, but Della makes sure your team actually acts on it. From turndown service details to the language your front desk uses during check-in, she designs every service moment to feel intentional rather than transactional. Hotels that work with Della do not just get higher review scores. They get repeat guests who book direct.",
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
    name: "AEO Readiness Diagnostic",
    timeline: "2 weeks",
    description:
      "A deep Answer Engine Optimization audit that shows exactly how visible your property is to ChatGPT, Perplexity, Google AI Overviews, and Gemini, and what it will take to be cited by them.",
    deliverables: [
      "Brand and category query testing across 4+ AI engines",
      "Schema.org gap analysis (Hotel, FAQPage, LocalBusiness, Review, Offer)",
      "Content answerability scoring and llms.txt assessment",
      "Competitor AEO benchmark (5 nearby properties)",
      "Prioritized 90-day AEO roadmap with effort estimates",
      "60-minute strategy walkthrough with the founders",
    ],
  },
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
    name: "AEO Implementation",
    timeline: "6–8 weeks",
    description:
      "The full build: we make your property discoverable and citation-worthy in ChatGPT, Perplexity, Google AI Overviews, and Gemini. This is the flagship frontier opportunity for independent hotels and luxury STR operators right now.",
    deliverables: [
      "Full schema.org build-out (Hotel, FAQPage, LocalBusiness, Review, Offer)",
      "llms.txt authoring and answer-formatted content restructuring",
      "FAQ library built for AI extraction across top traveler queries",
      "Citation-earning outreach (editorial, list inclusions, Wikipedia/Wikidata)",
      "AI search monitoring setup so you can track visibility over time",
      "Staff handoff and ongoing maintenance playbook",
    ],
  },
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
    question: "What does a boutique hotel consultant do?",
    answer:
      "A boutique hotel consultant helps independent hotels improve revenue, operations, guest experience, and technology. For properties with 10–50 rooms, that usually means direct booking strategy, OTA channel rebalancing, tech stack optimization, guest messaging, and operational systems. At BNHG, we focus specifically on independent luxury boutique properties and work across commercial, guest experience, and technology pillars rather than revenue management alone.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "How much does boutique hotel consulting cost?",
    answer:
      "Boutique hotel consulting typically ranges from a few thousand dollars for a targeted diagnostic to $5,000–$15,000+ per month for ongoing fractional advisory. BNHG uses a four-tier model: Tier 0 resources are free, Tier 1 diagnostics are scoped engagements, Tier 2 is implementation work, and Tier 3 is ongoing fractional advisory. Pricing depends on scope, property size, and timeline. The cheapest way to start is with a free Tier 0 resource so you can evaluate the quality of our thinking before committing.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "Who is Be Nice Hospitality Group?",
    answer:
      "Be Nice Hospitality Group (BNHG) is a boutique hotel consulting and technology firm for independent luxury hotels with 10–50 rooms. Based in Hapeville, Georgia, BNHG was co-founded by Alex and Della Henry, two military veterans who combine enterprise operations experience with deep hospitality expertise. The firm also builds Guestally, a guest messaging and upsell automation platform for independent hotels.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "What size hotels does BNHG work with?",
    answer:
      "BNHG specializes in independent luxury boutique properties with 10–50 rooms. That includes urban boutiques, destination properties, historic inns, and lifestyle hotels that are owner-operated or managed by a small leadership team. We do not work with large branded hotels or properties below 10 rooms.",
  },
  {
    category: "About BNHG & Consulting Basics",
    question: "How is BNHG different from larger hospitality consulting firms?",
    answer:
      "Large hospitality consulting firms like Xotels or HVS primarily serve branded chains or 100+ room properties and often focus narrowly on revenue management. BNHG is built for independent operators at the 10–50 room range, works across commercial, guest experience, and tech pillars, and offers a free Tier 0 layer so owners can try the thinking before paying. We also build our own software (Guestally), which means we understand the tech side from the inside.",
  },

  // Revenue & Direct Booking
  {
    category: "Revenue & Direct Booking",
    question: "How do I reduce OTA dependency at my independent hotel?",
    answer:
      "Reducing OTA dependency at an independent hotel requires three things working together: a high-converting direct booking website, a parity and rate strategy that rewards direct guests, and retargeting of OTA-acquired guests into direct channels on repeat stays. In practice that means auditing your booking engine, tightening rate parity, launching a best-rate guarantee, improving on-site SEO, and capturing email on every booking. Most boutique hotels we work with move from 60%+ OTA dependency to under 40% within 6–9 months.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "What's a realistic direct booking percentage for a boutique hotel?",
    answer:
      "A healthy direct booking percentage for an independent boutique hotel is 45–60%. Properties that lean heavily on OTAs for discovery often sit at 25–35% direct. Properties with strong brands, repeat guests, and a well-optimized website can push 60–70%. Direct booking as a percentage of total bookings is more important than total volume — every direct booking saves 15–25% in OTA commission.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "How do boutique hotels increase ancillary revenue?",
    answer:
      "Boutique hotels increase ancillary revenue by pre-selling upgrades and experiences before arrival, offering smart in-stay upsells through guest messaging, and packaging local partnerships (restaurants, spas, activities) as add-ons. The highest-ROI moves are pre-arrival upsells (room upgrades, early check-in, late check-out, amenity kits) because guests are already committed. Guestally automates this entire flow so you capture revenue without manual effort from your front desk.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "What's the ROI on a hotel tech audit?",
    answer:
      "Hotel tech audits typically pay for themselves within 30–60 days. Most boutique hotels we audit are overpaying for 2–4 overlapping tools and missing 1–2 critical ones. A well-run audit usually surfaces $500–$3,000 per month in redundant software spend and unlocks new revenue opportunities (upsells, direct booking tooling, guest messaging) that were previously unavailable. The implementation timeline is usually 2–4 weeks.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "How long does it take to see revenue improvements from consulting?",
    answer:
      "Revenue improvements at a boutique hotel show up in three waves. Quick wins (tech consolidation, OTA parity fixes, ancillary upsells) appear within 30–60 days. Direct booking shifts and conversion improvements take 90–120 days. Compounding revenue (brand strength, repeat guests, rate positioning) takes 6–12 months. Most BNHG clients see measurable revenue impact within the first 90 days.",
  },
  {
    category: "Revenue & Direct Booking",
    question: "What's included in a hotel revenue audit?",
    answer:
      "A hotel revenue audit from BNHG covers OTA dependency and channel mix, direct booking conversion, rate parity and positioning, ancillary revenue capture, guest segmentation and acquisition cost, and benchmark comparison against comparable properties. The output is a short written report with specific, prioritized actions — not a generic scorecard. The free Tier 0 Revenue Opportunity Snapshot is a lighter version of this audit.",
  },

  // Hotel Technology
  {
    category: "Hotel Technology",
    question: "What is the best guest messaging software for small hotels?",
    answer:
      "The best guest messaging software for small independent hotels is one that integrates with your PMS, automates pre-arrival and in-stay messaging, captures upsell revenue, and doesn't require a dedicated ops person to run. Guestally was built specifically for independent boutique hotels (10–50 rooms) that want messaging and upsell automation without enterprise complexity. Other options in the market include Canary Technologies, Akia, and Duve, but most are priced and scoped for larger or branded properties.",
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
      "Yes. An independent hotel needs a property management system (PMS) to run reservations and operations, a booking engine to accept direct reservations on your website, and a channel manager to keep rates and inventory in sync across OTAs. Modern platforms like Mews, Cloudbeds, and Little Hotelier bundle these together for small properties. The wrong combination is usually where small hotels bleed money — either through overlapping tools or missing integrations.",
  },
  {
    category: "Hotel Technology",
    question: "How do I know if my hotel tech stack is overbuilt?",
    answer:
      "Your hotel tech stack is probably overbuilt if you pay for more than one tool that does the same job (two booking engines, multiple upsell tools, overlapping CRMs), if you have software nobody on staff uses, or if the total monthly cost exceeds 3–4% of your revenue. Most boutique hotels we audit are overpaying for 2–4 redundant tools. A Tech Stack Quick Scan will surface this in about a week.",
  },
  {
    category: "Hotel Technology",
    question: "What is Guestally and how does it work?",
    answer:
      "Guestally is a guest messaging and upsell automation platform for independent boutique hotels. It connects to your PMS, automates pre-arrival messaging, surfaces personalized upsell offers (upgrades, early check-in, experiences), handles in-stay guest requests, and captures reviews post-stay. It's built specifically for 10–50 room independent properties, not enterprise chains. Guestally is a subsidiary of Be Nice Hospitality Group.",
  },
  {
    category: "Hotel Technology",
    question: "Can small hotels use the same tech as major brands?",
    answer:
      "Not usually. Major brand tech stacks are priced for 100+ room properties and require dedicated operations and IT resources to run. Small independent hotels need simpler, integrated platforms built for owner-operators. The right stack for a 20-room boutique is very different from a 200-room Hilton — and trying to run enterprise tools at that scale usually costs more than the revenue lift.",
  },

  // Working with BNHG
  {
    category: "Working with BNHG",
    question: "What's the difference between Tier 0, 1, 2, and 3 services?",
    answer:
      "Tier 0 is our free layer: 8 research-backed resources (Revenue Opportunity Snapshot, Online Reputation Briefing, Tech Stack Quick Scan, and more) that we deliver with no strings attached. Tier 1 is paid diagnostics — scoped audits of a specific problem area. Tier 2 is implementation — we do the work alongside your team. Tier 3 is ongoing fractional advisory — monthly strategic partnership with one of our principals. Most clients start at Tier 0, move to Tier 1, and decide from there.",
  },
  {
    category: "Working with BNHG",
    question: "How do I start working with BNHG?",
    answer:
      "The fastest way to start with BNHG is to request a free Tier 0 resource — it gives you a research-backed deliverable specific to your property with no commitment. If you prefer to talk first, book a 30-minute discovery call. Both paths are free. We'll never pitch you until we understand your property, your goals, and what kind of partner (if any) you actually need.",
  },
  {
    category: "Working with BNHG",
    question: "Do you work with hotels outside the Southeast U.S.?",
    answer:
      "Yes. BNHG is based in Hapeville, Georgia, but we work with independent boutique hotels across the United States. Most of our engagements are remote-first with occasional on-site visits depending on scope. If you are outside the U.S. and running an independent boutique hotel in the 10–50 room range, reach out — we evaluate engagements case by case.",
  },
  {
    category: "Working with BNHG",
    question: "What happens on a discovery call?",
    answer:
      "A BNHG discovery call is 30 minutes. We ask about your property, your current operations and tech, the 1–2 problems that are top of mind, and where you'd like to be in 12 months. We end the call with a specific recommendation — either a free Tier 0 resource, a paid engagement, or a referral if we're not the right fit. No slide decks, no pressure, no generic playbook.",
  },
  {
    category: "Working with BNHG",
    question: "What free resources does BNHG offer?",
    answer:
      "BNHG offers 8 free Tier 0 resources for boutique hotel operators: the Revenue Opportunity Snapshot, Online Reputation Briefing, Competitive Position Map, Guest Persona Highlights, Tech Stack Quick Scan, Guestally ROI Estimate, Visibility & Discoverability Audit, and Quick Win Action List. Each is custom to your property, research-backed, and completely free. Start with whichever one maps to your biggest question right now.",
  },
];
