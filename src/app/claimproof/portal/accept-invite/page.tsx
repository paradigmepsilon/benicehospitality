import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/community-auth";
import { getInviteByToken, acceptInvite, SeatLimitReachedError } from "@/lib/claim-proof-workspace";
import { IconCheck, IconLock } from "../_components/Icons";

/**
 * Fleet seat-invite acceptance. Flow:
 *  - Not signed in -> prompt to sign in / sign up (with the invite email
 *    pre-filled), returning here afterward.
 *  - Signed in -> join the workspace and bounce to the dashboard.
 *
 * The invite is validated against its email so a link can't be used to join
 * under a different address than it was sent to.
 */

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cp-rise mx-auto max-w-xl py-10 md:py-16">
      <div className="rounded-[1.8rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
        <div className="rounded-[calc(1.8rem-0.375rem)] bg-[#2A2932] px-6 py-10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] md:px-10 md:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/claimproof/portal");

  const invite = await getInviteByToken(token);
  if (!invite) {
    return (
      <Shell>
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8BA5BE]/12 text-[#8BA5BE] ring-1 ring-[#8BA5BE]/30">
          <IconLock className="h-6 w-6" />
        </span>
        <h1 className="mb-4 font-display text-2xl font-semibold text-white">
          This invite is no longer valid.
        </h1>
        <p className="mb-8 font-sans text-base leading-relaxed text-white/65">
          It may have expired, been revoked, or already been used. Ask the fleet
          owner to send a fresh invite.
        </p>
        <Link
          href="/claimproof/portal"
          className="font-sans text-sm text-white/50 underline underline-offset-4 hover:text-[#E19C63]"
        >
          Go to the Command Center
        </Link>
      </Shell>
    );
  }

  const session = await getCurrentSession();

  // Not signed in: send them to sign in / sign up with the invite email and a
  // return path back here.
  if (!session) {
    const ret = encodeURIComponent(
      `/claimproof/portal/accept-invite?token=${encodeURIComponent(token)}`,
    );
    const emailParam = encodeURIComponent(invite.email);
    return (
      <Shell>
        <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-[#E19C63]">
          {invite.workspaceName}
        </p>
        <h1 className="mb-4 font-display text-2xl font-semibold text-white">
          You&rsquo;ve been invited to the team.
        </h1>
        <p className="mb-8 font-sans text-base leading-relaxed text-white/65">
          Sign in (or create a free account) with{" "}
          <strong className="text-white">{invite.email}</strong> to join and
          start sharing the team&rsquo;s claims.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href={`/claimproof/login?email=${emailParam}&next=${ret}`}
            className="inline-flex items-center justify-center rounded-full bg-[#E19C63] px-7 py-3 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183]"
          >
            Sign in to accept
          </Link>
          <Link
            href={`/claimproof/signup?email=${emailParam}&next=${ret}`}
            className="font-sans text-sm text-white/50 underline underline-offset-4 hover:text-[#E19C63]"
          >
            New here? Create your account
          </Link>
        </div>
      </Shell>
    );
  }

  // Signed in but under a different email than the invite. Ask them to use the
  // right account rather than silently joining the wrong person.
  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <Shell>
        <h1 className="mb-4 font-display text-2xl font-semibold text-white">
          This invite is for a different email.
        </h1>
        <p className="mb-8 font-sans text-base leading-relaxed text-white/65">
          You&rsquo;re signed in as{" "}
          <strong className="text-white">{session.user.email}</strong>, but this
          seat was sent to <strong className="text-white">{invite.email}</strong>.
          Sign in with that address to accept.
        </p>
        <Link
          href="/api/auth/logout"
          className="inline-flex items-center justify-center rounded-full bg-[#E19C63] px-7 py-3 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183]"
        >
          Switch accounts
        </Link>
      </Shell>
    );
  }

  // All checks pass: join the workspace.
  try {
    await acceptInvite(token, session.user.id);
  } catch (err) {
    if (err instanceof SeatLimitReachedError) {
      return (
        <Shell>
          <h1 className="mb-4 font-display text-2xl font-semibold text-white">
            The team is full.
          </h1>
          <p className="mb-8 font-sans text-base leading-relaxed text-white/65">
            Every seat on this fleet is taken. Ask the owner to free one up, then
            use your invite link again.
          </p>
          <Link
            href="/claimproof/portal"
            className="font-sans text-sm text-white/50 underline underline-offset-4 hover:text-[#E19C63]"
          >
            Go to the Command Center
          </Link>
        </Shell>
      );
    }
    throw err;
  }

  return (
    <Shell>
      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E19C63]/12 text-[#E19C63] ring-1 ring-[#E19C63]/30">
        <IconCheck className="h-6 w-6" />
      </span>
      <h1 className="mb-4 font-display text-2xl font-semibold text-white">
        You&rsquo;re on the team.
      </h1>
      <p className="mb-8 font-sans text-base leading-relaxed text-white/65">
        You now share <strong className="text-white">{invite.workspaceName}</strong>.
        Open the Command Center to see the team&rsquo;s claims and start working.
      </p>
      <Link
        href="/claimproof/portal"
        className="inline-flex items-center justify-center rounded-full bg-[#E19C63] px-7 py-3 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183]"
      >
        Open the Command Center
      </Link>
    </Shell>
  );
}
