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

  // Add SEO fields to blog_posts
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS target_keyword TEXT`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[] DEFAULT '{}'`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}'`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`;
  console.log("  ✓ blog_posts SEO columns added");

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

  // Migrate existing contact submissions into pipeline contacts.
  // NOTE: Originally used ON CONFLICT(email) — that constraint was dropped later in
  // this script (multi-property hotels share info@ addresses). Use NOT EXISTS instead
  // so this block is safe to re-run after the constraint is gone.
  //
  // Idempotency: on an already-migrated DB the pipeline_contacts_property_uniq index
  // (created later in this file) is already live. Inbound rows carry no website_url and
  // frequently no hotel_name, so several would collide on the ('','') property key.
  // Guard with ON CONFLICT DO NOTHING, restating that index's expression (it's a bare
  // expression index, not a named constraint, so the target has to be the expression).
  await sql`
    INSERT INTO pipeline_contacts (name, email, phone, hotel_name, hotel_location, room_count, source, created_at)
    SELECT DISTINCT ON (cs.email) cs.name, cs.email, cs.phone, cs.hotel_name, cs.hotel_location, cs.room_count, 'contact_form', cs.submitted_at
    FROM contact_submissions cs
    WHERE NOT EXISTS (SELECT 1 FROM pipeline_contacts pc WHERE pc.email = cs.email)
    ORDER BY cs.email, cs.submitted_at DESC
    ON CONFLICT (LOWER(COALESCE(website_url,'')), LOWER(COALESCE(hotel_name,''))) DO NOTHING
  `;

  // Migrate existing bookings into pipeline contacts
  await sql`
    INSERT INTO pipeline_contacts (name, email, phone, hotel_name, source, created_at)
    SELECT DISTINCT ON (b.email) b.name, b.email, b.phone, b.hotel_name, 'booking', b.created_at
    FROM bookings b
    WHERE NOT EXISTS (SELECT 1 FROM pipeline_contacts pc WHERE pc.email = b.email)
    ORDER BY b.email, b.created_at DESC
    ON CONFLICT (LOWER(COALESCE(website_url,'')), LOWER(COALESCE(hotel_name,''))) DO NOTHING
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

  // ============================================================
  // Tier 0 Audit System (Stage 1)
  // ============================================================

  await sql`
    CREATE TABLE IF NOT EXISTS audits (
      id SERIAL PRIMARY KEY,
      token VARCHAR(64) UNIQUE NOT NULL,
      hotel_url TEXT NOT NULL,
      hotel_slug VARCHAR(255) NOT NULL,
      hotel_name VARCHAR(500) NOT NULL,
      hotel_location VARCHAR(255),
      room_count INTEGER,
      overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
      overall_grade VARCHAR(2) NOT NULL,
      audit_data JSONB NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audits_token ON audits(token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audits_hotel_slug ON audits(hotel_slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC)`;
  console.log("  ✓ audits table created");

  await sql`
    CREATE TABLE IF NOT EXISTS audit_views (
      id SERIAL PRIMARY KEY,
      audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      email VARCHAR(320) NOT NULL,
      first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      view_count INTEGER NOT NULL DEFAULT 1,
      ip_address INET,
      user_agent TEXT,
      UNIQUE(audit_id, email)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_views_audit_id ON audit_views(audit_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_views_email ON audit_views(email)`;
  console.log("  ✓ audit_views table created");

  await sql`
    CREATE TABLE IF NOT EXISTS audit_events (
      id SERIAL PRIMARY KEY,
      audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      audit_view_id INTEGER REFERENCES audit_views(id) ON DELETE SET NULL,
      event_type VARCHAR(50) NOT NULL,
      metadata JSONB,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_events_audit_id ON audit_events(audit_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_events_event_type ON audit_events(event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_events_occurred_at ON audit_events(occurred_at DESC)`;
  console.log("  ✓ audit_events table created");

  await sql`
    CREATE TABLE IF NOT EXISTS nurture_queue (
      id SERIAL PRIMARY KEY,
      audit_view_id INTEGER NOT NULL REFERENCES audit_views(id) ON DELETE CASCADE,
      sequence_step VARCHAR(20) NOT NULL,
      scheduled_for TIMESTAMPTZ NOT NULL,
      sent_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      cancellation_reason VARCHAR(100),
      resend_message_id VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(audit_view_id, sequence_step)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_nurture_queue_scheduled_pending
    ON nurture_queue(scheduled_for)
    WHERE sent_at IS NULL AND cancelled_at IS NULL
  `;
  console.log("  ✓ nurture_queue table created");

  await sql`
    CREATE TABLE IF NOT EXISTS lead_notes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(320) NOT NULL,
      note TEXT NOT NULL,
      author_admin_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_notes_email ON lead_notes(email)`;
  console.log("  ✓ lead_notes table created");

  await sql`
    CREATE TABLE IF NOT EXISTS audit_requests (
      id SERIAL PRIMARY KEY,
      hotel_url TEXT NOT NULL,
      email VARCHAR(320) NOT NULL,
      role VARCHAR(50),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      audit_id INTEGER REFERENCES audits(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      fulfilled_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_requests_status ON audit_requests(status)`;
  console.log("  ✓ audit_requests table created");

  // Extend bookings for focus dimension + audit linkage (Stage 4)
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS focus_dimension VARCHAR(50)`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS audit_id INTEGER REFERENCES audits(id) ON DELETE SET NULL`;
  console.log("  ✓ bookings.focus_dimension and bookings.audit_id columns added");

  // Track which founder the visitor was reading about when they clicked Book a Call.
  // Set client-side from ?founder=alex|della on the /book URL. Nullable so legacy
  // bookings and direct /book hits without attribution still insert cleanly.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS requested_founder VARCHAR(20)`;
  console.log("  ✓ bookings.requested_founder column added");

  // Track WHICH CTA the visitor clicked (page + section, e.g. "alex_hero",
  // "signal_engagements_grid"). Set client-side from ?source= on /book. Lets
  // the team see what the visitor was reading about when they decided to book.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS click_source VARCHAR(80)`;
  console.log("  ✓ bookings.click_source column added");

  // ============================================================
  // Bulk Outreach (Stage 8)
  // ============================================================

  await sql`
    CREATE TABLE IF NOT EXISTS unsubscribes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(320) UNIQUE NOT NULL,
      source VARCHAR(50) NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes(email)`;
  console.log("  ✓ unsubscribes table created");

  await sql`
    CREATE TABLE IF NOT EXISTS outreach_campaigns (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      batch_id VARCHAR(64) UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'created',
      send_schedule JSONB NOT NULL,
      total_targets INTEGER NOT NULL DEFAULT 0,
      scheduled_count INTEGER NOT NULL DEFAULT 0,
      sent_count INTEGER NOT NULL DEFAULT 0,
      paused_at TIMESTAMPTZ,
      paused_reason VARCHAR(255),
      created_by_admin_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status ON outreach_campaigns(status)`;
  console.log("  ✓ outreach_campaigns table created");

  await sql`
    CREATE TABLE IF NOT EXISTS outreach_targets (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
      hotel_url TEXT NOT NULL,
      hotel_name VARCHAR(500),
      contact_name VARCHAR(255),
      contact_email VARCHAR(320) NOT NULL,
      contact_role VARCHAR(100),
      audit_id INTEGER REFERENCES audits(id) ON DELETE SET NULL,
      draft_subject VARCHAR(500),
      draft_body TEXT,
      scheduled_send_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      approved_by_admin_id VARCHAR(255),
      sent_at TIMESTAMPTZ,
      bounced_at TIMESTAMPTZ,
      complained_at TIMESTAMPTZ,
      replied_at TIMESTAMPTZ,
      unsubscribed_at TIMESTAMPTZ,
      status VARCHAR(30) NOT NULL DEFAULT 'imported',
      failure_reason TEXT,
      resend_message_id VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(campaign_id, contact_email)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_targets_campaign ON outreach_targets(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_targets_status ON outreach_targets(status)`;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_outreach_targets_scheduled_unapproved
    ON outreach_targets(scheduled_send_at)
    WHERE sent_at IS NULL AND approved_at IS NULL
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_outreach_targets_scheduled_approved
    ON outreach_targets(scheduled_send_at)
    WHERE sent_at IS NULL AND approved_at IS NOT NULL
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_targets_email ON outreach_targets(contact_email)`;
  console.log("  ✓ outreach_targets table created");

  await sql`
    CREATE TABLE IF NOT EXISTS daily_approval_batches (
      id SERIAL PRIMARY KEY,
      send_date DATE NOT NULL,
      campaign_id INTEGER REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
      target_count INTEGER NOT NULL,
      approved_at TIMESTAMPTZ,
      approved_by_admin_id VARCHAR(255),
      notification_sent_at TIMESTAMPTZ,
      notification_email_id VARCHAR(255),
      expired_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(send_date, campaign_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_daily_approval_batches_send_date ON daily_approval_batches(send_date)`;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_daily_approval_batches_pending
    ON daily_approval_batches(send_date)
    WHERE approved_at IS NULL AND expired_at IS NULL
  `;
  console.log("  ✓ daily_approval_batches table created");

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

  // Outbound CSV prospect import — extend pipeline_contacts with property fields
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS website_url TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS fit_quality TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS region TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS state TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS city TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS owner_role TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS import_batch_id TEXT`;
  await sql`ALTER TABLE pipeline_contacts ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ`;

  // Backfill: keep legacy inbound rows from colliding on the new property dedup index.
  // Treat NULL, '', and placeholder hotel names ('-', 'n/a', 'na', 'none') as missing.
  await sql`
    UPDATE pipeline_contacts
    SET hotel_name = 'Inbound#' || id
    WHERE website_url IS NULL
      AND (
        hotel_name IS NULL
        OR TRIM(hotel_name) = ''
        OR LOWER(TRIM(hotel_name)) IN ('-', 'n/a', 'na', 'none')
      )
  `;

  // Drop legacy email uniqueness — multi-property hotel groups share info@ addresses
  await sql`ALTER TABLE pipeline_contacts DROP CONSTRAINT IF EXISTS pipeline_contacts_email_key`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS pipeline_contacts_property_uniq
    ON pipeline_contacts (LOWER(COALESCE(website_url,'')), LOWER(COALESCE(hotel_name,'')))
  `;
  console.log("  ✓ pipeline_contacts extended for outbound CSV import");

  // Bridge prospect CRM → outbound campaigns
  await sql`ALTER TABLE outreach_targets ADD COLUMN IF NOT EXISTS pipeline_contact_id INT REFERENCES pipeline_contacts(id) ON DELETE SET NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_targets_pipeline_contact ON outreach_targets(pipeline_contact_id)`;
  await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS is_stub BOOLEAN NOT NULL DEFAULT FALSE`;
  console.log("  ✓ outreach_targets.pipeline_contact_id + audits.is_stub added");

  // Per-target outbound event log. Lets the CRM contact timeline and campaign
  // detail page show "delivered/opened/clicked/replied/bounced" interleaved
  // with manual pipeline_activities. Resend webhook events get a unique id
  // we can dedup on so a webhook replay doesn't double-log.
  await sql`
    CREATE TABLE IF NOT EXISTS outreach_events (
      id SERIAL PRIMARY KEY,
      target_id INT NOT NULL REFERENCES outreach_targets(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resend_event_id TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_events_target ON outreach_events(target_id, occurred_at DESC)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS outreach_events_resend_dedup ON outreach_events(resend_event_id) WHERE resend_event_id IS NOT NULL`;
  console.log("  ✓ outreach_events table created");

  // BNHG Labs Build Log. Reuses blog_posts so the existing admin tooling and
  // sitemap logic just work. post_type splits Insights from Build Log entries.
  // embed_url + embed_platform let a Build Log entry render an inline video or
  // post embed instead of full Tiptap content.
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'insight'`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS embed_url TEXT`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS embed_platform TEXT`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_post_type_check') THEN
        ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_post_type_check
          CHECK (post_type IN ('insight','build_log'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_embed_platform_check') THEN
        ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_embed_platform_check
          CHECK (embed_platform IS NULL OR embed_platform IN ('linkedin','youtube','instagram','x','threads'));
      END IF;
    END $$;
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_post_type ON blog_posts(post_type)`;
  console.log("  ✓ blog_posts.post_type + embed_url + embed_platform added");

  // Distinguish advisory discovery calls (60 min) from Signal discovery calls
  // (40 min, boutique-hotel buyers). Default preserves prior bookings as advisory.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS call_type TEXT NOT NULL DEFAULT 'advisory_discovery_60'`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_call_type_check') THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_call_type_check
          CHECK (call_type IN ('advisory_discovery_60','signal_discovery_40'));
      END IF;
    END $$;
  `;
  console.log("  ✓ bookings.call_type column + check constraint added");

  // Operator-pasted HTML for audit landing pages. When set, the public audit
  // page renders this HTML instead of the structured AuditReport component.
  // Lets you bring in the output of the Claude-generated Tier 0 audit verbatim.
  await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS custom_html TEXT`;
  // public_slug is the routable, human-readable URL slug (distinct from
  // hotel_slug, which is the raw slugified hotel name). When two audits share
  // the same hotel_slug, we append `-<id>` to keep the URL unique.
  await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS public_slug TEXT`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_audits_public_slug ON audits(public_slug) WHERE public_slug IS NOT NULL`;
  // Backfill: existing rows get public_slug = hotel_slug, with -<id> appended
  // when there's a collision. Skip rows already populated.
  await sql`
    WITH ranked AS (
      SELECT id, hotel_slug,
             ROW_NUMBER() OVER (PARTITION BY hotel_slug ORDER BY id ASC) AS rn
      FROM audits
      WHERE public_slug IS NULL
    )
    UPDATE audits a
    SET public_slug = CASE WHEN r.rn = 1 THEN r.hotel_slug ELSE r.hotel_slug || '-' || a.id END
    FROM ranked r
    WHERE a.id = r.id
  `;
  console.log("  ✓ audits.custom_html + audits.public_slug added");

  // ---------------------------------------------------------------------------
  // Auth: users, sessions, password_reset_tokens
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ,
      disabled_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email))`;
  console.log("  ✓ users table created");

  await sql`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      ip TEXT,
      user_agent TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)`;
  console.log("  ✓ user_sessions table created");

  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)`;
  console.log("  ✓ password_reset_tokens table created");

  // OAuth: allow password-less accounts and track linked provider identities.
  await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`;
  await sql`
    CREATE TABLE IF NOT EXISTS user_oauth_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL CHECK (provider IN ('google', 'facebook', 'linkedin')),
      provider_account_id TEXT NOT NULL,
      email_at_link TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (provider, provider_account_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_oauth_accounts_user_id ON user_oauth_accounts(user_id)`;
  console.log("  ✓ user_oauth_accounts table created");

  // Intake / onboarding profile. One row per user; presence of `onboarded_at`
  // is the canonical "this user finished intake" signal. `service_interests`
  // is a fixed 3-value vocabulary (rental_properties / independent_hotels /
  // autos) — TEXT[] beats a join table for an enum this small. The row may
  // be created at signup with just phone + service_interests, then completed
  // when the user submits the /onboarding form.
  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT,
      service_interests TEXT[] NOT NULL DEFAULT '{}',
      why_joining TEXT,
      goals TEXT,
      business_stage TEXT CHECK (business_stage IS NULL OR business_stage IN ('none', 'one', 'multiple')),
      heard_from TEXT,
      marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
      marketing_opt_in_at TIMESTAMPTZ,
      onboarded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarded_at ON user_profiles(onboarded_at)`;
  console.log("  ✓ user_profiles table created");

  // Email verification — separate table from password_reset_tokens because the
  // two token lifecycles are semantically different and mixing them invites
  // bugs. Same shape; 24h TTL by convention (set at create time).
  await sql`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at)`;
  console.log("  ✓ email_verification_tokens table created");

  // ---------------------------------------------------------------------------
  // Courses + enrollments
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      hero_image_url TEXT NOT NULL DEFAULT '',
      is_published BOOLEAN NOT NULL DEFAULT false,
      is_placeholder BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug)`;
  console.log("  ✓ courses table created");

  await sql`
    CREATE TABLE IF NOT EXISTS course_lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      duration_min INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (course_id, slug)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id, position)`;
  console.log("  ✓ course_lessons table created");

  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      tier TEXT NOT NULL DEFAULT 'self-paced' CHECK (tier IN ('self-paced', 'cohort', 'operator', 'comp')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'revoked')),
      granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      granted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      expires_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      notes TEXT,
      UNIQUE (user_id, course_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status) WHERE status = 'active'`;
  console.log("  ✓ enrollments table created");

  await sql`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, lesson_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id)`;
  console.log("  ✓ lesson_progress table created");

  // ---------------------------------------------------------------------------
  // Forum
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ forum_categories table created");

  // Seed the six BNHG asset-class categories. Idempotent: existing rows are left
  // alone, so admins can rename or reorder them without the seed reverting.
  await sql`
    INSERT INTO forum_categories (slug, name, description, position) VALUES
      ('general', 'General', 'Open conversation. Welcomes, intros, and anything that doesn''t fit a specific room.', 10),
      ('str', 'Short-Term Rentals', 'STR operators talking shop — pricing, listings, cleaner ops, OTA decisions.', 20),
      ('mtr-ltr', 'Mid- and Long-Term Rentals', 'MTR and LTR — corporate housing, traveling-nurse plays, lease structures.', 30),
      ('co-living', 'Co-living', 'Shared-housing operators on tenant-mix, common-space SOPs, and house-rule enforcement.', 40),
      ('auto-turo', 'Auto / Turo', 'Fleet operators on vehicle mix, dynamic pricing, damage protocols, and Turo-platform mechanics.', 50),
      ('hotels', 'Boutique Hotels', 'Independent boutique operators on AEO, OTA recovery, and the rest of the Signal playbook.', 60)
    ON CONFLICT (slug) DO NOTHING
  `;
  console.log("  ✓ forum_categories seeded");

  await sql`
    CREATE TABLE IF NOT EXISTS forum_threads (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE RESTRICT,
      author_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      is_pinned BOOLEAN NOT NULL DEFAULT false,
      is_locked BOOLEAN NOT NULL DEFAULT false,
      reply_count INTEGER NOT NULL DEFAULT 0,
      last_reply_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id, is_pinned DESC, last_reply_at DESC NULLS LAST, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_threads_active ON forum_threads(deleted_at) WHERE deleted_at IS NULL`;
  console.log("  ✓ forum_threads table created");

  await sql`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id SERIAL PRIMARY KEY,
      thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
      author_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_user_id)`;
  console.log("  ✓ forum_posts table created");

  // ---------------------------------------------------------------------------
  // Member resources (tier-gated)
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS member_resources (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      file_upload_id INTEGER REFERENCES uploads(id) ON DELETE SET NULL,
      external_url TEXT,
      required_tier TEXT NOT NULL DEFAULT 'any' CHECK (required_tier IN ('any', 'cohort', 'operator')),
      is_published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_member_resources_tier ON member_resources(required_tier, is_published)`;
  console.log("  ✓ member_resources table created");

  // ---------------------------------------------------------------------------
  // Generic user events — modeled on audit_events. Fuels admin analytics.
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS user_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      event_type VARCHAR(64) NOT NULL,
      metadata JSONB,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_events_occurred_at ON user_events(occurred_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id, occurred_at DESC)`;
  console.log("  ✓ user_events table created");

  // ---------------------------------------------------------------------------
  // Course catalog: thumbnails, categorization, purchasability + tier pricing.
  // The static src/lib/courses.ts catalog is for marketing; this is the
  // commerce side — DB rows that drive what's purchasable, at what price,
  // and which Stripe price ID to send to checkout.
  // ---------------------------------------------------------------------------
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_slug TEXT`;
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_position INT NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN NOT NULL DEFAULT false`;
  console.log("  ✓ courses thumbnail/category/purchasable columns added");

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id)`;
  console.log("  ✓ users.stripe_customer_id column added");

  await sql`
    CREATE TABLE IF NOT EXISTS course_tiers (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      tier TEXT NOT NULL CHECK (tier IN ('self-paced', 'cohort', 'operator')),
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      stripe_product_id TEXT,
      stripe_price_id TEXT,
      is_published BOOLEAN NOT NULL DEFAULT true,
      position INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (course_id, tier)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_tiers_course_id ON course_tiers(course_id, position)`;
  console.log("  ✓ course_tiers table created");

  await sql`
    CREATE TABLE IF NOT EXISTS course_purchases (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
      course_tier_id INTEGER NOT NULL REFERENCES course_tiers(id) ON DELETE RESTRICT,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_payment_intent_id TEXT,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_purchases_user ON course_purchases(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_purchases_session ON course_purchases(stripe_session_id)`;
  console.log("  ✓ course_purchases table created");

  // Seed RRR's three tiers + assign asset class. Idempotent on re-run.
  await sql`
    INSERT INTO course_tiers (course_id, tier, name, description, price_cents, position)
    SELECT c.id, t.tier, t.name, t.description, t.price_cents, t.position
    FROM courses c
    CROSS JOIN (VALUES
      ('self-paced'::text, 'Self-paced', 'Lifetime course access plus one year in the Nice Host Network. Read-the-docs pace.', 49700, 0),
      ('cohort'::text, 'Cohort', 'Eight-week guided cohort with weekly sessions and a hot-seat slot. Most popular tier.', 249700, 1),
      ('operator'::text, 'Operator (1:1)', '90 days of 1:1 with Della plus everything in cohort. Five seats per cycle.', 749700, 2)
    ) AS t(tier, name, description, price_cents, position)
    WHERE c.slug = 'room-rental-riches'
    ON CONFLICT (course_id, tier) DO NOTHING
  `;

  await sql`
    UPDATE courses SET
      category_slug = 'str',
      is_purchasable = true,
      display_position = 0
    WHERE slug = 'room-rental-riches'
      AND (category_slug IS NULL OR is_purchasable = false)
  `;

  await sql`
    UPDATE courses SET
      category_slug = 'auto-turo',
      display_position = 10
    WHERE slug = 'car-rental-riches' AND category_slug IS NULL
  `;
  console.log("  ✓ course_tiers seeded for RRR; category_slug assigned");

  // ---------------------------------------------------------------------------
  // Course curriculum: modules + lesson columns + lesson_assets.
  // Modules group lessons within a course; phase_label is just a string label
  // ("Phase 1: Foundation"). Lessons get extended to support multiple body
  // kinds (text/bundle/video/workbook), per-lesson tier gating, and
  // bundle-asset references. Asset rows hold base64 file bytes.
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS course_modules (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      phase_label TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (course_id, slug)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id, position)`;
  console.log("  ✓ course_modules table created");

  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS module_id INTEGER REFERENCES course_modules(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS body_kind TEXT NOT NULL DEFAULT 'text'`;
  // CHECK constraint added separately so the ALTER doesn't fail when the
  // constraint already exists from a prior run.
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_lessons_body_kind_check'
      ) THEN
        ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_body_kind_check
          CHECK (body_kind IN ('text','bundle','video','workbook'));
      END IF;
    END $$
  `;
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS video_url TEXT`;
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS bundle_main_filename TEXT`;
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS bundle_aspect TEXT NOT NULL DEFAULT 'slide'`;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_lessons_bundle_aspect_check'
      ) THEN
        ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_bundle_aspect_check
          CHECK (bundle_aspect IN ('slide','page'));
      END IF;
    END $$
  `;
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS min_tier TEXT`;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_lessons_min_tier_check'
      ) THEN
        ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_min_tier_check
          CHECK (min_tier IS NULL OR min_tier IN ('self-paced','cohort','operator'));
      END IF;
    END $$
  `;
  // max_tier mirrors min_tier as an upper-bound gate. Used for tier-exclusive
  // lessons (e.g. a Tier-1-only welcome video that higher tiers shouldn't see).
  // NULL = no upper bound. comp tier and admins bypass max_tier — see
  // userCanAccessLesson() in src/lib/lms.ts.
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS max_tier TEXT`;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_lessons_max_tier_check'
      ) THEN
        ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_max_tier_check
          CHECK (max_tier IS NULL OR max_tier IN ('self-paced','cohort','operator'));
      END IF;
    END $$
  `;
  await sql`ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id, position)`;
  console.log("  ✓ course_lessons extended (module_id, body_kind, video_url, bundle_main_filename, min_tier, max_tier, is_published)");

  await sql`
    CREATE TABLE IF NOT EXISTS lesson_assets (
      id SERIAL PRIMARY KEY,
      lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      content_type TEXT NOT NULL,
      data TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'other'
        CHECK (role IN ('main_html','audio','image','attachment','other')),
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (lesson_id, relative_path)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lesson_assets_lesson ON lesson_assets(lesson_id)`;
  console.log("  ✓ lesson_assets table created");

  // MTR Viability Calculator — gated lead-magnet results stored as JSONB.
  // Token-addressable so guests can revisit via emailed magic-link.
  await sql`
    CREATE TABLE IF NOT EXISTS viability_scorecards (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      property_nickname TEXT,
      answers JSONB NOT NULL,
      section_scores JSONB NOT NULL,
      overall_score NUMERIC(5,2) NOT NULL,
      band TEXT NOT NULL CHECK (band IN ('high','moderate','low')),
      status TEXT NOT NULL DEFAULT 'pending_capture'
        CHECK (status IN ('pending_capture','unlocked')),
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      pipeline_contact_id INT REFERENCES pipeline_contacts(id) ON DELETE SET NULL,
      email TEXT,
      name TEXT,
      role TEXT,
      phone TEXT,
      opted_in_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unlocked_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_viability_scorecards_email ON viability_scorecards(LOWER(email))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_viability_scorecards_user ON viability_scorecards(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_viability_scorecards_pc ON viability_scorecards(pipeline_contact_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_viability_scorecards_created ON viability_scorecards(created_at DESC)`;
  console.log("  ✓ viability_scorecards table created");

  // RRR reseed: drop placeholder lessons + seed 13 module shells from the
  // master plan. Only runs if RRR has zero modules — idempotent re-run does
  // nothing.
  const rrrCheck = (await sql`
    SELECT c.id AS course_id,
      (SELECT COUNT(*)::int FROM course_modules m WHERE m.course_id = c.id) AS module_count
    FROM courses c WHERE c.slug = 'room-rental-riches' LIMIT 1
  `) as Array<{ course_id: number; module_count: number }>;

  if (rrrCheck.length > 0 && rrrCheck[0].module_count === 0) {
    const rrrId = rrrCheck[0].course_id;
    // Drop placeholder lessons (not yet attached to modules — flat seed data).
    await sql`DELETE FROM course_lessons WHERE course_id = ${rrrId} AND module_id IS NULL`;

    const RRR_MODULES: Array<{
      slug: string;
      title: string;
      summary: string;
      phase: string;
      position: number;
    }> = [
      { slug: "the-mtr-co-living-opportunity", title: "The MTR + Co-Living Opportunity", summary: "The 'why now' framing — 2026 Furnished Finder/AirDNA data, Atlanta STR cap case study, MTR vs. STR economics, 60-day promise.", phase: "Phase 1: Foundation", position: 10 },
      { slug: "legal-regulatory-business-setup", title: "Legal, Regulatory & Business Setup", summary: "State-by-state regulatory matrix (GA/FL/TX/NC/SC/VA/TN), LLC formation, insurance, lease structures.", phase: "Phase 1: Foundation", position: 20 },
      { slug: "choosing-your-path", title: "Choosing Your Path", summary: "Arbitrage vs. Ownership vs. Co-Host decision matrix. The Forced Commitment Exercise gates Module 4.", phase: "Phase 1: Foundation", position: 30 },
      { slug: "market-analysis-property-selection", title: "Market Analysis & Property Selection (AI-Powered)", summary: "AI prompts for market research, Demand Driver Mapping for 7 Southeast metros, AirDNA + Furnished Finder Pro integration.", phase: "Phase 2: Acquisition", position: 40 },
      { slug: "securing-your-first-property", title: "Securing Your First Property", summary: "Email pitch versions, landlord and owner objection handlers, lease addendum templates.", phase: "Phase 2: Acquisition", position: 50 },
      { slug: "hospitality-grade-design", title: "Hospitality-Grade Design (FLAGSHIP)", summary: "Will Guidara framework applied to MTR. Tenant personas, signature touches, room-by-room guides — the BNHG differentiator.", phase: "Phase 3: Setup", position: 60 },
      { slug: "your-modern-tech-stack", title: "Your Modern Tech Stack", summary: "Hospitable + PriceLabs + Turno + AI + Smart Locks + Stessa stack, AI Guest Messaging Prompt Library.", phase: "Phase 3: Setup", position: 70 },
      { slug: "multi-channel-listing-strategy", title: "Multi-Channel Listing Strategy", summary: "AI Listing Copy Prompt Library, headline formulas, per-platform photo strategy, channel-specific walkthroughs.", phase: "Phase 4: Launch", position: 80 },
      { slug: "pricing-for-profit", title: "Pricing for Profit (MTR Math)", summary: "MTR Pricing Calculator V3, BNHG length-of-stay discount framework (15-25% vs. industry 35-46%), seasonal calendars.", phase: "Phase 4: Launch", position: 90 },
      { slug: "guest-experience-systems", title: "Guest Experience Systems", summary: "23+ pre-configured message templates, 25-scenario Issue Resolution Playbook, repeat-guest rebooking funnel.", phase: "Phase 5: Operations", position: 100 },
      { slug: "cleaning-maintenance-vendor-management", title: "Cleaning, Maintenance & Vendor Management", summary: "Hospitality-Grade Cleaning Checklist, 6-vendor essential network, Preventive Maintenance Calendar, Damage Documentation Workflow.", phase: "Phase 5: Operations", position: 110 },
      { slug: "scaling-beyond-your-first-property", title: "Scaling Beyond Your First Property", summary: "Property #1 Readiness Audit, SOP Template Library, VA Hiring Playbook, 5-10 Property Roadmap, W-2 Replacement Calculator.", phase: "Phase 6: Growth", position: 120 },
      { slug: "bonus-pack-direct-booking-ai-visibility", title: "Bonus Pack: Direct Booking & AI Visibility", summary: "Direct booking moat + AI-era visibility. Lessons B.1–B.4 are Tier 1; B.5–B.12 are Cohort+Operator only.", phase: "Bonus Pack", position: 130 },
    ];

    for (const m of RRR_MODULES) {
      await sql`
        INSERT INTO course_modules (course_id, slug, title, summary, phase_label, position)
        VALUES (${rrrId}, ${m.slug}, ${m.title}, ${m.summary}, ${m.phase}, ${m.position})
        ON CONFLICT (course_id, slug) DO NOTHING
      `;
    }
    console.log(`  ✓ RRR reseeded: ${RRR_MODULES.length} module shells`);
  } else {
    console.log("  · RRR module reseed skipped (already has modules)");
  }

  // Course waitlist: tier-tagged interest capture before enrollment opens.
  // One row per (email, course, tier) so a single person can join multiple
  // tier waitlists; ON CONFLICT silently dedupes repeat clicks.
  await sql`
    CREATE TABLE IF NOT EXISTS course_waitlist (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      course_slug TEXT NOT NULL DEFAULT 'room-rental-riches',
      tier TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      notified_at TIMESTAMPTZ,
      UNIQUE(email, course_slug, tier)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS course_waitlist_created_idx ON course_waitlist(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS course_waitlist_tier_idx ON course_waitlist(tier)`;
  console.log("  ✓ course_waitlist table created");

  // ---------------------------------------------------------------------------
  // Marketplace products. Admin-managed catalog feeding /marketplace. tab_id
  // groups by audience (property / hotel / auto / back-office). position
  // controls display order within the tab. Slug doubles as the click-tracking
  // product_id so existing marketplace_clicks rows keep working when a row
  // is renamed in admin (id stays stable on update).
  // ---------------------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS marketplace_products (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      tab_id TEXT NOT NULL CHECK (tab_id IN ('property','hotel','auto','back-office')),
      name TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      bullets TEXT[] NOT NULL DEFAULT '{}',
      image_url TEXT NOT NULL DEFAULT '',
      image_alt TEXT NOT NULL DEFAULT '',
      price_range TEXT NOT NULL DEFAULT '',
      network TEXT NOT NULL CHECK (network IN ('amazon','lowes','wayfair','direct','other')),
      affiliate_url TEXT NOT NULL,
      badge TEXT,
      status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','out-of-stock','soon')),
      tags TEXT[] NOT NULL DEFAULT '{}',
      position INT NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_marketplace_products_tab ON marketplace_products(tab_id, position)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_marketplace_products_published ON marketplace_products(is_published) WHERE is_published = true`;
  console.log("  ✓ marketplace_products table created");

  // Seed the 12 placeholder rows from the original typed catalog. ON CONFLICT
  // on slug keeps the seed idempotent — re-running the migration won't
  // overwrite admin edits.
  const MARKETPLACE_SEED: Array<{
    slug: string;
    tab_id: string;
    name: string;
    body: string;
    bullets: string[];
    image_url: string;
    image_alt: string;
    price_range: string;
    network: string;
    affiliate_url: string;
    badge: string | null;
    status: string;
    tags: string[];
    position: number;
  }> = [
    {
      slug: "property-smart-lockbox",
      tab_id: "property",
      name: "Smart Lockbox (4-Digit Combo)",
      body: "The unattended-checkin workhorse. Weatherproof, rotatable code, mounts to a doorknob or a permanent bracket.",
      bullets: [
        "Rotatable code means no key handoff ever",
        "Survives Southeast humidity without rust",
        "Backup we keep at every Be Nice Property",
      ],
      image_url: "/images/Website Images/module-11-cleaning.png",
      image_alt: "Outdoor smart lockbox mounted by a front door",
      price_range: "$24–$40",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "Della Uses This",
      status: "live",
      tags: ["lockbox", "access", "check-in", "smart lock"],
      position: 10,
    },
    {
      slug: "property-linen-set",
      tab_id: "property",
      name: "Hotel-Grade White Linen Set (Queen)",
      body: "The same percale we put on every MTR bed. White only — so bleach and rotation works. Holds up past 100 washes.",
      bullets: [
        "300 thread count percale, white only",
        "Per-bed pricing pencils out under $1/night",
        "Order three sets per bed for the rotation",
      ],
      image_url: "/images/Website Images/module-06-design.png",
      image_alt: "Folded white hotel-grade linens stacked on a wooden surface",
      price_range: "$80–$110",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "Best Value",
      status: "live",
      tags: ["linen", "bedding", "sheets", "housekeeping"],
      position: 20,
    },
    {
      slug: "property-mattress-topper",
      tab_id: "property",
      name: "Cooling Mattress Topper",
      body: "The single highest-leverage upgrade for an MTR bed. Turns a $400 mattress into a 5-star review.",
      bullets: [
        "Cooling gel, not cheap memory foam",
        "Hides wear on older mattresses",
        "Costs less than one bad review",
      ],
      image_url: "/images/Website Images/module-10-guest-experience.png",
      image_alt: "Bed made with a cooling mattress topper and white sheets",
      price_range: "$60–$95",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "Editor's Pick",
      status: "live",
      tags: ["mattress", "topper", "bedding", "sleep"],
      position: 30,
    },
    {
      slug: "hotel-bathroom-amenity-set",
      tab_id: "hotel",
      name: "Refillable Bathroom Amenity Set",
      body: "Stop buying single-use bottles. Refillable shampoo, conditioner, and body wash that looks more upscale than the disposable stuff anyway.",
      bullets: [
        "Cuts amenity cost roughly 60% in year one",
        "Quietly improves guest reviews on sustainability",
        "Pairs with a bulk-fill program — we'll link both",
      ],
      image_url: "/images/Website Images/Workspace Nook.png",
      image_alt: "Refillable bathroom amenity bottles arranged on a stone tray",
      price_range: "$45–$80",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "New",
      status: "live",
      tags: ["amenities", "bathroom", "sustainability"],
      position: 10,
    },
    {
      slug: "hotel-front-desk-tablet",
      tab_id: "hotel",
      name: "Front Desk Tablet Stand (Secure)",
      body: "Locking, swiveling tablet stand for self-check-in and digital concierge. Same model we recommend in Signal teardowns.",
      bullets: [
        "Locks to the counter, no overnight removal",
        "Swivels for guest-facing kiosk mode",
        "Fits iPad and most 10–11\" Android tablets",
      ],
      image_url: "/images/Website Images/alex in hotel lobby.png",
      image_alt: "Tablet mounted on a secure stand at a boutique hotel front desk",
      price_range: "$120–$180",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: null,
      status: "live",
      tags: ["front desk", "tablet", "kiosk", "tech"],
      position: 20,
    },
    {
      slug: "hotel-luggage-cart",
      tab_id: "hotel",
      name: "Bellhop-Style Luggage Cart",
      body: "Looks the part, rolls quietly, doesn't dent a hardwood floor. The detail that makes a 12-room property feel like a hotel.",
      bullets: [
        "Carpeted deck, brass rails",
        "Rolls on hardwood without scuffing",
        "Foldable footprint for compact lobbies",
      ],
      image_url:
        "/images/Website Images/hf_20260312_051512_fbdd9c4e-fc8a-41fa-8575-219882dfe238.jpeg",
      image_alt: "Brass luggage cart in a warmly lit boutique hotel lobby",
      price_range: "$280–$420",
      network: "wayfair",
      affiliate_url: "https://www.wayfair.com/",
      badge: null,
      status: "live",
      tags: ["lobby", "luggage", "front of house"],
      position: 30,
    },
    {
      slug: "auto-dashcam-front-rear",
      tab_id: "auto",
      name: "Front + Rear Dashcam (4K)",
      body: "The single piece of gear every Turo car should have. Resolves disputes in 30 seconds with date-stamped video.",
      bullets: [
        "4K front, 1080p rear",
        "Parking mode catches lot dings",
        "G-sensor auto-locks footage on impact",
      ],
      image_url: "/images/Website Images/crr-collage-03-dashboard.png",
      image_alt: "Dashcam mounted to a vehicle windshield",
      price_range: "$140–$220",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "Della Uses This",
      status: "live",
      tags: ["dashcam", "turo", "evidence", "camera"],
      position: 10,
    },
    {
      slug: "auto-obd2-reader",
      tab_id: "auto",
      name: "OBD-II Bluetooth Scanner",
      body: "When the check-engine light comes on at 11pm, this tells you whether it's a $0 fix or a Monday-morning shop visit.",
      bullets: [
        "Pairs with iOS and Android",
        "Reads and clears every common code",
        "Saves a shop trip on most P0420 false positives",
      ],
      image_url: "/images/Website Images/crr-collage-02-steering-wheel.png",
      image_alt: "OBD-II Bluetooth scanner plugged into a vehicle's diagnostic port",
      price_range: "$35–$60",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "Best Value",
      status: "live",
      tags: ["obd2", "diagnostics", "turo", "maintenance"],
      position: 20,
    },
    {
      slug: "auto-detail-kit",
      tab_id: "auto",
      name: "Turnover Detail Kit",
      body: "What we put in every car's trunk: microfibers, interior cleaner, glass cleaner, tire shine. Fits in a small caddy.",
      bullets: [
        "Microfibers for paint and interior",
        "One-bottle interior cleaner that's safe on leather",
        "Lives in the trunk, not the garage",
      ],
      image_url: "/images/Website Images/crr-collage-04-exterior.png",
      image_alt: "Auto detailing kit laid out on a driveway",
      price_range: "$45–$75",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: null,
      status: "live",
      tags: ["detail", "cleaning", "turo", "turnover"],
      position: 30,
    },
    {
      slug: "back-office-unreasonable-hospitality",
      tab_id: "back-office",
      name: "Unreasonable Hospitality — Will Guidara",
      body: "The single most-recommended book on the BNHG bookshelf. The framework behind Module 6 of Room Rental Riches.",
      bullets: [
        "Required reading for every BNHG hire",
        "Frames the hospitality-grade design module",
        "Audio version is excellent for the car",
      ],
      image_url: "/images/Website Images/module-06-design.png",
      image_alt: "Copy of Unreasonable Hospitality by Will Guidara on a desk",
      price_range: "$18–$28",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: "Editor's Pick",
      status: "live",
      tags: ["book", "hospitality", "guidara", "training"],
      position: 10,
    },
    {
      slug: "back-office-quickbooks",
      tab_id: "back-office",
      name: "QuickBooks Self-Employed",
      body: "The bookkeeping setup we use across every Be Nice entity. Mileage tracking alone covers the subscription cost.",
      bullets: [
        "Quarterly tax estimate built-in",
        "Auto-mileage tracking via phone GPS",
        "Affiliate code below saves first month",
      ],
      image_url: "/images/Website Images/alex at his computer.png",
      image_alt: "Laptop showing accounting software dashboard",
      price_range: "$20/mo",
      network: "direct",
      affiliate_url: "https://quickbooks.intuit.com/",
      badge: null,
      status: "live",
      tags: ["accounting", "bookkeeping", "tax", "software"],
      position: 20,
    },
    {
      slug: "back-office-planner",
      tab_id: "back-office",
      name: "Weekly Operator Planner",
      body: "Paper, not Notion. The same weekly cadence Della runs every Sunday night across all six properties.",
      bullets: [
        "Single weekly spread, no monthly fluff",
        "13-week quarter layout",
        "Lays flat without breaking the spine",
      ],
      image_url: "/images/Website Images/Della Behind Desk.png",
      image_alt: "Operator planner open on a desk next to a coffee cup",
      price_range: "$32–$48",
      network: "amazon",
      affiliate_url: "https://www.amazon.com/",
      badge: null,
      status: "live",
      tags: ["planner", "weekly", "productivity"],
      position: 30,
    },
  ];

  for (const p of MARKETPLACE_SEED) {
    await sql`
      INSERT INTO marketplace_products (
        slug, tab_id, name, body, bullets, image_url, image_alt,
        price_range, network, affiliate_url, badge, status, tags, position
      )
      VALUES (
        ${p.slug}, ${p.tab_id}, ${p.name}, ${p.body}, ${p.bullets},
        ${p.image_url}, ${p.image_alt}, ${p.price_range}, ${p.network},
        ${p.affiliate_url}, ${p.badge}, ${p.status}, ${p.tags}, ${p.position}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`  ✓ marketplace_products seeded (${MARKETPLACE_SEED.length} rows)`);

  // Marketplace affiliate click tracking. One row per outbound click on
  // /marketplace, fired via /api/marketplace/click with keepalive so the
  // request survives the navigation. product_id matches the slug in
  // marketplace_products. user_id is nullable so anonymous visitors are
  // captured too.
  await sql`
    CREATE TABLE IF NOT EXISTS marketplace_clicks (
      id SERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      network TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      referrer TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_marketplace_clicks_product ON marketplace_clicks(product_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_marketplace_clicks_network ON marketplace_clicks(network)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_marketplace_clicks_created_at ON marketplace_clicks(created_at DESC)`;
  console.log("  ✓ marketplace_clicks table created");

  // ===========================================================================
  // Claim Proof — Command Center Phase 2: cross-device claim tracking.
  //
  // Buyers now get a real account (reuses the users/user_sessions system). A
  // WORKSPACE is the unit that owns claims and holds the purchased tier; a
  // solo buyer's workspace has one member (them), a Fleet buyer's workspace
  // can hold up to 5 additional invited members who share the workspace's
  // claims. Claim CONTENT (worksheet rows, comms log, checklist state) syncs
  // to the server as JSON so it follows the buyer across devices.
  // ===========================================================================

  await sql`
    CREATE TABLE IF NOT EXISTS cp_workspaces (
      id SERIAL PRIMARY KEY,
      owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tier TEXT NOT NULL DEFAULT 'core' CHECK (tier IN ('core', 'pro', 'fleet')),
      name TEXT NOT NULL DEFAULT 'My Claims',
      -- Max additional members beyond the owner. Solo tiers = 0; fleet = 5.
      seat_limit INTEGER NOT NULL DEFAULT 0,
      -- The purchase email, so the webhook can attach a workspace before the
      -- buyer has finished creating their account (claimed later on signup).
      purchase_email TEXT,
      stripe_session_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_workspaces_owner ON cp_workspaces(owner_user_id)`;
  // (defined just below cp_workspaces so provisioning-before-signup has a home)
  await sql`
    CREATE TABLE IF NOT EXISTS cp_pending_purchases (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      tier TEXT NOT NULL CHECK (tier IN ('core', 'pro', 'fleet')),
      stripe_session_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      claimed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_pending_email ON cp_pending_purchases(LOWER(email)) WHERE claimed_at IS NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_workspaces_purchase_email ON cp_workspaces(LOWER(purchase_email))`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_workspaces_stripe_session ON cp_workspaces(stripe_session_id) WHERE stripe_session_id IS NOT NULL`;
  console.log("  ✓ cp_workspaces table created");

  await sql`
    CREATE TABLE IF NOT EXISTS cp_workspace_members (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES cp_workspaces(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (workspace_id, user_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_members_workspace ON cp_workspace_members(workspace_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_members_user ON cp_workspace_members(user_id)`;
  console.log("  ✓ cp_workspace_members table created");

  await sql`
    CREATE TABLE IF NOT EXISTS cp_claims (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES cp_workspaces(id) ON DELETE CASCADE,
      created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      -- The tracking skeleton: what the dashboard shows at a glance.
      label TEXT NOT NULL DEFAULT 'Untitled claim',
      vehicle TEXT,
      trip TEXT,
      stage TEXT NOT NULL DEFAULT 'documenting',
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      next_action TEXT,
      next_action_date DATE,
      appraisal_amount NUMERIC(12,2),
      shop_estimate NUMERIC(12,2),
      discovered_on DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_claims_workspace ON cp_claims(workspace_id, status, updated_at DESC)`;
  console.log("  ✓ cp_claims table created");

  // Full per-claim, per-tool content. One row per (claim, tool_key); `data`
  // holds the tool's JSON payload (worksheet rows, log entries, checklist map).
  // Last-write-wins keyed by tool, so two tools editing concurrently never
  // clobber each other. Not FK'd to a claim for GLOBAL tools (checklists on
  // reference pages that aren't tied to one claim) — those use a NULL claim_id
  // and are workspace-scoped.
  await sql`
    CREATE TABLE IF NOT EXISTS cp_claim_data (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES cp_workspaces(id) ON DELETE CASCADE,
      claim_id INTEGER REFERENCES cp_claims(id) ON DELETE CASCADE,
      tool_key TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      -- One payload per tool per claim (or per workspace when claim_id IS NULL).
      UNIQUE (workspace_id, claim_id, tool_key)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_claim_data_claim ON cp_claim_data(claim_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_claim_data_workspace_tool ON cp_claim_data(workspace_id, tool_key)`;
  // Partial unique index for workspace-scoped rows (claim_id IS NULL): the
  // table UNIQUE constraint treats NULLs as distinct, so enforce it explicitly.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_claim_data_ws_tool_nullclaim
    ON cp_claim_data(workspace_id, tool_key)
    WHERE claim_id IS NULL
  `;
  console.log("  ✓ cp_claim_data table created");

  await sql`
    CREATE TABLE IF NOT EXISTS cp_invites (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES cp_workspaces(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      invited_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      accepted_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_invites_workspace ON cp_invites(workspace_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_invites_email ON cp_invites(LOWER(email))`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_invites_pending_email
    ON cp_invites(workspace_id, LOWER(email))
    WHERE accepted_at IS NULL AND revoked_at IS NULL
  `;
  console.log("  ✓ cp_invites table created");

  // ===========================================================================
  // Claim Proof — purchase mirror for Unified Ops reporting.
  //
  // Stripe stays the ledger of record; this table exists so Unified Ops can
  // query revenue/customers over BNHG_DATABASE_URL without hitting Stripe.
  // Written by the shared webhook at fulfillment, backfilled by
  // scripts/backfill-claimproof-purchases.ts.
  // ===========================================================================

  await sql`
    CREATE TABLE IF NOT EXISTS claimproof_purchases (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_payment_intent TEXT,
      email TEXT NOT NULL,
      tier TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      amount_discount_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'paid',
      purchased_at TIMESTAMPTZ NOT NULL,
      refunded_at TIMESTAMPTZ,
      portal_first_login TIMESTAMPTZ,
      portal_last_login TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimproof_purchases_email ON claimproof_purchases(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimproof_purchases_purchased_at ON claimproof_purchases(purchased_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimproof_purchases_payment_intent ON claimproof_purchases(stripe_payment_intent)`;
  console.log("  ✓ claimproof_purchases table created");

  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ`;
  console.log("  ✓ newsletter_subscribers.unsubscribed_at added");

  // ===========================================================================
  // Resource tools — generic lead capture for the gated /resources tools
  // (Room Rental Price Calculator, Start-Up Cost Worksheet, P&L, Setup
  // Checklist, and the Phase 2 trackers/worksheets/reference libraries).
  //
  // One row per (tool_slug, unlock) so the same person opening two tools is
  // logged twice — that per-tool interest is the point. Access itself is
  // granted by a signed cookie, not a row here, so there is no token/status
  // column like the scorecard's viability_scorecards table.
  // ===========================================================================
  await sql`
    CREATE TABLE IF NOT EXISTS resource_leads (
      id SERIAL PRIMARY KEY,
      tool_slug TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      role TEXT,
      phone TEXT,
      opted_in_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      pipeline_contact_id INT REFERENCES pipeline_contacts(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_leads_slug ON resource_leads(tool_slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_leads_email ON resource_leads(LOWER(email))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_leads_created ON resource_leads(created_at DESC)`;
  console.log("  ✓ resource_leads table created");

  // Resource tool state — server-side account-save for logged-in users. The
  // Phase 2 trackers (Maintenance, Contractor Rolodex, Inventory) and the
  // worksheet persist a JSONB blob per (user, tool) so a logged-in operator's
  // data follows them across devices. Anonymous (email-only) users fall back to
  // localStorage. One row per (user_id, tool_slug).
  await sql`
    CREATE TABLE IF NOT EXISTS resource_tool_state (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tool_slug TEXT NOT NULL,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, tool_slug)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_tool_state_user ON resource_tool_state(user_id)`;
  console.log("  ✓ resource_tool_state table created");

  console.log("Migrations complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
