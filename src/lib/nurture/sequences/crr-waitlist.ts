/**
 * crr_waitlist: three emails for Car Rental Riches waitlist signups while the
 * presale is closed. Never names a date. Signed by Alex. Turo figures from
 * Car Rental Riches/00_Strategy/turo_platform_facts_2026.md.
 */

import { CRR, getCrrFromAddress } from "@/lib/car-rental-riches";
import { CRR_FREE_EBOOK } from "@/lib/crr-free-ebook";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const CALC = "/turo-calculator";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

export const crrWaitlist: NurtureSequence = {
  key: "crr_waitlist",
  from: getCrrFromAddress,
  steps: [
    {
      delayHours: 0,
      subject: "You're on the list. Here's what changed in 2026",
      preheader: "Three earnings plans, one decision, and why most advice is now stale.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Three earnings plans, one decision, and why most advice is now stale.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p(`You are on the ${CRR.name} list. You will hear from me first when the founding presale opens, and the founding price of $${CRR.foundingPriceUsd} (retail $${CRR.retailPriceUsd}) is yours to lock when it does.`)}
            ${p("While you wait, the single most important thing to know: Turo rewrote its host economics in 2026. The old protection plans became three earnings plans. The host share is 70, 80, or 90 percent of the trip, and the more you keep, the more damage responsibility you carry: $250, $1,500, or $2,750. In pilot markets, bookings made 28 or more days ahead can pay the host up to 100 percent.")}
            ${callout("Why it matters:", "any calculator, video, or course built on the old plans gives you the wrong number. Check the date on everything you read, including mine.")}
            ${p(`Source: Turo's host hub. The course teaches how to choose a plan like an underwriter, not like a gambler. ${textLink(`${ctx.baseUrl}${CRR.path}`, "See the curriculum")}.`)}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "Underwrite a car before you buy it",
      preheader: "The calculator from Module 3, free, three channels side by side.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The calculator from Module 3, free, three channels side by side.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Module 3 of the course is the underwriting method: read your market, score a candidate car, and run it through the Vehicle Profitability Calculator net of the platform share, depreciation, and every operating cost. The calculator is live now and it is free.")}
            ${p("It underwrites the same car three ways, marketplace, weekly gig rental, and direct, with a verdict for each. If you are looking at a car right now, run it before you sign anything.")}
            ${primaryButton(`${ctx.baseUrl}${CALC}`, "Open the calculator")}
          `,
        }),
    },
    {
      delayHours: 168,
      subject: "Twelve things nobody tells you",
      preheader: `${CRR_FREE_EBOOK.name}, free, twelve short chapters.`,
      html: (ctx) =>
        nurtureLayout({
          preheader: `${CRR_FREE_EBOOK.name}, free, twelve short chapters.`,
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p(`Last one from me until the presale opens. <strong>${CRR_FREE_EBOOK.name}</strong> is a free guide: ${CRR_FREE_EBOOK.subtitle.toLowerCase()}. Twelve chapters, one fact and one action each, about ten minutes to read.`)}
            ${p("Chapter one is why the number that brought you here is gross. Chapter seven is why the same car is three different businesses. Chapter twelve is the one most people skip: write your quit criteria before you own anything.")}
            ${primaryButton(`${ctx.baseUrl}${CRR_FREE_EBOOK.path}`, "Get the free guide")}
            ${p("You will hear from me the day the presale opens. Until then, the calculator and the guide are yours.")}
          `,
        }),
    },
  ],
};
