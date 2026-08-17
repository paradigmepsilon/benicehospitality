"use client";

import { useEffect, useMemo, useState } from "react";
import { Shuffle, RefreshCw } from "lucide-react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import {
  SectionTabStrip,
  TabPanel,
  TabPager,
  scrollToPanel,
  panelAnchor,
  type TabDef,
} from "@/components/resources/SectionTabs";
import { getResourceTool } from "@/lib/resources/registry";
import {
  CALENDAR_WEEKS,
  CALENDAR_ALL_DAYS,
  SETUP_BLOCKS,
  type CalendarDay,
  type CalendarWeek,
} from "@/lib/resources/social-posting-calendar/config";

const SLUG = "social-posting-calendar";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "spc";
const SETUP_TAB_ID = "setup";

// Two operators who download this in the same week should not post identical
// captions, so each day carries three angles and the tool picks one per day
// from a seed kept in the visitor's browser. `bumps` is the per-day re-roll
// counter, added to the hashed index so re-rolling one day never disturbs the
// other twenty-nine.
interface CalendarState {
  /** 0 means "not seeded yet" — the effect below assigns a real one after hydration. */
  seed: number;
  bumps: Record<string, number>;
}

const INITIAL_STATE: CalendarState = { seed: 0, bumps: {} };

/**
 * Deterministic day → variant index. A hash rather than a sequence so adjacent
 * days do not march through the variants in lockstep (all day-1s on angle A,
 * all day-2s on angle B), which is exactly the sameness the shuffle exists to
 * break. Same seed always yields the same month, so Print and CSV match screen.
 */
