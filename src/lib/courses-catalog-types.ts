export type CourseStatus = "live" | "coming-soon" | "in-development";

export type CourseCategory = "property" | "vehicle" | "hotel";

export interface CatalogCourse {
  slug: string;
  title: string;
  tagline: string;
  category: CourseCategory;
  assetTypes: string[];
  status: CourseStatus;
  releaseLabel: string;
  startingPrice?: string;
  curriculumNote?: string;
  href?: string;
  description: string;
  image?: {
    src: string;
    alt: string;
    /** Anchor point for `object-cover` cropping. Defaults to center. */
    anchor?: "top" | "bottom";
  };
}

export interface CatalogCategory {
  id: CourseCategory;
  label: string;
  body: string;
  /** Shown inside the tab panel when this category has zero courses. */
  emptyState?: string;
}
