/**
 * estimate_rooms: five emails for anyone who ran the Room Earnings Estimator.
 * Same arc as estimate_car: the range and why it is a range, gross versus
 * net, what handing the rooms to BNHG actually costs versus running them
 * yourself, the DIY path, then the apply CTA. Signed by Della.
 */

import { getBlueprintFromAddress } from "@/lib/blueprint";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const ESTIMATOR = "/resources/room-earnings-estimator";
const FULL_CALC = "/resources/co-living-profit-calculator";
const APPLY = "/management/apply?asset=rooms";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

function inMarket(ctx: NurtureContext): string {
  return ctx.metro ? `in ${ctx.metro}` : "in your market";
}

export const estimateRooms: NurtureSequence = {
  key: "estimate_rooms",
  from: getBlueprintFromAddress,
  steps: [
    {
      delayHours: 24,
      subject: "Why your estimate came back as a range",
      preheader: "Bedroom count and furnished status both move it.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Bedroom count and furnished status both move it.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p(`The rate behind the estimator is quoted per room, so your bedroom count moves the range directly. Whether the rooms are already furnished moves it too, and the market ${inMarket(ctx)} sets where that range sits in the first place.`)}
            ${callout("If you entered a placeholder bedroom count,", "run it again with the real number. It is the input that moves your range the most.")}
            ${p(`${textLink(`${ctx.baseUrl}${ESTIMATOR}`, "Run your property through it again")}.`)}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "The gross number is not the one you keep",
      preheader: "What comes out before it is yours.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "What comes out before it is yours.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("The range the estimator showed you is gross: what the rooms bring in before anything comes out. Turnover between residents, maintenance, screening, and a management fee if one applies all come out of that gross before any of it is money in your pocket.")}
            ${p("If a management fee applies to your estimate, you also saw a net range. That is the number worth planning around, not the gross one.")}
            ${p(`For the full picture, the profit calculator builds a full twelve-month income statement for the property. ${textLink(`${ctx.baseUrl}${FULL_CALC}`, "Run the full numbers")}.`)}
          `,
        }),
    },
    {
      delayHours: 120,
      subject: "What it costs to have someone else run the rooms",
      preheader: "The trade is time for a fee. Here is how to weigh it.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The trade is time for a fee. Here is how to weigh it.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Running rooms yourself means screening every applicant, writing and renewing leases, collecting rent, handling turnover between residents, and taking the occasional call about a house rule nobody is following. Nobody sends you an invoice for that time, but it is not free.")}
            ${p("BNHG management takes a percentage of gross in exchange for carrying all of that. The exact number depends on the property and the market, so we quote it on the call rather than guess at it over email.")}
            ${callout("The honest question:", "is your time worth more spent somewhere else? If yes, the fee is a good trade. If you have the time and want the control, keeping it yourself is a perfectly good answer too.")}
          `,
        }),
    },
    {
      delayHours: 168,
      subject: "If you would rather run the rooms yourself",
      preheader: "The same by-the-room system, written down.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The same by-the-room system, written down.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Management is not the only answer, and I would rather say that now than after you have applied.")}
            ${p("If you have the time and want the control, our training is the by-the-room system I run on my own houses, written down so you can run it yourself. Plenty of owners take that route and never hire anyone.")}
            ${p(`${textLink(`${ctx.baseUrl}/training`, "See the training")}.`)}
          `,
        }),
    },
    {
      delayHours: 216,
      subject: "Ready to hand the rooms off?",
      preheader: "A short application, then a call. Nothing signed before that.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "A short application, then a call. Nothing signed before that.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("You have seen the range, what net looks like once the real costs are counted, and the training if you would rather run it yourself.")}
            ${p("If you would rather BNHG run it, the next step is a short application, not a contract. We review the property and the market, then get on a call.")}
            ${primaryButton(`${ctx.baseUrl}${APPLY}`, "Apply for management")}
            ${p("This is the last scheduled email. Reply to any of them and it comes to me.")}
          `,
        }),
    },
  ],
};
