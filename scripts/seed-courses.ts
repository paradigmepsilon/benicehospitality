import { neon } from "@neondatabase/serverless";

// Idempotent course seed. Inserts the BNHG course catalog: RRR (live, 8
// modules) and CRR (placeholder, ships Q3 2026). Re-running this script will
// upsert existing rows by slug — safe to run after every deploy. Lesson rows
// are merged on (course_id, slug); the order is set by `position` so adding
// a lesson in the middle of a module just renumbers.

interface SeedLesson {
  slug: string;
  title: string;
  summary: string;
  body: string;
  duration_min?: number;
}

interface SeedCourse {
  slug: string;
  title: string;
  summary: string;
  hero_image_url?: string;
  is_published: boolean;
  is_placeholder?: boolean;
  lessons: SeedLesson[];
}

const RRR: SeedCourse = {
  slug: "room-rental-riches",
  title: "Room Rental Riches",
  summary:
    "The Host-to-Operator method for property operators. Eight modules across operating systems, direct booking, SOPs, automation, owned guest lists, hiring, owner P&L, and the operator's cadence.",
  hero_image_url:
    "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=2000&q=85",
  is_published: true,
  lessons: [
    {
      slug: "operate-like-a-business",
      title: "Operate Like a Business",
      summary:
        "Dashboards, KPIs, and the weekly review cadence. The math of a portfolio. The numbers you should be able to pull in under a minute.",
      body: `<p>Hosting is reactive. Operating is a system. This module walks through the dashboard you keep open every Monday morning, the four numbers you check before any other decision, and the weekly review cadence that turns scattered effort into a tightening loop.</p>
<h3>What you'll set up by the end of this module</h3>
<ul>
  <li>A portfolio P&amp;L view you can actually pull up in under a minute.</li>
  <li>Four leading indicators (occupancy run-rate, ADR vs. comp, direct mix, NPS) tracked weekly.</li>
  <li>A 30-minute Monday review template you can run yourself or hand to an ops manager.</li>
</ul>
<p>The deliverable is a working spreadsheet (template provided) populated with your last 90 days of data. By the end of the cohort week, every operator in the room has the same view.</p>`,
      duration_min: 75,
    },
    {
      slug: "direct-booking-engine",
      title: "Direct Booking Engine",
      summary:
        "Direct booking pages that convert. Capture flows. Repeat-guest programs. Stop paying commission for guests who already know you.",
      body: `<p>The OTA take rate isn't your only cost — every commission also represents a guest the OTA owns instead of you. This module is the playbook for getting that ownership back.</p>
<h3>What you'll build</h3>
<ul>
  <li>A direct booking page with the four trust elements that move conversion.</li>
  <li>A capture flow that turns post-stay browsing into your owned email list.</li>
  <li>A repeat-guest program with a defensible discount structure (not race-to-the-bottom).</li>
</ul>
<p>Operators who run the full sequence usually move 8–14 points of mix to direct within 90 days. The math compounds — every direct booking next year saves you the commission you would have paid this year, and the year after that.</p>`,
      duration_min: 80,
    },
    {
      slug: "sops-that-survive-turnover",
      title: "SOPs That Survive Turnover",
      summary:
        "Cleaning standards, guest-comms protocols, escalation paths. Documentation that doesn't rot when your team changes.",
      body: `<p>Most operator SOPs die the day the original owner stops touching them. This module is about writing the kind of documentation that survives staff turnover, schedule changes, and the inevitable Friday-night fire drill.</p>
<h3>The framework</h3>
<ul>
  <li>The three-tier SOP structure: standards, procedures, exceptions.</li>
  <li>Decision trees for the situations that always come up (no-show cleaner, bad review, double-booking).</li>
  <li>The escalation path your team can actually follow at 11pm on a Saturday.</li>
</ul>
<p>You'll leave with a documented operations binder for at least three core processes (cleaning, guest comms, maintenance dispatch). It works because it's specific to your operation, not generic.</p>`,
      duration_min: 70,
    },
    {
      slug: "automation-with-boundaries",
      title: "Automation With Boundaries",
      summary:
        "Cleaner SMS, dynamic pricing, replenishment, owner reporting — automated without losing the conversations that need a human.",
      body: `<p>The trap with automation is that the easy stuff to automate is also the stuff guests notice when it's wrong. This module is the line between "automate it" and "leave it human" — and how to design the handoff so it's invisible.</p>
<h3>What gets automated</h3>
<ul>
  <li>Cleaner SMS dispatch with confirmation loops.</li>
  <li>Dynamic pricing rules with manual override windows.</li>
  <li>Replenishment triggers tied to inventory thresholds.</li>
  <li>Owner-facing weekly P&amp;L reports.</li>
</ul>
<h3>What stays human</h3>
<ul>
  <li>Service recovery (always).</li>
  <li>First-message-out for repeat guests.</li>
  <li>Anything that smells like a complaint until it's clearly not.</li>
</ul>`,
      duration_min: 85,
    },
    {
      slug: "owned-guest-lists",
      title: "Owned Guest Lists",
      summary:
        "Email capture, segmentation, and the sequences that bring guests back direct next time. The asset OTAs can't take from you.",
      body: `<p>Your owned email list is the only marketing asset that survives a platform change, an algorithm change, or a takedown notice. This module is the plumbing.</p>
<h3>The sequences you'll set up</h3>
<ul>
  <li>Pre-arrival: warm the relationship before the stay starts.</li>
  <li>In-stay: the touch point that turns a guest into a friend.</li>
  <li>Post-stay: the 14-day, 90-day, and seasonal sequences that drive return bookings.</li>
</ul>
<p>By the end of the module your list is segmented by stay type, repeat status, and direct-vs-OTA origin — the segments that actually drive different message strategies.</p>`,
      duration_min: 75,
    },
    {
      slug: "hiring-and-team-design",
      title: "Hiring and Team Design",
      summary:
        "When to hire. What to hire. How to onboard. The org chart of an operator's portfolio at three, ten, and thirty units.",
      body: `<p>The most expensive mistake operators make at the 10-unit mark is hiring an "ops manager" without knowing what that role's outputs are. This module fixes that.</p>
<h3>The org chart at three sizes</h3>
<ul>
  <li>3 units: you and a great cleaner. Stop here if you can.</li>
  <li>10 units: cleaner team + part-time guest comms + bookkeeping. Don't add a "manager" yet.</li>
  <li>30 units: now you have a real ops lead, and they own the dashboards from Module 01.</li>
</ul>
<p>Includes interview frameworks, scorecards, and the single onboarding email that gets new hires running in the first week.</p>`,
      duration_min: 70,
    },
    {
      slug: "owner-pnl-mastery",
      title: "Owner P&L Mastery",
      summary:
        "Revenue, expenses, owner-level metrics. The reports your investors and partners actually want to see.",
      body: `<p>If you co-host, manage for owners, or have any kind of partnership structure, the report you send monthly is either building trust or eroding it. This module is the report.</p>
<h3>The P&amp;L template</h3>
<ul>
  <li>Owner-facing summary (1 page, plain English).</li>
  <li>Detailed P&amp;L with the line items that matter.</li>
  <li>Trailing 12 / forward 3 view that lets the owner plan.</li>
  <li>Q&amp;A page: the questions every owner asks, answered before they ask.</li>
</ul>
<p>Includes the Excel + Google Sheet templates and the boilerplate language for the cover note.</p>`,
      duration_min: 65,
    },
    {
      slug: "the-operators-cadence",
      title: "The Operator's Cadence",
      summary:
        "Daily, weekly, monthly, quarterly. The rhythm that lets a portfolio run without you living in it.",
      body: `<p>The capstone module ties the previous seven together into a calendar you can actually live by. Not aspirational — what your week, month, and quarter look like when the system is running.</p>
<h3>The cadence</h3>
<ul>
  <li>Daily (5 min): occupancy + flagged guests check.</li>
  <li>Weekly (30 min): dashboard review + decisions.</li>
  <li>Monthly (90 min): owner P&amp;L + comp set repositioning.</li>
  <li>Quarterly (half day): hiring review + capital decisions + comp-set deep dive.</li>
</ul>
<p>The cadence is what turns the previous modules from a one-time setup into a portfolio that compounds.</p>`,
      duration_min: 90,
    },
  ],
};

