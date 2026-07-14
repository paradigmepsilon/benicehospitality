import type { Metadata } from "next";
import Link from "next/link";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | Be Nice Hospitality Group",
  },
  description:
    "How Be Nice Hospitality Group collects, uses, and protects your information. Plain English, no dark patterns.",
  alternates: {
    canonical: "https://benicehospitality.com/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | Be Nice Hospitality Group",
    description:
      "How Be Nice Hospitality Group collects, uses, and protects your information.",
    url: "https://benicehospitality.com/privacy",
    type: "website",
    images: [
      {
        url: "/images/hero-banner.png",
        width: 1200,
        height: 630,
        alt: "Be Nice Hospitality Group",
      },
    ],
  },
};

const EFFECTIVE_DATE = "July 11, 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-near-black pt-48 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.35em] uppercase text-warm-gold mb-6">
            Legal
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm text-white/55 uppercase tracking-[0.2em] mb-8">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="font-sans text-lg md:text-xl text-white/80 leading-snug">
            We collect the information we need to run the business and serve
            you well. We do not sell it. We do not rent it. If you ever want it
            deleted, email us and we will take care of it.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.offWhite} />

      <section className="bg-off-white py-20 md:py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <LegalSection title="1. Who we are">
            <p>
              Be Nice Hospitality Group (&ldquo;BNHG,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us&rdquo;) is a hospitality consulting and education
              company based in Hapeville, Georgia. We are the owners of
              benicehospitality.com and the services available on it,
              including the Room Rental Riches course, our community, our
              Signal AI services, our resource library, and the{" "}
              <strong>Claim Proof Command Center</strong> (a Be Nice
              Hospitality Group product for Turo and rental-vehicle hosts).
            </p>
            <p>
              You can reach us anytime at{" "}
              <a
                href="mailto:admin@benicehospitality.com"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                admin@benicehospitality.com
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection title="2. What this policy covers">
            <p>
              This policy explains what information we collect when you visit
              the site, request a resource, subscribe to our newsletter,
              enroll in a course, book a call, or contact us. It also explains
              how we use that information and the third-party services that
              process pieces of it on our behalf.
            </p>
          </LegalSection>

          <LegalSection title="3. Information you give us directly">
            <ul>
              <li>
                <strong>Account information.</strong> When you create an
                account or enroll in a course, we collect your name, email
                address, and a password. If you buy a course, payment details
                are handled by Stripe (see Section 5). We never see or store
                your full card number.
              </li>
              <li>
                <strong>Contact and booking forms.</strong> When you fill out
                the contact form, the audit form, or book a discovery call, we
                collect the information you provide so we can reply, prepare
                for the call, or send you the resource you asked for.
              </li>
              <li>
                <strong>Newsletter signups.</strong> When you subscribe, we
                store your email and the source (which page you signed up
                from) so we know what brought you in.
              </li>
              <li>
                <strong>Community posts and replies.</strong> If you post
                inside the community, those posts are stored with your
                account so other members can read and reply to them.
              </li>
              <li>
                <strong>Lesson progress.</strong> For enrolled students, we
                track which lessons you have started and completed so the
                course player can resume where you left off.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Claim Proof Command Center data">
            <p>
              The Claim Proof Command Center is an interactive product for
              rental-vehicle hosts working a damage claim. When you buy it and
              set up your account, the Command Center saves your work to your
              account so it syncs across your devices and is there when you
              come back. This is a change from the earliest version of the
              product, which kept everything on your device only. We store it
              on our infrastructure now so the tools can remember your claims.
            </p>
            <ul>
              <li>
                <strong>Claim records.</strong> The vehicle, trip reference,
                dates, claim stage, next action, and the dollar figures you
                enter (appraisal, shop estimate, and the resulting valuation
                gap) for each claim you track.
              </li>
              <li>
                <strong>Tool worksheets and logs.</strong> The line items in
                your valuation comparison, your communication log entries,
                downtime and economics figures, and your checklist progress.
              </li>
              <li>
                <strong>What may be inside that content.</strong> Because you
                type it in yourself, this content can include details about a
                specific trip, a renter, a claim number, and correspondence.
                Treat it the way you would your own claim file. We handle it as
                confidential and never use it to identify or contact the other
                people mentioned in it.
              </li>
              <li>
                <strong>Fleet team members.</strong> On the Fleet plan, the
                account owner can invite up to five teammates by email. We
                store that email to send the invitation and, once accepted, to
                link the teammate&apos;s account to the shared workspace so the
                team sees the same claims. The owner can remove a teammate at
                any time.
              </li>
            </ul>
            <p>
              We use this content only to run the Command Center for you: to
              save and sync your work, compute the figures the tools show, and
              share claims across your own Fleet team. We do not sell it, we do
              not share it with anyone outside your workspace, and we do not
              use it to train models or for advertising. You can export any
              worksheet to CSV yourself, and you can ask us to delete your
              Command Center data at any time (see Section 8).
            </p>
          </LegalSection>

          <LegalSection title="5. Information we collect automatically">
            <ul>
              <li>
                <strong>Log data.</strong> Standard web request information:
                IP address, user-agent, the pages you visit, and timestamps.
                Used to keep the site running and to debug problems.
              </li>
              <li>
                <strong>Cookies.</strong> We use cookies that are required for
                login sessions and a small set of preference cookies. We do
                not use third-party advertising cookies.
              </li>
              <li>
                <strong>Analytics.</strong> We use privacy-respecting
                analytics to understand which pages and resources are
                working. We do not combine this with your account profile.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="6. Third-party services we rely on">
            <p>
              We use a small set of vendors to run the business. Each of them
              sees only the information they need to do their job.
            </p>
            <ul>
              <li>
                <strong>Stripe</strong> processes payments for courses and
                services. Stripe receives your name, email, billing address,
                and card details directly. We receive a confirmation and a
                customer reference, never the full card number.
              </li>
              <li>
                <strong>Neon and Vercel</strong> host our database and our
                application. Both are subject to industry-standard security
                controls.
              </li>
              <li>
                <strong>Resend</strong> (or a comparable provider) sends our
                transactional and newsletter email.
              </li>
              <li>
                <strong>Calendly</strong> or a comparable scheduler runs our
                discovery-call booking flow.
              </li>
            </ul>
            <p>
              We do not sell your personal information. We do not share it
              with third parties for their own marketing.
            </p>
          </LegalSection>

          <LegalSection title="7. How we use your information">
            <ul>
              <li>To deliver the course, community, and services you bought.</li>
              <li>
                To reply to your messages, prepare for calls, and send
                resources you requested.
              </li>
              <li>
                To send our newsletter and announcements if you subscribed.
                You can unsubscribe from any email with one click.
              </li>
              <li>
                To improve the site, the lessons, and the resources based on
                what people actually use.
              </li>
              <li>
                To meet our legal, accounting, and tax obligations.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="8. Your rights">
            <p>
              You can ask us to access, correct, export, or delete the
              personal information we hold about you. Email{" "}
              <a
                href="mailto:admin@benicehospitality.com"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                admin@benicehospitality.com
              </a>{" "}
              and we will reply within one business day and complete the
              request within thirty days.
            </p>
            <p>
              If you are in the EU, the UK, or California, you have additional
              rights under the GDPR, UK GDPR, and CCPA, including the right to
              object to processing and the right to lodge a complaint with
              your local data-protection authority. We honor those rights
              regardless of where you live.
            </p>
          </LegalSection>

          <LegalSection title="9. Data retention">
            <p>
              We keep your account and course-access records for as long as
              your account is active. If you close your account, we retain
              payment and transaction records for the period required by tax
              and accounting law (typically seven years). Newsletter
              subscribers are kept until they unsubscribe. Claim Proof Command
              Center data is kept while your account is active and is deleted
              when you delete a claim, delete your account, or ask us to remove
              it.
            </p>
          </LegalSection>

          <LegalSection title="10. Security">
            <p>
              We protect your information with TLS encryption in transit,
              hashed passwords, role-based access to our database, and
              audit logs for administrative actions. No system is perfectly
              secure. If we ever discover a breach that affects you, we will
              notify you promptly and in plain English.
            </p>
          </LegalSection>

          <LegalSection title="11. Children">
            <p>
              The site is intended for adults. We do not knowingly collect
              information from anyone under sixteen. If you believe a child
              has given us information, email us and we will delete it.
            </p>
          </LegalSection>

          <LegalSection title="12. International users">
            <p>
              We operate from the United States. If you use the site from
              outside the US, your information will be transferred to and
              processed in the US under the safeguards described above.
            </p>
          </LegalSection>

          <LegalSection title="13. Changes to this policy">
            <p>
              If we make material changes, we will post the updated policy
              here, change the effective date at the top, and email account
              holders. Continued use of the site after the effective date
              means you accept the updated policy.
            </p>
          </LegalSection>

          <LegalSection title="14. Contact">
            <p>
              Questions, requests, or complaints can be sent to{" "}
              <a
                href="mailto:admin@benicehospitality.com"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                admin@benicehospitality.com
              </a>
              . You can also reach us by phone at{" "}
              <a
                href="tel:+14045419934"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                (404) 541-9934
              </a>
              .
            </p>
            <p>
              Mailing address: Be Nice Hospitality Group, Hapeville, Georgia,
              United States.
            </p>
          </LegalSection>

          <div className="mt-16 pt-8 border-t border-charcoal/15">
            <p className="font-sans text-sm text-charcoal/65 italic">
              See also our{" "}
              <Link
                href="/terms"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 not-italic"
              >
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.offWhite} toColor={C.nearBlack} flip />
    </>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 last:mb-0">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight mb-5">
        {title}
      </h2>
      <div className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed space-y-4 [&_ul]:space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_strong]:text-near-black [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
