export type SessionFormat = "presencial" | "online";

export type CourseSessionData = {
  id?: string;        // presente al editar sesión existente
  /** presencial: sede física · online: videollamada */
  format: SessionFormat;
  state?: string;
  city: string;
  location: string;   // dirección/sede (presencial) o etiqueta corta (online)
  /** Meet, Zoom, Teams… — obligatorio cuando format = "online" */
  meetingUrl?: string;
  date: string;       // ISO date string
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  maxStudents: number;
  /** Código de acceso en texto plano — valor en edición (prellenado con el código actual si se conoce) */
  joinCode?: string;
  /** Código actualmente guardado en BD en claro, si se conoce (para mostrarlo al instructor) */
  savedJoinCode?: string;
  /** Si ya existe un hash guardado en BD (nunca exponemos el hash en cliente) */
  hasJoinCode?: boolean;
  /** Si true, se borrará el código existente al guardar */
  clearJoinCode?: boolean;
};

export type CourseFormData = {
  id?: string; // presente al editar un curso existente
  title: string;
  description: string;
  category: string;
  level: string;
  modality: "virtual" | "evento";
  /** Entidad federativa (México) */
  state?: string;
  city?: string;
  location?: string;
  mapsUrl?: string;
  courseType: string;
  startDate: string;
  duration: string;
  price: number;
  /** true = curso gratuito explícito (permite publicar con price 0) */
  isFree?: boolean;
  maxStudents?: number;
  imageUrl?: string;
  /** Solo evento + precio 0: nuevo código (se guarda como hash). Vacío = no cambiar (al editar). */
  freeJoinCode?: string;
  /** Quitar protección por código al guardar */
  clearFreeJoinCode?: boolean;
  /** Solo UI: ya existe código guardado (wizard / edición) */
  hasJoinCode?: boolean;
  sections: CourseSection[];
  finalExam?: CourseFinalExam;
  courseSessions?: CourseSessionData[]; // solo para cursos por evento
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
  /** Instrucción opcional para el alumno (p. ej. cómo jugar o el objetivo). */
  instruction?: string;
  pairs: MemoryPair[]; // 4–8 pairs
};

export type HangmanMinigame = {
  type: "hangman";
  /** Instrucción opcional para el alumno. */
  instruction?: string;
  words: HangmanWord[]; // 3–5 words
};

export type SortMinigame = {
  type: "sort";
  instruction: string; // e.g. "Ordena los pasos del proceso"
  items: string[]; // Items in correct order
};

export type MatchPair = { left: string; right: string };
export type MatchMinigame = {
  type: "match";
  instruction: string; // e.g. "Conecta cada concepto con su definición"
  pairs: MatchPair[]; // 4–8 pairs
};

export type SectionMinigame = MemoryMinigame | HangmanMinigame | SortMinigame | MatchMinigame;

/** Actividades de cierre de sección (varios tests y minijuegos). Si está vacío, se usan quiz/minigame legacy. */
export type SectionActivity =
  | { id: string; kind: "quiz"; passingScore: number; questions: SectionQuizQuestion[] }
  | { id: string; kind: "minigame"; minigame: SectionMinigame };

export type CourseSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
  /** Lista ordenada de actividades (preferido). */
  activities?: SectionActivity[];
  /** Legacy: un solo test */
  quiz?: SectionQuiz;
  /** Legacy: un solo minijuego */
  minigame?: SectionMinigame;
};

export type QuizQuestion = {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "checkbox" | "short-answer";
  options?: string[]; // Para multiple-choice y checkbox
  correctAnswer?: string | number; // Para multiple-choice y true-false (índice)
  correctAnswers?: number[]; // Para checkbox (múltiples índices correctos)
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
  type: "video" | "text" | "quiz" | "assignment" | "section_quiz" | "section_minigame";
  duration?: string;
  order: number;
  content?: string;
  videoUrl?: string;
  files?: CourseFile[];
  resources?: CourseResource[];
  quizQuestions?: QuizQuestion[];
  evaluationCriteria?: EvaluationCriterion[];
  // Quiz config (optional)
  quizTimeLimit?: number; // minutos
  quizAttempts?: number; // intentos permitidos
  quizPassingRequired?: boolean; // ¿requiere aprobar para continuar?
  quizPassingScore?: number; // porcentaje mínimo (0-100)
  /** Si true, la lección es visible públicamente sin enrolamiento (preview gratuita) */
  isFree?: boolean;
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

