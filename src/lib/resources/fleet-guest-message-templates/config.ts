// Guest Message Template Bank: the ten CRR trip-lifecycle messages from
// handout H02 (verified 2026-08-15), inquiry through review ask.
//
// Each message is its own screen in the tool and carries THREE interchangeable
// formats on one axis, length: Brief, Standard, Detailed. Index 1 (Standard) is
// the original handout copy and stays that way, the same rule the co-living
// Guest Correspondence Templates tool follows for Della's originals. Brief is
// the message you send from a phone between jobs; Detailed is the one you send
// to a first-time renter or a guest who asks a lot of questions. Same facts in
// all three. A host picks a voice, not a different set of rules.
//
// Three tokens are live personalization fields the tool substitutes across
// every template and every format at once: [GUEST NAME], [CAR],
// [PICKUP LOCATION]. All other [BRACKETS] are intentional blanks the host fills
// per trip. The photo-rule wording in templates 4 and 6 reflects Turo's 2026
// requirements (metadata mandatory; pre-trip photos taken within 24h before
// start and uploaded within 24h after start; post-trip photos taken AND
// uploaded within 24h after trip end) and must survive into all three formats:
// re-verify each season.
//
// `hostNote` is guidance for the HOST ONLY. The tool renders it as a visible
// side note and never includes it in the copyable body.
//
// No em-dashes or en-dashes anywhere in this file. These strings are pasted
// straight into a guest message.

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

/** The three formats, in running order. Index 1 is the default. */
export type FormatId = "brief" | "standard" | "detailed";

export const FORMATS: { id: FormatId; label: string; hint: string }[] = [
  {
    id: "brief",
    label: "Brief",
    hint: "Thumb-typed from a job site. Everything that matters, nothing else.",
  },
  {
    id: "standard",
    label: "Standard",
    hint: "The handout original. The one to use if you are not sure.",
  },
  {
    id: "detailed",
    label: "Detailed",
    hint: "First-time renters and guests who ask a lot of questions.",
  },
];

export const DEFAULT_FORMAT: FormatId = "standard";

export interface TemplateVariant {
  format: FormatId;
  body: string;
}

export interface FleetTemplate {
  id: string;
  title: string;
  /** Tab-pill text. Keep under ~14 chars; the pill truncates. */
  shortLabel: string;
  purpose: string;
  /** One-line schedule cue, headline of the timing callout. */
  whenToSend: string;
  /** One or two sentences on why that timing. Not paragraph-length. */
  whyThisTiming: string;
  /** Brief, Standard, Detailed. Always all three, always in that order. */
  variants: TemplateVariant[];
  /** Host-only guidance. Shown beside the template, never copied. */
  hostNote?: string;
}

