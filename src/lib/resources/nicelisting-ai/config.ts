// NiceListing Builder data model + a pure generator that assembles a
// platform-ready title and four-part description from the operator's inputs,
// using the framework from Chapter 4 of Room Rental Riches. No external calls.

export const EMOTION_WORDS = [
  "Sunny",
  "Cozy",
  "Spacious",
  "Modern",
  "Private",
  "Bright",
  "Serene",
];

export interface AudienceOption {
  id: string;
  label: string;
  hook: string;
  keyword: string;
}

export const AUDIENCES: AudienceOption[] = [
  {
    id: "nurse",
    label: "Traveling nurse / healthcare",
    hook: "After a twelve-hour shift, come home to a quiet, spotless private room minutes from work",
    keyword: "traveling healthcare professionals",
  },
  {
    id: "remote",
    label: "Remote worker / professional",
    hook: "Work from a calm room with fast, reliable Wi-Fi by day, and unwind in a welcoming home by night",
    keyword: "remote workers and professionals",
  },
  {
    id: "student",
    label: "Student / intern",
    hook: "A furnished, affordable room with a real desk and easy access to campus",
    keyword: "students and interns",
  },
  {
    id: "relocating",
    label: "Relocating professional",
    hook: "Land softly in a new city with a move-in-ready room and none of the setup hassle",
    keyword: "relocating professionals",
  },
  {
    id: "any",
    label: "Any professional",
    hook: "A comfortable, move-in-ready private room in a well-run, welcoming shared home",
    keyword: "working professionals",
  },
];

export const PLATFORMS = [
  "Airbnb",
  "Furnished Finder",
  "Facebook Marketplace",
  "Roomster",
  "Zillow",
];

export const AMENITIES = [
  "Private bathroom",
  "Dedicated workspace",
  "Fast Wi-Fi",
  "Utilities included",
  "Weekly cleaning of shared spaces",
  "In-unit laundry",
  "Off-street parking",
  "Fully furnished",
  "Keyless smart-lock entry",
  "Full kitchen access",
];

export interface ListingInputs {
  emotion: string;
  feature: string;
  location: string;
  benefit: string;
  audience: string;
  roomDetails: string;
  amenities: string[];
  neighborhood: string;
  rent: string;
  term: string;
}

export interface ListingOutput {
  title: string;
  titleLength: number;
  description: string;
}

function joinList(items: string[]): string {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

export function generateListing(i: ListingInputs): ListingOutput {
  const emotion = i.emotion || "Private";
  const feature = i.feature.trim() || "Furnished Room";
  const loc = i.location.trim() ? ` in ${i.location.trim()}` : "";
  const benefit = i.benefit.trim() ? `, ${i.benefit.trim()}` : "";

  // Title: Emotion + Key Feature + Location + Benefit, kept under 65 characters.
  let title = `${emotion} ${feature}${loc}${benefit}`.replace(/\s+/g, " ").trim();
  if (title.length > 65) {
    title = `${emotion} ${feature}${loc}`.replace(/\s+/g, " ").trim();
  }
  if (title.length > 65) title = title.slice(0, 64).trim();

  const aud =
    AUDIENCES.find((a) => a.id === i.audience) ?? AUDIENCES[AUDIENCES.length - 1];

  // Part 1: hook, leading with the biggest benefit.
  const hook = `${aud.hook}.`;

  // Part 2: room-specific details + amenities.
  const amenText = i.amenities.length
    ? `It comes with ${joinList(i.amenities.map((a) => a.toLowerCase()))}.`
    : "";
  const roomLine = i.roomDetails.trim();
  const part2 = [roomLine, amenText].filter(Boolean).join(" ");

  // Part 3: common-area / community highlight.
  const part3 =
    "You will share thoughtfully kept common spaces with a small group of screened, respectful housemates, so it feels like a home, not just a rental.";

  // Part 4: neighborhood, terms, and a clear call to action.
  const hood = i.neighborhood.trim()
    ? `The neighborhood: ${i.neighborhood.trim()}.`
    : "";
  const utilitiesIncluded = i.amenities.some((a) =>
    a.toLowerCase().includes("utilities"),
  );
  const rentLine = i.rent.trim()
    ? `Rent is $${i.rent.trim()}/month${utilitiesIncluded ? ", utilities included" : ""}.`
    : "";
  const termLine = i.term.trim() ? `Minimum stay ${i.term.trim()}.` : "";
  const cta = `Perfect for ${aud.keyword}. Message me to book a quick tour, virtual or in person, rooms like this fill fast.`;
  const part4 = [hood, rentLine, termLine, cta].filter(Boolean).join(" ");

  const description = [hook, part2, part3, part4]
    .filter(Boolean)
    .join("\n\n");

  return { title, titleLength: title.length, description };
}
