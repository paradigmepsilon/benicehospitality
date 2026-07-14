import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Tool, ToolSection, Step } from "../_content/types";

/**
 * Server-rendered PDF for a Claim Command Center tool. Produces a complete,
 * sectioned document: a cover header that identifies the claim, each section
 * titled, the host's saved checklist/step state shown as real checkboxes, and
 * their typed worksheet/log/template content laid into tables and fields.
 * Page breaks are controlled so cards never split mid-content, and every page
 * carries a claim-identifying footer with page numbers.
 *
 * react-pdf uses its own primitives (not HTML), so this is a parallel render
 * of the same content model the on-screen ToolRenderer uses — intentionally,
 * because a print document wants a different layout than an interactive one.
 */

// Brand-aligned but print-legible: dark ink on white, warm gold accents.
const INK = "#27262E";
const MUTE = "#5B5A63";
const FAINT = "#8A8992";
const GOLD = "#B9762F"; // darker than screen #E19C63 for paper contrast
const BLUE = "#5B7691";
const LINE = "#D8D6DC";
const BOXBG = "#F5F3F0";

const s = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
    lineHeight: 1.5,
  },
  // cover header
  coverBar: {
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 14,
    marginBottom: 20,
  },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 11, fontFamily: "Helvetica-Bold", color: INK, letterSpacing: 1 },
  brandSub: { fontSize: 7.5, color: FAINT, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 },
  docMeta: { fontSize: 8, color: FAINT, textAlign: "right" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: INK, marginTop: 14 },
  tagline: { fontSize: 10, color: MUTE, marginTop: 4 },
  // claim identity strip
  claimStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: BOXBG,
    borderRadius: 6,
    padding: 12,
    marginBottom: 22,
    marginTop: 14,
  },
  claimCell: { width: "25%", paddingRight: 8, marginBottom: 4 },
  claimLabel: { fontSize: 6.5, color: FAINT, textTransform: "uppercase", letterSpacing: 1 },
  claimValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginTop: 1 },
  // sections
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  para: { fontSize: 10, color: "#3A3941", marginBottom: 6 },
  // callout
  callout: {
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    backgroundColor: BOXBG,
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  calloutTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 3 },
  calloutBody: { fontSize: 9.5, color: "#3A3941" },
  // steps
  step: { flexDirection: "row", marginBottom: 12, paddingBottom: 4 },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    color: GOLD,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 3.5,
    marginRight: 10,
  },
  stepBody: { flex: 1 },
  stepAction: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK },
  stepMins: { fontSize: 8, color: BLUE, fontFamily: "Helvetica-Bold" },
  stepDetail: { fontSize: 9, color: MUTE, marginTop: 2 },
  // checkbox rows
  checkRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  box: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#9A99A1",
    borderRadius: 2,
    marginRight: 7,
    marginTop: 1.5,
    textAlign: "center",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },
  boxChecked: { backgroundColor: "#E7E4E0", borderColor: GOLD, color: GOLD },
  checkText: { flex: 1, fontSize: 9.5, color: "#3A3941" },
  checkTextDone: { color: FAINT, textDecoration: "line-through" },
  subList: { marginLeft: 30, marginTop: 3, marginBottom: 2 },
  mistakeBox: { marginLeft: 30, marginTop: 4, backgroundColor: "#FBF3EB", borderRadius: 4, padding: 7 },
  mistakeLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: GOLD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  mistakeItem: { fontSize: 8.5, color: MUTE },
  // tables
  table: { borderWidth: 0.5, borderColor: LINE, borderRadius: 4, marginBottom: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE },
  trLast: { flexDirection: "row" },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: BLUE, textTransform: "uppercase", letterSpacing: 0.5, padding: 6, backgroundColor: BOXBG },
  td: { fontSize: 9, color: "#3A3941", padding: 6 },
  tdStrong: { fontSize: 9, color: INK, fontFamily: "Helvetica-Bold", padding: 6 },
  // template
  tmplBox: { borderWidth: 0.5, borderColor: LINE, borderRadius: 4, padding: 12, backgroundColor: "#FCFBFA" },
  tmplText: { fontSize: 9.5, color: INK, lineHeight: 1.6 },
  tmplFill: { fontFamily: "Helvetica-Bold", color: GOLD },
  tmplBlank: { color: FAINT },
  // totals
  totalsRow: { flexDirection: "row", marginTop: 8, borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 8 },
  totalCell: { flex: 1 },
  totalLabel: { fontSize: 7, color: FAINT, textTransform: "uppercase", letterSpacing: 1 },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: INK },
  totalGold: { color: GOLD },
  empty: { fontSize: 9, color: FAINT, fontStyle: "italic", marginBottom: 6 },
  // footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: FAINT },
});

