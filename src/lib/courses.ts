export type CourseStatus = "live" | "waitlist";

export type CourseAssetClass = "property" | "auto" | "both";

export interface CourseModule {
  number: string;
  title: string;
  body: string;
  lessons: string[];
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface CourseTestimonial {
  quote: string;
  author: string;
  context: string;
}

export interface Course {
  slug: string;
  name: string;
  edition: string;
  shortName: string;
  price: number;
  status: CourseStatus;
  /** Property, Auto, or both. Drives audience-specific copy. */
  assetClass: CourseAssetClass;
  /** One-line tagline used on cards and metadata. */
  tagline: string;
  /** Two or three sentences. The pitch. */
  description: string;
  /** Who this course is built for. */
  forWhom: string;
  /** Estimated time to complete the curriculum. */
  duration: string;
  /** Top-level outcomes the buyer should expect. */
  outcomes: string[];
  /** Detailed modules with lesson breakdowns. */
  modules: CourseModule[];
  /** What ships with the course beyond the videos. */
  includes: string[];
  /** Bonuses included with the course. */
  bonuses: string[];
  /** Course-specific objections answered. */
  faq: CourseFAQ[];
  /** Optional testimonials specific to this course. */
  testimonials?: CourseTestimonial[];
}

const SHARED_FAQ: CourseFAQ[] = [
  {
    question: "Do I get lifetime access?",
    answer:
      "Yes. Once you purchase, you keep access for as long as the course exists. We update modules as the operating economy shifts; you get every update at no additional cost.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Yes. Thirty-day money-back guarantee on every course. If the curriculum is not pulling its weight in your operation by day thirty, email us and we refund the purchase. No survey, no friction.",
  },
  {
    question: "Does the Nice Host Network actually meet twice a week?",
    answer:
      "Tuesday workshop and Thursday implementation hour, every week, forty-seven weeks a year. We take one week off per quarter and two weeks at year-end. Replays are available; the live attendance is where the work happens.",
  },
];

export const COURSES: Course[] = [
  {
    slug: "direct-booking-playbook",
    name: "The Direct Booking Playbook",
    edition: "Tripwire",
    shortName: "Direct Booking Playbook",
    price: 97,
    status: "waitlist",
    assetClass: "both",
    tagline: "Stop renting your customer relationship from Airbnb.",
    description:
      "A focused, no-filler playbook on building direct bookings into your operation. Aimed at operators with one to seven units who want a system, not a hack.",
    forWhom:
      "Co-living, short-term rental, and fleet operators on OTA-heavy distribution who want to start owning a meaningful share of their bookings.",
    duration: "About two hours of video, plus the templates",
    outcomes: [
      "A direct booking site that converts on the basics",
      "An email capture and follow-up sequence that runs without you",
      "A repeat-guest framework that earns the second stay",
    ],
    modules: [
      {
        number: "01",
        title: "Why Direct Booking Actually Matters in 2026",
        body: "The math has shifted. The case for direct is no longer about saving commission. It is about owning the customer relationship in an AI-mediated discovery world.",
        lessons: [
          "The 2026 shift in AI search and what it means for OTA dependence",
          "How direct booking compounds across stays one, two, and three",
          "What 'owning the guest' actually looks like in revenue terms",
        ],
      },
      {
        number: "02",
        title: "The Minimum Viable Direct Booking Stack",
        body: "Most operators overbuild this. We strip it to the four pieces that actually matter and show you what to skip.",
        lessons: [
          "Domain, hosting, and the booking engine that does not get in the way",
          "Email capture that does not feel like a 2014 popup",
          "Payment processing without a fifth tab in your tech stack",
          "The one analytics signal worth tracking on day one",
        ],
      },
      {
        number: "03",
        title: "Pricing Parity Without Losing Margin",
        body: "Direct should not mean cheaper. We show you how to price direct bookings to win on perceived value, not on a discount race.",
        lessons: [
          "The parity rule that keeps you compliant and competitive",
          "Direct-only perks that cost you nothing and convert like crazy",
          "What to do when the OTA undercuts you anyway",
        ],
      },
      {
        number: "04",
        title: "Email Automation and the Repeat-Guest Sequence",
        body: "The asset most operators ignore. Your past guests are already qualified. We hand you the sequence that brings them back.",
        lessons: [
          "Pre-arrival, in-stay, and post-checkout flows",
          "The ninety-day repeat-guest sequence we run on our own portfolio",
          "How to segment without overbuilding tools you do not need",
        ],
      },
    ],
    includes: [
      "Direct booking site checklist (PDF)",
      "Email automation templates",
      "Repeat-guest sequence script",
      "Lifetime access to course updates",
    ],
    bonuses: [
      "Direct Booking Audit template (Notion)",
      "Live Q&A with Della and Alex one week after launch",
    ],
    faq: SHARED_FAQ,
  },
  {
    slug: "foundation-property",
    name: "Foundation: Co-living Edition",
    edition: "Foundation",
    shortName: "Foundation Co-living",
    price: 497,
    status: "waitlist",
    assetClass: "property",
    tagline: "The operating system every co-living operator should already have.",
    description:
      "The foundation course for co-living operators renting rooms by the door, plus the short-term and long-term rental portfolios that mix in. Same shared core as the Auto edition, with co-living and rental case studies, vendors, and SOPs.",
    forWhom:
      "Co-living and rental operators with one to seven units who feel the operation outgrowing their attention.",
    duration: "Roughly eight hours of video plus the asset library",
    outcomes: [
      "A documented SOP library you can hand to a part-time ops assistant",
      "A pricing strategy you can defend, not just react with",
      "An automation stack that reduces guest-message volume by half",
    ],
    modules: [
      {
        number: "01",
        title: "Operate Like a Business: Orgs, Owners, and Roles",
        body: "Most operators run the business in their head. Module one gets it on paper so the next person you hire can step in.",
        lessons: [
          "The operator-to-owner role split (and why most people get it wrong)",
          "Entity structure for one to seven units",
          "Insurance, taxes, and the boring stuff that protects your downside",
        ],
      },
      {
        number: "02",
        title: "The SOP Library and How to Maintain It",
        body: "Real SOPs, not Google Doc graveyards. A library that gets used because it is built around the work, not around documentation theater.",
        lessons: [
          "The fifteen SOPs every co-living operator needs",
          "Cleaner, handyman, and vendor onboarding scripts",
          "The quarterly review that keeps the library alive",
        ],
      },
      {
        number: "03",
        title: "Automate With Intelligence: The AI Integration Playbook",
        body: "What to automate, what to leave to a human, and how to integrate AI without making the guest experience feel hollow.",
        lessons: [
          "Messaging automation that sounds like you wrote it",
          "Pricing automation that respects your margin",
          "The handful of operations workflows worth automating today",
        ],
      },
      {
        number: "04",
        title: "Own Your Guests: Direct Booking and the Return Guest Framework",
        body: "Same logic as the Direct Booking Playbook, expanded. Plus the return-guest layer that turns OTA traffic into a repeat customer base.",
        lessons: [
          "The direct booking site upgrade beyond the tripwire version",
          "The return guest framework, end to end",
          "Loyalty without a points program",
        ],
      },
      {
        number: "05",
        title: "Hiring and Managing Your First Part-Time Ops Person",
        body: "The single hire that gets most operators back their weekends. We show you how to find, hire, train, and keep them.",
        lessons: [
          "The job description that filters correctly on day one",
          "Onboarding week in three documents",
          "The first ninety days, with weekly check-in scripts",
        ],
      },
    ],
    includes: [
      "The SOP starter kit (15+ documents)",
      "Hiring scripts for cleaners, ops assistants, and VAs",
      "Pricing rule sets per market type",
      "Lifetime Nice Host Network access",
      "Lifetime course updates",
    ],
    bonuses: [
      "Quarterly live cohort calls with Della",
      "Guestally Starter discount for ninety days post-purchase",
      "Operator Dashboard template (Notion + Google Sheets)",
    ],
    faq: SHARED_FAQ,
  },
  {
    slug: "foundation-auto",
    name: "Foundation: Auto Edition",
    edition: "Foundation",
    shortName: "Foundation Auto",
    price: 497,
    status: "waitlist",
    assetClass: "auto",
    tagline: "Run your fleet like a business, not a side project.",
    description:
      "The foundation course for Turo hosts and small fleet operators. Same shared core as the Co-living edition, with fleet-specific vendors, turnover protocols, and fleet hiring.",
    forWhom:
      "Fleet operators with two to ten vehicles who can see the next bottleneck coming and want a real playbook.",
    duration: "Roughly eight hours of video plus the asset library",
    outcomes: [
      "A turnover protocol that survives a part-time fleet handler",
      "A pricing approach built around utilization, not gut feel",
      "A maintenance and damage workflow that does not eat your weekends",
    ],
    modules: [
      {
        number: "01",
        title: "Operate Like a Business: Structure, Ownership, Insurance",
        body: "The fleet equivalent of getting your house in order. Entity, insurance, and the legal posture that protects you when something goes sideways at midnight.",
        lessons: [
          "LLC structure for fleet operators",
          "Commercial vs. personal insurance, and what most people miss",
          "The contracts and waivers your platform does not provide",
        ],
      },
      {
        number: "02",
        title: "The Turnover Protocol: Detailing, Fueling, Inspection, Handoff",
        body: "Twenty minutes of structured turnover beats forty minutes of vibes every time. We hand you the protocol.",
        lessons: [
          "Detailing standards that hold up at scale",
          "Fueling and recharging protocols",
          "Inspection forms and damage documentation",
          "Handoff scripts for vehicle ride-along",
        ],
      },
      {
        number: "03",
        title: "Automate With Intelligence: Messaging, Reminders, the AI Copilot",
        body: "Most fleet operators are still manually texting renters. We show you the lightweight automation layer that recovers ten hours a week.",
        lessons: [
          "Pre-trip and in-trip messaging flows",
          "Reminder automation for fueling, returns, and damage reporting",
          "The AI copilot that handles the easy 70 percent of renter questions",
        ],
      },
      {
        number: "04",
        title: "Pricing for Utilization, Not Occupancy",
        body: "Fleet pricing is not property pricing. The mental model is utilization-first. We rebuild it from scratch.",
        lessons: [
          "Why dynamic pricing tools are not enough",
          "The utilization curve and where margin actually lives",
          "Seasonal and event-based pricing for fleet operators",
        ],
      },
      {
        number: "05",
        title: "Hiring and Training Your First Fleet Handler",
        body: "The first hire that scales you past five vehicles without breaking yourself. We walk you through it.",
        lessons: [
          "Where to source reliable fleet handlers",
          "The training week, day by day",
          "Pay structure that aligns incentives",
        ],
      },
    ],
    includes: [
      "Turnover SOP and inspection checklist",
      "Maintenance log template and vendor scripts",
      "Damage-incident playbook",
      "Lifetime Nice Host Network access",
      "Lifetime course updates",
    ],
    bonuses: [
      "Quarterly live cohort calls with Alex",
      "Fleet handler hiring scorecard",
      "Sample operator agreement (reviewed by counsel, redline-friendly)",
    ],
    faq: SHARED_FAQ,
  },
  {
    slug: "flagship-property",
    name: "Flagship: Host to Operator, Co-living Edition",
    edition: "Flagship",
    shortName: "Flagship Co-living",
    price: 799,
    status: "waitlist",
    assetClass: "property",
    tagline: "Stop being the bottleneck. Build the team and the system.",
    description:
      "The flagship course for co-living operators ready to scale. Foundation is about getting the operation out of your head. Flagship is about building a team that runs it without you.",
    forWhom:
      "Co-living operators at five to twenty units who feel the ceiling and need to professionalize fast.",
    duration: "Twelve to fifteen hours of video plus the team-building track",
    outcomes: [
      "A clear operator-to-CEO transition plan",
      "A hired and trained part-time ops team",
      "A reporting cadence you trust",
    ],
    modules: [
      {
        number: "01",
        title: "From Host to Operator: The Role Shift in Detail",
        body: "What changes between unit five and unit twenty. The role you actually need to occupy as the business grows past your personal capacity.",
        lessons: [
          "The four hats most operators wear, and which to drop first",
          "Owner versus operator versus CEO mindset",
          "The 30-day calendar audit that reveals your real bottleneck",
        ],
      },
      {
        number: "02",
        title: "The Team You Actually Need at Five, Ten, and Twenty Doors",
        body: "Most operators hire too late and the wrong roles first. We map the team architecture by door count.",
        lessons: [
          "The five-door team configuration",
          "The ten-door inflection (where most operators stall)",
          "Twenty-door operations: roles, reporting, and scope",
        ],
      },
      {
        number: "03",
        title: "Hiring, Onboarding, and Accountability Frameworks",
        body: "Job descriptions, scorecards, ninety-day plans. The hiring system that produces operators, not just employees.",
        lessons: [
          "The role scorecard methodology",
          "Onboarding week and first ninety days",
          "Quarterly performance review that does not feel corporate",
        ],
      },
      {
        number: "04",
        title: "Financial Reporting and the Operator's Dashboard",
        body: "Most operators run blind. We hand you the dashboard we use ourselves and walk through every metric.",
        lessons: [
          "The eight metrics that matter and the dozens that do not",
          "Weekly, monthly, and quarterly reporting cadence",
          "Cash flow forecasting for distributed operations",
        ],
      },
      {
        number: "05",
        title: "Scaling Automation Without Gutting the Guest Experience",
        body: "How to automate at fifteen units without the property feeling like a self-serve kiosk.",
        lessons: [
          "What to automate, what to leave human, and the tests we use",
          "The 'human moment' framework",
          "AI that helps your team, not replaces it",
        ],
      },
    ],
    includes: [
      "Everything in Foundation: Co-living",
      "The team-building track and hiring scorecards",
      "Operator dashboard template (Google Sheets and Notion)",
      "Lifetime Nice Host Network access",
      "Lifetime course updates",
    ],
    bonuses: [
      "Two private strategy sessions with Della (90 minutes each)",
      "Custom hiring kit for your specific portfolio",
      "Priority access to advisory waitlist",
    ],
    faq: SHARED_FAQ,
  },
  {
    slug: "flagship-auto",
    name: "Flagship: Host to Operator, Auto Edition",
    edition: "Flagship",
    shortName: "Flagship Auto",
    price: 799,
    status: "waitlist",
    assetClass: "auto",
    tagline: "Five vehicles is a hobby. Build the business that scales past it.",
    description:
      "The flagship course for fleet operators ready to grow past the small-fleet ceiling. Same Host-to-Operator backbone as the Co-living edition, taught for fleet realities.",
    forWhom:
      "Fleet operators at five to twenty vehicles who want to grow toward fifty without breaking themselves.",
    duration: "Twelve to fifteen hours of video plus the fleet-ops track",
    outcomes: [
      "A documented fleet-ops playbook another operator could run",
      "A trained, accountable handler team",
      "A weekly reporting rhythm that protects your margin",
    ],
    modules: [
      {
        number: "01",
        title: "From Host to Operator: The Fleet Operator's Mindset Shift",
        body: "Why the move from five to fifty vehicles is not a bigger version of the same thing. It is a different business that needs different thinking.",
        lessons: [
          "The hidden complexity at fifteen vehicles that breaks most operators",
          "Owner versus operator versus fleet manager",
          "The 30-day calendar audit, fleet-flavored",
        ],
      },
      {
        number: "02",
        title: "The Team You Need at Five, Fifteen, and Forty Vehicles",
        body: "Fleet handlers, detailers, dispatchers, fleet managers. We map the team architecture by vehicle count.",
        lessons: [
          "The five-vehicle handler model",
          "The fifteen-vehicle inflection point",
          "Forty-vehicle operations: dispatch, supervision, and scope",
        ],
      },
      {
        number: "03",
        title: "Hiring Fleet Handlers, Detailers, and a Fleet Manager",
        body: "The hiring sequence that produces fleet operators, not gig workers.",
        lessons: [
          "Sourcing channels that actually work",
          "The handler onboarding week",
          "Fleet manager hiring (the role that doubles your ceiling)",
        ],
      },
      {
        number: "04",
        title: "Financial Reporting and the Fleet Operator's Dashboard",
        body: "What to track, what to ignore, and how to read the dashboard before the dashboard reads you.",
        lessons: [
          "Per-vehicle profitability tracking",
          "Maintenance reserves and the depreciation model",
          "Weekly cash flow forecasting for fleet",
        ],
      },
      {
        number: "05",
        title: "Insurance, Claims, and the Legal Posture",
        body: "Fleet operators get sued. Fleet operators have crashes. Module five gives you the posture that protects the business.",
        lessons: [
          "Commercial fleet insurance, what to actually buy",
          "Claims handling and documentation discipline",
          "When to lawyer up and when to handle it in-house",
        ],
      },
    ],
    includes: [
      "Everything in Foundation: Auto",
      "Fleet-ops playbook and handler scorecards",
      "Operator dashboard template (Google Sheets and Notion)",
      "Lifetime Nice Host Network access",
      "Lifetime course updates",
    ],
    bonuses: [
      "Two private strategy sessions with Alex (90 minutes each)",
      "Custom hiring kit for your fleet size and market",
      "Priority access to advisory waitlist",
    ],
    faq: SHARED_FAQ,
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getLiveCourses(): Course[] {
  return COURSES.filter((c) => c.status === "live");
}
