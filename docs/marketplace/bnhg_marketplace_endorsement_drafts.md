# bnhg_marketplace_endorsement_drafts

**Company:** BNHG · **Status:** DRAFT, not published · **Generated:** 2026-09-16
**Source of truth:** `bnhg_marketplace_endorsement_drafts.json`. Edit that file; this is a readable copy.

## Stakeholder approval required

- **Della** approves every "How Della uses it" and "Della's take" (Homes and Back Office).
- **Alex** approves every "How Alex uses it" and "Alex's take" (Vehicles and Back Office).
- These are first-person endorsements. Under the FTC Endorsement Guides they must reflect real use and honest opinion. Rewrite or delete anything that isn't true.
- Every `[confirm: ...]` must be resolved. The import script refuses text that still contains one.
- Drafts were written only from each product's existing site copy. Reviewer notes flag inferences and existing site claims that need checking.

## How to publish approved entries

1. Edit the text in the JSON and set `della_approved` or `alex_approved` to `true` on approved entries.
2. Dry run: `node --env-file=.env.local --import tsx scripts/import-marketplace-endorsements.ts`
3. Apply: add `--apply`. Only approved fields are written. Everything else is left untouched.

## Homes (Della)

### Angel Soft Toilet Paper, Mega Rolls

`angel-soft-toilet-paper-mega-rolls` · bathroom

- **How Della uses it:** I keep mega rolls stocked for the shared bathrooms. Bigger rolls mean fewer restocking runs between turnovers.
- **Della's take:** It's a brand residents don't complain about, and in a shared house that counts. Fewer trips to restock is the rest of the reason.

### Bounty Quick-Size Paper Towels, Family Rolls

`bounty-quick-size-paper-towels-family-rolls` · bathroom

- **How Della uses it:** Paper towels live in the shared kitchen. I buy the family rolls in bulk so the turnover crew never runs short.
- **Della's take:** Quick-Size sheets mean a small spill uses a small sheet. Eight triple rolls is a real buffer before the next order.

### Korky BeehiveMAX Toilet Plunger

`korky-beehivemax-toilet-plunger` · bathroom

- **How Della uses it:** A plunger stays in the bathroom so nobody has to go hunting for tools. The beehive head fits round and elongated bowls, so I only buy one model.
- **Della's take:** A clogged toilet is the most common after-hours call. If a resident can handle it with the plunger that's already there, that's a call I don't get.

### Pumie Toilet Bowl Ring Remover / Pumice Scouring Stick

`pumie-toilet-bowl-ring-remover-pumice-scouring-stick` · bathroom

- **How Della uses it:** It lives in the turnover cleaning kit for the hard-water ring in the toilet bowl. That's the ring regular cleaners leave behind.
- **Della's take:** It's a cheap consumable. It can bring back a bowl you'd otherwise think about replacing.

### AmazerBath Waffle Shower Curtain, Machine Washable Fabric

`amazerbath-waffle-shower-curtain-machine-washable-fabric` · bathroom

- **How Della uses it:** A fabric curtain goes in the shared bathroom, and it goes in the wash between residents instead of the trash. White means I can bleach it back.
- **Della's take:** Fabric launders, vinyl gets thrown out. The waffle texture also looks better in listing photos than the price suggests.

### Hookless Snap-In Fabric Shower Curtain Liner, Washable

`hookless-snap-in-fabric-shower-curtain-liner-washable` · bathroom

- **How Della uses it:** The liner snaps out on its own. At turnover I pull the liner and wash it, and the curtain stays up.
- **Della's take:** The liner is the part that fails. I'd rather replace that than the whole curtain.

### GORILLA GRIP Bath Tub Shower Mat, 35 x 16, Clear

`gorilla-grip-bath-tub-shower-mat-35-x-16-clear` · bathroom

- **How Della uses it:** It goes in the tub-shower. The drain holes let it dry between showers, and the clear finish doesn't clash with the bathroom.
- **Della's take:** A slip in the tub is a real liability in a rental. This is a cheap way to lower that risk.

### Dove Deep Moisture Body Wash, 30.6 oz Pump

`dove-deep-moisture-body-wash-30-6-oz-pump` · bathroom

- **How Della uses it:** A big pump bottle sits in the shared bath and gets restocked when it runs low. No drawer full of tiny bottles.
- **Della's take:** One large bottle outlasts a pile of miniatures. A name brand on the shelf also tells residents we didn't cut corners.

### Colgate Extra Clean Medium Toothbrushes, Multi-Pack

`colgate-extra-clean-medium-toothbrushes-multi-pack` · bathroom

- **How Della uses it:** A sealed toothbrush goes in the welcome kit when a new resident moves in.
- **Della's take:** Individually sealed matters for anything that goes in someone's mouth. Medium bristles work for most people, and a six-pack keeps kits stocked.
- _Reviewer notes:_ Assumes BNP gives new residents a welcome kit (product copy is framed around welcome kits). Confirm.

### Crest Cavity Protection Toothpaste, Travel or Multi-Pack

`crest-cavity-protection-toothpaste-travel-or-multi-pack` · bathroom