export const FLEET_TEMPLATES: FleetTemplate[] = [
  {
    id: "inquiry",
    title: "Inquiry response",
    shortLabel: "Inquiry",
    purpose: "Answer interest fast, confirm dates, invite questions.",
    whenToSend: "Within the hour, while your listing is still open in a tab.",
    whyThisTiming:
      "An inquiry is someone comparing three cars at once. The first specific answer usually gets the booking, and your response time is a number Turo shows guests.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

The [CAR] is open for [START DATE] to [END DATE]. Pickup is [PICKUP LOCATION].

[ANSWER THEIR QUESTION IN ONE LINE.]

Book it through Turo whenever you are ready, or ask me anything first.

[YOUR NAME]`,
      },
      {
        format: "standard",
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
        format: "detailed",
        body: `Hi [GUEST NAME],

Thanks for reaching out about the [CAR]. Your dates, [START DATE] to [END DATE], are open right now.

[ANSWER THEIR QUESTION DIRECTLY, FIRST.]

What you are getting:
- [KEY FEATURE 1]
- [KEY FEATURE 2]
- [KEY FEATURE 3]
- [MILEAGE ALLOWANCE] miles included, then $[RATE] per mile

Pickup and return: [PICKUP LOCATION]. [IF DELIVERY: I deliver within [X] miles for $[FEE].]

Two things worth knowing before you book:
- [RULE OR EXPECTATION 1, e.g. return at the same fuel level]
- [RULE OR EXPECTATION 2, e.g. no smoking, pets by request]

I usually answer within [RESPONSE TIME]. Ask me anything about the car or the area and you will get a straight answer.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "booking",
    title: "Booking confirmation",
    shortLabel: "Booking",
    purpose: "Lock in logistics the moment the booking lands.",
    whenToSend: "The moment the booking clears. Automate it if you can.",
    whyThisTiming:
      "Turo already sent the receipt. Your note puts a name and a plan on it, which is what stops the pickup-day questions before they start.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

You are booked in the [CAR].

- Pickup: [DATE] at [TIME], [PICKUP LOCATION]
- Return: [DATE] at [TIME], [RETURN LOCATION]

Bring your license and have the Turo app ready. I will send the rest 24 hours out.

[YOUR NAME]`,
      },
      {
        format: "standard",
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
        format: "detailed",
        body: `Hi [GUEST NAME],

You are booked. Everything in one place so you are not hunting for it later.

Pickup
- [DATE] at [TIME]
- [PICKUP LOCATION]
- [PARKING OR MEETING DETAILS]

Return
- [DATE] at [TIME]
- [RETURN LOCATION]
- Fuel level at return: [LEVEL]

Bring with you
- Your driver's license
- The Turo app, logged in. Check-in and check-out both happen in the app
- [ANYTHING ELSE, e.g. a card for tolls]

About the [CAR]: [ONE OR TWO SENTENCES. ANY QUIRK WORTH KNOWING NOW RATHER THAN IN THE DRIVEWAY.]

House rules, short version:
- [RULE 1]
- [RULE 2]
- [RULE 3]

I will send final details and exact access instructions 24 hours before pickup. If your plans shift, tell me early. Almost everything is fixable with notice.

[YOUR NAME]
[PHONE]`,
      },
    ],
  },
  {
    id: "pretrip",
    title: "Pre-trip reminder",
    shortLabel: "Pre-trip",
    purpose: "The message that does the most for your reviews. Send it on time.",
    whenToSend: "Twenty four hours before trip start.",
    whyThisTiming:
      "A guest who already knows where to park and what to expect arrives calm. Almost every bad pickup traces back to a detail nobody sent the day before.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Trip starts tomorrow. Pickup is [TIME] at [PICKUP LOCATION], [PARKING DETAILS].

The [CAR] is cleaned and fueled to [LEVEL]. Please bring it back the same.

See you tomorrow.

[YOUR NAME]`,
      },
      {
        format: "standard",
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
        format: "detailed",
        body: `Hi [GUEST NAME],

Your trip starts tomorrow. Everything you need:

When and where
- Pickup: [TIME] at [PICKUP LOCATION]
- Finding the car: [PARKING DETAILS, LEVEL, SPOT NUMBER, WHAT THE CAR LOOKS LIKE]
- [IF DELIVERY: I will meet you at [LOCATION] at [TIME]. Call or text [PHONE] if your arrival moves.]

The car
- Cleaned, inspected, and fueled to [LEVEL]. Please return it at the same level
- [MILEAGE ALLOWANCE] miles included across your trip
- [TOLLS, PARKING PASS, OR TRANSPONDER DETAILS]

Trip day, in the app
- Open Turo, select your trip, tap Check in
- Take your photos in the app with location services on
- Confirm fuel and odometer match what you see

[ONE WEATHER, TRAFFIC, OR ROAD NOTE IF RELEVANT.]

Anything comes up tomorrow, message me here or call [PHONE]. I would rather hear about it early.

See you tomorrow.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "checkin",
    title: "Check-in instructions",
    shortLabel: "Check-in",
    purpose: "Walk the guest through trip-day check-in, photos included.",
    whenToSend: "Trip morning, an hour or two before pickup.",
    whyThisTiming:
      "Photos are the whole game. Send the steps while the guest is still at home, not while they are standing next to the car with a phone in one hand.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Trip day. The [CAR] is at [PICKUP LOCATION]. Access: [LOCKBOX CODE / HANDOFF / APP UNLOCK].

In the Turo app: tap Check in, then take your photos with your phone's location and timestamp turned on. Turo requires that data on trip photos, so a photo without it does not count for either of us. Confirm fuel and odometer while you are there.

Any trouble, call or text [PHONE].

Enjoy it.

[YOUR NAME]`,
      },
      {
        format: "standard",
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
      },
      {
        format: "detailed",
        body: `Hi [GUEST NAME],

It is trip day. Check-in takes about five minutes and this is all of it.

1. Find the [CAR]
[PICKUP LOCATION]. [WHICH LEVEL, WHICH SPOT, WHAT THE CAR LOOKS LIKE.]

2. Get in
[LOCKBOX CODE / HANDOFF / APP UNLOCK DETAILS.]

3. Check in through the Turo app
Open the app, select your trip, tap Check in. Do this before you drive off, not after.

4. Take your photos, location on
Walk all the way around the car and photograph every side, then the interior. Turn your phone's location services and timestamp on before you start. Turo requires date, time, and location data on trip photos, and a photo without it does not count if anything ever needs documenting later. It protects you exactly as much as it protects me.

5. Confirm fuel and odometer
Both should match what the app shows. If they do not, photograph what you see and message me before you leave.

Car notes: [SPECIAL FEATURES, QUIRKS, WHERE THE REGISTRATION AND INSURANCE CARD LIVE, HOW THE FUEL DOOR OR CHARGE PORT WORKS.]

Fuel: please return at [LEVEL]. Closest stations to the return spot are [STATION 1] and [STATION 2].

If anything at check-in does not look right, call or text before you drive: [PHONE]. Twenty seconds now beats a dispute later.

Enjoy the trip.

[YOUR NAME]`,
      },
    ],
    hostNote:
      "Your own pre-trip photos must be taken no more than 24 hours before trip start and uploaded within 24 hours after start, with metadata on. Build it into your prep routine (see the check-in SOP in H04).",
  },
  {
    id: "midtrip",
    title: "Mid-trip check-in",
    shortLabel: "Mid-trip",
    purpose: "A light touch on longer trips. Surface issues early.",
    whenToSend: "Day two or three of any trip longer than four days.",
    whyThisTiming:
      "One light touch surfaces a problem while you can still fix it. Silence gets you a one-star review you never saw coming.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Checking in. How is the [CAR] treating you?

Anything you need, message me.

[YOUR NAME]`,
      },
      {
        format: "standard",
        body: `Hi [GUEST NAME],

Hope the [CAR] is treating you well. Anything you need or any questions about the car, just message me.

[OPTIONAL: If you're exploring, [LOCAL RECOMMENDATION] is a guest favorite.]

Safe travels.

[YOUR NAME]`,
      },
      {
        format: "detailed",
        body: `Hi [GUEST NAME],

Halfway through. Hope the [CAR] is doing what you needed it to.

A few things people ask around now:
- [TIRE PRESSURE, FUEL TYPE, CHARGING, OR OTHER CAR-SPECIFIC NOTE]
- Anything mechanical feeling off, tell me today rather than at return. Small things stay small
- Need more days? Request the extension in the Turo app and I will approve it if the calendar allows

[OPTIONAL: If you are exploring, [LOCAL RECOMMENDATION] is a guest favorite and [SECOND RECOMMENDATION] is worth the drive.]

For return day: back to [RETURN LOCATION] at [LEVEL] fuel, and take your check-out photos in the app.

Safe travels.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "checkout",
    title: "Check-out instructions",
    shortLabel: "Check-out",
    purpose: "Make the return smooth and get the in-app photos taken.",
    whenToSend: "The morning of the return, or the night before.",
    whyThisTiming:
      "The return is where fuel disputes and missed photos happen. Say the steps before the guest is rushing to a flight, not after.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Return is [TODAY/TOMORROW] at [TIME].

- Refuel to [LEVEL]
- Park at [RETURN ADDRESS, SPECIFIC SPOT]. [KEY RETURN INSTRUCTIONS.]
- In the Turo app: tap Check out, then take your return photos with location and timestamp on. Turo requires that data, so do not skip the in-app set

Running late, message me early. Thanks for renting the [CAR]. An honest review means a lot.

[YOUR NAME]`,
      },
      {
        format: "standard",
        body: `Hi [GUEST NAME],

Your trip ends [TODAY/TOMORROW] at [TIME]. Check-out is quick:

1. Grab your belongings and clear out any trash.
2. Refuel to [LEVEL]. Closest stations to the return spot: [STATION 1], [STATION 2].
3. Park at [RETURN ADDRESS, SPECIFIC SPOT]. [KEY RETURN INSTRUCTIONS.]
4. Open the Turo app, tap Check out, and take your return photos in the app with location and timestamp on. Same rule as check-in: Turo requires the date, time, and location data, so don't skip the in-app photos.

Running late? Message me as soon as you know. Late is fixable when I hear about it early.

Thanks for renting the [CAR]. An honest review after check-out means a lot.

[YOUR NAME]`,
      },
      {
        format: "detailed",
        body: `Hi [GUEST NAME],

Your trip ends [TODAY/TOMORROW] at [TIME]. Here is the return, start to finish.

1. Clear it out
Belongings, trash, anything in the trunk or the door pockets. Easier to catch it now than to ship it back later.

2. Refuel to [LEVEL]
Closest stations to the return spot: [STATION 1], [STATION 2]. A car that comes back low picks up a refueling charge on your trip, and I would rather you spend that money on gas.

3. Park at [RETURN ADDRESS, SPECIFIC SPOT]
[KEY RETURN INSTRUCTIONS, GATE CODE, WHERE TO LEAVE THE KEY.]

4. Check out in the Turo app
Tap Check out, then take your return photos with location services and timestamp on. Same rule as check-in: Turo requires date, time, and location data on trip photos, so the in-app set is the one that counts. Walk the whole car, then the interior, then fuel and odometer.

Running late? Message me as soon as you know. Late is almost always fixable when I hear about it early and expensive when I hear about it at the return time.

Thanks for renting the [CAR]. [ONE SPECIFIC, GENUINE LINE.] If the trip was a good one, an honest review helps me more than anything else you could do.

[YOUR NAME]`,
      },
    ],
    hostNote:
      "Your own post-trip photos must be taken and uploaded within 24 hours after trip end, metadata on. Set a recurring reminder tied to every return.",
  },
  {
    id: "late-extension",
    title: "Late return or extension request",
    shortLabel: "Late / extend",
    purpose: "Keep extensions in the app and late returns fixable.",
    whenToSend: "Within minutes of the guest raising it.",
    whyThisTiming:
      "An extension is revenue and a late return is a cascade into your next booking. Both get cheaper the faster you answer.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Got it.

[IF THE EXTENSION WORKS:] The [CAR] is open through [DATE/TIME]. Request it in the Turo app and I will approve it.

[IF IT DOES NOT:] I have a booking right behind yours, so I need it back by [TIME]. Call me if you are stuck: [PHONE].

[YOUR NAME]`,
      },
      {
        format: "standard",
        body: `Hi [GUEST NAME],

Got your message about [EXTENDING / RUNNING LATE].

[IF EXTENSION WORKS:] The car is open through [DATE/TIME]. Request the extension in the Turo app and I'll approve it. Booking it in the app keeps you covered for the extra time.

[IF IT DOESN'T WORK:] I have a booking right behind yours, so I need the car back by [TIME]. If you're stuck, call me and we'll figure out the fastest option: [PHONE].

Thanks for the heads-up.

[YOUR NAME]`,
      },
      {
        format: "detailed",
        body: `Hi [GUEST NAME],

Thanks for telling me instead of letting it ride. Here is where things stand.

[IF THE EXTENSION WORKS]
The [CAR] is open through [DATE/TIME]. Request the extension in the Turo app and I will approve it as soon as I see it. Book it in the app rather than settling up between us: an off-app extension leaves the extra time outside the trip's protection, which is bad for you and bad for me.

[IF THE EXTENSION DOES NOT WORK]
I have a booking right behind yours, so the car has to be back at [RETURN LOCATION] by [TIME]. If you are genuinely stuck, call [PHONE] and we will find the fastest way to get it back, whether that is [OPTION 1] or [OPTION 2].

Either way, a trip that runs past its end time without an approved extension can pick up charges from Turo, and that is the platform rather than me. Getting it into the app is what keeps this simple.

Thanks for the heads-up.

[YOUR NAME]
[PHONE]`,
      },
    ],
    hostNote:
      "Confirm Turo's current late-return charges and thresholds in the app before you quote a number to a guest. This template deliberately does not name one.",
  },
  {
    id: "thankyou",
    title: "Post-trip thank you",
    shortLabel: "Thank you",
    purpose: "Close warm, ask for the review, invite the rebooking.",
    whenToSend: "Within a few hours of check-out, after your own photos are done.",
    whyThisTiming:
      "Ask while the trip is still fresh and more guests actually leave a review. Do your post-trip photos first so you are never asking for a review and opening a claim on the same afternoon.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Thanks for renting the [CAR]. [ONE SPECIFIC, GENUINE LINE.]

If you have a minute, an honest review helps a lot.

Next time you need a car in [LOCATION], you know where to find me.

[YOUR NAME]`,
      },
      {
        format: "standard",
        body: `Hi [GUEST NAME],

Thanks for renting the [CAR]. [ONE SPECIFIC, GENUINE LINE, e.g. "You returned it cleaner than most, appreciated."]

If you have a minute, an honest review helps me and helps the next guest.

Next time you need a car in [LOCATION], you know where to find me.

[YOUR NAME]`,
      },
      {
        format: "detailed",
        body: `Hi [GUEST NAME],

Thanks for renting the [CAR]. [ONE SPECIFIC, GENUINE LINE, e.g. "You returned it cleaner than most, and I noticed."]

Everything looked good on my end, so there is nothing further you need to do.

If you have a minute, an honest review helps more than anything else you could do for me. It is the first thing the next guest reads, and it is most of how a small host gets booked at all. I have already left yours.

For next time:
- I keep [OTHER VEHICLES OR TRIP TYPES] available in [LOCATION]
- [WHAT YOU OFFER REPEAT GUESTS, IF ANYTHING]. Message me before you book
- [LONGER TRIPS OR MONTHLY RATES, IF YOU OFFER THEM]

Safe travels, and thanks again.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "issue",
    title: "Issue resolution",
    shortLabel: "Issue",
    purpose: "Respond to a problem with options, not apologies on loop.",
    whenToSend: "Same day. Inside the hour if the guest is stranded.",
    whyThisTiming:
      "Guests forgive problems. They do not forgive being ignored. Options in the first reply are what keep it from becoming a support ticket and a review.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Sorry about [ISSUE]. Two options:

- [OPTION 1]
- [OPTION 2]

Tell me which one, or tell me what would actually fix it.

[YOUR NAME]
[PHONE]`,
      },
      {
        format: "standard",
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
        format: "detailed",
        body: `Hi [GUEST NAME],

Thanks for flagging [ISSUE], and sorry it happened on your trip.

What I know so far: [ONE OR TWO LINES, FACTS ONLY.]

What I can do right now:
- [OPTION 1, WITH A TIME: e.g. "Roadside can reach you in about 60 minutes"]
- [OPTION 2, WITH A TIME]
- [OPTION 3 IF THERE IS ONE]

Tell me which works, or tell me what would actually solve it for you. If none of these get you moving, say so and I will take it to Turo support with you rather than leaving you to do it alone.

[IF SAFETY IS INVOLVED: Please do not drive it. Pull over somewhere safe and call me before anything else.]

For anything urgent, call rather than message: [PHONE]. I want this fixed today, not debated for a week.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance issue before a trip",
    shortLabel: "Maintenance",
    purpose: "Be straight about a problem before handing over the car.",
    whenToSend: "The moment you know, before the trip starts.",
    whyThisTiming:
      "Telling a guest early costs you one trip. Handing over a car you were unsure about costs you the review, maybe a claim, and the guest's whole plan.",
    variants: [
      {
        format: "brief",
        body: `Hi [GUEST NAME],

Straight to it: [BRIEF DESCRIPTION OF THE ISSUE] came up with the [CAR] before your [START DATE] trip.

Your options:
- [OPTION 1]
- [OPTION 2]
- [OPTION 3]

Pick one and I will set it up today.

[YOUR NAME]
[PHONE]`,
      },
      {
        format: "standard",
        body: `Hi [GUEST NAME],

Straight to it: [BRIEF, HONEST DESCRIPTION OF THE ISSUE] came up with the [CAR] ahead of your [START DATE] trip. I'd rather tell you now than hand you a car I'm not sure about.

Your options:
- [OPTION 1: e.g. "I'll confirm by [DATE] whether it's ready"]
- [OPTION 2: e.g. "Switch to my [OTHER VEHICLE] at the same rate"]
- [OPTION 3: e.g. "Cancel with my help finding another car"]

Pick whichever works best and I'll set it up immediately. Sorry for the hassle.

[YOUR NAME]
[PHONE]`,
      },
      {
        format: "detailed",
        body: `Hi [GUEST NAME],

Straight to it. [BRIEF, HONEST DESCRIPTION OF THE ISSUE] came up with the [CAR] ahead of your [START DATE] trip. I would rather tell you now than hand you a car I am not sure about.

Where it stands: [WHAT YOU KNOW, WHO IS LOOKING AT IT, WHEN YOU EXPECT AN ANSWER.]

Your options, and I am fine with any of them:
- [OPTION 1: e.g. "Hold the booking. I confirm by [DATE] whether the car is ready, and if it is not, we go to option 2 or 3 with no argument."]
- [OPTION 2: e.g. "Switch to my [OTHER VEHICLE] at the same rate. Same pickup spot, same times."]
- [OPTION 3: e.g. "Cancel, and I help you find another car in [LOCATION] before you are stuck."]

Whichever you pick, tell me and I will set it up immediately. If you want the cancellation, I will handle it from my side.

Sorry for the hassle. This is not how I like to start a trip.

[YOUR NAME]
[PHONE]`,
      },
    ],
    hostNote:
      "If you have to cancel outright, know the cost before you do it: $25 more than 24 hours out, $50 inside 24 hours, plus an automated review on your listing and ranking penalties. A vehicle swap or a reschedule the guest agrees to is almost always the better path.",
  },
];

/** The variant for a given format. Falls back to Standard if one is missing. */
export function variantFor(t: FleetTemplate, format: FormatId): TemplateVariant {
  return (
    t.variants.find((v) => v.format === format) ??
    t.variants.find((v) => v.format === DEFAULT_FORMAT) ??
    t.variants[0]
  );
}

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
