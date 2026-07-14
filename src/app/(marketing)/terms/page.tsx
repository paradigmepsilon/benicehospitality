import type { Metadata } from "next";
import Link from "next/link";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute: "Terms of Service | Be Nice Hospitality Group",
  },
  description:
    "The rules of the road for using benicehospitality.com, our courses, our community, and our services. Plain English.",
  alternates: {
    canonical: "https://benicehospitality.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service | Be Nice Hospitality Group",
    description:
      "The rules of the road for using benicehospitality.com, our courses, our community, and our services.",
    url: "https://benicehospitality.com/terms",
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

export default function TermsPage() {
  return (
    <>
      <section className="bg-near-black pt-48 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.35em] uppercase text-warm-gold mb-6">
            Legal
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-6">
            Terms of Service
          </h1>
          <p className="font-sans text-sm text-white/55 uppercase tracking-[0.2em] mb-8">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="font-sans text-lg md:text-xl text-white/80 leading-snug">
            These are the rules of the road for using our site, our courses,
            and our services. We wrote them in plain English so you can read
            them once and know where you stand.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.offWhite} />

      <section className="bg-off-white py-20 md:py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <LegalSection title="1. Acceptance">
            <p>
              By using benicehospitality.com or any service we offer through
              it, you agree to these Terms of Service and to our{" "}
              <Link
                href="/privacy"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              . If you do not agree, do not use the site.
            </p>
            <p>
              These terms are an agreement between you and Be Nice Hospitality
              Group (&ldquo;BNHG,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a
              company based in Hapeville, Georgia.
            </p>
          </LegalSection>

          <LegalSection title="2. Who can use the site">
            <p>
              You must be at least eighteen years old to create an account,
              buy a course, or hire us for services. If you are using the site
              on behalf of a business, you confirm you have the authority to
              bind that business to these terms.
            </p>
          </LegalSection>

          <LegalSection title="3. Your account">
            <p>
              You are responsible for keeping your password safe and for the
              activity that happens under your account. If you think someone
              has gained access to your account, email us at{" "}
              <a
                href="mailto:admin@benicehospitality.com"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                admin@benicehospitality.com
              </a>{" "}
              and we will help you secure it.
            </p>
            <p>
              We may suspend or close accounts that violate these terms or
              that are used to abuse the platform, other members, or our
              staff.
            </p>
          </LegalSection>

          <LegalSection title="4. Courses and digital products">
            <p>
              When you buy a course, you get a personal, non-transferable
              license to access the lessons, materials, and downloadable
              resources for as long as your enrollment is active. You may
              not share your login, redistribute the lessons, post them
              publicly, or use them to build a competing product.
            </p>
            <p>
              Course access is delivered through your account on the site.
              We may update lessons, add new material, retire outdated
              material, and improve the platform without notice. If we
              meaningfully reduce the scope of a course you bought, we will
              email you and offer either a credit or a refund.
            </p>
          </LegalSection>

          <LegalSection title="5. Claim Proof Command Center">
            <p>
              The Claim Proof Command Center is a Be Nice Hospitality Group
              product for rental-vehicle hosts. When you buy it, you get a
              personal license to use the Command Center and its tools through
              your account. The same account rules in Section 3 apply: keep
              your login private and you are responsible for activity under
              your account.
            </p>
            <ul>
              <li>
                <strong>Your claim content is yours.</strong> The claims,
                worksheets, logs, and figures you enter belong to you. We store
                them on our infrastructure so they sync across your devices and
                so the tools can remember your claims, and we handle them as
                described in our{" "}
                <Link
                  href="/privacy"
                  className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                . You can export your worksheets to CSV and delete your claims
                or your account at any time.
              </li>
              <li>
                <strong>Fleet workspaces.</strong> The Fleet plan lets one
                account owner invite up to five additional team members to a
                shared workspace where the team sees the same claims. The owner
                is responsible for who they invite and for removing members who
                should no longer have access. Seats are limited to five
                teammates beyond the owner.
              </li>
              <li>
                <strong>Not legal, tax, or insurance advice.</strong> The
                Command Center is an organizing tool. Its checklists,
                templates, and worksheets are educational. It does not
                guarantee any claim outcome, payout, or reimbursement, and it
                is not a substitute for advice from a qualified professional or
                from the platform&apos;s own published rules. Nothing in the
                product should be read as a promise that a claim will be
                approved or paid.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="6. Community">
            <p>
              The community is a place for operators to learn from each
              other. Keep it useful. No spam, no selling, no abuse, no
              doxxing, no illegal content, no AI-generated noise dressed up
              as personal experience. We reserve the right to remove posts
              and remove members who break the rule.
            </p>
            <p>
              You retain ownership of what you post. You grant us a
              non-exclusive license to display your posts inside the
              community and to quote them anonymously in case studies or
              marketing.
            </p>
          </LegalSection>

          <LegalSection title="7. Payments, billing, and refunds">
            <p>
              Payments are processed by Stripe. Prices are listed in US
              dollars and are charged at the time of purchase. Subscription
              charges renew automatically until you cancel.
            </p>
            <ul>
              <li>
                <strong>Courses.</strong> Self-paced courses come with a
                seven-day money-back guarantee. Email us within seven days of
                purchase and we will refund the full amount, no questions.
              </li>
              <li>
                <strong>Signal engagements.</strong> Every productized
                engagement under five thousand dollars comes with a
                thirty-day money-back guarantee, in writing, in the
                statement of work.
              </li>
              <li>
                <strong>Retainers.</strong> Retainers are month-to-month.
                Cancel any month with no claw-back and no rolling-month
                clause.
              </li>
              <li>
                <strong>Custom builds.</strong> Custom-scoped work follows
                the milestones and payment schedule written into the
                statement of work for that engagement.
              </li>
            </ul>
            <p>
              Refunds outside these terms are at our discretion. If something
              feels off, email us before you dispute the charge. We respond
              within one business day.
            </p>
          </LegalSection>

          <LegalSection title="8. Acceptable use">
            <p>
              You agree not to use the site or our services to do any of the
              following.
            </p>
            <ul>
              <li>Break the law, infringe someone&apos;s rights, or harass anyone.</li>
              <li>Scrape, mirror, or systematically download our content.</li>
              <li>
                Reverse-engineer the site, the course player, or any of our
                software.
              </li>
              <li>
                Resell access, share your login, or use a single license for
                an entire team without our written permission.
              </li>
              <li>
                Upload anything malicious, anything that violates
                intellectual property, or anything that puts our members or
                infrastructure at risk.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="9. Intellectual property">
            <p>
              The site, the courses, the lesson videos and slides, the
              resource library, the Signal frameworks, and the BNHG brand
              marks are owned by Be Nice Hospitality Group or our licensors.
              All rights are reserved except for the licenses we explicitly
              grant in these terms.
            </p>
            <p>
              For Signal engagements, the deliverables we build for your
              property (code, schemas, content, automations) become yours on
              full payment. We keep the right to reuse the underlying
              frameworks, methods, and know-how.
            </p>
          </LegalSection>

          <LegalSection title="10. Disclaimers">
            <p>
              Our courses, resources, and consulting are educational and
              professional services. They are not legal, tax, accounting,
              financial, or investment advice. State and local rules vary
              and change. Always confirm specifics with a qualified
              professional in your jurisdiction.
            </p>
            <p>
              We do not guarantee a specific income, occupancy, ADR, direct
              booking percentage, or any other business result. The work we
              teach takes time and judgment to apply. Your outcomes depend
              on your market, your property, and the choices you make.
            </p>
            <p>
              The site and the services are provided on an &ldquo;as
              is&rdquo; and &ldquo;as available&rdquo; basis. We disclaim
              all implied warranties, including merchantability, fitness for
              a particular purpose, and non-infringement, to the maximum
              extent allowed by law.
            </p>
          </LegalSection>

          <LegalSection title="11. Limitation of liability">
            <p>
              To the maximum extent allowed by law, Be Nice Hospitality
              Group, its founders, employees, and contractors will not be
              liable for any indirect, incidental, special, consequential,
              or punitive damages, or any loss of profits, revenue, data,
              or goodwill, arising from your use of the site or our
              services.
            </p>
            <p>
              Our total aggregate liability for any claim related to the
              site or our services will not exceed the greater of one
              hundred US dollars or the amount you paid us in the twelve
              months before the event that gave rise to the claim.
            </p>
          </LegalSection>

          <LegalSection title="12. Indemnification">
            <p>
              You agree to defend and hold harmless Be Nice Hospitality
              Group from any claim, loss, or expense (including reasonable
              attorneys&apos; fees) arising from your misuse of the site,
              your violation of these terms, or your violation of any third
              party&apos;s rights.
            </p>
          </LegalSection>

          <LegalSection title="13. Third-party services and links">
            <p>
              The site links to third-party services we use or recommend
              (Stripe, Guestally, calendar tools, and others). Those
              services are governed by their own terms and privacy
              policies. We are not responsible for them.
            </p>
          </LegalSection>

          <LegalSection title="14. Termination">
            <p>
              You can close your account at any time by emailing us. We can
              suspend or close accounts that break these terms, that pose a
              risk to other members, or that abuse refunds, chargebacks, or
              our staff. If we close your account for cause, your right to
              access the courses and the community ends immediately.
            </p>
          </LegalSection>

          <LegalSection title="15. Governing law and disputes">
            <p>
              These terms are governed by the laws of the State of Georgia,
              United States, without regard to its conflict-of-law rules.
              Any dispute that cannot be resolved by good-faith conversation
              will be resolved in the state or federal courts located in
              Fulton County, Georgia, and you consent to the personal
              jurisdiction of those courts.
            </p>
          </LegalSection>

          <LegalSection title="16. Changes to these terms">
            <p>
              We may update these terms from time to time. If we make
              material changes, we will post the updated terms here, change
              the effective date at the top, and email account holders.
              Continued use of the site after the effective date means you
              accept the updated terms.
            </p>
          </LegalSection>

          <LegalSection title="17. Contact">
            <p>
              Questions about these terms can be sent to{" "}
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
                href="/privacy"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 not-italic"
              >
                Privacy Policy
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
