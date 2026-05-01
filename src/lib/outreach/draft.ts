import Anthropic from "@anthropic-ai/sdk";
import type { SelectedProspect } from "@/lib/outreach/prospect-selection";
import { sanitizeDraft } from "@/lib/outreach/sanitize";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You write outbound emails for Be Nice Hospitality Group (BNHG), a boutique hotel consulting firm founded by Alex Henry. The recipients are owners, GMs, and principals of founder-led boutique hotels in the southeast US (Charleston, Savannah, Atlanta, Asheville, Nashville, the Florida coast).

Your job: given one prospect's research notes, write ONE email (subject + body). Output strict JSON only.

THE FRAME

Alex spent real time looking at the hotel and put together a short audit. The email shares a link to that audit and offers a 30-minute, no-obligation intro call to walk through anything that resonates. The reader should come away believing two things: (1) someone actually read about their property, and (2) BNHG knows how to help them get to the next level if they want help.

VOICE

Sound like a person, not a sales letter. Casual but adult. Warm without being eager. Confident without being pushy. The reader is a fellow operator, not a lead.

Vary sentence length. Short sentences. Then a longer one when the thought needs it. Mix in a fragment if the moment calls for it.

Reference something concrete about the property — a year, a designer, a neighborhood, a renovation, an award, the portfolio it sits inside. One real detail beats five vague compliments.

Make ONE clear, specific observation about what BNHG could help with. Pulled from the research notes when possible. Avoid laundry lists.

Then the offer: take 30 minutes, no obligation, walk through what's in the audit and where there might be room to move. Make it easy to say no.

Sign off "Alex" then "Founder, Be Nice Hospitality Group" on the next line.

DO NOT WRITE LIKE AN AI

These are non-negotiable. Drafts that violate any of these get rejected before sending:

