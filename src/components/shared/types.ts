// Tipos compartidos comunes

export type Modality = "virtual" | "presencial";

export type CourseStatus = "published" | "draft" | "archived" | "in-progress" | "completed" | "not-started";

export type CourseCategory =
  | "Programación"
  | "Marketing"
  | "Diseño"
  | "Negocios"
  | "Habilidades blandas";

export interface BaseCourse {
  id: string;
  title: string;
  modality: Modality;
  category: CourseCategory;
  instructorName: string;
  imageUrl?: string;
}

export interface FilterState {
  searchTerm: string;
  status: string;
  modality: string;
  category?: string;
}

