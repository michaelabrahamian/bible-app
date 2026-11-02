import { useAppColorScheme, useAppTheme } from "@/hooks/use-app-theme";
import { GlassView } from "expo-glass-effect";
import { StyleSheet, View } from "react-native";

export function TabBarBackground() {
  const colors = useAppTheme();
  const scheme = useAppColorScheme();
  return (
    <View pointerEvents="none" style={styles.container}>
      <GlassView
        glassEffectStyle="regular"
        colorScheme={scheme}
        tintColor={`${colors.surface}80`}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 30,
    overflow: "hidden",
  },
  fill: { flex: 1, borderRadius: 30 },
});
