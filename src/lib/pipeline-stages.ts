export const PIPELINE_STAGES = [
  { value: "prospect", label: "Not Contacted", color: "#9ca3af" },
  { value: "email_sent", label: "Email Sent", color: "#60a5fa" },
  { value: "linkedin_sent", label: "LinkedIn Sent", color: "#0a66c2" },
  { value: "replied", label: "Replied", color: "#10b981" },
  { value: "meeting_booked", label: "Meeting Booked", color: "#f5a623" },
  { value: "qualified", label: "Qualified", color: "#5b9a2f" },
  { value: "proposal", label: "Proposal", color: "#f97316" },
  { value: "client", label: "Client", color: "#8b5cf6" },
  { value: "closed_lost", label: "Closed Lost", color: "#6b7280" },
] as const;

export type PipelineStageValue = (typeof PIPELINE_STAGES)[number]["value"];

export const PIPELINE_STAGE_VALUES = PIPELINE_STAGES.map((s) => s.value) as readonly PipelineStageValue[];

export const STAGE_ORDER: Record<PipelineStageValue, number> = PIPELINE_STAGES.reduce(
  (acc, stage, idx) => {
    acc[stage.value] = idx;
    return acc;
  },
  {} as Record<PipelineStageValue, number>,
);

export const STAGE_LABELS: Record<PipelineStageValue, string> = PIPELINE_STAGES.reduce(
  (acc, stage) => {
    acc[stage.value] = stage.label;
    return acc;
  },
  {} as Record<PipelineStageValue, string>,
);

export const STAGE_COLORS: Record<PipelineStageValue, string> = PIPELINE_STAGES.reduce(
  (acc, stage) => {
    acc[stage.value] = stage.color;
    return acc;
  },
  {} as Record<PipelineStageValue, string>,
);

// Activity types that auto-advance the stage forward (never backward).
export const ACTIVITY_STAGE_ADVANCE: Partial<Record<string, PipelineStageValue>> = {
  email_sent: "email_sent",
  linkedin_sent: "linkedin_sent",
  replied: "replied",
  meeting_booked: "meeting_booked",
  meeting_held: "meeting_booked",
  proposal_sent: "proposal",
  closed_won: "client",
  closed_lost: "closed_lost",
};

export const ACTIVITY_TYPES = [
  { value: "email_sent", label: "Email sent" },
  { value: "linkedin_sent", label: "LinkedIn message sent" },
  { value: "replied", label: "Prospect replied" },
  { value: "call_held", label: "Call held" },
  { value: "meeting_booked", label: "Meeting booked" },
  { value: "meeting_held", label: "Meeting held" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "closed_won", label: "Closed won (client)" },
  { value: "closed_lost", label: "Closed lost" },
  { value: "note", label: "Note" },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];
