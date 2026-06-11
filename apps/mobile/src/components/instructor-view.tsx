import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/screen-header";
import { Brand } from "@/constants/theme";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/lib/auth";
import {
  getInstructorAnalytics,
  getInstructorConversations,
  getInstructorCourses,
  getInstructorEarnings,
  getMessages,
  markConversationRead,
  sendMessage,
  setCourseStatus,
  type ChatMessage,
  type InstructorAnalytics,
  type InstructorConversation,
  type InstructorCourse,
  type InstructorEarnings,
} from "@/lib/me";
import { formatPriceMXN } from "@cursumi/shared";

const PURPLE = Brand.primary;
type Tab = "earnings" | "analytics" | "courses" | "messages";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export function InstructorView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("earnings");
  const [openConv, setOpenConv] = useState<InstructorConversation | null>(null);

  if (openConv) {
    return <Thread conversation={openConv} onBack={() => setOpenConv(null)} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Instructor" onBack={onBack} />

      <View style={styles.tabs}>
        {(["earnings", "analytics", "courses", "messages"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <ThemedText style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "earnings"
                ? "Ingresos"
                : t === "analytics"
                  ? "Datos"
                  : t === "courses"
                    ? "Cursos"
                    : "Chats"}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "earnings" && <EarningsTab />}
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "courses" && <CoursesTab />}
      {tab === "messages" && <MessagesTab onOpen={setOpenConv} />}
    </SafeAreaView>
  );
}

function EarningsTab() {
  const [data, setData] = useState<InstructorEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getInstructorEarnings().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  if (!data) return <ThemedText style={styles.error}>No se pudieron cargar tus ingresos.</ThemedText>;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedView style={styles.bigCard}>
        <ThemedText style={styles.muted}>Total generado</ThemedText>
        <ThemedText style={styles.bigNumber}>{formatPriceMXN(data.total ?? 0)}</ThemedText>
      </ThemedView>
      <View style={styles.statsRow}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{formatPriceMXN(data.thisMonth ?? 0)}</ThemedText>
          <ThemedText style={styles.statLabel}>Este mes</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{data.courses ?? 0}</ThemedText>
          <ThemedText style={styles.statLabel}>Cursos</ThemedText>
        </ThemedView>
      </View>
    </ScrollView>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getInstructorAnalytics().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  if (!data) return <ThemedText style={styles.error}>No se pudieron cargar las analíticas.</ThemedText>;
  const cards = [
    { n: data.totalStudents, l: "Estudiantes" },
    { n: data.totalCourses, l: "Cursos" },
    { n: data.publishedCourses, l: "Publicados" },
    { n: `${data.avgProgress}%`, l: "Avance prom." },
  ];
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.gridStats}>
        {cards.map((c, i) => (
          <ThemedView key={i} style={styles.gridStat}>
            <ThemedText style={styles.statNumber}>{c.n}</ThemedText>
            <ThemedText style={styles.statLabel}>{c.l}</ThemedText>
          </ThemedView>
        ))}
      </View>
    </ScrollView>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCourses(await getInstructorCourses());
    } catch {
      setError("No se pudieron cargar tus cursos.");
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function change(courseId: string, status: "draft" | "published" | "archived") {
    setBusy(courseId);
    setError(null);
    try {
      await setCourseStatus(courseId, status);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;

  return (
    <FlatList
      data={courses}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.scroll}
      ListHeaderComponent={
        error ? <ThemedText style={styles.error}>{error}</ThemedText> : null
      }
      ListEmptyComponent={
        <ThemedText style={styles.empty}>Aún no tienes cursos. Créalos desde la web.</ThemedText>
      }
      renderItem={({ item }) => (
        <ThemedView style={styles.courseCard}>
          <View style={styles.courseTop}>
            <ThemedText type="subtitle" numberOfLines={2} style={{ flex: 1 }}>
              {item.title}
            </ThemedText>
            <View
              style={[
                styles.badge,
                item.status === "published"
                  ? styles.badgePub
                  : item.status === "archived"
                    ? styles.badgeArch
                    : styles.badgeDraft,
              ]}
            >
              <ThemedText style={styles.badgeText}>{STATUS_LABEL[item.status] ?? item.status}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.courseMeta}>
            {item.studentsCount ?? 0} estudiantes
            {typeof item.price === "number" ? ` · ${formatPriceMXN(item.price)}` : ""}
          </ThemedText>
          <View style={styles.courseActions}>
            {busy === item.id ? (
              <ActivityIndicator color={PURPLE} />
            ) : item.status === "draft" || item.status === "archived" ? (
              <TouchableOpacity style={styles.actBtn} onPress={() => change(item.id, "published")}>
                <ThemedText style={styles.actText}>Publicar</ThemedText>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actBtn, styles.actGhost]}
                  onPress={() => change(item.id, "draft")}
                >
                  <ThemedText style={styles.actGhostText}>Despublicar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actBtn, styles.actGhost]}
                  onPress={() => change(item.id, "archived")}
                >
                  <ThemedText style={styles.actGhostText}>Archivar</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ThemedView>
      )}
    />
  );
}

