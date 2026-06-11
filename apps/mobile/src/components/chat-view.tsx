import { useCallback, useEffect, useRef, useState } from "react";
import { Brand } from "@/constants/theme";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useSession } from "@/lib/auth";
import {
  getConversation,
  getMessages,
  markConversationRead,
  sendMessage,
  type ChatMessage,
} from "@/lib/me";

const PURPLE = Brand.primary;

export function ChatView({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const { data: session } = useSession();
  const myId = session?.user?.id;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // Carga inicial: conversación + mensajes + marcar leída.
  useEffect(() => {
    let active = true;
    getConversation(courseId)
      .then((c) => {
        if (!active) return;
        setConversationId(c.id);
        setMessages(c.messages);
        markConversationRead(c.id).catch(() => {});
      })
      .catch(() => active && setError("No se pudo abrir el chat."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [courseId]);

  // Polling cada 5s.
  const refresh = useCallback(async () => {
    if (!conversationId) return;
    try {
      const m = await getMessages(conversationId);
      setMessages(m);
    } catch {
      // mantener lo que hay
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [conversationId, refresh]);

  async function send() {
    const body = text.trim();
    if (!body || !conversationId) return;
    setText("");
    setSending(true);
    try {
      const msg = await sendMessage(conversationId, body);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setText(body); // restaurar para reintentar
    } finally {
      setSending(false);
    }
  }

  // Inverted: mostramos del más nuevo al más viejo.
  const reversed = [...messages].reverse();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Mensajes</ThemedText>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            data={reversed}
            keyExtractor={(m) => m.id}
            inverted
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText style={styles.empty}>
                Escríbele a tu instructor. Te responderá por aquí.
              </ThemedText>
            }
            renderItem={({ item }) => {
              const mine = item.senderId === myId;
              return (
                <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    {!mine && (
                      <ThemedText style={styles.sender}>{item.sender?.name ?? "Instructor"}</ThemedText>
                    )}
                    <ThemedText style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
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
              placeholder="Escribe un mensaje…"
              placeholderTextColor="#9ca3af"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendDisabled]}
              onPress={send}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.sendText}>Enviar</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
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
  back: { color: PURPLE, fontSize: 16, fontWeight: "600", width: 50 },
  title: { fontWeight: "700", fontSize: 16 },
  loader: { marginTop: 40 },
  error: { padding: 16, color: "#dc2626" },
  list: { padding: 16, gap: 8, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.6, paddingVertical: 40, transform: [{ scaleY: -1 }] },
  bubbleRow: { flexDirection: "row" },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "80%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: PURPLE, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: "rgba(127,127,127,0.15)",
    borderBottomLeftRadius: 4,
  },
  sender: { fontSize: 11, opacity: 0.7, marginBottom: 2, fontWeight: "600" },
  bubbleText: { fontSize: 15 },
  bubbleTextMine: { color: "#fff" },
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
  sendBtn: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "700" },
});
