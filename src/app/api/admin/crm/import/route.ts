import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import Papa from "papaparse";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const EXPECTED_HEADERS = [
  "region",
  "state",
  "city",
  "property_name",
  "url",
  "room_count",
  "owner_name",
  "owner_role",
  "contact_email",
  "linkedin",
  "notes",
  "fit_quality",
] as const;

const rowSchema = z.object({
  region: z.string().trim().optional().default(""),
  state: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  property_name: z.string().trim().min(1, "property_name is required"),
  url: z.string().trim().min(1, "url is required"),
  room_count: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined || v === null ? "" : String(v).trim())),
  owner_name: z.string().trim().optional().default(""),
  owner_role: z.string().trim().optional().default(""),
  contact_email: z.string().trim().min(1, "contact_email is required"),
  linkedin: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
  fit_quality: z.string().trim().optional().default(""),
});

function deriveContactName(ownerName: string, propertyName: string): string {
  if (!ownerName) return propertyName;
  const first = ownerName.split(/[&/,]/)[0]?.trim();
  return first || propertyName;
}

function isLinkedInUrl(value: string): boolean {
  return /^https?:\/\/(www\.)?linkedin\.com\//i.test(value.trim());
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a 'csv' file." }, { status: 400 });
  }

  const file = formData.get("csv");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'csv' file in form data." }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse error", details: parsed.errors.slice(0, 5) },
      { status: 400 },
    );
  }

  const headers = parsed.meta.fields ?? [];
  const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `CSV header mismatch. Missing columns: ${missing.join(", ")}. Expected: ${EXPECTED_HEADERS.join(", ")}` },
      { status: 400 },
    );
  }

  const batchId = randomUUID();
  let inserted = 0;
  let updated = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i];
    const rowNum = i + 2; // +2 = 1-indexed + header row
    const validation = rowSchema.safeParse(raw);
    if (!validation.success) {
      errors.push({ row: rowNum, reason: validation.error.issues.map((iss) => iss.message).join("; ") });
      continue;
    }
    const row = validation.data;

    const name = deriveContactName(row.owner_name, row.property_name);
    const company = row.owner_name || null;
    const linkedinValue = row.linkedin || null;
    const linkedinUrl = linkedinValue && isLinkedInUrl(linkedinValue) ? linkedinValue : null;
    const hotelLocation = [row.city, row.state].filter(Boolean).join(", ") || null;
    const fitQuality = row.fit_quality && /^[ABC]$/i.test(row.fit_quality) ? row.fit_quality.toUpperCase() : null;

    try {
      const result = await sql`
        INSERT INTO pipeline_contacts (
          name, email, hotel_name, hotel_location, room_count, company,
          pipeline_stage, source, notes,
          website_url, linkedin_url, fit_quality, region, state, city, owner_role,
          import_batch_id, imported_at
        )
        VALUES (
          ${name},
          ${row.contact_email},
          ${row.property_name},
          ${hotelLocation},
          ${row.room_count || null},
          ${company},
          'prospect',
          'csv_import',
          ${row.notes || null},
          ${row.url},
          ${linkedinUrl},
          ${fitQuality},
          ${row.region || null},
          ${row.state || null},
          ${row.city || null},
          ${row.owner_role || null},
          ${batchId},
          NOW()
        )
        ON CONFLICT (LOWER(COALESCE(website_url,'')), LOWER(COALESCE(hotel_name,''))) DO UPDATE SET
          name = COALESCE(pipeline_contacts.name, EXCLUDED.name),
          email = COALESCE(pipeline_contacts.email, EXCLUDED.email),
          hotel_location = COALESCE(pipeline_contacts.hotel_location, EXCLUDED.hotel_location),
          room_count = COALESCE(pipeline_contacts.room_count, EXCLUDED.room_count),
          company = COALESCE(pipeline_contacts.company, EXCLUDED.company),
          notes = COALESCE(pipeline_contacts.notes, EXCLUDED.notes),
          linkedin_url = COALESCE(pipeline_contacts.linkedin_url, EXCLUDED.linkedin_url),
          fit_quality = COALESCE(pipeline_contacts.fit_quality, EXCLUDED.fit_quality),
          region = COALESCE(pipeline_contacts.region, EXCLUDED.region),
          state = COALESCE(pipeline_contacts.state, EXCLUDED.state),
          city = COALESCE(pipeline_contacts.city, EXCLUDED.city),
          owner_role = COALESCE(pipeline_contacts.owner_role, EXCLUDED.owner_role),
          import_batch_id = EXCLUDED.import_batch_id,
          imported_at = EXCLUDED.imported_at,
          updated_at = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const wasInserted = result[0]?.inserted === true;
      if (wasInserted) inserted++;
      else updated++;

      const contactId = result[0]?.id as number;
      const linkedinRaw = row.linkedin || null;
      await sql`
        INSERT INTO pipeline_activities (contact_id, type, title, description, metadata)
        VALUES (
          ${contactId},
          'csv_imported',
          ${wasInserted ? "Imported from CSV" : "Re-imported from CSV"},
          ${`Batch ${batchId}`},
          ${JSON.stringify({ batch_id: batchId, fit_quality: fitQuality, linkedin_raw: linkedinRaw, row: rowNum })}
        )
      `;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      errors.push({ row: rowNum, reason });
    }
  }

  return NextResponse.json({ batchId, inserted, updated, errors, total: parsed.data.length });
}
