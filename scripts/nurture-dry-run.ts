/**
 * Render every step of every nurture sequence to HTML files for a visual
 * check, then fail if any output contains an em-dash, an en-dash, or a banned
 * word. No email is sent and no database row is touched.
 *
 *   node --env-file=.env.local --import tsx scripts/nurture-dry-run.ts [outDir]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { allSequences } from "../src/lib/nurture/registry";
import type { NurtureContext } from "../src/lib/nurture/types";

const outDir = process.argv[2] || join(process.cwd(), ".nurture-preview");
mkdirSync(outDir, { recursive: true });

const BANNED = ["game-changer", "unlock", "passive income", "secret", "hack", "revolutionary", "transform"];

const contexts: Array<[string, NurtureContext]> = [
  ["base", { email: "preview@example.com", baseUrl: "https://www.benicehospitality.com", unsubscribeUrl: "https://www.benicehospitality.com/api/unsubscribe?email=preview%40example.com&token=preview" }],
  ["atl-2cars", { email: "preview@example.com", firstName: "Jordan", metro: "Atlanta, GA", carsToday: "2-4", baseUrl: "https://www.benicehospitality.com", unsubscribeUrl: "https://www.benicehospitality.com/api/unsubscribe?email=preview%40example.com&token=preview" }],
];

let files = 0;
const problems: string[] = [];
for (const seq of allSequences()) {
  seq.steps.forEach((step, i) => {
    for (const [label, ctx] of contexts) {
      const html = step.html(ctx);
      const name = `${seq.key}-${String(i + 1).padStart(2, "0")}-${label}.html`;
      writeFileSync(join(outDir, name), html);
      files += 1;
      const text = `${step.subject}\n${step.preheader}\n${html}`;
      if (/[–—]/.test(text)) problems.push(`${name}: dash`);
      for (const w of BANNED) {
        if (text.toLowerCase().includes(w)) problems.push(`${name}: banned word "${w}"`);
      }
      if (!html.includes(ctx.unsubscribeUrl)) problems.push(`${name}: missing unsubscribe link`);
    }
  });
  console.log(`${seq.key}: ${seq.steps.length} steps, from ${seq.from()}`);
}
console.log(`\nRendered ${files} files to ${outDir}`);
if (problems.length) {
  console.error("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("Sweep clean: no dashes, no banned words, unsubscribe link on every email.");
