/**
 * crr_calculator: Sequence C from the CRR funnel docs, for anyone who unlocked
 * an Autos tool (the Vehicle Profitability Calculator first among them).
 * C1 is the tool itself; these are C2 to C5. Signed by Alex.
 */

import { CRR, getCrrFromAddress } from "@/lib/car-rental-riches";
import { CRR_BLUEPRINT } from "@/lib/crr-blueprint";
import { CRR_FREE_EBOOK } from "@/lib/crr-free-ebook";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const CALC = "/turo-calculator";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

function hasCars(ctx: NurtureContext): boolean {
  return !!ctx.carsToday && ctx.carsToday !== "0";
}

export const crrCalculator: NurtureSequence = {
  key: "crr_calculator",
  from: getCrrFromAddress,
  steps: [
    {
      delayHours: 24,
      subject: "Why your number is lower than the YouTube guys say",
      preheader: "Gross versus net, and where the difference goes.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Gross versus net, and where the difference goes.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("If the calculator gave you a smaller number than you expected, it is doing its job. The numbers you have seen elsewhere are almost always gross: before the platform's share, before depreciation, before insurance, cleaning, tires, and your time.")}
            ${p("The calculator is net. It subtracts the platform share for the earnings plan you picked, depreciation on the car you entered, and every operating line. What is left is what the business pays you. That is the only number worth planning around.")}
            ${callout("A useful habit:", "when a number sounds good, ask whether the car got paid first. If nobody can say, it is gross.")}
            ${p(`If you want to see the same car on a different earnings plan, change the plan and run it again. ${textLink(`${ctx.baseUrl}${CALC}`, "Back to the calculator")}.`)}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "Run it three ways",
      preheader: "Marketplace, weekly, direct. Same car, three verdicts.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Marketplace, weekly, direct. Same car, three verdicts.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("The calculator has three columns for a reason. The same car rented by the day on the marketplace, by the week to a gig driver, or direct on your own terms is three different businesses with three different verdicts.")}
            ${p("Two things to do on your next run. First, fill all three columns for the same car and read the side-by-side table. Second, replace the insurance placeholder with a real quote. That one line moves the verdict more than any other, and a guess there is not underwriting.")}
            ${
              hasCars(ctx)
                ? p("You have a car already, so the question is which job it should have. Run it in its current channel first, then in the other two. If a different column wins, that is the cheapest pivot you will ever make.")
                : p("You are underwriting a car you do not own yet, which is exactly the right time. Run three candidate cars, not one. The spread between them is the lesson.")
            }
            ${primaryButton(`${ctx.baseUrl}${CALC}`, "Run it three ways")}
          `,
        }),
    },
    {
      delayHours: 120,
      subject: "What Be Nice Autos actually is",
      preheader: "A fleet that rents mostly by the week. And what the course is not.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "A fleet that rents mostly by the week. And what the course is not.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Be Nice Autos is the fleet I run in the Atlanta area. It rents mostly by the week to gig and rideshare drivers, uses the marketplace for discovery, and builds direct customers car by car. It is a business with a P&amp;L, not a side quest.")}
            ${p("That is the lens for everything I teach. So here is what Car Rental Riches is not: it is not passive, it is not a way to get a free car with business credit, and it is not a promise about what you will earn. It is the underwriting math, the claims defense, and the direct-booking system, taught by someone who has to make them work every week.")}
            ${callout("If that is the course you want,", "the next email has the details, the price, and the guarantee. If it is not, the calculator is yours either way.")}
          `,
        }),
    },
    {
      delayHours: 168,
      subject: "The course, the book, and which one you need",
      preheader: `Car Rental Riches at $${CRR.foundingPriceUsd} founding. The Inside Lane at $${CRR_BLUEPRINT.priceUsd}.`,
      html: (ctx) =>
        nurtureLayout({
          preheader: `Car Rental Riches at $${CRR.foundingPriceUsd} founding. The Inside Lane at $${CRR_BLUEPRINT.priceUsd}.`,
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p(`<strong>${CRR.name}</strong> is twelve modules from the 2026 platform rules through underwriting, acquisition, listing and pricing, operations, claims defense, the money module, scaling, and direct booking as a system. It ships with the tools you have already used. Founding price is $${CRR.foundingPriceUsd}, retail $${CRR.retailPriceUsd}, lifetime access, thirty-day unconditional money-back guarantee. The waitlist locks the founding price. ${textLink(`${ctx.baseUrl}${CRR.path}`, "See the curriculum")}.`)}
            ${p(`<strong>${CRR_BLUEPRINT.name}</strong> is the book: the same system in seventeen chapters, one car to fifty, $${CRR_BLUEPRINT.priceUsd}. If you are not ready for the course, start there. ${textLink(`${ctx.baseUrl}${CRR_BLUEPRINT.path}`, "See the book")}.`)}
            ${p(`And if you want the short version first, <strong>${CRR_FREE_EBOOK.name}</strong> is free: ${textLink(`${ctx.baseUrl}${CRR_FREE_EBOOK.path}`, CRR_FREE_EBOOK.subtitle)}.`)}
            ${primaryButton(`${ctx.baseUrl}${CRR.path}`, "See the course")}
            ${p("That is the last scheduled email. Reply to any of them and it comes to me.")}
          `,
        }),
    },
  ],
};
