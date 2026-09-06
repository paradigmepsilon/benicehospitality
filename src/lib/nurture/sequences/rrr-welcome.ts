/**
 * rrr_welcome: four emails over eight days for anyone who raised a hand on the
 * Room Rental Riches side (a co-living tool, the RRR waitlist, the newsletter).
 * Signed by Della. Ends on the Blueprint at $32 and the course waitlist.
 */

import { BLUEPRINT, getBlueprintFromAddress } from "@/lib/blueprint";
import { RRR_PATHS } from "@/lib/room-rental-riches";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const CALC = "/resources/co-living-viability-calculator";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

export const rrrWelcome: NurtureSequence = {
  key: "rrr_welcome",
  from: getBlueprintFromAddress,
  steps: [
    {
      delayHours: 0,
      subject: "The room, not the whole place",
      preheader: "Why I rent by the room, and the one number to know before you do.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Why I rent by the room, and the one number to know before you do.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("I run furnished rooms in the Southeast. Each room has its own lease, its own price, and its own resident. The house is the building. The room is the product.")}
            ${p("That one change is the whole business. A three-bedroom house rents once as a house. It rents three times as rooms, to three people who each want something a whole apartment would not give them: a shorter term, a lower deposit, a furnished place they can walk into with a suitcase.")}
            ${callout("The number to know first:", "what one room rents for in your market, on its own, furnished, for thirty days or more. Not the house. The room.")}
            ${p(`The fastest way to get that number for a real address is the viability calculator. It takes a few minutes and tells you whether an address is worth a second look before you spend a dollar. ${textLink(`${ctx.baseUrl}${CALC}`, "Run an address through it")}.`)}
            ${p("Over the next week I will send you three short emails: how to read the verdict, how I actually started, and where the whole system is written down. No pitch until the last one, and even then it is a $32 book.")}
          `,
        }),
    },
    {
      delayHours: 48,
      subject: "Run one address through the calculator",
      preheader: "What the verdict means and what to enter to get a real one.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "What the verdict means and what to enter to get a real one.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("If you have not run an address yet, pick one you could actually buy or lease. Not a dream house. A boring one on a street you know.")}
            ${p("Enter the real numbers you can find in ten minutes: the rent or mortgage, the room count, and what furnished rooms near it are listed for right now. Guess the rest conservatively. A verdict built on hopeful inputs is worse than no verdict.")}
            ${callout("How to read it:", "a strong result means the rooms cover the house with room to spare. A weak one usually means the room rate is too low for the cost of the building, and no amount of decorating fixes that. Change the address before you change the assumptions.")}
            ${p(`Run two or three addresses and you will start to see the pattern in your own market. ${textLink(`${ctx.baseUrl}${CALC}`, "Open the calculator")}.`)}
            ${primaryButton(`${ctx.baseUrl}${CALC}`, "Run an address")}
          `,
        }),
    },
    {
      delayHours: 120,
      subject: "How I actually started",
      preheader: "The mistake most people make first, and what I did instead.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The mistake most people make first, and what I did instead.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("The most common first move I see is furnishing. Someone gets excited, buys beds and a couch, lists the rooms, and then finds out what the rooms are worth. That is backwards.")}
            ${p("I underwrote first. I knew what a room would rent for, what the house cost me every month, and how many rooms had to be full for the math to hold, before I bought a single mattress. Then I set the business up so it could not be taken apart: the entity, the lease, the house rules, the insurance conversation.")}
            ${p("Then I furnished for the residents I wanted, not for my taste. Travel nurses and relocating professionals want a clean, quiet, working room. They do not need a mood board.")}
            ${callout("If you take one thing from this email:", "the order matters more than the effort. Numbers, then structure, then furniture, then listings.")}
            ${p("Next email: where all of this is written down, start to finish, so you do not have to piece it together from a dozen videos.")}
          `,
        }),
    },
    {
      delayHours: 192,
      subject: "The whole system, written down",
      preheader: `Room Rental Riches: The Blueprint, $${BLUEPRINT.priceUsd}. And the course, when it opens.`,
      html: (ctx) =>
        nurtureLayout({
          preheader: `Room Rental Riches: The Blueprint, $${BLUEPRINT.priceUsd}. And the course, when it opens.`,
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p(`Everything in the last three emails comes from one place: <strong>Room Rental Riches: The Blueprint</strong>. It is the by-the-room system written down, from picking a market you can defend with numbers to holding your ratings without living in your inbox. PDF and ePub, $${BLUEPRINT.priceUsd}, and it comes with your account on the Nice Host Network.`)}
            ${primaryButton(`${ctx.baseUrl}${BLUEPRINT.path}`, `Get the Blueprint, $${BLUEPRINT.priceUsd}`)}
            ${p(`If you would rather be taught than read, the full course opens soon. Founding pricing holds for the first hundred students, and the waitlist is how you lock it. ${textLink(`${ctx.baseUrl}${RRR_PATHS.hub}`, "See the course and join the waitlist")}.`)}
            ${p("Either way, thank you for reading this far. Reply to any of these emails and it comes to me.")}
          `,
        }),
    },
  ],
};
