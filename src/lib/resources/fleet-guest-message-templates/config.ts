// Guest Message Template Bank: the ten CRR trip-lifecycle messages from
// handout H02 (verified 2026-08-15), inquiry through review ask.
//
// Three tokens are live personalization fields the tool substitutes across
// every template at once: [GUEST NAME], [CAR], [PICKUP LOCATION]. All other
// [BRACKETS] are intentional blanks the host fills per trip. The photo-rule
// wording in templates 4 and 6 reflects Turo's 2026 requirements (metadata
// mandatory; pre-trip photos taken within 24h before start and uploaded
// within 24h after start; post-trip photos taken AND uploaded within 24h
// after trip end): re-verify each season.
//
// `hostNote` is guidance for the HOST ONLY. The tool renders it as a visible
// side note and never includes it in the copyable body.

export interface FleetTemplateFields {
  guestName: string;
  carNickname: string;
  pickupLocation: string;
}

export const DEFAULT_FIELDS: FleetTemplateFields = {
  guestName: "",
  carNickname: "",
  pickupLocation: "",
};

export interface FleetTemplate {
  id: string;
  title: string;
  purpose: string;
  body: string;
  /** Host-only guidance. Shown beside the template, never copied. */
  hostNote?: string;
}

export const FLEET_TEMPLATES: FleetTemplate[] = [
  {
    id: "inquiry",
    title: "1. Inquiry response",
    purpose: "Answer interest fast, confirm dates, invite questions.",
    body: `Hi [GUEST NAME],

Thanks for the interest in the [CAR]. Your dates ([START DATE] to [END DATE]) are open.

Quick highlights:
- [KEY FEATURE 1]
- [KEY FEATURE 2]
- [KEY FEATURE 3]

Pickup: [PICKUP LOCATION]. [IF DELIVERY: I can deliver within [X] miles for $[FEE].]

Anything you want to know about the car or the trip, ask away. Happy to help.

[YOUR NAME]`,
  },
  {
    id: "booking",
    title: "2. Booking confirmation",
    purpose: "Lock in logistics the moment the booking lands.",
    body: `Hi [GUEST NAME],

You're booked. Here's the short version:

- Pickup: [DATE] at [TIME], [PICKUP LOCATION]
- Return: [DATE] at [TIME], [RETURN LOCATION]

Bring your driver's license and have the Turo app on your phone. Check-in happens in the app.

About the car: [ONE OR TWO SENTENCES, ANY SPECIAL INSTRUCTIONS].

I'll send final details 24 hours before pickup. If your plans shift, tell me early and we'll sort it out.

[YOUR NAME]`,
  },
  {
    id: "pretrip",
    title: "3. Pre-trip reminder (24 hours out)",
    purpose: "The message that does the most for your reviews. Send it on time.",
    body: `Hi [GUEST NAME],

Your trip starts tomorrow. Final details:

- Pickup: [TIME] at [PICKUP LOCATION]
- Where to find the car: [PARKING DETAILS]
- [IF DELIVERY: I'll meet you at [LOCATION]. My number is [PHONE] if anything changes.]

The car is cleaned, inspected, and fueled to [LEVEL]. Please return it at the same level.

[ONE WEATHER OR ROAD NOTE IF RELEVANT.]

See you tomorrow.

[YOUR NAME]`,
  },
  {
    id: "checkin",
    title: "4. Check-in instructions",
    purpose: "Walk the guest through trip-day check-in, photos included.",
    body: `Hi [GUEST NAME],

It's trip day. Check-in takes about five minutes:

1. Find the [CAR]: [PICKUP LOCATION].
2. Access: [LOCKBOX CODE / HANDOFF / APP UNLOCK DETAILS].
3. Open the Turo app, select your trip, and tap Check in.
4. Take your photos in the app: walk all the way around the car, plus the interior. Keep your phone's location and timestamp on. Turo requires date, time, and location data on trip photos, and photos without that data don't count if anything ever needs documenting. It protects you as much as me.
5. Confirm fuel level and odometer match the app.

Car notes: [SPECIAL FEATURES, QUIRKS, WHERE THE REGISTRATION LIVES].

Any problem at check-in, call or text me right away: [PHONE].

Enjoy the trip.

[YOUR NAME]`,
    hostNote:
      "Your own pre-trip photos must be taken no more than 24 hours before trip start and uploaded within 24 hours after start, with metadata on. Build it into your prep routine (see the check-in SOP in H04).",
  },
  {
    id: "midtrip",
    title: "5. Mid-trip check-in",
    purpose: "A light touch on longer trips. Surface issues early.",
    body: `Hi [GUEST NAME],

Hope the [CAR] is treating you well. Anything you need or any questions about the car, just message me.

[OPTIONAL: If you're exploring, [LOCAL RECOMMENDATION] is a guest favorite.]

Safe travels.

[YOUR NAME]`,
  },
  {
    id: "checkout",
    title: "6. Check-out instructions",
    purpose: "Make the return smooth and get the in-app photos taken.",
    body: `Hi [GUEST NAME],

Your trip ends [TODAY/TOMORROW] at [TIME]. Check-out is quick:

1. Grab your belongings and clear out any trash.
2. Refuel to [LEVEL]. Closest stations to the return spot: [STATION 1], [STATION 2].
3. Park at [RETURN ADDRESS, SPECIFIC SPOT]. [KEY RETURN INSTRUCTIONS.]
4. Open the Turo app, tap Check out, and take your return photos in the app with location and timestamp on. Same rule as check-in: Turo requires the date, time, and location data, so don't skip the in-app photos.

Running late? Message me as soon as you know. Late is fixable when I hear about it early.

Thanks for renting the [CAR]. An honest review after check-out means a lot.

[YOUR NAME]`,
    hostNote:
      "Your own post-trip photos must be taken and uploaded within 24 hours after trip end, metadata on. Set a recurring reminder tied to every return.",
  },
  {
    id: "late-extension",
    title: "7. Late return or extension request",
    purpose: "Keep extensions in the app and late returns fixable.",
    body: `Hi [GUEST NAME],

Got your message about [EXTENDING / RUNNING LATE].

[IF EXTENSION WORKS:] The car is open through [DATE/TIME]. Request the extension in the Turo app and I'll approve it. Booking it in the app keeps you covered for the extra time.

[IF IT DOESN'T WORK:] I have a booking right behind yours, so I need the car back by [TIME]. If you're stuck, call me and we'll figure out the fastest option: [PHONE].

Thanks for the heads-up.

[YOUR NAME]`,
  },
  {
    id: "thankyou",
    title: "8. Post-trip thank you",
    purpose: "Close warm, ask for the review, invite the rebooking.",
    body: `Hi [GUEST NAME],

Thanks for renting the [CAR]. [ONE SPECIFIC, GENUINE LINE, e.g. "You returned it cleaner than most, appreciated."]

If you have a minute, an honest review helps me and helps the next guest.

Next time you need a car in [LOCATION], you know where to find me.

[YOUR NAME]`,
  },
  {
    id: "issue",
    title: "9. Issue resolution",
    purpose: "Respond to a problem with options, not apologies on loop.",
    body: `Hi [GUEST NAME],

Thanks for flagging [ISSUE]. Sorry it happened on your trip.

Here's what I can do:
- [OPTION 1]
- [OPTION 2]

Tell me which works, or suggest something better. I want this fixed today, not debated for a week.

[YOUR NAME]
[PHONE FOR ANYTHING URGENT]`,
  },
  {
    id: "maintenance",
    title: "10. Maintenance issue before a trip",
    purpose: "Be straight about a problem before handing over the car.",
    body: `Hi [GUEST NAME],

Straight to it: [BRIEF, HONEST DESCRIPTION OF THE ISSUE] came up with the [CAR] ahead of your [START DATE] trip. I'd rather tell you now than hand you a car I'm not sure about.

Your options:
- [OPTION 1: e.g. "I'll confirm by [DATE] whether it's ready"]
- [OPTION 2: e.g. "Switch to my [OTHER VEHICLE] at the same rate"]
- [OPTION 3: e.g. "Cancel with my help finding another car"]

Pick whichever works best and I'll set it up immediately. Sorry for the hassle.

[YOUR NAME]
[PHONE]`,
    hostNote:
      "If you have to cancel outright, know the cost before you do it: $25 more than 24 hours out, $50 inside 24 hours, plus an automated review on your listing and ranking penalties. A vehicle swap or reschedule the guest agrees to is almost always the better path.",
  },
];

/** Substitute the three live fields into a template body. Empty fields leave their token in place as a visible blank. */
export function applyFields(body: string, f: FleetTemplateFields): string {
  let out = body;
  const guest = f.guestName.trim();
  const car = f.carNickname.trim();
  const pickup = f.pickupLocation.trim();
  if (guest) out = out.split("[GUEST NAME]").join(guest);
  if (car) out = out.split("[CAR]").join(car);
  if (pickup) out = out.split("[PICKUP LOCATION]").join(pickup);
  return out;
}

/** How many [BRACKET] blanks remain for the host to fill by hand. */
export function blanksRemaining(body: string): number {
  return (body.match(/\[[^\]]+\]/g) ?? []).length;
}
