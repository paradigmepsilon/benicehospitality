import {
  listAllEnrollmentsForAdmin,
  listAllCourses,
  listAllUsersBasic,
} from "@/lib/lms";
import EnrollmentsAdmin from "@/components/admin/EnrollmentsAdmin";

export const dynamic = "force-dynamic";

export default async function EnrollmentsAdminPage() {
  const [enrollments, courses, users] = await Promise.all([
    listAllEnrollmentsForAdmin(),
    listAllCourses(),
    listAllUsersBasic(),
  ]);

  return (
    <EnrollmentsAdmin
      initialEnrollments={enrollments.map((e) => ({
        id: e.id,
        userId: e.userId,
        userEmail: e.userEmail,
        userName: e.userName,
        courseId: e.courseId,
        courseSlug: e.courseSlug,
        courseTitle: e.courseTitle,
        tier: e.tier,
        status: e.status,
        grantedAt: e.grantedAt,
        expiresAt: e.expiresAt,
      }))}
      courses={courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        isPlaceholder: c.isPlaceholder,
      }))}
      users={users}
    />
  );
}
