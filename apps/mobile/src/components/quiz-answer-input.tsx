import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Brand } from "@/constants/theme";
import type { QuizAnswer, QuizQuestionType } from "@/lib/me";

const PURPLE = Brand.primary;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type AnswerQuestion = {
  type?: QuizQuestionType;
  /** ordenar: elementos (se barajan al mostrar). relacionar: columna izquierda. mc/casillas: opciones. */
  options: string[];
  /** relacionar: columna derecha (pool de parejas a elegir). */
  matchRight?: string[];
};

/**
 * Entrada de respuesta para los 5 tipos de pregunta. Reporta la respuesta como
 * number | number[] | string[] (misma forma que espera el servidor):
 *  - mc / verdadero-falso → number (índice)
 *  - casillas             → number[] (índices)
 *  - ordenar              → string[] (textos en el orden elegido)
 *  - relacionar           → string[] (texto derecho elegido para cada izquierda)
 */
export function QuizAnswerInput({
  question,
  value,
  onChange,
  disabled,
}: {
  question: AnswerQuestion;
  value: QuizAnswer | undefined;
  onChange: (a: QuizAnswer) => void;
  disabled?: boolean;
}) {
  const type = question.type ?? "multiple-choice";

  // Orden inicial mostrado al alumno para "ordenar" (barajado una sola vez).
  const [initialOrder] = useState(() =>
    type === "ordering" ? shuffle(question.options) : [],
  );
  // Pool de la columna derecha para "relacionar" (barajado una sola vez).
  const [rightPool] = useState(() =>
    type === "matching" ? shuffle(question.matchRight ?? []) : [],
  );

  useEffect(() => {
    // Una pregunta de ordenar siempre tiene una respuesta (el orden visible).
    if (type === "ordering" && value === undefined && initialOrder.length > 0) {
      onChange(initialOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (type === "multiple-choice" || type === "true-false") {
    return (
      <View style={styles.group}>
        {question.options.map((opt, oi) => {
          const selected = value === oi;
          return (
            <TouchableOpacity
              key={oi}
              style={[styles.option, selected && styles.optionSelected]}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => onChange(oi)}
            >
              <ThemedText style={styles.optionText}>{opt}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (type === "checkbox") {
    const selected = Array.isArray(value) ? (value as number[]) : [];
    return (
      <View style={styles.group}>
        <ThemedText style={styles.hint}>Selecciona todas las que apliquen.</ThemedText>
        {question.options.map((opt, oi) => {
          const isSel = selected.includes(oi);
          return (
            <TouchableOpacity
              key={oi}
              style={[styles.option, isSel && styles.optionSelected]}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => {
                const next = isSel ? selected.filter((x) => x !== oi) : [...selected, oi];
                onChange(next);
              }}
            >
              <View style={[styles.box, isSel && styles.boxOn]}>
                {isSel && <ThemedText style={styles.boxMark}>✓</ThemedText>}
              </View>
              <ThemedText style={styles.optionText}>{opt}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (type === "ordering") {
    const order = Array.isArray(value) ? (value as string[]) : initialOrder;
    const move = (from: number, to: number) => {
      if (to < 0 || to >= order.length) return;
      const next = [...order];
      [next[from], next[to]] = [next[to], next[from]];
      onChange(next);
    };
    return (
      <View style={styles.group}>
        <ThemedText style={styles.hint}>Ordena los elementos con las flechas.</ThemedText>
        {order.map((opt, oi) => (
          <View key={`${opt}-${oi}`} style={styles.orderRow}>
            <ThemedText style={styles.orderNum}>{oi + 1}.</ThemedText>
            <ThemedText style={styles.orderText}>{opt}</ThemedText>
            <View style={styles.arrows}>
              <TouchableOpacity
                hitSlop={8}
                disabled={disabled || oi === 0}
                onPress={() => move(oi, oi - 1)}
              >
                <ThemedText style={[styles.arrow, (disabled || oi === 0) && styles.arrowOff]}>
                  ↑
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={8}
                disabled={disabled || oi === order.length - 1}
                onPress={() => move(oi, oi + 1)}
              >
                <ThemedText
                  style={[styles.arrow, (disabled || oi === order.length - 1) && styles.arrowOff]}
                >
                  ↓
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === "matching") {
    const pool = rightPool;
    const picks = Array.isArray(value) ? (value as string[]) : [];
    const setPick = (leftIdx: number, right: string) => {
      const next = question.options.map((_, i) => picks[i] ?? "");
      next[leftIdx] = right;
      onChange(next);
    };
    return (
      <View style={styles.group}>
        <ThemedText style={styles.hint}>Toca la pareja correcta de cada elemento.</ThemedText>
        {question.options.map((left, li) => (
          <View key={li} style={styles.matchRow}>
            <ThemedText style={styles.matchLeft}>{left}</ThemedText>
            <View style={styles.chips}>
              {pool.map((right, ri) => {
                const chosen = picks[li] === right;
                return (
                  <TouchableOpacity
                    key={ri}
                    style={[styles.chip, chosen && styles.chipOn]}
                    activeOpacity={0.7}
                    disabled={disabled}
                    onPress={() => setPick(li, right)}
                  >
                    <ThemedText style={[styles.chipText, chosen && styles.chipTextOn]}>
                      {right}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  hint: { fontSize: 12, opacity: 0.6 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionSelected: { borderColor: PURPLE, backgroundColor: "rgba(109,40,217,0.08)" },
  optionText: { flex: 1, fontSize: 15 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(127,127,127,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { borderColor: PURPLE, backgroundColor: PURPLE },
  boxMark: { color: "#fff", fontSize: 12, fontWeight: "800", lineHeight: 16 },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  orderNum: { fontWeight: "700", color: PURPLE, width: 22 },
  orderText: { flex: 1, fontSize: 15 },
  arrows: { flexDirection: "row", gap: 14 },
  arrow: { fontSize: 20, fontWeight: "800", color: PURPLE },
  arrowOff: { opacity: 0.25 },
  matchRow: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  matchLeft: { fontSize: 15, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: { borderColor: PURPLE, backgroundColor: PURPLE },
  chipText: { fontSize: 14 },
  chipTextOn: { color: "#fff", fontWeight: "700" },
});
