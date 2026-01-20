export type CourseCategory = string;
export type CourseModality = "virtual" | "presencial";

export interface Course {
  id: string;
  title: string;
  modality: CourseModality;
  category: CourseCategory;
  city: string;
  description: string;
  duration: string;
  imageUrl: string;
}
