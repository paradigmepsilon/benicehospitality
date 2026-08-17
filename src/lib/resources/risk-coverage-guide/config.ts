import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// Risk & Coverage Guide: handout H05 (verified 2026-08-15) rendered as a
// tabbed reference. Every figure traces to the CRR fact base; the gap-coverage
// prices are explicitly UNVERIFIED and labeled as such. Pure reference, no
// state, persistence "none".

export const RISK_GUIDE_CONTENT: ReferenceContent = {
  tabbed: true,
  sections: [
    // Pinned above the tabs, always visible.
    {
      callout:
        "Educational only, not insurance advice. Review pending. Estimates for education only, not financial, legal, tax, or insurance advice. Turo plan figures verified August 2026; Turo changes terms, so confirm current numbers in your host dashboard. Car Rental Riches is an independent educational product, not affiliated with Turo Inc.",
    },
    {
      intro:
        "Risk management is not about eliminating risk. It's about knowing exactly what you're exposed to, what's covered, what isn't, and what you'd pay out of pocket tomorrow if the worst trip of your year ended an hour ago. This guide covers the 2026 rules. If you learned Turo's protection system before January 2026, most of what you learned is obsolete.",
    },

    {
      id: "plans",
      shortLabel: "2026 Plans",
      heading: "The 2026 earnings plans",
      intro:
        "Turo replaced its five protection plans with three earnings plans for trips booked on or after January 7, 2026 (renamed March 31, 2026). Any course or article teaching 60/75/80/85/90 plans is out of date. Vocabulary changed too: what used to be called a deductible is now damage responsibility, and what used to be host take is now host share.",
      table: {
        head: [
          "Plan",
          "Host share (standard)",
          "Damage responsibility per claim",
          "Third-party liability",
          "Incidental invoice window",
        ],
        rows: [
          ["More peace of mind", "70%", "$250", "up to $750,000", "5 days"],
          ["Balanced", "80%", "$1,500", "up to $750,000", "4 days"],
          ["More earnings", "90%", "$2,750", "up to $750,000", "3 days"],
        ],
      },
      items: [
        {
          title: "Three things to internalize",
          bullets: [
            "Damage responsibility applies to ALL claim types: exterior, interior, tires, glass, and mechanical.",
            "Trips booked before January 7, 2026 honor the old plans unless the vehicle is swapped. Legacy tiers for reference: 60/$0, 75/$250, 80/$750, 85/$1,625, 90/$2,500.",
            "New York exception: for trips starting on or after June 17, 2026, liability defaults to New York's peer-to-peer minimums instead of the standard amount. More peace of mind shows $300,000 in New York. If you host in New York, read your plan's liability terms line by line.",
          ],
        },
        {
          title: "Variable host share (pilot markets)",
          body: "Since March 31, 2026, host share ties to booking lead time in pilot markets: Austin, Dallas, Detroit, Las Vegas, Maui, Philadelphia, Phoenix, San Diego, and Seattle. Earlier bookings mean lower risk to the platform, so they pay a higher share. Approximate ranges: 65 to 80% on More peace of mind, 75 to 90% on Balanced, and 85 to 100% on More earnings, with 100% available on trips booked 28 or more days in advance. If you're in a pilot market, your effective share is a range, not a number. Model your revenue that way.",
        },
        {
          title: "Choosing a plan is really a cash question",
          bullets: [
            "Could I pay this plan's damage responsibility in cash tomorrow without touching rent money? If not, you're on the wrong plan.",
            "How much claim risk does my market and guest mix carry?",
            "What does the share difference actually earn per month on my car, in dollars?",
          ],
        },
      ],
      callout:
        "The reserve rule: whatever plan you pick, hold one full damage responsibility in cash per car, always. That's the price of admission for the higher-share plans.",
    },

    {
      id: "not-insurance",
      shortLabel: "Not Insurance",
      heading: "Protection is not insurance",
      intro:
        "Read this section twice. Turo's physical damage protection is NOT insurance. It's a contractual reimbursement arrangement with Turo (except in Washington state, where it is insurance that Turo purchases). That distinction matters in practice.",
      items: [
        {
          title: "What the arrangement actually says",
          bullets: [
            "Turo alone decides whether a damaged vehicle gets repaired or paid out at actual cash value.",
            "Physical damage reimbursement is capped at the lesser of actual cash value or $200,000.",
            "Not covered: diminished value and repair do-overs. Storage is capped at $2,500.",
            "For vehicles with a fair market value of $125,000 or more, Turo can withhold up to 20% of covered damages if the vehicle lacks an activated OEM tracker or location information.",
          ],
        },
        {
          title: "Liability is different",
          body: "Third-party liability coverage of up to $750,000 comes via Travelers Excess and Surplus Lines, with claims handled through Constitution State Services (subject to the New York exception on the plans tab).",
        },
      ],
      callout:
        "The takeaway: you are in a business relationship with a platform, not a policyholder relationship with an insurer. Plan your reserves accordingly.",
    },

    {
      id: "personal-policy",
      shortLabel: "Your Policy",
      heading: "Your personal auto policy probably excludes this",
      intro:
        "Most personal auto policies exclude peer-to-peer car sharing. That's Turo's own statement, not ours. In plain terms: the moment your car is on a paid trip, your personal insurer likely considers it outside the policy.",
      items: [
        {
          title: "What to do about it",
          bullets: [
            'Call your agent before your first trip. Ask directly: "Does my policy exclude peer-to-peer car sharing?" Get the answer in writing.',
            "Don't hide the activity from your insurer. A denied claim or a cancelled policy costs far more than an honest conversation.",
            "Understand the gap: your personal policy likely doesn't cover trips, and Turo's protection isn't insurance. The space between those two facts is where gap coverage lives.",
          ],
        },
      ],
    },

    {
      id: "gap-coverage",
      shortLabel: "Gap Coverage",
      heading: "Gap coverage options",
      intro:
        "Four categories hosts use to fill the gap. Pricing below is UNVERIFIED with vendors; treat every number as a starting point for your own quotes, not a fact.",
      table: {
        head: ["Category", "What it is", "Reference point"],
        rows: [
          [
            "Car-sharing endorsement",
            "Rider on a personal policy that permits P2P activity",
            "Offered by American Family / CONNECT; availability varies by state",
          ],
          [
            "Commercial auto policy",
            "Full business-use coverage, standard for fleets",
            "Priced by quote; the usual path once you're past a car or two",
          ],
          [
            "P2P-specific coverage",
            "Products built for car-sharing hosts",
            'ABI "Period X" roughly $111 per month; pricing unverified',
          ],
          [
            "Per-vehicle host coverage",
            "Per-car products for hosts",
            "Tint roughly $56 per vehicle; pricing unverified",
          ],
        ],
      },
      items: [
        {
          title: "Also worth asking an agent about",
          body: "Umbrella liability on top of your underlying policies. This guide can't price that for you.",
        },
        {
          title: "Commercial hosts note",
          body: "Reports say commercial hosts can waive Turo's plans and carry their own commercial insurance, but the associated share figure comes from third-party sources only. Confirm commercial-host waiver terms directly with Turo before acting on them.",
        },
      ],
    },

    {
      id: "photo-protocol",
      shortLabel: "Photo Protocol",
      heading: "The photo protocol",
      intro:
        "Documentation is your side of the deal, and the 2026 rules are strict. Pre-trip: photos taken no more than 24 hours before trip start, uploaded no later than 24 hours after start. Post-trip: photos taken AND uploaded within 24 hours after trip end. Metadata is mandatory: photos without date, time, and geolocation data are invalid, so location services off means your photos may not count.",
      items: [
        {
          title: "Protocol, every trip, both ends",
          bullets: [
            "Location and timestamp on.",
            "Full walkaround: all four corners, all four sides, wheels.",
            "Interior: seats, carpets, dash, cargo area.",
            "Fuel or charge level and odometer.",
            "Existing damage: close-up plus context shot.",
            "Upload through the Turo app immediately. Never bank on the deadline.",
          ],
        },
      ],
      callout:
        "The full step-by-step version lives in the check-in and check-out SOP (handout H04), and the Claims-Day Playbook walks the incident version stage by stage.",
    },

    {
      id: "risk-matrix",
      shortLabel: "Risk Matrix",
      heading: "Risk assessment matrix",
      intro:
        "Rate each risk 1 to 5 for likelihood and impact, multiply for a score, and work the highest scores first. Print this tab and fill it in for your own fleet.",
      table: {
        head: [
          "Risk category",
          "Specific risk",
          "Likelihood (1-5)",
          "Impact (1-5)",
          "Score",
        ],
        rows: [
          ["Vehicle damage", "Minor damage (scratches, dents)", "", "", ""],
          ["", "Major damage", "", "", ""],
          ["", "Total loss", "", "", ""],
          ["Guest issues", "No-shows", "", "", ""],
          ["", "Late returns", "", "", ""],
          ["", "Rule violations (smoking, pets, mileage)", "", "", ""],
          ["", "Unauthorized drivers", "", "", ""],
          ["Mechanical", "Unexpected breakdowns", "", "", ""],
          ["", "Maintenance rating below 30% (delisting risk)", "", "", ""],
          ["", "Manufacturer recalls", "", "", ""],
          ["Financial", "Seasonal demand swings", "", "", ""],
          ["", "Market rate decreases", "", "", ""],
          ["", "Cash flow shortfall during a claim", "", "", ""],
          ["", "Depreciation outrunning true net", "", "", ""],
          ["Platform", "Earnings plan or policy changes", "", "", ""],
          ["", "Ranking penalties (cancellations, slow response)", "", "", ""],
          ["", "Account or listing suspension", "", "", ""],
          ["Regulatory", "Local or state P2P rule changes", "", "", ""],
          ["", "Airport restrictions", "", "", ""],
          ["", "Tax compliance issues", "", "", ""],
        ],
      },
      callout:
        "Note the platform rows: with Getaround out of the US market since February 2025, Turo is effectively the only national US P2P platform. Concentration is itself a risk. Direct relationships, reviews, and repeat guests are your hedge.",
    },
  ],
};
