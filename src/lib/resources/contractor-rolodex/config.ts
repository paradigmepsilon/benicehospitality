// Contractor Rolodex — digitized from Della's "Contractor Rolodex Template"
// handout, then rebuilt around the way it actually gets used: adding ONE
// contractor at a time, on a phone, with every field for that contractor
// visible at once.
//
// The thirteen fields are unchanged from the original DataTableTool columns and
// so is the saved row shape, so existing account data and previously exported
// CSVs load here with no migration. What changed is that the fields now carry
// their own grouping, input type, and helper copy, which is what lets the form
// render itself in sections instead of as a thirteen-column table nobody could
// read without scrolling sideways.

export interface Contractor {
  _id: string;
  company: string;
  specialty: string;
  /** Point of contact — "POC" on the handout. */
  poc: string;
  phone: string;
  email: string;
  address: string;
  availability: string;
  /** "1" to "5", or "" when unrated. */
  rating: string;
  /** yyyy-mm-dd, or "". */
  lastUsed: string;
  lastCost: string;
  lastJob: string;
  serviceArea: string;
  notes: string;
}

export type ContractorField = keyof Omit<Contractor, "_id">;

/**
 * How one field renders. `rating` and `money` are presentation variants, not
 * storage ones — every value is still a plain string on the row.
 */
export type FieldKind =
  | "text"
  | "tel"
  | "email"
  | "date"
  | "money"
  | "textarea"
  | "rating";

export interface FieldSpec {
  key: ContractorField;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  /** Persistent helper text under the input. */
  help?: string;
  /** Span the full form width instead of half at sm+. */
  wide?: boolean;
  autoComplete?: string;
  /** Offered through a <datalist>; typing stays free-form. */
  suggestions?: readonly string[];
}

export interface FieldSection {
  id: string;
  title: string;
  /** One line under the section heading explaining why it earns its space. */
  hint: string;
  fields: FieldSpec[];
}

/**
 * The trades a co-living or MTR operator actually keeps on a bench, offered as
 * a datalist on the Specialty field. Ordered by how often you call them.
 */
export const COMMON_SPECIALTIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Handyman / General repair",
  "Cleaning / Turnover",
  "Appliance repair",
  "Locksmith",
  "Pest control",
  "Landscaping & lawn",
  "Painting",
  "Flooring",
  "Drywall",
  "Carpentry",
  "Roofing",
  "Gutters",
  "Pressure washing",
  "Junk removal",
  "Garage door",
  "Water damage / Restoration",
  "Septic & drain",
  "Window & glass",
  "Fencing",
  "Tree service",
  "Security & cameras",
  "Internet & AV",
  "Home inspection",
] as const;

/** Availability phrasings that make a rolodex sortable in your head. */
export const COMMON_AVAILABILITY = [
  "24/7 emergency",
  "Weekdays 8-5",
  "Weekdays + Saturday",
  "Evenings and weekends",
  "Same day",
  "Next day",
  "48 hour lead time",
  "By appointment only",
] as const;

/**
 * The form, in the order someone fills it in: who they are, how to reach them,
 * whether they cover you, what they last did, then anything else.
 */
export const CONTRACTOR_SECTIONS: FieldSection[] = [
  {
    id: "identity",
    title: "Who they are",
    hint: "The company, the trade, and the person who actually answers the phone.",
    fields: [
      {
        key: "company",
        label: "Company name",
        kind: "text",
        placeholder: "ATL Rapid Plumbing",
        wide: true,
        autoComplete: "organization",
      },
      {
        key: "specialty",
        label: "Specialty",
        kind: "text",
        placeholder: "Plumbing",
        suggestions: COMMON_SPECIALTIES,
      },
      {
        key: "poc",
        label: "Point of contact",
        kind: "text",
        placeholder: "Marcus Webb",
        autoComplete: "name",
      },
      {
        key: "rating",
        label: "Your rating",
        kind: "rating",
        help: "Rate them after the job, not after the quote.",
        wide: true,
      },
    ],
  },
  {
    id: "contact",
    title: "How to reach them",
    hint: "The 9pm fields. Phone first, because nobody answers email at 9pm.",
    fields: [
      {
        key: "phone",
        label: "Phone number",
        kind: "tel",
        placeholder: "770-555-0182",
        autoComplete: "tel",
      },
      {
        key: "email",
        label: "Email address",
        kind: "email",
        placeholder: "dispatch@company.com",
        autoComplete: "email",
      },
      {
        key: "address",
        label: "Business address",
        kind: "text",
        placeholder: "1420 Fulton Industrial Blvd, Atlanta GA 30336",
        wide: true,
        autoComplete: "street-address",
      },
    ],
  },
  {
    id: "coverage",
    title: "When and where they work",
    hint: "Before you call, know whether they cover your property and whether they are awake.",
    fields: [
      {
        key: "serviceArea",
        label: "Service area",
        kind: "text",
        placeholder: "Metro Atlanta inside I-285",
      },
      {
        key: "availability",
        label: "Availability",
        kind: "text",
        placeholder: "24/7 emergency",
        suggestions: COMMON_AVAILABILITY,
      },
    ],
  },
  {
    id: "history",
    title: "Last job",
    hint: "Fill this in right after every visit. It is what makes the rating mean something a year from now.",
    fields: [
      { key: "lastUsed", label: "Last used", kind: "date" },
      {
        key: "lastCost",
        label: "Cost of last job",
        kind: "money",
        placeholder: "840",
      },
      {
        key: "lastJob",
        label: "Type of last job",
        kind: "text",
        placeholder: "Replaced 50 gallon water heater",
        wide: true,
      },
    ],
  },
  {
    id: "notes",
    title: "Notes",
    hint: "How they invoice, what they will not touch, who referred them. Keep access codes and lockbox combinations out of here.",
    fields: [
      {
        key: "notes",
        label: "Notes",
        kind: "textarea",
        placeholder:
          "Net 15, invoices by email. Will not do gas lines. Referred by the Peachtree property manager.",
        wide: true,
      },
    ],
  },
];

