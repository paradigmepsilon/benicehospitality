import type { Tool, ToolSection } from "../_content/types";
import { LAST_REVIEWED } from "../_content/types";
import Checklist from "./Checklist";
import TrackableSteps from "./TrackableSteps";
import TemplateEditor from "./TemplateEditor";
import PrintButton from "./PrintButton";
import ValuationWorksheet from "./ValuationWorksheet";
import CommsLog from "./CommsLog";
import DowntimeTracker from "./DowntimeTracker";
import EconomicsWorksheet from "./EconomicsWorksheet";
import FleetTracker from "./FleetTracker";
import FleetKpiDashboard from "./FleetKpiDashboard";
import { IconClock, IconAlert, IconSparkle, IconDoc, IconDownload, IconArrowUpRight } from "./Icons";

/**
 * Renders a tool from its content data. One renderer for all 36 tools keeps
 * the product anatomy consistent: header with time estimate + last-reviewed
 * stamp, then sections in authored order. Templates render as editable
 * documents (TemplateEditor); interactive tools carry example mode.
 */

const CALLOUT = {
  warn: {
    box: "border-[#E19C63]/40 bg-[#E19C63]/[0.07]",
    title: "text-[#E19C63]",
    chip: "bg-[#E19C63]/15 text-[#E19C63]",
    icon: <IconAlert className="h-4 w-4" />,
  },
  gold: {
    box: "border-[#8BA5BE]/35 bg-[#8BA5BE]/[0.08]",
    title: "text-[#8BA5BE]",
    chip: "bg-[#8BA5BE]/15 text-[#8BA5BE]",
    icon: <IconSparkle className="h-4 w-4" />,
  },
  info: {
    box: "border-white/15 bg-white/[0.03]",
    title: "text-white",
    chip: "bg-white/10 text-white/70",
    icon: <IconDoc className="h-4 w-4" />,
  },
} as const;

