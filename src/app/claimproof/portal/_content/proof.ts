import type { Pack } from "./types";

/**
 * Proof Pack (Layer 01) — Complete tier and up. The prevention layer: the
 * repeatable pre-trip and return documentation habit that makes every future
 * claim winnable before it exists.
 */
export const PROOF: Pack = {
  slug: "proof",
  name: "Proof Pack",
  access: "pro",
  blurb:
    "Establish the vehicle's condition before and after every trip, the same way, every time.",
  tools: [
    // ------------------------------------------------------------------
    {
      slug: "pretrip-standard",
      name: "Pre-Trip Photo Standard",
      tagline: "The 12-shot baseline that answers 'it was already like that.'",
      minutes: "4 min per trip",
      sections: [
        {
          kind: "intro",
          body: [
            "Every claim you will ever file is won or lost by whether this baseline exists. Four minutes, twelve shots, same order every time. Same order matters: it becomes automatic, and automatic is what survives a busy turnaround day.",
          ],
        },
        {
          kind: "steps",
          title: "The 12 shots, in order",
          items: [
            { action: "1-4: Four corners, wide.", detail: "Front-left, front-right, rear-left, rear-right, from 10 to 12 feet. Whole car plus surroundings in frame." },
            { action: "5-8: Four sides, straight on.", detail: "Front, rear, driver side, passenger side, perpendicular from 6 to 8 feet." },
            { action: "9: Wheels and tires.", detail: "One arc walking the car, catching each wheel face. Curb rash is the most disputed damage class you will deal with; this shot decides those disputes." },
            { action: "10: Windshield and glass.", detail: "Standing at the front, angled to catch chips. Existing chips WILL grow; you want the record of what existed today." },
            { action: "11: Interior sweep.", detail: "Front seats, rear seats, floors, trunk. One video walkthrough also works if your storage allows it." },
            { action: "12: Odometer and fuel.", detail: "One frame with both visible ties the whole set to this trip." },
          ],
        },
        {
          kind: "prose",
          title: "Existing damage and high-risk areas",
          body: [
            "Anything already scratched, dented, or chipped gets its own close-up set (full panel, close-up, angle) filed under the vehicle's permanent 'existing damage' record. Documenting existing damage protects you twice: guests cannot be blamed for it, and guests cannot claim NEW damage was 'already there'.",
            "High-risk areas deserve extra care: front and rear bumpers, wheel faces, door edges, the trunk sill, and the roof line above doors (parking garage scrapes).",
          ],
        },
        {
          kind: "checklist",
          id: "minimum-standard",
          title: "The minimum acceptable photo standard",
          items: [
            "Sharp at full-screen zoom",
            "Panel fills the frame on straight-on shots",
            "No sun blowing out the panel; reflection moved off the damage line",
            "Shot with the phone camera app (metadata intact), never a screenshot",
            "Taken the same day the trip starts, ideally within hours of pickup",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "return-sop",
      name: "Return Inspection SOP",
      tagline: "Fast enough for a tight turnaround, thorough enough to catch it today.",
      minutes: "6 min per return",
      policySensitive: true,
      sections: [
        {
          kind: "callout",
          tone: "warn",
          title: "Why this happens at return, not tomorrow",
          body: "The report window runs from trip end. Damage found tomorrow may be damage you can no longer claim. The return inspection is not quality control; it is the claim deadline in disguise.",
        },
        {
          kind: "steps",
          items: [
            { action: "Walkaround, same path as pre-trip.", minutes: "2 min", detail: "Four corners, four sides, same order as the 12-shot. You are not photographing yet; you are LOOKING, with your pre-trip baseline fresh on your phone for comparison." },
            { action: "High-risk points, by hand and eye.", minutes: "1 min", detail: "Run a hand along bumper corners and wheel arches. Crouch at each wheel. Sight down the body lines from the front and rear; dents show in the line before they show in the paint." },
            { action: "Interior and smell check.", minutes: "1 min", detail: "Seats, floors, trunk. Smell is evidence too: smoke or residue gets documented immediately (photos of any physical evidence, a dated note for the smell itself), because odor claims are the hardest class to win and stale reports are unwinnable." },
            { action: "Compare against pre-trip photos.", minutes: "1 min", detail: "Anything that looks different gets the full Damage Photo Protocol on the spot. Not sure whether that mark was there? The baseline answers it in ten seconds. That is what it is for." },
            { action: "Escalation decision.", minutes: "1 min", detail: "New damage found: stop the turnaround, run the Emergency Quick Start now, not after the next guest. No damage: shoot the 12-shot set for the NEXT trip while you are standing there." },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "five-minute-card",
      name: "Five-Minute Inspection Card",
      tagline: "The whole discipline on one printable card.",
      minutes: "reference",
      sections: [
        {
          kind: "intro",
          body: [
            "Print this and put it where you stage your cars. It is the compressed version of the Pre-Trip Standard and Return SOP: the one page that runs the system when you are busy, tired, or training someone.",
          ],
        },
        {
          kind: "template",
          id: "card",
          title: "The card (print this page)",
          body: `BEFORE EVERY TRIP (4 min)
  [ ] 4 corners wide
  [ ] 4 sides straight-on
  [ ] Wheels arc
  [ ] Glass
  [ ] Interior sweep
  [ ] Odometer + fuel
  [ ] New close-ups of any existing damage

AT EVERY RETURN (6 min)
  [ ] Walkaround, same path
  [ ] Hands on bumpers + wheel arches
  [ ] Sight down the body lines
  [ ] Interior + smell
  [ ] Compare to pre-trip photos
  [ ] Different? PHOTOS NOW + report inside the window
  [ ] Clean? Shoot next trip's baseline now

THE RULES
  Clock runs from TRIP END, not discovery.
  No before-photo = no proof.
  Shoot first. Clean later.`,
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "evidence-audit",
      name: "Evidence Quality Audit",
      tagline: "Score your documentation like the stranger deciding your claim would.",
      minutes: "10 min",
      sections: [
        {
          kind: "intro",
          body: [
            "Run this monthly on a random recent trip's photo set, or on any live claim before you submit. Score each dimension 0 (absent), 1 (weak), or 2 (strong). It is the same lens a reviewer applies; better to apply it yourself first.",
          ],
        },
        {
          kind: "table",
          title: "The six dimensions",
          headers: ["Dimension", "2 looks like", "0 looks like"],
          rows: [
            ["Complete", "All 12 baseline shots plus existing-damage close-ups", "A few angles, whole panels missing"],
            ["Clear", "Sharp at full zoom, damage obvious unaided", "Blur, glare on the exact spot that matters"],
            ["Consistent", "Same angles pre and post, directly comparable", "Before and after shot so differently they cannot be compared"],
            ["Contextual", "Close-ups anchored to wide shots of this car", "Orphan close-ups that could be any car"],
            ["Timely", "Shot at pickup and return, same day", "'Baseline' from three weeks ago, discovery photos from two days after return"],
            ["Labeled", "Dated filenames in the claim-folder structure", "IMG_4211 through IMG_4283 in a camera roll"],
          ],
        },
        {
          kind: "prose",
          title: "Scoring",
          body: [
            "10 to 12: your paperwork wins ties. 7 to 9: fix the weak dimension this week; it is usually Consistent or Labeled, and both are free to fix. 6 or below: your next claim is currently a coin flip. Start with Complete and Timely; they are the two a reviewer cannot forgive.",
          ],
        },
      ],
    },
  ],
};
