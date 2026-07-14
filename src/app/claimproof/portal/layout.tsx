import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_VERSION, LAST_REVIEWED } from "./_content/types";
import { getPortalAccess } from "./_lib/access";
import LogoutButton from "./_components/LogoutButton";
import SupportModal from "./_components/SupportModal";

/**
 * Claim Command Center shell. Deliberately outside the (marketing) group:
 * a buyer mid-crisis gets a focused tool, not a website. Floating glass nav,
 * ambient depth layers, and print styles so every tool doubles as a
 * printable PDF (cp-noprint hides editing chrome; the assembled document
 * itself is what prints).
 */

export const metadata: Metadata = {
  title: "Claim Command Center | Claim Proof",
  description:
    "The Claim Proof member portal: guided workflows for documenting, filing, valuing, and following up on damage claims.",
  robots: { index: false, follow: false },
};

const PORTAL_CSS = `
@media print {
  .cp-chrome, .cp-noprint { display: none !important; }
  body { background: #fff !important; }
  .cp-portal, .cp-portal * { color: #111 !important; border-color: #ccc !important; background: transparent !important; box-shadow: none !important; text-shadow: none !important; }
  .cp-portal a { text-decoration: none !important; }
  .cp-portal input[type="checkbox"] { accent-color: #111; }
  .cp-paper span { color: #111 !important; font-style: normal !important; border: 0 !important; }
}
@keyframes cpRise {
  from { opacity: 0; transform: translateY(22px); filter: blur(5px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
.cp-rise { animation: cpRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--d, 0ms); }
@media (prefers-reduced-motion: reduce) {
  .cp-rise { animation: none; }
  .cp-portal * { transition-duration: 0.01ms !important; }
}
.cp-portal :focus-visible { outline: 2px solid #E19C63; outline-offset: 2px; }
`;

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nav affordances depend on who's here: the Team link only means something to
  // a Fleet workspace owner, and Sign out only shows for a signed-in account.
  const access = await getPortalAccess();
  const isFleetOwner =
    access?.workspace?.workspace.tier === "fleet" &&
    access.workspace.role === "owner";
  const isSignedIn = access?.via === "account";

  return (
    <div className="cp-portal relative min-h-screen bg-[#27262E] text-white">
      <style dangerouslySetInnerHTML={{ __html: PORTAL_CSS }} />

      {/* ambient depth field: static glow orbs on the fixed layer */}
      <div
        aria-hidden
        className="cp-chrome pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-48 right-[-8%] h-[34rem] w-[34rem] rounded-full bg-[#E19C63]/[0.07] blur-[130px]" />
        <div className="absolute left-[-14%] top-[36%] h-[30rem] w-[30rem] rounded-full bg-[#8BA5BE]/[0.06] blur-[130px]" />
        <div className="absolute bottom-[-22%] right-[16%] h-[26rem] w-[26rem] rounded-full bg-[#E19C63]/[0.04] blur-[120px]" />
      </div>

      {/* floating glass nav */}
      <header className="cp-chrome sticky top-0 z-40 px-4 pb-2 pt-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#2A2932]/75 px-5 py-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.07)] backdrop-blur-xl md:px-6">
          <Link
            href="/claimproof/portal"
            className="group flex items-baseline gap-2 font-display text-lg font-semibold text-white"
          >
            <span>
              Claim<span className="text-[#E19C63]">Proof</span>
            </span>
            <span className="hidden font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8BA5BE] sm:inline">
              Command Center
            </span>
          </Link>
          <nav className="flex items-center gap-1.5">
            <Link
              href="/claimproof/portal"
              className="rounded-full px-3.5 py-1.5 font-sans text-sm text-white/60 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
            >
              Dashboard
            </Link>
            {isFleetOwner && (
              <Link
                href="/claimproof/portal/team"
                className="rounded-full px-3.5 py-1.5 font-sans text-sm text-white/60 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
              >
                Team
              </Link>
            )}
            <SupportModal />
            {isSignedIn && <LogoutButton />}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        {children}
      </main>

      <footer className="cp-chrome relative z-10 mx-auto max-w-5xl border-t border-white/10 px-5 py-8 md:px-8">
        <p className="font-sans text-xs leading-relaxed text-white/35">
          Claim Proof v{PRODUCT_VERSION} · policy references last reviewed{" "}
          {LAST_REVIEWED} · operational guidance, not legal, insurance, or
          claims-adjusting advice · not affiliated with Turo Inc. · your
          claims, checklists, worksheets, and logs are saved to your account and
          sync securely across your devices.
        </p>
      </footer>
    </div>
  );
}
