import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CertificatesView } from "@/components/certificates-view";
import { NotificationsView } from "@/components/notifications-view";
import { WishlistView } from "@/components/wishlist-view";
import { SettingsView } from "@/components/settings-view";
import { ReferralView } from "@/components/referral-view";
import { NotesView } from "@/components/notes-view";
import { BlogView } from "@/components/blog-view";
import { BecomeInstructorView } from "@/components/become-instructor-view";
import { OrgMaterialsView } from "@/components/org-materials-view";
import { GamesView } from "@/components/games-view";
import { InstructorView } from "@/components/instructor-view";
import { AdminView } from "@/components/admin-view";
import { InstructorAccountView } from "@/components/instructor-account-view";
import { BusinessView } from "@/components/business-view";
import * as ImagePicker from "expo-image-picker";
import { signOut, useSession } from "@/lib/auth";
import { getMyProfile, updateMyProfile, uploadAvatar, type MyProfile } from "@/lib/me";

type ProfileMenu =
  | "certificates"
  | "notifications"
  | "wishlist"
  | "settings"
  | "referral"
  | "notes"
  | "blog"
  | "becomeInstructor"
  | "orgMaterials"
  | "games"
  | "instructor"
  | "admin"
  | "business"
  | "instructorAccount";

const PURPLE = "#6d28d9";

