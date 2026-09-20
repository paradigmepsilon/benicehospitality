import type { EngagementRow } from "./engagements";
import type { StageKey } from "./journey";

export interface EmailTemplate {
  id: string;
  title: string;
  stage: StageKey | string;
  trigger: string;
  sender: string;
  attach: string | null;
  subject: string;
  body: string;
}

/**
 * Parse templates/sales/email_pack.md. Each email is a "## E<n> · title"
 * section with bullet metadata and the body as a blockquote. The Markdown file
 * stays the one place the wording lives, so Della edits copy there, not here.
 */
export function parseEmailPack(md: string): EmailTemplate[] {
  const out: EmailTemplate[] = [];
  for (const section of md.split(/^## /m).slice(1)) {
    const head = section.match(/^(E\d+[a-z]?) · (.+)$/m);
    if (!head) continue;
    const meta = (label: string) =>
      section.match(new RegExp(`^- \\*\\*${label}:\\*\\*\\s*(.+)$`, "m"))?.[1].trim() ?? "";
    const subject = meta("Subject");
    const body = section
      .split("\n")
      .filter((l) => l.startsWith(">"))
      .map((l) => l.replace(/^> ?/, ""))
      .join("\n")
      .trim();
    if (!subject || !body) continue; // pointer entries with no sendable copy
    out.push({
      id: head[1],
      title: head[2].trim(),
      stage: meta("Stage").replace(/`/g, "").split(/[ ,]/)[0],
      trigger: meta("Trigger"),
      sender: meta("Sender"),
      attach: meta("Attach") || null,
      subject,
      body,
    });
  }
  return out;
}

function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

/**
 * Fill the slots the tracker can answer. Everything else stays as a visible
 * [[slot]] on purpose: the send route refuses a message that still has one,
 * so a half-merged email cannot reach a client.
 */
export function mergeSlots(text: string, e: Pick<EngagementRow, "clientName" | "propertyLabel" | "propertyCity" | "creditExpiresAt">): string {
  const first = e.clientName.trim().split(/\s+/)[0];
  const place = e.propertyLabel || e.propertyCity;
  const fills: Record<string, string | null> = {
    "first name": first || null,
    "property street or city": place,
    "house name or street": place,
    "credit expiry date": e.creditExpiresAt ? longDate(e.creditExpiresAt) : null,
  };
  return text.replace(/\[\[([^\]]+)\]\]/g, (whole, name: string) => fills[name.trim()] ?? whole);
}

export function unfilledSlots(text: string): string[] {
  return [...new Set(text.match(/\[\[[^\]]+\]\]/g) ?? [])];
}
