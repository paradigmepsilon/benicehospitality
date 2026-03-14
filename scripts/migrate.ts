import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      featured_image_url TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ blog_posts table created");

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT NOT NULL DEFAULT 'insights'
    )
  `;
  console.log("  ✓ newsletter_subscribers table created");

  await sql`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      hotel_name TEXT NOT NULL,
      hotel_location TEXT,
      room_count TEXT,
      interests TEXT,
      message TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'new'
    )
  `;
  console.log("  ✓ contact_submissions table created");

  // Add published_at column for scheduled publishing
  await sql`
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ
  `;
  console.log("  ✓ blog_posts.published_at column added");

  await sql`
    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ uploads table created");

  await sql`
    CREATE TABLE IF NOT EXISTS availability_windows (
      id SERIAL PRIMARY KEY,
      day_of_week INT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ availability_windows table created");

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      hotel_name TEXT NOT NULL,
      message TEXT,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      duration_minutes INT NOT NULL DEFAULT 30,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ bookings table created");

  await sql`
    CREATE TABLE IF NOT EXISTS date_overrides (
      id SERIAL PRIMARY KEY,
      override_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      is_available BOOLEAN NOT NULL DEFAULT false,
      label TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ date_overrides table created");

  await sql`
    CREATE TABLE IF NOT EXISTS calendar_feeds (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT,
      last_synced_at TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ calendar_feeds table created");

  await sql`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      feed_id INT REFERENCES calendar_feeds(id) ON DELETE CASCADE,
      uid TEXT,
      summary TEXT,
      event_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(feed_id, uid)
    )
  `;
  console.log("  ✓ calendar_events table created");

  // Pipeline contacts table (BNHG CRM)
  await sql`
    CREATE TABLE IF NOT EXISTS pipeline_contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      hotel_name TEXT,
      hotel_location TEXT,
      room_count TEXT,
      company TEXT,
      pipeline_stage TEXT NOT NULL DEFAULT 'prospect',
      source TEXT NOT NULL DEFAULT 'manual',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ pipeline_contacts table created");

  // Pipeline activities table
  await sql`
    CREATE TABLE IF NOT EXISTS pipeline_activities (
      id SERIAL PRIMARY KEY,
      contact_id INT NOT NULL REFERENCES pipeline_contacts(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ pipeline_activities table created");

  // Link existing tables to pipeline contacts
  await sql`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS pipeline_contact_id INT REFERENCES pipeline_contacts(id)`;
  await sql`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pipeline_contact_id INT REFERENCES pipeline_contacts(id)`;
  console.log("  ✓ Pipeline foreign key columns added");

  // Migrate existing contact submissions into pipeline contacts
  await sql`
    INSERT INTO pipeline_contacts (name, email, phone, hotel_name, hotel_location, room_count, source, created_at)
    SELECT DISTINCT ON (email) name, email, phone, hotel_name, hotel_location, room_count, 'contact_form', submitted_at
    FROM contact_submissions
    ORDER BY email, submitted_at DESC
    ON CONFLICT (email) DO NOTHING
  `;

  // Migrate existing bookings into pipeline contacts
  await sql`
    INSERT INTO pipeline_contacts (name, email, phone, hotel_name, source, created_at)
    SELECT DISTINCT ON (email) name, email, phone, hotel_name, 'booking', created_at
    FROM bookings
    ORDER BY email, created_at DESC
    ON CONFLICT (email) DO NOTHING
  `;

  // Link existing records
  await sql`UPDATE contact_submissions cs SET pipeline_contact_id = pc.id FROM pipeline_contacts pc WHERE cs.email = pc.email AND cs.pipeline_contact_id IS NULL`;
  await sql`UPDATE bookings b SET pipeline_contact_id = pc.id FROM pipeline_contacts pc WHERE b.email = pc.email AND b.pipeline_contact_id IS NULL`;

  // Create activities for existing submissions
  await sql`
    INSERT INTO pipeline_activities (contact_id, type, title, created_at)
    SELECT pc.id, 'contact_form_submitted', 'Contact form submitted', cs.submitted_at
    FROM contact_submissions cs JOIN pipeline_contacts pc ON cs.pipeline_contact_id = pc.id
    ON CONFLICT DO NOTHING
  `;

  // Create activities for existing bookings
  await sql`
    INSERT INTO pipeline_activities (contact_id, type, title, created_at)
    SELECT pc.id, 'booking_scheduled', 'Discovery call booked', b.created_at
    FROM bookings b JOIN pipeline_contacts pc ON b.pipeline_contact_id = pc.id
    ON CONFLICT DO NOTHING
  `;
  console.log("  ✓ Existing data migrated to pipeline");

  // Seed default availability (Mon-Fri 9am-5pm) if table is empty
  const existingWindows = await sql`SELECT COUNT(*) as count FROM availability_windows`;
  if (Number(existingWindows[0].count) === 0) {
    for (let day = 1; day <= 5; day++) {
      await sql`
        INSERT INTO availability_windows (day_of_week, start_time, end_time)
        VALUES (${day}, '09:00', '17:00')
      `;
    }
    console.log("  ✓ default availability windows seeded (Mon-Fri 9am-5pm)");
  }

  console.log("Migrations complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
