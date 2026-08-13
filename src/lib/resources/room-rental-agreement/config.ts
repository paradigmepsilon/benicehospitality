import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// Room Rental Agreement & House Rules Guide: the clause-by-clause anatomy of a
// solid co-living agreement and house-rules document, in plain English. This is
// educational, not legal advice, and not the editable template itself.
export const AGREEMENT_CONTENT: ReferenceContent = {
  tabbed: true,
  sections: [
    {
      callout:
        "Important: this is an educational guide, not legal advice, and not a substitute for a reviewed contract. Landlord-tenant law varies by state and city and changes over time. Always have a licensed local real estate attorney review any agreement before you use it. The editable Room Rental Agreement and House Rules templates are included with your Room Rental Riches enrollment.",
    },
    {
      id: "agreement",
      shortLabel: "Agreement Clauses",
      heading: "What a room rental agreement should cover",
      intro:
        "A good agreement prevents most disputes before they start. Whether you draft your own or adapt a template, make sure it addresses each of these, then have an attorney confirm it for your market.",
      items: [
        { title: "Parties & the room", body: "Names of the landlord/operator and tenant, the property address, and exactly which private room is being rented plus the shared spaces the tenant may use." },
        { title: "Term", body: "Start and end dates, whether it is fixed-term or month-to-month, and the renewal process. Mid-term co-living commonly runs 30 days to several months." },
        { title: "Rent", body: "The monthly amount, the due date, accepted payment methods, and a clear, lawful late-fee policy. Spell out proration for partial first or last months." },
        { title: "Security deposit", body: "The amount, what it covers, the conditions for deductions, and the return timeline. Check your state's deposit limits and deadlines." },
        { title: "What's included", body: "Utilities, Wi-Fi, furnishings, and any services (cleaning, parking) covered by rent, so there are no surprises. List any add-ons and their cost." },
        { title: "Use & occupancy", body: "That the room is for the named tenant only, the number of occupants, overnight-guest limits, and that it is residential use, not a business or sublet without consent." },
        { title: "Maintenance & responsibilities", body: "Who handles repairs, how the tenant reports issues, and the tenant's duty to keep their room and shared areas clean and undamaged." },
        { title: "Access & entry", body: "Your right to enter for repairs or inspections, with the notice your state requires (commonly 24 to 48 hours except emergencies)." },
        { title: "House rules reference", body: "Incorporate the House Rules document by reference, so a rules violation is also an agreement violation." },
        { title: "Termination & notice", body: "Notice periods for both sides, grounds for ending the agreement, and the move-out process. Follow your state's required procedures exactly." },
        { title: "Signatures", body: "Dated signatures from every party, with each keeping a copy. An unsigned agreement protects no one." },
      ],
    },
    {
      id: "house-rules",
      shortLabel: "House Rules",
      heading: "What co-living house rules should cover",
      intro:
        "House rules keep a shared home calm and set expectations before anyone moves in. Frame them positively, and put them in the listing, the pre-arrival message, and printed in the home.",
      items: [
        { title: "Quiet hours & noise", body: 'Set quiet hours (for example after 10 PM) framed around rest for everyone, not just prohibition.' },
        { title: "Guests & visitors", body: "Overnight-guest limits, how long guests may stay, and that the tenant is responsible for their guests' conduct." },
        { title: "Shared spaces", body: "Expectations for the kitchen, living room, and laundry: clean up after yourself, label food, share fairly, no hoarding common areas." },
        { title: "Cleaning & chores", body: "How shared-space cleaning is handled, any rotation, and what the operator's cleaner covers versus the tenants." },
        { title: "Utilities & thermostat", body: "Reasonable use of heat, AC, and utilities, and any shared-cost expectations." },
        { title: "Safety & security", body: "Locking doors, not sharing access codes, no smoking indoors, and any policies on candles, pets, or hazardous items." },
        { title: "Conflict resolution", body: "How housemates should raise issues and how the operator steps in, so small frictions do not become move-outs." },
      ],
    },
  ],
};
