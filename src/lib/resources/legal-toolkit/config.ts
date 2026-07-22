import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// The Legal Toolkit Overview: the eight documents a co-living operator should
// have, what each protects, and when it comes into play. Educational overview,
// not legal advice; the editable templates are an enrollment deliverable.
export const LEGAL_CONTENT: ReferenceContent = {
  sections: [
    {
      callout:
        "Important: these are strong starting frameworks, not legal advice. Landlord-tenant law, zoning, and licensing vary by jurisdiction and change over time. Always have a licensed local attorney review any document before you use it. The editable templates are included with your Room Rental Riches enrollment.",
    },
    {
      heading: "The co-living document stack",
      intro:
        "Co-living runs on a handful of documents most new operators do not realize they need until something goes wrong. Here is the full stack, what each one does, and when you reach for it.",
      items: [
        { title: "1. Room Rental Agreement", meta: "Your core contract", body: "The comprehensive room rental contract covering the room, term, rent, deposit, rules, and exit provisions. The foundation everything else references. See the Room Rental Agreement guide for its full anatomy." },
        { title: "2. House Rules Agreement", meta: "Signed at move-in", body: "Community guidelines for a shared home: quiet hours, guests, shared spaces, utilities, cleaning, and conflict resolution. Reference it inside the rental agreement so a rules breach is a lease breach." },
        { title: "3. Security Deposit Agreement", meta: "Protects both parties", body: "Documents the deposit amount, what it may be used for, and the return timeline. Keeps deposit disputes clean and compliant with your state's limits and deadlines." },
        { title: "4. Tenant Screening Authorization", meta: "Before you approve anyone", body: "The applicant's written authorization to run background and credit checks. Required in most states before you may access an applicant's records." },
        { title: "5. Landlord Permission Request Letter", meta: "If you don't own the home", body: "A professional letter requesting the owner's written permission to sublet or co-host a property you rent. Get this in writing before you furnish a thing." },
        { title: "6. Co-Living Liability Waiver", meta: "Shared-space risk", body: "An assumption-of-risk and liability acknowledgment tuned for shared-living environments, covering common areas, guest policies, and personal property." },
        { title: "7. Local Regulations Compliance Checklist", meta: "Before you list", body: "A jurisdiction-by-jurisdiction checklist for permitting, zoning, business licensing, occupancy limits, and tenant-protection laws in your city and state." },
        { title: "8. Move-In / Move-Out Checklist", meta: "Condition on the record", body: "A documented condition report at move-in and move-out, with photos, so deposit deductions are fair, defensible, and rarely disputed." },
      ],
    },
    {
      heading: "How to use the stack",
      items: [
        {
          bullets: [
            "Confirm ownership or permission first (document 5) if you do not own the property.",
            "Check compliance before you list (document 7): permits, zoning, licensing, occupancy limits.",
            "Screen every applicant with written authorization (document 4).",
            "At signing, execute the rental agreement, house rules, and deposit agreement together (documents 1 to 3).",
            "At move-in and move-out, complete the condition checklist with photos (document 8).",
            "Adapt every framework to your state, and have a local attorney review it before use.",
          ],
        },
      ],
    },
  ],
};
