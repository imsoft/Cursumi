import { useMemo, useState } from "react";
import { Brand } from "@/constants/theme";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { completeSectionMinigame, parseMinigame, type Lesson, type Minigame } from "@/lib/me";

const PURPLE = Brand.primary;
const GREEN = Brand.success;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Despachador ─────────────────────────────────────────────────────────────
export function SectionMinigameView({
  lesson,
  onCompleted,
}: {
  lesson: Lesson;
  onCompleted?: (lessonId: string) => void;
}) {
  const game = useMemo(() => parseMinigame(lesson.sectionMinigame), [lesson.sectionMinigame]);
  const [won, setWon] = useState(false);

  async function handleWin() {
    setWon(true);
    if (lesson.sectionId) {
      await completeSectionMinigame(lesson.sectionId, lesson.courseId).catch(() => {});
    }
    onCompleted?.(lesson.id);
  }

  if (!game) {
    return <ThemedText style={styles.notice}>Este minijuego no está disponible.</ThemedText>;
  }

  return (
    <View style={styles.container}>
      {"instruction" in game && game.instruction ? (
        <ThemedText style={styles.instruction}>{game.instruction}</ThemedText>
      ) : null}

      {won && (
        <ThemedView style={styles.wonCard}>
          <ThemedText type="subtitle">¡Completado! 🎉</ThemedText>
        </ThemedView>
      )}

      {!won && game.type === "memory" && <MemoryGame game={game} onWin={handleWin} />}
      {!won && game.type === "hangman" && <HangmanGame game={game} onWin={handleWin} />}
      {!won && game.type === "sort" && <SortGame game={game} onWin={handleWin} />}
      {!won && game.type === "match" && <MatchGame game={game} onWin={handleWin} />}
    </View>
  );
}

