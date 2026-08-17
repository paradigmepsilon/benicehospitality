// 30-Day Social Posting Calendar.
//
// Every day is a full production brief, not a prompt: which platform it goes
// to, what to cross-post, the format and length, when to post, what the post is
// actually FOR, a shot/build list, a call to action, and a hashtag set.
//
// THE VARIANTS ARE THE POINT. Every day carries three interchangeable angles
// (hook + caption). SocialCalendarTool picks one per day from a seed stored in
// the visitor's browser, so two operators who download this in the same week do
// not post word-for-word identical captions. Re-roll one day or reshuffle the
// whole month from the tool's action bar.
//
// Bracketed tokens ([City], [Neighborhood], [$RENT], [DATE]) are deliberate:
// the setup tab tells the operator to replace every one before posting, and the
// tool surfaces a reminder. Keep the token spellings consistent across days so
// a find-and-replace pass catches all of them at once.

export interface DayVariant {
  /** First line / first two seconds. What stops the scroll. */
  hook: string;
  /** The full copy-ready caption. This is what the Copy button hands over. */
  caption: string;
}

export interface CalendarDay {
  day: number;
  /** Short name for the post, e.g. "Room tour". */
  title: string;
  /** Where it primarily goes. */
  platform: string;
  /** Where the same asset gets reused. */
  crossPost: string;
  /** Content type and length. */
  format: string;
  /** Suggested slot, in the operator's local time. */
  bestTime: string;
  /** One line: what this post is supposed to accomplish. */
  goal: string;
  /** Shot list for video, or build list for a graphic/carousel. */
  build: string[];
  cta: string;
  hashtags: string;
  /** Three interchangeable angles. The tool picks one; the user can re-roll. */
  variants: DayVariant[];
}

export interface CalendarWeek {
  id: string;
  shortLabel: string;
  heading: string;
  /** The theme in three or four words, shown on every day card in the week. */
  theme: string;
  intro: string;
  /** What a good week looks like, in numbers the operator can actually check. */
  success: string;
  days: CalendarDay[];
}

// ---------------------------------------------------------------------------
// Setup tab
// ---------------------------------------------------------------------------

export interface SetupBlock {
  heading: string;
  body?: string;
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
}

export const SETUP_BLOCKS: SetupBlock[] = [
  {
    heading: "The four places a room actually fills",
    body: "You do not need to be everywhere. You need to be in the four places renters in your market already are. Each day in this calendar names a primary platform and a cross-post, and they map to these.",
    bullets: [
      "Facebook page + local groups. This is the workhorse. Rooms fill here more than anywhere else. Post to your page, then share the same post into two or three local groups.",
      "Instagram. Reels for reach, Stories for the people already following you, feed posts for anything that has to look credible when someone checks you out.",
      "TikTok. Pure reach. Same vertical video you shot for Reels, posted natively. Costs you nothing extra.",
      "Nextdoor. Small but hyperlocal, and the audience skews toward people who already live in the neighborhood and know someone looking.",
    ],
  },
  {
    heading: "Before day one: a 30-minute setup",
    bullets: [
      "Set your Facebook page name to include your city, for example \"[City] Co-Living Rooms\". People search platform-side by city.",
      "Join three to five local Facebook groups: \"[City] Housing\", \"[City] Rooms for Rent\", \"[City] Travel Nurses\", plus any group for the nearest hospital, base, or campus. Read their rules. Some allow one listing post per week only.",
      "Put your booking or application link in every bio. One link, same everywhere.",
      "Turn on Instagram DM quick replies for the three questions you will get every time: what is included, what is the deposit, when can I see it.",
      "Create a Facebook Marketplace listing for the open room and refresh it weekly. The calendar's photo assets feed it directly.",
    ],
  },
  {
    heading: "Batch it in one afternoon",
    body: "Do not shoot daily. Block three hours once a week and capture everything for the next seven days while a room is clean and the light is good.",
    bullets: [
      "Shoot all video first, in one pass through the house: room tour, hallway walk-in, kitchen, bathroom, exterior, and street.",
      "Take 20 to 30 stills in the same pass. Wide shot of every room, plus close-ups of the details that justify the price.",
      "Write the week's captions in one sitting using this calendar, replacing every bracketed token.",
      "Load all seven into your scheduler on Sunday. Buffer, Later, and Meta Business Suite all do this free at this volume.",
      "Leave Stories unscheduled. Those are meant to feel same-day, and they take 60 seconds.",
    ],
  },
  {
    heading: "Your hashtag sets",
    body: "Build these once, save them in your phone's text replacement, and stop thinking about them. Five to eight tags is plenty. More looks desperate and does not help.",
    bullets: [
      "Local set: #[City]RoomsForRent #[City]Housing #[City]Rentals #[Neighborhood] #MovingTo[City]",
      "Co-living set: #CoLiving #RoomForRent #SharedHousing #FurnishedRoom #RentByTheRoom",
      "Audience set: #TravelNurseHousing #TravelNurse[City] #RelocationHousing #MidTermRental",
      "Operator set, for the posts aimed at other landlords: #RentalPropertyTips #LandlordLife #RealEstateInvesting #PropertyManagement",
    ],
  },
  {
    heading: "When to post",
    table: {
      head: ["Slot", "Best for", "Why"],
      rows: [
        ["Weekdays 7 to 9am", "Text posts, group posts", "Commute scroll. People read, they do not watch."],
        ["Weekdays 12 to 1pm", "Carousels, photo posts", "Lunch break. Highest save rate of the day."],
        ["Weekdays 6 to 8pm", "Reels, video, tours", "Couch scroll. Sound on, longest watch time."],
        ["Weeknights 8 to 9pm", "Stories, polls, questions", "The people already following you are awake and bored."],
        ["Saturday 11am to 1pm", "TikTok, high-reach video", "Weekend browsing peak for housing searches."],
        ["Sunday 6 to 9pm", "Anything that needs a decision", "Sunday night is when people decide to move."],
      ],
    },
  },
  {
    heading: "The only metric that matters",
    body: "Ignore likes. Track DMs and comments that ask a question, because those are the only two things that turn into a signed room. A post with 40 views and 2 real questions beat a post with 4,000 views and none.",
    bullets: [
      "Count inquiries per week, not followers.",
      "Note which day number produced each inquiry. After 30 days you will know your three best post types.",
      "Repeat those three next month and drop the ones that produced nothing.",
      "Reply to every comment within an hour if you can. Platform reach follows fast replies.",
    ],
  },
  {
    heading: "Replace these before you post",
    body: "Every caption in this calendar uses the same tokens so one find-and-replace pass catches them all: [City], [Neighborhood], [$RENT], [DATE], [LINK].",
  },
];

// ---------------------------------------------------------------------------
// The 30 days
// ---------------------------------------------------------------------------

