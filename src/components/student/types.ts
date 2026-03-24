export type StudentCourse = {
  id: string;
  title: string;
  modality: "virtual" | "presencial";
  progress: number;
  nextSession?: string;
  instructorName: string;
  category: string;
  status?: "in-progress" | "completed" | "not-started";
  purchaseDate?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  imageUrl?: string;
};

export type UpcomingClass = {
  id: string;
  courseId: string;
  courseTitle: string;
  dateTime: string;
  modality: "virtual" | "presencial";
  instructorName: string;
  city?: string;
  imageUrl?: string;
};

export type Certificate = {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  issueDate: string;
  certificateNumber: string;
  type: "accreditation" | "participation";
  category: string;
  modality: "virtual" | "presencial";
  hours?: number;
  imageUrl?: string;
};

export type Recommendation = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  modality: "virtual" | "presencial";
  imageUrl?: string;
};
