import Link from "next/link";
import type { PortalTier } from "../_lib/access";
import { TIER_LABEL } from "../_lib/access";
import { IconLock, IconArrowUpRight } from "./Icons";

/**
 * The two "not for you yet" screens: AccessGate (not signed in) and
 * UpgradeLock (signed in, tier too low). Both keep the recovery path obvious;
 * a locked door with no handle is a support ticket.
 */

function GateShell({ children }: { children: React.ReactNode }) {
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

export function AccessGate({ denied }: { denied?: boolean }) {
  return (
    <GateShell>
      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E19C63]/12 text-[#E19C63] ring-1 ring-[#E19C63]/30">
        <IconLock className="h-6 w-6" />
      </span>
      <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-[#E19C63]">
        Claim Command Center
      </p>
      <h1 className="mb-4 font-display text-3xl font-semibold text-white">
        {denied ? "That link did not check out." : "Sign in to your Command Center."}
      </h1>
      <p className="mb-8 font-sans text-base leading-relaxed text-white/65">
        {denied
          ? "That link was invalid or has expired. Sign in with your purchase email below, or write to support and we will sort it quickly."
          : "Your claims sync to your account. Sign in with the email you bought Claim Proof with, or create your account if this is your first visit."}
      </p>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/claimproof/login?next=%2Fclaimproof%2Fportal"
          className="group inline-flex items-center gap-3 rounded-full bg-[#E19C63] py-2.5 pl-7 pr-2.5 font-sans text-sm font-semibold text-[#27262E] transition-all duration-300 hover:bg-[#EBB183] active:scale-[0.98]"
        >
          Sign in
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27262E]/12 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
            <IconArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          href="/claimproof/signup?next=%2Fclaimproof%2Fportal"
          className="font-sans text-sm text-white/60 underline underline-offset-4 transition-colors hover:text-[#E19C63]"
        >
          First time? Create your account with your purchase email
        </Link>
        <Link
          href="/claimproof"
          className="font-sans text-sm text-white/45 underline underline-offset-4 transition-colors hover:text-[#E19C63]"
        >
          Don&rsquo;t own Claim Proof yet? See what it is
        </Link>
      </div>
    </GateShell>
  );
}

export function UpgradeLock({
  tier,
  needs,
  packName,
}: {
  tier: PortalTier;
  needs: PortalTier;
  packName: string;
}) {
  const upgradeCopy =
    tier === "core"
      ? "Upgrade within 7 days of purchase and your full $47 applies toward the Complete system."
      : "Your Complete purchase applies toward the Fleet license within 30 days.";
  return (
    <GateShell>
      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8BA5BE]/12 text-[#8BA5BE] ring-1 ring-[#8BA5BE]/30">
        <IconLock className="h-6 w-6" />
      </span>
      <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-[#E19C63]">
        {packName}
      </p>
      <h1 className="mb-4 font-display text-3xl font-semibold text-white">
        This pack is in {TIER_LABEL[needs]}.
      </h1>
      <p className="mb-2 font-sans text-base leading-relaxed text-white/65">
        You own {TIER_LABEL[tier]}. {packName} unlocks with{" "}
        {TIER_LABEL[needs]}.
      </p>
      <p className="mb-8 font-sans text-sm text-[#E19C63]">{upgradeCopy}</p>
      <a
        href="mailto:hello@benicehospitality.com?subject=Claim%20Proof%20upgrade"
        className="group inline-flex items-center gap-3 rounded-full bg-[#E19C63] py-2.5 pl-7 pr-2.5 font-sans text-sm font-semibold text-[#27262E] transition-all duration-300 hover:bg-[#EBB183] active:scale-[0.98]"
      >
        Email to upgrade (we apply your credit)
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27262E]/12 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
          <IconArrowUpRight className="h-4 w-4" />
        </span>
      </a>
      <p className="mt-4 font-sans text-xs text-white/40">
        Reply usually lands same day with a checkout link for the difference.
      </p>
    </GateShell>
  );
}
