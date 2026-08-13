import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// 30-Day Social Posting Calendar: four weekly themes that build from visibility
// to urgency, with a specific, copy-ready prompt for each day.
export const CALENDAR_CONTENT: ReferenceContent = {
  tabbed: true,
  sections: [
    {
      intro:
        "Consistency is what fills rooms, and consistency is a plan. Follow the four weekly themes in order, use each day's prompt, and batch a week at a time. Copy any prompt straight into your scheduler.",
    },
    {
      id: "week1",
      shortLabel: "Week 1",
      heading: "Week 1 — Visibility + Availability",
      columns: 2,
      items: [
        { title: "Day 1", meta: "Video", copy: true, body: "Room tour: a walkthrough of a private room" },
        { title: "Day 2", meta: "Photo", copy: true, body: 'A high-quality shared-space photo, caption: "What $950/month gets you in [City]"' },
        { title: "Day 3", meta: "Story poll", copy: true, body: '"Would you live with roommates to save $1,000/month?"' },
        { title: "Day 4", meta: "Post", copy: true, body: '"Why I offer co-living instead of Airbnb"' },
        { title: "Day 5", meta: "Reel", copy: true, body: 'POV: "First time walking into your new space"' },
        { title: "Day 6", meta: "Graphic", copy: true, body: "A testimonial quote from a current or past tenant" },
        { title: "Day 7", meta: "Post", copy: true, body: 'FAQ: "Do I need a full lease?" with a short answer in the caption' },
      ],
    },
    {
      id: "week2",
      shortLabel: "Week 2",
      heading: "Week 2 — Value + Trust",
      columns: 2,
      items: [
        { title: "Day 8", meta: "Post", copy: true, body: "A breakdown of what's included in the rent" },
        { title: "Day 9", meta: "Video", copy: true, body: "You explaining your tenant screening process (or as text overlay)" },
        { title: "Day 10", meta: "Story", copy: true, body: "Share your cleaning checklist" },
        { title: "Day 11", meta: "Carousel", copy: true, body: '"5 reasons this room fills fast"' },
        { title: "Day 12", meta: "Reel", copy: true, body: 'Voiceover: "Here\'s what $900/month gets you in [City]"' },
        { title: "Day 13", meta: "Post", copy: true, body: "A tip: how to save money on rent by renting rooms" },
        { title: "Day 14", meta: "Behind the scenes", copy: true, body: "You staging a room or restocking supplies" },
      ],
    },
    {
      id: "week3",
      shortLabel: "Week 3",
      heading: "Week 3 — Community + Lifestyle",
      columns: 2,
      items: [
        { title: "Day 15", meta: "Post", copy: true, body: "A roommate introduction" },
        { title: "Day 16", meta: "Video", copy: true, body: '"3 things my tenants love most"' },
        { title: "Day 17", meta: "Story", copy: true, body: "This or that: shared kitchen vs. private mini fridge" },
        { title: "Day 18", meta: "Post", copy: true, body: '"A day in the life of a co-living tenant" (lifestyle focus)' },
        { title: "Day 19", meta: "Reel", copy: true, body: "Time-lapse of you turning over a room" },
        { title: "Day 20", meta: "Post", copy: true, body: '"What makes our co-living different?"' },
        { title: "Day 21", meta: "Story", copy: true, body: '"What matters most to you in a shared living space?"' },
      ],
    },
    {
      id: "week4",
      shortLabel: "Week 4",
      heading: "Week 4 — Scarcity + Urgency",
      columns: 2,
      items: [
        { title: "Day 22", meta: "Countdown story", copy: true, body: '"Only 2 days left for the move-in special"' },
        { title: "Day 23", meta: "Post", copy: true, body: '"This room is going fast, here\'s why"' },
        { title: "Day 24", meta: "Video", copy: true, body: '"DM to apply. Last room available this month."' },
        { title: "Day 25", meta: "Testimonial", copy: true, body: "Highlight a successful tenant move-in" },
        { title: "Day 26", meta: "Post", copy: true, body: "A visual reminder of your bonus or move-in promo" },
        { title: "Day 27", meta: "Story", copy: true, body: "Behind the scenes: cleaning and prep before a new tenant" },
        { title: "Day 28", meta: "Live or reel", copy: true, body: '"Final room tour before it\'s gone"' },
      ],
    },
    {
      id: "bonus",
      shortLabel: "Bonus",
      heading: "Bonus days (use any time)",
      columns: 2,
      items: [
        { title: "Day 29", meta: "Graphic", copy: true, body: "An inspirational quote on a branded graphic" },
        { title: "Day 30", meta: "Carousel", copy: true, body: '"What you missed this month (but still have time for)"' },
      ],
    },
  ],
};
