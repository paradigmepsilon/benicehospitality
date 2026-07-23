import { neon } from "@neondatabase/serverless";

// BNHG co-living Insights cluster (5 posts, operator/investor angle).
// category = "Co-living" (exact case) so CoLivingInsights on /co-living and the
// /insights?category=Co-living filter both light up. featured_image_url points at
// local webp masters in public/images/insights/. faq feeds the visible FAQ block
// plus FAQPage JSON-LD on the article page. Idempotent: ON CONFLICT (slug) DO UPDATE.

const BLOG_POSTS = [
  {
    title: "What Is Co-Living? A 2026 Guide for Operators and Investors",
    slug: "what-is-co-living-2026",
    excerpt:
      "Co-living is renting a home by the room instead of by the unit. Here is what the model actually is, who lives this way, why operators are moving into it in 2026, and how to tell whether it belongs in your portfolio.",
    content: `<h2>What Is Co-Living? A 2026 Guide for Operators and Investors</h2>
<h3>The model, the money, and whether it belongs in your portfolio</h3>

<p>Co-living is renting a home by the room instead of by the unit. Each resident gets a private bedroom and a signed agreement for that room, and they share the kitchen, living room, and other common spaces with the other residents. For an operator, it turns one house into several rent checks. That is the whole idea in one sentence.</p>

<p>The rest of this guide is what that sentence leaves out. Who lives this way, why the numbers can work, how operators actually run it, and where it goes wrong. I run mid-term rentals in the Southeast, so this is written operator to operator, not from a brochure. One note up front. This is operator education, not legal advice, and co-living rules change block to block. Confirm your own city's code before you buy or convert anything.</p>

<h2>What is co-living, exactly?</h2>
<p>Co-living is a shared housing arrangement where unrelated adults each rent a private bedroom in the same home and share the common areas. The operator furnishes the house, usually covers the utilities and wifi, and manages each room as its own small lease.</p>
<p>You will see it called a few different things. Rent by the room. Shared housing. Co-living. Sometimes it gets filed under older labels like a rooming house or single-room occupancy. The words matter for zoning, which I will come back to, but the model underneath is the same. Private bedrooms, shared everything else, one operator running the whole thing.</p>

<h2>How co-living is different from a normal rental</h2>
<p>A traditional rental is one lease, one household, one rent check. You hand over the keys to the whole unit and the tenant handles the rest. Co-living is the opposite. You keep control of the house and rent the bedrooms one at a time to people who did not know each other before they moved in.</p>
<p>That difference drives everything else. You furnish every room. You pay the utilities. You handle four move-ins instead of one. And you collect four rent checks instead of one, which is the reason anyone puts up with the extra work.</p>

<h2>Who actually lives in co-living?</h2>
<p>Co-living residents are mostly younger adults who want a private room in a good location without paying for a whole apartment. In the United States, about 61 percent of co-living residents are between 22 and 34, and more than 14 million young adults already live with roommates who are not family.</p>
<p>In my houses the mix is remote workers, people who just relocated for a job, traveling healthcare workers, and graduate students. A shared home cuts their housing cost by 25 to 38 percent compared to renting their own place in the same metro. For a lot of them the math is not close. They would rather have a nice room in a nice house than a small studio they can barely afford.</p>
<p>The travel nurse is worth calling out, because that tenant has become its own strategy. If you want the detail on that one, I wrote a separate piece on <a href="/insights/co-living-for-travel-nurses">co-living for travel nurses</a>.</p>

<h2>Why operators are paying attention in 2026</h2>
<p>Two things are pulling operators toward co-living. Rents have outrun wages for years, so cheaper housing sells itself. And the money that funds real estate has decided the model is worth backing.</p>
<p>The co-living market was worth around 7.7 billion dollars in 2024 and is projected to reach roughly 32 billion by 2034. Big capital is moving too. Cohabs raised about 450 million dollars to expand in North America. That kind of money does not chase a fad. It chases a model somebody has proven can run at scale.</p>
<p>Here is the part I want you to read carefully. The capital is not betting that any room rented to any warm body prints cash. It is betting on operators who run co-living as a system. That distinction is the difference between a house that nets and a house that just grosses.</p>

<h2>How operators make money with co-living</h2>
<p>You make money by collecting more total rent from the rooms than you could from a single lease on the same house. Rent a two-bedroom by the room instead of whole and gross rent often climbs about 65 percent. Furnished mid-term rooms can pull 30 to 70 percent more than a standard 12-month lease.</p>
<p>Gross is the easy part. The number that decides whether you keep any of it is net, after furniture, utilities, cleaning, vacancy, and your own time. I broke that comparison down in <a href="/insights/co-living-vs-traditional-renting">co-living versus traditional renting</a>, because the gap between the gross and the net is the entire game.</p>

<h2>The two ways to run co-living</h2>
<p>You can run co-living on a property you own, or on one you control through a lease. Owning gives you the most upside and the most risk. The lighter-capital version is rent to rent, where you master lease a house from an owner, with written permission to sublet the rooms, and you keep the spread. A third path is a management agreement, where the owner keeps the property and you bring the systems and take a share.</p>
<p>None of these is the right answer for everyone. They are different bets with different capital and different risk. I walk through how to pick one in <a href="/insights/how-to-start-rent-by-the-room-business">how to start a rent-by-the-room business</a>.</p>

<h2>Is co-living right for you?</h2>
<p>Co-living works when three things are true. There is real demand for furnished rooms in your market, usually a city with remote workers, students, or a steady flow of relocations. The house divides into private rooms without a gut renovation. And you, or someone you pay, will treat operations as the actual product.</p>
<p>It fails on the opposite. A quiet market with no room demand leaves you holding a higher cost base and none of the premium. A house that fights the conversion buries your spread in construction. And an operator who waves off the management load watches turnover eat the whole advantage. Be honest about which one you are before you fall in love with the gross rent number.</p>

<h3>Thinking about your first co-living property?</h3>
<p>Room Rental Riches is where I teach the operating system behind co-living, the same one I run in my own portfolio. If you are weighing a first house or a conversion, a short discovery call is enough to tell whether your market and your numbers support the model or whether a plain single lease is the smarter move. See the details on the <a href="/co-living">co-living page</a>.</p>
<p>Book a free discovery call at benicehospitality.com</p>`,
    category: "Co-living",
    featured_image_url: "/images/insights/what-is-co-living-2026.webp",
    published: true,
    published_at: "2026-07-21T14:00:00Z",
    meta_description:
      "Co-living is renting a home by the room. A 2026 operator's guide to what co-living is, who lives in it, why investors are backing it, how operators make money, and whether it fits your portfolio.",
    target_keyword: "what is co-living",
    secondary_keywords: [
      "co-living meaning",
      "co-living for investors",
      "rent by the room",
      "co-living for operators",
    ],
    tags: ["Co-Living", "Rent by Room", "Real Estate Investing"],
    faq: [
      {
        question: "What is co-living in simple terms?",
        answer:
          "Co-living is renting a home by the room. Each person rents a private bedroom under their own agreement and shares the kitchen and living areas with the other residents. The operator furnishes the home and usually covers utilities and wifi.",
      },
      {
        question: "Is co-living profitable for operators?",
        answer:
          "It can be. Renting by the room often grosses about 65 percent more than a single lease on the same house, and furnished rooms can earn 30 to 70 percent more than a standard 12-month rental. The catch is that furniture, utilities, and turnover cost more too, so the net is smaller than the gross suggests.",
      },
      {
        question: "Is co-living legal?",
        answer:
          "It depends on your city and often on your specific parcel. Some codes cap how many unrelated adults can share one home or treat co-living as a rooming house with its own rules. Always confirm the zoning and any licensing with your local planning department before you buy or convert.",
      },
      {
        question: "Who lives in co-living housing?",
        answer:
          "Mostly adults between 22 and 34: remote workers, recent relocations, graduate students, and traveling healthcare workers. They choose a private room in a shared home because it costs 25 to 38 percent less than renting their own place in the same city.",
      },
      {
        question: "How much does it cost to start a co-living house?",
        answer:
          "The main upfront costs are the security deposit or down payment, furnishing every bedroom and shared space at roughly 2,500 to 6,000 dollars per bedroom, and basic marketing. A rent-to-rent house you do not own can start for far less than buying one.",
      },
    ],
  },
  {
    title: "Co-Living vs. Traditional Renting: Which Nets More for a Landlord?",
    slug: "co-living-vs-traditional-renting",
    excerpt:
      "Co-living usually grosses more than a single lease, often about 65 percent more. It does not always net more. Here is how the two models really compare on cost, turnover, and take-home, and how to tell which one your property should run.",
    content: `<h2>Co-Living vs. Traditional Renting: Which Nets More for a Landlord?</h2>
<h3>The gross rent lift is real. The net is where the decision actually lives.</h3>

<p>Co-living usually grosses more than a traditional lease, often about 65 percent more on the same house. It does not always net more. Whether renting by the room beats a single lease comes down to your market, your building, and how well you run turnover. That is the honest answer, and the rest of this is how to tell which side you are on.</p>

<p>I run both models in my own portfolio, so I am not selling you one over the other. Some of my houses earn more by the room. A couple earn more as a plain rental with none of the headache. Here is how to figure out which is which before you commit a property to it.</p>

<h2>What is the short answer?</h2>
<p>Rent by the room when your market has real demand for furnished rooms and you are willing to run the operation. Rent whole when demand is thin, the house does not divide cleanly, or you want a hands-off asset. The premium is real, but it is a premium you earn with labor, not one that shows up for free.</p>

<h2>How do the two models compare on gross rent?</h2>
<p>Start with the number that makes co-living attractive. Rent a two-bedroom as one lease and you get one rent. Reconfigure it into four rentable bedrooms and gross rent climbs by roughly 65 percent. Furnished mid-term rooms, the kind travel nurses and remote workers book, pull 30 to 70 percent more per month than an unfurnished annual lease.</p>
<p>If the story ended at gross rent, every landlord would convert next month. It does not end there. Nobody deposits the gross. You deposit what is left after co-living's heavier cost base takes its cut.</p>

<h2>The costs traditional renting does not have</h2>
<p>A single lease is cheap to run. One tenant, one renewal, and they pay their own light bill. Co-living adds a stack of costs a whole-house rental never touches.</p>
<ul>
<li>Furniture in every bedroom and shared space, plus replacing it as it wears.</li>
<li>Utilities and wifi, which you usually fold into the rent and absorb when four adults run the heat on four schedules.</li>
<li>Cleaning for the common areas, on a schedule, not once a year at move-out.</li>
<li>Management time, because four agreements mean four move-ins, four screenings, and four times the small problems.</li>
</ul>
<p>None of this argues against co-living. It is just the reason the net sits well below the gross. Model only the gross rent lift and you will meet this gap the hard way, on your first honest year-end statement.</p>

<h2>Turnover is the number that decides it</h2>
<p>Rooms turn more often than whole houses, and every turn costs money. You clean, you touch up, you re-list, you screen, and you eat the empty days while the room sits. This is the widest gap between a co-living house that works and one that disappoints.</p>
<p>The math is simple and brutal. A resident who stays two months turns about six times as often as one who signs for a year. Your revenue can look strong while your net quietly thins, because the calendar is full of short stays with unpaid gaps between them. The operators who win court the longer mid-term stay on purpose and price to keep a good resident in place, because every turn you avoid is margin you keep.</p>

<h2>A side-by-side on one house</h2>
<p>Take a three-bedroom you could lease whole for 2,100 dollars a month. Run it by the room at four bedrooms, say 850 dollars each, and you gross 3,400 a month. That is the 65 percent lift people quote.</p>
<p>Now subtract. Utilities and wifi might run 350 a month. Furniture replacement and common-area cleaning, call it another 300 amortized. Add a vacancy assumption that matches real room turnover, not a best case. When you finish, the by-the-room house still usually wins, but the gap is a few hundred dollars a month, not the 1,300 the gross made it look like. Run those numbers honestly for your own property. These are placeholders, not a promise for your market.</p>

<h2>When traditional renting is the smarter call</h2>
<p>Plenty of houses net more as a boring single lease. If your market has no real demand for rooms, you will hold the higher cost base with none of the premium. If the house needs heavy construction to divide, that budget can bury the spread. And if you have no appetite to run an operation held to near-hotel standards, the whole-house lease is the honest choice. Picking it early saves you a conversion budget and a year of frustration.</p>

<h2>How to run the comparison for your own property</h2>
<p>Do not decide on gross. Start with the room-by-room gross, then subtract the true cost of furniture, covered utilities, cleaning, and your management time, and apply a vacancy number that matches your expected stay length. The figure that survives that subtraction is the only one worth a decision. A few questions get you most of the way:</p>
<ul>
<li>What is the real furnished-room demand in this specific submarket?</li>
<li>What average stay length are you assuming, and what does one room turn cost each time?</li>
<li>Does the house divide into private rooms without major construction?</li>
<li>Who handles resident friction day to day, and is that time priced in?</li>
<li>Do local occupancy and zoning rules allow the room count you are underwriting?</li>
</ul>
<p>If you want the full build for starting on the by-the-room side, I laid it out in <a href="/insights/how-to-start-rent-by-the-room-business">how to start a rent-by-the-room business</a>. For the model itself from the ground up, start with <a href="/insights/what-is-co-living-2026">what is co-living</a>.</p>

<h3>Want to know which model your property should run?</h3>
<p>Room Rental Riches teaches the exact net-versus-gross math I use to decide whether a house should go by the room or stay a single lease. Bring your address and your numbers to a free discovery call and we can pressure-test it together, before you spend a dollar on furniture.</p>
<p>Book a free discovery call at benicehospitality.com</p>`,
    category: "Co-living",
    featured_image_url: "/images/insights/co-living-vs-traditional-renting.webp",
    published: true,
    published_at: "2026-07-22T14:00:00Z",
    meta_description:
      "Co-living usually grosses about 65 percent more than a single lease, but the net is smaller. A landlord's honest comparison of co-living versus traditional renting on cost, turnover, and take-home pay.",
    target_keyword: "co-living vs traditional renting",
    secondary_keywords: [
      "rent by the room vs whole house",
      "is co-living worth it",
      "co-living income",
      "co-living profit",
    ],
    tags: ["Co-Living", "Rent by Room", "Revenue Strategy"],
    faq: [
      {
        question: "Does co-living make more money than renting a whole house?",
        answer:
          "Usually more gross, not always more net. Renting by the room often grosses about 65 percent more than a single lease, but furniture, utilities, cleaning, and higher turnover eat into that. In many markets co-living still nets more, but the gap is smaller than the gross rent suggests.",
      },
      {
        question: "How much more do furnished rooms rent for?",
        answer:
          "Furnished mid-term rooms typically earn 30 to 70 percent more per month than an unfurnished 12-month lease on the same space, because the price includes furniture, utilities, and flexibility.",
      },
      {
        question: "What is the biggest hidden cost of co-living?",
        answer:
          "Turnover. Rooms turn far more often than whole units, and every turn means cleaning, re-listing, screening, and empty days. A two-month average stay turns roughly six times as often as an annual lease.",
      },
      {
        question: "When should I rent a house whole instead of by the room?",
        answer:
          "When your market has no real demand for furnished rooms, the house needs heavy construction to divide, or you do not want to run a hands-on operation. In those cases a single lease often nets more with far less work.",
      },
    ],
  },
  {
    title: "How to Start a Rent-by-the-Room Business: A Step-by-Step 2026 Playbook",
    slug: "how-to-start-rent-by-the-room-business",
    excerpt:
      "Confirm it is legal, pick your model, run the net numbers, secure the property, furnish for mid-term guests, price each room, screen tenants, and systematize turnover. The eight steps to your first rented room, in the order I would do them.",
    content: `<h2>How to Start a Rent-by-the-Room Business: A Step-by-Step 2026 Playbook</h2>
<h3>Eight steps from idea to your first rented room, in the order I would do them</h3>

<p>To start a rent-by-the-room business, confirm the model is legal on your parcel, choose whether you will own or lease the house, run the net numbers, secure the right property, furnish it for mid-term guests, price and list each room, screen your tenants, and build a turnover system. In that order. Most people who fail did the fun parts first and the boring parts never.</p>

<p>I built my portfolio this way, one house at a time, and I have watched new operators skip steps and pay for it. Here is the sequence. One caution before step one. This is operator education, not legal advice. Rent-by-the-room rules vary by city and sometimes by block, so verify your own before you commit.</p>

<h2>What is a rent-by-the-room business?</h2>
<p>A rent-by-the-room business rents the bedrooms of a house to separate tenants who each sign for their own room and share the common areas. You furnish the home, usually cover utilities and wifi, and run each room as its own lease. It is the operator side of co-living. If you want the model explained from the ground up, start with <a href="/insights/what-is-co-living-2026">what is co-living</a>.</p>

<h2>Step 1: Confirm it is legal on your block</h2>
<p>Before anything else, find out whether your city allows renting by the room on the specific parcel. Many codes cap the number of unrelated adults in one dwelling, or treat shared housing as a rooming house with its own permit. Two houses on the same street can carry different zoning.</p>
<p>Call the planning department. Ask whether the use is permitted in that zone, what the occupancy limit is, and whether you need a license. Get the answer in writing, or at least a code citation. A verbal yes from a busy staffer is not something you want to discover was wrong after you close.</p>

<h2>Step 2: Pick your model</h2>
<p>You have three ways in, and they need different amounts of capital.</p>
<ul>
<li>Own the property. Most upside, most capital, most risk. You control the asset and keep all the spread.</li>
<li>Rent to rent. You master lease a house from an owner, get written permission to sublet the rooms, and keep the difference between your lease and the room rents. Far less capital, and the fastest way to test a market.</li>
<li>Manage for an owner. You bring the brand and the systems, the owner brings the house, and you split the return. Good if you have operating skill but little cash.</li>
</ul>
<p>If you are new and want to prove the model before you buy, rent to rent is usually where I point people. Just make sure the sublet permission is in writing in the lease. Without it you do not have a business, you have a lease violation.</p>

<h2>Step 3: Run the numbers before you commit</h2>
<p>Do not sign anything until you have modeled net, not gross. Take the room-by-room rent, then subtract furniture, utilities, wifi, cleaning, your management time, and a realistic vacancy number. What survives is your actual return. I walk through that whole comparison in <a href="/insights/co-living-vs-traditional-renting">co-living versus traditional renting</a>.</p>
<p>The number that kills more deals than any other is turnover. Assume rooms will sit empty part of the year and price that in. If the deal only works at 100 percent occupancy, it does not work.</p>

<h2>Step 4: Find and secure the right property</h2>
<p>The best rent-by-the-room houses share a few traits. They sit near where your tenants need to be, close to jobs, a hospital, a university, or transit. They already have three to five bedrooms, or they have common space that converts to a bedroom without major construction. And they have enough bathrooms and parking that four adults are not fighting over one of each.</p>
<p>If you are leasing rather than buying, be straight with the owner about the model. An owner who understands you are running furnished mid-term housing, keeping the place maintained and professionally managed, is often happy to sign. Hiding it is how you lose the house later.</p>

<h2>Step 5: Furnish for the mid-term guest</h2>
<p>Furnish every bedroom to feel like a small hotel room and make the shared spaces genuinely usable. Budget roughly 2,500 to 6,000 dollars per bedroom depending on your tier. The mistake I see most is spending on the photo instead of the wear. Buy furniture that survives strangers and turnover. I put the full room-by-room approach in <a href="/insights/how-to-furnish-a-co-living-house">how to furnish a co-living house</a>.</p>

<h2>Step 6: Price and list each room</h2>
<p>Price each room to your market, not to a spreadsheet dream. Look at what comparable furnished rooms rent for in your submarket and set each room individually, because the big room with the private bath is not worth the same as the small one by the kitchen. List on the platforms your tenants actually use. For furnished mid-term rooms that means the mid-term rental sites, not just the annual-lease boards.</p>
<p>Include what the price covers in the listing. Furniture, utilities, wifi, and cleaning of common areas should be spelled out, because the all-in simplicity is a big part of why people pay the premium.</p>

<h2>Step 7: Screen tenants and set house rules</h2>
<p>Filling a room is really choosing someone the other residents have to live with. Screen for income, background, and references the way any landlord would, and add a short call to feel out whether they will fit a shared house. One bad roommate empties the other rooms.</p>
<p>Put the house rules in writing and in the agreement. Quiet hours, guests, cleaning, and shared-space expectations. Clear rules up front prevent most of the friction that drives early move-outs.</p>

<h2>Step 8: Systematize turnover and management</h2>
<p>The operators who make real money treat turnover as a repeatable process, not a scramble. When a room comes open, the cleaning, the touch-up, the photos, and the re-listing should already have a checklist and a schedule. A room that sits three extra days because nobody booked the cleaner is pure lost margin that never showed up in your projection.</p>
<p>Decide early who handles the day-to-day friction, the messages, the small repairs, the roommate disputes. Whether that is you or someone you pay, price their time into the model. Unmanaged friction is what turns a good house into a revolving door.</p>

<h2>What it costs to start</h2>
<p>Your main upfront costs are the deposit or down payment, furnishing at roughly 2,500 to 6,000 dollars per bedroom, and a little marketing. A four-bedroom rent-to-rent house you do not buy can often be opened for the cost of the deposit plus furnishings, which is why so many operators start there before they own anything. Keep a reserve for the first slow month, because you will have one.</p>

<h3>Ready to open your first house?</h3>
<p>Room Rental Riches is the step-by-step course version of this playbook, with the screening scripts, the turnover checklists, and the net-math templates I use in my own portfolio. If you are staring at a first property and want a second set of eyes, book a free discovery call and we will walk your specific deal.</p>
<p>Book a free discovery call at benicehospitality.com</p>`,
    category: "Co-living",
    featured_image_url: "/images/insights/how-to-start-rent-by-the-room-business.webp",
    published: true,
    published_at: "2026-07-23T14:00:00Z",
    meta_description:
      "A step-by-step 2026 playbook for starting a rent-by-the-room business: confirm legality, pick your model, run the net numbers, secure and furnish the property, price each room, screen tenants, and systematize turnover.",
    target_keyword: "how to start a rent by the room business",
    secondary_keywords: [
      "how to start a co-living business",
      "rent by the room strategy",
      "rent to rent co-living",
      "co-living startup",
    ],
    tags: ["Co-Living", "Rent by Room", "Operations"],
    faq: [
      {
        question: "How do I start a rent-by-the-room business?",
        answer:
          "Confirm the model is legal on your parcel, choose whether to own or lease the property, run the net numbers, secure a house that divides into private rooms, furnish it for mid-term guests, price and list each room, screen tenants carefully, and build a turnover system. Doing them in that order is what separates operators who profit from ones who stall.",
      },
      {
        question: "Do I need to own property to rent by the room?",
        answer:
          "No. Many operators start with a rent-to-rent model, master leasing a house from an owner with written permission to sublet the rooms and keeping the spread. It needs far less capital than buying and is the fastest way to test a market.",
      },
      {
        question: "How much money do I need to start a co-living business?",
        answer:
          "The main costs are the deposit or down payment, furnishing at roughly 2,500 to 6,000 dollars per bedroom, and marketing. A rent-to-rent four-bedroom can sometimes open for the deposit plus furnishings, while buying requires a full down payment.",
      },
      {
        question: "Do I need my landlord's permission to sublet rooms?",
        answer:
          "Yes, in writing. If you run a rent-to-rent model, the sublet permission has to be in the lease. Without it you are violating your own lease and can lose the house and your tenants at once.",
      },
      {
        question: "Is renting by the room worth it?",
        answer:
          "It can be, in markets with real demand for furnished rooms and for operators willing to run the turnover. It often grosses about 65 percent more than a single lease, but the net depends on how well you control vacancy and management costs.",
      },
    ],
  },
  {
    title: "Co-Living for Travel Nurses: The Mid-Term Rental Play for Operators",
    slug: "co-living-for-travel-nurses",
    excerpt:
      "Travel nurses book furnished rooms for 13 weeks at a time, arrive with a housing stipend, and need a move-in-ready place near the hospital. That is exactly what a co-living room rents. Here is how to set yours up so nurses pick it.",
    content: `<h2>Co-Living for Travel Nurses: The Mid-Term Rental Play for Operators</h2>
<h3>Why healthcare travelers are one of the steadiest tenants a co-living operator can fill a room with</h3>

<p>Travel nurses are one of the best tenants a co-living operator can target. They book furnished rooms for 13 weeks at a time, they arrive with a housing stipend built into their pay, and they need a place near the hospital that is ready to live in on day one. That is a furnished mid-term room, which is exactly what a co-living house rents.</p>

<p>I fill rooms with healthcare travelers in my own portfolio, and they are some of my most reliable residents. Here is why the fit works, what they actually pay, and how to set a room up so a nurse picks yours over the one down the street.</p>

<h2>Why are travel nurses a good fit for co-living?</h2>
<p>Travel nurses need three things that co-living already provides. A furnished room they can move into without buying anything, a lease measured in weeks and months instead of a year, and a location close to the hospital where they are contracted. A standard 12-month unfurnished apartment fails all three. Your co-living room passes all three.</p>
<p>The contract length is the quiet advantage. A typical travel assignment runs 13 weeks, and many nurses extend or take a second contract in the same city. That gives you a resident who stays a full quarter or longer, which is far easier on your turnover math than a string of short stays.</p>

<h2>What do travel nurses actually pay?</h2>
<p>Travel nurses come with a housing stipend that usually runs from about 1,200 dollars a month in lower-cost areas to 4,000 or more in expensive cities. Furnished rooms and units marketed to them commonly rent between 1,500 and 4,500 dollars a month depending on the market, with high-demand cities at the top of that range.</p>
<p>The stipend is the part that matters for you. It means a big share of your rent is effectively pre-funded by the nurse's contract. They are motivated to keep their housing cost at or under the stipend, so a clean furnished room priced sensibly against that number is an easy yes for them.</p>

<h2>How the 13-week contract changes your turnover math</h2>
<p>A 13-week booking is roughly a quarter of the year in one placement. Compare that to a stream of two and three-week stays that leave gaps between them. Fewer turns means fewer cleanings, fewer re-listings, and fewer empty nights, which is where co-living margin usually leaks. I covered why turnover decides profitability in <a href="/insights/co-living-vs-traditional-renting">co-living versus traditional renting</a>.</p>
<p>The extension is the bonus. A nurse who likes the room and renews for a second contract gives you six months of continuous rent with a single move-in. Court that. A resident who renews is worth more than two who do not, because you skip the whole cost of turning the room.</p>

<h2>What travel nurses need in a room</h2>
<p>Set the room up for someone who works long shifts and sleeps at odd hours. The essentials are not complicated, but missing one of them loses the booking.</p>
<ul>
<li>Fully furnished, down to the kitchen basics, so they arrive with a suitcase and nothing else.</li>
<li>A genuinely dark, quiet bedroom, because a night-shift nurse sleeps during the day.</li>
<li>Reliable, fast wifi, since a lot of charting and life admin happens online.</li>
<li>Simple parking, ideally off street, for someone driving to a hospital at shift change.</li>
<li>Flexible, weeks-based lease terms that match a 13-week contract, not a 12-month one.</li>
<li>In-unit or on-site laundry, which is close to non-negotiable for scrubs.</li>
</ul>

<h2>Where to list for travel nurses</h2>
<p>List where healthcare travelers actually look, which is the furnished mid-term rental sites, not the annual-lease boards. Furnished Finder is the one most travel nurses check first, because it was built around exactly this tenant. Round it out with the general mid-term platforms and a direct listing you control.</p>
<p>Write the listing for the nurse. Name the hospitals you are near and the drive time, state that the term is flexible and furnished, and spell out that utilities and wifi are included. The nurse is comparing a dozen rooms fast between shifts. The one that answers their questions before they ask wins.</p>

<h2>The risk: seasonality and competition</h2>
<p>Two things can bite you. Travel assignments ebb and flow, so demand is not perfectly even across the year, and the furnished-room market has gotten more crowded as more operators chase the same tenant. Do not underwrite a house on travel nurses alone at peak rates.</p>
<p>The fix is to stay open to the wider mid-term pool. Remote workers, relocations, and traveling professionals in other fields want the same furnished flexible room. Position for the nurse, but keep the room appealing to any 30-day-plus guest so a slow month in one channel fills from another.</p>

<h2>How to position your co-living house for healthcare workers</h2>
<p>If you are near a hospital, lean into it. Keep at least one room permanently set up as a travel-nurse room, dark and quiet with fast wifi and flexible terms, and build a little reputation with the traveler community in your city. Nurses talk to each other. A clean, honest, well-run room gets passed along by name, and referrals cost you nothing.</p>
<p>This is the same operating discipline the whole model rewards. If you are still building the house itself, start with <a href="/insights/how-to-start-rent-by-the-room-business">how to start a rent-by-the-room business</a>.</p>

<h3>Want to fill your rooms with steady mid-term tenants?</h3>
<p>Room Rental Riches teaches how to position, price, and list co-living rooms for the mid-term guest, including the healthcare travelers who renew and refer. If you have a house near a hospital and want to build it around this tenant, book a free discovery call and we will map it out.</p>
<p>Book a free discovery call at benicehospitality.com</p>`,
    category: "Co-living",
    featured_image_url: "/images/insights/co-living-for-travel-nurses.webp",
    published: true,
    published_at: "2026-07-19T14:00:00Z",
    meta_description:
      "Travel nurses book furnished rooms for 13 weeks with a housing stipend built into their pay. A co-living operator's guide to what nurses pay, what they need in a room, where to list, and how to win the booking.",
    target_keyword: "co-living for travel nurses",
    secondary_keywords: [
      "renting to travel nurses",
      "travel nurse housing",
      "mid-term rental for travel nurses",
      "furnished rentals for nurses",
    ],
    tags: ["Co-Living", "Mid-Term Rentals", "Travel Nurses"],
    faq: [
      {
        question: "Why are travel nurses good tenants for co-living?",
        answer:
          "They book furnished rooms for about 13 weeks at a time, arrive with a housing stipend built into their pay, and need a move-in-ready room near the hospital. That matches a furnished co-living room, and the quarter-long stays are easier on turnover than short bookings.",
      },
      {
        question: "How much do travel nurses pay for housing?",
        answer:
          "Their housing stipend usually runs from about 1,200 dollars a month in lower-cost areas to 4,000 or more in expensive cities. Furnished rooms marketed to them commonly rent between 1,500 and 4,500 dollars a month depending on the market.",
      },
      {
        question: "Where do travel nurses look for housing?",
        answer:
          "Mostly on furnished mid-term rental sites. Furnished Finder is the one most check first because it was built for this tenant, alongside other mid-term platforms and direct listings near the hospital.",
      },
      {
        question: "How long do travel nurses rent for?",
        answer:
          "A standard travel assignment is about 13 weeks, roughly a quarter of the year, and many nurses extend or take a second contract in the same city, which can turn one move-in into six months of continuous rent.",
      },
    ],
  },
  {
    title: "How to Furnish and Design a Co-Living House That Rents Fast",
    slug: "how-to-furnish-a-co-living-house",
    excerpt:
      "Treat each private room like a small hotel room and each shared space like the reason people chose the house. Budget roughly 2,500 to 6,000 dollars per bedroom, buy for durability over the photo, and get the details right. Here is how.",
    content: `<h2>How to Furnish and Design a Co-Living House That Rents Fast</h2>
<h3>Where to spend, where to save, and the details that get a room booked and renewed</h3>

<p>Furnish a co-living house by treating each private room like a small hotel room and each shared space like the reason people chose the house. Budget roughly 2,500 to 6,000 dollars per bedroom, put most of it into beds, seating, and the kitchen, and buy for durability over the photo. A room that looks good and holds up rents fast and rents again.</p>

<p>I furnish every house in my portfolio to the same standard, because in mid-term rentals the feel of the space matters more than the square footage. Here is where I spend, where I save, and the small things that decide whether a room sits empty or gets renewed.</p>

<h2>What does it cost to furnish a co-living house?</h2>
<p>Plan on roughly 2,500 to 6,000 dollars per bedroom, depending on how nice your market expects the house to be. For a whole three-bedroom, a mid-range furnishing usually lands somewhere around 18,000 to 35,000 dollars once you count the shared spaces, and a budget build can come in under that. A rough split that works: about 55 to 60 percent on furniture, 20 to 25 percent on appliances and electronics, and the rest on linens, decor, and basic safety gear.</p>
<p>Treat furniture as a recurring cost, not a one-time purchase. Beds and sofas wear out on a schedule, faster in a house with turnover, so budget to replace pieces every year rather than assuming you buy once and forget it.</p>

<h2>Design the private room like a small hotel room</h2>
<p>The private bedroom is what they are actually paying for, so make it feel complete and calm. That means a real, comfortable bed, not the cheapest frame you can find, blackout curtains, a nightstand with a lamp and a charging outlet, a small desk or work surface, and enough storage that they can unpack and stay a while.</p>
<p>Aim for a room someone would be happy to sleep in on a business trip. Clean lines, warm light, one or two nice touches, and nothing broken or wobbly. You are not decorating a magazine spread. You are making a stranger feel at home fast.</p>

<h2>The shared spaces are where you win or lose</h2>
<p>Residents tour the private room, but they judge the house on the kitchen and the living room. A shared kitchen that is well equipped and pleasant to cook in, and a living room with enough real seating that everyone is not stuck in their bedroom, is what separates a house people stay in from one they leave.</p>
<p>Spend real money here. A solid dining table that seats everyone, a couch that fits the number of residents, good lighting, and a kitchen stocked with the things people actually use. When the shared space works, residents stay longer and refer their friends, which is the cheapest marketing you will ever get.</p>

<h2>The furniture budget, room by room</h2>
<p>A rough per-space guide for a mid-range co-living house helps you allocate without overspending in one place and starving another.</p>
<ul>
<li>Each bedroom: roughly 1,200 to 2,500 dollars for bed, mattress, nightstand, lamp, desk, and storage.</li>
<li>Living and common areas: the biggest single line, since seating, a table, and lighting carry the house.</li>
<li>Kitchen and dining: cookware, dishes, small appliances, and a table that seats the full house.</li>
<li>Each bathroom: a smaller line for storage, a mirror, and the fixtures a shared bath needs.</li>
</ul>
<p>Put your money into the pieces people touch every day. The bed, the couch, the mattress, the kitchen. Those are the things a resident feels, and the things a cheap version of will cost you in early move-outs.</p>

<h2>Buy for durability, not the photo</h2>
<p>Your furniture has to survive strangers and turnover, so buy for wear. Washable, darker-toned upholstery hides life better than a white linen couch. Solid wood and metal outlast particle board that wobbles apart after the second move. Mattress protectors and stain-resistant fabrics save you replacing things every year.</p>
<p>The instinct to buy the prettiest option is the one to fight. A room that photographs well but falls apart in six months costs you more than a plain room that holds up for five years. In this business the durable choice is almost always the profitable one.</p>

<h2>The details that get you booked and renewed</h2>
<p>The small things are what tip a booking your way and keep a good resident from leaving. None of them cost much.</p>
<ul>
<li>Fast wifi, which is closer to a utility than an amenity for remote workers and nurses.</li>
<li>Real blackout in the bedrooms, so shift workers and early risers actually sleep.</li>
<li>Enough outlets and USB charging near the bed and the desk.</li>
<li>In-unit or on-site laundry, which many mid-term guests treat as a requirement.</li>
<li>A stocked kitchen, so they can cook the night they arrive.</li>
<li>Labeled, secure storage so residents are not living out of a suitcase.</li>
</ul>

<h2>What to skip</h2>
<p>Do not spend on things that photograph well and do nothing. Fragile decor, delicate rugs, and anything you would be upset to see damaged do not belong in a shared house. Skip the trendy pieces that date fast. And do not over-personalize, because a room that feels like your taste is harder to rent than a clean, neutral one that lets a resident picture their own life in it.</p>
<p>Furnishing is the last big step before you list. If you are working the whole process from the start, the full sequence is in <a href="/insights/how-to-start-rent-by-the-room-business">how to start a rent-by-the-room business</a>.</p>

<h3>Want a furnishing plan that pays for itself?</h3>
<p>Room Rental Riches includes the furnishing lists, the per-room budgets, and the durability picks I use to set up a co-living house that rents fast and holds up. If you are about to furnish your first property, book a free discovery call and we will build the plan against your budget.</p>
<p>Book a free discovery call at benicehospitality.com</p>`,
    category: "Co-living",
    featured_image_url: "/images/insights/how-to-furnish-a-co-living-house.webp",
    published: true,
    published_at: "2026-07-20T14:00:00Z",
    meta_description:
      "How to furnish and design a co-living house that rents fast: what it costs per bedroom, where to spend and save, how to set up the private rooms and shared spaces, and the details that get a room booked and renewed.",
    target_keyword: "how to furnish a co-living house",
    secondary_keywords: [
      "co-living design",
      "furnishing a rent by the room house",
      "mid-term rental furniture cost",
      "co-living bedroom setup",
    ],
    tags: ["Co-Living", "Design", "Operations"],
    faq: [
      {
        question: "How much does it cost to furnish a co-living house?",
        answer:
          "Plan on roughly 2,500 to 6,000 dollars per bedroom depending on your market. A mid-range three-bedroom often lands around 18,000 to 35,000 dollars once you include the shared spaces, split roughly 55 to 60 percent furniture, 20 to 25 percent appliances, and the rest on linens, decor, and safety.",
      },
      {
        question: "What should I spend the most on when furnishing a co-living house?",
        answer:
          "The pieces people use every day: the beds and mattresses, the living room seating, and the kitchen. Those carry the resident's experience, and cheap versions cost you in early move-outs. The shared kitchen and living room are what get residents to stay and refer.",
      },
      {
        question: "What furniture holds up best in a rental?",
        answer:
          "Durable, washable, darker-toned upholstery, solid wood and metal over particle board, and stain-resistant fabrics with mattress protectors. Your furniture has to survive strangers and turnover, so buy for wear, not for the photo.",
      },
      {
        question: "What do mid-term renters expect in a furnished room?",
        answer:
          "A comfortable bed, blackout curtains, a work surface, real storage, fast wifi, and a stocked kitchen they can use the night they arrive. Laundry on site and simple parking matter too, especially for remote workers and travel nurses.",
      },
    ],
  },
];

