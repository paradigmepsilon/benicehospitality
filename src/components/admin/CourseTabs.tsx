import Link from "next/link";

const TAB_LABELS: Record<string, string> = {
  basics: "Basics",
  curriculum: "Curriculum",
  tiers: "Tiers",
};

const TAB_HREFS: Record<string, (id: number) => string> = {
  basics: (id) => `/admin/courses/${id}/edit`,
  curriculum: (id) => `/admin/courses/${id}/curriculum`,
  tiers: (id) => `/admin/courses/${id}/tiers`,
};

const TAB_ORDER = ["basics", "curriculum", "tiers"] as const;
export type CourseTab = (typeof TAB_ORDER)[number];

export default function CourseTabs({
  courseId,
  active,
  courseTitle,
}: {
  courseId: number;
  active: CourseTab;
  courseTitle: string;
}) {
  return (
    <div className="mb-6">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-3"
      >
        ← All courses
      </Link>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-4">
        {courseTitle}
      </h1>
      <nav className="border-b border-light-gray">
        <div className="flex gap-1">
          {TAB_ORDER.map((tab) => (
            <Link
              key={tab}
              href={TAB_HREFS[tab](courseId)}
              className={[
                "px-4 py-2 font-sans text-sm font-semibold border-b-2 -mb-px transition-colors",
                active === tab
                  ? "border-primary-green text-primary-green"
                  : "border-transparent text-charcoal/65 hover:text-[#1a1a1a]",
              ].join(" ")}
            >
              {TAB_LABELS[tab]}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
