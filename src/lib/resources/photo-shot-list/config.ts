import { type CheckSection } from "@/components/resources/ChecklistTool";

// Photo Shot List: every image a co-living listing needs, grouped by space, in
// roughly the order they should appear in the listing. Shoot in natural light,
// lead with the rental room, and end on the neighborhood.
export const SHOT_SECTIONS: CheckSection[] = [
  {
    id: "hero-shot",
    label: "The Hero Shot (do this first)",
    shortLabel: "Hero Shot",
    items: [
      { id: "hero", label: "Your single best rental-room image, straight on, in bright natural light. This one sets your click-through rate" },
    ],
  },
  {
    id: "rental-room",
    label: "The Rental Room",
    shortLabel: "Rental Room",
    items: [
      { id: "room-wide", label: "Wide shot from the doorway, showing the whole room" },
      { id: "room-bed", label: "Bed straight on, made and styled with layered bedding" },
      { id: "room-corners", label: "One shot from each far corner, so size reads honestly" },
      { id: "room-desk", label: "The desk or workspace, set up ready to use" },
      { id: "room-storage", label: "Closet and storage, open and tidy" },
      { id: "room-window", label: "The window and its light, curtains open" },
      { id: "room-detail", label: "A styled detail: nightstand, lamp, or a plant", optional: true },
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    items: [
      { id: "kitchen-wide", label: "Wide shot of the whole kitchen, counters clear" },
      { id: "kitchen-appliances", label: "Appliances the tenant will actually use" },
      { id: "kitchen-dining", label: "The dining or eat-in area" },
      { id: "kitchen-coffee", label: "A coffee or tea station, styled", optional: true },
    ],
  },
  {
    id: "bathrooms",
    label: "Bathrooms",
    items: [
      { id: "bath-wide", label: "Wide shot of each bathroom the tenant uses" },
      { id: "bath-shower", label: "Shower or tub, clean and dry" },
      { id: "bath-vanity", label: "Vanity with fresh, styled towels" },
    ],
  },
  {
    id: "common",
    label: "Shared & Common Spaces",
    shortLabel: "Common Areas",
    items: [
      { id: "living-wide", label: "Wide shot of the living or common area" },
      { id: "living-seating", label: "Seating arranged for how people actually gather" },
      { id: "living-light", label: "The best natural-light moment in the shared space" },
      { id: "laundry", label: "Laundry area, if shared", optional: true },
    ],
  },
  {
    id: "exterior",
    label: "Entry & Exterior",
    shortLabel: "Exterior",
    items: [
      { id: "ext-front", label: "Front of the house, curb view" },
      { id: "ext-entry", label: "Entry and front door, welcoming" },
      { id: "ext-parking", label: "Parking, if included" },
      { id: "ext-outdoor", label: "Porch, yard, or outdoor space", optional: true },
    ],
  },
  {
    id: "neighborhood",
    label: "Neighborhood",
    items: [
      { id: "hood-1", label: "A nearby highlight: transit, campus, or hospital" },
      { id: "hood-2", label: "A lifestyle highlight: coffee shop, park, or main street" },
      { id: "hood-3", label: "A third highlight that fits your target tenant", optional: true },
    ],
  },
];
