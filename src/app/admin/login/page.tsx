import { redirect } from "next/navigation";

// Admin auth was unified with community auth — both roles sign in at /login
// and the role on the user account decides what /account renders. The old
// /admin/login URL is preserved as a permanent redirect to avoid breaking
// any external bookmarks.
export default function LegacyAdminLoginPage() {
  redirect("/login?next=%2Fadmin");
}
