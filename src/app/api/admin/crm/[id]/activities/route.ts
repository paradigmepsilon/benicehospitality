import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ACTIVITY_STAGE_ADVANCE, STAGE_ORDER, type PipelineStageValue } from "@/lib/pipeline-stages";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { type, title, description } = body as {
    type?: string;
    title?: string;
    description?: string;
  };

  // Default a friendly title from the type when caller doesn't supply one.
  const resolvedTitle =
    title ||
    (type
      ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Activity logged");

  // Verify contact exists
  const contact = await sql`SELECT id, pipeline_stage FROM pipeline_contacts WHERE id = ${id}`;
  if (contact.length === 0) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const result = await sql`
    INSERT INTO pipeline_activities (contact_id, type, title, description)
    VALUES (${id}, ${type || "manual"}, ${resolvedTitle}, ${description || null})
    RETURNING *
  `;

  // Auto-advance pipeline stage forward (never backward) based on activity type.
  let stageChanged: { from: string; to: string } | null = null;
  const targetStage = type ? ACTIVITY_STAGE_ADVANCE[type] : undefined;
  if (targetStage) {
    const currentStage = contact[0].pipeline_stage as PipelineStageValue;
    const currentOrder = STAGE_ORDER[currentStage] ?? -1;
    const targetOrder = STAGE_ORDER[targetStage];
    if (targetOrder > currentOrder) {
      await sql`
        UPDATE pipeline_contacts
        SET pipeline_stage = ${targetStage}, updated_at = NOW()
        WHERE id = ${id}
      `;
      await sql`
        INSERT INTO pipeline_activities (contact_id, type, title, metadata)
        VALUES (
          ${id},
          'stage_changed',
          ${"Stage advanced from " + currentStage + " to " + targetStage},
          ${JSON.stringify({ from: currentStage, to: targetStage, triggered_by: type })}
        )
      `;
      stageChanged = { from: currentStage, to: targetStage };
    } else {
      await sql`UPDATE pipeline_contacts SET updated_at = NOW() WHERE id = ${id}`;
    }
  } else {
    await sql`UPDATE pipeline_contacts SET updated_at = NOW() WHERE id = ${id}`;
  }

  return NextResponse.json({ activity: result[0], stageChanged }, { status: 201 });
}
