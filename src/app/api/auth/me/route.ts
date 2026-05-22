import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const { user } = session;
  return NextResponse.json({
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
