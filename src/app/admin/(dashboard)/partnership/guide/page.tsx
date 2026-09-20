import {
  DOCS,
  PHASES,
  STAGES,
  STEPS,
  VERDICTS,
  getDoc,
} from "@/lib/partnership/journey";
import { docHref } from "@/components/admin/partnership/ui";

// The in-app manual. Stages, reasons, steps, and documents all come from
// journey.ts, so this page and the tracker can never disagree. Only the
// "how the screen works" prose is written here.

const card = "bg-white border border-[#e8e4dd] rounded-lg p-5";
const h2 = "font-display text-xl font-semibold text-[#1a1a1a]";
const p = "text-sm text-[#1a1a1a]/75 leading-relaxed";

const SCREEN = [
  ["The board", "One row per client. The seven tiles across the top count clients by phase and filter the list when clicked. Each row shows the stage, the verdict, a progress bar for the current checklist, five numbered dots (one per section: empty ring is not sold, gold ring is proposed, teal is sold, gold fill is in progress, green is delivered), and the next action with its due date."],
  ["Needs attention today", "Appears at the top of the board, and as a banner on the client's own page, when a next action is past its due date or a credit expires within 7 days. If the box is not there, nothing is late."],
  ["+ New client", "Search the CRM first. Picking a contact fills the form and links the two records. Use a property label, not the full street address."],
  ["The journey map", "Every stage in order. The dark one is where the client is. Clicking any other stage previews its checklist without moving the client."],
  ["The checklist", "What has to happen at this stage, who owns it, and the exact document that does it. Ticking a step is what writes the timeline. Legal and Money tags mark steps that carry weight."],
  ["Move to next stage", "Turns green when every step is ticked. You can move on with steps open; either way the move is logged. The Stage dropdown in the header jumps anywhere and logs nothing: use it to correct a mistake, not to record progress."],
  ["Verdict + path", "Appears from the verdict call onward. Pick Go, Adjust, or No-go, then press Confirm. Confirming sets the credit, moves the client to that verdict's stage, and logs it. Then choose the path; the checklist changes to match."],
  ["Emails for this stage", "Drafts from the email pack, already filled in with the client's name, property, and credit date. Read it, edit it, press Send, and confirm in the dialog. It will not send with a blank still in it, and nothing ever sends on its own. If the email needs attachments, use Copy text and send from your own mail."],
  ["Next action", "One sentence and a date, then Save. This is what keeps a client from going quiet."],
  ["Sections + money", "Package, each section's status, the contract total, and what has been paid. None of these write to the timeline. The card payment link is for Section 1; when the client pays, the tracker marks it sold and logs it for you."],
  ["Timeline", "What actually happened: tasks completed, a confirmed verdict, stage moves, emails sent, payments, and anything you log by hand. Trying values in a dropdown never adds an entry."],
  ["Doc library", "Every document. Blank PDF opens the print-ready version. Fill in + print opens a version you can type into, then print to PDF from the bar at the top. The review tracker at the top records who has read each document and whether the set is approved for use."],
] as const;

