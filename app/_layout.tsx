import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { BibleProvider, useBible } from "@/contexts/bible-context";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ActivityIndicator } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <BibleProvider>
      <ReaderNavigation />
    </BibleProvider>
  );
}

function ReaderNavigation() {
  const colorScheme = useColorScheme();
  const { isReady } = useBible();

  if (!isReady) {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator accessibilityLabel="Loading reading preferences" />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen name="reader" options={{ title: "Bible Reader" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
