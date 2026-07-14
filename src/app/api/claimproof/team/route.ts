import { NextResponse } from "next/server";
import { requireWorkspace } from "../_guard";
import { getBaseUrl } from "@/lib/stripe";
import { claimProofInviteEmail, getClaimProofFromAddress } from "@/lib/claim-proof";
import {
  listWorkspaceMembers,
  seatsInUse,
  pendingInviteCount,
  createInvite,
  removeMember,
  updateMemberName,
  updateMemberEmail,
  setMemberSuspended,
  getMemberContact,
  SeatLimitReachedError,
  MemberNotFoundError,
  EmailTakenError,
} from "@/lib/claim-proof-workspace";
import { getCurrentSession, createPasswordResetToken } from "@/lib/community-auth";
import { sendPasswordResetEmail } from "@/lib/auth-email";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — team roster + seat usage (Fleet only). */
export async function GET() {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const { workspace } = guard.ctx;
  if (workspace.tier !== "fleet") {
    return NextResponse.json(
      { error: "Team seats are a Fleet feature.", code: "not_fleet" },
      { status: 403 },
    );
  }
  const [members, used, pending] = await Promise.all([
    listWorkspaceMembers(workspace.id),
    seatsInUse(workspace.id),
    pendingInviteCount(workspace.id),
  ]);
  return NextResponse.json({
    members,
    seatLimit: workspace.seatLimit,
    seatsUsed: used,
    pendingInvites: pending,
  });
}

/** POST — invite a teammate (owner only, Fleet only). { email } */
export async function POST(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const { workspace, role, userId } = guard.ctx;

  if (workspace.tier !== "fleet") {
    return NextResponse.json(
      { error: "Team seats are a Fleet feature.", code: "not_fleet" },
      { status: 403 },
    );
  }
  if (role !== "owner") {
    return NextResponse.json(
      { error: "Only the workspace owner can invite teammates." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  let rawToken: string;
  try {
    ({ rawToken } = await createInvite({
      workspaceId: workspace.id,
      email,
      invitedByUserId: userId,
    }));
  } catch (err) {
    if (err instanceof SeatLimitReachedError) {
      return NextResponse.json(
        { error: "All seats are filled or pending. Remove a member first.", code: "seat_limit" },
        { status: 409 },
      );
    }
    throw err;
  }

  // Send the invite email (best-effort; the invite exists regardless).
  try {
    const session = await getCurrentSession();
    const acceptUrl = `${getBaseUrl()}/claimproof/portal/accept-invite?token=${encodeURIComponent(rawToken)}`;
    const { subject, html } = claimProofInviteEmail({
      inviterName: session?.user.name,
      workspaceName: workspace.name,
      acceptUrl,
    });
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: getClaimProofFromAddress(),
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[claimproof/team] invite email failed:", err);
    // Return success anyway; owner can resend. The seat is reserved.
  }

  return NextResponse.json({ ok: true });
}

/**
 * PATCH — edit a member's account (owner only, Fleet only).
 * Body: { userId, action, value? }
 *   action = "name"       value=<new name>
 *   action = "email"      value=<new email>
 *   action = "suspend" | "reactivate"
 *   action = "reset"      (send password-reset email to the member)
 */
export async function PATCH(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const { workspace, role } = guard.ctx;

  if (workspace.tier !== "fleet") {
    return NextResponse.json(
      { error: "Team seats are a Fleet feature.", code: "not_fleet" },
      { status: 403 },
    );
  }
  if (role !== "owner") {
    return NextResponse.json(
      { error: "Only the workspace owner can edit teammates." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    userId?: unknown;
    action?: unknown;
    value?: unknown;
  };
  const memberId = Number(body.userId);
  const action = typeof body.action === "string" ? body.action : "";
  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json({ error: "Bad user id." }, { status: 400 });
  }

  try {
    switch (action) {
      case "name": {
        const value = typeof body.value === "string" ? body.value.trim() : "";
        if (!value) return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
        await updateMemberName(workspace.id, memberId, value);
        return NextResponse.json({ ok: true });
      }
      case "email": {
        const value = typeof body.value === "string" ? body.value.trim().toLowerCase() : "";
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
          return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
        }
        await updateMemberEmail(workspace.id, memberId, value);
        return NextResponse.json({ ok: true });
      }
      case "suspend":
      case "reactivate": {
        await setMemberSuspended(workspace.id, memberId, action === "suspend");
        return NextResponse.json({ ok: true, suspended: action === "suspend" });
      }
      case "reset": {
        const contact = await getMemberContact(workspace.id, memberId);
        const { rawToken } = await createPasswordResetToken(memberId);
        await sendPasswordResetEmail({ to: contact.email, name: contact.name, rawToken });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof MemberNotFoundError) {
      return NextResponse.json(
        { error: "That teammate isn't in your workspace.", code: "not_member" },
        { status: 404 },
      );
    }
    if (err instanceof EmailTakenError) {
      return NextResponse.json(
        { error: "That email is already in use by another account.", code: "email_taken" },
        { status: 409 },
      );
    }
    console.error("[claimproof/team] PATCH failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

/** DELETE — remove a member (owner only). ?userId=N */
export async function DELETE(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const { workspace, role } = guard.ctx;
  if (role !== "owner") {
    return NextResponse.json({ error: "Owner only." }, { status: 403 });
  }
  const memberId = Number(new URL(request.url).searchParams.get("userId"));
  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json({ error: "Bad user id." }, { status: 400 });
  }
  await removeMember(workspace.id, memberId);
  return NextResponse.json({ ok: true });
}
