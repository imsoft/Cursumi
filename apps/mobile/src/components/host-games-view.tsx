import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/screen-header";
import { Brand, CardShadow} from "@/constants/theme";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  createGame,
  finishGame,
  getGame,
  listMyGames,
  nextGameQuestion,
  startGame,
  type GameState,
  type HostGame,
  type NewGameQuestion,
} from "@/lib/me";

const PURPLE = Brand.primary;
type Screen = { name: "list" } | { name: "create" } | { name: "control"; gameId: string };

export function HostGamesView({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>({ name: "list" });

  if (screen.name === "create") {
    return (
      <CreateGame
        onBack={() => setScreen({ name: "list" })}
        onCreated={(id) => setScreen({ name: "control", gameId: id })}
      />
    );
  }
  if (screen.name === "control") {
    return <ControlGame gameId={screen.gameId} onBack={() => setScreen({ name: "list" })} />;
  }
  return (
    <ListGames
      onBack={onBack}
      onCreate={() => setScreen({ name: "create" })}
      onOpen={(id) => setScreen({ name: "control", gameId: id })}
    />
  );
}

function ListGames({
  onBack,
  onCreate,
  onOpen,
}: {
  onBack: () => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
}) {
  const [games, setGames] = useState<HostGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyGames().then(setGames).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Juegos (anfitrión)" onBack={onBack} />
      <TouchableOpacity style={[styles.button, styles.createBtn]} onPress={onCreate}>
        <ThemedText style={styles.buttonText}>+ Crear juego</ThemedText>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={games}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ThemedText style={styles.empty}>Aún no has creado juegos.</ThemedText>}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => onOpen(item.id)}>
              <ThemedView style={styles.card}>
                <ThemedText type="subtitle">{item.title}</ThemedText>
                <ThemedText style={styles.muted}>
                  Código {item.code} · {item._count?.questions ?? 0} preguntas ·{" "}
                  {item._count?.participants ?? 0} jugadores · {item.status}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function CreateGame({ onBack, onCreated }: { onBack: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<NewGameQuestion[]>([
    { question: "", options: ["", "", "", ""], correct: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setQ(i: number, patch: Partial<NewGameQuestion>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function setOpt(qi: number, oi: number, val: string) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q
      )
    );
  }
  function addQ() {
    setQuestions((qs) => [...qs, { question: "", options: ["", "", "", ""], correct: 0 }]);
  }

  async function submit() {
    setError(null);
    if (!title.trim()) return setError("Ponle un título al juego.");
    const clean = questions
      .map((q) => ({ ...q, question: q.question.trim(), options: q.options.map((o) => o.trim()) }))
      .filter((q) => q.question && q.options.every((o) => o));
    if (clean.length === 0) return setError("Agrega al menos una pregunta con 4 opciones.");
    setSaving(true);
    try {
      const id = await createGame(title.trim(), clean);
      onCreated(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el juego.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Crear juego</ThemedText>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Título del juego"
          placeholderTextColor="#9ca3af"
        />
        {questions.map((q, qi) => (
          <ThemedView key={qi} style={styles.qCard}>
            <ThemedText style={styles.qLabel}>Pregunta {qi + 1}</ThemedText>
            <TextInput
              style={styles.input}
              value={q.question}
              onChangeText={(t) => setQ(qi, { question: t })}
              placeholder="Escribe la pregunta"
              placeholderTextColor="#9ca3af"
            />
            {q.options.map((o, oi) => (
              <View key={oi} style={styles.optRow}>
                <TouchableOpacity
                  style={[styles.radio, q.correct === oi && styles.radioOn]}
                  onPress={() => setQ(qi, { correct: oi })}
                >
                  {q.correct === oi && <ThemedText style={styles.radioDot}>✓</ThemedText>}
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={o}
                  onChangeText={(t) => setOpt(qi, oi, t)}
                  placeholder={`Opción ${oi + 1}`}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            ))}
            <ThemedText style={styles.hint}>Marca ✓ la opción correcta.</ThemedText>
          </ThemedView>
        ))}
        <TouchableOpacity style={[styles.button, styles.ghost]} onPress={addQ}>
          <ThemedText style={styles.ghostText}>+ Agregar pregunta</ThemedText>
        </TouchableOpacity>
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <TouchableOpacity style={styles.button} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Crear juego</ThemedText>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ControlGame({ gameId, onBack }: { gameId: string; onBack: () => void }) {
  const [state, setState] = useState<GameState | null>(null);
  const [busy, setBusy] = useState(false);

  const poll = useCallback(async () => {
    try {
      setState(await getGame(gameId));
    } catch {
      /* */
    }
  }, [gameId]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [poll]);

  async function action(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      await poll();
    } finally {
      setBusy(false);
    }
  }

  const status = state?.game.status;
  const ranked = [...(state?.participants ?? [])].sort((a, b) => b.score - a.score);
  const totalQ = state?.game.questions?.length ?? 0;
  const curIdx = state?.game.currentQuestion ?? 0;
  const isLast = curIdx >= totalQ - 1;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Juegos</ThemedText>
        </TouchableOpacity>
      </View>
      {!state ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {status === "waiting" ? (
            <>
              <ThemedText type="title">Sala de espera</ThemedText>
              <ThemedView style={styles.codeCard}>
                <ThemedText style={styles.muted}>Código para unirse</ThemedText>
                <ThemedText style={styles.code}>{state.game.code}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.section}>Jugadores ({ranked.length})</ThemedText>
              {ranked.map((p) => (
                <ThemedView key={p.id} style={styles.playerRow}>
                  <ThemedText>{p.nickname}</ThemedText>
                </ThemedView>
              ))}
              <TouchableOpacity
                style={[styles.button, ranked.length === 0 && styles.disabled]}
                onPress={() => action(() => startGame(gameId))}
                disabled={busy || ranked.length === 0}
              >
                <ThemedText style={styles.buttonText}>Iniciar juego</ThemedText>
              </TouchableOpacity>
            </>
          ) : status === "finished" ? (
            <>
              <ThemedText type="title">Resultados 🏆</ThemedText>
              {ranked.map((p, i) => (
                <ThemedView key={p.id} style={styles.playerRow}>
                  <ThemedText style={styles.rank}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </ThemedText>
                  <ThemedText style={{ flex: 1 }}>{p.nickname}</ThemedText>
                  <ThemedText style={styles.score}>{p.score}</ThemedText>
                </ThemedView>
              ))}
              <TouchableOpacity style={styles.button} onPress={onBack}>
                <ThemedText style={styles.buttonText}>Listo</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ThemedText style={styles.muted}>
                Pregunta {curIdx + 1} de {totalQ}
              </ThemedText>
              <ThemedText type="subtitle" style={{ marginVertical: 8 }}>
                {state.currentQ?.question}
              </ThemedText>
              <ThemedText style={styles.section}>Marcador</ThemedText>
              {ranked.map((p, i) => (
                <ThemedView key={p.id} style={styles.playerRow}>
                  <ThemedText style={styles.rank}>{i + 1}.</ThemedText>
                  <ThemedText style={{ flex: 1 }}>{p.nickname}</ThemedText>
                  <ThemedText style={styles.score}>{p.score}</ThemedText>
                </ThemedView>
              ))}
              <TouchableOpacity
                style={styles.button}
                onPress={() => action(() => (isLast ? finishGame(gameId) : nextGameQuestion(gameId)))}
                disabled={busy}
              >
                <ThemedText style={styles.buttonText}>
                  {isLast ? "Terminar juego" : "Siguiente pregunta"}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  scroll: { padding: 16, gap: 12 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60 },
  muted: { opacity: 0.7 },
  section: { fontWeight: "700", marginTop: 6 },
  card: { ...CardShadow, borderRadius: 14, borderWidth: 1, borderColor: "rgba(127,127,127,0.2)", padding: 14, gap: 4 },
  createBtn: { marginHorizontal: 16, marginBottom: 8 },
  qCard: { borderRadius: 14, borderWidth: 1, borderColor: "rgba(127,127,127,0.2)", padding: 14, gap: 8 },
  qLabel: { fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  optRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  radioDot: { color: "#fff", fontWeight: "800" },
  hint: { fontSize: 12, opacity: 0.6 },
  codeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PURPLE,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  code: { fontSize: 40, fontWeight: "900", color: PURPLE, letterSpacing: 6 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
  },
  rank: { fontWeight: "800", width: 28 },
  score: { fontWeight: "800", color: PURPLE },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: PURPLE },
  ghostText: { color: PURPLE, fontWeight: "700" },
  error: { color: "#dc2626" },
});