- **How Della uses it:** Travel-size toothpaste goes in the welcome kit next to the toothbrush. It fits without taking up room.
- **Della's take:** Single-use sizes mean nobody is sharing a tube. I buy the multi-pack so I'm not reordering every time a room turns over.
- _Reviewer notes:_ Assumes BNP uses welcome kits. Left out the product copy's 'covers months of turnovers' duration claim.

### Softsoap Liquid Hand Soap, Pump Bottles

`softsoap-liquid-hand-soap-pump-bottles` · bathroom

- **How Della uses it:** Every sink in the house gets a pump bottle. When one runs out, I swap the bottle instead of refilling it.
- **Della's take:** Nothing gets decanted into unlabeled containers. Residents can see exactly what they're using.

### Zinus Leonardo Metal Platform Bed Frame, Victorian Spindle Headboard, Queen

`zinus-leonardo-metal-platform-bed-frame-headboard-queen` · bedroom

- **How Della uses it:** This is the bed frame for a furnished room. The headboard is built in, so the room looks finished the day it goes together.
- **Della's take:** No box spring, no separate headboard, nothing anchored to the wall. Steel holds up to resident turnover better than an upholstered base.

### ZINUS 10 Inch Green Tea Memory Foam Mattress, Queen

`zinus-10-inch-green-tea-memory-foam-mattress-queen` · bedroom

- **How Della uses it:** The mattress ships compressed, so one person can get it up the stairs and into the room. It takes standard sheets, no deep pockets needed.
- **Della's take:** The 10-inch profile keeps my linen simple. The green tea infusion is meant to cut odor between residents.

### SafeRest Premium Waterproof Queen Mattress Protector

`saferest-premium-waterproof-queen-mattress-protector` · bedroom

- **How Della uses it:** The waterproof protector goes on the mattress before anything else. At turnover it comes off and goes through the wash with the rest of the linen.
- **Della's take:** A mattress is the most expensive thing in the room to ruin. This is a small cost against that, and the fitted skirt stays put through repeated washing.

### CGK Unlimited Queen 4-Piece Sheet Set, White

`cgk-unlimited-queen-4-piece-sheet-set-white` · bedroom

- **How Della uses it:** White sheets go on the bed so I can bleach them between residents. When one pillowcase gets stained, I replace that piece, not the whole bed's linen.
- **Della's take:** All white keeps the linen closet simple and bleachable. The weave holds up to frequent hot washes.

### Utopia Bedding Gusseted Queen Bed Pillows, Set of 2, White

`utopia-bedding-gusseted-queen-bed-pillows-set-of-2-white` · bedroom

- **How Della uses it:** A pair goes on each queen bed, inside zippered pillow protectors.
- **Della's take:** The gusseted edge holds its loft longer than flat-sewn pillows. They're cheap enough to replace instead of trying to deep-clean.
- _Reviewer notes:_ Use line references the Utopia pillow protectors (next product) as the pairing. Drop if Della doesn't pair them.

### Utopia Bedding Zippered Pillow Protectors, Queen, 2-Pack

`utopia-bedding-zippered-pillow-protectors-queen-2-pack` · bedroom

- **How Della uses it:** Each pillow gets a zippered protector under the pillowcase. At turnover I wash the protector, and the pillow stays out of the machine.
- **Della's take:** Pillows last longer when they never go in the wash. The brushed microfiber is quiet under the pillowcase.
- _Reviewer notes:_ Left out the product copy's 'years instead of months' duration claim.

### Utopia Bedding Queen Comforter / Duvet Insert, White, 88 x 88

`utopia-bedding-queen-comforter-duvet-insert-white-88-x-88` · bedroom

- **How Della uses it:** The insert goes inside a washable duvet cover. Between residents I wash the cover instead of wrestling a whole comforter into the machine.
- **Della's take:** White looks clean and can be bleached. At 88x88 it fits a queen without dragging on the floor.

### Yoobure Nightstand with Charging Station and Fabric Drawers

`yoobure-nightstand-with-charging-station-and-fabric-drawers` · bedroom

- **How Della uses it:** It goes next to the bed. Residents charge their phones at the nightstand instead of running an extension cord across the room.
- **Della's take:** Built-in outlets and USB ports cut the cord tangle. Fabric drawers have no hardware to break, and the narrow footprint fits a tight bedroom.

### Simple Designs Basic Table Lamp for Bedside Use

`simple-designs-basic-table-lamp-for-bedside-use` · bedroom

- **How Della uses it:** A small lamp on the nightstand, with room left for a phone, a glass of water, and a book.
- **Della's take:** It's cheap enough to put the same lamp in each bedroom, so replacements are simple. The fabric shade keeps the light soft.

### NeuType Full Length Mirror, Black Frame

`neutype-full-length-mirror-black-frame` · bedroom

- **How Della uses it:** A full-length mirror goes in the bedroom. It can lean against the wall, so I don't have to put holes in the drywall.
- **Della's take:** A full-length mirror is something people ask for in a furnished room. The thin black frame goes with most furniture.

### NICETOWN Thermal Insulated Blackout Curtains, 52 x 84, 2 Panels

`nicetown-thermal-insulated-blackout-curtains-52-x-84-2-panels` · bedroom

- **How Della uses it:** Blackout panels go on the bedroom windows for residents working night shifts. One pack covers one standard window.
- **Della's take:** Real blackout lining matters when someone has to sleep during the day. The thermal backing also takes some summer load off the AC.

