export type CourseFormData = {
  title: string;
  description: string;
  category: string;
  level: string;
  modality: "virtual" | "presencial";
  city?: string;
  location?: string;
  courseType: string;
  startDate: string;
  duration: string;
  price: number;
  maxStudents?: number;
  imageUrl?: string;
  sections: CourseSection[];
  finalExam?: CourseFinalExam;
};

export type CourseFinalExam = {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  passingScore: number; // Calificación mínima para aprobar (default: 80)
  questions: QuizQuestion[];
  timeLimit?: number; // Tiempo límite en minutos (opcional)
  attemptsAllowed?: number; // Número de intentos permitidos (opcional)
};

export type CourseSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[]; // Para multiple-choice
  correctAnswer?: string | number; // Para multiple-choice y true-false
  points?: number;
};

export type EvaluationCriterion = {
  id: string;
  criterion: string;
  points?: number;
  description?: string;
};

export type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment";
  duration?: string;
  order: number;
  content?: string;
  videoUrl?: string;
  files?: CourseFile[];
  resources?: CourseResource[];
  quizQuestions?: QuizQuestion[];
  evaluationCriteria?: EvaluationCriterion[];
};

export type CourseFile = {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "other";
  url: string;
  size?: number;
};

export type CourseResource = {
  id: string;
  title: string;
  url: string;
  type: "link" | "file";
};

