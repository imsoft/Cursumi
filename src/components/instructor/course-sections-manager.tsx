"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  FileText,
  Video,
  BookOpen,
  FileQuestion,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  Gamepad2,
} from "lucide-react";
import type {
  CourseSection,
  CourseLesson,
  SectionQuiz,
  SectionQuizQuestion,
  SectionMinigame,
  MemoryPair,
  HangmanWord,
} from "./course-types";
import { LessonEditor } from "./lesson-editor";

interface CourseSectionsManagerProps {
  sections: CourseSection[];
  onUpdate: (sections: CourseSection[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Editor de quiz de sección (inline dentro de cada sección)
function SectionQuizEditor({
  quiz,
  onChange,
}: {
  quiz: SectionQuiz | undefined;
  onChange: (quiz: SectionQuiz | undefined) => void;
}) {
  const [hasQuiz, setHasQuiz] = useState(!!quiz);
  const [passingScore, setPassingScore] = useState(quiz?.passingScore ?? 70);
  const [questions, setQuestions] = useState<SectionQuizQuestion[]>(quiz?.questions ?? []);

  // Nueva pregunta
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrect, setNewCorrect] = useState<number | null>(null);

  const syncUp = (enabled: boolean, qs: SectionQuizQuestion[], score: number) => {
    if (!enabled || qs.length === 0) {
      onChange(undefined);
    } else {
      onChange({ passingScore: score, questions: qs });
    }
  };

  const toggleQuiz = (enabled: boolean) => {
    setHasQuiz(enabled);
    syncUp(enabled, questions, passingScore);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const validOptions = newOptions.filter((o) => o.trim());
    if (validOptions.length < 2 || newCorrect === null) return;

    const q: SectionQuizQuestion = {
      question: newQuestion.trim(),
      options: validOptions,
      correct: newCorrect,
    };
    const updated = [...questions, q];
    setQuestions(updated);
    setNewQuestion("");
    setNewOptions(["", "", "", ""]);
    setNewCorrect(null);
    syncUp(true, updated, passingScore);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    syncUp(hasQuiz, updated, passingScore);
  };

  const handleScoreChange = (score: number) => {
    setPassingScore(score);
    syncUp(hasQuiz, questions, score);
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <div>
            <Label className="text-sm font-medium">Test al final de la sección</Label>
            <p className="text-xs text-muted-foreground">
              Los estudiantes deben aprobarlo para continuar
            </p>
          </div>
        </div>
        <Switch checked={hasQuiz} onCheckedChange={toggleQuiz} />
      </div>

      {hasQuiz && (
        <>
          {/* Calificación mínima */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/10 p-4">
            <Label className="text-sm font-medium">Calificación mínima para aprobar</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={passingScore}
                onChange={(e) => handleScoreChange(Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-bold text-primary min-w-[48px] text-right">
                {passingScore}%
              </span>
            </div>
          </div>

          {/* Preguntas existentes */}
          {questions.length > 0 && (
            <div className="space-y-2">
              {questions.map((q, i) => (
                <Card key={i} className="border border-border bg-muted/10">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {i + 1}. {q.question}
                        </p>
                        <div className="space-y-1">
                          {q.options.map((opt, j) => (
                            <div
                              key={j}
                              className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                                q.correct === j
                                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {q.correct === j ? (
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600" />
                              ) : (
                                <Circle className="h-3 w-3 shrink-0" />
                              )}
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(i)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Agregar nueva pregunta */}
          <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">Agregar pregunta</p>
            <Input
              placeholder="Escribe la pregunta..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Opciones (haz clic en el círculo para marcar la correcta)
              </Label>
              {newOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCorrect(i)}
                    className="shrink-0"
                  >
                    {newCorrect === i ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <Input
                    value={opt}
                    placeholder={`Opción ${i + 1}`}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i] = e.target.value;
                      setNewOptions(updated);
                    }}
                  />
                </div>
              ))}
            </div>
            <Button
              size="sm"
              onClick={handleAddQuestion}
              disabled={
                !newQuestion.trim() ||
                newOptions.filter((o) => o.trim()).length < 2 ||
                newCorrect === null
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Agregar pregunta
            </Button>
          </div>

          {questions.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm text-primary">
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              <span>
                Test configurado: {questions.length} {questions.length === 1 ? "pregunta" : "preguntas"} — mínimo {passingScore}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Mini-game editors ────────────────────────────────────────────────────────

type ActivityType = "none" | "quiz" | "memory" | "hangman" | "sort";

function MemoryMinigameEditor({
  pairs,
  onChange,
}: {
  pairs: MemoryPair[];
  onChange: (pairs: MemoryPair[]) => void;
}) {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const addPair = () => {
    if (!term.trim() || !definition.trim()) return;
    if (pairs.length >= 8) return;
    onChange([...pairs, { term: term.trim(), definition: definition.trim() }]);
    setTerm("");
    setDefinition("");
  };

  const removePair = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Mínimo 4 pares, máximo 8</p>
      {pairs.map((p, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 text-sm">
          <span className="flex-1 truncate">
            <span className="font-medium">{p.term}</span>
            <span className="text-muted-foreground"> · {p.definition}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => removePair(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {pairs.length < 8 && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <Input
            placeholder="Término"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Input
            placeholder="Definición"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
          />
          <Button
            size="sm"
            onClick={addPair}
            disabled={!term.trim() || !definition.trim() || pairs.length >= 8}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Añadir par
          </Button>
        </div>
      )}
      {pairs.length < 4 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {4 - pairs.length} par{4 - pairs.length !== 1 ? "es" : ""} más.
        </p>
      )}
    </div>
  );
}

function HangmanMinigameEditor({
  words,
  onChange,
}: {
  words: HangmanWord[];
  onChange: (words: HangmanWord[]) => void;
}) {
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");

  const addWord = () => {
    const clean = word.toUpperCase().trim();
    if (!clean || !hint.trim()) return;
    if (words.length >= 5) return;
    onChange([...words, { word: clean, hint: hint.trim() }]);
    setWord("");
    setHint("");
  };

  const removeWord = (i: number) => onChange(words.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">3–5 palabras, sin tildes ni caracteres especiales</p>
      {words.map((w, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 text-sm">
          <span className="flex-1 truncate">
            <span className="font-mono font-medium">{w.word}</span>
            <span className="text-muted-foreground"> (pista: {w.hint})</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => removeWord(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {words.length < 5 && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <Input
            placeholder="Palabra (se convertirá a mayúsculas)"
            value={word}
            onChange={(e) => setWord(e.target.value.toUpperCase())}
          />
          <Input
            placeholder="Pista para el alumno"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />
          <Button
            size="sm"
            onClick={addWord}
            disabled={!word.trim() || !hint.trim() || words.length >= 5}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Añadir palabra
          </Button>
        </div>
      )}
      {words.length < 3 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {3 - words.length} palabra{3 - words.length !== 1 ? "s" : ""} más.
        </p>
      )}
    </div>
  );
}

function SortMinigameEditor({
  instruction,
  items,
  onInstructionChange,
  onItemsChange,
}: {
  instruction: string;
  items: string[];
  onInstructionChange: (v: string) => void;
  onItemsChange: (v: string[]) => void;
}) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    if (items.length >= 8) return;
    onItemsChange([...items, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (i: number) => onItemsChange(items.filter((_, idx) => idx !== i));

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onItemsChange(next);
  };

  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    const next = [...items];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onItemsChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Instrucción para el alumno</Label>
        <Input
          placeholder="Ej: Ordena los pasos del proceso"
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Define los ítems en el orden CORRECTO (4–8 ítems)
      </p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 text-sm">
          <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
          <span className="flex-1 truncate">{item}</span>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => moveUp(i)} disabled={i === 0} className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {items.length < 8 && (
        <div className="flex gap-2">
          <Input
            placeholder="Nuevo ítem..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          />
          <Button size="sm" onClick={addItem} disabled={!newItem.trim() || items.length >= 8}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {items.length < 4 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {4 - items.length} ítem{4 - items.length !== 1 ? "s" : ""} más.
        </p>
      )}
    </div>
  );
}

const ACTIVITY_OPTIONS: { type: ActivityType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "none", label: "Ninguna", icon: <Circle className="h-4 w-4" />, description: "Sin actividad" },
  { type: "quiz", label: "Test", icon: <ClipboardCheck className="h-4 w-4" />, description: "Preguntas tipo test" },
  { type: "memory", label: "Memoria", icon: <Gamepad2 className="h-4 w-4" />, description: "Emparejar tarjetas" },
  { type: "hangman", label: "Ahorcado", icon: <Gamepad2 className="h-4 w-4" />, description: "Adivinar palabras" },
  { type: "sort", label: "Ordenar", icon: <Gamepad2 className="h-4 w-4" />, description: "Ordenar elementos" },
];

function SectionActivityEditor({
  quiz,
  minigame,
  onQuizChange,
  onMinigameChange,
}: {
  quiz: SectionQuiz | undefined;
  minigame: SectionMinigame | undefined;
  onQuizChange: (quiz: SectionQuiz | undefined) => void;
  onMinigameChange: (minigame: SectionMinigame | undefined) => void;
}) {
  const currentType: ActivityType = minigame
    ? (minigame.type as ActivityType)
    : quiz
    ? "quiz"
    : "none";

  const handleTypeChange = (type: ActivityType) => {
    if (type === "none") {
      onQuizChange(undefined);
      onMinigameChange(undefined);
    } else if (type === "quiz") {
      onMinigameChange(undefined);
      // Keep existing quiz or create empty
      if (!quiz) onQuizChange({ passingScore: 70, questions: [] });
    } else if (type === "memory") {
      onQuizChange(undefined);
      onMinigameChange({ type: "memory", pairs: [] });
    } else if (type === "hangman") {
      onQuizChange(undefined);
      onMinigameChange({ type: "hangman", words: [] });
    } else if (type === "sort") {
      onQuizChange(undefined);
      onMinigameChange({ type: "sort", instruction: "", items: [] });
    }
  };

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {ACTIVITY_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => handleTypeChange(opt.type)}
            className={`
              flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all
              ${
                currentType === opt.type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
              }
            `}
          >
            {opt.icon}
            <span className="text-xs font-semibold">{opt.label}</span>
            <span className="text-[10px] leading-tight opacity-70">{opt.description}</span>
          </button>
        ))}
      </div>

      {/* Quiz editor */}
      {currentType === "quiz" && (
        <SectionQuizEditor
          quiz={quiz}
          onChange={onQuizChange}
        />
      )}

      {/* Memory editor */}
      {currentType === "memory" && minigame?.type === "memory" && (
        <MemoryMinigameEditor
          pairs={minigame.pairs}
          onChange={(pairs) => onMinigameChange({ type: "memory", pairs })}
        />
      )}

      {/* Hangman editor */}
      {currentType === "hangman" && minigame?.type === "hangman" && (
        <HangmanMinigameEditor
          words={minigame.words}
          onChange={(words) => onMinigameChange({ type: "hangman", words })}
        />
      )}

      {/* Sort editor */}
      {currentType === "sort" && minigame?.type === "sort" && (
        <SortMinigameEditor
          instruction={minigame.instruction}
          items={minigame.items}
          onInstructionChange={(instruction) =>
            onMinigameChange({ type: "sort", instruction, items: minigame.items })
          }
          onItemsChange={(items) =>
            onMinigameChange({ type: "sort", instruction: minigame.instruction, items })
          }
        />
      )}
    </div>
  );
}

export const CourseSectionsManager = ({
  sections,
  onUpdate,
  onNext,
  onPrevious,
}: CourseSectionsManagerProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<{ sectionId: string; lessonId: string } | null>(null);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: CourseSection = {
      id: crypto.randomUUID(),
      title: newSectionTitle.trim(),
      description: "",
      order: sections.length + 1,
      lessons: [],
    };

    onUpdate([...sections, newSection]);
    setNewSectionTitle("");
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const updateSection = (sectionId: string, updates: Partial<CourseSection>) => {
    onUpdate(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSection = (sectionId: string) => {
    onUpdate(sections.filter((s) => s.id !== sectionId));
  };

  const addLesson = (sectionId: string) => {
    const newLesson: CourseLesson = {
      id: crypto.randomUUID(),
      title: "Nueva lección",
      type: "video",
      order: sections.find((s) => s.id === sectionId)?.lessons.length || 0,
    };

    updateSection(sectionId, {
      lessons: [...(sections.find((s) => s.id === sectionId)?.lessons || []), newLesson],
    });

    setEditingLesson({ sectionId, lessonId: newLesson.id });
  };

  const updateLesson = (sectionId: string, lessonId: string, updates: Partial<CourseLesson>) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updatedLessons = section.lessons.map((l) =>
      l.id === lessonId ? { ...l, ...updates } : l
    );

    updateSection(sectionId, { lessons: updatedLessons });
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      lessons: section.lessons.filter((l) => l.id !== lessonId),
    });
  };

  const getLessonIcon = (type: CourseLesson["type"]) => {
    switch (type) {
      case "video":
        return Video;
      case "text":
        return FileText;
      case "quiz":
        return FileQuestion;
      case "assignment":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getLessonTypeLabel = (type: CourseLesson["type"]) => {
    switch (type) {
      case "video":
        return "Video";
      case "text":
        return "Texto";
      case "quiz":
        return "Quiz";
      case "assignment":
        return "Tarea";
      default:
        return "Lección";
    }
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Secciones y lecciones</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Organiza el contenido de tu curso en secciones y lecciones
        </p>
      </div>

      <div className="space-y-4">
        {/* Add New Section */}
        <Card className="border border-border bg-card/90">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSection();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={addSection} disabled={!newSectionTitle.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar sección
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sections List */}
        {sections.length === 0 ? (
          <Card className="border border-dashed border-border bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground">No hay secciones aún</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Agrega tu primera sección para comenzar a estructurar tu curso
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.id);

              return (
                <Card key={section.id} className="border border-border bg-card/90">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              {sectionIndex + 1}. {section.title}
                            </CardTitle>
                            <Badge variant="outline">{section.lessons.length} lecciones</Badge>
                            {section.quiz && section.quiz.questions.length > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium text-primary">
                                <ClipboardCheck className="h-3 w-3" />
                                Test
                              </span>
                            )}
                            {section.minigame && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                                <Gamepad2 className="h-3 w-3" />
                                {section.minigame.type === "memory" ? "Memoria" : section.minigame.type === "hangman" ? "Ahorcado" : "Ordenar"}
                              </span>
                            )}
                          </div>
                          {section.description && (
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSection(section.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        {/* Section Details */}
                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                          <Input
                            label="Título de la sección"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          />
                          <Textarea
                            label="Descripción (opcional)"
                            value={section.description || ""}
                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <Separator />

                        {/* Lessons */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Lecciones</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(section.id)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar lección
                            </Button>
                          </div>

                          {section.lessons.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                              <p className="text-sm text-muted-foreground">
                                No hay lecciones en esta sección
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {section.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, lessonIndex) => {
                                  const Icon = getLessonIcon(lesson.type);
                                  const isEditing =
                                    editingLesson?.sectionId === section.id &&
                                    editingLesson?.lessonId === lesson.id;

                                  if (isEditing) {
                                    return (
                                      <LessonEditor
                                        key={lesson.id}
                                        lesson={lesson}
                                        onSave={(updates) => {
                                          updateLesson(section.id, lesson.id, updates);
                                          setEditingLesson(null);
                                        }}
                                        onCancel={() => setEditingLesson(null)}
                                      />
                                    );
                                  }

                                  return (
                                    <Card
                                      key={lesson.id}
                                      className="border border-border bg-background"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <GripVertical className="mt-1 h-4 w-4 text-muted-foreground" />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <Icon className="h-4 w-4 text-muted-foreground" />
                                              <span className="font-medium text-foreground">
                                                {lessonIndex + 1}. {lesson.title}
                                              </span>
                                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                                                {getLessonTypeLabel(lesson.type)}
                                              </span>
                                              {lesson.duration && (
                                                <span className="text-xs text-muted-foreground">
                                                  {lesson.duration}
                                                </span>
                                              )}
                                            </div>
                                            {lesson.description && (
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                {lesson.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setEditingLesson({
                                                  sectionId: section.id,
                                                  lessonId: lesson.id,
                                                })
                                              }
                                            >
                                              Editar
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteLesson(section.id, lesson.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Test de sección */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Test de sección</h4>
                          <SectionQuizEditor
                            quiz={section.quiz}
                            onChange={(quiz) => updateSection(section.id, { quiz })}
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <Card className="border border-border bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                {sections.length} {sections.length === 1 ? "sección" : "secciones"}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalLessons} {totalLessons === 1 ? "lección" : "lecciones"} en total
                {sections.filter((s) => s.quiz && s.quiz.questions.length > 0).length > 0 && (
                  <span>
                    {" "}·{" "}
                    {sections.filter((s) => s.quiz && s.quiz.questions.length > 0).length} con test
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={sections.length === 0}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