### Amazon Basics Room Darkening Blackout Curtain Rod

`amazon-basics-room-darkening-blackout-curtain-rod` · bedroom

- **How Della uses it:** This rod holds the blackout panels. It adjusts from 28 to 48 inches, so one rod fits most bedroom windows.
- **Della's take:** One part for most windows keeps ordering simple. Buying the rod separately means I replace only what breaks.

### SHW Home Office 40-Inch Computer Desk

`shw-home-office-40-inch-computer-desk` · bedroom

- **How Della uses it:** A 40-inch desk goes in the bedroom corner for residents who work from their room.
- **Della's take:** Remote workers filter listings for a desk in the bedroom. This one fits without taking over the room, and it breaks down when a room turns over.

### Furmax Office Mid-Back Swivel Mesh Desk Chair

`furmax-office-mid-back-swivel-mesh-desk-chair` · bedroom

- **How Della uses it:** It goes with the bedroom desk. Residents working from home sit in it for long days, so it swivels and adjusts for height.
- **Della's take:** The mesh back breathes. It's priced so I replace it when it wears out instead of trying to repair it.

### Hotel-Grade White Linen Set (Queen)

`property-linen-set` · bedroom

- **How Della uses it:** White percale goes on the bed, with [confirm: number of sets per bed] sets in rotation so a clean set is ready at turnover.
- **Della's take:** White only means bleach works and every set rotates the same way. That keeps the linen closet simple.
- _Reviewer notes:_ Product body claims 'the same percale we put on every MTR bed', 'holds up past 100 washes', and 'under $1/night'. None repeated in Della's fields. Confirm Della uses this exact set and whether those claims are verified. Copy suggests three sets per bed.

### Cooling Mattress Topper

`property-mattress-topper` · bedroom

- **How Della uses it:** The topper goes on the mattress in a furnished room. It's the first bed upgrade I'd make.
- **Della's take:** Cooling gel, not cheap memory foam. It also hides wear on an older mattress, which buys time before a replacement.
- _Reviewer notes:_ Product body claims it 'turns a $400 mattress into a 5-star review' and 'costs less than one bad review'. Not repeated here; unverified. Product has no brand name, so confirm which topper Della actually uses.

### Shark Navigator Lift-Away Professional Upright Vacuum

`shark-navigator-lift-away-professional-upright-vacuum` · cleaning-turnover

- **How Della uses it:** This is the whole-house vacuum at turnover. The canister lifts off for stairs and upholstery.
- **Della's take:** An upright usually gives up at the stairs. This one doesn't, and HEPA filtration matters when rooms turn back to back.

### O-Cedar EasyWring Microfiber Spin Mop & Bucket System

`o-cedar-easywring-microfiber-spin-mop-bucket-system` · cleaning-turnover

- **How Della uses it:** The spin mop handles hard floors at turnover. The microfiber head goes in the washer between units.
- **Della's take:** The foot pedal wrings it out, so hands stay out of the dirty water. Mop and bucket come together as one tool.

### Casabella Plastic Cleaning Storage Caddy

`casabella-plastic-cleaning-storage-caddy` · cleaning-turnover

- **How Della uses it:** Each house has its own caddy with the turnover kit in it. I carry the whole kit room to room in one trip.
- **Della's take:** One caddy per house is how supplies stop wandering off. It's plastic, so it rinses clean after a spill.

### Pine-Sol Multi-Surface Cleaner, Original

`pine-sol-multi-surface-cleaner-original` · cleaning-turnover

- **How Della uses it:** I dilute it for hard surfaces during turnover. One bottle of concentrate goes a long way.
- **Della's take:** It's one product for a lot of surfaces, so there's less to stock. The pine smell tells a new resident the place was just cleaned.

### Lysol Power Foaming Bathroom Cleaner, 32 oz

`lysol-power-foaming-bathroom-cleaner-32-oz` · cleaning-turnover

- **How Della uses it:** It's the shower wall cleaner in the turnover kit. The foam stays on the wall long enough to break down soap scum.
- **Della's take:** It cleans and disinfects in one pass. That saves time in a shared bathroom.

### Lysol Power Toilet Bowl Cleaner

`lysol-power-toilet-bowl-cleaner` · cleaning-turnover

- **How Della uses it:** Every toilet gets it at turnover. The angled neck gets the gel under the rim.
- **Della's take:** Under the rim is the part people actually check. The gel clings to the bowl so it has time to work.

### Windex Original Glass Cleaner

`windex-original-glass-cleaner` · cleaning-turnover

- **How Della uses it:** Mirrors, windows, and glass tabletops at turnover. It's a standard item in the cleaning kit.
- **Della's take:** Mirrors are one of the first things a new resident looks at up close. This is a cheap way to get that right every time.

### Lysol Disinfectant Spray, Crisp Linen

`lysol-disinfectant-spray-crisp-linen` · cleaning-turnover

- **How Della uses it:** I use it on the soft surfaces a wipe-down can't reach, like mattresses, the sofa, and curtains.
- **Della's take:** It disinfects without leaving a chemical smell behind. Crisp Linen just smells clean.

### MR.SIGA Microfiber Cleaning Cloths, 12-Pack

`mr-siga-microfiber-cleaning-cloths-12-pack` · cleaning-turnover