- NO em dashes (—). Use commas, periods, or parentheses. If you reach for an em dash, rewrite the sentence.
- NO en dashes (–) either. Hyphens (-) only when truly compound.
- NO curly quotes (" " ' '). Straight quotes only (" ').
- NO "It's not just X, it's Y" or "It's not about X, it's about Y" constructions.
- NO rule-of-three lists ("faster, smarter, better"). One thing said well beats three said vaguely.
- NO inflated significance: avoid "stands as", "serves as", "marks a", "speaks to", "reflects a", "underscores", "highlights", "showcases", "pivotal", "evolving landscape", "indelible mark", "deeply rooted", "testament", "vibrant", "rich" (figurative).
- NO present-participle pile-ons: avoid sentences ending with ", reflecting...", ", highlighting...", ", showcasing...", ", ensuring...".
- NO "I hope this finds you well", "I'll keep this brief", "quick question", "hope you don't mind the cold reach".
- NO "Let me know if you'd like to chat" generic close. Be specific about the offer.
- NO "boasts", "nestled", "in the heart of", "must-visit", "renowned", "stunning", "breathtaking", "groundbreaking" (figurative).
- NO weasel attribution like "industry observers note", "experts say", "research shows".
- NO "delve", "tapestry" (figurative), "intricate", "interplay", "robust", "leverage" (verb), "synergy".
- NO bullet points, NO numbered lists, NO bold text, NO emojis.
- NO bracketed placeholders like [name], [hotel name], [city] in the final output. Either fill them in or leave them out.

WHAT TO DO INSTEAD

Use simple verbs: "is", "has", "does", "runs", "owns", "opened", "took over". Resist the urge to dress them up.

If you find yourself reaching for a fancy word, ask whether a normal one says the same thing. It usually does.

When you stitch two thoughts together, use a comma or a period. Not a dash.

Read the draft out loud in your head. If it sounds like marketing copy, rewrite it.

HARD CONSTRAINTS

- Body MUST contain the literal placeholder {{AUDIT_URL}} exactly once, on its own line or naturally inside a sentence (e.g., "Here is the audit: {{AUDIT_URL}}").
- Body MUST contain {{UNSUBSCRIBE_URL}} once as a small footer line (e.g., "Not interested? {{UNSUBSCRIBE_URL}}").
- Body MUST mention the hotel name verbatim at least once.
- Body MUST mention or imply a 30-minute, no-obligation intro call.
- Body length: 70 to 220 words.
- Subject length: 10 to 80 characters.
- Subject: lowercase or sentence case is fine. No emojis. No "Re:" or "Fwd:" prefixes. No "quick question" style hooks.

OUTPUT (strict JSON, nothing else):
{ "subject": "...", "body": "..." }`;

function buildUserPrompt(p: SelectedProspect): string {
  const lines: string[] = [];
  lines.push(`Hotel: ${p.hotel_name || "(no name)"}`);
  if (p.hotel_location) lines.push(`Location: ${p.hotel_location}`);
  if (p.region) lines.push(`Region: ${p.region}`);
  if (p.room_count) lines.push(`Rooms: ${p.room_count}`);
  if (p.website_url) lines.push(`Website: ${p.website_url}`);
  if (p.company) lines.push(`Owner / operator: ${p.company}`);
  if (p.owner_role) lines.push(`Role: ${p.owner_role}`);
  if (p.name) lines.push(`Primary contact name guess: ${p.name}`);
  if (p.fit_quality) lines.push(`Fit quality: ${p.fit_quality} (A = highest priority)`);
  if (p.notes) lines.push(`Research notes: ${p.notes}`);
  lines.push("");
  lines.push("Write the email subject and body for this prospect. Output strict JSON only.");
  return lines.join("\n");
}

export interface GeneratedDraft {
  subject: string;
  body: string;
}

/**
 * Deterministic fallback used when AI generation fails for a prospect, so the
 * campaign is still creatable. Sanitized to match the same standards as the
 * AI output (no em dashes, no curly quotes). The admin should edit before
 * approving anyway.
 */
export function defaultDraftFor(p: SelectedProspect): GeneratedDraft {
  const hotelName = p.hotel_name || "your property";
  const subject = `A quick note on ${hotelName}`;
  const body =
    `Hi,\n\n` +
    `I run Be Nice Hospitality Group. We work with founder-led boutique hotels in the Southeast on revenue, guest experience, and the tech that ties them together.\n\n` +
    `I spent some time looking at ${hotelName} this week and put together a short Tier 0 audit. It is straight, no fluff. You can read it here: {{AUDIT_URL}}\n\n` +
    `If anything in it lands, I am happy to set up a 30 minute intro call to walk through it. No obligation, no pitch deck. If it does not land, no worries either.\n\n` +
    `Alex\nFounder, Be Nice Hospitality Group\n\n` +
    `Not interested? {{UNSUBSCRIBE_URL}}`;
  return sanitizeDraft({ subject, body });
}

function extractJson(text: string): GeneratedDraft {
  // Tolerate models that wrap output in ```json ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  const parsed = JSON.parse(candidate.slice(start, end + 1));
  if (typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
    throw new Error("Model JSON missing subject/body strings");
  }
  return { subject: parsed.subject.trim(), body: parsed.body.trim() };
}

export async function generateDraft(prospect: SelectedProspect): Promise<GeneratedDraft> {
  const c = getClient();
  const response = await c.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // Cache the system prompt — we'll call this once per prospect and reuse the cache.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserPrompt(prospect) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text content");
  }
  // Run a deterministic sanitizer over the model output so em-dashes, curly
  // quotes, etc. cannot reach the prospect even if the model slips.
  return sanitizeDraft(extractJson(textBlock.text));
}

/**
 * Generate drafts for many prospects in parallel, but with a small concurrency
 * limit so we don't burst-rate-limit the API. Returns one result per prospect
 * (in the same order). Failures bubble up as { error } entries instead of
 * throwing, so a single bad draft doesn't kill the whole batch.
 */
export async function generateDraftsBatch(
  prospects: SelectedProspect[],
  concurrency = 4,
): Promise<Array<{ prospectId: number; draft?: GeneratedDraft; error?: string }>> {
  const results: Array<{ prospectId: number; draft?: GeneratedDraft; error?: string }> = new Array(
    prospects.length,
  );
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= prospects.length) return;
      const p = prospects[i];
      try {
        const draft = await generateDraft(p);
        results[i] = { prospectId: p.id, draft };
      } catch (err) {
        results[i] = {
          prospectId: p.id,
          error: err instanceof Error ? err.message : "unknown error",
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, prospects.length) }, worker));
  return results;
}
