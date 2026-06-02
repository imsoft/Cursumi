import { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { signOut, useSession } from "@/lib/auth";

export default function ProfileScreen() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      // El layout detecta la sesión nula y vuelve al login.
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedText type="title" style={styles.heading}>
        Perfil
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">{user?.name ?? "—"}</ThemedText>
        <ThemedText style={styles.email}>{user?.email ?? ""}</ThemedText>
      </ThemedView>

      <TouchableOpacity style={styles.signOut} onPress={handleSignOut} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#dc2626" />
        ) : (
          <ThemedText style={styles.signOutText}>Cerrar sesión</ThemedText>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 6,
  },
  email: { opacity: 0.7 },
  signOut: {
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  signOutText: { color: "#dc2626", fontWeight: "600" },
});
