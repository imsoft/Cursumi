import { useCallback, useEffect, useState } from "react";
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
  deleteReview,
  getAdminAnalytics,
  getAdminFinances,
  getAdminReviews,
  getAdminStats,
  getAdminUsers,
  getInstructorApplications,
  getQuoteRequests,
  reviewApplication,
  setReviewApproved,
  setUserRole,
  updateQuoteRequest,
  getCoupons,
  createCoupon,
  setCouponActive,
  deleteCoupon,
  getAdminCategories,
  createCategory,
  deleteCategory,
  getKpis,
  createKpi,
  deleteKpi,
  type AdminApplication,
  type AdminReview,
  type AdminUser,
  type QuoteRequest,
  type AdminCoupon,
  type AdminCategory,
  type AdminKpi,
} from "@/lib/me";
import { formatPriceMXN } from "@cursumi/shared";

const PURPLE = Brand.primary;

type Section =
  | "stats"
  | "applications"
  | "users"
  | "reviews"
  | "finances"
  | "analytics"
  | "coupons"
  | "categories"
  | "kpis"
  | "business";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "stats", label: "Resumen" },
  { id: "applications", label: "Solicitudes de instructor" },
  { id: "users", label: "Usuarios" },
  { id: "reviews", label: "Moderar reseñas" },
  { id: "finances", label: "Finanzas" },
  { id: "analytics", label: "Analíticas" },
  { id: "coupons", label: "Cupones" },
  { id: "categories", label: "Categorías" },
  { id: "kpis", label: "KPIs" },
  { id: "business", label: "Empresas" },
];

const SECTION_TITLE: Record<Section, string> = {
  stats: "Resumen",
  applications: "Solicitudes",
  users: "Usuarios",
  reviews: "Moderar reseñas",
  finances: "Finanzas",
  analytics: "Analíticas",
  coupons: "Cupones",
  categories: "Categorías",
  kpis: "KPIs",
  business: "Empresas",
};

export function AdminView({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<Section | null>(null);

  if (section) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => setSection(null)} hitSlop={12}>
            <ThemedText style={styles.back}>‹ Admin</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText type="title" style={styles.heading}>
          {SECTION_TITLE[section]}
        </ThemedText>
        {section === "stats" && <StatsSection />}
        {section === "applications" && <ApplicationsSection />}
        {section === "users" && <UsersSection />}
        {section === "reviews" && <ReviewsSection />}
        {section === "finances" && <FinancesSection />}
        {section === "analytics" && <AnalyticsSection />}
        {section === "coupons" && <CouponsSection />}
        {section === "categories" && <CategoriesSection />}
        {section === "kpis" && <KpisSection />}
        {section === "business" && <BusinessSection />}
      </SafeAreaView>
    );
  }

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
      <ThemedView style={styles.menuCard}>
        {SECTIONS.map((s, i) => (
          <View key={s.id}>
            <TouchableOpacity style={styles.menuRow} onPress={() => setSection(s.id)}>
              <ThemedText style={styles.menuLabel}>{s.label}</ThemedText>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </TouchableOpacity>
            {i < SECTIONS.length - 1 && <View style={styles.menuDivider} />}
          </View>
        ))}
      </ThemedView>
    </SafeAreaView>
  );
}

