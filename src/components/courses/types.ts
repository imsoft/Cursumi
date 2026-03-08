export type CourseCategory = string;
export type CourseModality = "virtual" | "presencial";

export interface Course {
  id: string;
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