export interface ClaimIdentity {
  label?: string | null;
  vehicle?: string | null;
  trip?: string | null;
  stage?: string | null;
  discoveredOn?: string | null;
}

export interface DocMeta {
  packName: string;
  generatedOn: string; // preformatted date string
  workspaceName: string;
  version: string;
  lastReviewed: string;
}

/** All synced payloads for this tool+claim, keyed by tool sync-key. */
export type DataMap = Record<string, unknown>;

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function num(v: unknown): number {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function Box({ checked }: { checked: boolean }) {
  return <Text style={[s.box, checked ? s.boxChecked : {}]}>{checked ? "X" : " "}</Text>;
}

// ---- section renderers ----------------------------------------------------

function StepsBlock({
  title,
  items,
  state,
}: {
  title?: string;
  items: Step[];
  state: { steps?: Record<string, boolean>; subs?: Record<string, Record<string, boolean>> } | null;
}) {
  const steps = state?.steps ?? {};
  const subs = state?.subs ?? {};
  const isDone = (i: number) => {
    const step = items[i];
    if (step.subtasks && step.subtasks.length > 0) {
      const row = subs[i] ?? {};
      return !!steps[i] || step.subtasks.every((_, j) => row[j]);
    }
    return !!steps[i];
  };
  return (
    <View style={s.section} minPresenceAhead={54}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      {items.map((step, i) => (
        <View key={i} style={s.step} wrap={false}>
          <Text style={s.stepNum}>{i + 1}</Text>
          <View style={s.stepBody}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.stepAction}>
                {state ? (isDone(i) ? "[x] " : "[ ] ") : ""}
                {step.action}
              </Text>
              {step.minutes ? <Text style={s.stepMins}>{step.minutes}</Text> : null}
            </View>
            <Text style={s.stepDetail}>{step.detail}</Text>
            {step.subtasks && step.subtasks.length > 0 ? (
              <View style={{ marginTop: 4 }}>
                {step.subtasks.map((sub, j) => {
                  const done = !!(subs[i]?.[j]);
                  return (
                    <View key={j} style={s.checkRow}>
                      <Box checked={done} />
                      <Text style={[s.checkText, done ? s.checkTextDone : {}]}>{sub}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
            {step.mistakes && step.mistakes.length > 0 ? (
              <View style={{ marginTop: 4, backgroundColor: "#FBF3EB", borderRadius: 4, padding: 7 }}>
                <Text style={s.mistakeLabel}>Watch out</Text>
                {step.mistakes.map((m, k) => (
                  <Text key={k} style={s.mistakeItem}>
                    • {m}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function ChecklistBlock({
  title,
  intro,
  items,
  state,
}: {
  title?: string;
  intro?: string;
  items: string[];
  state: Record<string, boolean> | null;
}) {
  const done = state ?? {};
  return (
    <View style={s.section} wrap={false}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      {intro ? <Text style={s.para}>{intro}</Text> : null}
      {items.map((item, i) => {
        const isDone = !!done[i];
        return (
          <View key={i} style={s.checkRow}>
            <Box checked={isDone} />
            <Text style={[s.checkText, isDone ? s.checkTextDone : {}]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TemplateBlock({
  title,
  context,
  body,
  values,
}: {
  title: string;
  context?: string;
  body: string;
  values: Record<string, string> | null;
}) {
  const TOKEN_RE = /(\[[^\[\]\n]{1,70}\])/g;
  const segments = body.split(TOKEN_RE);
  const v = values ?? {};
  return (
    <View style={s.section} minPresenceAhead={54}>
      <Text style={s.sectionTitle}>{title}</Text>
      {context ? <Text style={s.para}>{context}</Text> : null}
      <View style={s.tmplBox}>
        <Text style={s.tmplText}>
          {segments.map((seg, i) => {
            const isToken = /^\[[^\[\]\n]{1,70}\]$/.test(seg);
            if (!isToken) return <Text key={i}>{seg}</Text>;
            const filled = (v[seg] ?? "").trim();
            if (filled) return <Text key={i} style={s.tmplFill}>{filled}</Text>;
            return <Text key={i} style={s.tmplBlank}>{seg}</Text>;
          })}
        </Text>
      </View>
    </View>
  );
}

function TableBlock({ title, headers, rows }: { title?: string; headers: string[]; rows: string[][] }) {
  return (
    <View style={s.section} wrap={false}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      <View style={s.table}>
        <View style={s.tr}>
          {headers.map((h, i) => (
            <Text key={i} style={[s.th, { flex: 1 }]}>{h}</Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={ri === rows.length - 1 ? s.trLast : s.tr}>
            {row.map((cell, ci) => (
              <Text key={ci} style={[ci === 0 ? s.tdStrong : s.td, { flex: 1 }]}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// Interactive worksheets: render the host's saved data as a table + totals.
function ValuationBlock({ rows }: { rows: Array<{ item: string; shop: string; appraisal: string }> }) {
  const filled = rows.filter((r) => r.item?.trim());
  const shopTotal = filled.reduce((a, r) => a + num(r.shop), 0);
  const apprTotal = filled.reduce((a, r) => a + num(r.appraisal), 0);
  const gap = shopTotal - apprTotal;
  return (
    <View style={s.section} minPresenceAhead={54}>
      <Text style={s.sectionTitle}>Valuation gap comparison</Text>
      {filled.length === 0 ? (
        <Text style={s.empty}>No line items entered yet.</Text>
      ) : (
        <>
          <View style={s.table}>
            <View style={s.tr}>
              <Text style={[s.th, { flex: 2 }]}>Line item</Text>
              <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Shop</Text>
              <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Appraisal</Text>
              <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Difference</Text>
            </View>
            {filled.map((r, i) => (
              <View key={i} style={i === filled.length - 1 ? s.trLast : s.tr}>
                <Text style={[s.tdStrong, { flex: 2 }]}>{r.item}</Text>
                <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{money(num(r.shop))}</Text>
                <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{money(num(r.appraisal))}</Text>
                <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{money(num(r.shop) - num(r.appraisal))}</Text>
              </View>
            ))}
          </View>
          <View style={s.totalsRow}>
            <View style={s.totalCell}><Text style={s.totalLabel}>Shop total</Text><Text style={s.totalValue}>{money(shopTotal)}</Text></View>
            <View style={s.totalCell}><Text style={s.totalLabel}>Appraisal total</Text><Text style={s.totalValue}>{money(apprTotal)}</Text></View>
            <View style={s.totalCell}><Text style={s.totalLabel}>Valuation gap</Text><Text style={[s.totalValue, s.totalGold]}>{money(gap)}</Text></View>
          </View>
        </>
      )}
    </View>
  );
}

function CommsBlock({ entries }: { entries: Array<Record<string, string>> }) {
  return (
    <View style={s.section} minPresenceAhead={54}>
      <Text style={s.sectionTitle}>Communication log</Text>
      {entries.length === 0 ? (
        <Text style={s.empty}>No log entries yet.</Text>
      ) : (
        <View style={s.table}>
          <View style={s.tr}>
            <Text style={[s.th, { flex: 1 }]}>Date</Text>
            <Text style={[s.th, { flex: 1 }]}>Who</Text>
            <Text style={[s.th, { flex: 1 }]}>Channel</Text>
            <Text style={[s.th, { flex: 2 }]}>Summary</Text>
            <Text style={[s.th, { flex: 1 }]}>Next follow-up</Text>
          </View>
          {entries.map((e, i) => (
            <View key={i} style={i === entries.length - 1 ? s.trLast : s.tr}>
              <Text style={[s.td, { flex: 1 }]}>{e.date || "—"}</Text>
              <Text style={[s.td, { flex: 1 }]}>{e.who || "—"}</Text>
              <Text style={[s.td, { flex: 1 }]}>{e.channel || "—"}</Text>
              <Text style={[s.td, { flex: 2 }]}>{e.summary || "—"}</Text>
              <Text style={[s.td, { flex: 1 }]}>{e.nextFollowUp || "—"}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function KpiBlock({ v }: { v: Record<string, string> }) {
  const g = (k: string) => v?.[k] ?? "";
  const claims = num(g("claims"));
  const trips = num(g("trips"));
  const recovered = num(g("recovered"));
  const absorbed = num(g("absorbed"));
  const closed = num(g("closedClaims"));
  const has = (k: string) => g(k).trim() !== "";
  const pctOf = (part: number, whole: number) =>
    whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

  const rows: Array<[string, string]> = [
    ["Claims per 100 trips", trips > 0 ? ((claims / trips) * 100).toFixed(1) : "—"],
    ["Filed inside the window", claims > 0 ? pctOf(num(g("filedInWindow")), claims) : "—"],
    ["Avg initial valuation gap", claims > 0 ? money(num(g("gapTotal")) / claims) : "—"],
    ["Requiring supplements", claims > 0 ? pctOf(num(g("supplements")), claims) : "—"],
    ["Recovery rate", recovered + absorbed > 0 ? pctOf(recovered, recovered + absorbed) : "—"],
    ["Avg idle days per claim", claims > 0 ? (num(g("idleDaysTotal")) / claims).toFixed(1) : "—"],
    ["Avg days to close", closed > 0 ? (num(g("closeDaysTotal")) / closed).toFixed(1) : "—"],
    ["Your avg response (days)", has("responseDays") ? num(g("responseDays")).toFixed(1) : "—"],
    ["Repeat failures", has("repeatFailures") ? String(num(g("repeatFailures"))) : "—"],
  ];
  const anyData = v && Object.values(v).some((x) => (x ?? "").trim() !== "");

  return (
    <View style={s.section} minPresenceAhead={54}>
      <Text style={s.sectionTitle}>Fleet claim KPIs</Text>
      {!anyData ? (
        <Text style={s.empty}>
          No figures entered yet. Enter this period&apos;s numbers in the on-screen dashboard.
        </Text>
      ) : (
        <View style={s.table}>
          <View style={s.tr}>
            <Text style={[s.th, { flex: 2 }]}>KPI</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Value</Text>
          </View>
          {rows.map((r, i) => (
            <View key={i} style={i === rows.length - 1 ? s.trLast : s.tr}>
              <Text style={[s.tdStrong, { flex: 2 }]}>{r[0]}</Text>
              <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{r[1]}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function GenericInteractiveBlock({ label }: { label: string }) {
  return (
    <View style={s.section} minPresenceAhead={54}>
      <Text style={s.sectionTitle}>{label}</Text>
      <Text style={s.empty}>
        This interactive worksheet is best worked on screen; its live figures export via its own CSV
        button. This printout captures the rest of the document.
      </Text>
    </View>
  );
}

function IntroBlock({ body }: { body: string[] }) {
  return (
    <View style={s.section} minPresenceAhead={54}>
      {body.map((p, i) => (
        <Text key={i} style={s.para}>{p}</Text>
      ))}
    </View>
  );
}

function ProseBlock({ title, body }: { title?: string; body: string[] }) {
  return (
    <View style={s.section} minPresenceAhead={54}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      {body.map((p, i) => (
        <Text key={i} style={s.para}>{p}</Text>
      ))}
    </View>
  );
}

function CalloutBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={s.callout} wrap={false}>
      <Text style={s.calloutTitle}>{title}</Text>
      <Text style={s.calloutBody}>{body}</Text>
    </View>
  );
}

function renderSection(
  section: ToolSection,
  toolSlug: string,
  data: DataMap,
  idx: number,
): React.ReactNode {
  switch (section.kind) {
    case "intro":
      return <IntroBlock key={idx} body={section.body} />;
    case "prose":
      return <ProseBlock key={idx} title={section.title} body={section.body} />;
    case "callout":
      return <CalloutBlock key={idx} title={section.title} body={section.body} />;
    case "steps": {
      const state = section.id ? (data[`steps:${toolSlug}:${section.id}`] as never) ?? null : null;
      return <StepsBlock key={idx} title={section.title} items={section.items} state={state} />;
    }
    case "checklist": {
      const state = (data[`check:${toolSlug}:${section.id}`] as Record<string, boolean>) ?? null;
      return (
        <ChecklistBlock
          key={idx}
          title={section.title}
          intro={section.intro}
          items={section.items}
          state={state}
        />
      );
    }
    case "template": {
      const values = (data[`${toolSlug}:${section.id}`] as Record<string, string>) ?? null;
      return (
        <TemplateBlock
          key={idx}
          title={section.title}
          context={section.context}
          body={section.body}
          values={values}
        />
      );
    }
    case "table":
      return <TableBlock key={idx} title={section.title} headers={section.headers} rows={section.rows} />;
    case "resource":
      return (
        <View key={idx} style={s.section} minPresenceAhead={54}>
          <Text style={s.sectionTitle}>{section.title}</Text>
          <Text style={s.para}>
            {(section.description ? section.description + " " : "") +
              `Download it from the tool in your Command Center (${section.formatLabel}).`}
          </Text>
        </View>
      );
    case "interactive":
      switch (section.component) {
        case "valuation-worksheet": {
          // loadToolData returns {} (not []) when nothing is saved, so guard the
          // array type before ValuationBlock calls rows.filter().
          const raw = data["valuation-rows"];
          const rows = Array.isArray(raw)
            ? (raw as Array<{ item: string; shop: string; appraisal: string }>)
            : [];
          return <ValuationBlock key={idx} rows={rows} />;
        }
        case "comms-log": {
          const raw = data["comms-log"];
          const entries = Array.isArray(raw) ? (raw as Array<Record<string, string>>) : [];
          return <CommsBlock key={idx} entries={entries} />;
        }
        case "downtime-tracker":
          return <GenericInteractiveBlock key={idx} label="Downtime cost tracker" />;
        case "economics":
          return <GenericInteractiveBlock key={idx} label="Claim economics worksheet" />;
        case "fleet-tracker":
          return <GenericInteractiveBlock key={idx} label="Fleet claim tracker" />;
        case "fleet-kpi": {
          const kpi = (data["fleet-kpi"] as Record<string, string>) ?? {};
          return <KpiBlock key={idx} v={kpi} />;
        }
      }
  }
}

export function ClaimDocument({
  tool,
  claim,
  meta,
  data,
}: {
  tool: Tool;
  claim: ClaimIdentity | null;
  meta: DocMeta;
  data: DataMap;
}) {
  const footerLabel = claim?.label || claim?.vehicle || "Claim Command Center";
  return (
    <Document
      title={`${tool.name} — Claim Proof`}
      author="Be Nice Hospitality Group"
      subject="Claim Proof Command Center"
    >
      <Page size="LETTER" style={s.page} wrap>
        {/* cover header */}
        <View style={s.coverBar} fixed={false}>
          <View style={s.brandRow}>
            <View>
              <Text style={s.brand}>CLAIM PROOF</Text>
              <Text style={s.brandSub}>Command Center · {meta.packName}</Text>
            </View>
            <Text style={s.docMeta}>
              Generated {meta.generatedOn}
              {"\n"}
              {meta.workspaceName}
            </Text>
          </View>
          <Text style={s.title}>{tool.name}</Text>
          <Text style={s.tagline}>{tool.tagline}</Text>
        </View>

        {/* claim identity strip */}
        {claim ? (
          <View style={s.claimStrip}>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Claim</Text>
              <Text style={s.claimValue}>{claim.label || "—"}</Text>
            </View>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Vehicle</Text>
              <Text style={s.claimValue}>{claim.vehicle || "—"}</Text>
            </View>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Trip</Text>
              <Text style={s.claimValue}>{claim.trip || "—"}</Text>
            </View>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Stage</Text>
              <Text style={s.claimValue}>{claim.stage || "—"}</Text>
            </View>
          </View>
        ) : null}

        {/* sections */}
        {tool.sections.map((section, i) => renderSection(section, tool.slug, data, i))}

        {/* footer on every page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {footerLabel} · Claim Proof v{meta.version} · Turo rules last reviewed {meta.lastReviewed}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

        {/* disclaimer, end of doc */}
        <View style={{ marginTop: 18, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: LINE }}>
          <Text style={{ fontSize: 7.5, color: FAINT }}>
            Operational guidance, not legal, insurance, or claims-adjusting advice. Not affiliated
            with Turo Inc. Confirm current platform rules before you rely on any timing or eligibility
            detail in this document.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** One tool inside a package export: its content + the pack it belongs to. */
export interface PackageEntry {
  tool: Tool;
  packName: string;
  data: DataMap;
}

/**
 * Whole-package export: every tool the buyer's tier unlocks, in one document.
 * A cover page (package name + contents), then one fresh page per tool. Page
 * numbers run continuously across the whole file. Each tool renders from its
 * OWN DataMap (entry.data), so global interactive keys never collide between
 * tools.
 */
export function ClaimPackageDocument({
  packageName,
  entries,
  claim,
  meta,
}: {
  packageName: string;
  entries: PackageEntry[];
  claim: ClaimIdentity | null;
  meta: Omit<DocMeta, "packName">;
}) {
  const footerLabel = claim?.label || claim?.vehicle || packageName;
  const footer = (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        {footerLabel} · Claim Proof v{meta.version} · Turo rules last reviewed {meta.lastReviewed}
      </Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
  return (
    <Document
      title={`${packageName} — Claim Proof`}
      author="Be Nice Hospitality Group"
      subject="Claim Proof Command Center"
    >
      {/* cover + contents */}
      <Page size="LETTER" style={s.page} wrap>
        <View style={s.coverBar}>
          <View style={s.brandRow}>
            <View>
              <Text style={s.brand}>CLAIM PROOF</Text>
              <Text style={s.brandSub}>Command Center</Text>
            </View>
            <Text style={s.docMeta}>
              Generated {meta.generatedOn}
              {"\n"}
              {meta.workspaceName}
            </Text>
          </View>
          <Text style={s.title}>{packageName}</Text>
          <Text style={s.tagline}>
            Your complete working claim file. Every tool in your plan, print-ready.
          </Text>
        </View>

        {claim ? (
          <View style={s.claimStrip}>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Claim</Text>
              <Text style={s.claimValue}>{claim.label || "—"}</Text>
            </View>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Vehicle</Text>
              <Text style={s.claimValue}>{claim.vehicle || "—"}</Text>
            </View>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Trip</Text>
              <Text style={s.claimValue}>{claim.trip || "—"}</Text>
            </View>
            <View style={s.claimCell}>
              <Text style={s.claimLabel}>Stage</Text>
              <Text style={s.claimValue}>{claim.stage || "—"}</Text>
            </View>
          </View>
        ) : null}

        <Text style={s.sectionTitle}>What is inside</Text>
        {entries.map((e, i) => (
          <View key={i} style={s.checkRow}>
            <Text style={[s.stepMins, { width: 22 }]}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Text style={s.checkText}>
              {e.tool.name}
              <Text style={{ color: FAINT }}> · {e.packName}</Text>
            </Text>
          </View>
        ))}

        {footer}
      </Page>

      {/* one page per tool */}
      {entries.map((e, ti) => (
        <Page key={ti} size="LETTER" style={s.page} wrap>
          <View style={s.coverBar}>
            <View style={s.brandRow}>
              <View>
                <Text style={s.brand}>CLAIM PROOF</Text>
                <Text style={s.brandSub}>{e.packName}</Text>
              </View>
              <Text style={s.docMeta}>{packageName}</Text>
            </View>
            <Text style={s.title}>{e.tool.name}</Text>
            <Text style={s.tagline}>{e.tool.tagline}</Text>
          </View>
          {e.tool.sections.map((section, i) =>
            renderSection(section, e.tool.slug, e.data, i),
          )}
          {footer}
        </Page>
      ))}
    </Document>
  );
}
