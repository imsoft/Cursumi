"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit2, Check, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Note {
  id: string;
  courseId: string;
  lessonId: string | null;
  content: string;
  createdAt: string;
}

interface CourseNotesSheetProps {
  courseId: string;
  lessonId: string;
}

export function CourseNotesSheet({ courseId, lessonId }: CourseNotesSheetProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Note Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (open) {
      loadNotes();
    }
  }, [open, courseId, lessonId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes?courseId=${courseId}&lessonId=${lessonId}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newContent.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, content: newContent }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const note = await res.json();
      setNotes([note, ...notes]);
      setNewContent("");
      setIsCreating(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updatedNote = await res.json();
      setNotes(notes.map((n) => (n.id === id ? updatedNote : n)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta nota?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Mis Apuntes</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto z-[200]">
        <SheetHeader className="mb-6">
          <SheetTitle>Apuntes de la Lección</SheetTitle>
          <SheetDescription>
            Tus notas se guardan de manera privada y están vinculadas a esta clase.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {!isCreating && (
            <Button className="w-full gap-2" variant="outline" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" /> Nueva Nota
            </Button>
          )}

          {isCreating && (
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
              <Textarea
                placeholder="Escribe tus apuntes aquí..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={createNote} disabled={isSubmitting || !newContent.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-8">
              Aún no tienes apuntes en esta clase.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 group">
                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={() => updateNote(note.id)} disabled={!editContent.trim()}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingId(note.id);
                              setEditContent(note.content);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
