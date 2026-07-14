/**
 * Generate the Claim Proof Fleet staff-training deck (.pptx).
 *
 * The "editable deck" promised on the Fleet card: a staff-facing training deck
 * an owner can copy and adapt. Content is drawn from the fleet-ops SOP, the
 * pre-trip photo standard, the handoff form, roles, and the 24-hour rule.
 * Opens natively in Google Slides or PowerPoint.
 *
 * Output: ~/Sites/bna-claim-proof/assets/claimproof_staff_training.pptx
 * Run: node --import tsx scripts/build-claimproof-staff-deck.ts
 */
import pptxgen from "pptxgenjs";
import path from "node:path";
import { homedir } from "node:os";

const OUT = path.join(homedir(), "Sites", "bna-claim-proof", "assets", "claimproof_staff_training.pptx");

const INK = "27262E";
const INK2 = "3D3D3D";
const GOLD = "E19C63";
const CREAM = "F8F6F1";
const BLUE = "8BA5BE";
const CARD = "2A2932";

function main() {
  const p = new pptxgen();
  p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
  p.layout = "W";
  p.author = "Be Nice Autos - Claim Proof";
  p.company = "Be Nice Autos";

  // Master: dark background with a gold hairline footer.
  p.defineSlideMaster({
    title: "DARK",
    background: { color: INK },
    objects: [
      { line: { x: 0.6, y: 6.9, w: 12.13, h: 0, line: { color: GOLD, width: 1 } } },
      {
        text: {
          text: "CLAIM PROOF  ·  FLEET STAFF TRAINING",
          options: { x: 0.6, y: 6.95, w: 8, h: 0.35, fontSize: 8, color: BLUE, charSpacing: 2 },
        },
      },
    ],
  });

  const H = (t: string, sub?: string) => {
    const s = p.addSlide({ masterName: "DARK" });
    s.addText(t, { x: 0.6, y: 0.55, w: 12.1, h: 0.9, fontSize: 30, bold: true, color: CREAM, fontFace: "Georgia" });
    if (sub) s.addText(sub, { x: 0.6, y: 1.45, w: 12.1, h: 0.5, fontSize: 14, italic: true, color: GOLD });
    return s;
  };

  // Bulleted body helper.
  const bullets = (s: pptxgen.Slide, items: string[], y = 2.2, x = 0.7, w = 11.9) => {
    s.addText(
      items.map((t) => ({ text: t, options: { bullet: { indent: 18 }, color: CREAM, fontSize: 16, paraSpaceAfter: 12 } })),
      { x, y, w, h: 4.2, valign: "top" },
    );
  };

  // Card row helper (up to 4 cards).
  const cards = (s: pptxgen.Slide, items: Array<{ n: string; t: string; b: string }>, y = 2.3) => {
    const gap = 0.3;
    const w = (12.13 - gap * (items.length - 1)) / items.length;
    items.forEach((c, i) => {
      const x = 0.6 + i * (w + gap);
      s.addShape(p.ShapeType.roundRect, { x, y, w, h: 3.6, fill: { color: CARD }, line: { color: GOLD, width: 0.75 }, rectRadius: 0.12 });
      s.addText(c.n, { x: x + 0.25, y: y + 0.25, w: w - 0.5, h: 0.6, fontSize: 24, bold: true, color: GOLD, fontFace: "Georgia" });
      s.addText(c.t, { x: x + 0.25, y: y + 0.95, w: w - 0.5, h: 0.7, fontSize: 15, bold: true, color: CREAM });
      s.addText(c.b, { x: x + 0.25, y: y + 1.7, w: w - 0.5, h: 1.7, fontSize: 12, color: "CFC9C0", valign: "top" });
    });
  };

  // 1 — Cover
  const cover = p.addSlide({ masterName: "DARK" });
  cover.addText("CLAIM PROOF", { x: 0.6, y: 2.2, w: 12, h: 0.5, fontSize: 14, color: GOLD, charSpacing: 4, bold: true });
  cover.addText("Fleet Staff Training", { x: 0.6, y: 2.7, w: 12, h: 1.2, fontSize: 44, bold: true, color: CREAM, fontFace: "Georgia" });
  cover.addText(
    "How we document every car so a damage claim is won before it starts.",
    { x: 0.6, y: 4.0, w: 11, h: 0.8, fontSize: 18, italic: true, color: BLUE },
  );
  cover.addText("Copy this deck and adapt the names and details to your team.", {
    x: 0.6, y: 5.6, w: 11, h: 0.5, fontSize: 12, color: "9A948B",
  });

  // 2 — Why this matters
  let s = H("Why this matters", "The claim is decided by people who never see the car.");
  bullets(s, [
    "An adjuster prices damage from photographs, not from being there. Your photos are the car.",
    "A clean, consistent photo set means a claim gets priced in about a day. An unclear one means a request for more photos, a field inspection, and delay.",
    "Most lost claims are not lost on the facts. They are lost on documentation that was thin, late, or inconsistent.",
    "Everything in this deck exists to make our documentation boring, repeatable, and impossible to argue with.",
  ]);

  // 3 — The one rule
  s = H("The one rule", "Everything hangs on this.");
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 2.3, w: 12.13, h: 1.6, fill: { color: CARD }, line: { color: GOLD, width: 1 }, rectRadius: 0.1 });
  s.addText("You have 24 hours to report damage, measured from when the trip ENDS, not from when you notice it.", {
    x: 1.0, y: 2.5, w: 11.3, h: 1.2, fontSize: 20, bold: true, color: CREAM, valign: "middle",
  });
  bullets(s, [
    "If you receive a car and see damage, the clock may already be running. Move now.",
    "If you are not sure when the trip ended, check the app and confirm before anything else.",
    "When in doubt, document first and tell the owner immediately. Never wait on the guest.",
  ], 4.2);

  // 4 — Pre-trip photo standard
  s = H("Before every trip: the 12-shot standard", "Same order, same distances, every car, every time.");
  cards(s, [
    { n: "01–04", t: "Four corners, wide", b: "Front-left, front-right, rear-left, rear-right. Whole car and its surroundings in frame, from 10 to 12 feet." },
    { n: "05–08", t: "Sides, roof, wheels", b: "Each side straight on, roof and glass, and all four wheels. Overlap edges so no panel is missed." },
    { n: "09–10", t: "Odometer and fuel", b: "The dash: odometer reading and fuel or charge level. Interior claims die without interior baselines." },
    { n: "11–12", t: "Existing blemishes", b: "A wide and a close pair on every scratch, chip, or scuff that is already there. Twelve is the minimum, not the ceiling." },
  ]);

  // 5 — Return inspection
  s = H("When the car comes back", "The return set is the mirror of the pre-trip set.");
  bullets(s, [
    "Run the same angles and the same distances, at drop-off, before the car moves.",
    "Post-trip photos that match your pre-trip photos let anyone see instantly what changed during the trip and what did not.",
    "Do the return set before you clean, move, or re-park the car. The car in its current state is the evidence.",
    "If something is new, do NOT wipe, wash, or touch the area. Photograph it exactly as it came back.",
  ]);

  // 6 — Five-minute card
  s = H("The five-minute inspection", "The whole standard on one card.");
  bullets(s, [
    "Keep the inspection card on your phone or printed at the lot. It is the 12-shot sequence in order.",
    "Four to five minutes at checkout and at return is the entire system.",
    "The order matters more than speed: the sequence is a habit, and the habit is what survives a busy turn day.",
    "The first claim this saves pays for every minute you ever spent on it.",
  ]);

  // 7 — Found damage
  s = H("If you find damage", "The first hour, in order.");
  cards(s, [
    { n: "1", t: "Stop", b: "Do not move or clean the car. Cleaning it destroys the residue, glass, and transfer an appraiser needs." },
    { n: "2", t: "Capture", b: "Wide shots that place the whole car, then close-ups of the damage with something for scale." },
    { n: "3", t: "Report up", b: "Fill the handoff form and send it to the owner immediately, with the photos and the time." },
  ]);

  // 8 — Handoff form
  s = H("The handoff form", "How a catch reaches the owner cleanly.");
  bullets(s, [
    "When you catch damage, the handoff form is how it reaches the owner without anything getting lost.",
    "Capture: which vehicle, what you found, exactly where on the car, the photos you took, and the time.",
    "The time matters. It protects the 24-hour clock even when the owner is not the one standing there.",
    "Facts only. What you saw and when. No guesses about who or how.",
  ]);

  // 9 — Roles
  s = H("Who does what", "On a team, unclear ownership is how claims die.");
  cards(s, [
    { n: "A", t: "Documents", b: "Whoever stages and receives the car runs the photo standard and files the handoff form." },
    { n: "B", t: "Files", b: "The owner or lead files the claim inside the window and assembles the evidence." },
    { n: "C", t: "Follows up", b: "One person owns the follow-up cadence and the communication log until the claim closes." },
    { n: "D", t: "Decides", b: "The owner makes the fight-or-close call, using the numbers, not the frustration." },
  ]);

  // 10 — Photo quality
  s = H("What a good photo set looks like", "Have photos is not enough. They have to hold up.");
  bullets(s, [
    "Originals, not screenshots. Screenshots strip the metadata that proves when a photo was taken.",
    "Sharp enough to read at full size. A blurry close-up of the damage is worth very little.",
    "Angles that match between pre-trip and return, so the comparison is obvious.",
    "Something for scale against the damage, and the whole car in frame somewhere to prove which vehicle it is.",
  ]);

  // 11 — Weekly rhythm
  s = H("The weekly rhythm", "Twenty minutes keeps claims from becoming emergencies.");
  bullets(s, [
    "Once a week, the team walks every open claim: what is the next action, and when is it due.",
    "Anything past a window gets a follow-up that day. The board gets cleaned.",
    "Consistency here is what keeps a quiet claim from drifting into a lost one.",
    "Boring is the goal. Boring is what scales.",
  ]);

  // 12 — Sign-off
  s = H("Training sign-off", "Onboard once, correctly.");
  bullets(s, [
    "By signing, the team member confirms they understand the 24-hour rule, the 12-shot standard, the return inspection, and the handoff form.",
    "Keep the signed sheet with the vehicle records.",
    "",
    "Name:  ____________________________       Date:  ______________",
    "Signature:  ____________________________",
  ]);

  // 13 — Close
  const close = p.addSlide({ masterName: "DARK" });
  close.addText("Document like the claim is already happening.", {
    x: 0.6, y: 3.0, w: 12, h: 1.2, fontSize: 30, bold: true, color: CREAM, fontFace: "Georgia",
  });
  close.addText("Because the day it does, the file already answers for you.", {
    x: 0.6, y: 4.2, w: 12, h: 0.7, fontSize: 16, italic: true, color: GOLD,
  });
  close.addText(
    "Operational guidance, not legal, insurance, or claims-adjusting advice. Not affiliated with Turo Inc.",
    { x: 0.6, y: 6.2, w: 12, h: 0.4, fontSize: 9, color: "8A857C" },
  );

  return p.writeFile({ fileName: OUT }).then(() => console.log(`✓ wrote ${OUT}`));
}

main();
