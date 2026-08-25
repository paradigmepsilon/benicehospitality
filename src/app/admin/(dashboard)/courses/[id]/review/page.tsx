import { notFound } from "next/navigation";
import CourseTabs from "@/components/admin/CourseTabs";
import CourseReviewPanel from "@/components/admin/CourseReviewPanel";
import { getCourseReviewState } from "@/lib/course-review";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseReviewPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const state = await getCourseReviewState(id);
  if (!state) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <CourseTabs courseId={id} active="review" courseTitle={state.courseTitle} />
      <CourseReviewPanel initialState={state} />
    </div>
  );
}
