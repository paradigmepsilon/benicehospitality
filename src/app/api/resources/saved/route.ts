import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import { savedResourceSlugs } from "@/lib/resources/saved";

// Bulk membership read for the /resources index: one query resolves the
// button state for every card on the page.
//
// Route-precedence note: this static segment is a sibling of
// /api/resources/[slug]/. Next resolves static before dynamic, and no registry
// slug is "saved", so there is no shadowing in either direction.

export async function GET() {
  const session = await getCurrentSession();

  // Anonymous gets a 200 with an empty list rather than a 401 — same shape as
  // the tool-state route's GET, which keeps the client provider branchless.
  if (!session) {
    return NextResponse.json({ loggedIn: false, slugs: [] });
  }

  try {
    const slugs = await savedResourceSlugs(session.user.id);
    return NextResponse.json({ loggedIn: true, slugs: [...slugs] });
  } catch (err) {
    console.error("[resources/saved] read failed:", err);
    // Degrade to "nothing saved" rather than breaking the index page.
    return NextResponse.json({ loggedIn: true, slugs: [] });
  }
}