// ── Memoria ─────────────────────────────────────────────────────────────────
function MemoryGame({
  game,
  onWin,
}: {
  game: Extract<Minigame, { type: "memory" }>;
  onWin: () => void;
}) {
  type Card = { id: string; pairIndex: number; label: string };
  const cards = useMemo(
    () =>
      shuffle(
        game.pairs.flatMap((p, i) => [
          { id: `${i}-t`, pairIndex: i, label: p.term },
          { id: `${i}-d`, pairIndex: i, label: p.definition },
        ])
      ),
    [game.pairs]
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function tap(card: Card) {
    if (busy || matched.has(card.id) || flipped.includes(card.id)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setBusy(true);
      const [aId, bId] = next;
      const a = cards.find((c) => c.id === aId)!;
      const b = cards.find((c) => c.id === bId)!;
      const match = a.pairIndex === b.pairIndex;
      setTimeout(() => {
        if (match) {
          const m = new Set(matched);
          m.add(aId);
          m.add(bId);
          setMatched(m);
          if (m.size === cards.length) onWin();
        }
        setFlipped([]);
        setBusy(false);
      }, match ? 350 : 800);
    }
  }

  return (
    <View style={styles.grid}>
      {cards.map((c) => {
        const show = matched.has(c.id) || flipped.includes(c.id);
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.memCard, show && styles.memCardUp, matched.has(c.id) && styles.memCardMatched]}
            activeOpacity={0.8}
            onPress={() => tap(c)}
          >
            <ThemedText style={[styles.memText, show && { color: "#111827" }]} numberOfLines={4}>
              {show ? c.label : "?"}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Ahorcado ────────────────────────────────────────────────────────────────
const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const norm = (s: string) => s.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function HangmanGame({
  game,
  onWin,
}: {
  game: Extract<Minigame, { type: "hangman" }>;
  onWin: () => void;
}) {
  const [wordIdx, setWordIdx] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);

  const current = game.words[wordIdx];
  const target = norm(current.word);
  const letters = target.replace(/[^A-ZÑ]/g, "").split("");
  const solved = letters.every((l) => guessed.has(l));
  const dead = wrong >= 6;

  function guess(letter: string) {
    if (guessed.has(letter) || solved || dead) return;
    const g = new Set(guessed);
    g.add(letter);
    setGuessed(g);
    if (!target.includes(letter)) setWrong((w) => w + 1);
  }

  function nextWord() {
    if (wordIdx + 1 >= game.words.length) {
      onWin();
    } else {
      setWordIdx((i) => i + 1);
      setGuessed(new Set());
      setWrong(0);
    }
  }

  function retry() {
    setGuessed(new Set());
    setWrong(0);
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText style={styles.hint}>Pista: {current.hint}</ThemedText>
      <ThemedText style={styles.hangWord}>
        {current.word
          .split("")
          .map((ch) => (/[A-Za-zÑñ]/.test(ch) ? (guessed.has(norm(ch)) ? ch : "_") : ch))
          .join(" ")}
      </ThemedText>
      <ThemedText style={styles.muted}>Errores: {wrong} / 6</ThemedText>

      {solved ? (
        <TouchableOpacity style={styles.button} onPress={nextWord}>
          <ThemedText style={styles.buttonText}>
            {wordIdx + 1 >= game.words.length ? "Terminar" : "Siguiente palabra"}
          </ThemedText>
        </TouchableOpacity>
      ) : dead ? (
        <View style={{ gap: 8 }}>
          <ThemedText style={styles.dead}>La palabra era: {current.word}</ThemedText>
          <TouchableOpacity style={[styles.button, styles.buttonGhost]} onPress={retry}>
            <ThemedText style={styles.buttonGhostText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.keyboard}>
          {ALPHABET.map((l) => {
            const used = guessed.has(l);
            return (
              <TouchableOpacity
                key={l}
                style={[styles.key, used && styles.keyUsed]}
                onPress={() => guess(l)}
                disabled={used}
              >
                <ThemedText style={styles.keyText}>{l}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ── Ordenar ─────────────────────────────────────────────────────────────────
function SortGame({
  game,
  onWin,
}: {
  game: Extract<Minigame, { type: "sort" }>;
  onWin: () => void;
}) {
  const [order, setOrder] = useState<string[]>(() => {
    let s = shuffle(game.items);
    // Evitar empezar ya ordenado.
    if (s.join("|") === game.items.join("|")) s = shuffle(game.items);
    return s;
  });
  const [wrong, setWrong] = useState(false);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setWrong(false);
  }

  function check() {
    if (order.join("|") === game.items.join("|")) onWin();
    else setWrong(true);
  }

  return (
    <View style={{ gap: 10 }}>
      {order.map((item, i) => (
        <ThemedView key={`${item}-${i}`} style={styles.sortRow}>
          <ThemedText style={styles.sortNum}>{i + 1}</ThemedText>
          <ThemedText style={styles.sortItem}>{item}</ThemedText>
          <View style={styles.sortArrows}>
            <TouchableOpacity onPress={() => move(i, -1)} disabled={i === 0} hitSlop={6}>
              <ThemedText style={[styles.arrow, i === 0 && styles.arrowOff]}>▲</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => move(i, 1)} disabled={i === order.length - 1} hitSlop={6}>
              <ThemedText style={[styles.arrow, i === order.length - 1 && styles.arrowOff]}>▼</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      ))}
      {wrong && <ThemedText style={styles.dead}>Aún no es el orden correcto.</ThemedText>}
      <TouchableOpacity style={styles.button} onPress={check}>
        <ThemedText style={styles.buttonText}>Comprobar</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// ── Emparejar ───────────────────────────────────────────────────────────────
function MatchGame({
  game,
  onWin,
}: {
  game: Extract<Minigame, { type: "match" }>;
  onWin: () => void;
}) {
  const rights = useMemo(() => shuffle(game.pairs.map((p, i) => ({ right: p.right, idx: i }))), [game.pairs]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [bad, setBad] = useState<number | null>(null);

  function tapRight(rIdx: number) {
    if (selectedLeft === null || matched.has(selectedLeft)) return;
    if (rights[rIdx].idx === selectedLeft) {
      const m = new Set(matched);
      m.add(selectedLeft);
      setMatched(m);
      setSelectedLeft(null);
      if (m.size === game.pairs.length) onWin();
    } else {
      setBad(rIdx);
      setTimeout(() => setBad(null), 500);
    }
  }

  return (
    <View style={styles.matchRow}>
      <View style={styles.matchCol}>
        {game.pairs.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.matchItem,
              selectedLeft === i && styles.matchSelected,
              matched.has(i) && styles.matchDone,
            ]}
            onPress={() => !matched.has(i) && setSelectedLeft(i)}
            disabled={matched.has(i)}
          >
            <ThemedText numberOfLines={3}>{p.left}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.matchCol}>
        {rights.map((r, j) => (
          <TouchableOpacity
            key={j}
            style={[
              styles.matchItem,
              matched.has(r.idx) && styles.matchDone,
              bad === j && styles.matchBad,
            ]}
            onPress={() => tapRight(j)}
            disabled={matched.has(r.idx)}
          >
            <ThemedText numberOfLines={3}>{r.right}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  instruction: { fontSize: 15, fontWeight: "500", opacity: 0.9 },
  notice: { opacity: 0.7, fontStyle: "italic", paddingVertical: 12 },
  wonCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GREEN,
    padding: 20,
    alignItems: "center",
  },
  muted: { opacity: 0.7 },
  // memory
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  memCard: {
    width: "48%",
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  memCardUp: { backgroundColor: "rgba(127,127,127,0.12)" },
  memCardMatched: { backgroundColor: "rgba(22,163,74,0.15)", borderWidth: 1, borderColor: GREEN },
  memText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  // hangman
  hint: { fontStyle: "italic", opacity: 0.8 },
  hangWord: { fontSize: 26, fontWeight: "800", letterSpacing: 2, textAlign: "center" },
  dead: { color: "#dc2626", textAlign: "center" },
  keyboard: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  key: {
    width: 34,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  keyUsed: { backgroundColor: "rgba(127,127,127,0.2)", opacity: 0.5 },
  keyText: { fontWeight: "700", fontSize: 16 },
  // sort
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
  },
  sortNum: { fontWeight: "800", color: PURPLE, width: 20 },
  sortItem: { flex: 1 },
  sortArrows: { gap: 2 },
  arrow: { fontSize: 16, color: PURPLE },
  arrowOff: { opacity: 0.25 },
  // match
  matchRow: { flexDirection: "row", gap: 10 },
  matchCol: { flex: 1, gap: 8 },
  matchItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    padding: 12,
    minHeight: 56,
    justifyContent: "center",
  },
  matchSelected: { borderColor: PURPLE, backgroundColor: "rgba(109,40,217,0.08)" },
  matchDone: { borderColor: GREEN, backgroundColor: "rgba(22,163,74,0.12)" },
  matchBad: { borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.08)" },
  // shared
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: PURPLE },
  buttonGhostText: { color: PURPLE, fontWeight: "700" },
});
