import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalAccess, tierUnlocks, TIER_LABEL } from "./_lib/access";
import ClaimsPanel from "./_components/ClaimsPanel";
import PackagePrintButton from "./_components/PackagePrintButton";
import { WalkthroughVideo } from "./_components/WalkthroughVideo";
import { PACKS, STAGES } from "./_content";
import { AccessGate } from "./_components/Gates";
import {
  PackIcon,
  IconBolt,
  IconCamera,
  IconScale,
  IconChat,
  IconArrowUpRight,
  IconLock,
} from "./_components/Icons";

/**
 * Command Center dashboard. The buyer's first screen: four situation choices
 * (the product's core promise: never dig through a library) in a bento grid
 * with the urgent path featured, then the packs with live progress bars.
 *
 * ?t=TOKEN (from delivery emails) bounces through the auth handler to set the
 * cookie; ?denied=1 comes back from a failed validation.
 */

export const dynamic = "force-dynamic";

const STAGE_ICON: Record<string, React.ReactNode> = {
  prepare: <IconCamera className="h-5 w-5" />,
  today: <IconBolt className="h-6 w-6" />,
  underpaid: <IconScale className="h-5 w-5" />,
  stuck: <IconChat className="h-5 w-5" />,
};

export default async function PortalDashboard({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; denied?: string }>;
}) {
  const { t, denied } = await searchParams;
  if (t) redirect(`/api/claimproof/portal-auth?t=${encodeURIComponent(t)}`);

  const access = await getPortalAccess();
  if (!access) return <AccessGate denied={denied === "1"} />;
  const tier = access.tier;
  const hasWorkspace = access.workspace != null;
  const isFleetOwner =
    access.workspace?.workspace.tier === "fleet" &&
    access.workspace.role === "owner";

  const urgent = STAGES.find((s) => s.urgent)!;
  const calm = STAGES.filter((s) => !s.urgent);

  return (
    <div>
      <header className="cp-rise mb-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E19C63]/30 bg-[#E19C63]/[0.07] px-3.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E19C63]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E19C63]" />
          {TIER_LABEL[tier]}
        </p>
        <h1 className="mb-3 font-display text-4xl font-semibold leading-[1.08] text-white md:text-5xl">
          What is happening
          <br className="hidden sm:block" /> with your claim?
        </h1>
        <p className="max-w-2xl font-sans text-base text-white/60">
          Pick your situation. It opens the exact workflow, with the next
          action first.{" "}
          {hasWorkspace
            ? "Your claims, checklists, and worksheets sync to your account as you go."
            : "Sign in with your purchase email to sync your claims across devices."}
        </p>
        {hasWorkspace && (
          <div className="mt-6">
            <PackagePrintButton
              label={`Download my ${TIER_LABEL[tier]} kit (PDF)`}
            />
          </div>
        )}
      </header>

      <WalkthroughVideo videoKey="orientation" eyebrow="Start here" />

      {hasWorkspace && <ClaimsPanel />}

      {/* the four situations: urgent path featured in the bento */}
      <div className="mb-16 grid gap-4 md:grid-cols-5">
        <Link
          href={urgent.href}
          style={{ "--d": "80ms" } as React.CSSProperties}
          className="cp-rise group relative overflow-hidden rounded-[1.6rem] border border-[#E19C63]/40 bg-gradient-to-b from-[#E19C63]/[0.13] via-[#E19C63]/[0.05] to-transparent p-7 shadow-[0_20px_60px_-20px_rgba(225,156,99,0.35),inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/80 hover:shadow-[0_24px_70px_-18px_rgba(225,156,99,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-[0.99] md:col-span-2 md:row-span-3 md:flex md:flex-col md:p-8"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E19C63] text-[#27262E] shadow-[0_8px_24px_-6px_rgba(225,156,99,0.6)]">
              {STAGE_ICON[urgent.slug]}
            </span>
            <span className="rounded-full bg-[#E19C63]/20 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[#E19C63]">
              Urgent
            </span>
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold leading-snug text-white md:text-[1.7rem]">
            {urgent.label}
          </h2>
          <p className="font-sans text-sm leading-relaxed text-white/65">
            {urgent.sub}
          </p>
          <span className="mt-6 inline-flex w-max items-center gap-3 rounded-full bg-white/[0.06] py-2 pl-5 pr-2 font-sans text-sm font-semibold text-[#E19C63] ring-1 ring-[#E19C63]/30 transition-colors duration-300 group-hover:bg-[#E19C63] group-hover:text-[#27262E] md:mt-auto">
            Start the filing sequence
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E19C63]/15 text-[#E19C63] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:bg-[#27262E]/15 group-hover:text-[#27262E]">
              <IconArrowUpRight className="h-4 w-4" />
            </span>
          </span>
        </Link>

        {calm.map((s, i) => (
          <Link
            key={s.slug}
            href={s.href}
            style={{ "--d": `${160 + i * 80}ms` } as React.CSSProperties}
            className="cp-rise group flex items-center gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/50 hover:bg-white/[0.05] active:scale-[0.99] md:col-span-3 md:p-6"
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#8BA5BE]/12 text-[#8BA5BE] transition-colors duration-300 group-hover:bg-[#E19C63]/15 group-hover:text-[#E19C63]">
              {STAGE_ICON[s.slug]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-sans text-base font-bold leading-snug text-white">
                {s.label}
              </span>
              <span className="mt-0.5 block font-sans text-sm leading-relaxed text-white/55">
                {s.sub}
              </span>
            </span>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/12 text-white/40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:border-[#E19C63] group-hover:bg-[#E19C63] group-hover:text-[#27262E]">
              <IconArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      {isFleetOwner && (
        <Link
          href="/claimproof/portal/team"
          className="cp-rise mb-8 flex items-center justify-between gap-4 rounded-[1.3rem] border border-[#8BA5BE]/30 bg-[#8BA5BE]/[0.06] p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#8BA5BE]/60 hover:bg-[#8BA5BE]/[0.1] active:scale-[0.995]"
        >
          <span>
            <span className="block font-sans font-bold text-white">
              Manage your fleet team
            </span>
            <span className="mt-0.5 block font-sans text-sm text-white/55">
              Invite up to 5 teammates to share this workspace&rsquo;s claims.
            </span>
          </span>
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#8BA5BE]/40 text-[#8BA5BE]">
            <IconArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      {/* the packs */}
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
          The full system
        </h2>
        <span className="font-sans text-xs text-white/40">
          {PACKS.reduce((n, p) => n + p.tools.length, 0)} tools · 5 packs
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {PACKS.map((pack, i) => {
          const unlocked = tierUnlocks(tier, pack.access);
          return (
            <div
              key={pack.slug}
              style={{ "--d": `${120 + i * 60}ms` } as React.CSSProperties}
              className={
                "cp-rise rounded-[1.5rem] p-1.5 ring-1 " +
                (unlocked ? "bg-white/[0.04] ring-white/10" : "bg-white/[0.02] ring-white/[0.06]")
              }
            >
              <div
                className={
                  "h-full rounded-[calc(1.5rem-0.375rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-6 " +
                  (unlocked ? "bg-[#2A2932]" : "bg-[#292831]")
                }
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={
                        "flex h-10 w-10 flex-none items-center justify-center rounded-xl " +
                        (unlocked
                          ? "bg-[#E19C63]/12 text-[#E19C63]"
                          : "bg-white/[0.05] text-white/30")
                      }
                    >
                      <PackIcon slug={pack.slug} className="h-5 w-5" />
                    </span>
                    <h3
                      className={
                        "truncate font-sans text-lg font-bold " +
                        (unlocked ? "text-white" : "text-white/40")
                      }
                    >
                      {pack.name}
                    </h3>
                  </div>
                  {!unlocked && (
                    <span className="flex flex-none items-center gap-1.5 rounded-full border border-white/12 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">
                      <IconLock className="h-3 w-3" />
                      {TIER_LABEL[pack.access]}
                    </span>
                  )}
                </div>
                <p
                  className={
                    "mb-4 font-sans text-sm leading-relaxed " +
                    (unlocked ? "text-white/60" : "text-white/35")
                  }
                >
                  {pack.blurb}
                </p>

                {unlocked ? (
                  <>
                    <ul className="space-y-1">
                      {pack.tools.map((tool) => (
                        <li key={tool.slug}>
                          <Link
                            href={`/claimproof/portal/${pack.slug}/${tool.slug}`}
                            className="group -mx-2 flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors duration-300 hover:bg-white/[0.05]"
                          >
                            <span className="font-sans text-sm text-white/80 transition-colors duration-300 group-hover:text-[#E19C63]">
                              {tool.name}
                            </span>
                            <span className="flex-none font-sans text-[11px] tabular-nums text-[#8BA5BE]/70">
                              {tool.minutes}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div>
                    <ul className="mb-4 space-y-1.5">
                      {pack.tools.slice(0, 4).map((tool) => (
                        <li
                          key={tool.slug}
                          className="flex items-center gap-2 font-sans text-sm text-white/30"
                        >
                          <IconLock className="h-3.5 w-3.5 flex-none text-white/20" />
                          {tool.name}
                        </li>
                      ))}
                      {pack.tools.length > 4 && (
                        <li className="pl-[22px] font-sans text-xs text-white/25">
                          + {pack.tools.length - 4} more tools
                        </li>
                      )}
                    </ul>
                    <a
                      href="mailto:hello@benicehospitality.com?subject=Claim%20Proof%20upgrade"
                      className="inline-flex items-center gap-2 rounded-full border border-[#E19C63]/45 px-4 py-2 font-sans text-xs font-semibold text-[#E19C63] transition-all duration-300 hover:bg-[#E19C63] hover:text-[#27262E] active:scale-[0.97]"
                    >
                      <IconLock className="h-3.5 w-3.5" />
                      Upgrade to unlock (your purchase applies as credit)
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* first 15 minutes: the method as a timeline */}
      <div
        className="cp-rise mt-12 rounded-[1.5rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10"
        style={{ "--d": "300ms" } as React.CSSProperties}
      >
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-[#2A2932] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-7">
          <h3 className="mb-6 font-display text-xl font-semibold text-white">
            First time here? <span className="text-[#E19C63]">Your first 15 minutes.</span>
          </h3>
          <ol className="grid gap-5 sm:grid-cols-5 sm:gap-3">
            {(
              [
                ["1", "Pick your situation above"],
                ["3", "Open the checklist it hands you"],
                ["5", "Note the evidence you are missing"],
                ["10", "Draft the incident summary if damage is live"],
                ["15", "You know your next submission or follow-up step"],
              ] as const
            ).map(([min, text]) => (
              <li key={min} className="flex gap-3 sm:block">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#E19C63]/45 bg-[#E19C63]/10 font-sans text-[11px] font-bold tabular-nums text-[#E19C63]">
                  {min}
                </span>
                <p className="font-sans text-[13px] leading-relaxed text-white/65 sm:mt-3">
                  {text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 font-sans text-xs text-white/40">
            That is the whole method: the next action, always visible.
          </p>
        </div>
      </div>
    </div>
  );
}