function MessagesTab({ onOpen }: { onOpen: (c: InstructorConversation) => void }) {
  const [items, setItems] = useState<InstructorConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getInstructorConversations()
      .then(setItems)
      .catch(() => setError("No se pudieron cargar los mensajes."))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <FlatList
      data={items}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.scroll}
      ListEmptyComponent={
        <ThemedText style={styles.empty}>{error ?? "No tienes conversaciones."}</ThemedText>
      }
      renderItem={({ item }) => {
        const last = item.messages?.[item.messages.length - 1];
        return (
          <TouchableOpacity activeOpacity={0.7} onPress={() => onOpen(item)}>
            <ThemedView style={styles.convCard}>
              <ThemedText style={styles.convName}>{item.student?.name ?? "Estudiante"}</ThemedText>
              <ThemedText style={styles.convCourse} numberOfLines={1}>
                {item.course?.title ?? ""}
              </ThemedText>
              {last ? (
                <ThemedText style={styles.convLast} numberOfLines={1}>
                  {last.body}
                </ThemedText>
              ) : null}
            </ThemedView>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// ── Hilo de conversación (instructor responde) ──────────────────────────────
function Thread({
  conversation,
  onBack,
}: {
  conversation: InstructorConversation;
  onBack: () => void;
}) {
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMessages(await getMessages(conversation.id));
    } catch {
      // mantener
    }
  }, [conversation.id]);

  useEffect(() => {
    refresh();
    markConversationRead(conversation.id).catch(() => {});
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [conversation.id, refresh]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    setSending(true);
    try {
      const msg = await sendMessage(conversation.id, body);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setText(body);
    } finally {
      setSending(false);
    }
  }

  const reversed = [...messages].reverse();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Mensajes</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.threadName}>{conversation.student?.name ?? "Estudiante"}</ThemedText>
        <View style={{ width: 60 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={reversed}
          keyExtractor={(m) => m.id}
          inverted
          contentContainerStyle={styles.threadList}
          renderItem={({ item }) => {
            const mine = item.senderId === myId;
            return (
              <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowOther]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <ThemedText style={[styles.bubbleText, mine && { color: "#fff" }]}>
                    {item.body}
                  </ThemedText>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Responder…"
            placeholderTextColor="#9ca3af"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendDisabled]}
            onPress={send}
            disabled={!text.trim() || sending}
          >
            {sending ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.sendText}>Enviar</ThemedText>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600", width: 80 },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 40 },
  error: { padding: 16, color: "#dc2626" },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  scroll: { padding: 16, gap: 12, flexGrow: 1 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(127,127,127,0.12)" },
  tabActive: { backgroundColor: PURPLE },
  tabText: { fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  bigCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  bigNumber: { fontSize: 34, fontWeight: "900", color: PURPLE },
  muted: { opacity: 0.7 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    alignItems: "center",
    gap: 4,
  },
  gridStats: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridStat: {
    width: "47%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    alignItems: "center",
    gap: 4,
  },
  statNumber: { fontSize: 22, fontWeight: "800", color: PURPLE },
  statLabel: { fontSize: 12, opacity: 0.7, textAlign: "center" },
  convCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 14,
    gap: 2,
  },
  convName: { fontWeight: "700" },
  convCourse: { fontSize: 12, opacity: 0.6 },
  convLast: { opacity: 0.8, marginTop: 2 },
  // courses
  courseCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 14,
    gap: 8,
  },
  courseTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  courseMeta: { fontSize: 13, opacity: 0.7 },
  courseActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  badgePub: { backgroundColor: "#16a34a" },
  badgeDraft: { backgroundColor: "#9ca3af" },
  badgeArch: { backgroundColor: "#6b7280" },
  actBtn: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  actGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(127,127,127,0.4)" },
  actGhostText: { fontWeight: "600", fontSize: 13 },
  // thread
  threadName: { fontWeight: "700", fontSize: 15 },
  threadList: { padding: 16, gap: 8, flexGrow: 1 },
  bubbleRow: { flexDirection: "row" },
  rowMine: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  bubble: { maxWidth: "80%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: PURPLE, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: "rgba(127,127,127,0.15)", borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(127,127,127,0.2)",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 110,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  sendBtn: { backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11, justifyContent: "center" },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "700" },
});
