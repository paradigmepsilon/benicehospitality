import type { Pack } from "./types";

/**
 * Valuation Pack (Layer 03) — Complete tier and up. The underpayment layer:
 * comparing the initial appraisal against the body-shop estimate, and building
 * an organized supplement request. This is the pack that addresses the single
 * loudest host grievance (approved-but-short).
 *
 * ⚠️ SME REVIEW FLAG: the estimate glossary and missing-item checklist explain
 * collision-repair line items in plain language. Before public launch, have
 * someone with real collision-estimating or body-shop experience review this
 * content (per the July 2026 product brief). The in-page callout tells buyers
 * to lean on their shop for interpretation, which keeps us honest meanwhile.
 */
export const VALUATION: Pack = {
  slug: "valuation",
  name: "Valuation Pack",
  access: "pro",
  blurb:
    "The appraisal came in under the shop's estimate. Find the gap, document it, request the difference.",
  tools: [
    // ------------------------------------------------------------------
    {
      slug: "gap-worksheet",
      name: "Valuation Gap Worksheet",
      tagline: "Both estimates, line by line, with the gap totaled for you.",
      minutes: "20 min",
      sections: [
        {
          kind: "intro",
          body: [
            "Enter each line item from the body shop's estimate, then the amount the initial appraisal allowed for it (zero if it was omitted entirely). The worksheet totals both columns, computes the gap, and flags your largest differences, which is exactly the order a supplement request should present them in.",
            "Everything you enter saves to your account and syncs across your devices. Export to CSV to attach the comparison to your supplement request.",
          ],
        },
        { kind: "interactive", component: "valuation-worksheet" },
        {
          kind: "callout",
          tone: "info",
          title: "What this is, and is not",
          body: "This organizes a comparison; it does not decide who is right. Some differences have legitimate explanations (parts sourcing, labor rates, overlap deductions). The Estimate Glossary explains the common categories, and your body shop can walk you through any line you do not understand. The goal is a clear, documented question, not an accusation.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "estimate-glossary",
      name: "Repair Estimate Glossary",
      tagline: "The line items that differ most often, in plain language.",
      minutes: "15 min read",
      sections: [
        {
          kind: "callout",
          tone: "info",
          title: "Read this with your shop, not instead of your shop",
          body: "This glossary is general education about how collision estimates are structured, written for hosts, and reviewed for plain-language accuracy rather than as professional estimating guidance. Your body shop's estimator interprets YOUR estimate. When a line confuses you, ask them; a good shop will walk you through it because the supplement helps them get paid too.",
        },
        {
          kind: "table",
          title: "Terms you will meet",
          headers: ["Term", "Plain meaning", "Why estimates differ on it"],
          rows: [
            ["Blend", "Painting into the adjacent panel so the new color fades invisibly into the old", "Appraisals sometimes allow paint only on the damaged panel; shops blend neighbors for color match, adding labor and materials"],
            ["Calibration", "Re-aiming the car's cameras and sensors (ADAS) after work near them", "A photo appraisal may not see that a bumper hides radar; calibration can be a large line a desk review omits"],
            ["Pre/post scan", "Plugging in before and after repair to read fault codes", "Increasingly standard at shops, not always in a first appraisal"],
            ["R&I (remove and install)", "Taking parts off to do the job right, then reinstalling them", "Photo estimates can miss how much must come off to reach the damage"],
            ["Paint materials", "The actual paint, clear, and supplies, billed separately from labor", "Allowances vary; materials on a blend job add up"],
            ["OEM vs. aftermarket vs. LKQ", "New from the maker vs. third-party new vs. recycled original", "Appraisal may price aftermarket or recycled where the shop quoted OEM; a real difference worth an explicit conversation"],
            ["Betterment", "A deduction because the repair leaves you better than before (new tire on worn tread)", "Legitimate concept, but the percentage applied is often discussable"],
            ["Overlap", "A deduction when two operations share setup work", "Correct in principle; occasionally applied twice or too aggressively"],
            ["Frame/structural time", "Work on the vehicle's structure, billed at a higher labor rate", "Whether damage is structural is a judgment a photo review can miss"],
          ],
        },
        {
          kind: "prose",
          title: "The pattern behind most gaps",
          body: [
            "Most valuation gaps are not one big disputed number; they are several medium ones: a missing calibration, paint on one panel instead of a blend, aftermarket pricing against an OEM quote, and reduced materials. Individually each looks small. The worksheet's job is to make the sum visible, because the sum is what you eat if nobody asks.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "missing-items",
      name: "Missing or Reduced Item Checklist",
      tagline: "The systematic sweep before you write the supplement.",
      minutes: "15 min",
      sections: [
        {
          kind: "intro",
          body: [
            "Sit with both documents and run every category. Check a line when you have compared it in both columns. This does not promise every difference gets approved; it guarantees no difference goes unnoticed.",
          ],
        },
        {
          kind: "checklist",
          id: "labor",
          title: "Labor operations",
          items: [
            "Every damaged panel on the shop estimate appears in the appraisal",
            "Repair vs. replace decisions match (or the difference is explained)",
            "R&I operations the shop listed are present",
            "Labor hours per operation compared, large differences noted",
            "Structural/frame time, if quoted, is present and at the right rate",
          ],
        },
        {
          kind: "checklist",
          id: "parts",
          title: "Parts",
          items: [
            "Every part on the shop estimate appears in the appraisal",
            "Part type matches: OEM vs. aftermarket vs. recycled, per line",
            "Part prices compared; sourcing differences noted for the supplement",
            "One-time-use parts (clips, fasteners, moldings) included",
          ],
        },
        {
          kind: "checklist",
          id: "paint",
          title: "Paint and refinish",
          items: [
            "Refinish hours per panel compared",
            "Blend operations on adjacent panels present where the shop quoted them",
            "Paint materials allowance compared",
            "Color match / tint time included if quoted",
          ],
        },
        {
          kind: "checklist",
          id: "tech",
          title: "Technology and safety",
          items: [
            "Pre-repair and post-repair scans present",
            "Calibration operations present where the shop quoted them (bumpers, windshields, mirrors often hide sensors)",
          ],
        },
        {
          kind: "checklist",
          id: "adjustments",
          title: "Deductions and fees",
          items: [
            "Betterment deductions identified and the percentage understood",
            "Overlap deductions identified and sanity-checked with the shop",
            "Taxes and fees consistent between documents",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "supplement-builder",
      name: "Supplement Request Builder",
      tagline: "A structured request for additional review, assembled in an hour.",
      minutes: "60 min",
      policySensitive: true,
      sections: [
        {
          kind: "intro",
          body: [
            "A supplement request is not an argument; it is an organized packet that makes saying yes easy and saying no specific. Four pieces: a cover message, the line-item comparison, the shop's documentation, and an evidence index.",
          ],
        },
        {
          kind: "steps",
          title: "Assemble the packet",
          items: [
            { action: "Export the comparison.", minutes: "5 min", detail: "From the Valuation Gap Worksheet: CSV or a clean screenshot, largest differences first." },
            { action: "Collect the shop's paper.", minutes: "15 min", detail: "The itemized estimate on shop letterhead, plus, where the gap justifies it, a one-paragraph note from the estimator on WHY the disputed operations are necessary (calibration required by position of sensors, blend required for color match). Ask; shops write these routinely." },
            { action: "Write the cover message.", minutes: "15 min", detail: "Use the template below. Specific, unemotional, and scoped to the differences, not the whole claim." },
            { action: "Index the attachments.", minutes: "10 min", detail: "Number every attachment and reference the numbers in the message. A reviewer who can find things approves things." },
            { action: "Send through the claim thread and log it.", minutes: "5 min", detail: "Keep it in the existing claim channel so the record stays in one place. Log the send in your Communication Log with a follow-up date one week out." },
          ],
        },
        {
          kind: "template",
          id: "supplement-cover",
          title: "Cover message (copy and fill in)",
          body: `Hello, thank you for the appraisal on claim [CLAIM NUMBER].

After reviewing it against the repair facility's itemized estimate
(attached, item 1), there is a difference of [GAP AMOUNT] I would like
reviewed. The largest differences are:

1. [OPERATION] - shop: [AMOUNT], appraisal: [AMOUNT or "not included"].
   [One factual sentence, e.g. "The estimator notes the bumper houses
   parking sensors requiring calibration after replacement; see item 2."]
2. [OPERATION] - shop: [AMOUNT], appraisal: [AMOUNT].
   [One factual sentence.]
3. [OPERATION] - shop: [AMOUNT], appraisal: [AMOUNT].
   [One factual sentence.]

Attached:
1. Repair facility itemized estimate ([SHOP NAME], [DATE])
2. Estimator's note on [DISPUTED OPERATIONS]
3. Line-item comparison (full list of differences)

Could you review these items or let me know what additional
documentation would help? Happy to arrange a reinspection if that is
the fastest path. Thank you.`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "What sinks supplements",
          body: "Round-number demands with no line items. Anger. Re-arguing whether the damage happened (that phase is over; this phase is about cost). Ten attachments with no index. And silence afterward: a supplement with no follow-up cadence is a message, not a process. Set the one-week follow-up before you close the laptop.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "valuation-example",
      name: "Completed Valuation Example",
      tagline: "A worked gap, from two documents to a sent supplement.",
      minutes: "10 min read",
      sections: [
        {
          kind: "callout",
          tone: "info",
          title: "Illustrative, not a promised outcome",
          body: "The numbers below mirror publicly documented host disputes and standard estimate structure. They are for teaching the method. No outcome is implied or promised; supplements are requests, and the platform decides.",
        },
        {
          kind: "table",
          title: "The two documents, compared",
          headers: ["Line item", "Shop estimate", "Initial appraisal", "Difference"],
          rows: [
            ["Rear bumper cover, replace (OEM)", "$1,180", "$740 (aftermarket)", "$440"],
            ["Bumper R&I + one-time fasteners", "$310", "$180", "$130"],
            ["Parking sensor calibration", "$420", "not included", "$420"],
            ["Refinish bumper", "$680", "$680", "$0"],
            ["Blend quarter panel", "$540", "not included", "$540"],
            ["Paint materials", "$390", "$210", "$180"],
            ["Pre/post repair scan", "$150", "not included", "$150"],
            ["TOTALS (these lines)", "$3,670", "$1,810", "$1,860"],
          ],
        },
        {
          kind: "prose",
          title: "How the supplement framed it",
          body: [
            "Three items carried the request: calibration (with the estimator's note that the bumper houses four parking sensors), the blend (with the note on metallic color match), and the OEM vs. aftermarket difference (raised as an explicit question, not a demand). The smaller lines rode along in the full comparison attachment without individual argument.",
            "Notice the shape: the host never claimed the appraiser was wrong about everything. The packet asked a specific, documented question about the three largest lines and made the reviewer's job easy. That shape is the whole method.",
          ],
        },
      ],
    },
  ],
};