async function seedColivingInsights() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("Seeding co-living Insights cluster...");
  for (const post of BLOG_POSTS) {
    try {
      await sql`
        INSERT INTO blog_posts (
          title, slug, excerpt, content, category, featured_image_url,
          published, published_at, meta_description, target_keyword,
          secondary_keywords, hashtags, tags, faq
        )
        VALUES (
          ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content},
          ${post.category}, ${post.featured_image_url},
          ${post.published}, ${post.published_at},
          ${post.meta_description}, ${post.target_keyword},
          ${post.secondary_keywords}, ${[]}, ${post.tags},
          ${JSON.stringify(post.faq)}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          category = EXCLUDED.category,
          featured_image_url = EXCLUDED.featured_image_url,
          published = EXCLUDED.published,
          published_at = EXCLUDED.published_at,
          meta_description = EXCLUDED.meta_description,
          target_keyword = EXCLUDED.target_keyword,
          secondary_keywords = EXCLUDED.secondary_keywords,
          tags = EXCLUDED.tags,
          faq = EXCLUDED.faq,
          updated_at = NOW()
      `;
      console.log(`  upserted ${post.slug} -> ${post.published_at}`);
    } catch (error) {
      console.error(`  FAILED ${post.slug}:`, error);
    }
  }
  console.log("Co-living Insights seeding complete.");
}

seedColivingInsights().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
