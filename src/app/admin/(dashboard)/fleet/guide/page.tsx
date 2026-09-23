import {
  DOCS,
  MONTHLY_STEPS,
  OPERATING_STAGES,
  PHASES,
  STAGES,
  STEPS,
  TERM_REVIEW_WINDOW_DAYS,
  VEHICLE_STATUSES,
  VEHICLE_STEP_GROUPS,
  getDoc,
  getStage,
  vehicleStepsFor,
} from "@/lib/fleet/journey";

// The in-app manual. Stages, reasons, steps, vehicle checklists, the monthly
// cycle, and documents all come from journey.ts, so this page and the tracker
// can never disagree. Only the "how the screen works" prose is written here.

const card = "bg-white border border-[#e8e4dd] rounded-lg p-5";
const h2 = "font-display text-xl font-semibold text-[#1a1a1a]";
const p = "text-sm text-[#1a1a1a]/75 leading-relaxed";
const tag = "text-[10px] font-semibold uppercase tracking-wider text-[#1a1a1a]/45 mr-2";

const docHref = (key: string) => `/api/admin/fleet/docs/${key}`;

const OPERATING_LABELS = OPERATING_STAGES.map((k) => getStage(k)?.label ?? k).join(", ");

const SCREEN = [
  ["The board", `One row per owner. The ${PHASES.length} tiles across the top count owners by phase and filter the list when clicked. Each row shows the stage, a progress bar for the current checklist, one chip per vehicle with its status, and the next action with its due date. A Statement late or Term review due badge sits next to the stage when it applies.`],
  ["Needs attention today", "Appears at the top of the board when a next action is past its due date, when last month's statement has not gone out, or when a minimum term is inside its review window. If the box is not there, nothing is late."],
  ["+ New owner", "Search the CRM first. Picking a contact fills the form and links the two records. Starting from a car application or a CRM contact opens the form already filled in. Vehicles are added afterward, on the owner's page."],
  ["The owner checklist", "What has to happen at this stage, who owns it, and the exact document that does it. Ticking a step is what writes the timeline. Legal and Money tags mark steps that carry weight."],
  ["Moving stages", "Moving an owner forward with the next-stage button is logged in the timeline. Changing the stage any other way logs nothing: use that to correct a mistake, not to record progress."],
  ["Vehicles", "One entry per vehicle the owner wants managed: year, make, model, color, plate state, and where it is garaged. Each vehicle has a status and its own checklists. A status change is always logged, and the first move to Live or Returned stamps that date."],
  ["Emails for this stage", "Drafts from the email pack, already filled in with the owner's first name, vehicles, market city, term end date, and statement month. Read it, edit it, send it, and confirm in the dialog. It will not send with a blank still in it, and nothing ever sends on its own."],
  ["Onboarding fee + payment link", "Enter this owner's onboarding fee on the card first. The card payment link is raised by an admin for exactly that amount. There is no default amount and no public buy button. When the owner pays, the tracker records it and logs it for you."],
  ["Next action", "One sentence and a date, then save. This is what keeps an owner from going quiet."],
  ["Timeline", "What actually happened: steps completed, stage moves, vehicle status changes, emails sent, payments, and anything you log by hand. Editing a field never adds an entry."],
  ["Doc library", "Every document. Blank PDF opens the print-ready version. Fill in + print opens a version you can type into, then print to PDF from the bar at the top. The review tracker at the top records who has read each document and whether the set is approved for use."],
] as const;

