/**
 * rrr_book: three emails after a Blueprint purchase. The book is delivered by
 * the webhook already; this sequence gets the reader to do the first exercise
 * and lands them on the course waitlist. Signed by Della.
 */

import { getBlueprintFromAddress } from "@/lib/blueprint";
import { RRR_PATHS } from "@/lib/room-rental-riches";
import { nurtureLayout, p, primaryButton, textLink, callout } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

const CALC = "/resources/co-living-viability-calculator";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

export const rrrBook: NurtureSequence = {
  key: "rrr_book",
  from: getBlueprintFromAddress,
  steps: [
    {
      delayHours: 24,
      subject: "Start with chapter one, then stop",
      preheader: "How to read the Blueprint so it changes what you do.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "How to read the Blueprint so it changes what you do.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Thank you for buying the Blueprint. Here is how I would read it, because reading a business book straight through is how most of them end up as a nice weekend and nothing else.")}
            ${p("Read chapter one. Then stop and write down, in one sentence, why this model works in your market or why it might not. If you cannot write the sentence, you are not ready for chapter two yet, and that is useful to know.")}
            ${callout("The book is a system, not a story.", "Each part ends with something to do. Do it before the next part. The order is the point.")}
            ${p("Your download links are in the delivery email. If it has wandered off, reply to this one and I will resend it.")}
          `,
        }),
    },
    {
      delayHours: 120,
      subject: "The one exercise to do before anything else",
      preheader: "Underwrite a real address. Then you will know.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Underwrite a real address. Then you will know.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          disclaimer: true,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("If you only do one exercise from the book, do this one: pick a real address and underwrite it as rooms. What each room rents for, furnished, for thirty days or more. What the building costs you every month. How many rooms have to be full for the math to hold.")}
            ${p(`The viability calculator does the arithmetic and gives you a verdict. ${textLink(`${ctx.baseUrl}${CALC}`, "Run your address")}. Then run a second one. The comparison teaches more than either result alone.`)}
            ${primaryButton(`${ctx.baseUrl}${CALC}`, "Underwrite an address")}
            ${p("Reply and tell me what the verdict was. I read every one.")}
          `,
        }),
    },
    {
      delayHours: 240,
      subject: "When the course opens, you hear first",
      preheader: "The Blueprint taught in video, with the working files.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "The Blueprint taught in video, with the working files.",
          signoff: "Della",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("The Blueprint is the system in writing. The Room Rental Riches course is the same system taught on video, module by module, with the calculators, templates, and vendor lists as working files you can copy.")}
            ${p(`Founding pricing holds for the first hundred students. The waitlist is how you lock it, and as a Blueprint reader you will hear before anyone else. ${textLink(`${ctx.baseUrl}${RRR_PATHS.hub}`, "See the course")}.`)}
            ${primaryButton(`${ctx.baseUrl}${RRR_PATHS.hub}`, "Join the course waitlist")}
            ${p("That is the last scheduled email from me. From here you will only hear from me when there is something worth saying.")}
          `,
        }),
    },
  ],
};
