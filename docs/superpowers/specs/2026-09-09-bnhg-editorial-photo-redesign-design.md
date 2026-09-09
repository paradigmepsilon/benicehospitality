# BNHG marketing site redesign: editorial photo layout

Date: 2026-09-09
Company: bnhg
Status: implemented on the working tree, uncommitted, not deployed
Session: non-interactive. The approval gate the brainstorming skill requires could
not be run, so every decision below is recorded as an explicit assumption for
Alex to accept or reverse. Nothing is committed and nothing is deployed.

## Brief

Redesign the BNHG website around three Pinterest references so the site flows as
one cohesive, image-heavy design.

The three pins, resolved and viewed:

1. **Yoga studio landing page** (pin 1112037333007683928). Full-bleed photo hero
   with a floating glass pill nav, a glass rating card over the photo, rounded
   photo cards with the title on a bottom gradient, a full-bleed photo CTA band,
   team cards, an FAQ beside a photo, and a dark footer with an atmospheric photo
   and an inline subscribe field.
2. **"Mafia" game page** (pin 1107322627157743642). Monochrome editorial: a giant
   typographic hero with the subject overlapping the type, a dark four-column
   feature strip with photo backgrounds, and a big split "story" block.
3. **Environmental nonprofit page** (pin 172473860726396780). Soft palette, a
   framed rounded hero panel with floating mini cards on the right, stat tiles,
   three tall photo cards with an icon and title on the image, a mixed
   photo-and-text initiative grid, and a card newsletter.

What the three share, and what this design takes from them: large rounded photo
panels, glass surfaces floating over photography, pill buttons with a round arrow
disc, photo cards that carry their title on the image, one full-bleed photo CTA
before the footer, and a footer that keeps the photography going.

## Constraints kept

- Brand palette is locked (`globals.css` calls it out). Deep teal `#1A4D4F`, warm
  gold `#B08D57`, cream `#FAF8F3`, charcoal `#2C3E50`, near-black `#1a1a1a`.
  No new hues. Playfair Display for display, DM Sans for body.
- No invented numbers. `OPERATING_PROOF` stays empty; the proof band renders
  nothing until real figures exist. No ratings, no "26k trusted", no case-study
  metrics.
- Positioning copy from the 2026-09-07 repositioning stays: "Sharing economy
  asset management for the Southeast. Learn to run it, or let us run it." The
  ladder's transparency line now reads "...If you would rather not, we can do it
  for you." (Alex's wording, 2026-09-09) in both places it appears.
- Every image is a local file already in `public/images`. No new stock, no
  Unsplash on the home page.
- Existing routes, nav tree, booking sources, env gating (owner portal, estimator
  flag, fee model) are unchanged.

## Scope

**In:** global chrome (header, footer, buttons), a small shared kit of photo
surfaces, the home page rebuilt end to end, and the hero and closing CTA of the
primary surfaces (Resources, Training, Management overview, both management
offer pages, About, Insights, Contact) moved onto the same kit so the site reads
as one design. The management overview also reuses the home page's photo offer
cards and drops its curved dividers.

**Out:** inner pages under `/courses`, `/resources/*` tools, `/books`, ClaimProof
(live Stripe), auth, account, admin. They inherit the new header, footer, and
pill buttons and are otherwise untouched.

## Token additions (`globals.css`)

```
--radius-panel: 2rem      framed hero and CTA panels
--radius-card:  1.5rem    photo cards, glass cards
```

Glass surface recipe, used everywhere a card floats on a photo:
`bg-white/80 backdrop-blur-xl border border-white/60` on light photos,
`bg-near-black/55 backdrop-blur-xl border border-white/15` on dark ones.

## Components

### Button (`ui/Button.tsx`)
Pill shape (`rounded-full`) site-wide. New `arrow` prop renders the round disc
with an arrow that all three pins use; the disc inverts the button's colours.
Variants and sizes unchanged so the 24 existing call sites keep working.

### Header (`layout/Header.tsx`)
Floating glass bar with 10px corners, inset from the viewport, logo left, nav centre, login pill
right. Same auth swap-in, dropdown, and mobile sheet logic. On scroll the pill
gains a shadow; the logo no longer swaps to the mark.

### Footer (`layout/Footer.tsx`)
Opens on a photo band (Atlanta neighbourhood at golden hour) that carries the
closing line and the newsletter as a glass card, then the link columns on
near-black. `HomeNewsletter` becomes a compact inline form with no section
wrapper so the footer owns the layout.

### PhotoCard (`ui/PhotoCard.tsx`)
Rounded photo with a bottom gradient, title and body on the image, optional
link. Aspect passed in. Used for the three doors, the founders, and insights.

### PhotoHero (`sections/shared/PhotoHero.tsx`)
The framed hero panel. Cream page, rounded panel inset by the page gutter, photo
fills it, scrim from the left, eyebrow, headline, lede, up to two CTAs, and an
optional right-hand slot for floating cards. Used by Resources, Training,
Management, About, Insights. The home hero is its own component because it
carries the door cards and the state chips.

### PhotoCTA (`sections/shared/PhotoCTA.tsx`)
The full-bleed rounded photo band before the footer. Headline, one line, primary
and secondary CTA. `PageCTA` (used only by /faq) is left as it was.

## Home page, section by section

1. **Hero.** Framed panel, photo of Della and Alex with the Atlanta skyline.
   Headline, lede, and one CTA bottom-left; the photograph carries the right.
   One page-load rise sequence. (Alex's 2026-09-09 revision removed the glass
   door cards and the state chips that the first cut placed here.)