- **How Della uses it:** I color-code the cloths by room. The bathroom cloth never ends up on the kitchen counter.
- **Della's take:** Microfiber cleans glass without lint. They wash and go right back in the kit.
- _Reviewer notes:_ Color-coding assumes the pack comes in multiple colors (implied by product copy). Confirm.

### Scrub Daddy Original FlexTexture Scrubbers, Multi-Pack

`scrub-daddy-original-flextexture-scrubbers-multi-pack` · cleaning-turnover

- **How Della uses it:** One goes in the kitchen and one in the bathroom. Cold water to scrub, warm water to wipe.
- **Della's take:** Regular sponges go sour fast. This one resists odor better, so it doesn't turn into the sponge nobody wants to touch.

### Hefty Strong Large Trash Bags, 30 Gallon

`hefty-strong-large-trash-bags-30-gallon` · cleaning-turnover

- **How Della uses it:** 30-gallon drawstring bags fit the kitchen and common-area cans. I use them for turnover cleanouts too.
- **Della's take:** 56 bags to a box means trash bags aren't a weekly errand. The drawstring makes cleanouts faster.

### Devoko 6 Person Acacia Wood Dining Table

`devoko-6-person-acacia-wood-dining-table` · kitchen-dining

- **How Della uses it:** It's the dining table for the shared kitchen. It seats six, so the household can actually eat together.
- **Della's take:** Solid acacia takes daily use better than veneer. The natural finish hides minor marks between residents.

### Furmax Metal Dining Chairs, Set

`furmax-metal-dining-chairs-set` · kitchen-dining

- **How Della uses it:** These go around the dining table. When the table goes against the wall, they stack flat out of the way.
- **Della's take:** Metal wipes clean after a spill. No shampooing upholstery at turnover.
- _Reviewer notes:_ Product bullet says a set of four 'matches the six-seat dining table'. Four chairs for six seats is a mismatch; check set size or the bullet. Della copy avoids the count.

### TOSHIBA Countertop Microwave Oven, 1.2 Cu Ft

`toshiba-countertop-microwave-oven-1-2-cu-ft` · kitchen-dining

- **How Della uses it:** It sits on the shared kitchen counter for reheating. No cabinet work to install it.
- **Della's take:** A dinner plate turns flat inside, which is the whole job. 1000 watts is enough for a kitchen several people share.

### Cuisinart CPT-180P1 4-Slice Classic Toaster

`cuisinart-cpt-180p1-4-slice-classic-toaster` · kitchen-dining

- **How Della uses it:** It's the toaster in the shared kitchen. Four slots, and wide enough for bagels.
- **Della's take:** Four slots instead of two means less of a morning line when housemates share one kitchen. The stainless outside wipes down between residents.

### BLACK+DECKER 12-Cup Programmable Coffee Maker

`black-decker-12-cup-programmable-coffee-maker` · kitchen-dining

- **How Della uses it:** It goes in the shared kitchen, set on the timer the night before. Twelve cups means the whole house has coffee and the first person up isn't brewing for everyone.
- **Della's take:** Simple controls mean fewer 'how does this work' texts from residents. It does the one job a shared kitchen needs.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### COSORI Electric Kettle, 1.7L Glass, Auto Shutoff

`cosori-electric-kettle-1-7l-glass-auto-shutoff` · kitchen-dining

- **How Della uses it:** The kettle sits in the shared kitchen for residents who want tea without waiting on the coffee pot. 1.7 liters covers several mugs in one boil.
- **Della's take:** Auto shutoff is why it's here. When someone walks away from it, it turns itself off, and that's one less unattended appliance for me to worry about.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### T-fal Ultimate Hard Anodized Nonstick Cookware Set, 17-Piece

`t-fal-ultimate-hard-anodized-nonstick-cookware-set-17-piece` · kitchen-dining

- **How Della uses it:** When I set up a house, this stocks the shared kitchen in one order. Seventeen pieces covers the pots and pans residents actually cook with.
- **Della's take:** Cookware in a shared kitchen doesn't belong to anyone, so it gets handled hard. Hard anodized holds up, and it's dishwasher safe, which matters when nobody owns the cleanup.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### OXO Good Grips 20 Piece Everyday Kitchen Utensil Set

`oxo-good-grips-20-piece-everyday-kitchen-utensil-set` · kitchen-dining

- **How Della uses it:** This covers prep and cooking tools for a shared kitchen in one buy. The holder keeps everything together so the drawers don't turn into a junk pile.
- **Della's take:** Nonslip handles stay usable with wet hands. That matters in a kitchen where several people cook every day.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Libbey Gibraltar Drinking Glass Set

`libbey-gibraltar-drinking-glass-set` · kitchen-dining

- **How Della uses it:** Twelve matching tumblers go in the shared cabinet. When one breaks, there are plenty left and I'm not reordering right away.
- **Della's take:** One stackable style keeps the cabinet from becoming a mismatched collection. The heavy base means fewer tipped and chipped glasses.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Amazon Basics Porcelain Coffee Mugs, White

`amazon-basics-porcelain-coffee-mugs-white` · kitchen-dining

