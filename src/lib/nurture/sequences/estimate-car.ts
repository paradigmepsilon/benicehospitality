/**
 * estimate_car: five emails for anyone who ran the Car Earnings Estimator.
 * Structurally modeled on crr_calculator, but built around the estimate
 * itself rather than the full profitability calculator: the range and why it
 * is a range, gross versus net, what handing the car to BNHG actually costs
 * versus running it yourself, the DIY path, then the apply CTA. Signed by
 * Alex.
 */

import { getCrrFromAddress } from "@/lib/car-rental-riches";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const ESTIMATOR = "/resources/car-earnings-estimator";
const FULL_CALC = "/resources/vehicle-profitability-calculator";
const APPLY = "/management/apply?asset=car";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

function inMarket(ctx: NurtureContext): string {
  return ctx.metro ? `in ${ctx.metro}` : "in your market";
}

export const estimateCar: NurtureSequence = {
  key: "estimate_car",
  from: getCrrFromAddress,
  steps: [
    {
      delayHours: 24,
      subject: "Why your estimate came back as a range",
      preheader: "Days available and condition both move it.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Days available and condition both move it.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p(`The estimator gave you a range on purpose. A car available every day of the month, in excellent condition, sits at the top of that range. A car available three days a week, showing some wear, sits at the bottom. Your car lands somewhere on that line, and the market ${inMarket(ctx)} sets where the line itself sits.`)}
            ${callout("If you entered placeholder numbers,", "run it again with the real ones. Days available and condition are the two inputs that move your range the most.")}
            ${p(`${textLink(`${ctx.baseUrl}${ESTIMATOR}`, "Run your car through it again")}.`)}
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
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("The range the estimator showed you is gross: what the car brings in before anything comes out. The platform's share, cleaning between renters, a maintenance reserve, insurance, and depreciation all come out of that gross before any of it is money in your pocket.")}
            ${p("If a management fee applies to your estimate, you also saw a net range. That is the number worth planning around, not the gross one.")}
            ${p(`For the full picture on one specific car, the profitability calculator runs the whole waterfall three ways: marketplace, weekly, and direct. ${textLink(`${ctx.baseUrl}${FULL_CALC}`, "Run the full numbers")}.`)}
          `,
        }),
    },
    {
      delayHours: 120,
      subject: "What it costs to have someone else run this",
      preheader: "The trade is time for a fee. Here is how to weigh it.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The trade is time for a fee. Here is how to weigh it.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Running a rental car yourself means the listing, the pricing, the turnover between renters, every claim, every maintenance call, and every renter message, every week, for as long as you own the car. Nobody sends you an invoice for that time, but it is not free.")}
            ${p("BNHG management takes a percentage of gross in exchange for carrying all of that. The exact number depends on the car and the market, so we quote it on the call rather than guess at it over email.")}
            ${callout("The honest question:", "is your time worth more spent somewhere else? If yes, the fee is a good trade. If you have the time and want the control, keeping it yourself is a perfectly good answer too.")}
          `,
        }),
    },
    {
      delayHours: 168,
      subject: "If you would rather run it yourself",
      preheader: "The same fleet playbook, written down.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The same fleet playbook, written down.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Management is not the only answer, and I would rather say that now than after you have applied.")}
            ${p("If you have the time and want the control, our training is the same underwriting and operating method Be Nice Autos runs on, written down so you can run it yourself. Plenty of owners take that route and never hire anyone.")}
            ${p(`${textLink(`${ctx.baseUrl}/training`, "See the training")}.`)}
          `,
        }),
    },
    {
      delayHours: 216,
      subject: "Ready to hand the car off?",
      preheader: "A short application, then a call. Nothing signed before that.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "A short application, then a call. Nothing signed before that.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("You have seen the range, what net looks like once the real costs are counted, and the training if you would rather run it yourself.")}
            ${p("If you would rather BNHG run it, the next step is a short application, not a contract. We review the car and the market, then get on a call.")}
            ${primaryButton(`${ctx.baseUrl}${APPLY}`, "Apply for management")}
            ${p("This is the last scheduled email. Reply to any of them and it comes to me.")}
          `,
        }),
    },
  ],
};
