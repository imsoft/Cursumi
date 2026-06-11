import { type ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { Brand, BrandGradient } from "@/constants/theme";

/**
 * Cabecera de marca reutilizable para las sub-pantallas (vistas con `onBack`).
 * Renderiza un banner con gradiente de marca + botón "‹ Atrás" y título en blanco,
 * para mantener el mismo look & feel que las pantallas de tab principales y la web.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Acción opcional a la derecha (p. ej. "Marcar todas"). */
  right?: ReactNode;
}) {
  return (
    <LinearGradient
      colors={BrandGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      {(onBack || right) && (
        <View style={styles.row}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} hitSlop={12}>
              <ThemedText style={styles.back}>‹ Atrás</ThemedText>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {right ?? null}
        </View>
      )}
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 24,
  },
  back: { color: Brand.onBrand, fontSize: 16, fontWeight: "600" },
  title: { color: Brand.onBrand, fontWeight: "800" },
  subtitle: { color: Brand.onBrand, opacity: 0.85, fontSize: 14 },
});