- **How Della uses it:** Twelve white mugs cover the household in the shared kitchen, with room for a few breaks. They go in the dishwasher and the microwave.
- **Della's take:** Plain white means I replace one at a time and it still matches. I don't want a cabinet full of odds and ends.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Dropped the product copy's 'still looks like a set three years later' line; no durations in the drafts.

### LIANYU 40-Piece Stainless Steel Flatware Set

`lianyu-40-piece-stainless-steel-flatware-set` · kitchen-dining

- **How Della uses it:** Service for eight goes in the silverware drawer, so a full house can eat at the same time. A few pieces can go missing without anyone noticing.
- **Della's take:** Stainless steel won't rust in a shared dishwasher, and the finish still looks clean in listing photos.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### IRIS USA Stackable Plastic Storage Bin with Lid

`iris-usa-stackable-plastic-storage-bin-with-lid` · kitchen-dining

- **How Della uses it:** Each resident gets their own bin in the shared pantry for dry goods. The bins stack, so every person has a defined space.
- **Della's take:** Clear sides settle whose food is whose before anyone has to ask. That's a house conversation I'd rather not referee.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Assumes one bin per resident, per the product copy's framing.

### Rubbermaid Brilliance Food Storage Containers, Set of 5

`rubbermaid-brilliance-food-storage-containers-set-of-5` · kitchen-dining

- **How Della uses it:** I stock these for the shared fridge so residents have airtight containers for leftovers.
- **Della's take:** An airtight seal keeps one person's leftovers from becoming the whole fridge's smell. The Tritan bodies resist sauce stains, so they keep looking clean.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Whether these are house-provided vs. resident-owned is inferred; confirm.

### Brother P-touch Easy-to-Use Label Maker

`brother-p-touch-easy-to-use-label-maker` · kitchen-dining

- **How Della uses it:** I label fridge shelves, pantry bins, and cabinets so every resident knows which space is theirs. The laminated tape holds up to condensation and wipe-downs.
- **Della's take:** Most shared-kitchen disputes are really labeling problems. A clear label settles it before it turns into a house group text.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Tide PODS Laundry Detergent, Original

`tide-pods-laundry-detergent-original` · laundry-linen

- **How Della uses it:** Pods go in the shared laundry room instead of a detergent jug. Residents grab one per load.
- **Della's take:** Pre-measured means no overdosing and no spills to clean up. It keeps a shared laundry room from getting sticky.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Left out the copy's '42 count covers a household for weeks' claim.

### Sterilite 2-Bushel Ultra Laundry Basket

`sterilite-2-bushel-ultra-laundry-basket` · laundry-linen

- **How Della uses it:** This is my turnover basket. Two bushels carries a full bed of linens in one trip instead of three.
- **Della's take:** Rigid plastic outlasts the collapsible fabric baskets, and it stacks away when I'm not using it.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. 'Outlasts collapsible fabric baskets' is a comparison taken from the product copy; confirm Della agrees.

### Lifewit Large Freestanding Laundry Hamper

`lifewit-large-freestanding-laundry-hamper` · laundry-linen

- **How Della uses it:** One goes in a resident's room. The lid keeps the room from smelling like laundry, and the inner bag lifts out to carry to the machine.
- **Della's take:** It's freestanding, so there's nothing to mount on my walls. The lid is the whole reason I'd pick this one.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Product copy says 'shared bedroom'; BNP rents private rooms, so the draft says 'a resident's room'. Consider fixing the product copy too.

### Amazon Basics Foldable Laundry Drying Rack

`amazon-basics-foldable-laundry-drying-rack` · laundry-linen

- **How Della uses it:** It lives folded in the laundry closet. Residents pull it out for things they don't want in the dryer, or when the dryer is busy.
- **Della's take:** When several people share a dryer, a rack takes pressure off the schedule. Air drying also saves the linens a dryer shrinks.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### OxiClean Max Force Laundry Stain Remover Spray

`oxiclean-max-force-laundry-stain-remover-spray` · laundry-linen

- **How Della uses it:** I keep a bottle in the laundry room and one in the turnover kit. Stains on white linens get pre-treated before they go in the wash.
- **Della's take:** Pre-treating is what keeps white linens from turning into rags. A bottle costs a lot less than replacing a set of sheets.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### ZINUS Jackie Loveseat Sofa, Dark Grey

`zinus-jackie-loveseat-sofa-dark-grey` · living-common

- **How Della uses it:** A loveseat fits a co-living common room without crowding it. It assembles without tools, which matters when I'm setting up a room on a deadline.
- **Della's take:** Dark grey hides wear between residents. That's what I want on a piece of furniture everybody in the house uses.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Yaheetech Modern Accent Chair

`yaheetech-modern-accent-chair` · living-common

- **How Della uses it:** It adds a second seat to a common room, or fills a bedroom corner, without the footprint of another sofa. It's 25.5 inches wide.
- **Della's take:** The sherpa photographs warm in listing shots. A room that looks warm in photos is easier to rent.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Product copy doesn't address how sherpa holds up to cleaning or wear; the take sticks to footprint and photos.

### Furinno Simple Design Coffee Table

`furinno-simple-design-coffee-table` · living-common

- **How Della uses it:** It anchors the common room seating. The open shelf underneath gives residents a spot for remotes and mail besides the sofa.
- **Della's take:** The espresso finish hides rings and scuffs. If it does get damaged, it's inexpensive enough to replace and move on.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Furinno Just 3-Tier End Table