function variantIndex(
  seed: number,
  day: number,
  count: number,
  bump: number,
): number {
  let h = (seed ^ Math.imul(day, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h + bump) % count;
}

/** The full day brief as plain text, for "Copy brief" and the CSV. */
function briefText(d: CalendarDay, hook: string, caption: string): string {
  return [
    `DAY ${d.day} — ${d.title}`,
    `Platform: ${d.platform}`,
    `Cross-post: ${d.crossPost}`,
    `Format: ${d.format}`,
    `Best time: ${d.bestTime}`,
    `Goal: ${d.goal}`,
    "",
    `HOOK: ${hook}`,
    "",
    "CAPTION:",
    caption,
    "",
    "SHOOT / BUILD:",
    ...d.build.map((b) => `- ${b}`),
    "",
    `CTA: ${d.cta}`,
    `Hashtags: ${d.hashtags}`,
  ].join("\n");
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45 sm:w-28 sm:shrink-0 sm:pt-0.5">
        {label}
      </span>
      <span className="font-sans text-sm text-near-black leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function DayCard({
  day,
  theme,
  hook,
  caption,
  variantNo,
  variantCount,
  onReroll,
}: {
  day: CalendarDay;
  theme: string;
  hook: string;
  caption: string;
  variantNo: number;
  variantCount: number;
  onReroll: () => void;
}) {
  return (
    <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6 break-inside-avoid">
      <div className="flex items-start gap-4 mb-4">
        <span
          aria-hidden
          className="font-display text-2xl font-semibold leading-none text-warm-gold tabular-nums shrink-0 pt-0.5"
        >
          {String(day.day).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-near-black">
            <span className="sr-only">Day {day.day}: </span>
            {day.title}
          </h3>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-primary-green mt-0.5">
            {theme}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <MetaRow label="Platform" value={day.platform} />
        <MetaRow label="Cross-post" value={day.crossPost} />
        <MetaRow label="Format" value={day.format} />
        <MetaRow label="Best time" value={day.bestTime} />
      </div>

      <div className="border-t border-light-gray/70 pt-4 mb-4">
        <p className="font-sans text-sm text-charcoal/80 leading-relaxed">
          <span className="font-semibold text-near-black">Why this post: </span>
          {day.goal}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45">
            Angle {variantNo} of {variantCount}
          </p>
          <div className="no-print flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReroll}
              title="Swap this day for a different angle"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-charcoal/70 hover:text-primary-green px-2 py-1 rounded-md cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Re-roll
            </button>
            <CopyButton text={caption} label="Copy caption" />
          </div>
        </div>

        <p className="font-sans text-sm font-semibold text-near-black leading-relaxed mb-2">
          Hook: {hook}
        </p>

        <div className="bg-off-white border border-light-gray/70 rounded-md p-4">
          <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
            {caption}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45 mb-2">
          Shoot / build
        </p>
        <ul className="space-y-1.5">
          {day.build.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-2 font-sans text-sm text-charcoal/85 leading-relaxed"
            >
              <span className="text-warm-gold mt-0.5 shrink-0">&bull;</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-light-gray/70 pt-4 space-y-1.5">
        <MetaRow label="Call to action" value={day.cta} />
        <MetaRow label="Hashtags" value={day.hashtags} />
      </div>

      <div className="no-print mt-4">
        <CopyButton
          text={briefText(day, hook, caption)}
          label="Copy the whole brief"
        />
      </div>
    </div>
  );
}

function WeekPanel({
  week,
  seed,
  bumps,
  onReroll,
}: {
  week: CalendarWeek;
  seed: number;
  bumps: Record<string, number>;
  onReroll: (day: number) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-near-black">
        {week.heading}
      </h2>
      <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
        {week.intro}
      </p>
      <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5">
        <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
          {week.success}
        </p>
      </div>

      <div className="space-y-4">
        {week.days.map((d) => {
          const i = variantIndex(
            seed,
            d.day,
            d.variants.length,
            bumps[String(d.day)] ?? 0,
          );
          const v = d.variants[i];
          return (
            <DayCard
              key={d.day}
              day={d}
              theme={week.theme}
              hook={v.hook}
              caption={v.caption}
              variantNo={i + 1}
              variantCount={d.variants.length}
              onReroll={() => onReroll(d.day)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SetupPanel() {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-near-black">
        Before you post
      </h2>
      <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
        Thirty minutes of setup makes the next thirty days work. Do this once,
        then never think about it again.
      </p>

      <div className="space-y-4">
        {SETUP_BLOCKS.map((b, i) => (
          <div
            key={i}
            className="bg-white border border-light-gray rounded-lg p-5 sm:p-6 break-inside-avoid"
          >
            <h3 className="font-display text-lg font-semibold text-near-black mb-2">
              {b.heading}
            </h3>
            {b.body && (
              <p className="font-sans text-sm text-charcoal/80 leading-relaxed">
                {b.body}
              </p>
            )}
            {b.bullets && (
              <ul className="mt-3 space-y-1.5">
                {b.bullets.map((x, xi) => (
                  <li
                    key={xi}
                    className="flex items-start gap-2 font-sans text-sm text-charcoal/85 leading-relaxed"
                  >
                    <span className="text-warm-gold mt-0.5 shrink-0">
                      &bull;
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            )}
            {b.table && (
              <div className="mt-3 overflow-x-auto border border-light-gray rounded-lg">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-off-white">
                      {b.table.head.map((h, hi) => (
                        <th
                          key={hi}
                          className="text-left font-sans text-xs font-semibold px-3 py-2.5 border-b border-light-gray text-charcoal/70 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.table.rows.map((r, ri) => (
                      <tr key={ri} className="hover:bg-off-white/50">
                        {r.map((c, ci) => (
                          <td
                            key={ci}
                            className={`px-3 py-2.5 border-b border-light-gray/70 align-top text-near-black ${
                              ci === 0 ? "font-medium whitespace-nowrap" : ""
                            }`}
                          >
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SocialCalendarTool() {
  // sync is off by design: this is a free-email tool with no account-backed
  // state (`persistence: "none"` in the registry). The seed only needs to
  // survive a refresh so a printed month matches the one on screen.
  const { state, setState, hydrated } = useResourceTool<CalendarState>(
    SLUG,
    INITIAL_STATE,
    { sync: false },
  );

  // Seed on first visit rather than at render time, so the server HTML and the
  // first client render agree (both use seed 0) and there is no hydration
  // mismatch. Everything reshuffles the instant this lands.
  useEffect(() => {
    if (!hydrated || state.seed !== 0) return;
    setState((s) => ({
      ...s,
      seed: Math.floor(Math.random() * 0x7fffffff) + 1,
    }));
  }, [hydrated, state.seed, setState]);

  const [activeSection, setActiveSection] = useState<string>(SETUP_TAB_ID);

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  function shuffleAll() {
    // Clearing the bumps too, so a fresh month is genuinely fresh rather than
    // carrying twenty-nine old re-rolls on top of the new seed.
    setState({ seed: Math.floor(Math.random() * 0x7fffffff) + 1, bumps: {} });
  }

  function rerollDay(day: number) {
    setState((s) => ({
      ...s,
      bumps: { ...s.bumps, [String(day)]: (s.bumps[String(day)] ?? 0) + 1 },
    }));
  }

  const tabs: TabDef[] = useMemo(
    () => [
      { id: SETUP_TAB_ID, label: "Before you post", shortLabel: "Setup" },
      ...CALENDAR_WEEKS.map((w) => ({
        id: w.id,
        label: w.heading,
        shortLabel: w.shortLabel,
        badge: `${w.days.length} days`,
      })),
    ],
    [],
  );

  function exportCsv() {
    const rows: string[][] = [
      [
        "Day",
        "Post",
        "Theme",
        "Platform",
        "Cross-post",
        "Format",
        "Best time",
        "Goal",
        "Hook",
        "Caption",
        "Shoot / build",
        "Call to action",
        "Hashtags",
      ],
    ];
    for (const w of CALENDAR_WEEKS) {
      for (const d of w.days) {
        const v =
          d.variants[
            variantIndex(
              state.seed,
              d.day,
              d.variants.length,
              state.bumps[String(d.day)] ?? 0,
            )
          ];
        rows.push([
          String(d.day),
          d.title,
          w.theme,
          d.platform,
          d.crossPost,
          d.format,
          d.bestTime,
          d.goal,
          v.hook,
          v.caption,
          d.build.join("\n"),
          d.cta,
          d.hashtags,
        ]);
      }
    }
    downloadCsv(
      "bnhg-30-day-social-posting-calendar.csv",
      buildCsv(TOOL_NAME, rows),
    );
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      actionsRight={
        <button
          type="button"
          onClick={shuffleAll}
          title="Swap every day for a different angle"
          className="inline-flex items-center gap-2 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md cursor-pointer transition-colors"
        >
          <Shuffle className="w-4 h-4 shrink-0" aria-hidden />
          Shuffle all {CALENDAR_ALL_DAYS.length} days
        </button>
      }
      footerNote={
        <>
          Your shuffle is saved in this browser, so the month you print matches
          the month on screen. Export to CSV to load it straight into your
          scheduler.
        </>
      }
    >
      <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5 mb-6">
        <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
          Every caption is written and ready to post. Replace the bracketed
          tokens first — [City], [Neighborhood], [$RENT], [DATE], [LINK] — then
          copy it straight into your scheduler. Each day has{" "}
          {CALENDAR_ALL_DAYS[0].variants.length} interchangeable angles: re-roll
          a single day, or shuffle the whole month, so your calendar is not the
          same one every other operator downloaded this week.
        </p>
      </div>

      <SectionTabStrip
        tabs={tabs}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel={`${TOOL_NAME} sections`}
        gridClassName="grid-cols-3 sm:grid-cols-6"
      />

      {/* Every panel stays mounted so Print / Save as PDF emits all 30 days. */}
      <div className="space-y-10">
        <TabPanel
          anchorId={panelAnchor(ANCHOR_PREFIX, SETUP_TAB_ID)}
          current={activeSection === SETUP_TAB_ID}
        >
          <SetupPanel />
        </TabPanel>

        {CALENDAR_WEEKS.map((w) => (
          <TabPanel
            key={w.id}
            anchorId={panelAnchor(ANCHOR_PREFIX, w.id)}
            current={activeSection === w.id}
          >
            <WeekPanel
              week={w}
              seed={state.seed}
              bumps={state.bumps}
              onReroll={rerollDay}
            />
          </TabPanel>
        ))}
      </div>

      <div className="mt-6">
        <TabPager tabs={tabs} activeId={activeSection} onSelect={goTo} />
      </div>
    </ResourceToolShell>
  );
}
