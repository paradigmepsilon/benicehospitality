// Guest Correspondence Templates, reference content. Digitized from Della's
// "Guest Correspondences Template" handout: ready-to-send message templates for
// each stage of the guest journey, plus 20 FAQ answers in a host's voice.
// Placeholders are in [brackets] for the operator to fill in.
//
// No em-dashes or en-dashes anywhere in this file. These strings are pasted
// straight into a guest message, and the handout's voice does not use them.

export interface TemplateVariant {
  /** Short tag for this wording: "Warm" | "Brief" | "Detailed". */
  label: string;
  body: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  /** Tab-pill text. Keep under ~14 chars; the pill truncates. */
  shortLabel: string;
  purpose: string;
  /** One-line schedule cue, headline of the timing callout. */
  whenToSend: string;
  /** One or two sentences on why that timing. Not paragraph-length. */
  whyThisTiming: string;
  /**
   * Three interchangeable wordings on one axis, so cycling is an editorial
   * choice rather than random variety. Index 0 is Della's original handout
   * copy and stays that way: it is where this tool came from.
   */
  variants: TemplateVariant[];
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "inquiry",
    title: "Initial inquiry",
    shortLabel: "Inquiry",
    purpose: "Respond to a potential guest interested in your property.",
    whenToSend: "Within the hour, before they book somewhere else.",
    whyThisTiming:
      "An inquiry is a guest comparing you against other tabs they have open. A fast, specific answer beats a polished slow one.",
    variants: [
      {
        label: "Warm",
        body: `Thank you for inquiring about our property! [Answer their question(s) clearly: availability, features of the space, etc.]

If you have any additional questions or need more details, feel free to reach out. We'd be delighted to host you.

Best regards,
[Host Name]`,
      },
      {
        label: "Brief",
        body: `Hi [Guest Name], thanks for reaching out!

[Answer their question directly in one or two lines.]

Your dates are open right now. Happy to answer anything else, or you're welcome to book straight through.

[Host Name]`,
      },
      {
        label: "Detailed",
        body: `Hello [Guest Name],

Thanks for your interest in [Property Name]! Here is the answer to what you asked, plus the details most guests want up front.

[Their question]: [Your answer]

A few things worth knowing:
- Check-in is [Check-in Time], check-out is [Check-out Time]
- Parking: [parking details]
- [The detail guests always ask about: pets, stairs, Wi-Fi speed, distance to the airport]

Your dates, [Check-in Date] to [Check-out Date], are available as of right now. Let me know if you'd like anything else cleared up before you book.

Best regards,
[Host Name]`,
      },
    ],
  },
  {
    id: "booking-auto",
    title: "Booking confirmation (automated platforms)",
    shortLabel: "Platform",
    purpose: "Confirm a booking made through Airbnb or a similar platform.",
    whenToSend: "Immediately after the booking clears. Automate it.",
    whyThisTiming:
      "The platform already sent the receipt. Your note puts a human name on the reservation and tells them when the real details arrive.",
    variants: [
      {
        label: "Warm",
        body: `Greetings [Guest Name],

Thank you for booking with us! We're thrilled to welcome you. You'll find check-in instructions and the property address in the reservation details on your booking app.

If you need any assistance during your stay, don't hesitate to contact us at [phone] or [email].

Looking forward to hosting you,
[Host Name]`,
      },
      {
        label: "Brief",
        body: `You're all set, [Guest Name]! [Property Name] is booked for [Check-in Date] to [Check-out Date].

Check-in instructions and the address are in your booking app. I'll message you again before you arrive.

Anything you need, I'm right here.

[Host Name]`,
      },
      {
        label: "Detailed",
        body: `Greetings [Guest Name],

Thank you for booking with us! Your reservation at [Property Name] is confirmed for [Check-in Date] to [Check-out Date].

Here is what happens next, so you're not left wondering:
1. Your address and check-in instructions are already in the reservation details on your booking app.
2. I'll send a reminder with the door code and parking notes [when, for example "the morning you arrive"].
3. Check-in is anytime after [Check-in Time]. Check-out is [Check-out Time].

If anything about your trip changes before then, just message me here. You can also reach me at [phone] or [email].

Looking forward to hosting you,
[Host Name]`,
      },
    ],
  },
  {
    id: "booking-manual",
    title: "Booking confirmation (manual)",
    shortLabel: "Direct",
    purpose: "Confirm a direct booking and share full check-in details.",
    whenToSend: "Within fifteen minutes of taking a direct booking.",
    whyThisTiming:
      "A direct booking has no app holding the address and door code, so this message is the reservation. Send it while the guest is still at their computer.",
    variants: [
      {
        label: "Warm",
        body: `Greetings [Guest Name],

Thank you for booking with us! Below are your check-in details:

- Address: [Property Address]
- Dates: [Check-in Date] to [Check-out Date]
- Check-in Time: [Default 4:00 PM unless arranged]
- Check-out Time: [Default 11:00 AM unless arranged]

How to check in:
1. Locate the keypad on the door.
2. Enter the code [XXXX] and press [button].
3. Push the handle down to enter.

How to check out:
1. Close the door and enter the same code to lock.

If you have any questions, let me know. We're here to help!

Best regards,
[Host Name]`,
      },
      {
        label: "Brief",
        body: `You're booked, [Guest Name]! Here is everything you need.

Address: [Property Address]
Dates: [Check-in Date] to [Check-out Date]
Check-in: after [Check-in Time]
Check-out: [Check-out Time]
Door code: [XXXX]

Enter the code on the keypad, press [button], then push the handle down. The same code locks up on your way out.

Questions, just reply here.

[Host Name]`,
      },
      {
        label: "Detailed",
        body: `Greetings [Guest Name],

Thank you for booking directly with us! Your stay at [Property Name] is confirmed. Save this message, it has everything you need.

YOUR RESERVATION
- Address: [Property Address]
- Dates: [Check-in Date] to [Check-out Date]
- Check-in Time: [Default 4:00 PM unless arranged]
- Check-out Time: [Default 11:00 AM unless arranged]
- Wi-Fi: [network] / [password]
- Parking: [parking instructions]

HOW TO CHECK IN
1. Locate the keypad on the door.
2. Enter the code [XXXX] and press [button].
3. Push the handle down to enter.

HOW TO CHECK OUT
1. Take any trash to [location].
2. Close the door and enter the same code to lock it.
3. Leave [keys, parking pass, anything physical] on [location].

Payment: [amount] is [paid in full / due by [date] via [method]].

If anything comes up before your arrival, call or text me at [phone].

Best regards,
[Host Name]`,
      },
    ],
  },
  {
    id: "midstay",
    title: "Mid-stay follow-up",
    shortLabel: "Mid-stay",
    purpose: "Check in during the stay and surface any issues early.",
    whenToSend:
      "Morning of day two, and only on stays of three nights or more.",
    whyThisTiming:
      "Long enough that a small problem is worth catching, early enough that you can still fix it. On a one or two night stay it reads as hovering.",
    variants: [
      {
        label: "Warm",
        body: `Hello [Guest Name],

We hope you've settled in comfortably! How is your stay going so far? If there's anything you need or any concerns, please let us know. We'd be happy to assist and make adjustments to ensure a 5-star experience.

Thank you for choosing to stay with us, and enjoy the rest of your visit!

Best regards,
[Host Name]`,
      },
      {
        label: "Brief",
        body: `Hi [Guest Name], hope [Property Name] is treating you well!

No need to reply if all is good. If anything is off, tell me now and I'll fix it while you're still here.

[Host Name]`,
      },
      {
        label: "Detailed",
        body: `Hello [Guest Name],

We hope you've settled in comfortably! You're about halfway through your stay, so this is a good moment to check that everything is working the way it should.

A few things worth flagging if they aren't right:
- Heating or cooling, and whether the thermostat is behaving
- Wi-Fi speed
- Towels, linens, or anything running low
- Anything in the kitchen or bathroom that needs attention

No reply needed if everything is good. If something is off, tell me now and I'll get it handled while you're still here rather than reading about it after you've gone.

Enjoy the rest of your visit!

Best regards,
[Host Name]`,
      },
    ],
  },
  {
    id: "issue",
    title: "Addressing an issue",
    shortLabel: "Issue",
    purpose: "Respond quickly and warmly when something goes wrong.",
    whenToSend: "Inside fifteen minutes, even if you do not have the fix yet.",
    whyThisTiming:
      "Silence is what turns an inconvenience into a review. Acknowledging fast buys you the time to actually solve it.",
    variants: [
      {
        label: "Warm",
        body: `Hello [Guest Name],

We're so sorry to hear about this inconvenience. Please share more details so we can resolve the matter promptly. We're committed to ensuring your comfort and satisfaction.

If urgent, please call us directly at [phone].

Warm regards,
[Host Name]`,
      },
      {
        label: "Brief",
        body: `Hi [Guest Name], I'm on this.

Sorry about [issue]. Give me until [time] and I'll have an answer for you.

If it's urgent, call me directly at [phone].

[Host Name]`,
      },
      {
        label: "Detailed",
        body: `Hello [Guest Name],

Thank you for telling me, and I'm sorry about [issue]. Here is exactly what happens next.

1. [What you are doing right now, for example "I've called our plumber."]
2. [When you expect it resolved, with a real time: "He can be there by 3:00 PM today."]
3. [What the guest needs to do, if anything: "Someone will need to let him in, or I can use the lockbox with your okay."]

I'll message you the moment that changes. If it's urgent before then, call me directly at [phone] rather than messaging and I'll pick up.

Thank you for your patience with this.

Warm regards,
[Host Name]`,
      },
    ],
  },
  {
    id: "review",
    title: "Post-stay review request",
    shortLabel: "Review",
    purpose: "Encourage a happy guest to leave a 5-star review.",
    whenToSend: "The morning after checkout. Once, and never twice.",
    whyThisTiming:
      "Late enough that they are home and the trip feels good, early enough to beat the review window closing. A second ask reads as nagging.",
    variants: [
      {
        label: "Warm",
        body: `Hello [Guest Name],

Thank you for staying with us! We hope you enjoyed your time and that everything met your expectations. If you had a positive experience, we'd greatly appreciate it if you could leave a 5-star review to share your thoughts.

We look forward to hosting you again in the future. Safe travels!

Best regards,
[Host Name]`,
      },
      {
        label: "Brief",
        body: `[Guest Name], thanks again for staying with us! Hope you got home easily.

If you have a minute, a review makes a real difference for a small host like us.

And if anything fell short, I'd rather hear it from you directly first.

[Host Name]`,
      },
      {
        label: "Detailed",
        body: `Hello [Guest Name],

Thank you for staying with us! We hope [Property Name] was comfortable and that the trip went the way you wanted it to.

If you have sixty seconds, we'd be grateful for a review on [platform]. Reviews are genuinely what decide whether the next guest books with a small operator like us, so it matters more than it probably seems.

If anything about your stay fell short of five stars, I'd honestly rather hear it from you directly first so we can make it right and fix it for the next guest.

Either way, you were a pleasure to host, and you're welcome back anytime.

Best regards,
[Host Name]`,
      },
    ],
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const GUEST_FAQS: FaqItem[] = [
  {
    q: "What is included in the co-living space?",
    a: "Our co-living spaces are fully furnished and include all utilities such as high-speed Wi-Fi, electricity, and water. You'll also have access to shared amenities like the kitchen, living room, and laundry facilities (if applicable). Let us know if you'd like more details!",
  },
  {
    q: "How do I know if co-living is right for me?",
    a: "Co-living is great if you're looking for affordable housing, a sense of community, and flexibility. It's perfect for students, remote workers, and professionals. If you value shared experiences and want to connect with like-minded people, co-living might be just what you're looking for!",
  },
  {
    q: "Are there house rules I should know about?",
    a: "Yes, we have a few house rules to ensure a peaceful environment for everyone: keeping noise down during quiet hours, cleaning up after yourself in shared spaces, and respecting others' privacy. I'd be happy to send you the full list!",
  },
  {
    q: "Can I personalize my room?",
    a: "Absolutely! While the room is fully furnished, you're welcome to add personal touches like bedding, decor, or small items to make it feel like home. If you have specific questions about changes, let me know!",
  },
  {
    q: "What happens if I have an issue with another tenant?",
    a: "If any issues arise, I recommend speaking with your housemate directly first. If the matter isn't resolved, feel free to reach out to us. We're here to mediate and ensure everyone has a comfortable living experience.",
  },
  {
    q: "Are guests allowed to visit?",
    a: "Yes, you're welcome to have visitors, but we ask that you follow our guest policy. Visitors are typically allowed during certain hours, and overnight stays should be approved beforehand. Let me know if you'd like to review the full policy!",
  },
  {
    q: "Are pets allowed in the space?",
    a: "Pet policies vary by property. Some spaces allow pets with an additional fee or deposit, while others do not. Let me know if you're traveling with a pet and I'll confirm for you!",
  },
  {
    q: "What safety measures are in place?",
    a: "Your safety is our priority! Our property includes secure locks, outdoor lighting, and in some cases security cameras in common areas. Let me know if you'd like more details about specific measures!",
  },
  {
    q: "How are shared spaces maintained?",
    a: "We have regular cleaning services for shared spaces to keep everything tidy. We also ask tenants to clean up after themselves so the space stays welcoming for everyone.",
  },
  {
    q: "Can I check in early?",
    a: "We'd love to accommodate early check-ins when possible. It depends on our cleaning schedule and prior guest check-outs. Let me know your preferred time and I'll confirm availability!",
  },
  {
    q: "Can I drop off my bags before check-in?",
    a: "Yes, you can drop off your bags while the space is being prepared. Please note we cannot be responsible for items left unattended, so secure any valuables. Let me know what works for you!",
  },
  {
    q: "Is there parking available?",
    a: "Parking options vary by property. Some have driveway spaces, others rely on nearby street parking or lots. Let me know your needs and I'll confirm the best option!",
  },
  {
    q: "Is the kitchen shared or private?",
    a: "The kitchen is shared among housemates and fully equipped with all major appliances. It's a great space to cook and connect with others!",
  },
  {
    q: "Are utilities included in the rent?",
    a: "Yes, all utilities including Wi-Fi, water, electricity, and heating are included in the monthly rent. Let me know if you have any other questions!",
  },
  {
    q: "Can I extend my stay?",
    a: "We'd be happy to accommodate an extended stay if the dates are available! Let me know your preferred check-out date and I'll confirm availability for you.",
  },
  {
    q: "Is there a laundromat nearby?",
    a: "Yes, the nearest laundromat is [Name/Location], about [distance] away. It's clean, affordable, and easy to use. Let me know if you need directions!",
  },
  {
    q: "What is the Wi-Fi password?",
    a: "The Wi-Fi network and password are [network and password]. If you have any trouble connecting, let me know!",
  },
  {
    q: "Is there extra storage space?",
    a: "Yes, we offer some additional storage options. Let me know your specific storage needs and I'll do my best to accommodate you!",
  },
  {
    q: "Can I pay directly or early?",
    a: "All payments are processed securely through [platform name]. We don't handle direct payments, but I recommend contacting the platform for assistance with early payments.",
  },
  {
    q: "What's the best way to get around the area?",
    a: "Our property is conveniently located near public transportation. There's also rideshare availability and bike rentals nearby. Let me know if you'd like recommendations or directions!",
  },
];
