import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import EmailCaptureForm from "@/components/forms/EmailCaptureForm";
import { COURSES, getCourseBySlug, type Course } from "@/lib/courses";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = "https://benicehospitality.com";
const ORG_ID = `${SITE_URL}/#organization`;

export async function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) {
    return { title: "Course not found | Be Nice Hospitality Group" };
  }
  const url = `${SITE_URL}/courses/${course.slug}`;
  return {
    title: `${course.name} ($${course.price})`,
    description: course.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: `${course.name} | Be Nice Hospitality Group`,
      description: course.tagline,
      url,
      type: "website",
    },
  };
}

function buildCourseSchema(course: Course) {
  const url = `${SITE_URL}/courses/${course.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: course.name,
    description: course.description,
    provider: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Be Nice Hospitality Group",
      sameAs: SITE_URL,
    },
    educationalLevel: course.edition,
    courseCode: course.slug,
    inLanguage: "en-US",
    audience: {
      "@type": "Audience",
      audienceType: course.forWhom,
    },
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: course.duration,
      },
    ],
    syllabusSections: course.modules.map((m, i) => ({
      "@type": "Syllabus",
      position: i + 1,
      name: m.title,
      description: m.body,
    })),
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: "USD",
      availability:
        course.status === "live"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      url,
    },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const schema = buildCourseSchema(course);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {course.status === "live" ? (
        <LiveCoursePage course={course} />
      ) : (
        <WaitlistCoursePage course={course} />
      )}
    </>
  );
}

const ASSET_LABEL: Record<Course["assetClass"], string> = {
  property: "Co-living edition",
  auto: "Auto edition",
  both: "Co-living and Auto",
};

/* ------------------------------------------------------------------ */
/* WAITLIST                                                           */
/* ------------------------------------------------------------------ */

function WaitlistCoursePage({ course }: { course: Course }) {
  return (
    <>
      <AnimatedSection theme="dark" className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>{course.edition} course</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-5 leading-[1.1]">
              {course.name}
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed mb-7">
              {course.tagline}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/15 rounded-md px-5 py-3">
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-warm-gold font-semibold">
                Releasing soon
              </span>
              <span className="text-white/30">·</span>
              <span className="font-display text-base font-semibold text-white">
                ${course.price}
              </span>
              <span className="text-white/30">·</span>
              <span className="font-sans text-xs text-white/60">
                {ASSET_LABEL[course.assetClass]}
              </span>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <AnimatedSection theme="off-white" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-2">
                Who it&apos;s for
              </p>
              <p className="font-sans text-base text-charcoal/80 leading-relaxed">
                {course.forWhom}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-2">
                What it covers
              </p>
              <p className="font-sans text-base text-charcoal/80 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-3">
                You&apos;ll leave with
              </p>
              <ul className="space-y-2">
                {course.outcomes.map((o) => (
                  <li
                    key={o}
                    className="font-sans text-sm text-charcoal/80 leading-relaxed flex gap-2"
                  >
                    <span className="text-primary-green mt-0.5">›</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-3">
                Curriculum preview
              </p>
              <ul className="space-y-3">
                {course.modules.map((m) => (
                  <li key={m.title} className="font-sans text-sm text-charcoal/80 leading-relaxed">
                    <span className="font-display text-warm-gold text-xs font-semibold mr-2">
                      {m.number}
                    </span>
                    {m.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection theme="light" className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mb-4 leading-tight">
              Get the launch email.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/70 mb-8 leading-relaxed">
              We send 1 email when this course goes live. Founding pricing is reserved for this list.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="max-w-md mx-auto">
              <EmailCaptureForm
                source={`course_${course.slug}_waitlist`}
                variant="card"
                buttonLabel="Notify Me"
                placeholder="you@yourbusiness.com"
                helperText="1 announcement, no follow-up sequence."
                successMessage="You're on the list. The next email comes when this course goes live."
              />
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <CourseFAQ course={course} />

      <AnimatedSection theme="off-white" className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-sm text-charcoal/60">
            Or{" "}
            <Link
              href="/education"
              className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 font-medium"
            >
              browse the full catalog
            </Link>
            .
          </p>
        </div>
      </AnimatedSection>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* LIVE                                                               */
/* ------------------------------------------------------------------ */

function LiveCoursePage({ course }: { course: Course }) {
  const enrollHref = `/contact?course=${course.slug}`;

  return (
    <>
      {/* Hero */}
      <AnimatedSection theme="dark" className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>{course.edition} course · {ASSET_LABEL[course.assetClass]}</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-5 leading-[1.1]">
              {course.name}
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed mb-8 max-w-2xl mx-auto">
              {course.tagline}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button href={enrollHref} variant="secondary" size="lg">
                Enroll for ${course.price}
              </Button>
              <span className="font-sans text-xs text-white/55">
                {course.duration}
              </span>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* The pitch */}
      <AnimatedSection theme="off-white" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-xl text-charcoal/85 leading-relaxed text-center mb-10">
            {course.description}
          </p>
          <div className="bg-white border-l-4 border-warm-gold p-6 md:p-8 rounded-r-md">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-2">
              Who this is for
            </p>
            <p className="font-sans text-base text-charcoal/85 leading-relaxed">
              {course.forWhom}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Outcomes */}
      <AnimatedSection theme="light" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>What changes for you</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-3 leading-tight">
              You&apos;ll leave with 3 concrete things.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {course.outcomes.map((o, i) => (
              <AnimatedItem key={o}>
                <div className="bg-cream/40 rounded-md p-7 h-full">
                  <p className="font-display text-warm-gold text-sm font-semibold mb-3">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="font-sans text-base text-charcoal/85 leading-relaxed">{o}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Curriculum */}
      <AnimatedSection theme="off-white" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>The Curriculum</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-3 leading-tight">
              5 modules. Built around the work.
            </h2>
          </div>
          <div className="space-y-4">
            {course.modules.map((m) => (
              <AnimatedItem key={m.title}>
                <details className="group bg-white border border-light-gray rounded-md overflow-hidden">
                  <summary className="cursor-pointer px-6 py-5 flex items-start gap-4 list-none hover:bg-cream/30 transition-colors">
                    <span className="font-display text-warm-gold text-sm font-semibold mt-0.5 shrink-0">
                      {m.number}
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-lg font-semibold text-near-black leading-tight">
                        {m.title}
                      </span>
                      <span className="block font-sans text-sm text-charcoal/65 mt-1 leading-relaxed">
                        {m.body}
                      </span>
                    </span>
                    <svg
                      className="w-4 h-4 text-charcoal/45 mt-1.5 shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 pl-14 border-t border-light-gray">
                    <ul className="space-y-2 mt-4">
                      {m.lessons.map((l) => (
                        <li
                          key={l}
                          className="font-sans text-sm text-charcoal/75 leading-relaxed flex gap-2"
                        >
                          <span className="text-primary-green mt-0.5">›</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* What's included + bonuses */}
      <AnimatedSection theme="light" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-4">
                What&apos;s included
              </p>
              <ul className="space-y-3">
                {course.includes.map((item) => (
                  <li
                    key={item}
                    className="font-sans text-base text-charcoal/85 leading-relaxed flex gap-2"
                  >
                    <span className="text-primary-green mt-0.5">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold mb-4">
                Bonuses
              </p>
              <ul className="space-y-3">
                {course.bonuses.map((item) => (
                  <li
                    key={item}
                    className="font-sans text-base text-charcoal/85 leading-relaxed flex gap-2"
                  >
                    <span className="text-warm-gold mt-0.5">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials (optional) */}
      {course.testimonials && course.testimonials.length > 0 && (
        <AnimatedSection theme="off-white" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel>From members</SectionLabel>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.testimonials.map((t) => (
                <AnimatedItem key={t.author}>
                  <figure className="bg-white border border-light-gray rounded-md p-7">
                    <blockquote className="font-sans text-base text-charcoal/85 leading-relaxed mb-5">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="font-sans text-sm text-charcoal/65">
                      <strong className="text-near-black">{t.author}</strong> · {t.context}
                    </figcaption>
                  </figure>
                </AnimatedItem>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      <CourseFAQ course={course} />

      {/* Final CTA */}
      <AnimatedSection theme="dark" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-5 leading-tight">
              Ready when you are.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-white/75 mb-8 leading-relaxed">
              Lifetime access to {course.shortName}, lifetime access to the Nice Host Network, and a 30-day money-back guarantee.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Button href={enrollHref} variant="secondary" size="lg">
              Enroll for ${course.price}
            </Button>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ (shared between live + waitlist)                               */
/* ------------------------------------------------------------------ */

function CourseFAQ({ course }: { course: Course }) {
  return (
    <AnimatedSection theme="light" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel>Common questions</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-3 leading-tight">
            What you might be wondering.
          </h2>
        </div>
        <div className="space-y-3">
          {course.faq.map((q) => (
            <AnimatedItem key={q.question}>
              <details className="group bg-cream/30 rounded-md overflow-hidden">
                <summary className="cursor-pointer px-6 py-5 flex items-center gap-4 list-none hover:bg-cream/50 transition-colors">
                  <span className="flex-1 font-display text-base font-semibold text-near-black">
                    {q.question}
                  </span>
                  <svg
                    className="w-4 h-4 text-charcoal/45 shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-6 pb-5">
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                    {q.answer}
                  </p>
                </div>
              </details>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
