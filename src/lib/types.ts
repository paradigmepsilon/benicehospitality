export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface PillarCard {
  icon?: string;
  title: string;
  tagline: string;
  points: string[];
  stat?: string;
}

export interface PainPoint {
  icon?: string;
  stat: string;
  description: string;
  image?: string;
}

export interface ServiceTier {
  tier: number;
  label: string;
  headline: string;
  description: string;
  price?: string;
  timeline?: string;
  items: ServiceItem[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
}

export interface ServiceItem {
  name: string;
  description: string;
  price?: string;
  timeline?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  title: string;
  property: string;
  image?: string;
}

export interface CaseStudy {
  image: string;
  propertyType: string;
  location: string;
  challenge: string;
  result: string;
  metric: string;
  placeholder?: boolean;
}

export interface InsightPost {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  slug: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image?: string;
}

export interface Differentiator {
  icon?: string;
  title: string;
  description: string;
}

export interface FrameworkPhase {
  number: number;
  name: string;
  description: string;
}

export interface FreeResource {
  name: string;
  description: string;
  icon?: string;
}

export interface PropertyType {
  name: string;
  description: string;
  image: string;
}

export interface GuestallyFeature {
  icon?: string;
  title: string;
  description: string;
}

export interface MetricStat {
  value: string;
  suffix: string;
  label: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
  source: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hotel_name: string;
  hotel_location: string | null;
  room_count: string | null;
  interests: string | null;
  message: string | null;
  submitted_at: string;
  status: "new" | "contacted" | "closed";
}

export type CrmPipelineStage = "prospect" | "qualified" | "proposal" | "client" | "closed_lost";
export type CrmSource = "contact_form" | "booking" | "manual";
export type CrmActivityType =
  | "contact_form_submitted"
  | "booking_scheduled"
  | "booking_cancelled"
  | "stage_changed"
  | "note_added"
  | "manual";

export interface CrmContact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hotel_name: string | null;
  hotel_location: string | null;
  room_count: string | null;
  company: string | null;
  pipeline_stage: CrmPipelineStage;
  source: CrmSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmActivity {
  id: number;
  contact_id: number;
  type: CrmActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
