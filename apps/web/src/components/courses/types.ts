export type CourseCategory = string;
export type CourseModality = "virtual" | "presencial" | "live";

export interface Course {
  id: string;
  slug?: string;
  title: string;
  modality: CourseModality;
  category: CourseCategory;
  level?: string;
  city: string;
  description: string;
  duration: string;
  price?: number;
  instructorName?: string;
  imageUrl: string;
}