const CRR: SeedCourse = {
  slug: "car-rental-riches",
  title: "Car Rental Riches",
  summary:
    "Build a profitable car rental business in the 2026 earnings-plan era. Taught by Alex Henry, operator of a real Atlanta rental fleet: underwriting method, claims defense, and the direct-booking system that doesn't depend on any platform.",
  hero_image_url: "",
  // Founding presale is live: the course row must be published (visible) but
  // its lessons drip in as modules clear quality gates. Flipped from the
  // placeholder state 2026-08-15 for the founding launch.
  is_published: true,
  is_placeholder: false,
  lessons: [
    {
      slug: "founding-welcome",
      title: "Welcome, Founding Member",
      summary: "What you've locked in, and when each module lands.",
      body: `<p>You're in as a Founding Member. Here's the plain deal: Modules 1 through 3 (the 2026 Turo opportunity, market analysis and vehicle underwriting with the real calculator, and protection, claims and damage defense) go live within 30 days of the founding launch. The remaining nine modules drip in weekly as each one clears the quality bar, and Alex sends a short build update each week so you can watch it come together.</p>
<p>Your access is lifetime, and every future update (including the quarterly platform-facts refresh) is included. Thirty-day unconditional money-back guarantee. Questions? Reply to any course email and it goes to Alex.</p>
<p><em>Car Rental Riches is an independent educational product, not affiliated with Turo Inc.</em></p>`,
    },
  ],
};

