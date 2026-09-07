/**
 * mgmt_applicant: someone applied for fleet or co-living management but has
 * not booked the call yet. Three touches over seven days, then it stops on its
 * own. The apply route stops it early when a booking lands for that address.
 *
 * Signed BNHG, not a founder. The management agreement is with the company,
 * and the owner-facing brand stays singular.
 */

import { nurtureLayout, p, primaryButton, textLink } from "../layout";
import type { NurtureContext, NurtureSequence } from "../types";

function hi(ctx: NurtureContext): string {
  return ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
}

function fromAddress(): string {
  return (
    process.env.MANAGEMENT_FROM_EMAIL ||
    process.env.BNHG_AUTH_FROM ||
    "BNHG <onboarding@resend.dev>"
  );
}

export const mgmtApplicant: NurtureSequence = {
  key: "mgmt_applicant",
  from: fromAddress,
  steps: [
    {
      delayHours: 24,
      subject: "Your management application, and what happens next",
      preheader: "A short call, then an asset review.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "A short call, then an asset review.",
          signoff: "BNHG",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Thanks for applying. Here is the whole process, so nothing is a surprise.")}
            ${p("First a call. Thirty minutes, no deck. We ask what the asset is, where it sits, and what you want it to do. Then an asset review, where we look at condition, location, and what the market actually pays. If it is a fit, you get an agreement and an onboarding checklist. If it is not, we say so on the call.")}
            ${primaryButton(`${ctx.baseUrl}/book`, "Pick a time")}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "The honest alternative to hiring us",
      preheader: "You can run this yourself. Here is what that takes.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "You can run this yourself. Here is what that takes.",
          signoff: "BNHG",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("Management is not the only answer, and we would rather say that now than after you have signed something.")}
            ${p("If you have the time and you want the control, run it yourself. Our courses are the same playbook we operate on, written down. Plenty of owners take that route and never hire us. That is a good outcome.")}
            ${p(`If you would rather hand it off, the call is still open. ${textLink(`${ctx.baseUrl}/training`, "See the courses")} or ${textLink(`${ctx.baseUrl}/book`, "pick a time")}.`)}
          `,
        }),
    },
    {
      delayHours: 72,
      subject: "Still want us to look at it?",
      preheader: "Last note on your application.",
      html: (ctx) =>
        nurtureLayout({
          preheader: "Last note on your application.",
          signoff: "BNHG",
          unsubscribeUrl: ctx.unsubscribeUrl,
          bodyHtml: `
            ${p(hi(ctx))}
            ${p("This is the last email about your application. We keep it on file either way, so there is nothing to redo if the timing changes.")}
            ${p("If you want the asset review, book the call. If the timing is wrong, ignore this and we will leave you alone.")}
            ${primaryButton(`${ctx.baseUrl}/book`, "Book the call")}
          `,
        }),
    },
  ],
};
