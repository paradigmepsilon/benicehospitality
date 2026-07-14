import type { Pack } from "./types";

/**
 * Follow-Up Pack (Layer 04) — Complete tier and up. The stuck-claim layer:
 * communication tracking, professional escalation, downtime economics, and
 * the honest call on which claims are worth pursuing.
 */
export const FOLLOWUP: Pack = {
  slug: "followup",
  name: "Follow-Up Pack",
  access: "pro",
  blurb:
    "Track every contact and promise, escalate professionally, and know when a claim is not worth ten more hours.",
  tools: [
    // ------------------------------------------------------------------
    {
      slug: "comms-log",
      name: "Claim Communication Log",
      tagline: "Dates, names, promises, and the next follow-up, in one place.",
      minutes: "2 min per entry",
      sections: [
        {
          kind: "intro",
          body: [
            "A claim that lives in scattered emails and half-remembered calls cannot be escalated. One that reads 'on [DATE], [NAME] promised [X] by [DATE], and it did not happen' escalates itself. Log every contact the day it happens. Entries stay on this device; export CSV for your claim folder.",
          ],
        },
        { kind: "interactive", component: "comms-log" },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "script-library",
      name: "Follow-Up Script Library",
      tagline: "Eight professional messages for the eight ways claims stall.",
      minutes: "2 min each",
      sections: [
        {
          kind: "intro",
          body: [
            "Every message is calm, short, and ends with a specific question, because specific questions require answers. Copy, fill the brackets, send in the existing claim thread, log it.",
          ],
        },
        {
          kind: "template",
          id: "no-ack",
          title: "1 · No acknowledgment received",
          context: "Several business days after filing, no claims contact yet.",
          body: `Hello, following up on claim [NUMBER] for trip [TRIP], submitted [DATE]. I have not yet been contacted about next steps. Could you confirm the claim is open, whether an associate is assigned, and the expected timeline? I want to be sure nothing is waiting on me. Thank you.`,
        },
        {
          kind: "template",
          id: "doc-submitted",
          title: "2 · Requested document submitted",
          context: "Same day you send anything they asked for.",
          body: `Hello, the [DOCUMENT] requested on [DATE] is attached. That completes everything requested so far on claim [NUMBER]. Could you confirm receipt and let me know the next step and its expected timing? Thank you.`,
        },
        {
          kind: "template",
          id: "missed-callback",
          title: "3 · Promised callback missed",
          context: "The day after a promised contact does not happen.",
          body: `Hello, on [DATE], [NAME] indicated I would hear back about [TOPIC] by [PROMISED DATE]. I have not received an update. Could you let me know the current status of claim [NUMBER] and a revised date I can expect? Thank you.`,
        },
        {
          kind: "template",
          id: "clarification",
          title: "4 · Clarification needed",
          context: "When a decision or request does not make sense to you.",
          body: `Hello, regarding claim [NUMBER]: could you help me understand [THE SPECIFIC ITEM]? Specifically, [ONE PRECISE QUESTION]. I want to respond with the right documentation rather than guess. Thank you.`,
        },
        {
          kind: "template",
          id: "supplement-status",
          title: "5 · Supplement status request",
          context: "One week after a supplement with no substantive response.",
          body: `Hello, following up on the supplement request submitted [DATE] on claim [NUMBER], covering [N] line items totaling [AMOUNT]. Could you confirm it is under review and the expected decision timeline? If additional documentation from the repair facility would help, I can provide it promptly. Thank you.`,
        },
        {
          kind: "template",
          id: "reinspection",
          title: "6 · Reinspection request",
          context: "When photos are not settling a physical disagreement.",
          body: `Hello, given the difference between the appraisal and the repair facility's estimate on claim [NUMBER], would an in-person reinspection of the vehicle be possible? The vehicle is available at [LOCATION/SHOP]. It may resolve the open items faster than further document exchange. Thank you.`,
        },
        {
          kind: "template",
          id: "escalation",
          title: "7 · Supervisor or escalation request",
          context: "Use after the escalation map says escalate, not before.",
          body: `Hello, I would like to request escalation of claim [NUMBER]. Summary: filed [DATE], [KEY EVENTS WITH DATES]. As of today, [THE SPECIFIC UNRESOLVED ITEM] remains open, and the most recent committed date of [DATE] has passed. Could this be reviewed by a supervisor or senior associate? My communication log and documentation are complete and available. Thank you.`,
        },
        {
          kind: "template",
          id: "final-confirmation",
          title: "8 · Final written confirmation",
          context: "When a resolution is reached verbally or informally.",
          body: `Hello, confirming my understanding of the resolution on claim [NUMBER]: [AMOUNT] to be paid for [SCOPE], expected by [DATE]. Please correct me if any part of that is inaccurate; otherwise I will treat this as the final agreed outcome. Thank you for your help.`,
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "escalation-map",
      name: "Escalation Map",
      tagline: "What kind of stuck is this? The answer picks your next move.",
      minutes: "10 min",
      sections: [
        {
          kind: "intro",
          body: [
            "Stalled claims fail in one of four ways. Diagnose which one you have; each has a different correct next step, and using the wrong one wastes weeks.",
          ],
        },
        {
          kind: "steps",
          title: "Diagnose, then act",
          items: [
            {
              action: "Is information missing?",
              detail: "They asked for something you have not sent, or you assumed they had something they do not. Fix: send it today with Script 2. This is the most common stall and the only one that is your fault.",
            },
            {
              action: "Is it an evidence problem?",
              detail: "They have everything and are unconvinced the damage is trip-related. Fix: one targeted addition (the pre-trip photo of that exact panel, the witness note), not a re-send of everything. If no such evidence exists, go to the Decision Matrix, honestly.",
            },
            {
              action: "Is it a valuation problem?",
              detail: "Approved, but short. This is not a follow-up problem at all. Fix: the Valuation Pack, worksheet to supplement. Do not argue valuation in follow-up messages; build the packet.",
            },
            {
              action: "Is it a communication problem?",
              detail: "Nothing is disputed; nobody is answering. Fix: the cadence below plus Scripts 1, 3, and 5. Escalate with Script 7 only after two committed dates have passed, documented in your log.",
            },
          ],
        },
        {
          kind: "prose",
          title: "The cadence",
          body: [
            "Respond to them same-day, always. Follow up the day after any missed committed date. Otherwise follow up weekly, same day each week, in the same thread. More than weekly reads as pressure and gets you nothing; less reads as abandonment and gets you archived.",
            "And know when to stop repeating yourself: if the same unsupported request has been made and declined twice, the third identical message will not land differently. Either bring new documentation, request reinspection (Script 6), escalate (Script 7), or make the Decision Matrix call.",
          ],
        },
        {
          kind: "callout",
          tone: "gold",
          title: "Escalation is a privilege your log pays for",
          body: "An escalation request that cites dates, names, and missed commitments gets read seriously. One that says 'nobody ever helps me' gets a sympathy reply. The Communication Log is what turns frustration into leverage.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "downtime-tracker",
      name: "Downtime Cost Tracker",
      tagline: "What idle days are actually costing, stage by stage.",
      minutes: "2 min per update",
      sections: [
        {
          kind: "intro",
          body: [
            "The repair gap is only half the loss; the car earning $0 is the other half. Track when the vehicle went down, which stage it is waiting on, and what each stage cost in days. The stage view matters: it shows whether you are waiting on the shop, on parts, or on the claim, and that tells you where this week's follow-up goes. Your entries sync to your account; export CSV anytime.",
          ],
        },
        { kind: "interactive", component: "downtime-tracker" },
        {
          kind: "callout",
          tone: "info",
          title: "Honest framing",
          body: "No documentation system controls how long a repair or review takes. What it controls: claims never stalling because YOU were the bottleneck, and follow-ups aimed at the stage actually burning days.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "economics-worksheet",
      name: "Claim Economics Worksheet",
      tagline: "The full business cost of this claim, and of fighting it.",
      minutes: "10 min",
      sections: [
        {
          kind: "intro",
          body: [
            "True claim cost = repair shortfall + deductible + lost net rental income + your administrative time. Run the numbers before deciding how hard to push; a $400 gap is not worth 15 hours, and a $3,000 gap is not worth abandoning because you are tired. The worksheet keeps that decision cold.",
          ],
        },
        { kind: "interactive", component: "economics" },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "decision-matrix",
      name: "Difficult-Claim Decision Matrix",
      tagline: "Where evidence thresholds are high, and what not to assume.",
      minutes: "15 min read",
      policySensitive: true,
      sections: [
        {
          kind: "intro",
          body: [
            "Not every claim is worth pursuing, and no tool changes that. Experienced hosts in every community say versions of the same thing: certain categories rarely pay without exceptional evidence. This matrix will not make hard categories payable. It tells you the evidence threshold honestly so you can make a fast, informed call.",
          ],
        },
        {
          kind: "table",
          title: "The matrix",
          headers: ["Category", "Evidence threshold", "Common weakness", "Ask yourself"],
          rows: [
            [
              "Smoking / odor",
              "Very high. Physical evidence (burns, ash, residue) photographed immediately; smell alone rarely carries",
              "Reported late; no physical trace; cleaned before documenting",
              "Do I have photographs of physical evidence, taken at return, before any cleaning?",
            ],
            [
              "Wear and tear",
              "Usually excluded outright: gradual tire wear, small chips, seat wear",
              "It is genuinely wear, and filing it burns credibility for future claims",
              "Would a neutral stranger call this damage, or use?",
            ],
            [
              "Mechanical",
              "High. Needs a diagnostic tying the failure to trip misuse, not age or mileage",
              "No baseline of pre-trip condition; failure consistent with normal wear",
              "Do I have a shop diagnosis that names a cause, in writing?",
            ],
            [
              "Tires and wheels",
              "Moderate, IF wheel-face baselines exist. Curb rash is winnable with the arc shot",
              "No pre-trip wheel photos; rash could be from any of the last five trips",
              "Does my 12-shot set from THIS trip show this wheel clean?",
            ],
            [
              "Interior damage",
              "Moderate. Stains, burns, and tears are winnable with interior baselines",
              "No pre-trip interior sweep; discovered after another trip ran",
              "Is this provably from this trip and not the one before?",
            ],
            [
              "Pre-existing disputes",
              "Decided almost entirely by baseline quality and timestamps",
              "Baseline photos too old, too few, or missing the exact area",
              "Is my before-photo of this exact area recent and sharp?",
            ],
          ],
        },
        {
          kind: "prose",
          title: "Making the call",
          body: [
            "Green light: threshold met, gap material, file with confidence. Yellow: threshold partially met; file inside the window anyway (filing is nearly free and the window will not reopen), but cap the hours you spend fighting afterward. Red: threshold unmet in a category above; document for your own records, skip the fight, and fix the baseline habit that left you exposed. The Proof Pack exists so the next one is green.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "closeout-checklist",
      name: "Claim Closeout Checklist",
      tagline: "Extract the money, the records, and the lesson.",
      minutes: "15 min",
      sections: [
        {
          kind: "checklist",
          id: "closeout",
          items: [
            "Final amount confirmed in writing (Script 8 if it was verbal)",
            "Payment received and matched against the confirmed amount",
            "Repair invoices and payment records saved to folder 09",
            "Vehicle returned to service; downtime tracker closed with total days",
            "Total economics recorded: shortfall, deductible, lost income, hours",
            "Process failure identified: what would have made this claim faster or fuller?",
            "The fix applied to your SOP or checklist, today, not someday",
            "Claim folder archived complete; log exported and filed",
          ],
        },
        {
          kind: "callout",
          tone: "gold",
          title: "The last question is the profitable one",
          body: "Every closed claim teaches one specific thing: a missing shot, a late filing, an unlogged promise, an unwinnable category you fought anyway. Hosts who bank the lesson stop repeating the expensive ones. That compounding is the real product.",
        },
      ],
    },
  ],
};