export const CALENDAR_WEEKS: CalendarWeek[] = [
  {
    id: "week1",
    shortLabel: "Week 1",
    heading: "Week 1 — Visibility + Availability",
    theme: "Visibility + Availability",
    intro:
      "Week one exists to make two facts unmissable: you exist, and a room is open at a specific price. Nobody is deciding yet. You are just getting into the feed of people who did not know this option was available in their city. Lead with the room and the number every single day.",
    success:
      "Good week one: 3 to 8 real inquiries, at least one group post with 20+ comments, and your Facebook page picking up its first 20 local follows.",
    days: [
      {
        day: 1,
        title: "The room tour",
        platform: "Instagram Reel + TikTok",
        crossPost: "Facebook page, then share into one local group",
        format: "Vertical video, 30 to 45 seconds, sound on",
        bestTime: "Tuesday 6 to 8pm",
        goal: "Show the actual room so nobody has to imagine it. This is the single highest-performing post you will make all month.",
        build: [
          "Open on the closed bedroom door, then push through it. The reveal is the hook.",
          "Slow pan: bed, then desk or work surface, then closet, then window light.",
          "Cut to the shared kitchen for three seconds, then the bathroom for three.",
          "End on the exterior or the street so they can place it geographically.",
          "Shoot at the brightest time of day. Turn on every lamp anyway. Clean it first.",
        ],
        cta: "Comment ROOM and I will send you the details.",
        hashtags: "#[City]RoomsForRent #[City]Housing #CoLiving #RoomForRent #[Neighborhood] #FurnishedRoom",
        variants: [
          {
            hook: "This is what [$RENT] a month gets you in [City].",
            caption:
              "This is what [$RENT] a month gets you in [City].\n\nPrivate furnished bedroom in [Neighborhood]. Utilities, wifi, and cleaning of the shared spaces are all included in that number. You bring a suitcase.\n\nShared kitchen, shared living room, your own lockable room. Month to month, so you are not signing away a year to find out whether you like the city.\n\nOne room open right now.\n\nComment ROOM and I will send you the details.",
          },
          {
            hook: "Everyone says [City] is unaffordable. Here is a room for [$RENT].",
            caption:
              "Everyone says [City] is unaffordable. Here is a private room in [Neighborhood] for [$RENT] a month.\n\nFurnished. Utilities and wifi included. Shared kitchen and living room, your own room with a lock on it.\n\nNo year lease. No furniture to buy. No utility accounts to set up in your name.\n\nIt is not a whole apartment and it is not pretending to be. It is a clean private room in a good neighborhood at a number that leaves you money at the end of the month.\n\nComment ROOM and I will send you the details.",
          },
          {
            hook: "Walk through it with me.",
            caption:
              "Walk through it with me. Private room, [Neighborhood], [$RENT] a month.\n\nHere is what is actually in that number: the room furnished the way you see it, all utilities, wifi, and the shared spaces cleaned on a schedule instead of whenever somebody feels like it.\n\nMonth to month. Move-in as soon as [DATE].\n\nIf you are relocating, on contract, or just done with paying for an entire apartment you use one room of, this is the version of [City] housing nobody advertises.\n\nComment ROOM and I will send you the details.",
          },
        ],
      },
      {
        day: 2,
        title: "What the rent actually covers",
        platform: "Facebook page + two local groups",
        crossPost: "Instagram feed as a single image or 3-slide carousel",
        format: "Photo post, one strong shared-space image",
        bestTime: "Wednesday 12 to 1pm",
        goal: "Kill the biggest objection early. Most people assume the price is the start of the bill, not the end of it.",
        build: [
          "One photograph of the shared living room or kitchen, shot wide, at the brightest hour.",
          "Tidy the counters completely. One plant, one bowl, nothing else.",
          "Shoot from a corner at chest height so the room looks its actual size.",
          "If you make it a carousel: slide 1 the room, slide 2 the kitchen, slide 3 a plain text list of what is included.",
        ],
        cta: "Message me and I will send the full breakdown and available dates.",
        hashtags: "#[City]Housing #[City]RoomsForRent #CoLiving #SharedHousing #RentByTheRoom",
        variants: [
          {
            hook: "What [$RENT] a month in [City] actually includes.",
            caption:
              "What [$RENT] a month in [City] actually includes:\n\nYour furnished private room\nElectric, water, and gas\nWifi\nCleaning of all shared spaces\nAll kitchen equipment, cookware, and dishes\nWasher and dryer in the house\n\nWhat it does not include: a deposit larger than one month, a year-long lease, a furniture bill, or four utility accounts opened in your name.\n\nThat is the whole number. There is no second bill.\n\nMessage me and I will send the full breakdown and available dates.",
          },
          {
            hook: "The rent is the whole bill. That is the entire pitch.",
            caption:
              "The rent is the whole bill. That is the entire pitch.\n\nA one bedroom in [Neighborhood] runs you rent, plus a deposit, plus electric, plus gas, plus water, plus internet, plus furnishing an empty apartment, plus a twelve month commitment.\n\nHere it is [$RENT] a month. Furnished room, all utilities, wifi, shared spaces cleaned. Month to month.\n\nI did the math both ways for a tenant last month and the gap was almost eleven hundred dollars in the first month alone.\n\nMessage me and I will send the full breakdown and available dates.",
          },
          {
            hook: "Nobody puts the real number in the listing. Here it is.",
            caption:
              "Nobody puts the real number in the listing, so here it is.\n\n[$RENT] a month, in [Neighborhood], covers: the furnished room, electric, water, gas, wifi, and cleaning of every shared space in the house.\n\nOne deposit, equal to one month. No application fee games. Month to month after that.\n\nI would rather you know exactly what you are paying before you ever message me than find out on move-in day. That is how this is supposed to work.\n\nMessage me and I will send the full breakdown and available dates.",
          },
        ],
      },
      {
        day: 3,
        title: "The roommate poll",
        platform: "Instagram Story + Facebook Story",
        crossPost: "Screenshot the results tomorrow and reshare",
        format: "Story with a poll sticker, one frame",
        bestTime: "Thursday 8 to 9pm",
        goal: "Cheap engagement that teaches the algorithm who your audience is, and gives you a data point to post about later.",
        build: [
          "Photo of the shared living room as the background, dimmed slightly so the text reads.",
          "Poll sticker with two options. Keep them short: \"Yes, easily\" and \"No way\".",
          "Save the result. Day 13 and Day 20 both reference it.",
          "Reply to everyone who votes with a one-line DM. That is the actual point of a poll.",
        ],
        cta: "Vote, then DM me if you want to see the room.",
        hashtags: "Stories do not need hashtags. Add one location sticker for [City].",
        variants: [
          {
            hook: "Would you live with roommates to save a thousand a month?",
            caption:
              "Would you live with roommates to save a thousand dollars a month?\n\nBe honest.\n\nVote, then DM me if you want to see the room.",
          },
          {
            hook: "Honest question for [City].",
            caption:
              "Honest question for [City].\n\nIf a private furnished room with all utilities included saved you about a thousand dollars a month versus your own place, would you do it?\n\nVote, then DM me if you want to see the room.",
          },
          {
            hook: "One thousand dollars a month. Would you trade the privacy?",
            caption:
              "One thousand dollars a month.\n\nThat is roughly the gap between renting a room and renting your own one bedroom in [City] right now.\n\nWould you trade the extra privacy for it?\n\nVote, then DM me if you want to see the room.",
          },
        ],
      },
      {
        day: 4,
        title: "Why co-living instead of a short-term rental",
        platform: "Facebook page + Nextdoor",
        crossPost: "Instagram feed",
        format: "Text post with one exterior photo",
        bestTime: "Friday 7 to 9am",
        goal: "Position yourself as an operator with a reason, not somebody who could not fill an Airbnb. This is the post neighbors screenshot.",
        build: [
          "One exterior photo of the house, shot from across the street in morning light.",
          "No graphics. This one should look like a person wrote it, because a person did.",
          "Keep it under 150 words. Long posts die in groups.",
          "Post it to Nextdoor separately. Do not cross-post automatically, the tone should be slightly more neighborly there.",
        ],
        cta: "If you know someone relocating to [City], send them my way.",
        hashtags: "#[City]Housing #CoLiving #[Neighborhood] #MidTermRental #RentByTheRoom",
        variants: [
          {
            hook: "I could run this house as a short-term rental. I do not, on purpose.",
            caption:
              "I could run this house as a short-term rental. I do not, on purpose.\n\nCo-living means the same people are here for months instead of a new group every weekend. No suitcases rolling in at midnight. No parties. No revolving door on the street.\n\nMy residents are travel nurses, people on work contracts, and folks who just relocated and are not ready to sign a year lease in a city they do not know yet.\n\nQuieter for the neighborhood, steadier for me, cheaper for them. Everybody gets something.\n\nIf you know someone relocating to [City], send them my way.",
          },
          {
            hook: "The nightly rental math works. I still chose the other thing.",
            caption:
              "The nightly rental math works on paper. I still chose the other thing.\n\nRenting this house by the room means I know everybody who sleeps here. They stay three months, six months, sometimes a year. They get a mailbox. They learn the neighbors' names.\n\nShort-term means a new set of strangers every weekend and a neighborhood that starts to resent the address.\n\nI would rather have four people who live here than two hundred people who stayed here.\n\nIf you know someone relocating to [City], send them my way.",
          },
          {
            hook: "Here is what co-living actually means on my street.",
            caption:
              "Here is what co-living actually means on my street in [Neighborhood].\n\nFour private rooms. Four adults with jobs. Shared kitchen, shared living room, everybody screened the same way a landlord would screen a lease applicant.\n\nIt is not a hostel and it is not a party house. It is the same house it was, with a rent structure that lets a travel nurse on a thirteen week contract actually afford to live here.\n\nMonth to month, furnished, utilities included.\n\nIf you know someone relocating to [City], send them my way.",
          },
        ],
      },
      {
        day: 5,
        title: "POV: your first walk-in",
        platform: "Instagram Reel + TikTok",
        crossPost: "Facebook page",
        format: "Vertical video, 15 to 25 seconds, trending audio",
        bestTime: "Saturday 11am to 1pm",
        goal: "Emotional, not informational. This is the post that gets shared to someone else's group chat.",
        build: [
          "Shoot handheld at eye height, walking. Phone stays vertical and steady, not gimbal-smooth. Slightly raw performs better here.",
          "Front door opens, walk down the hall, push open the bedroom door, stop.",
          "One on-screen text card at the top, held the whole clip. Do not stack five cards.",
          "Use whatever audio is trending that week, at low volume. The visual carries it.",
          "No price on screen. This one is about the feeling. The price lives in the caption.",
        ],
        cta: "Comment your city and I will tell you if we have something like this there.",
        hashtags: "#POV #[City]Apartments #[City]RoomsForRent #MovingTo[City] #FurnishedRoom #RoomTour",
        variants: [
          {
            hook: "POV: the first time you walk into your new place.",
            caption:
              "POV: the first time you walk into your new place and it is already furnished, already clean, and the wifi already works.\n\nNo air mattress week. No waiting on a couch delivery. No calling the power company.\n\n[$RENT] a month in [Neighborhood], everything included, move-in [DATE].\n\nComment your city and I will tell you if we have something like this there.",
          },
          {
            hook: "POV: you accepted the contract and you fly out Sunday.",
            caption:
              "POV: you accepted the contract, you fly out Sunday, and you still have not figured out where you are sleeping.\n\nThis is the version where that is not a problem. Furnished private room, utilities on, sheets already on the bed, month to month so it ends when your contract ends.\n\n[$RENT] a month in [Neighborhood].\n\nComment your city and I will tell you if we have something like this there.",
          },
          {
            hook: "POV: you moved to [City] with two suitcases.",
            caption:
              "POV: you moved to [City] with two suitcases and that turned out to be enough.\n\nBed, desk, closet, lamp, and a lock on the door. Kitchen already stocked with everything you cook with. Utilities and wifi in the rent.\n\nYou unpack in twenty minutes and go find dinner.\n\n[$RENT] a month in [Neighborhood], available [DATE].\n\nComment your city and I will tell you if we have something like this there.",
          },
        ],
      },
      {
        day: 6,
        title: "Tenant testimonial card",
        platform: "Instagram feed + Facebook page",
        crossPost: "Reshare to your Story with a \"swipe up\" style link sticker",
        format: "Graphic, quote on a branded card, 4:5",
        bestTime: "Sunday 6 to 8pm",
        goal: "Third-party proof. Your own claims are worth a fraction of one sentence from somebody who lived there.",
        build: [
          "Text a past or current resident: \"Can I use one line about your stay on social? I will not use your last name.\" Most say yes.",
          "Use their words exactly. Do not polish it. The typos are the credibility.",
          "Card layout: quote in large text, small attribution line beneath, your logo bottom corner. Cream background, one accent color.",
          "Canva template, save it, reuse it every month. This becomes a recurring format.",
        ],
        cta: "Rooms open now in [Neighborhood]. Link in bio.",
        hashtags: "#[City]Housing #CoLiving #TenantReview #RoomForRent #[Neighborhood]",
        variants: [
          {
            hook: "From a resident who just finished her contract.",
            caption:
              "From a resident who just finished her thirteen week contract here.\n\nI ask everybody the same question when they move out: what would you tell somebody considering it? This is what she said, unedited.\n\nThis is the part of the business I actually care about. Anybody can list a room. Getting somebody to say that on their way out is the whole job.\n\nRooms open now in [Neighborhood]. Link in bio.",
          },
          {
            hook: "I did not write this. She did.",
            caption:
              "I did not write this. She did, in a text, on her last morning here.\n\nI have posted a lot about what is included and what it costs. This says more than any of that.\n\nIf you are weighing whether a private room in a shared house is a downgrade, ask somebody who has done it rather than somebody selling it.\n\nRooms open now in [Neighborhood]. Link in bio.",
          },
          {
            hook: "Six months here, and this is what he said on the way out.",
            caption:
              "Six months here, and this is what he said on the way out.\n\nHe came in on a relocation, planned to stay eight weeks, and ended up staying through the winter. That happens more than I expected when I started this.\n\nThe room does not change. What changes is that people stop treating it as a stopgap.\n\nRooms open now in [Neighborhood]. Link in bio.",
          },
        ],
      },
      {
        day: 7,
        title: "FAQ: do I need a full lease?",
        platform: "Facebook local groups + Nextdoor",
        crossPost: "Instagram Story as a text frame",
        format: "Text post, no image or one simple graphic",
        bestTime: "Monday 12 to 1pm",
        goal: "Answer the single most common question publicly, so it stops eating your DMs and starts working as marketing.",
        build: [
          "Write it as an actual answer, not a pitch. Somebody asked, you are answering.",
          "State the real term length. If it is month to month with a 30 day notice, say exactly that.",
          "Name the deposit number. Vagueness about money reads as a trap.",
          "Optional graphic: plain text on a cream card, question on top, answer underneath.",
        ],
        cta: "Any other questions, ask them here and I will answer in the comments.",
        hashtags: "#[City]RoomsForRent #[City]Housing #CoLiving #MonthToMonth #RentByTheRoom",
        variants: [
          {
            hook: "\"Do I have to sign a year lease?\" No.",
            caption:
              "Most asked question I get: do I have to sign a year lease?\n\nNo. It is a month to month room agreement with a thirty day notice on either side.\n\nDeposit is one month, [$RENT], returned within thirty days of move-out minus anything actually damaged. There is no application fee.\n\nThe reason it works that way: most of my residents are here on contracts, relocations, or a transition. Locking them into twelve months would just mean they lie about their timeline to get in, and then leave anyway.\n\nAny other questions, ask them here and I will answer in the comments.",
          },
          {
            hook: "The lease question, answered plainly.",
            caption:
              "Getting this one a lot, so here is the plain answer.\n\nThere is no twelve month lease. You sign a room agreement, month to month, thirty day notice either direction.\n\nOne month deposit at [$RENT]. No application fee. No first-and-last. No credit minimum that quietly disqualifies anybody who moved recently.\n\nI screen for income, references, and a background check, and that is it.\n\nIf you need a place for three months, take it for three months. That is what it is built for.\n\nAny other questions, ask them here and I will answer in the comments.",
          },
          {
            hook: "Somebody asked if this is a scam because there is no year lease.",
            caption:
              "Somebody asked this week whether it is a scam because there is no year lease. Fair question, so let me answer it publicly.\n\nIt is a month to month room agreement. Written, signed, thirty day notice on both sides. One month deposit at [$RENT], returned within thirty days minus real damage.\n\nYou get a signed document, a named landlord, and an address you can drive to before you pay anything. If any of those three are missing anywhere else you are looking, walk away from that one.\n\nAny other questions, ask them here and I will answer in the comments.",
          },
        ],
      },
    ],
  },
  {
    id: "week2",
    shortLabel: "Week 2",
    heading: "Week 2 — Value + Trust",
    theme: "Value + Trust",
    intro:
      "Week one got you seen. Week two answers the quiet question every serious renter is asking: is this person running a business or a side hustle? Every post this week should make the operation look organized. Screening, cleaning, what is included, and the math. This is the week that converts lurkers into inquiries.",
    success:
      "Good week two: your saves and shares climb above week one, at least two people reference a specific post in their DM, and your carousel from Day 11 outperforms everything else you posted.",
    days: [
      {
        day: 8,
        title: "What's included, line by line",
        platform: "Instagram carousel + Facebook page",
        crossPost: "Share into one local group as a photo post",
        format: "Carousel, 6 slides, 4:5",
        bestTime: "Tuesday 12 to 1pm",
        goal: "The single most saved post format. People screenshot this and send it to whoever they are deciding with.",
        build: [
          "Slide 1: the hook, big text, no photo clutter.",
          "Slides 2 through 5: one included item per slide with the photo that proves it. Kitchen. Laundry. Wifi speed test screenshot. Cleaning supplies closet.",
          "Slide 6: the price, the availability date, and the call to action.",
          "Same font and same background on every slide. Consistency is what makes it look professional.",
          "Run an actual speed test and screenshot it. Nobody else does this and it lands every time.",
        ],
        cta: "Save this for when you start looking. Then DM me.",
        hashtags: "#[City]RoomsForRent #CoLiving #FurnishedRoom #[City]Housing #SharedHousing #MidTermRental",
        variants: [
          {
            hook: "Everything included in [$RENT] a month. All of it.",
            caption:
              "Everything included in [$RENT] a month. All of it, nothing held back for a second invoice.\n\nFurnished private room. Electric, water, gas. Wifi that actually holds a video call. Washer and dryer. A fully equipped kitchen. Shared spaces cleaned on a schedule, by somebody I pay, not by whoever cracks first.\n\nOne deposit at one month. Month to month after that.\n\nSave this for when you start looking. Then DM me.",
          },
          {
            hook: "Six slides, zero surprises.",
            caption:
              "Six slides, zero surprises. Here is the complete list of what [$RENT] a month covers in [Neighborhood].\n\nI put the wifi speed test in there because everybody asks and nobody proves it. That is the real number, taken from the bedroom, not the router.\n\nIf a listing will not tell you what is included before you tour, that is the answer.\n\nSave this for when you start looking. Then DM me.",
          },
          {
            hook: "Compare this list to any listing you have looked at this week.",
            caption:
              "Compare this list to any listing you have looked at this week.\n\n[$RENT] a month in [Neighborhood] covers the furnished room, all utilities, wifi, laundry, a stocked kitchen, and professional cleaning of the shared spaces.\n\nThe one bedroom you are also considering covers the walls.\n\nI am not knocking apartments. I am saying run both numbers all the way out, including the deposit, the furniture, and the setup fees, before you decide which one is expensive.\n\nSave this for when you start looking. Then DM me.",
          },
        ],
      },
      {
        day: 9,
        title: "How I screen every applicant",
        platform: "Instagram Reel + TikTok",
        crossPost: "Facebook page",
        format: "Talking head or text-overlay video, 45 to 60 seconds",
        bestTime: "Wednesday 6 to 8pm",
        goal: "This post reassures the good applicants and scares off the bad ones. Both outcomes are wins.",
        build: [
          "If you are on camera: sit down, good light on your face, phone at eye level. Do not walk and talk.",
          "If you are not: film b-roll of the house and put the script on screen as text cards, one point per card.",
          "State your actual criteria. Income multiple, background check, references, and how long it takes.",
          "Say the part about protecting current residents out loud. That is the line that lands.",
          "Keep it under 60 seconds. This is a credibility post, not a policy document.",
        ],
        cta: "If that sounds like a place you want to live, DM me.",
        hashtags: "#CoLiving #[City]Housing #TenantScreening #RentalPropertyTips #RoomForRent",
        variants: [
          {
            hook: "I turn down more applicants than I accept. Here is why.",
            caption:
              "I turn down more applicants than I accept, and the people already living here are the reason.\n\nEvery applicant gets the same process: income verification at roughly three times the room rent, a background check, and one reference I actually call.\n\nIt takes me about 48 hours. I tell everybody yes or no. Nobody gets ghosted.\n\nWhen you share a kitchen with three other adults, who I let in matters more than how fast I fill the room. A vacant room costs me money. The wrong resident costs me the other three.\n\nIf that sounds like a place you want to live, DM me.",
          },
          {
            hook: "The screening process, start to finish, in one minute.",
            caption:
              "The screening process, start to finish.\n\nOne: you fill out the application, which takes about ten minutes.\nTwo: I verify income at roughly three times the room rent. Contract letters and offer letters count, which matters if you are a traveler.\nThree: background check.\nFour: I call one reference. An actual phone call.\nFive: you get an answer within 48 hours either way.\n\nThat is it. No credit score cutoff that disqualifies anyone who moved in the last year, and no application fee.\n\nIf that sounds like a place you want to live, DM me.",
          },
          {
            hook: "Ask any landlord this question before you sign anything.",
            caption:
              "Ask any landlord this before you sign anything: how do you screen the other people I would be living with?\n\nIf they do not have a real answer, you are the screening process.\n\nMine: income verified at about three times the room rent, background check, one reference called by phone, answer within 48 hours. Same standard for every applicant, including the ones I already like.\n\nThe people already in the house are the reason I do not skip a step when a room has been empty for two weeks.\n\nIf that sounds like a place you want to live, DM me.",
          },
        ],
      },
      {
        day: 10,
        title: "The cleaning standard",
        platform: "Instagram Story series + Facebook Story",
        crossPost: "Save it as a permanent Story Highlight called \"The House\"",
        format: "3 to 4 Story frames, filmed vertically",
        bestTime: "Thursday 8 to 9pm",
        goal: "Shared housing lives or dies on cleanliness, and everyone assumes the worst. Show the system, not the result.",
        build: [
          "Frame 1: the physical checklist, on paper or on the wall. Hold it steady enough to read.",
          "Frame 2: the cleaner working, or the supply closet stocked.",
          "Frame 3: the bathroom, clean, filmed in one unbroken pan so it cannot be staged in the edit.",
          "Frame 4: a poll or question sticker. \"What would you want cleaned weekly?\"",
          "Save all four to a Highlight. This is the one prospects rewatch before they commit.",
        ],
        cta: "DM me for the full checklist if you want to steal it for your own place.",
        hashtags: "Add a [City] location sticker. Skip hashtags on Stories.",
        variants: [
          {
            hook: "The shared spaces get cleaned on a schedule, not on a vibe.",
            caption:
              "The shared spaces get cleaned on a schedule, not on a vibe.\n\nHere is the actual checklist and the actual person doing it. Kitchen, bathrooms, living room, and floors, every week, whether anybody complained or not.\n\nResidents handle their own rooms. Everything shared is on me. That line being clear is why nobody argues about it.\n\nDM me for the full checklist if you want to steal it for your own place.",
          },
          {
            hook: "The number one fear about shared housing, handled.",
            caption:
              "The number one fear people have about shared housing is that they will end up cleaning up after three other adults.\n\nSo I took it off the table. Weekly professional cleaning of every shared space is in the rent. Nobody negotiates a chore chart. Nobody passive-aggressively leaves a note on the fridge.\n\nHere is the checklist they work from.\n\nDM me for the full checklist if you want to steal it for your own place.",
          },
          {
            hook: "Filming the bathroom in one take, on purpose.",
            caption:
              "Filming the bathroom in one unbroken pan, on purpose, because a cut is where people hide things.\n\nThis is a Thursday. Nobody knew I was filming. This is just what the house looks like when weekly cleaning is a line item instead of a group agreement.\n\nDM me for the full checklist if you want to steal it for your own place.",
          },
        ],
      },
      {
        day: 11,
        title: "5 reasons this room fills fast",
        platform: "Instagram carousel + Facebook page",
        crossPost: "Share into two local groups",
        format: "Carousel, 6 slides, 4:5",
        bestTime: "Friday 12 to 1pm",
        goal: "Highest save-rate post of the week. Built to be sent to a friend rather than acted on immediately.",
        build: [
          "Slide 1: title slide, big type, one word emphasized in your accent color.",
          "Slides 2 through 6: one reason per slide, each with a photo that proves it.",
          "Reasons should be concrete: the location, the commute time, what is included, the term flexibility, the screening.",
          "Name an actual landmark and an actual drive time. \"Twelve minutes to [hospital or employer]\" beats \"convenient location\" every time.",
          "Last slide repeats the price and the available date. Never end a carousel on a soft note.",
        ],
        cta: "Save it, send it to whoever you are deciding with, then DM me.",
        hashtags: "#[City]RoomsForRent #[Neighborhood] #CoLiving #TravelNurseHousing #[City]Housing #MidTermRental",
        variants: [
          {
            hook: "Five reasons this room fills within a week of listing it.",
            caption:
              "Five reasons this room fills within a week of listing it, every time.\n\nThe commute. Twelve minutes to [employer or hospital], and I timed it at 7am, not at midnight.\n\nThe number. [$RENT] with everything in it.\n\nThe term. Month to month, so a thirteen week contract is not a problem to explain.\n\nThe furniture. It is already there and it is not dorm furniture.\n\nThe other residents. Screened the same way you will be.\n\nSave it, send it to whoever you are deciding with, then DM me.",
          },
          {
            hook: "I have filled this room four times. Same five reasons every time.",
            caption:
              "I have filled this room four times now, and it is the same five reasons every time.\n\nIt is close to where people actually work. It is furnished so nobody buys a couch for a six month stay. The number includes everything. The term matches how long people actually need it. And the house is not a gamble, because everyone in it went through the same screening.\n\nNone of that is clever. It is just the five things people are actually deciding on, done properly.\n\nSave it, send it to whoever you are deciding with, then DM me.",
          },
          {
            hook: "If you are listing a room and it is sitting, it is one of these five.",
            caption:
              "If you are listing a room and it is sitting empty, it is one of these five things.\n\nToo far from the employers people are actually moving for. Unfurnished, so you cut out everybody on a contract. Price does not include utilities, so it looks more expensive than it is. Twelve month term, so you cut out everybody in transition. Or no visible screening, so nobody trusts who else lives there.\n\nFix those five and the room fills in a week. Mine does.\n\nSave it, send it to whoever you are deciding with, then DM me.",
          },
        ],
      },
      {
        day: 12,
        title: "Price walkthrough with voiceover",
        platform: "TikTok + Instagram Reel",
        crossPost: "Facebook page",
        format: "Vertical video, 30 to 45 seconds, your voice over b-roll",
        bestTime: "Saturday 11am to 1pm",
        goal: "Reach post. Price-reveal videos travel further than any other format in housing.",
        build: [
          "Reuse the b-roll from Day 1. Do not reshoot.",
          "Record the voiceover in a closet or a car. Best free sound booth you own.",
          "Lead with the number in the first two seconds. Do not build up to it.",
          "Match your cuts to the sentences. New room, new sentence.",
          "Put the price on screen as text as well as saying it. Most people watch without sound first.",
        ],
        cta: "Comment your city. I will tell you what this room would cost there.",
        hashtags: "#[City]Apartments #[City]RoomsForRent #RentPrices #CoLiving #ApartmentTour #[Neighborhood]",
        variants: [
          {
            hook: "Here is what [$RENT] a month gets you in [City].",
            caption:
              "Here is what [$RENT] a month gets you in [City], with the full walkthrough and the full number.\n\nPrivate furnished room. Utilities. Wifi. Weekly cleaning of the shared spaces. Month to month.\n\nThe one bedroom two blocks from here is nearly double that before you turn a light on.\n\nComment your city. I will tell you what this room would cost there.",
          },
          {
            hook: "Guess the rent before I say it.",
            caption:
              "Guess the rent before I say it. I will wait.\n\nMost people who comment on these guess about four hundred dollars high, which tells you something about what people assume [City] costs now.\n\nIt is [$RENT], furnished, with utilities and wifi included, month to month, in [Neighborhood].\n\nComment your city. I will tell you what this room would cost there.",
          },
          {
            hook: "[$RENT]. Let me show you the whole thing so you know I am not hiding a closet.",
            caption:
              "[$RENT] a month. Let me show you the whole thing so you know I am not hiding a closet and calling it a bedroom.\n\nHere is the room, the closet, the shared kitchen, the bathroom, the laundry, and the street it sits on. No angles, no wide lens tricks.\n\nUtilities, wifi, and weekly cleaning of the shared spaces are in that number. Month to month.\n\nComment your city. I will tell you what this room would cost there.",
          },
        ],
      },
      {
        day: 13,
        title: "The renting-a-room math",
        platform: "Facebook local groups + Nextdoor",
        crossPost: "Instagram feed as a single text graphic",
        format: "Text post with the numbers laid out",
        bestTime: "Sunday 7 to 9pm",
        goal: "Sunday night is when people decide to move. Give them arithmetic, not adjectives.",
        build: [
          "Use real local numbers. Look up the median one bedroom rent in your zip and cite it.",
          "Lay it out as two columns or two stacked lists. Apartment on top, room underneath.",
          "Include first-month costs, not just monthly. Deposit and furniture are where the gap gets brutal.",
          "End with the annual number. That is the one people screenshot.",
          "Do not exaggerate. If the gap is six hundred, say six hundred. Inflated math gets picked apart in group comments.",
        ],
        cta: "Run your own numbers. If they say what mine say, DM me.",
        hashtags: "#[City]Housing #RentPrices #CoLiving #SaveMoney #[City]RoomsForRent",
        variants: [
          {
            hook: "The one bedroom versus the room, all the way out.",
            caption:
              "The one bedroom versus the room, run all the way out for [City].\n\nOne bedroom in [Neighborhood]: rent, plus electric, gas, water, and internet, plus a deposit, plus furnishing an empty apartment. First month lands somewhere near four thousand dollars out of pocket.\n\nPrivate room here: [$RENT], everything included, one month deposit. First month is [$RENT] times two.\n\nOver a year the gap is real money. Not lifestyle-blog money. Rent-a-storage-unit-and-still-come-out-ahead money.\n\nRun your own numbers. If they say what mine say, DM me.",
          },
          {
            hook: "Nobody counts the first month properly.",
            caption:
              "Nobody counts the first month properly, and that is where renting a room wins hardest.\n\nGetting into your own apartment in [City] means rent, a deposit, sometimes last month, four utility accounts with their own setup fees, and a completely empty apartment you have to furnish.\n\nGetting into a room here means [$RENT] and a deposit of [$RENT]. The bed is already in it.\n\nMonthly, the gap is significant. On day one, it is not close.\n\nRun your own numbers. If they say what mine say, DM me.",
          },
          {
            hook: "I asked people if they would live with roommates to save a thousand a month. Here is the result.",
            caption:
              "I asked this week whether people would live with roommates to save about a thousand a month. The vote was not close.\n\nSo here is the actual math behind the question.\n\nOne bedroom in [Neighborhood], plus utilities, plus internet, plus what it costs to furnish an empty apartment, versus [$RENT] a month here with all of that already handled.\n\nThe savings are not the whole story. But if you are here on a contract, or saving for a down payment, or just did the math on your last twelve months of rent and felt sick, they are most of it.\n\nRun your own numbers. If they say what mine say, DM me.",
          },
        ],
      },
      {
        day: 14,
        title: "Behind the scenes: turnover prep",
        platform: "Instagram Story + Reel",
        crossPost: "TikTok",
        format: "BTS video, 20 to 30 seconds, no narration needed",
        bestTime: "Monday 6 to 8pm",
        goal: "Humanize the operation. People rent from people. This is also the post other landlords engage with most.",
        build: [
          "Film yourself actually doing the work. Making the bed, restocking supplies, carrying in the mattress.",
          "Do not clean up before filming the cleaning. The mess is the story.",
          "Speed it up 2x with a simple audio track.",
          "One text card at the start naming what you are doing. That is all the context needed.",
          "This is the post to shoot on the fly. It should not look produced.",
        ],
        cta: "Room is ready [DATE]. DM me if you want first look.",
        hashtags: "#LandlordLife #BehindTheScenes #RentalPropertyTips #CoLiving #[City]RoomsForRent",
        variants: [
          {
            hook: "Turnover day. Nobody sees this part.",
            caption:
              "Turnover day. Nobody sees this part, so here it is.\n\nStrip the bed, deep clean, patch and touch up the walls, restock every consumable, replace anything that got tired, then make it up like a hotel would.\n\nIt takes most of a day and it is the single reason the room photographs the same way in month eighteen as it did in month one.\n\nRoom is ready [DATE]. DM me if you want first look.",
          },
          {
            hook: "This is the unglamorous half of the business.",
            caption:
              "This is the unglamorous half of the business, and it is the half that decides whether anybody stays.\n\nFresh linens, a restocked supply closet, every lightbulb matching, every drawer emptied and wiped. The stuff nobody notices when it is right and everybody notices when it is not.\n\nRoom is ready [DATE]. DM me if you want first look.",
          },
          {
            hook: "Four hours between one resident leaving and the next one seeing it.",
            caption:
              "Four hours between one resident leaving and the next one walking through.\n\nSped up so you do not have to watch me carry a mattress twice.\n\nEvery turnover runs the same checklist, in the same order, so nothing gets skipped because I was in a hurry. That checklist is the actual product.\n\nRoom is ready [DATE]. DM me if you want first look.",
          },
        ],
      },
    ],
  },
  {
    id: "week3",
    shortLabel: "Week 3",
    heading: "Week 3 — Community + Lifestyle",
    theme: "Community + Lifestyle",
    intro:
      "By week three, the people watching you know the price and believe you are legitimate. What they cannot picture yet is themselves living there. This week is about the house as a place, not a product. Show the people, the routines, and the small things nobody puts in a listing.",
    success:
      "Good week three: your DMs shift from \"how much\" to \"who else lives there\" and \"can I see it\". That change in question is the whole point of the week.",
    days: [
      {
        day: 15,
        title: "Meet a resident",
        platform: "Instagram feed + Facebook page",
        crossPost: "Story reshare with a question sticker",
        format: "Photo post, one portrait, longer caption",
        bestTime: "Tuesday 6 to 8pm",
        goal: "Make the house feel like a place with people in it. Prospects want to know who they would be sharing a kitchen with.",
        build: [
          "Ask permission first, in writing. Screenshot the yes and keep it.",
          "First name only, or no name at all. Never post a resident's last name, employer address, or schedule.",
          "Shoot in the shared space, not their bedroom. Natural light, no flash.",
          "If they will not be photographed, shoot their coffee setup or their corner of the kitchen instead. Same story, no face.",
          "Let them read the caption before it goes up.",
        ],
        cta: "One room open next to good neighbors. DM me.",
        hashtags: "#CoLiving #[City]Housing #SharedHousing #[Neighborhood] #TravelNurseHousing",
        variants: [
          {
            hook: "Meet [First name]. She has been here since [month].",
            caption:
              "Meet [First name]. She has been here since [month] and just extended her contract a second time.\n\nShe works nights, so the house learned early to keep it quiet before three in the afternoon. That is not a rule I wrote. The residents worked it out and it stuck.\n\nThat is the thing about screening properly. You are not just protecting the property, you are picking the people who are going to be considerate without being asked.\n\nOne room open next to good neighbors. DM me.",
          },
          {
            hook: "This is who you would be sharing a kitchen with.",
            caption:
              "This is who you would be sharing a kitchen with.\n\n[First name] moved to [City] for a contract, did not know a single person here, and has now been in the house long enough that she has opinions about which grocery store is better.\n\nEverybody in the house went through the same screening: verified income, background check, and a reference I actually called. That is why I can post this instead of dodging the question.\n\nOne room open next to good neighbors. DM me.",
          },
          {
            hook: "People ask who else lives here. Fair question.",
            caption:
              "People ask who else lives here, and it is the fair version of the question everybody is too polite to ask.\n\nRight now: a travel nurse on her second contract, someone eight months into a relocation, and a grad student. Three adults with jobs and early alarms.\n\nThis is [First name], who agreed to let me put her on here. The house is quiet before three in the afternoon because of her schedule, and nobody minds.\n\nOne room open next to good neighbors. DM me.",
          },
        ],
      },
      {
        day: 16,
        title: "3 things residents love most",
        platform: "Instagram Reel + TikTok",
        crossPost: "Facebook page",
        format: "Vertical video, 30 to 45 seconds, 3 quick cuts",
        bestTime: "Wednesday 6 to 8pm",
        goal: "Surface the small details that never make it into a listing but decide whether someone stays.",
        build: [
          "Actually ask your residents. Their answers will not be the ones you would guess.",
          "One cut per item, roughly ten seconds each, filmed on the thing itself.",
          "The best answers are always specific and slightly boring: the water pressure, the parking, the fact the wifi reaches the back bedroom.",
          "Number the text cards 1, 2, 3. It tells the viewer how long they have to stay.",
          "End on the third one, then cut. No outro.",
        ],
        cta: "What would make or break a place for you? Tell me below.",
        hashtags: "#CoLiving #[City]RoomsForRent #RoomTour #SharedHousing #[Neighborhood] #FurnishedRoom",
        variants: [
          {
            hook: "I asked my residents what they actually like. None of it is what I expected.",
            caption:
              "I asked my residents what they actually like about living here. None of the three was what I expected.\n\nNot the furniture. Not the location. Not the price.\n\nIt was the water pressure, the fact that there is always parking, and that the wifi holds a video call from the back bedroom.\n\nI have spent money on things nobody mentioned. Meanwhile the shower head is undefeated.\n\nWhat would make or break a place for you? Tell me below.",
          },
          {
            hook: "The three things nobody puts in a listing.",
            caption:
              "The three things nobody puts in a listing, and all three come up in every conversation I have with a resident who is renewing.\n\nWater pressure. Parking. Whether the wifi reaches the far bedroom.\n\nYou can fix all three for under a few hundred dollars, and they matter more than anything you would put in a photo.\n\nWhat would make or break a place for you? Tell me below.",
          },
          {
            hook: "Small things. That is the whole answer.",
            caption:
              "Small things. That is the whole answer to why people stay.\n\nA shower with real pressure. A parking spot that is always there when you get home at eleven. Wifi that does not drop in the back of the house.\n\nNobody signs a room agreement because of these. Everybody renews because of them.\n\nWhat would make or break a place for you? Tell me below.",
          },
        ],
      },
      {
        day: 17,
        title: "This or that",
        platform: "Instagram Story",
        crossPost: "Facebook Story",
        format: "Story with a poll or slider sticker, 1 to 2 frames",
        bestTime: "Thursday 8 to 9pm",
        goal: "Sixty seconds of work that keeps you in the top of your followers' Story tray, and tells you what to buy next.",
        build: [
          "Split-screen photo of the two options, or one photo with the poll over it.",
          "Make it a real question you would act on. Shared kitchen shelf versus a private mini fridge. Desk versus armchair.",
          "Follow up tomorrow: post the result and say what you decided to do about it.",
          "Reply to every voter with a one-line DM. That is where the inquiries come from.",
        ],
        cta: "Vote. I actually buy whichever one wins.",
        hashtags: "Location sticker only.",
        variants: [
          {
            hook: "Shared kitchen shelf or a private mini fridge in the room?",
            caption:
              "This or that.\n\nShared kitchen shelf, or a private mini fridge in your room?\n\nI am buying whichever one wins for the next turnover, so vote like it matters, because it does.",
          },
          {
            hook: "Desk or armchair? I only have room for one.",
            caption:
              "Desk or armchair in the room? I only have space for one of them.\n\nHalf my residents work from the house at least a couple days a week, so I suspect I know the answer. Prove me wrong.\n\nVote. I actually buy whichever one wins.",
          },
          {
            hook: "Blackout curtains or a better desk lamp?",
            caption:
              "For a night-shift nurse: blackout curtains or a better desk lamp?\n\nOne of these is going in the room this month. Tell me which.\n\nVote. I actually buy whichever one wins.",
          },
        ],
      },
      {
        day: 18,
        title: "A day in the life here",
        platform: "Instagram Reel + TikTok",
        crossPost: "Facebook page",
        format: "Vertical video, 45 to 60 seconds, day-in-the-life edit",
        bestTime: "Friday 6 to 8pm",
        goal: "The aspirational post of the month. Sell the morning, not the square footage.",
        build: [
          "Shoot in order: morning light in the room, coffee in the kitchen, the walk out the front door, the street, the commute landmark.",
          "Golden hour on both ends. Mid-day light will make it look like a rental listing instead of a life.",
          "Keep faces out of frame or use hands and backs only, unless you have written permission.",
          "Slow, warm audio. This one is not a hype edit.",
          "End on the front door at dusk. Bookend the day.",
        ],
        cta: "This could be your [DATE]. DM me.",
        hashtags: "#DayInTheLife #[City] #[Neighborhood] #CoLiving #MovingTo[City] #TravelNurse[City]",
        variants: [
          {
            hook: "A weekday here, from the alarm to the front door at night.",
            caption:
              "A weekday here, from the alarm to the front door at night.\n\nCoffee in a kitchen somebody else cleaned. Twelve minutes to work. Home to a house where three other adults are also just trying to get through their week.\n\nIt is not glamorous and it is not supposed to be. It is a good, quiet, cheap version of living in [City], and for a lot of people that is exactly the assignment.\n\nThis could be your [DATE]. DM me.",
          },
          {
            hook: "What relocating to [City] actually looks like on a Tuesday.",
            caption:
              "What relocating to [City] actually looks like on a Tuesday, once the boxes are gone.\n\nYou wake up in a room you did not have to furnish. You make coffee in a kitchen that already had everything in it. You go to work twelve minutes away. You come home and the shared spaces are clean because that is somebody's job.\n\nThe first month somewhere new is hard enough without also managing a lease and four utility accounts.\n\nThis could be your [DATE]. DM me.",
          },
          {
            hook: "Morning light in this room is the reason people renew.",
            caption:
              "The morning light in this room is genuinely the reason people renew. I did not do anything to earn it. The house faces the right direction.\n\nHere is a full day: that light, coffee downstairs, the walk to the car, [landmark] on the way in, and the front door at dusk.\n\nRoom opens [DATE] at [$RENT] with everything included.\n\nThis could be your [DATE]. DM me.",
          },
        ],
      },
      {
        day: 19,
        title: "Turnover time-lapse",
        platform: "TikTok + Instagram Reel",
        crossPost: "Facebook page",
        format: "Time-lapse, 15 to 25 seconds",
        bestTime: "Saturday 11am to 1pm",
        goal: "Satisfying-content reach play. Transformation videos travel far outside your local audience, and some of that spills back.",
        build: [
          "Phone on a tripod or propped against something heavy. It cannot move once you start.",
          "Same frame the entire time. Wide enough to catch the whole room.",
          "Record the full turnover, then speed it to 15 to 20 seconds.",
          "Text card at the start: \"Turning this room over in one day\". Text card at the end with the price.",
          "Trending audio, cut on the beat if you can be bothered. It measurably helps here.",
        ],
        cta: "This exact room is available [DATE]. Comment ROOM.",
        hashtags: "#Timelapse #RoomMakeover #BeforeAndAfter #CoLiving #[City]RoomsForRent #Satisfying",
        variants: [
          {
            hook: "One room, one day, one camera position.",
            caption:
              "One room, one day, one camera position.\n\nStripped, cleaned, patched, restocked, and made up for the next resident. Sped up so you do not have to sit through the part where I lose the allen key.\n\nEvery turnover in this house runs the same order, every time. That is why it looks like this on move-in day rather than mostly like this.\n\nThis exact room is available [DATE]. Comment ROOM.",
          },
          {
            hook: "Empty room to move-in ready, in twenty seconds.",
            caption:
              "Empty room to move-in ready, in twenty seconds of your time and about seven hours of mine.\n\nThe part people underestimate is not the cleaning. It is the restocking. Lightbulbs, hangers, a working lamp, a bin liner already in the trash can. All the tiny things that make the first night feel handled instead of half done.\n\nThis exact room is available [DATE]. Comment ROOM.",
          },
          {
            hook: "This is what a room looks like the hour before it gets listed.",
            caption:
              "This is what a room looks like in the hours before it gets listed.\n\nNo staging tricks in here. What you see at the end of this clip is what a resident walks into, because I photograph it and hand over the keys on the same day.\n\n[$RENT] a month, utilities and wifi included, available [DATE].\n\nThis exact room is available [DATE]. Comment ROOM.",
          },
        ],
      },
      {
        day: 20,
        title: "What makes our co-living different",
        platform: "Facebook page + Nextdoor",
        crossPost: "Instagram feed",
        format: "Carousel or long text post with one photo",
        bestTime: "Sunday 7 to 9pm",
        goal: "Your positioning post. This is the one you pin to the top of your page and leave there.",
        build: [
          "Pick three differences and defend each in one sentence. Three, not seven.",
          "Do not name competitors. Describe the bad version generically and let people draw the line.",
          "If you make it a carousel: one difference per slide, plus a title slide and a closing slide.",
          "Pin this post on Facebook after it goes up.",
          "Reuse this copy for your Google Business profile description and your website's about section.",
        ],
        cta: "Rooms open in [Neighborhood]. Message me.",
        hashtags: "#CoLiving #[City]Housing #SharedHousing #[Neighborhood] #RentByTheRoom",
        variants: [
          {
            hook: "Three things I do differently, and why each one costs me money.",
            caption:
              "Three things I do differently here, and every one of them costs me money.\n\nOne: professional weekly cleaning of the shared spaces, in the rent. It would be cheaper to hand out a chore chart. Chore charts are why shared houses fall apart.\n\nTwo: real screening on every applicant, even when the room has been empty two weeks. A vacancy costs me one room. The wrong resident costs me three.\n\nThree: month to month terms. I lose the security of a long lease. In exchange, nobody lies to me about their timeline to get in the door.\n\nRooms open in [Neighborhood]. Message me.",
          },
          {
            hook: "Most shared housing is a landlord maximizing beds. This is not that.",
            caption:
              "Most shared housing is a landlord maximizing beds per square foot. This is not that, and here is how you can tell the difference from the listing.\n\nCount the bedrooms against the bathrooms. Ask whether cleaning is included or assigned. Ask how the other residents were screened. Ask what happens if someone stops paying.\n\nIf the answers are vague, the house is a spreadsheet.\n\nFour private rooms here, weekly professional cleaning included, everyone screened the same way, and a written agreement that says what happens in every one of those cases.\n\nRooms open in [Neighborhood]. Message me.",
          },
          {
            hook: "The difference is not the furniture. It is what happens when something breaks.",
            caption:
              "The difference between a good co-living house and a bad one is not the furniture. It is what happens at eleven at night when something breaks.\n\nHere: you text me, I answer, and if it is water or heat or a lock, somebody is there that night. Everything else is handled within 48 hours. That is written into the agreement, not just something I say.\n\nThe furniture is nice. Plenty of bad houses have nice furniture.\n\nRooms open in [Neighborhood]. Message me.",
          },
        ],
      },
      {
        day: 21,
        title: "Ask them what matters",
        platform: "Instagram Story + a Facebook group question post",
        crossPost: "Save answers for next month's content",
        format: "Story question sticker, plus a genuine question post in one group",
        bestTime: "Monday 12 to 1pm",
        goal: "Free market research, and the answers become next month's posts. Also the highest-reply format on Instagram.",
        build: [
          "Question sticker on a plain background. Do not decorate it, it lowers replies.",
          "In the Facebook group, ask it as a real question with no listing attached. Groups punish self-promotion and reward participation.",
          "Screenshot the best answers, blur the names, and reshare them tomorrow with your response.",
          "Keep a running note of every answer. This is your content pipeline for month two.",
        ],
        cta: "Reply here. I read every one.",
        hashtags: "Location sticker only.",
        variants: [
          {
            hook: "What matters most to you in a shared living space?",
            caption:
              "Genuine question, because I am deciding what to spend money on next.\n\nWhat matters most to you in a shared living space?\n\nReply here. I read every one.",
          },
          {
            hook: "What would immediately disqualify a place for you?",
            caption:
              "Flip side of the usual question.\n\nWhat would immediately disqualify a shared house for you? The thing where you see it and you are just done.\n\nI want to know what I might be doing without realizing it.\n\nReply here. I read every one.",
          },
          {
            hook: "If you have lived with roommates as an adult, what did the good place get right?",
            caption:
              "If you have lived with roommates as an actual adult, not in college:\n\nWhat did the good place get right that the bad one did not?\n\nI have my own theory, but I would rather hear yours before I spend the money.\n\nReply here. I read every one.",
          },
        ],
      },
    ],
  },
  {
    id: "week4",
    shortLabel: "Week 4",
    heading: "Week 4 — Scarcity + Urgency",
    theme: "Scarcity + Urgency",
    intro:
      "Three weeks of warming people up is wasted if you never ask. Week four asks. Every post this week has a deadline, a count, or a date attached, and every call to action is a DM rather than a link. One rule: never invent scarcity. If two rooms are open, say two. Fake urgency gets found out in a small local market and you do not get that trust back.",
    success:
      "Good week four: your inquiry count for the week beats weeks one through three combined, and at least one application comes from somebody who has been watching silently since day one.",
    days: [
      {
        day: 22,
        title: "Countdown on the move-in special",
        platform: "Instagram Story countdown + Facebook Story",
        crossPost: "Pin the countdown sticker for the full 48 hours",
        format: "Story with a countdown sticker, refreshed daily",
        bestTime: "Tuesday 8 to 9pm",
        goal: "Countdown stickers let people opt into a reminder. Everyone who taps it gets notified when it ends, which is a free second impression.",
        build: [
          "Use a real deadline tied to something true: the first of the month, or the date the room actually becomes unavailable.",
          "Room photo as the background, countdown sticker centered.",
          "Say what the special actually is in one line. Vague offers get ignored.",
          "Repost it each of the remaining days with the number updated.",
          "Everyone who taps the countdown gets a notification. That is the whole mechanic.",
        ],
        cta: "Tap the countdown so you get reminded.",
        hashtags: "Location sticker only.",
        variants: [
          {
            hook: "Two days left on the move-in special.",
            caption:
              "Two days left on the move-in special.\n\nSign by [DATE] and the first month is [$RENT] with the deposit split over your first two months instead of due up front.\n\nAfter [DATE] it goes back to the standard terms. Not a sales tactic, that is just when the room needs to be filled.\n\nTap the countdown so you get reminded.",
          },
          {
            hook: "48 hours. Then this goes back to normal pricing.",
            caption:
              "48 hours on this one, then it goes back to standard terms.\n\nMove in by [DATE], the deposit splits across two months, and I cover the first month of the parking spot.\n\nOne room. One person is going to take this.\n\nTap the countdown so you get reminded.",
          },
          {
            hook: "The clock on this room is real and here it is.",
            caption:
              "The clock on this room is real, so here it is where you can see it.\n\nIt is listed on three platforms and it has been shown twice this week. When it goes, the move-in special goes with it.\n\n[$RENT], everything included, [Neighborhood], available [DATE].\n\nTap the countdown so you get reminded.",
          },
        ],
      },
      {
        day: 23,
        title: "Why this room goes fast",
        platform: "Facebook page + two local groups",
        crossPost: "Instagram feed",
        format: "Photo post, the best single image you have",
        bestTime: "Wednesday 12 to 1pm",
        goal: "Justify the urgency with evidence rather than exclamation points. Facts create more pressure than hype does.",
        build: [
          "Use your strongest photo. If Day 1's tour had a standout frame, screenshot it.",
          "Cite real evidence: how fast it filled last time, how many inquiries this week, how many showings are booked.",
          "Never say \"going fast\" without immediately saying why.",
          "Keep it to four short paragraphs. Group posts get skimmed.",
        ],
        cta: "DM me and I will send the application. Takes ten minutes.",
        hashtags: "#[City]RoomsForRent #[Neighborhood] #CoLiving #[City]Housing #MidTermRental",
        variants: [
          {
            hook: "This room filled in six days last time. Here is why.",
            caption:
              "This room filled in six days the last time it was open, and I do not think it was luck.\n\nIt is twelve minutes from [employer or hospital]. It is furnished, so somebody on a three month contract does not need to buy anything. It is [$RENT] with utilities and wifi included. And it is month to month.\n\nThat combination is rare enough in [City] that the people who need it recognize it immediately.\n\nIt is open again as of [DATE].\n\nDM me and I will send the application. Takes ten minutes.",
          },
          {
            hook: "Four inquiries this week. Two showings booked. One room.",
            caption:
              "Four inquiries this week. Two showings booked. One room.\n\nI am not saying that to pressure anybody, I am saying it because it is the actual state of play and you deserve to know it before you spend a week thinking about it.\n\nPrivate furnished room, [Neighborhood], [$RENT] with utilities and wifi included, month to month, available [DATE].\n\nDM me and I will send the application. Takes ten minutes.",
          },
          {
            hook: "Here is exactly who takes this room, every time.",
            caption:
              "Here is exactly who takes this room, every single time it opens.\n\nSomebody on a thirteen week contract at [employer or hospital]. Somebody three weeks into a relocation who is done living in a hotel. Or somebody who just ran the numbers on renewing their own apartment and did not like what they saw.\n\nIf that is you, it is open as of [DATE]. If it is somebody you know, send them this.\n\nDM me and I will send the application. Takes ten minutes.",
          },
        ],
      },
      {
        day: 24,
        title: "DM to apply",
        platform: "Instagram Reel + TikTok",
        crossPost: "Facebook page",
        format: "Vertical video, 20 to 30 seconds, direct to camera or text overlay",
        bestTime: "Thursday 6 to 8pm",
        goal: "The most direct ask of the month. One room, one action, no ambiguity about what to do next.",
        build: [
          "Short. Under 30 seconds. This is not a tour, it is an ask.",
          "Show the room for five seconds, then the ask for the rest.",
          "Put the exact comment word on screen. \"Comment ROOM\" outperforms \"link in bio\" every time.",
          "Say the availability date out loud, and put it on screen.",
          "Reply to every single comment within the hour. Reach follows reply speed on this format.",
        ],
        cta: "Comment ROOM or DM me. I answer everybody.",
        hashtags: "#[City]RoomsForRent #RoomForRent #CoLiving #[Neighborhood] #[City]Housing #NowLeasing",
        variants: [
          {
            hook: "Last room this month. DM to apply.",
            caption:
              "Last room this month.\n\n[$RENT] in [Neighborhood]. Furnished, utilities and wifi included, weekly cleaning of the shared spaces, month to month. Available [DATE].\n\nApplication takes ten minutes and I give everybody an answer inside 48 hours, yes or no. Nobody gets ghosted.\n\nComment ROOM or DM me. I answer everybody.",
          },
          {
            hook: "You have been watching these for three weeks. This is the one to act on.",
            caption:
              "If you have been watching these for three weeks without saying anything, this is the one to act on.\n\nOne room. [$RENT]. Everything included. [Neighborhood]. Available [DATE].\n\nYou are not committing to anything by messaging me. You are asking a question. I will send you the full details and the application, and you can decide after you have seen the place.\n\nComment ROOM or DM me. I answer everybody.",
          },
          {
            hook: "Ten minute application. 48 hour answer. One room.",
            caption:
              "Ten minute application. 48 hour answer. One room.\n\nThat is the whole process. No application fee, no credit score cutoff that quietly disqualifies anybody who moved this year, and a real yes or no either way.\n\n[$RENT] in [Neighborhood], furnished, everything included, available [DATE].\n\nComment ROOM or DM me. I answer everybody.",
          },
        ],
      },
      {
        day: 25,
        title: "A move-in that worked out",
        platform: "Instagram feed + Facebook page",
        crossPost: "Story reshare",
        format: "Photo post or short video, real story in the caption",
        bestTime: "Friday 6 to 8pm",
        goal: "Proof at the moment of decision. This is the post that closes people who have been circling for three weeks.",
        build: [
          "Get permission. Always. First names only, and never a photo of somebody's face without written consent.",
          "Tell the timeline: what their problem was, how fast it moved, how it turned out.",
          "Specifics are the whole thing. \"She messaged Tuesday, toured Wednesday, moved in Saturday\" does more work than any adjective.",
          "If you have no story yet, tell your own: why you opened the house.",
        ],
        cta: "Same room, same process. DM me.",
        hashtags: "#CoLiving #[City]Housing #TravelNurseHousing #[Neighborhood] #RoomForRent",
        variants: [
          {
            hook: "She messaged on a Tuesday and moved in on a Saturday.",
            caption:
              "She messaged on a Tuesday and moved in on a Saturday.\n\nContract started the following Monday at [employer or hospital]. She had been quoted double this for an extended stay hotel and was two days from booking it.\n\nToured Wednesday evening, application back Thursday morning, approved Thursday afternoon, keys Saturday.\n\nThat is not a special case. That is just what the process looks like when there is no twelve month lease and no leasing office in the middle of it.\n\nSame room, same process. DM me.",
          },
          {
            hook: "He was living out of a hotel for five weeks before he found this.",
            caption:
              "He was living out of an extended stay hotel for five weeks before he found this, and it was costing him nearly three times what the room does.\n\nRelocations do this to people. The company covers thirty days, the thirty days run out, and you are still not ready to sign a year lease in a city you barely know.\n\nHe took the room month to month, stayed seven months, and left when he bought a house here.\n\nThat is exactly what this is for.\n\nSame room, same process. DM me.",
          },
          {
            hook: "The best outcome I have had here took four days.",
            caption:
              "The best outcome I have had in this house took four days from first message to keys.\n\nNo leasing office. No twelve month commitment on a city she had never lived in. No furnishing an empty apartment for a thirteen week contract.\n\nShe extended twice and was here almost nine months.\n\nThe room she was in is the room that is open right now, available [DATE], at [$RENT] with everything included.\n\nSame room, same process. DM me.",
          },
        ],
      },
      {
        day: 26,
        title: "The offer, stated plainly",
        platform: "Instagram feed + Story + Facebook page",
        crossPost: "Share into two local groups",
        format: "Graphic, single image, offer terms in large type",
        bestTime: "Saturday 11am to 1pm",
        goal: "One clean visual reminder people can screenshot and send. No story, no narrative, just the terms.",
        build: [
          "Cream or white background, one accent color, your logo small in a corner.",
          "Three lines maximum on the graphic: the offer, the deadline, the action.",
          "Type large enough to read as a thumbnail in a group feed.",
          "Put the full terms in the caption, not on the image. Fine print on a graphic makes it look like an ad.",
          "Reuse this template every month. Change the numbers, keep the layout.",
        ],
        cta: "Message me before [DATE].",
        hashtags: "#[City]RoomsForRent #NowLeasing #CoLiving #[Neighborhood] #[City]Housing",
        variants: [
          {
            hook: "Move in by [DATE]: deposit split over two months.",
            caption:
              "Move in by [DATE] and the deposit splits across your first two months instead of being due up front.\n\nThat is the whole offer. [$RENT] a month, furnished, utilities and wifi included, shared spaces professionally cleaned, month to month.\n\nOne room in [Neighborhood]. Offer ends [DATE] because that is when the room needs to be filled, not because I am running a sale.\n\nMessage me before [DATE].",
          },
          {
            hook: "The terms, on one card, so you can send it to somebody.",
            caption:
              "Putting the terms on one card so you can screenshot it and send it to whoever you are deciding with.\n\n[$RENT] a month. One month deposit, splittable over two months if you move by [DATE]. Utilities, wifi, and weekly cleaning of the shared spaces included. Month to month with a thirty day notice.\n\nNo application fee. Ten minute application. Answer within 48 hours.\n\nMessage me before [DATE].",
          },
          {
            hook: "One room, one number, one date.",
            caption:
              "One room. One number. One date.\n\n[$RENT] a month, all in. Available [DATE]. In [Neighborhood], twelve minutes from [employer or hospital].\n\nIf you move by [DATE] the deposit splits over two months.\n\nThat is everything. There is no second page.\n\nMessage me before [DATE].",
          },
        ],
      },
      {
        day: 27,
        title: "Prep before the new resident",
        platform: "Instagram Story series + Reel",
        crossPost: "Facebook Story",
        format: "3 to 4 Story frames or a 20 second Reel",
        bestTime: "Sunday 6 to 8pm",
        goal: "Urgency without an ask. Showing the room being prepped implies somebody is about to take it.",
        build: [
          "Film the small final touches: fresh linens going on, towels folded, a welcome note on the desk.",
          "Do not say the room is taken unless it is. Say you are getting it ready.",
          "Last frame: the finished room with the availability date on it.",
          "Add a link sticker or a \"DM me\" prompt on the final frame only.",
        ],
        cta: "Still open as of right now. DM me if that changes for you.",
        hashtags: "Location sticker only.",
        variants: [
          {
            hook: "Getting it ready. Somebody is going to walk into this on [DATE].",
            caption:
              "Getting it ready.\n\nFresh linens, towels, a lamp that works, and a note on the desk with the wifi password and my number on it.\n\nSomebody is going to walk into this on [DATE].\n\nStill open as of right now. DM me if that changes for you.",
          },
          {
            hook: "The last hour before a room gets handed over.",
            caption:
              "The last hour before a room gets handed over is my favorite part of this.\n\nEverything is clean, everything works, and the only thing missing is the person.\n\nAvailable [DATE] at [$RENT] with everything included.\n\nStill open as of right now. DM me if that changes for you.",
          },
          {
            hook: "I leave a note on the desk for every new resident.",
            caption:
              "I leave a note on the desk for every new resident. Wifi password, my cell number, trash day, and which cabinet is theirs.\n\nIt takes four minutes and it is the difference between arriving somewhere and moving in somewhere.\n\nRoom is ready for [DATE].\n\nStill open as of right now. DM me if that changes for you.",
          },
        ],
      },
      {
        day: 28,
        title: "Final tour before it's gone",
        platform: "Instagram Live or Reel + Facebook page",
        crossPost: "TikTok if you record rather than go live",
        format: "Live walkthrough, 5 to 10 minutes, or a 45 second recorded reel",
        bestTime: "Sunday or Monday 7 to 9pm",
        goal: "The closing post of the month. Live is better if you can handle it, because real-time questions convert.",
        build: [
          "Announce it in Stories two hours before. Nobody catches a live they did not know about.",
          "Walk the whole house, not just the room. Answer questions out loud as they come in.",
          "Say the price, the availability date, and the application process at least twice. People join late.",
          "Save the replay to your grid and to a Highlight.",
          "If live is not for you, record the same walkthrough and cut it to 45 seconds. Do not skip the day.",
        ],
        cta: "Ask anything in the comments. I am here for the next twenty minutes.",
        hashtags: "#[City]RoomsForRent #RoomTour #CoLiving #[Neighborhood] #NowLeasing #[City]Housing",
        variants: [
          {
            hook: "Going live for the final walkthrough of this room.",
            caption:
              "Going live for the final walkthrough of this room before it goes.\n\nI will walk the whole house, not just the bedroom, and answer anything you want to ask in the comments. Price, screening, who lives there, what the street is like at night. All of it.\n\n[$RENT] a month, everything included, available [DATE].\n\nAsk anything in the comments. I am here for the next twenty minutes.",
          },
          {
            hook: "Last look at this room this month.",
            caption:
              "Last look at this room this month.\n\nEverything you have seen in the last four weeks, in one walkthrough: the room, the kitchen, the bathroom, the laundry, the parking, and the street.\n\n[$RENT] with utilities, wifi, and weekly cleaning of the shared spaces. Month to month. Available [DATE].\n\nIf you have been thinking about it since the first post, this is the one to ask your question on.\n\nAsk anything in the comments. I am here for the next twenty minutes.",
          },
          {
            hook: "Everything I have not shown you yet.",
            caption:
              "Everything I have not shown you yet, in one walkthrough. The linen closet, the parking, the back yard, the laundry, and the walk to the corner.\n\nThe listing photos are the good angles. This is the rest of it, unedited, so nobody is surprised on move-in day.\n\n[$RENT], everything included, available [DATE].\n\nAsk anything in the comments. I am here for the next twenty minutes.",
          },
        ],
      },
    ],
  },
  {
    id: "bonus",
    shortLabel: "Bonus",
    heading: "Bonus days (use any time)",
    theme: "Filler + Recap",
    intro:
      "Two spare days for a month with 30 or 31 days, or for any week where a planned shoot falls through. Neither one requires new footage, which is the point. Both are built entirely from assets you already made.",
    success:
      "Use these as replacements, not additions. If a day this month did not get shot, drop one of these in rather than posting nothing.",
    days: [
      {
        day: 29,
        title: "Branded quote card",
        platform: "Instagram feed + Facebook page",
        crossPost: "Story reshare",
        format: "Graphic, single image, 4:5",
        bestTime: "Any weekday 12 to 1pm",
        goal: "Zero-effort filler that keeps your grid alive on a week you had no time. Requires no new footage at all.",
        build: [
          "Cream background, one accent color, your logo small in the corner. Same template as Day 6 and Day 26.",
          "Skip generic hustle quotes. Use a line about housing, moving, or money that is actually true.",
          "The best version is a line one of your residents said. Quote them, first name only.",
          "Make three of these at once and keep them on your phone for the weeks that get away from you.",
        ],
        cta: "Rooms in [Neighborhood] from [$RENT], everything included. Link in bio.",
        hashtags: "#CoLiving #[City]Housing #[Neighborhood] #RentByTheRoom #MovingTo[City]",
        variants: [
          {
            hook: "Housing should not cost you the ability to save.",
            caption:
              "Housing should not cost you the ability to save.\n\nThat is most of why I run this house by the room instead of as one lease. The number is the number, everything is in it, and what is left over is yours.\n\nRooms in [Neighborhood] from [$RENT], everything included. Link in bio.",
          },
          {
            hook: "The best rental is the one you can leave.",
            caption:
              "The best rental is the one you can leave.\n\nA twelve month lease in a city you have lived in for three weeks is a bet, and you are the only one taking any risk on it.\n\nMonth to month, thirty day notice, both directions. That is not generosity, it is just the honest version of a short stay.\n\nRooms in [Neighborhood] from [$RENT], everything included. Link in bio.",
          },
          {
            hook: "A resident said this and I have not stopped thinking about it.",
            caption:
              "A resident said this on her way out and I have not stopped thinking about it: she did not want a nicer apartment, she wanted fewer decisions.\n\nThat is what furnished, utilities-included, month to month actually sells. Not luxury. Fewer decisions in the worst month of your year.\n\nRooms in [Neighborhood] from [$RENT], everything included. Link in bio.",
          },
        ],
      },
      {
        day: 30,
        title: "What you missed this month",
        platform: "Instagram carousel + Facebook page",
        crossPost: "Share into one local group",
        format: "Carousel, 6 slides, built from existing posts",
        bestTime: "Last day of the month, 6 to 8pm",
        goal: "Catch everybody who found you in week three and never scrolled back. Costs you twenty minutes and no new footage.",
        build: [
          "Screenshot your five best-performing posts from the month and rebuild them as slides.",
          "Slide 1: the title. Slides 2 through 5: one recap each. Slide 6: what is available right now and the date.",
          "Lead with whichever post got the most saves, not the most likes.",
          "Update the availability on the last slide the morning you post it. Nothing kills trust faster than a stale date.",
          "Save this whole approach. It becomes your recurring end-of-month post.",
        ],
        cta: "Rooms open [DATE]. DM me and I will send everything.",
        hashtags: "#[City]RoomsForRent #CoLiving #[Neighborhood] #[City]Housing #MonthlyRecap",
        variants: [
          {
            hook: "Everything from this month in one post.",
            caption:
              "Everything from this month in one post, for anybody who found this page in the last week.\n\nWhat [$RENT] a month actually includes. How every applicant gets screened. What the turnover process looks like. Who currently lives here. And the full walkthrough.\n\nStill open as of today: [DATE].\n\nRooms open [DATE]. DM me and I will send everything.",
          },
          {
            hook: "If you just found this page, start here.",
            caption:
              "If you just found this page, start here. This is the whole month in six slides.\n\nThe short version: private furnished rooms in [Neighborhood], [$RENT] a month with utilities, wifi, and weekly cleaning of the shared spaces included. Month to month. Everyone screened. Ten minute application, answer in 48 hours.\n\nRooms open [DATE]. DM me and I will send everything.",
          },
          {
            hook: "Five posts, one room, and where things stand today.",
            caption:
              "Five posts, one room, and where things actually stand today.\n\nI posted the price, the screening process, the cleaning standard, a full tour, and a resident's own words this month. None of it contradicts any of the rest, which is more than most listings can say.\n\nHere is the recap, and here is what is available right now.\n\nRooms open [DATE]. DM me and I will send everything.",
          },
        ],
      },
    ],
  },
];

/** Flat list, for the CSV export and the shuffle indexer. */
export const CALENDAR_ALL_DAYS: CalendarDay[] = CALENDAR_WEEKS.flatMap(
  (w) => w.days,
);
