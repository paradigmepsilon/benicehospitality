import { z } from "zod";
import { auditDataSchema } from "@/lib/validation/audit";

export const sendScheduleSchema = z.object({
  daily_window: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM"),
    timezone: z.string().min(1).max(64),
  }),
  daily_cap: z.number().int().min(1).max(50),
  send_days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).min(1),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
});

export const outreachBatchTargetSchema = z.object({
  hotel_url: z.string().url().max(2000),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().max(320),
  contact_role: z.string().max(100).optional(),
  audit_data: auditDataSchema,
  draft_subject: z.string().min(1).max(500),
  draft_body: z.string().min(1),
  quality_failed: z.boolean().optional(),
  processed_at: z.string().optional(),
});

export const outreachBatchPayloadSchema = z.object({
  batch_id: z.string().min(1).max(64),
  campaign_name: z.string().min(1).max(255),
  generated_at: z.string(),
  send_schedule: sendScheduleSchema,
  targets: z.array(outreachBatchTargetSchema).min(1).max(100),
});

export const targetEditSchema = z.object({
  draft_subject: z.string().min(1).max(500).optional(),
  draft_body: z.string().min(1).optional(),
});

export const resendWebhookEventSchema = z.object({
  type: z.enum([
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.complained",
    "email.bounced",
    "email.opened",
    "email.clicked",
  ]),
  data: z.object({
    email_id: z.string().optional(),
    to: z.union([z.string(), z.array(z.string())]).optional(),
    bounce: z.object({ message: z.string().optional() }).optional(),
    click: z.object({ link: z.string().optional() }).optional(),
  }).passthrough(),
});

export const inboundReplyPayloadSchema = z.object({
  from: z.string().email(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
});
