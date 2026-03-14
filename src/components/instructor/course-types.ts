export type CourseFormData = {
  id?: string; // presente al editar un curso existente
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

export type SectionQuizQuestion = {
  question: string;
  options: string[];
  correct: number; // índice de la opción correcta
};

export type SectionQuiz = {
  passingScore: number; // 0-100, default 70
  questions: SectionQuizQuestion[];
};

// Mini-games
export type MemoryPair = { term: string; definition: string };
export type HangmanWord = { word: string; hint: string };

export type MemoryMinigame = {
  type: "memory";
  pairs: MemoryPair[]; // 4–8 pairs
};

export type HangmanMinigame = {
  type: "hangman";
  words: HangmanWord[]; // 3–5 words
};

export type SortMinigame = {
  type: "sort";
  instruction: string; // e.g. "Ordena los pasos del proceso"
  items: string[]; // Items in correct order
};

export type SectionMinigame = MemoryMinigame | HangmanMinigame | SortMinigame;

export type CourseSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
  quiz?: SectionQuiz;
  minigame?: SectionMinigame;
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

