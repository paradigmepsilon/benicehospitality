// Guest Correspondence Templates — reference content. Digitized from Della's
// "Guest Correspondences Template" handout: ready-to-send message templates for
// each stage of the guest journey, plus 20 FAQ answers in a host's voice.
// Placeholders are in [brackets] for the operator to fill in.

export interface MessageTemplate {
  id: string;
  title: string;
  purpose: string;
  body: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "inquiry",
    title: "Initial inquiry",
    purpose: "Respond to a potential guest interested in your property.",
    body: `Thank you for inquiring about our property! [Answer their question(s) clearly — availability, features of the space, etc.]

If you have any additional questions or need more details, feel free to reach out. We'd be delighted to host you.

Best regards,
[Host Name]`,
  },
  {
    id: "booking-auto",
    title: "Booking confirmation (automated platforms)",
    purpose: "Confirm a booking made through Airbnb or a similar platform.",
    body: `Greetings [Guest Name],

Thank you for booking with us! We're thrilled to welcome you. You'll find check-in instructions and the property address in the reservation details on your booking app.

If you need any assistance during your stay, don't hesitate to contact us at [phone] or [email].

Looking forward to hosting you,
[Host Name]`,
  },
  {
    id: "booking-manual",
    title: "Booking confirmation (manual)",
    purpose: "Confirm a direct booking and share full check-in details.",
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
    id: "midstay",
    title: "Mid-stay follow-up",
    purpose: "Check in during the stay and surface any issues early.",
    body: `Hello [Guest Name],

We hope you've settled in comfortably! How is your stay going so far? If there's anything you need or any concerns, please let us know. We'd be happy to assist and make adjustments to ensure a 5-star experience.

Thank you for choosing to stay with us, and enjoy the rest of your visit!

Best regards,
[Host Name]`,
  },
  {
    id: "issue",
    title: "Addressing an issue",
    purpose: "Respond quickly and warmly when something goes wrong.",
    body: `Hello [Guest Name],

We're so sorry to hear about this inconvenience. Please share more details so we can resolve the matter promptly. We're committed to ensuring your comfort and satisfaction.

If urgent, please call us directly at [phone].

Warm regards,
[Host Name]`,
  },
  {
    id: "review",
    title: "Post-stay review request",
    purpose: "Encourage a happy guest to leave a 5-star review.",
    body: `Hello [Guest Name],

Thank you for staying with us! We hope you enjoyed your time and that everything met your expectations. If you had a positive experience, we'd greatly appreciate it if you could leave a 5-star review to share your thoughts.

We look forward to hosting you again in the future. Safe travels!

Best regards,
[Host Name]`,
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const GUEST_FAQS: FaqItem[] = [
  { q: "What is included in the co-living space?", a: "Our co-living spaces are fully furnished and include all utilities such as high-speed Wi-Fi, electricity, and water. You'll also have access to shared amenities like the kitchen, living room, and laundry facilities (if applicable). Let us know if you'd like more details!" },
  { q: "How do I know if co-living is right for me?", a: "Co-living is great if you're looking for affordable housing, a sense of community, and flexibility. It's perfect for students, remote workers, and professionals. If you value shared experiences and want to connect with like-minded people, co-living might be just what you're looking for!" },
  { q: "Are there house rules I should know about?", a: "Yes, we have a few house rules to ensure a peaceful environment for everyone: keeping noise down during quiet hours, cleaning up after yourself in shared spaces, and respecting others' privacy. I'd be happy to send you the full list!" },
  { q: "Can I personalize my room?", a: "Absolutely! While the room is fully furnished, you're welcome to add personal touches like bedding, decor, or small items to make it feel like home. If you have specific questions about changes, let me know!" },
  { q: "What happens if I have an issue with another tenant?", a: "If any issues arise, I recommend speaking with your housemate directly first. If the matter isn't resolved, feel free to reach out to us. We're here to mediate and ensure everyone has a comfortable living experience." },
  { q: "Are guests allowed to visit?", a: "Yes, you're welcome to have visitors, but we ask that you follow our guest policy. Visitors are typically allowed during certain hours, and overnight stays should be approved beforehand. Let me know if you'd like to review the full policy!" },
  { q: "Are pets allowed in the space?", a: "Pet policies vary by property. Some spaces allow pets with an additional fee or deposit, while others do not. Let me know if you're traveling with a pet and I'll confirm for you!" },
  { q: "What safety measures are in place?", a: "Your safety is our priority! Our property includes secure locks, outdoor lighting, and in some cases security cameras in common areas. Let me know if you'd like more details about specific measures!" },
  { q: "How are shared spaces maintained?", a: "We have regular cleaning services for shared spaces to keep everything tidy. We also ask tenants to clean up after themselves so the space stays welcoming for everyone." },
  { q: "Can I check in early?", a: "We'd love to accommodate early check-ins when possible. It depends on our cleaning schedule and prior guest check-outs. Let me know your preferred time and I'll confirm availability!" },
  { q: "Can I drop off my bags before check-in?", a: "Yes, you can drop off your bags while the space is being prepared. Please note we cannot be responsible for items left unattended, so secure any valuables. Let me know what works for you!" },
  { q: "Is there parking available?", a: "Parking options vary by property. Some have driveway spaces, others rely on nearby street parking or lots. Let me know your needs and I'll confirm the best option!" },
  { q: "Is the kitchen shared or private?", a: "The kitchen is shared among housemates and fully equipped with all major appliances. It's a great space to cook and connect with others!" },
  { q: "Are utilities included in the rent?", a: "Yes, all utilities including Wi-Fi, water, electricity, and heating are included in the monthly rent. Let me know if you have any other questions!" },
  { q: "Can I extend my stay?", a: "We'd be happy to accommodate an extended stay if the dates are available! Let me know your preferred check-out date and I'll confirm availability for you." },
  { q: "Is there a laundromat nearby?", a: "Yes, the nearest laundromat is [Name/Location], about [distance] away. It's clean, affordable, and easy to use. Let me know if you need directions!" },
  { q: "What is the Wi-Fi password?", a: "The Wi-Fi network and password are [network and password]. If you have any trouble connecting, let me know!" },
  { q: "Is there extra storage space?", a: "Yes, we offer some additional storage options. Let me know your specific storage needs and I'll do my best to accommodate you!" },
  { q: "Can I pay directly or early?", a: "All payments are processed securely through [platform name]. We don't handle direct payments, but I recommend contacting the platform for assistance with early payments." },
  { q: "What's the best way to get around the area?", a: "Our property is conveniently located near public transportation. There's also rideshare availability and bike rentals nearby. Let me know if you'd like recommendations or directions!" },
];
