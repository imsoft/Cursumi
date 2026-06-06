import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  getAdminUsers,
  getInstructorApplications,
  getQuoteRequests,
  reviewApplication,
  setUserRole,
  updateQuoteRequest,
  type AdminApplication,
  type AdminUser,
  type QuoteRequest,
} from "@/lib/me";

const PURPLE = "#6d28d9";
type Tab = "applications" | "users" | "business";

export function AdminView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("applications");
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="title" style={styles.heading}>
        Administración
      </ThemedText>
      <View style={styles.tabs}>
        {(["applications", "users", "business"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <ThemedText style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "applications" ? "Solicitudes" : t === "users" ? "Usuarios" : "Empresas"}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "applications" && <ApplicationsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "business" && <BusinessTab />}
    </SafeAreaView>
  );
}

function ApplicationsTab() {
  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      setApps(await getInstructorApplications());
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function approve(id: string) {
    setBusy(id);
    try {
      await reviewApplication(id, "approve");
      setApps((p) => p.filter((a) => a.id !== id));
    } finally {
      setBusy(null);
    }
  }
  async function reject(id: string) {
    if (!reason.trim()) return;
    setBusy(id);
    try {
      await reviewApplication(id, "reject", reason.trim());
      setApps((p) => p.filter((a) => a.id !== id));
      setRejecting(null);
      setReason("");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <FlatList
      data={apps}
      keyExtractor={(a) => a.id}
      contentContainerStyle={styles.scroll}
      ListEmptyComponent={<ThemedText style={styles.empty}>No hay solicitudes pendientes.</ThemedText>}
      renderItem={({ item }) => (
        <ThemedView style={styles.card}>
          <ThemedText style={styles.name}>{item.user?.name ?? "—"}</ThemedText>
          <ThemedText style={styles.sub}>{item.user?.email}</ThemedText>
          {item.headline ? <ThemedText style={styles.headline}>{item.headline}</ThemedText> : null}
          {item.reason ? <ThemedText style={styles.reason}>{item.reason}</ThemedText> : null}
          {rejecting === item.id ? (
            <View style={{ gap: 8 }}>
              <TextInput
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="Motivo del rechazo"
                placeholderTextColor="#9ca3af"
                multiline
              />
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setRejecting(null)}>
                  <ThemedText style={styles.btnGhostText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => reject(item.id)}>
                  <ThemedText style={styles.btnText}>Confirmar rechazo</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : busy === item.id ? (
            <ActivityIndicator color={PURPLE} />
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btn} onPress={() => approve(item.id)}>
                <ThemedText style={styles.btnText}>Aprobar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => {
                  setRejecting(item.id);
                  setReason("");
                }}
              >
                <ThemedText style={styles.btnGhostText}>Rechazar</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      )}
    />
  );
}

const ROLES: ("student" | "instructor" | "admin")[] = ["student", "instructor", "admin"];
const ROLE_LABEL: Record<string, string> = { student: "Alumno", instructor: "Instructor", admin: "Admin" };

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await getAdminUsers());
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function change(id: string, role: "student" | "instructor" | "admin") {
    setBusy(id);
    try {
      await setUserRole(id, role);
      setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <FlatList
      data={users}
      keyExtractor={(u) => u.id}
      contentContainerStyle={styles.scroll}
      ListEmptyComponent={<ThemedText style={styles.empty}>Sin usuarios.</ThemedText>}
      renderItem={({ item }) => (
        <ThemedView style={styles.card}>
          <ThemedText style={styles.name}>{item.name ?? "—"}</ThemedText>
          <ThemedText style={styles.sub}>{item.email}</ThemedText>
          {busy === item.id ? (
            <ActivityIndicator color={PURPLE} />
          ) : (
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, item.role === r && styles.roleActive]}
                  onPress={() => item.role !== r && change(item.id, r)}
                  disabled={item.role === r}
                >
                  <ThemedText style={[styles.roleText, item.role === r && styles.roleTextActive]}>
                    {ROLE_LABEL[r]}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ThemedView>
      )}
    />
  );
}

const QSTATUS: Record<string, string> = {
  new: "Nueva",
  contacted: "Contactada",
  converted: "Convertida",
  closed: "Cerrada",
};

function BusinessTab() {
  const [reqs, setReqs] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setReqs(await getQuoteRequests());
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function mark(id: string, status: "contacted" | "closed") {
    setReqs((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    await updateQuoteRequest(id, status);
  }

  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <FlatList
      data={reqs}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.scroll}
      ListEmptyComponent={<ThemedText style={styles.empty}>No hay solicitudes de cotización.</ThemedText>}
      renderItem={({ item }) => (
        <ThemedView style={styles.card}>
          <View style={styles.cardTop}>
            <ThemedText style={styles.name}>{item.companyName}</ThemedText>
            <ThemedText style={styles.statusTag}>{QSTATUS[item.status] ?? item.status}</ThemedText>
          </View>
          <ThemedText style={styles.sub}>
            {item.contactName} · {item.contactEmail}
            {item.contactPhone ? ` · ${item.contactPhone}` : ""}
          </ThemedText>
          {item.companySize ? <ThemedText style={styles.detail}>Tamaño: {item.companySize}</ThemedText> : null}
          {item.interests ? <ThemedText style={styles.detail}>Interés: {item.interests}</ThemedText> : null}
          {item.message ? <ThemedText style={styles.detail}>{item.message}</ThemedText> : null}
          <View style={styles.actions}>
            {item.status === "new" && (
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => mark(item.id, "contacted")}>
                <ThemedText style={styles.btnGhostText}>Marcar contactada</ThemedText>
              </TouchableOpacity>
            )}
            {item.status !== "closed" && item.status !== "converted" && (
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => mark(item.id, "closed")}>
                <ThemedText style={styles.btnGhostText}>Cerrar</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <ThemedText style={styles.note}>Provisionar empresa: desde la web.</ThemedText>
        </ThemedView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 40 },
  scroll: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(127,127,127,0.12)" },
  tabActive: { backgroundColor: PURPLE },
  tabText: { fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 14,
    gap: 6,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontWeight: "700", fontSize: 15 },
  sub: { opacity: 0.7, fontSize: 13 },
  headline: { fontWeight: "600" },
  reason: { opacity: 0.85 },
  detail: { opacity: 0.8, fontSize: 13 },
  statusTag: { fontSize: 12, color: PURPLE, fontWeight: "700" },
  note: { fontSize: 11, opacity: 0.5, fontStyle: "italic", marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    color: "#111827",
    backgroundColor: "#fff",
  },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },
  btn: { backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(127,127,127,0.4)" },
  btnGhostText: { fontWeight: "600", fontSize: 13 },
  btnDanger: { backgroundColor: "#dc2626" },
  roleRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
  },
  roleActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  roleText: { fontSize: 13, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
});
