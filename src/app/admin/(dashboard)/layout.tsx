import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import PreviewModePicker from "@/components/admin/PreviewModePicker";
import { getCurrentSession } from "@/lib/community-auth";

// Server-side admin gate. The edge proxy already redirected unauthenticated
// requests away; here we additionally verify the session is live in the DB
// (not revoked / expired) and that the user actually has the admin role.
// Non-admin authenticated users get punted to /account instead of /login.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=%2Fadmin");
  }
  if (session.user.role !== "admin") {
    redirect("/account");
  }
  // While in /admin, "View as" defaults to admin god view (no preview cookie
  // set — the picker shows nothing as active).
  return (
    <AdminShell previewPicker={<PreviewModePicker active={null} />}>
      {children}
    </AdminShell>
  );
}
