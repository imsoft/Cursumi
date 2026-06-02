import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AuthScreen } from "@/components/auth-screen";
import { useSession } from "@/lib/auth";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { data: session, isPending } = useSession();

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