function initials(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<ProfileMenu | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Borrador de edición
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch {
      setError("No se pudo cargar tu perfil.");
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  function startEdit() {
    if (!profile) return;
    setFullName(profile.fullName);
    setPhone(profile.phone);
    setCity(profile.city);
    setStateName(profile.state);
    setBio(profile.bio);
    setWebsite(profile.website);
    setLinkedinUrl(profile.linkedinUrl);
    setInstagramUrl(profile.instagramUrl);
    setError(null);
    setEditing(true);
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await updateMyProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        state: stateName.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
      });
      await load();
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function pickAvatar() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(result.assets[0].uri);
      await load();
    } catch {
      setError("No se pudo actualizar la foto.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  const name = profile?.fullName ?? session?.user?.name ?? "Usuario";
  const email = profile?.email ?? session?.user?.email ?? "";

  if (menu === "certificates") {
    return <CertificatesView onBack={() => setMenu(null)} />;
  }
  if (menu === "notifications") {
    return <NotificationsView onBack={() => setMenu(null)} />;
  }
  if (menu === "wishlist") {
    return <WishlistView onBack={() => setMenu(null)} />;
  }
  if (menu === "settings") {
    return <SettingsView onBack={() => setMenu(null)} />;
  }
  if (menu === "referral") {
    return <ReferralView onBack={() => setMenu(null)} />;
  }
  if (menu === "notes") {
    return <NotesView onBack={() => setMenu(null)} />;
  }
  if (menu === "blog") {
    return <BlogView onBack={() => setMenu(null)} />;
  }
  if (menu === "becomeInstructor") {
    return <BecomeInstructorView onBack={() => setMenu(null)} />;
  }
  if (menu === "orgMaterials") {
    return <OrgMaterialsView onBack={() => setMenu(null)} />;
  }
  if (menu === "games") {
    return <GamesView onBack={() => setMenu(null)} />;
  }
  if (menu === "instructor") {
    return <InstructorView onBack={() => setMenu(null)} />;
  }
  if (menu === "admin") {
    return <AdminView onBack={() => setMenu(null)} />;
  }
  if (menu === "business") {
    return <BusinessView onBack={() => setMenu(null)} />;
  }
  if (menu === "instructorAccount") {
    return <InstructorAccountView onBack={() => setMenu(null)} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.heading}>
          Perfil
        </ThemedText>

        {/* Cabecera: avatar + nombre */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <ThemedText style={styles.avatarInitials}>{initials(name)}</ThemedText>
              </View>
            )}
            <View style={styles.avatarEdit}>
              {uploadingAvatar ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.avatarEditText}>✎</ThemedText>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">{name}</ThemedText>
            <ThemedText style={styles.muted}>{email}</ThemedText>
          </View>
        </View>

        {loading && <ActivityIndicator style={styles.loader} color={PURPLE} />}

        {!loading && profile && (
          <>
            {/* Estadísticas */}
            <View style={styles.statsRow}>
              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{profile.coursesInProgress}</ThemedText>
                <ThemedText style={styles.statLabel}>En progreso</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{profile.coursesCompleted}</ThemedText>
                <ThemedText style={styles.statLabel}>Completados</ThemedText>
              </ThemedView>
            </View>

            {error && <ThemedText style={styles.error}>{error}</ThemedText>}

            {editing ? (
              <ThemedView style={styles.card}>
                <Field label="Nombre completo" value={fullName} onChangeText={setFullName} />
                <Field label="Teléfono" value={phone} onChangeText={setPhone} />
                <Field label="Ciudad" value={city} onChangeText={setCity} />
                <Field label="Estado" value={stateName} onChangeText={setStateName} />
                <Field label="Bio" value={bio} onChangeText={setBio} multiline />
                <Field label="Sitio web" value={website} onChangeText={setWebsite} />
                <Field label="LinkedIn (URL)" value={linkedinUrl} onChangeText={setLinkedinUrl} />
                <Field label="Instagram (URL)" value={instagramUrl} onChangeText={setInstagramUrl} />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonGhost]}
                    onPress={() => setEditing(false)}
                    disabled={saving}
                  >
                    <ThemedText style={styles.buttonGhostText}>Cancelar</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Guardar</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </ThemedView>
            ) : (
              <ThemedView style={styles.card}>
                <Detail label="Teléfono" value={profile.phone} />
                <Detail
                  label="Ubicación"
                  value={[profile.city, profile.state].filter(Boolean).join(", ")}
                />
                <Detail label="Bio" value={profile.bio} />
                <TouchableOpacity style={styles.button} onPress={startEdit}>
                  <ThemedText style={styles.buttonText}>Editar perfil</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </>
        )}

        {/* Menú: accesos a sub-pantallas */}
        <ThemedView style={styles.menuCard}>
          {(profile?.role === "instructor" || profile?.role === "admin") && (
            <>
              <MenuRow label="Panel de instructor" onPress={() => setMenu("instructor")} />
              <View style={styles.menuDivider} />
              <MenuRow label="Perfil de instructor" onPress={() => setMenu("instructorAccount")} />
              <View style={styles.menuDivider} />
            </>
          )}
          {profile?.role === "admin" && (
            <>
              <MenuRow label="Administración" onPress={() => setMenu("admin")} />
              <View style={styles.menuDivider} />
            </>
          )}
          <MenuRow label="Certificados" onPress={() => setMenu("certificates")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Notificaciones" onPress={() => setMenu("notifications")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Mis notas" onPress={() => setMenu("notes")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Juegos" onPress={() => setMenu("games")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Lista de deseos" onPress={() => setMenu("wishlist")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Referidos" onPress={() => setMenu("referral")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Blog" onPress={() => setMenu("blog")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Conviértete en instructor" onPress={() => setMenu("becomeInstructor")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Para empresas" onPress={() => setMenu("business")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Materiales de empresa" onPress={() => setMenu("orgMaterials")} />
          <View style={styles.menuDivider} />
          <MenuRow label="Configuración" onPress={() => setMenu("settings")} />
        </ThemedView>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut} disabled={signingOut}>
          {signingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <ThemedText style={styles.signOutText}>Cerrar sesión</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value || "—"}</ThemedText>
    </View>
  );
}

function MenuRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.6}>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      <ThemedText style={styles.menuChevron}>›</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  heading: { paddingTop: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(127,127,127,0.1)" },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 22, fontWeight: "700" },
  avatarEdit: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarEditText: { color: "#fff", fontSize: 12 },
  headerText: { flex: 1, gap: 2 },
  muted: { opacity: 0.7 },
  error: { color: "#dc2626" },
  loader: { marginTop: 20 },
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
  statNumber: { fontSize: 26, fontWeight: "800", color: PURPLE },
  statLabel: { fontSize: 13, opacity: 0.7 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 12,
  },
  detailRow: { gap: 2 },
  detailLabel: { fontSize: 12, opacity: 0.6 },
  detailValue: { fontSize: 15 },
  field: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
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
  inputMultiline: { minHeight: 72, textAlignVertical: "top" },
  editActions: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(127,127,127,0.4)" },
  buttonGhostText: { fontWeight: "600" },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuLabel: { fontSize: 15, fontWeight: "500" },
  menuChevron: { fontSize: 22, opacity: 0.4 },
  menuDivider: { height: 1, backgroundColor: "rgba(127,127,127,0.15)", marginLeft: 16 },
  signOut: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dc2626",
    marginTop: 4,
  },
  signOutText: { color: "#dc2626", fontWeight: "600" },
});