function Section({
  s,
  toolSlug,
  claimId,
}: {
  s: ToolSection;
  toolSlug: string;
  claimId: number | null;
}) {
  switch (s.kind) {
    case "intro":
      return (
        <div className="space-y-3">
          {s.body.map((p, i) => (
            <p key={i} className="font-sans text-base leading-relaxed text-white/75">
              {p}
            </p>
          ))}
        </div>
      );

    case "steps":
      // A steps section with an id is trackable: checkable steps + nested
      // sub-tasks that sync and print as a real checklist. Without an id it
      // stays a purely informational numbered list.
      if (s.id) {
        return (
          <TrackableSteps
            syncKey={`${toolSlug}:${s.id}`}
            claimId={claimId}
            title={s.title}
            items={s.items}
          />
        );
      }
      return (
        <div>
          {s.title && (
            <h3 className="mb-4 font-sans text-lg font-bold text-white">{s.title}</h3>
          )}
          <ol className="space-y-3">
            {s.items.map((step, i) => (
              <li
                key={i}
                className="relative rounded-[1.3rem] border border-white/10 bg-white/[0.02] p-5 pl-[4.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]"
              >
                <span className="absolute left-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#E19C63]/12 font-display text-base font-semibold text-[#E19C63] ring-1 ring-[#E19C63]/30">
                  {i + 1}
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h4 className="font-sans font-bold text-white">{step.action}</h4>
                  {step.minutes && (
                    <span className="inline-flex items-center gap-1 font-sans text-xs text-[#8BA5BE]/80">
                      <IconClock className="h-3 w-3" />
                      {step.minutes}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-sans text-sm leading-relaxed text-white/70">
                  {step.detail}
                </p>
                {step.mistakes && step.mistakes.length > 0 && (
                  <div className="mt-3 rounded-xl border border-[#E19C63]/30 bg-[#E19C63]/[0.06] px-4 py-3">
                    <p className="flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#E19C63]">
                      <IconAlert className="h-3 w-3" />
                      Common mistakes
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {step.mistakes.map((m, j) => (
                        <li key={j} className="font-sans text-sm text-white/70">
                          · {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      );

    case "checklist":
      return (
        <Checklist
          syncKey={`${toolSlug}:${s.id}`}
          claimId={claimId}
          title={s.title}
          intro={s.intro}
          items={s.items}
        />
      );

    case "template":
      return (
        <TemplateEditor
          toolSlug={toolSlug}
          claimId={claimId}
          id={s.id}
          title={s.title}
          context={s.context}
          body={s.body}
        />
      );

    case "callout": {
      const c = CALLOUT[s.tone];
      return (
        <div className={`flex gap-4 rounded-[1.3rem] border p-5 md:p-6 ${c.box}`}>
          <span
            className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full ${c.chip}`}
          >
            {c.icon}
          </span>
          <div>
            <p className={`mb-1.5 font-sans font-bold ${c.title}`}>{s.title}</p>
            <p className="font-sans text-sm leading-relaxed text-white/75">{s.body}</p>
          </div>
        </div>
      );
    }

    case "prose":
      return (
        <div>
          {s.title && (
            <h3 className="mb-3 font-sans text-lg font-bold text-white">{s.title}</h3>
          )}
          <div className="space-y-3">
            {s.body.map((p, i) => (
              <p key={i} className="font-sans text-sm md:text-base leading-relaxed text-white/70">
                {p}
              </p>
            ))}
          </div>
        </div>
      );

    case "resource":
      return (
        <a
          href={`/api/claimproof/asset/${s.assetKey}`}
          className="group flex items-center gap-4 rounded-[1.3rem] border border-[#E19C63]/35 bg-[#E19C63]/[0.06] p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/70 hover:bg-[#E19C63]/[0.1] active:scale-[0.995] md:p-6"
        >
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#E19C63]/15 text-[#E19C63]">
            <IconDownload className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-sans font-bold text-white transition-colors duration-300 group-hover:text-[#E19C63]">
              {s.title}
            </span>
            {s.description && (
              <span className="mt-0.5 block font-sans text-sm leading-relaxed text-white/60">
                {s.description}
              </span>
            )}
            <span className="mt-1 block font-sans text-[11px] uppercase tracking-[0.14em] text-[#8BA5BE]">
              {s.formatLabel}
            </span>
          </span>
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#E19C63]/45 text-[#E19C63] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#E19C63] group-hover:text-[#27262E]">
            <IconArrowUpRight className="h-4 w-4" />
          </span>
        </a>
      );

    case "table":
      return (
        <div>
          {s.title && (
            <h3 className="mb-3 font-sans text-lg font-bold text-white">{s.title}</h3>
          )}
          <div className="overflow-x-auto rounded-[1.3rem] border border-white/12">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-white/15 bg-white/[0.03]">
                  {s.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider text-[#8BA5BE]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/8 last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={
                          "px-4 py-3 font-sans text-sm leading-relaxed " +
                          (j === 0 ? "font-semibold text-white" : "text-white/70")
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "interactive":
      switch (s.component) {
        case "valuation-worksheet":
          return <ValuationWorksheet claimId={claimId} />;
        case "comms-log":
          return <CommsLog claimId={claimId} />;
        case "downtime-tracker":
          return <DowntimeTracker claimId={claimId} />;
        case "economics":
          return <EconomicsWorksheet claimId={claimId} />;
        case "fleet-tracker":
          // Fleet tracker is workspace-scoped, not per-claim (it lists every
          // vehicle's claim), so it always syncs at the workspace level.
          return <FleetTracker />;
        case "fleet-kpi":
          // Also workspace-scoped: fleet-wide monthly numbers, not one claim.
          return <FleetKpiDashboard />;
      }
  }
}

export default function ToolRenderer({
  tool,
  packSlug,
  claimId,
}: {
  tool: Tool;
  packSlug: string;
  claimId: number | null;
}) {
  return (
    <article>
      <header className="mb-10">
        <h1 className="mb-3 font-display text-3xl font-semibold leading-tight text-white md:text-[2.6rem]">
          {tool.name}
        </h1>
        <p className="mb-4 max-w-2xl font-sans text-base text-white/60">{tool.tagline}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 font-sans text-xs tabular-nums text-[#8BA5BE]">
            <IconClock className="h-3.5 w-3.5" />
            {tool.minutes}
          </span>
          {tool.policySensitive && (
            <span className="rounded-full border border-[#8BA5BE]/40 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#8BA5BE]">
              Policy rules last reviewed {LAST_REVIEWED}
            </span>
          )}
          <PrintButton packSlug={packSlug} toolSlug={tool.slug} claimId={claimId} />
        </div>
      </header>
      <div className="space-y-8">
        {tool.sections.map((s, i) => (
          <Section key={i} s={s} toolSlug={tool.slug} claimId={claimId} />
        ))}
      </div>
    </article>
  );
}
