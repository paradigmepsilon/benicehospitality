import type { Metadata } from "next";
import Link from "next/link";
import GuideForm from "../_components/GuideForm";

/**
 * The free 24-Hour Claim Rescue Checklist — the Claim Proof lead magnet as a
 * mobile web page (per the product brief: immediate win, demonstrates paid
 * quality, converts the not-ready). Public, printable, no login. The email
 * form delivers the PDF version + the follow-up sequence.
 */

export const metadata: Metadata = {
  title: "The 24-Hour Claim Rescue Checklist (Free) | Claim Proof",
  description:
    "Found damage on your Turo rental? Use this free checklist before the vehicle moves, the evidence disappears, or the filing window closes.",
};

const PRINT_CSS = `
@media print {
  .rescue-hide { display: none !important; }
  .rescue-page, .rescue-page * { color: #111 !important; background: #fff !important; border-color: #bbb !important; }
}
`;

function Box({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5 md:p-6">
      <h3 className="mb-3 font-sans font-bold text-warm-gold">{title}</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-3 font-sans text-sm leading-relaxed text-white/80">
            <span className="mt-0.5 inline-block h-4 w-4 flex-none rounded border border-white/30" aria-hidden />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RescueChecklistPage() {
  return (
    <main className="rescue-page bg-near-black text-white">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="mx-auto max-w-3xl px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-warm-gold">
          Free · from the Claim Proof system
        </p>
        <h1 className="mb-4 font-display text-3xl md:text-5xl font-semibold leading-tight">
          The 24-Hour Claim Rescue Checklist
        </h1>
        <p className="mb-3 font-sans text-lg text-white/75 leading-relaxed">
          Found damage? Use this before the vehicle moves, the evidence
          disappears, or the filing window closes.
        </p>
        <p className="mb-6 font-sans text-sm text-terracotta font-semibold">
          The report clock runs from TRIP END, not from when you found the
          damage. Check the trip end time in the app first.
        </p>

        <a
          href="#accident-track"
          className="rescue-hide mb-10 block rounded-2xl border border-terracotta/40 bg-terracotta/[0.06] p-5 transition hover:border-terracotta/70 md:p-6"
        >
          <p className="font-sans text-sm font-bold text-terracotta">
            Wrecked, not scratched?
          </p>
          <p className="mt-1 font-sans text-sm leading-relaxed text-white/75">
            If the car was in a collision or had to be towed, the steps are
            different. Safety and the accident report come first, and the car
            has already moved. Skip to the accident steps →
          </p>
        </a>

        <div className="space-y-5">
          <Box
            title="First 15 minutes"
            items={[
              "Do not move or clean the vehicle",
              "Confirm the exact trip end time in the app",
              "Wide shots: all four corners, surroundings in frame",
              "Damage shots: full panel, half panel, close-up, from 3 angles",
              "One close-up with an object for scale (key, card)",
              "Odometer and fuel level photographed",
            ]}
          />
          <Box
            title="First hour"
            items={[
              "Screenshot the entire guest message thread, timestamps visible",
              "Write down: trip number, guest name, return location, discovery time",
              "Find your pre-trip photos of the same panels",
              "Back the photos up off your phone",
            ]}
          />
          <Box
            title="Before you submit"
            items={[
              "Damage description is specific: panel, location, size, type",
              "Before AND after photos attached, originals not screenshots",
              "Dates consistent across everything",
              "Submitted INSIDE 24 hours from trip end",
              "Confirmation screenshotted and saved",
            ]}
          />
          <Box
            title="The photo shot list"
            items={[
              "4 corners wide (10-12 ft)",
              "4 sides straight-on (6-8 ft)",
              "Damage at 3 distances, 3 angles",
              "Scale shot + context shot connecting damage to THIS car",
              "Interior, odometer, fuel",
            ]}
          />
          <Box
            title="Five mistakes that sink valid claims"
            items={[
              "Reporting late because the damage was found late (the clock ran anyway)",
              "Cleaning the car before photographing it",
              "Close-ups only, with nothing proving which car",
              "Angry, accusatory messages that become part of the record",
              "Deleting messages (gaps read worse than awkward texts)",
            ]}
          />
          <div className="rounded-2xl border border-warm-gold/30 bg-warm-gold/[0.05] p-5 md:p-6">
            <h3 className="mb-2 font-sans font-bold text-warm-gold">
              Your incident summary, in one minute
            </h3>
            <p className="font-sans text-sm leading-relaxed text-white/80">
              Write five factual sentences: what the pre-trip photos show, what
              you found and where, when you discovered it, what evidence you
              have, and when you reported. No accusations, no emotion. The
              photos do the arguing.
            </p>
          </div>
        </div>

        {/* Accident / tow track: a different situation than a scratch */}
        <div id="accident-track" className="mt-16 scroll-mt-28">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-terracotta">
            If the car was in a crash or got towed
          </p>
          <h2 className="mb-3 font-display text-2xl md:text-4xl font-semibold leading-tight">
            Accident and tow steps
          </h2>
          <p className="mb-8 font-sans text-base text-white/75 leading-relaxed">
            This is a different play than a scratch found at drop-off. People
            come first, the accident gets reported right away, and the car has
            already moved. Your guest was the driver, so the accident report and
            the police report are theirs to make and yours to collect.
          </p>

          <div className="space-y-5">
            <Box
              title="Safety first"
              items={[
                "Confirm your guest and anyone else are safe and out of traffic",
                "If anyone is hurt, the call is 911, not you",
                "A car is replaceable and insured. Nothing comes before a person's safety",
              ]}
            />
            <Box
              title="Report the accident now"
              items={[
                "An accident is reported immediately, not at trip end",
                "Confirm the guest reported it in the app (Turo support: 1-888-391-0460)",
                "Note the date and time it was reported",
              ]}
            />
            <Box
              title="Get the scene facts from the guest"
              items={[
                "US collisions need a police report: get the report number",
                "Other driver name, insurance, and plate",
                "Any witness names and phone numbers",
                "Scene photos: all vehicles, plates, wide surroundings",
              ]}
            />
            <Box
              title="The tow: get these details before the car is lost"
              items={[
                "Who arranged it: Turo roadside, police, or a third party",
                "Tow company name and phone",
                "Yard address, phone, and what it takes to release the car",
                "Date the car arrived (storage fees run from here)",
              ]}
            />
            <Box
              title="Retrieve and photograph at the yard"
              items={[
                "Get the car released as soon as you can",
                "Shoot it at the yard with the same photo shot list above",
                "Save the tow invoice and storage records",
                "Then file the damage claim with the accident file attached",
              ]}
            />
            <div className="rounded-2xl border border-warm-gold/30 bg-warm-gold/[0.05] p-5 md:p-6">
              <h3 className="mb-2 font-sans font-bold text-warm-gold">
                The downtime is the real cost
              </h3>
              <p className="font-sans text-sm leading-relaxed text-white/80">
                In the US, Turo hosts do not get loss-of-use while a car is
                down. A towed car earns nothing until it is repaired and
                re-listed. That is the reason to move fast on release and book
                the repair early, not a reason to cut corners on documentation.
              </p>
            </div>
          </div>
        </div>

        {/* email capture + upsell */}
        <div className="rescue-hide mt-14 border-t border-white/10 pt-10">
          <h2 className="mb-3 font-display text-2xl md:text-3xl font-semibold">
            Get the printable PDF version
          </h2>
          <p className="mb-6 font-sans text-sm text-white/60 max-w-lg">
            Two pages, glovebox-ready, plus the occasional operator note.
          </p>
          <GuideForm />
          <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.02] p-6">
            <p className="font-sans text-sm leading-relaxed text-white/70">
              This checklist handles the first 24 hours. The{" "}
              <strong className="text-white">full Claim Proof system</strong>{" "}
              handles what comes after: the appraisal that comes in under the
              shop's estimate, the supplement request, the follow-up that goes
              quiet, and the fleet SOPs.{" "}
              <Link
                href="/claimproof"
                className="font-semibold text-warm-gold underline underline-offset-4 hover:text-gold-light"
              >
                See the whole system →
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-10 font-sans text-xs leading-relaxed text-white/35">
          Operational guidance, not legal advice. Not affiliated with Turo Inc.
          Policy references reviewed July 2026.
        </p>
      </div>
    </main>
  );
}
