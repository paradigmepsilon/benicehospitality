import Link from "next/link";

/**
 * Dark, Command-Center-branded shell for the Claim Proof auth pages. Mirrors
 * the portal's ambient-glow aesthetic so the buyer stays inside the Claim Proof
 * world (never the BNHG cream/green member chrome) through login/signup.
 */
export default function CpAuthShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#27262E] px-5 py-16 text-white">
      {/* ambient depth */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-[-6%] h-[32rem] w-[32rem] rounded-full bg-[#E19C63]/[0.08] blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#8BA5BE]/[0.06] blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/claimproof"
            className="inline-flex items-baseline gap-2 font-display text-lg font-semibold text-white"
          >
            <span>
              Claim<span className="text-[#E19C63]">Proof</span>
            </span>
          </Link>
          <p className="mt-6 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8BA5BE]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-sm font-sans text-sm leading-relaxed text-white/60">
            {sub}
          </p>
        </div>

        <div className="rounded-[1.4rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
          <div className="rounded-[calc(1.4rem-0.375rem)] bg-[#2A2932] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-7">
            {children}
          </div>
        </div>

        <p className="mt-6 text-center font-sans text-[11px] leading-relaxed text-white/30">
          Part of Be Nice Hospitality Group. Operational guidance, not legal or
          insurance advice.
        </p>
      </div>
    </div>
  );
}
