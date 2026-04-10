export type StudentCourse = {
  id: string;
  title: string;
  modality: "virtual" | "presencial" | "live";
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
  /** Última lección con actividad — para el botón "Continúa donde lo dejaste" */
  lastLessonId?: string;
  lastLessonTitle?: string;
};

export type UpcomingClass = {
  id: string;
  courseId: string;
  courseTitle: string;
  dateTime: string;
  modality: "virtual" | "presencial" | "live";
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
  score?: number;
  category: string;
  modality: "virtual" | "presencial" | "live";
  hours?: number;
  imageUrl?: string;
  instructorSignatureUrl?: string | null;
  adminSignatureUrl?: string | null;
  /** Altura de la firma en px (default 48 → 3rem) */
  signatureHeight?: number;
};

export type Recommendation = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  modality: "virtual" | "presencial" | "live";
  imageUrl?: string;
};
