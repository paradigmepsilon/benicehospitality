import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/community-auth";

// Both members and admins use this surface — no admin redirect. The edge
// proxy already gates cookie presence; this verifies the session is live.
export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=%2Faccount%2Fcommunity");
  }
  return <>{children}</>;
}
