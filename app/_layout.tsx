import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { BibleProvider, useBible } from "@/contexts/bible-context";
import { ThemedView } from "@/components/themed-view";
import { useAppColorScheme, useAppTheme } from "@/hooks/use-app-theme";
import {
  AppearanceProvider,
  useAppearance,
} from "@/contexts/appearance-context";
import { ActivityIndicator } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <BibleProvider>
        <ReaderNavigation />
      </BibleProvider>
    </AppearanceProvider>
  );
}

function ReaderNavigation() {
  const colorScheme = useAppColorScheme();
  const { isReady: appearanceReady } = useAppearance();
  const colors = useAppTheme();
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const { isReady } = useBible();

  if (!isReady || !appearanceReady) {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator
          color={colors.tint}
          accessibilityLabel="Loading reading preferences"
        />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          primary: colors.tint,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
        },
      }}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen name="reader" options={{ title: "Bible Reader" }} />
        <Stack.Screen
          name="licences"
          options={{ title: "Text sources & licences" }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
