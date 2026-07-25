"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
  sortableKeyboardCoordinates, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CheckCircle2, Circle, GripVertical, CheckSquare, Square } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import type { QuizQuestion } from "@/components/instructor/course-types";
import type { ExamAnswer } from "@/lib/exam-grading";

/** Baraja una copia (Fisher–Yates). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SortableRow({ id, index, label, disabled }: { id: string; index: number; label: string; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className={`flex items-center gap-3 rounded-lg border-2 bg-card p-3 ${isDragging ? "border-primary shadow-lg" : "border-border"}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        title="Arrastra para ordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {index + 1}
      </span>
      <span className="text-base text-foreground">{stripHtml(label)}</span>
    </div>
  );
}

/**
 * Área de respuesta reutilizable para UNA pregunta de quiz/examen. Soporta los
 * 5 tipos. Para "ordering"/"matching" baraja el orden de presentación una sola
 * vez (estado local) y reporta la respuesta por CONTENIDO (texto), de modo que
 * el barajado no afecta la calificación.
 */
export function QuizAnswerInput({
  question,
  value,
  onChange,
  disabled = false,
}: {
  question: QuizQuestion;
  value: ExamAnswer | undefined;
  onChange: (v: ExamAnswer) => void;
  disabled?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // El orden de presentación se baraja SOLO en el cliente, tras montar (no en el
  // init de useState), para no romper la hidratación: el render del servidor y el
  // primer render del cliente deben coincidir (orden sin barajar).
  const [displayOrder, setDisplayOrder] = useState<string[]>(() => question.options ?? []);
  const [displayRight, setDisplayRight] = useState<string[]>(() => question.matchRight ?? []);

  // `mounted` evita renderizar el DndContext de dnd-kit en el servidor (genera IDs
  // de accesibilidad distintos SSR vs cliente → aviso de hidratación).
  const [mounted, setMounted] = useState(false);
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    setMounted(true);
    if (question.type === "ordering") {
      const s = shuffle(question.options ?? []);
      setDisplayOrder(s);
      // "Ordenar" arranca con un orden: lo reportamos una vez (si no hay respuesta
      // previa) para que cuente como respondida y se califique lo mostrado.
      if (value === undefined) onChange(s);
    } else if (question.type === "matching") {
      setDisplayRight(shuffle(question.matchRight ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── multiple-choice / true-false ──
  if (question.type === "multiple-choice" || question.type === "true-false") {
    const rawOptions = question.type === "true-false" ? ["Verdadero", "Falso"] : question.options ?? [];
    const options = rawOptions.map((opt, i) => ({ label: opt, index: i })).filter((o) => o.label.trim() !== "");
    return (
      <div className="space-y-3">
        {options.map(({ label, index }) => {
          const isSelected = value === index;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onChange(index)}
              className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all disabled:cursor-not-allowed ${
                isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="shrink-0">
                {isSelected ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
              </span>
              <span className={`text-base ${isSelected ? "font-semibold text-primary" : "text-foreground"}`}>{stripHtml(label)}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── checkbox ──
  if (question.type === "checkbox") {
    const options = (question.options ?? []).map((opt, i) => ({ label: opt, index: i })).filter((o) => o.label.trim() !== "");
    const selected = new Set((value as number[] | undefined) ?? []);
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Selecciona todas las respuestas correctas.</p>
        {options.map(({ label, index }) => {
          const isSelected = selected.has(index);
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => {
                const next = new Set(selected);
                if (next.has(index)) next.delete(index); else next.add(index);
                onChange([...next].sort((a, b) => a - b));
              }}
              className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all disabled:cursor-not-allowed ${
                isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="shrink-0">
                {isSelected ? <CheckSquare className="h-6 w-6 text-primary" /> : <Square className="h-6 w-6 text-muted-foreground" />}
              </span>
              <span className={`text-base ${isSelected ? "font-semibold text-primary" : "text-foreground"}`}>{stripHtml(label)}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── ordering ──
  if (question.type === "ordering") {
    const order = (value as string[] | undefined) ?? displayOrder;
    const onDragEnd = (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIndex = order.indexOf(String(active.id));
      const newIndex = order.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onChange(arrayMove(order, oldIndex, newIndex));
    };
    // Antes de montar (SSR + primer render cliente): lista estática, sin dnd-kit.
    if (!mounted) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Arrastra los elementos para colocarlos en el orden correcto.</p>
          <div className="space-y-2">
            {order.map((item, i) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3">
                <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{i + 1}</span>
                <span className="text-base text-foreground">{stripHtml(item)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Arrastra los elementos para colocarlos en el orden correcto.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map((item, i) => (
                <SortableRow key={item} id={item} index={i} label={item} disabled={disabled} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  // ── matching ──
  if (question.type === "matching") {
    const left = question.options ?? [];
    const current = (value as string[] | undefined) ?? left.map(() => "");
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Elige la opción que corresponde a cada elemento.</p>
        <div className="space-y-2">
          {left.map((leftItem, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
              <span className="flex-1 text-base font-medium text-foreground">{stripHtml(leftItem)}</span>
              <span className="hidden text-muted-foreground sm:inline">→</span>
              <select
                disabled={disabled}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed sm:w-64"
                value={current[i] ?? ""}
                onChange={(e) => {
                  const next = [...current];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              >
                <option value="">Selecciona…</option>
                {displayRight.map((r, ri) => (
                  <option key={ri} value={r}>{stripHtml(r)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
