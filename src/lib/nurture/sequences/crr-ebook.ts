/**
 * crr_ebook: Sequence D from the CRR funnel docs. D1 (delivery) is sent by
 * the request route; these are D2 to D5. Branches on carsToday and metro.
 * Signed by Alex. Every Turo figure comes from
 * Car Rental Riches/00_Strategy/turo_platform_facts_2026.md.
 */

import { CRR, getCrrFromAddress } from "@/lib/car-rental-riches";
import { CRR_BLUEPRINT } from "@/lib/crr-blueprint";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const CALC = "/turo-calculator";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

function hasCars(ctx: NurtureContext): boolean {
  return !!ctx.carsToday && ctx.carsToday !== "0";
}

function isGeorgia(ctx: NurtureContext): boolean {
  const m = (ctx.metro ?? "").toLowerCase();
  return m.includes("atlanta") || m.includes("georgia") || m.includes(", ga");
}

export const crrEbook: NurtureSequence = {
  key: "crr_ebook",
  from: getCrrFromAddress,
  steps: [
    {
      delayHours: 48,
      subject: "The number that brought you here is gross",
      preheader: "Chapter one, expanded. The one question to ask about every earnings figure.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Chapter one, expanded. The one question to ask about every earnings figure.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Chapter one of the guide is short on purpose. Here is the long version.")}
            ${p("Almost every earnings number you will see about renting out a car is gross. Turo's own published average for a car on the platform is a gross figure: before the host share, before depreciation, before insurance, cleaning, tires, and the weekend you spend at the detailer. Gross is not a lie. It is just not your money.")}
            ${callout("The one question:", "\"Is that before or after the car got paid?\" Ask it of every number, including mine. If the person cannot answer, the number is gross.")}
            ${p("The guide's chapter seven shows the same car three ways. Chapter two shows where the number goes. The next email walks through both with the calculator open.")}
          `,
        }),
    },
    {
      delayHours: 96,
      subject: "The same car is three different businesses",
      preheader: "Chapter seven with the numbers. Marketplace, weekly, direct.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Chapter seven with the numbers. Marketplace, weekly, direct.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Put one economy sedan into three channels and you get three different businesses. On the marketplace it rents by the day to travelers and the platform takes its share. Rented by the week to a gig driver, it turns less often and earns steadier. Rented direct, you keep the whole rate and carry the whole risk.")}
            ${p("The Vehicle Profitability Calculator underwrites all three side by side, net of the platform share, depreciation, and every operating cost, and gives each column its own verdict. Most people are surprised which column wins for their car.")}
            ${
              hasCars(ctx)
                ? p("You already have at least one car. Run it as it is today, then run it in the other two columns. The question is not whether to keep the car. It is which job the car should have.")
                : p("You do not have a car yet, which is the best time to run this. Underwrite the car you are thinking about before you buy it. A PASS verdict costs nothing. A CAUTION on a car you already own costs a lot.")
            }
            ${primaryButton(`${ctx.baseUrl}${CALC}`, "Run a car three ways")}
          `,
        }),
    },
    {
      delayHours: 144,
      subject: "Your personal policy wants no part of this",
      preheader: "Chapters four and eleven. The insurance conversation, and the floor.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Chapters four and eleven. The insurance conversation, and the floor.",
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Most personal auto policies exclude peer-to-peer car sharing. Not \"may not cover.\" Exclude. The platform's protection plan is not insurance either, and chapter four of the guide explains the difference. Read that chapter before the car has its first trip.")}
            ${p("Chapter eleven is the other half: there is a floor of legal and insurance structure you build before you ever rent a car direct, and you do not rent direct until it is built. Commercial coverage, a rental agreement, a way to verify the driver. The floor is boring. It is also the business.")}
            ${
              isGeorgia(ctx)
                ? callout("Since you are in Georgia:", "this is the market Be Nice Autos runs in, and the insurance conversation in Module 2 of the course is built on the questions we asked our own carriers here. Start with your current agent and ask one question: does this policy exclude car sharing? Get the answer in writing.")
                : callout("Wherever you are:", "start with your current agent and ask one question: does this policy exclude car sharing? Get the answer in writing before anything else.")
            }
            ${p("Educational content only, not insurance advice. The right coverage depends on your state, your carrier, and how you rent.")}
          `,
        }),
    },
    {
      delayHours: 192,
      subject: "The ladder",
      preheader: `The long version is a $${CRR_BLUEPRINT.priceUsd} book. The course is for operators who want it in video.`,
      html: (ctx) =>
        nurtureLayout({
          preheader: `The long version is a $${CRR_BLUEPRINT.priceUsd} book. The course is for operators who want it in video.`,
          signoff: "Alex",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("The free guide is twelve things. Here is what comes after it, in order, so you can pick the rung you actually need.")}
            ${p(`<strong>${CRR_BLUEPRINT.name}</strong> is the long version: seventeen chapters on building a car rental business from one car to fifty, what the platforms and the giants do not say out loud, and the direct-booking floor and stack. PDF and ePub, $${CRR_BLUEPRINT.priceUsd}. ${textLink(`${ctx.baseUrl}${CRR_BLUEPRINT.path}`, "See the book")}.`)}
            ${p(`<strong>${CRR.name}</strong> is the same system taught on video with the working tools: the underwriting scorecard, the fleet financial model, the claims playbook. Founding price is $${CRR.foundingPriceUsd} (retail $${CRR.retailPriceUsd}), and the waitlist is how you lock it. ${textLink(`${ctx.baseUrl}${CRR.path}`, "See the course")}.`)}
            ${primaryButton(`${ctx.baseUrl}${CRR_BLUEPRINT.path}`, `Get ${CRR_BLUEPRINT.name}, $${CRR_BLUEPRINT.priceUsd}`)}
            ${p("No pressure. The guide stands on its own. This is the last scheduled email; after this you hear from me when there is something worth sending.")}
          `,
        }),
    },
  ],
};