// ── Resumen ─────────────────────────────────────────────────────────────────
function StatsSection() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAdminStats().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  if (!data) return <ThemedText style={styles.error}>No se pudo cargar.</ThemedText>;
  const cards = [
    { n: data.totalUsers, l: "Usuarios" },
    { n: data.totalCourses, l: "Cursos" },
    { n: data.publishedCourses, l: "Publicados" },
    { n: data.draftCourses, l: "Borradores" },
    { n: data.totalEnrollments, l: "Inscripciones" },
    { n: formatPriceMXN(data.estimatedRevenue), l: "Ingreso estimado" },
  ];
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.grid}>
        {cards.map((c, i) => (
          <ThemedView key={i} style={styles.gridStat}>
            <ThemedText style={styles.statNum}>{c.n}</ThemedText>
            <ThemedText style={styles.statLbl}>{c.l}</ThemedText>
          </ThemedView>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Finanzas ────────────────────────────────────────────────────────────────
function FinancesSection() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminFinances>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAdminFinances().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  if (!data) return <ThemedText style={styles.error}>No se pudo cargar.</ThemedText>;
  const cards = [
    { n: formatPriceMXN(data.totalRevenue ?? 0), l: "Ingresos totales" },
    { n: formatPriceMXN(data.totalPlatformFee ?? 0), l: "Comisión plataforma" },
    { n: formatPriceMXN(data.totalInstructorPayouts ?? 0), l: "Pagos a instructores" },
    { n: formatPriceMXN(data.thisMonthRevenue ?? 0), l: "Este mes" },
  ];
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.grid}>
        {cards.map((c, i) => (
          <ThemedView key={i} style={styles.gridStat}>
            <ThemedText style={styles.statNum}>{c.n}</ThemedText>
            <ThemedText style={styles.statLbl}>{c.l}</ThemedText>
          </ThemedView>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Analíticas ──────────────────────────────────────────────────────────────
function AnalyticsSection() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminAnalytics>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAdminAnalytics().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  if (!data) return <ThemedText style={styles.error}>No se pudo cargar.</ThemedText>;
  const maxRev = Math.max(1, ...data.revenueByMonth.map((m) => m.amount));
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedText style={styles.subhead}>Ingresos por mes</ThemedText>
      {data.revenueByMonth.map((m, i) => (
        <View key={i} style={styles.barRow}>
          <ThemedText style={styles.barLabel}>{m.month}</ThemedText>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.round((m.amount / maxRev) * 100)}%` }]} />
          </View>
          <ThemedText style={styles.barVal}>{formatPriceMXN(m.amount)}</ThemedText>
        </View>
      ))}
      <ThemedText style={[styles.subhead, { marginTop: 12 }]}>Usuarios nuevos por mes</ThemedText>
      {data.usersByMonth.map((m, i) => (
        <View key={i} style={styles.barRow}>
          <ThemedText style={styles.barLabel}>{m.month}</ThemedText>
          <ThemedText style={styles.barVal}>{m.users}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Moderar reseñas ─────────────────────────────────────────────────────────
function ReviewsSection() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setItems(await getAdminReviews(false));
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
      await setReviewApproved(id, true);
      setItems((p) => p.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  }
  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteReview(id);
      setItems((p) => p.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  }
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <FlatList
      data={items}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.scroll}
      ListEmptyComponent={<ThemedText style={styles.empty}>No hay reseñas pendientes.</ThemedText>}
      renderItem={({ item }) => (
        <ThemedView style={styles.card}>
          <ThemedText style={styles.stars}>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</ThemedText>
          <ThemedText style={styles.sub}>
            {item.user?.name ?? "Estudiante"} · {item.course?.title ?? ""}
          </ThemedText>
          {item.comment ? <ThemedText>{item.comment}</ThemedText> : null}
          {busy === item.id ? (
            <ActivityIndicator color={PURPLE} />
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btn} onPress={() => approve(item.id)}>
                <ThemedText style={styles.btnText}>Aprobar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => remove(item.id)}>
                <ThemedText style={styles.btnText}>Eliminar</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      )}
    />
  );
}

// ── Solicitudes de instructor ───────────────────────────────────────────────
function ApplicationsSection() {
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
          {item.headline ? <ThemedText style={styles.bold}>{item.headline}</ThemedText> : null}
          {item.reason ? <ThemedText>{item.reason}</ThemedText> : null}
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
                <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => setRejecting(null)}>
                  <ThemedText style={styles.ghostText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => reject(item.id)}>
                  <ThemedText style={styles.btnText}>Confirmar</ThemedText>
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
              <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => { setRejecting(item.id); setReason(""); }}>
                <ThemedText style={styles.ghostText}>Rechazar</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      )}
    />
  );
}

// ── Usuarios ────────────────────────────────────────────────────────────────
const ROLES: ("student" | "instructor" | "admin")[] = ["student", "instructor", "admin"];
const ROLE_LABEL: Record<string, string> = { student: "Alumno", instructor: "Instructor", admin: "Admin" };
function UsersSection() {
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

// ── Empresas (solicitudes de cotización) ────────────────────────────────────
const QSTATUS: Record<string, string> = { new: "Nueva", contacted: "Contactada", converted: "Convertida", closed: "Cerrada" };
function BusinessSection() {
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
      ListEmptyComponent={<ThemedText style={styles.empty}>No hay solicitudes.</ThemedText>}
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
          {item.companySize ? <ThemedText style={styles.sub}>Tamaño: {item.companySize}</ThemedText> : null}
          {item.interests ? <ThemedText style={styles.sub}>Interés: {item.interests}</ThemedText> : null}
          {item.message ? <ThemedText>{item.message}</ThemedText> : null}
          <View style={styles.actions}>
            {item.status === "new" && (
              <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => mark(item.id, "contacted")}>
                <ThemedText style={styles.ghostText}>Contactada</ThemedText>
              </TouchableOpacity>
            )}
            {item.status !== "closed" && item.status !== "converted" && (
              <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => mark(item.id, "closed")}>
                <ThemedText style={styles.ghostText}>Cerrar</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <ThemedText style={styles.note}>Provisionar: desde la web.</ThemedText>
        </ThemedView>
      )}
    />
  );
}

// ── Cupones ──
function CouponsSection() {
  const [items, setItems] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setItems(await getCoupons());
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);
  async function add() {
    const p = parseInt(pct, 10);
    if (!code.trim() || !Number.isFinite(p)) return setError("Código y % requeridos.");
    setError(null);
    setBusy(true);
    try {
      await createCoupon({ code: code.trim().toUpperCase(), discountPct: Math.min(100, Math.max(1, p)) });
      setCode("");
      setPct("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.bold}>Nuevo cupón</ThemedText>
        <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="CÓDIGO" placeholderTextColor="#9ca3af" autoCapitalize="characters" />
        <TextInput style={styles.input} value={pct} onChangeText={setPct} placeholder="% de descuento" placeholderTextColor="#9ca3af" keyboardType="number-pad" />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <TouchableOpacity style={styles.btn} onPress={add} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.btnText}>Crear cupón</ThemedText>}
        </TouchableOpacity>
      </ThemedView>
      {items.map((c) => (
        <ThemedView key={c.id} style={styles.card}>
          <View style={styles.cardTop}>
            <ThemedText style={styles.name}>{c.code} · {c.discountPct}%</ThemedText>
            <ThemedText style={styles.statusTag}>{c.active ? "Activo" : "Inactivo"}</ThemedText>
          </View>
          <ThemedText style={styles.sub}>
            Usos: {c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ""}
          </ThemedText>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.ghost]}
              onPress={async () => { await setCouponActive(c.id, !c.active); load(); }}
            >
              <ThemedText style={styles.ghostText}>{c.active ? "Desactivar" : "Activar"}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={async () => { await deleteCoupon(c.id); load(); }}>
              <ThemedText style={styles.btnText}>Eliminar</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

// ── Categorías ──
function CategoriesSection() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setItems(await getAdminCategories());
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);
  async function add() {
    if (name.trim().length < 2) return setError("Nombre muy corto.");
    setError(null);
    setBusy(true);
    try {
      await createCategory(name.trim());
      setName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.bold}>Nueva categoría</ThemedText>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor="#9ca3af" />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <TouchableOpacity style={styles.btn} onPress={add} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.btnText}>Crear</ThemedText>}
        </TouchableOpacity>
      </ThemedView>
      {items.map((c) => (
        <ThemedView key={c.id} style={styles.card}>
          <View style={styles.cardTop}>
            <ThemedText style={styles.name}>{c.name}</ThemedText>
            <TouchableOpacity onPress={async () => { await deleteCategory(c.id); load(); }} hitSlop={8}>
              <ThemedText style={{ color: "#dc2626", fontWeight: "600" }}>Eliminar</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.sub}>{c.slug} · {c._count?.courses ?? 0} cursos</ThemedText>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

// ── KPIs ──
function KpisSection() {
  const [items, setItems] = useState<AdminKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setItems(await getKpis());
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);
  async function add() {
    const t = parseFloat(target);
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return setError("Nombre y objetivo (>0) requeridos.");
    setError(null);
    setBusy(true);
    try {
      await createKpi({ name: name.trim(), targetValue: t, unit: unit.trim() || undefined });
      setName("");
      setTarget("");
      setUnit("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <ActivityIndicator style={styles.loader} color={PURPLE} />;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.bold}>Nuevo KPI</ThemedText>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor="#9ca3af" />
        <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="Valor objetivo" placeholderTextColor="#9ca3af" keyboardType="number-pad" />
        <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Unidad (opcional)" placeholderTextColor="#9ca3af" />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <TouchableOpacity style={styles.btn} onPress={add} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.btnText}>Crear KPI</ThemedText>}
        </TouchableOpacity>
      </ThemedView>
      {items.map((k) => {
        const pct = k.targetValue > 0 ? Math.min(100, Math.round((k.currentValue / k.targetValue) * 100)) : 0;
        return (
          <ThemedView key={k.id} style={styles.card}>
            <View style={styles.cardTop}>
              <ThemedText style={styles.name}>{k.name}</ThemedText>
              <TouchableOpacity onPress={async () => { await deleteKpi(k.id); load(); }} hitSlop={8}>
                <ThemedText style={{ color: "#dc2626", fontWeight: "600" }}>Eliminar</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.sub}>
              {k.currentValue} / {k.targetValue} {k.unit ?? ""} ({pct}%)
            </ThemedText>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
          </ThemedView>
        );
      })}
    </ScrollView>
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
  error: { padding: 16, color: "#dc2626" },
  menuCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(127,127,127,0.2)", overflow: "hidden" },
  menuRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  menuLabel: { fontSize: 15, fontWeight: "500" },
  chevron: { fontSize: 22, opacity: 0.4 },
  menuDivider: { height: 1, backgroundColor: "rgba(127,127,127,0.15)", marginLeft: 16 },
  card: { ...CardShadow, borderRadius: 14, borderWidth: 1, borderColor: "rgba(127,127,127,0.2)", padding: 14, gap: 6 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontWeight: "700", fontSize: 15 },
  sub: { opacity: 0.7, fontSize: 13 },
  bold: { fontWeight: "600" },
  stars: { color: "#f59e0b", fontSize: 16 },
  statusTag: { fontSize: 12, color: PURPLE, fontWeight: "700" },
  note: { fontSize: 11, opacity: 0.5, fontStyle: "italic" },
  input: { borderWidth: 1, borderColor: "rgba(127,127,127,0.3)", borderRadius: 10, padding: 10, minHeight: 56, textAlignVertical: "top", color: "#111827", backgroundColor: "#fff" },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },
  btn: { backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnDanger: { backgroundColor: "#dc2626" },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(127,127,127,0.4)" },
  ghostText: { fontWeight: "600", fontSize: 13 },
  roleRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  roleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(127,127,127,0.3)" },
  roleActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  roleText: { fontSize: 13, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridStat: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(127,127,127,0.2)", alignItems: "center", gap: 4 },
  statNum: { fontSize: 22, fontWeight: "800", color: PURPLE },
  statLbl: { fontSize: 12, opacity: 0.7, textAlign: "center" },
  subhead: { fontWeight: "700" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 40, fontSize: 12, opacity: 0.7 },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: "rgba(127,127,127,0.15)", overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5, backgroundColor: PURPLE },
  barVal: { width: 90, fontSize: 12, textAlign: "right" },
});