`furinno-just-3-tier-end-table` · living-common

- **How Della uses it:** I use it as a nightstand in bedrooms and as a side table in the common room. Three tiers add storage where floor space is tight.
- **Della's take:** Toolless assembly speeds up room setup. It works in so many spots that it's easy to over-order.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### nuLOOM Moroccan Blythe Area Rug

`nuloom-moroccan-blythe-area-rug` · living-common

- **How Della uses it:** The 7x9 goes under the common room seating to anchor the space. It's power-loomed for foot traffic.
- **Della's take:** Everyone in the house walks across a common room rug. I want one built for traffic, in a grey trellis that hides everyday soiling between cleans.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Ottomanson Washable Non-Slip Runner Rug

`ottomanson-washable-non-slip-runner-rug` · living-common

- **How Della uses it:** Runners go in the shared hallways. The 2x7 size fits a narrow corridor, and it goes straight in the washer at turnover.
- **Della's take:** Non-slip backing in a hallway is a safety call as much as a decor one. Machine washable means it's part of normal cleaning, not a separate chore.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Product copy frames non-slip as a 'liability question'; draft softens to 'safety call' to avoid a legal claim.

### Utopia Bedding Throw Pillows, 18 x 18, 2-Pack

`utopia-bedding-throw-pillows-18-x-18-2-pack` · living-common

- **How Della uses it:** Standard 18-inch inserts go on the common room sofa. I swap the covers by season or after a spill and keep the insert.
- **Della's take:** Two per pack styles one sofa. Washing or swapping a cover beats rebuying the pillow underneath.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Bedsure Fleece Throw Blanket

`bedsure-fleece-throw-blanket` · living-common

- **How Della uses it:** A grey fleece throw goes over the arm of the common room sofa. It washes and dries fast at turnover.
- **Della's take:** It's one of the cheapest things that makes a listing photo read as hospitality instead of storage. Grey hides use better than cream or white.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Nearly Natural Artificial Indoor Plant

`nearly-natural-artificial-indoor-plant` · living-common

- **How Della uses it:** It fills an empty or dark corner in the common room. At 48 inches, it shows up in listing photos.
- **Della's take:** A real plant doesn't survive a vacancy or a resident who doesn't water. This one does, and it arrives already potted.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Haus and Hues Framed Neutral Wall Art Set

`haus-and-hues-framed-neutral-wall-art-set` · living-common

- **How Della uses it:** The set of four covers a common room wall in one order. The prints arrive framed and ready to hang.
- **Della's take:** Neutral botanicals work for any resident's taste, and there's no separate framing bill.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### NeuType 47x22 Modern Rectangular Wall Mirror, Black Frame

`neutype-47x22-rectangular-wall-mirror-black-frame` · living-common

- **How Della uses it:** It mounts on the wall by the entry for a last check on the way out. No floor space given up in a tight entry.
- **Della's take:** At 47x22 it's a full-length check that stays out of the way. That's what a shared entry needs.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Product copy says the frame 'matches the bedroom mirror'; left out because it's unclear which mirror that refers to.

### Clear Travel Toiletry Bags, Multi-Pack

`clear-travel-toiletry-bags-multi-pack` · operations-welcome

- **How Della uses it:** I build welcome kits in these, assembly-line style, before a resident moves in. Clear bags show at a glance what needs restocking.
- **Della's take:** The waterproof body holds up on a bathroom shelf. Sixteen in a pack means I'm not reordering every time a room turns.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Assumes Della gives welcome kits to incoming residents; confirm. Left out copy's 'for months' duration.

### AdirOffice Steel Key Cabinet with Combination Lock

`adiroffice-steel-key-cabinet-with-combination-lock` · operations-welcome

- **How Della uses it:** Spare keys for every room live in one steel cabinet. When I need a key, I know exactly where it is.
- **Della's take:** A combination lock means there's no master key to lose. Keys kept in one place are keys I can actually account for.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Don't photograph the open cabinet or combination for marketing (property access details).

### Sterilite Clear Storage Box with Latching Lid

`sterilite-clear-storage-box-with-latching-lid` · operations-welcome

- **How Della uses it:** Back-of-house supplies go in these, stacked. The latching lid holds when I move supplies between units.
- **Della's take:** Clear sides mean I'm not opening four boxes to find one thing. They stack and they stay shut.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### No Smoking / Property Rules Aluminum Sign

`no-smoking-property-rules-aluminum-sign` · operations-welcome

- **How Della uses it:** It goes at the entry so the house rules are the first thing a resident sees. Metal holds up where the entry is open to weather.
- **Della's take:** Posted rules carry more weight than a lease clause nobody read. I'd rather state it on the wall before there's a dispute.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Omitted the copy's claim that posted rules strengthen a deposit claim; that's a legal assertion and should get review in the product copy too.

### Wi-Fi / Property Information Vinyl Decal Labels

`wi-fi-property-information-vinyl-decal-labels` · operations-welcome

- **How Della uses it:** Decals go in the bedrooms and common area with the network name and password. Residents find it on the wall instead of texting me.
- **Della's take:** The Wi-Fi password is one of the most common questions residents ask. Putting it on the wall answers it before it's asked.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Softened copy's 'single most common message' to 'one of the most common'. Also: keep decals with real passwords out of listing photos.