export default function PartnershipGuidePage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <section className={card}>
        <h2 className={h2}>How this works, in one minute</h2>
        <p className={`${p} mt-2`}>
          Every co-living prospect and client lives on the Clients tab, from the first call to the day-90 handoff. Each stage has a
          checklist. You tick steps as they happen, move the client forward, and keep one next action with a date on every open client.
          Three rules run the whole thing.
        </p>
        <ol className={`${p} mt-3 list-decimal pl-5 space-y-1.5`}>
          <li><strong>Every client always has a next action and a date.</strong> If a row on the board has none, that is the first thing to fix.</li>
          <li><strong>No verdict is a dead end.</strong> Go, Adjust, and No-go each open a path, and each carries a credit.</li>
          <li><strong>Nothing reaches a client without a person reading it first.</strong> The tracker drafts; you confirm.</li>
        </ol>
      </section>

      <section className={card}>
        <h2 className={h2}>What each part of the screen does</h2>
        <dl className="mt-3 divide-y divide-[#e8e4dd]">
          {SCREEN.map(([term, text]) => (
            <div key={term} className="py-3 grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-1 sm:gap-4">
              <dt className="text-sm font-semibold text-[#1A4D4F]">{term}</dt>
              <dd className={p}>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={card}>
        <h2 className={h2}>The fork: what each verdict does</h2>
        <p className={`${p} mt-2`}>
          Section 1 is a best-use verdict, not a co-living yes or no. The packet compares four strategies, so something always wins.
          Della delivers the verdict on the call; log it the same day, because the credit clock starts on that date.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#1a1a1a]/45">
                <th className="py-2 pr-4">Verdict</th><th className="py-2 pr-4">Credit</th><th className="py-2 pr-4">Window</th><th className="py-2">Client moves to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4dd]">
              {VERDICTS.map((v) => (
                <tr key={v.key}>
                  <td className="py-2 pr-4 font-medium">{v.label}</td>
                  <td className="py-2 pr-4">${(v.creditCents / 100).toLocaleString("en-US")}</td>
                  <td className="py-2 pr-4">{v.creditDays === 365 ? "12 months" : `${v.creditDays} days`}</td>
                  <td className="py-2">{STAGES.find((s) => s.key === v.nextStage)!.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className={`${p} mt-3 list-disc pl-5 space-y-1`}>
          <li><strong>Launch Partnership / a la carte</strong> after a Go: the package, or sections one at a time.</li>
          <li><strong>Fix-It Path</strong> after an Adjust: a Viability Fix Plan, check-ins at day 30 and 60, one free re-score inside the 90 days.</li>
          <li><strong>Alternate Strategy Launch</strong> after a No-go where whole-home mid-term or short-term rental won the comparison.</li>
          <li><strong>Next Property Path</strong> after a No-go for a good operator with the wrong house: a free Buy Box, then Rapid Property Screens, then a second-address Section 1.</li>
          <li><strong>Market Watch</strong> for anyone not ready: quarterly contact for 12 months.</li>
        </ul>
        <p className="text-xs text-[#8a4a32] mt-3">Rapid Property Screen ($250, or 3 for $600) and second-address Section 1 ($500) are proposed prices. Alex signs them off before first use.</p>
      </section>

      <section className={card}>
        <h2 className={h2}>Start to finish, stage by stage</h2>
        <p className={`${p} mt-2`}>For each stage: why it exists, what gets done, who does it, and when the client is ready to move on.</p>
        {PHASES.map((phase) => (
          <div key={phase.key} className="mt-6">
            <h3 className="text-[11px] font-semibold tracking-wider uppercase text-[#B08D57]">{phase.label} · {phase.blurb}</h3>
            {STAGES.filter((s) => s.phase === phase.key).map((s) => (
              <div key={s.key} className="mt-3 border-l-2 border-[#1A4D4F]/25 pl-4">
                <h4 className="font-display text-base font-semibold text-[#1a1a1a]">{s.label}</h4>
                <p className={p}><strong>Why:</strong> {s.why}</p>
                {s.exit && <p className={p}><strong>Move on when:</strong> {s.exit}.</p>}
                <ul className="mt-1.5 space-y-1">
                  {STEPS.filter((st) => st.stage === s.key).map((st) => {
                    const doc = st.doc ? getDoc(st.doc) : undefined;
                    return (
                      <li key={st.key} className="text-sm text-[#1a1a1a]/75">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1a1a1a]/45 mr-2">{st.owner}</span>
                        {st.label}
                        {st.paths && <span className="text-[#1a1a1a]/45"> (only on: {st.paths.join(", ").replace(/_/g, " ")})</span>}
                        {doc && <> · <a className="text-[#1A4D4F] hover:underline" href={docHref(doc.key)} target="_blank" rel="noopener noreferrer">{doc.title} ↗</a></>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className={card}>
        <h2 className={h2}>The weekly rhythm</h2>
        <ul className={`${p} mt-2 list-disc pl-5 space-y-1.5`}>
          <li><strong>Monday, 15 minutes, Della + Alex.</strong> Open the board. Clear everything under Needs attention today. Every open client leaves with a next action and a date.</li>
          <li><strong>Any day something happens.</strong> Tick the step. If it was a call or a document sent, log one line in the timeline.</li>
          <li><strong>Friday.</strong> Look for credits closing in the next 14 days and send the matching email from the client&apos;s page.</li>
        </ul>
      </section>

      <section className={`${card} border-[#c0674a]/30`}>
        <h2 className={h2}>What never goes in the tracker</h2>
        <p className={`${p} mt-2`}>
          Access codes, passwords, bank or loan numbers, Social Security numbers, ID images, and the client&apos;s intake financials. The tracker holds
          contact details, status, and amounts paid to BNHG. Everything else lives in the client folder. Of the {DOCS.length} documents in the library,
          the ones marked Internal only carry margins and never go to a client, and the agreements are drafts until an attorney has reviewed them.
        </p>
      </section>
    </div>
  );
}
