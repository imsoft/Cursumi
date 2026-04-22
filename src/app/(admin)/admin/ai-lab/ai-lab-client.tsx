"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Loader2, SendHorizonal, Sparkles, BookOpen, Route } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = { id: string; title: string; status: string };
type User = { id: string; name: string; email: string; role: string };
type Message = { role: "user" | "assistant"; content: string };

type RecommendationStep = {
  step: number;
  courseId: string;
  courseTitle: string;
  reason: string;
  priority: "alta" | "media" | "baja";
};
type RecommendationResult = {
  summary: string;
  learningPath: RecommendationStep[];
  skills: string[];
  tips: string[];
  error?: string;
};

const priorityColor: Record<string, string> = {
  alta: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  baja: "bg-gray-100 text-gray-700",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiLabClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/courses").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([c, u]) => {
      setCourses(c.filter((x: Course) => x.status === "published"));
      setUsers(u.filter((x: User) => x.role === "student"));
      setLoadingData(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h1 className="text-2xl font-semibold">AI Lab</h1>
          <Badge variant="outline" className="text-xs">Beta · Solo admin</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Herramientas de inteligencia artificial con Gemini 2.0 Flash para explorar funcionalidades antes de lanzarlas a alumnos.
        </p>
      </div>

      <Tabs defaultValue="qa" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="qa" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Q&amp;A de Curso
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Route className="w-4 h-4" />
            Rutas de Aprendizaje
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qa">
          <CourseQA courses={courses} loading={loadingData} />
        </TabsContent>

        <TabsContent value="recommendations">
          <LearningRecommendations users={users} loading={loadingData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Q&A Tab ─────────────────────────────────────────────────────────────────

function CourseQA({ courses, loading }: { courses: Course[]; loading: boolean }) {
  const [courseId, setCourseId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));

  async function handleSend() {
    if (!courseId || !input.trim() || streaming) return;

    const question = input.trim();
    setInput("");
    const history = messages.slice(-10);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setStreaming(true);

    let assistantContent = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/admin/ai/course-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, question, history }),
      });

      if (!res.ok || !res.body) throw new Error("Error al conectar con la IA");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantContent };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error al obtener respuesta. Intenta de nuevo.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="rounded-xl border bg-card flex flex-col"
      style={{ height: "calc(100vh - 280px)", minHeight: 480 }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-72">
          <Combobox
            options={courseOptions}
            value={courseId}
            onValueChange={(v) => { setCourseId(v); setMessages([]); }}
            placeholder={loading ? "Cargando cursos..." : "Selecciona un curso"}
            searchPlaceholder="Buscar curso..."
            disabled={loading}
          />
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {!courseId && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Selecciona un curso para empezar a hacer preguntas sobre su contenido
          </div>
        )}
        {courseId && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <p>Gemini conoce el contenido completo del curso.</p>
            <p>Haz cualquier pregunta sobre el material.</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content ||
                  (streaming && i === messages.length - 1 ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Pensando...
                    </span>
                  ) : (
                    ""
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2 items-end">
        <Textarea
          className="resize-none min-h-[44px] max-h-32"
          placeholder={
            courseId ? "Pregunta sobre el curso… (Enter para enviar)" : "Selecciona un curso primero"
          }
          disabled={!courseId || streaming}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <Button
          size="icon"
          disabled={!courseId || !input.trim() || streaming}
          onClick={handleSend}
          className="shrink-0"
        >
          {streaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SendHorizonal className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Recommendations Tab ──────────────────────────────────────────────────────

function LearningRecommendations({ users, loading }: { users: User[]; loading: boolean }) {
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} — ${u.email}`,
  }));

  async function handleGenerate() {
    if (!studentId || generating) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        error: "Error al generar recomendaciones",
        summary: "",
        learningPath: [],
        skills: [],
        tips: [],
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4 flex items-end gap-3 flex-wrap">
        <div className="w-80">
          <Combobox
            label="Alumno"
            options={userOptions}
            value={studentId}
            onValueChange={setStudentId}
            placeholder={loading ? "Cargando alumnos..." : "Selecciona un alumno"}
            searchPlaceholder="Buscar alumno..."
            disabled={loading}
          />
        </div>
        <Button disabled={!studentId || generating} onClick={handleGenerate} className="gap-2">
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Generando..." : "Generar ruta de aprendizaje"}
        </Button>
      </div>

      {result?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Perfil del alumno</h3>
            <p className="text-sm">{result.summary}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Learning path */}
            <div className="lg:col-span-2 rounded-xl border bg-card p-5 flex flex-col gap-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Route className="w-4 h-4 text-purple-500" />
                Ruta de aprendizaje recomendada
              </h3>
              <div className="flex flex-col gap-2">
                {result.learningPath.map((step) => (
                  <div key={step.step} className="flex gap-3 items-start rounded-lg border p-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {step.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{step.courseTitle}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[step.priority]}`}
                        >
                          Prioridad {step.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{step.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Tips */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold text-sm mb-3">Habilidades a desarrollar</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((s, i) => (
                    <Badge key={i} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold text-sm mb-3">Consejos para el alumno</h3>
                <ul className="flex flex-col gap-1.5">
                  {result.tips.map((t, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-purple-500 shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !generating && (
        <div className="rounded-xl border border-dashed bg-card/50 p-12 flex flex-col items-center gap-2 text-muted-foreground text-sm">
          <Route className="w-10 h-10 opacity-30" />
          <p>Selecciona un alumno y genera su ruta de aprendizaje personalizada con IA</p>
        </div>
      )}
    </div>
  );
}
