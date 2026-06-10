import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AuthScreen } from "@/components/auth-screen";
import { useSession } from "@/lib/auth";
import { syncPushToken } from "@/lib/push";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { data: session, isPending } = useSession();

  // Al haber sesión, registra el token de push del dispositivo (idempotente).
  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) void syncPushToken();
  }, [userId]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {isPending ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : session ? (
        <>
          <AnimatedSplashOverlay />
          <AppTabs />
        </>
      ) : (
        <AuthScreen />
      )}
    </ThemeProvider>
  );
}
