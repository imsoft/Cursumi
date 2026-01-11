export type InstructorCourse = {
  id: string;
  title: string;
  modality: "virtual" | "presencial";
  status: "published" | "draft" | "archived";
  studentsCount: number;
  nextSession?: string;
  category: string;
};

export type UpcomingSession = {
  id: string;
  courseTitle: string;
  dateTime: string;
  modality: "virtual" | "presencial";
  city?: string;
};

