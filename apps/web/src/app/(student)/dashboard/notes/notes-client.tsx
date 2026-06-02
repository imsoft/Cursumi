"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Clock, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export type NoteExpanded = {
  id: string;
  courseId: string;
  content: string;
  createdAt: string;
  lessonId: string | null;
  course: {
    id: string;
    title: string;
    instructorId: string;
    instructor: {
      name: string | null;
    };
  };
  lesson: {
    title: string;
  } | null;
};

export function NotesClient({ initialNotes }: { initialNotes: NoteExpanded[] }) {
  const [notes, setNotes] = useState<NoteExpanded[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");

  // Opciones cruzadas: cursos acotados al instructor elegido e instructores al curso elegido
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    initialNotes.forEach((n) => {
      if (selectedInstructor && n.course.instructorId !== selectedInstructor) return;
      map.set(n.course.id, n.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [initialNotes, selectedInstructor]);

  const uniqueInstructors = useMemo(() => {
    const map = new Map<string, string>();
    initialNotes.forEach((n) => {
      if (selectedCourse && n.course.id !== selectedCourse) return;
      map.set(n.course.instructorId, n.course.instructor.name || "Instructor anónimo");
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [initialNotes, selectedCourse]);

  useEffect(() => {
    if (selectedCourse && !uniqueCourses.some((c) => c.id === selectedCourse)) {
      setSelectedCourse("");
    }
  }, [selectedCourse, uniqueCourses]);

  useEffect(() => {
    if (selectedInstructor && !uniqueInstructors.some((i) => i.id === selectedInstructor)) {
      setSelectedInstructor("");
    }
  }, [selectedInstructor, uniqueInstructors]);

  const courseSelectOptions = useMemo(
    () => [
      { value: "", label: "Todos los cursos" },
      ...uniqueCourses.map((c) => ({ value: c.id, label: c.title })),
    ],
    [uniqueCourses],
  );

  const instructorSelectOptions = useMemo(
    () => [
      { value: "", label: "Todos los instructores" },
      ...uniqueInstructors.map((i) => ({ value: i.id, label: i.name })),
    ],
    [uniqueInstructors],
  );

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notes.filter((n) => {
      const lessonTitle = (n.lesson?.title ?? "").toLowerCase();
      const matchSearch =
        !q ||
        n.content.toLowerCase().includes(q) ||
        lessonTitle.includes(q) ||
        n.course.title.toLowerCase().includes(q) ||
        (n.course.instructor.name ?? "").toLowerCase().includes(q);
      const matchCourse = selectedCourse ? n.course.id === selectedCourse : true;
      const matchInstructor = selectedInstructor ? n.course.instructorId === selectedInstructor : true;
      return matchSearch && matchCourse && matchInstructor;
    });
  }, [notes, searchQuery, selectedCourse, selectedInstructor]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta nota definitivamente?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis notas</h1>
          <p className="text-muted-foreground">
            Repasa y filtra las anotaciones que has hecho en tus cursos (por curso, instructor y lección).
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en tus notas..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar en notas"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <Combobox
          id="filter-instructor"
          label="Instructor"
          className="min-w-[min(100%,220px)] flex-1"
          options={instructorSelectOptions}
          value={selectedInstructor}
          onValueChange={setSelectedInstructor}
        />
        <Combobox
          id="filter-course"
          label="Curso"
          className="min-w-[min(100%,220px)] flex-1"
          options={courseSelectOptions}
          value={selectedCourse}
          onValueChange={(v) => {
            setSelectedCourse(v);
            if (v) {
              const row = initialNotes.find((n) => n.course.id === v);
              if (row) setSelectedInstructor(row.course.instructorId);
            }
          }}
        />
      </div>

      {filteredNotes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookOpen /></EmptyMedia>
            <EmptyTitle>No se encontraron notas</EmptyTitle>
            <EmptyDescription>
              {initialNotes.length > 0
                ? "No hay notas que coincidan con la búsqueda o los filtros."
                : "Aún no has tomado ninguna nota. Entra a un curso y empieza a escribir."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="block max-w-full truncate rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {note.course.title}
                </span>
                {note.lesson && (
                  <span className="block max-w-full truncate rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Clase: {note.lesson.title}
                  </span>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(note.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {note.course.instructor.name || "Instructor anónimo"}
                </span>
              </div>

              <div className="flex-1 border-t border-border/50 pt-2 text-sm whitespace-pre-wrap text-foreground">
                {note.content}
              </div>

              <div className="absolute top-4 right-4 flex gap-1 rounded-lg bg-card/80 p-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                {note.lessonId && (
                  <Link href={`/dashboard/my-courses/${note.courseId}/lessons/${note.lessonId}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Ir a la lección"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(note.id)}
                  title="Eliminar nota"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