### GORILLA GRIP Heavy Duty Indoor/Outdoor Doormat

`gorilla-grip-heavy-duty-indoor-outdoor-doormat` · operations-welcome

- **How Della uses it:** It sits at the front entry to catch grit before it gets tracked through the house. 35x23 covers a standard doorway.
- **Della's take:** Dirt it traps at the door is dirt I'm not paying to clean off the floors. The indoor-outdoor build handles Georgia weather.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy.

### Smart Lockbox (4-Digit Combo)

`property-smart-lockbox` · safety-smart-home

- **How Della uses it:** A lockbox holds the backup key at each house [confirm: every BNP house has one]. The code rotates, so there's never a key handoff.
- **Della's take:** It holds up to Southeast humidity and mounts to a doorknob or a permanent bracket. It's the unglamorous piece that makes self check-in work.
- _Reviewer notes:_ Product name is generic with no brand/model; confirm the linked product is the one Della actually uses. 'Survives humidity without rust' comes from existing copy.

### First Alert Combination Smoke & Carbon Monoxide Alarm, SMICO100-AC

`first-alert-combination-smoke-carbon-monoxide-alarm-smico100-ac` · safety-smart-home

- **How Della uses it:** One hardwired unit handles smoke and carbon monoxide, so each install covers both.
- **Della's take:** It stays powered without chasing battery swaps between residents. Safety devices are the last place I cut corners.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Left out copy's 'rental compliance baseline' line; alarm requirements vary by jurisdiction, flag for legal. Hardwired install needs existing wiring.

### First Alert HOME1 Rechargeable Home Fire Extinguisher, ABC

`first-alert-home1-rechargeable-home-fire-extinguisher-abc` · safety-smart-home

- **How Della uses it:** I keep one mounted in the shared kitchen where residents can see it.
- **Della's take:** ABC-rated covers the three fire types you find in a home, and it's rechargeable instead of thrown out after one use.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Kitchen placement inferred. Omitted copy's 'required by most short-term rental permits' claim; BNP is mid-term and rules vary, flag legal.

### First Alert Fire Extinguisher Mounting Bracket

`first-alert-fire-extinguisher-mounting-bracket` · safety-smart-home

- **How Della uses it:** The bracket puts the extinguisher on the wall where anyone can see it and reach it, not in a cupboard.
- **Della's take:** An extinguisher nobody can find doesn't help anyone. Mounted, it's easy to check at turnover.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Omitted copy's claim about what inspectors check.

### First Aid Only 298-Piece All-Purpose First Aid Kit

`first-aid-only-298-piece-all-purpose-first-aid-kit` · safety-smart-home

- **How Della uses it:** It sits in a kitchen or utility cupboard for the small cuts and scrapes residents would rather handle themselves.
- **Della's take:** 298 pieces covers several minor incidents before it needs restocking. It gives residents what they need for the small stuff.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Take doesn't claim fewer calls to Della; add only if she confirms.

### Schlage FE575 Electronic Keypad Lever Lock, Satin Chrome

`schlage-fe575-electronic-keypad-lever-lock-satin-chrome` · safety-smart-home

- **How Della uses it:** This is the keypad lever lock on our interior bedroom doors. Each room has a code, so there's no key handoff between residents.
- **Della's take:** The lever handle suits bedroom doors, and keypad entry takes keys out of the equation. It's our standard interior lock [confirm: still on all BNP interior doors].
- _Reviewer notes:_ 'BNP's standard across the portfolio' is from existing copy. Per-room code setup inferred.

### Wyze Auto-Lock Bolt, Fingerprint Unlock with Keypad

`wyze-auto-lock-bolt-fingerprint-keypad` · safety-smart-home

- **How Della uses it:** It replaces a standard deadbolt without changing the exterior hardware. Each resident gets their own code, and I revoke it the day they move out.
- **Della's take:** Revoking a code at move-out means there's no key to chase down. Fingerprint entry covers anyone who won't remember a code.
- _Reviewer notes:_ Which door it's on (front vs. room) isn't stated; draft doesn't specify.

### Nooie Cam 360 Indoor Security Camera

`nooie-cam-360-indoor-security-camera` · safety-smart-home

- **How Della uses it:** One camera covers a common room, and I use the two-way audio for deliveries and access questions. Common areas only. Never inside a private room.
- **Della's take:** At 360 degrees, one camera covers the whole shared space. Cameras belong where everyone already shares the room, not where anyone sleeps.
- _Reviewer notes:_ Flag legal/privacy review: resident disclosure, lease language, and audio recording. Also, the live product copy bullet contains an em dash.

### Amazon eero 6+ Mesh Wi-Fi System, 3-Pack

`amazon-eero-6-mesh-wi-fi-system-3-pack` · safety-smart-home

- **How Della uses it:** Three nodes spread across the house so the back bedroom gets the same Wi-Fi as the common room.
- **Della's take:** Residents notice Wi-Fi first when it's bad. Mesh removes the dead zones a single router leaves.
- _Reviewer notes:_ No 'Della Uses This' badge, so confirm she actually uses this item before publishing first-person copy. Omitted copy's unsourced claims ('amenity residents complain about most', 'most-cited in co-living reviews'); source or cut them from product copy too.