export default function FleetGuidePage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <section className={card}>
        <h2 className={h2}>How this works, in one minute</h2>
        <p className={`${p} mt-2`}>
          Every vehicle owner lives on the Clients tab, from the application to offboarding. One card is one owner, because one agreement
          is one owner. The vehicles hang off the card, one per Exhibit A column, each with its own checklists. You tick steps as they
          happen, move the owner forward, and keep one next action with a date on every open owner. Three rules run the whole thing.
        </p>
        <ol className={`${p} mt-3 list-decimal pl-5 space-y-1.5`}>
          <li><strong>Every owner always has a next action and a date.</strong> If a row on the board has none, that is the first thing to fix.</li>
          <li><strong>Paper before keys.</strong> The agreement is signed before a vehicle changes hands, and onboarding starts when the fee and the reserve have landed.</li>
          <li><strong>Nothing reaches an owner without a person reading it first.</strong> The tracker drafts emails and raises payment links; a person confirms every one.</li>
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
        <h2 className={h2}>Vehicles and their three checklists</h2>
        <p className={`${p} mt-2`}>
          The owner checklist covers what is done once per owner: the signed agreement, the W-9, the ACH form, the fee, and the reserve.
          Everything that has to be true of a specific car is ticked on that car, in three lists.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#1a1a1a]/45">
                <th className="py-2 pr-4">Vehicle status</th><th className="py-2">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4dd]">
              {VEHICLE_STATUSES.map((s) => (
                <tr key={s.key}>
                  <td className="py-2 pr-4 font-medium">{s.label}</td>
                  <td className="py-2">{s.blurb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {VEHICLE_STEP_GROUPS.map((g) => (
          <div key={g.key} className="mt-4 border-l-2 border-[#1A4D4F]/25 pl-4">
            <h3 className="font-display text-base font-semibold text-[#1a1a1a]">
              {g.label} <span className="text-xs font-normal text-[#1a1a1a]/45">· {g.source}</span>
            </h3>
            <ul className="mt-1.5 space-y-1">
              {vehicleStepsFor(g.key).map((st) => {
                const doc = st.doc ? getDoc(st.doc) : undefined;
                return (
                  <li key={st.key} className="text-sm text-[#1a1a1a]/75">
                    <span className={tag}>{st.owner}</span>
                    {st.label}
                    {st.flag && <span className="text-[#8a4a32]"> ({st.flag})</span>}
                    {doc && <> · <a className="text-[#1A4D4F] hover:underline" href={docHref(doc.key)} target="_blank" rel="noopener noreferrer">{doc.title} ↗</a></>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className={card}>
        <h2 className={h2}>The monthly cycle and the Statement late flag</h2>
        <p className={`${p} mt-2`}>
          Once an owner has a vehicle earning, every calendar month gets the same short list. The owner&apos;s page keeps one list per
          month, and a new month needs no setup.
        </p>
        <ul className="mt-2 space-y-1">
          {MONTHLY_STEPS.map((st) => {
            const doc = st.doc ? getDoc(st.doc) : undefined;
            return (
              <li key={st.key} className="text-sm text-[#1a1a1a]/75">
                <span className={tag}>{st.owner}</span>
                {st.label}
                {st.flag && <span className="text-[#8a4a32]"> ({st.flag})</span>}
                {doc && <> · <a className="text-[#1A4D4F] hover:underline" href={docHref(doc.key)} target="_blank" rel="noopener noreferrer">{doc.title} ↗</a></>}
              </li>
            );
          })}
        </ul>
        <p className={`${p} mt-3`}>
          <strong>Statement late</strong> appears on the card and under Needs attention today when all of these are true: the owner is in one
          of {OPERATING_LABELS}; the owner&apos;s statement day is entered on the card; at least one vehicle went live before this month
          started; today is past the statement day; and last month&apos;s “Statement sent to the owner” is not ticked.
        </p>
        <p className={`${p} mt-2`}>
          The flag only fires once the statement day is entered. That day comes from the owner&apos;s Exhibit B and runs from 1 to 28, so it
          exists in every month. With no day entered there is no deadline to miss, and the tracker stays quiet. The tracker holds the
          ticks, not the numbers: no earnings data is stored here. The statement itself is the fill-in document in the library.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>The term review window</h2>
        <p className={`${p} mt-2`}>
          When an owner in {getStage("operating")?.label} has a minimum term end date {TERM_REVIEW_WINDOW_DAYS} days away or less, the card
          shows Term review due and the owner appears under Needs attention today. Move the owner to {getStage("renewal")?.label} and the
          flag clears.
        </p>
        <p className={`${p} mt-2`}>
          The {TERM_REVIEW_WINDOW_DAYS} days is a reminder built into this tracker. It is not a term of the contract. Notice periods and what
          happens when the minimum term ends are whatever the signed agreement says. With no term end date entered on the card, there is
          nothing to count down and no flag.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>Start to finish, stage by stage</h2>
        <p className={`${p} mt-2`}>For each stage: why it exists, what gets done, who does it, and when the owner is ready to move on.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#1a1a1a]/45">
                <th className="py-2 pr-4">Phase</th><th className="py-2 pr-4">Stage</th><th className="py-2 pr-4">Steps</th><th className="py-2">Move on when</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4dd]">
              {STAGES.map((s) => (
                <tr key={s.key}>
                  <td className="py-2 pr-4 text-[#1a1a1a]/55">{PHASES.find((ph) => ph.key === s.phase)?.label}</td>
                  <td className="py-2 pr-4 font-medium">{s.label}</td>
                  <td className="py-2 pr-4">{STEPS.filter((st) => st.stage === s.key).length}</td>
                  <td className="py-2">{s.exit || <span className="text-[#1a1a1a]/35">No exit: a resting stage</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                        <span className={tag}>{st.owner}</span>
                        {st.label}
                        {st.flag && <span className="text-[#8a4a32]"> ({st.flag})</span>}
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
        <h2 className={h2}>The rhythm</h2>
        <ul className={`${p} mt-2 list-disc pl-5 space-y-1.5`}>
          <li><strong>Monday.</strong> Open the board. Clear everything under Needs attention today. Every open owner leaves with a next action and a date.</li>
          <li><strong>Any day something happens.</strong> Tick the step. If it was a call or a document sent, log one line in the timeline.</li>
          <li><strong>Start of each month.</strong> Work the monthly cycle for every owner with a vehicle earning, before that owner&apos;s statement day.</li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={h2}>Emails and payment links wait for a person</h2>
        <p className={`${p} mt-2`}>
          The tracker never messages an owner and never asks for money on its own. An email goes out only after someone reads the draft,
          presses send, and confirms in the dialog, and it is refused while any blank is still unfilled. A payment link exists only after
          an admin raises it from the owner&apos;s page, for the onboarding fee entered on that card. Sending the link to the owner is a
          separate step a person takes.
        </p>
      </section>

      <section className={`${card} border-[#c0674a]/30`}>
        <h2 className={h2}>What never goes in the tracker</h2>
        <p className={`${p} mt-2`}>
          VINs, insurance policy numbers, lienholder or lessor details, and the management percentage. Those live on the signed agreement
          and its exhibits, in the owner folder, and nowhere else. The same goes for access codes, passwords, bank or loan numbers, Social
          Security numbers, ID images, and the owner&apos;s earnings. The tracker holds contact details, vehicle year, make, model, color, plate
          state, and garaging city, status, and amounts paid to BNHG. Of the {DOCS.length} documents in the library, the ones marked
          Internal only never go to an owner, and the agreement is a draft until an attorney has reviewed it.
        </p>
      </section>
    </div>
  );
}
