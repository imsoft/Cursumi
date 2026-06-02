export type InstructorCourse = {
  id: string;
  title: string;
  modality: "virtual" | "presencial" | "live";
  status: "published" | "draft" | "archived";
  studentsCount: number;
  nextSession?: string;
  category: string;
  price?: number;
  startDate?: string | null;
};

export type UpcomingSession = {
  id: string;
  courseTitle: string;
  dateTime: string;
  modality: "virtual" | "presencial" | "live";
  city?: string;
};