async function seedCourses() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Configure it in .env.local before seeding.",
    );
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Seeding BNHG course catalog...");

  for (const course of [RRR, CRR]) {
    const existing = (await sql`
      SELECT id FROM courses WHERE slug = ${course.slug}
    `) as { id: number }[];

    let courseId: number;
    if (existing.length === 0) {
      const inserted = (await sql`
        INSERT INTO courses (slug, title, summary, hero_image_url, is_published, is_placeholder)
        VALUES (${course.slug}, ${course.title}, ${course.summary}, ${course.hero_image_url || ""}, ${course.is_published}, ${course.is_placeholder ?? false})
        RETURNING id
      `) as { id: number }[];
      courseId = inserted[0].id;
      console.log(`  ✓ created course ${course.slug} (id=${courseId})`);
    } else {
      courseId = existing[0].id;
      await sql`
        UPDATE courses
        SET title = ${course.title},
            summary = ${course.summary},
            hero_image_url = ${course.hero_image_url || ""},
            is_published = ${course.is_published},
            is_placeholder = ${course.is_placeholder ?? false},
            updated_at = NOW()
        WHERE id = ${courseId}
      `;
      console.log(`  ↻ updated course ${course.slug} (id=${courseId})`);
    }

    for (const [i, lesson] of course.lessons.entries()) {
      const position = i + 1;
      await sql`
        INSERT INTO course_lessons (course_id, slug, title, summary, body, position, duration_min)
        VALUES (${courseId}, ${lesson.slug}, ${lesson.title}, ${lesson.summary}, ${lesson.body}, ${position}, ${lesson.duration_min ?? null})
        ON CONFLICT (course_id, slug) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          body = EXCLUDED.body,
          position = EXCLUDED.position,
          duration_min = EXCLUDED.duration_min,
          updated_at = NOW()
      `;
    }
    console.log(
      `    · ${course.lessons.length} lesson${course.lessons.length === 1 ? "" : "s"} synced`,
    );
  }

  // Auto-enroll the seeded member account in RRR (cohort tier) so the demo
  // flow works end-to-end the moment seeds finish. Idempotent.
  const memberRows = (await sql`
    SELECT id FROM users WHERE LOWER(email) = LOWER('member@benicehospitality.com')
  `) as { id: number }[];
  const rrrRows = (await sql`
    SELECT id FROM courses WHERE slug = 'room-rental-riches'
  `) as { id: number }[];
  if (memberRows[0] && rrrRows[0]) {
    await sql`
      INSERT INTO enrollments (user_id, course_id, tier, status)
      VALUES (${memberRows[0].id}, ${rrrRows[0].id}, 'cohort', 'active')
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        status = 'active',
        revoked_at = NULL
    `;
    console.log(
      "  ✓ enrolled member@benicehospitality.com in room-rental-riches (cohort)",
    );
  } else {
    console.log(
      "  · skip demo enrollment — run db:seed:users first to create the member account",
    );
  }

  console.log("Done.");
}

seedCourses().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
