/* Car Rental Riches: ensure the course_modules rows for Modules 1 to 12 exist
 * (positions 10..120) so import-lesson.ts can attach lessons. Idempotent. */
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const MODULES: Array<[string, string, string, string]> = [
  ["the-business-nobody-explains", "The Business Nobody Explains", "Module 1", "What changed in 2026, how the rental giants actually make money, which of the four operator sizes you are, and an honest answer to whether this business is for you."],
  ["business-foundation", "Business Foundation", "Module 2", "Entity, EIN, banking, per-car books, the insurance reality up front, and a startup budget with a reserve line."],
  ["market-analysis-vehicle-underwriting", "Market Analysis & Vehicle Underwriting", "Module 3", "Six demand segments, the thirty-minute scan, saturation signals, the 30-point scorecard, and the P&L three ways."],
  ["acquisition-financing", "Acquisition & Financing", "Module 4", "Buy like a fleet manager: eligibility, the value curve, auctions and dealer licenses, cash cars, financing tests, and fleet lines."],
  ["storefront-pricing-lead-time", "Storefront, Pricing & the Lead-Time Game", "Module 5", "A listing that books itself, pricing from your floor, the 2026 marketplace levers, and the direct rate card."],
  ["systems-from-car-one", "Systems From Car One", "Module 6", "Turnover as product, cleaning as hospitality, maintenance as survival, the stack that survives a platform, and the two-hour week."],
  ["insurance-claims-fraud-theft", "Insurance, Claims, Fraud & Theft", "Module 7", "The coverage layer map, the photo protocol, claim day, the direct-rental fraud stack, telematics, and chargeback defense."],
  ["guest-experience-five-star-defense", "Guest Experience & Five-Star Defense", "Module 8", "Cadence, templates, de-escalation, review recovery, and cancellation policy for guests, direct renters, and weekly drivers."],
  ["the-money-module", "The Money Module", "Module 9", "Per-car P&L, the three numbers, depreciation modeled, the 90-day test, and taxes at educational altitude."],
  ["the-channels", "The Channels the Giants Don't Want You In", "Module 10", "Weekly gig rentals, insurance replacement, corporate accounts, local search, and giving every car a job."],
  ["direct-booking-floor-stack", "The Direct-Booking Floor & Stack", "Module 11", "Platform risk named, graduation criteria, the legal and insurance floor, the five-step stack, and the 90-day direct pilot."],
  ["from-car-2-to-fifty", "From Car 2 to Fifty, and the 90-Day Launch Plan", "Module 12", "Car 2 readiness, what breaks at three to five, the professional and small-agency stages, the exits, and the channel-agnostic 90-day plan."],
];
async function main() {
  const course = (await sql`SELECT id FROM courses WHERE slug = 'car-rental-riches' LIMIT 1`) as Array<{ id: number }>;
  if (!course[0]) throw new Error("car-rental-riches course not found");
  const courseId = course[0].id;
  for (let i = 0; i < MODULES.length; i++) {
    const [slug, title, phase, summary] = MODULES[i];
    await sql`INSERT INTO course_modules (course_id, slug, title, summary, phase_label, position, is_published)
      VALUES (${courseId}, ${slug}, ${title}, ${summary}, ${phase}, ${(i + 1) * 10}, true)
      ON CONFLICT (course_id, slug) DO NOTHING`;
  }
  const rows = (await sql`SELECT slug, position FROM course_modules WHERE course_id = ${courseId} ORDER BY position`) as Array<{ slug: string; position: number }>;
  console.log("modules:", rows.map(r => `${r.position}:${r.slug}`).join("  "));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
