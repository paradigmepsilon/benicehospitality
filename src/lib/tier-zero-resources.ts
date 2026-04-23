export type Pillar = "Commercial" | "Guest Experience" | "Tech";

export interface TierZeroResource {
  slug: string;
  name: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  heroHeadline: string;
  heroSubhead: string;
  pillar: Pillar;
  whatYouGet: string[];
  whoItsFor: string[];
  howItWorks: { step: string; description: string }[];
  faq: { question: string; answer: string }[];
  featuredCallout?: {
    label: string;
    title: string;
    body: string;
    ctaText?: string;
    ctaHref?: string;
  };
}

export const TIER_ZERO_RESOURCES: TierZeroResource[] = [
  {
    slug: "revenue-opportunity-snapshot",
    name: "Revenue Opportunity Snapshot",
    shortDescription:
      "A property-specific look at where your top revenue opportunities are hiding right now.",
    metaTitle:
      "Free Hotel Revenue Audit — Revenue Opportunity Snapshot | BNHG",
    metaDescription:
      "Free boutique hotel revenue audit. We identify OTA leakage, rate parity gaps, and ancillary revenue opportunities specific to your property. No strings attached.",
    targetKeywords: [
      "free hotel revenue audit",
      "boutique hotel revenue analysis",
      "hotel OTA commission leakage",
      "direct booking shift",
    ],
    heroHeadline: "See Exactly Where Your Revenue Is Hiding",
    heroSubhead:
      "A free, research-backed snapshot of the top revenue opportunities at your independent boutique hotel. Built specifically for 10–50 room properties.",
    pillar: "Commercial",
    whatYouGet: [
      "OTA commission leakage estimate based on your channel mix",
      "Direct booking shift opportunity with projected dollar impact",
      "Rate parity and positioning audit across your top channels",
      "Ancillary revenue gaps (upsells, packages, add-ons) ranked by size",
      "A prioritized 90-day action list with expected ROI",
    ],
    whoItsFor: [
      "Owner-operators who feel like OTAs take too much of every booking",
      "GMs who suspect rate parity is off but can't prove it",
      "Properties in the 10–50 room range that want a second opinion",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "You send us your hotel website. That's it — no spreadsheets, no intake call.",
      },
      {
        step: "We research",
        description:
          "We pull OTA data, rate data, review data, and competitor signals. Takes us 3–5 business days.",
      },
      {
        step: "You get the snapshot",
        description:
          "A short written report with specific numbers and a prioritized action list. Yours to keep, no pitch attached.",
      },
    ],
    faq: [
      {
        question: "Is the Revenue Opportunity Snapshot really free?",
        answer:
          "Yes. It's a Tier 0 resource — we deliver it to you with no charge and no obligation. We built this layer because most boutique hotels have never seen a real revenue audit and we want to earn your attention before asking for anything.",
      },
      {
        question: "What information do I need to provide?",
        answer:
          "Just your hotel website URL. We do all the research from public data (OTAs, reviews, rate shopping, competitor listings). If you want us to go deeper, we can request specific PMS or booking engine data — but the baseline snapshot doesn't require it.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 3–5 business days from the time you request it to delivery.",
      },
      {
        question: "Do I have to get on a sales call after?",
        answer:
          "No. The snapshot is yours. If you want to talk, we're happy to. If you don't, the report is still useful and you can act on it yourself.",
      },
    ],
  },
  {
    slug: "online-reputation-briefing",
    name: "Online Reputation Briefing",
    shortDescription:
      "An analysis of your review footprint across platforms and where perception gaps are costing you bookings.",
    metaTitle:
      "Free Hotel Review & Reputation Audit | Online Reputation Briefing | BNHG",
    metaDescription:
      "Free boutique hotel reputation audit. We analyze 40–60 reviews across Google, TripAdvisor, and Booking.com to surface perception gaps costing you direct bookings.",
    targetKeywords: [
      "hotel reputation audit free",
      "hotel review analysis",
      "guest sentiment analysis",
      "boutique hotel reviews",
    ],
    heroHeadline: "What Your Reviews Are Actually Saying",
    heroSubhead:
      "A free reputation briefing for independent boutique hotels. We read your reviews across every platform and tell you what's costing you bookings.",
    pillar: "Guest Experience",
    whatYouGet: [
      "Sentiment analysis across Google, TripAdvisor, and Booking.com (40–60 reviews)",
      "Recurring praise and complaint themes ranked by frequency",
      "Sentiment gap between your star rating and your service reality",
      "Anonymized review quotes as evidence for each finding",
      "A short list of fixable friction points you can address this month",
    ],
    whoItsFor: [
      "Hotels with mixed or declining review trends",
      "GMs who suspect guests complain about things they can't see",
      "Owners considering a brand refresh or positioning change",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "Send us your hotel website. We find your review footprint on our own.",
      },
      {
        step: "We read everything",
        description:
          "We analyze 40–60 recent reviews across Google, TripAdvisor, and Booking.com.",
      },
      {
        step: "You get the briefing",
        description:
          "A written report with sentiment patterns, anonymized quotes, and a fix list.",
      },
    ],
    faq: [
      {
        question: "How many reviews do you actually read?",
        answer:
          "Typically 40–60, weighted toward the most recent 12 months. We'd rather go deep on recent reviews than summarize 500 old ones.",
      },
      {
        question: "Will you share the raw review data?",
        answer:
          "We quote anonymized snippets as evidence in the report. The full reviews are public, so you already have access to them — we just synthesize the patterns.",
      },
      {
        question: "Can you do this for a specific competitor?",
        answer:
          "That's part of our Competitive Position Map resource. The Reputation Briefing focuses on your property.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 3–5 business days.",
      },
    ],
  },
  {
    slug: "competitive-position-map",
    name: "Competitive Position Map",
    shortDescription:
      "How you stack up against your top three competitors on price, positioning, and perceived value.",
    metaTitle:
      "Free Hotel Competitive Analysis | Competitive Position Map | BNHG",
    metaDescription:
      "Free boutique hotel competitive analysis. We map 5 nearby competitors on a price-vs-review quadrant and show you where you're getting undercut or missing opportunity.",
    targetKeywords: [
      "hotel competitive analysis",
      "boutique hotel comp set",
      "hotel pricing comparison",
      "competitive position map",
    ],
    heroHeadline: "Know Exactly Where You Sit in Your Local Market",
    heroSubhead:
      "A free competitive position map for independent boutique hotels. We research 5 nearby competitors and plot you on a price-vs-review quadrant.",
    pillar: "Commercial",
    whatYouGet: [
      "5 nearby competitor profiles with pricing and positioning",
      "Price-vs-review quadrant chart showing where you sit",
      "Specific properties that are undercutting you or outperforming on reviews",
      "Positioning gaps you can own (amenity, experience, price point)",
      "A short list of tactical moves for the next 60 days",
    ],
    whoItsFor: [
      "Hotels uncertain about their pricing relative to competitors",
      "Properties adjusting to a new nearby competitor",
      "Owners considering a repositioning or rebrand",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "Send us your website. We identify your 5 closest competitors on our own.",
      },
      {
        step: "We research",
        description:
          "We pull pricing, review scores, amenities, and positioning for each competitor.",
      },
      {
        step: "You get the map",
        description:
          "A written report with the quadrant chart, competitor profiles, and tactical moves.",
      },
    ],
    faq: [
      {
        question: "How do you pick the competitors?",
        answer:
          "We pick the 5 properties most similar to yours in location, room count, and positioning. You can override our picks if you have a specific comp set in mind.",
      },
      {
        question: "How current is the pricing data?",
        answer:
          "We pull live rates the week we build the report. Hotel rates move constantly, so treat the snapshot as a point-in-time comparison.",
      },
      {
        question: "Can you include a competitor in a different market?",
        answer:
          "Yes — tell us which one. Typically people want one aspirational comp outside their local market.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 5–7 business days.",
      },
    ],
  },
  {
    slug: "guest-persona-highlights",
    name: "Guest Persona Highlights",
    shortDescription:
      "A sketch of who's actually booking boutique hotels in your market and what they're looking for.",
    metaTitle:
      "Free Hotel Guest Persona Analysis | Guest Persona Highlights | BNHG",
    metaDescription:
      "Free boutique hotel guest persona analysis. We identify 4–5 distinct personas actually booking your property and compare them to who your website markets to.",
    targetKeywords: [
      "hotel guest personas",
      "boutique hotel target market",
      "hotel guest segmentation",
      "hotel marketing mismatch",
    ],
    heroHeadline: "Who's Actually Staying at Your Hotel",
    heroSubhead:
      "A free persona analysis for independent boutique hotels. We identify who's really booking and whether your marketing matches the guest you actually attract.",
    pillar: "Guest Experience",
    whatYouGet: [
      "4–5 distinct guest personas derived from reviews, bookings, and market data",
      "Profile for each: trip purpose, travel party, budget, motivations",
      "Identity mismatch analysis (website tone vs real guest mix)",
      "Messaging recommendations for each persona",
      "A short list of marketing tweaks that would better match reality",
    ],
    whoItsFor: [
      "Hotels with vague or generic marketing",
      "Properties considering a brand refresh",
      "Operators who suspect their marketing attracts the wrong guest",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description: "Send us your hotel website.",
      },
      {
        step: "We analyze",
        description:
          "We pull review patterns, OTA listings, and public booking signals to build personas.",
      },
      {
        step: "You get the report",
        description:
          "A written report with persona profiles and messaging recommendations.",
      },
    ],
    faq: [
      {
        question: "Where does the persona data come from?",
        answer:
          "From public review patterns, OTA listing data, your website's own messaging, and market benchmarks. If you give us PMS data, we can go deeper — but the baseline version works without it.",
      },
      {
        question: "How accurate are the personas?",
        answer:
          "They're directional, not statistical. The goal is to surface patterns you may not see, not to replace a full market research study.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 3–5 business days.",
      },
      {
        question: "What if I don't have reviews yet?",
        answer:
          "We can still build personas from market and positioning data, but the report is more useful once you have 20+ reviews.",
      },
    ],
  },
  {
    slug: "tech-stack-quick-scan",
    name: "Tech Stack Quick Scan",
    shortDescription:
      "A surface-level review of your current technology tools: what's redundant, what's missing, and what to prioritize.",
    metaTitle:
      "Free Hotel Tech Audit | Tech Stack Quick Scan | BNHG",
    metaDescription:
      "Free boutique hotel tech audit. We evaluate your website, booking engine, mobile, OTA listings, guest messaging, and social — assign letter grades, and flag guest-facing friction.",
    targetKeywords: [
      "free hotel tech audit",
      "hotel tech stack review",
      "boutique hotel booking engine audit",
      "hotel website assessment",
    ],
    heroHeadline: "Where Your Hotel Tech Is Failing Guests",
    heroSubhead:
      "A free tech stack scan for independent boutique hotels. We grade 6 guest-facing categories and flag the friction points costing you bookings.",
    pillar: "Tech",
    whatYouGet: [
      "Letter grades (A–F) across website, booking engine, mobile, OTAs, guest messaging, social",
      "Count of guest-facing friction points with specific examples",
      "List of redundant tools you're likely overpaying for",
      "Critical gaps ranked by revenue impact",
      "A prioritized 90-day tech roadmap",
    ],
    whoItsFor: [
      "Hotels with clunky websites or broken booking flows",
      "Owners who suspect they're overpaying for software",
      "Properties that have accumulated tools over years without auditing",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "Send us your website. We identify your booking engine, CMS, and public tools automatically.",
      },
      {
        step: "We test it",
        description:
          "We go through the full booking flow on desktop and mobile, and check your OTA and social presence.",
      },
      {
        step: "You get the scan",
        description:
          "A written report with letter grades, screenshots of friction, and a 90-day roadmap.",
      },
    ],
    faq: [
      {
        question: "Do I need to share my PMS login?",
        answer:
          "No. The Quick Scan is guest-facing only — what a real guest would experience. A deeper Tier 1 tech audit covers back-of-house systems.",
      },
      {
        question: "Will you pitch me on Guestally?",
        answer:
          "If Guestally fits, we'll mention it. But the scan is honest — if your current guest messaging tool is working, we'll say so.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 3–5 business days.",
      },
      {
        question: "What if my grades are bad?",
        answer:
          "They're a starting point, not a judgment. Most boutique hotels score in the C range on their first scan. The value is in the 90-day roadmap.",
      },
    ],
  },
  {
    slug: "guestally-roi-estimate",
    name: "Guestally ROI Estimate",
    shortDescription:
      "A projection of the incremental revenue and time savings Guestally would generate at your property.",
    metaTitle:
      "Free Guestally ROI Estimate | Hotel Upsell Automation ROI | BNHG",
    metaDescription:
      "Free personalized Guestally ROI estimate. Based on your room count, ADR, and occupancy — we project monthly upsell revenue and staff hours saved. Payback timeline included.",
    targetKeywords: [
      "Guestally ROI",
      "hotel upsell automation ROI",
      "hotel guest messaging ROI",
      "boutique hotel upsell revenue",
    ],
    heroHeadline: "See Exactly What Guestally Would Earn You",
    heroSubhead:
      "A free, personalized ROI projection. Your estimated monthly upsell revenue and staff hours saved if you implemented Guestally.",
    pillar: "Tech",
    whatYouGet: [
      "Per-stay upsell economics for your property",
      "Projected monthly incremental revenue",
      "Staff hours saved per month from messaging automation",
      "Payback timeline and tier recommendation",
      "Honest note on whether Guestally is the right fit",
    ],
    whoItsFor: [
      "Hotels with no guest messaging or upsell automation",
      "Properties spending staff time on manual pre-arrival outreach",
      "Owners evaluating whether messaging software is worth it",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "We estimate room count, ADR, and occupancy from public data.",
      },
      {
        step: "We calculate",
        description:
          "We run per-stay and monthly projections based on Guestally benchmark data.",
      },
      {
        step: "You get the estimate",
        description:
          "A written report with monthly projections, payback timeline, and a fit assessment.",
      },
    ],
    faq: [
      {
        question: "How accurate is the estimate?",
        answer:
          "It's a directional projection based on benchmark conversion rates across similar boutique hotels. Real results vary with your guest mix and how well Guestally is configured, but the estimate is within a reasonable range.",
      },
      {
        question: "What if Guestally isn't a fit?",
        answer:
          "We'll tell you. The report includes an honest fit assessment — we'd rather tell you no than sell you software you don't need.",
      },
      {
        question: "Is this a sales pitch in disguise?",
        answer:
          "Not really. It's a numbers exercise. Whether you pursue Guestally after is up to you.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 3–5 business days.",
      },
    ],
  },
  {
    slug: "visibility-discoverability-audit",
    name: "Visibility & Discoverability Audit",
    shortDescription:
      "How easily can travelers find your property — including in ChatGPT, Perplexity, and Google AI Overviews? Full channel + AEO audit with a 0–120 score.",
    metaTitle:
      "Free Hotel Visibility & AEO Audit | BNHG",
    metaDescription:
      "Free visibility + AEO audit for boutique hotels and luxury short-term rentals. 0–120 score across 7 categories including AI search & answer engines (ChatGPT, Perplexity, Google AI Overviews). Channel presence grid and quick wins included.",
    targetKeywords: [
      "hotel visibility audit",
      "hotel discoverability",
      "hotel online presence",
      "hotel distribution gap analysis",
      "hotel AEO",
      "hotel AI search visibility",
      "ChatGPT hotel visibility",
      "answer engine optimization hotels",
    ],
    heroHeadline: "Can Travelers (and AI) Actually Find You?",
    heroSubhead:
      "A free visibility audit for independent boutique hotels and luxury short-term rental operators. We check every channel a traveler might look, including ChatGPT, Perplexity, and Google AI Overviews, and score your discoverability out of 120.",
    pillar: "Commercial",
    featuredCallout: {
      label: "NEW: AEO Module",
      title: "Now with Answer Engine Optimization",
      body: "Travelers increasingly ask ChatGPT, Perplexity, and Google AI Overviews for hotel recommendations. Most boutique properties are completely invisible in those answers. We now audit AI search visibility as a featured 7th category worth 20 points — the biggest single opportunity on the page.",
      ctaText: "See the dedicated AEO page",
      ctaHref: "/resources/aeo-optimization",
    },
    whatYouGet: [
      "0–120 visibility score across 7 channel categories, including AI Search & Answer Engines (AEO)",
      "Channel presence grid: OTAs, metasearch, Google, social, maps, email, blog, PR, and AI engines (ChatGPT, Perplexity, AI Overviews)",
      "AEO subscore with specific gaps in schema, llms.txt, and AI-answerable content",
      "List of channels you're missing from completely, AI engines included",
      "Quick wins that would move your score the most",
      "A short prioritized 30-day action list",
    ],
    whoItsFor: [
      "Hotels and luxury STR operators with low organic bookings",
      "Properties new to the market, repositioning, or invisible to AI search",
      "Operators who suspect they're invisible on key channels or in AI answers",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "Send us your website. We search everywhere a traveler might look, from Booking.com to ChatGPT.",
      },
      {
        step: "We grade every channel",
        description:
          "We check your presence across OTAs, Google, metasearch, social, maps, email, blog, PR, and AI search engines (ChatGPT, Perplexity, Google AI Overviews, Gemini) plus your schema and llms.txt.",
      },
      {
        step: "You get the audit",
        description:
          "A written report with your 120-pt score, channel grid, AEO subscore, and quick-win action list.",
      },
    ],
    faq: [
      {
        question: "What's a good visibility score?",
        answer:
          "Most independent boutique hotels and luxury STR operators score 55–75 out of 120 on their first audit. A score above 95 usually correlates with strong organic demand. AEO scores are typically very low (0–6 out of 20) on first audit, which is exactly the opportunity.",
      },
      {
        question: "Is this the same as an SEO audit?",
        answer:
          "No. SEO is one sub-category. This is a broader discoverability view across seven categories including AI Search & Answer Engines (AEO). AEO is distinct from SEO: SEO is about ranking in search results; AEO is about being cited in AI-generated answers.",
      },
      {
        question: "What is AEO and why does it matter for hotels?",
        answer:
          "AEO (Answer Engine Optimization) is the practice of making your property visible in AI-generated answers on ChatGPT, Perplexity, Google AI Overviews, and Gemini. Travelers increasingly use these tools to ask for hotel recommendations. If your property isn't named, linked, or described, you're invisible to a fast-growing share of booking intent. AEO is the newest and highest-leverage part of this audit.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 3–5 business days.",
      },
      {
        question: "Can you help me fix the gaps?",
        answer:
          "Yes. Our Tier 1 AEO Readiness Diagnostic goes deeper, and Tier 2 AEO Implementation builds out the schema, llms.txt, FAQ library, and answer-formatted content you need to actually show up in AI answers.",
      },
    ],
  },
  {
    slug: "quick-win-action-list",
    name: "Quick Win Action List",
    shortDescription:
      "Five to ten specific, implementable actions you could take this month to improve performance.",
    metaTitle:
      "Free Hotel Quick Win Action List | Boutique Hotel Improvements | BNHG",
    metaDescription:
      "Free quick win action list for boutique hotels. 5 high-impact actions with estimated revenue impact across OTA, reviews, tech, guest communication, and visibility.",
    targetKeywords: [
      "hotel quick wins",
      "hotel improvement checklist",
      "boutique hotel action list",
      "hotel low-hanging fruit",
    ],
    heroHeadline: "Five Things You Could Do This Month",
    heroSubhead:
      "A free, cross-pillar action list for independent boutique hotels. Five high-impact wins with estimated revenue impact and a total annual gap estimate.",
    pillar: "Commercial",
    whatYouGet: [
      "5 specific, implementable actions ranked by revenue impact",
      "Estimated dollar impact per action",
      "Total annual revenue gap estimate across all 5",
      "Effort level (low/medium/high) for each action",
      "Recommended sequence and 30-day plan",
    ],
    whoItsFor: [
      "Hotels that want a broad, practical starting point",
      "Operators who can't decide which problem to tackle first",
      "Properties looking for low-effort, high-impact wins",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "We research OTAs, reviews, competitors, tech, guest comms, social, and visibility.",
      },
      {
        step: "We synthesize",
        description:
          "We pick the 5 highest-impact actions specific to your property.",
      },
      {
        step: "You get the list",
        description:
          "A written report with each action, dollar impact, effort level, and a 30-day plan.",
      },
    ],
    faq: [
      {
        question: "Why only 5 actions?",
        answer:
          "Because 30 actions is a spreadsheet nobody reads. 5 is actionable. Once you finish those, we can generate another list.",
      },
      {
        question: "How do you pick which 5?",
        answer:
          "We weight by revenue impact, effort, and how obvious/non-obvious the action is. We don't recommend the obvious stuff you've already tried.",
      },
      {
        question: "How long does it take?",
        answer:
          "Typically 5–7 business days because we touch multiple research areas.",
      },
      {
        question: "Can I request more than 5?",
        answer:
          "Tier 1 diagnostics go deeper. The Quick Win list is intentionally short.",
      },
    ],
  },
  {
    slug: "aeo-optimization",
    name: "AEO Optimization for Hotels",
    shortDescription:
      "Travelers are asking ChatGPT, Perplexity, and Google AI Overviews for hotel recommendations. Find out if you're in the answer.",
    metaTitle:
      "Free AEO Audit for Hotels | Answer Engine Optimization | BNHG",
    metaDescription:
      "Free AEO (Answer Engine Optimization) snapshot for independent boutique hotels and luxury short-term rentals. See whether ChatGPT, Perplexity, Google AI Overviews, and Gemini recommend your property — and exactly what's missing.",
    targetKeywords: [
      "hotel AEO",
      "answer engine optimization hotels",
      "ChatGPT hotel visibility",
      "Perplexity hotel citations",
      "Google AI Overview hotel",
      "hotel AI search visibility",
      "llms.txt hotel",
      "hotel schema markup",
    ],
    heroHeadline: "Are You in the AI Answer?",
    heroSubhead:
      "A free Answer Engine Optimization (AEO) snapshot for independent boutique hotels and luxury short-term rental operators. We test your property across ChatGPT, Perplexity, Google AI Overviews, and Gemini, then show you exactly what's missing.",
    pillar: "Commercial",
    featuredCallout: {
      label: "Why this matters now",
      title: "AI search is the newest booking channel",
      body: "A growing share of travelers now asks an AI assistant before a search engine. Most boutique properties score 0–6 out of 20 on AEO today. That gap is the single biggest low-effort visibility opportunity available right now, and the window to get ahead of competitors is short.",
    },
    whatYouGet: [
      "An AEO snapshot testing your property across ChatGPT, Perplexity, Google AI Overviews, and Gemini",
      "A schema.org audit covering Hotel/LodgingBusiness, LocalBusiness, FAQPage, Review, and Offer",
      "A check for `llms.txt` and content answerability (FAQ structure, scannable facts, direct Q&A)",
      "A 'why you're invisible' summary with the top 3 fixes ranked by impact",
      "Next-step path to Tier 1 (Readiness Diagnostic) or Tier 2 (Implementation) if you want help fixing it",
    ],
    whoItsFor: [
      "Hotels and luxury STR operators who don't appear when AI assistants recommend properties in their market",
      "Properties with no schema markup, no llms.txt, or no FAQ content structured for AI extraction",
      "Operators who want a first-mover advantage on the AEO frontier before competitors catch on",
    ],
    howItWorks: [
      {
        step: "Share your URL",
        description:
          "Send us your website. We test your property against real AI queries a traveler would ask.",
      },
      {
        step: "We audit your AEO surface",
        description:
          "We check ChatGPT, Perplexity, AI Overviews, and Gemini for citations, then inspect your schema, llms.txt, and content answerability.",
      },
      {
        step: "You get the snapshot",
        description:
          "A written report showing where you're visible, where you're invisible, and the 3 highest-impact fixes you can make this month.",
      },
    ],
    faq: [
      {
        question: "What is AEO and how is it different from SEO?",
        answer:
          "AEO (Answer Engine Optimization) is the practice of making your property visible in AI-generated answers on tools like ChatGPT, Perplexity, Google AI Overviews, and Gemini. SEO is about ranking in the blue-link search results; AEO is about being the source an AI cites when it answers a traveler's question. Both matter, but AEO is much less contested today.",
      },
      {
        question: "Why is this a big opportunity right now?",
        answer:
          "Almost no independent hotels have done AEO work yet. The fixes (schema, llms.txt, FAQ restructuring, citation-worthy content) are technically straightforward and compound. First movers earn disproportionate visibility.",
      },
      {
        question: "How is this different from the Visibility & Discoverability Audit?",
        answer:
          "The Visibility Audit covers 7 channel categories with AEO as one of them. This snapshot zooms in on AEO specifically, with more depth on schema, llms.txt, and AI-engine testing. Start with the Visibility Audit if you want the full picture; start with the AEO snapshot if you know AI search is your gap.",
      },
      {
        question: "Can you help me actually fix the AEO gaps?",
        answer:
          "Yes. Tier 1 AEO Readiness Diagnostic goes deeper (brand-query testing across four engines, competitor AEO benchmark, 90-day roadmap). Tier 2 AEO Implementation is the full build: schema markup, llms.txt, FAQ library, content restructuring, citation-earning outreach, and ongoing AI search monitoring.",
      },
      {
        question: "How long does the free snapshot take?",
        answer:
          "Typically 3–5 business days.",
      },
    ],
  },
];

export function getTierZeroResource(slug: string): TierZeroResource | undefined {
  return TIER_ZERO_RESOURCES.find((r) => r.slug === slug);
}

export function getAllTierZeroSlugs(): string[] {
  return TIER_ZERO_RESOURCES.map((r) => r.slug);
}
