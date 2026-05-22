import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/community-auth";

export default async function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=%2Faccount%2Fresources");
  }
  return <>{children}</>;
}
