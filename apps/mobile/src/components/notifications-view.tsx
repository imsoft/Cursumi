import { useCallback, useEffect, useState } from "react";
import { Brand, CardShadow} from "@/constants/theme";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/me";

const PURPLE = Brand.primary;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function NotificationsView({
  onBack,
  onUnreadChange,
}: {
  onBack: () => void;
  onUnreadChange?: (count: number) => void;
}) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { notifications, unreadCount } = await getNotifications();
      setItems(notifications);
      onUnreadChange?.(unreadCount);
    } catch {
      setError("No se pudieron cargar las notificaciones.");
    }
  }, [onUnreadChange]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function handlePress(n: Notification) {
    if (n.read) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    onUnreadChange?.(Math.max(0, items.filter((x) => !x.read).length - 1));
    await markNotificationRead(n.id);
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    onUnreadChange?.(0);
    await markAllNotificationsRead();
  }

  const hasUnread = items.some((x) => !x.read);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAll} hitSlop={12}>
            <ThemedText style={styles.markAll}>Marcar todas</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      <ThemedText type="title" style={styles.heading}>
        Notificaciones
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              {error ?? "No tienes notificaciones."}
            </ThemedText>
          }
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => handlePress(item)}>
              <ThemedView style={[styles.card, !item.read && styles.cardUnread]}>
                <View style={styles.cardHeader}>
                  {!item.read && <View style={styles.dot} />}
                  <ThemedText style={styles.title} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.time}>{timeAgo(item.createdAt)}</ThemedText>
                </View>
                <ThemedText style={styles.body} numberOfLines={3}>
                  {item.body}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
        />
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
  markAll: { color: PURPLE, fontSize: 14, fontWeight: "600" },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  card: { ...CardShadow,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 4,
  },
  cardUnread: { borderColor: PURPLE, backgroundColor: "rgba(109,40,217,0.06)" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PURPLE },
  title: { flex: 1, fontWeight: "700" },
  time: { fontSize: 11, opacity: 0.5 },
  body: { opacity: 0.8, fontSize: 14 },
});
