import { type ReferenceContent } from "@/components/resources/ReferenceTool";

// Inbound Inquiry Script Bank: two copy-and-send replies for each common inquiry,
// so a message becomes a tour and a tour becomes a move-in. Brackets like [price]
// are yours to fill in.
export const SCRIPT_CONTENT: ReferenceContent = {
  sections: [
    {
      intro:
        "Speed wins the booking. Find the inquiry you just received, copy the version that fits your voice, drop in your details, and reply within the hour. Every script ends by pointing to the next step.",
    },
    {
      heading: '"Is this room still available?"',
      columns: 2,
      items: [
        {
          meta: "Friendly + informational",
          copy: true,
          copyLabel: "Copy",
          body: "Yes, it's still available! It's a private room in a shared home with vetted housemates. Rent is $[price] and that includes [utilities / Wi-Fi / etc.]. Would you like the tour link or an application?",
        },
        {
          meta: "Short + direct",
          copy: true,
          copyLabel: "Copy",
          body: "It is! We're currently booking tours. Want me to send the link?",
        },
      ],
    },
    {
      heading: '"How much is rent?"',
      columns: 2,
      items: [
        {
          meta: "Detail + offer",
          copy: true,
          body: "This room is $[price]/month and that includes utilities, Wi-Fi, and weekly cleaning of shared spaces. Let me know if you'd like a virtual tour or to schedule a showing.",
        },
        {
          meta: "Value-forward",
          copy: true,
          body: "Great question! It's $[price], and that includes a fully furnished room, shared kitchen, and community vibes without the drama. Want me to walk you through what's included?",
        },
      ],
    },
    {
      heading: '"Where is it located?"',
      columns: 2,
      items: [
        {
          meta: "General area",
          copy: true,
          body: "The home is in [Neighborhood / Area], close to [landmark, transit, or school]. Safe, quiet, and super accessible. Want the exact location for touring?",
        },
        {
          meta: "Tease + offer",
          copy: true,
          body: "We're right in [general area], walkable to [grocery / campus / etc.]. Perfect balance of convenience and calm. I can send over the tour link or more info if you'd like!",
        },
      ],
    },
    {
      heading: '"How long is the lease?"',
      columns: 2,
      items: [
        {
          meta: "If flexible",
          copy: true,
          body: "We offer [month-to-month / 3- or 6-month minimum] depending on the room. Let me know what you're looking for, we're pretty flexible.",
        },
        {
          meta: "If fixed",
          copy: true,
          body: "It's a [6- / 12-month] lease with the option to renew. We've had tenants stay over a year because they love it here. Would you like to check out the room?",
        },
      ],
    },
    {
      heading: '"I\'m interested, how do I apply?"',
      columns: 2,
      items: [
        {
          meta: "Direct link + prompt",
          copy: true,
          body: "Awesome! You can apply here: [insert link]. Once your info is in, I'll follow up with next steps. Let me know if you want to tour first.",
        },
        {
          meta: "Funnel to a tour first",
          copy: true,
          body: "Great! Most people do a quick tour first, virtual or in person. Want to schedule one now, or skip straight to the application?",
        },
      ],
    },
    {
      heading: "Ghost-prevention follow-up (no reply)",
      columns: 2,
      items: [
        {
          meta: "Light + casual",
          copy: true,
          body: "Just checking in, still interested in the room? We've had a few messages come in, so I wanted to give you first dibs before it's gone!",
        },
        {
          meta: "Friendly reminder",
          copy: true,
          body: "Hey! Not sure if you had a chance to look at the info I sent. Still happy to show the room or answer questions if you're thinking about moving soon.",
        },
      ],
    },
    {
      heading: '"That\'s more than I expected to pay"',
      columns: 2,
      items: [
        {
          meta: "Value-based",
          copy: true,
          body: "Totally get that. The price reflects that it's fully furnished, all utilities included, and shared with screened, clean roommates. No surprise costs or stress. Let me know if you'd like to compare options, we sometimes have lower-priced rooms open.",
        },
        {
          meta: "Flexible option offer",
          copy: true,
          body: "Understandable. We sometimes have smaller or short-term rooms open too. Can I check what's coming up in your budget range?",
        },
      ],
    },
  ],
};
