import { sql } from "@/lib/db";
import { DOCS, getDoc } from "./journey";

export interface DocReview {
  docKey: string;
  reviewedBy: string | null;
  reviewedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export async function listDocReviews(): Promise<DocReview[]> {
  const rows = await sql`SELECT * FROM partnership_doc_reviews`;
  return rows.map((r) => ({
    docKey: r.doc_key,
    reviewedBy: r.reviewed_by,
    reviewedAt: new Date(r.reviewed_at).toISOString(),
    approvedBy: r.approved_by,
    approvedAt: r.approved_at ? new Date(r.approved_at).toISOString() : null,
  }));
}

export async function setDocReviewed(docKey: string, reviewed: boolean, actor: string | null): Promise<boolean> {
  if (!getDoc(docKey)) return false;
  if (reviewed) {
    await sql`
      INSERT INTO partnership_doc_reviews (doc_key, reviewed_by) VALUES (${docKey}, ${actor})
      ON CONFLICT (doc_key) DO NOTHING
    `;
  } else {
    // Unticking a document also withdraws its approval: it is being re-read.
    await sql`DELETE FROM partnership_doc_reviews WHERE doc_key = ${docKey}`;
  }
  return true;
}

/** Approve the set for use. Refuses unless every document in the library has been ticked. */
export async function approveAllDocs(actor: string | null): Promise<{ ok: true } | { ok: false; missing: string[] }> {
  const reviewed = new Set((await sql`SELECT doc_key FROM partnership_doc_reviews`).map((r) => r.doc_key as string));
  const missing = DOCS.filter((d) => !reviewed.has(d.key)).map((d) => d.title);
  if (missing.length > 0) return { ok: false, missing };
  await sql`UPDATE partnership_doc_reviews SET approved_by = ${actor}, approved_at = NOW() WHERE approved_at IS NULL`;
  return { ok: true };
}