/** Every editable field, flattened in form order. */
export const CONTRACTOR_FIELDS: FieldSpec[] = CONTRACTOR_SECTIONS.flatMap(
  (s) => s.fields,
);

/**
 * CSV shape. Labels are frozen at the original table headers so a CSV exported
 * from the previous version still imports here; `aliases` accepts the common
 * spreadsheet variants people retype by hand.
 */
export const CSV_COLUMNS: {
  key: ContractorField;
  label: string;
  aliases?: string[];
}[] = [
  { key: "company", label: "Company Name", aliases: ["Company", "Vendor"] },
  { key: "specialty", label: "Specialty", aliases: ["Trade", "Service"] },
  { key: "poc", label: "POC", aliases: ["Point of Contact", "Contact", "Name"] },
  { key: "phone", label: "Phone Number", aliases: ["Phone", "Mobile", "Tel"] },
  { key: "email", label: "Email Address", aliases: ["Email"] },
  {
    key: "address",
    label: "Business Address",
    aliases: ["Address", "Street Address"],
  },
  { key: "availability", label: "Availability", aliases: ["Hours"] },
  { key: "rating", label: "Rating", aliases: ["Stars", "Score"] },
  { key: "lastUsed", label: "Last Used", aliases: ["Last Service", "Date"] },
  { key: "lastCost", label: "Cost of Last Job", aliases: ["Last Cost", "Cost"] },
  { key: "lastJob", label: "Type of Last Job", aliases: ["Last Job", "Job"] },
  { key: "serviceArea", label: "Service Area", aliases: ["Area", "Coverage"] },
  { key: "notes", label: "Notes", aliases: ["Note", "Comments"] },
];

const EDITABLE_KEYS: ContractorField[] = CSV_COLUMNS.map((c) => c.key);

export function blankContractor(id: string): Contractor {
  const row = { _id: id } as Contractor;
  for (const k of EDITABLE_KEYS) row[k] = "";
  return row;
}

/** Does this row hold anything a human typed? Blank rows are never counted. */
export function isFilled(c: Contractor): boolean {
  return EDITABLE_KEYS.some((k) => (c[k] ?? "").trim() !== "");
}

/** What to call a contractor in a heading before the company field is filled. */
export function displayName(c: Contractor): string {
  return c.company.trim() || c.specialty.trim() || c.poc.trim() || "New contractor";
}

/** 0 when unrated, so sorting never has to special-case an empty string. */
export function ratingValue(c: Contractor): number {
  const n = parseInt(c.rating, 10);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0;
}

/** Everything the search box looks through. */
export function searchHaystack(c: Contractor): string {
  return [
    c.company,
    c.specialty,
    c.poc,
    c.phone,
    c.email,
    c.serviceArea,
    c.availability,
    c.lastJob,
    c.notes,
  ]
    .join(" ")
    .toLowerCase();
}

export type SortKey = "added" | "company" | "rating" | "lastUsed";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "added", label: "Order added" },
  { value: "company", label: "Company A to Z" },
  { value: "rating", label: "Highest rated" },
  { value: "lastUsed", label: "Most recently used" },
];

/**
 * A new copy of the list in the requested order. Ties fall back to the order
 * they were added, so re-sorting never shuffles equal rows around.
 */
export function sortContractors(
  list: Contractor[],
  sort: SortKey,
): Contractor[] {
  if (sort === "added") return list;
  const indexed = list.map((c, i) => ({ c, i }));
  indexed.sort((a, b) => {
    switch (sort) {
      case "company":
        return (
          displayName(a.c).localeCompare(displayName(b.c)) || a.i - b.i
        );
      case "rating":
        return ratingValue(b.c) - ratingValue(a.c) || a.i - b.i;
      case "lastUsed":
        // ISO dates sort lexically; blanks sink to the bottom either way.
        return (b.c.lastUsed || "").localeCompare(a.c.lastUsed || "") || a.i - b.i;
    }
  });
  return indexed.map((x) => x.c);
}

/** A date input's yyyy-mm-dd read back as a short human date, in local time. */
export function formatDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value.trim();
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return value.trim();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "840" reads as "$840"; anything already carrying a symbol is left alone. */
export function formatCost(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return /^[\d.,]+$/.test(v) ? `$${v}` : v;
}