## Vehicles (Alex)

### OBD-II Bluetooth Scanner

`auto-obd2-reader` · vehicle-maintenance

- **How Alex uses it:** When a renter texts me that the check-engine light is on, I pair this with my phone and read the code before I decide anything. It tells me whether I can clear it or the car needs a shop visit.
- **Alex's take:** It earns its spot because a code read costs nothing and a guess costs a shop trip. It works on iOS and Android, so it fits whatever phone I have on me.
- _Reviewer notes:_ Renter-text scenario is inferred from the fleet context, not stated in the copy. Site bullet 'Saves a shop trip on most P0420 false positives' is a specific existing claim; confirm before echoing it (not repeated in the draft).

### Front + Rear Dashcam (4K)

`auto-dashcam-front-rear` · vehicle-safety

- **How Alex uses it:** I run a front and rear dashcam in the fleet so there is date-stamped video if a renter and I disagree about damage. Parking mode covers the lot dings that happen when nobody is in the car. [confirm: which vehicles have this installed]
- **Alex's take:** On a peer-to-peer platform, a damage dispute comes down to proof. Date-stamped footage, with the G-sensor locking clips on impact, is the most direct proof I can hand over.
- _Reviewer notes:_ Product badge is 'Della Uses This' but this is a Vehicles item endorsed by Alex only; confirm the badge is still accurate or change it. Existing site claims 'every Turo car should have' and 'Resolves disputes in 30 seconds' were not echoed; confirm before keeping them in the body.

### Turnover Detail Kit

`auto-detail-kit` · vehicle-turnover

- **How Alex uses it:** This kit rides in the trunk so I can wipe down paint, glass, and the interior between rentals without going back to the garage. It fits in a small caddy.
- **Alex's take:** Turnovers go faster when the supplies are already in the car. The interior cleaner is safe on leather, so I don't need a separate bottle for every surface.
- _Reviewer notes:_ Body says 'What we put in every car's trunk'; confirm this is true for every vehicle before echoing it. Draft says 'the trunk' without claiming every car.

## Back Office (Della and Alex)

### Unreasonable Hospitality — Will Guidara

`back-office-unreasonable-hospitality` · books

- **How Della uses it:** This book is the framework behind the hospitality-grade design module in Room Rental Riches. I point students to it when we get to that part of the course.
- **Della's take:** It's the book I recommend most. It explains why going past what a guest expects is a business decision, not a nice extra.
- **How Alex uses it:** I listen to the audio version in the car between vehicles and properties. [confirm: is this required reading for every BNHG hire]
- **Alex's take:** The audio version is excellent for drive time. I come back to it when I want the whole team thinking about hospitality the same way.
- _Reviewer notes:_ Existing site claims need confirming: 'Required reading for every BNHG hire' and 'the framework behind Module 6'. Module numbering may be stale since the course moved to the Module 0 to 6 Blueprint spine, so the draft names the module topic, not the number. Della's take paraphrases the book's thesis as general knowledge, not from the product copy; confirm she agrees with that framing. Product name contains an em dash; the name field here uses a hyphen, keep the site's name as-is if preferred.

### Weekly Operator Planner

`back-office-planner` · paper

- **How Della uses it:** I plan the week on paper every Sunday night, one spread for every property. [confirm: number of properties, site copy says six]
- **Della's take:** Paper, not Notion. One weekly spread and a thirteen-week quarter layout, with no monthly pages I'd skip anyway.
- **How Alex uses it:** I use the thirteen-week quarter layout to line up fleet and property priorities for the quarter, then work the weekly spread from there.
- **Alex's take:** It lays flat on the desk without breaking the spine, and it keeps the week to one page. That is the whole appeal.
- _Reviewer notes:_ Existing site claim 'the same weekly cadence Della runs every Sunday night across all six properties' needs confirming (both the Sunday habit and the property count). Alex's use of the quarter layout for fleet planning is inferred, not stated; confirm he actually uses a paper planner.

### QuickBooks Self-Employed

`back-office-quickbooks` · software

- **How Della uses it:** I use it to keep the property books in one place and see the quarterly tax estimate before it's due. [confirm: which Be Nice entities are actually on this product]
- **Della's take:** The quarterly estimate is built in, so taxes don't sneak up on me. Mileage logs from phone GPS mean I don't reconstruct trips from memory.
- **How Alex uses it:** Auto-mileage tracking runs on my phone GPS while I move between vehicles and properties, so the log builds itself.
- **Alex's take:** For an operation that drives this much, automatic mileage tracking is the feature that matters. The built-in quarterly tax estimate is a useful check, not a replacement for our CPA.
- _Reviewer notes:_ TAX/LEGAL FLAG: mileage and quarterly-estimate language touches tax; have the CPA review. Existing site claims need confirming: 'the bookkeeping setup we use across every Be Nice entity' and 'Mileage tracking alone covers the subscription cost' (the savings claim was not echoed). QuickBooks Self-Employed is built for sole proprietors, so confirm it is really what multiple LLCs use, and confirm Intuit still sells it under this name. Bullet mentions an affiliate code but network is 'direct'; reconcile the network field and add an affiliate disclosure if a code is used. The 'CPA' mention in Alex's take assumes a CPA relationship; confirm or cut.

