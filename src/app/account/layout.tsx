import { redirect } from "next/navigation";
import MemberShell from "@/components/member/MemberShell";
import PreviewModePicker from "@/components/admin/PreviewModePicker";
import { getViewerContext } from "@/lib/preview";
import { isUserOnboarded } from "@/lib/community-auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getViewerContext();
  if (!ctx) {
    redirect("/login?next=%2Faccount");
  }

  // Admins only see member pages when explicitly in preview mode. Otherwise
  // they belong on /admin. This makes the role context explicit and avoids
  // wonky behavior where clicking around the sidebar randomly drops admins
  // into and out of member view.
  if (ctx.realIsAdmin && ctx.previewMode === null) {
    redirect("/admin");
  }

  // Onboarding gate. A real member who hasn't completed intake gets routed
  // through /onboarding before they can see any /account/* surface. Admins
  // bypass — they never go through intake. Returning members with a
  // completed profile pass straight through.
  if (!ctx.realIsAdmin) {
    const onboarded = await isUserOnboarded(ctx.userId);
    if (!onboarded) {
      redirect("/onboarding");
    }
  }

  // Only render the picker for admins-in-preview. Real members never see it.
  const picker = ctx.realIsAdmin ? (
    <PreviewModePicker active={ctx.previewMode} showExit />
  ) : undefined;

  return (
    <MemberShell userId={ctx.userId} previewMode={ctx.previewMode} previewPicker={picker}>
      {children}
    </MemberShell>
  );
}
