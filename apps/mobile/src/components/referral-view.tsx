import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getReferral, type Referral } from "@/lib/me";

const PURPLE = "#6d28d9";

export function ReferralView({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getReferral()
      .then((d) => active && setData(d))
      .catch(() => active && setError("No se pudo cargar tu programa de referidos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function share() {
    if (!data?.referralLink) return;
    try {
      await Share.share({
        message: `Únete a Cursumi con mi enlace: ${data.referralLink}`,
      });
    } catch {
      // usuario canceló
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="title" style={styles.heading}>
        Referidos
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : error || !data ? (
        <ThemedText style={styles.error}>{error ?? "Sin datos."}</ThemedText>
      ) : (
        <View style={styles.body}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.muted}>Tu código</ThemedText>
            <ThemedText style={styles.code}>{data.referralCode ?? "—"}</ThemedText>
            <ThemedText style={styles.link} numberOfLines={1}>
              {data.referralLink}
            </ThemedText>
            <TouchableOpacity style={styles.button} onPress={share}>
              <ThemedText style={styles.buttonText}>Compartir enlace</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <View style={styles.statsRow}>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{data.totalReferrals}</ThemedText>
              <ThemedText style={styles.statLabel}>Referidos</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{data.earnedReferrals}</ThemedText>
              <ThemedText style={styles.statLabel}>Con recompensa</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>
                {(data.totalEarnedCents / 100).toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  maximumFractionDigits: 0,
                })}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Ganado</ThemedText>
            </ThemedView>
          </View>

          <ThemedText style={styles.note}>
            Comparte tu enlace. Cuando alguien se registre y compre con él, recibes
            una recompensa.
          </ThemedText>
        </View>
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
  error: { padding: 16, color: "#dc2626" },
  body: { padding: 16, gap: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 20,
    gap: 8,
    alignItems: "center",
  },
  muted: { opacity: 0.7, fontSize: 13 },
  code: { fontSize: 28, fontWeight: "800", color: PURPLE, letterSpacing: 2 },
  link: { opacity: 0.7, fontSize: 13 },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    alignItems: "center",
    gap: 2,
  },
  statNumber: { fontSize: 20, fontWeight: "800", color: PURPLE },
  statLabel: { fontSize: 11, opacity: 0.7, textAlign: "center" },
  note: { opacity: 0.7, fontSize: 13, textAlign: "center" },
});
