export type DimensionKey =
  | "revenue_opportunity"
  | "online_reputation"
  | "competitive_position"
  | "guest_personas"
  | "tech_stack"
  | "visibility_discoverability";

export type FocusDimensionKey = DimensionKey | "quick_wins" | "general_all_seven";

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export type AuditStatus = "active" | "expired" | "archived";

export type NurtureStep = "day_3" | "day_7" | "day_14";

export type AuditEventType =
  | "audit_created"
  | "email_submitted"
  | "report_viewed"
  | "cta_clicked"
  | "booked_call"
  | "nurture_sent"
  | "nurture_opened"
  | "outreach_sent";

export interface DimensionScore {
  subscore: number;
  grade: LetterGrade;
  findings: string[];
}

export interface QuickWin {
  title: string;
  effort: "this_week" | "this_month" | "this_quarter";
  pillar: "commercial" | "guest_experience" | "tech";
  finding: string;
  action: string;
}

export interface AuditData {
  hotel: {
    name: string;
    slug: string;
    url: string;
    location: string | null;
    room_count: number | null;
  };
  overall: {
    score: number;
    grade: LetterGrade;
    summary: string;
  };
  dimensions: {
    revenue_opportunity: DimensionScore;
    online_reputation: DimensionScore;
    competitive_position: DimensionScore;
    guest_personas: DimensionScore;
    tech_stack: DimensionScore;
    visibility_discoverability: DimensionScore;
  };
  quick_wins: [QuickWin, QuickWin, QuickWin];
  generated_at: string;
  signal_referral_eligible: boolean;
}

export interface AuditCreatePayload {
  audit_data: AuditData;
}

export interface AuditCreateResponse {
  token: string;
  url: string;
  expires_at: string;
}

export interface AuditTeaserResponse {
  hotel_name: string;
  hotel_location: string | null;
  overall_score: number;
  overall_grade: LetterGrade;
  generated_at: string;
}

export interface AuditRow {
  id: number;
  token: string;
  hotel_url: string;
  hotel_slug: string;
  hotel_name: string;
  hotel_location: string | null;
  room_count: number | null;
  overall_score: number;
  overall_grade: LetterGrade;
  audit_data: AuditData;
  status: AuditStatus;
  created_at: string;
  expires_at: string | null;
}
