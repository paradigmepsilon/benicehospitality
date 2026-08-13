import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// Revenue Maximization & Upsell Playbook: earn more from the rooms you already
// have through upsells, loyalty, referrals, rent optimization, and disciplined
// scaling. Condensed from Della's playbook.
export const PLAYBOOK_CONTENT: ReferenceContent = {
  tabbed: true,
  sections: [
    {
      id: "overview",
      shortLabel: "Overview",
      heading: "Beyond rent: your real revenue potential",
      intro:
        "A typical 3-room property at $1,200/room earns $3,600/month in base rent. With upsells and premium services, realistic potential is $4,200 to $4,800/month. That's $600 to $1,200 more per month, or $7,200 to $14,400 a year, from the same four walls.",
      callout:
        "The key insight: you don't need more rooms to earn more. You need smarter monetization of the rooms you have. Professional tenants would rather pay you for cleaning, Wi-Fi, and parking than arrange it themselves. That isn't gouging, it's providing value.",
    },
    {
      id: "upsell-menu",
      shortLabel: "Upsell Menu",
      heading: "The upsell menu",
      intro:
        "The most reliable upsells, with a typical price and your rough monthly margin. Start with two or three (parking, Wi-Fi, cleaning), read the demand, and add more as you scale.",
      table: {
        head: ["Upsell", "Typical price", "Your margin"],
        rows: [
          ["Bi-weekly cleaning service", "$80 to $120/mo", "$30 to $50/mo"],
          ["Laundry access / service", "$40 to $80/mo", "$20 to $40/mo"],
          ["Parking space", "$75 to $200/mo", "$40 to $150/mo"],
          ["Storage unit", "$50 to $100/mo", "$30 to $60/mo"],
          ["High-speed Wi-Fi upgrade", "$25 to $50/mo", "$10 to $30/mo"],
          ["Early move-in / late checkout", "$50 to $150 once", "$40 to $130"],
          ["Furnished garage / workspace", "$100 to $200/mo", "$60 to $120/mo"],
          ["Package receiving", "$20/mo", "$15/mo"],
          ["Pet accommodation fee", "$100 to $150/mo", "$95 to $145/mo"],
          ["Utility concierge (all-inclusive)", "$150 to $300/mo", "$100 to $250/mo"],
        ],
      },
    },
    {
      id: "loyalty",
      shortLabel: "Loyalty",
      heading: "Tenant loyalty program",
      intro:
        "Your best revenue multiplier is keeping tenants longer. A renewing tenant is worth about 3x a new one: no turnover, no vacancy, no marketing.",
      items: [
        { title: "Early renewal incentive", body: "Offer a $100 to $200 rent credit for signing a renewal 60 days before move-out. It cuts vacancy risk and gives you time to prepare." },
        { title: "Referral reward", body: "If a tenant refers a friend who signs a 6-month+ lease, give the referrer a $100 to $200 credit at move-in. Your cheapest acquisition." },
        { title: "Milestone gifts", body: "At 3, 6, and 12 months, send a small thank-you (a gift card, premium toiletries). It shows you value them." },
        { title: "Community recognition", body: "Shout out long-term tenants on social with permission. Happy residents become your best marketing." },
        { title: "Flexible extensions", body: "Allow month-to-month at their existing rate or a small 3 to 5% increase. Less pressure to leave, steadier occupancy." },
      ],
      columns: 1,
    },
    {
      id: "referrals",
      shortLabel: "Referrals",
      heading: "The referral engine",
      intro:
        "One tenant who stays six months and refers one friend who also stays six months is $7,200+ in revenue from a $100 to $200 bonus. A 36 to 72x return.",
      items: [
        {
          bullets: [
            "Incentive: a $100 to $200 rent credit per successful referral (friend stays 3+ months). Put it in the lease and welcome packet.",
            'Ask directly: "Know anyone looking for a place? I\'ll give you $150 off rent if they move in." Simple works.',
            'Track it: ask new tenants "How did you hear about us?" and process the credit immediately when it\'s a referral.',
          ],
        },
      ],
    },
    {
      id: "rent-optimization",
      shortLabel: "Rent Increases",
      heading: "Rent optimization: when and how to raise",
      items: [
        {
          title: "Signals it's time",
          bullets: [
            "You have 90%+ occupancy and a waiting list",
            "Market rents rose 5 to 10% in your area",
            "Competitors charge 10%+ more than you",
            "Your operating costs have climbed",
          ],
        },
        {
          title: "How to do it",
          bullets: [
            "Raise 5 to 10% per lease cycle; bigger jumps risk losing good tenants",
            "Give 60 days' notice and frame it around value added, not greed",
            "Be consistent: grandfather existing tenants, or apply increases evenly, but never arbitrarily",
          ],
        },
      ],
      columns: 2,
    },
    {
      id: "scaling",
      shortLabel: "Scaling Check",
      heading: "Ready for property two?",
      intro: "Check all five before you scale. Missing even one means: focus on Property 1 until it's tight.",
      items: [
        {
          bullets: [
            "Property 1 occupancy is 90%+ and stable for 3+ months",
            "You have 3+ months of operating reserves set aside",
            "All systems are documented (lease, rules, tracking, rent, maintenance)",
            "You have positive reviews and happy tenants",
            "You spend under 15 hours a week on Property 1",
          ],
        },
      ],
      callout:
        "The path: Property 1, master the systems and reach 85%+ occupancy. Property 2, replicate with identical systems. Property 3, optimize and hire a part-time manager (8 to 12% of gross). Properties 4+, scale confidently every 6 to 12 months.",
    },
  ],
};
