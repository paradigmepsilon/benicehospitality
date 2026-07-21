import type { Pack } from "./types";

/**
 * Emergency Pack: Claim Proof Core ($47 tier, included in
 * all tiers). For the host who found damage TODAY. Speed, evidence, and
 * submission. Long-term prevention and valuation work live in the other packs.
 */
export const EMERGENCY: Pack = {
  slug: "emergency",
  name: "Emergency Filing",
  access: "core",
  blurb:
    "Damage found today. Turn it into an organized, timely claim file before the window closes.",
  tools: [
    // ------------------------------------------------------------------
    {
      slug: "quick-start",
      name: "Emergency Quick Start",
      tagline: "The one-screen sequence. Do these seven things, in this order.",
      minutes: "20 min",
      policySensitive: true,
      sections: [
        {
          kind: "callout",
          tone: "warn",
          title: "The clock is measured from trip end, not from discovery.",
          body: "Turo's damage-report window is 24 hours from the moment the trip ended. If you are inside that window, everything below matters. If you are unsure when the trip ended, open the app and check now, then come back.",
        },
        {
          kind: "steps",
          id: "quick-start-steps",
          items: [
            {
              action: "Stop. Do not move or clean the vehicle.",
              minutes: "0 min",
              detail:
                "The car's current state is your evidence. Moving it changes lighting and context; cleaning it destroys residue, glass, and scuff transfer you may need. Leave it exactly where it is until photos are done.",
              subtasks: [
                "Leave the vehicle exactly where it is",
                "Do not wipe, wash, or touch the damaged area",
                "Do not drive it to a better-lit spot",
              ],
              mistakes: [
                "Wiping the panel 'to see the damage better' before photographing it",
                "Driving it to a better-lit spot first",
              ],
            },
            {
              action: "Capture wide context shots.",
              minutes: "3 min",
              detail:
                "Stand back far enough that the whole vehicle and its surroundings are in frame. Shoot all four corners of the car. These prove which car, where, and when, and they anchor every close-up you take next.",
              subtasks: [
                "Front-left corner, whole car + surroundings in frame",
                "Front-right corner",
                "Rear-left corner",
                "Rear-right corner",
              ],
            },
            {
              action: "Capture detail shots of the damage.",
              minutes: "5 min",
              detail:
                "Move in stages: full panel, then half panel, then close-up. Include a common object for scale (a key, a card) in at least one shot. Shoot the same damage from three angles so reflections cannot hide it.",
              subtasks: [
                "Full-panel shot of the damaged area",
                "Half-panel shot",
                "Close-up of the damage itself",
                "One shot with a key or card for scale",
                "Same damage from three different angles",
              ],
              mistakes: [
                "Only shooting extreme close-ups that could be any car anywhere",
                "One angle only, where glare hides the dent",
              ],
            },
            {
              action: "Photograph the odometer, fuel level, and VIN area.",
              minutes: "2 min",
              detail:
                "These tie the photo set to this vehicle and this moment. Your phone's timestamp and location metadata do the rest, so do not edit or re-export the photos.",
              subtasks: [
                "Odometer reading",
                "Fuel/charge gauge",
                "VIN (dash plate or door jamb)",
                "Confirm you have NOT edited or re-exported any photo",
              ],
            },
            {
              action: "Record the trip details while they are in front of you.",
              minutes: "3 min",
              detail:
                "Trip number, guest name, trip end date and time, where the vehicle was returned, when you discovered the damage. Write it in the Incident Summary Builder, not from memory later.",
              subtasks: [
                "Trip number",
                "Guest name",
                "Trip end date and time",
                "Where the vehicle was returned",
                "When you discovered the damage",
              ],
            },
            {
              action: "Preserve every message.",
              minutes: "2 min",
              detail:
                "Screenshot the full message thread with the guest, including timestamps. Do not delete anything, even messages that feel irrelevant or unflattering. Gaps in a thread read worse than awkward messages.",
              subtasks: [
                "Screenshot the full guest thread top to bottom",
                "Confirm timestamps are visible in the screenshots",
                "Delete nothing from the thread",
              ],
            },
            {
              action: "Run the Submission Checklist, then file.",
              minutes: "5 min",
              detail:
                "Open the Submission Checklist tool, confirm every line, and submit through the app while you are still inside the window. Filing a complete claim one hour early beats filing a perfect one an hour late.",
              subtasks: [
                "Complete every line of the Submission Checklist",
                "Submit the claim through the Turo app",
                "Confirm you filed inside the 24-hour window",
              ],
              mistakes: [
                "Waiting for a repair estimate before reporting. Report first; estimates come later.",
                "Messaging the guest to negotiate before the claim exists",
              ],
            },
          ],
        },
        {
          kind: "callout",
          tone: "gold",
          title: "Already past the 24-hour window?",
          body: "We will not pretend this tool can reverse a hard eligibility rule. Document everything anyway using the same steps: a complete file still supports a direct-resolution conversation with the guest, an insurance claim of your own, and your records. Then read the Difficult-Claim Decision Matrix before investing more hours.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "action-timeline",
      name: "24-Hour Action Timeline",
      tagline: "First 15 minutes through day 7, as a running checklist.",
      minutes: "reference",
      policySensitive: true,
      sections: [
        {
          kind: "intro",
          body: [
            "Work top to bottom. Each band assumes the ones above it are done. Check items off as you go; your progress saves to your account and syncs across your devices.",
          ],
        },
        {
          kind: "checklist",
          id: "first-15",
          title: "First 15 minutes",
          items: [
            "Confirm the exact trip end time in the app",
            "Vehicle secured, not moved, not cleaned",
            "Wide context shots: all four corners, surroundings visible",
            "Detail shots: full panel, half panel, close-up, three angles",
            "Scale reference in at least one close-up",
            "Odometer, fuel level, and VIN photographed",
          ],
        },
        {
          kind: "checklist",
          id: "first-hour",
          title: "First hour",
          items: [
            "Guest message thread screenshotted end to end",
            "Trip number, guest name, and return location written down",
            "Incident Summary drafted (facts only, no accusations)",
            "Pre-trip photos of the same panels located and set aside",
            "Photos backed up off the phone (cloud or computer)",
          ],
        },
        {
          kind: "checklist",
          id: "first-4-hours",
          title: "First four hours",
          items: [
            "Claim file folder created using the Claim File Index structure",
            "Evidence Sufficiency Scorecard run; gaps captured while you still can",
            "Any witnesses or delivery/cleaning staff statements noted with names and times",
          ],
        },
        {
          kind: "checklist",
          id: "before-submission",
          title: "Before submission",
          items: [
            "Submission Checklist completed line by line",
            "Incident Summary finalized and saved as its own document",
            "Every photo readable at full size, none blurry",
            "Dates and times consistent across summary, photos, and messages",
          ],
        },
        {
          kind: "checklist",
          id: "after-submission",
          title: "After submission",
          items: [
            "Submission confirmation screenshotted and saved to the claim folder",
            "Claim or reference number recorded in the Incident Summary",
            "Communication Log started with the submission as entry one",
          ],
        },
        {
          kind: "checklist",
          id: "first-7-days",
          title: "First seven days",
          items: [
            "Day 1 to 3: watch for the claims associate's first contact; log it when it lands",
            "Every requested document sent same day, and logged",
            "Every promised callback recorded with a date, and followed up the day after it is missed",
            "No venting in writing. Every message you send is calm, factual, and short",
            "Day 7: if there has been no substantive contact, send the status-request script from the Follow-Up pack",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "accident-tow",
      name: "Accident & Tow Response",
      tagline: "The car was in a crash or got towed. This is a different play than a scratch at drop-off.",
      minutes: "25 min",
      policySensitive: true,
      sections: [
        {
          kind: "callout",
          tone: "warn",
          title: "This is not the scratch-at-drop-off flow.",
          body: "When the car was wrecked or hauled off on a truck, the order changes. People and safety come first. The accident gets reported right away, not at the next drop-off. And the car has already moved, so the whole 'do not move the vehicle' rule does not apply. Work this tool instead, then come back to the photo and submission tools once the car is somewhere you can shoot it.",
        },
        {
          kind: "callout",
          tone: "gold",
          title: "Who does what",
          body: "Your guest was the driver, so the accident report, the police report, and the on-scene details are theirs to make and yours to collect. Your job as the host is to make sure the guest reported it, to report the damage yourself inside the window, and to get your car recovered before it disappears into storage fees. This tool covers your side.",
        },
        {
          kind: "steps",
          id: "accident-steps",
          items: [
            {
              action: "People first. Confirm everyone is safe.",
              minutes: "0 min",
              detail:
                "Before anything about the car, confirm your guest and anyone else involved are safe and out of traffic. If anyone is hurt, the call is 911, not you. A car is replaceable and insured. Nothing in this tool comes before a person's safety.",
              subtasks: [
                "Confirm the guest is safe and out of danger",
                "If anyone is injured, 911 has already been called",
                "Do not ask the guest to do anything unsafe to protect the car",
              ],
            },
            {
              action: "Make sure the accident is reported to Turo now.",
              minutes: "5 min",
              detail:
                "An accident is reported immediately, not at trip end. Your guest should report it through the app and can call Turo support at 1-888-391-0460. Confirm they have done it. If they have not, tell them to, and report the damage from your side too. Reporting an accident is separate from the 24-hour damage window, and it is expected right away.",
              subtasks: [
                "Confirm the guest reported the accident in the Turo app",
                "Turo host and guest support line: 1-888-391-0460",
                "Note the date and time the accident was reported",
              ],
              mistakes: [
                "Assuming the guest reported it. Confirm, do not assume.",
                "Waiting for the trip to end before anything is reported to Turo",
              ],
            },
            {
              action: "Collect the scene facts from the guest.",
              minutes: "10 min",
              detail:
                "In the US, a collision requires a police report, so get the report or the report number. Have the guest send you the other driver's name, insurance, and plate, any witness contact, and photos of the scene, all vehicles, plates, and surroundings while they are still there. You cannot go back to the scene later. They can.",
              subtasks: [
                "Police report filed; get the report number",
                "Other driver name, insurance carrier, and plate",
                "Any witness names and phone numbers",
                "Scene photos: all vehicles, plates, wide surroundings, road",
                "Where the accident happened (address or cross streets)",
              ],
              mistakes: [
                "Letting the guest leave the scene with no photos and no police report",
                "Trying to assign blame in writing before facts are gathered",
              ],
            },
            {
              action: "Pin down the tow. Get the yard details before the car is lost.",
              minutes: "5 min",
              detail:
                "Find out who arranged the tow: Turo roadside, the police, or a third party. Write down the tow company, the yard address and phone, and what it takes to release the car. Storage fees start the day the car arrives and do not stop. A car you cannot locate is a car you are paying for daily. After an accident, Turo does not charge the guest for the tow unless the accident came from a prohibited use.",
              subtasks: [
                "Who ordered the tow (Turo roadside / police / third party)",
                "Tow company name and phone",
                "Yard address and phone",
                "What is required to release the car (ID, fees, authorization)",
                "Date the car arrived at the yard (the storage clock)",
              ],
              mistakes: [
                "Not writing down the yard before the guest moves on",
                "Letting the car sit in storage for days while fees pile up",
              ],
            },
            {
              action: "Recover the car and photograph it at the yard.",
              minutes: "reference",
              detail:
                "Get the car released as soon as you can. At the yard, shoot it with the standard Damage Photo Protocol: four corners wide, every side, the damage at three distances and three angles, plus the odometer and VIN. The car being at a tow lot instead of your driveway does not change what a strong photo set looks like.",
              subtasks: [
                "Car released from the yard, or a pickup date set",
                "Full Photo Protocol shot at the yard",
                "Storage fees and tow invoice saved to the claim folder",
              ],
            },
            {
              action: "File the damage claim with the accident file attached.",
              minutes: "reference",
              detail:
                "Report the damage through Turo the same as any claim, and attach the accident file: police report, scene photos, tow and yard records, and your yard photo set. Run the Submission Checklist before you file. Then start the Communication Log, because an accident claim has more moving parts and more people to chase than a scratch.",
              subtasks: [
                "Damage reported through Turo within the window",
                "Police report and scene photos attached",
                "Tow and storage records attached",
                "Submission Checklist completed line by line",
                "Communication Log started with the report as entry one",
              ],
            },
          ],
        },
        {
          kind: "checklist",
          id: "tow-logistics",
          title: "Tow-yard quick capture",
          intro:
            "The five things to have written down before the car has been at the yard 24 hours.",
          items: [
            "Tow company name and phone",
            "Yard address and phone",
            "What it takes to release the car (ID, fees, authorization)",
            "Date the car arrived (storage fees run from here)",
            "Retrieval date set, and photos taken at the yard",
          ],
        },
        {
          kind: "template",
          id: "accident-report-note",
          title: "Accident summary (copy and fill in)",
          context:
            "Your factual record of the accident, to sit at the front of the claim file. Facts only, no blame.",
          body: `ACCIDENT SUMMARY

Vehicle: [YEAR MAKE MODEL, plate or last 6 of VIN]
Trip: [TRIP NUMBER], [START DATE/TIME] to [END DATE/TIME]
Guest: [GUEST FIRST NAME + LAST INITIAL]

Accident:
[Date, time, and location as reported by the guest. Example:
"Guest reported a collision on [DATE] at approx [TIME] at [LOCATION]."]

Reported to Turo: [DATE, TIME], [by guest in app / support call]
Police report: [NUMBER, or "filed with [DEPARTMENT]"]

Other party:
[Name, insurance carrier, plate, if any. "Single vehicle" if none.]

Tow and storage:
[Tow company, yard address and phone, date car arrived,
release requirements.]

Evidence attached:
- Scene photos ([COUNT])
- Yard photos ([COUNT]), taken [DATE]
- Police report
- Tow invoice / storage records
- Guest message thread ([COUNT] screenshots)

Actions taken:
[Confirmed guest reported the accident, located and recovered the
vehicle on [DATE], photographed at the yard, reported the damage
within the window on [DATE, TIME].]`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "The downtime is the real cost.",
          body: "In the US, Turo hosts do not get loss-of-use or lost-income reimbursement while a car is down. A towed car earns nothing until it is repaired and re-listed, so every day it sits at a yard or waits on a shop is money. That is the argument for moving fast on release and getting the repair booked early, not for cutting corners on documentation.",
        },
        {
          kind: "callout",
          tone: "gold",
          title: "What comes next",
          body: "Once the car is somewhere you can shoot it, the Damage Photo Protocol and Submission Checklist in this pack handle the file. If the payout comes in under the shop's estimate, the Valuation pack builds the supplement. If the claim stalls, the Follow-Up pack carries it.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "photo-protocol",
      name: "Damage Photo Protocol",
      tagline: "Photos a reviewer can trust, shot in a repeatable sequence.",
      minutes: "10 min",
      sections: [
        {
          kind: "intro",
          body: [
            "The claim is decided by people who never see the car. Your photos are the car. This protocol produces a set that establishes which vehicle, what condition, what damage, and when, without a single word of argument.",
          ],
        },
        {
          kind: "steps",
          title: "The sequence",
          items: [
            {
              action: "Four corners, wide.",
              detail:
                "Front-left, front-right, rear-left, rear-right, each from about 10 to 12 feet, whole car in frame with surroundings. This is the anchor set.",
            },
            {
              action: "Every side, straight on.",
              detail:
                "Front, rear, left, right, perpendicular to the panel from 6 to 8 feet. Overlap edges so no panel falls between frames.",
            },
            {
              action: "The damage, in three distances.",
              detail:
                "Full panel, half panel, close-up. Repeat the close-up from three angles. Reflections and glare hide damage from one angle; three angles leave nowhere to hide.",
            },
            {
              action: "Scale and context.",
              detail:
                "One close-up with a familiar object for scale. One mid-distance shot that shows the damage AND a recognizable feature of the car (badge, wheel, door handle) so the close-up is provably this vehicle.",
            },
            {
              action: "Interior, odometer, fuel.",
              detail:
                "Seats, floors, trunk, dash warning lights, odometer reading, fuel gauge. Interior claims die without interior baselines.",
            },
          ],
        },
        {
          kind: "prose",
          title: "Lighting rules",
          body: [
            "Overcast daylight is the best light you will get; use it when you can. At night, do not rely on flash alone: it blows out the panel and hides texture. Use a second phone's flashlight held at a low angle across the panel; raking light makes dents and scratches jump.",
            "Never shoot INTO the sun. Put the sun behind or beside you. If a panel is reflecting the sky, move one step left or right until the reflection slides off the damage.",
          ],
        },
        {
          kind: "checklist",
          id: "photo-quality",
          title: "Final quality self-check",
          items: [
            "Every photo sharp at full-screen zoom, not just as a thumbnail",
            "Damage visible without needing to be told where to look",
            "At least one shot connects the damage to this specific vehicle",
            "Nothing staged, edited, filtered, or re-exported",
            "Timestamps intact (shoot with the phone camera, send originals)",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          title: "The mistakes that lose claims",
          body: "Close-ups with no context. One angle with glare on the dent. Photos taken days later 'when there was time'. Screenshots of photos instead of originals. A spotless car photographed AFTER detailing. Each of these has cost real hosts real money.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "evidence-scorecard",
      name: "Evidence Sufficiency Scorecard",
      tagline: "Know what is missing before the claim is submitted, not after.",
      minutes: "5 min",
      sections: [
        {
          kind: "intro",
          body: [
            "Answer honestly. Every unchecked line is a gap the guest's denial will walk through. Some gaps can still be closed in the first hours; none can be closed after the file is submitted and challenged.",
          ],
        },
        {
          kind: "checklist",
          id: "scorecard",
          items: [
            "I have a clear PRE-trip image of the exact affected area",
            "I have a clear POST-trip image of the same area, same angle",
            "My wide shots establish which vehicle and where it was",
            "Every image is sharp enough to read at full size",
            "Photo timestamps bracket the trip (before pickup, after return)",
            "The damage description is factual and specific: panel, size, type",
            "The full guest message thread is preserved with timestamps",
            "Trip number, dates, and times are recorded and consistent everywhere",
          ],
        },
        {
          kind: "prose",
          title: "Reading your score",
          body: [
            "8 of 8: file with confidence. 6 to 7: file, and close the open gaps in the next hour if physically possible; note honestly in your summary what you have. 5 or fewer, and missing the pre-trip baseline: read the Difficult-Claim Decision Matrix before you invest hours. A claim without a before-photo of the affected area is one person's word against another's, and you should decide deliberately whether it is worth pursuing.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "file-index",
      name: "Claim File Index",
      tagline: "One folder structure, so nothing lives only in your phone.",
      minutes: "5 min",
      sections: [
        {
          kind: "intro",
          body: [
            "Your photos and files belong in YOUR storage: your phone, your Google Drive or iCloud, your computer. Claim Proof syncs your tracking, worksheets, and logs to your account, but your actual evidence files live in your own drive, in your control. Copy this structure into your cloud drive and drop everything into it as it is created.",
          ],
        },
        {
          kind: "template",
          id: "folder-structure",
          title: "Folder structure (copy into your drive)",
          body: `CLAIM [TRIP-NUMBER] [VEHICLE] [YYYY-MM-DD]/
  01 Trip Info/          trip screenshot, guest name, dates, times
  02 Before Photos/      pre-trip baseline of the affected areas
  03 After Photos/       the discovery set from the Photo Protocol
  04 Guest Messages/     full thread screenshots, in order
  05 Claim Submission/   what you filed + the confirmation screenshot
  06 Appraisal/          the initial appraisal when it arrives
  07 Repair Estimate/    the body shop's itemized estimate
  08 Follow-Up/          emails, call notes, promised actions
  09 Resolution/         final numbers, payment records, closeout`,
        },
        {
          kind: "prose",
          title: "File naming",
          body: [
            "Name files so a stranger could sort them: YYYY-MM-DD_what-it-is.jpg. Example: 2026-07-10_rear-bumper_close-up_angle2.jpg. When a reviewer opens your file and everything is labeled and ordered, you have already told them what kind of host they are dealing with.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "incident-summary",
      name: "Incident Summary Builder",
      tagline: "A factual account a stranger can follow in one read.",
      minutes: "15 min",
      sections: [
        {
          kind: "intro",
          body: [
            "This one document anchors the whole claim: what happened, proven by what evidence, in neutral language. Fill the template, delete the brackets, keep every sentence a fact you can point to.",
          ],
        },
        {
          kind: "template",
          id: "incident-template",
          title: "Incident summary (copy and fill in)",
          body: `INCIDENT SUMMARY

Vehicle: [YEAR MAKE MODEL, plate or last 6 of VIN]
Trip: [TRIP NUMBER], [START DATE/TIME] to [END DATE/TIME]
Guest: [GUEST FIRST NAME + LAST INITIAL]
Vehicle returned to: [LOCATION]

Condition before trip:
[One or two sentences. Reference your pre-trip photos by date/time.
Example: "Pre-trip photos taken [DATE, TIME] show the rear bumper
undamaged."]

Condition after trip:
[What you found, where, and how large. Example: "A dent approximately
4 inches wide with paint transfer on the rear bumper, driver side,
shown in photos taken [DATE, TIME]."]

Damage discovered: [DATE, TIME], [how: at return inspection / during
turnaround / etc.]

Evidence attached:
- Pre-trip photos ([COUNT]), taken [DATE]
- Post-trip photos ([COUNT]), taken [DATE]
- Guest message thread ([COUNT] screenshots)
- [Anything else: witness note, cleaning crew report]

Immediate actions taken:
[Photographed before moving the vehicle, preserved messages, reported
within the window on DATE at TIME.]`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Language that hurts you",
          body: "No accusations ('the guest obviously lied'), no emotion ('I am furious'), no speculation ('they were probably street racing'). A reviewer reads hundreds of these. The calm, factual file is the credible file. State what the photos show and stop.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "submission-checklist",
      name: "Submission Checklist",
      tagline: "The final quality gate before you file.",
      minutes: "5 min",
      sections: [
        {
          kind: "checklist",
          id: "submission",
          items: [
            "Trip number, dates, and guest name entered correctly",
            "Damage description is specific: panel, location, size, type",
            "Pre-trip AND post-trip photos attached, originals not screenshots",
            "Photos labeled or ordered so before/after is obvious",
            "Every file opens and is readable at full size",
            "Dates consistent across the summary, photos, and messages",
            "Guest message thread preserved (do not delete anything, ever)",
            "Incident Summary saved to your claim folder",
            "Submitted INSIDE the 24-hour window from trip end",
            "Submission confirmation screenshotted and saved",
          ],
        },
        {
          kind: "callout",
          tone: "gold",
          title: "After you press submit",
          body: "Start the Communication Log immediately with entry one: the submission itself, date, time, and confirmation number. Everything from here is a follow-up discipline problem, and the Follow-Up pack carries it.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "comms-templates",
      name: "Neutral Communication Templates",
      tagline: "Say the right thing when you are angriest.",
      minutes: "2 min each",
      sections: [
        {
          kind: "intro",
          body: [
            "Every message you send becomes part of the record. These templates keep you factual when you do not feel factual. Copy, fill the brackets, delete what does not apply, send.",
          ],
        },
        {
          kind: "template",
          id: "guest-clarify",
          title: "Asking the guest a factual question",
          context: "Use when you need information, before any blame is assigned.",
          body: `Hi [NAME], thanks for returning the car. During my return inspection I found [SPECIFIC DAMAGE] on the [LOCATION]. Do you know anything about when or how this might have happened during your trip? I want to make sure I have the full picture. Thanks.`,
        },
        {
          kind: "template",
          id: "guest-confirm-damage",
          title: "Confirming damage was found",
          context: "Use to put the discovery on the record, calmly.",
          body: `Hi [NAME], following up on my earlier message: I have documented [SPECIFIC DAMAGE] on the [LOCATION] that was not present at pickup (my pre-trip photos from [DATE] show the area undamaged). I have reported it through the platform as required. The claims process will take it from here; nothing is needed from you through me directly.`,
        },
        {
          kind: "template",
          id: "guest-no-response",
          title: "Guest has gone quiet",
          context: "One follow-up, then let the process work. Do not chase.",
          body: `Hi [NAME], just closing the loop: the damage I documented on [DATE] has been reported through the platform. If you have any information about it, you are welcome to share it with the claims team. Thanks for the trip otherwise.`,
        },
        {
          kind: "template",
          id: "support-confirm",
          title: "Confirming your submission to support",
          context: "Use if you contact support after filing, so the record is clean.",
          body: `Hello, I submitted a damage report for trip [TRIP NUMBER] on [DATE] at [TIME], within the reporting window (trip ended [DATE, TIME]). Confirmation [NUMBER/SCREENSHOT ATTACHED]. Please confirm the claim is open and let me know the next step and expected timeline. Thank you.`,
        },
        {
          kind: "template",
          id: "support-missing-ack",
          title: "No acknowledgment received",
          context: "Use if several business days pass with no claims contact.",
          body: `Hello, following up on the damage claim for trip [TRIP NUMBER], submitted [DATE]. I have not yet received contact from a claims associate. Could you confirm the claim status, the name of the assigned associate if any, and the expected timeline? I want to make sure nothing is waiting on me. Thank you.`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Never write these",
          body: "Threats ('I'll make sure you never rent again'), verdicts ('you did this'), or payout demands to the guest. They add nothing, they read badly in a file, and they can turn a documentation contest into a credibility contest.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "seven-day-plan",
      name: "First Seven-Day Follow-Up Plan",
      tagline: "What to do while you wait, so waiting is not all you do.",
      minutes: "reference",
      policySensitive: true,
      sections: [
        {
          kind: "table",
          title: "The week at a glance",
          headers: ["When", "Do", "Log"],
          rows: [
            ["Day 0", "Submit. Screenshot confirmation. Start the Communication Log.", "Submission entry with confirmation number"],
            ["Day 1-3", "Expect first claims contact. Answer same day. Send nothing extra unprompted.", "Every contact: who, channel, what was said, what was promised"],
            ["Day 3", "Get the repair estimate process moving: book the body shop assessment.", "Shop name, appointment date"],
            ["Day 4-6", "Send any requested documents same day. Keep the vehicle's status documented if it is drivable vs. not.", "Documents sent, dates"],
            ["Day 7", "No substantive contact yet? Send the status-request script. Calm, one message.", "Status request sent, response deadline noted"],
          ],
        },
        {
          kind: "prose",
          title: "The discipline",
          body: [
            "One channel, one thread where possible. Same-day responses on your side, always. A dated note for every promise anyone makes you. The host who can say 'on [DATE] I was told [X] by [NAME], and it did not happen' controls every later escalation. The host who says 'I called a bunch of times' does not.",
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "completed-example",
      name: "Completed Example Claim File",
      tagline: "What 'complete' actually looks like, end to end.",
      minutes: "10 min read",
      sections: [
        {
          kind: "callout",
          tone: "info",
          title: "This example is fictional",
          body: "Composite for teaching, not a real guest or a real outcome, and not a promise of any result. Its job is to remove every doubt about what a finished file contains.",
        },
        {
          kind: "prose",
          title: "The situation",
          body: [
            "A 2022 Camry comes back from a 3-day trip. At the return inspection the host finds a dent with paint transfer on the rear bumper, driver side. The guest, asked a neutral question, replies 'it was like that when I picked it up.'",
          ],
        },
        {
          kind: "prose",
          title: "What the file contains",
          body: [
            "01 Trip Info: app screenshot showing trip #8841, ended July 8, 2:00 PM.",
            "02 Before Photos: 14 pre-trip photos taken July 5, 9:40 AM, including a straight-on shot of the rear bumper, undamaged.",
            "03 After Photos: 19 photos taken July 8, 2:25 PM. Four corners wide, all sides, the dent at full panel, half panel, and close-up from three angles, one with a key for scale, odometer, and fuel.",
            "04 Guest Messages: 6 screenshots. The host's neutral question, the guest's denial, the host's calm confirmation message. Nothing deleted.",
            "05 Claim Submission: filed July 8, 4:10 PM, two hours and ten minutes after trip end. Confirmation screenshot saved.",
          ],
        },
        {
          kind: "prose",
          title: "The incident summary, as written",
          body: [
            "'Pre-trip photos taken July 5 at 9:40 AM show the rear bumper undamaged. Post-trip photos taken July 8 at 2:25 PM show a dent approximately 4 inches wide with white paint transfer on the rear bumper, driver side. The damage was discovered at the return inspection on July 8 at approximately 2:20 PM. The full message thread with the guest is attached. The report was submitted the same day at 4:10 PM.'",
            "Notice what is absent: no anger, no accusation, no adjectives. The before-photo and the after-photo do the arguing.",
          ],
        },
        {
          kind: "prose",
          title: "Why this file is strong",
          body: [
            "The guest's 'it was like that' has to defeat a timestamped photo of an undamaged bumper taken 72 hours earlier. The filing time is inside the window with hours to spare. Every document a reviewer could ask for next (estimate, appraisal response) has a folder already waiting. This is what four minutes of pre-trip discipline buys on the day it matters.",
          ],
        },
      ],
    },
  ],
};
