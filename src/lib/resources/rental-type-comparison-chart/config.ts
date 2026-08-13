import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// Rental Type Comparison Chart: short-term vs mid-term vs long-term, side by side,
// with honest pros/cons, real income examples, and a 5-question fit quiz.
export const COMPARISON_CONTENT: ReferenceContent = {
  tabbed: true,
  sections: [
    {
      id: "compare",
      shortLabel: "Compare All",
      heading: "How the three models compare",
      intro:
        "Before you furnish anything, see the three rental models on the numbers. The mid-term column is highlighted because it is the sweet spot this course is built around: near short-term income at a fraction of the hours.",
      table: {
        head: ["Factor", "Short-Term (STR)", "Mid-Term (MTR)", "Long-Term (LTR)"],
        highlightCol: 2,
        rows: [
          ["Typical duration", "1 to 30 days", "1 to 12 months", "12+ months"],
          ["Monthly income", "$3,800 to $4,500", "$3,750 to $4,250", "$1,800 to $2,200"],
          ["Management hours/mo", "30 to 40 hrs", "10 to 15 hrs", "3 to 5 hrs"],
          ["Regulation", "High", "Medium", "Low"],
          ["Startup cost", "$15K to $25K", "$10K to $15K", "$3K to $5K"],
          ["Turnover", "Weekly/daily", "2 to 4x per year", "Annual"],
          ["Stability", "Volatile", "Predictable", "Very stable"],
        ],
      },
    },
    {
      id: "str",
      shortLabel: "Short-Term",
      heading: "Short-Term Rentals (STR)",
      columns: 2,
      items: [
        {
          title: "Where it wins",
          bullets: [
            "Highest per-night rates, often $80 to $150+ per room",
            "Maximum flexibility to change pricing and availability instantly",
            "Can be profitable even at lower occupancy",
          ],
        },
        {
          title: "The trade-offs",
          bullets: [
            "Highest management burden: daily turnovers and guest issues",
            "Heavy regulatory scrutiny; many cities restrict or ban STRs",
            "High cleaning and linen costs, often $200 to $400 per turnover",
            "Income is seasonal and unpredictable",
          ],
        },
      ],
      callout:
        "Real example: a 3-bed beachfront condo in Miami at $120/night and 60% occupancy grosses about $6,480/month. After cleaning, utilities, and a 15% manager fee, roughly $4,600 net. High income, but it demands constant attention.",
    },
    {
      id: "mtr",
      shortLabel: "Mid-Term",
      heading: "Mid-Term Rentals (MTR) — our focus",
      columns: 2,
      items: [
        {
          title: "Where it wins",
          bullets: [
            "Sweet-spot income of $3,750 to $4,250/month at 10 to 15 hours",
            "Far lower regulatory burden than STR in most places",
            "Predictable, stable income; low turnover costs",
            "Professional tenants mean fewer problems",
          ],
        },
        {
          title: "The trade-offs",
          bullets: [
            "Lower per-night rate than STR (steadier occupancy offsets it)",
            "Needs real furnishings and more upfront investment than LTR",
            "Tenant vetting and a solid lease are essential",
          ],
        },
      ],
      callout:
        "Real example: a 3-bed Atlanta house at $1,200 x 3 rooms is $3,600/month base. A Wi-Fi upgrade and one parking add-on push it to about $3,850. Tenants turn over twice a year, not twelve times. About 12 hours a month, roughly $2,800/month net.",
    },
    {
      id: "ltr",
      shortLabel: "Long-Term",
      heading: "Long-Term Rentals (LTR)",
      columns: 2,
      items: [
        {
          title: "Where it wins",
          bullets: [
            "Minimal regulatory complexity, like traditional housing",
            "Extremely stable, predictable income",
            "Lowest management burden, 2 to 5 hours a month",
            "Lowest furnishing cost: basic furniture and appliances",
          ],
        },
        {
          title: "The trade-offs",
          bullets: [
            "Lowest income: about $1,800 to $2,200/month for a 3-bed",
            "Long leases reduce your pricing flexibility",
            "A problem tenant can tie up time and legal resources",
          ],
        },
      ],
    },
    {
      id: "quiz",
      shortLabel: "Fit Quiz",
      heading: "Which model fits you?",
      intro:
        "Answer these five questions and score each response 1 to 3 points, then total your score. 5 to 8 points points to long-term, 9 to 13 to mid-term, 14+ to short-term.",
      items: [
        { title: "1. Monthly time you can give", body: "Under 5 hours (1 pt) · 5 to 20 hours (2 pts) · 20+ hours (3 pts)" },
        { title: "2. Tolerance for income volatility", body: "Low, need predictable (1 pt) · Medium (2 pts) · High, can weather swings (3 pts)" },
        { title: "3. Capital you can invest upfront", body: "$3K to $5K (1 pt) · $10K to $15K (2 pts) · $15K to $25K+ (3 pts)" },
        { title: "4. Local rental regulation", body: "STRs restricted/banned (1 pt) · Mixed, MTR tolerated (2 pts) · STRs welcome (3 pts)" },
        { title: "5. Income you are targeting", body: "$1,800 to $2,200 (1 pt) · $3,750 to $4,250 (2 pts) · $4,500+ (3 pts)" },
      ],
      callout:
        "Your score: 5 to 8 = long-term is your fit, embrace the stability. 9 to 13 = mid-term is your sweet spot, and what this course teaches. 14+ = short-term suits your skills, prepare for high involvement.",
    },
    {
      id: "why-mtr",
      shortLabel: "Why MTR",
      heading: "Why we teach mid-term",
      items: [
        {
          bullets: [
            "Optimal income-to-effort ratio: $250 to $425 per hour of management, versus $30 to $50 for LTR",
            "A regulatory runway while cities are still catching up to MTR",
            "Growing demand from relocations, medical pros, and remote workers",
            "Scalable to 3 to 5 properties without burnout",
            "Professional, creditworthy tenants and fewer 2 a.m. calls",
          ],
        },
      ],
    },
  ],
};
