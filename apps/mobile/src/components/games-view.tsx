import { useCallback, useEffect, useRef, useState } from "react";
import { ScreenHeader } from "@/components/screen-header";
import { Brand } from "@/constants/theme";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { answerGame, getGame, joinGame, type GameState } from "@/lib/me";

const PURPLE = Brand.primary;
const OPTION_COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#22c55e"];

export function GamesView({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gameId, setGameId] = useState<string | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [answeredQ, setAnsweredQ] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleJoin() {
    setError(null);
    if (!code.trim() || !nickname.trim()) {
      setError("Ingresa el código y tu apodo.");
      return;
    }
    setJoining(true);
    try {
      const id = await joinGame(code, nickname);
      setGameId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo unir al juego.");
    } finally {
      setJoining(false);
    }
  }

  const poll = useCallback(async () => {
    if (!gameId) return;
    try {
      setState(await getGame(gameId));
    } catch {
      // mantener
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [gameId, poll]);

  async function pick(optionIndex: number) {
    if (!gameId || !state?.currentQ) return;
    setAnsweredQ(state.currentQ.id);
    try {
      await answerGame(gameId, state.currentQ.id, optionIndex);
      poll();
    } catch {
      setAnsweredQ(null);
    }
  }

  // ── Pantalla de unirse ──────────────────────────────────────────────
  if (!gameId) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScreenHeader title="Unirse a un juego" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.joinScroll}>
          <ThemedText style={styles.muted}>
            Ingresa el código que te compartió tu instructor.
          </ThemedText>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            onChangeText={setCode}
            placeholder="CÓDIGO"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Tu apodo"
            placeholderTextColor="#9ca3af"
            maxLength={30}
          />
          {error && <ThemedText style={styles.error}>{error}</ThemedText>}
          <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={joining}>
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Entrar</ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── En el juego ─────────────────────────────────────────────────────
  const status = state?.game.status;
  const ranked = [...(state?.participants ?? [])].sort((a, b) => b.score - a.score);
  const alreadyAnswered =
    !!state?.myAnswer || (state?.currentQ && answeredQ === state.currentQ.id);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Salir</ThemedText>
        </TouchableOpacity>
        {state?.myNickname ? <ThemedText style={styles.muted}>{state.myNickname}</ThemedText> : null}
      </View>

      {!state ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : status === "waiting" ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Sala de espera</ThemedText>
          <ThemedText style={styles.muted}>Esperando a que el anfitrión inicie…</ThemedText>
          <ThemedText style={styles.section}>Jugadores ({ranked.length})</ThemedText>
          {ranked.map((p) => (
            <ThemedView key={p.id} style={styles.playerRow}>
              <ThemedText>{p.nickname}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      ) : status === "finished" ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Resultados 🏆</ThemedText>
          {ranked.map((p, i) => (
            <ThemedView
              key={p.id}
              style={[styles.playerRow, p.id === state.myParticipantId && styles.meRow]}
            >
              <ThemedText style={styles.rank}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
              </ThemedText>
              <ThemedText style={styles.playerName}>{p.nickname}</ThemedText>
              <ThemedText style={styles.score}>{p.score}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      ) : state.currentQ ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText style={styles.qNum}>
            Pregunta {(state.game.currentQuestion ?? 0) + 1}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.question}>
            {state.currentQ.question}
          </ThemedText>

          {alreadyAnswered ? (
            <ThemedView style={styles.waitCard}>
              <ThemedText type="subtitle">¡Respondido!</ThemedText>
              <ThemedText style={styles.muted}>Espera la siguiente pregunta…</ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.options}>
              {state.currentQ.options.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[styles.option, { backgroundColor: OPTION_COLORS[oi % OPTION_COLORS.length] }]}
                  activeOpacity={0.8}
                  onPress={() => pick(oi)}
                >
                  <ThemedText style={styles.optionText}>{opt}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  muted: { opacity: 0.7 },
  loader: { marginTop: 40 },
  joinScroll: { padding: 16, gap: 14 },
  scroll: { padding: 16, gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  codeInput: { textAlign: "center", fontSize: 24, fontWeight: "800", letterSpacing: 4 },
  error: { color: "#dc2626" },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  section: { fontWeight: "700", marginTop: 8 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
  },
  meRow: { borderColor: PURPLE, backgroundColor: "rgba(109,40,217,0.06)" },
  rank: { fontSize: 18, width: 32 },
  playerName: { flex: 1, fontWeight: "600" },
  score: { fontWeight: "800", color: PURPLE },
  qNum: { opacity: 0.6, fontWeight: "600" },
  question: { fontSize: 20 },
  options: { gap: 12, marginTop: 8 },
  option: { borderRadius: 14, paddingVertical: 22, paddingHorizontal: 16, alignItems: "center" },
  optionText: { color: "#fff", fontWeight: "700", fontSize: 16, textAlign: "center" },
  waitCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 24,
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
});