2. **Three ways in.** Heading "Learn it, train for it, or hand it off." and the
   transparency line. Three tall photo cards titled "Learn it", "Train for it",
   "Hand it off", numbered 1 to 3 because the ladder is a sequence. Replaces
   both `ThreeDoors` and `LadderSection`, which said the same thing twice.
3. **Story.** Dark split block. Left: the operator origin statement in large
   Playfair. Right: Della at her desk with the laptop and notebook, matching the
   "systems written down" copy. From pin 2.
4. **What we manage.** Two wide photo cards, Fleet and Co-living, each with the
   promise and four items from `MANAGEMENT_OFFERS.handles` and a link to the
   offer page. Data comes from the constants module, not retyped.
5. **Founders.** Two photo cards with name and role on the image, linking to
   `/alex` and `/della`.
6. **Common questions.** Photo left, five questions right in native `<details>`
   accordions. Answers are lifted from existing management copy (what the owner
   keeps, service area, how applying works, how fees are structured, whether the
   training requires management), so nothing new is claimed.
7. **Latest insights.** Three most recent published posts from `blog_posts`,
   rendered as photo cards. Wrapped in try/catch and rendered only when the
   query returns rows; the page stays static-safe with the DB stub.
The home page has no closing "Check your fit" band (removed at Alex's request
on 2026-09-09); the footer's photo band closes the page.

**Section breaks.** Every home section opens with `SectionIntro`: the section's
name on a hairline rule, then the heading, with the supporting line or action
to the right. Grounds alternate white and cream (hero cream, doors white, story
cream with the dark panel, management white, founders cream, questions white,
insights cream, footer near-black) and every section carries the same
`py-20 md:py-28` rhythm, so each shift in message is marked three ways at once.

**Dividers, site-wide (2026-09-09, third revision).** The curved `SectionDivider`
is now tall and carries a warm-gold line along the curve by default, and one
sits between every section on every marketing page. `PhotoHero` draws the
divider into the section that follows it (`dividerTo`, default cream) and
`PhotoCTA` draws the one before it (`dividerFrom`), so the framed panels never
need a page-level divider. Same-colour pairs (cream to cream) draw the gold
curve alone. The Host's Edge and ClaimProof pages are left as they were.

**Spacing, site-wide.** Section padding was reduced one step across every
marketing page and shared section (for example `py-16 md:py-24` became
`py-10 md:py-14`), applied only inside section tags so cards and inner blocks
kept their own spacing. Hero top padding that clears the floating header is
unchanged.

**Management overview.** Hero carries one CTA, "Check your fit". The six
onboarding steps render as `OnboardingTimeline`: a dark rounded panel with the
steps on a gold line, horizontal on wide screens and vertical on narrow ones.
The same panel replaces the step grid on both offer pages. The page has no
closing photo band. "Across the Southeast" reads "across the Southeast U.S."
here, in the JSON-LD descriptions, and in Della's operator blurb.

## Imagery map (all local)

| Slot | File |
|---|---|
| Home hero | `Website Images/image2.png` (founders, Atlanta skyline) |
| Door: Resources | `Website Images/hf_20260512_145736...png` (operator at laptop) |
| Door: Training | `Website Images/course-masterclass-cohort-v2.png` |
| Door: Management | `Website Images/crr-collage-01-keys-handoff.png` |
| Story | `Website Images/Della Behind Desk.png` |
| Fleet card | `Website Images/image5.png` (vehicles, skyline) |
| Co-living card | `Website Images/image4.png` (co-living interior) |
| Founders | `Website Images/Lex.png`, `Website Images/Dee.png` |
| FAQ photo | `Website Images/hf_20260524_001332...png` (living room) |
| Closing CTA (management, training, offer pages only) | see below. Note: `hero-banner.png` is the logo lockup, not a photo. |
| Footer band | `Website Images/Golden hour Atlanta Neighborhood.png` |
| Resources hero | `Website Images/Workspace Nook.png` |
| Training hero | `Website Images/course-operator-della-v1.webp` |
| Management hero | `Website Images/Della At Hutchens.png` |
| Fleet offer hero / CTA | `Website Images/Alex Turo Shot.png` / `Website Images/image5.png` |
| Co-living offer hero / CTA | `Website Images/hf_20260528_162140...png` / `Website Images/hf_20260312_143806...jpeg` |
| Contact hero | `Website Images/alex in hotel lobby.png` |
| About hero | `Website Images/hf_20260523_234948...png` (founders) |
| Insights hero | `Website Images/hf_20260510_014447...png` (hotel interior) |

## Motion

One orchestrated hero entrance on the home page. Section-level fade-ups are
removed from the home. Hover on photo cards is a slow 1.03 scale on the image
only. `prefers-reduced-motion` disables both.

## Verification plan

- `npx tsc --noEmit` and `npm run lint` clean.
- `next build` was not run: a dev server owned by another session held the
  `.next` lock. `tsc --noEmit`, eslint on every touched file, and `npm test`
  (57 passing) ran clean instead.
- Dev server screenshots of `/`, `/management`, `/training`, `/resources`,
  `/about`, `/insights` at 1440 and 390 widths, reviewed by eye.

## Open decisions for Alex

- Whether the story block copy ("We got tired of running our portfolios on duct
  tape") should stay the origin line or be replaced with something newer.
- Whether the home FAQ answers, lifted from the management pages, are the five
  he wants asked first.
- Commit and deploy. Neither is done.
