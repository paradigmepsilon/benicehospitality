import Link from "next/link";

// Deliberately minimal — no marketing nav, no member shell. The onboarding
// page must NOT live under /account/* because the AccountLayout gate would
// loop-redirect anyone whose profile isn't complete back here. This is the
// one logged-in page that stays outside that gate.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="px-6 py-6 border-b border-light-gray bg-white">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="font-display text-xl text-deep-teal font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            Be Nice Hospitality
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
